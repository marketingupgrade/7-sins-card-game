/**
 * DeckBuilder — Inspect and customize your sin faction deck.
 *
 * Shows all 36 cards for the selected sin, organized by cost curve.
 * Players can "favorite" cards (starred cards are drawn-priority flagged
 * in localStorage). On save, the ordering is persisted as 7sins_deck_${sin}.
 *
 * Route: /deck-builder (accessible from Home and Lobby)
 */

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useCallback } from "react";
import { useLocation, useSearch } from "wouter";
import GameCard from "@/components/GameCard";
import type { SinType, CardDefinition } from "@shared/gameTypes";
import { WRATH_CARDS, SLOTH_CARDS, GREED_CARDS, ENVY_CARDS } from "@shared/cardData";
import { PRIDE_CARDS, LUST_CARDS, GLUTTONY_CARDS } from "@shared/newFactions";

// ── All faction card pools ────────────────────────────────────
const FACTION_CARDS: Record<SinType, CardDefinition[]> = {
  wrath: WRATH_CARDS,
  sloth: SLOTH_CARDS,
  greed: GREED_CARDS,
  envy: ENVY_CARDS,
  pride: PRIDE_CARDS,
  lust: LUST_CARDS,
  gluttony: GLUTTONY_CARDS,
};

const ALL_SINS: SinType[] = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];

const SIN_HEX: Record<SinType, string> = {
  wrath: "#e8200e",
  sloth: "#9055e8",
  greed: "#e8b80e",
  envy: "#15c840",
  pride: "#f0f0f0",
  lust: "#ee48a0",
  gluttony: "#c07020",
};

const SIN_LABEL: Record<SinType, string> = {
  wrath: "WRATH",
  sloth: "SLOTH",
  greed: "GREED",
  envy: "ENVY",
  pride: "PRIDE",
  lust: "LUST",
  gluttony: "GLUTTONY",
};

