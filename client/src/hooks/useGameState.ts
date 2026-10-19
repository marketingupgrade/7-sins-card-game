/**
 * useGameState - Real-time game state management hook
 *
 * Subscribes to Supabase Realtime channels for live game updates.
 * Calls the client-side game engine directly (no tRPC/server needed).
 * Includes a self-healing watchdog that rescues a game stuck in
 * "round_end"/"resolution" after a period with no progress.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { getClientSupabase } from "../../../shared/supabaseClient";
import { GameState } from "../../../shared/gameTypes";
import { getGameState, isResolvingLocally } from "../lib/gameEngine";

// How long to wait in round_end before self-healing (ms)
const STUCK_ROUND_END_TIMEOUT = 15000;
// Poll cadence used only while the realtime channel is down
const POLL_INTERVAL_MS = 2000;

export function useGameState(gameId: string | null) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);
  const lastProgressAtRef = useRef(Date.now());
  const lastStateJsonRef = useRef<string>("");

  // Fetch game state
  const fetchState = useCallback(async () => {
    if (!gameId) return;
    try {
      const state = await getGameState(gameId);
      // Polling (and realtime bursts) mostly return an identical state.
      // A fresh object every time re-rendered the entire board — and
      // restarted anything keyed off it — for nothing.
      const json = JSON.stringify(state);
      if (json !== lastStateJsonRef.current) {
        lastStateJsonRef.current = json;
        lastProgressAtRef.current = Date.now();
        setGameState(state);
      }
      setError(null);
    } catch (err: any) {
      console.error("[GameState]", err);
      setError("Failed to load game state. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  // Self-healing watchdog: rescue a game stuck in round_end / resolution
  // (e.g. the resolving client closed its tab mid-round).
  //
  // "Stuck" means NO PROGRESS for the timeout, not "in this phase for the
  // timeout". Resolution is many sequential DB writes and on a slow
  // connection legitimately takes longer than 15s; the old phase-entry
  // timer fired on the very client still resolving, forced the game back
  // to selection, cleared everyone's sealed cards, and let the in-flight
  // resolution keep writing over it — a ~15s stall and a half-applied round.
  // Now: never heal a game this browser is resolving, and any observed
  // state change resets the clock.
  useEffect(() => {
    const phase = gameState?.turnPhase;
    const watching = !!gameId && gameState?.status === "active" && (phase === "round_end" || phase === "resolution");
    if (!watching) return;
    lastProgressAtRef.current = Date.now();
    const iv = setInterval(async () => {
      if (isResolvingLocally(gameId!)) { lastProgressAtRef.current = Date.now(); return; }
      if (Date.now() - lastProgressAtRef.current < STUCK_ROUND_END_TIMEOUT) return;
      clearInterval(iv);
      console.warn(`[GameState] Self-healing: game stuck in "${phase}" with no progress for ${STUCK_ROUND_END_TIMEOUT / 1000}s, forcing transition to selection`);
      try {
        const sb = getClientSupabase();
        // Compare-and-swap on the phase so we never clobber a round that
        // moved on while we were deciding.
        const { data: healed } = await sb.from("games").update({
          turn_phase: "selection",
          locked_plays: [],
        }).eq("id", gameId!).eq("turn_phase", phase!).select("id").maybeSingle();
        if (healed) {
          const { data: players } = await sb
            .from("game_players")
            .select("id")
            .eq("game_id", gameId!);
          for (const p of players ?? []) {
            await sb.from("game_players").update({ locked_cards: [] }).eq("id", p.id);
          }
        }
        fetchState();
      } catch (e) {
        console.error("[GameState] Self-healing failed:", e);
      }
    }, 2000);
    return () => clearInterval(iv);
  }, [gameState?.turnPhase, gameState?.status, gameId, fetchState]);

  // Initial load
  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!gameId) return;

    const supabase = getClientSupabase();

    // Debounce the refetch — during card resolution Supabase fires bursts
    // of postgres_changes across `games`, `game_players`, and
    // `active_effects` all within a few ms. Without the debounce we'd
    // re-fetch the entire game state 5–10 times in a row, each triggering
    // a full re-render and stalling the UI thread.
    let refetchTimer: ReturnType<typeof setTimeout> | null = null;
    const queueRefetch = () => {
      if (refetchTimer) return;
      refetchTimer = setTimeout(() => {
        refetchTimer = null;
        fetchState();
      }, 60);
    };

    // Fallback polling — only runs while the realtime channel is not live.
    let realtimeLive = false;
    let disposed = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    function startPolling() {
      // removeChannel() on unmount reports CLOSED — don't restart then.
      if (pollTimer || disposed) return;
      pollTimer = setInterval(() => {
        if (document.visibilityState === "visible") fetchState();
      }, POLL_INTERVAL_MS);
    }
    function stopPolling() {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = null;
    }

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
        queueRefetch
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_players",
          filter: `game_id=eq.${gameId}`,
        },
        queueRefetch
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "active_effects",
          filter: `game_id=eq.${gameId}`,
        },
        queueRefetch
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // Events fired while we were (re)connecting are lost, not queued —
          // catch up once the socket is live, then stop polling.
          realtimeLive = true;
          stopPolling();
          queueRefetch();
        } else {
          // CHANNEL_ERROR / TIMED_OUT / CLOSED: websockets blocked by a proxy,
          // a flaky mobile connection, or a backgrounded tab. Without this the
          // board freezes on "waiting for others" forever.
          realtimeLive = false;
          startPolling();
        }
      });

    // Until the first SUBSCRIBED arrives we don't know the socket works.
    const connectGrace = setTimeout(() => {
      if (!realtimeLive) startPolling();
    }, POLL_INTERVAL_MS * 2);

    // Returning to the tab (phone unlocked, app switched back) — the socket
    // may have silently missed updates while suspended.
    const onVisible = () => {
      if (document.visibilityState === "visible") queueRefetch();
    };
    document.addEventListener("visibilitychange", onVisible);

    channelRef.current = channel;

    return () => {
      disposed = true;
      if (refetchTimer) clearTimeout(refetchTimer);
      clearTimeout(connectGrace);
      stopPolling();
      document.removeEventListener("visibilitychange", onVisible);
      supabase.removeChannel(channel);
    };
  }, [gameId, fetchState]);

  return { gameState, isLoading, error, refetch: fetchState };
}
