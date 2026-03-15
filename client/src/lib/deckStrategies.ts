/**
 * Deck Strategy Auto-Fill — Scoring algorithms for Aggro, Control, and Balanced presets
 *
 * Each strategy scores every card in the faction pool, then picks the top N cards
 * to fill the deck to MAX_DECK_SIZE. The scoring considers:
 * - Effect types and their alignment with the strategy
 * - Mana cost curve preferences
 * - Target mode preferences (AoE for control, single for aggro)
 * - Tier weighting (epics are generally better)
 * - Compound pattern preferences
 */

import type { CardDefinition, EffectType, CompoundPattern } from "@shared/gameTypes";
import { getCardTargetMode } from "./targetModeUtils";

export type StrategyType = "aggro" | "control" | "balanced";

export interface StrategyInfo {
  type: StrategyType;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const STRATEGIES: StrategyInfo[] = [
  {
    type: "aggro",
    label: "Aggro",
    description: "Fast, cheap damage. Overwhelm before they stabilize.",
    icon: "\u2694\uFE0F",
    color: "#ef4444",
    bgColor: "rgba(239,68,68,0.12)",
  },
  {
    type: "control",
    label: "Control",
    description: "Outlast and debilitate. Win through attrition.",
    icon: "\uD83D\uDEE1\uFE0F",
    color: "#3b82f6",
    bgColor: "rgba(59,130,246,0.12)",
  },
  {
    type: "balanced",
    label: "Balanced",
    description: "Versatile mix. Adapt to any matchup.",
    icon: "\u2696\uFE0F",
    color: "#a855f7",
    bgColor: "rgba(168,85,247,0.12)",
  },
];

// ─── Effect Scoring by Strategy ────────────────────────────

const AGGRO_EFFECT_SCORES: Partial<Record<EffectType, number>> = {
  damage: 10,
  self_damage: 4, // Wrath specialty, risky but fast
  heal_steal: 8,
  shield_steal: 6,
  energy_steal: 7,
  affliction_amplify: 5,
  affliction_transfer: 3,
  discard_burn: 2,
  draw_boost: 4,
  draw_reduction: 3,
  // Defensive effects are low priority for aggro
  heal_gain: 1,
  shield_gain: 1,
  energy_gain: 3,
  energy_regen: 2,
  heal_block: 4,
  shield_block: 4,
  energy_block: 5,
};

const CONTROL_EFFECT_SCORES: Partial<Record<EffectType, number>> = {
  heal_gain: 10,
  shield_gain: 9,
  energy_gain: 7,
  energy_regen: 8,
  heal_block: 8,
  shield_block: 7,
  energy_block: 9,
  affliction_amplify: 7,
  affliction_transfer: 6,
  draw_reduction: 6,
  draw_boost: 5,
  // Offensive effects are lower priority for control
  damage: 4,
  self_damage: 1,
  heal_steal: 6,
  shield_steal: 5,
  energy_steal: 6,
  discard_burn: 4,
};

const BALANCED_EFFECT_SCORES: Partial<Record<EffectType, number>> = {
  damage: 7,
  heal_gain: 6,
  shield_gain: 6,
  energy_gain: 5,
  energy_regen: 5,
  heal_steal: 7,
  shield_steal: 6,
  energy_steal: 6,
  heal_block: 5,
  shield_block: 5,
  energy_block: 5,
  affliction_amplify: 5,
  affliction_transfer: 4,
  self_damage: 3,
  discard_burn: 3,
  draw_boost: 5,
  draw_reduction: 4,
};

// ─── Mana Cost Preferences ─────────────────────────────────

function aggroCostScore(cost: number): number {
  // Aggro wants cheap cards (0-3 cost)
  if (cost <= 1) return 10;
  if (cost === 2) return 9;
  if (cost === 3) return 7;
  if (cost === 4) return 4;
  if (cost === 5) return 2;
  return 1;
}

function controlCostScore(cost: number): number {
  // Control wants mid-to-high cost (2-5)
  if (cost <= 1) return 3;
  if (cost === 2) return 6;
  if (cost === 3) return 8;
  if (cost === 4) return 10;
  if (cost === 5) return 9;
  return 7;
}

function balancedCostScore(cost: number): number {
  // Balanced wants a smooth curve, slight preference for 2-4
  if (cost <= 1) return 6;
  if (cost === 2) return 8;
  if (cost === 3) return 9;
  if (cost === 4) return 8;
  if (cost === 5) return 6;
  return 4;
}

// ─── Compound Pattern Preferences ──────────────────────────

const AGGRO_PATTERN_SCORES: Partial<Record<CompoundPattern, number>> = {
  aggressive: 10,
  standard: 6,
  slowburn: 2,
};

const CONTROL_PATTERN_SCORES: Partial<Record<CompoundPattern, number>> = {
  slowburn: 10,
  standard: 7,
  aggressive: 3,
};

const BALANCED_PATTERN_SCORES: Partial<Record<CompoundPattern, number>> = {
  standard: 8,
  aggressive: 6,
  slowburn: 6,
};

// ─── Target Mode Preferences ───────────────────────────────

function aggroTargetScore(card: CardDefinition): number {
  const tm = getCardTargetMode(card);
  if (!tm) return 0;
  switch (tm.mode) {
    case "single": return 8; // Focus damage
    case "aoe": return 6;    // Splash damage
    case "duo": return 7;    // Multi-hit
    case "mixed": return 5;
    case "self": return 2;   // Aggro doesn't want pure self
    default: return 0;
  }
}

function controlTargetScore(card: CardDefinition): number {
  const tm = getCardTargetMode(card);
  if (!tm) return 0;
  switch (tm.mode) {
    case "self": return 9;   // Self-sustain is key
    case "mixed": return 8;  // Self + debuff
    case "aoe": return 7;    // Crowd control
    case "duo": return 6;
    case "single": return 4;
    default: return 0;
  }
}

function balancedTargetScore(card: CardDefinition): number {
  const tm = getCardTargetMode(card);
  if (!tm) return 0;
  switch (tm.mode) {
    case "single": return 7;
    case "aoe": return 7;
    case "mixed": return 8;
    case "duo": return 6;
    case "self": return 6;
    default: return 0;
  }
}

// ─── Tier Weighting ────────────────────────────────────────

function tierScore(tier: string): number {
  switch (tier) {
    case "epic": return 10;
    case "rare": return 7;
    case "common": return 4;
    default: return 0;
  }
}

// ─── Main Scoring Function ─────────────────────────────────

export function scoreCard(card: CardDefinition, strategy: StrategyType): number {
  let score = 0;

  // Effect scoring (sum of all effects)
  const effectScores = strategy === "aggro" ? AGGRO_EFFECT_SCORES
    : strategy === "control" ? CONTROL_EFFECT_SCORES
    : BALANCED_EFFECT_SCORES;

  card.effects.forEach((eff) => {
    score += (effectScores[eff.type] || 3) * 2; // Weight effects heavily
  });

  // Cost curve preference
  const costFn = strategy === "aggro" ? aggroCostScore
    : strategy === "control" ? controlCostScore
    : balancedCostScore;
  score += costFn(card.cost) * 1.5;

  // Compound pattern preference
  const patternScores = strategy === "aggro" ? AGGRO_PATTERN_SCORES
    : strategy === "control" ? CONTROL_PATTERN_SCORES
    : BALANCED_PATTERN_SCORES;
  score += (patternScores[card.compoundPattern] || 5) * 1;

  // Target mode preference
  const targetFn = strategy === "aggro" ? aggroTargetScore
    : strategy === "control" ? controlTargetScore
    : balancedTargetScore;
  score += targetFn(card) * 1;

  // Tier bonus
  score += tierScore(card.tier) * 0.5;

  // Skip queue bonus for aggro (fast play)
  if (card.skipQueue && strategy === "aggro") score += 5;

  return score;
}

// ─── Auto-Fill by Strategy ─────────────────────────────────

/**
 * Generate a deck of up to `maxSize` cards from the given pool,
 * optimized for the specified strategy. Excludes cards already in the deck.
 */
export function autoFillByStrategy(
  factionCards: CardDefinition[],
  existingCardIds: string[],
  strategy: StrategyType,
  maxSize: number = 30
): string[] {
  const remaining = maxSize - existingCardIds.length;
  if (remaining <= 0) return [];

  const existingSet = new Set(existingCardIds);
  const available = factionCards.filter((c) => !existingSet.has(c.id));

  // Score and sort
  const scored = available.map((card) => ({
    card,
    score: scoreCard(card, strategy),
  }));
  scored.sort((a, b) => b.score - a.score);

  // For balanced strategy, ensure diversity in the final selection
  if (strategy === "balanced") {
    return selectBalanced(scored, remaining);
  }

  return scored.slice(0, remaining).map((s) => s.card.id);
}

/**
 * Balanced selection: pick top cards but ensure at least some from each
 * target mode and cost bracket for a well-rounded deck.
 */
function selectBalanced(
  scored: { card: CardDefinition; score: number }[],
  count: number
): string[] {
  const selected: string[] = [];
  const selectedSet = new Set<string>();

  // Reserve slots for diversity: at least 2 from each target mode if available
  const byTargetMode: Record<string, typeof scored> = {};
  scored.forEach((s) => {
    const tm = getCardTargetMode(s.card)?.mode || "single";
    if (!byTargetMode[tm]) byTargetMode[tm] = [];
    byTargetMode[tm].push(s);
  });

  // Pick 2 from each target mode (if available)
  const reservePerMode = Math.min(2, Math.floor(count / 5));
  for (const mode of ["single", "aoe", "self", "duo", "mixed"]) {
    const modeCards = byTargetMode[mode] || [];
    for (let i = 0; i < Math.min(reservePerMode, modeCards.length); i++) {
      if (selected.length >= count) break;
      if (!selectedSet.has(modeCards[i].card.id)) {
        selected.push(modeCards[i].card.id);
        selectedSet.add(modeCards[i].card.id);
      }
    }
  }

  // Fill remaining slots by score
  for (const s of scored) {
    if (selected.length >= count) break;
    if (!selectedSet.has(s.card.id)) {
      selected.push(s.card.id);
      selectedSet.add(s.card.id);
    }
  }

  return selected;
}
