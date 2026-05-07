/**
 * HomeScrollChapters — "scrollyselling" funnel beneath the Home hero.
 *
 * Each chapter is a sticky-pinned stage whose contents transform
 * continuously with scroll. Pacing is closer to a long-form landing
 * page than a magazine article: a hook that names the contrarian
 * promise, a proof wall of count-up stats, the seven factions framed
 * as pick-this-if pitches, the four product pillars, a campaign
 * teaser, and a final threshold CTA.
 *
 *   1. Hook        — 200vh; "Most card games ask what kind of hero
 *                    you are. We assume you aren't." Tagline pops.
 *   2. Proof       — 220vh; six stat counters animate up as you
 *                    scroll past each one. Real numbers from
 *                    BalanceAnalysis (424 cards, 2M sims, 1.01%
 *                    deviation, 21 boss fights, 0 paywalls).
 *   3. The Seven   — 800vh; sticky stage cross-fades through all
 *                    seven sins. Copy reframed as "pick this if you
 *                    are X" instead of poetic descriptors.
 *   4. Pillars     — 240vh; sticky 2x2 grid; each pillar reveals in
 *                    its own scroll quartile. Titles are benefit-led.
 *   5. Campaign    — 200vh; sticky parallax title + boss-quote crawl
 *                    + CTA fade.
 *   6. Threshold   — 150vh; final close — "Free. Browser. Now."
 *
 * Total ~18 viewport heights of choreographed scroll.
 */

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowDown, Crown, Eye, Hourglass, Skull, Sparkles, Swords, Wallet, Flame } from "lucide-react";
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

  return (
    <section ref={ref} className="relative" style={{ height: "200vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(212,168,84,0.08) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="text-[10px] tracking-[0.6em] text-amber-400/60 mb-8" style={{ fontFamily: "var(--font-heading)" }}>
            01 · THE PITCH
          </p>
          <motion.h2
            style={{ opacity: phase1Op, y: phase1Y }}
            className="font-[Cinzel] text-4xl sm:text-6xl md:text-7xl tracking-wide text-amber-300 leading-[1.05]"
          >
            Most card games ask
            <br />
            what kind of hero you are.
          </motion.h2>
          <motion.h3
            style={{ opacity: phase2Op, y: phase2Y }}
            className="absolute inset-x-0 top-[8rem] sm:top-[9.5rem] font-[Cinzel] text-4xl sm:text-6xl md:text-7xl tracking-wide text-zinc-100 leading-[1.05]"
          >
            We assume
            <br />
            <span className="italic" style={{ color: "#8b1a1a" }}>
              you aren&apos;t.
            </span>
          </motion.h3>
          <motion.p
            style={{ opacity: subOp, fontFamily: "var(--font-body)" }}
            className="mt-72 sm:mt-96 text-base sm:text-lg italic text-zinc-300/85 leading-relaxed max-w-xl mx-auto"
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
      className="relative rounded-xl border bg-black/40 backdrop-blur-sm p-5 sm:p-6 overflow-hidden"
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
            className="font-[Cinzel] text-4xl sm:text-5xl tabular-nums"
            style={{ color: stat.accent }}
          >
            {counted}
          </motion.span>
          {stat.suffix && (
            <span
              className="font-[Cinzel] text-2xl sm:text-3xl"
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
    offset: ["start start", "end end"],
  });
  const titleOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.4, 1, 1, 0.5]);

  return (
    <section ref={ref} className="relative" style={{ height: "220vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full">
          <motion.div style={{ opacity: titleOpacity }} className="text-center mb-10 sm:mb-14">
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
  scrollYProgress,
}: {
  sin: SinType;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const data = SIN_PALETTE[sin];
  const start   = index / total;
  const peak    = (index + 0.4) / total;
  const fadeOut = (index + 0.85) / total;
  const end     = (index + 1) / total;

  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, start - 0.02), peak, fadeOut, end],
    [0, 1, 1, 0]
  );
  const portraitScale = useTransform(
    scrollYProgress,
    [Math.max(0, start - 0.02), peak, end],
    [0.85, 1, 1.08]
  );
  const textX = useTransform(
    scrollYProgress,
    [Math.max(0, start - 0.02), peak, end],
    index % 2 === 0 ? [40, 0, -40] : [-40, 0, 40]
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

  const tintHue = useTransform(scrollYProgress, (p) => {
    const idx = Math.min(SIN_ORDER.length - 1, Math.max(0, Math.floor(p * SIN_ORDER.length)));
    return SIN_PALETTE[SIN_ORDER[idx]].color;
  });
  const tintBg = useTransform(
    tintHue,
    (c) => `radial-gradient(circle at 50% 35%, ${c}22 0%, transparent 60%)`
  );
  const counter = useTransform(scrollYProgress, (p) => {
    const idx = Math.min(SIN_ORDER.length - 1, Math.max(0, Math.floor(p * SIN_ORDER.length)));
    return `0${idx + 1} / 0${SIN_ORDER.length}`;
  });

  const heightVh = SIN_ORDER.length * 100;

  return (
    <section ref={ref} className="relative" style={{ height: `${heightVh}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: tintBg }} />
        <div className="absolute top-12 left-0 right-0 z-20 text-center">
          <p
            className="text-[10px] tracking-[0.6em] text-amber-400/60 mb-1"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            03 · PICK YOUR SIN
          </p>
          <p className="text-[10px] tracking-[0.3em] text-zinc-600 italic">scroll to flip through all seven</p>
        </div>
        <div className="relative w-full h-full">
          {SIN_ORDER.map((sin, idx) => (
            <FactionStage
              key={sin}
              sin={sin}
              index={idx}
              total={SIN_ORDER.length}
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
      className="relative rounded-xl border bg-black/30 backdrop-blur-sm p-6"
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
    offset: ["start start", "end end"],
  });
  const titleOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0.6]);

  return (
    <section ref={ref} className="relative" style={{ height: "240vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
        <div className="max-w-5xl mx-auto px-6 w-full">
          <motion.div style={{ opacity: titleOpacity }} className="text-center mb-10 sm:mb-12">
            <p className="text-[10px] tracking-[0.6em] text-amber-400/60 mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              04 · WHY IT WORKS
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
    offset: ["start start", "end end"],
  });
  const reduce = useReducedMotion();

  const titleY       = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [80, -80]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2, 0.85, 1], [0, 1, 1, 0]);
  const crawlY       = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [120, -260]);
  const ctaOpacity   = useTransform(scrollYProgress, [0.55, 0.85], [0, 1]);
  const ctaScale     = useTransform(scrollYProgress, [0.55, 0.85], [0.92, 1]);

  return (
    <section ref={ref} className="relative" style={{ height: "200vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
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
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <p className="text-[10px] tracking-[0.6em] text-amber-400/60 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            05 · THE CAMPAIGN
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
    <section ref={ref} className="relative" style={{ height: "150vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 100%, rgba(139,26,26,0.20) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center w-full">
          <motion.div style={{ scale: skullScale, opacity: skullOpacity }} className="inline-block mb-8">
            <Skull className="w-12 h-12 text-amber-400/60" />
          </motion.div>
          <motion.div
            style={{ opacity: headlineOpacity, fontFamily: "var(--font-heading)" }}
            className="text-[10px] tracking-[0.6em] text-amber-400/70 mb-4"
          >
            06 · NOW
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
// Composed export
// ────────────────────────────────────────────────────────────────────────────

export default function HomeScrollChapters() {
  return (
    <div className="relative z-10">
      <ChapterHook />
      <ChapterProof />
      <ChapterSeven />
      <ChapterPillars />
      <ChapterCampaign />
      <ChapterThreshold />
    </div>
  );
}
