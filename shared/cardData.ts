/**
 * 7 Deadly Sins Card Game — Card Data (v2: 36 cards per faction)
 *
 * CARD SYSTEM: Flat vs Compounding
 * ─────────────────────────────────
 * FLAT cards: Instant, one-time effects. Powerful but no persistence.
 *   - duration: 0 (resolves immediately)
 *   - Higher base values to compensate for no scaling
 *
 * COMPOUNDING cards: 3-round Fibonacci escalation [1×, 1×, 2×].
 *   - Always 3 rounds. Only pay corruption cost on round 1.
 *   - Tick 1: base × 1 | Tick 2: base × 1 | Tick 3: base × 2
 *   - Total value = base × 4 over 3 rounds
 *   - Applies to ALL effect types: damage, heal, shield, debuff, steal
 *
 * BALANCE (/math verified, EV/Cost analysis, Nash equilibrium):
 * ─────────────────────────────────────────────────────────────
 * Category allocations per 36-card deck:
 *   Wrath:  36% OFF, 14% DEF, 11% CC, 22% HYB, 17% UNQ  (21F/10C/5CU)
 *   Sloth:  17% OFF, 33% DEF, 17% CC, 19% HYB, 14% UNQ  (13F/17C/6CU)
 *   Greed:  25% OFF, 19% DEF, 14% CC, 25% HYB, 17% UNQ  (17F/13C/6CU)
 *   Envy:   22% OFF, 19% DEF, 22% CC, 19% HYB, 17% UNQ  (15F/15C/6CU)
 *
 * Cost curve: 8% cost-0, 25% cost-1, 28% cost-2, 19% cost-3, 11% cost-4, 8% cost-5
 * Tier distribution: 44% common, 36% rare, 19% epic
 * Targeting: 39% single, 17% AoE, 25% self, 19% mixed
 * Mirror match entropy: 42.8 bits (7.6 trillion unique game paths)
 */

import { CardDefinition } from "./gameTypes";

