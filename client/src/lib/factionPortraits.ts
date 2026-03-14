/**
 * Faction Portrait CDN URLs
 * AI-generated dark fantasy character portraits for each sin faction.
 * Used in Lobby faction selection, player panels, and game-over screen.
 * 
 * Optimized: Standard 600x600 webp, HD 800x800 webp
 */

import type { SinType } from "@shared/gameTypes";

export const FACTION_PORTRAITS: Record<SinType, string> = {
  wrath: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/portrait-wrath-opt_0149b931.webp",
  sloth: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/portrait-sloth-opt_13c12228.webp",
  greed: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/portrait-greed-opt_a97a86e5.webp",
  envy: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/portrait-envy-opt_7d0e20de.webp",
  pride: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/portrait-pride-opt_8250f244.webp",
  lust: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/portrait-lust-opt_5602ab7b.webp",
  gluttony: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/portrait-gluttony-opt_520ab47f.webp",
};

/** Full-resolution versions for hero/detail views (800x800 webp) */
export const FACTION_PORTRAITS_HD: Record<SinType, string> = {
  wrath: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/portrait-wrath-hd-opt_3ef49d3f.webp",
  sloth: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/portrait-sloth-hd-opt_9c04af8a.webp",
  greed: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/portrait-greed-hd-opt_89e6cb2e.webp",
  envy: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/portrait-envy-hd-opt_db414868.webp",
  pride: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/portrait-pride-hd-opt_31317a9a.webp",
  lust: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/portrait-lust-hd-opt_8bea556a.webp",
  gluttony: "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/portrait-gluttony-hd-opt_da38f6b6.webp",
};
