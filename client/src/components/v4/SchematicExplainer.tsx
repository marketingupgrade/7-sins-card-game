/**
 * SchematicExplainer — how a round actually plays.
 *
 * Ported from the v4 landing kit ("kelvin-value-features-14"): a 160vh
 * runway with a sticky two-column stage — a framed technical line drawing
 * on the left whose FIG groups crossfade in sync with stepped copy on the
 * right, driven by plain scroll progress (no GSAP needed; a passive
 * scroll listener is cheaper and can't fight ScrollTrigger's pins).
 *
 * The frame, corner mono labels, witness lines, dimension marks and
 * accent treatment are the kit's. The four figures are redrawn from
 * scratch as the four stages of a 7 Deadly Sins round.
 *
 * Every claim in the step copy is checked against the engine:
 *   · simultaneous hidden lock-in, 4 players  — gameEngine.ts lockInCards
 *   · 10s countdown after first lock-in       — gameTypes.ts SELECTION_TIMER_SECONDS
 *   · resolution order: skip-queue → lowest   — gameEngine.ts resolveLockedPlays
 *     HP → cheapest card within a player         (mirrors /rules)
 *   · compound ticks 2–5 rounds, three         — gameTypes.ts COMPOUND_TICKS
 *     patterns (Fibonacci / aggressive / slowburn)
 *   · 20 rounds, then HP settles it            — gameTypes.ts MAX_ROUNDS
 */

import { useEffect, useRef, useState } from "react";

const ACCENT = "#d4a854"; // Brand Book — Candlelight
const INK = "#e8e0d0"; // Brand Book — Parchment

const MONO = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
} as const;

const steps = [
  {
    label: "01 · Lock-in",
    heading: "Everyone commits at once.",
    copy: "Up to four players choose cards from their hand — hidden, simultaneous. A ten-second countdown starts the moment anyone locks in, so nobody waits on the slowest sinner.",
  },
  {
    label: "02 · Reveal",
    heading: "Every hand opens together.",
    copy: "The arena reads them in priority order: skip-queue cards first, then lowest HP, then the cheapest card within each player. No hidden information. No turn-order baiting.",
  },
  {
    label: "03 · Compound",
    heading: "Effects tick for rounds.",
    copy: "A card played in round one isn't finished in round one. Damage, shields, heal-steal and drain all tick across two to five rounds — Fibonacci, aggressive, or slow-burn.",
  },
  {
    label: "04 · Reckoning",
    heading: "Last sinner standing.",
    copy: "The game ends when one player is left. Or, if everyone clings on, round twenty settles it on remaining HP. Patience is a weapon. So is impatience.",
  },
];

