/**
 * GameBoard Page - Main gameplay screen
 *
 * Displays: player positions, HP bars, hand of cards, active effects,
 * round counter, turn indicator, narrator text, and game log.
 * Uses Supabase Realtime for live updates and Motion for animations.
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import GameCard from "@/components/GameCard";
import { trpc } from "@/lib/trpc";
import { useGameState } from "@/hooks/useGameState";
import { useNarrator } from "@/hooks/useNarrator";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import {
  Flame, Moon, Shield, Heart, Swords, SkipForward, Trophy,
  Skull, Zap, Clock, ScrollText
} from "lucide-react";
import { CARD_MAP } from "../../../shared/cardData";
import { PlayerState, calculateEffectiveValue } from "../../../shared/gameTypes";

export default function GameBoard() {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { gameState, isLoading } = useGameState(gameId || null);
  const { displayedText, addMessage, addRandomLine } = useNarrator();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);

  const playCard = trpc.game.playCard.useMutation({
    onSuccess: (data) => {
      addMessage(data.narratorQuip, "action");
      setSelectedCard(null);
      setSelectedTarget(null);
    },
    onError: (err) => addMessage(err.message, "info"),
  });

  const passTurn = trpc.game.pass.useMutation({
    onSuccess: () => {
      addRandomLine("pass", { player: myPlayer?.username || "Someone" });
      setSelectedCard(null);
    },
    onError: (err) => addMessage(err.message, "info"),
  });

  const logQuery = trpc.game.getLog.useQuery(
    { gameId: gameId! },
    { enabled: !!gameId && showLog, refetchInterval: showLog ? 3000 : false }
  );

  const myPlayer = gameState?.players.find((p) => p.id === user?.openId);
  const alivePlayers = useMemo(
    () => gameState?.players.filter((p) => p.isAlive) || [],
    [gameState?.players]
  );
  const isMyTurn = useMemo(() => {
    if (!gameState || !myPlayer) return false;
    const currentPlayer = alivePlayers[gameState.currentPlayerIndex % alivePlayers.length];
    return currentPlayer?.id === user?.openId;
  }, [gameState, myPlayer, alivePlayers, user?.openId]);

  const myCards = useMemo(
    () => (myPlayer?.hand || []).map((id) => CARD_MAP[id]).filter(Boolean),
    [myPlayer?.hand]
  );

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

  const handlePlayCard = useCallback(() => {
    if (!gameId || !selectedCard) return;
    const card = CARD_MAP[selectedCard];
    if (!card) return;

    const needsTarget = card.effects.some(
      (e) => e.target === "single_enemy"
    );

    if (needsTarget && !selectedTarget) {
      addMessage("Pick a target, sinner.", "info");
      return;
    }

    playCard.mutate({
      gameId,
      cardId: selectedCard,
      targetPlayerId: selectedTarget || undefined,
    });
  }, [gameId, selectedCard, selectedTarget, playCard, addMessage]);

  const handlePass = () => {
    if (!gameId) return;
    passTurn.mutate({ gameId });
  };

  // Redirect if game finished
  if (gameState?.status === "finished") {
    const winner = gameState.players.find((p) => p.id === gameState.winnerId);
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.08_0.03_270)] via-background to-[oklch(0.08_0.02_25)]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center"
        >
          <Trophy className="w-20 h-20 text-neon-yellow mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-neon-yellow" style={{ fontFamily: "var(--font-heading)" }}>
            {winner?.username || "Nobody"} WINS
          </h1>
          <p className="narrator-text text-lg mt-4">
            "Congratulations. You're the least dead."
          </p>
          <Button
            className="mt-8 bg-wrath hover:bg-wrath-glow text-white glow-wrath"
            style={{ fontFamily: "var(--font-heading)" }}
            onClick={() => setLocation("/")}
          >
            BACK TO LOBBY
          </Button>
        </motion.div>
      </div>
    );
  }

  if (isLoading || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Flame className="w-12 h-12 text-wrath" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.08_0.03_270)] via-background to-[oklch(0.06_0.02_25)]" />
      <div className="absolute inset-0 scanlines opacity-10" />

      {/* Top Bar: Round, Turn, Narrator */}
      <div className="relative z-10 flex items-center justify-between px-4 py-2 border-b border-border/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm text-neon-cyan font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              ROUND {gameState.currentRound}/{10}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="text-neon-yellow font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {isMyTurn ? "YOUR TURN" : `${alivePlayers[gameState.currentPlayerIndex % alivePlayers.length]?.username || "..."}'s turn`}
            </span>
          </div>
        </div>

        {/* Narrator */}
        <AnimatePresence>
          {displayedText && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="narrator-text text-sm max-w-md truncate"
            >
              "{displayedText}"
            </motion.div>
          )}
        </AnimatePresence>

        <Button variant="ghost" size="sm" onClick={() => setShowLog(!showLog)} className="text-muted-foreground">
          <ScrollText className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Opponent Area */}
        <div className="flex justify-center gap-4 px-4 py-3">
          {gameState.players
            .filter((p) => p.id !== user?.openId)
            .map((player) => (
              <PlayerPanel
                key={player.id}
                player={player}
                isCurrentTurn={
                  alivePlayers[gameState.currentPlayerIndex % alivePlayers.length]?.id === player.id
                }
                isTargetable={isMyTurn && !!selectedCard && player.isAlive && player.id !== user?.openId}
                isSelected={selectedTarget === player.id}
                onSelect={() => setSelectedTarget(player.id)}
                activeEffects={gameState.activeEffects.filter((e) => e.targetPlayerId === player.gamePlayerId)}
                currentRound={gameState.currentRound}
              />
            ))}
        </div>

        {/* Center - Compounding Indicator */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center"
          >
            <p className="text-xs text-muted-foreground uppercase" style={{ fontFamily: "var(--font-heading)" }}>
              Damage Multiplier
            </p>
            <p className="text-5xl font-black text-neon-cyan text-glow-cyan" style={{ fontFamily: "var(--font-heading)" }}>
              ×{gameState.currentRound}
            </p>
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
        <div className="px-4 pb-3">
          <div className="flex items-end justify-center gap-2 overflow-x-auto pb-2">
            <AnimatePresence>
              {myCards.map((card) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                >
                  <GameCard
                    card={card}
                    currentRound={gameState.currentRound}
                    isPlayable={isMyTurn}
                    isSelected={selectedCard === card.id}
                    onClick={() => setSelectedCard(selectedCard === card.id ? null : card.id)}
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
                <Button
                  className="bg-wrath hover:bg-wrath-glow text-white glow-wrath"
                  style={{ fontFamily: "var(--font-heading)" }}
                  onClick={handlePlayCard}
                  disabled={playCard.isPending}
                >
                  <Swords className="w-4 h-4 mr-2" />
                  {playCard.isPending ? "PLAYING..." : "PLAY CARD"}
                </Button>
              )}
              <Button
                variant="outline"
                className="border-muted-foreground/30 text-muted-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
                onClick={handlePass}
                disabled={passTurn.isPending}
              >
                <SkipForward className="w-4 h-4 mr-2" />
                PASS
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Game Log Sidebar */}
      <AnimatePresence>
        {showLog && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            className="absolute right-0 top-0 bottom-0 w-72 bg-card border-l border-border z-20 overflow-y-auto p-4"
          >
            <h3 className="text-sm font-bold text-foreground mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              COMBAT LOG
            </h3>
            <div className="space-y-2">
              {(logQuery.data || []).slice(-20).reverse().map((entry: any, i: number) => (
                <div key={i} className="text-xs text-muted-foreground border-b border-border/20 pb-1">
                  <span className="text-neon-cyan">R{entry.round_number}</span>{" "}
                  <span className="capitalize">{entry.action_type.replace("_", " ")}</span>
                  {entry.action_data?.cardId && (
                    <span className="text-foreground"> - {CARD_MAP[entry.action_data.cardId]?.name || entry.action_data.cardId}</span>
                  )}
                </div>
              ))}
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
  const isWrath = player.chosenSin === "wrath";
  const sinColor = isWrath ? "wrath" : "sloth";
  const hpPercent = (player.currentHp / player.maxHp) * 100;
  const SinIcon = isWrath ? Flame : Moon;

  return (
    <motion.div
      whileHover={isTargetable ? { scale: 1.05 } : {}}
      onClick={isTargetable ? onSelect : undefined}
      className={`
        rounded-lg border p-3 min-w-[160px]
        ${isMe ? "bg-card/80" : "bg-card/40"}
        ${isCurrentTurn ? `border-neon-yellow/60` : "border-border/30"}
        ${isSelected ? `border-neon-cyan glow-cyan` : ""}
        ${isTargetable ? "cursor-pointer" : ""}
        ${!player.isAlive ? "opacity-40" : ""}
        transition-all duration-200
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        <SinIcon className={`w-4 h-4 text-${sinColor}`} />
        <span className="text-sm font-semibold text-foreground truncate" style={{ fontFamily: "var(--font-body)" }}>
          {player.username}
        </span>
        {!player.isAlive && <Skull className="w-3 h-3 text-destructive" />}
        {isCurrentTurn && player.isAlive && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-neon-yellow"
          />
        )}
      </div>

      {/* HP Bar */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-1">
        <motion.div
          animate={{ width: `${hpPercent}%` }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-y-0 left-0 rounded-full ${
            hpPercent > 50
              ? "bg-neon-green"
              : hpPercent > 25
              ? "bg-neon-yellow"
              : "bg-destructive"
          }`}
        />
      </div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Heart className="w-2.5 h-2.5" /> {player.currentHp}/{player.maxHp}
        </span>
        <span className="text-muted-foreground/60">
          {player.deckSize}d / {player.discardSize}x
        </span>
      </div>

      {/* Active Effects */}
      {activeEffects.length > 0 && (
        <div className="flex gap-1 mt-1 flex-wrap">
          {activeEffects.map((effect, i) => (
            <div
              key={i}
              className={`text-[8px] px-1 py-0.5 rounded ${
                effect.effectType === "shield"
                  ? "bg-neon-cyan/20 text-neon-cyan"
                  : effect.effectType === "heal"
                  ? "bg-neon-green/20 text-neon-green"
                  : effect.effectType === "damage"
                  ? "bg-destructive/20 text-destructive"
                  : "bg-sloth/20 text-sloth"
              }`}
            >
              {effect.effectType} {calculateEffectiveValue(effect.baseValue, currentRound)}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
