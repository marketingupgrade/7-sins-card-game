/**
 * GameOverScreen — AAA cinematic post-game screen
 *
 * Full-screen dark fantasy results with:
 * - Faction portrait background with parallax & vignette
 * - Dramatic animated stat reveals
 * - Battle Chronicle as parchment scroll
 * - Discord + WhatsApp share buttons
 * - Responsive for desktop & mobile
 */

import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { RotateCcw, BookOpen, Loader2, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ICON_URLS } from "@/lib/assetUrls";
import type { PlayerState, GameLogEntry, SinType } from "@shared/gameTypes";
import { CARD_MAP } from "@shared/cardData";
import { getGameLog } from "@/lib/gameEngine";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import { FACTION_PORTRAITS_HD } from "@/lib/factionPortraits";
const VictoryConfetti = lazy(() => import("./VictoryConfetti"));

interface GameOverScreenProps {
  players: PlayerState[];
  winnerId: string | null;
  currentPlayerId: string;
  currentRound: number;
  gameId?: string;
  onRematch?: () => void;
}

const SIN_COLORS: Record<string, string> = {
  wrath: "#ef4444",
  sloth: "#a855f7",
  greed: "#eab308",
  envy: "#22c55e",
  pride: "#f0f0f0",
  lust: "#ec4899",
  gluttony: "#b45309",
};

const SIN_GLOW: Record<string, string> = {
  wrath: "0 0 80px rgba(239,68,68,0.4), 0 0 160px rgba(239,68,68,0.15)",
  sloth: "0 0 80px rgba(168,85,247,0.4), 0 0 160px rgba(168,85,247,0.15)",
  greed: "0 0 80px rgba(234,179,8,0.4), 0 0 160px rgba(234,179,8,0.15)",
  envy: "0 0 80px rgba(34,197,94,0.4), 0 0 160px rgba(34,197,94,0.15)",
  pride: "0 0 80px rgba(240,240,240,0.3), 0 0 160px rgba(240,240,240,0.1)",
  lust: "0 0 80px rgba(236,72,153,0.4), 0 0 160px rgba(236,72,153,0.15)",
  gluttony: "0 0 80px rgba(180,83,9,0.4), 0 0 160px rgba(180,83,9,0.15)",
};

const STREAK_NARRATOR: Record<number, string> = {
  1: "A win. Don't let it go to your head.",
  2: "Two in a row? Someone's feeling dangerous.",
  3: "Three-peat. The other sins are getting nervous.",
  4: "Four wins. You're becoming the final boss.",
  5: "FIVE. At this point, you ARE the deadly sin.",
};

function getStreakComment(streak: number): string {
  if (streak <= 0) return "";
  if (streak >= 5) return STREAK_NARRATOR[5];
  return STREAK_NARRATOR[streak] || `${streak} wins in a row. Impressive.`;
}

interface PostGameStats {
  cardsPlayed: number;
  totalDamageDealt: number;
  totalHealingDone: number;
  totalShieldApplied: number;
  compoundingEffectsUsed: number;
  catchupsTriggered: number;
  mvpMoment: string;
}

function parseEffectString(eff: string): { type: string; value: number } | null {
  if (typeof eff !== 'string') {
    if (eff && typeof eff === 'object' && 'type' in eff && 'value' in eff) {
      return { type: (eff as any).type, value: Number((eff as any).value) || 0 };
    }
    return null;
  }
  const catchupMatch = eff.match(/CATCH-UP bonus (\w+) (\d+)/);
  if (catchupMatch) return { type: catchupMatch[1], value: parseInt(catchupMatch[2], 10) };
  const match = eff.match(/^(\w+(?:_\w+)?) (\d+) on/);
  if (match) return { type: match[1], value: parseInt(match[2], 10) };
  return null;
}

