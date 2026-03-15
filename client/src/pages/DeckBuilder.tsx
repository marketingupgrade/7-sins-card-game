/**
 * DeckBuilder — Custom Deck Construction Page (v2)
 *
 * Players build custom 30-card decks from their chosen faction's card pool.
 * - Smaller card grid with hover/click card detail popup
 * - Functional filters: tier, effect type, cost range, sort
 * - Click-to-add/remove cards (max 30)
 * - Save/load decks (tRPC API for logged-in users, localStorage for guests)
 * - Deck stats, mana curve chart, auto-fill
 * - Dark gothic cathedral branding
 */

import { useState, useMemo, useCallback, useEffect, useRef, memo, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_CARDS } from "@shared/cardData";
import { CARD_ART_URLS } from "@/lib/cardArtUrls";
import { SIN_ARCHETYPE_ICONS, getEffectIconUrl } from "@/lib/iconUtils";
import {
  CardDefinition,
  SinType,
  CardTier,
  EffectType,
  CompoundPattern,
  getCompoundTickValue,
} from "@shared/gameTypes";
import { useSupabaseAuth } from "@/contexts/AuthContext";
import { getCardTargetMode } from "@/lib/targetModeUtils";
import { STRATEGIES, autoFillByStrategy, type StrategyType } from "@/lib/deckStrategies";

// ─── Constants ──────────────────────────────────────────────
const MAX_DECK_SIZE = 30;
const GUEST_MAX_DECKS = 1;
const SINS: SinType[] = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];

const SIN_COLORS: Record<SinType, string> = {
  wrath: "#ef4444", sloth: "#a855f7", greed: "#eab308",
  envy: "#22c55e", pride: "#e2e2e2", lust: "#ec4899", gluttony: "#f97316",
};

const SIN_LABELS: Record<SinType, string> = {
  wrath: "Wrath", sloth: "Sloth", greed: "Greed",
  envy: "Envy", pride: "Pride", lust: "Lust", gluttony: "Gluttony",
};

const SIN_TAGLINES: Record<SinType, string> = {
  wrath: "Burn brighter. Burn everything.",
  sloth: "Why rush? Everything dies eventually.",
  greed: "Everything has a price. Yours is higher.",
  envy: "If I can't have it, neither can you.",
  pride: "Kneel. Or be made to kneel.",
  lust: "Come closer. It only hurts at first.",
  gluttony: "More. Always more. Never enough.",
};

const TIER_COLORS: Record<CardTier, string> = {
  common: "#9ca3af", rare: "#60a5fa", epic: "#c084fc",
};

const EFFECT_LABELS: Record<string, string> = {
  damage: "Damage", self_damage: "Self Damage", heal_gain: "Heal",
  heal_steal: "Heal Steal", heal_block: "Heal Block", shield_gain: "Shield",
  shield_steal: "Shield Steal", shield_block: "Shield Block",
  energy_gain: "Energy Gain", energy_steal: "Energy Steal",
  energy_block: "Energy Block", affliction_amplify: "Affliction Amp",
  affliction_transfer: "Affliction Transfer", discard_burn: "Discard Burn",
  energy_regen: "Energy Regen", draw_boost: "Draw Boost",
  draw_reduction: "Draw Reduction",
};

const EFFECT_DESCRIPTIONS: Record<string, string> = {
  damage: "Deals direct damage to the target's HP",
  self_damage: "Deals damage to yourself as a cost",
  heal_gain: "Restores HP to yourself",
  heal_steal: "Steals HP from the target, healing you",
  heal_block: "Prevents the target from healing",
  shield_gain: "Adds a protective shield to yourself",
  shield_steal: "Steals shield from the target",
  shield_block: "Prevents the target from gaining shield",
  energy_gain: "Restores your energy (corruption)",
  energy_steal: "Steals energy from the target",
  energy_block: "Prevents the target from gaining energy",
  affliction_amplify: "Amplifies all active afflictions on the target",
  affliction_transfer: "Transfers your afflictions to the target",
  discard_burn: "Forces the target to discard cards",
  energy_regen: "Regenerates energy over multiple rounds",
  draw_boost: "Draw extra cards next round",
  draw_reduction: "Target draws fewer cards next round",
};

const EFFECT_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Effects" },
  { value: "damage", label: "Damage" },
  { value: "heal_gain", label: "Heal" },
  { value: "shield_gain", label: "Shield" },
  { value: "energy_gain", label: "Energy" },
  { value: "heal_steal", label: "Steal" },
  { value: "heal_block", label: "Block" },
  { value: "affliction_amplify", label: "Affliction" },
  { value: "discard_burn", label: "Discard" },
  { value: "draw_boost", label: "Draw" },
];

const SORT_OPTIONS = [
  { value: "cost-asc", label: "Cost ↑" },
  { value: "cost-desc", label: "Cost ↓" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "tier-desc", label: "Tier ↓" },
];

const patternLabels: Record<CompoundPattern, { label: string; title: string; desc: string }> = {
  standard: { label: "◆", title: "Steady", desc: "Grows at a steady pace" },
  aggressive: { label: "🔥", title: "Volatile", desc: "Starts tame, then goes nuclear" },
  slowburn: { label: "⌛", title: "Patient", desc: "Barely a scratch at first, then kicks in" },
};

const targetDisplayNames: Record<string, string> = {
  self: "Self",
  aoe: "All Enemies",
  duo: "2 Targets",
  single: "Single Target",
};

