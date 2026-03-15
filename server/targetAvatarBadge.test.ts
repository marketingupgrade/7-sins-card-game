/**
 * Tests for TargetAvatarBadge multi-target logic
 * 
 * Validates the getCardTargetInfo helper function behavior for:
 * - Single target cards
 * - Self-only cards
 * - AoE cards (all opponents)
 * - Duo cards (2 targets)
 * - Mixed cards (self + aoe, self + single, etc.)
 * 
 * Since getCardTargetInfo is a useCallback in GameBoard, we test the
 * equivalent pure logic here to verify correctness.
 */

import { describe, it, expect } from "vitest";

// ─── Replicate the target mode detection logic from getCardTargetInfo ───
type TargetMode = "single" | "duo" | "aoe" | "self";

interface Effect {
  targetMode: TargetMode;
}

interface Card {
  id: string;
  effects: Effect[];
}

interface Player {
  id: string;
  isAlive: boolean;
  chosenSin: string;
  username: string;
  currentHp: number;
}

interface SelectedCard {
  cardId: string;
  targetPlayerId?: string;
}

/**
 * Pure function equivalent of getCardTargetInfo from GameBoard.tsx
 */
function getCardTargetInfo(
  cardId: string,
  cards: Record<string, Card>,
  players: Player[],
  selectedCards: SelectedCard[],
  playerId: string
) {
  const empty = {
    needsTarget: false,
    isSelf: false,
    targetSin: undefined as string | undefined,
    targetName: undefined as string | undefined,
    isAoe: false,
    isDuo: false,
    targets: [] as Array<{ sin: string; name: string }>,
  };

  const sel = selectedCards.find((s) => s.cardId === cardId);
  if (!sel) return empty;
  const card = cards[cardId];
  if (!card) return empty;

  const hasSingleTarget = card.effects.some((e) => e.targetMode === "single");
  const hasDuo = card.effects.some((e) => e.targetMode === "duo");
  const hasAoe = card.effects.some((e) => e.targetMode === "aoe");
  const hasSelf = card.effects.some((e) => e.targetMode === "self");

  const aliveOpponents = players
    .filter((p) => p.isAlive && p.id !== playerId)
    .sort((a, b) => a.currentHp - b.currentHp);

  // AoE card — hits all opponents
  if (hasAoe) {
    const targets = aliveOpponents.map((p) => ({
      sin: p.chosenSin || "wrath",
      name: p.username,
    }));
    return {
      needsTarget: false,
      isSelf: hasSelf,
      targetSin: undefined,
      targetName: undefined,
      isAoe: true,
      isDuo: false,
      targets,
    };
  }

  // Duo card — hits 2 targets
  if (hasDuo) {
    if (!sel.targetPlayerId) {
      return { ...empty, needsTarget: true, isDuo: true };
    }
    const primaryTarget = players.find((p) => p.id === sel.targetPlayerId);
    const secondaryTarget = aliveOpponents.find(
      (p) => p.id !== sel.targetPlayerId
    );
    const targets: Array<{ sin: string; name: string }> = [];
    if (primaryTarget)
      targets.push({
        sin: primaryTarget.chosenSin || "wrath",
        name: primaryTarget.username,
      });
    if (secondaryTarget)
      targets.push({
        sin: secondaryTarget.chosenSin || "wrath",
        name: secondaryTarget.username,
      });
    return {
      needsTarget: false,
      isSelf: hasSelf,
      targetSin: undefined,
      targetName: undefined,
      isAoe: false,
      isDuo: true,
      targets,
    };
  }

  // Single target card
  if (hasSingleTarget) {
    if (!sel.targetPlayerId) return { ...empty, needsTarget: true };
    const target = players.find((p) => p.id === sel.targetPlayerId);
    if (target)
      return {
        ...empty,
        needsTarget: false,
        isSelf: target.id === playerId,
        targetSin: target.chosenSin || undefined,
        targetName: target.username,
      };
    return empty;
  }

  // Self-only card
  if (hasSelf) {
    return { ...empty, isSelf: true };
  }

  return empty;
}

// ─── Test fixtures ───────────────────────────────────────────────

const PLAYER_ID = "p1";

const PLAYERS: Player[] = [
  { id: "p1", isAlive: true, chosenSin: "wrath", username: "Player1", currentHp: 180 },
  { id: "p2", isAlive: true, chosenSin: "envy", username: "EnvyBot", currentHp: 150 },
  { id: "p3", isAlive: true, chosenSin: "pride", username: "PrideBot", currentHp: 120 },
  { id: "p4", isAlive: true, chosenSin: "sloth", username: "SlothBot", currentHp: 90 },
  { id: "p5", isAlive: false, chosenSin: "greed", username: "GreedBot", currentHp: 0 },
];

