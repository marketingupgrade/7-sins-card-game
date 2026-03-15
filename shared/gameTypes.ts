/**
 * 7 Deadly Sins Card Game — Shared Type Definitions (v4)
 *
 * v4 Balance Overhaul (updated v5.10 — The Reckoning):
 * - ALL cards are compound-only (no flat cards)
 * - 333 HP, 20 rounds, start 2 energy +1/round (max 7), carry-over
 * - Final Reckoning at round 20: all cards in hand played, highest HP wins
 * - Defensive values scaled ×1.75 for longer, more strategic games
 * - 3 compound patterns: standard (Fibonacci), aggressive (powers of 2), slowburn
 * - 13 effect types with 4 target modes
 * - 7 faction passives tuned via Monte Carlo (15k games, max 2.9% deviation)
 * - HP increased to 333 for longer, more strategic games (v5.10)
 * - Round 16 affliction doubling mechanic
 * - Round 20 Final Reckoning mechanic (v5.10)
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
 *   energy_regen      — Gain energy over multiple rounds (self)
 *   discard_burn      — Destroy cards from target's discard pile
 *   draw_boost        — Draw extra cards per turn
 *   draw_reduction    — Draw fewer cards per turn
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
  | "affliction_transfer"
  | "discard_burn"
  | "energy_regen"
  | "draw_boost"
  | "draw_reduction";

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
  /** If true, this card resolves before normal cards in the resolution queue */
  skipQueue?: boolean;
}

// ─── Energy / Corruption System (v4) ────────────────────────
/**
 * CORRUPTION SYSTEM (v4)
 *
 * Energy is themed as "Corruption" — the fuel of sin.
 *
 * Core rules:
 * - Start with 2 energy, +1 per round (cap 7)
 * - Unspent energy carries over to next round
 * - Every card has a Corruption cost (0-6 range)
 * - Can't play a card if you don't have enough Corruption
 *
 * Sin-specific passives (v5 balanced — Monte Carlo 500K games, 1.23% max deviation):
 * - Wrath:    VENGEANCE — When taking damage, reflect 63.4% back to attacker
 * - Sloth:    ENDURANCE — Start of turn: gain shield = energy × handSize × 0.45 (cap 44)
 * - Greed:    TAX — On tick-2 of compound damage dealt, gain shield = 6.3% of damage
 * - Envy:     JEALOUSY — When dealing damage, amplify target's worst affliction by 10.6%
 * - Pride:    HUBRIS — If you played the highest-cost card this round (ties count), all your effects get ×1.324
 * - Lust:     TEMPTATION — On compound tick damage dealt, heal 25% of damage as HP
 * - Gluttony: DEVOURER — Each card burned via discard_burn grants 1.585 energy
 *
 * v5.10 — The Reckoning:
 * - HP increased from 200 to 333
 * - All defensive card base values scaled ×1.75
 * - Sloth ENDURANCE cap raised from 25 to 44 (proportional to HP increase)
 * - Final Reckoning at round 20: both players play all cards in hand, highest HP wins
 */
export const MAX_ENERGY = 7;
export const ENERGY_PER_TURN = 1; // +1 energy gained per round
export const CONSUME_ENERGY_REFUND = 1; // +1 energy when banishing a card (max 1 consume per turn)

// v5 Passive constants (tuned via combined optimizer)
export const WRATH_VENGEANCE_PCT = 0.634;
export const SLOTH_ENDURANCE_MULT = 0.45;
export const SLOTH_ENDURANCE_CAP = 44; // Scaled from 25 proportional to 333/200 HP increase
export const GREED_TAX_PCT = 0.063;
export const GREED_TAX_TICK = 2; // triggers on tick index 2
export const ENVY_JEALOUSY_PCT = 0.106;
export const PRIDE_HUBRIS_MULT = 1.324;
export const LUST_TEMPTATION_PCT = 0.25;
export const GLUTTONY_DEVOURER_ENERGY = 1.585;

