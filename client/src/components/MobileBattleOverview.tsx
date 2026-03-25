/**
 * MobileBattleOverview — Scrollable center panel for mobile game board
 *
 * Shows per-player affliction breakdown in a clear table-like layout:
 * - Each player gets a card with avatar, name, and effect rows
 * - Effects are always visible (no tap-to-expand for basic info)
 * - Tap a player card to see per-round projections and source details
 * - Action feed at the bottom
 */
import { motion, AnimatePresence } from "framer-motion";
import { memo, useState } from "react";
import type { PlayerState, SinType, ActiveEffect, CompoundPattern } from "@shared/gameTypes";
import { getCompoundTickValue } from "@shared/gameTypes";
import { CARD_MAP } from "@shared/cardData";
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
import { getSinOklchColor } from "@/lib/sinColors";

interface ActionFeedEntry {
  id: string;
  text: string;
}

interface MobileBattleOverviewProps {
  players: PlayerState[];
  currentPlayerId: string;
  activeEffects: ActiveEffect[];
  currentRound: number;
  maxRounds: number;
  actionFeed: ActionFeedEntry[];
  alivePlayers: PlayerState[];
}

/** Complete effect type display config */
const EFFECT_CONFIG: Record<string, { emoji: string; color: string; label: string; sign: string; category: "harmful" | "beneficial" | "neutral" }> = {
  damage:              { emoji: "⚔️", color: "oklch(0.70 0.22 25)",  label: "DMG",         sign: "-", category: "harmful" },
  self_damage:         { emoji: "🩸", color: "oklch(0.55 0.18 25)",  label: "Self",        sign: "-", category: "harmful" },
  heal_gain:           { emoji: "💚", color: "oklch(0.65 0.18 155)", label: "Heal",        sign: "+", category: "beneficial" },
  heal_steal:          { emoji: "💜", color: "oklch(0.60 0.22 350)", label: "Steal HP",    sign: "-", category: "harmful" },
  heal_block:          { emoji: "🚫", color: "oklch(0.55 0.15 25)",  label: "No Heal",     sign: "",  category: "harmful" },
  shield_gain:         { emoji: "🛡️", color: "oklch(0.70 0.15 200)", label: "Shield",      sign: "+", category: "beneficial" },
  shield_steal:        { emoji: "🔰", color: "oklch(0.60 0.15 200)", label: "Steal Shld",  sign: "-", category: "harmful" },
  shield_block:        { emoji: "💔", color: "oklch(0.55 0.15 200)", label: "No Shield",   sign: "",  category: "harmful" },
  energy_gain:         { emoji: "✦",  color: "oklch(0.70 0.15 85)",  label: "Energy+",     sign: "+", category: "beneficial" },
  energy_steal:        { emoji: "⚡", color: "oklch(0.65 0.18 60)",  label: "Steal NRG",   sign: "-", category: "harmful" },
  energy_block:        { emoji: "🔒", color: "oklch(0.55 0.12 60)",  label: "No Energy",   sign: "",  category: "harmful" },
  affliction_amplify:  { emoji: "📈", color: "oklch(0.65 0.15 290)", label: "Amplify",     sign: "×", category: "harmful" },
  affliction_transfer: { emoji: "🔄", color: "oklch(0.60 0.12 290)", label: "Transfer",    sign: "",  category: "neutral" },
};

/** Summarize effects for a player into grouped totals */
function summarizeEffects(effects: ActiveEffect[], currentRound: number) {
  const summary: Record<string, {
    total: number;
    count: number;
    sources: { name: string; value: number; ticksLeft: number; pattern: CompoundPattern; currentTick: number; durationRounds: number; baseValue: number }[];
  }> = {};

  for (const eff of effects) {
    const pattern: CompoundPattern = eff.compoundPattern || "standard";
    const val = Math.round(getCompoundTickValue(eff.baseValue, pattern, eff.currentTick || 0));
    if (!summary[eff.effectType]) {
      summary[eff.effectType] = { total: 0, count: 0, sources: [] };
    }
    summary[eff.effectType].total += val;
    summary[eff.effectType].count += 1;
    const cardName = CARD_MAP[eff.cardId]?.name || "Unknown";
    const ticksLeft = (eff.durationRounds || 1) - (eff.currentTick || 0);
    summary[eff.effectType].sources.push({
      name: cardName,
      value: val,
      ticksLeft,
      pattern,
      currentTick: eff.currentTick || 0,
      durationRounds: eff.durationRounds || 1,
      baseValue: eff.baseValue,
    });
  }
  return summary;
}

/** Get upcoming round projections */
function getUpcomingValues(baseValue: number, pattern: CompoundPattern, currentTick: number, duration: number): number[] {
  const upcoming: number[] = [];
  for (let t = currentTick; t < duration && upcoming.length < 3; t++) {
    upcoming.push(Math.round(getCompoundTickValue(baseValue, pattern, t)));
  }
  return upcoming;
}

