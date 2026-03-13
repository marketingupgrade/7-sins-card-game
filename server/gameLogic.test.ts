/**
 * Game Logic Tests — v4 Compound-Only System
 *
 * Tests for card data integrity, compound patterns,
 * and shared game type calculations.
 */

import { describe, expect, it } from "vitest";
import { ALL_CARDS, WRATH_CARDS, SLOTH_CARDS, GREED_CARDS, ENVY_CARDS, PRIDE_CARDS, LUST_CARDS, GLUTTONY_CARDS, CARD_MAP, getCardById, getDeckForSin } from "../shared/cardData";
import { getCompoundTickValue, MAX_ROUNDS, STARTING_HP, HAND_SIZE, CARDS_PER_DECK, CompoundPattern } from "../shared/gameTypes";

describe("Card Data Integrity (v4)", () => {
  it("has exactly 54 wrath cards", () => {
    expect(WRATH_CARDS).toHaveLength(54);
  });

  it("has exactly 54 sloth cards", () => {
    expect(SLOTH_CARDS).toHaveLength(54);
  });

  it("has 378 total cards (7 sins x 54)", () => {
    expect(ALL_CARDS).toHaveLength(378);
  });

  it("has exactly 54 greed cards", () => {
    expect(GREED_CARDS).toHaveLength(54);
  });

  it("has exactly 54 envy cards", () => {
    expect(ENVY_CARDS).toHaveLength(54);
  });

  it("all greed cards have sin=greed", () => {
    GREED_CARDS.forEach((card) => {
      expect(card.sin).toBe("greed");
    });
  });

  it("all envy cards have sin=envy", () => {
    ENVY_CARDS.forEach((card) => {
      expect(card.sin).toBe("envy");
    });
  });

  it("all cards have unique IDs", () => {
    const ids = ALL_CARDS.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
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

  it("all cards have at least one effect", () => {
    ALL_CARDS.forEach((card) => {
      expect(card.effects.length).toBeGreaterThan(0);
    });
  });

  it("all cards have required text fields", () => {
    ALL_CARDS.forEach((card) => {
      expect(card.name).toBeTruthy();
      expect(card.description).toBeTruthy();
    });
  });

  it("all cards have valid tier", () => {
    ALL_CARDS.forEach((card) => {
      expect(["common", "rare", "epic"]).toContain(card.tier);
    });
  });

  it("all cards have non-negative cost", () => {
    ALL_CARDS.forEach((card) => {
      expect(card.cost).toBeGreaterThanOrEqual(0);
    });
  });

  it("all cards have compound patterns (no flat cards in v4)", () => {
    ALL_CARDS.forEach((card) => {
      expect(["standard", "aggressive", "slowburn"]).toContain(card.compoundPattern);
    });
  });

  it("all effects have valid v4 types and target modes", () => {
    const validTypes = [
      "damage", "self_damage", "heal_gain", "heal_steal", "heal_block",
      "shield_gain", "shield_steal", "shield_block", "energy_gain",
      "energy_steal", "energy_block", "affliction_amplify", "affliction_transfer",
      "discard_burn", "energy_regen", "draw_boost", "draw_reduction",
    ];
    ALL_CARDS.forEach((card) => {
      card.effects.forEach((effect) => {
        expect(validTypes).toContain(effect.type);
        expect(["single", "duo", "aoe", "self"]).toContain(effect.targetMode);
        expect(effect.baseValue).toBeGreaterThanOrEqual(1);
        expect(effect.duration).toBeGreaterThanOrEqual(1);
      });
    });
  });
});

describe("Card Registry", () => {
  it("CARD_MAP contains all cards", () => {
    expect(Object.keys(CARD_MAP)).toHaveLength(378);
  });

  it("getCardById returns correct card", () => {
    const card = getCardById("wrath_01");
    expect(card).toBeDefined();
    expect(card?.name).toBe("Fury Swipe");
    expect(card?.sin).toBe("wrath");
  });

  it("getCardById returns undefined for invalid ID", () => {
    expect(getCardById("nonexistent")).toBeUndefined();
  });

  it("getDeckForSin returns 54 card IDs for each sin", () => {
    const sins = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"] as const;
    for (const sin of sins) {
      const deck = getDeckForSin(sin);
      expect(deck).toHaveLength(54);
      deck.forEach((id) => {
        expect(id).toMatch(new RegExp(`^${sin}_`));
      });
    }
  });
});

describe("Compound Patterns (v4)", () => {
  describe("standard pattern (Fibonacci)", () => {
    it("tick 0: base x 1", () => {
      expect(getCompoundTickValue(3, "standard", 0)).toBe(3);
    });

    it("tick 1: base x 1", () => {
      expect(getCompoundTickValue(3, "standard", 1)).toBe(3);
    });

    it("tick 2: base x 2", () => {
      expect(getCompoundTickValue(3, "standard", 2)).toBe(6);
    });

    it("tick 3: base x 3", () => {
      expect(getCompoundTickValue(3, "standard", 3)).toBe(9);
    });
  });

  describe("aggressive pattern (powers of 2)", () => {
    it("tick 0: base x 1", () => {
      expect(getCompoundTickValue(3, "aggressive", 0)).toBe(3);
    });

    it("tick 1: base x 2", () => {
      expect(getCompoundTickValue(3, "aggressive", 1)).toBe(6);
    });

    it("tick 2: base x 4", () => {
      expect(getCompoundTickValue(3, "aggressive", 2)).toBe(12);
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

describe("Game Constants (v4)", () => {
  it("MAX_ROUNDS is 20", () => {
    expect(MAX_ROUNDS).toBe(20);
  });

  it("STARTING_HP is 200", () => {
    expect(STARTING_HP).toBe(200);
  });

  it("HAND_SIZE is 5", () => {
    expect(HAND_SIZE).toBe(5);
  });

  it("CARDS_PER_DECK is 54", () => {
    expect(CARDS_PER_DECK).toBe(54);
  });
});

describe("Card Balance Sanity Checks (v4)", () => {
  it("no card has base damage above 30", () => {
    ALL_CARDS.forEach((card) => {
      card.effects.forEach((effect) => {
        if (effect.type === "damage") {
          expect(effect.baseValue).toBeLessThanOrEqual(30);
        }
      });
    });
  });

  it("no card costs more than 6", () => {
    ALL_CARDS.forEach((card) => {
      expect(card.cost).toBeLessThanOrEqual(6);
    });
  });

  it("each sin uses valid compound patterns", () => {
    [WRATH_CARDS, SLOTH_CARDS, GREED_CARDS, ENVY_CARDS, PRIDE_CARDS, LUST_CARDS, GLUTTONY_CARDS].forEach((deck) => {
      const patterns = new Set(deck.map((c) => c.compoundPattern));
      expect(patterns.size).toBeGreaterThanOrEqual(1);
      patterns.forEach((p) => expect(["standard", "aggressive", "slowburn"]).toContain(p));
    });
  });

  it("wrath cards average higher damage than sloth", () => {
    const wrathDmg = WRATH_CARDS.flatMap((c) =>
      c.effects.filter((e) => e.type === "damage").map((e) => e.baseValue)
    );
    const slothDmg = SLOTH_CARDS.flatMap((c) =>
      c.effects.filter((e) => e.type === "damage").map((e) => e.baseValue)
    );
    const wrathAvg = wrathDmg.length > 0 ? wrathDmg.reduce((a, b) => a + b, 0) / wrathDmg.length : 0;
    const slothAvg = slothDmg.length > 0 ? slothDmg.reduce((a, b) => a + b, 0) / slothDmg.length : 0;
    expect(wrathAvg).toBeGreaterThan(slothAvg);
  });
});
