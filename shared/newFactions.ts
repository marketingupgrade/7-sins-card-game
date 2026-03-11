/**
 * 7 Deadly Sins Card Game — New Factions: Pride, Lust, Gluttony
 *
 * PRIDE — Domination & Self-Empowerment
 * Passive: HUBRIS — When Pride plays a card that costs 0, gain +2 shield.
 *   Pride believes it doesn't need to spend resources to be powerful.
 *   Identity: Buff-heavy, self-empowering, punishes weakness in others.
 *   Allocation: 25% OFF, 22% DEF, 14% CC, 22% HYB, 17% UNQ (18F/12C/6CU)
 *
 * LUST — Temptation & Life Drain
 * Passive: TEMPTATION — When Lust deals damage to a single enemy, heal 1 HP.
 *   Lust sustains itself through intimate violence.
 *   Identity: Lifesteal-heavy, single-target focused, seductive sustain.
 *   Allocation: 28% OFF, 22% DEF, 11% CC, 22% HYB, 17% UNQ (19F/11C/6CU)
 *
 * GLUTTONY — Consumption & Overwhelming Force
 * Passive: DEVOUR — At the start of each turn, if Gluttony has 3+ active effects on enemies,
 *   gain +1 energy. Gluttony feeds on the chaos it creates.
 *   Identity: Effect-stacking, AoE-heavy, overwhelming through volume.
 *   Allocation: 22% OFF, 19% DEF, 19% CC, 22% HYB, 17% UNQ (16F/14C/6CU)
 */

import { CardDefinition } from "./gameTypes";

