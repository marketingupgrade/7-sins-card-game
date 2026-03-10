/**
 * Compound Effects Balance Sheet
 *
 * A chronological ledger showing ALL upcoming compound effects for every player.
 * Think of it as a financial balance sheet, but for pain and suffering.
 * Grouped by round so you can see exactly what's coming and when.
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Moon, Shield, Heart, Skull, Zap, TrendingUp, X, ChevronRight, Coins, Eye
} from "lucide-react";
import { ActiveEffect, calculateEffectiveValue, PlayerState } from "@shared/gameTypes";
import { CARD_MAP } from "@shared/cardData";
import { isBot } from "@/lib/botEngine";

interface CompoundBalanceSheetProps {
  activeEffects: ActiveEffect[];
  players: PlayerState[];
  currentRound: number;
  isOpen: boolean;
  onClose: () => void;
}

interface ProjectedEffect {
  round: number;
  targetPlayerId: string;
  targetName: string;
  targetSin: string | null;
  sourcePlayerId: string;
  sourceName: string;
  effectType: string;
  baseValue: number;
  projectedValue: number;
  cardName: string;
  remainingRounds: number;
  isNew: boolean; // true if this is the first round it applies
}

const EFFECT_CONFIG: Record<string, { icon: React.ReactNode; label: string; colorClass: string; bgClass: string; borderClass: string }> = {
  damage: {
    icon: <Flame className="w-3 h-3" />,
    label: "DMG",
    colorClass: "text-red-400",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/20",
  },
  heal: {
    icon: <Heart className="w-3 h-3" />,
    label: "HEAL",
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/20",
  },
  shield: {
    icon: <Shield className="w-3 h-3" />,
    label: "SHIELD",
    colorClass: "text-cyan-400",
    bgClass: "bg-cyan-500/10",
    borderClass: "border-cyan-500/20",
  },
  debuff: {
    icon: <Skull className="w-3 h-3" />,
    label: "DEBUFF",
    colorClass: "text-purple-400",
    bgClass: "bg-purple-500/10",
    borderClass: "border-purple-500/20",
  },
};

function getPlayerName(players: PlayerState[], playerId: string): string {
  const player = players.find((p) => p.id === playerId || p.gamePlayerId === playerId);
  if (!player) return "???";
  return player.username + (isBot(player.id) ? " 🤖" : "");
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
  // Project all active effects into future rounds
  const projectedEffects: ProjectedEffect[] = [];

  for (const effect of activeEffects) {
    const expiresAtRound = effect.appliedAtRound + effect.durationRounds;

    // Project for each remaining round (including current)
    for (let round = currentRound; round <= expiresAtRound; round++) {
      const projectedValue = calculateEffectiveValue(
        effect.baseValue,
        round
      );
      // For debuffs, the actual damage is half
      const displayValue = effect.effectType === "debuff"
        ? Math.ceil(projectedValue / 2)
        : projectedValue;

      projectedEffects.push({
        round,
        targetPlayerId: effect.targetPlayerId,
        targetName: getPlayerName(players, effect.targetPlayerId),
        targetSin: getPlayerSin(players, effect.targetPlayerId),
        sourcePlayerId: effect.sourcePlayerId,
        sourceName: getPlayerName(players, effect.sourcePlayerId),
        effectType: effect.effectType,
        baseValue: effect.baseValue,
        projectedValue: displayValue,
        cardName: CARD_MAP[effect.cardId]?.name || "Unknown",
        remainingRounds: expiresAtRound - round,
        isNew: round === currentRound,
      });
    }
  }

  // Group by round
  const roundGroups = new Map<number, ProjectedEffect[]>();
  for (const pe of projectedEffects) {
    if (!roundGroups.has(pe.round)) {
      roundGroups.set(pe.round, []);
    }
    roundGroups.get(pe.round)!.push(pe);
  }

  // Sort rounds
  const sortedRounds = Array.from(roundGroups.keys()).sort((a, b) => a - b);

  // Calculate per-player net impact summary
  const playerSummary = new Map<string, { damage: number; healing: number; shielding: number }>();
  for (const pe of projectedEffects) {
    if (!playerSummary.has(pe.targetPlayerId)) {
      playerSummary.set(pe.targetPlayerId, { damage: 0, healing: 0, shielding: 0 });
    }
    const summary = playerSummary.get(pe.targetPlayerId)!;
    if (pe.effectType === "damage" || pe.effectType === "debuff") {
      summary.damage += pe.projectedValue;
    } else if (pe.effectType === "heal") {
      summary.healing += pe.projectedValue;
    } else if (pe.effectType === "shield") {
      summary.shielding += pe.projectedValue;
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
                <TrendingUp className="w-4 h-4 text-neon-cyan" />
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
              A forecast of everyone's upcoming misery. You're welcome.
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
                  const sinIconMap: Record<string, typeof Flame> = { wrath: Flame, sloth: Moon, greed: Coins, envy: Eye };
                  const sinColorMap: Record<string, string> = { wrath: "text-wrath", sloth: "text-sloth", greed: "text-greed", envy: "text-envy" };
                  const SinIcon = sinIconMap[sin || "wrath"] || Flame;
                  return (
                    <div
                      key={playerId}
                      className="flex items-center gap-2 text-[10px]"
                    >
                      <SinIcon className={`w-3 h-3 flex-shrink-0 ${sinColorMap[sin || "wrath"] || "text-red-400"}`} />
                      <span
                        className="text-foreground/80 truncate flex-1 font-medium"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {getPlayerName(players, playerId)}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {summary.damage > 0 && (
                          <span className="text-red-400 font-bold flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5" />-{summary.damage}
                          </span>
                        )}
                        {summary.healing > 0 && (
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                            <Heart className="w-2.5 h-2.5" />+{summary.healing}
                          </span>
                        )}
                        {summary.shielding > 0 && (
                          <span className="text-cyan-400 font-bold flex items-center gap-0.5">
                            <Shield className="w-2.5 h-2.5" />+{summary.shielding}
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
                <Zap className="w-8 h-8 text-muted-foreground/50 mb-3" />
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
                  const isFuture = round > currentRound;

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
                              ? "bg-neon-yellow/15 text-neon-yellow border border-neon-yellow/20"
                              : "bg-muted/30 text-muted-foreground/60 border border-border/10"
                          }`}
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          <ChevronRight className="w-2.5 h-2.5" />
                          R{round}
                          {isCurrentRound && " — NOW"}
                          {isFuture && ` — in ${round - currentRound} turn${round - currentRound > 1 ? "s" : ""}`}
                        </div>
                        <div className="flex-1 h-px bg-border/10" />
                        <span
                          className="text-[9px] text-muted-foreground/60"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          ×{round}
                        </span>
                      </div>

                      {/* Effect Rows */}
                      <div className="space-y-1.5 pl-2">
                        {effects.map((pe, i) => {
                          const config = EFFECT_CONFIG[pe.effectType] || EFFECT_CONFIG.damage;
                          const isNegative = pe.effectType === "damage" || pe.effectType === "debuff";

                          return (
                            <motion.div
                              key={`${pe.targetPlayerId}-${pe.effectType}-${pe.cardName}-${i}`}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.03 }}
                              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${config.bgClass} ${config.borderClass}`}
                            >
                              {/* Effect Icon */}
                              <div className={`flex-shrink-0 ${config.colorClass}`}>
                                {config.icon}
                              </div>

                              {/* Target & Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <span
                                    className="text-[10px] font-bold text-foreground/90 truncate"
                                    style={{ fontFamily: "var(--font-heading)" }}
                                  >
                                    {pe.targetName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-[8px] text-muted-foreground/70">
                                  <span>from {pe.sourceName}</span>
                                  <span>·</span>
                                  <span className="italic">{pe.cardName}</span>
                                </div>
                              </div>

                              {/* Value */}
                              <div className="flex-shrink-0 text-right">
                                <span
                                  className={`text-sm font-black ${config.colorClass}`}
                                  style={{ fontFamily: "var(--font-heading)" }}
                                >
                                  {isNegative ? "-" : "+"}{pe.projectedValue}
                                </span>
                                <div className="text-[7px] text-muted-foreground/60" style={{ fontFamily: "var(--font-heading)" }}>
                                  {pe.remainingRounds > 0
                                    ? `${pe.remainingRounds} more`
                                    : "LAST"}
                                </div>
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
            <p
              className="text-[8px] text-muted-foreground/60 text-center italic"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Values compound each round. Base × Round = Pain. Simple math, devastating consequences.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
