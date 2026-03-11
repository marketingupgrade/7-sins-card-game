import React from 'react';

interface SinShaderOverlayProps {
  sin: 'wrath' | 'sloth' | 'greed' | 'envy';
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
    };

    switch (sin) {
      case 'wrath':
        return {
          ...baseStyles,
          background: 'linear-gradient(0deg, #ff4500 0%, #ff6b35 25%, #ff8c42 50%, #ff4500 75%, #ff6b35 100%)',
          backgroundSize: '100% 200%',
          animation: isHovered ? 'wrathFire 2s ease-in-out infinite' : 'none',
        };
      case 'sloth':
        return {
          ...baseStyles,
          background: 'radial-gradient(circle, transparent 30%, #6a0dad 70%, #4b0082 100%)',
          animation: isHovered ? 'slothVoid 8s linear infinite' : 'none',
        };
      case 'greed':
        return {
          ...baseStyles,
          background: 'linear-gradient(90deg, transparent 0%, #ffd700 20%, #ffed4e 50%, #ffd700 80%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: isHovered ? 'greedShimmer 3s ease-in-out infinite' : 'none',
        };
      case 'envy':
        return {
          ...baseStyles,
          opacity: isHovered ? 0.12 : 0,
          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7)',
          animation: isHovered ? 'envyShift 4s ease-in-out infinite' : 'none',
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

        @keyframes envyShift {
          0%, 100% {
            filter: hue-rotate(0deg);
          }
          25% {
            filter: hue-rotate(90deg);
          }
          50% {
            filter: hue-rotate(180deg);
          }
          75% {
            filter: hue-rotate(270deg);
          }
        }
      `}</style>
    </div>
  );
};

export default SinShaderOverlay;