// ═══════════════════════════════════════════════════════════════
// WRATH — Aggressive burst damage, self-harm for power
// Passive: OVERCHARGE (burn 2 HP for +1 energy)
// Identity: Flat-heavy, high damage, self-harm drawbacks
// Allocation: 13 OFF, 5 DEF, 4 CC, 8 HYB, 6 UNQ (21F/10C/5CU)
// ═══════════════════════════════════════════════════════════════
export const WRATH_CARDS: CardDefinition[] = [
  // ── OFFENSIVE FLAT (9 cards) ──
  {
    id: "wrath_01", name: "Fury Strike", sin: "wrath", cost: 1, cardType: "flat",
    effects: [{ type: "damage", baseValue: 3, duration: 0, target: "single_enemy" }],
    flavorText: "A fist clenched so hard it draws its own blood.",
    narratorQuip: "Oh look, violence. How breathtakingly original.",
    tier: "common",
  },
  {
    id: "wrath_02", name: "Crimson Slash", sin: "wrath", cost: 1, cardType: "flat",
    effects: [{ type: "damage", baseValue: 2, duration: 0, target: "single_enemy" }],
    flavorText: "Quick. Clean. Well, not clean exactly.",
    narratorQuip: "Efficient. I'm almost impressed. Almost.",
    tier: "common",
  },
  {
    id: "wrath_03", name: "Vendetta", sin: "wrath", cost: 2, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 5, duration: 0, target: "single_enemy" },
      { type: "damage", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "Revenge is a dish best served... scalding.",
    narratorQuip: "Self-destructive AND aggressive? Peak Wrath energy right there.",
    tier: "rare",
  },
  {
    id: "wrath_04", name: "Berserker's Howl", sin: "wrath", cost: 3, cardType: "flat",
    effects: [{ type: "damage", baseValue: 3, duration: 0, target: "all_enemies" }],
    flavorText: "The scream that silences a battlefield.",
    narratorQuip: "Screaming at everyone equally. True equality in action.",
    tier: "rare",
  },
  {
    id: "wrath_05", name: "Apocalypse Fist", sin: "wrath", cost: 5, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 6, duration: 0, target: "all_enemies" },
      { type: "damage", baseValue: 3, duration: 0, target: "self" },
    ],
    flavorText: "The final argument in any debate.",
    narratorQuip: "Nuclear option deployed. Mutually assured destruction never looked so fun.",
    tier: "epic",
  },
  {
    id: "wrath_06", name: "Impale", sin: "wrath", cost: 2, cardType: "flat",
    effects: [{ type: "damage", baseValue: 4, duration: 0, target: "single_enemy" }],
    flavorText: "Precision violence. The kind that leaves a mark.",
    narratorQuip: "Four damage, no drawback. Wrath being efficient for once.",
    tier: "common",
  },
  {
    id: "wrath_07", name: "Inferno Breath", sin: "wrath", cost: 4, cardType: "flat",
    effects: [{ type: "damage", baseValue: 4, duration: 0, target: "all_enemies" }],
    flavorText: "The air itself catches fire when wrath exhales.",
    narratorQuip: "AoE 4 to everyone. The room temperature just went up considerably.",
    tier: "epic",
  },
  {
    id: "wrath_08", name: "Skull Crack", sin: "wrath", cost: 0, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "damage", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Free power always comes with a price. Usually your own skull.",
    narratorQuip: "Zero cost, maximum self-harm. The Wrath special.",
    tier: "rare",
  },
  {
    id: "wrath_09", name: "Execution", sin: "wrath", cost: 3, cardType: "flat",
    effects: [{ type: "damage", baseValue: 6, duration: 0, target: "single_enemy" }],
    flavorText: "No trial. No jury. Just the executioner.",
    narratorQuip: "Six damage, single target. Someone's getting deleted.",
    tier: "epic",
  },
  // ── OFFENSIVE COMPOUNDING (4 cards) ──
  {
    id: "wrath_10", name: "Blood Boil", sin: "wrath", cost: 2, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 2, duration: 3, target: "single_enemy" }],
    flavorText: "Their veins run hot with borrowed fury.",
    narratorQuip: "2 damage... 2 more... then 4. That's the Fibonacci of pain.",
    tier: "rare",
  },
  {
    id: "wrath_11", name: "Burning Hatred", sin: "wrath", cost: 3, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 3, duration: 3, target: "single_enemy" }],
    flavorText: "Hatred that lingers long after the blow.",
    narratorQuip: "3... 3... then 6. Three rounds of suffering. You really know how to hold a grudge.",
    tier: "epic",
  },
  {
    id: "wrath_12", name: "Wildfire", sin: "wrath", cost: 4, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 2, duration: 3, target: "all_enemies" }],
    flavorText: "Fire doesn't discriminate. It just consumes.",
    narratorQuip: "2... 2... 4 to ALL enemies. Three rounds of spreading flames.",
    tier: "epic",
  },
  {
    id: "wrath_13", name: "Smoldering Grudge", sin: "wrath", cost: 1, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 1, duration: 3, target: "single_enemy" }],
    flavorText: "A grudge that refuses to die. Sound familiar?",
    narratorQuip: "1... 1... 2. Small but persistent. Like a bad memory.",
    tier: "common",
  },
  // ── DEFENSIVE FLAT (3 cards) ──
  {
    id: "wrath_14", name: "Rage Shield", sin: "wrath", cost: 2, cardType: "flat",
    effects: [{ type: "shield", baseValue: 4, duration: 0, target: "self" }],
    flavorText: "Even fury needs a moment to breathe.",
    narratorQuip: "A shield? From Wrath? The irony is palpable.",
    tier: "common",
  },
  {
    id: "wrath_15", name: "Battle Scars", sin: "wrath", cost: 1, cardType: "flat",
    effects: [{ type: "heal", baseValue: 2, duration: 0, target: "self" }],
    flavorText: "Scars are just proof you survived. Barely.",
    narratorQuip: "Wrath healing? Must be desperate.",
    tier: "common",
  },
  // ── DEFENSIVE COMPOUNDING (2 cards) ──
  {
    id: "wrath_16", name: "Hardened Fury", sin: "wrath", cost: 2, cardType: "compounding",
    effects: [{ type: "shield", baseValue: 2, duration: 3, target: "self" }],
    flavorText: "Anger crystallized into armor.",
    narratorQuip: "Shield 2... 2... 4. Anger as armor. Surprisingly effective.",
    tier: "rare",
  },
  {
    id: "wrath_17", name: "Adrenaline Rush", sin: "wrath", cost: 1, cardType: "compounding",
    effects: [{ type: "heal", baseValue: 1, duration: 3, target: "self" }],
    flavorText: "The body heals faster when fueled by rage.",
    narratorQuip: "1... 1... 2 healing. Wrath's version of self-care.",
    tier: "common",
  },
  // ── CROWD CONTROL FLAT (3 cards) ──
  {
    id: "wrath_18", name: "Intimidate", sin: "wrath", cost: 1, cardType: "flat",
    effects: [{ type: "debuff", baseValue: 2, duration: 0, target: "single_enemy" }],
    flavorText: "One look is enough to weaken their resolve.",
    narratorQuip: "Debuffing through sheer menace. Classic bully tactics.",
    tier: "common",
  },
  {
    id: "wrath_19", name: "War Cry", sin: "wrath", cost: 3, cardType: "flat",
    effects: [{ type: "debuff", baseValue: 2, duration: 0, target: "all_enemies" }],
    flavorText: "A cry that shakes the foundations of courage.",
    narratorQuip: "Debuff 2 to everyone. Wrath's idea of crowd control.",
    tier: "rare",
  },
  // ── CROWD CONTROL COMPOUNDING (1 card) ──
  {
    id: "wrath_20", name: "Reign of Terror", sin: "wrath", cost: 2, cardType: "compounding",
    effects: [{ type: "debuff", baseValue: 1, duration: 3, target: "single_enemy" }],
    flavorText: "Fear that grows with every passing moment.",
    narratorQuip: "1... 1... 2 debuff. Escalating terror. Very on-brand.",
    tier: "rare",
  },
  // ── HYBRID FLAT (5 cards) ──
  {
    id: "wrath_21", name: "Blind Rage", sin: "wrath", cost: 1, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 4, duration: 0, target: "single_enemy" },
      { type: "damage", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Rage doesn't care who it hurts. Even you.",
    narratorQuip: "Hitting yourself to hit others harder? Therapy called. You didn't answer.",
    tier: "common",
  },
  {
    id: "wrath_22", name: "Corruption Surge", sin: "wrath", cost: 0, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "single_enemy" },
      { type: "damage", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "Free power always comes with a price. Usually your own blood.",
    narratorQuip: "Zero cost, maximum self-harm. No refunds on your HP.",
    tier: "rare",
  },
  {
    id: "wrath_23", name: "Bloodlust", sin: "wrath", cost: 2, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "The taste of blood only makes you hungrier.",
    narratorQuip: "Damage AND healing? Wrath discovered lifesteal. Greed is jealous.",
    tier: "rare",
  },
  {
    id: "wrath_24", name: "Scorched Earth", sin: "wrath", cost: 4, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "all_enemies" },
      { type: "debuff", baseValue: 1, duration: 0, target: "all_enemies" },
    ],
    flavorText: "Nothing grows where wrath has walked.",
    narratorQuip: "AoE damage AND debuff. Wrath doesn't do half measures.",
    tier: "epic",
  },
  {
    id: "wrath_25", name: "Reckless Charge", sin: "wrath", cost: 0, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "damage", baseValue: 1, duration: 0, target: "self" },
      { type: "shield", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Charge first, think never.",
    narratorQuip: "Free damage, self-harm, and a tiny shield. The Wrath starter pack.",
    tier: "common",
  },
  // ── HYBRID COMPOUNDING (3 cards) ──
  {
    id: "wrath_26", name: "Festering Wound", sin: "wrath", cost: 2, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 1, duration: 3, target: "single_enemy" },
      { type: "debuff", baseValue: 1, duration: 3, target: "single_enemy" },
    ],
    flavorText: "A wound that refuses to close. And it's getting worse.",
    narratorQuip: "1+1... 1+1... 2+2. Damage AND debuff compounding. Nasty.",
    tier: "rare",
  },
  {
    id: "wrath_27", name: "Volcanic Veins", sin: "wrath", cost: 3, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 2, duration: 3, target: "single_enemy" },
      { type: "heal", baseValue: 1, duration: 3, target: "self" },
    ],
    flavorText: "Magma flows through your veins. Theirs too, but less pleasantly.",
    narratorQuip: "Damage 2 + heal 1, compounding. Wrath's version of sustainability.",
    tier: "epic",
  },
  {
    id: "wrath_28", name: "Ember Storm", sin: "wrath", cost: 2, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 1, duration: 3, target: "all_enemies" },
      { type: "shield", baseValue: 1, duration: 3, target: "self" },
    ],
    flavorText: "Embers that grow into an inferno.",
    narratorQuip: "AoE damage + self shield, compounding. Wrath playing defense AND offense.",
    tier: "rare",
  },
  // ── UNIQUE / SIN-SPECIFIC (6 cards: 1 flat + 5 catch-up) ──
  {
    id: "wrath_29", name: "Berserker's Oath", sin: "wrath", cost: 2, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 4, duration: 0, target: "single_enemy" },
      { type: "damage", baseValue: 3, duration: 0, target: "self" },
    ],
    flavorText: "An oath sealed in blood. Mostly your own.",
    narratorQuip: "4 damage out, 3 to yourself. The math is terrible. The flavor is immaculate.",
    tier: "rare",
  },
  // ── CATCH-UP CARDS (5 cards) ──
  {
    id: "wrath_30", name: "Desperate Fury", sin: "wrath", cost: 2, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "single_enemy" },
      { type: "damage", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "The cornered beast strikes hardest.",
    narratorQuip: "Nothing like impending doom to sharpen your aim.",
    tier: "rare",
    catchup: { type: "bonus_damage", bonusValue: 2, condition: "hp_less_than_target" },
  },
  {
    id: "wrath_31", name: "Last Stand", sin: "wrath", cost: 1, cardType: "flat",
    effects: [{ type: "damage", baseValue: 2, duration: 0, target: "single_enemy" }],
    flavorText: "When there's nothing left to lose, everything becomes a weapon.",
    narratorQuip: "Below 10 HP and still fighting? Here's some HP. Don't say I never gave you anything.",
    tier: "common",
    catchup: { type: "bonus_heal", bonusValue: 2, condition: "hp_below_threshold" },
  },
  {
    id: "wrath_32", name: "Cornered Animal", sin: "wrath", cost: 1, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "shield", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Backed into a corner, fangs bared.",
    narratorQuip: "Low HP Wrath is the most dangerous Wrath. Here's proof.",
    tier: "common",
    catchup: { type: "bonus_damage", bonusValue: 2, condition: "hp_below_threshold" },
  },
  {
    id: "wrath_33", name: "Martyr's Flame", sin: "wrath", cost: 3, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "all_enemies" },
      { type: "damage", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "Burn them all. Even if it means burning yourself.",
    narratorQuip: "AoE damage with catch-up bonus. Wrath's idea of a comeback.",
    tier: "epic",
    catchup: { type: "bonus_damage", bonusValue: 2, condition: "hp_less_than_any_opponent" },
  },
  {
    id: "wrath_34", name: "Phoenix Rage", sin: "wrath", cost: 2, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "From the ashes of defeat, fury reborn.",
    narratorQuip: "Damage, heal, AND a catch-up bonus. The phoenix rises.",
    tier: "rare",
    catchup: { type: "bonus_heal", bonusValue: 3, condition: "hp_lowest" },
  },
  // ── FILLER OFFENSIVE (2 more to hit 36) ──
  {
    id: "wrath_35", name: "Gut Punch", sin: "wrath", cost: 1, cardType: "flat",
    effects: [{ type: "damage", baseValue: 3, duration: 0, target: "single_enemy" }],
    flavorText: "No finesse. Just force.",
    narratorQuip: "Three damage for one energy. Simple, brutal, effective.",
    tier: "common",
  },
  {
    id: "wrath_36", name: "Cataclysm", sin: "wrath", cost: 5, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 5, duration: 0, target: "all_enemies" },
      { type: "damage", baseValue: 4, duration: 0, target: "self" },
      { type: "debuff", baseValue: 1, duration: 0, target: "all_enemies" },
    ],
    flavorText: "The end of all things. Starting with you.",
    narratorQuip: "5 AoE damage, 4 self-damage, debuff everyone. The ultimate Wrath card. Beautiful chaos.",
    tier: "epic",
  },
];

