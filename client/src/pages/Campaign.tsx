/**
 * Campaign — Mission selector for the 21-act story mode.
 *
 * Renders the seven sins as columns; each column shows three mission tiles
 * (Acts I / II / III). Tile state:
 *   - locked    → previous act not yet beaten (or sin's act 1 not built yet)
 *   - available → can be entered
 *   - completed → previously cleared (replayable)
 *   - coming soon → mission stubbed; can't be entered
 *
 * Uses `useCampaignProgress` for local progress state. The actual fight
 * setup lives in `CampaignFight.tsx`.
 */

import { motion } from "framer-motion";
import { ChevronRight, Lock, Sparkles, Swords } from "lucide-react";
import { useMemo } from "react";
import { useLocation } from "wouter";

import EmberField from "@/components/EmberField";
import { useCampaignProgress } from "@/hooks/useCampaignProgress";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import {
  CAMPAIGN_MISSIONS,
  getMissionDifficulty,
  getMissionsForSin,
  isMissionUnlocked,
  type CampaignMission,
} from "@shared/campaignData";
import type { SinType } from "@shared/gameTypes";

const SIN_ORDER: SinType[] = [
  "wrath",
  "sloth",
  "greed",
  "envy",
  "pride",
  "lust",
  "gluttony",
];

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

type TileState = "locked" | "available" | "completed" | "comingSoon";

function tileStateFor(
  mission: CampaignMission,
  completedIds: ReadonlySet<string>
): TileState {
  if (mission.comingSoon) return "comingSoon";
  if (completedIds.has(mission.id)) return "completed";
  if (isMissionUnlocked(mission, completedIds)) return "available";
  return "locked";
}

