/**
 * Profile — Player stats, rank tier, and sin win-rate rings.
 *
 * Data is read from localStorage (written by GameOverScreen).
 * Ranks: Novice Sinner → Corruption Initiate → Cardinal Sin → Archdevil → The Mortal Sin
 *
 * Route: /profile
 */

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useLocation } from "wouter";
import type { SinType } from "@shared/gameTypes";

const ALL_SINS: SinType[] = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];

const SIN_HEX: Record<SinType, string> = {
  wrath: "#e8200e",
  sloth: "#9055e8",
  greed: "#e8b80e",
  envy: "#15c840",
  pride: "#f0f0f0",
  lust: "#ee48a0",
  gluttony: "#c07020",
};

const SIN_LABEL: Record<SinType, string> = {
  wrath: "WRATH",
  sloth: "SLOTH",
  greed: "GREED",
  envy: "ENVY",
  pride: "PRIDE",
  lust: "LUST",
  gluttony: "GLUTTONY",
};

interface RankTier {
  name: string;
  minWins: number;
  color: string;
  description: string;
}

const RANK_TIERS: RankTier[] = [
  { name: "Novice Sinner",       minWins: 0,  color: "#888888", description: "Your corruption has just begun." },
  { name: "Corruption Initiate", minWins: 5,  color: "#b45309", description: "The darkness knows your name." },
  { name: "Cardinal Sin",        minWins: 15, color: "#7c3aed", description: "You have mastered the art of transgression." },
  { name: "Archdevil",           minWins: 30, color: "#e8b80e", description: "Lesser sinners tremble at your approach." },
  { name: "The Mortal Sin",      minWins: 50, color: "#e8200e", description: "You are the sin incarnate. Eternal. Devastating." },
];

function getRank(wins: number): RankTier {
  let rank = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (wins >= tier.minWins) rank = tier;
  }
  return rank;
}

function getNextRank(wins: number): RankTier | null {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (wins < RANK_TIERS[i].minWins) return RANK_TIERS[i];
  }
  return null;
}

