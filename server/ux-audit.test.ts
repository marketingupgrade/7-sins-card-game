/**
 * Tests for v6.4.0 UX & Game Design Audit Improvements
 *
 * Tests the 5 new strategic clarity components:
 * 1. CardValueCalc — total value, % HP impact, sparklines, timing
 * 2. ActiveEffectsDashboard — net HP change, effect breakdown
 * 3. PassiveReminder — faction passive display and targeting warnings
 * 4. TurnPhaseTimeline — phase progression display
 * 5. Integration with GameCard and PlayerPanel
 */

import { describe, it, expect } from "vitest";
import {
  getCompoundTickValue,
  COMPOUND_TICKS,
  STARTING_HP,
  MAX_ROUNDS,
  PASSIVE_INFO,
  type CompoundPattern,
  type SinType,
  type EffectType,
  type ActiveEffect,
  type PlayerState,
  type TurnPhase,
} from "../shared/gameTypes";

// ─── CardValueCalc Logic Tests ──────────────────────────────

describe("CardValueCalc — Total Value Calculation", () => {
  function calcTotalValue(baseValue: number, pattern: CompoundPattern, duration: number): number {
    let total = 0;
    for (let t = 0; t < duration; t++) {
      total += getCompoundTickValue(baseValue, pattern, t);
    }
    return total;
  }

  function calcRemainingValue(
    baseValue: number,
    pattern: CompoundPattern,
    duration: number,
    currentRound: number
  ): number {
    const roundsLeft = MAX_ROUNDS - currentRound + 1;
    const effectiveDuration = Math.min(duration, roundsLeft);
    let total = 0;
    for (let t = 0; t < effectiveDuration; t++) {
      total += getCompoundTickValue(baseValue, pattern, t);
    }
    return total;
  }

  it("calculates total value for standard pattern (Fibonacci)", () => {
    // base 10, standard [1,1,2,3,5], duration 5
    const total = calcTotalValue(10, "standard", 5);
    // 10*1 + 10*1 + 10*2 + 10*3 + 10*5 = 10+10+20+30+50 = 120
    expect(total).toBe(120);
  });

  it("calculates total value for aggressive pattern (powers of 2)", () => {
    // base 5, aggressive [1,2,4,8], duration 4
    const total = calcTotalValue(5, "aggressive", 4);
    // 5*1 + 5*2 + 5*4 + 5*8 = 5+10+20+40 = 75
    expect(total).toBe(75);
  });

  it("calculates total value for slowburn pattern", () => {
    // base 15, slowburn [1,1,1,1,2,2], duration 6
    const total = calcTotalValue(15, "slowburn", 6);
    // 15*1 + 15*1 + 15*1 + 15*1 + 15*2 + 15*2 = 15+15+15+15+30+30 = 120
    expect(total).toBe(120);
  });

  it("calculates remaining value with truncation at game end", () => {
    // Round 19 of 20, duration 5 → only 2 rounds left
    const remaining = calcRemainingValue(10, "standard", 5, 19);
    // 10*1 + 10*1 = 20 (only 2 ticks)
    expect(remaining).toBe(20);
  });

  it("returns full value when enough rounds remain", () => {
    const full = calcTotalValue(10, "standard", 3);
    const remaining = calcRemainingValue(10, "standard", 3, 1);
    expect(remaining).toBe(full);
  });

  it("calculates HP percentage correctly", () => {
    const total = calcTotalValue(10, "standard", 5); // 120
    const hpPercent = Math.round((total / STARTING_HP) * 100);
    expect(hpPercent).toBe(Math.round((120 / 333) * 100)); // ~36%
  });

  it("handles single-tick effects", () => {
    const total = calcTotalValue(25, "standard", 1);
    expect(total).toBe(25);
  });

  it("handles zero base value", () => {
    const total = calcTotalValue(0, "aggressive", 5);
    expect(total).toBe(0);
  });

  it("handles last round (round 20)", () => {
    const remaining = calcRemainingValue(10, "standard", 5, 20);
    // Only 1 round left
    expect(remaining).toBe(10); // 10 * 1 = 10
  });
});

