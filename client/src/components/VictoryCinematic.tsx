/**
 * VictoryCinematic — 5-step win cinematic before GameOverScreen
 *
 * Step 1: Screen blackout (0.5s)
 * Step 2: Sin color flood from center (0.6s)
 * Step 3: "VICTORY" text slams in with chromatic aberration (0.5s)
 * Step 4: Winner name + sin icon (0.5s)
 * Step 5: Fade to game over screen (0.4s)
 *
 * Total: ~2.5s cinematic before yielding to GameOverScreen.
 */

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SinType } from "@shared/gameTypes";
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";

interface VictoryCinematicProps {
  show: boolean;
  isWinner: boolean;
  winnerName: string;
  winnerSin: SinType;
  onComplete: () => void;
}

const SIN_HEX: Record<SinType, string> = {
  wrath: "#ef4444",
  sloth: "#a855f7",
  greed: "#eab308",
  envy: "#10b981",
  pride: "#f0f0f0",
  lust: "#ec4899",
  gluttony: "#b45309",
};

type CinematicStep = "blackout" | "flood" | "title" | "winner" | "fade" | "done";

export default function VictoryCinematic({ show, isWinner, winnerName, winnerSin, onComplete }: VictoryCinematicProps) {
  const [step, setStep] = useState<CinematicStep>("blackout");
  const hex = SIN_HEX[winnerSin];

  // Stabilize onComplete to prevent infinite re-render loop
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!show) { setStep("blackout"); return; }

    const sequence: Array<[CinematicStep, number]> = [
      ["blackout", 600],
      ["flood", 700],
      ["title", 800],
      ["winner", 900],
      ["fade", 500],
      ["done", 0],
    ];

    let totalDelay = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const [nextStep, delay] of sequence) {
      totalDelay += delay;
      const t = setTimeout(() => {
        setStep(nextStep);
        if (nextStep === "done") onCompleteRef.current();
      }, totalDelay);
      timers.push(t);
    }

    return () => timers.forEach(clearTimeout);
  }, [show]); // Only depend on `show`, not onComplete (stabilized via ref)

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="victory-cinematic"
        className="fixed inset-0 z-[500] overflow-hidden flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Blackout */}
        <motion.div
          className="absolute inset-0 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: step === "blackout" ? 1 : step === "flood" ? 0.3 : 0.7 }}
          transition={{ duration: 0.4 }}
        />

        {/* Color flood */}
        {(step === "flood" || step === "title" || step === "winner" || step === "fade") && (
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 0, opacity: 0, borderRadius: "50%" }}
            animate={{ scale: 4, opacity: 0.25, borderRadius: "0%" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{ background: `radial-gradient(circle, ${hex} 0%, transparent 70%)` }}
          />
        )}

        {/* Faction portrait silhouette */}
        {(step === "title" || step === "winner" || step === "fade") && (
          <motion.img
            src={FACTION_PORTRAITS[winnerSin]}
            alt="Faction portrait"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.12, scale: 1 }}
            transition={{ duration: 0.6 }}
            style={{ filter: `grayscale(0.3) sepia(0.3) hue-rotate(${winnerSin === 'greed' ? '0deg' : winnerSin === 'wrath' ? '320deg' : winnerSin === 'sloth' ? '240deg' : '120deg'})` }}
          />
        )}

        {/* VICTORY / DEFEAT title */}
        {(step === "title" || step === "winner" || step === "fade") && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, y: 40, scale: 1.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="text-center">
              <motion.h1
                className="font-black text-8xl tracking-[0.15em] uppercase"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: isWinner ? hex : "#ef4444",
                  textShadow: `0 0 40px ${isWinner ? hex : "#ef4444"}, 0 0 80px ${isWinner ? hex : "#ef4444"}88`,
                  WebkitTextStroke: `2px ${isWinner ? hex : "#ef4444"}88`,
                }}
                animate={{ textShadow: [
                  `0 0 40px ${isWinner ? hex : "#ef4444"}, 0 0 80px ${isWinner ? hex : "#ef4444"}88`,
                  `0 0 60px ${isWinner ? hex : "#ef4444"}, 0 0 120px ${isWinner ? hex : "#ef4444"}cc`,
                  `0 0 40px ${isWinner ? hex : "#ef4444"}, 0 0 80px ${isWinner ? hex : "#ef4444"}88`,
                ] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {isWinner ? "VICTORY" : "DEFEAT"}
              </motion.h1>
            </div>
          </motion.div>
        )}

        {/* Winner name */}
        {(step === "winner" || step === "fade") && (
          <motion.div
            className="absolute bottom-1/4 left-1/2 -translate-x-1/2 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-white/50 text-sm tracking-[0.4em] uppercase mb-2"
               style={{ fontFamily: "var(--font-heading)" }}>
              {isWinner ? "You are" : "Winner"}
            </p>
            <p className="text-2xl font-bold" style={{ color: hex, fontFamily: "var(--font-heading)" }}>
              {winnerName}
            </p>
          </motion.div>
        )}

        {/* Fade out */}
        {step === "fade" && (
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
