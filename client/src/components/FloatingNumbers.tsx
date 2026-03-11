/**
 * FloatingNumbers.tsx
 * Renders small floating damage/heal/shield numbers that arc upward and fade out.
 * Designed to be subtle and non-intrusive on mobile.
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingNumber {
  id: string;
  value: number;
  type: 'damage' | 'heal' | 'shield';
  x: number;
  y: number;
}

interface FloatingNumbersProps {
  numbers: FloatingNumber[];
  onComplete?: (id: string) => void;
}

const FloatingNumbers: React.FC<FloatingNumbersProps> = ({ numbers, onComplete }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <AnimatePresence>
        {numbers.map((number) => (
          <FloatingNumberItem key={number.id} number={number} onComplete={onComplete} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface FloatingNumberItemProps {
  number: FloatingNumber;
  onComplete?: (id: string) => void;
}

const FloatingNumberItem: React.FC<FloatingNumberItemProps> = ({ number, onComplete }) => {
  const { id, value, type, x, y } = number;

  const spread = React.useMemo(() => ({
    x: (Math.random() - 0.5) * 20,
  }), []);

  const config = {
    damage: { color: 'oklch(0.65 0.25 25)', prefix: '-', yDrift: -40 },
    heal:   { color: 'oklch(0.72 0.19 155)', prefix: '+', yDrift: -35 },
    shield: { color: 'oklch(0.85 0.18 195)', prefix: '+', yDrift: -45 },
  }[type] || { color: '#fff', prefix: '', yDrift: -30 };

  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(id), 1000);
    return () => clearTimeout(timer);
  }, [id, onComplete]);

  return (
    <motion.div
      initial={{ left: `${x}%`, top: `${y}%`, opacity: 0.9, scale: 0.7 }}
      animate={{
        left: `${x + spread.x}%`,
        top: `calc(${y}% + ${config.yDrift}px)`,
        opacity: 0,
        scale: 1,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className="absolute"
      style={{
        fontSize: '16px',
        fontWeight: 800,
        color: config.color,
        textShadow: `0 1px 4px rgba(0,0,0,0.8)`,
        fontFamily: 'var(--font-heading), system-ui, sans-serif',
        userSelect: 'none',
      }}
    >
      {config.prefix}{Math.abs(value)}
    </motion.div>
  );
};

export default FloatingNumbers;
