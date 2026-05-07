/**
 * Collection Page — Card Gallery & Compendium
 *
 * Browse all 424 cards across 7 factions (378 standard + 46 zero-cost).
 * Filter by faction, tier, effect type, compound pattern, and search by name.
 * Click a card to see its full details in a modal.
 */
import { useState, useMemo, useCallback, memo, lazy, Suspense } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_CARDS } from "@shared/cardData";
import { CARD_ART_URLS } from "@/lib/cardArtUrls";
import { SIN_ARCHETYPE_ICONS, getEffectIconUrl } from "@/lib/iconUtils";
import {
  CardDefinition,
  SinType,
  EffectType,
  CardTier,
  CompoundPattern,
  PASSIVE_INFO,
  getCompoundTickValue,
} from "@shared/gameTypes";
import { getCardTargetMode } from "@/lib/targetModeUtils";
import { usePageMeta } from "@/hooks/usePageMeta";

// ─── Constants ──────────────────────────────────────────────
const SINS: SinType[] = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];

const SIN_COLORS: Record<SinType, string> = {
  wrath: "#ef4444",
  sloth: "#a855f7",
  greed: "#eab308",
  envy: "#10b981",
  pride: "#f0f0f0",
  lust: "#ec4899",
  gluttony: "#b45309",
};

const SIN_BG: Record<SinType, string> = {
  wrath: "from-red-950/40 to-red-900/20",
  sloth: "from-purple-950/40 to-purple-900/20",
  greed: "from-yellow-950/40 to-yellow-900/20",
  envy: "from-green-950/40 to-green-900/20",
  pride: "from-slate-800/40 to-slate-700/20",
  lust: "from-pink-950/40 to-pink-900/20",
  gluttony: "from-orange-950/40 to-orange-900/20",
};

const TIER_COLORS: Record<CardTier, string> = {
  common: "#9ca3af",
  rare: "#60a5fa",
  epic: "#c084fc",
};

const EFFECT_LABELS: Record<EffectType, string> = {
  damage: "Damage",
  self_damage: "Self Damage",
  heal_gain: "Heal",
  heal_steal: "Heal Steal",
  heal_block: "Heal Block",
  shield_gain: "Shield",
  shield_steal: "Shield Steal",
  shield_block: "Shield Block",
  energy_gain: "Energy Gain",
  energy_steal: "Energy Steal",
  energy_block: "Energy Block",
  affliction_amplify: "Affliction Amp",
  affliction_transfer: "Affliction Transfer",
  discard_burn: "Discard Burn",
  energy_regen: "Energy Regen",
  draw_boost: "Draw Boost",
  draw_reduction: "Draw Reduction",
};

const PATTERN_LABELS: Record<CompoundPattern, string> = {
  standard: "Standard",
  aggressive: "Aggressive",
  slowburn: "Slowburn",
};

const PATTERN_COLORS: Record<CompoundPattern, string> = {
  standard: "#60a5fa",
  aggressive: "#ef4444",
  slowburn: "#a855f7",
};

