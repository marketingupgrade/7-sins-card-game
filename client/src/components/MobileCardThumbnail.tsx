/**
 * MobileCardThumbnail — Compact card thumbnail for mobile hand
 *
 * Shows just the essential info at a glance:
 * - Card art (small)
 * - Energy cost (prominent corner badge)
 * - Card name (truncated)
 * - Color-coded border by sin
 *
 * Tap → opens MobileCardZoom overlay for full details
 */
import { motion } from "framer-motion";
import { memo } from "react";
import type { CardDefinition, SinType } from "@shared/gameTypes";
import { CARD_ART_URLS } from "@/lib/cardArtUrls";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";

interface MobileCardThumbnailProps {
  card: CardDefinition;
  isPlayable: boolean;
  isSelected: boolean;
  canAfford: boolean;
  onClick: () => void;
}

const sinColorMap: Record<string, string> = {
  wrath: "var(--color-wrath)",
  sloth: "var(--color-sloth)",
  greed: "var(--color-greed)",
  envy: "var(--color-envy)",
  pride: "var(--color-pride)",
  lust: "var(--color-lust)",
  gluttony: "var(--color-gluttony)",
};

export const MobileCardThumbnail = memo(function MobileCardThumbnail({
  card,
  isPlayable,
  isSelected,
  canAfford,
  onClick,
}: MobileCardThumbnailProps) {
  const sinColor = sinColorMap[card.sin] || sinColorMap.wrath;
  const sinIcon = SIN_ARCHETYPE_ICONS[card.sin as keyof typeof SIN_ARCHETYPE_ICONS];
  const artUrl = CARD_ART_URLS[card.id];
  const isCompounding = card.cardType === "compounding";

  return (
    <motion.button
      whileTap={isPlayable ? { scale: 0.92 } : {}}
      animate={isSelected ? { y: -8, scale: 1.05 } : { y: 0, scale: 1 }}
      onClick={isPlayable ? onClick : undefined}
      className={`
        relative rounded-lg overflow-hidden flex-shrink-0 touch-manipulation
        ${!isPlayable ? "opacity-40" : ""}
        ${isSelected ? "ring-2 ring-offset-1 ring-offset-background" : ""}
      `}
      style={{
        width: 80,
        height: 110,
        border: isSelected
          ? `2px solid ${sinColor}`
          : `1px solid color-mix(in oklch, ${sinColor} 30%, oklch(0.3 0 0))`,
        background: "linear-gradient(180deg, oklch(0.12 0.02 70 / 0.95), oklch(0.08 0.01 70 / 0.95))",
        boxShadow: isSelected
          ? `0 0 12px color-mix(in oklch, ${sinColor} 40%, transparent), 0 4px 12px oklch(0 0 0 / 0.4)`
          : "0 2px 8px oklch(0 0 0 / 0.3)",
        // ring color handled via Tailwind class above
      }}
    >
      {/* Card art — fills top portion */}
      <div className="h-[60px] relative overflow-hidden">
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
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, oklch(0.08 0.01 70 / 0.8) 100%)" }} />

        {/* Energy cost badge — top-right */}
        <div
          className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
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

        {/* Type badge — top-left */}
        <div className="absolute top-1 left-1">
          <span
            className="text-[7px] px-1 py-0.5 rounded font-bold uppercase"
            style={{
              fontFamily: "var(--font-heading)",
              background: isCompounding ? "oklch(0.55 0.18 290 / 0.7)" : "oklch(0.4 0.1 70 / 0.7)",
              color: isCompounding ? "oklch(0.85 0.1 290)" : "oklch(0.8 0.05 70)",
            }}
          >
            {isCompounding ? "3R" : "F"}
          </span>
        </div>
      </div>

      {/* Card name — truncated */}
      <div className="px-1.5 py-1 flex flex-col justify-center" style={{ height: 50 }}>
        <p
          className="text-[10px] font-bold text-foreground leading-tight line-clamp-2"
          style={{
            fontFamily: "var(--font-heading)",
            textShadow: "0 1px 3px rgba(0,0,0,0.8)",
          }}
        >
          {card.name}
        </p>
        {/* Quick effect summary */}
        <div className="flex items-center gap-0.5 mt-0.5">
          {card.effects.slice(0, 2).map((eff, i) => (
            <span
              key={i}
              className="text-[8px] font-bold uppercase"
              style={{
                color: eff.type === "damage" || eff.type === "damage_all"
                  ? "oklch(0.65 0.22 25)"
                  : eff.type === "heal"
                    ? "oklch(0.60 0.18 155)"
                    : eff.type === "shield"
                      ? "oklch(0.65 0.15 200)"
                      : "oklch(0.6 0.1 70)",
              }}
            >
              {eff.type === "damage" ? `${eff.baseValue}D` :
               eff.type === "damage_all" ? `${eff.baseValue}A` :
               eff.type === "heal" ? `${eff.baseValue}H` :
               eff.type === "shield" ? `${eff.baseValue}S` :
               eff.type === "debuff" ? `${eff.baseValue}X` :
               eff.type === "energy_drain" ? `${eff.baseValue}E` :
               `${eff.baseValue}`}
            </span>
          ))}
        </div>
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
