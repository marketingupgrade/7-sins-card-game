/**
 * tRPC Router Definitions for 7 Deadly Sins Card Game
 *
 * Exposes game operations as type-safe RPC endpoints:
 * - auth: login/logout (built-in)
 * - game: create, join, chooseSin, start, playCard, pass, getState, getLog
 */

import { COOKIE_NAME } from "@shared/const";
import { SinType } from "@shared/gameTypes";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
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

  game: router({
    /** Create a new game lobby and get the room code */
    create: protectedProcedure
      .input(z.object({ username: z.string().min(1).max(20) }))
      .mutation(async ({ ctx, input }) => {
        const playerId = ctx.user.openId;
        return createGame(playerId, input.username);
      }),

    /** Join an existing game by room code */
    join: protectedProcedure
      .input(
        z.object({
          roomCode: z.string().min(4).max(8),
          username: z.string().min(1).max(20),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const playerId = ctx.user.openId;
        return joinGame(input.roomCode, playerId, input.username);
      }),

    /** Choose your sin (Wrath or Sloth) */
    chooseSin: protectedProcedure
      .input(
        z.object({
          gameId: z.string().uuid(),
          sin: z.enum(["wrath", "sloth"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await chooseSin(input.gameId, ctx.user.openId, input.sin as SinType);
        return { success: true };
      }),

    /** Start the game (requires all players to have chosen sins) */
    start: protectedProcedure
      .input(z.object({ gameId: z.string().uuid() }))
      .mutation(async ({ input }) => {
        await startGame(input.gameId);
        return { success: true };
      }),

    /** Play a card from hand */
    playCard: protectedProcedure
      .input(
        z.object({
          gameId: z.string().uuid(),
          cardId: z.string(),
          targetPlayerId: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return playCard(input.gameId, ctx.user.openId, input.cardId, input.targetPlayerId);
      }),

    /** Pass your turn (draws a card) */
    pass: protectedProcedure
      .input(z.object({ gameId: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        await passTurn(input.gameId, ctx.user.openId);
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