function loadSavedDeck(sin: SinType): string[] | null {
  try {
    const raw = localStorage.getItem(`7sins_deck_${sin}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveDeck(sin: SinType, cardIds: string[]) {
  localStorage.setItem(`7sins_deck_${sin}`, JSON.stringify(cardIds));
}

function resetDeck(sin: SinType) {
  localStorage.removeItem(`7sins_deck_${sin}`);
}

// ── Cost curve bar chart ──────────────────────────────────────
function CostCurve({ cards, selectedIds }: { cards: CardDefinition[]; selectedIds: Set<string> }) {
  const selected = cards.filter(c => selectedIds.has(c.id));
  const byCost = Array.from({ length: 8 }, (_, cost) => ({
    cost,
    count: selected.filter(c => c.cost === cost).length,
  }));
  const maxCount = Math.max(...byCost.map(b => b.count), 1);

  return (
    <div className="flex items-end gap-1 h-12">
      {byCost.map(({ cost, count }) => (
        <div key={cost} className="flex flex-col items-center gap-0.5 flex-1">
          <span className="text-[8px] text-foreground/40" style={{ fontFamily: "var(--font-heading)" }}>
            {count > 0 ? count : ""}
          </span>
          <div
            className="w-full rounded-t-sm transition-all duration-300"
            style={{
              height: `${Math.max((count / maxCount) * 36, count > 0 ? 4 : 0)}px`,
              background: count > 0 ? "oklch(0.75 0.15 80 / 0.7)" : "oklch(0.2 0.01 30 / 0.4)",
            }}
          />
          <span className="text-[8px] text-foreground/50">{cost}</span>
        </div>
      ))}
    </div>
  );
}

export default function DeckBuilder() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialSin = (params.get("sin") as SinType) || "wrath";

  const [selectedSin, setSelectedSin] = useState<SinType>(initialSin);
  const allCards = FACTION_CARDS[selectedSin] || [];

  // Load saved selection or default to all cards
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    const saved = loadSavedDeck(initialSin);
    return new Set(saved ?? allCards.map(c => c.id));
  });

  const [filterType, setFilterType] = useState<"all" | "flat" | "compounding">("all");
  const [filterCost, setFilterCost] = useState<number | null>(null);
  const [savedMessage, setSavedMessage] = useState("");

  const sinHex = SIN_HEX[selectedSin];

  // Reset when switching sin
  const handleSinChange = useCallback((sin: SinType) => {
    setSelectedSin(sin);
    const cards = FACTION_CARDS[sin] || [];
    const saved = loadSavedDeck(sin);
    setSelectedIds(new Set(saved ?? cards.map(c => c.id)));
    setFilterType("all");
    setFilterCost(null);
  }, []);

  const filteredCards = useMemo(() => {
    return allCards.filter(c => {
      if (filterType !== "all" && c.cardType !== filterType) return false;
      if (filterCost !== null && c.cost !== filterCost) return false;
      return true;
    });
  }, [allCards, filterType, filterCost]);

  const toggleCard = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size <= 10) return prev; // minimum 10 cards
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSave = () => {
    saveDeck(selectedSin, Array.from(selectedIds));
    setSavedMessage("Deck saved!");
    setTimeout(() => setSavedMessage(""), 2000);
  };

  const handleReset = () => {
    resetDeck(selectedSin);
    setSelectedIds(new Set(allCards.map(c => c.id)));
    setSavedMessage("Reset to default.");
    setTimeout(() => setSavedMessage(""), 2000);
  };

  const selectedCount = selectedIds.size;
  const totalCount = allCards.length;

  return (
    <div className="min-h-screen bg-background noise-overlay overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-candle/15 bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => setLocation("/")}
            className="text-candle/60 hover:text-candle transition-colors text-sm font-bold uppercase tracking-wider flex items-center gap-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            ← Back
          </button>

          <h1
            className="text-xl sm:text-2xl font-black tracking-[0.15em] uppercase"
            style={{ fontFamily: "var(--font-heading)", color: sinHex, textShadow: `0 0 16px ${sinHex}66` }}
          >
            Deck Builder
          </h1>

          <div className="flex items-center gap-2">
            <AnimatePresence>
              {savedMessage && (
                <motion.span
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-bold text-envy-glow"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {savedMessage}
                </motion.span>
              )}
            </AnimatePresence>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border border-border/40 text-muted-foreground hover:text-foreground hover:border-border/70 transition-all"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all"
              style={{
                fontFamily: "var(--font-heading)",
                background: `color-mix(in oklch, ${sinHex} 25%, transparent)`,
                border: `1px solid ${sinHex}66`,
                color: sinHex,
              }}
            >
              Save Deck
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Sin selector */}
        <div className="flex gap-2 flex-wrap justify-center">
          {ALL_SINS.map(sin => (
            <button
              key={sin}
              onClick={() => handleSinChange(sin)}
              className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200"
              style={{
                fontFamily: "var(--font-heading)",
                background: selectedSin === sin
                  ? `color-mix(in oklch, ${SIN_HEX[sin]} 30%, transparent)`
                  : "oklch(0.12 0.015 30 / 0.8)",
                border: `1px solid ${SIN_HEX[sin]}${selectedSin === sin ? "99" : "33"}`,
                color: selectedSin === sin ? SIN_HEX[sin] : "oklch(0.6 0.03 50)",
                boxShadow: selectedSin === sin ? `0 0 12px ${SIN_HEX[sin]}33` : "none",
              }}
            >
              {SIN_LABEL[sin]}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Deck size */}
          <div
            className="rounded-lg p-3 border"
            style={{ background: "oklch(0.12 0.02 30 / 0.7)", borderColor: `${sinHex}33` }}
          >
            <div className="text-xs text-foreground/50 uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-heading)" }}>
              Cards Selected
            </div>
            <div className="text-2xl font-black" style={{ fontFamily: "var(--font-heading)", color: sinHex }}>
              {selectedCount}<span className="text-base text-foreground/40">/{totalCount}</span>
            </div>
          </div>

          {/* Flat / Compound split */}
          <div
            className="rounded-lg p-3 border"
            style={{ background: "oklch(0.12 0.02 30 / 0.7)", borderColor: "oklch(0.75 0.12 70 / 0.2)" }}
          >
            <div className="text-xs text-foreground/50 uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-heading)" }}>
              Flat / Compound
            </div>
            <div className="text-lg font-black text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              {allCards.filter(c => selectedIds.has(c.id) && c.cardType === "flat").length}
              <span className="text-foreground/40 mx-1">/</span>
              {allCards.filter(c => selectedIds.has(c.id) && c.cardType === "compounding").length}
            </div>
          </div>

          {/* Avg cost */}
          <div
            className="rounded-lg p-3 border"
            style={{ background: "oklch(0.12 0.02 30 / 0.7)", borderColor: "oklch(0.7 0.15 80 / 0.2)" }}
          >
            <div className="text-xs text-foreground/50 uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-heading)" }}>
              Avg. Cost
            </div>
            <div className="text-lg font-black text-candle" style={{ fontFamily: "var(--font-heading)" }}>
              {selectedCount > 0
                ? (allCards.filter(c => selectedIds.has(c.id)).reduce((s, c) => s + c.cost, 0) / selectedCount).toFixed(1)
                : "—"}
            </div>
          </div>

          {/* Cost curve */}
          <div
            className="rounded-lg p-3 border"
            style={{ background: "oklch(0.12 0.02 30 / 0.7)", borderColor: "oklch(0.75 0.12 70 / 0.2)" }}
          >
            <div className="text-xs text-foreground/50 uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              Cost Curve
            </div>
            <CostCurve cards={allCards} selectedIds={selectedIds} />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-foreground/40 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
            Filter:
          </span>
          {(["all", "flat", "compounding"] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all"
              style={{
                fontFamily: "var(--font-heading)",
                background: filterType === type ? "oklch(0.75 0.12 70 / 0.2)" : "transparent",
                border: "1px solid oklch(0.75 0.12 70 / 0.2)",
                color: filterType === type ? "oklch(0.82 0.12 75)" : "oklch(0.5 0.03 50)",
              }}
            >
              {type}
            </button>
          ))}
          <span className="text-foreground/20 text-xs mx-1">|</span>
          {[0, 1, 2, 3, 4, 5, 6].map(cost => (
            <button
              key={cost}
              onClick={() => setFilterCost(filterCost === cost ? null : cost)}
              className="w-7 h-7 rounded-full text-xs font-black transition-all"
              style={{
                fontFamily: "var(--font-heading)",
                background: filterCost === cost ? `${sinHex}44` : "oklch(0.14 0.015 30)",
                border: `1px solid ${filterCost === cost ? sinHex : "oklch(0.25 0.02 30)"}`,
                color: filterCost === cost ? sinHex : "oklch(0.5 0.03 50)",
              }}
            >
              {cost}
            </button>
          ))}
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <AnimatePresence>
            {filteredCards.map((card, i) => {
              const isInDeck = selectedIds.has(card.id);
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.02 }}
                  className="relative cursor-pointer"
                  onClick={() => toggleCard(card.id)}
                >
                  {/* Dimmed overlay for excluded cards */}
                  {!isInDeck && (
                    <div className="absolute inset-0 z-20 rounded-xl bg-black/65 pointer-events-none flex items-center justify-center">
                      <span
                        className="text-xs font-black uppercase tracking-wider text-white/50 rotate-[-20deg]"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        EXCLUDED
                      </span>
                    </div>
                  )}

                  {/* Inclusion ring for selected cards */}
                  {isInDeck && (
                    <div
                      className="absolute inset-0 z-10 rounded-xl pointer-events-none"
                      style={{
                        boxShadow: `0 0 0 2px ${sinHex}66, 0 0 12px ${sinHex}33`,
                      }}
                    />
                  )}

                  <GameCard
                    card={card}
                    currentRound={1}
                    isPlayable={isInDeck}
                    isSelected={false}
                    onClick={() => {}}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}
