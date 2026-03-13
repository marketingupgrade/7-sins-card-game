/**
 * Tutorial System Tests
 *
 * Tests for the tutorial step definitions, navigation logic,
 * and state machine behavior. Because even tutorials need QA.
 */

import { describe, it, expect } from "vitest";
import {
  TUTORIAL_STEPS,
  ALL_TUTORIAL_STEPS,
  TOTAL_STEPS,
  getStepsForPage,
  getGlobalStepIndex,
  type TutorialPage,
  type TutorialStep,
} from "../client/src/lib/tutorialSteps";

// ─── Step Definitions ───────────────────────────────────────

describe("Tutorial Step Definitions", () => {
  it("should have steps for all three pages", () => {
    const pages: TutorialPage[] = ["home", "lobby", "game"];
    for (const page of pages) {
      const steps = getStepsForPage(page);
      expect(steps.length).toBeGreaterThan(0);
    }
  });

  it("should have a total of 19 steps across all pages", () => {
    expect(TOTAL_STEPS).toBe(20);
    expect(ALL_TUTORIAL_STEPS.length).toBe(20);
  });

  it("should have 5 home steps, 5 lobby steps, and 10 game steps", () => {
    expect(TUTORIAL_STEPS.home.length).toBe(5);
    expect(TUTORIAL_STEPS.lobby.length).toBe(5);
    expect(TUTORIAL_STEPS.game.length).toBe(10);
  });

  it("should have unique IDs for all steps", () => {
    const ids = ALL_TUTORIAL_STEPS.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("every step should have a title and body", () => {
    for (const step of ALL_TUTORIAL_STEPS) {
      expect(step.title).toBeTruthy();
      expect(step.body).toBeTruthy();
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.body.length).toBeGreaterThan(0);
    }
  });

  it("every step should have a valid position", () => {
    const validPositions = ["top", "bottom", "left", "right", "center"];
    for (const step of ALL_TUTORIAL_STEPS) {
      expect(validPositions).toContain(step.position);
    }
  });

  it("center-positioned steps should have no target selector (full-screen overlays)", () => {
    const centerSteps = ALL_TUTORIAL_STEPS.filter((s) => s.position === "center");
    for (const step of centerSteps) {
      expect(step.targetSelector).toBeNull();
    }
  });

  it("non-center steps should have a target selector", () => {
    const targetedSteps = ALL_TUTORIAL_STEPS.filter((s) => s.position !== "center");
    for (const step of targetedSteps) {
      expect(step.targetSelector).toBeTruthy();
      expect(step.targetSelector!.startsWith("[data-tutorial=")).toBe(true);
    }
  });
});

// ─── Step Navigation ────────────────────────────────────────

describe("Tutorial Step Navigation", () => {
  it("getStepsForPage returns correct steps for each page", () => {
    const homeSteps = getStepsForPage("home");
    expect(homeSteps.every((s) => s.page === "home")).toBe(true);

    const lobbySteps = getStepsForPage("lobby");
    expect(lobbySteps.every((s) => s.page === "lobby")).toBe(true);

    const gameSteps = getStepsForPage("game");
    expect(gameSteps.every((s) => s.page === "game")).toBe(true);
  });

  it("getGlobalStepIndex returns correct indices", () => {
    // First step
    expect(getGlobalStepIndex("welcome")).toBe(0);

    // First lobby step
    const firstLobbyIdx = TUTORIAL_STEPS.home.length;
    expect(getGlobalStepIndex("lobby-welcome")).toBe(firstLobbyIdx);

    // First game step
    const firstGameIdx = TUTORIAL_STEPS.home.length + TUTORIAL_STEPS.lobby.length;
    expect(getGlobalStepIndex("game-welcome")).toBe(firstGameIdx);

    // Last step
    expect(getGlobalStepIndex("game-complete")).toBe(TOTAL_STEPS - 1);
  });

  it("getGlobalStepIndex returns -1 for unknown step", () => {
    expect(getGlobalStepIndex("nonexistent-step")).toBe(-1);
  });

  it("ALL_TUTORIAL_STEPS maintains correct page order", () => {
    let lastPage: TutorialPage = "home";
    const pageOrder: TutorialPage[] = ["home", "lobby", "game"];

    for (const step of ALL_TUTORIAL_STEPS) {
      const currentPageIdx = pageOrder.indexOf(step.page);
      const lastPageIdx = pageOrder.indexOf(lastPage);
      expect(currentPageIdx).toBeGreaterThanOrEqual(lastPageIdx);
      lastPage = step.page;
    }
  });
});

// ─── Step Content Quality ───────────────────────────────────

describe("Tutorial Content Quality", () => {
  it("welcome step should be the first step on home page", () => {
    const homeSteps = getStepsForPage("home");
    expect(homeSteps[0].id).toBe("welcome");
    expect(homeSteps[0].targetSelector).toBeNull(); // Full-screen overlay
  });

  it("game-complete should be the last step", () => {
    const gameSteps = getStepsForPage("game");
    expect(gameSteps[gameSteps.length - 1].id).toBe("game-complete");
    expect(gameSteps[gameSteps.length - 1].targetSelector).toBeNull(); // Full-screen overlay
  });

  it("most steps should have narrator quips", () => {
    const stepsWithQuips = ALL_TUTORIAL_STEPS.filter((s) => s.quip);
    // At least 80% of steps should have quips for the sassy tone
    expect(stepsWithQuips.length / ALL_TUTORIAL_STEPS.length).toBeGreaterThanOrEqual(0.8);
  });

  it("home page should explain create game, join game, factions, and mechanics", () => {
    const homeSteps = getStepsForPage("home");
    const homeIds = homeSteps.map((s) => s.id);
    expect(homeIds).toContain("home-create");
    expect(homeIds).toContain("home-join");
    expect(homeIds).toContain("home-factions");
    expect(homeIds).toContain("home-mechanics");
  });

  it("lobby page should explain room code, sin selection, bots, and start", () => {
    const lobbySteps = getStepsForPage("lobby");
    const lobbyIds = lobbySteps.map((s) => s.id);
    expect(lobbyIds).toContain("lobby-room-code");
    expect(lobbyIds).toContain("lobby-sin-select");
    expect(lobbyIds).toContain("lobby-add-bot");
    expect(lobbyIds).toContain("lobby-start");
  });

  it("game page should explain HP, energy, hand, compound patterns, targeting, and balance sheet", () => {
    const gameSteps = getStepsForPage("game");
    const gameIds = gameSteps.map((s) => s.id);
    expect(gameIds).toContain("game-hp-bar");
    expect(gameIds).toContain("game-energy-bar");
    expect(gameIds).toContain("game-hand");
    expect(gameIds).toContain("game-compound-patterns");
    expect(gameIds).toContain("game-target");
    expect(gameIds).toContain("game-balance-sheet");
    expect(gameIds).toContain("game-pass");
  });

  it("compound patterns step should mention Standard, Aggressive, and Slowburn", () => {
    const compoundStep = ALL_TUTORIAL_STEPS.find((s) => s.id === "game-compound-patterns");
    expect(compoundStep).toBeDefined();
    expect(compoundStep!.body).toContain("STANDARD");
    expect(compoundStep!.body).toContain("AGGRESSIVE");
    expect(compoundStep!.body).toContain("SLOWBURN");
  });

  it("energy step should mention starting energy and max cap", () => {
    const energyStep = ALL_TUTORIAL_STEPS.find((s) => s.id === "game-energy-bar");
    expect(energyStep).toBeDefined();
    expect(energyStep!.body).toContain("2");  // Start energy
    expect(energyStep!.body).toContain("7");  // Max cap (v5)
  });
});

// ─── Data Tutorial Selectors ────────────────────────────────

describe("Tutorial Target Selectors", () => {
  const expectedSelectors = [
    "create-game",
    "join-game",
    "faction-cards",
    "card-mechanics",
    "room-code",
    "sin-selection",
    "add-bot",
    "start-game",
    "player-panel",
    "energy-bar",
    "card-hand",
    "balance-sheet-btn",
    "pass-btn",
  ];

  it("should reference all expected data-tutorial attributes", () => {
    const allSelectors = ALL_TUTORIAL_STEPS
      .filter((s) => s.targetSelector)
      .map((s) => {
        const match = s.targetSelector!.match(/\[data-tutorial='([^']+)'\]/);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    for (const expected of expectedSelectors) {
      expect(allSelectors).toContain(expected);
    }
  });
});
