/**
 * ResolutionReveal v3 — AAA Animated Card-Play Sequence
 *
 * Each card resolves with a cinematic sequence:
 *   1. Player announcement banner slides in
 *   2. Card flies in from the caster's direction
 *   3. Faction-themed projectile launches toward target(s)
 *   4. Impact flash + floating damage numbers + screen shake
 *   5. Effect badges appear on target
 *   6. Smooth transition to next card
 *
 * Resolve order: skipQueue first → lowest HP → lowest seat → lowest cost
 */

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { CARD_MAP } from "@shared/cardData";
import { LockedPlay, SinType, PlayerState } from "@shared/gameTypes";
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
import { CARD_ART_URLS } from "@/lib/cardArtUrls";
import { soundEngine } from "@/lib/soundEngine";

/* ─── Faction Theme Config ─────────────────────────────────── */
const FACTION_THEMES: Record<string, {
  color: string;
  glow: string;
  particleEmoji: string;
  projectileGradient: string;
}> = {
  wrath:    { color: "#ef4444", glow: "rgba(239,68,68,0.6)",   particleEmoji: "🔥", projectileGradient: "linear-gradient(90deg, #ef4444, #f97316, #fbbf24)" },
  sloth:    { color: "#8b5cf6", glow: "rgba(139,92,246,0.6)",  particleEmoji: "💀", projectileGradient: "linear-gradient(90deg, #8b5cf6, #6d28d9, #4c1d95)" },
  greed:    { color: "#eab308", glow: "rgba(234,179,8,0.6)",   particleEmoji: "✨", projectileGradient: "linear-gradient(90deg, #eab308, #f59e0b, #fbbf24)" },
  envy:     { color: "#22c55e", glow: "rgba(34,197,94,0.6)",   particleEmoji: "🐍", projectileGradient: "linear-gradient(90deg, #22c55e, #16a34a, #15803d)" },
  pride:    { color: "#d946ef", glow: "rgba(217,70,239,0.6)",  particleEmoji: "👑", projectileGradient: "linear-gradient(90deg, #d946ef, #a855f7, #7c3aed)" },
  lust:     { color: "#ec4899", glow: "rgba(236,72,153,0.6)",  particleEmoji: "💋", projectileGradient: "linear-gradient(90deg, #ec4899, #f43f5e, #e11d48)" },
  gluttony: { color: "#f97316", glow: "rgba(249,115,22,0.6)",  particleEmoji: "🦷", projectileGradient: "linear-gradient(90deg, #f97316, #ea580c, #c2410c)" },
};

/* ─── Effect Visual Config ─────────────────────────────────── */
const EFFECT_VISUALS: Record<string, { icon: string; color: string; label: string }> = {
  damage:              { icon: "⚔️", color: "#ef4444", label: "DMG" },
  self_damage:         { icon: "💥", color: "#f97316", label: "SELF-DMG" },
  heal_gain:           { icon: "💚", color: "#22c55e", label: "HEAL" },
  heal_steal:          { icon: "🩸", color: "#a855f7", label: "SIPHON" },
  shield_gain:         { icon: "🛡️", color: "#3b82f6", label: "SHIELD" },
  shield_steal:        { icon: "💎", color: "#06b6d4", label: "CRACK" },
  energy_gain:         { icon: "⚡", color: "#eab308", label: "ENERGY" },
  energy_steal:        { icon: "🔋", color: "#f59e0b", label: "DRAIN" },
  heal_block:          { icon: "🚫", color: "#dc2626", label: "CURSED" },
  shield_block:        { icon: "💔", color: "#9333ea", label: "SHATTER" },
  energy_block:        { icon: "🔇", color: "#6b7280", label: "EXHAUST" },
  affliction_amplify:  { icon: "☠️", color: "#dc2626", label: "INTENSIFY" },
  affliction_transfer: { icon: "↪️", color: "#f59e0b", label: "REDIRECT" },
};

/* ─── Animation Phase ──────────────────────────────────────── */
type AnimPhase = "idle" | "announce" | "card_enter" | "projectile" | "impact" | "effects" | "exit";

