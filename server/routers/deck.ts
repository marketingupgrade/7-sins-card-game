/**
 * Player deck management — CRUD for custom 30-card decks.
 *
 * The current auth model trusts the client-supplied supabaseUserId for
 * ownership checks. See audit-findings.md item 6 — extend the
 * accessToken pattern from user.purge here when proper auth is added.
 */
import { z } from "zod";
import {
  createDeck,
  deleteDeck,
  getDeckById,
  getDecksByUser,
  setActiveDeck,
  updateDeck,
} from "../db-supabase";
import { publicProcedure, router } from "../_core/trpc";

function assertCardIdsArray(cardIds: string): void {
  let parsed: string[];
  try {
    parsed = JSON.parse(cardIds);
  } catch {
    throw new Error("cardIds must be a valid JSON array");
  }
  if (!Array.isArray(parsed) || parsed.length !== 30) {
    throw new Error("Deck must contain exactly 30 cards");
  }
}

export const deckRouter = router({
  list: publicProcedure
    .input(z.object({ supabaseUserId: z.string().min(1).max(64) }))
    .query(async ({ input }) => getDecksByUser(input.supabaseUserId)),

  get: publicProcedure
    .input(z.object({ deckId: z.number().int().positive() }))
    .query(async ({ input }) => (await getDeckById(input.deckId)) ?? null),

  create: publicProcedure
    .input(
      z.object({
        supabaseUserId: z.string().min(1).max(64),
        faction: z.string().min(1).max(32),
        name: z
          .string()
          .min(1)
          .max(100)
          .transform((s) => s.replace(/[<>"'&]/g, "")),
        cardIds: z.string().min(2),
        isActive: z.number().int().min(0).max(1).default(0),
      })
    )
    .mutation(async ({ input }) => {
      assertCardIdsArray(input.cardIds);
      return createDeck(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        deckId: z.number().int().positive(),
        supabaseUserId: z.string().min(1).max(64),
        name: z
          .string()
          .min(1)
          .max(100)
          .transform((s) => s.replace(/[<>"'&]/g, ""))
          .optional(),
        cardIds: z.string().min(2).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const deck = await getDeckById(input.deckId);
      if (!deck || deck.supabaseUserId !== input.supabaseUserId) {
        throw new Error("Deck not found or access denied");
      }
      if (input.cardIds) assertCardIdsArray(input.cardIds);
      const updateData: Record<string, unknown> = {};
      if (input.name) updateData.name = input.name;
      if (input.cardIds) updateData.cardIds = input.cardIds;
      return updateDeck(input.deckId, updateData);
    }),

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

  setActive: publicProcedure
    .input(
      z.object({
        supabaseUserId: z.string().min(1).max(64),
        faction: z.string().min(1).max(32),
        deckId: z.number().int().positive(),
      })
    )
    .mutation(async ({ input }) =>
      setActiveDeck(input.supabaseUserId, input.faction, input.deckId)
    ),
});
