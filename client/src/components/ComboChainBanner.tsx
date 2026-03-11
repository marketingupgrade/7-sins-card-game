/**
 * ComboChainBanner — Combo streak visual feedback
 *
 * Shows "⛓ CHAIN ×2" after 2 consecutive plays of the same sin,
 * escalating to "CORRUPTION SURGE" for ×4+ chains.
 * Inspired by fighting game combo counters.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { SinType } from "@shared/gameTypes";

interface ComboChainBannerProps {
  combo: number;       // current chain length (0 = hidden)
  sin: SinType;
}

const SIN_HEX: Record<SinType, string> = {
  wrath: "#ef4444",
  sloth: "#a855f7",
  greed: "#eab308",
  envy: "#10b981",
};

const SIN_LABEL: Record<SinType, string> = {
  wrath: "WRATH",
  sloth: "SLOTH",
  greed: "GREED",
  envy: "ENVY",
};

function getBannerText(combo: number): string {
  if (combo >= 5) return "UNHOLY SURGE";
  if (combo >= 4) return "CORRUPTION SURGE";
  if (combo >= 3) return "CHAIN REACTION";
  return "CHAIN";
}

export default function ComboChainBanner({ combo, sin }: ComboChainBannerProps) {
  const hex = SIN_HEX[sin];
  const isEpic = combo >= 4;
  const isSurge = combo >= 5;
  const label = getBannerText(combo);

  return (
    <AnimatePresence>
      {combo >= 2 && (
        <motion.div
          key={`${combo}-${sin}`}
          className="fixed left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[150] text-center"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -30, transition: { duration: 0.4 } }}
          transition={{ type: "spring", stiffness: 600, damping: 20 }}
        >
          {/* Main label */}
          <motion.div
            animate={isSurge ? { scale: [1, 1.06, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <span
              className="block text-3xl font-black uppercase tracking-[0.3em]"
              style={{
                fontFamily: "var(--font-heading)",
                color: hex,
                textShadow: `0 0 20px ${hex}, 0 0 40px ${hex}88`,
                WebkitTextStroke: isEpic ? `1px ${hex}` : "none",
              }}
            >
              {label}
            </span>
          </motion.div>

          {/* Chain count */}
          <motion.div
            key={combo}
            initial={{ scale: 1.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="flex items-center justify-center gap-2 mt-1"
          >
            <span
              className="text-lg font-black"
              style={{
                fontFamily: "var(--font-heading)",
                color: "#fff",
                textShadow: `0 0 12px ${hex}`,
              }}
            >
              ×{combo}
            </span>
            <span
              className="text-xs tracking-widest opacity-70"
              style={{ fontFamily: "var(--font-heading)", color: hex }}
            >
              {SIN_LABEL[sin]}
            </span>
          </motion.div>

          {/* Background halo */}
          <motion.div
            className="absolute inset-0 -z-10 rounded-xl"
            animate={{ opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              background: `radial-gradient(ellipse at center, ${hex}33 0%, transparent 70%)`,
              filter: "blur(8px)",
              transform: "scale(1.5)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
