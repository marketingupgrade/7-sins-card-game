/**
 * SinWhisper — A floating, faction-themed temptation whisper
 * that appears during the selection phase.
 *
 * Styled to feel like the sin itself is speaking to the player.
 * Fades in with a typewriter effect, pulses gently, then fades out.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { SinType } from "@shared/gameTypes";

const SIN_WHISPER_STYLES: Record<string, { color: string; glow: string; label: string }> = {
  wrath: {
    color: "oklch(0.65 0.25 25)",
    glow: "oklch(0.55 0.3 25 / 0.3)",
    label: "Wrath whispers",
  },
  sloth: {
    color: "oklch(0.65 0.15 160)",
    glow: "oklch(0.55 0.2 160 / 0.3)",
    label: "Sloth murmurs",
  },
  greed: {
    color: "oklch(0.75 0.2 85)",
    glow: "oklch(0.65 0.25 85 / 0.3)",
    label: "Greed tempts",
  },
  envy: {
    color: "oklch(0.65 0.2 145)",
    glow: "oklch(0.55 0.25 145 / 0.3)",
    label: "Envy hisses",
  },
  pride: {
    color: "oklch(0.70 0.2 300)",
    glow: "oklch(0.60 0.25 300 / 0.3)",
    label: "Pride commands",
  },
  lust: {
    color: "oklch(0.65 0.25 350)",
    glow: "oklch(0.55 0.3 350 / 0.3)",
    label: "Lust beckons",
  },
  gluttony: {
    color: "oklch(0.65 0.2 55)",
    glow: "oklch(0.55 0.25 55 / 0.3)",
    label: "Gluttony craves",
  },
};

interface SinWhisperProps {
  whisper: string | null;
  isLoading: boolean;
  faction: SinType | null;
}

export default function SinWhisper({ whisper, isLoading, faction }: SinWhisperProps) {
  const style = SIN_WHISPER_STYLES[faction || "wrath"] || SIN_WHISPER_STYLES.wrath;

  return (
    <AnimatePresence>
      {(whisper || isLoading) && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg max-w-sm mx-auto"
          style={{
            background: `linear-gradient(135deg, oklch(0.10 0.02 280 / 0.8), oklch(0.08 0.01 280 / 0.9))`,
            border: `1px solid ${style.color}33`,
            boxShadow: `0 0 20px ${style.glow}, inset 0 0 15px oklch(0.05 0.01 280 / 0.5)`,
          }}
        >
          {/* Sin icon pulse */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: style.color, boxShadow: `0 0 8px ${style.glow}` }}
          />

          <div className="flex flex-col min-w-0">
            {/* Label */}
            <span
              className="text-[10px] uppercase tracking-widest font-bold"
              style={{ color: `${style.color}99`, fontFamily: "var(--font-heading)" }}
            >
              {style.label}...
            </span>

            {/* Whisper text */}
            {isLoading ? (
              <motion.span
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-xs italic"
                style={{ color: `${style.color}88`, fontFamily: "var(--font-narrator, 'Uncial Antiqua', serif)" }}
              >
                The sin stirs within...
              </motion.span>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-xs leading-relaxed"
                style={{
                  color: style.color,
                  fontFamily: "var(--font-narrator, 'Uncial Antiqua', serif)",
                  textShadow: `0 0 6px ${style.glow}`,
                }}
              >
                &ldquo;{whisper}&rdquo;
              </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
