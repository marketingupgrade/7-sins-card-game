/**
 * CardHoverPreview — Desktop-only large card preview on hover
 *
 * Shows a full-size card preview floating next to the hovered card in the hand.
 * Applies Fitts's Law: preview appears adjacent to cursor position.
 * Uses portal to avoid clipping by parent overflow.
 */
import { motion, AnimatePresence } from "framer-motion";
import { memo } from "react";
import type { CardDefinition, CompoundPattern } from "@shared/gameTypes";
import { getCompoundTickValue } from "@shared/gameTypes";
import { CARD_ART_URLS } from "@/lib/cardArtUrls";
import { SIN_ARCHETYPE_ICONS, getEffectIconUrl } from "@/lib/iconUtils";
import { getSinCssVar } from "@/lib/sinColors";
import { getCardTargetMode } from "@/lib/targetModeUtils";

interface CardHoverPreviewProps {
  card: CardDefinition | null;
  position: { x: number; y: number };
  visible: boolean;
  canAfford: boolean;
}

const EFFECT_NAMES: Record<string, string> = {
  damage: "Hurt", self_damage: "Backlash", heal_gain: "Mend", heal_steal: "Siphon Life",
  shield_gain: "Ward", shield_steal: "Crack Ward", energy_gain: "Recharge", energy_steal: "Drain",
  heal_block: "Cursed", shield_block: "Shatter", energy_block: "Exhaust",
  affliction_amplify: "Intensify", affliction_transfer: "Redirect", discard_burn: "Devour",
  energy_regen: "Sustain", draw_boost: "Insight", draw_reduction: "Fog",
};

