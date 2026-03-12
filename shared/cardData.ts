/**
 * 7 Deadly Sins Card Game — Card Data v4: 252 Compound-Only Cards
 *
 * ALL cards are compound-only. No flat effects.
 * 36 cards per faction, 7 factions = 252 total.
 *
 * Balance: Monte Carlo validated across 15,000 games
 * Max deviation: 2.9% (all factions within 22-28% win rate)
 *
 * Compound Patterns:
 *   standard:   Fibonacci [1,1,2,3,5,8...] — balanced scaling
 *   aggressive: Powers of 2 [1,2,4,8,16...] — explosive growth
 *   slowburn:   Flat-ish [1,1,1,1,2,2,3...] — consistent pressure
 *
 * Effect Types:
 *   damage, self_damage, heal_gain, heal_steal, heal_block,
 *   shield_gain, shield_steal, shield_block, energy_gain,
 *   energy_steal, energy_block, affliction_amplify, affliction_transfer
 *
 * Target Modes: single, duo, aoe, self
 */

import type { CardDefinition, SinType, CompoundPattern, EffectType, TargetMode, CardTier } from "./gameTypes";

// ═══════════════════════════════════════════════════════════════
// WRATH — 36 cards
// ═══════════════════════════════════════════════════════════════
export const WRATH_CARDS: CardDefinition[] = [
  {
    id: "wrath_01", name: "Rage Spark", sin: "wrath",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "single" }, { type: "self_damage", baseValue: 1, duration: 1, targetMode: "self" }],
    description: "A spark of fury ignites compound pain",
  },
  {
    id: "wrath_02", name: "Blind Fury", sin: "wrath",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "single" }],
    description: "Unfocused rage finds a target",
  },
  {
    id: "wrath_03", name: "Burning Fists", sin: "wrath",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "single" }, { type: "self_damage", baseValue: 1, duration: 1, targetMode: "self" }],
    description: "Each punch scorches your own knuckles",
  },
  {
    id: "wrath_04", name: "Reckless Charge", sin: "wrath",
    cost: 1, tier: "common", compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "self_damage", baseValue: 2, duration: 1, targetMode: "self" }],
    description: "Charge headfirst into danger",
  },
  {
    id: "wrath_05", name: "Ember Slash", sin: "wrath",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "single" }],
    description: "A fiery cut that festers",
  },
  {
    id: "wrath_06", name: "Tantrum", sin: "wrath",
    cost: 0, tier: "common", compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "aoe" }, { type: "self_damage", baseValue: 2, duration: 1, targetMode: "self" }],
    description: "Lash out at everyone, including yourself",
  },
  {
    id: "wrath_07", name: "Spite", sin: "wrath",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "duo" }],
    description: "Hatred splits between two targets",
  },
  {
    id: "wrath_08", name: "Grudge Mark", sin: "wrath",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "single" }, { type: "shield_block", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "Mark a foe so their shields crumble",
  },
  {
    id: "wrath_09", name: "Searing Touch", sin: "wrath",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "single" }, { type: "self_damage", baseValue: 1, duration: 1, targetMode: "self" }],
    description: "Burn through their defenses",
  },
  {
    id: "wrath_10", name: "Fury Swipe", sin: "wrath",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "duo" }],
    description: "Claw at two enemies",
  },
  {
    id: "wrath_11", name: "Blood Boil", sin: "wrath",
    cost: 0, tier: "common", compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "single" }, { type: "self_damage", baseValue: 1, duration: 1, targetMode: "self" }],
    description: "Your blood burns as theirs does",
  },
  {
    id: "wrath_12", name: "Flame Lash", sin: "wrath",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "aoe" }],
    description: "Whip of fire strikes all",
  },
  {
    id: "wrath_13", name: "Volatile Temper", sin: "wrath",
    cost: 1, tier: "common", compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "self_damage", baseValue: 1, duration: 1, targetMode: "self" }],
    description: "Explosive but brief",
  },
  {
    id: "wrath_14", name: "Scorch", sin: "wrath",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "heal_block", baseValue: 1, duration: 3, targetMode: "single" }],
    description: "Burns that prevent healing",
  },
  {
    id: "wrath_15", name: "Rage Pulse", sin: "wrath",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "aoe" }, { type: "self_damage", baseValue: 2, duration: 1, targetMode: "self" }],
    description: "Pulse of anger hits everyone",
  },
  {
    id: "wrath_16", name: "Smolder", sin: "wrath",
    cost: 1, tier: "common", compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "single" }],
    description: "Slow-burning hatred",
  },
  {
    id: "wrath_17", name: "Vendetta", sin: "wrath",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "single" }, { type: "self_damage", baseValue: 2, duration: 1, targetMode: "self" }],
    description: "Personal vengeance at any cost",
  },
  {
    id: "wrath_18", name: "Sparking Rage", sin: "wrath",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "single" }, { type: "energy_gain", baseValue: 1, duration: 1, targetMode: "self" }],
    description: "Anger fuels your next move",
  },
  {
    id: "wrath_19", name: "Inferno Breath", sin: "wrath",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "aoe" }, { type: "self_damage", baseValue: 2, duration: 1, targetMode: "self" }],
    description: "Breathe fire on all enemies",
  },
  {
    id: "wrath_20", name: "Berserk Frenzy", sin: "wrath",
    cost: 3, tier: "rare", compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "single" }, { type: "self_damage", baseValue: 2, duration: 1, targetMode: "self" }],
    description: "Lose control for devastating power",
  },
  {
    id: "wrath_21", name: "Molten Core", sin: "wrath",
    cost: 2, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "duo" }, { type: "self_damage", baseValue: 2, duration: 1, targetMode: "self" }],
    description: "Your core melts two targets",
  },
  {
    id: "wrath_22", name: "Wrathful Blaze", sin: "wrath",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "single" }, { type: "self_damage", baseValue: 2, duration: 1, targetMode: "self" }],
    description: "Concentrated fury on one target",
  },
  {
    id: "wrath_23", name: "Scorched Earth", sin: "wrath",
    cost: 4, tier: "rare", compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "aoe" }, { type: "self_damage", baseValue: 2, duration: 1, targetMode: "self" }],
    description: "Burn the world slowly",
  },
  {
    id: "wrath_24", name: "Fury Shield", sin: "wrath",
    cost: 2, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 2, duration: 3, targetMode: "self" }, { type: "damage", baseValue: 3, duration: 3, targetMode: "single" }],
    description: "Rage hardens into armor",
  },
  {
    id: "wrath_25", name: "Bloodlust", sin: "wrath",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "single" }, { type: "heal_gain", baseValue: 1, duration: 2, targetMode: "self" }, { type: "self_damage", baseValue: 2, duration: 1, targetMode: "self" }],
    description: "Feed on the pain you cause",
  },
  {
    id: "wrath_26", name: "Eruption", sin: "wrath",
    cost: 3, tier: "rare", compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "aoe" }, { type: "self_damage", baseValue: 2, duration: 1, targetMode: "self" }],
    description: "Volcanic burst hits everyone",
  },
  {
    id: "wrath_27", name: "Hate Spiral", sin: "wrath",
    cost: 2, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "single" }, { type: "affliction_amplify", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "Amplify their suffering",
  },
  {
    id: "wrath_28", name: "Firestorm", sin: "wrath",
    cost: 4, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "aoe" }, { type: "self_damage", baseValue: 3, duration: 1, targetMode: "self" }],
    description: "Rain fire on all",
  },
  {
    id: "wrath_29", name: "Rage Drain", sin: "wrath",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "Steal their will to fight",
  },
  {
    id: "wrath_30", name: "Burning Vengeance", sin: "wrath",
    cost: 2, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "duo" }, { type: "self_damage", baseValue: 2, duration: 1, targetMode: "self" }],
    description: "Vengeance burns two",
  },
  {
    id: "wrath_31", name: "Apocalypse Flame", sin: "wrath",
    cost: 4, tier: "epic", compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "aoe" }, { type: "self_damage", baseValue: 4, duration: 1, targetMode: "self" }],
    description: "Apocalyptic fire consumes all",
  },
  {
    id: "wrath_32", name: "Ragnarok", sin: "wrath",
    cost: 5, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 5, duration: 4, targetMode: "aoe" }, { type: "self_damage", baseValue: 5, duration: 1, targetMode: "self" }],
    description: "The end of all things",
  },
  {
    id: "wrath_33", name: "Undying Fury", sin: "wrath",
    cost: 4, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "single" }, { type: "heal_gain", baseValue: 2, duration: 3, targetMode: "self" }, { type: "self_damage", baseValue: 2, duration: 1, targetMode: "self" }],
    description: "Fury that sustains itself",
  },
  {
    id: "wrath_34", name: "Hellfire Nova", sin: "wrath",
    cost: 5, tier: "epic", compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "duo" }, { type: "heal_block", baseValue: 2, duration: 3, targetMode: "duo" }, { type: "self_damage", baseValue: 3, duration: 1, targetMode: "self" }],
    description: "Nova of hellfire blocks all healing",
  },
  {
    id: "wrath_35", name: "Wrath Incarnate", sin: "wrath",
    cost: 5, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 5, duration: 5, targetMode: "single" }, { type: "self_damage", baseValue: 3, duration: 1, targetMode: "self" }],
    description: "Become wrath itself",
  },
  {
    id: "wrath_36", name: "Cataclysm", sin: "wrath",
    cost: 4, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "aoe" }, { type: "shield_block", baseValue: 2, duration: 3, targetMode: "aoe" }, { type: "self_damage", baseValue: 4, duration: 1, targetMode: "self" }],
    description: "Destroy everything, shields included",
  },
];