/* ─── Particle Component ───────────────────────────────────── */
function ImpactParticles({ color, count = 12 }: { color: string; count?: number }) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (360 / count) * i + (Math.random() * 30 - 15),
      distance: 40 + Math.random() * 60,
      size: 3 + Math.random() * 4,
      delay: Math.random() * 0.1,
    })), [count]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          animate={{
            opacity: 0,
            scale: 0,
            x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
            y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
          }}
          transition={{ duration: 0.6, delay: p.delay, ease: "easeOut" }}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: color,
            boxShadow: `0 0 6px ${color}`,
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Floating Damage Number ───────────────────────────────── */
function FloatingNumber({ value, color, icon, delay = 0 }: { value: string; color: string; icon: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: [0, 1, 1, 0], y: -50, scale: [0.5, 1.2, 1, 0.8] }}
      transition={{ duration: 1.2, delay, ease: "easeOut" }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none z-50"
    >
      <span className="text-lg">{icon}</span>
      <span
        className="text-xl font-black tabular-nums"
        style={{
          color,
          fontFamily: "var(--font-heading)",
          textShadow: `0 0 10px ${color}, 0 2px 4px rgba(0,0,0,0.8)`,
        }}
      >
        {value}
      </span>
    </motion.div>
  );
}

/* ─── Projectile Trail ─────────────────────────────────────── */
function ProjectileTrail({ gradient, delay = 0 }: { gradient: string; delay?: number }) {
  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 1, 0.8, 0] }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 origin-left rounded-full"
      style={{ background: gradient, filter: "blur(1px)" }}
    />
  );
}

/* ─── Main Component ───────────────────────────────────────── */
interface ResolutionRevealProps {
  lockedPlays: LockedPlay[];
  players: PlayerState[];
  currentRound: number;
  isResolving: boolean;
  onComplete?: () => void;
}

