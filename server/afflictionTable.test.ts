/**
 * Affliction Table Tests — v4 Compound-Only Matrix Format
 *
 * Tests for the detailed balance sheet projection logic used by
 * PlayerAfflictionTable component. Validates per-effect-type columns,
 * compound tick projections with patterns, and total calculations.
 *
 * v4: All effects are compound. Uses compoundPattern instead of isCompounding.
 */

import { describe, expect, it } from "vitest";
import {
  getCompoundTickValue,
  ActiveEffect,
  PlayerState,
  EffectType,
  CompoundPattern,
} from "../shared/gameTypes";
import { ALL_CARDS, CARD_MAP } from "../shared/cardData";

// ─── v4 Effect Types ───────────────────────────────────────────
const V4_EFFECT_TYPES: EffectType[] = [
  "damage", "self_damage", "heal_gain", "heal_steal", "heal_block",
  "shield_gain", "shield_steal", "shield_block", "energy_gain",
  "energy_steal", "energy_block", "affliction_amplify", "affliction_transfer",
];

// ─── Helper: Create mock active effect (v4) ────────────────────
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
    currentTick: 0,
    compoundPattern: "standard",
    ...overrides,
  };
}

// ─── Projection logic (mirrors v4 component) ───────────────────
interface RoundRow {
  round: number;
  values: Partial<Record<EffectType, number>>;
  details: Partial<Record<EffectType, { name: string; value: number; tick?: string }[]>>;
}

function makeRow(round: number): RoundRow {
  return {
    round,
    values: {},
    details: {},
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
    const pattern = effect.compoundPattern || "standard";
    const currentTick = effect.currentTick || 0;
    const totalTicks = effect.durationRounds;

    for (let tick = currentTick; tick < totalTicks; tick++) {
      const tickValue = getCompoundTickValue(effect.baseValue, pattern, tick);
      const roundForTick = currentRound + (tick - currentTick);
      if (roundForTick > maxProjection) break;

      if (!roundMap.has(roundForTick)) {
        roundMap.set(roundForTick, makeRow(roundForTick));
      }

      const row = roundMap.get(roundForTick)!;
      row.values[et] = (row.values[et] || 0) + tickValue;
      if (!row.details[et]) row.details[et] = [];
      row.details[et]!.push({
        name: cardName,
        value: tickValue,
        tick: `${tick + 1}/${totalTicks}`,
      });
      activeTypes.add(et);
    }
  }

  const rows = Array.from(roundMap.values())
    .filter((r) => Object.values(r.values).some((v) => v > 0))
    .sort((a, b) => a.round - b.round);

  return { rows, activeTypes };
}

// ─── Tests ──────────────────────────────────────────────────

