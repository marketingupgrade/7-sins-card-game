/**
 * CampaignFight — pre-fight cinematic + game handoff for a single mission.
 *
 * Staged entrance:
 *   stage 0  → empty (initial frame)
 *   stage 1  → header reveals (act / sin tag / title / difficulty chip)
 *   stage 2  → boss portrait reveals (bell toll fires)
 *   stage 3  → typewriter narrator monologue plays
 *   stage 4  → intro complete; BEGIN button pulses
 *
 * On replay (mission already cleared) we skip directly to stage 4 — the
 * theatre is for first-time arrival, not for re-runs.
 *
 * On BEGIN we hold a 1.2s "stinger" overlay (deep resonance + bell toll)
 * before kicking off the real game-creation pipeline. That covers the
 * Supabase round-trips and gives the moment dramatic weight.
 *
 * After all setup (createGame → forced sins/decks → boss HP boost), we
 * mark the active mission in localStorage and navigate to /game/:gameId.
 * The existing GameBoard takes over from there. GameOverScreen reads
 * `getActiveCampaignMission()` to render the campaign-specific outro.
 */

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, FastForward, Loader2, Swords } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useRoute } from "wouter";

import EmberField from "@/components/EmberField";
import TypewriterText from "@/components/TypewriterText";
import { useCampaignProgress, setActiveCampaignMission } from "@/hooks/useCampaignProgress";
import { usePageMeta } from "@/hooks/usePageMeta";
import { usePlayerId } from "@/hooks/usePlayerId";
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import {
  getMissionById,
  getMissionDifficulty,
  isMissionUnlocked,
  type CampaignMission,
} from "@shared/campaignData";
import type { SinType } from "@shared/gameTypes";

const lazyGameEngine = () => import("@/lib/gameEngine");
const lazyBotEngine = () => import("@/lib/botEngine");
const lazyCathedralSounds = () => import("@/lib/cathedralSounds");
const lazySoundEngine = () => import("@/lib/soundEngine");

