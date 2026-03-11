/**
 * GameOverScreen - Displayed when the game ends
 *
 * Shows winner, final standings, post-game summary, and option to play again.
 * Cinematic reveal with dark overlay and animated results.
 * 
 * Octalysis Quick Wins:
 * - CD2: Post-game summary with stats + Win Streak counter
 * - CD5: Rematch button for social re-engagement
 * - CD8: Win streak creates something to protect
 */

import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { ICON_URLS } from "@/lib/assetUrls";
import type { PlayerState, GameLogEntry, SinType } from "@shared/gameTypes";
import { CARD_MAP } from "@shared/cardData";
import { getGameLog } from "@/lib/gameEngine";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import ShareableBattleCard from "./ShareableBattleCard";

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
  sloth: "#3b82f6",
  greed: "#eab308",
  envy: "#22c55e",
  pride: "#f0f0f0",
  lust: "#ec4899",
  gluttony: "#b45309",
};

// Painterly Spell Icons used instead of emoji - see SIN_ARCHETYPE_ICONS from iconUtils

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

/**
 * Parse effect strings from game_log action_data.effects
 * Format: "damage 5 on enemy", "heal 3 on self", "shield 2 on self for 2r",
 *         "damage 3 on enemy (compounds ×3r)", "CATCH-UP bonus damage 4"
 */
function parseEffectString(eff: string): { type: string; value: number } | null {
  if (typeof eff !== 'string') {
    // Already an object with type/value
    if (eff && typeof eff === 'object' && 'type' in eff && 'value' in eff) {
      return { type: (eff as any).type, value: Number((eff as any).value) || 0 };
    }
    return null;
  }
  // Match "CATCH-UP bonus damage 4" or "CATCH-UP bonus heal 3"
  const catchupMatch = eff.match(/CATCH-UP bonus (\w+) (\d+)/);
  if (catchupMatch) {
    return { type: catchupMatch[1], value: parseInt(catchupMatch[2], 10) };
  }
  // Match "damage 5 on enemy", "heal 3 on self", "shield 2 on self for 2r"
  // Also matches "damage 3 on enemy (compounds ×3r)"
  const match = eff.match(/^(\w+(?:_\w+)?) (\d+) on/);
  if (match) {
    return { type: match[1], value: parseInt(match[2], 10) };
  }
  return null;
}

