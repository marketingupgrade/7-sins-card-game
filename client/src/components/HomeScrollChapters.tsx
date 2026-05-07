/**
 * HomeScrollChapters — "scrollyselling" funnel beneath the Home hero.
 *
 * Each chapter is a sticky-pinned stage whose contents transform
 * continuously with scroll. Pacing is closer to a long-form landing
 * page than a magazine article — and it has to keep selling for the
 * whole scroll, not just open with a hook.
 *
 * Layout: Hook + Pick-a-Sin are still sticky-pinned to the viewport for
 * their crossfade animations. Every other chapter is a natural-flow
 * min-h-screen section with content centered, no sticky pinning — so
 * the user spends ~one viewport per chapter and there's no 5–15vh of
 * scroll runway with a half-empty stage. Reveals fire as the section
 * enters viewport (useScroll offset `["start end", "end start"]`).
 *
 *   01 Pitch       — 120 / 140 vh, sticky two-phase headline crossfade
 *   02 Receipts    — flow, min-h-screen, py-16 sm:py-20
 *   03 vs Them     — flow
 *   04 The Mechanic— flow
 *   05 Rules       — flow
 *   06 Pick a Sin  — 7 × 45 + 60 = 375 vh, sticky septagram-completion
 *                    + 60vh hang tail
 *   07 Why Honest  — flow
 *   08 Balance     — flow
 *   09 Campaign    — flow
 *   10 Promise     — flow
 *   11 Threshold   — flow
 *
 * Static chapters add up to ~9 viewport heights (one each); plus Hook
 * (1.4) and Pick-a-Sin (3.75) = ~14 vh total. Same total as the last
 * revision, but no chapter is half-empty — the section is exactly the
 * size of its content + breathing padding, so content fills the view.
 */

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowDown, Check, Crown, Eye, Flame, Hourglass, Quote, Skull, Sparkles, Swords, Wallet, X as XMark } from "lucide-react";
import { Link } from "wouter";
import { useRef } from "react";
import type { LucideIcon } from "lucide-react";

import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import type { SinType } from "@shared/gameTypes";

// ─── Brand-book palette + selling pitches ───────────────────────────────────

const SIN_PALETTE: Record<
  SinType,
  { color: string; label: string; pitch: string; archetype: string }
> = {
  wrath:    { color: "#ef4444", label: "WRATH",    archetype: "Hellfire Crimson",     pitch: "Pick this if you've ever wanted to be the table. Reflect damage. Hit harder when hit." },
  sloth:    { color: "#a855f7", label: "SLOTH",    archetype: "Twilight Indigo",      pitch: "Pick this if you've won by refusing to die. Shields that thicken. Patience that wins." },
  greed:    { color: "#eab308", label: "GREED",    archetype: "Tarnished Gold",       pitch: "Pick this if you collect what others lose. Convert their damage into your wealth." },
  envy:     { color: "#10b981", label: "ENVY",     archetype: "Poison Emerald",       pitch: "Pick this if their deck looks better than yours. Steal what they build. Wear it." },
  pride:    { color: "#f0f0f0", label: "PRIDE",    archetype: "Divine Silver-White",  pitch: "Pick this if you've ever bet the house on one card. Multiply your strongest play — or lose it." },
  lust:     { color: "#ec4899", label: "LUST",     archetype: "Forbidden Rose",       pitch: "Pick this if you eat what you kill. Deal damage. Drink the blood. Repeat." },
  gluttony: { color: "#b45309", label: "GLUTTONY", archetype: "Amber Decay",          pitch: "Pick this if more is the strategy. Burn cards for power. Overwhelm with volume." },
};

const SIN_ORDER: SinType[] = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];

// ────────────────────────────────────────────────────────────────────────────
// Decorative library — editorial flourishes used across chapters
// ────────────────────────────────────────────────────────────────────────────

/** Massive Roman numeral that bleeds off-screen behind a chapter, like a
 *  fashion-mag editorial number. Sits at very low opacity so it reads as
 *  texture, not content. */
function ChapterNumeral({
  numeral,
  side = "right",
  color = "#d4a854",
}: {
  numeral: string;
  side?: "left" | "right";
  color?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`absolute top-1/2 -translate-y-1/2 pointer-events-none select-none font-[Cinzel] leading-none`}
      style={{
        [side]: "-8vw",
        fontSize: "min(48vh, 38vw)",
        color,
        opacity: 0.05,
        letterSpacing: "0.05em",
        textShadow: `0 0 60px ${color}33`,
      } as React.CSSProperties}
    >
      {numeral}
    </div>
  );
}

/** A single shimmer-revealed character. Encapsulates the per-letter
 *  hooks so `LetterReveal` doesn't call hooks inside a map. */