export const MobileBattleOverview = memo(function MobileBattleOverview({
  players,
  currentPlayerId,
  activeEffects,
  currentRound,
  maxRounds,
  actionFeed,
  alivePlayers,
}: MobileBattleOverviewProps) {
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  return (
    <div className="flex-1 flex flex-col min-h-0 px-2 py-1 overflow-hidden">
      {/* Round badge */}
      <div className="flex items-center justify-between py-1 px-1">
        <span className="text-xs font-bold text-candle" style={{ fontFamily: "var(--font-heading)" }}>
          R{currentRound}/{maxRounds}
        </span>
        <span className="text-[10px] text-muted-foreground/60">
          {alivePlayers.length} alive
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 py-1">
        {/* Per-player affliction cards */}
        {players.filter(p => p.isAlive).map((player) => {
          const playerEffects = activeEffects.filter(e => e.targetPlayerId === player.gamePlayerId);
          const summary = summarizeEffects(playerEffects, currentRound);
          const effectTypes = Object.keys(summary);
          const isMe = player.id === currentPlayerId;
          const isExpanded = expandedPlayer === player.gamePlayerId;
          const sinColor = getSinOklchColor(player.chosenSin as string);

          const harmfulTypes = effectTypes.filter(t => EFFECT_CONFIG[t]?.category === "harmful");
          const beneficialTypes = effectTypes.filter(t => EFFECT_CONFIG[t]?.category !== "harmful");

          return (
            <motion.div
              key={player.gamePlayerId}
              className="rounded-lg overflow-hidden"
              style={{
                background: "oklch(0.10 0.02 70 / 0.7)",
                border: `1px solid ${isMe ? "oklch(0.75 0.12 70 / 0.25)" : "oklch(0.3 0.02 280 / 0.3)"}`,
              }}
              layout
            >
              {/* Player header — always visible */}
              <button
                onClick={() => effectTypes.length > 0 && setExpandedPlayer(isExpanded ? null : player.gamePlayerId)}
                className="w-full text-left px-2.5 py-1.5 touch-manipulation"
              >
                <div className="flex items-center gap-2">
                  {/* Avatar */}
                  <div
                    className="w-7 h-7 rounded-full overflow-hidden border-2 flex-shrink-0"
                    style={{ borderColor: sinColor }}
                  >
                    <img
                      src={FACTION_PORTRAITS[player.chosenSin as SinType]}
                      alt="Faction portrait"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  {/* Name + YOU badge */}
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span
                      className="text-xs font-bold text-foreground/90 truncate"
                      style={{ fontFamily: "var(--font-heading)", maxWidth: 120 }}
                    >
                      {player.username}
                    </span>
                    {isMe && (
                      <span
                        className="text-[8px] font-bold px-1 py-0.5 rounded uppercase flex-shrink-0"
                        style={{
                          background: "oklch(0.75 0.12 70 / 0.2)",
                          color: "oklch(0.75 0.12 70)",
                          fontFamily: "var(--font-heading)",
                        }}
                      >
                        You
                      </span>
                    )}
                  </div>
                  {/* Expand indicator */}
                  {effectTypes.length > 0 && (
                    <motion.span
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      className="text-xs text-muted-foreground/40 flex-shrink-0"
                    >
                      ▼
                    </motion.span>
                  )}
                </div>

                {/* Effect summary — always visible, one row per effect type */}
                {effectTypes.length === 0 ? (
                  <div className="mt-1 ml-9">
                    <span className="text-[10px] text-muted-foreground/40 italic">No active effects</span>
                  </div>
                ) : (
                  <div className="mt-1.5 ml-9 flex flex-wrap gap-x-3 gap-y-1">
                    {effectTypes.map((type) => {
                      const cfg = EFFECT_CONFIG[type];
                      if (!cfg) return null;
                      const data = summary[type];
                      return (
                        <div
                          key={type}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded"
                          style={{
                            background: `color-mix(in oklch, ${cfg.color} 10%, transparent)`,
                            border: `1px solid color-mix(in oklch, ${cfg.color} 20%, transparent)`,
                          }}
                        >
                          <span className="text-[11px]">{cfg.emoji}</span>
                          <span
                            className="text-[11px] font-black"
                            style={{ fontFamily: "var(--font-heading)", color: cfg.color }}
                          >
                            {cfg.sign}{data.total}
                          </span>
                          <span
                            className="text-[9px] font-bold uppercase opacity-60"
                            style={{ fontFamily: "var(--font-heading)", color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                          {data.count > 1 && (
                            <span className="text-[8px] text-muted-foreground/50">×{data.count}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </button>

              {/* Expanded detail — per-source breakdown with upcoming rounds */}
              <AnimatePresence>
                {isExpanded && effectTypes.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-2.5 pb-2.5 pt-1 space-y-2 border-t border-foreground/5">
                      {/* Harmful effects */}
                      {harmfulTypes.length > 0 && (
                        <div>
                          <span
                            className="text-[9px] font-bold uppercase tracking-wider"
                            style={{ fontFamily: "var(--font-heading)", color: "oklch(0.65 0.18 25 / 0.7)" }}
                          >
                            ⚠ Incoming Damage
                          </span>
                          {harmfulTypes.map((type) => {
                            const cfg = EFFECT_CONFIG[type]!;
                            const data = summary[type];
                            return (
                              <div key={type} className="mt-1.5">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="text-sm">{cfg.emoji}</span>
                                  <span
                                    className="text-xs font-bold"
                                    style={{ fontFamily: "var(--font-heading)", color: cfg.color }}
                                  >
                                    {cfg.label}: {cfg.sign}{data.total}/round
                                  </span>
                                </div>
                                {/* Per-source rows */}
                                {data.sources.map((src, i) => {
                                  const upcoming = getUpcomingValues(src.baseValue, src.pattern, src.currentTick, src.durationRounds);
                                  return (
                                    <div
                                      key={i}
                                      className="ml-6 mb-1 rounded px-2 py-1"
                                      style={{
                                        background: "oklch(0.08 0.01 70 / 0.5)",
                                        border: "1px solid oklch(0.2 0.02 280 / 0.2)",
                                      }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-[11px] text-foreground/70 font-medium">{src.name}</span>
                                        <span className="text-[9px] text-muted-foreground/50">
                                          {src.ticksLeft}r left
                                        </span>
                                      </div>
                                      {/* Upcoming round values */}
                                      <div className="flex items-center gap-1.5 mt-1">
                                        {upcoming.map((val, ri) => (
                                          <div
                                            key={ri}
                                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded"
                                            style={{
                                              background: ri === 0
                                                ? `color-mix(in oklch, ${cfg.color} 20%, transparent)`
                                                : "oklch(0.12 0.01 70 / 0.5)",
                                              border: ri === 0
                                                ? `1px solid color-mix(in oklch, ${cfg.color} 30%, transparent)`
                                                : "1px solid oklch(0.25 0.02 280 / 0.2)",
                                            }}
                                          >
                                            <span className="text-[8px] text-muted-foreground/50">R{currentRound + ri}</span>
                                            <span
                                              className="text-[10px] font-black"
                                              style={{
                                                fontFamily: "var(--font-heading)",
                                                color: ri === 0 ? cfg.color : "oklch(0.6 0.05 70)",
                                              }}
                                            >
                                              {cfg.sign}{val}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Beneficial effects */}
                      {beneficialTypes.length > 0 && (
                        <div>
                          <span
                            className="text-[9px] font-bold uppercase tracking-wider"
                            style={{ fontFamily: "var(--font-heading)", color: "oklch(0.65 0.18 155 / 0.7)" }}
                          >
                            ✦ Active Buffs
                          </span>
                          {beneficialTypes.map((type) => {
                            const cfg = EFFECT_CONFIG[type]!;
                            const data = summary[type];
                            return (
                              <div key={type} className="mt-1.5">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="text-sm">{cfg.emoji}</span>
                                  <span
                                    className="text-xs font-bold"
                                    style={{ fontFamily: "var(--font-heading)", color: cfg.color }}
                                  >
                                    {cfg.label}: {cfg.sign}{data.total}/round
                                  </span>
                                </div>
                                {data.sources.map((src, i) => {
                                  const upcoming = getUpcomingValues(src.baseValue, src.pattern, src.currentTick, src.durationRounds);
                                  return (
                                    <div
                                      key={i}
                                      className="ml-6 mb-1 rounded px-2 py-1"
                                      style={{
                                        background: "oklch(0.08 0.01 70 / 0.5)",
                                        border: "1px solid oklch(0.2 0.02 280 / 0.2)",
                                      }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-[11px] text-foreground/70 font-medium">{src.name}</span>
                                        <span className="text-[9px] text-muted-foreground/50">
                                          {src.ticksLeft}r left
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5 mt-1">
                                        {upcoming.map((val, ri) => (
                                          <div
                                            key={ri}
                                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded"
                                            style={{
                                              background: ri === 0
                                                ? `color-mix(in oklch, ${cfg.color} 20%, transparent)`
                                                : "oklch(0.12 0.01 70 / 0.5)",
                                              border: ri === 0
                                                ? `1px solid color-mix(in oklch, ${cfg.color} 30%, transparent)`
                                                : "1px solid oklch(0.25 0.02 280 / 0.2)",
                                            }}
                                          >
                                            <span className="text-[8px] text-muted-foreground/50">R{currentRound + ri}</span>
                                            <span
                                              className="text-[10px] font-black"
                                              style={{
                                                fontFamily: "var(--font-heading)",
                                                color: ri === 0 ? cfg.color : "oklch(0.6 0.05 70)",
                                              }}
                                            >
                                              {cfg.sign}{val}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Action feed — last 5 actions */}
        {actionFeed.length > 0 && (
          <div
            className="rounded-lg px-2.5 py-1.5"
            style={{
              background: "oklch(0.10 0.02 70 / 0.5)",
              border: "1px solid oklch(0.3 0.02 280 / 0.2)",
            }}
          >
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[10px] font-bold text-candle/50 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                Battle Log
              </span>
            </div>
            <div className="space-y-0.5">
              {actionFeed.slice(-5).map((entry) => (
                <p
                  key={entry.id}
                  className="text-[10px] text-foreground/50 leading-tight"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {entry.text}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default MobileBattleOverview;
