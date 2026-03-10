/**
 * tRPC Router Definitions for 7 Deadly Sins Card Game
 *
 * Exposes game operations as type-safe RPC endpoints.
 * All game procedures use publicProcedure since on Vercel
 * we don't have Manus OAuth. Players are identified by
 * a client-generated playerId passed in the request.
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
  overcharge,
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
    create: publicProcedure
      .input(z.object({ username: z.string().min(1).max(20), playerId: z.string().min(1) }))
      .mutation(async ({ input }) => {
        return createGame(input.playerId, input.username);
      }),

    /** Join an existing game by room code */
    join: publicProcedure
      .input(
        z.object({
          roomCode: z.string().min(4).max(8),
          username: z.string().min(1).max(20),
          playerId: z.string().min(1),
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
          sin: z.enum(["wrath", "sloth"]),
          playerId: z.string().min(1),
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
          cardId: z.string(),
          playerId: z.string().min(1),
          targetPlayerId: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return playCard(input.gameId, input.playerId, input.cardId, input.targetPlayerId);
      }),

    /** Pass your turn (draws a card) */
    pass: publicProcedure
      .input(z.object({ gameId: z.string().uuid(), playerId: z.string().min(1) }))
      .mutation(async ({ input }) => {
        await passTurn(input.gameId, input.playerId);
        return { success: true };
      }),

    /** Overcharge: Wrath players spend HP to gain energy */
    overcharge: publicProcedure
      .input(z.object({ gameId: z.string().uuid(), playerId: z.string().min(1) }))
      .mutation(async ({ input }) => {
        return overcharge(input.gameId, input.playerId);
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
