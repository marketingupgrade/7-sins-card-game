/**
 * GameBoard Page - The Arena of Sin
 *
 * Where the actual carnage happens. Displays player positions, HP bars,
 * card hands, active effects, round counter, and the ever-judgmental narrator.
 * Now with bot auto-play because even AI deserves to suffer.
 */

import { Button } from "@/components/ui/button";
import GameCard from "@/components/GameCard";
import CompoundBalanceSheet from "@/components/CompoundBalanceSheet";
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
  Coins, Eye, Timer
} from "lucide-react";
import { CARD_MAP } from "@shared/cardData";
import { PlayerState, getCompoundTickValue, MAX_ENERGY, WRATH_OVERCHARGE_HP_COST, WRATH_OVERCHARGE_ENERGY_GAIN } from "@shared/gameTypes";
import EmberField from "@/components/EmberField";
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

  // Register this page with the tutorial system
  useEffect(() => {
    setCurrentPage("game");
  }, [setCurrentPage]);

  // Switch to arena music with crossfade
  useEffect(() => {
    musicEngine.init();
    musicEngine.setScene("arena");
    return () => {
      // When leaving game, switch back to menu
      musicEngine.setScene("menu");
    };
  }, []);

  // Bot controller - auto-plays when it's a bot's turn
  useBotController({
    gameState,
    onBotAction: (result) => {
      if (result.narratorQuip) {
        addMessage(result.narratorQuip, "action");
      } else if (result.action === "pass") {
        addRandomLine("botThinking");
      }
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

  // Fetch log when sidebar is open
  useEffect(() => {
    if (!showLog || !gameId) return;
    const fetchLog = async () => {
      try {
        const log = await getGameLog(gameId);
        setLogEntries(log);
      } catch {}
    };
    fetchLog();
    const interval = setInterval(fetchLog, 3000);
    return () => clearInterval(interval);
  }, [showLog, gameId]);

  // Narrator for round changes
  const [lastRound, setLastRound] = useState(0);
  useEffect(() => {
    if (gameState && gameState.currentRound !== lastRound) {
      setLastRound(gameState.currentRound);
      if (gameState.currentRound > 1) {
        addRandomLine("roundStart", { round: String(gameState.currentRound) });
      }
    }
  }, [gameState?.currentRound]);

  // Narrator for game start
  useEffect(() => {
    if (gameState?.status === "active" && lastRound === 0) {
      addRandomLine("gameStart");
    }
  }, [gameState?.status]);

  const handlePlayCard = useCallback(async () => {
    if (!gameId || !selectedCard) return;
    const card = CARD_MAP[selectedCard];
    if (!card) return;

    const needsTarget = card.effects.some((e) => e.target === "single_enemy");

    if (needsTarget && !selectedTarget) {
      addMessage("Pick a target, sinner. The card won't throw itself.", "info");
      return;
    }

    setIsPlayingCard(true);
    try {
      // Play card sound effect based on card type
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
      const result = await playCard(gameId, playerId, selectedCard, selectedTarget || undefined);
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
      const result = await clientOvercharge(gameId, playerId);
      addMessage(`Overcharged! Burned ${WRATH_OVERCHARGE_HP_COST} HP for +${WRATH_OVERCHARGE_ENERGY_GAIN} Corruption. The rage feeds itself.`, "action");
      refetch();
    } catch (err: any) {
      addMessage(err.message, "info");
    } finally {
      setIsOvercharging(false);
    }
  };

  const canOvercharge = isMyTurn && myPlayer?.chosenSin === "wrath" && (myPlayer?.currentEnergy ?? 0) < MAX_ENERGY && (myPlayer?.currentHp ?? 0) > WRATH_OVERCHARGE_HP_COST;

  // ─── Victory Screen ───────────────────────────────────────────
  if (gameState?.status === "finished") {
    const winner = gameState.players.find((p) => p.id === gameState.winnerId);
    const isWinner = winner?.id === playerId;
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-arena noise-overlay">
        <div className="absolute inset-0">
          {/* Victory particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-neon-yellow"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="relative z-10 text-center max-w-md mx-auto px-6"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Trophy className="w-24 h-24 text-neon-yellow mx-auto mb-6 drop-shadow-[0_0_30px_oklch(0.88_0.16_90/0.6)]" />
          </motion.div>
          <h1
            className="text-5xl font-black text-neon-yellow text-glow-cyan mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {winner?.username || "Nobody"} WINS
          </h1>
          <p className="narrator-text text-xl mt-4 mb-2">
            {isWinner
              ? '"Congratulations. You\'re the least dead. What an achievement."'
              : '"You lost. Shocking absolutely nobody."'}
          </p>
          <p className="text-sm text-muted-foreground mt-2 mb-8" style={{ fontFamily: "var(--font-body)" }}>
            {isWinner
              ? "Your sins were stronger than theirs. That's... not a compliment."
              : "Better luck next time. Or don't. I'm not your therapist."}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-wrath rounded-xl py-4 px-8 text-sm flex items-center justify-center gap-2 mx-auto"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO THE ABYSS
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ─── Loading State ────────────────────────────────────────────
  if (isLoading || !gameState) {
    return (
      <div className="min-h-screen bg-arena flex items-center justify-center noise-overlay">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Skull className="w-12 h-12 text-wrath/50" />
        </motion.div>
        <p className="ml-4 text-sm text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
          Loading the arena of regret...
        </p>
      </div>
    );
  }

  // ─── Main Game Board ──────────────────────────────────────────
  return (
    <div className="h-screen relative overflow-hidden flex flex-col bg-arena noise-overlay">
      {/* Floating ember particles */}
      <EmberField count={12} />
      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanlines opacity-5 pointer-events-none z-50" />

      {/* ─── Top Bar ─────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-4 py-2.5 border-b border-border/20 bg-background/40 backdrop-blur-sm">
        <div className="flex items-center gap-5">
          {/* Round Counter */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neon-cyan" />
            <span
              className="text-sm text-neon-cyan font-bold tracking-wider"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              ROUND {gameState.currentRound}/{10}
            </span>
          </div>

          {/* Compounding Info Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neon-yellow/10 border border-neon-yellow/20">
            <Timer className="w-3 h-3 text-neon-yellow" />
            <span
              className="text-xs font-bold text-neon-yellow"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              1× → 1× → 2×
            </span>
          </div>

          {/* Turn Indicator */}
          <div className="flex items-center gap-2">
            {isMyTurn ? (
              <motion.span
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-sm font-bold text-neon-yellow"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                YOUR TURN — MAKE IT COUNT
              </motion.span>
            ) : (
              <span className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                {currentTurnPlayer
                  ? `${currentTurnPlayer.username}${isBot(currentTurnPlayer.id) ? " (BOT)" : ""}'s turn`
                  : "..."}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Narrator (compact) */}
          <AnimatePresence>
            {displayedText && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="narrator-text text-xs max-w-xs truncate hidden md:block"
              >
                "{displayedText}"
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            data-tutorial="balance-sheet-btn"
            variant="ghost"
            size="sm"
            onClick={() => { setShowBalanceSheet(!showBalanceSheet); if (showLog) setShowLog(false); }}
            className={`transition-colors ${showBalanceSheet ? 'text-neon-cyan' : 'text-muted-foreground hover:text-neon-cyan'}`}
            title="Effects Ledger"
          >
            <TrendingUp className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setShowLog(!showLog); if (showBalanceSheet) setShowBalanceSheet(false); }}
            className={`transition-colors ${showLog ? 'text-neon-cyan' : 'text-muted-foreground hover:text-neon-cyan'}`}
            title="Combat Log"
          >
            <ScrollText className="w-4 h-4" />
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
            className="relative z-10 px-4 py-2 border-b border-border/10 bg-background/20 md:hidden"
          >
            <p className="narrator-text text-xs text-center truncate">"{displayedText}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main Game Area ──────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Opponents */}
        <div data-tutorial="player-panel" className="flex justify-center gap-3 px-4 py-3 flex-wrap">
          {gameState.players
            .filter((p) => p.id !== playerId)
            .map((player) => (
              <PlayerPanel
                key={player.id}
                player={player}
                isCurrentTurn={currentTurnPlayer?.id === player.id}
                isTargetable={isMyTurn && !!selectedCard && player.isAlive && player.id !== playerId}
                isSelected={selectedTarget === player.id}
                onSelect={() => setSelectedTarget(selectedTarget === player.id ? null : player.id)}
                activeEffects={gameState.activeEffects.filter((e) => e.targetPlayerId === player.gamePlayerId)}
                currentRound={gameState.currentRound}
              />
            ))}
        </div>

        {/* Center - Compounding Indicator */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-center"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full blur-3xl"
                style={{ background: `oklch(0.82 0.16 195 / ${0.05 + gameState.currentRound * 0.02})` }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p
                className="text-xs text-muted-foreground/60 uppercase tracking-[0.3em] mb-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Compounding Multiplier
              </p>
              <p
                className="text-6xl font-black text-neon-cyan text-glow-cyan relative"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                ×{gameState.currentRound}
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-1" style={{ fontFamily: "var(--font-body)" }}>
                Every card hits {gameState.currentRound}× harder. Enjoy the escalation.
              </p>
            </div>
          </motion.div>
        </div>

        {/* My Player Area */}
        {myPlayer && (
          <div className="px-4 pb-2">
            <PlayerPanel
              player={myPlayer}
              isCurrentTurn={isMyTurn}
              isTargetable={false}
              isSelected={false}
              onSelect={() => {}}
              activeEffects={gameState.activeEffects.filter((e) => e.targetPlayerId === myPlayer.gamePlayerId)}
              currentRound={gameState.currentRound}
              isMe
            />
          </div>
        )}

        {/* Card Hand */}
        <div data-tutorial="card-hand" className="px-4 pb-3">
          <div className="flex items-end justify-center gap-2 overflow-x-auto pb-2">
            <AnimatePresence>
              {myCards.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 50, rotate: -5 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    rotate: (i - myCards.length / 2) * 2,
                  }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ delay: i * 0.05 }}
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
              className="flex justify-center gap-3 mt-2"
            >
              {selectedCard && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-wrath rounded-lg py-2.5 px-6 text-sm flex items-center gap-2 disabled:opacity-50"
                  onClick={handlePlayCard}
                  disabled={isPlayingCard}
                >
                  <Swords className="w-4 h-4" />
                  {isPlayingCard ? "UNLEASHING..." : "PLAY CARD"}
                </motion.button>
              )}
              {canOvercharge && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2.5 rounded-lg bg-wrath/20 border border-wrath/40 text-wrath text-sm hover:bg-wrath/30 transition-colors disabled:opacity-50"
                  style={{ fontFamily: "var(--font-heading)" }}
                  onClick={handleOvercharge}
                  disabled={isOvercharging}
                  title={`Burn ${WRATH_OVERCHARGE_HP_COST} HP for +${WRATH_OVERCHARGE_ENERGY_GAIN} Corruption`}
                >
                  <span className="flex items-center gap-2">
                    <Flame className="w-4 h-4" />
                    {isOvercharging ? "BURNING..." : "OVERCHARGE"}
                  </span>
                </motion.button>
              )}
              <motion.button
                data-tutorial="pass-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 rounded-lg border border-border/30 text-muted-foreground text-sm hover:border-border/60 transition-colors"
                style={{ fontFamily: "var(--font-heading)" }}
                onClick={handlePass}
                disabled={isPassing}
              >
                <span className="flex items-center gap-2">
                  <SkipForward className="w-4 h-4" />
                  {isPassing ? "PASSING..." : "PASS (COWARD)"}
                </span>
              </motion.button>
            </motion.div>
          )}

          {/* Not your turn indicator */}
          {!isMyTurn && myPlayer?.isAlive && (
            <motion.p
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center text-xs text-muted-foreground/50 mt-2"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {currentTurnPlayer && isBot(currentTurnPlayer.id)
                ? "The bot is pretending to think. Give it a moment."
                : "Not your turn. Practice patience. Or don't."}
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
            className="absolute right-0 top-0 bottom-0 w-72 bg-card/95 backdrop-blur-md border-l border-border/30 z-20 overflow-y-auto p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-xs font-bold text-foreground tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Combat Log
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLog(false)}
                className="text-muted-foreground h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground/70 mb-3 italic" style={{ fontFamily: "var(--font-body)" }}>
              A record of everyone's poor decisions.
            </p>
            <div className="space-y-2">
              {logEntries.slice(-30).reverse().map((entry: any, i: number) => (
                <div key={i} className="text-xs text-muted-foreground border-b border-border/10 pb-1.5">
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
                <p className="text-xs text-muted-foreground/60 italic">Nothing happened yet. How boring.</p>
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
}

// Sin visual config for PlayerPanel
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
}: PlayerPanelProps) {
  const cfg = panelSinConfig[player.chosenSin || "wrath"] || panelSinConfig.wrath;
  const sinColor = cfg.color;
  const sinCssColor = cfg.cssColor;
  const SinIcon = cfg.Icon;
  const hpPercent = player.maxHp > 0 ? (player.currentHp / player.maxHp) * 100 : 0;
  const playerIsBot = isBot(player.id);

  return (
    <motion.div
      whileHover={isTargetable ? { scale: 1.05, y: -2 } : {}}
      whileTap={isTargetable ? { scale: 0.98 } : {}}
      onClick={isTargetable ? onSelect : undefined}
      className={`
        rounded-xl border p-3 min-w-[170px] max-w-[200px] relative overflow-hidden
        ${isMe ? "glass-panel" : "bg-card/30 backdrop-blur-sm"}
        ${isCurrentTurn ? "border-neon-yellow/50 active-turn-glow" : "border-border/20"}
        ${isSelected ? "border-neon-cyan glow-cyan" : ""}
        ${isTargetable ? "cursor-pointer hover:border-neon-cyan/40" : ""}
        ${!player.isAlive ? "opacity-30 grayscale" : ""}
        transition-all duration-300
      `}
    >
      {/* Sin color accent */}
      {player.isAlive && (
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundColor: sinCssColor }}
        />
      )}

      {/* Current turn glow */}
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
        <div className="flex items-center gap-2 mb-2">
          <SinIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: sinCssColor }} />
          <span
            className="text-sm font-bold text-foreground truncate flex-1"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {player.username}
          </span>
          {playerIsBot && <Bot className="w-3 h-3 text-neon-cyan/40 flex-shrink-0" />}
          {!player.isAlive && <Skull className="w-3 h-3 text-destructive flex-shrink-0" />}
          {isCurrentTurn && player.isAlive && (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-neon-yellow flex-shrink-0"
            />
          )}
        </div>

        {/* HP Bar */}
        <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden mb-1">
          <motion.div
            animate={{ width: `${hpPercent}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`absolute inset-y-0 left-0 rounded-full hp-bar-fill ${
              hpPercent > 60
                ? "hp-bar-high"
                : hpPercent > 30
                ? "hp-bar-mid"
                : "hp-bar-low"
            }`}
          />
          {/* HP text overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8px] font-bold text-foreground/80 drop-shadow-sm">
              {player.currentHp}/{player.maxHp}
            </span>
          </div>
        </div>

        {/* Energy / Corruption Bar */}
        {player.isAlive && (
          <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden mb-1">
            <motion.div
              animate={{ width: `${player.maxEnergy > 0 ? (player.currentEnergy / MAX_ENERGY) * 100 : 0}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 rounded-full energy-bar-fill"
              style={{ background: `linear-gradient(to right, ${sinCssColor}cc, ${sinCssColor})` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[7px] font-bold text-foreground/70 drop-shadow-sm">
                {player.currentEnergy}/{player.maxEnergy}
                {player.bonusEnergy > 0 && (
                  <span className="text-neon-green"> +{player.bonusEnergy}</span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between text-[9px] text-muted-foreground/60">
          <span className="flex items-center gap-0.5">
            <Heart className="w-2.5 h-2.5" /> HP
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-2.5 h-2.5" /> {player.currentEnergy} · {player.deckSize}d · {player.discardSize}x
          </span>
        </div>

        {/* Active Effects */}
        {activeEffects.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {activeEffects.map((effect, i) => {
              const effectValue = effect.isCompounding
                ? getCompoundTickValue(effect.baseValue, effect.currentTick || 0)
                : effect.baseValue;
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`text-[7px] px-1.5 py-0.5 rounded-full font-bold ${
                    effect.effectType === "shield"
                      ? "bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/20"
                      : effect.effectType === "heal"
                      ? "bg-neon-green/15 text-neon-green border border-neon-green/20"
                      : effect.effectType === "damage"
                      ? "bg-destructive/15 text-destructive border border-destructive/20"
                      : "bg-sloth/15 text-sloth border border-sloth/20"
                  }`}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {effect.effectType === "shield" && "🛡"}
                  {effect.effectType === "heal" && "💚"}
                  {effect.effectType === "damage" && "🔥"}
                  {effect.effectType === "debuff" && "💀"}
                  {" "}{effectValue}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Targetable indicator */}
        {isTargetable && (
          <motion.div
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="mt-1.5 text-center"
          >
            <span className="text-[8px] text-neon-cyan uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
              ⬆ Click to target
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
