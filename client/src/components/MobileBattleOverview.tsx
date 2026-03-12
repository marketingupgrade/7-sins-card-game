/**
 * MobileBattleOverview — Scrollable center panel for mobile game board
 *
 * Fills the empty center area with useful game state info:
 * - Per-player affliction summary (active effects with icons)
 * - Recent action feed (last 5 actions)
 * - Round info badge
 *
 * Replaces the empty void that existed before.
 */
import { motion, AnimatePresence } from "framer-motion";
import { memo, useState } from "react";
import type { PlayerState, SinType, ActiveEffect } from "@shared/gameTypes";
import { getCompoundTickValue, CompoundPattern } from "@shared/gameTypes";
import { CARD_MAP } from "@shared/cardData";
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
import { ICON_URLS } from "@/lib/assetUrls";
import { getEffectIconUrl } from "@/lib/iconUtils";
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

/** Effect type display config */
const EFFECT_CONFIG: Record<string, { icon: string; color: string; label: string; sign: string }> = {
  damage: { icon: "⚔️", color: "oklch(0.70 0.22 25)", label: "Damage", sign: "-" },
  damage_all: { icon: "💥", color: "oklch(0.70 0.22 25)", label: "AoE Dmg", sign: "-" },
  self_damage: { icon: "🩸", color: "oklch(0.55 0.18 25)", label: "Self Dmg", sign: "-" },
  heal: { icon: "💚", color: "oklch(0.65 0.18 155)", label: "Heal", sign: "+" },
  shield: { icon: "🛡️", color: "oklch(0.70 0.15 200)", label: "Shield", sign: "+" },
  debuff: { icon: "☠️", color: "oklch(0.65 0.15 290)", label: "Debuff", sign: "" },
  energy_drain: { icon: "⚡", color: "oklch(0.65 0.18 60)", label: "Drain", sign: "-" },
  energy_gain: { icon: "✦", color: "oklch(0.70 0.15 85)", label: "Energy+", sign: "+" },
  buff: { icon: "↑", color: "oklch(0.65 0.12 85)", label: "Buff", sign: "+" },
};


/** Summarize effects for a player into grouped totals */
function summarizeEffects(effects: ActiveEffect[]) {
  const summary: Record<string, { total: number; count: number; sources: string[] }> = {};
  for (const eff of effects) {
    const pattern: CompoundPattern = eff.compoundPattern || "standard";
    const val = Math.round(getCompoundTickValue(eff.baseValue, pattern, eff.currentTick || 0));
    if (!summary[eff.effectType]) {
      summary[eff.effectType] = { total: 0, count: 0, sources: [] };
    }
    summary[eff.effectType].total += val;
    summary[eff.effectType].count += 1;
    const cardName = CARD_MAP[eff.cardId]?.name || "Unknown";
    if (!summary[eff.effectType].sources.includes(cardName)) {
      summary[eff.effectType].sources.push(cardName);
    }
  }
  return summary;
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
      <div className="flex items-center justify-center gap-2 py-1">
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full"
          style={{
            background: "oklch(0.12 0.02 70 / 0.8)",
            border: "1px solid oklch(0.75 0.12 70 / 0.15)",
          }}
        >
          <span className="text-xs font-bold text-candle" style={{ fontFamily: "var(--font-heading)" }}>
            R{currentRound}/{maxRounds}
          </span>
          <span className="text-[10px] text-muted-foreground/60">
            {alivePlayers.length} alive
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1.5 py-1">
        {/* Per-player affliction cards */}
        {players.filter(p => p.isAlive).map((player) => {
          const playerEffects = activeEffects.filter(e => e.targetPlayerId === player.gamePlayerId);
          const summary = summarizeEffects(playerEffects);
          const effectTypes = Object.keys(summary);
          const isMe = player.id === currentPlayerId;
          const isExpanded = expandedPlayer === player.gamePlayerId;
          const sinColor = getSinOklchColor(player.chosenSin as string);

          return (
            <motion.button
              key={player.gamePlayerId}
              onClick={() => setExpandedPlayer(isExpanded ? null : player.gamePlayerId)}
              className="w-full text-left rounded-lg overflow-hidden touch-manipulation"
              style={{
                background: "oklch(0.10 0.02 70 / 0.7)",
                border: `1px solid ${isMe ? "oklch(0.75 0.12 70 / 0.25)" : "oklch(0.3 0.02 280 / 0.3)"}`,
              }}
              layout
            >
              {/* Compact row: avatar + name + effect icons */}
              <div className="flex items-center gap-2 px-2 py-1.5">
                {/* Mini avatar */}
                <div
                  className="w-6 h-6 rounded-full overflow-hidden border flex-shrink-0"
                  style={{ borderColor: sinColor }}
                >
                  <img
                    src={FACTION_PORTRAITS[player.chosenSin as SinType]}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Name */}
                <span
                  className="text-[11px] font-bold text-foreground/90 truncate flex-shrink-0"
                  style={{ fontFamily: "var(--font-heading)", maxWidth: 70 }}
                >
                  {player.username}{isMe ? " (You)" : ""}
                </span>
                {/* Effect summary icons */}
                <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto">
                  {effectTypes.length === 0 ? (
                    <span className="text-[10px] text-muted-foreground/40 italic">No effects</span>
                  ) : (
                    effectTypes.map((type) => {
                      const cfg = EFFECT_CONFIG[type];
                      if (!cfg) return null;
                      return (
                        <div key={type} className="flex items-center gap-0.5 flex-shrink-0">
                          <span className="text-[10px]">{cfg.icon}</span>
                          <span
                            className="text-[11px] font-black"
                            style={{ fontFamily: "var(--font-heading)", color: cfg.color }}
                          >
                            {cfg.sign}{summary[type].total}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
                {/* Expand indicator */}
                {effectTypes.length > 0 && (
                  <motion.span
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    className="text-[10px] text-muted-foreground/40 flex-shrink-0"
                  >
                    ▼
                  </motion.span>
                )}
              </div>

              {/* Expanded detail */}
              <AnimatePresence>
                {isExpanded && effectTypes.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-2 pb-2 pt-0.5 space-y-1 border-t border-foreground/5">
                      {effectTypes.map((type) => {
                        const cfg = EFFECT_CONFIG[type];
                        if (!cfg) return null;
                        const data = summary[type];
                        return (
                          <div key={type} className="flex items-start gap-2">
                            <span className="text-xs mt-0.5">{cfg.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span
                                  className="text-[11px] font-bold"
                                  style={{ fontFamily: "var(--font-heading)", color: cfg.color }}
                                >
                                  {cfg.label}: {cfg.sign}{data.total}
                                </span>
                                {data.count > 1 && (
                                  <span className="text-[9px] text-muted-foreground/50">
                                    ({data.count} sources)
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {data.sources.map((src, i) => (
                                  <span key={i} className="text-[9px] text-foreground/40">
                                    {src}{i < data.sources.length - 1 ? "," : ""}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}

        {/* Action feed — last 5 actions */}
        {actionFeed.length > 0 && (
          <div
            className="rounded-lg px-2 py-1.5"
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