// Passive info for UI tooltips
export const PASSIVE_INFO: Record<SinType, { name: string; description: string; icon: string }> = {
  wrath: { name: "VENGEANCE", description: "Strike me and feel the wound twice. Reflects damage back to the attacker.", icon: "⚔" },
  sloth: { name: "ENDURANCE", description: "Patience is armor. Generates shield each turn from stored energy and cards in hand.", icon: "🛡" },
  greed: { name: "TAX", description: "Every wound you deal fills my coffers. Damage ticks generate protective shields.", icon: "💰" },
  envy: { name: "JEALOUSY", description: "Your suffering looks good on you. Dealing damage deepens the target's worst affliction.", icon: "👁" },
  pride: { name: "HUBRIS", description: "Assert dominance. Playing the most expensive card amplifies all your effects.", icon: "👑" },
  lust: { name: "TEMPTATION", description: "Your pain is my pleasure. Damage over time heals you as it hurts them.", icon: "❤" },
  gluttony: { name: "DEVOURER", description: "Consume their arsenal. Destroying enemy cards feeds your energy.", icon: "🔥" },
};

// Legacy compat (old constants kept for any UI references)
export const WRATH_FURY_BONUS_DAMAGE = 0;
export const WRATH_FURY_HEAL = 0;
export const SLOTH_ENDURANCE_SHIELD = 1;
export const GREED_AVARICE_ENERGY = 1;
export const ENVY_JEALOUSY_AMPLIFY = 1;
export const PRIDE_HUBRIS_SHIELD = 1;
export const LUST_TEMPTATION_HEAL = 1;
export const GLUTTONY_DEVOUR_ENERGY = 1;

// Legacy compat exports (some UI components still reference these)
export const STARTING_ENERGY = 2;
export const ENERGY_PER_ROUND = 1; // +1 per round
export const SLOTH_MAX_CARRYOVER = 0; // Removed in v4
export const WRATH_OVERCHARGE_HP_COST = 0; // Removed in v4
export const WRATH_OVERCHARGE_ENERGY_GAIN = 0; // Removed in v4
export const WRATH_SIPHON_RATE = 0; // Replaced by FURY passive
export const GREED_AVARICE_COST_THRESHOLD = 0; // Replaced by steal-based trigger
export const GREED_AVARICE_BONUS = 1;
export const ENVY_COVET_BONUS = 0; // Replaced by JEALOUSY passive

export function getBaseEnergyForRound(round: number): number {
  return Math.min(STARTING_ENERGY + (round - 1) * ENERGY_PER_TURN, MAX_ENERGY);
}

// ─── Turn Phase (Simultaneous Lock-In) ──────────────────────
/**
 * Simultaneous lock-in turn system:
 *
 *   SELECTION  — All players choose cards simultaneously. Each player
 *                selects 0-N cards from hand (limited by energy). Cards
 *                are "locked in" but hidden from opponents.
 *
 *   RESOLUTION — Cards resolve one-by-one in priority order:
 *                1. Lowest HP plays first (tiebreak: lowest seat index)
 *                2. Within each player's locked cards: lowest cost first
 *                3. Skip-queue cards resolve before normal cards
 *
 *   ROUND_END  — Compound effects tick, energy refreshes, cards draw,
 *                round advances. Then back to SELECTION.
 */
export type TurnPhase = "selection" | "resolution" | "round_end";

/** A single locked-in card play (stored in games.locked_plays JSON) */
export interface LockedPlay {
  playerId: string;
  gamePlayerId: string;
  cardId: string;
  targetPlayerId?: string;
  /** Skip-queue cards resolve before normal cards */
  skipQueue?: boolean;
}

/** Selection timer duration in seconds */
export const SELECTION_TIMER_SECONDS = 30;

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
  /** Cards this player has locked in for the current selection phase */
  lockedCards: LockedPlay[];
  /** Whether this player has confirmed their selection */
  hasLockedIn: boolean;
  /** Whether this player has consumed (banished) a card this round */
  consumedThisRound: boolean;
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
  /** @deprecated Kept for backward compat. In simultaneous mode, all players act at once. */
  currentPlayerIndex: number;
  /** Current turn phase: selection → resolution → round_end → selection */
  turnPhase: TurnPhase;
  /** All locked-in plays for the current round (populated during selection, consumed during resolution) */
  lockedPlays: LockedPlay[];
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
export const STARTING_HP = 333;
export const HAND_SIZE = 5;
export const CARDS_PER_DECK = 30;
export const MAX_FACTION_CARDS = 54;
export const ROUND_16_DOUBLING = 16; // All afflictions double at round 16
export const CATCHUP_HP_THRESHOLD = 133; // 40% of 333 HP
export const FINAL_RECKONING_ROUND = 20; // Round 20: all cards in hand played, highest HP wins

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
