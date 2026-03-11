import type { SinType } from "@shared/gameTypes";
/**
 * SinCursor.tsx
 * Very subtle mouse trail with tiny sin-colored particles.
 * Does NOT override the system cursor. Minimal visual noise.
 * Disabled on touch devices.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  opacity: number;
  size: number;
  life: number;
}

interface SinCursorProps {
  sin: SinType;
  isActive: boolean;
}

const sinParticleColors: Record<string, string> = {
  wrath: 'oklch(0.65 0.25 25)',
  sloth: 'oklch(0.52 0.18 290)',
  greed: 'oklch(0.75 0.18 85)',
  envy: 'oklch(0.6 0.2 155)',
  pride: 'oklch(0.92 0.02 0)',
  lust: 'oklch(0.65 0.22 350)',
  gluttony: 'oklch(0.55 0.15 60)',
};

const SinCursor: React.FC<SinCursorProps> = ({ sin, isActive }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const idRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const lastEmit = useRef(0);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isActive || isTouchDevice) return;
    const now = Date.now();
    // Emit at most every 80ms to keep it sparse
    if (now - lastEmit.current < 80) return;
    lastEmit.current = now;

    setParticles(prev => [
      ...prev.slice(-10),
      {
        id: idRef.current++,
        x: e.clientX + (Math.random() - 0.5) * 6,
        y: e.clientY + (Math.random() - 0.5) * 6,
        opacity: 0.5,
        size: 2 + Math.random() * 2,
        life: 0,
      },
    ]);
  }, [isActive, isTouchDevice]);

  useEffect(() => {
    if (!isActive || isTouchDevice) return;
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove, isActive, isTouchDevice]);

  useEffect(() => {
    if (!isActive || isTouchDevice) return;
    const tick = () => {
      setParticles(prev =>
        prev
          .map(p => ({ ...p, life: p.life + 1, opacity: Math.max(0, 0.5 - p.life * 0.025) }))
          .filter(p => p.life < 20)
      );
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [isActive, isTouchDevice]);

  if (isTouchDevice || !isActive) return null;

  const color = sinParticleColors[sin] || '#fff';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            backgroundColor: color,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  );
};

export default SinCursor;
