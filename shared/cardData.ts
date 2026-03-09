/**
 * Card Data Definitions for 7 Deadly Sins Card Game
 *
 * MVP includes two sins: Wrath (aggressive burst) and Sloth (defensive stall).
 * Each sin has exactly 10 cards forming a complete deck.
 *
 * Design Philosophy:
 * - Wrath: High damage, self-harm, aggressive tempo. Wants to end games fast.
 * - Sloth: Shields, heals, DoTs, debuffs. Wants to stall and let compounding do the work.
 */

import { CardDefinition } from "./gameTypes";

// ─── WRATH CARDS (10) ────────────────────────────────────────
// Theme: Blood red fury, explosive damage, reckless aggression
export const WRATH_CARDS: CardDefinition[] = [
  {
    id: "wrath_01",
    name: "Fury Strike",
    sin: "wrath",
    cost: 1,
    effects: [{ type: "damage", baseValue: 3, duration: 0, target: "single_enemy" }],
    flavorText: "A fist clenched so hard it draws its own blood.",
    narratorQuip: "Oh, how delightfully... violent.",
    tier: "common",
  },
  {
    id: "wrath_02",
    name: "Blind Rage",
    sin: "wrath",
    cost: 2,
    effects: [
      { type: "damage", baseValue: 4, duration: 0, target: "single_enemy" },
      { type: "damage", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Rage doesn't care who it hurts. Even you.",
    narratorQuip: "Hitting yourself? Bold strategy, let's see if it pays off.",
    tier: "common",
  },
  {
    id: "wrath_03",
    name: "Blood Boil",
    sin: "wrath",
    cost: 2,
    effects: [{ type: "damage", baseValue: 2, duration: 2, target: "single_enemy" }],
    flavorText: "Their veins run hot with borrowed fury.",
    narratorQuip: "A slow burn. How uncharacteristically patient of you.",
    tier: "rare",
  },
  {
    id: "wrath_04",
    name: "Berserker's Howl",
    sin: "wrath",
    cost: 3,
    effects: [{ type: "damage", baseValue: 2, duration: 0, target: "all_enemies" }],
    flavorText: "The scream that silences a battlefield.",
    narratorQuip: "Everyone gets a piece! How generous of our little rage monster.",
    tier: "rare",
  },
  {
    id: "wrath_05",
    name: "Crimson Slash",
    sin: "wrath",
    cost: 1,
    effects: [{ type: "damage", baseValue: 2, duration: 0, target: "single_enemy" }],
    flavorText: "Quick. Clean. Well, not clean exactly.",
    narratorQuip: "Efficient. I'm almost impressed.",
    tier: "common",
  },
  {
    id: "wrath_06",
    name: "Vendetta",
    sin: "wrath",
    cost: 2,
    effects: [
      { type: "damage", baseValue: 5, duration: 0, target: "single_enemy" },
      { type: "damage", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "Revenge is a dish best served... scalding.",
    narratorQuip: "That's going to leave a mark. On both of you.",
    tier: "epic",
  },
  {
    id: "wrath_07",
    name: "Rage Shield",
    sin: "wrath",
    cost: 2,
    effects: [{ type: "shield", baseValue: 2, duration: 1, target: "self" }],
    flavorText: "Even fury needs a moment to breathe.",
    narratorQuip: "Defense? From the anger child? I'm shocked. SHOCKED.",
    tier: "common",
  },
  {
    id: "wrath_08",
    name: "Burning Hatred",
    sin: "wrath",
    cost: 3,
    effects: [{ type: "damage", baseValue: 3, duration: 3, target: "single_enemy" }],
    flavorText: "Hatred that lingers long after the blow.",
    narratorQuip: "Three rounds of suffering. You really know how to hold a grudge.",
    tier: "epic",
  },
  {
    id: "wrath_09",
    name: "Reckless Charge",
    sin: "wrath",
    cost: 1,
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "random_enemy" },
    ],
    flavorText: "Who needs aim when you have momentum?",
    narratorQuip: "Closing your eyes and swinging. Classic wrath.",
    tier: "common",
  },
  {
    id: "wrath_10",
    name: "Apocalypse Fist",
    sin: "wrath",
    cost: 4,
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "all_enemies" },
      { type: "damage", baseValue: 3, duration: 0, target: "self" },
    ],
    flavorText: "The final argument in any debate.",
    narratorQuip: "Nuclear option deployed. Mutually assured destruction never looked so fun.",
    tier: "epic",
  },
];

