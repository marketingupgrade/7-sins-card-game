/**
 * useCampaignProgress — Campaign mission completion tracking.
 *
 * Backed by localStorage for now; when we move to authenticated profiles
 * this can sync to a Supabase table without changing the hook signature.
 *
 * Storage shape under `7sins_campaign_progress`:
 *   { [missionId]: { completed: true; attempts: number; completedAt: string } }
 *
 * The "active mission" key (`7sins_campaign_active_mission`) lets the
 * GameBoard / GameOverScreen know the in-progress game came from a campaign
 * scenario so it can render the campaign-specific outro UI.
 */

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "7sins_campaign_progress";
const ACTIVE_MISSION_KEY = "7sins_campaign_active_mission";

export interface MissionRecord {
  completed: boolean;
  attempts: number;
  completedAt?: string;
}

export type CampaignProgressMap = Record<string, MissionRecord>;

function readProgress(): CampaignProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeProgress(progress: CampaignProgressMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage might be full or disabled; the in-memory state still works.
  }
}

export interface UseCampaignProgress {
  progress: CampaignProgressMap;
  completedIds: Set<string>;
  isCompleted: (missionId: string) => boolean;
  markAttempt: (missionId: string) => void;
  markCompleted: (missionId: string) => void;
  reset: () => void;
  refresh: () => void;
}

export function useCampaignProgress(): UseCampaignProgress {
  const [progress, setProgress] = useState<CampaignProgressMap>(() => readProgress());

  const refresh = useCallback(() => setProgress(readProgress()), []);

  useEffect(() => {
    // Pick up changes from another tab (e.g. game over flow writes, then user
    // navigates back to /campaign in a separate tab).
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const markAttempt = useCallback((missionId: string) => {
    setProgress((prev) => {
      const existing = prev[missionId] ?? { completed: false, attempts: 0 };
      const next: CampaignProgressMap = {
        ...prev,
        [missionId]: { ...existing, attempts: existing.attempts + 1 },
      };
      writeProgress(next);
      return next;
    });
  }, []);

  const markCompleted = useCallback((missionId: string) => {
    setProgress((prev) => {
      const existing = prev[missionId] ?? { completed: false, attempts: 0 };
      // Don't overwrite an earlier completedAt — first-clear timestamp matters.
      if (existing.completed && existing.completedAt) return prev;
      const next: CampaignProgressMap = {
        ...prev,
        [missionId]: {
          completed: true,
          attempts: existing.attempts || 1,
          completedAt: existing.completedAt ?? new Date().toISOString(),
        },
      };
      writeProgress(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setProgress({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const isCompleted = useCallback(
    (missionId: string) => Boolean(progress[missionId]?.completed),
    [progress]
  );

  const completedIds = new Set(
    Object.entries(progress)
      .filter(([, rec]) => rec.completed)
      .map(([id]) => id)
  );

  return { progress, completedIds, isCompleted, markAttempt, markCompleted, reset, refresh };
}

// ─── Active mission helpers (cross-page handoff) ─────────────────

export interface ActiveCampaignMission {
  missionId: string;
  gameId: string;
  startedAt: string;
}

export function setActiveCampaignMission(missionId: string, gameId: string): void {
  try {
    const payload: ActiveCampaignMission = {
      missionId,
      gameId,
      startedAt: new Date().toISOString(),
    };
    localStorage.setItem(ACTIVE_MISSION_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function getActiveCampaignMission(): ActiveCampaignMission | null {
  try {
    const raw = localStorage.getItem(ACTIVE_MISSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.missionId === "string" &&
      typeof parsed.gameId === "string"
    ) {
      return parsed as ActiveCampaignMission;
    }
  } catch {
    // ignore
  }
  return null;
}

export function clearActiveCampaignMission(): void {
  try {
    localStorage.removeItem(ACTIVE_MISSION_KEY);
  } catch {
    // ignore
  }
}
