/**
 * Affliction Table Tests
 *
 * Tests for the balance sheet projection logic used by
 * PlayerAfflictionTable component. Validates Pain/Gain
 * calculations, compound tick projections, and net totals.
 */

import { describe, expect, it } from "vitest";
import {
  getCompoundTickValue,
  COMPOUND_MULTIPLIERS,
  ActiveEffect,
  PlayerState,
} from "../shared/gameTypes";
import { CARD_MAP, ALL_CARDS } from "../shared/cardData";

// ─── Helper: Create mock player ─────────────────────────────
function mockPlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    id: "player-1",
    gamePlayerId: "gp-1",
    name: "TestPlayer",
    chosenSin: "wrath",
    currentHp: 30,
    currentEnergy: 3,
    hand: [],
    deck: [],
    discard: [],
    isAlive: true,
    hasPlayedCardThisTurn: false,
    ...overrides,
  };
}

// ─── Helper: Create mock active effect ──────────────────────
function mockEffect(overrides: Partial<ActiveEffect> = {}): ActiveEffect {
  return {
    id: "eff-1",
    targetPlayerId: "gp-1",
    sourcePlayerId: "gp-2",
    effectType: "damage",
    baseValue: 5,
    appliedAtRound: 1,
    durationRounds: 3,
    cardId: ALL_CARDS[0].id,
    ...overrides,
  };
}

// ─── Helper: Project rounds (mirrors component logic) ───────
interface RoundRow {
  round: number;
  pain: number;
  gain: number;
  painDetails: { name: string; value: number; type: string; tick?: string }[];
  gainDetails: { name: string; value: number; type: string; tick?: string }[];
}

function projectEffects(
  playerEffects: ActiveEffect[],
  currentRound: number,
  maxRound: number
): RoundRow[] {
  const roundMap = new Map<number, RoundRow>();
  const maxProjection = Math.min(currentRound + 3, maxRound);

  for (let r = currentRound; r <= maxProjection; r++) {
    roundMap.set(r, {
      round: r,
      pain: 0,
      gain: 0,
      painDetails: [],
      gainDetails: [],
    });
  }

  for (const effect of playerEffects) {
    const card = CARD_MAP[effect.cardId];
    const cardName = card?.name || "???";
    const isPain =
      effect.effectType === "damage" ||
      effect.effectType === "debuff" ||
      effect.effectType === "energy_drain";
    const isGain =
      effect.effectType === "heal" ||
      effect.effectType === "shield" ||
      effect.effectType === "buff" ||
      effect.effectType === "energy_gain";

    if (effect.isCompounding) {
      const totalTicks = COMPOUND_MULTIPLIERS.length;
      const currentTick = effect.currentTick || 0;

      for (let tick = currentTick; tick < totalTicks; tick++) {
        const tickValue = getCompoundTickValue(effect.baseValue, tick);
        const roundForTick = currentRound + (tick - currentTick);

        if (roundForTick > maxProjection) break;

        if (!roundMap.has(roundForTick)) {
          roundMap.set(roundForTick, {
            round: roundForTick,
            pain: 0,
            gain: 0,
            painDetails: [],
            gainDetails: [],
          });
        }

        const row = roundMap.get(roundForTick)!;
        const detail = {
          name: cardName,
          value: tickValue,
          type: effect.effectType,
          tick: `${tick + 1}/${totalTicks}`,
        };

        if (isPain) {
          row.pain += tickValue;
          row.painDetails.push(detail);
        } else if (isGain) {
          row.gain += tickValue;
          row.gainDetails.push(detail);
        }
      }
    } else {
      const expiresAtRound = effect.appliedAtRound + effect.durationRounds;
      for (
        let round = currentRound;
        round <= Math.min(expiresAtRound, maxProjection);
        round++
      ) {
        if (!roundMap.has(round)) {
          roundMap.set(round, {
            round,
            pain: 0,
            gain: 0,
            painDetails: [],
            gainDetails: [],
          });
        }

        const row = roundMap.get(round)!;
        const detail = {
          name: cardName,
          value: effect.baseValue,
          type: effect.effectType,
        };

        if (isPain) {
          row.pain += effect.baseValue;
          row.painDetails.push(detail);
        } else if (isGain) {
          row.gain += effect.baseValue;
          row.gainDetails.push(detail);
        }
      }
    }
  }

  return Array.from(roundMap.values())
    .filter((r) => r.pain > 0 || r.gain > 0)
    .sort((a, b) => a.round - b.round);
}