// ─── SLOTH CARDS (10) ────────────────────────────────────────
// Theme: Muted purple lethargy, shields, stalling, passive damage
export const SLOTH_CARDS: CardDefinition[] = [
  {
    id: "sloth_01",
    name: "Drowsy Touch",
    sin: "sloth",
    cost: 1,
    effects: [{ type: "debuff", baseValue: 1, duration: 2, target: "single_enemy" }],
    flavorText: "A yawn so contagious it weakens the soul.",
    narratorQuip: "How exciting. They're... slightly sleepier now.",
    tier: "common",
  },
  {
    id: "sloth_02",
    name: "Pillow Fort",
    sin: "sloth",
    cost: 2,
    effects: [{ type: "shield", baseValue: 3, duration: 2, target: "self" }],
    flavorText: "The ultimate defense: not caring enough to get hit.",
    narratorQuip: "Ah yes, the impenetrable fortress of apathy.",
    tier: "rare",
  },
  {
    id: "sloth_03",
    name: "Lazy Drain",
    sin: "sloth",
    cost: 2,
    effects: [
      { type: "damage", baseValue: 1, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Why generate your own energy when you can borrow theirs?",
    narratorQuip: "Stealing life force. The laziest form of sustenance.",
    tier: "common",
  },
  {
    id: "sloth_04",
    name: "Procrastination",
    sin: "sloth",
    cost: 1,
    effects: [{ type: "shield", baseValue: 2, duration: 1, target: "self" }],
    flavorText: "I'll deal with that... eventually.",
    narratorQuip: "Putting off damage. Truly on brand.",
    tier: "common",
  },
  {
    id: "sloth_05",
    name: "Entropy Wave",
    sin: "sloth",
    cost: 3,
    effects: [{ type: "damage", baseValue: 1, duration: 3, target: "all_enemies" }],
    flavorText: "Everything decays. Sloth just... accelerates the inevitable.",
    narratorQuip: "Slow, inevitable doom for everyone. How very sloth of you.",
    tier: "epic",
  },
  {
    id: "sloth_06",
    name: "Hibernate",
    sin: "sloth",
    cost: 3,
    effects: [{ type: "heal", baseValue: 3, duration: 2, target: "self" }],
    flavorText: "Sometimes the best strategy is a really long nap.",
    narratorQuip: "Sleeping through the apocalypse. Respect.",
    tier: "rare",
  },
  {
    id: "sloth_07",
    name: "Lethargy Aura",
    sin: "sloth",
    cost: 2,
    effects: [{ type: "debuff", baseValue: 2, duration: 2, target: "single_enemy" }],
    flavorText: "Your muscles feel like wet concrete.",
    narratorQuip: "Making others as lazy as you. Misery loves company.",
    tier: "rare",
  },
  {
    id: "sloth_08",
    name: "Passive Resistance",
    sin: "sloth",
    cost: 1,
    effects: [
      { type: "shield", baseValue: 1, duration: 1, target: "self" },
      { type: "damage", baseValue: 1, duration: 0, target: "single_enemy" },
    ],
    flavorText: "Not fighting back IS the strategy.",
    narratorQuip: "Defending and poking. The bare minimum, as always.",
    tier: "common",
  },
  {
    id: "sloth_09",
    name: "Time Crawl",
    sin: "sloth",
    cost: 2,
    effects: [{ type: "debuff", baseValue: 1, duration: 3, target: "single_enemy" }],
    flavorText: "Time moves slower when you're bored to death.",
    narratorQuip: "Three rounds of existential ennui. Devastating.",
    tier: "common",
  },
  {
    id: "sloth_10",
    name: "Eternal Rest",
    sin: "sloth",
    cost: 4,
    effects: [
      { type: "heal", baseValue: 5, duration: 0, target: "self" },
      { type: "shield", baseValue: 3, duration: 2, target: "self" },
    ],
    flavorText: "The deepest sleep grants the strongest armor.",
    narratorQuip: "Full heal AND a shield? That's disgustingly defensive. I love it.",
    tier: "epic",
  },
];

// ─── Card Registry ───────────────────────────────────────────
export const ALL_CARDS: CardDefinition[] = [...WRATH_CARDS, ...SLOTH_CARDS];

export const CARD_MAP: Record<string, CardDefinition> = {};
ALL_CARDS.forEach((card) => {
  CARD_MAP[card.id] = card;
});

export function getCardById(id: string): CardDefinition | undefined {
  return CARD_MAP[id];
}

export function getDeckForSin(sin: "wrath" | "sloth"): string[] {
  const cards = sin === "wrath" ? WRATH_CARDS : SLOTH_CARDS;
  return cards.map((c) => c.id);
}

// ─── Narrator Lines ──────────────────────────────────────────
export const NARRATOR_LINES = {
  gameStart: [
    "Welcome, sinners. Let the suffering begin.",
    "Four souls enter. One leaves slightly less damaged.",
    "Oh good, you're all here. Let's get this over with.",
  ],
  roundStart: [
    "Round {round}. The stakes compound. Your regrets multiply.",
    "Round {round}. Things are about to get... exponentially worse.",
    "Round {round}. Remember when this seemed like a good idea?",
  ],
  playerEliminated: [
    "{player} has been removed from the equation. How tidy.",
    "And {player} is done. One less sinner to worry about.",
    "{player} exits stage left. Permanently.",
  ],
  gameEnd: [
    "{winner} wins! Everyone else can cry about it.",
    "Congratulations, {winner}. You're the least dead.",
    "{winner} stands victorious. The rest of you... well.",
  ],
  pass: [
    "{player} passes. Riveting gameplay.",
    "{player} does nothing. Bold.",
    "A pass from {player}. The crowd goes mild.",
  ],
};
