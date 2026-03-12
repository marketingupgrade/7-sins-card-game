/**
 * Compound Effects Balance Sheet
 *
 * A chronological ledger showing ALL active and upcoming effects for every player.
 * Now uses the Fibonacci [1×, 1×, 2×] tick-based compounding system.
 * Flat effects show as instant one-shots. Compounding effects show their tick timeline.
 */

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { ICON_URLS } from "@/lib/assetUrls";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import type { SinType } from "@shared/gameTypes";
import { ActiveEffect, getCompoundTickValue, CompoundPattern, PlayerState } from "@shared/gameTypes";
import { CARD_MAP } from "@shared/cardData";
import { isBot } from "@/lib/botEngine";

interface CompoundBalanceSheetProps {
  activeEffects: ActiveEffect[];
  players: PlayerState[];
  currentRound: number;
  isOpen: boolean;
  onClose: () => void;
}

interface ProjectedTick {
  round: number;
  targetPlayerId: string;
  targetName: string;
  targetSin: string | null;
  sourcePlayerId: string;
  sourceName: string;
  effectType: string;
  baseValue: number;
  tickIndex: number;
  tickValue: number;
  cardName: string;
  totalTicks: number;
  isCurrentTick: boolean;
}

const EFFECT_CONFIG: Record<string, { iconUrl: string; label: string; colorClass: string; bgClass: string; borderClass: string }> = {
  damage: {
    iconUrl: ICON_URLS.damage_wrath,
    label: "DMG",
    colorClass: "text-wrath",
    bgClass: "bg-wrath/10",
    borderClass: "border-wrath/20",
  },
  heal: {
    iconUrl: ICON_URLS.heal_generic,
    label: "HEAL",
    colorClass: "text-envy-glow",
    bgClass: "bg-envy-glow/10",
    borderClass: "border-envy-glow/20",
  },
  shield: {
    iconUrl: ICON_URLS.shield_generic,
    label: "SHIELD",
    colorClass: "text-candle",
    bgClass: "bg-candle/10",
    borderClass: "border-candle/20",
  },
  debuff: {
    iconUrl: ICON_URLS.debuff_wrath,
    label: "DEBUFF",
    colorClass: "text-sloth",
    bgClass: "bg-sloth/10",
    borderClass: "border-sloth/20",
  },
};

function getPlayerName(players: PlayerState[], playerId: string): string {
  const player = players.find((p) => p.id === playerId || p.gamePlayerId === playerId);
  if (!player) return "???";
  return player.username + (isBot(player.id) ? " \u{1F916}" : "");
}

function getPlayerSin(players: PlayerState[], playerId: string): string | null {
  const player = players.find((p) => p.id === playerId || p.gamePlayerId === playerId);
  return player?.chosenSin || null;
}

