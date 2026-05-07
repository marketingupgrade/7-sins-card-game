/**
 * CampaignFight — pre-fight intro overlay + game handoff for a single mission.
 *
 * Flow:
 *   1. Mount with `:missionId` from the URL.
 *   2. If mission is locked / coming soon, redirect back to /campaign.
 *   3. Render a full-screen intro panel: title, boss portrait, hand-written
 *      narrator monologue, and a BEGIN button.
 *   4. On BEGIN we create a real game (host = the player), force the player's
 *      sin and custom deck, add a bot, force the boss's sin and custom deck,
 *      mark the active campaign mission in localStorage, then navigate the
 *      user to /game/:gameId. The existing GameBoard takes over from there.
 *   5. The GameOverScreen reads `getActiveCampaignMission()` and renders the
 *      campaign-specific outro / return path.
 */

import { motion } from "framer-motion";
import { ChevronRight, Loader2, Swords } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";

import EmberField from "@/components/EmberField";
import { useCampaignProgress, setActiveCampaignMission } from "@/hooks/useCampaignProgress";
import { usePageMeta } from "@/hooks/usePageMeta";
import { usePlayerId } from "@/hooks/usePlayerId";
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import {
  getMissionById,
  isMissionUnlocked,
  type CampaignMission,
} from "@shared/campaignData";
import type { SinType } from "@shared/gameTypes";

const lazyGameEngine = () => import("@/lib/gameEngine");
const lazyBotEngine = () => import("@/lib/botEngine");

const SIN_COLORS: Record<SinType, string> = {
  wrath: "#ef4444",
  sloth: "#a855f7",
  greed: "#eab308",
  envy: "#22c55e",
  pride: "#f0f0f0",
  lust: "#ec4899",
  gluttony: "#b45309",
};

const SIN_LABELS: Record<SinType, string> = {
  wrath: "Wrath",
  sloth: "Sloth",
  greed: "Greed",
  envy: "Envy",
  pride: "Pride",
  lust: "Lust",
  gluttony: "Gluttony",
};

const ACT_NUMERAL = ["I", "II", "III"] as const;

