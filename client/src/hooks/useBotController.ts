/**
 * useBotController - Manages bot lock-in during simultaneous selection phase
 *
 * In the simultaneous system, ALL bots lock in their cards during the
 * selection phase (not sequentially). This hook watches for the selection
 * phase and triggers all bots to lock in with a staggered "thinking" delay.
 */

import { useCallback, useEffect, useRef } from "react";
import { botPlayTurn, isBot, getBotIds } from "@/lib/botEngine";
import type { GameState } from "@shared/gameTypes";

interface BotControllerOptions {
  gameState: GameState | null;
  onBotAction?: (result: { action: string; cardName?: string; narratorQuip?: string }) => void;
  onRefetch: () => void;
}

export function useBotController({ gameState, onBotAction, onRefetch }: BotControllerOptions) {
  const isProcessingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
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

    try {
      // Stagger bot lock-ins with "thinking" delays
      for (const bot of botsNeedingLockIn) {
        const thinkTime = 800 + Math.random() * 1200;
        await new Promise((resolve) => setTimeout(resolve, thinkTime));

        try {
          const result = await botPlayTurn(gameState.id, bot.id);

          if (onBotAction) {
            onBotAction(result);
          }
        } catch (err) {
          console.error(`Bot ${bot.id} lock-in failed:`, err);
        }
      }

      // Delay before refetching to let Supabase propagate
      await new Promise((resolve) => setTimeout(resolve, 500));
      onRefetch();
    } catch (err) {
      console.error("Bot controller failed:", err);
    } finally {
      isProcessingRef.current = false;
    }
  }, [gameState, onBotAction, onRefetch]);

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
