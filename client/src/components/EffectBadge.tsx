/**
 * EffectBadge - Slay the Spire-style active effect indicator
 *
 * Shows: effect icon + type label + tick counter (2/3) + multiplier progression
 * Color-coded by effect type. Tooltip on hover with full details.
 * Pulses when effect is about to tick.
 */

import { motion } from "framer-motion";
import { useState, memo } from "react";
import { ICON_URLS } from "@/lib/assetUrls";
import { ActiveEffect, getCompoundTickValue, COMPOUND_MULTIPLIERS, SinType } from "@shared/gameTypes";
import { CARD_MAP } from "@shared/cardData";
import { getEffectIconUrl } from "@/lib/iconUtils";

interface EffectBadgeProps {
  effect: ActiveEffect;
  currentRound: number;
  compact?: boolean;
}

const EFFECT_CONFIG: Record<string, {
  iconUrl: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
}> = {
  damage: {
    iconUrl: ICON_URLS.damage_wrath,
    label: "DMG",
    color: "text-wrath",
    bgColor: "bg-wrath/15",
    borderColor: "border-wrath/30",
    glowColor: "shadow-wrath/20",
  },
  heal: {
    iconUrl: ICON_URLS.heal_generic,
    label: "HEAL",
    color: "text-envy-glow",
    bgColor: "bg-envy-glow/15",
    borderColor: "border-envy-glow/30",
    glowColor: "shadow-envy-glow/20",
  },
  shield: {
    iconUrl: ICON_URLS.shield_generic,
    label: "SHD",
    color: "text-candle",
    bgColor: "bg-candle/15",
    borderColor: "border-candle/30",
    glowColor: "shadow-candle/20",
  },
  buff: {
    iconUrl: ICON_URLS.buff_generic,
    label: "BUFF",
    color: "text-greed-glow",
    bgColor: "bg-greed-glow/15",
    borderColor: "border-greed-glow/30",
    glowColor: "shadow-greed-glow/20",
  },
  debuff: {
    iconUrl: ICON_URLS.debuff_wrath,
    label: "DEBUF",
    color: "text-sloth",
    bgColor: "bg-sloth/15",
    borderColor: "border-sloth/30",
    glowColor: "shadow-sloth/20",
  },
  energy_drain: {
    iconUrl: ICON_URLS.steal_envy,
    label: "DRAIN",
    color: "text-wrath",
    bgColor: "bg-wrath/15",
    borderColor: "border-wrath/30",
    glowColor: "shadow-wrath/20",
  },
  energy_gain: {
    iconUrl: ICON_URLS.energy_generic,
    label: "GAIN",
    color: "text-candle",
    bgColor: "bg-candle/15",
    borderColor: "border-candle/30",
    glowColor: "shadow-candle/20",
  },
};

