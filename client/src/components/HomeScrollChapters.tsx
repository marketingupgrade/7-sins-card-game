/**
 * HomeScrollChapters — scrollytelling sections rendered below the Home hero.
 *
 * Five chapters told in the cathedral voice from the Brand Book:
 *   1. The Premise — "Embrace Your Darkest Nature"
 *   2. The Seven — faction reveals, one per scroll-stop
 *   3. Four Pillars — Compound Escalation / Faction Identity /
 *      Simultaneous Lock-In / No Pay-to-Win
 *   4. The Campaign — 21 trials teaser
 *   5. The Threshold — final CTA
 *
 * Each chapter uses framer-motion `useScroll` to drive its own micro
 * animations as it enters the viewport. Backgrounds shift sin-coloured
 * as the player scrolls past faction reveals so the page actually breathes
 * the way a story does.
 *
 * Self-contained — drops in between the existing hero panel and the footer.
 */

import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Crown, Eye, Flame, Hourglass, Skull, Swords, Wallet } from "lucide-react";
import { Link } from "wouter";
import { useRef } from "react";
import type { LucideIcon } from "lucide-react";

import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import type { SinType } from "@shared/gameTypes";

// Brand Book colour tokens. Kept inline so this component is portable.
const SIN_PALETTE: Record<SinType, { color: string; label: string; promise: string; archetype: string }> = {
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
// Chapter 1 — The Premise
// ────────────────────────────────────────────────────────────────────────────

function ChapterPremise() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const reduce = useReducedMotion();
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.6, 0.8], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], reduce ? [0, 0, 0] : [40, 0, -40]);

  return (
    <section ref={ref} className="relative py-32 sm:py-44 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(212,168,84,0.08) 0%, transparent 60%)",
        }}
      />
      <motion.div
        style={{ opacity, y }}
        className="relative z-10 max-w-3xl mx-auto px-6 text-center"
      >
        <p
          className="text-[10px] tracking-[0.6em] text-amber-400/60 mb-6"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          THE PREMISE
        </p>
        <h2
          className="font-[Cinzel] text-3xl sm:text-5xl md:text-6xl tracking-wide text-amber-300 leading-[1.1]"
          style={{ textShadow: "0 0 32px rgba(212,168,84,0.25)" }}
        >
          Most card games ask
          <br />
          what kind of hero you are.
        </h2>
        <h3
          className="mt-8 font-[Cinzel] text-3xl sm:text-5xl md:text-6xl tracking-wide text-zinc-100 leading-[1.1]"
          style={{ textShadow: "0 0 32px rgba(255,255,255,0.08)" }}
        >
          We ask
          <br />
          <span className="italic" style={{ color: "#8b1a1a" }}>
            what kind of sinner.
          </span>
        </h3>
        <p
          className="mt-12 text-lg sm:text-xl italic text-zinc-300/80 leading-relaxed"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Strategy games have always asked you to save the world. We ask
          something more honest. Confront the parts of yourself polite society
          pretends don&apos;t exist. Then weaponise them.
        </p>
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mt-14 inline-flex items-center gap-2 text-[10px] tracking-[0.4em] text-zinc-500"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <ArrowDown className="w-3 h-3" />
          KEEP READING
          <ArrowDown className="w-3 h-3" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Chapter 2 — The Seven
// ────────────────────────────────────────────────────────────────────────────

function FactionRow({ sin, index }: { sin: SinType; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: false });
  const data = SIN_PALETTE[sin];
  const portraitOnRight = index % 2 === 1;

  return (
    <div ref={ref} className="relative py-20 sm:py-32">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: inView ? 0.2 : 0 }}
        transition={{ duration: 0.8 }}
        style={{
          background: `radial-gradient(circle at ${portraitOnRight ? "75%" : "25%"} 50%, ${data.color}33 0%, transparent 60%)`,
        }}
      />
      <div
        className={[
          "relative z-10 max-w-5xl mx-auto px-6 grid items-center gap-10",
          "sm:grid-cols-2",
          portraitOnRight ? "" : "sm:[&>*:first-child]:order-2",
        ].join(" ")}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
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
            className="font-[Cinzel] text-4xl sm:text-5xl tracking-wide mb-4"
            style={{ color: data.color, textShadow: `0 0 24px ${data.color}55` }}
          >
            {data.label}
          </h3>
          <p
            className="text-base sm:text-lg italic text-zinc-200/85 leading-relaxed max-w-md"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {data.promise}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative"
        >
          <div
            className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto rounded-full overflow-hidden"
            style={{ boxShadow: `0 0 0 2px ${data.color}55, 0 0 80px ${data.color}33` }}
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
    </div>
  );
}

