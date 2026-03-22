/**
 * InGameTooltips — Contextual Hover Tooltips for Game UI
 *
 * Provides informative tooltips when hovering over key game elements:
 * - Energy orbs: explains energy mechanics
 * - HP bar: explains health and shield
 * - Round counter: explains round progression and milestones
 * - Balance sheet button: explains what the ledger shows
 *
 * These are always-available (not just first game) and provide
 * quick reference for any player.
 */

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import type { ReactNode } from "react";

interface GameTooltipProps {
  children: ReactNode;
  content: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

export function GameTooltip({ children, content, side = "top" }: GameTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className="max-w-xs text-xs leading-relaxed"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

export function EnergyTooltip({ children, currentEnergy, maxEnergy }: { children: ReactNode; currentEnergy: number; maxEnergy: number }) {
  return (
    <GameTooltip
      content={
        <div>
          <p className="font-bold mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            Corruption Energy ({currentEnergy}/{maxEnergy})
          </p>
          <p>Spend energy to play cards. Gain +1 each round. Unspent energy carries over.</p>
        </div>
      }
    >
      {children}
    </GameTooltip>
  );
}

export function HpTooltip({ children, currentHp, maxHp, shield }: { children: ReactNode; currentHp: number; maxHp: number; shield: number }) {
  return (
    <GameTooltip
      content={
        <div>
          <p className="font-bold mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            Health: {currentHp}/{maxHp} {shield > 0 && `(+${shield} shield)`}
          </p>
          <p>Reach 0 HP and you're eliminated. Shield absorbs damage before HP and persists between rounds.</p>
        </div>
      }
    >
      {children}
    </GameTooltip>
  );
}

export function RoundTooltip({ children, currentRound, maxRounds }: { children: ReactNode; currentRound: number; maxRounds: number }) {
  return (
    <GameTooltip
      content={
        <div>
          <p className="font-bold mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            Round {currentRound}/{maxRounds}
          </p>
          {currentRound < 16 && <p>At round 16, all afflictions double. At round {maxRounds}, the Final Reckoning triggers.</p>}
          {currentRound >= 16 && currentRound < maxRounds && <p>Afflictions have doubled! At round {maxRounds}, the Final Reckoning triggers — all cards in hand are played.</p>}
          {currentRound >= maxRounds && <p>Final Reckoning! All remaining cards are played at once. Highest HP wins.</p>}
        </div>
      }
    >
      {children}
    </GameTooltip>
  );
}
