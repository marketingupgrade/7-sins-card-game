/**
 * RoundTransitionWipe.tsx
 * Cinematic round transition screen with wipe animation
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
      // Auto-complete after total animation duration
      const timer = setTimeout(() => {
        onComplete();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50">
          {/* Wipe Background */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '-100%' }}
            transition={{
              duration: 0.6,
              ease: [0.76, 0, 0.24, 1],
            }}
            className="absolute inset-0 bg-black"
            style={{
              background: 'linear-gradient(90deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
            }}
          />

          {/* Round Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ 
                y: 100, 
                opacity: 0,
                scale: 0.8,
              }}
              animate={{ 
                y: 0, 
                opacity: 1,
                scale: 1,
              }}
              exit={{
                y: -50,
                opacity: 0,
                scale: 1.1,
              }}
              transition={{
                delay: 0.3,
                duration: 0.6,
                type: 'spring',
                damping: 15,
                stiffness: 200,
              }}
              className="text-center"
            >
              <h1
                className="text-9xl font-black tracking-wider mb-4"
                style={{
                  color: 'oklch(0.85 0.18 195)', // neon cyan
                  textShadow: `
                    0 0 20px oklch(0.85 0.18 195),
                    0 0 40px oklch(0.85 0.18 195)80,
                    0 0 60px oklch(0.85 0.18 195)40,
                    4px 4px 8px rgba(0,0,0,0.8)
                  `,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  WebkitTextStroke: '2px oklch(0.85 0.18 195)60',
                }}
              >
                ROUND {round}
              </h1>

              {/* Decorative elements */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
                transition={{
                  delay: 0.6,
                  duration: 0.8,
                  ease: 'easeOut',
                }}
                className="h-1 mx-auto mb-8"
                style={{
                  width: '200px',
                  background: 'linear-gradient(90deg, transparent, oklch(0.85 0.18 195), transparent)',
                  boxShadow: '0 0 20px oklch(0.85 0.18 195)',
                }}
              />

              {/* Side brackets */}
              <div className="flex items-center justify-center gap-8">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -30, opacity: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="text-4xl font-bold"
                  style={{ 
                    color: 'oklch(0.85 0.18 195)',
                    textShadow: '0 0 15px oklch(0.85 0.18 195)',
                  }}
                >
                  ‹‹
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ 
                    delay: 1,
                    type: 'spring',
                    damping: 10,
                    stiffness: 200 
                  }}
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: 'oklch(0.85 0.18 195)',
                    boxShadow: '0 0 20px oklch(0.85 0.18 195)',
                  }}
                />

                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 30, opacity: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="text-4xl font-bold"
                  style={{ 
                    color: 'oklch(0.85 0.18 195)',
                    textShadow: '0 0 15px oklch(0.85 0.18 195)',
                  }}
                >
                  ››
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Edge glow effects */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                linear-gradient(90deg, oklch(0.85 0.18 195)10 0%, transparent 10%),
                linear-gradient(270deg, oklch(0.85 0.18 195)10 0%, transparent 10%)
              `,
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default RoundTransitionWipe;
