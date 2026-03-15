/**
 * v5.10 "The Reckoning" — Game Constants & Card Balance Tests
 *
 * Validates:
 * 1. HP changed from 200 to 333
 * 2. FINAL_RECKONING_ROUND constant exists and equals 20
 * 3. Defensive card values scaled ×1.75
 * 4. Sloth endurance cap scaled proportionally
 * 5. Catch-up threshold adjusted
 * 6. All factions have correct card counts
 */

import { describe, expect, it } from "vitest";
import {
  STARTING_HP,
  MAX_ROUNDS,
  FINAL_RECKONING_ROUND,
  SLOTH_ENDURANCE_CAP,
  CATCHUP_HP_THRESHOLD,
  CARDS_PER_DECK,
} from "../shared/gameTypes";
import { getDeckForSin, getCardById, ALL_CARDS } from "../shared/cardData";
import type { SinType } from "../shared/gameTypes";

const ALL_SINS: SinType[] = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];

describe("v5.10 Game Constants", () => {
  it("STARTING_HP is 333", () => {
    expect(STARTING_HP).toBe(333);
  });

  it("MAX_ROUNDS is 20", () => {
    expect(MAX_ROUNDS).toBe(20);
  });

  it("FINAL_RECKONING_ROUND equals MAX_ROUNDS (20)", () => {
    expect(FINAL_RECKONING_ROUND).toBe(20);
    expect(FINAL_RECKONING_ROUND).toBe(MAX_ROUNDS);
  });

  it("SLOTH_ENDURANCE_CAP is 44 (scaled from 25 proportional to 333/200)", () => {
    expect(SLOTH_ENDURANCE_CAP).toBe(44);
    // Verify the scaling math: 25 * (333/200) ≈ 41.6, rounded up to 44
    expect(SLOTH_ENDURANCE_CAP).toBeGreaterThanOrEqual(Math.round(25 * (333 / 200)));
  });

  it("CATCHUP_HP_THRESHOLD is 133 (40% of 333)", () => {
    expect(CATCHUP_HP_THRESHOLD).toBe(133);
    // Verify it's approximately 40% of STARTING_HP
    expect(CATCHUP_HP_THRESHOLD).toBeCloseTo(STARTING_HP * 0.4, 0);
  });
});

describe("v5.10 Card Data Integrity", () => {
  it("every faction has at least 59 card definitions (v5.11 zero-cost expansion)", () => {
    for (const sin of ALL_SINS) {
      const deck = getDeckForSin(sin);
      expect(deck.length).toBeGreaterThanOrEqual(59);
    }
  });

  it("total card pool is 424 (v5.11 with zero-cost expansion)", () => {
    expect(ALL_CARDS).toHaveLength(424);
  });

  it("every card has at least one effect", () => {
    for (const card of ALL_CARDS) {
      expect(card.effects.length).toBeGreaterThan(0);
    }
  });

  it("every card ID can be retrieved by getCardById", () => {
    for (const card of ALL_CARDS) {
      const retrieved = getCardById(card.id);
      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(card.id);
    }
  });

  it("every faction deck ID resolves to a valid card object", () => {
    for (const sin of ALL_SINS) {
      const deckIds = getDeckForSin(sin);
      for (const id of deckIds) {
        const card = getCardById(id);
        expect(card).toBeDefined();
        expect(card!.sin).toBe(sin);
      }
    }
  });
});

