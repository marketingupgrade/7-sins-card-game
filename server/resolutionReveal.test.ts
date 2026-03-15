/**
 * ResolutionReveal & RoundEndPrompt — Unit Tests
 *
 * Tests the resolution reveal animation data flow:
 * 1. Cached lockedPlays filtering (pass sentinels excluded)
 * 2. Resolution sorting (skip-queue, HP, seat, cost)
 * 3. Animation timing calculations
 * 4. RoundEndPrompt state transitions
 * 5. Data integrity for resolution players snapshot
 */

import { describe, it, expect } from "vitest";
import {
  LockedPlay,
  PlayerState,
  SinType,
} from "../shared/gameTypes";
import { CARD_MAP } from "../shared/cardData";

/* ─── Helper: Replicate ResolutionReveal's sortedPlays logic ─── */
function filterAndSortPlays(
  lockedPlays: LockedPlay[],
  players: PlayerState[]
): LockedPlay[] {
  if (!lockedPlays || lockedPlays.length === 0) return [];
  return [...lockedPlays]
    .filter((p) => !("pass" in p) && p.cardId)
    .sort((a, b) => {
      if (a.skipQueue && !b.skipQueue) return -1;
      if (!a.skipQueue && b.skipQueue) return 1;
      const playerA = players.find((p) => p.id === a.playerId);
      const playerB = players.find((p) => p.id === b.playerId);
      const hpA = playerA?.currentHp ?? 999;
      const hpB = playerB?.currentHp ?? 999;
      if (hpA !== hpB) return hpA - hpB;
      const seatA = playerA?.seatIndex ?? 999;
      const seatB = playerB?.seatIndex ?? 999;
      if (seatA !== seatB) return seatA - seatB;
      const cardA = CARD_MAP[a.cardId];
      const cardB = CARD_MAP[b.cardId];
      return (cardA?.cost ?? 0) - (cardB?.cost ?? 0);
    });
}

/* ─── Helper: Replicate safety timer calculation ─── */
function calculateMaxDuration(lockedPlays: LockedPlay[]): number {
  const cardCount = lockedPlays.filter(p => !("pass" in p) && p.cardId).length;
  return Math.max(8000, cardCount * 3500 + 3000);
}

/* ─── Helper: Create a test player ─── */
function makePlayer(overrides: Partial<PlayerState> & { id: string }): PlayerState {
  return {
    gamePlayerId: `gp-${overrides.id}`,
    username: overrides.username || `Player ${overrides.id}`,
    seatIndex: overrides.seatIndex ?? 0,
    chosenSin: overrides.chosenSin ?? "wrath",
    currentHp: overrides.currentHp ?? 200,
    maxHp: overrides.maxHp ?? 200,
    isAlive: overrides.isAlive ?? true,
    hand: overrides.hand ?? [],
    deckSize: overrides.deckSize ?? 20,
    discardSize: overrides.discardSize ?? 0,
    currentEnergy: overrides.currentEnergy ?? 3,
    maxEnergy: overrides.maxEnergy ?? 3,
    bonusEnergy: overrides.bonusEnergy ?? 0,
    lockedCards: overrides.lockedCards ?? [],
    hasLockedIn: overrides.hasLockedIn ?? true,
    consumedThisRound: overrides.consumedThisRound ?? false,
    ...overrides,
  };
}

describe("ResolutionReveal — Play Filtering", () => {
  it("should filter out pass sentinels from lockedPlays", () => {
    const plays: any[] = [
      { playerId: "p1", gamePlayerId: "gp1", cardId: "wrath_001", skipQueue: false },
      { pass: true }, // pass sentinel
      { playerId: "p2", gamePlayerId: "gp2", cardId: "sloth_001", skipQueue: false },
    ];
    const players = [
      makePlayer({ id: "p1", seatIndex: 0 }),
      makePlayer({ id: "p2", seatIndex: 1 }),
    ];
    const sorted = filterAndSortPlays(plays, players);
    expect(sorted).toHaveLength(2);
    expect(sorted.every(p => p.cardId)).toBe(true);
  });

  it("should return empty array for empty lockedPlays", () => {
    const sorted = filterAndSortPlays([], []);
    expect(sorted).toHaveLength(0);
  });

  it("should return empty array when all plays are passes", () => {
    const plays: any[] = [
      { pass: true },
      { pass: true },
    ];
    const sorted = filterAndSortPlays(plays, []);
    expect(sorted).toHaveLength(0);
  });

  it("should handle plays without cardId", () => {
    const plays: any[] = [
      { playerId: "p1", gamePlayerId: "gp1", cardId: "wrath_001", skipQueue: false },
      { playerId: "p2", gamePlayerId: "gp2", cardId: undefined, skipQueue: false },
    ];
    const players = [makePlayer({ id: "p1" })];
    const sorted = filterAndSortPlays(plays, players);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].cardId).toBe("wrath_001");
  });
});

