/**
 * TurnPhaseTimeline — Visual Phase Progression Bar
 *
 * Audit fix #5: Shows a clear visual indicator of the current game phase.
 * Three phases: Selection → Resolution → Next Round
 *
 * Includes:
 * - Active phase highlighting with animated indicator
 * - Round counter
 * - Phase-specific action hint text
 */

import { memo } from "react";
import { motion } from "framer-motion";
import { TurnPhase, MAX_ROUNDS } from "@shared/gameTypes";

interface TurnPhaseTimelineProps {
  currentPhase: TurnPhase;
  currentRound: number;
  hasLockedIn?: boolean;
  playersLockedIn?: number;
  totalPlayers?: number;
}

const PHASES: { key: TurnPhase; label: string; icon: string }[] = [
  { key: "selection", label: "SELECT", icon: "🎴" },
  { key: "resolution", label: "RESOLVE", icon: "⚔" },
  { key: "round_end", label: "NEXT", icon: "↻" },
];

const PHASE_HINTS: Record<TurnPhase, (props: TurnPhaseTimelineProps) => string> = {
  selection: (p) =>
    p.hasLockedIn
      ? `Locked in — waiting for others (${p.playersLockedIn}/${p.totalPlayers})`
      : "Pick your cards and lock in",
  resolution: () => "Cards are resolving...",
  round_end: () => "Effects ticking, preparing next round...",
};

const TurnPhaseTimeline = memo(function TurnPhaseTimeline(props: TurnPhaseTimelineProps) {
  const { currentPhase, currentRound } = props;
  const phaseIndex = PHASES.findIndex((p) => p.key === currentPhase);
  const hint = PHASE_HINTS[currentPhase](props);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Round counter */}
      <div className="flex items-center justify-center gap-2 mb-1.5">
        <span
          className="text-[10px] tracking-[0.3em] uppercase"
          style={{ fontFamily: "var(--font-heading)", color: "oklch(0.5 0.05 80 / 0.7)" }}
        >
          Round
        </span>
        <span
          className="text-sm font-black"
          style={{ fontFamily: "var(--font-heading)", color: "oklch(0.8 0.1 80)" }}
        >
          {currentRound}
        </span>
        <span
          className="text-[10px]"
          style={{ fontFamily: "var(--font-body)", color: "oklch(0.5 0 0 / 0.4)" }}
        >
          / {MAX_ROUNDS}
        </span>
      </div>

      {/* Phase progression bar */}
      <div className="flex items-center gap-1 px-2">
        {PHASES.map((phase, i) => {
          const isActive = phase.key === currentPhase;
          const isPast = i < phaseIndex;

          return (
            <div key={phase.key} className="flex items-center flex-1">
              {/* Phase node */}
              <div className="flex flex-col items-center flex-1">
                <motion.div
                  animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={isActive ? { duration: 1.5, repeat: Infinity } : {}}
                  className="relative flex items-center justify-center w-7 h-7 rounded-full border"
                  style={{
                    backgroundColor: isActive
                      ? "oklch(0.25 0.1 80 / 0.6)"
                      : isPast
                      ? "oklch(0.2 0.05 80 / 0.3)"
                      : "oklch(0.15 0.02 0 / 0.3)",
                    borderColor: isActive
                      ? "oklch(0.6 0.12 80 / 0.5)"
                      : isPast
                      ? "oklch(0.4 0.05 80 / 0.2)"
                      : "oklch(0.3 0 0 / 0.15)",
                  }}
                >
                  <span className="text-[10px]">{phase.icon}</span>
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{ opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        border: "1px solid oklch(0.7 0.12 80 / 0.4)",
                      }}
                    />
                  )}
                </motion.div>
                <span
                  className="text-[8px] mt-0.5 tracking-wider"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: isActive
                      ? "oklch(0.75 0.1 80)"
                      : isPast
                      ? "oklch(0.5 0.05 80 / 0.5)"
                      : "oklch(0.4 0 0 / 0.3)",
                  }}
                >
                  {phase.label}
                </span>
              </div>

              {/* Connector line (not after last) */}
              {i < PHASES.length - 1 && (
                <div
                  className="h-px flex-1 mx-1"
                  style={{
                    backgroundColor:
                      i < phaseIndex
                        ? "oklch(0.5 0.08 80 / 0.3)"
                        : "oklch(0.3 0 0 / 0.15)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Phase hint text */}
      <motion.p
        key={hint}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mt-1.5 text-[10px]"
        style={{
          fontFamily: "var(--font-body)",
          color: "oklch(0.6 0.05 80 / 0.6)",
        }}
      >
        {hint}
      </motion.p>
    </div>
  );
});

export default TurnPhaseTimeline;
