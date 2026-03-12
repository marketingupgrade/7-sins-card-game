/**
 * GodRays — Volumetric light scattering for cathedral atmosphere
 *
 * Adds dramatic god-ray beams shining down from above the arena.
 * Uses a CSS-only approach with animated gradient beams for performance
 * (Babylon VolumetricLightScattering is too heavy for an overlay effect).
 *
 * The beams shift color based on the active sin and intensify during
 * epic card reveals.
 */

import { motion } from "framer-motion";
import type { SinType } from "@shared/gameTypes";

interface GodRaysProps {
  sin: SinType;
  intensity?: number; // 0-1, default 0.3
  className?: string;
}

const SIN_RAY_COLORS: Record<string, { primary: string; secondary: string }> = {
  wrath: { primary: "rgba(239,68,68,0.08)", secondary: "rgba(249,115,22,0.04)" },
  sloth: { primary: "rgba(168,85,247,0.08)", secondary: "rgba(129,140,248,0.04)" },
  greed: { primary: "rgba(234,179,8,0.08)", secondary: "rgba(245,158,11,0.04)" },
  envy: { primary: "rgba(16,185,129,0.08)", secondary: "rgba(52,211,153,0.04)" },
  pride: { primary: "rgba(255,255,255,0.1)", secondary: "rgba(251,191,36,0.05)" },
  lust: { primary: "rgba(236,72,153,0.08)", secondary: "rgba(244,114,182,0.04)" },
  gluttony: { primary: "rgba(180,83,9,0.08)", secondary: "rgba(217,119,6,0.04)" },
};

export default function GodRays({ sin, intensity = 0.3, className = "" }: GodRaysProps) {
  const colors = SIN_RAY_COLORS[sin] || SIN_RAY_COLORS.wrath;

  // Generate 5 light beams at different angles
  const beams = [
    { angle: -25, width: 120, left: "15%", delay: 0 },
    { angle: -10, width: 80, left: "35%", delay: 0.5 },
    { angle: 5, width: 100, left: "50%", delay: 1.0 },
    { angle: 15, width: 70, left: "65%", delay: 1.5 },
    { angle: 30, width: 90, left: "80%", delay: 2.0 },
  ];

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ opacity: intensity }}
    >
      {beams.map((beam, i) => (
        <motion.div
          key={i}
          className="absolute top-0"
          style={{
            left: beam.left,
            width: beam.width,
            height: "120%",
            transform: `rotate(${beam.angle}deg)`,
            transformOrigin: "top center",
            background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.secondary} 40%, transparent 80%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.3, 0.7, 0.4, 0.8, 0.3],
          }}
          transition={{
            duration: 8 + i * 1.5,
            repeat: Infinity,
            delay: beam.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Central bright shaft */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2"
        style={{
          width: 200,
          height: "100%",
          background: `radial-gradient(ellipse at top, ${colors.primary} 0%, transparent 60%)`,
        }}
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scaleX: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
