/**
 * Player Profile Integration Tests — v5.9.0
 *
 * Tests the player profile system:
 *   byGamertag → get profile → decks → matchHistory
 *
 * Uses the same Supabase test player pattern as community.test.ts.
 * Creates a temporary player, publishes a deck, logs a match, then
 * verifies all profile endpoints return correct data.
 */
import { describe, expect, it, afterAll, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { createClient } from "@supabase/supabase-js";

const TEST_GAMERTAG = `Profile_${Math.random().toString(36).slice(2, 8)}`;
const TEST_FACTION = "envy";
const TEST_CARD_IDS = Array.from({ length: 30 }, (_, i) => `envy_${String(i + 1).padStart(2, "0")}`);
const TEST_CARD_IDS_JSON = JSON.stringify(TEST_CARD_IDS);

let TEST_PLAYER_ID: string;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      get: () => undefined,
    } as any,
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as any,
  };
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const caller = appRouter.createCaller(createPublicContext());

// ─── Setup: create test player, gamertag, deck, and match ───
beforeAll(async () => {
  // Create test player
  const { data: player } = await supabase
    .from("players")
    .insert({ username: `profile_test_${Date.now()}` })
    .select("id")
    .single();
  TEST_PLAYER_ID = player!.id;

  // Set gamertag
  await supabase
    .from("players")
    .update({ gamertag: TEST_GAMERTAG })
    .eq("id", TEST_PLAYER_ID);

  // Publish a deck
  await supabase.from("community_decks").insert({
    player_id: TEST_PLAYER_ID,
    gamertag: TEST_GAMERTAG,
    deck_name: "Profile Test Deck",
    faction: TEST_FACTION,
    card_ids: TEST_CARD_IDS_JSON,
    strategy: "Testing profile endpoints",
    likes: 3,
  });

  // Log a match result
  const { data: deck } = await supabase
    .from("community_decks")
    .select("id")
    .eq("player_id", TEST_PLAYER_ID)
    .single();

  if (deck) {
    await supabase.from("deck_match_results").insert({
      deck_id: deck.id,
      player_id: TEST_PLAYER_ID,
      result: "win",
      opponent_faction: "wrath",
    });
  }
}, 15000);

// ─── Cleanup ────────────────────────────────────────────────
afterAll(async () => {
  // Clean up in reverse dependency order
  const { data: decks } = await supabase
    .from("community_decks")
    .select("id")
    .eq("player_id", TEST_PLAYER_ID);

  if (decks) {
    const deckIds = decks.map((d) => d.id);
    if (deckIds.length > 0) {
      await supabase.from("deck_match_results").delete().in("deck_id", deckIds);
      await supabase.from("community_likes").delete().in("deck_id", deckIds);
      await supabase.from("community_comments").delete().in("deck_id", deckIds);
    }
  }
  await supabase.from("community_decks").delete().eq("player_id", TEST_PLAYER_ID);
  await supabase.from("players").delete().eq("id", TEST_PLAYER_ID);
}, 10000);

// ─── Tests ──────────────────────────────────────────────────
describe("Player Profile", () => {
  it("should look up a player by gamertag", async () => {
    const result = await caller.profile.byGamertag({ gamertag: TEST_GAMERTAG });
    expect(result).toBeTruthy();
    expect(result!.id).toBe(TEST_PLAYER_ID);
    expect(result!.gamertag).toBe(TEST_GAMERTAG);
  });

  it("should return null for non-existent gamertag", async () => {
    const result = await caller.profile.byGamertag({ gamertag: "NonExistentPlayer_xyz123" });
    expect(result).toBeNull();
  });

  it("should get player profile with stats", async () => {
    const profile = await caller.profile.get({ playerId: TEST_PLAYER_ID });
    expect(profile).toBeTruthy();
    expect(profile!.playerId).toBe(TEST_PLAYER_ID);
    expect(profile!.gamertag).toBe(TEST_GAMERTAG);
    expect(profile!.decksPublished).toBeGreaterThanOrEqual(1);
    expect(profile!.totalLikesReceived).toBeGreaterThanOrEqual(3);
    expect(profile!.matchesPlayed).toBeGreaterThanOrEqual(1);
    expect(profile!.matchesWon).toBeGreaterThanOrEqual(1);
    expect(typeof profile!.overallWinRate).toBe("number");
  });

  it("should return null profile for non-existent player", async () => {
    const profile = await caller.profile.get({ playerId: "00000000-0000-0000-0000-000000000000" });
    expect(profile).toBeNull();
  });

  it("should get player's published decks", async () => {
    const decks = await caller.profile.decks({ playerId: TEST_PLAYER_ID });
    expect(Array.isArray(decks)).toBe(true);
    expect(decks.length).toBeGreaterThanOrEqual(1);
    expect(decks[0].deckName).toBe("Profile Test Deck");
    expect(decks[0].faction).toBe(TEST_FACTION);
    expect(decks[0].gamertag).toBe(TEST_GAMERTAG);
  });

  it("should return empty array for player with no decks", async () => {
    const decks = await caller.profile.decks({ playerId: "00000000-0000-0000-0000-000000000000" });
    expect(Array.isArray(decks)).toBe(true);
    expect(decks.length).toBe(0);
  });

  it("should get player match history", async () => {
    const history = await caller.profile.matchHistory({ playerId: TEST_PLAYER_ID });
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThanOrEqual(1);
    expect(history[0].result).toBe("win");
    expect(history[0].opponentFaction).toBe("wrath");
    // Match history should include deck name and faction
    expect(history[0].deckName).toBeTruthy();
    expect(history[0].faction).toBeTruthy();
  });

  it("should return empty match history for player with no matches", async () => {
    const history = await caller.profile.matchHistory({ playerId: "00000000-0000-0000-0000-000000000000" });
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBe(0);
  });

  it("should respect match history limit parameter", async () => {
    const history = await caller.profile.matchHistory({ playerId: TEST_PLAYER_ID, limit: 1 });
    expect(history.length).toBeLessThanOrEqual(1);
  });
});