export default function Campaign() {
  usePageMeta({
    title: "Campaign — 7 Deadly Sins Card Game",
    description:
      "Twenty-one hand-tuned scenarios. Three trials per sin. Boss-only twist cards. The sarcastic narrator is judging you the whole way.",
    canonicalPath: "/campaign",
  });

  const [, setLocation] = useLocation();
  const { completedIds, isCompleted } = useCampaignProgress();

  const totalLive = useMemo(
    () => CAMPAIGN_MISSIONS.filter((m) => !m.comingSoon).length,
    []
  );
  const completedCount = CAMPAIGN_MISSIONS.filter(
    (m) => !m.comingSoon && isCompleted(m.id)
  ).length;

  return (
    <div className="min-h-screen bg-[var(--color-page-bg-deep)] relative overflow-hidden text-zinc-100">
      <EmberField count={20} />

      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => setLocation("/")}
        className="fixed top-4 left-4 z-50 flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        BACK
      </motion.button>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <p
            className="text-[10px] tracking-[0.4em] text-amber-400/70 mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            CAMPAIGN
          </p>
          <h1
            className="font-[Cinzel] text-4xl sm:text-5xl text-amber-400 tracking-wide mb-4"
            style={{ textShadow: "0 0 24px rgba(212,168,84,0.25)" }}
          >
            Twenty-One Trials
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Three acts per sin. Each boss carries a card you'll never see in PvP.
            The narrator reserves a fresh contempt for your campaign run — try not
            to disappoint.
          </p>
          <div
            className="mt-5 inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-amber-400/20 bg-amber-400/5 text-xs"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400/80" />
            <span className="text-zinc-300 tracking-wider">
              {completedCount}/{totalLive} CLEARED
            </span>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {SIN_ORDER.map((sin, sinIdx) => {
            const acts = getMissionsForSin(sin);
            const sinColor = SIN_COLORS[sin];
            return (
              <motion.section
                key={sin}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * sinIdx }}
                className="rounded-xl border border-white/5 bg-black/20 p-3 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 mb-3 px-1">
                  <img
                    src={SIN_ARCHETYPE_ICONS[sin]}
                    alt=""
                    aria-hidden="true"
                    className="w-5 h-5 object-contain opacity-80"
                  />
                  <h2
                    className="font-[Cinzel] text-base tracking-wide"
                    style={{ color: sinColor }}
                  >
                    {SIN_LABELS[sin]}
                  </h2>
                </div>
                <div className="flex flex-col gap-2">
                  {acts.map((mission) => {
                    const state = tileStateFor(mission, completedIds);
                    return (
                      <MissionTile
                        key={mission.id}
                        mission={mission}
                        state={state}
                        sinColor={sinColor}
                        onClick={() => {
                          if (state === "available" || state === "completed") {
                            setLocation(`/campaign/${mission.id}`);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </motion.section>
            );
          })}
        </div>

        <p className="mt-12 text-center text-xs text-zinc-500 italic max-w-xl mx-auto">
          Acts II and III unlock by clearing the previous act. Stubbed missions
          (greyed out) ship in subsequent updates — the loop is fully playable
          on Wrath today.
        </p>
      </div>
    </div>
  );
}

// ─── Subcomponent ────────────────────────────────────────────────

function MissionTile({
  mission,
  state,
  sinColor,
  onClick,
}: {
  mission: CampaignMission;
  state: TileState;
  sinColor: string;
  onClick: () => void;
}) {
  const numeral = ACT_NUMERAL[mission.act - 1];
  const interactable = state === "available" || state === "completed";

  return (
    <button
      onClick={onClick}
      disabled={!interactable}
      className={[
        "group relative text-left rounded-lg p-3 transition-all border",
        interactable
          ? "cursor-pointer border-white/10 hover:border-white/30 hover:bg-white/[0.04]"
          : "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-60",
      ].join(" ")}
      style={
        state === "completed"
          ? {
              borderColor: `${sinColor}55`,
              boxShadow: `inset 0 0 0 1px ${sinColor}22`,
            }
          : undefined
      }
    >
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="text-[10px] tracking-[0.3em] text-zinc-500"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          ACT {numeral}
        </span>
        <StateBadge state={state} sinColor={sinColor} />
      </div>
      <h3
        className="font-[Cinzel] text-sm text-zinc-100 mb-1 leading-tight"
        style={state === "completed" ? { color: sinColor } : undefined}
      >
        {mission.title}
      </h3>
      <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2 mb-2">
        {mission.hook}
      </p>
      <DifficultyChip mission={mission} />
      {interactable && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-zinc-500 group-hover:text-zinc-200 transition-colors">
          <Swords className="w-3 h-3" />
          <span style={{ fontFamily: "var(--font-heading)" }}>
            {state === "completed" ? "REPLAY" : "BEGIN"}
          </span>
        </div>
      )}
    </button>
  );
}

function DifficultyChip({ mission }: { mission: CampaignMission }) {
  const { stars, label, accent } = getMissionDifficulty(mission);
  return (
    <div
      className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded border"
      style={{
        borderColor: `${accent}40`,
        background: `${accent}10`,
      }}
      title={`${label} — ${stars}/5`}
    >
      <span aria-hidden="true" className="text-[8px] tracking-tighter" style={{ color: accent }}>
        {"★".repeat(stars)}
        <span className="opacity-30">{"★".repeat(5 - stars)}</span>
      </span>
      <span
        className="text-[9px] tracking-[0.15em]"
        style={{ fontFamily: "var(--font-heading)", color: accent }}
      >
        {label.toUpperCase()}
      </span>
    </div>
  );
}

function StateBadge({ state, sinColor }: { state: TileState; sinColor: string }) {
  if (state === "locked") {
    return <Lock className="w-3 h-3 text-zinc-600" />;
  }
  if (state === "comingSoon") {
    return (
      <span
        className="text-[9px] tracking-widest text-zinc-600"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        SOON
      </span>
    );
  }
  if (state === "completed") {
    return (
      <span
        className="text-[9px] tracking-widest"
        style={{ fontFamily: "var(--font-heading)", color: sinColor }}
      >
        CLEARED
      </span>
    );
  }
  return null;
}
