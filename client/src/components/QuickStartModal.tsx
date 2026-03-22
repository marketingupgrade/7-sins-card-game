/**
 * QuickStart Modal — 4-Slide Visual Intro for New Players
 *
 * Appears once before a new player's first game in the Lobby.
 * Covers the absolute essentials in under 30 seconds:
 * 1. The Goal — survive to win
 * 2. Energy — spend to play cards
 * 3. Cards — they compound over time
 * 4. Factions — pick your sin
 *
 * Stored in localStorage so it only shows once.
 * Can be dismissed at any time.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Heart, Zap, Layers, Crown, Swords } from "lucide-react";

const STORAGE_KEY = "7sins_quickstart_seen";

interface QuickStartSlide {
  icon: React.ReactNode;
  color: string;
  title: string;
  body: string;
  visual: React.ReactNode;
}

function GoalVisual() {
  return (
    <div className="flex items-center justify-center gap-4 py-3">
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-full border-2 border-green-500/40 bg-green-500/10 flex items-center justify-center">
          <Heart className="w-7 h-7 text-green-400" />
        </div>
        <span className="text-lg font-bold text-green-400" style={{ fontFamily: "var(--font-heading)" }}>333</span>
        <span className="text-[10px] text-white/30" style={{ fontFamily: "var(--font-heading)" }}>HP</span>
      </div>
      <div className="flex flex-col items-center">
        <Swords className="w-5 h-5 text-red-400/60 mb-1" />
        <span className="text-[10px] text-white/20">vs</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full border border-red-500/30 bg-red-500/5 flex items-center justify-center">
              <span className="text-xs text-red-400/60">?</span>
            </div>
            <span className="text-[10px] text-white/20" style={{ fontFamily: "var(--font-heading)" }}>Foe {i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EnergyVisual() {
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold"
            style={{
              borderColor: i <= 2 ? "oklch(0.75 0.15 85)" : "oklch(0.3 0.05 85 / 0.3)",
              background: i <= 2 ? "oklch(0.75 0.15 85 / 0.15)" : "transparent",
              color: i <= 2 ? "oklch(0.85 0.12 85)" : "oklch(0.4 0.05 85 / 0.5)",
              boxShadow: i <= 2 ? "0 0 8px oklch(0.75 0.15 85 / 0.2)" : "none",
            }}
          >
            {i}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs text-white/40" style={{ fontFamily: "var(--font-body)" }}>
        <span>Start: <strong className="text-amber-200/70">2</strong></span>
        <span className="text-white/15">|</span>
        <span>+1/round</span>
        <span className="text-white/15">|</span>
        <span>Max: <strong className="text-amber-200/70">7</strong></span>
      </div>
    </div>
  );
}

function CompoundVisual() {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {["1×", "1×", "2×", "3×"].map((mult, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className="w-12 h-8 rounded-lg border flex items-center justify-center text-xs font-bold"
            style={{
              borderColor: `oklch(0.6 0.2 ${200 + i * 20} / 0.4)`,
              background: `oklch(0.6 0.2 ${200 + i * 20} / 0.1)`,
              color: `oklch(0.75 0.15 ${200 + i * 20})`,
            }}
          >
            {mult}
          </div>
          <span className="text-[9px] text-white/25" style={{ fontFamily: "var(--font-heading)" }}>R{i + 1}</span>
          {i < 3 && <div className="absolute" />}
        </div>
      ))}
      <div className="ml-2 text-xs text-white/40" style={{ fontFamily: "var(--font-body)" }}>
        = <strong className="text-blue-300/70">7×</strong> total
      </div>
    </div>
  );
}

function FactionVisual() {
  const factions = [
    { name: "Wrath", color: "var(--color-wrath)", emoji: "⚔" },
    { name: "Sloth", color: "var(--color-sloth)", emoji: "🛡" },
    { name: "Greed", color: "var(--color-greed)", emoji: "💰" },
    { name: "Envy", color: "var(--color-envy)", emoji: "👁" },
    { name: "Pride", color: "var(--color-pride)", emoji: "👑" },
    { name: "Lust", color: "var(--color-lust)", emoji: "❤" },
    { name: "Gluttony", color: "var(--color-gluttony)", emoji: "🔥" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 py-2">
      {factions.map((f) => (
        <div
          key={f.name}
          className="px-2.5 py-1.5 rounded-lg border text-xs font-bold tracking-wider"
          style={{
            fontFamily: "var(--font-heading)",
            borderColor: `color-mix(in oklch, ${f.color} 30%, transparent)`,
            background: `color-mix(in oklch, ${f.color} 8%, transparent)`,
            color: f.color,
          }}
        >
          {f.emoji} {f.name}
        </div>
      ))}
    </div>
  );
}

const SLIDES: QuickStartSlide[] = [
  {
    icon: <Heart className="w-6 h-6" />,
    color: "oklch(0.65 0.25 140)",
    title: "Last Sinner Standing",
    body: "4 players, 333 HP each, 20 rounds max. Reduce enemies to 0 HP — or have the most HP when the Final Reckoning hits at round 20.",
    visual: <GoalVisual />,
  },
  {
    icon: <Zap className="w-6 h-6" />,
    color: "oklch(0.75 0.15 85)",
    title: "Corruption Energy",
    body: "Start with 2 energy. Gain +1 each round (max 7). Unspent energy carries over. Every card costs energy to play — save up for powerful combos.",
    visual: <EnergyVisual />,
  },
  {
    icon: <Layers className="w-6 h-6" />,
    color: "oklch(0.65 0.2 250)",
    title: "Cards Compound",
    body: "Play a card once, it deals damage for multiple rounds with increasing multipliers. Early cards have the highest total value — invest early.",
    visual: <CompoundVisual />,
  },
  {
    icon: <Crown className="w-6 h-6" />,
    color: "oklch(0.75 0.15 55)",
    title: "Pick Your Sin",
    body: "Each of the 7 factions has a unique passive ability and playstyle. Experiment to find your favorite — there's no wrong choice for your first game.",
    visual: <FactionVisual />,
  },
];

interface QuickStartModalProps {
  /** Force show even if already seen (for testing) */
  forceShow?: boolean;
  onClose?: () => void;
}

