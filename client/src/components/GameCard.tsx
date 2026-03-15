/**
 * GameCard Component — Gothic Cathedral Card Design
 *
 * Each card is a stained-glass window into the soul of its sin.
 * Wrath bleeds crimson. Sloth oozes twilight indigo.
 * Greed gleams tarnished gold. Envy seethes poison emerald.
 *
 * ALL cards are compound in v4 — 3 patterns: standard, aggressive, slowburn.
 *
 * v5: AAA Elevation Phase 1 — Motion parallax tilt with useMotionValue,
 *     holographic light streak on hover, spring physics on select/deselect
 */

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useRef, useCallback, useState, memo, lazy, Suspense } from "react";
import SinShaderOverlay from "./WebGLSinShaders";
import { CardDefinition, SinType, CompoundPattern, getCompoundTickValue } from "@shared/gameTypes";
import { CARD_ART_URLS } from "@/lib/cardArtUrls";
import { soundEngine } from "@/lib/soundEngine";
import { getEffectIconUrl, SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
const HolographicCardShader = lazy(() => import("./HolographicCardShader"));
const AnimatedCardArt = lazy(() => import("./AnimatedCardArt"));

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
  discard_burn: "text-gluttony",
  energy_regen: "text-candle",
  draw_boost: "text-pride",
  draw_reduction: "text-sloth",
};

const effectDisplayNames: Record<string, string> = {
  damage: "Hurt",
  self_damage: "Backlash",
  heal_gain: "Mend",
  heal_steal: "Siphon Life",
  shield_gain: "Ward",
  shield_steal: "Crack Ward",
  energy_gain: "Recharge",
  energy_steal: "Drain",
  heal_block: "Cursed",
  shield_block: "Shatter",
  energy_block: "Exhaust",
  affliction_amplify: "Intensify",
  affliction_transfer: "Redirect",
  discard_burn: "Devour",
  energy_regen: "Sustain",
  draw_boost: "Insight",
  draw_reduction: "Fog",
};

const effectDescriptions: Record<string, string> = {
  damage: "Deals direct damage to target HP",
  self_damage: "Deals damage to yourself as a cost",
  heal_gain: "Restores your HP",
  heal_steal: "Steals HP from target, healing you",
  shield_gain: "Adds protective shield to yourself",
  shield_steal: "Steals shield from the target",
  energy_gain: "Restores your corruption energy",
  energy_steal: "Steals energy from the target",
  heal_block: "Prevents target from healing",
  shield_block: "Prevents target from gaining shield",
  energy_block: "Prevents target from gaining energy",
  affliction_amplify: "Amplifies all active afflictions",
  affliction_transfer: "Transfers your afflictions to target",
  discard_burn: "Forces target to discard cards",
  energy_regen: "Regenerates energy over multiple rounds",
  draw_boost: "Draw extra cards next round",
  draw_reduction: "Target draws fewer cards next round",
};

const targetDisplayNames: Record<string, string> = {
  self: "you",
  aoe: "everyone",
  duo: "x2 targets",
};

