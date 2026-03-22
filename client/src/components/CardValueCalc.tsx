/**
 * CardValueCalc — Strategic Value Calculator for Cards
 *
 * Shows total cumulative value, duration, % HP impact, and a mini sparkline
 * for compound growth patterns. Designed to fit compactly on the GameCard.
 *
 * This is the #1 audit fix: players need to see WHAT a card will actually do,
 * not just raw numbers. "Hurt 15→120" becomes "270 total (81% HP) over 5 rounds".
 */

import { memo, useMemo } from "react";
import {
  CardDefinition,
  CardEffect,
  CompoundPattern,
  getCompoundTickValue,
  STARTING_HP,
  MAX_ROUNDS,
  COMPOUND_TICKS,
} from "@shared/gameTypes";

interface CardValueCalcProps {
  card: CardDefinition;
  currentRound: number;
  /** Target's current HP — used for % impact calculation */
  targetHp?: number;
}

/** Calculate total cumulative value of an effect over its full duration */
function calcTotalValue(baseValue: number, pattern: CompoundPattern, duration: number): number {
  let total = 0;
  for (let t = 0; t < duration; t++) {
    total += getCompoundTickValue(baseValue, pattern, t);
  }
  return total;
}

/** Calculate remaining value if played at this round (effects may not all tick before game ends) */
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

/** Generate sparkline data points for a compound pattern */
function getSparklinePoints(baseValue: number, pattern: CompoundPattern, duration: number): number[] {
  const points: number[] = [];
  for (let t = 0; t < duration; t++) {
    points.push(getCompoundTickValue(baseValue, pattern, t));
  }
  return points;
}

/** Determine if this is an "offensive" effect (damage-dealing) */
function isOffensiveEffect(type: string): boolean {
  return ["damage", "self_damage", "heal_steal", "energy_steal", "shield_steal", "affliction_amplify", "discard_burn", "draw_reduction"].includes(type);
}

/** Determine if this is a "defensive" effect (self-beneficial) */
function isDefensiveEffect(type: string): boolean {
  return ["heal_gain", "shield_gain", "energy_gain", "energy_regen", "draw_boost"].includes(type);
}

/** Mini sparkline SVG showing compound growth curve */
const MiniSparkline = memo(function MiniSparkline({
  points,
  color,
  width = 48,
  height = 16,
}: {
  points: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (points.length < 2) return null;

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const pathPoints = points.map((v, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return `${x},${y}`;
  });

  const linePath = `M${pathPoints.join(" L")}`;
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="inline-block"
      style={{ verticalAlign: "middle" }}
    >
      {/* Area fill */}
      <path d={areaPath} fill={color} opacity={0.15} />
      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* End dot */}
      <circle
        cx={(points.length - 1) / (points.length - 1) * width}
        cy={height - ((points[points.length - 1] - min) / range) * (height - 2) - 1}
        r={2}
        fill={color}
      />
    </svg>
  );
});

/** Round timing indicator — green/amber/red based on optimal timing */
function getTimingColor(currentRound: number, duration: number): string {
  const roundsLeft = MAX_ROUNDS - currentRound + 1;
  if (roundsLeft >= duration) return "oklch(0.7 0.2 145)"; // Green — full value
  if (roundsLeft >= duration * 0.6) return "oklch(0.75 0.15 80)"; // Amber — partial value
  return "oklch(0.65 0.2 25)"; // Red — significant value loss
}

/** Get pattern color for sparkline */
function getPatternColor(pattern: CompoundPattern): string {
  switch (pattern) {
    case "aggressive": return "oklch(0.7 0.25 25)"; // Red-orange for explosive
    case "slowburn": return "oklch(0.7 0.15 80)"; // Amber for patient
    case "standard": return "oklch(0.7 0.15 200)"; // Blue for steady
    default: return "oklch(0.7 0.1 0)";
  }
}

const CardValueCalc = memo(function CardValueCalc({ card, currentRound, targetHp }: CardValueCalcProps) {
  const hp = targetHp || STARTING_HP;

  const analysis = useMemo(() => {
    const primaryEffect = card.effects[0];
    if (!primaryEffect) return null;

    const totalValue = calcTotalValue(primaryEffect.baseValue, card.compoundPattern, primaryEffect.duration);
    const remainingValue = calcRemainingValue(primaryEffect.baseValue, card.compoundPattern, primaryEffect.duration, currentRound);
    const hpPercent = Math.round((totalValue / hp) * 100);
    const remainingPercent = Math.round((remainingValue / hp) * 100);
    const sparkline = getSparklinePoints(primaryEffect.baseValue, card.compoundPattern, primaryEffect.duration);
    const roundsLeft = MAX_ROUNDS - currentRound + 1;
    const willTruncate = primaryEffect.duration > roundsLeft;
    const isOffensive = isOffensiveEffect(primaryEffect.type);
    const isDefensive = isDefensiveEffect(primaryEffect.type);

    return {
      totalValue,
      remainingValue,
      hpPercent,
      remainingPercent,
      sparkline,
      duration: primaryEffect.duration,
      willTruncate,
      isOffensive,
      isDefensive,
      effectiveDuration: Math.min(primaryEffect.duration, roundsLeft),
    };
  }, [card, currentRound, hp]);

  if (!analysis) return null;

  const timingColor = getTimingColor(currentRound, analysis.duration);
  const patternColor = getPatternColor(card.compoundPattern);

  return (
    <div className="px-3 py-1.5 space-y-1">
      {/* Total value + sparkline row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <MiniSparkline
            points={analysis.sparkline}
            color={patternColor}
            width={40}
            height={14}
          />
          <span
            className="text-xs font-bold"
            style={{
              fontFamily: "var(--font-heading)",
              color: analysis.isOffensive ? "oklch(0.7 0.2 25)" : "oklch(0.7 0.2 145)",
            }}
          >
            {analysis.remainingValue} total
          </span>
        </div>
        {/* % HP impact */}
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
          style={{
            fontFamily: "var(--font-heading)",
            color: analysis.isOffensive ? "oklch(0.85 0.15 25)" : "oklch(0.85 0.15 145)",
            backgroundColor: analysis.isOffensive
              ? "oklch(0.3 0.1 25 / 0.3)"
              : "oklch(0.3 0.1 145 / 0.3)",
          }}
        >
          {analysis.remainingPercent}% HP
        </span>
      </div>

      {/* Duration + timing row */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px]"
          style={{
            fontFamily: "var(--font-body)",
            color: timingColor,
          }}
        >
          {analysis.effectiveDuration} round{analysis.effectiveDuration !== 1 ? "s" : ""}
          {analysis.willTruncate && (
            <span className="text-[9px] opacity-60 ml-1">(truncated)</span>
          )}
        </span>
        {/* Timing indicator dot */}
        <div className="flex items-center gap-1">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: timingColor }}
          />
          <span
            className="text-[9px] uppercase tracking-wider"
            style={{ fontFamily: "var(--font-heading)", color: timingColor }}
          >
            {analysis.willTruncate ? "LATE" : currentRound <= 3 ? "EARLY" : "OK"}
          </span>
        </div>
      </div>
    </div>
  );
});

export default CardValueCalc;
