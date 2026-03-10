/**
 * Game Logic Tests
 *
 * Tests for the core game mechanics: compounding, card data integrity,
 * deck composition, and narrator content.
 * Because even sins need quality assurance.
 */

import { describe, expect, it } from "vitest";
import {
  calculateEffectiveValue,
  MAX_ROUNDS,
  STARTING_HP,
  HAND_SIZE,
  CARDS_PER_DECK,
  STARTING_ENERGY,
  MAX_ENERGY,
  ENERGY_PER_ROUND,
  SLOTH_MAX_CARRYOVER,
  WRATH_OVERCHARGE_HP_COST,
  WRATH_OVERCHARGE_ENERGY_GAIN,
  getBaseEnergyForRound,
} from "../shared/gameTypes";
import {
  WRATH_CARDS,
  SLOTH_CARDS,
  ALL_CARDS,
  CARD_MAP,
  getCardById,
  getDeckForSin,
  NARRATOR_LINES,
} from "../shared/cardData";

describe("Compounding Mechanic", () => {
  it("calculates effective value as base × round", () => {
    expect(calculateEffectiveValue(3, 1)).toBe(3);
    expect(calculateEffectiveValue(3, 2)).toBe(6);
    expect(calculateEffectiveValue(3, 5)).toBe(15);
  });

  it("caps at MAX_ROUNDS", () => {
    expect(calculateEffectiveValue(3, 10)).toBe(30);
    expect(calculateEffectiveValue(3, 15)).toBe(30); // capped at 10
    expect(calculateEffectiveValue(3, 100)).toBe(30);
  });

  it("handles edge cases", () => {
    expect(calculateEffectiveValue(0, 5)).toBe(0);
    expect(calculateEffectiveValue(1, 1)).toBe(1);
  });
});

