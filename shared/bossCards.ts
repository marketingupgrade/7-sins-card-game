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

  // ─── Lust Act 1 — The Salon ──────────────────────────────────
  {
    id: "boss_lust_1_silver_tongue",
    name: "Silver Tongue",
    sin: "lust",
    cost: 3,
    tier: "epic",
    compoundPattern: "standard",
    effects: [
      { type: "damage", baseValue: 13, duration: 3, targetMode: "single" },
      { type: "heal_steal", baseValue: 9, duration: 3, targetMode: "single" },
    ],
    description: "Vaela compliments you, intricately, while she takes your blood.",
  },

  // ─── Lust Act 2 — The Snare ──────────────────────────────────
  {
    id: "boss_lust_2_snare",
    name: "Snare",
    sin: "lust",
    cost: 4,
    tier: "epic",
    compoundPattern: "aggressive",
    effects: [
      { type: "damage", baseValue: 17, duration: 2, targetMode: "single" },
      { type: "heal_steal", baseValue: 14, duration: 2, targetMode: "single" },
    ],
    description: "Lyssara is patient. Lyssara is gentle. Lyssara is feeding.",
  },

  // ─── Lust Act 3 — The Devourer ───────────────────────────────
  {
    id: "boss_lust_3_devour",
    name: "Devour",
    sin: "lust",
    cost: 5,
    tier: "epic",
    compoundPattern: "aggressive",
    effects: [
      { type: "damage", baseValue: 22, duration: 2, targetMode: "single" },
      { type: "heal_steal", baseValue: 18, duration: 2, targetMode: "single" },
    ],
    description: "The Devourer drops the metaphor.",
  },

  // ─── Gluttony Act 1 — The Feast ──────────────────────────────
  {
    id: "boss_gluttony_1_courses",
    name: "Five Courses",
    sin: "gluttony",
    cost: 3,
    tier: "epic",
    compoundPattern: "aggressive",
    effects: [
      { type: "damage", baseValue: 13, duration: 3, targetMode: "single" },
      { type: "energy_gain", baseValue: 1, duration: 3, targetMode: "self" },
    ],
    description: "Renat does not pause between courses.",
  },

  // ─── Gluttony Act 2 — The Banquet ────────────────────────────
  {
    id: "boss_gluttony_2_invitation",
    name: "The Invitation",
    sin: "gluttony",
    cost: 4,
    tier: "epic",
    compoundPattern: "standard",
    effects: [
      { type: "damage", baseValue: 18, duration: 2, targetMode: "single" },
      { type: "discard_burn", baseValue: 2, duration: 1, targetMode: "single" },
    ],
    description: "The Host smiles. You're not a guest, exactly. You're a course.",
  },

  // ─── Gluttony Act 3 — The Maw ────────────────────────────────
  {
    id: "boss_gluttony_3_consumption",
    name: "Consumption",
    sin: "gluttony",
    cost: 5,
    tier: "epic",
    compoundPattern: "aggressive",
    effects: [
      { type: "damage", baseValue: 26, duration: 2, targetMode: "single" },
      { type: "heal_steal", baseValue: 12, duration: 2, targetMode: "single" },
    ],
    description: "The Maw does not consider you. Consideration is for things it hasn't eaten yet.",
  },
];

const BOSS_CARD_MAP: Record<string, CardDefinition> = Object.fromEntries(
  BOSS_CARDS.map((c) => [c.id, c])
);

/** Look up a boss-only card by ID. Returns undefined for non-boss IDs. */
export function getBossCardById(id: string): CardDefinition | undefined {
  return BOSS_CARD_MAP[id];
}

/**
 * One-off narrator line fired when the boss plays this twist card. Kept in
 * a sidecar map (rather than on `CardDefinition`) so the engine's card type
 * stays narrative-agnostic.
 *
 * GameBoard scans new locked plays for these IDs and dispatches the line via
 * the existing `useNarrator` queue.
 */
export const BOSS_CARD_NARRATOR_QUIPS: Record<string, string> = {
  // Wrath
  boss_wrath_1_hammerfall:
    "The Forgemaster lifts the hammer. He is not asking permission.",
  boss_wrath_2_bloodroar:
    "Vex drinks the wound. The wound thanks him.",
  boss_wrath_3_finalhour:
    "Erebus calls the Final Hour. Faith burns easy.",

  // Sloth
  boss_sloth_1_ironpatience:
    "Aldon does not move. Aldon does not need to.",
  boss_sloth_2_drowse:
    "Mother Slumber breathes. The room exhales with her.",
  boss_sloth_3_aeon:
    "The Eternal accumulates. You don't get to vote.",

  // Greed
  boss_greed_1_tithe:
    "Maeven reckons the column. You are line item seven.",
  boss_greed_2_ledger_strike:
    "Octavia closes the book. The bill is now overdue.",
  boss_greed_3_liquidation:
    "Cassivus has decided you're a liquid asset.",

  // Envy
  boss_envy_1_glasswork:
    "The Mirror does what you do, dressed slightly better.",
  boss_envy_2_replica:
    "The Twin learned that move. They also improved it.",
  boss_envy_3_inheritance:
    "The Hollow takes everything. Including the parts you forgot.",

  // Pride
  boss_pride_1_coronation:
    "The Boy-King delivers the line he's been rehearsing.",
  boss_pride_2_apotheosis:
    "The Idol does not flinch. The Idol sets the standard.",
  boss_pride_3_unbroken:
    "Apex has not lost. Apex sees no reason to start now.",

  // Lust
  boss_lust_1_silver_tongue:
    "Vaela compliments you, and the compliment leaves a mark.",
  boss_lust_2_snare:
    "Lyssara has been waiting. Lyssara is patient. Lyssara is fed.",
  boss_lust_3_devour:
    "The Devourer drops the metaphor. The metaphor breaks on impact.",

  // Gluttony
  boss_gluttony_1_courses:
    "Renat does not pause. Renat never pauses.",
  boss_gluttony_2_invitation:
    "The Host smiles. You're course four. Don't disappoint.",
  boss_gluttony_3_consumption:
    "The Maw notices you, briefly. Then it doesn't.",
};

export function getBossCardQuip(cardId: string): string | undefined {
  return BOSS_CARD_NARRATOR_QUIPS[cardId];
}
