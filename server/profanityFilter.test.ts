/**
 * Profanity Filter Tests
 *
 * Validates the gamertag profanity/racism filter:
 *   - Clean names pass
 *   - Profanity is rejected
 *   - Racial slurs are rejected
 *   - Format rules enforced (length, chars, consecutive specials)
 *   - Impersonation patterns blocked
 */

import { describe, it, expect } from "vitest";
import { validateGamertag } from "./profanityFilter";

describe("Profanity Filter — validateGamertag", () => {
  // ─── Valid gamertags ─────────────────────────────────────
  it("accepts a clean alphanumeric name", () => {
    expect(validateGamertag("CoolPlayer42")).toEqual({ ok: true });
  });

  it("accepts names with underscores and hyphens", () => {
    expect(validateGamertag("Dark-Knight_99")).toEqual({ ok: true });
  });

  it("accepts names with dots and spaces", () => {
    expect(validateGamertag("Joris.van Huet")).toEqual({ ok: true });
  });

  it("accepts minimum length (3 chars)", () => {
    expect(validateGamertag("Ace")).toEqual({ ok: true });
  });

  it("accepts maximum length (24 chars)", () => {
    expect(validateGamertag("A".repeat(24))).toEqual({ ok: true });
  });

  // ─── Length violations ───────────────────────────────────
  it("rejects names shorter than 3 characters", () => {
    const result = validateGamertag("AB");
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("at least 3");
  });

  it("rejects names longer than 24 characters", () => {
    const result = validateGamertag("A".repeat(25));
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("24 characters");
  });

  it("rejects empty string", () => {
    const result = validateGamertag("");
    expect(result.ok).toBe(false);
  });

  it("rejects whitespace-only string", () => {
    const result = validateGamertag("   ");
    expect(result.ok).toBe(false);
  });

  // ─── Character violations ────────────────────────────────
  it("rejects names with special characters (@, #, !)", () => {
    const result = validateGamertag("Player@123");
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("Only letters");
  });

  it("rejects names with unicode/emoji", () => {
    const result = validateGamertag("Cool😎Player");
    expect(result.ok).toBe(false);
  });

  // ─── Consecutive special characters ──────────────────────
  it("rejects consecutive underscores", () => {
    const result = validateGamertag("Player__Name");
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("consecutive");
  });

  it("rejects consecutive hyphens", () => {
    const result = validateGamertag("Player--Name");
    expect(result.ok).toBe(false);
  });

  // ─── Start/end rules ─────────────────────────────────────
  it("rejects names starting with underscore", () => {
    const result = validateGamertag("_Player");
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("start and end");
  });

  it("rejects names ending with hyphen", () => {
    const result = validateGamertag("Player-");
    expect(result.ok).toBe(false);
  });

  // ─── Profanity detection ─────────────────────────────────
  it("rejects common profanity", () => {
    const result = validateGamertag("FuckYou123");
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("inappropriate");
  });

  it("rejects profanity with separators", () => {
    const result = validateGamertag("F-U-C-K");
    // The normalized version strips separators, so "fuck" should be caught
    expect(result.ok).toBe(false);
  });

  it("rejects another common slur", () => {
    const result = validateGamertag("ShitLord");
    expect(result.ok).toBe(false);
  });

  // ─── Racial slur detection ───────────────────────────────
  it("rejects the n-word", () => {
    const result = validateGamertag("TestNigger");
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("inappropriate");
  });

  it("rejects homophobic slurs", () => {
    const result = validateGamertag("Faggot99");
    expect(result.ok).toBe(false);
  });

  // ─── Impersonation patterns ──────────────────────────────
  it("rejects 'admin' impersonation", () => {
    const result = validateGamertag("AdminPlayer");
    expect(result.ok).toBe(false);
  });

  it("rejects 'moderator' impersonation", () => {
    const result = validateGamertag("ModeratorJoe");
    expect(result.ok).toBe(false);
  });

  it("rejects 'official' impersonation", () => {
    const result = validateGamertag("OfficialGame");
    expect(result.ok).toBe(false);
  });

  // ─── Edge cases ──────────────────────────────────────────
  it("trims whitespace before validation", () => {
    expect(validateGamertag("  CleanName  ")).toEqual({ ok: true });
  });

  it("accepts sin-themed names (game context)", () => {
    expect(validateGamertag("WrathKing")).toEqual({ ok: true });
    expect(validateGamertag("SlothMaster")).toEqual({ ok: true });
    expect(validateGamertag("PrideWarrior")).toEqual({ ok: true });
  });
});
