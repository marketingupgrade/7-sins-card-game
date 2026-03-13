/**
 * Collection Page — Card Gallery & Compendium
 *
 * Browse all 378 cards across 7 factions.
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

// ─── Constants ──────────────────────────────────────────────
const SINS: SinType[] = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];

const SIN_COLORS: Record<SinType, string> = {
  wrath: "#ef4444",
  sloth: "#a855f7",
  greed: "#eab308",
  envy: "#22c55e",
  pride: "#e2e2e2",
  lust: "#ec4899",
  gluttony: "#f97316",
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
}: {
  card: CardDefinition;
  onClick: () => void;
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
      onClick={onClick}
      className="group relative flex flex-col rounded-lg overflow-hidden cursor-pointer
                 border border-white/10 hover:border-white/30 transition-all duration-200
                 bg-black/40 hover:bg-black/60 hover:shadow-lg hover:shadow-black/40
                 hover:-translate-y-1 active:scale-95"
      style={{ borderColor: `${sinColor}30` }}
    >
      {/* Art */}
      <div className="relative aspect-square overflow-hidden bg-black/60">
        {artUrl ? (
          <img
            src={artUrl}
            alt={card.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
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
        <div className="relative h-56 overflow-hidden">
          {artUrl ? (
            <img src={artUrl} alt={card.name} className="w-full h-full object-cover" />
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
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Compound Tick Values (First Effect)
            </h3>
            <div className="flex items-end gap-1 h-12">
              {Array.from({ length: card.effects[0]?.duration || 0 }, (_, i) => {
                const val = getCompoundTickValue(
                  card.effects[0]?.baseValue || 0,
                  card.compoundPattern,
                  i
                );
                const maxVal = getCompoundTickValue(
                  card.effects[0]?.baseValue || 0,
                  card.compoundPattern,
                  (card.effects[0]?.duration || 1) - 1
                );
                const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <span className="text-[9px] text-white/40">{Math.round(val)}</span>
                    <div
                      className="w-full rounded-t"
                      style={{
                        height: `${Math.max(height, 8)}%`,
                        background: `${PATTERN_COLORS[card.compoundPattern]}80`,
                        minHeight: "3px",
                      }}
                    />
                    <span className="text-[8px] text-white/30">t{i + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>

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
  const [selectedSin, setSelectedSin] = useState<SinType | "all">("all");
  const [selectedTier, setSelectedTier] = useState<CardTier | "all">("all");
  const [selectedEffect, setSelectedEffect] = useState<EffectType | "all">("all");
  const [selectedPattern, setSelectedPattern] = useState<CompoundPattern | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<CardDefinition | null>(null);
  const [showPriorityOnly, setShowPriorityOnly] = useState(false);

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
  }, [selectedSin, selectedTier, selectedEffect, selectedPattern, searchQuery, showPriorityOnly]);

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
    setSearchQuery("");
    setShowPriorityOnly(false);
  }, []);

  const hasActiveFilters =
    selectedSin !== "all" ||
    selectedTier !== "all" ||
    selectedEffect !== "all" ||
    selectedPattern !== "all" ||
    searchQuery !== "" ||
    showPriorityOnly;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
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
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filter Section */}
        <div className="space-y-4 mb-6">
          {/* Faction filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Faction</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors"
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
          <div className="flex flex-wrap gap-6">
            {/* Tier */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Tier</h3>
              <div className="flex gap-1.5">
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
              <div className="flex gap-1.5">
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

        {/* Faction summary bar (when "all" selected) */}
        {selectedSin === "all" && !hasActiveFilters && (
          <div className="grid grid-cols-7 gap-2 mb-6">
            {SINS.map((sin) => {
              const passive = PASSIVE_INFO[sin];
              return (
                <button
                  key={sin}
                  onClick={() => setSelectedSin(sin)}
                  className={`p-3 rounded-lg border border-white/5 bg-gradient-to-br ${SIN_BG[sin]}
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
        )}

        {/* Card Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card) => (
              <MiniCard
                key={card.id}
                card={card}
                onClick={() => setSelectedCard(card)}
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

      {/* Card Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
