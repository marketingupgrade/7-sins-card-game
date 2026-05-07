/**
 * MobileCardZoom — Full-screen card detail overlay for mobile
 *
 * Follows the Brand Book:
 * - Gothic cathedral aesthetic (dark stone bg, candlelight accents)
 * - Narrator voice in Uncial Antiqua for flavor text
 * - Contrarian copy: "BANISH TO THE VOID" not "consume"
 * - Loss-framed hints: "Your corruption runs dry"
 * - Fibonacci spacing (3, 5, 8, 13, 21px)
 * - Void Purple for banish mechanic
 */
import { motion, AnimatePresence } from "framer-motion";
import { memo } from "react";
import type { CardDefinition } from "@shared/gameTypes";
import { getCompoundTickValue, CompoundPattern } from "@shared/gameTypes";
import { CARD_ART_URLS } from "@/lib/cardArtUrls";
import { SIN_ARCHETYPE_ICONS, getEffectIconUrl } from "@/lib/iconUtils";
import { getSinCssVar } from "@/lib/sinColors";
import { getCardTargetMode } from "@/lib/targetModeUtils";

interface MobileCardZoomProps {
  card: CardDefinition | null;
  isPlayable: boolean;
  canAfford: boolean;
  onPlay: () => void;
  onClose: () => void;
  /** Whether consume is available (not yet consumed this round, selection phase) */
  canConsume?: boolean;
  /** Callback to consume/banish this card */
  onConsume?: () => void;
}

/* ─── Readable effect names (same as BattleLog) ─────────── */
const EFFECT_NAMES: Record<string, string> = {
  damage: "Hurt", self_damage: "Backlash", heal_gain: "Mend", heal_steal: "Siphon Life",
  shield_gain: "Ward", shield_steal: "Crack Ward", energy_gain: "Recharge", energy_steal: "Drain",
  heal_block: "Cursed", shield_block: "Shatter", energy_block: "Exhaust",
  affliction_amplify: "Intensify", affliction_transfer: "Redirect", discard_burn: "Devour",
  energy_regen: "Sustain", draw_boost: "Insight", draw_reduction: "Fog",
};

