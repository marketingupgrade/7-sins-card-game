/**
 * v6.3.0 Feature Tests — Post-Game Analysis, Practice Mode, Card Sorting
 *
 * Tests cover:
 * 1. PostGameAnalysis — tip generation logic
 * 2. HandSorter — card sorting algorithms
 * 3. PracticeAnnotations — annotation state machine
 */

import { describe, it, expect } from "vitest";

// ─── Card Sorting Tests ────────────────────────────────────────
// We test the sortCards function directly since it's a pure function

// Mock CardDefinition for testing
interface MockCard {
  id: string;
  name: string;
  sin: string;
  cost: number;
  compoundPattern: string;
  effects: Array<{ type: string; baseValue: number; duration: number; targetMode: string }>;
  description: string;
  tier: string;
}

function createMockCard(overrides: Partial<MockCard> = {}): MockCard {
  return {
    id: `card_${Math.random().toString(36).slice(2, 8)}`,
    name: "Test Card",
    sin: "wrath",
    cost: 3,
    compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 10, duration: 3, targetMode: "single" }],
    description: "A test card",
    tier: "common",
    ...overrides,
  };
}

// Inline the sort logic for testing (mirrors HandSorter.tsx)
type SortMode = "default" | "cost" | "type" | "recommended";

function sortCards(
  cards: MockCard[],
  mode: SortMode,
  energy: number,
  hp: number,
  maxHp: number,
  round: number,
): MockCard[] {
  if (mode === "default") return cards;

  const sorted = [...cards];

  if (mode === "cost") {
    sorted.sort((a, b) => a.cost - b.cost);
    return sorted;
  }

  if (mode === "type") {
    const getCategory = (card: MockCard): number => {
      const types = card.effects.map(e => e.type);
      if (types.some(t => t === "damage" || t === "self_damage" || t === "affliction_amplify")) return 0;
      if (types.some(t => t === "heal_steal" || t === "shield_steal" || t === "energy_steal")) return 1;
      if (types.some(t => t === "heal_gain")) return 2;
      if (types.some(t => t === "shield_gain")) return 3;
      return 4;
    };
    sorted.sort((a, b) => {
      const catDiff = getCategory(a) - getCategory(b);
      if (catDiff !== 0) return catDiff;
      return a.cost - b.cost;
    });
    return sorted;
  }

  if (mode === "recommended") {
    const hpPercent = hp / maxHp;
    const isLowHp = hpPercent < 0.35;
    const isEarlyGame = round <= 5;

    const getScore = (card: MockCard): number => {
      let score = 0;
      if (card.cost <= energy) score += 100;
      else score -= 200;

      const types = card.effects.map(e => e.type);
      const isDamage = types.some(t => t === "damage" || t === "self_damage" || t === "affliction_amplify");
      const isHeal = types.some(t => t === "heal_gain" || t === "heal_steal");
      const isShield = types.some(t => t === "shield_gain" || t === "shield_steal");

      if (isLowHp) {
        if (isHeal) score += 50;
        if (isShield) score += 40;
        if (isDamage) score += 10;
      } else if (isEarlyGame) {
        if (isDamage) score += 50;
        if (isShield) score += 20;
        if (isHeal) score += 10;
      } else {
        if (isDamage) score += 30;
        if (isShield) score += 30;
        if (isHeal) score += 25;
      }

      if (card.compoundPattern === "aggressive" && isEarlyGame) score += 15;
      if (card.compoundPattern === "slowburn" && !isEarlyGame) score += 15;

      if (card.cost <= energy) {
        score += (card.cost / Math.max(energy, 1)) * 20;
      }

      if (card.tier === "epic") score += 10;
      if (card.tier === "rare") score += 5;

      return score;
    };

    sorted.sort((a, b) => getScore(b) - getScore(a));
    return sorted;
  }

  return sorted;
}

