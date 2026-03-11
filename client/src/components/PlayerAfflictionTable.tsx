/**
 * Player Affliction Table
 *
 * A compact "balance sheet" that sits adjacent to each player panel,
 * showing active afflictions with Pain/Gain columns per upcoming round
 * and a total row. Styled as a gothic parchment ledger.
 *
 * Pain column: damage + debuff (red)
 * Gain column: heal + shield (green/gold)
 * Net column: gain - pain (positive = green, negative = red)
 */

import { motion, AnimatePresence } from "framer-motion";
import { ICON_URLS } from "@/lib/assetUrls";
import type { SinType } from "@shared/gameTypes";
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

interface RoundRow {
  round: number;
  pain: number; // damage + debuff
  gain: number; // heal + shield
  painDetails: { name: string; value: number; type: string; tick?: string }[];
  gainDetails: { name: string; value: number; type: string; tick?: string }[];
}

const SIN_COLORS: Record<string, string> = {
  wrath: "oklch(0.65 0.22 25)",
  sloth: "oklch(0.55 0.18 290)",
  greed: "oklch(0.75 0.15 85)",
  envy: "oklch(0.60 0.18 155)",
};

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

  // Project effects into round rows
  const roundMap = new Map<number, RoundRow>();

  // Initialize rounds from current to current+3 (or maxRound)
  const maxProjection = Math.min(currentRound + 3, maxRound);
  for (let r = currentRound; r <= maxProjection; r++) {
    roundMap.set(r, {
      round: r,
      pain: 0,
      gain: 0,
      painDetails: [],
      gainDetails: [],
    });
  }

  for (const effect of playerEffects) {
    const card = CARD_MAP[effect.cardId];
    const cardName = card?.name || "???";
    const isPain =
      effect.effectType === "damage" ||
      effect.effectType === "debuff" ||
      effect.effectType === "energy_drain";
    const isGain =
      effect.effectType === "heal" ||
      effect.effectType === "shield" ||
      effect.effectType === "buff" ||
      effect.effectType === "energy_gain";

    if (effect.isCompounding) {
      const totalTicks = COMPOUND_MULTIPLIERS.length;
      const currentTick = effect.currentTick || 0;

      for (let tick = currentTick; tick < totalTicks; tick++) {
        const tickValue = getCompoundTickValue(effect.baseValue, tick);
        const roundForTick = currentRound + (tick - currentTick);

        if (roundForTick > maxProjection) break;

        if (!roundMap.has(roundForTick)) {
          roundMap.set(roundForTick, {
            round: roundForTick,
            pain: 0,
            gain: 0,
            painDetails: [],
            gainDetails: [],
          });
        }

        const row = roundMap.get(roundForTick)!;
        const detail = {
          name: cardName,
          value: tickValue,
          type: effect.effectType,
          tick: `${tick + 1}/${totalTicks}`,
        };

        if (isPain) {
          row.pain += tickValue;
          row.painDetails.push(detail);
        } else if (isGain) {
          row.gain += tickValue;
          row.gainDetails.push(detail);
        }
      }
    } else {
      // Flat/duration effects
      const expiresAtRound = effect.appliedAtRound + effect.durationRounds;
      for (let round = currentRound; round <= Math.min(expiresAtRound, maxProjection); round++) {
        if (!roundMap.has(round)) {
          roundMap.set(round, {
            round,
            pain: 0,
            gain: 0,
            painDetails: [],
            gainDetails: [],
          });
        }

        const row = roundMap.get(round)!;
        const detail = {
          name: cardName,
          value: effect.baseValue,
          type: effect.effectType,
        };

        if (isPain) {
          row.pain += effect.baseValue;
          row.painDetails.push(detail);
        } else if (isGain) {
          row.gain += effect.baseValue;
          row.gainDetails.push(detail);
        }
      }
    }
  }

  // Convert to sorted array, filter out empty rounds
  const rows = Array.from(roundMap.values())
    .filter((r) => r.pain > 0 || r.gain > 0)
    .sort((a, b) => a.round - b.round);

  if (rows.length === 0) return null;

  // Calculate totals
  const totalPain = rows.reduce((sum, r) => sum + r.pain, 0);
  const totalGain = rows.reduce((sum, r) => sum + r.gain, 0);
  const totalNet = totalGain - totalPain;

  const sinColor = SIN_COLORS[player.chosenSin || "wrath"] || SIN_COLORS.wrath;

  // Position classes
  const positionClass =
    position === "left"
      ? "mr-2"
      : position === "right"
      ? "ml-2"
      : "mt-2";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`${positionClass} ${compact ? "max-w-[160px]" : "max-w-[200px]"}`}
    >
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.10 0.01 70 / 0.85), oklch(0.07 0.005 70 / 0.9))",
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
              className={`${compact ? "text-[8px]" : "text-[9px]"} font-bold text-candle/80 uppercase tracking-[0.15em]`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Afflictions
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="px-1.5 py-1">
          {/* Column Headers */}
          <div
            className="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-1 px-1 py-0.5 mb-0.5"
            style={{
              borderBottom: "1px solid oklch(0.75 0.12 70 / 0.08)",
            }}
          >
            <span
              className={`${compact ? "text-[6px]" : "text-[7px]"} text-candle/40 font-bold uppercase`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              RND
            </span>
            <span
              className={`${compact ? "text-[6px]" : "text-[7px]"} text-wrath/60 font-bold uppercase text-center`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              PAIN
            </span>
            <span
              className={`${compact ? "text-[6px]" : "text-[7px]"} text-envy-glow/60 font-bold uppercase text-center`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              GAIN
            </span>
            <span
              className={`${compact ? "text-[6px]" : "text-[7px]"} text-candle/40 font-bold uppercase text-center`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              NET
            </span>
          </div>

          {/* Round Rows */}
          {rows.map((row, idx) => {
            const net = row.gain - row.pain;
            const isNow = row.round === currentRound;

            return (
              <motion.div
                key={row.round}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative"
              >
                <div
                  className={`grid grid-cols-[auto_1fr_1fr_1fr] gap-x-1 px-1 py-1 rounded ${
                    isNow ? "bg-candle/5" : ""
                  }`}
                  style={{
                    borderBottom:
                      idx < rows.length - 1
                        ? "1px solid oklch(0.75 0.12 70 / 0.04)"
                        : "none",
                  }}
                >
                  {/* Round number */}
                  <span
                    className={`${compact ? "text-[8px]" : "text-[9px]"} font-bold ${
                      isNow ? "text-candle" : "text-candle/30"
                    } min-w-[18px]`}
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {isNow ? "NOW" : `R${row.round}`}
                  </span>

                  {/* Pain */}
                  <div className="text-center">
                    {row.pain > 0 ? (
                      <span
                        className={`${compact ? "text-[9px]" : "text-[10px]"} font-black text-wrath`}
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        -{row.pain}
                      </span>
                    ) : (
                      <span
                        className={`${compact ? "text-[8px]" : "text-[9px]"} text-muted-foreground/20`}
                      >
                        —
                      </span>
                    )}
                  </div>

                  {/* Gain */}
                  <div className="text-center">
                    {row.gain > 0 ? (
                      <span
                        className={`${compact ? "text-[9px]" : "text-[10px]"} font-black text-envy-glow`}
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        +{row.gain}
                      </span>
                    ) : (
                      <span
                        className={`${compact ? "text-[8px]" : "text-[9px]"} text-muted-foreground/20`}
                      >
                        —
                      </span>
                    )}
                  </div>

                  {/* Net */}
                  <div className="text-center">
                    <span
                      className={`${compact ? "text-[9px]" : "text-[10px]"} font-black ${
                        net > 0
                          ? "text-envy-glow"
                          : net < 0
                          ? "text-wrath"
                          : "text-candle/30"
                      }`}
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {net > 0 ? `+${net}` : net === 0 ? "0" : `${net}`}
                    </span>
                  </div>
                </div>

                {/* Hover tooltip with details */}
                <div className="hidden group-hover:block absolute left-full top-0 ml-2 z-50 min-w-[140px]">
                  <div
                    className="rounded-md p-2 text-[8px] space-y-0.5"
                    style={{
                      background: "oklch(0.08 0.01 70 / 0.95)",
                      border: "1px solid oklch(0.75 0.12 70 / 0.2)",
                      boxShadow: "0 4px 16px oklch(0 0 0 / 0.5)",
                    }}
                  >
                    <div
                      className="font-bold text-candle/70 mb-1"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      Round {row.round} Breakdown
                    </div>
                    {row.painDetails.map((d, i) => (
                      <div key={`p-${i}`} className="flex justify-between text-wrath/80">
                        <span className="truncate mr-2">
                          {d.name}
                          {d.tick && (
                            <span className="text-candle/30 ml-0.5">
                              [{d.tick}]
                            </span>
                          )}
                        </span>
                        <span className="font-bold">-{d.value}</span>
                      </div>
                    ))}
                    {row.gainDetails.map((d, i) => (
                      <div key={`g-${i}`} className="flex justify-between text-envy-glow/80">
                        <span className="truncate mr-2">
                          {d.name}
                          {d.tick && (
                            <span className="text-candle/30 ml-0.5">
                              [{d.tick}]
                            </span>
                          )}
                        </span>
                        <span className="font-bold">+{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Total Row */}
          <div
            className="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-1 px-1 py-1.5 mt-0.5"
            style={{
              borderTop: "1px solid oklch(0.75 0.12 70 / 0.15)",
              background:
                "linear-gradient(90deg, oklch(0.12 0.02 70 / 0.3), transparent)",
            }}
          >
            <span
              className={`${compact ? "text-[7px]" : "text-[8px]"} font-black text-candle/60 uppercase`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              TOTAL
            </span>
            <div className="text-center">
              {totalPain > 0 && (
                <span
                  className={`${compact ? "text-[10px]" : "text-[11px]"} font-black text-wrath`}
                  style={{
                    fontFamily: "var(--font-heading)",
                    textShadow: "0 0 6px oklch(0.65 0.22 25 / 0.3)",
                  }}
                >
                  -{totalPain}
                </span>
              )}
            </div>
            <div className="text-center">
              {totalGain > 0 && (
                <span
                  className={`${compact ? "text-[10px]" : "text-[11px]"} font-black text-envy-glow`}
                  style={{
                    fontFamily: "var(--font-heading)",
                    textShadow: "0 0 6px oklch(0.60 0.18 155 / 0.3)",
                  }}
                >
                  +{totalGain}
                </span>
              )}
            </div>
            <div className="text-center">
              <span
                className={`${compact ? "text-[10px]" : "text-[11px]"} font-black ${
                  totalNet > 0
                    ? "text-envy-glow"
                    : totalNet < 0
                    ? "text-wrath"
                    : "text-candle/40"
                }`}
                style={{
                  fontFamily: "var(--font-heading)",
                  textShadow:
                    totalNet !== 0
                      ? `0 0 6px ${
                          totalNet > 0
                            ? "oklch(0.60 0.18 155 / 0.3)"
                            : "oklch(0.65 0.22 25 / 0.3)"
                        }`
                      : "none",
                }}
              >
                {totalNet > 0 ? `+${totalNet}` : totalNet === 0 ? "0" : `${totalNet}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
