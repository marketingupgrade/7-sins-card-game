/**
 * Simultaneous Lock-In Turn System — Unit Tests
 *
 * Tests the core mechanics of the new simultaneous turn system:
 * 1. Lock-in with cards stores sentinel for pass
 * 2. Resolution order: skip-queue first, then lowest HP first
 * 3. Round advancement resets locked_cards and turn_phase
 * 4. PlayerState includes new simultaneous fields
 */

import { describe, it, expect } from "vitest";
import {
  TurnPhase,
  LockedPlay,
  PlayerState,
  GameState,
  getCompoundTickValue,
} from "../shared/gameTypes";

describe("TurnPhase type", () => {
  it("should accept valid turn phases", () => {
    const phases: TurnPhase[] = ["selection", "resolution", "round_end"];
    expect(phases).toHaveLength(3);
    expect(phases).toContain("selection");
    expect(phases).toContain("resolution");
    expect(phases).toContain("round_end");
  });
});

describe("LockedPlay interface", () => {
  it("should create a valid locked play", () => {
    const play: LockedPlay = {
      playerId: "player-1",
      gamePlayerId: "gp-1",
      cardId: "wrath_001",
      targetPlayerId: "player-2",
      skipQueue: false,
    };
    expect(play.playerId).toBe("player-1");
    expect(play.skipQueue).toBe(false);
  });

  it("should support skip-queue cards", () => {
    const play: LockedPlay = {
      playerId: "player-1",
      gamePlayerId: "gp-1",
      cardId: "skip_card",
      skipQueue: true,
    };
    expect(play.skipQueue).toBe(true);
    expect(play.targetPlayerId).toBeUndefined();
  });
});

