/**
 * SinCorruptionBorder — Spreading corruption UI overlay
 *
 * As the game progresses and damage accumulates, glowing cracks spread
 * inward from the screen edges. The corruption color matches the leading sin.
 * Gives the UI a "reality breaking down" feel at high rounds / low HP.
 */

import { motion } from "framer-motion";
import type { SinType } from "@shared/gameTypes";

interface SinCorruptionBorderProps {
  sin: SinType;
  /** 0–1: how corrupted (based on round progress + damage taken) */
  intensity: number;
  /** 0–1: player HP ratio (lower = more personal corruption) */
  hpRatio: number;
}

const SIN_HEX: Record<SinType, string> = {
  wrath: "#ef4444",
  sloth: "#a855f7",
  greed: "#eab308",
  envy: "#10b981",
  pride: "#f0f0f0",
  lust: "#ec4899",
  gluttony: "#b45309",
};

export default function SinCorruptionBorder({ sin, intensity, hpRatio }: SinCorruptionBorderProps) {
  const hex = SIN_HEX[sin];
  // Combined corruption factor
  const corruption = Math.min(1, intensity * 0.6 + (1 - hpRatio) * 0.4);
  if (corruption < 0.05) return null;

  const borderGlow = `0 0 ${Math.round(corruption * 60)}px ${hex}${Math.round(corruption * 200).toString(16).padStart(2, "0")}`;
  const innerSpread = `${Math.round(corruption * 20)}px`;

  return (
    <div className="fixed inset-0 pointer-events-none z-[5]">
      {/* Main border glow */}
      <motion.div
        className="absolute inset-0"
        animate={{
          boxShadow: [
            `inset 0 0 ${Math.round(corruption * 40)}px ${hex}${Math.round(corruption * 100).toString(16).padStart(2, "0")}`,
            `inset 0 0 ${Math.round(corruption * 60)}px ${hex}${Math.round(corruption * 150).toString(16).padStart(2, "0")}`,
            `inset 0 0 ${Math.round(corruption * 40)}px ${hex}${Math.round(corruption * 100).toString(16).padStart(2, "0")}`,
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Corner corruption patches */}
      {[
        { corner: "top-0 left-0", origin: "top left" },
        { corner: "top-0 right-0", origin: "top right" },
        { corner: "bottom-0 left-0", origin: "bottom left" },
        { corner: "bottom-0 right-0", origin: "bottom right" },
      ].map(({ corner, origin }) => (
        <motion.div
          key={corner}
          className={`absolute ${corner}`}
          style={{
            width: `${corruption * 25 + 5}vw`,
            height: `${corruption * 25 + 5}vh`,
            background: `radial-gradient(circle at ${origin}, ${hex}${Math.round(corruption * 60).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
          }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 1.5 }}
        />
      ))}

      {/* Crack lines at high corruption */}
      {corruption > 0.4 && (
        <>
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ opacity: Math.min(1, (corruption - 0.4) * 2) }}
          >
            <defs>
              <filter id="crack-glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Top-left crack */}
            <polyline
              points={`0,${Math.round(corruption * 80)} ${Math.round(corruption * 120)},${Math.round(corruption * 60)} ${Math.round(corruption * 80)},${Math.round(corruption * 150)}`}
              fill="none"
              stroke={hex}
              strokeWidth="1.5"
              strokeOpacity="0.6"
              filter="url(#crack-glow)"
            />
            {/* Bottom-right crack */}
            <polyline
              points={`100%,${`${100 - Math.round(corruption * 20)}%`} ${`${100 - Math.round(corruption * 15)}%`},${`${100 - Math.round(corruption * 35)}%`}`}
              fill="none"
              stroke={hex}
              strokeWidth="1.5"
              strokeOpacity="0.5"
              filter="url(#crack-glow)"
            />
          </svg>
        </>
      )}
    </div>
  );
}
