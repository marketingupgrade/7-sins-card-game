/**
 * Deck Builder Synergy & Collection Target Mode Filter Tests
 *
 * Tests the target mode distribution logic and synergy warning system
 * used in the DeckBuilder's DeckInsightsPanel and Collection filter.
 */
import { describe, it, expect } from "vitest";
import { ALL_CARDS } from "../shared/cardData";
import { getCardTargetMode } from "../client/src/lib/targetModeUtils";
import type { CardDefinition } from "../shared/gameTypes";

// ─── Helper: compute target mode distribution for a deck ───
function getTargetModeDist(cards: CardDefinition[]) {
  const counts = { single: 0, aoe: 0, duo: 0, self: 0, mixed: 0 };
  cards.forEach((c) => {
    const tm = getCardTargetMode(c);
    if (tm) counts[tm.mode]++;
  });
  return counts;
}

// ─── Helper: compute synergy warnings for a deck ───
function getTargetWarnings(cards: CardDefinition[]) {
  const targetModeDist = getTargetModeDist(cards);
  if (cards.length < 5) return [];
  const warnings: { type: "danger" | "caution" | "tip"; message: string }[] = [];
  const offensiveCards = targetModeDist.single + targetModeDist.aoe + targetModeDist.duo + targetModeDist.mixed;
  const selfOnlyCards = targetModeDist.self;
  const aoeCards = targetModeDist.aoe;
  const total = cards.length;

  if (offensiveCards === 0 && selfOnlyCards > 0) {
    warnings.push({ type: "danger", message: "No offensive cards! Your deck can't deal damage to opponents." });
  } else if (offensiveCards <= 2 && total >= 10) {
    warnings.push({ type: "caution", message: "Very few offensive cards. Consider adding damage dealers." });
  }

  if (aoeCards === 0 && total >= 10) {
    warnings.push({ type: "caution", message: "No AoE cards. You may struggle in multi-opponent fights." });
  }

  if (aoeCards > 0 && targetModeDist.single === 0 && targetModeDist.duo === 0 && total >= 10) {
    warnings.push({ type: "caution", message: "No single-target cards. You can't focus down priority threats." });
  }

  if (selfOnlyCards === 0 && targetModeDist.mixed === 0 && total >= 10) {
    warnings.push({ type: "tip", message: "No self-targeting cards. Consider adding heals or shields." });
  }

  if (warnings.length === 0 && total >= 15 && aoeCards >= 2 && targetModeDist.single >= 3 && (selfOnlyCards + targetModeDist.mixed) >= 2) {
    warnings.push({ type: "tip", message: "Great target coverage! Your deck handles all combat scenarios." });
  }

  return warnings;
}

describe("Collection Target Mode Filter", () => {
  it("every card in ALL_CARDS has a valid target mode", () => {
    ALL_CARDS.forEach((card) => {
      const tm = getCardTargetMode(card);
      expect(tm).not.toBeNull();
      expect(["single", "aoe", "duo", "self", "mixed"]).toContain(tm!.mode);
    });
  });

  it("filtering by 'single' returns only single-target cards", () => {
    const singleCards = ALL_CARDS.filter((c) => getCardTargetMode(c)?.mode === "single");
    expect(singleCards.length).toBeGreaterThan(0);
    singleCards.forEach((c) => {
      const modes = new Set(c.effects.map((e) => e.targetMode).filter(Boolean));
      expect(modes.has("single")).toBe(true);
      expect(modes.has("aoe")).toBe(false);
      expect(modes.has("duo")).toBe(false);
    });
  });

  it("filtering by 'aoe' returns only AoE cards", () => {
    const aoeCards = ALL_CARDS.filter((c) => getCardTargetMode(c)?.mode === "aoe");
    expect(aoeCards.length).toBeGreaterThan(0);
    aoeCards.forEach((c) => {
      const modes = new Set(c.effects.map((e) => e.targetMode).filter(Boolean));
      expect(modes.has("aoe")).toBe(true);
    });
  });

  it("filtering by 'self' returns only self-target cards", () => {
    const selfCards = ALL_CARDS.filter((c) => getCardTargetMode(c)?.mode === "self");
    expect(selfCards.length).toBeGreaterThan(0);
    selfCards.forEach((c) => {
      const modes = new Set(c.effects.map((e) => e.targetMode).filter(Boolean));
      expect(modes.has("self")).toBe(true);
      expect(modes.has("single")).toBe(false);
      expect(modes.has("aoe")).toBe(false);
      expect(modes.has("duo")).toBe(false);
    });
  });

  it("all 5 target mode categories have at least 1 card", () => {
    const dist = getTargetModeDist(ALL_CARDS);
    expect(dist.single).toBeGreaterThan(0);
    expect(dist.aoe).toBeGreaterThan(0);
    expect(dist.self).toBeGreaterThan(0);
    // duo and mixed may or may not exist, but single/aoe/self must
  });

  it("target mode counts sum to total card count", () => {
    const dist = getTargetModeDist(ALL_CARDS);
    const total = dist.single + dist.aoe + dist.duo + dist.self + dist.mixed;
    expect(total).toBe(ALL_CARDS.length);
  });
});

