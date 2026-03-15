/**
 * Profanity & Racism Filter for Gamertags
 *
 * Uses leo-profanity as the base dictionary, plus custom additions
 * for racial slurs, hate speech, and impersonation patterns.
 * Returns { ok, reason } so the frontend can show a helpful message.
 */

import leoProfanity from "leo-profanity";

// ─── Custom banned substrings (checked via substring matching) ──
const BANNED_SUBSTRINGS = [
  // Common profanity (substring match catches embedded words)
  "fuck", "shit", "cunt", "cock", "dick", "pussy", "bitch",
  "asshole", "bastard", "whore", "slut", "penis", "vagina",
  // Racial slurs & hate speech
  "nigger", "nigga", "negro", "nazi", "hitler", "kkk",
  "whitesupremacy", "whitepower", "heil", "jihad",
  "faggot", "fag", "dyke", "tranny", "retard",
  "chink", "gook", "spic", "wetback", "kike",
  // Impersonation
  "admin", "moderator", "developer", "official", "system",
  "support", "staff", "gamemaster",
];

// ─── Validation rules ───────────────────────────────────────
const MIN_LENGTH = 3;
const MAX_LENGTH = 24;
const VALID_CHARS = /^[a-zA-Z0-9_\-. ]+$/;
const NO_CONSECUTIVE_SPECIALS = /[_\-. ]{2,}/;
const STARTS_ENDS_ALNUM = /^[a-zA-Z0-9].*[a-zA-Z0-9]$/;

export interface FilterResult {
  ok: boolean;
  reason?: string;
}

/**
 * Validate and filter a proposed gamertag/username.
 * Returns { ok: true } if acceptable, or { ok: false, reason } with a user-friendly message.
 */
export function validateGamertag(tag: string): FilterResult {
  const trimmed = tag.trim();

  // Length checks
  if (trimmed.length < MIN_LENGTH) {
    return { ok: false, reason: `Must be at least ${MIN_LENGTH} characters.` };
  }
  if (trimmed.length > MAX_LENGTH) {
    return { ok: false, reason: `Must be ${MAX_LENGTH} characters or fewer.` };
  }

  // Character whitelist
  if (!VALID_CHARS.test(trimmed)) {
    return { ok: false, reason: "Only letters, numbers, underscores, hyphens, dots, and spaces allowed." };
  }

  // No consecutive special characters
  if (NO_CONSECUTIVE_SPECIALS.test(trimmed)) {
    return { ok: false, reason: "No consecutive special characters (_, -, ., space)." };
  }

  // Must start and end with alphanumeric
  if (trimmed.length >= 2 && !STARTS_ENDS_ALNUM.test(trimmed)) {
    return { ok: false, reason: "Must start and end with a letter or number." };
  }

  // Profanity / hate speech check (case-insensitive)
  const normalized = trimmed.toLowerCase().replace(/[_\-. ]/g, "");

  // 1. Check leo-profanity's built-in dictionary (whole-word matching)
  if (leoProfanity.check(normalized) || leoProfanity.check(trimmed)) {
    return { ok: false, reason: "That name contains inappropriate language. Choose something else." };
  }

  // 2. Substring matching for slurs that may be embedded in longer words
  for (const banned of BANNED_SUBSTRINGS) {
    if (normalized.includes(banned)) {
      return { ok: false, reason: "That name contains inappropriate language. Choose something else." };
    }
  }

  return { ok: true };
}
