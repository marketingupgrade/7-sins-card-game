/**
 * Affliction Table Tests — Matrix Format
 *
 * Tests for the detailed balance sheet projection logic used by
 * PlayerAfflictionTable component. Validates per-effect-type columns
 * (DMG, Heal, Shield, Buff, Debuff, E.Drain, E.Gain), compound tick
 * projections, and total calculations.
 */

import { describe, expect, it } from "vitest";
import {
  getCompoundTickValue,
  COMPOUND_MULTIPLIERS,
  ActiveEffect,
  PlayerState,
  EffectType,
} from "../shared/gameTypes";
import { ALL_CARDS, CARD_MAP } from "../shared/cardData";

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

// ─── Projection logic (mirrors component) ───────────────────
interface RoundRow {
  round: number;
  values: Record<EffectType, number>;
  details: Record<EffectType, { name: string; value: number; tick?: string }[]>;
}

function makeRow(round: number): RoundRow {
  return {
    round,
    values: {
      damage: 0, heal: 0, shield: 0, buff: 0,
      debuff: 0, energy_drain: 0, energy_gain: 0,
    },
    details: {
      damage: [], heal: [], shield: [], buff: [],
      debuff: [], energy_drain: [], energy_gain: [],
    },
  };
}

function projectEffectsMatrix(
  playerEffects: ActiveEffect[],
  currentRound: number,
  maxRound: number
): { rows: RoundRow[]; activeTypes: Set<EffectType> } {
  const roundMap = new Map<number, RoundRow>();
  const activeTypes = new Set<EffectType>();
  const maxProjection = Math.min(currentRound + 3, maxRound);

  for (let r = currentRound; r <= maxProjection; r++) {
    roundMap.set(r, makeRow(r));
  }

  for (const effect of playerEffects) {
    const card = CARD_MAP[effect.cardId];
    const cardName = card?.name || "???";
    const et = effect.effectType;

    if (effect.isCompounding) {
      const totalTicks = COMPOUND_MULTIPLIERS.length;
      const currentTick = effect.currentTick || 0;

      for (let tick = currentTick; tick < totalTicks; tick++) {
        const tickValue = getCompoundTickValue(effect.baseValue, tick);
        const roundForTick = currentRound + (tick - currentTick);
        if (roundForTick > maxProjection) break;

        if (!roundMap.has(roundForTick)) {
          roundMap.set(roundForTick, makeRow(roundForTick));
        }

        const row = roundMap.get(roundForTick)!;
        row.values[et] += tickValue;
        row.details[et].push({
          name: cardName,
          value: tickValue,
          tick: `${tick + 1}/${totalTicks}`,
        });
        activeTypes.add(et);
      }
    } else {
      const expiresAtRound = effect.appliedAtRound + effect.durationRounds;
      for (
        let round = currentRound;
        round <= Math.min(expiresAtRound, maxProjection);
        round++
      ) {
        if (!roundMap.has(round)) {
          roundMap.set(round, makeRow(round));
        }

        const row = roundMap.get(round)!;
        row.values[et] += effect.baseValue;
        row.details[et].push({ name: cardName, value: effect.baseValue });
        activeTypes.add(et);
      }
    }
  }

  const rows = Array.from(roundMap.values())
    .filter((r) => Object.values(r.values).some((v) => v > 0))
    .sort((a, b) => a.round - b.round);

  return { rows, activeTypes };
}

// ─── Tests ──────────────────────────────────────────────────

