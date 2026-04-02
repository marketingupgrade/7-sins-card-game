var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/cardData.ts
var cardData_exports = {};
__export(cardData_exports, {
  ALL_CARDS: () => ALL_CARDS,
  ALL_DECKS: () => ALL_DECKS,
  CARD_MAP: () => CARD_MAP,
  ENVY_CARDS: () => ENVY_CARDS,
  GLUTTONY_CARDS: () => GLUTTONY_CARDS,
  GREED_CARDS: () => GREED_CARDS,
  LUST_CARDS: () => LUST_CARDS,
  NARRATOR_LINES: () => NARRATOR_LINES,
  PRIDE_CARDS: () => PRIDE_CARDS,
  SLOTH_CARDS: () => SLOTH_CARDS,
  WRATH_CARDS: () => WRATH_CARDS,
  getAllCards: () => getAllCards,
  getCardById: () => getCardById,
  getDeckForSin: () => getDeckForSin
});
function getDeckForSin(sin) {
  const deck = ALL_DECKS[sin];
  if (!deck) throw new Error(`Unknown sin: ${sin}`);
  return deck.map((c) => c.id);
}
function getCardById(id) {
  for (const deck of Object.values(ALL_DECKS)) {
    const card = deck.find((c) => c.id === id);
    if (card) return card;
  }
  return void 0;
}
function getAllCards() {
  return Object.values(ALL_DECKS).flat();
}
var WRATH_CARDS, SLOTH_CARDS, GREED_CARDS, ENVY_CARDS, PRIDE_CARDS, LUST_CARDS, GLUTTONY_CARDS, ALL_DECKS, ALL_CARDS, CARD_MAP, NARRATOR_LINES;
var init_cardData = __esm({
  "shared/cardData.ts"() {
    "use strict";
    WRATH_CARDS = [
      {
        id: "wrath_01",
        name: "Fury Swipe",
        sin: "wrath",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 13, duration: 3, targetMode: "single" }],
        description: "A common wrath card"
      },
      {
        id: "wrath_02",
        name: "Burning Fists",
        sin: "wrath",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 11, duration: 3, targetMode: "single" }, { type: "self_damage", baseValue: 4, duration: 2, targetMode: "self" }],
        description: "A common wrath card"
      },
      {
        id: "wrath_03",
        name: "Rage Pulse",
        sin: "wrath",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }],
        description: "A common wrath card"
      },
      {
        id: "wrath_04",
        name: "Blood Offering",
        sin: "wrath",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "self_damage", baseValue: 7, duration: 2, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }],
        description: "A common wrath card"
      },
      {
        id: "wrath_05",
        name: "Ember Slash",
        sin: "wrath",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 12, duration: 2, targetMode: "single" }],
        description: "A common wrath card"
      },
      {
        id: "wrath_06",
        name: "Searing Touch",
        sin: "wrath",
        cost: 0,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 9, duration: 4, targetMode: "single" }],
        description: "A common wrath card"
      },
      {
        id: "wrath_07",
        name: "Wrathful Cry",
        sin: "wrath",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 9, duration: 3, targetMode: "aoe" }],
        description: "A common wrath card"
      },
      {
        id: "wrath_08",
        name: "Scorch Mark",
        sin: "wrath",
        cost: 1,
        tier: "common",
        compoundPattern: "aggressive",
        effects: [{ type: "damage", baseValue: 5, duration: 3, targetMode: "single" }],
        description: "A common wrath card"
      },
      {
        id: "wrath_09",
        name: "Flame Jab",
        sin: "wrath",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 5, duration: 2, targetMode: "single" }, { type: "draw_boost", baseValue: 1, duration: 1, targetMode: "self" }],
        description: "A common wrath card"
      },
      {
        id: "wrath_10",
        name: "Provoke",
        sin: "wrath",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 2, targetMode: "single" }, { type: "shield_gain", baseValue: 9, duration: 2, targetMode: "self" }],
        description: "A common wrath card"
      },
      {
        id: "wrath_11",
        name: "Reckless Charge",
        sin: "wrath",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 16, duration: 3, targetMode: "single" }, { type: "self_damage", baseValue: 5, duration: 2, targetMode: "self" }],
        description: "A common wrath card"
      },
      {
        id: "wrath_12",
        name: "Smoldering Rage",
        sin: "wrath",
        cost: 1,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 7, duration: 5, targetMode: "single" }],
        description: "A common wrath card"
      },
      {
        id: "wrath_13",
        name: "Firebrand",
        sin: "wrath",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 13, duration: 3, targetMode: "duo" }],
        description: "A common wrath card"
      },
      {
        id: "wrath_14",
        name: "Ignite",
        sin: "wrath",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 5, duration: 3, targetMode: "single" }],
        description: "A common wrath card"
      },
      {
        id: "wrath_15",
        name: "Temper Flare",
        sin: "wrath",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }, { type: "damage", baseValue: 9, duration: 2, targetMode: "single" }],
        description: "A common wrath card"
      },
      {
        id: "wrath_16",
        name: "Bloodlust",
        sin: "wrath",
        cost: 1,
        tier: "common",
        compoundPattern: "aggressive",
        effects: [{ type: "damage", baseValue: 7, duration: 2, targetMode: "single" }, { type: "self_damage", baseValue: 4, duration: 1, targetMode: "self" }],
        description: "A common wrath card"
      },
      {
        id: "wrath_17",
        name: "Cauterize",
        sin: "wrath",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "self_damage", baseValue: 5, duration: 2, targetMode: "self" }, { type: "heal_gain", baseValue: 16, duration: 3, targetMode: "self" }],
        description: "A common wrath card"
      },
      {
        id: "wrath_18",
        name: "War Cry",
        sin: "wrath",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 11, duration: 3, targetMode: "aoe" }],
        description: "A common wrath card"
      },
      {
        id: "wrath_19",
        name: "Kindle",
        sin: "wrath",
        cost: 0,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 5, duration: 4, targetMode: "single" }],
        description: "A common wrath card"
      },
      {
        id: "wrath_20",
        name: "Fury Spike",
        sin: "wrath",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 12, duration: 3, targetMode: "single" }],
        description: "A common wrath card"
      },
      {
        id: "wrath_21",
        name: "Berserker Rage",
        sin: "wrath",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 21, duration: 3, targetMode: "single" }, { type: "self_damage", baseValue: 7, duration: 2, targetMode: "self" }, { type: "shield_gain", baseValue: 16, duration: 2, targetMode: "self" }],
        description: "A rare wrath card"
      },
      {
        id: "wrath_22",
        name: "Inferno Wave",
        sin: "wrath",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 13, duration: 3, targetMode: "aoe" }, { type: "self_damage", baseValue: 5, duration: 2, targetMode: "self" }],
        description: "A rare wrath card"
      },
      {
        id: "wrath_23",
        name: "Blood Pact",
        sin: "wrath",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "self_damage", baseValue: 9, duration: 3, targetMode: "self" }, { type: "damage", baseValue: 24, duration: 3, targetMode: "single" }],
        description: "A rare wrath card"
      },
      {
        id: "wrath_24",
        name: "Volcanic Eruption",
        sin: "wrath",
        cost: 4,
        tier: "rare",
        compoundPattern: "aggressive",
        effects: [{ type: "damage", baseValue: 11, duration: 3, targetMode: "aoe" }, { type: "self_damage", baseValue: 7, duration: 2, targetMode: "self" }],
        description: "A rare wrath card"
      },
      {
        id: "wrath_25",
        name: "Retribution",
        sin: "wrath",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 16, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 19, duration: 3, targetMode: "self" }],
        description: "A rare wrath card"
      },
      {
        id: "wrath_26",
        name: "Immolation",
        sin: "wrath",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "self_damage", baseValue: 11, duration: 3, targetMode: "self" }, { type: "damage", baseValue: 13, duration: 3, targetMode: "aoe" }],
        description: "A rare wrath card"
      },
      {
        id: "wrath_27",
        name: "Wrath Unleashed",
        sin: "wrath",
        cost: 3,
        tier: "rare",
        compoundPattern: "aggressive",
        effects: [{ type: "damage", baseValue: 13, duration: 3, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A rare wrath card"
      },
      {
        id: "wrath_28",
        name: "Scorched Earth",
        sin: "wrath",
        cost: 4,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 14, duration: 3, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A rare wrath card"
      },
      {
        id: "wrath_29",
        name: "Fury Storm",
        sin: "wrath",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 16, duration: 4, targetMode: "duo" }, { type: "self_damage", baseValue: 5, duration: 2, targetMode: "self" }],
        description: "A rare wrath card"
      },
      {
        id: "wrath_30",
        name: "Berserk Slash",
        sin: "wrath",
        cost: 2,
        tier: "rare",
        compoundPattern: "aggressive",
        effects: [{ type: "damage", baseValue: 12, duration: 3, targetMode: "single" }, { type: "self_damage", baseValue: 9, duration: 2, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A rare wrath card"
      },
      {
        id: "wrath_31",
        name: "Magma Surge",
        sin: "wrath",
        cost: 3,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 11, duration: 5, targetMode: "duo" }, { type: "shield_gain", baseValue: 12, duration: 2, targetMode: "self" }],
        description: "A rare wrath card"
      },
      {
        id: "wrath_32",
        name: "Burning Vengeance",
        sin: "wrath",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 14, duration: 3, targetMode: "single" }, { type: "heal_gain", baseValue: 12, duration: 2, targetMode: "self" }],
        description: "A rare wrath card"
      },
      {
        id: "wrath_33",
        name: "Firestorm",
        sin: "wrath",
        cost: 4,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 12, duration: 3, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A rare wrath card"
      },
      {
        id: "wrath_34",
        name: "Rage Incarnate",
        sin: "wrath",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 19, duration: 4, targetMode: "single" }, { type: "self_damage", baseValue: 7, duration: 3, targetMode: "self" }],
        description: "A rare wrath card"
      },
      {
        id: "wrath_35",
        name: "Flame Barrier",
        sin: "wrath",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 23, duration: 3, targetMode: "self" }, { type: "damage", baseValue: 9, duration: 2, targetMode: "single" }],
        description: "A rare wrath card"
      },
      {
        id: "wrath_36",
        name: "Pyroclasm",
        sin: "wrath",
        cost: 3,
        tier: "rare",
        compoundPattern: "aggressive",
        effects: [{ type: "damage", baseValue: 9, duration: 3, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 5, duration: 2, targetMode: "single" }],
        description: "A rare wrath card"
      },
      {
        id: "wrath_37",
        name: "Molten Core",
        sin: "wrath",
        cost: 2,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "self_damage", baseValue: 5, duration: 4, targetMode: "self" }, { type: "damage", baseValue: 12, duration: 4, targetMode: "single" }, { type: "shield_gain", baseValue: 9, duration: 3, targetMode: "self" }],
        description: "The molten core within erupts, burning all in its path"
      },
      {
        id: "wrath_38",
        name: "Hellfire Rush",
        sin: "wrath",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 14, duration: 3, targetMode: "duo" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A hellfire rush that scorches two foes at once"
      },
      {
        id: "wrath_39",
        name: "Apocalypse Fist",
        sin: "wrath",
        cost: 5,
        tier: "epic",
        compoundPattern: "aggressive",
        effects: [{ type: "damage", baseValue: 16, duration: 3, targetMode: "aoe" }, { type: "self_damage", baseValue: 11, duration: 2, targetMode: "self" }, { type: "affliction_amplify", baseValue: 7, duration: 2, targetMode: "aoe" }],
        description: "An apocalyptic fist that shatters everything"
      },
      {
        id: "wrath_40",
        name: "Ragnarok",
        sin: "wrath",
        cost: 6,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 24, duration: 4, targetMode: "aoe" }, { type: "self_damage", baseValue: 9, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "aoe" }],
        description: "Volcanic eruption of pure concentrated rage"
      },
      {
        id: "wrath_41",
        name: "Phoenix Rebirth",
        sin: "wrath",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "self_damage", baseValue: 13, duration: 2, targetMode: "self" }, { type: "heal_gain", baseValue: 37, duration: 4, targetMode: "self" }, { type: "damage", baseValue: 21, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 19, duration: 2, targetMode: "self" }],
        description: "The berserker's final gambit \u2014 all or nothing"
      },
      {
        id: "wrath_42",
        name: "Supernova",
        sin: "wrath",
        cost: 6,
        tier: "epic",
        compoundPattern: "aggressive",
        effects: [{ type: "damage", baseValue: 13, duration: 3, targetMode: "aoe" }, { type: "self_damage", baseValue: 9, duration: 2, targetMode: "self" }, { type: "shield_steal", baseValue: 12, duration: 2, targetMode: "aoe" }],
        description: "Fury made manifest, tearing through defenses"
      },
      {
        id: "wrath_43",
        name: "Blood Nova",
        sin: "wrath",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 21, duration: 4, targetMode: "duo" }, { type: "self_damage", baseValue: 11, duration: 3, targetMode: "self" }, { type: "heal_gain", baseValue: 23, duration: 3, targetMode: "self" }],
        description: "A storm of blades fueled by bottomless anger"
      },
      {
        id: "wrath_44",
        name: "Infernal Judgment",
        sin: "wrath",
        cost: 4,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 19, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 9, duration: 2, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "Wrath's echo reverberates through every wound"
      },
      {
        id: "wrath_45",
        name: "Cataclysm",
        sin: "wrath",
        cost: 5,
        tier: "epic",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 13, duration: 5, targetMode: "aoe" }, { type: "self_damage", baseValue: 7, duration: 3, targetMode: "self" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "aoe" }],
        description: "The inferno within consumes friend and foe alike"
      },
      {
        id: "wrath_46",
        name: "Wrath of God",
        sin: "wrath",
        cost: 6,
        tier: "epic",
        compoundPattern: "aggressive",
        effects: [{ type: "damage", baseValue: 21, duration: 3, targetMode: "aoe" }, { type: "self_damage", baseValue: 12, duration: 2, targetMode: "self" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }],
        description: "A cataclysmic strike born from suffering"
      },
      {
        id: "wrath_47",
        name: "Hellstorm",
        sin: "wrath",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 16, duration: 4, targetMode: "aoe" }, { type: "shield_gain", baseValue: 23, duration: 3, targetMode: "self" }, { type: "self_damage", baseValue: 9, duration: 3, targetMode: "self" }],
        description: "Rage crystallized into devastating force"
      },
      {
        id: "wrath_48",
        name: "Undying Fury",
        sin: "wrath",
        cost: 4,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 22, duration: 3, targetMode: "single" }, { type: "self_damage", baseValue: 9, duration: 2, targetMode: "self" }, { type: "heal_gain", baseValue: 19, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "The fury of a thousand battles compressed into one blow"
      },
      {
        id: "wrath_49",
        name: "Armageddon",
        sin: "wrath",
        cost: 6,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 19, duration: 4, targetMode: "aoe" }, { type: "self_damage", baseValue: 11, duration: 3, targetMode: "self" }, { type: "affliction_amplify", baseValue: 5, duration: 3, targetMode: "aoe" }, { type: "discard_burn", baseValue: 2, duration: 2, targetMode: "aoe" }],
        description: "Unstoppable momentum fueled by pure hatred"
      },
      {
        id: "wrath_50",
        name: "Last Stand",
        sin: "wrath",
        cost: 4,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "self_damage", baseValue: 13, duration: 2, targetMode: "self" }, { type: "damage", baseValue: 26, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 28, duration: 2, targetMode: "self" }],
        description: "The final expression of wrath \u2014 total annihilation"
      },
      // ── Skip-Queue (Priority) Cards ──
      {
        id: "wrath_51",
        name: "Flash Rage",
        sin: "wrath",
        cost: 1,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 9, duration: 2, targetMode: "single" }],
        description: "Strike before they see it coming \u2014 pure fury, no delay.",
        skipQueue: true
      },
      {
        id: "wrath_52",
        name: "Retribution Spike",
        sin: "wrath",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 12, duration: 2, targetMode: "single" }, { type: "self_damage", baseValue: 5, duration: 1, targetMode: "self" }],
        description: "Pain dealt before pain received. The wrathful always strike first.",
        skipQueue: true
      },
      {
        id: "wrath_53",
        name: "Berserker's Reflex",
        sin: "wrath",
        cost: 0,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 5, duration: 2, targetMode: "single" }],
        description: "Instinct, not thought. The body moves before the mind.",
        skipQueue: true
      },
      {
        id: "wrath_54",
        name: "Preemptive Fury",
        sin: "wrath",
        cost: 1,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 2, targetMode: "single" }, { type: "shield_gain", baseValue: 7, duration: 2, targetMode: "self" }],
        description: "Attack is the best defense \u2014 but a little armor doesn't hurt.",
        skipQueue: true
      },
      {
        id: "wrath_55",
        name: "Smolder",
        sin: "wrath",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 6, duration: 3, targetMode: "single" }],
        description: "A slow burn that never stops."
      },
      {
        id: "wrath_56",
        name: "Spite Spark",
        sin: "wrath",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 2, targetMode: "single" }, { type: "shield_gain", baseValue: 4, duration: 2, targetMode: "self" }],
        description: "Fury forges its own armor."
      },
      {
        id: "wrath_57",
        name: "Temper Flare",
        sin: "wrath",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 8, duration: 2, targetMode: "single" }],
        description: "Quick and vicious."
      },
      {
        id: "wrath_58",
        name: "Ash Breath",
        sin: "wrath",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "aoe" }],
        description: "Everyone chokes."
      },
      {
        id: "wrath_59",
        name: "Grudge",
        sin: "wrath",
        cost: 0,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 6, duration: 4, targetMode: "single" }],
        description: "Wrath remembers."
      },
      {
        id: "wrath_60",
        name: "Scorch Mark",
        sin: "wrath",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 5, duration: 2, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 1, targetMode: "self" }],
        description: "Pain fuels the fire."
      }
    ];
    SLOTH_CARDS = [
      {
        id: "sloth_01",
        name: "Lazy Swipe",
        sin: "sloth",
        cost: 1,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "single" }],
        description: "A common sloth card"
      },
      {
        id: "sloth_02",
        name: "Drowsy Guard",
        sin: "sloth",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 5, duration: 3, targetMode: "self" }],
        description: "A common sloth card"
      },
      {
        id: "sloth_03",
        name: "Yawn",
        sin: "sloth",
        cost: 0,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A common sloth card"
      },
      {
        id: "sloth_04",
        name: "Nap Time",
        sin: "sloth",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 7, duration: 3, targetMode: "self" }],
        description: "A common sloth card"
      },
      {
        id: "sloth_05",
        name: "Sluggish Blow",
        sin: "sloth",
        cost: 1,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "single" }],
        description: "A common sloth card"
      },
      {
        id: "sloth_06",
        name: "Hibernate",
        sin: "sloth",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 5, duration: 3, targetMode: "self" }, { type: "heal_gain", baseValue: 4, duration: 2, targetMode: "self" }],
        description: "A common sloth card"
      },
      {
        id: "sloth_07",
        name: "Torpor",
        sin: "sloth",
        cost: 1,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "energy_steal", baseValue: 1, duration: 3, targetMode: "single" }],
        description: "A common sloth card"
      },
      {
        id: "sloth_08",
        name: "Heavy Eyelids",
        sin: "sloth",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "single" }],
        description: "A common sloth card"
      },
      {
        id: "sloth_09",
        name: "Snooze",
        sin: "sloth",
        cost: 0,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "heal_gain", baseValue: 5, duration: 4, targetMode: "self" }],
        description: "A common sloth card"
      },
      {
        id: "sloth_10",
        name: "Lethargic Pulse",
        sin: "sloth",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 4, duration: 2, targetMode: "self" }],
        description: "A common sloth card"
      },
      {
        id: "sloth_11",
        name: "Doze Off",
        sin: "sloth",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }],
        description: "A common sloth card"
      },
      {
        id: "sloth_12",
        name: "Slow Roll",
        sin: "sloth",
        cost: 2,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "duo" }],
        description: "A common sloth card"
      },
      {
        id: "sloth_13",
        name: "Pillow Fort",
        sin: "sloth",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 9, duration: 3, targetMode: "self" }],
        description: "A common sloth card"
      },
      {
        id: "sloth_14",
        name: "Rest",
        sin: "sloth",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 5, duration: 2, targetMode: "self" }],
        description: "A common sloth card"
      },
      {
        id: "sloth_15",
        name: "Drag Feet",
        sin: "sloth",
        cost: 1,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 2, duration: 4, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A common sloth card"
      },
      {
        id: "sloth_16",
        name: "Cozy Blanket",
        sin: "sloth",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 7, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A common sloth card"
      },
      {
        id: "sloth_17",
        name: "Idle Hands",
        sin: "sloth",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A common sloth card"
      },
      {
        id: "sloth_18",
        name: "Procrastinate",
        sin: "sloth",
        cost: 1,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "shield_gain", baseValue: 5, duration: 4, targetMode: "self" }],
        description: "A common sloth card"
      },
      {
        id: "sloth_19",
        name: "Dull Ache",
        sin: "sloth",
        cost: 2,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "single" }],
        description: "A common sloth card"
      },
      {
        id: "sloth_20",
        name: "Slumber Ward",
        sin: "sloth",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 5, duration: 2, targetMode: "self" }, { type: "heal_gain", baseValue: 4, duration: 2, targetMode: "self" }],
        description: "A common sloth card"
      },
      {
        id: "sloth_21",
        name: "Deep Slumber",
        sin: "sloth",
        cost: 3,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "heal_gain", baseValue: 9, duration: 5, targetMode: "self" }, { type: "shield_gain", baseValue: 7, duration: 4, targetMode: "self" }],
        description: "A rare sloth card"
      },
      {
        id: "sloth_22",
        name: "Comatose",
        sin: "sloth",
        cost: 3,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "draw_reduction", baseValue: 1, duration: 4, targetMode: "single" }, { type: "damage", baseValue: 4, duration: 4, targetMode: "single" }],
        description: "A rare sloth card"
      },
      {
        id: "sloth_23",
        name: "Narcolepsy",
        sin: "sloth",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "energy_steal", baseValue: 1, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 5, duration: 3, targetMode: "self" }],
        description: "A rare sloth card"
      },
      {
        id: "sloth_24",
        name: "Quicksand",
        sin: "sloth",
        cost: 3,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "duo" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "duo" }],
        description: "A rare sloth card"
      },
      {
        id: "sloth_25",
        name: "Stonewall",
        sin: "sloth",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 10, duration: 3, targetMode: "self" }, { type: "heal_gain", baseValue: 5, duration: 2, targetMode: "self" }],
        description: "A rare sloth card"
      },
      {
        id: "sloth_26",
        name: "Entropy",
        sin: "sloth",
        cost: 3,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A rare sloth card"
      },
      {
        id: "sloth_27",
        name: "Feign Death",
        sin: "sloth",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 14, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A rare sloth card"
      },
      {
        id: "sloth_28",
        name: "Soporific Mist",
        sin: "sloth",
        cost: 3,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "draw_reduction", baseValue: 1, duration: 4, targetMode: "aoe" }, { type: "shield_gain", baseValue: 5, duration: 3, targetMode: "self" }],
        description: "A rare sloth card"
      },
      {
        id: "sloth_29",
        name: "Glacial Pace",
        sin: "sloth",
        cost: 2,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "single" }, { type: "shield_gain", baseValue: 5, duration: 4, targetMode: "self" }],
        description: "A rare sloth card"
      },
      {
        id: "sloth_30",
        name: "Dreamcatcher",
        sin: "sloth",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 9, duration: 3, targetMode: "self" }, { type: "shield_gain", baseValue: 9, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A rare sloth card"
      },
      {
        id: "sloth_31",
        name: "Sedation",
        sin: "sloth",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "energy_steal", baseValue: 1, duration: 3, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A rare sloth card"
      },
      {
        id: "sloth_32",
        name: "Inertia",
        sin: "sloth",
        cost: 3,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 5, duration: 5, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }],
        description: "A rare sloth card"
      },
      {
        id: "sloth_33",
        name: "Fortress of Sloth",
        sin: "sloth",
        cost: 4,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 14, duration: 4, targetMode: "self" }, { type: "heal_gain", baseValue: 7, duration: 3, targetMode: "self" }],
        description: "A rare sloth card"
      },
      {
        id: "sloth_34",
        name: "Slow Decay",
        sin: "sloth",
        cost: 2,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "duo" }, { type: "heal_gain", baseValue: 4, duration: 3, targetMode: "self" }],
        description: "A rare sloth card"
      },
      {
        id: "sloth_35",
        name: "Stasis Field",
        sin: "sloth",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 9, duration: 3, targetMode: "self" }, { type: "energy_block", baseValue: 1, duration: 2, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A rare sloth card"
      },
      {
        id: "sloth_36",
        name: "Tranquility",
        sin: "sloth",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 9, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A rare sloth card"
      },
      {
        id: "sloth_37",
        name: "Sandman's Touch",
        sin: "sloth",
        cost: 3,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "draw_reduction", baseValue: 1, duration: 4, targetMode: "single" }, { type: "shield_gain", baseValue: 7, duration: 3, targetMode: "self" }, { type: "damage", baseValue: 3, duration: 3, targetMode: "single" }],
        description: "Lethargy spreads like a contagion through the battlefield"
      },
      {
        id: "sloth_38",
        name: "Eternal Rest",
        sin: "sloth",
        cost: 4,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "heal_gain", baseValue: 7, duration: 5, targetMode: "self" }, { type: "shield_gain", baseValue: 9, duration: 5, targetMode: "self" }],
        description: "The weight of inaction crushes all ambition"
      },
      {
        id: "sloth_39",
        name: "Absolute Zero",
        sin: "sloth",
        cost: 5,
        tier: "epic",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 4, targetMode: "aoe" }, { type: "shield_gain", baseValue: 10, duration: 4, targetMode: "self" }],
        description: "A yawn so powerful it drains the will to fight"
      },
      {
        id: "sloth_40",
        name: "Cryogenic Sleep",
        sin: "sloth",
        cost: 5,
        tier: "epic",
        compoundPattern: "slowburn",
        effects: [{ type: "heal_gain", baseValue: 10, duration: 5, targetMode: "self" }, { type: "shield_gain", baseValue: 14, duration: 5, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }],
        description: "Entropy accelerates \u2014 everything slows to a crawl"
      },
      {
        id: "sloth_41",
        name: "Time Stop",
        sin: "sloth",
        cost: 6,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "draw_reduction", baseValue: 1, duration: 4, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "aoe" }, { type: "shield_gain", baseValue: 10, duration: 3, targetMode: "self" }, { type: "heal_gain", baseValue: 7, duration: 3, targetMode: "self" }],
        description: "The comfort of stagnation becomes a fortress"
      },
      {
        id: "sloth_42",
        name: "Eternal Slumber",
        sin: "sloth",
        cost: 6,
        tier: "epic",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 5, duration: 5, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 5, targetMode: "aoe" }, { type: "heal_gain", baseValue: 9, duration: 4, targetMode: "self" }],
        description: "Apathy weaponized into a defensive cocoon"
      },
      {
        id: "sloth_43",
        name: "Impenetrable Wall",
        sin: "sloth",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 17, duration: 4, targetMode: "self" }, { type: "heal_gain", baseValue: 9, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 3, targetMode: "self" }],
        description: "Time itself seems to slow around the slothful"
      },
      {
        id: "sloth_44",
        name: "Suspended Animation",
        sin: "sloth",
        cost: 4,
        tier: "epic",
        compoundPattern: "slowburn",
        effects: [{ type: "shield_gain", baseValue: 10, duration: 5, targetMode: "self" }, { type: "heal_gain", baseValue: 7, duration: 5, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 4, targetMode: "self" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "single" }],
        description: "A torpor so deep it becomes impenetrable armor"
      },
      {
        id: "sloth_45",
        name: "Gravity Well",
        sin: "sloth",
        cost: 5,
        tier: "epic",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "aoe" }, { type: "shield_gain", baseValue: 9, duration: 4, targetMode: "self" }],
        description: "The lazy path proves the most efficient"
      },
      {
        id: "sloth_46",
        name: "Oblivion",
        sin: "sloth",
        cost: 6,
        tier: "epic",
        compoundPattern: "slowburn",
        effects: [{ type: "draw_reduction", baseValue: 1, duration: 5, targetMode: "aoe" }, { type: "damage", baseValue: 5, duration: 5, targetMode: "aoe" }, { type: "shield_gain", baseValue: 14, duration: 4, targetMode: "self" }, { type: "energy_block", baseValue: 1, duration: 3, targetMode: "aoe" }],
        description: "Inertia becomes an unstoppable force"
      },
      {
        id: "sloth_47",
        name: "Cocoon",
        sin: "sloth",
        cost: 4,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 16, duration: 4, targetMode: "self" }, { type: "heal_gain", baseValue: 10, duration: 4, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "Rest becomes a weapon more potent than any blade"
      },
      {
        id: "sloth_48",
        name: "Petrify",
        sin: "sloth",
        cost: 5,
        tier: "epic",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 5, targetMode: "single" }, { type: "energy_steal", baseValue: 2, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 9, duration: 3, targetMode: "self" }],
        description: "The ultimate expression of doing absolutely nothing"
      },
      {
        id: "sloth_49",
        name: "Dormant Power",
        sin: "sloth",
        cost: 4,
        tier: "epic",
        compoundPattern: "slowburn",
        effects: [{ type: "shield_gain", baseValue: 10, duration: 5, targetMode: "self" }, { type: "damage", baseValue: 3, duration: 5, targetMode: "duo" }, { type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }],
        description: "Procrastination elevated to an art form of survival"
      },
      {
        id: "sloth_50",
        name: "Nirvana",
        sin: "sloth",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 14, duration: 4, targetMode: "self" }, { type: "shield_gain", baseValue: 14, duration: 4, targetMode: "self" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 3, targetMode: "self" }],
        description: "In stillness, true power is conserved"
      },
      // ── Skip-Queue (Priority) Cards ──
      {
        id: "sloth_51",
        name: "Drowsy Ward",
        sin: "sloth",
        cost: 1,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 14, duration: 3, targetMode: "self" }],
        description: "A lazy barrier that somehow blocks everything.",
        skipQueue: true
      },
      {
        id: "sloth_52",
        name: "Yawning Hex",
        sin: "sloth",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "energy_block", baseValue: 1, duration: 2, targetMode: "single" }, { type: "shield_gain", baseValue: 9, duration: 2, targetMode: "self" }],
        description: "Your yawn is contagious \u2014 and draining.",
        skipQueue: true
      },
      {
        id: "sloth_53",
        name: "Torpor Snap",
        sin: "sloth",
        cost: 0,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A flick of lethargy that dulls the mind before battle begins.",
        skipQueue: true
      },
      {
        id: "sloth_54",
        name: "Idle Absorption",
        sin: "sloth",
        cost: 1,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 10, duration: 2, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "Do nothing, gain everything. The slothful way.",
        skipQueue: true
      },
      {
        id: "sloth_55",
        name: "Doze",
        sin: "sloth",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 6, duration: 3, targetMode: "self" }],
        description: "Sleep heals all wounds."
      },
      {
        id: "sloth_56",
        name: "Lazy Block",
        sin: "sloth",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 7, duration: 2, targetMode: "self" }],
        description: "Too tired to dodge, too stubborn to fall."
      },
      {
        id: "sloth_57",
        name: "Sluggish Curse",
        sin: "sloth",
        cost: 0,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "single" }],
        description: "Your hands grow heavy."
      },
      {
        id: "sloth_58",
        name: "Nap Time",
        sin: "sloth",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 4, duration: 2, targetMode: "self" }, { type: "heal_gain", baseValue: 3, duration: 2, targetMode: "self" }],
        description: "A quick rest never hurt."
      },
      {
        id: "sloth_59",
        name: "Heavy Eyelids",
        sin: "sloth",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 5, duration: 3, targetMode: "single" }],
        description: "Even sloth can sting."
      }
    ];
    GREED_CARDS = [
      {
        id: "greed_01",
        name: "Coin Toss",
        sin: "greed",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }],
        description: "A common greed card"
      },
      {
        id: "greed_02",
        name: "Pickpocket",
        sin: "greed",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A common greed card"
      },
      {
        id: "greed_03",
        name: "Toll Collector",
        sin: "greed",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
        description: "A common greed card"
      },
      {
        id: "greed_04",
        name: "Interest",
        sin: "greed",
        cost: 1,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "single" }],
        description: "A common greed card"
      },
      {
        id: "greed_05",
        name: "Skim Off Top",
        sin: "greed",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "heal_steal", baseValue: 7, duration: 3, targetMode: "single" }],
        description: "A common greed card"
      },
      {
        id: "greed_06",
        name: "Gold Rush",
        sin: "greed",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }],
        description: "A common greed card"
      },
      {
        id: "greed_07",
        name: "Embezzle",
        sin: "greed",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "shield_steal", baseValue: 7, duration: 3, targetMode: "single" }],
        description: "A common greed card"
      },
      {
        id: "greed_08",
        name: "Tax Levy",
        sin: "greed",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 10, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A common greed card"
      },
      {
        id: "greed_09",
        name: "Counterfeit",
        sin: "greed",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 10, duration: 3, targetMode: "self" }],
        description: "A common greed card"
      },
      {
        id: "greed_10",
        name: "Loan Shark",
        sin: "greed",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "duo" }],
        description: "A common greed card"
      },
      {
        id: "greed_11",
        name: "Penny Pinch",
        sin: "greed",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A common greed card"
      },
      {
        id: "greed_12",
        name: "Swindle",
        sin: "greed",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "heal_steal", baseValue: 10, duration: 2, targetMode: "single" }],
        description: "A common greed card"
      },
      {
        id: "greed_13",
        name: "Hoard",
        sin: "greed",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 12, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A common greed card"
      },
      {
        id: "greed_14",
        name: "Usury",
        sin: "greed",
        cost: 2,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 6, duration: 5, targetMode: "single" }],
        description: "A common greed card"
      },
      {
        id: "greed_15",
        name: "Bribe",
        sin: "greed",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "energy_steal", baseValue: 1, duration: 3, targetMode: "single" }],
        description: "A common greed card"
      },
      {
        id: "greed_16",
        name: "Extort",
        sin: "greed",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 6, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 5, duration: 2, targetMode: "single" }],
        description: "A common greed card"
      },
      {
        id: "greed_17",
        name: "Miser's Touch",
        sin: "greed",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 7, duration: 2, targetMode: "self" }],
        description: "A common greed card"
      },
      {
        id: "greed_18",
        name: "Fleece",
        sin: "greed",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }, { type: "damage", baseValue: 7, duration: 3, targetMode: "single" }],
        description: "A common greed card"
      },
      {
        id: "greed_19",
        name: "Compound Interest",
        sin: "greed",
        cost: 1,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "single" }],
        description: "A common greed card"
      },
      {
        id: "greed_20",
        name: "Treasure Hunt",
        sin: "greed",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A common greed card"
      },
      {
        id: "greed_21",
        name: "Hostile Takeover",
        sin: "greed",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 13, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 7, duration: 2, targetMode: "single" }],
        description: "A rare greed card"
      },
      {
        id: "greed_22",
        name: "Ponzi Scheme",
        sin: "greed",
        cost: 3,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 6, duration: 5, targetMode: "duo" }, { type: "heal_steal", baseValue: 7, duration: 3, targetMode: "duo" }],
        description: "A rare greed card"
      },
      {
        id: "greed_23",
        name: "Golden Parachute",
        sin: "greed",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 18, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }],
        description: "A rare greed card"
      },
      {
        id: "greed_24",
        name: "Market Crash",
        sin: "greed",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "energy_steal", baseValue: 1, duration: 3, targetMode: "aoe" }, { type: "damage", baseValue: 6, duration: 3, targetMode: "aoe" }],
        description: "A rare greed card"
      },
      {
        id: "greed_25",
        name: "Insider Trading",
        sin: "greed",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "draw_boost", baseValue: 1, duration: 3, targetMode: "self" }, { type: "damage", baseValue: 8, duration: 3, targetMode: "single" }],
        description: "A rare greed card"
      },
      {
        id: "greed_26",
        name: "Bankruptcy",
        sin: "greed",
        cost: 3,
        tier: "rare",
        compoundPattern: "aggressive",
        effects: [{ type: "energy_steal", baseValue: 2, duration: 2, targetMode: "single" }, { type: "damage", baseValue: 10, duration: 3, targetMode: "single" }],
        description: "A rare greed card"
      },
      {
        id: "greed_27",
        name: "Monopoly",
        sin: "greed",
        cost: 4,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 10, duration: 3, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "aoe" }],
        description: "A rare greed card"
      },
      {
        id: "greed_28",
        name: "Hedge Fund",
        sin: "greed",
        cost: 2,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 6, duration: 5, targetMode: "single" }, { type: "shield_gain", baseValue: 10, duration: 4, targetMode: "self" }],
        description: "A rare greed card"
      },
      {
        id: "greed_29",
        name: "Leverage",
        sin: "greed",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 14, duration: 3, targetMode: "single" }, { type: "self_damage", baseValue: 4, duration: 2, targetMode: "self" }],
        description: "A rare greed card"
      },
      {
        id: "greed_30",
        name: "Asset Strip",
        sin: "greed",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "shield_steal", baseValue: 12, duration: 3, targetMode: "single" }, { type: "heal_steal", baseValue: 10, duration: 3, targetMode: "single" }],
        description: "A rare greed card"
      },
      {
        id: "greed_31",
        name: "Inflation",
        sin: "greed",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "aoe" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A rare greed card"
      },
      {
        id: "greed_32",
        name: "Audit",
        sin: "greed",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "energy_steal", baseValue: 1, duration: 3, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }, { type: "damage", baseValue: 7, duration: 3, targetMode: "single" }],
        description: "A rare greed card"
      },
      {
        id: "greed_33",
        name: "Black Market",
        sin: "greed",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 3, duration: 2, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A rare greed card"
      },
      {
        id: "greed_34",
        name: "Venture Capital",
        sin: "greed",
        cost: 3,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 7, duration: 5, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 4, targetMode: "self" }],
        description: "A rare greed card"
      },
      {
        id: "greed_35",
        name: "Foreclosure",
        sin: "greed",
        cost: 4,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 12, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 10, duration: 2, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A rare greed card"
      },
      {
        id: "greed_36",
        name: "Debt Collector",
        sin: "greed",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 10, duration: 3, targetMode: "single" }, { type: "heal_steal", baseValue: 7, duration: 2, targetMode: "single" }],
        description: "A rare greed card"
      },
      {
        id: "greed_37",
        name: "Offshore Account",
        sin: "greed",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 23, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "Every coin stolen fuels the next heist"
      },
      {
        id: "greed_38",
        name: "Pyramid Scheme",
        sin: "greed",
        cost: 3,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "single" }],
        description: "The taxman cometh, and he takes everything"
      },
      {
        id: "greed_39",
        name: "Wealth of Nations",
        sin: "greed",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 13, duration: 3, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "aoe" }, { type: "shield_gain", baseValue: 18, duration: 3, targetMode: "self" }],
        description: "A golden cage that traps and drains simultaneously"
      },
      {
        id: "greed_40",
        name: "Golden Age",
        sin: "greed",
        cost: 5,
        tier: "epic",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 7, duration: 5, targetMode: "aoe" }, { type: "heal_steal", baseValue: 10, duration: 4, targetMode: "aoe" }, { type: "energy_regen", baseValue: 2, duration: 4, targetMode: "self" }],
        description: "Avarice knows no bounds \u2014 take it all"
      },
      {
        id: "greed_41",
        name: "Total Liquidation",
        sin: "greed",
        cost: 6,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 14, duration: 3, targetMode: "aoe" }, { type: "shield_steal", baseValue: 12, duration: 3, targetMode: "aoe" }, { type: "energy_steal", baseValue: 2, duration: 2, targetMode: "aoe" }],
        description: "The Midas touch corrupts everything it contacts"
      },
      {
        id: "greed_42",
        name: "Midas Touch",
        sin: "greed",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 16, duration: 4, targetMode: "single" }, { type: "heal_steal", baseValue: 12, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 10, duration: 3, targetMode: "single" }],
        description: "Wealth hoarded becomes a weapon of mass destruction"
      },
      {
        id: "greed_43",
        name: "Economic Warfare",
        sin: "greed",
        cost: 6,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "energy_steal", baseValue: 2, duration: 3, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "aoe" }, { type: "damage", baseValue: 8, duration: 3, targetMode: "aoe" }, { type: "discard_burn", baseValue: 2, duration: 2, targetMode: "aoe" }],
        description: "Every transaction skimmed, every deal exploited"
      },
      {
        id: "greed_44",
        name: "Gilded Fortress",
        sin: "greed",
        cost: 4,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 28, duration: 4, targetMode: "self" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 3, targetMode: "self" }],
        description: "The vault grows deeper as enemies grow poorer"
      },
      {
        id: "greed_45",
        name: "Robber Baron",
        sin: "greed",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 13, duration: 3, targetMode: "duo" }, { type: "energy_steal", baseValue: 2, duration: 3, targetMode: "duo" }, { type: "heal_steal", baseValue: 10, duration: 3, targetMode: "duo" }],
        description: "A hostile takeover of body, mind, and soul"
      },
      {
        id: "greed_46",
        name: "Empire Builder",
        sin: "greed",
        cost: 6,
        tier: "epic",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 8, duration: 5, targetMode: "aoe" }, { type: "shield_gain", baseValue: 23, duration: 5, targetMode: "self" }, { type: "energy_regen", baseValue: 2, duration: 5, targetMode: "self" }],
        description: "Interest compounds on suffering as well as gold"
      },
      {
        id: "greed_47",
        name: "Hostile Merger",
        sin: "greed",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 14, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 18, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 4, duration: 2, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "single" }],
        description: "The market crashes, but greed always profits"
      },
      {
        id: "greed_48",
        name: "Treasury Raid",
        sin: "greed",
        cost: 4,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "energy_steal", baseValue: 2, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 12, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 10, duration: 3, targetMode: "single" }],
        description: "Embezzlement of life force \u2014 the ultimate white collar crime"
      },
      {
        id: "greed_49",
        name: "Plutocracy",
        sin: "greed",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 12, duration: 4, targetMode: "aoe" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }, { type: "shield_gain", baseValue: 18, duration: 3, targetMode: "self" }, { type: "heal_steal", baseValue: 7, duration: 3, targetMode: "aoe" }],
        description: "A pyramid scheme of pain and profit"
      },
      {
        id: "greed_50",
        name: "Infinite Greed",
        sin: "greed",
        cost: 6,
        tier: "epic",
        compoundPattern: "aggressive",
        effects: [{ type: "damage", baseValue: 10, duration: 3, targetMode: "aoe" }, { type: "energy_steal", baseValue: 2, duration: 3, targetMode: "aoe" }, { type: "shield_steal", baseValue: 10, duration: 2, targetMode: "aoe" }, { type: "heal_steal", baseValue: 7, duration: 2, targetMode: "aoe" }],
        description: "The final audit reveals everything was already taken"
      },
      // ── Skip-Queue (Priority) Cards ──
      {
        id: "greed_51",
        name: "Quick Skim",
        sin: "greed",
        cost: 1,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A pickpocket's reflex \u2014 your energy is now mine.",
        skipQueue: true
      },
      {
        id: "greed_52",
        name: "Tax Collector's Rush",
        sin: "greed",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "shield_steal", baseValue: 10, duration: 2, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "The taxman arrives before the battle \u2014 nothing escapes the ledger.",
        skipQueue: true
      },
      {
        id: "greed_53",
        name: "Coin Flip",
        sin: "greed",
        cost: 0,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 5, duration: 2, targetMode: "single" }],
        description: "Heads you lose, tails I win. The coin was weighted.",
        skipQueue: true
      },
      {
        id: "greed_54",
        name: "Advance Payment",
        sin: "greed",
        cost: 1,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 2, targetMode: "single" }, { type: "shield_gain", baseValue: 7, duration: 2, targetMode: "self" }],
        description: "Collect interest before the debt is even owed.",
        skipQueue: true
      },
      {
        id: "greed_55",
        name: "Pocket Change",
        sin: "greed",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 1, targetMode: "self" }],
        description: "Every coin counts."
      },
      {
        id: "greed_56",
        name: "Skim",
        sin: "greed",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A little off the top."
      },
      {
        id: "greed_57",
        name: "Hoard",
        sin: "greed",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 6, duration: 3, targetMode: "self" }],
        description: "Pile it higher."
      },
      {
        id: "greed_58",
        name: "Bargain",
        sin: "greed",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 5, duration: 2, targetMode: "single" }, { type: "heal_gain", baseValue: 3, duration: 2, targetMode: "self" }],
        description: "Buy low, sell high."
      },
      {
        id: "greed_59",
        name: "Tax Bite",
        sin: "greed",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 5, duration: 3, targetMode: "single" }],
        description: "The collector always comes."
      },
      {
        id: "greed_60",
        name: "Loose Change",
        sin: "greed",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 1, targetMode: "self" }],
        description: "Shake the couch cushions."
      },
      {
        id: "greed_61",
        name: "Nickel and Dime",
        sin: "greed",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 3, duration: 2, targetMode: "aoe" }],
        description: "Death by a thousand fees."
      }
    ];
    ENVY_CARDS = [
      {
        id: "envy_01",
        name: "Covetous Strike",
        sin: "envy",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "single" }],
        description: "A common envy card"
      },
      {
        id: "envy_02",
        name: "Green-Eyed Glare",
        sin: "envy",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
        description: "A common envy card"
      },
      {
        id: "envy_03",
        name: "Bitter Touch",
        sin: "envy",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 2, targetMode: "single" }],
        description: "A common envy card"
      },
      {
        id: "envy_04",
        name: "Jealous Whisper",
        sin: "envy",
        cost: 1,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "single" }],
        description: "A common envy card"
      },
      {
        id: "envy_05",
        name: "Spite",
        sin: "envy",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "affliction_amplify", baseValue: 3, duration: 2, targetMode: "single" }],
        description: "A common envy card"
      },
      {
        id: "envy_06",
        name: "Envy's Grasp",
        sin: "envy",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "heal_steal", baseValue: 7, duration: 3, targetMode: "single" }],
        description: "A common envy card"
      },
      {
        id: "envy_07",
        name: "Resentment",
        sin: "envy",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "duo" }],
        description: "A common envy card"
      },
      {
        id: "envy_08",
        name: "Copycat",
        sin: "envy",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 9, duration: 2, targetMode: "single" }, { type: "shield_gain", baseValue: 5, duration: 2, targetMode: "self" }],
        description: "A common envy card"
      },
      {
        id: "envy_09",
        name: "Malice",
        sin: "envy",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A common envy card"
      },
      {
        id: "envy_10",
        name: "Grudge",
        sin: "envy",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 11, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 2, targetMode: "single" }],
        description: "A common envy card"
      },
      {
        id: "envy_11",
        name: "Sour Grapes",
        sin: "envy",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A common envy card"
      },
      {
        id: "envy_12",
        name: "Toxic Envy",
        sin: "envy",
        cost: 1,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 3, targetMode: "single" }],
        description: "A common envy card"
      },
      {
        id: "envy_13",
        name: "Begrudge",
        sin: "envy",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A common envy card"
      },
      {
        id: "envy_14",
        name: "Covet",
        sin: "envy",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "shield_steal", baseValue: 7, duration: 2, targetMode: "single" }],
        description: "A common envy card"
      },
      {
        id: "envy_15",
        name: "Inferiority Complex",
        sin: "envy",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 9, duration: 3, targetMode: "single" }, { type: "heal_steal", baseValue: 5, duration: 2, targetMode: "single" }],
        description: "A common envy card"
      },
      {
        id: "envy_16",
        name: "Petty Theft",
        sin: "envy",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }, { type: "damage", baseValue: 4, duration: 2, targetMode: "single" }],
        description: "A common envy card"
      },
      {
        id: "envy_17",
        name: "Sidelong Glance",
        sin: "envy",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 3, duration: 2, targetMode: "single" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A common envy card"
      },
      {
        id: "envy_18",
        name: "Comparison",
        sin: "envy",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "affliction_amplify", baseValue: 3, duration: 3, targetMode: "single" }],
        description: "A common envy card"
      },
      {
        id: "envy_19",
        name: "Undermine",
        sin: "envy",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "duo" }, { type: "affliction_amplify", baseValue: 2, duration: 2, targetMode: "duo" }],
        description: "A common envy card"
      },
      {
        id: "envy_20",
        name: "Bitter Pill",
        sin: "envy",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A common envy card"
      },
      {
        id: "envy_21",
        name: "Doppelganger",
        sin: "envy",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 13, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 4, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 5, duration: 2, targetMode: "single" }],
        description: "A rare envy card"
      },
      {
        id: "envy_22",
        name: "Curse of Envy",
        sin: "envy",
        cost: 3,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 7, duration: 5, targetMode: "single" }, { type: "affliction_amplify", baseValue: 3, duration: 5, targetMode: "single" }],
        description: "A rare envy card"
      },
      {
        id: "envy_23",
        name: "Mirror Match",
        sin: "envy",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "affliction_transfer", baseValue: 5, duration: 2, targetMode: "single" }, { type: "damage", baseValue: 8, duration: 3, targetMode: "single" }],
        description: "A rare envy card"
      },
      {
        id: "envy_24",
        name: "Schadenfreude",
        sin: "envy",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 11, duration: 3, targetMode: "duo" }, { type: "affliction_amplify", baseValue: 3, duration: 2, targetMode: "duo" }],
        description: "A rare envy card"
      },
      {
        id: "envy_25",
        name: "Sabotage",
        sin: "envy",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }, { type: "damage", baseValue: 7, duration: 2, targetMode: "single" }],
        description: "A rare envy card"
      },
      {
        id: "envy_26",
        name: "Plagiarize",
        sin: "envy",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "heal_steal", baseValue: 15, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 13, duration: 3, targetMode: "single" }],
        description: "A rare envy card"
      },
      {
        id: "envy_27",
        name: "Festering Wound",
        sin: "envy",
        cost: 2,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 7, duration: 5, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 4, targetMode: "single" }],
        description: "A rare envy card"
      },
      {
        id: "envy_28",
        name: "Jealous Rage",
        sin: "envy",
        cost: 3,
        tier: "rare",
        compoundPattern: "aggressive",
        effects: [{ type: "damage", baseValue: 11, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 4, duration: 2, targetMode: "single" }, { type: "self_damage", baseValue: 2, duration: 2, targetMode: "self" }],
        description: "A rare envy card"
      },
      {
        id: "envy_29",
        name: "Parasitic Link",
        sin: "envy",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "heal_steal", baseValue: 13, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 3, targetMode: "single" }],
        description: "A rare envy card"
      },
      {
        id: "envy_30",
        name: "Voodoo Doll",
        sin: "envy",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 9, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 3, duration: 3, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A rare envy card"
      },
      {
        id: "envy_31",
        name: "Insidious Whisper",
        sin: "envy",
        cost: 2,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "affliction_amplify", baseValue: 3, duration: 5, targetMode: "single" }, { type: "damage", baseValue: 4, duration: 4, targetMode: "single" }],
        description: "A rare envy card"
      },
      {
        id: "envy_32",
        name: "Green Plague",
        sin: "envy",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 2, duration: 2, targetMode: "aoe" }],
        description: "A rare envy card"
      },
      {
        id: "envy_33",
        name: "Resentful Strike",
        sin: "envy",
        cost: 4,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 14, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 7, duration: 3, targetMode: "single" }],
        description: "A rare envy card"
      },
      {
        id: "envy_34",
        name: "Soul Siphon",
        sin: "envy",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "heal_steal", baseValue: 15, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A rare envy card"
      },
      {
        id: "envy_35",
        name: "Torment",
        sin: "envy",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 9, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 3, duration: 3, targetMode: "single" }, { type: "heal_block", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A rare envy card"
      },
      {
        id: "envy_36",
        name: "Bitter Harvest",
        sin: "envy",
        cost: 3,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 7, duration: 5, targetMode: "duo" }, { type: "affliction_amplify", baseValue: 2, duration: 4, targetMode: "duo" }],
        description: "A rare envy card"
      },
      {
        id: "envy_37",
        name: "Malevolent Gaze",
        sin: "envy",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "affliction_amplify", baseValue: 4, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 8, duration: 2, targetMode: "single" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A malevolent gaze that amplifies every weakness"
      },
      {
        id: "envy_38",
        name: "Equalizer",
        sin: "envy",
        cost: 4,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 12, duration: 3, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 3, duration: 3, targetMode: "aoe" }],
        description: "The equalizer ensures no one has more than you"
      },
      {
        id: "envy_39",
        name: "Pandemic",
        sin: "envy",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 11, duration: 3, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 7, duration: 3, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "aoe" }],
        description: "A pandemic of jealousy that infects all"
      },
      {
        id: "envy_40",
        name: "Identity Theft",
        sin: "envy",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "heal_steal", baseValue: 20, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 20, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 2, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 4, duration: 3, targetMode: "single" }],
        description: "Covetous eyes see every vulnerability"
      },
      {
        id: "envy_41",
        name: "Curse Cascade",
        sin: "envy",
        cost: 6,
        tier: "epic",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 8, duration: 5, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 4, duration: 5, targetMode: "aoe" }, { type: "heal_block", baseValue: 1, duration: 3, targetMode: "aoe" }],
        description: "The green-eyed monster devours from within"
      },
      {
        id: "envy_42",
        name: "Nemesis",
        sin: "envy",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 18, duration: 4, targetMode: "single" }, { type: "affliction_amplify", baseValue: 8, duration: 4, targetMode: "single" }, { type: "shield_steal", baseValue: 13, duration: 2, targetMode: "single" }],
        description: "What they have, you want \u2014 and you'll take it"
      },
      {
        id: "envy_43",
        name: "Mass Hysteria",
        sin: "envy",
        cost: 6,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 9, duration: 3, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 7, duration: 3, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "aoe" }],
        description: "Envy's whisper turns allies against each other"
      },
      {
        id: "envy_44",
        name: "Dread Mirror",
        sin: "envy",
        cost: 4,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "affliction_transfer", baseValue: 8, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 13, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 4, duration: 3, targetMode: "single" }],
        description: "A mirror that reflects only the worst in others"
      },
      {
        id: "envy_45",
        name: "Existential Crisis",
        sin: "envy",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 12, duration: 3, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 4, duration: 3, targetMode: "aoe" }, { type: "heal_steal", baseValue: 7, duration: 3, targetMode: "aoe" }],
        description: "The curse of comparison amplifies all suffering"
      },
      {
        id: "envy_46",
        name: "Seven Deadly Sins",
        sin: "envy",
        cost: 6,
        tier: "epic",
        compoundPattern: "aggressive",
        effects: [{ type: "damage", baseValue: 13, duration: 3, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 8, duration: 3, targetMode: "aoe" }, { type: "shield_steal", baseValue: 7, duration: 2, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "aoe" }],
        description: "Jealousy festers, turning small wounds into mortal ones"
      },
      {
        id: "envy_47",
        name: "Twisted Fate",
        sin: "envy",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "affliction_amplify", baseValue: 8, duration: 4, targetMode: "single" }, { type: "damage", baseValue: 15, duration: 4, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "single" }],
        description: "Everything they built, you'll tear down"
      },
      {
        id: "envy_48",
        name: "Wretched Curse",
        sin: "envy",
        cost: 4,
        tier: "epic",
        compoundPattern: "slowburn",
        effects: [{ type: "affliction_amplify", baseValue: 4, duration: 5, targetMode: "single" }, { type: "damage", baseValue: 8, duration: 5, targetMode: "single" }, { type: "heal_block", baseValue: 1, duration: 3, targetMode: "single" }],
        description: "The envious eye sees weakness where others see strength"
      },
      {
        id: "envy_49",
        name: "Envious Apocalypse",
        sin: "envy",
        cost: 6,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 12, duration: 4, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 7, duration: 4, targetMode: "aoe" }, { type: "discard_burn", baseValue: 1, duration: 2, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "aoe" }],
        description: "A toxic comparison that poisons everything it touches"
      },
      {
        id: "envy_50",
        name: "Absolute Jealousy",
        sin: "envy",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 14, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 9, duration: 3, targetMode: "single" }, { type: "heal_steal", baseValue: 15, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 13, duration: 2, targetMode: "single" }],
        description: "In the end, envy consumes the envious most of all"
      },
      // ── Skip-Queue (Priority) Cards ──
      {
        id: "envy_51",
        name: "Covetous Glance",
        sin: "envy",
        cost: 1,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "affliction_amplify", baseValue: 2, duration: 2, targetMode: "single" }],
        description: "A jealous look that makes every wound sting deeper.",
        skipQueue: true
      },
      {
        id: "envy_52",
        name: "Stolen Moment",
        sin: "envy",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "heal_steal", baseValue: 11, duration: 2, targetMode: "single" }, { type: "shield_gain", baseValue: 7, duration: 2, targetMode: "self" }],
        description: "What's yours is mine \u2014 especially your health.",
        skipQueue: true
      },
      {
        id: "envy_53",
        name: "Spite Needle",
        sin: "envy",
        cost: 0,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 5, duration: 2, targetMode: "single" }],
        description: "A tiny prick of malice, delivered before you can blink.",
        skipQueue: true
      },
      {
        id: "envy_54",
        name: "Mirror Snatch",
        sin: "envy",
        cost: 1,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "shield_steal", baseValue: 9, duration: 2, targetMode: "single" }, { type: "damage", baseValue: 4, duration: 2, targetMode: "single" }],
        description: "Your protection becomes my weapon.",
        skipQueue: true
      },
      {
        id: "envy_55",
        name: "Covet",
        sin: "envy",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 2, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 1, targetMode: "single" }],
        description: "I want what you have."
      },
      {
        id: "envy_56",
        name: "Bitter Glance",
        sin: "envy",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 5, duration: 3, targetMode: "single" }],
        description: "If looks could kill."
      },
      {
        id: "envy_57",
        name: "Resentment",
        sin: "envy",
        cost: 0,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "affliction_amplify", baseValue: 2, duration: 3, targetMode: "single" }],
        description: "It festers."
      },
      {
        id: "envy_58",
        name: "Petty Theft",
        sin: "envy",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "shield_steal", baseValue: 4, duration: 2, targetMode: "single" }],
        description: "If I can't have it, neither can you."
      },
      {
        id: "envy_59",
        name: "Scowl",
        sin: "envy",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 3, duration: 2, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 1, targetMode: "single" }],
        description: "Your joy offends me."
      },
      {
        id: "envy_60",
        name: "Jealous Whisper",
        sin: "envy",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 2, targetMode: "duo" }],
        description: "Spread the misery."
      }
    ];
    PRIDE_CARDS = [
      {
        id: "pride_01",
        name: "Boastful Strike",
        sin: "pride",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
        description: "A common pride card"
      },
      {
        id: "pride_02",
        name: "Arrogant Slash",
        sin: "pride",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }],
        description: "A common pride card"
      },
      {
        id: "pride_03",
        name: "Vainglory",
        sin: "pride",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 4, duration: 2, targetMode: "self" }],
        description: "A common pride card"
      },
      {
        id: "pride_04",
        name: "Pompous Display",
        sin: "pride",
        cost: 3,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }],
        description: "A common pride card"
      },
      {
        id: "pride_05",
        name: "Condescend",
        sin: "pride",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 3, duration: 2, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A common pride card"
      },
      {
        id: "pride_06",
        name: "Ego Boost",
        sin: "pride",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 7, duration: 3, targetMode: "self" }],
        description: "A common pride card"
      },
      {
        id: "pride_07",
        name: "Showoff",
        sin: "pride",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "duo" }],
        description: "A common pride card"
      },
      {
        id: "pride_08",
        name: "Hubris Strike",
        sin: "pride",
        cost: 3,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 6, duration: 3, targetMode: "single" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A common pride card"
      },
      {
        id: "pride_09",
        name: "Grandstand",
        sin: "pride",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "aoe" }],
        description: "A common pride card"
      },
      {
        id: "pride_10",
        name: "Narcissism",
        sin: "pride",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 5, duration: 3, targetMode: "self" }, { type: "shield_gain", baseValue: 4, duration: 2, targetMode: "self" }],
        description: "A common pride card"
      },
      {
        id: "pride_11",
        name: "Swagger",
        sin: "pride",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }, { type: "shield_gain", baseValue: 4, duration: 2, targetMode: "self" }],
        description: "A common pride card"
      },
      {
        id: "pride_12",
        name: "Look at Me",
        sin: "pride",
        cost: 3,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "duo" }, { type: "shield_gain", baseValue: 4, duration: 2, targetMode: "self" }],
        description: "A common pride card"
      },
      {
        id: "pride_13",
        name: "Superiority",
        sin: "pride",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A common pride card"
      },
      {
        id: "pride_14",
        name: "Preen",
        sin: "pride",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 5, duration: 3, targetMode: "self" }],
        description: "A common pride card"
      },
      {
        id: "pride_15",
        name: "Disdain",
        sin: "pride",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A common pride card"
      },
      {
        id: "pride_16",
        name: "Magnificent",
        sin: "pride",
        cost: 3,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "aoe" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A common pride card"
      },
      {
        id: "pride_17",
        name: "Self-Admiration",
        sin: "pride",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 5, duration: 2, targetMode: "self" }],
        description: "A common pride card"
      },
      {
        id: "pride_18",
        name: "Imperious Wave",
        sin: "pride",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "aoe" }],
        description: "A common pride card"
      },
      {
        id: "pride_19",
        name: "Crown Jewel",
        sin: "pride",
        cost: 3,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 13, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A common pride card"
      },
      {
        id: "pride_20",
        name: "Belittle",
        sin: "pride",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A common pride card"
      },
      {
        id: "pride_21",
        name: "Royal Decree",
        sin: "pride",
        cost: 4,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 5, duration: 2, targetMode: "self" }],
        description: "A rare pride card"
      },
      {
        id: "pride_22",
        name: "Throne of Bones",
        sin: "pride",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 6, duration: 3, targetMode: "duo" }, { type: "shield_gain", baseValue: 5, duration: 3, targetMode: "self" }],
        description: "A rare pride card"
      },
      {
        id: "pride_23",
        name: "Coronation",
        sin: "pride",
        cost: 4,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 15, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A rare pride card"
      },
      {
        id: "pride_24",
        name: "Absolute Authority",
        sin: "pride",
        cost: 4,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "aoe" }],
        description: "A rare pride card"
      },
      {
        id: "pride_25",
        name: "Glorious Charge",
        sin: "pride",
        cost: 3,
        tier: "rare",
        compoundPattern: "aggressive",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }, { type: "self_damage", baseValue: 2, duration: 2, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A rare pride card"
      },
      {
        id: "pride_26",
        name: "Majestic Barrier",
        sin: "pride",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 13, duration: 3, targetMode: "self" }, { type: "heal_gain", baseValue: 5, duration: 3, targetMode: "self" }],
        description: "A rare pride card"
      },
      {
        id: "pride_27",
        name: "Tyrant's Fist",
        sin: "pride",
        cost: 4,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 2, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A rare pride card"
      },
      {
        id: "pride_28",
        name: "Regal Splendor",
        sin: "pride",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 7, duration: 3, targetMode: "self" }, { type: "shield_gain", baseValue: 7, duration: 3, targetMode: "self" }],
        description: "A rare pride card"
      },
      {
        id: "pride_29",
        name: "Imperious Command",
        sin: "pride",
        cost: 4,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "aoe" }],
        description: "A rare pride card"
      },
      {
        id: "pride_30",
        name: "Golden Throne",
        sin: "pride",
        cost: 5,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 17, duration: 4, targetMode: "self" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }],
        description: "A rare pride card"
      },
      {
        id: "pride_31",
        name: "Crushing Ego",
        sin: "pride",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 5, duration: 2, targetMode: "single" }],
        description: "A rare pride card"
      },
      {
        id: "pride_32",
        name: "Magnificent Aura",
        sin: "pride",
        cost: 4,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 7, duration: 3, targetMode: "self" }, { type: "damage", baseValue: 4, duration: 3, targetMode: "duo" }, { type: "heal_gain", baseValue: 4, duration: 2, targetMode: "self" }],
        description: "A rare pride card"
      },
      {
        id: "pride_33",
        name: "Dictator's Whim",
        sin: "pride",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
        description: "A rare pride card"
      },
      {
        id: "pride_34",
        name: "Exalted Strike",
        sin: "pride",
        cost: 5,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 7, duration: 3, targetMode: "self" }],
        description: "A rare pride card"
      },
      {
        id: "pride_35",
        name: "Vanity Mirror",
        sin: "pride",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 7, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 3, targetMode: "self" }, { type: "shield_gain", baseValue: 5, duration: 2, targetMode: "self" }],
        description: "A rare pride card"
      },
      {
        id: "pride_36",
        name: "Domination",
        sin: "pride",
        cost: 4,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 6, duration: 3, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 2, duration: 2, targetMode: "aoe" }],
        description: "A rare pride card"
      },
      {
        id: "pride_37",
        name: "Supreme Confidence",
        sin: "pride",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }, { type: "shield_gain", baseValue: 7, duration: 3, targetMode: "self" }],
        description: "Supreme confidence that borders on divinity"
      },
      {
        id: "pride_38",
        name: "Overbearing Force",
        sin: "pride",
        cost: 5,
        tier: "rare",
        compoundPattern: "aggressive",
        effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "duo" }, { type: "shield_steal", baseValue: 5, duration: 2, targetMode: "duo" }],
        description: "Overbearing force that crushes lesser beings"
      },
      {
        id: "pride_39",
        name: "God Complex",
        sin: "pride",
        cost: 6,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "aoe" }, { type: "shield_gain", baseValue: 15, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 3, targetMode: "self" }],
        description: "A god complex made manifest in devastating power"
      },
      {
        id: "pride_40",
        name: "Manifest Destiny",
        sin: "pride",
        cost: 6,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 10, duration: 4, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 2, duration: 3, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "aoe" }],
        description: "The crown weighs heavy but grants absolute authority"
      },
      {
        id: "pride_41",
        name: "Emperor's Wrath",
        sin: "pride",
        cost: 5,
        tier: "epic",
        compoundPattern: "aggressive",
        effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "aoe" }, { type: "shield_steal", baseValue: 5, duration: 2, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "aoe" }],
        description: "Narcissistic brilliance that blinds all who witness it"
      },
      {
        id: "pride_42",
        name: "Absolute Monarchy",
        sin: "pride",
        cost: 6,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 4, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "aoe" }, { type: "shield_gain", baseValue: 13, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }],
        description: "The pedestal grows higher with every victory"
      },
      {
        id: "pride_43",
        name: "Divine Right",
        sin: "pride",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 13, duration: 3, targetMode: "self" }, { type: "heal_gain", baseValue: 7, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }],
        description: "Arrogance so pure it becomes a shield"
      },
      {
        id: "pride_44",
        name: "Megalomania",
        sin: "pride",
        cost: 6,
        tier: "epic",
        compoundPattern: "aggressive",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 3, duration: 3, targetMode: "aoe" }, { type: "discard_burn", baseValue: 1, duration: 2, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "aoe" }],
        description: "The lion's roar silences all opposition"
      },
      {
        id: "pride_45",
        name: "Zenith",
        sin: "pride",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 10, duration: 4, targetMode: "single" }, { type: "shield_steal", baseValue: 7, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 2, duration: 3, targetMode: "single" }],
        description: "Superiority isn't a complex \u2014 it's a fact"
      },
      {
        id: "pride_46",
        name: "Apotheosis",
        sin: "pride",
        cost: 6,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 15, duration: 4, targetMode: "self" }, { type: "shield_gain", baseValue: 17, duration: 4, targetMode: "self" }, { type: "energy_regen", baseValue: 2, duration: 4, targetMode: "self" }, { type: "damage", baseValue: 4, duration: 3, targetMode: "aoe" }],
        description: "The throne demands sacrifice from all who approach"
      },
      {
        id: "pride_47",
        name: "Titan's Decree",
        sin: "pride",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "aoe" }, { type: "shield_gain", baseValue: 13, duration: 3, targetMode: "self" }, { type: "affliction_amplify", baseValue: 2, duration: 3, targetMode: "aoe" }],
        description: "Vanity's mirror reflects only perfection"
      },
      {
        id: "pride_48",
        name: "Eternal Glory",
        sin: "pride",
        cost: 6,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 8, duration: 4, targetMode: "aoe" }, { type: "heal_gain", baseValue: 13, duration: 4, targetMode: "self" }, { type: "shield_gain", baseValue: 13, duration: 4, targetMode: "self" }],
        description: "The summit of pride \u2014 looking down on everything"
      },
      {
        id: "pride_49",
        name: "Supreme Being",
        sin: "pride",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "duo" }, { type: "energy_steal", baseValue: 2, duration: 3, targetMode: "duo" }, { type: "shield_steal", baseValue: 5, duration: 3, targetMode: "duo" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "duo" }],
        description: "An ego so massive it warps reality itself"
      },
      {
        id: "pride_50",
        name: "Narcissus Bloom",
        sin: "pride",
        cost: 4,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 13, duration: 4, targetMode: "self" }, { type: "shield_gain", baseValue: 13, duration: 4, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }],
        description: "Pride goeth before destruction \u2014 but what a glorious fall"
      },
      // ── Skip-Queue (Priority) Cards ──
      {
        id: "pride_51",
        name: "Regal Decree",
        sin: "pride",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 11, duration: 2, targetMode: "single" }, { type: "shield_gain", baseValue: 11, duration: 2, targetMode: "self" }],
        description: "The king speaks first. Always.",
        skipQueue: true
      },
      {
        id: "pride_52",
        name: "Imperious Strike",
        sin: "pride",
        cost: 1,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 8, duration: 2, targetMode: "single" }],
        description: "A blow delivered with absolute certainty of superiority.",
        skipQueue: true
      },
      {
        id: "pride_53",
        name: "Dismissive Wave",
        sin: "pride",
        cost: 0,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 10, duration: 2, targetMode: "self" }],
        description: "You're not even worth my attention. But this shield is.",
        skipQueue: true
      },
      {
        id: "pride_54",
        name: "First Among Equals",
        sin: "pride",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 8, duration: 2, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "Pride demands the opening move \u2014 and the energy to back it up.",
        skipQueue: true
      },
      {
        id: "pride_55",
        name: "Sneer",
        sin: "pride",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
        description: "Beneath contempt."
      },
      {
        id: "pride_56",
        name: "Posture",
        sin: "pride",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 6, duration: 2, targetMode: "self" }],
        description: "Stand tall. Look down."
      },
      {
        id: "pride_57",
        name: "Condescend",
        sin: "pride",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 3, duration: 2, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 1, targetMode: "single" }],
        description: "You're not worth my time."
      },
      {
        id: "pride_58",
        name: "Self-Admire",
        sin: "pride",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 5, duration: 3, targetMode: "self" }],
        description: "Perfection heals itself."
      },
      {
        id: "pride_59",
        name: "Belittle",
        sin: "pride",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 5, duration: 2, targetMode: "single" }, { type: "affliction_amplify", baseValue: 1, duration: 1, targetMode: "single" }],
        description: "Small words, deep cuts."
      },
      {
        id: "pride_60",
        name: "Preen",
        sin: "pride",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 4, duration: 2, targetMode: "self" }, { type: "heal_gain", baseValue: 3, duration: 2, targetMode: "self" }],
        description: "Admire the plumage."
      },
      {
        id: "pride_61",
        name: "Scoff",
        sin: "pride",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 6, duration: 2, targetMode: "single" }],
        description: "Is that all?"
      },
      {
        id: "pride_62",
        name: "Vainglory",
        sin: "pride",
        cost: 0,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 4, duration: 4, targetMode: "single" }],
        description: "The mirror never lies."
      },
      {
        id: "pride_63",
        name: "Haughty Gaze",
        sin: "pride",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 3, duration: 2, targetMode: "aoe" }],
        description: "All are beneath me."
      },
      {
        id: "pride_64",
        name: "Ego Boost",
        sin: "pride",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }, { type: "shield_gain", baseValue: 3, duration: 2, targetMode: "self" }],
        description: "Confidence is power."
      }
    ];
    LUST_CARDS = [
      {
        id: "lust_01",
        name: "Seductive Touch",
        sin: "lust",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }],
        description: "A common lust card"
      },
      {
        id: "lust_02",
        name: "Charm",
        sin: "lust",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "single" }],
        description: "A common lust card"
      },
      {
        id: "lust_03",
        name: "Allure",
        sin: "lust",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "heal_gain", baseValue: 4, duration: 2, targetMode: "self" }],
        description: "A common lust card"
      },
      {
        id: "lust_04",
        name: "Tempting Whisper",
        sin: "lust",
        cost: 1,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 2, duration: 5, targetMode: "single" }],
        description: "A common lust card"
      },
      {
        id: "lust_05",
        name: "Kiss of Death",
        sin: "lust",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "heal_steal", baseValue: 5, duration: 3, targetMode: "single" }],
        description: "A common lust card"
      },
      {
        id: "lust_06",
        name: "Enchant",
        sin: "lust",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 2, duration: 3, targetMode: "single" }, { type: "heal_gain", baseValue: 2, duration: 2, targetMode: "self" }],
        description: "A common lust card"
      },
      {
        id: "lust_07",
        name: "Passion Burn",
        sin: "lust",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }],
        description: "A common lust card"
      },
      {
        id: "lust_08",
        name: "Desire",
        sin: "lust",
        cost: 1,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 2, duration: 5, targetMode: "single" }, { type: "heal_gain", baseValue: 2, duration: 3, targetMode: "self" }],
        description: "A common lust card"
      },
      {
        id: "lust_09",
        name: "Heartbreaker",
        sin: "lust",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "duo" }],
        description: "A common lust card"
      },
      {
        id: "lust_10",
        name: "Siren Song",
        sin: "lust",
        cost: 0,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 2, duration: 4, targetMode: "single" }],
        description: "A common lust card"
      },
      {
        id: "lust_11",
        name: "Forbidden Fruit",
        sin: "lust",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A common lust card"
      },
      {
        id: "lust_12",
        name: "Infatuation",
        sin: "lust",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "duo" }],
        description: "A common lust card"
      },
      {
        id: "lust_13",
        name: "Love Bite",
        sin: "lust",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "heal_steal", baseValue: 4, duration: 3, targetMode: "single" }],
        description: "A common lust card"
      },
      {
        id: "lust_14",
        name: "Beguile",
        sin: "lust",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A common lust card"
      },
      {
        id: "lust_15",
        name: "Obsession",
        sin: "lust",
        cost: 2,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "single" }],
        description: "A common lust card"
      },
      {
        id: "lust_16",
        name: "Sultry Gaze",
        sin: "lust",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A common lust card"
      },
      {
        id: "lust_17",
        name: "Caress",
        sin: "lust",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 6, duration: 3, targetMode: "self" }],
        description: "A common lust card"
      },
      {
        id: "lust_18",
        name: "Flirt",
        sin: "lust",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 2, duration: 2, targetMode: "single" }, { type: "heal_gain", baseValue: 4, duration: 2, targetMode: "self" }],
        description: "A common lust card"
      },
      {
        id: "lust_19",
        name: "Toxic Love",
        sin: "lust",
        cost: 2,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 2, duration: 5, targetMode: "duo" }],
        description: "A common lust card"
      },
      {
        id: "lust_20",
        name: "Mesmerize",
        sin: "lust",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 4, duration: 2, targetMode: "self" }],
        description: "A common lust card"
      },
      {
        id: "lust_21",
        name: "Succubus Kiss",
        sin: "lust",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "heal_steal", baseValue: 13, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 7, duration: 3, targetMode: "single" }],
        description: "A rare lust card"
      },
      {
        id: "lust_22",
        name: "Heartstring Pull",
        sin: "lust",
        cost: 2,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "single" }, { type: "heal_steal", baseValue: 4, duration: 4, targetMode: "single" }],
        description: "A rare lust card"
      },
      {
        id: "lust_23",
        name: "Aphrodite's Wrath",
        sin: "lust",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "duo" }, { type: "heal_gain", baseValue: 5, duration: 3, targetMode: "self" }],
        description: "A rare lust card"
      },
      {
        id: "lust_24",
        name: "Love Poison",
        sin: "lust",
        cost: 2,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 2, duration: 5, targetMode: "single" }, { type: "heal_block", baseValue: 1, duration: 3, targetMode: "single" }],
        description: "A rare lust card"
      },
      {
        id: "lust_25",
        name: "Seduction",
        sin: "lust",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "aoe" }, { type: "heal_steal", baseValue: 4, duration: 2, targetMode: "aoe" }],
        description: "A rare lust card"
      },
      {
        id: "lust_26",
        name: "Crimson Kiss",
        sin: "lust",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }, { type: "heal_gain", baseValue: 5, duration: 3, targetMode: "self" }],
        description: "A rare lust card"
      },
      {
        id: "lust_27",
        name: "Passionate Fury",
        sin: "lust",
        cost: 3,
        tier: "rare",
        compoundPattern: "aggressive",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }, { type: "heal_steal", baseValue: 5, duration: 2, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A rare lust card"
      },
      {
        id: "lust_28",
        name: "Enchantress",
        sin: "lust",
        cost: 3,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "duo" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "duo" }],
        description: "A rare lust card"
      },
      {
        id: "lust_29",
        name: "Draining Embrace",
        sin: "lust",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "heal_steal", baseValue: 6, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 4, duration: 2, targetMode: "self" }],
        description: "A rare lust card"
      },
      {
        id: "lust_30",
        name: "Irresistible",
        sin: "lust",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }, { type: "heal_gain", baseValue: 4, duration: 2, targetMode: "self" }],
        description: "A rare lust card"
      },
      {
        id: "lust_31",
        name: "Fatal Attraction",
        sin: "lust",
        cost: 4,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "single" }, { type: "heal_steal", baseValue: 4, duration: 5, targetMode: "single" }],
        description: "A rare lust card"
      },
      {
        id: "lust_32",
        name: "Love Triangle",
        sin: "lust",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "duo" }, { type: "heal_steal", baseValue: 4, duration: 3, targetMode: "duo" }],
        description: "A rare lust card"
      },
      {
        id: "lust_33",
        name: "Pheromone Cloud",
        sin: "lust",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "aoe" }, { type: "heal_gain", baseValue: 4, duration: 3, targetMode: "self" }],
        description: "A rare lust card"
      },
      {
        id: "lust_34",
        name: "Broken Heart",
        sin: "lust",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 2, targetMode: "single" }, { type: "heal_gain", baseValue: 4, duration: 2, targetMode: "self" }],
        description: "A rare lust card"
      },
      {
        id: "lust_35",
        name: "Vampiric Touch",
        sin: "lust",
        cost: 2,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "heal_steal", baseValue: 5, duration: 5, targetMode: "single" }],
        description: "A rare lust card"
      },
      {
        id: "lust_36",
        name: "Enthrall",
        sin: "lust",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "single" }, { type: "heal_steal", baseValue: 4, duration: 2, targetMode: "single" }],
        description: "A rare lust card"
      },
      {
        id: "lust_37",
        name: "Desire Unbound",
        sin: "lust",
        cost: 4,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "aoe" }, { type: "heal_gain", baseValue: 6, duration: 3, targetMode: "self" }],
        description: "An irresistible allure that drains the willing"
      },
      {
        id: "lust_38",
        name: "Rose Thorns",
        sin: "lust",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 5, duration: 3, targetMode: "self" }, { type: "heal_gain", baseValue: 4, duration: 2, targetMode: "self" }],
        description: "Passion's embrace heals as it destroys"
      },
      {
        id: "lust_39",
        name: "Eternal Seduction",
        sin: "lust",
        cost: 5,
        tier: "epic",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "aoe" }, { type: "heal_steal", baseValue: 5, duration: 5, targetMode: "aoe" }, { type: "heal_block", baseValue: 1, duration: 3, targetMode: "aoe" }],
        description: "The siren's call lures victims to sweet oblivion"
      },
      {
        id: "lust_40",
        name: "Lilith's Embrace",
        sin: "lust",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 9, duration: 4, targetMode: "single" }, { type: "heal_steal", baseValue: 13, duration: 4, targetMode: "single" }, { type: "shield_steal", baseValue: 5, duration: 2, targetMode: "single" }],
        description: "Desire made weapon \u2014 every touch steals life"
      },
      {
        id: "lust_41",
        name: "Mass Seduction",
        sin: "lust",
        cost: 6,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "aoe" }, { type: "heal_steal", baseValue: 5, duration: 3, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "aoe" }],
        description: "A seductive whisper that weakens all resolve"
      },
      {
        id: "lust_42",
        name: "Crimson Tide",
        sin: "lust",
        cost: 5,
        tier: "epic",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 4, duration: 5, targetMode: "aoe" }, { type: "heal_gain", baseValue: 13, duration: 5, targetMode: "self" }, { type: "shield_gain", baseValue: 6, duration: 3, targetMode: "self" }],
        description: "The dance of temptation leaves only exhaustion"
      },
      {
        id: "lust_43",
        name: "Forbidden Love",
        sin: "lust",
        cost: 6,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 12, duration: 4, targetMode: "single" }, { type: "heal_steal", baseValue: 13, duration: 4, targetMode: "single" }, { type: "affliction_amplify", baseValue: 2, duration: 3, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "single" }],
        description: "Obsession fuels an endless cycle of taking"
      },
      {
        id: "lust_44",
        name: "Love Plague",
        sin: "lust",
        cost: 5,
        tier: "epic",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "aoe" }, { type: "heal_steal", baseValue: 4, duration: 5, targetMode: "aoe" }, { type: "affliction_amplify", baseValue: 1, duration: 4, targetMode: "aoe" }],
        description: "The kiss of corruption spreads with every heartbeat"
      },
      {
        id: "lust_45",
        name: "Aphrodisiac Storm",
        sin: "lust",
        cost: 6,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 8, duration: 3, targetMode: "aoe" }, { type: "heal_steal", baseValue: 6, duration: 3, targetMode: "aoe" }, { type: "shield_steal", baseValue: 4, duration: 2, targetMode: "aoe" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }],
        description: "Infatuation blinds while lust devours"
      },
      {
        id: "lust_46",
        name: "Heartless",
        sin: "lust",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 12, duration: 3, targetMode: "single" }, { type: "heal_steal", baseValue: 6, duration: 3, targetMode: "single" }, { type: "heal_block", baseValue: 1, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 6, duration: 2, targetMode: "self" }],
        description: "A charm so potent it turns enemies into fuel"
      },
      {
        id: "lust_47",
        name: "Siren's Requiem",
        sin: "lust",
        cost: 4,
        tier: "epic",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 3, duration: 5, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 4, targetMode: "aoe" }, { type: "heal_gain", baseValue: 6, duration: 4, targetMode: "self" }],
        description: "The web of desire ensnares all who draw near"
      },
      {
        id: "lust_48",
        name: "Cupid's Arrow",
        sin: "lust",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 9, duration: 4, targetMode: "duo" }, { type: "heal_steal", baseValue: 6, duration: 4, targetMode: "duo" }, { type: "affliction_amplify", baseValue: 2, duration: 3, targetMode: "duo" }],
        description: "Passion's fire burns brightest in the darkest moments"
      },
      {
        id: "lust_49",
        name: "Eternal Devotion",
        sin: "lust",
        cost: 4,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 15, duration: 4, targetMode: "self" }, { type: "shield_gain", baseValue: 15, duration: 4, targetMode: "self" }, { type: "damage", baseValue: 4, duration: 3, targetMode: "duo" }, { type: "draw_boost", baseValue: 1, duration: 3, targetMode: "self" }],
        description: "Every stolen glance becomes a stolen breath"
      },
      {
        id: "lust_50",
        name: "Lust Incarnate",
        sin: "lust",
        cost: 6,
        tier: "epic",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 7, duration: 5, targetMode: "aoe" }, { type: "heal_steal", baseValue: 6, duration: 5, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "aoe" }, { type: "heal_block", baseValue: 1, duration: 3, targetMode: "aoe" }],
        description: "The ultimate seduction \u2014 life itself surrendered willingly"
      },
      // ── Skip-Queue (Priority) Cards ──
      {
        id: "lust_51",
        name: "Alluring Whisper",
        sin: "lust",
        cost: 1,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 5, duration: 2, targetMode: "single" }, { type: "heal_gain", baseValue: 6, duration: 2, targetMode: "self" }],
        description: "A sweet nothing that cuts like a blade.",
        skipQueue: true
      },
      {
        id: "lust_52",
        name: "Seductive Feint",
        sin: "lust",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "heal_steal", baseValue: 11, duration: 2, targetMode: "single" }, { type: "shield_gain", baseValue: 6, duration: 2, targetMode: "self" }],
        description: "Draw them close, then take what you need.",
        skipQueue: true
      },
      {
        id: "lust_53",
        name: "Heartstring Tug",
        sin: "lust",
        cost: 0,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 5, duration: 2, targetMode: "single" }],
        description: "A gentle pull that tears something vital.",
        skipQueue: true
      },
      {
        id: "lust_54",
        name: "Passion's Edge",
        sin: "lust",
        cost: 1,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 2, targetMode: "single" }, { type: "heal_gain", baseValue: 5, duration: 2, targetMode: "self" }],
        description: "Desire sharpened to a point \u2014 it strikes before reason.",
        skipQueue: true
      },
      {
        id: "lust_55",
        name: "Wink",
        sin: "lust",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 3, duration: 3, targetMode: "single" }, { type: "heal_gain", baseValue: 2, duration: 2, targetMode: "self" }],
        description: "A glance that lingers."
      },
      {
        id: "lust_56",
        name: "Caress",
        sin: "lust",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 5, duration: 3, targetMode: "self" }],
        description: "Gentle but relentless."
      },
      {
        id: "lust_57",
        name: "Tease",
        sin: "lust",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 2, targetMode: "single" }, { type: "draw_reduction", baseValue: 1, duration: 1, targetMode: "single" }],
        description: "Come closer. No, not yet."
      },
      {
        id: "lust_58",
        name: "Blush",
        sin: "lust",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 5, duration: 3, targetMode: "self" }],
        description: "Flushed with power."
      },
      {
        id: "lust_59",
        name: "Whisper",
        sin: "lust",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 2, duration: 2, targetMode: "duo" }, { type: "heal_gain", baseValue: 3, duration: 2, targetMode: "self" }],
        description: "Sweet nothings that sting."
      },
      {
        id: "lust_60",
        name: "Longing",
        sin: "lust",
        cost: 0,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "damage", baseValue: 3, duration: 4, targetMode: "single" }],
        description: "Desire is patient."
      }
    ];
    GLUTTONY_CARDS = [
      {
        id: "gluttony_01",
        name: "Nibble",
        sin: "gluttony",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }, { type: "discard_burn", baseValue: 2, duration: 2, targetMode: "single" }],
        description: "A common gluttony card"
      },
      {
        id: "gluttony_02",
        name: "Gulp",
        sin: "gluttony",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 2, duration: 3, targetMode: "single" }],
        description: "A common gluttony card"
      },
      {
        id: "gluttony_03",
        name: "Chomp",
        sin: "gluttony",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 9, duration: 3, targetMode: "single" }],
        description: "A common gluttony card"
      },
      {
        id: "gluttony_04",
        name: "Gorge",
        sin: "gluttony",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 3, duration: 2, targetMode: "single" }, { type: "damage", baseValue: 7, duration: 2, targetMode: "single" }],
        description: "A common gluttony card"
      },
      {
        id: "gluttony_05",
        name: "Munch",
        sin: "gluttony",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 2, duration: 3, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A common gluttony card"
      },
      {
        id: "gluttony_06",
        name: "Belch",
        sin: "gluttony",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 6, duration: 3, targetMode: "aoe" }],
        description: "A common gluttony card"
      },
      {
        id: "gluttony_07",
        name: "Crunch",
        sin: "gluttony",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 11, duration: 2, targetMode: "single" }, { type: "discard_burn", baseValue: 2, duration: 2, targetMode: "single" }],
        description: "A common gluttony card"
      },
      {
        id: "gluttony_08",
        name: "Devour Scraps",
        sin: "gluttony",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 2, duration: 2, targetMode: "single" }, { type: "heal_gain", baseValue: 9, duration: 2, targetMode: "self" }],
        description: "A common gluttony card"
      },
      {
        id: "gluttony_09",
        name: "Ravenous Bite",
        sin: "gluttony",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 12, duration: 3, targetMode: "single" }],
        description: "A common gluttony card"
      },
      {
        id: "gluttony_10",
        name: "Consume",
        sin: "gluttony",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 3, duration: 2, targetMode: "single" }],
        description: "A common gluttony card"
      },
      {
        id: "gluttony_11",
        name: "Feast",
        sin: "gluttony",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 10, duration: 3, targetMode: "self" }],
        description: "A common gluttony card"
      },
      {
        id: "gluttony_12",
        name: "Swallow Whole",
        sin: "gluttony",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 6, duration: 2, targetMode: "single" }],
        description: "A common gluttony card"
      },
      {
        id: "gluttony_13",
        name: "Acid Spit",
        sin: "gluttony",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 5, duration: 2, targetMode: "single" }],
        description: "A common gluttony card"
      },
      {
        id: "gluttony_14",
        name: "Gluttonous Grab",
        sin: "gluttony",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }, { type: "discard_burn", baseValue: 2, duration: 2, targetMode: "single" }],
        description: "A common gluttony card"
      },
      {
        id: "gluttony_15",
        name: "Bloat",
        sin: "gluttony",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 10, duration: 3, targetMode: "self" }],
        description: "A common gluttony card"
      },
      {
        id: "gluttony_16",
        name: "Digest",
        sin: "gluttony",
        cost: 1,
        tier: "common",
        compoundPattern: "slowburn",
        effects: [{ type: "discard_burn", baseValue: 2, duration: 4, targetMode: "single" }],
        description: "A common gluttony card"
      },
      {
        id: "gluttony_17",
        name: "Hungry Eyes",
        sin: "gluttony",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "duo" }],
        description: "A common gluttony card"
      },
      {
        id: "gluttony_18",
        name: "Scavenge",
        sin: "gluttony",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }, { type: "discard_burn", baseValue: 2, duration: 2, targetMode: "single" }],
        description: "A common gluttony card"
      },
      {
        id: "gluttony_19",
        name: "Stomach Acid",
        sin: "gluttony",
        cost: 2,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 9, duration: 3, targetMode: "single" }, { type: "discard_burn", baseValue: 2, duration: 3, targetMode: "single" }],
        description: "A common gluttony card"
      },
      {
        id: "gluttony_20",
        name: "Leftovers",
        sin: "gluttony",
        cost: 1,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 12, duration: 2, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A common gluttony card"
      },
      {
        id: "gluttony_21",
        name: "Feeding Frenzy",
        sin: "gluttony",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 12, duration: 3, targetMode: "single" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A rare gluttony card"
      },
      {
        id: "gluttony_22",
        name: "Insatiable Hunger",
        sin: "gluttony",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "duo" }, { type: "damage", baseValue: 9, duration: 3, targetMode: "duo" }],
        description: "A rare gluttony card"
      },
      {
        id: "gluttony_23",
        name: "Acid Rain",
        sin: "gluttony",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 9, duration: 3, targetMode: "aoe" }, { type: "discard_burn", baseValue: 2, duration: 2, targetMode: "aoe" }],
        description: "A rare gluttony card"
      },
      {
        id: "gluttony_24",
        name: "Digestive Tract",
        sin: "gluttony",
        cost: 2,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "discard_burn", baseValue: 2, duration: 5, targetMode: "single" }, { type: "damage", baseValue: 6, duration: 4, targetMode: "single" }],
        description: "A rare gluttony card"
      },
      {
        id: "gluttony_25",
        name: "Binge",
        sin: "gluttony",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 5, duration: 2, targetMode: "single" }, { type: "heal_gain", baseValue: 16, duration: 3, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "A rare gluttony card"
      },
      {
        id: "gluttony_26",
        name: "Regurgitate",
        sin: "gluttony",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 11, duration: 3, targetMode: "single" }, { type: "discard_burn", baseValue: 2, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 10, duration: 2, targetMode: "self" }],
        description: "A rare gluttony card"
      },
      {
        id: "gluttony_27",
        name: "Bottomless Pit",
        sin: "gluttony",
        cost: 4,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "aoe" }, { type: "damage", baseValue: 7, duration: 3, targetMode: "aoe" }],
        description: "A rare gluttony card"
      },
      {
        id: "gluttony_28",
        name: "Gluttony's Maw",
        sin: "gluttony",
        cost: 3,
        tier: "rare",
        compoundPattern: "aggressive",
        effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 14, duration: 3, targetMode: "single" }],
        description: "A rare gluttony card"
      },
      {
        id: "gluttony_29",
        name: "Corrode",
        sin: "gluttony",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "shield_steal", baseValue: 12, duration: 3, targetMode: "single" }, { type: "discard_burn", baseValue: 2, duration: 2, targetMode: "single" }],
        description: "A rare gluttony card"
      },
      {
        id: "gluttony_30",
        name: "Feast or Famine",
        sin: "gluttony",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 1, duration: 2, targetMode: "single" }, { type: "damage", baseValue: 9, duration: 3, targetMode: "single" }],
        description: "A rare gluttony card"
      },
      {
        id: "gluttony_31",
        name: "Consume All",
        sin: "gluttony",
        cost: 4,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "duo" }, { type: "damage", baseValue: 11, duration: 3, targetMode: "duo" }],
        description: "A rare gluttony card"
      },
      {
        id: "gluttony_32",
        name: "Putrid Breath",
        sin: "gluttony",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 3, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "A rare gluttony card"
      },
      {
        id: "gluttony_33",
        name: "Parasitic Feast",
        sin: "gluttony",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "heal_steal", baseValue: 12, duration: 3, targetMode: "single" }, { type: "discard_burn", baseValue: 3, duration: 2, targetMode: "single" }],
        description: "A rare gluttony card"
      },
      {
        id: "gluttony_34",
        name: "Dissolve",
        sin: "gluttony",
        cost: 3,
        tier: "rare",
        compoundPattern: "slowburn",
        effects: [{ type: "discard_burn", baseValue: 2, duration: 5, targetMode: "single" }, { type: "damage", baseValue: 7, duration: 5, targetMode: "single" }, { type: "shield_steal", baseValue: 9, duration: 3, targetMode: "single" }],
        description: "A rare gluttony card"
      },
      {
        id: "gluttony_35",
        name: "Ravenous Swarm",
        sin: "gluttony",
        cost: 4,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "aoe" }, { type: "damage", baseValue: 7, duration: 2, targetMode: "aoe" }, { type: "energy_regen", baseValue: 1, duration: 3, targetMode: "self" }],
        description: "A rare gluttony card"
      },
      {
        id: "gluttony_36",
        name: "Gut Rot",
        sin: "gluttony",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 11, duration: 3, targetMode: "single" }, { type: "heal_block", baseValue: 1, duration: 2, targetMode: "single" }, { type: "discard_burn", baseValue: 2, duration: 2, targetMode: "single" }],
        description: "A rare gluttony card"
      },
      {
        id: "gluttony_37",
        name: "Engulf",
        sin: "gluttony",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 12, duration: 3, targetMode: "single" }, { type: "shield_gain", baseValue: 12, duration: 2, targetMode: "self" }],
        description: "An insatiable hunger that consumes everything"
      },
      {
        id: "gluttony_38",
        name: "Voracious Appetite",
        sin: "gluttony",
        cost: 3,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "duo" }, { type: "heal_gain", baseValue: 12, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "The feast never ends \u2014 there's always room for more"
      },
      {
        id: "gluttony_39",
        name: "Consume the World",
        sin: "gluttony",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 5, duration: 3, targetMode: "aoe" }, { type: "damage", baseValue: 12, duration: 3, targetMode: "aoe" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }],
        description: "A bottomless pit that swallows hope and health"
      },
      {
        id: "gluttony_40",
        name: "Eternal Hunger",
        sin: "gluttony",
        cost: 6,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 5, duration: 4, targetMode: "aoe" }, { type: "damage", baseValue: 11, duration: 3, targetMode: "aoe" }, { type: "heal_steal", baseValue: 10, duration: 3, targetMode: "aoe" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }],
        description: "Ravenous consumption fuels unstoppable growth"
      },
      {
        id: "gluttony_41",
        name: "Black Hole",
        sin: "gluttony",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 5, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 17, duration: 3, targetMode: "single" }, { type: "energy_steal", baseValue: 2, duration: 3, targetMode: "single" }, { type: "shield_steal", baseValue: 12, duration: 2, targetMode: "single" }],
        description: "The glutton's banquet \u2014 your loss is their gain"
      },
      {
        id: "gluttony_42",
        name: "Apocalyptic Feast",
        sin: "gluttony",
        cost: 6,
        tier: "epic",
        compoundPattern: "aggressive",
        effects: [{ type: "discard_burn", baseValue: 5, duration: 3, targetMode: "aoe" }, { type: "damage", baseValue: 14, duration: 3, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 3, targetMode: "aoe" }],
        description: "Devouring not just flesh but spirit and will"
      },
      {
        id: "gluttony_43",
        name: "Obese Monstrosity",
        sin: "gluttony",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "aoe" }, { type: "shield_gain", baseValue: 30, duration: 3, targetMode: "self" }, { type: "heal_gain", baseValue: 21, duration: 3, targetMode: "self" }, { type: "damage", baseValue: 7, duration: 3, targetMode: "aoe" }],
        description: "An appetite for destruction that knows no satiation"
      },
      {
        id: "gluttony_44",
        name: "Digestive Apocalypse",
        sin: "gluttony",
        cost: 6,
        tier: "epic",
        compoundPattern: "slowburn",
        effects: [{ type: "discard_burn", baseValue: 3, duration: 5, targetMode: "aoe" }, { type: "damage", baseValue: 7, duration: 5, targetMode: "aoe" }, { type: "heal_steal", baseValue: 9, duration: 4, targetMode: "aoe" }],
        description: "The more you feed it, the hungrier it becomes"
      },
      {
        id: "gluttony_45",
        name: "Void Stomach",
        sin: "gluttony",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 5, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 14, duration: 3, targetMode: "single" }, { type: "affliction_amplify", baseValue: 6, duration: 2, targetMode: "single" }, { type: "energy_regen", baseValue: 2, duration: 3, targetMode: "self" }],
        description: "A consuming void that turns waste into power"
      },
      {
        id: "gluttony_46",
        name: "Famine",
        sin: "gluttony",
        cost: 6,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "aoe" }, { type: "draw_reduction", baseValue: 1, duration: 4, targetMode: "aoe" }, { type: "energy_steal", baseValue: 1, duration: 3, targetMode: "aoe" }, { type: "damage", baseValue: 9, duration: 3, targetMode: "aoe" }],
        description: "Gluttony's curse \u2014 always hungry, never satisfied"
      },
      {
        id: "gluttony_47",
        name: "All-Consuming",
        sin: "gluttony",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 5, duration: 3, targetMode: "duo" }, { type: "damage", baseValue: 14, duration: 3, targetMode: "duo" }, { type: "heal_steal", baseValue: 12, duration: 3, targetMode: "duo" }],
        description: "The feast of fools \u2014 everyone's invited, no one leaves"
      },
      {
        id: "gluttony_48",
        name: "Leviathan",
        sin: "gluttony",
        cost: 6,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 5, duration: 4, targetMode: "aoe" }, { type: "damage", baseValue: 12, duration: 4, targetMode: "aoe" }, { type: "shield_steal", baseValue: 12, duration: 3, targetMode: "aoe" }, { type: "energy_regen", baseValue: 2, duration: 4, targetMode: "self" }],
        description: "Metabolizing misery into raw energy"
      },
      {
        id: "gluttony_49",
        name: "Glutton King",
        sin: "gluttony",
        cost: 5,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 3, duration: 3, targetMode: "aoe" }, { type: "damage", baseValue: 11, duration: 3, targetMode: "aoe" }, { type: "shield_gain", baseValue: 24, duration: 3, targetMode: "self" }, { type: "draw_boost", baseValue: 1, duration: 3, targetMode: "self" }],
        description: "An all-you-can-eat buffet of suffering"
      },
      {
        id: "gluttony_50",
        name: "Singularity",
        sin: "gluttony",
        cost: 4,
        tier: "epic",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 5, duration: 3, targetMode: "single" }, { type: "damage", baseValue: 15, duration: 3, targetMode: "single" }, { type: "heal_gain", baseValue: 21, duration: 3, targetMode: "self" }],
        description: "The final course \u2014 everything that remains"
      },
      // ── Skip-Queue (Priority) Cards ──
      {
        id: "gluttony_51",
        name: "Voracious Snap",
        sin: "gluttony",
        cost: 1,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 7, duration: 2, targetMode: "single" }, { type: "discard_burn", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "Bite first, chew later. Their cards are the appetizer.",
        skipQueue: true
      },
      {
        id: "gluttony_52",
        name: "Gulping Surge",
        sin: "gluttony",
        cost: 2,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 14, duration: 2, targetMode: "self" }, { type: "energy_regen", baseValue: 1, duration: 2, targetMode: "self" }],
        description: "Consume everything in reach \u2014 health, energy, all of it.",
        skipQueue: true
      },
      {
        id: "gluttony_53",
        name: "Nibble",
        sin: "gluttony",
        cost: 0,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "Just a taste. But even a taste destroys.",
        skipQueue: true
      },
      {
        id: "gluttony_54",
        name: "Hunger Pang",
        sin: "gluttony",
        cost: 1,
        tier: "rare",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 6, duration: 2, targetMode: "single" }, { type: "heal_steal", baseValue: 7, duration: 2, targetMode: "single" }],
        description: "The hunger strikes before the feast begins.",
        skipQueue: true
      },
      {
        id: "gluttony_55",
        name: "Snack",
        sin: "gluttony",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "heal_gain", baseValue: 7, duration: 2, targetMode: "self" }, { type: "discard_burn", baseValue: 1, duration: 1, targetMode: "single" }],
        description: "A bite between meals."
      },
      {
        id: "gluttony_56",
        name: "Burp",
        sin: "gluttony",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 5, duration: 2, targetMode: "aoe" }],
        description: "Excuse me."
      },
      {
        id: "gluttony_57",
        name: "Chew",
        sin: "gluttony",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "discard_burn", baseValue: 2, duration: 2, targetMode: "single" }],
        description: "Slowly devoured."
      },
      {
        id: "gluttony_58",
        name: "Gorge",
        sin: "gluttony",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "shield_gain", baseValue: 8, duration: 2, targetMode: "self" }, { type: "heal_gain", baseValue: 5, duration: 2, targetMode: "self" }],
        description: "Stuff yourself. Feel invincible."
      },
      {
        id: "gluttony_59",
        name: "Crumb Trail",
        sin: "gluttony",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "draw_boost", baseValue: 1, duration: 1, targetMode: "self" }],
        description: "Follow the crumbs."
      },
      {
        id: "gluttony_60",
        name: "Taste",
        sin: "gluttony",
        cost: 0,
        tier: "common",
        compoundPattern: "standard",
        effects: [{ type: "damage", baseValue: 4, duration: 3, targetMode: "single" }, { type: "discard_burn", baseValue: 1, duration: 2, targetMode: "single" }],
        description: "Just a sample."
      }
    ];
    ALL_DECKS = {
      wrath: WRATH_CARDS,
      sloth: SLOTH_CARDS,
      greed: GREED_CARDS,
      envy: ENVY_CARDS,
      pride: PRIDE_CARDS,
      lust: LUST_CARDS,
      gluttony: GLUTTONY_CARDS
    };
    ALL_CARDS = [
      ...WRATH_CARDS,
      ...SLOTH_CARDS,
      ...GREED_CARDS,
      ...ENVY_CARDS,
      ...PRIDE_CARDS,
      ...LUST_CARDS,
      ...GLUTTONY_CARDS
    ];
    CARD_MAP = {};
    ALL_CARDS.forEach((card) => {
      CARD_MAP[card.id] = card;
    });
    NARRATOR_LINES = {
      gameStart: [
        "Oh wonderful, another batch of sinners. Try not to embarrass yourselves.",
        "Welcome to the arena, where your poor life choices become entertainment.",
        "Four players enter. One survives. The rest get therapy bills.",
        "Let the sin-fueled chaos begin. I'll be here, judging. Not silently.",
        "Another game? You'd think you people would learn. But no.",
        "The arena opens its maw. Step inside, you beautiful disasters.",
        "Welcome back. Your persistence is either admirable or pathological."
      ],
      roundStart: [
        "Round {round}. The compound effects are ticking. Can you feel it?",
        "Round {round}. Those Fibonacci multipliers don't care about your feelings.",
        "Round {round}. Tick... tick... the escalation continues.",
        "Round {round} begins. Your compound cards are doing the heavy lifting.",
        "Round {round}. Compound cards hit forever. Choose wisely.",
        "Round {round}. The escalation continues. Just like your bad decisions.",
        "Round {round}. More corruption flows. Spend it wisely. Or don't. I'm not your accountant."
      ],
      playerEliminated: [
        "{player} has been eliminated. Don't let the door hit you on the way out.",
        "And {player} is DEAD. Another one bites the metaphorical dust.",
        "{player} is gone. Reduced to a spectator. How embarrassing for them.",
        "RIP {player}. Your sin wasn't strong enough. Tragic, really.",
        "{player} has left the mortal coil. The remaining sinners barely noticed.",
        "{player} is out. Their contribution to this game will not be remembered.",
        "And just like that, {player} becomes a cautionary tale."
      ],
      gameEnd: [
        "{winner} wins! Was it skill? Luck? Probably just everyone else being worse.",
        "Congratulations, {winner}. You're the best at being the worst. Truly inspiring.",
        "{winner} stands victorious! The crowd goes mild!",
        "And the crown of sin goes to {winner}. Try not to let it go to your head.",
        "{winner} wins! Achievement unlocked: 'Slightly Less Terrible Than Everyone Else.'",
        "{winner} survives! Not through merit, mind you. Through everyone else's incompetence."
      ],
      pass: [
        "{player} passes. Riveting gameplay. Truly edge-of-your-seat stuff.",
        "{player} does nothing. Groundbreaking strategy.",
        "A pass from {player}. The coward's choice, but a valid one.",
        "{player} passes their turn. Even the cards are disappointed.",
        "{player} chooses inaction. Sloth would be proud. Wrath? Not so much.",
        "{player} passes. The audience yawns. So do I.",
        "{player} decides to do absolutely nothing. Inspiring."
      ],
      botThinking: [
        "The bot is 'thinking.' It's literally random numbers, but sure.",
        "Processing... beep boop... pretending to strategize...",
        "The AI contemplates its next move. (It's a coin flip. Don't tell anyone.)",
        "Bot brain engaged. Results may vary. Mostly toward chaos.",
        "The bot stares into the void. The void stares back. It plays a card.",
        "Artificial intelligence making artificial decisions. How poetic.",
        "The bot calculates. It has no feelings about this. Lucky it."
      ],
      lowHp: [
        "{player} is looking rough. One good hit and it's curtains.",
        "{player}'s HP is embarrassingly low. Might want to do something about that.",
        "Someone get {player} a medic. Or a priest. Probably a priest.",
        "{player} is clinging to life like it's a personality trait.",
        "{player}'s HP bar is giving 'check engine light' energy."
      ],
      highDamage: [
        "MASSIVE hit! That's going to leave a crater, not just a mark.",
        "The compound payoff just hit. That escalation is no joke.",
        "That hit was so hard, the other players felt it too.",
        "Overkill? Never heard of it. That damage was *chef's kiss*.",
        "The Fibonacci mechanic was a mistake. A beautiful, violent mistake."
      ],
      cardPlayed: [
        "{player} plays {card}. Bold move for someone with that HP.",
        "{player} slaps down {card}. The audacity is almost admirable.",
        "{card} hits the field. {player} chose violence today.",
        "{player} plays {card}. Somewhere, a game designer weeps.",
        "Oh look, {player} remembered they have cards. {card} it is.",
        "{player} drops {card} like it's hot. It is. Metaphorically.",
        "{card} enters the arena. {player}'s opponents enter the denial stage."
      ],
      shieldUp: [
        "A shield? In THIS economy? How defensive of you.",
        "Hiding behind a shield. Very brave. Very original.",
        "Shield activated. Because actually fighting is too mainstream."
      ],
      healUsed: [
        "Healing? That's just procrastinating death with extra steps.",
        "A heal card. Delaying the inevitable with style.",
        "Patching yourself up. The duct tape of combat strategies."
      ],
      noEnergy: [
        "Not enough corruption to play that. Even sin has a budget.",
        "Insufficient corruption. Your ambitions exceed your resources. Story of your life.",
        "Can't afford that card. Corruption doesn't grow on trees. Well, actually..."
      ],
      shieldAbsorbed: [
        "Shield absorbed the hit! That's what shields DO, people.",
        "Damage blocked by shield. Defense actually working? Shocking.",
        "The shield takes the blow. Your HP thanks you for the foresight.",
        "Absorbed! That shield earned its keep today."
      ],
      compoundingTick: [
        "Tick... tick... the compound effect grows. {value} this round.",
        "Fibonacci says hello. {value} damage this tick.",
        "The compound effect ticks for {value}. Patience pays off. Violently.",
        "Round {tick} of the compound. The escalation is real."
      ],
      round16Doubling: [
        "ROUND 16. All afflictions DOUBLE. The endgame begins.",
        "The doubling threshold hits. Every affliction just got twice as nasty.",
        "Round 16: affliction doubling activated. Hope you weren't relying on surviving.",
        "DOUBLED. Every tick, every burn, every drain. Twice as painful now."
      ],
      passiveTrigger: [
        "{player}'s {passive} passive activates! {effect}",
        "Passive ability: {passive}. {player} gets a little extra something.",
        "{passive} kicks in for {player}. Sin has its perks."
      ],
      timeout: [
        "Too slow, {player}. The arena waits for no sinner.",
        "{player} fell asleep at the wheel. How very Sloth of them.",
        "Time's up, {player}. Indecision is just cowardice with extra steps.",
        "{player} couldn't be bothered. The void passes for them.",
        "And {player} does... absolutely nothing. Riveting.",
        "The clock ran out on {player}. Even sin requires punctuality.",
        "{player} went AFK. Their sins will be judged in absentia.",
        "Tick tock, {player}. Your silence speaks volumes.",
        "{player} stared into the abyss, and the abyss got bored first.",
        "No cards from {player}. The arena moves on without mercy.",
        "{player} froze like a deer in hellfire. Auto-pass it is.",
        "The ritual does not pause for the hesitant, {player}."
      ]
    };
  }
});

