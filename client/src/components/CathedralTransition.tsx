/**
 * CathedralTransition — Branded between-round narrator quote
 *
 * Shows a dramatic narrator quote with cathedral aesthetic between rounds.
 * Renders as a NON-BLOCKING floating banner in the center of the screen
 * (no full-screen overlay, no solid background) so gameplay is never blocked.
 * Auto-dismisses after 2.5s with a hard safety fallback at 3.5s.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
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

const DISPLAY_DURATION = 2500;
const SAFETY_TIMEOUT = 3500;

export default function CathedralTransition({
  round,
  maxRounds,
  show,
  type,
  eliminatedName,
}: CathedralTransitionProps) {
  const [quote, setQuote] = useState("");
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTriggerRef = useRef<string>("");

  const dismiss = useCallback(() => {
    setVisible(false);
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (safetyRef.current) { clearTimeout(safetyRef.current); safetyRef.current = null; }
  }, []);

  // Force dismiss when show goes false (parent says it's done)
  useEffect(() => {
    if (!show) {
      dismiss();
    }
  }, [show, dismiss]);

  // Trigger transition when show becomes true with a new round/type combo
  useEffect(() => {
    if (!show) return;

    const triggerKey = `${type}-${round}`;
    if (triggerKey === lastTriggerRef.current) return;
    lastTriggerRef.current = triggerKey;

    // Pick a quote
    if (type === "elimination") {
      const pool = ELIMINATION_QUOTES;
      setQuote(pool[Math.floor(Math.random() * pool.length)]);
    } else {
      const pool = getQuotePool(round, maxRounds);
      setQuote(pool[Math.floor(Math.random() * pool.length)]);
    }

    setVisible(true);

    // Play cathedral sound cue
    try {
      if (type === "elimination") {
        playEliminationToll();
      } else if (round >= maxRounds) {
        playDeepResonance();
      } else {
        playBellToll(round > maxRounds * 0.7 ? "deep" : round > maxRounds * 0.35 ? "normal" : "soft");
        playWhisper();
      }
    } catch {
      // Sound errors should never block gameplay
    }

    // Normal dismiss timer
    timerRef.current = setTimeout(dismiss, DISPLAY_DURATION);
    // Hard safety fallback — ALWAYS dismiss even if something goes wrong
    safetyRef.current = setTimeout(dismiss, SAFETY_TIMEOUT);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (safetyRef.current) clearTimeout(safetyRef.current);
    };
  }, [show, round, type, maxRounds, dismiss]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (safetyRef.current) clearTimeout(safetyRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-x-0 top-1/3 z-[55] flex items-center justify-center pointer-events-none"
          onClick={dismiss}
        >
          <div
            className="relative text-center px-8 py-6 max-w-lg mx-auto rounded-lg pointer-events-auto cursor-pointer"
            style={{
              background: "radial-gradient(ellipse at center, oklch(0.08 0.02 280 / 0.92), oklch(0.05 0.01 280 / 0.88))",
              boxShadow: "0 0 40px oklch(0.75 0.12 85 / 0.08), 0 0 80px oklch(0.05 0.01 280 / 0.3)",
              border: "1px solid oklch(0.75 0.12 85 / 0.1)",
            }}
          >
            {/* Cathedral glow */}
            <div
              className="absolute inset-0 opacity-20 rounded-lg"
              style={{
                background: "radial-gradient(circle at 50% 30%, oklch(0.75 0.12 85 / 0.15), transparent 60%)",
              }}
            />

            <div className="relative">
              {/* Decorative line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="h-px w-24 mx-auto mb-4"
                style={{ background: "linear-gradient(90deg, transparent, oklch(0.75 0.12 85 / 0.4), transparent)" }}
              />

              {/* Round / Event label */}
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-xs tracking-[0.4em] uppercase mb-3"
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="text-base sm:text-lg italic leading-relaxed"
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
                transition={{ duration: 0.4, delay: 0.35 }}
                className="h-px w-24 mx-auto mt-4"
                style={{ background: "linear-gradient(90deg, transparent, oklch(0.75 0.12 85 / 0.4), transparent)" }}
              />

              {/* Tap to dismiss hint (mobile) */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 1.5 }}
                className="text-[10px] tracking-widest uppercase mt-3"
                style={{ color: "oklch(0.75 0.12 85 / 0.3)" }}
              >
                tap to dismiss
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* Export quote pools for testing */
export { ROUND_QUOTES, ELIMINATION_QUOTES, getQuotePool };
