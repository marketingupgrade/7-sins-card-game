/**
 * GameCard Component - Premium Glassmorphism Card Design
 *
 * Each card is a tiny window into the soul of its sin.
 * Wrath bleeds crimson. Sloth oozes purple.
 * Greed gleams gold. Envy seethes emerald.
 */

import { motion } from "framer-motion";
import { Flame, Moon, Shield, Heart, Swords, Zap, Coins, Eye } from "lucide-react";
import { CardDefinition, SinType, calculateEffectiveValue } from "@shared/gameTypes";

interface GameCardProps {
  card: CardDefinition;
  currentRound: number;
  isPlayable: boolean;
  isSelected: boolean;
  onClick: () => void;
  /** Player's current energy: cards costing more than this are dimmed */
  playerEnergy?: number;
}

const effectIcons: Record<string, typeof Flame> = {
  damage: Swords,
  heal: Heart,
  shield: Shield,
  buff: Zap,
  debuff: Moon,
};

const effectColors: Record<string, string> = {
  damage: "text-wrath",
  heal: "text-neon-green",
  shield: "text-neon-cyan",
  buff: "text-neon-yellow",
  debuff: "text-sloth",
};

const tierStyles: Record<string, { border: string; badge: string; glow: string }> = {
  common: { border: "border-border/40", badge: "", glow: "" },
  rare: {
    border: "border-neon-cyan/40",
    badge: "bg-neon-cyan text-background",
    glow: "shadow-[0_0_8px_oklch(0.82_0.16_195/0.2)]",
  },
  epic: {
    border: "border-neon-yellow/50",
    badge: "bg-neon-yellow text-background",
    glow: "shadow-[0_0_12px_oklch(0.88_0.16_90/0.25)]",
  },
};

// Per-sin visual config
const sinConfig: Record<SinType, {
  color: string;
  Icon: typeof Flame;
  cardClass: string;
  glowClass: string;
  selectedGradient: string;
}> = {
  wrath: {
    color: "wrath",
    Icon: Flame,
    cardClass: "card-wrath",
    glowClass: "glow-wrath",
    selectedGradient: "radial-gradient(circle at center, oklch(0.6 0.28 25 / 0.15), transparent 70%)",
  },
  sloth: {
    color: "sloth",
    Icon: Moon,
    cardClass: "card-sloth",
    glowClass: "glow-sloth",
    selectedGradient: "radial-gradient(circle at center, oklch(0.52 0.18 290 / 0.15), transparent 70%)",
  },
  greed: {
    color: "greed",
    Icon: Coins,
    cardClass: "card-greed",
    glowClass: "glow-greed",
    selectedGradient: "radial-gradient(circle at center, oklch(0.75 0.18 85 / 0.15), transparent 70%)",
  },
  envy: {
    color: "envy",
    Icon: Eye,
    cardClass: "card-envy",
    glowClass: "glow-envy",
    selectedGradient: "radial-gradient(circle at center, oklch(0.6 0.2 155 / 0.15), transparent 70%)",
  },
};