// SVG circular progress ring
function WinRing({ sin, games, wins }: { sin: SinType; games: number; wins: number }) {
  const hex = SIN_HEX[sin];
  const winRate = games > 0 ? wins / games : 0;
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - winRate);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-14 h-14">
        <svg width="56" height="56" className="rotate-[-90deg]">
          {/* Track */}
          <circle cx="28" cy="28" r={r} fill="none" strokeWidth="4" stroke="oklch(0.18 0.015 30)" />
          {/* Progress */}
          <motion.circle
            cx="28" cy="28" r={r}
            fill="none"
            strokeWidth="4"
            stroke={hex}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 4px ${hex}88)` }}
          />
        </svg>
        {/* Win count in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-sm font-black"
            style={{ fontFamily: "var(--font-heading)", color: games > 0 ? hex : "#444" }}
          >
            {wins}
          </span>
        </div>
      </div>
      <span
        className="text-[9px] font-bold uppercase tracking-wider"
        style={{ fontFamily: "var(--font-heading)", color: games > 0 ? hex : "#444" }}
      >
        {SIN_LABEL[sin]}
      </span>
      {games > 0 && (
        <span className="text-[9px] text-foreground/30" style={{ fontFamily: "var(--font-heading)" }}>
          {games}g · {Math.round(winRate * 100)}%
        </span>
      )}
    </div>
  );
}

export default function Profile() {
  const [, setLocation] = useLocation();

  const stats = useMemo(() => {
    const totalGames = parseInt(localStorage.getItem("7sins_total_games") || "0", 10);
    const totalWins = parseInt(localStorage.getItem("7sins_total_wins") || "0", 10);
    const winStreak = parseInt(localStorage.getItem("7sins_win_streak") || "0", 10);

    const sinStats = ALL_SINS.map(sin => ({
      sin,
      games: parseInt(localStorage.getItem(`7sins_faction_${sin}`) || "0", 10),
      wins: parseInt(localStorage.getItem(`7sins_faction_${sin}_wins`) || "0", 10),
    }));

    const topSin = sinStats.reduce((best, s) => s.wins > best.wins ? s : best, sinStats[0]);

    return { totalGames, totalWins, winStreak, sinStats, topSin };
  }, []);

  const rank = getRank(stats.totalWins);
  const nextRank = getNextRank(stats.totalWins);
  const rankProgress = nextRank
    ? Math.min((stats.totalWins - rank.minWins) / (nextRank.minWins - rank.minWins), 1)
    : 1;
  const winRate = stats.totalGames > 0 ? Math.round((stats.totalWins / stats.totalGames) * 100) : 0;

  const isMaxRank = !nextRank;
  const isMortalSin = rank.name === "The Mortal Sin";

  return (
    <div className="min-h-screen bg-background noise-overlay">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-candle/15 bg-background/90 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="text-candle/60 hover:text-candle transition-colors text-sm font-bold uppercase tracking-wider"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            ← Back
          </button>
          <h1
            className="text-xl font-black tracking-[0.15em] uppercase"
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-candle)" }}
          >
            Profile
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Rank card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-6 relative overflow-hidden border"
          style={{
            background: `linear-gradient(135deg, oklch(0.12 0.02 30 / 0.9), oklch(0.09 0.015 30 / 0.95))`,
            borderColor: `${rank.color}44`,
            boxShadow: `0 0 30px ${rank.color}22`,
          }}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 20% 40%, ${rank.color}0d 0%, transparent 60%)` }}
          />

          <div className="relative">
            {/* Rank title */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <motion.h2
                  className={`text-2xl sm:text-3xl font-black tracking-wider uppercase ${isMortalSin ? "animate-pulse" : ""}`}
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: rank.color,
                    textShadow: `0 0 20px ${rank.color}66`,
                  }}
                >
                  {rank.name}
                </motion.h2>
                <p className="text-sm text-foreground/50 mt-1 italic" style={{ fontFamily: "var(--font-body)" }}>
                  {rank.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black" style={{ fontFamily: "var(--font-heading)", color: rank.color }}>
                  {stats.totalWins}
                </div>
                <div className="text-xs text-foreground/40 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                  wins
                </div>
              </div>
            </div>

            {/* Rank progress bar */}
            {!isMaxRank && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-foreground/40 mb-1.5" style={{ fontFamily: "var(--font-heading)" }}>
                  <span>{rank.name}</span>
                  <span>{nextRank!.name} ({nextRank!.minWins - stats.totalWins} wins away)</span>
                </div>
                <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${rankProgress * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                    style={{ background: `linear-gradient(90deg, ${rank.color}, ${nextRank!.color})` }}
                  />
                </div>
              </div>
            )}
            {isMaxRank && (
              <div className="text-xs font-bold uppercase tracking-widest mb-4 text-center"
                style={{ fontFamily: "var(--font-heading)", color: rank.color }}>
                ✦ Maximum Rank Achieved ✦
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/20">
              <div className="text-center">
                <div className="text-xl font-black text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                  {stats.totalGames}
                </div>
                <div className="text-xs text-foreground/40 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                  Games
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-black" style={{ fontFamily: "var(--font-heading)", color: "oklch(0.6 0.2 155)" }}>
                  {winRate}%
                </div>
                <div className="text-xs text-foreground/40 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                  Win Rate
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-black text-candle" style={{ fontFamily: "var(--font-heading)" }}>
                  {stats.winStreak}
                </div>
                <div className="text-xs text-foreground/40 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                  Streak
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sin win-rate rings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl p-5 border"
          style={{
            background: "oklch(0.12 0.02 30 / 0.8)",
            borderColor: "oklch(0.25 0.02 30 / 0.5)",
          }}
        >
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/60 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Sin Mastery
          </h3>
          <div className="flex gap-4 flex-wrap justify-center">
            {stats.sinStats.map(({ sin, games, wins }) => (
              <WinRing key={sin} sin={sin} games={games} wins={wins} />
            ))}
          </div>
          {stats.sinStats.every(s => s.games === 0) && (
            <p className="text-center text-foreground/30 text-sm italic mt-4" style={{ fontFamily: "var(--font-body)" }}>
              No games played yet. Enter the arena to forge your legacy.
            </p>
          )}
        </motion.div>

        {/* All rank tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl p-5 border"
          style={{ background: "oklch(0.12 0.02 30 / 0.8)", borderColor: "oklch(0.25 0.02 30 / 0.5)" }}
        >
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/60 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Rank Tiers
          </h3>
          <div className="space-y-2">
            {RANK_TIERS.map((tier, i) => {
              const isCurrentRank = tier.name === rank.name;
              const isUnlocked = stats.totalWins >= tier.minWins;
              return (
                <div
                  key={tier.name}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all"
                  style={{
                    background: isCurrentRank ? `${tier.color}14` : "transparent",
                    border: `1px solid ${isCurrentRank ? tier.color + "44" : "transparent"}`,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: isUnlocked ? tier.color : "#333",
                      boxShadow: isCurrentRank ? `0 0 8px ${tier.color}` : "none",
                    }}
                  />
                  <div className="flex-1">
                    <span
                      className="text-sm font-bold"
                      style={{
                        fontFamily: "var(--font-heading)",
                        color: isUnlocked ? tier.color : "#555",
                      }}
                    >
                      {tier.name}
                    </span>
                    {isCurrentRank && (
                      <span className="ml-2 text-xs opacity-60" style={{ fontFamily: "var(--font-heading)", color: tier.color }}>
                        ← current
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-foreground/30" style={{ fontFamily: "var(--font-heading)" }}>
                    {tier.minWins}+ wins
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setLocation("/deck-builder")}
            className="px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all border border-candle/20 text-candle/70 hover:text-candle hover:border-candle/40 hover:bg-candle/5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Deck Builder
          </button>
          <button
            onClick={() => setLocation("/")}
            className="px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all bg-wrath/20 border border-wrath/40 text-wrath hover:bg-wrath/30"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Play Now
          </button>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
