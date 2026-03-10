/**
 * Lobby Page - Sin Selection & Bot Management
 *
 * Players choose their sin, add bots, and wait for the game to start.
 * Every line of text is dripping with contempt for the player's choices.
 */

import { useState, useEffect, useCallback } from "react";
import { useTutorial } from "@/contexts/TutorialContext";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { Flame, Moon, Coins, Eye, Copy, Check, Bot, Play, Crown, Skull, ArrowLeft, Sparkles, Users } from "lucide-react";
import EmberField from "@/components/EmberField";
import { soundEngine } from "@/lib/soundEngine";
import { usePlayerId } from "@/hooks/usePlayerId";
import { chooseSin, startGame, getGameState } from "@/lib/gameEngine";
import { addBot, botChooseSin, isBot as checkIsBot } from "@/lib/botEngine";
import { getClientSupabase } from "@shared/supabaseClient";
import { useNarrator } from "@/hooks/useNarrator";
import type { GameState, PlayerState, SinType } from "@shared/gameTypes";

const LOBBY_QUIPS = [
  "The arena smells like bad decisions and desperation.",
  "Another lobby. Another group of overconfident sinners.",
  "Pick a sin. It's basically a personality test you'll fail.",
  "The bots are judging you. Yes, the bots.",
  "This is the calm before the emotional damage.",
];

// Sin visual and copy config
const SIN_CONFIG: Record<SinType, {
  Icon: typeof Flame;
  color: string;
  glassClass: string;
  dropShadow: string;
  label: string;
  desc: string;
  tagline: string;
  quip: string;
  subtitle: string;
}> = {
  wrath: {
    Icon: Flame,
    color: "wrath",
    glassClass: "glass-panel-wrath",
    dropShadow: "drop-shadow-[0_0_16px_oklch(0.55_0.25_25)]",
    label: "WRATH",
    desc: "High damage. Self-harm. Zero impulse control. Basically you on a Monday.",
    tagline: "Aggression: Yes",
    quip: "Wrath. Subtlety was never your strong suit, was it?",
    subtitle: "anger issues",
  },
  sloth: {
    Icon: Moon,
    color: "sloth",
    glassClass: "glass-panel-sloth",
    dropShadow: "drop-shadow-[0_0_16px_oklch(0.45_0.15_290)]",
    label: "SLOTH",
    desc: "Shields. Heals. Letting others die first. A lifestyle, honestly.",
    tagline: "Effort: Minimal",
    quip: "Sloth. Winning by doing the bare minimum. Relatable.",
    subtitle: "lazy genius",
  },
  greed: {
    Icon: Coins,
    color: "greed",
    glassClass: "glass-panel-greed",
    dropShadow: "drop-shadow-[0_0_16px_oklch(0.65_0.15_85)]",
    label: "GREED",
    desc: "Steal resources. Drain opponents. Everything has a price, and you're collecting.",
    tagline: "Profit: Always",
    quip: "Greed. Taking what isn't yours since... well, always.",
    subtitle: "gold digger",
  },
  envy: {
    Icon: Eye,
    color: "envy",
    glassClass: "glass-panel-envy",
    dropShadow: "drop-shadow-[0_0_16px_oklch(0.5_0.16_155)]",
    label: "ENVY",
    desc: "Copy strengths. Punish the strong. If you can't beat them, become them.",
    tagline: "Jealousy: Weaponized",
    quip: "Envy. You want what they have. Classic.",
    subtitle: "green-eyed",
  },
};

const ALL_SINS: SinType[] = ["wrath", "sloth", "greed", "envy"];

