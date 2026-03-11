/**
 * Player Affliction Table — Expand-on-Hover Detail Matrix
 *
 * A compact summary icon strip that sits adjacent to each player panel.
 * On hover, it smoothly expands into a full readable table showing
 * active afflictions with columns per effect type and rows per round.
 *
 * Default (collapsed): shows small colored pips per active effect type.
 * Expanded (hover): full table with round rows, values, and totals.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ICON_URLS } from "@/lib/assetUrls";
import type { EffectType } from "@shared/gameTypes";
import {
  ActiveEffect,
  getCompoundTickValue,
  COMPOUND_MULTIPLIERS,
  PlayerState,
} from "@shared/gameTypes";
import { CARD_MAP } from "@shared/cardData";

interface PlayerAfflictionTableProps {
  player: PlayerState;
  activeEffects: ActiveEffect[];
  currentRound: number;
  maxRound: number;
  /** Position relative to the player panel */
  position?: "left" | "right" | "below";
  /** Compact mode for mobile */
  compact?: boolean;
}

// ─── Column definitions for each effect type ────────────────
interface EffectColumn {
  type: EffectType;
  label: string;
  shortLabel: string;
  color: string;
  textClass: string;
  icon: string;
  sign: "+" | "-";
}

const EFFECT_COLUMNS: EffectColumn[] = [
  {
    type: "damage",
    label: "DMG",
    shortLabel: "DMG",
    color: "oklch(0.65 0.22 25)",
    textClass: "text-wrath",
    icon: ICON_URLS.damage_wrath,
    sign: "-",
  },
  {
    type: "debuff",
    label: "DEBUFF",
    shortLabel: "DBF",
    color: "oklch(0.55 0.18 290)",
    textClass: "text-violet-400",
    icon: ICON_URLS.debuff_wrath,
    sign: "-",
  },
  {
    type: "energy_drain",
    label: "E.DRAIN",
    shortLabel: "EDR",
    color: "oklch(0.50 0.15 310)",
    textClass: "text-purple-400",
    icon: ICON_URLS.energy_generic,
    sign: "-",
  },
  {
    type: "heal",
    label: "HEAL",
    shortLabel: "HEL",
    color: "oklch(0.60 0.18 155)",
    textClass: "text-envy-glow",
    icon: ICON_URLS.heal_generic,
    sign: "+",
  },
  {
    type: "shield",
    label: "SHIELD",
    shortLabel: "SHD",
    color: "oklch(0.70 0.12 220)",
    textClass: "text-sky-400",
    icon: ICON_URLS.shield_generic,
    sign: "+",
  },
  {
    type: "buff",
    label: "BUFF",
    shortLabel: "BUF",
    color: "oklch(0.75 0.15 85)",
    textClass: "text-candle",
    icon: ICON_URLS.buff_generic,
    sign: "+",
  },
  {
    type: "energy_gain",
    label: "E.GAIN",
    shortLabel: "EGN",
    color: "oklch(0.65 0.15 130)",
    textClass: "text-emerald-400",
    icon: ICON_URLS.energy_generic,
    sign: "+",
  },
];

// ─── Projection logic ───────────────────────────────────────
interface RoundRow {
  round: number;
  values: Record<EffectType, number>;
  details: Record<EffectType, { name: string; value: number; tick?: string }[]>;
}

function projectEffectsMatrix(
  playerEffects: ActiveEffect[],
  currentRound: number,
  maxRound: number
): { rows: RoundRow[]; activeTypes: Set<EffectType> } {
  const roundMap = new Map<number, RoundRow>();
  const activeTypes = new Set<EffectType>();
  const maxProjection = Math.min(currentRound + 3, maxRound);

  const makeRow = (round: number): RoundRow => ({
    round,
    values: {
      damage: 0, heal: 0, shield: 0, buff: 0, debuff: 0,
      energy_drain: 0, energy_gain: 0, damage_all: 0, self_damage: 0,
    },
    details: {
      damage: [], heal: [], shield: [], buff: [], debuff: [],
      energy_drain: [], energy_gain: [], damage_all: [], self_damage: [],
    },
  });

  for (let r = currentRound; r <= maxProjection; r++) {
    roundMap.set(r, makeRow(r));
  }

  for (const effect of playerEffects) {
    const card = CARD_MAP[effect.cardId];
    const cardName = card?.name || "???";
    const et = effect.effectType;

    if (effect.isCompounding) {
      const totalTicks = COMPOUND_MULTIPLIERS.length;
      const currentTick = effect.currentTick || 0;

      for (let tick = currentTick; tick < totalTicks; tick++) {
        const tickValue = getCompoundTickValue(effect.baseValue, tick);
        const roundForTick = currentRound + (tick - currentTick);
        if (roundForTick > maxProjection) break;

        if (!roundMap.has(roundForTick)) {
          roundMap.set(roundForTick, makeRow(roundForTick));
        }

        const row = roundMap.get(roundForTick)!;
        row.values[et] += tickValue;
        row.details[et].push({
          name: cardName,
          value: tickValue,
          tick: `${tick + 1}/${totalTicks}`,
        });
        activeTypes.add(et);
      }
    } else {
      const expiresAtRound = effect.appliedAtRound + effect.durationRounds;
      for (
        let round = currentRound;
        round <= Math.min(expiresAtRound, maxProjection);
        round++
      ) {
        if (!roundMap.has(round)) {
          roundMap.set(round, makeRow(round));
        }

        const row = roundMap.get(round)!;
        row.values[et] += effect.baseValue;
        row.details[et].push({
          name: cardName,
          value: effect.baseValue,
        });
        activeTypes.add(et);
      }
    }
  }

  const rows = Array.from(roundMap.values())
    .filter((r) => Object.values(r.values).some((v) => v > 0))
    .sort((a, b) => a.round - b.round);

  return { rows, activeTypes };
}

