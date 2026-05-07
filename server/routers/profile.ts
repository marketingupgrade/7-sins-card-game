/** Player profile — public profile pages. */
import { z } from "zod";
import {
  getPlayerAllMatchHistory,
  getPlayerByGamertag,
  getPlayerCommunityDecks,
  getPlayerProfile,
} from "../db-supabase";
import { publicProcedure, router } from "../_core/trpc";

export const profileRouter = router({
  get: publicProcedure
    .input(z.object({ playerId: z.string().min(1).max(64) }))
    .query(async ({ input }) => getPlayerProfile(input.playerId)),

  decks: publicProcedure
    .input(z.object({ playerId: z.string().min(1).max(64) }))
    .query(async ({ input }) => getPlayerCommunityDecks(input.playerId)),

  matchHistory: publicProcedure
    .input(
      z.object({
        playerId: z.string().min(1).max(64),
        limit: z.number().int().min(1).max(50).default(30),
      })
    )
    .query(async ({ input }) => getPlayerAllMatchHistory(input.playerId, input.limit)),

  byGamertag: publicProcedure
    .input(z.object({ gamertag: z.string().min(1).max(30) }))
    .query(async ({ input }) => getPlayerByGamertag(input.gamertag)),
});
