/**
 * CardFrameGlow — Animated rarity-tier glow border for cards
 *
 * Wraps a card with a glowing animated border based on card rarity/cost:
 * - Common (0-1 cost): no glow
 * - Uncommon (2 cost): subtle sin-colored pulse
 * - Rare (3 cost): bright rotating gradient border
 * - Epic (4+ cost): intense holographic shimmer with particle sparkles
 */

import { motion } from "framer-motion";
import type { SinType } from "@shared/gameTypes";

interface CardFrameGlowProps {
  cost: number;
  sin: SinType;
  children: React.ReactNode;
  className?: string;
}

const SIN_GLOW: Record<string, { primary: string; secondary: string; accent: string }> = {
  wrath: { primary: "oklch(0.65 0.3 25)", secondary: "oklch(0.55 0.25 40)", accent: "oklch(0.8 0.2 60)" },
  sloth: { primary: "oklch(0.5 0.25 280)", secondary: "oklch(0.45 0.2 300)", accent: "oklch(0.65 0.2 260)" },
  greed: { primary: "oklch(0.8 0.2 85)", secondary: "oklch(0.7 0.18 95)", accent: "oklch(0.9 0.15 75)" },
  envy: { primary: "oklch(0.6 0.25 145)", secondary: "oklch(0.5 0.2 160)", accent: "oklch(0.75 0.2 130)" },
  pride: { primary: "oklch(0.9 0.05 0)", secondary: "oklch(0.85 0.08 60)", accent: "oklch(0.95 0.1 45)" },
  lust: { primary: "oklch(0.6 0.25 350)", secondary: "oklch(0.55 0.2 330)", accent: "oklch(0.75 0.2 10)" },
  gluttony: { primary: "oklch(0.55 0.2 50)", secondary: "oklch(0.5 0.18 60)", accent: "oklch(0.7 0.15 40)" },
};

function getRarity(cost: number): "common" | "uncommon" | "rare" | "epic" {
  if (cost <= 1) return "common";
  if (cost === 2) return "uncommon";
  if (cost === 3) return "rare";
  return "epic";
}

export default function CardFrameGlow({ cost, sin, children, className = "" }: CardFrameGlowProps) {
  const rarity = getRarity(cost);
  const glow = SIN_GLOW[sin] || SIN_GLOW.wrath;

  if (rarity === "common") {
    return <div className={className}>{children}</div>;
  }

  if (rarity === "uncommon") {
    return (
      <motion.div
        className={`relative ${className}`}
        animate={{ boxShadow: [
          `0 0 8px 1px ${glow.primary}`,
          `0 0 14px 2px ${glow.secondary}`,
          `0 0 8px 1px ${glow.primary}`,
        ]}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ borderRadius: "inherit" }}
      >
        {children}
      </motion.div>
    );
  }

  if (rarity === "rare") {
    return (
      <div className={`relative ${className}`}>
        {/* Rotating gradient border */}
        <motion.div
          className="absolute -inset-[2px] rounded-[inherit] pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{
            background: `conic-gradient(from 0deg, ${glow.primary}, ${glow.secondary}, ${glow.accent}, ${glow.primary})`,
            filter: "blur(3px)",
            opacity: 0.7,
            borderRadius: "inherit",
          }}
        />
        <div className="relative" style={{ borderRadius: "inherit" }}>
          {children}
        </div>
      </div>
    );
  }

  // Epic — intense holographic shimmer
  return (
    <div className={`relative ${className}`}>
      {/* Outer glow pulse */}
      <motion.div
        className="absolute -inset-[3px] rounded-[inherit] pointer-events-none"
        animate={{
          boxShadow: [
            `0 0 15px 3px ${glow.primary}, 0 0 30px 6px ${glow.secondary}`,
            `0 0 25px 5px ${glow.accent}, 0 0 50px 10px ${glow.primary}`,
            `0 0 15px 3px ${glow.primary}, 0 0 30px 6px ${glow.secondary}`,
          ],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ borderRadius: "inherit" }}
      />
      {/* Rotating gradient border */}
      <motion.div
        className="absolute -inset-[2px] rounded-[inherit] pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{
          background: `conic-gradient(from 0deg, ${glow.primary}, transparent, ${glow.accent}, transparent, ${glow.secondary}, transparent, ${glow.primary})`,
          filter: "blur(2px)",
          opacity: 0.9,
          borderRadius: "inherit",
        }}
      />
      <div className="relative" style={{ borderRadius: "inherit" }}>
        {children}
      </div>
    </div>
  );
}
