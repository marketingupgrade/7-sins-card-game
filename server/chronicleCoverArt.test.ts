/**
 * Chronicle Cover Art Tests
 *
 * Tests the prompt builder logic, art style system, and rarity modifiers.
 * Does NOT call the actual Imagen API (that would be an integration test).
 */
import { describe, it, expect } from "vitest";
import { buildCoverArtPrompt } from "./chronicleCoverArt";
import type { CivilizationType, ChronicleRarity } from "../shared/chronicleTypes";
import type { SinType } from "../shared/gameTypes";

// ---- Helper: default params ----
function defaultParams(overrides: Partial<Parameters<typeof buildCoverArtPrompt>[0]> = {}) {
  return {
    title: "The Fall of the Iron Republic",
    civilizationType: "warrior_empire" as CivilizationType,
    rarityTier: "rare" as ChronicleRarity,
    dominantFactions: ["wrath", "greed"] as SinType[],
    turningPointRound: 8,
    totalEliminations: 3,
    excerpt: "A tale of blood and gold.",
    ...overrides,
  };
}

describe("Chronicle Cover Art — buildCoverArtPrompt", () => {
  it("returns a non-empty string", () => {
    const prompt = buildCoverArtPrompt(defaultParams());
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(100);
  });

  it("includes the chronicle title in the prompt", () => {
    const prompt = buildCoverArtPrompt(defaultParams({ title: "The Crimson Epoch" }));
    expect(prompt).toContain("The Crimson Epoch");
  });

  it("includes 'No text' instruction to prevent text in the image", () => {
    const prompt = buildCoverArtPrompt(defaultParams());
    expect(prompt.toLowerCase()).toContain("no text");
  });

  it("includes 'book cover' quality instruction", () => {
    const prompt = buildCoverArtPrompt(defaultParams());
    expect(prompt.toLowerCase()).toContain("book cover");
  });

  // ---- Civilization Type Art Styles ----

  describe("civilization type art styles", () => {
    it("warrior_empire uses crimson palette and oil painting medium", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ civilizationType: "warrior_empire" }));
      expect(prompt.toLowerCase()).toContain("crimson");
      expect(prompt.toLowerCase()).toContain("oil painting");
    });

    it("enlightened_republic uses celestial blue and Renaissance style", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ civilizationType: "enlightened_republic" }));
      expect(prompt.toLowerCase()).toContain("celestial blue");
      expect(prompt.toLowerCase()).toContain("renaissance");
    });

    it("merchant_federation uses amber palette and Dutch Golden Age style", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ civilizationType: "merchant_federation" }));
      expect(prompt.toLowerCase()).toContain("amber");
      expect(prompt.toLowerCase()).toContain("dutch golden age");
    });

    it("balanced uses earth tones and mixed media", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ civilizationType: "balanced" }));
      expect(prompt.toLowerCase()).toContain("earth tones");
      expect(prompt.toLowerCase()).toContain("mixed media");
    });
  });

  // ---- Rarity Modifiers ----

  describe("rarity tier modifiers", () => {
    it("common uses subdued intensity", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ rarityTier: "common" }));
      expect(prompt.toLowerCase()).toContain("subdued");
    });

    it("rare uses vivid intensity", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ rarityTier: "rare" }));
      expect(prompt.toLowerCase()).toContain("vivid");
    });

    it("epic uses dramatic intensity and special effects", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ rarityTier: "epic" }));
      expect(prompt.toLowerCase()).toContain("dramatic");
      expect(prompt.toLowerCase()).toContain("aurora");
    });

    it("legendary uses transcendent intensity and divine light", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ rarityTier: "legendary" }));
      expect(prompt.toLowerCase()).toContain("transcendent");
      expect(prompt.toLowerCase()).toContain("divine");
    });

    it("common does NOT include special visual effects", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ rarityTier: "common" }));
      expect(prompt.toLowerCase()).not.toContain("special visual effect");
    });

    it("legendary DOES include special visual effects", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ rarityTier: "legendary" }));
      expect(prompt.toLowerCase()).toContain("special visual effect");
    });
  });

  // ---- Faction Visual Elements ----

  describe("faction visual elements", () => {
    it("includes wrath visuals when wrath is dominant", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ dominantFactions: ["wrath"] }));
      expect(prompt.toLowerCase()).toContain("flames");
    });

    it("includes greed visuals when greed is dominant", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ dominantFactions: ["greed"] }));
      expect(prompt.toLowerCase()).toContain("gold coins");
    });

    it("includes envy visuals when envy is dominant", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ dominantFactions: ["envy"] }));
      expect(prompt.toLowerCase()).toContain("mirrors");
    });

    it("includes sloth visuals when sloth is dominant", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ dominantFactions: ["sloth"] }));
      expect(prompt.toLowerCase()).toContain("overgrown");
    });

    it("limits faction visuals to max 2 factions", () => {
      const prompt = buildCoverArtPrompt(
        defaultParams({ dominantFactions: ["wrath", "greed", "envy"] })
      );
      // Should include wrath and greed but not necessarily envy
      expect(prompt.toLowerCase()).toContain("flames");
      expect(prompt.toLowerCase()).toContain("gold coins");
    });

    it("handles empty dominant factions gracefully", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ dominantFactions: [] }));
      expect(prompt).toBeTruthy();
      expect(prompt.toLowerCase()).not.toContain("visual influences");
    });
  });

  // ---- Era Feel Based on Turning Point ----

  describe("era feel based on turning point round", () => {
    it("early turning point (round 1-7) → ancient/primordial", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ turningPointRound: 3 }));
      expect(prompt.toLowerCase()).toContain("ancient");
      expect(prompt.toLowerCase()).toContain("primordial");
    });

    it("mid turning point (round 8-14) → medieval/industrial", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ turningPointRound: 10 }));
      expect(prompt.toLowerCase()).toContain("medieval");
    });

    it("late turning point (round 15+) → modern/futuristic", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ turningPointRound: 18 }));
      expect(prompt.toLowerCase()).toContain("modern");
      expect(prompt.toLowerCase()).toContain("futuristic");
    });

    it("boundary: round 7 is ancient", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ turningPointRound: 7 }));
      expect(prompt.toLowerCase()).toContain("ancient");
    });

    it("boundary: round 8 is medieval", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ turningPointRound: 8 }));
      expect(prompt.toLowerCase()).toContain("medieval");
    });

    it("boundary: round 14 is medieval", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ turningPointRound: 14 }));
      expect(prompt.toLowerCase()).toContain("medieval");
    });

    it("boundary: round 15 is modern", () => {
      const prompt = buildCoverArtPrompt(defaultParams({ turningPointRound: 15 }));
      expect(prompt.toLowerCase()).toContain("modern");
    });
  });

  // ---- Composition & Quality ----

  describe("composition and quality instructions", () => {
    it("requests cinematic aspect ratio", () => {
      const prompt = buildCoverArtPrompt(defaultParams());
      expect(prompt.toLowerCase()).toContain("cinematic");
    });

    it("requests rule of thirds composition", () => {
      const prompt = buildCoverArtPrompt(defaultParams());
      expect(prompt.toLowerCase()).toContain("rule of thirds");
    });

    it("requests no watermarks", () => {
      const prompt = buildCoverArtPrompt(defaultParams());
      expect(prompt.toLowerCase()).toContain("no watermarks");
    });

    it("requests professional quality", () => {
      const prompt = buildCoverArtPrompt(defaultParams());
      expect(prompt.toLowerCase()).toContain("professional quality");
    });
  });

  // ---- Cross-Combination Tests ----

  describe("cross-combination coverage", () => {
    const civTypes: CivilizationType[] = [
      "warrior_empire",
      "enlightened_republic",
      "merchant_federation",
      "balanced",
    ];
    const rarityTiers: ChronicleRarity[] = ["common", "rare", "epic", "legendary"];

    for (const civ of civTypes) {
      for (const rarity of rarityTiers) {
        it(`generates valid prompt for ${civ} + ${rarity}`, () => {
          const prompt = buildCoverArtPrompt(
            defaultParams({ civilizationType: civ, rarityTier: rarity })
          );
          expect(prompt.length).toBeGreaterThan(100);
          expect(prompt).toContain("book cover");
          expect(prompt).toContain("No text");
        });
      }
    }
  });
});