function computePostGameStats(logEntries: any[], currentPlayerId: string, players: PlayerState[]): PostGameStats {
  const stats: PostGameStats = {
    cardsPlayed: 0, totalDamageDealt: 0, totalHealingDone: 0,
    totalShieldApplied: 0, compoundingEffectsUsed: 0, catchupsTriggered: 0, mvpMoment: "",
  };
  let biggestHit = 0;
  let biggestHitCard = "";

  const currentPlayerObj = players.find(p => p.id === currentPlayerId);
  const matchIds = new Set<string>();
  matchIds.add(currentPlayerId);
  if (currentPlayerObj?.gamePlayerId) matchIds.add(currentPlayerObj.gamePlayerId);

  for (const entry of logEntries) {
    if (!matchIds.has(entry.player_id)) continue;
    const data = typeof entry.action_data === "string" ? JSON.parse(entry.action_data) : entry.action_data;
    if (entry.action_type === "play_card") {
      stats.cardsPlayed++;
      const cardId = data.card_id || data.cardId;
      const card = cardId ? CARD_MAP[cardId] : null;
      if (card?.compoundPattern) stats.compoundingEffectsUsed++;
      const effects = data.effects || [];
      for (const eff of effects) {
        const parsed = parseEffectString(eff);
        if (!parsed) continue;
        if (parsed.type === "damage" || parsed.type === "self_damage" || parsed.type === "affliction_amplify") {
          stats.totalDamageDealt += parsed.value;
          if (parsed.value > biggestHit) { biggestHit = parsed.value; biggestHitCard = card?.name || "Unknown"; }
        }
        if (parsed.type === "heal_gain" || parsed.type === "heal_steal" || parsed.type === "heal") stats.totalHealingDone += parsed.value;
        if (parsed.type === "shield_gain" || parsed.type === "shield_steal" || parsed.type === "shield") stats.totalShieldApplied += parsed.value;
      }
      for (const eff of effects) {
        if (typeof eff === 'string' && eff.includes('CATCH-UP')) stats.catchupsTriggered++;
      }
    }
    if (entry.action_type === "catchup_triggered") stats.catchupsTriggered++;
  }

  if (stats.cardsPlayed === 0) {
    const me = players.find(p => p.id === currentPlayerId);
    if (me) stats.cardsPlayed = Math.max(0, 12 - me.hand.length - me.deckSize - me.discardSize);
  }
  if (stats.totalDamageDealt === 0 && stats.cardsPlayed > 0) {
    const opponents = players.filter(p => p.id !== currentPlayerId);
    let totalHpLost = 0;
    for (const opp of opponents) totalHpLost += Math.max(0, opp.maxHp - opp.currentHp);
    stats.totalDamageDealt = Math.round(totalHpLost / (opponents.length || 1));
  }

  if (biggestHit > 0) stats.mvpMoment = `${biggestHitCard} dealt ${biggestHit} damage in a single hit!`;
  else if (stats.totalHealingDone > 10) stats.mvpMoment = `Healed ${stats.totalHealingDone} HP — the cockroach strategy.`;
  else if (stats.compoundingEffectsUsed > 2) stats.mvpMoment = `${stats.compoundingEffectsUsed} stacking effects — patience is a virtue (and a weapon).`;
  else if (stats.cardsPlayed > 0) stats.mvpMoment = `Played ${stats.cardsPlayed} cards across the battle. Every sin counts.`;
  else stats.mvpMoment = "Survived the arena. That counts for something.";

  return stats;
}

function generateBattleChronicle(
  players: PlayerState[], currentPlayerId: string, isWinner: boolean,
  winner: PlayerState | undefined, currentRound: number, stats: PostGameStats
): string {
  const me = players.find(p => p.id === currentPlayerId);
  const mySin = me?.chosenSin || 'wrath';
  const myName = me?.username || 'You';
  const winnerName = winner?.username || 'Unknown';
  const winnerSin = winner?.chosenSin || 'wrath';
  const eliminated = players.filter(p => !p.isAlive).length;

  const sinVerbs: Record<string, string> = {
    wrath: 'burned through the arena', sloth: 'slowly drained the life from all who opposed',
    greed: 'hoarded power and crushed the competition', envy: 'stole victory from the jaws of defeat',
    pride: 'stood untouchable above all challengers', lust: 'seduced fate itself',
    gluttony: 'consumed everything in sight',
  };

  if (isWinner) {
    if (currentRound >= 20) {
      return `After 20 rounds of relentless combat, ${myName} ${sinVerbs[mySin] || 'prevailed'}. ${eliminated} sinners fell along the way, but your ${mySin.toUpperCase()} endured where others crumbled. ${stats.totalDamageDealt > 30 ? `With ${stats.totalDamageDealt} total damage dealt, you carved your name into the annals of damnation.` : 'A victory of attrition — patience rewarded.'}`;
    }
    return `${myName} ${sinVerbs[mySin] || 'prevailed'}, claiming victory in round ${currentRound}. ${eliminated > 2 ? 'A bloodbath — only one sinner remained standing.' : eliminated > 0 ? `${eliminated} fell before your ${mySin.toUpperCase()}.` : 'A flawless performance.'} ${stats.mvpMoment}`;
  } else {
    if (!me?.isAlive) {
      return `${myName}'s ${mySin.toUpperCase()} was extinguished in the arena. ${winnerName}'s ${winnerSin.toUpperCase()} ${sinVerbs[winnerSin] || 'prevailed'}, claiming dominion over ${eliminated} fallen sinners. ${stats.totalDamageDealt > 20 ? `You dealt ${stats.totalDamageDealt} damage before falling — your mark was felt.` : 'The darkness claims another soul.'}`;
    }
    return `The battle raged for ${currentRound} rounds. ${winnerName}'s ${winnerSin.toUpperCase()} ${sinVerbs[winnerSin] || 'proved strongest'}. ${stats.totalDamageDealt > 15 ? `Your ${stats.totalDamageDealt} damage wasn't enough this time.` : 'Next time, sin harder.'}`;
  }
}

