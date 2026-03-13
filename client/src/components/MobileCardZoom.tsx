/**
 * MobileCardZoom — Full-screen card detail overlay for mobile
 *
 * Uses the same clear label format as the BattleLog CardPreviewPopup:
 * - Faction + Rarity + Keyword (e.g. "WRATH  COMMON  🔥 Volatile")
 * - Full compound scaling (e.g. "Hurt 5 → 10 → 20")
 * - Effect description text (e.g. "Deals direct damage to target HP")
 * - PLAY CARD button when it's your turn
 */
import { motion, AnimatePresence } from "framer-motion";
import { memo } from "react";
import type { CardDefinition } from "@shared/gameTypes";
import { getCompoundTickValue, CompoundPattern } from "@shared/gameTypes";
import { CARD_ART_URLS } from "@/lib/cardArtUrls";
import { SIN_ARCHETYPE_ICONS, getEffectIconUrl } from "@/lib/iconUtils";
import { getSinCssVar } from "@/lib/sinColors";

interface MobileCardZoomProps {
  card: CardDefinition | null;
  isPlayable: boolean;
  canAfford: boolean;
  onPlay: () => void;
  onClose: () => void;
}

/* ─── Readable effect names (same as BattleLog) ─────────── */
const EFFECT_NAMES: Record<string, string> = {
  damage: "Hurt", self_damage: "Backlash", heal_gain: "Mend", heal_steal: "Siphon Life",
  shield_gain: "Ward", shield_steal: "Crack Ward", energy_gain: "Recharge", energy_steal: "Drain",
  heal_block: "Cursed", shield_block: "Shatter", energy_block: "Exhaust",
  affliction_amplify: "Intensify", affliction_transfer: "Redirect", discard_burn: "Devour",
  energy_regen: "Sustain", draw_boost: "Insight", draw_reduction: "Fog",
};

/* ─── Effect descriptions (same as BattleLog) ────────────── */
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

/* ─── Compound pattern labels (readable, with emoji) ─────── */
const PATTERN_LABELS: Record<string, string> = {
  standard: "\u25C6 Steady",
  aggressive: "\uD83D\uDD25 Volatile",
  slowburn: "\u231B Patient",
};

/* ─── Sin hex colors for inline styles ───────────────────── */
const SIN_COLORS: Record<string, string> = {
  wrath: "#ef4444",
  sloth: "#a855f7",
  greed: "#eab308",
  envy: "#22c55e",
  pride: "#f0f0f0",
  lust: "#ec4899",
  gluttony: "#b45309",
};

