/**
 * Target Mode Utilities — Shared helpers for displaying card target mode badges
 *
 * Derives the dominant target mode from a card's effects and provides
 * consistent styling (label, color, background) across all UI surfaces:
 * - CardHoverPreview (desktop tooltip)
 * - Collection MiniCard (gallery grid badge)
 * - Collection CardDetailModal (detail view badge)
 * - Mobile card detail sheet (GameBoard)
 *
 * Priority order: aoe > duo > mixed (single+self) > single > self
 */

import type { CardDefinition } from "@shared/gameTypes";

export interface TargetModeInfo {
  mode: "aoe" | "duo" | "mixed" | "single" | "self";
  label: string;
  /** Short label for compact badges (e.g., MiniCard) */
  shortLabel: string;
  color: string;
  bgColor: string;
}

/**
 * Derive the dominant target mode for a card from its effects.
 * Returns null if no target modes are present (shouldn't happen in practice).
 */
export function getCardTargetMode(card: CardDefinition): TargetModeInfo | null {
  const modes = new Set(card.effects.map((e) => e.targetMode).filter(Boolean));

  if (modes.has("aoe"))
    return {
      mode: "aoe",
      label: "AOE",
      shortLabel: "AOE",
      color: "#f97316",
      bgColor: "rgba(249,115,22,0.15)",
    };

  if (modes.has("duo"))
    return {
      mode: "duo",
      label: "DUO",
      shortLabel: "DUO",
      color: "#a855f7",
      bgColor: "rgba(168,85,247,0.15)",
    };

  if (modes.has("single") && modes.has("self"))
    return {
      mode: "mixed",
      label: "SELF + TARGET",
      shortLabel: "MIX",
      color: "#22c55e",
      bgColor: "rgba(34,197,94,0.15)",
    };

  if (modes.has("single"))
    return {
      mode: "single",
      label: "SINGLE",
      shortLabel: "1v1",
      color: "#3b82f6",
      bgColor: "rgba(59,130,246,0.15)",
    };

  if (modes.has("self"))
    return {
      mode: "self",
      label: "SELF",
      shortLabel: "SELF",
      color: "#22c55e",
      bgColor: "rgba(34,197,94,0.15)",
    };

  return null;
}
