/**
 * useGameState - Real-time game state management hook
 *
 * Subscribes to Supabase Realtime channels for live game updates.
 * Calls the client-side game engine directly (no tRPC/server needed).
 * Includes a self-healing watchdog that detects stuck "round_end" states
 * and forces the transition to "selection" after a timeout.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { getClientSupabase } from "../../../shared/supabaseClient";
import { GameState } from "../../../shared/gameTypes";
import { getGameState } from "../lib/gameEngine";

// How long to wait in round_end before self-healing (ms)
const STUCK_ROUND_END_TIMEOUT = 15000;

export function useGameState(gameId: string | null) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);
  const roundEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPhaseRef = useRef<string | null>(null);

  // Fetch game state
  const fetchState = useCallback(async () => {
    if (!gameId) return;
    try {
      const state = await getGameState(gameId);
      setGameState(state);
      setError(null);
    } catch (err: any) {
      console.error("[GameState]", err);
      setError("Failed to load game state. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  // Self-healing watchdog: detect stuck round_end / resolution phases
  useEffect(() => {
    if (!gameState || !gameId) return;

    const phase = gameState.turnPhase;
    const status = gameState.status;

    // Only watch active games
    if (status !== "active") {
      if (roundEndTimerRef.current) {
        clearTimeout(roundEndTimerRef.current);
        roundEndTimerRef.current = null;
      }
      lastPhaseRef.current = phase;
      return;
    }

    // If we entered round_end or resolution, start the watchdog timer
    if ((phase === "round_end" || phase === "resolution") && lastPhaseRef.current !== phase) {
      // Phase just changed to round_end/resolution — start countdown
      if (roundEndTimerRef.current) clearTimeout(roundEndTimerRef.current);
      roundEndTimerRef.current = setTimeout(async () => {
        console.warn(`[GameState] Self-healing: game stuck in "${phase}" for ${STUCK_ROUND_END_TIMEOUT / 1000}s, forcing transition to selection`);
        try {
          const sb = getClientSupabase();
          // Force transition to selection
          await sb.from("games").update({
            turn_phase: "selection",
            locked_plays: [],
          }).eq("id", gameId);
          // Clear locked_cards on all players
          const { data: players } = await sb
            .from("game_players")
            .select("id")
            .eq("game_id", gameId);
          if (players) {
            for (const p of players) {
              await sb.from("game_players").update({ locked_cards: [] }).eq("id", p.id);
            }
          }
          // Refetch to update UI
          fetchState();
        } catch (e) {
          console.error("[GameState] Self-healing failed:", e);
        }
      }, STUCK_ROUND_END_TIMEOUT);
    } else if (phase !== "round_end" && phase !== "resolution") {
      // Phase moved away from round_end/resolution — cancel watchdog
      if (roundEndTimerRef.current) {
        clearTimeout(roundEndTimerRef.current);
        roundEndTimerRef.current = null;
      }
    }

    lastPhaseRef.current = phase;

    return () => {
      if (roundEndTimerRef.current) {
        clearTimeout(roundEndTimerRef.current);
        roundEndTimerRef.current = null;
      }
    };
  }, [gameState?.turnPhase, gameState?.status, gameId, fetchState]);

  // Initial load
  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!gameId) return;

    const supabase = getClientSupabase();

    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameId}`,
        },
        () => {
          fetchState();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_players",
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          fetchState();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "active_effects",
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          fetchState();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, fetchState]);

  return { gameState, isLoading, error, refetch: fetchState };
}
