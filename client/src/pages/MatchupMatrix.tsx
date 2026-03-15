/**
 * Matchup Matrix Page — 7x7 Faction Win Rate Heatmap
 *
 * Visualizes pairwise faction matchup dynamics in a 4-player FFA context.
 * Data derived from Monte Carlo simulation (100K games, v5 balance).
 *
 * Features:
 * - Interactive 7x7 heatmap grid with color-coded cells
 * - Hover tooltips with detailed matchup analysis
 * - Faction identity badges with archetype icons
 * - Analysis sections explaining key dynamics
 * - Mobile responsive with horizontal scroll
 * - Dark gothic cathedral branding
 */

import { useState, useMemo, memo, useCallback } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { SinType, PASSIVE_INFO } from "@shared/gameTypes";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import EmberField from "@/components/EmberField";

/* ─── Faction Config ────────────────────────────────────────── */
const FACTIONS: SinType[] = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];

const FACTION_COLORS: Record<SinType, string> = {
  wrath: "#ef4444",
  sloth: "#a855f7",
  greed: "#eab308",
  envy: "#22c55e",
  pride: "#e2e2e2",
  lust: "#ec4899",
  gluttony: "#f97316",
};

const FACTION_LABELS: Record<SinType, string> = {
  wrath: "Wrath",
  sloth: "Sloth",
  greed: "Greed",
  envy: "Envy",
  pride: "Pride",
  lust: "Lust",
  gluttony: "Gluttony",
};

/**
 * Pairwise matchup data: MATCHUP_DATA[attacker][defender] = win rate %
 *
 * In a 4-player FFA, "matchup" measures how often faction A finishes
 * ahead of faction B when both are in the same game. 50% = perfectly even.
 *
 * Data from v5 Monte Carlo simulation (100K games).
 * These values reflect the compound-ticking dynamics, passive interactions,
 * and the simultaneous-resolution turn structure.
 *
 * Methodology note: Since this is a 4-player game (not 1v1), pairwise
 * win rates are measured as "probability of finishing higher than the
 * other faction" across all games where both factions appear.
 */
const MATCHUP_DATA: Record<SinType, Record<SinType, number>> = {
  wrath: {
    wrath: 50.0,
    sloth: 47.8,
    greed: 50.5,
    envy: 51.5,
    pride: 50.7,
    lust: 47.4,
    gluttony: 48.0,
  },
  sloth: {
    wrath: 52.2,
    sloth: 50.0,
    greed: 50.6,
    envy: 49.8,
    pride: 49.6,
    lust: 48.8,
    gluttony: 47.9,
  },
  greed: {
    wrath: 49.5,
    sloth: 49.4,
    greed: 50.0,
    envy: 51.4,
    pride: 49.9,
    lust: 49.1,
    gluttony: 50.8,
  },
  envy: {
    wrath: 48.5,
    sloth: 50.2,
    greed: 48.6,
    envy: 50.0,
    pride: 48.5,
    lust: 50.5,
    gluttony: 47.1,
  },
  pride: {
    wrath: 49.3,
    sloth: 50.4,
    greed: 50.1,
    envy: 51.5,
    pride: 50.0,
    lust: 48.2,
    gluttony: 47.8,
  },
  lust: {
    wrath: 52.6,
    sloth: 51.2,
    greed: 50.9,
    envy: 49.5,
    pride: 51.8,
    lust: 50.0,
    gluttony: 49.9,
  },
  gluttony: {
    wrath: 52.0,
    sloth: 52.1,
    greed: 49.2,
    envy: 52.9,
    pride: 52.2,
    lust: 50.1,
    gluttony: 50.0,
  },
};

/**
 * Matchup flavor text — short analysis for notable matchups.
 * Explains the strategic dynamics behind the numbers.
 */
