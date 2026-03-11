/**
 * CinematicFlash — High-damage impact flash
 *
 * Triggers a white/sin-color screen flash + brief time-freeze visual
 * for devastating hits (≥20 damage). Creates a "hit the wall" cinematic
 * moment similar to fighting games.
 */

import { motion, AnimatePresence } from "framer-motion";

interface CinematicFlashProps {
  trigger: number;      // increment to trigger
  color?: string;       // sin color hex, default white
  intensity?: "epic" | "legendary";
}

export default function CinematicFlash({ trigger, color = "#ffffff", intensity = "epic" }: CinematicFlashProps) {
  return (
    <AnimatePresence mode="wait">
      {trigger > 0 && (
        <motion.div
          key={trigger}
          className="fixed inset-0 pointer-events-none z-[300]"
          initial={{ opacity: intensity === "legendary" ? 1 : 0.85 }}
          animate={{ opacity: [null, 0.6, 0] }}
          transition={{ duration: intensity === "legendary" ? 0.7 : 0.45, ease: [0.2, 0, 0.8, 1] }}
          style={{
            background: `radial-gradient(ellipse at center, ${color}cc 0%, ${color}44 40%, transparent 70%)`,
          }}
        >
          {/* Chromatic aberration lines */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0.6, scaleX: 1 }}
            animate={{ opacity: 0, scaleX: 1.02 }}
            transition={{ duration: 0.3 }}
            style={{
              background: `linear-gradient(90deg, transparent 20%, ${color}22 50%, transparent 80%)`,
              mixBlendMode: "overlay",
            }}
          />
          {/* Impact ripple */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4"
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: "200vw", height: "200vw", opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ borderColor: color }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
