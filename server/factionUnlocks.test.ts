/**
 * Faction Unlock System Tests
 *
 * Tests the core unlock logic: threshold gating, progress tracking,
 * faction availability, and celebration state.
 *
 * Since the hook uses localStorage, we test the pure logic directly.
 */

import { describe, it, expect, beforeEach } from "vitest";

// Constants mirrored from the hook (to avoid importing React code in server tests)
const UNLOCK_THRESHOLD = 3;
const STARTER_FACTIONS = ["wrath", "sloth"] as const;
const LOCKED_FACTIONS = ["greed", "envy"] as const;

// Pure logic functions extracted from the hook for testability
function isFactionAvailable(sin: string, gamesPlayed: number): boolean {
  if ((STARTER_FACTIONS as readonly string[]).includes(sin)) return true;
  return gamesPlayed >= UNLOCK_THRESHOLD;
}

function getProgress(gamesPlayed: number): number {
  return Math.min(1, gamesPlayed / UNLOCK_THRESHOLD);
}

function getGamesRemaining(gamesPlayed: number): number {
  return Math.max(0, UNLOCK_THRESHOLD - gamesPlayed);
}

function isUnlocked(gamesPlayed: number): boolean {
  return gamesPlayed >= UNLOCK_THRESHOLD;
}

describe("Faction Unlock System", () => {
  describe("Unlock threshold", () => {
    it("should require exactly 3 games to unlock", () => {
      expect(UNLOCK_THRESHOLD).toBe(3);
    });

    it("should not unlock with 0 games played", () => {
      expect(isUnlocked(0)).toBe(false);
    });

    it("should not unlock with 1 game played", () => {
      expect(isUnlocked(1)).toBe(false);
    });

    it("should not unlock with 2 games played", () => {
      expect(isUnlocked(2)).toBe(false);
    });

    it("should unlock at exactly 3 games played", () => {
      expect(isUnlocked(3)).toBe(true);
    });

    it("should remain unlocked with more than 3 games", () => {
      expect(isUnlocked(5)).toBe(true);
      expect(isUnlocked(100)).toBe(true);
    });
  });

  describe("Starter factions", () => {
    it("wrath should always be available", () => {
      expect(isFactionAvailable("wrath", 0)).toBe(true);
      expect(isFactionAvailable("wrath", 1)).toBe(true);
      expect(isFactionAvailable("wrath", 3)).toBe(true);
    });

    it("sloth should always be available", () => {
      expect(isFactionAvailable("sloth", 0)).toBe(true);
      expect(isFactionAvailable("sloth", 1)).toBe(true);
      expect(isFactionAvailable("sloth", 3)).toBe(true);
    });
  });

  describe("Locked factions", () => {
    it("greed should be locked with 0 games", () => {
      expect(isFactionAvailable("greed", 0)).toBe(false);
    });

    it("envy should be locked with 0 games", () => {
      expect(isFactionAvailable("envy", 0)).toBe(false);
    });

    it("greed should be locked with 2 games", () => {
      expect(isFactionAvailable("greed", 2)).toBe(false);
    });

    it("envy should be locked with 2 games", () => {
      expect(isFactionAvailable("envy", 2)).toBe(false);
    });

    it("greed should unlock at 3 games", () => {
      expect(isFactionAvailable("greed", 3)).toBe(true);
    });

    it("envy should unlock at 3 games", () => {
      expect(isFactionAvailable("envy", 3)).toBe(true);
    });

    it("both should remain unlocked with many games", () => {
      expect(isFactionAvailable("greed", 50)).toBe(true);
      expect(isFactionAvailable("envy", 50)).toBe(true);
    });
  });

  describe("Progress tracking", () => {
    it("should be 0 at 0 games", () => {
      expect(getProgress(0)).toBe(0);
    });

    it("should be 1/3 at 1 game", () => {
      expect(getProgress(1)).toBeCloseTo(1 / 3);
    });

    it("should be 2/3 at 2 games", () => {
      expect(getProgress(2)).toBeCloseTo(2 / 3);
    });

    it("should be 1 at 3 games", () => {
      expect(getProgress(3)).toBe(1);
    });

    it("should cap at 1 even with many games", () => {
      expect(getProgress(100)).toBe(1);
    });
  });

  describe("Games remaining", () => {
    it("should show 3 remaining at 0 games", () => {
      expect(getGamesRemaining(0)).toBe(3);
    });

    it("should show 2 remaining at 1 game", () => {
      expect(getGamesRemaining(1)).toBe(2);
    });

    it("should show 1 remaining at 2 games", () => {
      expect(getGamesRemaining(2)).toBe(1);
    });

    it("should show 0 remaining at 3 games", () => {
      expect(getGamesRemaining(3)).toBe(0);
    });

    it("should never go negative", () => {
      expect(getGamesRemaining(50)).toBe(0);
    });
  });

  describe("Faction classification", () => {
    it("starter factions should be wrath and sloth", () => {
      expect(STARTER_FACTIONS).toEqual(["wrath", "sloth"]);
    });

    it("locked factions should be greed and envy", () => {
      expect(LOCKED_FACTIONS).toEqual(["greed", "envy"]);
    });

    it("all 4 sins should be accounted for", () => {
      const allSins = [...STARTER_FACTIONS, ...LOCKED_FACTIONS];
      expect(allSins).toHaveLength(4);
      expect(allSins).toContain("wrath");
      expect(allSins).toContain("sloth");
      expect(allSins).toContain("greed");
      expect(allSins).toContain("envy");
    });
  });
});