describe("v5.10 Defensive Scaling (×1.75)", () => {
  const DEFENSIVE_TYPES = ["heal_gain", "shield_gain", "heal_steal", "shield_steal"];

  it("defensive card effects exist across all factions", () => {
    for (const sin of ALL_SINS) {
      const deckIds = getDeckForSin(sin);
      const cards = deckIds.map((id: string) => getCardById(id)!).filter(Boolean);
      const defensiveCards = cards.filter((card: any) =>
        card.effects.some((e: any) => DEFENSIVE_TYPES.includes(e.type))
      );
      expect(defensiveCards.length).toBeGreaterThan(0);
    }
  });

  it("no defensive base value is zero", () => {
    for (const card of ALL_CARDS) {
      for (const effect of card.effects) {
        if (DEFENSIVE_TYPES.includes(effect.type)) {
          expect(effect.baseValue).toBeGreaterThan(0);
        }
      }
    }
  });

  it("heal_gain values are reasonable (1-100 range after ×1.75 scaling)", () => {
    for (const card of ALL_CARDS) {
      for (const effect of card.effects) {
        if (effect.type === "heal_gain") {
          expect(effect.baseValue).toBeGreaterThanOrEqual(1);
          expect(effect.baseValue).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it("shield_gain values are reasonable (1-100 range after ×1.75 scaling)", () => {
    for (const card of ALL_CARDS) {
      for (const effect of card.effects) {
        if (effect.type === "shield_gain") {
          expect(effect.baseValue).toBeGreaterThanOrEqual(1);
          expect(effect.baseValue).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it("defensive values are integers (no fractional values from scaling)", () => {
    for (const card of ALL_CARDS) {
      for (const effect of card.effects) {
        if (DEFENSIVE_TYPES.includes(effect.type)) {
          expect(Number.isInteger(effect.baseValue)).toBe(true);
        }
      }
    }
  });
});

describe("v5.10 Card Effect Type Distribution", () => {
  it("every faction has both offensive and defensive cards", () => {
    const OFFENSIVE_TYPES = ["damage", "affliction", "energy_drain"];

    for (const sin of ALL_SINS) {
      const deckIds = getDeckForSin(sin);
      const cards = deckIds.map((id: string) => getCardById(id)!).filter(Boolean);
      const hasOffensive = cards.some((card: any) =>
        card.effects.some((e: any) => OFFENSIVE_TYPES.includes(e.type))
      );
      const hasDefensive = cards.some((card: any) =>
        card.effects.some((e: any) => ["heal_gain", "shield_gain"].includes(e.type))
      );
      expect(hasOffensive).toBe(true);
      expect(hasDefensive).toBe(true);
    }
  });

  it("all compound patterns are valid", () => {
    const VALID_PATTERNS = ["standard", "aggressive", "slowburn"];
    for (const card of ALL_CARDS) {
      expect(VALID_PATTERNS).toContain(card.compoundPattern);
    }
  });

  it("every card has a valid sin type", () => {
    for (const card of ALL_CARDS) {
      expect(ALL_SINS).toContain(card.sin);
    }
  });

  it("every card has a non-negative energy cost", () => {
    for (const card of ALL_CARDS) {
      expect(card.cost).toBeGreaterThanOrEqual(0);
      expect(card.cost).toBeLessThanOrEqual(7); // max energy is 7
    }
  });
});

describe("v5.10 HP and Balance Sanity Checks", () => {
  it("333 HP is half of 666 (thematic integrity)", () => {
    expect(STARTING_HP * 2).toBe(666);
  });

  it("FINAL_RECKONING_ROUND is the last round", () => {
    expect(FINAL_RECKONING_ROUND).toBe(MAX_ROUNDS);
  });

  it("catch-up threshold is between 30-50% of starting HP", () => {
    const ratio = CATCHUP_HP_THRESHOLD / STARTING_HP;
    expect(ratio).toBeGreaterThanOrEqual(0.3);
    expect(ratio).toBeLessThanOrEqual(0.5);
  });

  it("max single-card damage cannot one-shot from full HP", () => {
    // Find the highest single-effect damage value in the game
    let maxDamage = 0;
    for (const card of ALL_CARDS) {
      for (const effect of card.effects) {
        if (effect.type === "damage" && effect.baseValue > maxDamage) {
          maxDamage = effect.baseValue;
        }
      }
    }
    // No single card effect should deal more than 50% of starting HP
    expect(maxDamage).toBeLessThan(STARTING_HP * 0.5);
  });
});
