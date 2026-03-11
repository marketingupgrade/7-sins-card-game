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
import { lazy, Suspense } from "react";
const GameBoardBabylonScene = lazy(() => import("@/components/GameBoardBabylonScene"));
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
import PlayerAfflictionTable from "@/components/PlayerAfflictionTable";
import DeckPile from "@/components/DeckPile";
import CinematicFlash from "@/components/CinematicFlash";
import ComboChainBanner from "@/components/ComboChainBanner";
import EpicCardReveal from "@/components/EpicCardReveal";
import SinCorruptionBorder from "@/components/SinCorruptionBorder";
import VictoryCinematic from "@/components/VictoryCinematic";

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
  const [narratorEnabled, setNarratorEnabled] = useState(true);
  const [dynamicMusicEnabled, setDynamicMusicEnabled] = useState(true);

  // Epic visual features state
  const [cinematicFlashTrigger, setCinematicFlashTrigger] = useState(0);
  const [cinematicFlashColor, setCinematicFlashColor] = useState('#ffffff');
  const [comboChain, setComboChain] = useState(0);
  const [comboSin, setComboSin] = useState<SinType>('wrath');
  const lastCardSinRef = useRef<SinType | null>(null);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [epicRevealShow, setEpicRevealShow] = useState(false);
  const [epicRevealCard, setEpicRevealCard] = useState('');
  const [epicRevealSin, setEpicRevealSin] = useState<SinType>('wrath');
  const [epicRevealEnergy, setEpicRevealEnergy] = useState(4);
  const [cardPlayCount, setCardPlayCount] = useState(0);
  const [lastPlayedSin, setLastPlayedSin] = useState<SinType>('wrath');
  const [victoryCinematicShow, setVictoryCinematicShow] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const prevGameStatus = useRef<string>('active');

  useEffect(() => { setCurrentPage("game"); }, [setCurrentPage]);

  useEffect(() => {
    musicEngine.init();
    musicEngine.setScene("arena");
    return () => { musicEngine.setScene("menu"); };
  }, []);

  // Feature #11: Dynamic tempo — speeds up as game enters late rounds
  useEffect(() => {
    if (!gameState) return;
    const round = gameState.currentRound;
    // 1.0 at round 1, ramp to 1.35 at round 8+
    const tempo = Math.min(1.35, 1.0 + Math.max(0, round - 3) * 0.05);
    musicEngine.setTempo(tempo);
  }, [gameState?.currentRound]);

  // Feature #12: Victory cinematic trigger
  useEffect(() => {
    if (!gameState) return;
    if (gameState.status === 'finished' && prevGameStatus.current === 'active') {
      setVictoryCinematicShow(true);
    }
    prevGameStatus.current = gameState.status;
  }, [gameState?.status]);

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
      // Feature #7: Epic card reveal for high-energy cards
      const energyCost = card.energyCost || 0;
      if (energyCost >= 4) {
        setEpicRevealCard(card.name);
        setEpicRevealSin(card.sin as SinType);
        setEpicRevealEnergy(energyCost);
        setEpicRevealShow(true);
      }

      const result = await playCard(gameId, playerId, selectedCard, target || undefined);
      addMessage(result.narratorQuip, "action");

      // Feature #3: Combo chain tracking
      const cardSin = card.sin as SinType;
      setLastPlayedSin(cardSin);
      setCardPlayCount(prev => prev + 1);
      if (lastCardSinRef.current === cardSin) {
        setComboChain(prev => {
          const next = prev + 1;
          setComboSin(cardSin);
          return next;
        });
      } else {
        setComboChain(1);
        setComboSin(cardSin);
      }
      lastCardSinRef.current = cardSin;
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      comboTimerRef.current = setTimeout(() => {
        setComboChain(0);
        lastCardSinRef.current = null;
      }, 4000);

      // Floating numbers + screen shake
      const sinColorMap: Record<string, string> = { wrath: '#ef4444', sloth: '#a855f7', greed: '#eab308', envy: '#10b981' };
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
            if (val >= 8) {
              setShakeIntensity(val >= 15 ? 'heavy' : 'light');
              setShakeTrigger(prev => prev + 1);
            }
            // Feature #1: Cinematic flash for ≥20 damage
            if (val >= 20) {
              setCinematicFlashColor(sinColorMap[card.sin] || '#ffffff');
              setCinematicFlashTrigger(prev => prev + 1);
            }
          }
        }
      }
      
      // Trigger card play arc animation
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

  if (gameState?.status === "finished" && !victoryCinematicShow && showGameOver) {
    return (
      <>
        {victoryCinematicShow && (
          <VictoryCinematic
            show={victoryCinematicShow}
            isWinner={gameState.winnerId === playerId}
            winnerName={gameState.players.find(p => p.id === gameState.winnerId)?.username || "Unknown"}
            winnerSin={(gameState.players.find(p => p.id === gameState.winnerId)?.chosenSin as SinType) || 'wrath'}
            onComplete={() => { setVictoryCinematicShow(false); setShowGameOver(true); }}
          />
        )}
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
      </>
    );
  }

  if (gameState?.status === "finished" && victoryCinematicShow) {
    const winner = gameState.players.find(p => p.id === gameState.winnerId);
    return (
      <VictoryCinematic
        show={victoryCinematicShow}
        isWinner={gameState.winnerId === playerId}
        winnerName={winner?.username || "Unknown"}
        winnerSin={(winner?.chosenSin as SinType) || 'wrath'}
        onComplete={() => { setVictoryCinematicShow(false); setShowGameOver(true); }}
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
      {/* 3D Gothic Arena Background */}
      <Suspense fallback={null}>
        <GameBoardBabylonScene
          activeSin={mySin}
          currentRound={gameState.currentRound}
          cardPlayCount={cardPlayCount}
          lastCardSin={lastPlayedSin}
        />
      </Suspense>

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

      {/* Feature #6: Sin Corruption Border */}
      <SinCorruptionBorder
        sin={mySin}
        intensity={Math.min(1, (gameState.currentRound - 1) / 9)}
        hpRatio={(myPlayer?.currentHp ?? 25) / (myPlayer?.maxHp ?? 25)}
      />

      {/* Feature #1: Cinematic Flash on heavy damage */}
      <CinematicFlash
        trigger={cinematicFlashTrigger}
        color={cinematicFlashColor}
        intensity="epic"
      />

      {/* Feature #3: Combo Chain Banner */}
      <ComboChainBanner combo={comboChain} sin={comboSin} />

      {/* Feature #7: Epic Card Reveal */}
      <EpicCardReveal
        show={epicRevealShow}
        cardName={epicRevealCard}
        sin={epicRevealSin}
        energyCost={epicRevealEnergy}
        onComplete={() => setEpicRevealShow(false)}
      />

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

      {/* Top Bar — Gothic Stone Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b-2 border-candle/20 bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-sm" style={{ boxShadow: 'inset 0 -1px 0 oklch(0.75 0.12 70 / 0.15)' }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="https://game-icons.net/icons/ffffff/000000/1x1/lorc/scroll-unfurled.svg" alt="" className="w-5 h-5 opacity-60" />
            <span className="text-lg font-black text-candle tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
              Round {gameState.currentRound} of {MAX_ROUNDS}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center flex-1">
          {isMyTurn ? (
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-2"
            >
              <div className="w-3 h-3 rounded-full bg-greed-glow" />
              <span className="text-sm font-bold text-greed-glow" style={{ fontFamily: "var(--font-heading)" }}>
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

      {/* Arena Grid — Gothic Cathedral Interior */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        <div className="hidden md:grid flex-1 grid-cols-[minmax(160px,220px)_1fr_minmax(160px,220px)] grid-rows-[auto_1fr_auto] gap-2 p-3">
          
          {/* NORTH */}
          <div className="col-start-2 row-start-1 flex justify-center items-start gap-2">
            {opponents.north && (
              <>
                <DeckPile
                  sin={(opponents.north.chosenSin as SinType) || "wrath"}
                  deckSize={opponents.north.deckSize}
                  discardSize={opponents.north.discardSize}
                  handSize={opponents.north.hand?.length || 0}
                  isMyTurn={currentTurnPlayer?.id === opponents.north.id}
                />
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
                <PlayerAfflictionTable
                  player={opponents.north}
                  activeEffects={getPlayerEffects(opponents.north)}
                  currentRound={gameState.currentRound}
                  maxRound={MAX_ROUNDS}
                  position="right"
                />
              </>
            )}
          </div>

          {/* WEST */}
          <div className="col-start-1 row-start-2 flex items-center justify-center gap-2">
            {opponents.west && (
              <>
                <DeckPile
                  sin={(opponents.west.chosenSin as SinType) || "wrath"}
                  deckSize={opponents.west.deckSize}
                  discardSize={opponents.west.discardSize}
                  handSize={opponents.west.hand?.length || 0}
                  isMyTurn={currentTurnPlayer?.id === opponents.west.id}
                />
                <div className="flex flex-col items-center gap-2">
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
                  <PlayerAfflictionTable
                    player={opponents.west}
                    activeEffects={getPlayerEffects(opponents.west)}
                    currentRound={gameState.currentRound}
                    maxRound={MAX_ROUNDS}
                    position="below"
                  />
                </div>
              </>
            )}
          </div>

          {/* CENTER — Ritual Circle */}
          <div className="col-start-2 row-start-2 flex items-center justify-center">
            <div className="text-center">
              <div className="w-28 h-28 mx-auto rounded-full border-2 border-candle/30 flex items-center justify-center mb-3 relative" style={{ background: 'radial-gradient(circle, oklch(0.15 0.02 70 / 0.6), transparent)', boxShadow: '0 0 30px oklch(0.75 0.12 70 / 0.1), inset 0 0 20px oklch(0.75 0.12 70 / 0.05)' }}>
                {/* Rotating ritual ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-candle/10"
                  style={{ borderStyle: 'dashed' }}
                />
                <div>
                  <p className="text-3xl font-black text-candle" style={{ fontFamily: "var(--font-heading)", textShadow: '0 0 10px oklch(0.75 0.12 70 / 0.4)' }}>
                    {gameState.currentRound}
                  </p>
                  <p className="text-xs text-candle/40 uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-heading)" }}>
                    of {MAX_ROUNDS}
                  </p>
                </div>
              </div>
              <p className="text-sm text-candle/50 font-medium" style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.05em' }}>
                {alivePlayers.length} souls remain
              </p>
            </div>
          </div>

          {/* EAST */}
          <div className="col-start-3 row-start-2 flex items-center justify-center gap-2">
            {opponents.east && (
              <>
                <div className="flex flex-col items-center gap-2">
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
                  <PlayerAfflictionTable
                    player={opponents.east}
                    activeEffects={getPlayerEffects(opponents.east)}
                    currentRound={gameState.currentRound}
                    maxRound={MAX_ROUNDS}
                    position="below"
                  />
                </div>
                <DeckPile
                  sin={(opponents.east.chosenSin as SinType) || "wrath"}
                  deckSize={opponents.east.deckSize}
                  discardSize={opponents.east.discardSize}
                  handSize={opponents.east.hand?.length || 0}
                  isMyTurn={currentTurnPlayer?.id === opponents.east.id}
                />
              </>
            )}
          </div>

          {/* SOUTH */}
          <div data-tutorial="player-panel" className="col-start-2 row-start-3 flex justify-center items-start gap-2">
            {myPlayer && (
              <>
                <DeckPile
                  sin={(myPlayer.chosenSin as SinType) || "wrath"}
                  deckSize={myPlayer.deckSize}
                  discardSize={myPlayer.discardSize}
                  handSize={myCards.length}
                  isMyTurn={isMyTurn}
                />
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
                <PlayerAfflictionTable
                  player={myPlayer}
                  activeEffects={getPlayerEffects(myPlayer)}
                  currentRound={gameState.currentRound}
                  maxRound={MAX_ROUNDS}
                  position="right"
                />
              </>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 flex flex-col gap-2 p-3 overflow-y-auto">
          <div className="flex gap-2 justify-center flex-wrap">
            {[opponents.west, opponents.north, opponents.east].filter(Boolean).map((opp) => (
              <div key={opp!.id} className="flex flex-col items-center gap-1">
                <PlayerPanel
                  player={opp!}
                  isCurrentTurn={currentTurnPlayer?.id === opp!.id}
                  isTargetable={isMyTurn && !!selectedCard && opp!.isAlive}
                  isSelected={selectedTarget === opp!.id}
                  onSelect={() => handleSelectTarget(opp!.id)}
                  activeEffects={getPlayerEffects(opp!)}
                  currentRound={gameState.currentRound}
                  compact
                />
                <PlayerAfflictionTable
                  player={opp!}
                  activeEffects={getPlayerEffects(opp!)}
                  currentRound={gameState.currentRound}
                  maxRound={MAX_ROUNDS}
                  position="below"
                  compact
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full glass-panel">
              <span className="text-sm font-bold text-candle" style={{ fontFamily: "var(--font-heading)" }}>
                R{gameState.currentRound}/{MAX_ROUNDS}
              </span>
              <span className="text-sm text-muted-foreground/70">
                {alivePlayers.length} alive
              </span>
            </div>
          </div>

          {myPlayer && (
            <div data-tutorial="player-panel" className="flex flex-col items-center gap-1">
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
              <PlayerAfflictionTable
                player={myPlayer}
                activeEffects={getPlayerEffects(myPlayer)}
                currentRound={gameState.currentRound}
                maxRound={MAX_ROUNDS}
                position="below"
                compact
              />
            </div>
          )}
        </div>

        {/* Action Feed — Gothic Scroll */}
        <div className="px-4 py-2 border-t border-candle/10 bg-gradient-to-t from-background/60 to-transparent">
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
          <div className="flex items-end justify-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {/* Deck & Discard piles beside hand */}
            {myPlayer && (
              <DeckPile
                sin={(myPlayer.chosenSin as SinType) || "wrath"}
                deckSize={myPlayer.deckSize}
                discardSize={myPlayer.discardSize}
                handSize={myCards.length}
                isMyTurn={isMyTurn}
              />
            )}
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
                  title={`Burn ${WRATH_OVERCHARGE_HP_COST} HP for +${WRATH_OVERCHARGE_ENERGY_GAIN} Corruption | Siphon: Heal 10% of compound dmg dealt to others`}
                >
                  {isOvercharging ? "BURNING..." : "OVERCHARGE"}
                </motion.button>
              )}
              {/* END TURN — prominent gold button when energy is depleted */}
              {(myPlayer?.currentEnergy ?? 0) === 0 && !canOvercharge && (
                <motion.button
                  data-tutorial="pass-btn"
                  whileHover={{ scale: 1.08, boxShadow: "0 0 24px oklch(0.75 0.15 85 / 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      "0 0 8px oklch(0.75 0.15 85 / 0.2)",
                      "0 0 20px oklch(0.75 0.15 85 / 0.4)",
                      "0 0 8px oklch(0.75 0.15 85 / 0.2)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="px-8 py-3 rounded-lg text-sm font-black uppercase tracking-wider disabled:opacity-50"
                  style={{
                    fontFamily: "var(--font-heading)",
                    background: "linear-gradient(135deg, oklch(0.75 0.15 85), oklch(0.65 0.18 70))",
                    color: "oklch(0.10 0.02 70)",
                    border: "2px solid oklch(0.80 0.12 85 / 0.6)",
                    textShadow: "0 1px 0 oklch(0.85 0.10 85 / 0.3)",
                  }}
                  onClick={handlePass}
                  disabled={isPassing}
                >
                  {isPassing ? "ENDING..." : "END TURN"}
                </motion.button>
              )}
              {/* PASS — subtle when energy remains, hidden when END TURN is shown on zero energy */}
              {((myPlayer?.currentEnergy ?? 0) > 0 || canOvercharge) && (
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
              )}
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
  // Feature #4: HP-reactive avatar
  const prevHpRef = useRef(player.currentHp);
  const [hpFlash, setHpFlash] = useState(false);
  useEffect(() => {
    if (player.currentHp < prevHpRef.current && player.isAlive) {
      setHpFlash(true);
      setTimeout(() => setHpFlash(false), 400);
    }
    prevHpRef.current = player.currentHp;
  }, [player.currentHp, player.isAlive]);
  // Portrait filter: dims + reddens at low HP, glows at high HP
  const portraitFilter = (() => {
    if (!player.isAlive) return "grayscale(1) brightness(0.3)";
    if (hpFlash) return "brightness(2) saturate(3)";
    if (hpPercent < 20) return "sepia(0.5) saturate(0.6) brightness(0.7) hue-rotate(330deg)";
    if (hpPercent < 40) return "sepia(0.2) brightness(0.85)";
    if (hpPercent > 70) return `drop-shadow(0 0 6px ${sinColor})`;
    return "none";
  })();

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
        rounded-lg relative overflow-hidden
        ${compact ? "p-3 min-w-[140px] max-w-[180px]" : "p-4 min-w-[190px] max-w-[240px]"}
        ${!player.isAlive ? "opacity-30 grayscale" : ""}
        ${isTargetable && player.isAlive ? "cursor-pointer" : ""}
        transition-all duration-300
      `}
      style={{
        background: isMe 
          ? 'linear-gradient(135deg, oklch(0.14 0.02 70 / 0.85), oklch(0.10 0.01 70 / 0.75))'
          : 'linear-gradient(135deg, oklch(0.12 0.01 280 / 0.75), oklch(0.08 0.005 280 / 0.65))',
        border: isTargetable && player.isAlive 
          ? `2px solid ${sinColor}` 
          : isCurrentTurn 
            ? '2px solid oklch(0.75 0.12 70 / 0.4)'
            : isMe 
              ? '2px solid oklch(0.75 0.12 70 / 0.25)'
              : '1px solid oklch(0.3 0.02 280 / 0.3)',
        boxShadow: isTargetable && player.isAlive 
          ? `0 0 20px ${sinColor}40, inset 0 1px 0 oklch(0.4 0.05 70 / 0.1)` 
          : isMe 
            ? 'inset 0 1px 0 oklch(0.4 0.05 70 / 0.15), 0 4px 12px oklch(0 0 0 / 0.3)'
            : 'inset 0 1px 0 oklch(0.3 0.02 280 / 0.1), 0 2px 8px oklch(0 0 0 / 0.2)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Stone texture overlay */}
      {player.isAlive && (
        <div className="absolute inset-0 opacity-[0.04]" style={{ 
          backgroundColor: sinColor,
          backgroundImage: 'radial-gradient(circle at 30% 20%, oklch(1 0 0 / 0.03), transparent 60%)'
        }} />
      )}

      {/* Active turn glow */}
      {isCurrentTurn && player.isAlive && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          animate={{ opacity: [0.05, 0.2, 0.05] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{ boxShadow: 'inset 0 0 25px oklch(0.75 0.12 70 / 0.2)' }}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className={`${compact ? "w-9 h-9" : "w-11 h-11"} rounded-full overflow-hidden border-2 flex-shrink-0`} 
            style={{ borderColor: sinColor }}
          >
            <motion.img
              src={FACTION_PORTRAITS[player.chosenSin as SinType]}
              alt={player.chosenSin || ""}
              className="w-full h-full object-cover"
              loading="lazy"
              animate={hpFlash ? { x: [-2, 2, -2, 0], scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.3 }}
              style={{ filter: portraitFilter, transition: "filter 0.4s ease" }}
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
              {isMe && <span className="text-candle/60 ml-1 text-xs">(YOU)</span>}
            </div>
            
            {isCurrentTurn && player.isAlive && (
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`${compact ? "w-2 h-2" : "w-2.5 h-2.5"} rounded-full bg-greed-glow mt-1`}
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