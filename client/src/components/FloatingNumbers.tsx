/**
 * FloatingNumbers.tsx
 * Renders floating damage/heal/shield numbers that arc upward and fade out
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
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {numbers.map((number) => (
          <FloatingNumber key={number.id} number={number} onComplete={onComplete} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface FloatingNumberItemProps {
  number: FloatingNumber;
  onComplete?: (id: string) => void;
}

const FloatingNumber: React.FC<FloatingNumberItemProps> = ({ number, onComplete }) => {
  const { id, value, type, x, y } = number;

  // Generate random spread for damage numbers
  const randomSpread = React.useMemo(() => ({
    x: (Math.random() - 0.5) * 40,
    y: (Math.random() - 0.5) * 20
  }), []);

  // Calculate animation direction based on type
  const getAnimationProps = () => {
    switch (type) {
      case 'damage':
        return {
          x: [0, -50 + randomSpread.x],
          y: [0, -80 + randomSpread.y],
          color: 'oklch(0.65 0.25 25)', // wrath red
          prefix: '-',
          shadow: '0 0 20px oklch(0.65 0.25 25)'
        };
      case 'heal':
        return {
          x: [0, 30 + randomSpread.x],
          y: [0, -70],
          color: 'oklch(0.72 0.19 155)', // envy green
          prefix: '+',
          shadow: '0 0 20px oklch(0.72 0.19 155)'
        };
      case 'shield':
        return {
          x: [0, randomSpread.x * 0.5],
          y: [0, -90],
          color: 'oklch(0.85 0.18 195)', // neon cyan
          prefix: '+',
          shadow: '0 0 20px oklch(0.85 0.18 195)'
        };
      default:
        return {
          x: [0, 0],
          y: [0, -60],
          color: '#ffffff',
          prefix: '',
          shadow: '0 0 20px #ffffff'
        };
    }
  };

  const animProps = getAnimationProps();

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.(id);
    }, 1500);

    return () => clearTimeout(timer);
  }, [id, onComplete]);

  return (
    <motion.div
      initial={{
        x: x,
        y: y,
        opacity: 1,
        scale: 0.5,
      }}
      animate={{
        x: x + animProps.x[1],
        y: y + animProps.y[1],
        opacity: 0,
        scale: 1.2,
      }}
      exit={{
        opacity: 0,
        scale: 0.8,
      }}
      transition={{
        duration: 1.5,
        ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuart
        scale: {
          duration: 0.3,
          ease: [0.68, -0.55, 0.265, 1.55], // easeOutBack
        }
      }}
      className="absolute"
      style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: animProps.color,
        textShadow: animProps.shadow,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {animProps.prefix}{Math.abs(value)}
    </motion.div>
  );
};

export default FloatingNumbers;
