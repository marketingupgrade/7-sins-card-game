/**
 * CorruptionCascade — Fires after 3+ cards played in one turn.
 *
 * Full-screen chromatic aberration overlay + "CORRUPTION CASCADE" text
 * slam with sin-colored ember burst. Duration ~0.85s.
 *
 * Octalysis CD3 (Empowerment of Creativity & Feedback):
 * Rewards creative multi-card combos with spectacular visual payoff,
 * reinforcing the player's sense of mastery and strategic expression.
 */
import { motion, AnimatePresence } from "framer-motion";
import type { SinType } from "@shared/gameTypes";

interface CorruptionCascadeProps {
  trigger: number;   // increment to fire
  sin: SinType;
}

// Brand Book faction palette (see /brandbook).
const SIN_HEX: Record<SinType, string> = {
  wrath: "#ef4444",
  sloth: "#a855f7",
  greed: "#eab308",
  envy: "#10b981",
  pride: "#f0f0f0",
  lust: "#ec4899",
  gluttony: "#b45309",
};

export default function CorruptionCascade({ trigger, sin }: CorruptionCascadeProps) {
  const hex = SIN_HEX[sin] ?? "#c890ff";

  return (
    <AnimatePresence mode="wait">
      {trigger > 0 && (
        <motion.div
          key={trigger}
          className="fixed inset-0 pointer-events-none z-[400]"
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 0.85, 0] }}
          transition={{ duration: 0.85, ease: [0.1, 0, 0.9, 1] }}
        >
          {/* Chromatic aberration — sin channel offset */}
          <motion.div
            className="absolute inset-0"
            initial={{ x: 0, opacity: 0.5 }}
            animate={{ x: [-4, 4, -2, 0], opacity: [0.5, 0.7, 0.3, 0] }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              background: `radial-gradient(ellipse at center, ${hex}55 0%, transparent 65%)`,
              mixBlendMode: "screen",
            }}
          />
          {/* Chromatic aberration — cyan channel */}
          <motion.div
            className="absolute inset-0"
            initial={{ x: 0, opacity: 0.4 }}
            animate={{ x: [3, -3, 1, 0], opacity: [0.4, 0.6, 0.2, 0] }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              background: "radial-gradient(ellipse at center, oklch(0.7 0.15 195 / 0.35) 0%, transparent 60%)",
              mixBlendMode: "screen",
            }}
          />
          {/* Vignette pulse */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            style={{
              background: `radial-gradient(ellipse at center, transparent 20%, oklch(0.04 0.02 30 / 0.85) 100%)`,
            }}
          />
          {/* CORRUPTION CASCADE text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scaleX: 0.1, scaleY: 1.8, opacity: 0 }}
              animate={{ scaleX: 1, scaleY: 1, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <span
                className="block text-4xl sm:text-5xl font-black tracking-[0.25em] uppercase text-center select-none"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: hex,
                  textShadow: `0 0 30px ${hex}, 0 0 60px ${hex}88, 0 4px 16px rgba(0,0,0,0.9)`,
                  WebkitTextStroke: `1px ${hex}`,
                }}
              >
                CORRUPTION
              </span>
              <span
                className="block text-3xl sm:text-4xl font-black tracking-[0.4em] uppercase text-center select-none mt-1"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "#fff",
                  textShadow: `0 0 20px ${hex}, 0 0 40px ${hex}66, 0 2px 12px rgba(0,0,0,0.9)`,
                }}
              >
                CASCADE
              </span>
            </motion.div>
            {/* Sin-colored ember burst */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              {Array.from({ length: 18 }).map((_, i) => {
                const angle = (i / 18) * 360;
                const dist = 80 + Math.random() * 120;
                const tx = Math.cos((angle * Math.PI) / 180) * dist;
                const ty = Math.sin((angle * Math.PI) / 180) * dist;
                return (
                  <motion.div
                    key={i}
                    className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: hex, boxShadow: `0 0 6px ${hex}` }}
                    initial={{ x: 0, y: 0, scale: 1, opacity: 0.9 }}
                    animate={{ x: tx, y: ty, scale: 0, opacity: 0 }}
                    transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
                  />
                );
              })}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
