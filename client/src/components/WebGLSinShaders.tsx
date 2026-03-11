import type { SinType } from "@shared/gameTypes";
import React from 'react';

interface SinShaderOverlayProps {
  sin: SinType;
  isHovered: boolean;
  children: React.ReactNode;
}

const SinShaderOverlay: React.FC<SinShaderOverlayProps> = ({ sin, isHovered, children }) => {
  const getOverlayStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: isHovered ? 0.15 : 0,
      transition: 'opacity 300ms ease-in-out',
      mixBlendMode: 'overlay' as const,
      pointerEvents: 'none' as const,
      willChange: 'opacity' as const,
    };

    switch (sin) {
      case 'wrath':
        return {
          ...baseStyles,
          background: 'linear-gradient(0deg, #ff4500 0%, #ff6b35 25%, #ff8c42 50%, #ff4500 75%, #ff6b35 100%)',
          backgroundSize: '100% 200%',
          willChange: 'opacity, background-position' as any,
          animation: isHovered ? 'wrathFire 2s ease-in-out infinite' : 'none',
        };
      case 'sloth':
        return {
          ...baseStyles,
          background: 'radial-gradient(circle, transparent 30%, #6a0dad 70%, #4b0082 100%)',
          willChange: 'opacity, transform' as any,
          animation: isHovered ? 'slothVoid 8s linear infinite' : 'none',
        };
      case 'greed':
        return {
          ...baseStyles,
          background: 'linear-gradient(90deg, transparent 0%, #ffd700 20%, #ffed4e 50%, #ffd700 80%, transparent 100%)',
          backgroundSize: '200% 100%',
          willChange: 'opacity, background-position' as any,
          animation: isHovered ? 'greedShimmer 3s ease-in-out infinite' : 'none',
        };
      case 'envy':
        return {
          ...baseStyles,
          opacity: isHovered ? 0.12 : 0,
          background: 'linear-gradient(135deg, oklch(0.35 0.18 155 / 0.7) 0%, oklch(0.2 0.12 155 / 0.4) 50%, oklch(0.35 0.18 155 / 0.7) 100%)',
          backgroundSize: '200% 200%',
          willChange: 'opacity, background-position' as any,
          animation: isHovered ? 'envyPulse 3s ease-in-out infinite' : 'none',
        };
      case 'pride':
        return {
          ...baseStyles,
          background: 'radial-gradient(circle, #ffffff 0%, #e0e0e0 30%, transparent 70%)',
          willChange: 'opacity' as any,
          animation: isHovered ? 'greedShimmer 3s ease-in-out infinite' : 'none',
        };
      case 'lust':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 25%, #ec4899 50%, #db2777 75%, #ec4899 100%)',
          backgroundSize: '200% 200%',
          willChange: 'opacity, background-position' as any,
          animation: isHovered ? 'envyPulse 3s ease-in-out infinite' : 'none',
        };
      case 'gluttony':
        return {
          ...baseStyles,
          background: 'linear-gradient(0deg, #b45309 0%, #d97706 25%, #b45309 50%, #92400e 75%, #b45309 100%)',
          backgroundSize: '100% 200%',
          willChange: 'opacity, background-position' as any,
          animation: isHovered ? 'wrathFire 2s ease-in-out infinite' : 'none',
        };
      default:
        return baseStyles;
    }
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {children}
      <div style={getOverlayStyles()} />
      <style>{`
        @keyframes wrathFire {
          0%, 100% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 0% -100%;
          }
        }

        @keyframes slothVoid {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes greedShimmer {
          0% {
            background-position: -200% 0%;
          }
          100% {
            background-position: 200% 0%;
          }
        }

        @keyframes envyPulse {
          0%, 100% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SinShaderOverlay;
