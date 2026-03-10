/**
 * Home Page - The Gateway to Sin
 *
 * Premium dark neon cyberpunk landing page.
 * Create or join a game. Every piece of text drips with attitude.
 * Invader Zim × Freaky Fred aesthetic with maximum sass.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Flame, Moon, Skull, Swords, Shield, Zap, Users, Bot, Sparkles, Coins, Eye } from "lucide-react";
import { usePlayerId } from "@/hooks/usePlayerId";
import { createGame, joinGame } from "@/lib/gameEngine";

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
                opacity: [0.02, 0.06, 0.02],
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

      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-wrath/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-greed/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-envy/3 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-sloth/3 to-transparent pointer-events-none" />

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

          <div className="neon-divider w-56 mx-auto my-4" />

          <p
            className="text-sm tracking-[0.3em] text-muted-foreground/70 uppercase"
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
          <div className="glass-panel rounded-2xl p-8">
            {/* Username Input */}
            <div className="mb-6">
              <label
                className="block text-[10px] tracking-[0.2em] text-muted-foreground/60 uppercase mb-2"
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
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full btn-wrath rounded-xl py-3.5 px-6 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4" />
                {isCreating ? "SUMMONING ARENA..." : "CREATE GAME"}
              </motion.button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-border/20" />
                <span
                  className="text-[9px] tracking-[0.15em] text-muted-foreground/40 uppercase"
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
            <div className="flex items-center justify-center gap-4 text-[10px] tracking-[0.1em] text-muted-foreground/30 uppercase" style={{ fontFamily: "var(--font-heading)" }}>
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
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl"
        >
          {[
            { Icon: Flame, color: "wrath", glass: "glass-panel-wrath", name: "WRATH", desc: "Burn fast. Hit hard. Self-harm is just a bonus.", tag: "Aggression: Maximum" },
            { Icon: Moon, color: "sloth", glass: "glass-panel-sloth", name: "SLOTH", desc: "Outlast everyone. Let the compounding do the work.", tag: "Endurance: Maximum" },
            { Icon: Coins, color: "greed", glass: "glass-panel-greed", name: "GREED", desc: "Steal resources. Drain opponents. Everything has a price.", tag: "Profit: Maximum" },
            { Icon: Eye, color: "envy", glass: "glass-panel-envy", name: "ENVY", desc: "Copy strengths. Punish the strong. Become them.", tag: "Jealousy: Maximum" },
          ].map((sin) => (
            <motion.div
              key={sin.name}
              whileHover={{ y: -8, scale: 1.04 }}
              className={`${sin.glass} rounded-xl p-4 text-center group`}
            >
              <sin.Icon className={`w-7 h-7 text-${sin.color} mx-auto mb-2 transition-all`} />
              <h3
                className={`text-sm font-bold text-${sin.color} tracking-wider mb-1`}
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {sin.name}
              </h3>
              <p
                className="text-[9px] text-muted-foreground/60 mt-1 leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {sin.desc}
              </p>
              <div className="flex justify-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full bg-${sin.color}`} />
                ))}
              </div>
              <p
                className="text-[7px] text-muted-foreground/30 mt-1 uppercase tracking-[0.15em]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {sin.tag}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* How It Works - Quick Rules */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 max-w-lg text-center"
        >
          <p
            className="text-[9px] tracking-[0.2em] text-muted-foreground/30 uppercase mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            How This Works (Pay Attention)
          </p>
          <div className="flex gap-4 justify-center">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-wrath/10 border border-wrath/20 flex items-center justify-center mx-auto mb-1">
                <span className="text-xs font-bold text-wrath" style={{ fontFamily: "var(--font-heading)" }}>1</span>
              </div>
              <p className="text-[9px] text-muted-foreground/40" style={{ fontFamily: "var(--font-body)" }}>Pick a sin</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center mx-auto mb-1">
                <span className="text-xs font-bold text-neon-cyan" style={{ fontFamily: "var(--font-heading)" }}>2</span>
              </div>
              <p className="text-[9px] text-muted-foreground/40" style={{ fontFamily: "var(--font-body)" }}>Play cards</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-neon-yellow/10 border border-neon-yellow/20 flex items-center justify-center mx-auto mb-1">
                <span className="text-xs font-bold text-neon-yellow" style={{ fontFamily: "var(--font-heading)" }}>3</span>
              </div>
              <p className="text-[9px] text-muted-foreground/40" style={{ fontFamily: "var(--font-body)" }}>Damage compounds</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-sloth/10 border border-sloth/20 flex items-center justify-center mx-auto mb-1">
                <span className="text-xs font-bold text-sloth" style={{ fontFamily: "var(--font-heading)" }}>4</span>
              </div>
              <p className="text-[9px] text-muted-foreground/40" style={{ fontFamily: "var(--font-body)" }}>Last one alive wins</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
