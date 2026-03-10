/**
 * usePlayerId Hook
 *
 * Generates and persists a unique player ID in localStorage.
 * Used for identifying players without Manus OAuth on Vercel.
 */

import { useState } from "react";

function generateId(): string {
  return crypto.randomUUID();
}

export function usePlayerId(): string {
  const [playerId] = useState(() => {
    const stored = localStorage.getItem("7sins_player_id");
    if (stored) return stored;
    const newId = generateId();
    localStorage.setItem("7sins_player_id", newId);
    return newId;
  });
  return playerId;
}
