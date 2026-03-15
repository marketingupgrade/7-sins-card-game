/**
 * ScreenShake.tsx
 * Wrapper component that shakes its children on trigger.
 * Subtle and brief - never blocks gameplay.
 */

import React, { useEffect, useRef } from 'react';

interface ScreenShakeProps {
  trigger: number;
  intensity: 'light' | 'heavy';
  children: React.ReactNode;
}

const ScreenShake: React.FC<ScreenShakeProps> = ({ trigger, intensity, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const prevTrigger = useRef(0);

  const shakeConfig = {
    light: { offset: 2, duration: 200 },
    heavy: { offset: 4, duration: 350 },
  };

  useEffect(() => {
    // Only shake on new triggers, not on mount
    if (trigger <= 0 || trigger === prevTrigger.current) return;
    prevTrigger.current = trigger;

    const container = containerRef.current;
    if (!container) return;

    // Cancel any existing animation first
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Brief mobile vibration
    if ('vibrate' in navigator) {
      navigator.vibrate(intensity === 'heavy' ? 80 : 30);
    }

    const config = shakeConfig[intensity];
    const startTime = performance.now();

    const shake = (now: number) => {
      const elapsed = now - startTime;
      const progress = elapsed / config.duration;

      if (progress >= 1) {
        container.style.transform = '';
        animationRef.current = null;
        return;
      }

      // Cosine easing: starts strong, fades to zero
      const ease = Math.cos(progress * Math.PI * 0.5);
      const x = (Math.random() - 0.5) * config.offset * 2 * ease;
      const y = (Math.random() - 0.5) * config.offset * 2 * ease;

      container.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      animationRef.current = requestAnimationFrame(shake);
    };

    animationRef.current = requestAnimationFrame(shake);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (container) {
        container.style.transform = '';
      }
    };
  }, [trigger, intensity]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
};

export default React.memo(ScreenShake);
