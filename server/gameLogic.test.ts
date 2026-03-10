/**
 * Game Logic Tests
 *
 * Tests for card data integrity, compounding mechanic,
 * and shared game type calculations.
 */

import { describe, expect, it } from "vitest";
import { ALL_CARDS, WRATH_CARDS, SLOTH_CARDS, GREED_CARDS, ENVY_CARDS, CARD_MAP, getCardById, getDeckForSin } from "../shared/cardData";
import { calculateEffectiveValue, MAX_ROUNDS, STARTING_HP, HAND_SIZE, CARDS_PER_DECK } from "../shared/gameTypes";

describe("Card Data Integrity", () => {
  it("has exactly 12 wrath cards", () => {
    expect(WRATH_CARDS).toHaveLength(12);
  });

  it("has exactly 12 sloth cards", () => {
    expect(SLOTH_CARDS).toHaveLength(12);
  });

  it("has 48 total cards (4 sins x 12)", () => {
    expect(ALL_CARDS).toHaveLength(48);
  });

  it("has exactly 12 greed cards", () => {
    expect(GREED_CARDS).toHaveLength(12);
  });

  it("has exactly 12 envy cards", () => {
    expect(ENVY_CARDS).toHaveLength(12);
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
});

describe("Card Registry", () => {
  it("CARD_MAP contains all cards", () => {
    expect(Object.keys(CARD_MAP)).toHaveLength(48);
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

  it("getDeckForSin returns 12 card IDs for wrath", () => {
    const deck = getDeckForSin("wrath");
    expect(deck).toHaveLength(12);
    deck.forEach((id) => {
      expect(id).toMatch(/^wrath_/);
    });
  });

  it("getDeckForSin returns 12 card IDs for sloth", () => {
    const deck = getDeckForSin("sloth");
    expect(deck).toHaveLength(12);
    deck.forEach((id) => {
      expect(id).toMatch(/^sloth_/);
    });
  });

  it("getDeckForSin returns 12 card IDs for greed", () => {
    const deck = getDeckForSin("greed");
    expect(deck).toHaveLength(12);
    deck.forEach((id) => {
      expect(id).toMatch(/^greed_/);
    });
  });

  it("getDeckForSin returns 12 card IDs for envy", () => {
    const deck = getDeckForSin("envy");
    expect(deck).toHaveLength(12);
    deck.forEach((id) => {
      expect(id).toMatch(/^envy_/);
    });
  });
});

describe("Compounding Mechanic", () => {
  it("round 1: effective = base × 1", () => {
    expect(calculateEffectiveValue(3, 1)).toBe(3);
  });

  it("round 5: effective = base × 5", () => {
    expect(calculateEffectiveValue(3, 5)).toBe(15);
  });

  it("round 10: effective = base × 10", () => {
    expect(calculateEffectiveValue(3, 10)).toBe(30);
  });

  it("round 15: caps at round 10 (base × 10)", () => {
    expect(calculateEffectiveValue(3, 15)).toBe(30);
  });

  it("base value 0 always returns 0", () => {
    expect(calculateEffectiveValue(0, 5)).toBe(0);
  });

  it("base value 1 equals round number", () => {
    for (let round = 1; round <= 10; round++) {
      expect(calculateEffectiveValue(1, round)).toBe(round);
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

  it("CARDS_PER_DECK is 12", () => {
    expect(CARDS_PER_DECK).toBe(12);
  });
});

describe("Card Balance Sanity Checks", () => {
  it("no card has base damage above 6", () => {
    ALL_CARDS.forEach((card) => {
      card.effects.forEach((effect) => {
        if (effect.type === "damage") {
          expect(effect.baseValue).toBeLessThanOrEqual(6);
        }
      });
    });
  });

  it("no card costs more than 5", () => {
    ALL_CARDS.forEach((card) => {
      expect(card.cost).toBeLessThanOrEqual(5);
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
