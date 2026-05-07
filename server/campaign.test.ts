/**
 * Campaign data integrity tests.
 *
 * Asserts the structural invariants the Campaign UI and game-engine handoff
 * rely on. If any of these fail, the campaign UI will render broken tiles
 * or — worse — start a game with an unresolvable card ID and crash mid-fight.
 */
import { describe, expect, it } from "vitest";

import { getCardById } from "../shared/cardData";
import {
  CAMPAIGN_MISSIONS,
  ALL_TWIST_CARD_IDS,
  buildArchetypeDeck,
  getMissionById,
  getMissionDifficulty,
  getMissionsForSin,
  isMissionUnlocked,
  type CampaignMission,
  type DeckArchetype,
} from "../shared/campaignData";
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

describe("deck archetypes", () => {
  const archetypes: DeckArchetype[] = ["starter", "balanced", "aggressive", "control", "elite"];

  it("every archetype × every sin produces exactly 30 unique card IDs", () => {
    for (const sin of ALL_SINS) {
      for (const archetype of archetypes) {
        const deck = buildArchetypeDeck(sin, archetype);
        expect(deck, `${sin}/${archetype} has wrong size`).toHaveLength(30);
        expect(
          new Set(deck).size,
          `${sin}/${archetype} contains duplicate IDs`
        ).toBe(30);
        for (const cardId of deck) {
          expect(getCardById(cardId), `${sin}/${archetype} references unknown ${cardId}`).toBeDefined();
        }
      }
    }
  });

  it("starter archetype contains no epic-tier cards (tutorial-friendly)", () => {
    for (const sin of ALL_SINS) {
      const deck = buildArchetypeDeck(sin, "starter");
      for (const cardId of deck) {
        const card = getCardById(cardId)!;
        expect(card.tier, `${sin} starter contains epic ${cardId}`).not.toBe("epic");
      }
    }
  });

  it("elite archetype contains all 12 epics from the faction pool", () => {
    for (const sin of ALL_SINS) {
      const deck = new Set(buildArchetypeDeck(sin, "elite"));
      // Each faction has exactly 12 epics; an elite deck must include all of them.
      // (We don't import ALL_DECKS in tests; instead verify by counting epic IDs in deck.)
      const epicCount = [...deck].filter((id) => getCardById(id)!.tier === "epic").length;
      expect(epicCount, `${sin} elite missing epics`).toBe(12);
    }
  });
});

describe("getMissionDifficulty", () => {
  it("Act 1 missions are 2-star (Apprentice)", () => {
    for (const m of CAMPAIGN_MISSIONS.filter((m) => m.act === 1)) {
      expect(getMissionDifficulty(m).stars).toBe(2);
    }
  });

  it("Act 3 missions are 5-star (Apex)", () => {
    for (const m of CAMPAIGN_MISSIONS.filter((m) => m.act === 3)) {
      expect(getMissionDifficulty(m).stars).toBe(5);
    }
  });

  it("Act 2 missions with hpBoost ≥ 100 escalate to 4-star (Reckoning)", () => {
    for (const m of CAMPAIGN_MISSIONS.filter((m) => m.act === 2)) {
      const expected = (m.boss.hpBoost ?? 0) >= 100 ? 4 : 3;
      expect(getMissionDifficulty(m).stars, `${m.id}`).toBe(expected);
    }
  });
});

describe("isMissionUnlocked", () => {
  it("act 1 is always unlocked when not coming-soon", () => {
    const wrath1 = getMissionById("wrath_1")!;
    expect(isMissionUnlocked(wrath1, new Set())).toBe(true);
  });

  it("coming-soon missions are never unlocked, even if their predecessor is cleared", () => {
    // Synthetic mission so this test survives once every act is live.
    // Mirrors what `stub()` produces in shared/campaignData.ts.
    const fake: CampaignMission = {
      id: "fake_mission_2",
      sin: "wrath",
      act: 2,
      title: "Stub",
      hook: "",
      intro: "",
      outro: "",
      defeatLine: "",
      playerDeck: [],
      boss: { name: "TBD", sin: "wrath", epithet: "", deck: [] },
      unlockedBy: "wrath_1",
      comingSoon: true,
    };
    expect(isMissionUnlocked(fake, new Set(["wrath_1"]))).toBe(false);
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