function ShimmerLetter({
  ch,
  scrollYProgress,
  fadeStart,
  fadeEnd,
  shimmerColor,
}: {
  ch: string;
  scrollYProgress: MotionValue<number>;
  fadeStart: number;
  fadeEnd: number;
  shimmerColor: string;
}) {
  const opacity = useTransform(scrollYProgress, [fadeStart, fadeEnd], [0, 1]);
  const y = useTransform(scrollYProgress, [fadeStart, fadeEnd], [16, 0]);
  const blur = useTransform(scrollYProgress, [fadeStart, fadeEnd], [4, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  return (
    <motion.span
      aria-hidden="true"
      style={{
        opacity,
        y,
        filter,
        display: "inline-block",
        whiteSpace: ch === " " ? "pre" : "normal",
        textShadow: `0 0 24px ${shimmerColor}`,
      }}
    >
      {ch}
    </motion.span>
  );
}

/** Letter-by-letter reveal with a candlelight shimmer wash. Driven by a
 *  scroll progress range, so it stays in sync with the rest of the chapter. */
function LetterReveal({
  text,
  scrollYProgress,
  start = 0.05,
  end = 0.45,
  className,
  style,
  shimmerColor = "rgba(212,168,84,0.85)",
}: {
  text: string;
  scrollYProgress: MotionValue<number>;
  start?: number;
  end?: number;
  className?: string;
  style?: React.CSSProperties;
  shimmerColor?: string;
}) {
  const letters = Array.from(text);
  return (
    <span className={className} style={style} aria-label={text}>
      {letters.map((ch, i) => {
        const local = letters.length === 1 ? 0 : i / (letters.length - 1);
        const fadeStart = start + (end - start) * local * 0.7;
        const fadeEnd = fadeStart + (end - start) * 0.3;
        return (
          <ShimmerLetter
            key={i}
            ch={ch}
            scrollYProgress={scrollYProgress}
            fadeStart={fadeStart}
            fadeEnd={fadeEnd}
            shimmerColor={shimmerColor}
          />
        );
      })}
    </span>
  );
}

/** Decorative SVG cathedral-arch ornament — a thin gold filigree that sits
 *  above a chapter title. Subtle, but registers as deliberate. */
function CathedralArch({ color = "#d4a854", className = "" }: { color?: string; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 60"
      className={className}
      style={{ display: "block", margin: "0 auto" }}
    >
      <defs>
        <linearGradient id="archGrad" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M 8 50 L 60 50 Q 120 -10 180 50 L 232 50"
        fill="none"
        stroke="url(#archGrad)"
        strokeWidth="1"
      />
      <circle cx="120" cy="14" r="2" fill={color} opacity="0.85" />
      <circle cx="120" cy="14" r="6" fill="none" stroke={color} strokeOpacity="0.4" strokeWidth="0.6" />
      <line x1="40" y1="50" x2="200" y2="50" stroke={color} strokeOpacity="0.18" strokeWidth="0.5" />
    </svg>
  );
}

/** A single point on the septagram. Lights up when scroll passes its sin's
 *  slot, then stays lit (no fade-out) — the wheel "completes" sin by sin. */
function SigilPoint({
  x,
  y,
  scrollYProgress,
  start,
  peak,
  color,
}: {
  x: number;
  y: number;
  scrollYProgress: MotionValue<number>;
  start: number;
  peak: number;
  color: string;
}) {
  // Once lit, stays lit — `[start, peak] → [0, 1]` with no fade-out.
  const fill = useTransform(scrollYProgress, [start, peak], [0, 1]);
  const radius = useTransform(scrollYProgress, [start, peak], [1.2, 2.4]);
  const glowOp = useTransform(scrollYProgress, [start, peak], [0, 0.55]);
  return (
    <g>
      <motion.circle cx={x} cy={y} r={4} fill={color} style={{ opacity: glowOp }} />
      <motion.circle cx={x} cy={y} r={radius} style={{ fill, color }} fill={color} />
    </g>
  );
}

/** Slowly-rotating septagram. As scroll progresses through the Pick-a-Sin
 *  chapter, each of the seven points lights in its sin's brand-book colour
 *  — turning the sigil into a progress indicator that "completes" by the
 *  time the player has seen all seven factions.
 *
 *  After the last sin's slot ends there's a hang tail (extra scroll) where
 *  the completed sigil holds on screen, satisfying the user's ask of
 *  "hang on the wheel until it showed all sins".
 */
function SinSigil({
  scrollYProgress,
  totalSlots,
  hangFraction = 0.13,
  baseColor = "#d4a854",
}: {
  scrollYProgress: MotionValue<number>;
  /** Number of sins (slot count). The hang tail lives outside these slots. */
  totalSlots: number;
  /** Fraction of total scroll spent on the hang tail (after the last sin). */
  hangFraction?: number;
  baseColor?: string;
}) {
  // Slot progress excludes the hang tail so the lights complete before hang.
  const slotsRange = 1 - hangFraction;
  const points = Array.from({ length: 7 }, (_, i) => {
    const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
    return { x: 50 + 45 * Math.cos(angle), y: 50 + 45 * Math.sin(angle) };
  });
  const ringPath =
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
  // Septagram (skip-3) — connects every third point.
  const star = Array.from({ length: 7 }, (_, i) => {
    const idx = (i * 3) % 7;
    return points[idx];
  });
  const starPath =
    star.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  // Sin-coloured points in canonical SIN_ORDER position.
  const pointColors = SIN_ORDER.map((sin) => SIN_PALETTE[sin].color);

  // Rotation slows during the hang so the wheel settles into a final pose.
  const rotate = useTransform(scrollYProgress, [0, slotsRange, 1], [0, 320, 340]);
  const sigilOpacity = useTransform(scrollYProgress, [slotsRange, 1], [0.12, 0.22]);
  const ringPulse = useTransform(scrollYProgress, [slotsRange - 0.05, slotsRange, 1], [0.3, 0.85, 0.85]);

  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className="absolute pointer-events-none"
      style={{
        rotate,
        width: "min(85vh, 80vw)",
        height: "min(85vh, 80vw)",
        top: "50%",
        left: "50%",
        x: "-50%",
        y: "-50%",
        opacity: sigilOpacity,
      }}
    >
      <circle cx="50" cy="50" r="48" fill="none" stroke={baseColor} strokeWidth="0.3" />
      <motion.circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke={baseColor}
        strokeWidth="0.4"
        style={{ opacity: ringPulse }}
      />
      <path d={ringPath} fill="none" stroke={baseColor} strokeWidth="0.4" />
      <path d={starPath} fill="none" stroke={baseColor} strokeWidth="0.6" />
      {points.map((p, i) => {
        const slotStart = (i / totalSlots) * slotsRange;
        const slotPeak = ((i + 0.4) / totalSlots) * slotsRange;
        return (
          <SigilPoint
            key={i}
            x={p.x}
            y={p.y}
            scrollYProgress={scrollYProgress}
            start={slotStart}
            peak={slotPeak}
            color={pointColors[i] ?? baseColor}
          />
        );
      })}
    </motion.svg>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Chapter 1 — Hook (sticky-pin, two-phase headline crossfade)
// ────────────────────────────────────────────────────────────────────────────

function ChapterHook() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const reduce = useReducedMotion();

  const phase1Op    = useTransform(scrollYProgress, [0.0, 0.20, 0.42, 0.55], [1, 1, 0, 0]);
  const phase1Y     = useTransform(scrollYProgress, [0.0, 0.55], reduce ? [0, 0] : [0, -100]);
  const phase2Op    = useTransform(scrollYProgress, [0.40, 0.58, 0.85, 1.0], [0, 1, 1, 0.85]);
  const phase2Y     = useTransform(scrollYProgress, [0.40, 0.65], reduce ? [0, 0] : [60, 0]);
  const subOp       = useTransform(scrollYProgress, [0.62, 0.80], [0, 1]);
  const arrowOp     = useTransform(scrollYProgress, [0.85, 0.96, 1.0], [0, 0.5, 0]);

  // Hook gets a bit more height than other content chapters because the
  // two-phase headline crossfade needs scroll runway to read.
  return (
    <section ref={ref} className="relative h-[120vh] sm:h-[140vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(212,168,84,0.08) 0%, transparent 60%)",
          }}
        />
        <ChapterNumeral numeral="I" side="right" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center w-full">
          <CathedralArch className="w-48 sm:w-56 h-12 mx-auto mb-4 opacity-70" />
          <p className="text-[10px] tracking-[0.6em] text-amber-400/60 mb-6" style={{ fontFamily: "var(--font-heading)" }}>
            01 · THE PITCH
          </p>
          {/* Fixed-height title slot — h2 and h3 stack and cross-fade in place
              instead of using absolute + mt-72, which was overflowing mobile. */}
          <div className="relative h-[10rem] sm:h-[13rem] md:h-[15rem] mb-8 flex items-center justify-center">
            <motion.h2
              style={{ opacity: phase1Op, y: phase1Y }}
              className="absolute inset-0 flex items-center justify-center font-[Cinzel] text-3xl sm:text-5xl md:text-6xl tracking-wide text-amber-300 leading-[1.1]"
            >
              <span>
                Most card games ask
                <br />
                what kind of hero you are.
              </span>
            </motion.h2>
            <motion.h3
              style={{ opacity: phase2Op, y: phase2Y }}
              className="absolute inset-0 flex items-center justify-center font-[Cinzel] text-3xl sm:text-5xl md:text-6xl tracking-wide text-zinc-100 leading-[1.1]"
            >
              <span>
                We assume
                <br />
                <span className="italic" style={{ color: "#8b1a1a" }}>
                  you aren&apos;t.
                </span>
              </span>
            </motion.h3>
          </div>
          <motion.p
            style={{ opacity: subOp, fontFamily: "var(--font-body)" }}
            className="text-base sm:text-lg italic text-zinc-300/85 leading-relaxed max-w-xl mx-auto"
          >
            A free, browser-based dark-fantasy card game. Seven sins.
            Compound mechanics. No paywalls. No download. The narrator is
            already disappointed in you.
          </motion.p>
          <motion.div
            aria-hidden="true"
            style={{ opacity: arrowOp }}
            className="mt-10 inline-flex items-center gap-2 text-[10px] tracking-[0.4em] text-zinc-500"
          >
            <ArrowDown className="w-3 h-3" />
            KEEP SCROLLING
            <ArrowDown className="w-3 h-3" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Chapter 2 — Proof (sticky stat wall; counters animate with scroll)
// ────────────────────────────────────────────────────────────────────────────

interface Stat {
  /** Final value (number or string). For numeric values we count up; for
   *  string values like "$0" we just fade in. */
  value: number | string;
  suffix?: string;
  label: string;
  caption: string;
  accent: string;
  Icon: LucideIcon;
}

const STATS: Stat[] = [
  { value: 7,    label: "FACTIONS",        caption: "One per deadly sin. Each plays nothing like the rest.",         accent: "#d4a854", Icon: Crown },
  { value: 424,  label: "UNIQUE CARDS",    caption: "Sixty-plus per faction. Every one available from day one.",     accent: "#ef4444", Icon: Sparkles },
  { value: 21,   label: "BOSS FIGHTS",     caption: "Hand-tuned campaign trials, each carrying a card you'll never see in PvP.", accent: "#a855f7", Icon: Skull },
  { value: 2,    suffix: "M+", label: "SIMULATED GAMES", caption: "Two million Monte Carlo runs to balance every faction passive and card.", accent: "#10b981", Icon: Eye },
  { value: 1.01, suffix: "%",  label: "MAX DEVIATION",   caption: "Win rate spread across all seven factions. PERFECT balance grade.",    accent: "#fbbf24", Icon: Hourglass },
  { value: "$0", label: "EVER",            caption: "Free. Forever. No accounts required. No pay-to-win, no paywall.",            accent: "#8b1a1a", Icon: Wallet },
];

function StatTile({
  stat,
  index,
  total,
  scrollYProgress,
}: {
  stat: Stat;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  // Each stat lives in its own scroll quartile within the section.
  const start   = index / total;
  const peak    = (index + 0.55) / total;
  const opacity = useTransform(scrollYProgress, [start, peak], [0.18, 1]);
  const y       = useTransform(scrollYProgress, [start, peak], [30, 0]);
  // Numeric count-up. For string values we just snap to value.
  const display = useTransform(scrollYProgress, [start, peak], [0, 1], { clamp: true });
  const numericTarget = typeof stat.value === "number" ? stat.value : 0;
  const counted = useTransform(display, (t) => {
    if (typeof stat.value !== "number") return stat.value;
    const v = numericTarget * t;
    return numericTarget < 10 ? v.toFixed(2).replace(/\.00$/, "") : Math.round(v).toLocaleString();
  });
  const Icon = stat.Icon;

  return (
    <motion.div
      style={{ opacity, y }}
      className="relative rounded-xl border bg-black/40 backdrop-blur-sm p-6 sm:p-8 overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          border: `1px solid ${stat.accent}33`,
          boxShadow: `inset 0 0 0 1px ${stat.accent}15`,
          borderRadius: "inherit",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none opacity-15"
        style={{ background: `radial-gradient(circle, ${stat.accent}, transparent 70%)` }}
      />
      <div className="relative">
        <Icon className="w-5 h-5 mb-3" style={{ color: stat.accent }} />
        <div className="flex items-baseline gap-1 mb-1">
          <motion.span
            className="font-[Cinzel] text-5xl sm:text-6xl tabular-nums"
            style={{ color: stat.accent }}
          >
            {counted}
          </motion.span>
          {stat.suffix && (
            <span
              className="font-[Cinzel] text-3xl sm:text-4xl"
              style={{ color: stat.accent, opacity: 0.85 }}
            >
              {stat.suffix}
            </span>
          )}
        </div>
        <div
          className="text-[10px] tracking-[0.4em] mb-2"
          style={{ fontFamily: "var(--font-heading)", color: stat.accent, opacity: 0.85 }}
        >
          {stat.label}
        </div>
        <p className="text-xs sm:text-sm text-zinc-300/85 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
          {stat.caption}
        </p>
      </div>
    </motion.div>
  );
}

function ChapterProof() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const titleOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.4, 1, 1, 0.5]);

  return (
    <section ref={ref} className="relative">
      <div className="relative w-full overflow-hidden flex items-center py-12 sm:py-16">
        <ChapterNumeral numeral="II" side="left" />
        <div className="relative max-w-6xl mx-auto px-6 w-full">
          <motion.div style={{ opacity: titleOpacity }} className="text-center mb-10 sm:mb-14">
            <CathedralArch className="w-48 sm:w-56 h-12 mx-auto mb-3 opacity-70" />
            <p className="text-[10px] tracking-[0.6em] text-amber-400/60 mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              02 · THE RECEIPTS
            </p>
            <h2 className="font-[Cinzel] text-3xl sm:text-5xl tracking-wide text-zinc-100">
              We did the math. So you don&apos;t have to.
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
            {STATS.map((s, i) => (
              <StatTile
                key={s.label}
                stat={s}
                index={i}
                total={STATS.length}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>
          <motion.p
            style={{ opacity: titleOpacity, fontFamily: "var(--font-body)" }}
            className="mt-10 text-center text-xs italic text-zinc-500 max-w-xl mx-auto"
          >
            Numbers from <Link href="/balance" className="underline hover:text-zinc-300">/balance</Link>
            {" "}— v5.12 Monte Carlo simulation. Real data. Every faction, every card.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Chapter 3 — The Seven (sticky-pin, scroll-driven faction crossfade)
// ────────────────────────────────────────────────────────────────────────────

function FactionStage({
  sin,
  index,
  total,
  slotsRange,
  scrollYProgress,
}: {
  sin: SinType;
  index: number;
  total: number;
  /** Fraction of total chapter scroll dedicated to faction slots (the rest
   *  is the hang tail). */
  slotsRange: number;
  scrollYProgress: MotionValue<number>;
}) {
  const data = SIN_PALETTE[sin];
  const start   = (index / total) * slotsRange;
  const peak    = ((index + 0.4) / total) * slotsRange;
  const fadeOut = ((index + 0.85) / total) * slotsRange;
  const end     = ((index + 1) / total) * slotsRange;
  const isLast  = index === total - 1;

  // Last sin holds at full opacity through the hang tail so the completed
  // wheel and the seventh portrait sit on screen together.
  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, start - 0.02), peak, fadeOut, end],
    isLast ? [0, 1, 1, 1] : [0, 1, 1, 0]
  );
  const portraitScale = useTransform(
    scrollYProgress,
    [Math.max(0, start - 0.02), peak, end],
    [0.85, 1, isLast ? 1 : 1.08]
  );
  const textX = useTransform(
    scrollYProgress,
    [Math.max(0, start - 0.02), peak, end],
    isLast
      ? [40, 0, 0]
      : index % 2 === 0
        ? [40, 0, -40]
        : [-40, 0, 40]
  );

  const portraitOnRight = index % 2 === 1;

  return (
    <motion.div style={{ opacity }} className="absolute inset-0 flex items-center justify-center">
      <div
        className={[
          "max-w-5xl w-full mx-auto px-6 grid items-center gap-10",
          "sm:grid-cols-2",
          portraitOnRight ? "" : "sm:[&>*:first-child]:order-2",
        ].join(" ")}
      >
        <motion.div style={{ x: textX }}>
          <div className="flex items-center gap-2 mb-3">
            <img src={SIN_ARCHETYPE_ICONS[sin]} alt="" aria-hidden="true" className="w-5 h-5 opacity-80" />
            <span
              className="text-[10px] tracking-[0.4em]"
              style={{ fontFamily: "var(--font-heading)", color: data.color }}
            >
              0{index + 1} · {data.archetype.toUpperCase()}
            </span>
          </div>
          <h3
            className="font-[Cinzel] text-5xl sm:text-7xl tracking-wide mb-5"
            style={{ color: data.color, textShadow: `0 0 32px ${data.color}55` }}
          >
            {data.label}
          </h3>
          <p
            className="text-lg sm:text-xl italic text-zinc-200/90 leading-relaxed max-w-md"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {data.pitch}
          </p>
        </motion.div>
        <motion.div style={{ scale: portraitScale }} className="relative">
          <div
            className="relative w-56 h-56 sm:w-80 sm:h-80 mx-auto rounded-full overflow-hidden"
            style={{ boxShadow: `0 0 0 2px ${data.color}66, 0 0 120px ${data.color}40` }}
          >
            <img
              src={FACTION_PORTRAITS[sin]}
              alt={data.label}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 mix-blend-overlay"
              style={{ background: `linear-gradient(135deg, ${data.color}33, transparent 70%)` }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function ChapterSeven() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // 45vh per sin × 7 = 315vh of slots, plus 60vh hang tail = 375vh total.
  // The hang tail is where the user has finished revealing all seven and
  // the completed septagram sits on screen with the seventh portrait
  // (Gluttony) for one viewport-and-a-bit before scrolling on.
  const slotVhPerSin = 45;
  const hangVh = 60;
  const heightVh = SIN_ORDER.length * slotVhPerSin + hangVh;
  const slotsRange = (SIN_ORDER.length * slotVhPerSin) / heightVh; // ≈ 0.84

  const tintHue = useTransform(scrollYProgress, (p) => {
    const local = Math.min(1, p / slotsRange);
    const idx = Math.min(SIN_ORDER.length - 1, Math.max(0, Math.floor(local * SIN_ORDER.length)));
    return SIN_PALETTE[SIN_ORDER[idx]].color;
  });
  const tintBg = useTransform(
    tintHue,
    (c) => `radial-gradient(circle at 50% 35%, ${c}22 0%, transparent 60%)`
  );
  const counter = useTransform(scrollYProgress, (p) => {
    const local = Math.min(1, p / slotsRange);
    const idx = Math.min(SIN_ORDER.length - 1, Math.max(0, Math.floor(local * SIN_ORDER.length)));
    return `0${idx + 1} / 0${SIN_ORDER.length}`;
  });

  return (
    <section ref={ref} className="relative" style={{ height: `${heightVh}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: tintBg }} />
        <SinSigil
          scrollYProgress={scrollYProgress}
          totalSlots={SIN_ORDER.length}
          hangFraction={1 - slotsRange}
        />
        <div className="absolute top-12 left-0 right-0 z-20 text-center">
          <CathedralArch className="w-48 sm:w-56 h-12 mx-auto mb-2 opacity-60" />
          <p
            className="text-[10px] tracking-[0.6em] text-amber-400/60 mb-1"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            05 · PICK YOUR SIN
          </p>
          <p className="text-[10px] tracking-[0.3em] text-zinc-600 italic">
            scroll to complete the wheel
          </p>
        </div>
        <div className="relative w-full h-full">
          {SIN_ORDER.map((sin, idx) => (
            <FactionStage
              key={sin}
              sin={sin}
              index={idx}
              total={SIN_ORDER.length}
              slotsRange={slotsRange}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>
        <motion.div
          className="absolute bottom-10 left-0 right-0 z-20 text-center text-[10px] tracking-[0.4em] text-zinc-500"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <motion.span>{counter}</motion.span>
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5">
          <motion.div
            className="h-full bg-amber-400/50"
            style={{ scaleX: scrollYProgress, transformOrigin: "0% 50%" }}
          />
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Chapter 4 — Pillars (sticky 2x2; benefit-led titles; per-quartile reveals)
// ────────────────────────────────────────────────────────────────────────────

interface Pillar {
  icon: LucideIcon;
  kicker: string;
  title: string;
  body: string;
  accent: string;
}

const PILLARS: Pillar[] = [
  { kicker: "01 — THE MATH",   icon: Hourglass, accent: "#d4a854",
    title: "Patience is a weapon.",
    body: "Cards tick across rounds in Fibonacci. A cheap play in round one is a catastrophe by round five. The compound interest on sin is real." },
  { kicker: "02 — THE ROSTER", icon: Crown,     accent: "#ef4444",
    title: "Seven decks, seven minds.",
    body: "No two sins play the same. Wrath flinches and burns you back. Sloth refuses to die. Pride bets the house on one card. You'll have a favourite. You'll hate the rest." },
  { kicker: "03 — THE FIGHT",  icon: Eye,       accent: "#a855f7",
    title: "Everyone commits at once.",
    body: "Simultaneous lock-in. No counter-baiting, no reading your opponent's face. A closed fist, opened together. Then the reckoning." },
  { kicker: "04 — THE PRICE",  icon: Wallet,    accent: "#10b981",
    title: "Free. Every card. Forever.",
    body: "No accounts required. No pay-to-win. No paywalls. Browser-based. Your skill is the only currency the cathedral accepts." },
];

function PillarReveal({
  pillar,
  index,
  total,
  scrollYProgress,
}: {
  pillar: Pillar;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const start = index / total;
  const arrived = (index + 0.6) / total;
  const opacity = useTransform(scrollYProgress, [start, arrived], [0, 1]);
  const y = useTransform(scrollYProgress, [start, arrived], [40, 0]);
  const Icon = pillar.icon;
  return (
    <motion.div
      style={{ opacity, y }}
      className="relative rounded-xl border bg-black/30 backdrop-blur-sm p-7 sm:p-9"
    >
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          border: `1px solid ${pillar.accent}33`,
          boxShadow: `inset 0 0 0 1px ${pillar.accent}15`,
        }}
      />
      <div className="relative flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${pillar.accent}33, ${pillar.accent}11)`,
            border: `1px solid ${pillar.accent}55`,
          }}
        >
          <Icon className="w-4 h-4" style={{ color: pillar.accent }} />
        </div>
        <span
          className="text-[10px] tracking-[0.3em]"
          style={{ fontFamily: "var(--font-heading)", color: pillar.accent, opacity: 0.7 }}
        >
          {pillar.kicker}
        </span>
      </div>
      <h4
        className="relative font-[Cinzel] text-lg sm:text-xl tracking-wide mb-2 leading-snug"
        style={{ color: pillar.accent }}
      >
        {pillar.title}
      </h4>
      <p
        className="relative text-sm leading-relaxed text-zinc-300"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {pillar.body}
      </p>
    </motion.div>
  );
}

function ChapterPillars() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const titleOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0.6]);

  return (
    <section ref={ref} className="relative">
      <div className="relative w-full overflow-hidden flex items-center py-12 sm:py-16">
        <ChapterNumeral numeral="VII" side="right" color="#a855f7" />
        <div className="relative max-w-5xl mx-auto px-6 w-full">
          <motion.div style={{ opacity: titleOpacity }} className="text-center mb-10 sm:mb-12">
            <CathedralArch color="#a855f7" className="w-48 sm:w-56 h-12 mx-auto mb-3 opacity-70" />
            <p className="text-[10px] tracking-[0.6em] text-amber-400/60 mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              07 · WHY IT WORKS
            </p>
            <h2 className="font-[Cinzel] text-3xl sm:text-5xl tracking-wide text-zinc-100">
              Four reasons it&apos;s honest.
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PILLARS.map((p, i) => (
              <PillarReveal
                key={p.title}
                pillar={p}
                index={i}
                total={PILLARS.length}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Chapter 5 — Campaign (sticky parallax title + boss-quote crawl)
// ────────────────────────────────────────────────────────────────────────────

const CAMPAIGN_BOSS_QUOTES = [
  "The Forgemaster lifts the hammer.",
  "Mother Slumber breathes the room out.",
  "Cassivus does paperwork.",
  "The Mirror smiles your smile, but better.",
  "Apex has not lost.",
  "Lyssara is patient. Lyssara is fed.",
  "The Maw does not consider you.",
];

function ChapterCampaign() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const reduce = useReducedMotion();

  const titleY       = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [80, -80]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2, 0.85, 1], [0, 1, 1, 0]);
  const crawlY       = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [120, -260]);
  const ctaOpacity   = useTransform(scrollYProgress, [0.55, 0.85], [0, 1]);
  const ctaScale     = useTransform(scrollYProgress, [0.55, 0.85], [0.92, 1]);

  return (
    <section ref={ref} className="relative">
      <div className="relative w-full overflow-hidden flex items-center justify-center py-12 sm:py-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 30% 50%, rgba(139,26,26,0.18) 0%, transparent 55%), radial-gradient(circle at 80% 60%, rgba(212,168,84,0.10) 0%, transparent 55%)",
          }}
        />
        <motion.div
          style={{ y: crawlY }}
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 z-0 flex flex-col gap-8 items-center justify-center pointer-events-none"
        >
          {CAMPAIGN_BOSS_QUOTES.map((q, i) => (
            <p
              key={i}
              className="text-sm sm:text-base italic text-zinc-500/40 whitespace-nowrap"
              style={{ fontFamily: "var(--font-narrator)" }}
            >
              {q}
            </p>
          ))}
        </motion.div>
        <ChapterNumeral numeral="IX" side="left" color="#8b1a1a" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <CathedralArch color="#8b1a1a" className="w-48 sm:w-56 h-12 mx-auto mb-3 opacity-70" />
          <p className="text-[10px] tracking-[0.6em] text-amber-400/60 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            09 · THE CAMPAIGN
          </p>
          <motion.h2
            style={{ y: titleY, opacity: titleOpacity }}
            className="font-[Cinzel] text-3xl sm:text-5xl tracking-wide text-zinc-100 mb-3"
          >
            Twenty-one trials.
          </motion.h2>
          <motion.h3
            style={{ y: titleY, opacity: titleOpacity }}
            className="font-[Cinzel] text-3xl sm:text-5xl tracking-wide text-amber-300 mb-6"
          >
            One judgmental narrator.
          </motion.h3>
          <motion.p
            style={{ opacity: titleOpacity, fontFamily: "var(--font-body)" }}
            className="text-sm sm:text-base italic text-zinc-400 max-w-lg mx-auto leading-relaxed mb-10"
          >
            Three acts per sin. Each boss carries a card you&apos;ll never see in PvP.
            Hand-tuned decks. HP curves that bite at the right moment.
          </motion.p>
          <motion.div style={{ opacity: ctaOpacity, scale: ctaScale }}>
            <Link
              href="/campaign"
              className="inline-flex items-center gap-3 px-8 py-3.5 rounded-lg font-[Cinzel] text-sm tracking-[0.25em] transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #d4a854, #b8893d)",
                color: "#141210",
                boxShadow: "0 10px 40px rgba(212,168,84,0.35)",
              }}
            >
              <Swords className="w-4 h-4" />
              ENTER THE CAMPAIGN
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Chapter 6 — Threshold (final close)
// ────────────────────────────────────────────────────────────────────────────

