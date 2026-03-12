/**
 * MobileCardThumbnail — Compact card thumbnail for mobile hand
 *
 * Shows essential info at a glance:
 * - Card art (small)
 * - Energy cost (prominent corner badge)
 * - Card name (truncated)
 * - Color-coded effect icons with values (not cryptic letters)
 * - Color-coded border by sin
 *
 * Tap once → select, Tap again → opens MobileCardZoom overlay
 */
import { motion } from "framer-motion";
import { memo } from "react";
import type { CardDefinition, CompoundPattern } from "@shared/gameTypes";
import { CARD_ART_URLS } from "@/lib/cardArtUrls";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { getSinCssVar } from "@/lib/sinColors";

const patternInfo: Record<CompoundPattern, { label: string; title: string; desc: string }> = {
  standard: { label: "STD", title: "Standard", desc: "Fibonacci: 1\u00d7, 1\u00d7, 2\u00d7" },
  aggressive: { label: "AGG", title: "Aggressive", desc: "Powers of 2: 1\u00d7, 2\u00d7, 4\u00d7" },
  slowburn: { label: "SLO", title: "Slowburn", desc: "Slow ramp: 0.5\u00d7, 1\u00d7, 2.5\u00d7" },
};

interface MobileCardThumbnailProps {
  card: CardDefinition;
  isPlayable: boolean;
  isSelected: boolean;
  canAfford: boolean;
  onClick: () => void;
}


/** Readable effect labels with color and symbol */
const EFFECT_DISPLAY: Record<string, { symbol: string; color: string; label: string }> = {
  damage: { symbol: "⚔", color: "oklch(0.70 0.22 25)", label: "DMG" },
  damage_all: { symbol: "💥", color: "oklch(0.70 0.22 25)", label: "AOE" },
  self_damage: { symbol: "🩸", color: "oklch(0.55 0.18 25)", label: "SELF" },
  heal: { symbol: "💚", color: "oklch(0.65 0.18 155)", label: "HEAL" },
  shield: { symbol: "🛡", color: "oklch(0.70 0.15 200)", label: "SHLD" },
  debuff: { symbol: "☠", color: "oklch(0.65 0.15 290)", label: "DEBF" },
  energy_drain: { symbol: "⚡", color: "oklch(0.65 0.18 60)", label: "DRNE" },
  energy_gain: { symbol: "✦", color: "oklch(0.70 0.15 85)", label: "NRG+" },
  buff: { symbol: "↑", color: "oklch(0.65 0.12 85)", label: "BUFF" },
};

