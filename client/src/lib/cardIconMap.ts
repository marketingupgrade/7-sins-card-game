/**
 * Maps card effects and sins to spell icon CDN URLs
 * Icons from Painterly Spell Icons by J. W. Bjerk (eleazzaar) - CC-BY 3.0
 */

import { ICON_URLS, type IconName } from "./assetUrls";

type SinName = "wrath" | "envy" | "greed" | "sloth";
type EffectCategory = "damage" | "heal" | "shield" | "buff" | "debuff" | "energy_drain" | "energy_gain";

/** Get the best icon for a card based on its primary effect and sin */
export function getCardIcon(
  primaryEffect: EffectCategory,
  sin: SinName
): string | null {
  const key = getIconKey(primaryEffect, sin);
  if (key && key in ICON_URLS) {
    return ICON_URLS[key as IconName];
  }
  return null;
}

function getIconKey(effect: EffectCategory, sin: SinName): string | null {
  // Try sin-specific icon first, then fall back to generic
  switch (effect) {
    case "damage":
      return `damage_${sin}`;
    case "heal":
      if (sin === "sloth") return "heal_sloth";
      return "heal_generic";
    case "shield":
      if (sin === "wrath") return "shield_wrath";
      if (sin === "sloth") return "shield_sloth";
      return "shield_generic";
    case "buff":
      if (sin === "wrath") return "buff_wrath";
      return "buff_generic";
    case "debuff":
      if (sin === "wrath") return "debuff_wrath";
      if (sin === "envy") return "debuff_envy";
      return "debuff_envy";
    case "energy_drain":
      return "energy_generic";
    case "energy_gain":
      return "energy_generic";
    default:
      return null;
  }
}

/** Get all available icon URLs for preloading */
export function getAllIconUrls(): string[] {
  return Object.values(ICON_URLS);
}
