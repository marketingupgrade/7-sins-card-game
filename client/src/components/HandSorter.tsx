/**
 * HandSorter — Beginner-friendly card sorting controls for the hand
 *
 * Provides sort options:
 * - Default: Draw order (no sorting)
 * - Cost: Sort by energy cost (low to high)
 * - Type: Group by effect type (damage, heal, shield, utility)
 * - Recommended: Smart sort based on current game state
 *
 * The "Recommended" sort considers:
 * - Current energy (affordable cards first)
 * - Current HP (defensive cards first if low HP)
 * - Round number (early = aggressive, late = defensive)
 *
 * Persists sort preference in localStorage.
 * Shows a subtle indicator on first use.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, Zap, Layers, Sparkles, X } from "lucide-react";
import type { CardDefinition } from "@shared/gameTypes";

export type SortMode = "default" | "cost" | "type" | "recommended";

interface HandSorterProps {
  /** Current energy available */
  energy: number;
  /** Current HP */
  hp: number;
  /** Max HP */
  maxHp: number;
  /** Current round */
  round: number;
  /** Whether it's the player's turn */
  isMyTurn: boolean;
  /** Callback when sort mode changes */
  onSortChange: (mode: SortMode) => void;
  /** Current sort mode */
  sortMode: SortMode;
}

const SORT_OPTIONS: { mode: SortMode; label: string; icon: typeof Zap; desc: string }[] = [
  { mode: "default", label: "Draw", icon: Layers, desc: "Original draw order" },
  { mode: "cost", label: "Cost", icon: Zap, desc: "Cheapest first" },
  { mode: "type", label: "Type", icon: Layers, desc: "Group by effect" },
  { mode: "recommended", label: "Smart", icon: Sparkles, desc: "Best plays first" },
];

export default function HandSorter({
  energy,
  hp,
  maxHp,
  round,
  isMyTurn,
  onSortChange,
  sortMode,
}: HandSorterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUsed, setHasUsed] = useState(() => {
    return localStorage.getItem("7sins_sort_used") === "true";
  });

  const handleSelect = (mode: SortMode) => {
    onSortChange(mode);
    setIsOpen(false);
    if (!hasUsed) {
      setHasUsed(true);
      localStorage.setItem("7sins_sort_used", "true");
    }
    localStorage.setItem("7sins_sort_mode", mode);
  };

  // Only show during player's turn
  if (!isMyTurn) return null;

  const currentOption = SORT_OPTIONS.find(o => o.mode === sortMode) || SORT_OPTIONS[0];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative">
      {/* Sort toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs"
        style={{
          fontFamily: "var(--font-heading)",
          background: isOpen ? "oklch(0.25 0.05 85 / 0.6)" : "oklch(0.15 0.02 85 / 0.4)",
          borderColor: isOpen ? "oklch(0.60 0.12 85 / 0.4)" : "oklch(0.40 0.05 85 / 0.2)",
          color: isOpen ? "oklch(0.85 0.12 85)" : "oklch(0.65 0.05 85)",
        }}
      >
        <ArrowUpDown className="w-3 h-3" />
        <span className="tracking-wider">{currentOption.label.toUpperCase()}</span>
        {/* New badge for first-time users */}
        {!hasUsed && (
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-amber-400"
          />
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 w-44 rounded-xl border overflow-hidden z-50"
            style={{
              background: "oklch(0.12 0.02 280 / 0.95)",
              borderColor: "oklch(0.40 0.05 85 / 0.3)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 8px 32px oklch(0 0 0 / 0.5)",
            }}
          >
            <div className="p-1">
              {SORT_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = sortMode === option.mode;
                return (
                  <button
                    key={option.mode}
                    onClick={() => handleSelect(option.mode)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left"
                    style={{
                      background: isActive ? "oklch(0.30 0.08 85 / 0.4)" : "transparent",
                      color: isActive ? "oklch(0.85 0.12 85)" : "oklch(0.65 0.05 85)",
                    }}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                        {option.label.toUpperCase()}
                      </p>
                      <p className="text-[9px] opacity-50" style={{ fontFamily: "var(--font-body)" }}>
                        {option.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Sort cards based on the selected mode and game state.
 * Returns a new sorted array (does not mutate the original).
 */
export function sortCards(
  cards: CardDefinition[],
  mode: SortMode,
  energy: number,
  hp: number,
  maxHp: number,
  round: number,
): CardDefinition[] {
  if (mode === "default") return cards;

  const sorted = [...cards];

  if (mode === "cost") {
    sorted.sort((a, b) => a.cost - b.cost);
    return sorted;
  }

  if (mode === "type") {
    const getCategory = (card: CardDefinition): number => {
      const types = card.effects.map(e => e.type);
      if (types.some(t => t === "damage" || t === "self_damage" || t === "affliction_amplify")) return 0; // Damage
      if (types.some(t => t === "heal_steal" || t === "shield_steal" || t === "energy_steal")) return 1; // Steal
      if (types.some(t => t === "heal_gain")) return 2; // Heal
      if (types.some(t => t === "shield_gain")) return 3; // Shield
      return 4; // Utility
    };
    sorted.sort((a, b) => {
      const catDiff = getCategory(a) - getCategory(b);
      if (catDiff !== 0) return catDiff;
      return a.cost - b.cost;
    });
    return sorted;
  }

  if (mode === "recommended") {
    const hpPercent = hp / maxHp;
    const isLowHp = hpPercent < 0.35;
    const isEarlyGame = round <= 5;

    const getScore = (card: CardDefinition): number => {
      let score = 0;

      // Can we afford it?
      if (card.cost <= energy) score += 100;
      else score -= 200; // Unaffordable cards go to the back

      // Effect type scoring based on game state
      const types = card.effects.map(e => e.type);
      const isDamage = types.some(t => t === "damage" || t === "self_damage" || t === "affliction_amplify");
      const isHeal = types.some(t => t === "heal_gain" || t === "heal_steal");
      const isShield = types.some(t => t === "shield_gain" || t === "shield_steal");

      if (isLowHp) {
        // Prioritize defense when low HP
        if (isHeal) score += 50;
        if (isShield) score += 40;
        if (isDamage) score += 10;
      } else if (isEarlyGame) {
        // Prioritize damage early (compound value)
        if (isDamage) score += 50;
        if (isShield) score += 20;
        if (isHeal) score += 10;
      } else {
        // Balanced mid-game
        if (isDamage) score += 30;
        if (isShield) score += 30;
        if (isHeal) score += 25;
      }

      // Compound pattern bonus — aggressive cards better early
      if (card.compoundPattern === "aggressive" && isEarlyGame) score += 15;
      if (card.compoundPattern === "slowburn" && !isEarlyGame) score += 15;

      // Energy efficiency: prefer cards that use more of available energy
      if (card.cost <= energy) {
        score += (card.cost / Math.max(energy, 1)) * 20;
      }

      // Tier bonus for epic/rare
      if (card.tier === "epic") score += 10;
      if (card.tier === "rare") score += 5;

      return score;
    };

    sorted.sort((a, b) => getScore(b) - getScore(a));
    return sorted;
  }

  return sorted;
}
