/**
 * Chronicle Engine Tests
 *
 * Tests the era timeline, faction forces, civilization metrics,
 * rarity tier calculation, title generation, and type contracts.
 */
import { describe, it, expect } from "vitest";

import {
  ERA_TIMELINE,
  FACTION_FORCES,
  TITLE_FORMULAS,
  RARITY_CONFIGS,
  determineCivilizationType,
  type CivilizationMetrics,
  type ChronicleRarity,
  type Era,
  type FactionForce,
} from "../shared/chronicleTypes";

describe("Chronicle Engine — ERA_TIMELINE", () => {
  it("has exactly 20 entries mapping to 20 rounds", () => {
    expect(ERA_TIMELINE).toHaveLength(20);
    ERA_TIMELINE.forEach((era, i) => {
      expect(era.round).toBe(i + 1);
      expect(era.name).toBeTruthy();
      expect(era.anchor).toBeTruthy();
      expect(era.tone).toBeTruthy();
    });
  });

  it("covers from Dawn of Consciousness to The Last Reckoning", () => {
    expect(ERA_TIMELINE[0].name).toContain("Dawn");
    expect(ERA_TIMELINE[19].name).toContain("Reckoning");
  });

  it("rounds are sequential 1-20", () => {
    const rounds = ERA_TIMELINE.map((e) => e.round);
    expect(rounds).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it("each era has a unique name", () => {
    const names = ERA_TIMELINE.map((e) => e.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it("each era has seed sentences for curated randomness", () => {
    ERA_TIMELINE.forEach((era) => {
      expect(era.seedSentences).toBeDefined();
      expect(era.seedSentences.length).toBeGreaterThanOrEqual(1);
      era.seedSentences.forEach((s) => expect(typeof s).toBe("string"));
    });
  });

  it("round 1 is the earliest era (Dawn)", () => {
    const era = ERA_TIMELINE.find((e) => e.round === 1);
    expect(era).toBeDefined();
    expect(era!.name.toLowerCase()).toContain("dawn");
  });

  it("round 10 maps to a middle era", () => {
    const era = ERA_TIMELINE.find((e) => e.round === 10);
    expect(era).toBeDefined();
    expect(era!.name).toBeTruthy();
  });

  it("round 20 maps to the final era", () => {
    const era = ERA_TIMELINE.find((e) => e.round === 20);
    expect(era).toBeDefined();
    expect(era!.name.toLowerCase()).toContain("reckoning");
  });
});

describe("Chronicle Engine — FACTION_FORCES", () => {
  const expectedSins = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"] as const;

  it("maps all 7 sins to historical forces", () => {
    expectedSins.forEach((sin) => {
      expect(FACTION_FORCES[sin]).toBeDefined();
      expect(FACTION_FORCES[sin].force).toBeTruthy();
      expect(FACTION_FORCES[sin].whenDominant).toBeTruthy();
      expect(FACTION_FORCES[sin].whenDefeated).toBeTruthy();
      expect(FACTION_FORCES[sin].civilizationContribution).toBeDefined();
    });
  });

  it("Wrath maps to military conquest", () => {
    expect(FACTION_FORCES.wrath.force.toLowerCase()).toContain("military");
  });

  it("Greed maps to commerce/capitalism", () => {
    const greedForce = FACTION_FORCES.greed.force.toLowerCase();
    expect(greedForce.includes("commerce") || greedForce.includes("capital")).toBe(true);
  });

  it("Sloth maps to isolationism/stagnation", () => {
    const slothForce = FACTION_FORCES.sloth.force.toLowerCase();
    expect(slothForce.includes("isolation") || slothForce.includes("stagnation")).toBe(true);
  });

  it("Pride maps to empire/cultural supremacy", () => {
    const prideForce = FACTION_FORCES.pride.force.toLowerCase();
    expect(prideForce.includes("empire") || prideForce.includes("cultural")).toBe(true);
  });

  it("each faction has civilization contribution metrics", () => {
    expectedSins.forEach((sin) => {
      const contrib = FACTION_FORCES[sin].civilizationContribution;
      expect(typeof contrib.militarism).toBe("number");
      expect(typeof contrib.culture).toBe("number");
      expect(typeof contrib.commerce).toBe("number");
    });
  });

  it("Wrath boosts militarism, Pride boosts culture, Greed boosts commerce", () => {
    expect(FACTION_FORCES.wrath.civilizationContribution.militarism).toBeGreaterThan(0);
    expect(FACTION_FORCES.pride.civilizationContribution.culture).toBeGreaterThan(0);
    expect(FACTION_FORCES.greed.civilizationContribution.commerce).toBeGreaterThan(0);
  });
});

describe("Chronicle Engine — Civilization Type Determination", () => {
  it("high militarism → warrior_empire", () => {
    expect(determineCivilizationType({ militarism: 20, culture: 5, commerce: 5 })).toBe("warrior_empire");
  });

  it("high culture → enlightened_republic", () => {
    expect(determineCivilizationType({ militarism: 5, culture: 20, commerce: 5 })).toBe("enlightened_republic");
  });

  it("high commerce → merchant_federation", () => {
    expect(determineCivilizationType({ militarism: 5, culture: 5, commerce: 20 })).toBe("merchant_federation");
  });

  it("balanced metrics → balanced", () => {
    expect(determineCivilizationType({ militarism: 10, culture: 10, commerce: 10 })).toBe("balanced");
  });
});

describe("Chronicle Engine — Rarity System", () => {
  it("defines all 4 rarity tiers", () => {
    const tiers: ChronicleRarity[] = ["common", "rare", "epic", "legendary"];
    tiers.forEach((tier) => {
      expect(RARITY_CONFIGS[tier]).toBeDefined();
      expect(RARITY_CONFIGS[tier].label).toBeTruthy();
      expect(typeof RARITY_CONFIGS[tier].glowColor).toBe("string");
    });
  });

  it("legendary has the most impressive glow", () => {
    expect(RARITY_CONFIGS.legendary.glowColor).toBeTruthy();
    expect(RARITY_CONFIGS.legendary.label.toLowerCase()).toContain("legendary");
  });

  it("common is the default tier", () => {
    expect(RARITY_CONFIGS.common).toBeDefined();
  });
});

describe("Chronicle Engine — Title Formulas", () => {
  it("has at least 5 formula templates", () => {
    expect(TITLE_FORMULAS.length).toBeGreaterThanOrEqual(5);
  });

  it("formulas contain placeholder patterns", () => {
    const hasPlaceholders = TITLE_FORMULAS.some(
      (f) => f.includes("{") && f.includes("}")
    );
    expect(hasPlaceholders).toBe(true);
  });

  it("formulas produce varied titles (diverse first words)", () => {
    const firstWords = TITLE_FORMULAS.map((f) => f.split(" ")[0]);
    const uniqueFirstWords = new Set(firstWords);
    expect(uniqueFirstWords.size).toBeGreaterThanOrEqual(3);
  });
});

describe("Chronicle Engine — Type Contracts", () => {
  it("CivilizationMetrics has militarism, culture, commerce", () => {
    const metrics: CivilizationMetrics = {
      militarism: 5,
      culture: 3,
      commerce: 7,
    };
    expect(metrics.militarism).toBe(5);
    expect(metrics.culture).toBe(3);
    expect(metrics.commerce).toBe(7);
  });

  it("Era interface has required fields", () => {
    const era: Era = {
      round: 1,
      name: "Test Era",
      anchor: "test anchor",
      tone: "test tone",
      seedSentences: ["Test sentence"],
    };
    expect(era.round).toBe(1);
    expect(era.seedSentences).toHaveLength(1);
  });

  it("FactionForce interface has required fields", () => {
    const force: FactionForce = {
      force: "Test force",
      whenDominant: "Test dominant",
      whenDefeated: "Test defeated",
      civilizationContribution: { militarism: 1, culture: 1, commerce: 1 },
    };
    expect(force.force).toBe("Test force");
  });
});
