/**
 * Lobby Page — Gothic Cathedral Interior
 *
 * A dimly lit cathedral nave where sinners gather before battle.
 * Babylon.js 3D scene behind the UI. Stone-textured panels, ornate
 * gold borders, faction altar cards with portraits, and ritual circle
 * aesthetics. Every line of text drips with contempt.
 */

import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useTutorial } from "@/contexts/TutorialContext";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { Copy, Check, Bot, Play, Crown, ArrowLeft, Users, Lock } from "lucide-react";
import { ICON_URLS } from "@/lib/assetUrls";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import FactionUnlockCelebration from "@/components/FactionUnlockCelebration";
import { useFactionUnlocks, UNLOCK_THRESHOLD, LOCKED_FACTIONS } from "@/hooks/useFactionUnlocks";
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
import { soundEngine } from "@/lib/soundEngine";
import { musicEngine } from "@/lib/musicEngine";
import { usePlayerId } from "@/hooks/usePlayerId";
import { chooseSin, startGame, getGameState } from "@/lib/gameEngine";
import { addBot, botChooseSin, isBot as checkIsBot } from "@/lib/botEngine";
import { getClientSupabase } from "@shared/supabaseClient";
import { useNarrator } from "@/hooks/useNarrator";
import type { GameState, PlayerState, SinType } from "@shared/gameTypes";

const LobbyBabylonScene = lazy(() => import("@/components/LobbyBabylonScene"));

const LOBBY_QUIPS = [
  "The cathedral echoes with the sound of poor life choices.",
  "Another gathering of sinners. The pews are weeping.",
  "Choose your sin. The confessional is permanently closed.",
  "Even the gargoyles are judging you right now.",
  "The incense smells like regret and overconfidence.",
];

// Sin visual config — gothic cathedral style
const SIN_CONFIG: Record<SinType, {
  color: string;
  glassClass: string;
  label: string;
  desc: string;
  tagline: string;
  quip: string;
  subtitle: string;
  latin: string;
}> = {
  wrath: {
    color: "wrath",
    glassClass: "glass-panel-wrath",
    label: "WRATH",
    desc: "Burn everything. Self-harm is just collateral. Impulse control is for the weak.",
    tagline: "IRA",
    quip: "Wrath. The cathedral trembles at your rage.",
    subtitle: "The Destroyer",
    latin: "Ira",
  },
  sloth: {
    color: "sloth",
    glassClass: "glass-panel-sloth",
    label: "SLOTH",
    desc: "Outlast everyone. Shields and heals that grow over time. Patience is a weapon.",
    tagline: "ACEDIA",
    quip: "Sloth. Even the dust settles faster than you.",
    subtitle: "The Enduring",
    latin: "Acedia",
  },
  greed: {
    color: "greed",
    glassClass: "glass-panel-greed",
    label: "GREED",
    desc: "Steal resources. Drain opponents. Everything has a price, and you're collecting.",
    tagline: "AVARITIA",
    quip: "Greed. The offering plates are already empty.",
    subtitle: "The Collector",
    latin: "Avaritia",
  },
  envy: {
    color: "envy",
    glassClass: "glass-panel-envy",
    label: "ENVY",
    desc: "Copy strengths. Punish the strong. If you can't beat them, become them.",
    tagline: "INVIDIA",
    quip: "Envy. The stained glass turns green at your gaze.",
    subtitle: "The Mimic",
    latin: "Invidia",
  },
  pride: {
    color: "pride",
    glassClass: "glass-panel-pride",
    label: "PRIDE",
    desc: "Ascend above all. Free cards build divine shields. Perfection is your birthright.",
    tagline: "SUPERBIA",
    quip: "Pride. The cathedral bows before your radiance.",
    subtitle: "The Exalted",
    latin: "Superbia",
  },
  lust: {
    color: "lust",
    glassClass: "glass-panel-lust",
    label: "LUST",
    desc: "Seduce and drain. Each strike heals you. Desire is the sweetest poison.",
    tagline: "LUXURIA",
    quip: "Lust. The roses bloom with thorns in your wake.",
    subtitle: "The Temptress",
    latin: "Luxuria",
  },
  gluttony: {
    color: "gluttony",
    glassClass: "glass-panel-gluttony",
    label: "GLUTTONY",
    desc: "Consume everything. AoE attacks fuel your hunger. More is never enough.",
    tagline: "GULA",
    quip: "Gluttony. The feast never ends, only grows.",
    subtitle: "The Devourer",
    latin: "Gula",
  },
};

