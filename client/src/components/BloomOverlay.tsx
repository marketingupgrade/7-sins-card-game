/**
 * BloomOverlay — CSS-based bloom/glow post-processing effect
 *
 * Triggered on epic card reveals (cost >= 4) and critical moments.
 * Creates a radial glow burst with sin-colored light that fades out.
 * Much lighter than Babylon bloom — uses CSS animations only.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { SinType } from "@shared/gameTypes";

interface BloomOverlayProps {
  trigger: number;
  sin: SinType;
  duration?: number;
}

const SIN_GLOW_COLORS: Record<string, string> = {
  wrath: "oklch(0.65 0.3 25)",
  sloth: "oklch(0.5 0.25 280)",
  greed: "oklch(0.8 0.2 85)",
  envy: "oklch(0.6 0.25 145)",
  pride: "oklch(0.9 0.05 0)",
  lust: "oklch(0.6 0.25 350)",
  gluttony: "oklch(0.55 0.2 50)",
};

export default function BloomOverlay({ trigger, sin, duration = 800 }: BloomOverlayProps) {
  const [show, setShow] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (trigger <= 0) return;
    setKey(trigger);
    setShow(true);
    const timer = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(timer);
  }, [trigger, duration]);

  const color = SIN_GLOW_COLORS[sin] || SIN_GLOW_COLORS.wrath;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={key}
          initial={{ opacity: 0.8, scale: 0.5 }}
          animate={{ opacity: 0, scale: 2.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration / 1000, ease: "easeOut" }}
          className="fixed inset-0 pointer-events-none z-[60]"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 50%)`,
            mixBlendMode: "screen",
          }}
        />
      )}
    </AnimatePresence>
  );
}
