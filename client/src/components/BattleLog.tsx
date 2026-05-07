/**
 * BattleLog — Round-by-round timeline of all card plays
 *
 * Accessible via a toggle button in the top bar.
 * Shows each card play with player portrait, card art, target, and effect badges.
 * Desktop: right-side slide-in panel. Mobile: bottom sheet.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { CARD_MAP } from "@shared/cardData";
import { CARD_ART_URLS } from "@/lib/cardArtUrls";
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
import type { SinType, PlayerState, CardDefinition } from "@shared/gameTypes";
import { getCompoundTickValue } from "@shared/gameTypes";
import { getEffectIconUrl, SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";

/* ─── Effect Visual Config ─────────────────────────────────── */
const EFFECT_VISUALS: Record<string, { icon: string; color: string; label: string }> = {
  damage:              { icon: "⚔️", color: "#ef4444", label: "DMG" },
  self_damage:         { icon: "💥", color: "#f97316", label: "SELF-DMG" },
  heal_gain:           { icon: "💚", color: "#22c55e", label: "HEAL" },
  heal_steal:          { icon: "🩸", color: "#a855f7", label: "SIPHON" },
  shield_gain:         { icon: "🛡️", color: "#3b82f6", label: "SHIELD" },
  shield_steal:        { icon: "💎", color: "#06b6d4", label: "CRACK" },
  energy_gain:         { icon: "⚡", color: "#eab308", label: "ENERGY" },
  energy_steal:        { icon: "🔋", color: "#f59e0b", label: "DRAIN" },
  heal_block:          { icon: "🚫", color: "#dc2626", label: "CURSED" },
  shield_block:        { icon: "💔", color: "#9333ea", label: "SHATTER" },
  energy_block:        { icon: "🔇", color: "#6b7280", label: "EXHAUST" },
  affliction_amplify:  { icon: "☠️", color: "#dc2626", label: "INTENSIFY" },
  affliction_transfer: { icon: "↪️", color: "#f59e0b", label: "REDIRECT" },
};

const SIN_COLORS: Record<string, string> = {
  wrath: "#ef4444",
  sloth: "#a855f7",
  greed: "#eab308",
  envy: "#10b981",
  pride: "#f0f0f0",
  lust: "#ec4899",
  gluttony: "#b45309",
};

interface LogEntry {
  id?: string;
  player_id: string;
  action_type: string;
  action_data: {
    cardId?: string;
    targetPlayerId?: string;
    effects?: string[];
    compoundPattern?: string;
    energySpent?: number;
    energyRemaining?: number;
    cardCount?: number;
    [key: string]: unknown;
  };
  round_number: number;
  timestamp: string;
}

interface BattleLogProps {
  isOpen: boolean;
  onClose: () => void;
  logEntries: LogEntry[];
  players: PlayerState[];
  currentRound: number;
}

/** Parse effect description string like "damage 15 on enemy (fibonacci ×3r)" */
function parseEffectString(effectStr: string): { type: string; value: number; target: string } | null {
  const match = effectStr.match(/^(\w+)\s+(\d+)\s+on\s+(\w+)/);
  if (!match) return null;
  return { type: match[1], value: parseInt(match[2], 10), target: match[3] };
}

