/**
 * EffectBadge - Slay the Spire-style active effect indicator (v4)
 *
 * Shows: effect icon + type label + tick counter + compound pattern progression
 * Color-coded by effect type. Tooltip on hover with full details.
 * All effects are compound in v4.
 */

import { motion } from "framer-motion";
import { useState, memo } from "react";
import { ICON_URLS } from "@/lib/assetUrls";
import { ActiveEffect, CompoundPattern, getCompoundTickValue, SinType } from "@shared/gameTypes";
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
    label: "Hurt",
    color: "text-wrath",
    bgColor: "bg-wrath/15",
    borderColor: "border-wrath/30",
    glowColor: "shadow-wrath/20",
  },
  self_damage: {
    iconUrl: ICON_URLS.damage_wrath,
    label: "Recoil",
    color: "text-wrath",
    bgColor: "bg-wrath/15",
    borderColor: "border-wrath/30",
    glowColor: "shadow-wrath/20",
  },
  heal_gain: {
    iconUrl: ICON_URLS.heal_generic,
    label: "Mend",
    color: "text-envy-glow",
    bgColor: "bg-envy-glow/15",
    borderColor: "border-envy-glow/30",
    glowColor: "shadow-envy-glow/20",
  },
  heal_steal: {
    iconUrl: ICON_URLS.heal_generic,
    label: "Siphon",
    color: "text-lust",
    bgColor: "bg-lust/15",
    borderColor: "border-lust/30",
    glowColor: "shadow-lust/20",
  },
  shield_gain: {
    iconUrl: ICON_URLS.shield_generic,
    label: "Ward",
    color: "text-candle",
    bgColor: "bg-candle/15",
    borderColor: "border-candle/30",
    glowColor: "shadow-candle/20",
  },
  shield_steal: {
    iconUrl: ICON_URLS.shield_generic,
    label: "Crack",
    color: "text-candle",
    bgColor: "bg-candle/15",
    borderColor: "border-candle/30",
    glowColor: "shadow-candle/20",
  },
  energy_gain: {
    iconUrl: ICON_URLS.energy_generic,
    label: "Juice",
    color: "text-candle",
    bgColor: "bg-candle/15",
    borderColor: "border-candle/30",
    glowColor: "shadow-candle/20",
  },
  energy_steal: {
    iconUrl: ICON_URLS.steal_envy,
    label: "Drain",
    color: "text-greed-glow",
    bgColor: "bg-greed-glow/15",
    borderColor: "border-greed-glow/30",
    glowColor: "shadow-greed-glow/20",
  },
  heal_block: {
    iconUrl: ICON_URLS.debuff_wrath,
    label: "Cursed",
    color: "text-sloth",
    bgColor: "bg-sloth/15",
    borderColor: "border-sloth/30",
    glowColor: "shadow-sloth/20",
  },
  shield_block: {
    iconUrl: ICON_URLS.debuff_wrath,
    label: "Shatter",
    color: "text-sloth",
    bgColor: "bg-sloth/15",
    borderColor: "border-sloth/30",
    glowColor: "shadow-sloth/20",
  },
  energy_block: {
    iconUrl: ICON_URLS.debuff_wrath,
    label: "Exhaust",
    color: "text-sloth",
    bgColor: "bg-sloth/15",
    borderColor: "border-sloth/30",
    glowColor: "shadow-sloth/20",
  },
  affliction_amplify: {
    iconUrl: ICON_URLS.steal_envy,
    label: "Amp",
    color: "text-envy",
    bgColor: "bg-envy/15",
    borderColor: "border-envy/30",
    glowColor: "shadow-envy/20",
  },
  affliction_transfer: {
    iconUrl: ICON_URLS.steal_envy,
    label: "Redirect",
    color: "text-pride",
    bgColor: "bg-pride/15",
    borderColor: "border-pride/30",
    glowColor: "shadow-pride/20",
  },
};

const PATTERN_LABELS: Record<CompoundPattern, string> = {
  standard: "◆",
  aggressive: "🔥",
  slowburn: "⌛",
};

const PATTERN_NAMES: Record<CompoundPattern, string> = {
  standard: "Steady",
  aggressive: "Volatile",
  slowburn: "Patient",
};

const PATTERN_DESCS: Record<CompoundPattern, string> = {
  standard: "Grows at a steady pace. Nothing fancy.",
  aggressive: "Starts tame, then goes nuclear.",
  slowburn: "Barely a scratch at first. Then it kicks in.",
};