export default function Lobby() {
  const { gameId } = useParams<{ gameId: string }>();
  const playerId = usePlayerId();
  const [, setLocation] = useLocation();
  const [state, setState] = useState<GameState | null>(null);
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isAddingBot, setIsAddingBot] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { displayedText, addMessage, addRandomLine } = useNarrator();
  const { setCurrentPage } = useTutorial();

  // Register this page with the tutorial system
  useEffect(() => {
    setCurrentPage("lobby");
  }, [setCurrentPage]);

  // Random lobby quip on mount
  useEffect(() => {
    const quip = LOBBY_QUIPS[Math.floor(Math.random() * LOBBY_QUIPS.length)];
    addMessage(quip, "info");
  }, []);

  // Load game state
  const loadState = useCallback(async () => {
    if (!gameId) return;
    try {
      const gs = await getGameState(gameId);
      setState(gs);
      if (gs.status === "active") {
        setLocation(`/game/${gameId}`);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [gameId, setLocation]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  // Real-time subscription
  useEffect(() => {
    if (!gameId) return;
    const supabase = getClientSupabase();
    const channel = supabase
      .channel(`lobby-${gameId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "games", filter: `id=eq.${gameId}` }, () => loadState())
      .on("postgres_changes", { event: "*", schema: "public", table: "game_players", filter: `game_id=eq.${gameId}` }, () => loadState())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [gameId, loadState]);

  const players = state?.players || [];
  const myPlayer = players.find((p) => p.id === playerId);
  const isHost = myPlayer?.seatIndex === 0;
  const allChosen = players.length >= 2 && players.every((p) => p.chosenSin);
  const emptySeats = 4 - players.length;

  const handleChooseSin = async (sin: SinType) => {
    if (!gameId) return;
    soundEngine.play("ui_click");
    try {
      await chooseSin(gameId, playerId, sin);
      const cfg = SIN_CONFIG[sin];
      addMessage(cfg.quip, "dramatic");
      await loadState();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddBot = async () => {
    if (!gameId || isAddingBot) return;
    setIsAddingBot(true);
    try {
      soundEngine.play("teleport");
      const { botId, botName } = await addBot(gameId);
      const chosenSin = await botChooseSin(gameId, botId);
      addMessage(
        `${botName} joins and picks ${chosenSin}. It doesn't have feelings, so it's already winning.`,
        "info"
      );
      await loadState();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAddingBot(false);
    }
  };

  const handleStart = async () => {
    if (!gameId || isStarting) return;
    setIsStarting(true);
    soundEngine.play("game_start");
    try {
      await startGame(gameId);
      setLocation(`/game/${gameId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsStarting(false);
    }
  };

  const copyRoomCode = () => {
    if (state?.roomCode) {
      navigator.clipboard.writeText(state.roomCode);
      setCopied(true);
      addMessage("Copied. Now go bother someone with it.", "info");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Loading state
  if (!state) {
    return (
      <div className="min-h-screen bg-arena flex flex-col items-center justify-center noise-overlay gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Skull className="w-12 h-12 text-wrath/40" />
        </motion.div>
        <p className="text-sm text-muted-foreground/70" style={{ fontFamily: "var(--font-body)" }}>
          Summoning the lobby from the void...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-arena relative overflow-hidden noise-overlay">
      {/* Floating ember particles */}
      <EmberField count={16} />
      {/* Ambient corner glows */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-wrath/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-sloth/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-greed/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-envy/5 to-transparent pointer-events-none" />

      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -3 }}
          onClick={() => setLocation("/")}
          className="self-start mb-4 flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          FLEE (COWARD)
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="flex items-center justify-center gap-3 mb-3"
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-wrath/30" />
            <Sparkles className="w-3.5 h-3.5 text-neon-cyan/40" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-sloth/30" />
          </motion.div>
          <p
            className="text-[10px] tracking-[0.3em] text-muted-foreground/70 uppercase mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            The Arena Awaits (Impatiently)
          </p>
          <h1
            className="text-3xl font-black tracking-wider text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            LOBBY
          </h1>
        </motion.div>

        {/* Room Code Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          data-tutorial="room-code"
          className="glass-panel-epic rounded-2xl p-6 mb-6 w-full max-w-lg text-center"
        >
          <p
            className="text-[10px] tracking-[0.2em] text-muted-foreground/70 uppercase mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Share this code (assuming you have friends)
          </p>
          <div className="flex items-center justify-center gap-3">
            <span
              className="text-4xl font-black tracking-[0.5em] text-neon-cyan text-glow-cyan"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {state.roomCode.split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={copyRoomCode}
              className="p-2.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/20 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </motion.button>
          </div>
          <p className="text-[9px] text-muted-foreground/60 mt-2" style={{ fontFamily: "var(--font-body)" }}>
            {copied ? "Copied to clipboard. Go spam your group chat." : "Click the icon to copy. Technology is amazing."}
          </p>
        </motion.div>

        {/* Players Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-lg mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-xs tracking-[0.2em] text-muted-foreground/80 uppercase flex items-center gap-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <Users className="w-3.5 h-3.5" />
              Sinners ({players.length}/4)
            </h2>
            {isHost && emptySeats > 0 && (
              <motion.button
                data-tutorial="add-bot"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddBot}
                disabled={isAddingBot}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-xs hover:bg-neon-cyan/20 transition-colors disabled:opacity-50"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <Bot className="w-3.5 h-3.5" />
                {isAddingBot ? "SUMMONING..." : "ADD BOT (NO FRIENDS?)"}
              </motion.button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {players.map((player: PlayerState, i: number) => {
              const playerIsBot = checkIsBot(player.id);
              const sinCfg = player.chosenSin ? SIN_CONFIG[player.chosenSin as SinType] : null;
              const SinIcon = sinCfg?.Icon;
              return (
                <motion.div
                  key={player.gamePlayerId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className={`rounded-xl p-4 relative overflow-hidden ${
                    sinCfg ? sinCfg.glassClass : "glass-panel"
                  }`}
                >
                  {/* Sin color accent */}
                  {sinCfg && (
                    <div className={`absolute inset-0 opacity-5 bg-${sinCfg.color}`} />
                  )}
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      {i === 0 && <Crown className="w-3.5 h-3.5 text-neon-yellow" />}
                      {playerIsBot && <Bot className="w-3.5 h-3.5 text-neon-cyan/50" />}
                      <span
                        className="text-sm font-bold text-foreground truncate flex-1"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {player.username || `Player ${i + 1}`}
                      </span>
                    </div>
                    {sinCfg && SinIcon ? (
                      <div className="flex items-center gap-1.5">
                        <SinIcon className={`w-3.5 h-3.5 text-${sinCfg.color}`} />
                        <span
                          className={`text-xs uppercase tracking-wider font-bold text-${sinCfg.color}`}
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {player.chosenSin}
                        </span>
                        <span className="text-[8px] text-muted-foreground/60 ml-auto" style={{ fontFamily: "var(--font-body)" }}>
                          {sinCfg.subtitle}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/70 italic" style={{ fontFamily: "var(--font-body)" }}>
                        {player.id === playerId ? "That's you. Pick already." : "Still deciding... how hard is this?"}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Empty Seats */}
            {Array.from({ length: emptySeats }).map((_, i) => (
              <motion.div
                key={`empty-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + 0.1 * i }}
                className="rounded-xl border border-dashed border-border/15 p-4 flex flex-col items-center justify-center gap-1"
              >
                <Skull className="w-4 h-4 text-muted-foreground/10" />
                <span className="text-[10px] text-muted-foreground/50 italic" style={{ fontFamily: "var(--font-body)" }}>
                  Waiting for a victim...
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sin Selection - 2x2 Grid */}
        {myPlayer && !myPlayer.chosenSin && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            data-tutorial="sin-selection"
            className="w-full max-w-lg mb-6"
          >
            <h2
              className="text-xs tracking-[0.2em] text-muted-foreground/80 uppercase mb-1 text-center"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Pick Your Poison
            </h2>
            <p className="text-[9px] text-muted-foreground/70 text-center mb-4" style={{ fontFamily: "var(--font-body)" }}>
              All four options are terrible. That's the point.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {ALL_SINS.map((sin) => {
                const cfg = SIN_CONFIG[sin];
                const SinIcon = cfg.Icon;
                return (
                  <motion.button
                    key={sin}
                    whileHover={{ scale: 1.05, y: -6 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleChooseSin(sin)}
                    className={`${cfg.glassClass} rounded-xl p-5 text-center group pulse-ring holo-sheen transition-shadow duration-300`}
                  >
                    <SinIcon className={`w-9 h-9 text-${cfg.color} mx-auto mb-2 group-hover:${cfg.dropShadow} transition-all`} style={{ animation: 'glow-breathe 3s ease-in-out infinite' }} />
                    <h3
                      className={`text-base font-black text-${cfg.color} tracking-wider mb-1`}
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {cfg.label}
                    </h3>
                    <p className="text-[10px] text-foreground/70 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                      {cfg.desc}
                    </p>
                    <div className="flex justify-center gap-1 mt-2">
                      {[...Array(5)].map((_, j) => (
                        <motion.div
                          key={j}
                          className={`w-1.5 h-1.5 rounded-full bg-${cfg.color}`}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity, delay: j * 0.15 }}
                        />
                      ))}
                    </div>
                    <p className="text-[8px] text-muted-foreground/60 mt-1 uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-heading)" }}>
                      {cfg.tagline}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Narrator */}
        <AnimatePresence>
          {displayedText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-lg mb-6"
            >
              <div className="glass-panel rounded-xl p-4 text-center">
                <p className="narrator-text text-sm">"{displayedText}"</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start Button */}
        {isHost && allChosen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg"
          >
            <motion.button
              data-tutorial="start-game"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              disabled={isStarting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-wrath via-wrath-glow to-sloth text-white font-black text-lg tracking-wider flex items-center justify-center gap-3 disabled:opacity-50 shadow-[0_0_30px_oklch(0.55_0.25_25/0.3)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <Play className="w-5 h-5" />
              {isStarting ? "UNLEASHING CHAOS..." : "LET THE SINS BEGIN"}
            </motion.button>
            <p className="text-[9px] text-muted-foreground/60 text-center mt-2" style={{ fontFamily: "var(--font-body)" }}>
              No refunds. No mercy. No take-backsies.
            </p>
          </motion.div>
        )}

        {/* Waiting messages */}
        {!isHost && !allChosen && (
          <motion.p
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm text-muted-foreground/70 mt-4"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Waiting for the host to stop procrastinating...
          </motion.p>
        )}

        {isHost && !allChosen && players.length >= 2 && (
          <motion.p
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm text-muted-foreground/70 mt-4"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Everyone needs to pick a sin. It's literally four buttons.
          </motion.p>
        )}

        {isHost && players.length < 2 && (
          <motion.p
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm text-muted-foreground/70 mt-4"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Need at least 2 sinners. Add a bot if nobody loves you.
          </motion.p>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-3 rounded-xl bg-wrath/10 border border-wrath/20 max-w-lg w-full"
            >
              <p className="text-sm text-wrath text-center" style={{ fontFamily: "var(--font-body)" }}>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
