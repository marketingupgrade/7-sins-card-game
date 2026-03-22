/**
 * ActiveEffectsDashboard — Always-Visible Effect Summary
 *
 * Audit fix #3: Shows a compact, always-visible summary of all active effects
 * on each player. Replaces the need to open the full Balance Sheet for basic
 * strategic information.
 *
 * Shows:
 * - Net damage per round (incoming tick damage - healing)
 * - Active effect count with breakdown
 * - Remaining ticks on most impactful effect
 */

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ActiveEffect,
  PlayerState,
  SinType,
  getCompoundTickValue,
  CompoundPattern,
} from "@shared/gameTypes";

interface ActiveEffectsDashboardProps {
  player: PlayerState;
  activeEffects: ActiveEffect[];
  currentRound: number;
  isCompact?: boolean;
}

interface EffectSummary {
  netDamagePerRound: number;
  netHealPerRound: number;
  shieldPerRound: number;
  totalEffects: number;
  damageEffects: number;
  healEffects: number;
  shieldEffects: number;
  controlEffects: number;
  biggestThreat: { type: string; value: number; ticksLeft: number } | null;
}

const DAMAGE_TYPES = ["damage", "self_damage", "heal_steal", "energy_steal", "affliction_amplify"];
const HEAL_TYPES = ["heal_gain", "heal_steal"];
const SHIELD_TYPES = ["shield_gain", "shield_steal"];
const CONTROL_TYPES = ["heal_block", "shield_block", "energy_block", "draw_reduction", "discard_burn"];

function summarizeEffects(
  effects: ActiveEffect[],
  playerId: string,
  currentRound: number
): EffectSummary {
  const playerEffects = effects.filter((e) => e.targetPlayerId === playerId);

  let netDamagePerRound = 0;
  let netHealPerRound = 0;
  let shieldPerRound = 0;
  let damageEffects = 0;
  let healEffects = 0;
  let shieldEffects = 0;
  let controlEffects = 0;
  let biggestThreat: { type: string; value: number; ticksLeft: number } | null = null;

  for (const effect of playerEffects) {
    const tick = effect.currentTick ?? 0;
    const pattern = effect.compoundPattern ?? "standard";
    const currentValue = getCompoundTickValue(effect.baseValue, pattern as CompoundPattern, tick);
    const ticksLeft = effect.durationRounds - tick;

    if (DAMAGE_TYPES.includes(effect.effectType)) {
      netDamagePerRound += currentValue;
      damageEffects++;
      if (!biggestThreat || currentValue > biggestThreat.value) {
        biggestThreat = { type: effect.effectType, value: currentValue, ticksLeft };
      }
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

  return {
    netDamagePerRound,
    netHealPerRound,
    shieldPerRound,
    totalEffects: playerEffects.length,
    damageEffects,
    healEffects,
    shieldEffects,
    controlEffects,
    biggestThreat,
  };
}

const ActiveEffectsDashboard = memo(function ActiveEffectsDashboard({
  player,
  activeEffects,
  currentRound,
  isCompact = false,
}: ActiveEffectsDashboardProps) {
  const summary = useMemo(
    () => summarizeEffects(activeEffects, player.id, currentRound),
    [activeEffects, player.id, currentRound]
  );

  if (summary.totalEffects === 0) return null;

  const netChange = summary.netHealPerRound + summary.shieldPerRound - summary.netDamagePerRound;
  const isPositive = netChange > 0;
  const isNeutral = netChange === 0;

  if (isCompact) {
    return (
      <div className="flex items-center gap-1.5 text-[10px]" style={{ fontFamily: "var(--font-heading)" }}>
        {summary.netDamagePerRound > 0 && (
          <span className="text-wrath font-bold">
            -{summary.netDamagePerRound}/rd
          </span>
        )}
        {summary.netHealPerRound > 0 && (
          <span className="font-bold" style={{ color: "oklch(0.7 0.2 145)" }}>
            +{summary.netHealPerRound}/rd
          </span>
        )}
        {summary.shieldPerRound > 0 && (
          <span className="text-candle font-bold">
            🛡{summary.shieldPerRound}/rd
          </span>
        )}
        {summary.controlEffects > 0 && (
          <span className="text-sloth font-bold">
            {summary.controlEffects} debuff{summary.controlEffects > 1 ? "s" : ""}
          </span>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg px-2.5 py-1.5 border"
      style={{
        backgroundColor: "oklch(0.12 0.02 280 / 0.8)",
        borderColor: isPositive
          ? "oklch(0.4 0.15 145 / 0.3)"
          : isNeutral
          ? "oklch(0.4 0.05 0 / 0.2)"
          : "oklch(0.4 0.15 25 / 0.3)",
      }}
    >
      {/* Net HP change per round */}
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-[10px] tracking-wider uppercase"
          style={{ fontFamily: "var(--font-heading)", color: "oklch(0.6 0 0 / 0.6)" }}
        >
          Net/Round
        </span>
        <span
          className="text-xs font-black"
          style={{
            fontFamily: "var(--font-heading)",
            color: isPositive
              ? "oklch(0.7 0.2 145)"
              : isNeutral
              ? "oklch(0.6 0 0)"
              : "oklch(0.7 0.2 25)",
          }}
        >
          {isPositive ? "+" : ""}{netChange}
        </span>
      </div>

      {/* Effect breakdown bar */}
      <div className="flex gap-1">
        {summary.damageEffects > 0 && (
          <div
            className="flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-bold"
            style={{
              backgroundColor: "oklch(0.25 0.1 25 / 0.4)",
              color: "oklch(0.75 0.2 25)",
              fontFamily: "var(--font-heading)",
            }}
          >
            ⚔{summary.damageEffects}
          </div>
        )}
        {summary.healEffects > 0 && (
          <div
            className="flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-bold"
            style={{
              backgroundColor: "oklch(0.25 0.1 145 / 0.4)",
              color: "oklch(0.75 0.2 145)",
              fontFamily: "var(--font-heading)",
            }}
          >
            ♥{summary.healEffects}
          </div>
        )}
        {summary.shieldEffects > 0 && (
          <div
            className="flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-bold"
            style={{
              backgroundColor: "oklch(0.25 0.1 80 / 0.4)",
              color: "oklch(0.75 0.15 80)",
              fontFamily: "var(--font-heading)",
            }}
          >
            🛡{summary.shieldEffects}
          </div>
        )}
        {summary.controlEffects > 0 && (
          <div
            className="flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-bold"
            style={{
              backgroundColor: "oklch(0.25 0.08 280 / 0.4)",
              color: "oklch(0.65 0.15 280)",
              fontFamily: "var(--font-heading)",
            }}
          >
            ✦{summary.controlEffects}
          </div>
        )}
      </div>

      {/* Biggest threat callout */}
      {summary.biggestThreat && summary.biggestThreat.ticksLeft > 0 && (
        <div
          className="mt-1 text-[9px] flex items-center gap-1"
          style={{ fontFamily: "var(--font-body)", color: "oklch(0.65 0.15 25 / 0.8)" }}
        >
          <span className="animate-pulse">⚠</span>
          <span>
            {summary.biggestThreat.value}/rd for {summary.biggestThreat.ticksLeft} more
          </span>
        </div>
      )}
    </motion.div>
  );
});

export default ActiveEffectsDashboard;