export default function BattleLog({ isOpen, onClose, logEntries, players, currentRound }: BattleLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group log entries by round, only show play_card entries
  const roundGroups = useMemo(() => {
    const cardPlays = logEntries.filter(e => e.action_type === "play_card");
    const groups: Map<number, LogEntry[]> = new Map();
    for (const entry of cardPlays) {
      const round = entry.round_number;
      if (!groups.has(round)) groups.set(round, []);
      groups.get(round)!.push(entry);
    }
    // Sort rounds descending (newest first)
    return Array.from(groups.entries()).sort((a, b) => b[0] - a[0]);
  }, [logEntries]);

  // Player lookup
  const playerMap = useMemo(() => {
    const map = new Map<string, PlayerState>();
    for (const p of players) {
      map.set(p.id, p);
      map.set(p.gamePlayerId, p);
    }
    return map;
  }, [players]);

  const getPlayer = (id: string): PlayerState | undefined => {
    return playerMap.get(id);
  };

  // Auto-scroll to top when new entries arrive
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [isOpen, logEntries.length]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel — Desktop: right side, Mobile: bottom sheet */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md md:max-w-lg flex flex-col"
            style={{
              background: "oklch(0.12 0.02 280 / 0.97)",
              borderLeft: "1px solid oklch(0.75 0.12 70 / 0.2)",
              boxShadow: "-8px 0 32px oklch(0 0 0 / 0.5)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{
                borderColor: "oklch(0.75 0.12 70 / 0.15)",
                background: "linear-gradient(180deg, oklch(0.15 0.03 280 / 0.8), transparent)",
              }}
            >
              <div className="flex items-center gap-2">
                <img
                  src="https://game-icons.net/icons/ffffff/000000/1x1/lorc/scroll-unfurled.svg"
                  alt="" aria-hidden="true"
                  className="w-5 h-5 opacity-70"
                />
                <h2
                  className="text-lg font-black tracking-wider text-candle"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  BATTLE LOG
                </h2>
                <span className="text-xs text-candle/50 font-medium ml-1">
                  {roundGroups.reduce((acc, [, entries]) => acc + entries.length, 0)} plays
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-candle/10 transition-colors text-candle/60 hover:text-candle"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4">
              {roundGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <img
                    src="https://game-icons.net/icons/ffffff/000000/1x1/delapouite/empty-hourglass.svg"
                    alt="Card illustration"
                    className="w-10 h-10 opacity-30 mb-3"
                  />
                  <p className="text-candle/40 text-sm" style={{ fontFamily: "var(--font-body)" }}>
                    No cards played yet.
                  </p>
                  <p className="text-candle/25 text-xs mt-1" style={{ fontFamily: "var(--font-body)" }}>
                    Card plays will appear here after each round resolves.
                  </p>
                </div>
              ) : (
                roundGroups.map(([round, entries]) => (
                  <RoundGroup
                    key={round}
                    round={round}
                    entries={entries}
                    getPlayer={getPlayer}
                    currentRound={currentRound}
                  />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Round Group ──────────────────────────────────────────── */
function RoundGroup({
  round,
  entries,
  getPlayer,
  currentRound,
}: {
  round: number;
  entries: LogEntry[];
  getPlayer: (id: string) => PlayerState | undefined;
  currentRound: number;
}) {
  const isCurrent = round === currentRound;

  return (
    <div className="space-y-1.5">
      {/* Round Header */}
      <div className="flex items-center gap-2 sticky top-0 z-10 py-1" style={{ background: "oklch(0.12 0.02 280 / 0.95)" }}>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wider"
          style={{
            fontFamily: "var(--font-heading)",
            background: isCurrent ? "oklch(0.75 0.12 70 / 0.15)" : "oklch(0.2 0.02 280 / 0.6)",
            color: isCurrent ? "oklch(0.85 0.12 70)" : "oklch(0.6 0.04 280)",
            border: `1px solid ${isCurrent ? "oklch(0.75 0.12 70 / 0.3)" : "oklch(0.3 0.02 280 / 0.4)"}`,
          }}
        >
          ROUND {round}
          {isCurrent && <span className="text-[10px] opacity-60 ml-0.5">(current)</span>}
        </div>
        <div className="flex-1 h-px" style={{ background: "oklch(0.3 0.02 280 / 0.3)" }} />
        <span className="text-[10px] text-candle/30 font-medium">
          {entries.length} play{entries.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Card Play Entries */}
      <div className="space-y-1">
        {entries.map((entry, idx) => (
          <CardPlayEntry
            key={entry.id || `${round}-${idx}`}
            entry={entry}
            getPlayer={getPlayer}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Card Play Entry ──────────────────────────────────────── */
function CardPlayEntry({
  entry,
  getPlayer,
}: {
  entry: LogEntry;
  getPlayer: (id: string) => PlayerState | undefined;
}) {
  const card = entry.action_data.cardId ? CARD_MAP[entry.action_data.cardId] : null;
  const caster = getPlayer(entry.player_id);
  const target = entry.action_data.targetPlayerId ? getPlayer(entry.action_data.targetPlayerId) : null;
  const cardArt = entry.action_data.cardId ? CARD_ART_URLS[entry.action_data.cardId] : null;
  const casterSin = (caster?.chosenSin || card?.sin || "wrath") as SinType;
  const sinColor = SIN_COLORS[casterSin] || "#ef4444";
  const [previewCard, setPreviewCard] = useState<CardDefinition | null>(null);
  const [previewMode, setPreviewMode] = useState<"hover" | "click">("hover");
  const cardNameRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect AOE/duo cards to show proper target label
  const hasAoe = card?.effects.some(e => e.targetMode === "aoe");
  const hasDuo = card?.effects.some(e => e.targetMode === "duo");
  const isSelfOnly = card?.effects.every(e => e.targetMode === "self");

  // Parse effect descriptions
  const effects = useMemo(() => {
    if (!entry.action_data.effects) return [];
    return (entry.action_data.effects as string[])
      .map(parseEffectString)
      .filter(Boolean) as { type: string; value: number; target: string }[];
  }, [entry.action_data.effects]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-2 p-2 rounded-lg transition-colors hover:bg-candle/5"
      style={{
        borderLeft: `2px solid ${sinColor}40`,
      }}
    >
      {/* Caster Portrait */}
      <div className="shrink-0 relative">
        <div
          className="w-8 h-8 rounded-full overflow-hidden ring-1"
          style={{
            outline: `1px solid ${sinColor}60`,
            boxShadow: `0 0 6px ${sinColor}30`,
          }}
        >
          {casterSin && FACTION_PORTRAITS[casterSin] ? (
            <img
              src={FACTION_PORTRAITS[casterSin]}
              alt="Faction portrait"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-candle/10" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Player → Card → Target line */}
        <div className="flex items-center gap-1 flex-wrap text-xs">
          <span
            className="font-bold truncate max-w-[80px]"
            style={{ color: sinColor, fontFamily: "var(--font-heading)" }}
          >
            {caster?.username || "Unknown"}
          </span>
          <span className="text-candle/30">played</span>

          {/* Card mini thumbnail + name — click/hover to preview */}
          <div
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer hover:ring-1 hover:ring-candle/30 transition-all"
            style={{ background: `${sinColor}15` }}
            ref={cardNameRef}
            onClick={(e) => { e.stopPropagation(); if (card) { setPreviewMode("click"); setPreviewCard(card); } }}
            onMouseEnter={() => {
              if (card && window.innerWidth >= 768) {
                hoverTimerRef.current = setTimeout(() => {
                  setPreviewMode("hover");
                  setPreviewCard(card);
                }, 150);
              }
            }}
            onMouseLeave={() => {
              if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
              if (previewMode === "hover") setPreviewCard(null);
            }}
          >
            {cardArt && (
              <img
                src={cardArt}
                alt="" aria-hidden="true"
                className="w-4 h-4 rounded-sm object-cover"
                loading="lazy"
              />
            )}
            <span className="font-semibold text-candle/90 truncate max-w-[100px]" style={{ fontFamily: "var(--font-body)" }}>
              {card?.name || "Unknown Card"}
            </span>
          </div>

          {/* Target label: AOE → "ALL ENEMIES", duo → "2 ENEMIES", self-only → nothing, single → target name */}
          {hasAoe ? (
            <>
              <span className="text-candle/30">on</span>
              <span
                className="font-semibold text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  background: "oklch(0.75 0.12 70 / 0.12)",
                  color: "oklch(0.85 0.12 70)",
                  border: "1px solid oklch(0.75 0.12 70 / 0.25)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                ALL ENEMIES
              </span>
            </>
          ) : hasDuo ? (
            <>
              <span className="text-candle/30">on</span>
              <span
                className="font-semibold text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  background: "oklch(0.75 0.12 70 / 0.12)",
                  color: "oklch(0.85 0.12 70)",
                  border: "1px solid oklch(0.75 0.12 70 / 0.25)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                2 ENEMIES
              </span>
            </>
          ) : !isSelfOnly && target && target.id !== caster?.id ? (
            <>
              <span className="text-candle/30">on</span>
              <span
                className="font-semibold truncate max-w-[80px]"
                style={{
                  color: SIN_COLORS[(target.chosenSin || "wrath") as string] || "#888",
                  fontFamily: "var(--font-heading)",
                }}
              >
                {target.username}
              </span>
            </>
          ) : null}
        </div>

        {/* Effect Badges */}
        {effects.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {effects.map((eff, i) => {
              const visual = EFFECT_VISUALS[eff.type];
              if (!visual) return null;
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold"
                  style={{
                    background: `${visual.color}18`,
                    color: visual.color,
                    border: `1px solid ${visual.color}30`,
                  }}
                >
                  <span className="text-[9px]">{visual.icon}</span>
                  {visual.label} {eff.value}
                </span>
              );
            })}
            {entry.action_data.compoundPattern && (
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
                style={{
                  background: "oklch(0.3 0.02 280 / 0.4)",
                  color: "oklch(0.6 0.04 280)",
                  border: "1px solid oklch(0.3 0.02 280 / 0.5)",
                }}
              >
                {entry.action_data.compoundPattern}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Energy cost badge */}
      {card && (
        <div className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black" style={{
          background: "oklch(0.75 0.15 70 / 0.15)",
          color: "oklch(0.8 0.15 70)",
          border: "1px solid oklch(0.75 0.15 70 / 0.3)",
        }}>
          {card.cost}
        </div>
      )}

      {/* Card Preview Popup — hover uses positioned tooltip, click uses full-screen */}
      <AnimatePresence>
        {previewCard && previewMode === "click" && (
          <CardPreviewPopup card={previewCard} onClose={() => setPreviewCard(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {previewCard && previewMode === "hover" && cardNameRef.current && (
          <CardHoverTooltip card={previewCard} anchorEl={cardNameRef.current} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}/* ─── Card Hover Tooltip (positioned near anchor) ─────────── */
function CardHoverTooltip({ card, anchorEl }: { card: CardDefinition; anchorEl: HTMLElement }) {
  const sinColor = SIN_COLORS[card.sin] || "#ef4444";
  const art = CARD_ART_URLS[card.id];
  const sinIcon = SIN_ARCHETYPE_ICONS[card.sin];
  const rect = anchorEl.getBoundingClientRect();

  // Position to the left of the battle log panel, vertically centered on the anchor
  const top = Math.max(16, Math.min(rect.top - 100, window.innerHeight - 380));
  const right = window.innerWidth - rect.left + 12;

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.12 }}
      className="fixed z-[90] pointer-events-none"
      style={{ top, right, width: 260 }}
    >
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "oklch(0.12 0.02 280)",
          border: `2px solid ${sinColor}50`,
          boxShadow: `0 0 30px ${sinColor}20, 0 8px 32px oklch(0 0 0 / 0.6)`,
        }}
      >
        {/* Card Art */}
        {art && (
          <div className="h-[140px] relative overflow-hidden">
            <img src={art} alt={card.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 40%, oklch(0.12 0.02 280) 100%)` }} />
          </div>
        )}

        <div className="p-3 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-candle" style={{ fontFamily: "var(--font-heading)" }}>{card.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                {sinIcon && <img src={sinIcon} alt="" aria-hidden="true" className="w-3.5 h-3.5" />}
                <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: sinColor }}>{card.sin}</span>
                <span className="text-[10px] text-candle/40 uppercase">{card.tier}</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black" style={{
              background: `${sinColor}20`, color: sinColor, border: `2px solid ${sinColor}50`,
            }}>
              {card.cost}
            </div>
          </div>

          {/* Effects */}
          <div className="space-y-1.5">
            {card.effects.map((eff, i) => {
              const iconUrl = getEffectIconUrl(eff.type, card.sin);
              return (
                <div key={i} className="flex items-start gap-1.5">
                  {iconUrl ? (
                    <img src={iconUrl} alt="" aria-hidden="true" className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <span className="text-xs mt-0.5">✦</span>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold" style={{ color: sinColor }}>
                        {EFFECT_NAMES[eff.type] || eff.type}
                      </span>
                      <span className="text-xs font-black text-candle">
                        {eff.duration > 1
                          ? `${getCompoundTickValue(eff.baseValue, card.compoundPattern, 0)}→${getCompoundTickValue(eff.baseValue, card.compoundPattern, eff.duration - 1)}`
                          : eff.baseValue
                        }
                      </span>
                      {eff.targetMode && eff.targetMode !== "single" && (
                        <span className="text-[9px] text-candle/40 uppercase">{eff.targetMode}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-candle/45 leading-snug">{EFFECT_DESCS[eff.type] || ""}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Description */}
          <p className="text-[10px] text-candle/35 italic leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
            {card.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Card Preview Popup (full-screen, for click/mobile) ──── */
const EFFECT_NAMES: Record<string, string> = {
  damage: "Hurt", self_damage: "Backlash", heal_gain: "Mend", heal_steal: "Siphon Life",
  shield_gain: "Ward", shield_steal: "Crack Ward", energy_gain: "Recharge", energy_steal: "Drain",
  heal_block: "Cursed", shield_block: "Shatter", energy_block: "Exhaust",
  affliction_amplify: "Intensify", affliction_transfer: "Redirect", discard_burn: "Devour",
  energy_regen: "Sustain", draw_boost: "Insight", draw_reduction: "Fog",
};

const EFFECT_DESCS: Record<string, string> = {
  damage: "Deals direct damage to target HP",
  self_damage: "Deals damage to yourself as a cost",
  heal_gain: "Restores your HP",
  heal_steal: "Steals HP from target, healing you",
  shield_gain: "Adds protective shield to yourself",
  shield_steal: "Steals shield from the target",
  energy_gain: "Restores your corruption energy",
  energy_steal: "Steals energy from the target",
  heal_block: "Prevents target from healing",
  shield_block: "Prevents target from gaining shield",
  energy_block: "Prevents target from gaining energy",
  affliction_amplify: "Amplifies all active afflictions",
  affliction_transfer: "Transfers your afflictions to target",
  discard_burn: "Forces target to discard cards",
  energy_regen: "Regenerates energy over multiple rounds",
  draw_boost: "Draw extra cards next round",
  draw_reduction: "Target draws fewer cards next round",
};

const PATTERN_LABELS: Record<string, string> = {
  standard: "◆ Steady", aggressive: "🔥 Volatile", slowburn: "⌛ Patient",
};

function CardPreviewPopup({ card, onClose }: { card: CardDefinition; onClose: () => void }) {
  const art = CARD_ART_URLS[card.id];
  const sinColor = SIN_COLORS[card.sin] || "#ef4444";
  const sinIcon = SIN_ARCHETYPE_ICONS[card.sin];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative w-[280px] rounded-xl overflow-hidden"
        style={{
          background: "oklch(0.12 0.02 280)",
          border: `2px solid ${sinColor}50`,
          boxShadow: `0 0 40px ${sinColor}20`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card Art */}
        {art && (
          <div className="h-[180px] relative overflow-hidden">
            <img src={art} alt={card.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 50%, oklch(0.12 0.02 280) 100%)` }} />
          </div>
        )}

        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-candle" style={{ fontFamily: "var(--font-heading)" }}>{card.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                {sinIcon && <img src={sinIcon} alt="" aria-hidden="true" className="w-4 h-4" />}
                <span className="text-xs uppercase tracking-wider font-bold" style={{ color: sinColor }}>{card.sin}</span>
                <span className="text-xs text-candle/40 uppercase">{card.tier}</span>
                <span className="text-xs text-candle/40">{PATTERN_LABELS[card.compoundPattern] || card.compoundPattern}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-black" style={{
              background: `${sinColor}20`, color: sinColor, border: `2px solid ${sinColor}50`,
            }}>
              {card.cost}
            </div>
          </div>

          {/* Effects */}
          <div className="space-y-2">
            {card.effects.map((eff, i) => {
              const iconUrl = getEffectIconUrl(eff.type, card.sin);
              return (
                <div key={i} className="flex items-start gap-2">
                  {iconUrl ? (
                    <img src={iconUrl} alt="Card effect icon" className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <span className="text-sm mt-0.5">✦</span>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: sinColor }}>
                        {EFFECT_NAMES[eff.type] || eff.type}
                      </span>
                      <span className="text-sm font-black text-candle">
                        {eff.duration > 1
                          ? `${getCompoundTickValue(eff.baseValue, card.compoundPattern, 0)} → ${getCompoundTickValue(eff.baseValue, card.compoundPattern, 1)} → ${getCompoundTickValue(eff.baseValue, card.compoundPattern, eff.duration - 1)}`
                          : eff.baseValue
                        }
                      </span>
                      {eff.targetMode && eff.targetMode !== "single" && (
                        <span className="text-[10px] text-candle/40 uppercase">{eff.targetMode}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-candle/50 leading-snug">{EFFECT_DESCS[eff.type] || ""}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Description */}
          <p className="text-xs text-candle/40 italic leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
            {card.description}
          </p>
        </div>

        {/* Close hint */}
        <div className="text-center pb-2">
          <span className="text-[10px] text-candle/25">tap anywhere to close</span>
        </div>
      </div>
    </motion.div>
  );
}