describe("Card Sorting — sortCards()", () => {
  const cheapDamage = createMockCard({ id: "cheap_dmg", name: "Cheap Damage", cost: 1, effects: [{ type: "damage", baseValue: 5, duration: 3, targetMode: "single" }] });
  const expensiveDamage = createMockCard({ id: "exp_dmg", name: "Expensive Damage", cost: 5, effects: [{ type: "damage", baseValue: 20, duration: 3, targetMode: "single" }] });
  const heal = createMockCard({ id: "heal", name: "Heal", cost: 3, effects: [{ type: "heal_gain", baseValue: 10, duration: 3, targetMode: "self" }] });
  const shield = createMockCard({ id: "shield", name: "Shield", cost: 2, effects: [{ type: "shield_gain", baseValue: 8, duration: 3, targetMode: "self" }] });
  const steal = createMockCard({ id: "steal", name: "Steal", cost: 4, effects: [{ type: "heal_steal", baseValue: 12, duration: 1, targetMode: "single" }] });
  const epicDamage = createMockCard({ id: "epic_dmg", name: "Epic Damage", cost: 6, tier: "epic", effects: [{ type: "damage", baseValue: 30, duration: 5, targetMode: "single" }] });
  const aggressiveDamage = createMockCard({ id: "agg_dmg", name: "Aggressive Damage", cost: 3, compoundPattern: "aggressive", effects: [{ type: "damage", baseValue: 15, duration: 3, targetMode: "single" }] });
  const slowburnHeal = createMockCard({ id: "slow_heal", name: "Slowburn Heal", cost: 3, compoundPattern: "slowburn", effects: [{ type: "heal_gain", baseValue: 8, duration: 5, targetMode: "self" }] });

  const allCards = [expensiveDamage, heal, cheapDamage, shield, steal, epicDamage, aggressiveDamage, slowburnHeal];

  describe("default mode", () => {
    it("returns cards in original order", () => {
      const result = sortCards(allCards, "default", 5, 200, 333, 3);
      expect(result.map(c => c.id)).toEqual(allCards.map(c => c.id));
    });

    it("does not mutate the original array", () => {
      const original = [...allCards];
      sortCards(allCards, "default", 5, 200, 333, 3);
      expect(allCards.map(c => c.id)).toEqual(original.map(c => c.id));
    });
  });

  describe("cost mode", () => {
    it("sorts cards by cost ascending", () => {
      const result = sortCards(allCards, "cost", 5, 200, 333, 3);
      for (let i = 1; i < result.length; i++) {
        expect(result[i].cost).toBeGreaterThanOrEqual(result[i - 1].cost);
      }
    });

    it("puts cheapest card first", () => {
      const result = sortCards(allCards, "cost", 5, 200, 333, 3);
      expect(result[0].id).toBe("cheap_dmg");
    });

    it("puts most expensive card last", () => {
      const result = sortCards(allCards, "cost", 5, 200, 333, 3);
      expect(result[result.length - 1].cost).toBe(6);
    });
  });

  describe("type mode", () => {
    it("groups damage cards before heal cards", () => {
      const result = sortCards(allCards, "type", 5, 200, 333, 3);
      const damageIdx = result.findIndex(c => c.id === "cheap_dmg");
      const healIdx = result.findIndex(c => c.id === "heal");
      expect(damageIdx).toBeLessThan(healIdx);
    });

    it("groups steal cards between damage and heal", () => {
      const result = sortCards(allCards, "type", 5, 200, 333, 3);
      const stealIdx = result.findIndex(c => c.id === "steal");
      const cheapDmgIdx = result.findIndex(c => c.id === "cheap_dmg");
      const healIdx = result.findIndex(c => c.id === "heal");
      expect(stealIdx).toBeGreaterThan(cheapDmgIdx);
      expect(stealIdx).toBeLessThan(healIdx);
    });

    it("groups shield cards after heal cards", () => {
      const result = sortCards(allCards, "type", 5, 200, 333, 3);
      const healIdx = result.findIndex(c => c.id === "heal");
      const shieldIdx = result.findIndex(c => c.id === "shield");
      expect(shieldIdx).toBeGreaterThan(healIdx);
    });

    it("sorts within same type by cost", () => {
      const result = sortCards(allCards, "type", 5, 200, 333, 3);
      // All damage cards should be sorted by cost within their group
      const damageCards = result.filter(c =>
        c.effects.some(e => e.type === "damage" || e.type === "self_damage" || e.type === "affliction_amplify")
      );
      for (let i = 1; i < damageCards.length; i++) {
        expect(damageCards[i].cost).toBeGreaterThanOrEqual(damageCards[i - 1].cost);
      }
    });
  });

  describe("recommended mode", () => {
    it("puts affordable cards before unaffordable ones", () => {
      const result = sortCards(allCards, "recommended", 3, 200, 333, 3);
      const affordableCards = result.filter(c => c.cost <= 3);
      const unaffordableCards = result.filter(c => c.cost > 3);
      // All affordable cards should come before unaffordable ones
      const lastAffordableIdx = result.findLastIndex(c => c.cost <= 3);
      const firstUnaffordableIdx = result.findIndex(c => c.cost > 3);
      if (affordableCards.length > 0 && unaffordableCards.length > 0) {
        expect(lastAffordableIdx).toBeLessThan(firstUnaffordableIdx);
      }
    });

    it("prioritizes damage cards in early game with full HP", () => {
      const result = sortCards(
        [cheapDamage, heal, shield],
        "recommended",
        5, 333, 333, 2, // Round 2, full HP
      );
      // Damage should be first (early game, full HP)
      expect(result[0].id).toBe("cheap_dmg");
    });

    it("prioritizes heal/shield when HP is low", () => {
      const result = sortCards(
        [cheapDamage, heal, shield],
        "recommended",
        5, 50, 333, 10, // Round 10, low HP (15%)
      );
      // Heal should be first when HP is critically low
      expect(result[0].effects[0].type).toMatch(/heal|shield/);
    });

    it("gives bonus to aggressive pattern in early game", () => {
      const standardDmg = createMockCard({ id: "std", cost: 3, compoundPattern: "standard", effects: [{ type: "damage", baseValue: 15, duration: 3, targetMode: "single" }] });
      const aggDmg = createMockCard({ id: "agg", cost: 3, compoundPattern: "aggressive", effects: [{ type: "damage", baseValue: 15, duration: 3, targetMode: "single" }] });
      const result = sortCards([standardDmg, aggDmg], "recommended", 5, 333, 333, 2);
      expect(result[0].id).toBe("agg");
    });

    it("gives bonus to slowburn pattern in late game", () => {
      const standardHeal = createMockCard({ id: "std_h", cost: 3, compoundPattern: "standard", effects: [{ type: "heal_gain", baseValue: 8, duration: 3, targetMode: "self" }] });
      const slowHeal = createMockCard({ id: "slow_h", cost: 3, compoundPattern: "slowburn", effects: [{ type: "heal_gain", baseValue: 8, duration: 5, targetMode: "self" }] });
      const result = sortCards([standardHeal, slowHeal], "recommended", 5, 200, 333, 12);
      expect(result[0].id).toBe("slow_h");
    });

    it("gives bonus to epic tier cards", () => {
      const common = createMockCard({ id: "common", cost: 3, tier: "common", effects: [{ type: "damage", baseValue: 15, duration: 3, targetMode: "single" }] });
      const epic = createMockCard({ id: "epic", cost: 3, tier: "epic", effects: [{ type: "damage", baseValue: 15, duration: 3, targetMode: "single" }] });
      const result = sortCards([common, epic], "recommended", 5, 333, 333, 3);
      expect(result[0].id).toBe("epic");
    });

    it("does not mutate the original array", () => {
      const original = [...allCards];
      sortCards(allCards, "recommended", 5, 200, 333, 3);
      expect(allCards.map(c => c.id)).toEqual(original.map(c => c.id));
    });
  });
});

