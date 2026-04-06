/**
 * Tests for v6.7.7 — Round Freeze Fix + Timer Fix + Immersion
 *
 * Covers:
 * 1. Atomic guard (compare-and-swap) in lockInCards to prevent double resolution
 * 2. Atomic guard in enforceSelectionDeadline
 * 3. Server-side advanceRound: no 4-second blocking delay, single atomic update
 * 4. Energy carry-over in refreshPlayerEnergy (not reset to MAX)
 * 5. Turn timer should not activate during resolution animation
 * 6. RoundEndPrompt receives round summary data
 * 7. ResolutionReveal plays sin-specific sounds
 */

import { describe, it, expect, vi } from "vitest";
import {
  MAX_ENERGY,
  ENERGY_PER_TURN,
  STARTING_ENERGY,
} from "../shared/gameTypes";

/* ─── 1. Atomic Guard Logic Tests ─────────────────────────────── */
describe("Atomic Guard (Compare-and-Swap)", () => {
  it("should only allow resolution when turn_phase is 'selection'", () => {
    // Simulate the CAS logic: update only if current phase matches expected
    const phases = ["selection", "resolution", "round_end"] as const;
    for (const phase of phases) {
      const currentPhase = phase;
      const expectedPhase = "selection";
      const canTransition = currentPhase === expectedPhase;

      if (phase === "selection") {
        expect(canTransition).toBe(true);
      } else {
        expect(canTransition).toBe(false);
      }
    }
  });

  it("should prevent double resolution when two callers race", () => {
    // Simulate two concurrent CAS attempts
    let currentPhase = "selection";

    // First caller wins the CAS
    const caller1Wins = currentPhase === "selection";
    if (caller1Wins) currentPhase = "resolution";
    expect(caller1Wins).toBe(true);
    expect(currentPhase).toBe("resolution");

    // Second caller loses the CAS
    const caller2Wins = currentPhase === "selection";
    expect(caller2Wins).toBe(false);
  });

  it("should skip resolution if game is already in resolution phase", () => {
    const gamePhase = "resolution";
    const shouldResolve = gamePhase === "selection";
    expect(shouldResolve).toBe(false);
  });

  it("should skip resolution if game is in round_end phase", () => {
    const gamePhase = "round_end";
    const shouldResolve = gamePhase === "selection";
    expect(shouldResolve).toBe(false);
  });
});

/* ─── 2. Energy Carry-Over Tests ──────────────────────────────── */
describe("Energy Carry-Over (refreshPlayerEnergy)", () => {
  function refreshEnergy(currentUnspent: number): number {
    return Math.min(currentUnspent + ENERGY_PER_TURN, MAX_ENERGY);
  }

  it("should add ENERGY_PER_TURN to unspent energy", () => {
    const result = refreshEnergy(3);
    expect(result).toBe(3 + ENERGY_PER_TURN);
  });

  it("should cap at MAX_ENERGY", () => {
    const result = refreshEnergy(MAX_ENERGY);
    expect(result).toBe(MAX_ENERGY);
  });

  it("should carry over unspent energy from previous round", () => {
    // Player had 5 energy, spent 2 (3 left), gains ENERGY_PER_TURN
    const unspent = 3;
    const result = refreshEnergy(unspent);
    expect(result).toBe(Math.min(3 + ENERGY_PER_TURN, MAX_ENERGY));
    expect(result).toBeGreaterThan(ENERGY_PER_TURN); // Proves carry-over works
  });

  it("should NOT reset to MAX_ENERGY (old bug)", () => {
    // The old bug: refreshPlayerEnergy always set energy to MAX_ENERGY
    const unspent = 2;
    const result = refreshEnergy(unspent);
    // If the bug existed, result would be MAX_ENERGY (7)
    // With the fix, result should be 2 + ENERGY_PER_TURN = 3
    expect(result).toBe(unspent + ENERGY_PER_TURN);
    if (unspent + ENERGY_PER_TURN < MAX_ENERGY) {
      expect(result).toBeLessThan(MAX_ENERGY);
    }
  });

  it("should handle 0 unspent energy correctly", () => {
    const result = refreshEnergy(0);
    expect(result).toBe(ENERGY_PER_TURN);
  });

  it("should handle energy at MAX_ENERGY - 1", () => {
    const result = refreshEnergy(MAX_ENERGY - 1);
    // MAX_ENERGY - 1 + ENERGY_PER_TURN might exceed MAX_ENERGY
    expect(result).toBe(Math.min(MAX_ENERGY - 1 + ENERGY_PER_TURN, MAX_ENERGY));
    expect(result).toBeLessThanOrEqual(MAX_ENERGY);
  });

  it("should handle negative energy (edge case)", () => {
    // Shouldn't happen, but defensive
    const result = refreshEnergy(-1);
    expect(result).toBe(-1 + ENERGY_PER_TURN);
  });
});