function computePostGameStats(logEntries: any[], currentPlayerId: string, players: PlayerState[]): PostGameStats {
  const stats: PostGameStats = {
    cardsPlayed: 0,
    totalDamageDealt: 0,
    totalHealingDone: 0,
    totalShieldApplied: 0,
    compoundingEffectsUsed: 0,
    catchupsTriggered: 0,
    mvpMoment: "",
  };

  let biggestHit = 0;
  let biggestHitCard = "";

  // Build a set of all possible IDs for the current player
  // game_log stores game_players.id (row UUID), but currentPlayerId is player_id (client UUID)
  // We need to match both
  const currentPlayerObj = players.find(p => p.id === currentPlayerId);
  const matchIds = new Set<string>();
  matchIds.add(currentPlayerId);
  if (currentPlayerObj?.gamePlayerId) {
    matchIds.add(currentPlayerObj.gamePlayerId);
  }

  for (const entry of logEntries) {
    // Match against both player_id formats
    if (!matchIds.has(entry.player_id)) continue;
    const data = typeof entry.action_data === "string" ? JSON.parse(entry.action_data) : entry.action_data;

    if (entry.action_type === "play_card") {
      stats.cardsPlayed++;
      const cardId = data.card_id || data.cardId;
      const card = cardId ? CARD_MAP[cardId] : null;
      if (card?.cardType === "compounding") stats.compoundingEffectsUsed++;

      // Track damage from effects — effects can be strings or objects
      const effects = data.effects || [];
      for (const eff of effects) {
        const parsed = parseEffectString(eff);
        if (!parsed) continue;

        if (parsed.type === "damage" || parsed.type === "debuff") {
          stats.totalDamageDealt += parsed.value;
          if (parsed.value > biggestHit) {
            biggestHit = parsed.value;
            biggestHitCard = card?.name || "Unknown";
          }
        }
        if (parsed.type === "heal") stats.totalHealingDone += parsed.value;
        if (parsed.type === "shield") stats.totalShieldApplied += parsed.value;
      }

      // Check for catch-up effects in the descriptions
      for (const eff of effects) {
        if (typeof eff === 'string' && eff.includes('CATCH-UP')) {
          stats.catchupsTriggered++;
        }
      }
    }

    if (entry.action_type === "overcharge") {
      // Count overcharge as a notable action
    }

    if (entry.action_type === "catchup_triggered") {
      stats.catchupsTriggered++;
    }
  }

  // Fallback: estimate from final state if log data is sparse
  if (stats.cardsPlayed === 0) {
    // Count cards no longer in hand/deck as played
    const me = players.find(p => p.id === currentPlayerId);
    if (me) {
      stats.cardsPlayed = Math.max(0, 12 - me.hand.length - me.deckSize - me.discardSize);
    }
  }

  // Also estimate damage from HP differences if log parsing found nothing
  if (stats.totalDamageDealt === 0 && stats.cardsPlayed > 0) {
    // Sum up HP lost by opponents as a rough damage estimate
    const opponents = players.filter(p => p.id !== currentPlayerId);
    let totalHpLost = 0;
    for (const opp of opponents) {
      totalHpLost += Math.max(0, opp.maxHp - opp.currentHp);
    }
    // Attribute a proportional share to this player (rough estimate)
    const playerCount = players.filter(p => p.id !== currentPlayerId).length || 1;
    stats.totalDamageDealt = Math.round(totalHpLost / playerCount);
  }

  if (biggestHit > 0) {
    stats.mvpMoment = `${biggestHitCard} dealt ${biggestHit} damage in a single hit!`;
  } else if (stats.totalHealingDone > 10) {
    stats.mvpMoment = `Healed ${stats.totalHealingDone} HP — the cockroach strategy.`;
  } else if (stats.compoundingEffectsUsed > 2) {
    stats.mvpMoment = `${stats.compoundingEffectsUsed} compounding effects — patience is a virtue (and a weapon).`;
  } else if (stats.cardsPlayed > 0) {
    stats.mvpMoment = `Played ${stats.cardsPlayed} cards across the battle. Every sin counts.`;
  } else {
    stats.mvpMoment = "Survived the arena. That counts for something.";
  }

  return stats;
}

