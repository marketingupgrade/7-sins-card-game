/**
 * GameCard Component — Gothic Cathedral Card Design
 *
 * Each card is a stained-glass window into the soul of its sin.
 * Wrath bleeds crimson. Sloth oozes twilight indigo.
 * Greed gleams tarnished gold. Envy seethes poison emerald.
 *
 * ALL cards are compound in v4 — 3 patterns: standard, aggressive, slowburn.
 *
 * v4: Gothic theme — spell icons replace Lucide, ornate borders, cathedral aesthetic
 */

import { motion } from "framer-motion";
import { useRef, useCallback, useState, memo } from "react";
import SinShaderOverlay from "./WebGLSinShaders";
import { CardDefinition, SinType, CompoundPattern, getCompoundTickValue } from "@shared/gameTypes";
import { CARD_ART_URLS } from "@/lib/cardArtUrls";
import { soundEngine } from "@/lib/soundEngine";
import { getEffectIconUrl, SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface GameCardProps {
  card: CardDefinition;
  currentRound: number;
  isPlayable: boolean;
  isSelected: boolean;
  onClick: () => void;
  /** Player's current energy: cards costing more than this are dimmed */
  playerEnergy?: number;
}

const effectColors: Record<string, string> = {
  damage: "text-wrath",
  self_damage: "text-wrath",
  heal_gain: "text-envy-glow",
  heal_steal: "text-lust",
  shield_gain: "text-candle",
  shield_steal: "text-candle",
  energy_gain: "text-envy-glow",
  energy_steal: "text-greed-glow",
  heal_block: "text-sloth",
  shield_block: "text-sloth",
  energy_block: "text-sloth",
  affliction_amplify: "text-envy",
  affliction_transfer: "text-pride",
};

const patternLabels: Record<CompoundPattern, { label: string; title: string; desc: string }> = {
  standard: { label: "STD", title: "Standard", desc: "Fibonacci growth — ticks at 1\u00d7, 1\u00d7, 2\u00d7. Balanced scaling that rewards patience." },
  aggressive: { label: "AGG", title: "Aggressive", desc: "Powers of 2 — ticks at 1\u00d7, 2\u00d7, 4\u00d7. Explosive late-game damage, high risk." },
  slowburn: { label: "SLO", title: "Slowburn", desc: "Slow ramp — ticks at 0.5\u00d7, 1\u00d7, 2.5\u00d7. Weak start, devastating finish." },
};

const tierStyles: Record<string, { border: string; badge: string; glow: string }> = {
  common: { border: "border-border/40", badge: "", glow: "" },
  rare: {
    border: "border-candle/40",
    badge: "bg-candle text-background",
    glow: "shadow-[0_0_8px_oklch(0.82_0.12_75/0.2)]",
  },
  epic: {
    border: "border-greed-glow/50",
    badge: "bg-greed-glow text-background",
    glow: "shadow-[0_0_12px_oklch(0.8_0.18_80/0.25)]",
  },
};

// Per-sin visual config — no Lucide icons
const sinConfig: Record<SinType, {
  color: string;
  cardClass: string;
  glowClass: string;
  selectedGradient: string;
}> = {
  wrath: {
    color: "wrath",
    cardClass: "card-wrath",
    glowClass: "glow-wrath",
    selectedGradient: "radial-gradient(circle at center, oklch(0.6 0.28 25 / 0.15), transparent 70%)",
  },
  sloth: {
    color: "sloth",
    cardClass: "card-sloth",
    glowClass: "glow-sloth",
    selectedGradient: "radial-gradient(circle at center, oklch(0.52 0.18 290 / 0.15), transparent 70%)",
  },
  greed: {
    color: "greed",
    cardClass: "card-greed",
    glowClass: "glow-greed",
    selectedGradient: "radial-gradient(circle at center, oklch(0.75 0.18 85 / 0.15), transparent 70%)",
  },
  envy: {
    color: "envy",
    cardClass: "card-envy",
    glowClass: "glow-envy",
    selectedGradient: "radial-gradient(circle at center, oklch(0.6 0.2 155 / 0.15), transparent 70%)",
  },
  pride: {
    color: "pride",
    cardClass: "card-pride",
    glowClass: "glow-pride",
    selectedGradient: "radial-gradient(circle at center, oklch(0.9 0.02 0 / 0.15), transparent 70%)",
  },
  lust: {
    color: "lust",
    cardClass: "card-lust",
    glowClass: "glow-lust",
    selectedGradient: "radial-gradient(circle at center, oklch(0.6 0.22 350 / 0.15), transparent 70%)",
  },
  gluttony: {
    color: "gluttony",
    cardClass: "card-gluttony",
    glowClass: "glow-gluttony",
    selectedGradient: "radial-gradient(circle at center, oklch(0.55 0.15 60 / 0.15), transparent 70%)",
  },
};

const GameCard = memo(function GameCard({ card, currentRound, isPlayable, isSelected, onClick, playerEnergy }: GameCardProps) {
  const cfg = sinConfig[card.sin] || sinConfig.wrath;
  const tier = tierStyles[card.tier] || tierStyles.common;
  const canAfford = playerEnergy === undefined || card.cost <= playerEnergy;
  const actuallyPlayable = isPlayable && canAfford;
  const pattern = patternLabels[card.compoundPattern] || patternLabels.standard;
  const sinIcon = SIN_ARCHETYPE_ICONS[card.sin];

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

      {/* Card Header: Cost, Type Badge & Sin Icon */}
      <div className="relative px-3 pt-2.5 pb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {/* Sin archetype icon (spell icon, not Lucide) */}
          <img src={sinIcon} alt={card.sin} className="w-5 h-5 object-contain drop-shadow-sm" loading="lazy" />
          {/* Compound Pattern Badge with Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-sm font-bold uppercase badge-compound cursor-help"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {pattern.label}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[220px] bg-[#1a1520] border border-white/10 text-white/90 p-3">
              <p className="font-bold text-xs mb-1" style={{ fontFamily: "var(--font-heading)", color: "oklch(0.7 0.15 80)" }}>{pattern.title}</p>
              <p className="text-[10px] text-white/60 leading-relaxed">{pattern.desc}</p>
            </TooltipContent>
          </Tooltip>
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
      <SinShaderOverlay sin={card.sin } isHovered={isHovered}>
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
            <img src={sinIcon} alt={card.sin} className="w-10 h-10 object-contain opacity-40" loading="lazy" />
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

      {/* Effects List — spell icons instead of Lucide */}
      <div className="px-3 space-y-1">
        {card.effects.map((effect, i) => {
          const color = effectColors[effect.type] || "text-muted-foreground";
          const iconUrl = getEffectIconUrl(effect.type, card.sin);
          return (
            <div key={i} className="flex items-center gap-2 text-[12px] sm:text-[13px]">
              {iconUrl ? (
                <img src={iconUrl} alt={effect.type} className="w-4 h-4 object-contain flex-shrink-0 drop-shadow-sm" loading="lazy" />
              ) : (
                <img src={sinIcon} alt={effect.type} className="w-4 h-4 object-contain flex-shrink-0 drop-shadow-sm opacity-60" loading="lazy" />
              )}
              <span
                className="text-foreground/80 capitalize font-semibold"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
              >
                {effect.type}
              </span>
              <span
                className={`font-black ${color}`}
                title={`Ticks: ${getCompoundTickValue(effect.baseValue, card.compoundPattern, 0)} -> ${getCompoundTickValue(effect.baseValue, card.compoundPattern, 1)} -> ${getCompoundTickValue(effect.baseValue, card.compoundPattern, 2)}`}
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
              >
                {effect.duration > 1 ? `${getCompoundTickValue(effect.baseValue, card.compoundPattern, 0)}→${getCompoundTickValue(effect.baseValue, card.compoundPattern, effect.duration - 1)}` : effect.baseValue}
              </span>
              {effect.targetMode === "self" && (
                <span className="text-foreground/50 font-medium">(self)</span>
              )}
              {effect.targetMode === "aoe" && (
                <span className="text-foreground/50 font-medium">(all)</span>
              )}
              {effect.targetMode === "duo" && (
                <span className="text-foreground/50 font-medium">(×2)</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Description — flavor text */}
      <div className="absolute bottom-2 left-3 right-3">
        <p
          className="text-[10px] sm:text-[11px] text-foreground/60 italic leading-tight line-clamp-2"
          style={{
            fontFamily: "var(--font-body)",
            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          }}
        >
          {card.description}
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
});

export default GameCard;
