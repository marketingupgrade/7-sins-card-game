/**
 * GameCard Component
 *
 * Renders a single card with sin-themed styling, hover effects,
 * and Motion animations. Shows card name, effects, cost, and flavor text.
 */

import { motion } from "framer-motion";
import { Flame, Moon, Shield, Heart, Swords, Zap } from "lucide-react";
import { CardDefinition, calculateEffectiveValue } from "../../../shared/gameTypes";

interface GameCardProps {
  card: CardDefinition;
  currentRound: number;
  isPlayable: boolean;
  isSelected: boolean;
  onClick: () => void;
}

const effectIcons: Record<string, typeof Flame> = {
  damage: Swords,
  heal: Heart,
  shield: Shield,
  buff: Zap,
  debuff: Moon,
};

const tierBorders: Record<string, string> = {
  common: "border-border",
  rare: "border-neon-cyan/60",
  epic: "border-neon-yellow/60",
};

export default function GameCard({ card, currentRound, isPlayable, isSelected, onClick }: GameCardProps) {
  const isWrath = card.sin === "wrath";
  const sinColor = isWrath ? "wrath" : "sloth";
  const SinIcon = isWrath ? Flame : Moon;

  return (
    <motion.div
      layout
      whileHover={isPlayable ? { y: -20, scale: 1.05 } : {}}
      whileTap={isPlayable ? { scale: 0.95 } : {}}
      animate={isSelected ? { y: -30, scale: 1.08 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={`
        relative w-36 h-52 rounded-xl overflow-hidden cursor-pointer select-none
        ${isWrath ? "card-wrath" : "card-sloth"}
        ${isSelected ? (isWrath ? "glow-wrath" : "glow-sloth") : ""}
        ${tierBorders[card.tier]}
        border-2
        ${!isPlayable ? "opacity-50 cursor-not-allowed" : ""}
        transition-shadow duration-200
      `}
    >
      {/* Card header */}
      <div className={`px-2 pt-2 pb-1 flex items-center justify-between bg-${sinColor}/10`}>
        <SinIcon className={`w-3 h-3 text-${sinColor}`} />
        <span className={`text-[10px] font-bold text-${sinColor}`} style={{ fontFamily: "var(--font-heading)" }}>
          {card.cost}
        </span>
      </div>

      {/* Card art placeholder */}
      <div className={`h-16 mx-2 rounded bg-gradient-to-br from-${sinColor}/20 to-transparent flex items-center justify-center`}>
        <SinIcon className={`w-8 h-8 text-${sinColor}/40`} />
      </div>

      {/* Card name */}
      <div className="px-2 py-1">
        <h4 className="text-xs font-bold text-foreground truncate" style={{ fontFamily: "var(--font-heading)" }}>
          {card.name}
        </h4>
      </div>

      {/* Effects */}
      <div className="px-2 space-y-0.5">
        {card.effects.map((effect, i) => {
          const EffectIcon = effectIcons[effect.type] || Zap;
          const effective = calculateEffectiveValue(effect.baseValue, currentRound);
          return (
            <div key={i} className="flex items-center gap-1 text-[9px]">
              <EffectIcon className="w-2.5 h-2.5 text-muted-foreground" />
              <span className="text-muted-foreground capitalize">{effect.type}</span>
              <span className="text-neon-cyan font-bold">{effective}</span>
              {effect.duration > 0 && (
                <span className="text-muted-foreground/60">({effect.duration}r)</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Flavor text */}
      <div className="absolute bottom-1 left-2 right-2">
        <p className="text-[7px] text-muted-foreground/50 italic leading-tight line-clamp-2">
          {card.flavorText}
        </p>
      </div>

      {/* Tier indicator */}
      {card.tier !== "common" && (
        <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
          card.tier === "rare" ? "bg-neon-cyan" : "bg-neon-yellow"
        }`} />
      )}
    </motion.div>
  );
}
