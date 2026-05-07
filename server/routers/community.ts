/**
 * Community deck library — publish and browse player decks.
 *
 * Includes deck publishing, comments, likes, win-rate tracking, and gamertag
 * management. Auth is still client-trusted by playerId (see audit-findings.md
 * item 6 for the token-verification pattern from user.purge that should be
 * extended here when needed).
 */
import { z } from "zod";
import {
  addDeckComment,
  batchDeckWinRates,
  deleteDeckComment,
  getCommunityDeck,
  getDeckCommentCounts,
  getDeckWinRate,
  getPlayerCommunityDecks,
  getPlayerDeckHistory,
  getPlayerGamertag,
  getPlayerLikedDeckIds,
  isGamertagTaken,
  listCommunityDecks,
  listDeckComments,
  logDeckMatchResult,
  publishCommunityDeck,
  setPlayerGamertag,
  toggleCommunityLike,
  unpublishCommunityDeck,
} from "../db-supabase";
import { validateGamertag } from "../profanityFilter";
import { publicProcedure, router } from "../_core/trpc";

const gamertagSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_-]+$/, "Gamertag must be alphanumeric with underscores/hyphens");

export const communityRouter = router({
  list: publicProcedure
    .input(
      z.object({
        faction: z.string().max(32).optional(),
        sortBy: z.enum(["newest", "likes"]).default("newest"),
        page: z.number().int().positive().default(1),
        limit: z.number().int().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => listCommunityDecks(input)),

  get: publicProcedure
    .input(z.object({ deckId: z.number().int().positive() }))
    .query(async ({ input }) => getCommunityDeck(input.deckId)),

  publish: publicProcedure
    .input(
      z.object({
        playerId: z.string().min(1).max(64),
        gamertag: gamertagSchema,
        deckName: z
          .string()
          .min(1)
          .max(100)
          .transform((s) => s.replace(/[<>"'&]/g, "")),
        faction: z.string().min(1).max(32),
        cardIds: z.string().min(2),
        strategy: z
          .string()
          .max(500)
          .default("")
          .transform((s) => s.replace(/[<>"']/g, "")),
      })
    )
    .mutation(async ({ input }) => {
      let parsed: string[];
      try {
        parsed = JSON.parse(input.cardIds);
      } catch {
        throw new Error("cardIds must be a valid JSON array");
      }
      if (!Array.isArray(parsed) || parsed.length !== 30) {
        throw new Error("Deck must contain exactly 30 cards");
      }

      const currentTag = await getPlayerGamertag(input.playerId);
      if (!currentTag || currentTag !== input.gamertag) {
        const taken = await isGamertagTaken(input.gamertag, input.playerId);
        if (taken) throw new Error("Gamertag is already taken by another player");
        await setPlayerGamertag(input.playerId, input.gamertag);
      }

      return publishCommunityDeck(input);
    }),

  unpublish: publicProcedure
    .input(
      z.object({
        deckId: z.number().int().positive(),
        playerId: z.string().min(1).max(64),
      })
    )
    .mutation(async ({ input }) => unpublishCommunityDeck(input.deckId, input.playerId)),

  toggleLike: publicProcedure
    .input(
      z.object({
        deckId: z.number().int().positive(),
        playerId: z.string().min(1).max(64),
      })
    )
    .mutation(async ({ input }) => toggleCommunityLike(input.deckId, input.playerId)),

  likedDeckIds: publicProcedure
    .input(z.object({ playerId: z.string().min(1).max(64) }))
    .query(async ({ input }) => getPlayerLikedDeckIds(input.playerId)),

  comments: publicProcedure
    .input(
      z.object({
        deckId: z.number().int().positive(),
        limit: z.number().int().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => listDeckComments(input.deckId, input.limit)),

  addComment: publicProcedure
    .input(
      z.object({
        deckId: z.number().int().positive(),
        playerId: z.string().min(1).max(64),
        gamertag: z.string().min(3).max(30),
        content: z
          .string()
          .min(1)
          .max(500)
          .transform((s) => s.replace(/[<>"']/g, "")),
        parentId: z.number().int().positive().nullish(),
      })
    )
    .mutation(async ({ input }) =>
      addDeckComment({ ...input, parentId: input.parentId ?? null })
    ),

  deleteComment: publicProcedure
    .input(
      z.object({
        commentId: z.number().int().positive(),
        playerId: z.string().min(1).max(64),
      })
    )
    .mutation(async ({ input }) => deleteDeckComment(input.commentId, input.playerId)),

  commentCounts: publicProcedure
    .input(z.object({ deckIds: z.array(z.number().int().positive()).max(50) }))
    .query(async ({ input }) => getDeckCommentCounts(input.deckIds)),

  getGamertag: publicProcedure
    .input(z.object({ playerId: z.string().min(1).max(64) }))
    .query(async ({ input }) => ({ gamertag: await getPlayerGamertag(input.playerId) })),

  checkGamertag: publicProcedure
    .input(
      z.object({
        gamertag: gamertagSchema,
        excludePlayerId: z.string().max(64).optional(),
      })
    )
    .query(async ({ input }) => {
      const taken = await isGamertagTaken(input.gamertag, input.excludePlayerId);
      return { available: !taken };
    }),

  updateGamertag: publicProcedure
    .input(
      z.object({
        playerId: z.string().min(1).max(64),
        newGamertag: z.string().min(3).max(24),
      })
    )
    .mutation(async ({ input }) => {
      const filterResult = validateGamertag(input.newGamertag);
      if (!filterResult.ok) {
        return { success: false as const, reason: filterResult.reason! };
      }
      const taken = await isGamertagTaken(input.newGamertag, input.playerId);
      if (taken) {
        return { success: false as const, reason: "That gamertag is already taken." };
      }
      const ok = await setPlayerGamertag(input.playerId, input.newGamertag);
      if (!ok) {
        return { success: false as const, reason: "Failed to update. Please try again." };
      }
      return { success: true as const, gamertag: input.newGamertag };
    }),

  myDecks: publicProcedure
    .input(z.object({ playerId: z.string().min(1).max(64) }))
    .query(async ({ input }) => getPlayerCommunityDecks(input.playerId)),

  logMatch: publicProcedure
    .input(
      z.object({
        deckId: z.number().int().positive(),
        playerId: z.string().min(1).max(64),
        result: z.enum(["win", "loss"]),
        opponentFaction: z.string().min(1).max(30),
      })
    )
    .mutation(async ({ input }) => logDeckMatchResult(input)),

  winRate: publicProcedure
    .input(z.object({ deckId: z.number().int().positive() }))
    .query(async ({ input }) => getDeckWinRate(input.deckId)),

  batchWinRates: publicProcedure
    .input(z.object({ deckIds: z.array(z.number().int().positive()).max(50) }))
    .query(async ({ input }) => batchDeckWinRates(input.deckIds)),

  matchHistory: publicProcedure
    .input(
      z.object({
        deckId: z.number().int().positive(),
        playerId: z.string().min(1).max(64),
        limit: z.number().int().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) =>
      getPlayerDeckHistory(input.deckId, input.playerId, input.limit)
    ),
});