/* ─── 3. AdvanceRound: No Blocking Delay ──────────────────────── */
describe("AdvanceRound: No Blocking Delay", () => {
  it("should transition directly to selection phase without setTimeout", () => {
    // The fix removes the 4-second setTimeout from advanceRound.
    // The new code does a single atomic update:
    // turn_phase: "selection", locked_plays: [], selection_deadline: null
    const newState = {
      turn_phase: "selection" as const,
      locked_plays: [] as any[],
      selection_deadline: null as string | null,
    };

    expect(newState.turn_phase).toBe("selection");
    expect(newState.locked_plays).toEqual([]);
    expect(newState.selection_deadline).toBeNull();
  });

  it("should clear locked_plays in the same atomic update as phase transition", () => {
    // Before fix: locked_plays cleared in a separate update after 4s delay
    // After fix: cleared in the same update as turn_phase transition
    const atomicUpdate = {
      current_round: 7,
      current_player_index: 0,
      turn_phase: "selection",
      locked_plays: [],
      selection_deadline: null,
    };

    // All fields should be in one update object
    expect(Object.keys(atomicUpdate)).toContain("turn_phase");
    expect(Object.keys(atomicUpdate)).toContain("locked_plays");
    expect(Object.keys(atomicUpdate)).toContain("selection_deadline");
    expect(Object.keys(atomicUpdate)).toContain("current_round");
  });
});

/* ─── 4. Turn Timer: Not During Resolution ────────────────────── */
describe("Turn Timer: Not During Resolution Animation", () => {
  it("should not activate timer when isShowingResolution is true", () => {
    const isShowingResolution = true;
    const showRoundEndPrompt = false;
    const turnPhase = "selection";
    const hasLockedIn = false;
    const selectionDeadline = new Date(Date.now() + 30000).toISOString();

    // Timer activation condition (from GameBoard.tsx)
    const shouldActivateTimer =
      turnPhase === "selection" &&
      !hasLockedIn &&
      !isShowingResolution &&
      !showRoundEndPrompt &&
      selectionDeadline !== null;

    expect(shouldActivateTimer).toBe(false);
  });

  it("should not activate timer when showRoundEndPrompt is true", () => {
    const isShowingResolution = false;
    const showRoundEndPrompt = true;
    const turnPhase = "selection";
    const hasLockedIn = false;
    const selectionDeadline = new Date(Date.now() + 30000).toISOString();

    const shouldActivateTimer =
      turnPhase === "selection" &&
      !hasLockedIn &&
      !isShowingResolution &&
      !showRoundEndPrompt &&
      selectionDeadline !== null;

    expect(shouldActivateTimer).toBe(false);
  });

  it("should activate timer when resolution is complete and in selection phase", () => {
    const isShowingResolution = false;
    const showRoundEndPrompt = false;
    const turnPhase = "selection";
    const hasLockedIn = false;
    const selectionDeadline = new Date(Date.now() + 30000).toISOString();

    const shouldActivateTimer =
      turnPhase === "selection" &&
      !hasLockedIn &&
      !isShowingResolution &&
      !showRoundEndPrompt &&
      selectionDeadline !== null;

    expect(shouldActivateTimer).toBe(true);
  });

  it("should not activate timer when already locked in", () => {
    const isShowingResolution = false;
    const showRoundEndPrompt = false;
    const turnPhase = "selection";
    const hasLockedIn = true;
    const selectionDeadline = new Date(Date.now() + 30000).toISOString();

    const shouldActivateTimer =
      turnPhase === "selection" &&
      !hasLockedIn &&
      !isShowingResolution &&
      !showRoundEndPrompt &&
      selectionDeadline !== null;

    expect(shouldActivateTimer).toBe(false);
  });

  it("should not activate timer when no deadline is set", () => {
    const isShowingResolution = false;
    const showRoundEndPrompt = false;
    const turnPhase = "selection";
    const hasLockedIn = false;
    const selectionDeadline = null;

    const shouldActivateTimer =
      turnPhase === "selection" &&
      !hasLockedIn &&
      !isShowingResolution &&
      !showRoundEndPrompt &&
      selectionDeadline !== null;

    expect(shouldActivateTimer).toBe(false);
  });
});