function ChapterSeven() {
  return (
    <section className="relative py-12 sm:py-20 border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6 text-center mb-6 sm:mb-12">
        <p
          className="text-[10px] tracking-[0.6em] text-amber-400/60 mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          02 · THE SEVEN
        </p>
        <h2 className="font-[Cinzel] text-3xl sm:text-5xl tracking-wide text-zinc-100">
          Seven sins. Seven strategies.
        </h2>
        <p
          className="mt-4 text-base sm:text-lg italic text-zinc-400 leading-relaxed"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Each one is simultaneously a curse and a superpower. Pick the one that
          looks least like you. Then find out it was you all along.
        </p>
      </div>
      {SIN_ORDER.map((sin, idx) => (
        <FactionRow key={sin} sin={sin} index={idx} />
      ))}
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Chapter 3 — Four Pillars
// ────────────────────────────────────────────────────────────────────────────

interface Pillar {
  icon: LucideIcon;
  title: string;
  body: string;
  accent: string;
}

const PILLARS: Pillar[] = [
  {
    icon: Hourglass,
    title: "Compound Escalation",
    body: "Cards tick across rounds. A cheap play in round 1 is a catastrophe in round 5. Patience is a weapon. So is impatience.",
    accent: "#d4a854",
  },
  {
    icon: Crown,
    title: "Seven Faction Identities",
    body: "No two sins play the same. Wrath flinches and burns you back. Sloth refuses to die. Pride bets the house. Choose your nature.",
    accent: "#ef4444",
  },
  {
    icon: Eye,
    title: "Simultaneous Lock-In",
    body: "Everyone commits at once. No counter-baiting. No reading the table. Just a closed fist, opened together. Then the reckoning.",
    accent: "#a855f7",
  },
  {
    icon: Wallet,
    title: "No Pay-to-Win, Ever",
    body: "Free, browser-based, every card available from day one. The arena is honest. Your skill is the only currency.",
    accent: "#10b981",
  },
];

function PillarCard({ pillar, index }: { pillar: Pillar; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3, once: true });
  const Icon = pillar.icon;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
      className="relative rounded-xl border bg-black/30 backdrop-blur-sm p-6"
      style={{ borderColor: `${pillar.accent}33`, boxShadow: `inset 0 0 0 1px ${pillar.accent}15` }}
    >
      <div
        className="w-10 h-10 rounded-md flex items-center justify-center mb-4"
        style={{
          background: `linear-gradient(135deg, ${pillar.accent}33, ${pillar.accent}11)`,
          border: `1px solid ${pillar.accent}55`,
        }}
      >
        <Icon className="w-5 h-5" style={{ color: pillar.accent }} />
      </div>
      <h4
        className="font-[Cinzel] text-lg tracking-wide mb-2"
        style={{ color: pillar.accent }}
      >
        {pillar.title}
      </h4>
      <p
        className="text-sm leading-relaxed text-zinc-300"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {pillar.body}
      </p>
    </motion.div>
  );
}

function ChapterPillars() {
  return (
    <section className="relative py-24 sm:py-32 border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <p
            className="text-[10px] tracking-[0.6em] text-amber-400/60 mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            03 · THE FOUR PILLARS
          </p>
          <h2 className="font-[Cinzel] text-3xl sm:text-5xl tracking-wide text-zinc-100">
            What makes the arena honest.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PILLARS.map((p, i) => (
            <PillarCard key={p.title} pillar={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Chapter 4 — The Campaign
// ────────────────────────────────────────────────────────────────────────────

function ChapterCampaign() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4, once: true });
  return (
    <section className="relative py-24 sm:py-32 border-t border-white/5 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 50%, rgba(139,26,26,0.18) 0%, transparent 55%), radial-gradient(circle at 80% 60%, rgba(212,168,84,0.10) 0%, transparent 55%)",
        }}
      />
      <div ref={ref} className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <p
          className="text-[10px] tracking-[0.6em] text-amber-400/60 mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          04 · THE CAMPAIGN
        </p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.6 }}
          className="font-[Cinzel] text-3xl sm:text-5xl tracking-wide text-zinc-100 mb-3"
        >
          Twenty-one trials.
        </motion.h2>
        <motion.h3
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-[Cinzel] text-3xl sm:text-5xl tracking-wide text-amber-300 mb-8"
          style={{ textShadow: "0 0 32px rgba(212,168,84,0.25)" }}
        >
          One judgmental narrator.
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg italic text-zinc-300/85 leading-relaxed mb-3"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Three acts per sin. Each boss carries a card you&apos;ll never see in
          PvP. The Forgemaster lifts the hammer. Mother Slumber breathes the
          room out. Cassivus does paperwork.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-sm italic text-zinc-500 mb-10"
          style={{ fontFamily: "var(--font-narrator)" }}
        >
          The narrator reserves a fresh contempt for your campaign run. Try not to disappoint.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
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
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Chapter 5 — The Threshold
// ────────────────────────────────────────────────────────────────────────────

function ChapterThreshold() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: true });
  return (
    <section className="relative py-32 sm:py-44 border-t border-white/5 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 100%, rgba(139,26,26,0.20) 0%, transparent 60%)",
        }}
      />
      <div ref={ref} className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-block mb-8"
        >
          <Skull className="w-12 h-12 text-amber-400/60" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-[Cinzel] text-4xl sm:text-6xl tracking-wide text-amber-300 leading-[1.1] mb-6"
          style={{ textShadow: "0 0 40px rgba(212,168,84,0.3)" }}
        >
          The cathedral
          <br />
          is unlocked.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base sm:text-lg italic text-zinc-300/85 leading-relaxed mb-10"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Free. Browser-based. No accounts required. No paywalls. Just you, six
          faction starter decks, and a narrator who is already disappointed.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7, delay: 0.3 }}
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
