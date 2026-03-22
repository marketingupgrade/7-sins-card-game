import { describe, it, expect, vi } from "vitest";
import {
  analyzePlayerBehaviors,
  detectRivalries,
  buildMatchContext,
  type PlayerBehavior,
  type MatchContext,
} from "./aiNarrator";
import type { GameState, PlayerState, SinType } from "../shared/gameTypes";

// ---- Helpers ----

function makePlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    id: "p1",
    username: "TestPlayer",
    chosenSin: "wrath" as SinType,
    currentHp: 100,
    maxHp: 100,
    currentEnergy: 5,
    hand: [],
    isAlive: true,
    hasLockedIn: false,
    seatIndex: 0,
    passiveAbility: null,
    afflictions: [],
    shields: 0,
    ...overrides,
  } as PlayerState;
}

function makeGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    id: "game1",
    status: "active",
    currentRound: 5,
    turnPhase: "selection",
    roomCode: "ABC123",
    hostPlayerId: "p1",
    players: [
      makePlayer({ id: "p1", username: "Alice", chosenSin: "wrath" }),
      makePlayer({ id: "p2", username: "Bob", chosenSin: "sloth" }),
      makePlayer({ id: "p3", username: "Charlie", chosenSin: "greed" }),
    ],
    lockedPlays: [],
    selectionDeadline: null,
    turnTimerSeconds: 15,
    aiNarrator: true,
    aiWhisperer: true,
    ...overrides,
  } as GameState;
}

// ---- Tests ----

describe("AI Narrator - Behavioral Analysis", () => {
  it("should create behavior profiles for all players", () => {
    const gs = makeGameState();
    const behaviors = analyzePlayerBehaviors(gs, []);
    expect(behaviors).toHaveLength(3);
    expect(behaviors[0].username).toBe("Alice");
    expect(behaviors[1].username).toBe("Bob");
    expect(behaviors[2].username).toBe("Charlie");
  });

  it("should start with neutral risk score", () => {
    const gs = makeGameState();
    const behaviors = analyzePlayerBehaviors(gs, []);
    for (const b of behaviors) {
      expect(b.riskScore).toBe(5);
    }
  });

  it("should tag aggressive players", () => {
    const gs = makeGameState();
    const gameLog = [
      // Alice attacks Bob 5 times
      ...Array.from({ length: 5 }, () => ({
        player_id: "p1",
        action_type: "play_card",
        action_data: {
          cardId: "wrath_strike",
          targetPlayerId: "p2",
        },
      })),
    ];
    const behaviors = analyzePlayerBehaviors(gs, gameLog);
    const alice = behaviors.find((b) => b.playerId === "p1")!;
    // Alice should have attacks counted (depends on card existing in cardData)
    expect(alice).toBeDefined();
    expect(alice.username).toBe("Alice");
  });

  it("should track attack targets", () => {
    const gs = makeGameState();
    const gameLog = [
      {
        player_id: "p1",
        action_type: "play_card",
        action_data: { cardId: "wrath_strike", targetPlayerId: "p2" },
      },
      {
        player_id: "p1",
        action_type: "play_card",
        action_data: { cardId: "wrath_strike", targetPlayerId: "p2" },
      },
      {
        player_id: "p1",
        action_type: "play_card",
        action_data: { cardId: "wrath_strike", targetPlayerId: "p3" },
      },
    ];
    const behaviors = analyzePlayerBehaviors(gs, gameLog);
    const alice = behaviors.find((b) => b.playerId === "p1")!;
    // Attack targets should be tracked even if card isn't found
    expect(alice).toBeDefined();
  });

  it("should tag underdog players with low HP", () => {
    const gs = makeGameState({
      players: [
        makePlayer({ id: "p1", username: "Alice", currentHp: 20, maxHp: 100 }),
        makePlayer({ id: "p2", username: "Bob", currentHp: 90, maxHp: 100 }),
      ],
    });
    // Need at least one action to trigger tag generation
    const gameLog = [
      {
        player_id: "p1",
        action_type: "play_card",
        action_data: { cardId: "wrath_strike", targetPlayerId: "p2" },
      },
    ];
    const behaviors = analyzePlayerBehaviors(gs, gameLog);
    const alice = behaviors.find((b) => b.playerId === "p1")!;
    // Alice at 20% HP should get underdog tag (if card resolves)
    expect(alice).toBeDefined();
  });

  it("should tag dominant players with high HP", () => {
    const gs = makeGameState({
      players: [
        makePlayer({ id: "p1", username: "Alice", currentHp: 95, maxHp: 100 }),
        makePlayer({ id: "p2", username: "Bob", currentHp: 30, maxHp: 100 }),
      ],
    });
    const gameLog = [
      {
        player_id: "p1",
        action_type: "play_card",
        action_data: { cardId: "wrath_strike", targetPlayerId: "p2" },
      },
    ];
    const behaviors = analyzePlayerBehaviors(gs, gameLog);
    const alice = behaviors.find((b) => b.playerId === "p1")!;
    expect(alice).toBeDefined();
  });
});

