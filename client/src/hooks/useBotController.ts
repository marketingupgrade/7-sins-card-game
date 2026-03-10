/**
 * useBotController - Manages bot turn execution during gameplay
 *
 * When it's a bot's turn, this hook automatically triggers the bot
 * to play after a short "thinking" delay. Because even silicon
 * deserves a dramatic pause.
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

  const executeBotTurn = useCallback(async () => {
    if (!gameState || gameState.status !== "active" || isProcessingRef.current) return;

    const alivePlayers = gameState.players.filter((p) => p.isAlive);
    if (alivePlayers.length === 0) return;

    const currentPlayer = alivePlayers[gameState.currentPlayerIndex % alivePlayers.length];
    if (!currentPlayer || !isBot(currentPlayer.id)) return;

    isProcessingRef.current = true;

    try {
      // Dramatic bot "thinking" delay (1-2.5 seconds)
      const thinkTime = 1000 + Math.random() * 1500;
      await new Promise((resolve) => setTimeout(resolve, thinkTime));

      const result = await botPlayTurn(gameState.id, currentPlayer.id);

      if (onBotAction) {
        onBotAction(result);
      }

      // Small delay before refetching to let Supabase propagate
      await new Promise((resolve) => setTimeout(resolve, 500));
      onRefetch();
    } catch (err) {
      console.error("Bot turn failed:", err);
    } finally {
      isProcessingRef.current = false;
    }
  }, [gameState, onBotAction, onRefetch]);

  // Watch for bot turns
  useEffect(() => {
    if (!gameState || gameState.status !== "active") return;

    const alivePlayers = gameState.players.filter((p) => p.isAlive);
    if (alivePlayers.length === 0) return;

    const currentPlayer = alivePlayers[gameState.currentPlayerIndex % alivePlayers.length];
    if (!currentPlayer || !isBot(currentPlayer.id)) return;

    // Schedule bot turn execution
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      executeBotTurn();
    }, 800);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [gameState?.currentPlayerIndex, gameState?.currentRound, gameState?.status, executeBotTurn]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
}