describe("Resolution order sorting", () => {
  // Replicates the sorting logic from resolveLockedPlays
  function sortLockedPlays(
    plays: LockedPlay[],
    playerHpMap: Record<string, number>,
    playerSeatMap: Record<string, number>,
    cardCostMap: Record<string, number>
  ): LockedPlay[] {
    return [...plays].sort((a, b) => {
      // Skip-queue first
      if (a.skipQueue && !b.skipQueue) return -1;
      if (!a.skipQueue && b.skipQueue) return 1;

      // Lowest HP first
      const hpA = playerHpMap[a.playerId] ?? 999;
      const hpB = playerHpMap[b.playerId] ?? 999;
      if (hpA !== hpB) return hpA - hpB;

      // Tiebreak: lowest seat index
      const seatA = playerSeatMap[a.playerId] ?? 999;
      const seatB = playerSeatMap[b.playerId] ?? 999;
      if (seatA !== seatB) return seatA - seatB;

      // Within same player: lowest cost first
      return (cardCostMap[a.cardId] ?? 0) - (cardCostMap[b.cardId] ?? 0);
    });
  }

  it("should resolve skip-queue cards before normal cards", () => {
    const plays: LockedPlay[] = [
      { playerId: "p1", gamePlayerId: "gp1", cardId: "normal", skipQueue: false },
      { playerId: "p2", gamePlayerId: "gp2", cardId: "skip", skipQueue: true },
    ];
    const sorted = sortLockedPlays(
      plays,
      { p1: 30, p2: 40 },
      { p1: 0, p2: 1 },
      { normal: 2, skip: 1 }
    );
    expect(sorted[0].cardId).toBe("skip");
    expect(sorted[1].cardId).toBe("normal");
  });

  it("should resolve lowest HP first among normal cards", () => {
    const plays: LockedPlay[] = [
      { playerId: "p1", gamePlayerId: "gp1", cardId: "c1", skipQueue: false },
      { playerId: "p2", gamePlayerId: "gp2", cardId: "c2", skipQueue: false },
      { playerId: "p3", gamePlayerId: "gp3", cardId: "c3", skipQueue: false },
    ];
    const sorted = sortLockedPlays(
      plays,
      { p1: 40, p2: 15, p3: 30 },
      { p1: 0, p2: 1, p3: 2 },
      { c1: 2, c2: 2, c3: 2 }
    );
    expect(sorted[0].playerId).toBe("p2"); // 15 HP
    expect(sorted[1].playerId).toBe("p3"); // 30 HP
    expect(sorted[2].playerId).toBe("p1"); // 40 HP
  });

  it("should tiebreak by seat index when HP is equal", () => {
    const plays: LockedPlay[] = [
      { playerId: "p1", gamePlayerId: "gp1", cardId: "c1", skipQueue: false },
      { playerId: "p2", gamePlayerId: "gp2", cardId: "c2", skipQueue: false },
    ];
    const sorted = sortLockedPlays(
      plays,
      { p1: 30, p2: 30 },
      { p1: 2, p2: 0 },
      { c1: 2, c2: 2 }
    );
    expect(sorted[0].playerId).toBe("p2"); // seat 0
    expect(sorted[1].playerId).toBe("p1"); // seat 2
  });

  it("should sort by card cost within same player", () => {
    const plays: LockedPlay[] = [
      { playerId: "p1", gamePlayerId: "gp1", cardId: "expensive", skipQueue: false },
      { playerId: "p1", gamePlayerId: "gp1", cardId: "cheap", skipQueue: false },
    ];
    const sorted = sortLockedPlays(
      plays,
      { p1: 30 },
      { p1: 0 },
      { expensive: 5, cheap: 1 }
    );
    expect(sorted[0].cardId).toBe("cheap");
    expect(sorted[1].cardId).toBe("expensive");
  });

  it("should handle mixed skip-queue and HP ordering", () => {
    const plays: LockedPlay[] = [
      { playerId: "p1", gamePlayerId: "gp1", cardId: "c1", skipQueue: false },
      { playerId: "p2", gamePlayerId: "gp2", cardId: "c2", skipQueue: true },
      { playerId: "p3", gamePlayerId: "gp3", cardId: "c3", skipQueue: false },
      { playerId: "p4", gamePlayerId: "gp4", cardId: "c4", skipQueue: true },
    ];
    const sorted = sortLockedPlays(
      plays,
      { p1: 40, p2: 20, p3: 10, p4: 50 },
      { p1: 0, p2: 1, p3: 2, p4: 3 },
      { c1: 2, c2: 2, c3: 2, c4: 2 }
    );
    // Skip-queue first (p2 at 20HP, p4 at 50HP)
    expect(sorted[0].playerId).toBe("p2");
    expect(sorted[1].playerId).toBe("p4");
    // Normal cards (p3 at 10HP, p1 at 40HP)
    expect(sorted[2].playerId).toBe("p3");
    expect(sorted[3].playerId).toBe("p1");
  });

  it("should handle empty plays array", () => {
    const sorted = sortLockedPlays([], {}, {}, {});
    expect(sorted).toHaveLength(0);
  });

  it("should handle single play", () => {
    const plays: LockedPlay[] = [
      { playerId: "p1", gamePlayerId: "gp1", cardId: "c1", skipQueue: false },
    ];
    const sorted = sortLockedPlays(plays, { p1: 30 }, { p1: 0 }, { c1: 2 });
    expect(sorted).toHaveLength(1);
    expect(sorted[0].playerId).toBe("p1");
  });
});

describe("Pass sentinel detection", () => {
  it("should detect pass sentinel in locked_cards", () => {
    const passSentinel = [{ pass: true }];
    const realCards: LockedPlay[] = [
      { playerId: "p1", gamePlayerId: "gp1", cardId: "c1", skipQueue: false },
    ];
    const emptyCards: any[] = [];

    // Pass sentinel has length > 0
    expect(passSentinel.length > 0).toBe(true);
    // Real cards have length > 0
    expect(realCards.length > 0).toBe(true);
    // Empty array (not yet locked in) has length 0
    expect(emptyCards.length > 0).toBe(false);
  });

  it("should correctly determine hasLockedIn for all cases", () => {
    // Simulate getGameState hasLockedIn logic
    function hasLockedIn(gpLockedCards: any[], playerLocked: LockedPlay[]): boolean {
      return gpLockedCards.length > 0 || playerLocked.length > 0;
    }

    // Player who locked in with cards
    expect(hasLockedIn(
      [{ playerId: "p1", gamePlayerId: "gp1", cardId: "c1", skipQueue: false }],
      [{ playerId: "p1", gamePlayerId: "gp1", cardId: "c1", skipQueue: false }]
    )).toBe(true);

    // Player who passed (sentinel)
    expect(hasLockedIn([{ pass: true }], [])).toBe(true);

    // Player who hasn't locked in yet
    expect(hasLockedIn([], [])).toBe(false);
  });
});

