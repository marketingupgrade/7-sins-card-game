/**
 * CampaignContinueTile — Home-page "resume your campaign" affordance.
 *
 * Reads the player's local campaign progress, picks the most useful next
 * mission (an attempted-but-uncleared mission first, otherwise the next
 * unlocked mission after their cleared streak), and surfaces it as a
 * compact tile linking straight to /campaign/:missionId.
 *
 * If the player has no campaign history (no attempts, no clears), this
 * component renders nothing so first-time visitors aren't nagged.
 */

import { motion } from "framer-motion";
import { ArrowRight, Swords } from "lucide-react";
import { Link } from "wouter";
import { useMemo } from "react";

import { useCampaignProgress } from "@/hooks/useCampaignProgress";
import {
  getContinueMission,
  getMissionDifficulty,
  type CampaignMission,
} from "@shared/campaignData";
import type { SinType } from "@shared/gameTypes";

const SIN_COLORS: Record<SinType, string> = {
  wrath: "#ef4444",
  sloth: "#a855f7",
  greed: "#eab308",
  envy: "#10b981",
  pride: "#f0f0f0",
  lust: "#ec4899",
  gluttony: "#b45309",
};

const ACT_NUMERAL = ["I", "II", "III"] as const;

export default function CampaignContinueTile() {
  const { progress, completedIds } = useCampaignProgress();

  const mission: CampaignMission | null = useMemo(() => {
    const attempts: Record<string, number> = {};
    for (const [id, rec] of Object.entries(progress)) attempts[id] = rec.attempts;
    return getContinueMission(attempts, completedIds);
  }, [progress, completedIds]);

  if (!mission) return null;

  const sinColor = SIN_COLORS[mission.sin];
  const numeral = ACT_NUMERAL[mission.act - 1];
  const diff = getMissionDifficulty(mission);
  const wasAttempted = (progress[mission.id]?.attempts ?? 0) > 0;
  const ctaLabel = wasAttempted ? "RESUME" : "CONTINUE";

  return (
    <Link href={`/campaign/${mission.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.99 }}
        className="group relative w-full rounded-xl border bg-black/30 backdrop-blur-sm cursor-pointer overflow-hidden mb-2"
        style={{
          borderColor: `${sinColor}40`,
          boxShadow: `inset 0 0 0 1px ${sinColor}20`,
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 0% 50%, ${sinColor}33, transparent 60%)`,
          }}
        />
        <div className="relative flex items-center gap-3 px-4 py-3">
          <div
            className="flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${sinColor}33, ${sinColor}11)`,
              border: `1px solid ${sinColor}55`,
            }}
          >
            <Swords className="w-4 h-4" style={{ color: sinColor }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-[9px] tracking-[0.3em] text-zinc-500"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                ACT {numeral}
              </span>
              <span
                className="text-[9px] tracking-[0.3em]"
                style={{ fontFamily: "var(--font-heading)", color: diff.accent }}
                title={`Difficulty: ${diff.label}`}
              >
                {diff.label.toUpperCase()}
              </span>
            </div>
            <div
              className="font-[Cinzel] text-sm text-zinc-100 truncate"
              style={{ color: sinColor }}
            >
              {mission.title}
            </div>
            <div className="text-[10px] text-zinc-500 italic truncate">
              vs. {mission.boss.name}
            </div>
          </div>
          <div
            className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] tracking-[0.2em] text-zinc-300 group-hover:text-white transition-colors"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {ctaLabel}
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
