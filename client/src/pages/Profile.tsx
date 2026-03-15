/**
 * Profile — Player stats, rank tier, and sin win-rate rings.
 *
 * Data is read from localStorage (written by GameOverScreen).
 * Ranks: Novice Sinner → Corruption Initiate → Cardinal Sin → Archdevil → The Mortal Sin
 *
 * Octalysis CD2 (Development & Accomplishment):
 * Visible progression through rank tiers creates a sense of growth.
 * Win-rate rings per faction encourage mastery of multiple sins.
 * CD4 (Ownership & Possession): Your stats, your identity, your journey.
 *
 * Route: /profile
 */
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
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
  for (const tier of RANK_TIERS) {
    if (wins < tier.minWins) return tier;
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
          <circle
            cx="28" cy="28" r={r}
            fill="none" strokeWidth="4"
            stroke={hex}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-out", filter: `drop-shadow(0 0 4px ${hex}66)` }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-[11px] font-black"
          style={{ color: hex, fontFamily: "var(--font-heading)" }}
        >
          {games > 0 ? `${Math.round(winRate * 100)}%` : "—"}
        </span>
      </div>
      <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: hex, fontFamily: "var(--font-heading)" }}>
        {SIN_LABEL[sin]}
      </span>
      <span className="text-[9px] text-white/40">
        {wins}W / {games}G
      </span>
    </div>
  );
}

interface PlayerStats {
  totalGames: number;
  totalWins: number;
  sinStats: Record<SinType, { games: number; wins: number }>;
  totalDamageDealt: number;
  totalHealingDone: number;
  totalShieldApplied: number;
  longestWinStreak: number;
  currentWinStreak: number;
}

function loadStats(): PlayerStats {
  const defaults: PlayerStats = {
    totalGames: 0,
    totalWins: 0,
    sinStats: Object.fromEntries(ALL_SINS.map(s => [s, { games: 0, wins: 0 }])) as Record<SinType, { games: number; wins: number }>,
    totalDamageDealt: 0,
    totalHealingDone: 0,
    totalShieldApplied: 0,
    longestWinStreak: 0,
    currentWinStreak: 0,
  };
  try {
    const raw = localStorage.getItem("7sins_profile_stats");
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const stats = useMemo(() => loadStats(), []);
  const rank = getRank(stats.totalWins);
  const nextRank = getNextRank(stats.totalWins);
  const progressToNext = nextRank
    ? ((stats.totalWins - rank.minWins) / (nextRank.minWins - rank.minWins)) * 100
    : 100;

  // Find most played and best sin
  const mostPlayed = ALL_SINS.reduce((best, sin) =>
    stats.sinStats[sin].games > stats.sinStats[best].games ? sin : best, ALL_SINS[0]);
  const bestSin = ALL_SINS.reduce((best, sin) => {
    const bRate = stats.sinStats[best].games > 0 ? stats.sinStats[best].wins / stats.sinStats[best].games : 0;
    const sRate = stats.sinStats[sin].games > 0 ? stats.sinStats[sin].wins / stats.sinStats[sin].games : 0;
    return sRate > bRate ? sin : best;
  }, ALL_SINS[0]);

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/30">
        <div className="container max-w-4xl py-4 flex items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="text-sm text-white/50 hover:text-white/80 transition-colors"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            ← Back
          </button>
          <h1
            className="text-lg font-black tracking-widest uppercase"
            style={{ fontFamily: "var(--font-heading)", color: rank.color }}
          >
            Sinner Profile
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="container max-w-4xl py-8 space-y-8">
        {/* Rank Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6"
        >
          <div className="absolute top-0 right-0 w-48 h-48 opacity-10"
            style={{ background: `radial-gradient(circle, ${rank.color} 0%, transparent 70%)` }}
          />
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center text-2xl font-black"
              style={{ borderColor: rank.color, color: rank.color, fontFamily: "var(--font-heading)" }}
            >
              {stats.totalWins}
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Current Rank</p>
              <h2 className="text-2xl font-black tracking-wider" style={{ fontFamily: "var(--font-heading)", color: rank.color }}>
                {rank.name}
              </h2>
              <p className="text-sm text-white/50 italic mt-1">{rank.description}</p>
              {user && (
                <p className="text-xs text-white/30 mt-2">{user.name}</p>
              )}
            </div>
          </div>

          {/* Progress to next rank */}
          {nextRank && (
            <div className="mt-6">
              <div className="flex justify-between text-[10px] text-white/40 mb-1">
                <span>{rank.name}</span>
                <span>{nextRank.name} ({nextRank.minWins - stats.totalWins} wins to go)</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{ backgroundColor: rank.color }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Overall Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { label: "Games Played", value: stats.totalGames, color: "#888" },
            { label: "Total Wins", value: stats.totalWins, color: rank.color },
            { label: "Win Rate", value: stats.totalGames > 0 ? `${Math.round((stats.totalWins / stats.totalGames) * 100)}%` : "—", color: "#e8b80e" },
            { label: "Win Streak", value: stats.longestWinStreak, color: "#e8200e" },
          ].map((stat, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
              <p className="text-[9px] text-white/40 uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="text-2xl font-black" style={{ fontFamily: "var(--font-heading)", color: stat.color }}>
                {stat.value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Lifetime Combat Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
        >
          <h3 className="text-xs font-bold tracking-widest uppercase text-white/40 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Lifetime Combat
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-black text-red-400" style={{ fontFamily: "var(--font-heading)" }}>
                {stats.totalDamageDealt}
              </p>
              <p className="text-[9px] text-white/40 uppercase tracking-wider mt-1">Damage Dealt</p>
            </div>
            <div>
              <p className="text-xl font-black text-green-400" style={{ fontFamily: "var(--font-heading)" }}>
                {stats.totalHealingDone}
              </p>
              <p className="text-[9px] text-white/40 uppercase tracking-wider mt-1">Healing Done</p>
            </div>
            <div>
              <p className="text-xl font-black text-blue-400" style={{ fontFamily: "var(--font-heading)" }}>
                {stats.totalShieldApplied}
              </p>
              <p className="text-[9px] text-white/40 uppercase tracking-wider mt-1">Shield Applied</p>
            </div>
          </div>
          {stats.totalGames > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-center gap-8 text-center">
              <div>
                <p className="text-sm font-bold" style={{ color: SIN_HEX[mostPlayed] }}>{SIN_LABEL[mostPlayed]}</p>
                <p className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5">Most Played</p>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: SIN_HEX[bestSin] }}>{SIN_LABEL[bestSin]}</p>
                <p className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5">Best Win Rate</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Sin Win-Rate Rings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
        >
          <h3 className="text-xs font-bold tracking-widest uppercase text-white/40 mb-6" style={{ fontFamily: "var(--font-heading)" }}>
            Sin Mastery
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            {ALL_SINS.map(sin => (
              <WinRing
                key={sin}
                sin={sin}
                games={stats.sinStats[sin].games}
                wins={stats.sinStats[sin].wins}
              />
            ))}
          </div>
        </motion.div>

        {/* Rank Tiers Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
        >
          <h3 className="text-xs font-bold tracking-widest uppercase text-white/40 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Rank Tiers
          </h3>
          <div className="space-y-3">
            {RANK_TIERS.map((tier, i) => (
              <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${tier.name === rank.name ? 'bg-white/5 border border-white/10' : ''}`}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.color }} />
                <span className="text-sm font-bold" style={{ color: tier.color, fontFamily: "var(--font-heading)" }}>
                  {tier.name}
                </span>
                <span className="text-xs text-white/30 ml-auto">{tier.minWins}+ wins</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