// ═══════════════════════════════════════════════════════════════
// SLOTH — 36 cards
// ═══════════════════════════════════════════════════════════════
export const SLOTH_CARDS: CardDefinition[] = [
  {
    id: "sloth_01", name: "Drowsy Ward", sin: "sloth",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 2, duration: 3, targetMode: "self" }],
    description: "Lazily raise a barrier",
  },
  {
    id: "sloth_02", name: "Lethargy", sin: "sloth",
    cost: 1, tier: "common", compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "single" }],
    description: "Slow, creeping exhaustion",
  },
  {
    id: "sloth_03", name: "Yawn", sin: "sloth",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "energy_block", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "Your yawn saps their energy",
  },
  {
    id: "sloth_04", name: "Lazy Swipe", sin: "sloth",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 2, targetMode: "single" }],
    description: "A halfhearted attack",
  },
  {
    id: "sloth_05", name: "Cocoon", sin: "sloth",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 2, duration: 3, targetMode: "self" }, { type: "heal_gain", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "Wrap yourself in protective silk",
  },
  {
    id: "sloth_06", name: "Torpor", sin: "sloth",
    cost: 1, tier: "common", compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "duo" }],
    description: "Spreading numbness",
  },
  {
    id: "sloth_07", name: "Nap Time", sin: "sloth",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "A quick nap restores health",
  },
  {
    id: "sloth_08", name: "Stagnation", sin: "sloth",
    cost: 2, tier: "common", compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "aoe" }],
    description: "Everything slows to a crawl",
  },
  {
    id: "sloth_09", name: "Thick Skin", sin: "sloth",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 3, duration: 2, targetMode: "self" }],
    description: "Skin hardens against attacks",
  },
  {
    id: "sloth_10", name: "Drag Down", sin: "sloth",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "energy_block", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "Pull them into your pace",
  },
  {
    id: "sloth_11", name: "Moss Armor", sin: "sloth",
    cost: 1, tier: "common", compoundPattern: "slowburn",
    effects: [{ type: "shield_gain", baseValue: 1, duration: 5, targetMode: "self" }],
    description: "Slow-growing natural armor",
  },
  {
    id: "sloth_12", name: "Apathy", sin: "sloth",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "heal_block", baseValue: 1, duration: 3, targetMode: "single" }],
    description: "Why bother healing?",
  },
  {
    id: "sloth_13", name: "Snore", sin: "sloth",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "aoe" }],
    description: "Your snoring damages everyone",
  },
  {
    id: "sloth_14", name: "Hibernate", sin: "sloth",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 2, duration: 3, targetMode: "self" }, { type: "shield_gain", baseValue: 1, duration: 3, targetMode: "self" }],
    description: "Deep rest restores and protects",
  },
  {
    id: "sloth_15", name: "Weight of Inaction", sin: "sloth",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
    description: "Inaction has consequences",
  },
  {
    id: "sloth_16", name: "Sluggish Blow", sin: "sloth",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 2, targetMode: "single" }, { type: "shield_gain", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "Slow but protected",
  },
  {
    id: "sloth_17", name: "Passive Resistance", sin: "sloth",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 2, duration: 2, targetMode: "self" }, { type: "damage", baseValue: 4, duration: 2, targetMode: "single" }],
    description: "Resist and reflect",
  },
  {
    id: "sloth_18", name: "Entropy", sin: "sloth",
    cost: 0, tier: "common", compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "single" }],
    description: "Everything decays eventually",
  },
  {
    id: "sloth_19", name: "Stone Wall", sin: "sloth",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 3, duration: 4, targetMode: "self" }],
    description: "An impenetrable wall",
  },
  {
    id: "sloth_20", name: "Quicksand", sin: "sloth",
    cost: 3, tier: "rare", compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "single" }, { type: "energy_block", baseValue: 1, duration: 3, targetMode: "single" }],
    description: "Sink slowly into the mire",
  },
  {
    id: "sloth_21", name: "Regeneration", sin: "sloth",
    cost: 2, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 2, duration: 4, targetMode: "self" }],
    description: "Slow but steady recovery",
  },
  {
    id: "sloth_22", name: "Crushing Weight", sin: "sloth",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "shield_block", baseValue: 1, duration: 3, targetMode: "single" }],
    description: "Gravity crushes their defenses",
  },
  {
    id: "sloth_23", name: "Petrify", sin: "sloth",
    cost: 4, tier: "rare", compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "duo" }, { type: "energy_block", baseValue: 1, duration: 3, targetMode: "duo" }],
    description: "Turn them to stone",
  },
  {
    id: "sloth_24", name: "Fortress Mind", sin: "sloth",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 3, duration: 3, targetMode: "self" }, { type: "heal_gain", baseValue: 1, duration: 3, targetMode: "self" }],
    description: "Mental fortress of calm",
  },
  {
    id: "sloth_25", name: "Tar Pit", sin: "sloth",
    cost: 3, tier: "rare", compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "aoe" }, { type: "energy_block", baseValue: 1, duration: 3, targetMode: "aoe" }],
    description: "Everyone gets stuck",
  },
  {
    id: "sloth_26", name: "Immovable Object", sin: "sloth",
    cost: 4, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 4, duration: 3, targetMode: "self" }, { type: "damage", baseValue: 3, duration: 2, targetMode: "single" }],
    description: "Nothing moves you",
  },
  {
    id: "sloth_27", name: "Decay Aura", sin: "sloth",
    cost: 2, tier: "rare", compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "aoe" }],
    description: "Everything around you rots",
  },
  {
    id: "sloth_28", name: "Slumber Strike", sin: "sloth",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "duo" }],
    description: "Strike two while half-asleep",
  },
  {
    id: "sloth_29", name: "Enduring Will", sin: "sloth",
    cost: 2, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 3, duration: 3, targetMode: "self" }, { type: "shield_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "Will to survive",
  },
  {
    id: "sloth_30", name: "Gravity Well", sin: "sloth",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "aoe" }, { type: "shield_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "Pull everyone down",
  },
  {
    id: "sloth_31", name: "Eternal Slumber", sin: "sloth",
    cost: 4, tier: "epic", compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "single" }, { type: "heal_block", baseValue: 2, duration: 4, targetMode: "single" }, { type: "energy_block", baseValue: 1, duration: 4, targetMode: "single" }],
    description: "Sleep from which none wake",
  },
  {
    id: "sloth_32", name: "Mountain Form", sin: "sloth",
    cost: 4, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 4, duration: 4, targetMode: "self" }, { type: "heal_gain", baseValue: 2, duration: 4, targetMode: "self" }],
    description: "Become the mountain",
  },
  {
    id: "sloth_33", name: "World Weariness", sin: "sloth",
    cost: 5, tier: "epic", compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "aoe" }, { type: "energy_block", baseValue: 2, duration: 4, targetMode: "aoe" }],
    description: "The world tires of existing",
  },
  {
    id: "sloth_34", name: "Absolute Stillness", sin: "sloth",
    cost: 5, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 5, duration: 3, targetMode: "self" }, { type: "damage", baseValue: 3, duration: 3, targetMode: "single" }],
    description: "Perfect stillness, perfect defense",
  },
  {
    id: "sloth_35", name: "Time Dilation", sin: "sloth",
    cost: 4, tier: "epic", compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "duo" }, { type: "shield_gain", baseValue: 2, duration: 4, targetMode: "self" }],
    description: "Time slows around you",
  },
  {
    id: "sloth_36", name: "Heat Death", sin: "sloth",
    cost: 5, tier: "epic", compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "aoe" }, { type: "shield_gain", baseValue: 3, duration: 3, targetMode: "self" }],
    description: "The universe ends in silence",
  },
];

