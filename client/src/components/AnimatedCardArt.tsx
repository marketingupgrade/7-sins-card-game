/**
 * AnimatedCardArt — Animated effects overlaid on card art for signature cards
 *
 * Each sin's signature card (highest cost) gets a unique animated overlay:
 * - Wrath: Flickering flames rising from bottom
 * - Sloth: Drifting purple mist/fog
 * - Greed: Falling gold coins/sparkles
 * - Envy: Pulsing green veins/tendrils
 * - Pride: Radiating light crown
 * - Lust: Floating rose petals
 * - Gluttony: Bubbling dark ooze
 *
 * Uses pure CSS animations for performance.
 */

import { memo } from "react";
import type { SinType } from "@shared/gameTypes";

interface AnimatedCardArtProps {
  sin: SinType;
  isSignature: boolean; // only animate signature (highest cost) cards
  className?: string;
}

function WrathFlames() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: "inherit" }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute bottom-0"
          style={{
            left: `${10 + i * 10}%`,
            width: 12 + Math.random() * 8,
            height: 30 + Math.random() * 30,
            background: `linear-gradient(to top, rgba(239,68,68,0.6), rgba(249,115,22,0.3), transparent)`,
            borderRadius: "50% 50% 0 0",
            animation: `flame-rise ${1.5 + Math.random()}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 1.5}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes flame-rise {
          0%, 100% { transform: scaleY(0.8) translateY(5px); opacity: 0.4; }
          50% { transform: scaleY(1.3) translateY(-10px); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

function SlothMist() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: "inherit" }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: `${20 + i * 15}%`,
            left: "-20%",
            width: "140%",
            height: 20 + Math.random() * 15,
            background: `radial-gradient(ellipse, rgba(168,85,247,0.25), transparent)`,
            animation: `mist-drift ${6 + i * 2}s linear infinite`,
            animationDelay: `${i * 1.5}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes mist-drift {
          0% { transform: translateX(-30%); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translateX(30%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function GreedSparkles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: "inherit" }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 90}%`,
            top: "-10%",
            width: 3 + Math.random() * 4,
            height: 3 + Math.random() * 4,
            backgroundColor: i % 3 === 0 ? "#fbbf24" : i % 3 === 1 ? "#f59e0b" : "#eab308",
            boxShadow: `0 0 4px ${i % 3 === 0 ? "#fbbf24" : "#f59e0b"}`,
            animation: `coin-fall ${2 + Math.random() * 3}s linear infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes coin-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(120px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function EnvyVeins() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: "inherit" }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 140" preserveAspectRatio="none">
        {[
          "M10,0 Q30,40 20,70 Q10,100 30,140",
          "M50,0 Q60,30 45,60 Q30,90 55,140",
          "M80,0 Q70,35 85,65 Q90,95 70,140",
          "M30,0 Q45,25 35,55 Q25,85 40,140",
        ].map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="rgba(16,185,129,0.3)"
            strokeWidth="0.8"
            style={{
              animation: `vein-pulse ${2 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </svg>
      <style>{`
        @keyframes vein-pulse {
          0%, 100% { stroke-opacity: 0.2; stroke-width: 0.5; }
          50% { stroke-opacity: 0.7; stroke-width: 1.2; }
        }
      `}</style>
    </div>
  );
}

function PrideCrown() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: "inherit" }}>
      <div
        className="absolute top-[10%] left-1/2 -translate-x-1/2"
        style={{
          width: 60,
          height: 60,
          background: "radial-gradient(circle, rgba(251,191,36,0.4), rgba(255,255,255,0.1), transparent)",
          borderRadius: "50%",
          animation: "crown-radiate 3s ease-in-out infinite",
        }}
      />
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-[12%] left-1/2"
          style={{
            width: 1.5,
            height: 25 + Math.random() * 15,
            background: "linear-gradient(to bottom, rgba(251,191,36,0.5), transparent)",
            transformOrigin: "bottom center",
            transform: `translateX(-50%) rotate(${i * 45}deg)`,
            animation: `ray-pulse ${2 + Math.random()}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes crown-radiate {
          0%, 100% { transform: translateX(-50%) scale(0.9); opacity: 0.5; }
          50% { transform: translateX(-50%) scale(1.2); opacity: 0.9; }
        }
        @keyframes ray-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

function LustPetals() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: "inherit" }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: "-10%",
            width: 6 + Math.random() * 4,
            height: 8 + Math.random() * 4,
            backgroundColor: i % 2 === 0 ? "rgba(236,72,153,0.5)" : "rgba(244,114,182,0.4)",
            borderRadius: "50% 0 50% 0",
            animation: `petal-fall ${4 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes petal-fall {
          0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
          10% { opacity: 0.7; }
          50% { transform: translateY(60px) rotate(180deg) translateX(15px); }
          90% { opacity: 0.7; }
          100% { transform: translateY(130px) rotate(360deg) translateX(-10px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function GluttonyOoze() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: "inherit" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${10 + i * 15}%`,
            width: 10 + Math.random() * 8,
            height: 10 + Math.random() * 8,
            backgroundColor: "rgba(180,83,9,0.35)",
            animation: `bubble-rise ${2 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes bubble-rise {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          30% { opacity: 0.6; }
          70% { opacity: 0.6; }
          100% { transform: translateY(-40px) scale(1.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const SIN_ANIMATIONS: Record<string, React.FC> = {
  wrath: WrathFlames,
  sloth: SlothMist,
  greed: GreedSparkles,
  envy: EnvyVeins,
  pride: PrideCrown,
  lust: LustPetals,
  gluttony: GluttonyOoze,
};

function AnimatedCardArt({ sin, isSignature, className = "" }: AnimatedCardArtProps) {
  if (!isSignature) return null;

  const AnimComponent = SIN_ANIMATIONS[sin];
  if (!AnimComponent) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} style={{ borderRadius: "inherit" }}>
      <AnimComponent />
    </div>
  );
}

export default memo(AnimatedCardArt);
