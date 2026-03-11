/**
 * Game Logic Tests
 *
 * Tests for card data integrity, flat/compounding mechanic,
 * and shared game type calculations.
 */

import { describe, expect, it } from "vitest";
import { ALL_CARDS, WRATH_CARDS, SLOTH_CARDS, GREED_CARDS, ENVY_CARDS, CARD_MAP, getCardById, getDeckForSin } from "../shared/cardData";
import { getCompoundTickValue, COMPOUND_MULTIPLIERS, MAX_ROUNDS, STARTING_HP, HAND_SIZE, CARDS_PER_DECK } from "../shared/gameTypes";

describe("Card Data Integrity", () => {
  it("has exactly 36 wrath cards", () => {
    expect(WRATH_CARDS).toHaveLength(36);
  });

  it("has exactly 36 sloth cards", () => {
    expect(SLOTH_CARDS).toHaveLength(36);
  });

  it("has 144 total cards (4 sins x 36)", () => {
    expect(ALL_CARDS).toHaveLength(144);
  });

  it("has exactly 36 greed cards", () => {
    expect(GREED_CARDS).toHaveLength(36);
  });

  it("has exactly 36 envy cards", () => {
    expect(ENVY_CARDS).toHaveLength(36);
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
      expect(card.flavorText).toBeTruthy();
      expect(card.narratorQuip).toBeTruthy();
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

  it("every card has a cardType (flat or compounding)", () => {
    ALL_CARDS.forEach((card) => {
      expect(["flat", "compounding"]).toContain(card.cardType);
    });
  });

  it("compounding cards have duration 3 on at least one effect", () => {
    const compoundingCards = ALL_CARDS.filter((c) => c.cardType === "compounding");
    expect(compoundingCards.length).toBeGreaterThan(0);
    compoundingCards.forEach((card) => {
      const hasDuration3 = card.effects.some((e) => e.duration === 3);
      expect(hasDuration3).toBe(true);
    });
  });

  it("flat cards have duration 0 on all effects", () => {
    const flatCards = ALL_CARDS.filter((c) => c.cardType === "flat");
    expect(flatCards.length).toBeGreaterThan(0);
    flatCards.forEach((card) => {
      card.effects.forEach((effect) => {
        expect(effect.duration).toBe(0);
      });
    });
  });
});

describe("Card Registry", () => {
  it("CARD_MAP contains all cards", () => {
    expect(Object.keys(CARD_MAP)).toHaveLength(144);
  });

  it("getCardById returns correct card", () => {
    const card = getCardById("wrath_01");
    expect(card).toBeDefined();
    expect(card?.name).toBe("Fury Strike");
    expect(card?.sin).toBe("wrath");
  });

  it("getCardById returns undefined for invalid ID", () => {
    expect(getCardById("nonexistent")).toBeUndefined();
  });

  it("getDeckForSin returns 36 card IDs for wrath", () => {
    const deck = getDeckForSin("wrath");
    expect(deck).toHaveLength(36);
    deck.forEach((id) => {
      expect(id).toMatch(/^wrath_/);
    });
  });

  it("getDeckForSin returns 36 card IDs for sloth", () => {
    const deck = getDeckForSin("sloth");
    expect(deck).toHaveLength(36);
    deck.forEach((id) => {
      expect(id).toMatch(/^sloth_/);
    });
  });

  it("getDeckForSin returns 36 card IDs for greed", () => {
    const deck = getDeckForSin("greed");
    expect(deck).toHaveLength(36);
    deck.forEach((id) => {
      expect(id).toMatch(/^greed_/);
    });
  });

  it("getDeckForSin returns 36 card IDs for envy", () => {
    const deck = getDeckForSin("envy");
    expect(deck).toHaveLength(36);
    deck.forEach((id) => {
      expect(id).toMatch(/^envy_/);
    });
  });
});

describe("Compounding Mechanic (Fibonacci [1, 1, 2])", () => {
  it("COMPOUND_MULTIPLIERS is [1, 1, 2]", () => {
    expect(COMPOUND_MULTIPLIERS).toEqual([1, 1, 2]);
  });

  it("tick 0: base x 1", () => {
    expect(getCompoundTickValue(3, 0)).toBe(3);
  });

  it("tick 1: base x 1", () => {
    expect(getCompoundTickValue(3, 1)).toBe(3);
  });

  it("tick 2: base x 2 (the payoff)", () => {
    expect(getCompoundTickValue(3, 2)).toBe(6);
  });

  it("total over 3 ticks = base x 4", () => {
    const base = 3;
    const total = getCompoundTickValue(base, 0) + getCompoundTickValue(base, 1) + getCompoundTickValue(base, 2);
    expect(total).toBe(base * 4);
  });

  it("base value 0 always returns 0", () => {
    expect(getCompoundTickValue(0, 0)).toBe(0);
    expect(getCompoundTickValue(0, 1)).toBe(0);
    expect(getCompoundTickValue(0, 2)).toBe(0);
  });

  it("always returns integers", () => {
    for (let base = 1; base <= 10; base++) {
      for (let tick = 0; tick < 3; tick++) {
        const val = getCompoundTickValue(base, tick);
        expect(Number.isInteger(val)).toBe(true);
      }
    }
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

  it("CARDS_PER_DECK is 36", () => {
    expect(CARDS_PER_DECK).toBe(36);
  });
});

describe("Card Balance Sanity Checks", () => {
  it("no card has base damage above 8", () => {
    ALL_CARDS.forEach((card) => {
      card.effects.forEach((effect) => {
        if (effect.type === "damage") {
          expect(effect.baseValue).toBeLessThanOrEqual(8);
        }
      });
    });
  });

  it("no card costs more than 5", () => {
    ALL_CARDS.forEach((card) => {
      expect(card.cost).toBeLessThanOrEqual(5);
    });
  });

  it("each sin has a mix of flat and compounding cards", () => {
    [WRATH_CARDS, SLOTH_CARDS, GREED_CARDS, ENVY_CARDS].forEach((deck) => {
      const flatCount = deck.filter((c) => c.cardType === "flat").length;
      const compoundCount = deck.filter((c) => c.cardType === "compounding").length;
      expect(flatCount).toBeGreaterThanOrEqual(2);
      expect(compoundCount).toBeGreaterThanOrEqual(2);
    });
  });

  it("wrath cards average higher damage than sloth", () => {
    const wrathDmg = WRATH_CARDS.flatMap((c) =>
      c.effects.filter((e) => e.type === "damage" && e.target !== "self").map((e) => e.baseValue)
    );
    const slothDmg = SLOTH_CARDS.flatMap((c) =>
      c.effects.filter((e) => e.type === "damage").map((e) => e.baseValue)
    );
    const wrathAvg = wrathDmg.reduce((a, b) => a + b, 0) / wrathDmg.length;
    const slothAvg = slothDmg.reduce((a, b) => a + b, 0) / slothDmg.length;
    expect(wrathAvg).toBeGreaterThan(slothAvg);
  });
});
