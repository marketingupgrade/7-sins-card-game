import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
  life: number;
  maxLife: number;
  angle?: number;
}

interface SinCursorProps {
  sin: 'wrath' | 'sloth' | 'greed' | 'envy';
  isActive: boolean;
}

const SinCursor: React.FC<SinCursorProps> = ({ sin, isActive }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const particleIdRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const createParticle = useCallback((x: number, y: number): Particle => {
    const baseParticle = {
      id: particleIdRef.current++,
      x,
      y,
      opacity: 1,
      life: 0,
    };

    switch (sin) {
      case 'wrath':
        return {
          ...baseParticle,
          vx: (Math.random() - 0.5) * 2,
          vy: Math.random() * 2 + 1,
          size: Math.random() * 6 + 4,
          maxLife: 60,
        };
      case 'sloth':
        return {
          ...baseParticle,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 8 + 6,
          maxLife: 120,
        };
      case 'greed':
        return {
          ...baseParticle,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          size: Math.random() * 4 + 2,
          maxLife: 80,
        };
      case 'envy':
        return {
          ...baseParticle,
          vx: Math.random() * 2 - 1,
          vy: Math.random() * 2 - 1,
          size: Math.random() * 5 + 3,
          maxLife: 100,
          angle: Math.random() * Math.PI * 2,
        };
      default:
        return {
          ...baseParticle,
          vx: 0,
          vy: 0,
          size: 4,
          maxLife: 60,
        };
    }
  }, [sin]);

  const updateParticles = useCallback(() => {
    setParticles(prevParticles => {
      return prevParticles
        .map(particle => {
          const newParticle = { ...particle };
          newParticle.life += 1;
          
          if (sin === 'envy' && newParticle.angle !== undefined) {
            const spiral = newParticle.life * 0.1;
            newParticle.x += Math.cos(newParticle.angle + spiral) * 0.5;
            newParticle.y += Math.sin(newParticle.angle + spiral) * 0.5;
          } else {
            newParticle.x += newParticle.vx;
            newParticle.y += newParticle.vy;
          }
          
          newParticle.opacity = 1 - (newParticle.life / newParticle.maxLife);
          newParticle.size *= 0.98;
          
          return newParticle;
        })
        .filter(particle => particle.life < particle.maxLife);
    });
  }, [sin]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isActive || isTouchDevice) return;
    
    setMousePos({ x: e.clientX, y: e.clientY });
    
    setParticles(prevParticles => {
      const newParticles = [...prevParticles];
      
      for (let i = 0; i < (Math.random() > 0.5 ? 2 : 3); i++) {
        const particle = createParticle(
          e.clientX + (Math.random() - 0.5) * 10,
          e.clientY + (Math.random() - 0.5) * 10
        );
        newParticles.push(particle);
      }
      
      return newParticles.slice(-30);
    });
  }, [isActive, isTouchDevice, createParticle]);

  useEffect(() => {
    if (!isActive || isTouchDevice) return;

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove, isActive, isTouchDevice]);

  useEffect(() => {
    if (!isActive || isTouchDevice) return;

    const animate = () => {
      updateParticles();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updateParticles, isActive, isTouchDevice]);

  const getParticleStyle = (particle: Particle): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      left: particle.x,
      top: particle.y,
      width: particle.size,
      height: particle.size,
      opacity: particle.opacity,
      pointerEvents: 'none',
      zIndex: 9999,
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
    };

    switch (sin) {
      case 'wrath':
        return {
          ...baseStyle,
          background: `radial-gradient(circle, #ff6b35 0%, #ff4500 50%, #8b0000 100%)`,
          boxShadow: `0 0 ${particle.size * 2}px rgba(255, 107, 53, 0.6)`,
        };
      case 'sloth':
        return {
          ...baseStyle,
          background: `radial-gradient(circle, rgba(147, 112, 219, 0.8) 0%, rgba(75, 0, 130, 0.4) 100%)`,
          filter: 'blur(2px)',
        };
      case 'greed':
        return {
          ...baseStyle,
          background: `radial-gradient(circle, #ffd700 0%, #ffb347 50%, #daa520 100%)`,
          boxShadow: `0 0 ${particle.size}px rgba(255, 215, 0, 0.8)`,
          animation: `twinkle 0.5s ease-in-out infinite alternate`,
        };
      case 'envy':
        return {
          ...baseStyle,
          background: `radial-gradient(circle, #20b2aa 0%, #008b8b 50%, #006666 100%)`,
          boxShadow: `0 0 ${particle.size}px rgba(32, 178, 170, 0.5)`,
        };
      default:
        return baseStyle;
    }
  };

  if (isTouchDevice || !isActive) return null;

  return (
    <>
      <style>
        {`
          * { cursor: none !important; }
          @keyframes twinkle {
            0% { transform: translate(-50%, -50%) scale(1); }
            100% { transform: translate(-50%, -50%) scale(1.2); }
          }
        `}
      </style>
      <div style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }}>
        {particles.map(particle => (
          <div
            key={particle.id}
            style={getParticleStyle(particle)}
          />
        ))}
        <div
          style={{
            position: 'fixed',
            left: mousePos.x,
            top: mousePos.y,
            width: 4,
            height: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 10000,
          }}
        />
      </div>
    </>
  );
};

export default SinCursor;
