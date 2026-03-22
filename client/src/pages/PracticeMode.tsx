/**
 * PracticeMode — Guided Solo Training Arena
 *
 * A special game mode that:
 * 1. Auto-creates a game with 1 bot opponent
 * 2. Adds contextual annotations explaining each game mechanic as it appears
 * 3. Pauses before the player's first turn with an explanation overlay
 * 4. Shows "what would happen" previews when hovering cards
 * 5. Provides step-by-step guidance through the first 3 rounds
 *
 * After round 3, annotations fade out and the game continues normally.
 * This is essentially a wrapper that creates a normal game but injects
 * a PracticeOverlay component with teaching annotations.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { usePlayerId } from "@/hooks/usePlayerId";
import { GraduationCap, ArrowRight, Swords, Shield, Zap, Heart, Target, Sparkles, ChevronRight, RotateCcw } from "lucide-react";
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import { PASSIVE_INFO } from "@shared/gameTypes";
import type { SinType } from "@shared/gameTypes";
import EmberField from "@/components/EmberField";

// Dynamic imports for game engine (same pattern as Home.tsx)
const lazyGameEngine = () => import("@/lib/gameEngine");
const lazyBotEngine = () => import("@/lib/botEngine");

const PRACTICE_SINS: { sin: SinType; label: string; desc: string; difficulty: string }[] = [
  { sin: "wrath", label: "Wrath", desc: "The blunt instrument. Deal damage, reflect it back.", difficulty: "Easy" },
  { sin: "sloth", label: "Sloth", desc: "The immovable object. Shields and stubborn endurance.", difficulty: "Easy" },
  { sin: "greed", label: "Greed", desc: "The tax collector. Convert damage into personal wealth.", difficulty: "Medium" },
  { sin: "envy", label: "Envy", desc: "The mimic. Steal what others build.", difficulty: "Medium" },
  { sin: "lust", label: "Lust", desc: "The parasite. Deal damage, drink the health.", difficulty: "Easy" },
  { sin: "pride", label: "Pride", desc: "The gambler. Multiply your strongest — or lose everything.", difficulty: "Hard" },
  { sin: "gluttony", label: "Gluttony", desc: "The devourer. Burn cards for power. Overwhelm with volume.", difficulty: "Hard" },
];

const SIN_COLORS: Record<string, string> = {
  wrath: "#ef4444", sloth: "#a855f7", greed: "#eab308",
  envy: "#22c55e", pride: "#f0f0f0", lust: "#ec4899", gluttony: "#b45309",
};

interface PracticeStep {
  id: string;
  title: string;
  narratorQuote: string;
  content: string;
  icon: typeof Swords;
  highlight?: string;
}

const PRACTICE_STEPS: PracticeStep[] = [
  {
    id: "welcome",
    title: "The Training Grounds",
    narratorQuote: "Every sinner starts somewhere. Usually at the bottom.",
    content: "This is a guided 1v1 match against a bot. The narrator will walk you through the fundamentals. Take your time — there's no turn timer in the training grounds.",
    icon: GraduationCap,
  },
  {
    id: "energy",
    title: "The Price of Power",
    narratorQuote: "Corruption is currency. Spend it wisely, or don't — the cathedral profits either way.",
    content: "You start with 2 corruption and gain +1 each round (max 7). Every card costs corruption to play. Unspent corruption carries over — restraint today enables devastation tomorrow.",
    icon: Zap,
  },
  {
    id: "cards",
    title: "Committing Your Sins",
    narratorQuote: "Select your weapon. Point it at someone who deserves it. Or doesn't.",
    content: "Select a card from your hand, then click an opponent to direct your sin at them. You can commit multiple sins per turn if you have the corruption. When you're done, LOCK IN to seal your fate.",
    icon: Swords,
  },
  {
    id: "compound",
    title: "The Compound Interest on Evil",
    narratorQuote: "A sin planted early grows roots. A sin planted late merely scratches the surface.",
    content: "ALL cards create compound effects that tick every round after being played. A damage card played on round 1 keeps dealing damage on rounds 2, 3, 4… with increasing multipliers. The earlier you invest your sins, the greater the returns.",
    icon: Sparkles,
  },
  {
    id: "defense",
    title: "Even the Damned Must Defend",
    narratorQuote: "A dead sinner plays no cards. Remember that.",
    content: "Healing and shield cards are just as important as damage. If your HP hits zero, your story ends — even if you dealt the most damage. Mix offense and defense based on your survival needs.",
    icon: Shield,
  },
  {
    id: "passive",
    title: "Your Sin Works in the Shadows",
    narratorQuote: "The best sins are the ones that work while you sleep.",
    content: "Each faction has a unique passive ability that triggers automatically. It fires without your input — build your strategy around it. Your sin defines your path to victory.",
    icon: Heart,
  },
  {
    id: "targeting",
    title: "Choose Your Victim Wisely",
    narratorQuote: "Scatter your sins and you scatter your power. Focus, and worlds crumble.",
    content: "Don't spread damage across all opponents. Focus fire on one target to eliminate them. In this practice, you only have one victim — but in real games, choosing who to destroy is half the strategy.",
    icon: Target,
  },
  {
    id: "go",
    title: "The Cathedral Awaits",
    narratorQuote: "The training wheels come off. Try not to crash into anything holy.",
    content: "The narrator will guide you for the first 3 rounds, then fall silent. From there, it's between you and whatever passes for your conscience. Spend corruption. Play early. Don't die.",
    icon: ArrowRight,
  },
];

export default function PracticeMode() {
  const playerId = usePlayerId();
  const [, setLocation] = useLocation();
  const [phase, setPhase] = useState<"select_sin" | "briefing" | "launching">("select_sin");
  const [selectedSin, setSelectedSin] = useState<SinType | null>(null);
  const [briefingStep, setBriefingStep] = useState(0);
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSinSelect = (sin: SinType) => {
    setSelectedSin(sin);
  };

  const handleStartBriefing = () => {
    if (!selectedSin) return;
    setPhase("briefing");
    setBriefingStep(0);
  };

  const handleNextStep = () => {
    if (briefingStep < PRACTICE_STEPS.length - 1) {
      setBriefingStep(briefingStep + 1);
    } else {
      launchPracticeGame();
    }
  };

  const handlePrevStep = () => {
    if (briefingStep > 0) {
      setBriefingStep(briefingStep - 1);
    }
  };

  const launchPracticeGame = useCallback(async () => {
    if (!selectedSin || isLaunching) return;
    setPhase("launching");
    setIsLaunching(true);
    setError(null);

    try {
      const { createGame, chooseSin, startGame, setTurnTimer } = await lazyGameEngine();
      const { addBot, botChooseSin } = await lazyBotEngine();

      // Get or create username
      const username = localStorage.getItem("7sins_username") || "Apprentice";

      // 1. Create game
      const { gameId } = await createGame(playerId, username);

      // 2. Choose sin for player
      await chooseSin(gameId, playerId, selectedSin);

      // 3. Add a bot opponent
      const { botId } = await addBot(gameId);
      await botChooseSin(gameId, botId);

      // 4. Set a generous timer for practice (30s)
      await setTurnTimer(gameId, 30);

      // 5. Start the game
      await startGame(gameId);

      // 6. Mark this as a practice game in localStorage
      localStorage.setItem("7sins_practice_game", gameId);
      localStorage.setItem("7sins_practice_round", "0");

      // 7. Navigate to the game board
      setLocation(`/game/${gameId}`);
    } catch (err: any) {
      console.error("[PracticeMode] Failed to launch:", err);
      setError("Failed to create practice game. Please try again.");
      setPhase("select_sin");
      setIsLaunching(false);
    }
  }, [selectedSin, playerId, isLaunching, setLocation]);

  const currentStep = PRACTICE_STEPS[briefingStep];
  const StepIcon = currentStep?.icon || GraduationCap;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0a0810 0%, #12101a 50%, #0a0810 100%)" }}>
      <EmberField count={20} />

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => setLocation("/")}
        className="fixed top-4 left-4 z-50 flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        BACK
      </motion.button>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <AnimatePresence mode="wait">
          {/* ── PHASE 1: Sin Selection ── */}
          {phase === "select_sin" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 mb-4"
                >
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold tracking-widest text-amber-300/80" style={{ fontFamily: "var(--font-heading)" }}>
                    PRACTICE MODE
                  </span>
                </motion.div>
                <h1
                  className="text-3xl md:text-4xl font-black text-white/90 mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Choose Your Sin
                </h1>
                <p
                  className="text-sm italic text-amber-200/25 mb-2"
                  style={{ fontFamily: "var(--font-narrator)" }}
                >
                  "Seven deadly sins. Seven ways to lose everything. But first, you must learn."
                </p>
                <p className="text-sm text-white/40" style={{ fontFamily: "var(--font-body)" }}>
                  Pick a faction. You'll face a single bot in the training grounds.
                </p>
              </div>

              {/* Sin Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {PRACTICE_SINS.map((item) => {
                  const isSelected = selectedSin === item.sin;
                  const color = SIN_COLORS[item.sin];
                  return (
                    <motion.button
                      key={item.sin}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSinSelect(item.sin)}
                      className="relative rounded-xl overflow-hidden border transition-all text-left"
                      style={{
                        borderColor: isSelected ? `${color}60` : "rgba(255,255,255,0.08)",
                        background: isSelected
                          ? `linear-gradient(135deg, ${color}15, ${color}05)`
                          : "rgba(255,255,255,0.03)",
                        boxShadow: isSelected ? `0 0 20px ${color}20` : "none",
                      }}
                    >
                      {/* Portrait */}
                      <div className="relative h-24 overflow-hidden">
                        <img
                          src={FACTION_PORTRAITS[item.sin]}
                          alt={item.label}
                          className="w-full h-full object-cover object-top"
                          style={{ filter: isSelected ? "none" : "grayscale(0.5) brightness(0.6)" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        {/* Difficulty badge */}
                        <div
                          className="absolute top-2 right-2 text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded"
                          style={{
                            fontFamily: "var(--font-heading)",
                            background: item.difficulty === "Easy" ? "rgba(34,197,94,0.2)" : item.difficulty === "Medium" ? "rgba(234,179,8,0.2)" : "rgba(239,68,68,0.2)",
                            color: item.difficulty === "Easy" ? "#22c55e" : item.difficulty === "Medium" ? "#eab308" : "#ef4444",
                          }}
                        >
                          {item.difficulty}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <img src={SIN_ARCHETYPE_ICONS[item.sin]} alt="" className="w-4 h-4" />
                          <span
                            className="text-sm font-bold tracking-wider"
                            style={{ fontFamily: "var(--font-heading)", color }}
                          >
                            {item.label.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/35 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                          {item.desc}
                        </p>
                      </div>

                      {/* Selection indicator */}
                      {isSelected && (
                        <motion.div
                          layoutId="practice-selection"
                          className="absolute inset-0 border-2 rounded-xl pointer-events-none"
                          style={{ borderColor: `${color}50` }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Passive info for selected sin */}
              <AnimatePresence>
                {selectedSin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-6"
                  >
                    <div
                      className="rounded-xl px-5 py-4 border"
                      style={{
                        background: `linear-gradient(135deg, ${SIN_COLORS[selectedSin]}08, transparent)`,
                        borderColor: `${SIN_COLORS[selectedSin]}20`,
                      }}
                    >
                      <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                        Passive Ability
                      </p>
                      <p className="text-sm font-bold mb-1" style={{ fontFamily: "var(--font-heading)", color: SIN_COLORS[selectedSin] }}>
                        {PASSIVE_INFO[selectedSin].name}
                      </p>
                      <p className="text-xs text-white/50 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                        {PASSIVE_INFO[selectedSin].description}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Start button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartBriefing}
                disabled={!selectedSin}
                className="w-full max-w-md mx-auto block rounded-xl py-3.5 px-6 text-base font-bold tracking-wider disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                style={{
                  fontFamily: "var(--font-heading)",
                  background: selectedSin
                    ? `linear-gradient(135deg, ${SIN_COLORS[selectedSin]}, ${SIN_COLORS[selectedSin]}aa)`
                    : "rgba(255,255,255,0.1)",
                  color: selectedSin === "pride" ? "#111" : "#fff",
                  boxShadow: selectedSin ? `0 0 20px ${SIN_COLORS[selectedSin]}30` : "none",
                }}
              >
                {selectedSin ? "ENTER THE TRAINING GROUNDS" : "SELECT A SIN FIRST"}
              </motion.button>

              {error && (
                <p className="text-center text-red-400 text-sm mt-3" style={{ fontFamily: "var(--font-body)" }}>
                  {error}
                </p>
              )}
            </motion.div>
          )}

          {/* ── PHASE 2: Briefing Slides ── */}
          {phase === "briefing" && currentStep && (
            <motion.div
              key={`briefing-${briefingStep}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-lg"
            >
              <div
                className="rounded-2xl border overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${SIN_COLORS[selectedSin!]}08, rgba(0,0,0,0.4))`,
                  borderColor: `${SIN_COLORS[selectedSin!]}20`,
                }}
              >
                {/* Progress bar */}
                <div className="h-1 bg-white/5">
                  <motion.div
                    className="h-full"
                    style={{ background: SIN_COLORS[selectedSin!] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${((briefingStep + 1) / PRACTICE_STEPS.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <div className="p-8">
                  {/* Step counter */}
                  <p className="text-[10px] text-white/25 uppercase tracking-widest mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                    Step {briefingStep + 1} of {PRACTICE_STEPS.length}
                  </p>

                  {/* Icon */}
                  <motion.div
                    key={briefingStep}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: `${SIN_COLORS[selectedSin!]}15` }}
                  >
                    <StepIcon className="w-7 h-7" style={{ color: SIN_COLORS[selectedSin!] }} />
                  </motion.div>

                  {/* Title */}
                  <h2
                    className="text-xl font-black mb-1.5"
                    style={{ fontFamily: "var(--font-heading)", color: SIN_COLORS[selectedSin!] }}
                  >
                    {currentStep.title}
                  </h2>

                  {/* Narrator quote */}
                  <p
                    className="text-sm italic text-amber-200/25 mb-3 leading-relaxed"
                    style={{ fontFamily: "var(--font-narrator)" }}
                  >
                    "{currentStep.narratorQuote}"
                  </p>

                  {/* Content */}
                  <p className="text-sm text-white/55 leading-relaxed mb-8" style={{ fontFamily: "var(--font-body)" }}>
                    {currentStep.content}
                  </p>

                  {/* Faction-specific passive tip on the passive step */}
                  {currentStep.id === "passive" && selectedSin && (
                    <div
                      className="rounded-xl px-4 py-3 border mb-6"
                      style={{
                        background: `${SIN_COLORS[selectedSin]}08`,
                        borderColor: `${SIN_COLORS[selectedSin]}15`,
                      }}
                    >
                      <p className="text-xs font-bold mb-1" style={{ fontFamily: "var(--font-heading)", color: SIN_COLORS[selectedSin] }}>
                        Your Passive: {PASSIVE_INFO[selectedSin].name}
                      </p>
                      <p className="text-[11px] text-white/40 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                        {PASSIVE_INFO[selectedSin].description}
                      </p>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePrevStep}
                      disabled={briefingStep === 0}
                      className="text-sm text-white/30 hover:text-white/60 disabled:opacity-0 disabled:cursor-default transition-colors"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      ← BACK
                    </button>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleNextStep}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold tracking-wider transition-all flex items-center gap-2"
                      style={{
                        fontFamily: "var(--font-heading)",
                        background: `linear-gradient(135deg, ${SIN_COLORS[selectedSin!]}, ${SIN_COLORS[selectedSin!]}aa)`,
                        color: selectedSin === "pride" ? "#111" : "#fff",
                      }}
                    >
                      {briefingStep === PRACTICE_STEPS.length - 1 ? (
                        <>
                          <Swords className="w-4 h-4" />
                          ENTER THE ARENA
                        </>
                      ) : (
                        <>
                          NEXT
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Skip button */}
              <button
                onClick={launchPracticeGame}
                className="block mx-auto mt-4 text-xs text-white/20 hover:text-white/40 transition-colors"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                SKIP BRIEFING →
              </button>
            </motion.div>
          )}

          {/* ── PHASE 3: Launching ── */}
          {phase === "launching" && (
            <motion.div
              key="launching"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4"
              >
                <img
                  src={selectedSin ? SIN_ARCHETYPE_ICONS[selectedSin] : ""}
                  alt=""
                  className="w-full h-full object-contain"
                  style={{ filter: `drop-shadow(0 0 10px ${SIN_COLORS[selectedSin || "wrath"]}60)` }}
                />
              </motion.div>
              <p
                className="text-sm text-white/50"
                style={{ fontFamily: "var(--font-body)" }}
              >
                The cathedral prepares your trial...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
