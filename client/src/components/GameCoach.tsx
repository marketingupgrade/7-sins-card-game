/**
 * GameCoach — Contextual First-Game Coaching System
 *
 * Non-blocking floating tips that appear during a player's first game.
 * Each tip triggers based on game state conditions and shows only once.
 *
 * Tips:
 * - First turn: "Select a card from your hand to play it"
 * - First targeting: "Click an opponent to target them"
 * - Low energy: "You can pass to save energy for next round"
 * - Low HP: "Consider playing defensive cards or shields"
 * - Compound ticking: "Your compound effects are dealing damage each round"
 * - Round 16+: "Afflictions just doubled! The endgame is here"
 * - Final Reckoning approaching: "Round 20 triggers the Final Reckoning"
 * - First card played: "Nice! That card will compound over multiple rounds"
 *
 * Stored in localStorage per-tip so each only shows once ever.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb, Zap, Shield, Target, Clock, Flame, ArrowRight } from "lucide-react";

const STORAGE_PREFIX = "7sins_coach_";

interface CoachTip {
  id: string;
  icon: React.ReactNode;
  color: string;
  title: string;
  body: string;
  /** Duration in ms before auto-dismiss (0 = manual only) */
  autoDismissMs: number;
}

const ALL_TIPS: CoachTip[] = [
  {
    id: "first_turn",
    icon: <Lightbulb className="w-4 h-4" />,
    color: "oklch(0.75 0.15 85)",
    title: "Your First Turn",
    body: "Tap a card from your hand to select it, then click an opponent to target them. Or press Pass to skip.",
    autoDismissMs: 12000,
  },
  {
    id: "select_target",
    icon: <Target className="w-4 h-4" />,
    color: "oklch(0.65 0.25 25)",
    title: "Choose a Target",
    body: "Click on an opponent's portrait to target them with your selected card.",
    autoDismissMs: 8000,
  },
  {
    id: "low_energy",
    icon: <Zap className="w-4 h-4" />,
    color: "oklch(0.75 0.15 85)",
    title: "Low on Energy",
    body: "You can pass this turn to save energy. Unspent energy carries over to next round — save up for a big play!",
    autoDismissMs: 8000,
  },
  {
    id: "low_hp",
    icon: <Shield className="w-4 h-4" />,
    color: "oklch(0.65 0.25 350)",
    title: "Health Getting Low",
    body: "Consider playing heal or shield cards to survive. Check your hand for defensive options.",
    autoDismissMs: 8000,
  },
  {
    id: "compound_ticking",
    icon: <Clock className="w-4 h-4" />,
    color: "oklch(0.65 0.15 280)",
    title: "Compound Effects Active",
    body: "Your previously played cards are dealing damage each round automatically. The multiplier increases each tick!",
    autoDismissMs: 8000,
  },
  {
    id: "card_played",
    icon: <ArrowRight className="w-4 h-4" />,
    color: "oklch(0.65 0.2 140)",
    title: "Card Played!",
    body: "That card will compound over multiple rounds, dealing increasing damage each tick. Early cards have the highest total value.",
    autoDismissMs: 6000,
  },
  {
    id: "affliction_doubled",
    icon: <Flame className="w-4 h-4" />,
    color: "oklch(0.65 0.25 25)",
    title: "Afflictions Doubled!",
    body: "At round 16, all active afflictions are doubled. The endgame is here — play aggressively or defend hard.",
    autoDismissMs: 10000,
  },
  {
    id: "reckoning_soon",
    icon: <Flame className="w-4 h-4" />,
    color: "oklch(0.65 0.2 55)",
    title: "Final Reckoning Approaching",
    body: "If the game reaches round 20, ALL remaining cards in your hand are played at once. Save your best cards!",
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

/** Check if this is the player's first game (no tips have been seen yet) */
function isFirstGame(): boolean {
  try {
    return localStorage.getItem(STORAGE_PREFIX + "any_game_played") !== "true";
  } catch {
    return false;
  }
}

export function markGamePlayed(): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + "any_game_played", "true");
  } catch {}
}

