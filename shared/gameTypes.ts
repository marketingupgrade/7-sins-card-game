/**
 * 7 Deadly Sins Card Game - Shared Type Definitions
 *
 * These types are shared between client and server to ensure
 * type safety across the entire game stack.
 */

// ─── Sin Types ───────────────────────────────────────────────
export type SinType = "wrath" | "sloth" | "greed" | "envy";

// ─── Card Effect Types ───────────────────────────────────────
export type EffectType = "damage" | "heal" | "shield" | "buff" | "debuff" | "energy_drain" | "energy_gain";

export type TargetType = "self" | "single_enemy" | "all_enemies" | "random_enemy";

export interface CardEffect {
  type: EffectType;
  baseValue: number;
  /** How many rounds this effect persists. 0 = instant (flat cards only) */
  duration: number;
  target: TargetType;
  /** Optional description override for narrator */
  narratorText?: string;
}

// ─── Catch-Up Mechanic ───────────────────────────────────────
export type CatchupCondition = 
  | "hp_less_than_target"      // Player HP < target's HP
  | "hp_less_than_any_opponent" // Player HP < any living opponent's HP
  | "hp_below_threshold"       // Player HP <= CATCHUP_HP_THRESHOLD
  | "hp_lowest";               // Player has the lowest HP among all living players

export interface CatchupEffect {
  type: "bonus_damage" | "bonus_heal" | "bonus_debuff_all";
  bonusValue: number;
  /** Duration for bonus_debuff_all */
  bonusDuration?: number;
  condition: CatchupCondition;
}

// ─── Card Type ───────────────────────────────────────────────
/**
 * FLAT: One-time powerful effect. Resolves immediately, no duration.
 * COMPOUNDING: Weaker base but ticks for 3 rounds with Fibonacci escalation [1×, 1×, 2×].
 *   - Round 1: base × 1 (pay corruption cost)
 *   - Round 2: base × 1 (free)
 *   - Round 3: base × 2 (free, the payoff)
 *   - Total value = base × 4 over 3 rounds
 */
export type CardType = "flat" | "compounding";

// ─── Card Definition ─────────────────────────────────────────
export interface CardDefinition {
  id: string;
  name: string;
  sin: SinType;
  /** Corruption (energy) cost to play */
  cost: number;
  /** Whether this card is flat (instant) or compounding (3-round escalating) */
  cardType: CardType;
  /** Effects for flat cards (instant resolution) */
  effects: CardEffect[];
  /** Flavor text shown on card */
  flavorText: string;
  /** Sassy narrator quip when played */
  narratorQuip: string;
  /** Visual tier for card border styling */
  tier: "common" | "rare" | "epic";
  /** Optional catch-up mechanic — bonus when player is behind */
  catchup?: CatchupEffect;
}

// ─── Compounding Mechanic ────────────────────────────────────
/**
 * FIBONACCI COMPOUNDING SYSTEM
 *
 * Compounding cards tick for exactly 3 rounds with escalating multipliers.
 * The Fibonacci pattern [1, 1, 2] creates a "slow build to payoff" feel:
 *   - Tick 1: base × 1 (initial hit)
 *   - Tick 2: base × 1 (same pressure)
 *   - Tick 3: base × 2 (double payoff)
 *
 * Total value = base × (1 + 1 + 2) = base × 4
 *
 * This applies to ALL effect types: damage, heal, shield, debuff, etc.
 * Only pay corruption cost on the round the card is played.
 */
export const COMPOUND_MULTIPLIERS = [1, 1, 2] as const;
export const COMPOUND_DURATION = 3;
export const COMPOUND_TOTAL_MULT = 4; // sum of [1, 1, 2]

/**
 * Get the multiplier for a specific tick of a compounding effect.
 * @param tickIndex 0-based index (0 = first tick, 1 = second, 2 = third)
 */
export function getCompoundMultiplier(tickIndex: number): number {
  if (tickIndex < 0 || tickIndex >= COMPOUND_DURATION) return 0;
  return COMPOUND_MULTIPLIERS[tickIndex];
}

/**
 * Calculate the value of a compounding effect at a specific tick.
 * @param baseValue The card's base value
 * @param tickIndex 0-based tick index (0, 1, or 2)
 */
export function getCompoundTickValue(baseValue: number, tickIndex: number): number {
  return Math.round(baseValue * getCompoundMultiplier(tickIndex));
}

// ─── Energy / Corruption System ─────────────────────────────
/**
 * CORRUPTION SYSTEM
 *
 * Energy is themed as "Corruption" — the fuel of sin.
 *
 * Core rules:
 * - Start at 2 Corruption, gain +1 per round, cap at 7 (7 deadly sins)
 * - Full refresh each turn — "use it or lose it"
 * - Every card has a Corruption cost (0-5 range)
 * - Can't play a card if you don't have enough Corruption
 *
 * Sin-specific passives:
 * - Wrath: OVERCHARGE - Burn 2 HP to gain +1 energy (active ability)
 * - Sloth: LETHARGY - Unspent energy carries over (max +2 bonus)
 * - Greed: AVARICE - Playing a card that costs 3+ grants +1 bonus energy next turn
 * - Envy: COVET - At start of turn, if any opponent has more HP, gain +1 bonus energy
 */
export const STARTING_ENERGY = 2;
export const MAX_ENERGY = 7;
export const ENERGY_PER_ROUND = 1;
export const SLOTH_MAX_CARRYOVER = 2;
export const WRATH_OVERCHARGE_HP_COST = 2;
export const WRATH_OVERCHARGE_ENERGY_GAIN = 1;
export const GREED_AVARICE_COST_THRESHOLD = 3;
export const GREED_AVARICE_BONUS = 1;
export const ENVY_COVET_BONUS = 1;

export function getBaseEnergyForRound(round: number): number {
  return Math.min(STARTING_ENERGY + (round - 1) * ENERGY_PER_ROUND, MAX_ENERGY);
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
  /** For compounding effects: which tick we're on (0, 1, or 2) */
  currentTick?: number;
  /** Whether this is a compounding effect */
  isCompounding?: boolean;
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

// ─── Game Constants ─────────────────────────────────────────
export const MAX_ROUNDS = 10;
export const STARTING_HP = 25;
export const HAND_SIZE = 5;
export const CARDS_PER_DECK = 36;
export const CATCHUP_HP_THRESHOLD = 10; // 40% of 25 HP

/**
 * @deprecated Use getCompoundTickValue() for compounding cards.
 * Flat cards use baseValue directly with no round multiplier.
 */
export function calculateEffectiveValue(baseValue: number, _currentRound: number): number {
  return Math.round(baseValue);
}