// ─── Component ──────────────────────────────────────────────

export default function PlayerAfflictionTable({
  player,
  activeEffects,
  currentRound,
  maxRound,
  position = "right",
  compact = false,
}: PlayerAfflictionTableProps) {
  const [isHovered, setIsHovered] = useState(false);

  const playerEffects = activeEffects.filter(
    (e) =>
      e.targetPlayerId === player.id ||
      e.targetPlayerId === player.gamePlayerId
  );

  if (playerEffects.length === 0) return null;

  const { rows, activeTypes } = projectEffectsMatrix(
    playerEffects,
    currentRound,
    maxRound
  );

  if (rows.length === 0) return null;

  const visibleColumns = EFFECT_COLUMNS.filter((col) =>
    activeTypes.has(col.type)
  );

  if (visibleColumns.length === 0) return null;

  // Calculate totals per column
  const totals: Record<EffectType, number> = {
    damage: 0, heal: 0, shield: 0, buff: 0, debuff: 0,
    energy_drain: 0, energy_gain: 0, damage_all: 0, self_damage: 0,
  };
  for (const row of rows) {
    for (const col of visibleColumns) {
      totals[col.type] += row.values[col.type];
    }
  }

  const positionClass =
    position === "left" ? "mr-2" : position === "right" ? "ml-2" : "mt-2";

  const gridCols = `auto ${visibleColumns.map(() => "1fr").join(" ")}`;

  return (
    <div
      className={`${positionClass} relative`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Collapsed state: compact summary pips */}
      <AnimatePresence mode="wait">
        {!isHovered ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-1 items-center cursor-pointer"
            title="Hover to expand afflictions"
          >
            {/* Small icon strip showing active effect types */}
            <div
              className="rounded-lg px-2 py-1.5 flex flex-col gap-1 items-center"
              style={{
                background: "linear-gradient(180deg, oklch(0.10 0.01 70 / 0.8), oklch(0.07 0.005 70 / 0.85))",
                border: "1px solid oklch(0.75 0.12 70 / 0.12)",
                backdropFilter: "blur(6px)",
              }}
            >
              <span
                className="text-[8px] font-bold text-candle/50 uppercase tracking-[0.1em]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                FX
              </span>
              {visibleColumns.map((col) => {
                const total = totals[col.type];
                if (total <= 0) return null;
                return (
                  <div key={col.type} className="flex items-center gap-1" title={`${col.label}: ${col.sign}${total}`}>
                    <img src={col.icon} alt={col.label} className="w-3.5 h-3.5 object-contain" style={{ opacity: 0.8 }} />
                    <span
                      className="text-[10px] font-black"
                      style={{ fontFamily: "var(--font-heading)", color: col.color }}
                    >
                      {col.sign}{total}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* Expanded state: full readable table */
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute z-50 ${
              position === "left" ? "right-0" : position === "right" ? "left-0" : "left-1/2 -translate-x-1/2"
            }`}
            style={{ top: 0, minWidth: compact ? 200 : 260 }}
          >
            <div
              className="rounded-lg overflow-hidden shadow-2xl"
              style={{
                background: "linear-gradient(180deg, oklch(0.10 0.01 70 / 0.96), oklch(0.07 0.005 70 / 0.98))",
                border: "1px solid oklch(0.75 0.12 70 / 0.2)",
                boxShadow: "0 8px 32px oklch(0 0 0 / 0.6), inset 0 1px 0 oklch(0.75 0.12 70 / 0.1)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Header */}
              <div
                className="px-3 py-2 border-b"
                style={{
                  borderColor: "oklch(0.75 0.12 70 / 0.15)",
                  background: "linear-gradient(90deg, oklch(0.12 0.02 70 / 0.6), oklch(0.08 0.01 70 / 0.4))",
                }}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={ICON_URLS.buff_generic}
                    alt=""
                    className="w-4 h-4 object-contain opacity-70"
                  />
                  <span
                    className="text-[11px] font-bold text-candle/90 uppercase tracking-[0.15em]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Active Afflictions
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="px-2 py-1.5">
                {/* Column Headers */}
                <div
                  className="gap-x-2 px-2 py-1 mb-1 items-center"
                  style={{
                    display: "grid",
                    gridTemplateColumns: gridCols,
                    borderBottom: "1px solid oklch(0.75 0.12 70 / 0.1)",
                  }}
                >
                  <span
                    className="text-[10px] text-candle/50 font-bold uppercase"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    RND
                  </span>
                  {visibleColumns.map((col) => (
                    <div key={col.type} className="flex flex-col items-center gap-0.5">
                      <img
                        src={col.icon}
                        alt={col.label}
                        className="w-4 h-4 object-contain"
                        style={{ opacity: 0.8 }}
                      />
                      <span
                        className="text-[9px] font-bold uppercase text-center leading-none"
                        style={{ fontFamily: "var(--font-heading)", color: col.color }}
                      >
                        {col.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Round Rows */}
                {rows.map((row, idx) => {
                  const isNow = row.round === currentRound;
                  return (
                    <div
                      key={row.round}
                      className={`gap-x-2 px-2 py-1.5 rounded ${isNow ? "bg-candle/8" : ""}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: gridCols,
                        alignItems: "center",
                        borderBottom: idx < rows.length - 1 ? "1px solid oklch(0.75 0.12 70 / 0.06)" : "none",
                      }}
                    >
                      <span
                        className={`text-[11px] font-bold ${isNow ? "text-candle" : "text-candle/35"} min-w-[28px]`}
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {isNow ? "NOW" : `R${row.round}`}
                      </span>

                      {visibleColumns.map((col) => {
                        const val = row.values[col.type];
                        const details = row.details[col.type];
                        return (
                          <div key={col.type} className="text-center relative group">
                            {val > 0 ? (
                              <span
                                className="text-[12px] font-black"
                                style={{ fontFamily: "var(--font-heading)", color: col.color }}
                              >
                                {col.sign}{val}
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground/20">—</span>
                            )}

                            {/* Hover tooltip with card name details */}
                            {details.length > 0 && (
                              <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 top-full mt-1 z-[60] min-w-[130px]">
                                <div
                                  className="rounded-md p-2 text-[10px] space-y-1"
                                  style={{
                                    background: "oklch(0.06 0.01 70 / 0.97)",
                                    border: "1px solid oklch(0.75 0.12 70 / 0.25)",
                                    boxShadow: "0 4px 20px oklch(0 0 0 / 0.6)",
                                  }}
                                >
                                  {details.map((d, i) => (
                                    <div key={i} className="flex justify-between gap-3" style={{ color: col.color }}>
                                      <span className="truncate opacity-80">
                                        {d.name}
                                        {d.tick && (
                                          <span className="text-candle/30 ml-1">[{d.tick}]</span>
                                        )}
                                      </span>
                                      <span className="font-bold whitespace-nowrap">
                                        {col.sign}{d.value}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {/* Total Row */}
                <div
                  className="gap-x-2 px-2 py-2 mt-1"
                  style={{
                    display: "grid",
                    gridTemplateColumns: gridCols,
                    alignItems: "center",
                    borderTop: "1px solid oklch(0.75 0.12 70 / 0.18)",
                    background: "linear-gradient(90deg, oklch(0.12 0.02 70 / 0.3), transparent)",
                  }}
                >
                  <span
                    className="text-[10px] font-black text-candle/70 uppercase"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    TOTAL
                  </span>
                  {visibleColumns.map((col) => {
                    const total = totals[col.type];
                    return (
                      <div key={col.type} className="text-center">
                        {total > 0 ? (
                          <span
                            className="text-[13px] font-black"
                            style={{
                              fontFamily: "var(--font-heading)",
                              color: col.color,
                              textShadow: `0 0 8px ${col.color.replace(")", " / 0.4)")}`,
                            }}
                          >
                            {col.sign}{total}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/20">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Export projection logic for testing
export { projectEffectsMatrix, EFFECT_COLUMNS };
export type { RoundRow, EffectColumn };
