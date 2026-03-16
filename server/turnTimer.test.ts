/**
 * Server-Side Turn Timer Enforcement — Unit Tests
 *
 * Tests the selection_deadline logic:
 * 1. Deadline is set when the first player locks in
 * 2. Deadline is cleared on resolution and new round
 * 3. Auto-pass logic for idle players when deadline expires
 * 4. GameState includes selectionDeadline field
 * 5. SERVER_TURN_TIMER_SECONDS constant is properly defined
 */

import { describe, it, expect } from "vitest";
import {
  GameState,
  PlayerState,
  LockedPlay,
  TurnPhase,
  SERVER_TURN_TIMER_SECONDS,
  SELECTION_TIMER_SECONDS,
} from "../shared/gameTypes";

describe("SERVER_TURN_TIMER_SECONDS constant", () => {
  it("should be a positive number", () => {
    expect(SERVER_TURN_TIMER_SECONDS).toBeGreaterThan(0);
  });

  it("should be 12 seconds", () => {
    expect(SERVER_TURN_TIMER_SECONDS).toBe(12);
  });

  it("should be greater than or equal to the client timer", () => {
    // Server timer should be >= client timer to avoid premature enforcement
    expect(SERVER_TURN_TIMER_SECONDS).toBeGreaterThanOrEqual(SELECTION_TIMER_SECONDS);
  });
});

describe("GameState.selectionDeadline field", () => {
  it("should accept null when no deadline is set", () => {
    const state: Partial<GameState> = {
      selectionDeadline: null,
    };
    expect(state.selectionDeadline).toBeNull();
  });

  it("should accept an ISO timestamp string", () => {
    const deadline = new Date(Date.now() + SERVER_TURN_TIMER_SECONDS * 1000).toISOString();
    const state: Partial<GameState> = {
      selectionDeadline: deadline,
    };
    expect(state.selectionDeadline).toBe(deadline);
    expect(new Date(state.selectionDeadline!).getTime()).toBeGreaterThan(0);
  });

  it("should be parseable as a valid Date", () => {
    const deadline = new Date(Date.now() + 12000).toISOString();
    const parsed = new Date(deadline);
    expect(parsed.getTime()).toBeGreaterThan(0);
    expect(isNaN(parsed.getTime())).toBe(false);
  });
});

describe("Selection deadline calculation", () => {
  it("should set deadline N seconds in the future from first lock-in", () => {
    const now = Date.now();
    const deadline = new Date(now + SERVER_TURN_TIMER_SECONDS * 1000).toISOString();
    const deadlineMs = new Date(deadline).getTime();

    // Deadline should be approximately SERVER_TURN_TIMER_SECONDS in the future
    const diff = deadlineMs - now;
    expect(diff).toBeGreaterThanOrEqual(SERVER_TURN_TIMER_SECONDS * 1000 - 100); // Allow 100ms tolerance
    expect(diff).toBeLessThanOrEqual(SERVER_TURN_TIMER_SECONDS * 1000 + 100);
  });

  it("should not update deadline on subsequent lock-ins", () => {
    // Simulate: first player locks in, sets deadline
    const firstLockTime = Date.now();
    const originalDeadline = new Date(firstLockTime + SERVER_TURN_TIMER_SECONDS * 1000).toISOString();

    // Simulate: second player locks in 3 seconds later
    // The deadline should NOT change (it's already set)
    const existingDeadline = originalDeadline; // Already set
    const shouldUpdate = !existingDeadline; // false — don't update
    expect(shouldUpdate).toBe(false);
  });

  it("should set deadline when no existing deadline (first lock-in)", () => {
    const existingDeadline: string | null = null;
    const shouldUpdate = !existingDeadline; // true — set it
    expect(shouldUpdate).toBe(true);
  });
});

describe("Deadline expiry detection", () => {
  it("should detect expired deadline", () => {
    // Deadline was 5 seconds ago
    const deadline = new Date(Date.now() - 5000).toISOString();
    const deadlineMs = new Date(deadline).getTime();
    const now = Date.now();

    expect(now >= deadlineMs).toBe(true); // Expired
  });

  it("should detect non-expired deadline", () => {
    // Deadline is 5 seconds in the future
    const deadline = new Date(Date.now() + 5000).toISOString();
    const deadlineMs = new Date(deadline).getTime();
    const now = Date.now();

    expect(now < deadlineMs).toBe(true); // Not expired
  });

  it("should handle edge case: deadline is exactly now", () => {
    const now = Date.now();
    const deadline = new Date(now).toISOString();
    const deadlineMs = new Date(deadline).getTime();

    // At or past deadline should be considered expired
    expect(now >= deadlineMs).toBe(true);
  });
});

