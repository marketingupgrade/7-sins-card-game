/**
 * tRPC Router Definitions for 7 Deadly Sins Card Game
 *
 * Exposes game operations as type-safe RPC endpoints.
 * All game procedures use publicProcedure since on Vercel
 * we don't have Manus OAuth. Players are identified by
 * a client-generated playerId passed in the request.
 *
 * Discussion router provides CRUD for threaded comments
 * on the Balance Analysis and other pages.
 */

import { COOKIE_NAME } from "../shared/const";
import { SinType } from "../shared/gameTypes";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  chooseSin,
  createGame,
  getGameLog,
  getGameState,
  joinGame,
  passTurn,
  playCard,
  consumeCard,
  startGame,
} from "./gameEngine";
import {
  getDiscussionComments,
  createDiscussionComment,
  deleteDiscussionComment,
  upvoteDiscussionComment,
  getDecksByUser,
  getDeckById,
  createDeck,
  updateDeck,
  deleteDeck,
  setActiveDeck,
  deleteAllUserData,
  getPlayerGamertag,
  setPlayerGamertag,
  isGamertagTaken,
  publishCommunityDeck,
  listCommunityDecks,
  getCommunityDeck,
  unpublishCommunityDeck,
  toggleCommunityLike,
  getPlayerLikedDeckIds,
  getPlayerCommunityDecks,
  listDeckComments,
  addDeckComment,
  deleteDeckComment,
  getDeckCommentCounts,
  logDeckMatchResult,
  getDeckWinRate,
  batchDeckWinRates,
  getPlayerDeckHistory,
  getBlogPosts,
  getBlogPostBySlug,
  getRelatedPosts,
  getAllBlogSlugs,
  getBlogCategoryCounts,
} from "./db-supabase";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  /** Discussion comments — threaded community discussion on analysis pages */
  discussion: router({
    /** List all comments for a page context (e.g. "balance") */
    list: publicProcedure
      .input(z.object({ pageContext: z.string().min(1).max(64).default("balance") }))
      .query(async ({ input }) => {
        return getDiscussionComments(input.pageContext);
      }),

    /** Create a new comment or reply */
    create: publicProcedure
      .input(
        z.object({
          pageContext: z.string().min(1).max(64).default("balance"),
          section: z.string().max(64).optional(),
          parentId: z.number().int().positive().optional(),
          authorName: z
            .string()
            .min(1)
            .max(100)
            .transform((s) => s.replace(/[<>"'&]/g, "")),
          guestId: z.string().max(64).optional(),
          content: z
            .string()
            .min(1)
            .max(2000)
            .transform((s) => s.replace(/[<>"']/g, "")),
        })
      )
      .mutation(async ({ input }) => {
        const result = await createDiscussionComment({
          pageContext: input.pageContext,
          section: input.section ?? null,
          parentId: input.parentId ?? null,
          userId: null, // Guest comments for now; wire to ctx.user when auth is active
          authorName: input.authorName,
          guestId: input.guestId ?? null,
          content: input.content,
        });
        return result;
      }),

    /** Delete a comment (and its replies) */
    delete: publicProcedure
      .input(z.object({ commentId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        return deleteDiscussionComment(input.commentId);
      }),

    /** Upvote a comment */
    upvote: publicProcedure
      .input(z.object({ commentId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        return upvoteDiscussionComment(input.commentId);
      }),
  }),

  /** Player deck management — CRUD for custom 30-card decks */
  deck: router({
    /** List all decks for a Supabase user */
    list: publicProcedure
      .input(z.object({ supabaseUserId: z.string().min(1).max(64) }))
      .query(async ({ input }) => {
        return getDecksByUser(input.supabaseUserId);
      }),

    /** Get a single deck by ID */
    get: publicProcedure
      .input(z.object({ deckId: z.number().int().positive() }))
      .query(async ({ input }) => {
        return getDeckById(input.deckId) ?? null;
      }),

    /** Create a new deck (30 cards from a single faction) */
    create: publicProcedure
      .input(
        z.object({
          supabaseUserId: z.string().min(1).max(64),
          faction: z.string().min(1).max(32),
          name: z.string().min(1).max(100).transform((s) => s.replace(/[<>"'&]/g, "")),
          cardIds: z.string().min(2), // JSON array string
          isActive: z.number().int().min(0).max(1).default(0),
        })
      )
      .mutation(async ({ input }) => {
        // Validate cardIds is valid JSON array of 30 items
        let parsed: string[];
        try {
          parsed = JSON.parse(input.cardIds);
        } catch {
          throw new Error("cardIds must be a valid JSON array");
        }
        if (!Array.isArray(parsed) || parsed.length !== 30) {
          throw new Error("Deck must contain exactly 30 cards");
        }
        return createDeck(input);
      }),

    /** Update an existing deck */
    update: publicProcedure
      .input(
        z.object({
          deckId: z.number().int().positive(),
          supabaseUserId: z.string().min(1).max(64), // for ownership check
          name: z.string().min(1).max(100).transform((s) => s.replace(/[<>"'&]/g, "")).optional(),
          cardIds: z.string().min(2).optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Verify ownership
        const deck = await getDeckById(input.deckId);
        if (!deck || deck.supabaseUserId !== input.supabaseUserId) {
          throw new Error("Deck not found or access denied");
        }
        if (input.cardIds) {
          let parsed: string[];
          try {
            parsed = JSON.parse(input.cardIds);
          } catch {
            throw new Error("cardIds must be a valid JSON array");
          }
          if (!Array.isArray(parsed) || parsed.length !== 30) {
            throw new Error("Deck must contain exactly 30 cards");
          }
        }
        const updateData: Record<string, unknown> = {};
        if (input.name) updateData.name = input.name;
        if (input.cardIds) updateData.cardIds = input.cardIds;
        return updateDeck(input.deckId, updateData);
      }),

    /** Delete a deck */
    delete: publicProcedure
      .input(
        z.object({
          deckId: z.number().int().positive(),
          supabaseUserId: z.string().min(1).max(64),
        })
      )
      .mutation(async ({ input }) => {
        const deck = await getDeckById(input.deckId);
        if (!deck || deck.supabaseUserId !== input.supabaseUserId) {
          throw new Error("Deck not found or access denied");
        }
        return deleteDeck(input.deckId);
      }),

    /** Set a deck as the active deck for a user+faction */
    setActive: publicProcedure
      .input(
        z.object({
          supabaseUserId: z.string().min(1).max(64),
          faction: z.string().min(1).max(32),
          deckId: z.number().int().positive(),
        })
      )
      .mutation(async ({ input }) => {
        return setActiveDeck(input.supabaseUserId, input.faction, input.deckId);
      }),
  }),

  /** Community deck library — publish and browse player decks */
  community: router({
    /** List published community decks with optional filters */
    list: publicProcedure
      .input(
        z.object({
          faction: z.string().max(32).optional(),
          sortBy: z.enum(["newest", "likes"]).default("newest"),
          page: z.number().int().positive().default(1),
          limit: z.number().int().min(1).max(50).default(20),
        })
      )
      .query(async ({ input }) => {
        return listCommunityDecks(input);
      }),

    /** Get a single community deck by ID */
    get: publicProcedure
      .input(z.object({ deckId: z.number().int().positive() }))
      .query(async ({ input }) => {
        return getCommunityDeck(input.deckId);
      }),

    /** Publish a deck to the community library (requires auth) */
    publish: publicProcedure
      .input(
        z.object({
          playerId: z.string().min(1).max(64),
          gamertag: z
            .string()
            .min(3)
            .max(30)
            .regex(/^[a-zA-Z0-9_-]+$/, "Gamertag must be alphanumeric with underscores/hyphens"),
          deckName: z.string().min(1).max(100).transform((s) => s.replace(/[<>"'&]/g, "")),
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
        // Validate cardIds is valid JSON array of 30 items
        let parsed: string[];
        try {
          parsed = JSON.parse(input.cardIds);
        } catch {
          throw new Error("cardIds must be a valid JSON array");
        }
        if (!Array.isArray(parsed) || parsed.length !== 30) {
          throw new Error("Deck must contain exactly 30 cards");
        }

        // Set the gamertag on the player record (upsert)
        const currentTag = await getPlayerGamertag(input.playerId);
        if (!currentTag || currentTag !== input.gamertag) {
          // Check if gamertag is taken by someone else
          const taken = await isGamertagTaken(input.gamertag, input.playerId);
          if (taken) {
            throw new Error("Gamertag is already taken by another player");
          }
          await setPlayerGamertag(input.playerId, input.gamertag);
        }

        return publishCommunityDeck(input);
      }),

    /** Unpublish (delete) a community deck — only the owner */
    unpublish: publicProcedure
      .input(
        z.object({
          deckId: z.number().int().positive(),
          playerId: z.string().min(1).max(64),
        })
      )
      .mutation(async ({ input }) => {
        return unpublishCommunityDeck(input.deckId, input.playerId);
      }),

    /** Toggle like on a community deck (per-player rate-limited) */
    toggleLike: publicProcedure
      .input(
        z.object({
          deckId: z.number().int().positive(),
          playerId: z.string().min(1).max(64),
        })
      )
      .mutation(async ({ input }) => {
        return toggleCommunityLike(input.deckId, input.playerId);
      }),

    /** Get deck IDs the player has liked (for rendering filled hearts) */
    likedDeckIds: publicProcedure
      .input(z.object({ playerId: z.string().min(1).max(64) }))
      .query(async ({ input }) => {
        return getPlayerLikedDeckIds(input.playerId);
      }),

    /** List comments for a community deck */
    comments: publicProcedure
      .input(
        z.object({
          deckId: z.number().int().positive(),
          limit: z.number().int().min(1).max(100).default(50),
        })
      )
      .query(async ({ input }) => {
        return listDeckComments(input.deckId, input.limit);
      }),

    /** Add a comment (or reply) to a community deck */
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
      .mutation(async ({ input }) => {
        return addDeckComment({
          ...input,
          parentId: input.parentId ?? null,
        });
      }),

    /** Delete a comment (only the author) */
    deleteComment: publicProcedure
      .input(
        z.object({
          commentId: z.number().int().positive(),
          playerId: z.string().min(1).max(64),
        })
      )
      .mutation(async ({ input }) => {
        return deleteDeckComment(input.commentId, input.playerId);
      }),

    /** Get comment counts for multiple decks (for badge display) */
    commentCounts: publicProcedure
      .input(z.object({ deckIds: z.array(z.number().int().positive()).max(50) }))
      .query(async ({ input }) => {
        return getDeckCommentCounts(input.deckIds);
      }),

    /** Get the current player's gamertag */
    getGamertag: publicProcedure
      .input(z.object({ playerId: z.string().min(1).max(64) }))
      .query(async ({ input }) => {
        return { gamertag: await getPlayerGamertag(input.playerId) };
      }),

    /** Check if a gamertag is available */
    checkGamertag: publicProcedure
      .input(
        z.object({
          gamertag: z
            .string()
            .min(3)
            .max(30)
            .regex(/^[a-zA-Z0-9_-]+$/, "Gamertag must be alphanumeric with underscores/hyphens"),
          excludePlayerId: z.string().max(64).optional(),
        })
      )
      .query(async ({ input }) => {
        const taken = await isGamertagTaken(input.gamertag, input.excludePlayerId);
        return { available: !taken };
      }),

    /** Get all community decks published by a specific player */
    myDecks: publicProcedure
      .input(z.object({ playerId: z.string().min(1).max(64) }))
      .query(async ({ input }) => {
        return getPlayerCommunityDecks(input.playerId);
      }),

    /** Log a match result (win/loss) for a community deck */
    logMatch: publicProcedure
      .input(
        z.object({
          deckId: z.number().int().positive(),
          playerId: z.string().min(1).max(64),
          result: z.enum(["win", "loss"]),
          opponentFaction: z.string().min(1).max(30),
        })
      )
      .mutation(async ({ input }) => {
        return logDeckMatchResult(input);
      }),

    /** Get aggregated win rate for a single deck */
    winRate: publicProcedure
      .input(z.object({ deckId: z.number().int().positive() }))
      .query(async ({ input }) => {
        return getDeckWinRate(input.deckId);
      }),

    /** Get win rates for multiple decks (batch, for list page) */
    batchWinRates: publicProcedure
      .input(z.object({ deckIds: z.array(z.number().int().positive()).max(50) }))
      .query(async ({ input }) => {
        return batchDeckWinRates(input.deckIds);
      }),

    /** Get a player's match history with a specific deck */
    matchHistory: publicProcedure
      .input(
        z.object({
          deckId: z.number().int().positive(),
          playerId: z.string().min(1).max(64),
          limit: z.number().int().min(1).max(50).default(20),
        })
      )
      .query(async ({ input }) => {
        return getPlayerDeckHistory(input.deckId, input.playerId, input.limit);
      }),
  }),

  /** User account management — data purge for GDPR compliance */
  user: router({
    /** Purge ALL user data — decks, comments, game history. Real deletion, not fake. */
    purge: publicProcedure
      .input(
        z.object({
          supabaseUserId: z.string().min(1).max(64),
        })
      )
      .mutation(async ({ input }) => {
        const result = await deleteAllUserData(input.supabaseUserId);
        return {
          success: true,
          ...result,
          message: `Purged ${result.decksDeleted} decks and ${result.commentsDeleted} comments.`,
        };
      }),
  }),

  /** Blog — public SEO content */
  blog: router({
    /** List paginated blog posts with optional category filter and search */
    list: publicProcedure
      .input(
        z.object({
          page: z.number().int().positive().default(1),
          limit: z.number().int().min(1).max(100).default(20),
          category: z.string().max(64).optional(),
          search: z.string().max(200).optional(),
        })
      )
      .query(async ({ input }) => {
        return getBlogPosts(input);
      }),

    /** Get a single blog post by slug */
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string().min(1).max(255) }))
      .query(async ({ input }) => {
        return getBlogPostBySlug(input.slug) ?? null;
      }),

    /** Get related posts (same category) */
    related: publicProcedure
      .input(
        z.object({
          category: z.string().min(1).max(64),
          excludeSlug: z.string().min(1).max(255),
          limit: z.number().int().min(1).max(10).default(5),
        })
      )
      .query(async ({ input }) => {
        return getRelatedPosts(input.category, input.excludeSlug, input.limit);
      }),

    /** Get category counts for sidebar */
    categories: publicProcedure.query(async () => {
      return getBlogCategoryCounts();
    }),

    /** Get all slugs for sitemap */
    allSlugs: publicProcedure.query(async () => {
      return getAllBlogSlugs();
    }),
  }),

  game: router({
    /** Create a new game lobby and get the room code */
    create: publicProcedure
      .input(z.object({ username: z.string().min(1).max(20).transform(s => s.replace(/[<>"'&]/g, '')), playerId: z.string().min(1).max(64) }))
      .mutation(async ({ input }) => {
        return createGame(input.playerId, input.username);
      }),

    /** Join an existing game by room code */
    join: publicProcedure
      .input(
        z.object({
          roomCode: z.string().min(4).max(8).regex(/^[A-Z0-9]+$/i),
          username: z.string().min(1).max(20).transform(s => s.replace(/[<>"'&]/g, '')),
          playerId: z.string().min(1).max(64),
        })
      )
      .mutation(async ({ input }) => {
        return joinGame(input.roomCode, input.playerId, input.username);
      }),

    /** Choose your sin (Wrath or Sloth) */
    chooseSin: publicProcedure
      .input(
        z.object({
          gameId: z.string().uuid(),
          sin: z.enum(["wrath", "sloth", "greed", "envy"]),
          playerId: z.string().min(1).max(64),
        })
      )
      .mutation(async ({ input }) => {
        await chooseSin(input.gameId, input.playerId, input.sin as SinType);
        return { success: true };
      }),

    /** Start the game (requires all players to have chosen sins) */
    start: publicProcedure
      .input(z.object({ gameId: z.string().uuid() }))
      .mutation(async ({ input }) => {
        await startGame(input.gameId);
        return { success: true };
      }),

    /** Play a card from hand */
    playCard: publicProcedure
      .input(
        z.object({
          gameId: z.string().uuid(),
          cardId: z.string().max(64),
          playerId: z.string().min(1).max(64),
          targetPlayerId: z.string().max(64).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return playCard(input.gameId, input.playerId, input.cardId, input.targetPlayerId);
      }),

    /** Pass your turn (draws a card) */
    pass: publicProcedure
      .input(z.object({ gameId: z.string().uuid(), playerId: z.string().min(1).max(64) }))
      .mutation(async ({ input }) => {
        await passTurn(input.gameId, input.playerId);
        return { success: true };
      }),


    /** Consume (banish) a card from hand for +1 energy. Max 1 per round. */
    consume: publicProcedure
      .input(
        z.object({
          gameId: z.string().uuid(),
          playerId: z.string().min(1).max(64),
          cardId: z.string().max(64),
        })
      )
      .mutation(async ({ input }) => {
        return consumeCard(input.gameId, input.playerId, input.cardId);
      }),

    /** Get the full game state */
    getState: publicProcedure
      .input(z.object({ gameId: z.string().uuid() }))
      .query(async ({ input }) => {
        return getGameState(input.gameId);
      }),

    /** Get game action log */
    getLog: publicProcedure
      .input(z.object({ gameId: z.string().uuid() }))
      .query(async ({ input }) => {
        return getGameLog(input.gameId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
