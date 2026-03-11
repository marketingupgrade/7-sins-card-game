/**
 * RoundTransitionWipe.tsx
 * Brief, subtle round transition — a quick centered overlay that fades in/out
 * without blocking gameplay for too long.
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RoundTransitionWipeProps {
  round: number;
  show: boolean;
  onComplete: () => void;
}

const RoundTransitionWipe: React.FC<RoundTransitionWipeProps> = ({
  round,
  show,
  onComplete,
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 1200);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          {/* Dimmed backdrop */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Round label */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative text-center"
          >
            <span
              className="text-sm font-bold tracking-[0.3em] uppercase text-foreground/60"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Round
            </span>
            <h1
              className="text-6xl sm:text-7xl font-black"
              style={{
                color: 'oklch(0.85 0.18 195)',
                textShadow: '0 0 12px oklch(0.85 0.18 195 / 0.5), 0 2px 8px rgba(0,0,0,0.8)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {round}
            </h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="h-0.5 mx-auto mt-2"
              style={{
                width: '80px',
                background: 'linear-gradient(90deg, transparent, oklch(0.85 0.18 195), transparent)',
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoundTransitionWipe;
