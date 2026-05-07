/**
 * HomeScrollChapters — proper scrollytelling beneath the Home hero.
 *
 * Real scrollytelling, not fade-in-on-view: each chapter pins a sticky
 * visual stage to the viewport for a multi-screen scroll, and the content
 * inside that stage transforms continuously as a function of scroll
 * progress (`useScroll` + `useTransform`).
 *
 *   1. Premise        — 220vh; one sticky stage; the line "Most card
 *                       games ask what kind of hero you are." morphs into
 *                       "We ask what kind of sinner." as you scroll
 *                       through it. Background gradient drifts.
 *   2. The Seven      — 800vh (one viewport per sin); one sticky stage
 *                       holds a single boss portrait + faction copy that
 *                       cross-fades through all seven sins as the player
 *                       scrolls past. The page background tints to the
 *                       active sin's colour.
 *   3. Four Pillars   — 240vh; sticky stage holds a 2×2 grid where each
 *                       pillar materialises in a fixed scroll quartile.
 *   4. The Campaign   — 160vh; sticky stage with parallax title + boss
 *                       names crawling past + CTA fade.
 *   5. The Threshold  — 130vh; final sticky CTA stage.
 *
 * Total: ~15 viewport heights of choreographed scroll. Self-contained —
 * Home.tsx renders <HomeScrollChapters /> below the hero panel.
 */

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowDown, Crown, Eye, Flame, Hourglass, Skull, Swords, Wallet } from "lucide-react";
import { Link } from "wouter";
import { useRef } from "react";
import type { LucideIcon } from "lucide-react";

import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import type { SinType } from "@shared/gameTypes";

// ─── Brand-book palette ─────────────────────────────────────────────────────

const SIN_PALETTE: Record<
  SinType,
  { color: string; label: string; promise: string; archetype: string }
> = {
  wrath:    { color: "#ef4444", label: "WRATH",    promise: "The blunt instrument. Damage that reflects, vengeance that compounds.", archetype: "Hellfire Crimson" },
  sloth:    { color: "#a855f7", label: "SLOTH",    promise: "The immovable object. Shields that thicken, patience that wins.",       archetype: "Twilight Indigo" },
  greed:    { color: "#eab308", label: "GREED",    promise: "The tax collector. Convert their damage into your wealth.",             archetype: "Tarnished Gold" },
  envy:     { color: "#10b981", label: "ENVY",     promise: "The mimic. Steal what others build. Wear what they wear.",              archetype: "Poison Emerald" },
  pride:    { color: "#f0f0f0", label: "PRIDE",    promise: "The gambler. Multiply your strongest play — or lose it all.",           archetype: "Divine Silver-White" },
  lust:     { color: "#ec4899", label: "LUST",     promise: "The parasite. Deal damage. Drink the blood. Repeat, gracefully.",       archetype: "Forbidden Rose" },
  gluttony: { color: "#b45309", label: "GLUTTONY", promise: "The devourer. Burn cards for power. Overwhelm with volume.",            archetype: "Amber Decay" },
};

const SIN_ORDER: SinType[] = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];

// ────────────────────────────────────────────────────────────────────────────
// Chapter 1 — The Premise (sticky-pin, scroll-driven crossfade)
// ────────────────────────────────────────────────────────────────────────────