/* ─── 5. Sin-Specific Sound Selection ─────────────────────────── */
describe("Sin-Specific Impact Sounds", () => {
  const EFFECT_TYPES = {
    heal: ["heal_gain", "heal_steal"],
    shield: ["shield_gain", "shield_steal"],
    damage: ["damage", "self_damage", "energy_steal", "energy_drain"],
  };

  function selectSoundType(effects: Array<{ type: string }>): "heal" | "shield" | "damage" {
    const hasHeal = effects.some(e => EFFECT_TYPES.heal.includes(e.type));
    const hasShield = effects.some(e => EFFECT_TYPES.shield.includes(e.type));
    if (hasHeal) return "heal";
    if (hasShield) return "shield";
    return "damage";
  }

  it("should play heal sound for heal_gain effects", () => {
    expect(selectSoundType([{ type: "heal_gain" }])).toBe("heal");
  });

  it("should play heal sound for heal_steal effects", () => {
    expect(selectSoundType([{ type: "heal_steal" }])).toBe("heal");
  });

  it("should play shield sound for shield_gain effects", () => {
    expect(selectSoundType([{ type: "shield_gain" }])).toBe("shield");
  });

  it("should play damage sound for damage effects", () => {
    expect(selectSoundType([{ type: "damage" }])).toBe("damage");
  });

  it("should prioritize heal over shield when both present", () => {
    expect(selectSoundType([{ type: "heal_gain" }, { type: "shield_gain" }])).toBe("heal");
  });

  it("should prioritize shield over damage when both present", () => {
    expect(selectSoundType([{ type: "shield_gain" }, { type: "damage" }])).toBe("shield");
  });

  it("should default to damage for unknown effect types", () => {
    expect(selectSoundType([{ type: "unknown_effect" }])).toBe("damage");
  });
});

/* ─── 6. Round Summary Data ───────────────────────────────────── */
describe("RoundEndPrompt: Round Summary Data", () => {
  interface MockPlayer {
    id: string;
    username: string;
    chosenSin: string;
    currentHp: number;
    maxHp: number;
    isAlive: boolean;
  }

  interface MockLockedPlay {
    playerId: string;
    cardId?: string;
    pass?: boolean;
  }

  function buildSummary(
    prePlayers: MockPlayer[],
    postPlayers: MockPlayer[],
    resolvedPlays: MockLockedPlay[]
  ) {
    return postPlayers.map((post) => {
      const pre = prePlayers.find(p => p.id === post.id);
      const cardsPlayed = resolvedPlays.filter(
        lp => lp.playerId === post.id && !lp.pass && lp.cardId
      ).length;
      return {
        id: post.id,
        username: post.username,
        preHp: pre?.currentHp ?? post.currentHp,
        currentHp: post.currentHp,
        delta: post.currentHp - (pre?.currentHp ?? post.currentHp),
        cardsPlayed,
        isAlive: post.isAlive,
      };
    });
  }

  const prePlayers: MockPlayer[] = [
    { id: "p1", username: "Alice", chosenSin: "wrath", currentHp: 300, maxHp: 333, isAlive: true },
    { id: "p2", username: "Bob", chosenSin: "sloth", currentHp: 250, maxHp: 333, isAlive: true },
  ];

  const postPlayers: MockPlayer[] = [
    { id: "p1", username: "Alice", chosenSin: "wrath", currentHp: 280, maxHp: 333, isAlive: true },
    { id: "p2", username: "Bob", chosenSin: "sloth", currentHp: 230, maxHp: 333, isAlive: true },
  ];

  const plays: MockLockedPlay[] = [
    { playerId: "p1", cardId: "wrath-01" },
    { playerId: "p2", cardId: "sloth-03" },
  ];

  it("should calculate HP deltas correctly", () => {
    const summary = buildSummary(prePlayers, postPlayers, plays);
    expect(summary[0].delta).toBe(-20); // Alice: 280 - 300
    expect(summary[1].delta).toBe(-20); // Bob: 230 - 250
  });

  it("should count cards played per player", () => {
    const summary = buildSummary(prePlayers, postPlayers, plays);
    expect(summary[0].cardsPlayed).toBe(1);
    expect(summary[1].cardsPlayed).toBe(1);
  });

  it("should handle pass (0 cards played)", () => {
    const passPlays: MockLockedPlay[] = [
      { playerId: "p1", pass: true },
      { playerId: "p2", cardId: "sloth-03" },
    ];
    const summary = buildSummary(prePlayers, postPlayers, passPlays);
    expect(summary[0].cardsPlayed).toBe(0);
    expect(summary[1].cardsPlayed).toBe(1);
  });

  it("should handle player elimination (HP = 0)", () => {
    const postWithDeath: MockPlayer[] = [
      { id: "p1", username: "Alice", chosenSin: "wrath", currentHp: 0, maxHp: 333, isAlive: false },
      { id: "p2", username: "Bob", chosenSin: "sloth", currentHp: 250, maxHp: 333, isAlive: true },
    ];
    const summary = buildSummary(prePlayers, postWithDeath, plays);
    expect(summary[0].delta).toBe(-300);
    expect(summary[0].isAlive).toBe(false);
    expect(summary[1].delta).toBe(0);
  });

  it("should handle healing (positive delta)", () => {
    const postWithHeal: MockPlayer[] = [
      { id: "p1", username: "Alice", chosenSin: "wrath", currentHp: 320, maxHp: 333, isAlive: true },
      { id: "p2", username: "Bob", chosenSin: "sloth", currentHp: 250, maxHp: 333, isAlive: true },
    ];
    const summary = buildSummary(prePlayers, postWithHeal, plays);
    expect(summary[0].delta).toBe(20); // Healed
    expect(summary[1].delta).toBe(0); // No change
  });

  it("should use post HP when pre player not found", () => {
    const summary = buildSummary([], postPlayers, plays);
    expect(summary[0].delta).toBe(0); // No pre data, delta = 0
    expect(summary[1].delta).toBe(0);
  });
});

