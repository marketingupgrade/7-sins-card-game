/**
 * Game Rules Page — Comprehensive Rules Reference
 *
 * A dedicated reference page covering all game mechanics:
 * - Core game rules (HP, rounds, energy/corruption system)
 * - Turn structure (simultaneous lock-in, resolution order)
 * - Card mechanics (effects, tiers, costs)
 * - Compound patterns (standard, aggressive, slowburn)
 * - All 7 faction passives with detailed explanations
 * - Target modes and special mechanics
 * - Round 16 affliction doubling
 *
 * Dark gothic cathedral branding with mobile responsiveness.
 */

import { useState, memo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  SinType,
  PASSIVE_INFO,
  COMPOUND_TICKS,
  CompoundPattern,
  STARTING_HP,
  MAX_ROUNDS,
  HAND_SIZE,
  MAX_HAND_SIZE,
  CARDS_PER_DECK,
  MAX_ENERGY,
  STARTING_ENERGY,
  ENERGY_PER_TURN,
  SELECTION_TIMER_SECONDS,
  ROUND_16_DOUBLING,
  FINAL_RECKONING_ROUND,
  WRATH_VENGEANCE_PCT,
  SLOTH_ENDURANCE_MULT,
  SLOTH_ENDURANCE_CAP,
  SLOTH_ENDURANCE_AOE_MULT,
  GREED_TAX_PCT,
  ENVY_JEALOUSY_PCT,
  PRIDE_HUBRIS_MULT,
  LUST_TEMPTATION_PCT,
  GLUTTONY_DEVOURER_ENERGY,
} from "@shared/gameTypes";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import EmberField from "@/components/EmberField";
import { usePageMeta } from "@/hooks/usePageMeta";

/* ─── Faction Config ────────────────────────────────────────── */
const FACTIONS: SinType[] = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];

const FACTION_COLORS: Record<SinType, string> = {
  wrath: "#ef4444",
  sloth: "#a855f7",
  greed: "#eab308",
  envy: "#22c55e",
  pride: "#e2e2e2",
  lust: "#ec4899",
  gluttony: "#f97316",
};

const FACTION_LABELS: Record<SinType, string> = {
  wrath: "Wrath",
  sloth: "Sloth",
  greed: "Greed",
  envy: "Envy",
  pride: "Pride",
  lust: "Lust",
  gluttony: "Gluttony",
};

/* ─── Section Component ─────────────────────────────────────── */
function RuleSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-5">
          <span
            className="text-xs font-bold tracking-[0.3em] text-amber-500/40 uppercase"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {number}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-amber-500/15 to-transparent" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-bold text-white/85 mb-6"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h2>
        <div className="space-y-4">{children}</div>
      </motion.div>
    </section>
  );
}

