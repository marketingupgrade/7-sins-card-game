/**
 * Lobby Page — Gothic Cathedral Interior
 *
 * A dimly lit cathedral nave where sinners gather before battle.
 * Babylon.js 3D scene behind the UI. Stone-textured panels, ornate
 * gold borders, faction altar cards with portraits, and ritual circle
 * aesthetics. Every line of text drips with contempt.
 */

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { useTutorial } from "@/contexts/TutorialContext";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { Copy, Check, Bot, Play, Crown, ArrowLeft, Users, Lock, Timer, Sparkles, MessageSquare } from "lucide-react";
import { ICON_URLS } from "@/lib/assetUrls";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import FactionUnlockCelebration from "@/components/FactionUnlockCelebration";
import { useFactionUnlocks, UNLOCK_THRESHOLD, LOCKED_FACTIONS } from "@/hooks/useFactionUnlocks";
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
import { soundEngine } from "@/lib/soundEngine";
import { musicEngine } from "@/lib/musicEngine";
import { usePlayerId } from "@/hooks/usePlayerId";
import { useAuth } from "@/_core/hooks/useAuth";
import { chooseSin, startGame, getGameState, setCustomDeck, setTurnTimer, setAISettings } from "@/lib/gameEngine";
import { getDeckForSin, ALL_CARDS } from "@shared/cardData";
import { addBot, botChooseSin, isBot as checkIsBot } from "@/lib/botEngine";
import { getClientSupabase } from "@shared/supabaseClient";
import { useNarrator } from "@/hooks/useNarrator";
import QuickStartModal, { useQuickStartNeeded } from "@/components/QuickStartModal";
import type { GameState, PlayerState, SinType } from "@shared/gameTypes";
import { PASSIVE_INFO, FACTION_SWOT, TIMER_OPTIONS, DEFAULT_TURN_TIMER } from "@shared/gameTypes";
import { usePageMeta } from "@/hooks/usePageMeta";

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
    desc: "Burn bright. Burn fast. Burn everything.",
    tagline: "IRA",
    quip: "Wrath. The cathedral trembles at your rage.",
    subtitle: "The Destroyer",
    latin: "Ira",
  },
  sloth: {
    color: "sloth",
    glassClass: "glass-panel-sloth",
    label: "SLOTH",
    desc: "Why rush? Everything dies eventually.",
    tagline: "ACEDIA",
    quip: "Sloth. Even the dust settles faster than you.",
    subtitle: "The Enduring",
    latin: "Acedia",
  },
  greed: {
    color: "greed",
    glassClass: "glass-panel-greed",
    label: "GREED",
    desc: "Everything has a price. Yours is higher.",
    tagline: "AVARITIA",
    quip: "Greed. The offering plates are already empty.",
    subtitle: "The Collector",
    latin: "Avaritia",
  },
  envy: {
    color: "envy",
    glassClass: "glass-panel-envy",
    label: "ENVY",
    desc: "If I can't have it, neither can you.",
    tagline: "INVIDIA",
    quip: "Envy. The stained glass turns green at your gaze.",
    subtitle: "The Mimic",
    latin: "Invidia",
  },
  pride: {
    color: "pride",
    glassClass: "glass-panel-pride",
    label: "PRIDE",
    desc: "Kneel. Or be made to.",
    tagline: "SUPERBIA",
    quip: "Pride. The cathedral bows before your radiance.",
    subtitle: "The Exalted",
    latin: "Superbia",
  },
  lust: {
    color: "lust",
    glassClass: "glass-panel-lust",
    label: "LUST",
    desc: "Come closer. It only hurts at first.",
    tagline: "LUXURIA",
    quip: "Lust. The roses bloom with thorns in your wake.",
    subtitle: "The Temptress",
    latin: "Luxuria",
  },
  gluttony: {
    color: "gluttony",
    glassClass: "glass-panel-gluttony",
    label: "GLUTTONY",
    desc: "More. Always more. Never enough.",
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
  usePageMeta({
    title: "Game Lobby",
    description: "Choose your sin faction and prepare for battle in the Cathedral of Sins.",
    noindex: true,
  });

  const { gameId } = useParams<{ gameId: string }>();
  const playerId = usePlayerId();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [state, setState] = useState<GameState | null>(null);
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isAddingBot, setIsAddingBot] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { displayedText, addMessage, addRandomLine } = useNarrator();
  const { setCurrentPage } = useTutorial();
  const factionUnlocks = useFactionUnlocks();
  const [showDeckPicker, setShowDeckPicker] = useState(false);
  const [selectedDeckName, setSelectedDeckName] = useState<string | null>(null);
  const [selectedTimer, setSelectedTimer] = useState<number>(DEFAULT_TURN_TIMER);
  const [aiNarratorEnabled, setAiNarratorEnabled] = useState(true);
  const [aiWhispererEnabled, setAiWhispererEnabled] = useState(true);
  const [hoveredSin, setHoveredSin] = useState<SinType | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      // Sync timer from game state
      if (gs.turnTimerSeconds) setSelectedTimer(gs.turnTimerSeconds);
      if (gs.aiNarrator !== undefined) setAiNarratorEnabled(gs.aiNarrator);
      if (gs.aiWhisperer !== undefined) setAiWhispererEnabled(gs.aiWhisperer);
      if (gs.status === "active") setLocation(`/game/${gameId}`);
    } catch (err: any) { console.error("[LoadState]", err); setError("Failed to load the lobby. Please refresh the page."); }
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
      // Show deck picker after choosing sin
      setShowDeckPicker(true);
    } catch (err: any) { console.error("[ChooseSin]", err); setError("Could not pledge your sin. Please try again."); }
  };

  // Load saved decks for the chosen faction from localStorage
  // Uses the same key as DeckBuilder: "7sins_decks"
  const getSavedDecks = (faction: string): { id: string; name: string; faction: SinType; cardIds: string[]; updatedAt: number }[] => {
    try {
      const raw = localStorage.getItem("7sins_decks");
      if (!raw) return [];
      const all = JSON.parse(raw) as { id: string; name: string; faction: SinType; cardIds: string[]; updatedAt: number }[];
      return all.filter((d) => d.faction === faction);
    } catch { return []; }
  };

  const handleSelectDeck = async (deckCardIds: string[] | null, deckName: string) => {
    if (!gameId) return;
    soundEngine.play("ui_click");
    try {
      await setCustomDeck(gameId, playerId, deckCardIds);
      setSelectedDeckName(deckName);
      setShowDeckPicker(false);
      addMessage(
        deckCardIds
          ? `Deck "${deckName}" bound to your soul. ${deckCardIds.length} cards of damnation.`
          : "Random 30 selected. Fate decides your hand.",
        "info"
      );
    } catch (err: any) { console.error("[SelectDeck]", err); setError("Could not bind your deck. Please try again."); }
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
    } catch (err: any) { console.error("[AddBot]", err); setError("The shadows refuse to answer. Try summoning again."); }
    finally { setIsAddingBot(false); }
  };

  const handleTimerChange = async (seconds: number) => {
    if (!gameId) return;
    soundEngine.play("ui_click");
    setSelectedTimer(seconds);
    try {
      await setTurnTimer(gameId, seconds);
      const opt = TIMER_OPTIONS.find(o => o.value === seconds);
      addMessage(opt ? `Turn timer set to ${opt.label}. ${opt.description}.` : `Timer set to ${seconds}s.`, "info");
    } catch (err: any) {
      console.error("[SetTimer]", err);
      setError("Failed to set the timer. Try again.");
    }
  };

  const handleAIToggle = async (setting: 'narrator' | 'whisperer') => {
    if (!gameId) return;
    soundEngine.play("ui_click");
    const newValue = setting === 'narrator' ? !aiNarratorEnabled : !aiWhispererEnabled;
    if (setting === 'narrator') setAiNarratorEnabled(newValue);
    else setAiWhispererEnabled(newValue);
    try {
      await setAISettings(gameId, setting === 'narrator' ? { aiNarrator: newValue } : { aiWhisperer: newValue });
      addMessage(
        setting === 'narrator'
          ? (newValue ? "The Living Narrator awakens. Every round will be unique." : "The Narrator falls silent. Static lines will be used.")
          : (newValue ? "The Sin Whisperer stirs. Your sin will tempt you each round." : "The Whisperer is silenced. Choose your cards in peace."),
        "info"
      );
    } catch (err: any) {
      console.error("[AIToggle]", err);
      // Revert on failure
      if (setting === 'narrator') setAiNarratorEnabled(!newValue);
      else setAiWhispererEnabled(!newValue);
    }
  };

  const handleStart = async () => {
    if (!gameId || isStarting) return;
    setIsStarting(true);
    soundEngine.play("game_start");
    try { await startGame(gameId); setLocation(`/game/${gameId}`); }
    catch (err: any) { console.error("[StartGame]", err); setError("The ritual failed to begin. Please try again."); }
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
          <img src={ICON_URLS.debuff_wrath} alt="" aria-hidden="true" className="w-10 h-10 object-contain opacity-30" />
        </motion.div>
        <p className="text-sm text-candle/40" style={{ fontFamily: "var(--font-body)" }}>
          Opening the cathedral doors...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0a0810 0%, #12101a 50%, #0a0810 100%)" }}>
      {/* Quick Start modal for first-time players */}
      <QuickStartModal />

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
          className="self-start mb-4 flex items-center gap-1.5 text-sm text-candle/50 hover:text-candle/80 transition-colors"
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
            className="text-xs tracking-[0.4em] text-candle/50 uppercase mb-2"
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
          <p className="text-xs text-candle/30 mt-1 tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-heading)" }}>
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
              className="text-xs tracking-[0.3em] text-candle/50 uppercase mb-3"
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
            <p className="text-xs text-candle/40 mt-3" style={{ fontFamily: "var(--font-body)" }}>
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
              className="text-sm tracking-[0.25em] text-candle/60 uppercase flex items-center gap-2"
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
                  bg-candle/8 border border-candle/20 text-candle/80 text-sm
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
                        <img src={portrait} alt="Character portrait" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c14] via-[#0f0c14]/80 to-transparent" />
                      </div>
                    )}
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        {i === 0 && <Crown className="w-3.5 h-3.5 text-candle" />}
                        {playerIsBot && <Bot className="w-3.5 h-3.5 text-candle/40" />}
                        <span
                          className="text-base font-bold text-foreground/90 truncate flex-1"
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
                              className={`text-sm uppercase tracking-wider font-bold text-${sinCfg.color}`}
                              style={{ fontFamily: "var(--font-heading)" }}
                            >
                              {sinCfg.latin}
                            </span>
                            <p className="text-xs text-candle/40" style={{ fontFamily: "var(--font-body)" }}>
                              {sinCfg.subtitle}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-candle/40 italic" style={{ fontFamily: "var(--font-body)" }}>
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
                  <img src={ICON_URLS.debuff_wrath} alt="" aria-hidden="true" className="w-4 h-4 object-contain opacity-15" />
                </div>
                <span className="text-xs text-candle/30 italic" style={{ fontFamily: "var(--font-body)" }}>
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
            className="w-full max-w-4xl mb-6"
          >
            <OrnamentDivider className="mb-4" />
            <h2
              className="text-sm tracking-[0.3em] text-candle/60 uppercase mb-1 text-center"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Choose Your Sin
            </h2>
            <p className="text-xs text-candle/35 text-center mb-5" style={{ fontFamily: "var(--font-body)" }}>
              {factionUnlocks.isUnlocked
                ? "Kneel before the altar. All seven paths lead to damnation."
                : `Complete ${factionUnlocks.gamesRemaining} more ritual${factionUnlocks.gamesRemaining !== 1 ? "s" : ""} to unlock Greed & Envy.`}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3">
              {ALL_SINS.map((sin) => {
                const cfg = SIN_CONFIG[sin];
                const isLocked = !factionUnlocks.isFactionAvailable(sin);
                const portrait = FACTION_PORTRAITS[sin];
                const spellIcon = SIN_ARCHETYPE_ICONS[sin];
                const isHovered = hoveredSin === sin;

                if (isLocked) {
                  return (
                    <div key={sin} className="flex flex-col">
                      <StonePanel className="p-3 text-center opacity-50 h-full">
                        <div className="absolute inset-0 opacity-10 rounded-xl overflow-hidden">
                          <img src={portrait} alt="" aria-hidden="true" className="w-full h-full object-cover blur-sm" />
                        </div>
                        <div className="relative z-10">
                          <div className="relative mx-auto mb-2 w-9 h-9 flex items-center justify-center">
                            <img src={spellIcon} alt={cfg.label} className="w-9 h-9 object-contain opacity-20" />
                            <Lock className="w-4 h-4 text-candle/40 absolute -bottom-0.5 -right-0.5" />
                          </div>
                          <h3 className="text-sm font-black text-candle/30 tracking-wider mb-1"
                            style={{ fontFamily: "var(--font-display)" }}>
                            {cfg.label}
                          </h3>
                          <p className="text-[10px] text-candle/30 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                            Sealed
                          </p>
                          <div className="mt-2 mx-auto w-3/4 h-1 rounded-full bg-candle/10 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${factionUnlocks.progress * 100}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="h-full rounded-full bg-gradient-to-r from-candle/40 to-candle/60"
                            />
                          </div>
                          <p className="text-[9px] text-candle/30 mt-1 uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-heading)" }}>
                            {factionUnlocks.gamesPlayed}/{UNLOCK_THRESHOLD}
                          </p>
                        </div>
                      </StonePanel>
                    </div>
                  );
                }

                const passive = PASSIVE_INFO[sin];

                return (
                  <motion.button
                    key={sin}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleChooseSin(sin)}
                    onMouseEnter={() => {
                      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                      setHoveredSin(sin);
                    }}
                    onMouseLeave={() => {
                      hoverTimeoutRef.current = setTimeout(() => setHoveredSin(null), 150);
                    }}
                    className="text-left group flex flex-col"
                  >
                    <StonePanel className="p-0 overflow-hidden h-full transition-all duration-300">
                      {/* Hover glow overlay */}
                      {isHovered && (
                        <div className="absolute inset-0 rounded-xl pointer-events-none z-20 transition-opacity duration-300"
                          style={{
                            boxShadow: `0 0 20px var(--color-${cfg.color}-glow), 0 0 40px color-mix(in oklch, var(--color-${cfg.color}) 20%, transparent)`,
                            border: `1px solid color-mix(in oklch, var(--color-${cfg.color}) 40%, transparent)`,
                            borderRadius: 'inherit',
                          }}
                        />
                      )}
                      {/* Portrait — fixed aspect ratio */}
                      <div className="w-full aspect-[3/4] relative overflow-hidden">
                        <img
                          src={portrait}
                          alt={`${cfg.label} faction`}
                          className={`w-full h-full object-cover transition-transform duration-700 ${
                            isHovered ? 'scale-110' : 'scale-100'
                          }`}
                          loading="lazy"
                        />
                        {/* Gradient overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c14] via-[#0f0c14]/50 to-transparent" />
                        <div className={`absolute inset-0 bg-gradient-to-b from-[#0f0c14]/30 to-transparent transition-opacity duration-500 ${
                          isHovered ? 'opacity-100' : 'opacity-0'
                        }`} />

                        {/* Sin icon badge */}
                        <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center
                          bg-black/50 border border-candle/20 backdrop-blur-sm">
                          <img src={spellIcon} alt="" aria-hidden="true" className="w-4 h-4 object-contain"
                            style={{ filter: `drop-shadow(0 0 4px var(--color-${cfg.color}))` }} />
                        </div>

                        {/* Hover glow ring */}
                        <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none ${
                          isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                          style={{ boxShadow: `inset 0 0 30px var(--color-${cfg.color}-dim)` }}
                        />

                        {/* Latin name overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-2.5">
                          <p className="text-[10px] tracking-[0.3em] text-candle/50 uppercase mb-0.5"
                            style={{ fontFamily: "var(--font-heading)" }}>
                            {cfg.latin}
                          </p>
                          <h3 className={`text-base font-black text-${cfg.color} tracking-wider`}
                            style={{ fontFamily: "var(--font-display)" }}>
                            {cfg.label}
                          </h3>
                        </div>
                      </div>

                      {/* Description + Passive — fixed height */}
                      <div className="p-2.5 pt-2">
                        <p className="text-[11px] text-foreground/60 leading-relaxed mb-2 line-clamp-2"
                          style={{ fontFamily: "var(--font-body)" }}>
                          {cfg.desc}
                        </p>

                        {/* Passive ability — compact */}
                        <div className="p-1.5 rounded-lg border border-candle/10 bg-candle/5">
                          <p className="text-[9px] tracking-[0.15em] text-candle/50 uppercase mb-0.5"
                            style={{ fontFamily: "var(--font-heading)" }}>
                            {passive.icon} {passive.name}
                          </p>
                          <p className="text-[10px] text-candle/60 leading-snug line-clamp-2"
                            style={{ fontFamily: "var(--font-body)" }}>
                            {passive.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[9px] text-candle/40 uppercase tracking-[0.15em]"
                            style={{ fontFamily: "var(--font-heading)" }}>
                            {cfg.subtitle}
                          </span>
                          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            isHovered ? 'scale-150' : ''
                          }`}
                            style={{ background: `var(--color-${cfg.color})`, boxShadow: `0 0 ${isHovered ? '10' : '4'}px var(--color-${cfg.color})` }} />
                        </div>
                      </div>
                    </StonePanel>
                  </motion.button>
                );
              })}
            </div>

            {/* SWOT Detail Panel — appears below grid on hover */}
            <AnimatePresence mode="wait">
              {hoveredSin && (() => {
                const cfg = SIN_CONFIG[hoveredSin];
                const swot = FACTION_SWOT[hoveredSin];
                return (
                  <motion.div
                    key={hoveredSin}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3"
                    onMouseEnter={() => {
                      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                    }}
                    onMouseLeave={() => {
                      hoverTimeoutRef.current = setTimeout(() => setHoveredSin(null), 150);
                    }}
                  >
                    <StonePanel className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <img src={SIN_ARCHETYPE_ICONS[hoveredSin]} alt="Sin faction icon" className="w-5 h-5 object-contain"
                          style={{ filter: `drop-shadow(0 0 4px var(--color-${cfg.color}))` }} />
                        <h4 className={`text-sm font-bold text-${cfg.color} tracking-wider uppercase`}
                          style={{ fontFamily: "var(--font-heading)" }}>
                          {cfg.label} — {cfg.subtitle}
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                        <div className="p-2 rounded-lg bg-green-900/15 border border-green-500/10">
                          <p className="text-[9px] text-green-400/70 uppercase tracking-wider mb-1 font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Strengths</p>
                          {swot.strengths.slice(0, 2).map((s, i) => (
                            <p key={i} className="text-[10px] text-candle/60 leading-tight mb-0.5">{s}</p>
                          ))}
                        </div>
                        <div className="p-2 rounded-lg bg-red-900/15 border border-red-500/10">
                          <p className="text-[9px] text-red-400/70 uppercase tracking-wider mb-1 font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Weaknesses</p>
                          {swot.weaknesses.slice(0, 2).map((s, i) => (
                            <p key={i} className="text-[10px] text-candle/60 leading-tight mb-0.5">{s}</p>
                          ))}
                        </div>
                        <div className="p-2 rounded-lg bg-blue-900/15 border border-blue-500/10">
                          <p className="text-[9px] text-blue-400/70 uppercase tracking-wider mb-1 font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Opportunities</p>
                          {swot.opportunities.slice(0, 2).map((s, i) => (
                            <p key={i} className="text-[10px] text-candle/60 leading-tight mb-0.5">{s}</p>
                          ))}
                        </div>
                        <div className="p-2 rounded-lg bg-amber-900/15 border border-amber-500/10">
                          <p className="text-[9px] text-amber-400/70 uppercase tracking-wider mb-1 font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Threats</p>
                          {swot.threats.slice(0, 2).map((s, i) => (
                            <p key={i} className="text-[10px] text-candle/60 leading-tight mb-0.5">{s}</p>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-candle/50 italic leading-snug text-center"
                        style={{ fontFamily: "var(--font-body)" }}>
                        "{swot.playstyle}"
                      </p>
                    </StonePanel>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── DECK SELECTION — After faction choice ── */}
        <AnimatePresence>
          {showDeckPicker && myPlayer?.chosenSin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-lg mb-6"
            >
              <StonePanel glow className="p-5">
                <div className="text-center mb-4">
                  <p
                    className="text-xs tracking-[0.3em] text-candle/50 uppercase mb-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Bind Your Arsenal
                  </p>
                  <h3
                    className="text-lg font-bold text-candle tracking-wider"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    CHOOSE YOUR DECK
                  </h3>
                  <p className="text-sm text-candle/35 mt-1" style={{ fontFamily: "var(--font-body)" }}>
                    {user ? "Select a saved deck or play with a random 30-card draw." : "Playing as guest — you'll get a random 30-card deck. Sign up to build and save custom decks."}
                  </p>
                </div>

                {/* Default deck option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectDeck(null, "Random 30")}
                  className="w-full mb-3 p-3 rounded-lg border border-candle/20 bg-candle/5 hover:bg-candle/10 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-candle/10 border border-candle/15 flex items-center justify-center shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-candle/60">
                        <rect x="2" y="4" width="14" height="17" rx="2" />
                        <path d="M8 4V2a1 1 0 0 1 1-1h10a2 2 0 0 1 2 2v14a1 1 0 0 1-1 1h-2" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-candle/80 group-hover:text-candle transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
                        Random 30
                      </p>
                      <p className="text-xs text-candle/35">
                        30 random cards drawn from your faction — a fresh mix every game
                      </p>
                    </div>
                    <div className="text-xs text-candle/30 uppercase tracking-wider shrink-0" style={{ fontFamily: "var(--font-heading)" }}>
                      Default
                    </div>
                  </div>
                </motion.button>

                {/* Saved decks */}
                {(() => {
                  const decks = getSavedDecks(myPlayer.chosenSin);
                  if (decks.length === 0) return (
                    <div className="text-center py-3">
                      <p className="text-xs text-candle/25 italic" style={{ fontFamily: "var(--font-body)" }}>
                        No custom decks saved for {SIN_CONFIG[myPlayer.chosenSin as SinType].label}.
                      </p>
                      <p className="text-xs text-candle/15 mt-1">
                        {user ? "Visit the Deck Builder to forge your own 30-card deck." : "Create an account to build and save custom decks."}
                      </p>
                    </div>
                  );
                  return (
                    <div className="space-y-2">
                        <p className="text-xs tracking-[0.2em] text-candle/30 uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                        Custom Decks
                      </p>
                      {decks.map((deck) => (
                        <motion.button
                          key={deck.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectDeck(deck.cardIds, deck.name)}
                          className="w-full p-3 rounded-lg border border-white/10 bg-white/3 hover:bg-white/5 hover:border-candle/20 transition-all text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                              style={{
                                background: `var(--color-${SIN_CONFIG[myPlayer.chosenSin as SinType].color})10`,
                                borderColor: `var(--color-${SIN_CONFIG[myPlayer.chosenSin as SinType].color})30`,
                              }}
                            >
                              <img
                                src={SIN_ARCHETYPE_ICONS[myPlayer.chosenSin as SinType]}
                                alt="Sin faction icon"
                                className="w-5 h-5 object-contain"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-candle/70 group-hover:text-candle/90 transition-colors truncate" style={{ fontFamily: "var(--font-heading)" }}>
                                {deck.name}
                              </p>
                              <p className="text-xs text-candle/30">
                                {deck.cardIds.length} cards
                              </p>
                            </div>
                            <div className="text-xs text-candle/20 uppercase tracking-wider shrink-0" style={{ fontFamily: "var(--font-heading)" }}>
                              Custom
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  );
                })()}

                {/* Skip / dismiss */}
                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      setShowDeckPicker(false);
                      addMessage("No deck chosen. A random 30-card draw shall serve.", "info");
                    }}
                    className="text-xs text-candle/25 hover:text-candle/50 transition-colors underline underline-offset-2"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Skip — decide later
                  </button>
                </div>
              </StonePanel>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Deck Badge */}
        {selectedDeckName && myPlayer?.chosenSin && !showDeckPicker && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg mb-4"
          >
            <button
              onClick={() => setShowDeckPicker(true)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-candle/5 border border-candle/15 hover:border-candle/25 transition-all group"
            >
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-candle/40">
                  <rect x="2" y="4" width="14" height="17" rx="2" />
                  <path d="M8 4V2a1 1 0 0 1 1-1h10a2 2 0 0 1 2 2v14a1 1 0 0 1-1 1h-2" />
                </svg>
                <span className="text-sm text-candle/60" style={{ fontFamily: "var(--font-heading)" }}>
                  Deck: <span className="text-candle/80 font-semibold">{selectedDeckName}</span>
                </span>
              </div>
              <span className="text-xs text-candle/25 group-hover:text-candle/50 transition-colors uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                Change
              </span>
            </button>
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

        {/* Turn Timer Selector — Host Only */}
        {isHost && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="w-full max-w-lg mb-6"
          >
            <StonePanel className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Timer className="w-3.5 h-3.5 text-candle/60" />
                <h3
                  className="text-xs tracking-[0.25em] text-candle/60 uppercase"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Turn Timer
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TIMER_OPTIONS.map((opt) => {
                  const isActive = selectedTimer === opt.value;
                  return (
                    <motion.button
                      key={opt.value}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleTimerChange(opt.value)}
                      className={`relative py-3 px-2 rounded-lg border text-center transition-all duration-200 ${
                        isActive
                          ? "bg-candle/15 border-candle/40 shadow-[0_0_15px_oklch(0.55_0.12_60/0.15)]"
                          : "bg-candle/5 border-candle/15 hover:bg-candle/10 hover:border-candle/25"
                      }`}
                    >
                      <span
                        className={`block text-lg font-black tracking-wider ${
                          isActive ? "text-candle" : "text-candle/50"
                        }`}
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {opt.label}
                      </span>
                      <span
                        className={`block text-[10px] mt-0.5 ${
                          isActive ? "text-candle/70" : "text-candle/30"
                        }`}
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {opt.description}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="timer-indicator"
                          className="absolute inset-0 rounded-lg border-2 border-candle/30"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </StonePanel>
          </motion.div>
        )}

        {/* Timer display for non-host players */}
        {!isHost && state && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="w-full max-w-lg mb-6"
          >
            <StonePanel className="p-3">
              <div className="flex items-center justify-center gap-2">
                <Timer className="w-3.5 h-3.5 text-candle/50" />
                <span
                  className="text-xs tracking-[0.2em] text-candle/50 uppercase"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Turn Timer: <span className="text-candle/80 font-bold">{selectedTimer}s</span>
                </span>
              </div>
            </StonePanel>
          </motion.div>
        )}

        {/* AI Features Toggle — Host Only */}
        {isHost && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-lg mb-6"
          >
            <StonePanel className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-candle/60" />
                <h3
                  className="text-xs tracking-[0.25em] text-candle/60 uppercase"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  AI Features
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Living Narrator Toggle */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAIToggle('narrator')}
                  className={`relative py-3 px-3 rounded-lg border text-left transition-all duration-200 ${
                    aiNarratorEnabled
                      ? "bg-candle/15 border-candle/40 shadow-[0_0_15px_oklch(0.55_0.12_60/0.15)]"
                      : "bg-candle/5 border-candle/15 hover:bg-candle/10 hover:border-candle/25"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className={`w-3.5 h-3.5 ${aiNarratorEnabled ? 'text-candle' : 'text-candle/30'}`} />
                    <span
                      className={`text-xs font-bold tracking-wider uppercase ${aiNarratorEnabled ? 'text-candle' : 'text-candle/40'}`}
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      Living Narrator
                    </span>
                  </div>
                  <span
                    className={`text-[10px] ${aiNarratorEnabled ? 'text-candle/60' : 'text-candle/25'}`}
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    AI generates unique commentary each round
                  </span>
                  {aiNarratorEnabled && (
                    <motion.div
                      layoutId="narrator-indicator"
                      className="absolute top-2 right-2 w-2 h-2 rounded-full bg-candle/80"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.button>

                {/* Sin Whisperer Toggle */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAIToggle('whisperer')}
                  className={`relative py-3 px-3 rounded-lg border text-left transition-all duration-200 ${
                    aiWhispererEnabled
                      ? "bg-candle/15 border-candle/40 shadow-[0_0_15px_oklch(0.55_0.12_60/0.15)]"
                      : "bg-candle/5 border-candle/15 hover:bg-candle/10 hover:border-candle/25"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className={`w-3.5 h-3.5 ${aiWhispererEnabled ? 'text-candle' : 'text-candle/30'}`} />
                    <span
                      className={`text-xs font-bold tracking-wider uppercase ${aiWhispererEnabled ? 'text-candle' : 'text-candle/40'}`}
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      Sin Whisperer
                    </span>
                  </div>
                  <span
                    className={`text-[10px] ${aiWhispererEnabled ? 'text-candle/60' : 'text-candle/25'}`}
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Your sin tempts you with private whispers
                  </span>
                  {aiWhispererEnabled && (
                    <motion.div
                      layoutId="whisperer-indicator"
                      className="absolute top-2 right-2 w-2 h-2 rounded-full bg-candle/80"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.button>
              </div>
            </StonePanel>
          </motion.div>
        )}

        {/* AI Features display for non-host */}
        {!isHost && state && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-lg mb-6"
          >
            <StonePanel className="p-3">
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Sparkles className={`w-3 h-3 ${aiNarratorEnabled ? 'text-candle/70' : 'text-candle/25'}`} />
                  <span
                    className={`text-xs tracking-[0.15em] uppercase ${aiNarratorEnabled ? 'text-candle/60' : 'text-candle/30 line-through'}`}
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    AI Narrator {aiNarratorEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className={`w-3 h-3 ${aiWhispererEnabled ? 'text-candle/70' : 'text-candle/25'}`} />
                  <span
                    className={`text-xs tracking-[0.15em] uppercase ${aiWhispererEnabled ? 'text-candle/60' : 'text-candle/30 line-through'}`}
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Sin Whisperer {aiWhispererEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </StonePanel>
          </motion.div>
        )}

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
            <p className="text-xs text-candle/30 text-center mt-2" style={{ fontFamily: "var(--font-body)" }}>
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
