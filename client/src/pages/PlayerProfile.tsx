/**
 * PlayerProfile — Public player profile page.
 *
 * Displays a player's community presence: gamertag, published decks,
 * total likes received, match history, and overall win rate.
 *
 * Route: /player/:gamertag
 *
 * Octalysis CD2 (Development & Accomplishment):
 *   Visible stats create a sense of progression and mastery.
 * CD5 (Social Influence & Relatedness):
 *   Public profiles encourage social comparison and mentorship.
 * CD4 (Ownership & Possession):
 *   "My profile, my decks, my record" — identity anchoring.
 *
 * UX: Microinteractions on tab switches, staggered card animations,
 * empty-state illustrations, and responsive mobile-first layout.
 */
import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import type { SinType } from "@shared/gameTypes";
import { encodeDeck } from "@/lib/deckCodes";
import { useSupabaseAuth } from "@/contexts/AuthContext";
import { usePageMeta } from "@/hooks/usePageMeta";

// ─── Constants ──────────────────────────────────────────────
const SINS: SinType[] = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];
const SIN_COLORS: Record<SinType, string> = {
  wrath: "#ef4444", sloth: "#a855f7", greed: "#eab308",
  envy: "#22c55e", pride: "#e2e2e2", lust: "#ec4899", gluttony: "#f97316",
};
const SIN_LABELS: Record<SinType, string> = {
  wrath: "Wrath", sloth: "Sloth", greed: "Greed",
  envy: "Envy", pride: "Pride", lust: "Lust", gluttony: "Gluttony",
};

// Rank tiers (same as Profile.tsx for consistency)
const RANK_TIERS = [
  { name: "Novice Sinner",       minWins: 0,  color: "#888888", icon: "☠" },
  { name: "Corruption Initiate", minWins: 5,  color: "#b45309", icon: "🔥" },
  { name: "Cardinal Sin",        minWins: 15, color: "#7c3aed", icon: "⚔" },
  { name: "Archdevil",           minWins: 30, color: "#eab308", icon: "👑" },
  { name: "The Mortal Sin",      minWins: 50, color: "#ef4444", icon: "💀" },
];

function getRank(wins: number) {
  let rank = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (wins >= tier.minWins) rank = tier;
  }
  return rank;
}

// ─── tRPC Fetch Helpers ─────────────────────────────────────
async function trpcQuery(path: string, input?: unknown) {
  const params = input !== undefined
    ? `?input=${encodeURIComponent(JSON.stringify({ json: input }))}`
    : "";
  const res = await fetch(`/api/trpc/${path}${params}`);
  const data = await res.json();
  if (data?.result?.data?.json !== undefined) return data.result.data.json;
  if (data?.result?.data !== undefined) return data.result.data;
  throw new Error(data?.error?.json?.message || "Request failed");
}

// ─── Types ──────────────────────────────────────────────────
interface PlayerProfileData {
  playerId: string;
  gamertag: string | null;
  joinedAt: string;
  decksPublished: number;
  totalLikesReceived: number;
  matchesPlayed: number;
  matchesWon: number;
  overallWinRate: number;
}

interface CommunityDeck {
  id: number;
  playerId: string;
  gamertag: string;
  deckName: string;
  faction: string;
  cardIds: string;
  strategy: string;
  likes: number;
  createdAt: string;
}

interface MatchHistoryEntry {
  id: number;
  deckId: number;
  playerId: string;
  result: "win" | "loss";
  opponentFaction: string;
  createdAt: string;
  deckName?: string;
  faction?: string;
}

type Tab = "decks" | "matches" | "stats";

// ─── Stat Card Component ────────────────────────────────────
function StatCard({ label, value, color, delay }: { label: string; value: string | number; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="bg-zinc-800/60 border border-zinc-700/40 rounded-lg p-4 text-center"
    >
      <div className="text-2xl font-bold font-mono" style={{ color }}>{value}</div>
      <div className="text-zinc-500 text-xs mt-1 uppercase tracking-wider">{label}</div>
    </motion.div>
  );
}

// ─── Win Rate Ring (SVG) ────────────────────────────────────
function WinRateRing({ winRate, size = 80, strokeWidth = 6 }: { winRate: number; size?: number; strokeWidth?: number }) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - winRate / 100);
  const color = winRate >= 60 ? "#22c55e" : winRate >= 45 ? "#eab308" : "#ef4444";

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="#27272a" strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
      <text
        x={size / 2} y={size / 2}
        textAnchor="middle" dominantBaseline="central"
        className="fill-white text-sm font-bold transform rotate-90"
        style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
      >
        {winRate}%
      </text>
    </svg>
  );
}