// ═══════════════════════════════════════════════════════════════
// GREED — 36 cards
// ═══════════════════════════════════════════════════════════════
export const GREED_CARDS: CardDefinition[] = [
  {
    id: "greed_01", name: "Pickpocket", sin: "greed",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "energy_steal", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "Quick fingers, quick gains",
  },
  {
    id: "greed_02", name: "Tax Collector", sin: "greed",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "Pay your dues",
  },
  {
    id: "greed_03", name: "Siphon", sin: "greed",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 2, duration: 1, targetMode: "single" }],
    description: "Drain their vitality",
  },
  {
    id: "greed_04", name: "Coin Toss", sin: "greed",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
    description: "Heads you lose",
  },
  {
    id: "greed_05", name: "Toll Gate", sin: "greed",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "Pay the toll",
  },
  {
    id: "greed_06", name: "Embezzle", sin: "greed",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "energy_steal", baseValue: 1, duration: 1, targetMode: "duo" }, { type: "damage", baseValue: 4, duration: 3, targetMode: "duo" }],
    description: "Skim from two sources",
  },
  {
    id: "greed_07", name: "Gold Rush", sin: "greed",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "energy_gain", baseValue: 2, duration: 1, targetMode: "self" }, { type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
    description: "Strike gold",
  },
  {
    id: "greed_08", name: "Extort", sin: "greed",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
    description: "Pay up or suffer",
  },
  {
    id: "greed_09", name: "Leech", sin: "greed",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "A small but free drain",
  },
  {
    id: "greed_10", name: "Hoard", sin: "greed",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 2, duration: 3, targetMode: "self" }, { type: "shield_steal", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "Take theirs, keep yours",
  },
  {
    id: "greed_11", name: "Debt Collector", sin: "greed",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "energy_block", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "Collect what is owed",
  },
  {
    id: "greed_12", name: "Skim", sin: "greed",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
    description: "Take a little off the top",
  },
  {
    id: "greed_13", name: "Ransack", sin: "greed",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "shield_steal", baseValue: 2, duration: 1, targetMode: "single" }, { type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
    description: "Strip their defenses",
  },
  {
    id: "greed_14", name: "Bribe", sin: "greed",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "energy_gain", baseValue: 1, duration: 1, targetMode: "self" }, { type: "heal_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "Money buys health",
  },
  {
    id: "greed_15", name: "Compound Interest", sin: "greed",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
    description: "Debt grows over time",
  },
  {
    id: "greed_16", name: "Mug", sin: "greed",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "heal_steal", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "Quick robbery",
  },
  {
    id: "greed_17", name: "Market Crash", sin: "greed",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "energy_block", baseValue: 1, duration: 3, targetMode: "aoe" }],
    description: "Everyone loses",
  },
  {
    id: "greed_18", name: "Opportunist", sin: "greed",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "Strike when they are weak",
  },
  {
    id: "greed_19", name: "Grand Heist", sin: "greed",
    cost: 2, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "energy_steal", baseValue: 2, duration: 1, targetMode: "single" }, { type: "shield_steal", baseValue: 2, duration: 1, targetMode: "single" }, { type: "heal_steal", baseValue: 2, duration: 1, targetMode: "single" }],
    description: "Take everything",
  },
  {
    id: "greed_20", name: "Monopoly", sin: "greed",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "energy_steal", baseValue: 1, duration: 1, targetMode: "aoe" }, { type: "damage", baseValue: 4, duration: 3, targetMode: "aoe" }],
    description: "Control all resources",
  },
  {
    id: "greed_21", name: "Hostile Takeover", sin: "greed",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 3, duration: 1, targetMode: "single" }],
    description: "Seize their assets",
  },
  {
    id: "greed_22", name: "Pyramid Scheme", sin: "greed",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "duo" }, { type: "energy_steal", baseValue: 1, duration: 1, targetMode: "duo" }],
    description: "Everyone pays into your scheme",
  },
  {
    id: "greed_23", name: "Loan Shark", sin: "greed",
    cost: 2, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "heal_block", baseValue: 1, duration: 3, targetMode: "single" }],
    description: "Interest rates are brutal",
  },
  {
    id: "greed_24", name: "Vault", sin: "greed",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 3, duration: 3, targetMode: "self" }, { type: "heal_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "Lock away your wealth",
  },
  {
    id: "greed_25", name: "Insider Trading", sin: "greed",
    cost: 2, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "energy_gain", baseValue: 2, duration: 1, targetMode: "self" }, { type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
    description: "Information is power",
  },
  {
    id: "greed_26", name: "Plunder", sin: "greed",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 3, duration: 1, targetMode: "duo" }, { type: "damage", baseValue: 4, duration: 3, targetMode: "duo" }],
    description: "Raid two targets",
  },
  {
    id: "greed_27", name: "Golden Shield", sin: "greed",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 3, duration: 3, targetMode: "self" }, { type: "shield_steal", baseValue: 2, duration: 1, targetMode: "single" }],
    description: "Gilded protection",
  },
  {
    id: "greed_28", name: "Tax Evasion", sin: "greed",
    cost: 2, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 2, duration: 3, targetMode: "self" }, { type: "energy_gain", baseValue: 1, duration: 1, targetMode: "self" }],
    description: "Keep what is yours",
  },
  {
    id: "greed_29", name: "Bankruptcy", sin: "greed",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 1, targetMode: "aoe" }],
    description: "Everyone goes broke",
  },
  {
    id: "greed_30", name: "Blood Money", sin: "greed",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "heal_steal", baseValue: 2, duration: 1, targetMode: "single" }],
    description: "Profit from pain",
  },
  {
    id: "greed_31", name: "Dragon Hoard", sin: "greed",
    cost: 3, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 4, duration: 4, targetMode: "self" }, { type: "shield_steal", baseValue: 3, duration: 1, targetMode: "aoe" }],
    description: "Hoard everything",
  },
  {
    id: "greed_32", name: "Economic Collapse", sin: "greed",
    cost: 3, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "aoe" }, { type: "energy_steal", baseValue: 2, duration: 1, targetMode: "aoe" }],
    description: "The economy crumbles",
  },
  {
    id: "greed_33", name: "Midas Touch", sin: "greed",
    cost: 3, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "heal_steal", baseValue: 3, duration: 1, targetMode: "single" }, { type: "shield_steal", baseValue: 3, duration: 1, targetMode: "single" }],
    description: "Everything you touch turns to gold",
  },
  {
    id: "greed_34", name: "Wealth Beyond Measure", sin: "greed",
    cost: 3, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "energy_gain", baseValue: 3, duration: 1, targetMode: "self" }, { type: "heal_gain", baseValue: 3, duration: 3, targetMode: "self" }, { type: "shield_gain", baseValue: 3, duration: 3, targetMode: "self" }],
    description: "Unlimited resources",
  },
  {
    id: "greed_35", name: "Hostile Merger", sin: "greed",
    cost: 3, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "duo" }, { type: "energy_steal", baseValue: 2, duration: 1, targetMode: "duo" }, { type: "heal_steal", baseValue: 3, duration: 1, targetMode: "duo" }],
    description: "Absorb two rivals",
  },
  {
    id: "greed_36", name: "Ultimate Heist", sin: "greed",
    cost: 3, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 4, duration: 1, targetMode: "single" }, { type: "shield_steal", baseValue: 4, duration: 1, targetMode: "single" }, { type: "energy_steal", baseValue: 3, duration: 1, targetMode: "single" }],
    description: "Take absolutely everything",
  },
];

