/**
 * iconUtils.ts — Shared helpers for Painterly Spell Icon lookups
 *
 * Painterly Spell Icons: CC-BY 3.0 by J. W. Bjerk (eleazzaar) / OpenGameArt.org
 * Custom faction icons generated for Pride, Lust, Gluttony.
 * All icon URLs come from assetUrls.ts — do not import ICON_URLS from anywhere else.
 */

import { ICON_URLS } from './assetUrls';
import type { SinType } from '@shared/gameTypes';

type IconKey = keyof typeof ICON_URLS;

/**
 * Returns the Painterly Spell Icon URL for a given effect type + sin combination.
 * Falls back to a generic icon when no sin-specific variant exists.
 * Returns null if the effect type is not recognized.
 */
export function getEffectIconUrl(effectType: string, sin: SinType): string | null {
  const map: Record<string, Partial<Record<SinType | 'default', IconKey>>> = {
    damage: {
      wrath:    'damage_wrath',
      sloth:    'damage_sloth',
      greed:    'damage_greed',
      envy:     'damage_envy',
      pride:    'damage_pride',
      lust:     'damage_lust',
      gluttony: 'damage_gluttony',
    },
    heal: {
      sloth:    'heal_sloth',
      lust:     'heal_lust',
      gluttony: 'heal_generic',
      default:  'heal_generic',
    },
    shield: {
      wrath:    'shield_wrath',
      sloth:    'shield_sloth',
      pride:    'shield_pride',
      gluttony: 'shield_gluttony',
      default:  'shield_generic',
    },
    buff: {
      wrath:    'buff_wrath',
      gluttony: 'buff_gluttony',
      default:  'buff_generic',
    },
    debuff: {
      wrath:    'debuff_wrath',
      envy:     'debuff_envy',
      default:  'debuff_wrath',
    },
    energy_drain: {
      envy:     'steal_envy',
      greed:    'steal_greed',
      default:  'energy_generic',
    },
    energy_gain: {
      default:  'energy_generic',
    },
    damage_all: {
      gluttony: 'damage_gluttony',
      default:  'damage_wrath',
    },
    self_damage: {
      wrath:    'debuff_wrath',
      default:  'debuff_wrath',
    },
  };

  const sinMap = map[effectType];
  if (!sinMap) return null;
  const key = (sinMap[sin] ?? sinMap['default']) as IconKey | undefined;
  return key ? ICON_URLS[key] : null;
}

/**
 * Painterly Spell Icon URL for a sin's archetype identity.
 * Used in faction displays (lobby selection, home page, player panels, game over).
 */
export const SIN_ARCHETYPE_ICONS: Record<SinType, string> = {
  wrath:    ICON_URLS.damage_wrath,     // fireball = aggression / fire
  sloth:    ICON_URLS.heal_sloth,       // healing glow = endurance / restoration
  greed:    ICON_URLS.steal_greed,      // coin-steal = resource manipulation
  envy:     ICON_URLS.debuff_envy,      // evil eye = copy / curse
  pride:    ICON_URLS.pride_crown,      // radiant crown = divine supremacy
  lust:     ICON_URLS.lust_charm,       // flaming heart = seduction / charm
  gluttony: ICON_URLS.gluttony_maw,     // devouring maw = insatiable hunger
};
