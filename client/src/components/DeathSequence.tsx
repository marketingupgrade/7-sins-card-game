import type { SinType } from "@shared/gameTypes";
/**
 * DeathSequence.tsx
 * Brief elimination notification — shows a centered overlay for ~1.5s
 * without fully blocking the game board.
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeathSequenceProps {
  show: boolean;
  playerName: string;
  sin: SinType;
  onComplete: () => void;
}

const sinColors: Record<string, string> = {
  wrath: '#dc2626',
  sloth: '#7c3aed',
  greed: '#f59e0b',
  envy: '#059669',
  pride: '#f0f0f0',
  lust: '#ec4899',
  gluttony: '#b45309',
};

const DeathSequence: React.FC<DeathSequenceProps> = ({ show, playerName, sin, onComplete }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  const color = sinColors[sin] || '#888';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Dimmed backdrop */}
          <div className="absolute inset-0 bg-black/50" />

          <motion.div
            className="relative text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <motion.h2
              className="text-3xl sm:text-4xl font-black tracking-wider"
              style={{ color, textShadow: `0 0 12px ${color}80, 0 2px 8px rgba(0,0,0,0.8)` }}
              initial={{ filter: 'grayscale(0%)' }}
              animate={{ filter: 'grayscale(100%)' }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {playerName}
            </motion.h2>
            <motion.p
              className="text-sm font-bold tracking-[0.3em] uppercase mt-1"
              style={{ color: '#888' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Eliminated
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeathSequence;