// ═══════════════════════════════════════════════════════════════
// PRIDE — Domination & Self-Empowerment
// Passive: HUBRIS (playing a cost-0 card grants +2 shield)
// Identity: Buff-heavy, self-empowering, punishes weakness
// ═══════════════════════════════════════════════════════════════
export const PRIDE_CARDS: CardDefinition[] = [
  // ── OFFENSIVE FLAT (5 cards) ──
  {
    id: "pride_01", name: "Royal Decree", sin: "pride", cost: 1, cardType: "flat",
    effects: [{ type: "damage", baseValue: 2, duration: 0, target: "single_enemy" }],
    flavorText: "The king speaks. The peasant bleeds.",
    narratorQuip: "4 damage with the authority of a monarch. Bow before Pride.",
    tier: "common",
  },
  {
    id: "pride_02", name: "Divine Right", sin: "pride", cost: 2, cardType: "flat",
    effects: [{ type: "damage", baseValue: 2, duration: 0, target: "single_enemy" }],
    flavorText: "God chose me. Who chose you?",
    narratorQuip: "5 damage, divinely ordained. Or so Pride believes.",
    tier: "common",
  },
  {
    id: "pride_03", name: "Crushing Superiority", sin: "pride", cost: 3, cardType: "flat",
    effects: [{ type: "damage", baseValue: 3, duration: 0, target: "single_enemy" }],
    flavorText: "You were never competition. Just a stepping stone.",
    narratorQuip: "7 damage. Pride doesn't compete — it dominates.",
    tier: "rare",
  },
  {
    id: "pride_04", name: "Contempt", sin: "pride", cost: 0, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
    ],
    flavorText: "You're not even worth the energy. Literally.",
    narratorQuip: "Free 3 damage. Pride doesn't waste resources on the unworthy. Plus free shield from Hubris.",
    tier: "rare",
  },
  {
    id: "pride_05", name: "Sovereign Wrath", sin: "pride", cost: 4, cardType: "flat",
    effects: [{ type: "damage", baseValue: 2, duration: 0, target: "all_enemies" }],
    flavorText: "A king's anger falls on all subjects equally.",
    narratorQuip: "AoE 5. When Pride is displeased, everyone suffers.",
    tier: "epic",
  },
  // ── OFFENSIVE COMPOUNDING (4 cards) ──
  {
    id: "pride_06", name: "Growing Legend", sin: "pride", cost: 2, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 2, duration: 3, target: "single_enemy" }],
    flavorText: "My reputation precedes me. And it compounds.",
    narratorQuip: "3... 3... 6 damage. Pride's legend grows each round.",
    tier: "rare",
  },
  {
    id: "pride_07", name: "Spreading Fame", sin: "pride", cost: 3, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 2, duration: 3, target: "all_enemies" }],
    flavorText: "Everyone will know my name. Whether they want to or not.",
    narratorQuip: "3... 3... 6 to ALL. Fame is a weapon.",
    tier: "epic",
  },
  {
    id: "pride_08", name: "Lingering Disdain", sin: "pride", cost: 1, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 2, duration: 3, target: "single_enemy" }],
    flavorText: "My contempt for you only grows with time.",
    narratorQuip: "4... 4... 8 damage over 3 rounds. Disdain that escalates.",
    tier: "common",
  },
  {
    id: "pride_09", name: "Eternal Grudge", sin: "pride", cost: 3, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 2, duration: 3, target: "single_enemy" }],
    flavorText: "Pride never forgets a slight. Never.",
    narratorQuip: "4... 4... 8 damage. A grudge that compounds interest.",
    tier: "epic",
  },
  // ── DEFENSIVE FLAT (4 cards) ──
  {
    id: "pride_10", name: "Regal Bearing", sin: "pride", cost: 1, cardType: "flat",
    effects: [{ type: "shield", baseValue: 6, duration: 0, target: "self" }],
    flavorText: "A king does not flinch.",
    narratorQuip: "4 shield. Pride's armor is its own magnificence.",
    tier: "common",
  },
  {
    id: "pride_11", name: "Narcissistic Heal", sin: "pride", cost: 2, cardType: "flat",
    effects: [{ type: "heal", baseValue: 8, duration: 0, target: "self" }],
    flavorText: "I love myself enough for everyone.",
    narratorQuip: "5 healing. Self-love taken to its logical extreme.",
    tier: "rare",
  },
  {
    id: "pride_12", name: "Untouchable", sin: "pride", cost: 0, cardType: "flat",
    effects: [{ type: "shield", baseValue: 6, duration: 0, target: "self" }],
    flavorText: "You can't touch what you can't reach.",
    narratorQuip: "Free 3 shield, plus 2 more from Hubris. Pride protects itself effortlessly.",
    tier: "common",
  },
  {
    id: "pride_13", name: "Crown's Blessing", sin: "pride", cost: 3, cardType: "flat",
    effects: [
      { type: "heal", baseValue: 7, duration: 0, target: "self" },
      { type: "shield", baseValue: 6, duration: 0, target: "self" },
    ],
    flavorText: "The crown heals all wounds. Especially self-inflicted ones.",
    narratorQuip: "4 heal + 3 shield. Pride's version of healthcare.",
    tier: "epic",
  },
  // ── DEFENSIVE COMPOUNDING (4 cards) ──
  {
    id: "pride_14", name: "Swelling Ego", sin: "pride", cost: 2, cardType: "compounding",
    effects: [{ type: "shield", baseValue: 6, duration: 3, target: "self" }],
    flavorText: "My ego grows. So does my armor.",
    narratorQuip: "Shield 3... 3... 6. The ego is an excellent shield.",
    tier: "rare",
  },
  {
    id: "pride_15", name: "Self-Worship", sin: "pride", cost: 1, cardType: "compounding",
    effects: [{ type: "heal", baseValue: 6, duration: 3, target: "self" }],
    flavorText: "I am my own deity. And I heal the faithful.",
    narratorQuip: "Heal 2... 2... 4. Self-worship as medicine.",
    tier: "common",
  },
  {
    id: "pride_16", name: "Monument to Self", sin: "pride", cost: 2, cardType: "compounding",
    effects: [{ type: "shield", baseValue: 5, duration: 3, target: "self" }],
    flavorText: "A monument that grows more impressive each round.",
    narratorQuip: "Shield 2... 2... 4. Building a fortress of narcissism.",
    tier: "common",
  },
  {
    id: "pride_17", name: "Regenerating Vanity", sin: "pride", cost: 2, cardType: "compounding",
    effects: [{ type: "heal", baseValue: 6, duration: 3, target: "self" }],
    flavorText: "Beauty must be maintained. At any cost.",
    narratorQuip: "Heal 3... 3... 6. Vanity is surprisingly restorative.",
    tier: "rare",
  },
  // ── CROWD CONTROL FLAT (2 cards) ──
  {
    id: "pride_18", name: "Humiliate", sin: "pride", cost: 2, cardType: "flat",
    effects: [{ type: "debuff", baseValue: 3, duration: 0, target: "single_enemy" }],
    flavorText: "Kneel before your better.",
    narratorQuip: "Debuff 3. Pride's favorite pastime: humiliation.",
    tier: "rare",
  },
  {
    id: "pride_19", name: "Mass Condescension", sin: "pride", cost: 3, cardType: "flat",
    effects: [{ type: "debuff", baseValue: 2, duration: 0, target: "all_enemies" }],
    flavorText: "I look down on all of you equally.",
    narratorQuip: "AoE debuff 2. Equal-opportunity condescension.",
    tier: "rare",
  },
  // ── CROWD CONTROL COMPOUNDING (3 cards) ──
  {
    id: "pride_20", name: "Aura of Supremacy", sin: "pride", cost: 2, cardType: "compounding",
    effects: [{ type: "debuff", baseValue: 2, duration: 3, target: "single_enemy" }],
    flavorText: "In my presence, all others diminish.",
    narratorQuip: "Debuff 2... 2... 4. Pride's aura weakens the unworthy.",
    tier: "common",
  },
  {
    id: "pride_21", name: "Oppressive Majesty", sin: "pride", cost: 3, cardType: "compounding",
    effects: [{ type: "debuff", baseValue: 2, duration: 3, target: "all_enemies" }],
    flavorText: "My majesty is a weight that crushes all who behold it.",
    narratorQuip: "Debuff 2... 2... 4 to ALL. Oppressive and majestic.",
    tier: "epic",
  },
  {
    id: "pride_22", name: "Withering Scorn", sin: "pride", cost: 1, cardType: "compounding",
    effects: [{ type: "debuff", baseValue: 1, duration: 3, target: "single_enemy" }],
    flavorText: "A look of scorn that erodes their very soul.",
    narratorQuip: "Debuff 1... 1... 2. Scorn that compounds.",
    tier: "common",
  },
  // ── HYBRID FLAT (4 cards) ──
  {
    id: "pride_23", name: "Glorious Strike", sin: "pride", cost: 2, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "shield", baseValue: 5, duration: 0, target: "self" },
    ],
    flavorText: "Every blow I land is a work of art.",
    narratorQuip: "4 damage + 2 shield. Pride fights beautifully.",
    tier: "common",
  },
  {
    id: "pride_24", name: "Coronation", sin: "pride", cost: 5, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 6, duration: 0, target: "all_enemies" },
      { type: "heal", baseValue: 7, duration: 0, target: "self" },
      { type: "shield", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "The coronation of the one true ruler. Kneel or perish.",
    narratorQuip: "AoE 6 + heal 4 + shield 3. Pride's magnum opus. Bow down.",
    tier: "epic",
  },
  {
    id: "pride_25", name: "Belittle", sin: "pride", cost: 1, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "debuff", baseValue: 1, duration: 0, target: "single_enemy" },
    ],
    flavorText: "You're small. Let me make you smaller.",
    narratorQuip: "2 damage + 1 debuff. Pride's casual cruelty.",
    tier: "common",
  },
  {
    id: "pride_26", name: "Imperious Command", sin: "pride", cost: 0, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "debuff", baseValue: 1, duration: 0, target: "single_enemy" },
    ],
    flavorText: "I command. You obey. It's that simple.",
    narratorQuip: "Free damage + debuff + Hubris shield. Pride wastes nothing.",
    tier: "rare",
  },
  // ── HYBRID COMPOUNDING (4 cards) ──
  {
    id: "pride_27", name: "Rising Dominion", sin: "pride", cost: 2, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 2, duration: 3, target: "single_enemy" },
      { type: "shield", baseValue: 5, duration: 3, target: "self" },
    ],
    flavorText: "My dominion expands. Your resistance shrinks.",
    narratorQuip: "Damage 2+shield 1... same... then 4+2. Growing dominance.",
    tier: "rare",
  },
  {
    id: "pride_28", name: "Narcissistic Fury", sin: "pride", cost: 3, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 2, duration: 3, target: "single_enemy" },
      { type: "heal", baseValue: 5, duration: 3, target: "self" },
    ],
    flavorText: "My rage heals me. Your suffering is my medicine.",
    narratorQuip: "Damage 2+heal 1... same... then 4+2. Narcissistic lifesteal.",
    tier: "rare",
  },
  {
    id: "pride_29", name: "Tyrannical Presence", sin: "pride", cost: 2, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 1, duration: 3, target: "all_enemies" },
      { type: "debuff", baseValue: 1, duration: 3, target: "all_enemies" },
    ],
    flavorText: "My presence alone is enough to break you.",
    narratorQuip: "AoE damage+debuff compounding. Tyranny that escalates.",
    tier: "epic",
  },
  {
    id: "pride_30", name: "Vainglory", sin: "pride", cost: 1, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 5, duration: 3, target: "single_enemy" },
      { type: "shield", baseValue: 1, duration: 3, target: "self" },
    ],
    flavorText: "My glory is my shield. My shield is my weapon.",
    narratorQuip: "1+1... 1+1... 2+2. Vainglory in its purest form.",
    tier: "common",
  },
  // ── UNIQUE / CATCH-UP (6 cards) ──
  {
    id: "pride_31", name: "Wounded Pride", sin: "pride", cost: 1, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
    ],
    flavorText: "You dare wound ME? The punishment will be severe.",
    narratorQuip: "More damage when Pride is behind. Wounded ego = dangerous ego.",
    tier: "common",
    catchup: { type: "bonus_damage", bonusValue: 1, condition: "hp_less_than_target" },
  },
  {
    id: "pride_32", name: "Desperate Grandeur", sin: "pride", cost: 2, cardType: "flat",
    effects: [
      { type: "heal", baseValue: 6, duration: 0, target: "self" },
      { type: "shield", baseValue: 5, duration: 0, target: "self" },
    ],
    flavorText: "Even in defeat, I am magnificent.",
    narratorQuip: "Catch-up defense. Pride refuses to look weak.",
    tier: "rare",
    catchup: { type: "bonus_heal", bonusValue: 1, condition: "hp_below_threshold" },
  },
  {
    id: "pride_33", name: "Righteous Fury", sin: "pride", cost: 3, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "debuff", baseValue: 1, duration: 0, target: "single_enemy" },
    ],
    flavorText: "My fury is righteous. Yours is just pathetic.",
    narratorQuip: "Catch-up damage + debuff. Pride's revenge is always justified.",
    tier: "rare",
    catchup: { type: "bonus_damage", bonusValue: 1, condition: "hp_less_than_any_opponent" },
  },
  {
    id: "pride_34", name: "Throne Reclaimed", sin: "pride", cost: 2, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 6, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "The throne was never truly lost. Just temporarily unoccupied.",
    narratorQuip: "Damage + heal with catch-up. Pride always bounces back.",
    tier: "common",
    catchup: { type: "bonus_heal", bonusValue: 1, condition: "hp_lowest" },
  },
  {
    id: "pride_35", name: "Defiant Stand", sin: "pride", cost: 1, cardType: "flat",
    effects: [
      { type: "shield", baseValue: 6, duration: 0, target: "self" },
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
    ],
    flavorText: "I will NOT fall. Not to the likes of you.",
    narratorQuip: "Shield + damage with catch-up. Pride's last stand is always dramatic.",
    tier: "common",
    catchup: { type: "bonus_damage", bonusValue: 1, condition: "hp_below_threshold" },
  },
  {
    id: "pride_36", name: "Apotheosis", sin: "pride", cost: 5, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 6, duration: 0, target: "all_enemies" },
      { type: "shield", baseValue: 6, duration: 0, target: "self" },
      { type: "heal", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "I am become god. Tremble before my ascension.",
    narratorQuip: "AoE 5 + shield 4 + heal 3 + catch-up. Pride's ultimate form.",
    tier: "epic",
    catchup: { type: "bonus_heal", bonusValue: 1, condition: "hp_lowest" },
  },
];

