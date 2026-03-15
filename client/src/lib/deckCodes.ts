/**
 * Deck Import/Export — Shareable deck codes
 *
 * Format: {FACTION_PREFIX}:{card_numbers_comma_separated}
 * Example: "W:01,03,05,07,09,11,13,15,17,19,21,23,25,27,29,31,33,35,37,39,41,43,45,47,49,51,53,02,04,06"
 *
 * Faction prefixes: W=Wrath, S=Sloth, G=Greed, E=Envy, P=Pride, L=Lust, X=Gluttony
 * Card numbers are the 2-digit suffix from the card ID (e.g., "wrath_03" → "03")
 */

import { SinType } from "@shared/gameTypes";

const FACTION_TO_PREFIX: Record<SinType, string> = {
  wrath: "W",
  sloth: "S",
  greed: "G",
  envy: "E",
  pride: "P",
  lust: "L",
  gluttony: "X",
};

const PREFIX_TO_FACTION: Record<string, SinType> = Object.fromEntries(
  Object.entries(FACTION_TO_PREFIX).map(([k, v]) => [v, k as SinType])
) as Record<string, SinType>;

/**
 * Encode a deck (faction + card IDs) into a shareable code string.
 * Returns null if the deck is empty or faction is missing.
 */
export function encodeDeck(faction: SinType, cardIds: string[]): string | null {
  if (!faction || cardIds.length === 0) return null;

  const prefix = FACTION_TO_PREFIX[faction];
  if (!prefix) return null;

  // Extract card numbers from IDs (e.g., "wrath_03" → "03")
  const numbers = cardIds
    .map((id) => {
      const parts = id.split("_");
      return parts[parts.length - 1]; // Get the number part
    })
    .filter(Boolean);

  if (numbers.length === 0) return null;

  return `${prefix}:${numbers.join(",")}`;
}

/**
 * Decode a deck code string into faction + card IDs.
 * Returns null if the code is invalid.
 */
export function decodeDeck(code: string): { faction: SinType; cardIds: string[] } | null {
  if (!code || typeof code !== "string") return null;

  // Clean up: trim whitespace, remove quotes
  const cleaned = code.trim().replace(/^["']|["']$/g, "");

  // Parse prefix and numbers
  const colonIdx = cleaned.indexOf(":");
  if (colonIdx < 1) return null;

  const prefix = cleaned.substring(0, colonIdx).toUpperCase();
  const numbersStr = cleaned.substring(colonIdx + 1);

  // Validate faction prefix
  const faction = PREFIX_TO_FACTION[prefix];
  if (!faction) return null;

  // Parse card numbers
  const numbers = numbersStr
    .split(",")
    .map((n) => n.trim())
    .filter((n) => /^\d{1,2}$/.test(n))
    .map((n) => n.padStart(2, "0"));

  if (numbers.length === 0) return null;

  // Build card IDs
  const cardIds = numbers.map((n) => `${faction}_${n}`);

  // Remove duplicates while preserving order
  const seen = new Set<string>();
  const uniqueIds = cardIds.filter((id) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  return { faction, cardIds: uniqueIds };
}

/**
 * Validate a deck code and return a human-readable error if invalid.
 */
export function validateDeckCode(code: string): { valid: boolean; error?: string } {
  if (!code || !code.trim()) {
    return { valid: false, error: "Empty deck code" };
  }

  const cleaned = code.trim().replace(/^["']|["']$/g, "");
  const colonIdx = cleaned.indexOf(":");
  if (colonIdx < 1) {
    return { valid: false, error: "Invalid format. Expected: W:01,02,03,..." };
  }

  const prefix = cleaned.substring(0, colonIdx).toUpperCase();
  if (!PREFIX_TO_FACTION[prefix]) {
    return { valid: false, error: `Unknown faction prefix "${prefix}". Use W/S/G/E/P/L/X` };
  }

  const numbersStr = cleaned.substring(colonIdx + 1);
  const parts = numbersStr.split(",").map((n) => n.trim());
  const invalidParts = parts.filter((n) => !/^\d{1,2}$/.test(n));
  if (invalidParts.length > 0) {
    return { valid: false, error: `Invalid card numbers: ${invalidParts.slice(0, 3).join(", ")}` };
  }

  const numbers = parts.map((n) => parseInt(n, 10));
  const outOfRange = numbers.filter((n) => n < 1 || n > 54);
  if (outOfRange.length > 0) {
    return { valid: false, error: `Card numbers must be 1-54. Invalid: ${outOfRange.slice(0, 3).join(", ")}` };
  }

  return { valid: true };
}

/** Get all available faction prefixes for display */
export const FACTION_PREFIXES = FACTION_TO_PREFIX;
export const ALL_PREFIXES = PREFIX_TO_FACTION;
