/**
 * Home Page - The Cathedral of Sin
 *
 * Gothic cathedral-themed landing page with stained glass motifs.
 * Dark stone textures, candlelight warmth, and medieval typography.
 */

import { useState, useEffect, lazy, Suspense } from "react";
import { useTutorial } from "@/contexts/TutorialContext";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Users, Bot, GraduationCap } from "lucide-react";
import { ICON_URLS } from "@/lib/assetUrls";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import type { SinType } from "@shared/gameTypes";
const HomeBabylonScene = lazy(() => import("@/components/HomeBabylonScene"));
import EmberField from "@/components/EmberField";
import { useCard3DTilt } from "@/hooks/useCard3DTilt";
import { usePlayerId } from "@/hooks/usePlayerId";
import { useFactionUnlocks } from "@/hooks/useFactionUnlocks";
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
import { createGame, joinGame } from "@/lib/gameEngine";
import { soundEngine } from "@/lib/soundEngine";
import { musicEngine } from "@/lib/musicEngine";
import { MusicToggle } from "@/components/MusicToggle";

const SASSY_TAGLINES = [
  "Where your sins become someone else's problem.",
  "4 players. 7 sins. 0 moral compass.",
  "Therapy is expensive. This is free.",
  "The only game where rage-quitting is on-brand.",
  "Because board games weren't toxic enough.",
  "Your character flaws, weaponized.",
  "Friendship-ending technology, perfected.",
  "Come for the cards. Stay for the emotional damage.",
];

const FLOATING_ICON_URLS = [
  SIN_ARCHETYPE_ICONS.wrath,
  SIN_ARCHETYPE_ICONS.sloth,
  SIN_ARCHETYPE_ICONS.greed,
  SIN_ARCHETYPE_ICONS.envy,
];