const CARDS: Record<string, Card> = {
  // Pure single target
  single_card: { id: "single_card", effects: [{ targetMode: "single" }] },
  // Pure self
  self_card: { id: "self_card", effects: [{ targetMode: "self" }] },
  // Pure AoE
  aoe_card: { id: "aoe_card", effects: [{ targetMode: "aoe" }] },
  // Pure duo
  duo_card: { id: "duo_card", effects: [{ targetMode: "duo" }] },
  // Mixed: self + aoe (e.g., Inferno Wave)
  self_aoe_card: {
    id: "self_aoe_card",
    effects: [{ targetMode: "self" }, { targetMode: "aoe" }],
  },
  // Mixed: self + single (e.g., Burning Fists)
  self_single_card: {
    id: "self_single_card",
    effects: [{ targetMode: "self" }, { targetMode: "single" }],
  },
  // Mixed: self + duo (e.g., Fury Storm)
  self_duo_card: {
    id: "self_duo_card",
    effects: [{ targetMode: "self" }, { targetMode: "duo" }],
  },
  // Mixed: aoe + single (e.g., Scorched Earth)
  aoe_single_card: {
    id: "aoe_single_card",
    effects: [{ targetMode: "aoe" }, { targetMode: "single" }],
  },
};

// ─── Tests ───────────────────────────────────────────────────────

