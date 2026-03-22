/**
 * How to Play — Interactive Visual Guide
 *
 * A step-by-step animated guide that teaches new players the core mechanics
 * of the 7 Deadly Sins card game. Each section uses visual diagrams,
 * animated examples, and concise text — not walls of rules.
 *
 * Sections:
 * 1. The Goal — survive or dominate
 * 2. Your Turn — the 3-phase loop
 * 3. Energy (Corruption) — spend to play
 * 4. Cards & Compound Patterns — the escalation system
 * 5. Targeting — who gets hit
 * 6. Factions — pick your sin
 * 7. Pro Tips — quick strategy advice
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, ArrowLeft, Zap, Heart, Shield, Swords, Target, Crown, Clock, Flame, BookOpen, Play, ChevronDown } from "lucide-react";
import EmberField from "@/components/EmberField";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
import { PASSIVE_INFO } from "@shared/gameTypes";
import type { SinType } from "@shared/gameTypes";

/* ─── Animated Section Wrapper ─── */
function Section({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`scroll-mt-24 ${className}`}
    >
      {children}
    </motion.section>
  );
}

/* ─── Section Header ─── */
function SectionHeader({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span
          className="text-xs tracking-[0.3em] text-amber-200/40 uppercase"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {number}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-amber-500/20 to-transparent" />
      </div>
      <h2
        className="text-2xl sm:text-3xl font-bold text-white/90 tracking-wide mb-2"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {title}
      </h2>
      <p className="text-sm text-white/45 leading-relaxed max-w-2xl" style={{ fontFamily: "var(--font-body)" }}>
        {subtitle}
      </p>
    </div>
  );
}