// ═══════════════════════════════════════════════════════════════
// ENVY — 36 cards
// ═══════════════════════════════════════════════════════════════
export const ENVY_CARDS: CardDefinition[] = [
  {
    id: "envy_01", name: "Covet", sin: "envy",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "single" }],
    description: "Want what they have",
  },
  {
    id: "envy_02", name: "Bitter Glance", sin: "envy",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "single" }, { type: "affliction_amplify", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "Your jealousy worsens their pain",
  },
  {
    id: "envy_03", name: "Green-Eyed Strike", sin: "envy",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "duo" }],
    description: "Envy strikes two",
  },
  {
    id: "envy_04", name: "Spite Curse", sin: "envy",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "affliction_amplify", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "Make their suffering worse",
  },
  {
    id: "envy_05", name: "Comparison", sin: "envy",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "single" }],
    description: "You should have what they have",
  },
  {
    id: "envy_06", name: "Resentment", sin: "envy",
    cost: 1, tier: "common", compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "single" }],
    description: "Slow-building hatred",
  },
  {
    id: "envy_07", name: "Copycat", sin: "envy",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "single" }, { type: "shield_gain", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "Copy their strength",
  },
  {
    id: "envy_08", name: "Sabotage", sin: "envy",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "shield_block", baseValue: 1, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
    description: "If I cannot have it, neither can you",
  },
  {
    id: "envy_09", name: "Toxic Jealousy", sin: "envy",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "duo" }, { type: "affliction_amplify", baseValue: 1, duration: 1, targetMode: "duo" }],
    description: "Jealousy poisons two",
  },
  {
    id: "envy_10", name: "Undermine", sin: "envy",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "heal_block", baseValue: 1, duration: 3, targetMode: "single" }],
    description: "Prevent their recovery",
  },
  {
    id: "envy_11", name: "Grudge", sin: "envy",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "single" }],
    description: "A lasting grudge",
  },
  {
    id: "envy_12", name: "Mirror Curse", sin: "envy",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "affliction_transfer", baseValue: 1, duration: 1, targetMode: "single" }, { type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
    description: "Transfer your pain to them",
  },
  {
    id: "envy_13", name: "Belittle", sin: "envy",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "single" }, { type: "energy_block", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "Make them feel small",
  },
  {
    id: "envy_14", name: "Schadenfreude", sin: "envy",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 1, duration: 2, targetMode: "self" }, { type: "affliction_amplify", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "Joy from their misery",
  },
  {
    id: "envy_15", name: "Poisoned Praise", sin: "envy",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "single" }, { type: "heal_block", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "Compliments laced with venom",
  },
  {
    id: "envy_16", name: "Steal Thunder", sin: "envy",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "energy_steal", baseValue: 1, duration: 1, targetMode: "single" }, { type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
    description: "Take their moment",
  },
  {
    id: "envy_17", name: "Passive Aggression", sin: "envy",
    cost: 1, tier: "common", compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "duo" }],
    description: "Subtle but persistent",
  },
  {
    id: "envy_18", name: "Jealous Ward", sin: "envy",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "Protect what little you have",
  },
  {
    id: "envy_19", name: "Mass Resentment", sin: "envy",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 1, duration: 1, targetMode: "aoe" }],
    description: "Everyone suffers more",
  },
  {
    id: "envy_20", name: "Identity Theft", sin: "envy",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 3, duration: 1, targetMode: "single" }, { type: "shield_steal", baseValue: 2, duration: 1, targetMode: "single" }],
    description: "Become them",
  },
  {
    id: "envy_21", name: "Curse of Comparison", sin: "envy",
    cost: 2, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "affliction_amplify", baseValue: 2, duration: 1, targetMode: "single" }, { type: "damage", baseValue: 4, duration: 4, targetMode: "single" }],
    description: "Double their worst affliction",
  },
  {
    id: "envy_22", name: "Vicious Cycle", sin: "envy",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "single" }, { type: "affliction_amplify", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "Pain breeds more pain",
  },
  {
    id: "envy_23", name: "Green Plague", sin: "envy",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "aoe" }],
    description: "Envy spreads like disease",
  },
  {
    id: "envy_24", name: "Doppelganger", sin: "envy",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 3, duration: 3, targetMode: "self" }, { type: "damage", baseValue: 3, duration: 3, targetMode: "single" }],
    description: "Mirror their defenses",
  },
  {
    id: "envy_25", name: "Backstab", sin: "envy",
    cost: 2, tier: "rare", compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 1, targetMode: "single" }],
    description: "Strike when they trust you",
  },
  {
    id: "envy_26", name: "Malicious Intent", sin: "envy",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "duo" }, { type: "heal_block", baseValue: 1, duration: 3, targetMode: "duo" }],
    description: "Pure malice toward two",
  },
  {
    id: "envy_27", name: "Parasitic Bond", sin: "envy",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "single" }, { type: "heal_gain", baseValue: 1, duration: 3, targetMode: "self" }],
    description: "Feed off their pain",
  },
  {
    id: "envy_28", name: "Twisted Mirror", sin: "envy",
    cost: 4, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "affliction_transfer", baseValue: 2, duration: 1, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 1, targetMode: "single" }],
    description: "Transfer and amplify",
  },
  {
    id: "envy_29", name: "Social Decay", sin: "envy",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "aoe" }, { type: "energy_block", baseValue: 1, duration: 2, targetMode: "aoe" }],
    description: "Society crumbles",
  },
  {
    id: "envy_30", name: "Covetous Strike", sin: "envy",
    cost: 2, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "Take what you desire",
  },
  {
    id: "envy_31", name: "Absolute Envy", sin: "envy",
    cost: 4, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "single" }, { type: "affliction_amplify", baseValue: 3, duration: 1, targetMode: "single" }, { type: "heal_block", baseValue: 2, duration: 3, targetMode: "single" }],
    description: "Total jealous destruction",
  },
  {
    id: "envy_32", name: "Pandemic of Spite", sin: "envy",
    cost: 4, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 2, duration: 1, targetMode: "aoe" }],
    description: "Everyone suffers maximally",
  },
  {
    id: "envy_33", name: "Soul Swap", sin: "envy",
    cost: 4, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "affliction_transfer", baseValue: 3, duration: 1, targetMode: "single" }, { type: "heal_steal", baseValue: 4, duration: 1, targetMode: "single" }, { type: "shield_steal", baseValue: 3, duration: 1, targetMode: "single" }],
    description: "Trade lives",
  },
  {
    id: "envy_34", name: "Nemesis", sin: "envy",
    cost: 4, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 1, targetMode: "single" }],
    description: "Become their worst nightmare",
  },
  {
    id: "envy_35", name: "Cascade of Envy", sin: "envy",
    cost: 4, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "aoe" }, { type: "shield_block", baseValue: 2, duration: 3, targetMode: "aoe" }],
    description: "Envy cascades through all",
  },
  {
    id: "envy_36", name: "Perfect Copy", sin: "envy",
    cost: 4, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "duo" }, { type: "affliction_amplify", baseValue: 2, duration: 1, targetMode: "duo" }, { type: "heal_steal", baseValue: 3, duration: 1, targetMode: "duo" }],
    description: "Copy and surpass",
  },
];

