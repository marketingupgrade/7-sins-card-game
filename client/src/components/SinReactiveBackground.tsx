import type { SinType } from "@shared/gameTypes";
import React from 'react';

interface SinReactiveBackgroundProps {
  leadingSin: SinType | null;
  round: number;
  intensity: number;
}

const SinReactiveBackground: React.FC<SinReactiveBackgroundProps> = ({
  leadingSin,
  round,
  intensity
}) => {
  const getSinColor = (sin: string | null, intensityMultiplier: number) => {
    if (!sin) return 'oklch(0.15 0.05 0)';
    
    const colors: Record<string, { l: number; c: number; h: number }> = {
      wrath: { l: 0.35, c: 0.15, h: 25 },
      sloth: { l: 0.30, c: 0.12, h: 300 },
      greed: { l: 0.35, c: 0.15, h: 85 },
      envy: { l: 0.30, c: 0.15, h: 155 },
      pride: { l: 0.40, c: 0.02, h: 0 },
      lust: { l: 0.32, c: 0.15, h: 350 },
      gluttony: { l: 0.30, c: 0.12, h: 60 },
    };
    
    const color = colors[sin as keyof typeof colors];
    return `oklch(${color.l} ${color.c * intensityMultiplier} ${color.h})`;
  };

  const primaryColor = getSinColor(leadingSin, intensity);
  const secondaryColor = getSinColor(leadingSin, intensity * 0.3);
  
  const backgroundStyle = {
    background: leadingSin ? `
      radial-gradient(circle at 20% 50%, ${primaryColor} 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, ${secondaryColor} 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, ${getSinColor(leadingSin, intensity * 0.5)} 0%, transparent 50%),
      oklch(0.08 0.02 0)
    ` : 'oklch(0.08 0.02 0)',
    transition: 'background 2s ease'
  };

  return (
    <div 
      className="absolute inset-0 z-0"
      style={backgroundStyle}
    >
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `repeating-conic-gradient(
            from 0deg at 50% 50%,
            transparent 0deg,
            rgba(255, 255, 255, 0.03) 1deg,
            transparent 2deg,
            rgba(255, 255, 255, 0.03) 3deg
          )`,
          animation: 'grain 8s linear infinite',
          backgroundSize: '100px 100px'
        }}
      />
      <style>{`
        @keyframes grain {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-5px, -10px) rotate(1deg); }
          50% { transform: translate(-10px, 5px) rotate(-1deg); }
          75% { transform: translate(5px, -5px) rotate(0.5deg); }
        }
      `}</style>
    </div>
  );
};

export default SinReactiveBackground;
