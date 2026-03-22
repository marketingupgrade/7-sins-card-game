/**
 * useAINarrator — Fires AI narrator and Sin Whisperer calls at the right game moments.
 *
 * Integrates with the existing useNarrator hook by calling addMessage()
 * when AI-generated lines arrive. Falls back gracefully if AI is disabled
 * or the LLM call fails (the server already handles fallback to static lines).
 *
 * Triggers:
 * - round_start: When a new round begins
 * - card_reveal: When resolution starts (cards are revealed)
 * - player_eliminated: When a player dies
 * - game_over: When the game ends
 *
 * Sin Whisperer:
 * - Fires once per selection phase, returns a private temptation string
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import type { GameState, SinType } from "@shared/gameTypes";

interface UseAINarratorOptions {
  gameId: string | null;
  playerId: string | null;
  gameState: GameState | null;
  addMessage: (text: string, type?: "info" | "action" | "dramatic") => void;
  addToActionFeed: (text: string) => void;
}

export function useAINarrator({
  gameId,
  playerId,
  gameState,
  addMessage,
  addToActionFeed,
}: UseAINarratorOptions) {
  const [whisper, setWhisper] = useState<string | null>(null);
  const [isWhisperLoading, setIsWhisperLoading] = useState(false);

  // Track what we've already narrated to avoid duplicate calls
  const lastNarratedRound = useRef(0);
  const lastNarratedResolution = useRef(0);
  const lastNarratedEliminations = useRef<Set<string>>(new Set());
  const lastWhisperRound = useRef(0);
  const gameOverNarrated = useRef(false);

  const aiNarrate = trpc.game.aiNarrate.useMutation();
  const aiWhisper = trpc.game.aiWhisper.useMutation();

  // ── Round Start Narrator ──
  useEffect(() => {
    if (
      !gameId ||
      !gameState ||
      !gameState.aiNarrator ||
      gameState.status !== "active" ||
      gameState.currentRound <= lastNarratedRound.current
    ) {
      return;
    }

    const round = gameState.currentRound;
    lastNarratedRound.current = round;

    // Fire and forget — don't block the UI
    aiNarrate.mutateAsync({
      gameId,
      trigger: "round_start",
      triggerData: { round },
    }).then((result) => {
      if (result.line) {
        addMessage(result.line, "action");
      }
    }).catch(() => {
      // Fallback already handled by static narrator
    });
  }, [gameId, gameState?.currentRound, gameState?.status, gameState?.aiNarrator]);

  // ── Resolution / Card Reveal Narrator ──
  useEffect(() => {
    if (
      !gameId ||
      !gameState ||
      !gameState.aiNarrator ||
      gameState.turnPhase !== "resolution" ||
      gameState.currentRound <= lastNarratedResolution.current
    ) {
      return;
    }

    lastNarratedResolution.current = gameState.currentRound;

    // Build play data from locked plays
    const plays = (gameState.lockedPlays || [])
      .filter((lp: any) => lp.cardId && !lp.pass)
      .map((lp: any) => {
        const player = gameState.players.find((p) => p.id === lp.playerId);
        const target = lp.targetPlayerId
          ? gameState.players.find((p) => p.id === lp.targetPlayerId)
          : null;
        return {
          playerName: player?.username || "Unknown",
          cardName: lp.cardName || lp.cardId,
          effectType: "attack",
          targetName: target?.username || null,
        };
      });

    aiNarrate.mutateAsync({
      gameId,
      trigger: "card_reveal",
      triggerData: { plays },
    }).then((result) => {
      if (result.line) {
        addMessage(result.line, "action");
      }
    }).catch(() => {});
  }, [gameId, gameState?.turnPhase, gameState?.currentRound, gameState?.aiNarrator]);

  // ── Player Eliminated Narrator ──
  useEffect(() => {
    if (!gameId || !gameState || !gameState.aiNarrator) return;

    const deadPlayers = gameState.players.filter((p) => !p.isAlive);
    for (const dead of deadPlayers) {
      if (lastNarratedEliminations.current.has(dead.id)) continue;
      lastNarratedEliminations.current.add(dead.id);

      aiNarrate.mutateAsync({
        gameId,
        trigger: "player_eliminated",
        triggerData: {
          playerName: dead.username,
          faction: dead.chosenSin,
        },
      }).then((result) => {
        if (result.line) {
          addMessage(result.line, "action");
        }
      }).catch(() => {});
    }
  }, [gameId, gameState?.players, gameState?.aiNarrator]);

  // ── Game Over Narrator ──
  useEffect(() => {
    if (
      !gameId ||
      !gameState ||
      !gameState.aiNarrator ||
      gameState.status !== "finished" ||
      gameOverNarrated.current
    ) {
      return;
    }

    gameOverNarrated.current = true;

    const winner = gameState.players.find((p) => p.isAlive);
    if (!winner) return;

    aiNarrate.mutateAsync({
      gameId,
      trigger: "game_over",
      triggerData: {
        winnerName: winner.username,
        winnerFaction: winner.chosenSin,
        winnerHp: winner.currentHp,
      },
    }).then((result) => {
      if (result.line) {
        addMessage(result.line, "action");
        addToActionFeed(result.line);
      }
    }).catch(() => {});
  }, [gameId, gameState?.status, gameState?.aiNarrator]);

  // ── Sin Whisperer — fires once per selection phase ──
  useEffect(() => {
    if (
      !gameId ||
      !playerId ||
      !gameState ||
      !gameState.aiWhisperer ||
      gameState.turnPhase !== "selection" ||
      gameState.currentRound <= lastWhisperRound.current
    ) {
      return;
    }

    const myPlayer = gameState.players.find((p) => p.id === playerId);
    if (!myPlayer || !myPlayer.isAlive || myPlayer.hasLockedIn) return;

    lastWhisperRound.current = gameState.currentRound;
    setIsWhisperLoading(true);
    setWhisper(null);

    aiWhisper.mutateAsync({
      gameId,
      playerId,
    }).then((result) => {
      if (result.whisper) {
        setWhisper(result.whisper);
      }
    }).catch(() => {
      setWhisper(null);
    }).finally(() => {
      setIsWhisperLoading(false);
    });
  }, [gameId, playerId, gameState?.turnPhase, gameState?.currentRound, gameState?.aiWhisperer]);

  // Clear whisper when player locks in or phase changes
  useEffect(() => {
    if (gameState?.turnPhase !== "selection") {
      setWhisper(null);
    }
  }, [gameState?.turnPhase]);

  // Reset on new game
  const resetAINarrator = useCallback(() => {
    lastNarratedRound.current = 0;
    lastNarratedResolution.current = 0;
    lastNarratedEliminations.current = new Set();
    lastWhisperRound.current = 0;
    gameOverNarrated.current = false;
    setWhisper(null);
  }, []);

  return {
    whisper,
    isWhisperLoading,
    resetAINarrator,
  };
}