// ─── Portal Dropdown (escapes overflow containers) ─────────
function PortalDropdown({
  value,
  options,
  onChange,
  icon,
  className = "",
}: {
  value: string;
  options: { value: string; label: string; icon?: ReactNode }[];
  onChange: (value: string) => void;
  icon?: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const selectedLabel = options.find((o) => o.value === value)?.label || value;

  // Position the menu below the trigger
  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left });
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    function handleScroll() { setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  const isActive = value !== "all" && value !== "cost-asc";

  return (
    <div className={`shrink-0 ${className}`}>
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all duration-200 border backdrop-blur-sm ${
          open
            ? "bg-amber-500/15 text-amber-200 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
            : isActive
              ? "bg-amber-500/10 text-amber-200/80 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.1)]"
              : "bg-white/[0.04] text-white/50 border-white/[0.08] hover:bg-white/[0.08] hover:text-white/70 hover:border-white/15"
        }`}
      >
        {icon && <span className="opacity-70">{icon}</span>}
        <span className="truncate max-w-[90px] sm:max-w-[130px]">{selectedLabel}</span>
        <svg
          width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="2 4 6 8 10 4" />
        </svg>
      </button>
      {open && createPortal(
        <AnimatePresence>
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="fixed z-[9999] min-w-[180px] rounded-xl border border-amber-500/15 bg-[#0a0a0a]/95 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden"
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="py-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-medium transition-all duration-150 flex items-center gap-2.5 ${
                    opt.value === value
                      ? "bg-amber-500/12 text-amber-200"
                      : "text-white/45 hover:bg-white/[0.06] hover:text-white/75"
                  }`}
                >
                  {opt.icon && <span className="w-4 h-4 flex items-center justify-center opacity-60">{opt.icon}</span>}
                  <span className="flex-1">{opt.label}</span>
                  {opt.value === value && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                      <polyline points="2 6 5 9 10 3" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

// ─── Types ──────────────────────────────────────────────────
interface SavedDeck {
  id: string;
  name: string;
  faction: SinType;
  cardIds: string[];
  createdAt: number;
  updatedAt: number;
}

// ─── LocalStorage Helpers ───────────────────────────────────
const STORAGE_KEY = "7sins_decks";

function loadLocalDecks(): SavedDeck[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalDecks(decks: SavedDeck[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}

// ─── tRPC Fetch Helpers ─────────────────────────────────────
async function trpcQuery(path: string, input?: unknown) {
  const params = input !== undefined
    ? `?input=${encodeURIComponent(JSON.stringify({ json: input }))}`
    : "";
  const res = await fetch(`/api/trpc/${path}${params}`);
  const data = await res.json();
  if (data?.result?.data?.json) return data.result.data.json;
  throw new Error(data?.error?.message || "Query failed");
}

async function trpcMutate(path: string, input: unknown) {
  const res = await fetch(`/api/trpc/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ json: input }),
  });
  const data = await res.json();
  if (data?.result?.data?.json) return data.result.data.json;
  throw new Error(data?.error?.message || "Mutation failed");
}

// ─── Card Detail Popup ──────────────────────────────────────
function CardDetailPopup({
  card,
  isInDeck,
  isFull,
  onToggle,
  onClose,
}: {
  card: CardDefinition;
  isInDeck: boolean;
  isFull: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const sinColor = SIN_COLORS[card.sin];
  const artUrl = CARD_ART_URLS[card.id];
  const pattern = patternLabels[card.compoundPattern] || patternLabels.standard;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-sm rounded-xl overflow-hidden border border-white/10"
        style={{ background: "#0a0a0a" }}
      >
        {/* Art */}
        <div className="relative h-48 overflow-hidden">
          {artUrl ? (
            <img src={artUrl} alt={card.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: `${sinColor}15` }}>
              <img src={SIN_ARCHETYPE_ICONS[card.sin]} alt="" className="w-16 h-16 opacity-40" />
            </div>
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, #0a0a0a)" }} />

          {/* Cost badge */}
          <div
            className="absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center text-lg font-black shadow-lg"
            style={{ background: sinColor, color: "#000" }}
          >
            {card.cost}
          </div>

          {/* Tier & Pattern */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase" style={{ background: `${TIER_COLORS[card.tier]}30`, color: TIER_COLORS[card.tier] }}>
              {card.tier}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: "rgba(255,255,255,0.1)", color: "oklch(0.7 0.15 80)" }}>
              {pattern.label} {pattern.title}
            </span>
          </div>

          {/* Name */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-xl font-black text-white" style={{ fontFamily: "var(--font-heading)", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
              {card.name}
            </h3>
          </div>
        </div>

        {/* Effects */}
        <div className="px-4 py-3 space-y-2.5">
          {card.effects.map((effect, i) => {
            const iconUrl = getEffectIconUrl(effect.type, card.sin);
            return (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-white/5">
                {iconUrl && <img src={iconUrl} alt="" className="w-5 h-5 mt-0.5 object-contain shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: sinColor }}>
                      {EFFECT_LABELS[effect.type] || effect.type}
                    </span>
                    <span className="text-sm font-black text-white/90">
                      {effect.duration > 1
                        ? `${getCompoundTickValue(effect.baseValue, card.compoundPattern, 0)} → ${getCompoundTickValue(effect.baseValue, card.compoundPattern, 1)} → ${getCompoundTickValue(effect.baseValue, card.compoundPattern, effect.duration - 1)}`
                        : effect.baseValue}
                    </span>
                    {effect.targetMode && (
                      <span className="text-xs text-white/40 ml-auto">
                        {targetDisplayNames[effect.targetMode] || effect.targetMode}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
                    {EFFECT_DESCRIPTIONS[effect.type] || ""}
                    {effect.duration > 1 && ` (${effect.duration} rounds, ${pattern.title} compound)`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Description */}
        {card.description && (
          <div className="px-4 pb-3">
            <p className="text-xs text-white/30 italic leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              "{card.description}"
            </p>
          </div>
        )}

        {/* Action */}
        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={onToggle}
            disabled={!isInDeck && isFull}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
              isInDeck
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                : isFull
                  ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                  : "border border-amber-500/30 hover:bg-amber-500/20"
            }`}
            style={!isInDeck && !isFull ? { background: `${sinColor}20`, color: sinColor } : { fontFamily: "var(--font-heading)" }}
          >
            {isInDeck ? "Remove from Deck" : isFull ? "Deck Full" : "Add to Deck"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/60 bg-white/5 hover:bg-white/10 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Mini Card for Deck Builder ─────────────────────────────
const DeckCard = memo(function DeckCard({
  card,
  isInDeck,
  count,
  onToggle,
  onViewDetail,
  disabled,
}: {
  card: CardDefinition;
  isInDeck: boolean;
  count: number;
  onToggle: () => void;
  onViewDetail: () => void;
  disabled: boolean;
}) {
  const sinColor = SIN_COLORS[card.sin];
  const artUrl = CARD_ART_URLS[card.id];
  const tierColor = TIER_COLORS[card.tier];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className={`group relative flex flex-col rounded-lg overflow-hidden cursor-pointer
                 border transition-all duration-200
                 hover:-translate-y-0.5
                 ${isInDeck
                   ? "border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                   : disabled
                     ? "border-white/5 bg-black/20 opacity-40"
                     : "border-white/10 hover:border-white/30 bg-black/40 hover:bg-black/60"
                 }`}
      style={isInDeck ? { borderColor: `${sinColor}60` } : undefined}
    >
      {/* Selection indicator */}
      {isInDeck && (
        <div
          className="absolute top-0 left-0 right-0 h-1 z-10"
          style={{ background: sinColor }}
        />
      )}

      {/* Art — click to toggle */}
      <button
        onClick={disabled && !isInDeck ? undefined : onToggle}
        disabled={disabled && !isInDeck}
        className="relative aspect-[4/3] overflow-hidden bg-black w-full"
      >
        {artUrl ? (
          <>
            <img
              src={artUrl}
              alt={card.name}
              className={`w-full h-full object-cover transition-all duration-300 scale-[1.12]
                         ${isInDeck ? "brightness-110" : "group-hover:scale-[1.22]"}`}
              loading="lazy"
            />
            <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 8px 4px rgba(0,0,0,0.85)" }} />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `${sinColor}15` }}>
            <img src={SIN_ARCHETYPE_ICONS[card.sin]} alt={card.sin} className="w-6 h-6 opacity-40" />
          </div>
        )}

        {/* Cost badge */}
        <div
          className="absolute top-1.5 left-1.5 w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-black shadow-lg"
          style={{ background: sinColor }}
        >
          {card.cost}
        </div>

        {/* Tier badge */}
        <div
          className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider"
          style={{ background: `${tierColor}40`, color: tierColor, border: `1px solid ${tierColor}30` }}
        >
          {card.tier}
        </div>

        {/* In-deck checkmark */}
        {isInDeck && (
          <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2 6 5 9 10 3" />
            </svg>
          </div>
        )}

        {/* Priority badge */}
        {card.skipQueue && (
          <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded text-[7px] font-bold uppercase bg-yellow-500/30 text-yellow-300 border border-yellow-500/40">
            ⚡
          </div>
        )}
      </button>

      {/* Info — click to view detail */}
      <button
        onClick={onViewDetail}
        className="p-2 flex flex-col gap-1 text-left w-full hover:bg-white/5 transition-colors"
        title="Click for card details"
      >
        <p className="text-xs font-bold truncate leading-tight" style={{ color: isInDeck ? sinColor : `${sinColor}ee` }}>
          {card.name}
        </p>
        <div className="flex items-center gap-1 flex-wrap">
          {card.effects.slice(0, 2).map((eff, i) => (
            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-white/8 text-white/70 leading-none font-medium">
              {EFFECT_LABELS[eff.type] || eff.type}
            </span>
          ))}
          {card.effects.length > 2 && (
            <span className="text-[9px] text-white/40 font-medium">+{card.effects.length - 2}</span>
          )}
        </div>
      </button>
    </motion.div>
  );
});

// ─── Deck Slot (in the deck panel) ──────────────────────────
const DeckSlot = memo(function DeckSlot({
  card,
  onRemove,
  onViewDetail,
}: {
  card: CardDefinition;
  onRemove: () => void;
  onViewDetail: () => void;
}) {
  const sinColor = SIN_COLORS[card.sin];
  const artUrl = CARD_ART_URLS[card.id];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group flex items-center gap-2 px-2 py-1.5 rounded-md bg-black/30 border border-white/5 hover:border-amber-500/20 transition-all"
    >
      {/* Tiny art */}
      <button onClick={onViewDetail} className="w-7 h-9 rounded overflow-hidden bg-black shrink-0 cursor-pointer hover:ring-1 hover:ring-amber-500/30 transition-all">
        {artUrl ? (
          <img src={artUrl} alt="" className="w-full h-full object-cover scale-[1.15]" loading="lazy" />
        ) : (
          <div className="w-full h-full" style={{ background: `${sinColor}20` }} />
        )}
      </button>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold truncate" style={{ color: sinColor }}>{card.name}</p>
        <p className="text-[9px] text-white/30">Cost {card.cost} · {card.tier}</p>
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/10"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="rgba(239,68,68,0.6)" strokeWidth="1.5" strokeLinecap="round">
          <line x1="3" y1="3" x2="9" y2="9" />
          <line x1="9" y1="3" x2="3" y2="9" />
        </svg>
      </button>
    </motion.div>
  );
});

// ─── Dynamic Deck Insights Panel ──────────────────────────────
function DeckInsightsPanel({
  deckCards,
  deckCardIds,
  deckStats,
  sinColor,
  selectedFaction,
  isFull,
  removeCard,
  setDetailCard,
}: {
  deckCards: CardDefinition[];
  deckCardIds: string[];
  deckStats: { avgCost: number; tiers: { common: number; rare: number; epic: number }; skipQueue: number; total: number };
  sinColor: string;
  selectedFaction: SinType;
  isFull: boolean;
  removeCard: (id: string) => void;
  setDetailCard: (card: CardDefinition) => void;
}) {
  // Effect distribution
  const effectDist = useMemo(() => {
    const cats: Record<string, { count: number; totalValue: number; color: string; label: string }> = {
      damage: { count: 0, totalValue: 0, color: "#ef4444", label: "Damage" },
      heal: { count: 0, totalValue: 0, color: "#22c55e", label: "Healing" },
      shield: { count: 0, totalValue: 0, color: "#60a5fa", label: "Shield" },
      energy: { count: 0, totalValue: 0, color: "#eab308", label: "Energy" },
      control: { count: 0, totalValue: 0, color: "#c084fc", label: "Control" },
      utility: { count: 0, totalValue: 0, color: "#f97316", label: "Utility" },
    };
    deckCards.forEach((c) => {
      c.effects.forEach((e) => {
        if (e.type === "damage" || e.type === "self_damage") {
          cats.damage.count++; cats.damage.totalValue += e.baseValue;
        } else if (e.type === "heal_gain" || e.type === "heal_steal") {
          cats.heal.count++; cats.heal.totalValue += e.baseValue;
        } else if (e.type === "shield_gain" || e.type === "shield_steal") {
          cats.shield.count++; cats.shield.totalValue += e.baseValue;
        } else if (e.type === "energy_gain" || e.type === "energy_steal" || e.type === "energy_regen") {
          cats.energy.count++; cats.energy.totalValue += e.baseValue;
        } else if (e.type === "heal_block" || e.type === "shield_block" || e.type === "energy_block" || e.type === "affliction_amplify" || e.type === "affliction_transfer") {
          cats.control.count++; cats.control.totalValue += e.baseValue;
        } else {
          cats.utility.count++; cats.utility.totalValue += e.baseValue;
        }
      });
    });
    return cats;
  }, [deckCards]);

  // Archetype analysis
  const archetype = useMemo(() => {
    if (deckCards.length === 0) return { label: "Empty", desc: "Add cards to see analysis", aggro: 0, defense: 0, control: 0 };
    const total = deckCards.reduce((s, c) => s + c.effects.length, 0) || 1;
    let aggro = 0, defense = 0, control = 0;
    deckCards.forEach((c) => {
      c.effects.forEach((e) => {
        if (["damage", "self_damage", "affliction_amplify", "affliction_transfer"].includes(e.type)) aggro++;
        else if (["heal_gain", "heal_steal", "shield_gain", "shield_steal"].includes(e.type)) defense++;
        else control++;
      });
    });
    const aggroPct = (aggro / total) * 100;
    const defensePct = (defense / total) * 100;
    const controlPct = (control / total) * 100;
    let label = "Balanced", desc = "A well-rounded deck with no dominant strategy";
    if (aggroPct > 55) { label = "Aggressor"; desc = "Overwhelm enemies with relentless damage"; }
    else if (defensePct > 45) { label = "Fortress"; desc = "Outlast opponents through superior sustain"; }
    else if (controlPct > 40) { label = "Puppeteer"; desc = "Manipulate the battlefield to your advantage"; }
    else if (aggroPct > 40 && defensePct > 30) { label = "Berserker"; desc = "Hit hard, heal fast — a dangerous gambit"; }
    else if (defensePct > 30 && controlPct > 25) { label = "Warden"; desc = "Lock down threats while sustaining yourself"; }
    return { label, desc, aggro: aggroPct, defense: defensePct, control: controlPct };
  }, [deckCards]);

  // Compound pattern distribution
  const patternDist = useMemo(() => {
    const counts = { standard: 0, aggressive: 0, slowburn: 0 };
    deckCards.forEach((c) => counts[c.compoundPattern]++);
    return counts;
  }, [deckCards]);

  // Target mode distribution
  const targetModeDist = useMemo(() => {
    const counts = { single: 0, aoe: 0, duo: 0, self: 0, mixed: 0 };
    deckCards.forEach((c) => {
      const tm = getCardTargetMode(c);
      if (tm) counts[tm.mode]++;
    });
    return counts;
  }, [deckCards]);

  // Target mode synergy warnings
  const targetWarnings = useMemo(() => {
    if (deckCards.length < 5) return [];
    const warnings: { type: "danger" | "caution" | "tip"; message: string; icon: string }[] = [];
    const offensiveCards = targetModeDist.single + targetModeDist.aoe + targetModeDist.duo + targetModeDist.mixed;
    const selfOnlyCards = targetModeDist.self;
    const aoeCards = targetModeDist.aoe;
    const total = deckCards.length;

    // All self-target = no offense
    if (offensiveCards === 0 && selfOnlyCards > 0) {
      warnings.push({ type: "danger", message: "No offensive cards! Your deck can't deal damage to opponents.", icon: "⚠" });
    } else if (offensiveCards <= 2 && total >= 10) {
      warnings.push({ type: "caution", message: "Very few offensive cards. Consider adding damage dealers.", icon: "⚡" });
    }

    // No AoE = no crowd control
    if (aoeCards === 0 && total >= 10) {
      warnings.push({ type: "caution", message: "No AoE cards. You may struggle in multi-opponent fights.", icon: "🎯" });
    }

    // All AoE = no focused damage
    if (aoeCards > 0 && targetModeDist.single === 0 && targetModeDist.duo === 0 && total >= 10) {
      warnings.push({ type: "caution", message: "No single-target cards. You can't focus down priority threats.", icon: "🔍" });
    }

    // No self-target = no sustain
    if (selfOnlyCards === 0 && targetModeDist.mixed === 0 && total >= 10) {
      warnings.push({ type: "tip", message: "No self-targeting cards. Consider adding heals or shields.", icon: "💡" });
    }

    // Good balance
    if (warnings.length === 0 && total >= 15 && aoeCards >= 2 && targetModeDist.single >= 3 && (selfOnlyCards + targetModeDist.mixed) >= 2) {
      warnings.push({ type: "tip", message: "Great target coverage! Your deck handles all combat scenarios.", icon: "✓" });
    }

    return warnings;
  }, [deckCards, targetModeDist]);

  // Synergy score (0-100)
  const synergyScore = useMemo(() => {
    if (deckCards.length < 3) return 0;
    let score = 0;
    const effectTypes = new Set<string>();
    deckCards.forEach((c) => c.effects.forEach((e) => effectTypes.add(e.type)));
    // Diversity bonus (more unique effects = better synergy)
    score += Math.min(effectTypes.size * 6, 30);
    // Curve smoothness bonus
    const costs = Array(7).fill(0);
    deckCards.forEach((c) => costs[Math.min(c.cost, 6)]++);
    const avgCount = deckCards.length / 7;
    const variance = costs.reduce((s, c) => s + Math.pow(c - avgCount, 2), 0) / 7;
    score += Math.max(0, 25 - variance * 2);
    // Tier balance bonus
    const { tiers } = deckStats;
    if (tiers.epic >= 2 && tiers.rare >= 4) score += 15;
    else if (tiers.epic >= 1 && tiers.rare >= 3) score += 10;
    // Priority card bonus
    if (deckStats.skipQueue >= 2 && deckStats.skipQueue <= 5) score += 10;
    // Pattern diversity bonus
    const patterns = Object.values(patternDist).filter((v) => v > 0).length;
    if (patterns >= 2) score += 10;
    if (patterns >= 3) score += 10;
    return Math.min(Math.round(score), 100);
  }, [deckCards, deckStats, patternDist]);

  // Matchup predictions against other factions
  const matchups = useMemo(() => {
    if (deckCards.length < 5) return [];
    const factions: SinType[] = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];
    return factions
      .filter((f) => f !== selectedFaction)
      .map((f) => {
        // Simple heuristic based on faction strengths
        let advantage = 50; // baseline
        const dmg = effectDist.damage.count;
        const heal = effectDist.heal.count;
        const shield = effectDist.shield.count;
        const ctrl = effectDist.control.count;
        if (f === "wrath") advantage += shield * 3 + heal * 2 - dmg; // shield/heal counters wrath
        else if (f === "sloth") advantage += dmg * 2 + ctrl - heal; // aggro beats sloth
        else if (f === "greed") advantage += ctrl * 3 - dmg; // control beats greed
        else if (f === "envy") advantage += heal * 2 + shield - ctrl * 2; // sustain beats envy
        else if (f === "pride") advantage += dmg * 2 - shield; // raw damage beats pride
        else if (f === "lust") advantage += shield * 2 + ctrl - heal; // shield/control beats lust
        else if (f === "gluttony") advantage += dmg * 3 - heal * 2; // burst beats gluttony
        return { faction: f, advantage: Math.max(15, Math.min(85, advantage)), color: SIN_COLORS[f] };
      });
  }, [deckCards, selectedFaction, effectDist]);

  const isEmpty = deckCards.length === 0;

  return (
    <div className="p-3 sm:p-4 space-y-3">
      {/* ── Progress Bar ── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Deck Progress</span>
          <span className="text-xs font-bold" style={{ color: isFull ? "#22c55e" : sinColor }}>
            {deckCardIds.length}/{MAX_DECK_SIZE}
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: isFull ? "linear-gradient(90deg, #22c55e, #16a34a)" : `linear-gradient(90deg, ${sinColor}80, ${sinColor})` }}
            animate={{ width: `${(deckCardIds.length / MAX_DECK_SIZE) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        {isFull && (
          <p className="text-[10px] text-green-400/60 text-center mt-1" style={{ fontFamily: "var(--font-heading)" }}>
            Deck Complete — Ready for Battle
          </p>
        )}
      </div>

      {/* ── Card List ── */}
      <div>
        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-1.5">Cards</p>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: `${sinColor}40 transparent` }}>
          <AnimatePresence mode="popLayout">
            {isEmpty ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                <svg className="mx-auto mb-2 text-white/10" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="2" y="4" width="14" height="17" rx="2" />
                  <path d="M8 4V2a1 1 0 0 1 1-1h10a2 2 0 0 1 2 2v14a1 1 0 0 1-1 1h-2" />
                </svg>
                <p className="text-white/15 text-xs">Click cards to add them</p>
              </motion.div>
            ) : (
              deckCards.map((card) => (
                <DeckSlot key={card.id} card={card} onRemove={() => removeCard(card.id)} onViewDetail={() => setDetailCard(card)} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-4 gap-1.5">
        <div className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
          <p className="text-base font-bold" style={{ color: sinColor, fontFamily: "var(--font-heading)" }}>{deckStats.total}</p>
          <p className="text-[8px] text-white/25 uppercase tracking-wider">Cards</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
          <p className="text-base font-bold text-amber-200/70" style={{ fontFamily: "var(--font-heading)" }}>{deckStats.avgCost.toFixed(1)}</p>
          <p className="text-[8px] text-white/25 uppercase tracking-wider">Avg Cost</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
          <p className="text-base font-bold text-yellow-300/70" style={{ fontFamily: "var(--font-heading)" }}>{deckStats.skipQueue}</p>
          <p className="text-[8px] text-white/25 uppercase tracking-wider">Priority</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
          <div className="flex items-center justify-center gap-0.5">
            <span className="text-[11px] font-bold" style={{ color: TIER_COLORS.epic }}>{deckStats.tiers.epic}</span>
            <span className="text-white/10 text-[9px]">/</span>
            <span className="text-[11px] font-bold" style={{ color: TIER_COLORS.rare }}>{deckStats.tiers.rare}</span>
            <span className="text-white/10 text-[9px]">/</span>
            <span className="text-[11px] font-bold" style={{ color: TIER_COLORS.common }}>{deckStats.tiers.common}</span>
          </div>
          <p className="text-[8px] text-white/25 uppercase tracking-wider">E/R/C</p>
        </div>
      </div>

      {/* ── Mana Curve ── */}
      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-2 text-center">Mana Curve</p>
        <ManaCurve cards={deckCards} sinColor={sinColor} />
      </div>

      {/* ── Effect Distribution ── */}
      {!isEmpty && (
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-2 text-center">Effect Balance</p>
          <div className="space-y-1.5">
            {Object.entries(effectDist).map(([key, val]) => {
              const maxCount = Math.max(...Object.values(effectDist).map((v) => v.count), 1);
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[9px] text-white/40 w-12 text-right shrink-0">{val.label}</span>
                  <div className="flex-1 h-3 rounded-full bg-white/[0.03] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${val.color}60, ${val.color})` }}
                      initial={{ width: 0 }}
                      animate={{ width: val.count > 0 ? `${(val.count / maxCount) * 100}%` : "0%" }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    />
                  </div>
                  <span className="text-[9px] text-white/30 w-4 text-right font-mono">{val.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Archetype Analysis ── */}
      {!isEmpty && (
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-2 text-center">Archetype</p>
          <div className="text-center mb-2">
            <p className="text-sm font-bold" style={{ color: sinColor, fontFamily: "var(--font-heading)" }}>{archetype.label}</p>
            <p className="text-[10px] text-white/30 italic" style={{ fontFamily: "var(--font-body)" }}>{archetype.desc}</p>
          </div>
          <div className="flex items-center gap-1 h-3 rounded-full overflow-hidden bg-white/[0.03]">
            <motion.div className="h-full" style={{ background: "#ef4444" }} animate={{ width: `${archetype.aggro}%` }} transition={{ duration: 0.5 }} />
            <motion.div className="h-full" style={{ background: "#22c55e" }} animate={{ width: `${archetype.defense}%` }} transition={{ duration: 0.5 }} />
            <motion.div className="h-full" style={{ background: "#c084fc" }} animate={{ width: `${archetype.control}%` }} transition={{ duration: 0.5 }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] text-red-400/50">Aggro {Math.round(archetype.aggro)}%</span>
            <span className="text-[8px] text-green-400/50">Defense {Math.round(archetype.defense)}%</span>
            <span className="text-[8px] text-purple-400/50">Control {Math.round(archetype.control)}%</span>
          </div>
        </div>
      )}

      {/* ── Compound Pattern Mix ── */}
      {!isEmpty && (
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-2 text-center">Compound Patterns</p>
          <div className="grid grid-cols-3 gap-2">
            {([
              { key: "standard" as const, label: "◆ Steady", color: "#60a5fa", desc: "Fibonacci growth" },
              { key: "aggressive" as const, label: "🔥 Volatile", color: "#ef4444", desc: "Exponential burst" },
              { key: "slowburn" as const, label: "⌛ Patient", color: "#a855f7", desc: "Gradual pressure" },
            ]).map((p) => (
              <div key={p.key} className="text-center p-2 rounded-lg" style={{ background: patternDist[p.key] > 0 ? `${p.color}10` : "rgba(255,255,255,0.01)", border: `1px solid ${patternDist[p.key] > 0 ? `${p.color}20` : "rgba(255,255,255,0.03)"}` }}>
                <p className="text-sm font-bold" style={{ color: patternDist[p.key] > 0 ? p.color : "rgba(255,255,255,0.15)" }}>{patternDist[p.key]}</p>
                <p className="text-[8px] text-white/30 mt-0.5">{p.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Target Coverage ── */}
      {!isEmpty && (
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-2 text-center">Target Coverage</p>
          <div className="grid grid-cols-5 gap-1">
            {([
              { key: "single" as const, label: "Single", color: "#3b82f6" },
              { key: "aoe" as const, label: "AoE", color: "#f97316" },
              { key: "duo" as const, label: "Duo", color: "#a855f7" },
              { key: "self" as const, label: "Self", color: "#22c55e" },
              { key: "mixed" as const, label: "Mix", color: "#22c55e" },
            ]).map((t) => (
              <div
                key={t.key}
                className="text-center p-1.5 rounded-lg"
                style={{
                  background: targetModeDist[t.key] > 0 ? `${t.color}10` : "rgba(255,255,255,0.01)",
                  border: `1px solid ${targetModeDist[t.key] > 0 ? `${t.color}25` : "rgba(255,255,255,0.03)"}`,
                }}
              >
                <p
                  className="text-sm font-bold"
                  style={{
                    color: targetModeDist[t.key] > 0 ? t.color : "rgba(255,255,255,0.15)",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {targetModeDist[t.key]}
                </p>
                <p className="text-[7px] text-white/30 mt-0.5">{t.label}</p>
              </div>
            ))}
          </div>
          {/* Synergy warnings */}
          {targetWarnings.length > 0 && (
            <div className="mt-2 space-y-1">
              {targetWarnings.map((w, i) => (
                <div
                  key={i}
                  className="flex items-start gap-1.5 px-2 py-1.5 rounded-md text-[9px] leading-tight"
                  style={{
                    background:
                      w.type === "danger"
                        ? "rgba(239,68,68,0.08)"
                        : w.type === "caution"
                          ? "rgba(234,179,8,0.08)"
                          : "rgba(34,197,94,0.08)",
                    border: `1px solid ${
                      w.type === "danger"
                        ? "rgba(239,68,68,0.15)"
                        : w.type === "caution"
                          ? "rgba(234,179,8,0.15)"
                          : "rgba(34,197,94,0.15)"
                    }`,
                    color:
                      w.type === "danger"
                        ? "#fca5a5"
                        : w.type === "caution"
                          ? "#fde68a"
                          : "#86efac",
                  }}
                >
                  <span className="shrink-0 mt-px">{w.icon}</span>
                  <span className="opacity-80">{w.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Synergy Score ── */}
      {!isEmpty && (
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-2 text-center">Synergy Score</p>
          <div className="flex items-center justify-center gap-3">
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <motion.circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={synergyScore >= 70 ? "#22c55e" : synergyScore >= 40 ? "#eab308" : "#ef4444"}
                  strokeWidth="3" strokeLinecap="round"
                  strokeDasharray="100" strokeDashoffset={100 - synergyScore}
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 100 - synergyScore }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black" style={{ color: synergyScore >= 70 ? "#22c55e" : synergyScore >= 40 ? "#eab308" : "#ef4444", fontFamily: "var(--font-heading)" }}>
                  {synergyScore}
                </span>
              </div>
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold" style={{ color: synergyScore >= 70 ? "#22c55e" : synergyScore >= 40 ? "#eab308" : "#ef4444" }}>
                {synergyScore >= 80 ? "Masterful" : synergyScore >= 60 ? "Strong" : synergyScore >= 40 ? "Developing" : "Fragmented"}
              </p>
              <p className="text-[9px] text-white/25 max-w-[120px] leading-relaxed">
                {synergyScore >= 70 ? "Excellent effect diversity and curve balance" : synergyScore >= 40 ? "Good foundation, consider more variety" : "Add more cards for better synergy"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Matchup Predictions ── */}
      {matchups.length > 0 && (
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-2 text-center">Matchup Forecast</p>
          <div className="space-y-1.5">
            {matchups.map((m) => (
              <div key={m.faction} className="flex items-center gap-2">
                <span className="text-[9px] font-semibold w-14 text-right capitalize" style={{ color: m.color }}>{m.faction}</span>
                <div className="flex-1 h-2.5 rounded-full bg-white/[0.03] overflow-hidden relative">
                  {/* Center line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
                  <motion.div
                    className="h-full rounded-full absolute top-0"
                    style={{
                      background: m.advantage >= 50
                        ? `linear-gradient(90deg, transparent, ${sinColor})`
                        : `linear-gradient(270deg, transparent, ${m.color})`,
                      left: m.advantage >= 50 ? "50%" : `${m.advantage}%`,
                      width: m.advantage >= 50 ? `${m.advantage - 50}%` : `${50 - m.advantage}%`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: m.advantage >= 50 ? `${m.advantage - 50}%` : `${50 - m.advantage}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
                <span className="text-[9px] font-mono w-8 text-right" style={{ color: m.advantage >= 55 ? "#22c55e" : m.advantage <= 45 ? "#ef4444" : "#eab308" }}>
                  {m.advantage}%
                </span>
              </div>
            ))}
          </div>
          <p className="text-[8px] text-white/15 text-center mt-1.5 italic">Based on deck composition heuristics</p>
        </div>
      )}
    </div>
  );
}

// ─── Mana Curve Chart ───────────────────────────────────────
function ManaCurve({ cards, sinColor }: { cards: CardDefinition[]; sinColor: string }) {
  const curve = useMemo(() => {
    const counts: Record<number, number> = {};
    cards.forEach((c) => {
      const cost = Math.min(c.cost, 5); // 5+ grouped
      counts[cost] = (counts[cost] || 0) + 1;
    });
    const max = Math.max(...Object.values(counts), 1);
    return Array.from({ length: 6 }, (_, i) => ({
      cost: i === 5 ? "5+" : String(i),
      count: counts[i] || 0,
      height: ((counts[i] || 0) / max) * 100,
    }));
  }, [cards]);

  return (
    <div className="flex items-end gap-1 h-16">
      {curve.map((bar) => (
        <div key={bar.cost} className="flex-1 flex flex-col items-center gap-0.5">
          <span className="text-[8px] text-white/40 font-bold">{bar.count || ""}</span>
          <div className="w-full rounded-t-sm" style={{ height: `${Math.max(bar.height, 2)}%`, background: bar.count > 0 ? sinColor : "rgba(255,255,255,0.05)" }} />
          <span className="text-[8px] text-white/30">{bar.cost}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
export default function DeckBuilder() {
  const { user } = useSupabaseAuth();

  // State
  const [selectedFaction, setSelectedFaction] = useState<SinType | null>(null);
  const [deckCardIds, setDeckCardIds] = useState<string[]>([]);
  const [deckName, setDeckName] = useState("My Deck");
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<CardTier | "all">("all");
  const [effectFilter, setEffectFilter] = useState("all");
  const [sortBy, setSortBy] = useState("cost-asc");
  const [showDeckPanel, setShowDeckPanel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);
  const [detailCard, setDetailCard] = useState<CardDefinition | null>(null);
  const deckPanelRef = useRef<HTMLDivElement>(null);

  // Load saved decks on mount
  useEffect(() => {
    if (user) {
      setIsLoadingDecks(true);
      trpcQuery("deck.list", { supabaseUserId: user.id })
        .then((decks: any[]) => {
          setSavedDecks(
            decks.map((d: any) => ({
              id: d.id,
              name: d.name,
              faction: d.faction,
              cardIds: typeof d.cardIds === "string" ? JSON.parse(d.cardIds) : d.cardIds,
              createdAt: d.createdAt,
              updatedAt: d.updatedAt,
            }))
          );
        })
        .catch(() => {
          setSavedDecks(loadLocalDecks());
        })
        .finally(() => setIsLoadingDecks(false));
    } else {
      setSavedDecks(loadLocalDecks());
    }
  }, [user]);

  // Faction cards
  const factionCards = useMemo(() => {
    if (!selectedFaction) return [];
    return ALL_CARDS.filter((c) => c.sin === selectedFaction);
  }, [selectedFaction]);

  // Filtered & sorted cards
  const filteredCards = useMemo(() => {
    let cards = factionCards;
    if (tierFilter !== "all") cards = cards.filter((c) => c.tier === tierFilter);
    if (effectFilter !== "all") {
      cards = cards.filter((c) =>
        c.effects.some((e) => {
          if (effectFilter === "heal_gain") return e.type === "heal_gain" || e.type === "heal_steal";
          if (effectFilter === "shield_gain") return e.type === "shield_gain" || e.type === "shield_steal";
          if (effectFilter === "energy_gain") return e.type === "energy_gain" || e.type === "energy_steal" || e.type === "energy_regen";
          if (effectFilter === "heal_block") return e.type === "heal_block" || e.type === "shield_block" || e.type === "energy_block";
          if (effectFilter === "affliction_amplify") return e.type === "affliction_amplify" || e.type === "affliction_transfer";
          if (effectFilter === "draw_boost") return e.type === "draw_boost" || e.type === "draw_reduction";
          return e.type === effectFilter;
        })
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      cards = cards.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.effects.some((e) => (EFFECT_LABELS[e.type] || e.type).toLowerCase().includes(q))
      );
    }
    // Sort
    const sorted = [...cards];
    switch (sortBy) {
      case "cost-asc": sorted.sort((a, b) => a.cost - b.cost); break;
      case "cost-desc": sorted.sort((a, b) => b.cost - a.cost); break;
      case "name-asc": sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "tier-desc": {
        const tierOrder = { epic: 0, rare: 1, common: 2 };
        sorted.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier] || a.cost - b.cost);
        break;
      }
    }
    return sorted;
  }, [factionCards, tierFilter, effectFilter, searchQuery, sortBy]);

  // Deck cards (resolved from IDs)
  const deckCards = useMemo(() => {
    return deckCardIds
      .map((id) => ALL_CARDS.find((c) => c.id === id))
      .filter(Boolean) as CardDefinition[];
  }, [deckCardIds]);

  // Deck stats
  const deckStats = useMemo(() => {
    const cards = deckCards;
    const avgCost = cards.length > 0 ? cards.reduce((s, c) => s + c.cost, 0) / cards.length : 0;
    const tiers = { common: 0, rare: 0, epic: 0 };
    cards.forEach((c) => tiers[c.tier]++);
    const skipQueue = cards.filter((c) => c.skipQueue).length;
    return { avgCost, tiers, skipQueue, total: cards.length };
  }, [deckCards]);

  // Toggle card in/out of deck
  const toggleCard = useCallback((cardId: string) => {
    setDeckCardIds((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      }
      if (prev.length >= MAX_DECK_SIZE) return prev;
      return [...prev, cardId];
    });
  }, []);

  // Remove card from deck
  const removeCard = useCallback((cardId: string) => {
    setDeckCardIds((prev) => prev.filter((id) => id !== cardId));
  }, []);

  // Clear deck
  const clearDeck = useCallback(() => {
    setDeckCardIds([]);
    setActiveDeckId(null);
    setDeckName("My Deck");
  }, []);

  // Strategy auto-fill
  const [showStrategyPicker, setShowStrategyPicker] = useState(false);
  const [lastStrategy, setLastStrategy] = useState<StrategyType | null>(null);
  const strategyPickerRef = useRef<HTMLDivElement>(null);

  // Close strategy picker on click outside
  useEffect(() => {
    if (!showStrategyPicker) return;
    const handleClick = (e: MouseEvent) => {
      if (strategyPickerRef.current && !strategyPickerRef.current.contains(e.target as Node)) {
        setShowStrategyPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showStrategyPicker]);

  const autoFillWithStrategy = useCallback((strategy: StrategyType) => {
    const toAdd = autoFillByStrategy(factionCards, deckCardIds, strategy, MAX_DECK_SIZE);
    if (toAdd.length > 0) {
      setDeckCardIds((prev) => [...prev, ...toAdd]);
      setLastStrategy(strategy);
      setSaveMessage(`${STRATEGIES.find(s => s.type === strategy)?.label} strategy applied! ${toAdd.length} cards added.`);
      setTimeout(() => setSaveMessage(null), 3000);
    }
    setShowStrategyPicker(false);
  }, [deckCardIds, factionCards]);

  // Legacy auto-fill (fallback, uses balanced)
  const autoFill = useCallback(() => {
    setShowStrategyPicker(true);
  }, []);

  // Guest deck limit check
  const isGuest = !user;
  const guestAtDeckLimit = isGuest && !activeDeckId && savedDecks.length >= GUEST_MAX_DECKS;

  // Save deck
  const saveDeck = useCallback(async () => {
    if (!selectedFaction || deckCardIds.length === 0) return;

    if (!user && !activeDeckId && savedDecks.length >= GUEST_MAX_DECKS) {
      setSaveMessage("Sign in to save more decks! Guests are limited to 1 deck.");
      setTimeout(() => setSaveMessage(null), 4000);
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    const now = Date.now();
    const deck: SavedDeck = {
      id: activeDeckId || `deck_${now}_${Math.random().toString(36).slice(2, 8)}`,
      name: deckName || "Unnamed Deck",
      faction: selectedFaction,
      cardIds: deckCardIds,
      createdAt: activeDeckId
        ? savedDecks.find((d) => d.id === activeDeckId)?.createdAt || now
        : now,
      updatedAt: now,
    };

    try {
      if (user) {
        // Check if this is an update to an existing DB deck (numeric ID from server)
        const isExistingDbDeck = activeDeckId && !String(activeDeckId).startsWith("deck_");
        if (isExistingDbDeck) {
          // Update existing deck in Supabase
          await trpcMutate("deck.update", {
            deckId: typeof activeDeckId === "string" ? parseInt(activeDeckId, 10) : activeDeckId,
            supabaseUserId: user.id,
            name: deck.name,
            cardIds: JSON.stringify(deck.cardIds),
          });
        } else {
          // Create new deck in Supabase
          const result = await trpcMutate("deck.create", {
            supabaseUserId: user.id,
            name: deck.name,
            faction: deck.faction,
            cardIds: JSON.stringify(deck.cardIds),
          });
          // Use the server-assigned ID so future saves become updates
          if (result?.id) {
            deck.id = String(result.id);
          }
        }
      }

      const updated = activeDeckId
        ? savedDecks.map((d) => (d.id === activeDeckId ? deck : d))
        : [...savedDecks, deck];
      setSavedDecks(updated);
      saveLocalDecks(updated);
      setActiveDeckId(deck.id);
      setSaveMessage("Deck saved!");
    } catch (err: any) {
      console.error("[SaveDeck]", err);
      setSaveMessage("Save failed. Please try again.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }, [selectedFaction, deckCardIds, deckName, activeDeckId, savedDecks, user]);

  // Load a saved deck
  const loadDeck = useCallback((deck: SavedDeck) => {
    setSelectedFaction(deck.faction);
    setDeckCardIds(deck.cardIds);
    setDeckName(deck.name);
    setActiveDeckId(deck.id);
  }, []);

  // Delete a saved deck
  const deleteDeck = useCallback(
    async (deckId: string) => {
      const updated = savedDecks.filter((d) => d.id !== deckId);
      setSavedDecks(updated);
      saveLocalDecks(updated);
      if (activeDeckId === deckId) {
        clearDeck();
      }
      if (user) {
        try {
          await trpcMutate("deck.delete", { deckId: parseInt(deckId, 10) || 0, supabaseUserId: user.id });
        } catch { /* localStorage already updated */ }
      }
    },
    [savedDecks, activeDeckId, clearDeck, user]
  );

  // Faction selection screen
  if (!selectedFaction) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Noise overlay */}
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 sm:py-24">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-amber-200/40 text-sm tracking-[0.4em] uppercase mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              Forge Your Arsenal
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-amber-100/90 tracking-wide" style={{ fontFamily: "var(--font-heading)" }}>
              Deck Builder
            </h1>
            <p className="text-white/30 text-base mt-3 max-w-md mx-auto">
              Choose your faction. Select {MAX_DECK_SIZE} cards from their arsenal. Forge a deck that embodies your sin.
            </p>
          </div>

          {/* Guest deck limit banner */}
          {isGuest && (
            <div className="mb-6 mx-auto max-w-lg p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-center">
              <p className="text-amber-200/60 text-sm" style={{ fontFamily: "var(--font-body)" }}>
                {savedDecks.length >= GUEST_MAX_DECKS
                  ? <>You've used your free deck slot. <a href="/login" className="text-amber-400 underline hover:text-amber-300">Sign in</a> to save unlimited decks.</>
                  : <>Guests can save {GUEST_MAX_DECKS} deck. <a href="/login" className="text-amber-400 underline hover:text-amber-300">Sign in</a> for unlimited decks.</>
                }
              </p>
            </div>
          )}

          {/* Faction Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
            {SINS.map((sin, i) => {
              const color = SIN_COLORS[sin];
              const factionCount = ALL_CARDS.filter((c) => c.sin === sin).length;
              const factionDecks = savedDecks.filter((d) => d.faction === sin);

              return (
                <motion.button
                  key={sin}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setSelectedFaction(sin)}
                  className="group relative flex flex-col items-center p-5 sm:p-6 rounded-xl border border-white/5 hover:border-white/20 bg-black/30 hover:bg-black/50 transition-all duration-300 hover:-translate-y-1"
                  style={{ boxShadow: `0 0 0 0 ${color}00` }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${color}15, 0 0 0 1px ${color}30`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 ${color}00`;
                  }}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 mb-3 transition-all duration-300 group-hover:scale-110"
                    style={{ borderColor: `${color}40` }}
                  >
                    <img src={SIN_ARCHETYPE_ICONS[sin]} alt={sin} className="w-full h-full object-cover" />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold tracking-wider uppercase" style={{ fontFamily: "var(--font-heading)", color }}>
                    {SIN_LABELS[sin]}
                  </h3>

                  <p className="text-xs text-white/25 mt-1 text-center leading-tight italic">
                    {SIN_TAGLINES[sin]}
                  </p>

                  <p className="text-xs text-white/20 mt-2">{factionCount} cards</p>

                  {factionDecks.length > 0 && (
                    <div className="mt-2 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${color}15`, color: `${color}cc` }}>
                      {factionDecks.length} deck{factionDecks.length > 1 ? "s" : ""} saved
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Saved Decks */}
          {savedDecks.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                <h2 className="text-sm tracking-[0.3em] text-amber-200/40 uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                  Saved Decks
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedDecks.map((deck) => {
                  const color = SIN_COLORS[deck.faction];
                  return (
                    <div
                      key={deck.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-black/30 hover:bg-black/50 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden border shrink-0" style={{ borderColor: `${color}30` }}>
                        <img src={SIN_ARCHETYPE_ICONS[deck.faction]} alt="" className="w-full h-full object-cover" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate" style={{ color, fontFamily: "var(--font-heading)" }}>
                          {deck.name}
                        </p>
                        <p className="text-xs text-white/25">
                          {SIN_LABELS[deck.faction]} · {deck.cardIds.length}/{MAX_DECK_SIZE} cards
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => loadDeck(deck)}
                          className="px-2 py-1 rounded text-xs font-medium bg-amber-500/10 text-amber-200/70 hover:bg-amber-500/20 hover:text-amber-200 transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteDeck(deck.id)}
                          className="px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-400/50 hover:bg-red-500/20 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Back to home */}
          <div className="text-center mt-12">
            <Link href="/" className="text-sm text-white/20 hover:text-amber-200/40 transition-colors tracking-wider uppercase" style={{ fontFamily: "var(--font-heading)" }}>
              Return to Cathedral
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Deck Building View ─────────────────────────────────────
  const sinColor = SIN_COLORS[selectedFaction];
  const isFull = deckCardIds.length >= MAX_DECK_SIZE;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Noise overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }}
      />

      <div className="relative z-10 flex flex-col h-screen">
        {/* ─── Top Bar (Premium AAA) ────────────────────────── */}
        <div className="shrink-0 border-b border-white/[0.06] bg-black/50 backdrop-blur-md">
          {/* Row 1: Navigation + Deck Identity + Actions */}
          <div className="px-3 sm:px-5 py-2.5 flex items-center gap-3">
            {/* Back button */}
            <button
              onClick={() => { setSelectedFaction(null); clearDeck(); }}
              className="shrink-0 flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-white/35 hover:text-amber-200/70 hover:bg-white/5 transition-all duration-200 text-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span className="hidden sm:inline text-xs tracking-wider uppercase" style={{ fontFamily: "var(--font-heading)" }}>Factions</span>
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-white/[0.06] hidden sm:block" />

            {/* Faction badge */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 shadow-lg" style={{ borderColor: `${sinColor}50`, boxShadow: `0 0 12px ${sinColor}20` }}>
                <img src={SIN_ARCHETYPE_ICONS[selectedFaction]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-base font-bold tracking-wider uppercase" style={{ fontFamily: "var(--font-heading)", color: sinColor }}>
                  {SIN_LABELS[selectedFaction]}
                </h2>
              </div>
            </div>

            {/* Deck name + counter inline */}
            <div className="flex items-center gap-2 ml-2">
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                className="px-2.5 py-1 bg-transparent border-b border-white/10 text-sm text-white/70 focus:border-amber-500/30 focus:outline-none w-32 sm:w-40 transition-colors"
                style={{ fontFamily: "var(--font-heading)" }}
                placeholder="Deck name..."
              />
              <span className={`text-sm font-bold tracking-wide whitespace-nowrap ${
                isFull ? "text-green-400" : "text-white/60"
              }`} style={{ fontFamily: "var(--font-heading)" }}>
                {deckCardIds.length}<span className="text-white/20 font-normal">/</span><span className="text-white/30 font-normal">{MAX_DECK_SIZE}</span>
              </span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Mobile deck panel toggle only in top bar */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setShowDeckPanel(!showDeckPanel)}
                className={`lg:hidden px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
                  showDeckPanel
                    ? "bg-amber-500/15 text-amber-200 border-amber-500/25"
                    : "bg-white/[0.04] text-white/50 border-white/[0.08] hover:bg-white/[0.08]"
                }`}
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {showDeckPanel ? "Cards" : "Deck"}
              </button>
            </div>
          </div>

          {/* Row 2: Premium Filter Bar */}
          <div className="px-3 sm:px-5 py-2 border-t border-white/[0.04] flex items-center gap-2">
            {/* Search */}
            <div className="relative shrink-0">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-8 pr-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-white/60 focus:border-amber-500/25 focus:bg-white/[0.05] focus:outline-none w-28 sm:w-36 transition-all duration-200 placeholder:text-white/20"
              />
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-white/[0.06] mx-0.5" />

            {/* Tier filter chips */}
            <div className="flex items-center gap-1 shrink-0">
              {(["all", "common", "rare", "epic"] as const).map((tier) => {
                const isSelected = tierFilter === tier;
                const chipColor = tier === "all" ? "#d4a574" : TIER_COLORS[tier];
                return (
                  <button
                    key={tier}
                    onClick={() => setTierFilter(tier)}
                    className={`relative px-2.5 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 border ${
                      isSelected
                        ? "text-white/90 border-current/20"
                        : "bg-white/[0.03] text-white/30 border-transparent hover:bg-white/[0.06] hover:text-white/50"
                    }`}
                    style={isSelected ? {
                      background: `${chipColor}18`,
                      color: chipColor,
                      borderColor: `${chipColor}30`,
                      boxShadow: `0 0 10px ${chipColor}15`,
                    } : undefined}
                  >
                    {tier === "all" ? "All" : tier}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-white/[0.06] mx-0.5 hidden sm:block" />

            {/* Effect filter dropdown */}
            <PortalDropdown
              value={effectFilter}
              options={EFFECT_FILTER_OPTIONS}
              onChange={setEffectFilter}
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              }
            />

            {/* Sort dropdown */}
            <PortalDropdown
              value={sortBy}
              options={SORT_OPTIONS}
              onChange={setSortBy}
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="16" y2="12" />
                  <line x1="4" y1="18" x2="12" y2="18" />
                </svg>
              }
            />

            {/* Spacer */}
            <div className="flex-1" />

            {/* Active filter count badge */}
            {(tierFilter !== "all" || effectFilter !== "all" || searchQuery.trim()) && (
              <button
                onClick={() => { setTierFilter("all"); setEffectFilter("all"); setSearchQuery(""); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-amber-500/10 text-amber-200/60 border border-amber-500/15 hover:bg-amber-500/20 hover:text-amber-200 transition-all duration-200"
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="3" x2="9" y2="9" />
                  <line x1="9" y1="3" x2="3" y2="9" />
                </svg>
                Clear filters
              </button>
            )}

            {/* Card count */}
            <span className="text-[10px] text-white/25 font-medium tracking-wide shrink-0 hidden sm:block">
              {filteredCards.length} card{filteredCards.length !== 1 ? "s" : ""}
            </span>

            {/* Divider before deck actions */}
            <div className="w-px h-5 bg-white/[0.06] mx-0.5 hidden sm:block" />

            {/* Deck action buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Strategy Auto-Fill */}
              <div className="relative hidden sm:block" ref={strategyPickerRef}>
                <button
                  onClick={autoFill}
                  disabled={isFull}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-white/[0.04] text-white/35 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/55 transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span>Strategy Fill</span>
                  <svg className="w-2.5 h-2.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <AnimatePresence>
                  {showStrategyPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-1.5 z-50 w-56 rounded-xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                    >
                      <div className="p-2 border-b border-white/5">
                        <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold px-2 py-1" style={{ fontFamily: "var(--font-heading)" }}>Choose Strategy</p>
                      </div>
                      <div className="p-1.5 space-y-0.5">
                        {STRATEGIES.map((s) => (
                          <button
                            key={s.type}
                            onClick={() => autoFillWithStrategy(s.type)}
                            className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.06] transition-all duration-150 text-left group"
                          >
                            <span className="text-base mt-0.5 shrink-0">{s.icon}</span>
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold tracking-wide group-hover:text-white/90 transition-colors" style={{ color: s.color, fontFamily: "var(--font-heading)" }}>{s.label}</p>
                              <p className="text-[9px] text-white/30 leading-relaxed mt-0.5">{s.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="p-1.5 border-t border-white/5">
                        <button
                          onClick={() => setShowStrategyPicker(false)}
                          className="w-full text-center text-[9px] text-white/20 hover:text-white/40 py-1 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={clearDeck}
                disabled={deckCardIds.length === 0}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-red-500/[0.06] text-red-400/40 border border-red-500/[0.08] hover:bg-red-500/15 hover:text-red-400/70 transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed hidden sm:block"
              >
                Clear
              </button>
              <button
                onClick={saveDeck}
                disabled={isSaving || deckCardIds.length === 0 || guestAtDeckLimit}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed ${
                  guestAtDeckLimit
                    ? "bg-white/5 text-white/30 border-white/10"
                    : "bg-amber-500/15 text-amber-200/80 hover:bg-amber-500/25 hover:text-amber-200 border-amber-500/25 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                }`}
                style={{ fontFamily: "var(--font-heading)" }}
                title={guestAtDeckLimit ? "Sign in to save more decks" : undefined}
              >
                {isSaving ? "Saving..." : guestAtDeckLimit ? "Limit Reached" : "Save"}
              </button>
            </div>
          </div>

          {/* Save message */}
          <AnimatePresence>
            {saveMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className={`text-xs px-5 py-1.5 ${saveMessage.includes("failed") ? "text-red-400/70 bg-red-500/5" : "text-green-400/70 bg-green-500/5"}`}>
                  {saveMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Main Content: 50/50 Split ────────────────────── */}
        <div className="flex-1 flex overflow-hidden">
          {/* Card Browser (left 50%) */}
          <div className={`w-full lg:w-1/2 overflow-y-auto p-3 sm:p-4 ${showDeckPanel ? "hidden lg:block" : ""}`}>
            {filteredCards.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-white/20 text-base">No cards match your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                <AnimatePresence mode="popLayout">
                  {filteredCards.map((card) => (
                    <DeckCard
                      key={card.id}
                      card={card}
                      isInDeck={deckCardIds.includes(card.id)}
                      count={deckCardIds.filter((id) => id === card.id).length}
                      onToggle={() => toggleCard(card.id)}
                      onViewDetail={() => setDetailCard(card)}
                      disabled={isFull}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Dynamic Deck Insights Panel (right 50%) */}
          <div
            ref={deckPanelRef}
            className={`w-full lg:w-1/2 shrink-0 border-l border-white/[0.06] bg-gradient-to-b from-black/40 via-black/30 to-black/40 overflow-y-auto ${
              showDeckPanel ? "" : "hidden lg:block"
            }`}
          >
            <DeckInsightsPanel
              deckCards={deckCards}
              deckCardIds={deckCardIds}
              deckStats={deckStats}
              sinColor={sinColor}
              selectedFaction={selectedFaction}
              isFull={isFull}
              removeCard={removeCard}
              setDetailCard={setDetailCard}
            />
          </div>
        </div>
      </div>

      {/* Card Detail Popup */}
      <AnimatePresence>
        {detailCard && (
          <CardDetailPopup
            card={detailCard}
            isInDeck={deckCardIds.includes(detailCard.id)}
            isFull={isFull}
            onToggle={() => {
              toggleCard(detailCard.id);
            }}
            onClose={() => setDetailCard(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
