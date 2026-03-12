/**
 * DeathSequence.tsx
 * Elimination notification overlay with optional "lethal blow" enhancement.
 *
 * Octalysis CD8 (Loss & Avoidance):
 * The enhanced lethal blow variant makes elimination feel consequential
 * and dramatic — a sin-colored expanding ring, "OBLITERATED" text, and
 * killer card callout create emotional weight that drives loss aversion
 * and the desire to avoid being on the receiving end.
 */
import type { SinType } from "@shared/gameTypes";
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeathSequenceProps {
  show: boolean;
  playerName: string;
  sin: SinType;
  onComplete: () => void;
  /** If true, plays the enhanced "lethal blow" variant with expanding ring + OBLITERATED text */
  lethalBlow?: boolean;
  /** Name of the card that dealt the killing blow (shown in lethal blow variant) */
  killerCardName?: string;
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

const DeathSequence: React.FC<DeathSequenceProps> = ({
  show,
  playerName,
  sin,
  onComplete,
  lethalBlow = false,
  killerCardName,
}) => {
  const duration = lethalBlow ? 2500 : 1500;

  // Stabilize onComplete to prevent infinite re-render loop
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onCompleteRef.current(), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

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
          {/* Dimmed backdrop — heavier for lethal blow */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: lethalBlow ? 0.75 : 0.5 }}
            transition={{ duration: 0.3 }}
            style={{ backgroundColor: '#000' }}
          />

          {/* Lethal blow: sin-colored bloom expanding ring */}
          {lethalBlow && (
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
              initial={{ width: 0, height: 0, opacity: 0.8 }}
              animate={{ width: '140vw', height: '140vw', opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ borderColor: color }}
            />
          )}

          <motion.div
            className="relative text-center px-8"
            initial={{ scale: lethalBlow ? 1.4 : 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: lethalBlow ? [0, 0, 8] : 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {/* Killer card callout (lethal blow only) */}
            {lethalBlow && killerCardName && (
              <motion.p
                className="text-xs font-bold tracking-[0.4em] uppercase mb-3"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color,
                  textShadow: `0 0 8px ${color}`,
                }}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {killerCardName}
              </motion.p>
            )}

            <motion.h2
              className={`font-black tracking-wider ${lethalBlow ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl'}`}
              style={{ color, textShadow: `0 0 ${lethalBlow ? 24 : 12}px ${color}80, 0 2px 8px rgba(0,0,0,0.8)` }}
              initial={{ filter: 'grayscale(0%)' }}
              animate={{ filter: 'grayscale(100%)' }}
              transition={{ delay: lethalBlow ? 1.0 : 0.6, duration: lethalBlow ? 0.8 : 0.5 }}
            >
              {playerName}
            </motion.h2>
            <motion.p
              className="text-sm font-bold tracking-[0.3em] uppercase mt-2"
              style={{ color: '#888', fontFamily: 'var(--font-heading)' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: lethalBlow ? [0, 0, 6] : 0 }}
              transition={{ delay: 0.3, ...(lethalBlow ? { duration: 2 } : {}) }}
            >
              {lethalBlow ? 'OBLITERATED' : 'Eliminated'}
            </motion.p>

            {/* Lethal blow: slow downward drift shadow */}
            {lethalBlow && (
              <motion.div
                className="absolute inset-0 -z-10 rounded-2xl"
                animate={{ opacity: [0.2, 0.5, 0] }}
                transition={{ duration: 2, ease: 'easeOut' }}
                style={{
                  background: `radial-gradient(ellipse at center, ${color}44 0%, transparent 70%)`,
                  filter: 'blur(16px)',
                  transform: 'scale(2)',
                }}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeathSequence;