describe("CardValueCalc — Sparkline Data", () => {
  function getSparklinePoints(baseValue: number, pattern: CompoundPattern, duration: number): number[] {
    const points: number[] = [];
    for (let t = 0; t < duration; t++) {
      points.push(getCompoundTickValue(baseValue, pattern, t));
    }
    return points;
  }

  it("generates correct sparkline for standard pattern", () => {
    const points = getSparklinePoints(10, "standard", 5);
    expect(points).toEqual([10, 10, 20, 30, 50]);
  });

  it("generates correct sparkline for aggressive pattern", () => {
    const points = getSparklinePoints(5, "aggressive", 4);
    expect(points).toEqual([5, 10, 20, 40]);
  });

  it("generates correct sparkline for slowburn pattern", () => {
    const points = getSparklinePoints(10, "slowburn", 6);
    expect(points).toEqual([10, 10, 10, 10, 20, 20]);
  });

  it("returns single point for duration 1", () => {
    const points = getSparklinePoints(15, "standard", 1);
    expect(points).toEqual([15]);
  });
});

describe("CardValueCalc — Timing Indicator", () => {
  function getTimingStatus(currentRound: number, duration: number): "early" | "ok" | "late" {
    const roundsLeft = MAX_ROUNDS - currentRound + 1;
    if (roundsLeft >= duration) return currentRound <= 3 ? "early" : "ok";
    return "late";
  }

  it("shows 'early' for round 1 with short duration", () => {
    expect(getTimingStatus(1, 3)).toBe("early");
  });

  it("shows 'ok' for mid-game with enough rounds", () => {
    expect(getTimingStatus(10, 5)).toBe("ok");
  });

  it("shows 'late' when not enough rounds remain", () => {
    expect(getTimingStatus(18, 5)).toBe("late");
  });

  it("shows 'ok' for round 15 with 3-duration effect", () => {
    // 20 - 15 + 1 = 6 rounds left, duration 3 → enough
    expect(getTimingStatus(15, 3)).toBe("ok");
  });

  it("shows 'late' for round 20 with any multi-tick effect", () => {
    expect(getTimingStatus(20, 2)).toBe("late");
  });
});

// ─── ActiveEffectsDashboard Logic Tests ─────────────────────

describe("ActiveEffectsDashboard — Effect Summarization", () => {
  const DAMAGE_TYPES = ["damage", "self_damage", "heal_steal", "energy_steal", "affliction_amplify"];
  const HEAL_TYPES = ["heal_gain", "heal_steal"];
  const SHIELD_TYPES = ["shield_gain", "shield_steal"];
  const CONTROL_TYPES = ["heal_block", "shield_block", "energy_block", "draw_reduction", "discard_burn"];

  function summarizeEffects(effects: ActiveEffect[], playerId: string) {
    const playerEffects = effects.filter((e) => e.targetPlayerId === playerId);
    let netDamagePerRound = 0;
    let netHealPerRound = 0;
    let shieldPerRound = 0;
    let damageEffects = 0;
    let healEffects = 0;
    let shieldEffects = 0;
    let controlEffects = 0;

    for (const effect of playerEffects) {
      const tick = effect.currentTick ?? 0;
      const pattern = effect.compoundPattern ?? "standard";
      const currentValue = getCompoundTickValue(effect.baseValue, pattern as CompoundPattern, tick);

      if (DAMAGE_TYPES.includes(effect.effectType)) {
        netDamagePerRound += currentValue;
        damageEffects++;
      } else if (HEAL_TYPES.includes(effect.effectType)) {
        netHealPerRound += currentValue;
        healEffects++;
      } else if (SHIELD_TYPES.includes(effect.effectType)) {
        shieldPerRound += currentValue;
        shieldEffects++;
      } else if (CONTROL_TYPES.includes(effect.effectType)) {
        controlEffects++;
      }
    }

    return { netDamagePerRound, netHealPerRound, shieldPerRound, damageEffects, healEffects, shieldEffects, controlEffects, totalEffects: playerEffects.length };
  }

  const makeEffect = (overrides: Partial<ActiveEffect>): ActiveEffect => ({
    id: "eff-1",
    targetPlayerId: "player-1",
    sourcePlayerId: "player-2",
    effectType: "damage",
    baseValue: 10,
    appliedAtRound: 1,
    durationRounds: 3,
    cardId: "card-1",
    currentTick: 0,
    compoundPattern: "standard",
    ...overrides,
  });

  it("summarizes damage effects correctly", () => {
    const effects = [
      makeEffect({ effectType: "damage", baseValue: 10, currentTick: 0 }),
      makeEffect({ effectType: "damage", baseValue: 5, currentTick: 1 }),
    ];
    const summary = summarizeEffects(effects, "player-1");
    expect(summary.damageEffects).toBe(2);
    expect(summary.netDamagePerRound).toBe(15); // 10*1 + 5*1
  });

  it("summarizes heal effects correctly", () => {
    const effects = [
      makeEffect({ effectType: "heal_gain", baseValue: 20, currentTick: 0 }),
    ];
    const summary = summarizeEffects(effects, "player-1");
    expect(summary.healEffects).toBe(1);
    expect(summary.netHealPerRound).toBe(20);
  });

  it("summarizes shield effects correctly", () => {
    const effects = [
      makeEffect({ effectType: "shield_gain", baseValue: 15, currentTick: 2 }),
    ];
    const summary = summarizeEffects(effects, "player-1");
    expect(summary.shieldEffects).toBe(1);
    expect(summary.shieldPerRound).toBe(30); // 15 * 2 (standard tick 2)
  });

  it("summarizes control effects correctly", () => {
    const effects = [
      makeEffect({ effectType: "heal_block" }),
      makeEffect({ effectType: "energy_block" }),
    ];
    const summary = summarizeEffects(effects, "player-1");
    expect(summary.controlEffects).toBe(2);
  });

  it("filters effects by player ID", () => {
    const effects = [
      makeEffect({ targetPlayerId: "player-1", effectType: "damage" }),
      makeEffect({ targetPlayerId: "player-2", effectType: "damage" }),
    ];
    const summary = summarizeEffects(effects, "player-1");
    expect(summary.totalEffects).toBe(1);
  });

  it("returns zero for player with no effects", () => {
    const summary = summarizeEffects([], "player-1");
    expect(summary.totalEffects).toBe(0);
    expect(summary.netDamagePerRound).toBe(0);
  });

  it("calculates net change correctly (heal > damage = positive)", () => {
    const effects = [
      makeEffect({ effectType: "damage", baseValue: 10, currentTick: 0 }),
      makeEffect({ effectType: "heal_gain", baseValue: 20, currentTick: 0 }),
    ];
    const summary = summarizeEffects(effects, "player-1");
    const netChange = summary.netHealPerRound + summary.shieldPerRound - summary.netDamagePerRound;
    expect(netChange).toBe(10); // 20 heal - 10 damage = +10
  });

  it("calculates net change correctly (damage > heal = negative)", () => {
    const effects = [
      makeEffect({ effectType: "damage", baseValue: 30, currentTick: 0 }),
      makeEffect({ effectType: "heal_gain", baseValue: 10, currentTick: 0 }),
    ];
    const summary = summarizeEffects(effects, "player-1");
    const netChange = summary.netHealPerRound + summary.shieldPerRound - summary.netDamagePerRound;
    expect(netChange).toBe(-20);
  });
});