const EffectBadge = memo(function EffectBadge({ effect, currentRound, compact = false }: EffectBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const cfg = EFFECT_CONFIG[effect.effectType] || EFFECT_CONFIG.damage;

  const card = CARD_MAP[effect.cardId];
  const cardSin = card?.sin as SinType | undefined;
  const spellIconUrl = cardSin ? getEffectIconUrl(effect.effectType, cardSin) : null;
  const isCompounding = effect.isCompounding;
  const currentTick = effect.currentTick ?? 0;
  const totalTicks = isCompounding ? COMPOUND_MULTIPLIERS.length : effect.durationRounds;
  const ticksRemaining = isCompounding
    ? COMPOUND_MULTIPLIERS.length - currentTick
    : Math.max(0, effect.durationRounds - (currentRound - effect.appliedAtRound));

  // Current tick value
  const currentValue = isCompounding
    ? getCompoundTickValue(effect.baseValue, currentTick)
    : effect.baseValue;

  // Multiplier dots for compounding effects
  const multiplierDots = isCompounding
    ? COMPOUND_MULTIPLIERS.map((m, i) => ({
        multiplier: m,
        isActive: i === currentTick,
        isPast: i < currentTick,
        isFuture: i > currentTick,
      }))
    : [];

  if (compact) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={`
          inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9px] font-bold
          ${cfg.bgColor} ${cfg.borderColor} ${cfg.color}
        `}
        style={{ fontFamily: "var(--font-heading)" }}
        title={`${cfg.label} ${currentValue} (${ticksRemaining} rounds left)`}
      >
        <img src={spellIconUrl || cfg.iconUrl} alt={cfg.label} className="w-3.5 h-3.5 object-contain flex-shrink-0" loading="lazy" />
        <span>{currentValue}</span>
        {isCompounding && (
          <span className="opacity-60 text-[7px]">{currentTick + 1}/{totalTicks}</span>
        )}
      </motion.div>
    );
  }

  return (
    <div className="relative" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.08 }}
        className={`
          relative flex items-center gap-1.5 px-2 py-1 rounded-lg border cursor-default
          ${cfg.bgColor} ${cfg.borderColor}
          ${isCompounding ? "shadow-sm " + cfg.glowColor : ""}
          transition-all duration-200
        `}
      >
        {/* Pulse ring for compounding effects */}
        {isCompounding && (
          <motion.div
            className={`absolute inset-0 rounded-lg border ${cfg.borderColor}`}
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Effect Icon */}
        <img src={spellIconUrl || cfg.iconUrl} alt={cfg.label} className="w-4 h-4 object-contain flex-shrink-0" loading="lazy" />

        {/* Value */}
        <span
          className={`text-xs font-black ${cfg.color}`}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {currentValue}
        </span>

        {/* Tick Counter / Duration */}
        {isCompounding ? (
          <div className="flex items-center gap-0.5 ml-0.5">
            {multiplierDots.map((dot, i) => (
              <div
                key={i}
                className={`
                  w-1.5 h-1.5 rounded-full transition-all duration-300
                  ${dot.isActive
                    ? `${cfg.color.replace("text-", "bg-")} scale-125 ring-1 ring-offset-1 ring-offset-transparent ${cfg.borderColor.replace("border-", "ring-")}`
                    : dot.isPast
                    ? "bg-muted-foreground/30"
                    : "bg-muted-foreground/15 border border-muted-foreground/20"
                  }
                `}
                title={`Tick ${i + 1}: ${dot.multiplier}×`}
              />
            ))}
          </div>
        ) : ticksRemaining > 0 && ticksRemaining < 20 ? (
          <span className="text-[8px] text-muted-foreground/60 ml-0.5" style={{ fontFamily: "var(--font-heading)" }}>
            {ticksRemaining}r
          </span>
        ) : null}

        {isCompounding && (
          <span
            className="text-[7px] font-bold text-greed-glow/70 ml-0.5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            C
          </span>
        )}
      </motion.div>

      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 rounded-lg bg-card/95 backdrop-blur-md border border-border/40 shadow-xl"
        >
          {/* Card name */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <img src={spellIconUrl || cfg.iconUrl} alt={cfg.label} className="w-4 h-4 object-contain flex-shrink-0" loading="lazy" />
            <span className="text-xs font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              {card?.name || "Unknown Effect"}
            </span>
            {isCompounding && (
              <span className="text-[7px] px-1 py-0.5 rounded bg-greed-glow/15 text-greed-glow font-bold border border-greed-glow/20">
                COMPOUND
              </span>
            )}
          </div>

          {/* Effect type and value */}
          <p className="text-[10px] text-muted-foreground mb-1.5" style={{ fontFamily: "var(--font-body)" }}>
            {cfg.label} · Base: {effect.baseValue} · Current: {currentValue}
          </p>

          {/* Fibonacci progression for compounding */}
          {isCompounding && (
            <div className="mb-1.5">
              <p className="text-[8px] text-muted-foreground/60 uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                Tick Progression
              </p>
              <div className="flex items-center gap-1">
                {COMPOUND_MULTIPLIERS.map((m, i) => {
                  const tickVal = getCompoundTickValue(effect.baseValue, i);
                  const isActive = i === currentTick;
                  const isPast = i < currentTick;
                  return (
                    <div
                      key={i}
                      className={`
                        flex-1 text-center py-0.5 rounded text-[9px] font-bold border
                        ${isActive
                          ? `${cfg.bgColor} ${cfg.borderColor} ${cfg.color}`
                          : isPast
                          ? "bg-muted/30 border-muted/20 text-muted-foreground/40 line-through"
                          : "bg-muted/10 border-muted/10 text-muted-foreground/50"
                        }
                      `}
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {m}× = {tickVal}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rounds remaining */}
          <div className="flex items-center justify-between text-[9px] text-muted-foreground/60">
            <span>Applied R{effect.appliedAtRound}</span>
            <span>{ticksRemaining} tick{ticksRemaining !== 1 ? "s" : ""} left</span>
          </div>

          {/* Arrow pointer */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-card/95 border-r border-b border-border/40 -mt-1" />
        </motion.div>
      )}
    </div>
  );
});

export default EffectBadge;
