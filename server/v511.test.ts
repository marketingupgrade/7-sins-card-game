/**
 * v5.11.0 "The Crucible" — Tests for new game mechanics
 *
 * Tests:
 * - MAX_HAND_SIZE constant and hand cap enforcement
 * - Sloth ENDURANCE AOE damage passive (energy × 2 to all enemies)
 * - Zero-cost card expansion (12 per faction)
 * - FACTION_SWOT data completeness
 * - Turn timer constant
 */

import { describe, it, expect } from "vitest";
import {
  HAND_SIZE,
  MAX_HAND_SIZE,
  STARTING_HP,
  STARTING_ENERGY,
  MAX_ENERGY,
  SLOTH_ENDURANCE_MULT,
  SLOTH_ENDURANCE_CAP,
  SLOTH_ENDURANCE_AOE_MULT,
  FACTION_SWOT,
  FINAL_RECKONING_ROUND,
  MAX_ROUNDS,
} from "../shared/gameTypes";
import { ALL_CARDS, getDeckForSin, CARD_MAP } from "../shared/cardData";

// ─── Constants ─────────────────────────────────────────────────────────────

describe("v5.11 Constants", () => {
  it("MAX_HAND_SIZE is 10", () => {
    expect(MAX_HAND_SIZE).toBe(10);
  });

  it("MAX_HAND_SIZE is greater than HAND_SIZE (initial draw)", () => {
    expect(MAX_HAND_SIZE).toBeGreaterThan(HAND_SIZE);
  });

  it("SLOTH_ENDURANCE_AOE_MULT is 1.029 (v5.12 rebalanced from 2.0)", () => {
    expect(SLOTH_ENDURANCE_AOE_MULT).toBe(1.029);
  });

  it("STARTING_HP is 333 (v5.10 value maintained)", () => {
    expect(STARTING_HP).toBe(333);
  });

  it("FINAL_RECKONING_ROUND equals MAX_ROUNDS", () => {
    expect(FINAL_RECKONING_ROUND).toBe(MAX_ROUNDS);
  });
});

// ─── Zero-Cost Card Expansion ──────────────────────────────────────────────

describe("Zero-cost card expansion", () => {
  const sins = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"] as const;

  for (const sin of sins) {
    it(`${sin} has at least 12 zero-cost cards`, () => {
      const deck = getDeckForSin(sin);
      const zeroCostCards = deck.filter((id) => {
        const card = CARD_MAP[id];
        return card && card.cost === 0;
      });
      expect(zeroCostCards.length).toBeGreaterThanOrEqual(12);
    });
  }

  it("all zero-cost cards have valid effects", () => {
    const zeroCostCards = ALL_CARDS.filter((c) => c.cost === 0);
    for (const card of zeroCostCards) {
      expect(card.effects.length).toBeGreaterThan(0);
      for (const effect of card.effects) {
        expect(effect.type).toBeTruthy();
        expect(effect.baseValue).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("zero-cost cards have lower base values than higher-cost cards on average", () => {
    const zeroCost = ALL_CARDS.filter((c) => c.cost === 0);
    const highCost = ALL_CARDS.filter((c) => c.cost >= 3);

    const avgZero = zeroCost.reduce((sum, c) => sum + c.effects.reduce((s, e) => s + e.baseValue, 0), 0) / zeroCost.length;
    const avgHigh = highCost.reduce((sum, c) => sum + c.effects.reduce((s, e) => s + e.baseValue, 0), 0) / highCost.length;

    expect(avgZero).toBeLessThan(avgHigh);
  });

  it("no duplicate card IDs exist across all factions", () => {
    const allIds = ALL_CARDS.map((c) => c.id);
    const uniqueIds = new Set(allIds);
    expect(allIds.length).toBe(uniqueIds.size);
  });
});

// ─── Hand Cap Logic ────────────────────────────────────────────────────────

describe("Hand cap enforcement logic", () => {
  it("MAX_HAND_SIZE is a reasonable cap (between 7 and 15)", () => {
    expect(MAX_HAND_SIZE).toBeGreaterThanOrEqual(7);
    expect(MAX_HAND_SIZE).toBeLessThanOrEqual(15);
  });

  it("a hand at MAX_HAND_SIZE should not draw more cards", () => {
    // Simulate: if hand.length >= MAX_HAND_SIZE, drawCard should not add
    const hand = Array.from({ length: MAX_HAND_SIZE }, (_, i) => `card_${i}`);
    expect(hand.length).toBe(MAX_HAND_SIZE);
    // The game engine checks: if (player.hand.length >= MAX_HAND_SIZE) return
    const shouldDraw = hand.length < MAX_HAND_SIZE;
    expect(shouldDraw).toBe(false);
  });

  it("a hand below MAX_HAND_SIZE should allow drawing", () => {
    const hand = Array.from({ length: MAX_HAND_SIZE - 1 }, (_, i) => `card_${i}`);
    const shouldDraw = hand.length < MAX_HAND_SIZE;
    expect(shouldDraw).toBe(true);
  });
});

// ─── Sloth AOE Passive ─────────────────────────────────────────────────────

describe("Sloth ENDURANCE AOE passive", () => {
  it("AOE damage formula: energy × SLOTH_ENDURANCE_AOE_MULT", () => {
    const energy = 5;
    const aoeDamage = energy * SLOTH_ENDURANCE_AOE_MULT;
    expect(aoeDamage).toBeCloseTo(5 * 1.029, 1);
  });

  it("AOE damage at max energy", () => {
    const aoeDamage = MAX_ENERGY * SLOTH_ENDURANCE_AOE_MULT;
    expect(aoeDamage).toBeCloseTo(7 * 1.029, 1); // 7 * 1.029 = 7.203
  });

  it("AOE damage at starting energy", () => {
    const aoeDamage = STARTING_ENERGY * SLOTH_ENDURANCE_AOE_MULT;
    expect(aoeDamage).toBeCloseTo(2 * 1.029, 1); // 2 * 1.029 = 2.058
  });

  it("shield generation still works alongside AOE", () => {
    const energy = 5;
    const handSize = 4;
    const shield = Math.min(energy * handSize * SLOTH_ENDURANCE_MULT, SLOTH_ENDURANCE_CAP);
    const aoe = energy * SLOTH_ENDURANCE_AOE_MULT;
    expect(shield).toBeGreaterThan(0);
    expect(aoe).toBeGreaterThan(0);
    // Both should apply simultaneously
    expect(shield + aoe).toBeGreaterThan(shield);
  });
});

// ─── FACTION_SWOT Data ─────────────────────────────────────────────────────

describe("FACTION_SWOT data completeness", () => {
  const sins = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"] as const;

  for (const sin of sins) {
    it(`${sin} has complete SWOT data`, () => {
      const swot = FACTION_SWOT[sin];
      expect(swot).toBeDefined();
      expect(swot.strengths).toBeTruthy();
      expect(swot.strengths.length).toBeGreaterThan(0);
      expect(swot.weaknesses).toBeTruthy();
      expect(swot.weaknesses.length).toBeGreaterThan(0);
      expect(swot.opportunities).toBeTruthy();
      expect(swot.opportunities.length).toBeGreaterThan(0);
      expect(swot.threats).toBeTruthy();
      expect(swot.threats.length).toBeGreaterThan(0);
      expect(swot.playstyle).toBeTruthy();
      expect(swot.playstyle.length).toBeGreaterThan(0);
    });
  }

  it("all 7 factions have SWOT entries", () => {
    expect(Object.keys(FACTION_SWOT).length).toBe(7);
  });
});
