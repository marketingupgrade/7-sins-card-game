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
];

const BOSS_CARD_MAP: Record<string, CardDefinition> = Object.fromEntries(
  BOSS_CARDS.map((c) => [c.id, c])
);

/** Look up a boss-only card by ID. Returns undefined for non-boss IDs. */
export function getBossCardById(id: string): CardDefinition | undefined {
  return BOSS_CARD_MAP[id];
}
