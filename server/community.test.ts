/**
 * Community Deck Library Integration Tests — v5.8.0
 *
 * Tests the community deck lifecycle:
 *   gamertag → publish → list → toggle-like → comments → unpublish
 *
 * NOTE: community_decks.player_id is a UUID with FK to players.id.
 * We create temporary test players in beforeAll and clean up in afterAll.
 */
import { describe, expect, it, afterAll, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { createClient } from "@supabase/supabase-js";

const TEST_GAMERTAG = `TestPlayer_${Math.random().toString(36).slice(2, 8)}`;
const SECOND_GAMERTAG = `TestBlade_${Math.random().toString(36).slice(2, 8)}`;
const TEST_FACTION = "wrath";
const TEST_CARD_IDS = Array.from({ length: 30 }, (_, i) => `wrath_${String(i + 1).padStart(2, "0")}`);
const TEST_CARD_IDS_JSON = JSON.stringify(TEST_CARD_IDS);

let TEST_PLAYER_ID: string;
let SECOND_PLAYER_ID: string;

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

  // Create test players before running tests
  beforeAll(async () => {
    const sb = getSupabase();
    const { data: p1, error: e1 } = await sb
      .from("players")
      .insert({ username: "CommunityTestPlayer_" + Date.now() })
      .select("id")
      .single();
    if (e1 || !p1) throw new Error("Failed to create test player 1: " + e1?.message);
    TEST_PLAYER_ID = p1.id;

    const { data: p2, error: e2 } = await sb
      .from("players")
      .insert({ username: "CommunityTestPlayer2_" + Date.now() })
      .select("id")
      .single();
    if (e2 || !p2) throw new Error("Failed to create test player 2: " + e2?.message);
    SECOND_PLAYER_ID = p2.id;
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
        cardIds: JSON.stringify(["wrath_01", "wrath_02"]),
        strategy: "",
      })
    ).rejects.toThrow(/30 cards/);
  });

  it("rejects invalid gamertag format", async () => {
    await expect(
      caller.community.publish({
        playerId: TEST_PLAYER_ID,
        gamertag: "ab",
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
    const found = result.decks.find((d: any) => d.id === publishedDeckId);
    if (found) {
      expect(found.gamertag).toBe(TEST_GAMERTAG);
      expect(found.faction).toBe(TEST_FACTION);
    }
  });

  it("lists community decks filtered by faction", async () => {
    const result = await caller.community.list({ faction: TEST_FACTION });
    expect(result.decks.every((d: any) => d.faction === TEST_FACTION)).toBe(true);
  });

  it("lists community decks sorted by likes", async () => {
    const result = await caller.community.list({ sortBy: "likes" });
    expect(result.decks).toBeDefined();
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
    expect(decks.some((d: any) => d.id === publishedDeckId)).toBe(true);
  });

  // ─── Toggle Like (per-player rate-limiting) ──────────────

  it("likes a community deck (first toggle = like)", async () => {
    if (!publishedDeckId) return;
    const result = await caller.community.toggleLike({
      deckId: publishedDeckId,
      playerId: TEST_PLAYER_ID,
    });
    expect(result.liked).toBe(true);
    expect(result.newCount).toBeGreaterThanOrEqual(1);
  });

  it("returns liked deck IDs for the player", async () => {
    const ids = await caller.community.likedDeckIds({ playerId: TEST_PLAYER_ID });
    expect(ids).toContain(publishedDeckId);
  });

  it("unlikes a community deck (second toggle = unlike)", async () => {
    if (!publishedDeckId) return;
    const result = await caller.community.toggleLike({
      deckId: publishedDeckId,
      playerId: TEST_PLAYER_ID,
    });
    expect(result.liked).toBe(false);
    expect(result.newCount).toBeGreaterThanOrEqual(0);
  });

  it("no longer shows deck in liked IDs after unlike", async () => {
    const ids = await caller.community.likedDeckIds({ playerId: TEST_PLAYER_ID });
    expect(ids).not.toContain(publishedDeckId);
  });

  it("allows a second player to like the same deck independently", async () => {
    if (!publishedDeckId) return;
    const result = await caller.community.toggleLike({
      deckId: publishedDeckId,
      playerId: SECOND_PLAYER_ID,
    });
    expect(result.liked).toBe(true);
    expect(result.newCount).toBeGreaterThanOrEqual(1);

    // Verify independence: player 1 hasn't liked, player 2 has
    const p1Ids = await caller.community.likedDeckIds({ playerId: TEST_PLAYER_ID });
    const p2Ids = await caller.community.likedDeckIds({ playerId: SECOND_PLAYER_ID });
    expect(p1Ids).not.toContain(publishedDeckId);
    expect(p2Ids).toContain(publishedDeckId);
  });

  // ─── Comments ────────────────────────────────────────────

  let testCommentId: number;

  it("adds a comment to a community deck", async () => {
    if (!publishedDeckId) return;
    const comment = await caller.community.addComment({
      deckId: publishedDeckId,
      playerId: TEST_PLAYER_ID,
      gamertag: TEST_GAMERTAG,
      content: "Great deck! Love the burn strategy.",
    });
    expect(comment).toBeDefined();
    expect(comment!.content).toBe("Great deck! Love the burn strategy.");
    expect(comment!.gamertag).toBe(TEST_GAMERTAG);
    testCommentId = comment!.id;
  });

  it("adds a second comment from another player", async () => {
    if (!publishedDeckId) return;
    const comment = await caller.community.addComment({
      deckId: publishedDeckId,
      playerId: SECOND_PLAYER_ID,
      gamertag: SECOND_GAMERTAG,
      content: "I would swap card 5 for more defense.",
    });
    expect(comment).toBeDefined();
    expect(comment!.gamertag).toBe(SECOND_GAMERTAG);
  });

  it("lists comments for a deck (newest first)", async () => {
    if (!publishedDeckId) return;
    const comments = await caller.community.comments({ deckId: publishedDeckId });
    expect(comments.length).toBeGreaterThanOrEqual(2);
    if (comments.length >= 2) {
      const d0 = new Date(comments[0].createdAt).getTime();
      const d1 = new Date(comments[1].createdAt).getTime();
      expect(d0).toBeGreaterThanOrEqual(d1);
    }
  });

  it("gets comment counts for multiple decks (batch)", async () => {
    if (!publishedDeckId) return;
    const counts = await caller.community.commentCounts({
      deckIds: [publishedDeckId],
    });
    expect(counts[publishedDeckId]).toBeGreaterThanOrEqual(2);
  });

  it("cannot delete another player's comment", async () => {
    if (!testCommentId) return;
    await caller.community.deleteComment({
      commentId: testCommentId,
      playerId: SECOND_PLAYER_ID,
    });
    // Verify comment still exists
    const comments = await caller.community.comments({ deckId: publishedDeckId! });
    expect(comments.some((c: any) => c.id === testCommentId)).toBe(true);
  });

  it("deletes own comment", async () => {
    if (!testCommentId) return;
    const result = await caller.community.deleteComment({
      commentId: testCommentId,
      playerId: TEST_PLAYER_ID,
    });
    expect(result).toBe(true);
    const comments = await caller.community.comments({ deckId: publishedDeckId! });
    expect(comments.some((c: any) => c.id === testCommentId)).toBe(false);
  });

  it("rejects comment with content exceeding 500 chars", async () => {
    if (!publishedDeckId) return;
    await expect(
      caller.community.addComment({
        deckId: publishedDeckId,
        playerId: TEST_PLAYER_ID,
        gamertag: TEST_GAMERTAG,
        content: "x".repeat(501),
      })
    ).rejects.toThrow();
  });

  // ─── Unpublish ───────────────────────────────────────────

  it("cannot unpublish another player's deck", async () => {
    if (!publishedDeckId) return;
    await caller.community.unpublish({
      deckId: publishedDeckId,
      playerId: SECOND_PLAYER_ID,
    });
    const deck = await caller.community.get({ deckId: publishedDeckId });
    expect(deck).not.toBeNull();
  });

  it("unpublishes own community deck", async () => {
    if (!publishedDeckId) return;
    const result = await caller.community.unpublish({
      deckId: publishedDeckId,
      playerId: TEST_PLAYER_ID,
    });
    expect(result).toBe(true);
    const deck = await caller.community.get({ deckId: publishedDeckId });
    expect(deck).toBeNull();
  });

  // ─── Cleanup ─────────────────────────────────────────────
  afterAll(async () => {
    const sb = getSupabase();
    try {
      await sb.from("community_likes").delete().eq("player_id", TEST_PLAYER_ID);
      await sb.from("community_likes").delete().eq("player_id", SECOND_PLAYER_ID);
      await sb.from("community_comments").delete().eq("player_id", TEST_PLAYER_ID);
      await sb.from("community_comments").delete().eq("player_id", SECOND_PLAYER_ID);
      await sb.from("community_decks").delete().eq("player_id", TEST_PLAYER_ID);
      await sb.from("community_decks").delete().eq("player_id", SECOND_PLAYER_ID);
      await sb.from("players").delete().eq("id", TEST_PLAYER_ID);
      await sb.from("players").delete().eq("id", SECOND_PLAYER_ID);
    } catch { /* best effort */ }
  });
});
