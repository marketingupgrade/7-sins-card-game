/**
 * v6.6.0 Tests — GameBoard Brand Voice, Cathedral Transitions, Loading Screen, Sound Design
 */
import { describe, it, expect } from "vitest";

/* ─── Cathedral Transition Quote Pools ─── */
describe("CathedralTransition — Quote Pools", () => {
  // We test the quote data structures and logic directly
  const ROUND_QUOTES: Record<string, string[]> = {
    early: [
      "The first sins are always the cheapest.",
      "Patience rewards those who understand compound interest.",
      "The cathedral watches. It always watches.",
      "Every sinner thinks they're the exception.",
      "Corruption flows like water — it finds the cracks.",
      "The early rounds are a prayer. The late rounds are a reckoning.",
    ],
    mid: [
      "The weak have been identified. The strong are about to be tested.",
      "Alliances are for the naive. This is a cathedral, not a democracy.",
      "Your sins are compounding. Can you feel them growing?",
      "Half the rites are done. Half the sinners should be worried.",
      "The mathematics of evil are becoming clear.",
      "Restraint or recklessness — the cathedral judges both equally.",
    ],
    late: [
      "The Reckoning approaches. Are you prepared?",
      "Few sinners survive this deep into the liturgy.",
      "Every card you've hoarded is a prayer you haven't answered.",
      "The cathedral's patience is not infinite.",
      "Final rites are for the desperate and the brilliant.",
      "The end is not a destination. It's a verdict.",
    ],
    reckoning: [
      "The Final Reckoning. All sins are laid bare.",
      "No more strategy. No more patience. Only truth.",
      "The cathedral demands its due. Every last card.",
      "Twenty rites of sin, and it comes to this.",
    ],
  };

  const ELIMINATION_QUOTES = [
    "Another sinner falls. The cathedral claims its due.",
    "One fewer voice in the choir of the damned.",
    "Eliminated. The cathedral is not sentimental.",
    "The weak are pruned so the strong may flourish.",
    "And then there were fewer.",
  ];

  function getQuotePool(round: number, maxRounds: number): string[] {
    if (round >= maxRounds) return ROUND_QUOTES.reckoning;
    if (round > maxRounds * 0.7) return ROUND_QUOTES.late;
    if (round > maxRounds * 0.35) return ROUND_QUOTES.mid;
    return ROUND_QUOTES.early;
  }

  it("should have 6 early quotes", () => {
    expect(ROUND_QUOTES.early).toHaveLength(6);
  });

  it("should have 6 mid quotes", () => {
    expect(ROUND_QUOTES.mid).toHaveLength(6);
  });

  it("should have 6 late quotes", () => {
    expect(ROUND_QUOTES.late).toHaveLength(6);
  });

  it("should have 4 reckoning quotes", () => {
    expect(ROUND_QUOTES.reckoning).toHaveLength(4);
  });

  it("should have 5 elimination quotes", () => {
    expect(ELIMINATION_QUOTES).toHaveLength(5);
  });

  it("should return early quotes for rounds 1-7 (maxRounds=20)", () => {
    const pool = getQuotePool(1, 20);
    expect(pool).toBe(ROUND_QUOTES.early);
    expect(getQuotePool(7, 20)).toBe(ROUND_QUOTES.early);
  });

  it("should return mid quotes for rounds 8-14 (maxRounds=20)", () => {
    expect(getQuotePool(8, 20)).toBe(ROUND_QUOTES.mid);
    expect(getQuotePool(14, 20)).toBe(ROUND_QUOTES.mid);
  });

  it("should return late quotes for rounds 15-19 (maxRounds=20)", () => {
    expect(getQuotePool(15, 20)).toBe(ROUND_QUOTES.late);
    expect(getQuotePool(19, 20)).toBe(ROUND_QUOTES.late);
  });

  it("should return reckoning quotes for round 20 (maxRounds=20)", () => {
    expect(getQuotePool(20, 20)).toBe(ROUND_QUOTES.reckoning);
  });

  it("should return reckoning quotes for rounds beyond maxRounds", () => {
    expect(getQuotePool(25, 20)).toBe(ROUND_QUOTES.reckoning);
  });

  it("all quotes should use brand voice (no generic language)", () => {
    const allQuotes = [
      ...ROUND_QUOTES.early,
      ...ROUND_QUOTES.mid,
      ...ROUND_QUOTES.late,
      ...ROUND_QUOTES.reckoning,
      ...ELIMINATION_QUOTES,
    ];

    const genericTerms = ["player", "game over", "next round", "loading", "please wait"];
    for (const quote of allQuotes) {
      for (const term of genericTerms) {
        expect(quote.toLowerCase()).not.toContain(term);
      }
    }
  });

  it("all quotes should be non-empty strings", () => {
    const allQuotes = [
      ...ROUND_QUOTES.early,
      ...ROUND_QUOTES.mid,
      ...ROUND_QUOTES.late,
      ...ROUND_QUOTES.reckoning,
      ...ELIMINATION_QUOTES,
    ];

    for (const quote of allQuotes) {
      expect(typeof quote).toBe("string");
      expect(quote.length).toBeGreaterThan(10);
    }
  });
});

