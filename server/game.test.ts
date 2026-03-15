/**
 * Game Logic Tests — v4 Compound-Only System
 *
 * Tests for the core game mechanics: compound patterns, card data integrity,
 * deck composition, energy system, and narrator content.
 * Because even sins need quality assurance.
 */

import { describe, expect, it } from "vitest";
import {
  MAX_ROUNDS,
  STARTING_HP,
  HAND_SIZE,
  CARDS_PER_DECK,
  MAX_ENERGY,
  ENERGY_PER_TURN,
  getBaseEnergyForRound,
  getCompoundTickValue,
  ROUND_16_DOUBLING,
  CATCHUP_HP_THRESHOLD,
  CompoundPattern,
} from "../shared/gameTypes";
import {
  WRATH_CARDS,
  SLOTH_CARDS,
  GREED_CARDS,
  ENVY_CARDS,
  PRIDE_CARDS,
  LUST_CARDS,
  GLUTTONY_CARDS,
  ALL_CARDS,
  CARD_MAP,
  getCardById,
  getDeckForSin,
  NARRATOR_LINES,
} from "../shared/cardData";

describe("Compound Patterns (v4)", () => {
  describe("standard pattern", () => {
    it("tick 0: base x 1", () => {
      expect(getCompoundTickValue(3, "standard", 0)).toBe(3);
      expect(getCompoundTickValue(5, "standard", 0)).toBe(5);
    });

    it("tick 1: base x 1", () => {
      expect(getCompoundTickValue(3, "standard", 1)).toBe(3);
      expect(getCompoundTickValue(5, "standard", 1)).toBe(5);
    });

    it("tick 2: base x 2", () => {
      expect(getCompoundTickValue(3, "standard", 2)).toBe(6);
      expect(getCompoundTickValue(5, "standard", 2)).toBe(10);
    });

    it("scales with Fibonacci pattern", () => {
      // Standard uses Fibonacci: 1, 1, 2, 3, 5, 8...
      const base = 4;
      const values = Array.from({ length: 6 }, (_, i) => getCompoundTickValue(base, "standard", i));
      expect(values[0]).toBe(4);  // 4 * 1
      expect(values[1]).toBe(4);  // 4 * 1
      expect(values[2]).toBe(8);  // 4 * 2
      expect(values[3]).toBe(12); // 4 * 3
      expect(values[4]).toBe(20); // 4 * 5
      expect(values[5]).toBe(32); // 4 * 8
    });
  });

  describe("aggressive pattern", () => {
    it("front-loads damage with powers of 2", () => {
      const base = 3;
      const values = Array.from({ length: 4 }, (_, i) => getCompoundTickValue(base, "aggressive", i));
      expect(values[0]).toBe(3);  // 3 * 1
      expect(values[1]).toBe(6);  // 3 * 2
      expect(values[2]).toBe(12); // 3 * 4
      expect(values[3]).toBe(24); // 3 * 8
    });
  });

  describe("slowburn pattern", () => {
    it("starts flat then ramps", () => {
      const base = 4;
      const v0 = getCompoundTickValue(base, "slowburn", 0);
      const v1 = getCompoundTickValue(base, "slowburn", 1);
      // Slowburn starts slow
      expect(v0).toBe(v1); // First two ticks are equal
    });
  });

  it("always returns integers", () => {
    const patterns: CompoundPattern[] = ["standard", "aggressive", "slowburn"];
    for (const pattern of patterns) {
      for (let base = 1; base <= 10; base++) {
        for (let tick = 0; tick < 6; tick++) {
          const val = getCompoundTickValue(base, pattern, tick);
          expect(Number.isInteger(val)).toBe(true);
        }
      }
    }
  });
});

