/**
 * Tests for v6.6.1 — Mobile touch blocking fix and coaching toggle
 *
 * Verifies that:
 * 1. GameCoach outer container uses pointer-events-none
 * 2. Only inner card uses pointer-events-auto
 * 3. PracticeAnnotations outer container uses pointer-events-none
 * 4. Coaching can be toggled off globally
 * 5. CathedralTransition already uses pointer-events-none
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

function readComponent(name: string): string {
  return readFileSync(
    resolve(__dirname, `../client/src/components/${name}`),
    "utf-8"
  );
}

describe("Mobile touch blocking fix", () => {
  describe("GameCoach", () => {
    const src = readComponent("GameCoach.tsx");

    it("outer container should use pointer-events-none", () => {
      // The outermost motion.div should have pointer-events-none
      expect(src).toContain("pointer-events-none");
      // Verify it's on the fixed container, not just anywhere
      const fixedLine = src.split("\n").find(
        (l) => l.includes("fixed") && l.includes("bottom-24") && l.includes("z-[100]")
      );
      expect(fixedLine).toBeDefined();
      expect(fixedLine).toContain("pointer-events-none");
    });

    it("inner card should use pointer-events-auto for dismiss buttons", () => {
      // The inner card div should have pointer-events-auto
      const innerCard = src.split("\n").find(
        (l) => l.includes("pointer-events-auto") && l.includes("backdrop-blur")
      );
      expect(innerCard).toBeDefined();
    });

    it("should not have z-index 9990 (was too high, blocking everything)", () => {
      expect(src).not.toContain("z-[9990]");
    });

    it("should export isCoachingDisabled function", () => {
      expect(src).toContain("export function isCoachingDisabled");
    });

    it("should export setCoachingDisabled function", () => {
      expect(src).toContain("export function setCoachingDisabled");
    });

    it("should have a toggle-off button with EyeOff icon", () => {
      expect(src).toContain("EyeOff");
      expect(src).toContain("Turn off coaching tips");
    });

    it("should use localStorage key for coaching disabled state", () => {
      expect(src).toContain("7sins_coaching_disabled");
    });

    it("should check coachingOff before showing any tips", () => {
      // Every showTip call should check coachingOff
      expect(src).toContain("if (!firstGame || coachingOff) return");
    });

    it("should have auto-dismiss timer with progress bar", () => {
      expect(src).toContain("autoDismissMs");
    });
  });

  describe("PracticeAnnotations", () => {
    const src = readComponent("PracticeAnnotations.tsx");

    it("outer container should use pointer-events-none", () => {
      const fixedLine = src.split("\n").find(
        (l) => l.includes("fixed") && l.includes("pointer-events-none") && l.includes("z-[100]")
      );
      expect(fixedLine).toBeDefined();
    });

    it("inner card should use pointer-events-auto", () => {
      const innerCard = src.split("\n").find(
        (l) => l.includes("pointer-events-auto") && l.includes("backdrop-blur")
      );
      expect(innerCard).toBeDefined();
    });

    it("should not use z-[60] (was too low, could still block)", () => {
      // The old z-[60] was inconsistent; now uses z-[100] matching GameCoach
      const fixedLine = src.split("\n").find(
        (l) => l.includes("fixed") && l.includes("z-[60]")
      );
      expect(fixedLine).toBeUndefined();
    });

    it("should import isCoachingDisabled from GameCoach", () => {
      expect(src).toContain('import { isCoachingDisabled, setCoachingDisabled } from "./GameCoach"');
    });

    it("should have a toggle-off button with EyeOff icon", () => {
      expect(src).toContain("EyeOff");
      expect(src).toContain("Turn off all coaching tips");
    });

    it("should check coachingOff before showing annotations", () => {
      expect(src).toContain("coachingOff");
    });

    it("should return null when coaching is disabled", () => {
      // The component should bail early when coachingOff is true
      expect(src).toContain("|| coachingOff) return null");
    });
  });

  describe("CathedralTransition", () => {
    const src = readComponent("CathedralTransition.tsx");

    it("should use pointer-events-none on outer container", () => {
      const fixedLine = src.split("\n").find(
        (l) => l.includes("fixed") && l.includes("pointer-events-none")
      );
      expect(fixedLine).toBeDefined();
    });

    it("should NOT use full-screen inset-0 background (non-blocking banner)", () => {
      // The transition should be a floating banner, not a full-screen overlay
      const hasInsetX = src.includes("inset-x-0");
      const hasInset0FullScreen = src.split("\n").some(
        (l) => l.includes("fixed inset-0") && l.includes("background")
      );
      expect(hasInsetX).toBe(true);
      expect(hasInset0FullScreen).toBe(false);
    });

    it("should have tap-to-dismiss functionality", () => {
      expect(src).toContain("onClick={dismiss}");
      expect(src).toContain("tap to dismiss");
    });

    it("should have a safety timeout fallback", () => {
      expect(src).toContain("SAFETY_TIMEOUT");
    });
  });

  describe("Coaching toggle consistency", () => {
    const gameCoach = readComponent("GameCoach.tsx");
    const practiceAnnotations = readComponent("PracticeAnnotations.tsx");

    it("both components should use the same localStorage key", () => {
      // GameCoach defines the key
      expect(gameCoach).toContain("7sins_coaching_disabled");
      // PracticeAnnotations imports from GameCoach
      expect(practiceAnnotations).toContain("isCoachingDisabled");
      expect(practiceAnnotations).toContain("setCoachingDisabled");
    });

    it("both components should use z-[100] for consistent layering", () => {
      expect(gameCoach).toContain("z-[100]");
      expect(practiceAnnotations).toContain("z-[100]");
    });
  });
});
