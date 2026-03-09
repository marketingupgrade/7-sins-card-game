/**
 * useGameState - Real-time game state management hook
 *
 * Subscribes to Supabase Realtime channels for live game updates.
 * Provides the current game state and auto-refreshes on any change.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { getClientSupabase } from "../../../shared/supabaseClient";
import { GameState } from "../../../shared/gameTypes";
import { trpc } from "../lib/trpc";

export function useGameState(gameId: string | null) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  // tRPC query for initial load and manual refetch
  const stateQuery = trpc.game.getState.useQuery(
    { gameId: gameId! },
    {
      enabled: !!gameId,
      refetchInterval: false,
    }
  );

  // Update local state when query data changes
  useEffect(() => {
    if (stateQuery.data) {
      setGameState(stateQuery.data);
      setIsLoading(false);
    }
    if (stateQuery.error) {
      setError(stateQuery.error.message);
      setIsLoading(false);
    }
  }, [stateQuery.data, stateQuery.error]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!gameId) return;

    const supabase = getClientSupabase();

    // Subscribe to changes on the games table for this game
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
          // Refetch full state on any game change
          stateQuery.refetch();
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
          stateQuery.refetch();
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
          stateQuery.refetch();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const refetch = useCallback(() => {
    stateQuery.refetch();
  }, [stateQuery]);

  return { gameState, isLoading, error, refetch };
}