describe("Card Data Integrity", () => {
  it("has exactly 10 wrath cards", () => {
    expect(WRATH_CARDS).toHaveLength(CARDS_PER_DECK);
  });

  it("has exactly 10 sloth cards", () => {
    expect(SLOTH_CARDS).toHaveLength(CARDS_PER_DECK);
  });

  it("has 20 total cards", () => {
    expect(ALL_CARDS).toHaveLength(20);
  });

  it("all wrath cards have sin=wrath", () => {
    WRATH_CARDS.forEach((card) => {
      expect(card.sin).toBe("wrath");
    });
  });

  it("all sloth cards have sin=sloth", () => {
    SLOTH_CARDS.forEach((card) => {
      expect(card.sin).toBe("sloth");
    });
  });

  it("every card has required fields", () => {
    ALL_CARDS.forEach((card) => {
      expect(card.id).toBeTruthy();
      expect(card.name).toBeTruthy();
      expect(card.sin).toMatch(/^(wrath|sloth)$/);
      expect(card.cost).toBeGreaterThanOrEqual(0);
      expect(card.effects.length).toBeGreaterThanOrEqual(1);
      expect(card.flavorText).toBeTruthy();
      expect(card.narratorQuip).toBeTruthy();
      expect(card.tier).toMatch(/^(common|rare|epic)$/);
    });
  });

  it("every card has unique ID", () => {
    const ids = ALL_CARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("card effects have valid targets", () => {
    ALL_CARDS.forEach((card) => {
      card.effects.forEach((effect) => {
        expect(["damage", "heal", "shield", "buff", "debuff", "energy_drain", "energy_gain"]).toContain(effect.type);
        expect(["self", "single_enemy", "all_enemies", "random_enemy"]).toContain(effect.target);
        expect(effect.baseValue).toBeGreaterThanOrEqual(1);
        expect(effect.duration).toBeGreaterThanOrEqual(0);
      });
    });
  });

  it("all card costs are within valid range (0-5)", () => {
    ALL_CARDS.forEach((card) => {
      expect(card.cost).toBeGreaterThanOrEqual(0);
      expect(card.cost).toBeLessThanOrEqual(5);
    });
  });

  it("each sin has at least one 0-cost card", () => {
    const wrathZeroCost = WRATH_CARDS.filter((c) => c.cost === 0);
    const slothZeroCost = SLOTH_CARDS.filter((c) => c.cost === 0);
    expect(wrathZeroCost.length).toBeGreaterThanOrEqual(1);
    expect(slothZeroCost.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Card Registry", () => {
  it("CARD_MAP contains all cards", () => {
    expect(Object.keys(CARD_MAP)).toHaveLength(20);
  });

  it("getCardById returns correct card", () => {
    const card = getCardById("wrath_01");
    expect(card).toBeDefined();
    expect(card!.name).toBe("Fury Strike");
    expect(card!.sin).toBe("wrath");
  });

  it("getCardById returns undefined for invalid ID", () => {
    expect(getCardById("nonexistent")).toBeUndefined();
  });

  it("getDeckForSin returns 10 card IDs for wrath", () => {
    const deck = getDeckForSin("wrath");
    expect(deck).toHaveLength(10);
    deck.forEach((id) => {
      expect(id).toMatch(/^wrath_/);
    });
  });

  it("getDeckForSin returns 10 card IDs for sloth", () => {
    const deck = getDeckForSin("sloth");
    expect(deck).toHaveLength(10);
    deck.forEach((id) => {
      expect(id).toMatch(/^sloth_/);
    });
  });
});

describe("Narrator Lines (Sassy & Cynical)", () => {
  it("has all required categories", () => {
    const requiredCategories = [
      "gameStart",
      "roundStart",
      "playerEliminated",
      "gameEnd",
      "pass",
      "botThinking",
      "lowHp",
      "highDamage",
      "cardPlayed",
    ];
    requiredCategories.forEach((cat) => {
      expect(NARRATOR_LINES).toHaveProperty(cat);
      expect((NARRATOR_LINES as any)[cat].length).toBeGreaterThanOrEqual(3);
    });
  });

  it("roundStart lines contain {round} placeholder", () => {
    NARRATOR_LINES.roundStart.forEach((line) => {
      expect(line).toContain("{round}");
    });
  });

  it("playerEliminated lines contain {player} placeholder", () => {
    NARRATOR_LINES.playerEliminated.forEach((line) => {
      expect(line).toContain("{player}");
    });
  });

  it("gameEnd lines contain {winner} placeholder", () => {
    NARRATOR_LINES.gameEnd.forEach((line) => {
      expect(line).toContain("{winner}");
    });
  });

  it("every narrator quip on cards is non-empty", () => {
    ALL_CARDS.forEach((card) => {
      expect(card.narratorQuip.length).toBeGreaterThan(10);
    });
  });
});

describe("Game Constants", () => {
  it("MAX_ROUNDS is 10", () => {
    expect(MAX_ROUNDS).toBe(10);
  });

  it("STARTING_HP is 25", () => {
    expect(STARTING_HP).toBe(25);
  });

  it("HAND_SIZE is 5", () => {
    expect(HAND_SIZE).toBe(5);
  });

  it("CARDS_PER_DECK is 10", () => {
    expect(CARDS_PER_DECK).toBe(10);
  });
});

// ─── Energy / Corruption System Tests ─────────────────────────
describe("Corruption Energy System", () => {
  it("STARTING_ENERGY is 2", () => {
    expect(STARTING_ENERGY).toBe(2);
  });

  it("MAX_ENERGY is 7 (7 deadly sins)", () => {
    expect(MAX_ENERGY).toBe(7);
  });

  it("ENERGY_PER_ROUND is 1", () => {
    expect(ENERGY_PER_ROUND).toBe(1);
  });

  it("SLOTH_MAX_CARRYOVER is 2", () => {
    expect(SLOTH_MAX_CARRYOVER).toBe(2);
  });

  it("WRATH_OVERCHARGE costs 2 HP for 1 energy", () => {
    expect(WRATH_OVERCHARGE_HP_COST).toBe(2);
    expect(WRATH_OVERCHARGE_ENERGY_GAIN).toBe(1);
  });

  describe("getBaseEnergyForRound", () => {
    it("returns 2 for round 1", () => {
      expect(getBaseEnergyForRound(1)).toBe(2);
    });

    it("returns 3 for round 2", () => {
      expect(getBaseEnergyForRound(2)).toBe(3);
    });

    it("returns 6 for round 5", () => {
      expect(getBaseEnergyForRound(5)).toBe(6);
    });

    it("caps at MAX_ENERGY (7) for round 6+", () => {
      expect(getBaseEnergyForRound(6)).toBe(7);
      expect(getBaseEnergyForRound(7)).toBe(7);
      expect(getBaseEnergyForRound(10)).toBe(7);
    });

    it("energy progression: 2, 3, 4, 5, 6, 7, 7, 7...", () => {
      const progression = Array.from({ length: 10 }, (_, i) => getBaseEnergyForRound(i + 1));
      expect(progression).toEqual([2, 3, 4, 5, 6, 7, 7, 7, 7, 7]);
    });
  });

  describe("Card cost balance", () => {
    it("average wrath card cost is between 1 and 3", () => {
      const avgCost = WRATH_CARDS.reduce((sum, c) => sum + c.cost, 0) / WRATH_CARDS.length;
      expect(avgCost).toBeGreaterThanOrEqual(1);
      expect(avgCost).toBeLessThanOrEqual(3);
    });

    it("average sloth card cost is between 1 and 3", () => {
      const avgCost = SLOTH_CARDS.reduce((sum, c) => sum + c.cost, 0) / SLOTH_CARDS.length;
      expect(avgCost).toBeGreaterThanOrEqual(1);
      expect(avgCost).toBeLessThanOrEqual(3);
    });

    it("no card costs more than MAX_ENERGY", () => {
      ALL_CARDS.forEach((card) => {
        expect(card.cost).toBeLessThanOrEqual(MAX_ENERGY);
      });
    });

    it("all cards are playable on round 1 if they cost <= STARTING_ENERGY", () => {
      const round1Playable = ALL_CARDS.filter((c) => c.cost <= STARTING_ENERGY);
      // At least some cards should be playable on round 1
      expect(round1Playable.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("calculateEffectiveValue returns whole numbers", () => {
    it("all base values produce integers when multiplied by round", () => {
      ALL_CARDS.forEach((card) => {
        card.effects.forEach((effect) => {
          for (let round = 1; round <= 10; round++) {
            const val = calculateEffectiveValue(effect.baseValue, round);
            expect(Number.isInteger(val)).toBe(true);
          }
        });
      });
    });
  });
});
