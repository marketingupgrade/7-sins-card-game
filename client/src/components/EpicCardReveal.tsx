/**
 * EpicCardReveal — Cinematic card reveal for high-cost cards
 *
 * When a card costing 4+ energy is played, this component fires a
 * 1.5-second spotlight reveal: dramatic vignette + card name + sin sigil.
 * Homage to TCG foil reveal moments.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { SinType } from "@shared/gameTypes";

interface EpicCardRevealProps {
  show: boolean;
  cardName: string;
  sin: SinType;
  energyCost: number;
  onComplete: () => void;
}

const SIN_HEX: Record<SinType, string> = {
  wrath: "#ef4444",
  sloth: "#a855f7",
  greed: "#eab308",
  envy: "#10b981",
};

const SIN_GRADIENT: Record<SinType, string> = {
  wrath: "radial-gradient(ellipse at center, #ef444422 0%, #7f1d1d11 50%, transparent 70%)",
  sloth: "radial-gradient(ellipse at center, #a855f722 0%, #4a044e11 50%, transparent 70%)",
  greed: "radial-gradient(ellipse at center, #eab30822 0%, #78350f11 50%, transparent 70%)",
  envy:  "radial-gradient(ellipse at center, #10b98122 0%, #064e3b11 50%, transparent 70%)",
};

export default function EpicCardReveal({ show, cardName, sin, energyCost, onComplete }: EpicCardRevealProps) {
  const hex = SIN_HEX[sin];
  const isLegendary = energyCost >= 6;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[250] pointer-events-none flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onAnimationComplete={() => {
            // Auto-dismiss after 1.5s
            setTimeout(onComplete, 1500);
          }}
        >
          {/* Dark vignette */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            style={{ background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.85) 100%)" }}
          />

          {/* Sin background bloom */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: SIN_GRADIENT[sin] }}
          />

          {/* Spotlight rays */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: [0, 0.4, 0.2], rotate: 15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{
              width: "120vw",
              height: "120vw",
              background: `conic-gradient(from 0deg, transparent 0deg, ${hex}08 10deg, transparent 20deg, ${hex}06 30deg, transparent 40deg, ${hex}08 50deg, transparent 60deg, ${hex}06 70deg, transparent 80deg, ${hex}08 90deg, transparent 100deg, ${hex}06 110deg, transparent 120deg)`,
            }}
          />

          {/* Card name reveal */}
          <motion.div className="relative text-center px-8">
            {/* Tier label */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xs tracking-[0.5em] uppercase mb-3"
              style={{ color: hex, fontFamily: "var(--font-heading)", opacity: 0.7 }}
            >
              {isLegendary ? "✦ LEGENDARY ✦" : "✦ EPIC PLAY ✦"}
            </motion.p>

            {/* Card name */}
            <motion.h2
              initial={{ opacity: 0, scale: 0.7, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
              className="text-5xl font-black tracking-wide"
              style={{
                fontFamily: "var(--font-heading)",
                color: "#fff",
                textShadow: `0 0 30px ${hex}, 0 0 60px ${hex}88, 0 2px 0 ${hex}44`,
                WebkitTextStroke: `1px ${hex}66`,
              }}
            >
              {cardName}
            </motion.h2>

            {/* Energy cost pips */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 mt-4"
            >
              {Array.from({ length: energyCost }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.35 + i * 0.06, type: "spring" }}
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: hex,
                    boxShadow: `0 0 8px ${hex}`,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Bottom scan line */}
          <motion.div
            className="absolute left-0 right-0 h-px"
            initial={{ top: "0%", opacity: 0.6 }}
            animate={{ top: "100%", opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeIn" }}
            style={{ background: `linear-gradient(90deg, transparent, ${hex}, transparent)` }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