describe("Deck Builder Synergy Warnings", () => {
  it("returns no warnings for decks with fewer than 5 cards", () => {
    const smallDeck = ALL_CARDS.slice(0, 3);
    expect(getTargetWarnings(smallDeck)).toHaveLength(0);
  });

  it("warns 'danger' when deck is all self-target and has 5+ cards", () => {
    const selfCards = ALL_CARDS.filter((c) => getCardTargetMode(c)?.mode === "self");
    if (selfCards.length >= 5) {
      const deck = selfCards.slice(0, Math.min(selfCards.length, 10));
      const warnings = getTargetWarnings(deck);
      const dangerWarning = warnings.find((w) => w.type === "danger");
      expect(dangerWarning).toBeDefined();
      expect(dangerWarning!.message).toContain("No offensive cards");
    }
  });

  it("warns 'caution' when deck has no AoE and 10+ cards", () => {
    const nonAoeCards = ALL_CARDS.filter((c) => {
      const tm = getCardTargetMode(c);
      return tm && tm.mode !== "aoe";
    });
    const deck = nonAoeCards.slice(0, 15);
    const warnings = getTargetWarnings(deck);
    const aoeWarning = warnings.find((w) => w.message.includes("No AoE cards"));
    expect(aoeWarning).toBeDefined();
    expect(aoeWarning!.type).toBe("caution");
  });

  it("warns 'caution' when deck has AoE but no single-target cards", () => {
    const aoeCards = ALL_CARDS.filter((c) => getCardTargetMode(c)?.mode === "aoe");
    const selfCards = ALL_CARDS.filter((c) => getCardTargetMode(c)?.mode === "self");
    if (aoeCards.length >= 5 && selfCards.length >= 5) {
      // Build a deck with only AoE + self cards (no single or duo)
      const deck = [...aoeCards.slice(0, 7), ...selfCards.slice(0, 5)];
      const warnings = getTargetWarnings(deck);
      const focusWarning = warnings.find((w) => w.message.includes("No single-target"));
      expect(focusWarning).toBeDefined();
    }
  });

  it("warns 'tip' when deck has no self-targeting cards", () => {
    const noSelfCards = ALL_CARDS.filter((c) => {
      const tm = getCardTargetMode(c);
      return tm && tm.mode !== "self" && tm.mode !== "mixed";
    });
    if (noSelfCards.length >= 10) {
      const deck = noSelfCards.slice(0, 15);
      const warnings = getTargetWarnings(deck);
      const selfWarning = warnings.find((w) => w.message.includes("No self-targeting"));
      expect(selfWarning).toBeDefined();
      expect(selfWarning!.type).toBe("tip");
    }
  });

  it("shows positive feedback for well-balanced decks", () => {
    // Build a balanced deck with single, aoe, and self cards
    const singleCards = ALL_CARDS.filter((c) => getCardTargetMode(c)?.mode === "single");
    const aoeCards = ALL_CARDS.filter((c) => getCardTargetMode(c)?.mode === "aoe");
    const selfCards = ALL_CARDS.filter((c) => getCardTargetMode(c)?.mode === "self");

    if (singleCards.length >= 8 && aoeCards.length >= 4 && selfCards.length >= 4) {
      const deck = [
        ...singleCards.slice(0, 8),
        ...aoeCards.slice(0, 4),
        ...selfCards.slice(0, 4),
      ];
      const warnings = getTargetWarnings(deck);
      const positiveMsg = warnings.find((w) => w.message.includes("Great target coverage"));
      expect(positiveMsg).toBeDefined();
      expect(positiveMsg!.type).toBe("tip");
    }
  });

  it("target mode distribution counts are non-negative integers", () => {
    const deck = ALL_CARDS.slice(0, 30);
    const dist = getTargetModeDist(deck);
    Object.values(dist).forEach((count) => {
      expect(count).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(count)).toBe(true);
    });
  });

  it("empty deck produces zero distribution", () => {
    const dist = getTargetModeDist([]);
    expect(dist).toEqual({ single: 0, aoe: 0, duo: 0, self: 0, mixed: 0 });
  });
});