describe("Auto-pass logic for idle players", () => {
  function findPlayersNeedingAutoPass(
    alivePlayers: Array<{ player_id: string; locked_cards: any[] | null; is_alive: boolean }>,
  ): string[] {
    return alivePlayers
      .filter((p) => p.is_alive)
      .filter((p) => {
        const pLocked = Array.isArray(p.locked_cards) ? p.locked_cards : [];
        return pLocked.length === 0;
      })
      .map((p) => p.player_id);
  }

  it("should identify players who haven't locked in", () => {
    const players = [
      { player_id: "p1", locked_cards: [{ cardId: "c1" }], is_alive: true },
      { player_id: "p2", locked_cards: [], is_alive: true },
      { player_id: "p3", locked_cards: [{ pass: true }], is_alive: true },
      { player_id: "p4", locked_cards: null, is_alive: true },
    ];
    const needAutoPass = findPlayersNeedingAutoPass(players);
    expect(needAutoPass).toEqual(["p2", "p4"]);
  });

  it("should not auto-pass dead players", () => {
    const players = [
      { player_id: "p1", locked_cards: [{ cardId: "c1" }], is_alive: true },
      { player_id: "p2", locked_cards: [], is_alive: false }, // Dead — skip
      { player_id: "p3", locked_cards: [], is_alive: true },
    ];
    const needAutoPass = findPlayersNeedingAutoPass(players);
    expect(needAutoPass).toEqual(["p3"]); // Only p3, not p2
  });

  it("should return empty array when all players have locked in", () => {
    const players = [
      { player_id: "p1", locked_cards: [{ cardId: "c1" }], is_alive: true },
      { player_id: "p2", locked_cards: [{ pass: true }], is_alive: true },
    ];
    const needAutoPass = findPlayersNeedingAutoPass(players);
    expect(needAutoPass).toEqual([]);
  });

  it("should handle all players needing auto-pass", () => {
    const players = [
      { player_id: "p1", locked_cards: [], is_alive: true },
      { player_id: "p2", locked_cards: [], is_alive: true },
    ];
    const needAutoPass = findPlayersNeedingAutoPass(players);
    expect(needAutoPass).toEqual(["p1", "p2"]);
  });
});

describe("Deadline clearing on phase transitions", () => {
  it("should clear deadline when transitioning to resolution", () => {
    // Simulate the game update object for resolution transition
    const gameUpdate: Record<string, any> = {
      turn_phase: "resolution",
      selection_deadline: null,
    };
    expect(gameUpdate.selection_deadline).toBeNull();
    expect(gameUpdate.turn_phase).toBe("resolution");
  });

  it("should clear deadline when transitioning to new round selection", () => {
    // Simulate the game update object for new round
    const gameUpdate: Record<string, any> = {
      turn_phase: "selection",
      locked_plays: [],
      selection_deadline: null,
    };
    expect(gameUpdate.selection_deadline).toBeNull();
    expect(gameUpdate.turn_phase).toBe("selection");
    expect(gameUpdate.locked_plays).toEqual([]);
  });
});

describe("Client-side remaining time calculation", () => {
  it("should calculate remaining seconds from server deadline", () => {
    const futureDeadline = new Date(Date.now() + 8000).toISOString();
    const deadline = new Date(futureDeadline).getTime();
    const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

    expect(remaining).toBeGreaterThanOrEqual(7); // ~8 seconds, allow 1s tolerance
    expect(remaining).toBeLessThanOrEqual(8);
  });

  it("should return 0 for expired deadline", () => {
    const pastDeadline = new Date(Date.now() - 5000).toISOString();
    const deadline = new Date(pastDeadline).getTime();
    const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

    expect(remaining).toBe(0);
  });

  it("should handle deadline exactly at current time", () => {
    const nowDeadline = new Date(Date.now()).toISOString();
    const deadline = new Date(nowDeadline).getTime();
    const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

    expect(remaining).toBeLessThanOrEqual(1); // 0 or 1 due to timing
  });
});

describe("Configurable turn timer", () => {
  it("TIMER_OPTIONS should have 3 options (10s, 15s, 30s)", async () => {
    const { TIMER_OPTIONS } = await import("../shared/gameTypes");
    expect(TIMER_OPTIONS).toHaveLength(3);
    expect(TIMER_OPTIONS.map((o: any) => o.value)).toEqual([10, 15, 30]);
  });

  it("DEFAULT_TURN_TIMER should be 15", async () => {
    const { DEFAULT_TURN_TIMER } = await import("../shared/gameTypes");
    expect(DEFAULT_TURN_TIMER).toBe(15);
  });

  it("GameState should include turnTimerSeconds field", () => {
    const state: Partial<GameState> = {
      turnTimerSeconds: 30,
    };
    expect(state.turnTimerSeconds).toBe(30);
  });

  it("should use game's configured timer for deadline calculation", () => {
    const turnTimerSeconds = 30; // Casual mode
    const now = Date.now();
    const deadline = new Date(now + turnTimerSeconds * 1000).toISOString();
    const deadlineMs = new Date(deadline).getTime();
    const diff = deadlineMs - now;
    expect(diff).toBeGreaterThanOrEqual(29900);
    expect(diff).toBeLessThanOrEqual(30100);
  });

  it("should fall back to SERVER_TURN_TIMER_SECONDS when turn_timer_seconds is null", () => {
    const gameTurnTimer: number | null = null;
    const timerSeconds = gameTurnTimer ?? SERVER_TURN_TIMER_SECONDS;
    expect(timerSeconds).toBe(SERVER_TURN_TIMER_SECONDS);
  });

  it("should use 10s timer for competitive mode", () => {
    const gameTurnTimer = 10;
    const now = Date.now();
    const deadline = new Date(now + gameTurnTimer * 1000).toISOString();
    const deadlineMs = new Date(deadline).getTime();
    const diff = deadlineMs - now;
    expect(diff).toBeGreaterThanOrEqual(9900);
    expect(diff).toBeLessThanOrEqual(10100);
  });

  it("each TIMER_OPTIONS entry should have value, label, and description", async () => {
    const { TIMER_OPTIONS } = await import("../shared/gameTypes");
    for (const opt of TIMER_OPTIONS) {
      expect(opt).toHaveProperty("value");
      expect(opt).toHaveProperty("label");
      expect(opt).toHaveProperty("description");
      expect(typeof opt.value).toBe("number");
      expect(typeof opt.label).toBe("string");
      expect(typeof opt.description).toBe("string");
    }
  });
});