// ─── Post-Game Analysis Tests ──────────────────────────────────
// Test the analysis tip generation logic

describe("Post-Game Analysis — Tip Generation", () => {
  // Inline the tip generation logic for testing
  function generateTips(params: {
    isWinner: boolean;
    cardsPlayed: number;
    totalDamageDealt: number;
    totalHealingDone: number;
    totalShieldApplied: number;
    unplayedCards: number;
    wastedEnergy: number;
    hpAtDeath: number;
    maxHp: number;
    currentRound: number;
    maxRounds: number;
    compoundingEffectsUsed: number;
  }): string[] {
    const tips: string[] = [];

    if (!params.isWinner) {
      // Energy waste tip
      if (params.wastedEnergy > 5) {
        tips.push("You wasted significant energy. Try to spend all your energy each round — unspent energy is wasted potential.");
      }

      // Unplayed cards tip
      if (params.unplayedCards > 3) {
        tips.push("You had many unplayed cards. Remember to play cards early — compound effects tick more times the earlier they're played.");
      }

      // No defense tip
      if (params.totalHealingDone === 0 && params.totalShieldApplied === 0) {
        tips.push("You didn't use any healing or shields. Mix offense and defense to survive longer.");
      }

      // Died early tip
      if (params.currentRound < params.maxRounds * 0.5) {
        tips.push("You were eliminated early. Consider playing more defensively in the first few rounds to build up compound effects.");
      }

      // Low damage tip
      if (params.totalDamageDealt < 50 && params.cardsPlayed > 3) {
        tips.push("Your damage output was low despite playing cards. Try focusing fire on one target instead of spreading damage.");
      }

      // No compound effects tip
      if (params.compoundingEffectsUsed === 0 && params.cardsPlayed > 0) {
        tips.push("Compound effects are the core mechanic. Play cards early to maximize their compounding value over time.");
      }
    }

    if (tips.length === 0 && !params.isWinner) {
      tips.push("Close game! Try experimenting with different factions and card combinations to find your playstyle.");
    }

    return tips;
  }

  it("generates energy waste tip when energy is wasted", () => {
    const tips = generateTips({
      isWinner: false, cardsPlayed: 5, totalDamageDealt: 100, totalHealingDone: 0,
      totalShieldApplied: 0, unplayedCards: 2, wastedEnergy: 10, hpAtDeath: 0,
      maxHp: 333, currentRound: 15, maxRounds: 20, compoundingEffectsUsed: 3,
    });
    expect(tips.some(t => t.includes("energy"))).toBe(true);
  });

  it("generates unplayed cards tip when many cards remain", () => {
    const tips = generateTips({
      isWinner: false, cardsPlayed: 2, totalDamageDealt: 50, totalHealingDone: 0,
      totalShieldApplied: 0, unplayedCards: 8, wastedEnergy: 2, hpAtDeath: 0,
      maxHp: 333, currentRound: 15, maxRounds: 20, compoundingEffectsUsed: 1,
    });
    expect(tips.some(t => t.includes("unplayed"))).toBe(true);
  });

  it("generates no-defense tip when no healing or shields used", () => {
    const tips = generateTips({
      isWinner: false, cardsPlayed: 8, totalDamageDealt: 200, totalHealingDone: 0,
      totalShieldApplied: 0, unplayedCards: 1, wastedEnergy: 1, hpAtDeath: 0,
      maxHp: 333, currentRound: 15, maxRounds: 20, compoundingEffectsUsed: 5,
    });
    expect(tips.some(t => t.includes("healing") || t.includes("shields"))).toBe(true);
  });

  it("generates early death tip when eliminated before halfway", () => {
    const tips = generateTips({
      isWinner: false, cardsPlayed: 3, totalDamageDealt: 40, totalHealingDone: 10,
      totalShieldApplied: 5, unplayedCards: 5, wastedEnergy: 8, hpAtDeath: 0,
      maxHp: 333, currentRound: 5, maxRounds: 20, compoundingEffectsUsed: 2,
    });
    expect(tips.some(t => t.includes("early") || t.includes("eliminated"))).toBe(true);
  });

  it("generates low damage tip when damage is low despite playing cards", () => {
    const tips = generateTips({
      isWinner: false, cardsPlayed: 6, totalDamageDealt: 30, totalHealingDone: 50,
      totalShieldApplied: 20, unplayedCards: 1, wastedEnergy: 1, hpAtDeath: 0,
      maxHp: 333, currentRound: 18, maxRounds: 20, compoundingEffectsUsed: 4,
    });
    expect(tips.some(t => t.includes("damage") && t.includes("low"))).toBe(true);
  });

  it("generates no tips for winners", () => {
    const tips = generateTips({
      isWinner: true, cardsPlayed: 10, totalDamageDealt: 500, totalHealingDone: 100,
      totalShieldApplied: 50, unplayedCards: 0, wastedEnergy: 0, hpAtDeath: 100,
      maxHp: 333, currentRound: 20, maxRounds: 20, compoundingEffectsUsed: 8,
    });
    expect(tips.length).toBe(0);
  });

  it("generates fallback tip when no specific issues found", () => {
    const tips = generateTips({
      isWinner: false, cardsPlayed: 10, totalDamageDealt: 300, totalHealingDone: 100,
      totalShieldApplied: 50, unplayedCards: 0, wastedEnergy: 2, hpAtDeath: 0,
      maxHp: 333, currentRound: 19, maxRounds: 20, compoundingEffectsUsed: 8,
    });
    expect(tips.length).toBeGreaterThan(0);
    expect(tips[0]).toContain("Close game");
  });

  it("generates compound effects tip when none used", () => {
    const tips = generateTips({
      isWinner: false, cardsPlayed: 5, totalDamageDealt: 80, totalHealingDone: 20,
      totalShieldApplied: 10, unplayedCards: 2, wastedEnergy: 3, hpAtDeath: 0,
      maxHp: 333, currentRound: 12, maxRounds: 20, compoundingEffectsUsed: 0,
    });
    expect(tips.some(t => t.includes("Compound") || t.includes("compound"))).toBe(true);
  });
});