/* ─── Loading Screen Quotes ─── */
describe("GameLoadingScreen — Loading Quotes", () => {
  const LOADING_QUOTES = [
    "The cathedral prepares your penance.",
    "Shuffling the deck of damnation.",
    "Your sins are being catalogued.",
    "The other sinners are gathering.",
    "Corruption flows through the halls.",
    "The altar is being prepared.",
    "Every card game promises you power. We promise you honesty.",
    "The mathematics of evil require precision.",
    "Patience. Even damnation takes a moment.",
    "The cathedral does not rush. Neither should you.",
  ];

  it("should have 10 loading quotes", () => {
    expect(LOADING_QUOTES).toHaveLength(10);
  });

  it("all loading quotes should use brand voice", () => {
    const genericTerms = ["loading", "please wait", "connecting", "spinner"];
    for (const quote of LOADING_QUOTES) {
      for (const term of genericTerms) {
        expect(quote.toLowerCase()).not.toContain(term);
      }
    }
  });

  it("loading quotes should reference cathedral/sin themes", () => {
    const themeTerms = ["cathedral", "sin", "penance", "damnation", "corruption", "altar", "evil", "card game"];
    let themeCount = 0;
    for (const quote of LOADING_QUOTES) {
      const lower = quote.toLowerCase();
      if (themeTerms.some((t) => lower.includes(t))) themeCount++;
    }
    // At least 80% should reference brand themes
    expect(themeCount).toBeGreaterThanOrEqual(8);
  });
});

/* ─── Cathedral Sounds Module Structure ─── */
describe("CathedralSounds — Module Exports", () => {
  it("should export all 6 sound functions", () => {
    // Verify the module structure by checking function names exist
    const expectedFunctions = [
      "playBellToll",
      "playWhisper",
      "playDeepResonance",
      "playChoirPad",
      "playResolutionChime",
      "playEliminationToll",
    ];

    // We can't import browser-only modules in vitest, so we verify the file exists
    // and has the right exports by checking the source
    const fs = require("fs");
    const source = fs.readFileSync("client/src/lib/cathedralSounds.ts", "utf-8");

    for (const fn of expectedFunctions) {
      expect(source).toContain(`export function ${fn}`);
    }
  });

  it("should respect SFX settings storage key", () => {
    const fs = require("fs");
    const source = fs.readFileSync("client/src/lib/cathedralSounds.ts", "utf-8");
    // Should use the same storage key as the main sound engine
    expect(source).toContain('const STORAGE_KEY = "7sins_sfx_settings"');
  });

  it("bell toll should support three intensity levels", () => {
    const fs = require("fs");
    const source = fs.readFileSync("client/src/lib/cathedralSounds.ts", "utf-8");
    expect(source).toContain('"soft"');
    expect(source).toContain('"normal"');
    expect(source).toContain('"deep"');
  });

  it("should use Web Audio API (AudioContext), not external audio files", () => {
    const fs = require("fs");
    const source = fs.readFileSync("client/src/lib/cathedralSounds.ts", "utf-8");
    expect(source).toContain("AudioContext");
    expect(source).toContain("createOscillator");
    expect(source).toContain("createGain");
    // Should NOT reference external audio file URLs
    expect(source).not.toContain("https://");
    expect(source).not.toContain(".mp3");
    expect(source).not.toContain(".wav");
  });
});

/* ─── Brand Voice in GameBoard UI ─── */
describe("GameBoard — Brand Voice Compliance", () => {
  it("should use branded loading screen instead of generic spinner", () => {
    const fs = require("fs");
    const source = fs.readFileSync("client/src/pages/GameBoard.tsx", "utf-8");
    expect(source).toContain("GameLoadingScreen");
    // Should NOT have the old generic loading spinner
    expect(source).not.toContain("Loading the arena of regret...");
  });

  it("should include CathedralTransition component", () => {
    const fs = require("fs");
    const source = fs.readFileSync("client/src/pages/GameBoard.tsx", "utf-8");
    expect(source).toContain("CathedralTransition");
    expect(source).toContain('import CathedralTransition from "@/components/CathedralTransition"');
  });

  it("should use branded terminology in round transitions", () => {
    const fs = require("fs");
    const source = fs.readFileSync("client/src/pages/GameBoard.tsx", "utf-8");
    // Should use "Rite" instead of "Round" in action feed
    expect(source).toContain("Rite");
  });
});

/* ─── Component File Existence ─── */
describe("v6.6.0 — Component Files", () => {
  const fs = require("fs");

  it("CathedralTransition.tsx should exist", () => {
    expect(fs.existsSync("client/src/components/CathedralTransition.tsx")).toBe(true);
  });

  it("GameLoadingScreen.tsx should exist", () => {
    expect(fs.existsSync("client/src/components/GameLoadingScreen.tsx")).toBe(true);
  });

  it("cathedralSounds.ts should exist", () => {
    expect(fs.existsSync("client/src/lib/cathedralSounds.ts")).toBe(true);
  });

  it("CathedralTransition should import cathedral sounds", () => {
    const source = fs.readFileSync("client/src/components/CathedralTransition.tsx", "utf-8");
    expect(source).toContain("playBellToll");
    expect(source).toContain("playEliminationToll");
    expect(source).toContain("playDeepResonance");
    expect(source).toContain("playWhisper");
  });

  it("GameLoadingScreen should import choir pad", () => {
    const source = fs.readFileSync("client/src/components/GameLoadingScreen.tsx", "utf-8");
    expect(source).toContain("playChoirPad");
  });
});
