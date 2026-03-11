/**
 * FactionUnlockCelebration - Cinematic unlock animation
 *
 * Full-screen overlay that plays when the player unlocks Greed & Envy
 * for the first time. Shows faction portraits emerging from darkness
 * with particle effects and dramatic text.
 */

import { motion, AnimatePresence } from "framer-motion";
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";

interface FactionUnlockCelebrationProps {
  show: boolean;
  onDismiss: () => void;
}

export default function FactionUnlockCelebration({ show, onDismiss }: FactionUnlockCelebrationProps) {
  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={onDismiss}
        >
          {/* Dark backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", damping: 15 }}
            className="relative z-10 text-center px-6 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow ring */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: [0, 0.6, 0.3] }}
              transition={{ delay: 0.2, duration: 1.2 }}
              className="absolute inset-0 -m-20 rounded-full"
              style={{
                background: "radial-gradient(circle, oklch(0.65 0.15 85 / 0.2) 0%, oklch(0.5 0.16 155 / 0.1) 50%, transparent 70%)",
              }}
            />

            {/* Title */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <p
                className="text-[10px] tracking-[0.4em] text-candle/70 uppercase mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                New Sins Unlocked
              </p>
              <h2
                className="text-3xl font-black tracking-wider text-foreground mb-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                GREED & ENVY
              </h2>
              <p
                className="text-sm text-muted-foreground/80 mb-6"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Your corruption deepens. Two new factions await.
              </p>
            </motion.div>

            {/* Faction portraits */}
            <div className="flex items-center justify-center gap-6 mb-8">
              {/* Greed */}
              <motion.div
                initial={{ x: -60, opacity: 0, rotateY: -30 }}
                animate={{ x: 0, opacity: 1, rotateY: 0 }}
                transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
                className="text-center"
              >
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full blur-xl"
                    style={{ background: "oklch(0.65 0.15 85 / 0.4)" }}
                  />
                  <img
                    src={FACTION_PORTRAITS.greed}
                    alt="Greed"
                    className="w-24 h-24 rounded-full object-cover border-2 relative z-10"
                    style={{ borderColor: "oklch(0.65 0.15 85)" }}
                  />
                </div>
                <p
                  className="text-sm font-black mt-2 tracking-wider"
                  style={{ fontFamily: "var(--font-heading)", color: "oklch(0.65 0.15 85)" }}
                >
                  GREED
                </p>
                <p className="text-[9px] text-muted-foreground/70" style={{ fontFamily: "var(--font-body)" }}>
                  Steal. Hoard. Profit.
                </p>
              </motion.div>

              {/* Envy */}
              <motion.div
                initial={{ x: 60, opacity: 0, rotateY: 30 }}
                animate={{ x: 0, opacity: 1, rotateY: 0 }}
                transition={{ delay: 1.0, duration: 0.8, type: "spring" }}
                className="text-center"
              >
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full blur-xl"
                    style={{ background: "oklch(0.5 0.16 155 / 0.4)" }}
                  />
                  <img
                    src={FACTION_PORTRAITS.envy}
                    alt="Envy"
                    className="w-24 h-24 rounded-full object-cover border-2 relative z-10"
                    style={{ borderColor: "oklch(0.5 0.16 155)" }}
                  />
                </div>
                <p
                  className="text-sm font-black mt-2 tracking-wider"
                  style={{ fontFamily: "var(--font-heading)", color: "oklch(0.5 0.16 155)" }}
                >
                  ENVY
                </p>
                <p className="text-[9px] text-muted-foreground/70" style={{ fontFamily: "var(--font-body)" }}>
                  Copy. Covet. Conquer.
                </p>
              </motion.div>
            </div>

            {/* Narrator quip */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="narrator-text text-sm mb-6"
            >
              "More sins, more problems. But you already knew that."
            </motion.p>

            {/* Dismiss button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDismiss}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-greed/30 to-envy/30 border border-greed/30 text-foreground font-bold tracking-wider text-sm hover:from-greed/40 hover:to-envy/40 transition-all"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              EMBRACE THE CORRUPTION
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
