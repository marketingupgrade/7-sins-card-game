/**
 * GameLoadingScreen — Branded loading screen shown while game state initializes
 *
 * Displays a rotating narrator quote with cathedral aesthetic while the game
 * loads. Replaces generic spinners with atmospheric brand experience.
 */

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { playChoirPad } from "@/lib/cathedralSounds";

const LOADING_QUOTES = [
  "The cathedral prepares your penance.",
  "Shuffling the deck of damnation.",
  "Your sins are being catalogued.",
  "The other sinners are gathering.",
  "Corruption flows through the halls.",
  "The altar is being prepared.",
  "Every card game promises you power. We promise you honesty.",
  "The mathematics of evil require precision.",
  "Patience. Even damnation takes a moment.",
  "The cathedral does not rush. Neither should you.",
];

interface GameLoadingScreenProps {
  message?: string;
}

export default function GameLoadingScreen({ message }: GameLoadingScreenProps) {
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * LOADING_QUOTES.length));

  useEffect(() => {
    playChoirPad();
    const interval = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % LOADING_QUOTES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at center, oklch(0.10 0.02 280), oklch(0.05 0.01 280))",
      }}
    >
      {/* Cathedral glow */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          background: "radial-gradient(circle at 50% 20%, oklch(0.75 0.12 85 / 0.2), transparent 50%)",
        }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 text-center px-8 max-w-md">
        {/* Animated sigil */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-8"
        >
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="oklch(0.75 0.12 85 / 0.2)"
              strokeWidth="1"
              strokeDasharray="4 8"
            />
            <circle
              cx="32"
              cy="32"
              r="20"
              fill="none"
              stroke="oklch(0.75 0.12 85 / 0.15)"
              strokeWidth="0.5"
            />
            {/* Seven points for seven sins */}
            {Array.from({ length: 7 }, (_, i) => {
              const angle = (i * 360) / 7 - 90;
              const rad = (angle * Math.PI) / 180;
              const x = 32 + 24 * Math.cos(rad);
              const y = 32 + 24 * Math.sin(rad);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="oklch(0.75 0.12 85 / 0.4)"
                />
              );
            })}
          </svg>
        </motion.div>

        {/* Loading text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs tracking-[0.4em] uppercase mb-6"
          style={{
            fontFamily: "var(--font-heading)",
            color: "oklch(0.75 0.12 85 / 0.4)",
          }}
        >
          {message || "Entering the Cathedral"}
        </motion.p>

        {/* Rotating quote */}
        <motion.p
          key={quoteIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5 }}
          className="text-sm italic leading-relaxed"
          style={{
            fontFamily: "var(--font-narrator)",
            color: "oklch(0.85 0.08 85 / 0.35)",
          }}
        >
          "{LOADING_QUOTES[quoteIdx]}"
        </motion.p>

        {/* Progress bar */}
        <div className="mt-8 w-48 h-px mx-auto overflow-hidden rounded-full bg-white/5">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-1/3 rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, oklch(0.75 0.12 85 / 0.4), transparent)" }}
          />
        </div>
      </div>
    </div>
  );
}

export { LOADING_QUOTES };
