import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CardPlayArcProps {
  show: boolean;
  cardName: string;
  sinColor: string;
  /** CSS selector or data attribute for the source element (player's hand area) */
  startPosition: { x: number; y: number };
  /** CSS selector or data attribute for the target element */
  endPosition: { x: number; y: number };
  onComplete: () => void;
}

const CardPlayArc: React.FC<CardPlayArcProps> = ({
  show,
  cardName,
  sinColor,
  startPosition,
  endPosition,
  onComplete
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; delay: number; offsetX: number; offsetY: number }>>([]);

  useEffect(() => {
    if (show) {
      // Generate trailing particles
      const newParticles = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        delay: i * 0.04,
        offsetX: (Math.random() - 0.5) * 20,
        offsetY: (Math.random() - 0.5) * 20,
      }));
      setParticles(newParticles);

      // Auto-complete after animation
      const timer = setTimeout(() => {
        onComplete();
        setParticles([]);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  // Calculate arc midpoint (higher arc for more dramatic effect)
  const dx = endPosition.x - startPosition.x;
  const dy = endPosition.y - startPosition.y;
  const midX = startPosition.x + dx * 0.5;
  const midY = Math.min(startPosition.y, endPosition.y) - Math.abs(dy) * 0.3 - 80;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {/* Trailing particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                x: startPosition.x + p.offsetX,
                y: startPosition.y + p.offsetY,
                opacity: 0.8,
                scale: 0.3,
              }}
              animate={{
                x: [
                  startPosition.x + p.offsetX,
                  midX + p.offsetX * 2,
                  endPosition.x + p.offsetX,
                ],
                y: [
                  startPosition.y + p.offsetY,
                  midY + p.offsetY * 2,
                  endPosition.y + p.offsetY,
                ],
                opacity: [0.6, 0.8, 0],
                scale: [0.4, 0.2, 0],
              }}
              transition={{
                duration: 0.5,
                delay: p.delay,
                ease: 'easeInOut',
                times: [0, 0.5, 1],
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: `radial-gradient(circle, ${sinColor}, transparent)`,
                boxShadow: `0 0 8px ${sinColor}80`,
              }}
            />
          ))}

          {/* Main card projectile */}
          <motion.div
            initial={{
              x: startPosition.x - 24,
              y: startPosition.y - 32,
              opacity: 0,
              scale: 0.6,
              rotate: 0,
            }}
            animate={{
              x: [startPosition.x - 24, midX - 24, endPosition.x - 24],
              y: [startPosition.y - 32, midY - 32, endPosition.y - 32],
              opacity: [0, 1, 0.8, 0],
              scale: [0.6, 1.1, 0.8, 0.3],
              rotate: [0, -10, 5, 0],
            }}
            transition={{
              duration: 0.55,
              ease: 'easeInOut',
              times: [0, 0.4, 0.8, 1],
            }}
          >
            <div
              className="w-12 h-16 rounded-md border-2 flex items-center justify-center text-[9px] font-bold backdrop-blur-sm relative overflow-hidden"
              style={{
                backgroundColor: `${sinColor}25`,
                borderColor: `${sinColor}80`,
                color: sinColor,
                boxShadow: `0 0 16px ${sinColor}50, 0 0 32px ${sinColor}20`,
              }}
            >
              {/* Inner glow */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: `radial-gradient(circle at center, ${sinColor}40, transparent 70%)`,
                }}
              />
              <span className="relative z-10 text-center leading-tight">
                {cardName.split(' ').slice(0, 2).join('\n')}
              </span>
            </div>
          </motion.div>

          {/* Impact flash at target */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0, 0.8, 0],
              scale: [0, 0, 1.5, 2.5],
            }}
            transition={{
              duration: 0.7,
              times: [0, 0.7, 0.85, 1],
              ease: 'easeOut',
            }}
            className="absolute w-16 h-16 rounded-full"
            style={{
              left: endPosition.x - 32,
              top: endPosition.y - 32,
              background: `radial-gradient(circle, ${sinColor}60, ${sinColor}20, transparent)`,
              boxShadow: `0 0 30px ${sinColor}40`,
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default CardPlayArc;