export default function ResolutionReveal({
  lockedPlays,
  players,
  currentRound,
  isResolving,
  onComplete,
}: ResolutionRevealProps) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [phase, setPhase] = useState<AnimPhase>("idle");
  const [screenShake, setScreenShake] = useState(false);
  const [showImpactParticles, setShowImpactParticles] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasStartedRef = useRef(false);
  const completedRef = useRef(false);

  // Sort plays matching gameEngine resolve order
  const sortedPlays = useMemo(() => {
    if (!lockedPlays || lockedPlays.length === 0) return [];
    return [...lockedPlays]
      .filter((p) => !("pass" in p) && p.cardId)
      .sort((a, b) => {
        if (a.skipQueue && !b.skipQueue) return -1;
        if (!a.skipQueue && b.skipQueue) return 1;
        const playerA = players.find((p) => p.id === a.playerId);
        const playerB = players.find((p) => p.id === b.playerId);
        const hpA = playerA?.currentHp ?? 999;
        const hpB = playerB?.currentHp ?? 999;
        if (hpA !== hpB) return hpA - hpB;
        const seatA = playerA?.seatIndex ?? 999;
        const seatB = playerB?.seatIndex ?? 999;
        if (seatA !== seatB) return seatA - seatB;
        const cardA = CARD_MAP[a.cardId];
        const cardB = CARD_MAP[b.cardId];
        return (cardA?.cost ?? 0) - (cardB?.cost ?? 0);
      });
  }, [lockedPlays, players]);

  // Clear all timers
  const clearTimers = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  }, []);

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timerRef.current.push(id);
    return id;
  }, []);

  // Animate a single card play
  const animateCard = useCallback((idx: number) => {
    if (idx >= sortedPlays.length) {
      // All cards resolved — finish
      setPhase("idle");
      setCurrentIndex(-1);
      completedRef.current = true;
      addTimer(() => onComplete?.(), 600);
      return;
    }

    setCurrentIndex(idx);

    // Phase 1: Announce (player banner)
    setPhase("announce");
    try { soundEngine.play("card_play"); } catch {}

    // Phase 2: Card enters (400ms after announce)
    addTimer(() => setPhase("card_enter"), 400);

    // Phase 3: Projectile launches (800ms after announce)
    addTimer(() => setPhase("projectile"), 900);

    // Phase 4: Impact (1200ms after announce)
    addTimer(() => {
      setPhase("impact");
      setScreenShake(true);
      setShowImpactParticles(true);
      addTimer(() => setScreenShake(false), 300);
      addTimer(() => setShowImpactParticles(false), 800);
    }, 1300);

    // Phase 5: Show effect badges (1500ms)
    addTimer(() => setPhase("effects"), 1600);

    // Phase 6: Exit and move to next (2400ms)
    addTimer(() => {
      setPhase("exit");
      addTimer(() => animateCard(idx + 1), 400);
    }, 2600);
  }, [sortedPlays, addTimer, onComplete]);

  // Start animation sequence
  useEffect(() => {
    if (!isResolving || sortedPlays.length === 0) {
      if (!isResolving) {
        setCurrentIndex(-1);
        setPhase("idle");
        hasStartedRef.current = false;
        completedRef.current = false;
        clearTimers();
      }
      return;
    }

    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    completedRef.current = false;

    // Small delay before starting
    addTimer(() => animateCard(0), 500);

    return () => clearTimers();
  }, [isResolving, sortedPlays, animateCard, clearTimers, addTimer]);

  // Reset on round change
  useEffect(() => {
    hasStartedRef.current = false;
    completedRef.current = false;
    setCurrentIndex(-1);
    setPhase("idle");
    clearTimers();
  }, [currentRound, clearTimers]);

  if (!isResolving || sortedPlays.length === 0) return null;

  const currentPlay = currentIndex >= 0 && currentIndex < sortedPlays.length ? sortedPlays[currentIndex] : null;
  const currentCard = currentPlay ? CARD_MAP[currentPlay.cardId] : null;
  const caster = currentPlay ? players.find((p) => p.id === currentPlay.playerId) : null;
  const target = currentPlay?.targetPlayerId ? players.find((p) => p.id === currentPlay.targetPlayerId) : null;
  const sin = (caster?.chosenSin || "wrath") as string;
  const theme = FACTION_THEMES[sin] || FACTION_THEMES.wrath;
  const isAoE = currentCard?.effects.some((e) => e.targetMode === "aoe");
  const isSelf = currentCard?.effects.every((e) => e.targetMode === "self");

  // Compute effect summary for damage numbers
  const effectSummary = useMemo(() => {
    if (!currentCard) return [];
    return currentCard.effects.map((eff) => {
      const vis = EFFECT_VISUALS[eff.type] || { icon: "⚡", color: "#fff", label: eff.type };
      const value = eff.baseValue;
      const prefix = ["damage", "self_damage", "heal_steal", "shield_steal", "energy_steal", "affliction_amplify"].includes(eff.type) ? "-" : "+";
      return { ...vis, value: `${prefix}${value}`, type: eff.type };
    });
  }, [currentCard]);

  return (
    <motion.div
      animate={screenShake ? { x: [0, -4, 4, -3, 3, 0], y: [0, 2, -2, 1, -1, 0] } : { x: 0, y: 0 }}
      transition={screenShake ? { duration: 0.3, ease: "easeInOut" } : { duration: 0.1 }}
      className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none overflow-hidden"
    >
      {/* Backdrop — dark vignette with faction tint */}
      <AnimatePresence>
        {phase !== "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, ${theme.color}08 0%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.7) 100%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Progress bar — thin line at top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 z-50">
        <motion.div
          animate={{ width: `${((currentIndex + 1) / sortedPlays.length) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full"
          style={{ background: theme.projectileGradient }}
        />
      </div>

      {/* Resolve counter — top right */}
      <div className="absolute top-2 right-3 z-50">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.7, scale: 1 }}
          className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {Math.max(0, currentIndex + 1)}/{sortedPlays.length}
        </motion.span>
      </div>

      {/* ─── ANNOUNCE PHASE: Player banner ─── */}
      <AnimatePresence mode="wait">
        {(phase === "announce" || phase === "card_enter") && caster && (
          <motion.div
            key={`announce-${currentIndex}`}
            initial={{ opacity: 0, x: -60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-4 py-2 rounded-full z-40"
            style={{
              background: `linear-gradient(135deg, ${theme.color}30, ${theme.color}10)`,
              border: `1px solid ${theme.color}50`,
              backdropFilter: "blur(12px)",
              boxShadow: `0 0 30px ${theme.color}20, 0 4px 20px rgba(0,0,0,0.4)`,
            }}
          >
            <div
              className="w-7 h-7 rounded-full overflow-hidden border-2 flex-shrink-0"
              style={{ borderColor: theme.color, boxShadow: `0 0 8px ${theme.glow}` }}
            >
              <img
                src={FACTION_PORTRAITS[caster.chosenSin as SinType]}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <span
              className="text-sm font-black uppercase tracking-wider"
              style={{ color: theme.color, fontFamily: "var(--font-heading)", textShadow: `0 0 10px ${theme.glow}` }}
            >
              {caster.username}
            </span>
            {currentPlay?.skipQueue && (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-500/30 text-red-300 border border-red-500/30">
                PRIORITY
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CARD ENTER: Card flies in from below ─── */}
      <AnimatePresence mode="wait">
        {phase !== "idle" && phase !== "announce" && currentCard && (
          <motion.div
            key={`card-${currentIndex}`}
            initial={{ opacity: 0, y: 120, scale: 0.6, rotateY: -15 }}
            animate={
              phase === "exit"
                ? { opacity: 0, y: -80, scale: 0.7, rotateY: 10 }
                : { opacity: 1, y: 0, scale: 1, rotateY: 0 }
            }
            transition={
              phase === "exit"
                ? { duration: 0.35, ease: [0.4, 0, 1, 1] }
                : { type: "spring", stiffness: 350, damping: 28, mass: 0.8 }
            }
            className="relative flex flex-col items-center gap-3"
            style={{ perspective: 1200 }}
          >
            {/* Card body */}
            <motion.div
              animate={
                phase === "impact"
                  ? { scale: [1, 1.08, 0.97, 1], rotate: [0, -2, 2, 0] }
                  : { scale: 1 }
              }
              transition={{ duration: 0.3 }}
              className="relative w-36 h-52 md:w-44 md:h-60 rounded-xl overflow-hidden"
              style={{
                border: `2px solid ${theme.color}80`,
                boxShadow: `
                  0 0 40px ${theme.color}30,
                  0 0 80px ${theme.color}10,
                  0 20px 60px rgba(0,0,0,0.6),
                  inset 0 1px 0 rgba(255,255,255,0.1)
                `,
              }}
            >
              {/* Card art */}
              <div className="absolute inset-0">
                <img
                  src={CARD_ART_URLS[currentCard.id] || ""}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to top, ${theme.color}cc 0%, ${theme.color}40 35%, transparent 65%)`,
                  }}
                />
              </div>

              {/* Card name */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p
                  className="text-sm md:text-base font-black text-white uppercase tracking-wider leading-tight"
                  style={{
                    fontFamily: "var(--font-heading)",
                    textShadow: `0 2px 8px rgba(0,0,0,0.9), 0 0 20px ${theme.color}60`,
                  }}
                >
                  {currentCard.name}
                </p>
              </div>

              {/* Cost badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 500, damping: 20 }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                style={{
                  background: `linear-gradient(135deg, ${theme.color}, ${theme.color}cc)`,
                  color: "rgba(0,0,0,0.85)",
                  boxShadow: `0 0 12px ${theme.glow}, 0 2px 8px rgba(0,0,0,0.4)`,
                }}
              >
                {currentCard.cost}
              </motion.div>

              {/* Tier badge */}
              <div className="absolute top-2 left-2">
                <span
                  className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                  style={{
                    background: currentCard.tier === "epic" ? "rgba(168,85,247,0.4)" : currentCard.tier === "rare" ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.9)",
                    border: `1px solid ${currentCard.tier === "epic" ? "rgba(168,85,247,0.5)" : currentCard.tier === "rare" ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.2)"}`,
                  }}
                >
                  {currentCard.tier}
                </span>
              </div>

              {/* Impact particles overlay */}
              {showImpactParticles && phase === "impact" && (
                <ImpactParticles color={theme.color} count={16} />
              )}
            </motion.div>

            {/* ─── PROJECTILE: Animated beam toward target ─── */}
            <AnimatePresence>
              {(phase === "projectile" || phase === "impact") && (
                <motion.div
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full flex flex-col items-center gap-1"
                >
                  {/* Projectile beam */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 40, opacity: [0, 1, 0.6] }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="w-1 rounded-full"
                    style={{
                      background: theme.projectileGradient,
                      boxShadow: `0 0 12px ${theme.glow}, 0 0 24px ${theme.glow}`,
                    }}
                  />

                  {/* Projectile orb */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 1.5, 1],
                      opacity: [0, 1, 0.8],
                    }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="w-4 h-4 rounded-full"
                    style={{
                      background: `radial-gradient(circle, white 0%, ${theme.color} 50%, transparent 100%)`,
                      boxShadow: `0 0 20px ${theme.glow}, 0 0 40px ${theme.glow}`,
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── TARGET: Who gets hit ─── */}
            <AnimatePresence>
              {(phase === "impact" || phase === "effects") && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full relative"
                  style={{
                    background: isSelf
                      ? `${theme.color}20`
                      : "rgba(220,50,50,0.15)",
                    border: `1px solid ${isSelf ? `${theme.color}40` : "rgba(220,50,50,0.3)"}`,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {/* Impact flash on target */}
                  {phase === "impact" && showImpactParticles && (
                    <ImpactParticles color={isSelf ? theme.color : "#ef4444"} count={8} />
                  )}

                  {isAoE ? (
                    <>
                      <span className="text-xs">💀</span>
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                        ALL ENEMIES
                      </span>
                    </>
                  ) : isSelf ? (
                    <>
                      <div className="w-5 h-5 rounded-full overflow-hidden border" style={{ borderColor: theme.color }}>
                        <img src={FACTION_PORTRAITS[caster?.chosenSin as SinType]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.color, fontFamily: "var(--font-heading)" }}>
                        SELF
                      </span>
                    </>
                  ) : target ? (
                    <>
                      <div className="w-5 h-5 rounded-full overflow-hidden border border-red-500/40">
                        <img src={FACTION_PORTRAITS[(target.chosenSin as SinType) || "wrath"]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                        {target.username}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                      TARGET
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── EFFECT BADGES: Floating damage/heal numbers ─── */}
            <AnimatePresence>
              {phase === "effects" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-wrap justify-center gap-2 max-w-[280px]"
                >
                  {effectSummary.map((eff, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15, scale: 0.7 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: i * 0.1, type: "spring", stiffness: 500, damping: 25 }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                      style={{
                        background: `${eff.color}20`,
                        border: `1px solid ${eff.color}40`,
                        boxShadow: `0 0 12px ${eff.color}15`,
                      }}
                    >
                      <span className="text-sm">{eff.icon}</span>
                      <span
                        className="text-xs font-black tabular-nums"
                        style={{
                          color: eff.color,
                          fontFamily: "var(--font-heading)",
                          textShadow: `0 0 8px ${eff.color}60`,
                        }}
                      >
                        {eff.value}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">
                        {eff.label}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── COMPLETION: All resolved ─── */}
      <AnimatePresence>
        {completedRef.current && phase === "idle" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col items-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full border-2 border-candle/30 flex items-center justify-center"
              style={{ boxShadow: `0 0 20px ${theme.color}20` }}
            >
              <span className="text-lg">⚔️</span>
            </motion.div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/40" style={{ fontFamily: "var(--font-heading)" }}>
              ROUND COMPLETE
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