function ChapterPremise() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const reduce = useReducedMotion();

  // Two phases share the stage; the second emerges as the first dissolves.
  const heroOpacity   = useTransform(scrollYProgress, [0.0, 0.18, 0.42, 0.55], [1, 1, 0, 0]);
  const heroY         = useTransform(scrollYProgress, [0.0, 0.55],             reduce ? [0, 0] : [0, -120]);
  const heroBlur      = useTransform(scrollYProgress, [0.18, 0.55],            reduce ? [0, 0] : [0, 8]);
  const turnOpacity   = useTransform(scrollYProgress, [0.40, 0.58, 0.85, 1.0], [0, 1, 1, 1]);
  const turnY         = useTransform(scrollYProgress, [0.40, 0.65],            reduce ? [0, 0] : [60, 0]);
  const subOpacity    = useTransform(scrollYProgress, [0.62, 0.80],            [0, 1]);
  const arrowOpacity  = useTransform(scrollYProgress, [0.85, 0.96, 1.0],       [0, 0.5, 0]);
  const bgIntensity   = useTransform(scrollYProgress, [0, 0.5, 1],             [0.04, 0.18, 0.10]);

  return (
    <section ref={ref} className="relative" style={{ height: "220vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: useTransform(
              bgIntensity,
              (v) => `radial-gradient(circle at 50% 50%, rgba(212,168,84,${v}) 0%, transparent 60%)`
            ),
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <p
            className="text-[10px] tracking-[0.6em] text-amber-400/60 mb-8"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            01 · THE PREMISE
          </p>
          <motion.h2
            style={{
              opacity: heroOpacity,
              y: heroY,
              filter: useTransform(heroBlur, (b) => `blur(${b}px)`),
            }}
            className="font-[Cinzel] text-3xl sm:text-5xl md:text-6xl tracking-wide text-amber-300 leading-[1.1]"
          >
            Most card games ask
            <br />
            what kind of hero you are.
          </motion.h2>
          <motion.h3
            style={{ opacity: turnOpacity, y: turnY }}
            className="absolute inset-x-0 top-[6.5rem] sm:top-[7.5rem] font-[Cinzel] text-3xl sm:text-5xl md:text-6xl tracking-wide text-zinc-100 leading-[1.1]"
          >
            We ask
            <br />
            <span className="italic" style={{ color: "#8b1a1a" }}>
              what kind of sinner.
            </span>
          </motion.h3>
          <motion.p
            style={{ opacity: subOpacity }}
            className="mt-72 sm:mt-80 text-lg sm:text-xl italic text-zinc-300/80 leading-relaxed"
          >
            Strategy games have always asked you to save the world. We ask
            something more honest. Confront the parts of yourself polite
            society pretends don&apos;t exist. Then weaponise them.
          </motion.p>
          <motion.div
            aria-hidden="true"
            style={{ opacity: arrowOpacity }}
            className="mt-12 inline-flex items-center gap-2 text-[10px] tracking-[0.4em] text-zinc-500"
          >
            <ArrowDown className="w-3 h-3" />
            KEEP READING
            <ArrowDown className="w-3 h-3" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Chapter 2 — The Seven (sticky-pin, scroll-driven faction crossfade)
// ────────────────────────────────────────────────────────────────────────────
//
// The container is `(SIN_ORDER.length + 1) * 100vh` tall. The +1 is a buffer
// so the first sin gets a full screen of "intro hold" before it starts
// crossfading to the next.
//
// At any scroll progress p ∈ [0, 1], we compute:
//   activeIndex = floor(p * SIN_ORDER.length)
//   localT      = (p * SIN_ORDER.length) - activeIndex
//
// Each sin renders inside the sticky stage with `opacity` driven by where
// scroll is relative to its slot — sin i is fully visible when
// p ∈ [i / N, (i + 0.7) / N], crossfades out by (i + 1) / N.

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
  // Slot boundaries with a fade band.
  const start    = index / total;
  const peak     = (index + 0.4) / total;
  const fadeOut  = (index + 0.85) / total;
  const end      = (index + 1) / total;

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
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div
        className={[
          "max-w-5xl w-full mx-auto px-6 grid items-center gap-10",
          "sm:grid-cols-2",
          portraitOnRight ? "" : "sm:[&>*:first-child]:order-2",
        ].join(" ")}
      >
        <motion.div style={{ x: textX }}>
          <div className="flex items-center gap-2 mb-3">
            <img
              src={SIN_ARCHETYPE_ICONS[sin]}
              alt=""
              aria-hidden="true"
              className="w-5 h-5 opacity-80"
            />
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
            {data.promise}
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

  // Drive the page-background tint off the active faction.
  const tintHue = useTransform(scrollYProgress, (p) => {
    const idx = Math.min(SIN_ORDER.length - 1, Math.max(0, Math.floor(p * SIN_ORDER.length)));
    return SIN_PALETTE[SIN_ORDER[idx]].color;
  });
  const tintBg = useTransform(
    tintHue,
    (c) => `radial-gradient(circle at 50% 35%, ${c}22 0%, transparent 60%)`
  );

  // Progress label "01 / 07", "02 / 07", …
  const counter = useTransform(scrollYProgress, (p) => {
    const idx = Math.min(SIN_ORDER.length - 1, Math.max(0, Math.floor(p * SIN_ORDER.length)));
    return `0${idx + 1} / 0${SIN_ORDER.length}`;
  });

  // Section is one viewport per sin — cleanly paces the crossfades.
  const heightVh = SIN_ORDER.length * 100;

  return (
    <section ref={ref} className="relative" style={{ height: `${heightVh}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: tintBg }}
        />
        <div className="absolute top-12 left-0 right-0 z-20 text-center">
          <p
            className="text-[10px] tracking-[0.6em] text-amber-400/60"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            02 · THE SEVEN
          </p>
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
        {/* Sticky scroll progress bar across the bottom of the stage. */}
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
// Chapter 3 — The Four Pillars (sticky-pin, four-stop reveal)
// ────────────────────────────────────────────────────────────────────────────

interface Pillar {
  icon: LucideIcon;
  title: string;
  body: string;
  accent: string;
}

const PILLARS: Pillar[] = [
  { icon: Hourglass, title: "Compound Escalation",      accent: "#d4a854",
    body: "Cards tick across rounds. A cheap play in round 1 is a catastrophe in round 5. Patience is a weapon. So is impatience." },
  { icon: Crown,     title: "Seven Faction Identities", accent: "#ef4444",
    body: "No two sins play the same. Wrath flinches and burns you back. Sloth refuses to die. Pride bets the house. Choose your nature." },
  { icon: Eye,       title: "Simultaneous Lock-In",     accent: "#a855f7",
    body: "Everyone commits at once. No counter-baiting. No reading the table. Just a closed fist, opened together. Then the reckoning." },
  { icon: Wallet,    title: "No Pay-to-Win, Ever",      accent: "#10b981",
    body: "Free, browser-based, every card available from day one. The arena is honest. Your skill is the only currency." },
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
      // OKLCH fallback: keep brand-book hex-with-alpha for tinted borders.
      data-pillar-accent={pillar.accent}
    >
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          border: `1px solid ${pillar.accent}33`,
          boxShadow: `inset 0 0 0 1px ${pillar.accent}15`,
        }}
      />
      <div
        className="relative w-10 h-10 rounded-md flex items-center justify-center mb-4"
        style={{
          background: `linear-gradient(135deg, ${pillar.accent}33, ${pillar.accent}11)`,
          border: `1px solid ${pillar.accent}55`,
        }}
      >
        <Icon className="w-5 h-5" style={{ color: pillar.accent }} />
      </div>
      <h4
        className="relative font-[Cinzel] text-lg tracking-wide mb-2"
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
          <motion.div style={{ opacity: titleOpacity }} className="text-center mb-12">
            <p
              className="text-[10px] tracking-[0.6em] text-amber-400/60 mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              03 · THE FOUR PILLARS
            </p>
            <h2 className="font-[Cinzel] text-3xl sm:text-5xl tracking-wide text-zinc-100">
              What makes the arena honest.
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
// Chapter 4 — The Campaign (sticky-pin, parallax title + boss-name crawl)
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

  const titleY      = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [80, -80]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2, 0.85, 1], [0, 1, 1, 0]);
  const crawlY      = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [120, -260]);
  const ctaOpacity  = useTransform(scrollYProgress, [0.55, 0.85], [0, 1]);
  const ctaScale    = useTransform(scrollYProgress, [0.55, 0.85], [0.92, 1]);

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
          <p
            className="text-[10px] tracking-[0.6em] text-amber-400/60 mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            04 · THE CAMPAIGN
          </p>
          <motion.h2
            style={{ y: titleY, opacity: titleOpacity }}
            className="font-[Cinzel] text-3xl sm:text-5xl tracking-wide text-zinc-100 mb-3"
          >
            Twenty-one trials.
          </motion.h2>
          <motion.h3
            style={{ y: titleY, opacity: titleOpacity }}
            className="font-[Cinzel] text-3xl sm:text-5xl tracking-wide text-amber-300 mb-10"
          >
            One judgmental narrator.
          </motion.h3>
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
// Chapter 5 — The Threshold (final sticky CTA)
// ────────────────────────────────────────────────────────────────────────────

function ChapterThreshold() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const reduce = useReducedMotion();

  const skullScale = useTransform(scrollYProgress, [0, 0.5], reduce ? [1, 1] : [0.4, 1]);
  const skullOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const headlineY = useTransform(scrollYProgress, [0, 0.5], reduce ? [0, 0] : [40, 0]);
  const headlineOpacity = useTransform(scrollYProgress, [0.1, 0.5], [0, 1]);
  const ctaOpacity = useTransform(scrollYProgress, [0.4, 0.8], [0, 1]);

  return (
    <section ref={ref} className="relative" style={{ height: "150vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 100%, rgba(139,26,26,0.20) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center w-full">
          <motion.div
            style={{ scale: skullScale, opacity: skullOpacity }}
            className="inline-block mb-8"
          >
            <Skull className="w-12 h-12 text-amber-400/60" />
          </motion.div>
          <motion.h2
            style={{ y: headlineY, opacity: headlineOpacity }}
            className="font-[Cinzel] text-4xl sm:text-6xl tracking-wide text-amber-300 leading-[1.1] mb-6"
          >
            The cathedral
            <br />
            is unlocked.
          </motion.h2>
          <motion.p
            style={{ opacity: headlineOpacity, fontFamily: "var(--font-body)" }}
            className="text-base sm:text-lg italic text-zinc-300/85 leading-relaxed mb-10"
          >
            Free. Browser-based. No accounts required. No paywalls. Just you,
            seven faction starter decks, and a narrator who is already
            disappointed.
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
      <ChapterPremise />
      <ChapterSeven />
      <ChapterPillars />
      <ChapterCampaign />
      <ChapterThreshold />
    </div>
  );
}
