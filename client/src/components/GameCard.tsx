/**
 * GameCard Component - Premium Glassmorphism Card Design
 *
 * Each card is a tiny window into the soul of its sin.
 * Wrath bleeds crimson. Sloth oozes purple.
 * Greed gleams gold. Envy seethes emerald.
 *
 * Cards are either FLAT (instant, one-time) or COMPOUNDING (3-round Fibonacci escalation).
 *
 * v2: Major readability overhaul — larger fonts, stronger contrast, better mobile layout
 */

import { motion } from "framer-motion";
import { useRef, useCallback, useState } from "react";
import SinShaderOverlay from "./WebGLSinShaders";
import { Flame, Moon, Shield, Heart, Swords, Zap, Coins, Eye, Timer, Sparkles } from "lucide-react";
import { CardDefinition, SinType, COMPOUND_MULTIPLIERS, getCompoundTickValue } from "@shared/gameTypes";
import { CARD_ART_URLS } from "@/lib/cardArtUrls";
import { soundEngine } from "@/lib/soundEngine";
import { getEffectIconUrl } from "@/lib/iconUtils";

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
  energy_drain: Zap,
  energy_gain: Zap,
};

const effectColors: Record<string, string> = {
  damage: "text-wrath",
  heal: "text-neon-green",
  shield: "text-neon-cyan",
  buff: "text-neon-yellow",
  debuff: "text-sloth",
  energy_drain: "text-wrath",
  energy_gain: "text-neon-green",
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
  const isCompounding = card.cardType === "compounding";

  // 3D tilt
  const cardRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el || !actuallyPlayable) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const tiltX = (10 * (0.5 - y)).toFixed(2);
    const tiltY = (10 * (x - 0.5)).toFixed(2);
    el.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-24px) scale(1.06)`;
  }, [actuallyPlayable]);
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = '';
    el.style.transition = 'transform 0.3s ease-out';
    setTimeout(() => { if (el) el.style.transition = ''; }, 300);
    setIsHovered(false);
  }, []);

  return (
    <motion.div
      ref={cardRef}
      layout
      onMouseMove={(e) => { handleMouseMove(e); setIsHovered(true); }}
      onMouseLeave={handleMouseLeave}
      whileTap={actuallyPlayable ? { scale: 0.96 } : {}}
      animate={isSelected ? { y: -32, scale: 1.1 } : { y: 0, scale: 1 }}
      onClick={actuallyPlayable ? onClick : undefined}
      className={`
        relative w-[180px] sm:w-[200px] h-[270px] sm:h-[300px] rounded-xl overflow-hidden select-none
        ${cfg.cardClass}
        ${tier.border} ${tier.glow}
        ${isSelected ? cfg.glowClass : ""}
        ${actuallyPlayable ? "holo-sheen" : ""}
        border-2
        ${!actuallyPlayable ? "opacity-40 cursor-not-allowed saturate-50" : "cursor-pointer"}
        transition-all duration-300
      `}
      style={{ willChange: 'transform' }}
    >
      {/* Subtle inner glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: `linear-gradient(to bottom, var(--color-${cfg.color}) 0%, transparent 50%)`, opacity: 0.1 }}
      />

      {/* Card Header: Cost, Type Badge & Sin */}
      <div className="relative px-3 pt-2.5 pb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <SinIcon className="w-4 h-4" style={{ color: `var(--color-${cfg.color})` }} />
          {/* Card Type Badge */}
          {isCompounding ? (
            <span
              className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-sm font-bold uppercase badge-compound"
              style={{ fontFamily: "var(--font-heading)" }}
              title="Compounding: ticks for 3 rounds [1×, 1×, 2×]"
            >
              <Timer className="w-3 h-3 inline mr-0.5" />
              3R
            </span>
          ) : (
            <span
              className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-sm font-bold uppercase badge-flat"
              style={{ fontFamily: "var(--font-heading)" }}
              title="Flat: instant one-time effect"
            >
              <Sparkles className="w-3 h-3 inline mr-0.5" />
              FLAT
            </span>
          )}
          {card.tier !== "common" && (
            <span
              className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-sm font-bold uppercase ${tier.badge}`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {card.tier}
            </span>
          )}
        </div>
        {/* Energy Cost — large and prominent */}
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg font-black border-2 ${
            !canAfford
              ? "border-destructive/60 text-destructive bg-destructive/10"
              : ""
          }`}
          style={canAfford ? {
            fontFamily: "var(--font-heading)",
            borderColor: `color-mix(in oklch, var(--color-${cfg.color}) 50%, transparent)`,
            color: `var(--color-${cfg.color})`,
            backgroundColor: `color-mix(in oklch, var(--color-${cfg.color}) 12%, transparent)`,
            boxShadow: `0 0 10px color-mix(in oklch, var(--color-${cfg.color}) 30%, transparent)`,
          } : { fontFamily: "var(--font-heading)" }}
          title={`Corruption cost: ${card.cost}`}
        >
          {card.cost}
        </div>
      </div>

      {/* Card Art Area — unique AI-generated art per card */}
      <SinShaderOverlay sin={card.sin as 'wrath' | 'sloth' | 'greed' | 'envy'} isHovered={isHovered}>
      <div
        className="mx-2.5 h-[90px] sm:h-[100px] rounded-lg relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, color-mix(in oklch, var(--color-${cfg.color}) 15%, transparent), transparent)` }}
      >
        {CARD_ART_URLS[card.id] ? (
          <img
            src={CARD_ART_URLS[card.id]}
            alt={card.name}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: `saturate(1.1) contrast(1.05)` }}
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <SinIcon className="w-10 h-10" style={{ color: `color-mix(in oklch, var(--color-${cfg.color}) 40%, transparent)` }} />
          </div>
        )}
        {/* Art overlay gradient for text readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, transparent 40%, color-mix(in oklch, var(--color-background) 70%, transparent) 100%)` }}
        />
      </div>
      </SinShaderOverlay>

      {/* Card Name — large, bold, with text shadow for contrast */}
      <div className="px-3 py-1.5">
        <h4
          className="text-[15px] sm:text-[17px] font-black text-foreground leading-tight truncate"
          style={{
            fontFamily: "var(--font-heading)",
            textShadow: "0 1px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.4)",
          }}
        >
          {card.name}
        </h4>
      </div>

      {/* Effects List — bigger, bolder, more readable */}
      <div className="px-3 space-y-1">
        {card.effects.map((effect, i) => {
          const EffectIcon = effectIcons[effect.type] || Zap;
          const color = effectColors[effect.type] || "text-muted-foreground";
          return (
            <div key={i} className="flex items-center gap-2 text-[12px] sm:text-[13px]">
              {(() => {
                const iconUrl = getEffectIconUrl(effect.type, card.sin);
                return iconUrl
                  ? <img src={iconUrl} alt={effect.type} className="w-4 h-4 object-contain flex-shrink-0 drop-shadow-sm" loading="lazy" />
                  : <EffectIcon className={`w-4 h-4 ${color} flex-shrink-0`} />;
              })()}
              <span
                className="text-foreground/80 capitalize font-semibold"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
              >
                {effect.type}
              </span>
              {isCompounding ? (
                <span
                  className={`font-black ${color}`}
                  title={`Ticks: ${COMPOUND_MULTIPLIERS.map((m) => effect.baseValue * m).join(" → ")}`}
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
                >
                  {getCompoundTickValue(effect.baseValue, 0)}→{getCompoundTickValue(effect.baseValue, 1)}→{getCompoundTickValue(effect.baseValue, 2)}
                </span>
              ) : (
                <span
                  className={`font-black ${color}`}
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
                >
                  {effect.baseValue}
                </span>
              )}
              {effect.target === "self" && (
                <span className="text-foreground/50 font-medium">(self)</span>
              )}
              {effect.target === "all_enemies" && (
                <span className="text-foreground/50 font-medium">(all)</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Catch-up indicator */}
      {card.catchup && (
        <div className="px-3 mt-1">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-[12px] px-2 py-1 rounded bg-neon-yellow/10 border border-neon-yellow/20">
            <Zap className="w-3 h-3 text-neon-yellow flex-shrink-0" />
            <span className="text-neon-yellow/90 font-bold uppercase" style={{ fontFamily: "var(--font-heading)" }}>
              Catch-up
            </span>
            <span className="text-foreground/50 font-medium">
              {card.catchup.type === "bonus_damage" ? "+DMG" : card.catchup.type === "bonus_heal" ? "+HEAL" : "+DEBUFF"}
            </span>
          </div>
        </div>
      )}

      {/* Flavor Text — slightly larger, better contrast */}
      <div className="absolute bottom-2 left-3 right-3">
        <p
          className="text-[10px] sm:text-[11px] text-foreground/60 italic leading-tight line-clamp-2"
          style={{
            fontFamily: "var(--font-body)",
            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          }}
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