interface KeyMoment { icon: string; text: string; color: string; }

function generateKeyMoments(players: PlayerState[], currentPlayerId: string, stats: PostGameStats, currentRound: number): KeyMoment[] {
  const moments: KeyMoment[] = [];
  const me = players.find(p => p.id === currentPlayerId);
  const lowestHpPlayer = [...players].sort((a, b) => a.currentHp - b.currentHp)[0];
  if (lowestHpPlayer && lowestHpPlayer.id !== currentPlayerId) {
    const hpLost = lowestHpPlayer.maxHp - lowestHpPlayer.currentHp;
    if (hpLost > 15) moments.push({ icon: "\u2694\uFE0F", text: `${lowestHpPlayer.username} took ${hpLost} total damage — the arena's punching bag.`, color: "#ef4444" });
  }
  if (me?.isAlive && me.currentHp <= 10) moments.push({ icon: "\u{1F9E1}", text: `Survived with just ${me.currentHp} HP. Living on borrowed time.`, color: "#f59e0b" });
  if (stats.cardsPlayed > 0 && stats.totalDamageDealt > 0) {
    const efficiency = Math.round(stats.totalDamageDealt / stats.cardsPlayed);
    if (efficiency >= 5) moments.push({ icon: "\u{1F4A5}", text: `${efficiency} average damage per card — every play was a calculated sin.`, color: "#e8200e" });
  }
  if (stats.totalHealingDone > 15) moments.push({ icon: "\u2728", text: `Healed ${stats.totalHealingDone} HP total. The cockroach strategy pays off.`, color: "#22c55e" });
  if (stats.totalShieldApplied > 10) moments.push({ icon: "\u{1F6E1}\uFE0F", text: `Applied ${stats.totalShieldApplied} ward — an impenetrable fortress of sin.`, color: "#3b82f6" });
  if (currentRound >= 16) moments.push({ icon: "\u{1F525}", text: `Survived past round 16 — when afflictions double and the weak are purged.`, color: "#9055e8" });
  if (stats.compoundingEffectsUsed >= 4) moments.push({ icon: "\u{1F300}", text: `${stats.compoundingEffectsUsed} stacking effects triggered. Patience is the deadliest sin.`, color: "#ec4899" });
  const eliminated = players.filter(p => !p.isAlive).length;
  if (eliminated >= 3) moments.push({ icon: "\u{1F480}", text: `${eliminated} sinners eliminated. The arena ran red.`, color: "#888" });
  if (moments.length === 0) moments.push({ icon: "\u{1F3B4}", text: `${stats.cardsPlayed} cards played across ${currentRound} rounds of unholy combat.`, color: "#888" });
  if (moments.length === 1) moments.push({ icon: "\u231B", text: `The battle lasted ${currentRound} rounds. Every round was a gamble.`, color: "#666" });
  return moments.slice(0, 4);
}

