/**
 * GameBoard Page - The Arena of Sin (Redesigned)
 *
 * Clean, icon-free interface focusing on readability and premium card game feel.
 * No Lucide icons - all UI uses text, shapes, and faction portraits.
 * Prominent action feed shows recent plays. Larger text throughout.
 *
 * Epic Multimedia Features:
 * - Floor runes (via BabylonScene props)
 * - Arena decay (via BabylonScene currentRound prop)
 * - SinCorruptionBorder (growing glowing border cracks)
 * - CinematicFlash (screen flash + ripple for big damage)
 * - ComboChainBanner (chain counter for consecutive same-sin plays)
 * - EpicCardReveal (cinematic spotlight for high-cost cards)
 * - VictoryCinematic (5-step win cinematic)
 * - Dynamic music tempo (speeds up as rounds progress)
 * - HP reactions (avatar portraits shake/desaturate on damage)
 */

import { Button } from "@/components/ui/button";
import GameCard from "@/components/GameCard";
import CompoundBalanceSheet from "@/components/CompoundBalanceSheet";
import EffectBadge from "@/components/EffectBadge";
import { useGameState } from "@/hooks/useGameState";
import { useNarrator } from "@/hooks/useNarrator";
import { usePlayerId } from "@/hooks/usePlayerId";
import { useBotController } from "@/hooks/useBotController";
import { playCard, passTurn, lockInCards, getGameLog } from "@/lib/gameEngine";
import { isBot } from "@/lib/botEngine";
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState, useRef, memo, lazy, Suspense } from "react";
import { useTutorial } from "@/contexts/TutorialContext";
import { useLocation, useParams } from "wouter";
import { CARD_MAP } from "@shared/cardData";
import { PlayerState, SinType, getCompoundTickValue, MAX_ENERGY, MAX_ROUNDS, LockedPlay, TurnPhase } from "@shared/gameTypes";
import { ICON_URLS } from "@/lib/assetUrls";
import EmberField from "@/components/EmberField";
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
import CorruptionCascade from "@/components/CorruptionCascade";
import PlayerAfflictionTable from "@/components/PlayerAfflictionTable";
import DeckPile from "@/components/DeckPile";
import CinematicFlash from "@/components/CinematicFlash";
import ComboChainBanner from "@/components/ComboChainBanner";
import EpicCardReveal from "@/components/EpicCardReveal";
import ResolutionReveal from "@/components/ResolutionReveal";
import TargetingTracer from "@/components/TargetingTracer";
import SinCorruptionBorder from "@/components/SinCorruptionBorder";
import VictoryCinematic from "@/components/VictoryCinematic";
import MobilePlayerBar from "@/components/MobilePlayerBar";
import MobileCardThumbnail from "@/components/MobileCardThumbnail";
import MobileCardZoom from "@/components/MobileCardZoom";
import MobileBattleOverview from "@/components/MobileBattleOverview";
import { useIsMobile } from "@/hooks/useIsMobile";
import { getSinHexColor, getSinCssVar } from "@/lib/sinColors";
const CardImpactVFX = lazy(() => import("@/components/CardImpactVFX"));
const BloomOverlay = lazy(() => import("@/components/BloomOverlay"));
const SparkleTrail = lazy(() => import("@/components/SparkleTrail"));
const GodRays = lazy(() => import("@/components/GodRays"));

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
  const [selectedCards, setSelectedCards] = useState<Array<{ cardId: string; targetPlayerId?: string }>>([]);
  const [isLockingIn, setIsLockingIn] = useState(false);
  const [hasLockedIn, setHasLockedIn] = useState(false);
  const [showBalanceSheet, setShowBalanceSheet] = useState(false);
  const { setCurrentPage } = useTutorial();

  const actionFeed = useRef<ActionFeedEntry[]>([]);
  const [actionFeedState, setActionFeedState] = useState<ActionFeedEntry[]>([]);

  // Targeting tracer refs
  const tracerSourceRef = useRef<HTMLElement | null>(null);
  const tracerTargetRef = useRef<HTMLElement | null>(null);

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
  const [deathLethalBlow, setDeathLethalBlow] = useState(false);
  const [deathKillerCard, setDeathKillerCard] = useState<string | undefined>(undefined);
  const lastPlayedCardRef = useRef<string | null>(null);
  const [cardArcShow, setCardArcShow] = useState(false);
  const [cardArcName, setCardArcName] = useState('');
  const [cardArcColor, setCardArcColor] = useState('');
  const [cardArcEndPos, setCardArcEndPos] = useState({ x: 0, y: 0 });
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
  const [cardsThisTurn, setCardsThisTurn] = useState(0);
  const [corruptionCascadeTrigger, setCorruptionCascadeTrigger] = useState(0);
  const [lastPlayedSin, setLastPlayedSin] = useState<SinType>('wrath');
  const [victoryCinematicShow, setVictoryCinematicShow] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const prevGameStatus = useRef<string>('active');
  const [mobileZoomCard, setMobileZoomCard] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Phase 2: Impact VFX state
  const [impactVfxTrigger, setImpactVfxTrigger] = useState(0);
  const [impactVfxSin, setImpactVfxSin] = useState<SinType>('wrath');
  const [impactVfxIntensity, setImpactVfxIntensity] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [bloomTrigger, setBloomTrigger] = useState(0);
  const [bloomSin, setBloomSin] = useState<SinType>('wrath');

  useEffect(() => { setCurrentPage("game"); }, [setCurrentPage]);

  useEffect(() => {
    musicEngine.init();
    musicEngine.setScene("arena");
    return () => { musicEngine.setScene("menu"); };
  }, []);


  // Feature: Victory cinematic trigger
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
  // Feature: Adaptive tension music — considers round, HP ratio, and deaths
  useEffect(() => {
    if (!gameState || !myPlayer) return;
    const round = gameState.currentRound;
    const hpRatio = myPlayer.currentHp / (myPlayer.maxHp || 25);
    const deadCount = gameState.players.filter(p => !p.isAlive).length;
    const totalPlayers = gameState.players.length;
    const roundTension = Math.min(1, (round - 1) / 12);
    const hpTension = Math.max(0, 1 - hpRatio);
    const deathTension = deadCount / Math.max(1, totalPlayers - 1);
    const tension = Math.min(1, roundTension * 0.4 + hpTension * 0.35 + deathTension * 0.25);
    musicEngine.setTension(tension);
  }, [gameState?.currentRound, myPlayer?.currentHp, alivePlayers.length]);

  // In simultaneous mode, "my turn" means selection phase and I haven't locked in yet
  const turnPhase = gameState?.turnPhase || "selection";
  const isMyTurn = useMemo(() => {
    if (!gameState || !myPlayer || !myPlayer.isAlive) return false;
    if (gameState.status !== "active") return false;
    // In simultaneous mode, it's always "your turn" during selection phase if you haven't locked in
    return turnPhase === "selection" && !myPlayer.hasLockedIn && !hasLockedIn;
  }, [gameState, myPlayer, turnPhase, hasLockedIn]);

  const currentTurnPlayer = useMemo(() => {
    if (!gameState) return null;
    return alivePlayers[gameState.currentPlayerIndex % alivePlayers.length] || null;
  }, [gameState, alivePlayers]);

  // Reset lock-in state when round changes
  useEffect(() => {
    if (turnPhase === "selection") {
      setHasLockedIn(false);
      setSelectedCards([]);
    }
  }, [turnPhase, gameState?.currentRound]);

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
      setCardsThisTurn(0); // Reset cards-per-turn counter on new turn
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
        // Lethal blow: overkill by 10+ HP or killed by a big card
        const overkill = Math.abs(deadPlayer.currentHp);
        setDeathLethalBlow(overkill >= 10);
        setDeathKillerCard(lastPlayedCardRef.current || undefined);
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

  // ─── Multi-card selection helpers ─────────────────────────────
  const selectedCardsEnergyCost = useMemo(() => {
    return selectedCards.reduce((sum, sel) => {
      const card = CARD_MAP[sel.cardId];
      return sum + (card?.cost ?? 0);
    }, 0);
  }, [selectedCards]);

  const energyRemaining = useMemo(() => {
    return (myPlayer?.currentEnergy ?? 0) - selectedCardsEnergyCost;
  }, [myPlayer?.currentEnergy, selectedCardsEnergyCost]);

  const toggleCardSelection = useCallback((cardId: string) => {
    setSelectedCards(prev => {
      const existing = prev.find(s => s.cardId === cardId);
      if (existing) {
        // Deselect
        return prev.filter(s => s.cardId !== cardId);
      }
      // Check energy budget
      const card = CARD_MAP[cardId];
      if (!card) return prev;
      const currentCost = prev.reduce((sum, s) => sum + (CARD_MAP[s.cardId]?.cost ?? 0), 0);
      if (currentCost + card.cost > (myPlayer?.currentEnergy ?? 0)) return prev;
      return [...prev, { cardId }];
    });
    // Also set selectedCard for target selection UI
    setSelectedCard(cardId);
  }, [myPlayer?.currentEnergy]);

  const handleLockIn = useCallback(async () => {
    if (!gameId || !playerId) return;
    setIsLockingIn(true);
    try {
      // Play sound for lock-in
      soundEngine.play("card_play");

      const result = await lockInCards(gameId, playerId, selectedCards);
      setHasLockedIn(true);
      addMessage(result.narratorQuip, "action");
      addToActionFeed(`${myPlayer?.username} locked in ${selectedCards.length} card${selectedCards.length !== 1 ? "s" : ""}`);
      setSelectedCard(null);
      setSelectedTarget(null);
      setSelectedCards([]);
      refetch();
    } catch (err: any) {
      addMessage(err.message || "Lock-in failed", "info");
    } finally {
      setIsLockingIn(false);
    }
  }, [gameId, playerId, selectedCards, addMessage, addToActionFeed, myPlayer, refetch]);

  const handlePassLockIn = useCallback(async () => {
    if (!gameId || !playerId) return;
    setIsLockingIn(true);
    try {
      soundEngine.play("turn_pass");
      await lockInCards(gameId, playerId, []);
      setHasLockedIn(true);
      addMessage("Choosing to do nothing? Bold strategy.", "action");
      addToActionFeed(`${myPlayer?.username} passed (locked in 0 cards)`);
      setSelectedCard(null);
      setSelectedTarget(null);
      setSelectedCards([]);
      refetch();
    } catch (err: any) {
      addMessage(err.message || "Pass failed", "info");
    } finally {
      setIsLockingIn(false);
    }
  }, [gameId, playerId, addMessage, addToActionFeed, myPlayer, refetch]);

  const handlePlayCard = useCallback(async (overrideTarget?: string) => {
    if (!gameId || !selectedCard) return;
    const card = CARD_MAP[selectedCard];
    if (!card) return;
    const target = overrideTarget || selectedTarget;
    const needsTarget = card.effects.some((e) => e.targetMode === "single" || e.targetMode === "duo");
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
      } else if (soundTypes.includes("heal_gain") || soundTypes.includes("heal_steal")) {
        soundEngine.play("heal");
      } else if (soundTypes.includes("shield_gain") || soundTypes.includes("shield_steal")) {
        soundEngine.play("shield");
      } else if (soundTypes.includes("energy_steal") || soundTypes.includes("energy_block")) {
        soundEngine.play("energy_drain");
      } else if (soundTypes.includes("affliction_amplify") || soundTypes.includes("affliction_transfer")) {
        soundEngine.play("steal");
      } else {
        soundEngine.play("card_play");
      }

      // Feature: Epic card reveal for high-energy cards (4+)
      const energyCost = card.cost || 0;
      if (energyCost >= 4) {
        setEpicRevealCard(card.name);
        setEpicRevealSin(card.sin as SinType);
        setEpicRevealEnergy(energyCost);
        setEpicRevealShow(true);
      }

      const result = await playCard(gameId, playerId, selectedCard, target || undefined);
      addMessage(result.narratorQuip, "action");

      // Phase 2: Impact VFX — particle burst on every card play
      const cardSin = card.sin as SinType;
      setImpactVfxSin(cardSin);
      setImpactVfxIntensity(energyCost >= 4 ? 'heavy' : energyCost >= 2 ? 'medium' : 'light');
      setImpactVfxTrigger(prev => prev + 1);
      // Bloom on epic cards
      if (energyCost >= 4) {
        setBloomSin(cardSin);
        setBloomTrigger(prev => prev + 1);
      }

      // Feature: Combo chain tracking
      setLastPlayedSin(cardSin);
      setCardPlayCount(prev => prev + 1);
      lastPlayedCardRef.current = card.name;
      setCardsThisTurn(prev => {
        const next = prev + 1;
        if (next >= 3) setCorruptionCascadeTrigger(prev => prev + 1);
        return next;
      });
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

      // Floating numbers + screen shake + cinematic flash

      for (const eff of card.effects) {
        const val = eff.baseValue || 0;
        if (val > 0) {
          const numType: 'damage'|'heal'|'shield'|null = (eff.type === 'damage' || eff.type === 'self_damage') ? 'damage' : (eff.type === 'heal_gain' || eff.type === 'heal_steal') ? 'heal' : (eff.type === 'shield_gain' || eff.type === 'shield_steal') ? 'shield' : null;
          if (numType) {
            const xBase = 50 + (Math.random() - 0.5) * 30;
            const yBase = eff.targetMode === 'self' ? 70 : 30;
            setFloatingNumbers(prev => [...prev, { id: `${Date.now()}-${eff.type}`, value: val, type: numType, x: xBase, y: yBase }]);
          }
          if (eff.type === 'damage') {
            if (val >= 8) {
              setShakeIntensity(val >= 15 ? 'heavy' : 'light');
              setShakeTrigger(prev => prev + 1);
            }
            // Feature: Cinematic flash for big damage (20+)
            if (val >= 20) {
              setCinematicFlashColor(getSinHexColor(card.sin));
              setCinematicFlashTrigger(prev => prev + 1);
            }
          }
        }
      }
      
      // Trigger card play arc animation toward target
      setCardArcName(card.name);
      setCardArcColor(getSinHexColor(card.sin));
      // Calculate target position from the target player's panel element
      const actualTarget = target || undefined;
      if (actualTarget) {
        const targetEl = document.querySelector(`[data-player-id="${actualTarget}"]`);
        if (targetEl) {
          const rect = targetEl.getBoundingClientRect();
          setCardArcEndPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        } else {
          setCardArcEndPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        }
      } else {
        // Self-target: arc to center arena
        setCardArcEndPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      }
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
    // In simultaneous mode, clicking a target assigns it to the last selected card
    if (selectedCards.length === 0) return;
    const lastSelection = selectedCards[selectedCards.length - 1];
    const card = CARD_MAP[lastSelection.cardId];
    if (!card) return;
    const needsTarget = card.effects.some((e) => e.targetMode === "single" || e.targetMode === "duo");
    if (needsTarget) {
      setSelectedCards(prev => prev.map((s, i) =>
        i === prev.length - 1 ? { ...s, targetPlayerId: targetId } : s
      ));
    }
    setSelectedTarget(targetId);
    // Update tracer target ref
    const targetEl = document.querySelector(`[data-player-id="${targetId}"]`) as HTMLElement | null;
    tracerTargetRef.current = targetEl;
  }, [selectedCards]);

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



  const getPlayerEffects = (player: PlayerState) =>
    gameState?.activeEffects.filter((e) => e.targetPlayerId === player.gamePlayerId) || [];

  // Victory cinematic → then game over screen
  if (gameState?.status === "finished" && !victoryCinematicShow && showGameOver) {
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
      {/* 3D Gothic Arena Background — with floor runes + arena decay */}
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

      {/* Phase 4: God Rays — cathedral light beams */}
      <Suspense fallback={null}>
        <GodRays
          sin={mySin}
          intensity={0.25 + Math.min(0.3, (gameState.currentRound - 1) * 0.03)}
        />
      </Suspense>

      {/* Feature: Sin Corruption Border — glowing cracks spread from edges */}
      <SinCorruptionBorder
        sin={mySin}
        intensity={Math.min(1, (gameState.currentRound - 1) / 9)}
        hpRatio={(myPlayer?.currentHp ?? 25) / (myPlayer?.maxHp ?? 25)}
      />

      {/* Feature: Cinematic Flash on heavy damage (20+) */}
      <CinematicFlash
        trigger={cinematicFlashTrigger}
        color={cinematicFlashColor}
        intensity="epic"
      />

      {/* Feature: Combo Chain Banner */}
      <ComboChainBanner combo={comboChain} sin={comboSin} />

      {/* Feature: Epic Card Reveal for high-cost cards */}
      <EpicCardReveal
        show={epicRevealShow}
        cardName={epicRevealCard}
        sin={epicRevealSin}
        energyCost={epicRevealEnergy}
        onComplete={() => setEpicRevealShow(false)}
      />

      {/* Targeting Tracer — node connector line from card to target */}
      <TargetingTracer
        isActive={isMyTurn && selectedCards.length > 0 && (() => {
          const lastSel = selectedCards[selectedCards.length - 1];
          const card = lastSel ? CARD_MAP[lastSel.cardId] : null;
          return card ? card.effects.some(e => e.targetMode === 'single' || e.targetMode === 'duo') : false;
        })()}
        sin={mySin}
        sourceRef={tracerSourceRef}
        targetRef={tracerTargetRef}
        isLocked={!!selectedTarget}
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
      <div className="relative z-10 flex items-center justify-between px-2 md:px-4 py-1.5 md:py-3 border-b-2 border-candle/20 bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-sm" style={{ boxShadow: 'inset 0 -1px 0 oklch(0.75 0.12 70 / 0.15)' }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="https://game-icons.net/icons/ffffff/000000/1x1/lorc/scroll-unfurled.svg" alt="" className="w-4 md:w-5 h-4 md:h-5 opacity-60" />
            <span className="text-sm md:text-lg font-black text-candle tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
              <span className="hidden md:inline">Round </span><span className="md:hidden">R</span>{gameState.currentRound}<span className="hidden md:inline"> of</span><span className="md:hidden">/</span>{MAX_ROUNDS}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center flex-1">
          {turnPhase === "resolution" ? (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="flex items-center gap-2"
            >
              <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-red-500" />
              <span className="text-xs md:text-sm font-bold text-red-400" style={{ fontFamily: "var(--font-heading)" }}>
                RESOLVING...
              </span>
            </motion.div>
          ) : isMyTurn ? (
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-2"
            >
              <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-greed-glow" />
              <span className="text-xs md:text-sm font-bold text-greed-glow" style={{ fontFamily: "var(--font-heading)" }}>
                SELECT YOUR CARDS
              </span>
            </motion.div>
          ) : hasLockedIn ? (
            <motion.div
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2"
            >
              <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-candle/60" />
              <span className="text-xs md:text-sm font-bold text-candle/80" style={{ fontFamily: "var(--font-heading)" }}>
                LOCKED IN — WAITING...
              </span>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-muted-foreground/40" />
              <span className="text-xs md:text-sm text-muted-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                Waiting for players...
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 md:gap-3">
          <SoundToggle />
          <MusicToggle />
        </div>
      </div>

      {/* Arena Grid — Gothic Cathedral Interior */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        <div className="hidden md:grid flex-1 grid-cols-[minmax(200px,280px)_1fr_minmax(200px,280px)] grid-rows-[auto_1fr_auto] gap-3 p-3">
          
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
                  isTargetable={isMyTurn && selectedCards.length > 0 && opponents.north.isAlive}
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
                    isTargetable={isMyTurn && selectedCards.length > 0 && opponents.west.isAlive}
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

          {/* CENTER — Ritual Circle + Resolution Reveal */}
          <div className="col-start-2 row-start-2 flex items-center justify-center relative">
            {/* Resolution card reveal overlay */}
            {turnPhase === "resolution" && gameState.lockedPlays && (
              <ResolutionReveal
                lockedPlays={gameState.lockedPlays}
                players={gameState.players}
                currentRound={gameState.currentRound}
                isResolving={turnPhase === "resolution"}
              />
            )}
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
                {alivePlayers.length} players alive
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
                    isTargetable={isMyTurn && selectedCards.length > 0 && opponents.east.isAlive}
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

        {/* Mobile Layout — Marvel Snap / LoR inspired */}
        <div className="md:hidden flex-1 flex flex-col overflow-hidden">
          {/* Opponents — thin horizontal bars */}
          <div className="flex flex-col gap-1 px-2 pt-2 pb-1">
            {[opponents.west, opponents.north, opponents.east].filter(Boolean).map((opp) => (
              <MobilePlayerBar
                key={opp!.id}
                player={opp!}
                isCurrentTurn={currentTurnPlayer?.id === opp!.id}
                isTargetable={isMyTurn && selectedCards.length > 0 && opp!.isAlive}
                isSelected={selectedTarget === opp!.id}
                onSelect={() => handleSelectTarget(opp!.id)}
                activeEffects={getPlayerEffects(opp!)}
                currentRound={gameState.currentRound}
              />
            ))}
          </div>

          {/* Center area — battle overview with afflictions + action feed */}
          <div className="flex-1 relative min-h-0">
            <MobileBattleOverview
              players={gameState.players}
              currentPlayerId={playerId}
              activeEffects={gameState.activeEffects}
              currentRound={gameState.currentRound}
              maxRounds={MAX_ROUNDS}
              actionFeed={actionFeedState}
              alivePlayers={alivePlayers}
            />
            {/* Mobile Resolution Reveal — overlays the battle overview */}
            {turnPhase === "resolution" && gameState.lockedPlays && (
              <div className="absolute inset-0 z-40 flex items-center justify-center" style={{ background: 'oklch(0.05 0.02 280 / 0.85)' }}>
                <ResolutionReveal
                  lockedPlays={gameState.lockedPlays}
                  players={gameState.players}
                  currentRound={gameState.currentRound}
                  isResolving={turnPhase === "resolution"}
                />
              </div>
            )}
          </div>

          {/* My player bar */}
          {myPlayer && (
            <div data-tutorial="player-panel" className="px-2 pb-1">
              <MobilePlayerBar
                player={myPlayer}
                isCurrentTurn={isMyTurn}
                isTargetable={false}
                isSelected={false}
                onSelect={() => {}}
                activeEffects={getPlayerEffects(myPlayer)}
                currentRound={gameState.currentRound}
                isMe
              />
            </div>
          )}
        </div>

        {/* Action Feed — Desktop only (mobile has inline feed above) */}
        <div className="hidden md:block px-4 py-2 border-t border-candle/10 bg-gradient-to-t from-background/60 to-transparent">
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

        {/* Action Buttons — above cards so they're never hidden */}
        <div className="shrink-0 relative z-20">
          {isMyTurn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-1.5 py-2"
            >
              {selectedCards.length > 0 && (
                <div className="text-xs md:text-sm text-candle/80 font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                  {selectedCards.length} card{selectedCards.length !== 1 ? "s" : ""} selected {"\u00B7"} {energyRemaining} energy left
                </div>
              )}
              <div className="flex justify-center gap-2 md:gap-3">
                <motion.button
                  data-tutorial="lock-in-btn"
                  whileHover={{ scale: 1.08, boxShadow: "0 0 24px oklch(0.75 0.15 85 / 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: selectedCards.length > 0 ? [
                      "0 0 8px oklch(0.75 0.15 85 / 0.2)",
                      "0 0 20px oklch(0.75 0.15 85 / 0.4)",
                      "0 0 8px oklch(0.75 0.15 85 / 0.2)",
                    ] : "none",
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="px-5 md:px-10 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-black uppercase tracking-wider disabled:opacity-50"
                  style={{
                    fontFamily: "var(--font-heading)",
                    background: selectedCards.length > 0
                      ? "linear-gradient(135deg, oklch(0.75 0.15 85), oklch(0.65 0.18 70))"
                      : "linear-gradient(135deg, oklch(0.35 0.05 85), oklch(0.30 0.04 70))",
                    color: selectedCards.length > 0 ? "oklch(0.10 0.02 70)" : "oklch(0.60 0.05 70)",
                    border: `2px solid oklch(0.80 0.12 85 / ${selectedCards.length > 0 ? 0.6 : 0.2})`,
                    textShadow: selectedCards.length > 0 ? "0 1px 0 oklch(0.85 0.10 85 / 0.3)" : "none",
                  }}
                  onClick={handleLockIn}
                  disabled={isLockingIn || selectedCards.length === 0}
                >
                  {isLockingIn ? "LOCKING IN..." : `LOCK IN${selectedCards.length > 0 ? ` (${selectedCards.length})` : ""}`}
                </motion.button>
                <motion.button
                  data-tutorial="pass-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 md:px-8 py-2.5 md:py-3 rounded-lg border-2 border-border/40 text-muted-foreground text-sm md:text-base font-bold uppercase tracking-wide hover:border-border/60 hover:text-foreground transition-all"
                  style={{ fontFamily: "var(--font-heading)" }}
                  onClick={handlePassLockIn}
                  disabled={isLockingIn}
                >
                  {isLockingIn ? "..." : "PASS"}
                </motion.button>
              </div>
            </motion.div>
          )}
          {!isMyTurn && myPlayer?.isAlive && (
            <motion.p
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center text-sm text-muted-foreground/60 py-2"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {turnPhase === "resolution"
                ? "The sins are clashing..."
                : hasLockedIn
                  ? "Locked in. Waiting on the others..."
                  : "Pick your cards, sinner."}
            </motion.p>
          )}
        </div>

        {/* Card Hand — Desktop: full cards, Mobile: compact thumbnails */}
        <div data-tutorial="card-hand" className="px-2 md:px-4 pb-3 md:pb-4 shrink-0">
          {/* Desktop hand */}
          <div className="hidden md:flex items-end justify-center gap-3 overflow-x-auto pb-4 pt-2 scrollbar-thin">
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
                  initial={{ opacity: 0, y: 80, rotate: -8, scale: 0.85 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    rotate: (i - myCards.length / 2) * 2,
                    scale: 1,
                  }}
                  exit={{ opacity: 0, y: 60, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 28,
                    mass: 0.8,
                    delay: i * 0.08,
                  }}
                  className="flex-shrink-0"
                >
                  <div className="relative" data-card-id={card.id} ref={(el) => {
                    // Set tracer source to the last selected card that needs a target
                    const lastSel = selectedCards[selectedCards.length - 1];
                    if (lastSel && lastSel.cardId === card.id) {
                      tracerSourceRef.current = el;
                    }
                  }}>
                    <GameCard
                      card={card}
                      currentRound={gameState.currentRound}
                      isPlayable={isMyTurn}
                      isSelected={selectedCards.some(s => s.cardId === card.id)}
                      onClick={() => toggleCardSelection(card.id)}
                      playerEnergy={energyRemaining + (selectedCards.some(s => s.cardId === card.id) ? card.cost : 0)}
                    />
                    {selectedCards.findIndex(s => s.cardId === card.id) >= 0 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-candle text-background text-xs font-black flex items-center justify-center shadow-lg z-10">
                        {selectedCards.findIndex(s => s.cardId === card.id) + 1}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Mobile hand — compact thumbnails */}
          <div className="md:hidden">
            <div className="flex items-end justify-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin px-1">
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
                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, scale: 0.9, transition: { duration: 0.15 } }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                      delay: i * 0.05,
                    }}
                    className="flex-shrink-0"
                  >
                    <div className="relative">
                      <MobileCardThumbnail
                        card={card}
                        isPlayable={isMyTurn}
                        isSelected={selectedCards.some(s => s.cardId === card.id)}
                        canAfford={energyRemaining + (selectedCards.some(s => s.cardId === card.id) ? card.cost : 0) >= card.cost}
                        onClick={() => {
                          if (selectedCards.some(s => s.cardId === card.id)) {
                            // Second tap on selected card → open zoom
                            setMobileZoomCard(card.id);
                          } else {
                            toggleCardSelection(card.id);
                          }
                        }}
                      />
                      {selectedCards.findIndex(s => s.cardId === card.id) >= 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-candle text-background text-[10px] font-black flex items-center justify-center shadow-lg z-10">
                          {selectedCards.findIndex(s => s.cardId === card.id) + 1}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Action buttons moved above card hand */}
        </div>

        {/* Mobile Card Zoom Overlay */}
        {isMobile && mobileZoomCard && (
          <MobileCardZoom
            card={CARD_MAP[mobileZoomCard]}
            isPlayable={isMyTurn}
            canAfford={energyRemaining >= (CARD_MAP[mobileZoomCard]?.cost ?? 0)}
            onPlay={() => {
              toggleCardSelection(mobileZoomCard);
              setMobileZoomCard(null);
            }}
            onClose={() => setMobileZoomCard(null)}
          />
        )}
      </div>

      {/* Tier 2: Death Sequence */}
    <DeathSequence
      show={deathShow}
      playerName={deathPlayerName}
      sin={deathSin}
      lethalBlow={deathLethalBlow}
      killerCardName={deathKillerCard}
      onComplete={() => { setDeathShow(false); setDeathLethalBlow(false); setDeathKillerCard(undefined); }}
    />

    {/* Tier 2: Corruption Cascade — CD3 reward for 3+ cards in one turn */}
    <CorruptionCascade
      trigger={corruptionCascadeTrigger}
      sin={(myPlayer?.chosenSin || 'wrath') as SinType}
    />

    {/* Phase 2: GPU Particle Impact VFX */}
    <Suspense fallback={null}>
      <CardImpactVFX
        trigger={impactVfxTrigger}
        sin={impactVfxSin}
        intensity={impactVfxIntensity}
      />
    </Suspense>

    {/* Phase 2: Bloom Overlay for Epic Cards */}
    <Suspense fallback={null}>
      <BloomOverlay
        trigger={bloomTrigger}
        sin={bloomSin}
      />
    </Suspense>

    {/* Phase 3: Sparkle Trail on card selection */}
    <Suspense fallback={null}>
      <SparkleTrail
        active={selectedCards.length > 0}
        sin={(myPlayer?.chosenSin as SinType) || 'wrath'}
      />
    </Suspense>

    {/* Tier 3: Card Play Arc */}
    <CardPlayArc
      show={cardArcShow}
      cardName={cardArcName}
      sinColor={cardArcColor}
      startPosition={{ x: window.innerWidth / 2, y: window.innerHeight - 160 }}
      endPosition={cardArcEndPos}
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


const PlayerPanel = memo(function PlayerPanel({
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
  const sinColor = getSinCssVar(player.chosenSin || "wrath");
  const hpPercent = player.maxHp > 0 ? (player.currentHp / player.maxHp) * 100 : 0;
  const playerIsBot = isBot(player.id);
  const [isHovered, setIsHovered] = useState(false);

  // Feature: HP-reactive avatar (shake + desaturate on damage)
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
    .filter((e) => e.effectType === "shield_gain")
    .reduce((sum, e) => sum + Math.round(getCompoundTickValue(e.baseValue, e.compoundPattern || "standard", e.currentTick || 0)), 0);

  const shieldPercent = player.maxHp > 0 ? Math.min((shieldValue / player.maxHp) * 100, 100) : 0;

  // Show all effects, not just 3
  const allEffects = activeEffects;
  const collapsedEffects = activeEffects.slice(0, compact ? 2 : 4);
  const hiddenEffectsCount = Math.max(0, activeEffects.length - (compact ? 2 : 4));

  // Display name: show full name on hover, truncate otherwise
  const displayName = player.username + (playerIsBot ? " (BOT)" : "");

  return (
    <motion.div
      data-player-id={player.id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={isTargetable ? { scale: 1.04 } : { scale: 1.02 }}
      whileTap={isTargetable ? { scale: 0.97 } : {}}
      onClick={isTargetable ? onSelect : undefined}
      animate={{
        width: isHovered && !compact ? 320 : compact ? 180 : 260,
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`
        rounded-lg relative overflow-visible
        ${compact ? "p-3" : "p-4"}
        ${!player.isAlive ? "opacity-30 grayscale" : ""}
        ${isTargetable && player.isAlive ? "cursor-pointer" : ""}
        transition-colors duration-300
      `}
      style={{
        background: isMe 
          ? 'linear-gradient(135deg, oklch(0.14 0.02 70 / 0.9), oklch(0.10 0.01 70 / 0.8))'
          : 'linear-gradient(135deg, oklch(0.12 0.01 280 / 0.8), oklch(0.08 0.005 280 / 0.7))',
        border: isTargetable && player.isAlive 
          ? `2px solid ${sinColor}` 
          : isCurrentTurn 
            ? '2px solid oklch(0.75 0.12 70 / 0.4)'
            : isMe 
              ? '2px solid oklch(0.75 0.12 70 / 0.25)'
              : '2px solid oklch(0.3 0.02 280 / 0.3)',
        boxShadow: isHovered
          ? `0 8px 24px oklch(0 0 0 / 0.4), inset 0 1px 0 oklch(0.4 0.05 70 / 0.15)${isTargetable && player.isAlive ? `, 0 0 20px ${sinColor}40` : ''}`
          : isTargetable && player.isAlive 
            ? `0 0 20px ${sinColor}40, inset 0 1px 0 oklch(0.4 0.05 70 / 0.1)` 
            : isMe 
              ? 'inset 0 1px 0 oklch(0.4 0.05 70 / 0.15), 0 4px 12px oklch(0 0 0 / 0.3)'
              : 'inset 0 1px 0 oklch(0.3 0.02 280 / 0.1), 0 2px 8px oklch(0 0 0 / 0.2)',
        backdropFilter: 'blur(8px)',
        zIndex: isHovered ? 30 : 1,
      }}
    >
      {/* Stone texture overlay */}
      {player.isAlive && (
        <div className="absolute inset-0 opacity-[0.04] rounded-lg" style={{ 
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
        {/* Avatar + Name Row */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div 
            className={`${compact ? "w-10 h-10" : isHovered ? "w-16 h-16" : "w-14 h-14"} rounded-full overflow-hidden border-2 flex-shrink-0 transition-all duration-200`} 
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
            <div className="flex items-center gap-1.5">
              <span
                className={`${compact ? "text-sm" : isHovered ? "text-xl" : "text-lg"} font-bold text-foreground transition-all duration-200 ${isHovered ? '' : 'truncate'}`}
                style={{ 
                  fontFamily: "var(--font-heading)",
                  textDecoration: !player.isAlive ? "line-through" : "none",
                  wordBreak: isHovered ? 'break-word' : undefined,
                }}
                title={displayName}
              >
                {displayName}
              </span>
              {isMe && (
                <span 
                  className="text-candle/70 ml-1 text-xs font-bold flex-shrink-0 px-1.5 py-0.5 rounded-full"
                  style={{ background: 'oklch(0.75 0.12 70 / 0.12)', border: '1px solid oklch(0.75 0.12 70 / 0.2)' }}
                >
                  YOU
                </span>
              )}
            </div>
            
            {/* Sin name label */}
            <span
              className="text-xs font-medium uppercase tracking-wider opacity-60"
              style={{ fontFamily: "var(--font-heading)", color: sinColor }}
            >
              {player.chosenSin || "unknown"}
            </span>

            {player.isAlive && player.hasLockedIn && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-candle/80" />
                <span className="text-[10px] text-candle/70 font-bold uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                  Locked In
                </span>
              </div>
            )}
          </div>
        </div>

        {/* HP Bar — larger and more readable */}
          <div className="flex items-center gap-2.5 mb-2">
          <div className={`relative flex-1 ${compact ? "h-5" : "h-7"} bg-muted/50 rounded-full overflow-hidden`}>
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
                className="absolute inset-y-0 bg-cyan-400/70 rounded-full"
                style={{ left: `${hpPercent}%` }}
              />
            )}
            {/* HP text inside the bar */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" style={{ fontFamily: "var(--font-heading)" }}>
                {player.currentHp}/{player.maxHp}
                {shieldValue > 0 && <span className="text-cyan-300 ml-1">+{shieldValue}</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Energy Orbs */}
        {player.isAlive && (
          <EnergyOrbs
            current={player.currentEnergy}
            max={MAX_ENERGY}
            sinColor={sinColor}
            bonusEnergy={player.bonusEnergy}
          />
        )}

        {/* Effect Badges — show more on hover */}
        {allEffects.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-1">
            {(isHovered ? allEffects : collapsedEffects).map((effect, i) => (
              <EffectBadge
                key={`${effect.cardId}-${effect.effectType}-${i}`}
                effect={effect}
                currentRound={currentRound}
                compact={compact}
              />
            ))}
            {!isHovered && hiddenEffectsCount > 0 && (
              <div className="inline-flex items-center px-1.5 py-0.5 rounded-md border border-border/30 bg-background/20">
                <span className="text-xs text-muted-foreground font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                  +{hiddenEffectsCount}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Target indicator */}
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
});
