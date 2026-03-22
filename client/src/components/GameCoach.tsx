/**
 * GameCoach — The Narrator Whispers
 *
 * Non-blocking floating tips that appear during a player's first game.
 * Written in the brand's sardonic narrator voice — an omniscient entity
 * who has watched humanity sin for millennia and is tired of it.
 *
 * Each tip triggers based on game state conditions and shows only once.
 * Stored in localStorage per-tip so each only shows once ever.
 *
 * CRITICAL: The outer container uses pointer-events-none so it never
 * blocks touch/click interactions on the game board beneath it.
 * Only the inner card uses pointer-events-auto for the dismiss button.
 *
 * Users can permanently toggle off coaching via the dismiss-all button.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Shield, Target, Clock, Flame, ArrowRight, Skull, Eye, EyeOff } from "lucide-react";

const STORAGE_PREFIX = "7sins_coach_";
const COACHING_DISABLED_KEY = "7sins_coaching_disabled";

interface CoachTip {
  id: string;
  icon: React.ReactNode;
  color: string;
  title: string;
  narratorFlavor: string;
  body: string;
  autoDismissMs: number;
}

const ALL_TIPS: CoachTip[] = [
  {
    id: "first_turn",
    icon: <Eye className="w-4 h-4" />,
    color: "oklch(0.75 0.15 85)",
    title: "The First Temptation",
    narratorFlavor: "Every sinner starts somewhere.",
    body: "Select a card from your hand, then click an opponent to target them. Or press Pass — even the patient can win.",
    autoDismissMs: 12000,
  },
  {
    id: "select_target",
    icon: <Target className="w-4 h-4" />,
    color: "oklch(0.65 0.25 25)",
    title: "Choose Your Victim",
    narratorFlavor: "The weak make easy prey. The strong make worthy enemies.",
    body: "Click an opponent's portrait to direct your sin at them. Choose wisely — or don't. The cathedral judges either way.",
    autoDismissMs: 8000,
  },
  {
    id: "low_energy",
    icon: <Zap className="w-4 h-4" />,
    color: "oklch(0.75 0.15 85)",
    title: "Your Corruption Runs Dry",
    narratorFlavor: "Patience. Even sin has a budget.",
    body: "Pass this turn to carry your corruption forward. Restraint today enables devastation tomorrow.",
    autoDismissMs: 8000,
  },
  {
    id: "low_hp",
    icon: <Shield className="w-4 h-4" />,
    color: "oklch(0.65 0.25 350)",
    title: "The Reaper Draws Near",
    narratorFlavor: "Even the damned must defend themselves.",
    body: "Your HP is dangerously low. Heal or shield — a dead sinner plays no cards.",
    autoDismissMs: 8000,
  },
  {
    id: "compound_ticking",
    icon: <Clock className="w-4 h-4" />,
    color: "oklch(0.65 0.15 280)",
    title: "Your Sins Accumulate",
    narratorFlavor: "The compound interest on evil is remarkably consistent.",
    body: "Your previously played cards are compounding — dealing increasing damage each round automatically. Early investments pay the richest dividends.",
    autoDismissMs: 8000,
  },
  {
    id: "card_played",
    icon: <ArrowRight className="w-4 h-4" />,
    color: "oklch(0.65 0.2 140)",
    title: "Your Corruption Spreads",
    narratorFlavor: "One act of sin, echoing through eternity.",
    body: "That card will compound over multiple rounds, growing stronger each tick. The earlier you plant your sins, the greater the harvest.",
    autoDismissMs: 6000,
  },
  {
    id: "affliction_doubled",
    icon: <Flame className="w-4 h-4" />,
    color: "oklch(0.65 0.25 25)",
    title: "The Cathedral Trembles",
    narratorFlavor: "All afflictions doubled. The endgame has teeth.",
    body: "At round 16, every active affliction doubles in power. Play aggressively or fortify — half-measures die here.",
    autoDismissMs: 10000,
  },
  {
    id: "reckoning_soon",
    icon: <Skull className="w-4 h-4" />,
    color: "oklch(0.65 0.2 55)",
    title: "Judgment Approaches",
    narratorFlavor: "The Final Reckoning spares no one.",
    body: "If round 20 arrives, ALL remaining cards in every hand are played at once. Hoard your best sins — or use them before the cathedral decides for you.",
    autoDismissMs: 10000,
  },
];

function isTipSeen(tipId: string): boolean {
  try {
    return localStorage.getItem(STORAGE_PREFIX + tipId) === "true";
  } catch {
    return false;
  }
}

function markTipSeen(tipId: string): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + tipId, "true");
  } catch {}
}

function isFirstGame(): boolean {
  try {
    return localStorage.getItem(STORAGE_PREFIX + "any_game_played") !== "true";
  } catch {
    return false;
  }
}

export function isCoachingDisabled(): boolean {
  try {
    return localStorage.getItem(COACHING_DISABLED_KEY) === "true";
  } catch {
    return false;
  }
}

export function setCoachingDisabled(disabled: boolean): void {
  try {
    localStorage.setItem(COACHING_DISABLED_KEY, disabled ? "true" : "false");
  } catch {}
}

export function markGamePlayed(): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + "any_game_played", "true");
  } catch {}
}

interface GameCoachProps {
  round: number;
  playerHp: number;
  maxHp: number;
  energy: number;
  isSelectionPhase: boolean;
  hasSelectedCard: boolean;
  hasActiveCompounds: boolean;
  cardJustPlayed: boolean;
  afflictionsDoubled: boolean;
}

export default function GameCoach({
  round,
  playerHp,
  maxHp,
  energy,
  isSelectionPhase,
  hasSelectedCard,
  hasActiveCompounds,
  cardJustPlayed,
  afflictionsDoubled,
}: GameCoachProps) {
  const [activeTip, setActiveTip] = useState<CoachTip | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [coachingOff, setCoachingOff] = useState(isCoachingDisabled);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownThisSessionRef = useRef<Set<string>>(new Set());

  const firstGame = isFirstGame();

  const showTip = useCallback((tipId: string) => {
    if (!firstGame || coachingOff) return;
    if (isTipSeen(tipId)) return;
    if (shownThisSessionRef.current.has(tipId)) return;

    const tip = ALL_TIPS.find((t) => t.id === tipId);
    if (!tip) return;

    shownThisSessionRef.current.add(tipId);
    markTipSeen(tipId);
    setActiveTip(tip);
    setDismissed(false);

    if (timerRef.current) clearTimeout(timerRef.current);
    if (tip.autoDismissMs > 0) {
      timerRef.current = setTimeout(() => {
        setDismissed(true);
        setTimeout(() => setActiveTip(null), 300);
      }, tip.autoDismissMs);
    }
  }, [firstGame, coachingOff]);

  const dismissTip = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDismissed(true);
    setTimeout(() => setActiveTip(null), 300);
  }, []);

  const toggleCoachingOff = useCallback(() => {
    setCoachingDisabled(true);
    setCoachingOff(true);
    dismissTip();
  }, [dismissTip]);

  // Trigger tips based on game state
  useEffect(() => {
    if (!firstGame || coachingOff) return;
    if (round === 1 && isSelectionPhase && !hasSelectedCard) {
      showTip("first_turn");
    }
  }, [round, isSelectionPhase, hasSelectedCard, firstGame, coachingOff, showTip]);

  useEffect(() => {
    if (!firstGame || coachingOff) return;
    if (hasSelectedCard && isSelectionPhase) {
      showTip("select_target");
    }
  }, [hasSelectedCard, isSelectionPhase, firstGame, coachingOff, showTip]);

  useEffect(() => {
    if (!firstGame || coachingOff) return;
    if (energy <= 1 && isSelectionPhase && round > 1) {
      showTip("low_energy");
    }
  }, [energy, isSelectionPhase, round, firstGame, coachingOff, showTip]);

  useEffect(() => {
    if (!firstGame || coachingOff) return;
    if (playerHp < maxHp * 0.3 && playerHp > 0) {
      showTip("low_hp");
    }
  }, [playerHp, maxHp, firstGame, coachingOff, showTip]);

  useEffect(() => {
    if (!firstGame || coachingOff) return;
    if (hasActiveCompounds && round > 2) {
      showTip("compound_ticking");
    }
  }, [hasActiveCompounds, round, firstGame, coachingOff, showTip]);

  useEffect(() => {
    if (!firstGame || coachingOff) return;
    if (cardJustPlayed) {
      showTip("card_played");
    }
  }, [cardJustPlayed, firstGame, coachingOff, showTip]);

  useEffect(() => {
    if (!firstGame || coachingOff) return;
    if (afflictionsDoubled) {
      showTip("affliction_doubled");
    }
  }, [afflictionsDoubled, firstGame, coachingOff, showTip]);

  useEffect(() => {
    if (!firstGame || coachingOff) return;
    if (round >= 18) {
      showTip("reckoning_soon");
    }
  }, [round, firstGame, coachingOff, showTip]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!activeTip || coachingOff) return null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20, x: "-50%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-24 sm:bottom-28 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm pointer-events-none"
        >
          <div
            className="rounded-xl p-3.5 sm:p-4 backdrop-blur-xl border shadow-lg pointer-events-auto"
            style={{
              background: "oklch(0.12 0.02 280 / 0.92)",
              borderColor: `${activeTip.color}30`,
              boxShadow: `0 4px 20px oklch(0 0 0 / 0.5), 0 0 15px ${activeTip.color}15`,
            }}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${activeTip.color}15`, color: activeTip.color }}
              >
                {activeTip.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4
                    className="text-xs font-bold tracking-wider"
                    style={{ fontFamily: "var(--font-heading)", color: activeTip.color }}
                  >
                    {activeTip.title}
                  </h4>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {/* Toggle off all coaching */}
                    <button
                      onClick={toggleCoachingOff}
                      className="text-white/15 hover:text-white/40 transition-colors p-0.5"
                      title="Turn off coaching tips"
                    >
                      <EyeOff className="w-3 h-3" />
                    </button>
                    {/* Dismiss this tip */}
                    <button
                      onClick={dismissTip}
                      className="text-white/20 hover:text-white/50 transition-colors p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {/* Narrator flavor */}
                <p
                  className="text-[10px] italic text-amber-200/25 mb-1 leading-relaxed"
                  style={{ fontFamily: "var(--font-narrator)" }}
                >
                  "{activeTip.narratorFlavor}"
                </p>
                <p
                  className="text-xs text-white/50 leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {activeTip.body}
                </p>
              </div>
            </div>

            {/* Auto-dismiss progress bar */}
            {activeTip.autoDismissMs > 0 && (
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: activeTip.autoDismissMs / 1000, ease: "linear" }}
                className="h-0.5 rounded-full mt-2"
                style={{ background: `${activeTip.color}40` }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