const MATCHUP_ANALYSIS: Record<string, string> = {
  "wrath-envy": "Wrath's high burst overwhelms Envy before affliction stacking can escalate. VENGEANCE reflect punishes Envy's damage-to-amplify loop.",
  "wrath-lust": "Lust's TEMPTATION lifesteal directly counters Wrath's aggression — every hit heals Lust while VENGEANCE only reflects a portion.",
  "wrath-sloth": "Sloth's ENDURANCE shields absorb Wrath's burst. The slowburn pattern outlasts Wrath's aggressive front-loading.",
  "sloth-pride": "Pride's HUBRIS burst can overwhelm Sloth's shields when it triggers, but Sloth's consistent ENDURANCE generation keeps the matchup close.",
  "greed-gluttony": "Greed's resource theft disrupts Gluttony's discard_burn chains, but Gluttony's DEVOURER energy gain can outpace the theft.",
  "lust-wrath": "Lust's TEMPTATION converts Wrath's aggression into sustain. The more Wrath attacks, the more Lust heals.",
  "envy-gluttony": "Gluttony's discard_burn removes cards Envy needs for affliction stacking. DEVOURER energy gain outpaces JEALOUSY scaling.",
  "pride-envy": "Pride's expensive cards trigger HUBRIS more reliably, and the x1.324 multiplier overwhelms Envy's gradual amplification.",
  "gluttony-wrath": "Gluttony's deck destruction removes Wrath's high-damage cards from circulation. DEVOURER energy sustains the burn chain.",
  "lust-sloth": "Lust's lifesteal slowly erodes Sloth's shields. TEMPTATION healing outpaces ENDURANCE shield generation in long games.",
  "envy-lust": "Envy's JEALOUSY affliction amplification disrupts Lust's sustain loop — amplified afflictions deal more than TEMPTATION can heal.",
  "gluttony-sloth": "Gluttony's deck burn disrupts Sloth's slowburn strategy by removing key late-game cards before they can compound.",
};

/* ─── Color Interpolation ───────────────────────────────────── */
function getHeatColor(value: number): string {
  // 50 = neutral, <50 = disadvantage (red), >50 = advantage (green)
  const deviation = value - 50;
  if (Math.abs(deviation) < 0.5) return "rgba(255, 255, 255, 0.06)";
  if (deviation > 0) {
    const intensity = Math.min(deviation / 4, 1);
    return `rgba(34, 197, 94, ${0.08 + intensity * 0.25})`;
  } else {
    const intensity = Math.min(Math.abs(deviation) / 4, 1);
    return `rgba(239, 68, 68, ${0.08 + intensity * 0.25})`;
  }
}

function getTextColor(value: number): string {
  const deviation = value - 50;
  if (Math.abs(deviation) < 0.5) return "rgba(255, 255, 255, 0.4)";
  if (deviation > 0) return "rgba(134, 239, 172, 0.9)";
  return "rgba(252, 165, 165, 0.9)";
}

/* ─── Heatmap Cell ──────────────────────────────────────────── */
const HeatmapCell = memo(function HeatmapCell({
  attacker,
  defender,
  value,
  isHovered,
  onHover,
}: {
  attacker: SinType;
  defender: SinType;
  value: number;
  isHovered: boolean;
  onHover: (key: string | null) => void;
}) {
  const isDiagonal = attacker === defender;
  const key = `${attacker}-${defender}`;

  return (
    <td
      className="relative text-center transition-all duration-150"
      style={{
        background: isDiagonal ? "rgba(255, 255, 255, 0.02)" : getHeatColor(value),
        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
        borderRight: "1px solid rgba(255, 255, 255, 0.04)",
        padding: "0",
      }}
      onMouseEnter={() => !isDiagonal && onHover(key)}
      onMouseLeave={() => onHover(null)}
    >
      <div
        className={`w-full h-full flex items-center justify-center py-3 px-2 sm:py-4 sm:px-3 transition-all duration-150 ${
          isHovered ? "scale-110 z-10" : ""
        }`}
      >
        {isDiagonal ? (
          <span className="text-white/15 text-xs">—</span>
        ) : (
          <span
            className="text-xs sm:text-sm font-mono font-semibold tabular-nums"
            style={{ color: getTextColor(value) }}
          >
            {value.toFixed(1)}%
          </span>
        )}
      </div>
    </td>
  );
});