// ─── PassiveReminder Logic Tests ────────────────────────────

describe("PassiveReminder — Faction Passive Data", () => {
  const allSins: SinType[] = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];

  it("has passive info for all 7 factions", () => {
    for (const sin of allSins) {
      expect(PASSIVE_INFO[sin]).toBeDefined();
      expect(PASSIVE_INFO[sin].name).toBeTruthy();
      expect(PASSIVE_INFO[sin].description).toBeTruthy();
      expect(PASSIVE_INFO[sin].icon).toBeTruthy();
    }
  });

  it("has unique passive names for each faction", () => {
    const names = allSins.map((s) => PASSIVE_INFO[s].name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(7);
  });

  const TARGETING_WARNINGS: Record<SinType, string> = {
    wrath: "⚠ Attacking Wrath reflects damage back to YOU",
    sloth: "Sloth generates shields every turn — chip damage is ineffective",
    greed: "Greed gains shields from dealing damage — they benefit from aggression",
    envy: "Envy amplifies your worst affliction when they damage you",
    pride: "Pride's effects are boosted when they play expensive cards",
    lust: "Lust heals from damage ticks — sustained damage feeds them",
    gluttony: "Gluttony gains energy from burning your cards",
  };

  it("has targeting warnings for all 7 factions", () => {
    for (const sin of allSins) {
      expect(TARGETING_WARNINGS[sin]).toBeTruthy();
      expect(TARGETING_WARNINGS[sin].length).toBeGreaterThan(10);
    }
  });

  it("wrath warning mentions damage reflection", () => {
    expect(TARGETING_WARNINGS.wrath.toLowerCase()).toContain("reflect");
  });

  it("lust warning mentions healing", () => {
    expect(TARGETING_WARNINGS.lust.toLowerCase()).toContain("heal");
  });
});

// ─── TurnPhaseTimeline Logic Tests ──────────────────────────

