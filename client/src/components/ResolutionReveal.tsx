/**
 * ResolutionReveal — Cinematic card-by-card reveal during resolution phase
 *
 * v2: AAA Elevation — Cards SLAM down from above with spring bounce,
 *     screen-shake impulse, dramatic vignette pulse, and staggered timing.
 *     Each card feels like it physically impacts the table.
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
  const [impactFlash, setImpactFlash] = useState(false);
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
      // Impact flash on slam
      setImpactFlash(true);
      setTimeout(() => setImpactFlash(false), 150);
      try { soundEngine.play("card_play"); } catch {}
      
      idx++;
      timerRef.current = setTimeout(() => {
        setShowCard(false);
        setTimeout(revealNext, 250);
      }, 1600);
    };

    timerRef.current = setTimeout(revealNext, 400);

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
      {/* Impact flash — brief white/sin-color burst on card slam */}
      <AnimatePresence>
        {impactFlash && (
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 rounded-2xl z-40"
            style={{
              background: `radial-gradient(circle at center, ${sinColor}40 0%, transparent 60%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Backdrop vignette */}
      <AnimatePresence>
        {showCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 rounded-2xl"
            style={{
              background: `radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.4) 100%), radial-gradient(circle at center, ${sinColor}12 0%, transparent 60%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div className="absolute top-2 md:top-4 flex gap-1.5 z-50">
        {sortedPlays.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i === currentIndex ? 1.4 : 1,
              opacity: i <= currentIndex ? 1 : 0.3,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor:
                i === currentIndex
                  ? sinColor
                  : i < currentIndex
                    ? "oklch(0.75 0.12 70 / 0.6)"
                    : "oklch(0.5 0 0 / 0.3)",
              boxShadow: i === currentIndex ? `0 0 8px ${sinColor}80` : "none",
            }}
          />
        ))}
      </div>

      {/* Card SLAM reveal */}
      <AnimatePresence mode="wait">
        {showCard && currentCard && currentPlayer && (
          <motion.div
            key={`${currentIndex}-${currentPlay?.cardId}`}
            initial={{ opacity: 0, scale: 1.3, y: -200, rotateX: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20, rotateX: 5 }}
            transition={{
              type: "spring",
              stiffness: 600,
              damping: 35,
              mass: 0.8,
            }}
            className="flex flex-col items-center gap-2 md:gap-3"
            style={{ perspective: 1000 }}
          >
            {/* Player badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05, type: "spring", stiffness: 400, damping: 25 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm"
              style={{
                background: `${sinColor}25`,
                border: `1px solid ${sinColor}50`,
                boxShadow: `0 0 20px ${sinColor}15`,
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

            {/* Card — larger, with impact shadow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08, type: "spring", stiffness: 500, damping: 30 }}
              className="relative w-36 h-48 md:w-40 md:h-56 rounded-lg overflow-hidden"
              style={{
                border: `2px solid ${sinColor}70`,
                boxShadow: `
                  0 0 40px ${sinColor}40,
                  0 0 80px ${sinColor}15,
                  0 20px 60px rgba(0,0,0,0.6),
                  inset 0 1px 0 rgba(255,255,255,0.1)
                `,
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
                    background: `linear-gradient(to top, ${sinColor}95 0%, ${sinColor}30 40%, transparent 70%)`,
                  }}
                />
              </div>

              {/* Card name overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <p
                  className="text-sm md:text-base font-black text-white uppercase tracking-wider leading-tight"
                  style={{
                    fontFamily: "var(--font-heading)",
                    textShadow: `0 2px 8px rgba(0,0,0,0.9), 0 0 20px ${sinColor}40`,
                  }}
                >
                  {currentCard.name}
                </p>
                {/* Effect summary */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {currentCard.effects.slice(0, 3).map((eff, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.08 }}
                      className="text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        background: "rgba(0,0,0,0.6)",
                        color: "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      {effectDisplayNames[eff.type] || eff.type}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Energy cost badge — glowing */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 600, damping: 20 }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                style={{
                  background: sinColor,
                  color: "rgba(0,0,0,0.85)",
                  boxShadow: `0 0 12px ${sinColor}80, 0 0 24px ${sinColor}30`,
                }}
              >
                {currentCard.cost}
              </motion.div>
            </motion.div>

            {/* Target arrow — dramatic */}
            {targetPlayer && targetPlayer.id !== currentPlayer.id && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 25 }}
                className="flex items-center gap-2"
              >
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-heading)", color: `${sinColor}90` }}
                >
                  ▸
                </motion.span>
                <span className="text-xs text-muted-foreground font-medium" style={{ fontFamily: "var(--font-heading)" }}>
                  targeting
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm"
                  style={{
                    background: "rgba(220,50,50,0.12)",
                    border: "1px solid rgba(220,50,50,0.25)",
                  }}
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-red-500/30">
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
                <motion.span
                  animate={{ x: [0, -4, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-heading)", color: `${sinColor}90` }}
                >
                  ◂
                </motion.span>
              </motion.div>
            )}

            {/* Resolve counter */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.3 }}
              className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]"
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
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: `${sinColor}60` }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
