/**
 * MobileAfflictionSheet — Touch-friendly bottom sheet for affliction details
 *
 * Replaces hover-to-expand affliction table on mobile.
 * Tap the icon strip → bottom sheet slides up with full details.
 * Tap outside or swipe down to dismiss.
 */
import { motion, AnimatePresence } from "framer-motion";
import { memo, useState } from "react";
import { ICON_URLS } from "@/lib/assetUrls";
import type { EffectType, ActiveEffect, PlayerState } from "@shared/gameTypes";
import { getCompoundTickValue } from "@shared/gameTypes";
import { CARD_MAP } from "@shared/cardData";

interface MobileAfflictionSheetProps {
  player: PlayerState;
  activeEffects: ActiveEffect[];
  currentRound: number;
}

interface EffectColumn {
  type: EffectType;
  label: string;
  color: string;
  icon: string;
  sign: "+" | "-";
}

const EFFECT_COLUMNS: EffectColumn[] = [
  { type: "damage", label: "DMG", color: "oklch(0.65 0.22 25)", icon: ICON_URLS.damage_wrath, sign: "-" },
  { type: "debuff", label: "DEBUFF", color: "oklch(0.55 0.18 290)", icon: ICON_URLS.debuff_wrath, sign: "-" },
  { type: "energy_drain", label: "E.DRAIN", color: "oklch(0.50 0.15 310)", icon: ICON_URLS.energy_generic, sign: "-" },
  { type: "heal", label: "HEAL", color: "oklch(0.60 0.18 155)", icon: ICON_URLS.heal_generic, sign: "+" },
  { type: "shield", label: "SHIELD", color: "oklch(0.65 0.15 200)", icon: ICON_URLS.shield_generic, sign: "+" },
  { type: "buff", label: "BUFF", color: "oklch(0.70 0.15 85)", icon: ICON_URLS.buff_generic, sign: "+" },
  { type: "energy_gain", label: "E.GAIN", color: "oklch(0.65 0.18 85)", icon: ICON_URLS.energy_generic, sign: "+" },
  { type: "damage_all", label: "AOE", color: "oklch(0.60 0.20 40)", icon: ICON_URLS.damage_wrath, sign: "-" },
  { type: "self_damage", label: "SELF", color: "oklch(0.55 0.15 350)", icon: ICON_URLS.damage_wrath, sign: "-" },
];

export const MobileAfflictionSheet = memo(function MobileAfflictionSheet({
  player,
  activeEffects,
  currentRound,
}: MobileAfflictionSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate totals per effect type
  const totals: Record<string, number> = {};
  for (const col of EFFECT_COLUMNS) {
    const effects = activeEffects.filter((e) => e.effectType === col.type);
    let total = 0;
    for (const eff of effects) {
      if (eff.isCompounding) {
        total += getCompoundTickValue(eff.baseValue, eff.currentTick || 0);
      } else {
        total += eff.baseValue;
      }
    }
    totals[col.type] = total;
  }

  const activeColumns = EFFECT_COLUMNS.filter((col) => totals[col.type] > 0);
  if (activeColumns.length === 0) return null;

  return (
    <>
      {/* Compact icon strip — tap to open */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md"
        style={{
          background: "oklch(0.10 0.01 70 / 0.8)",
          border: "1px solid oklch(0.75 0.12 70 / 0.12)",
        }}
      >
        {activeColumns.slice(0, 4).map((col) => (
          <div key={col.type} className="flex items-center gap-0.5" title={`${col.label}: ${col.sign}${totals[col.type]}`}>
            <img src={col.icon} alt={col.label} className="w-3.5 h-3.5 object-contain opacity-80" />
            <span className="text-[11px] font-black" style={{ fontFamily: "var(--font-heading)", color: col.color }}>
              {col.sign}{totals[col.type]}
            </span>
          </div>
        ))}
        {activeColumns.length > 4 && (
          <span className="text-[10px] text-muted-foreground font-bold">+{activeColumns.length - 4}</span>
        )}
      </button>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="affliction-sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-end justify-center"
            onClick={() => setIsOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50" />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="relative w-full max-w-md rounded-t-2xl overflow-hidden"
              style={{
                background: "linear-gradient(180deg, oklch(0.12 0.02 70 / 0.98), oklch(0.08 0.01 70 / 0.98))",
                border: "1px solid oklch(0.75 0.12 70 / 0.2)",
                borderBottom: "none",
                boxShadow: "0 -8px 32px oklch(0 0 0 / 0.6)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle */}
              <div className="flex justify-center py-2">
                <div className="w-10 h-1 rounded-full bg-foreground/20" />
              </div>

              {/* Header */}
              <div className="px-4 pb-2 flex items-center gap-2">
                <img src={ICON_URLS.buff_generic} alt="" className="w-5 h-5 object-contain opacity-70" />
                <span className="text-sm font-bold text-candle/90 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                  {player.username} — Active Afflictions
                </span>
              </div>

              {/* Effect rows */}
              <div className="px-4 pb-6 space-y-2">
                {activeColumns.map((col) => {
                  const effects = activeEffects.filter((e) => e.effectType === col.type);
                  return (
                    <div key={col.type} className="flex items-center gap-3 py-2 border-b border-foreground/5">
                      <img src={col.icon} alt={col.label} className="w-6 h-6 object-contain" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold uppercase" style={{ fontFamily: "var(--font-heading)", color: col.color }}>
                            {col.label}
                          </span>
                          <span className="text-lg font-black" style={{ color: col.color }}>
                            {col.sign}{totals[col.type]}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {effects.map((eff, i) => (
                            <span key={i} className="text-xs text-foreground/50">
                              {CARD_MAP[eff.cardId]?.name || "Unknown"}{eff.isCompounding ? ` (tick ${(eff.currentTick || 0) + 1}/3)` : ""}
                              {i < effects.length - 1 ? "," : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

export default MobileAfflictionSheet;