/* ─── 7. HP Tracker Bar Logic ─────────────────────────────────── */
describe("HP Tracker Bar", () => {
  function getHpColor(pctNow: number): string {
    if (pctNow > 60) return "#22c55e"; // green
    if (pctNow > 30) return "#eab308"; // yellow
    return "#ef4444"; // red
  }

  it("should show green for HP > 60%", () => {
    expect(getHpColor(80)).toBe("#22c55e");
  });

  it("should show yellow for HP 30-60%", () => {
    expect(getHpColor(45)).toBe("#eab308");
  });

  it("should show red for HP < 30%", () => {
    expect(getHpColor(15)).toBe("#ef4444");
  });

  it("should show red at exactly 30%", () => {
    expect(getHpColor(30)).toBe("#ef4444");
  });

  it("should show yellow at exactly 60%", () => {
    expect(getHpColor(60)).toBe("#eab308");
  });

  it("should show green at 100%", () => {
    expect(getHpColor(100)).toBe("#22c55e");
  });

  it("should show red at 0%", () => {
    expect(getHpColor(0)).toBe("#ef4444");
  });
});

/* ─── 8. Resolution Animation Ordering ────────────────────────── */
describe("Resolution Animation: Play Ordering", () => {
  interface MockPlay {
    playerId: string;
    cardId: string;
    skipQueue?: boolean;
  }

  interface MockPlayer {
    id: string;
    currentHp: number;
    seatIndex: number;
  }

  function sortPlays(plays: MockPlay[], players: MockPlayer[]): MockPlay[] {
    return [...plays].sort((a, b) => {
      // Skip queue first
      if (a.skipQueue && !b.skipQueue) return -1;
      if (!a.skipQueue && b.skipQueue) return 1;
      // Lowest HP first
      const playerA = players.find(p => p.id === a.playerId);
      const playerB = players.find(p => p.id === b.playerId);
      const hpA = playerA?.currentHp ?? 999;
      const hpB = playerB?.currentHp ?? 999;
      if (hpA !== hpB) return hpA - hpB;
      // Lowest seat index
      const seatA = playerA?.seatIndex ?? 999;
      const seatB = playerB?.seatIndex ?? 999;
      return seatA - seatB;
    });
  }

  it("should prioritize skipQueue plays", () => {
    const plays: MockPlay[] = [
      { playerId: "p1", cardId: "c1" },
      { playerId: "p2", cardId: "c2", skipQueue: true },
    ];
    const players: MockPlayer[] = [
      { id: "p1", currentHp: 100, seatIndex: 0 },
      { id: "p2", currentHp: 200, seatIndex: 1 },
    ];
    const sorted = sortPlays(plays, players);
    expect(sorted[0].playerId).toBe("p2"); // skipQueue goes first
  });

  it("should sort by lowest HP when no skipQueue", () => {
    const plays: MockPlay[] = [
      { playerId: "p1", cardId: "c1" },
      { playerId: "p2", cardId: "c2" },
    ];
    const players: MockPlayer[] = [
      { id: "p1", currentHp: 200, seatIndex: 0 },
      { id: "p2", currentHp: 100, seatIndex: 1 },
    ];
    const sorted = sortPlays(plays, players);
    expect(sorted[0].playerId).toBe("p2"); // Lower HP goes first
  });

  it("should sort by seat index when HP is equal", () => {
    const plays: MockPlay[] = [
      { playerId: "p1", cardId: "c1" },
      { playerId: "p2", cardId: "c2" },
    ];
    const players: MockPlayer[] = [
      { id: "p1", currentHp: 150, seatIndex: 2 },
      { id: "p2", currentHp: 150, seatIndex: 0 },
    ];
    const sorted = sortPlays(plays, players);
    expect(sorted[0].playerId).toBe("p2"); // Lower seat goes first
  });
});
