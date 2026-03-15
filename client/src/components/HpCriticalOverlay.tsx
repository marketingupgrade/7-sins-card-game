/**
 * HpCriticalOverlay.tsx
 * Subtle pulsing red vignette at screen edges when HP is critically low.
 * Designed to be noticeable but not distracting.
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HpCriticalOverlayProps {
  hpPercent: number;
  isActive: boolean;
}

const HpCriticalOverlay: React.FC<HpCriticalOverlayProps> = ({ hpPercent, isActive }) => {
  const shouldShow = isActive && hpPercent <= 0.2;

  const pulseConfig = useMemo(() => {
    if (hpPercent <= 0.05) return { duration: 0.6, intensity: 0.25 };
    if (hpPercent <= 0.1) return { duration: 0.8, intensity: 0.18 };
    return { duration: 1.2, intensity: 0.12 };
  }, [hpPercent]);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-30 pointer-events-none"
        >
          <motion.div
            animate={{ opacity: [0.04, pulseConfig.intensity, 0.04] }}
            transition={{ duration: pulseConfig.duration, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, transparent 50%, oklch(0.5 0.25 25 / 0.6) 100%)`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(HpCriticalOverlay);
