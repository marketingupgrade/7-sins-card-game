/**
 * MobilePlayerBar — Thin horizontal status bar for mobile game board
 *
 * Inspired by Marvel Snap / LoR compact player strips:
 * - 44px height, horizontal layout
 * - Avatar (28px) + Name (truncated) + HP bar + Energy dots + Shield
 * - Tap to select as target (when targetable)
 * - Affliction icons inline with tap-to-expand
 */
import { motion } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
import { isBot } from "@/lib/botEngine";
import { PlayerState, SinType, MAX_ENERGY, getCompoundTickValue, ActiveEffect } from "@shared/gameTypes";
import MobileAfflictionSheet from "./MobileAfflictionSheet";
import { getSinCssVar } from "@/lib/sinColors";

interface MobilePlayerBarProps {
  player: PlayerState;
  isCurrentTurn: boolean;
  isTargetable: boolean;
  isSelected: boolean;
  onSelect: () => void;
  activeEffects: ActiveEffect[];
  currentRound: number;
  isMe?: boolean;
}


export const MobilePlayerBar = memo(function MobilePlayerBar({
  player,
  isCurrentTurn,
  isTargetable,
  isSelected,
  onSelect,
  activeEffects,
  currentRound,
  isMe,
}: MobilePlayerBarProps) {
  const sinColor = getSinCssVar(player.chosenSin || "wrath");
  const hpPercent = player.maxHp > 0 ? (player.currentHp / player.maxHp) * 100 : 0;
  const playerIsBot = isBot(player.id);

  // HP flash on damage
  const prevHpRef = useRef(player.currentHp);
  const [hpFlash, setHpFlash] = useState(false);
  useEffect(() => {
    if (player.currentHp < prevHpRef.current && player.isAlive) {
      setHpFlash(true);
      setTimeout(() => setHpFlash(false), 400);
    }
    prevHpRef.current = player.currentHp;
  }, [player.currentHp, player.isAlive]);

  // Shield calculation
  const shieldValue = activeEffects
    .filter((e) => e.effectType === "shield_gain")
    .reduce((sum, e) => sum + Math.round(getCompoundTickValue(e.baseValue, e.compoundPattern || "standard", e.currentTick || 0)), 0);

  const displayName = (player.username || "Player") + (playerIsBot ? " ⚙" : "");

  return (
    <motion.div
      data-player-id={player.id}
      whileTap={isTargetable ? { scale: 0.97 } : {}}
      onClick={isTargetable ? onSelect : undefined}
      className={`
        relative flex items-center gap-2 px-2 py-1.5 rounded-lg w-full
        ${!player.isAlive ? "opacity-30" : ""}
        ${isTargetable && player.isAlive ? "cursor-pointer" : ""}
      `}
      style={{
        minHeight: 44,
        background: isMe
          ? "linear-gradient(135deg, oklch(0.14 0.02 70 / 0.9), oklch(0.10 0.01 70 / 0.8))"
          : "linear-gradient(135deg, oklch(0.12 0.01 280 / 0.8), oklch(0.08 0.005 280 / 0.7))",
        border: isSelected
          ? `2px solid ${sinColor}`
          : isTargetable && player.isAlive
            ? `2px solid color-mix(in oklch, ${sinColor} 50%, transparent)`
            : isCurrentTurn
              ? "2px solid oklch(0.75 0.12 70 / 0.4)"
              : isMe
                ? "1px solid oklch(0.75 0.12 70 / 0.25)"
                : "1px solid oklch(0.3 0.02 280 / 0.3)",
        boxShadow: isSelected
          ? `0 0 12px color-mix(in oklch, ${sinColor} 40%, transparent)`
          : hpFlash
            ? `0 0 16px oklch(0.65 0.22 25 / 0.5)`
            : "none",
      }}
    >
      {/* Active turn glow */}
      {isCurrentTurn && player.isAlive && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ boxShadow: "inset 0 0 15px oklch(0.75 0.12 70 / 0.2)" }}
        />
      )}

      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full overflow-hidden border-2 flex-shrink-0"
        style={{ borderColor: sinColor }}
      >
        <motion.img
          src={FACTION_PORTRAITS[player.chosenSin as SinType]}
          alt={player.chosenSin || ""}
          className="w-full h-full object-cover"
          loading="lazy"
          animate={hpFlash ? { x: [-2, 2, -2, 0] } : {}}
          transition={{ duration: 0.3 }}
          style={{
            filter: !player.isAlive
              ? "grayscale(1) brightness(0.3)"
              : hpFlash
                ? "brightness(2) saturate(3)"
                : "none",
          }}
        />
      </div>

      {/* Name + HP bar stack */}
      <div className="flex-1 min-w-0">
        {/* Name row */}
        <div className="flex items-center gap-1">
          <span
            className="text-xs font-bold text-foreground truncate"
            style={{
              fontFamily: "var(--font-heading)",
              maxWidth: isMe ? 80 : 70,
              textDecoration: !player.isAlive ? "line-through" : "none",
            }}
          >
            {displayName}
          </span>
          {isMe && (
            <span
              className="text-[9px] font-bold px-1 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: "oklch(0.75 0.12 70 / 0.15)",
                color: "oklch(0.75 0.12 70 / 0.8)",
                border: "1px solid oklch(0.75 0.12 70 / 0.2)",
              }}
            >
              YOU
            </span>
          )}
          {isTargetable && player.isAlive && (
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-[9px] font-bold uppercase flex-shrink-0"
              style={{ fontFamily: "var(--font-heading)", color: sinColor }}
            >
              TARGET
            </motion.span>
          )}
        </div>

        {/* HP bar — compact but readable */}
        <div className="relative h-3.5 bg-muted/50 rounded-full overflow-hidden mt-0.5">
          <motion.div
            animate={{ width: `${hpPercent}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`absolute inset-y-0 left-0 rounded-full ${
              hpPercent > 60 ? "bg-green-500" : hpPercent > 30 ? "bg-yellow-500" : "bg-red-500"
            }`}
          />
          {shieldValue > 0 && (
            <motion.div
              animate={{ width: `${Math.min((shieldValue / player.maxHp) * 100, 100 - hpPercent)}%` }}
              className="absolute inset-y-0 bg-cyan-400/70 rounded-full"
              style={{ left: `${hpPercent}%` }}
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-[10px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {player.currentHp}/{player.maxHp}
              {shieldValue > 0 && <span className="text-cyan-300 ml-0.5">+{shieldValue}</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Energy dots */}
      <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
        <div className="flex gap-0.5">
          {Array.from({ length: MAX_ENERGY }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: i < player.currentEnergy
                  ? sinColor
                  : "oklch(0.3 0.02 280 / 0.3)",
                boxShadow: i < player.currentEnergy
                  ? `0 0 4px color-mix(in oklch, ${sinColor} 40%, transparent)`
                  : "none",
              }}
            />
          ))}
        </div>
        <span className="text-[8px] text-muted-foreground/60 font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {player.currentEnergy}/{MAX_ENERGY}
        </span>
      </div>

      {/* Affliction icons */}
      <MobileAfflictionSheet
        player={player}
        activeEffects={activeEffects}
        currentRound={currentRound}
      />
    </motion.div>
  );
});

export default MobilePlayerBar;
