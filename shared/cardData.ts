/**
 * Card Data Definitions for 7 Deadly Sins Card Game
 *
 * Four sins, each with 10 cards forming a complete deck.
 * Balanced using EV/Corruption analysis (all within 1.7% of mean 5.48 EV/C).
 *
 * Design Philosophy:
 * - Wrath: High damage, self-harm, aggressive tempo. Wants to end games fast.
 * - Sloth: Shields, heals, DoTs, debuffs. Wants to stall and let compounding do the work.
 * - Greed: Steal/drain, value tempo, heal-from-damage. Snowball advantage.
 * - Envy: Reactive debuffs, mirror shields, punish strong opponents.
 *
 * Corruption Costs (0-5 range):
 * - 0: Free but risky/conditional cards
 * - 1: Basic utility cards
 * - 2: Standard mid-range cards
 * - 3: Strong multi-target or sustained effects
 * - 4: Powerful finisher-tier cards
 * - 5: Ultimate game-changers
 */

import { CardDefinition } from "./gameTypes";

// ─── WRATH CARDS (10) ────────────────────────────────────────
export const WRATH_CARDS: CardDefinition[] = [
  {
    id: "wrath_01",
    name: "Fury Strike",
    sin: "wrath",
    cost: 1,
    effects: [{ type: "damage", baseValue: 3, duration: 0, target: "single_enemy" }],
    flavorText: "A fist clenched so hard it draws its own blood.",
    narratorQuip: "Oh look, violence. How breathtakingly original.",
    tier: "common",
  },
  {
    id: "wrath_02",
    name: "Blind Rage",
    sin: "wrath",
    cost: 1,
    effects: [
      { type: "damage", baseValue: 4, duration: 0, target: "single_enemy" },
      { type: "damage", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Rage doesn't care who it hurts. Even you.",
    narratorQuip: "Hitting yourself to hit others harder? Therapy called. You didn't answer.",
    tier: "common",
  },
  {
    id: "wrath_03",
    name: "Blood Boil",
    sin: "wrath",
    cost: 2,
    effects: [{ type: "damage", baseValue: 2, duration: 2, target: "single_enemy" }],
    flavorText: "Their veins run hot with borrowed fury.",
    narratorQuip: "That's going to leave a mark... for several rounds. Enjoy the suffering.",
    tier: "rare",
  },
  {
    id: "wrath_04",
    name: "Berserker's Howl",
    sin: "wrath",
    cost: 3,
    effects: [{ type: "damage", baseValue: 2, duration: 0, target: "all_enemies" }],
    flavorText: "The scream that silences a battlefield.",
    narratorQuip: "Screaming at everyone equally. True equality in action.",
    tier: "rare",
  },
  {
    id: "wrath_05",
    name: "Crimson Slash",
    sin: "wrath",
    cost: 1,
    effects: [{ type: "damage", baseValue: 2, duration: 0, target: "single_enemy" }],
    flavorText: "Quick. Clean. Well, not clean exactly.",
    narratorQuip: "Efficient. I'm almost impressed. Almost.",
    tier: "common",
  },
  {
    id: "wrath_06",
    name: "Vendetta",
    sin: "wrath",
    cost: 2,
    effects: [
      { type: "damage", baseValue: 5, duration: 0, target: "single_enemy" },
      { type: "damage", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "Revenge is a dish best served... scalding.",
    narratorQuip: "Self-destructive AND aggressive? Peak Wrath energy right there.",
    tier: "epic",
  },
  {
    id: "wrath_07",
    name: "Rage Shield",
    sin: "wrath",
    cost: 2,
    effects: [{ type: "shield", baseValue: 2, duration: 1, target: "self" }],
    flavorText: "Even fury needs a moment to breathe.",
    narratorQuip: "Defense? From the anger child? I'm SHOCKED. Shocked, I tell you.",
    tier: "common",
  },
  {
    id: "wrath_08",
    name: "Burning Hatred",
    sin: "wrath",
    cost: 3,
    effects: [{ type: "damage", baseValue: 3, duration: 3, target: "single_enemy" }],
    flavorText: "Hatred that lingers long after the blow.",
    narratorQuip: "Three rounds of suffering. You really know how to hold a grudge.",
    tier: "epic",
  },
  {
    id: "wrath_09",
    name: "Corruption Surge",
    sin: "wrath",
    cost: 0,
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "single_enemy" },
      { type: "damage", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "Free power always comes with a price. Usually your own blood.",
    narratorQuip: "Zero cost, maximum self-harm. The Wrath special. No refunds on your HP.",
    tier: "rare",
  },
  {
    id: "wrath_10",
    name: "Apocalypse Fist",
    sin: "wrath",
    cost: 5,
    effects: [
      { type: "damage", baseValue: 4, duration: 0, target: "all_enemies" },
      { type: "damage", baseValue: 3, duration: 0, target: "self" },
    ],
    flavorText: "The final argument in any debate.",
    narratorQuip: "Nuclear option deployed. Mutually assured destruction never looked so fun.",
    tier: "epic",
  },
  // ─── WRATH CATCH-UP CARDS ───
  {
    id: "wrath_11",
    name: "Desperate Fury",
    sin: "wrath",
    cost: 2,
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "single_enemy" },
      { type: "damage", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "The cornered beast strikes hardest.",
    narratorQuip: "Nothing like impending doom to sharpen your aim. Extra damage when desperate.",
    tier: "rare",
    catchup: { type: "bonus_damage", bonusValue: 2, condition: "hp_less_than_target" },
  },
  {
    id: "wrath_12",
    name: "Last Stand",
    sin: "wrath",
    cost: 1,
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
    ],
    flavorText: "When there's nothing left to lose, everything becomes a weapon.",
    narratorQuip: "Below 10 HP and still fighting? Here's some HP. Don't say I never gave you anything.",
    tier: "rare",
    catchup: { type: "bonus_heal", bonusValue: 2, condition: "hp_below_threshold" },
  },
];

// ─── SLOTH CARDS (10) ────────────────────────────────────────
export const SLOTH_CARDS: CardDefinition[] = [
  {
    id: "sloth_01",
    name: "Drowsy Touch",
    sin: "sloth",
    cost: 1,
    effects: [{ type: "debuff", baseValue: 1, duration: 2, target: "single_enemy" }],
    flavorText: "A yawn so contagious it weakens the soul.",
    narratorQuip: "Weaponized boredom. We've reached peak laziness, folks.",
    tier: "common",
  },
  {
    id: "sloth_02",
    name: "Pillow Fort",
    sin: "sloth",
    cost: 2,
    effects: [{ type: "shield", baseValue: 3, duration: 2, target: "self" }],
    flavorText: "The ultimate defense: not caring enough to get hit.",
    narratorQuip: "Hiding behind pillows. Bold strategy, let's see if it pays off.",
    tier: "rare",
  },
  {
    id: "sloth_03",
    name: "Lazy Drain",
    sin: "sloth",
    cost: 2,
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Why generate your own energy when you can borrow theirs?",
    narratorQuip: "Minimum effort, maximum annoyance. Chef's kiss.",
    tier: "common",
  },
  {
    id: "sloth_04",
    name: "Procrastination",
    sin: "sloth",
    cost: 1,
    effects: [{ type: "shield", baseValue: 2, duration: 1, target: "self" }],
    flavorText: "I'll deal with that... eventually.",
    narratorQuip: "Putting off death itself. Respect, honestly.",
    tier: "common",
  },
  {
    id: "sloth_05",
    name: "Entropy Wave",
    sin: "sloth",
    cost: 3,
    effects: [{ type: "damage", baseValue: 1, duration: 3, target: "all_enemies" }],
    flavorText: "Everything decays. Sloth just... accelerates the inevitable.",
    narratorQuip: "Making everyone else as tired as you are. Misery loves company.",
    tier: "epic",
  },
  {
    id: "sloth_06",
    name: "Hibernate",
    sin: "sloth",
    cost: 3,
    effects: [{ type: "heal", baseValue: 3, duration: 2, target: "self" }],
    flavorText: "Sometimes the best strategy is a really long nap.",
    narratorQuip: "Sleeping through the apocalypse. Iconic behavior.",
    tier: "rare",
  },
  {
    id: "sloth_07",
    name: "Lethargy Aura",
    sin: "sloth",
    cost: 2,
    effects: [{ type: "debuff", baseValue: 2, duration: 2, target: "single_enemy" }],
    flavorText: "Your muscles feel like wet concrete.",
    narratorQuip: "Spreading the lethargy like a contagious yawn. Beautiful.",
    tier: "rare",
  },
  {
    id: "sloth_08",
    name: "Passive Resistance",
    sin: "sloth",
    cost: 1,
    effects: [
      { type: "shield", baseValue: 1, duration: 1, target: "self" },
      { type: "damage", baseValue: 1, duration: 0, target: "single_enemy" },
    ],
    flavorText: "Not fighting back IS the strategy.",
    narratorQuip: "Defending and poking. The bare minimum, as always. On brand.",
    tier: "common",
  },
  {
    id: "sloth_09",
    name: "Deep Slumber",
    sin: "sloth",
    cost: 0,
    effects: [
      { type: "heal", baseValue: 2, duration: 0, target: "self" },
      { type: "debuff", baseValue: 1, duration: 1, target: "self" },
    ],
    flavorText: "A nap so deep it makes you vulnerable. Worth it.",
    narratorQuip: "Free healing with a side of vulnerability. The lazy person's gamble.",
    tier: "rare",
  },
  {
    id: "sloth_10",
    name: "Eternal Rest",
    sin: "sloth",
    cost: 4,
    effects: [
      { type: "heal", baseValue: 5, duration: 0, target: "self" },
      { type: "shield", baseValue: 3, duration: 2, target: "self" },
    ],
    flavorText: "The deepest sleep grants the strongest armor.",
    narratorQuip: "Full heal AND a shield? That's disgustingly defensive. I love it.",
    tier: "epic",
  },
  // ─── SLOTH CATCH-UP CARDS ───
  {
    id: "sloth_11",
    name: "Survival Instinct",
    sin: "sloth",
    cost: 1,
    effects: [
      { type: "shield", baseValue: 2, duration: 1, target: "self" },
    ],
    flavorText: "Even the laziest creature fights when cornered.",
    narratorQuip: "Sloth actually trying? Things must be dire. Bonus heal when you're the underdog.",
    tier: "rare",
    catchup: { type: "bonus_heal", bonusValue: 2, condition: "hp_less_than_any_opponent" },
  },
  {
    id: "sloth_12",
    name: "Feign Death",
    sin: "sloth",
    cost: 2,
    effects: [
      { type: "shield", baseValue: 3, duration: 2, target: "self" },
    ],
    flavorText: "Playing dead is an art form. And an effective strategy.",
    narratorQuip: "Playing possum AND spreading debuffs? Devious laziness at its finest.",
    tier: "epic",
    catchup: { type: "bonus_debuff_all", bonusValue: 1, bonusDuration: 2, condition: "hp_below_threshold" },
  },
];

// ─── GREED CARDS (10) ────────────────────────────────────────
export const GREED_CARDS: CardDefinition[] = [
  {
    id: "greed_01",
    name: "Pocket Pick",
    sin: "greed",
    cost: 1,
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "What's yours is mine. What's mine is also mine.",
    narratorQuip: "Stealing HP like it's loose change. Classy.",
    tier: "common",
  },
  {
    id: "greed_02",
    name: "Tax Collector",
    sin: "greed",
    cost: 1,
    effects: [{ type: "damage", baseValue: 2, duration: 0, target: "single_enemy" }],
    flavorText: "Nothing is certain except death and taxes. This is both.",
    narratorQuip: "The only thing more inevitable than this damage is the paperwork.",
    tier: "common",
  },
  {
    id: "greed_03",
    name: "Compound Interest",
    sin: "greed",
    cost: 2,
    effects: [{ type: "damage", baseValue: 1, duration: 3, target: "single_enemy" }],
    flavorText: "The eighth wonder of the world, weaponized.",
    narratorQuip: "Slow, steady, and absolutely merciless. Just like actual compound interest.",
    tier: "rare",
  },
  {
    id: "greed_04",
    name: "Hostile Takeover",
    sin: "greed",
    cost: 3,
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "Your assets are being... restructured.",
    narratorQuip: "Corporate violence at its finest. The board approves.",
    tier: "epic",
  },
  {
    id: "greed_05",
    name: "Golden Shield",
    sin: "greed",
    cost: 2,
    effects: [{ type: "shield", baseValue: 2, duration: 2, target: "self" }],
    flavorText: "Money can't buy happiness, but it makes excellent armor.",
    narratorQuip: "Hiding behind gold. The rich person's survival strategy since forever.",
    tier: "rare",
  },
  {
    id: "greed_06",
    name: "Embezzle",
    sin: "greed",
    cost: 1,
    effects: [
      { type: "damage", baseValue: 1, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "Skimming off the top. Nobody will notice. Probably.",
    narratorQuip: "Creative accounting meets creative violence. Beautiful.",
    tier: "common",
  },
  {
    id: "greed_07",
    name: "Market Crash",
    sin: "greed",
    cost: 3,
    effects: [{ type: "damage", baseValue: 2, duration: 0, target: "all_enemies" }],
    flavorText: "When the market crashes, everyone loses. Except you.",
    narratorQuip: "Economic devastation as a weapon. Wall Street would be proud.",
    tier: "rare",
  },
  {
    id: "greed_08",
    name: "Loan Shark",
    sin: "greed",
    cost: 2,
    effects: [
      { type: "damage", baseValue: 2, duration: 2, target: "single_enemy" },
      { type: "damage", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "The interest rate is your blood. Terms are non-negotiable.",
    narratorQuip: "Lending pain at predatory rates. The fine print is brutal.",
    tier: "rare",
  },
  {
    id: "greed_09",
    name: "Insider Trading",
    sin: "greed",
    cost: 0,
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "damage", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Free information always costs someone. Usually you.",
    narratorQuip: "Zero cost, maximum fraud. The SEC would like a word.",
    tier: "rare",
  },
  {
    id: "greed_10",
    name: "Midas Touch",
    sin: "greed",
    cost: 4,
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "all_enemies" },
      { type: "heal", baseValue: 3, duration: 0, target: "self" },
    ],
    flavorText: "Everything you touch turns to gold. Everything they touch turns to pain.",
    narratorQuip: "The ultimate power move. Heal yourself while destroying everyone else. Peak greed.",
    tier: "epic",
  },
  // ─── GREED CATCH-UP CARDS ───
  {
    id: "greed_11",
    name: "Desperate Gambit",
    sin: "greed",
    cost: 1,
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "When the chips are down, bet everything.",
    narratorQuip: "Doubling down when you're losing. Classic gambler's fallacy. But it works here.",
    tier: "rare",
    catchup: { type: "bonus_heal", bonusValue: 2, condition: "hp_less_than_target" },
  },
  {
    id: "greed_12",
    name: "Bankruptcy Protection",
    sin: "greed",
    cost: 2,
    effects: [
      { type: "shield", baseValue: 2, duration: 1, target: "self" },
      { type: "heal", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Chapter 11: The shield that keeps on giving.",
    narratorQuip: "Filing for bankruptcy protection. In a card game. The greed is meta.",
    tier: "epic",
    catchup: { type: "bonus_heal", bonusValue: 3, condition: "hp_below_threshold" },
  },
];

// ─── ENVY CARDS (10) ────────────────────────────────────────
export const ENVY_CARDS: CardDefinition[] = [
  {
    id: "envy_01",
    name: "Jealous Glare",
    sin: "envy",
    cost: 1,
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "debuff", baseValue: 1, duration: 1, target: "single_enemy" },
    ],
    flavorText: "If looks could kill. Well, this one can.",
    narratorQuip: "Staring daggers, literally. The pettiest form of combat.",
    tier: "common",
  },
  {
    id: "envy_02",
    name: "Bitter Reflection",
    sin: "envy",
    cost: 2,
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "shield", baseValue: 2, duration: 1, target: "self" },
    ],
    flavorText: "Your strength becomes my shield. Poetic, isn't it?",
    narratorQuip: "Mirroring your opponent's power. Flattery through violence.",
    tier: "rare",
  },
  {
    id: "envy_03",
    name: "Covetous Strike",
    sin: "envy",
    cost: 1,
    effects: [{ type: "damage", baseValue: 2, duration: 0, target: "single_enemy" }],
    flavorText: "I want what you have. Starting with your HP.",
    narratorQuip: "Pure jealousy, concentrated into a fist. Efficient.",
    tier: "common",
  },
  {
    id: "envy_04",
    name: "Green-Eyed Curse",
    sin: "envy",
    cost: 2,
    effects: [{ type: "debuff", baseValue: 2, duration: 3, target: "single_enemy" }],
    flavorText: "The curse of wanting what others have. Now it's their problem.",
    narratorQuip: "A long, lingering curse. Because envy never fades quickly.",
    tier: "rare",
  },
  {
    id: "envy_05",
    name: "Spite Shield",
    sin: "envy",
    cost: 1,
    effects: [{ type: "shield", baseValue: 2, duration: 1, target: "self" }],
    flavorText: "Built from pure resentment. Surprisingly durable.",
    narratorQuip: "Shielding yourself with spite. Whatever works, I suppose.",
    tier: "common",
  },
  {
    id: "envy_06",
    name: "Toxic Comparison",
    sin: "envy",
    cost: 3,
    effects: [
      { type: "damage", baseValue: 2, duration: 2, target: "single_enemy" },
      { type: "debuff", baseValue: 1, duration: 2, target: "single_enemy" },
    ],
    flavorText: "Comparing yourself to others is poison. Now it's their poison too.",
    narratorQuip: "Social media in card form. Devastating and persistent.",
    tier: "epic",
  },
  {
    id: "envy_07",
    name: "Schadenfreude",
    sin: "envy",
    cost: 2,
    effects: [
      { type: "damage", baseValue: 1, duration: 0, target: "all_enemies" },
      { type: "heal", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Their pain is your pleasure. Literally.",
    narratorQuip: "Healing from other people's suffering. The most honest card in the game.",
    tier: "common",
  },
  {
    id: "envy_08",
    name: "Copycat",
    sin: "envy",
    cost: 2,
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "single_enemy" },
      { type: "damage", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Imitation is the sincerest form of violence.",
    narratorQuip: "Copying someone else's moves but worse. The envy special.",
    tier: "rare",
  },
  {
    id: "envy_09",
    name: "Stolen Glory",
    sin: "envy",
    cost: 0,
    effects: [
      { type: "heal", baseValue: 2, duration: 0, target: "self" },
      { type: "damage", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Borrowed glory, borrowed pain. The exchange rate is terrible.",
    narratorQuip: "Free healing with a side of self-loathing. Very on-brand for Envy.",
    tier: "rare",
  },
  {
    id: "envy_10",
    name: "Doppelganger",
    sin: "envy",
    cost: 4,
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "single_enemy" },
      { type: "shield", baseValue: 2, duration: 2, target: "self" },
      { type: "heal", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Why be yourself when you can be a better version of everyone else?",
    narratorQuip: "The ultimate identity theft. Damage, shield, AND heal. Greedy for an Envy card.",
    tier: "epic",
  },
  // ─── ENVY CATCH-UP CARDS ───
  {
    id: "envy_11",
    name: "Resentful Strike",
    sin: "envy",
    cost: 1,
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "debuff", baseValue: 1, duration: 1, target: "self" },
    ],
    flavorText: "The deeper the envy, the sharper the blade.",
    narratorQuip: "Jealousy fuels this strike. More damage when they have more HP. Poetic justice.",
    tier: "rare",
    catchup: { type: "bonus_damage", bonusValue: 2, condition: "hp_less_than_target" },
  },
  {
    id: "envy_12",
    name: "Equalizer",
    sin: "envy",
    cost: 3,
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "all_enemies" },
    ],
    flavorText: "If I can't have what they have, nobody can.",
    narratorQuip: "The great equalizer. Damage everyone, heal yourself if you're the weakest. Fair? No. Fun? Absolutely.",
    tier: "epic",
    catchup: { type: "bonus_heal", bonusValue: 3, condition: "hp_lowest" },
  },
];

// ─── Card Registry ───────────────────────────────────────────
export const ALL_CARDS: CardDefinition[] = [...WRATH_CARDS, ...SLOTH_CARDS, ...GREED_CARDS, ...ENVY_CARDS];

export const CARD_MAP: Record<string, CardDefinition> = {};
ALL_CARDS.forEach((card) => {
  CARD_MAP[card.id] = card;
});

export function getCardById(id: string): CardDefinition | undefined {
  return CARD_MAP[id];
}

export function getDeckForSin(sin: "wrath" | "sloth" | "greed" | "envy"): string[] {
  const cardMap: Record<string, CardDefinition[]> = {
    wrath: WRATH_CARDS,
    sloth: SLOTH_CARDS,
    greed: GREED_CARDS,
    envy: ENVY_CARDS,
  };
  return (cardMap[sin] || []).map((c) => c.id);
}

// ─── Narrator Lines (Maximum Sass & Cynicism) ────────────────
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
    "Round {round}. The damage compounds now, because life wasn't unfair enough.",
    "Round {round}. Things are about to get exponentially worse. You're welcome.",
    "Welcome to Round {round}. Your cards hit harder. So does regret.",
    "Round {round} begins. The math is getting scary and so am I.",
    "Round {round}. Remember when damage was small? Those were the days.",
    "Round {round}. The escalation continues. Just like your bad decisions.",
    "Round {round}. Compounding interest, but for pain. Capitalism meets combat.",
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
    "The damage numbers are getting ridiculous. I love it.",
    "That hit was so hard, the other players felt it too.",
    "Overkill? Never heard of it. That damage was *chef's kiss*.",
    "The compounding mechanic was a mistake. A beautiful, violent mistake.",
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
  overcharge: [
    "{player} OVERCHARGES! Spending HP for extra corruption. Peak Wrath behavior.",
    "{player} burns their own life force for power. Self-destructive? Absolutely. On brand? Also yes.",
    "OVERCHARGE activated! {player} trades blood for corruption. The math checks out. The therapy doesn't.",
    "{player} goes all-in with Overcharge. Nothing says 'Wrath' like hurting yourself for advantage.",
  ],
  lethargy: [
    "{player}'s Lethargy kicks in. Unspent corruption carries over. Lazy AND efficient.",
    "Sloth passive: {player} banks corruption for later. Procrastination as a superpower.",
    "{player} conserves energy. The Lethargy bonus grows. Patience is a sin too, apparently.",
  ],
  noEnergy: [
    "Not enough corruption to play that. Even sin has a budget.",
    "Insufficient corruption. Your ambitions exceed your resources. Story of your life.",
    "Can't afford that card. Corruption doesn't grow on trees. Well, actually...",
  ],
  catchupTriggered: [
    "Catch-up bonus activated! Being behind has its perks. Who knew?",
    "The underdog bonus kicks in. Desperation is a hell of a motivator.",
    "Losing? Here's a consolation prize. Don't get used to it.",
    "Catch-up mechanic engaged. The game refuses to let you die quietly.",
    "Bonus activated! Even the universe pities you right now.",
  ],
  shieldAbsorbed: [
    "Shield absorbed the hit! That's what shields DO, people.",
    "Damage blocked by shield. Defense actually working? Shocking.",
    "The shield takes the blow. Your HP thanks you for the foresight.",
    "Absorbed! That shield earned its keep today.",
  ],
};