export const MobileCardThumbnail = memo(function MobileCardThumbnail({
  card,
  isPlayable,
  isSelected,
  canAfford,
  onClick,
}: MobileCardThumbnailProps) {
  const sinColor = getSinCssVar(card.sin);
  const sinIcon = SIN_ARCHETYPE_ICONS[card.sin as keyof typeof SIN_ARCHETYPE_ICONS];
  const artUrl = CARD_ART_URLS[card.id];
  const pInfo = patternInfo[card.compoundPattern] || patternInfo.standard;

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      animate={isSelected ? { y: -8, scale: 1.05 } : { y: 0, scale: 1 }}
      onClick={onClick}
      className={`
        relative rounded-lg overflow-hidden flex-shrink-0 touch-manipulation
        ${!canAfford && !isSelected ? "opacity-60" : ""}
        ${isSelected ? "ring-2 ring-offset-1 ring-offset-background" : ""}
      `}
      style={{
        width: 80,
        height: 120,
        border: isSelected
          ? `2px solid ${sinColor}`
          : `1px solid color-mix(in oklch, ${sinColor} 30%, oklch(0.3 0 0))`,
        background: "linear-gradient(180deg, oklch(0.12 0.02 70 / 0.95), oklch(0.08 0.01 70 / 0.95))",
        boxShadow: isSelected
          ? `0 0 12px color-mix(in oklch, ${sinColor} 40%, transparent), 0 4px 12px oklch(0 0 0 / 0.4)`
          : "0 2px 8px oklch(0 0 0 / 0.3)",
      }}
    >
      {/* Card art — fills top portion */}
      <div className="h-[48px] relative overflow-hidden">
        {artUrl ? (
          <img
            src={artUrl}
            alt={card.name}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "saturate(1.1) contrast(1.05)" }}
            loading="lazy"
          />
        ) : (
          <div
            className="flex items-center justify-center h-full"
            style={{ background: `linear-gradient(135deg, color-mix(in oklch, ${sinColor} 20%, transparent), transparent)` }}
          >
            <img src={sinIcon} alt={card.sin} className="w-6 h-6 object-contain opacity-40" loading="lazy" />
          </div>
        )}
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 20%, oklch(0.08 0.01 70 / 0.85) 100%)" }} />

        {/* Energy cost badge — top-right */}
        <div
          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
          style={{
            fontFamily: "var(--font-heading)",
            background: canAfford
              ? `color-mix(in oklch, ${sinColor} 80%, oklch(0.1 0 0))`
              : "oklch(0.3 0.02 25 / 0.9)",
            color: canAfford ? "oklch(0.95 0 0)" : "oklch(0.65 0.22 25)",
            border: canAfford
              ? `1px solid color-mix(in oklch, ${sinColor} 60%, transparent)`
              : "1px solid oklch(0.65 0.22 25 / 0.4)",
            boxShadow: canAfford ? `0 0 6px color-mix(in oklch, ${sinColor} 30%, transparent)` : "none",
          }}
        >
          {card.cost}
        </div>

        {/* Type badge — top-left with tooltip */}
        <div className="absolute top-0.5 left-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="text-[7px] px-1 py-0.5 rounded font-bold uppercase cursor-help"
                style={{
                  fontFamily: "var(--font-heading)",
                  background: "oklch(0.55 0.18 290 / 0.7)",
                  color: "oklch(0.85 0.1 290)",
                }}
              >
                {pInfo.label}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[180px] bg-[#1a1520] border border-white/10 text-white/90 p-2">
              <p className="font-bold text-[10px] mb-0.5" style={{ fontFamily: "var(--font-heading)", color: "oklch(0.7 0.15 80)" }}>{pInfo.title}</p>
              <p className="text-[9px] text-white/60">{pInfo.desc}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Card name */}
      <div className="px-1 pt-0.5" style={{ height: 24 }}>
        <p
          className="text-[9px] font-bold text-foreground leading-tight line-clamp-2"
          style={{
            fontFamily: "var(--font-heading)",
            textShadow: "0 1px 3px rgba(0,0,0,0.8)",
          }}
        >
          {card.name}
        </p>
      </div>

      {/* Effect summary — color-coded rows with symbols */}
      <div className="px-1 pb-1 flex flex-col gap-px" style={{ height: 44 }}>
        {card.effects.slice(0, 3).map((eff, i) => {
          const display = EFFECT_DISPLAY[eff.type] || { symbol: "•", color: "oklch(0.6 0.1 70)", label: "?" };
          return (
            <div key={i} className="flex items-center gap-0.5">
              <span className="text-[9px]" style={{ lineHeight: 1 }}>{display.symbol}</span>
              <span
                className="text-[9px] font-black"
                style={{ fontFamily: "var(--font-heading)", color: display.color }}
              >
                {eff.baseValue}
              </span>
              <span
                className="text-[7px] font-bold uppercase opacity-70"
                style={{ fontFamily: "var(--font-heading)", color: display.color }}
              >
                {display.label}
              </span>
            </div>
          );
        })}
        {card.effects.length > 3 && (
          <span className="text-[7px] text-muted-foreground/50 font-bold">+{card.effects.length - 3} more</span>
        )}
      </div>

      {/* Selected glow */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ background: `linear-gradient(135deg, color-mix(in oklch, ${sinColor} 30%, transparent), transparent)` }}
        />
      )}
    </motion.button>
  );
});

export default MobileCardThumbnail;