function ChapterThreshold() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const reduce = useReducedMotion();

  const skullScale     = useTransform(scrollYProgress, [0, 0.5], reduce ? [1, 1] : [0.4, 1]);
  const skullOpacity   = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const headlineY      = useTransform(scrollYProgress, [0, 0.5], reduce ? [0, 0] : [40, 0]);
  const headlineOpacity = useTransform(scrollYProgress, [0.1, 0.5], [0, 1]);
  const ctaOpacity     = useTransform(scrollYProgress, [0.4, 0.8], [0, 1]);

  return (
    <section ref={ref} className="relative">
      <div className="relative w-full overflow-hidden flex items-center py-12 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 100%, rgba(139,26,26,0.20) 0%, transparent 60%)",
          }}
        />
        <ChapterNumeral numeral="XII" side="left" color="#8b1a1a" />
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center w-full">
          <motion.div style={{ scale: skullScale, opacity: skullOpacity }} className="inline-block mb-8">
            <Skull className="w-12 h-12 text-amber-400/60" />
          </motion.div>
          <motion.div
            style={{ opacity: headlineOpacity, fontFamily: "var(--font-heading)" }}
            className="text-[10px] tracking-[0.6em] text-amber-400/70 mb-4"
          >
            12 · NOW
          </motion.div>
          <motion.h2
            style={{ y: headlineY, opacity: headlineOpacity }}
            className="font-[Cinzel] text-4xl sm:text-6xl tracking-wide text-amber-300 leading-[1.05] mb-3"
          >
            Free.
          </motion.h2>
          <motion.h2
            style={{ y: headlineY, opacity: headlineOpacity }}
            className="font-[Cinzel] text-4xl sm:text-6xl tracking-wide text-zinc-100 leading-[1.05] mb-3"
          >
            Browser.
          </motion.h2>
          <motion.h2
            style={{ y: headlineY, opacity: headlineOpacity }}
            className="font-[Cinzel] text-4xl sm:text-6xl tracking-wide leading-[1.05] mb-10"
            // Brand Book "Dried Blood" CTA accent.
            // eslint-disable-next-line react/forbid-dom-props
          >
            <span style={{ color: "#8b1a1a" }}>Now.</span>
          </motion.h2>
          <motion.p
            style={{ opacity: headlineOpacity, fontFamily: "var(--font-body)" }}
            className="text-base sm:text-lg italic text-zinc-300/85 leading-relaxed mb-10 max-w-md mx-auto"
          >
            No accounts required. No download. Seven faction starter decks
            wait for you. The narrator is already disappointed.
          </motion.p>
          <motion.div
            style={{ opacity: ctaOpacity }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg text-sm tracking-[0.25em] border border-white/15 text-zinc-200 hover:bg-white/5 transition-all"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <Flame className="w-4 h-4" />
              PRACTICE FIRST
            </Link>
            <a
              href="#hero"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm tracking-[0.25em] transition-all hover:scale-[1.02]"
              style={{
                fontFamily: "var(--font-heading)",
                background: "linear-gradient(135deg, #8b1a1a, #6b1414)",
                color: "#e8e0d0",
                boxShadow: "0 10px 40px rgba(139,26,26,0.45)",
              }}
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <Swords className="w-4 h-4" />
              ENTER THE ARENA
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Chapter — Versus (head-to-head matrix)
// ────────────────────────────────────────────────────────────────────────────

interface VersusRow {
  game: string;
  meta: string;
  paid: boolean;     // pay-to-win or paid unlock
  download: boolean; // requires install
  dark: boolean;     // dark/gothic tone
  compound: boolean; // has compound-escalation mechanic
  campaign: boolean; // has solo campaign
}

const VERSUS_ROWS: VersusRow[] = [
  { game: "7 Deadly Sins", meta: "this game",                  paid: false, download: false, dark: true,  compound: true,  campaign: true  },
  { game: "Hearthstone",   meta: "Blizzard, since 2014",       paid: true,  download: true,  dark: false, compound: false, campaign: true  },
  { game: "MTG Arena",     meta: "Wizards of the Coast, 2019", paid: true,  download: true,  dark: false, compound: false, campaign: false },
  { game: "Marvel Snap",   meta: "Second Dinner, 2022",        paid: true,  download: true,  dark: false, compound: false, campaign: false },
  { game: "Slay the Spire",meta: "Mega Crit, 2017",            paid: true,  download: true,  dark: true,  compound: false, campaign: true  },
  { game: "Legends of Runeterra", meta: "Riot, 2020",          paid: false, download: true,  dark: false, compound: false, campaign: true  },
];

const VERSUS_COLS: { key: keyof Omit<VersusRow, "game" | "meta">; label: string }[] = [
  { key: "paid",     label: "FREE / NO PAYWALL" },
  { key: "download", label: "RUNS IN BROWSER" },
  { key: "dark",     label: "DARK FANTASY TONE" },
  { key: "compound", label: "COMPOUND MECHANICS" },
  { key: "campaign", label: "SOLO CAMPAIGN" },
];

function VersusCell({ row, col }: { row: VersusRow; col: keyof Omit<VersusRow, "game" | "meta"> }) {
  // For `paid` and `download`, "yes" is bad. Invert.
  const value = row[col];
  const positive = col === "paid" || col === "download" ? !value : value;
  return (
    <div
      className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-md"
      style={{
        background: positive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.10)",
        border: `1px solid ${positive ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.25)"}`,
      }}
    >
      {positive ? (
        <Check className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#10b981" }} />
      ) : (
        <XMark className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#ef4444" }} />
      )}
    </div>
  );
}