describe("Affliction Matrix — Per-Effect-Type Columns", () => {
  describe("Compound Effect Projections", () => {
    it("projects 3 ticks of compounding damage into the damage column", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          isCompounding: true,
          currentTick: 0,
          baseValue: 4,
          effectType: "damage",
        }),
      ];

      const { rows, activeTypes } = projectEffectsMatrix(effects, 1, 10);
      expect(activeTypes.has("damage")).toBe(true);
      expect(activeTypes.size).toBe(1);
      expect(rows.length).toBeGreaterThanOrEqual(3);

      // Tick 0: 4 * 1 = 4
      expect(rows[0].values.damage).toBe(4);
      expect(rows[0].values.heal).toBe(0);
      // Tick 1: 4 * 1 = 4
      expect(rows[1].values.damage).toBe(4);
      // Tick 2: 4 * 2 = 8
      expect(rows[2].values.damage).toBe(8);
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

      const { rows } = projectEffectsMatrix(effects, 3, 10);
      expect(rows.length).toBe(2);
      expect(rows[0].values.damage).toBe(4);
      expect(rows[1].values.damage).toBe(8);
    });

    it("projects compounding heal into the heal column only", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          isCompounding: true,
          currentTick: 0,
          baseValue: 3,
          effectType: "heal",
        }),
      ];

      const { rows, activeTypes } = projectEffectsMatrix(effects, 1, 10);
      expect(activeTypes.has("heal")).toBe(true);
      expect(activeTypes.has("damage")).toBe(false);
      expect(rows[0].values.heal).toBe(3);
      expect(rows[0].values.damage).toBe(0);
      expect(rows[1].values.heal).toBe(3);
      expect(rows[2].values.heal).toBe(6);
    });

    it("projects compounding shield into the shield column", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          isCompounding: true,
          currentTick: 0,
          baseValue: 2,
          effectType: "shield",
        }),
      ];

      const { rows, activeTypes } = projectEffectsMatrix(effects, 1, 10);
      expect(activeTypes.has("shield")).toBe(true);
      expect(rows[0].values.shield).toBe(2);
      expect(rows[2].values.shield).toBe(4);
    });
  });

  describe("Flat Effect Projections", () => {
    it("projects flat damage across remaining duration into damage column", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          isCompounding: false,
          baseValue: 5,
          effectType: "damage",
          appliedAtRound: 1,
          durationRounds: 3,
        }),
      ];

      const { rows } = projectEffectsMatrix(effects, 1, 10);
      expect(rows.length).toBeGreaterThanOrEqual(3);
      rows.forEach((row) => {
        expect(row.values.damage).toBe(5);
        expect(row.values.heal).toBe(0);
        expect(row.values.shield).toBe(0);
      });
    });

    it("projects flat shield into the shield column only", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          isCompounding: false,
          baseValue: 8,
          effectType: "shield",
          appliedAtRound: 2,
          durationRounds: 2,
        }),
      ];

      const { rows, activeTypes } = projectEffectsMatrix(effects, 2, 10);
      expect(activeTypes.has("shield")).toBe(true);
      expect(activeTypes.has("damage")).toBe(false);
      rows.forEach((row) => {
        expect(row.values.shield).toBe(8);
        expect(row.values.damage).toBe(0);
      });
    });
  });

  describe("All 7 Effect Types Map to Correct Columns", () => {
    const effectTypes: EffectType[] = [
      "damage", "heal", "shield", "buff", "debuff", "energy_drain", "energy_gain",
    ];

    effectTypes.forEach((et) => {
      it(`${et} maps to its own column`, () => {
        const effects = [mockEffect({ effectType: et, baseValue: 5 })];
        const { rows, activeTypes } = projectEffectsMatrix(effects, 1, 10);
        expect(activeTypes.has(et)).toBe(true);
        expect(activeTypes.size).toBe(1);
        expect(rows[0].values[et]).toBe(5);

        // All other columns should be 0
        for (const other of effectTypes) {
          if (other !== et) {
            expect(rows[0].values[other]).toBe(0);
          }
        }
      });
    });
  });

  describe("Multiple Effect Types in Same Round", () => {
    it("shows damage and heal in separate columns for the same round", () => {
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
          effectType: "heal",
          baseValue: 3,
          appliedAtRound: 1,
          durationRounds: 2,
        }),
      ];

      const { rows, activeTypes } = projectEffectsMatrix(effects, 1, 10);
      expect(activeTypes.has("damage")).toBe(true);
      expect(activeTypes.has("heal")).toBe(true);
      expect(rows[0].values.damage).toBe(5);
      expect(rows[0].values.heal).toBe(3);
    });

    it("stacks multiple effects of the same type in one column", () => {
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

      const { rows } = projectEffectsMatrix(effects, 1, 10);
      expect(rows[0].values.damage).toBe(7); // 3 + 4
      expect(rows[0].details.damage).toHaveLength(2);
    });

    it("handles all 7 effect types simultaneously", () => {
      const effects: ActiveEffect[] = [
        mockEffect({ id: "e1", effectType: "damage", baseValue: 1 }),
        mockEffect({ id: "e2", effectType: "heal", baseValue: 2 }),
        mockEffect({ id: "e3", effectType: "shield", baseValue: 3 }),
        mockEffect({ id: "e4", effectType: "buff", baseValue: 4 }),
        mockEffect({ id: "e5", effectType: "debuff", baseValue: 5 }),
        mockEffect({ id: "e6", effectType: "energy_drain", baseValue: 6 }),
        mockEffect({ id: "e7", effectType: "energy_gain", baseValue: 7 }),
      ];

      const { rows, activeTypes } = projectEffectsMatrix(effects, 1, 10);
      expect(activeTypes.size).toBe(7);
      expect(rows[0].values.damage).toBe(1);
      expect(rows[0].values.heal).toBe(2);
      expect(rows[0].values.shield).toBe(3);
      expect(rows[0].values.buff).toBe(4);
      expect(rows[0].values.debuff).toBe(5);
      expect(rows[0].values.energy_drain).toBe(6);
      expect(rows[0].values.energy_gain).toBe(7);
    });
  });

  describe("Total Calculations", () => {
    it("calculates total damage across all rounds", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          isCompounding: true,
          currentTick: 0,
          baseValue: 4,
          effectType: "damage",
        }),
      ];

      const { rows } = projectEffectsMatrix(effects, 1, 10);
      const totalDmg = rows.reduce((sum, r) => sum + r.values.damage, 0);
      // 4 + 4 + 8 = 16
      expect(totalDmg).toBe(16);
    });

    it("calculates totals per column independently", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          id: "e1",
          effectType: "damage",
          baseValue: 5,
          appliedAtRound: 1,
          durationRounds: 2,
        }),
        mockEffect({
          id: "e2",
          effectType: "heal",
          baseValue: 3,
          appliedAtRound: 1,
          durationRounds: 2,
        }),
      ];

      const { rows } = projectEffectsMatrix(effects, 1, 10);
      const totalDmg = rows.reduce((sum, r) => sum + r.values.damage, 0);
      const totalHeal = rows.reduce((sum, r) => sum + r.values.heal, 0);
      // 3 rounds of 5 damage = 15
      expect(totalDmg).toBe(15);
      // 3 rounds of 3 heal = 9
      expect(totalHeal).toBe(9);
    });
  });

  describe("Detail Breakdown", () => {
    it("tracks card names in details per effect type", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          effectType: "damage",
          baseValue: 5,
          appliedAtRound: 1,
          durationRounds: 2,
        }),
      ];

      const { rows } = projectEffectsMatrix(effects, 1, 10);
      expect(rows[0].details.damage.length).toBeGreaterThan(0);
      expect(rows[0].details.damage[0].value).toBe(5);
      expect(rows[0].details.heal).toHaveLength(0);
    });

    it("includes tick info for compounding effects", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          isCompounding: true,
          currentTick: 0,
          baseValue: 4,
          effectType: "damage",
        }),
      ];

      const { rows } = projectEffectsMatrix(effects, 1, 10);
      expect(rows[0].details.damage[0].tick).toBe("1/3");
      expect(rows[1].details.damage[0].tick).toBe("2/3");
      expect(rows[2].details.damage[0].tick).toBe("3/3");
    });
  });

  describe("Edge Cases", () => {
    it("returns empty rows and no active types when no effects", () => {
      const { rows, activeTypes } = projectEffectsMatrix([], 1, 10);
      expect(rows).toHaveLength(0);
      expect(activeTypes.size).toBe(0);
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

      const { rows } = projectEffectsMatrix(effects, 1, 2);
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

      const { rows } = projectEffectsMatrix(effects, 1, 20);
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

      const { rows } = projectEffectsMatrix(effects, 5, 10);
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
