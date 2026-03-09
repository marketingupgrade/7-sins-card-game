/**
 * 7 Deadly Sins Card Game - Shared Type Definitions
 *
 * These types are shared between client and server to ensure
 * type safety across the entire game stack.
 */

// ─── Sin Types ───────────────────────────────────────────────
export type SinType = "wrath" | "sloth";

// ─── Card Effect Types ───────────────────────────────────────
export type EffectType = "damage" | "heal" | "shield" | "buff" | "debuff";

export type TargetType = "self" | "single_enemy" | "all_enemies" | "random_enemy";

export interface CardEffect {
  type: EffectType;
  baseValue: number;
  /** How many rounds this effect persists. 0 = instant */
  duration: number;
  target: TargetType;
  /** Optional description override for narrator */
  narratorText?: string;
}

// ─── Card Definition ─────────────────────────────────────────
export interface CardDefinition {
  id: string;
  name: string;
  sin: SinType;
  /** Mana/energy cost to play */
  cost: number;
  effects: CardEffect[];
  /** Flavor text shown on card */
  flavorText: string;
  /** Sassy narrator quip when played */
  narratorQuip: string;
  /** Visual tier for card border styling */
  tier: "common" | "rare" | "epic";
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
  hand: string[]; // card IDs
  deckSize: number;
  discardSize: number;
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

// ─── Compounding Mechanic ────────────────────────────────────
/**
 * The core compounding formula:
 * Effective Value = Base Value × Current Round
 * Maximum round cap: 10
 */
export const MAX_ROUNDS = 10;
export const STARTING_HP = 25;
export const HAND_SIZE = 5;
export const CARDS_PER_DECK = 10;

export function calculateEffectiveValue(baseValue: number, currentRound: number): number {
  const cappedRound = Math.min(currentRound, MAX_ROUNDS);
  return baseValue * cappedRound;
}
