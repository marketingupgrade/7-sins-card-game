/**
 * YourTurnBanner.tsx
 * Cinematic "YOUR TURN" announcement that sweeps across the screen
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
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show]);

  // Generate particles
  const particles = React.useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      delay: Math.random() * 0.5,
      x: Math.random() * 200 - 100,
      y: Math.random() * 100 - 50,
      scale: 0.3 + Math.random() * 0.7,
    }))
  , [show]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          {/* Gradient Background Sweep */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 2,
              ease: 'easeInOut',
            }}
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, 
                transparent 0%, 
                ${sinColor}15 20%, 
                ${sinColor}25 50%, 
                ${sinColor}15 80%, 
                transparent 100%)`
            }}
          />

          {/* Particle Burst */}
          <div className="absolute">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  x: particle.x,
                  y: particle.y,
                  scale: particle.scale,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  delay: particle.delay,
                  duration: 1.5,
                  ease: 'easeOut',
                }}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: sinColor,
                  boxShadow: `0 0 10px ${sinColor}`,
                }}
              />
            ))}
          </div>

          {/* Main Text */}
          <motion.div
            initial={{ 
              x: -400, 
              scale: 0.8,
              rotateZ: -5,
            }}
            animate={{ 
              x: 0, 
              scale: 1,
              rotateZ: 0,
            }}
            transition={{
              type: 'spring',
              damping: 12,
              stiffness: 100,
              mass: 0.8,
            }}
            className="relative"
          >
            <h1
              className="text-8xl font-black tracking-wider"
              style={{
                color: sinColor,
                textShadow: `
                  0 0 20px ${sinColor},
                  0 0 40px ${sinColor}50,
                  4px 4px 8px rgba(0,0,0,0.8)
                `,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                WebkitTextStroke: `2px ${sinColor}80`,
              }}
            >
              YOUR TURN
            </h1>
            
            {/* Underline effect */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              className="h-1 mt-4 mx-auto"
              style={{
                width: '60%',
                background: `linear-gradient(90deg, transparent, ${sinColor}, transparent)`,
                boxShadow: `0 0 20px ${sinColor}`,
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default YourTurnBanner;