// ═══════════════════════════════════════════════════════════════
// PRIDE — 36 cards
// ═══════════════════════════════════════════════════════════════
export const PRIDE_CARDS: CardDefinition[] = [
  {
    id: "pride_01", name: "Disdain", sin: "pride",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }],
    description: "Beneath your notice",
  },
  {
    id: "pride_02", name: "Contempt", sin: "pride",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 2, targetMode: "duo" }],
    description: "Look down on two",
  },
  {
    id: "pride_03", name: "Self-Assurance", sin: "pride",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "Confidence is armor",
  },
  {
    id: "pride_04", name: "Dismiss", sin: "pride",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "heal_block", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "You are not worth healing",
  },
  {
    id: "pride_05", name: "Sneer", sin: "pride",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 2, targetMode: "single" }, { type: "energy_block", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "A withering look",
  },
  {
    id: "pride_06", name: "Vanity", sin: "pride",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "Admire your own perfection",
  },
  {
    id: "pride_07", name: "Arrogance", sin: "pride",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 2, targetMode: "single" }],
    description: "Too proud to dodge",
  },
  {
    id: "pride_08", name: "Superiority", sin: "pride",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "affliction_amplify", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "You deserve worse",
  },
  {
    id: "pride_09", name: "Haughty Gaze", sin: "pride",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "shield_block", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "Shatter their confidence",
  },
  {
    id: "pride_10", name: "Condescend", sin: "pride",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }],
    description: "Speak down to them",
  },
  {
    id: "pride_11", name: "Royal Decree", sin: "pride",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }],
    description: "By royal command",
  },
  {
    id: "pride_12", name: "Golden Armor", sin: "pride",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 2, duration: 3, targetMode: "self" }],
    description: "Armor fit for a king",
  },
  {
    id: "pride_13", name: "Imperious Strike", sin: "pride",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }],
    description: "Strike with authority",
  },
  {
    id: "pride_14", name: "Crown Guard", sin: "pride",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 2, duration: 2, targetMode: "self" }, { type: "damage", baseValue: 3, duration: 2, targetMode: "single" }],
    description: "Defend the crown",
  },
  {
    id: "pride_15", name: "Belittlement", sin: "pride",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 2, targetMode: "duo" }, { type: "affliction_amplify", baseValue: 1, duration: 1, targetMode: "duo" }],
    description: "Diminish two foes",
  },
  {
    id: "pride_16", name: "Regal Poise", sin: "pride",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 2, duration: 3, targetMode: "self" }, { type: "shield_gain", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "Grace under pressure",
  },
  {
    id: "pride_17", name: "Proclamation", sin: "pride",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "aoe" }],
    description: "Announce their doom",
  },
  {
    id: "pride_18", name: "Noble Bearing", sin: "pride",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 3, duration: 2, targetMode: "self" }],
    description: "Stand tall",
  },
  {
    id: "pride_19", name: "Throne of Thorns", sin: "pride",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 2, duration: 3, targetMode: "self" }],
    description: "Rule from a painful throne",
  },
  {
    id: "pride_20", name: "Divine Right", sin: "pride",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "single" }, { type: "heal_block", baseValue: 1, duration: 3, targetMode: "single" }],
    description: "Ordained to conquer",
  },
  {
    id: "pride_21", name: "Coronation", sin: "pride",
    cost: 4, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 3, duration: 3, targetMode: "self" }, { type: "heal_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "Crown yourself",
  },
  {
    id: "pride_22", name: "Judgment", sin: "pride",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "duo" }, { type: "affliction_amplify", baseValue: 1, duration: 1, targetMode: "duo" }],
    description: "Judge and punish two",
  },
  {
    id: "pride_23", name: "Narcissistic Fury", sin: "pride",
    cost: 3, tier: "rare", compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 3, duration: 2, targetMode: "single" }, { type: "damage", baseValue: 2, duration: 2, targetMode: "single" }],
    description: "Rage at being challenged",
  },
  {
    id: "pride_24", name: "Sovereign Shield", sin: "pride",
    cost: 2, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 3, duration: 3, targetMode: "self" }, { type: "shield_block", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "Only you deserve protection",
  },
  {
    id: "pride_25", name: "Humiliate", sin: "pride",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "aoe" }, { type: "energy_block", baseValue: 1, duration: 2, targetMode: "aoe" }],
    description: "Humiliate all challengers",
  },
  {
    id: "pride_26", name: "Exalted Strike", sin: "pride",
    cost: 4, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "Strike from on high",
  },
  {
    id: "pride_27", name: "Vainglory", sin: "pride",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 3, duration: 3, targetMode: "self" }, { type: "damage", baseValue: 2, duration: 2, targetMode: "single" }],
    description: "Bask in your own glory",
  },
  {
    id: "pride_28", name: "Royal Guard", sin: "pride",
    cost: 2, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 3, duration: 3, targetMode: "self" }],
    description: "Summon your guard",
  },
  {
    id: "pride_29", name: "Decree of Suffering", sin: "pride",
    cost: 4, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "aoe" }, { type: "heal_block", baseValue: 1, duration: 3, targetMode: "aoe" }],
    description: "Decree that none shall heal",
  },
  {
    id: "pride_30", name: "Majestic Wrath", sin: "pride",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "single" }],
    description: "Anger of a king",
  },
  {
    id: "pride_31", name: "Apotheosis", sin: "pride",
    cost: 5, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 4, duration: 4, targetMode: "self" }, { type: "heal_gain", baseValue: 3, duration: 3, targetMode: "self" }],
    description: "Ascend to godhood",
  },
  {
    id: "pride_32", name: "Divine Judgment", sin: "pride",
    cost: 6, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 2, duration: 1, targetMode: "aoe" }],
    description: "Judge all unworthy",
  },
  {
    id: "pride_33", name: "Throne Reclaimed", sin: "pride",
    cost: 5, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "single" }, { type: "shield_gain", baseValue: 3, duration: 3, targetMode: "self" }],
    description: "Reclaim what is rightfully yours",
  },
  {
    id: "pride_34", name: "Absolute Dominion", sin: "pride",
    cost: 5, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "duo" }, { type: "shield_block", baseValue: 2, duration: 3, targetMode: "duo" }, { type: "heal_block", baseValue: 2, duration: 3, targetMode: "duo" }],
    description: "Total control over two",
  },
  {
    id: "pride_35", name: "Narcissistic Nova", sin: "pride",
    cost: 6, tier: "epic", compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "aoe" }, { type: "shield_gain", baseValue: 3, duration: 3, targetMode: "self" }],
    description: "Blinding radiance",
  },
  {
    id: "pride_36", name: "Eternal Crown", sin: "pride",
    cost: 4, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 3, duration: 4, targetMode: "self" }, { type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 1, targetMode: "single" }],
    description: "A crown that never tarnishes",
  },
];

