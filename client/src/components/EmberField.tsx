/**
 * EmberField - Cathedral Dust Motes & Candlelight Particles
 *
 * Warm golden dust motes that drift lazily through the cathedral air,
 * catching candlelight. Mixed with occasional rising embers from
 * unseen braziers below. Pure CSS animation — no JS overhead per frame.
 *
 * Two particle types:
 * - Dust motes: tiny, warm gold, slow horizontal drift with gentle rise
 * - Embers: slightly larger, orange-red, faster vertical rise with sway
 */

import { useMemo } from "react";

interface EmberFieldProps {
  count?: number;
  className?: string;
}

export default function EmberField({ count = 20, className = "" }: EmberFieldProps) {
  const particles = useMemo(() => {
    const dustCount = Math.floor(count * 0.7);
    const emberCount = count - dustCount;

    const dust = Array.from({ length: dustCount }).map((_, i) => ({
      id: `dust-${i}`,
      type: "dust" as const,
      left: `${Math.random() * 100}%`,
      size: `${1 + Math.random() * 2}px`,
      duration: `${18 + Math.random() * 25}s`,
      delay: `${Math.random() * 20}s`,
      opacity: 0.15 + Math.random() * 0.35,
      // Warm gold tones
      color: `oklch(${0.7 + Math.random() * 0.15} ${0.08 + Math.random() * 0.06} ${65 + Math.random() * 20})`,
      drift: `${-30 + Math.random() * 60}px`,
    }));

    const embers = Array.from({ length: emberCount }).map((_, i) => ({
      id: `ember-${i}`,
      type: "ember" as const,
      left: `${5 + Math.random() * 90}%`,
      size: `${1.5 + Math.random() * 2.5}px`,
      duration: `${10 + Math.random() * 15}s`,
      delay: `${Math.random() * 12}s`,
      opacity: 0.3 + Math.random() * 0.5,
      // Warm ember orange-red
      color: `oklch(${0.6 + Math.random() * 0.2} ${0.12 + Math.random() * 0.08} ${30 + Math.random() * 30})`,
      drift: `${-15 + Math.random() * 30}px`,
    }));

    return [...dust, ...embers];
  }, [count]);

  return (
    <div className={`ember-field ${className}`}>
      {particles.map((p) => (
        <div
          key={p.id}
          className={p.type === "dust" ? "dust-mote" : "ember"}
          style={{
            left: p.left,
            bottom: p.type === "dust" ? `${Math.random() * 80}%` : "-10px",
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
            opacity: p.opacity,
            backgroundColor: p.color,
            borderRadius: "50%",
            boxShadow: `0 0 ${p.type === "dust" ? "3px" : "5px"} ${p.color}`,
            ["--drift" as any]: p.drift,
          }}
        />
      ))}
    </div>
  );
}