export default function CampaignFight() {
  const [, params] = useRoute("/campaign/:missionId");
  const [, setLocation] = useLocation();
  const playerId = usePlayerId();
  const { completedIds, markAttempt } = useCampaignProgress();
  const [error, setError] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  const missionId = params?.missionId ?? "";
  const mission = getMissionById(missionId);

  usePageMeta({
    title: mission ? `${mission.title} — Campaign — 7 Deadly Sins` : "Campaign",
    description: mission?.hook ?? "",
    canonicalPath: `/campaign/${missionId}`,
    noindex: true,
  });

  // Bounce back if the mission is missing, stubbed, or its predecessor isn't cleared.
  useEffect(() => {
    if (!mission) {
      setLocation("/campaign");
      return;
    }
    if (mission.comingSoon || !isMissionUnlocked(mission, completedIds)) {
      setLocation("/campaign");
    }
  }, [mission, completedIds, setLocation]);

  if (!mission) return null;

  async function startMission(m: CampaignMission) {
    if (isLaunching) return;
    setError(null);
    setIsLaunching(true);

    try {
      const { createGame, chooseSin, startGame, setCustomDeck, setTurnTimer } =
        await lazyGameEngine();
      const { addBot } = await lazyBotEngine();
      const { getClientSupabase } = await import("../../../shared/supabaseClient");

      const username = localStorage.getItem("7sins_username") || "Sinner";

      // 1. Create the game with the player as host.
      const { gameId } = await createGame(playerId, username);

      // 2. Force the player into the mission's sin + curated deck.
      await chooseSin(gameId, playerId, m.sin);
      await setCustomDeck(gameId, playerId, m.playerDeck);

      // 3. Add the boss bot, force its sin + custom deck.
      const { botId } = await addBot(gameId);
      const sb = getClientSupabase();
      // Override the bot's username so it reads as the boss in the UI.
      await sb.from("players").update({ username: m.boss.name }).eq("id", botId);
      await sb
        .from("game_players")
        .update({ chosen_sin: m.boss.sin })
        .eq("game_id", gameId)
        .eq("player_id", botId);
      await setCustomDeck(gameId, botId, m.boss.deck);

      // 4. Generous timer so players can savour the boss's intro animations.
      await setTurnTimer(gameId, 30);

      // 5. Mark the mission as in-progress so GameOverScreen knows to show
      //    the campaign-specific outro path. Increment attempts before the
      //    fight starts so retries are counted even if the player rage-quits.
      setActiveCampaignMission(m.id, gameId);
      markAttempt(m.id);

      // 6. Start the game. `startGame` resets every player's HP to
      //    STARTING_HP, so any boss HP boost has to land *after* it.
      await startGame(gameId);

      if (m.boss.hpBoost && m.boss.hpBoost > 0) {
        const { STARTING_HP } = await import("../../../shared/gameTypes");
        const boostedHp = STARTING_HP + m.boss.hpBoost;
        await sb
          .from("game_players")
          .update({ current_hp: boostedHp, max_hp: boostedHp })
          .eq("game_id", gameId)
          .eq("player_id", botId);
      }

      setLocation(`/game/${gameId}`);
    } catch (err) {
      console.error("[CampaignFight] Failed to launch:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to start the mission. Please try again."
      );
      setIsLaunching(false);
    }
  }

  const sinColor = SIN_COLORS[mission.sin];
  const numeral = ACT_NUMERAL[mission.act - 1];

  return (
    <div className="min-h-screen bg-[var(--color-page-bg-deep)] relative overflow-hidden text-zinc-100">
      <EmberField count={28} />

      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => setLocation("/campaign")}
        disabled={isLaunching}
        className="fixed top-4 left-4 z-50 flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors disabled:opacity-30"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        BACK TO CAMPAIGN
      </motion.button>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden"
          style={{ boxShadow: `0 0 0 1px ${sinColor}22, 0 30px 80px ${sinColor}15` }}
        >
          <div className="px-6 sm:px-10 pt-8 pb-6 border-b border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[10px] tracking-[0.4em] text-zinc-500"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                ACT {numeral}
              </span>
              <span className="text-zinc-700">·</span>
              <span
                className="text-[10px] tracking-[0.4em]"
                style={{ fontFamily: "var(--font-heading)", color: sinColor }}
              >
                {SIN_LABELS[mission.sin].toUpperCase()}
              </span>
            </div>
            <h1
              className="font-[Cinzel] text-3xl sm:text-4xl text-amber-400 tracking-wide"
              style={{ textShadow: `0 0 20px ${sinColor}33` }}
            >
              {mission.title}
            </h1>
          </div>

          <div className="px-6 sm:px-10 py-8 grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-6 items-start">
            <div className="flex sm:block items-center gap-4">
              <div
                className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden mx-auto"
                style={{ boxShadow: `0 0 0 2px ${sinColor}55, 0 0 40px ${sinColor}33` }}
              >
                <img
                  src={FACTION_PORTRAITS[mission.boss.sin]}
                  alt={mission.boss.name}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 mix-blend-overlay"
                  style={{ background: `linear-gradient(135deg, ${sinColor}33, transparent 60%)` }}
                />
              </div>
              <div className="mt-3 text-center sm:text-center">
                <p
                  className="text-[10px] tracking-[0.3em] text-zinc-500 mb-1"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  OPPONENT
                </p>
                <p
                  className="font-[Cinzel] text-base"
                  style={{ color: sinColor }}
                >
                  {mission.boss.name}
                </p>
                <p className="text-[11px] text-zinc-500 italic">
                  {mission.boss.epithet}
                </p>
                {mission.boss.hpBoost && mission.boss.hpBoost > 0 && (
                  <p
                    className="mt-2 inline-block px-2 py-0.5 rounded-full text-[9px] tracking-[0.2em] border border-red-400/30 bg-red-400/10 text-red-300"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    +{mission.boss.hpBoost} HP
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <img
                  src={SIN_ARCHETYPE_ICONS[mission.sin]}
                  alt=""
                  aria-hidden="true"
                  className="w-4 h-4 opacity-70"
                />
                <span
                  className="text-[10px] tracking-[0.3em] text-zinc-500"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  YOU PLAY {SIN_LABELS[mission.sin].toUpperCase()}
                </span>
              </div>
              <p className="text-[15px] leading-relaxed text-zinc-200 whitespace-pre-line">
                {mission.intro}
              </p>
            </div>
          </div>

          <div className="px-6 sm:px-10 pb-8 pt-2">
            {error && (
              <div className="mb-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-300">
                {error}
              </div>
            )}
            <button
              onClick={() => startMission(mission)}
              disabled={isLaunching}
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-[Cinzel] tracking-[0.2em] text-sm transition-all"
              style={{
                background: isLaunching
                  ? "rgba(255,255,255,0.04)"
                  : `linear-gradient(135deg, ${sinColor}, ${sinColor}aa)`,
                color: isLaunching ? "#9ca3af" : "#0a0a0f",
                cursor: isLaunching ? "wait" : "pointer",
                boxShadow: isLaunching ? "none" : `0 10px 40px ${sinColor}55`,
              }}
            >
              {isLaunching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  ENTERING THE ARENA…
                </>
              ) : (
                <>
                  <Swords className="w-4 h-4" />
                  BEGIN
                </>
              )}
            </button>
          </div>
        </motion.div>

        <p className="mt-6 text-center text-[11px] text-zinc-500 italic max-w-md mx-auto leading-relaxed">
          The narrator may improvise mid-fight reactions. The boss carries one
          card you've never seen.
        </p>
      </div>
    </div>
  );
}
