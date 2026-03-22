/**
 * CathedralTransition — Branded between-round transition overlay
 *
 * Shows a dramatic narrator quote with cathedral aesthetic between rounds.
 * Appears briefly (2.5s) when a new round starts, reinforcing the brand
 * atmosphere and giving players a moment to process the previous round.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { playBellToll, playWhisper, playEliminationToll, playDeepResonance } from "@/lib/cathedralSounds";

/* ─── Narrator Quotes Pool ─── */
const ROUND_QUOTES: Record<string, string[]> = {
  early: [
    "The first sins are always the cheapest.",
    "Patience rewards those who understand compound interest.",
    "The cathedral watches. It always watches.",
    "Every sinner thinks they're the exception.",
    "Corruption flows like water — it finds the cracks.",
    "The early rounds are a prayer. The late rounds are a reckoning.",
  ],
  mid: [
    "The weak have been identified. The strong are about to be tested.",
    "Alliances are for the naive. This is a cathedral, not a democracy.",
    "Your sins are compounding. Can you feel them growing?",
    "Half the rites are done. Half the sinners should be worried.",
    "The mathematics of evil are becoming clear.",
    "Restraint or recklessness — the cathedral judges both equally.",
  ],
  late: [
    "The Reckoning approaches. Are you prepared?",
    "Few sinners survive this deep into the liturgy.",
    "Every card you've hoarded is a prayer you haven't answered.",
    "The cathedral's patience is not infinite.",
    "Final rites are for the desperate and the brilliant.",
    "The end is not a destination. It's a verdict.",
  ],
  reckoning: [
    "The Final Reckoning. All sins are laid bare.",
    "No more strategy. No more patience. Only truth.",
    "The cathedral demands its due. Every last card.",
    "Twenty rites of sin, and it comes to this.",
  ],
};

const ELIMINATION_QUOTES = [
  "Another sinner falls. The cathedral claims its due.",
  "One fewer voice in the choir of the damned.",
  "Eliminated. The cathedral is not sentimental.",
  "The weak are pruned so the strong may flourish.",
  "And then there were fewer.",
];

interface CathedralTransitionProps {
  round: number;
  maxRounds: number;
  show: boolean;
  type: "round" | "elimination";
  eliminatedName?: string;
}

function getQuotePool(round: number, maxRounds: number): string[] {
  if (round >= maxRounds) return ROUND_QUOTES.reckoning;
  if (round > maxRounds * 0.7) return ROUND_QUOTES.late;
  if (round > maxRounds * 0.35) return ROUND_QUOTES.mid;
  return ROUND_QUOTES.early;
}

export default function CathedralTransition({
  round,
  maxRounds,
  show,
  type,
  eliminatedName,
}: CathedralTransitionProps) {
  const [quote, setQuote] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;

    if (type === "elimination") {
      const pool = ELIMINATION_QUOTES;
      setQuote(pool[Math.floor(Math.random() * pool.length)]);
    } else {
      const pool = getQuotePool(round, maxRounds);
      setQuote(pool[Math.floor(Math.random() * pool.length)]);
    }

    setVisible(true);

    // Play cathedral sound cue
    if (type === "elimination") {
      playEliminationToll();
    } else if (round >= maxRounds) {
      playDeepResonance();
    } else {
      playBellToll(round > maxRounds * 0.7 ? "deep" : round > maxRounds * 0.35 ? "normal" : "soft");
      playWhisper();
    }

    const timer = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(timer);
  }, [show, round, type, maxRounds]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, oklch(0.08 0.02 280 / 0.95), oklch(0.05 0.01 280 / 0.98))",
          }}
        >
          {/* Cathedral glow */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: "radial-gradient(circle at 50% 30%, oklch(0.75 0.12 85 / 0.15), transparent 60%)",
            }}
          />

          <div className="relative text-center px-8 max-w-lg">
            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-px w-32 mx-auto mb-6"
              style={{ background: "linear-gradient(90deg, transparent, oklch(0.75 0.12 85 / 0.4), transparent)" }}
            />

            {/* Round / Event label */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xs tracking-[0.4em] uppercase mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                color: type === "elimination" ? "oklch(0.65 0.25 25 / 0.7)" : "oklch(0.75 0.12 85 / 0.5)",
              }}
            >
              {type === "elimination"
                ? `${eliminatedName || "A sinner"} has fallen`
                : round >= maxRounds
                  ? "The Final Reckoning"
                  : `Rite ${round}`}
            </motion.p>

            {/* Quote */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg sm:text-xl italic leading-relaxed"
              style={{
                fontFamily: "var(--font-narrator)",
                color: "oklch(0.85 0.08 85 / 0.5)",
              }}
            >
              "{quote}"
            </motion.p>

            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="h-px w-32 mx-auto mt-6"
              style={{ background: "linear-gradient(90deg, transparent, oklch(0.75 0.12 85 / 0.4), transparent)" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* Export quote pools for testing */
export { ROUND_QUOTES, ELIMINATION_QUOTES, getQuotePool };