/* ─── Effect descriptions ────────────── */
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
  envy: "#10b981",
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
  canConsume = false,
  onConsume,
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
          className="fixed inset-0 z-[200] flex items-end justify-center"
          onClick={onClose}
        >
          {/* Backdrop — cathedral darkness */}
          <div
            className="absolute inset-0"
            style={{
              background: "oklch(0.06 0.01 280 / 0.85)",
              backdropFilter: "blur(8px)",
            }}
          />

          {/* Card Container — bottom sheet style for thumb-zone access */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="relative w-full max-w-[400px] rounded-t-2xl overflow-hidden"
            style={{
              background: "oklch(0.13 0.015 70)", /* Cathedral stone */
              border: `2px solid ${sinColor}40`,
              boxShadow: `
                0 0 34px ${sinColor}15,
                0 21px 55px oklch(0 0 0 / 0.7),
                inset 0 1px 0 oklch(0.25 0.02 70 / 0.3)
              `, /* Fibonacci: 34, 21, 55 */
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Swipe handle at top */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: 'oklch(0.75 0.15 85 / 0.2)' }} />
            </div>

            {/* Card Art — with candlelight vignette */}
            {artUrl && (
              <div className="relative overflow-hidden" style={{ height: "200px" }}>
                <img
                  src={artUrl}
                  alt={card.name}
                  className="w-full h-full object-cover"
                  style={{ filter: "saturate(1.1) contrast(1.05)" }}
                />
                {/* Bottom fade into stone */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(to bottom, transparent 40%, oklch(0.13 0.015 70) 100%)`,
                  }}
                />
                {/* Subtle candlelight glow at top */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 50% 0%, oklch(0.75 0.15 85 / 0.08) 0%, transparent 60%)`,
                  }}
                />
              </div>
            )}

            {/* Content — Fibonacci padding: 13px */}
            <div style={{ padding: "13px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {/* Header: Name + Cost */}
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="text-xl font-black leading-tight"
                    style={{
                      fontFamily: "var(--font-heading)",
                      color: "oklch(0.90 0.03 85)", /* Parchment */
                    }}
                  >
                    {card.name}
                  </h3>
                  {/* Faction + Rarity + Keyword */}
                  <div className="flex items-center flex-wrap" style={{ gap: "5px", marginTop: "3px" }}>
                    {sinIcon && <img src={sinIcon} alt="" aria-hidden="true" className="w-4 h-4" />}
                    <span
                      className="text-xs uppercase tracking-wider font-bold"
                      style={{ color: sinColor }}
                    >
                      {card.sin}
                    </span>
                    <span
                      className="text-xs uppercase font-semibold"
                      style={{ color: "oklch(0.75 0.15 85 / 0.5)" /* Candle gold dim */ }}
                    >
                      {card.tier}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "oklch(0.75 0.15 85 / 0.4)" }}
                    >
                      {PATTERN_LABELS[pattern] || pattern}
                    </span>
                    {(() => {
                      const tm = getCardTargetMode(card);
                      return tm ? (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide"
                          style={{
                            color: tm.color,
                            background: tm.bgColor,
                            border: `1px solid ${tm.color}30`,
                          }}
                        >
                          {tm.label}
                        </span>
                      ) : null;
                    })()}
                  </div>
                </div>
                {/* Energy Cost — corruption orb */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-black shrink-0"
                  style={{
                    fontFamily: "var(--font-heading)",
                    background: canAfford
                      ? `${sinColor}15`
                      : "oklch(0.50 0.20 25 / 0.08)", /* Blood crimson dim */
                    color: canAfford ? sinColor : "oklch(0.50 0.20 25)",
                    border: `2px solid ${canAfford ? `${sinColor}40` : "oklch(0.50 0.20 25 / 0.3)"}`,
                    boxShadow: canAfford ? `0 0 13px ${sinColor}25` : "none", /* Fibonacci 13 */
                  }}
                >
                  {card.cost}
                </div>
              </div>

              {/* Iron divider — gothic gate motif */}
              <div
                style={{
                  height: "1px",
                  background: `linear-gradient(to right, transparent, oklch(0.75 0.15 85 / 0.2), transparent)`,
                }}
              />

              {/* Effects — clear format matching BattleLog */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {card.effects.map((eff, i) => {
                  const iconUrl = getEffectIconUrl(eff.type, card.sin);
                  return (
                    <div key={i} className="flex items-start" style={{ gap: "8px" }}>
                      {iconUrl ? (
                        <img src={iconUrl} alt="Card effect icon" className="w-5 h-5 flex-shrink-0" style={{ marginTop: "2px" }} />
                      ) : (
                        <span className="text-sm" style={{ marginTop: "2px", color: sinColor }}>{"\u2726"}</span>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center flex-wrap" style={{ gap: "5px" }}>
                          {/* Readable effect name */}
                          <span
                            className="text-sm font-bold"
                            style={{ color: sinColor }}
                          >
                            {EFFECT_NAMES[eff.type] || eff.type.replace(/_/g, " ")}
                          </span>
                          {/* Full compound scaling: 5 → 10 → 20 */}
                          <span
                            className="text-sm font-black"
                            style={{ color: "oklch(0.90 0.03 85)" /* Parchment */ }}
                          >
                            {eff.duration > 1
                              ? `${getCompoundTickValue(eff.baseValue, pattern as CompoundPattern, 0)} \u2192 ${getCompoundTickValue(eff.baseValue, pattern as CompoundPattern, 1)} \u2192 ${getCompoundTickValue(eff.baseValue, pattern as CompoundPattern, eff.duration - 1)}`
                              : eff.baseValue
                            }
                          </span>
                          {/* Target mode */}
                          {eff.targetMode && eff.targetMode !== "single" && (
                            <span
                              className="text-[10px] uppercase font-medium"
                              style={{ color: "oklch(0.75 0.15 85 / 0.35)" }}
                            >
                              {eff.targetMode === "self" ? "(self)" : eff.targetMode === "aoe" ? "(all)" : eff.targetMode === "duo" ? "(\u00d72)" : `(${eff.targetMode})`}
                            </span>
                          )}
                        </div>
                        {/* Effect description */}
                        <p
                          className="text-[11px] leading-snug"
                          style={{
                            color: "oklch(0.75 0.15 85 / 0.4)",
                            marginTop: "2px",
                          }}
                        >
                          {EFFECT_DESCS[eff.type] || ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Flavor text — narrator voice in Uncial Antiqua */}
              <p
                className="text-xs italic leading-relaxed"
                style={{
                  fontFamily: "var(--font-narrator, 'Uncial Antiqua', serif)",
                  color: "oklch(0.75 0.15 85 / 0.35)", /* Dim candle gold */
                }}
              >
                {card.description}
              </p>

              {/* Action Buttons */}
              {isPlayable && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {/* Play Button — branded with sin color */}
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    className="w-full rounded-lg text-base font-black uppercase tracking-wider"
                    style={{
                      fontFamily: "var(--font-heading)",
                      padding: "13px", /* Fibonacci */
                      background: canAfford
                        ? `linear-gradient(135deg, ${sinColor}cc, ${sinColor}88)`
                        : "oklch(0.18 0.01 70 / 0.6)",
                      color: canAfford
                        ? "oklch(0.95 0 0)"
                        : "oklch(0.45 0 0)",
                      border: canAfford
                        ? `2px solid ${sinColor}60`
                        : "2px solid oklch(0.25 0 0 / 0.3)",
                      boxShadow: canAfford
                        ? `0 0 21px ${sinColor}25, inset 0 1px 0 ${sinColor}30` /* Fibonacci 21 */
                        : "none",
                      opacity: canAfford ? 1 : 0.5,
                      cursor: canAfford ? "pointer" : "not-allowed",
                    }}
                    onClick={canAfford ? onPlay : undefined}
                    disabled={!canAfford}
                  >
                    {/* Brandbook: contrarian copy */}
                    {canAfford ? "UNLEASH" : "CORRUPTION INSUFFICIENT"}
                  </motion.button>

                  {/* Consume Button — BANISH TO THE VOID (Void Purple) */}
                  {canConsume && onConsume && (
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      className="w-full rounded-lg text-sm font-bold uppercase tracking-wider"
                      style={{
                        fontFamily: "var(--font-heading)",
                        padding: "10px 13px", /* Fibonacci */
                        background: "linear-gradient(135deg, oklch(0.22 0.12 300), oklch(0.16 0.10 300))",
                        color: "oklch(0.78 0.08 300)",
                        border: "1px solid oklch(0.35 0.15 300 / 0.4)",
                        boxShadow: "0 0 13px oklch(0.30 0.15 300 / 0.2)", /* Fibonacci 13 */
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onConsume();
                      }}
                    >
                      <span className="flex items-center justify-center" style={{ gap: "5px" }}>
                        {/* Void icon */}
                        <span style={{ fontSize: "14px" }}>{"\u2620"}</span>
                        BANISH TO THE VOID
                        <span className="text-[10px] opacity-60">(+1 energy)</span>
                      </span>
                    </motion.button>
                  )}
                </div>
              )}
            </div>

            {/* Swipe handle + Close hint — bottom sheet convention */}
            <div className="flex flex-col items-center" style={{ paddingBottom: "13px", paddingTop: "5px" }}>
              <div
                className="w-10 h-1 rounded-full mb-1"
                style={{ background: "oklch(0.75 0.15 85 / 0.15)" }}
              />
              <span
                className="text-[10px]"
                style={{
                  fontFamily: "var(--font-narrator, 'Uncial Antiqua', serif)",
                  color: "oklch(0.75 0.15 85 / 0.2)",
                }}
              >
                swipe down or tap backdrop to dismiss
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default MobileCardZoom;
