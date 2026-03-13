/**
 * useBotController - Manages bot lock-in during simultaneous selection phase
 *
 * Fixed: No longer spams duplicate "X cards locked" messages per bot.
 * Now shows individual bot names locking in, with one summary at the end.
 * v2: Passes resolvedPlays/resolutionPlayers back when a bot triggers resolution.
 */

import { useCallback, useEffect, useRef } from "react";
import { botPlayTurn, isBot } from "@/lib/botEngine";
import type { GameState, LockedPlay, PlayerState } from "@shared/gameTypes";

interface BotControllerOptions {
  gameState: GameState | null;
  onBotAction?: (result: {
    action: string;
    cardName?: string;
    narratorQuip?: string;
    botName?: string;
    cardsPlayed?: number;
  }) => void;
  onAllBotsLocked?: (summary: { totalBots: number; totalCards: number }) => void;
  onResolutionTriggered?: (plays: LockedPlay[], players: PlayerState[]) => void;
  onRefetch: () => void;
}

export function useBotController({ gameState, onBotAction, onAllBotsLocked, onResolutionTriggered, onRefetch }: BotControllerOptions) {
  const isProcessingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastProcessedRoundRef = useRef<number>(-1);

  const executeAllBotLockIns = useCallback(async () => {
    if (!gameState || gameState.status !== "active" || isProcessingRef.current) return;
    if (gameState.turnPhase !== "selection") return;

    // Prevent double-processing the same round
    if (lastProcessedRoundRef.current === gameState.currentRound) return;

    const botPlayers = gameState.players.filter((p) => p.isAlive && isBot(p.id));
    if (botPlayers.length === 0) return;

    // Check if any bots still need to lock in
    const botsNeedingLockIn = botPlayers.filter((p) => !p.hasLockedIn);
    if (botsNeedingLockIn.length === 0) return;

    isProcessingRef.current = true;
    lastProcessedRoundRef.current = gameState.currentRound;

    let totalCardsPlayed = 0;
    let botsLocked = 0;

    try {
      // Stagger bot lock-ins with "thinking" delays
      for (const bot of botsNeedingLockIn) {
        const thinkTime = 800 + Math.random() * 1200;
        await new Promise((resolve) => setTimeout(resolve, thinkTime));

        try {
          const result = await botPlayTurn(gameState.id, bot.id);
          botsLocked++;
          totalCardsPlayed += result.cardsPlayed || 0;

          // Show individual bot action (without the generic quip)
          if (onBotAction) {
            onBotAction({
              ...result,
              botName: bot.username,
              // Suppress the generic "X cards locked" quip per bot
              narratorQuip: undefined,
            });
          }

          // If this bot's lock-in triggered resolution, pass the data up
          if (result.resolvedPlays && result.resolvedPlays.length > 0 && result.resolutionPlayers && onResolutionTriggered) {
            onResolutionTriggered(result.resolvedPlays, result.resolutionPlayers);
          }
        } catch (err) {
          console.error(`Bot ${bot.id} lock-in failed:`, err);
        }
      }

      // Show one summary message after all bots are done
      if (onAllBotsLocked && botsLocked > 0) {
        onAllBotsLocked({ totalBots: botsLocked, totalCards: totalCardsPlayed });
      }

      // Delay before refetching to let Supabase propagate
      await new Promise((resolve) => setTimeout(resolve, 500));
      onRefetch();
    } catch (err) {
      console.error("Bot controller failed:", err);
    } finally {
      isProcessingRef.current = false;
    }
  }, [gameState, onBotAction, onAllBotsLocked, onResolutionTriggered, onRefetch]);

  // Watch for selection phase to trigger bot lock-ins
  useEffect(() => {
    if (!gameState || gameState.status !== "active") return;
    if (gameState.turnPhase !== "selection") return;

    const botPlayers = gameState.players.filter((p) => p.isAlive && isBot(p.id));
    if (botPlayers.length === 0) return;

    const botsNeedingLockIn = botPlayers.filter((p) => !p.hasLockedIn);
    if (botsNeedingLockIn.length === 0) return;

    // Schedule bot lock-ins
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      executeAllBotLockIns();
    }, 600);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [gameState?.turnPhase, gameState?.currentRound, gameState?.status, executeAllBotLockIns]);

  // Reset round tracking when game changes
  useEffect(() => {
    if (!gameState) {
      lastProcessedRoundRef.current = -1;
    }
  }, [gameState?.id]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
}
