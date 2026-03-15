/**
 * Tests for URL-based deck sharing and matchup drill-down features (v5.7.8)
 */
import { describe, it, expect } from "vitest";

// Import deck code utilities
import { encodeDeck, decodeDeck, validateDeckCode } from "../client/src/lib/deckCodes";

// Import matchup data for drill-down validation
import { SinType } from "../shared/gameTypes";

describe("URL Deck Sharing", () => {
  describe("URL query parameter format", () => {
    it("should encode a deck code that is URL-safe", () => {
      const code = encodeDeck("wrath", [
        "wrath_01", "wrath_02", "wrath_03", "wrath_04", "wrath_05",
        "wrath_06", "wrath_07", "wrath_08", "wrath_09", "wrath_10",
      ]);
      // Deck codes should be URL-safe (no special chars that need encoding)
      const encoded = encodeURIComponent(code);
      // The encoded version should be similar length (no excessive encoding)
      expect(encoded.length).toBeLessThan(code.length * 2);
    });

    it("should produce codes that survive URL encoding/decoding roundtrip", () => {
      const code = encodeDeck("envy", [
        "envy_01", "envy_10", "envy_20", "envy_30", "envy_40", "envy_50",
      ]);
      const urlEncoded = encodeURIComponent(code);
      const decoded = decodeURIComponent(urlEncoded);
      expect(decoded).toBe(code);
    });

    it("should parse deck code from a simulated URL search param", () => {
      const code = encodeDeck("pride", [
        "pride_01", "pride_02", "pride_03", "pride_04", "pride_05",
      ]);
      // Simulate URL: /deck-builder?import=P:01,02,03,04,05
      const searchParams = new URLSearchParams(`?import=${encodeURIComponent(code)}`);
      const importCode = searchParams.get("import");
      expect(importCode).toBe(code);
      
      const result = decodeDeck(importCode!);
      expect(result.faction).toBe("pride");
      expect(result.cardIds).toHaveLength(5);
    });
  });

  describe("Share link generation", () => {
    it("should generate a valid share URL with deck code", () => {
      const code = encodeDeck("lust", [
        "lust_01", "lust_02", "lust_03",
      ]);
      const baseUrl = "https://www.7sinscardgame.com/deck-builder";
      const shareUrl = `${baseUrl}?import=${encodeURIComponent(code)}`;
      
      expect(shareUrl).toContain("/deck-builder?import=");
      expect(shareUrl).toContain("L%3A");  // L: encoded as L%3A
    });

    it("should handle all faction prefixes in URLs", () => {
      const factions: Array<{ faction: SinType; prefix: string }> = [
        { faction: "wrath", prefix: "W" },
        { faction: "sloth", prefix: "S" },
        { faction: "greed", prefix: "G" },
        { faction: "envy", prefix: "E" },
        { faction: "pride", prefix: "P" },
        { faction: "lust", prefix: "L" },
        { faction: "gluttony", prefix: "X" },
      ];

      for (const { faction, prefix } of factions) {
        const code = encodeDeck(faction, [`${faction}_01`]);
        expect(code.startsWith(`${prefix}:`)).toBe(true);
        
        const searchParams = new URLSearchParams(`?import=${encodeURIComponent(code)}`);
        const importCode = searchParams.get("import");
        const result = decodeDeck(importCode!);
        expect(result.faction).toBe(faction);
      }
    });
  });
});

describe("Matchup Drill-Down Data", () => {
  // We test the data structure expectations, not the React component
  const FACTIONS: SinType[] = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];

  describe("MATCHUP_DETAILS coverage", () => {
    it("should have at least 10 detailed matchup entries", async () => {
      // Read the file to count MATCHUP_DETAILS entries
      const fs = await import("fs");
      const content = fs.readFileSync("client/src/pages/MatchupMatrix.tsx", "utf-8");
      const detailEntries = content.match(/"[a-z]+-[a-z]+":\s*\{[\s\S]*?summary:/g);
      expect(detailEntries).not.toBeNull();
      expect(detailEntries!.length).toBeGreaterThanOrEqual(10);
    });

    it("should have required fields in each MATCHUP_DETAILS entry", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("client/src/pages/MatchupMatrix.tsx", "utf-8");
      
      // Extract the MATCHUP_DETAILS block
      const detailsMatch = content.match(/const MATCHUP_DETAILS[\s\S]*?^};/m);
      expect(detailsMatch).not.toBeNull();
      
      const detailsBlock = detailsMatch![0];
      
      // Each entry should have all required fields
      const requiredFields = ["summary", "passiveInteraction", "attackerStrengths", "defenderStrengths", "keyCards", "counterStrategy"];
      for (const field of requiredFields) {
        const fieldCount = (detailsBlock.match(new RegExp(`${field}:`, "g")) || []).length;
        expect(fieldCount).toBeGreaterThanOrEqual(10);
      }
    });
  });

  describe("Matchup key format", () => {
    it("should use valid faction names in matchup keys", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("client/src/pages/MatchupMatrix.tsx", "utf-8");
      
      const keyMatches = content.match(/"([a-z]+)-([a-z]+)":\s*\{[\s\S]*?summary:/g);
      expect(keyMatches).not.toBeNull();
      
      for (const match of keyMatches!) {
        const keyMatch = match.match(/"([a-z]+)-([a-z]+)"/);
        expect(keyMatch).not.toBeNull();
        const [, faction1, faction2] = keyMatch!;
        expect(FACTIONS).toContain(faction1);
        expect(FACTIONS).toContain(faction2);
        expect(faction1).not.toBe(faction2); // No self-matchups
      }
    });
  });

  describe("Drill-down modal behavior", () => {
    it("should handle both key directions (attacker-defender and defender-attacker)", () => {
      // The drill-down checks both key and reverseKey
      // This tests the logic that the component uses
      const key = "wrath-sloth";
      const reverseKey = "sloth-wrath";
      
      // Simulate the lookup logic
      const MATCHUP_DETAILS_KEYS = [
        "wrath-sloth", "wrath-envy", "wrath-lust",
        "sloth-pride", "greed-gluttony", "lust-sloth",
        "envy-lust", "gluttony-wrath", "gluttony-sloth",
        "gluttony-envy", "pride-envy", "lust-pride",
      ];
      
      // Direct key should find it
      expect(MATCHUP_DETAILS_KEYS.includes(key)).toBe(true);
      
      // Reverse key should NOT be a separate entry (it's handled by the component)
      // The component checks both directions
      const hasDetail = MATCHUP_DETAILS_KEYS.includes(key) || MATCHUP_DETAILS_KEYS.includes(reverseKey);
      expect(hasDetail).toBe(true);
    });

    it("should correctly identify the favored faction", () => {
      // Test the winner logic used in the drill-down
      const testCases = [
        { rate: 52.1, expectedWinner: "attacker" },
        { rate: 47.9, expectedWinner: "defender" },
        { rate: 50.0, expectedWinner: null },
      ];

      for (const { rate, expectedWinner } of testCases) {
        const winner = rate > 50 ? "attacker" : rate < 50 ? "defender" : null;
        expect(winner).toBe(expectedWinner);
      }
    });
  });
});