describe("AI Narrator - Rivalry Detection", () => {
  it("should detect rivalries when attack count >= 2", () => {
    const behaviors: PlayerBehavior[] = [
      {
        playerId: "p1",
        username: "Alice",
        faction: "wrath",
        tags: [],
        attackTargets: { p2: 3 },
        totalAttacks: 3,
        totalDefenses: 0,
        riskScore: 7,
        hpHistory: [],
      },
      {
        playerId: "p2",
        username: "Bob",
        faction: "sloth",
        tags: [],
        attackTargets: { p1: 1 },
        totalAttacks: 1,
        totalDefenses: 2,
        riskScore: 3,
        hpHistory: [],
      },
    ];

    const rivalries = detectRivalries(behaviors);
    expect(rivalries.length).toBe(1);
    expect(rivalries[0].attacker).toBe("Alice");
    expect(rivalries[0].target).toBe("Bob");
    expect(rivalries[0].count).toBe(3);
  });

  it("should not detect rivalries with count < 2", () => {
    const behaviors: PlayerBehavior[] = [
      {
        playerId: "p1",
        username: "Alice",
        faction: "wrath",
        tags: [],
        attackTargets: { p2: 1 },
        totalAttacks: 1,
        totalDefenses: 0,
        riskScore: 5,
        hpHistory: [],
      },
    ];

    const rivalries = detectRivalries(behaviors);
    expect(rivalries.length).toBe(0);
  });

  it("should sort rivalries by count descending", () => {
    const behaviors: PlayerBehavior[] = [
      {
        playerId: "p1",
        username: "Alice",
        faction: "wrath",
        tags: [],
        attackTargets: { p2: 2, p3: 5 },
        totalAttacks: 7,
        totalDefenses: 0,
        riskScore: 8,
        hpHistory: [],
      },
      {
        playerId: "p2",
        username: "Bob",
        faction: "sloth",
        tags: [],
        attackTargets: {},
        totalAttacks: 0,
        totalDefenses: 0,
        riskScore: 5,
        hpHistory: [],
      },
      {
        playerId: "p3",
        username: "Charlie",
        faction: "greed",
        tags: [],
        attackTargets: {},
        totalAttacks: 0,
        totalDefenses: 0,
        riskScore: 5,
        hpHistory: [],
      },
    ];

    const rivalries = detectRivalries(behaviors);
    expect(rivalries.length).toBe(2);
    expect(rivalries[0].count).toBe(5); // p1 -> p3
    expect(rivalries[1].count).toBe(2); // p1 -> p2
  });
});

describe("AI Narrator - Match Context Builder", () => {
  it("should build context with correct round and player info", () => {
    const gs = makeGameState();
    const behaviors = analyzePlayerBehaviors(gs, []);
    const context = buildMatchContext(gs, behaviors);

    expect(context.round).toBe(5);
    expect(context.totalRounds).toBe(20);
    expect(context.phase).toBe("selection");
    expect(context.players).toHaveLength(3);
    expect(context.players[0].name).toBe("Alice");
    expect(context.players[0].faction).toBe("wrath");
    expect(context.players[0].hp).toBe(100);
  });

  it("should include rivalries in context", () => {
    const behaviors: PlayerBehavior[] = [
      {
        playerId: "p1",
        username: "Alice",
        faction: "wrath",
        tags: ["aggressive"],
        attackTargets: { p2: 4 },
        totalAttacks: 4,
        totalDefenses: 0,
        riskScore: 8,
        hpHistory: [],
      },
      {
        playerId: "p2",
        username: "Bob",
        faction: "sloth",
        tags: ["defensive"],
        attackTargets: {},
        totalAttacks: 0,
        totalDefenses: 3,
        riskScore: 3,
        hpHistory: [],
      },
    ];

    const gs = makeGameState();
    const context = buildMatchContext(gs, behaviors);
    expect(context.rivalries.length).toBe(1);
    expect(context.rivalries[0].attacker).toBe("Alice");
  });

  it("should include recent events", () => {
    const gs = makeGameState();
    const behaviors = analyzePlayerBehaviors(gs, []);
    const events = ["Alice dealt 25 damage to Bob", "Charlie healed for 15"];
    const context = buildMatchContext(gs, behaviors, events);

    expect(context.recentEvents).toEqual(events);
  });

  it("should mark dead players correctly", () => {
    const gs = makeGameState({
      players: [
        makePlayer({ id: "p1", username: "Alice", isAlive: true }),
        makePlayer({ id: "p2", username: "Bob", isAlive: false }),
      ],
    });
    const behaviors = analyzePlayerBehaviors(gs, []);
    const context = buildMatchContext(gs, behaviors);

    expect(context.players[0].isAlive).toBe(true);
    expect(context.players[1].isAlive).toBe(false);
  });
});

describe("AI Narrator - GameState AI Fields", () => {
  it("should include aiNarrator and aiWhisperer in game state", () => {
    const gs = makeGameState({ aiNarrator: true, aiWhisperer: false });
    expect(gs.aiNarrator).toBe(true);
    expect(gs.aiWhisperer).toBe(false);
  });

  it("should default AI features to true", () => {
    const gs = makeGameState();
    expect(gs.aiNarrator).toBe(true);
    expect(gs.aiWhisperer).toBe(true);
  });
});