// ─── Mini Card Component (Gallery Grid) ─────────────────────
const MiniCard = memo(function MiniCard({
  card,
  onClick,
  compareMode,
  isCompared,
  onToggleCompare,
}: {
  card: CardDefinition;
  onClick: () => void;
  compareMode?: boolean;
  isCompared?: boolean;
  onToggleCompare?: () => void;
}) {
  const sinColor = SIN_COLORS[card.sin];
  const artUrl = CARD_ART_URLS[card.id];
  const tierColor = TIER_COLORS[card.tier];

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={compareMode ? (onToggleCompare || onClick) : onClick}
      className={`group relative flex flex-col rounded-lg overflow-hidden cursor-pointer
                 border transition-all duration-200
                 bg-black/40 hover:bg-black/60 hover:shadow-lg hover:shadow-black/40
                 hover:-translate-y-1 active:scale-95
                 ${isCompared ? 'ring-2 ring-amber-400/60 border-amber-400/40' : 'border-white/10 hover:border-white/30'}`}
      style={{ borderColor: isCompared ? undefined : `${sinColor}30` }}
    >
      {/* Art */}
      <div className="relative aspect-[3/4] overflow-hidden bg-black">
        {artUrl ? (
          <>
            <img
              src={artUrl}
              alt={card.name}
              className="w-full h-full object-cover transition-transform duration-300 scale-[1.12] group-hover:scale-[1.22]"
              loading="lazy"
            />
            {/* Inset shadow to feather any remaining white edges from source art */}
            <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 12px 6px rgba(0,0,0,0.85)' }} />
          </>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `${sinColor}15` }}
          >
            <img
              src={SIN_ARCHETYPE_ICONS[card.sin]}
              alt={card.sin}
              className="w-10 h-10 opacity-40"
            />
          </div>
        )}
        {/* Cost badge */}
        <div
          className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center
                      text-xs font-bold text-black shadow-md"
          style={{ background: sinColor }}
        >
          {card.cost}
        </div>
        {/* Tier badge */}
        <div
          className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: `${tierColor}30`, color: tierColor }}
        >
          {card.tier}
        </div>
        {/* Skip-queue badge */}
        {card.skipQueue && (
          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase
                          bg-yellow-500/30 text-yellow-300 border border-yellow-500/40">
            Priority
          </div>
        )}
        {/* Target mode badge */}
        {(() => {
          const tm = getCardTargetMode(card);
          return tm ? (
            <div
              className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide"
              style={{ color: tm.color, background: tm.bgColor, border: `1px solid ${tm.color}30` }}
            >
              {tm.shortLabel}
            </div>
          ) : null;
        })()}
        {/* Compare checkbox overlay */}
        {compareMode && (
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-150
                          ${isCompared ? 'bg-amber-500/10' : 'bg-black/20'}`}>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                            ${isCompared ? 'bg-amber-500 border-amber-400 scale-110' : 'bg-black/60 border-white/30'}`}>
              {isCompared && (
                <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-2 flex flex-col gap-0.5">
        <p
          className="text-xs font-semibold truncate"
          style={{ color: sinColor }}
        >
          {card.name}
        </p>
        <div className="flex items-center gap-1 flex-wrap">
          {card.effects.slice(0, 3).map((eff, i) => (
            <span
              key={i}
              className="text-[9px] px-1 py-0.5 rounded bg-white/5 text-white/50"
            >
              {EFFECT_LABELS[eff.type] || eff.type}
            </span>
          ))}
          {card.effects.length > 3 && (
            <span className="text-[9px] text-white/30">+{card.effects.length - 3}</span>
          )}
        </div>
      </div>
    </motion.button>
  );
});

