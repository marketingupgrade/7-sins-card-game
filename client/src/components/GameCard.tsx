/**
 * GameCard Component - Premium Glassmorphism Card Design
 *
 * Each card is a tiny window into the soul of its sin.
 * Wrath cards bleed crimson. Sloth cards ooze purple.
 * Both look gorgeous while ruining someone's day.
 */

import { motion } from "framer-motion";
import { Flame, Moon, Shield, Heart, Swords, Zap } from "lucide-react";
import { CardDefinition, calculateEffectiveValue } from "@shared/gameTypes";

interface GameCardProps {
  card: CardDefinition;
  currentRound: number;
  isPlayable: boolean;
  isSelected: boolean;
  onClick: () => void;
  /** Player's current energy — cards costing more than this are dimmed */
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
  common: {
    border: "border-border/40",
    badge: "",
    glow: "",
  },
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

export default function GameCard({ card, currentRound, isPlayable, isSelected, onClick, playerEnergy }: GameCardProps) {
  const isWrath = card.sin === "wrath";
  const sinColor = isWrath ? "wrath" : "sloth";
  const SinIcon = isWrath ? Flame : Moon;
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
        ${isWrath ? "card-wrath" : "card-sloth"}
        ${tier.border} ${tier.glow}
        ${isSelected ? (isWrath ? "glow-wrath" : "glow-sloth") : ""}
        border-2
        ${!actuallyPlayable ? "opacity-40 cursor-not-allowed saturate-50" : "cursor-pointer"}
        transition-all duration-300
      `}
    >
      {/* Subtle inner glow */}
      <div
        className={`absolute inset-0 opacity-20 bg-gradient-to-b ${
          isWrath ? "from-wrath/30" : "from-sloth/30"
        } to-transparent pointer-events-none`}
      />

      {/* Card Header - Cost & Sin */}
      <div className="relative px-2.5 pt-2 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <SinIcon className={`w-3 h-3 text-${sinColor}`} />
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
              : isWrath
              ? "border-wrath/40 text-wrath bg-wrath/10"
              : "border-sloth/40 text-sloth bg-sloth/10"
          }`}
          style={{ fontFamily: "var(--font-heading)" }}
          title={`Corruption cost: ${card.cost}`}
        >
          {card.cost}
        </div>
      </div>

      {/* Card Art Area */}
      <div className={`mx-2 h-14 rounded-lg bg-gradient-to-br ${
        isWrath ? "from-wrath/15 via-wrath/5" : "from-sloth/15 via-sloth/5"
      } to-transparent flex items-center justify-center relative overflow-hidden`}>
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border ${
            isWrath ? "border-wrath/30" : "border-sloth/30"
          }`} />
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border ${
            isWrath ? "border-wrath/20" : "border-sloth/20"
          }`} />
        </div>
        <SinIcon className={`w-7 h-7 text-${sinColor}/30 relative z-10`} />
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
              <span className={`font-bold ${color}`}>{effective}</span>
              {effect.target === "self" && (
                <span className="text-muted-foreground/40">(self)</span>
              )}
              {effect.target === "all_enemies" && (
                <span className="text-muted-foreground/40">(all)</span>
              )}
              {effect.duration > 0 && (
                <span className="text-muted-foreground/40">×{effect.duration}r</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Flavor Text */}
      <div className="absolute bottom-1.5 left-2.5 right-2.5">
        <p
          className="text-[6.5px] text-muted-foreground/40 italic leading-tight line-clamp-2"
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
          style={{
            background: isWrath
              ? "radial-gradient(circle at center, oklch(0.6 0.28 25 / 0.15), transparent 70%)"
              : "radial-gradient(circle at center, oklch(0.52 0.18 290 / 0.15), transparent 70%)",
          }}
        />
      )}
    </motion.div>
  );
}