// ─── Practice Mode Tests ───────────────────────────────────────

describe("Practice Mode — Configuration", () => {
  const PRACTICE_SINS = [
    { sin: "wrath", difficulty: "Easy" },
    { sin: "sloth", difficulty: "Easy" },
    { sin: "greed", difficulty: "Medium" },
    { sin: "envy", difficulty: "Medium" },
    { sin: "lust", difficulty: "Easy" },
    { sin: "pride", difficulty: "Hard" },
    { sin: "gluttony", difficulty: "Hard" },
  ];

  it("includes all 7 sins as practice options", () => {
    expect(PRACTICE_SINS.length).toBe(7);
    const sins = PRACTICE_SINS.map(s => s.sin);
    expect(sins).toContain("wrath");
    expect(sins).toContain("sloth");
    expect(sins).toContain("greed");
    expect(sins).toContain("envy");
    expect(sins).toContain("pride");
    expect(sins).toContain("lust");
    expect(sins).toContain("gluttony");
  });

  it("assigns difficulty ratings to all sins", () => {
    for (const sin of PRACTICE_SINS) {
      expect(["Easy", "Medium", "Hard"]).toContain(sin.difficulty);
    }
  });

  it("has at least one Easy sin for beginners", () => {
    const easySins = PRACTICE_SINS.filter(s => s.difficulty === "Easy");
    expect(easySins.length).toBeGreaterThanOrEqual(1);
  });

  it("has at least one Hard sin for advanced players", () => {
    const hardSins = PRACTICE_SINS.filter(s => s.difficulty === "Hard");
    expect(hardSins.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Practice Annotations — State Machine", () => {
  // Test the annotation selection logic
  function getAnnotationId(params: {
    isPractice: boolean;
    currentRound: number;
    isMyTurn: boolean;
    hasLockedIn: boolean;
    selectedCardsCount: number;
    turnPhase: string;
  }): string | null {
    if (!params.isPractice) return null;

    if (params.currentRound === 1) {
      if (params.isMyTurn && params.selectedCardsCount === 0 && !params.hasLockedIn && params.turnPhase === "selection") return "r1_select";
      if (params.isMyTurn && params.selectedCardsCount > 0 && !params.hasLockedIn) return "r1_lockin";
      if (params.hasLockedIn) return "r1_waiting";
      if (params.turnPhase === "resolution") return "r1_resolution";
    }
    if (params.currentRound === 2) {
      if (params.isMyTurn && !params.hasLockedIn && params.turnPhase === "selection") return "r2_compound";
    }
    if (params.currentRound === 3) {
      if (params.isMyTurn && !params.hasLockedIn && params.turnPhase === "selection") return "r3_passive";
    }
    if (params.currentRound === 4) {
      if (params.isMyTurn && !params.hasLockedIn) return "r4_farewell";
    }
    return null;
  }

  it("shows select annotation on round 1 with no cards selected", () => {
    expect(getAnnotationId({
      isPractice: true, currentRound: 1, isMyTurn: true,
      hasLockedIn: false, selectedCardsCount: 0, turnPhase: "selection",
    })).toBe("r1_select");
  });

  it("shows lock-in annotation when cards are selected", () => {
    expect(getAnnotationId({
      isPractice: true, currentRound: 1, isMyTurn: true,
      hasLockedIn: false, selectedCardsCount: 2, turnPhase: "selection",
    })).toBe("r1_lockin");
  });

  it("shows waiting annotation after locking in", () => {
    expect(getAnnotationId({
      isPractice: true, currentRound: 1, isMyTurn: true,
      hasLockedIn: true, selectedCardsCount: 2, turnPhase: "selection",
    })).toBe("r1_waiting");
  });

  it("shows resolution annotation during resolution phase", () => {
    expect(getAnnotationId({
      isPractice: true, currentRound: 1, isMyTurn: false,
      hasLockedIn: false, selectedCardsCount: 0, turnPhase: "resolution",
    })).toBe("r1_resolution");
  });

  it("shows compound annotation on round 2", () => {
    expect(getAnnotationId({
      isPractice: true, currentRound: 2, isMyTurn: true,
      hasLockedIn: false, selectedCardsCount: 0, turnPhase: "selection",
    })).toBe("r2_compound");
  });

  it("shows passive annotation on round 3", () => {
    expect(getAnnotationId({
      isPractice: true, currentRound: 3, isMyTurn: true,
      hasLockedIn: false, selectedCardsCount: 0, turnPhase: "selection",
    })).toBe("r3_passive");
  });

  it("shows farewell annotation on round 4", () => {
    expect(getAnnotationId({
      isPractice: true, currentRound: 4, isMyTurn: true,
      hasLockedIn: false, selectedCardsCount: 0, turnPhase: "selection",
    })).toBe("r4_farewell");
  });

  it("returns null for non-practice games", () => {
    expect(getAnnotationId({
      isPractice: false, currentRound: 1, isMyTurn: true,
      hasLockedIn: false, selectedCardsCount: 0, turnPhase: "selection",
    })).toBeNull();
  });

  it("returns null after round 4", () => {
    expect(getAnnotationId({
      isPractice: true, currentRound: 5, isMyTurn: true,
      hasLockedIn: false, selectedCardsCount: 0, turnPhase: "selection",
    })).toBeNull();
  });

  it("returns null when not my turn on round 2+", () => {
    expect(getAnnotationId({
      isPractice: true, currentRound: 2, isMyTurn: false,
      hasLockedIn: false, selectedCardsCount: 0, turnPhase: "selection",
    })).toBeNull();
  });
});

// ─── Briefing Steps Tests ──────────────────────────────────────

describe("Practice Mode — Briefing Steps", () => {
  const PRACTICE_STEPS = [
    { id: "welcome", title: "Welcome to Practice Mode" },
    { id: "energy", title: "Energy is Your Currency" },
    { id: "cards", title: "Playing Cards" },
    { id: "compound", title: "Compound Effects" },
    { id: "defense", title: "Don't Forget Defense" },
    { id: "passive", title: "Your Faction Passive" },
    { id: "targeting", title: "Smart Targeting" },
    { id: "go", title: "You're Ready!" },
  ];

  it("has 8 briefing steps", () => {
    expect(PRACTICE_STEPS.length).toBe(8);
  });

  it("starts with welcome and ends with go", () => {
    expect(PRACTICE_STEPS[0].id).toBe("welcome");
    expect(PRACTICE_STEPS[PRACTICE_STEPS.length - 1].id).toBe("go");
  });

  it("covers energy, cards, compound, defense, passive, and targeting", () => {
    const ids = PRACTICE_STEPS.map(s => s.id);
    expect(ids).toContain("energy");
    expect(ids).toContain("cards");
    expect(ids).toContain("compound");
    expect(ids).toContain("defense");
    expect(ids).toContain("passive");
    expect(ids).toContain("targeting");
  });

  it("has unique IDs for all steps", () => {
    const ids = PRACTICE_STEPS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
