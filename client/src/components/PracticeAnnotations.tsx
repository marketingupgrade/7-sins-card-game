/**
 * PracticeAnnotations — In-game teaching overlays for Practice Mode
 *
 * Shows contextual annotations during the first 3 rounds of a practice game:
 * - Round 1: "This is your hand. Click a card to select it."
 * - Round 1: "Now click LOCK IN to confirm your plays."
 * - Round 2: "Notice how your compound effects are ticking!"
 * - Round 3: "You're getting the hang of it. Annotations will fade now."
 *
 * Reads practice state from localStorage to determine if active.
 * Automatically dismisses after round 3 or when manually closed.
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, X, ChevronRight, Zap, Swords, Shield, Sparkles, Target, Heart } from "lucide-react";
import type { SinType, PlayerState } from "@shared/gameTypes";
import { PASSIVE_INFO } from "@shared/gameTypes";

interface PracticeAnnotationsProps {
  gameId: string;
  currentRound: number;
  myPlayer: PlayerState | null;
  isMyTurn: boolean;
  hasLockedIn: boolean;
  selectedCardsCount: number;
  turnPhase: string;
}

interface Annotation {
  id: string;
  message: string;
  icon: typeof Swords;
  position: "top" | "bottom" | "center";
  color: string;
}

const SIN_COLORS: Record<string, string> = {
  wrath: "#ef4444", sloth: "#a855f7", greed: "#eab308",
  envy: "#22c55e", pride: "#f0f0f0", lust: "#ec4899", gluttony: "#b45309",
};

export default function PracticeAnnotations({
  gameId,
  currentRound,
  myPlayer,
  isMyTurn,
  hasLockedIn,
  selectedCardsCount,
  turnPhase,
}: PracticeAnnotationsProps) {
  const [dismissed, setDismissed] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Check if this is a practice game
  const isPractice = useMemo(() => {
    return localStorage.getItem("7sins_practice_game") === gameId;
  }, [gameId]);

  // Track practice round progress
  useEffect(() => {
    if (isPractice) {
      localStorage.setItem("7sins_practice_round", String(currentRound));
    }
  }, [isPractice, currentRound]);

  // Auto-dismiss after round 4
  useEffect(() => {
    if (currentRound > 4) {
      setDismissed(true);
      localStorage.removeItem("7sins_practice_game");
      localStorage.removeItem("7sins_practice_round");
    }
  }, [currentRound]);

  const mySin = (myPlayer?.chosenSin || "wrath") as SinType;
  const sinColor = SIN_COLORS[mySin] || "#ef4444";

  // Determine which annotation to show based on game state
  const annotation = useMemo((): Annotation | null => {
    if (dismissed || !isPractice || !myPlayer) return null;

    // Round 1 annotations
    if (currentRound === 1) {
      if (isMyTurn && selectedCardsCount === 0 && !hasLockedIn && turnPhase === "selection") {
        return {
          id: "r1_select",
          message: "This is your hand. Click a card to select it, then click the bot to target them. Cards with lower energy cost are easier to play early.",
          icon: Swords,
          position: "bottom",
          color: sinColor,
        };
      }
      if (isMyTurn && selectedCardsCount > 0 && !hasLockedIn) {
        return {
          id: "r1_lockin",
          message: `Great pick! You can select more cards if you have energy, or hit LOCK IN to confirm. You have ${myPlayer.currentEnergy} energy left.`,
          icon: Zap,
          position: "bottom",
          color: sinColor,
        };
      }
      if (hasLockedIn) {
        return {
          id: "r1_waiting",
          message: "Locked in! Now wait for the bot to make their move. Then effects will resolve simultaneously.",
          icon: Target,
          position: "center",
          color: sinColor,
        };
      }
      if (turnPhase === "resolution") {
        return {
          id: "r1_resolution",
          message: "Effects are resolving! Watch the damage, healing, and shields being applied. Compound effects will tick again next round.",
          icon: Sparkles,
          position: "top",
          color: sinColor,
        };
      }
    }

    // Round 2 annotations
    if (currentRound === 2) {
      if (isMyTurn && !hasLockedIn && turnPhase === "selection") {
        return {
          id: "r2_compound",
          message: "Round 2! Your cards from last round are still ticking — that's compound effects. Play more cards to stack even more effects. Try mixing offense and defense.",
          icon: Sparkles,
          position: "bottom",
          color: sinColor,
        };
      }
    }

    // Round 3 annotations
    if (currentRound === 3) {
      if (isMyTurn && !hasLockedIn && turnPhase === "selection") {
        const passiveInfo = PASSIVE_INFO[mySin];
        return {
          id: "r3_passive",
          message: `Your ${passiveInfo.name} passive is working behind the scenes. ${passiveInfo.description.split('.')[0]}. After this round, you're on your own!`,
          icon: Heart,
          position: "bottom",
          color: sinColor,
        };
      }
    }

    // Round 4 — farewell
    if (currentRound === 4) {
      if (isMyTurn && !hasLockedIn) {
        return {
          id: "r4_farewell",
          message: "You've got the basics down. From here, it's all you. Remember: spend energy, play early, don't die. Good luck!",
          icon: GraduationCap,
          position: "center",
          color: sinColor,
        };
      }
    }

    return null;
  }, [dismissed, isPractice, myPlayer, currentRound, isMyTurn, selectedCardsCount, hasLockedIn, turnPhase, mySin, sinColor]);

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  if (!annotation || dismissedIds.has(annotation.id)) return null;

  const Icon = annotation.icon;

  const positionClasses = {
    top: "top-20 left-1/2 -translate-x-1/2",
    bottom: "bottom-52 md:bottom-56 left-1/2 -translate-x-1/2",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  };

  return (
    <AnimatePresence>
      <motion.div
        key={annotation.id}
        initial={{ opacity: 0, y: annotation.position === "bottom" ? 20 : -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`fixed z-[60] ${positionClasses[annotation.position]} max-w-sm w-[90vw] pointer-events-auto`}
      >
        <div
          className="rounded-xl border backdrop-blur-md px-4 py-3 shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${annotation.color}15, rgba(0,0,0,0.85))`,
            borderColor: `${annotation.color}30`,
            boxShadow: `0 0 30px ${annotation.color}15`,
          }}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: `${annotation.color}20` }}
            >
              <Icon className="w-4 h-4" style={{ color: annotation.color }} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-3 h-3 text-amber-400/60" />
                <span
                  className="text-[9px] font-bold uppercase tracking-widest text-amber-300/50"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  PRACTICE TIP
                </span>
              </div>
              <p
                className="text-xs text-white/60 leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {annotation.message}
              </p>
            </div>

            {/* Dismiss */}
            <button
              onClick={() => handleDismiss(annotation.id)}
              className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-white/30" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function isPracticeGame(gameId: string): boolean {
  return localStorage.getItem("7sins_practice_game") === gameId;
}