function VersusRowReveal({
  row,
  index,
  total,
  scrollYProgress,
}: {
  row: VersusRow;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const start = index / total;
  const arrived = (index + 0.6) / total;
  const opacity = useTransform(scrollYProgress, [start, arrived], [0.05, 1]);
  const x = useTransform(scrollYProgress, [start, arrived], [-30, 0]);
  const isUs = index === 0;
  return (
    <motion.div
      style={{ opacity, x }}
      className="grid grid-cols-[1.1fr_repeat(5,minmax(0,1fr))] items-center gap-2 sm:gap-4 py-4 sm:py-6 border-b border-white/5"
    >
      <div className="min-w-0">
        <div
          className="font-[Cinzel] text-sm sm:text-base truncate"
          style={{ color: isUs ? "#d4a854" : "rgba(231,221,200,0.85)" }}
        >
          {row.game}
        </div>
        <div className="text-[10px] tracking-wider text-zinc-500/70 truncate">
          {row.meta}
        </div>
      </div>
      {VERSUS_COLS.map((col) => (
        <div key={col.key} className="flex justify-center">
          <VersusCell row={row} col={col.key} />
        </div>
      ))}
    </motion.div>
  );
}

function ChapterVersus() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const titleOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0.5]);

  return (
    <section ref={ref} className="relative">
      <div className="relative w-full overflow-hidden flex items-center py-12 sm:py-16">
        <ChapterNumeral numeral="III" side="right" color="#ef4444" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 w-full">
          <motion.div style={{ opacity: titleOpacity }} className="text-center mb-8 sm:mb-10">
            <CathedralArch color="#ef4444" className="w-48 sm:w-56 h-12 mx-auto mb-3 opacity-70" />
            <p className="text-[10px] tracking-[0.6em] text-amber-400/60 mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              03 · vs THEM
            </p>
            <h2 className="font-[Cinzel] text-3xl sm:text-5xl tracking-wide text-zinc-100">
              We don&apos;t play on the same field.
            </h2>
            <p
              className="mt-3 text-sm sm:text-base italic text-zinc-400 max-w-xl mx-auto"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Five household names, one contrarian. Pick the row that doesn&apos;t demand your wallet.
            </p>
          </motion.div>

          {/* Header row */}
          <div className="grid grid-cols-[1.1fr_repeat(5,minmax(0,1fr))] items-end gap-2 sm:gap-4 pb-2 border-b border-white/10">
            <div />
            {VERSUS_COLS.map((col) => (
              <div
                key={col.key}
                className="text-[8px] sm:text-[9px] tracking-[0.18em] text-zinc-500 text-center leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {col.label}
              </div>
            ))}
          </div>

          {VERSUS_ROWS.map((row, i) => (
            <VersusRowReveal
              key={row.game}
              row={row}
              index={i}
              total={VERSUS_ROWS.length}
              scrollYProgress={scrollYProgress}
            />
          ))}

          <motion.p
            style={{ opacity: titleOpacity, fontFamily: "var(--font-body)" }}
            className="mt-6 text-center text-xs italic text-zinc-500 max-w-xl mx-auto"
          >
            Honest comparison. We linked the deep-dives — see the
            {" "}
            <Link href="/blog/best-browser-card-games-in-2026-complete-ranking" className="underline hover:text-zinc-300">
              full ranking
            </Link>
            {" "}or any of the per-competitor head-to-heads under
            {" "}
            <Link href="/blog" className="underline hover:text-zinc-300">/blog</Link>.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Chapter — The Mechanic (sticky compound-tick demo)
// ────────────────────────────────────────────────────────────────────────────
//
// The single most important strategic mechanic is the compound tick: a
// damage card played in round 1 ticks 1, 1, 2, 3, 5… across rounds 1–5
// (Fibonacci). This chapter sells it visually — as you scroll, a single
// card "ticks" through five progressively heavier hits.

const COMPOUND_TICKS = [1, 1, 2, 3, 5] as const;
const COMPOUND_TOTAL = COMPOUND_TICKS.reduce((a, b) => a + b, 0); // 12

function CompoundTickRow({
  index,
  total,
  damage,
  scrollYProgress,
}: {
  index: number;
  total: number;
  damage: number;
  scrollYProgress: MotionValue<number>;
}) {
  // Each tick "fires" within its slot (scroll quartile-ish).
  const start = 0.15 + index / total * 0.7;
  const peak  = start + 0.10;
  const opacity = useTransform(scrollYProgress, [start, peak], [0, 1]);
  const x       = useTransform(scrollYProgress, [start, peak], [-24, 0]);
  // Bar width: damage / max(damage) of the sequence.
  const max = Math.max(...COMPOUND_TICKS);
  const widthPct = (damage / max) * 100;
  return (
    <motion.div style={{ opacity, x }} className="grid grid-cols-[3rem_1fr_3rem] items-center gap-3 sm:gap-4">
      <div
        className="text-[10px] tracking-[0.3em] text-zinc-500 text-right"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        R{index + 1}
      </div>
      <div className="relative h-7 rounded bg-white/5 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded"
          style={{
            width: `${widthPct}%`,
            background: "linear-gradient(90deg, rgba(239,68,68,0.85), rgba(212,168,84,0.85))",
            boxShadow: "0 0 24px rgba(239,68,68,0.35)",
          }}
        />
      </div>
      <div
        className="font-[Cinzel] text-lg text-amber-300 text-left tabular-nums"
        style={{ textShadow: "0 0 12px rgba(212,168,84,0.5)" }}
      >
        −{damage}
      </div>
    </motion.div>
  );
}

function ChapterMechanic() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const titleOpacity = useTransform(scrollYProgress, [0, 0.15, 0.92, 1], [0, 1, 1, 0.5]);
  const cardScale = useTransform(scrollYProgress, [0, 0.2], [0.92, 1]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const totalOpacity = useTransform(scrollYProgress, [0.85, 0.95], [0, 1]);

  return (
    <section ref={ref} className="relative">
      <div className="relative w-full overflow-hidden flex items-center py-12 sm:py-16">
        <ChapterNumeral numeral="IV" side="left" color="#d4a854" />
        {/* Floating card silhouettes drifting in the background */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            aria-hidden="true"
            className="absolute pointer-events-none rounded-xl"
            style={{
              width: "120px",
              aspectRatio: "3/4",
              top: `${15 + i * 22}%`,
              left: `${5 + i * 30}%`,
              background:
                "linear-gradient(160deg, rgba(30,26,22,0.6), rgba(20,18,16,0.4))",
              border: "1px solid rgba(212,168,84,0.18)",
              boxShadow: "inset 0 0 0 1px rgba(212,168,84,0.06)",
              opacity: 0.35,
              rotate: `${(i - 1) * 8}deg`,
              filter: "blur(0.4px)",
            }}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
          />
        ))}
        <div className="relative max-w-4xl mx-auto px-6 w-full">
          <motion.div style={{ opacity: titleOpacity }} className="text-center mb-8 sm:mb-10">
            <CathedralArch className="w-48 sm:w-56 h-12 mx-auto mb-3 opacity-70" />
            <p className="text-[10px] tracking-[0.6em] text-amber-400/60 mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              04 · THE MECHANIC
            </p>
            <h2 className="font-[Cinzel] text-3xl sm:text-5xl tracking-wide text-zinc-100 mb-3">
              Most cards do one thing. Once.
            </h2>
            <h3 className="font-[Cinzel] text-3xl sm:text-5xl tracking-wide text-amber-300">
              <LetterReveal
                text="Ours compound."
                scrollYProgress={scrollYProgress}
                start={0.10}
                end={0.32}
              />
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-[18rem_1fr] gap-8 items-center">
            {/* Mock card */}
            <motion.div
              style={{ scale: cardScale, opacity: cardOpacity }}
              className="relative mx-auto w-56 sm:w-64 aspect-[3/4] rounded-xl overflow-hidden"
              aria-hidden="true"
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(30,26,22,0.95) 0%, rgba(20,18,16,0.92) 100%)",
                  border: "1px solid rgba(212,168,84,0.4)",
                  boxShadow:
                    "inset 0 0 0 1px rgba(212,168,84,0.15), 0 30px 80px rgba(239,68,68,0.18)",
                }}
              />
              <div className="relative h-full p-5 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[9px] tracking-[0.3em] text-amber-400/80"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    WRATH
                  </span>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-amber-300 font-[Cinzel] text-sm"
                    style={{ background: "rgba(212,168,84,0.18)", border: "1px solid rgba(212,168,84,0.45)" }}
                  >
                    1
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <Flame className="w-16 h-16 text-red-500/70" />
                </div>
                <h4
                  className="font-[Cinzel] text-lg text-amber-300 leading-tight mb-1"
                  style={{ textShadow: "0 0 16px rgba(212,168,84,0.4)" }}
                >
                  Slow Burn
                </h4>
                <p
                  className="text-[11px] italic text-zinc-300 leading-snug"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Compound damage over 5 rounds. Fibonacci pattern.
                </p>
                <div
                  className="mt-2 text-[9px] tracking-[0.25em] text-zinc-500"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  TIER · COMMON
                </div>
              </div>
            </motion.div>

            {/* Round-by-round bars */}
            <div className="flex flex-col gap-3">
              {COMPOUND_TICKS.map((dmg, i) => (
                <CompoundTickRow
                  key={i}
                  index={i}
                  total={COMPOUND_TICKS.length}
                  damage={dmg}
                  scrollYProgress={scrollYProgress}
                />
              ))}
              <motion.div
                style={{ opacity: totalOpacity }}
                className="mt-3 pt-4 border-t border-white/10 flex items-center justify-between"
              >
                <div
                  className="text-[10px] tracking-[0.3em] text-zinc-400"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  TOTAL · ONE PLAY
                </div>
                <div
                  className="font-[Cinzel] text-3xl"
                  style={{ color: "#d4a854", textShadow: "0 0 24px rgba(212,168,84,0.45)" }}
                >
                  −{COMPOUND_TOTAL}
                </div>
              </motion.div>
            </div>
          </div>

          <motion.p
            style={{ opacity: titleOpacity, fontFamily: "var(--font-body)" }}
            className="mt-10 text-center text-xs sm:text-sm italic text-zinc-500 max-w-2xl mx-auto leading-relaxed"
          >
            One cheap card in round one. Five rounds of escalating damage. The
            same Fibonacci pattern that governs the spacing of this page
            governs the rhythm of the fight. Patience compounds. So does
            impatience.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Chapter — Voices (sticky narrator-quote crossfade)