const EffectBadge = memo(function EffectBadge({ effect, currentRound, compact = false }: EffectBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const cfg = EFFECT_CONFIG[effect.effectType] || EFFECT_CONFIG.damage;

  const card = CARD_MAP[effect.cardId];
  const cardSin = card?.sin as SinType | undefined;
  const spellIconUrl = cardSin ? getEffectIconUrl(effect.effectType, cardSin) : null;
  const pattern: CompoundPattern = effect.compoundPattern || "standard";
  const currentTick = effect.currentTick ?? 0;
  const totalTicks = effect.durationRounds;
  const ticksRemaining = Math.max(0, totalTicks - currentTick);

  // Current tick value
  const currentValue = Math.round(getCompoundTickValue(effect.baseValue, pattern, currentTick));

  // Tick progression dots
  const tickDots = Array.from({ length: totalTicks }, (_, i) => ({
    tick: i,
    isActive: i === currentTick,
    isPast: i < currentTick,
    isFuture: i > currentTick,
    value: Math.round(getCompoundTickValue(effect.baseValue, pattern, i)),
  }));

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
        title={`${cfg.label} ${currentValue} (${ticksRemaining} rounds left) • ${PATTERN_NAMES[pattern]}`}
      >
        <img src={spellIconUrl || cfg.iconUrl} alt={cfg.label} className="w-3.5 h-3.5 object-contain flex-shrink-0" loading="lazy" />
        <span>{currentValue}</span>
        <span className="opacity-60 text-[7px]">{currentTick + 1}/{totalTicks}</span>
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
          shadow-sm ${cfg.glowColor}
          transition-all duration-200
        `}
      >
        {/* Pulse ring */}
        <motion.div
          className={`absolute inset-0 rounded-lg border ${cfg.borderColor}`}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Effect Icon */}
        <img src={spellIconUrl || cfg.iconUrl} alt={cfg.label} className="w-4 h-4 object-contain flex-shrink-0" loading="lazy" />

        {/* Value */}
        <span
          className={`text-xs font-black ${cfg.color}`}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {currentValue}
        </span>

        {/* Tick Counter */}
        <div className="flex items-center gap-0.5 ml-0.5">
          {tickDots.map((dot, i) => (
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
              title={`Tick ${i + 1}: ${dot.value}`}
            />
          ))}
        </div>

        {/* Pattern indicator */}
        <span
          className="text-[7px] font-bold text-greed-glow/70 ml-0.5"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {PATTERN_LABELS[pattern]}
        </span>
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
            <span className="text-[7px] px-1 py-0.5 rounded bg-greed-glow/15 text-greed-glow font-bold border border-greed-glow/20">
              {PATTERN_NAMES[pattern]}
            </span>
          </div>

          {/* Effect type and value */}
          <p className="text-[10px] text-muted-foreground mb-1.5" style={{ fontFamily: "var(--font-body)" }}>
            {cfg.label} · Starts at {effect.baseValue}, now hitting for {currentValue}
          </p>

          {/* Tick progression */}
          <div className="mb-1.5">
            <p className="text-[8px] text-muted-foreground/60 uppercase tracking-wider mb-0.5" style={{ fontFamily: "var(--font-heading)" }}>
              How it scales ({PATTERN_NAMES[pattern]})
            </p>
            <p className="text-[8px] text-greed-glow/50 mb-1" style={{ fontFamily: "var(--font-body)" }}>
              {PATTERN_DESCS[pattern]}
            </p>
            <div className="flex items-center gap-1">
              {tickDots.map((dot, i) => (
                <div
                  key={i}
                  className={`
                    flex-1 text-center py-0.5 rounded text-[9px] font-bold border
                    ${dot.isActive
                      ? `${cfg.bgColor} ${cfg.borderColor} ${cfg.color}`
                      : dot.isPast
                      ? "bg-muted/30 border-muted/20 text-muted-foreground/40 line-through"
                      : "bg-muted/10 border-muted/10 text-muted-foreground/50"
                    }
                  `}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {dot.value}
                </div>
              ))}
            </div>
          </div>

          {/* Rounds remaining */}
          <div className="flex items-center justify-between text-[9px] text-muted-foreground/60">
            <span>Cast round {effect.appliedAtRound}</span>
            <span>{ticksRemaining} round{ticksRemaining !== 1 ? "s" : ""} left</span>
          </div>

          {/* Arrow pointer */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-card/95 border-r border-b border-border/40 -mt-1" />
        </motion.div>
      )}
    </div>
  );
});

export default EffectBadge;