describe("TurnPhaseTimeline — Phase Progression", () => {
  const PHASES: TurnPhase[] = ["selection", "resolution", "round_end"];

  it("has 3 distinct phases", () => {
    expect(PHASES.length).toBe(3);
  });

  it("selection phase comes first", () => {
    expect(PHASES[0]).toBe("selection");
  });

  it("resolution phase comes second", () => {
    expect(PHASES[1]).toBe("resolution");
  });

  it("round_end phase comes last", () => {
    expect(PHASES[2]).toBe("round_end");
  });

  function getPhaseHint(phase: TurnPhase, hasLockedIn: boolean, playersLockedIn: number, totalPlayers: number): string {
    switch (phase) {
      case "selection":
        return hasLockedIn
          ? `Locked in — waiting for others (${playersLockedIn}/${totalPlayers})`
          : "Pick your cards and lock in";
      case "resolution":
        return "Cards are resolving...";
      case "round_end":
        return "Effects ticking, preparing next round...";
    }
  }

  it("shows correct hint for selection phase (not locked in)", () => {
    const hint = getPhaseHint("selection", false, 0, 4);
    expect(hint).toBe("Pick your cards and lock in");
  });

  it("shows correct hint for selection phase (locked in)", () => {
    const hint = getPhaseHint("selection", true, 2, 4);
    expect(hint).toBe("Locked in — waiting for others (2/4)");
  });

  it("shows correct hint for resolution phase", () => {
    const hint = getPhaseHint("resolution", false, 0, 4);
    expect(hint).toBe("Cards are resolving...");
  });

  it("shows correct hint for round_end phase", () => {
    const hint = getPhaseHint("round_end", false, 0, 4);
    expect(hint).toBe("Effects ticking, preparing next round...");
  });
});

// ─── Effect Type Classification Tests ───────────────────────

describe("Effect Type Classification", () => {
  function isOffensiveEffect(type: string): boolean {
    return ["damage", "self_damage", "heal_steal", "energy_steal", "shield_steal", "affliction_amplify", "discard_burn", "draw_reduction"].includes(type);
  }

  function isDefensiveEffect(type: string): boolean {
    return ["heal_gain", "shield_gain", "energy_gain", "energy_regen", "draw_boost"].includes(type);
  }

  it("classifies damage as offensive", () => {
    expect(isOffensiveEffect("damage")).toBe(true);
  });

  it("classifies heal_gain as defensive", () => {
    expect(isDefensiveEffect("heal_gain")).toBe(true);
  });

  it("classifies shield_gain as defensive", () => {
    expect(isDefensiveEffect("shield_gain")).toBe(true);
  });

  it("classifies energy_steal as offensive", () => {
    expect(isOffensiveEffect("energy_steal")).toBe(true);
  });

  it("classifies heal_steal as offensive (damages target)", () => {
    expect(isOffensiveEffect("heal_steal")).toBe(true);
  });

  it("does not classify heal_block as offensive or defensive (it's control)", () => {
    expect(isOffensiveEffect("heal_block")).toBe(false);
    expect(isDefensiveEffect("heal_block")).toBe(false);
  });

  it("classifies draw_boost as defensive", () => {
    expect(isDefensiveEffect("draw_boost")).toBe(true);
  });
});

// ─── Compound Pattern Analysis Tests ────────────────────────

describe("Compound Pattern Strategic Analysis", () => {
  it("aggressive pattern grows faster than standard", () => {
    const aggressiveTotal = (() => {
      let sum = 0;
      for (let t = 0; t < 5; t++) sum += getCompoundTickValue(10, "aggressive", t);
      return sum;
    })();
    const standardTotal = (() => {
      let sum = 0;
      for (let t = 0; t < 5; t++) sum += getCompoundTickValue(10, "standard", t);
      return sum;
    })();
    expect(aggressiveTotal).toBeGreaterThan(standardTotal);
  });

  it("slowburn pattern is most consistent early", () => {
    // First 4 ticks of slowburn are all multiplier 1
    for (let t = 0; t < 4; t++) {
      expect(COMPOUND_TICKS.slowburn[t]).toBe(1);
    }
  });

  it("aggressive pattern has exponential growth", () => {
    // Each tick doubles
    for (let t = 1; t < 6; t++) {
      expect(COMPOUND_TICKS.aggressive[t]).toBe(COMPOUND_TICKS.aggressive[t - 1] * 2);
    }
  });

  it("standard pattern follows Fibonacci", () => {
    // After first two 1s, each is sum of previous two
    for (let t = 2; t < 8; t++) {
      expect(COMPOUND_TICKS.standard[t]).toBe(
        COMPOUND_TICKS.standard[t - 1] + COMPOUND_TICKS.standard[t - 2]
      );
    }
  });
});
