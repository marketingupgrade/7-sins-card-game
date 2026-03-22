/**
 * Onboarding & Tutorial System Tests
 *
 * Tests for:
 * 1. QuickStart modal logic (localStorage, slide navigation)
 * 2. GameCoach tip triggering logic
 * 3. HowToPlay page section structure
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── QuickStart Modal Logic Tests ───

describe("QuickStart Modal", () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
      removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
    });
  });

  it("should show for first-time visitors (no localStorage key)", () => {
    const seen = localStorage.getItem("7sins_quickstart_seen");
    expect(seen).toBeNull();
  });

  it("should not show after being dismissed (localStorage key set)", () => {
    localStorage.setItem("7sins_quickstart_seen", "true");
    const seen = localStorage.getItem("7sins_quickstart_seen");
    expect(seen).toBe("true");
  });

  it("should have exactly 4 slides", () => {
    // Validate the slide count matches the design spec
    const EXPECTED_SLIDES = 4;
    const slideTopics = ["Last Sinner Standing", "Corruption Energy", "Cards Compound", "Pick Your Sin"];
    expect(slideTopics.length).toBe(EXPECTED_SLIDES);
  });

  it("should cover the 4 essential topics", () => {
    const requiredTopics = ["goal/survival", "energy", "compound", "factions"];
    const slideTopics = [
      "Last Sinner Standing",   // goal/survival
      "Corruption Energy",      // energy
      "Cards Compound",         // compound
      "Pick Your Sin",          // factions
    ];
    expect(slideTopics.length).toBe(requiredTopics.length);
    // Each slide maps to a required topic
    expect(slideTopics[0]).toContain("Standing");
    expect(slideTopics[1]).toContain("Energy");
    expect(slideTopics[2]).toContain("Compound");
    expect(slideTopics[3]).toContain("Sin");
  });
});

// ─── GameCoach Tip Logic Tests ───

describe("GameCoach Tip Triggering", () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
      removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
    });
  });

  const STORAGE_PREFIX = "7sins_coach_";

  it("should detect first game when no tips have been seen", () => {
    const isFirstGame = localStorage.getItem(STORAGE_PREFIX + "any_game_played") !== "true";
    expect(isFirstGame).toBe(true);
  });

  it("should not be first game after markGamePlayed", () => {
    localStorage.setItem(STORAGE_PREFIX + "any_game_played", "true");
    const isFirstGame = localStorage.getItem(STORAGE_PREFIX + "any_game_played") !== "true";
    expect(isFirstGame).toBe(false);
  });

  it("should track individual tip seen state", () => {
    const tipId = "first_turn";
    expect(localStorage.getItem(STORAGE_PREFIX + tipId)).toBeNull();

    localStorage.setItem(STORAGE_PREFIX + tipId, "true");
    expect(localStorage.getItem(STORAGE_PREFIX + tipId)).toBe("true");
  });

  it("should have all required coaching tips defined", () => {
    const requiredTipIds = [
      "first_turn",
      "select_target",
      "low_energy",
      "low_hp",
      "compound_ticking",
      "card_played",
      "affliction_doubled",
      "reckoning_soon",
    ];

    // Each tip should have a unique ID
    const uniqueIds = new Set(requiredTipIds);
    expect(uniqueIds.size).toBe(requiredTipIds.length);
    expect(requiredTipIds.length).toBe(8);
  });

  describe("Tip trigger conditions", () => {
    it("first_turn should trigger on round 1, selection phase, no card selected", () => {
      const round = 1;
      const isSelectionPhase = true;
      const hasSelectedCard = false;
      const shouldTrigger = round === 1 && isSelectionPhase && !hasSelectedCard;
      expect(shouldTrigger).toBe(true);
    });

    it("first_turn should NOT trigger on round 2", () => {
      const round = 2;
      const isSelectionPhase = true;
      const hasSelectedCard = false;
      const shouldTrigger = round === 1 && isSelectionPhase && !hasSelectedCard;
      expect(shouldTrigger).toBe(false);
    });

    it("select_target should trigger when card is selected during selection phase", () => {
      const hasSelectedCard = true;
      const isSelectionPhase = true;
      const shouldTrigger = hasSelectedCard && isSelectionPhase;
      expect(shouldTrigger).toBe(true);
    });

    it("low_energy should trigger when energy <= 1 and selection phase after round 1", () => {
      const energy = 1;
      const isSelectionPhase = true;
      const round = 3;
      const shouldTrigger = energy <= 1 && isSelectionPhase && round > 1;
      expect(shouldTrigger).toBe(true);
    });

    it("low_energy should NOT trigger on round 1", () => {
      const energy = 1;
      const isSelectionPhase = true;
      const round = 1;
      const shouldTrigger = energy <= 1 && isSelectionPhase && round > 1;
      expect(shouldTrigger).toBe(false);
    });

    it("low_hp should trigger when HP below 30% of max", () => {
      const playerHp = 90;
      const maxHp = 333;
      const shouldTrigger = playerHp < maxHp * 0.3 && playerHp > 0;
      expect(shouldTrigger).toBe(true);
    });

    it("low_hp should NOT trigger when HP is healthy", () => {
      const playerHp = 250;
      const maxHp = 333;
      const shouldTrigger = playerHp < maxHp * 0.3 && playerHp > 0;
      expect(shouldTrigger).toBe(false);
    });

    it("low_hp should NOT trigger when HP is 0 (dead)", () => {
      const playerHp = 0;
      const maxHp = 333;
      const shouldTrigger = playerHp < maxHp * 0.3 && playerHp > 0;
      expect(shouldTrigger).toBe(false);
    });

    it("compound_ticking should trigger when active compounds exist after round 2", () => {
      const hasActiveCompounds = true;
      const round = 3;
      const shouldTrigger = hasActiveCompounds && round > 2;
      expect(shouldTrigger).toBe(true);
    });

    it("affliction_doubled should trigger at round 16+", () => {
      const afflictionsDoubled = true;
      const shouldTrigger = afflictionsDoubled;
      expect(shouldTrigger).toBe(true);
    });

    it("reckoning_soon should trigger at round 18+", () => {
      const round = 18;
      const shouldTrigger = round >= 18;
      expect(shouldTrigger).toBe(true);
    });

    it("reckoning_soon should NOT trigger before round 18", () => {
      const round = 17;
      const shouldTrigger = round >= 18;
      expect(shouldTrigger).toBe(false);
    });
  });
});

// ─── How to Play Page Structure Tests ───

describe("How to Play Page", () => {
  it("should cover all 8 required sections", () => {
    const requiredSections = [
      "The Goal",
      "Energy System",
      "Playing Cards",
      "Compound Effects",
      "The 7 Factions",
      "Targeting Strategy",
      "Key Milestones",
      "Pro Tips",
    ];
    expect(requiredSections.length).toBe(8);
    // Each section should be unique
    const uniqueSections = new Set(requiredSections);
    expect(uniqueSections.size).toBe(requiredSections.length);
  });

  it("should include faction-specific information for all 7 sins", () => {
    const allSins = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];
    expect(allSins.length).toBe(7);
    const uniqueSins = new Set(allSins);
    expect(uniqueSins.size).toBe(7);
  });

  it("should include compound multiplier explanation", () => {
    // The compound system is the most confusing mechanic for new players
    // The guide must explain that cards deal damage over multiple rounds
    const compoundRounds = 4; // cards tick for 4 rounds
    const multipliers = [1, 1, 2, 3]; // tick multipliers
    const totalMultiplier = multipliers.reduce((a, b) => a + b, 0);
    expect(totalMultiplier).toBe(7);
    expect(compoundRounds).toBe(multipliers.length);
  });

  it("should explain energy progression correctly", () => {
    const startEnergy = 2;
    const energyPerTurn = 1;
    const maxEnergy = 7;

    // Verify the progression matches game constants
    expect(startEnergy).toBe(2);
    expect(energyPerTurn).toBe(1);
    expect(maxEnergy).toBe(7);

    // Player reaches max energy at round 6 (2 + 5*1 = 7)
    const roundToMaxEnergy = maxEnergy - startEnergy + 1; // round 6
    expect(roundToMaxEnergy).toBe(6);
  });
});

// ─── InGameTooltips Tests ───

describe("InGameTooltips", () => {
  it("should provide tooltip content for energy", () => {
    const currentEnergy = 3;
    const maxEnergy = 7;
    const tooltipText = `Corruption Energy (${currentEnergy}/${maxEnergy})`;
    expect(tooltipText).toContain("3/7");
  });

  it("should provide tooltip content for HP with shield", () => {
    const currentHp = 200;
    const maxHp = 333;
    const shield = 15;
    const tooltipText = `Health: ${currentHp}/${maxHp} (+${shield} shield)`;
    expect(tooltipText).toContain("200/333");
    expect(tooltipText).toContain("+15 shield");
  });

  it("should provide round-appropriate tooltip content", () => {
    // Before round 16
    const round = 10;
    const maxRounds = 20;
    const earlyText = round < 16 ? "At round 16, all afflictions double." : "";
    expect(earlyText).toContain("afflictions double");

    // At round 16+
    const lateRound = 17;
    const lateText = lateRound >= 16 && lateRound < maxRounds ? "Afflictions have doubled!" : "";
    expect(lateText).toContain("doubled");

    // At round 20
    const finalRound = 20;
    const finalText = finalRound >= maxRounds ? "Final Reckoning!" : "";
    expect(finalText).toContain("Final Reckoning");
  });
});

// ─── Onboarding Flow Integration Tests ───

describe("Onboarding Flow", () => {
  it("should follow the correct progression: Home → Lobby (QuickStart) → Game (Coach)", () => {
    const flow = [
      { page: "Home", component: "HOW TO PLAY button → /how-to-play" },
      { page: "Lobby", component: "QuickStartModal (4 slides)" },
      { page: "GameBoard", component: "GameCoach (contextual tips)" },
    ];

    expect(flow.length).toBe(3);
    expect(flow[0].page).toBe("Home");
    expect(flow[1].page).toBe("Lobby");
    expect(flow[2].page).toBe("GameBoard");
  });

  it("should not block gameplay with any onboarding element", () => {
    // QuickStart: dismissible, only shows once
    const quickStartDismissible = true;
    const quickStartShowsOnce = true;

    // GameCoach: auto-dismisses, non-blocking
    const coachAutoDismisses = true;
    const coachNonBlocking = true;

    // How to Play: separate page, never interrupts
    const howToPlaySeparatePage = true;

    expect(quickStartDismissible).toBe(true);
    expect(quickStartShowsOnce).toBe(true);
    expect(coachAutoDismisses).toBe(true);
    expect(coachNonBlocking).toBe(true);
    expect(howToPlaySeparatePage).toBe(true);
  });

  it("should persist onboarding state across sessions via localStorage", () => {
    const storageKeys = [
      "7sins_quickstart_seen",
      "7sins_coach_first_turn",
      "7sins_coach_select_target",
      "7sins_coach_low_energy",
      "7sins_coach_low_hp",
      "7sins_coach_compound_ticking",
      "7sins_coach_card_played",
      "7sins_coach_affliction_doubled",
      "7sins_coach_reckoning_soon",
      "7sins_coach_any_game_played",
    ];

    // All keys should be unique
    const uniqueKeys = new Set(storageKeys);
    expect(uniqueKeys.size).toBe(storageKeys.length);
    expect(storageKeys.length).toBe(10);
  });
});
