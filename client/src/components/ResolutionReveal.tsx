/**
 * ResolutionReveal — Cinematic card-by-card reveal during resolution phase
 *
 * Shows a central stack of locked plays. Each card slides in one at a time
 * in priority order (skip-queue first, lowest HP first). The player name,
 * card art, and target are shown with dramatic animation before the next
 * card resolves.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo, useRef } from "react";
import { CARD_MAP } from "@shared/cardData";
import { LockedPlay, SinType, PlayerState } from "@shared/gameTypes";
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
import { CARD_ART_URLS } from "@/lib/cardArtUrls";
import { soundEngine } from "@/lib/soundEngine";

const SIN_COLORS: Record<string, string> = {
  wrath: "oklch(0.65 0.25 25)",
  greed: "oklch(0.75 0.18 85)",
  sloth: "oklch(0.55 0.18 280)",
  pride: "oklch(0.65 0.2 320)",
  lust: "oklch(0.65 0.22 350)",
  envy: "oklch(0.65 0.2 145)",
  gluttony: "oklch(0.65 0.2 45)",
};

const effectDisplayNames: Record<string, string> = {
  damage: "Hurt",
  self_damage: "Backlash",
  heal_gain: "Mend",
  heal_steal: "Siphon Life",
  shield_gain: "Ward",
  shield_steal: "Crack Ward",
  energy_gain: "Recharge",
  energy_steal: "Drain",
  heal_block: "Cursed",
  shield_block: "Shatter",
  energy_block: "Exhaust",
  affliction_amplify: "Intensify",
  affliction_transfer: "Redirect",
};

interface ResolutionRevealProps {
  lockedPlays: LockedPlay[];
  players: PlayerState[];
  currentRound: number;
  isResolving: boolean;
}

export default function ResolutionReveal({
  lockedPlays,
  players,
  currentRound,
  isResolving,
}: ResolutionRevealProps) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showCard, setShowCard] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedRef = useRef(false);

  // Sort plays the same way as resolveLockedPlays in gameEngine
  const sortedPlays = useMemo(() => {
    if (!lockedPlays || lockedPlays.length === 0) return [];
    return [...lockedPlays]
      .filter((p) => !("pass" in p))
      .sort((a, b) => {
        if (a.skipQueue && !b.skipQueue) return -1;
        if (!a.skipQueue && b.skipQueue) return 1;
        const playerA = players.find((p) => p.id === a.playerId);
        const playerB = players.find((p) => p.id === b.playerId);
        const hpA = playerA?.currentHp ?? 999;
        const hpB = playerB?.currentHp ?? 999;
        if (hpA !== hpB) return hpA - hpB;
        return 0;
      });
  }, [lockedPlays, players]);

  // Animate through cards one by one
  useEffect(() => {
    if (!isResolving || sortedPlays.length === 0) {
      setCurrentIndex(-1);
      setShowCard(false);
      hasStartedRef.current = false;
      return;
    }

    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    let idx = 0;
    const revealNext = () => {
      if (idx >= sortedPlays.length) {
        setShowCard(false);
        return;
      }
      setCurrentIndex(idx);
      setShowCard(true);
      try { soundEngine.play("card_play"); } catch {}
      
      idx++;
      timerRef.current = setTimeout(() => {
        setShowCard(false);
        setTimeout(revealNext, 300); // Brief gap between cards
      }, 1800); // Each card visible for 1.8s
    };

    // Start after a brief delay
    timerRef.current = setTimeout(revealNext, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isResolving, sortedPlays]);

  // Reset when round changes
  useEffect(() => {
    hasStartedRef.current = false;
    setCurrentIndex(-1);
    setShowCard(false);
  }, [currentRound]);

  if (!isResolving || sortedPlays.length === 0) return null;

  const currentPlay = currentIndex >= 0 ? sortedPlays[currentIndex] : null;
  const currentCard = currentPlay ? CARD_MAP[currentPlay.cardId] : null;
  const currentPlayer = currentPlay
    ? players.find((p) => p.id === currentPlay.playerId)
    : null;
  const targetPlayer = currentPlay?.targetPlayerId
    ? players.find((p) => p.id === currentPlay.targetPlayerId)
    : null;
  const sinColor = currentPlayer
    ? SIN_COLORS[currentPlayer.chosenSin || "wrath"]
    : SIN_COLORS.wrath;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
      {/* Backdrop pulse */}
      <AnimatePresence>
        {showCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl"
            style={{
              background: `radial-gradient(circle at center, ${sinColor}15 0%, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div className="absolute top-2 flex gap-1.5">
        {sortedPlays.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i === currentIndex ? 1.3 : 1,
              opacity: i <= currentIndex ? 1 : 0.3,
            }}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor:
                i === currentIndex
                  ? sinColor
                  : i < currentIndex
                    ? "oklch(0.75 0.12 70 / 0.6)"
                    : "oklch(0.5 0 0 / 0.3)",
            }}
          />
        ))}
      </div>

      {/* Card reveal */}
      <AnimatePresence mode="wait">
        {showCard && currentCard && currentPlayer && (
          <motion.div
            key={`${currentIndex}-${currentPlay?.cardId}`}
            initial={{ opacity: 0, scale: 0.6, y: 40, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -30 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-3"
          >
            {/* Player badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: `${sinColor}20`,
                border: `1px solid ${sinColor}40`,
              }}
            >
              <div
                className="w-6 h-6 rounded-full overflow-hidden border"
                style={{ borderColor: sinColor }}
              >
                <img
                  src={FACTION_PORTRAITS[currentPlayer.chosenSin as SinType]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <span
                className="text-sm font-bold"
                style={{
                  color: sinColor,
                  fontFamily: "var(--font-heading)",
                }}
              >
                {currentPlayer.username}
              </span>
              {currentPlay?.skipQueue && (
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                  Priority
                </span>
              )}
            </motion.div>

            {/* Card mini-art */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative w-32 h-44 rounded-lg overflow-hidden"
              style={{
                border: `2px solid ${sinColor}60`,
                boxShadow: `0 0 30px ${sinColor}30, 0 8px 32px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Card art background */}
              <div className="absolute inset-0">
                <img
                  src={CARD_ART_URLS[currentCard.id] || ""}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to top, ${sinColor}90 0%, transparent 60%)`,
                  }}
                />
              </div>

              {/* Card name overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p
                  className="text-xs font-black text-white uppercase tracking-wider leading-tight"
                  style={{
                    fontFamily: "var(--font-heading)",
                    textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                  }}
                >
                  {currentCard.name}
                </p>
                {/* Effect summary */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentCard.effects.slice(0, 2).map((eff, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-bold px-1 py-0.5 rounded"
                      style={{
                        background: "rgba(0,0,0,0.5)",
                        color: "rgba(255,255,255,0.8)",
                      }}
                    >
                      {effectDisplayNames[eff.type] || eff.type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Energy cost badge */}
              <div
                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                style={{
                  background: `${sinColor}`,
                  color: "rgba(0,0,0,0.8)",
                  boxShadow: `0 0 8px ${sinColor}60`,
                }}
              >
                {currentCard.cost}
              </div>
            </motion.div>

            {/* Target arrow */}
            {targetPlayer && targetPlayer.id !== currentPlayer.id && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex items-center gap-2"
              >
                <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                  targeting
                </span>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                  <div className="w-4 h-4 rounded-full overflow-hidden">
                    <img
                      src={FACTION_PORTRAITS[(targetPlayer.chosenSin as SinType) || "wrath"]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-red-400" style={{ fontFamily: "var(--font-heading)" }}>
                    {targetPlayer.username}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Resolve counter */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.4 }}
              className="text-[10px] text-muted-foreground uppercase tracking-widest"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {currentIndex + 1} of {sortedPlays.length}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waiting state between cards */}
      <AnimatePresence>
        {!showCard && currentIndex >= 0 && currentIndex < sortedPlays.length - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-candle/40"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