// ─── Card Detail Modal ──────────────────────────────────────
function CardDetailModal({
  card,
  onClose,
}: {
  card: CardDefinition;
  onClose: () => void;
}) {
  const sinColor = SIN_COLORS[card.sin];
  const artUrl = CARD_ART_URLS[card.id];
  const passive = PASSIVE_INFO[card.sin];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-lg rounded-xl overflow-hidden border border-white/10 bg-black/90"
        style={{ borderColor: `${sinColor}40` }}
      >
        {/* Header with art */}
        <div className="relative h-56 overflow-hidden bg-black">
          {artUrl ? (
            <>
              <img src={artUrl} alt={card.name} className="w-full h-full object-cover scale-[1.12]" />
              <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 20px 10px rgba(0,0,0,0.85)' }} />
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `${sinColor}20` }}
            >
              <img src={SIN_ARCHETYPE_ICONS[card.sin]} alt={card.sin} className="w-20 h-20 opacity-30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 border border-white/20
                       flex items-center justify-center text-white/60 hover:text-white hover:bg-black/80 transition-colors"
          >
            x
          </button>

          {/* Card name overlay */}
          <div className="absolute bottom-3 left-4 right-4">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="px-2 py-0.5 rounded text-xs font-bold uppercase"
                style={{ background: sinColor, color: "#000" }}
              >
                {card.sin}
              </span>
              <span
                className="px-2 py-0.5 rounded text-xs font-semibold uppercase"
                style={{ background: `${TIER_COLORS[card.tier]}30`, color: TIER_COLORS[card.tier] }}
              >
                {card.tier}
              </span>
              {card.skipQueue && (
                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-yellow-500/30 text-yellow-300 border border-yellow-500/40">
                  Priority
                </span>
              )}
              {(() => {
                const tm = getCardTargetMode(card);
                return tm ? (
                  <span
                    className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide"
                    style={{ color: tm.color, background: tm.bgColor, border: `1px solid ${tm.color}30` }}
                  >
                    {tm.label}
                  </span>
                ) : null;
              })()}
            </div>
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              {card.name}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Stats row */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-white/40">Cost:</span>
              <span className="font-bold text-white" style={{ color: sinColor }}>
                {card.cost}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-white/40">Pattern:</span>
              <span
                className="font-semibold"
                style={{ color: PATTERN_COLORS[card.compoundPattern] }}
              >
                {PATTERN_LABELS[card.compoundPattern]}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-white/40">ID:</span>
              <span className="font-mono text-white/50 text-xs">{card.id}</span>
            </div>
          </div>

          {/* Description */}
          {card.description && (
            <p className="text-sm text-white/60 italic leading-relaxed">
              "{card.description}"
            </p>
          )}

          {/* Effects */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Effects
            </h3>
            <div className="space-y-1.5">
              {card.effects.map((eff, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5"
                >
                  <div className="flex items-center gap-2">
                    {getEffectIconUrl(eff.type, card.sin) && (
                      <img
                        src={getEffectIconUrl(eff.type, card.sin)!}
                        alt={eff.type}
                        className="w-5 h-5 opacity-70"
                      />
                    )}
                    <span className="text-sm font-medium text-white/80">
                      {EFFECT_LABELS[eff.type] || eff.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <span>
                      Base: <span className="text-white/80 font-semibold">{eff.baseValue}</span>
                    </span>
                    <span>
                      Duration: <span className="text-white/80 font-semibold">{eff.duration}t</span>
                    </span>
                    <span className="capitalize px-1.5 py-0.5 rounded bg-white/5">
                      {eff.targetMode}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compound tick preview */}
          {card.effects[0] && (() => {
            const eff = card.effects[0];
            const ticks = Array.from({ length: eff.duration }, (_, i) => ({
              round: i + 1,
              value: getCompoundTickValue(eff.baseValue, card.compoundPattern, i),
            }));
            const total = ticks.reduce((s, t) => s + t.value, 0);
            const effectLabel = EFFECT_LABELS[eff.type] || eff.type;
            return (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Damage Over Time — {effectLabel}
                </h3>
                {/* Timeline */}
                <div className="flex items-stretch gap-0.5">
                  {ticks.map((t, i) => {
                    const maxVal = ticks[ticks.length - 1].value;
                    const height = maxVal > 0 ? (t.value / maxVal) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <span className="text-[10px] font-semibold mb-0.5" style={{ color: PATTERN_COLORS[card.compoundPattern] }}>
                          {t.value}
                        </span>
                        <div className="w-full flex-1 flex items-end" style={{ minHeight: "24px" }}>
                          <div
                            className="w-full rounded-t"
                            style={{
                              height: `${Math.max(height, 12)}%`,
                              background: `${PATTERN_COLORS[card.compoundPattern]}60`,
                              border: `1px solid ${PATTERN_COLORS[card.compoundPattern]}40`,
                              minHeight: "4px",
                            }}
                          />
                        </div>
                        <span className="text-[9px] text-white/30 mt-0.5">R{t.round}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Summary */}
                <div className="flex items-center justify-between text-[10px] px-1 pt-1 border-t border-white/5">
                  <span className="text-white/35">
                    {ticks.map(t => t.value).join(" → ")} per round
                  </span>
                  <span className="font-semibold" style={{ color: PATTERN_COLORS[card.compoundPattern] }}>
                    Total: {total}
                  </span>
                </div>
                <p className="text-[10px] text-white/30 leading-relaxed">
                  This card ticks once per round for {eff.duration} rounds. Each round applies {effectLabel.toLowerCase()} equal to base value ({eff.baseValue}) × the <span style={{ color: PATTERN_COLORS[card.compoundPattern] }}>{PATTERN_LABELS[card.compoundPattern]}</span> multiplier for that round.
                </p>
              </div>
            );
          })()}

          {/* Faction passive */}
          <div
            className="p-3 rounded-lg border border-white/5"
            style={{ background: `${sinColor}08`, borderColor: `${sinColor}20` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{passive.icon}</span>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: sinColor }}>
                {passive.name}
              </span>
            </div>
            <p className="text-xs text-white/50">{passive.description}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Filter Pill ────────────────────────────────────────────
function FilterPill({
  label,
  active,
  color,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  color?: string;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border
        ${active
          ? "bg-white/15 border-white/30 text-white shadow-sm"
          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70"
        }`}
      style={active && color ? { borderColor: `${color}60`, background: `${color}20`, color } : undefined}
    >
      {label}
      {count !== undefined && (
        <span className="ml-1.5 text-[10px] opacity-60">({count})</span>
      )}
    </button>
  );
}

// ─── Main Collection Page ───────────────────────────────────
export default function Collection() {
  usePageMeta({
    title: "Card Collection — All 140+ Cards",
    description: "Browse the complete card collection for all 7 sin factions. Filter by faction, cost, type, and rarity. View card art, stats, and compound effects.",
    canonicalPath: "/collection",
  });

  const [selectedSin, setSelectedSin] = useState<SinType | "all">("all");
  const [selectedTier, setSelectedTier] = useState<CardTier | "all">("all");
  const [selectedEffect, setSelectedEffect] = useState<EffectType | "all">("all");
  const [selectedPattern, setSelectedPattern] = useState<CompoundPattern | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<CardDefinition | null>(null);
  const [showPriorityOnly, setShowPriorityOnly] = useState(false);
  const [selectedTargetMode, setSelectedTargetMode] = useState<"all" | "aoe" | "duo" | "mixed" | "single" | "self">("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Compare mode
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const MAX_COMPARE = 3;

  const toggleCompare = useCallback((cardId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(cardId)) return prev.filter((id) => id !== cardId);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, cardId];
    });
  }, []);

  const compareCards = useMemo(() => {
    return compareIds.map((id) => ALL_CARDS.find((c) => c.id === id)).filter(Boolean) as CardDefinition[];
  }, [compareIds]);

  const exitCompareMode = useCallback(() => {
    setCompareMode(false);
    setCompareIds([]);
  }, []);

  // Get all unique effect types present in cards
  const availableEffects = useMemo(() => {
    const effects = new Set<EffectType>();
    ALL_CARDS.forEach((card) => card.effects.forEach((eff) => effects.add(eff.type)));
    return Array.from(effects).sort();
  }, []);

  // Filter cards
  const filteredCards = useMemo(() => {
    return ALL_CARDS.filter((card) => {
      if (selectedSin !== "all" && card.sin !== selectedSin) return false;
      if (selectedTier !== "all" && card.tier !== selectedTier) return false;
      if (selectedPattern !== "all" && card.compoundPattern !== selectedPattern) return false;
      if (showPriorityOnly && !card.skipQueue) return false;
      if (selectedEffect !== "all") {
        if (!card.effects.some((eff) => eff.type === selectedEffect)) return false;
      }
      if (selectedTargetMode !== "all") {
        const tm = getCardTargetMode(card);
        if (!tm || tm.mode !== selectedTargetMode) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !card.name.toLowerCase().includes(q) &&
          !card.id.toLowerCase().includes(q) &&
          !(card.description || "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [selectedSin, selectedTier, selectedEffect, selectedPattern, searchQuery, showPriorityOnly, selectedTargetMode]);

  // Stats
  const stats = useMemo(() => {
    const sinCounts: Record<string, number> = {};
    SINS.forEach((s) => {
      sinCounts[s] = ALL_CARDS.filter((c) => c.sin === s).length;
    });
    return {
      total: ALL_CARDS.length,
      sinCounts,
      tierCounts: {
        common: ALL_CARDS.filter((c) => c.tier === "common").length,
        rare: ALL_CARDS.filter((c) => c.tier === "rare").length,
        epic: ALL_CARDS.filter((c) => c.tier === "epic").length,
      },
      priorityCount: ALL_CARDS.filter((c) => c.skipQueue).length,
    };
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedSin("all");
    setSelectedTier("all");
    setSelectedEffect("all");
    setSelectedPattern("all");
    setSelectedTargetMode("all");
    setSearchQuery("");
    setShowPriorityOnly(false);
  }, []);

  const hasActiveFilters =
    selectedSin !== "all" ||
    selectedTier !== "all" ||
    selectedEffect !== "all" ||
    selectedPattern !== "all" ||
    selectedTargetMode !== "all" ||
    searchQuery !== "" ||
    showPriorityOnly;

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <span className="text-white/50 hover:text-white/80 transition-colors text-sm cursor-pointer">
                &larr; Home
              </span>
            </Link>
            <div>
              <h1
                className="text-lg font-bold tracking-wide"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Card Collection
              </h1>
              <p className="text-xs text-white/40">
                {filteredCards.length} of {stats.total} cards
                {hasActiveFilters && " (filtered)"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Compare toggle */}
            <button
              onClick={() => compareMode ? exitCompareMode() : setCompareMode(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all duration-200 flex items-center gap-1.5
                ${compareMode
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                  : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60'}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              {compareMode ? `Compare (${compareIds.length}/${MAX_COMPARE})` : 'Compare'}
            </button>
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 md:w-64 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10
                           text-sm text-white placeholder-white/30 outline-none
                           focus:border-white/30 focus:bg-white/10 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-xs"
                >
                  x
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Mobile filter toggle */}
        <div className="flex items-center justify-between mb-3 sm:mb-0">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="sm:hidden flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10
                       text-xs font-semibold uppercase tracking-wider text-white/60 hover:bg-white/10 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="20" y2="12" />
              <line x1="12" y1="18" x2="20" y2="18" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="sm:hidden text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Filter Section — always visible on desktop, collapsible on mobile */}
        <div className={`space-y-4 mb-4 sm:mb-6 ${filtersOpen ? 'block' : 'hidden'} sm:block`}>
          {/* Faction filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Faction</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="hidden sm:inline text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterPill
                label="All"
                active={selectedSin === "all"}
                onClick={() => setSelectedSin("all")}
                count={stats.total}
              />
              {SINS.map((sin) => (
                <FilterPill
                  key={sin}
                  label={sin.charAt(0).toUpperCase() + sin.slice(1)}
                  active={selectedSin === sin}
                  color={SIN_COLORS[sin]}
                  onClick={() => setSelectedSin(selectedSin === sin ? "all" : sin)}
                  count={stats.sinCounts[sin]}
                />
              ))}
            </div>
          </div>

          {/* Second row: Tier + Pattern + Priority */}
          <div className="flex flex-wrap gap-4 sm:gap-6">
            {/* Tier */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Tier</h3>
              <div className="flex flex-wrap gap-1.5">
                <FilterPill
                  label="All"
                  active={selectedTier === "all"}
                  onClick={() => setSelectedTier("all")}
                />
                {(["common", "rare", "epic"] as CardTier[]).map((tier) => (
                  <FilterPill
                    key={tier}
                    label={tier.charAt(0).toUpperCase() + tier.slice(1)}
                    active={selectedTier === tier}
                    color={TIER_COLORS[tier]}
                    onClick={() => setSelectedTier(selectedTier === tier ? "all" : tier)}
                    count={stats.tierCounts[tier]}
                  />
                ))}
              </div>
            </div>

            {/* Pattern */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Pattern</h3>
              <div className="flex flex-wrap gap-1.5">
                <FilterPill
                  label="All"
                  active={selectedPattern === "all"}
                  onClick={() => setSelectedPattern("all")}
                />
                {(["standard", "aggressive", "slowburn"] as CompoundPattern[]).map((p) => (
                  <FilterPill
                    key={p}
                    label={PATTERN_LABELS[p]}
                    active={selectedPattern === p}
                    color={PATTERN_COLORS[p]}
                    onClick={() => setSelectedPattern(selectedPattern === p ? "all" : p)}
                  />
                ))}
              </div>
            </div>

            {/* Target Mode */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Target</h3>
              <div className="flex flex-wrap gap-1.5">
                <FilterPill
                  label="All"
                  active={selectedTargetMode === "all"}
                  onClick={() => setSelectedTargetMode("all")}
                />
                {(["single", "aoe", "duo", "self", "mixed"] as const).map((mode) => {
                  const info: Record<string, { label: string; color: string }> = {
                    single: { label: "Single", color: "#3b82f6" },
                    aoe: { label: "AoE", color: "#f97316" },
                    duo: { label: "Duo", color: "#a855f7" },
                    self: { label: "Self", color: "#22c55e" },
                    mixed: { label: "Mixed", color: "#22c55e" },
                  };
                  return (
                    <FilterPill
                      key={mode}
                      label={info[mode].label}
                      active={selectedTargetMode === mode}
                      color={info[mode].color}
                      onClick={() => setSelectedTargetMode(selectedTargetMode === mode ? "all" : mode)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Special</h3>
              <div className="flex gap-1.5">
                <FilterPill
                  label="Priority Only"
                  active={showPriorityOnly}
                  color="#eab308"
                  onClick={() => setShowPriorityOnly(!showPriorityOnly)}
                  count={stats.priorityCount}
                />
              </div>
            </div>
          </div>

          {/* Effect type filter */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Effect Type</h3>
            <div className="flex flex-wrap gap-1.5">
              <FilterPill
                label="All"
                active={selectedEffect === "all"}
                onClick={() => setSelectedEffect("all")}
              />
              {availableEffects.map((eff) => (
                <FilterPill
                  key={eff}
                  label={EFFECT_LABELS[eff] || eff}
                  active={selectedEffect === eff}
                  onClick={() => setSelectedEffect(selectedEffect === eff ? "all" : eff)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Faction summary bar (when "all" selected) — scrollable on mobile */}
        {selectedSin === "all" && !hasActiveFilters && (
          <div className="mb-4 sm:mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex sm:grid sm:grid-cols-7 gap-2 overflow-x-auto pb-2 sm:pb-0 snap-x snap-mandatory scrollbar-hide">
              {SINS.map((sin) => {
                const passive = PASSIVE_INFO[sin];
                return (
                  <button
                    key={sin}
                    onClick={() => setSelectedSin(sin)}
                    className={`snap-start shrink-0 w-[110px] sm:w-auto p-2.5 sm:p-3 rounded-lg border border-white/5 bg-gradient-to-br ${SIN_BG[sin]}
                               hover:border-white/20 transition-all duration-200 group cursor-pointer`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <img src={SIN_ARCHETYPE_ICONS[sin]} alt={sin} className="w-4 h-4 opacity-60" />
                      <span
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: SIN_COLORS[sin] }}
                      >
                        {sin}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/40 leading-tight">
                      {passive.name}
                    </p>
                    <p className="text-[10px] text-white/25 mt-0.5">
                      {stats.sinCounts[sin]} cards
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Card Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card) => (
              <MiniCard
                key={card.id}
                card={card}
                onClick={() => setSelectedCard(card)}
                compareMode={compareMode}
                isCompared={compareIds.includes(card.id)}
                onToggleCompare={() => toggleCompare(card.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {filteredCards.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/30 text-lg mb-2">No cards match your filters</p>
            <button
              onClick={clearFilters}
              className="text-sm text-white/50 hover:text-white/80 underline transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Footer stats */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-white/20">
            {stats.total} cards across {SINS.length} factions | {stats.priorityCount} priority cards |{" "}
            {stats.tierCounts.common} common, {stats.tierCounts.rare} rare, {stats.tierCounts.epic} epic
          </p>
        </div>
      </div>

      {/* Compare Panel — sticky bottom bar when cards are selected */}
      <AnimatePresence>
        {compareMode && compareCards.length >= 2 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-amber-500/20 shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 pb-[env(safe-area-inset-bottom,16px)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300" style={{ fontFamily: "var(--font-heading)" }}>
                  Comparing {compareCards.length} Cards
                </h3>
                <button
                  onClick={exitCompareMode}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded border border-white/10 hover:border-white/20"
                >
                  Close
                </button>
              </div>

              {/* Side-by-side comparison */}
              <div className={`grid gap-3 ${compareCards.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'} max-h-[60vh] sm:max-h-none overflow-y-auto sm:overflow-visible`}>
                {compareCards.map((card) => {
                  const sinColor = SIN_COLORS[card.sin];
                  const tm = getCardTargetMode(card);
                  const artUrl = CARD_ART_URLS[card.id];
                  return (
                    <div
                      key={card.id}
                      className="rounded-lg border border-white/10 bg-white/[0.02] overflow-hidden"
                      style={{ borderColor: `${sinColor}30` }}
                    >
                      {/* Card header with art */}
                      <div className="flex items-center gap-3 p-3">
                        <div className="w-12 h-16 rounded overflow-hidden bg-black shrink-0">
                          {artUrl ? (
                            <img src={artUrl} alt={card.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: `${sinColor}15` }}>
                              <img src={SIN_ARCHETYPE_ICONS[card.sin]} alt={card.sin} className="w-6 h-6 opacity-40" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold truncate" style={{ color: sinColor, fontFamily: "var(--font-heading)" }}>
                            {card.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ background: sinColor, color: '#000' }}>
                              {card.sin}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase" style={{ background: `${TIER_COLORS[card.tier]}30`, color: TIER_COLORS[card.tier] }}>
                              {card.tier}
                            </span>
                            {tm && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ color: tm.color, background: tm.bgColor }}>
                                {tm.shortLabel}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleCompare(card.id)}
                          className="shrink-0 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-red-400 hover:border-red-400/30 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-3 gap-px bg-white/5">
                        <div className="bg-black/80 p-2 text-center">
                          <p className="text-[9px] text-white/30 uppercase">Cost</p>
                          <p className="text-sm font-bold" style={{ color: sinColor }}>{card.cost}</p>
                        </div>
                        <div className="bg-black/80 p-2 text-center">
                          <p className="text-[9px] text-white/30 uppercase">Pattern</p>
                          <p className="text-[11px] font-semibold" style={{ color: PATTERN_COLORS[card.compoundPattern] }}>
                            {PATTERN_LABELS[card.compoundPattern]}
                          </p>
                        </div>
                        <div className="bg-black/80 p-2 text-center">
                          <p className="text-[9px] text-white/30 uppercase">Effects</p>
                          <p className="text-sm font-bold text-white/70">{card.effects.length}</p>
                        </div>
                      </div>

                      {/* Effects list */}
                      <div className="p-2 space-y-1">
                        {card.effects.map((eff, i) => {
                          const totalDmg = Array.from({ length: eff.duration }, (_, t) =>
                            getCompoundTickValue(eff.baseValue, card.compoundPattern, t)
                          ).reduce((a, b) => a + b, 0);
                          return (
                            <div key={i} className="flex items-center justify-between text-[10px] px-2 py-1.5 rounded bg-white/[0.03]">
                              <div className="flex items-center gap-1.5">
                                {getEffectIconUrl(eff.type, card.sin) && (
                                  <img src={getEffectIconUrl(eff.type, card.sin)!} alt={eff.type} className="w-3.5 h-3.5 opacity-60" />
                                )}
                                <span className="text-white/60 font-medium">{EFFECT_LABELS[eff.type] || eff.type}</span>
                              </div>
                              <div className="flex items-center gap-2 text-white/40">
                                <span>B:{eff.baseValue}</span>
                                <span>{eff.duration}t</span>
                                <span className="font-bold text-white/60">={totalDmg}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Total output */}
                      <div className="px-3 py-2 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] text-white/30 uppercase">Total Output</span>
                        <span className="text-sm font-bold" style={{ color: sinColor }}>
                          {card.effects.reduce((sum, eff) => {
                            return sum + Array.from({ length: eff.duration }, (_, t) =>
                              getCompoundTickValue(eff.baseValue, card.compoundPattern, t)
                            ).reduce((a, b) => a + b, 0);
                          }, 0)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {compareCards.length < MAX_COMPARE && (
                <p className="text-[10px] text-white/20 text-center mt-2">
                  Select {MAX_COMPARE - compareCards.length} more card{MAX_COMPARE - compareCards.length > 1 ? 's' : ''} to compare
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare mode instruction banner */}
      <AnimatePresence>
        {compareMode && compareCards.length < 2 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-amber-500/20"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 pb-[env(safe-area-inset-bottom,12px)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <span className="text-amber-300 text-sm font-bold">{compareIds.length}</span>
                </div>
                <p className="text-sm text-white/60">
                  Select {2 - compareIds.length} more card{2 - compareIds.length > 1 ? 's' : ''} to compare (up to {MAX_COMPARE})
                </p>
              </div>
              <button
                onClick={exitCompareMode}
                className="text-xs text-white/40 hover:text-white/70 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Detail Modal */}
      <AnimatePresence>
        {selectedCard && !compareMode && (
          <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