/* ─── Animated Energy Orbs Demo ─── */
function EnergyDemo() {
  const [energy, setEnergy] = useState(2);
  const [round, setRound] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setRound((r) => {
        if (r >= 7) {
          setIsPlaying(false);
          return 1;
        }
        return r + 1;
      });
      setEnergy((e) => Math.min(e + 1, 7));
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const reset = () => {
    setEnergy(2);
    setRound(1);
    setIsPlaying(false);
  };

  return (
    <div className="rounded-xl p-5 sm:p-6 border border-white/8 bg-black/40 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-amber-200/50 uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            Round {round}
          </p>
          <p className="text-sm text-white/60" style={{ fontFamily: "var(--font-body)" }}>
            {round === 1 ? "You start with 2 energy" : `+1 energy gained (${energy}/7)`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider border border-amber-500/30 text-amber-200/70 hover:bg-amber-500/10 transition-all"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {isPlaying ? "PAUSE" : "PLAY"}
          </button>
          <button
            onClick={reset}
            className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider border border-white/10 text-white/40 hover:bg-white/5 transition-all"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            RESET
          </button>
        </div>
      </div>

      {/* Energy orbs */}
      <div className="flex items-center gap-2 mb-3">
        {Array.from({ length: 7 }, (_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i < energy ? [1, 1.2, 1] : 1,
              opacity: i < energy ? 1 : 0.2,
            }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold"
            style={{
              borderColor: i < energy ? "oklch(0.75 0.15 85)" : "oklch(0.3 0.05 85 / 0.3)",
              background: i < energy
                ? "radial-gradient(circle, oklch(0.75 0.15 85 / 0.3), oklch(0.55 0.12 85 / 0.1))"
                : "transparent",
              color: i < energy ? "oklch(0.85 0.12 85)" : "oklch(0.4 0.05 85)",
              boxShadow: i < energy ? "0 0 12px oklch(0.75 0.15 85 / 0.3)" : "none",
            }}
          >
            {i + 1}
          </motion.div>
        ))}
      </div>

      {/* Cost examples */}
      <div className="flex gap-2 flex-wrap">
        {[
          { cost: 1, name: "Cheap card", playable: energy >= 1 },
          { cost: 3, name: "Mid card", playable: energy >= 3 },
          { cost: 5, name: "Expensive card", playable: energy >= 5 },
        ].map((card) => (
          <div
            key={card.cost}
            className={`px-3 py-2 rounded-lg border text-xs transition-all ${
              card.playable
                ? "border-green-500/30 bg-green-500/5 text-green-300/80"
                : "border-red-500/20 bg-red-500/5 text-red-300/40"
            }`}
            style={{ fontFamily: "var(--font-body)" }}
          >
            <span className="font-bold">{card.cost}</span> cost — {card.playable ? "Playable" : "Too expensive"}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Compound Pattern Visualizer ─── */
function CompoundDemo() {
  const [activePattern, setActivePattern] = useState<"standard" | "aggressive" | "slowburn">("standard");
  const [animTick, setAnimTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const patterns = {
    standard: { label: "Standard", color: "#60a5fa", multipliers: [1, 1, 2, 3, 5], desc: "Fibonacci — balanced growth" },
    aggressive: { label: "Aggressive", color: "#ef4444", multipliers: [1, 2, 4, 8, 16], desc: "Doubles each tick — explosive" },
    slowburn: { label: "Slowburn", color: "#a855f7", multipliers: [1, 1, 1, 1, 2], desc: "Flat then ramps — patient" },
  };

  const pat = patterns[activePattern];
  const baseValue = 5;

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setAnimTick((t) => {
        if (t >= pat.multipliers.length - 1) {
          setIsPlaying(false);
          return 0;
        }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, pat.multipliers.length]);

  return (
    <div className="rounded-xl p-5 sm:p-6 border border-white/8 bg-black/40 backdrop-blur-sm">
      {/* Pattern selector */}
      <div className="flex gap-2 mb-5">
        {(Object.keys(patterns) as Array<keyof typeof patterns>).map((key) => (
          <button
            key={key}
            onClick={() => { setActivePattern(key); setAnimTick(0); setIsPlaying(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider border transition-all ${
              activePattern === key
                ? "border-white/30 bg-white/10 text-white/90"
                : "border-white/8 text-white/40 hover:border-white/15"
            }`}
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {patterns[key].label}
          </button>
        ))}
      </div>

      {/* Visual bars */}
      <div className="space-y-2 mb-4">
        {pat.multipliers.map((mult, i) => {
          const value = baseValue * mult;
          const maxValue = baseValue * Math.max(...pat.multipliers);
          const widthPct = (value / maxValue) * 100;
          const isActive = i <= animTick;

          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-white/40 w-12 text-right font-mono" style={{ fontFamily: "var(--font-body)" }}>
                Tick {i + 1}
              </span>
              <div className="flex-1 h-7 bg-white/5 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isActive ? `${widthPct}%` : "0%" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: pat.color, opacity: isActive ? 1 : 0.2 }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white/80 drop-shadow-sm">
                  {isActive ? `${baseValue} × ${mult} = ${value}` : "—"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-white/40" style={{ fontFamily: "var(--font-body)" }}>
          {pat.desc}
        </p>
        <button
          onClick={() => { setAnimTick(0); setIsPlaying(true); }}
          className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider border border-amber-500/30 text-amber-200/70 hover:bg-amber-500/10 transition-all"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <Play className="w-3 h-3 inline mr-1" />
          ANIMATE
        </button>
      </div>

      {/* Total */}
      <div className="mt-3 pt-3 border-t border-white/5 text-center">
        <span className="text-sm font-bold" style={{ color: pat.color, fontFamily: "var(--font-heading)" }}>
          Total over {pat.multipliers.length} ticks: {baseValue * pat.multipliers.reduce((a, b) => a + b, 0)} damage
        </span>
        <p className="text-xs text-white/30 mt-1" style={{ fontFamily: "var(--font-body)" }}>
          from a single card with base value {baseValue}
        </p>
      </div>
    </div>
  );
}

/* ─── Turn Phase Diagram ─── */
function TurnPhaseDiagram() {
  const [activePhase, setActivePhase] = useState(0);

  const phases = [
    {
      name: "Selection",
      time: "30s",
      color: "oklch(0.75 0.15 85)",
      icon: <Swords className="w-5 h-5" />,
      desc: "Pick your cards and targets. Everyone chooses simultaneously — your picks are hidden until resolution.",
      tips: ["Select 0 or more cards from your hand", "Click opponents to assign targets", "Cards you can't afford are dimmed"],
    },
    {
      name: "Resolution",
      time: "Auto",
      color: "oklch(0.65 0.25 25)",
      icon: <Flame className="w-5 h-5" />,
      desc: "Cards resolve one by one. Priority cards go first, then lowest HP plays first. Watch the carnage unfold.",
      tips: ["Priority cards skip the queue", "Lowest HP resolves first (tiebreak: seat order)", "Lowest cost cards within a player resolve first"],
    },
    {
      name: "Round End",
      time: "Auto",
      color: "oklch(0.65 0.15 280)",
      icon: <Clock className="w-5 h-5" />,
      desc: "Compound effects tick (dealing their next multiplier). Energy refreshes. New cards are drawn. Next round begins.",
      tips: ["All active compound effects tick forward", "+1 energy gained (carries over)", "Draw cards to refill your hand"],
    },
  ];

  return (
    <div className="rounded-xl p-5 sm:p-6 border border-white/8 bg-black/40 backdrop-blur-sm">
      {/* Phase tabs */}
      <div className="flex gap-1 mb-5">
        {phases.map((phase, i) => (
          <button
            key={i}
            onClick={() => setActivePhase(i)}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 ${
              activePhase === i ? "bg-white/10 border border-white/20" : "border border-transparent text-white/40 hover:text-white/60"
            }`}
            style={{
              fontFamily: "var(--font-heading)",
              color: activePhase === i ? phases[i].color : undefined,
            }}
          >
            {phase.icon}
            {phase.name}
          </button>
        ))}
      </div>

      {/* Phase content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePhase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded border border-white/10 text-white/40">
              {phases[activePhase].time}
            </span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed mb-4" style={{ fontFamily: "var(--font-body)" }}>
            {phases[activePhase].desc}
          </p>
          <div className="space-y-2">
            {phases[activePhase].tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                  style={{ background: phases[activePhase].color }}
                />
                <span className="text-xs text-white/50" style={{ fontFamily: "var(--font-body)" }}>
                  {tip}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Phase flow arrow */}
      <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-white/5">
        {phases.map((phase, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="text-xs font-bold tracking-wider"
              style={{
                fontFamily: "var(--font-heading)",
                color: activePhase === i ? phase.color : "oklch(0.5 0 0 / 0.4)",
              }}
            >
              {phase.name}
            </span>
            {i < phases.length - 1 && <ArrowRight className="w-3 h-3 text-white/20" />}
          </div>
        ))}
        <ArrowRight className="w-3 h-3 text-white/20" />
        <span className="text-xs text-white/20" style={{ fontFamily: "var(--font-heading)" }}>Repeat</span>
      </div>
    </div>
  );
}

/* ─── Targeting Visual ─── */
function TargetingVisual() {
  const [mode, setMode] = useState<"single" | "duo" | "aoe" | "self">("single");

  const modes = {
    single: { label: "Single", color: "#ef4444", targets: [true, false, false], desc: "Hits the lowest-HP enemy" },
    duo: { label: "Duo", color: "#f59e0b", targets: [true, true, false], desc: "Hits the 2 lowest-HP enemies" },
    aoe: { label: "AoE", color: "#a855f7", targets: [true, true, true], desc: "Hits ALL enemies" },
    self: { label: "Self", color: "#22c55e", targets: [false, false, false], desc: "Targets yourself (heals, shields)" },
  };

  const m = modes[mode];

  return (
    <div className="rounded-xl p-5 sm:p-6 border border-white/8 bg-black/40 backdrop-blur-sm">
      {/* Mode selector */}
      <div className="flex gap-2 mb-5">
        {(Object.keys(modes) as Array<keyof typeof modes>).map((key) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider border transition-all ${
              mode === key
                ? "border-white/30 bg-white/10 text-white/90"
                : "border-white/8 text-white/40 hover:border-white/15"
            }`}
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {modes[key].label}
          </button>
        ))}
      </div>

      {/* Visual diagram */}
      <div className="flex items-center justify-center gap-6 sm:gap-10 mb-4">
        {/* You */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={mode === "self" ? { boxShadow: `0 0 20px ${m.color}40` } : {}}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: mode === "self" ? m.color : "oklch(0.75 0.12 85)",
              background: mode === "self"
                ? `radial-gradient(circle, ${m.color}20, transparent)`
                : "radial-gradient(circle, oklch(0.75 0.12 85 / 0.1), transparent)",
            }}
          >
            <Crown className="w-6 h-6" style={{ color: mode === "self" ? m.color : "oklch(0.75 0.12 85)" }} />
          </motion.div>
          <span className="text-xs font-bold text-amber-200/60" style={{ fontFamily: "var(--font-heading)" }}>YOU</span>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ x: mode === "self" ? -20 : [0, 8, 0] }}
            transition={{ duration: 1, repeat: mode === "self" ? 0 : Infinity }}
          >
            {mode === "self" ? (
              <div className="w-8 h-8 rounded-full border border-dashed border-green-500/30 flex items-center justify-center">
                <ArrowLeft className="w-4 h-4 text-green-400/50" />
              </div>
            ) : (
              <ArrowRight className="w-6 h-6" style={{ color: m.color }} />
            )}
          </motion.div>
        </div>

        {/* Opponents */}
        <div className="flex gap-3">
          {["Opp 1", "Opp 2", "Opp 3"].map((name, i) => (
            <motion.div
              key={i}
              animate={
                m.targets[i]
                  ? { scale: [1, 1.1, 1], boxShadow: `0 0 15px ${m.color}40` }
                  : { scale: 1, boxShadow: "none" }
              }
              transition={{ duration: 0.8, repeat: m.targets[i] ? Infinity : 0 }}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center transition-all"
                style={{
                  borderColor: m.targets[i] ? m.color : "oklch(0.3 0.02 280 / 0.3)",
                  background: m.targets[i]
                    ? `radial-gradient(circle, ${m.color}15, transparent)`
                    : "transparent",
                  opacity: mode === "self" ? 0.3 : m.targets[i] ? 1 : 0.3,
                }}
              >
                <Target className="w-5 h-5" style={{ color: m.targets[i] ? m.color : "oklch(0.4 0.02 280)" }} />
              </div>
              <span className="text-[10px] text-white/30" style={{ fontFamily: "var(--font-heading)" }}>{name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <p className="text-sm text-white/50 text-center" style={{ fontFamily: "var(--font-body)" }}>
        {m.desc}
      </p>
    </div>
  );
}

/* ─── Faction Quick Cards ─── */
function FactionQuickGuide() {
  const [activeSin, setActiveSin] = useState<SinType>("wrath");

  const factions: { sin: SinType; name: string; color: string; playstyle: string; difficulty: string }[] = [
    { sin: "wrath", name: "Wrath", color: "var(--color-wrath)", playstyle: "Glass cannon — high risk, high damage. Reflects damage back at attackers.", difficulty: "Medium" },
    { sin: "sloth", name: "Sloth", color: "var(--color-sloth)", playstyle: "Tank — builds shields from patience. Outlasts everyone with slowburn cards.", difficulty: "Easy" },
    { sin: "greed", name: "Greed", color: "var(--color-greed)", playstyle: "Thief — steals energy, HP, and shields. Converts damage dealt into defense.", difficulty: "Medium" },
    { sin: "envy", name: "Envy", color: "var(--color-envy)", playstyle: "Debuffer — amplifies afflictions on targets. Exponential scaling over time.", difficulty: "Hard" },
    { sin: "pride", name: "Pride", color: "var(--color-pride)", playstyle: "High roller — gets a damage multiplier when playing the most expensive card.", difficulty: "Hard" },
    { sin: "lust", name: "Lust", color: "var(--color-lust)", playstyle: "Sustain — heals from every point of damage dealt. War of attrition specialist.", difficulty: "Easy" },
    { sin: "gluttony", name: "Gluttony", color: "var(--color-gluttony)", playstyle: "Destroyer — burns opponent cards permanently. Gains energy from destruction.", difficulty: "Medium" },
  ];

  const active = factions.find((f) => f.sin === activeSin)!;
  const passive = PASSIVE_INFO[activeSin];

  return (
    <div className="rounded-xl border border-white/8 bg-black/40 backdrop-blur-sm overflow-hidden">
      {/* Faction selector — horizontal scroll on mobile */}
      <div className="flex overflow-x-auto gap-1 p-2 border-b border-white/5 scrollbar-thin">
        {factions.map((f) => (
          <button
            key={f.sin}
            onClick={() => setActiveSin(f.sin)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold tracking-wider whitespace-nowrap transition-all shrink-0 ${
              activeSin === f.sin
                ? "bg-white/10 border border-white/20"
                : "border border-transparent text-white/40 hover:text-white/60"
            }`}
            style={{
              fontFamily: "var(--font-heading)",
              color: activeSin === f.sin ? f.color : undefined,
            }}
          >
            <img src={SIN_ARCHETYPE_ICONS[f.sin]} alt="" className="w-4 h-4" />
            {f.name}
          </button>
        ))}
      </div>

      {/* Faction detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSin}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="p-5 sm:p-6"
        >
          <div className="flex gap-4 sm:gap-6">
            {/* Portrait */}
            <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-lg overflow-hidden border border-white/10 shrink-0">
              <img
                src={FACTION_PORTRAITS[activeSin]}
                alt={active.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3
                className="text-lg font-bold tracking-wider mb-1"
                style={{ fontFamily: "var(--font-heading)", color: active.color }}
              >
                {active.name}
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider ${
                    active.difficulty === "Easy"
                      ? "bg-green-500/10 text-green-400/70 border border-green-500/20"
                      : active.difficulty === "Hard"
                        ? "bg-red-500/10 text-red-400/70 border border-red-500/20"
                        : "bg-amber-500/10 text-amber-400/70 border border-amber-500/20"
                  }`}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {active.difficulty}
                </span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed mb-3" style={{ fontFamily: "var(--font-body)" }}>
                {active.playstyle}
              </p>

              {/* Passive */}
              <div className="p-2.5 rounded-lg border border-white/5 bg-white/[0.02]">
                <p className="text-[10px] text-amber-200/50 uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                  {passive.icon} Passive: {passive.name}
                </p>
                <p className="text-xs text-white/40 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  {passive.description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─── Pro Tips ─── */
function ProTips() {
  const tips = [
    { icon: <Zap className="w-4 h-4" />, color: "oklch(0.75 0.15 85)", title: "Save energy for combos", body: "Don't spend everything every round. Saving 1-2 energy lets you play expensive cards next turn for devastating combos." },
    { icon: <Shield className="w-4 h-4" />, color: "oklch(0.65 0.15 195)", title: "Shields persist", body: "Shield doesn't decay between rounds. Building shield early creates a buffer that absorbs multiple attacks." },
    { icon: <Target className="w-4 h-4" />, color: "oklch(0.65 0.25 25)", title: "Focus fire", body: "Eliminating one player early is usually better than spreading damage. A 3v1 endgame is much easier than a 2v2." },
    { icon: <Clock className="w-4 h-4" />, color: "oklch(0.65 0.15 280)", title: "Compound cards are investments", body: "A 3-tick card played in round 2 deals damage in rounds 2, 3, AND 4. Early compound cards have the highest total value." },
    { icon: <Flame className="w-4 h-4" />, color: "oklch(0.65 0.2 55)", title: "Watch the Reckoning", body: "If the game reaches round 20, ALL remaining cards in hand are played at once. Save powerful cards for a potential Reckoning." },
    { icon: <Heart className="w-4 h-4" />, color: "oklch(0.65 0.25 350)", title: "Passing is a strategy", body: "If you can't afford any good cards, pass. Your compound effects still tick, and you'll have more energy next round." },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {tips.map((tip, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="rounded-xl p-4 border border-white/5 bg-black/30 hover:bg-black/40 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `${tip.color}15`, color: tip.color }}
            >
              {tip.icon}
            </div>
            <h4 className="text-sm font-bold text-white/80" style={{ fontFamily: "var(--font-heading)" }}>
              {tip.title}
            </h4>
          </div>
          <p className="text-xs text-white/40 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
            {tip.body}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Table of Contents ─── */
function TableOfContents() {
  const sections = [
    { id: "goal", label: "The Goal", number: "I" },
    { id: "turns", label: "Your Turn", number: "II" },
    { id: "energy", label: "Energy", number: "III" },
    { id: "cards", label: "Cards & Compounds", number: "IV" },
    { id: "targeting", label: "Targeting", number: "V" },
    { id: "factions", label: "Factions", number: "VI" },
    { id: "tips", label: "Pro Tips", number: "VII" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider border border-white/8 text-white/40 hover:text-white/70 hover:border-white/20 hover:bg-white/5 transition-all"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span className="text-amber-200/40 mr-1.5">{s.number}</span>
          {s.label}
        </a>
      ))}
    </div>
  );
}

/* ═══ MAIN PAGE ═══ */
export default function HowToPlay() {
  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-white relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <EmberField count={12} />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Hero */}
      <header className="relative z-10 pt-16 pb-6 sm:pt-20 sm:pb-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/30" />
              <BookOpen className="w-4 h-4 text-amber-200/40" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/30" />
            </div>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide mb-3"
              style={{ fontFamily: "var(--font-heading)", color: "rgba(255, 255, 255, 0.9)" }}
            >
              How to Play
            </h1>
            <p
              className="text-sm sm:text-base text-white/40 max-w-xl mx-auto leading-relaxed mb-8"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Learn the core mechanics in 5 minutes. Interactive examples, animated diagrams, zero walls of text.
            </p>

            <TableOfContents />

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-8"
            >
              <ChevronDown className="w-5 h-5 text-white/20 mx-auto" />
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 px-4 pb-16">
        <div className="max-w-3xl mx-auto space-y-20">

          {/* ── I. The Goal ── */}
          <Section id="goal">
            <SectionHeader
              number="I"
              title="The Goal"
              subtitle="Survive. Eliminate. Dominate."
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="rounded-xl p-4 border border-white/8 bg-black/40 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white/80 mb-1" style={{ fontFamily: "var(--font-heading)" }}>333 HP</p>
                <p className="text-xs text-white/40" style={{ fontFamily: "var(--font-body)" }}>Starting health</p>
              </div>
              <div className="rounded-xl p-4 border border-white/8 bg-black/40 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
                  <Swords className="w-6 h-6 text-amber-400" />
                </div>
                <p className="text-2xl font-bold text-white/80 mb-1" style={{ fontFamily: "var(--font-heading)" }}>4 Players</p>
                <p className="text-xs text-white/40" style={{ fontFamily: "var(--font-body)" }}>Free-for-all</p>
              </div>
              <div className="rounded-xl p-4 border border-white/8 bg-black/40 text-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white/80 mb-1" style={{ fontFamily: "var(--font-heading)" }}>20 Rounds</p>
                <p className="text-xs text-white/40" style={{ fontFamily: "var(--font-body)" }}>Max game length</p>
              </div>
            </div>
            <div className="rounded-xl p-5 border border-white/8 bg-black/40">
              <p className="text-sm text-white/60 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                <strong className="text-white/80">Be the last sinner standing.</strong> Four players pick sin factions, draw cards, and battle over 20 rounds.
                Reduce opponents to 0 HP to eliminate them. If the game reaches round 20, the <strong className="text-orange-300/70">Final Reckoning</strong> triggers:
                every player plays ALL remaining cards at once, and the highest HP wins. No draws, no mercy.
              </p>
            </div>
          </Section>

          {/* ── II. Your Turn ── */}
          <Section id="turns">
            <SectionHeader
              number="II"
              title="Your Turn"
              subtitle="Every round has three phases. Here's the loop."
            />
            <TurnPhaseDiagram />
          </Section>

          {/* ── III. Energy ── */}
          <Section id="energy">
            <SectionHeader
              number="III"
              title="Corruption (Energy)"
              subtitle="The fuel of sin. Spend it to play cards."
            />
            <EnergyDemo />
            <div className="mt-4 rounded-xl p-4 border border-amber-500/10 bg-amber-500/5">
              <p className="text-xs text-amber-200/60 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                <strong className="text-amber-200/80">Key insight:</strong> Unspent energy carries over. If you have 3 energy and spend 1,
                you'll have 3 energy next round (2 carried + 1 gained). Saving energy lets you play expensive cards later.
              </p>
            </div>
          </Section>

          {/* ── IV. Cards & Compounds ── */}
          <Section id="cards">
            <SectionHeader
              number="IV"
              title="Cards & Compound Patterns"
              subtitle="Every card escalates over time. Play once, deal damage for multiple rounds."
            />
            <CompoundDemo />
            <div className="mt-4 rounded-xl p-4 border border-white/5 bg-black/30">
              <p className="text-xs text-white/50 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                <strong className="text-white/70">How it works:</strong> When you play a card, it creates a compound effect that ticks each round.
                The base value is multiplied by the pattern's multiplier for that tick. A Standard card with base 5 deals: 5, 5, 10, 15 over 4 rounds = 35 total damage from one card play.
              </p>
            </div>
          </Section>

          {/* ── V. Targeting ── */}
          <Section id="targeting">
            <SectionHeader
              number="V"
              title="Targeting"
              subtitle="Who gets hit depends on the card's target mode."
            />
            <TargetingVisual />
          </Section>

          {/* ── VI. Factions ── */}
          <Section id="factions">
            <SectionHeader
              number="VI"
              title="The Seven Factions"
              subtitle="Each sin has a unique passive ability and playstyle. Pick the one that fits you."
            />
            <FactionQuickGuide />
          </Section>

          {/* ── VII. Pro Tips ── */}
          <Section id="tips">
            <SectionHeader
              number="VII"
              title="Pro Tips"
              subtitle="Advice from the cathedral's most seasoned sinners."
            />
            <ProTips />
          </Section>

          {/* ── CTA ── */}
          <div className="text-center pt-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/20" />
              <span className="text-xs tracking-[0.3em] text-amber-200/40 uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                Ready?
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/20" />
            </div>
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold tracking-wider cursor-pointer"
                style={{
                  fontFamily: "var(--font-heading)",
                  background: "linear-gradient(135deg, oklch(0.75 0.15 85), oklch(0.65 0.18 70))",
                  color: "oklch(0.10 0.02 70)",
                  boxShadow: "0 0 20px oklch(0.75 0.15 85 / 0.3)",
                }}
              >
                <Swords className="w-5 h-5" />
                START PLAYING
              </motion.div>
            </Link>
            <div className="mt-4">
              <Link
                href="/rules"
                className="text-xs text-white/30 hover:text-white/50 transition-colors underline underline-offset-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Want the full rulebook? View Game Rules
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