function saveProfileStats(players: PlayerState[], currentPlayerId: string, isWinner: boolean, stats: PostGameStats) {
  try {
    const me = players.find(p => p.id === currentPlayerId);
    const raw = localStorage.getItem("7sins_profile_stats");
    const profile = raw ? JSON.parse(raw) : {
      totalGames: 0, totalWins: 0, sinStats: {} as Record<string, { games: number; wins: number }>,
      totalDamageDealt: 0, totalHealingDone: 0, totalShieldApplied: 0, longestWinStreak: 0, currentWinStreak: 0,
    };
    profile.totalGames++;
    if (isWinner) profile.totalWins++;
    profile.totalDamageDealt += stats.totalDamageDealt;
    profile.totalHealingDone += stats.totalHealingDone;
    profile.totalShieldApplied += stats.totalShieldApplied;
    if (me?.chosenSin) {
      if (!profile.sinStats[me.chosenSin]) profile.sinStats[me.chosenSin] = { games: 0, wins: 0 };
      profile.sinStats[me.chosenSin].games++;
      if (isWinner) profile.sinStats[me.chosenSin].wins++;
    }
    if (isWinner) {
      profile.currentWinStreak++;
      if (profile.currentWinStreak > profile.longestWinStreak) profile.longestWinStreak = profile.currentWinStreak;
    } else {
      profile.currentWinStreak = 0;
    }
    localStorage.setItem("7sins_profile_stats", JSON.stringify(profile));
  } catch { /* ignore */ }
}

// ─── Share helpers ────────────────────────────────────────────────────────────

function buildShareText(
  playerName: string, sin: string, isWinner: boolean,
  stats: PostGameStats, currentRound: number
): string {
  const result = isWinner ? "VICTORY" : "DEFEAT";
  const sinLabel = sin.charAt(0).toUpperCase() + sin.slice(1);
  return [
    `\u2694\uFE0F 7 DEADLY SINS \u2014 ${result}`,
    ``,
    `${playerName} \u2022 ${sinLabel}`,
    `Round ${currentRound} \u2022 ${stats.totalDamageDealt} dmg \u2022 ${stats.cardsPlayed} cards`,
    ``,
    isWinner ? `\u{1F525} Another soul claimed.` : `\u{1F480} The arena takes another.`,
    ``,
    `Play now \u2192 ${window.location.origin}`,
  ].join("\n");
}

function shareToDiscord(text: string) {
  // Discord doesn't have a direct share URL, but we can copy to clipboard for pasting
  navigator.clipboard.writeText(text).then(() => {
    // Open Discord in a new tab
    window.open("https://discord.com/channels/@me", "_blank");
  });
}