export default function Home() {
  const playerId = usePlayerId();
  const { startTutorial, hasCompleted: tutorialCompleted, isActive: tutorialActive, setCurrentPage } = useTutorial();
  const factionUnlocks = useFactionUnlocks();

  useEffect(() => {
    setCurrentPage("home");
  }, [setCurrentPage]);

  useEffect(() => {
    musicEngine.init();
    musicEngine.setScene("menu");
  }, []);

  const autoTriggeredRef = useState(() => ({ current: false }))[0];
  useEffect(() => {
    if (!tutorialCompleted && !tutorialActive && !autoTriggeredRef.current) {
      autoTriggeredRef.current = true;
      const timer = setTimeout(() => startTutorial("home"), 1500);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [, setLocation] = useLocation();
  const [username, setUsername] = useState(() => localStorage.getItem("7sins_username") || "");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [showJoinPanel, setShowJoinPanel] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % SASSY_TAGLINES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async () => {
    if (!username.trim()) {
      setError("A name, sinner. Even the damned have names.");
      return;
    }
    setError(null);
    setIsCreating(true);
    soundEngine.play("card_shuffle");
    localStorage.setItem("7sins_username", username.trim());
    try {
      const result = await createGame(playerId, username.trim());
      setLocation(`/lobby/${result.gameId}`);
    } catch (err: any) {
      setError(err.message || "The cathedral rejects your offering. Try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!username.trim()) {
      setError("A name. The confessional requires a name.");
      return;
    }
    if (!roomCode.trim()) {
      setError("The sacred code. Your fellow sinner should have given you one.");
      return;
    }
    setError(null);
    setIsJoining(true);
    soundEngine.play("teleport");
    localStorage.setItem("7sins_username", username.trim());
    try {
      const result = await joinGame(roomCode.trim().toUpperCase(), playerId, username.trim());
      setLocation(`/lobby/${result.gameId}`);
    } catch (err: any) {
      setError(err.message || "Invalid code. The cathedral doors remain sealed.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-arena relative overflow-hidden noise-overlay">
      {/* 3D Babylon.js background scene */}
      <Suspense fallback={<EmberField count={24} />}>
        <HomeBabylonScene className="opacity-60" />
      </Suspense>

      {/* Cathedral dust motes */}
      <EmberField count={12} />

      {/* Floating ambient sin icons — like stained glass fragments drifting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => {
          const iconUrl = FLOATING_ICON_URLS[i % FLOATING_ICON_URLS.length];
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${5 + Math.random() * 90}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -60, 0],
                opacity: [0.02, 0.06, 0.02],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 18 + Math.random() * 20,
                repeat: Infinity,
                delay: Math.random() * 10,
                ease: "linear",
              }}
            >
              <img src={iconUrl} alt="" className="w-4 h-4 opacity-40" />
            </motion.div>
          );
        })}
      </div>

      {/* Music toggle */}
      <div className="absolute top-4 right-4 z-30">
        <MusicToggle />
      </div>

      {/* Gothic corner vignettes */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-wrath/6 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-candle/4 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-envy/4 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-sloth/4 to-transparent pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">

        {/* ═══ Cathedral Title Section ═══ */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-10"
        >
          {/* Gothic arch ornament */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-candle/30" />
            <span className="text-candle/40 text-xs" style={{ fontFamily: "var(--font-accent)" }}>&#x2720;</span>
            <div className="h-px w-8 bg-candle/20" />
            <span className="text-candle/40 text-xs" style={{ fontFamily: "var(--font-accent)" }}>&#x271D;</span>
            <div className="h-px w-8 bg-candle/20" />
            <span className="text-candle/40 text-xs" style={{ fontFamily: "var(--font-accent)" }}>&#x2720;</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-candle/30" />
          </motion.div>

          <p
            className="text-[9px] tracking-[0.4em] text-candle/50 uppercase mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Enter the Cathedral
          </p>

          <h1
            className="text-5xl md:text-7xl font-black tracking-wider mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <motion.span
              className="text-wrath text-glow-wrath inline-block"
              animate={{ textShadow: ["0 0 12px oklch(0.6 0.28 25 / 0.5)", "0 0 20px oklch(0.6 0.28 25 / 0.8)", "0 0 12px oklch(0.6 0.28 25 / 0.5)"] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              7
            </motion.span>{" "}
            <span className="text-foreground/90">DEADLY</span>{" "}
            <motion.span
              className="text-sloth text-glow-sloth inline-block"
              animate={{ textShadow: ["0 0 12px oklch(0.52 0.18 290 / 0.5)", "0 0 20px oklch(0.52 0.18 290 / 0.8)", "0 0 12px oklch(0.52 0.18 290 / 0.5)"] }}
              transition={{ duration: 4, repeat: Infinity, delay: 2 }}
            >
              SINS
            </motion.span>
          </h1>

          {/* Gothic divider */}
          <div className="flex items-center justify-center gap-2 my-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-candle/25" />
            <div className="w-1.5 h-1.5 rotate-45 bg-candle/30" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-candle/25" />
          </div>

          <p
            className="text-xs tracking-[0.25em] text-muted-foreground/70 uppercase"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            A Card Game of Mortal Sin
          </p>

          {/* Rotating taglines */}
          <div className="h-8 mt-4 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={taglineIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="narrator-text text-lg"
              >
                "{SASSY_TAGLINES[taglineIndex]}"
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ═══ Win Streak Banner ═══ */}
        {(() => {
          const streak = parseInt(localStorage.getItem("7sins_win_streak") || "0", 10);
          const totalGames = parseInt(localStorage.getItem("7sins_total_games") || "0", 10);
          const totalWins = parseInt(localStorage.getItem("7sins_total_wins") || "0", 10);
          if (totalGames === 0) return null;
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="w-full max-w-md mb-4"
            >
              <div className={`rounded-xl px-4 py-3 text-center border ${
                streak >= 3
                  ? "bg-gradient-to-r from-candle/8 to-wrath/8 border-candle/20"
                  : "bg-white/3 border-white/8"
              }`}>
                <div className="flex items-center justify-center gap-4 text-[10px] tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                  {streak > 0 && (
                    <span className="flex items-center gap-1 text-candle">
                      <img src={SIN_ARCHETYPE_ICONS.wrath} alt="" className="w-3 h-3" />
                      {streak} STREAK
                    </span>
                  )}
                  <span className="text-foreground/40">
                    {totalWins}W / {totalGames - totalWins}L
                  </span>
                  <span className="text-foreground/30">
                    {totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0}% WIN RATE
                  </span>
                </div>
                {streak >= 3 && (
                  <p className="text-[9px] text-candle/40 italic mt-1" style={{ fontFamily: "var(--font-body)" }}>
                    The cathedral remembers your victories. Don't let the streak die.
                  </p>
                )}
              </div>
            </motion.div>
          );
        })()}

        {/* ═══ Game Panel — Stone Altar ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="glass-panel-epic rounded-2xl p-8 shimmer-overlay relative">
            {/* Subtle cross ornament in top center */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="text-candle/30 text-sm" style={{ fontFamily: "var(--font-accent)" }}>&#x271D;</span>
              </div>
            </div>

            {/* Username Input */}
            <div className="mb-6">
              <label
                className="block text-[10px] tracking-[0.2em] text-muted-foreground/70 uppercase mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Your Sinful Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="What do they call you, sinner?"
                maxLength={20}
                className="w-full bg-background/60 border border-candle/15 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-candle/40 focus:ring-1 focus:ring-candle/15 transition-all"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button
                data-tutorial="create-game"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full btn-wrath rounded-xl py-3.5 px-6 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <img src={SIN_ARCHETYPE_ICONS.wrath} alt="" className="w-4 h-4" />
                {isCreating ? "OPENING THE GATES..." : "CREATE GAME"}
              </motion.button>

              <motion.button
                data-tutorial="how-to-play"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startTutorial("home")}
                className="w-full rounded-xl py-2.5 px-6 text-[11px] border border-candle/15 text-candle/70 hover:bg-candle/5 hover:border-candle/25 transition-all flex items-center justify-center gap-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                HOW TO PLAY
              </motion.button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-candle/10" />
                <span
                  className="text-[9px] tracking-[0.15em] text-muted-foreground/50 uppercase"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  or join another's penance
                </span>
                <div className="flex-1 h-px bg-candle/10" />
              </div>

              <AnimatePresence>
                {!showJoinPanel ? (
                  <motion.button
                    key="join-toggle"
                    data-tutorial="join-game"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowJoinPanel(true)}
                    className="w-full btn-sloth rounded-xl py-3.5 px-6 text-sm flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    JOIN GAME
                  </motion.button>
                ) : (
                  <motion.div
                    key="join-panel"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="SACRED CODE"
                      maxLength={6}
                      className="w-full bg-background/60 border border-candle/15 rounded-xl px-4 py-3 text-foreground text-center tracking-[0.4em] uppercase placeholder:text-muted-foreground/30 placeholder:tracking-normal placeholder:normal-case focus:outline-none focus:border-sloth/40 focus:ring-1 focus:ring-sloth/15 transition-all text-lg font-bold"
                      style={{ fontFamily: "var(--font-heading)" }}
                    />
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleJoin}
                        disabled={isJoining}
                        className="flex-1 btn-sloth rounded-xl py-3 px-4 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isJoining ? "ENTERING..." : "ENTER THE CATHEDRAL"}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowJoinPanel(false)}
                        className="px-4 py-3 rounded-xl border border-candle/10 text-muted-foreground/50 text-sm hover:border-candle/20 transition-colors"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        NAH
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-4 p-3 rounded-xl bg-wrath/10 border border-wrath/20"
                >
                  <p className="text-sm text-wrath text-center" style={{ fontFamily: "var(--font-body)" }}>
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-6"
          >
            <div className="flex items-center justify-center gap-4 text-[10px] tracking-[0.1em] text-muted-foreground/50 uppercase" style={{ fontFamily: "var(--font-heading)" }}>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 2-4 Sinners</span>
              <span className="text-candle/20">&middot;</span>
              <span className="flex items-center gap-1"><img src={ICON_URLS.energy_generic} alt="" className="w-3 h-3 object-contain" /> Real-time</span>
              <span className="text-candle/20">&middot;</span>
              <span className="flex items-center gap-1"><Bot className="w-3 h-3" /> Bots for the Friendless</span>
            </div>
          </motion.div>
        </motion.div>

        {/* ═══ Sin Faction Stained Glass Cards ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          data-tutorial="faction-cards"
          className="mt-14 max-w-3xl w-full"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-candle/20" />
            <p
              className="text-[10px] tracking-[0.3em] text-candle/50 uppercase"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Choose Your Damnation
            </p>
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-candle/20" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { color: "wrath", glass: "glass-panel-wrath", name: "WRATH", key: "wrath" as const, desc: "Burn fast. Hit hard. Self-harm is just a bonus.", tag: "Aggression: Maximum", passive: "Overcharge: Burn 2 HP for +1 energy" },
              { color: "sloth", glass: "glass-panel-sloth", name: "SLOTH", key: "sloth" as const, desc: "Outlast everyone. Shields and heals that grow over time.", tag: "Endurance: Maximum", passive: "Lethargy: Carry over unspent energy" },
              { color: "greed", glass: "glass-panel-greed", name: "GREED", key: "greed" as const, desc: "Steal resources. Drain opponents. Everything has a price.", tag: "Profit: Maximum", passive: "Avarice: Big spends grant bonus energy" },
              { color: "envy", glass: "glass-panel-envy", name: "ENVY", key: "envy" as const, desc: "Copy strengths. Punish the strong. Become them.", tag: "Jealousy: Maximum", passive: "Covet: Gain energy when outmatched" },
            ].map((sin) => (
              <SinCard key={sin.name} sin={sin} portrait={FACTION_PORTRAITS[sin.key]} />
            ))}
          </div>
        </motion.div>

        {/* ═══ Card Mechanics — The Two Paths ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          data-tutorial="card-mechanics"
          className="mt-14 max-w-2xl w-full"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-candle/20" />
            <p
              className="text-[10px] tracking-[0.3em] text-candle/50 uppercase"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              The Two Paths of Sin
            </p>
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-candle/20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Flat Cards */}
            <div className="glass-panel rounded-xl p-5 border border-candle/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-candle/8 border border-candle/15 flex items-center justify-center">
                  <img src={ICON_URLS.damage_wrath} alt="flat" className="w-4 h-4 object-contain" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-candle tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                    FLAT
                  </h3>
                  <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                    Instant Judgement
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-foreground/60 leading-relaxed mb-3" style={{ fontFamily: "var(--font-body)" }}>
                One devastating blow. Resolves immediately. No patience required — just wrath.
              </p>
              <div className="bg-background/30 rounded-lg p-3 border border-candle/8">
                <p className="text-[10px] text-candle/50 mb-1" style={{ fontFamily: "var(--font-heading)" }}>EXAMPLE</p>
                <div className="flex items-center gap-2">
                  <img src={SIN_ARCHETYPE_ICONS.wrath} alt="" className="w-3.5 h-3.5" />
                  <p className="text-[11px] text-foreground/70" style={{ fontFamily: "var(--font-body)" }}>
                    <span className="text-wrath font-semibold">Fury Strike</span> — 4 damage, right now, done.
                  </p>
                </div>
              </div>
            </div>

            {/* Compounding Cards */}
            <div className="glass-panel rounded-xl p-5 border border-greed-glow/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-greed-glow/8 border border-greed-glow/15 flex items-center justify-center">
                  <img src={ICON_URLS.buff_generic} alt="compound" className="w-4 h-4 object-contain" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-greed-glow tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                    COMPOUNDING
                  </h3>
                  <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                    3-Round Penance
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-foreground/60 leading-relaxed mb-3" style={{ fontFamily: "var(--font-body)" }}>
                Ticks for 3 rounds with Fibonacci scaling. Pay once, collect thrice. Patience is a sin too.
              </p>
              <div className="bg-background/30 rounded-lg p-3 border border-greed-glow/8">
                <p className="text-[10px] text-greed-glow/50 mb-2" style={{ fontFamily: "var(--font-heading)" }}>FIBONACCI SCALING [1, 1, 2]</p>
                <div className="flex items-center gap-3 justify-center">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-lg bg-greed-glow/5 border border-greed-glow/12 flex items-center justify-center mb-1">
                      <span className="text-sm font-bold text-greed-glow" style={{ fontFamily: "var(--font-heading)" }}>1&times;</span>
                    </div>
                    <p className="text-[8px] text-muted-foreground/50" style={{ fontFamily: "var(--font-heading)" }}>TICK 1</p>
                  </div>
                  <div className="text-candle/20 text-xs">&rarr;</div>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-lg bg-greed-glow/5 border border-greed-glow/12 flex items-center justify-center mb-1">
                      <span className="text-sm font-bold text-greed-glow" style={{ fontFamily: "var(--font-heading)" }}>1&times;</span>
                    </div>
                    <p className="text-[8px] text-muted-foreground/50" style={{ fontFamily: "var(--font-heading)" }}>TICK 2</p>
                  </div>
                  <div className="text-candle/20 text-xs">&rarr;</div>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-lg bg-greed-glow/8 border border-greed-glow/25 flex items-center justify-center mb-1">
                      <span className="text-sm font-bold text-greed-glow" style={{ fontFamily: "var(--font-heading)" }}>2&times;</span>
                    </div>
                    <p className="text-[8px] text-greed-glow/60 font-semibold" style={{ fontFamily: "var(--font-heading)" }}>PAYOFF</p>
                  </div>
                </div>
                <p className="text-[9px] text-foreground/40 text-center mt-2 italic" style={{ fontFamily: "var(--font-body)" }}>
                  Total value = base &times; 4 over 3 rounds
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══ Corruption Energy ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-10 max-w-2xl w-full"
        >
          <div className="glass-panel-epic rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-wrath/8 border border-wrath/15 flex items-center justify-center">
                <img src={ICON_URLS.energy_generic} alt="energy" className="w-4 h-4 object-contain" style={{ animation: 'glow-breathe 2s ease-in-out infinite' }} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-wrath tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                  CORRUPTION
                </h3>
                <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                  The Fuel of Sin
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { val: "2", label: "Start Energy" },
                { val: "+1", label: "Per Round" },
                { val: "7", label: "Max Cap" },
                { val: "0-5", label: "Card Cost" },
              ].map((item) => (
                <div key={item.label} className="bg-background/25 rounded-lg p-3 text-center border border-candle/8">
                  <p className="text-lg font-black text-candle" style={{ fontFamily: "var(--font-heading)" }}>{item.val}</p>
                  <p className="text-[8px] text-muted-foreground/50 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>{item.label}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-foreground/40 text-center mt-3 italic" style={{ fontFamily: "var(--font-body)" }}>
              Spend corruption to play cards. More corruption = more powerful sins. Use it or lose it.
            </p>
          </div>
        </motion.div>

        {/* ═══ How It Works ═══ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-10 max-w-lg text-center"
        >
          <p
            className="text-[10px] tracking-[0.25em] text-candle/40 uppercase mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            The Ritual (Short Version)
          </p>
          <div className="flex gap-4 justify-center">
            {[
              { num: "1", label: "Pick a sin", color: "wrath" },
              { num: "2", label: "Spend corruption", color: "candle" },
              { num: "3", label: "Flat or compound", color: "greed-glow" },
              { num: "4", label: "Last sinner wins", color: "sloth" },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className={`w-8 h-8 rounded-full bg-${step.color}/8 border border-${step.color}/15 flex items-center justify-center mx-auto mb-1`}>
                  <span className={`text-xs font-bold text-${step.color}`} style={{ fontFamily: "var(--font-heading)" }}>{step.num}</span>
                </div>
                <p className="text-[10px] text-foreground/60" style={{ fontFamily: "var(--font-body)" }}>{step.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ═══ Footer ═══ */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 text-[9px] text-muted-foreground/30 text-center"
          style={{ fontFamily: "var(--font-body)" }}
        >
          48 cards &middot; 4 factions &middot; 10 rounds &middot; Fibonacci compounding &middot; Zero mercy
        </motion.p>

        {/* Attribution */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-6 text-[8px] text-muted-foreground/25 text-center space-y-0.5"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <p>Music: "Dark City" by Muncheybobo &middot; "Dark Ambient" by Alexandr Zhelanov &middot; "Dark Ambient Loop 13" by MundoSound</p>
          <p>SFX: Card Game Sounds (CC0) &middot; JC Sounds Fantasy SFX Pack (CC-BY 4.0) &middot; Icons: Painterly Spell Icons by J. W. Bjerk (CC-BY 3.0)</p>
          <p>All assets from <a href="https://opengameart.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-muted-foreground/40 transition-colors">OpenGameArt.org</a></p>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Sin Faction Card with 3D Tilt & Stained Glass Effect ─────── */
function SinCard({ sin, portrait }: { sin: { color: string; glass: string; name: string; key: SinType; desc: string; tag: string; passive: string }; portrait?: string }) {
  const { ref, handlers } = useCard3DTilt({ maxTilt: 12, scale: 1.06 });

  return (
    <div
      ref={ref}
      {...handlers}
      className={`${sin.glass} rounded-xl p-3 text-center group cursor-default holo-sheen transition-shadow duration-300 hover:shadow-[0_0_30px_oklch(0.5_0.2_var(--sin-hue)/0.15)] relative overflow-hidden`}
      style={{ willChange: 'transform' }}
    >
      {/* Portrait image with stained glass overlay */}
      {portrait && (
        <div className="w-full aspect-[3/4] rounded-lg overflow-hidden mb-2 relative">
          <img
            src={portrait}
            alt={`${sin.name} faction`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {/* Stained glass corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-candle/20 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-candle/20 rounded-tr-lg" />
        </div>
      )}
      {!portrait && (
        <img src={SIN_ARCHETYPE_ICONS[sin.key]} alt={sin.name} className="w-7 h-7 mx-auto mb-2 object-contain" style={{ filter: `drop-shadow(0 0 6px var(--color-${sin.color}))` }} />
      )}
      <h3
        className={`text-sm font-bold text-${sin.color} tracking-wider mb-1`}
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {sin.name}
      </h3>
      <p
        className="text-[10px] text-foreground/60 mt-1 leading-relaxed"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {sin.desc}
      </p>
      <p
        className="text-[8px] text-muted-foreground/50 mt-1.5 uppercase tracking-[0.15em]"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {sin.tag}
      </p>
      <p
        className={`text-[8px] text-${sin.color}/50 mt-0.5 italic`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        {sin.passive}
      </p>
    </div>
  );
}
