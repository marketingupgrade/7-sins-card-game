/**
 * Community Deck Library Integration Tests
 *
 * Tests the community deck lifecycle: gamertag management → publish → list → like → unpublish
 * against the actual Supabase database via the tRPC router.
 *
 * NOTE: community_decks.player_id is a UUID with a foreign key to players.id.
 * We create a temporary test player in beforeAll and clean up in afterAll.
 */
import { describe, expect, it, afterAll, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { createClient } from "@supabase/supabase-js";

const TEST_GAMERTAG = `TestPlayer_${Math.random().toString(36).slice(2, 8)}`;
const TEST_FACTION = "wrath";
const TEST_CARD_IDS = Array.from({ length: 30 }, (_, i) => `wrath_${String(i + 1).padStart(2, "0")}`);
const TEST_CARD_IDS_JSON = JSON.stringify(TEST_CARD_IDS);

let TEST_PLAYER_ID: string;

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

function getSupabase() {
  return createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

let publishedDeckId: number | null = null;

describe("community deck library", () => {
  const caller = appRouter.createCaller(createPublicContext());

  // Create a test player in the players table before running tests
  beforeAll(async () => {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("players")
      .insert({ username: "CommunityTestPlayer_" + Date.now() })
      .select("id")
      .single();
    if (error || !data) throw new Error("Failed to create test player: " + error?.message);
    TEST_PLAYER_ID = data.id;
  });

  // ─── Gamertag Management ─────────────────────────────────

  it("returns null gamertag for a new player", async () => {
    const result = await caller.community.getGamertag({ playerId: TEST_PLAYER_ID });
    expect(result.gamertag).toBeNull();
  });

  it("checks gamertag availability for an unused name", async () => {
    const result = await caller.community.checkGamertag({ gamertag: TEST_GAMERTAG });
    expect(result.available).toBe(true);
  });

  // ─── Publish ─────────────────────────────────────────────

  it("publishes a deck to the community library", async () => {
    const result = await caller.community.publish({
      playerId: TEST_PLAYER_ID,
      gamertag: TEST_GAMERTAG,
      deckName: "Test Community Deck",
      faction: TEST_FACTION,
      cardIds: TEST_CARD_IDS_JSON,
      strategy: "Aggressive burn strategy focusing on early damage.",
    });
    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    publishedDeckId = result.id;
  });

  it("rejects a deck with wrong card count", async () => {
    await expect(
      caller.community.publish({
        playerId: TEST_PLAYER_ID,
        gamertag: TEST_GAMERTAG,
        deckName: "Bad Deck",
        faction: TEST_FACTION,
        cardIds: JSON.stringify(["wrath_01", "wrath_02"]), // Only 2 cards
        strategy: "",
      })
    ).rejects.toThrow(/30 cards/);
  });

  it("rejects invalid gamertag format", async () => {
    await expect(
      caller.community.publish({
        playerId: TEST_PLAYER_ID,
        gamertag: "ab", // Too short
        deckName: "Test",
        faction: TEST_FACTION,
        cardIds: TEST_CARD_IDS_JSON,
        strategy: "",
      })
    ).rejects.toThrow();
  });

  // ─── List & Get ──────────────────────────────────────────

  it("lists community decks and includes the published deck", async () => {
    const result = await caller.community.list({});
    expect(result.decks).toBeDefined();
    expect(result.total).toBeGreaterThanOrEqual(1);
    const found = result.decks.find((d) => d.id === publishedDeckId);
    if (found) {
      expect(found.gamertag).toBe(TEST_GAMERTAG);
      expect(found.faction).toBe(TEST_FACTION);
    }
  });

  it("lists community decks filtered by faction", async () => {
    const result = await caller.community.list({ faction: TEST_FACTION });
    expect(result.decks.every((d) => d.faction === TEST_FACTION)).toBe(true);
  });

  it("lists community decks sorted by likes", async () => {
    const result = await caller.community.list({ sortBy: "likes" });
    expect(result.decks).toBeDefined();
    // Verify descending order of likes
    for (let i = 1; i < result.decks.length; i++) {
      expect(result.decks[i - 1].likes).toBeGreaterThanOrEqual(result.decks[i].likes);
    }
  });

  it("gets a single community deck by ID", async () => {
    if (!publishedDeckId) return;
    const deck = await caller.community.get({ deckId: publishedDeckId });
    expect(deck).toBeDefined();
    expect(deck!.deckName).toBe("Test Community Deck");
    expect(deck!.gamertag).toBe(TEST_GAMERTAG);
    expect(deck!.strategy).toBe("Aggressive burn strategy focusing on early damage.");
  });

  it("gets player's published decks", async () => {
    const decks = await caller.community.myDecks({ playerId: TEST_PLAYER_ID });
    expect(decks.length).toBeGreaterThanOrEqual(1);
    expect(decks.some((d) => d.id === publishedDeckId)).toBe(true);
  });

  // ─── Like ────────────────────────────────────────────────

  it("likes a community deck", async () => {
    if (!publishedDeckId) return;
    const result = await caller.community.like({ deckId: publishedDeckId });
    expect(result).toBe(true);

    // Verify like count increased
    const deck = await caller.community.get({ deckId: publishedDeckId });
    expect(deck!.likes).toBeGreaterThanOrEqual(1);
  });

  // ─── Unpublish ───────────────────────────────────────────

  it("cannot unpublish another player's deck (wrong player ID)", async () => {
    if (!publishedDeckId) return;
    // Create a second test player
    const sb = getSupabase();
    const { data: otherPlayer } = await sb
      .from("players")
      .insert({ username: "OtherTestPlayer_" + Date.now() })
      .select("id")
      .single();

    if (otherPlayer) {
      // Try to unpublish with the other player's ID — should not delete
      await caller.community.unpublish({
        deckId: publishedDeckId,
        playerId: otherPlayer.id,
      });

      // Verify the deck still exists
      const deck = await caller.community.get({ deckId: publishedDeckId });
      expect(deck).not.toBeNull();

      // Clean up the other player
      await sb.from("players").delete().eq("id", otherPlayer.id);
    }
  });

  it("unpublishes a community deck", async () => {
    if (!publishedDeckId) return;
    const result = await caller.community.unpublish({
      deckId: publishedDeckId,
      playerId: TEST_PLAYER_ID,
    });
    expect(result).toBe(true);

    // Verify it's gone
    const deck = await caller.community.get({ deckId: publishedDeckId });
    expect(deck).toBeNull();
  });

  // ─── Cleanup ─────────────────────────────────────────────
  afterAll(async () => {
    const sb = getSupabase();
    // Clean up any remaining test decks
    try {
      await sb.from("community_decks").delete().eq("player_id", TEST_PLAYER_ID);
    } catch { /* best effort */ }
    // Clean up the test player
    try {
      await sb.from("players").delete().eq("id", TEST_PLAYER_ID);
    } catch { /* best effort */ }
  });
});
