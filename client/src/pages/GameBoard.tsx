/**
 * GameBoard Page - The Arena of Sin
 *
 * N/E/S/W cardinal layout inspired by MTG Arena.
 * EffectBadge system inspired by Slay the Spire.
 * Multi-card-per-turn like Monster Train.
 * Dark atmosphere like Inscryption.
 */

import { Button } from "@/components/ui/button";
import GameCard from "@/components/GameCard";
import CompoundBalanceSheet from "@/components/CompoundBalanceSheet";
import EffectBadge from "@/components/EffectBadge";
import { useGameState } from "@/hooks/useGameState";
import { useNarrator } from "@/hooks/useNarrator";
import { usePlayerId } from "@/hooks/usePlayerId";
import { useBotController } from "@/hooks/useBotController";
import { playCard, passTurn, getGameLog, clientOvercharge } from "@/lib/gameEngine";
import { isBot } from "@/lib/botEngine";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTutorial } from "@/contexts/TutorialContext";
import { useLocation, useParams } from "wouter";
import {
  Flame, Moon, Heart, Swords, SkipForward, Trophy,
  Skull, Clock, ScrollText, Shield, Bot, Zap, ArrowLeft, TrendingUp,
  Coins, Eye
} from "lucide-react";
import { CARD_MAP } from "@shared/cardData";
import { PlayerState, getCompoundTickValue, MAX_ENERGY, MAX_ROUNDS, WRATH_OVERCHARGE_HP_COST, WRATH_OVERCHARGE_ENERGY_GAIN } from "@shared/gameTypes";
import EmberField from "@/components/EmberField";
import { GameOverScreen } from "@/components/GameOverScreen";
import { SoundToggle } from "@/components/SoundToggle";
import { soundEngine } from "@/lib/soundEngine";
import { musicEngine } from "@/lib/musicEngine";
import { MusicToggle } from "@/components/MusicToggle";