const patternLabels: Record<CompoundPattern, { label: string; title: string; desc: string }> = {
  standard: { label: "◆", title: "Steady", desc: "Grows at a steady pace. Nothing fancy, just reliable." },
  aggressive: { label: "🔥", title: "Volatile", desc: "Starts tame, then goes nuclear. High risk, high reward." },
  slowburn: { label: "⌛", title: "Patient", desc: "Barely a scratch at first. Then it really kicks in." },
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

  // Motion-based 3D parallax tilt
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useTransform(mouseY, [0, 1], [12, -12]);
  const rotateY = useTransform(mouseX, [0, 1], [-12, 12]);
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });
  // Holographic light streak position
  const lightX = useTransform(mouseX, [0, 1], [0, 100]);
  const lightY = useTransform(mouseY, [0, 1], [0, 100]);

  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el || !actuallyPlayable) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  }, [actuallyPlayable, mouseX, mouseY]);

  const handleMouseEnter = useCallback(() => {
    if (actuallyPlayable) {
      setIsHovered(true);
      try { soundEngine.play("ui_hover"); } catch {}
    }
  }, [actuallyPlayable]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
    setIsHovered(false);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={cardRef}
      layout
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileTap={actuallyPlayable ? { scale: 0.96 } : {}}
      animate={isSelected
        ? { y: -32, scale: 1.08 }
        : { y: 0, scale: 1 }
      }
      transition={isSelected
        ? { type: "spring", stiffness: 400, damping: 25 }
        : { type: "spring", stiffness: 300, damping: 30 }
      }
      style={{
        perspective: 800,
        willChange: "transform",
        rotateX: isHovered ? springRotateX : 0,
        rotateY: isHovered ? springRotateY : 0,
        transformStyle: "preserve-3d",
      }}
      onClick={actuallyPlayable ? onClick : undefined}
      className={`
        relative w-[200px] sm:w-[220px] h-[300px] sm:h-[340px] rounded-xl overflow-hidden select-none
        ${cfg.cardClass}
        ${tier.border} ${tier.glow}
        ${isSelected ? cfg.glowClass : ""}
        ${actuallyPlayable ? "holo-sheen" : ""}
        border-2
        ${!actuallyPlayable ? "opacity-40 cursor-not-allowed saturate-50" : "cursor-pointer"}
      `}
    >
      {/* Holographic light streak — follows cursor */}
      {isHovered && actuallyPlayable && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-20 rounded-xl"
          style={{
            background: `radial-gradient(circle at ${lightX.get()}% ${lightY.get()}%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
            mixBlendMode: "overlay",
          }}
        />
      )}

      {/* Subtle inner glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: `linear-gradient(to bottom, var(--color-${cfg.color}) 0%, transparent 50%)`, opacity: 0.1 }}
      />

      {/* Card Header: Cost, Type Badge & Sin Icon */}
      <div className="relative px-3 pt-2.5 pb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {/* Sin archetype icon (spell icon, not Lucide) */}
          <img src={sinIcon} alt={card.sin} className="w-6 h-6 object-contain drop-shadow-sm" loading="lazy" />
          {/* Compound Pattern Badge with Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="text-xs sm:text-sm px-2 py-0.5 rounded-sm font-bold uppercase badge-compound cursor-help"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {pattern.label}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[220px] bg-[#1a1520] border border-white/10 text-white/90 p-3">
              <p className="font-bold text-sm mb-1" style={{ fontFamily: "var(--font-heading)", color: "oklch(0.7 0.15 80)" }}>{pattern.title}</p>
              <p className="text-xs text-white/60 leading-relaxed">{pattern.desc}</p>
            </TooltipContent>
          </Tooltip>
          {card.tier !== "common" && (
            <span
              className={`text-xs sm:text-sm px-2 py-0.5 rounded-sm font-bold uppercase ${tier.badge}`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {card.tier}
            </span>
          )}
          {card.skipQueue && (
            <span
              className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-sm font-bold uppercase bg-amber-500/90 text-black tracking-wider animate-pulse"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              ⚡ PRIORITY
            </span>
          )}
        </div>
        {/* Energy Cost — large and prominent */}
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg sm:text-xl font-black border-2 ${
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
      <SinShaderOverlay sin={card.sin} isHovered={isHovered}>
      <div
        className="mx-2.5 h-[100px] sm:h-[115px] rounded-lg relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, color-mix(in oklch, var(--color-${cfg.color}) 15%, transparent), transparent)` }}
      >
        {CARD_ART_URLS[card.id] ? (
          <img
            src={CARD_ART_URLS[card.id]}
            alt={card.name}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: `saturate(1.1) contrast(1.05)`, transform: 'scale(1.15)', transformOrigin: 'center center' }}
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <img src={sinIcon} alt={card.sin} className="w-10 h-10 object-contain opacity-40" loading="lazy" />
          </div>
        )}
        {/* Animated card art for epic signature cards */}
        <Suspense fallback={null}>
          <AnimatedCardArt sin={card.sin as SinType} isSignature={card.tier === "epic" && card.cost >= 4} />
        </Suspense>
        {/* Art overlay gradient for text readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, transparent 40%, color-mix(in oklch, var(--color-background) 70%, transparent) 100%)` }}
        />
      </div>
      </SinShaderOverlay>

      {/* Holographic shimmer for rare/epic cards */}
      {(card.tier === "rare" || card.tier === "epic") && isHovered && (
        <Suspense fallback={null}>
          <HolographicCardShader
            sin={card.sin as SinType}
            intensity={card.tier === "epic" ? "epic" : "rare"}
          />
        </Suspense>
      )}

      {/* Card Name — large, bold, with text shadow for contrast */}
      <div className="px-3 py-1.5">
        <h4
          className="text-lg sm:text-xl font-black text-foreground leading-tight truncate"
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
            <div key={i} className="flex items-center gap-2 text-sm sm:text-[15px]">
              {iconUrl ? (
                <img src={iconUrl} alt={effect.type} className="w-5 h-5 object-contain flex-shrink-0 drop-shadow-sm" loading="lazy" />
              ) : (
                <img src={sinIcon} alt={effect.type} className="w-5 h-5 object-contain flex-shrink-0 drop-shadow-sm opacity-60" loading="lazy" />
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="text-foreground/80 font-semibold cursor-help"
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
                  >
                    {effectDisplayNames[effect.type] || effect.type}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px] bg-[#1a1520] border border-white/10 text-white/90 p-2">
                  <p className="text-xs leading-relaxed">{effectDescriptions[effect.type] || effect.type}</p>
                </TooltipContent>
              </Tooltip>
              <span
                className={`font-black ${color}`}
                title={`Ticks: ${getCompoundTickValue(effect.baseValue, card.compoundPattern, 0)} -> ${getCompoundTickValue(effect.baseValue, card.compoundPattern, 1)} -> ${getCompoundTickValue(effect.baseValue, card.compoundPattern, 2)}`}
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
              >
                {effect.duration > 1 ? `${getCompoundTickValue(effect.baseValue, card.compoundPattern, 0)}→${getCompoundTickValue(effect.baseValue, card.compoundPattern, effect.duration - 1)}` : effect.baseValue}
              </span>
              {effect.targetMode && effect.targetMode !== "single" && (
                <span className="text-foreground/50 font-medium text-xs sm:text-sm">
                  {targetDisplayNames[effect.targetMode] || effect.targetMode}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Description — flavor text */}
      <div className="absolute bottom-2 left-3 right-3">
        <p
          className="text-xs sm:text-sm text-foreground/60 italic leading-tight line-clamp-2"
          style={{
            fontFamily: "var(--font-body)",
            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          }}
        >
          {card.description}
        </p>
      </div>

      {/* Hover-for-details hint — subtle eye icon on playable, non-selected, non-hovered cards */}
      {actuallyPlayable && !isSelected && !isHovered && (
        <div
          className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full pointer-events-none opacity-50"
          style={{
            background: "oklch(0.08 0.01 70 / 0.8)",
            border: "1px solid oklch(0.5 0 0 / 0.15)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="oklch(0.7 0 0 / 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="text-[8px] font-bold uppercase hidden sm:inline" style={{ color: "oklch(0.7 0 0 / 0.5)", fontFamily: "var(--font-heading)" }}>HOVER</span>
        </div>
      )}

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