describe("getCardTargetInfo — target mode detection", () => {
  describe("card not selected", () => {
    it("returns empty when card is not in selectedCards", () => {
      const result = getCardTargetInfo("single_card", CARDS, PLAYERS, [], PLAYER_ID);
      expect(result.needsTarget).toBe(false);
      expect(result.isSelf).toBe(false);
      expect(result.isAoe).toBe(false);
      expect(result.isDuo).toBe(false);
      expect(result.targets).toHaveLength(0);
    });
  });

  describe("single target cards", () => {
    it("shows needsTarget when no target selected", () => {
      const result = getCardTargetInfo(
        "single_card", CARDS, PLAYERS,
        [{ cardId: "single_card" }],
        PLAYER_ID
      );
      expect(result.needsTarget).toBe(true);
      expect(result.isAoe).toBe(false);
      expect(result.isDuo).toBe(false);
    });

    it("shows target info when target is assigned", () => {
      const result = getCardTargetInfo(
        "single_card", CARDS, PLAYERS,
        [{ cardId: "single_card", targetPlayerId: "p2" }],
        PLAYER_ID
      );
      expect(result.needsTarget).toBe(false);
      expect(result.targetSin).toBe("envy");
      expect(result.targetName).toBe("EnvyBot");
      expect(result.isSelf).toBe(false);
    });

    it("shows isSelf when targeting self", () => {
      const result = getCardTargetInfo(
        "single_card", CARDS, PLAYERS,
        [{ cardId: "single_card", targetPlayerId: "p1" }],
        PLAYER_ID
      );
      expect(result.isSelf).toBe(true);
    });
  });

  describe("self-only cards", () => {
    it("shows isSelf for self-only cards", () => {
      const result = getCardTargetInfo(
        "self_card", CARDS, PLAYERS,
        [{ cardId: "self_card" }],
        PLAYER_ID
      );
      expect(result.isSelf).toBe(true);
      expect(result.needsTarget).toBe(false);
      expect(result.isAoe).toBe(false);
    });
  });

  describe("AoE cards", () => {
    it("returns isAoe=true with all alive opponents as targets", () => {
      const result = getCardTargetInfo(
        "aoe_card", CARDS, PLAYERS,
        [{ cardId: "aoe_card" }],
        PLAYER_ID
      );
      expect(result.isAoe).toBe(true);
      expect(result.needsTarget).toBe(false);
      expect(result.isSelf).toBe(false);
      // Should include p2, p3, p4 (alive opponents), NOT p1 (self) or p5 (dead)
      expect(result.targets).toHaveLength(3);
      expect(result.targets.map((t) => t.name)).toContain("EnvyBot");
      expect(result.targets.map((t) => t.name)).toContain("PrideBot");
      expect(result.targets.map((t) => t.name)).toContain("SlothBot");
      expect(result.targets.map((t) => t.name)).not.toContain("Player1");
      expect(result.targets.map((t) => t.name)).not.toContain("GreedBot");
    });

    it("sorts opponents by HP (lowest first)", () => {
      const result = getCardTargetInfo(
        "aoe_card", CARDS, PLAYERS,
        [{ cardId: "aoe_card" }],
        PLAYER_ID
      );
      expect(result.targets[0].name).toBe("SlothBot"); // 90 HP
      expect(result.targets[1].name).toBe("PrideBot"); // 120 HP
      expect(result.targets[2].name).toBe("EnvyBot"); // 150 HP
    });

    it("does not require target selection", () => {
      const result = getCardTargetInfo(
        "aoe_card", CARDS, PLAYERS,
        [{ cardId: "aoe_card" }],
        PLAYER_ID
      );
      expect(result.needsTarget).toBe(false);
    });
  });

  describe("duo cards", () => {
    it("shows needsTarget when no target selected", () => {
      const result = getCardTargetInfo(
        "duo_card", CARDS, PLAYERS,
        [{ cardId: "duo_card" }],
        PLAYER_ID
      );
      expect(result.needsTarget).toBe(true);
      expect(result.isDuo).toBe(true);
    });

    it("shows 2 targets when primary target is assigned", () => {
      const result = getCardTargetInfo(
        "duo_card", CARDS, PLAYERS,
        [{ cardId: "duo_card", targetPlayerId: "p2" }],
        PLAYER_ID
      );
      expect(result.isDuo).toBe(true);
      expect(result.needsTarget).toBe(false);
      expect(result.targets).toHaveLength(2);
      // Primary target is p2 (EnvyBot)
      expect(result.targets[0].name).toBe("EnvyBot");
      // Secondary is lowest HP opponent that isn't p2 → SlothBot (90 HP)
      expect(result.targets[1].name).toBe("SlothBot");
    });

    it("shows 1 target when only 1 opponent alive", () => {
      const twoPlayers: Player[] = [
        { id: "p1", isAlive: true, chosenSin: "wrath", username: "Player1", currentHp: 180 },
        { id: "p2", isAlive: true, chosenSin: "envy", username: "EnvyBot", currentHp: 150 },
      ];
      const result = getCardTargetInfo(
        "duo_card", CARDS, twoPlayers,
        [{ cardId: "duo_card", targetPlayerId: "p2" }],
        PLAYER_ID
      );
      expect(result.isDuo).toBe(true);
      expect(result.targets).toHaveLength(1);
      expect(result.targets[0].name).toBe("EnvyBot");
    });
  });

  describe("mixed self + AoE cards", () => {
    it("returns isAoe=true AND isSelf=true", () => {
      const result = getCardTargetInfo(
        "self_aoe_card", CARDS, PLAYERS,
        [{ cardId: "self_aoe_card" }],
        PLAYER_ID
      );
      expect(result.isAoe).toBe(true);
      expect(result.isSelf).toBe(true);
      expect(result.needsTarget).toBe(false);
      expect(result.targets).toHaveLength(3);
    });
  });

  describe("mixed self + single cards", () => {
    it("requires target selection (single takes priority)", () => {
      const result = getCardTargetInfo(
        "self_single_card", CARDS, PLAYERS,
        [{ cardId: "self_single_card" }],
        PLAYER_ID
      );
      expect(result.needsTarget).toBe(true);
      expect(result.isAoe).toBe(false);
      expect(result.isDuo).toBe(false);
    });

    it("shows target when assigned", () => {
      const result = getCardTargetInfo(
        "self_single_card", CARDS, PLAYERS,
        [{ cardId: "self_single_card", targetPlayerId: "p3" }],
        PLAYER_ID
      );
      expect(result.needsTarget).toBe(false);
      expect(result.targetSin).toBe("pride");
      expect(result.targetName).toBe("PrideBot");
    });
  });

  describe("mixed self + duo cards", () => {
    it("returns isDuo=true AND isSelf=true when target assigned", () => {
      const result = getCardTargetInfo(
        "self_duo_card", CARDS, PLAYERS,
        [{ cardId: "self_duo_card", targetPlayerId: "p3" }],
        PLAYER_ID
      );
      expect(result.isDuo).toBe(true);
      expect(result.isSelf).toBe(true);
      expect(result.targets).toHaveLength(2);
    });
  });

  describe("mixed AoE + single cards", () => {
    it("AoE takes priority — shows all opponents, no target needed", () => {
      const result = getCardTargetInfo(
        "aoe_single_card", CARDS, PLAYERS,
        [{ cardId: "aoe_single_card" }],
        PLAYER_ID
      );
      // AoE check comes first in the function, so it should be treated as AoE
      expect(result.isAoe).toBe(true);
      expect(result.needsTarget).toBe(false);
      expect(result.targets).toHaveLength(3);
    });
  });

  describe("edge cases", () => {
    it("handles unknown card gracefully", () => {
      const result = getCardTargetInfo(
        "nonexistent", CARDS, PLAYERS,
        [{ cardId: "nonexistent" }],
        PLAYER_ID
      );
      expect(result.needsTarget).toBe(false);
      expect(result.targets).toHaveLength(0);
    });

    it("excludes dead opponents from AoE targets", () => {
      const result = getCardTargetInfo(
        "aoe_card", CARDS, PLAYERS,
        [{ cardId: "aoe_card" }],
        PLAYER_ID
      );
      const names = result.targets.map((t) => t.name);
      expect(names).not.toContain("GreedBot"); // dead player
    });

    it("handles all opponents dead (empty targets)", () => {
      const allDead: Player[] = [
        { id: "p1", isAlive: true, chosenSin: "wrath", username: "Player1", currentHp: 180 },
        { id: "p2", isAlive: false, chosenSin: "envy", username: "EnvyBot", currentHp: 0 },
      ];
      const result = getCardTargetInfo(
        "aoe_card", CARDS, allDead,
        [{ cardId: "aoe_card" }],
        PLAYER_ID
      );
      expect(result.isAoe).toBe(true);
      expect(result.targets).toHaveLength(0);
    });
  });
});
