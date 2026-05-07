/**
 * PracticeAnnotations — The Narrator Guides Your First Steps
 *
 * Contextual annotations during the first 4 rounds of a practice game.
 * Written in the brand's sardonic narrator voice — an omniscient entity
 * who has watched humanity sin for millennia and finds your fumbling
 * both predictable and mildly entertaining.
 *
 * CRITICAL: The outer container uses pointer-events-none so it never
 * blocks touch/click interactions on the game board beneath it.
 * Only the inner card uses pointer-events-auto for the dismiss button.
 *
 * Reads practice state from localStorage to determine if active.
 * Automatically dismisses after round 4 or when manually closed.
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Swords, Sparkles, Target, Heart, Skull, Eye, EyeOff } from "lucide-react";
import type { SinType, PlayerState } from "@shared/gameTypes";
import { PASSIVE_INFO } from "@shared/gameTypes";
import { isCoachingDisabled, setCoachingDisabled } from "./GameCoach";

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
  narratorFlavor: string;
  message: string;
  icon: typeof Swords;
  position: "top" | "bottom" | "center";
  color: string;
}

const SIN_COLORS: Record<string, string> = {
  wrath: "#ef4444", sloth: "#a855f7", greed: "#eab308",
  envy: "#10b981", pride: "#f0f0f0", lust: "#ec4899", gluttony: "#b45309",
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
  const [coachingOff, setCoachingOff] = useState(isCoachingDisabled);

  const isPractice = useMemo(() => {
    return localStorage.getItem("7sins_practice_game") === gameId;
  }, [gameId]);

  useEffect(() => {
    if (isPractice) {
      localStorage.setItem("7sins_practice_round", String(currentRound));
    }
  }, [isPractice, currentRound]);

  useEffect(() => {
    if (currentRound > 4) {
      setDismissed(true);
      localStorage.removeItem("7sins_practice_game");
      localStorage.removeItem("7sins_practice_round");
    }
  }, [currentRound]);

  const mySin = (myPlayer?.chosenSin || "wrath") as SinType;
  const sinColor = SIN_COLORS[mySin] || "#ef4444";

  const annotation = useMemo((): Annotation | null => {
    if (dismissed || !isPractice || !myPlayer || coachingOff) return null;

    // Round 1 annotations
    if (currentRound === 1) {
      if (isMyTurn && selectedCardsCount === 0 && !hasLockedIn && turnPhase === "selection") {
        return {
          id: "r1_select",
          narratorFlavor: "Every sinner starts somewhere. Usually at the bottom.",
          message: "Select a card from your hand, then click your opponent to direct your sin at them. Cards with lower corruption cost are easier to play early.",
          icon: Swords,
          position: "bottom",
          color: sinColor,
        };
      }
      if (isMyTurn && selectedCardsCount > 0 && !hasLockedIn) {
        return {
          id: "r1_lockin",
          narratorFlavor: "Ambition. How refreshingly predictable.",
          message: `You can select more cards if you have corruption to spare, or press LOCK IN to commit your sins. You have ${myPlayer.currentEnergy} corruption remaining.`,
          icon: Zap,
          position: "bottom",
          color: sinColor,
        };
      }
      if (hasLockedIn) {
        return {
          id: "r1_waiting",
          narratorFlavor: "The die is cast. Now we wait.",
          message: "Your sins are locked in. The bot is choosing their own path to damnation. Effects resolve simultaneously — no take-backs.",
          icon: Target,
          position: "center",
          color: sinColor,
        };
      }
      if (turnPhase === "resolution") {
        return {
          id: "r1_resolution",
          narratorFlavor: "Watch closely. This is what sin looks like in motion.",
          message: "Effects are resolving. Damage, healing, and shields are applied simultaneously. Your compound effects will tick again next round, growing stronger.",
          icon: Sparkles,
          position: "top",
          color: sinColor,
        };
      }
    }

    // Round 2
    if (currentRound === 2) {
      if (isMyTurn && !hasLockedIn && turnPhase === "selection") {
        return {
          id: "r2_compound",
          narratorFlavor: "Your sins from last round are still echoing. That's the beauty of compound interest.",
          message: "Round 2. Your previous cards are compounding — dealing increasing damage each tick. Stack more effects now. Mix offense and defense. The cathedral rewards those who diversify their sins.",
          icon: Sparkles,
          position: "bottom",
          color: sinColor,
        };
      }
    }

    // Round 3
    if (currentRound === 3) {
      if (isMyTurn && !hasLockedIn && turnPhase === "selection") {
        const passiveInfo = PASSIVE_INFO[mySin];
        return {
          id: "r3_passive",
          narratorFlavor: `Your ${passiveInfo.name} works in the shadows. As all good sins should.`,
          message: `${passiveInfo.description.split('.')[0]}. This passive fires automatically — no action required. Build your strategy around it. After this round, the narrator falls silent.`,
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
          narratorFlavor: "The training wheels come off. Try not to crash into anything holy.",
          message: "You have the fundamentals. Spend corruption. Play early for compound value. Don't die. The rest is between you and whatever passes for your conscience.",
          icon: Skull,
          position: "center",
          color: sinColor,
        };
      }
    }

    return null;
  }, [dismissed, isPractice, myPlayer, currentRound, isMyTurn, selectedCardsCount, hasLockedIn, turnPhase, mySin, sinColor, coachingOff]);

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  const handleToggleOff = () => {
    setCoachingDisabled(true);
    setCoachingOff(true);
    setDismissed(true);
  };

  if (!annotation || dismissedIds.has(annotation.id) || coachingOff) return null;

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
        className={`fixed ${positionClasses[annotation.position]} max-w-sm w-[90vw] pointer-events-none z-[100]`}
      >
        <div
          className="rounded-xl border backdrop-blur-md px-4 py-3 shadow-xl pointer-events-auto"
          style={{
            background: `linear-gradient(135deg, ${annotation.color}15, rgba(5, 3, 10, 0.92))`,
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
              <div className="flex items-center gap-2 mb-0.5">
                <Eye className="w-3 h-3 text-amber-400/50" />
                <span
                  className="text-[9px] font-bold uppercase tracking-widest text-amber-300/40"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  The Narrator Observes
                </span>
              </div>
              {/* Narrator flavor */}
              <p
                className="text-[10px] italic text-amber-200/25 mb-1.5 leading-relaxed"
                style={{ fontFamily: "var(--font-narrator)" }}
              >
                "{annotation.narratorFlavor}"
              </p>
              <p
                className="text-xs text-white/55 leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {annotation.message}
              </p>
            </div>

            {/* Dismiss buttons */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <button
                onClick={handleToggleOff}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Turn off all coaching tips"
              >
                <EyeOff className="w-3 h-3 text-white/20" />
              </button>
              <button
                onClick={() => handleDismiss(annotation.id)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white/30" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function isPracticeGame(gameId: string): boolean {
  return localStorage.getItem("7sins_practice_game") === gameId;
}