/* ─── Key Dynamics Card ─────────────────────────────────────── */
function DynamicCard({
  title,
  factions,
  description,
}: {
  title: string;
  factions: [SinType, SinType];
  description: string;
}) {
  const rate1 = MATCHUP_DATA[factions[0]][factions[1]];
  const rate2 = MATCHUP_DATA[factions[1]][factions[0]];

  return (
    <div
      className="rounded-lg p-4 transition-all duration-200 hover:bg-white/[0.03]"
      style={{
        background: "linear-gradient(135deg, rgba(15, 12, 10, 0.5), rgba(20, 15, 12, 0.3))",
        border: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <img src={SIN_ARCHETYPE_ICONS[factions[0]]} alt={factions[0]} className="w-5 h-5" />
        <span className="text-white/30 text-xs">vs</span>
        <img src={SIN_ARCHETYPE_ICONS[factions[1]]} alt={factions[1]} className="w-5 h-5" />
        <span
          className="text-xs font-semibold text-amber-200/70 ml-auto"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {rate1.toFixed(1)}% / {rate2.toFixed(1)}%
        </span>
      </div>
      <h4
        className="text-sm font-semibold text-white/80 mb-1"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {title}
      </h4>
      <p className="text-xs text-white/40 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
        {description}
      </p>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function MatchupMatrix() {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  // Compute strongest/weakest matchups for each faction
  const factionStats = useMemo(() => {
    return FACTIONS.map((faction) => {
      const matchups = FACTIONS.filter((f) => f !== faction).map((opp) => ({
        opponent: opp,
        rate: MATCHUP_DATA[faction][opp],
      }));
      const best = matchups.reduce((a, b) => (a.rate > b.rate ? a : b));
      const worst = matchups.reduce((a, b) => (a.rate < b.rate ? a : b));
      const avg = matchups.reduce((sum, m) => sum + m.rate, 0) / matchups.length;
      return { faction, best, worst, avg };
    });
  }, []);

  const handleHover = useCallback((key: string | null) => {
    setHoveredCell(key);
  }, []);

  // Get tooltip info for hovered cell
  const tooltipInfo = useMemo(() => {
    if (!hoveredCell) return null;
    const [attacker, defender] = hoveredCell.split("-") as [SinType, SinType];
    const rate = MATCHUP_DATA[attacker][defender];
    const reverseRate = MATCHUP_DATA[defender][attacker];
    const analysis =
      MATCHUP_ANALYSIS[hoveredCell] ||
      MATCHUP_ANALYSIS[`${defender}-${attacker}`] ||
      null;
    return { attacker, defender, rate, reverseRate, analysis };
  }, [hoveredCell]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <EmberField count={15} />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Hero */}
      <header className="relative z-10 pt-16 pb-10 sm:pt-20 sm:pb-14 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/30" />
              <span
                className="text-[10px] tracking-[0.4em] text-amber-200/40 uppercase"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Faction Dynamics
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/30" />
            </div>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide mb-3"
              style={{ fontFamily: "var(--font-heading)", color: "rgba(255, 255, 255, 0.9)" }}
            >
              Matchup Matrix
            </h1>
            <p
              className="text-sm sm:text-base text-white/40 max-w-xl mx-auto leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Pairwise faction win rates from 100K simulated games. Each cell shows how often the
              row faction finishes ahead of the column faction in 4-player free-for-all.
            </p>
          </motion.div>
        </div>
      </header>

      {/* Heatmap Grid */}
      <section className="relative z-10 px-4 pb-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Scrollable container for mobile */}
            <div className="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
              <div className="min-w-[600px]">
                <table
                  className="w-full border-collapse"
                  style={{
                    background: "rgba(10, 10, 15, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  {/* Column headers */}
                  <thead>
                    <tr>
                      <th
                        className="p-2 sm:p-3 text-[9px] sm:text-[10px] text-white/20 uppercase tracking-wider text-right"
                        style={{ fontFamily: "var(--font-heading)", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}
                      >
                        <span className="hidden sm:inline">Row vs Col</span>
                        <span className="sm:hidden">vs</span>
                      </th>
                      {FACTIONS.map((faction) => (
                        <th
                          key={faction}
                          className="p-1.5 sm:p-2 text-center"
                          style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <img
                              src={SIN_ARCHETYPE_ICONS[faction]}
                              alt={faction}
                              className="w-5 h-5 sm:w-6 sm:h-6"
                            />
                            <span
                              className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
                              style={{ color: FACTION_COLORS[faction], fontFamily: "var(--font-heading)" }}
                            >
                              {FACTION_LABELS[faction].slice(0, 3)}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Data rows */}
                  <tbody>
                    {FACTIONS.map((attacker) => (
                      <tr key={attacker}>
                        {/* Row header */}
                        <td className="p-1.5 sm:p-2 text-right" style={{ borderRight: "1px solid rgba(255, 255, 255, 0.06)" }}>
                          <div className="flex items-center justify-end gap-1.5">
                            <span
                              className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
                              style={{ color: FACTION_COLORS[attacker], fontFamily: "var(--font-heading)" }}
                            >
                              {FACTION_LABELS[attacker].slice(0, 3)}
                            </span>
                            <img
                              src={SIN_ARCHETYPE_ICONS[attacker]}
                              alt={attacker}
                              className="w-5 h-5 sm:w-6 sm:h-6"
                            />
                          </div>
                        </td>

                        {/* Data cells */}
                        {FACTIONS.map((defender) => (
                          <HeatmapCell
                            key={defender}
                            attacker={attacker}
                            defender={defender}
                            value={MATCHUP_DATA[attacker][defender]}
                            isHovered={hoveredCell === `${attacker}-${defender}`}
                            onHover={handleHover}
                          />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-white/30">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-3 rounded" style={{ background: "rgba(239, 68, 68, 0.25)" }} />
                <span>Disadvantage (&lt;50%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-3 rounded" style={{ background: "rgba(255, 255, 255, 0.06)" }} />
                <span>Even (~50%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-3 rounded" style={{ background: "rgba(34, 197, 94, 0.25)" }} />
                <span>Advantage (&gt;50%)</span>
              </div>
            </div>

            {/* Tooltip */}
            {tooltipInfo && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-lg p-4"
                style={{
                  background: "linear-gradient(135deg, rgba(15, 12, 10, 0.9), rgba(20, 15, 12, 0.85))",
                  border: "1px solid rgba(245, 158, 11, 0.15)",
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <img src={SIN_ARCHETYPE_ICONS[tooltipInfo.attacker]} alt="" className="w-6 h-6" />
                  <span className="text-sm font-bold" style={{ color: FACTION_COLORS[tooltipInfo.attacker], fontFamily: "var(--font-heading)" }}>
                    {FACTION_LABELS[tooltipInfo.attacker]}
                  </span>
                  <span className="text-white/30 text-xs">vs</span>
                  <img src={SIN_ARCHETYPE_ICONS[tooltipInfo.defender]} alt="" className="w-6 h-6" />
                  <span className="text-sm font-bold" style={{ color: FACTION_COLORS[tooltipInfo.defender], fontFamily: "var(--font-heading)" }}>
                    {FACTION_LABELS[tooltipInfo.defender]}
                  </span>
                  <span className="ml-auto text-sm font-mono" style={{ color: getTextColor(tooltipInfo.rate) }}>
                    {tooltipInfo.rate.toFixed(1)}%
                  </span>
                </div>
                {tooltipInfo.analysis && (
                  <p className="text-xs text-white/50 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    {tooltipInfo.analysis}
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Faction Summary Cards */}
      <section className="relative z-10 px-4 pb-10">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-xl sm:text-2xl font-bold text-white/80 mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Faction Matchup Profiles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {factionStats.map(({ faction, best, worst, avg }) => (
              <motion.div
                key={faction}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg p-4"
                style={{
                  background: "linear-gradient(135deg, rgba(15, 12, 10, 0.5), rgba(20, 15, 12, 0.3))",
                  border: `1px solid ${FACTION_COLORS[faction]}15`,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <img src={SIN_ARCHETYPE_ICONS[faction]} alt={faction} className="w-6 h-6" />
                  <span
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{ color: FACTION_COLORS[faction], fontFamily: "var(--font-heading)" }}
                  >
                    {FACTION_LABELS[faction]}
                  </span>
                  <span className="ml-auto text-xs font-mono text-white/30">
                    avg {avg.toFixed(1)}%
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Best vs</span>
                    <span className="flex items-center gap-1">
                      <img src={SIN_ARCHETYPE_ICONS[best.opponent]} alt="" className="w-3.5 h-3.5" />
                      <span style={{ color: "rgba(134, 239, 172, 0.8)" }} className="font-mono">
                        {best.rate.toFixed(1)}%
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Worst vs</span>
                    <span className="flex items-center gap-1">
                      <img src={SIN_ARCHETYPE_ICONS[worst.opponent]} alt="" className="w-3.5 h-3.5" />
                      <span style={{ color: "rgba(252, 165, 165, 0.8)" }} className="font-mono">
                        {worst.rate.toFixed(1)}%
                      </span>
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-white/25" style={{ fontFamily: "var(--font-body)" }}>
                  {PASSIVE_INFO[faction].name} — {PASSIVE_INFO[faction].description.split(".")[0]}.
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Dynamics */}
      <section className="relative z-10 px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-xl sm:text-2xl font-bold text-white/80 mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Key Dynamics
          </h2>
          <p className="text-sm text-white/35 mb-6 max-w-2xl" style={{ fontFamily: "var(--font-body)" }}>
            Notable matchup asymmetries driven by passive ability interactions and compound-ticking mechanics.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DynamicCard
              title="Gluttony Devours Envy"
              factions={["gluttony", "envy"]}
              description="The strongest matchup in the game. Gluttony's deck destruction removes cards Envy needs for affliction stacking, while DEVOURER energy gain outpaces JEALOUSY's gradual amplification."
            />
            <DynamicCard
              title="Lust Dominates Wrath"
              factions={["lust", "wrath"]}
              description="Lust's TEMPTATION lifesteal directly counters Wrath's aggression. Every hit heals Lust while VENGEANCE only reflects a portion — creating a net-positive exchange for Lust."
            />
            <DynamicCard
              title="Sloth Walls Wrath"
              factions={["sloth", "wrath"]}
              description="Sloth's ENDURANCE shields absorb Wrath's burst damage. The slowburn compound pattern outlasts Wrath's aggressive front-loading, winning the attrition war."
            />
            <DynamicCard
              title="Envy Disrupts Lust"
              factions={["envy", "lust"]}
              description="Envy's JEALOUSY affliction amplification disrupts Lust's sustain loop — amplified afflictions deal more damage than TEMPTATION can heal, breaking the attrition advantage."
            />
            <DynamicCard
              title="Gluttony Burns Sloth"
              factions={["gluttony", "sloth"]}
              description="Gluttony's deck burn disrupts Sloth's slowburn strategy by removing key late-game cards before they can compound. DEVOURER energy sustains the pressure."
            />
            <DynamicCard
              title="Greed Checks Gluttony"
              factions={["greed", "gluttony"]}
              description="Greed's resource theft disrupts Gluttony's discard_burn chains. TAX shields provide passive defense while Greed steals the energy Gluttony needs."
            />
          </div>
        </div>
      </section>

      {/* Methodology Note */}
      <section className="relative z-10 px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(15, 12, 10, 0.4), rgba(20, 15, 12, 0.2))",
              border: "1px solid rgba(255, 255, 255, 0.04)",
            }}
          >
            <h3
              className="text-sm font-semibold text-amber-200/60 mb-3 tracking-wider uppercase"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Methodology Note
            </h3>
            <p className="text-xs text-white/35 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Pairwise matchup rates are measured across 100K simulated 4-player FFA games using the v5 balanced parameters.
              Each cell represents the probability that the row faction finishes with a higher placement than the column faction
              when both appear in the same game. Because this is a 4-player format (not 1v1), matchup dynamics are influenced
              by the other two factions present — a faction may perform differently against the same opponent depending on the
              overall table composition. The data uses random card selection; human strategic play may shift these values.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/20" />
            <svg width="8" height="8" viewBox="0 0 12 12" className="text-amber-500/20">
              <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="currentColor" />
            </svg>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/20" />
          </div>
          <p className="text-center text-[10px] text-white/15" style={{ fontFamily: "var(--font-heading)" }}>
            7 Deadly Sins — Matchup Matrix v5 — 100K Game Simulation
          </p>
        </div>
      </footer>
    </div>
  );
}