// ═══════════════════════════════════════════════════════════════
// LUST — 36 cards
// ═══════════════════════════════════════════════════════════════
export const LUST_CARDS: CardDefinition[] = [
  {
    id: "lust_01", name: "Allure", sin: "lust",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }],
    description: "Draw them in",
  },
  {
    id: "lust_02", name: "Seductive Whisper", sin: "lust",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }],
    description: "Words that wound",
  },
  {
    id: "lust_03", name: "Charm", sin: "lust",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "energy_block", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "Distract their focus",
  },
  {
    id: "lust_04", name: "Kiss of Thorns", sin: "lust",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 2, targetMode: "single" }, { type: "heal_steal", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "A kiss that drains",
  },
  {
    id: "lust_05", name: "Tempting Gaze", sin: "lust",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "shield_block", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "Your gaze weakens their resolve",
  },
  {
    id: "lust_06", name: "Heartbreak", sin: "lust",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }],
    description: "Shatter their heart",
  },
  {
    id: "lust_07", name: "Desire", sin: "lust",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }],
    description: "Burning desire",
  },
  {
    id: "lust_08", name: "Enchant", sin: "lust",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 2, duration: 1, targetMode: "single" }, { type: "damage", baseValue: 3, duration: 2, targetMode: "single" }],
    description: "Enchant and drain",
  },
  {
    id: "lust_09", name: "Forbidden Touch", sin: "lust",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "heal_gain", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "Touch that heals you",
  },
  {
    id: "lust_10", name: "Jealous Heart", sin: "lust",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 2, targetMode: "single" }, { type: "shield_steal", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "Take their protection",
  },
  {
    id: "lust_11", name: "Siren Song", sin: "lust",
    cost: 1, tier: "common", compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "single" }],
    description: "A song that never ends",
  },
  {
    id: "lust_12", name: "Passion Burst", sin: "lust",
    cost: 2, tier: "common", compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 3, duration: 2, targetMode: "single" }],
    description: "Brief but intense",
  },
  {
    id: "lust_13", name: "Entangle", sin: "lust",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "energy_block", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "Wrap them in desire",
  },
  {
    id: "lust_14", name: "Sweet Poison", sin: "lust",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "heal_block", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "Sweetness that kills",
  },
  {
    id: "lust_15", name: "Devotion", sin: "lust",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 2, duration: 3, targetMode: "self" }],
    description: "Devoted to self-preservation",
  },
  {
    id: "lust_16", name: "Infatuation", sin: "lust",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 2, targetMode: "single" }, { type: "heal_steal", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "Obsessive drain",
  },
  {
    id: "lust_17", name: "Thorn Whip", sin: "lust",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }],
    description: "Lash of desire",
  },
  {
    id: "lust_18", name: "Rose Shield", sin: "lust",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 2, duration: 2, targetMode: "self" }, { type: "damage", baseValue: 2, duration: 2, targetMode: "single" }],
    description: "Beauty is armor",
  },
  {
    id: "lust_19", name: "Obsession", sin: "lust",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "single" }, { type: "heal_steal", baseValue: 2, duration: 1, targetMode: "single" }],
    description: "Cannot stop thinking about you",
  },
  {
    id: "lust_20", name: "Succubus Kiss", sin: "lust",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 3, duration: 1, targetMode: "single" }, { type: "damage", baseValue: 2, duration: 3, targetMode: "single" }],
    description: "A kiss that steals life",
  },
  {
    id: "lust_21", name: "Heartstring Pull", sin: "lust",
    cost: 2, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "Tug at their heartstrings",
  },
  {
    id: "lust_22", name: "Crimson Embrace", sin: "lust",
    cost: 4, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "heal_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "Embrace that drains",
  },
  {
    id: "lust_23", name: "Aphrodite Shield", sin: "lust",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 3, duration: 3, targetMode: "self" }, { type: "heal_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "Divine protection",
  },
  {
    id: "lust_24", name: "Desire Cascade", sin: "lust",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "Desire compounds",
  },
  {
    id: "lust_25", name: "Love Poison", sin: "lust",
    cost: 2, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "single" }, { type: "heal_block", baseValue: 2, duration: 3, targetMode: "single" }],
    description: "Love that prevents recovery",
  },
  {
    id: "lust_26", name: "Enchantress", sin: "lust",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "shield_block", baseValue: 1, duration: 3, targetMode: "single" }],
    description: "Enchant and destroy",
  },
  {
    id: "lust_27", name: "Passionate Fury", sin: "lust",
    cost: 4, tier: "rare", compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "single" }],
    description: "Passion unleashed",
  },
  {
    id: "lust_28", name: "Blood Rose", sin: "lust",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "heal_steal", baseValue: 2, duration: 1, targetMode: "single" }],
    description: "Beautiful and deadly",
  },
  {
    id: "lust_29", name: "Mesmerize", sin: "lust",
    cost: 2, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "duo" }],
    description: "Captivate two targets",
  },
  {
    id: "lust_30", name: "Thorn Cage", sin: "lust",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "Trap them in thorns",
  },
  {
    id: "lust_31", name: "Fatal Attraction", sin: "lust",
    cost: 4, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "heal_steal", baseValue: 3, duration: 1, targetMode: "single" }, { type: "shield_steal", baseValue: 2, duration: 1, targetMode: "single" }],
    description: "Irresistible and deadly",
  },
  {
    id: "lust_32", name: "Eternal Desire", sin: "lust",
    cost: 5, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "single" }],
    description: "Desire that never ends",
  },
  {
    id: "lust_33", name: "Aphrodite Wrath", sin: "lust",
    cost: 4, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "duo" }, { type: "heal_steal", baseValue: 2, duration: 1, targetMode: "duo" }],
    description: "Even gods have fury",
  },
  {
    id: "lust_34", name: "Soul Drain", sin: "lust",
    cost: 5, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "heal_gain", baseValue: 3, duration: 3, targetMode: "self" }, { type: "heal_block", baseValue: 2, duration: 3, targetMode: "single" }],
    description: "Drain their very soul",
  },
  {
    id: "lust_35", name: "Crimson Tempest", sin: "lust",
    cost: 5, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "aoe" }, { type: "heal_steal", baseValue: 2, duration: 1, targetMode: "aoe" }],
    description: "Storm of desire",
  },
  {
    id: "lust_36", name: "Absolute Seduction", sin: "lust",
    cost: 4, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 2, duration: 1, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 1, targetMode: "single" }],
    description: "Complete surrender",
  },
];

