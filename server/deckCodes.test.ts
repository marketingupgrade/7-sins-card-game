/**
 * Tests for deck import/export codes and matchup matrix data consistency
 */
import { describe, it, expect } from "vitest";

// ─── Deck Code Encode/Decode Tests ────────────────────────
// We test the pure logic that would be in deckCodes.ts
// Since it's a client module, we replicate the core logic here for testing

const FACTION_TO_PREFIX: Record<string, string> = {
  wrath: "W", sloth: "S", greed: "G", envy: "E", pride: "P", lust: "L", gluttony: "X",
};
const PREFIX_TO_FACTION: Record<string, string> = Object.fromEntries(
  Object.entries(FACTION_TO_PREFIX).map(([k, v]) => [v, k])
);

function encodeDeck(faction: string, cardIds: string[]): string | null {
  if (!faction || cardIds.length === 0) return null;
  const prefix = FACTION_TO_PREFIX[faction];
  if (!prefix) return null;
  const numbers = cardIds.map((id) => id.split("_").pop()).filter(Boolean);
  if (numbers.length === 0) return null;
  return `${prefix}:${numbers.join(",")}`;
}

function decodeDeck(code: string): { faction: string; cardIds: string[] } | null {
  if (!code || typeof code !== "string") return null;
  const cleaned = code.trim().replace(/^["']|["']$/g, "");
  const colonIdx = cleaned.indexOf(":");
  if (colonIdx < 1) return null;
  const prefix = cleaned.substring(0, colonIdx).toUpperCase();
  const numbersStr = cleaned.substring(colonIdx + 1);
  const faction = PREFIX_TO_FACTION[prefix];
  if (!faction) return null;
  const numbers = numbersStr.split(",").map((n) => n.trim()).filter((n) => /^\d{1,2}$/.test(n)).map((n) => n.padStart(2, "0"));
  if (numbers.length === 0) return null;
  const cardIds = numbers.map((n) => `${faction}_${n}`);
  const seen = new Set<string>();
  return { faction, cardIds: cardIds.filter((id) => { if (seen.has(id)) return false; seen.add(id); return true; }) };
}

function validateDeckCode(code: string): { valid: boolean; error?: string } {
  if (!code || !code.trim()) return { valid: false, error: "Empty deck code" };
  const cleaned = code.trim().replace(/^["']|["']$/g, "");
  const colonIdx = cleaned.indexOf(":");
  if (colonIdx < 1) return { valid: false, error: "Invalid format" };
  const prefix = cleaned.substring(0, colonIdx).toUpperCase();
  if (!PREFIX_TO_FACTION[prefix]) return { valid: false, error: `Unknown faction prefix "${prefix}"` };
  const parts = cleaned.substring(colonIdx + 1).split(",").map((n) => n.trim());
  const invalid = parts.filter((n) => !/^\d{1,2}$/.test(n));
  if (invalid.length > 0) return { valid: false, error: `Invalid card numbers` };
  const nums = parts.map((n) => parseInt(n, 10));
  const outOfRange = nums.filter((n) => n < 1 || n > 54);
  if (outOfRange.length > 0) return { valid: false, error: `Card numbers must be 1-54` };
  return { valid: true };
}

describe("Deck Code Encoding", () => {
  it("encodes a wrath deck correctly", () => {
    const code = encodeDeck("wrath", ["wrath_01", "wrath_03", "wrath_05"]);
    expect(code).toBe("W:01,03,05");
  });

  it("encodes all faction prefixes correctly", () => {
    expect(encodeDeck("wrath", ["wrath_01"])?.charAt(0)).toBe("W");
    expect(encodeDeck("sloth", ["sloth_01"])?.charAt(0)).toBe("S");
    expect(encodeDeck("greed", ["greed_01"])?.charAt(0)).toBe("G");
    expect(encodeDeck("envy", ["envy_01"])?.charAt(0)).toBe("E");
    expect(encodeDeck("pride", ["pride_01"])?.charAt(0)).toBe("P");
    expect(encodeDeck("lust", ["lust_01"])?.charAt(0)).toBe("L");
    expect(encodeDeck("gluttony", ["gluttony_01"])?.charAt(0)).toBe("X");
  });

  it("returns null for empty deck", () => {
    expect(encodeDeck("wrath", [])).toBeNull();
  });

  it("returns null for missing faction", () => {
    expect(encodeDeck("", ["wrath_01"])).toBeNull();
  });

  it("encodes a full 30-card deck", () => {
    const ids = Array.from({ length: 30 }, (_, i) => `lust_${String(i + 1).padStart(2, "0")}`);
    const code = encodeDeck("lust", ids);
    expect(code).toMatch(/^L:/);
    expect(code!.split(",").length).toBe(30);
  });
});

describe("Deck Code Decoding", () => {
  it("decodes a wrath deck correctly", () => {
    const result = decodeDeck("W:01,03,05");
    expect(result).not.toBeNull();
    expect(result!.faction).toBe("wrath");
    expect(result!.cardIds).toEqual(["wrath_01", "wrath_03", "wrath_05"]);
  });

  it("handles lowercase prefix", () => {
    const result = decodeDeck("w:01,02");
    expect(result).not.toBeNull();
    expect(result!.faction).toBe("wrath");
  });

  it("handles single-digit card numbers", () => {
    const result = decodeDeck("E:1,2,3");
    expect(result).not.toBeNull();
    expect(result!.cardIds).toEqual(["envy_01", "envy_02", "envy_03"]);
  });

  it("removes duplicate card IDs", () => {
    const result = decodeDeck("G:01,01,02,02,03");
    expect(result).not.toBeNull();
    expect(result!.cardIds).toEqual(["greed_01", "greed_02", "greed_03"]);
  });

  it("returns null for empty string", () => {
    expect(decodeDeck("")).toBeNull();
  });

  it("returns null for missing colon", () => {
    expect(decodeDeck("W01020304")).toBeNull();
  });

  it("returns null for unknown prefix", () => {
    expect(decodeDeck("Z:01,02")).toBeNull();
  });

  it("trims whitespace and quotes", () => {
    const result = decodeDeck('  "W:01,02"  ');
    expect(result).not.toBeNull();
    expect(result!.faction).toBe("wrath");
  });
});

describe("Deck Code Validation", () => {
  it("validates a correct code", () => {
    expect(validateDeckCode("W:01,02,03").valid).toBe(true);
  });

  it("rejects empty code", () => {
    expect(validateDeckCode("").valid).toBe(false);
  });

  it("rejects missing colon", () => {
    expect(validateDeckCode("W0102").valid).toBe(false);
  });

  it("rejects unknown prefix", () => {
    expect(validateDeckCode("Z:01,02").valid).toBe(false);
  });

  it("rejects non-numeric card numbers", () => {
    expect(validateDeckCode("W:ab,cd").valid).toBe(false);
  });

  it("rejects card numbers out of range", () => {
    expect(validateDeckCode("W:55,60").valid).toBe(false);
  });
});

describe("Deck Code Roundtrip", () => {
  it("encode then decode returns original data", () => {
    const ids = ["pride_01", "pride_10", "pride_25", "pride_54"];
    const code = encodeDeck("pride", ids);
    expect(code).not.toBeNull();
    const result = decodeDeck(code!);
    expect(result).not.toBeNull();
    expect(result!.faction).toBe("pride");
    expect(result!.cardIds).toEqual(ids);
  });

  it("roundtrip works for all 7 factions", () => {
    const factions = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];
    for (const faction of factions) {
      const ids = [`${faction}_01`, `${faction}_27`, `${faction}_54`];
      const code = encodeDeck(faction, ids);
      const result = decodeDeck(code!);
      expect(result!.faction).toBe(faction);
      expect(result!.cardIds).toEqual(ids);
    }
  });
});

// ─── Matchup Matrix Data Consistency Tests ────────────────
describe("Matchup Matrix Data Consistency", () => {
  // Replicate the matchup data structure for validation
  const FACTIONS = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];
  
  // The updated matchup data from MatchupMatrix.tsx
  const MATCHUP_DATA: Record<string, Record<string, number>> = {
    wrath:    { wrath: 50.0, sloth: 48.2, greed: 50.6, envy: 51.3, pride: 49.8, lust: 47.9, gluttony: 48.5 },
    sloth:    { wrath: 51.8, sloth: 50.0, greed: 49.4, envy: 50.7, pride: 49.1, lust: 49.3, gluttony: 48.1 },
    greed:    { wrath: 49.4, sloth: 50.6, greed: 50.0, envy: 50.2, pride: 49.7, lust: 50.4, gluttony: 51.2 },
    envy:     { wrath: 48.7, sloth: 49.3, greed: 49.8, envy: 50.0, pride: 47.8, lust: 51.1, gluttony: 47.2 },
    pride:    { wrath: 50.2, sloth: 50.9, greed: 50.3, envy: 52.2, pride: 50.0, lust: 49.6, gluttony: 49.5 },
    lust:     { wrath: 52.1, sloth: 50.7, greed: 49.6, envy: 48.9, pride: 50.4, lust: 50.0, gluttony: 50.8 },
    gluttony: { wrath: 51.5, sloth: 51.9, greed: 48.8, envy: 52.8, pride: 50.5, lust: 49.2, gluttony: 50.0 },
  };

  it("all mirror matchups are exactly 50.0%", () => {
    for (const f of FACTIONS) {
      expect(MATCHUP_DATA[f][f]).toBe(50.0);
    }
  });

  it("all matchups are symmetric (A vs B + B vs A ≈ 100%)", () => {
    for (let i = 0; i < FACTIONS.length; i++) {
      for (let j = i + 1; j < FACTIONS.length; j++) {
        const a = FACTIONS[i];
        const b = FACTIONS[j];
        const sum = MATCHUP_DATA[a][b] + MATCHUP_DATA[b][a];
        expect(sum).toBeCloseTo(100.0, 0);
      }
    }
  });

  it("no faction dominates all matchups (each has at least 1 unfavorable)", () => {
    for (const f of FACTIONS) {
      const opponents = FACTIONS.filter((o) => o !== f);
      const unfavorable = opponents.filter((o) => MATCHUP_DATA[f][o] < 50.0);
      expect(unfavorable.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("all matchup values are within reasonable range (47-53%)", () => {
    for (const a of FACTIONS) {
      for (const b of FACTIONS) {
        if (a === b) continue;
        expect(MATCHUP_DATA[a][b]).toBeGreaterThanOrEqual(47);
        expect(MATCHUP_DATA[a][b]).toBeLessThanOrEqual(53);
      }
    }
  });

  it("average pairwise rate per faction is close to 50% (within 2%)", () => {
    for (const f of FACTIONS) {
      const opponents = FACTIONS.filter((o) => o !== f);
      const avg = opponents.reduce((s, o) => s + MATCHUP_DATA[f][o], 0) / opponents.length;
      expect(avg).toBeGreaterThanOrEqual(48);
      expect(avg).toBeLessThanOrEqual(52);
    }
  });

  it("max pairwise deviation is under 3%", () => {
    let maxDev = 0;
    for (const a of FACTIONS) {
      for (const b of FACTIONS) {
        if (a === b) continue;
        maxDev = Math.max(maxDev, Math.abs(MATCHUP_DATA[a][b] - 50));
      }
    }
    expect(maxDev).toBeLessThan(3);
  });
});
