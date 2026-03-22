/**
 * QuickStartModal — "The Cathedral Speaks"
 *
 * A 4-slide visual introduction shown to first-time players in the Lobby.
 * Uses the brand's sardonic narrator voice, cathedral aesthetic, and
 * Uncial Antiqua flavor text. Shows once, stored in localStorage.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Heart, Zap, Layers, Crown, Swords, Skull, Sparkles } from "lucide-react";

const STORAGE_KEY = "7sins_quickstart_seen";

interface QuickStartSlide {
  icon: React.ReactNode;
  color: string;
  title: string;
  narratorQuote: string;
  body: string;
  detail: string;
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
        <span className="text-[10px] text-white/30" style={{ fontFamily: "var(--font-heading)" }}>Your mortal coil</span>
      </div>
      <div className="flex flex-col items-center">
        <Swords className="w-5 h-5 text-red-400/60 mb-1" />
        <span className="text-[10px] text-white/20">vs</span>
      </div>
      <div className="flex gap-2">
        {["Sinner", "Sinner", "Sinner"].map((name, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full border border-red-500/30 bg-red-500/5 flex items-center justify-center">
              <Skull className="w-4 h-4 text-red-400/40" />
            </div>
            <span className="text-[10px] text-white/20" style={{ fontFamily: "var(--font-heading)" }}>{name}</span>
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
      {["1\u00d7", "1\u00d7", "2\u00d7", "3\u00d7"].map((mult, i) => (
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
        </div>
      ))}
      <div className="ml-2 text-xs text-white/40" style={{ fontFamily: "var(--font-body)" }}>
        = <strong className="text-blue-300/70">7\u00d7</strong> total
      </div>
    </div>
  );
}

function FactionVisual() {
  const factions = [
    { name: "Wrath", color: "var(--color-wrath)", emoji: "\u2694" },
    { name: "Sloth", color: "var(--color-sloth)", emoji: "\ud83d\udee1" },
    { name: "Greed", color: "var(--color-greed)", emoji: "\ud83d\udcb0" },
    { name: "Envy", color: "var(--color-envy)", emoji: "\ud83d\udc41" },
    { name: "Pride", color: "var(--color-pride)", emoji: "\ud83d\udc51" },
    { name: "Lust", color: "var(--color-lust)", emoji: "\u2764" },
    { name: "Gluttony", color: "var(--color-gluttony)", emoji: "\ud83d\udd25" },
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
    icon: <Skull className="w-6 h-6" />,
    color: "oklch(0.65 0.25 25)",
    title: "Last Sinner Standing",
    narratorQuote: "Four sinners enter. One walks out. The cathedral keeps the rest.",
    body: "This is a free-for-all card game. You start with 333 HP and play cards to damage opponents, heal yourself, or build shields. When your HP hits zero, your story ends.",
    detail: "If no one dies by round 20, the Final Reckoning triggers \u2014 all remaining cards are played at once.",
    visual: <GoalVisual />,
  },
  {
    icon: <Zap className="w-6 h-6" />,
    color: "oklch(0.75 0.15 85)",
    title: "The Price of Power",
    narratorQuote: "Every sin has a cost. The question is whether you can afford it.",
    body: "Corruption is your currency. Start with 2, gain +1 each round (max 7). Unspent corruption carries over \u2014 restraint today enables devastation tomorrow.",
    detail: "Cards you can't afford are dimmed. The cathedral doesn't negotiate.",
    visual: <EnergyVisual />,
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    color: "oklch(0.65 0.15 280)",
    title: "Sin Compounds",
    narratorQuote: "The compound interest on sin is remarkably similar to the compound interest on a good investment.",
    body: "Every card creates a compound effect that ticks each round after being played. A damage card played early deals damage again and again, growing with each tick.",
    detail: "This is the core mechanic. Early plays compound more. Late plays hit harder once but compound less.",
    visual: <CompoundVisual />,
  },
  {
    icon: <Crown className="w-6 h-6" />,
    color: "oklch(0.65 0.2 55)",
    title: "What Kind of Sinner Are You?",
    narratorQuote: "Seven deadly sins. Seven ways to lose everything. Choose wisely.",
    body: "Each faction has a unique passive ability. Wrath reflects damage. Sloth builds shields from inaction. Greed steals resources. Your sin defines your path to victory.",
    detail: "Pick a sin that matches how you think. Aggression, patience, theft, or something darker.",
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
        style={{ background: "rgba(5, 3, 10, 0.92)", backdropFilter: "blur(12px)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="w-full max-w-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
          style={{ background: "linear-gradient(180deg, rgba(20, 16, 30, 0.95), rgba(10, 8, 18, 0.98))" }}
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="h-px w-6 bg-gradient-to-r from-amber-500/30 to-transparent" />
                <span
                  className="text-[10px] tracking-[0.3em] text-amber-200/40 uppercase"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  The Cathedral Speaks
                </span>
                <div className="h-px w-6 bg-gradient-to-l from-amber-500/30 to-transparent" />
              </div>
              <button
                onClick={dismiss}
                className="text-white/30 hover:text-white/60 transition-colors p-1"
                title="I know my sins"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex justify-center gap-2 px-5 py-3">
            {SLIDES.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === slideIndex ? 24 : 6,
                  opacity: i === slideIndex ? 1 : 0.3,
                }}
                className="h-1.5 rounded-full cursor-pointer"
                style={{
                  background: i === slideIndex ? "oklch(0.75 0.15 85)" : "oklch(0.4 0.05 85)",
                }}
                onClick={() => setSlideIndex(i)}
              />
            ))}
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
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `color-mix(in oklch, ${slide.color}, transparent 85%)`, color: slide.color }}
              >
                {slide.icon}
              </motion.div>

              <h3
                className="text-xl font-bold text-white/90 tracking-wide mb-1.5"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {slide.title}
              </h3>

              {/* Narrator quote */}
              <p
                className="text-sm italic text-amber-200/30 mb-3 leading-relaxed"
                style={{ fontFamily: "var(--font-narrator)" }}
              >
                "{slide.narratorQuote}"
              </p>

              <p className="text-sm text-white/50 leading-relaxed mb-3" style={{ fontFamily: "var(--font-body)" }}>
                {slide.body}
              </p>

              {/* Visual */}
              <div className="rounded-xl border border-white/5 bg-black/30 p-3 mb-3">
                {slide.visual}
              </div>

              {/* Detail */}
              <div className="rounded-lg px-3 py-2 border border-white/5 bg-white/[0.02]">
                <p className="text-xs text-white/35 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  {slide.detail}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="px-5 pb-5 pt-2">
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
                className="text-[10px] text-white/20 hover:text-white/35 transition-colors tracking-widest uppercase"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                I know my sins
              </button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={next}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all"
                style={{
                  fontFamily: "var(--font-heading)",
                  background: isLast
                    ? "linear-gradient(135deg, oklch(0.75 0.15 85), oklch(0.65 0.18 70))"
                    : `color-mix(in oklch, ${slide.color}, transparent 80%)`,
                  color: isLast ? "oklch(0.10 0.02 70)" : slide.color,
                  border: isLast ? "none" : `1px solid color-mix(in oklch, ${slide.color}, transparent 70%)`,
                  boxShadow: isLast ? "0 0 15px oklch(0.75 0.15 85 / 0.2)" : "none",
                }}
              >
                {isLast ? (
                  <>
                    EMBRACE YOUR SIN
                    <Crown className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    CONTINUE
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </motion.button>
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