// ═══════════════════════════════════════════════════════════════
// GLUTTONY — 36 cards
// ═══════════════════════════════════════════════════════════════
export const GLUTTONY_CARDS: CardDefinition[] = [
  {
    id: "gluttony_01", name: "Nibble", sin: "gluttony",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 1, duration: 3, targetMode: "aoe" }],
    description: "A small bite from everyone",
  },
  {
    id: "gluttony_02", name: "Gorge", sin: "gluttony",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "aoe" }, { type: "heal_gain", baseValue: 1, duration: 2, targetMode: "self" }],
    description: "Eat and grow stronger",
  },
  {
    id: "gluttony_03", name: "Acid Spit", sin: "gluttony",
    cost: 1, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 2, targetMode: "aoe" }],
    description: "Spray acid on all",
  },
  {
    id: "gluttony_04", name: "Hunger Pang", sin: "gluttony",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 2, targetMode: "single" }, { type: "self_damage", baseValue: 1, duration: 1, targetMode: "self" }],
    description: "Hunger hurts you too",
  },
  {
    id: "gluttony_05", name: "Feast", sin: "gluttony",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 2, duration: 1, targetMode: "aoe" }],
    description: "Feast on everyone",
  },
  {
    id: "gluttony_06", name: "Bloat", sin: "gluttony",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 2, duration: 2, targetMode: "self" }, { type: "self_damage", baseValue: 1, duration: 1, targetMode: "self" }],
    description: "Bloated but protected",
  },
  {
    id: "gluttony_07", name: "Consume", sin: "gluttony",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "aoe" }, { type: "self_damage", baseValue: 1, duration: 1, targetMode: "self" }],
    description: "Consume everything",
  },
  {
    id: "gluttony_08", name: "Ravenous Bite", sin: "gluttony",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 2, targetMode: "single" }, { type: "heal_steal", baseValue: 1, duration: 1, targetMode: "single" }],
    description: "A hungry bite",
  },
  {
    id: "gluttony_09", name: "Belch", sin: "gluttony",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 1, duration: 2, targetMode: "aoe" }],
    description: "Toxic gas hits all",
  },
  {
    id: "gluttony_10", name: "Insatiable", sin: "gluttony",
    cost: 1, tier: "common", compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 1, duration: 4, targetMode: "aoe" }],
    description: "Hunger that never ends",
  },
  {
    id: "gluttony_11", name: "Devour Shield", sin: "gluttony",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "shield_steal", baseValue: 2, duration: 1, targetMode: "aoe" }],
    description: "Eat their defenses",
  },
  {
    id: "gluttony_12", name: "Stomach Acid", sin: "gluttony",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 1, duration: 3, targetMode: "single" }, { type: "heal_block", baseValue: 1, duration: 2, targetMode: "single" }],
    description: "Acid that prevents healing",
  },
  {
    id: "gluttony_13", name: "Overeat", sin: "gluttony",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 2, duration: 3, targetMode: "self" }, { type: "self_damage", baseValue: 2, duration: 1, targetMode: "self" }],
    description: "Eat too much",
  },
  {
    id: "gluttony_14", name: "Swallow Whole", sin: "gluttony",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 1, duration: 3, targetMode: "single" }],
    description: "One big gulp",
  },
  {
    id: "gluttony_15", name: "Toxic Waste", sin: "gluttony",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 1, duration: 3, targetMode: "aoe" }, { type: "self_damage", baseValue: 1, duration: 1, targetMode: "self" }],
    description: "Spew toxins everywhere",
  },
  {
    id: "gluttony_16", name: "Hunger Strike", sin: "gluttony",
    cost: 0, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 1, duration: 3, targetMode: "single" }],
    description: "Desperate hunger",
  },
  {
    id: "gluttony_17", name: "Gluttonous Guard", sin: "gluttony",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 2, duration: 3, targetMode: "self" }],
    description: "Fat is armor",
  },
  {
    id: "gluttony_18", name: "Bile Spray", sin: "gluttony",
    cost: 2, tier: "common", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "aoe" }, { type: "self_damage", baseValue: 2, duration: 1, targetMode: "self" }],
    description: "Spray bile on everyone",
  },
  {
    id: "gluttony_19", name: "Feeding Frenzy", sin: "gluttony",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "aoe" }, { type: "self_damage", baseValue: 2, duration: 1, targetMode: "self" }],
    description: "Uncontrollable hunger",
  },
  {
    id: "gluttony_20", name: "Digest", sin: "gluttony",
    cost: 2, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "heal_gain", baseValue: 3, duration: 3, targetMode: "self" }, { type: "shield_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "Process what you consumed",
  },
  {
    id: "gluttony_21", name: "Engulf", sin: "gluttony",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "aoe" }, { type: "self_damage", baseValue: 3, duration: 1, targetMode: "self" }],
    description: "Engulf everything",
  },
  {
    id: "gluttony_22", name: "Absorb", sin: "gluttony",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 2, duration: 1, targetMode: "aoe" }, { type: "damage", baseValue: 1, duration: 3, targetMode: "aoe" }],
    description: "Absorb life from all",
  },
  {
    id: "gluttony_23", name: "Corpulent Shield", sin: "gluttony",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "shield_gain", baseValue: 3, duration: 3, targetMode: "self" }, { type: "damage", baseValue: 2, duration: 2, targetMode: "single" }],
    description: "Massive bulk protects",
  },
  {
    id: "gluttony_24", name: "Acid Rain", sin: "gluttony",
    cost: 4, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "aoe" }, { type: "heal_block", baseValue: 1, duration: 3, targetMode: "aoe" }],
    description: "Acid falls on everyone",
  },
  {
    id: "gluttony_25", name: "Consume Essence", sin: "gluttony",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "energy_steal", baseValue: 1, duration: 1, targetMode: "aoe" }, { type: "damage", baseValue: 1, duration: 3, targetMode: "aoe" }],
    description: "Drain energy from all",
  },
  {
    id: "gluttony_26", name: "Vomit", sin: "gluttony",
    cost: 2, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "duo" }, { type: "self_damage", baseValue: 2, duration: 1, targetMode: "self" }],
    description: "Expel violently",
  },
  {
    id: "gluttony_27", name: "Bottomless Pit", sin: "gluttony",
    cost: 4, tier: "rare", compoundPattern: "slowburn",
    effects: [{ type: "damage", baseValue: 2, duration: 4, targetMode: "aoe" }, { type: "self_damage", baseValue: 3, duration: 1, targetMode: "self" }],
    description: "A hunger without end",
  },
  {
    id: "gluttony_28", name: "Gluttonous Rage", sin: "gluttony",
    cost: 3, tier: "rare", compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 2, duration: 2, targetMode: "aoe" }, { type: "self_damage", baseValue: 2, duration: 1, targetMode: "self" }],
    description: "Explosive hunger",
  },
  {
    id: "gluttony_29", name: "Feast of Souls", sin: "gluttony",
    cost: 3, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "aoe" }, { type: "heal_gain", baseValue: 2, duration: 2, targetMode: "self" }],
    description: "Feed on their essence",
  },
  {
    id: "gluttony_30", name: "Crushing Maw", sin: "gluttony",
    cost: 4, tier: "rare", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 2, duration: 1, targetMode: "single" }],
    description: "Jaws that crush everything",
  },
  {
    id: "gluttony_31", name: "World Eater", sin: "gluttony",
    cost: 5, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "aoe" }, { type: "heal_steal", baseValue: 2, duration: 1, targetMode: "aoe" }, { type: "self_damage", baseValue: 4, duration: 1, targetMode: "self" }],
    description: "Devour the world",
  },
  {
    id: "gluttony_32", name: "Singularity", sin: "gluttony",
    cost: 6, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "aoe" }, { type: "self_damage", baseValue: 5, duration: 1, targetMode: "self" }],
    description: "A black hole of hunger",
  },
  {
    id: "gluttony_33", name: "Eternal Feast", sin: "gluttony",
    cost: 5, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 4, targetMode: "aoe" }, { type: "heal_gain", baseValue: 2, duration: 3, targetMode: "self" }, { type: "self_damage", baseValue: 3, duration: 1, targetMode: "self" }],
    description: "A feast that never ends",
  },
  {
    id: "gluttony_34", name: "Consume All", sin: "gluttony",
    cost: 5, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "heal_steal", baseValue: 3, duration: 1, targetMode: "aoe" }, { type: "shield_steal", baseValue: 3, duration: 1, targetMode: "aoe" }, { type: "energy_steal", baseValue: 2, duration: 1, targetMode: "aoe" }],
    description: "Take everything from everyone",
  },
  {
    id: "gluttony_35", name: "Apocalypse Maw", sin: "gluttony",
    cost: 6, tier: "epic", compoundPattern: "aggressive",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "aoe" }, { type: "self_damage", baseValue: 5, duration: 1, targetMode: "self" }],
    description: "Jaws of the apocalypse",
  },
  {
    id: "gluttony_36", name: "Oblivion Feast", sin: "gluttony",
    cost: 4, tier: "epic", compoundPattern: "standard",
    effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "aoe" }, { type: "shield_gain", baseValue: 3, duration: 3, targetMode: "self" }, { type: "self_damage", baseValue: 4, duration: 1, targetMode: "self" }],
    description: "Feast until nothing remains",
  },
];

// ═══════════════════════════════════════════════════════════════
// Deck Registry & Helpers
// ═══════════════════════════════════════════════════════════════

