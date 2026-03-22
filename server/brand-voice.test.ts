/**
 * Brand Voice Compliance Tests
 *
 * Verifies that all onboarding components use the brand book's
 * sardonic narrator voice, cathedral terminology, and proper
 * information hierarchy.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const CLIENT_DIR = join(__dirname, "..", "client", "src");

function readComponent(relativePath: string): string {
  return readFileSync(join(CLIENT_DIR, relativePath), "utf-8");
}

// ─── Brand Voice Keywords ──────────────────────────────────────

const NARRATOR_MARKERS = [
  "narrator",
  "cathedral",
  "corruption",
  "sin",
  "sinner",
  "damned",
  "damnation",
];

const GENERIC_TERMS_TO_AVOID = [
  // These exact phrases indicate generic tutorial language
  "Welcome to the tutorial",
  "Click here to continue",
  "Let's get started!",
  "You're all set!",
  "Great job!",
];

// ─── How to Play Page ──────────────────────────────────────────

describe("How to Play — Brand Voice", () => {
  const content = readComponent("pages/HowToPlay.tsx");

  it("uses narrator voice markers", () => {
    const found = NARRATOR_MARKERS.filter((m) =>
      content.toLowerCase().includes(m)
    );
    expect(found.length).toBeGreaterThanOrEqual(3);
  });

  it("avoids generic tutorial language", () => {
    for (const phrase of GENERIC_TERMS_TO_AVOID) {
      expect(content).not.toContain(phrase);
    }
  });

  it("uses brand font variables", () => {
    expect(content).toContain("font-heading");
    expect(content).toContain("font-body");
  });

  it("includes narrator flavor text in italic", () => {
    // Narrator quotes should be in italic styling
    expect(content).toContain("italic");
  });

  it("uses cathedral/sin terminology for energy", () => {
    // Should use 'corruption' instead of generic 'energy' in teaching text
    expect(content.toLowerCase()).toContain("corruption");
  });

  it("references compound effects with brand language", () => {
    expect(content.toLowerCase()).toContain("compound");
  });
});

// ─── QuickStart Modal ──────────────────────────────────────────

describe("QuickStart Modal — Brand Voice", () => {
  const content = readComponent("components/QuickStartModal.tsx");

  it("uses narrator voice markers", () => {
    const found = NARRATOR_MARKERS.filter((m) =>
      content.toLowerCase().includes(m)
    );
    expect(found.length).toBeGreaterThanOrEqual(3);
  });

  it("avoids generic tutorial language", () => {
    for (const phrase of GENERIC_TERMS_TO_AVOID) {
      expect(content).not.toContain(phrase);
    }
  });

  it("uses brand font variables", () => {
    expect(content).toContain("font-heading");
  });

  it("includes narrator quotes", () => {
    // Should have narrator flavor text
    expect(content.toLowerCase()).toContain("narrator");
  });

  it("uses branded CTA language", () => {
    // Should use dramatic CTAs, not generic "Next" / "Start"
    const hasBrandedCTA =
      content.includes("EMBRACE YOUR SIN") ||
      content.includes("ENTER") ||
      content.includes("BEGIN") ||
      content.includes("DESCEND") ||
      content.includes("CATHEDRAL") ||
      content.includes("ARENA");
    expect(hasBrandedCTA).toBe(true);
  });
});

// ─── GameCoach ─────────────────────────────────────────────────

describe("GameCoach — Brand Voice", () => {
  const content = readComponent("components/GameCoach.tsx");

  it("uses narrator voice markers", () => {
    const found = NARRATOR_MARKERS.filter((m) =>
      content.toLowerCase().includes(m)
    );
    expect(found.length).toBeGreaterThanOrEqual(2);
  });

  it("avoids generic tutorial language", () => {
    for (const phrase of GENERIC_TERMS_TO_AVOID) {
      expect(content).not.toContain(phrase);
    }
  });

  it("uses brand font variables", () => {
    expect(content).toContain("font-heading");
  });

  it("includes narrator flavor text", () => {
    expect(content.toLowerCase()).toContain("narrator");
  });
});

// ─── PracticeAnnotations ───────────────────────────────────────

describe("PracticeAnnotations — Brand Voice", () => {
  const content = readComponent("components/PracticeAnnotations.tsx");

  it("uses narrator voice markers", () => {
    const found = NARRATOR_MARKERS.filter((m) =>
      content.toLowerCase().includes(m)
    );
    expect(found.length).toBeGreaterThanOrEqual(3);
  });

  it("avoids generic tutorial language", () => {
    for (const phrase of GENERIC_TERMS_TO_AVOID) {
      expect(content).not.toContain(phrase);
    }
  });

  it("includes narrator flavor quotes", () => {
    // Should have sardonic narrator quotes
    expect(content).toContain("narratorFlavor");
  });

  it("uses corruption instead of energy in teaching text", () => {
    expect(content.toLowerCase()).toContain("corruption");
  });

  it("uses brand font variables", () => {
    expect(content).toContain("font-heading");
    expect(content).toContain("font-narrator");
  });
});

// ─── PracticeMode ──────────────────────────────────────────────

describe("PracticeMode — Brand Voice", () => {
  const content = readComponent("pages/PracticeMode.tsx");

  it("uses narrator voice markers", () => {
    const found = NARRATOR_MARKERS.filter((m) =>
      content.toLowerCase().includes(m)
    );
    expect(found.length).toBeGreaterThanOrEqual(4);
  });

  it("avoids generic tutorial language", () => {
    for (const phrase of GENERIC_TERMS_TO_AVOID) {
      expect(content).not.toContain(phrase);
    }
  });

  it("includes narratorQuote field in briefing steps", () => {
    expect(content).toContain("narratorQuote");
  });

  it("uses branded sin descriptions", () => {
    // Should use evocative descriptions, not generic ones
    expect(content).toContain("blunt instrument");
    expect(content).toContain("immovable object");
    expect(content).toContain("tax collector");
  });

  it("uses branded CTA language", () => {
    expect(content).toContain("TRAINING GROUNDS");
  });

  it("uses corruption instead of energy in briefing", () => {
    expect(content).toContain("corruption");
  });
});

// ─── PostGameAnalysis ──────────────────────────────────────────

describe("PostGameAnalysis — Brand Voice", () => {
  const content = readComponent("components/PostGameAnalysis.tsx");

  it("uses cathedral terminology in header", () => {
    expect(content).toContain("CATHEDRAL");
  });

  it("uses branded tip titles", () => {
    expect(content).toContain("sins left uncommitted");
    expect(content).toContain("Corruption squandered");
    expect(content).toContain("unremarkable damnation");
  });

  it("uses branded passive strategy tips", () => {
    expect(content).toContain("Vengeance reflects");
    expect(content).toContain("parasite");
    expect(content).toContain("Consume everything");
  });

  it("uses branded CTA to guide page", () => {
    expect(content).toContain("Consult the Scriptures");
  });

  it("avoids generic tutorial language", () => {
    for (const phrase of GENERIC_TERMS_TO_AVOID) {
      expect(content).not.toContain(phrase);
    }
  });
});

// ─── Cross-Component Consistency ───────────────────────────────

describe("Cross-Component Brand Consistency", () => {
  const components = [
    readComponent("pages/HowToPlay.tsx"),
    readComponent("components/QuickStartModal.tsx"),
    readComponent("components/GameCoach.tsx"),
    readComponent("components/PracticeAnnotations.tsx"),
    readComponent("pages/PracticeMode.tsx"),
    readComponent("components/PostGameAnalysis.tsx"),
  ];

  it("all components use font-heading", () => {
    for (const c of components) {
      expect(c).toContain("font-heading");
    }
  });

  it("all components reference sin/corruption terminology", () => {
    for (const c of components) {
      const hasSinTerms =
        c.toLowerCase().includes("sin") ||
        c.toLowerCase().includes("corruption") ||
        c.toLowerCase().includes("cathedral");
      expect(hasSinTerms).toBe(true);
    }
  });

  it("no component uses exclamation marks in narrator text", () => {
    // Brand book: narrator is sardonic, not enthusiastic
    // Check narrator-specific strings don't have "!"
    for (const c of components) {
      const narratorMatches = c.match(/narratorFlavor.*?"([^"]+)"/g) || [];
      for (const match of narratorMatches) {
        const quote = match.match(/"([^"]+)"$/)?.[1] || "";
        // Narrator quotes should not end with "!" (sardonic, not excited)
        expect(quote.endsWith("!")).toBe(false);
      }
    }
  });
});