export default function GameBoard() {
  const { gameId } = useParams<{ gameId: string }>();
  const playerId = usePlayerId();
  const [, setLocation] = useLocation();
  const { gameState, isLoading, refetch } = useGameState(gameId || null);
  const { displayedText, addMessage, addRandomLine } = useNarrator();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [logEntries, setLogEntries] = useState<any[]>([]);
  const [isPlayingCard, setIsPlayingCard] = useState(false);
  const [isPassing, setIsPassing] = useState(false);
  const [showBalanceSheet, setShowBalanceSheet] = useState(false);
  const [isOvercharging, setIsOvercharging] = useState(false);
  const { setCurrentPage } = useTutorial();

  useEffect(() => { setCurrentPage("game"); }, [setCurrentPage]);

  useEffect(() => {
    musicEngine.init();
    musicEngine.setScene("arena");
    return () => { musicEngine.setScene("menu"); };
  }, []);

  useBotController({
    gameState,
    onBotAction: (result) => {
      if (result.narratorQuip) addMessage(result.narratorQuip, "action");
      else if (result.action === "pass") addRandomLine("botThinking");
    },
    onRefetch: refetch,
  });

  const myPlayer = gameState?.players.find((p) => p.id === playerId);
  const alivePlayers = useMemo(
    () => gameState?.players.filter((p) => p.isAlive) || [],
    [gameState?.players]
  );
  const isMyTurn = useMemo(() => {
    if (!gameState || !myPlayer) return false;
    const currentPlayer = alivePlayers[gameState.currentPlayerIndex % alivePlayers.length];
    return currentPlayer?.id === playerId;
  }, [gameState, myPlayer, alivePlayers, playerId]);

  const currentTurnPlayer = useMemo(() => {
    if (!gameState) return null;
    return alivePlayers[gameState.currentPlayerIndex % alivePlayers.length] || null;
  }, [gameState, alivePlayers]);

  const myCards = useMemo(
    () => (myPlayer?.hand || []).map((id) => CARD_MAP[id]).filter(Boolean),
    [myPlayer?.hand]
  );

  // Assign opponents to N/E/W positions
  const opponents = useMemo(() => {
    if (!gameState) return { north: null, east: null, west: null };
    const others = gameState.players.filter((p) => p.id !== playerId);
    // 1 opponent = North, 2 = West + East, 3 = West + North + East
    if (others.length === 1) return { north: others[0], east: null, west: null };
    if (others.length === 2) return { north: null, east: others[1], west: others[0] };
    return { north: others[1], east: others[2], west: others[0] };
  }, [gameState, playerId]);

  useEffect(() => {
    if (!showLog || !gameId) return;
    const fetchLog = async () => {
      try { const log = await getGameLog(gameId); setLogEntries(log); } catch {}
    };
    fetchLog();
    const interval = setInterval(fetchLog, 3000);
    return () => clearInterval(interval);
  }, [showLog, gameId]);

  const [lastRound, setLastRound] = useState(0);
  useEffect(() => {
    if (gameState && gameState.currentRound !== lastRound) {
      setLastRound(gameState.currentRound);
      if (gameState.currentRound > 1) addRandomLine("roundStart", { round: String(gameState.currentRound) });
    }
  }, [gameState?.currentRound]);

  useEffect(() => {
    if (gameState?.status === "active" && lastRound === 0) addRandomLine("gameStart");
  }, [gameState?.status]);

  const handlePlayCard = useCallback(async (overrideTarget?: string) => {
    if (!gameId || !selectedCard) return;
    const card = CARD_MAP[selectedCard];
    if (!card) return;
    const target = overrideTarget || selectedTarget;
    const needsTarget = card.effects.some((e) => e.target === "single_enemy");
    if (needsTarget && !target) {
      addMessage("Pick a target, sinner. The card won't throw itself.", "info");
      return;
    }
    setIsPlayingCard(true);
    try {
      const cardEffects = card.effects.map(e => e.type);
      if (cardEffects.includes("damage")) {
        const sin = card.sin;
        if (sin === "wrath") soundEngine.play("damage_fire");
        else if (sin === "sloth") soundEngine.play("damage_ice");
        else if (sin === "envy") soundEngine.play("damage_electric");
        else soundEngine.play("damage_generic");
      } else if (cardEffects.includes("heal")) {
        soundEngine.play("heal");
      } else if (cardEffects.includes("shield")) {
        soundEngine.play("shield");
      } else if (cardEffects.includes("energy_drain")) {
        soundEngine.play("energy_drain");
      } else if (cardEffects.includes("debuff")) {
        soundEngine.play("steal");
      } else {
        soundEngine.play("card_play");
      }
      const result = await playCard(gameId, playerId, selectedCard, target || undefined);
      addMessage(result.narratorQuip, "action");
      setSelectedCard(null);
      setSelectedTarget(null);
      refetch();
    } catch (err: any) {
      addMessage(err.message, "info");
    } finally {
      setIsPlayingCard(false);
    }
  }, [gameId, selectedCard, selectedTarget, playerId, addMessage, refetch]);

  // Auto-play when clicking a target (Hearthstone/MTG pattern: select card → click target → done)
  const handleSelectTarget = useCallback((targetId: string) => {
    if (!selectedCard) return;
    const card = CARD_MAP[selectedCard];
    if (!card) return;
    const needsTarget = card.effects.some((e) => e.target === "single_enemy");
    if (needsTarget) {
      // Auto-play immediately
      setSelectedTarget(targetId);
      handlePlayCard(targetId);
    } else {
      // Toggle target selection for non-targeted cards
      setSelectedTarget(selectedTarget === targetId ? null : targetId);
    }
  }, [selectedCard, selectedTarget, handlePlayCard]);

  const handlePass = async () => {
    if (!gameId) return;
    setIsPassing(true);
    soundEngine.play("turn_pass");
    try {
      await passTurn(gameId, playerId);
      addRandomLine("pass", { player: myPlayer?.username || "Someone" });
      setSelectedCard(null);
      refetch();
    } catch (err: any) {
      addMessage(err.message, "info");
    } finally {
      setIsPassing(false);
    }
  };

  const handleOvercharge = async () => {
    if (!gameId) return;
    setIsOvercharging(true);
    soundEngine.play("damage_fire");
    try {
      await clientOvercharge(gameId, playerId);
      addMessage(`Overcharged! Burned ${WRATH_OVERCHARGE_HP_COST} HP for +${WRATH_OVERCHARGE_ENERGY_GAIN} Corruption.`, "action");
      refetch();
    } catch (err: any) {
      addMessage(err.message, "info");
    } finally {
      setIsOvercharging(false);
    }
  };

  const canOvercharge = isMyTurn && myPlayer?.chosenSin === "wrath" && (myPlayer?.currentEnergy ?? 0) < MAX_ENERGY && (myPlayer?.currentHp ?? 0) > WRATH_OVERCHARGE_HP_COST;

  const getPlayerEffects = (player: PlayerState) =>
    gameState?.activeEffects.filter((e) => e.targetPlayerId === player.gamePlayerId) || [];

  // ─── Victory Screen ───────────────────────────────────────────
  if (gameState?.status === "finished") {
    return (
      <GameOverScreen
        players={gameState.players}
        winnerId={gameState.winnerId}
        currentPlayerId={playerId}
        currentRound={gameState.currentRound}
        gameId={gameId}
        onRematch={() => {
          // Quick rematch: go back to lobby to start a new game with same setup
          setLocation("/");
        }}
      />
    );
  }

  // ─── Loading State ────────────────────────────────────────────
  if (isLoading || !gameState) {
    return (
      <div className="min-h-screen bg-arena flex items-center justify-center noise-overlay">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Skull className="w-12 h-12 text-wrath/50" />
        </motion.div>
        <p className="ml-4 text-sm text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
          Loading the arena of regret...
        </p>
      </div>
    );
  }

  // ─── Main Game Board — N/E/S/W Cardinal Layout ────────────────
  return (
    <div className="h-screen relative overflow-hidden flex flex-col bg-arena noise-overlay">
      <EmberField count={12} />
      <div className="absolute inset-0 scanlines opacity-5 pointer-events-none z-50" />

      {/* ─── Top Bar ─────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-3 md:px-4 py-2 border-b border-border/20 bg-background/40 backdrop-blur-sm">
        <div className="flex items-center gap-3 md:gap-5">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-neon-cyan" />
            <span className="text-xs md:text-sm text-neon-cyan font-bold tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
              R{gameState.currentRound}/{MAX_ROUNDS}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isMyTurn ? (
              <motion.span
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-xs md:text-sm font-bold text-neon-yellow"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                YOUR TURN
              </motion.span>
            ) : (
              <span className="text-xs md:text-sm text-muted-foreground truncate max-w-[120px] md:max-w-none" style={{ fontFamily: "var(--font-heading)" }}>
                {currentTurnPlayer
                  ? `${currentTurnPlayer.username}${isBot(currentTurnPlayer.id) ? " 🤖" : ""}`
                  : "..."}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-3">
          <AnimatePresence>
            {displayedText && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="narrator-text text-[10px] max-w-[200px] truncate hidden lg:block"
              >
                "{displayedText}"
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            data-tutorial="balance-sheet-btn"
            variant="ghost" size="sm"
            onClick={() => { setShowBalanceSheet(!showBalanceSheet); if (showLog) setShowLog(false); }}
            className={`h-7 w-7 p-0 ${showBalanceSheet ? 'text-neon-cyan' : 'text-muted-foreground hover:text-neon-cyan'}`}
            title="Effects Ledger"
          >
            <TrendingUp className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={() => { setShowLog(!showLog); if (showBalanceSheet) setShowBalanceSheet(false); }}
            className={`h-7 w-7 p-0 ${showLog ? 'text-neon-cyan' : 'text-muted-foreground hover:text-neon-cyan'}`}
            title="Combat Log"
          >
            <ScrollText className="w-3.5 h-3.5" />
          </Button>
          <SoundToggle />
          <MusicToggle />
        </div>
      </div>

      {/* ─── Narrator Bar (mobile) ───────────────────────────── */}
      <AnimatePresence>
        {displayedText && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-10 px-3 py-1.5 border-b border-border/10 bg-background/20 lg:hidden"
          >
            <p className="narrator-text text-[10px] text-center truncate">"{displayedText}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Arena: N/E/S/W Grid Layout ──────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Desktop: CSS Grid for cardinal positions */}
        <div className="hidden md:grid flex-1 grid-cols-[minmax(140px,200px)_1fr_minmax(140px,200px)] grid-rows-[auto_1fr_auto] gap-1 p-2">

          {/* NORTH — top center */}
          <div className="col-start-2 row-start-1 flex justify-center">
            {opponents.north && (
              <PlayerPanel
                player={opponents.north}
                isCurrentTurn={currentTurnPlayer?.id === opponents.north.id}
                isTargetable={isMyTurn && !!selectedCard && opponents.north.isAlive}
                isSelected={selectedTarget === opponents.north.id}
                onSelect={() => handleSelectTarget(opponents.north.id)}
                activeEffects={getPlayerEffects(opponents.north)}
                currentRound={gameState.currentRound}
                position="north"
              />
            )}
          </div>

          {/* WEST — left center */}
          <div className="col-start-1 row-start-2 flex items-center justify-center">
            {opponents.west && (
              <PlayerPanel
                player={opponents.west}
                isCurrentTurn={currentTurnPlayer?.id === opponents.west.id}
                isTargetable={isMyTurn && !!selectedCard && opponents.west.isAlive}
                isSelected={selectedTarget === opponents.west.id}
                onSelect={() => handleSelectTarget(opponents.west.id)}
                activeEffects={getPlayerEffects(opponents.west)}
                currentRound={gameState.currentRound}
                position="west"
              />
            )}
          </div>

          {/* CENTER — arena info */}
          <div className="col-start-2 row-start-2 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full border border-border/20 flex items-center justify-center mb-2 bg-background/20 backdrop-blur-sm">
                <div>
                  <p className="text-2xl font-black text-neon-cyan" style={{ fontFamily: "var(--font-heading)" }}>
                    {gameState.currentRound}
                  </p>
                  <p className="text-[8px] text-muted-foreground/60 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                    of {MAX_ROUNDS}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground/50">
                {alivePlayers.length} alive
              </p>
            </div>
          </div>

          {/* EAST — right center */}
          <div className="col-start-3 row-start-2 flex items-center justify-center">
            {opponents.east && (
              <PlayerPanel
                player={opponents.east}
                isCurrentTurn={currentTurnPlayer?.id === opponents.east.id}
                isTargetable={isMyTurn && !!selectedCard && opponents.east.isAlive}
                isSelected={selectedTarget === opponents.east.id}
                onSelect={() => handleSelectTarget(opponents.east.id)}
                activeEffects={getPlayerEffects(opponents.east)}
                currentRound={gameState.currentRound}
                position="east"
              />
            )}
          </div>

          {/* SOUTH — bottom center (YOU) */}
          <div data-tutorial="player-panel" className="col-start-2 row-start-3 flex justify-center">
            {myPlayer && (
              <PlayerPanel
                player={myPlayer}
                isCurrentTurn={isMyTurn}
                isTargetable={false}
                isSelected={false}
                onSelect={() => {}}
                activeEffects={getPlayerEffects(myPlayer)}
                currentRound={gameState.currentRound}
                isMe
                position="south"
              />
            )}
          </div>
        </div>

        {/* Mobile: Stacked vertical layout */}
        <div className="md:hidden flex-1 flex flex-col gap-1 p-2 overflow-y-auto">
          {/* Opponents row */}
          <div className="flex gap-1.5 justify-center flex-wrap">
            {[opponents.west, opponents.north, opponents.east].filter(Boolean).map((opp) => (
              <PlayerPanel
                key={opp!.id}
                player={opp!}
                isCurrentTurn={currentTurnPlayer?.id === opp!.id}
                isTargetable={isMyTurn && !!selectedCard && opp!.isAlive}
                isSelected={selectedTarget === opp!.id}
                onSelect={() => handleSelectTarget(opp!.id)}
                activeEffects={getPlayerEffects(opp!)}
                currentRound={gameState.currentRound}
                compact
              />
            ))}
          </div>

          {/* Center round indicator (mobile) */}
          <div className="flex items-center justify-center py-1">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/30 border border-border/15">
              <Clock className="w-3 h-3 text-neon-cyan" />
              <span className="text-[10px] font-bold text-neon-cyan" style={{ fontFamily: "var(--font-heading)" }}>
                R{gameState.currentRound}/{MAX_ROUNDS}
              </span>
              <span className="text-[10px] text-muted-foreground/50">
                {alivePlayers.length} alive
              </span>
            </div>
          </div>

          {/* My player (mobile) */}
          {myPlayer && (
            <div data-tutorial="player-panel">
              <PlayerPanel
                player={myPlayer}
                isCurrentTurn={isMyTurn}
                isTargetable={false}
                isSelected={false}
                onSelect={() => {}}
                activeEffects={getPlayerEffects(myPlayer)}
                currentRound={gameState.currentRound}
                isMe
                compact
              />
            </div>
          )}
        </div>

        {/* ─── Card Hand ─────────────────────────────────────── */}
        <div data-tutorial="card-hand" className="px-2 md:px-4 pb-2 md:pb-3 shrink-0">
          <div className="flex items-end justify-center gap-1.5 md:gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <AnimatePresence>
              {myCards.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 50, rotate: -5 }}
                  animate={{ opacity: 1, y: 0, rotate: (i - myCards.length / 2) * 1.5 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex-shrink-0"
                >
                  <GameCard
                    card={card}
                    currentRound={gameState.currentRound}
                    isPlayable={isMyTurn}
                    isSelected={selectedCard === card.id}
                    onClick={() => setSelectedCard(selectedCard === card.id ? null : card.id)}
                    playerEnergy={myPlayer?.currentEnergy}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          {isMyTurn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center gap-2 md:gap-3 mt-1.5"
            >
              {selectedCard && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-wrath rounded-lg py-2 md:py-2.5 px-4 md:px-6 text-xs md:text-sm flex items-center gap-1.5 disabled:opacity-50"
                  onClick={() => handlePlayCard()}
                  disabled={isPlayingCard}
                >
                  <Swords className="w-3.5 h-3.5" />
                  {isPlayingCard ? "..." : "PLAY"}
                </motion.button>
              )}
              {canOvercharge && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-wrath/20 border border-wrath/40 text-wrath text-xs md:text-sm hover:bg-wrath/30 transition-colors disabled:opacity-50"
                  style={{ fontFamily: "var(--font-heading)" }}
                  onClick={handleOvercharge}
                  disabled={isOvercharging}
                  title={`Burn ${WRATH_OVERCHARGE_HP_COST} HP for +${WRATH_OVERCHARGE_ENERGY_GAIN} Corruption`}
                >
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    {isOvercharging ? "..." : "OVERCHARGE"}
                  </span>
                </motion.button>
              )}
              <motion.button
                data-tutorial="pass-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 md:px-6 py-2 md:py-2.5 rounded-lg border border-border/30 text-muted-foreground text-xs md:text-sm hover:border-border/60 transition-colors"
                style={{ fontFamily: "var(--font-heading)" }}
                onClick={handlePass}
                disabled={isPassing}
              >
                <span className="flex items-center gap-1.5">
                  <SkipForward className="w-3.5 h-3.5" />
                  {isPassing ? "..." : "PASS"}
                </span>
              </motion.button>
            </motion.div>
          )}

          {!isMyTurn && myPlayer?.isAlive && (
            <motion.p
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center text-[10px] text-muted-foreground/50 mt-1"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {currentTurnPlayer && isBot(currentTurnPlayer.id)
                ? "Bot is thinking..."
                : "Waiting for opponent..."}
            </motion.p>
          )}
        </div>
      </div>

      {/* ─── Compound Balance Sheet ──────────────────────────── */}
      <CompoundBalanceSheet
        activeEffects={gameState.activeEffects}
        players={gameState.players}
        currentRound={gameState.currentRound}
        isOpen={showBalanceSheet}
        onClose={() => setShowBalanceSheet(false)}
      />

      {/* ─── Game Log Sidebar ────────────────────────────────── */}
      <AnimatePresence>
        {showLog && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            className="absolute right-0 top-0 bottom-0 w-64 md:w-72 bg-card/95 backdrop-blur-md border-l border-border/30 z-20 overflow-y-auto p-3 md:p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-foreground tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                Combat Log
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowLog(false)} className="text-muted-foreground h-6 w-6 p-0">
                ×
              </Button>
            </div>
            <div className="space-y-1.5">
              {logEntries.slice(-30).reverse().map((entry: any, i: number) => (
                <div key={i} className="text-[10px] text-muted-foreground border-b border-border/10 pb-1">
                  <span className="text-neon-cyan font-bold">R{entry.round_number}</span>{" "}
                  <span className="capitalize text-foreground/70">{entry.action_type.replace("_", " ")}</span>
                  {entry.action_data?.cardId && (
                    <span className="text-foreground/90 font-medium">
                      {" "}&mdash; {CARD_MAP[entry.action_data.cardId]?.name || entry.action_data.cardId}
                    </span>
                  )}
                </div>
              ))}
              {logEntries.length === 0 && (
                <p className="text-[10px] text-muted-foreground/60 italic">Nothing happened yet.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Player Panel Sub-component ──────────────────────────────
interface PlayerPanelProps {
  player: PlayerState;
  isCurrentTurn: boolean;
  isTargetable: boolean;
  isSelected: boolean;
  onSelect: () => void;
  activeEffects: any[];
  currentRound: number;
  isMe?: boolean;
  position?: "north" | "south" | "east" | "west";
  compact?: boolean;
}

const panelSinConfig: Record<string, { color: string; cssColor: string; Icon: typeof Flame }> = {
  wrath: { color: "wrath", cssColor: "var(--color-wrath)", Icon: Flame },
  sloth: { color: "sloth", cssColor: "var(--color-sloth)", Icon: Moon },
  greed: { color: "greed", cssColor: "var(--color-greed)", Icon: Coins },
  envy: { color: "envy", cssColor: "var(--color-envy)", Icon: Eye },
};

function PlayerPanel({
  player,
  isCurrentTurn,
  isTargetable,
  isSelected,
  onSelect,
  activeEffects,
  currentRound,
  isMe,
  position,
  compact,
}: PlayerPanelProps) {
  const cfg = panelSinConfig[player.chosenSin || "wrath"] || panelSinConfig.wrath;
  const SinIcon = cfg.Icon;
  const hpPercent = player.maxHp > 0 ? (player.currentHp / player.maxHp) * 100 : 0;
  const playerIsBot = isBot(player.id);

  // Shield value from active effects
  const shieldValue = activeEffects
    .filter((e) => e.effectType === "shield")
    .reduce((sum, e) => sum + (e.isCompounding ? getCompoundTickValue(e.baseValue, e.currentTick || 0) : e.baseValue), 0);

  return (
    <motion.div
      whileHover={isTargetable ? { scale: 1.04 } : {}}
      whileTap={isTargetable ? { scale: 0.97 } : {}}
      onClick={isTargetable ? onSelect : undefined}
      className={`
        rounded-xl border relative overflow-hidden
        ${compact ? "p-2 min-w-[120px] max-w-[160px]" : "p-3 min-w-[170px] max-w-[220px]"}
        ${isMe ? "glass-panel border-neon-cyan/20" : "bg-card/30 backdrop-blur-sm"}
        ${isCurrentTurn ? "border-neon-yellow/50 active-turn-glow" : "border-border/20"}
        ${isSelected ? "border-neon-cyan ring-1 ring-neon-cyan/30" : ""}
        ${isTargetable ? "cursor-pointer hover:border-neon-cyan/40" : ""}
        ${!player.isAlive ? "opacity-25 grayscale" : ""}
        transition-all duration-300
      `}
    >
      {/* Sin color accent */}
      {player.isAlive && (
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundColor: cfg.cssColor }} />
      )}

      {/* Current turn pulse */}
      {isCurrentTurn && player.isAlive && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ boxShadow: "inset 0 0 20px oklch(0.88 0.16 90 / 0.2)" }}
        />
      )}

      <div className="relative z-10">
        {/* Player Info Row */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <SinIcon className={`${compact ? "w-3 h-3" : "w-3.5 h-3.5"} flex-shrink-0`} style={{ color: cfg.cssColor }} />
          <span
            className={`${compact ? "text-[11px]" : "text-sm"} font-bold text-foreground truncate flex-1`}
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {player.username}
            {isMe && <span className="text-neon-cyan/60 ml-1 text-[8px]">(YOU)</span>}
          </span>
          {playerIsBot && <Bot className={`${compact ? "w-2.5 h-2.5" : "w-3 h-3"} text-neon-cyan/40 flex-shrink-0`} />}
          {!player.isAlive && <Skull className={`${compact ? "w-2.5 h-2.5" : "w-3 h-3"} text-destructive flex-shrink-0`} />}
          {isCurrentTurn && player.isAlive && (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`${compact ? "w-1.5 h-1.5" : "w-2 h-2"} rounded-full bg-neon-yellow flex-shrink-0`}
            />
          )}
        </div>

        {/* HP Bar */}
        <div className={`relative ${compact ? "h-2.5" : "h-3.5"} bg-muted/50 rounded-full overflow-hidden mb-1`}>
          <motion.div
            animate={{ width: `${hpPercent}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`absolute inset-y-0 left-0 rounded-full hp-bar-fill ${
              hpPercent > 60 ? "hp-bar-high" : hpPercent > 30 ? "hp-bar-mid" : "hp-bar-low"
            }`}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`${compact ? "text-[7px]" : "text-[9px]"} font-bold text-foreground/90 drop-shadow-sm`}>
              {player.currentHp}/{player.maxHp}
              {shieldValue > 0 && <span className="text-neon-cyan ml-0.5">(+{shieldValue}🛡)</span>}
            </span>
          </div>
        </div>

        {/* Energy Bar */}
        {player.isAlive && (
          <div className={`relative ${compact ? "h-1.5" : "h-2"} bg-muted/30 rounded-full overflow-hidden mb-1`}>
            <motion.div
              animate={{ width: `${player.maxEnergy > 0 ? (player.currentEnergy / MAX_ENERGY) * 100 : 0}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 rounded-full energy-bar-fill"
              style={{ background: `linear-gradient(to right, ${cfg.cssColor}cc, ${cfg.cssColor})` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`${compact ? "text-[6px]" : "text-[7px]"} font-bold text-foreground/70 drop-shadow-sm`}>
                {player.currentEnergy}/{player.maxEnergy}
                {player.bonusEnergy > 0 && <span className="text-neon-green"> +{player.bonusEnergy}</span>}
              </span>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className={`flex items-center justify-between ${compact ? "text-[7px]" : "text-[8px]"} text-muted-foreground/50 mb-1`}>
          <span className="flex items-center gap-0.5">
            <Zap className="w-2 h-2" /> {player.currentEnergy}E
          </span>
          <span>{player.deckSize}d · {player.discardSize}x</span>
        </div>

        {/* Active Effects — EffectBadge (Slay the Spire style) */}
        {activeEffects.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-1">
            {activeEffects.map((effect, i) => (
              <EffectBadge
                key={`${effect.cardId}-${effect.effectType}-${i}`}
                effect={effect}
                currentRound={currentRound}
                compact={compact}
              />
            ))}
          </div>
        )}

        {/* Targetable indicator */}
        {isTargetable && (
          <motion.div
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="mt-1 text-center"
          >
            <span className={`${compact ? "text-[7px]" : "text-[8px]"} text-neon-cyan uppercase tracking-wider`} style={{ fontFamily: "var(--font-heading)" }}>
              Click to target
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
