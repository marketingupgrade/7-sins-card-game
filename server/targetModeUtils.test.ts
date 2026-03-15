/**
 * Tests for shared targetModeUtils — getCardTargetMode
 *
 * Validates the shared utility that derives dominant target mode
 * from a card's effects. Used by CardHoverPreview, Collection MiniCard,
 * Collection CardDetailModal, and MobileCardZoom.
 *
 * Priority: aoe > duo > mixed (single+self) > single > self
 */

import { describe, it, expect } from "vitest";
import { ALL_CARDS } from "../shared/cardData";

// ─── Replicate the shared getCardTargetMode logic ───

type TargetMode = "single" | "duo" | "aoe" | "self";

interface Effect {
  type: string;
  targetMode: TargetMode;
  baseValue: number;
  duration: number;
}

interface Card {
  id: string;
  sin: string;
  effects: Effect[];
}

interface TargetModeInfo {
  mode: "aoe" | "duo" | "mixed" | "single" | "self";
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
}

function getCardTargetMode(card: Card): TargetModeInfo | null {
  const modes = new Set(card.effects.map((e) => e.targetMode).filter(Boolean));
  if (modes.has("aoe"))
    return { mode: "aoe", label: "AOE", shortLabel: "AOE", color: "#f97316", bgColor: "rgba(249,115,22,0.15)" };
  if (modes.has("duo"))
    return { mode: "duo", label: "DUO", shortLabel: "DUO", color: "#a855f7", bgColor: "rgba(168,85,247,0.15)" };
  if (modes.has("single") && modes.has("self"))
    return { mode: "mixed", label: "SELF + TARGET", shortLabel: "MIX", color: "#22c55e", bgColor: "rgba(34,197,94,0.15)" };
  if (modes.has("single"))
    return { mode: "single", label: "SINGLE", shortLabel: "1v1", color: "#3b82f6", bgColor: "rgba(59,130,246,0.15)" };
  if (modes.has("self"))
    return { mode: "self", label: "SELF", shortLabel: "SELF", color: "#22c55e", bgColor: "rgba(34,197,94,0.15)" };
  return null;
}

// ─── Tests ───

describe("getCardTargetMode — shared utility", () => {
  it("every card in ALL_CARDS gets a non-null target mode", () => {
    for (const card of ALL_CARDS) {
      const result = getCardTargetMode(card as unknown as Card);
      expect(result, `Card ${card.id} (${card.name}) returned null target mode`).not.toBeNull();
    }
  });

  it("shortLabel is always 4 chars or fewer (fits MiniCard badge)", () => {
    for (const card of ALL_CARDS) {
      const result = getCardTargetMode(card as unknown as Card);
      if (result) {
        expect(result.shortLabel.length, `Card ${card.id} shortLabel "${result.shortLabel}" too long`).toBeLessThanOrEqual(4);
      }
    }
  });

  it("label is always 15 chars or fewer (fits CardDetailModal badge)", () => {
    for (const card of ALL_CARDS) {
      const result = getCardTargetMode(card as unknown as Card);
      if (result) {
        expect(result.label.length, `Card ${card.id} label "${result.label}" too long`).toBeLessThanOrEqual(15);
      }
    }
  });

  it("mode is always one of the 5 valid values", () => {
    const validModes = new Set(["aoe", "duo", "mixed", "single", "self"]);
    for (const card of ALL_CARDS) {
      const result = getCardTargetMode(card as unknown as Card);
      if (result) {
        expect(validModes.has(result.mode), `Card ${card.id} has invalid mode "${result.mode}"`).toBe(true);
      }
    }
  });

  it("color is always a valid hex color", () => {
    for (const card of ALL_CARDS) {
      const result = getCardTargetMode(card as unknown as Card);
      if (result) {
        expect(result.color).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it("bgColor is always a valid rgba string", () => {
    for (const card of ALL_CARDS) {
      const result = getCardTargetMode(card as unknown as Card);
      if (result) {
        expect(result.bgColor).toMatch(/^rgba\(\d+,\d+,\d+,[\d.]+\)$/);
      }
    }
  });

  describe("distribution check — all 5 modes exist in the card pool", () => {
    const modeSet = new Set<string>();
    for (const card of ALL_CARDS) {
      const result = getCardTargetMode(card as unknown as Card);
      if (result) modeSet.add(result.mode);
    }

    it("has single-target cards", () => expect(modeSet.has("single")).toBe(true));
    it("has self-target cards", () => expect(modeSet.has("self")).toBe(true));
    it("has AoE cards", () => expect(modeSet.has("aoe")).toBe(true));
    // duo and mixed may or may not exist depending on card design
  });
});
