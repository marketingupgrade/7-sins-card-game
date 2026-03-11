import React from 'react';
import { motion, useAnimation } from 'framer-motion';

interface CardPlayArcProps {
  show: boolean;
  cardName: string;
  sinColor: string;
  startPosition: { x: number; y: number };
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
  const controls = useAnimation();

  React.useEffect(() => {
    if (show) {
      const midX = (startPosition.x + endPosition.x) / 2;
      const midY = Math.min(startPosition.y, endPosition.y) - 60;

      controls.start({
        x: [startPosition.x, midX, endPosition.x],
        y: [startPosition.y, midY, endPosition.y],
        rotate: [0, -8, 0],
        scale: [0.8, 1, 0.6],
        opacity: [0.7, 0.9, 0],
        transition: {
          duration: 0.5,
          ease: "easeInOut",
          times: [0, 0.5, 1]
        }
      }).then(() => {
        onComplete();
      });
    }
  }, [show, startPosition, endPosition, controls, onComplete]);

  if (!show) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{
        x: startPosition.x,
        y: startPosition.y,
      }}
      animate={controls}
    >
      <div
        className="w-12 h-16 rounded-md border flex items-center justify-center text-[9px] font-bold backdrop-blur-sm"
        style={{
          backgroundColor: `${sinColor}20`,
          borderColor: `${sinColor}60`,
          color: sinColor,
          boxShadow: `0 0 8px ${sinColor}30`,
        }}
      >
        {cardName.split(' ')[0]}
      </div>
    </motion.div>
  );
};

export default CardPlayArc;