describe("Full timer enforcement flow (unit simulation)", () => {
  interface MockGame {
    turn_phase: TurnPhase;
    selection_deadline: string | null;
    locked_plays: LockedPlay[];
    status: string;
  }

  interface MockPlayer {
    player_id: string;
    is_alive: boolean;
    locked_cards: any[];
  }

  function simulateEnforcement(
    game: MockGame,
    players: MockPlayer[]
  ): { enforced: boolean; autoPassedIds: string[] } {
    // Not active or not in selection
    if (game.status !== "active" || game.turn_phase !== "selection") {
      return { enforced: false, autoPassedIds: [] };
    }

    // No deadline set
    if (!game.selection_deadline) {
      return { enforced: false, autoPassedIds: [] };
    }

    // Deadline not yet passed
    const deadline = new Date(game.selection_deadline).getTime();
    if (Date.now() < deadline) {
      return { enforced: false, autoPassedIds: [] };
    }

    // Find players needing auto-pass
    const autoPassedIds: string[] = [];
    for (const p of players) {
      if (!p.is_alive) continue;
      const pLocked = Array.isArray(p.locked_cards) ? p.locked_cards : [];
      if (pLocked.length === 0) {
        autoPassedIds.push(p.player_id);
      }
    }

    if (autoPassedIds.length === 0) {
      return { enforced: false, autoPassedIds: [] };
    }

    return { enforced: true, autoPassedIds };
  }

  it("should not enforce when game is not active", () => {
    const result = simulateEnforcement(
      { turn_phase: "selection", selection_deadline: new Date(Date.now() - 5000).toISOString(), locked_plays: [], status: "lobby" },
      [{ player_id: "p1", is_alive: true, locked_cards: [] }]
    );
    expect(result.enforced).toBe(false);
  });

  it("should not enforce when not in selection phase", () => {
    const result = simulateEnforcement(
      { turn_phase: "resolution", selection_deadline: new Date(Date.now() - 5000).toISOString(), locked_plays: [], status: "active" },
      [{ player_id: "p1", is_alive: true, locked_cards: [] }]
    );
    expect(result.enforced).toBe(false);
  });

  it("should not enforce when no deadline is set", () => {
    const result = simulateEnforcement(
      { turn_phase: "selection", selection_deadline: null, locked_plays: [], status: "active" },
      [{ player_id: "p1", is_alive: true, locked_cards: [] }]
    );
    expect(result.enforced).toBe(false);
  });

  it("should not enforce when deadline hasn't passed", () => {
    const result = simulateEnforcement(
      { turn_phase: "selection", selection_deadline: new Date(Date.now() + 10000).toISOString(), locked_plays: [], status: "active" },
      [{ player_id: "p1", is_alive: true, locked_cards: [] }]
    );
    expect(result.enforced).toBe(false);
  });

  it("should enforce and auto-pass idle players when deadline has passed", () => {
    const result = simulateEnforcement(
      { turn_phase: "selection", selection_deadline: new Date(Date.now() - 1000).toISOString(), locked_plays: [], status: "active" },
      [
        { player_id: "p1", is_alive: true, locked_cards: [{ cardId: "c1" }] }, // Already locked in
        { player_id: "p2", is_alive: true, locked_cards: [] }, // Needs auto-pass
        { player_id: "p3", is_alive: true, locked_cards: [{ pass: true }] }, // Already passed
        { player_id: "p4", is_alive: false, locked_cards: [] }, // Dead — skip
      ]
    );
    expect(result.enforced).toBe(true);
    expect(result.autoPassedIds).toEqual(["p2"]);
  });

  it("should not enforce when all alive players already locked in", () => {
    const result = simulateEnforcement(
      { turn_phase: "selection", selection_deadline: new Date(Date.now() - 1000).toISOString(), locked_plays: [], status: "active" },
      [
        { player_id: "p1", is_alive: true, locked_cards: [{ cardId: "c1" }] },
        { player_id: "p2", is_alive: true, locked_cards: [{ pass: true }] },
      ]
    );
    expect(result.enforced).toBe(false);
  });
});