// ─── Deck Card (mini version for profile) ───────────────────
function ProfileDeckCard({ deck, winRate, onImport }: {
  deck: CommunityDeck;
  winRate?: { wins: number; losses: number; total: number; winRate: number };
  onImport: (deck: CommunityDeck) => void;
}) {
  const faction = deck.faction as SinType;
  const sinColor = SIN_COLORS[faction] || "#888";
  const createdDate = new Date(deck.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-800/50 border border-zinc-700/40 rounded-lg overflow-hidden hover:border-zinc-600/60 transition-colors group"
    >
      {/* Faction color bar */}
      <div className="h-1" style={{ backgroundColor: sinColor }} />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <img src={SIN_ARCHETYPE_ICONS[faction]} alt="Sin faction icon" className="w-8 h-8 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-sm truncate">{deck.deckName}</h4>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
              <span className="capitalize">{deck.faction}</span>
              <span className="text-zinc-700">&middot;</span>
              <span>{createdDate}</span>
            </div>
          </div>
          {/* Win rate badge */}
          {winRate && winRate.total >= 3 && (
            <div
              className="text-xs font-mono font-bold px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${winRate.winRate >= 60 ? "#22c55e" : winRate.winRate >= 45 ? "#eab308" : "#ef4444"}18`,
                color: winRate.winRate >= 60 ? "#22c55e" : winRate.winRate >= 45 ? "#eab308" : "#ef4444",
              }}
            >
              {winRate.winRate}% WR
            </div>
          )}
        </div>
        {deck.strategy && (
          <p className="text-zinc-400 text-xs mt-2 line-clamp-2 leading-relaxed">{deck.strategy}</p>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-700/30">
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
              {deck.likes}
            </span>
            {winRate && winRate.total > 0 && (
              <span>{winRate.total} match{winRate.total !== 1 ? "es" : ""}</span>
            )}
          </div>
          <button
            onClick={() => onImport(deck)}
            className="text-xs text-amber-400/80 hover:text-amber-300 transition-colors font-medium"
          >
            Import Deck &rarr;
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Match History Row ──────────────────────────────────────
function MatchRow({ match, idx }: { match: MatchHistoryEntry; idx: number }) {
  const isWin = match.result === "win";
  const oppFaction = match.opponentFaction as SinType;
  const oppColor = SIN_COLORS[oppFaction] || "#888";
  const deckFaction = (match.faction || "wrath") as SinType;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.03, duration: 0.25 }}
      className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-zinc-800/40 transition-colors"
    >
      {/* Result indicator */}
      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 ${isWin ? "bg-emerald-400" : "bg-red-400"}`}
        title={isWin ? "Victory" : "Defeat"}
      />
      {/* Deck info */}
      <img src={SIN_ARCHETYPE_ICONS[deckFaction]} alt="Sin faction icon" className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-white text-sm truncate block">{match.deckName || "Unknown Deck"}</span>
      </div>
      {/* vs Opponent */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
        <span>vs</span>
        <img src={SIN_ARCHETYPE_ICONS[oppFaction]} alt="" aria-hidden="true" className="w-4 h-4" />
        <span className="capitalize" style={{ color: oppColor }}>{match.opponentFaction}</span>
      </div>
      {/* Result label */}
      <span className={`text-xs font-bold uppercase tracking-wider ${isWin ? "text-emerald-400" : "text-red-400"}`}>
        {isWin ? "WIN" : "LOSS"}
      </span>
      {/* Date */}
      <span className="text-zinc-600 text-[10px] flex-shrink-0">
        {new Date(match.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </span>
    </motion.div>
  );
}

// ─── Faction Breakdown Chart ────────────────────────────────
function FactionBreakdown({ matches }: { matches: MatchHistoryEntry[] }) {
  const factionStats = useMemo(() => {
    const stats: Record<string, { wins: number; losses: number }> = {};
    for (const m of matches) {
      const f = m.faction || "unknown";
      if (!stats[f]) stats[f] = { wins: 0, losses: 0 };
      if (m.result === "win") stats[f].wins++;
      else stats[f].losses++;
    }
    return Object.entries(stats)
      .map(([faction, s]) => ({
        faction: faction as SinType,
        wins: s.wins,
        losses: s.losses,
        total: s.wins + s.losses,
        winRate: s.wins + s.losses > 0 ? Math.round((s.wins / (s.wins + s.losses)) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [matches]);

  if (factionStats.length === 0) return null;

  const maxTotal = Math.max(...factionStats.map(s => s.total));

  return (
    <div className="space-y-3">
      <h4 className="text-zinc-400 text-xs uppercase tracking-wider font-medium">Faction Performance</h4>
      {factionStats.map((s) => {
        const color = SIN_COLORS[s.faction] || "#888";
        const barWidth = maxTotal > 0 ? (s.total / maxTotal) * 100 : 0;
        return (
          <div key={s.faction} className="flex items-center gap-3">
            <img src={SIN_ARCHETYPE_ICONS[s.faction]} alt="Sin faction icon" className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-xs capitalize">{s.faction}</span>
                <span className="text-zinc-500 text-[10px]">
                  {s.wins}W / {s.losses}L &middot; {s.winRate}%
                </span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
export default function PlayerProfile() {
  usePageMeta({
    title: "Player Profile",
    description: "View player statistics, match history, and faction preferences in the 7 Deadly Sins Card Game.",
  });

  const params = useParams<{ gamertag: string }>();
  const [, navigate] = useLocation();
  const { user } = useSupabaseAuth();
  const gamertag = params.gamertag || "";

  // State
  const [profile, setProfile] = useState<PlayerProfileData | null>(null);
  const [decks, setDecks] = useState<CommunityDeck[]>([]);
  const [matches, setMatches] = useState<MatchHistoryEntry[]>([]);
  const [winRates, setWinRates] = useState<Record<number, { wins: number; losses: number; total: number; winRate: number }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("decks");
  const [importedDeckId, setImportedDeckId] = useState<number | null>(null);

  // Is this the current user's own profile?
  const isOwnProfile = user?.id && profile?.playerId === user.id;

  // Load profile data
  useEffect(() => {
    if (!gamertag) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Step 1: Resolve gamertag to player ID
        const playerLookup = await trpcQuery("profile.byGamertag", { gamertag });
        if (!playerLookup) {
          setError("Player not found");
          setLoading(false);
          return;
        }
        const playerId = playerLookup.id;

        // Step 2: Load profile, decks, and matches in parallel
        const [profileData, decksData, matchesData] = await Promise.all([
          trpcQuery("profile.get", { playerId }),
          trpcQuery("profile.decks", { playerId }),
          trpcQuery("profile.matchHistory", { playerId, limit: 30 }),
        ]);

        if (cancelled) return;

        setProfile(profileData);
        setDecks(decksData || []);
        setMatches(matchesData || []);

        // Step 3: Load win rates for all decks
        const deckIds = (decksData || []).map((d: CommunityDeck) => d.id);
        if (deckIds.length > 0) {
          const rates = await trpcQuery("community.batchWinRates", { deckIds });
          if (!cancelled) setWinRates(rates || {});
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [gamertag]);

  // Import deck handler
  const handleImport = useCallback((deck: CommunityDeck) => {
    try {
      const cardIds = JSON.parse(deck.cardIds);
      const code = encodeDeck(deck.faction as SinType, cardIds);
      localStorage.setItem("7sins_import_deck", JSON.stringify({
        code,
        faction: deck.faction,
        name: `${deck.deckName} (by ${deck.gamertag})`,
        source: "community",
      }));
      setImportedDeckId(deck.id);
      setTimeout(() => setImportedDeckId(null), 2000);
    } catch {
      // Fallback: navigate to deck builder
      navigate("/deck-builder");
    }
  }, [navigate]);

  // ─── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-page-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
          <p className="text-zinc-500 text-sm mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ─── Error / Not Found State ────────────────────────────────
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[var(--color-page-bg)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="text-5xl mb-4">👤</div>
          <h2 className="text-white text-xl font-bold mb-2">Player Not Found</h2>
          <p className="text-zinc-400 text-sm mb-6">
            No player with the gamertag <span className="text-amber-400 font-mono">"{gamertag}"</span> exists.
          </p>
          <button
            onClick={() => navigate("/community")}
            className="px-4 py-2 bg-amber-500/15 text-amber-400 rounded-lg text-sm hover:bg-amber-500/25 transition-colors"
          >
            &larr; Back to Community
          </button>
        </motion.div>
      </div>
    );
  }

  const rank = getRank(profile.matchesWon);
  const joinDate = new Date(profile.joinedAt).toLocaleDateString("en-US", {
    month: "long", year: "numeric",
  });

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "decks", label: "Decks", count: decks.length },
    { id: "matches", label: "Matches", count: matches.length },
    { id: "stats", label: "Stats" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)]">
      {/* Back navigation */}
      <div className="sticky top-0 z-20 bg-[var(--color-page-bg)]/90 backdrop-blur-sm border-b border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/community")}
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Community
          </button>
          <span className="text-zinc-700">/</span>
          <span className="text-amber-400/80 font-mono text-sm">{profile.gamertag || "Anonymous"}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ─── Profile Header ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8"
        >
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${rank.color}30, ${rank.color}10)`,
              border: `2px solid ${rank.color}40`,
              color: rank.color,
            }}
          >
            {profile.gamertag ? profile.gamertag[0].toUpperCase() : "?"}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <h1 className="text-white text-2xl font-bold font-mono">
                {profile.gamertag || "Anonymous"}
              </h1>
              {isOwnProfile && (
                <span className="text-[10px] uppercase tracking-wider text-amber-400/60 bg-amber-400/10 px-2 py-0.5 rounded">
                  You
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start mt-1.5">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: rank.color }}>
                {rank.icon} {rank.name}
              </span>
              <span className="text-zinc-700">&middot;</span>
              <span className="text-zinc-500 text-xs">Joined {joinDate}</span>
            </div>
          </div>

          {/* Win rate ring (desktop) */}
          {profile.matchesPlayed >= 3 && (
            <div className="hidden sm:flex flex-col items-center gap-1">
              <WinRateRing winRate={profile.overallWinRate} />
              <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Win Rate</span>
            </div>
          )}
        </motion.div>

        {/* ─── Quick Stats Row ─────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Decks Published" value={profile.decksPublished} color="#eab308" delay={0.1} />
          <StatCard label="Total Likes" value={profile.totalLikesReceived} color="#ec4899" delay={0.15} />
          <StatCard label="Matches Played" value={profile.matchesPlayed} color="#a855f7" delay={0.2} />
          <StatCard label="Matches Won" value={profile.matchesWon} color="#22c55e" delay={0.25} />
        </div>

        {/* ─── Tab Navigation ──────────────────────────────── */}
        <div className="flex items-center gap-1 mb-6 border-b border-zinc-800/50 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors flex-shrink-0 ${
                activeTab === tab.id
                  ? "text-amber-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-1.5 text-[10px] ${activeTab === tab.id ? "text-amber-400/60" : "text-zinc-600"}`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="profile-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* ─── Tab Content ─────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === "decks" && (
            <motion.div
              key="decks"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {decks.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-3 opacity-40">📦</div>
                  <p className="text-zinc-500 text-sm">No published decks yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {decks.map((deck) => (
                    <ProfileDeckCard
                      key={deck.id}
                      deck={deck}
                      winRate={winRates[deck.id]}
                      onImport={handleImport}
                    />
                  ))}
                </div>
              )}
              {/* Import success toast */}
              <AnimatePresence>
                {importedDeckId && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg text-sm z-50"
                  >
                    Deck code copied! Open Deck Builder to import.
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === "matches" && (
            <motion.div
              key="matches"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {matches.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-3 opacity-40">⚔</div>
                  <p className="text-zinc-500 text-sm">No match history recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {matches.map((match, idx) => (
                    <MatchRow key={match.id} match={match} idx={idx} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Win rate ring (mobile) + overall stats */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {profile.matchesPlayed >= 3 ? (
                  <>
                    <WinRateRing winRate={profile.overallWinRate} size={120} strokeWidth={8} />
                    <div className="text-center sm:text-left">
                      <div className="text-white text-lg font-bold">
                        {profile.overallWinRate}% Overall Win Rate
                      </div>
                      <div className="text-zinc-500 text-sm mt-1">
                        {profile.matchesWon} wins out of {profile.matchesPlayed} matches
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 w-full">
                    <div className="text-4xl mb-3 opacity-40">📊</div>
                    <p className="text-zinc-500 text-sm">
                      Play at least 3 matches to see detailed stats.
                    </p>
                  </div>
                )}
              </div>

              {/* Faction breakdown */}
              {matches.length > 0 && <FactionBreakdown matches={matches} />}

              {/* Deck performance summary */}
              {decks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-zinc-400 text-xs uppercase tracking-wider font-medium">Deck Performance</h4>
                  <div className="space-y-2">
                    {decks.map((deck) => {
                      const wr = winRates[deck.id];
                      const faction = deck.faction as SinType;
                      return (
                        <div key={deck.id} className="flex items-center gap-3 py-2 px-3 bg-zinc-800/30 rounded-lg">
                          <img src={SIN_ARCHETYPE_ICONS[faction]} alt="" aria-hidden="true" className="w-5 h-5" />
                          <span className="text-white text-sm flex-1 truncate">{deck.deckName}</span>
                          <span className="flex items-center gap-1 text-xs text-zinc-500">
                            <svg className="w-3 h-3 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                            </svg>
                            {deck.likes}
                          </span>
                          {wr && wr.total > 0 ? (
                            <span
                              className="text-xs font-mono font-bold"
                              style={{
                                color: wr.winRate >= 60 ? "#22c55e" : wr.winRate >= 45 ? "#eab308" : "#ef4444",
                              }}
                            >
                              {wr.winRate}% ({wr.total})
                            </span>
                          ) : (
                            <span className="text-zinc-600 text-xs">No data</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
