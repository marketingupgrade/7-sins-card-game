/**
 * 7 Deadly Sins Card Game — Shared Type Definitions (v4)
 *
 * v4 Balance Overhaul:
 * - ALL cards are compound-only (no flat cards)
 * - 50 HP, 20 rounds, 3 energy/turn (fixed, no ramp)
 * - 3 compound patterns: standard (Fibonacci), aggressive (powers of 2), slowburn
 * - 13 effect types with 4 target modes
 * - 7 faction passives tuned via Monte Carlo (15k games, max 2.9% deviation)
 * - Round 16 affliction doubling mechanic
 *
 * These types are shared between client and server to ensure
 * type safety across the entire game stack.
 */

// ─── Sin Types ───────────────────────────────────────────────
export type SinType = "wrath" | "sloth" | "greed" | "envy" | "pride" | "lust" | "gluttony";

// ─── Effect Types (v4) ──────────────────────────────────────
/**
 * 13 effect types covering damage, healing, shielding, energy, and control:
 *
 * OFFENSIVE:
 *   damage           — Deal compound damage to target(s)
 *   self_damage       — Deal compound damage to self (Wrath specialty)
 *   affliction_amplify — Increase base value of target's worst affliction
 *   affliction_transfer — Move your worst affliction to a target
 *
 * DEFENSIVE:
 *   heal_gain         — Heal self over time (compound)
 *   shield_gain       — Gain shield over time (compound)
 *
 * STEAL (offensive + defensive):
 *   heal_steal        — Steal HP from target (instant, damage + heal)
 *   shield_steal      — Steal shield from target (instant)
 *   energy_steal      — Steal energy from target (instant)
 *
 * CONTROL (debuffs):
 *   heal_block        — Prevent target from healing for N rounds
 *   shield_block      — Prevent target from gaining shield for N rounds
 *   energy_block      — Prevent target from gaining energy for N rounds
 *
 * UTILITY:
 *   energy_gain       — Gain energy instantly (self)
 */
export type EffectType =
  | "damage"
  | "self_damage"
  | "heal_gain"
  | "heal_steal"
  | "heal_block"
  | "shield_gain"
  | "shield_steal"
  | "shield_block"
  | "energy_gain"
  | "energy_steal"
  | "energy_block"
  | "affliction_amplify"
  | "affliction_transfer";

// ─── Target Modes (v4) ──────────────────────────────────────
/**
 * 4 target modes:
 *   single — Targets lowest-HP enemy (default)
 *   duo    — Targets 2 lowest-HP enemies
 *   aoe    — Targets all enemies
 *   self   — Targets the caster
 */
export type TargetMode = "single" | "duo" | "aoe" | "self";

// ─── Compound Patterns (v4) ─────────────────────────────────
/**
 * 3 compound tick patterns that determine how effects scale over their duration:
 *
 *   standard:   Fibonacci [1,1,2,3,5,8,13,21,34,55] — balanced scaling
 *   aggressive: Powers of 2 [1,2,4,8,16,32,...] — explosive growth
 *   slowburn:   Flat-ish [1,1,1,1,2,2,3,3,4,5] — consistent pressure
 *
 * Each tick, the effect value = baseValue * pattern[tickIndex].
 * Duration determines how many ticks occur.
 */
export type CompoundPattern = "standard" | "aggressive" | "slowburn";

export const COMPOUND_TICKS: Record<CompoundPattern, readonly number[]> = {
  standard: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
  aggressive: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
  slowburn: [1, 1, 1, 1, 2, 2, 3, 3, 4, 5],
};

/**
 * Get the tick multiplier for a compound pattern at a given round index.
 * @param pattern The compound pattern type
 * @param tickIndex 0-based tick index
 */
export function getCompoundTick(pattern: CompoundPattern, tickIndex: number): number {
  const ticks = COMPOUND_TICKS[pattern];
  if (tickIndex < 0) return 0;
  return ticks[Math.min(tickIndex, ticks.length - 1)];
}

/**
 * Calculate the value of a compound effect at a specific tick.
 * @param baseValue The card's base value
 * @param pattern The compound pattern
 * @param tickIndex 0-based tick index
 */
export function getCompoundTickValue(baseValue: number, pattern: CompoundPattern, tickIndex: number): number {
  return Math.round(baseValue * getCompoundTick(pattern, tickIndex));
}

// Legacy compat: old 3-tick Fibonacci [1,1,2] — used by some UI components
export const COMPOUND_MULTIPLIERS = [1, 1, 2] as const;
export const COMPOUND_DURATION = 3;
export const COMPOUND_TOTAL_MULT = 4;

// ─── Card Effect (v4) ───────────────────────────────────────
export interface CardEffect {
  type: EffectType;
  baseValue: number;
  /** How many rounds this effect ticks. Minimum 1. */
  duration: number;
  /** Who this effect targets */
  targetMode: TargetMode;
  /** Optional description override for narrator */
  narratorText?: string;
}

// ─── Card Tier ──────────────────────────────────────────────
export type CardTier = "common" | "rare" | "epic";

// ─── Card Definition (v4) ───────────────────────────────────
/**
 * ALL cards are compound. No flat cards exist in v4.
 *
 * Each card has:
 * - A compound pattern (standard/aggressive/slowburn) that determines tick scaling
 * - One or more effects, each with its own duration and target mode
 * - A corruption (energy) cost
 * - A tier for visual styling
 */
