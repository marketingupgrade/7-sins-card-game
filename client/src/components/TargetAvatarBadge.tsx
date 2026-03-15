/**
 * TargetAvatarBadge — circular avatar overlay on selected cards
 * showing which player the card is targeting.
 *
 * States:
 * - Target assigned: Shows target player's faction portrait + truncated name
 * - Self-targeting: Shows player's own portrait with "SELF" label
 * - Needs target: Pulsing dashed crosshair "?" prompting selection
 *
 * Used on both desktop cards and mobile thumbnails.
 */

import { memo } from "react";
import { motion } from "framer-motion";
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
import { getSinCssVar } from "@/lib/sinColors";
import type { SinType } from "@shared/gameTypes";

interface TargetAvatarBadgeProps {
  /** Target player's chosen sin (for portrait lookup) */
  targetSin?: string;
  /** Target player's display name */
  targetName?: string;
  /** Whether this card targets self */
  isSelf?: boolean;
  /** Player's own sin (used for self-target portrait) */
  ownSin?: string;
  /** Whether the card still needs a target assigned */
  needsTarget?: boolean;
  /** Size variant: sm for mobile thumbnails, md for desktop cards */
  size?: "sm" | "md";
}

const TargetAvatarBadge = memo(function TargetAvatarBadge({
  targetSin,
  targetName,
  isSelf,
  ownSin,
  needsTarget,
  size = "md",
}: TargetAvatarBadgeProps) {
  const dims = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const labelSize = size === "sm" ? "text-[7px]" : "text-[9px]";
  const iconSize = size === "sm" ? "text-[10px]" : "text-xs";

  // Needs target — pulsing crosshair
  if (needsTarget) {
    return (
      <motion.div
        className={`${dims} rounded-full flex items-center justify-center border-2 border-dashed`}
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

  // Self-targeting
  if (isSelf && ownSin) {
    const sinColor = getSinCssVar(ownSin);
    const portrait = FACTION_PORTRAITS[ownSin as SinType];
    return (
      <div className="flex flex-col items-center gap-0.5">
        <div
          className={`${dims} rounded-full overflow-hidden border-2 shadow-lg relative`}
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

  // Target assigned — show target's portrait + name
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
          className={`${dims} rounded-full overflow-hidden border-2 shadow-lg`}
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