function shareToWhatsApp(text: string) {
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encoded}`, "_blank");
}

// ─── Ember Particle ──────────────────────────────────────────────────────────

function EmberParticle({ color, delay }: { color: string; delay: number }) {
  const x = Math.random() * 100;
  const duration = 4 + Math.random() * 6;
  const size = 2 + Math.random() * 4;
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size, left: `${x}%`, bottom: -10,
        background: color, boxShadow: `0 0 ${size * 2}px ${color}`,
      }}
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: [0, 0.8, 0.6, 0], y: [0, -400 - Math.random() * 300], x: [0, (Math.random() - 0.5) * 100] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeOut" }}
    />
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ icon, value, label, color, delay }: {
  icon: string; value: number | string; label: string; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 120 }}
      className="relative group"
    >
      <div
        className="rounded-xl p-4 text-center backdrop-blur-md border transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
          borderColor: `${color}30`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        <img src={icon} alt={label} className="w-6 h-6 object-contain mx-auto mb-2 opacity-70" />
        <p className="text-3xl font-black tracking-tight" style={{ fontFamily: "var(--font-heading)", color }}>
          {value}
        </p>
        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1" style={{ fontFamily: "var(--font-heading)" }}>
          {label}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Chronicle Section (Zeigarnik tension + CTA) ────────────────────────────

function ChronicleSection({ gameId, sinColor, showContent }: { gameId: string; sinColor: string; showContent: boolean }) {
  const [, setLocation] = useLocation();
  const { data: chronicle, isLoading } = trpc.game.getChronicle.useQuery(
    { gameId },
    {
      refetchInterval: (query) => {
        // Keep polling every 5s until chronicle is ready
        return query.state.data ? false : 5000;
      },
    }
  );

  const chronicleReady = chronicle && chronicle.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: showContent ? 4.6 : 2.3 }}
      className="w-full max-w-xl mb-4"
    >
      <div
        className="rounded-xl px-5 py-5 border relative overflow-hidden text-center"
        style={{
          background: chronicleReady
            ? `linear-gradient(135deg, ${sinColor}12, ${sinColor}04)`
            : 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
          borderColor: chronicleReady ? `${sinColor}30` : 'rgba(255,255,255,0.08)',
        }}
      >
        {!chronicleReady ? (
          /* Zeigarnik tension state — chronicle is being written */
          <div className="flex flex-col items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-6 h-6 text-white/30" />
            </motion.div>
            <div>
              <p
                className="text-sm font-bold tracking-wider mb-1"
                style={{ fontFamily: "var(--font-heading)", color: sinColor }}
              >
                The Chronicler is writing...
              </p>
              <p className="text-xs text-white/30 italic" style={{ fontFamily: "var(--font-body)" }}>
                Your battle is being woven into an alternate history of civilization
              </p>
            </div>
            {/* Animated quill dots */}
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: sinColor }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Chronicle ready — reveal with CTA */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-3"
          >
            <BookOpen className="w-6 h-6" style={{ color: sinColor }} />
            <div>
              <p
                className="text-sm font-bold tracking-wider mb-1"
                style={{ fontFamily: "var(--font-heading)", color: sinColor }}
              >
                {chronicle.title || "Your Chronicle Awaits"}
              </p>
              {chronicle.excerpt && (
                <p className="text-xs text-white/40 italic leading-relaxed max-w-sm mx-auto" style={{ fontFamily: "var(--font-body)" }}>
                  "{chronicle.excerpt}"
                </p>
              )}
              {chronicle.rarity_tier && chronicle.rarity_tier !== 'common' && (
                <span
                  className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    background: chronicle.rarity_tier === 'legendary' ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                      : chronicle.rarity_tier === 'epic' ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
                      : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: chronicle.rarity_tier === 'legendary' ? '#000' : '#fff',
                  }}
                >
                  {chronicle.rarity_tier}
                </span>
              )}
            </div>
            <button
              onClick={() => setLocation(`/chronicles/${chronicle.id}`)}
              className="mt-2 px-6 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 flex items-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${sinColor}, ${sinColor}cc)`,
                color: sinColor === '#f0f0f0' ? '#000' : '#fff',
                boxShadow: `0 4px 20px ${sinColor}40`,
              }}
            >
              <BookOpen className="w-4 h-4" />
              Read Your Chronicle
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function GameOverScreen({ players, winnerId, currentPlayerId, currentRound, gameId, onRematch }: GameOverScreenProps) {
  const [, setLocation] = useLocation();
  const winner = players.find((p) => p.id === winnerId);
  const isPlayerWinner = winnerId === currentPlayerId;
  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const [logEntries, setLogEntries] = useState<any[]>([]);
  const [showContent, setShowContent] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const mySin = (currentPlayer?.chosenSin || 'wrath') as SinType;
  const sinColor = SIN_COLORS[mySin] || "#ef4444";
  const sinGlow = SIN_GLOW[mySin] || SIN_GLOW.wrath;

  // Win streak
  const [winStreak, setWinStreak] = useState(0);

  useEffect(() => {
    const storedStreak = parseInt(localStorage.getItem("7sins_win_streak") || "0", 10);
    if (isPlayerWinner) {
      const newStreak = storedStreak + 1;
      localStorage.setItem("7sins_win_streak", String(newStreak));
      setWinStreak(newStreak);
    } else {
      localStorage.setItem("7sins_win_streak", "0");
      setWinStreak(0);
    }
    const totalGames = parseInt(localStorage.getItem("7sins_total_games") || "0", 10);
    localStorage.setItem("7sins_total_games", String(totalGames + 1));
    const totalWins = parseInt(localStorage.getItem("7sins_total_wins") || "0", 10);
    if (isPlayerWinner) localStorage.setItem("7sins_total_wins", String(totalWins + 1));
    if (currentPlayer?.chosenSin) {
      const factionKey = `7sins_faction_${currentPlayer.chosenSin}`;
      const factionGames = parseInt(localStorage.getItem(factionKey) || "0", 10);
      localStorage.setItem(factionKey, String(factionGames + 1));
      if (isPlayerWinner) {
        const factionWinKey = `7sins_faction_${currentPlayer.chosenSin}_wins`;
        const factionWins = parseInt(localStorage.getItem(factionWinKey) || "0", 10);
        localStorage.setItem(factionWinKey, String(factionWins + 1));
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (gameId) getGameLog(gameId).then(setLogEntries).catch(() => {});
    const timer = setTimeout(() => setShowContent(true), 1800);
    return () => clearTimeout(timer);
  }, [gameId]);

  const stats = useMemo(() => computePostGameStats(logEntries, currentPlayerId, players), [logEntries, currentPlayerId, players]);

  useEffect(() => {
    if (stats.cardsPlayed > 0 || logEntries.length > 0) saveProfileStats(players, currentPlayerId, isPlayerWinner, stats);
  }, [stats]); // eslint-disable-line react-hooks/exhaustive-deps

  const standings = [...players].sort((a, b) => {
    if (a.isAlive && !b.isAlive) return -1;
    if (!a.isAlive && b.isAlive) return 1;
    return b.currentHp - a.currentHp;
  });

  const chronicle = useMemo(
    () => generateBattleChronicle(players, currentPlayerId, isPlayerWinner, winner, currentRound, stats),
    [players, currentPlayerId, isPlayerWinner, winner, currentRound, stats]
  );

  const keyMoments = useMemo(
    () => generateKeyMoments(players, currentPlayerId, stats, currentRound),
    [players, currentPlayerId, stats, currentRound]
  );

  const shareText = useMemo(
    () => buildShareText(currentPlayer?.username || 'Player', mySin, isPlayerWinner, stats, currentRound),
    [currentPlayer, mySin, isPlayerWinner, stats, currentRound]
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 overflow-hidden"
      >
        {/* ── Layer -1: Victory confetti ── */}
        {isPlayerWinner && (
          <Suspense fallback={null}>
            <VictoryConfetti show={true} sin={mySin} />
          </Suspense>
        )}

        {/* ── Layer 0: Background portrait ── */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.25 }}
          transition={{ duration: 3, ease: "easeOut" }}
        >
          <img
            src={FACTION_PORTRAITS_HD[mySin]}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: isPlayerWinner ? 'saturate(1.3)' : 'saturate(0.4) brightness(0.6)' }}
          />
        </motion.div>

        {/* ── Layer 1: Vignette + color overlay ── */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,0.95) 100%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${sinColor}40, transparent 60%)`,
          }}
        />

        {/* ── Layer 2: Embers ── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <EmberParticle key={i} color={isPlayerWinner ? sinColor : '#ef4444'} delay={i * 0.3} />
          ))}
        </div>

        {/* ── Layer 3: Scrollable content ── */}
        <div className="absolute inset-0 overflow-y-auto">
          <div className="min-h-full flex flex-col items-center justify-start py-8 md:py-12 px-4">

            {/* ── RESULT TITLE ── */}
            <motion.div
              initial={{ opacity: 0, scale: 2, y: -40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 80 }}
              className="text-center mb-2 relative"
            >
              {/* Glow behind text */}
              <div
                className="absolute inset-0 blur-[60px] opacity-50"
                style={{ background: isPlayerWinner ? sinColor : '#ef4444' }}
              />
              <h1
                className="relative text-6xl md:text-8xl lg:text-9xl font-black tracking-[0.15em] uppercase"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: isPlayerWinner ? sinColor : "#ef4444",
                  textShadow: sinGlow,
                  WebkitTextStroke: `1px ${isPlayerWinner ? sinColor : '#ef4444'}40`,
                }}
              >
                {isPlayerWinner ? "VICTORY" : "DEFEAT"}
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1 }}
                className="text-sm md:text-base uppercase tracking-[0.3em] text-white/50 mt-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {currentRound >= 20 ? "Round 20 \u2014 Time's Up" : "Last One Standing"}
              </motion.p>
            </motion.div>

            {/* ── WIN STREAK ── */}
            {isPlayerWinner && winStreak > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, type: "spring" }}
                className="mb-6 px-6 py-3 rounded-full border"
                style={{
                  background: `linear-gradient(135deg, ${sinColor}15, ${sinColor}05)`,
                  borderColor: `${sinColor}30`,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{winStreak >= 5 ? "\u{1F525}" : "\u26A1"}</span>
                  <div>
                    <span className="text-sm font-bold tracking-wider" style={{ fontFamily: "var(--font-heading)", color: sinColor }}>
                      {winStreak} WIN STREAK
                    </span>
                    <p className="text-[10px] text-white/40 italic" style={{ fontFamily: "var(--font-body)" }}>
                      {getStreakComment(winStreak)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── WINNER INFO ── */}
            {winner && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="flex items-center gap-4 mb-8"
              >
                <motion.div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2"
                  style={{ borderColor: SIN_COLORS[winner.chosenSin || 'wrath'], boxShadow: SIN_GLOW[winner.chosenSin || 'wrath'] }}
                  animate={{ boxShadow: [SIN_GLOW[winner.chosenSin || 'wrath'], `0 0 40px ${SIN_COLORS[winner.chosenSin || 'wrath']}60`, SIN_GLOW[winner.chosenSin || 'wrath']] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <img
                    src={FACTION_PORTRAITS_HD[(winner.chosenSin as SinType) || 'wrath']}
                    alt={winner.username}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                    {isPlayerWinner ? "Your Sin Prevails" : "Victor"}
                  </p>
                  <p className="text-2xl md:text-3xl font-black" style={{ fontFamily: "var(--font-heading)", color: SIN_COLORS[winner.chosenSin || 'wrath'] }}>
                    {winner.username}
                  </p>
                  <p className="text-sm text-white/40">
                    {winner.currentHp}/{winner.maxHp} HP \u2022 {(winner.chosenSin || 'wrath').toUpperCase()}
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── STATS GRID ── */}
            <AnimatePresence>
              {showContent && (
                <motion.div className="w-full max-w-xl mb-6">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 2 }}
                    className="text-xs uppercase tracking-[0.3em] text-white/40 text-center mb-4"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Your Performance
                  </motion.p>
                  <div className="grid grid-cols-3 gap-3">
                    <StatCard icon={ICON_URLS.damage_wrath} value={stats.cardsPlayed} label="Cards Played" color="#f59e0b" delay={2.1} />
                    <StatCard icon={ICON_URLS.damage_greed} value={stats.totalDamageDealt} label="Damage Dealt" color="#ef4444" delay={2.3} />
                    <StatCard icon={ICON_URLS.heal_generic} value={stats.totalHealingDone} label="HP Mended" color="#22c55e" delay={2.5} />
                  </div>
                  {(stats.totalShieldApplied > 0 || stats.compoundingEffectsUsed > 0) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.7 }}
                      className="flex items-center justify-center gap-6 mt-3 text-xs text-white/30"
                    >
                      {stats.totalShieldApplied > 0 && (
                        <span className="flex items-center gap-1.5">
                          <img src={ICON_URLS.shield_generic} alt="" className="w-3.5 h-3.5 object-contain opacity-50" />
                          {stats.totalShieldApplied} ward applied
                        </span>
                      )}
                      {stats.compoundingEffectsUsed > 0 && (
                        <span className="flex items-center gap-1.5">
                          <img src={ICON_URLS.energy_generic} alt="" className="w-3.5 h-3.5 object-contain opacity-50" />
                          {stats.compoundingEffectsUsed} stacking effects
                        </span>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── MVP MOMENT ── */}
            <AnimatePresence>
              {showContent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.8 }}
                  className="w-full max-w-xl mb-4"
                >
                  <div
                    className="rounded-xl px-5 py-4 border text-center"
                    style={{
                      background: `linear-gradient(135deg, ${sinColor}08, transparent)`,
                      borderColor: `${sinColor}20`,
                    }}
                  >
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                      Highlight Reel
                    </p>
                    <p className="text-sm text-white/70 italic leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                      "{stats.mvpMoment}"
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── BATTLE CHRONICLE ── */}
            <AnimatePresence>
              {showContent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.1 }}
                  className="w-full max-w-xl mb-4"
                >
                  <div
                    className="rounded-xl px-5 py-4 border relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                      borderColor: 'rgba(255,255,255,0.08)',
                    }}
                  >
                    {/* Parchment texture overlay */}
                    <div className="absolute inset-0 opacity-[0.02]" style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 3px)',
                    }} />
                    <p className="relative text-[10px] text-white/30 uppercase tracking-widest mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                      Battle Chronicle
                    </p>
                    <p className="relative text-sm text-white/60 leading-relaxed italic" style={{ fontFamily: "var(--font-body)" }}>
                      {chronicle}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── KEY MOMENTS ── */}
            <AnimatePresence>
              {showContent && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3.4 }}
                  className="w-full max-w-xl mb-6 space-y-2"
                >
                  {keyMoments.map((moment, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 3.5 + i * 0.15 }}
                      className="flex items-start gap-3 rounded-lg px-4 py-3 border"
                      style={{
                        background: `linear-gradient(135deg, ${moment.color}08, transparent)`,
                        borderColor: `${moment.color}15`,
                      }}
                    >
                      <span className="text-sm mt-0.5" style={{ color: moment.color }}>{moment.icon}</span>
                      <p className="text-xs text-white/50 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                        {moment.text}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── DIVIDER ── */}
            <div className="w-full max-w-xl">
              <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent my-4" />
            </div>

            {/* ── FINAL STANDINGS ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: showContent ? 3.8 : 1.5 }}
              className="w-full max-w-xl mb-6"
            >
              <p className="text-xs text-white/30 uppercase tracking-[0.3em] text-center mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                Final Standings
              </p>
              <div className="space-y-2">
                {standings.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: (showContent ? 4 : 1.7) + i * 0.12 }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border transition-all"
                    style={{
                      background: p.id === currentPlayerId
                        ? `linear-gradient(135deg, ${SIN_COLORS[p.chosenSin || 'wrath']}12, ${SIN_COLORS[p.chosenSin || 'wrath']}04)`
                        : 'rgba(255,255,255,0.03)',
                      borderColor: p.id === currentPlayerId
                        ? `${SIN_COLORS[p.chosenSin || 'wrath']}25`
                        : 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-white/30 text-sm font-mono w-6 text-center" style={{ fontFamily: "var(--font-heading)" }}>
                        {i === 0 ? "\u{1F451}" : `#${i + 1}`}
                      </span>
                      <img
                        src={SIN_ARCHETYPE_ICONS[(p.chosenSin as SinType) || 'wrath']}
                        alt={p.chosenSin || 'sin'}
                        className="w-7 h-7 object-contain"
                        style={{ filter: p.isAlive ? `drop-shadow(0 0 4px ${SIN_COLORS[p.chosenSin || 'wrath']})` : 'grayscale(1) opacity(0.3)' }}
                      />
                      <div>
                        <span
                          className="font-bold text-sm"
                          style={{
                            fontFamily: "var(--font-heading)",
                            color: p.isAlive ? SIN_COLORS[p.chosenSin || "wrath"] : "#555",
                          }}
                        >
                          {p.username}
                        </span>
                        {p.id === currentPlayerId && (
                          <span className="text-white/20 text-xs ml-1.5">(you)</span>
                        )}
                      </div>
                    </div>
                    <div>
                      {p.isAlive ? (
                        <span className="text-green-400 text-sm font-bold font-mono">
                          {p.currentHp}/{p.maxHp}
                        </span>
                      ) : (
                        <span className="text-red-400/40 text-xs font-bold uppercase tracking-wider">
                          Eliminated
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ── SHARE BUTTONS ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: showContent ? 4.5 : 2.2 }}
              className="w-full max-w-xl mb-4"
            >
              <div className="flex items-center justify-center gap-3">
                {/* WhatsApp */}
                <button
                  onClick={() => shareToWhatsApp(shareText)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #25D366, #128C7E)',
                    color: '#fff',
                    boxShadow: '0 4px 15px rgba(37,211,102,0.3)',
                  }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </button>

                {/* Discord */}
                <button
                  onClick={() => {
                    shareToDiscord(shareText);
                    setCopiedToClipboard(true);
                    setTimeout(() => setCopiedToClipboard(false), 2000);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #5865F2, #4752C4)',
                    color: '#fff',
                    boxShadow: '0 4px 15px rgba(88,101,242,0.3)',
                  }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                  {copiedToClipboard ? "Copied!" : "Discord"}
                </button>

                {/* Copy text */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareText);
                    setCopiedToClipboard(true);
                    setTimeout(() => setCopiedToClipboard(false), 2000);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all hover:scale-105 border"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                  {copiedToClipboard ? "Copied!" : "Copy"}
                </button>
              </div>
            </motion.div>

            {/* ── AI CHRONICLE CTA ── */}
            {gameId && (
              <ChronicleSection gameId={gameId} sinColor={sinColor} showContent={showContent} />
            )}

            {/* ── ACTION BUTTONS ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: showContent ? 4.8 : 2.5 }}
              className="flex flex-wrap gap-3 justify-center mt-4 mb-8"
            >
              {onRematch && (
                <button
                  onClick={onRematch}
                  className="px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 flex items-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${sinColor}, ${sinColor}cc)`,
                    color: sinColor === '#f0f0f0' ? '#000' : '#fff',
                    boxShadow: `0 4px 20px ${sinColor}40`,
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Rematch
                </button>
              )}
              <button
                onClick={() => setLocation("/")}
                className="px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#000',
                  boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
                }}
              >
                New Game
              </button>
              <button
                onClick={() => setLocation("/")}
                className="px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 border"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                Home
              </button>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
