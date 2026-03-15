/**
 * Tests for CardHoverPreview target mode badge logic
 *
 * Validates the getCardTargetMode helper that derives the dominant
 * target mode from a card's effects for display as a badge.
 * Priority: aoe > duo > single > self (most impactful shown first).
 */

import { describe, it, expect } from "vitest";

// ─── Replicate the getCardTargetMode logic from CardHoverPreview ───

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

function getCardTargetMode(card: Card): { mode: string; label: string; color: string; bgColor: string } | null {
  const modes = new Set(card.effects.map(e => e.targetMode).filter(Boolean));
  if (modes.has("aoe")) return { mode: "aoe", label: "AOE", color: "#f97316", bgColor: "rgba(249,115,22,0.15)" };
  if (modes.has("duo")) return { mode: "duo", label: "DUO", color: "#a855f7", bgColor: "rgba(168,85,247,0.15)" };
  if (modes.has("single") && modes.has("self")) return { mode: "mixed", label: "SELF + TARGET", color: "#22c55e", bgColor: "rgba(34,197,94,0.15)" };
  if (modes.has("single")) return { mode: "single", label: "SINGLE", color: "#3b82f6", bgColor: "rgba(59,130,246,0.15)" };
  if (modes.has("self")) return { mode: "self", label: "SELF", color: "#22c55e", bgColor: "rgba(34,197,94,0.15)" };
  return null;
}

// ─── Test helpers ───

function makeCard(id: string, targetModes: TargetMode[]): Card {
  return {
    id,
    sin: "wrath",
    effects: targetModes.map((tm, i) => ({
      type: `effect_${i}`,
      targetMode: tm,
      baseValue: 10,
      duration: 1,
    })),
  };
}

// ─── Tests ───

describe("getCardTargetMode — dominant target mode detection", () => {
  describe("single mode cards", () => {
    it("returns SINGLE for single-target cards", () => {
      const result = getCardTargetMode(makeCard("c1", ["single"]));
      expect(result).not.toBeNull();
      expect(result!.mode).toBe("single");
      expect(result!.label).toBe("SINGLE");
      expect(result!.color).toBe("#3b82f6");
    });

    it("returns SELF for self-only cards", () => {
      const result = getCardTargetMode(makeCard("c2", ["self"]));
      expect(result).not.toBeNull();
      expect(result!.mode).toBe("self");
      expect(result!.label).toBe("SELF");
    });

    it("returns AOE for aoe cards", () => {
      const result = getCardTargetMode(makeCard("c3", ["aoe"]));
      expect(result).not.toBeNull();
      expect(result!.mode).toBe("aoe");
      expect(result!.label).toBe("AOE");
      expect(result!.color).toBe("#f97316");
    });

    it("returns DUO for duo cards", () => {
      const result = getCardTargetMode(makeCard("c4", ["duo"]));
      expect(result).not.toBeNull();
      expect(result!.mode).toBe("duo");
      expect(result!.label).toBe("DUO");
      expect(result!.color).toBe("#a855f7");
    });
  });

  describe("priority ordering", () => {
    it("AoE takes priority over single", () => {
      const result = getCardTargetMode(makeCard("c5", ["single", "aoe"]));
      expect(result!.mode).toBe("aoe");
    });

    it("AoE takes priority over duo", () => {
      const result = getCardTargetMode(makeCard("c6", ["duo", "aoe"]));
      expect(result!.mode).toBe("aoe");
    });

    it("AoE takes priority over self", () => {
      const result = getCardTargetMode(makeCard("c7", ["self", "aoe"]));
      expect(result!.mode).toBe("aoe");
    });

    it("duo takes priority over single", () => {
      const result = getCardTargetMode(makeCard("c8", ["single", "duo"]));
      expect(result!.mode).toBe("duo");
    });

    it("duo takes priority over self", () => {
      const result = getCardTargetMode(makeCard("c9", ["self", "duo"]));
      expect(result!.mode).toBe("duo");
    });
  });

  describe("mixed self + single", () => {
    it("returns SELF + TARGET for cards with both self and single effects", () => {
      const result = getCardTargetMode(makeCard("c10", ["self", "single"]));
      expect(result).not.toBeNull();
      expect(result!.mode).toBe("mixed");
      expect(result!.label).toBe("SELF + TARGET");
    });
  });

  describe("edge cases", () => {
    it("returns null for cards with no target modes", () => {
      const card: Card = {
        id: "c11",
        sin: "wrath",
        effects: [{ type: "damage", targetMode: undefined as any, baseValue: 10, duration: 1 }],
      };
      const result = getCardTargetMode(card);
      expect(result).toBeNull();
    });

    it("returns null for cards with empty effects", () => {
      const card: Card = { id: "c12", sin: "wrath", effects: [] };
      const result = getCardTargetMode(card);
      expect(result).toBeNull();
    });

    it("deduplicates repeated target modes", () => {
      const result = getCardTargetMode(makeCard("c13", ["single", "single", "single"]));
      expect(result!.mode).toBe("single");
    });

    it("handles all modes present — AoE wins", () => {
      const result = getCardTargetMode(makeCard("c14", ["self", "single", "duo", "aoe"]));
      expect(result!.mode).toBe("aoe");
    });
  });

  describe("color and styling", () => {
    it("AOE badge is orange", () => {
      const result = getCardTargetMode(makeCard("aoe", ["aoe"]));
      expect(result!.color).toBe("#f97316");
      expect(result!.bgColor).toContain("249,115,22");
    });

    it("DUO badge is purple", () => {
      const result = getCardTargetMode(makeCard("duo", ["duo"]));
      expect(result!.color).toBe("#a855f7");
      expect(result!.bgColor).toContain("168,85,247");
    });

    it("SINGLE badge is blue", () => {
      const result = getCardTargetMode(makeCard("single", ["single"]));
      expect(result!.color).toBe("#3b82f6");
      expect(result!.bgColor).toContain("59,130,246");
    });

    it("SELF badge is green", () => {
      const result = getCardTargetMode(makeCard("self", ["self"]));
      expect(result!.color).toBe("#22c55e");
      expect(result!.bgColor).toContain("34,197,94");
    });

    it("SELF + TARGET badge is green", () => {
      const result = getCardTargetMode(makeCard("mixed", ["self", "single"]));
      expect(result!.color).toBe("#22c55e");
    });
  });
});
