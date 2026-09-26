/**
 * GlowPulse — a breathing glow that costs nothing per frame.
 *
 * Looping `boxShadow` in framer re-rasterises the shadow on the main thread
 * every frame, forever. Here the shadow is painted once at its peak and
 * only the layer's opacity animates, which the browser runs on the
 * compositor. Drop inside any positioned element (relative/absolute).
 */
import { motion } from "framer-motion";

interface GlowPulseProps {
  /** box-shadow at the brightest point of the pulse */
  shadow: string;
  /** opacity at the dimmest point (0–1) */
  min?: number;
  duration?: number;
  radius?: number | string;
}

export default function GlowPulse({ shadow, min = 0.35, duration = 2, radius = "inherit" }: GlowPulseProps) {
  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ boxShadow: shadow, borderRadius: radius }}
      initial={{ opacity: min }}
      animate={{ opacity: [min, 1, min] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
