/**
 * MobileCardZoom — Full-screen card detail overlay for mobile
 *
 * Inspired by Marvel Snap / Legends of Runeterra tap-to-zoom pattern:
 * - Tap a card thumbnail in hand → full-size card appears centered
 * - Background dims to 40% opacity
 * - Tap outside or swipe down to dismiss
 * - "PLAY" button directly on the overlay when it's your turn
 */
import { motion, AnimatePresence } from "framer-motion";
import { memo } from "react";
import type { CardDefinition } from "@shared/gameTypes";
import { getCompoundTickValue, CompoundPattern } from "@shared/gameTypes";
import { CARD_ART_URLS } from "@/lib/cardArtUrls";
import { SIN_ARCHETYPE_ICONS, getEffectIconUrl } from "@/lib/iconUtils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { getSinCssVar } from "@/lib/sinColors";

interface MobileCardZoomProps {
  card: CardDefinition | null;
  isPlayable: boolean;
  canAfford: boolean;
  onPlay: () => void;
  onClose: () => void;
}

const effectColors: Record<string, string> = {
  damage: "text-red-400",
  self_damage: "text-rose-300",
  heal_gain: "text-emerald-400",
  heal_steal: "text-pink-400",
  shield_gain: "text-cyan-400",
  shield_steal: "text-cyan-300",
  energy_gain: "text-amber-400",
  energy_steal: "text-purple-400",
  heal_block: "text-violet-400",
  shield_block: "text-violet-400",
  energy_block: "text-violet-400",
  affliction_amplify: "text-emerald-300",
  affliction_transfer: "text-gray-300",
};

const patternInfo: Record<CompoundPattern, { label: string; title: string; desc: string }> = {
  standard: { label: "STD", title: "Standard", desc: "Fibonacci growth — ticks at 1\u00d7, 1\u00d7, 2\u00d7. Balanced scaling." },
  aggressive: { label: "AGG", title: "Aggressive", desc: "Powers of 2 — ticks at 1\u00d7, 2\u00d7, 4\u00d7. Explosive late-game." },
  slowburn: { label: "SLO", title: "Slowburn", desc: "Slow ramp — ticks at 0.5\u00d7, 1\u00d7, 2.5\u00d7. Devastating finish." },
};