// ═══════════════════════════════════════════════════════════════
// LUST — Temptation & Life Drain
// Passive: TEMPTATION (single-target damage heals Lust 1 HP)
// Identity: Lifesteal-heavy, single-target focused, seductive sustain
// ═══════════════════════════════════════════════════════════════
export const LUST_CARDS: CardDefinition[] = [
  // ── OFFENSIVE FLAT (6 cards) ──
  {
    id: "lust_01", name: "Seductive Strike", sin: "lust", cost: 1, cardType: "flat",
    effects: [{ type: "damage", baseValue: 2, duration: 0, target: "single_enemy" }],
    flavorText: "A caress that cuts deeper than any blade.",
    narratorQuip: "4 damage + 1 passive heal. Lust's touch is... complicated.",
    tier: "common",
  },
  {
    id: "lust_02", name: "Kiss of Death", sin: "lust", cost: 2, cardType: "flat",
    effects: [{ type: "damage", baseValue: 3, duration: 0, target: "single_enemy" }],
    flavorText: "The last kiss you'll ever receive.",
    narratorQuip: "6 damage. The kiss that kills. Literally.",
    tier: "rare",
  },
  {
    id: "lust_03", name: "Heartbreaker", sin: "lust", cost: 3, cardType: "flat",
    effects: [{ type: "damage", baseValue: 4, duration: 0, target: "single_enemy" }],
    flavorText: "Breaking hearts is just the beginning.",
    narratorQuip: "7 damage. Hearts aren't the only thing Lust breaks.",
    tier: "rare",
  },
  {
    id: "lust_04", name: "Forbidden Touch", sin: "lust", cost: 0, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "damage", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Forbidden for a reason. The pleasure costs.",
    narratorQuip: "Free 3 damage, 1 self-harm. Plus passive heal. Net positive.",
    tier: "common",
  },
  {
    id: "lust_05", name: "Irresistible Force", sin: "lust", cost: 4, cardType: "flat",
    effects: [{ type: "damage", baseValue: 2, duration: 0, target: "all_enemies" }],
    flavorText: "No one can resist. No one wants to.",
    narratorQuip: "AoE 4. Lust's charm affects everyone in the room.",
    tier: "epic",
  },
  {
    id: "lust_06", name: "Passionate Fury", sin: "lust", cost: 2, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "single_enemy" },
      { type: "damage", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Passion burns both ways.",
    narratorQuip: "5 damage, 1 self-harm. Passion always has a price.",
    tier: "common",
  },
  // ── OFFENSIVE COMPOUNDING (4 cards) ──
  {
    id: "lust_07", name: "Slow Seduction", sin: "lust", cost: 1, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 2, duration: 3, target: "single_enemy" }],
    flavorText: "Patience. The best things come to those who wait.",
    narratorQuip: "4... 4... 8 damage. Seduction is a long game.",
    tier: "common",
  },
  {
    id: "lust_08", name: "Burning Desire", sin: "lust", cost: 2, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 2, duration: 3, target: "single_enemy" }],
    flavorText: "A desire that burns hotter with each passing moment.",
    narratorQuip: "3... 3... 6 damage. Desire that escalates dangerously.",
    tier: "rare",
  },
  {
    id: "lust_09", name: "Infectious Passion", sin: "lust", cost: 3, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 2, duration: 3, target: "all_enemies" }],
    flavorText: "Passion spreads like wildfire. Everyone gets burned.",
    narratorQuip: "2... 2... 4 to ALL. Passion is contagious.",
    tier: "rare",
  },
  {
    id: "lust_10", name: "Obsessive Love", sin: "lust", cost: 3, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 2, duration: 3, target: "single_enemy" }],
    flavorText: "I can't stop. I won't stop. You're mine.",
    narratorQuip: "4... 4... 8 damage. Obsession that compounds.",
    tier: "epic",
  },
  // ── DEFENSIVE FLAT (4 cards) ──
  {
    id: "lust_11", name: "Alluring Grace", sin: "lust", cost: 1, cardType: "flat",
    effects: [{ type: "shield", baseValue: 5, duration: 0, target: "self" }],
    flavorText: "Grace that deflects blows as easily as it attracts gazes.",
    narratorQuip: "4 shield. Lust's beauty is its armor.",
    tier: "common",
  },
  {
    id: "lust_12", name: "Rejuvenating Kiss", sin: "lust", cost: 2, cardType: "flat",
    effects: [{ type: "heal", baseValue: 5, duration: 0, target: "self" }],
    flavorText: "A kiss that heals all wounds. Mostly.",
    narratorQuip: "5 healing. Lust's kisses have medicinal properties.",
    tier: "rare",
  },
  {
    id: "lust_13", name: "Enchanted Veil", sin: "lust", cost: 0, cardType: "flat",
    effects: [{ type: "shield", baseValue: 4, duration: 0, target: "self" }],
    flavorText: "A veil of enchantment that turns blades aside.",
    narratorQuip: "Free 2 shield. Lust's defenses are effortless.",
    tier: "common",
  },
  {
    id: "lust_14", name: "Pleasure's Embrace", sin: "lust", cost: 3, cardType: "flat",
    effects: [
      { type: "heal", baseValue: 4, duration: 0, target: "self" },
      { type: "shield", baseValue: 4, duration: 0, target: "self" },
    ],
    flavorText: "Surrender to pleasure. Let it heal you.",
    narratorQuip: "4 heal + 3 shield. Pleasure as medicine.",
    tier: "epic",
  },
  // ── DEFENSIVE COMPOUNDING (3 cards) ──
  {
    id: "lust_15", name: "Lingering Embrace", sin: "lust", cost: 2, cardType: "compounding",
    effects: [{ type: "heal", baseValue: 4, duration: 3, target: "self" }],
    flavorText: "An embrace that heals long after the touch fades.",
    narratorQuip: "Heal 3... 3... 6. The embrace lingers.",
    tier: "rare",
  },
  {
    id: "lust_16", name: "Charmed Barrier", sin: "lust", cost: 1, cardType: "compounding",
    effects: [{ type: "shield", baseValue: 4, duration: 3, target: "self" }],
    flavorText: "A barrier woven from pure charm.",
    narratorQuip: "Shield 2... 2... 4. Charm as protection.",
    tier: "common",
  },
  {
    id: "lust_17", name: "Regenerating Desire", sin: "lust", cost: 2, cardType: "compounding",
    effects: [{ type: "heal", baseValue: 3, duration: 3, target: "self" }],
    flavorText: "Desire that heals as much as it hurts.",
    narratorQuip: "Heal 2... 2... 4. Desire is restorative.",
    tier: "common",
  },
  // ── CROWD CONTROL FLAT (2 cards) ──
  {
    id: "lust_18", name: "Mesmerize", sin: "lust", cost: 2, cardType: "flat",
    effects: [{ type: "debuff", baseValue: 3, duration: 0, target: "single_enemy" }],
    flavorText: "Look into my eyes. Forget everything else.",
    narratorQuip: "Debuff 3. Mesmerized and weakened. Classic Lust.",
    tier: "rare",
  },
  {
    id: "lust_19", name: "Mass Enchantment", sin: "lust", cost: 3, cardType: "flat",
    effects: [{ type: "debuff", baseValue: 2, duration: 0, target: "all_enemies" }],
    flavorText: "Everyone in the room falls under the spell.",
    narratorQuip: "AoE debuff 2. Lust enchants the entire arena.",
    tier: "rare",
  },
  // ── CROWD CONTROL COMPOUNDING (2 cards) ──
  {
    id: "lust_20", name: "Addictive Presence", sin: "lust", cost: 2, cardType: "compounding",
    effects: [{ type: "debuff", baseValue: 2, duration: 3, target: "single_enemy" }],
    flavorText: "Once you've tasted it, you can never leave.",
    narratorQuip: "Debuff 2... 2... 4. Addiction that compounds.",
    tier: "common",
  },
  {
    id: "lust_21", name: "Siren Song", sin: "lust", cost: 1, cardType: "compounding",
    effects: [{ type: "debuff", baseValue: 1, duration: 3, target: "single_enemy" }],
    flavorText: "A song that weakens with every verse.",
    narratorQuip: "Debuff 1... 1... 2. The siren's song grows louder.",
    tier: "common",
  },
  // ── HYBRID FLAT (4 cards) ──
  {
    id: "lust_22", name: "Vampiric Kiss", sin: "lust", cost: 2, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 3, duration: 0, target: "self" },
    ],
    flavorText: "Your life force tastes divine.",
    narratorQuip: "4 damage + 2 heal + 1 passive heal. Lust's signature move.",
    tier: "common",
  },
  {
    id: "lust_23", name: "Succubus Drain", sin: "lust", cost: 4, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 4, duration: 0, target: "self" },
      { type: "debuff", baseValue: 1, duration: 0, target: "single_enemy" },
    ],
    flavorText: "The succubus takes everything. And gives nothing back.",
    narratorQuip: "5 damage + 3 heal + debuff. The ultimate drain.",
    tier: "epic",
  },
  {
    id: "lust_24", name: "Enthrall", sin: "lust", cost: 1, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "debuff", baseValue: 1, duration: 0, target: "single_enemy" },
    ],
    flavorText: "Enthralled. Weakened. Yours.",
    narratorQuip: "2 damage + debuff. Lust's casual manipulation.",
    tier: "common",
  },
  {
    id: "lust_25", name: "Fatal Attraction", sin: "lust", cost: 3, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "single_enemy" },
      { type: "shield", baseValue: 4, duration: 0, target: "self" },
    ],
    flavorText: "They can't help but come closer. That's the fatal part.",
    narratorQuip: "5 damage + 2 shield. Attraction that kills.",
    tier: "rare",
  },
  // ── HYBRID COMPOUNDING (4 cards) ──
  {
    id: "lust_26", name: "Draining Embrace", sin: "lust", cost: 2, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 2, duration: 3, target: "single_enemy" },
      { type: "heal", baseValue: 3, duration: 3, target: "self" },
    ],
    flavorText: "An embrace that takes more than it gives.",
    narratorQuip: "Damage 2+heal 1... same... then 4+2. Compounding lifesteal.",
    tier: "rare",
  },
  {
    id: "lust_27", name: "Toxic Relationship", sin: "lust", cost: 3, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 2, duration: 3, target: "single_enemy" },
      { type: "debuff", baseValue: 1, duration: 3, target: "single_enemy" },
    ],
    flavorText: "You can't leave. You don't want to. That's the problem.",
    narratorQuip: "Damage+debuff compounding. A relationship that only gets worse.",
    tier: "epic",
  },
  {
    id: "lust_28", name: "Enchanting Aura", sin: "lust", cost: 1, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 3, duration: 3, target: "single_enemy" },
      { type: "shield", baseValue: 1, duration: 3, target: "self" },
    ],
    flavorText: "An aura that charms and protects in equal measure.",
    narratorQuip: "1+1... 1+1... 2+2. Enchantment that builds.",
    tier: "common",
  },
  {
    id: "lust_29", name: "Passionate Bond", sin: "lust", cost: 2, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 2, duration: 3, target: "single_enemy" },
      { type: "heal", baseValue: 3, duration: 3, target: "self" },
    ],
    flavorText: "A bond forged in passion. It drains them. It heals you.",
    narratorQuip: "2+2... 2+2... 4+4. The ultimate parasitic bond.",
    tier: "rare",
  },
  // ── UNIQUE / CATCH-UP (6 cards) ──
  {
    id: "lust_30", name: "Desperate Seduction", sin: "lust", cost: 1, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 3, duration: 0, target: "self" },
    ],
    flavorText: "Desperation makes the seduction more... intense.",
    narratorQuip: "Catch-up lifesteal. Lust fights harder when cornered.",
    tier: "common",
    catchup: { type: "bonus_damage", bonusValue: 2, condition: "hp_less_than_target" },
  },
  {
    id: "lust_31", name: "Healing Embrace", sin: "lust", cost: 2, cardType: "flat",
    effects: [
      { type: "heal", baseValue: 4, duration: 0, target: "self" },
      { type: "shield", baseValue: 4, duration: 0, target: "self" },
    ],
    flavorText: "An embrace that mends what's broken.",
    narratorQuip: "Catch-up defense. Lust's embrace heals all wounds.",
    tier: "rare",
    catchup: { type: "bonus_heal", bonusValue: 2, condition: "hp_below_threshold" },
  },
  {
    id: "lust_32", name: "Jealous Lover", sin: "lust", cost: 3, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "debuff", baseValue: 2, duration: 0, target: "single_enemy" },
    ],
    flavorText: "Hell hath no fury like a lover scorned.",
    narratorQuip: "Catch-up damage + debuff. Lust's jealousy is devastating.",
    tier: "rare",
    catchup: { type: "bonus_damage", bonusValue: 2, condition: "hp_less_than_any_opponent" },
  },
  {
    id: "lust_33", name: "Rebirth Through Desire", sin: "lust", cost: 2, cardType: "flat",
    effects: [
      { type: "heal", baseValue: 4, duration: 0, target: "self" },
    ],
    flavorText: "From the ashes of desire, new strength is born.",
    narratorQuip: "Catch-up heal. Lust's desire for life is strongest when dying.",
    tier: "common",
    catchup: { type: "bonus_heal", bonusValue: 2, condition: "hp_lowest" },
  },
  {
    id: "lust_34", name: "Charming Riposte", sin: "lust", cost: 1, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 4, duration: 0, target: "single_enemy" },
      { type: "shield", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "A charming counter that leaves them wanting more.",
    narratorQuip: "Damage + shield with catch-up. Lust's elegant defense.",
    tier: "common",
    catchup: { type: "bonus_damage", bonusValue: 2, condition: "hp_below_threshold" },
  },
  {
    id: "lust_35", name: "Aphrodite's Wrath", sin: "lust", cost: 5, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 4, duration: 0, target: "all_enemies" },
      { type: "heal", baseValue: 2, duration: 0, target: "self" },
      { type: "debuff", baseValue: 2, duration: 0, target: "all_enemies" },
    ],
    flavorText: "Even the goddess of love has a breaking point.",
    narratorQuip: "AoE 5 + heal 4 + AoE debuff 2 + catch-up. Lust's ultimate form.",
    tier: "epic",
    catchup: { type: "bonus_heal", bonusValue: 2, condition: "hp_lowest" },
  },
  {
    id: "lust_36", name: "Soulmate Bond", sin: "lust", cost: 4, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 4, duration: 0, target: "self" },
    ],
    flavorText: "A bond so deep it transcends mortality. Theirs, not yours.",
    narratorQuip: "6 damage + 3 heal. The soulmate bond is one-sided.",
    tier: "epic",
    catchup: { type: "bonus_damage", bonusValue: 2, condition: "hp_less_than_target" },
  },
];