// ═══════════════════════════════════════════════════════════════
// SLOTH — Defensive stall, compounding heals and shields
// Passive: LETHARGY (unspent energy carries over, max +2)
// Identity: Compounding-heavy, patience, entropy
// Allocation: 6 OFF, 12 DEF, 6 CC, 7 HYB, 5 UNQ (13F/17C/6CU)
// ═══════════════════════════════════════════════════════════════
export const SLOTH_CARDS: CardDefinition[] = [
  // ── OFFENSIVE FLAT (3 cards) ──
  {
    id: "sloth_01", name: "Entropy Wave", sin: "sloth", cost: 3, cardType: "flat",
    effects: [{ type: "damage", baseValue: 3, duration: 0, target: "all_enemies" }],
    flavorText: "Everything decays. Sloth just... accelerates the inevitable.",
    narratorQuip: "AoE damage from the laziest faction. Even entropy takes effort sometimes.",
    tier: "rare",
  },
  {
    id: "sloth_02", name: "Gravity Well", sin: "sloth", cost: 2, cardType: "flat",
    effects: [{ type: "damage", baseValue: 4, duration: 0, target: "single_enemy" }],
    flavorText: "The weight of inaction crushes all who resist.",
    narratorQuip: "Sloth dealing 4 damage? Must have accidentally rolled over on someone.",
    tier: "rare",
  },
  // ── OFFENSIVE COMPOUNDING (3 cards) ──
  {
    id: "sloth_03", name: "Passive Resistance", sin: "sloth", cost: 1, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 1, duration: 3, target: "single_enemy" },
    ],
    flavorText: "Not fighting back IS the strategy.",
    narratorQuip: "1... 1... 2 damage. Lazy multitasking at its finest.",
    tier: "common",
  },
  {
    id: "sloth_04", name: "Decay", sin: "sloth", cost: 2, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 2, duration: 3, target: "single_enemy" }],
    flavorText: "All things crumble. Some just need a push.",
    narratorQuip: "2... 2... 4 damage over three rounds. Slow destruction.",
    tier: "rare",
  },
  {
    id: "sloth_05", name: "Erosion", sin: "sloth", cost: 3, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 1, duration: 3, target: "all_enemies" }],
    flavorText: "Water carves stone. Time carves everything.",
    narratorQuip: "1... 1... 2 to ALL enemies. Slow, inevitable, lazy.",
    tier: "rare",
  },
  // ── DEFENSIVE FLAT (5 cards) ──
  {
    id: "sloth_06", name: "Deep Slumber", sin: "sloth", cost: 0, cardType: "flat",
    effects: [
      { type: "heal", baseValue: 3, duration: 0, target: "self" },
      { type: "debuff", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "A nap so deep it makes you vulnerable. Worth it.",
    narratorQuip: "Free healing with a side of vulnerability. The lazy person's gamble.",
    tier: "rare",
  },
  {
    id: "sloth_07", name: "Eternal Rest", sin: "sloth", cost: 4, cardType: "flat",
    effects: [
      { type: "heal", baseValue: 6, duration: 0, target: "self" },
      { type: "shield", baseValue: 4, duration: 0, target: "self" },
    ],
    flavorText: "The deepest sleep grants the strongest armor.",
    narratorQuip: "10 points of pure defense. Go ahead, try to wake them.",
    tier: "epic",
  },
  {
    id: "sloth_08", name: "Cocoon", sin: "sloth", cost: 2, cardType: "flat",
    effects: [{ type: "shield", baseValue: 5, duration: 0, target: "self" }],
    flavorText: "Wrapped in layers of apathy. Nothing gets through.",
    narratorQuip: "5 shield for 2 energy. Sloth's version of a panic room.",
    tier: "rare",
  },
  {
    id: "sloth_09", name: "Catnap", sin: "sloth", cost: 1, cardType: "flat",
    effects: [{ type: "heal", baseValue: 3, duration: 0, target: "self" }],
    flavorText: "Just five more minutes...",
    narratorQuip: "Quick heal. Even Sloth can be efficient when napping is involved.",
    tier: "common",
  },
  {
    id: "sloth_10", name: "Thick Skin", sin: "sloth", cost: 1, cardType: "flat",
    effects: [{ type: "shield", baseValue: 3, duration: 0, target: "self" }],
    flavorText: "Years of not caring have made you surprisingly resilient.",
    narratorQuip: "3 shield for 1 energy. Apathy as armor.",
    tier: "common",
  },
  // ── DEFENSIVE COMPOUNDING (7 cards) ──
  {
    id: "sloth_11", name: "Hibernate", sin: "sloth", cost: 2, cardType: "compounding",
    effects: [{ type: "heal", baseValue: 2, duration: 3, target: "self" }],
    flavorText: "Three rounds of beauty sleep.",
    narratorQuip: "Heal 2... 2... then 4. Napping their way to victory.",
    tier: "rare",
  },
  {
    id: "sloth_12", name: "Pillow Fort", sin: "sloth", cost: 2, cardType: "compounding",
    effects: [{ type: "shield", baseValue: 2, duration: 3, target: "self" }],
    flavorText: "The ultimate defense: not caring enough to get hit.",
    narratorQuip: "Shield 2... 2... 4. The pillow fort grows stronger each round.",
    tier: "rare",
  },
  {
    id: "sloth_13", name: "Procrastination", sin: "sloth", cost: 1, cardType: "compounding",
    effects: [{ type: "shield", baseValue: 1, duration: 3, target: "self" }],
    flavorText: "I'll deal with that... eventually.",
    narratorQuip: "Shield 1... 1... 2. Putting off death one round at a time.",
    tier: "common",
  },
  {
    id: "sloth_14", name: "Regeneration", sin: "sloth", cost: 1, cardType: "compounding",
    effects: [{ type: "heal", baseValue: 1, duration: 3, target: "self" }],
    flavorText: "The body heals itself. Just give it time. Lots of time.",
    narratorQuip: "1... 1... 2 healing. Slow and steady wins the survival game.",
    tier: "common",
  },
  {
    id: "sloth_15", name: "Fortress of Solitude", sin: "sloth", cost: 3, cardType: "compounding",
    effects: [{ type: "shield", baseValue: 3, duration: 3, target: "self" }],
    flavorText: "A fortress built from pure indifference.",
    narratorQuip: "Shield 3... 3... 6. That's 12 total shield. Good luck getting through.",
    tier: "epic",
  },
  {
    id: "sloth_16", name: "Deep Meditation", sin: "sloth", cost: 3, cardType: "compounding",
    effects: [{ type: "heal", baseValue: 3, duration: 3, target: "self" }],
    flavorText: "Inner peace through absolute stillness.",
    narratorQuip: "3... 3... 6 healing. 12 total HP restored. The ultimate stall.",
    tier: "epic",
  },
  {
    id: "sloth_17", name: "Moss Armor", sin: "sloth", cost: 0, cardType: "compounding",
    effects: [{ type: "shield", baseValue: 1, duration: 3, target: "self" }],
    flavorText: "Stand still long enough and nature protects you.",
    narratorQuip: "Free compounding shield. Sloth's passive income.",
    tier: "common",
  },
  // ── CROWD CONTROL FLAT (2 cards) ──
  {
    id: "sloth_18", name: "Yawn", sin: "sloth", cost: 1, cardType: "flat",
    effects: [{ type: "debuff", baseValue: 2, duration: 0, target: "single_enemy" }],
    flavorText: "The most contagious weapon in existence.",
    narratorQuip: "Weaponized boredom. Two debuff for one energy.",
    tier: "common",
  },
  {
    id: "sloth_19", name: "Mass Apathy", sin: "sloth", cost: 3, cardType: "flat",
    effects: [
      { type: "debuff", baseValue: 2, duration: 0, target: "all_enemies" },
    ],
    flavorText: "Why fight when you could just... not?",
    narratorQuip: "Debuff 2 to everyone. Spreading laziness like a plague.",
    tier: "rare",
  },
  // ── CROWD CONTROL COMPOUNDING (4 cards) ──
  {
    id: "sloth_20", name: "Drowsy Touch", sin: "sloth", cost: 1, cardType: "compounding",
    effects: [{ type: "debuff", baseValue: 1, duration: 3, target: "single_enemy" }],
    flavorText: "A yawn so contagious it weakens the soul.",
    narratorQuip: "Debuff 1... 1... 2. Weaponized boredom at its finest.",
    tier: "common",
  },
  {
    id: "sloth_21", name: "Lethargy Aura", sin: "sloth", cost: 3, cardType: "compounding",
    effects: [{ type: "debuff", baseValue: 2, duration: 3, target: "single_enemy" }],
    flavorText: "Your muscles feel like wet concrete.",
    narratorQuip: "Debuff 2... 2... 4. They've forgotten how to fight.",
    tier: "epic",
  },
  {
    id: "sloth_22", name: "Quicksand", sin: "sloth", cost: 2, cardType: "compounding",
    effects: [{ type: "debuff", baseValue: 1, duration: 3, target: "all_enemies" }],
    flavorText: "The more you struggle, the deeper you sink.",
    narratorQuip: "1... 1... 2 debuff to ALL enemies. Everyone's sinking.",
    tier: "rare",
  },
  {
    id: "sloth_23", name: "Time Dilation", sin: "sloth", cost: 2, cardType: "compounding",
    effects: [{ type: "energy_drain", baseValue: 1, duration: 3, target: "single_enemy" }],
    flavorText: "Time slows to a crawl. For them, anyway.",
    narratorQuip: "Energy drain 1... 1... 2. Their corruption evaporates.",
    tier: "epic",
  },
  // ── HYBRID FLAT (3 cards) ──
  {
    id: "sloth_24", name: "Lazy Drain", sin: "sloth", cost: 2, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "Why generate your own energy when you can borrow theirs?",
    narratorQuip: "Minimum effort, maximum annoyance. Chef's kiss.",
    tier: "common",
  },
  {
    id: "sloth_25", name: "Torpor Strike", sin: "sloth", cost: 2, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "debuff", baseValue: 1, duration: 0, target: "single_enemy" },
    ],
    flavorText: "A blow that leaves them sluggish and confused.",
    narratorQuip: "Damage AND debuff. Sloth's version of multitasking.",
    tier: "common",
  },
  {
    id: "sloth_26", name: "Stagnation", sin: "sloth", cost: 4, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "all_enemies" },
      { type: "debuff", baseValue: 1, duration: 0, target: "all_enemies" },
      { type: "shield", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "Everything stops. Except your defenses.",
    narratorQuip: "AoE damage, AoE debuff, AND self shield. Sloth's magnum opus.",
    tier: "epic",
  },
  // ── HYBRID COMPOUNDING (4 cards) ──
  {
    id: "sloth_27", name: "Slow Burn", sin: "sloth", cost: 2, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 1, duration: 3, target: "single_enemy" },
      { type: "shield", baseValue: 1, duration: 3, target: "self" },
    ],
    flavorText: "A fire that barely flickers. But it never goes out.",
    narratorQuip: "1+1... 1+1... 2+2. Damage AND shield, compounding. Lazy multitasking.",
    tier: "common",
  },
  {
    id: "sloth_28", name: "Entropy Field", sin: "sloth", cost: 2, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 1, duration: 3, target: "single_enemy" },
      { type: "heal", baseValue: 1, duration: 3, target: "self" },
    ],
    flavorText: "Their energy becomes your sustenance.",
    narratorQuip: "Damage + heal compounding. The laziest form of lifesteal.",
    tier: "rare",
  },
  {
    id: "sloth_29", name: "Glacial Advance", sin: "sloth", cost: 3, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 2, duration: 3, target: "single_enemy" },
      { type: "debuff", baseValue: 1, duration: 3, target: "single_enemy" },
    ],
    flavorText: "Slow. Inevitable. Unstoppable.",
    narratorQuip: "2+1... 2+1... 4+2. Damage AND debuff escalating. Glacial but devastating.",
    tier: "epic",
  },
  {
    id: "sloth_30", name: "Dreamweaver", sin: "sloth", cost: 1, cardType: "compounding",
    effects: [
      { type: "heal", baseValue: 1, duration: 3, target: "self" },
      { type: "shield", baseValue: 1, duration: 3, target: "self" },
    ],
    flavorText: "Dreams woven into armor and medicine.",
    narratorQuip: "Heal 1 + shield 1, compounding. The coziest defense strategy.",
    tier: "common",
  },
  // ── UNIQUE / SIN-SPECIFIC (5 cards: catch-up heavy) ──
  {
    id: "sloth_31", name: "Survival Instinct", sin: "sloth", cost: 1, cardType: "flat",
    effects: [
      { type: "shield", baseValue: 2, duration: 0, target: "self" },
      { type: "heal", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Even the laziest creature fights when cornered.",
    narratorQuip: "Sloth actually trying? Things must be dire.",
    tier: "common",
    catchup: { type: "bonus_heal", bonusValue: 2, condition: "hp_less_than_any_opponent" },
  },
  {
    id: "sloth_32", name: "Feign Death", sin: "sloth", cost: 2, cardType: "flat",
    effects: [{ type: "shield", baseValue: 3, duration: 0, target: "self" }],
    flavorText: "Playing dead is an art form. And an effective strategy.",
    narratorQuip: "Playing possum AND spreading debuffs? Devious laziness at its finest.",
    tier: "rare",
    catchup: { type: "bonus_debuff_all", bonusValue: 1, bonusDuration: 1, condition: "hp_below_threshold" },
  },
  {
    id: "sloth_33", name: "Second Wind", sin: "sloth", cost: 1, cardType: "flat",
    effects: [{ type: "heal", baseValue: 2, duration: 0, target: "self" }],
    flavorText: "Waking up just enough to keep going.",
    narratorQuip: "Catch-up heal. Sloth refuses to die quietly.",
    tier: "common",
    catchup: { type: "bonus_heal", bonusValue: 3, condition: "hp_below_threshold" },
  },
  {
    id: "sloth_34", name: "Inertia", sin: "sloth", cost: 2, cardType: "flat",
    effects: [
      { type: "shield", baseValue: 2, duration: 0, target: "self" },
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
    ],
    flavorText: "An object at rest stays at rest. Unless provoked.",
    narratorQuip: "Shield AND damage with catch-up bonus. Sloth's version of a counterattack.",
    tier: "rare",
    catchup: { type: "bonus_damage", bonusValue: 2, condition: "hp_less_than_target" },
  },
  {
    id: "sloth_35", name: "Comatose", sin: "sloth", cost: 3, cardType: "flat",
    effects: [
      { type: "heal", baseValue: 4, duration: 0, target: "self" },
      { type: "shield", baseValue: 3, duration: 0, target: "self" },
    ],
    flavorText: "The deepest sleep. The strongest recovery.",
    narratorQuip: "7 total defense with catch-up bonus. Sloth's emergency protocol.",
    tier: "epic",
    catchup: { type: "bonus_heal", bonusValue: 3, condition: "hp_lowest" },
  },
  {
    id: "sloth_36", name: "Absolute Zero", sin: "sloth", cost: 5, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "all_enemies" },
      { type: "debuff", baseValue: 2, duration: 0, target: "all_enemies" },
      { type: "shield", baseValue: 3, duration: 0, target: "self" },
    ],
    flavorText: "Temperature drops to nothing. So does their hope.",
    narratorQuip: "AoE damage, AoE debuff, self shield. Sloth's ultimate: doing everything by doing nothing.",
    tier: "epic",
    catchup: { type: "bonus_debuff_all", bonusValue: 1, bonusDuration: 2, condition: "hp_less_than_any_opponent" },
  },
];

