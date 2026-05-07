/**
 * CampaignRoundOneOverlay — boss reveal stinger before the first selection
 * phase of a campaign mission.
 *
 * Mounted in GameBoard. Watches the game state; when the player has just
 * arrived at a campaign-active game and currentRound is 1, shows a full
 * screen card announcing the act + boss name + epithet for ~2.6 seconds,
 * then fades out and hands control back to the game.
 *
 * Trigger conditions:
 *   - getActiveCampaignMission() returns a record matching the current gameId
 *   - the matched mission resolves via getMissionById
 *   - this overlay hasn't fired yet for this gameId
 *
 * Click the overlay to dismiss early.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import { getActiveCampaignMission } from "@/hooks/useCampaignProgress";
import { getMissionById, type CampaignMission } from "@shared/campaignData";
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

const SHOWN_KEY_PREFIX = "7sins_campaign_round_one_shown_";

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

interface Props {
  gameId: string | null | undefined;
  currentRound: number;
  status: string | undefined;
}

export default function CampaignRoundOneOverlay({ gameId, currentRound, status }: Props) {
  const [mission, setMission] = useState<CampaignMission | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!gameId || status !== "active" || currentRound !== 1) return;

    const active = getActiveCampaignMission();
    if (!active || active.gameId !== gameId) return;

    // Only fire once per gameId — survives mount/unmount in case the player
    // navigates away and back.
    const shownKey = `${SHOWN_KEY_PREFIX}${gameId}`;
    try {
      if (sessionStorage.getItem(shownKey)) return;
      sessionStorage.setItem(shownKey, "1");
    } catch {
      // sessionStorage may be unavailable; degrade gracefully.
    }

    const m = getMissionById(active.missionId);
    if (!m) return;
    setMission(m);
    setVisible(true);

    // Boss reveal stinger — fire if available; degrade silently if not.
    import("@/lib/cathedralSounds")
      .then((mod) => {
        safePlay(() => mod.playBellToll("deep"));
        window.setTimeout(() => safePlay(() => mod.playDeepResonance()), 250);
      })
      .catch(() => {});

    const t = window.setTimeout(() => setVisible(false), 2600);
    return () => window.clearTimeout(t);
  }, [gameId, currentRound, status]);

  if (!mission) return null;

  const sinColor = SIN_COLORS[mission.sin];
  const numeral = ACT_NUMERAL[mission.act - 1];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="round-one-reveal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => setVisible(false)}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm cursor-pointer"
          role="presentation"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center px-6"
          >
            <div
              className="text-[10px] sm:text-[11px] tracking-[0.6em] mb-4"
              style={{ fontFamily: "var(--font-heading)", color: sinColor }}
            >
              ACT {numeral} · {mission.title.toUpperCase()}
            </div>
            <motion.div
              initial={{ letterSpacing: "0.4em", opacity: 0 }}
              animate={{ letterSpacing: "0.04em", opacity: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="font-[Cinzel] text-5xl sm:text-6xl text-amber-300 mb-3"
              style={{ textShadow: `0 0 60px ${sinColor}` }}
            >
              {mission.boss.name}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xs sm:text-sm italic text-zinc-400"
            >
              {mission.boss.epithet}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="mt-8 text-[9px] tracking-[0.4em] text-zinc-500"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              CLICK TO BEGIN
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