export function GameOverScreen({ players, winnerId, currentPlayerId, currentRound, gameId, onRematch }: GameOverScreenProps) {
  const [, setLocation] = useLocation();
  const winner = players.find((p) => p.id === winnerId);
  const isPlayerWinner = winnerId === currentPlayerId;
  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const [logEntries, setLogEntries] = useState<any[]>([]);
  const [showStats, setShowStats] = useState(false);

  // Win streak management
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
    // Track total games
    const totalGames = parseInt(localStorage.getItem("7sins_total_games") || "0", 10);
    localStorage.setItem("7sins_total_games", String(totalGames + 1));
    const totalWins = parseInt(localStorage.getItem("7sins_total_wins") || "0", 10);
    if (isPlayerWinner) localStorage.setItem("7sins_total_wins", String(totalWins + 1));
    // Track faction stats
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

  // Fetch game log for post-game stats
  useEffect(() => {
    if (gameId) {
      getGameLog(gameId).then(setLogEntries).catch(() => {});
    }
    // Show stats after a delay
    const timer = setTimeout(() => setShowStats(true), 2500);
    return () => clearTimeout(timer);
  }, [gameId]);

  const stats = useMemo(
    () => computePostGameStats(logEntries, currentPlayerId, players),
    [logEntries, currentPlayerId, players]
  );

  // Sort players by HP descending for final standings
  const standings = [...players].sort((a, b) => {
    if (a.isAlive && !b.isAlive) return -1;
    if (!a.isAlive && b.isAlive) return 1;
    return b.currentHp - a.currentHp;
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }}
      >
        {/* Background glow */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{
            backgroundColor: isPlayerWinner
              ? SIN_COLORS[currentPlayer?.chosenSin || "wrath"]
              : "#ef4444",
          }}
        />

        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="relative z-10 w-full max-w-lg mx-4"
        >
          {/* Main card */}
          <div className="rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl p-8 text-center">
            {/* Result header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-6xl mb-4">
                {isPlayerWinner ? "\u{1F451}" : "\u{1F480}"}
              </div>
              <h1
                className="text-4xl font-black tracking-wider mb-2"
                style={{
                  color: isPlayerWinner ? "#fbbf24" : "#ef4444",
                  textShadow: isPlayerWinner
                    ? "0 0 30px rgba(251, 191, 36, 0.5)"
                    : "0 0 30px rgba(239, 68, 68, 0.5)",
                }}
              >
                {isPlayerWinner ? "VICTORY" : "DEFEAT"}
              </h1>
              <p className="text-white/50 text-sm uppercase tracking-widest">
                {currentRound >= 10 ? "Round 10 \u2014 Time's Up" : "Last One Standing"}
              </p>
            </motion.div>

            {/* Win Streak (CD2 + CD8) */}
            {isPlayerWinner && winStreak > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <img src={ICON_URLS.damage_wrath} alt="fire" className="w-4 h-4 object-contain" />
                  <span className="text-sm font-bold text-amber-400 tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                    {winStreak} WIN STREAK
                  </span>
                  <img src={ICON_URLS.damage_wrath} alt="fire" className="w-4 h-4 object-contain" />
                </div>
                <p className="text-[10px] text-amber-400/60 italic" style={{ fontFamily: "var(--font-body)" }}>
                  {getStreakComment(winStreak)}
                </p>
              </motion.div>
            )}

            {/* Winner info */}
            {winner && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-6 mb-6"
              >
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Winner</p>
                <div className="flex items-center justify-center gap-3">
                  <img
                    src={SIN_ARCHETYPE_ICONS[(winner.chosenSin as SinType) || 'wrath']}
                    alt={winner.chosenSin || 'sin'}
                    className="w-8 h-8 object-contain"
                    style={{ filter: `drop-shadow(0 0 6px ${SIN_COLORS[winner.chosenSin || 'wrath']})` }}
                  />
                  <span
                    className="text-2xl font-bold"
                    style={{ color: SIN_COLORS[winner.chosenSin || "wrath"] }}
                  >
                    {winner.username}
                  </span>
                  <span className="text-white/40 text-sm">
                    {winner.currentHp}/{winner.maxHp} HP
                  </span>
                </div>
              </motion.div>
            )}

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4" />

            {/* Post-Game Summary (CD2 + CD3) */}
            <AnimatePresence>
              {showStats && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="mb-4"
                >
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Battle Summary</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <img src={ICON_URLS.damage_wrath} alt="damage" className="w-3.5 h-3.5 object-contain mx-auto mb-1" />
                      <p className="text-lg font-black text-red-400" style={{ fontFamily: "var(--font-heading)" }}>
                        {stats.cardsPlayed}
                      </p>
                      <p className="text-[8px] text-white/40 uppercase tracking-wider">Cards Played</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <img src={ICON_URLS.damage_greed} alt="cards" className="w-3.5 h-3.5 object-contain mx-auto mb-1" />
                      <p className="text-lg font-black text-orange-400" style={{ fontFamily: "var(--font-heading)" }}>
                        {stats.totalDamageDealt}
                      </p>
                      <p className="text-[8px] text-white/40 uppercase tracking-wider">Damage Dealt</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <img src={ICON_URLS.heal_generic} alt="heal" className="w-3.5 h-3.5 object-contain mx-auto mb-1" />
                      <p className="text-lg font-black text-green-400" style={{ fontFamily: "var(--font-heading)" }}>
                        {stats.totalHealingDone}
                      </p>
                      <p className="text-[8px] text-white/40 uppercase tracking-wider">HP Healed</p>
                    </div>
                  </div>
                  {stats.compoundingEffectsUsed > 0 && (
                    <div className="flex items-center justify-center gap-4 text-[9px] text-white/30 mb-2">
                      <span className="flex items-center gap-1">
                        <img src={ICON_URLS.energy_generic} alt="energy" className="w-3 h-3 object-contain opacity-50" />
                        {stats.compoundingEffectsUsed} compound effects
                      </span>
                      {stats.totalShieldApplied > 0 && (
                        <span className="flex items-center gap-1">
                          <img src={ICON_URLS.shield_generic} alt="shield" className="w-3 h-3 object-contain opacity-50" />
                          {stats.totalShieldApplied} shield
                        </span>
                      )}
                    </div>
                  )}
                  {/* MVP Moment */}
                  <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                    <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1">
                      <img src={ICON_URLS.buff_generic} alt="streak" className="w-3 h-3 inline mr-1 object-contain opacity-50" />
                      MVP Moment
                    </p>
                    <p className="text-[11px] text-white/60 italic" style={{ fontFamily: "var(--font-body)" }}>
                      {stats.mvpMoment}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4" />

            {/* Final standings */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Final Standings</p>
              <div className="space-y-2">
                {standings.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.4 + i * 0.15 }}
                    className={`flex items-center justify-between px-4 py-2 rounded-lg ${
                      p.id === currentPlayerId
                        ? "bg-white/10 border border-white/20"
                        : "bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-white/30 text-sm font-mono w-5">
                        {i === 0 ? "\u{1F451}" : `#${i + 1}`}
                      </span>
                      <img
                        src={SIN_ARCHETYPE_ICONS[(p.chosenSin as SinType) || 'wrath']}
                        alt={p.chosenSin || 'sin'}
                        className="w-6 h-6 object-contain"
                        style={{ filter: p.isAlive ? `drop-shadow(0 0 4px ${SIN_COLORS[p.chosenSin || 'wrath']})` : 'grayscale(1) opacity(0.4)' }}
                      />
                      <span
                        className="font-semibold text-sm"
                        style={{ color: p.isAlive ? SIN_COLORS[p.chosenSin || "wrath"] : "#666" }}
                      >
                        {p.username}
                        {p.id === currentPlayerId && (
                          <span className="text-white/30 text-xs ml-1">(you)</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.isAlive ? (
                        <span className="text-green-400 text-sm font-mono">
                          {p.currentHp}/{p.maxHp}
                        </span>
                      ) : (
                        <span className="text-red-400/50 text-sm font-mono line-through">
                          ELIMINATED
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Shareable Battle Card (CD5: Social) */}
            <ShareableBattleCard
              playerName={currentPlayer?.username || 'Player'}
              sin={(currentPlayer?.chosenSin || 'wrath') as SinType}
              isWinner={isPlayerWinner}
              stats={{
                damageDealt: stats.totalDamageDealt,
                healingDone: stats.totalHealingDone,
                cardsPlayed: stats.cardsPlayed,
                roundsSurvived: currentRound,
              }}
              onGenerate={(dataUrl) => {
                const link = document.createElement('a');
                link.download = '7sins-battle-card.png';
                link.href = dataUrl;
                link.click();
              }}
            />

            {/* Actions (CD5: Rematch) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-8 flex gap-3 justify-center"
            >
              {onRematch && (
                <button
                  onClick={onRematch}
                  className="px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider
                    bg-gradient-to-r from-violet-500 to-purple-600 text-white
                    hover:from-violet-400 hover:to-purple-500 transition-all
                    shadow-lg shadow-violet-500/20 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Rematch
                </button>
              )}
              <button
                onClick={() => setLocation("/")}
                className="px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider
                  bg-gradient-to-r from-amber-500 to-orange-600 text-black
                  hover:from-amber-400 hover:to-orange-500 transition-all
                  shadow-lg shadow-amber-500/20"
              >
                Play Again
              </button>
              <button
                onClick={() => setLocation("/")}
                className="px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider
                  bg-white/10 text-white/70 border border-white/10
                  hover:bg-white/20 transition-all"
              >
                Home
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