export default function SchematicExplainer() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const handleScroll = () => {
      const el = outerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const totalScroll = el.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScroll));
      setActiveStep(Math.min(steps.length - 1, Math.floor(progress * steps.length)));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fig = (i: number): React.CSSProperties => ({
    opacity: activeStep === i ? 1 : 0,
    transition: "opacity 0.6s ease",
  });

  const corner = { ...MONO, letterSpacing: "0.6px", fill: `${INK}6b`, fontSize: "7.5px", fontWeight: 500 };
  const dim = { ...MONO, letterSpacing: "0.8px", fill: ACCENT, fontSize: "11px", fontWeight: 500 };
  const ghost = { ...MONO, letterSpacing: "0.8px", fill: `${INK}80`, fontSize: "10px", fontWeight: 500 };
  const stroke = { fill: "none", stroke: `${INK}eb`, strokeWidth: "1.5px" };
  const hair = { fill: "none", stroke: `${INK}80`, strokeWidth: "1px" };
  const accentStroke = { fill: "none", stroke: ACCENT, strokeWidth: "1.25px" };

  /** Four face-down / face-up card rects, shared geometry between FIG 01/02. */
  const CARDS = [
    { x: 52, y: 92 },
    { x: 104, y: 84 },
    { x: 156, y: 84 },
    { x: 208, y: 92 },
  ];

  return (
    <section
      className="relative"
      style={{ backgroundColor: "#0a0908", color: INK, fontSize: "17px", lineHeight: 1.5 }}
    >
      <div ref={outerRef} className="relative h-[160vh] max-[767px]:h-[150vh]">
        <div className="sticky top-0 overflow-hidden grid gap-16 max-[991px]:gap-8 max-[991px]:content-center items-center max-w-[1440px] mx-auto px-8 max-[991px]:px-6 max-[767px]:px-5 h-screen [grid-template-columns:0.9fr_1.1fr] max-[991px]:[grid-template-columns:1fr]">
          {/* Eyebrow — pinned to the stage top, holds through the whole scrub. */}
          <div className="absolute top-24 max-[767px]:top-20 left-8 max-[991px]:left-6 max-[767px]:left-5 inline-flex flex-row items-center gap-2">
            <div style={{ width: "8px", height: "8px", borderRadius: "2px", backgroundColor: ACCENT }} />
            <div
              className="uppercase"
              style={{ ...MONO, fontSize: "12px", fontWeight: 500, letterSpacing: "0.75px", lineHeight: 1.2, color: `${INK}99` }}
            >
              How a round plays
            </div>
          </div>

          {/* Left — SVG schematic stage */}
          <div className="flex justify-center items-center h-[72vh] max-[991px]:h-[42vh] max-[767px]:h-[34vh] relative">
            <svg aria-hidden="true" fill="none" viewBox="0 0 300 340" className="w-auto h-full overflow-visible">
              {/* Frame + corner labels */}
              <path d="M10 10 L290 10 L290 330 L10 330 Z" style={{ fill: "none", stroke: `${INK}2e`, strokeWidth: "1.25px" }} />
              <text y="318" x="20" style={corner}>RITE Nº 001</text>
              <text textAnchor="end" y="318" x="280" style={corner}>SEVEN · DEADLY · SINS</text>

              {/* FIG. 01 — LOCK-IN: four sealed hands */}
              <g style={fig(0)}>
                {CARDS.map((c, i) => (
                  <g key={i}>
                    <rect x={c.x} y={c.y} width="40" height="58" rx="3" style={stroke} />
                    {/* face-down lattice */}
                    <path
                      d={`M${c.x + 8} ${c.y + 14} L${c.x + 32} ${c.y + 38} M${c.x + 32} ${c.y + 14} L${c.x + 8} ${c.y + 38}`}
                      style={hair}
                    />
                    <rect x={c.x + 17} y={c.y + 22} width="6" height="6" style={{ fill: `${INK}80` }} />
                  </g>
                ))}
                {/* countdown ring */}
                <circle cx="150" cy="212" r="18" style={hair} />
                <path d="M150 194 A18 18 0 0 1 165 221" style={accentStroke} />
                <text textAnchor="middle" y="216" x="150" style={dim}>10s</text>
                {/* dimension line */}
                <path d="M52 262 L248 262" style={accentStroke} />
                <rect x="49" y="259" width="6" height="6" style={{ fill: ACCENT }} />
                <rect x="245" y="259" width="6" height="6" style={{ fill: ACCENT }} />
                <text textAnchor="middle" y="256" x="150" style={dim}>4 SEALED · HIDDEN</text>
                <text y="27" x="20" style={corner}>FIG. 01 · SIMULTANEOUS LOCK-IN</text>
              </g>

              {/* FIG. 02 — REVEAL: hands open, resolution order */}
              <g style={fig(1)}>
                {CARDS.map((c, i) => (
                  <g key={i}>
                    <rect x={c.x} y={c.y} width="40" height="58" rx="3" style={stroke} />
                    <path d={`M${c.x + 8} ${c.y + 40} L${c.x + 32} ${c.y + 40}`} style={hair} />
                    <path d={`M${c.x + 8} ${c.y + 47} L${c.x + 26} ${c.y + 47}`} style={hair} />
                    {/* priority index */}
                    <circle cx={c.x + 20} cy={c.y + 22} r="9" style={accentStroke} />
                    <text textAnchor="middle" y={c.y + 26} x={c.x + 20} style={dim}>{i + 1}</text>
                  </g>
                ))}
                {/* resolution sweep */}
                <path d="M52 208 L236 208 M228 202 L238 208 L228 214" style={accentStroke} />
                <rect x="49" y="205" width="6" height="6" style={{ fill: ACCENT }} />
                <text textAnchor="middle" y="232" x="150" style={dim}>PRIORITY ORDER</text>
                <text textAnchor="middle" y="252" x="150" style={ghost}>SKIP-QUEUE → LOWEST HP → COST</text>
                <text y="27" x="20" style={corner}>FIG. 02 · SIMULTANEOUS REVEAL</text>
              </g>

              {/* FIG. 03 — COMPOUND: the Fibonacci tick 1·1·2·3·5 */}
              <g style={fig(2)}>
                <path d="M56 272 L252 272" style={stroke} />
                {[
                  { x: 66, h: 30, n: "1" },
                  { x: 104, h: 30, n: "1" },
                  { x: 142, h: 60, n: "2" },
                  { x: 180, h: 90, n: "3" },
                  { x: 218, h: 150, n: "5" },
                ].map((b, i) => (
                  <g key={i}>
                    <rect x={b.x} y={272 - b.h} width="26" height={b.h} style={stroke} />
                    <text textAnchor="middle" y={266 - b.h} x={b.x + 13} style={dim}>{b.n}</text>
                    <text textAnchor="middle" y="288" x={b.x + 13} style={ghost}>R{i + 1}</text>
                  </g>
                ))}
                {/* escalation curve through the bar tops */}
                <path d="M79 242 Q120 240 155 212 Q190 186 231 122" style={{ ...accentStroke, strokeDasharray: "5 4" }} />
                <path d="M258 122 L258 272" style={accentStroke} />
                <rect x="255" y="119" width="6" height="6" style={{ fill: ACCENT }} />
                <rect x="255" y="269" width="6" height="6" style={{ fill: ACCENT }} />
                <text textAnchor="middle" y="108" x="150" style={dim}>ONE CARD · Σ 12 DAMAGE</text>
                <text y="27" x="20" style={corner}>FIG. 03 · COMPOUND TICK</text>
              </g>

              {/* FIG. 04 — RECKONING: three fall, one stands */}
              <g style={fig(3)}>
                {[
                  { y: 96, fill: 18, dead: true },
                  { y: 136, fill: 0, dead: true },
                  { y: 176, fill: 34, dead: true },
                  { y: 216, fill: 168, dead: false },
                ].map((bar, i) => (
                  <g key={i}>
                    <rect x="60" y={bar.y} width="180" height="22" rx="2" style={stroke} />
                    {bar.fill > 0 && (
                      <rect
                        x="60"
                        y={bar.y}
                        width={bar.fill}
                        height="22"
                        rx="2"
                        style={{ fill: bar.dead ? `${INK}33` : ACCENT }}
                      />
                    )}
                    {bar.dead && (
                      <path
                        d={`M${64 + 176} ${bar.y + 6} L${64 + 164} ${bar.y + 17} M${64 + 164} ${bar.y + 6} L${64 + 176} ${bar.y + 17}`}
                        style={{ fill: "none", stroke: `${INK}66`, strokeWidth: "1.25px" }}
                      />
                    )}
                  </g>
                ))}
                <path d="M60 256 L240 256" style={accentStroke} />
                <rect x="57" y="253" width="6" height="6" style={{ fill: ACCENT }} />
                <rect x="237" y="253" width="6" height="6" style={{ fill: ACCENT }} />
                <text textAnchor="middle" y="250" x="150" style={dim}>LAST SINNER STANDING</text>
                <text textAnchor="middle" y="278" x="150" style={ghost}>OR ROUND 20 · MOST HP WINS</text>
                <text y="27" x="20" style={corner}>FIG. 04 · THE RECKONING</text>
              </g>
            </svg>
          </div>

          {/* Right — crossfading steps */}
          <div className="relative grid">
            {steps.map((step, i) => (
              <div
                key={i}
                className="flex flex-col gap-4"
                style={{
                  gridArea: "1 / 1",
                  opacity: activeStep === i ? 1 : 0,
                  transition: "opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
                  pointerEvents: activeStep === i ? "auto" : "none",
                }}
              >
                <div
                  className="uppercase"
                  style={{ ...MONO, fontSize: "12px", fontWeight: 500, letterSpacing: "0.75px", lineHeight: 1.2, color: `${INK}99` }}
                >
                  {step.label}
                </div>
                <h2
                  className="m-0 max-[991px]:text-[44px] max-[767px]:text-[36px] max-[479px]:text-[30px]"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "58px",
                    fontWeight: 500,
                    letterSpacing: "-1.5px",
                    lineHeight: 1.05,
                    maxWidth: "12em",
                    color: INK,
                  }}
                >
                  {step.heading}
                </h2>
                <p
                  className="m-0"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "20px",
                    fontWeight: 400,
                    lineHeight: 1.5,
                    color: `${INK}99`,
                    maxWidth: "24em",
                  }}
                >
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
