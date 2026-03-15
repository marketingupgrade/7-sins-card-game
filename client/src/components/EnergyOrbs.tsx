/**
 * EnergyOrbs.tsx
 * Animated energy orb pips that replace a plain number
 */

import React from 'react';
import { motion } from 'framer-motion';

interface EnergyOrbsProps {
  current: number;
  max: number;
  sinColor: string;
  bonusEnergy?: number;
}

const EnergyOrbs: React.FC<EnergyOrbsProps> = ({ 
  current, 
  max, 
  sinColor, 
  bonusEnergy = 0 
}) => {
  const totalOrbs = Math.max(max, current + bonusEnergy);

  return (
    <div className="flex items-center gap-0.5">
      {/* Regular energy orbs */}
      {Array.from({ length: max }, (_, index) => (
        <EnergyOrb
          key={`regular-${index}`}
          index={index}
          isFilled={index < current}
          sinColor={sinColor}
          type="regular"
        />
      ))}
      
      {/* Bonus energy orbs */}
      {bonusEnergy > 0 && (
        <>
          <span 
            className="mx-1 text-xs font-bold"
            style={{ color: sinColor }}
          >
            +
          </span>
          {Array.from({ length: bonusEnergy }, (_, index) => (
            <EnergyOrb
              key={`bonus-${index}`}
              index={index}
              isFilled={true}
              sinColor={sinColor}
              type="bonus"
            />
          ))}
        </>
      )}
    </div>
  );
};

interface EnergyOrbProps {
  index: number;
  isFilled: boolean;
  sinColor: string;
  type: 'regular' | 'bonus';
}

const EnergyOrb: React.FC<EnergyOrbProps> = ({ 
  index, 
  isFilled, 
  sinColor, 
  type 
}) => {
  const size = type === 'bonus' ? 12 : 14;
  const glowIntensity = type === 'bonus' ? 1.3 : 1;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0.5 }}
      animate={{
        scale: isFilled ? 1 : 0.8,
        opacity: isFilled ? 1 : 0.3,
      }}
      transition={{
        delay: index * 0.05,
        duration: 0.3,
        ease: 'easeOut',
      }}
      className="relative"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {/* Orb background */}
      <div
        className="absolute inset-0 rounded-full border"
        style={{
          backgroundColor: isFilled 
            ? `${sinColor}20` 
            : 'rgba(100, 100, 100, 0.1)',
          borderColor: isFilled 
            ? sinColor 
            : 'rgba(100, 100, 100, 0.3)',
          borderWidth: '1px',
        }}
      />
      
      {/* Glow effect when filled */}
      {isFilled && (
        <>
          <motion.div
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full"
            style={{
              backgroundColor: sinColor,
              filter: 'blur(1px)',
              opacity: 0.6 * glowIntensity,
            }}
          />
          
          {/* Core */}
          <div
            className="absolute inset-1 rounded-full"
            style={{
              backgroundColor: sinColor,
              boxShadow: `
                0 0 4px ${sinColor},
                inset 0 1px 1px rgba(255,255,255,0.3)
              `,
            }}
          />
          
          {/* Highlight */}
          <div
            className="absolute rounded-full"
            style={{
              top: '2px',
              left: '3px',
              width: '3px',
              height: '3px',
              backgroundColor: 'rgba(255,255,255,0.8)',
              filter: 'blur(0.5px)',
            }}
          />
        </>
      )}

      {/* Pulse effect on energy change */}
      <motion.div
        key={`${index}-${isFilled}`}
        initial={isFilled ? { scale: 1.5, opacity: 0 } : { scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="absolute inset-0 rounded-full border-2"
        style={{
          borderColor: isFilled ? sinColor : 'rgba(100, 100, 100, 0.5)',
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
};

export default React.memo(EnergyOrbs);
