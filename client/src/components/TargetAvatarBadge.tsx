/**
 * TargetAvatarBadge — circular avatar overlay on selected cards
 * showing which player(s) the card is targeting.
 *
 * States:
 * - Target assigned (single): Shows target player's faction portrait + truncated name
 * - Self-targeting: Shows player's own portrait with "SELF" label
 * - AoE: Shows stacked portraits of ALL opponents with "ALL" label
 * - Duo: Shows stacked portraits of 2 targets with "×2" label
 * - Mixed (self + aoe): Shows self portrait + stacked enemy portraits
 * - Needs target: Pulsing dashed crosshair "?" prompting selection
 *
 * Used on both desktop cards and mobile thumbnails.
 */

import { memo } from "react";
import { motion } from "framer-motion";
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
import { getSinCssVar } from "@/lib/sinColors";
import type { SinType } from "@shared/gameTypes";

/** A single target entry for multi-target display */
export interface TargetEntry {
  sin: string;
  name: string;
}

interface TargetAvatarBadgeProps {
  /** Target player's chosen sin (for portrait lookup) — single target mode */
  targetSin?: string;
  /** Target player's display name — single target mode */
  targetName?: string;
  /** Whether this card targets self */
  isSelf?: boolean;
  /** Player's own sin (used for self-target portrait) */
  ownSin?: string;
  /** Whether the card still needs a target assigned */
  needsTarget?: boolean;
  /** Size variant: sm for mobile thumbnails, md for desktop cards */
  size?: "sm" | "md";
  /** Whether this is an AoE card (hits all opponents) */
  isAoe?: boolean;
  /** Whether this is a duo card (hits 2 targets) */
  isDuo?: boolean;
  /** Array of all target entries for multi-target display (AoE/duo) */
  targets?: TargetEntry[];
}

/* ─── Mini portrait circle (reused in stacked layouts) ─── */
function MiniPortrait({
  sin,
  name,
  dims,
  borderColor,
  index = 0,
  stacked = false,
}: {
  sin: string;
  name?: string;
  dims: string;
  borderColor: string;
  index?: number;
  stacked?: boolean;
}) {
  const portrait = FACTION_PORTRAITS[sin as SinType];
  return (
    <motion.div
      className={`${dims} rounded-full overflow-hidden border-2 shadow-lg flex-shrink-0`}
      style={{
        borderColor,
        boxShadow: `0 0 8px ${borderColor}50`,
        marginLeft: stacked && index > 0 ? "-8px" : "0",
        zIndex: 10 - index,
        position: "relative",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 25,
        delay: index * 0.06,
      }}
    >
      {portrait ? (
        <img src={portrait} alt={name || sin} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ background: borderColor }}>
          <span className="text-white text-[8px] font-black">{sin.slice(0, 2).toUpperCase()}</span>
        </div>
      )}
    </motion.div>
  );
}

