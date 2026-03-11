/**
 * HpCriticalOverlay.tsx
 * Pulsing red vignette overlay when HP is critically low
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HpCriticalOverlayProps {
  hpPercent: number;
  isActive: boolean;
}

const HpCriticalOverlay: React.FC<HpCriticalOverlayProps> = ({ 
  hpPercent, 
  isActive 
}) => {
  const shouldShow = isActive && hpPercent <= 0.2;
  
  // Calculate pulse speed based on HP percentage
  const pulseConfig = useMemo(() => {
    if (hpPercent <= 0.05) {
      return { duration: 0.4, intensity: 0.6 }; // Very fast, intense
    } else if (hpPercent <= 0.1) {
      return { duration: 0.6, intensity: 0.5 }; // Fast
    } else if (hpPercent <= 0.15) {
      return { duration: 0.8, intensity: 0.4 }; // Medium
    } else {
      return { duration: 1.2, intensity: 0.3 }; // Slow
    }
  }, [hpPercent]);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-40"
          style={{
            pointerEvents: 'none',
            mixBlendMode: 'multiply',
          }}
        >
          {/* Main vignette */}
          <motion.div
            animate={{
              opacity: [0.1, pulseConfig.intensity, 0.1],
            }}
            transition={{
              duration: pulseConfig.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, 
                transparent 30%, 
                oklch(0.65 0.25 25) 70%, 
                oklch(0.45 0.35 25) 100%)`,
            }}
          />
          
          {/* Additional edge darkening */}
          <motion.div
            animate={{
              opacity: [0.2, pulseConfig.intensity * 0.8, 0.2],
            }}
            transition={{
              duration: pulseConfig.duration * 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(0deg, oklch(0.35 0.25 25) 0%, transparent 20%),
                linear-gradient(90deg, oklch(0.35 0.25 25) 0%, transparent 20%),
                linear-gradient(180deg, oklch(0.35 0.25 25) 0%, transparent 20%),
                linear-gradient(270deg, oklch(0.35 0.25 25) 0%, transparent 20%)
              `,
            }}
          />

          {/* Subtle scan lines for extra intensity at very low HP */}
          {hpPercent <= 0.05 && (
            <motion.div
              animate={{
                y: ['-100%', '100vh'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute w-full h-8 opacity-20"
              style={{
                background: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 1px,
                  oklch(0.65 0.25 25) 2px,
                  oklch(0.65 0.25 25) 3px
                )`,
                filter: 'blur(0.5px)',
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HpCriticalOverlay;
