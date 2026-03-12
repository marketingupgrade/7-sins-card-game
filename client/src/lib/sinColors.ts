/**
 * sinColors — Single source of truth for sin faction colors.
 *
 * Previously duplicated across 6+ files as local `sinColorMap` objects.
 * Import from here instead of redeclaring.
 *
 * Two variants:
 *  - SIN_TAILWIND_CLASSES: Tailwind text-color classes (e.g., "text-wrath")
 *  - SIN_HEX_COLORS: Raw hex values for canvas/SVG/inline styles
 */

export type SinName = "wrath" | "sloth" | "greed" | "envy" | "pride" | "lust" | "gluttony";

/** Tailwind CSS text-color classes per sin */
export const SIN_TAILWIND_CLASSES: Record<SinName, string> = {
  wrath: "text-wrath",
  sloth: "text-sloth",
  greed: "text-greed",
  envy: "text-envy",
  pride: "text-pride",
  lust: "text-lust",
  gluttony: "text-gluttony",
} as const;

/** Hex color values per sin — for canvas, SVG, inline styles, Babylon materials */
export const SIN_HEX_COLORS: Record<SinName, string> = {
  wrath: "#ef4444",
  sloth: "#a855f7",
  greed: "#eab308",
  envy: "#10b981",
  pride: "#f0f0f0",
  lust: "#ec4899",
  gluttony: "#b45309",
} as const;

/** Tailwind bg-color classes per sin */
export const SIN_BG_CLASSES: Record<SinName, string> = {
  wrath: "bg-wrath/20",
  sloth: "bg-sloth/20",
  greed: "bg-greed/20",
  envy: "bg-envy/20",
  pride: "bg-pride/20",
  lust: "bg-lust/20",
  gluttony: "bg-gluttony/20",
} as const;

/** CSS custom property references per sin — for inline styles */
export const SIN_CSS_VARS: Record<SinName, string> = {
  wrath: "var(--color-wrath)",
  sloth: "var(--color-sloth)",
  greed: "var(--color-greed)",
  envy: "var(--color-envy)",
  pride: "var(--color-pride)",
  lust: "var(--color-lust)",
  gluttony: "var(--color-gluttony)",
} as const;

/** OKLCH color values per sin — for Tailwind 4 compatibility */
export const SIN_OKLCH_COLORS: Record<SinName, string> = {
  wrath: "oklch(0.65 0.22 25)",
  sloth: "oklch(0.55 0.12 290)",
  greed: "oklch(0.65 0.18 145)",
  envy: "oklch(0.65 0.18 175)",
  pride: "oklch(0.85 0.03 85)",
  lust: "oklch(0.65 0.18 350)",
  gluttony: "oklch(0.55 0.12 55)",
} as const;

/** Get a sin color with fallback to wrath */
export function getSinTailwindClass(sin: string): string {
  return SIN_TAILWIND_CLASSES[sin as SinName] || SIN_TAILWIND_CLASSES.wrath;
}

export function getSinHexColor(sin: string): string {
  return SIN_HEX_COLORS[sin as SinName] || SIN_HEX_COLORS.wrath;
}

export function getSinCssVar(sin: string): string {
  return SIN_CSS_VARS[sin as SinName] || SIN_CSS_VARS.wrath;
}

export function getSinOklchColor(sin: string): string {
  return SIN_OKLCH_COLORS[sin as SinName] || SIN_OKLCH_COLORS.wrath;
}