const ALL_SINS: SinType[] = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];

/* ── Ornate Divider SVG ── */
function OrnamentDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent to-candle/30" />
      <svg width="16" height="16" viewBox="0 0 16 16" className="text-candle/40">
        <path d="M8 0L10 6L16 8L10 10L8 16L6 10L0 8L6 6Z" fill="currentColor" />
      </svg>
      <div className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent to-candle/30" />
    </div>
  );
}

/* ── Stone Panel wrapper ── */
function StonePanel({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  return (
    <div className={`
      relative rounded-xl overflow-hidden
      bg-gradient-to-b from-[#1a1520]/90 to-[#0f0c14]/95
      border border-candle/15
      backdrop-blur-md
      ${glow ? "shadow-[0_0_30px_oklch(0.55_0.12_60/0.15)]" : "shadow-lg shadow-black/40"}
      ${className}
    `}>
      {/* Stone texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(200,180,140,0.15) 2px,
            rgba(200,180,140,0.15) 4px
          ), repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(200,180,140,0.1) 2px,
            rgba(200,180,140,0.1) 4px
          )`
        }}
      />
      {/* Gold corner accents */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-candle/25 rounded-tl-xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-candle/25 rounded-tr-xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-candle/25 rounded-bl-xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-candle/25 rounded-br-xl pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

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
  const factionUnlocks = useFactionUnlocks();

  useEffect(() => { setCurrentPage("lobby"); }, [setCurrentPage]);
  useEffect(() => { musicEngine.init(); musicEngine.setScene("menu"); }, []);
  useEffect(() => {
    const quip = LOBBY_QUIPS[Math.floor(Math.random() * LOBBY_QUIPS.length)];
    addMessage(quip, "info");
  }, []);

  const loadState = useCallback(async () => {
    if (!gameId) return;
    try {
      const gs = await getGameState(gameId);
      setState(gs);
      if (gs.status === "active") setLocation(`/game/${gameId}`);
    } catch (err: any) { setError(err.message); }
  }, [gameId, setLocation]);

  useEffect(() => { loadState(); }, [loadState]);

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
      addMessage(SIN_CONFIG[sin].quip, "dramatic");
      await loadState();
    } catch (err: any) { setError(err.message); }
  };

  const handleAddBot = async () => {
    if (!gameId || isAddingBot) return;
    setIsAddingBot(true);
    try {
      soundEngine.play("teleport");
      const { botId, botName } = await addBot(gameId);
      const chosenSin = await botChooseSin(gameId, botId);
      addMessage(`${botName} materializes from the shadows and pledges to ${chosenSin}.`, "info");
      await loadState();
    } catch (err: any) { setError(err.message); }
    finally { setIsAddingBot(false); }
  };

  const handleStart = async () => {
    if (!gameId || isStarting) return;
    setIsStarting(true);
    soundEngine.play("game_start");
    try { await startGame(gameId); setLocation(`/game/${gameId}`); }
    catch (err: any) { setError(err.message); }
    finally { setIsStarting(false); }
  };

  const copyRoomCode = () => {
    if (state?.roomCode) {
      navigator.clipboard.writeText(state.roomCode);
      setCopied(true);
      addMessage("Copied. Now go summon someone with it.", "info");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Loading
  if (!state) {
    return (
      <div className="min-h-screen bg-arena flex flex-col items-center justify-center gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
          <img src={ICON_URLS.debuff_wrath} alt="" className="w-10 h-10 object-contain opacity-30" />
        </motion.div>
        <p className="text-sm text-candle/40" style={{ fontFamily: "var(--font-body)" }}>
          Opening the cathedral doors...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0a0810 0%, #12101a 50%, #0a0810 100%)" }}>
      {/* Babylon.js 3D Cathedral Background */}
      <Suspense fallback={null}>
        <LobbyBabylonScene className="opacity-60" />
      </Suspense>

      {/* Dark gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" style={{ zIndex: 1 }} />

      {/* Main UI */}
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-6">

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -3 }}
          onClick={() => setLocation("/")}
          className="self-start mb-4 flex items-center gap-1.5 text-xs text-candle/50 hover:text-candle/80 transition-colors"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          FLEE THE CATHEDRAL
        </motion.button>

        {/* Header — Cathedral Arch Style */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <OrnamentDivider className="mb-3" />
          <p
            className="text-[10px] tracking-[0.4em] text-candle/50 uppercase mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            The Congregation Assembles
          </p>
          <h1
            className="text-4xl font-black tracking-[0.15em] text-candle text-glow-candle"
            style={{ fontFamily: "var(--font-display)" }}
          >
            SANCTUM
          </h1>
          <p className="text-[9px] text-candle/30 mt-1 tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-heading)" }}>
            Where sinners gather before judgment
          </p>
          <OrnamentDivider className="mt-3" />
        </motion.div>

        {/* Room Code — Ornate Stone Tablet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          data-tutorial="room-code"
          className="w-full max-w-lg mb-6"
        >
          <StonePanel glow className="p-6 text-center">
            <p
              className="text-[10px] tracking-[0.3em] text-candle/50 uppercase mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Ritual Summoning Code
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="flex gap-2">
                {state.roomCode.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 15, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.4, type: "spring" }}
                    className="inline-flex items-center justify-center w-11 h-14 rounded-lg
                      bg-gradient-to-b from-candle/10 to-candle/5
                      border border-candle/20
                      text-3xl font-black text-candle text-glow-candle"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={copyRoomCode}
                className="p-3 rounded-lg bg-candle/10 border border-candle/20 text-candle hover:bg-candle/20 transition-all hover:shadow-[0_0_15px_oklch(0.55_0.12_60/0.2)]"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </motion.button>
            </div>
            <p className="text-[9px] text-candle/40 mt-3" style={{ fontFamily: "var(--font-body)" }}>
              {copied ? "Inscribed to your clipboard. Go summon the worthy." : "Share this inscription to summon others to the ritual."}
            </p>
          </StonePanel>
        </motion.div>

        {/* Players — Stone Pew Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-lg mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-xs tracking-[0.25em] text-candle/60 uppercase flex items-center gap-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <Users className="w-3.5 h-3.5" />
              Congregation ({players.length}/4)
            </h2>
            {isHost && emptySeats > 0 && (
              <motion.button
                data-tutorial="add-bot"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddBot}
                disabled={isAddingBot}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  bg-candle/8 border border-candle/20 text-candle/80 text-xs
                  hover:bg-candle/15 hover:border-candle/30 transition-all disabled:opacity-50"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <Bot className="w-3.5 h-3.5" />
                {isAddingBot ? "SUMMONING..." : "CONJURE PHANTOM"}
              </motion.button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {players.map((player: PlayerState, i: number) => {
              const playerIsBot = checkIsBot(player.id);
              const sinCfg = player.chosenSin ? SIN_CONFIG[player.chosenSin as SinType] : null;
              const sinIcon = player.chosenSin ? SIN_ARCHETYPE_ICONS[player.chosenSin as SinType] : null;
              const portrait = player.chosenSin ? FACTION_PORTRAITS[player.chosenSin as SinType] : null;
              return (
                <motion.div
                  key={player.gamePlayerId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <StonePanel className="p-3 h-full">
                    {/* Portrait background */}
                    {portrait && (
                      <div className="absolute inset-0 opacity-15 rounded-xl overflow-hidden">
                        <img src={portrait} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c14] via-[#0f0c14]/80 to-transparent" />
                      </div>
                    )}
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        {i === 0 && <Crown className="w-3.5 h-3.5 text-candle" />}
                        {playerIsBot && <Bot className="w-3.5 h-3.5 text-candle/40" />}
                        <span
                          className="text-sm font-bold text-foreground/90 truncate flex-1"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {player.username || `Sinner ${i + 1}`}
                        </span>
                      </div>
                      {sinCfg && sinIcon ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: `radial-gradient(circle, var(--color-${sinCfg.color}) 0%, transparent 70%)`, opacity: 0.3 }}>
                            <img src={sinIcon} alt={player.chosenSin || ''} className="w-5 h-5 object-contain" />
                          </div>
                          <div>
                            <span
                              className={`text-xs uppercase tracking-wider font-bold text-${sinCfg.color}`}
                              style={{ fontFamily: "var(--font-heading)" }}
                            >
                              {sinCfg.latin}
                            </span>
                            <p className="text-[8px] text-candle/40" style={{ fontFamily: "var(--font-body)" }}>
                              {sinCfg.subtitle}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-candle/40 italic" style={{ fontFamily: "var(--font-body)" }}>
                          {player.id === playerId ? "Awaiting your confession..." : "Contemplating their sins..."}
                        </span>
                      )}
                    </div>
                  </StonePanel>
                </motion.div>
              );
            })}

            {/* Empty Pews */}
            {Array.from({ length: emptySeats }).map((_, i) => (
              <motion.div
                key={`empty-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + 0.1 * i }}
                className="rounded-xl border border-dashed border-candle/10 p-4 flex flex-col items-center justify-center gap-2"
              >
                <div className="w-8 h-8 rounded-full border border-candle/10 flex items-center justify-center">
                  <img src={ICON_URLS.debuff_wrath} alt="" className="w-4 h-4 object-contain opacity-15" />
                </div>
                <span className="text-[10px] text-candle/30 italic" style={{ fontFamily: "var(--font-body)" }}>
                  Empty pew...
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── SIN SELECTION — Faction Altar Cards ── */}
        {myPlayer && !myPlayer.chosenSin && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            data-tutorial="sin-selection"
            className="w-full max-w-lg mb-6"
          >
            <OrnamentDivider className="mb-4" />
            <h2
              className="text-xs tracking-[0.3em] text-candle/60 uppercase mb-1 text-center"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Choose Your Sin
            </h2>
            <p className="text-[9px] text-candle/35 text-center mb-5" style={{ fontFamily: "var(--font-body)" }}>
              {factionUnlocks.isUnlocked
                ? "Kneel before the altar. All four paths lead to damnation."
                : `Complete ${factionUnlocks.gamesRemaining} more ritual${factionUnlocks.gamesRemaining !== 1 ? "s" : ""} to unlock Greed & Envy.`}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
              {ALL_SINS.map((sin) => {
                const cfg = SIN_CONFIG[sin];
                const isLocked = !factionUnlocks.isFactionAvailable(sin);
                const portrait = FACTION_PORTRAITS[sin];
                const spellIcon = SIN_ARCHETYPE_ICONS[sin];

                if (isLocked) {
                  return (
                    <StonePanel key={sin} className="p-3 text-center opacity-50">
                      <div className="absolute inset-0 opacity-10 rounded-xl overflow-hidden">
                        <img src={portrait} alt="" className="w-full h-full object-cover blur-sm" />
                      </div>
                      <div className="relative z-10">
                        <div className="relative mx-auto mb-2 w-9 h-9 flex items-center justify-center">
                          <img src={spellIcon} alt={cfg.label} className="w-9 h-9 object-contain opacity-20" />
                          <Lock className="w-4 h-4 text-candle/40 absolute -bottom-0.5 -right-0.5" />
                        </div>
                        <h3 className="text-base font-black text-candle/30 tracking-wider mb-1"
                          style={{ fontFamily: "var(--font-display)" }}>
                          {cfg.label}
                        </h3>
                        <p className="text-[10px] text-candle/30 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                          Sealed — {factionUnlocks.gamesRemaining} rituals remain
                        </p>
                        <div className="mt-2 mx-auto w-3/4 h-1.5 rounded-full bg-candle/10 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${factionUnlocks.progress * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-candle/40 to-candle/60"
                          />
                        </div>
                        <p className="text-[8px] text-candle/30 mt-1.5 uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-heading)" }}>
                          {factionUnlocks.gamesPlayed}/{UNLOCK_THRESHOLD} RITUALS
                        </p>
                      </div>
                    </StonePanel>
                  );
                }

                return (
                  <motion.button
                    key={sin}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleChooseSin(sin)}
                    className="text-left group"
                  >
                    <StonePanel className="p-0 overflow-hidden transition-shadow duration-300 hover:shadow-[0_0_25px_var(--color-${cfg.color}/0.2)]">
                      {/* Portrait */}
                      <div className="w-full aspect-[3/4] relative overflow-hidden">
                        <img
                          src={portrait}
                          alt={`${cfg.label} faction`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                        {/* Gradient overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c14] via-[#0f0c14]/50 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0c14]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Sin icon badge */}
                        <div className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center
                          bg-black/50 border border-candle/20 backdrop-blur-sm">
                          <img src={spellIcon} alt="" className="w-5 h-5 object-contain"
                            style={{ filter: `drop-shadow(0 0 4px var(--color-${cfg.color}))` }} />
                        </div>

                        {/* Latin name overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-[9px] tracking-[0.3em] text-candle/50 uppercase mb-0.5"
                            style={{ fontFamily: "var(--font-heading)" }}>
                            {cfg.latin}
                          </p>
                          <h3 className={`text-lg font-black text-${cfg.color} tracking-wider`}
                            style={{ fontFamily: "var(--font-display)" }}>
                            {cfg.label}
                          </h3>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="p-3 pt-2">
                        <p className="text-[10px] text-foreground/60 leading-relaxed mb-2"
                          style={{ fontFamily: "var(--font-body)" }}>
                          {cfg.desc}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] text-candle/40 uppercase tracking-[0.2em]"
                            style={{ fontFamily: "var(--font-heading)" }}>
                            {cfg.subtitle}
                          </span>
                          <div className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ background: `var(--color-${cfg.color})`, boxShadow: `0 0 6px var(--color-${cfg.color})` }} />
                        </div>
                      </div>
                    </StonePanel>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Narrator — Parchment Scroll */}
        <AnimatePresence>
          {displayedText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-lg mb-6"
            >
              <StonePanel className="p-4 text-center">
                <p className="text-sm italic text-candle/70" style={{ fontFamily: "var(--font-body)" }}>
                  "{displayedText}"
                </p>
              </StonePanel>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start Button — Ritual Activation */}
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
              className="w-full py-4 rounded-xl relative overflow-hidden
                bg-gradient-to-r from-wrath/80 via-candle/60 to-sloth/80
                text-white font-black text-lg tracking-[0.15em]
                flex items-center justify-center gap-3
                disabled:opacity-50
                shadow-[0_0_40px_oklch(0.55_0.12_60/0.3)]
                border border-candle/30"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
              <Play className="w-5 h-5 relative z-10" />
              <span className="relative z-10">
                {isStarting ? "COMMENCING RITUAL..." : "BEGIN THE JUDGMENT"}
              </span>
            </motion.button>
            <p className="text-[9px] text-candle/30 text-center mt-2" style={{ fontFamily: "var(--font-body)" }}>
              No absolution. No mercy. No escape.
            </p>
          </motion.div>
        )}

        {/* Waiting messages */}
        {!isHost && !allChosen && (
          <motion.p
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-sm text-candle/40 mt-4"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Awaiting the high priest's command...
          </motion.p>
        )}

        {isHost && !allChosen && players.length >= 2 && (
          <motion.p
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-sm text-candle/40 mt-4"
            style={{ fontFamily: "var(--font-body)" }}
          >
            All must confess their sin before the ritual begins.
          </motion.p>
        )}

        {isHost && players.length < 2 && (
          <motion.p
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-sm text-candle/40 mt-4"
            style={{ fontFamily: "var(--font-body)" }}
          >
            The ritual requires at least two souls. Conjure a phantom if none answer.
          </motion.p>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 max-w-lg w-full"
            >
              <StonePanel className="p-3">
                <p className="text-sm text-wrath text-center" style={{ fontFamily: "var(--font-body)" }}>{error}</p>
              </StonePanel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Faction Unlock Celebration */}
      <FactionUnlockCelebration
        show={factionUnlocks.showCelebration}
        onDismiss={factionUnlocks.dismissCelebration}
      />
    </div>
  );
}
