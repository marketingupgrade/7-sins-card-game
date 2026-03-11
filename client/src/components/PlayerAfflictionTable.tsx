/**
 * Player Affliction Table — Detailed Matrix
 *
 * A compact balance sheet that sits adjacent to each player panel,
 * showing active afflictions with individual columns per effect type
 * (DMG, Heal, Shield, Buff, Debuff, E.Drain, E.Gain) and rows per
 * upcoming round with a TOTAL summary row.
 *
 * Only columns with active effects are shown to save space.
 * Styled as a gothic parchment ledger with Painterly Spell Icons.
 */

import { motion } from "framer-motion";
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
  /** Value per effect type */
  values: Record<EffectType, number>;
  /** Detail breakdown per effect type */
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
      damage: 0,
      heal: 0,
      shield: 0,
      buff: 0,
      debuff: 0,
      energy_drain: 0,
      energy_gain: 0,
    },
    details: {
      damage: [],
      heal: [],
      shield: [],
      buff: [],
      debuff: [],
      energy_drain: [],
      energy_gain: [],
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
    .filter((r) => {
      return Object.values(r.values).some((v) => v > 0);
    })
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
  // Only show effects targeting this player
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

  // Only show columns that have active effects
  const visibleColumns = EFFECT_COLUMNS.filter((col) =>
    activeTypes.has(col.type)
  );

  if (visibleColumns.length === 0) return null;

  // Calculate totals per column
  const totals: Record<EffectType, number> = {
    damage: 0,
    heal: 0,
    shield: 0,
    buff: 0,
    debuff: 0,
    energy_drain: 0,
    energy_gain: 0,
  };
  for (const row of rows) {
    for (const col of visibleColumns) {
      totals[col.type] += row.values[col.type];
    }
  }

  // Position classes
  const positionClass =
    position === "left"
      ? "mr-2"
      : position === "right"
      ? "ml-2"
      : "mt-2";

  const fontSize = compact ? "text-[7px]" : "text-[8px]";
  const valueFontSize = compact ? "text-[8px]" : "text-[9px]";
  const totalFontSize = compact ? "text-[9px]" : "text-[10px]";
  const iconSize = compact ? "w-2.5 h-2.5" : "w-3 h-3";

  // Dynamic grid: RND column + one column per active effect type
  const gridCols = `auto ${visibleColumns.map(() => "1fr").join(" ")}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`${positionClass} ${compact ? "max-w-[200px]" : "max-w-[260px]"}`}
    >
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.10 0.01 70 / 0.88), oklch(0.07 0.005 70 / 0.92))",
          border: `1px solid oklch(0.75 0.12 70 / 0.15)`,
          boxShadow: `0 2px 12px oklch(0 0 0 / 0.4), inset 0 1px 0 oklch(0.75 0.12 70 / 0.08)`,
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Header */}
        <div
          className="px-2 py-1.5 border-b"
          style={{
            borderColor: "oklch(0.75 0.12 70 / 0.12)",
            background:
              "linear-gradient(90deg, oklch(0.12 0.02 70 / 0.6), oklch(0.08 0.01 70 / 0.4))",
          }}
        >
          <div className="flex items-center gap-1.5">
            <img
              src={ICON_URLS.buff_generic}
              alt=""
              className="w-3 h-3 object-contain opacity-60"
            />
            <span
              className={`${compact ? "text-[7px]" : "text-[8px]"} font-bold text-candle/80 uppercase tracking-[0.15em]`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Afflictions
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="px-1.5 py-1">
          {/* Column Headers — icons + labels */}
          <div
            className="gap-x-1 px-1 py-0.5 mb-0.5 items-center"
            style={{
              display: "grid",
              gridTemplateColumns: gridCols,
              borderBottom: "1px solid oklch(0.75 0.12 70 / 0.08)",
            }}
          >
            {/* RND header */}
            <span
              className={`${fontSize} text-candle/40 font-bold uppercase`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              RND
            </span>

            {/* Effect type headers */}
            {visibleColumns.map((col) => (
              <div
                key={col.type}
                className="flex flex-col items-center gap-0.5"
                title={col.label}
              >
                <img
                  src={col.icon}
                  alt={col.label}
                  className={`${iconSize} object-contain`}
                  style={{ opacity: 0.7 }}
                />
                <span
                  className={`${fontSize} font-bold uppercase text-center leading-none`}
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: col.color,
                  }}
                >
                  {compact ? col.shortLabel : col.label}
                </span>
              </div>
            ))}
          </div>

          {/* Round Rows */}
          {rows.map((row, idx) => {
            const isNow = row.round === currentRound;

            return (
              <motion.div
                key={row.round}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div
                  className={`gap-x-1 px-1 py-1 rounded ${
                    isNow ? "bg-candle/5" : ""
                  }`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: gridCols,
                    alignItems: "center",
                    borderBottom:
                      idx < rows.length - 1
                        ? "1px solid oklch(0.75 0.12 70 / 0.04)"
                        : "none",
                  }}
                >
                  {/* Round number */}
                  <span
                    className={`${valueFontSize} font-bold ${
                      isNow ? "text-candle" : "text-candle/30"
                    } min-w-[20px]`}
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {isNow ? "NOW" : `R${row.round}`}
                  </span>

                  {/* Value per effect type */}
                  {visibleColumns.map((col) => {
                    const val = row.values[col.type];
                    const details = row.details[col.type];

                    return (
                      <div
                        key={col.type}
                        className="text-center relative group"
                      >
                        {val > 0 ? (
                          <span
                            className={`${valueFontSize} font-black`}
                            style={{
                              fontFamily: "var(--font-heading)",
                              color: col.color,
                            }}
                          >
                            {col.sign}
                            {val}
                          </span>
                        ) : (
                          <span className={`${fontSize} text-muted-foreground/20`}>
                            —
                          </span>
                        )}

                        {/* Hover tooltip with details */}
                        {details.length > 0 && (
                          <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 min-w-[110px]">
                            <div
                              className="rounded-md p-1.5 text-[7px] space-y-0.5"
                              style={{
                                background: "oklch(0.08 0.01 70 / 0.95)",
                                border: "1px solid oklch(0.75 0.12 70 / 0.2)",
                                boxShadow: "0 4px 16px oklch(0 0 0 / 0.5)",
                              }}
                            >
                              {details.map((d, i) => (
                                <div
                                  key={i}
                                  className="flex justify-between gap-2"
                                  style={{ color: col.color }}
                                >
                                  <span className="truncate opacity-80">
                                    {d.name}
                                    {d.tick && (
                                      <span className="text-candle/30 ml-0.5">
                                        [{d.tick}]
                                      </span>
                                    )}
                                  </span>
                                  <span className="font-bold whitespace-nowrap">
                                    {col.sign}
                                    {d.value}
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
              </motion.div>
            );
          })}

          {/* Total Row */}
          <div
            className="gap-x-1 px-1 py-1.5 mt-0.5"
            style={{
              display: "grid",
              gridTemplateColumns: gridCols,
              alignItems: "center",
              borderTop: "1px solid oklch(0.75 0.12 70 / 0.15)",
              background:
                "linear-gradient(90deg, oklch(0.12 0.02 70 / 0.3), transparent)",
            }}
          >
            <span
              className={`${compact ? "text-[6px]" : "text-[7px]"} font-black text-candle/60 uppercase`}
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
                      className={`${totalFontSize} font-black`}
                      style={{
                        fontFamily: "var(--font-heading)",
                        color: col.color,
                        textShadow: `0 0 6px ${col.color.replace(")", " / 0.3)")}`,
                      }}
                    >
                      {col.sign}
                      {total}
                    </span>
                  ) : (
                    <span className={`${fontSize} text-muted-foreground/20`}>
                      —
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Export projection logic for testing
export { projectEffectsMatrix, EFFECT_COLUMNS };
export type { RoundRow, EffectColumn };
