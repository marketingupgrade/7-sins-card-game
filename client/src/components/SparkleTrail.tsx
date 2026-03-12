/**
 * SparkleTrail — CSS-based sparkle particles that follow card interactions
 *
 * When a card is selected, tiny sparkles emit from the card and trail
 * toward the cursor. Uses pure CSS animations for performance.
 */

import { useEffect, useRef, useState } from "react";
import type { SinType } from "@shared/gameTypes";

interface SparkleTrailProps {
  active: boolean;
  sin: SinType;
}

const SIN_SPARKLE_COLORS: Record<string, string[]> = {
  wrath: ["#ef4444", "#f97316", "#fbbf24"],
  sloth: ["#a855f7", "#c084fc", "#818cf8"],
  greed: ["#eab308", "#fbbf24", "#f59e0b"],
  envy: ["#10b981", "#34d399", "#6ee7b7"],
  pride: ["#ffffff", "#e5e7eb", "#fbbf24"],
  lust: ["#ec4899", "#f472b6", "#f9a8d4"],
  gluttony: ["#b45309", "#d97706", "#f59e0b"],
};

interface Sparkle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

export default function SparkleTrail({ active, sin }: SparkleTrailProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const idRef = useRef(0);
  const colors = SIN_SPARKLE_COLORS[sin] || SIN_SPARKLE_COLORS.wrath;

  useEffect(() => {
    if (!active) {
      setSparkles([]);
      return;
    }

    const handleMove = (e: MouseEvent) => {
      const id = idRef.current++;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 2 + Math.random() * 4;
      const sparkle: Sparkle = {
        id,
        x: e.clientX + (Math.random() - 0.5) * 20,
        y: e.clientY + (Math.random() - 0.5) * 20,
        color,
        size,
      };
      setSparkles(prev => [...prev.slice(-15), sparkle]);
    };

    // Throttle to ~30fps
    let lastTime = 0;
    const throttled = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTime < 33) return;
      lastTime = now;
      handleMove(e);
    };

    window.addEventListener("mousemove", throttled);
    return () => window.removeEventListener("mousemove", throttled);
  }, [active, colors]);

  // Auto-remove sparkles after animation
  useEffect(() => {
    if (sparkles.length === 0) return;
    const timer = setTimeout(() => {
      setSparkles(prev => prev.slice(1));
    }, 600);
    return () => clearTimeout(timer);
  }, [sparkles]);

  if (!active || sparkles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[55]">
      {sparkles.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            backgroundColor: s.color,
            boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
            animation: "sparkle-fade 0.6s ease-out forwards",
          }}
        />
      ))}
      <style>{`
        @keyframes sparkle-fade {
          0% { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0.3) translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
