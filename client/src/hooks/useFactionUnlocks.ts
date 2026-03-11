/**
 * useFactionUnlocks - Faction Availability System
 *
 * All four factions are now available from the start.
 * This hook remains as a compatibility layer and tracks play count
 * for future progression features (cosmetics, titles, etc).
 */

import { useState, useCallback } from "react";
import type { SinType } from "@shared/gameTypes";

/** All factions are available */
export const STARTER_FACTIONS: SinType[] = ["wrath", "sloth", "greed", "envy"];
export const LOCKED_FACTIONS: SinType[] = [];
export const UNLOCK_THRESHOLD = 0;

const STORAGE_KEY_TOTAL_GAMES = "7sins_total_games";

export interface FactionUnlockState {
  gamesPlayed: number;
  gamesRemaining: number;
  isUnlocked: boolean;
  progress: number;
  showCelebration: boolean;
  dismissCelebration: () => void;
  isFactionAvailable: (sin: SinType) => boolean;
  refresh: () => void;
}

export function useFactionUnlocks(): FactionUnlockState {
  const [gamesPlayed, setGamesPlayed] = useState(() => {
    return parseInt(localStorage.getItem(STORAGE_KEY_TOTAL_GAMES) || "0", 10);
  });

  const isFactionAvailable = useCallback((_sin: SinType): boolean => true, []);

  const refresh = useCallback(() => {
    const current = parseInt(localStorage.getItem(STORAGE_KEY_TOTAL_GAMES) || "0", 10);
    setGamesPlayed(current);
  }, []);

  return {
    gamesPlayed,
    gamesRemaining: 0,
    isUnlocked: true,
    progress: 1,
    showCelebration: false,
    dismissCelebration: () => {},
    isFactionAvailable,
    refresh,
  };
}
