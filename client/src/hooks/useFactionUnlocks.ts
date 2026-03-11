/**
 * useFactionUnlocks - Faction Gating System
 *
 * Gates advanced factions (Greed, Envy) behind a play-count requirement.
 * Wrath and Sloth are always available as starter factions.
 * After playing UNLOCK_THRESHOLD games, Greed and Envy become available.
 *
 * Tracks progress via localStorage (7sins_total_games).
 * Provides unlock state, progress info, and a celebration trigger.
 */

import { useState, useEffect, useCallback } from "react";
import type { SinType } from "@shared/gameTypes";

/** Number of games required to unlock advanced factions */
export const UNLOCK_THRESHOLD = 3;

/** Factions that are always available */
export const STARTER_FACTIONS: SinType[] = ["wrath", "sloth"];

/** Factions that require unlocking */
export const LOCKED_FACTIONS: SinType[] = ["greed", "envy"];

const STORAGE_KEY_TOTAL_GAMES = "7sins_total_games";
const STORAGE_KEY_UNLOCK_CELEBRATED = "7sins_unlock_celebrated";

export interface FactionUnlockState {
  /** Total games played */
  gamesPlayed: number;
  /** Games remaining until unlock */
  gamesRemaining: number;
  /** Whether advanced factions are unlocked */
  isUnlocked: boolean;
  /** Progress as a fraction (0 to 1) */
  progress: number;
  /** Whether to show the unlock celebration (first time unlocking) */
  showCelebration: boolean;
  /** Dismiss the celebration */
  dismissCelebration: () => void;
  /** Check if a specific faction is available */
  isFactionAvailable: (sin: SinType) => boolean;
  /** Refresh the state (call after a game ends) */
  refresh: () => void;
}

export function useFactionUnlocks(): FactionUnlockState {
  const [gamesPlayed, setGamesPlayed] = useState(() => {
    return parseInt(localStorage.getItem(STORAGE_KEY_TOTAL_GAMES) || "0", 10);
  });
  const [showCelebration, setShowCelebration] = useState(false);

  const isUnlocked = gamesPlayed >= UNLOCK_THRESHOLD;
  const gamesRemaining = Math.max(0, UNLOCK_THRESHOLD - gamesPlayed);
  const progress = Math.min(1, gamesPlayed / UNLOCK_THRESHOLD);

  // Check if we should show the celebration (first time reaching threshold)
  useEffect(() => {
    if (isUnlocked) {
      const alreadyCelebrated = localStorage.getItem(STORAGE_KEY_UNLOCK_CELEBRATED) === "true";
      if (!alreadyCelebrated) {
        setShowCelebration(true);
        localStorage.setItem(STORAGE_KEY_UNLOCK_CELEBRATED, "true");
      }
    }
  }, [isUnlocked]);

  const dismissCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);

  const isFactionAvailable = useCallback(
    (sin: SinType): boolean => {
      if (STARTER_FACTIONS.includes(sin)) return true;
      return isUnlocked;
    },
    [isUnlocked]
  );

  const refresh = useCallback(() => {
    const current = parseInt(localStorage.getItem(STORAGE_KEY_TOTAL_GAMES) || "0", 10);
    setGamesPlayed(current);
  }, []);

  return {
    gamesPlayed,
    gamesRemaining,
    isUnlocked,
    progress,
    showCelebration,
    dismissCelebration,
    isFactionAvailable,
    refresh,
  };
}