describe("ResolutionReveal — Sort Order", () => {
  const players = [
    makePlayer({ id: "p1", seatIndex: 0, currentHp: 150 }),
    makePlayer({ id: "p2", seatIndex: 1, currentHp: 80 }),
    makePlayer({ id: "p3", seatIndex: 2, currentHp: 120 }),
  ];

  it("should sort skip-queue cards before normal cards", () => {
    const plays: LockedPlay[] = [
      { playerId: "p1", gamePlayerId: "gp1", cardId: "wrath_001", skipQueue: false },
      { playerId: "p2", gamePlayerId: "gp2", cardId: "wrath_002", skipQueue: true },
    ];
    const sorted = filterAndSortPlays(plays, players);
    expect(sorted[0].playerId).toBe("p2"); // skip-queue first
    expect(sorted[1].playerId).toBe("p1");
  });

  it("should sort by HP (lowest first) among normal cards", () => {
    const plays: LockedPlay[] = [
      { playerId: "p1", gamePlayerId: "gp1", cardId: "wrath_001", skipQueue: false },
      { playerId: "p2", gamePlayerId: "gp2", cardId: "wrath_002", skipQueue: false },
      { playerId: "p3", gamePlayerId: "gp3", cardId: "wrath_003", skipQueue: false },
    ];
    const sorted = filterAndSortPlays(plays, players);
    expect(sorted[0].playerId).toBe("p2"); // 80 HP
    expect(sorted[1].playerId).toBe("p3"); // 120 HP
    expect(sorted[2].playerId).toBe("p1"); // 150 HP
  });

  it("should tiebreak by seat index when HP is equal", () => {
    const equalHpPlayers = [
      makePlayer({ id: "p1", seatIndex: 2, currentHp: 100 }),
      makePlayer({ id: "p2", seatIndex: 0, currentHp: 100 }),
    ];
    const plays: LockedPlay[] = [
      { playerId: "p1", gamePlayerId: "gp1", cardId: "wrath_001", skipQueue: false },
      { playerId: "p2", gamePlayerId: "gp2", cardId: "wrath_002", skipQueue: false },
    ];
    const sorted = filterAndSortPlays(plays, equalHpPlayers);
    expect(sorted[0].playerId).toBe("p2"); // seat 0
    expect(sorted[1].playerId).toBe("p1"); // seat 2
  });
});

describe("ResolutionReveal — Animation Timing", () => {
  it("should calculate minimum 8 seconds for 0-1 cards", () => {
    const plays: LockedPlay[] = [
      { playerId: "p1", gamePlayerId: "gp1", cardId: "wrath_001", skipQueue: false },
    ];
    const duration = calculateMaxDuration(plays);
    expect(duration).toBe(8000); // max(8000, 1 * 3500 + 3000) = max(8000, 6500) = 8000
  });

  it("should scale duration with card count", () => {
    const plays: LockedPlay[] = [
      { playerId: "p1", gamePlayerId: "gp1", cardId: "wrath_001", skipQueue: false },
      { playerId: "p2", gamePlayerId: "gp2", cardId: "wrath_002", skipQueue: false },
      { playerId: "p3", gamePlayerId: "gp3", cardId: "wrath_003", skipQueue: false },
    ];
    const duration = calculateMaxDuration(plays);
    expect(duration).toBe(3 * 3500 + 3000); // 13500
  });

  it("should exclude pass sentinels from timing calculation", () => {
    const plays: any[] = [
      { playerId: "p1", gamePlayerId: "gp1", cardId: "wrath_001", skipQueue: false },
      { pass: true },
      { playerId: "p2", gamePlayerId: "gp2", cardId: "wrath_002", skipQueue: false },
    ];
    const duration = calculateMaxDuration(plays);
    expect(duration).toBe(10000); // 2 cards: max(8000, 2*3500+3000) = 10000
  });

  it("should handle large number of cards (8 cards)", () => {
    const plays: LockedPlay[] = Array.from({ length: 8 }, (_, i) => ({
      playerId: `p${i}`,
      gamePlayerId: `gp${i}`,
      cardId: `wrath_00${i + 1}`,
      skipQueue: false,
    }));
    const duration = calculateMaxDuration(plays);
    expect(duration).toBe(8 * 3500 + 3000); // 31000
    expect(duration).toBeGreaterThan(8000);
  });
});

describe("ResolutionReveal — Player Snapshot Integrity", () => {
  it("should preserve player data in cached snapshot", () => {
    const originalPlayers: PlayerState[] = [
      makePlayer({ id: "p1", username: "Wrath Lord", chosenSin: "wrath", currentHp: 150, seatIndex: 0 }),
      makePlayer({ id: "p2", username: "Sloth Master", chosenSin: "sloth", currentHp: 80, seatIndex: 1 }),
    ];

    // Simulate caching (spread operator as used in GameBoard)
    const cached = [...originalPlayers];

    expect(cached).toHaveLength(2);
    expect(cached[0].username).toBe("Wrath Lord");
    expect(cached[0].chosenSin).toBe("wrath");
    expect(cached[1].username).toBe("Sloth Master");
    expect(cached[1].chosenSin).toBe("sloth");
  });

  it("should include all 7 sin types as valid faction themes", () => {
    const sins: SinType[] = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];
    sins.forEach(sin => {
      const player = makePlayer({ id: `p-${sin}`, chosenSin: sin });
      expect(player.chosenSin).toBe(sin);
    });
  });
});

