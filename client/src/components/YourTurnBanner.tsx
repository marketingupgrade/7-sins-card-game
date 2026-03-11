/**
 * YourTurnBanner.tsx
 * Subtle "YOUR TURN" notification that slides in at the top of the screen
 * without blocking gameplay. Slick, yet subtle and elegant.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface YourTurnBannerProps {
  show: boolean;
  sinType: 'wrath' | 'sloth' | 'greed' | 'envy';
}

const YourTurnBanner: React.FC<YourTurnBannerProps> = ({ show, sinType }) => {
  const [isVisible, setIsVisible] = useState(false);

  const sinColors = {
    wrath: 'oklch(0.65 0.25 25)',
    sloth: 'oklch(0.65 0.18 300)',
    greed: 'oklch(0.78 0.18 90)',
    envy: 'oklch(0.72 0.19 155)',
  };

  const sinColor = sinColors[sinType];

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-2 left-1/2 -translate-x-1/2 z-50"
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="px-6 py-2 rounded-full backdrop-blur-md border"
            style={{
              background: `linear-gradient(135deg, ${sinColor}30, ${sinColor}15)`,
              borderColor: `${sinColor}50`,
              boxShadow: `0 0 20px ${sinColor}25, 0 4px 12px rgba(0,0,0,0.3)`,
            }}
          >
            <span
              className="text-sm font-bold tracking-[0.2em] uppercase"
              style={{
                color: sinColor,
                textShadow: `0 0 8px ${sinColor}60`,
              }}
            >
              Your Turn
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default YourTurnBanner;
