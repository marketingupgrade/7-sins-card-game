/**
 * PostGameAnalysis — "Why Did I Lose?" System
 *
 * Analyzes the player's game data after a loss and provides
 * specific, actionable improvement tips. Examines:
 * - Unplayed cards (wasted potential damage/healing)
 * - Energy efficiency (energy wasted vs spent)
 * - Targeting patterns (spread damage vs focus fire)
 * - HP timeline (when damage was taken, survival duration)
 * - Faction matchup analysis
 * - Compound effect utilization
 *
 * Only shows after a LOSS. Collapsible panel in GameOverScreen.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Lightbulb, AlertTriangle, TrendingUp, Zap, Target, Shield, Swords } from "lucide-react";
import type { PlayerState, SinType } from "@shared/gameTypes";
import { CARD_MAP } from "@shared/cardData";
import { PASSIVE_INFO, MAX_ENERGY, MAX_ROUNDS } from "@shared/gameTypes";

// ─── Types ──────────────────────────────────────────────────────

interface AnalysisTip {
  icon: typeof Lightbulb;
  title: string;
  detail: string;
  severity: "critical" | "important" | "suggestion";
  category: "energy" | "cards" | "targeting" | "defense" | "faction" | "timing";
}

interface PostGameAnalysisProps {
  players: PlayerState[];
  currentPlayerId: string;
  currentRound: number;
  sinColor: string;
  logEntries: any[];
}

// ─── Severity Colors ────────────────────────────────────────────

const SEVERITY_STYLES = {
  critical: {
    border: "border-red-500/30",
    bg: "bg-red-500/8",
    iconColor: "text-red-400",
    label: "CRITICAL",
    labelBg: "bg-red-500/20",
  },
  important: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/8",
    iconColor: "text-amber-400",
    label: "IMPORTANT",
    labelBg: "bg-amber-500/20",
  },
  suggestion: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/8",
    iconColor: "text-blue-400",
    label: "TIP",
    labelBg: "bg-blue-500/20",
  },
};

// ─── Analysis Engine ────────────────────────────────────────────

function analyzeGame(
  players: PlayerState[],
  currentPlayerId: string,
  currentRound: number,
  logEntries: any[]
): AnalysisTip[] {
  const tips: AnalysisTip[] = [];
  const me = players.find((p) => p.id === currentPlayerId);
  if (!me) return tips;

  const winner = players.find((p) => p.isAlive && p.currentHp > 0);
  const mySin = me.chosenSin as SinType;

  // ─── 1. Unplayed Cards Analysis ───
  const unplayedCards = me.hand.map((id) => CARD_MAP[id]).filter(Boolean);
  if (unplayedCards.length > 0) {
    const totalUnplayedCost = unplayedCards.reduce((sum, c) => sum + c.cost, 0);
    const totalUnplayedDamage = unplayedCards
      .flatMap((c) => c.effects)
      .filter((e) => e.type === "damage" || e.type === "self_damage")
      .reduce((sum, e) => sum + e.baseValue, 0);
    const totalUnplayedHealing = unplayedCards
      .flatMap((c) => c.effects)
      .filter((e) => e.type === "heal_gain" || e.type === "heal_steal")
      .reduce((sum, e) => sum + e.baseValue, 0);

    if (unplayedCards.length >= 3) {
      tips.push({
        icon: AlertTriangle,
        title: `${unplayedCards.length} cards left unplayed`,
        detail: `You had ${unplayedCards.length} cards still in hand worth ${totalUnplayedCost} total energy. ${
          totalUnplayedDamage > 0
            ? `That's ~${totalUnplayedDamage} base damage you never dealt.`
            : totalUnplayedHealing > 0
            ? `That's ~${totalUnplayedHealing} healing you never used.`
            : "Try to spend all your energy each round — even low-cost cards add up through compound ticks."
        }`,
        severity: unplayedCards.length >= 5 ? "critical" : "important",
        category: "cards",
      });
    }

    // Check for affordable unplayed cards
    const affordableUnplayed = unplayedCards.filter((c) => c.cost <= me.currentEnergy);
    if (affordableUnplayed.length > 0 && me.currentEnergy > 0) {
      tips.push({
        icon: Zap,
        title: "Energy left on the table",
        detail: `You ended with ${me.currentEnergy} energy and ${affordableUnplayed.length} playable card${affordableUnplayed.length > 1 ? "s" : ""} in hand. Always spend your energy — unspent corruption is wasted potential. Even a 1-cost card compounds into 7x its value over 4 rounds.`,
        severity: "critical",
        category: "energy",
      });
    }
  }

  // ─── 2. Energy Efficiency ───
  if (me.currentEnergy >= 3 && currentRound < MAX_ROUNDS) {
    tips.push({
      icon: Zap,
      title: "High unspent energy at game end",
      detail: `You had ${me.currentEnergy}/${me.maxEnergy} energy when the game ended. Each unspent energy point is a card you could have played. In the mid-to-late game, try to play multiple low-cost cards per turn rather than saving for one big card.`,
      severity: "important",
      category: "energy",
    });
  }

  // ─── 3. HP Analysis ───
  const hpLost = me.maxHp - me.currentHp;
  const hpPct = me.currentHp / me.maxHp;

  if (!me.isAlive && currentRound <= 12) {
    tips.push({
      icon: Shield,
      title: "Eliminated early",
      detail: `You were eliminated by round ${currentRound} out of ${MAX_ROUNDS}. Early elimination usually means you were focused by multiple opponents or didn't invest enough in defensive cards (healing, shields). Try mixing in 2-3 defensive cards per round to survive longer.`,
      severity: "critical",
      category: "defense",
    });
  }

  // ─── 4. Faction Matchup Analysis ───
  if (winner && winner.chosenSin && mySin) {
    const winnerSin = winner.chosenSin as SinType;
    const matchupTips: Record<string, Record<string, string>> = {
      wrath: {
        sloth: "Sloth's shields absorb your burst damage. Try energy_steal cards to shut down their passive, or use affliction_amplify to bypass shields.",
        greed: "Greed out-values you in long games. Play aggressively early — your Vengeance passive is strongest when you're taking damage.",
        envy: "Envy steals your effects. Focus on direct damage cards rather than buffs that can be stolen.",
      },
      sloth: {
        wrath: "Wrath's burst damage can overwhelm your shields. Prioritize shield_gain cards early and use energy_block to slow them down.",
        pride: "Pride's Hubris multiplier can punch through your shields in one hit. Spread your shielding across rounds rather than stacking.",
      },
      greed: {
        wrath: "Wrath's aggression can end you before your Tax passive generates value. Play defensive cards early to survive to the mid-game.",
        pride: "Pride's energy drain shuts down your expensive cards. Keep some low-cost options in your deck as backup.",
      },
      envy: {
        gluttony: "Gluttony's discard_burn destroys your stolen cards. Focus on instant-value effects rather than building up a hand.",
        pride: "Pride's Hubris makes their cards too powerful to match. Focus on energy_steal to prevent their big plays.",
      },
      pride: {
        wrath: "Wrath's low-cost aggression ignores your economy game. You need early shields to survive their burst.",
        greed: "Greed's energy generation resists your drain. Focus on direct damage rather than energy_steal.",
      },
      lust: {
        sloth: "Sloth's shields block your Temptation healing. Use affliction_amplify to make your damage stick through their defenses.",
        gluttony: "Gluttony burns your discard pile for energy. Play cards quickly rather than holding them.",
      },
      gluttony: {
        greed: "Greed generates energy faster than you can burn their cards. Focus on direct damage rather than discard_burn.",
        sloth: "Sloth's passive shields make your AOE less effective. Target their energy instead.",
      },
    };

    const myMatchups = matchupTips[mySin];
    if (myMatchups && myMatchups[winnerSin]) {
      tips.push({
        icon: Target,
        title: `${mySin.charAt(0).toUpperCase() + mySin.slice(1)} vs ${winnerSin.charAt(0).toUpperCase() + winnerSin.slice(1)} matchup`,
        detail: myMatchups[winnerSin],
        severity: "suggestion",
        category: "faction",
      });
    }
  }

  // ─── 5. Compound Utilization ───
  // Count cards played from log
  let cardsPlayed = 0;
  const matchIds = new Set<string>();
  matchIds.add(currentPlayerId);
  if (me.gamePlayerId) matchIds.add(me.gamePlayerId);

  for (const entry of logEntries) {
    if (matchIds.has(entry.player_id) && entry.action_type === "play_card") {
      cardsPlayed++;
    }
  }

  if (cardsPlayed < currentRound && currentRound > 3) {
    tips.push({
      icon: TrendingUp,
      title: "Low card output",
      detail: `You played ~${cardsPlayed} cards over ${currentRound} rounds (${(cardsPlayed / currentRound).toFixed(1)} per round). Try to play at least 1 card per round — compound effects need time to stack. Playing a 1-cost card on round 1 deals 7x its base value by round 4.`,
      severity: cardsPlayed < currentRound * 0.5 ? "critical" : "important",
      category: "cards",
    });
  }

  // ─── 6. Late-Game Survival ───
  if (currentRound >= 16 && !me.isAlive) {
    tips.push({
      icon: Swords,
      title: "Fell after affliction doubling",
      detail: `You survived to round ${currentRound} but fell after afflictions doubled at round 16. In the late game, prioritize healing and shields over damage. Consider saving a heal_steal or shield_gain card for rounds 16+.`,
      severity: "important",
      category: "timing",
    });
  }

  // ─── 7. Faction Passive Utilization ───
  if (mySin) {
    const passiveInfo = PASSIVE_INFO[mySin];
    const passiveTips: Record<string, string> = {
      wrath: "Your Vengeance passive reflects damage back. Playing aggressively and taking hits is actually your strategy — but you need enough HP to survive. Mix damage with healing.",
      sloth: "Your Endurance passive generates shields based on energy × hand size. Keep your hand full and energy high for maximum shield generation each turn.",
      greed: "Your Tax passive generates shields from compound damage ticks. Play lots of compound damage cards early so they tick multiple times, generating shields over time.",
      envy: "Your Jealousy passive steals a percentage of healing. Target players who heal a lot (like Lust) to maximize your passive value.",
      pride: "Your Hubris passive multiplies effects of your highest-cost card each round. Always play at least one expensive card per round to trigger the multiplier.",
      lust: "Your Temptation passive heals you when you deal damage. Focus on consistent damage output rather than burst — more hits means more healing.",
      gluttony: "Your Devourer passive converts burned cards into energy. Use discard_burn cards early and often to fuel expensive plays later.",
    };

    if (passiveTips[mySin]) {
      tips.push({
        icon: Lightbulb,
        title: `${passiveInfo.name} passive strategy`,
        detail: passiveTips[mySin],
        severity: "suggestion",
        category: "faction",
      });
    }
  }

  // Sort: critical first, then important, then suggestions
  const severityOrder = { critical: 0, important: 1, suggestion: 2 };
  tips.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return tips.slice(0, 5); // Max 5 tips to avoid overwhelming
}

// ─── Component ──────────────────────────────────────────────────

export default function PostGameAnalysis({
  players,
  currentPlayerId,
  currentRound,
  sinColor,
  logEntries,
}: PostGameAnalysisProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const tips = useMemo(
    () => analyzeGame(players, currentPlayerId, currentRound, logEntries),
    [players, currentPlayerId, currentRound, logEntries]
  );

  if (tips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 5.2 }}
      className="w-full max-w-xl mb-4"
    >
      {/* Toggle header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full rounded-xl px-5 py-4 border text-left transition-all hover:border-opacity-50"
        style={{
          background: `linear-gradient(135deg, ${sinColor}10, ${sinColor}04)`,
          borderColor: `${sinColor}25`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${sinColor}20` }}
            >
              <Lightbulb className="w-4 h-4" style={{ color: sinColor }} />
            </div>
            <div>
              <p
                className="text-sm font-bold tracking-wider"
                style={{ fontFamily: "var(--font-heading)", color: sinColor }}
              >
                WHY DID I LOSE?
              </p>
              <p className="text-[10px] text-white/30" style={{ fontFamily: "var(--font-body)" }}>
                {tips.length} improvement tip{tips.length !== 1 ? "s" : ""} based on your game
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-white/30" />
          </motion.div>
        </div>
      </button>

      {/* Expandable tips */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-2">
              {tips.map((tip, i) => {
                const style = SEVERITY_STYLES[tip.severity];
                const Icon = tip.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`rounded-xl px-4 py-3 border ${style.border} ${style.bg}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${style.iconColor}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${style.labelBg} ${style.iconColor}`}
                          >
                            {style.label}
                          </span>
                          <p
                            className="text-xs font-bold text-white/70 truncate"
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            {tip.title}
                          </p>
                        </div>
                        <p
                          className="text-xs text-white/45 leading-relaxed"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {tip.detail}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* CTA to How to Play */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: tips.length * 0.1 + 0.2 }}
                className="text-center pt-2 pb-1"
              >
                <a
                  href="/how-to-play"
                  className="text-[10px] uppercase tracking-widest hover:underline transition-colors"
                  style={{ color: `${sinColor}80`, fontFamily: "var(--font-heading)" }}
                >
                  Read the full strategy guide →
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Export the analysis function for testing
export { analyzeGame };
export type { AnalysisTip };