// ────────────────────────────────────────────────────────────────────────────

interface NarratorQuote {
  text: string;
  attribution: string;
  accent: string;
  /** Optional faction portrait used as a blurred silhouette behind the quote. */
  sin?: SinType;
}

const NARRATOR_QUOTES: NarratorQuote[] = [
  {
    text: "Welcome to the arena, where your poor life choices become entertainment.",
    attribution: "The narrator · game start",
    accent: "#d4a854",
  },
  {
    text: "The Forgemaster lifts the hammer. He is not asking permission.",
    attribution: "Wrath · Act I — The Forge",
    accent: "#ef4444",
    sin: "wrath",
  },
  {
    text: "Mother Slumber breathes once. The room exhales with her.",
    attribution: "Sloth · Act II — The Drowsing",
    accent: "#a855f7",
    sin: "sloth",
  },
  {
    text: "Cassivus does not negotiate. He liquidates.",
    attribution: "Greed · Act III — The Plutarch",
    accent: "#eab308",
    sin: "greed",
  },
  {
    text: "The Mirror smiles your smile, but better. It's been watching.",
    attribution: "Envy · Act I — The Mirror",
    accent: "#10b981",
    sin: "envy",
  },
  {
    text: "Apex has not lost. Apex sees no reason to start now.",
    attribution: "Pride · Act III — The Apex",
    accent: "#f0f0f0",
    sin: "pride",
  },
  {
    text: "The Maw does not consider you. Consideration is for things it hasn't eaten yet.",
    attribution: "Gluttony · Act III — The Maw",
    accent: "#b45309",
    sin: "gluttony",
  },
];