const EFFECT_DESCS: Record<string, string> = {
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

const PATTERN_LABELS: Record<string, { label: string; desc: string }> = {
  standard: { label: "Steady", desc: "Fibonacci growth: 1x, 1x, 2x" },
  aggressive: { label: "Volatile", desc: "Powers of 2: 1x, 2x, 4x" },
  slowburn: { label: "Patient", desc: "Slow ramp: 0.5x, 1x, 2.5x" },
};

const TARGET_LABELS: Record<string, string> = {
  self: "Self", aoe: "All enemies", duo: "2 targets", single: "Single target",
};

const SIN_COLORS: Record<string, string> = {
  wrath: "#ef4444", sloth: "#a855f7", greed: "#eab308", envy: "#22c55e",
  pride: "#f0f0f0", lust: "#ec4899", gluttony: "#b45309",
};

export const CardHoverPreview = memo(function CardHoverPreview({
  card,
  position,
  visible,
  canAfford,
}: CardHoverPreviewProps) {
  if (!card) return null;

  const sinColor = SIN_COLORS[card.sin] || "#ef4444";
  const sinCssVar = getSinCssVar(card.sin);
  const targetMode = getCardTargetMode(card);
  const sinIcon = SIN_ARCHETYPE_ICONS[card.sin as keyof typeof SIN_ARCHETYPE_ICONS];
  const pattern = card.compoundPattern || "standard";
  const patternInfo = PATTERN_LABELS[pattern] || PATTERN_LABELS.standard;
  const artUrl = CARD_ART_URLS[card.id];

  // Position the preview above the card, centered
  const previewWidth = 320;
  const previewHeight = 440;
  let left = position.x - previewWidth / 2;
  let top = position.y - previewHeight - 20;

  // Keep within viewport
  if (left < 8) left = 8;
  if (left + previewWidth > window.innerWidth - 8) left = window.innerWidth - previewWidth - 8;
  if (top < 8) top = position.y + 40; // Flip below if no room above

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed z-[100] pointer-events-none"
          style={{ left, top, width: previewWidth }}
        >
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "oklch(0.11 0.015 70)",
              border: `2px solid ${sinColor}50`,
              boxShadow: `
                0 0 40px ${sinColor}20,
                0 24px 48px oklch(0 0 0 / 0.7),
                inset 0 1px 0 oklch(0.25 0.02 70 / 0.3)
              `,
            }}
          >
            {/* Card Art */}
            {artUrl && (
              <div className="relative overflow-hidden" style={{ height: 160 }}>
                <img
                  src={artUrl}
                  alt={card.name}
                  className="w-full h-full object-cover"
                  style={{ filter: "saturate(1.1) contrast(1.05)" }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(to bottom, transparent 30%, oklch(0.11 0.015 70) 100%)" }}
                />
                {/* Candlelight glow */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 50% 0%, oklch(0.75 0.15 85 / 0.06) 0%, transparent 60%)" }}
                />
              </div>
            )}

            <div style={{ padding: "12px 14px 14px" }}>
              {/* Header: Name + Cost */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3
                    className="text-lg font-black leading-tight"
                    style={{ fontFamily: "var(--font-heading)", color: "oklch(0.90 0.03 85)" }}
                  >
                    {card.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {sinIcon && <img src={sinIcon} alt="" className="w-4 h-4" />}
                    <span className="text-xs uppercase tracking-wider font-bold" style={{ color: sinColor }}>
                      {card.sin}
                    </span>
                    <span className="text-xs uppercase font-semibold" style={{ color: "oklch(0.75 0.15 85 / 0.5)" }}>
                      {card.tier}
                    </span>
                    <span className="text-xs" style={{ color: "oklch(0.75 0.15 85 / 0.4)" }}>
                      {patternInfo.label}
                    </span>
                    {card.skipQueue && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-amber-500/90 text-black">
                        PRIORITY
                      </span>
                    )}
                    {targetMode && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide"
                        style={{
                          color: targetMode.color,
                          background: targetMode.bgColor,
                          border: `1px solid ${targetMode.color}30`,
                        }}
                      >
                        {targetMode.label}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-black shrink-0"
                  style={{
                    fontFamily: "var(--font-heading)",
                    background: canAfford ? `${sinColor}15` : "oklch(0.50 0.20 25 / 0.08)",
                    color: canAfford ? sinColor : "oklch(0.50 0.20 25)",
                    border: `2px solid ${canAfford ? `${sinColor}40` : "oklch(0.50 0.20 25 / 0.3)"}`,
                    boxShadow: canAfford ? `0 0 12px ${sinColor}20` : "none",
                  }}
                >
                  {card.cost}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: `linear-gradient(to right, transparent, oklch(0.75 0.15 85 / 0.15), transparent)`, marginBottom: 8 }} />

              {/* Effects */}
              <div className="space-y-1.5">
                {card.effects.map((eff, i) => {
                  const iconUrl = getEffectIconUrl(eff.type, card.sin);
                  return (
                    <div key={i} className="flex items-start gap-2">
                      {iconUrl ? (
                        <img src={iconUrl} alt="" className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      ) : (
                        <span className="text-sm mt-0.5" style={{ color: sinColor }}>{"\u2726"}</span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold" style={{ color: sinColor }}>
                            {EFFECT_NAMES[eff.type] || eff.type.replace(/_/g, " ")}
                          </span>
                          <span className="text-sm font-black" style={{ color: "oklch(0.90 0.03 85)" }}>
                            {eff.duration > 1
                              ? `${getCompoundTickValue(eff.baseValue, pattern as CompoundPattern, 0)} \u2192 ${getCompoundTickValue(eff.baseValue, pattern as CompoundPattern, 1)} \u2192 ${getCompoundTickValue(eff.baseValue, pattern as CompoundPattern, eff.duration - 1)}`
                              : eff.baseValue}
                          </span>
                          {eff.targetMode && (
                            <span className="text-[10px] uppercase font-medium" style={{ color: "oklch(0.75 0.15 85 / 0.35)" }}>
                              {TARGET_LABELS[eff.targetMode] || eff.targetMode}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] leading-snug" style={{ color: "oklch(0.75 0.15 85 / 0.35)", marginTop: 1 }}>
                          {EFFECT_DESCS[eff.type] || ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Flavor text */}
              <p
                className="text-xs italic leading-relaxed mt-2"
                style={{ fontFamily: "var(--font-narrator, 'Uncial Antiqua', serif)", color: "oklch(0.75 0.15 85 / 0.3)" }}
              >
                {card.description}
              </p>

              {/* Pattern info */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "oklch(0.75 0.15 85 / 0.3)", fontFamily: "var(--font-heading)" }}>
                  Compound: {patternInfo.label}
                </span>
                <span className="text-[10px]" style={{ color: "oklch(0.75 0.15 85 / 0.2)" }}>
                  {patternInfo.desc}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default CardHoverPreview;