export default function GameCard({ card, currentRound, isPlayable, isSelected, onClick, playerEnergy }: GameCardProps) {
  const cfg = sinConfig[card.sin] || sinConfig.wrath;
  const SinIcon = cfg.Icon;
  const tier = tierStyles[card.tier] || tierStyles.common;
  const canAfford = playerEnergy === undefined || card.cost <= playerEnergy;
  const actuallyPlayable = isPlayable && canAfford;

  return (
    <motion.div
      layout
      whileHover={actuallyPlayable ? { y: -24, scale: 1.06 } : {}}
      whileTap={actuallyPlayable ? { scale: 0.96 } : {}}
      animate={isSelected ? { y: -32, scale: 1.1 } : { y: 0, scale: 1 }}
      onClick={actuallyPlayable ? onClick : undefined}
      className={`
        relative w-[140px] h-[210px] rounded-xl overflow-hidden select-none
        ${cfg.cardClass}
        ${tier.border} ${tier.glow}
        ${isSelected ? cfg.glowClass : ""}
        border-2
        ${!actuallyPlayable ? "opacity-40 cursor-not-allowed saturate-50" : "cursor-pointer"}
        transition-all duration-300
      `}
    >
      {/* Subtle inner glow */}
      <div
        className={`absolute inset-0 opacity-20 bg-gradient-to-b from-${cfg.color}/30 to-transparent pointer-events-none`}
      />

      {/* Card Header: Cost & Sin */}
      <div className="relative px-2.5 pt-2 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <SinIcon className={`w-3 h-3 text-${cfg.color}`} />
          {card.tier !== "common" && (
            <span
              className={`text-[7px] px-1 py-0.5 rounded-sm font-bold uppercase ${tier.badge}`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {card.tier}
            </span>
          )}
        </div>
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border ${
            !canAfford
              ? "border-destructive/60 text-destructive bg-destructive/10"
              : `border-${cfg.color}/40 text-${cfg.color} bg-${cfg.color}/10`
          }`}
          style={{ fontFamily: "var(--font-heading)" }}
          title={`Corruption cost: ${card.cost}`}
        >
          {card.cost}
        </div>
      </div>

      {/* Card Art Area */}
      <div className={`mx-2 h-14 rounded-lg bg-gradient-to-br from-${cfg.color}/15 via-${cfg.color}/5 to-transparent flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-${cfg.color}/30`} />
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-${cfg.color}/20`} />
        </div>
        <SinIcon className={`w-7 h-7 text-${cfg.color}/30 relative z-10`} />
      </div>

      {/* Card Name */}
      <div className="px-2.5 py-1.5">
        <h4
          className="text-[11px] font-bold text-foreground leading-tight truncate"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {card.name}
        </h4>
      </div>

      {/* Effects List */}
      <div className="px-2.5 space-y-0.5">
        {card.effects.map((effect, i) => {
          const EffectIcon = effectIcons[effect.type] || Zap;
          const effective = calculateEffectiveValue(effect.baseValue, currentRound);
          const color = effectColors[effect.type] || "text-muted-foreground";
          return (
            <div key={i} className="flex items-center gap-1 text-[8px]">
              <EffectIcon className={`w-2.5 h-2.5 ${color} flex-shrink-0`} />
              <span className="text-muted-foreground/70 capitalize">{effect.type}</span>
              <span className={`font-bold ${color}`} title={`Base ${effect.baseValue} × Round ${currentRound}`}>{effective}</span>
              {effect.target === "self" && (
                <span className="text-muted-foreground/60">(self)</span>
              )}
              {effect.target === "all_enemies" && (
                <span className="text-muted-foreground/60">(all)</span>
              )}
              {effect.duration > 0 && (
                <span className="text-muted-foreground/60">{"\u00D7"}{effect.duration}r</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Catch-up indicator */}
      {card.catchup && (
        <div className="px-2.5 mt-0.5">
          <div className="flex items-center gap-1 text-[7px] px-1.5 py-0.5 rounded bg-neon-yellow/10 border border-neon-yellow/20">
            <Zap className="w-2 h-2 text-neon-yellow flex-shrink-0" />
            <span className="text-neon-yellow/80 font-bold uppercase" style={{ fontFamily: "var(--font-heading)" }}>
              Catch-up
            </span>
            <span className="text-muted-foreground/60">
              {card.catchup.type === "bonus_damage" ? "+DMG" : card.catchup.type === "bonus_heal" ? "+HEAL" : "+DEBUFF"}
            </span>
          </div>
        </div>
      )}

      {/* Flavor Text */}
      <div className="absolute bottom-1.5 left-2.5 right-2.5">
        <p
          className="text-[7px] text-muted-foreground/60 italic leading-tight line-clamp-2"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {card.flavorText}
        </p>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ background: cfg.selectedGradient }}
        />
      )}
    </motion.div>
  );
}
