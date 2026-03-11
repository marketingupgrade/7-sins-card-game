import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeathSequenceProps {
  show: boolean;
  playerName: string;
  sin: 'wrath' | 'sloth' | 'greed' | 'envy';
  onComplete: () => void;
}

const DeathSequence: React.FC<DeathSequenceProps> = ({ show, playerName, sin, onComplete }) => {
  const sinColors = {
    wrath: '#dc2626',
    sloth: '#7c3aed',
    greed: '#f59e0b',
    envy: '#059669'
  };

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Flash white */}
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.1, times: [0, 0.5, 1] }}
          />
          
          {/* Screen cracks */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            style={{
              background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%), linear-gradient(-45deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%), linear-gradient(90deg, transparent 45%, rgba(255,255,255,0.2) 50%, transparent 55%)',
              clipPath: 'polygon(50% 0%, 100% 25%, 85% 100%, 15% 100%, 0% 25%)'
            }}
          />
          
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.2 }}
            style={{
              background: 'radial-gradient(circle at center, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
              clipPath: 'polygon(0% 50%, 30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%)'
            }}
          />
          
          {/* Player name with sin color that fades to grayscale */}
          <motion.div
            className="relative text-center z-10"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <motion.h1
              className="text-8xl font-black mb-8 tracking-wider"
              style={{ color: sinColors[sin] }}
              initial={{ filter: 'grayscale(0%)' }}
              animate={{ filter: 'grayscale(100%)' }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              {playerName}
            </motion.h1>
            
            <motion.div
              className="text-4xl font-bold tracking-widest"
              style={{ color: sinColors[sin] }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              HAS FALLEN
            </motion.div>
          </motion.div>
          
          {/* Fade to black overlay */}
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0, duration: 0.5 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeathSequence;