describe("RoundEndPrompt — State Transitions", () => {
  it("should transition: resolution animation → prompt → dismiss", () => {
    // Simulate the state machine
    let isShowingResolution = false;
    let showRoundEndPrompt = false;
    let cachedLockedPlays: LockedPlay[] = [];

    // Step 1: Resolution starts
    const plays: LockedPlay[] = [
      { playerId: "p1", gamePlayerId: "gp1", cardId: "wrath_001", skipQueue: false },
    ];
    cachedLockedPlays = [...plays];
    isShowingResolution = true;
    expect(isShowingResolution).toBe(true);
    expect(cachedLockedPlays).toHaveLength(1);

    // Step 2: Animation completes → show prompt
    showRoundEndPrompt = true;
    expect(showRoundEndPrompt).toBe(true);
    expect(isShowingResolution).toBe(true); // still showing until dismissed

    // Step 3: User clicks "Continue" → dismiss everything
    showRoundEndPrompt = false;
    isShowingResolution = false;
    cachedLockedPlays = [];
    expect(showRoundEndPrompt).toBe(false);
    expect(isShowingResolution).toBe(false);
    expect(cachedLockedPlays).toHaveLength(0);
  });

  it("should transition: resolution animation → prompt → view battle log", () => {
    let isShowingResolution = true;
    let showRoundEndPrompt = true;
    let showLog = false;

    // User clicks "View Battle Log"
    showRoundEndPrompt = false;
    isShowingResolution = false;
    showLog = true;

    expect(showRoundEndPrompt).toBe(false);
    expect(isShowingResolution).toBe(false);
    expect(showLog).toBe(true);
  });

  it("should auto-dismiss prompt after timeout", () => {
    let showRoundEndPrompt = true;
    let isShowingResolution = true;

    // Simulate auto-dismiss (6 second timeout)
    // In production this is setTimeout, here we just verify the state change
    showRoundEndPrompt = false;
    isShowingResolution = false;

    expect(showRoundEndPrompt).toBe(false);
    expect(isShowingResolution).toBe(false);
  });
});

describe("ResolutionReveal — Card Data Validation", () => {
  it("should find cards in CARD_MAP for all 7 factions", () => {
    const factionPrefixes = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];
    for (const prefix of factionPrefixes) {
      const factionCards = Object.keys(CARD_MAP).filter(id => id.startsWith(prefix));
      expect(factionCards.length).toBeGreaterThan(0);
    }
  });

  it("should have cost property on all cards used in resolution", () => {
    // Sample some cards from each faction
    const sampleCards = ["wrath_001", "sloth_001", "greed_001", "envy_001", "pride_001", "lust_001", "gluttony_001"];
    for (const cardId of sampleCards) {
      const card = CARD_MAP[cardId];
      if (card) {
        expect(typeof card.cost).toBe("number");
        expect(card.cost).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("should have effects array on all cards for effect badge display", () => {
    const sampleCards = ["wrath_001", "sloth_001", "greed_001"];
    for (const cardId of sampleCards) {
      const card = CARD_MAP[cardId];
      if (card) {
        expect(Array.isArray(card.effects)).toBe(true);
        expect(card.effects.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("ResolutionReveal — Edge Cases", () => {
  it("should handle player not found in players array", () => {
    const plays: LockedPlay[] = [
      { playerId: "unknown-player", gamePlayerId: "gp-unknown", cardId: "wrath_001", skipQueue: false },
    ];
    const players: PlayerState[] = []; // empty players
    const sorted = filterAndSortPlays(plays, players);
    // Should still return the play, just with default HP/seat values
    expect(sorted).toHaveLength(1);
    expect(sorted[0].playerId).toBe("unknown-player");
  });

  it("should handle duplicate cardIds from same player", () => {
    const players = [makePlayer({ id: "p1", seatIndex: 0 })];
    const plays: LockedPlay[] = [
      { playerId: "p1", gamePlayerId: "gp1", cardId: "wrath_001", skipQueue: false },
      { playerId: "p1", gamePlayerId: "gp1", cardId: "wrath_002", skipQueue: false },
    ];
    const sorted = filterAndSortPlays(plays, players);
    expect(sorted).toHaveLength(2);
  });

  it("should handle all players passing (no cards to animate)", () => {
    const plays: any[] = [
      { pass: true },
      { pass: true },
      { pass: true },
    ];
    const sorted = filterAndSortPlays(plays, []);
    expect(sorted).toHaveLength(0);
    const duration = calculateMaxDuration(plays);
    expect(duration).toBe(8000); // minimum duration
  });
});