const TargetAvatarBadge = memo(function TargetAvatarBadge({
  targetSin,
  targetName,
  isSelf,
  ownSin,
  needsTarget,
  size = "md",
  isAoe,
  isDuo,
  targets,
}: TargetAvatarBadgeProps) {
  const dims = size === "sm" ? "w-6 h-6" : "w-8 h-8";
  const labelSize = size === "sm" ? "text-[6px]" : "text-[8px]";
  const iconSize = size === "sm" ? "text-[10px]" : "text-xs";

  // Needs target — pulsing crosshair
  if (needsTarget) {
    return (
      <motion.div
        className={`${size === "sm" ? "w-7 h-7" : "w-9 h-9"} rounded-full flex items-center justify-center border-2 border-dashed`}
        style={{
          background: "oklch(0.15 0.02 280 / 0.9)",
          borderColor: "oklch(0.80 0.15 85 / 0.6)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          borderColor: [
            "oklch(0.80 0.15 85 / 0.4)",
            "oklch(0.80 0.15 85 / 0.8)",
            "oklch(0.80 0.15 85 / 0.4)",
          ],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className={`${iconSize} font-black`} style={{ color: "oklch(0.80 0.15 85)" }}>
          ?
        </span>
      </motion.div>
    );
  }

  // ─── AoE / Duo with targets array ──────────────────────────────
  if ((isAoe || isDuo) && targets && targets.length > 0) {
    const label = isAoe ? "ALL" : `×${targets.length}`;
    const labelColor = isAoe ? "oklch(0.75 0.20 25)" : "oklch(0.75 0.15 280)";
    const hasSelf = isSelf && ownSin;

    return (
      <div className="flex flex-col items-center gap-0.5">
        {/* Self portrait row (if mixed self+aoe) */}
        {hasSelf && (
          <div className="flex items-center gap-0.5 mb-0.5">
            <MiniPortrait
              sin={ownSin!}
              name="You"
              dims={size === "sm" ? "w-5 h-5" : "w-6 h-6"}
              borderColor={getSinCssVar(ownSin!)}
            />
            <span
              className={`${size === "sm" ? "text-[5px]" : "text-[7px]"} font-black uppercase`}
              style={{
                color: getSinCssVar(ownSin!),
                fontFamily: "var(--font-heading)",
              }}
            >
              SELF
            </span>
          </div>
        )}

        {/* Stacked target portraits */}
        <div className="flex items-center">
          {targets.slice(0, 4).map((t, i) => (
            <MiniPortrait
              key={`${t.sin}-${t.name}-${i}`}
              sin={t.sin}
              name={t.name}
              dims={dims}
              borderColor={getSinCssVar(t.sin)}
              index={i}
              stacked
            />
          ))}
        </div>

        {/* Label: ALL or ×2 */}
        <span
          className={`${labelSize} font-black uppercase tracking-wider leading-none`}
          style={{
            color: labelColor,
            fontFamily: "var(--font-heading)",
            textShadow: `0 0 6px ${labelColor}60`,
          }}
        >
          {label}
        </span>
      </div>
    );
  }

  // ─── Self-only targeting ───────────────────────────────────────
  if (isSelf && ownSin) {
    const sinColor = getSinCssVar(ownSin);
    const portrait = FACTION_PORTRAITS[ownSin as SinType];
    return (
      <div className="flex flex-col items-center gap-0.5">
        <div
          className={`${size === "sm" ? "w-7 h-7" : "w-9 h-9"} rounded-full overflow-hidden border-2 shadow-lg relative`}
          style={{
            borderColor: sinColor,
            boxShadow: `0 0 8px ${sinColor}40`,
          }}
        >
          {portrait ? (
            <img src={portrait} alt="You" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: sinColor }}>
              <span className="text-white text-[10px] font-black">YOU</span>
            </div>
          )}
        </div>
        <span
          className={`${labelSize} font-black uppercase tracking-wider leading-none`}
          style={{
            color: sinColor,
            fontFamily: "var(--font-heading)",
            textShadow: `0 0 6px ${sinColor}60`,
          }}
        >
          SELF
        </span>
      </div>
    );
  }

  // ─── Single target assigned ────────────────────────────────────
  if (targetSin) {
    const sinColor = getSinCssVar(targetSin);
    const portrait = FACTION_PORTRAITS[targetSin as SinType];
    const displayName = targetName
      ? targetName.length > 6
        ? targetName.slice(0, 5) + "\u2026"
        : targetName
      : targetSin;

    return (
      <div className="flex flex-col items-center gap-0.5">
        <motion.div
          className={`${size === "sm" ? "w-7 h-7" : "w-9 h-9"} rounded-full overflow-hidden border-2 shadow-lg`}
          style={{
            borderColor: sinColor,
            boxShadow: `0 0 10px ${sinColor}50`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        >
          {portrait ? (
            <img src={portrait} alt={targetName || targetSin} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: sinColor }}>
              <span className="text-white text-[10px] font-black">{targetSin.slice(0, 2).toUpperCase()}</span>
            </div>
          )}
        </motion.div>
        <span
          className={`${labelSize} font-black uppercase tracking-wider leading-none max-w-[48px] truncate text-center`}
          style={{
            color: sinColor,
            fontFamily: "var(--font-heading)",
            textShadow: `0 0 6px ${sinColor}60`,
          }}
        >
          {displayName}
        </span>
      </div>
    );
  }

  return null;
});
export default TargetAvatarBadge;