export default function QuickStartModal({ forceShow, onClose }: QuickStartModalProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [dismissed, setDismissed] = useState(() => {
    if (forceShow) return false;
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
    onClose?.();
  }, [onClose]);

  const next = useCallback(() => {
    if (slideIndex >= SLIDES.length - 1) {
      dismiss();
    } else {
      setSlideIndex((i) => i + 1);
    }
  }, [slideIndex, dismiss]);

  const prev = useCallback(() => {
    setSlideIndex((i) => Math.max(0, i - 1));
  }, []);

  if (dismissed) return null;

  const slide = SLIDES[slideIndex];
  const isLast = slideIndex === SLIDES.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
        style={{ background: "rgba(0, 0, 0, 0.85)", backdropFilter: "blur(8px)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full max-w-md rounded-2xl border border-white/10 bg-[var(--color-page-bg)] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${slide.color}15`, color: slide.color }}
              >
                {slide.icon}
              </div>
              <div>
                <p
                  className="text-[10px] text-white/30 uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Quick Start — {slideIndex + 1}/{SLIDES.length}
                </p>
              </div>
            </div>
            <button
              onClick={dismiss}
              className="text-white/30 hover:text-white/60 transition-colors p-1"
              title="Skip intro"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slideIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="px-5 pb-4"
            >
              <h3
                className="text-xl font-bold text-white/90 tracking-wide mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {slide.title}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed mb-4" style={{ fontFamily: "var(--font-body)" }}>
                {slide.body}
              </p>

              {/* Visual */}
              <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                {slide.visual}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots + Navigation */}
          <div className="px-5 pb-5 pt-2">
            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIndex(i)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    background: i === slideIndex ? slide.color : "oklch(0.3 0.02 280 / 0.4)",
                    boxShadow: i === slideIndex ? `0 0 8px ${slide.color}40` : "none",
                    transform: i === slideIndex ? "scale(1.3)" : "scale(1)",
                  }}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={prev}
                disabled={slideIndex === 0}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold tracking-wider text-white/40 hover:text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                BACK
              </button>

              <button
                onClick={dismiss}
                className="text-[10px] text-white/25 hover:text-white/40 transition-colors"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                SKIP ALL
              </button>

              <button
                onClick={next}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all"
                style={{
                  fontFamily: "var(--font-heading)",
                  background: `${slide.color}20`,
                  color: slide.color,
                  border: `1px solid ${slide.color}30`,
                }}
              >
                {isLast ? "LET'S GO!" : "NEXT"}
                {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Hook to check if QuickStart should be shown */
export function useQuickStartNeeded(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "true";
  } catch {
    return false;
  }
}