export const MobileCardZoom = memo(function MobileCardZoom({
  card,
  isPlayable,
  canAfford,
  onPlay,
  onClose,
}: MobileCardZoomProps) {
  if (!card) return null;

  const sinColor = SIN_COLORS[card.sin] || "#ef4444";
  const sinCssVar = getSinCssVar(card.sin);
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
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Card Container */}
          <motion.div
            initial={{ scale: 0.85, y: 60 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 60 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-[300px] rounded-xl overflow-hidden"
            style={{
              background: "oklch(0.12 0.02 280)",
              border: `2px solid ${sinColor}50`,
              boxShadow: `0 0 40px ${sinColor}20, 0 20px 60px oklch(0 0 0 / 0.6)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Card Art */}
            {artUrl && (
              <div className="h-[200px] relative overflow-hidden">
                <img
                  src={artUrl}
                  alt={card.name}
                  className="w-full h-full object-cover"
                  style={{ filter: "saturate(1.1) contrast(1.05)" }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `linear-gradient(to bottom, transparent 40%, oklch(0.12 0.02 280) 100%)` }}
                />
              </div>
            )}

            <div className="p-4 space-y-3">
              {/* Header: Name + Cost */}
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="text-xl font-black text-candle leading-tight"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {card.name}
                  </h3>
                  {/* Faction + Rarity + Keyword — matching BattleLog format */}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {sinIcon && <img src={sinIcon} alt="" className="w-4 h-4" />}
                    <span
                      className="text-xs uppercase tracking-wider font-bold"
                      style={{ color: sinColor }}
                    >
                      {card.sin}
                    </span>
                    <span className="text-xs text-candle/50 uppercase font-semibold">
                      {card.tier}
                    </span>
                    <span className="text-xs text-candle/50">
                      {PATTERN_LABELS[pattern] || pattern}
                    </span>
                  </div>
                </div>
                {/* Energy Cost */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-black shrink-0"
                  style={{
                    fontFamily: "var(--font-heading)",
                    background: canAfford ? `${sinColor}20` : "oklch(0.65 0.22 25 / 0.1)",
                    color: canAfford ? sinColor : "oklch(0.65 0.22 25)",
                    border: `2px solid ${canAfford ? `${sinColor}50` : "oklch(0.65 0.22 25 / 0.4)"}`,
                    boxShadow: canAfford ? `0 0 12px ${sinColor}30` : "none",
                  }}
                >
                  {card.cost}
                </div>
              </div>

              {/* Effects — matching BattleLog's clear format */}
              <div className="space-y-2.5">
                {card.effects.map((eff, i) => {
                  const iconUrl = getEffectIconUrl(eff.type, card.sin);
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      {iconUrl ? (
                        <img src={iconUrl} alt="" className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      ) : (
                        <span className="text-sm mt-0.5">{"\u2726"}</span>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Readable effect name */}
                          <span
                            className="text-sm font-bold"
                            style={{ color: sinColor }}
                          >
                            {EFFECT_NAMES[eff.type] || eff.type.replace(/_/g, " ")}
                          </span>
                          {/* Full compound scaling: 5 → 10 → 20 */}
                          <span className="text-sm font-black text-candle">
                            {eff.duration > 1
                              ? `${getCompoundTickValue(eff.baseValue, pattern as CompoundPattern, 0)} \u2192 ${getCompoundTickValue(eff.baseValue, pattern as CompoundPattern, 1)} \u2192 ${getCompoundTickValue(eff.baseValue, pattern as CompoundPattern, eff.duration - 1)}`
                              : eff.baseValue
                            }
                          </span>
                          {/* Target mode */}
                          {eff.targetMode && eff.targetMode !== "single" && (
                            <span className="text-[10px] text-candle/40 uppercase font-medium">
                              {eff.targetMode === "self" ? "(self)" : eff.targetMode === "aoe" ? "(all)" : eff.targetMode === "duo" ? "(\u00d72)" : `(${eff.targetMode})`}
                            </span>
                          )}
                        </div>
                        {/* Effect description */}
                        <p className="text-[11px] text-candle/50 leading-snug mt-0.5">
                          {EFFECT_DESCS[eff.type] || ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Flavor text / description */}
              <p
                className="text-xs text-candle/40 italic leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {card.description}
              </p>

              {/* Play Button */}
              {isPlayable && (
                <button
                  className="w-full py-3 rounded-lg text-base font-black uppercase tracking-wider transition-all"
                  style={{
                    fontFamily: "var(--font-heading)",
                    background: canAfford
                      ? `linear-gradient(135deg, ${sinColor}cc, ${sinColor}99)`
                      : "oklch(0.2 0.01 70 / 0.5)",
                    color: canAfford ? "oklch(0.95 0 0)" : "oklch(0.5 0 0)",
                    border: canAfford ? `2px solid ${sinColor}80` : "2px solid oklch(0.3 0 0 / 0.3)",
                    boxShadow: canAfford ? `0 0 20px ${sinColor}30` : "none",
                    opacity: canAfford ? 1 : 0.5,
                    cursor: canAfford ? "pointer" : "not-allowed",
                  }}
                  onClick={canAfford ? onPlay : undefined}
                  disabled={!canAfford}
                >
                  {canAfford ? "PLAY CARD" : "NOT ENOUGH ENERGY"}
                </button>
              )}
            </div>

            {/* Close hint */}
            <div className="text-center pb-2.5">
              <span className="text-[10px] text-candle/25">tap anywhere to close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default MobileCardZoom;