interface GameCoachProps {
  /** Current round number */
  round: number;
  /** Player's current HP */
  playerHp: number;
  /** Player's max HP */
  maxHp: number;
  /** Player's current energy */
  energy: number;
  /** Whether it's the player's turn to select */
  isSelectionPhase: boolean;
  /** Whether the player has selected a card */
  hasSelectedCard: boolean;
  /** Whether the player has active compound effects */
  hasActiveCompounds: boolean;
  /** Whether a card was just played this round */
  cardJustPlayed: boolean;
  /** Whether afflictions were just doubled */
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
  const tipQueueRef = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownThisSessionRef = useRef<Set<string>>(new Set());

  // Only show tips during first game
  const firstGame = isFirstGame();

  const showTip = useCallback((tipId: string) => {
    if (!firstGame) return;
    if (isTipSeen(tipId)) return;
    if (shownThisSessionRef.current.has(tipId)) return;

    const tip = ALL_TIPS.find((t) => t.id === tipId);
    if (!tip) return;

    shownThisSessionRef.current.add(tipId);
    markTipSeen(tipId);
    setActiveTip(tip);
    setDismissed(false);

    // Auto-dismiss
    if (timerRef.current) clearTimeout(timerRef.current);
    if (tip.autoDismissMs > 0) {
      timerRef.current = setTimeout(() => {
        setDismissed(true);
        setTimeout(() => setActiveTip(null), 300);
      }, tip.autoDismissMs);
    }
  }, [firstGame]);

  const dismissTip = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDismissed(true);
    setTimeout(() => setActiveTip(null), 300);
  }, []);

  // Trigger tips based on game state
  useEffect(() => {
    if (!firstGame) return;

    // First turn
    if (round === 1 && isSelectionPhase && !hasSelectedCard) {
      showTip("first_turn");
    }
  }, [round, isSelectionPhase, hasSelectedCard, firstGame, showTip]);

  useEffect(() => {
    if (!firstGame) return;

    // Card selected, need target
    if (hasSelectedCard && isSelectionPhase) {
      showTip("select_target");
    }
  }, [hasSelectedCard, isSelectionPhase, firstGame, showTip]);

  useEffect(() => {
    if (!firstGame) return;

    // Low energy (can't play most cards)
    if (energy <= 1 && isSelectionPhase && round > 1) {
      showTip("low_energy");
    }
  }, [energy, isSelectionPhase, round, firstGame, showTip]);

  useEffect(() => {
    if (!firstGame) return;

    // Low HP
    if (playerHp < maxHp * 0.3 && playerHp > 0) {
      showTip("low_hp");
    }
  }, [playerHp, maxHp, firstGame, showTip]);

  useEffect(() => {
    if (!firstGame) return;

    // Compound effects ticking
    if (hasActiveCompounds && round > 2) {
      showTip("compound_ticking");
    }
  }, [hasActiveCompounds, round, firstGame, showTip]);

  useEffect(() => {
    if (!firstGame) return;

    // Card just played
    if (cardJustPlayed) {
      showTip("card_played");
    }
  }, [cardJustPlayed, firstGame, showTip]);

  useEffect(() => {
    if (!firstGame) return;

    // Affliction doubling
    if (afflictionsDoubled) {
      showTip("affliction_doubled");
    }
  }, [afflictionsDoubled, firstGame, showTip]);

  useEffect(() => {
    if (!firstGame) return;

    // Final Reckoning approaching
    if (round >= 18) {
      showTip("reckoning_soon");
    }
  }, [round, firstGame, showTip]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!activeTip) return null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20, x: "-50%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-24 sm:bottom-28 left-1/2 z-[9990] w-[calc(100%-2rem)] max-w-sm pointer-events-auto"
        >
          <div
            className="rounded-xl p-3.5 sm:p-4 backdrop-blur-xl border shadow-lg"
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
                <div className="flex items-center justify-between mb-1">
                  <h4
                    className="text-xs font-bold tracking-wider"
                    style={{ fontFamily: "var(--font-heading)", color: activeTip.color }}
                  >
                    {activeTip.title}
                  </h4>
                  <button
                    onClick={dismissTip}
                    className="text-white/20 hover:text-white/50 transition-colors p-0.5 shrink-0 ml-2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
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