/* ─── Stat Card ─────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
}) {
  return (
    <div
      className="rounded-lg p-3 sm:p-4 text-center"
      style={{
        background: "linear-gradient(135deg, rgba(15, 12, 10, 0.6), rgba(20, 15, 12, 0.3))",
        border: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      <div
        className="text-xl sm:text-2xl font-bold text-amber-200/70 mb-0.5"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {value}
      </div>
      <div className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
        {label}
      </div>
      {sublabel && <div className="text-[9px] text-white/20 mt-0.5">{sublabel}</div>}
    </div>
  );
}

/* ─── Compound Pattern Visualizer ───────────────────────────── */
const PatternVisualizer = memo(function PatternVisualizer({
  pattern,
  color,
  label,
  description,
}: {
  pattern: CompoundPattern;
  color: string;
  label: string;
  description: string;
}) {
  const ticks = COMPOUND_TICKS[pattern];
  const maxTick = Math.max(...ticks.slice(0, 7));

  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: "linear-gradient(135deg, rgba(15, 12, 10, 0.5), rgba(20, 15, 12, 0.3))",
        border: `1px solid ${color}15`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-sm font-bold" style={{ color, fontFamily: "var(--font-heading)" }}>
          {label}
        </span>
      </div>
      <p className="text-xs text-white/40 mb-3" style={{ fontFamily: "var(--font-body)" }}>
        {description}
      </p>
      {/* Bar chart visualization */}
      <div className="flex items-end gap-1 h-16">
        {ticks.slice(0, 7).map((tick, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div
              className="w-full rounded-t transition-all duration-300"
              style={{
                height: `${Math.max((tick / maxTick) * 100, 4)}%`,
                background: `${color}${Math.round(30 + (tick / maxTick) * 50).toString(16)}`,
                minHeight: "3px",
              }}
            />
            <span className="text-[8px] text-white/20 font-mono">{tick}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[8px] text-white/15">Tick 1</span>
        <span className="text-[8px] text-white/15">Tick 7</span>
      </div>
    </div>
  );
});

/* ─── Passive Card ──────────────────────────────────────────── */
function PassiveCard({ sin }: { sin: SinType }) {
  const passive = PASSIVE_INFO[sin];
  const color = FACTION_COLORS[sin];
  const [expanded, setExpanded] = useState(false);

  const passiveDetails: Record<SinType, { mechanic: string; value: string; trigger: string; synergy: string }> = {
    wrath: {
      mechanic: "Damage Reflection",
      value: `${(WRATH_VENGEANCE_PCT * 100).toFixed(1)}% of incoming damage reflected`,
      trigger: "When receiving damage from any source",
      synergy: "Self-damage cards create a glass cannon identity — opponents face reflected damage if they attack, but Wrath also hurts itself.",
    },
    sloth: {
      mechanic: "Shield Generation",
      value: `Shield = energy × hand size × ${SLOTH_ENDURANCE_MULT} (cap ${SLOTH_ENDURANCE_CAP}) + AOE damage = energy × ${SLOTH_ENDURANCE_AOE_MULT}`,
      trigger: "Start of every turn (100% activation)",
      synergy: "Rewards holding cards and conserving energy. Slowburn compound pattern ramps power over time while shields absorb early aggression. AOE damage punishes all enemies each turn based on stored energy.",
    },
    greed: {
      mechanic: "Damage-to-Shield Conversion",
      value: `${(GREED_TAX_PCT * 100).toFixed(1)}% of tick-2 compound damage becomes shield`,
      trigger: "On the second tick of compound damage dealt",
      synergy: "Steal effects (energy, heal, shield) combined with passive defense. Greed takes from others while building its own protection.",
    },
    envy: {
      mechanic: "Affliction Amplification",
      value: `${(ENVY_JEALOUSY_PCT * 100).toFixed(1)}% amplification of target's worst affliction`,
      trigger: "When dealing damage to a target with active afflictions",
      synergy: "33 affliction_amplify cards create exponential scaling. Apply afflictions early, then amplify them with every subsequent attack.",
    },
    pride: {
      mechanic: "Effect Multiplier",
      value: `×${PRIDE_HUBRIS_MULT} multiplier on all effects`,
      trigger: "When playing the highest-cost card in the round (ties count, ~45% activation)",
      synergy: "Highest average card cost with powerful high-cost cards. Build energy, then play expensive cards for massive multiplied effects.",
    },
    lust: {
      mechanic: "Lifesteal",
      value: `${(LUST_TEMPTATION_PCT * 100).toFixed(0)}% of compound tick damage healed as HP`,
      trigger: "On every compound damage tick dealt to opponents",
      synergy: "Combines damage with sustain. Heal_steal and heal_gain effects stack with passive lifesteal for a war of attrition.",
    },
    gluttony: {
      mechanic: "Energy from Destruction",
      value: `${GLUTTONY_DEVOURER_ENERGY.toFixed(3)} energy per card burned`,
      trigger: "Each card destroyed via discard_burn effects",
      synergy: "41 discard_burn cards destroy opponent resources while fueling Gluttony's energy. More energy means more burn cards played.",
    },
  };

  const details = passiveDetails[sin];

  return (
    <div
      className="rounded-lg overflow-hidden transition-all duration-200"
      style={{
        background: "linear-gradient(135deg, rgba(15, 12, 10, 0.5), rgba(20, 15, 12, 0.3))",
        border: `1px solid ${color}20`,
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <img src={SIN_ARCHETYPE_ICONS[sin]} alt={sin} className="w-7 h-7 sm:w-8 sm:h-8" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold" style={{ color, fontFamily: "var(--font-heading)" }}>
              {FACTION_LABELS[sin]}
            </span>
            <span className="text-xs text-white/30">—</span>
            <span
              className="text-xs font-semibold text-amber-200/60 uppercase tracking-wider"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {passive.name}
            </span>
          </div>
          <p className="text-xs text-white/40" style={{ fontFamily: "var(--font-body)" }}>
            {passive.description}
          </p>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-white/20 transition-transform duration-200 shrink-0 ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-2 border-t border-white/5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-white/30 block mb-0.5">Mechanic</span>
                  <span className="text-white/60">{details.mechanic}</span>
                </div>
                <div>
                  <span className="text-white/30 block mb-0.5">Value</span>
                  <span className="text-white/60 font-mono text-[11px]">{details.value}</span>
                </div>
                <div>
                  <span className="text-white/30 block mb-0.5">Trigger</span>
                  <span className="text-white/60">{details.trigger}</span>
                </div>
                <div>
                  <span className="text-white/30 block mb-0.5">Synergy</span>
                  <span className="text-white/60">{details.synergy}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Effect Type Row ───────────────────────────────────────── */
function EffectRow({
  name,
  category,
  categoryColor,
  description,
}: {
  name: string;
  category: string;
  categoryColor: string;
  description: string;
}) {
  return (
    <tr className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
      <td className="py-2.5 px-3 font-semibold text-white/70 text-xs sm:text-sm whitespace-nowrap" style={{ fontFamily: "var(--font-heading)" }}>
        {name}
      </td>
      <td className="py-2.5 px-3 hidden sm:table-cell">
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider"
          style={{ background: `${categoryColor}15`, color: categoryColor }}
        >
          {category}
        </span>
      </td>
      <td className="py-2.5 px-3 text-xs text-white/45" style={{ fontFamily: "var(--font-body)" }}>
        {description}
      </td>
    </tr>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function GameRules() {
  usePageMeta({
    title: "Game Rules — Complete Rulebook",
    description: "The complete rulebook for the 7 Deadly Sins Card Game. Energy system, card types, compound mechanics, passive abilities, and win conditions explained.",
    canonicalPath: "/rules",
  });

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-white relative overflow-hidden">
      {/* Background effects */}
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
      <header className="relative z-10 pt-16 pb-8 sm:pt-20 sm:pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/30" />
              <span
                className="text-[10px] tracking-[0.4em] text-amber-200/40 uppercase"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Codex of Sin
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/30" />
            </div>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide mb-3"
              style={{ fontFamily: "var(--font-heading)", color: "rgba(255, 255, 255, 0.9)" }}
            >
              Game Rules
            </h1>
            <p
              className="text-sm sm:text-base text-white/40 max-w-xl mx-auto leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              The complete reference for the 7 Deadly Sins card game — every mechanic, every faction,
              every compound pattern explained.
            </p>
          </motion.div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 px-4 pb-16">
        <div className="max-w-4xl mx-auto space-y-16">

          {/* ── I. Core Rules ── */}
          <RuleSection id="core" number="I" title="Core Rules">
            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
              <StatCard label="Starting HP" value={STARTING_HP} sublabel="per player" />
              <StatCard label="Max Rounds" value={MAX_ROUNDS} sublabel="per game" />
              <StatCard label="Players" value="4" sublabel="free-for-all" />
              <StatCard label="Cards/Deck" value={CARDS_PER_DECK} sublabel="per faction" />
            </div>

            <div className="prose-gothic text-sm text-white/50 space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                The 7 Deadly Sins is a <strong>4-player free-for-all</strong> card game where each player
                commands one of seven factions, each representing a deadly sin. Players start with{" "}
                <strong>{STARTING_HP} HP</strong> and battle over <strong>{MAX_ROUNDS} rounds</strong> using
                compound-ticking cards that escalate in power over time.
              </p>
              <p>
                The last player standing wins. If the game reaches <strong>round {FINAL_RECKONING_ROUND}</strong>,
                the <strong>Final Reckoning</strong> triggers: every surviving player plays <em>all remaining cards
                in their hand</em> simultaneously, regardless of energy cost. After all Reckoning effects resolve,
                the player with the <strong>highest remaining HP</strong> wins. There are no draws —
                tiebreakers use seat index (lower seat wins).
              </p>
              <p>
                Each player draws from a <strong>{CARDS_PER_DECK}-card faction deck</strong> and holds
                up to <strong>{HAND_SIZE} cards</strong> in hand (maximum hand size: <strong>{MAX_HAND_SIZE}</strong>). Cards are drawn at the start of each
                round. When the deck runs out, the discard pile is reshuffled into the deck.
              </p>
            </div>
          </RuleSection>

          {/* ── II. Corruption (Energy) System ── */}
          <RuleSection id="energy" number="II" title="Corruption (Energy) System">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
              <StatCard label="Starting Energy" value={STARTING_ENERGY} />
              <StatCard label="Per Round" value={`+${ENERGY_PER_TURN}`} sublabel="carry-over" />
              <StatCard label="Max Energy" value={MAX_ENERGY} />
            </div>

            <div className="prose-gothic text-sm text-white/50 space-y-3" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                Energy is themed as <strong>"Corruption"</strong> — the fuel of sin. Players start
                with <strong>{STARTING_ENERGY} energy</strong> and gain <strong>+{ENERGY_PER_TURN} per round</strong>,
                up to a maximum of <strong>{MAX_ENERGY}</strong>. Unspent energy carries over to the next round.
              </p>
              <p>
                Every card has a <strong>Corruption cost</strong> (0–6 range). You cannot play a card if you
                don't have enough Corruption. Managing your energy economy is critical — spending too aggressively
                leaves you vulnerable, while hoarding too long wastes potential.
              </p>
            </div>
          </RuleSection>

          {/* ── III. Turn Structure ── */}
          <RuleSection id="turns" number="III" title="Turn Structure">
            <div className="space-y-3">
              {[
                {
                  phase: "Selection",
                  icon: (<svg viewBox="0 0 32 32" className="w-8 h-8 sm:w-10 sm:h-10" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="2" width="20" height="28" rx="3" stroke="#d4a574" strokeWidth="1.5" /><path d="M11 8h10M11 12h10M11 16h6" stroke="#d4a574" strokeWidth="1.2" strokeLinecap="round" /><circle cx="22" cy="24" r="3" stroke="#d4a574" strokeWidth="1.2" /><path d="M22 22v4M20 24h4" stroke="#d4a574" strokeWidth="1" strokeLinecap="round" /><path d="M6 6l-2-2M26 6l2-2" stroke="#d4a574" strokeWidth="0.8" opacity="0.5" /><rect x="9" y="5" width="14" height="1" rx="0.5" fill="#d4a574" opacity="0.2" /></svg>),
                  time: `${SELECTION_TIMER_SECONDS}s timer`,
                  description: "All players choose cards simultaneously. Select 0 or more cards from your hand (limited by energy). Cards are locked in but hidden from opponents. Once any opponent locks in, a 10-second countdown starts — if time runs out, your current selection auto-locks.",
                },
                {
                  phase: "Resolution",
                  icon: (<svg viewBox="0 0 32 32" className="w-8 h-8 sm:w-10 sm:h-10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 4l8 8 8-8" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 28l8-8 8 8" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 8l8 8-8 8" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M28 8l-8 8 8 8" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="16" cy="16" r="3" stroke="#ef4444" strokeWidth="1.2" /><circle cx="16" cy="16" r="1" fill="#ef4444" /><path d="M16 6v4M16 22v4M6 16h4M22 16h4" stroke="#ef4444" strokeWidth="0.8" opacity="0.4" /></svg>),
                  time: "Automatic",
                  description: "Cards resolve one-by-one in priority order: (1) Skip-queue (priority) cards resolve first, (2) Lowest HP plays first (tiebreak: lowest seat index), (3) Within each player: lowest cost card first.",
                },
                {
                  phase: "Round End",
                  icon: (<svg viewBox="0 0 32 32" className="w-8 h-8 sm:w-10 sm:h-10" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="12" stroke="#a78bfa" strokeWidth="1.2" opacity="0.3" /><path d="M27 16a11 11 0 11-7.5-10.44" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" /><path d="M27 5v6h-6" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="16" cy="16" r="2" stroke="#a78bfa" strokeWidth="1" /><path d="M16 10v4" stroke="#a78bfa" strokeWidth="1" strokeLinecap="round" /><path d="M16 16l4 3" stroke="#a78bfa" strokeWidth="1" strokeLinecap="round" /><circle cx="16" cy="16" r="0.8" fill="#a78bfa" /></svg>),
                  time: "Automatic",
                  description: "Compound effects tick (applying their next multiplier), energy refreshes (+1), new cards are drawn to refill hand, round counter advances. Then back to Selection.",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex gap-3 sm:gap-4 rounded-lg p-3 sm:p-4"
                  style={{
                    background: "linear-gradient(135deg, rgba(15, 12, 10, 0.5), rgba(20, 15, 12, 0.3))",
                    border: "1px solid rgba(255, 255, 255, 0.04)",
                  }}
                >
                  <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center bg-white/[0.03]">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white/80" style={{ fontFamily: "var(--font-heading)" }}>
                        {step.phase}
                      </span>
                      <span className="text-[10px] text-amber-200/40 font-mono">{step.time}</span>
                    </div>
                    <p className="text-xs text-white/45 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </RuleSection>

          {/* ── IV. Compound Patterns ── */}
          <RuleSection id="compounds" number="IV" title="Compound Patterns">
            <div className="prose-gothic text-sm text-white/50 mb-6" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                <strong>All cards are compound.</strong> Each card has a compound pattern that determines how its
                effects scale over their duration. Each tick, the effect value = <code className="text-amber-200/50 bg-white/5 px-1 rounded text-xs">baseValue × pattern[tickIndex]</code>.
                Duration determines how many ticks occur.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <PatternVisualizer
                pattern="standard"
                color="#60a5fa"
                label="Standard"
                description="Fibonacci sequence [1,1,2,3,5,8,13...] — balanced scaling that accelerates over time."
              />
              <PatternVisualizer
                pattern="aggressive"
                color="#ef4444"
                label="Aggressive"
                description="Powers of 2 [1,2,4,8,16,32...] — explosive exponential growth for burst damage."
              />
              <PatternVisualizer
                pattern="slowburn"
                color="#a855f7"
                label="Slowburn"
                description="Flat curve [1,1,1,1,2,2,3...] — consistent pressure that slowly ramps up."
              />
            </div>

            <div
              className="mt-4 rounded-lg p-4 text-xs text-white/35"
              style={{
                background: "linear-gradient(135deg, rgba(15, 12, 10, 0.3), rgba(20, 15, 12, 0.2))",
                border: "1px solid rgba(255, 255, 255, 0.03)",
                fontFamily: "var(--font-body)",
              }}
            >
              <strong className="text-white/50">Example:</strong> A card with base value 5, standard pattern, and 4-tick duration
              deals: Tick 1 = 5×1 = 5, Tick 2 = 5×1 = 5, Tick 3 = 5×2 = 10, Tick 4 = 5×3 = 15.
              Total = 35 damage over 4 rounds.
            </div>
          </RuleSection>

          {/* ── V. Effect Types ── */}
          <RuleSection id="effects" number="V" title="Effect Types">
            <div className="prose-gothic text-sm text-white/50 mb-4" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                There are <strong>17 effect types</strong> across five categories. Each card can have
                one or more effects, each with its own duration, base value, and target mode.
              </p>
            </div>

            <div className="overflow-x-auto -mx-2 px-2 scrollbar-hide">
              <table className="w-full text-sm border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-amber-200/60 text-xs uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>Effect</th>
                    <th className="text-left py-2 px-3 text-amber-200/60 text-xs uppercase tracking-wider hidden sm:table-cell" style={{ fontFamily: "var(--font-heading)" }}>Category</th>
                    <th className="text-left py-2 px-3 text-amber-200/60 text-xs uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <EffectRow name="Damage" category="Offensive" categoryColor="#ef4444" description="Deal compound damage to target(s)" />
                  <EffectRow name="Self Damage" category="Offensive" categoryColor="#ef4444" description="Deal compound damage to self (Wrath specialty)" />
                  <EffectRow name="Affliction Amplify" category="Offensive" categoryColor="#ef4444" description="Increase base value of target's worst active affliction" />
                  <EffectRow name="Affliction Transfer" category="Offensive" categoryColor="#ef4444" description="Move your worst affliction to a target" />
                  <EffectRow name="Heal" category="Defensive" categoryColor="#22c55e" description="Heal self over time (compound ticking)" />
                  <EffectRow name="Shield" category="Defensive" categoryColor="#60a5fa" description="Gain shield over time (compound ticking, absorbs damage)" />
                  <EffectRow name="Heal Steal" category="Steal" categoryColor="#eab308" description="Steal HP from target — instant damage + heal" />
                  <EffectRow name="Shield Steal" category="Steal" categoryColor="#eab308" description="Steal shield from target — instant transfer" />
                  <EffectRow name="Energy Steal" category="Steal" categoryColor="#eab308" description="Steal energy from target — instant transfer" />
                  <EffectRow name="Heal Block" category="Control" categoryColor="#a855f7" description="Prevent target from healing for N rounds" />
                  <EffectRow name="Shield Block" category="Control" categoryColor="#a855f7" description="Prevent target from gaining shield for N rounds" />
                  <EffectRow name="Energy Block" category="Control" categoryColor="#a855f7" description="Prevent target from gaining energy for N rounds" />
                  <EffectRow name="Energy Gain" category="Utility" categoryColor="#f97316" description="Gain energy instantly (self)" />
                  <EffectRow name="Energy Regen" category="Utility" categoryColor="#f97316" description="Gain energy over multiple rounds (self)" />
                  <EffectRow name="Discard Burn" category="Utility" categoryColor="#f97316" description="Destroy cards from target's discard pile" />
                  <EffectRow name="Draw Boost" category="Utility" categoryColor="#f97316" description="Draw extra cards per turn" />
                  <EffectRow name="Draw Reduction" category="Utility" categoryColor="#f97316" description="Target draws fewer cards per turn" />
                </tbody>
              </table>
            </div>
          </RuleSection>

          {/* ── VI. Target Modes ── */}
          <RuleSection id="targeting" number="VI" title="Target Modes">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {[
                { mode: "Single", icon: (<svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color:"#ef4444"}}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></svg>), description: "Targets lowest-HP enemy (default)" },
                { mode: "Duo", icon: (<div className="flex -space-x-2"><svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color:"#ef4444"}}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></svg><svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color:"#ef4444"}}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></svg></div>), description: "Targets 2 lowest-HP enemies" },
                { mode: "AoE", icon: (<svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color:"#f59e0b"}}><path d="M12 2l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z" /><circle cx="12" cy="12" r="3" /></svg>), description: "Targets all enemies" },
                { mode: "Self", icon: (<svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color:"#a78bfa"}}><path d="M21 12a9 9 0 11-6.22-8.56" /><path d="M21 3v5h-5" /></svg>), description: "Targets the caster" },
              ].map((t) => (
                <div
                  key={t.mode}
                  className="rounded-lg p-3 text-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(15, 12, 10, 0.5), rgba(20, 15, 12, 0.3))",
                    border: "1px solid rgba(255, 255, 255, 0.04)",
                  }}
                >
                  <div className="text-lg mb-1">{t.icon}</div>
                  <div className="text-xs font-bold text-white/70 mb-0.5" style={{ fontFamily: "var(--font-heading)" }}>
                    {t.mode}
                  </div>
                  <div className="text-[10px] text-white/35">{t.description}</div>
                </div>
              ))}
            </div>
          </RuleSection>

          {/* ── VII. Card Tiers ── */}
          <RuleSection id="tiers" number="VII" title="Card Tiers">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { tier: "Common", color: "#9ca3af", count: 140, description: "Standard cards with moderate base values. The backbone of every deck." },
                { tier: "Rare", color: "#60a5fa", count: 154, description: "Enhanced cards with higher base values and longer durations." },
                { tier: "Epic", color: "#c084fc", count: 84, description: "Powerful cards with the highest base values and unique effect combinations." },
              ].map((t) => (
                <div
                  key={t.tier}
                  className="rounded-lg p-3 sm:p-4"
                  style={{
                    background: "linear-gradient(135deg, rgba(15, 12, 10, 0.5), rgba(20, 15, 12, 0.3))",
                    border: `1px solid ${t.color}20`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                    <span className="text-sm font-bold" style={{ color: t.color, fontFamily: "var(--font-heading)" }}>
                      {t.tier}
                    </span>
                  </div>
                  <div className="text-xs text-amber-200/40 font-mono mb-1">{t.count} cards</div>
                  <p className="text-[10px] sm:text-xs text-white/35 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    {t.description}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="mt-3 rounded-lg p-3 text-xs text-white/35"
              style={{
                background: "linear-gradient(135deg, rgba(15, 12, 10, 0.3), rgba(20, 15, 12, 0.2))",
                border: "1px solid rgba(255, 255, 255, 0.03)",
                fontFamily: "var(--font-body)",
              }}
            >
              <strong className="text-white/50">Priority Cards:</strong> 28 cards across all factions have the
              <span className="text-yellow-300/60 font-semibold"> skip-queue</span> property — they resolve
              before all normal cards in the resolution phase, regardless of HP or cost ordering.
            </div>
          </RuleSection>

          {/* ── VIII. Faction Passives ── */}
          <RuleSection id="passives" number="VIII" title="Faction Passives">
            <div className="prose-gothic text-sm text-white/50 mb-6" style={{ fontFamily: "var(--font-body)" }}>
              <p>
                Each faction has exactly <strong>one passive ability</strong> that triggers automatically during gameplay.
                Passives are the single most impactful factor in faction balance — they define each faction's
                strategic identity and determine how their cards should be played. Tap any faction below to see
                detailed mechanics.
              </p>
            </div>

            <div className="space-y-2">
              {FACTIONS.map((sin) => (
                <PassiveCard key={sin} sin={sin} />
              ))}
            </div>
          </RuleSection>

          {/* ── IX. Special Mechanics ── */}
          <RuleSection id="special" number="IX" title="Special Mechanics">
            <div className="space-y-3">
              <div
                className="rounded-lg p-4"
                style={{
                  background: "linear-gradient(135deg, rgba(30, 10, 10, 0.4), rgba(20, 15, 12, 0.3))",
                  border: "1px solid rgba(239, 68, 68, 0.15)",
                }}
              >
                <h4 className="text-sm font-bold text-red-400/80 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Round {ROUND_16_DOUBLING} — Affliction Doubling
                </h4>
                <p className="text-xs text-white/45 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  At round {ROUND_16_DOUBLING}, all active afflictions (damage-over-time effects) on all players
                  are <strong className="text-red-300/70">doubled</strong>. This creates a dramatic escalation in the late game,
                  punishing players who have accumulated many afflictions and rewarding those who maintained clean boards.
                  Afflictions can only be doubled once — the flag prevents re-doubling.
                </p>
              </div>

              <div
                className="rounded-lg p-4"
                style={{
                  background: "linear-gradient(135deg, rgba(40, 10, 5, 0.5), rgba(30, 15, 10, 0.4))",
                  border: "1px solid rgba(249, 115, 22, 0.25)",
                }}
              >
                <h4 className="text-sm font-bold text-orange-400/90 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Round {FINAL_RECKONING_ROUND} — The Final Reckoning
                </h4>
                <p className="text-xs text-white/45 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  If the game reaches round {FINAL_RECKONING_ROUND}, the <strong className="text-orange-300/80">Final Reckoning</strong> triggers.
                  Every surviving player plays <strong className="text-orange-300/80">all remaining cards in their hand</strong> simultaneously,
                  regardless of energy cost. All effects resolve, and the player with the <strong className="text-orange-300/80">highest HP</strong> wins.
                  This mechanic ensures every game has a decisive conclusion — no more timeouts. The Reckoning rewards players
                  who conserved powerful cards and maintained high HP through the late game. It flips the winner approximately
                  25% of the time, creating genuine comeback drama without being a coin flip.
                </p>
              </div>

              <div
                className="rounded-lg p-4"
                style={{
                  background: "linear-gradient(135deg, rgba(15, 12, 10, 0.4), rgba(20, 15, 12, 0.3))",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                }}
              >
                <h4 className="text-sm font-bold text-amber-200/70 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Deck Recycling
                </h4>
                <p className="text-xs text-white/45 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  When a player's draw deck is empty, their discard pile is shuffled and becomes the new draw deck.
                  This means cards burned by Gluttony's <span className="text-orange-300/60">discard_burn</span> effects
                  are permanently removed — they won't return when the deck recycles.
                </p>
              </div>

              <div
                className="rounded-lg p-4"
                style={{
                  background: "linear-gradient(135deg, rgba(15, 12, 10, 0.4), rgba(20, 15, 12, 0.3))",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                }}
              >
                <h4 className="text-sm font-bold text-amber-200/70 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Shield Mechanics
                </h4>
                <p className="text-xs text-white/45 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  Shield absorbs incoming damage before HP. Shield does not decay between rounds — it persists
                  until consumed by damage or stolen. Shield cannot exceed a player's maximum HP.
                  <span className="text-purple-300/60"> Shield Block</span> prevents all shield gain for its duration,
                  including passive shield generation.
                </p>
              </div>

              <div
                className="rounded-lg p-4"
                style={{
                  background: "linear-gradient(135deg, rgba(15, 12, 10, 0.4), rgba(20, 15, 12, 0.3))",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                }}
              >
                <h4 className="text-sm font-bold text-amber-200/70 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Elimination
                </h4>
                <p className="text-xs text-white/45 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  When a player's HP reaches 0, they are eliminated. Their active effects on other players
                  continue to tick — death does not remove applied afflictions. Eliminated players' remaining
                  locked cards for the current round are discarded without resolving.
                </p>
              </div>
            </div>
          </RuleSection>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/20" />
            <svg width="8" height="8" viewBox="0 0 12 12" className="text-amber-500/20">
              <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="currentColor" />
            </svg>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/20" />
          </div>
          <p className="text-center text-[10px] text-white/15" style={{ fontFamily: "var(--font-heading)" }}>
            7 Deadly Sins — Codex of Sin — v5 Rules Reference
          </p>
        </div>
      </footer>
    </div>
  );
}
