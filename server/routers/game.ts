/**
 * Game — match lifecycle, AI narration, and Chronicle generation.
 *
 * Game-state mutations are still client-trusted (see CODEBASE.md §11
 * limitation 1). Chronicle generation lives here too because it operates
 * on a live gameId.
 */
import { z } from "zod";
import { SinType } from "../../shared/gameTypes";
import {
  analyzePlayerBehaviors,
  buildMatchContext,
  detectRivalries,
  generateNarratorLine,
  generateWhisper,
} from "../aiNarrator";
import { generateAndSaveCoverArt } from "../chronicleCoverArt";
import {
  assembleChronicle,
  extractRoundEvents,
  generateRoundNarrative,
  incrementViewCount,
  loadChronicle,
  loadChronicleSegments,
  loadPublishedChronicles,
  saveChronicle,
  saveChronicleSegment,
} from "../chronicleEngine";
import {
  chooseSin,
  consumeCard,
  createGame,
  enforceSelectionDeadline,
  getGameLog,
  getGameState,
  joinGame,
  passTurn,
  playCard,
  startGame,
} from "../gameEngine";
import { publicProcedure, router } from "../_core/trpc";

export const gameRouter = router({
  create: publicProcedure
    .input(
      z.object({
        username: z
          .string()
          .min(1)
          .max(20)
          .transform((s) => s.replace(/[<>"'&]/g, "")),
        playerId: z.string().min(1).max(64),
      })
    )
    .mutation(async ({ input }) => createGame(input.playerId, input.username)),

  join: publicProcedure
    .input(
      z.object({
        roomCode: z.string().min(4).max(8).regex(/^[A-Z0-9]+$/i),
        username: z
          .string()
          .min(1)
          .max(20)
          .transform((s) => s.replace(/[<>"'&]/g, "")),
        playerId: z.string().min(1).max(64),
      })
    )
    .mutation(async ({ input }) => joinGame(input.roomCode, input.playerId, input.username)),

  /** Choose your sin — must be one of the seven SinType values */
  chooseSin: publicProcedure
    .input(
      z.object({
        gameId: z.string().uuid(),
        sin: z.enum(["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"]),
        playerId: z.string().min(1).max(64),
      })
    )
    .mutation(async ({ input }) => {
      await chooseSin(input.gameId, input.playerId, input.sin as SinType);
      return { success: true };
    }),

  start: publicProcedure
    .input(z.object({ gameId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await startGame(input.gameId);
      return { success: true };
    }),

  playCard: publicProcedure
    .input(
      z.object({
        gameId: z.string().uuid(),
        cardId: z.string().max(64),
        playerId: z.string().min(1).max(64),
        targetPlayerId: z.string().max(64).optional(),
      })
    )
    .mutation(async ({ input }) =>
      playCard(input.gameId, input.playerId, input.cardId, input.targetPlayerId)
    ),

  pass: publicProcedure
    .input(z.object({ gameId: z.string().uuid(), playerId: z.string().min(1).max(64) }))
    .mutation(async ({ input }) => {
      await passTurn(input.gameId, input.playerId);
      return { success: true };
    }),

  consume: publicProcedure
    .input(
      z.object({
        gameId: z.string().uuid(),
        playerId: z.string().min(1).max(64),
        cardId: z.string().max(64),
      })
    )
    .mutation(async ({ input }) => consumeCard(input.gameId, input.playerId, input.cardId)),

  getState: publicProcedure
    .input(z.object({ gameId: z.string().uuid() }))
    .query(async ({ input }) => getGameState(input.gameId)),

  getLog: publicProcedure
    .input(z.object({ gameId: z.string().uuid() }))
    .query(async ({ input }) => getGameLog(input.gameId)),

  checkTimer: publicProcedure
    .input(z.object({ gameId: z.string().uuid() }))
    .mutation(async ({ input }) => enforceSelectionDeadline(input.gameId)),

  aiNarrate: publicProcedure
    .input(
      z.object({
        gameId: z.string().uuid(),
        trigger: z.enum([
          "round_start",
          "card_reveal",
          "big_damage",
          "player_eliminated",
          "game_over",
          "comeback",
          "rivalry_escalation",
        ]),
        triggerData: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const gameState = await getGameState(input.gameId);
      if (!gameState || !gameState.aiNarrator) return { line: null };
      const gameLog = await getGameLog(input.gameId);
      const behaviors = analyzePlayerBehaviors(gameState, gameLog);
      const context = buildMatchContext(gameState, behaviors);
      const line = await generateNarratorLine(input.trigger, context, input.triggerData);
      return { line };
    }),

  aiWhisper: publicProcedure
    .input(
      z.object({
        gameId: z.string().uuid(),
        playerId: z.string().min(1).max(64),
      })
    )
    .mutation(async ({ input }) => {
      const gameState = await getGameState(input.gameId);
      if (!gameState || !gameState.aiWhisperer) return { whisper: null };
      const player = gameState.players.find((p) => p.id === input.playerId);
      if (!player || !player.isAlive) return { whisper: null };

      const gameLog = await getGameLog(input.gameId);
      const behaviors = analyzePlayerBehaviors(gameState, gameLog);
      const context = buildMatchContext(gameState, behaviors);

      const { getCardById: getCard } = await import("../../shared/cardData");
      const hand = player.hand.map((cardId) => {
        const card = getCard(cardId);
        return {
          id: cardId,
          name: card?.name || "Unknown",
          energyCost: card?.cost || 0,
          effects: card?.effects || [],
        };
      });

      const whisper = await generateWhisper(player, context, hand);
      return { whisper };
    }),

  aiAnalysis: publicProcedure
    .input(z.object({ gameId: z.string().uuid() }))
    .query(async ({ input }) => {
      const gameState = await getGameState(input.gameId);
      if (!gameState) return { behaviors: [], rivalries: [] };
      const gameLog = await getGameLog(input.gameId);
      const behaviors = analyzePlayerBehaviors(gameState, gameLog);
      const rivalries = detectRivalries(behaviors);
      return { behaviors, rivalries };
    }),

  // ─── Chronicle Engine Endpoints ─────────────────────

  generateChronicleSegment: publicProcedure
    .input(
      z.object({
        gameId: z.string().uuid(),
        round: z.number().int().min(1).max(20),
      })
    )
    .mutation(async ({ input }) => {
      const gameState = await getGameState(input.gameId);
      if (!gameState) return { success: false, error: "Game not found" };

      const gameLog = await getGameLog(input.gameId);
      const previousSegments = await loadChronicleSegments(input.gameId);

      if (previousSegments.some((s) => s.round === input.round)) {
        return {
          success: true,
          segment: previousSegments.find((s) => s.round === input.round),
        };
      }

      const civMetrics =
        previousSegments.length > 0
          ? previousSegments[previousSegments.length - 1].civilizationMetrics
          : { militarism: 0, culture: 0, commerce: 0 };

      const roundEvents = extractRoundEvents(gameState, gameLog, input.round);
      const segment = await generateRoundNarrative(
        gameState,
        gameLog,
        roundEvents,
        previousSegments,
        civMetrics
      );

      await saveChronicleSegment(input.gameId, segment);
      return { success: true, segment };
    }),

  assembleChronicle: publicProcedure
    .input(z.object({ gameId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const existing = await loadChronicle(input.gameId);
      if (existing) {
        return {
          success: true,
          chronicleId: existing.id,
          title: existing.title,
          excerpt: existing.excerpt,
          rarityTier: existing.rarity_tier,
          civilizationType: existing.civilization_type,
          coverImageUrl: existing.cover_image_url || null,
        };
      }

      const gameState = await getGameState(input.gameId);
      if (!gameState) return { success: false, error: "Game not found" };

      const gameLog = await getGameLog(input.gameId);
      const segments = await loadChronicleSegments(input.gameId);

      if (segments.length === 0) {
        return { success: false, error: "No chronicle segments found" };
      }

      const finalMetrics = segments[segments.length - 1].civilizationMetrics;
      const playerFactions = gameState.players
        .filter((p) => p.chosenSin)
        .map((p) => ({ name: p.username, faction: p.chosenSin as string }));

      const result = await assembleChronicle(gameState, segments, gameLog, finalMetrics);

      const chronicleId = await saveChronicle(input.gameId, {
        ...result,
        playerFactions: playerFactions as any,
        totalRounds: segments.length,
      });

      return {
        success: true,
        chronicleId,
        title: result.title,
        excerpt: result.excerpt,
        rarityTier: result.rarityTier,
        civilizationType: result.civilizationType,
      };
    }),

  getChronicle: publicProcedure
    .input(z.object({ gameId: z.string().uuid() }))
    .query(async ({ input }) => {
      const chronicle = await loadChronicle(input.gameId);
      if (chronicle) {
        incrementViewCount(chronicle.id).catch(() => {});
      }
      return chronicle;
    }),

  getChronicleSegments: publicProcedure
    .input(z.object({ gameId: z.string().uuid() }))
    .query(async ({ input }) => loadChronicleSegments(input.gameId)),

  getPublishedChronicles: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(20),
        offset: z.number().int().min(0).default(0),
        rarityTier: z.enum(["common", "rare", "epic", "legendary"]).optional(),
        civilizationType: z
          .enum(["warrior_empire", "enlightened_republic", "merchant_federation", "balanced"])
          .optional(),
      })
    )
    .query(async ({ input }) =>
      loadPublishedChronicles(input.limit, input.offset, {
        rarityTier: input.rarityTier as any,
        civilizationType: input.civilizationType as any,
      })
    ),

  generateCoverArt: publicProcedure
    .input(z.object({ gameId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const chronicle = await loadChronicle(input.gameId);
      if (!chronicle) return { success: false, error: "Chronicle not found" };
      if (chronicle.cover_image_url) {
        return { success: true, coverImageUrl: chronicle.cover_image_url };
      }

      const playerFactions = Array.isArray(chronicle.player_factions)
        ? chronicle.player_factions.map((pf: any) => pf.faction).filter(Boolean)
        : [];

      const coverUrl = await generateAndSaveCoverArt({
        gameId: input.gameId,
        title: chronicle.title,
        civilizationType: chronicle.civilization_type,
        rarityTier: chronicle.rarity_tier,
        dominantFactions: playerFactions,
        turningPointRound: chronicle.turning_point_round || 10,
        totalEliminations: chronicle.stats_json?.totalEliminations || 0,
        excerpt: chronicle.excerpt,
      });

      return { success: !!coverUrl, coverImageUrl: coverUrl };
    }),
});
