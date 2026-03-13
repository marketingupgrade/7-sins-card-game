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

import { useState, useMemo, useCallback, useEffect, useRef, memo } from "react";
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
          className="absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black shadow-md"
          style={{ background: sinColor }}
        >
          {card.cost}
        </div>

        {/* Tier badge */}
        <div
          className="absolute top-1 right-1 px-1 py-0.5 rounded text-[7px] font-semibold uppercase tracking-wider"
          style={{ background: `${tierColor}30`, color: tierColor }}
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
        className="p-1.5 flex flex-col gap-0.5 text-left w-full hover:bg-white/5 transition-colors"
        title="Click for card details"
      >
        <p className="text-[11px] font-semibold truncate leading-tight" style={{ color: isInDeck ? sinColor : `${sinColor}cc` }}>
          {card.name}
        </p>
        <div className="flex items-center gap-0.5 flex-wrap">
          {card.effects.slice(0, 2).map((eff, i) => (
            <span key={i} className="text-[8px] px-1 py-0.5 rounded bg-white/5 text-white/50 leading-none">
              {EFFECT_LABELS[eff.type] || eff.type}
            </span>
          ))}
          {card.effects.length > 2 && (
            <span className="text-[8px] text-white/25">+{card.effects.length - 2}</span>
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

  // Auto-fill remaining slots
  const autoFill = useCallback(() => {
    const remaining = MAX_DECK_SIZE - deckCardIds.length;
    if (remaining <= 0) return;
    const available = factionCards.filter((c) => !deckCardIds.includes(c.id));
    const sorted = [...available].sort((a, b) => {
      const tierOrder = { epic: 0, rare: 1, common: 2 };
      if (tierOrder[a.tier] !== tierOrder[b.tier]) return tierOrder[a.tier] - tierOrder[b.tier];
      return b.cost - a.cost;
    });
    const toAdd = sorted.slice(0, remaining).map((c) => c.id);
    setDeckCardIds((prev) => [...prev, ...toAdd]);
  }, [deckCardIds, factionCards]);

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
        await trpcMutate("deck.create", {
          supabaseUserId: user.id,
          name: deck.name,
          faction: deck.faction,
          cardIds: JSON.stringify(deck.cardIds),
        });
      }

      const updated = activeDeckId
        ? savedDecks.map((d) => (d.id === activeDeckId ? deck : d))
        : [...savedDecks, deck];
      setSavedDecks(updated);
      saveLocalDecks(updated);
      setActiveDeckId(deck.id);
      setSaveMessage("Deck saved!");
    } catch (err: any) {
      setSaveMessage(`Save failed: ${err.message}`);
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
        {/* ─── Top Bar ─────────────────────────────────────── */}
        <div className="shrink-0 px-3 sm:px-6 py-3 border-b border-white/5 bg-black/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {/* Back button */}
            <button
              onClick={() => { setSelectedFaction(null); clearDeck(); }}
              className="shrink-0 flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-white/40 hover:text-amber-200/70 hover:bg-white/5 transition-all text-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span className="hidden sm:inline">Factions</span>
            </button>

            {/* Faction badge */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border" style={{ borderColor: `${sinColor}40` }}>
                <img src={SIN_ARCHETYPE_ICONS[selectedFaction]} alt="" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-base font-bold tracking-wider" style={{ fontFamily: "var(--font-heading)", color: sinColor }}>
                {SIN_LABELS[selectedFaction]}
              </h2>
            </div>

            {/* Deck name input */}
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              className="hidden sm:block ml-4 px-3 py-1.5 bg-transparent border border-white/10 rounded-lg text-sm text-white/70 focus:border-amber-500/30 focus:outline-none w-44"
              style={{ fontFamily: "var(--font-heading)" }}
              placeholder="Deck name..."
            />

            {/* Spacer */}
            <div className="flex-1" />

            {/* Deck counter */}
            <div className="flex items-center gap-2">
              <div
                className={`px-3 py-1.5 rounded-lg text-base font-bold tracking-wider ${
                  isFull ? "bg-green-500/15 text-green-400" : "bg-white/5 text-white/50"
                }`}
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {deckCardIds.length}/{MAX_DECK_SIZE}
              </div>

              {/* Mobile deck panel toggle */}
              <button
                onClick={() => setShowDeckPanel(!showDeckPanel)}
                className="lg:hidden px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-200/70 text-sm font-medium"
              >
                {showDeckPanel ? "Cards" : "Deck"}
              </button>
            </div>
          </div>

          {/* Mobile deck name */}
          <input
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            className="sm:hidden mt-2 w-full px-3 py-1.5 bg-transparent border border-white/10 rounded-lg text-sm text-white/70 focus:border-amber-500/30 focus:outline-none"
            style={{ fontFamily: "var(--font-heading)" }}
            placeholder="Deck name..."
          />

          {/* Filters Row */}
          <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
            {/* Search */}
            <div className="relative shrink-0">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cards..."
                className="pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 focus:border-amber-500/20 focus:outline-none w-36 sm:w-44"
              />
            </div>

            {/* Tier filters */}
            <div className="flex items-center gap-1 shrink-0">
              {(["all", "common", "rare", "epic"] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all ${
                    tierFilter === tier
                      ? "bg-amber-500/15 text-amber-200/80 border border-amber-500/20"
                      : "bg-white/5 text-white/30 border border-transparent hover:bg-white/10"
                  }`}
                >
                  {tier === "all" ? "All" : tier}
                </button>
              ))}
            </div>

            {/* Effect filter */}
            <select
              value={effectFilter}
              onChange={(e) => setEffectFilter(e.target.value)}
              className="shrink-0 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/50 focus:border-amber-500/20 focus:outline-none cursor-pointer"
            >
              {EFFECT_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-black text-white">
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="shrink-0 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/50 focus:border-amber-500/20 focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-black text-white">
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={autoFill}
                disabled={isFull}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Auto-fill
              </button>
              <button
                onClick={clearDeck}
                disabled={deckCardIds.length === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400/40 hover:bg-red-500/20 hover:text-red-400/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Clear
              </button>
              <button
                onClick={saveDeck}
                disabled={isSaving || deckCardIds.length === 0 || guestAtDeckLimit}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                  guestAtDeckLimit
                    ? "bg-white/5 text-white/30 border-white/10"
                    : "bg-amber-500/15 text-amber-200/80 hover:bg-amber-500/25 hover:text-amber-200 border-amber-500/20"
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
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`text-xs mt-1 ${saveMessage.includes("failed") ? "text-red-400/70" : "text-green-400/70"}`}
              >
                {saveMessage}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Main Content ────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">
          {/* Card Browser (left/main) */}
          <div className={`flex-1 overflow-y-auto p-3 sm:p-4 ${showDeckPanel ? "hidden lg:block" : ""}`}>
            {/* Card count */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-white/30">
                {filteredCards.length} card{filteredCards.length !== 1 ? "s" : ""} shown
                {deckCardIds.length > 0 && ` · ${deckCardIds.length} in deck`}
              </p>
            </div>

            {filteredCards.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-white/20 text-base">No cards match your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2">
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

          {/* Deck Panel (right/overlay on mobile) */}
          <div
            ref={deckPanelRef}
            className={`w-full lg:w-80 xl:w-96 shrink-0 border-l border-white/5 bg-black/30 overflow-y-auto ${
              showDeckPanel ? "" : "hidden lg:block"
            }`}
          >
            <div className="p-3 sm:p-4">
              {/* Deck Stats */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <p className="text-lg font-bold" style={{ color: sinColor, fontFamily: "var(--font-heading)" }}>
                    {deckStats.total}
                  </p>
                  <p className="text-[9px] text-white/25 uppercase tracking-wider">Cards</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <p className="text-lg font-bold text-amber-200/70" style={{ fontFamily: "var(--font-heading)" }}>
                    {deckStats.avgCost.toFixed(1)}
                  </p>
                  <p className="text-[9px] text-white/25 uppercase tracking-wider">Avg Cost</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <p className="text-lg font-bold text-yellow-300/70" style={{ fontFamily: "var(--font-heading)" }}>
                    {deckStats.skipQueue}
                  </p>
                  <p className="text-[9px] text-white/25 uppercase tracking-wider">Priority</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xs font-bold" style={{ color: TIER_COLORS.epic }}>{deckStats.tiers.epic}</span>
                    <span className="text-white/10">/</span>
                    <span className="text-xs font-bold" style={{ color: TIER_COLORS.rare }}>{deckStats.tiers.rare}</span>
                    <span className="text-white/10">/</span>
                    <span className="text-xs font-bold" style={{ color: TIER_COLORS.common }}>{deckStats.tiers.common}</span>
                  </div>
                  <p className="text-[9px] text-white/25 uppercase tracking-wider">E/R/C</p>
                </div>
              </div>

              {/* Mana Curve */}
              <div className="mb-3 p-2 rounded-lg bg-white/3">
                <p className="text-[9px] text-white/25 uppercase tracking-wider mb-1 text-center">Mana Curve</p>
                <ManaCurve cards={deckCards} sinColor={sinColor} />
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: isFull ? "#22c55e" : sinColor }}
                    animate={{ width: `${(deckCardIds.length / MAX_DECK_SIZE) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                {isFull && (
                  <p className="text-xs text-green-400/60 text-center mt-1" style={{ fontFamily: "var(--font-heading)" }}>
                    Deck Complete
                  </p>
                )}
              </div>

              {/* Card list */}
              <div className="space-y-1">
                <AnimatePresence mode="popLayout">
                  {deckCards.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8"
                    >
                      <svg className="mx-auto mb-2 text-white/10" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect x="2" y="4" width="14" height="17" rx="2" />
                        <path d="M8 4V2a1 1 0 0 1 1-1h10a2 2 0 0 1 2 2v14a1 1 0 0 1-1 1h-2" />
                      </svg>
                      <p className="text-white/15 text-sm">Click cards to add them</p>
                    </motion.div>
                  ) : (
                    deckCards.map((card) => (
                      <DeckSlot
                        key={card.id}
                        card={card}
                        onRemove={() => removeCard(card.id)}
                        onViewDetail={() => setDetailCard(card)}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
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