const SIN_COLORS: Record<SinType, string> = {
  wrath: "#ef4444",
  sloth: "#a855f7",
  greed: "#eab308",
  envy: "#10b981",
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

// Audio is best-effort: if the browser blocks the autoplay (no user gesture
// yet) the imports throw or the play() promise rejects. We swallow those
// silently — the cinematic still works without sound.
function safePlay(fn: () => unknown) {
  try {
    const result = fn();
    if (result && typeof (result as Promise<unknown>).then === "function") {
      (result as Promise<unknown>).catch(() => {});
    }
  } catch {
    // ignore
  }
}

export default function CampaignFight() {
  const [, params] = useRoute("/campaign/:missionId");
  const [, setLocation] = useLocation();
  const playerId = usePlayerId();
  const { completedIds, isCompleted, markAttempt } = useCampaignProgress();
  const [error, setError] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [showStinger, setShowStinger] = useState(false);

  const missionId = params?.missionId ?? "";
  const mission = getMissionById(missionId);
  const alreadyCleared = mission ? isCompleted(mission.id) : false;

  // Cinematic stage. On replay we skip the theatre and jump to stage 4.
  const [stage, setStage] = useState(alreadyCleared ? 4 : 0);
  const stageTimersRef = useRef<number[]>([]);

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

  // Drive the staged entrance. Each stage delays the next via setTimeout so
  // the user sees the panel build instead of slamming in all at once.
  useEffect(() => {
    if (!mission || alreadyCleared) return;
    const t1 = window.setTimeout(() => setStage((s) => Math.max(s, 1)), 250);
    const t2 = window.setTimeout(() => {
      setStage((s) => Math.max(s, 2));
      // Boss reveal stinger — soft bell to telegraph the threat.
      lazyCathedralSounds().then((m) => safePlay(() => m.playBellToll("soft"))).catch(() => {});
    }, 900);
    const t3 = window.setTimeout(() => setStage((s) => Math.max(s, 3)), 1700);
    stageTimersRef.current.push(t1, t2, t3);
    return () => {
      stageTimersRef.current.forEach((t) => window.clearTimeout(t));
      stageTimersRef.current = [];
    };
  }, [mission, alreadyCleared]);

  const skipIntro = useCallback(() => {
    stageTimersRef.current.forEach((t) => window.clearTimeout(t));
    stageTimersRef.current = [];
    setStage(4);
  }, []);

  const handleTypewriterTick = useCallback(() => {
    // A whisper-quiet "tap" every few characters during the typewriter;
    // the existing soundEngine already handles volume + the music toggle.
    lazySoundEngine().then((m) => m.soundEngine.playSfx("tap")).catch(() => {});
  }, []);

  const onIntroComplete = useCallback(() => setStage((s) => Math.max(s, 4)), []);

  if (!mission) return null;

  async function startMission(m: CampaignMission) {
    if (isLaunching) return;
    setError(null);
    setIsLaunching(true);

    // Pre-fight stinger: hold a dramatic 1.2s with a deep resonance + toll
    // while the Supabase round-trips happen behind the scenes.
    setShowStinger(true);
    lazyCathedralSounds()
      .then((mod) => {
        safePlay(() => mod.playDeepResonance());
        window.setTimeout(() => safePlay(() => mod.playBellToll("deep")), 350);
      })
      .catch(() => {});

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

      // 3. Add the boss bot, force its sin + custom deck + display name.
      const { botId } = await addBot(gameId);
      const sb = getClientSupabase();
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

      // Honour the stinger duration even if the network was fast.
      const elapsed = Date.now() - stingerStartRef.current;
      const remaining = Math.max(0, 1200 - elapsed);
      window.setTimeout(() => setLocation(`/game/${gameId}`), remaining);
    } catch (err) {
      console.error("[CampaignFight] Failed to launch:", err);
      setError(
        err instanceof Error
          ? err.message
          : "The arena refused you. Try again."
      );
      setIsLaunching(false);
      setShowStinger(false);
    }
  }

  const stingerStartRef = useRef<number>(0);
  const handleBegin = useCallback(() => {
    stingerStartRef.current = Date.now();
    void startMission(mission);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission, isLaunching]);

  const sinColor = SIN_COLORS[mission.sin];
  const numeral = ACT_NUMERAL[mission.act - 1];
  const diff = useMemo(() => getMissionDifficulty(mission), [mission]);
  const showHeader = stage >= 1;
  const showBoss = stage >= 2;
  const showIntro = stage >= 3;
  const showBegin = stage >= 4;

  return (
    <div className="min-h-screen bg-[var(--color-page-bg-deep)] relative overflow-hidden text-zinc-100">
      {/* Sin-tinted radial gradient — different per mission so each scene
          has its own atmosphere. Sits behind the embers and the panel. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(circle at 50% 35%, ${sinColor}22 0%, transparent 55%), radial-gradient(circle at 80% 90%, ${sinColor}10 0%, transparent 60%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-40 mix-blend-overlay"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${sinColor}08 100%)`,
        }}
      />
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

      {/* "Skip intro" appears while the cinematic is still building (or typing). */}
      {!alreadyCleared && stage < 4 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          whileHover={{ opacity: 1 }}
          onClick={skipIntro}
          className="fixed top-4 right-4 z-50 inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
          style={{ fontFamily: "var(--font-heading)" }}
          aria-label="Skip intro cinematic"
        >
          <FastForward className="w-3.5 h-3.5" />
          SKIP
        </motion.button>
      )}

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden"
          style={{ boxShadow: `0 0 0 1px ${sinColor}22, 0 30px 80px ${sinColor}15` }}
        >
          <AnimatePresence>
            {showHeader && (
              <motion.div
                key="header"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="px-6 sm:px-10 pt-8 pb-6 border-b border-white/5"
              >
                <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                  <div className="flex items-center gap-2">
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
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border"
                    style={{
                      borderColor: `${diff.accent}55`,
                      background: `${diff.accent}10`,
                    }}
                    title={`Difficulty: ${diff.label} (${diff.stars}/5)`}
                  >
                    <span aria-hidden="true" style={{ color: diff.accent }} className="text-[11px] tracking-tighter">
                      {"★".repeat(diff.stars)}
                      <span className="opacity-30">{"★".repeat(5 - diff.stars)}</span>
                    </span>
                    <span
                      className="text-[10px] tracking-[0.25em]"
                      style={{ fontFamily: "var(--font-heading)", color: diff.accent }}
                    >
                      {diff.label.toUpperCase()}
                    </span>
                  </motion.div>
                </div>
                <motion.h1
                  initial={{ opacity: 0, letterSpacing: "0.5em" }}
                  animate={{ opacity: 1, letterSpacing: "0.04em" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="font-[Cinzel] text-3xl sm:text-4xl text-amber-400"
                  style={{ textShadow: `0 0 20px ${sinColor}33` }}
                >
                  {mission.title}
                </motion.h1>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="px-6 sm:px-10 py-8 grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-6 items-start">
            <AnimatePresence>
              {showBoss && (
                <motion.div
                  key="boss"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="flex sm:block items-center gap-4"
                >
                  <motion.div
                    initial={{ boxShadow: `0 0 0 0 ${sinColor}00, 0 0 0 ${sinColor}00` }}
                    animate={{
                      boxShadow: `0 0 0 2px ${sinColor}55, 0 0 60px ${sinColor}55`,
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden mx-auto"
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
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="mt-3 text-center"
                  >
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
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showBoss && (
                <motion.div
                  key="intro-block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
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
                  <p className="text-[15px] leading-relaxed text-zinc-200 whitespace-pre-line min-h-[8rem]">
                    {showIntro ? (
                      <TypewriterText
                        text={mission.intro}
                        instant={alreadyCleared || stage >= 4}
                        speed={20}
                        tickEvery={6}
                        onTick={handleTypewriterTick}
                        onComplete={onIntroComplete}
                      />
                    ) : null}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-6 sm:px-10 pb-8 pt-2">
            {error && (
              <div className="mb-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-300">
                {error}
              </div>
            )}
            <AnimatePresence>
              {showBegin && (
                <motion.button
                  key="begin"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  onClick={handleBegin}
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
                      {alreadyCleared ? "REPLAY MISSION" : "BEGIN"}
                    </>
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <p className="mt-6 text-center text-[11px] text-zinc-500 italic max-w-md mx-auto leading-relaxed">
          The narrator may improvise mid-fight reactions. The boss carries one
          card you've never seen.
        </p>
      </div>

      {/* Pre-fight stinger overlay. Held while Supabase round-trips run. */}
      <AnimatePresence>
        {showStinger && (
          <motion.div
            key="stinger"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center"
            >
              <div
                className="text-[10px] tracking-[0.6em] mb-3"
                style={{ fontFamily: "var(--font-heading)", color: sinColor }}
              >
                ENTER THE ARENA
              </div>
              <div
                className="font-[Cinzel] text-4xl sm:text-5xl text-amber-300"
                style={{ textShadow: `0 0 40px ${sinColor}` }}
              >
                {mission.boss.name}
              </div>
              <div className="text-xs italic text-zinc-400 mt-2">
                {mission.boss.epithet}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