describe("Affliction Matrix — v4 Compound-Only", () => {
  describe("Compound Effect Projections (Standard Pattern)", () => {
    it("projects standard compound damage (Fibonacci scaling)", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          compoundPattern: "standard",
          currentTick: 0,
          baseValue: 4,
          durationRounds: 3,
          effectType: "damage",
        }),
      ];

      const { rows, activeTypes } = projectEffectsMatrix(effects, 1, 10);
      expect(activeTypes.has("damage")).toBe(true);
      expect(activeTypes.size).toBe(1);
      expect(rows.length).toBeGreaterThanOrEqual(3);

      // Standard Fibonacci: tick 0 = 4*1, tick 1 = 4*1, tick 2 = 4*2
      expect(rows[0].values.damage).toBe(4);
      expect(rows[1].values.damage).toBe(4);
      expect(rows[2].values.damage).toBe(8);
    });

    it("projects remaining ticks when currentTick > 0", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          compoundPattern: "standard",
          currentTick: 1,
          baseValue: 4,
          durationRounds: 3,
          effectType: "damage",
        }),
      ];

      const { rows } = projectEffectsMatrix(effects, 3, 10);
      expect(rows.length).toBe(2);
      expect(rows[0].values.damage).toBe(4);  // tick 1: 4*1
      expect(rows[1].values.damage).toBe(8);  // tick 2: 4*2
    });

    it("projects compound heal_gain into the correct column", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          compoundPattern: "standard",
          currentTick: 0,
          baseValue: 3,
          durationRounds: 3,
          effectType: "heal_gain",
        }),
      ];

      const { rows, activeTypes } = projectEffectsMatrix(effects, 1, 10);
      expect(activeTypes.has("heal_gain")).toBe(true);
      expect(activeTypes.has("damage")).toBe(false);
      expect(rows[0].values.heal_gain).toBe(3);
      expect(rows[1].values.heal_gain).toBe(3);
      expect(rows[2].values.heal_gain).toBe(6);
    });

    it("projects compound shield_gain into the correct column", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          compoundPattern: "standard",
          currentTick: 0,
          baseValue: 2,
          durationRounds: 3,
          effectType: "shield_gain",
        }),
      ];

      const { rows, activeTypes } = projectEffectsMatrix(effects, 1, 10);
      expect(activeTypes.has("shield_gain")).toBe(true);
      expect(rows[0].values.shield_gain).toBe(2);
      expect(rows[2].values.shield_gain).toBe(4);
    });
  });

  describe("Aggressive Pattern Projections", () => {
    it("projects aggressive compound damage (powers of 2)", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          compoundPattern: "aggressive",
          currentTick: 0,
          baseValue: 3,
          durationRounds: 3,
          effectType: "damage",
        }),
      ];

      const { rows } = projectEffectsMatrix(effects, 1, 10);
      // Aggressive: tick 0 = 3*1, tick 1 = 3*2, tick 2 = 3*4
      expect(rows[0].values.damage).toBe(3);
      expect(rows[1].values.damage).toBe(6);
      expect(rows[2].values.damage).toBe(12);
    });
  });

  describe("Slowburn Pattern Projections", () => {
    it("projects slowburn compound damage (flat then ramp)", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          compoundPattern: "slowburn",
          currentTick: 0,
          baseValue: 4,
          durationRounds: 3,
          effectType: "damage",
        }),
      ];

      const { rows } = projectEffectsMatrix(effects, 1, 10);
      // Slowburn starts flat
      expect(rows[0].values.damage).toBe(rows[1].values.damage);
    });
  });

  describe("Multiple Effect Types in Same Round", () => {
    it("shows damage and heal_gain in separate columns for the same round", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          id: "eff-1",
          effectType: "damage",
          baseValue: 5,
          durationRounds: 2,
        }),
        mockEffect({
          id: "eff-2",
          effectType: "heal_gain",
          baseValue: 3,
          durationRounds: 2,
        }),
      ];

      const { rows, activeTypes } = projectEffectsMatrix(effects, 1, 10);
      expect(activeTypes.has("damage")).toBe(true);
      expect(activeTypes.has("heal_gain")).toBe(true);
      expect(rows[0].values.damage).toBe(5);
      expect(rows[0].values.heal_gain).toBe(3);
    });

    it("stacks multiple effects of the same type in one column", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          id: "eff-1",
          effectType: "damage",
          baseValue: 3,
          durationRounds: 2,
        }),
        mockEffect({
          id: "eff-2",
          effectType: "damage",
          baseValue: 4,
          durationRounds: 2,
        }),
      ];

      const { rows } = projectEffectsMatrix(effects, 1, 10);
      expect(rows[0].values.damage).toBe(7); // 3 + 4
      expect(rows[0].details.damage).toHaveLength(2);
    });
  });

  describe("Total Calculations", () => {
    it("calculates total damage across all rounds (standard pattern)", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          compoundPattern: "standard",
          currentTick: 0,
          baseValue: 4,
          durationRounds: 3,
          effectType: "damage",
        }),
      ];

      const { rows } = projectEffectsMatrix(effects, 1, 10);
      const totalDmg = rows.reduce((sum, r) => sum + (r.values.damage || 0), 0);
      // Standard Fibonacci: 4 + 4 + 8 = 16
      expect(totalDmg).toBe(16);
    });

    it("calculates totals per column independently", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          id: "e1",
          effectType: "damage",
          baseValue: 5,
          durationRounds: 2,
        }),
        mockEffect({
          id: "e2",
          effectType: "heal_gain",
          baseValue: 3,
          durationRounds: 2,
        }),
      ];

      const { rows } = projectEffectsMatrix(effects, 1, 10);
      const totalDmg = rows.reduce((sum, r) => sum + (r.values.damage || 0), 0);
      const totalHeal = rows.reduce((sum, r) => sum + (r.values.heal_gain || 0), 0);
      // Standard: tick 0 = 5*1, tick 1 = 5*1 → total = 10
      expect(totalDmg).toBe(10);
      // Standard: tick 0 = 3*1, tick 1 = 3*1 → total = 6
      expect(totalHeal).toBe(6);
    });
  });

  describe("Detail Breakdown", () => {
    it("tracks card names in details per effect type", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          effectType: "damage",
          baseValue: 5,
          durationRounds: 2,
        }),
      ];

      const { rows } = projectEffectsMatrix(effects, 1, 10);
      expect(rows[0].details.damage!.length).toBeGreaterThan(0);
      expect(rows[0].details.damage![0].value).toBe(5);
    });

    it("includes tick info for compound effects", () => {
      const effects: ActiveEffect[] = [
        mockEffect({
          compoundPattern: "standard",
          currentTick: 0,
          baseValue: 4,
          durationRounds: 3,
          effectType: "damage",
        }),
      ];

      const { rows } = projectEffectsMatrix(effects, 1, 10);
      expect(rows[0].details.damage![0].tick).toBe("1/3");
      expect(rows[1].details.damage![0].tick).toBe("2/3");
      expect(rows[2].details.damage![0].tick).toBe("3/3");
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
          compoundPattern: "standard",
          currentTick: 0,
          baseValue: 4,
          durationRounds: 5,
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
          durationRounds: 10,
        }),
      ];

      const { rows } = projectEffectsMatrix(effects, 1, 20);
      expect(rows.length).toBeLessThanOrEqual(4);
    });
  });

  describe("Compound Tick Value Calculations (v4)", () => {
    it("standard tick 0 = base x 1", () => {
      expect(getCompoundTickValue(10, "standard", 0)).toBe(10);
    });

    it("standard tick 1 = base x 1", () => {
      expect(getCompoundTickValue(10, "standard", 1)).toBe(10);
    });

    it("standard tick 2 = base x 2", () => {
      expect(getCompoundTickValue(10, "standard", 2)).toBe(20);
    });

    it("standard total over 3 ticks = base x 4", () => {
      const base = 5;
      const total =
        getCompoundTickValue(base, "standard", 0) +
        getCompoundTickValue(base, "standard", 1) +
        getCompoundTickValue(base, "standard", 2);
      expect(total).toBe(base * 4);
    });

    it("aggressive tick values scale as powers of 2", () => {
      expect(getCompoundTickValue(10, "aggressive", 0)).toBe(10);
      expect(getCompoundTickValue(10, "aggressive", 1)).toBe(20);
      expect(getCompoundTickValue(10, "aggressive", 2)).toBe(40);
    });
  });
});
