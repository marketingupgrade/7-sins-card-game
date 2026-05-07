/**
 * Boss-only twist cards for Campaign mode.
 *
 * These cards never appear in PvP decks. They live in `BOSS_CARDS`, are
 * looked up via `getCardById` (which checks both regular faction decks and
 * this list), and are seeded into a boss's `custom_deck_ids` exactly once
 * per mission so the boss can play them at most once.
 *
 * IDs are namespaced `boss_{sin}_{act}_{slug}` to guarantee no collision
 * with the 424 PvP cards.
 *
 * Authoring guidelines:
 * - Single-use within a deck (only one copy in the boss's 30-card deck)
 * - Use existing EffectType values so no engine changes are needed
 * - `tier: "epic"` so the card frame visually telegraphs the threat
 * - Compound `duration: 1` for "one big hit" twists, or longer for DoT bosses
 */

import type { CardDefinition } from "./gameTypes";

export const BOSS_CARDS: CardDefinition[] = [
  // ─── Wrath Act 1 — The Forge ─────────────────────────────────
  {
    id: "boss_wrath_1_hammerfall",
    name: "Hammerfall",
    sin: "wrath",
    cost: 4,
    tier: "epic",
    compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 38, duration: 1, targetMode: "single" }],
    description: "The Forgemaster brings the hammer down. One blow. One ruin.",
  },

  // ─── Wrath Act 2 — The Berserker ─────────────────────────────
  {
    id: "boss_wrath_2_bloodroar",
    name: "Blood Roar",
    sin: "wrath",
    cost: 3,
    tier: "epic",
    compoundPattern: "standard",
    effects: [
      { type: "damage", baseValue: 18, duration: 3, targetMode: "single" },
      { type: "heal_steal", baseValue: 10, duration: 3, targetMode: "single" },
    ],
    description: "Vex drinks the wound. Every hit feeds the next.",
  },

  // ─── Wrath Act 3 — The Apostate ──────────────────────────────
  {
    id: "boss_wrath_3_finalhour",
    name: "Final Hour",
    sin: "wrath",
    cost: 5,
    tier: "epic",
    compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 32, duration: 2, targetMode: "single" }],
    description: "Erebus burns through faith and flesh alike. Two strikes. Each louder than the last.",
  },

  // ─── Sloth Act 1 — The Cell ──────────────────────────────────
  {
    id: "boss_sloth_1_ironpatience",
    name: "Iron Patience",
    sin: "sloth",
    cost: 4,
    tier: "epic",
    compoundPattern: "slowburn",
    effects: [
      { type: "shield_gain", baseValue: 28, duration: 3, targetMode: "self" },
      { type: "heal_block", baseValue: 12, duration: 2, targetMode: "single" },
    ],
    description: "The Anchorite has not moved in ten years. He is not about to start now.",
  },

  // ─── Sloth Act 2 — The Drowsing ──────────────────────────────
  {
    id: "boss_sloth_2_drowse",
    name: "Drowse",
    sin: "sloth",
    cost: 3,
    tier: "epic",
    compoundPattern: "standard",
    effects: [
      { type: "energy_block", baseValue: 2, duration: 3, targetMode: "single" },
      { type: "heal_gain", baseValue: 14, duration: 3, targetMode: "self" },
    ],
    description: "Mother Slumber breathes once. The room exhales with her.",
  },

  // ─── Sloth Act 3 — The Eternal ───────────────────────────────
  {
    id: "boss_sloth_3_aeon",
    name: "Aeon's Indifference",
    sin: "sloth",
    cost: 5,
    tier: "epic",
    compoundPattern: "slowburn",
    effects: [
      { type: "shield_gain", baseValue: 36, duration: 4, targetMode: "self" },
      { type: "damage", baseValue: 9, duration: 4, targetMode: "single" },
    ],
    description: "The Eternal has watched empires rise. Yours is small, brief, and predictable.",
  },

  // ─── Greed Act 1 — The Counting House ────────────────────────
  {
    id: "boss_greed_1_tithe",
    name: "Tithe",
    sin: "greed",
    cost: 3,
    tier: "epic",
    compoundPattern: "standard",
    effects: [
      { type: "heal_steal", baseValue: 12, duration: 3, targetMode: "single" },
      { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "single" },
    ],
    description: "The clerk does not strike. He reckons. He notes. He bills.",
  },

  // ─── Greed Act 2 — The Vault ─────────────────────────────────
  {
    id: "boss_greed_2_ledger_strike",
    name: "Ledger Strike",
    sin: "greed",
    cost: 4,
    tier: "epic",
    compoundPattern: "aggressive",
    effects: [
      { type: "damage", baseValue: 20, duration: 2, targetMode: "single" },
      { type: "heal_steal", baseValue: 10, duration: 2, targetMode: "single" },
    ],
    description: "Octavia closes the book. Whatever you spent on this fight comes due now.",
  },

  // ─── Greed Act 3 — The Plutarch ──────────────────────────────
  {
    id: "boss_greed_3_liquidation",
    name: "Liquidation",
    sin: "greed",
    cost: 5,
    tier: "epic",
    compoundPattern: "aggressive",
    effects: [
      { type: "damage", baseValue: 22, duration: 2, targetMode: "single" },
      { type: "heal_steal", baseValue: 16, duration: 2, targetMode: "single" },
    ],
    description: "Cassivus does not negotiate. He liquidates.",
  },

  // ─── Envy Act 1 — The Mirror ─────────────────────────────────
  {
    id: "boss_envy_1_glasswork",
    name: "Glass Work",
    sin: "envy",
    cost: 3,
    tier: "epic",
    compoundPattern: "standard",
    effects: [
      { type: "shield_steal", baseValue: 12, duration: 3, targetMode: "single" },
      { type: "heal_steal", baseValue: 8, duration: 3, targetMode: "single" },
    ],
    description: "The Mirror takes what you wore in. Smile through it.",
  },

  // ─── Envy Act 2 — The Twin ───────────────────────────────────
  {
    id: "boss_envy_2_replica",
    name: "Replica",
    sin: "envy",
    cost: 4,
    tier: "epic",
    compoundPattern: "aggressive",
    effects: [
      { type: "damage", baseValue: 18, duration: 2, targetMode: "single" },
      { type: "shield_steal", baseValue: 12, duration: 2, targetMode: "single" },
    ],
    description: "The Twin learned this from you. They learned it better.",
  },

  // ─── Envy Act 3 — The Hollow ─────────────────────────────────
  {
    id: "boss_envy_3_inheritance",
    name: "Inheritance",
    sin: "envy",
    cost: 5,
    tier: "epic",
    compoundPattern: "standard",
    effects: [
      { type: "shield_steal", baseValue: 18, duration: 3, targetMode: "single" },
      { type: "heal_steal", baseValue: 12, duration: 3, targetMode: "single" },
    ],
    description: "The Hollow takes everything you have, including the parts you didn't know you had.",
  },

  // ─── Pride Act 1 — The Throne ────────────────────────────────
  {
    id: "boss_pride_1_coronation",
    name: "Coronation",
    sin: "pride",
    cost: 3,
    tier: "epic",
    compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 24, duration: 1, targetMode: "single" }],
    description: "The Boy-King has one good speech. This is the part where it lands.",
  },

  // ─── Pride Act 2 — The Idol ──────────────────────────────────
  {
    id: "boss_pride_2_apotheosis",
    name: "Apotheosis",
    sin: "pride",
    cost: 4,
    tier: "epic",
    compoundPattern: "aggressive",
    effects: [
      { type: "damage", baseValue: 26, duration: 2, targetMode: "single" },
      { type: "shield_gain", baseValue: 14, duration: 2, targetMode: "self" },
    ],
    description: "The Idol does not flinch. The Idol sets the standard.",
  },

  // ─── Pride Act 3 — The Apex ──────────────────────────────────
  {
    id: "boss_pride_3_unbroken",
    name: "Unbroken",
    sin: "pride",
    cost: 5,
    tier: "epic",
    compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 34, duration: 2, targetMode: "single" }],
    description: "Apex has not lost. Apex will not start with you.",
  },
];

const BOSS_CARD_MAP: Record<string, CardDefinition> = Object.fromEntries(
  BOSS_CARDS.map((c) => [c.id, c])
);

/** Look up a boss-only card by ID. Returns undefined for non-boss IDs. */
export function getBossCardById(id: string): CardDefinition | undefined {
  return BOSS_CARD_MAP[id];
}