// ═══════════════════════════════════════════════════════════════
// GLUTTONY — Consumption & Overwhelming Force
// Passive: DEVOUR (3+ active effects on enemies = +1 energy per turn)
// Identity: Effect-stacking, AoE-heavy, overwhelming through volume
// ═══════════════════════════════════════════════════════════════
export const GLUTTONY_CARDS: CardDefinition[] = [
  // ── OFFENSIVE FLAT (4 cards) ──
  {
    id: "gluttony_01", name: "Ravenous Bite", sin: "gluttony", cost: 1, cardType: "flat",
    effects: [{ type: "damage", baseValue: 2, duration: 0, target: "single_enemy" }],
    flavorText: "One bite is never enough.",
    narratorQuip: "4 damage. Gluttony's appetite is insatiable.",
    tier: "common",
  },
  {
    id: "gluttony_02", name: "Feast of Destruction", sin: "gluttony", cost: 3, cardType: "flat",
    effects: [{ type: "damage", baseValue: 2, duration: 0, target: "all_enemies" }],
    flavorText: "A feast where everyone is the main course.",
    narratorQuip: "AoE 4. Gluttony doesn't pick favorites — it eats everything.",
    tier: "rare",
  },
  {
    id: "gluttony_03", name: "Gorge", sin: "gluttony", cost: 2, cardType: "flat",
    effects: [{ type: "damage", baseValue: 3, duration: 0, target: "single_enemy" }],
    flavorText: "Consuming everything in sight. Including your HP.",
    narratorQuip: "5 damage. Gluttony gorges on your life force.",
    tier: "common",
  },
  {
    id: "gluttony_04", name: "Consume All", sin: "gluttony", cost: 5, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "all_enemies" },
      { type: "damage", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "Consume everything. Even yourself.",
    narratorQuip: "AoE 5, 2 self-harm. Gluttony's appetite knows no bounds.",
    tier: "epic",
  },
  // ── OFFENSIVE COMPOUNDING (4 cards) ──
  {
    id: "gluttony_05", name: "Slow Digestion", sin: "gluttony", cost: 1, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 2, duration: 3, target: "single_enemy" }],
    flavorText: "Being digested alive. Slowly.",
    narratorQuip: "4... 4... 8 damage. Digestion takes time.",
    tier: "common",
  },
  {
    id: "gluttony_06", name: "Spreading Rot", sin: "gluttony", cost: 2, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 1, duration: 3, target: "all_enemies" }],
    flavorText: "Rot spreads to everything it touches.",
    narratorQuip: "2... 2... 4 to ALL. Rot is indiscriminate.",
    tier: "rare",
  },
  {
    id: "gluttony_07", name: "Acid Stomach", sin: "gluttony", cost: 2, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 2, duration: 3, target: "single_enemy" }],
    flavorText: "The acid dissolves everything. Eventually.",
    narratorQuip: "3... 3... 6 damage. Acid that compounds.",
    tier: "rare",
  },
  {
    id: "gluttony_08", name: "Plague of Locusts", sin: "gluttony", cost: 3, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 2, duration: 3, target: "all_enemies" }],
    flavorText: "They consume everything. Leave nothing behind.",
    narratorQuip: "3... 3... 6 to ALL. Biblical devastation.",
    tier: "epic",
  },
  // ── DEFENSIVE FLAT (3 cards) ──
  {
    id: "gluttony_09", name: "Bloated Armor", sin: "gluttony", cost: 1, cardType: "flat",
    effects: [{ type: "shield", baseValue: 7, duration: 0, target: "self" }],
    flavorText: "The fat absorbs the blow. Surprisingly effective.",
    narratorQuip: "4 shield. Gluttony's bulk is its armor.",
    tier: "common",
  },
  {
    id: "gluttony_10", name: "Regenerative Feast", sin: "gluttony", cost: 2, cardType: "flat",
    effects: [{ type: "heal", baseValue: 7, duration: 0, target: "self" }],
    flavorText: "Eating heals all wounds. That's just science.",
    narratorQuip: "5 healing. Gluttony's diet plan: eat everything, heal everything.",
    tier: "rare",
  },
  {
    id: "gluttony_11", name: "Thick Skin", sin: "gluttony", cost: 0, cardType: "flat",
    effects: [{ type: "shield", baseValue: 5, duration: 0, target: "self" }],
    flavorText: "Years of excess have made the skin remarkably tough.",
    narratorQuip: "Free 2 shield. Gluttony's natural defense.",
    tier: "common",
  },
  // ── DEFENSIVE COMPOUNDING (4 cards) ──
  {
    id: "gluttony_12", name: "Absorb", sin: "gluttony", cost: 2, cardType: "compounding",
    effects: [{ type: "shield", baseValue: 6, duration: 3, target: "self" }],
    flavorText: "Absorbing everything. Damage included.",
    narratorQuip: "Shield 3... 3... 6. Gluttony absorbs it all.",
    tier: "rare",
  },
  {
    id: "gluttony_13", name: "Endless Appetite", sin: "gluttony", cost: 1, cardType: "compounding",
    effects: [{ type: "heal", baseValue: 5, duration: 3, target: "self" }],
    flavorText: "The appetite never stops. Neither does the healing.",
    narratorQuip: "Heal 2... 2... 4. Eating your way to health.",
    tier: "common",
  },
  {
    id: "gluttony_14", name: "Stored Fat", sin: "gluttony", cost: 2, cardType: "compounding",
    effects: [{ type: "shield", baseValue: 5, duration: 3, target: "self" }],
    flavorText: "Stored reserves, deployed when needed.",
    narratorQuip: "Shield 2... 2... 4. Fat reserves as armor.",
    tier: "common",
  },
  {
    id: "gluttony_15", name: "Metabolize", sin: "gluttony", cost: 3, cardType: "compounding",
    effects: [{ type: "heal", baseValue: 6, duration: 3, target: "self" }],
    flavorText: "Converting everything into energy. Even pain.",
    narratorQuip: "Heal 3... 3... 6. Metabolism as a superpower.",
    tier: "rare",
  },
  // ── CROWD CONTROL FLAT (3 cards) ──
  {
    id: "gluttony_16", name: "Nauseating Presence", sin: "gluttony", cost: 2, cardType: "flat",
    effects: [{ type: "debuff", baseValue: 3, duration: 0, target: "single_enemy" }],
    flavorText: "The smell alone is enough to weaken anyone.",
    narratorQuip: "Debuff 3. Gluttony's presence is... overwhelming.",
    tier: "rare",
  },
  {
    id: "gluttony_17", name: "Toxic Belch", sin: "gluttony", cost: 1, cardType: "flat",
    effects: [{ type: "debuff", baseValue: 2, duration: 0, target: "all_enemies" }],
    flavorText: "A belch so toxic it weakens everyone in the room.",
    narratorQuip: "AoE debuff 2 for 1 energy. Efficient and disgusting.",
    tier: "common",
  },
  {
    id: "gluttony_18", name: "Energy Siphon", sin: "gluttony", cost: 2, cardType: "flat",
    effects: [{ type: "energy_drain", baseValue: 2, duration: 0, target: "single_enemy" }],
    flavorText: "Your energy is now my energy. Thank you for the donation.",
    narratorQuip: "Energy drain 2. Gluttony consumes even corruption itself.",
    tier: "rare",
  },
  // ── CROWD CONTROL COMPOUNDING (4 cards) ──
  {
    id: "gluttony_19", name: "Festering Wound", sin: "gluttony", cost: 2, cardType: "compounding",
    effects: [{ type: "debuff", baseValue: 2, duration: 3, target: "single_enemy" }],
    flavorText: "A wound that festers and grows. Like Gluttony itself.",
    narratorQuip: "Debuff 2... 2... 4. The wound only gets worse.",
    tier: "rare",
  },
  {
    id: "gluttony_20", name: "Spreading Sickness", sin: "gluttony", cost: 3, cardType: "compounding",
    effects: [{ type: "debuff", baseValue: 2, duration: 3, target: "all_enemies" }],
    flavorText: "Sickness that spreads to everyone. No exceptions.",
    narratorQuip: "Debuff 2... 2... 4 to ALL. Pandemic-level CC.",
    tier: "epic",
  },
  {
    id: "gluttony_21", name: "Parasite", sin: "gluttony", cost: 1, cardType: "compounding",
    effects: [{ type: "debuff", baseValue: 1, duration: 3, target: "single_enemy" }],
    flavorText: "A tiny parasite that grows inside them.",
    narratorQuip: "Debuff 1... 1... 2. Small but persistent.",
    tier: "common",
  },
  {
    id: "gluttony_22", name: "Corrosive Bile", sin: "gluttony", cost: 2, cardType: "compounding",
    effects: [{ type: "energy_drain", baseValue: 1, duration: 3, target: "single_enemy" }],
    flavorText: "Bile that corrodes their very essence.",
    narratorQuip: "Energy drain 1... 1... 2. Corrosion that compounds.",
    tier: "epic",
  },
  // ── HYBRID FLAT (4 cards) ──
  {
    id: "gluttony_23", name: "Devour and Grow", sin: "gluttony", cost: 2, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 5, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "Every bite makes you stronger.",
    narratorQuip: "3 damage + 2 heal. Gluttony's favorite combo: eat and grow.",
    tier: "common",
  },
  {
    id: "gluttony_24", name: "Feast or Famine", sin: "gluttony", cost: 4, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "all_enemies" },
      { type: "heal", baseValue: 6, duration: 0, target: "self" },
    ],
    flavorText: "For Gluttony, it's always feast. For everyone else, famine.",
    narratorQuip: "AoE 4 + heal 3. Gluttony feasts on the battlefield.",
    tier: "epic",
  },
  {
    id: "gluttony_25", name: "Crushing Weight", sin: "gluttony", cost: 1, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "debuff", baseValue: 1, duration: 0, target: "single_enemy" },
    ],
    flavorText: "The weight of excess crushes everything beneath it.",
    narratorQuip: "2 damage + debuff. Gluttony's mass is a weapon.",
    tier: "common",
  },
  {
    id: "gluttony_26", name: "Vomit Spray", sin: "gluttony", cost: 0, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 1, duration: 0, target: "all_enemies" },
      { type: "damage", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "What goes in must come out. Violently.",
    narratorQuip: "Free AoE 2, 1 self-harm. Disgusting but effective.",
    tier: "common",
  },
  // ── HYBRID COMPOUNDING (4 cards) ──
  {
    id: "gluttony_27", name: "Consuming Hunger", sin: "gluttony", cost: 2, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 2, duration: 3, target: "single_enemy" },
      { type: "heal", baseValue: 4, duration: 3, target: "self" },
    ],
    flavorText: "A hunger that consumes them and nourishes you.",
    narratorQuip: "Damage 2+heal 1... same... then 4+2. Compounding consumption.",
    tier: "rare",
  },
  {
    id: "gluttony_28", name: "Infectious Gluttony", sin: "gluttony", cost: 3, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 1, duration: 3, target: "all_enemies" },
      { type: "debuff", baseValue: 1, duration: 3, target: "all_enemies" },
    ],
    flavorText: "Gluttony spreads. Everyone becomes hungry. Everyone suffers.",
    narratorQuip: "AoE damage+debuff compounding. Gluttony infects everyone.",
    tier: "epic",
  },
  {
    id: "gluttony_29", name: "Bloating Curse", sin: "gluttony", cost: 2, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 2, duration: 3, target: "single_enemy" },
      { type: "debuff", baseValue: 1, duration: 3, target: "single_enemy" },
    ],
    flavorText: "They swell with corruption. It only gets worse.",
    narratorQuip: "Damage+debuff compounding. The curse bloats over time.",
    tier: "rare",
  },
  {
    id: "gluttony_30", name: "Symbiotic Feast", sin: "gluttony", cost: 1, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 4, duration: 3, target: "single_enemy" },
      { type: "shield", baseValue: 1, duration: 3, target: "self" },
    ],
    flavorText: "A symbiotic relationship. You suffer. I thrive.",
    narratorQuip: "1+1... 1+1... 2+2. Symbiosis at its finest.",
    tier: "common",
  },
  // ── UNIQUE / CATCH-UP (6 cards) ──
  {
    id: "gluttony_31", name: "Desperate Feast", sin: "gluttony", cost: 1, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 4, duration: 0, target: "self" },
    ],
    flavorText: "When starving, everything tastes better.",
    narratorQuip: "Catch-up lifesteal. Gluttony eats harder when hungry.",
    tier: "common",
    catchup: { type: "bonus_damage", bonusValue: 2, condition: "hp_less_than_target" },
  },
  {
    id: "gluttony_32", name: "Emergency Reserves", sin: "gluttony", cost: 2, cardType: "flat",
    effects: [
      { type: "heal", baseValue: 6, duration: 0, target: "self" },
      { type: "shield", baseValue: 5, duration: 0, target: "self" },
    ],
    flavorText: "Breaking into the emergency food supply.",
    narratorQuip: "Catch-up defense. Gluttony's reserves are deep.",
    tier: "rare",
    catchup: { type: "bonus_heal", bonusValue: 2, condition: "hp_below_threshold" },
  },
  {
    id: "gluttony_33", name: "Binge", sin: "gluttony", cost: 3, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 5, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "A binge of violence and healing. In that order.",
    narratorQuip: "Catch-up damage + heal. Binge eating, weaponized.",
    tier: "rare",
    catchup: { type: "bonus_damage", bonusValue: 2, condition: "hp_less_than_any_opponent" },
  },
  {
    id: "gluttony_34", name: "Survival Instinct", sin: "gluttony", cost: 2, cardType: "flat",
    effects: [
      { type: "heal", baseValue: 6, duration: 0, target: "self" },
    ],
    flavorText: "The will to survive. The will to eat. Same thing.",
    narratorQuip: "Catch-up heal. Gluttony's survival instinct is powerful.",
    tier: "common",
    catchup: { type: "bonus_heal", bonusValue: 2, condition: "hp_lowest" },
  },
  {
    id: "gluttony_35", name: "Cannibalize", sin: "gluttony", cost: 1, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "shield", baseValue: 4, duration: 0, target: "self" },
    ],
    flavorText: "Eating the competition. Literally.",
    narratorQuip: "Damage + shield with catch-up. Gluttony's last resort.",
    tier: "common",
    catchup: { type: "bonus_damage", bonusValue: 2, condition: "hp_below_threshold" },
  },
  {
    id: "gluttony_36", name: "World Eater", sin: "gluttony", cost: 5, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 6, duration: 0, target: "all_enemies" },
      { type: "heal", baseValue: 3, duration: 0, target: "self" },
      { type: "debuff", baseValue: 2, duration: 0, target: "all_enemies" },
    ],
    flavorText: "The world eater awakens. Nothing is safe.",
    narratorQuip: "AoE 5 + heal 3 + AoE debuff 2 + catch-up. Gluttony's apocalypse.",
    tier: "epic",
    catchup: { type: "bonus_heal", bonusValue: 2, condition: "hp_lowest" },
  },
];