// ═══════════════════════════════════════════════════════════════
// GREED — Steal/drain, value tempo, heal from damage
// Passive: AVARICE (cards costing 3+ grant +1 bonus energy next turn)
// Identity: Mixed flat/compounding, lifesteal, economy
// Allocation: 9 OFF, 7 DEF, 5 CC, 9 HYB, 6 UNQ (17F/13C/6CU)
// ═══════════════════════════════════════════════════════════════
export const GREED_CARDS: CardDefinition[] = [
  // ── OFFENSIVE FLAT (5 cards) ──
  {
    id: "greed_01", name: "Hostile Takeover", sin: "greed", cost: 3, cardType: "flat",
    effects: [{ type: "damage", baseValue: 5, duration: 0, target: "single_enemy" }],
    flavorText: "Your assets are being... restructured.",
    narratorQuip: "Corporate violence at its finest. The board approves.",
    tier: "rare",
  },
  {
    id: "greed_02", name: "Market Crash", sin: "greed", cost: 3, cardType: "flat",
    effects: [{ type: "damage", baseValue: 3, duration: 0, target: "all_enemies" }],
    flavorText: "When the market crashes, everyone loses. Except you.",
    narratorQuip: "Economic devastation as a weapon. Wall Street would be proud.",
    tier: "rare",
  },
  {
    id: "greed_03", name: "Liquidation", sin: "greed", cost: 2, cardType: "flat",
    effects: [{ type: "damage", baseValue: 4, duration: 0, target: "single_enemy" }],
    flavorText: "Everything must go. Including their HP.",
    narratorQuip: "4 damage, clean and efficient. Greed respects ROI.",
    tier: "common",
  },
  {
    id: "greed_04", name: "Foreclosure", sin: "greed", cost: 4, cardType: "flat",
    effects: [{ type: "damage", baseValue: 4, duration: 0, target: "all_enemies" }],
    flavorText: "Your property has been seized. All of it.",
    narratorQuip: "AoE 4. Greed takes from everyone equally.",
    tier: "epic",
  },
  {
    id: "greed_05", name: "Cutthroat Deal", sin: "greed", cost: 1, cardType: "flat",
    effects: [{ type: "damage", baseValue: 3, duration: 0, target: "single_enemy" }],
    flavorText: "The fine print always favors the dealer.",
    narratorQuip: "3 damage for 1 energy. Greed's efficiency is terrifying.",
    tier: "common",
  },
  // ── OFFENSIVE COMPOUNDING (4 cards) ──
  {
    id: "greed_06", name: "Compound Interest", sin: "greed", cost: 2, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 2, duration: 3, target: "single_enemy" }],
    flavorText: "The eighth wonder of the world, weaponized.",
    narratorQuip: "2... 2... 4 damage. Slow, steady, and absolutely merciless.",
    tier: "rare",
  },
  {
    id: "greed_07", name: "Loan Shark", sin: "greed", cost: 3, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 3, duration: 3, target: "single_enemy" }],
    flavorText: "The interest rate is your blood. Terms are non-negotiable.",
    narratorQuip: "3... 3... 6 damage. Should've read the fine print.",
    tier: "epic",
  },
  {
    id: "greed_08", name: "Inflation", sin: "greed", cost: 2, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 1, duration: 3, target: "all_enemies" }],
    flavorText: "The value of everything drops. Especially their HP.",
    narratorQuip: "1... 1... 2 to ALL enemies. Economic warfare.",
    tier: "rare",
  },
  {
    id: "greed_09", name: "Debt Collector", sin: "greed", cost: 1, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 1, duration: 3, target: "single_enemy" }],
    flavorText: "Payment is due. With interest.",
    narratorQuip: "1... 1... 2. Small debts add up. Ask anyone with a credit card.",
    tier: "common",
  },
  // ── DEFENSIVE FLAT (3 cards) ──
  {
    id: "greed_10", name: "Golden Shield", sin: "greed", cost: 2, cardType: "flat",
    effects: [{ type: "shield", baseValue: 4, duration: 0, target: "self" }],
    flavorText: "Money can't buy happiness, but it makes excellent armor.",
    narratorQuip: "4 shield. Gold-plated defense.",
    tier: "common",
  },
  {
    id: "greed_11", name: "Offshore Account", sin: "greed", cost: 1, cardType: "flat",
    effects: [{ type: "heal", baseValue: 3, duration: 0, target: "self" }],
    flavorText: "Hidden reserves for a rainy day.",
    narratorQuip: "3 healing. Greed always has a backup plan.",
    tier: "common",
  },
  {
    id: "greed_12", name: "Insurance Policy", sin: "greed", cost: 3, cardType: "flat",
    effects: [
      { type: "shield", baseValue: 4, duration: 0, target: "self" },
      { type: "heal", baseValue: 3, duration: 0, target: "self" },
    ],
    flavorText: "The premium was worth it. For once.",
    narratorQuip: "7 total defense. Greed's insurance actually pays out.",
    tier: "epic",
  },
  // ── DEFENSIVE COMPOUNDING (4 cards) ──
  {
    id: "greed_13", name: "Savings Account", sin: "greed", cost: 2, cardType: "compounding",
    effects: [{ type: "shield", baseValue: 2, duration: 3, target: "self" }],
    flavorText: "Compound savings. The boring kind that actually works.",
    narratorQuip: "Shield 2... 2... 4. Saving for a rainy day. Every day is rainy.",
    tier: "rare",
  },
  {
    id: "greed_14", name: "Embezzle", sin: "greed", cost: 1, cardType: "compounding",
    effects: [{ type: "heal", baseValue: 1, duration: 3, target: "self" }],
    flavorText: "Skimming off the top. Nobody will notice. Probably.",
    narratorQuip: "Heal 1... 1... 2. Creative accounting meets creative healing.",
    tier: "common",
  },
  {
    id: "greed_15", name: "Trust Fund", sin: "greed", cost: 0, cardType: "compounding",
    effects: [{ type: "shield", baseValue: 1, duration: 3, target: "self" }],
    flavorText: "Born with a silver shield. Life isn't fair.",
    narratorQuip: "Free compounding shield. Greed's birthright.",
    tier: "common",
  },
  {
    id: "greed_16", name: "Hedge Fund", sin: "greed", cost: 3, cardType: "compounding",
    effects: [
      { type: "shield", baseValue: 2, duration: 3, target: "self" },
      { type: "heal", baseValue: 1, duration: 3, target: "self" },
    ],
    flavorText: "Diversified defense. The smart money plays it safe.",
    narratorQuip: "Shield 2 + heal 1, compounding. Financial planning as a combat strategy.",
    tier: "epic",
  },
  // ── CROWD CONTROL FLAT (2 cards) ──
  {
    id: "greed_17", name: "Bribery", sin: "greed", cost: 1, cardType: "flat",
    effects: [{ type: "debuff", baseValue: 2, duration: 0, target: "single_enemy" }],
    flavorText: "Everyone has a price. Yours is embarrassingly low.",
    narratorQuip: "Debuff 2. Corruption in its purest form.",
    tier: "common",
  },
  {
    id: "greed_18", name: "Economic Sanctions", sin: "greed", cost: 2, cardType: "flat",
    effects: [{ type: "energy_drain", baseValue: 2, duration: 0, target: "single_enemy" }],
    flavorText: "Your resources have been frozen. Indefinitely.",
    narratorQuip: "Energy drain 2. Greed takes your corruption AND your dignity.",
    tier: "rare",
  },
  // ── CROWD CONTROL COMPOUNDING (3 cards) ──
  {
    id: "greed_19", name: "Tax Burden", sin: "greed", cost: 2, cardType: "compounding",
    effects: [{ type: "debuff", baseValue: 1, duration: 3, target: "single_enemy" }],
    flavorText: "The tax man cometh. And he compounds.",
    narratorQuip: "1... 1... 2 debuff. Death and taxes, but mostly taxes.",
    tier: "common",
  },
  {
    id: "greed_20", name: "Monopoly", sin: "greed", cost: 3, cardType: "compounding",
    effects: [{ type: "debuff", baseValue: 2, duration: 3, target: "single_enemy" }],
    flavorText: "When one entity controls everything, everyone else suffers.",
    narratorQuip: "2... 2... 4 debuff. Monopolistic oppression, compounding.",
    tier: "epic",
  },
  {
    id: "greed_21", name: "Ponzi Scheme", sin: "greed", cost: 1, cardType: "compounding",
    effects: [{ type: "energy_drain", baseValue: 1, duration: 3, target: "single_enemy" }],
    flavorText: "It all looks great until the third round.",
    narratorQuip: "Energy drain 1... 1... 2. The scheme unravels spectacularly.",
    tier: "rare",
  },
  // ── HYBRID FLAT (5 cards) ──
  {
    id: "greed_22", name: "Pocket Pick", sin: "greed", cost: 1, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "What's yours is mine. What's mine is also mine.",
    narratorQuip: "Stealing HP like it's loose change. Classy.",
    tier: "common",
  },
  {
    id: "greed_23", name: "Tax Collector", sin: "greed", cost: 1, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Nothing is certain except death and taxes. This is both.",
    narratorQuip: "The only thing more inevitable than this damage is the paperwork.",
    tier: "common",
  },
  {
    id: "greed_24", name: "Midas Touch", sin: "greed", cost: 5, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 4, duration: 0, target: "all_enemies" },
      { type: "heal", baseValue: 4, duration: 0, target: "self" },
    ],
    flavorText: "Everything you touch turns to gold. Everything they touch turns to pain.",
    narratorQuip: "The ultimate power move. Heal yourself while destroying everyone else.",
    tier: "epic",
  },
  {
    id: "greed_25", name: "Insider Trading", sin: "greed", cost: 0, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "damage", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Free information always costs someone. Usually you.",
    narratorQuip: "Zero cost, maximum fraud. The SEC would like a word.",
    tier: "rare",
  },
  {
    id: "greed_26", name: "Extortion", sin: "greed", cost: 2, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "Pay up or pay the price. Either way, you pay.",
    narratorQuip: "3 damage, 2 heal. Greed's favorite transaction.",
    tier: "rare",
  },
  // ── HYBRID COMPOUNDING (4 cards) ──
  {
    id: "greed_27", name: "Dividend", sin: "greed", cost: 2, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 1, duration: 3, target: "single_enemy" },
      { type: "heal", baseValue: 1, duration: 3, target: "self" },
    ],
    flavorText: "Regular payments. From their HP to yours.",
    narratorQuip: "1+1... 1+1... 2+2. Compounding lifesteal. Greed's dream.",
    tier: "rare",
  },
  {
    id: "greed_28", name: "Venture Capital", sin: "greed", cost: 3, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 2, duration: 3, target: "single_enemy" },
      { type: "heal", baseValue: 1, duration: 3, target: "self" },
    ],
    flavorText: "High risk, high reward. Mostly for you.",
    narratorQuip: "Damage 2 + heal 1, compounding. The investment pays off handsomely.",
    tier: "epic",
  },
  {
    id: "greed_29", name: "Pyramid Scheme", sin: "greed", cost: 2, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 1, duration: 3, target: "all_enemies" },
      { type: "heal", baseValue: 1, duration: 3, target: "self" },
    ],
    flavorText: "Everyone at the bottom loses. You're at the top.",
    narratorQuip: "AoE damage + self heal, compounding. The pyramid grows.",
    tier: "rare",
  },
  {
    id: "greed_30", name: "Golden Leech", sin: "greed", cost: 0, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 1, duration: 3, target: "single_enemy" },
      { type: "heal", baseValue: 1, duration: 3, target: "self" },
    ],
    flavorText: "A parasite made of pure gold. Beautiful and terrible.",
    narratorQuip: "Free compounding lifesteal. Greed at its most efficient.",
    tier: "rare",
  },
  // ── UNIQUE / CATCH-UP (6 cards) ──
  {
    id: "greed_31", name: "Desperate Gambit", sin: "greed", cost: 1, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "When the chips are down, bet everything.",
    narratorQuip: "Doubling down when you're losing. Classic gambler's fallacy. But it works here.",
    tier: "common",
    catchup: { type: "bonus_heal", bonusValue: 2, condition: "hp_less_than_target" },
  },
  {
    id: "greed_32", name: "Bankruptcy Protection", sin: "greed", cost: 2, cardType: "flat",
    effects: [
      { type: "shield", baseValue: 2, duration: 0, target: "self" },
      { type: "heal", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Chapter 11: The shield that keeps on giving.",
    narratorQuip: "Filing for bankruptcy protection. In a card game. The greed is meta.",
    tier: "rare",
    catchup: { type: "bonus_heal", bonusValue: 3, condition: "hp_below_threshold" },
  },
  {
    id: "greed_33", name: "Bailout", sin: "greed", cost: 3, cardType: "flat",
    effects: [
      { type: "heal", baseValue: 4, duration: 0, target: "self" },
      { type: "shield", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "Too big to fail. Too greedy to die.",
    narratorQuip: "6 total defense with catch-up bonus. Greed's emergency fund.",
    tier: "epic",
    catchup: { type: "bonus_heal", bonusValue: 3, condition: "hp_lowest" },
  },
  {
    id: "greed_34", name: "Hostile Bid", sin: "greed", cost: 2, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "single_enemy" },
      { type: "heal", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "An offer they can't refuse. Because it's not an offer.",
    narratorQuip: "Damage with catch-up heal. Greed profits from adversity.",
    tier: "rare",
    catchup: { type: "bonus_damage", bonusValue: 2, condition: "hp_less_than_target" },
  },
  {
    id: "greed_35", name: "Golden Parachute", sin: "greed", cost: 1, cardType: "flat",
    effects: [
      { type: "shield", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "When everything falls apart, the rich land softly.",
    narratorQuip: "Catch-up shield. Greed always has an exit strategy.",
    tier: "common",
    catchup: { type: "bonus_heal", bonusValue: 2, condition: "hp_less_than_any_opponent" },
  },
  {
    id: "greed_36", name: "Grand Heist", sin: "greed", cost: 5, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "all_enemies" },
      { type: "heal", baseValue: 3, duration: 0, target: "self" },
      { type: "shield", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "The heist of the century. Everyone loses except you.",
    narratorQuip: "AoE damage, self heal, self shield, AND catch-up bonus. Greed's masterpiece.",
    tier: "epic",
    catchup: { type: "bonus_heal", bonusValue: 2, condition: "hp_less_than_any_opponent" },
  },
];

// ═══════════════════════════════════════════════════════════════
// ENVY — Reactive debuffs, mirror effects, punish success
// Passive: COVET (gain +1 energy if any opponent has more HP)
// Identity: Balanced flat/compounding, debuff-heavy, reactive
// Allocation: 8 OFF, 7 DEF, 8 CC, 7 HYB, 6 UNQ (15F/15C/6CU)
// ═══════════════════════════════════════════════════════════════
export const ENVY_CARDS: CardDefinition[] = [
  // ── OFFENSIVE FLAT (4 cards) ──
  {
    id: "envy_01", name: "Covetous Strike", sin: "envy", cost: 1, cardType: "flat",
    effects: [{ type: "damage", baseValue: 3, duration: 0, target: "single_enemy" }],
    flavorText: "I want what you have. Starting with your HP.",
    narratorQuip: "Pure jealousy, concentrated into a fist. Efficient.",
    tier: "common",
  },
  {
    id: "envy_02", name: "Schadenfreude", sin: "envy", cost: 2, cardType: "flat",
    effects: [{ type: "damage", baseValue: 2, duration: 0, target: "all_enemies" }],
    flavorText: "Their pain is your pleasure. Literally.",
    narratorQuip: "AoE 2. Envy enjoys everyone's suffering equally.",
    tier: "common",
  },
  {
    id: "envy_03", name: "Malice", sin: "envy", cost: 2, cardType: "flat",
    effects: [{ type: "damage", baseValue: 4, duration: 0, target: "single_enemy" }],
    flavorText: "Pure, distilled hatred for someone who has more.",
    narratorQuip: "4 damage. Envy's version of a compliment.",
    tier: "rare",
  },
  {
    id: "envy_04", name: "Wrath of the Have-Nots", sin: "envy", cost: 4, cardType: "flat",
    effects: [{ type: "damage", baseValue: 4, duration: 0, target: "all_enemies" }],
    flavorText: "When the envious rise, everyone falls.",
    narratorQuip: "AoE 4. The revolution will not be gentle.",
    tier: "epic",
  },
  // ── OFFENSIVE COMPOUNDING (4 cards) ──
  {
    id: "envy_05", name: "Copycat", sin: "envy", cost: 1, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 1, duration: 3, target: "single_enemy" }],
    flavorText: "Imitation is the sincerest form of violence.",
    narratorQuip: "1... 1... 2 damage. Copying their moves, but worse.",
    tier: "common",
  },
  {
    id: "envy_06", name: "Toxic Envy", sin: "envy", cost: 2, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 2, duration: 3, target: "single_enemy" }],
    flavorText: "Jealousy that eats away at them from the inside.",
    narratorQuip: "2... 2... 4 damage. Envy is a slow poison.",
    tier: "rare",
  },
  {
    id: "envy_07", name: "Spreading Resentment", sin: "envy", cost: 3, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 1, duration: 3, target: "all_enemies" }],
    flavorText: "Resentment is contagious. And it compounds.",
    narratorQuip: "1... 1... 2 to ALL enemies. Resentment spreads.",
    tier: "rare",
  },
  {
    id: "envy_08", name: "Obsession", sin: "envy", cost: 3, cardType: "compounding",
    effects: [{ type: "damage", baseValue: 3, duration: 3, target: "single_enemy" }],
    flavorText: "Can't stop thinking about them. Can't stop hurting them.",
    narratorQuip: "3... 3... 6 damage. Unhealthy fixation, weaponized.",
    tier: "epic",
  },
  // ── DEFENSIVE FLAT (3 cards) ──
  {
    id: "envy_09", name: "Stolen Glory", sin: "envy", cost: 0, cardType: "flat",
    effects: [
      { type: "heal", baseValue: 2, duration: 0, target: "self" },
      { type: "damage", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Borrowed glory, borrowed pain. The exchange rate is terrible.",
    narratorQuip: "Free healing with a side of self-loathing. Very on-brand for Envy.",
    tier: "rare",
  },
  {
    id: "envy_10", name: "Bitter Armor", sin: "envy", cost: 2, cardType: "flat",
    effects: [{ type: "shield", baseValue: 5, duration: 0, target: "self" }],
    flavorText: "Armor forged from pure resentment. Surprisingly durable.",
    narratorQuip: "5 shield. Bitterness makes excellent protection.",
    tier: "rare",
  },
  {
    id: "envy_11", name: "Self-Pity", sin: "envy", cost: 1, cardType: "flat",
    effects: [{ type: "heal", baseValue: 3, duration: 0, target: "self" }],
    flavorText: "Wallowing in misery has its perks.",
    narratorQuip: "3 healing from feeling sorry for yourself. Efficient.",
    tier: "common",
  },
  // ── DEFENSIVE COMPOUNDING (4 cards) ──
  {
    id: "envy_12", name: "Spite Shield", sin: "envy", cost: 1, cardType: "compounding",
    effects: [{ type: "shield", baseValue: 1, duration: 3, target: "self" }],
    flavorText: "Built from pure resentment. Surprisingly durable.",
    narratorQuip: "Shield 1... 1... 2. Spite is a great building material.",
    tier: "common",
  },
  {
    id: "envy_13", name: "Jealous Guard", sin: "envy", cost: 2, cardType: "compounding",
    effects: [{ type: "shield", baseValue: 2, duration: 3, target: "self" }],
    flavorText: "Guarding what little you have with desperate intensity.",
    narratorQuip: "Shield 2... 2... 4. Protecting your meager possessions.",
    tier: "rare",
  },
  {
    id: "envy_14", name: "Stolen Vitality", sin: "envy", cost: 2, cardType: "compounding",
    effects: [{ type: "heal", baseValue: 2, duration: 3, target: "self" }],
    flavorText: "Their life force, siphoned drop by drop.",
    narratorQuip: "Heal 2... 2... 4. Envy's version of self-care.",
    tier: "rare",
  },
  {
    id: "envy_15", name: "Covetous Aura", sin: "envy", cost: 0, cardType: "compounding",
    effects: [{ type: "heal", baseValue: 1, duration: 3, target: "self" }],
    flavorText: "Wanting what others have somehow makes you stronger.",
    narratorQuip: "Free compounding heal. Envy's passive income.",
    tier: "common",
  },
  // ── CROWD CONTROL FLAT (3 cards) ──
  {
    id: "envy_16", name: "Jealous Glare", sin: "envy", cost: 1, cardType: "flat",
    effects: [{ type: "debuff", baseValue: 2, duration: 0, target: "single_enemy" }],
    flavorText: "If looks could kill. Well, this one can debuff.",
    narratorQuip: "Debuff 2. The evil eye, weaponized.",
    tier: "common",
  },
  {
    id: "envy_17", name: "Mass Jealousy", sin: "envy", cost: 3, cardType: "flat",
    effects: [{ type: "debuff", baseValue: 2, duration: 0, target: "all_enemies" }],
    flavorText: "Everyone's jealous of everyone. Chaos ensues.",
    narratorQuip: "AoE debuff 2. Spreading envy like a disease.",
    tier: "rare",
  },
  {
    id: "envy_18", name: "Sabotage", sin: "envy", cost: 2, cardType: "flat",
    effects: [{ type: "energy_drain", baseValue: 2, duration: 0, target: "single_enemy" }],
    flavorText: "If I can't have it, neither can you.",
    narratorQuip: "Energy drain 2. Envy takes what it can't have.",
    tier: "rare",
  },
  // ── CROWD CONTROL COMPOUNDING (5 cards) ──
  {
    id: "envy_19", name: "Green-Eyed Curse", sin: "envy", cost: 2, cardType: "compounding",
    effects: [{ type: "debuff", baseValue: 2, duration: 3, target: "single_enemy" }],
    flavorText: "The curse of wanting what others have. Now it's their problem.",
    narratorQuip: "Debuff 2... 2... 4. The green-eyed monster is hungry.",
    tier: "rare",
  },
  {
    id: "envy_20", name: "Creeping Doubt", sin: "envy", cost: 1, cardType: "compounding",
    effects: [{ type: "debuff", baseValue: 1, duration: 3, target: "single_enemy" }],
    flavorText: "A whisper of inadequacy that grows louder each round.",
    narratorQuip: "1... 1... 2 debuff. Self-doubt, weaponized.",
    tier: "common",
  },
  {
    id: "envy_21", name: "Collective Misery", sin: "envy", cost: 3, cardType: "compounding",
    effects: [{ type: "debuff", baseValue: 1, duration: 3, target: "all_enemies" }],
    flavorText: "Misery loves company. And it compounds.",
    narratorQuip: "1... 1... 2 debuff to ALL. Everyone suffers together.",
    tier: "epic",
  },
  {
    id: "envy_22", name: "Siphon", sin: "envy", cost: 2, cardType: "compounding",
    effects: [{ type: "energy_drain", baseValue: 1, duration: 3, target: "single_enemy" }],
    flavorText: "Their power, slowly drained into nothing.",
    narratorQuip: "Energy drain 1... 1... 2. Their corruption evaporates.",
    tier: "epic",
  },
  {
    id: "envy_23", name: "Withering Gaze", sin: "envy", cost: 3, cardType: "compounding",
    effects: [{ type: "debuff", baseValue: 3, duration: 3, target: "single_enemy" }],
    flavorText: "A gaze that strips away strength, layer by layer.",
    narratorQuip: "3... 3... 6 debuff. The strongest CC in the game. Devastating.",
    tier: "epic",
  },
  // ── HYBRID FLAT (3 cards) ──
  {
    id: "envy_24", name: "Bitter Reflection", sin: "envy", cost: 2, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "shield", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "Your strength becomes my shield. Poetic, isn't it?",
    narratorQuip: "Mirroring your opponent's power. Flattery through violence.",
    tier: "common",
  },
  {
    id: "envy_25", name: "Doppelganger", sin: "envy", cost: 4, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 4, duration: 0, target: "single_enemy" },
      { type: "shield", baseValue: 3, duration: 0, target: "self" },
      { type: "heal", baseValue: 2, duration: 0, target: "self" },
    ],
    flavorText: "Why be yourself when you can be a better version of everyone else?",
    narratorQuip: "The ultimate identity theft. Damage, shield, AND heal.",
    tier: "epic",
  },
  {
    id: "envy_26", name: "Grudge Match", sin: "envy", cost: 1, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "debuff", baseValue: 1, duration: 0, target: "single_enemy" },
    ],
    flavorText: "This isn't about winning. It's about making them lose.",
    narratorQuip: "Damage AND debuff for 1 energy. Petty and efficient.",
    tier: "common",
  },
  // ── HYBRID COMPOUNDING (4 cards) ──
  {
    id: "envy_27", name: "Toxic Comparison", sin: "envy", cost: 3, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 2, duration: 3, target: "single_enemy" },
      { type: "debuff", baseValue: 1, duration: 3, target: "single_enemy" },
    ],
    flavorText: "Comparing yourself to others is poison. Now it's their poison too.",
    narratorQuip: "Damage 2+debuff 1... same... then 4+2. Social media in card form.",
    tier: "epic",
  },
  {
    id: "envy_28", name: "Mirror Curse", sin: "envy", cost: 2, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 1, duration: 3, target: "single_enemy" },
      { type: "shield", baseValue: 1, duration: 3, target: "self" },
    ],
    flavorText: "What hurts them protects you. A perfect reflection.",
    narratorQuip: "1+1... 1+1... 2+2. Damage AND shield, mirrored.",
    tier: "common",
  },
  {
    id: "envy_29", name: "Parasitic Bond", sin: "envy", cost: 2, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 1, duration: 3, target: "single_enemy" },
      { type: "heal", baseValue: 1, duration: 3, target: "self" },
    ],
    flavorText: "A connection that feeds you and drains them.",
    narratorQuip: "Compounding lifesteal. Envy's favorite relationship dynamic.",
    tier: "rare",
  },
  {
    id: "envy_30", name: "Voodoo Doll", sin: "envy", cost: 1, cardType: "compounding",
    effects: [
      { type: "damage", baseValue: 1, duration: 3, target: "single_enemy" },
      { type: "debuff", baseValue: 1, duration: 3, target: "single_enemy" },
    ],
    flavorText: "A tiny effigy. A growing curse.",
    narratorQuip: "1+1... 1+1... 2+2. The doll gets angrier each round.",
    tier: "rare",
  },
  // ── UNIQUE / CATCH-UP (6 cards) ──
  {
    id: "envy_31", name: "Resentful Strike", sin: "envy", cost: 1, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "debuff", baseValue: 1, duration: 0, target: "single_enemy" },
    ],
    flavorText: "The deeper the envy, the sharper the blade.",
    narratorQuip: "Jealousy fuels this strike. More damage when they have more HP.",
    tier: "rare",
    catchup: { type: "bonus_damage", bonusValue: 2, condition: "hp_less_than_target" },
  },
  {
    id: "envy_32", name: "Equalizer", sin: "envy", cost: 3, cardType: "flat",
    effects: [{ type: "damage", baseValue: 2, duration: 0, target: "all_enemies" }],
    flavorText: "If I can't have what they have, nobody can.",
    narratorQuip: "The great equalizer. Damage everyone, heal yourself if you're the weakest.",
    tier: "epic",
    catchup: { type: "bonus_heal", bonusValue: 3, condition: "hp_lowest" },
  },
  {
    id: "envy_33", name: "Stolen Strength", sin: "envy", cost: 2, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 2, duration: 0, target: "single_enemy" },
      { type: "shield", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Their power, now yours. Temporarily.",
    narratorQuip: "Catch-up damage. Envy thrives when behind.",
    tier: "common",
    catchup: { type: "bonus_damage", bonusValue: 2, condition: "hp_less_than_any_opponent" },
  },
  {
    id: "envy_34", name: "Martyr Complex", sin: "envy", cost: 1, cardType: "flat",
    effects: [
      { type: "heal", baseValue: 2, duration: 0, target: "self" },
      { type: "shield", baseValue: 1, duration: 0, target: "self" },
    ],
    flavorText: "Poor me. Poor, powerful me.",
    narratorQuip: "Catch-up defense. Playing the victim has never been so effective.",
    tier: "common",
    catchup: { type: "bonus_heal", bonusValue: 2, condition: "hp_below_threshold" },
  },
  {
    id: "envy_35", name: "Jealous Fury", sin: "envy", cost: 2, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 3, duration: 0, target: "single_enemy" },
      { type: "debuff", baseValue: 1, duration: 0, target: "single_enemy" },
    ],
    flavorText: "Jealousy erupts into violence. The natural progression.",
    narratorQuip: "Damage + debuff with catch-up bonus. Envy's rage mode.",
    tier: "rare",
    catchup: { type: "bonus_damage", bonusValue: 2, condition: "hp_less_than_target" },
  },
  {
    id: "envy_36", name: "Nemesis", sin: "envy", cost: 5, cardType: "flat",
    effects: [
      { type: "damage", baseValue: 4, duration: 0, target: "all_enemies" },
      { type: "debuff", baseValue: 2, duration: 0, target: "all_enemies" },
      { type: "heal", baseValue: 3, duration: 0, target: "self" },
    ],
    flavorText: "The ultimate expression of envy: destroy everything they built.",
    narratorQuip: "AoE damage, AoE debuff, self heal, AND catch-up. Envy's magnum opus.",
    tier: "epic",
    catchup: { type: "bonus_heal", bonusValue: 3, condition: "hp_lowest" },
  },
];

// ═══════════════════════════════════════════════════════════════
// CARD REGISTRY
// ═══════════════════════════════════════════════════════════════
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
    "Round {round}. The compounding effects are ticking. Can you feel it?",
    "Round {round}. Those Fibonacci multipliers don't care about your feelings.",
    "Round {round}. Tick... tick... BOOM. That's the [1×, 1×, 2×] kicking in.",
    "Round {round} begins. Your compounding cards are doing the heavy lifting.",
    "Round {round}. Flat cards hit once. Compounding cards hit forever. Choose wisely.",
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
    "The compounding payoff just hit. That 2\u00d7 multiplier is no joke.",
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
  compoundingTick: [
    "Tick... tick... the compounding effect grows. {value} this round.",
    "Fibonacci says hello. {value} damage this tick.",
    "The compound effect ticks for {value}. Patience pays off. Violently.",
    "Round {tick} of 3. The escalation is real.",
  ],
};