export const MobileCardZoom = memo(function MobileCardZoom({
  card,
  isPlayable,
  canAfford,
  onPlay,
  onClose,
}: MobileCardZoomProps) {
  if (!card) return null;

  const sinColor = getSinCssVar(card.sin);
  const sinIcon = SIN_ARCHETYPE_ICONS[card.sin as keyof typeof SIN_ARCHETYPE_ICONS];
  const pattern = card.compoundPattern || "standard";
  const artUrl = CARD_ART_URLS[card.id];

  return (
    <AnimatePresence>
      {card && (
        <motion.div
          key="mobile-card-zoom"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Card */}
          <motion.div
            initial={{ scale: 0.7, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-[280px] rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(145deg, oklch(0.12 0.02 70 / 0.98), oklch(0.08 0.01 70 / 0.98))`,
              border: `2px solid color-mix(in oklch, ${sinColor} 40%, transparent)`,
              boxShadow: `0 0 40px color-mix(in oklch, ${sinColor} 30%, transparent), 0 20px 60px oklch(0 0 0 / 0.6)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Cost + Type */}
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={sinIcon} alt={card.sin} className="w-6 h-6 object-contain" />
                <span
                  className="text-xs font-bold uppercase tracking-wider opacity-70"
                  style={{ fontFamily: "var(--font-heading)", color: sinColor }}
                >
                  {card.sin}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-[11px] px-2 py-0.5 rounded-sm font-bold uppercase badge-compound cursor-help"
                      style={{ fontFamily: "var(--font-heading)" }}>{patternInfo[pattern]?.label || "STD"}</span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[220px] bg-[#1a1520] border border-white/10 text-white/90 p-3">
                    <p className="font-bold text-xs mb-1" style={{ fontFamily: "var(--font-heading)", color: "oklch(0.7 0.15 80)" }}>{patternInfo[pattern]?.title}</p>
                    <p className="text-[10px] text-white/60 leading-relaxed">{patternInfo[pattern]?.desc}</p>
                  </TooltipContent>
                </Tooltip>
                {card.tier !== "common" && (
                  <span className="text-[11px] px-2 py-0.5 rounded-sm font-bold uppercase"
                    style={{
                      fontFamily: "var(--font-heading)",
                      background: card.tier === "epic" ? "oklch(0.75 0.15 85 / 0.2)" : "oklch(0.5 0.1 280 / 0.2)",
                      color: card.tier === "epic" ? "oklch(0.85 0.12 85)" : "oklch(0.7 0.1 280)",
                    }}>
                    {card.tier}
                  </span>
                )}
              </div>
              {/* Energy Cost */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black border-2"
                style={{
                  fontFamily: "var(--font-heading)",
                  borderColor: canAfford ? `color-mix(in oklch, ${sinColor} 60%, transparent)` : "oklch(0.65 0.22 25 / 0.6)",
                  color: canAfford ? sinColor : "oklch(0.65 0.22 25)",
                  backgroundColor: canAfford ? `color-mix(in oklch, ${sinColor} 12%, transparent)` : "oklch(0.65 0.22 25 / 0.1)",
                  boxShadow: canAfford ? `0 0 15px color-mix(in oklch, ${sinColor} 30%, transparent)` : "none",
                }}
              >
                {card.cost}
              </div>
            </div>

            {/* Card Art — larger on zoom */}
            <div className="mx-3 h-[140px] rounded-lg relative overflow-hidden">
              {artUrl ? (
                <img
                  src={artUrl}
                  alt={card.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: "saturate(1.1) contrast(1.05)" }}
                />
              ) : (
                <div
                  className="flex items-center justify-center h-full"
                  style={{ background: `linear-gradient(135deg, color-mix(in oklch, ${sinColor} 15%, transparent), transparent)` }}
                >
                  <img src={sinIcon} alt={card.sin} className="w-12 h-12 object-contain opacity-40" />
                </div>
              )}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(to bottom, transparent 50%, oklch(0.10 0.01 70 / 0.8) 100%)" }}
              />
            </div>

            {/* Card Name */}
            <div className="px-4 py-2">
              <h3
                className="text-xl font-black text-foreground leading-tight"
                style={{
                  fontFamily: "var(--font-heading)",
                  textShadow: "0 2px 6px rgba(0,0,0,0.8)",
                }}
              >
                {card.name}
              </h3>
            </div>

            {/* Effects — large and readable */}
            <div className="px-4 space-y-2 pb-2">
              {card.effects.map((effect, i) => {
                const color = effectColors[effect.type] || "text-muted-foreground";
                const iconUrl = getEffectIconUrl(effect.type, card.sin);
                return (
                  <div key={i} className="flex items-center gap-3 text-base">
                    {iconUrl ? (
                      <img src={iconUrl} alt={effect.type} className="w-5 h-5 object-contain flex-shrink-0" />
                    ) : (
                      <img src={sinIcon} alt={effect.type} className="w-5 h-5 object-contain flex-shrink-0 opacity-60" />
                    )}
                    <span className="text-foreground/80 capitalize font-semibold" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                      {effect.type.replace(/_/g, " ")}
                    </span>
                    <span className={`font-black ${color}`}>
                      {effect.duration > 1 ? `${getCompoundTickValue(effect.baseValue, pattern, 0)}→${getCompoundTickValue(effect.baseValue, pattern, effect.duration - 1)}` : effect.baseValue}
                    </span>
                    {effect.targetMode === "self" && <span className="text-foreground/50 text-sm">(self)</span>}
                    {effect.targetMode === "aoe" && <span className="text-foreground/50 text-sm">(all)</span>}
                    {effect.targetMode === "duo" && <span className="text-foreground/50 text-sm">(×2)</span>}
                  </div>
                );
              })}
            </div>

            {/* Description */}
            <div className="px-4 pb-3">
              <p className="text-sm text-foreground/50 italic leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                {card.description}
              </p>
            </div>

            {/* Play Button */}
            {isPlayable && (
              <div className="px-4 pb-4">
                <button
                  className="w-full py-3 rounded-lg text-base font-black uppercase tracking-wider transition-all"
                  style={{
                    fontFamily: "var(--font-heading)",
                    background: canAfford
                      ? `linear-gradient(135deg, color-mix(in oklch, ${sinColor} 80%, oklch(0.3 0 0)), color-mix(in oklch, ${sinColor} 60%, oklch(0.2 0 0)))`
                      : "oklch(0.2 0.01 70 / 0.5)",
                    color: canAfford ? "oklch(0.95 0 0)" : "oklch(0.5 0 0)",
                    border: canAfford ? `2px solid color-mix(in oklch, ${sinColor} 60%, transparent)` : "2px solid oklch(0.3 0 0 / 0.3)",
                    boxShadow: canAfford ? `0 0 20px color-mix(in oklch, ${sinColor} 30%, transparent)` : "none",
                    opacity: canAfford ? 1 : 0.5,
                    cursor: canAfford ? "pointer" : "not-allowed",
                  }}
                  onClick={canAfford ? onPlay : undefined}
                  disabled={!canAfford}
                >
                  {canAfford ? "PLAY CARD" : "NOT ENOUGH ENERGY"}
                </button>
              </div>
            )}
          </motion.div>

          {/* Dismiss hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="absolute bottom-8 text-sm text-white/50"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Tap outside to close
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default MobileCardZoom;