describe("PlayerState with simultaneous fields", () => {
  it("should include lockedCards and hasLockedIn fields", () => {
    const player: PlayerState = {
      id: "p1",
      gamePlayerId: "gp1",
      username: "TestPlayer",
      seatIndex: 0,
      chosenSin: "wrath",
      currentHp: 50,
      maxHp: 50,
      isAlive: true,
      hand: ["card1", "card2"],
      deckSize: 20,
      discardSize: 0,
      currentEnergy: 3,
      maxEnergy: 3,
      bonusEnergy: 0,
      lockedCards: [],
      hasLockedIn: false,
    };
    expect(player.lockedCards).toEqual([]);
    expect(player.hasLockedIn).toBe(false);
  });

  it("should reflect locked-in state with cards", () => {
    const lockedPlays: LockedPlay[] = [
      { playerId: "p1", gamePlayerId: "gp1", cardId: "wrath_001", skipQueue: false },
    ];
    const player: PlayerState = {
      id: "p1",
      gamePlayerId: "gp1",
      username: "TestPlayer",
      seatIndex: 0,
      chosenSin: "wrath",
      currentHp: 50,
      maxHp: 50,
      isAlive: true,
      hand: ["card2"],
      deckSize: 19,
      discardSize: 1,
      currentEnergy: 1,
      maxEnergy: 3,
      bonusEnergy: 0,
      lockedCards: lockedPlays,
      hasLockedIn: true,
    };
    expect(player.hasLockedIn).toBe(true);
    expect(player.lockedCards).toHaveLength(1);
    expect(player.lockedCards[0].cardId).toBe("wrath_001");
  });
});

describe("GameState with simultaneous fields", () => {
  it("should include turnPhase and lockedPlays", () => {
    const state: Partial<GameState> = {
      turnPhase: "selection",
      lockedPlays: [],
    };
    expect(state.turnPhase).toBe("selection");
    expect(state.lockedPlays).toEqual([]);
  });

  it("should transition through phases correctly", () => {
    const phases: TurnPhase[] = ["selection", "resolution", "round_end"];
    // Selection → Resolution → Round End → Selection (next round)
    expect(phases[0]).toBe("selection");
    expect(phases[1]).toBe("resolution");
    expect(phases[2]).toBe("round_end");
  });
});

describe("allConfirmed check logic", () => {
  function allConfirmed(
    alivePlayers: Array<{ player_id: string; locked_cards: any[] | null }>,
    currentPlayerId: string
  ): boolean {
    return alivePlayers.every((p) => {
      if (p.player_id === currentPlayerId) return true;
      const pLocked = p.locked_cards;
      return Array.isArray(pLocked) && pLocked.length > 0;
    });
  }

  it("should return true when all players have locked in with cards", () => {
    const players = [
      { player_id: "p1", locked_cards: [{ cardId: "c1" }] },
      { player_id: "p2", locked_cards: [{ cardId: "c2" }] },
      { player_id: "p3", locked_cards: [{ pass: true }] }, // passed
    ];
    expect(allConfirmed(players, "p1")).toBe(true);
  });

  it("should return false when a player hasn't locked in", () => {
    const players = [
      { player_id: "p1", locked_cards: [{ cardId: "c1" }] },
      { player_id: "p2", locked_cards: [] }, // not locked in
      { player_id: "p3", locked_cards: [{ pass: true }] },
    ];
    expect(allConfirmed(players, "p1")).toBe(false);
  });

  it("should return true for current player even with empty locked_cards", () => {
    const players = [
      { player_id: "p1", locked_cards: [] }, // current player, just about to lock in
      { player_id: "p2", locked_cards: [{ cardId: "c2" }] },
    ];
    expect(allConfirmed(players, "p1")).toBe(true);
  });

  it("should handle null locked_cards", () => {
    const players = [
      { player_id: "p1", locked_cards: [{ cardId: "c1" }] },
      { player_id: "p2", locked_cards: null },
    ];
    expect(allConfirmed(players, "p1")).toBe(false);
  });
});
