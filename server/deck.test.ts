/**
 * Deck CRUD Integration Tests
 *
 * Tests the full deck lifecycle: create → read → update → delete
 * against the actual Supabase database via the tRPC router.
 *
 * These tests use a unique test user ID to avoid collisions.
 */

import { describe, expect, it, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Use a unique test user ID to avoid collisions with real data
const TEST_USER_ID = `test_vitest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const TEST_FACTION = "wrath";

// Generate 30 valid wrath card IDs for a test deck
const TEST_CARD_IDS = Array.from({ length: 30 }, (_, i) => `wrath_${String(i + 1).padStart(2, "0")}`);
const TEST_CARD_IDS_JSON = JSON.stringify(TEST_CARD_IDS);

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

let createdDeckId: number | null = null;

describe("deck CRUD", () => {
  const caller = appRouter.createCaller(createPublicContext());

  it("creates a new deck with 30 cards", async () => {
    const result = await caller.deck.create({
      supabaseUserId: TEST_USER_ID,
      faction: TEST_FACTION,
      name: "Test Burn Deck",
      cardIds: TEST_CARD_IDS_JSON,
      isActive: 0,
    });

    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    createdDeckId = result.id;
  });

  it("lists decks for the test user", async () => {
    const decks = await caller.deck.list({ supabaseUserId: TEST_USER_ID });

    expect(Array.isArray(decks)).toBe(true);
    expect(decks.length).toBeGreaterThanOrEqual(1);

    const ourDeck = decks.find((d) => d.id === createdDeckId);
    expect(ourDeck).toBeDefined();
    expect(ourDeck!.name).toBe("Test Burn Deck");
    expect(ourDeck!.faction).toBe(TEST_FACTION);
    expect(ourDeck!.supabaseUserId).toBe(TEST_USER_ID);

    // Verify cardIds round-trip
    const parsedIds = JSON.parse(ourDeck!.cardIds);
    expect(parsedIds).toEqual(TEST_CARD_IDS);
    expect(parsedIds.length).toBe(30);
  });

  it("retrieves a single deck by ID", async () => {
    expect(createdDeckId).not.toBeNull();

    const deck = await caller.deck.get({ deckId: createdDeckId! });

    expect(deck).toBeDefined();
    expect(deck!.id).toBe(createdDeckId);
    expect(deck!.name).toBe("Test Burn Deck");
    expect(deck!.faction).toBe(TEST_FACTION);
  });

  it("updates the deck name and cards", async () => {
    expect(createdDeckId).not.toBeNull();

    // Modify the deck — change name and shuffle card order
    const updatedCards = [...TEST_CARD_IDS].reverse();
    const result = await caller.deck.update({
      deckId: createdDeckId!,
      supabaseUserId: TEST_USER_ID,
      name: "Updated Burn Deck",
      cardIds: JSON.stringify(updatedCards),
    });

    expect(result).toBe(true);

    // Verify the update persisted
    const deck = await caller.deck.get({ deckId: createdDeckId! });
    expect(deck!.name).toBe("Updated Burn Deck");
    expect(JSON.parse(deck!.cardIds)).toEqual(updatedCards);
  });

  it("rejects update from wrong user", async () => {
    expect(createdDeckId).not.toBeNull();

    await expect(
      caller.deck.update({
        deckId: createdDeckId!,
        supabaseUserId: "wrong_user_id",
        name: "Hacked Deck",
      })
    ).rejects.toThrow("Deck not found or access denied");
  });

  it("rejects deck with wrong card count", async () => {
    const tooFewCards = TEST_CARD_IDS.slice(0, 10);

    await expect(
      caller.deck.create({
        supabaseUserId: TEST_USER_ID,
        faction: TEST_FACTION,
        name: "Bad Deck",
        cardIds: JSON.stringify(tooFewCards),
      })
    ).rejects.toThrow("Deck must contain exactly 30 cards");
  });

  it("rejects deck with invalid JSON", async () => {
    await expect(
      caller.deck.create({
        supabaseUserId: TEST_USER_ID,
        faction: TEST_FACTION,
        name: "Bad Deck",
        cardIds: "not-json",
      })
    ).rejects.toThrow("cardIds must be a valid JSON array");
  });

  it("sets a deck as active", async () => {
    expect(createdDeckId).not.toBeNull();

    const result = await caller.deck.setActive({
      supabaseUserId: TEST_USER_ID,
      faction: TEST_FACTION,
      deckId: createdDeckId!,
    });

    expect(result).toBe(true);

    // Verify the deck is now active
    const deck = await caller.deck.get({ deckId: createdDeckId! });
    expect(deck!.isActive).toBe(1);
  });

  it("deletes the deck", async () => {
    expect(createdDeckId).not.toBeNull();

    const result = await caller.deck.delete({
      deckId: createdDeckId!,
      supabaseUserId: TEST_USER_ID,
    });

    expect(result).toBe(true);

    // Verify it's gone — getDeckById returns undefined, router maps to null
    const deck = await caller.deck.get({ deckId: createdDeckId! });
    expect(deck).toBeFalsy();
  });

  it("rejects delete from wrong user", async () => {
    // Create a fresh deck to test delete rejection
    const { id } = await caller.deck.create({
      supabaseUserId: TEST_USER_ID,
      faction: TEST_FACTION,
      name: "Temp Deck",
      cardIds: TEST_CARD_IDS_JSON,
    });

    await expect(
      caller.deck.delete({
        deckId: id,
        supabaseUserId: "wrong_user_id",
      })
    ).rejects.toThrow("Deck not found or access denied");

    // Clean up
    await caller.deck.delete({ deckId: id, supabaseUserId: TEST_USER_ID });
  });

  // Cleanup: ensure no test data remains
  afterAll(async () => {
    try {
      const decks = await caller.deck.list({ supabaseUserId: TEST_USER_ID });
      for (const d of decks) {
        await caller.deck.delete({ deckId: d.id, supabaseUserId: TEST_USER_ID });
      }
    } catch {
      // Best-effort cleanup
    }
  });
});
