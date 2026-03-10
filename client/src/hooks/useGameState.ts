/**
 * useGameState - Real-time game state management hook
 *
 * Subscribes to Supabase Realtime channels for live game updates.
 * Calls the client-side game engine directly (no tRPC/server needed).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { getClientSupabase } from "../../../shared/supabaseClient";
import { GameState } from "../../../shared/gameTypes";
import { getGameState } from "../lib/gameEngine";

export function useGameState(gameId: string | null) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  // Fetch game state
  const fetchState = useCallback(async () => {
    if (!gameId) return;
    try {
      const state = await getGameState(gameId);
      setGameState(state);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

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
