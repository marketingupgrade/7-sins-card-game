/**
 * Campaign data integrity tests.
 *
 * Asserts the structural invariants the Campaign UI and game-engine handoff
 * rely on. If any of these fail, the campaign UI will render broken tiles
 * or — worse — start a game with an unresolvable card ID and crash mid-fight.
 */
import { describe, expect, it } from "vitest";

import { getCardById } from "../shared/cardData";
import { CAMPAIGN_MISSIONS, ALL_TWIST_CARD_IDS, getMissionById, getMissionsForSin, isMissionUnlocked } from "../shared/campaignData";
import { BOSS_CARDS, getBossCardById } from "../shared/bossCards";
import type { SinType } from "../shared/gameTypes";

const ALL_SINS: SinType[] = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];

describe("campaign data — structural invariants", () => {
  it("ships exactly 21 missions (3 acts × 7 sins)", () => {
    expect(CAMPAIGN_MISSIONS).toHaveLength(21);
  });

  it("covers every sin with acts 1, 2, 3", () => {
    for (const sin of ALL_SINS) {
      const acts = getMissionsForSin(sin);
      expect(acts.map((m) => m.act)).toEqual([1, 2, 3]);
    }
  });

  it("every mission id is unique", () => {
    const ids = CAMPAIGN_MISSIONS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every mission's playerDeck is 30 card IDs that resolve to real cards", () => {
    for (const mission of CAMPAIGN_MISSIONS) {
      expect(mission.playerDeck).toHaveLength(30);
      for (const cardId of mission.playerDeck) {
        const card = getCardById(cardId);
        expect(card, `mission ${mission.id} references unknown card ${cardId}`).toBeDefined();
      }
    }
  });

  it("every boss deck is 30 card IDs that resolve, and live missions have exactly one twist card", () => {
    for (const mission of CAMPAIGN_MISSIONS) {
      expect(mission.boss.deck).toHaveLength(30);
      for (const cardId of mission.boss.deck) {
        expect(getCardById(cardId), `boss in ${mission.id} references unknown card ${cardId}`).toBeDefined();
      }
      if (!mission.comingSoon) {
        const twistCardCount = mission.boss.deck.filter((id) => ALL_TWIST_CARD_IDS.has(id)).length;
        expect(twistCardCount, `live mission ${mission.id} should have exactly one twist card`).toBe(1);
      }
    }
  });

  it("act-2 and act-3 missions reference an existing prerequisite", () => {
    for (const mission of CAMPAIGN_MISSIONS) {
      if (mission.act === 1) {
        expect(mission.unlockedBy).toBeNull();
      } else {
        expect(mission.unlockedBy).toBe(`${mission.sin}_${mission.act - 1}`);
        expect(getMissionById(mission.unlockedBy!)).toBeDefined();
      }
    }
  });

  it("non-stub missions have hand-written intro / outro / defeat lines", () => {
    for (const mission of CAMPAIGN_MISSIONS) {
      if (mission.comingSoon) continue;
      expect(mission.intro.length).toBeGreaterThan(40);
      expect(mission.outro.length).toBeGreaterThan(20);
      expect(mission.defeatLine.length).toBeGreaterThan(10);
    }
  });
});

describe("boss cards — getCardById fallthrough", () => {
  it("BOSS_CARDS ids never collide with PvP card ids", () => {
    // The PvP lookup checks ALL_DECKS first; if a boss id collided with a
    // faction card it would silently mask the real card. Make sure our
    // boss ids are obviously namespaced.
    for (const card of BOSS_CARDS) {
      expect(card.id.startsWith("boss_")).toBe(true);
    }
  });

  it("getCardById resolves boss-only cards via the bossCards fallback", () => {
    for (const boss of BOSS_CARDS) {
      const looked = getCardById(boss.id);
      expect(looked).toBeDefined();
      expect(looked!.name).toBe(boss.name);
    }
  });

  it("getBossCardById returns undefined for non-boss IDs", () => {
    expect(getBossCardById("wrath_01")).toBeUndefined();
    expect(getBossCardById("not_a_card")).toBeUndefined();
  });
});

describe("isMissionUnlocked", () => {
  it("act 1 is always unlocked when not coming-soon", () => {
    const wrath1 = getMissionById("wrath_1")!;
    expect(isMissionUnlocked(wrath1, new Set())).toBe(true);
  });

  it("coming-soon missions are never unlocked, even if their predecessor is cleared", () => {
    const sloth2 = getMissionById("sloth_2")!;
    expect(sloth2.comingSoon).toBe(true);
    expect(isMissionUnlocked(sloth2, new Set(["sloth_1"]))).toBe(false);
  });

  it("act 2 unlocks only after act 1 is in completedIds", () => {
    const wrath2 = getMissionById("wrath_2")!;
    expect(isMissionUnlocked(wrath2, new Set())).toBe(false);
    expect(isMissionUnlocked(wrath2, new Set(["wrath_1"]))).toBe(true);
  });

  it("act 3 unlocks only after act 2 is in completedIds", () => {
    const wrath3 = getMissionById("wrath_3")!;
    expect(isMissionUnlocked(wrath3, new Set(["wrath_1"]))).toBe(false);
    expect(isMissionUnlocked(wrath3, new Set(["wrath_1", "wrath_2"]))).toBe(true);
  });
});
