/**
 * ScreenShake.tsx
 * Wrapper component that shakes its children on trigger
 */

import React, { useEffect, useRef, useState } from 'react';

interface ScreenShakeProps {
  trigger: number;
  intensity: 'light' | 'heavy';
  children: React.ReactNode;
}

const ScreenShake: React.FC<ScreenShakeProps> = ({ trigger, intensity, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const shakeConfig = {
    light: { offset: 3, duration: 300, vibration: 50 },
    heavy: { offset: 8, duration: 500, vibration: 100 },
  };

  const config = shakeConfig[intensity];

  useEffect(() => {
    if (trigger <= 0) return;

    const container = containerRef.current;
    if (!container) return;

    // Trigger vibration on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(config.vibration);
    }

    setIsShaking(true);

    const startTime = Date.now();
    const { offset, duration } = config;

    const shake = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        // Animation complete - return to original position
        container.style.transform = 'translate3d(0, 0, 0)';
        setIsShaking(false);
        return;
      }

      // Easing function for shake intensity (starts strong, fades out)
      const intensity = Math.cos(progress * Math.PI * 0.5);
      
      // Random shake direction with decreasing intensity
      const x = (Math.random() - 0.5) * offset * 2 * intensity;
      const y = (Math.random() - 0.5) * offset * 2 * intensity;

      container.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      animationRef.current = requestAnimationFrame(shake);
    };

    animationRef.current = requestAnimationFrame(shake);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (container) {
        container.style.transform = 'translate3d(0, 0, 0)';
      }
      setIsShaking(false);
    };
  }, [trigger, config]);

  return (
    <div
      ref={containerRef}
      style={{
        willChange: isShaking ? 'transform' : 'auto',
        backfaceVisibility: 'hidden', // Optimize for animations
        perspective: 1000,
      }}
    >
      {children}
    </div>
  );
};

export default ScreenShake;
