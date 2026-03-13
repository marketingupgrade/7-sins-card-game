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

import { COOKIE_NAME } from "@shared/const";
import { SinType } from "@shared/gameTypes";
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
  startGame,
} from "./gameEngine";
import {
  getDiscussionComments,
  createDiscussionComment,
  deleteDiscussionComment,
  upvoteDiscussionComment,
} from "./db";

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
