/**
 * GameBoard Page - The Arena of Sin (Redesigned)
 *
 * Clean, icon-free interface focusing on readability and premium card game feel.
 * No Lucide icons - all UI uses text, shapes, and faction portraits.
 * Prominent action feed shows recent plays. Larger text throughout.
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
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useTutorial } from "@/contexts/TutorialContext";
import { useLocation, useParams } from "wouter";
import { CARD_MAP } from "@shared/cardData";
import { PlayerState, SinType, getCompoundTickValue, MAX_ENERGY, MAX_ROUNDS, WRATH_OVERCHARGE_HP_COST, WRATH_OVERCHARGE_ENERGY_GAIN } from "@shared/gameTypes";
import { ICON_URLS } from "@/lib/assetUrls";
import EmberField from "@/components/EmberField";
import { GameOverScreen } from "@/components/GameOverScreen";
import { SoundToggle } from "@/components/SoundToggle";
import { soundEngine } from "@/lib/soundEngine";
import { musicEngine } from "@/lib/musicEngine";
import { MusicToggle } from "@/components/MusicToggle";
import FloatingNumbers from "@/components/FloatingNumbers";
import YourTurnBanner from "@/components/YourTurnBanner";
import ScreenShake from "@/components/ScreenShake";
import EnergyOrbs from "@/components/EnergyOrbs";
import HpCriticalOverlay from "@/components/HpCriticalOverlay";
import RoundTransitionWipe from "@/components/RoundTransitionWipe";
import SinDrone from "@/components/SinDrone";
import SinReactiveBackground from "@/components/SinReactiveBackground";
import DeathSequence from "@/components/DeathSequence";
import SinCursor from "@/components/SinCursor";
import CardPlayArc from "@/components/CardPlayArc";
import SinShaderOverlay from "@/components/WebGLSinShaders";
import WebSpeechNarrator from "@/components/WebSpeechNarrator";
import DynamicMusic from "@/components/DynamicMusic";

interface ActionFeedEntry {
  id: string;
  text: string;
  timestamp: number;
}

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

  const actionFeed = useRef<ActionFeedEntry[]>([]);
  const [actionFeedState, setActionFeedState] = useState<ActionFeedEntry[]>([]);

  // Tier 1 Multimedia State
  const [floatingNumbers, setFloatingNumbers] = useState<Array<{id: string, value: number, type: 'damage'|'heal'|'shield', x: number, y: number}>>([]);
  const [showYourTurn, setShowYourTurn] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [shakeIntensity, setShakeIntensity] = useState<'light'|'heavy'>('light');
  const [showRoundWipe, setShowRoundWipe] = useState(false);
  const [wipeRound, setWipeRound] = useState(1);
  const prevIsMyTurn = useRef(false);

  // Tier 2+3 Multimedia State
  const [deathShow, setDeathShow] = useState(false);
  const [deathPlayerName, setDeathPlayerName] = useState('');
  const [deathSin, setDeathSin] = useState<SinType>('wrath');
  const [cardArcShow, setCardArcShow] = useState(false);
  const [cardArcName, setCardArcName] = useState('');
  const [cardArcColor, setCardArcColor] = useState('');
  const prevAliveCounts = useRef<number>(4);
  const [soundVolume] = useState(0.3);
  const [narratorText, setNarratorText] = useState<string | null>(null);
  const [narratorEnabled, setNarratorEnabled] = useState(false);
  const [dynamicMusicEnabled, setDynamicMusicEnabled] = useState(false);

  useEffect(() => { setCurrentPage("game"); }, [setCurrentPage]);

  useEffect(() => {
    musicEngine.init();
    musicEngine.setScene("arena");
    return () => { musicEngine.setScene("menu"); };
  }, []);

  const addToActionFeed = useCallback((text: string) => {
    const entry: ActionFeedEntry = {
      id: Date.now().toString(),
      text,
      timestamp: Date.now(),
    };
    actionFeed.current = [...actionFeed.current.slice(-2), entry];
    setActionFeedState([...actionFeed.current]);
  }, []);

  useBotController({
    gameState,
    onBotAction: (result) => {
      if (result.narratorQuip) {
        addMessage(result.narratorQuip, "action");
        addToActionFeed(result.narratorQuip);
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

  const opponents = useMemo(() => {
    if (!gameState) return { north: null, east: null, west: null };
    const others = gameState.players.filter((p) => p.id !== playerId);
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

  // YOUR TURN banner trigger
  useEffect(() => {
    if (isMyTurn && !prevIsMyTurn.current) {
      setShowYourTurn(true);
    }
    prevIsMyTurn.current = isMyTurn;
  }, [isMyTurn]);

  // Death detection
  useEffect(() => {
    if (!gameState) return;
    const currentAlive = gameState.players.filter(p => p.isAlive).length;
    if (currentAlive < prevAliveCounts.current) {
      const deadPlayer = gameState.players.find(p => !p.isAlive && p.currentHp <= 0);
      if (deadPlayer) {
        setDeathPlayerName(deadPlayer.username);
        setDeathSin((deadPlayer.chosenSin || 'wrath') as SinType);
        setDeathShow(true);
      }
    }
    prevAliveCounts.current = currentAlive;
  }, [gameState]);

  // Leading sin for reactive background
  const leadingSin = useMemo(() => {
    if (!alivePlayers.length) return null;
    const sorted = [...alivePlayers].sort((a, b) => b.currentHp - a.currentHp);
    return (sorted[0]?.chosenSin || 'wrath') as SinType;
  }, [alivePlayers]);

  const [lastRound, setLastRound] = useState(0);
  useEffect(() => {
    if (gameState && gameState.currentRound !== lastRound) {
      if (gameState.currentRound > 1 && lastRound > 0) {
        // Trigger round wipe
        setWipeRound(gameState.currentRound);
        setShowRoundWipe(true);
        const message = `Round ${gameState.currentRound} begins`;
        addRandomLine("roundStart", { round: String(gameState.currentRound) });
        addToActionFeed(message);
      }
      setLastRound(gameState.currentRound);
    }
  }, [gameState?.currentRound, lastRound, addRandomLine, addToActionFeed]);

  useEffect(() => {
    if (gameState?.status === "active" && lastRound === 0) {
      addRandomLine("gameStart");
      addToActionFeed("The arena awakens...");
    }
  }, [gameState?.status, lastRound, addRandomLine, addToActionFeed]);

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
      const soundTypes = card.effects.map(e => e.type);
      if (soundTypes.includes("damage")) {
        const sin = card.sin;
        if (sin === "wrath") soundEngine.play("damage_fire");
        else if (sin === "sloth") soundEngine.play("damage_ice");
        else if (sin === "envy") soundEngine.play("damage_electric");
        else soundEngine.play("damage_generic");
      } else if (soundTypes.includes("heal")) {
        soundEngine.play("heal");
      } else if (soundTypes.includes("shield")) {
        soundEngine.play("shield");
      } else if (soundTypes.includes("energy_drain")) {
        soundEngine.play("energy_drain");
      } else if (soundTypes.includes("debuff")) {
        soundEngine.play("steal");
      } else {
        soundEngine.play("card_play");
      }
      const result = await playCard(gameId, playerId, selectedCard, target || undefined);
      addMessage(result.narratorQuip, "action");

      // Floating numbers + screen shake
      for (const eff of card.effects) {
        const val = eff.baseValue || 0;
        if (val > 0) {
          const numType: 'damage'|'heal'|'shield'|null = eff.type === 'damage' ? 'damage' : eff.type === 'heal' ? 'heal' : eff.type === 'shield' ? 'shield' : null;
          if (numType) {
            const xBase = 50 + (Math.random() - 0.5) * 30;
            const yBase = eff.target === 'self' ? 70 : 30;
            setFloatingNumbers(prev => [...prev, { id: `${Date.now()}-${eff.type}`, value: val, type: numType, x: xBase, y: yBase }]);
          }
          if (eff.type === 'damage') {
            setShakeIntensity(val >= 10 ? 'heavy' : 'light');
            setShakeTrigger(prev => prev + 1);
          }
        }
      }
      
      // Trigger card play arc animation
      const sinColorMap: Record<string, string> = { wrath: '#ef4444', sloth: '#a855f7', greed: '#eab308', envy: '#10b981' };
      setCardArcName(card.name);
      setCardArcColor(sinColorMap[card.sin] || '#06b6d4');
      setCardArcShow(true);

      const targetName = target 
        ? gameState?.players.find(p => p.id === target)?.username || "target"
        : "";
      const actionText = targetName 
        ? `${myPlayer?.username} played ${card.name} → ${targetName}`
        : `${myPlayer?.username} played ${card.name}`;
      addToActionFeed(actionText);
      
      setSelectedCard(null);
      setSelectedTarget(null);
      refetch();
    } catch (err: any) {
      addMessage(err.message, "info");
    } finally {
      setIsPlayingCard(false);
    }
  }, [gameId, selectedCard, selectedTarget, playerId, addMessage, refetch, myPlayer, gameState, addToActionFeed]);

  const handleSelectTarget = useCallback((targetId: string) => {
    if (!selectedCard) return;
    const card = CARD_MAP[selectedCard];
    if (!card) return;
    const needsTarget = card.effects.some((e) => e.target === "single_enemy");
    if (needsTarget) {
      setSelectedTarget(targetId);
      handlePlayCard(targetId);
    } else {
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
      addToActionFeed(`${myPlayer?.username} passed`);
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
      addToActionFeed(`${myPlayer?.username} overcharged (+${WRATH_OVERCHARGE_ENERGY_GAIN} energy)`);
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

  if (gameState?.status === "finished") {
    return (
      <GameOverScreen
        players={gameState.players}
        winnerId={gameState.winnerId}
        currentPlayerId={playerId}
        currentRound={gameState.currentRound}
        gameId={gameId}
        onRematch={() => {
          setLocation("/");
        }}
      />
    );
  }

  if (isLoading || !gameState) {
    return (
      <div className="min-h-screen bg-arena flex items-center justify-center noise-overlay">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <div className="w-12 h-12 rounded-full border-2 border-wrath/50 border-t-wrath" />
        </motion.div>
        <p className="ml-4 text-sm text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
          Loading the arena of regret...
        </p>
      </div>
    );
  }

  const mySin = (myPlayer?.chosenSin || 'wrath') as SinType;

  return (
    <ScreenShake trigger={shakeTrigger} intensity={shakeIntensity}>
    <div className="h-screen relative overflow-hidden flex flex-col bg-arena noise-overlay">
      {/* Tier 2: Sin-Reactive Background */}
      <SinReactiveBackground
        leadingSin={leadingSin}
        round={gameState.currentRound}
        intensity={Math.min(1, 0.3 + (gameState.currentRound / MAX_ROUNDS) * 0.7)}
      />

      {/* Tier 2: Sin Drone (ambient audio) */}
      <SinDrone sin={mySin} volume={soundVolume * 0.5} isActive={true} />

      {/* Tier 3: Sin Cursor */}
      <SinCursor sin={mySin} isActive={true} />

      <EmberField count={12} />

      {/* Tier 1: Floating Numbers */}
      <FloatingNumbers
        numbers={floatingNumbers}
        onComplete={(id) => setFloatingNumbers(prev => prev.filter(n => n.id !== id))}
      />

      {/* Tier 1: YOUR TURN Banner */}
      <YourTurnBanner
        show={showYourTurn}
        sinType={mySin}
      />

      {/* Tier 1: Round Transition Wipe */}
      <RoundTransitionWipe
        round={wipeRound}
        show={showRoundWipe}
        onComplete={() => setShowRoundWipe(false)}
      />

      {/* Tier 1: HP Critical Heartbeat */}
      <HpCriticalOverlay
        hpPercent={(myPlayer?.currentHp ?? 25) / (myPlayer?.maxHp ?? 25)}
        isActive={myPlayer?.isAlive ?? true}
      />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-border/20 bg-background/40 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <span className="text-lg font-black text-neon-cyan tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
            R{gameState.currentRound}/{MAX_ROUNDS}
          </span>
        </div>

        <div className="flex items-center justify-center flex-1">
          {isMyTurn ? (
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-2"
            >
              <div className="w-3 h-3 rounded-full bg-neon-yellow" />
              <span className="text-sm font-bold text-neon-yellow" style={{ fontFamily: "var(--font-heading)" }}>
                YOUR TURN
              </span>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
              <span className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                {currentTurnPlayer ? `${currentTurnPlayer.username}${isBot(currentTurnPlayer.id) ? " (BOT)" : ""}` : "..."}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <SoundToggle />
          <MusicToggle />
        </div>
      </div>

      {/* Arena Grid */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        <div className="hidden md:grid flex-1 grid-cols-[minmax(160px,220px)_1fr_minmax(160px,220px)] grid-rows-[auto_1fr_auto] gap-2 p-3">
          
          {/* NORTH */}
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

          {/* WEST */}
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

          {/* CENTER */}
          <div className="col-start-2 row-start-2 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto rounded-full border border-border/20 flex items-center justify-center mb-3 glass-panel">
                <div>
                  <p className="text-2xl font-black text-neon-cyan" style={{ fontFamily: "var(--font-heading)" }}>
                    {gameState.currentRound}
                  </p>
                  <p className="text-xs text-muted-foreground/60 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                    of {MAX_ROUNDS}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground/70 font-medium">
                {alivePlayers.length} alive
              </p>
            </div>
          </div>

          {/* EAST */}
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

          {/* SOUTH */}
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

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 flex flex-col gap-2 p-3 overflow-y-auto">
          <div className="flex gap-2 justify-center flex-wrap">
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

          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full glass-panel">
              <span className="text-sm font-bold text-neon-cyan" style={{ fontFamily: "var(--font-heading)" }}>
                R{gameState.currentRound}/{MAX_ROUNDS}
              </span>
              <span className="text-sm text-muted-foreground/70">
                {alivePlayers.length} alive
              </span>
            </div>
          </div>

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

        {/* Action Feed */}
        <div className="px-4 py-2 border-t border-border/10 bg-background/20">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="popLayout">
              {actionFeedState.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-foreground/80 py-1"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {entry.text}
                </motion.div>
              ))}
            </AnimatePresence>
            {actionFeedState.length === 0 && (
              <div className="text-sm text-muted-foreground/50 py-1" style={{ fontFamily: "var(--font-body)" }}>
                Awaiting the first move...
              </div>
            )}
          </div>
        </div>

        {/* Card Hand */}
        <div data-tutorial="card-hand" className="px-3 pb-3 shrink-0">
          <div className="flex items-end justify-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
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
              className="flex justify-center gap-3 mt-2"
            >
              {selectedCard && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${
                    myPlayer?.chosenSin === "wrath" ? "btn-wrath" :
                    myPlayer?.chosenSin === "sloth" ? "btn-sloth" :
                    myPlayer?.chosenSin === "greed" ? "btn-greed" :
                    myPlayer?.chosenSin === "envy" ? "btn-envy" : "btn-cyan"
                  } disabled:opacity-50`}
                  style={{ fontFamily: "var(--font-heading)" }}
                  onClick={() => handlePlayCard()}
                  disabled={isPlayingCard}
                >
                  {isPlayingCard ? "PLAYING..." : "PLAY"}
                </motion.button>
              )}
              {canOvercharge && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-lg bg-wrath/20 border-2 border-wrath/40 text-wrath text-sm font-bold uppercase tracking-wide hover:bg-wrath/30 transition-all disabled:opacity-50"
                  style={{ 
                    fontFamily: "var(--font-heading)",
                    animation: isMyTurn ? "pulse 2s infinite" : "none"
                  }}
                  onClick={handleOvercharge}
                  disabled={isOvercharging}
                  title={`Burn ${WRATH_OVERCHARGE_HP_COST} HP for +${WRATH_OVERCHARGE_ENERGY_GAIN} Corruption`}
                >
                  {isOvercharging ? "BURNING..." : "OVERCHARGE"}
                </motion.button>
              )}
              <motion.button
                data-tutorial="pass-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-lg border-2 border-border/40 text-muted-foreground text-sm font-bold uppercase tracking-wide hover:border-border/60 hover:text-foreground transition-all"
                style={{ fontFamily: "var(--font-heading)" }}
                onClick={handlePass}
                disabled={isPassing}
              >
                {isPassing ? "PASSING..." : "PASS"}
              </motion.button>
            </motion.div>
          )}

          {!isMyTurn && myPlayer?.isAlive && (
            <motion.p
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center text-sm text-muted-foreground/60 mt-2"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {currentTurnPlayer && isBot(currentTurnPlayer.id)
                ? "Bot is thinking..."
                : "Waiting for opponent..."}
            </motion.p>
          )}
        </div>
      </div>

      {/* Tier 2: Death Sequence */}
    <DeathSequence
      show={deathShow}
      playerName={deathPlayerName}
      sin={deathSin}
      onComplete={() => setDeathShow(false)}
    />

    {/* Tier 3: Card Play Arc */}
    <CardPlayArc
      show={cardArcShow}
      cardName={cardArcName}
      sinColor={cardArcColor}
      startPosition={{ x: window.innerWidth / 2, y: window.innerHeight - 100 }}
      endPosition={{ x: window.innerWidth / 2, y: window.innerHeight / 2 }}
      onComplete={() => setCardArcShow(false)}
    />

    {/* Tier 3: Web Speech Narrator */}
    <WebSpeechNarrator
      text={narratorText}
      enabled={narratorEnabled}
    />

    {/* Tier 3: Dynamic Music Intensity */}
    <DynamicMusic
      round={gameState.currentRound}
      enabled={dynamicMusicEnabled}
      volume={0.12}
    />

    <CompoundBalanceSheet
        activeEffects={gameState.activeEffects}
        players={gameState.players}
        currentRound={gameState.currentRound}
        isOpen={showBalanceSheet}
        onClose={() => setShowBalanceSheet(false)}
      />
    </div>
    </ScreenShake>
  );
}

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

const sinColors: Record<string, string> = {
  wrath: "var(--color-wrath)",
  sloth: "var(--color-sloth)",
  greed: "var(--color-greed)",
  envy: "var(--color-envy)",
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
  const sinColor = sinColors[player.chosenSin || "wrath"] || sinColors.wrath;
  const hpPercent = player.maxHp > 0 ? (player.currentHp / player.maxHp) * 100 : 0;
  const playerIsBot = isBot(player.id);

  const shieldValue = activeEffects
    .filter((e) => e.effectType === "shield")
    .reduce((sum, e) => sum + (e.isCompounding ? getCompoundTickValue(e.baseValue, e.currentTick || 0) : e.baseValue), 0);

  const shieldPercent = player.maxHp > 0 ? Math.min((shieldValue / player.maxHp) * 100, 100) : 0;

  const visibleEffects = activeEffects.slice(0, 3);
  const hiddenEffectsCount = Math.max(0, activeEffects.length - 3);

  return (
    <motion.div
      whileHover={isTargetable ? { scale: 1.04 } : {}}
      whileTap={isTargetable ? { scale: 0.97 } : {}}
      onClick={isTargetable ? onSelect : undefined}
      className={`
        rounded-xl border-2 relative overflow-hidden
        ${compact ? "p-3 min-w-[140px] max-w-[180px]" : "p-4 min-w-[190px] max-w-[240px]"}
        ${isMe ? "glass-panel border-neon-cyan/30" : "glass-panel"}
        ${isCurrentTurn ? "border-neon-yellow/60" : "border-border/30"}
        ${isTargetable && player.isAlive ? "cursor-pointer border-2" : ""}
        ${!player.isAlive ? "opacity-30 grayscale" : ""}
        transition-all duration-300
      `}
      style={{
        borderColor: isTargetable && player.isAlive ? sinColor : undefined,
        boxShadow: isTargetable && player.isAlive ? `0 0 20px ${sinColor}40` : undefined,
      }}
    >
      {player.isAlive && (
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundColor: sinColor }} />
      )}

      {isCurrentTurn && player.isAlive && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ boxShadow: "inset 0 0 20px oklch(0.88 0.16 90 / 0.2)" }}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className={`${compact ? "w-9 h-9" : "w-11 h-11"} rounded-full overflow-hidden border-2 flex-shrink-0`} 
            style={{ borderColor: sinColor }}
          >
            <img 
              src={FACTION_PORTRAITS[player.chosenSin as SinType]} 
              alt={player.chosenSin || ""} 
              className="w-full h-full object-cover" 
              loading="lazy" 
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span
                className={`${compact ? "text-sm" : "text-base"} font-bold text-foreground truncate`}
                style={{ 
                  fontFamily: "var(--font-heading)",
                  textDecoration: !player.isAlive ? "line-through" : "none"
                }}
              >
                {player.username}
                {playerIsBot && " (BOT)"}
              </span>
              {isMe && <span className="text-neon-cyan/60 ml-1 text-xs">(YOU)</span>}
            </div>
            
            {isCurrentTurn && player.isAlive && (
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`${compact ? "w-2 h-2" : "w-2.5 h-2.5"} rounded-full bg-neon-yellow mt-1`}
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <div className={`relative flex-1 ${compact ? "h-4" : "h-5"} bg-muted/50 rounded-full overflow-hidden`}>
            <motion.div
              animate={{ width: `${hpPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`absolute inset-y-0 left-0 rounded-full ${
                hpPercent > 60 ? "bg-green-500" : hpPercent > 30 ? "bg-yellow-500" : "bg-red-500"
              }`}
            />
            {shieldValue > 0 && (
              <motion.div
                animate={{ width: `${Math.min(shieldPercent, 100 - hpPercent)}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-y-0 bg-cyan-400 rounded-full"
                style={{ left: `${hpPercent}%` }}
              />
            )}
          </div>
          <span className={`${compact ? "text-sm" : "text-base"} font-bold text-foreground flex-shrink-0`}>
            {player.currentHp}/{player.maxHp}
            {shieldValue > 0 && <span className="text-cyan-400 ml-1">+{shieldValue}</span>}
          </span>
        </div>

        {player.isAlive && (
          <EnergyOrbs
            current={player.currentEnergy}
            max={MAX_ENERGY}
            sinColor={sinColor}
            bonusEnergy={player.bonusEnergy}
          />
        )}

        {visibleEffects.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {visibleEffects.map((effect, i) => (
              <EffectBadge
                key={`${effect.cardId}-${effect.effectType}-${i}`}
                effect={effect}
                currentRound={currentRound}
                compact={compact}
              />
            ))}
            {hiddenEffectsCount > 0 && (
              <div className="inline-flex items-center px-1.5 py-0.5 rounded-md border border-border/30 bg-background/20">
                <span className="text-xs text-muted-foreground font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                  +{hiddenEffectsCount}
                </span>
              </div>
            )}
          </div>
        )}

        {isTargetable && (
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="mt-2 text-center"
          >
            <span 
              className={`${compact ? "text-xs" : "text-sm"} font-bold uppercase tracking-wider`} 
              style={{ 
                fontFamily: "var(--font-heading)",
                color: sinColor 
              }}
            >
              TARGET
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}