export interface CardDefinition {
  id: string;
  name: string;
  sin: SinType;
  /** Corruption (energy) cost to play */
  cost: number;
  /** Compound tick pattern */
  compoundPattern: CompoundPattern;
  /** Card effects — all compound, tick according to compoundPattern */
  effects: CardEffect[];
  /** Short description shown on card */
  description: string;
  /** Visual tier for card border styling */
  tier: CardTier;
}

// ─── Energy / Corruption System (v4) ────────────────────────
/**
 * CORRUPTION SYSTEM (v4)
 *
 * Energy is themed as "Corruption" — the fuel of sin.
 *
 * Core rules:
 * - Fixed 3 energy per turn (no ramp, no cap increase)
 * - Full refresh each turn — "use it or lose it"
 * - Every card has a Corruption cost (0-6 range)
 * - Can't play a card if you don't have enough Corruption
 *
 * Sin-specific passives (v4 balanced):
 * - Wrath:    FURY — Self-damage cards deal +3 bonus damage to target AND heal 2 HP
 * - Sloth:    ENDURANCE — Taking compound damage grants +1 shield
 * - Greed:    AVARICE — Steal-type cards grant +1 energy
 * - Envy:     JEALOUSY — Damage cards amplify target's worst affliction by +1
 * - Pride:    HUBRIS — 0-cost cards grant +1 shield
 * - Lust:     TEMPTATION — Single-target damage heals self for +1 HP
 * - Gluttony: DEVOUR — AoE cards grant +1 energy
 */
export const MAX_ENERGY = 3;
export const ENERGY_PER_TURN = 3; // Fixed, no ramp

// Passive constants
export const WRATH_FURY_BONUS_DAMAGE = 3;
export const WRATH_FURY_HEAL = 2;
export const SLOTH_ENDURANCE_SHIELD = 1;
export const GREED_AVARICE_ENERGY = 1;
export const ENVY_JEALOUSY_AMPLIFY = 1;
export const PRIDE_HUBRIS_SHIELD = 1;
export const LUST_TEMPTATION_HEAL = 1;
export const GLUTTONY_DEVOUR_ENERGY = 1;

// Legacy compat exports (some UI components still reference these)
export const STARTING_ENERGY = 3;
export const ENERGY_PER_ROUND = 0; // No ramp in v4
export const SLOTH_MAX_CARRYOVER = 0; // Removed in v4
export const WRATH_OVERCHARGE_HP_COST = 0; // Removed in v4
export const WRATH_OVERCHARGE_ENERGY_GAIN = 0; // Removed in v4
export const WRATH_SIPHON_RATE = 0; // Replaced by FURY passive
export const GREED_AVARICE_COST_THRESHOLD = 0; // Replaced by steal-based trigger
export const GREED_AVARICE_BONUS = 1;
export const ENVY_COVET_BONUS = 0; // Replaced by JEALOUSY passive

export function getBaseEnergyForRound(_round: number): number {
  return MAX_ENERGY; // Fixed 3 energy per turn in v4
}

// ─── Game State ──────────────────────────────────────────────
export type GameStatus = "lobby" | "draft" | "active" | "finished";

export interface PlayerState {
  id: string;
  gamePlayerId: string;
  username: string;
  seatIndex: number;
  chosenSin: SinType | null;
  currentHp: number;
  maxHp: number;
  isAlive: boolean;
  hand: string[];
  deckSize: number;
  discardSize: number;
  currentEnergy: number;
  maxEnergy: number;
  bonusEnergy: number;
}

export interface ActiveEffect {
  id: string;
  targetPlayerId: string;
  sourcePlayerId: string;
  effectType: EffectType;
  baseValue: number;
  appliedAtRound: number;
  durationRounds: number;
  cardId: string;
  /** For compound effects: which tick we're on (0-based) */
  currentTick?: number;
  /** Compound pattern for tick scaling */
  compoundPattern?: CompoundPattern;
  /** Whether this affliction has been doubled (round 16+) */
  doubled?: boolean;
}

export interface GameState {
  id: string;
  roomCode: string;
  status: GameStatus;
  currentRound: number;
  currentPlayerIndex: number;
  players: PlayerState[];
  activeEffects: ActiveEffect[];
  winnerId: string | null;
}

// ─── Game Actions ────────────────────────────────────────────
export interface PlayCardAction {
  cardId: string;
  targetPlayerId?: string;
}

export interface GameLogEntry {
  id: string;
  playerId: string;
  actionType: string;
  actionData: Record<string, unknown>;
  roundNumber: number;
  timestamp: number;
}

// ─── Game Constants (v4) ────────────────────────────────────
export const MAX_ROUNDS = 20;
export const STARTING_HP = 50;
export const HAND_SIZE = 5;
export const CARDS_PER_DECK = 36;
export const ROUND_16_DOUBLING = 16; // All afflictions double at round 16
export const CATCHUP_HP_THRESHOLD = 20; // 40% of 50 HP

/**
 * @deprecated Use getCompoundTickValue() with pattern for compound cards.
 */
export function calculateEffectiveValue(baseValue: number, _currentRound: number): number {
  return Math.round(baseValue);
}

// ─── Catch-Up Mechanic (legacy compat) ──────────────────────
export type CatchupCondition =
  | "hp_less_than_target"
  | "hp_less_than_any_opponent"
  | "hp_below_threshold"
  | "hp_lowest";

export interface CatchupEffect {
  type: "bonus_damage" | "bonus_heal" | "bonus_debuff_all";
  bonusValue: number;
  bonusDuration?: number;
  condition: CatchupCondition;
}

// Legacy type aliases for backward compatibility
export type CardType = "compounding"; // All cards are compound in v4
export type TargetType = TargetMode; // Alias