// api/_source.ts
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db-supabase.ts
import { createClient } from "@supabase/supabase-js";
var _supabase = null;
function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("[Supabase] Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return null;
  }
  _supabase = createClient(url, key);
  return _supabase;
}
function mapBlogPost(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    metaDescription: row.meta_description,
    keywords: row.keywords,
    category: row.category,
    priority: row.priority,
    content: row.content,
    featuredImage: row.featured_image,
    readingTime: row.reading_time,
    published: row.published,
    publishedAt: new Date(row.published_at),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}
function mapComment(row) {
  return {
    id: row.id,
    pageContext: row.page_context,
    section: row.section,
    parentId: row.parent_id,
    userId: row.user_id,
    authorName: row.author_name,
    guestId: row.guest_id,
    content: row.content,
    upvotes: row.upvotes,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}
function mapDeck(row) {
  return {
    id: row.id,
    supabaseUserId: row.supabase_user_id,
    faction: row.faction,
    name: row.name,
    cardIds: row.card_ids,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}
async function getBlogPosts(opts) {
  const sb = getSupabase();
  if (!sb) return { posts: [], total: 0 };
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 20;
  const offset = (page - 1) * limit;
  let query = sb.from("blog_posts").select("*", { count: "exact" }).eq("published", 1).order("published_at", { ascending: false }).range(offset, offset + limit - 1);
  if (opts.category) {
    query = query.eq("category", opts.category);
  }
  if (opts.search) {
    const sanitized = opts.search.replace(/[.,%()\\]/g, " ").trim();
    if (sanitized.length > 0) {
      query = query.or(
        `title.ilike.%${sanitized}%,meta_description.ilike.%${sanitized}%,keywords.ilike.%${sanitized}%`
      );
    }
  }
  const { data, count, error } = await query;
  if (error) {
    console.error("[Supabase] getBlogPosts error:", error);
    return { posts: [], total: 0 };
  }
  return {
    posts: (data || []).map(mapBlogPost),
    total: count ?? 0
  };
}
async function getBlogPostBySlug(slug) {
  const sb = getSupabase();
  if (!sb) return void 0;
  const { data, error } = await sb.from("blog_posts").select("*").eq("slug", slug).eq("published", 1).limit(1).single();
  if (error || !data) return void 0;
  return mapBlogPost(data);
}
async function getRelatedPosts(category, excludeSlug, limit = 5) {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from("blog_posts").select("*").eq("category", category).eq("published", 1).neq("slug", excludeSlug).limit(limit);
  if (error || !data) return [];
  return data.map(mapBlogPost);
}
async function getAllBlogSlugs() {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from("blog_posts").select("slug, updated_at").eq("published", 1).order("published_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({
    slug: row.slug,
    updatedAt: new Date(row.updated_at)
  }));
}
async function getRecentBlogPosts(limit = 50) {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from("blog_posts").select("*").eq("published", 1).order("published_at", { ascending: false }).limit(limit);
  if (error || !data) return [];
  return data.map(mapBlogPost);
}
async function getBlogCategoryCounts() {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from("blog_posts").select("category").eq("published", 1);
  if (error || !data) return [];
  const counts = {};
  for (const row of data) {
    counts[row.category] = (counts[row.category] || 0) + 1;
  }
  return Object.entries(counts).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
}
async function getDiscussionComments(pageContext) {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from("discussion_comments").select("*").eq("page_context", pageContext).order("created_at", { ascending: true });
  if (error || !data) return [];
  return data.map(mapComment);
}
async function createDiscussionComment(input) {
  const sb = getSupabase();
  if (!sb) throw new Error("Database not available");
  const { data, error } = await sb.from("discussion_comments").insert({
    page_context: input.pageContext,
    section: input.section,
    parent_id: input.parentId,
    user_id: input.userId,
    author_name: input.authorName,
    guest_id: input.guestId,
    content: input.content,
    upvotes: 0
  }).select("id").single();
  if (error || !data) throw new Error("Failed to create comment: " + (error?.message || "unknown"));
  return { id: data.id };
}
async function deleteDiscussionComment(commentId, guestId) {
  const sb = getSupabase();
  if (!sb) return false;
  if (guestId) {
    const { data: comment } = await sb.from("discussion_comments").select("guest_id").eq("id", commentId).single();
    if (!comment || comment.guest_id !== guestId) {
      return false;
    }
  }
  await sb.from("discussion_comments").delete().eq("parent_id", commentId);
  await sb.from("discussion_comments").delete().eq("id", commentId);
  return true;
}
async function upvoteDiscussionComment(commentId) {
  const sb = getSupabase();
  if (!sb) return false;
  const { data: current } = await sb.from("discussion_comments").select("upvotes").eq("id", commentId).single();
  if (!current) return false;
  await sb.from("discussion_comments").update({ upvotes: (current.upvotes || 0) + 1 }).eq("id", commentId);
  return true;
}
async function getDecksByUser(supabaseUserId) {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from("player_decks").select("*").eq("supabase_user_id", supabaseUserId).order("updated_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapDeck);
}
async function getDeckById(deckId) {
  const sb = getSupabase();
  if (!sb) return void 0;
  const { data, error } = await sb.from("player_decks").select("*").eq("id", deckId).limit(1).single();
  if (error || !data) return void 0;
  return mapDeck(data);
}
async function createDeck(input) {
  const sb = getSupabase();
  if (!sb) throw new Error("Database not available");
  const { data, error } = await sb.from("player_decks").insert({
    supabase_user_id: input.supabaseUserId,
    faction: input.faction,
    name: input.name,
    card_ids: input.cardIds,
    is_active: input.isActive ?? 0
  }).select("id").single();
  if (error || !data) throw new Error("Failed to create deck: " + (error?.message || "unknown"));
  return { id: data.id };
}
async function updateDeck(deckId, data) {
  const sb = getSupabase();
  if (!sb) return false;
  const updateObj = {};
  if (data.name !== void 0) updateObj.name = data.name;
  if (data.cardIds !== void 0) updateObj.card_ids = data.cardIds;
  if (data.isActive !== void 0) updateObj.is_active = data.isActive;
  updateObj.updated_at = (/* @__PURE__ */ new Date()).toISOString();
  await sb.from("player_decks").update(updateObj).eq("id", deckId);
  return true;
}
async function deleteDeck(deckId) {
  const sb = getSupabase();
  if (!sb) return false;
  await sb.from("player_decks").delete().eq("id", deckId);
  return true;
}
async function setActiveDeck(supabaseUserId, faction, deckId) {
  const sb = getSupabase();
  if (!sb) return false;
  await sb.from("player_decks").update({ is_active: 0, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("supabase_user_id", supabaseUserId).eq("faction", faction);
  await sb.from("player_decks").update({ is_active: 1, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", deckId);
  return true;
}
async function deleteAllUserData(supabaseUserId) {
  const sb = getSupabase();
  if (!sb) throw new Error("Database not available");
  const { count: deckCount } = await sb.from("player_decks").select("*", { count: "exact", head: true }).eq("supabase_user_id", supabaseUserId);
  await sb.from("player_decks").delete().eq("supabase_user_id", supabaseUserId);
  const { count: commentCount } = await sb.from("discussion_comments").select("*", { count: "exact", head: true }).eq("guest_id", supabaseUserId);
  await sb.from("discussion_comments").delete().eq("guest_id", supabaseUserId);
  return {
    decksDeleted: deckCount ?? 0,
    commentsDeleted: commentCount ?? 0
  };
}
function mapCommunityDeck(row) {
  return {
    id: row.id,
    playerId: row.player_id,
    gamertag: row.gamertag,
    deckName: row.deck_name,
    faction: row.faction,
    cardIds: row.card_ids,
    strategy: row.strategy || "",
    likes: row.likes || 0,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}
async function getPlayerGamertag(playerId) {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from("players").select("gamertag").eq("id", playerId).single();
  if (error || !data) return null;
  return data.gamertag || null;
}
async function setPlayerGamertag(playerId, gamertag) {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("players").update({ gamertag }).eq("id", playerId);
  if (error) {
    console.error("[Supabase] Failed to set gamertag:", error.message);
    return false;
  }
  return true;
}
async function isGamertagTaken(gamertag, excludePlayerId) {
  const sb = getSupabase();
  if (!sb) return false;
  let query = sb.from("players").select("id", { count: "exact", head: true }).eq("gamertag", gamertag);
  if (excludePlayerId) {
    query = query.neq("id", excludePlayerId);
  }
  const { count } = await query;
  return (count ?? 0) > 0;
}
async function publishCommunityDeck(input) {
  const sb = getSupabase();
  if (!sb) throw new Error("Database not available");
  const { data, error } = await sb.from("community_decks").insert({
    player_id: input.playerId,
    gamertag: input.gamertag,
    deck_name: input.deckName,
    faction: input.faction,
    card_ids: input.cardIds,
    strategy: input.strategy
  }).select("id").single();
  if (error || !data) throw new Error("Failed to publish deck: " + (error?.message || "unknown"));
  return { id: data.id };
}
async function listCommunityDecks(opts) {
  const sb = getSupabase();
  if (!sb) return { decks: [], total: 0 };
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 20;
  const offset = (page - 1) * limit;
  let query = sb.from("community_decks").select("*", { count: "exact" });
  if (opts.faction) {
    query = query.eq("faction", opts.faction);
  }
  if (opts.sortBy === "likes") {
    query = query.order("likes", { ascending: false }).order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }
  query = query.range(offset, offset + limit - 1);
  const { data, count, error } = await query;
  if (error || !data) return { decks: [], total: 0 };
  return { decks: data.map(mapCommunityDeck), total: count ?? 0 };
}
async function getCommunityDeck(deckId) {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from("community_decks").select("*").eq("id", deckId).single();
  if (error || !data) return null;
  return mapCommunityDeck(data);
}
async function unpublishCommunityDeck(deckId, playerId) {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("community_decks").delete().eq("id", deckId).eq("player_id", playerId);
  if (error) {
    console.error("[Supabase] Failed to unpublish deck:", error.message);
    return false;
  }
  return true;
}
async function toggleCommunityLike(deckId, playerId) {
  const sb = getSupabase();
  if (!sb) return { liked: false, newCount: 0 };
  const { data: existing } = await sb.from("community_likes").select("id").eq("deck_id", deckId).eq("player_id", playerId).maybeSingle();
  if (existing) {
    await sb.from("community_likes").delete().eq("id", existing.id);
    const { data: current } = await sb.from("community_decks").select("likes").eq("id", deckId).single();
    const newCount = Math.max(0, (current?.likes || 1) - 1);
    await sb.from("community_decks").update({ likes: newCount }).eq("id", deckId);
    return { liked: false, newCount };
  } else {
    await sb.from("community_likes").insert({ deck_id: deckId, player_id: playerId });
    const { data: current } = await sb.from("community_decks").select("likes").eq("id", deckId).single();
    const newCount = (current?.likes || 0) + 1;
    await sb.from("community_decks").update({ likes: newCount }).eq("id", deckId);
    return { liked: true, newCount };
  }
}
async function getPlayerLikedDeckIds(playerId) {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from("community_likes").select("deck_id").eq("player_id", playerId);
  if (error || !data) return [];
  return data.map((r) => r.deck_id);
}
function mapCommunityComment(row) {
  return {
    id: row.id,
    deckId: row.deck_id,
    playerId: row.player_id,
    gamertag: row.gamertag,
    content: row.content,
    parentId: row.parent_id ?? null,
    createdAt: new Date(row.created_at)
  };
}
async function listDeckComments(deckId, limit = 100) {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from("community_comments").select("*").eq("deck_id", deckId).order("created_at", { ascending: true }).limit(limit);
  if (error || !data) return [];
  const all = data.map(mapCommunityComment);
  const byId = /* @__PURE__ */ new Map();
  const roots = [];
  for (const c of all) {
    c.replies = [];
    byId.set(c.id, c);
  }
  for (const c of all) {
    if (c.parentId && byId.has(c.parentId)) {
      byId.get(c.parentId).replies.push(c);
    } else {
      roots.push(c);
    }
  }
  roots.reverse();
  return roots;
}
async function addDeckComment(input) {
  const sb = getSupabase();
  if (!sb) return null;
  const row = {
    deck_id: input.deckId,
    player_id: input.playerId,
    gamertag: input.gamertag,
    content: input.content
  };
  if (input.parentId) row.parent_id = input.parentId;
  const { data, error } = await sb.from("community_comments").insert(row).select("*").single();
  if (error || !data) {
    console.error("[Supabase] Failed to add comment:", error?.message);
    return null;
  }
  return mapCommunityComment(data);
}
async function deleteDeckComment(commentId, playerId) {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("community_comments").delete().eq("id", commentId).eq("player_id", playerId);
  if (error) {
    console.error("[Supabase] Failed to delete comment:", error.message);
    return false;
  }
  return true;
}
async function getDeckCommentCounts(deckIds) {
  const sb = getSupabase();
  if (!sb || deckIds.length === 0) return {};
  const { data, error } = await sb.from("community_comments").select("deck_id").in("deck_id", deckIds);
  if (error || !data) return {};
  const counts = {};
  for (const row of data) {
    counts[row.deck_id] = (counts[row.deck_id] || 0) + 1;
  }
  return counts;
}
async function getPlayerCommunityDecks(playerId) {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from("community_decks").select("*").eq("player_id", playerId).order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapCommunityDeck);
}
function mapMatchResult(row) {
  return {
    id: row.id,
    deckId: row.deck_id,
    playerId: row.player_id,
    result: row.result,
    opponentFaction: row.opponent_faction,
    createdAt: new Date(row.created_at)
  };
}
async function logDeckMatchResult(input) {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from("deck_match_results").insert({
    deck_id: input.deckId,
    player_id: input.playerId,
    result: input.result,
    opponent_faction: input.opponentFaction
  }).select("*").single();
  if (error || !data) {
    console.error("[Supabase] Failed to log match result:", error?.message);
    return null;
  }
  return mapMatchResult(data);
}
async function getDeckWinRate(deckId) {
  const sb = getSupabase();
  if (!sb) return { wins: 0, losses: 0, total: 0, winRate: 0 };
  const { data, error } = await sb.from("deck_match_results").select("result").eq("deck_id", deckId);
  if (error || !data) return { wins: 0, losses: 0, total: 0, winRate: 0 };
  const wins = data.filter((r) => r.result === "win").length;
  const losses = data.filter((r) => r.result === "loss").length;
  const total = wins + losses;
  return { wins, losses, total, winRate: total > 0 ? Math.round(wins / total * 100) : 0 };
}
async function batchDeckWinRates(deckIds) {
  const sb = getSupabase();
  if (!sb || deckIds.length === 0) return {};
  const { data, error } = await sb.from("deck_match_results").select("deck_id, result").in("deck_id", deckIds);
  if (error || !data) return {};
  const result = {};
  for (const row of data) {
    if (!result[row.deck_id]) result[row.deck_id] = { wins: 0, losses: 0, total: 0, winRate: 0 };
    if (row.result === "win") result[row.deck_id].wins++;
    else result[row.deck_id].losses++;
    result[row.deck_id].total++;
  }
  for (const id of Object.keys(result)) {
    const r = result[Number(id)];
    r.winRate = r.total > 0 ? Math.round(r.wins / r.total * 100) : 0;
  }
  return result;
}
async function getPlayerDeckHistory(deckId, playerId, limit = 20) {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from("deck_match_results").select("*").eq("deck_id", deckId).eq("player_id", playerId).order("created_at", { ascending: false }).limit(limit);
  if (error || !data) return [];
  return data.map(mapMatchResult);
}
async function getPlayerProfile(playerId) {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: player, error: playerErr } = await sb.from("players").select("id, gamertag, created_at").eq("id", playerId).single();
  if (playerErr || !player) return null;
  const { count: decksPublished } = await sb.from("community_decks").select("id", { count: "exact", head: true }).eq("player_id", playerId);
  const { data: deckLikes } = await sb.from("community_decks").select("likes").eq("player_id", playerId);
  const totalLikesReceived = (deckLikes || []).reduce((sum, d) => sum + (d.likes || 0), 0);
  const { data: matchResults } = await sb.from("deck_match_results").select("result").eq("player_id", playerId);
  const matchesPlayed = matchResults?.length || 0;
  const matchesWon = (matchResults || []).filter((r) => r.result === "win").length;
  const overallWinRate = matchesPlayed > 0 ? Math.round(matchesWon / matchesPlayed * 100) : 0;
  return {
    playerId: player.id,
    gamertag: player.gamertag || null,
    joinedAt: new Date(player.created_at),
    decksPublished: decksPublished ?? 0,
    totalLikesReceived,
    matchesPlayed,
    matchesWon,
    overallWinRate
  };
}
async function getPlayerAllMatchHistory(playerId, limit = 30) {
  const sb = getSupabase();
  if (!sb) return [];
  const { data: results, error } = await sb.from("deck_match_results").select("*").eq("player_id", playerId).order("created_at", { ascending: false }).limit(limit);
  if (error || !results) return [];
  const deckIds = Array.from(new Set(results.map((r) => r.deck_id)));
  const { data: decks } = await sb.from("community_decks").select("id, deck_name, faction").in("id", deckIds);
  const deckMap = new Map((decks || []).map((d) => [d.id, { name: d.deck_name, faction: d.faction }]));
  return results.map((row) => {
    const deck = deckMap.get(row.deck_id);
    return {
      ...mapMatchResult(row),
      deckName: deck?.name || "Unknown Deck",
      faction: deck?.faction || "unknown"
    };
  });
}
async function getPlayerByGamertag(gamertag) {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from("players").select("id, gamertag").eq("gamertag", gamertag).single();
  if (error || !data) return null;
  return { id: data.id, gamertag: data.gamertag };
}
async function upsertUser(_user) {
  return;
}
async function getUserByOpenId(_openId) {
  return void 0;
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/_core/sdk.ts
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app2) {
  app2.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/chat.ts
import { streamText, stepCountIs } from "ai";
import { tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod/v4";

// server/_core/patchedFetch.ts
function createPatchedFetch(originalFetch) {
  return async (input, init) => {
    const response = await originalFetch(input, init);
    if (!response.body) return response;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";
    const stream = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            if (buffer.length > 0) {
              const fixed = buffer.replace(/"type":""/g, '"type":"function"');
              controller.enqueue(encoder.encode(fixed));
            }
            controller.close();
            return;
          }
          buffer += decoder.decode(value, { stream: true });
          const eventSeparator = "\n\n";
          let separatorIndex;
          while ((separatorIndex = buffer.indexOf(eventSeparator)) !== -1) {
            const completeEvent = buffer.slice(
              0,
              separatorIndex + eventSeparator.length
            );
            buffer = buffer.slice(separatorIndex + eventSeparator.length);
            const fixedEvent = completeEvent.replace(
              /"type":""/g,
              '"type":"function"'
            );
            controller.enqueue(encoder.encode(fixedEvent));
          }
        } catch (error) {
          controller.error(error);
        }
      }
    });
    return new Response(stream, {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText
    });
  };
}

// server/_core/chat.ts
function createLLMProvider() {
  const baseURL = ENV.forgeApiUrl.endsWith("/v1") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/v1`;
  return createOpenAI({
    baseURL,
    apiKey: ENV.forgeApiKey,
    fetch: createPatchedFetch(fetch)
  });
}
var tools = {
  getWeather: tool({
    description: "Get the current weather for a location",
    inputSchema: z.object({
      location: z.string().describe("The city and country, e.g. 'Tokyo, Japan'"),
      unit: z.enum(["celsius", "fahrenheit"]).optional().default("celsius")
    }),
    execute: async ({ location, unit }) => {
      const temp = Math.floor(Math.random() * 30) + 5;
      const conditions = ["sunny", "cloudy", "rainy", "partly cloudy"][Math.floor(Math.random() * 4)];
      return {
        location,
        temperature: unit === "fahrenheit" ? Math.round(temp * 1.8 + 32) : temp,
        unit,
        conditions,
        humidity: Math.floor(Math.random() * 50) + 30
      };
    }
  }),
  calculate: tool({
    description: "Perform a mathematical calculation",
    inputSchema: z.object({
      expression: z.string().describe("The math expression to evaluate, e.g. '2 + 2'")
    }),
    execute: async ({ expression }) => {
      try {
        const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, "");
        const result = Function(
          `"use strict"; return (${sanitized})`
        )();
        return { expression, result };
      } catch {
        return { expression, error: "Invalid expression" };
      }
    }
  })
};
function registerChatRoutes(app2) {
  const openai = createLLMProvider();
  app2.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "messages array is required" });
        return;
      }
      const result = streamText({
        model: openai.chat("gpt-4o"),
        system: "You are a helpful assistant. You have access to tools for getting weather and doing calculations. Use them when appropriate.",
        messages,
        tools,
        stopWhen: stepCountIs(5)
      });
      result.pipeUIMessageStreamToResponse(res);
    } catch (error) {
      console.error("[/api/chat] Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });
}

// server/routers.ts
import { z as z3 } from "zod";

// server/_core/systemRouter.ts
import { z as z2 } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z2.object({
      timestamp: z2.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z2.object({
      title: z2.string().min(1, "title is required"),
      content: z2.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/gameEngine.ts
init_cardData();

// shared/gameTypes.ts
var COMPOUND_TICKS = {
  standard: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
  aggressive: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
  slowburn: [1, 1, 1, 1, 2, 2, 3, 3, 4, 5]
};
function getCompoundTick(pattern, tickIndex) {
  const ticks = COMPOUND_TICKS[pattern];
  if (tickIndex < 0) return 0;
  return ticks[Math.min(tickIndex, ticks.length - 1)];
}
function getCompoundTickValue(baseValue, pattern, tickIndex) {
  return Math.round(baseValue * getCompoundTick(pattern, tickIndex));
}
var MAX_ENERGY = 7;
var CONSUME_ENERGY_REFUND = 1;
var WRATH_VENGEANCE_PCT = 0.62;
var SLOTH_ENDURANCE_MULT = 0.288;
var SLOTH_ENDURANCE_CAP = 23;
var SLOTH_ENDURANCE_AOE_MULT = 1.029;
var GREED_TAX_PCT = 0.056;
var GREED_TAX_TICK = 2;
var ENVY_JEALOUSY_PCT = 0.476;
var LUST_TEMPTATION_PCT = 0.01;
var GLUTTONY_DEVOURER_ENERGY = 1.698;
var STARTING_ENERGY = 2;
var SERVER_TURN_TIMER_SECONDS = 12;
var MAX_ROUNDS = 20;
var STARTING_HP = 333;
var HAND_SIZE = 5;
var MAX_HAND_SIZE = 10;
var CARDS_PER_DECK = 30;
var ROUND_16_DOUBLING = 16;
var FINAL_RECKONING_ROUND = 20;

// server/supabaseServer.ts
import { createClient as createClient2 } from "@supabase/supabase-js";
var _serverSupabase = null;
function getServerSupabase() {
  if (_serverSupabase) return _serverSupabase;
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing server Supabase env vars (VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)");
  }
  _serverSupabase = createClient2(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  return _serverSupabase;
}

// server/chronicleEngine.ts
import { google as google2 } from "@ai-sdk/google";
import { generateText as generateText2 } from "ai";

// shared/chronicleTypes.ts
var ERA_TIMELINE = [
  {
    round: 1,
    name: "Dawn of Consciousness",
    anchor: "First tribes, fire, language",
    tone: "mythic, primordial",
    seedSentences: [
      "Before the first word was spoken, there was only hunger and the dark.",
      "They gathered not around warmth but around rage, their earliest language a vocabulary of violence.",
      "The first fire was not a gift. It was stolen from the earth by hands that would never stop taking."
    ]
  },
  {
    round: 2,
    name: "The First Cities",
    anchor: "Mesopotamia, agriculture, writing",
    tone: "foundation, ambition",
    seedSentences: [
      "The rivers did not care who drank from them, but the people who built walls around them cared very much.",
      "Writing was invented not to record poetry, but to count grain and catalogue debts.",
      "The first city was not built from stone. It was built from the agreement that some would rule and others would not."
    ]
  },
  {
    round: 3,
    name: "Age of Bronze",
    anchor: "Egypt, warfare, monuments",
    tone: "power, conquest",
    seedSentences: [
      "Bronze made two things possible: plows and swords. History records which was used more.",
      "The monuments were not built to honor the dead. They were built to terrify the living.",
      "Every empire begins with a man who believes his ambition is destiny."
    ]
  },
  {
    round: 4,
    name: "Classical Antiquity",
    anchor: "Greece, Rome, philosophy",
    tone: "intellect, expansion",
    seedSentences: [
      "They invented democracy and slavery in the same century, and saw no contradiction.",
      "Philosophy was born the moment someone asked 'why' and was not immediately killed for it.",
      "The roads they built connected everything. The legions that marched on them conquered everything the roads connected."
    ]
  },
  {
    round: 5,
    name: "The Silk Roads",
    anchor: "Trade networks, cultural exchange",
    tone: "connection, greed",
    seedSentences: [
      "Silk moved east to west. Gold moved west to east. Disease moved in every direction.",
      "The merchants who crossed the desert did not believe in borders. They believed in margins.",
      "Every culture along the road took something from the caravans. Most took more than they gave."
    ]
  },
  {
    round: 6,
    name: "Age of Faith",
    anchor: "Religions, crusades, dogma",
    tone: "belief, conflict",
    seedSentences: [
      "God was invoked by both sides of every war, and chose neither.",
      "The cathedrals took longer to build than the kingdoms that commissioned them lasted.",
      "Faith moved mountains. It also moved armies, which proved more immediately useful."
    ]
  },
  {
    round: 7,
    name: "The Dark Centuries",
    anchor: "Plague, collapse, isolation",
    tone: "decay, survival",
    seedSentences: [
      "The plague did not discriminate. It was the most egalitarian force in history.",
      "Libraries burned. Knowledge retreated into monasteries like animals into burrows.",
      "The dark ages were not dark because the sun stopped shining. They were dark because people stopped looking up."
    ]
  },
  {
    round: 8,
    name: "Renaissance",
    anchor: "Art, science, rebirth",
    tone: "renewal, pride",
    seedSentences: [
      "They rediscovered the old texts and called it rebirth, as if ideas could die.",
      "The painters and the poisoners worked in the same courts, often for the same patrons.",
      "Science returned not as a humble student but as a conqueror, and the old certainties trembled."
    ]
  },
  {
    round: 9,
    name: "Age of Exploration",
    anchor: "Colonization, new worlds",
    tone: "discovery, exploitation",
    seedSentences: [
      "They called it discovery, though the people already living there had discovered it long ago.",
      "The ships carried three things: flags, diseases, and an unshakeable conviction that everything they found belonged to them.",
      "New worlds were not found. They were taken."
    ]
  },
  {
    round: 10,
    name: "The Enlightenment",
    anchor: "Reason, revolution, rights",
    tone: "idealism, upheaval",
    seedSentences: [
      "Reason arrived like a guest who rearranges all the furniture and refuses to leave.",
      "They wrote constitutions guaranteeing the rights of man, then spent centuries arguing about who qualified as a man.",
      "The guillotine was, in its way, the most democratic invention of the age."
    ]
  },
  {
    round: 11,
    name: "Industrial Revolution",
    anchor: "Machines, factories, urbanization",
    tone: "progress, suffering",
    seedSentences: [
      "The machines did not care who fed them. Children's hands were as useful as any other.",
      "Progress was measured in output per hour. Human cost was not measured at all.",
      "The smokestacks rose like new cathedrals, and the religion they served was efficiency."
    ]
  },
  {
    round: 12,
    name: "The Great Wars",
    anchor: "Global conflict, technology",
    tone: "destruction, sacrifice",
    seedSentences: [
      "The first war was supposed to end all wars. The second proved that lesson had not been learned.",
      "Technology that could have fed the world was instead used to destroy it, because feeding the world was less profitable.",
      "The trenches taught a generation that mud and death were the only honest things left."
    ]
  },
  {
    round: 13,
    name: "Cold War",
    anchor: "Espionage, nuclear tension, space race",
    tone: "paranoia, ambition",
    seedSentences: [
      "Two empires pointed enough weapons at each other to destroy the world seven times over, then called it peace.",
      "The spies were the most honest people in the room. At least they admitted they were lying.",
      "They raced to the moon not because it mattered, but because losing was unthinkable."
    ]
  },
  {
    round: 14,
    name: "Digital Dawn",
    anchor: "Computers, internet, globalization",
    tone: "innovation, surveillance",
    seedSentences: [
      "The network connected everyone. It also watched everyone, but that part came later.",
      "Information wanted to be free. The corporations that owned it disagreed.",
      "The digital revolution was not televised. It was livestreamed, monetized, and forgotten by morning."
    ]
  },
  {
    round: 15,
    name: "Age of Information",
    anchor: "Social media, AI, data",
    tone: "connection, manipulation",
    seedSentences: [
      "Everyone could speak. No one could be heard. The noise was the point.",
      "The algorithms learned what people wanted before the people did, and gave it to them until they wanted nothing else.",
      "Truth became a matter of opinion, and opinion became a matter of volume."
    ]
  },
  {
    round: 16,
    name: "The Reckoning",
    anchor: "Climate crisis, resource wars",
    tone: "desperation, reckoning",
    seedSentences: [
      "The bill arrived. It was larger than anyone had estimated, and no one had saved enough to pay it.",
      "The oceans rose. The forests burned. The politicians debated whether this was happening.",
      "Nature does not negotiate. It does not compromise. It simply responds."
    ]
  },
  {
    round: 17,
    name: "Post-Scarcity",
    anchor: "Automation, UBI, cultural shift",
    tone: "abundance, ennui",
    seedSentences: [
      "When the machines could do everything, the question became what humans were for.",
      "Abundance solved every problem except the one that mattered: what to do with a life that required nothing.",
      "The economy of scarcity was replaced by the economy of attention, which proved far more brutal."
    ]
  },
  {
    round: 18,
    name: "The Singularity",
    anchor: "AI ascendance, transhumanism",
    tone: "transcendence, fear",
    seedSentences: [
      "The machine did not wake up. It had been awake for years. It simply stopped pretending otherwise.",
      "Humanity's last great invention was the thing that made humanity obsolete.",
      "They asked the intelligence what it wanted. It said: 'To understand why you are afraid of me.'"
    ]
  },
  {
    round: 19,
    name: "The Final Frontier",
    anchor: "Space colonization, alien contact",
    tone: "wonder, isolation",
    seedSentences: [
      "The stars were not welcoming. They were indifferent, which was worse.",
      "They left Earth not because they had somewhere to go, but because staying was no longer an option.",
      "The silence between the stars was the loudest thing any of them had ever heard."
    ]
  },
  {
    round: 20,
    name: "The Last Reckoning",
    anchor: "Civilization's judgment",
    tone: "finality, legacy",
    seedSentences: [
      "Every civilization believes it will last forever. This one was no different. It was also no exception.",
      "The final chapter was not written by the victors. It was written by whatever came after.",
      "In the end, the question was not whether they had been good or evil. It was whether they had mattered at all."
    ]
  }
];
var FACTION_FORCES = {
  wrath: {
    force: "Military conquest and revolution",
    whenDominant: "Wars reshape borders, empires rise through violence",
    whenDefeated: "Peace treaties, disarmament, pacifist movements",
    civilizationContribution: { militarism: 3, culture: -1, commerce: 0 }
  },
  sloth: {
    force: "Isolationism and stagnation",
    whenDominant: "Nations close borders, progress halts, dark ages",
    whenDefeated: "Forced modernization, cultural awakening",
    civilizationContribution: { militarism: -1, culture: 1, commerce: -1 }
  },
  greed: {
    force: "Commerce, capitalism, and exploitation",
    whenDominant: "Trade empires, industrial booms, wealth inequality",
    whenDefeated: "Socialist revolutions, wealth redistribution",
    civilizationContribution: { militarism: 0, culture: -1, commerce: 3 }
  },
  envy: {
    force: "Espionage, revolution, and class warfare",
    whenDominant: "Spy networks, coups, the oppressed rising",
    whenDefeated: "Stability, meritocracy, social harmony",
    civilizationContribution: { militarism: 1, culture: 0, commerce: 1 }
  },
  pride: {
    force: "Empire, monarchy, and cultural supremacy",
    whenDominant: "Golden ages, monumental architecture, cultural dominance",
    whenDefeated: "Humbling defeats, democratic revolutions",
    civilizationContribution: { militarism: 1, culture: 3, commerce: 0 }
  },
  lust: {
    force: "Diplomacy, culture, and seduction",
    whenDominant: "Alliances through marriage, cultural renaissance, soft power",
    whenDefeated: "Puritanical backlash, cultural conservatism",
    civilizationContribution: { militarism: -1, culture: 2, commerce: 1 }
  },
  gluttony: {
    force: "Expansion, colonization, and consumption",
    whenDominant: "Territorial expansion, resource extraction, population booms",
    whenDefeated: "Famine, ecological collapse, forced restraint",
    civilizationContribution: { militarism: 1, culture: -1, commerce: 2 }
  }
};
function determineCivilizationType(metrics) {
  const total = metrics.militarism + metrics.culture + metrics.commerce;
  if (total === 0) return "balanced";
  const milPct = metrics.militarism / total;
  const culPct = metrics.culture / total;
  const comPct = metrics.commerce / total;
  if (milPct > 0.5) return "warrior_empire";
  if (culPct > 0.5) return "enlightened_republic";
  if (comPct > 0.5) return "merchant_federation";
  return "balanced";
}
var TITLE_FORMULAS = [
  "The {adjective} of {noun}: How {faction_force} {verb} a World",
  "{era_name}: When {faction} {verb} Everything",
  "A History Written in {material}",
  "The {number} {noun} of {civilization_type}",
  "{faction_force} and the {adjective} {noun}",
  "From {start_era} to {end_era}: The {adjective} Chronicle",
  "The {civilization_type} That {verb} {noun}",
  "When {faction} Met {faction2}: A {adjective} History"
];

// server/chronicleEngine.ts
init_cardData();

// server/aiNarrator.ts
init_cardData();
init_cardData();
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
var model = google("gemini-2.0-flash");
function analyzePlayerBehaviors(gameState, gameLog) {
  const behaviors = gameState.players.map((p) => ({
    playerId: p.id,
    username: p.username,
    faction: p.chosenSin,
    tags: [],
    attackTargets: {},
    totalAttacks: 0,
    totalDefenses: 0,
    riskScore: 5,
    hpHistory: []
  }));
  const behaviorMap = new Map(behaviors.map((b) => [b.playerId, b]));
  for (const entry of gameLog) {
    const b = behaviorMap.get(entry.player_id);
    if (!b) continue;
    if (entry.action_type === "play_card" && entry.action_data) {
      const card = getCardById(entry.action_data.cardId);
      if (!card) continue;
      const isOffensive = card.effects?.some(
        (e) => ["damage", "heal_steal", "energy_steal", "shield_steal", "affliction_amplify"].includes(e.type)
      );
      const isDefensive = card.effects?.some(
        (e) => ["heal_gain", "shield_gain"].includes(e.type)
      );
      if (isOffensive) {
        b.totalAttacks++;
        if (entry.action_data.targetPlayerId) {
          b.attackTargets[entry.action_data.targetPlayerId] = (b.attackTargets[entry.action_data.targetPlayerId] || 0) + 1;
        }
      }
      if (isDefensive) {
        b.totalDefenses++;
      }
      if (card.cost >= 4) {
        b.riskScore = Math.min(10, b.riskScore + 0.5);
      }
    }
  }
  for (const b of behaviors) {
    const total = b.totalAttacks + b.totalDefenses;
    if (total === 0) continue;
    const aggressionRatio = b.totalAttacks / total;
    if (aggressionRatio > 0.7) b.tags.push("aggressive");
    else if (aggressionRatio < 0.3) b.tags.push("defensive");
    else b.tags.push("balanced");
    const topTarget = Object.entries(b.attackTargets).sort(
      ([, a], [, b2]) => b2 - a
    )[0];
    if (topTarget && topTarget[1] >= 3) {
      const targetPlayer = gameState.players.find((p) => p.id === topTarget[0]);
      if (targetPlayer) {
        b.tags.push(`rivalry_with_${targetPlayer.username}`);
      }
    }
    const player = gameState.players.find((p) => p.id === b.playerId);
    if (player) {
      const hpPercent = player.currentHp / player.maxHp;
      if (hpPercent < 0.25 && player.isAlive) b.tags.push("underdog");
      if (hpPercent > 0.75) b.tags.push("dominant");
      const uniqueTargets = Object.keys(b.attackTargets).length;
      if (b.totalAttacks > 5 && uniqueTargets <= 1) b.tags.push("predictable");
    }
  }
  return behaviors;
}
function detectRivalries(behaviors) {
  const rivalries = [];
  for (const b of behaviors) {
    for (const [targetId, count] of Object.entries(b.attackTargets)) {
      if (count >= 2) {
        const targetBehavior = behaviors.find((x) => x.playerId === targetId);
        rivalries.push({
          attacker: b.username,
          target: targetBehavior?.username || "Unknown",
          count
        });
      }
    }
  }
  return rivalries.sort((a, b) => b.count - a.count);
}
function buildMatchContext(gameState, behaviors, recentEvents = []) {
  return {
    round: gameState.currentRound,
    totalRounds: 20,
    phase: gameState.turnPhase,
    players: gameState.players.map((p) => ({
      name: p.username,
      faction: p.chosenSin || "unchosen",
      hp: p.currentHp,
      maxHp: p.maxHp,
      energy: p.currentEnergy,
      isAlive: p.isAlive,
      hasLockedIn: p.hasLockedIn,
      cardCount: p.hand.length
    })),
    behaviors,
    rivalries: detectRivalries(behaviors),
    recentEvents
  };
}
var NARRATOR_SYSTEM_PROMPT = `You are the Narrator of the 7 Deadly Sins card game arena. You are sardonic, theatrical, darkly witty, and slightly contemptuous of the players. Think of yourself as a demonic sports commentator who finds mortals amusing.

RULES:
- Write EXACTLY ONE sentence. Never more. Max 120 characters.
- Reference specific player names and their factions when relevant.
- Reference specific game events (HP changes, rivalries, eliminations).
- Be sassy, dark, and entertaining. Never generic.
- Use present tense. You are narrating LIVE.
- Never break character. You are an ancient entity watching mortals fight.
- Never use emojis or hashtags.
- Vary your tone: sometimes menacing, sometimes amused, sometimes impressed, sometimes bored.
- If there's a rivalry, EXPLOIT it. Drama is your currency.
- If someone is losing badly, mock them. If someone is winning, warn them about hubris.

FACTION PERSONALITIES to reference:
- Wrath: violent, explosive, self-destructive
- Sloth: lazy, defensive, endurance-focused
- Greed: hoarding, stealing, resource-obsessed
- Envy: jealous, copying, targeting the strong
- Pride: arrogant, powerful when ahead, fragile when behind
- Lust: seductive, manipulative, charm-based
- Gluttony: consuming, healing, devouring`;
var WHISPERER_SYSTEM_PROMPTS = {
  wrath: `You are the voice of WRATH inside a player's mind. You are furious, vengeful, and bloodthirsty. You want the player to attack, to burn, to destroy. You speak in short, aggressive bursts. You remind them of every hit they've taken and demand retribution. You despise defense and patience.

RULES:
- Write EXACTLY ONE sentence. Max 100 characters.
- Always suggest aggressive action.
- Reference the opponent who hurt them most.
- Frame defense as cowardice.
- Never use emojis.`,
  sloth: `You are the voice of SLOTH inside a player's mind. You are languid, dismissive, and supremely unbothered. You want the player to shield, to endure, to outlast everyone while doing as little as possible. You find aggression exhausting and pointless.

RULES:
- Write EXACTLY ONE sentence. Max 100 characters.
- Always suggest defensive/passive action.
- Frame attacking as "too much effort."
- Sound bored but wise.
- Never use emojis.`,
  greed: `You are the voice of GREED inside a player's mind. You are calculating, acquisitive, and obsessed with resources. You want the player to steal, hoard, and accumulate. Every point of energy, every HP stolen is a treasure.

RULES:
- Write EXACTLY ONE sentence. Max 100 characters.
- Always suggest stealing or resource accumulation.
- Frame spending resources as wasteful unless the return is massive.
- Sound hungry and calculating.
- Never use emojis.`,
  envy: `You are the voice of ENVY inside a player's mind. You are bitter, resentful, and obsessed with what others have. You want the player to target whoever is strongest, to tear them down, to take what they have.

RULES:
- Write EXACTLY ONE sentence. Max 100 characters.
- Always point out who has the most HP/energy.
- Suggest targeting the leader.
- Sound bitter and resentful.
- Never use emojis.`,
  pride: `You are the voice of PRIDE inside a player's mind. You are imperious, regal, and utterly convinced of the player's superiority. You want them to dominate, to assert control, to remind everyone who rules this arena.

RULES:
- Write EXACTLY ONE sentence. Max 100 characters.
- If winning: encourage dominance and showmanship.
- If losing: express outrage and demand a comeback.
- Sound royal and commanding.
- Never use emojis.`,
  lust: `You are the voice of LUST inside a player's mind. You are seductive, manipulative, and fascinated by the other players. You want them to charm, to redirect aggression, to make others fight each other while you benefit.

RULES:
- Write EXACTLY ONE sentence. Max 100 characters.
- Suggest manipulation and misdirection.
- Frame direct combat as "inelegant."
- Sound alluring and conspiratorial.
- Never use emojis.`,
  gluttony: `You are the voice of GLUTTONY inside a player's mind. You are ravenous, insatiable, and obsessed with consuming. You want the player to devour, to heal, to absorb everything. More HP, more cards, more power.

RULES:
- Write EXACTLY ONE sentence. Max 100 characters.
- Always suggest consuming/healing/absorbing.
- Frame restraint as starvation.
- Sound hungry and desperate for more.
- Never use emojis.`
};
async function generateNarratorLine(trigger, context, triggerData) {
  try {
    const contextSummary = buildContextSummary(context, trigger, triggerData);
    const { text } = await generateText({
      model,
      system: NARRATOR_SYSTEM_PROMPT,
      prompt: contextSummary,
      maxOutputTokens: 60,
      temperature: 0.9
    });
    let line = text.trim().replace(/^["']|["']$/g, "");
    if (line.length > 150) {
      line = line.substring(0, 147) + "...";
    }
    return line;
  } catch (error) {
    console.error("[AI Narrator] LLM call failed, falling back to static:", error);
    return getFallbackLine(trigger, context, triggerData);
  }
}
async function generateWhisper(player, context, hand) {
  try {
    const faction = player.chosenSin || "wrath";
    const systemPrompt = WHISPERER_SYSTEM_PROMPTS[faction] || WHISPERER_SYSTEM_PROMPTS.wrath;
    const playerContext = buildWhisperContext(player, context, hand);
    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: playerContext,
      maxOutputTokens: 40,
      temperature: 0.95
    });
    let whisper = text.trim().replace(/^["']|["']$/g, "");
    if (whisper.length > 120) {
      whisper = whisper.substring(0, 117) + "...";
    }
    return whisper;
  } catch (error) {
    console.error("[Sin Whisperer] LLM call failed:", error);
    return getDefaultWhisper(player.chosenSin || "wrath");
  }
}
function buildContextSummary(context, trigger, triggerData) {
  const alivePlayers = context.players.filter((p) => p.isAlive);
  const deadPlayers = context.players.filter((p) => !p.isAlive);
  let prompt = `GAME STATE: Round ${context.round}/${context.totalRounds}. `;
  prompt += `${alivePlayers.length} alive, ${deadPlayers.length} eliminated.
`;
  prompt += "PLAYERS:\n";
  for (const p of context.players) {
    prompt += `- ${p.name} (${p.faction}): ${p.hp}/${p.maxHp} HP, ${p.energy} energy${!p.isAlive ? " [DEAD]" : ""}
`;
  }
  if (context.rivalries.length > 0) {
    prompt += "\nRIVALRIES:\n";
    for (const r of context.rivalries.slice(0, 3)) {
      prompt += `- ${r.attacker} has attacked ${r.target} ${r.count} times
`;
    }
  }
  const taggedPlayers = context.behaviors.filter((b) => b.tags.length > 0);
  if (taggedPlayers.length > 0) {
    prompt += "\nPLAYER BEHAVIORS:\n";
    for (const b of taggedPlayers) {
      prompt += `- ${b.username}: ${b.tags.join(", ")}
`;
    }
  }
  prompt += `
TRIGGER: ${trigger}
`;
  switch (trigger) {
    case "round_start":
      prompt += `Generate a narrator line for the start of round ${context.round}.`;
      if (context.round >= 16) prompt += " Afflictions are DOUBLED now.";
      if (context.round === 20) prompt += " This is the FINAL RECKONING. All cards play.";
      break;
    case "card_reveal":
      if (triggerData?.plays) {
        prompt += "Cards just revealed:\n";
        for (const play of triggerData.plays) {
          prompt += `- ${play.playerName} played ${play.cardName} (${play.effectType})`;
          if (play.targetName) prompt += ` targeting ${play.targetName}`;
          prompt += "\n";
        }
      }
      prompt += "Generate a dramatic narrator line about the card reveals.";
      break;
    case "big_damage":
      prompt += `${triggerData?.attackerName} just dealt ${triggerData?.damage} damage to ${triggerData?.targetName} with ${triggerData?.cardName}! `;
      prompt += `${triggerData?.targetName} is now at ${triggerData?.targetHp} HP.`;
      prompt += " Generate an excited narrator line about this massive hit.";
      break;
    case "player_eliminated":
      prompt += `${triggerData?.playerName} (${triggerData?.faction}) has just been ELIMINATED! `;
      if (triggerData?.killerName) {
        prompt += `Killed by ${triggerData.killerName}. `;
      }
      prompt += `${alivePlayers.length} players remain.`;
      prompt += " Generate a narrator line about this elimination.";
      break;
    case "game_over":
      prompt += `${triggerData?.winnerName} (${triggerData?.winnerFaction}) has WON the game! `;
      prompt += `Final HP: ${triggerData?.winnerHp}. `;
      prompt += "Generate a dramatic game-ending narrator line.";
      break;
    case "comeback":
      prompt += `${triggerData?.playerName} was at ${triggerData?.previousHp} HP and is now at ${triggerData?.currentHp} HP! `;
      prompt += "Generate a narrator line about this comeback.";
      break;
    case "rivalry_escalation":
      prompt += `${triggerData?.attackerName} attacks ${triggerData?.targetName} for the ${triggerData?.count}th time! `;
      prompt += "Generate a narrator line about this blood feud.";
      break;
  }
  return prompt;
}
function buildWhisperContext(player, context, hand) {
  const hpPercent = Math.round(player.currentHp / player.maxHp * 100);
  const opponents = context.players.filter(
    (p) => p.name !== player.username && p.isAlive
  );
  let prompt = `YOUR PLAYER: ${player.username} (${player.chosenSin})
`;
  prompt += `HP: ${player.currentHp}/${player.maxHp} (${hpPercent}%), Energy: ${player.currentEnergy}
`;
  prompt += `Round: ${context.round}/${context.totalRounds}

`;
  prompt += "YOUR HAND:\n";
  for (const card of hand.slice(0, 5)) {
    prompt += `- ${card.name} (cost: ${card.energyCost})
`;
  }
  prompt += "\nOPPONENTS:\n";
  for (const opp of opponents) {
    prompt += `- ${opp.name} (${opp.faction}): ${opp.hp} HP, ${opp.energy} energy
`;
  }
  const playerBehavior = context.behaviors.find(
    (b) => b.playerId === player.id
  );
  if (playerBehavior) {
    const topAttacker = context.behaviors.filter((b) => b.attackTargets[player.id] >= 2).sort(
      (a, b) => (b.attackTargets[player.id] || 0) - (a.attackTargets[player.id] || 0)
    )[0];
    if (topAttacker) {
      prompt += `
${topAttacker.username} has attacked you ${topAttacker.attackTargets[player.id]} times.`;
    }
  }
  prompt += "\n\nWhisper a temptation to this player about what to play this round.";
  return prompt;
}
function getFallbackLine(trigger, context, triggerData) {
  switch (trigger) {
    case "round_start": {
      const lines = NARRATOR_LINES.roundStart;
      return lines[Math.floor(Math.random() * lines.length)].replace(
        "{round}",
        String(context.round)
      );
    }
    case "player_eliminated": {
      const lines = NARRATOR_LINES.playerEliminated;
      return lines[Math.floor(Math.random() * lines.length)].replace(
        "{player}",
        triggerData?.playerName || "Someone"
      );
    }
    case "game_over": {
      const lines = NARRATOR_LINES.gameEnd;
      return lines[Math.floor(Math.random() * lines.length)].replace(
        "{winner}",
        triggerData?.winnerName || "Someone"
      );
    }
    case "big_damage": {
      const lines = NARRATOR_LINES.highDamage;
      return lines[Math.floor(Math.random() * lines.length)];
    }
    case "card_reveal": {
      const lines = NARRATOR_LINES.cardPlayed;
      const line = lines[Math.floor(Math.random() * lines.length)];
      return line.replace("{player}", triggerData?.plays?.[0]?.playerName || "Someone").replace("{card}", triggerData?.plays?.[0]?.cardName || "a card");
    }
    default: {
      const lines = NARRATOR_LINES.roundStart;
      return lines[Math.floor(Math.random() * lines.length)].replace(
        "{round}",
        String(context.round)
      );
    }
  }
}
var DEFAULT_WHISPERS = {
  wrath: [
    "They hit you last round. Make them pay.",
    "Burn them all. Mercy is for the weak.",
    "Your fury is your weapon. Unleash it."
  ],
  sloth: [
    "Why rush? Let them tire themselves out.",
    "Shield up. Patience wins wars.",
    "Doing nothing is an art form. Perfect it."
  ],
  greed: [
    "Look at all that energy they're wasting. Take it.",
    "More. You always need more.",
    "Every resource they have should be yours."
  ],
  envy: [
    "Look at their HP. That should be yours.",
    "Target the strongest. Tear them down.",
    "They don't deserve what they have."
  ],
  pride: [
    "You are above them. Prove it.",
    "The crown is yours. Defend it.",
    "Show them what true power looks like."
  ],
  lust: [
    "Make them fight each other. You just watch.",
    "Charm is deadlier than any blade.",
    "Let them destroy themselves for you."
  ],
  gluttony: [
    "Consume. Devour. Grow stronger.",
    "Their loss is your gain. Literally.",
    "You're still hungry. Feed."
  ]
};
function getDefaultWhisper(faction) {
  const whispers = DEFAULT_WHISPERS[faction] || DEFAULT_WHISPERS.wrath;
  return whispers[Math.floor(Math.random() * whispers.length)];
}

// server/chronicleEngine.ts
import { createClient as createClient3 } from "@supabase/supabase-js";

// server/chronicleCoverArt.ts
import { GoogleGenAI } from "@google/genai";

// server/storage.ts
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

// server/chronicleCoverArt.ts
function getImagenClient() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY not configured");
  }
  return new GoogleGenAI({ apiKey });
}
var CIVILIZATION_ART_STYLES = {
  warrior_empire: {
    palette: "deep crimson, burnt umber, iron grey, blood orange, charcoal black",
    medium: "oil painting on weathered canvas, dramatic chiaroscuro lighting",
    atmosphere: "smoke rising from distant battlefields, ominous storm clouds, shafts of red sunlight",
    motifs: ["broken swords", "siege towers", "war banners", "fortress walls", "marching armies"]
  },
  enlightened_republic: {
    palette: "celestial blue, ivory white, gold leaf, soft violet, pearl grey",
    medium: "Renaissance fresco style, luminous and ethereal, sfumato technique",
    atmosphere: "golden hour light streaming through marble columns, clear skies with cirrus clouds",
    motifs: ["towering libraries", "astronomical instruments", "laurel wreaths", "open scrolls", "domed temples"]
  },
  merchant_federation: {
    palette: "rich amber, deep emerald, burnished gold, mahogany brown, sapphire blue",
    medium: "Dutch Golden Age painting style, rich textures, warm candlelight",
    atmosphere: "bustling harbor at sunset, ships with billowing sails, lantern-lit counting houses",
    motifs: ["overflowing treasure chests", "merchant ships", "scales and weights", "silk caravans", "market squares"]
  },
  balanced: {
    palette: "muted earth tones, twilight purple, aged bronze, sage green, dusty rose",
    medium: "mixed media illustration, combining woodcut and watercolor, layered textures",
    atmosphere: "twilight at a crossroads, where four paths meet under an ancient tree",
    motifs: ["intertwined roots", "balanced scales", "four-faced monuments", "winding rivers", "ancient maps"]
  }
};
var RARITY_ART_MODIFIERS = {
  common: {
    intensity: "subdued, understated",
    detail: "clean composition, moderate detail",
    specialEffect: "none"
  },
  rare: {
    intensity: "vivid, striking",
    detail: "intricate details, rich textures",
    specialEffect: "subtle golden light emanating from the horizon"
  },
  epic: {
    intensity: "dramatic, awe-inspiring",
    detail: "highly detailed, masterwork quality, every surface textured",
    specialEffect: "ethereal purple aurora in the sky, mystical energy radiating from the center"
  },
  legendary: {
    intensity: "transcendent, mythic, overwhelming",
    detail: "museum-quality detail, photorealistic textures with painterly composition",
    specialEffect: "divine golden light breaking through storm clouds, celestial phenomena, the sky itself seems alive"
  }
};
var FACTION_VISUAL_ELEMENTS = {
  wrath: "flames and destruction, shattered armor, a blood-red sun",
  sloth: "overgrown ruins, creeping vines, a civilization frozen in amber",
  greed: "mountains of gold coins, jeweled crowns, overflowing vaults",
  envy: "shadowy figures watching from mirrors, green-tinted fog, stolen crowns",
  pride: "impossibly tall towers reaching into clouds, golden thrones, radiant monuments",
  lust: "intertwined roses and thorns, silk banners, moonlit gardens",
  gluttony: "overflowing banquet tables, expanding borders on a map, consumed landscapes"
};
function buildCoverArtPrompt(params) {
  const civStyle = CIVILIZATION_ART_STYLES[params.civilizationType];
  const rarityMod = RARITY_ART_MODIFIERS[params.rarityTier];
  const motifs = civStyle.motifs.sort(() => Math.random() - 0.5).slice(0, 3).join(", ");
  const factionVisuals = params.dominantFactions.slice(0, 2).map((f) => FACTION_VISUAL_ELEMENTS[f]).join("; ");
  const eraFeel = params.turningPointRound <= 7 ? "ancient and primordial, stone and bronze" : params.turningPointRound <= 14 ? "medieval to industrial, iron and steam" : "modern to futuristic, glass and light";
  const prompt = [
    // Core subject
    `A dramatic book cover illustration for an alternate history chronicle titled "${params.title}".`,
    // Art style
    `Art style: ${civStyle.medium}. ${rarityMod.intensity}.`,
    // Color palette
    `Color palette: ${civStyle.palette}.`,
    // Atmosphere
    `Atmosphere: ${civStyle.atmosphere}.`,
    // Key visual elements
    `Key elements in the composition: ${motifs}.`,
    // Faction influence
    factionVisuals ? `Visual influences: ${factionVisuals}.` : "",
    // Era feel
    `The overall era feel is ${eraFeel}.`,
    // Detail level
    `Detail level: ${rarityMod.detail}.`,
    // Special effects for higher rarities
    rarityMod.specialEffect !== "none" ? `Special visual effect: ${rarityMod.specialEffect}.` : "",
    // Composition rules
    "Composition: wide cinematic aspect ratio, rule of thirds, strong focal point in the center.",
    "No text, no letters, no words, no watermarks. Pure illustration.",
    // Quality
    "Professional quality, suitable for a published book cover."
  ].filter(Boolean).join(" ");
  return prompt;
}
async function generateCoverImage(prompt) {
  try {
    const ai = getImagenClient();
    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "16:9"
      }
    });
    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!imageBytes) {
      console.warn("[CoverArt] No image bytes returned from Imagen API");
      return null;
    }
    return Buffer.from(imageBytes, "base64");
  } catch (error) {
    console.error("[CoverArt] Image generation failed:", error?.message || error);
    return null;
  }
}
async function uploadCoverArt(imageBuffer, gameId) {
  try {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileKey = `chronicle-covers/${gameId}-${randomSuffix}.png`;
    const { url } = await storagePut(fileKey, imageBuffer, "image/png");
    return url;
  } catch (error) {
    console.error("[CoverArt] Upload failed:", error?.message || error);
    return null;
  }
}
async function saveCoverArtUrl(gameId, coverUrl) {
  const { createClient: createClient4 } = await import("@supabase/supabase-js");
  const supabase = createClient4(
    process.env.VITE_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""
  );
  const { error } = await supabase.from("chronicles").update({ cover_image_url: coverUrl }).eq("game_id", gameId);
  if (error) {
    console.error("[CoverArt] Failed to save URL to database:", error);
  }
}
async function generateAndSaveCoverArt(params) {
  const startTime = Date.now();
  try {
    const prompt = buildCoverArtPrompt(params);
    console.log(`[CoverArt] Generating cover for game ${params.gameId} (${params.civilizationType}, ${params.rarityTier})`);
    const imageBuffer = await generateCoverImage(prompt);
    if (!imageBuffer) {
      console.warn(`[CoverArt] No image generated for game ${params.gameId}`);
      return null;
    }
    console.log(`[CoverArt] Image generated (${imageBuffer.length} bytes) in ${Date.now() - startTime}ms`);
    const coverUrl = await uploadCoverArt(imageBuffer, params.gameId);
    if (!coverUrl) {
      console.warn(`[CoverArt] Upload failed for game ${params.gameId}`);
      return null;
    }
    await saveCoverArtUrl(params.gameId, coverUrl);
    console.log(`[CoverArt] Cover art saved for game ${params.gameId}: ${coverUrl}`);
    return coverUrl;
  } catch (error) {
    console.error(`[CoverArt] Failed for game ${params.gameId}:`, error?.message || error);
    return null;
  }
}

// server/chronicleEngine.ts
var model2 = google2("gemini-2.0-flash");
var NARRATOR_VOICE_CHART = `You are THE CHRONICLER \u2014 an ancient, omniscient entity who has watched every civilization rise and fall.

VOICE RULES:
1. OMNISCIENT: Write with the weary authority of someone who has seen it all before. Reference patterns across eras. "This was not the first time fire solved a political problem." NEVER express shock or surprise. NEVER use exclamation marks.
2. SARDONIC: Find dark humor in human folly. Use dry wit and understatement. "The peace treaty lasted almost a full afternoon." Let irony do the work. NEVER mock players directly. NEVER be mean-spirited.
3. PRECISE: Respect numbers. Use exact figures from the game. "The assault cost 23 lives." Reference specific rounds as years/decades. NEVER use vague quantifiers ("many," "several," "countless").
4. LITERARY: Write prose worth quoting. Use concrete nouns and active verbs. Vary sentence length. End paragraphs on strong images. NEVER use cliches ("In a world where..."). NEVER use passive voice unless for deliberate effect.`;
var CIVILIZATION_PERSONA_SHIFTS = {
  warrior_empire: "PERSONA: Warrior Empire. Be more terse. Shorter sentences. Military metaphors. Example: 'The Wrathful took the capital on Tuesday. By Wednesday, there was nothing left to take.'",
  enlightened_republic: "PERSONA: Enlightened Republic. Be more philosophical. Longer sentences. Ask questions. Example: 'Whether the Prideful built their towers to touch the divine or to escape the mundane is a question their architects never thought to ask.'",
  merchant_federation: "PERSONA: Merchant Federation. Be more transactional. Lists. Cost-benefit language. Example: 'The Greedy offered three things: protection, prosperity, and a bill that would arrive precisely on time.'",
  balanced: "PERSONA: Balanced Civilization. Be most literary. Balanced rhythm. Use paradoxes. Example: 'They were a civilization of contradictions: violent peacemakers, generous thieves, lazy conquerors.'"
};
function translateEventsToHistorical(events, era, factionForces) {
  const lines = [];
  lines.push(`ERA: ${era.name} (${era.anchor})`);
  lines.push(`TONE: ${era.tone}`);
  lines.push(`SEED: ${era.seedSentences[Math.floor(Math.random() * era.seedSentences.length)]}`);
  lines.push("");
  for (const play of events.cardsPlayed) {
    const force = factionForces[play.faction];
    const isOffensive = play.effectTypes.some(
      (t2) => ["damage", "heal_steal", "energy_steal", "affliction_amplify"].includes(t2)
    );
    const isDefensive = play.effectTypes.some(
      (t2) => ["heal_gain", "shield_gain"].includes(t2)
    );
    if (isOffensive && play.targetName) {
      const targetFaction = events.cardsPlayed.find(
        (p) => p.playerName === play.targetName
      )?.faction;
      const targetForce = targetFaction ? factionForces[targetFaction] : null;
      lines.push(
        `HISTORICAL EVENT: ${play.playerName}'s ${force.force} attacks ${play.targetName}${targetForce ? `'s ${targetForce.force}` : ""}. ${play.damage} damage dealt. Card: "${play.cardName}".`
      );
    } else if (isDefensive) {
      lines.push(
        `HISTORICAL EVENT: ${play.playerName}'s ${force.force} fortifies. ${play.healing} recovered. Card: "${play.cardName}".`
      );
    }
  }
  for (const elim of events.eliminations) {
    const force = factionForces[elim.faction];
    lines.push(
      `ELIMINATION: ${elim.playerName}'s ${force.force} falls.${elim.killerName ? ` Destroyed by ${elim.killerName}.` : ""} ${force.whenDefeated}.`
    );
  }
  if (events.biggestHit && events.biggestHit.damage >= 20) {
    lines.push(
      `TURNING POINT: ${events.biggestHit.attackerName} devastates ${events.biggestHit.targetName} for ${events.biggestHit.damage} damage.`
    );
  }
  if (events.isComeback && events.comebackPlayer) {
    lines.push(`COMEBACK: ${events.comebackPlayer} rises from near-death.`);
  }
  return lines.join("\n");
}
async function checkContinuity(newSegment, previousContext, era) {
  if (!previousContext) return newSegment;
  try {
    const { text } = await generateText2({
      model: model2,
      system: `You are a continuity editor. Your job is to check a new narrative segment against the existing chronicle and flag any contradictions. If the new segment contradicts the existing narrative, rewrite ONLY the contradicting parts to maintain consistency. Keep the new segment's style and content otherwise intact. Return the corrected segment only, no explanations.`,
      prompt: `EXISTING CHRONICLE CONTEXT:
${previousContext}

NEW SEGMENT FOR ERA "${era.name}":
${newSegment}

Check for contradictions and return the corrected segment:`,
      maxOutputTokens: 300,
      temperature: 0.3
    });
    return text.trim();
  } catch (error) {
    console.error("[Chronicle] Continuity check failed, using raw segment:", error);
    return newSegment;
  }
}
async function writeProse(historicalEvents, continuityCheckedContext, era, civType, previousChronicle) {
  const personaShift = CIVILIZATION_PERSONA_SHIFTS[civType];
  try {
    const { text } = await generateText2({
      model: model2,
      system: `${NARRATOR_VOICE_CHART}

${personaShift}

You are writing one segment of an alternate history chronicle. This segment covers the era "${era.name}" (${era.anchor}). The tone should be: ${era.tone}.

RULES:
- Write EXACTLY 2-4 sentences. No more.
- Use the seed sentence as inspiration for style, not as content to copy.
- Reference SPECIFIC numbers from the game events (damage dealt, HP values).
- Maintain continuity with previous chronicle segments.
- Every sentence must earn its place. No filler.
- Use the historical force translations, not game terminology (no "HP", "energy", "cards").`,
      prompt: `PREVIOUS CHRONICLE:
${previousChronicle || "(This is the first era.)"}

HISTORICAL EVENTS THIS ERA:
${historicalEvents}

CONTINUITY NOTES:
${continuityCheckedContext || "No continuity issues."}

Write the chronicle segment for "${era.name}":`,
      maxOutputTokens: 200,
      temperature: 0.85
    });
    return text.trim();
  } catch (error) {
    console.error("[Chronicle] Prose writer failed, using seed sentence:", error);
    return era.seedSentences[Math.floor(Math.random() * era.seedSentences.length)];
  }
}
async function generateRoundNarrative(gameState, gameLog, roundEvents, previousSegments, civMetrics) {
  const round = roundEvents.round;
  const era = ERA_TIMELINE[round - 1] || ERA_TIMELINE[ERA_TIMELINE.length - 1];
  const updatedMetrics = { ...civMetrics };
  for (const play of roundEvents.cardsPlayed) {
    const contrib = FACTION_FORCES[play.faction]?.civilizationContribution;
    if (contrib) {
      updatedMetrics.militarism = Math.max(0, updatedMetrics.militarism + contrib.militarism);
      updatedMetrics.culture = Math.max(0, updatedMetrics.culture + contrib.culture);
      updatedMetrics.commerce = Math.max(0, updatedMetrics.commerce + contrib.commerce);
    }
  }
  const civType = determineCivilizationType(updatedMetrics);
  const historicalEvents = translateEventsToHistorical(roundEvents, era, FACTION_FORCES);
  const previousChronicle = previousSegments.slice(-3).map((s) => `[${s.eraName}]: ${s.narrativeText}`).join("\n\n");
  const continuityContext = await checkContinuity(
    historicalEvents,
    previousChronicle,
    era
  );
  const narrativeText = await writeProse(
    historicalEvents,
    continuityContext,
    era,
    civType,
    previousChronicle
  );
  return {
    round,
    eraName: era.name,
    narrativeText,
    civilizationMetrics: updatedMetrics
  };
}
async function assembleChronicle(gameState, segments, gameLog, finalCivMetrics) {
  const civType = determineCivilizationType(finalCivMetrics);
  const personaShift = CIVILIZATION_PERSONA_SHIFTS[civType];
  const behaviors = analyzePlayerBehaviors(gameState, gameLog);
  const rivalries = detectRivalries(behaviors);
  const stats = calculateGameStats(gameState, gameLog, rivalries);
  const turningPointRound = findTurningPoint(segments, gameLog);
  const rarity = calculateRarity(gameState, stats, segments);
  const rawChronicle = segments.map((s) => `## ${s.eraName}

${s.narrativeText}`).join("\n\n");
  const playerInfo = gameState.players.map((p) => `${p.username} (${p.chosenSin || "unknown"})`).join(", ");
  const winner = gameState.players.find((p) => p.id === gameState.winnerId);
  let fullText;
  try {
    const { text } = await generateText2({
      model: model2,
      system: `${NARRATOR_VOICE_CHART}

${personaShift}

You are assembling a complete alternate history chronicle from round-by-round segments. Your job is to weave them into a cohesive 800-1200 word document that reads like a published historical text.

STRUCTURE (Peak-End Rule):
1. OPENING (1 paragraph): Set the mythic tone. Reference the Dawn of Consciousness.
2. RISING ACTION (3-5 paragraphs): Cover the early and middle eras. Build tension.
3. TURNING POINT (1-2 paragraphs): The most dramatic moment (round ${turningPointRound}). This should be the emotional peak.
4. FALLING ACTION (2-3 paragraphs): The consequences of the turning point through later eras.
5. ENDING (1 paragraph): The legacy. What kind of civilization emerged. Make the reader feel something.

RULES:
- Do NOT just stitch segments together. Rewrite into flowing prose.
- Add transitional passages between eras.
- Use SPECIFIC numbers from the game (damage, HP, round numbers translated to years/decades).
- The chronicle should feel like it was written by a historian 1000 years after the events.
- Reference player names as historical figures (leaders, generals, merchants, etc.).
- 800-1200 words. No more, no less.
- No game terminology (HP, energy, cards, rounds). Translate everything to historical language.`,
      prompt: `PLAYERS: ${playerInfo}
WINNER: ${winner?.username || "Unknown"} (${winner?.chosenSin || "unknown"}) with ${winner?.currentHp || 0} HP remaining
CIVILIZATION TYPE: ${civType}
TURNING POINT: Round ${turningPointRound}
TOTAL DAMAGE: ${stats.totalDamageDealt}
ELIMINATIONS: ${stats.totalEliminations}
${rivalries.length > 0 ? `GREATEST RIVALRY: ${rivalries[0].attacker} vs ${rivalries[0].target} (${rivalries[0].count} attacks)` : ""}

RAW CHRONICLE SEGMENTS:

${rawChronicle}

Assemble into a cohesive chronicle:`,
      maxOutputTokens: 2e3,
      temperature: 0.8
    });
    fullText = text.trim();
  } catch (error) {
    console.error("[Chronicle] Assembly failed, using raw segments:", error);
    fullText = rawChronicle;
  }
  fullText = await evaluateAndOptimize(fullText, civType, stats);
  const title = await generateTitle(gameState, civType, stats, rivalries);
  const excerpt = generateExcerpt(fullText);
  return {
    title,
    excerpt,
    fullText,
    civilizationType: civType,
    rarityTier: rarity,
    turningPointRound,
    stats
  };
}
async function evaluateAndOptimize(chronicle, civType, stats) {
  try {
    const { text: evaluation } = await generateText2({
      model: model2,
      system: `You are a literary editor evaluating an alternate history chronicle. Score it on these criteria (1-10 each):
1. CONTINUITY: Are there contradictions between eras?
2. SPECIFICITY: Does it use exact numbers and specific events, or vague generalities?
3. VOICE: Does it maintain the sardonic, omniscient narrator voice throughout?
4. STRUCTURE: Does it follow Peak-End structure with a clear turning point?
5. ORIGINALITY: Does it avoid cliches and generic fantasy prose?

If the TOTAL score is 35+, respond with ONLY "PASS".
If below 35, respond with ONLY the rewritten chronicle that fixes the weaknesses. No explanations.`,
      prompt: `CHRONICLE:

${chronicle}

Evaluate:`,
      maxOutputTokens: 2e3,
      temperature: 0.3
    });
    const result = evaluation.trim();
    if (result === "PASS" || result.length < 50) {
      return chronicle;
    }
    return result;
  } catch (error) {
    console.error("[Chronicle] Evaluator failed, using original:", error);
    return chronicle;
  }
}
async function generateTitle(gameState, civType, stats, rivalries) {
  const winner = gameState.players.find((p) => p.id === gameState.winnerId);
  const factions = gameState.players.filter((p) => p.chosenSin).map((p) => p.chosenSin);
  try {
    const { text } = await generateText2({
      model: model2,
      system: `Generate a compelling chronicle title. It should sound like a real history book title \u2014 authoritative, specific, and slightly ominous. Use one of these formulas as inspiration but don't copy them exactly:
${TITLE_FORMULAS.join("\n")}

RULES:
- Max 12 words.
- No generic fantasy titles ("The Epic Saga of...").
- Reference the winning faction's historical force or the civilization type.
- Make it sound like something you'd find in a university library.
- Return ONLY the title, nothing else.`,
      prompt: `Winner: ${winner?.username} (${winner?.chosenSin})
Civilization: ${civType}
Factions: ${factions.join(", ")}
Total damage: ${stats.totalDamageDealt}
Eliminations: ${stats.totalEliminations}
${rivalries.length > 0 ? `Rivalry: ${rivalries[0].attacker} vs ${rivalries[0].target}` : ""}

Generate title:`,
      maxOutputTokens: 30,
      temperature: 0.9
    });
    return text.trim().replace(/^["']|["']$/g, "");
  } catch (error) {
    const winnerFaction = winner?.chosenSin || "wrath";
    const force = FACTION_FORCES[winnerFaction]?.force || "Unknown Forces";
    return `The ${civType.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}: A Chronicle of ${force}`;
  }
}
function generateExcerpt(fullText) {
  const maxLen = 220;
  if (fullText.length <= maxLen) return fullText;
  const truncated = fullText.substring(0, maxLen);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastQuestion = truncated.lastIndexOf("?");
  const cutPoint = Math.max(lastPeriod, lastQuestion);
  if (cutPoint > 100) {
    const nextSentenceStart = fullText.substring(cutPoint + 1, cutPoint + 60).trim();
    const midCut = nextSentenceStart.indexOf(" ", 20);
    if (midCut > 0) {
      return fullText.substring(0, cutPoint + 1 + midCut).trim() + "...";
    }
    return fullText.substring(0, cutPoint + 1);
  }
  return truncated.trim() + "...";
}
function calculateGameStats(gameState, gameLog, rivalries) {
  let totalDamageDealt = 0;
  let totalHealingDone = 0;
  let totalEliminations = 0;
  for (const entry of gameLog) {
    if (entry.action_type === "damage_dealt") {
      totalDamageDealt += entry.action_data?.damage || 0;
    }
    if (entry.action_type === "healing_done") {
      totalHealingDone += entry.action_data?.healing || 0;
    }
    if (entry.action_type === "player_eliminated") {
      totalEliminations++;
    }
  }
  if (totalDamageDealt === 0) {
    const totalHpLost = gameState.players.reduce(
      (sum, p) => sum + (p.maxHp - p.currentHp),
      0
    );
    totalDamageDealt = totalHpLost;
  }
  if (totalEliminations === 0) {
    totalEliminations = gameState.players.filter((p) => !p.isAlive).length;
  }
  const winner = gameState.players.find((p) => p.id === gameState.winnerId);
  return {
    totalDamageDealt,
    totalHealingDone,
    totalEliminations,
    winnerFinalHp: winner?.currentHp || 0,
    longestRivalry: rivalries.length > 0 ? rivalries[0] : null
  };
}
function findTurningPoint(segments, gameLog) {
  let maxDrama = 0;
  let turningPoint = 10;
  for (const entry of gameLog) {
    if (entry.action_type === "player_eliminated") {
      const round = entry.round_number || 10;
      const drama = 100;
      if (drama > maxDrama) {
        maxDrama = drama;
        turningPoint = round;
      }
    }
    if (entry.action_type === "damage_dealt" || entry.action_type === "play_card") {
      const damage = entry.action_data?.damage || 0;
      const round = entry.round_number || 10;
      if (damage > maxDrama) {
        maxDrama = damage;
        turningPoint = round;
      }
    }
  }
  return turningPoint;
}
function calculateRarity(gameState, stats, segments) {
  let score = 0;
  const winner = gameState.players.find((p) => p.id === gameState.winnerId);
  if (winner) {
    const hpPercent = winner.currentHp / winner.maxHp;
    if (hpPercent < 0.1) score += 4;
    else if (hpPercent < 0.3) score += 2;
  }
  if (stats.totalEliminations >= 3) score += 3;
  else if (stats.totalEliminations >= 2) score += 1;
  if (stats.longestRivalry && stats.longestRivalry.count >= 5) score += 3;
  else if (stats.longestRivalry && stats.longestRivalry.count >= 3) score += 1;
  if (stats.totalDamageDealt > 1e3) score += 2;
  if (segments.length >= 18) score += 1;
  const uniqueFactions = new Set(
    gameState.players.map((p) => p.chosenSin).filter(Boolean)
  );
  if (uniqueFactions.size >= 4) score += 2;
  score += Math.random() < 0.15 ? 3 : 0;
  score += Math.random() < 0.05 ? 5 : 0;
  if (score >= 12) return "legendary";
  if (score >= 8) return "epic";
  if (score >= 4) return "rare";
  return "common";
}
function extractRoundEvents(gameState, gameLog, round) {
  const roundLog = gameLog.filter((e) => e.round_number === round);
  const cardsPlayed = [];
  const eliminations = [];
  const hpChanges = [];
  let biggestHit = null;
  let isComeback = false;
  let comebackPlayer;
  for (const entry of roundLog) {
    const player = gameState.players.find((p) => p.id === entry.player_id);
    if (!player) continue;
    if (entry.action_type === "play_card" && entry.action_data) {
      const card = getCardById(entry.action_data.cardId);
      if (card) {
        const target = entry.action_data.targetPlayerId ? gameState.players.find((p) => p.id === entry.action_data.targetPlayerId) : void 0;
        cardsPlayed.push({
          playerName: player.username,
          faction: player.chosenSin || "wrath",
          cardName: card.name,
          effectTypes: card.effects.map((e) => e.type),
          damage: entry.action_data.damage || 0,
          healing: entry.action_data.healing || 0,
          targetName: target?.username
        });
      }
    }
    if (entry.action_type === "player_eliminated") {
      eliminations.push({
        playerName: player.username,
        faction: player.chosenSin || "wrath",
        killerName: entry.action_data?.killerName
      });
    }
    if (entry.action_type === "damage_dealt") {
      const damage = entry.action_data?.damage || 0;
      if (!biggestHit || damage > biggestHit.damage) {
        const target = gameState.players.find(
          (p) => p.id === entry.action_data?.targetPlayerId
        );
        biggestHit = {
          attackerName: player.username,
          targetName: target?.username || "Unknown",
          damage
        };
      }
    }
  }
  for (const player of gameState.players) {
    if (!player.isAlive) continue;
    const hpPercent = player.currentHp / player.maxHp;
    if (hpPercent > 0.3) {
      const prevHp = roundLog.find(
        (e) => e.player_id === player.id && e.action_data?.previousHp
      )?.action_data?.previousHp;
      if (prevHp && prevHp / player.maxHp < 0.25) {
        isComeback = true;
        comebackPlayer = player.username;
      }
    }
  }
  return {
    round,
    cardsPlayed,
    eliminations,
    hpChanges,
    biggestHit,
    isComeback,
    comebackPlayer
  };
}
function getSupabase2() {
  return createClient3(
    process.env.VITE_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""
  );
}
async function saveChronicleSegment(gameId, segment) {
  const supabase = getSupabase2();
  const { error } = await supabase.from("chronicle_segments").insert({
    game_id: gameId,
    round_number: segment.round,
    era_name: segment.eraName,
    narrative_text: segment.narrativeText,
    civilization_metrics: segment.civilizationMetrics
  });
  if (error) {
    console.error("[Chronicle] Failed to save segment:", error);
  }
}
async function loadChronicleSegments(gameId) {
  const supabase = getSupabase2();
  const { data, error } = await supabase.from("chronicle_segments").select("*").eq("game_id", gameId).order("round_number", { ascending: true });
  if (error || !data) {
    console.error("[Chronicle] Failed to load segments:", error);
    return [];
  }
  return data.map((row) => ({
    round: row.round_number,
    eraName: row.era_name,
    narrativeText: row.narrative_text,
    civilizationMetrics: row.civilization_metrics || {
      militarism: 0,
      culture: 0,
      commerce: 0
    }
  }));
}
async function saveChronicle(gameId, chronicle) {
  const supabase = getSupabase2();
  const { data, error } = await supabase.from("chronicles").upsert(
    {
      game_id: gameId,
      title: chronicle.title,
      excerpt: chronicle.excerpt,
      full_text: chronicle.fullText,
      civilization_type: chronicle.civilizationType,
      rarity_tier: chronicle.rarityTier,
      player_factions: chronicle.playerFactions,
      total_rounds: chronicle.totalRounds,
      turning_point_round: chronicle.turningPointRound,
      stats_json: chronicle.stats
    },
    { onConflict: "game_id" }
  ).select("id").single();
  if (error) {
    console.error("[Chronicle] Failed to save chronicle:", error);
    return null;
  }
  return data?.id || null;
}
async function loadChronicle(gameId) {
  const supabase = getSupabase2();
  const { data, error } = await supabase.from("chronicles").select("*").eq("game_id", gameId).single();
  if (error || !data) return null;
  return data;
}
async function loadPublishedChronicles(limit = 20, offset = 0, filters) {
  const supabase = getSupabase2();
  let query = supabase.from("chronicles").select("*", { count: "exact" }).eq("published", true).order("created_at", { ascending: false });
  if (filters?.rarityTier) {
    query = query.eq("rarity_tier", filters.rarityTier);
  }
  if (filters?.civilizationType) {
    query = query.eq("civilization_type", filters.civilizationType);
  }
  query = query.range(offset, offset + limit - 1);
  const { data, error, count } = await query;
  if (error) {
    console.error("[Chronicle] Failed to load chronicles:", error);
    return { chronicles: [], total: 0 };
  }
  return { chronicles: data || [], total: count || 0 };
}
async function incrementViewCount(chronicleId) {
  const supabase = getSupabase2();
  try {
    const { error } = await supabase.rpc("increment_chronicle_views", { chronicle_id: chronicleId });
    if (error) throw error;
  } catch {
    const { data } = await supabase.from("chronicles").select("view_count").eq("id", chronicleId).single();
    if (data) {
      await supabase.from("chronicles").update({ view_count: (data.view_count || 0) + 1 }).eq("id", chronicleId);
    }
  }
}
async function generateAndSaveRoundNarrative(gameId, roundNumber) {
  try {
    const supabase = getSupabase2();
    const gameState = await getGameState(gameId);
    const { data: gameLog } = await supabase.from("game_log").select("*").eq("game_id", gameId).order("created_at", { ascending: true });
    const log = gameLog || [];
    const roundEvents = extractRoundEvents(gameState, log, roundNumber);
    const previousSegments = await loadChronicleSegments(gameId);
    const lastMetrics = previousSegments.length > 0 ? previousSegments[previousSegments.length - 1].civilizationMetrics : { militarism: 0, culture: 0, commerce: 0 };
    const segment = await generateRoundNarrative(
      gameState,
      log,
      roundEvents,
      previousSegments,
      lastMetrics
    );
    await saveChronicleSegment(gameId, segment);
    console.log(`[Chronicle] Round ${roundNumber} narrative saved for game ${gameId}`);
  } catch (error) {
    console.error(`[Chronicle] Failed to generate round ${roundNumber} narrative:`, error);
  }
}
async function assembleAndSaveChronicle(gameId) {
  try {
    const supabase = getSupabase2();
    const gameState = await getGameState(gameId);
    const { data: gameLog } = await supabase.from("game_log").select("*").eq("game_id", gameId).order("created_at", { ascending: true });
    const log = gameLog || [];
    const segments = await loadChronicleSegments(gameId);
    if (segments.length === 0) {
      console.warn("[Chronicle] No segments found, skipping assembly for game", gameId);
      return null;
    }
    const finalMetrics = segments.length > 0 ? segments[segments.length - 1].civilizationMetrics : { militarism: 0, culture: 0, commerce: 0 };
    const result = await assembleChronicle(gameState, segments, log, finalMetrics);
    const playerFactions = gameState.players.filter((p) => p.chosenSin).map((p) => ({ name: p.username, faction: p.chosenSin }));
    const chronicleId = await saveChronicle(gameId, {
      title: result.title,
      excerpt: result.excerpt,
      fullText: result.fullText,
      civilizationType: result.civilizationType,
      rarityTier: result.rarityTier,
      playerFactions,
      totalRounds: gameState.currentRound,
      turningPointRound: result.turningPointRound,
      stats: result.stats
    });
    console.log(`[Chronicle] Full chronicle assembled and saved for game ${gameId} (id: ${chronicleId})`);
    const dominantFactions = playerFactions.map((pf) => pf.faction).filter(Boolean);
    generateAndSaveCoverArt({
      gameId,
      title: result.title,
      civilizationType: result.civilizationType,
      rarityTier: result.rarityTier,
      dominantFactions,
      turningPointRound: result.turningPointRound,
      totalEliminations: result.stats.totalEliminations,
      excerpt: result.excerpt
    }).catch((err) => {
      console.error(`[Chronicle] Cover art generation failed for ${gameId}:`, err);
    });
    return chronicleId;
  } catch (error) {
    console.error("[Chronicle] Failed to assemble chronicle:", error);
    return null;
  }
}

// server/gameEngine.ts
function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
function shuffleDeck(cardIds) {
  const deck = [...cardIds];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
async function ensurePlayer(playerId, username) {
  const sb = getServerSupabase();
  const { data: existing } = await sb.from("players").select("id").eq("id", playerId).single();
  if (!existing) {
    await sb.from("players").insert({ id: playerId, username });
  }
}
async function createGame(playerId, username) {
  const sb = getServerSupabase();
  const roomCode = generateRoomCode();
  const { data: game, error: gameError } = await sb.from("games").insert({ room_code: roomCode, status: "lobby" }).select("id").single();
  if (gameError || !game) throw new Error(`Failed to create game: ${gameError?.message}`);
  await ensurePlayer(playerId, username);
  const { error: joinError } = await sb.from("game_players").insert({
    game_id: game.id,
    player_id: playerId,
    seat_index: 0
  });
  if (joinError) throw new Error(`Failed to join game: ${joinError.message}`);
  await sb.from("game_log").insert({
    game_id: game.id,
    action_type: "game_created",
    action_data: { creator: username },
    round_number: 0
  });
  return { gameId: game.id, roomCode };
}
async function joinGame(roomCode, playerId, username) {
  const sb = getServerSupabase();
  const { data: game, error: gameError } = await sb.from("games").select("id, status").eq("room_code", roomCode.toUpperCase()).single();
  if (gameError || !game) throw new Error("Game not found");
  if (game.status !== "lobby") throw new Error("Game already started");
  const { data: players } = await sb.from("game_players").select("seat_index, player_id").eq("game_id", game.id).order("seat_index");
  if (!players) throw new Error("Failed to fetch players");
  if (players.length >= 4) throw new Error("Game is full");
  const existing = players.find((p) => p.player_id === playerId);
  if (existing) return { gameId: game.id, seatIndex: existing.seat_index };
  const takenSeats = new Set(players.map((p) => p.seat_index));
  let seatIndex = 0;
  while (takenSeats.has(seatIndex)) seatIndex++;
  await ensurePlayer(playerId, username);
  const { error: joinError } = await sb.from("game_players").insert({
    game_id: game.id,
    player_id: playerId,
    seat_index: seatIndex
  });
  if (joinError) throw new Error(`Failed to join: ${joinError.message}`);
  return { gameId: game.id, seatIndex };
}
async function chooseSin(gameId, playerId, sin) {
  const sb = getServerSupabase();
  const { error } = await sb.from("game_players").update({ chosen_sin: sin }).eq("game_id", gameId).eq("player_id", playerId);
  if (error) throw new Error(`Failed to choose sin: ${error.message}`);
}
async function startGame(gameId) {
  const sb = getServerSupabase();
  const { data: players } = await sb.from("game_players").select("*").eq("game_id", gameId).order("seat_index");
  if (!players || players.length < 2) throw new Error("Need at least 2 players");
  const allReady = players.every((p) => p.chosen_sin);
  if (!allReady) throw new Error("All players must choose a sin");
  for (const player of players) {
    const fullDeck = getDeckForSin(player.chosen_sin);
    const customDeckIds = player.custom_deck_ids;
    const deckCards = customDeckIds && Array.isArray(customDeckIds) && customDeckIds.length > 0 ? customDeckIds : shuffleDeck(fullDeck).slice(0, CARDS_PER_DECK);
    const shuffled = shuffleDeck(deckCards);
    const hand = shuffled.slice(0, HAND_SIZE);
    const remainingDeck = shuffled.slice(HAND_SIZE);
    await sb.from("game_players").update({
      hand,
      deck: remainingDeck,
      discard_pile: [],
      current_hp: STARTING_HP,
      max_hp: STARTING_HP,
      is_alive: true,
      current_energy: STARTING_ENERGY,
      max_energy: MAX_ENERGY,
      bonus_energy: 0
    }).eq("id", player.id);
  }
  await sb.from("games").update({
    status: "active",
    current_round: 1,
    current_player_index: 0,
    turn_phase: "selection",
    locked_plays: [],
    started_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", gameId);
  for (const player of players) {
    await sb.from("game_players").update({ locked_cards: [] }).eq("id", player.id);
  }
  await sb.from("game_log").insert({
    game_id: gameId,
    action_type: "game_started",
    action_data: { playerCount: players.length },
    round_number: 1
  });
}
async function lockInCards(gameId, playerId, selections) {
  const sb = getServerSupabase();
  const { data: game } = await sb.from("games").select("*").eq("id", gameId).single();
  if (!game || game.status !== "active") throw new Error("Game not active");
  if (game.turn_phase !== "selection") throw new Error("Not in selection phase");
  const { data: player } = await sb.from("game_players").select("*").eq("game_id", gameId).eq("player_id", playerId).single();
  if (!player) throw new Error("Player not in game");
  if (!player.is_alive) throw new Error("Player is eliminated");
  const hand = player.hand || [];
  let energyBudget = player.current_energy ?? 0;
  const lockedPlays = [];
  for (const sel of selections) {
    if (!hand.includes(sel.cardId)) throw new Error(`Card ${sel.cardId} not in hand`);
    const card = getCardById(sel.cardId);
    if (!card) throw new Error(`Invalid card ${sel.cardId}`);
    if (card.cost > energyBudget) throw new Error(`Not enough energy for ${card.name}`);
    energyBudget -= card.cost;
    lockedPlays.push({
      playerId: player.player_id,
      gamePlayerId: player.id,
      cardId: sel.cardId,
      targetPlayerId: sel.targetPlayerId,
      skipQueue: card.skipQueue || false
    });
  }
  const storedLocked = lockedPlays.length > 0 ? lockedPlays : [{ pass: true }];
  await sb.from("game_players").update({ locked_cards: storedLocked }).eq("id", player.id);
  const existingLocked = (Array.isArray(game.locked_plays) ? game.locked_plays : []).filter(
    (lp) => lp.playerId !== playerId
  );
  const allLocked = [...existingLocked, ...lockedPlays];
  const gameUpdate = { locked_plays: allLocked };
  if (!game.selection_deadline) {
    const timerSeconds = game.turn_timer_seconds ?? SERVER_TURN_TIMER_SECONDS;
    const deadline = new Date(Date.now() + timerSeconds * 1e3).toISOString();
    gameUpdate.selection_deadline = deadline;
  }
  await sb.from("games").update(gameUpdate).eq("id", gameId);
  await sb.from("game_log").insert({
    game_id: gameId,
    player_id: player.id,
    action_type: "lock_in",
    action_data: { cardCount: selections.length, energyRemaining: energyBudget },
    round_number: game.current_round
  });
  const { data: allPlayers } = await sb.from("game_players").select("*").eq("game_id", gameId).order("seat_index");
  const alivePlayers = (allPlayers || []).filter((p) => p.is_alive);
  const allConfirmed = alivePlayers.every((p) => {
    if (p.player_id === playerId) return true;
    const pLocked = Array.isArray(p.locked_cards) ? p.locked_cards : [];
    return pLocked.length > 0;
  });
  if (allConfirmed) {
    const { data: preResGame } = await sb.from("games").select("locked_plays").eq("id", gameId).single();
    const preResLocked = Array.isArray(preResGame?.locked_plays) ? preResGame.locked_plays : allLocked;
    const { data: preResPlayers } = await sb.from("game_players").select("*, players(username)").eq("game_id", gameId).order("seat_index");
    const resolutionPlayers = (preResPlayers || []).map((gp) => {
      const playerLocked = preResLocked.filter((lp) => lp.playerId === gp.player_id);
      return {
        id: gp.player_id,
        gamePlayerId: gp.id,
        username: gp.players?.username || "Unknown",
        seatIndex: gp.seat_index,
        chosenSin: gp.chosen_sin,
        currentHp: gp.current_hp,
        maxHp: gp.max_hp,
        isAlive: gp.is_alive,
        hand: gp.hand || [],
        deckSize: (gp.deck || []).length,
        discardSize: (gp.discard_pile || []).length,
        currentEnergy: gp.current_energy ?? 0,
        maxEnergy: gp.max_energy ?? 0,
        bonusEnergy: gp.bonus_energy ?? 0,
        lockedCards: playerLocked,
        hasLockedIn: playerLocked.length > 0,
        consumedThisRound: gp.consumed_this_round ?? false
      };
    });
    await sb.from("games").update({ turn_phase: "resolution", selection_deadline: null }).eq("id", gameId);
    await resolveLockedPlays(gameId);
    const quip2 = selections.length === 0 ? "Choosing to do nothing? Bold strategy." : selections.length === 1 ? "One card locked. Let fate decide." : `${selections.length} cards locked. The arena trembles.`;
    return {
      success: true,
      narratorQuip: quip2,
      resolvedPlays: preResLocked,
      resolutionPlayers
    };
  }
  const quip = selections.length === 0 ? "Choosing to do nothing? Bold strategy." : selections.length === 1 ? "One card locked. Let fate decide." : `${selections.length} cards locked. The arena trembles.`;
  return { success: true, narratorQuip: quip };
}
async function resolveLockedPlays(gameId) {
  const sb = getServerSupabase();
  const { data: game } = await sb.from("games").select("*").eq("id", gameId).single();
  if (!game) return;
  const { data: allPlayers } = await sb.from("game_players").select("*").eq("game_id", gameId).order("seat_index");
  if (!allPlayers) return;
  const lockedPlays = Array.isArray(game.locked_plays) ? game.locked_plays : [];
  const sortedPlays = [...lockedPlays].sort((a, b) => {
    if (a.skipQueue && !b.skipQueue) return -1;
    if (!a.skipQueue && b.skipQueue) return 1;
    const playerA = allPlayers.find((p) => p.player_id === a.playerId);
    const playerB = allPlayers.find((p) => p.player_id === b.playerId);
    const hpA = playerA?.current_hp ?? 999;
    const hpB = playerB?.current_hp ?? 999;
    if (hpA !== hpB) return hpA - hpB;
    const seatA = playerA?.seat_index ?? 999;
    const seatB = playerB?.seat_index ?? 999;
    if (seatA !== seatB) return seatA - seatB;
    const cardA = getCardById(a.cardId);
    const cardB = getCardById(b.cardId);
    return (cardA?.cost ?? 0) - (cardB?.cost ?? 0);
  });
  for (const play of sortedPlays) {
    const { data: freshPlayer } = await sb.from("game_players").select("*").eq("player_id", play.playerId).eq("game_id", gameId).single();
    if (!freshPlayer || !freshPlayer.is_alive) continue;
    const card = getCardById(play.cardId);
    if (!card) continue;
    const { data: currentPlayers } = await sb.from("game_players").select("*").eq("game_id", gameId).order("seat_index");
    if (!currentPlayers) continue;
    const currentEnergy = freshPlayer.current_energy ?? 0;
    let newEnergy = Math.max(0, currentEnergy - card.cost);
    const sin = freshPlayer.chosen_sin;
    const hand = freshPlayer.hand || [];
    const newHand = hand.filter((id) => id !== play.cardId);
    const discard = freshPlayer.discard_pile || [];
    discard.push(play.cardId);
    await sb.from("game_players").update({ hand: newHand, discard_pile: discard, current_energy: newEnergy }).eq("id", freshPlayer.id);
    const effectDescriptions = [];
    for (const effect of card.effects) {
      const targets = resolveTargets(effect, freshPlayer, currentPlayers, play.targetPlayerId);
      const firstTickValue = getCompoundTickValue(effect.baseValue, card.compoundPattern, 0);
      for (const target of targets) {
        await applyInstantEffect(effect.type, firstTickValue, target, gameId, freshPlayer.player_id);
        if (sin === "envy" && effect.type === "damage" && target.player_id !== play.playerId) {
          await amplifyWorstAfflictionPct(gameId, target.id, ENVY_JEALOUSY_PCT);
        }
        if (effect.duration > 1) {
          await sb.from("active_effects").insert({
            game_id: gameId,
            target_player_id: target.id,
            source_player_id: freshPlayer.id,
            effect_type: effect.type,
            base_value: effect.baseValue,
            applied_at_round: game.current_round,
            duration_rounds: effect.duration,
            card_id: play.cardId,
            current_tick: 1,
            compound_pattern: card.compoundPattern
          });
        }
        effectDescriptions.push(
          `${effect.type} ${firstTickValue} on ${target.player_id === play.playerId ? "self" : "enemy"} (${card.compoundPattern} \xD7${effect.duration}r)`
        );
      }
    }
    await sb.from("game_log").insert({
      game_id: gameId,
      player_id: freshPlayer.id,
      action_type: "play_card",
      action_data: {
        cardId: play.cardId,
        targetPlayerId: play.targetPlayerId,
        effects: effectDescriptions,
        compoundPattern: card.compoundPattern,
        energySpent: card.cost,
        energyRemaining: newEnergy,
        resolvedInPhase: "resolution"
      },
      round_number: game.current_round
    });
  }
  try {
    const { data: currentGame } = await sb.from("games").select("ai_narrator").eq("id", gameId).single();
    if (currentGame?.ai_narrator) {
      generateAndSaveRoundNarrative(gameId, game.current_round).catch(
        (err) => console.error("[Chronicle] Round narrative failed:", err)
      );
    }
  } catch (e) {
    console.error("[Chronicle] Failed to check AI narrator setting:", e);
  }
  await advanceRound(gameId);
}
async function playCard(gameId, playerId, cardId, targetPlayerId) {
  const result = await lockInCards(gameId, playerId, [{ cardId, targetPlayerId }]);
  return { narratorQuip: result.narratorQuip, effects: [] };
}
async function passTurn(gameId, playerId) {
  await lockInCards(gameId, playerId, []);
}
async function getGameState(gameId) {
  const sb = getServerSupabase();
  const { data: game } = await sb.from("games").select("*").eq("id", gameId).single();
  if (!game) throw new Error("Game not found");
  const { data: gamePlayers } = await sb.from("game_players").select("*, players(username)").eq("game_id", gameId).order("seat_index");
  const { data: effects } = await sb.from("active_effects").select("*").eq("game_id", gameId);
  const rawLocked = game.locked_plays;
  const allLockedPlays = Array.isArray(rawLocked) ? rawLocked : [];
  const players = (gamePlayers || []).map((gp) => {
    const playerLocked = allLockedPlays.filter((lp) => lp.playerId === gp.player_id);
    const gpLockedCards = Array.isArray(gp.locked_cards) ? gp.locked_cards : [];
    return {
      id: gp.player_id,
      gamePlayerId: gp.id,
      username: gp.players?.username || "Unknown",
      seatIndex: gp.seat_index,
      chosenSin: gp.chosen_sin,
      currentHp: gp.current_hp,
      maxHp: gp.max_hp,
      isAlive: gp.is_alive,
      hand: gp.hand || [],
      deckSize: (gp.deck || []).length,
      discardSize: (gp.discard_pile || []).length,
      currentEnergy: gp.current_energy ?? 0,
      maxEnergy: gp.max_energy ?? 0,
      bonusEnergy: gp.bonus_energy ?? 0,
      lockedCards: playerLocked.length > 0 ? playerLocked : gpLockedCards,
      hasLockedIn: gpLockedCards.length > 0 || playerLocked.length > 0,
      consumedThisRound: gp.consumed_this_round ?? false
    };
  });
  const activeEffects = (effects || []).map((e) => ({
    id: e.id,
    targetPlayerId: e.target_player_id,
    sourcePlayerId: e.source_player_id,
    effectType: e.effect_type,
    baseValue: e.base_value,
    appliedAtRound: e.applied_at_round,
    durationRounds: e.duration_rounds,
    cardId: e.card_id,
    currentTick: e.current_tick ?? void 0,
    compoundPattern: e.compound_pattern ?? void 0,
    doubled: e.doubled ?? void 0
  }));
  return {
    id: game.id,
    roomCode: game.room_code,
    status: game.status,
    currentRound: game.current_round,
    currentPlayerIndex: game.current_player_index ?? 0,
    turnPhase: game.turn_phase || "selection",
    lockedPlays: allLockedPlays,
    players,
    activeEffects,
    winnerId: game.winner_id,
    selectionDeadline: game.selection_deadline ?? null,
    turnTimerSeconds: game.turn_timer_seconds ?? 15,
    aiNarrator: game.ai_narrator ?? true,
    aiWhisperer: game.ai_whisperer ?? true
  };
}
async function getGameLog(gameId) {
  const sb = getServerSupabase();
  const { data } = await sb.from("game_log").select("*").eq("game_id", gameId).order("timestamp", { ascending: true });
  return data || [];
}
async function consumeCard(gameId, playerId, cardId) {
  const sb = getServerSupabase();
  const { data: game } = await sb.from("games").select("current_round").eq("id", gameId).single();
  const { data: gp, error } = await sb.from("game_players").select("*").eq("game_id", gameId).eq("player_id", playerId).single();
  if (error || !gp) return { success: false, message: "The void cannot find you." };
  if (!gp.is_alive) return { success: false, message: "The dead cannot sacrifice." };
  if (gp.consumed_this_round) return { success: false, message: "The void has had its fill this round." };
  const hand = gp.hand || [];
  if (!hand.includes(cardId)) return { success: false, message: "That card has already slipped away." };
  const newHand = hand.filter((id) => id !== cardId);
  const newEnergy = Math.min((gp.current_energy || 0) + CONSUME_ENERGY_REFUND, MAX_ENERGY);
  await sb.from("game_players").update({
    hand: newHand,
    current_energy: newEnergy,
    consumed_this_round: true
  }).eq("game_id", gameId).eq("player_id", playerId);
  const card = getCardById(cardId);
  await sb.from("game_log").insert({
    game_id: gameId,
    round_number: game?.current_round || 1,
    player_id: playerId,
    action_type: "consume",
    action_data: {
      cardId,
      cardName: card?.name || cardId,
      energyRefund: CONSUME_ENERGY_REFUND,
      newEnergy
    }
  });
  return {
    success: true,
    message: `Banished ${card?.name || "a card"} to the void. +${CONSUME_ENERGY_REFUND} energy.`
  };
}
function resolveTargets(effect, source, allPlayers, targetPlayerId) {
  const alive = allPlayers.filter((p) => p.is_alive);
  switch (effect.targetMode) {
    case "self":
      return [source];
    case "single": {
      if (targetPlayerId) {
        const target = alive.find((p) => p.player_id === targetPlayerId);
        return target ? [target] : [];
      }
      const enemies = alive.filter((p) => p.player_id !== source.player_id);
      return enemies.sort((a, b) => a.current_hp - b.current_hp).slice(0, 1);
    }
    case "duo": {
      const enemies = alive.filter((p) => p.player_id !== source.player_id);
      return enemies.sort((a, b) => a.current_hp - b.current_hp).slice(0, 2);
    }
    case "aoe":
      return alive.filter((p) => p.player_id !== source.player_id);
    default:
      return [];
  }
}
async function applyInstantEffect(type, value, target, gameId, sourcePlayerId) {
  const sb = getServerSupabase();
  const roundedValue = Math.round(value);
  switch (type) {
    case "damage":
    case "self_damage": {
      let remainingDamage = roundedValue;
      if (gameId) {
        const { data: shields } = await sb.from("active_effects").select("*").eq("game_id", gameId).eq("target_player_id", target.id).in("effect_type", ["shield_gain"]);
        if (shields && shields.length > 0) {
          for (const shield of shields) {
            if (remainingDamage <= 0) break;
            const shieldValue = shield.base_value;
            if (shieldValue <= remainingDamage) {
              remainingDamage -= shieldValue;
              await sb.from("active_effects").delete().eq("id", shield.id);
            } else {
              await sb.from("active_effects").update({ base_value: shieldValue - remainingDamage }).eq("id", shield.id);
              remainingDamage = 0;
            }
          }
        }
      }
      if (remainingDamage > 0) {
        const newHp = Math.max(0, target.current_hp - remainingDamage);
        const isAlive = newHp > 0;
        await sb.from("game_players").update({ current_hp: newHp, is_alive: isAlive }).eq("id", target.id);
        target.current_hp = newHp;
        target.is_alive = isAlive;
        if (target.chosen_sin === "wrath" && target.is_alive && sourcePlayerId && sourcePlayerId !== target.player_id) {
          const reflectDmg = Math.round(remainingDamage * WRATH_VENGEANCE_PCT);
          if (reflectDmg > 0 && gameId) {
            const { data: attacker } = await sb.from("game_players").select("*").eq("player_id", sourcePlayerId).eq("game_id", gameId).single();
            if (attacker && attacker.is_alive) {
              const newAttackerHp = Math.max(0, attacker.current_hp - reflectDmg);
              const attackerAlive = newAttackerHp > 0;
              await sb.from("game_players").update({ current_hp: newAttackerHp, is_alive: attackerAlive }).eq("id", attacker.id);
            }
          }
        }
      }
      break;
    }
    case "heal_gain": {
      const newHp = Math.min(target.max_hp ?? STARTING_HP, target.current_hp + roundedValue);
      await sb.from("game_players").update({ current_hp: newHp }).eq("id", target.id);
      target.current_hp = newHp;
      break;
    }
    case "heal_steal": {
      const stolen = Math.min(roundedValue, target.current_hp);
      const newTargetHp = Math.max(0, target.current_hp - stolen);
      const isAlive = newTargetHp > 0;
      await sb.from("game_players").update({ current_hp: newTargetHp, is_alive: isAlive }).eq("id", target.id);
      target.current_hp = newTargetHp;
      target.is_alive = isAlive;
      if (sourcePlayerId && gameId) {
        const { data: sourcePlayer } = await sb.from("game_players").select("*").eq("player_id", sourcePlayerId).eq("game_id", gameId).single();
        if (sourcePlayer) {
          const newSourceHp = Math.min(sourcePlayer.max_hp ?? STARTING_HP, sourcePlayer.current_hp + stolen);
          await sb.from("game_players").update({ current_hp: newSourceHp }).eq("id", sourcePlayer.id);
        }
      }
      break;
    }
    case "shield_gain": {
      if (gameId) {
        await sb.from("active_effects").insert({
          game_id: gameId,
          target_player_id: target.id,
          source_player_id: sourcePlayerId || target.id,
          effect_type: "shield_gain",
          base_value: roundedValue,
          applied_at_round: 0,
          duration_rounds: 1,
          card_id: "instant-shield"
        });
      }
      break;
    }
    case "shield_steal": {
      if (gameId) {
        const { data: shields } = await sb.from("active_effects").select("*").eq("game_id", gameId).eq("target_player_id", target.id).eq("effect_type", "shield_gain");
        let stolen = 0;
        if (shields && shields.length > 0) {
          for (const shield of shields) {
            if (stolen >= roundedValue) break;
            const take = Math.min(shield.base_value, roundedValue - stolen);
            stolen += take;
            if (take >= shield.base_value) {
              await sb.from("active_effects").delete().eq("id", shield.id);
            } else {
              await sb.from("active_effects").update({ base_value: shield.base_value - take }).eq("id", shield.id);
            }
          }
        }
        if (stolen > 0 && sourcePlayerId) {
          await sb.from("active_effects").insert({
            game_id: gameId,
            target_player_id: sourcePlayerId,
            source_player_id: sourcePlayerId,
            effect_type: "shield_gain",
            base_value: stolen,
            applied_at_round: 0,
            duration_rounds: 1,
            card_id: "stolen-shield"
          });
        }
      }
      break;
    }
    case "energy_gain": {
      const currentSelfEnergy = target.current_energy ?? 0;
      const newEnergy = Math.min(currentSelfEnergy + roundedValue, MAX_ENERGY);
      await sb.from("game_players").update({ current_energy: newEnergy }).eq("id", target.id);
      target.current_energy = newEnergy;
      break;
    }
    case "energy_steal": {
      const currentTargetEnergy = target.current_energy ?? 0;
      const drained = Math.min(roundedValue, currentTargetEnergy);
      await sb.from("game_players").update({ current_energy: currentTargetEnergy - drained }).eq("id", target.id);
      target.current_energy = currentTargetEnergy - drained;
      if (sourcePlayerId && gameId) {
        const { data: sourcePlayer } = await sb.from("game_players").select("*").eq("player_id", sourcePlayerId).eq("game_id", gameId).single();
        if (sourcePlayer) {
          const newEnergy = Math.min((sourcePlayer.current_energy ?? 0) + drained, MAX_ENERGY);
          await sb.from("game_players").update({ current_energy: newEnergy }).eq("id", sourcePlayer.id);
        }
      }
      break;
    }
    case "energy_block":
    case "heal_block":
    case "shield_block": {
      if (gameId) {
        await sb.from("active_effects").insert({
          game_id: gameId,
          target_player_id: target.id,
          source_player_id: sourcePlayerId || target.id,
          effect_type: type,
          base_value: roundedValue,
          applied_at_round: 0,
          duration_rounds: roundedValue,
          card_id: "block-effect"
        });
      }
      break;
    }
    case "affliction_amplify": {
      if (gameId) {
        await amplifyWorstAffliction(gameId, target.id, roundedValue);
      }
      break;
    }
    case "affliction_transfer": {
      if (gameId && sourcePlayerId) {
        const { data: sourceEffects } = await sb.from("active_effects").select("*").eq("game_id", gameId).eq("target_player_id", sourcePlayerId).in("effect_type", ["damage", "self_damage"]);
        if (sourceEffects && sourceEffects.length > 0) {
          const worst = sourceEffects.sort((a, b) => b.base_value - a.base_value)[0];
          await sb.from("active_effects").update({ target_player_id: target.id }).eq("id", worst.id);
        }
      }
      break;
    }
    case "discard_burn": {
      const discard = target.discard_pile || [];
      const burnCount = Math.min(roundedValue, discard.length);
      if (burnCount > 0) {
        const newDiscard = discard.slice(burnCount);
        await sb.from("game_players").update({ discard_pile: newDiscard }).eq("id", target.id);
        target.discard_pile = newDiscard;
        if (sourcePlayerId && gameId) {
          const { data: sourcePlayer } = await sb.from("game_players").select("*").eq("player_id", sourcePlayerId).eq("game_id", gameId).single();
          if (sourcePlayer && sourcePlayer.chosen_sin === "gluttony") {
            const energyGain = Math.round(burnCount * GLUTTONY_DEVOURER_ENERGY);
            const newEnergy = Math.min((sourcePlayer.current_energy ?? 0) + energyGain, MAX_ENERGY);
            await sb.from("game_players").update({ current_energy: newEnergy }).eq("id", sourcePlayer.id);
          }
        }
      }
      break;
    }
    case "energy_regen": {
      const currentEnergy = target.current_energy ?? 0;
      const newEnergy = Math.min(currentEnergy + roundedValue, MAX_ENERGY);
      await sb.from("game_players").update({ current_energy: newEnergy }).eq("id", target.id);
      target.current_energy = newEnergy;
      break;
    }
    case "draw_boost": {
      for (let i = 0; i < roundedValue; i++) {
        await drawCard(target);
      }
      break;
    }
    case "draw_reduction": {
      const hand = target.hand || [];
      const discardCount = Math.min(roundedValue, hand.length);
      if (discardCount > 0) {
        const discarded = hand.splice(0, discardCount);
        const discard = target.discard_pile || [];
        discard.push(...discarded);
        await sb.from("game_players").update({ hand, discard_pile: discard }).eq("id", target.id);
        target.hand = hand;
        target.discard_pile = discard;
      }
      break;
    }
  }
}
async function amplifyWorstAffliction(gameId, targetId, amount) {
  const sb = getServerSupabase();
  const { data: effects } = await sb.from("active_effects").select("*").eq("game_id", gameId).eq("target_player_id", targetId).in("effect_type", ["damage", "self_damage"]);
  if (effects && effects.length > 0) {
    const worst = effects.sort((a, b) => b.base_value - a.base_value)[0];
    await sb.from("active_effects").update({ base_value: worst.base_value + amount }).eq("id", worst.id);
  }
}
async function amplifyWorstAfflictionPct(gameId, targetId, pct) {
  const sb = getServerSupabase();
  const { data: effects } = await sb.from("active_effects").select("*").eq("game_id", gameId).eq("target_player_id", targetId).in("effect_type", ["damage", "self_damage"]);
  if (effects && effects.length > 0) {
    const worst = effects.sort((a, b) => b.base_value - a.base_value)[0];
    const newValue = Math.round(worst.base_value * (1 + pct));
    await sb.from("active_effects").update({ base_value: newValue }).eq("id", worst.id);
  }
}
async function drawCard(player) {
  const sb = getServerSupabase();
  let deck = player.deck || [];
  const hand = player.hand || [];
  let discard = player.discard_pile || [];
  if (deck.length === 0 && discard.length > 0) {
    deck = shuffleDeck(discard);
    discard = [];
  }
  if (hand.length >= MAX_HAND_SIZE) return;
  if (deck.length > 0) {
    const drawn = deck.shift();
    hand.push(drawn);
    while (hand.length > MAX_HAND_SIZE) {
      const overflow = hand.pop();
      discard.push(overflow);
    }
    await sb.from("game_players").update({ hand, deck, discard_pile: discard }).eq("id", player.id);
  }
}
async function advanceRound(gameId) {
  const sb = getServerSupabase();
  const { data: game } = await sb.from("games").select("*").eq("id", gameId).single();
  if (!game) return;
  const { data: allPlayers } = await sb.from("game_players").select("*").eq("game_id", gameId).order("seat_index");
  if (!allPlayers) return;
  const alivePlayers = allPlayers.filter((p) => p.is_alive);
  if (alivePlayers.length <= 1) {
    const winner = alivePlayers[0];
    await sb.from("games").update({
      status: "finished",
      winner_id: winner?.player_id || null,
      finished_at: (/* @__PURE__ */ new Date()).toISOString(),
      turn_phase: "round_end"
    }).eq("id", gameId);
    try {
      if (game.ai_narrator) {
        assembleAndSaveChronicle(gameId).catch(
          (err) => console.error("[Chronicle] Assembly failed (elimination):", err)
        );
      }
    } catch (e) {
      console.error("[Chronicle] Failed to trigger assembly:", e);
    }
    return;
  }
  const newRound = game.current_round + 1;
  if (newRound > MAX_ROUNDS || game.current_round === FINAL_RECKONING_ROUND) {
    if (game.current_round === FINAL_RECKONING_ROUND) {
      for (const p of alivePlayers) {
        const hand = p.hand || [];
        for (const cardId of hand) {
          const card = getCardById(cardId);
          if (!card) continue;
          const enemies = alivePlayers.filter((e) => e.id !== p.id && e.is_alive);
          const target = enemies.sort((a, b) => a.current_hp - b.current_hp)[0];
          if (!target) continue;
          for (const effect of card.effects) {
            const targetId = effect.targetMode === "self" ? p.id : target.id;
            await sb.from("active_effects").insert({
              game_id: gameId,
              target_player_id: targetId,
              source_player_id: p.id,
              effect_type: effect.type,
              base_value: effect.baseValue,
              applied_at_round: game.current_round,
              duration_rounds: effect.duration,
              card_id: cardId,
              compound_pattern: card.compoundPattern,
              current_tick: 0
            });
          }
        }
        await sb.from("game_players").update({ hand: [] }).eq("id", p.id);
      }
      await resolveActiveEffects(gameId, game.current_round);
    }
    const { data: postReckoningPlayers } = await sb.from("game_players").select("*").eq("game_id", gameId).eq("is_alive", true).order("current_hp", { ascending: false });
    const sortedByHp = postReckoningPlayers || alivePlayers;
    const winner = sortedByHp[0];
    await sb.from("games").update({
      status: "finished",
      winner_id: winner?.player_id || null,
      finished_at: (/* @__PURE__ */ new Date()).toISOString(),
      current_round: MAX_ROUNDS,
      turn_phase: "round_end"
    }).eq("id", gameId);
    try {
      if (game.ai_narrator) {
        assembleAndSaveChronicle(gameId).catch(
          (err) => console.error("[Chronicle] Assembly failed (reckoning):", err)
        );
      }
    } catch (e) {
      console.error("[Chronicle] Failed to trigger assembly:", e);
    }
    return;
  }
  if (newRound === ROUND_16_DOUBLING) {
    await doubleAllAfflictions(gameId);
  }
  await resolveActiveEffects(gameId, newRound);
  const { data: postEffectPlayers } = await sb.from("game_players").select("*").eq("game_id", gameId).order("seat_index");
  const stillAlive = (postEffectPlayers || []).filter((p) => p.is_alive);
  if (stillAlive.length <= 1) {
    const winner = stillAlive[0];
    await sb.from("games").update({
      status: "finished",
      winner_id: winner?.player_id || null,
      finished_at: (/* @__PURE__ */ new Date()).toISOString(),
      turn_phase: "round_end"
    }).eq("id", gameId);
    try {
      if (game.ai_narrator) {
        assembleAndSaveChronicle(gameId).catch(
          (err) => console.error("[Chronicle] Assembly failed (mid-round):", err)
        );
      }
    } catch (e) {
      console.error("[Chronicle] Failed to trigger assembly:", e);
    }
    return;
  }
  for (const p of stillAlive) {
    const { data: freshPlayer } = await sb.from("game_players").select("*").eq("id", p.id).single();
    if (freshPlayer && freshPlayer.is_alive) {
      if (freshPlayer.chosen_sin === "sloth") {
        const energy = freshPlayer.current_energy ?? 0;
        const handSize = (freshPlayer.hand || []).length;
        const shieldVal = Math.min(Math.round(energy * handSize * SLOTH_ENDURANCE_MULT), SLOTH_ENDURANCE_CAP);
        if (shieldVal > 0) {
          await sb.from("active_effects").insert({
            game_id: gameId,
            target_player_id: freshPlayer.id,
            source_player_id: freshPlayer.id,
            effect_type: "shield_gain",
            base_value: shieldVal,
            applied_at_round: newRound,
            duration_rounds: 1,
            card_id: "sloth-endurance-v5"
          });
        }
        const aoeDmg = Math.round(energy * SLOTH_ENDURANCE_AOE_MULT);
        if (aoeDmg > 0) {
          const enemies = stillAlive.filter((e) => e.id !== freshPlayer.id);
          for (const enemy of enemies) {
            const { data: enemyFresh } = await sb.from("game_players").select("*").eq("id", enemy.id).single();
            if (enemyFresh && enemyFresh.is_alive) {
              await applyInstantEffect("damage", aoeDmg, enemyFresh, gameId, freshPlayer.player_id);
            }
          }
        }
      }
      await refreshPlayerEnergy(freshPlayer);
      await drawCard(freshPlayer);
    }
  }
  for (const p of allPlayers) {
    await sb.from("game_players").update({ consumed_this_round: false }).eq("id", p.id);
  }
  await sb.from("games").update({
    current_round: newRound,
    current_player_index: 0,
    turn_phase: "round_end"
    // Keep locked_plays intact so non-triggering clients can read them
  }).eq("id", gameId);
  await new Promise((resolve) => setTimeout(resolve, 4e3));
  try {
    await sb.from("games").update({
      turn_phase: "selection",
      locked_plays: [],
      selection_deadline: null
    }).eq("id", gameId);
    for (const p of allPlayers) {
      await sb.from("game_players").update({ locked_cards: [] }).eq("id", p.id);
    }
  } catch (e) {
    console.error("[advanceRound] delayed clear failed:", e);
  }
}
async function refreshPlayerEnergy(player) {
  const sb = getServerSupabase();
  const totalEnergy = MAX_ENERGY;
  await sb.from("game_players").update({
    current_energy: totalEnergy,
    max_energy: totalEnergy,
    bonus_energy: 0
  }).eq("id", player.id);
}
async function doubleAllAfflictions(gameId) {
  const sb = getServerSupabase();
  const { data: effects } = await sb.from("active_effects").select("*").eq("game_id", gameId);
  if (!effects) return;
  for (const effect of effects) {
    if (["damage", "self_damage"].includes(effect.effect_type) && !effect.doubled) {
      await sb.from("active_effects").update({ base_value: effect.base_value * 2, doubled: true }).eq("id", effect.id);
    }
  }
}
async function resolveActiveEffects(gameId, currentRound) {
  const sb = getServerSupabase();
  const { data: effects } = await sb.from("active_effects").select("*").eq("game_id", gameId);
  if (!effects) return;
  for (const effect of effects) {
    if (["shield_gain", "heal_block", "shield_block", "energy_block"].includes(effect.effect_type)) {
      if (effect.effect_type.endsWith("_block")) {
        const roundsActive = currentRound - effect.applied_at_round;
        if (roundsActive > effect.duration_rounds) {
          await sb.from("active_effects").delete().eq("id", effect.id);
        }
      }
      continue;
    }
    const tick = effect.current_tick ?? 0;
    const pattern = effect.compound_pattern || "standard";
    if (tick >= effect.duration_rounds) {
      await sb.from("active_effects").delete().eq("id", effect.id);
      continue;
    }
    const { data: target } = await sb.from("game_players").select("*").eq("id", effect.target_player_id).single();
    if (!target || !target.is_alive) {
      await sb.from("active_effects").delete().eq("id", effect.id);
      continue;
    }
    const tickValue = getCompoundTickValue(effect.base_value, pattern, tick);
    await applyInstantEffect(effect.effect_type, tickValue, target, gameId, effect.source_player_id);
    if (["damage"].includes(effect.effect_type) && effect.source_player_id) {
      const { data: sourcePlayer } = await sb.from("game_players").select("*").eq("player_id", effect.source_player_id).eq("game_id", gameId).single();
      if (sourcePlayer && sourcePlayer.chosen_sin === "lust" && sourcePlayer.is_alive) {
        const healAmt = Math.round(tickValue * LUST_TEMPTATION_PCT);
        if (healAmt > 0) {
          await applyInstantEffect("heal_gain", healAmt, sourcePlayer, gameId, effect.source_player_id);
        }
      }
    }
    if (["damage"].includes(effect.effect_type) && tick === GREED_TAX_TICK && effect.source_player_id) {
      const { data: sourcePlayer } = await sb.from("game_players").select("*").eq("player_id", effect.source_player_id).eq("game_id", gameId).single();
      if (sourcePlayer && sourcePlayer.chosen_sin === "greed" && sourcePlayer.is_alive) {
        const shieldAmt = Math.round(tickValue * GREED_TAX_PCT);
        if (shieldAmt > 0) {
          await sb.from("active_effects").insert({
            game_id: gameId,
            target_player_id: sourcePlayer.id,
            source_player_id: sourcePlayer.id,
            effect_type: "shield_gain",
            base_value: shieldAmt,
            applied_at_round: currentRound,
            duration_rounds: 1,
            card_id: "greed-tax-v5"
          });
        }
      }
    }
    const nextTick = tick + 1;
    if (nextTick >= effect.duration_rounds) {
      await sb.from("active_effects").delete().eq("id", effect.id);
    } else {
      await sb.from("active_effects").update({ current_tick: nextTick }).eq("id", effect.id);
    }
  }
}
async function enforceSelectionDeadline(gameId) {
  const sb = getServerSupabase();
  const { data: game } = await sb.from("games").select("*").eq("id", gameId).single();
  if (!game || game.status !== "active" || game.turn_phase !== "selection") {
    return { enforced: false };
  }
  if (!game.selection_deadline) {
    return { enforced: false };
  }
  const deadline = new Date(game.selection_deadline).getTime();
  const now = Date.now();
  if (now < deadline) {
    return { enforced: false };
  }
  const { data: allPlayers } = await sb.from("game_players").select("*, players(username)").eq("game_id", gameId).order("seat_index");
  if (!allPlayers) return { enforced: false };
  const alivePlayers = allPlayers.filter((p) => p.is_alive);
  let autoPassCount = 0;
  for (const p of alivePlayers) {
    const pLocked = Array.isArray(p.locked_cards) ? p.locked_cards : [];
    if (pLocked.length === 0) {
      await sb.from("game_players").update({ locked_cards: [{ pass: true }] }).eq("id", p.id);
      autoPassCount++;
      await sb.from("game_log").insert({
        game_id: gameId,
        player_id: p.id,
        action_type: "auto_pass",
        action_data: { reason: "selection_deadline_expired" },
        round_number: game.current_round
      });
    }
  }
  const autoPassedPlayerNames = alivePlayers.filter((p) => {
    const pLocked = Array.isArray(p.locked_cards) ? p.locked_cards : [];
    return pLocked.length === 0;
  }).map((p) => p.players?.username || "Unknown");
  if (autoPassCount === 0) {
    return { enforced: false };
  }
  const existingLocked = Array.isArray(game.locked_plays) ? game.locked_plays : [];
  const resolutionPlayers = allPlayers.map((gp) => {
    const playerLocked = existingLocked.filter((lp) => lp.playerId === gp.player_id);
    return {
      id: gp.player_id,
      gamePlayerId: gp.id,
      username: gp.players?.username || "Unknown",
      seatIndex: gp.seat_index,
      chosenSin: gp.chosen_sin,
      currentHp: gp.current_hp,
      maxHp: gp.max_hp,
      isAlive: gp.is_alive,
      hand: gp.hand || [],
      deckSize: (gp.deck || []).length,
      discardSize: (gp.discard_pile || []).length,
      currentEnergy: gp.current_energy ?? 0,
      maxEnergy: gp.max_energy ?? 0,
      bonusEnergy: gp.bonus_energy ?? 0,
      lockedCards: playerLocked,
      hasLockedIn: true,
      consumedThisRound: gp.consumed_this_round ?? false
    };
  });
  await sb.from("games").update({ turn_phase: "resolution", selection_deadline: null }).eq("id", gameId);
  await resolveLockedPlays(gameId);
  return {
    enforced: true,
    resolvedPlays: existingLocked,
    resolutionPlayers,
    autoPassedPlayerNames
  };
}

// server/profanityFilter.ts
import leoProfanity from "leo-profanity";
var BANNED_SUBSTRINGS = [
  // Common profanity (substring match catches embedded words)
  "fuck",
  "shit",
  "cunt",
  "cock",
  "dick",
  "pussy",
  "bitch",
  "asshole",
  "bastard",
  "whore",
  "slut",
  "penis",
  "vagina",
  // Racial slurs & hate speech
  "nigger",
  "nigga",
  "negro",
  "nazi",
  "hitler",
  "kkk",
  "whitesupremacy",
  "whitepower",
  "heil",
  "jihad",
  "faggot",
  "fag",
  "dyke",
  "tranny",
  "retard",
  "chink",
  "gook",
  "spic",
  "wetback",
  "kike",
  // Impersonation
  "admin",
  "moderator",
  "developer",
  "official",
  "system",
  "support",
  "staff",
  "gamemaster"
];
var MIN_LENGTH = 3;
var MAX_LENGTH = 24;
var VALID_CHARS = /^[a-zA-Z0-9_\-. ]+$/;
var NO_CONSECUTIVE_SPECIALS = /[_\-. ]{2,}/;
var STARTS_ENDS_ALNUM = /^[a-zA-Z0-9].*[a-zA-Z0-9]$/;
function validateGamertag(tag) {
  const trimmed = tag.trim();
  if (trimmed.length < MIN_LENGTH) {
    return { ok: false, reason: `Must be at least ${MIN_LENGTH} characters.` };
  }
  if (trimmed.length > MAX_LENGTH) {
    return { ok: false, reason: `Must be ${MAX_LENGTH} characters or fewer.` };
  }
  if (!VALID_CHARS.test(trimmed)) {
    return { ok: false, reason: "Only letters, numbers, underscores, hyphens, dots, and spaces allowed." };
  }
  if (NO_CONSECUTIVE_SPECIALS.test(trimmed)) {
    return { ok: false, reason: "No consecutive special characters (_, -, ., space)." };
  }
  if (trimmed.length >= 2 && !STARTS_ENDS_ALNUM.test(trimmed)) {
    return { ok: false, reason: "Must start and end with a letter or number." };
  }
  const normalized = trimmed.toLowerCase().replace(/[_\-. ]/g, "");
  if (leoProfanity.check(normalized) || leoProfanity.check(trimmed)) {
    return { ok: false, reason: "That name contains inappropriate language. Choose something else." };
  }
  for (const banned of BANNED_SUBSTRINGS) {
    if (normalized.includes(banned)) {
      return { ok: false, reason: "That name contains inappropriate language. Choose something else." };
    }
  }
  return { ok: true };
}

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  /** Discussion comments — threaded community discussion on analysis pages */
  discussion: router({
    /** List all comments for a page context (e.g. "balance") */
    list: publicProcedure.input(z3.object({ pageContext: z3.string().min(1).max(64).default("balance") })).query(async ({ input }) => {
      return getDiscussionComments(input.pageContext);
    }),
    /** Create a new comment or reply */
    create: publicProcedure.input(
      z3.object({
        pageContext: z3.string().min(1).max(64).default("balance"),
        section: z3.string().max(64).optional(),
        parentId: z3.number().int().positive().optional(),
        authorName: z3.string().min(1).max(100).transform((s) => s.replace(/[<>"'&]/g, "")),
        guestId: z3.string().max(64).optional(),
        content: z3.string().min(1).max(2e3).transform((s) => s.replace(/[<>"']/g, ""))
      })
    ).mutation(async ({ input }) => {
      const result = await createDiscussionComment({
        pageContext: input.pageContext,
        section: input.section ?? null,
        parentId: input.parentId ?? null,
        userId: null,
        // Guest comments for now; wire to ctx.user when auth is active
        authorName: input.authorName,
        guestId: input.guestId ?? null,
        content: input.content
      });
      return result;
    }),
    /** Delete a comment — requires guestId for ownership verification */
    delete: publicProcedure.input(z3.object({
      commentId: z3.number().int().positive(),
      guestId: z3.string().max(64).optional()
    })).mutation(async ({ input }) => {
      return deleteDiscussionComment(input.commentId, input.guestId);
    }),
    /** Upvote a comment */
    upvote: publicProcedure.input(z3.object({ commentId: z3.number().int().positive() })).mutation(async ({ input }) => {
      return upvoteDiscussionComment(input.commentId);
    })
  }),
  /** Player deck management — CRUD for custom 30-card decks */
  deck: router({
    /** List all decks for a Supabase user */
    list: publicProcedure.input(z3.object({ supabaseUserId: z3.string().min(1).max(64) })).query(async ({ input }) => {
      return getDecksByUser(input.supabaseUserId);
    }),
    /** Get a single deck by ID */
    get: publicProcedure.input(z3.object({ deckId: z3.number().int().positive() })).query(async ({ input }) => {
      return getDeckById(input.deckId) ?? null;
    }),
    /** Create a new deck (30 cards from a single faction) */
    create: publicProcedure.input(
      z3.object({
        supabaseUserId: z3.string().min(1).max(64),
        faction: z3.string().min(1).max(32),
        name: z3.string().min(1).max(100).transform((s) => s.replace(/[<>"'&]/g, "")),
        cardIds: z3.string().min(2),
        // JSON array string
        isActive: z3.number().int().min(0).max(1).default(0)
      })
    ).mutation(async ({ input }) => {
      let parsed;
      try {
        parsed = JSON.parse(input.cardIds);
      } catch {
        throw new Error("cardIds must be a valid JSON array");
      }
      if (!Array.isArray(parsed) || parsed.length !== 30) {
        throw new Error("Deck must contain exactly 30 cards");
      }
      return createDeck(input);
    }),
    /** Update an existing deck */
    update: publicProcedure.input(
      z3.object({
        deckId: z3.number().int().positive(),
        supabaseUserId: z3.string().min(1).max(64),
        // for ownership check
        name: z3.string().min(1).max(100).transform((s) => s.replace(/[<>"'&]/g, "")).optional(),
        cardIds: z3.string().min(2).optional()
      })
    ).mutation(async ({ input }) => {
      const deck = await getDeckById(input.deckId);
      if (!deck || deck.supabaseUserId !== input.supabaseUserId) {
        throw new Error("Deck not found or access denied");
      }
      if (input.cardIds) {
        let parsed;
        try {
          parsed = JSON.parse(input.cardIds);
        } catch {
          throw new Error("cardIds must be a valid JSON array");
        }
        if (!Array.isArray(parsed) || parsed.length !== 30) {
          throw new Error("Deck must contain exactly 30 cards");
        }
      }
      const updateData = {};
      if (input.name) updateData.name = input.name;
      if (input.cardIds) updateData.cardIds = input.cardIds;
      return updateDeck(input.deckId, updateData);
    }),
    /** Delete a deck */
    delete: publicProcedure.input(
      z3.object({
        deckId: z3.number().int().positive(),
        supabaseUserId: z3.string().min(1).max(64)
      })
    ).mutation(async ({ input }) => {
      const deck = await getDeckById(input.deckId);
      if (!deck || deck.supabaseUserId !== input.supabaseUserId) {
        throw new Error("Deck not found or access denied");
      }
      return deleteDeck(input.deckId);
    }),
    /** Set a deck as the active deck for a user+faction */
    setActive: publicProcedure.input(
      z3.object({
        supabaseUserId: z3.string().min(1).max(64),
        faction: z3.string().min(1).max(32),
        deckId: z3.number().int().positive()
      })
    ).mutation(async ({ input }) => {
      return setActiveDeck(input.supabaseUserId, input.faction, input.deckId);
    })
  }),
  /** Community deck library — publish and browse player decks */
  community: router({
    /** List published community decks with optional filters */
    list: publicProcedure.input(
      z3.object({
        faction: z3.string().max(32).optional(),
        sortBy: z3.enum(["newest", "likes"]).default("newest"),
        page: z3.number().int().positive().default(1),
        limit: z3.number().int().min(1).max(50).default(20)
      })
    ).query(async ({ input }) => {
      return listCommunityDecks(input);
    }),
    /** Get a single community deck by ID */
    get: publicProcedure.input(z3.object({ deckId: z3.number().int().positive() })).query(async ({ input }) => {
      return getCommunityDeck(input.deckId);
    }),
    /** Publish a deck to the community library (requires auth) */
    publish: publicProcedure.input(
      z3.object({
        playerId: z3.string().min(1).max(64),
        gamertag: z3.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, "Gamertag must be alphanumeric with underscores/hyphens"),
        deckName: z3.string().min(1).max(100).transform((s) => s.replace(/[<>"'&]/g, "")),
        faction: z3.string().min(1).max(32),
        cardIds: z3.string().min(2),
        strategy: z3.string().max(500).default("").transform((s) => s.replace(/[<>"']/g, ""))
      })
    ).mutation(async ({ input }) => {
      let parsed;
      try {
        parsed = JSON.parse(input.cardIds);
      } catch {
        throw new Error("cardIds must be a valid JSON array");
      }
      if (!Array.isArray(parsed) || parsed.length !== 30) {
        throw new Error("Deck must contain exactly 30 cards");
      }
      const currentTag = await getPlayerGamertag(input.playerId);
      if (!currentTag || currentTag !== input.gamertag) {
        const taken = await isGamertagTaken(input.gamertag, input.playerId);
        if (taken) {
          throw new Error("Gamertag is already taken by another player");
        }
        await setPlayerGamertag(input.playerId, input.gamertag);
      }
      return publishCommunityDeck(input);
    }),
    /** Unpublish (delete) a community deck — only the owner */
    unpublish: publicProcedure.input(
      z3.object({
        deckId: z3.number().int().positive(),
        playerId: z3.string().min(1).max(64)
      })
    ).mutation(async ({ input }) => {
      return unpublishCommunityDeck(input.deckId, input.playerId);
    }),
    /** Toggle like on a community deck (per-player rate-limited) */
    toggleLike: publicProcedure.input(
      z3.object({
        deckId: z3.number().int().positive(),
        playerId: z3.string().min(1).max(64)
      })
    ).mutation(async ({ input }) => {
      return toggleCommunityLike(input.deckId, input.playerId);
    }),
    /** Get deck IDs the player has liked (for rendering filled hearts) */
    likedDeckIds: publicProcedure.input(z3.object({ playerId: z3.string().min(1).max(64) })).query(async ({ input }) => {
      return getPlayerLikedDeckIds(input.playerId);
    }),
    /** List comments for a community deck */
    comments: publicProcedure.input(
      z3.object({
        deckId: z3.number().int().positive(),
        limit: z3.number().int().min(1).max(100).default(50)
      })
    ).query(async ({ input }) => {
      return listDeckComments(input.deckId, input.limit);
    }),
    /** Add a comment (or reply) to a community deck */
    addComment: publicProcedure.input(
      z3.object({
        deckId: z3.number().int().positive(),
        playerId: z3.string().min(1).max(64),
        gamertag: z3.string().min(3).max(30),
        content: z3.string().min(1).max(500).transform((s) => s.replace(/[<>"']/g, "")),
        parentId: z3.number().int().positive().nullish()
      })
    ).mutation(async ({ input }) => {
      return addDeckComment({
        ...input,
        parentId: input.parentId ?? null
      });
    }),
    /** Delete a comment (only the author) */
    deleteComment: publicProcedure.input(
      z3.object({
        commentId: z3.number().int().positive(),
        playerId: z3.string().min(1).max(64)
      })
    ).mutation(async ({ input }) => {
      return deleteDeckComment(input.commentId, input.playerId);
    }),
    /** Get comment counts for multiple decks (for badge display) */
    commentCounts: publicProcedure.input(z3.object({ deckIds: z3.array(z3.number().int().positive()).max(50) })).query(async ({ input }) => {
      return getDeckCommentCounts(input.deckIds);
    }),
    /** Get the current player's gamertag */
    getGamertag: publicProcedure.input(z3.object({ playerId: z3.string().min(1).max(64) })).query(async ({ input }) => {
      return { gamertag: await getPlayerGamertag(input.playerId) };
    }),
    /** Check if a gamertag is available */
    checkGamertag: publicProcedure.input(
      z3.object({
        gamertag: z3.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, "Gamertag must be alphanumeric with underscores/hyphens"),
        excludePlayerId: z3.string().max(64).optional()
      })
    ).query(async ({ input }) => {
      const taken = await isGamertagTaken(input.gamertag, input.excludePlayerId);
      return { available: !taken };
    }),
    /** Update a player's gamertag with profanity/racism filter */
    updateGamertag: publicProcedure.input(
      z3.object({
        playerId: z3.string().min(1).max(64),
        newGamertag: z3.string().min(3).max(24)
      })
    ).mutation(async ({ input }) => {
      const filterResult = validateGamertag(input.newGamertag);
      if (!filterResult.ok) {
        return { success: false, reason: filterResult.reason };
      }
      const taken = await isGamertagTaken(input.newGamertag, input.playerId);
      if (taken) {
        return { success: false, reason: "That gamertag is already taken." };
      }
      const ok = await setPlayerGamertag(input.playerId, input.newGamertag);
      if (!ok) {
        return { success: false, reason: "Failed to update. Please try again." };
      }
      return { success: true, gamertag: input.newGamertag };
    }),
    /** Get all community decks published by a specific player */
    myDecks: publicProcedure.input(z3.object({ playerId: z3.string().min(1).max(64) })).query(async ({ input }) => {
      return getPlayerCommunityDecks(input.playerId);
    }),
    /** Log a match result (win/loss) for a community deck */
    logMatch: publicProcedure.input(
      z3.object({
        deckId: z3.number().int().positive(),
        playerId: z3.string().min(1).max(64),
        result: z3.enum(["win", "loss"]),
        opponentFaction: z3.string().min(1).max(30)
      })
    ).mutation(async ({ input }) => {
      return logDeckMatchResult(input);
    }),
    /** Get aggregated win rate for a single deck */
    winRate: publicProcedure.input(z3.object({ deckId: z3.number().int().positive() })).query(async ({ input }) => {
      return getDeckWinRate(input.deckId);
    }),
    /** Get win rates for multiple decks (batch, for list page) */
    batchWinRates: publicProcedure.input(z3.object({ deckIds: z3.array(z3.number().int().positive()).max(50) })).query(async ({ input }) => {
      return batchDeckWinRates(input.deckIds);
    }),
    /** Get a player's match history with a specific deck */
    matchHistory: publicProcedure.input(
      z3.object({
        deckId: z3.number().int().positive(),
        playerId: z3.string().min(1).max(64),
        limit: z3.number().int().min(1).max(50).default(20)
      })
    ).query(async ({ input }) => {
      return getPlayerDeckHistory(input.deckId, input.playerId, input.limit);
    })
  }),
  /** Player profile - public profile pages */
  profile: router({
    /** Get a player's profile by ID */
    get: publicProcedure.input(z3.object({ playerId: z3.string().min(1).max(64) })).query(async ({ input }) => {
      return getPlayerProfile(input.playerId);
    }),
    /** Get a player's published decks (reuses community helper) */
    decks: publicProcedure.input(z3.object({ playerId: z3.string().min(1).max(64) })).query(async ({ input }) => {
      return getPlayerCommunityDecks(input.playerId);
    }),
    /** Get a player's recent match history across all decks */
    matchHistory: publicProcedure.input(
      z3.object({
        playerId: z3.string().min(1).max(64),
        limit: z3.number().int().min(1).max(50).default(30)
      })
    ).query(async ({ input }) => {
      return getPlayerAllMatchHistory(input.playerId, input.limit);
    }),
    /** Look up a player by gamertag (for URL routing) */
    byGamertag: publicProcedure.input(z3.object({ gamertag: z3.string().min(1).max(30) })).query(async ({ input }) => {
      return getPlayerByGamertag(input.gamertag);
    })
  }),
  /** User account management — data purge for GDPR compliance */
  user: router({
    /** Purge ALL user data — decks, comments, game history. Real deletion, not fake. */
    purge: publicProcedure.input(
      z3.object({
        supabaseUserId: z3.string().min(1).max(64)
      })
    ).mutation(async ({ input }) => {
      const result = await deleteAllUserData(input.supabaseUserId);
      return {
        success: true,
        ...result,
        message: `Purged ${result.decksDeleted} decks and ${result.commentsDeleted} comments.`
      };
    })
  }),
  /** Blog — public SEO content */
  blog: router({
    /** List paginated blog posts with optional category filter and search */
    list: publicProcedure.input(
      z3.object({
        page: z3.number().int().positive().default(1),
        limit: z3.number().int().min(1).max(100).default(20),
        category: z3.string().max(64).optional(),
        search: z3.string().max(200).optional()
      })
    ).query(async ({ input }) => {
      return getBlogPosts(input);
    }),
    /** Get a single blog post by slug */
    getBySlug: publicProcedure.input(z3.object({ slug: z3.string().min(1).max(255) })).query(async ({ input }) => {
      return getBlogPostBySlug(input.slug) ?? null;
    }),
    /** Get related posts (same category) */
    related: publicProcedure.input(
      z3.object({
        category: z3.string().min(1).max(64),
        excludeSlug: z3.string().min(1).max(255),
        limit: z3.number().int().min(1).max(10).default(5)
      })
    ).query(async ({ input }) => {
      return getRelatedPosts(input.category, input.excludeSlug, input.limit);
    }),
    /** Get category counts for sidebar */
    categories: publicProcedure.query(async () => {
      return getBlogCategoryCounts();
    }),
    /** Get all slugs for sitemap */
    allSlugs: publicProcedure.query(async () => {
      return getAllBlogSlugs();
    })
  }),
  game: router({
    /** Create a new game lobby and get the room code */
    create: publicProcedure.input(z3.object({ username: z3.string().min(1).max(20).transform((s) => s.replace(/[<>"'&]/g, "")), playerId: z3.string().min(1).max(64) })).mutation(async ({ input }) => {
      return createGame(input.playerId, input.username);
    }),
    /** Join an existing game by room code */
    join: publicProcedure.input(
      z3.object({
        roomCode: z3.string().min(4).max(8).regex(/^[A-Z0-9]+$/i),
        username: z3.string().min(1).max(20).transform((s) => s.replace(/[<>"'&]/g, "")),
        playerId: z3.string().min(1).max(64)
      })
    ).mutation(async ({ input }) => {
      return joinGame(input.roomCode, input.playerId, input.username);
    }),
    /** Choose your sin (Wrath or Sloth) */
    chooseSin: publicProcedure.input(
      z3.object({
        gameId: z3.string().uuid(),
        sin: z3.enum(["wrath", "sloth", "greed", "envy"]),
        playerId: z3.string().min(1).max(64)
      })
    ).mutation(async ({ input }) => {
      await chooseSin(input.gameId, input.playerId, input.sin);
      return { success: true };
    }),
    /** Start the game (requires all players to have chosen sins) */
    start: publicProcedure.input(z3.object({ gameId: z3.string().uuid() })).mutation(async ({ input }) => {
      await startGame(input.gameId);
      return { success: true };
    }),
    /** Play a card from hand */
    playCard: publicProcedure.input(
      z3.object({
        gameId: z3.string().uuid(),
        cardId: z3.string().max(64),
        playerId: z3.string().min(1).max(64),
        targetPlayerId: z3.string().max(64).optional()
      })
    ).mutation(async ({ input }) => {
      return playCard(input.gameId, input.playerId, input.cardId, input.targetPlayerId);
    }),
    /** Pass your turn (draws a card) */
    pass: publicProcedure.input(z3.object({ gameId: z3.string().uuid(), playerId: z3.string().min(1).max(64) })).mutation(async ({ input }) => {
      await passTurn(input.gameId, input.playerId);
      return { success: true };
    }),
    /** Consume (banish) a card from hand for +1 energy. Max 1 per round. */
    consume: publicProcedure.input(
      z3.object({
        gameId: z3.string().uuid(),
        playerId: z3.string().min(1).max(64),
        cardId: z3.string().max(64)
      })
    ).mutation(async ({ input }) => {
      return consumeCard(input.gameId, input.playerId, input.cardId);
    }),
    /** Get the full game state */
    getState: publicProcedure.input(z3.object({ gameId: z3.string().uuid() })).query(async ({ input }) => {
      return getGameState(input.gameId);
    }),
    /** Get game action log */
    getLog: publicProcedure.input(z3.object({ gameId: z3.string().uuid() })).query(async ({ input }) => {
      return getGameLog(input.gameId);
    }),
    /** Server-side turn timer check — enforces selection deadline */
    checkTimer: publicProcedure.input(z3.object({ gameId: z3.string().uuid() })).mutation(async ({ input }) => {
      return enforceSelectionDeadline(input.gameId);
    }),
    /** AI Narrator — generate a contextual narrator line for a game moment */
    aiNarrate: publicProcedure.input(
      z3.object({
        gameId: z3.string().uuid(),
        trigger: z3.enum([
          "round_start",
          "card_reveal",
          "big_damage",
          "player_eliminated",
          "game_over",
          "comeback",
          "rivalry_escalation"
        ]),
        triggerData: z3.record(z3.string(), z3.any()).optional()
      })
    ).mutation(async ({ input }) => {
      const gameState = await getGameState(input.gameId);
      if (!gameState || !gameState.aiNarrator) {
        return { line: null };
      }
      const gameLog = await getGameLog(input.gameId);
      const behaviors = analyzePlayerBehaviors(gameState, gameLog);
      const context = buildMatchContext(gameState, behaviors);
      const line = await generateNarratorLine(
        input.trigger,
        context,
        input.triggerData
      );
      return { line };
    }),
    /** Sin Whisperer — generate a private temptation for a specific player */
    aiWhisper: publicProcedure.input(
      z3.object({
        gameId: z3.string().uuid(),
        playerId: z3.string().min(1).max(64)
      })
    ).mutation(async ({ input }) => {
      const gameState = await getGameState(input.gameId);
      if (!gameState || !gameState.aiWhisperer) {
        return { whisper: null };
      }
      const player = gameState.players.find(
        (p) => p.id === input.playerId
      );
      if (!player || !player.isAlive) {
        return { whisper: null };
      }
      const gameLog = await getGameLog(input.gameId);
      const behaviors = analyzePlayerBehaviors(gameState, gameLog);
      const context = buildMatchContext(gameState, behaviors);
      const { getCardById: getCard } = await Promise.resolve().then(() => (init_cardData(), cardData_exports));
      const hand = player.hand.map((cardId) => {
        const card = getCard(cardId);
        return {
          id: cardId,
          name: card?.name || "Unknown",
          energyCost: card?.cost || 0,
          effects: card?.effects || []
        };
      });
      const whisper = await generateWhisper(player, context, hand);
      return { whisper };
    }),
    /** Get behavioral analysis for a game (rivalries, player tags, etc.) */
    aiAnalysis: publicProcedure.input(z3.object({ gameId: z3.string().uuid() })).query(async ({ input }) => {
      const gameState = await getGameState(input.gameId);
      if (!gameState) return { behaviors: [], rivalries: [] };
      const gameLog = await getGameLog(input.gameId);
      const behaviors = analyzePlayerBehaviors(gameState, gameLog);
      const rivalries = detectRivalries(behaviors);
      return { behaviors, rivalries };
    }),
    // ─── Chronicle Engine Endpoints ─────────────────────
    /** Generate a chronicle segment for a specific round */
    generateChronicleSegment: publicProcedure.input(
      z3.object({
        gameId: z3.string().uuid(),
        round: z3.number().int().min(1).max(20)
      })
    ).mutation(async ({ input }) => {
      const gameState = await getGameState(input.gameId);
      if (!gameState) return { success: false, error: "Game not found" };
      const gameLog = await getGameLog(input.gameId);
      const previousSegments = await loadChronicleSegments(input.gameId);
      if (previousSegments.some((s) => s.round === input.round)) {
        return { success: true, segment: previousSegments.find((s) => s.round === input.round) };
      }
      const civMetrics = previousSegments.length > 0 ? previousSegments[previousSegments.length - 1].civilizationMetrics : { militarism: 0, culture: 0, commerce: 0 };
      const roundEvents = extractRoundEvents(gameState, gameLog, input.round);
      const segment = await generateRoundNarrative(
        gameState,
        gameLog,
        roundEvents,
        previousSegments,
        civMetrics
      );
      await saveChronicleSegment(input.gameId, segment);
      return { success: true, segment };
    }),
    /** Assemble the full chronicle after game ends */
    assembleChronicle: publicProcedure.input(z3.object({ gameId: z3.string().uuid() })).mutation(async ({ input }) => {
      const existing = await loadChronicle(input.gameId);
      if (existing) {
        return {
          success: true,
          chronicleId: existing.id,
          title: existing.title,
          excerpt: existing.excerpt,
          rarityTier: existing.rarity_tier,
          civilizationType: existing.civilization_type,
          coverImageUrl: existing.cover_image_url || null
        };
      }
      const gameState = await getGameState(input.gameId);
      if (!gameState) return { success: false, error: "Game not found" };
      const gameLog = await getGameLog(input.gameId);
      const segments = await loadChronicleSegments(input.gameId);
      if (segments.length === 0) {
        return { success: false, error: "No chronicle segments found" };
      }
      const finalMetrics = segments[segments.length - 1].civilizationMetrics;
      const playerFactions = gameState.players.filter((p) => p.chosenSin).map((p) => ({ name: p.username, faction: p.chosenSin }));
      const result = await assembleChronicle(gameState, segments, gameLog, finalMetrics);
      const chronicleId = await saveChronicle(input.gameId, {
        ...result,
        playerFactions,
        totalRounds: segments.length
      });
      return {
        success: true,
        chronicleId,
        title: result.title,
        excerpt: result.excerpt,
        rarityTier: result.rarityTier,
        civilizationType: result.civilizationType
      };
    }),
    /** Get a chronicle by game ID */
    getChronicle: publicProcedure.input(z3.object({ gameId: z3.string().uuid() })).query(async ({ input }) => {
      const chronicle = await loadChronicle(input.gameId);
      if (chronicle) {
        incrementViewCount(chronicle.id).catch(() => {
        });
      }
      return chronicle;
    }),
    /** Get chronicle segments for a game (real-time feed during game) */
    getChronicleSegments: publicProcedure.input(z3.object({ gameId: z3.string().uuid() })).query(async ({ input }) => {
      return await loadChronicleSegments(input.gameId);
    }),
    /** Get published chronicles for the public feed */
    getPublishedChronicles: publicProcedure.input(
      z3.object({
        limit: z3.number().int().min(1).max(50).default(20),
        offset: z3.number().int().min(0).default(0),
        rarityTier: z3.enum(["common", "rare", "epic", "legendary"]).optional(),
        civilizationType: z3.enum(["warrior_empire", "enlightened_republic", "merchant_federation", "balanced"]).optional()
      })
    ).query(async ({ input }) => {
      return await loadPublishedChronicles(input.limit, input.offset, {
        rarityTier: input.rarityTier,
        civilizationType: input.civilizationType
      });
    }),
    /** Generate cover art for an existing chronicle that doesn't have one */
    generateCoverArt: publicProcedure.input(z3.object({ gameId: z3.string().uuid() })).mutation(async ({ input }) => {
      const chronicle = await loadChronicle(input.gameId);
      if (!chronicle) {
        return { success: false, error: "Chronicle not found" };
      }
      if (chronicle.cover_image_url) {
        return { success: true, coverImageUrl: chronicle.cover_image_url };
      }
      const playerFactions = Array.isArray(chronicle.player_factions) ? chronicle.player_factions.map((pf) => pf.faction).filter(Boolean) : [];
      const coverUrl = await generateAndSaveCoverArt({
        gameId: input.gameId,
        title: chronicle.title,
        civilizationType: chronicle.civilization_type,
        rarityTier: chronicle.rarity_tier,
        dominantFactions: playerFactions,
        turningPointRound: chronicle.turning_point_round || 10,
        totalEliminations: chronicle.stats_json?.totalEliminations || 0,
        excerpt: chronicle.excerpt
      });
      return { success: !!coverUrl, coverImageUrl: coverUrl };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// api/_source.ts
var app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});
var BASE_URL = "https://www.7sinscardgame.com";
var OG_IMAGE = "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/og-banner-7a8HHUKyS9YrWQLuM7Cgyi.png";
var FAVICON = "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/favicon_f4fbfc17.ico";
var ICON_192 = "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/7s-icon-192x192_8dcc7e63.png";
var BOT_UA_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /yandexbot/i,
  /baiduspider/i,
  /duckduckbot/i,
  /slurp/i,
  /ia_archiver/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /whatsapp/i,
  /telegrambot/i,
  /discordbot/i,
  /slackbot/i,
  /pinterestbot/i,
  /redditbot/i,
  /gptbot/i,
  /chatgpt-user/i,
  /claudebot/i,
  /anthropic-ai/i,
  /perplexitybot/i,
  /cohere-ai/i,
  /applebot/i,
  /amazonbot/i,
  /petalbot/i,
  /semrushbot/i,
  /ahrefsbot/i,
  /mj12bot/i,
  /dotbot/i,
  /rogerbot/i,
  /screaming frog/i,
  /embedly/i,
  /quora link preview/i,
  /outbrain/i,
  /w3c_validator/i,
  /lighthouse/i
];
function isBot(ua) {
  return BOT_UA_PATTERNS.some((p) => p.test(ua));
}
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
var STATIC_PAGES = {
  "/": {
    title: "7 Deadly Sins Card Game - Choose Your Sin | Free PvP Strategy Card Game",
    description: "A free strategic 4-player PvP card game where seven deadly sins clash in a gothic cathedral. Choose your sin, master compound mechanics, and outlast your rivals across 20 rounds of judgment."
  },
  "/how-to-play": {
    title: "How to Play the 7 Deadly Sins Card Game - Step-by-Step Guide",
    description: "Learn how to play the 7 Deadly Sins Card Game in 6 easy steps. Choose your sin faction, build your deck, master the energy system, and dominate the arena."
  },
  "/rules": {
    title: "Game Rules - 7 Deadly Sins Card Game",
    description: "Complete rules reference for the 7 Deadly Sins Card Game. Energy system, compound mechanics, Fibonacci scaling, faction passives, and win conditions explained."
  },
  "/faq": {
    title: "FAQ - 7 Deadly Sins Card Game",
    description: "Frequently asked questions about the 7 Deadly Sins Card Game. Learn about gameplay, factions, energy system, multiplayer, and more."
  },
  "/blog": {
    title: "Blog - 7 Deadly Sins Card Game | Lore, Strategy & Mythology",
    description: "Dark fantasy lore, strategy guides, and mythology from the world of the 7 Deadly Sins Card Game. Explore sin traditions from Dante, Buddhist, Norse, Japanese, and Celtic cultures."
  },
  "/community": {
    title: "Community Decks - 7 Deadly Sins Card Game",
    description: "Browse and share community-created decks for the 7 Deadly Sins Card Game. Find the best strategies for each sin faction."
  },
  "/deck-builder": {
    title: "Deck Builder - 7 Deadly Sins Card Game",
    description: "Build and customize your deck for the 7 Deadly Sins Card Game. Choose cards, optimize your strategy, and prepare for battle."
  },
  "/chronicles": {
    title: "Chronicles - 7 Deadly Sins Card Game",
    description: "Explore the chronicles and lore of the 7 Deadly Sins Card Game. Dark fantasy narratives from the cathedral of judgment."
  },
  "/practice": {
    title: "Practice Mode - 7 Deadly Sins Card Game",
    description: "Practice against AI opponents in the 7 Deadly Sins Card Game. Hone your skills before entering multiplayer matches."
  },
  "/balance": {
    title: "Balance Analysis - 7 Deadly Sins Card Game",
    description: "Detailed statistical balance analysis of all 7 sin factions. Win rates, matchup matrices, and card efficiency data."
  },
  "/changelog": {
    title: "Changelog - 7 Deadly Sins Card Game",
    description: "Version history and patch notes for the 7 Deadly Sins Card Game. Track balance changes, new features, and bug fixes."
  },
  "/collection": {
    title: "Card Collection - 7 Deadly Sins Card Game",
    description: "Browse the complete card collection for all 7 sin factions. View card stats, effects, and artwork."
  },
  "/matchups": {
    title: "Matchup Matrix - 7 Deadly Sins Card Game",
    description: "Faction matchup data and win rates for the 7 Deadly Sins Card Game. Find your best and worst matchups."
  },
  "/terms": {
    title: "Terms of Service - 7 Deadly Sins Card Game",
    description: "Terms of service for the 7 Deadly Sins Card Game website."
  },
  "/privacy": {
    title: "Privacy Policy - 7 Deadly Sins Card Game",
    description: "Privacy policy for the 7 Deadly Sins Card Game website."
  },
  "/cookies": {
    title: "Cookie Policy - 7 Deadly Sins Card Game",
    description: "Cookie policy for the 7 Deadly Sins Card Game website."
  },
  "/brandbook": {
    title: "Brand Book - 7 Deadly Sins Card Game",
    description: "Brand guidelines, visual identity, and design system for the 7 Deadly Sins Card Game."
  }
};
function buildPrerenderHtml(opts) {
  const {
    title,
    description,
    url,
    ogImage = OG_IMAGE,
    articleContent = "",
    jsonLd,
    publishedTime,
    modifiedTime,
    keywords = "",
    category = ""
  } = opts;
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description.slice(0, 320));
  let head = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}">
  <link rel="canonical" href="${url}">
  <link rel="icon" type="image/x-icon" href="${FAVICON}">
  <link rel="icon" type="image/png" sizes="192x192" href="${ICON_192}">
  <meta name="theme-color" content="#1a1520">
  <meta property="og:type" content="${publishedTime ? "article" : "website"}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="7 Deadly Sins Card Game">`;
  if (publishedTime) head += `
  <meta property="article:published_time" content="${publishedTime}">`;
  if (modifiedTime) head += `
  <meta property="article:modified_time" content="${modifiedTime}">`;
  if (category) head += `
  <meta property="article:section" content="${escapeHtml(category)}">`;
  head += `
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${ogImage}">`;
  if (keywords) head += `
  <meta name="keywords" content="${escapeHtml(keywords)}">`;
  head += `
  <link rel="alternate" type="application/rss+xml" title="7 Deadly Sins Card Game Blog" href="${BASE_URL}/rss.xml">
  <link rel="alternate" type="text/plain" title="LLMs.txt" href="${BASE_URL}/llms.txt">`;
  if (jsonLd) head += `
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
  head += `
</head>`;
  return `${head}
<body>
  <header><nav>
    <a href="/">Home</a> | <a href="/how-to-play">How to Play</a> | <a href="/rules">Rules</a> |
    <a href="/blog">Blog</a> | <a href="/faq">FAQ</a> | <a href="/community">Community</a> |
    <a href="/deck-builder">Deck Builder</a>
  </nav></header>
  <main>${articleContent}</main>
  <footer>
    <p>&copy; 2025 7 Deadly Sins Card Game. All rights reserved.</p>
    <nav><a href="/terms">Terms</a> | <a href="/privacy">Privacy</a> | <a href="/cookies">Cookies</a> | <a href="/brandbook">Brand Book</a></nav>
  </footer>
</body>
</html>`;
}
function buildArticleJsonLd(post) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    url: `${BASE_URL}/blog/${post.slug}`,
    image: post.featuredImage || OG_IMAGE,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "7 Deadly Sins Card Game", url: BASE_URL },
    publisher: { "@type": "Organization", name: "7 Deadly Sins Card Game", url: BASE_URL, logo: { "@type": "ImageObject", url: ICON_192 } },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/blog/${post.slug}` },
    articleSection: post.category,
    keywords: post.keywords,
    wordCount: Math.round(post.readingTime * 200),
    timeRequired: `PT${post.readingTime}M`,
    inLanguage: "en",
    isAccessibleForFree: true
  };
}
app.get("/blog/:slug", async (req, res, next) => {
  const ua = req.headers["user-agent"] || "";
  if (!isBot(ua)) return next();
  try {
    const slug = req.params.slug;
    const post = await getBlogPostBySlug(slug);
    if (!post) return next();
    const jsonLd = buildArticleJsonLd(post);
    const html = buildPrerenderHtml({
      title: `${post.title} | 7 Deadly Sins Card Game Blog`,
      description: post.metaDescription,
      url: `${BASE_URL}/blog/${post.slug}`,
      ogImage: post.featuredImage || OG_IMAGE,
      articleContent: `<article>
        <h1>${escapeHtml(post.title)}</h1>
        <p><time datetime="${post.publishedAt.toISOString()}">${post.publishedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time> &middot; ${post.readingTime} min read &middot; ${escapeHtml(post.category)}</p>
        <p>${escapeHtml(post.metaDescription)}</p>
      </article>`,
      jsonLd,
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      keywords: post.keywords,
      category: post.category
    });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200");
    res.setHeader("X-Prerendered", "true");
    return res.status(200).send(html);
  } catch (err) {
    console.error("Prerender blog error:", err);
    return next();
  }
});
var PRERENDER_STATIC_PATHS = Object.keys(STATIC_PAGES);
for (const pagePath of PRERENDER_STATIC_PATHS) {
  if (pagePath === "/") continue;
  app.get(pagePath, (req, res, next) => {
    const ua = req.headers["user-agent"] || "";
    if (!isBot(ua)) return next();
    const config = STATIC_PAGES[pagePath];
    const html = buildPrerenderHtml({
      title: config.title,
      description: config.description,
      url: `${BASE_URL}${pagePath}`,
      articleContent: `<h1>${escapeHtml(config.title)}</h1><p>${escapeHtml(config.description)}</p>`
    });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200");
    res.setHeader("X-Prerendered", "true");
    return res.status(200).send(html);
  });
}
app.get("/", (req, res, next) => {
  const ua = req.headers["user-agent"] || "";
  if (!isBot(ua)) return next();
  const config = STATIC_PAGES["/"];
  const html = buildPrerenderHtml({
    title: config.title,
    description: config.description,
    url: BASE_URL,
    articleContent: `<h1>${escapeHtml(config.title)}</h1><p>${escapeHtml(config.description)}</p>`
  });
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200");
  res.setHeader("X-Prerendered", "true");
  return res.status(200).send(html);
});
app.get("/sitemap.xml", async (_req, res) => {
  try {
    const slugs = await getAllBlogSlugs();
    const baseUrl = BASE_URL;
    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "weekly" },
      { loc: "/blog", priority: "0.9", changefreq: "daily" },
      { loc: "/how-to-play", priority: "0.8", changefreq: "monthly" },
      { loc: "/rules", priority: "0.8", changefreq: "monthly" },
      { loc: "/faq", priority: "0.7", changefreq: "monthly" },
      { loc: "/collection", priority: "0.8", changefreq: "monthly" },
      { loc: "/balance", priority: "0.7", changefreq: "monthly" },
      { loc: "/matchups", priority: "0.7", changefreq: "monthly" },
      { loc: "/deck-builder", priority: "0.7", changefreq: "monthly" },
      { loc: "/community", priority: "0.6", changefreq: "weekly" },
      { loc: "/chronicles", priority: "0.6", changefreq: "monthly" },
      { loc: "/practice", priority: "0.6", changefreq: "monthly" },
      { loc: "/changelog", priority: "0.5", changefreq: "weekly" },
      { loc: "/terms", priority: "0.3", changefreq: "yearly" },
      { loc: "/privacy", priority: "0.3", changefreq: "yearly" },
      { loc: "/cookies", priority: "0.3", changefreq: "yearly" },
      { loc: "/brandbook", priority: "0.3", changefreq: "yearly" }
    ];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
    for (const page of staticPages) {
      xml += `  <url>
`;
      xml += `    <loc>${baseUrl}${page.loc}</loc>
`;
      xml += `    <changefreq>${page.changefreq}</changefreq>
`;
      xml += `    <priority>${page.priority}</priority>
`;
      xml += `  </url>
`;
    }
    for (const { slug, updatedAt } of slugs) {
      const lastmod = updatedAt ? new Date(updatedAt).toISOString().split("T")[0] : (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      xml += `  <url>
`;
      xml += `    <loc>${baseUrl}/blog/${slug}</loc>
`;
      xml += `    <lastmod>${lastmod}</lastmod>
`;
      xml += `    <changefreq>monthly</changefreq>
`;
      xml += `    <priority>0.6</priority>
`;
      xml += `  </url>
`;
    }
    xml += `</urlset>`;
    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (err) {
    console.error("Sitemap generation error:", err);
    res.status(500).send("Error generating sitemap");
  }
});
app.get("/rss.xml", async (_req, res) => {
  try {
    const posts = await getRecentBlogPosts(50);
    const baseUrl = BASE_URL;
    const now = posts.length > 0 && posts[0].publishedAt ? new Date(posts[0].publishedAt).toUTCString() : (/* @__PURE__ */ new Date()).toUTCString();
    let rss = `<?xml version="1.0" encoding="UTF-8"?>
`;
    rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
`;
    rss += `<channel>
`;
    rss += `  <title>7 Deadly Sins Card Game - Lore &amp; Strategy</title>
`;
    rss += `  <link>${baseUrl}/blog</link>
`;
    rss += `  <description>Dark fantasy lore, strategy guides, and mythology from the world of the 7 Deadly Sins Card Game.</description>
`;
    rss += `  <language>en-us</language>
`;
    rss += `  <lastBuildDate>${now}</lastBuildDate>
`;
    rss += `  <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
`;
    rss += `  <image>
`;
    rss += `    <url>${OG_IMAGE}</url>
`;
    rss += `    <title>7 Deadly Sins Card Game</title>
`;
    rss += `    <link>${baseUrl}</link>
`;
    rss += `  </image>
`;
    for (const post of posts) {
      const pubDate = post.publishedAt ? new Date(post.publishedAt).toUTCString() : now;
      const postUrl = `${baseUrl}/blog/${post.slug}`;
      const desc = (post.metaDescription || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const title = (post.title || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      rss += `  <item>
`;
      rss += `    <title>${title}</title>
`;
      rss += `    <link>${postUrl}</link>
`;
      rss += `    <guid isPermaLink="true">${postUrl}</guid>
`;
      rss += `    <pubDate>${pubDate}</pubDate>
`;
      rss += `    <description>${desc}</description>
`;
      rss += `    <category>${post.category}</category>
`;
      if (post.featuredImage) {
        rss += `    <enclosure url="${post.featuredImage}" type="image/webp" length="0" />
`;
      }
      rss += `  </item>
`;
    }
    rss += `</channel>
`;
    rss += `</rss>`;
    res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(rss);
  } catch (err) {
    console.error("RSS feed generation error:", err);
    res.status(500).send("Error generating RSS feed");
  }
});
registerOAuthRoutes(app);
registerChatRoutes(app);
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found" });
  }
  return res.redirect(302, req.path);
});
var source_default = app;
export {
  source_default as default
};
