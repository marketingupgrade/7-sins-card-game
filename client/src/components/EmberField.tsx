/**
 * EmberField - Floating particle effect component
 * 
 * Creates a field of rising ember particles with randomized
 * positions, sizes, colors, and animation durations.
 * Pure CSS animation — no JS overhead per frame.
 */

import { useMemo } from "react";

interface EmberFieldProps {
  count?: number;
  className?: string;
}

export default function EmberField({ count = 20, className = "" }: EmberFieldProps) {
  const embers = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${2 + Math.random() * 96}%`,
      width: `${1.5 + Math.random() * 2}px`,
      height: `${1.5 + Math.random() * 2}px`,
      duration: `${12 + Math.random() * 18}s`,
      delay: `${Math.random() * 15}s`,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }, [count]);

  return (
    <div className={`ember-field ${className}`}>
      {embers.map((e) => (
        <div
          key={e.id}
          className="ember"
          style={{
            left: e.left,
            bottom: "-10px",
            width: e.width,
            height: e.height,
            animationDuration: e.duration,
            animationDelay: e.delay,
            opacity: e.opacity,
          }}
        />
      ))}
    </div>
  );
}
