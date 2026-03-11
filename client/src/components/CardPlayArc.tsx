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
      const midY = Math.min(startPosition.y, endPosition.y) - 100;

      controls.start({
        x: [startPosition.x, midX, endPosition.x],
        y: [startPosition.y, midY, endPosition.y],
        rotate: [0, -15, 0],
        scale: [1, 1.2, 1],
        transition: {
          duration: 0.6,
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
    <>
      <motion.div
        className="fixed pointer-events-none z-50"
        style={{
          x: startPosition.x,
          y: startPosition.y,
        }}
        animate={controls}
      >
        <div 
          className="relative w-16 h-24 rounded border-2 flex items-center justify-center text-xs font-bold text-white"
          style={{ 
            backgroundColor: sinColor,
            boxShadow: `0 0 20px ${sinColor}`,
            borderColor: sinColor
          }}
        >
          {cardName}
        </div>
      </motion.div>

      <motion.div
        className="fixed pointer-events-none z-40"
        style={{
          x: startPosition.x,
          y: startPosition.y,
        }}
        animate={controls}
        transition={{ delay: 0.1 }}
      >
        <motion.div 
          className="w-16 h-24 rounded opacity-60"
          style={{ backgroundColor: sinColor }}
          animate={{ opacity: [0.6, 0] }}
          transition={{ duration: 0.4 }}
        />
      </motion.div>

      <motion.div
        className="fixed pointer-events-none z-30"
        style={{
          x: startPosition.x,
          y: startPosition.y,
        }}
        animate={controls}
        transition={{ delay: 0.2 }}
      >
        <motion.div 
          className="w-16 h-24 rounded opacity-30"
          style={{ backgroundColor: sinColor }}
          animate={{ opacity: [0.3, 0] }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      <motion.div
        className="fixed pointer-events-none z-60 w-20 h-28 rounded"
        style={{
          x: endPosition.x - 10,
          y: endPosition.y - 2,
          backgroundColor: sinColor,
        }}
        initial={{ opacity: 0, scale: 1 }}
        animate={{ 
          opacity: [0, 0, 0.8, 0],
          scale: [1, 1, 1.5, 2]
        }}
        transition={{ 
          duration: 0.6,
          times: [0, 0.7, 0.8, 1],
          delay: 0.4
        }}
      />
    </>
  );
};

export default CardPlayArc;