export default function CompoundBalanceSheet({
  activeEffects,
  players,
  currentRound,
  isOpen,
  onClose,
}: CompoundBalanceSheetProps) {
  // Project all active effects into future ticks
  const projectedTicks: ProjectedTick[] = [];

  for (const effect of activeEffects) {
    const pattern: CompoundPattern = effect.compoundPattern || "standard";
    const totalTicks = effect.durationRounds;
    const currentTick = effect.currentTick || 0;

    for (let tick = currentTick; tick < totalTicks; tick++) {
      const tickValue = Math.round(getCompoundTickValue(effect.baseValue, pattern, tick));
      const roundForTick = currentRound + (tick - currentTick);

      projectedTicks.push({
        round: roundForTick,
        targetPlayerId: effect.targetPlayerId,
        targetName: getPlayerName(players, effect.targetPlayerId),
        targetSin: getPlayerSin(players, effect.targetPlayerId),
        sourcePlayerId: effect.sourcePlayerId,
        sourceName: getPlayerName(players, effect.sourcePlayerId),
        effectType: effect.effectType,
        baseValue: effect.baseValue,
        tickIndex: tick,
        tickValue,
        cardName: CARD_MAP[effect.cardId]?.name || "Unknown",
        totalTicks,
        isCurrentTick: tick === currentTick,
      });
    }
  }

  // Group by round
  const roundGroups = new Map<number, ProjectedTick[]>();
  for (const pt of projectedTicks) {
    if (!roundGroups.has(pt.round)) {
      roundGroups.set(pt.round, []);
    }
    roundGroups.get(pt.round)!.push(pt);
  }

  const sortedRounds = Array.from(roundGroups.keys()).sort((a, b) => a - b);

  // Calculate per-player net impact summary
  const playerSummary = new Map<string, { damage: number; healing: number; shielding: number }>();
  for (const pt of projectedTicks) {
    if (!playerSummary.has(pt.targetPlayerId)) {
      playerSummary.set(pt.targetPlayerId, { damage: 0, healing: 0, shielding: 0 });
    }
    const summary = playerSummary.get(pt.targetPlayerId)!;
    if (pt.effectType === "damage" || pt.effectType === "debuff") {
      summary.damage += pt.tickValue;
    } else if (pt.effectType === "heal") {
      summary.healing += pt.tickValue;
    } else if (pt.effectType === "shield") {
      summary.shielding += pt.tickValue;
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute left-0 top-0 bottom-0 w-80 bg-card/95 backdrop-blur-md border-r border-border/30 z-20 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-border/20">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <img src={ICON_URLS.buff_generic} alt="effects" className="w-4 h-4 object-contain" />
                <h3
                  className="text-xs font-bold text-foreground tracking-[0.2em] uppercase"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Effects Ledger
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p
              className="text-[10px] text-muted-foreground/70 italic"
              style={{ fontFamily: "var(--font-body)" }}
            >
              All effects compound over 3 ticks. STD (Fibonacci): 1×, 1×, 2× — AGG (Powers): 1×, 2×, 4× — SLO (Ramp): 0.5×, 1×, 2.5×
            </p>
          </div>

          {/* Player Net Impact Summary */}
          {playerSummary.size > 0 && (
            <div className="px-4 py-3 border-b border-border/10">
              <p
                className="text-[9px] text-muted-foreground/70 uppercase tracking-[0.15em] mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Total Projected Impact
              </p>
              <div className="space-y-1.5">
                {Array.from(playerSummary.entries()).map(([playerId, summary]) => {
                  const player = players.find((p) => p.id === playerId || p.gamePlayerId === playerId);
                  const sin = player?.chosenSin;
                  const sinColorMap: Record<string, string> = { wrath: "text-wrath", sloth: "text-sloth", greed: "text-greed", envy: "text-envy", pride: "text-pride", lust: "text-lust", gluttony: "text-gluttony" };
                  const sinIconUrl = SIN_ARCHETYPE_ICONS[(sin || "wrath") as SinType];
                  return (
                    <div
                      key={playerId}
                      className="flex items-center gap-2 text-[10px]"
                    >
                      <img src={sinIconUrl} alt={sin || "wrath"} className="w-3 h-3 flex-shrink-0 object-contain" loading="lazy" />
                      <span
                        className="text-foreground/80 truncate flex-1 font-medium"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {getPlayerName(players, playerId)}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {summary.damage > 0 && (
                          <span className="text-wrath font-bold flex items-center gap-0.5">
                            <img src={ICON_URLS.damage_wrath} alt="dmg" className="w-2.5 h-2.5 object-contain" />-{summary.damage}
                          </span>
                        )}
                        {summary.healing > 0 && (
                          <span className="text-envy-glow font-bold flex items-center gap-0.5">
                            <img src={ICON_URLS.heal_generic} alt="heal" className="w-2.5 h-2.5 object-contain" />+{summary.healing}
                          </span>
                        )}
                        {summary.shielding > 0 && (
                          <span className="text-candle font-bold flex items-center gap-0.5">
                            <img src={ICON_URLS.shield_generic} alt="shield" className="w-2.5 h-2.5 object-contain" />+{summary.shielding}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chronological Timeline */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {sortedRounds.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <img src={ICON_URLS.energy_generic} alt="empty" className="w-8 h-8 object-contain opacity-50 mb-3" />
                <p
                  className="text-xs text-muted-foreground/70"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  No active effects. How peaceful.
                </p>
                <p
                  className="text-[10px] text-muted-foreground/60 mt-1 italic"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Don't worry, someone will ruin it soon.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedRounds.map((round) => {
                  const effects = roundGroups.get(round)!;
                  const isCurrentRound = round === currentRound;

                  return (
                    <motion.div
                      key={round}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (round - currentRound) * 0.05 }}
                    >
                      {/* Round Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${
                            isCurrentRound
                              ? "bg-greed-glow/15 text-greed-glow border border-greed-glow/20"
                              : "bg-muted/30 text-muted-foreground/60 border border-border/10"
                          }`}
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          <ChevronRight className="w-2.5 h-2.5" />
                          ROUND {round}
                          {isCurrentRound && " \u2014 NOW"}
                          {round > currentRound && ` \u2014 in ${round - currentRound} turn${round - currentRound > 1 ? "s" : ""}`}
                        </div>
                        <div className="flex-1 h-px bg-border/10" />
                      </div>

                      {/* Effect Rows */}
                      <div className="space-y-1.5 pl-2">
                        {effects.map((pt, i) => {
                          const config = EFFECT_CONFIG[pt.effectType] || EFFECT_CONFIG.damage;
                          const isNegative = pt.effectType === "damage" || pt.effectType === "debuff";

                          return (
                            <motion.div
                              key={`${pt.targetPlayerId}-${pt.effectType}-${pt.cardName}-${pt.tickIndex}-${i}`}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.03 }}
                              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${config.bgClass} ${config.borderClass}`}
                            >
                              {/* Effect Icon */}
                              <div className={`flex-shrink-0 ${config.colorClass}`}>
                                <img src={config.iconUrl} alt={config.label} className="w-3 h-3 object-contain" loading="lazy" />
                              </div>

                              {/* Target & Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <span
                                    className="text-[10px] font-bold text-foreground/90 truncate"
                                    style={{ fontFamily: "var(--font-heading)" }}
                                  >
                                    {pt.targetName}
                                  </span>
                                  <span className="text-[7px] px-1 py-0 rounded bg-greed-glow/15 text-greed-glow border border-greed-glow/20 font-bold uppercase flex items-center gap-0.5">
                                    <span className="w-2 h-2 inline-block text-[8px]">⏱</span>
                                    Tick {pt.tickIndex + 1}/{pt.totalTicks}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-[8px] text-muted-foreground/70">
                                  <span>from {pt.sourceName}</span>
                                  <span>&middot;</span>
                                  <span className="italic">{pt.cardName}</span>
                                </div>
                              </div>

                              {/* Value with tick info */}
                              <div className="flex-shrink-0 text-right">
                                <span
                                  className={`text-sm font-black ${config.colorClass}`}
                                  style={{ fontFamily: "var(--font-heading)" }}
                                >
                                  {isNegative ? "-" : "+"}{pt.tickValue}
                                </span>
                                <div className="text-[7px] text-muted-foreground/70 font-medium" style={{ fontFamily: "var(--font-heading)" }}>
                                  base:{pt.baseValue} tick:{pt.tickIndex + 1}/{pt.totalTicks}
                                </div>
                                {pt.tickIndex < pt.totalTicks - 1 && (
                                  <div className="text-[7px] text-greed-glow/50" style={{ fontFamily: "var(--font-heading)" }}>
                                    {pt.totalTicks - pt.tickIndex - 1} tick{pt.totalTicks - pt.tickIndex - 1 > 1 ? "s" : ""} left
                                  </div>
                                )}
                                {pt.tickIndex === pt.totalTicks - 1 && (
                                  <div className="text-[7px] text-red-400/50" style={{ fontFamily: "var(--font-heading)" }}>
                                    FINAL TICK
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border/10">
            <div className="space-y-1">
              <p
                className="text-[9px] text-candle/60 text-center font-bold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                COMPOUNDING: base &times;1 &rarr; base &times;1 &rarr; base &times;2
              </p>
              <p
                className="text-[8px] text-muted-foreground/60 text-center italic"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Shields absorb damage before HP. Catch-up bonuses trigger when behind.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