export const ALL_DECKS: Record<SinType, CardDefinition[]> = {
  wrath: WRATH_CARDS,
  sloth: SLOTH_CARDS,
  greed: GREED_CARDS,
  envy: ENVY_CARDS,
  pride: PRIDE_CARDS,
  lust: LUST_CARDS,
  gluttony: GLUTTONY_CARDS,
};

/** Get all card IDs for a given sin faction */
export function getDeckForSin(sin: SinType): string[] {
  const deck = ALL_DECKS[sin];
  if (!deck) throw new Error(`Unknown sin: ${sin}`);
  return deck.map((c) => c.id);
}

/** Get a card definition by ID */
export function getCardById(id: string): CardDefinition | undefined {
  for (const deck of Object.values(ALL_DECKS)) {
    const card = deck.find((c) => c.id === id);
    if (card) return card;
  }
  return undefined;
}

/** Get all cards across all factions */
export function getAllCards(): CardDefinition[] {
  return Object.values(ALL_DECKS).flat();
}

// ═══════════════════════════════════════════════════════════════
// CARD_MAP — Fast lookup by card ID
// ═══════════════════════════════════════════════════════════════
export const ALL_CARDS: CardDefinition[] = [
  ...WRATH_CARDS, ...SLOTH_CARDS, ...GREED_CARDS, ...ENVY_CARDS,
  ...PRIDE_CARDS, ...LUST_CARDS, ...GLUTTONY_CARDS,
];

export const CARD_MAP: Record<string, CardDefinition> = {};
ALL_CARDS.forEach((card) => {
  CARD_MAP[card.id] = card;
});

// ═══════════════════════════════════════════════════════════════
// NARRATOR LINES (Maximum Sass & Cynicism)
// ═══════════════════════════════════════════════════════════════
export const NARRATOR_LINES = {
  gameStart: [
    "Oh wonderful, another batch of sinners. Try not to embarrass yourselves.",
    "Welcome to the arena, where your poor life choices become entertainment.",
    "Four players enter. One survives. The rest get therapy bills.",
    "Let the sin-fueled chaos begin. I'll be here, judging. Not silently.",
    "Another game? You'd think you people would learn. But no.",
    "The arena opens its maw. Step inside, you beautiful disasters.",
    "Welcome back. Your persistence is either admirable or pathological.",
  ],
  roundStart: [
    "Round {round}. The compound effects are ticking. Can you feel it?",
    "Round {round}. Those Fibonacci multipliers don't care about your feelings.",
    "Round {round}. Tick... tick... the escalation continues.",
    "Round {round} begins. Your compound cards are doing the heavy lifting.",
    "Round {round}. Compound cards hit forever. Choose wisely.",
    "Round {round}. The escalation continues. Just like your bad decisions.",
    "Round {round}. More corruption flows. Spend it wisely. Or don't. I'm not your accountant.",
  ],
  playerEliminated: [
    "{player} has been eliminated. Don't let the door hit you on the way out.",
    "And {player} is DEAD. Another one bites the metaphorical dust.",
    "{player} is gone. Reduced to a spectator. How embarrassing for them.",
    "RIP {player}. Your sin wasn't strong enough. Tragic, really.",
    "{player} has left the mortal coil. The remaining sinners barely noticed.",
    "{player} is out. Their contribution to this game will not be remembered.",
    "And just like that, {player} becomes a cautionary tale.",
  ],
  gameEnd: [
    "{winner} wins! Was it skill? Luck? Probably just everyone else being worse.",
    "Congratulations, {winner}. You're the best at being the worst. Truly inspiring.",
    "{winner} stands victorious! The crowd goes mild!",
    "And the crown of sin goes to {winner}. Try not to let it go to your head.",
    "{winner} wins! Achievement unlocked: 'Slightly Less Terrible Than Everyone Else.'",
    "{winner} survives! Not through merit, mind you. Through everyone else's incompetence.",
  ],
  pass: [
    "{player} passes. Riveting gameplay. Truly edge-of-your-seat stuff.",
    "{player} does nothing. Groundbreaking strategy.",
    "A pass from {player}. The coward's choice, but a valid one.",
    "{player} passes their turn. Even the cards are disappointed.",
    "{player} chooses inaction. Sloth would be proud. Wrath? Not so much.",
    "{player} passes. The audience yawns. So do I.",
    "{player} decides to do absolutely nothing. Inspiring.",
  ],
  botThinking: [
    "The bot is 'thinking.' It's literally random numbers, but sure.",
    "Processing... beep boop... pretending to strategize...",
    "The AI contemplates its next move. (It's a coin flip. Don't tell anyone.)",
    "Bot brain engaged. Results may vary. Mostly toward chaos.",
    "The bot stares into the void. The void stares back. It plays a card.",
    "Artificial intelligence making artificial decisions. How poetic.",
    "The bot calculates. It has no feelings about this. Lucky it.",
  ],
  lowHp: [
    "{player} is looking rough. One good hit and it's curtains.",
    "{player}'s HP is embarrassingly low. Might want to do something about that.",
    "Someone get {player} a medic. Or a priest. Probably a priest.",
    "{player} is clinging to life like it's a personality trait.",
    "{player}'s HP bar is giving 'check engine light' energy.",
  ],
  highDamage: [
    "MASSIVE hit! That's going to leave a crater, not just a mark.",
    "The compound payoff just hit. That escalation is no joke.",
    "That hit was so hard, the other players felt it too.",
    "Overkill? Never heard of it. That damage was *chef's kiss*.",
    "The Fibonacci mechanic was a mistake. A beautiful, violent mistake.",
  ],
  cardPlayed: [
    "{player} plays {card}. Bold move for someone with that HP.",
    "{player} slaps down {card}. The audacity is almost admirable.",
    "{card} hits the field. {player} chose violence today.",
    "{player} plays {card}. Somewhere, a game designer weeps.",
    "Oh look, {player} remembered they have cards. {card} it is.",
    "{player} drops {card} like it's hot. It is. Metaphorically.",
    "{card} enters the arena. {player}'s opponents enter the denial stage.",
  ],
  shieldUp: [
    "A shield? In THIS economy? How defensive of you.",
    "Hiding behind a shield. Very brave. Very original.",
    "Shield activated. Because actually fighting is too mainstream.",
  ],
  healUsed: [
    "Healing? That's just procrastinating death with extra steps.",
    "A heal card. Delaying the inevitable with style.",
    "Patching yourself up. The duct tape of combat strategies.",
  ],
  noEnergy: [
    "Not enough corruption to play that. Even sin has a budget.",
    "Insufficient corruption. Your ambitions exceed your resources. Story of your life.",
    "Can't afford that card. Corruption doesn't grow on trees. Well, actually...",
  ],
  shieldAbsorbed: [
    "Shield absorbed the hit! That's what shields DO, people.",
    "Damage blocked by shield. Defense actually working? Shocking.",
    "The shield takes the blow. Your HP thanks you for the foresight.",
    "Absorbed! That shield earned its keep today.",
  ],
  compoundingTick: [
    "Tick... tick... the compound effect grows. {value} this round.",
    "Fibonacci says hello. {value} damage this tick.",
    "The compound effect ticks for {value}. Patience pays off. Violently.",
    "Round {tick} of the compound. The escalation is real.",
  ],
  round16Doubling: [
    "ROUND 16. All afflictions DOUBLE. The endgame begins.",
    "The doubling threshold hits. Every affliction just got twice as nasty.",
    "Round 16: affliction doubling activated. Hope you weren't relying on surviving.",
    "DOUBLED. Every tick, every burn, every drain. Twice as painful now.",
  ],
  passiveTrigger: [
    "{player}'s {passive} passive activates! {effect}",
    "Passive ability: {passive}. {player} gets a little extra something.",
    "{passive} kicks in for {player}. Sin has its perks.",
  ],
};
