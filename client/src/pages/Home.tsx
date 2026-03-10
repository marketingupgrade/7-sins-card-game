/**
 * Home Page - The Gateway to Sin
 *
 * Premium dark neon cyberpunk landing page.
 * Create or join a game. Every piece of text drips with attitude.
 * Invader Zim × Freaky Fred aesthetic with maximum sass.
 */

import { useState, useEffect } from "react";
import { useTutorial } from "@/contexts/TutorialContext";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Flame, Moon, Skull, Swords, Shield, Zap, Users, Bot, Sparkles, Coins, Eye, TrendingUp, SquareSlash, GraduationCap } from "lucide-react";
import EmberField from "@/components/EmberField";
import { useCard3DTilt } from "@/hooks/useCard3DTilt";
import { usePlayerId } from "@/hooks/usePlayerId";
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

const FLOATING_ICONS = [Flame, Moon, Skull, Swords, Shield, Zap];

export default function Home() {
  const playerId = usePlayerId();
  const { startTutorial, hasCompleted: tutorialCompleted, isActive: tutorialActive, setCurrentPage } = useTutorial();

  // Register this page with the tutorial system
  useEffect(() => {
    setCurrentPage("home");
  }, [setCurrentPage]);

  // Start menu music
  useEffect(() => {
    musicEngine.init();
    musicEngine.setScene("menu");
  }, []);

  // Auto-start tutorial for first-time visitors (only once, ever)
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

  // Rotate taglines
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % SASSY_TAGLINES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async () => {
    if (!username.trim()) {
      setError("A name, genius. We need a name. Even villains have names.");
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
      setError(err.message || "Something broke. Shocking, I know.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!username.trim()) {
      setError("A name. You need a name. This isn't that hard.");
      return;
    }
    if (!roomCode.trim()) {
      setError("Room code. The thing your friend gave you. Type it.");
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
      setError(err.message || "Invalid code. Try again, sinner.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-arena relative overflow-hidden noise-overlay">
      {/* Floating ember particles */}
      <EmberField count={24} />

      {/* Floating ambient icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => {
          const Icon = FLOATING_ICONS[i % FLOATING_ICONS.length];
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${5 + Math.random() * 90}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -80, 0],
                opacity: [0.02, 0.08, 0.02],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 15 + Math.random() * 20,
                repeat: Infinity,
                delay: Math.random() * 10,
                ease: "linear",
              }}
            >
              <Icon className="w-5 h-5 text-foreground" />
            </motion.div>
          );
        })}
      </div>

      {/* Music toggle — top right */}
      <div className="absolute top-4 right-4 z-30">
        <MusicToggle />
      </div>

      {/* Decorative corner accents — enhanced with larger gradients */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-wrath/8 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-greed/6 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-envy/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-sloth/5 to-transparent pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Logo / Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-10"
        >
          {/* Decorative top element */}
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-wrath/40" />
            <Skull className="w-5 h-5 text-wrath/50" />
            <div className="h-px w-8 bg-neon-cyan/30" />
            <Skull className="w-5 h-5 text-sloth/50" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-sloth/40" />
          </motion.div>

          <h1
            className="text-5xl md:text-7xl font-black tracking-wider mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <motion.span
              className="text-wrath text-glow-wrath inline-block"
              animate={{ textShadow: ["0 0 12px oklch(0.6 0.28 25 / 0.7)", "0 0 24px oklch(0.6 0.28 25 / 0.9)", "0 0 12px oklch(0.6 0.28 25 / 0.7)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              7
            </motion.span>{" "}
            <span className="text-foreground/90">DEADLY</span>{" "}
            <motion.span
              className="text-sloth text-glow-sloth inline-block"
              animate={{ textShadow: ["0 0 12px oklch(0.52 0.18 290 / 0.7)", "0 0 24px oklch(0.52 0.18 290 / 0.9)", "0 0 12px oklch(0.52 0.18 290 / 0.7)"] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
            >
              SINS
            </motion.span>
          </h1>

          <div className="neon-divider-animated w-56 mx-auto my-4" />

          <p
            className="text-sm tracking-[0.3em] text-muted-foreground uppercase"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            A Card Game of Questionable Morality
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

        {/* Game Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="glass-panel-epic rounded-2xl p-8 shimmer-overlay">
            {/* Username Input */}
            <div className="mb-6">
              <label
                className="block text-[10px] tracking-[0.2em] text-muted-foreground uppercase mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Your Sinful Alias
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="What do they call you, sinner?"
                maxLength={20}
                className="w-full bg-background/60 border border-border/40 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all"
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
                <Flame className="w-4 h-4" />
                {isCreating ? "SUMMONING ARENA..." : "CREATE GAME"}
              </motion.button>

              {/* How to Play button */}
              <motion.button
                data-tutorial="how-to-play"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startTutorial("home")}
                className="w-full rounded-xl py-2.5 px-6 text-[11px] border border-neon-cyan/20 text-neon-cyan/80 hover:bg-neon-cyan/5 hover:border-neon-cyan/30 transition-all flex items-center justify-center gap-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                HOW TO PLAY
              </motion.button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-border/20" />
                <span
                  className="text-[9px] tracking-[0.15em] text-muted-foreground/70 uppercase"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  or crash someone else's party
                </span>
                <div className="flex-1 h-px bg-border/20" />
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
                      placeholder="ROOM CODE"
                      maxLength={6}
                      className="w-full bg-background/60 border border-border/40 rounded-xl px-4 py-3 text-foreground text-center tracking-[0.4em] uppercase placeholder:text-muted-foreground/30 placeholder:tracking-normal placeholder:normal-case focus:outline-none focus:border-sloth/50 focus:ring-1 focus:ring-sloth/20 transition-all text-lg font-bold"
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
                        {isJoining ? "JOINING..." : "ENTER THE ARENA"}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowJoinPanel(false)}
                        className="px-4 py-3 rounded-xl border border-border/20 text-muted-foreground/60 text-sm hover:border-border/40 transition-colors"
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
            <div className="flex items-center justify-center gap-4 text-[10px] tracking-[0.1em] text-muted-foreground/70 uppercase" style={{ fontFamily: "var(--font-heading)" }}>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 2-4 Players</span>
              <span className="text-border/30">&middot;</span>
              <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Real-time</span>
              <span className="text-border/30">&middot;</span>
              <span className="flex items-center gap-1"><Bot className="w-3 h-3" /> Bots for the Friendless</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Sin Preview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          data-tutorial="faction-cards"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl"
        >
          {[
            { Icon: Flame, color: "wrath", glass: "glass-panel-wrath", name: "WRATH", desc: "Burn fast. Hit hard. Self-harm is just a bonus.", tag: "Aggression: Maximum", passive: "Overcharge: Burn 2 HP for +1 energy" },
            { Icon: Moon, color: "sloth", glass: "glass-panel-sloth", name: "SLOTH", desc: "Outlast everyone. Shields and heals that grow over time.", tag: "Endurance: Maximum", passive: "Lethargy: Carry over unspent energy" },
            { Icon: Coins, color: "greed", glass: "glass-panel-greed", name: "GREED", desc: "Steal resources. Drain opponents. Everything has a price.", tag: "Profit: Maximum", passive: "Avarice: Big spends grant bonus energy" },
            { Icon: Eye, color: "envy", glass: "glass-panel-envy", name: "ENVY", desc: "Copy strengths. Punish the strong. Become them.", tag: "Jealousy: Maximum", passive: "Covet: Gain energy when outmatched" },
          ].map((sin) => (
            <SinCard key={sin.name} sin={sin} />
          ))}
        </motion.div>

        {/* Card Mechanics Explainer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          data-tutorial="card-mechanics"
          className="mt-12 max-w-2xl w-full"
        >
          <p
            className="text-[10px] tracking-[0.2em] text-muted-foreground/70 uppercase mb-4 text-center"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            The Two Types of Sin (Pay Attention)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Flat Cards */}
            <div className="glass-panel rounded-xl p-5 shimmer-overlay">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                  <SquareSlash className="w-4 h-4 text-neon-cyan" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neon-cyan tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                    FLAT
                  </h3>
                  <p className="text-[9px] text-muted-foreground/70 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                    Instant Impact
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-foreground/70 leading-relaxed mb-3" style={{ fontFamily: "var(--font-body)" }}>
                One big hit. Resolves immediately. What you see is what you get. No waiting, no hoping, no praying.
              </p>
              <div className="bg-background/40 rounded-lg p-3 border border-border/10">
                <p className="text-[10px] text-foreground/60 mb-1" style={{ fontFamily: "var(--font-heading)" }}>EXAMPLE</p>
                <div className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-wrath/70" />
                  <p className="text-[11px] text-foreground/80" style={{ fontFamily: "var(--font-body)" }}>
                    <span className="text-wrath font-semibold">Fury Strike</span> — 4 damage, right now, done.
                  </p>
                </div>
              </div>
            </div>

            {/* Compounding Cards */}
            <div className="glass-panel rounded-xl p-5 shimmer-overlay">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-neon-yellow/10 border border-neon-yellow/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-neon-yellow" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neon-yellow tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                    COMPOUNDING
                  </h3>
                  <p className="text-[9px] text-muted-foreground/70 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                    3-Round Escalation
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-foreground/70 leading-relaxed mb-3" style={{ fontFamily: "var(--font-body)" }}>
                Ticks for 3 rounds with Fibonacci scaling. Pay once, collect thrice. Patience is a sin too.
              </p>
              <div className="bg-background/40 rounded-lg p-3 border border-border/10">
                <p className="text-[10px] text-foreground/60 mb-2" style={{ fontFamily: "var(--font-heading)" }}>FIBONACCI SCALING [1, 1, 2]</p>
                <div className="flex items-center gap-3 justify-center">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-lg bg-neon-yellow/5 border border-neon-yellow/15 flex items-center justify-center mb-1">
                      <span className="text-sm font-bold text-neon-yellow" style={{ fontFamily: "var(--font-heading)" }}>1&times;</span>
                    </div>
                    <p className="text-[8px] text-muted-foreground/60" style={{ fontFamily: "var(--font-heading)" }}>TICK 1</p>
                  </div>
                  <div className="text-muted-foreground/30 text-xs">&rarr;</div>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-lg bg-neon-yellow/5 border border-neon-yellow/15 flex items-center justify-center mb-1">
                      <span className="text-sm font-bold text-neon-yellow" style={{ fontFamily: "var(--font-heading)" }}>1&times;</span>
                    </div>
                    <p className="text-[8px] text-muted-foreground/60" style={{ fontFamily: "var(--font-heading)" }}>TICK 2</p>
                  </div>
                  <div className="text-muted-foreground/30 text-xs">&rarr;</div>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-lg bg-neon-yellow/10 border border-neon-yellow/30 flex items-center justify-center mb-1">
                      <span className="text-sm font-bold text-neon-yellow" style={{ fontFamily: "var(--font-heading)" }}>2&times;</span>
                    </div>
                    <p className="text-[8px] text-neon-yellow/70 font-semibold" style={{ fontFamily: "var(--font-heading)" }}>PAYOFF</p>
                  </div>
                </div>
                <p className="text-[9px] text-foreground/50 text-center mt-2 italic" style={{ fontFamily: "var(--font-body)" }}>
                  Total value = base &times; 4 over 3 rounds
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Corruption Energy Explainer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-8 max-w-2xl w-full"
        >
          <div className="glass-panel-epic rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-wrath/10 border border-wrath/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-wrath" style={{ animation: 'glow-breathe 2s ease-in-out infinite' }} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-wrath tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                  CORRUPTION ENERGY
                </h3>
                <p className="text-[9px] text-muted-foreground/70 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                  The Fuel of Sin
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-background/30 rounded-lg p-3 text-center border border-border/10">
                <p className="text-lg font-black text-neon-cyan" style={{ fontFamily: "var(--font-heading)" }}>2</p>
                <p className="text-[8px] text-muted-foreground/60 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>Start Energy</p>
              </div>
              <div className="bg-background/30 rounded-lg p-3 text-center border border-border/10">
                <p className="text-lg font-black text-neon-cyan" style={{ fontFamily: "var(--font-heading)" }}>+1</p>
                <p className="text-[8px] text-muted-foreground/60 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>Per Round</p>
              </div>
              <div className="bg-background/30 rounded-lg p-3 text-center border border-border/10">
                <p className="text-lg font-black text-neon-cyan" style={{ fontFamily: "var(--font-heading)" }}>7</p>
                <p className="text-[8px] text-muted-foreground/60 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>Max Cap</p>
              </div>
              <div className="bg-background/30 rounded-lg p-3 text-center border border-border/10">
                <p className="text-lg font-black text-neon-cyan" style={{ fontFamily: "var(--font-heading)" }}>0-5</p>
                <p className="text-[8px] text-muted-foreground/60 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>Card Cost</p>
              </div>
            </div>
            <p className="text-[10px] text-foreground/50 text-center mt-3 italic" style={{ fontFamily: "var(--font-body)" }}>
              Spend corruption to play cards. More corruption = more powerful sins. Use it or lose it.
            </p>
          </div>
        </motion.div>

        {/* How It Works - Quick Rules */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-10 max-w-lg text-center"
        >
          <p
            className="text-[10px] tracking-[0.2em] text-muted-foreground/70 uppercase mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            How This Works (The Short Version)
          </p>
          <div className="flex gap-4 justify-center">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-wrath/10 border border-wrath/20 flex items-center justify-center mx-auto mb-1">
                <span className="text-xs font-bold text-wrath" style={{ fontFamily: "var(--font-heading)" }}>1</span>
              </div>
              <p className="text-[10px] text-foreground/70" style={{ fontFamily: "var(--font-body)" }}>Pick a sin</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center mx-auto mb-1">
                <span className="text-xs font-bold text-neon-cyan" style={{ fontFamily: "var(--font-heading)" }}>2</span>
              </div>
              <p className="text-[10px] text-foreground/70" style={{ fontFamily: "var(--font-body)" }}>Spend corruption</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-neon-yellow/10 border border-neon-yellow/20 flex items-center justify-center mx-auto mb-1">
                <span className="text-xs font-bold text-neon-yellow" style={{ fontFamily: "var(--font-heading)" }}>3</span>
              </div>
              <p className="text-[10px] text-foreground/70" style={{ fontFamily: "var(--font-body)" }}>Flat or compound</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-sloth/10 border border-sloth/20 flex items-center justify-center mx-auto mb-1">
                <span className="text-xs font-bold text-sloth" style={{ fontFamily: "var(--font-heading)" }}>4</span>
              </div>
              <p className="text-[10px] text-foreground/70" style={{ fontFamily: "var(--font-body)" }}>Last sinner wins</p>
            </div>
          </div>
        </motion.div>

        {/* Footer sass */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 text-[9px] text-muted-foreground/40 text-center"
          style={{ fontFamily: "var(--font-body)" }}
        >
          48 cards &middot; 4 factions &middot; 10 rounds &middot; Fibonacci compounding &middot; Zero mercy
        </motion.p>

        {/* Attribution credits for open source assets */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-6 text-[8px] text-muted-foreground/30 text-center space-y-0.5"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <p>Music: "Dark City" by Muncheybobo &middot; "Dark Ambient" by Alexandr Zhelanov &middot; "Dark Ambient Loop 13" by MundoSound</p>
          <p>SFX: Card Game Sounds (CC0) &middot; JC Sounds Fantasy SFX Pack (CC-BY 4.0) &middot; Icons: Painterly Spell Icons by J. W. Bjerk (CC-BY 3.0)</p>
          <p>All assets from <a href="https://opengameart.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-muted-foreground/50 transition-colors">OpenGameArt.org</a></p>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Sin Faction Card with 3D Tilt ─────────────────────── */
function SinCard({ sin }: { sin: { Icon: any; color: string; glass: string; name: string; desc: string; tag: string; passive: string } }) {
  const { ref, handlers } = useCard3DTilt({ maxTilt: 12, scale: 1.06 });
  return (
    <div
      ref={ref}
      {...handlers}
      className={`${sin.glass} rounded-xl p-4 text-center group cursor-default holo-sheen transition-shadow duration-300 hover:shadow-[0_0_30px_oklch(0.5_0.2_var(--sin-hue)/0.2)]`}
      style={{ willChange: 'transform' }}
    >
      <sin.Icon className={`w-7 h-7 text-${sin.color} mx-auto mb-2 transition-all group-hover:drop-shadow-[0_0_8px_currentColor]`} />
      <h3
        className={`text-sm font-bold text-${sin.color} tracking-wider mb-1`}
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {sin.name}
      </h3>
      <p
        className="text-[10px] text-foreground/70 mt-1 leading-relaxed"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {sin.desc}
      </p>
      <div className="flex justify-center gap-1 mt-2">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className={`w-1.5 h-1.5 rounded-full bg-${sin.color}`}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
      <p
        className="text-[8px] text-muted-foreground/70 mt-1 uppercase tracking-[0.15em]"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {sin.tag}
      </p>
      <p
        className={`text-[8px] text-${sin.color}/60 mt-1 italic`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        {sin.passive}
      </p>
    </div>
  );
}