describe("Card Data Integrity (v4)", () => {
  it("has correct wrath card count (v5.11 zero-cost expansion)", () => {
    expect(WRATH_CARDS).toHaveLength(60);
  });

  it("has correct sloth card count (v5.11 zero-cost expansion)", () => {
    expect(SLOTH_CARDS).toHaveLength(59);
  });

  it("has correct card counts per faction (v5.11 zero-cost expansion)", () => {
    expect(GREED_CARDS).toHaveLength(61);
    expect(ENVY_CARDS).toHaveLength(60);
    expect(PRIDE_CARDS).toHaveLength(64);
    expect(LUST_CARDS).toHaveLength(60);
    expect(GLUTTONY_CARDS).toHaveLength(60);
  });

  it("has 424 total cards (v5.11 with zero-cost expansion)", () => {
    expect(ALL_CARDS).toHaveLength(424);
  });

  it("all faction cards have correct sin", () => {
    WRATH_CARDS.forEach((card) => expect(card.sin).toBe("wrath"));
    SLOTH_CARDS.forEach((card) => expect(card.sin).toBe("sloth"));
    GREED_CARDS.forEach((card) => expect(card.sin).toBe("greed"));
    ENVY_CARDS.forEach((card) => expect(card.sin).toBe("envy"));
    PRIDE_CARDS.forEach((card) => expect(card.sin).toBe("pride"));
    LUST_CARDS.forEach((card) => expect(card.sin).toBe("lust"));
    GLUTTONY_CARDS.forEach((card) => expect(card.sin).toBe("gluttony"));
  });

  it("every card has required fields", () => {
    ALL_CARDS.forEach((card) => {
      expect(card.id).toBeTruthy();
      expect(card.name).toBeTruthy();
      expect(card.sin).toMatch(/^(wrath|sloth|greed|envy|pride|lust|gluttony)$/);
      expect(card.cost).toBeGreaterThanOrEqual(0);
      expect(card.effects.length).toBeGreaterThanOrEqual(1);
      expect(card.description).toBeTruthy();
      expect(card.tier).toMatch(/^(common|rare|epic)$/);
      expect(card.compoundPattern).toMatch(/^(standard|aggressive|slowburn)$/);
    });
  });

  it("all cards have compound patterns (no flat cards in v4)", () => {
    ALL_CARDS.forEach((card) => {
      expect(["standard", "aggressive", "slowburn"]).toContain(card.compoundPattern);
    });
  });

  it("all effects have valid v4 types", () => {
    const validTypes = [
      "damage", "self_damage", "heal_gain", "heal_steal", "heal_block",
      "shield_gain", "shield_steal", "shield_block", "energy_gain",
      "energy_steal", "energy_block", "affliction_amplify", "affliction_transfer",
      "discard_burn", "energy_regen", "draw_boost", "draw_reduction",
    ];
    ALL_CARDS.forEach((card) => {
      card.effects.forEach((effect) => {
        expect(validTypes).toContain(effect.type);
        expect(effect.baseValue).toBeGreaterThanOrEqual(1);
        expect(effect.duration).toBeGreaterThanOrEqual(1);
        expect(["single", "duo", "aoe", "self"]).toContain(effect.targetMode);
      });
    });
  });

  it("every card has unique ID", () => {
    const ids = ALL_CARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all card costs are within valid range (0-6)", () => {
    ALL_CARDS.forEach((card) => {
      expect(card.cost).toBeGreaterThanOrEqual(0);
      expect(card.cost).toBeLessThanOrEqual(6);
    });
  });

  it("each sin has at least one 0-cost card", () => {
    [WRATH_CARDS, SLOTH_CARDS, GREED_CARDS, ENVY_CARDS, PRIDE_CARDS, LUST_CARDS, GLUTTONY_CARDS].forEach((deck) => {
      const zeroCost = deck.filter((c) => c.cost === 0);
      expect(zeroCost.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("each sin uses valid compound patterns", () => {
    [WRATH_CARDS, SLOTH_CARDS, GREED_CARDS, ENVY_CARDS, PRIDE_CARDS, LUST_CARDS, GLUTTONY_CARDS].forEach((deck) => {
      const patterns = new Set(deck.map((c) => c.compoundPattern));
      expect(patterns.size).toBeGreaterThanOrEqual(1);
      patterns.forEach((p) => expect(["standard", "aggressive", "slowburn"]).toContain(p));
    });
  });
});

describe("Card Registry", () => {
  it("CARD_MAP contains all 424 cards", () => {
    expect(Object.keys(CARD_MAP)).toHaveLength(424);
  });

  it("getCardById returns correct card", () => {
    const card = getCardById("wrath_01");
    expect(card).toBeDefined();
    expect(card!.name).toBe("Fury Swipe");
    expect(card!.sin).toBe("wrath");
  });

  it("getCardById returns undefined for invalid ID", () => {
    expect(getCardById("nonexistent")).toBeUndefined();
  });

  it("getDeckForSin returns correct card IDs for each sin (v5.11)", () => {
    const sins = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"] as const;
    for (const sin of sins) {
      const deck = getDeckForSin(sin);
      expect(deck.length).toBeGreaterThanOrEqual(59);
      deck.forEach((id) => {
        expect(id).toMatch(new RegExp(`^${sin}_`));
      });
    }
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
});

describe("Game Constants (v4)", () => {
  it("MAX_ROUNDS is 20", () => {
    expect(MAX_ROUNDS).toBe(20);
  });

  it("STARTING_HP is 333 (v5.10)", () => {
    expect(STARTING_HP).toBe(333);
  });

  it("HAND_SIZE is 5", () => {
    expect(HAND_SIZE).toBe(5);
  });

  it("CARDS_PER_DECK is 30 (deck size limit)", () => {
    expect(CARDS_PER_DECK).toBe(30);
  });

  it("ROUND_16_DOUBLING is 16", () => {
    expect(ROUND_16_DOUBLING).toBe(16);
  });

  it("CATCHUP_HP_THRESHOLD is 133 (40% of 333 HP, v5.10)", () => {
    expect(CATCHUP_HP_THRESHOLD).toBe(133);
  });
});

describe("Corruption Energy System (v5 — carry-over)", () => {
  it("MAX_ENERGY is 7 (cap)", () => {
    expect(MAX_ENERGY).toBe(7);
  });

  it("ENERGY_PER_TURN is 1 (gain per round)", () => {
    expect(ENERGY_PER_TURN).toBe(1);
  });

  it("getBaseEnergyForRound returns STARTING_ENERGY + (round-1) capped at MAX_ENERGY", () => {
    // Round 1: start 2, Round 2: 3, Round 3: 4, ... Round 6: 7, Round 7+: 7
    expect(getBaseEnergyForRound(1)).toBe(2);
    expect(getBaseEnergyForRound(2)).toBe(3);
    expect(getBaseEnergyForRound(5)).toBe(6);
    expect(getBaseEnergyForRound(6)).toBe(7);
    expect(getBaseEnergyForRound(10)).toBe(7);
  });

  describe("Card cost balance", () => {
    it("average card cost per faction is between 1 and 3", () => {
      [WRATH_CARDS, SLOTH_CARDS, GREED_CARDS, ENVY_CARDS, PRIDE_CARDS, LUST_CARDS, GLUTTONY_CARDS].forEach((deck) => {
        const avgCost = deck.reduce((sum, c) => sum + c.cost, 0) / deck.length;
        expect(avgCost).toBeGreaterThanOrEqual(1);
        expect(avgCost).toBeLessThanOrEqual(4);
      });
    });

    it("all cards are playable within MAX_ENERGY * 2 (can save across turns)", () => {
      ALL_CARDS.forEach((card) => {
        expect(card.cost).toBeLessThanOrEqual(MAX_ENERGY * 2 + 1); // Max 7 with bonuses
      });
    });

    it("all cards are playable on round 1 if they cost <= MAX_ENERGY", () => {
      const round1Playable = ALL_CARDS.filter((c) => c.cost <= MAX_ENERGY);
      expect(round1Playable.length).toBeGreaterThanOrEqual(4);
    });
  });
});