function NarratorQuoteSlide({
  quote,
  index,
  total,
  scrollYProgress,
}: {
  quote: NarratorQuote;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const start = index / total;
  const peak  = (index + 0.4) / total;
  const fade  = (index + 0.85) / total;
  const end   = (index + 1) / total;

  const opacity = useTransform(scrollYProgress, [Math.max(0, start - 0.02), peak, fade, end], [0, 1, 1, 0]);
  const y       = useTransform(scrollYProgress, [Math.max(0, start - 0.02), peak], [40, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex items-center justify-center"
    >
      {quote.sin && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div
            className="rounded-full overflow-hidden"
            style={{
              width: "min(72vh, 56vw)",
              height: "min(72vh, 56vw)",
              maxWidth: "640px",
              maxHeight: "640px",
              filter: "blur(18px)",
              opacity: 0.18,
              boxShadow: `0 0 120px ${quote.accent}55`,
            }}
          >
            <img
              src={FACTION_PORTRAITS[quote.sin]}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${quote.accent}55, transparent 75%)` }}
            />
          </div>
        </div>
      )}
      <div className="relative max-w-2xl mx-auto px-6 text-center">
        <Quote className="w-8 h-8 mx-auto mb-6" style={{ color: quote.accent, opacity: 0.7 }} />
        <p
          className="font-[Cinzel] text-2xl sm:text-4xl leading-[1.25] mb-6"
          style={{ color: "#e8e0d0", textShadow: `0 0 30px ${quote.accent}33` }}
        >
          &ldquo;{quote.text}&rdquo;
        </p>
        <p
          className="text-[10px] tracking-[0.4em]"
          style={{ fontFamily: "var(--font-heading)", color: quote.accent }}
        >
          {quote.attribution.toUpperCase()}
        </p>
      </div>
    </motion.div>
  );
}

function ChapterVoices() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const counter = useTransform(scrollYProgress, (p) => {
    const idx = Math.min(NARRATOR_QUOTES.length - 1, Math.max(0, Math.floor(p * NARRATOR_QUOTES.length)));
    return `0${idx + 1} / 0${NARRATOR_QUOTES.length}`;
  });

  return (
    <section ref={ref} className="relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(212,168,84,0.06) 0%, transparent 65%)",
          }}
        />
        <ChapterNumeral numeral="X" side="right" />
        <div className="absolute top-12 left-0 right-0 z-20 text-center">
          <CathedralArch className="w-48 sm:w-56 h-12 mx-auto mb-2 opacity-70" />
          <p
            className="text-[10px] tracking-[0.6em] text-amber-400/60"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            10 · VOICES
          </p>
          <p className="text-[10px] tracking-[0.3em] text-zinc-600 italic">
            the narrator is judging the whole way
          </p>
        </div>
        <div className="relative w-full h-full">
          {NARRATOR_QUOTES.map((q, i) => (
            <NarratorQuoteSlide
              key={i}
              quote={q}
              index={i}
              total={NARRATOR_QUOTES.length}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>
        <motion.div
          className="absolute bottom-10 left-0 right-0 z-20 text-center text-[10px] tracking-[0.4em] text-zinc-500"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <motion.span>{counter}</motion.span>
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5">
          <motion.div
            className="h-full bg-amber-400/50"
            style={{ scaleX: scrollYProgress, transformOrigin: "0% 50%" }}
          />
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────
// Chapter — Rules (storytelling walkthrough of how a round plays)
// ────────────────────────────────────────────────────────────────────────────

interface RuleStep {
  ord: string;
  title: string;
  body: string;
  flavour: string;
  accent: string;
}

const RULE_STEPS: RuleStep[] = [
  {
    ord: "I",
    title: "Everyone locks in.",
    body:
      "Up to four players choose cards from their hand. Hidden, simultaneously. Then a ten-second countdown starts the moment anyone commits — no waiting on the slowest sinner. No bluffing turn order. Just the cards you wanted to play and the cards you didn't.",
    flavour: "Simultaneous lock-in",
    accent: "#a855f7",
  },
  {
    ord: "II",
    title: "Cards reveal at once.",
    body:
      "All hands open. The arena reads them in priority order — skip-queue cards first, then lowest HP plays first, then within a player the cheapest card. No hidden information. No turn-order baiting. The reckoning was always going to happen.",
    flavour: "Resolution priority",
    accent: "#ef4444",
  },
  {
    ord: "III",
    title: "Effects compound across rounds.",
    body:
      "A card played in round one isn't done in round one. Damage, shields, heal-steal, energy drain — all of it ticks across two-to-five rounds in Fibonacci, aggressive, or slow-burn patterns. The board you're looking at is already three turns old.",
    flavour: "Compound ticks",
    accent: "#d4a854",
  },
  {
    ord: "IV",
    title: "Twenty rounds. Or no rounds.",
    body:
      "The game ends when one sinner is left standing. Or, if everyone clings on, at round twenty the Final Reckoning settles it on remaining HP. Patience is a weapon. So is impatience. Both win games.",
    flavour: "Win condition",
    accent: "#10b981",
  },
];

function RuleCard({
  step,
  index,
  total,
  scrollYProgress,
}: {
  step: RuleStep;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const start = index / total;
  const arrived = (index + 0.55) / total;
  const opacity = useTransform(scrollYProgress, [start, arrived], [0, 1]);
  const x = useTransform(scrollYProgress, [start, arrived], [-32, 0]);
  return (
    <motion.div
      style={{ opacity, x }}
      className="relative grid grid-cols-[3.5rem_1fr] sm:grid-cols-[5rem_1fr] gap-4 sm:gap-6 items-start"
    >
      <div
        className="font-[Cinzel] text-3xl sm:text-5xl text-right select-none tabular-nums leading-none"
        style={{ color: step.accent, textShadow: `0 0 24px ${step.accent}55` }}
      >
        {step.ord}
      </div>
      <div className="border-l pl-4 sm:pl-6 py-1" style={{ borderColor: `${step.accent}44` }}>
        <div
          className="text-[10px] tracking-[0.3em] mb-2"
          style={{ fontFamily: "var(--font-heading)", color: step.accent, opacity: 0.85 }}
        >
          {step.flavour.toUpperCase()}
        </div>
        <h3
          className="font-[Cinzel] text-xl sm:text-2xl text-zinc-100 mb-2 leading-tight"
        >
          {step.title}
        </h3>
        <p
          className="text-sm sm:text-base text-zinc-300/85 leading-relaxed"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {step.body}
        </p>
      </div>
    </motion.div>
  );
}

function ChapterRules() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const titleOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0.5]);

  return (
    <section ref={ref} className="relative">
      <div className="relative w-full overflow-hidden flex items-center py-12 sm:py-16">
        <ChapterNumeral numeral="V" side="right" color="#10b981" />
        <div className="relative max-w-3xl mx-auto px-6 w-full">
          <motion.div style={{ opacity: titleOpacity }} className="text-center mb-10">
            <CathedralArch color="#10b981" className="w-48 sm:w-56 h-12 mx-auto mb-3 opacity-70" />
            <p
              className="text-[10px] tracking-[0.6em] text-amber-400/60 mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              05 · HOW A ROUND PLAYS
            </p>
            <h2 className="font-[Cinzel] text-3xl sm:text-5xl tracking-wide text-zinc-100 mb-3">
              Four steps. One rite.
            </h2>
            <p
              className="text-sm sm:text-base italic text-zinc-400 max-w-md mx-auto"
              style={{ fontFamily: "var(--font-body)" }}
            >
              No tutorial gates, no monetisation timers. Just the rules of the cathedral.
            </p>
          </motion.div>
          <div className="flex flex-col gap-7 sm:gap-8">
            {RULE_STEPS.map((step, i) => (
              <RuleCard
                key={step.ord}
                step={step}
                index={i}
                total={RULE_STEPS.length}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Chapter — Balance Journey (the iterative rebalancing story)
// ────────────────────────────────────────────────────────────────────────────

interface BalanceMilestone {
  version: string;
  deviation: number;  // percentage
  grade: "POOR" | "FAIR" | "GOOD" | "PERFECT";
  story: string;
}

const BALANCE_JOURNEY: BalanceMilestone[] = [
  { version: "v1",    deviation: 12.5, grade: "POOR",    story: "Four-faction prototype. Wrath was a tax on the room." },
  { version: "v2",    deviation: 15.8, grade: "POOR",    story: "Expanded to seven sins. The new ones broke harder than the old ones held." },
  { version: "v3",    deviation: 9.2,  grade: "FAIR",    story: "Redesigned every faction passive. The math finally remembered the seven." },
  { version: "v4",    deviation: 6.2,  grade: "GOOD",    story: "Proportional card value scaling. Cheap cards stopped being free wins." },
  { version: "v5.11", deviation: 1.41, grade: "GOOD",    story: "Combined optimizer — passives + card values, gradient descent, 470K games." },
  { version: "v5.12", deviation: 1.01, grade: "PERFECT", story: "Two million Monte Carlo runs. Fifty-nine cards retuned. PERFECT grade." },
];

function MilestoneRow({
  milestone,
  index,
  total,
  scrollYProgress,
  maxDeviation,
}: {
  milestone: BalanceMilestone;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  maxDeviation: number;
}) {
  const start = index / total;
  const arrived = (index + 0.55) / total;
  const opacity = useTransform(scrollYProgress, [start, arrived], [0, 1]);
  const x = useTransform(scrollYProgress, [start, arrived], [-24, 0]);
  const widthScale = useTransform(scrollYProgress, [start, arrived], [0, 1]);
  const targetPct = (milestone.deviation / maxDeviation) * 100;

  const gradeColor = {
    POOR: "#ef4444",
    FAIR: "#fbbf24",
    GOOD: "#10b981",
    PERFECT: "#d4a854",
  }[milestone.grade];

  return (
    <motion.div style={{ opacity, x }} className="grid grid-cols-[3.5rem_1fr_auto] gap-3 sm:gap-4 items-center">
      <div
        className="font-[Cinzel] text-sm sm:text-base text-amber-300/70 text-right tabular-nums"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {milestone.version}
      </div>
      <div className="relative h-7 rounded bg-white/5 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 origin-left rounded"
          style={{
            scaleX: widthScale,
            width: `${targetPct}%`,
            background: `linear-gradient(90deg, ${gradeColor}, ${gradeColor}aa)`,
            boxShadow: `0 0 16px ${gradeColor}55`,
          }}
        />
        <div className="absolute inset-0 flex items-center px-3 text-[10px] tracking-wider text-zinc-200">
          <span className="font-[Cinzel] tabular-nums" style={{ color: gradeColor }}>
            {milestone.deviation.toFixed(2)}%
          </span>
          <span className="ml-2 text-[9px] tracking-[0.3em] text-zinc-400/80">
            {milestone.grade}
          </span>
        </div>
      </div>
      <div className="hidden sm:block text-[10px] italic text-zinc-500 max-w-[18rem] truncate" title={milestone.story}>
        {milestone.story}
      </div>
    </motion.div>
  );
}

function ChapterBalance() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const titleOpacity = useTransform(scrollYProgress, [0, 0.15, 0.9, 1], [0, 1, 1, 0.5]);
  const maxDeviation = Math.max(...BALANCE_JOURNEY.map((m) => m.deviation));

  return (
    <section ref={ref} className="relative">
      <div className="relative w-full overflow-hidden flex items-center py-12 sm:py-16">
        <ChapterNumeral numeral="VIII" side="left" color="#fbbf24" />
        <div className="relative max-w-3xl mx-auto px-6 w-full">
          <motion.div style={{ opacity: titleOpacity }} className="text-center mb-10">
            <CathedralArch color="#fbbf24" className="w-48 sm:w-56 h-12 mx-auto mb-3 opacity-70" />
            <p
              className="text-[10px] tracking-[0.6em] text-amber-400/60 mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              08 · THE BALANCE
            </p>
            <h2 className="font-[Cinzel] text-3xl sm:text-5xl tracking-wide text-zinc-100 mb-3">
              From 15.8% to 1.01%.
            </h2>
            <p
              className="text-sm sm:text-base italic text-zinc-400 max-w-lg mx-auto"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Six iterations. Two million simulated games. Fifty-nine cards
              retuned. The arena is honest because we made it.
            </p>
          </motion.div>
          <div className="flex flex-col gap-3 mb-8">
            {BALANCE_JOURNEY.map((m, i) => (
              <MilestoneRow
                key={m.version}
                milestone={m}
                index={i}
                total={BALANCE_JOURNEY.length}
                scrollYProgress={scrollYProgress}
                maxDeviation={maxDeviation}
              />
            ))}
          </div>
          <motion.p
            style={{ opacity: titleOpacity, fontFamily: "var(--font-body)" }}
            className="text-center text-xs italic text-zinc-500 max-w-xl mx-auto"
          >
            All numbers verifiable on{" "}
            <Link href="/balance" className="underline hover:text-zinc-300">
              /balance
            </Link>
            . The 1.5% threshold is the bar a card game has to clear to be
            called fair. We&apos;re a third of the way under it.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Chapter — The Promise (forever-free manifesto)
// ────────────────────────────────────────────────────────────────────────────

const PROMISE_NEGATIVES = [
  "No microtransactions.",
  "No paid card packs.",
  "No paid faction unlocks.",
  "No power-affecting cosmetics.",
  "No subscription tier.",
  "No ads.",
];

function PromiseLine({
  text,
  index,
  total,
  scrollYProgress,
}: {
  text: string;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const start = index / total;
  const arrived = (index + 0.5) / total;
  const opacity = useTransform(scrollYProgress, [start, arrived], [0, 1]);
  const x = useTransform(scrollYProgress, [start, arrived], [-20, 0]);
  return (
    <motion.div
      style={{ opacity, x }}
      className="flex items-center gap-3 sm:gap-4"
    >
      <div
        className="flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0"
        style={{
          background: "rgba(239,68,68,0.10)",
          border: "1px solid rgba(239,68,68,0.30)",
        }}
      >
        <XMark className="w-4 h-4" style={{ color: "#ef4444" }} />
      </div>
      <div
        className="font-[Cinzel] text-lg sm:text-2xl text-zinc-200 tracking-wide"
      >
        {text}
      </div>
    </motion.div>
  );
}

function ChapterPromise() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const titleOpacity = useTransform(scrollYProgress, [0, 0.15, 0.92, 1], [0, 1, 1, 0.5]);
  const promiseOpacity = useTransform(scrollYProgress, [0.7, 0.92], [0, 1]);
  const promiseY = useTransform(scrollYProgress, [0.7, 0.92], [30, 0]);

  return (
    <section ref={ref} className="relative">
      <div className="relative w-full overflow-hidden flex items-center py-12 sm:py-16">
        <ChapterNumeral numeral="XI" side="right" color="#10b981" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(16,185,129,0.10) 0%, transparent 60%), radial-gradient(circle at 50% 90%, rgba(212,168,84,0.08) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-2xl mx-auto px-6 w-full text-center">
          <motion.div style={{ opacity: titleOpacity }} className="mb-10">
            <CathedralArch color="#10b981" className="w-48 sm:w-56 h-12 mx-auto mb-3 opacity-70" />
            <p
              className="text-[10px] tracking-[0.6em] text-amber-400/60 mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              11 · THE PROMISE
            </p>
            <h2 className="font-[Cinzel] text-3xl sm:text-5xl tracking-wide text-zinc-100 leading-[1.1] mb-3">
              Free.
              <br />
              <span style={{ color: "#10b981" }}>Forever.</span>
            </h2>
            <p
              className="text-sm sm:text-base italic text-zinc-400 max-w-lg mx-auto"
              style={{ fontFamily: "var(--font-body)" }}
            >
              The cathedral has one rule the rest of the industry doesn&apos;t.
              We tell you what we will never charge you for.
            </p>
          </motion.div>

          <div className="flex flex-col gap-3 sm:gap-4 mb-12 text-left max-w-md mx-auto">
            {PROMISE_NEGATIVES.map((line, i) => (
              <PromiseLine
                key={line}
                text={line}
                index={i}
                total={PROMISE_NEGATIVES.length}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>

          <motion.div style={{ opacity: promiseOpacity, y: promiseY }}>
            <div className="h-px w-24 mx-auto mb-6 bg-amber-400/30" />
            <p
              className="font-[Cinzel] text-xl sm:text-3xl text-amber-300 leading-[1.3] mb-3"
              style={{ textShadow: "0 0 24px rgba(212,168,84,0.4)" }}
            >
              For the sake of gaming.
            </p>
            <p
              className="text-sm sm:text-base italic text-zinc-400 max-w-md mx-auto leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              We pay the servers. You play the cards. That&apos;s the deal.
              For as long as we can keep the lights on, the doors stay open
              and the price stays the same. Zero.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Composed export
// ────────────────────────────────────────────────────────────────────────────

export default function HomeScrollChapters() {
  return (
    <div className="relative z-10">
      <ChapterHook />
      <ChapterProof />
      <ChapterVersus />
      <ChapterMechanic />
      <ChapterRules />
      <ChapterSeven />
      <ChapterPillars />
      <ChapterBalance />
      <ChapterCampaign />
      {/* ChapterVoices was a 7-quote sticky crossfade — dropped to keep the
          page tight; mood beat, not selling info. */}
      <ChapterPromise />
      <ChapterThreshold />
    </div>
  );
}