// ─── Tests ──────────────────────────────────────────────────

describe("Affliction Balance Sheet Projections", () => {
  describe("Compound Effect Projections", () => {
    it("projects 3 ticks of a compounding damage effect", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          isCompounding: true,
          currentTick: 0,
          baseValue: 4,
          effectType: "damage",
        }),
      ];

      const rows = projectEffects(effects, 1, 10);
      expect(rows.length).toBeGreaterThanOrEqual(3);

      // Tick 0: 4 * 1 = 4
      expect(rows[0].pain).toBe(4);
      // Tick 1: 4 * 1 = 4
      expect(rows[1].pain).toBe(4);
      // Tick 2: 4 * 2 = 8
      expect(rows[2].pain).toBe(8);
    });

    it("projects remaining ticks when currentTick > 0", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          isCompounding: true,
          currentTick: 1,
          baseValue: 4,
          effectType: "damage",
        }),
      ];

      const rows = projectEffects(effects, 3, 10);
      // Only 2 remaining ticks (tick 1 and tick 2)
      expect(rows.length).toBe(2);
      // Tick 1: 4 * 1 = 4
      expect(rows[0].pain).toBe(4);
      // Tick 2: 4 * 2 = 8
      expect(rows[1].pain).toBe(8);
    });

    it("projects compounding heal as gain", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          isCompounding: true,
          currentTick: 0,
          baseValue: 3,
          effectType: "heal",
        }),
      ];

      const rows = projectEffects(effects, 1, 10);
      expect(rows[0].gain).toBe(3);
      expect(rows[0].pain).toBe(0);
      expect(rows[1].gain).toBe(3);
      expect(rows[2].gain).toBe(6);
    });
  });

  describe("Flat Effect Projections", () => {
    it("projects flat damage across remaining duration", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          isCompounding: false,
          baseValue: 5,
          effectType: "damage",
          appliedAtRound: 1,
          durationRounds: 3,
        }),
      ];

      const rows = projectEffects(effects, 1, 10);
      // Should show in rounds 1, 2, 3, 4 (applied at 1, duration 3, expires at 4)
      expect(rows.length).toBeGreaterThanOrEqual(3);
      rows.forEach((row) => {
        expect(row.pain).toBe(5);
      });
    });

    it("projects flat shield as gain", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          isCompounding: false,
          baseValue: 8,
          effectType: "shield",
          appliedAtRound: 2,
          durationRounds: 2,
        }),
      ];

      const rows = projectEffects(effects, 2, 10);
      expect(rows.length).toBeGreaterThanOrEqual(2);
      rows.forEach((row) => {
        expect(row.gain).toBe(8);
        expect(row.pain).toBe(0);
      });
    });
  });

  describe("Pain/Gain Classification", () => {
    it("classifies damage as pain", () => {
      const effects = [mockEffect({ effectType: "damage", baseValue: 5 })];
      const rows = projectEffects(effects, 1, 10);
      expect(rows[0].pain).toBe(5);
      expect(rows[0].gain).toBe(0);
    });

    it("classifies debuff as pain", () => {
      const effects = [mockEffect({ effectType: "debuff", baseValue: 3 })];
      const rows = projectEffects(effects, 1, 10);
      expect(rows[0].pain).toBe(3);
    });

    it("classifies energy_drain as pain", () => {
      const effects = [mockEffect({ effectType: "energy_drain", baseValue: 2 })];
      const rows = projectEffects(effects, 1, 10);
      expect(rows[0].pain).toBe(2);
    });

    it("classifies heal as gain", () => {
      const effects = [mockEffect({ effectType: "heal", baseValue: 6 })];
      const rows = projectEffects(effects, 1, 10);
      expect(rows[0].gain).toBe(6);
    });

    it("classifies shield as gain", () => {
      const effects = [mockEffect({ effectType: "shield", baseValue: 4 })];
      const rows = projectEffects(effects, 1, 10);
      expect(rows[0].gain).toBe(4);
    });

    it("classifies buff as gain", () => {
      const effects = [mockEffect({ effectType: "buff", baseValue: 2 })];
      const rows = projectEffects(effects, 1, 10);
      expect(rows[0].gain).toBe(2);
    });

    it("classifies energy_gain as gain", () => {
      const effects = [mockEffect({ effectType: "energy_gain", baseValue: 1 })];
      const rows = projectEffects(effects, 1, 10);
      expect(rows[0].gain).toBe(1);
    });
  });

  describe("Net Calculations", () => {
    it("calculates net as gain minus pain", () => {
      const effects: ActiveEffect[] = [
        mockEffect({ effectType: "damage", baseValue: 5, appliedAtRound: 1, durationRounds: 2 }),
        mockEffect({
          id: "eff-2",
          effectType: "heal",
          baseValue: 3,
          appliedAtRound: 1,
          durationRounds: 2,
        }),
      ];

      const rows = projectEffects(effects, 1, 10);
      expect(rows[0].pain).toBe(5);
      expect(rows[0].gain).toBe(3);
      // Net = 3 - 5 = -2
      const net = rows[0].gain - rows[0].pain;
      expect(net).toBe(-2);
    });

    it("calculates total pain and gain across all rounds", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          isCompounding: true,
          currentTick: 0,
          baseValue: 4,
          effectType: "damage",
        }),
      ];

      const rows = projectEffects(effects, 1, 10);
      const totalPain = rows.reduce((sum, r) => sum + r.pain, 0);
      // 4 + 4 + 8 = 16
      expect(totalPain).toBe(16);
    });
  });

  describe("Multiple Overlapping Effects", () => {
    it("stacks multiple effects in the same round", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          id: "eff-1",
          effectType: "damage",
          baseValue: 3,
          appliedAtRound: 1,
          durationRounds: 2,
        }),
        mockEffect({
          id: "eff-2",
          effectType: "damage",
          baseValue: 4,
          appliedAtRound: 1,
          durationRounds: 2,
        }),
      ];

      const rows = projectEffects(effects, 1, 10);
      expect(rows[0].pain).toBe(7); // 3 + 4
      expect(rows[0].painDetails).toHaveLength(2);
    });

    it("handles mixed pain and gain in the same round", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          id: "eff-1",
          effectType: "damage",
          baseValue: 5,
          appliedAtRound: 1,
          durationRounds: 2,
        }),
        mockEffect({
          id: "eff-2",
          effectType: "shield",
          baseValue: 3,
          appliedAtRound: 1,
          durationRounds: 2,
        }),
      ];

      const rows = projectEffects(effects, 1, 10);
      expect(rows[0].pain).toBe(5);
      expect(rows[0].gain).toBe(3);
    });
  });

  describe("Edge Cases", () => {
    it("returns empty array when no effects", () => {
      const rows = projectEffects([], 1, 10);
      expect(rows).toHaveLength(0);
    });

    it("caps projection at maxRound", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          isCompounding: true,
          currentTick: 0,
          baseValue: 4,
          effectType: "damage",
        }),
      ];

      // If maxRound is 2, only 2 ticks should show
      const rows = projectEffects(effects, 1, 2);
      expect(rows.length).toBeLessThanOrEqual(2);
    });

    it("caps projection at currentRound + 3", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          effectType: "damage",
          baseValue: 5,
          appliedAtRound: 1,
          durationRounds: 10,
        }),
      ];

      const rows = projectEffects(effects, 1, 20);
      // Should only project 4 rounds (current + 3)
      expect(rows.length).toBeLessThanOrEqual(4);
    });

    it("handles effects that have already expired", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          effectType: "damage",
          baseValue: 5,
          appliedAtRound: 1,
          durationRounds: 1,
        }),
      ];

      // Current round is 5, effect expired at round 2
      const rows = projectEffects(effects, 5, 10);
      expect(rows).toHaveLength(0);
    });
  });

  describe("Compound Tick Value Calculations", () => {
    it("tick 0 multiplier is 1x", () => {
      expect(getCompoundTickValue(10, 0)).toBe(10);
    });

    it("tick 1 multiplier is 1x", () => {
      expect(getCompoundTickValue(10, 1)).toBe(10);
    });

    it("tick 2 multiplier is 2x", () => {
      expect(getCompoundTickValue(10, 2)).toBe(20);
    });

    it("total compound value is 4x base", () => {
      const base = 5;
      const total =
        getCompoundTickValue(base, 0) +
        getCompoundTickValue(base, 1) +
        getCompoundTickValue(base, 2);
      expect(total).toBe(base * 4);
    });
  });
});
