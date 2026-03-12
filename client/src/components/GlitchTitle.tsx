/**
 * GlitchTitle — Cyberpunk-meets-cathedral glitch effect on the homepage title.
 * Individual letters randomly flash into faction colors with chromatic aberration,
 * position jitter, and opacity flicker. Pure CSS + lightweight React state.
 */

import { useEffect, useState, useRef, memo } from "react";

const FACTION_COLORS = [
  "#e63946", // Wrath — crimson
  "#457b9d", // Sloth — muted steel blue
  "#f4a261", // Greed — gold
  "#2a9d8f", // Envy — teal green
  "#e9c46a", // Pride — regal gold
  "#e07a9a", // Lust — rose pink
  "#8338ec", // Gluttony — deep violet
];

const TITLE_PARTS = [
  { text: "7", baseClass: "text-white/90" },
  { text: " ", baseClass: "" },
  { text: "D", baseClass: "text-white/60" },
  { text: "E", baseClass: "text-white/60" },
  { text: "A", baseClass: "text-white/60" },
  { text: "D", baseClass: "text-white/60" },
  { text: "L", baseClass: "text-white/60" },
  { text: "Y", baseClass: "text-white/60" },
  { text: " ", baseClass: "" },
  { text: "S", baseClass: "text-white/90" },
  { text: "I", baseClass: "text-white/90" },
  { text: "N", baseClass: "text-white/90" },
  { text: "S", baseClass: "text-white/90" },
];

interface GlitchState {
  index: number;
  color: string;
  offsetX: number;
  offsetY: number;
  skewX: number;
  clipTop: number;
  clipBottom: number;
}

function GlitchTitle() {
  const [glitches, setGlitches] = useState<GlitchState[]>([]);
  const [burstActive, setBurstActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const burstTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Subtle continuous glitch — 1-2 letters at a time
    intervalRef.current = setInterval(() => {
      const numGlitches = Math.random() < 0.3 ? 2 : 1;
      const newGlitches: GlitchState[] = [];

      for (let g = 0; g < numGlitches; g++) {
        const idx = Math.floor(Math.random() * TITLE_PARTS.length);
        if (TITLE_PARTS[idx].text === " ") continue;

        newGlitches.push({
          index: idx,
          color: FACTION_COLORS[Math.floor(Math.random() * FACTION_COLORS.length)],
          offsetX: (Math.random() - 0.5) * 6,
          offsetY: (Math.random() - 0.5) * 3,
          skewX: (Math.random() - 0.5) * 8,
          clipTop: Math.random() * 40,
          clipBottom: 60 + Math.random() * 40,
        });
      }

      setGlitches(newGlitches);

      // Clear glitch after brief flash
      setTimeout(() => setGlitches([]), 80 + Math.random() * 60);
    }, 1500 + Math.random() * 2000);

    // Periodic burst — all letters glitch simultaneously
    const scheduleBurst = () => {
      burstTimeoutRef.current = setTimeout(() => {
        setBurstActive(true);
        const burstGlitches: GlitchState[] = TITLE_PARTS.map((part, i) => ({
          index: i,
          color: part.text === " " ? "transparent" : FACTION_COLORS[Math.floor(Math.random() * FACTION_COLORS.length)],
          offsetX: (Math.random() - 0.5) * 10,
          offsetY: (Math.random() - 0.5) * 6,
          skewX: (Math.random() - 0.5) * 15,
          clipTop: Math.random() * 30,
          clipBottom: 70 + Math.random() * 30,
        }));
        setGlitches(burstGlitches);

        // Rapid re-randomize during burst
        let burstTicks = 0;
        const burstInterval = setInterval(() => {
          burstTicks++;
          if (burstTicks > 4) {
            clearInterval(burstInterval);
            setGlitches([]);
            setBurstActive(false);
            scheduleBurst();
            return;
          }
          setGlitches(
            TITLE_PARTS.map((part, i) => ({
              index: i,
              color: part.text === " " ? "transparent" : FACTION_COLORS[Math.floor(Math.random() * FACTION_COLORS.length)],
              offsetX: (Math.random() - 0.5) * 8,
              offsetY: (Math.random() - 0.5) * 4,
              skewX: (Math.random() - 0.5) * 12,
              clipTop: Math.random() * 30,
              clipBottom: 70 + Math.random() * 30,
            }))
          );
        }, 60);
      }, 5000 + Math.random() * 8000);
    };

    scheduleBurst();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (burstTimeoutRef.current) clearTimeout(burstTimeoutRef.current);
    };
  }, []);

  const getGlitch = (index: number) => glitches.find((g) => g.index === index);

  return (
    <h1
      className="text-4xl md:text-6xl lg:text-7xl font-black tracking-wider relative select-none"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      {TITLE_PARTS.map((part, i) => {
        const glitch = getGlitch(i);
        const isGlitching = !!glitch;

        return (
          <span
            key={i}
            className={`relative inline-block ${part.baseClass}`}
            style={{
              transition: isGlitching ? "none" : "all 0.3s ease",
              ...(isGlitching
                ? {
                    color: glitch.color,
                    transform: `translate(${glitch.offsetX}px, ${glitch.offsetY}px) skewX(${glitch.skewX}deg)`,
                    textShadow: `
                      ${-glitch.offsetX * 0.5}px 0 ${glitch.color}44,
                      ${glitch.offsetX * 0.8}px 0 ${FACTION_COLORS[(FACTION_COLORS.indexOf(glitch.color) + 3) % FACTION_COLORS.length]}44
                    `,
                    opacity: burstActive ? 0.7 + Math.random() * 0.3 : 1,
                  }
                : {}),
            }}
          >
            {part.text}
            {/* Chromatic aberration ghost layers */}
            {isGlitching && part.text !== " " && (
              <>
                <span
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    color: FACTION_COLORS[(FACTION_COLORS.indexOf(glitch.color) + 2) % FACTION_COLORS.length],
                    opacity: 0.4,
                    transform: `translateX(${glitch.offsetX * 0.6}px)`,
                    clipPath: `inset(${glitch.clipTop}% 0 ${100 - glitch.clipBottom}% 0)`,
                  }}
                >
                  {part.text}
                </span>
                <span
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    color: FACTION_COLORS[(FACTION_COLORS.indexOf(glitch.color) + 4) % FACTION_COLORS.length],
                    opacity: 0.3,
                    transform: `translateX(${-glitch.offsetX * 0.4}px) translateY(${glitch.offsetY * 0.3}px)`,
                    clipPath: `inset(${glitch.clipBottom - 20}% 0 ${100 - glitch.clipTop - 20}% 0)`,
                  }}
                >
                  {part.text}
                </span>
              </>
            )}
          </span>
        );
      })}
    </h1>
  );
}

export default memo(GlitchTitle);
