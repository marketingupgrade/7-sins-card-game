/**
 * Matchup Matrix Page — 7x7 Faction Win Rate Heatmap
 *
 * Visualizes pairwise faction matchup dynamics in a 4-player FFA context.
 * Data derived from Monte Carlo simulation (v5.12 balance: 333 HP, x1.75 defense, Final Reckoning, 59 rebalanced cards, 7 retuned passives).
 *
 * Features:
 * - Interactive 7x7 heatmap grid with color-coded cells
 * - Hover tooltips with detailed matchup analysis
 * - Faction identity badges with archetype icons
 * - Analysis sections explaining key dynamics
 * - Mobile responsive with horizontal scroll
 * - Dark gothic cathedral branding
 */

import { useState, useMemo, memo, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { SinType, PASSIVE_INFO } from "@shared/gameTypes";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import EmberField from "@/components/EmberField";
import PageTransition from "@/components/PageTransition";
import ScrollReveal from "@/components/ScrollReveal";
import { usePageMeta } from "@/hooks/usePageMeta";

/* ─── Faction Config ────────────────────────────────────────── */
const FACTIONS: SinType[] = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];

const FACTION_COLORS: Record<SinType, string> = {
  wrath: "#ef4444",
  sloth: "#a855f7",
  greed: "#eab308",
  envy: "#10b981",
  pride: "#f0f0f0",
  lust: "#ec4899",
  gluttony: "#b45309",
};

const FACTION_LABELS: Record<SinType, string> = {
  wrath: "Wrath",
  sloth: "Sloth",
  greed: "Greed",
  envy: "Envy",
  pride: "Pride",
  lust: "Lust",
  gluttony: "Gluttony",
};

/**
 * Pairwise matchup data: MATCHUP_DATA[attacker][defender] = win rate %
 *
 * In a 4-player FFA, "matchup" measures how often faction A finishes
 * ahead of faction B when both are in the same game. 50% = perfectly even.
 *
 * Data from v5.12 Monte Carlo simulation (2M games, 333 HP, x1.75 defense, Final Reckoning).
   * v5.12 changes: 59 cards rebalanced, 7 passives retuned. Lust TEMPTATION nerfed 25% to 1%, Envy JEALOUSY buffed 10.6% to 47.6%.* These values reflect the compound-ticking dynamics, passive interactions,
 * the simultaneous-resolution turn structure, and the Final Reckoning at round 20.
 *
 * Methodology note: Since this is a 4-player game (not 1v1), pairwise
 * win rates are measured as "probability of finishing higher than the
 * other faction" across all games where both factions appear.
 */
const MATCHUP_DATA: Record<SinType, Record<SinType, number>> = {
  wrath: {
    wrath: 50.0,
    sloth: 43.1,
    greed: 43.9,
    envy: 50.5,
    pride: 51.7,
    lust: 39.5,
    gluttony: 49.3,
  },
  sloth: {
    wrath: 56.9,
    sloth: 50.0,
    greed: 49.6,
    envy: 48.2,
    pride: 52.2,
    lust: 43.3,
    gluttony: 51.0,
  },
  greed: {
    wrath: 56.1,
    sloth: 50.4,
    greed: 50.0,
    envy: 55.7,
    pride: 53.8,
    lust: 43.9,
    gluttony: 52.9,
  },
  envy: {
    wrath: 49.5,
    sloth: 51.8,
    greed: 44.3,
    envy: 50.0,
    pride: 50.9,
    lust: 40.5,
    gluttony: 48.8,
  },
  pride: {
    wrath: 48.3,
    sloth: 47.8,
    greed: 46.2,
    envy: 49.1,
    pride: 50.0,
    lust: 41.4,
    gluttony: 49.4,
  },
  lust: {
    wrath: 60.5,
    sloth: 56.7,
    greed: 56.1,
    envy: 59.5,
    pride: 58.6,
    lust: 50.0,
    gluttony: 58.1,
  },
  gluttony: {
    wrath: 50.7,
    sloth: 49.0,
    greed: 47.1,
    envy: 51.2,
    pride: 50.6,
    lust: 41.9,
    gluttony: 50.0,
  },
};

/**
 * Detailed matchup drill-down data — explains WHY each matchup favors one faction.
 * Includes passive interaction, archetype strengths, and counter-strategies.
 */
interface MatchupDetail {
  summary: string;
  passiveInteraction: string;
  attackerStrengths: string[];
  defenderStrengths: string[];
  keyCards: string;
  counterStrategy: string;
}

const MATCHUP_DETAILS: Record<string, MatchupDetail> = {
  "wrath-sloth": {
    summary: "Sloth's shields absorb Wrath's burst while ENDURANCE AOE (energy x1.029) adds chip damage. v5.12 nerfed Sloth's shield cap to 23 and AOE to x1.029.",
    passiveInteraction: "VENGEANCE reflect is wasted against ENDURANCE shields. Sloth's AOE passive (energy x1.029 per turn) adds chip damage, reduced from x2.0 in v5.12.",
    attackerStrengths: ["High burst damage in early rounds", "VENGEANCE punishes attackers", "Aggressive compound patterns escalate fast"],
    defenderStrengths: ["ENDURANCE generates shields AND deals AOE chip damage", "Slowburn pattern scales into late game", "Shield cap 23 limits burst absorption"],
    keyCards: "Wrath's Inferno Wave (AoE) can overwhelm shields. Sloth's ENDURANCE AOE now deals 2-7 damage per turn (v5.12 reduced shield/AOE multiplier from 0.150 to 0.103).",
    counterStrategy: "As Wrath: focus single-target burst to kill Sloth before AOE damage accumulates. As Sloth: conserve energy to maximize both shield generation and AOE output.",
  },
  "wrath-envy": {
    summary: "Wrath's high burst overwhelms Envy before affliction stacking escalates.",
    passiveInteraction: "VENGEANCE reflect punishes Envy's damage-to-amplify loop — Envy takes reflected damage while trying to deepen afflictions.",
    attackerStrengths: ["Fast burst kills before afflictions compound", "VENGEANCE reflects Envy's own damage", "AoE cards spread pressure"],
    defenderStrengths: ["JEALOUSY deepens afflictions over time", "Affliction amplification scales exponentially", "Duo targeting spreads debuffs"],
    keyCards: "Wrath's Wrathful Cry (AoE burst) can eliminate Envy before afflictions stack. Envy's Jealous Gaze needs 3+ rounds to outscale.",
    counterStrategy: "As Wrath: rush Envy down in rounds 1-5. As Envy: survive early burst with heal cards, then out-scale in rounds 10+.",
  },
  "wrath-lust": {
    summary: "Lust's lifesteal directly counters Wrath's aggression — every hit heals Lust.",
    passiveInteraction: "Despite TEMPTATION being nerfed to 1% lifesteal, Lust's raw card damage and heal_steal effects still dominate Wrath's glass cannon approach. Lust wins 60.5% head-to-head.",
    attackerStrengths: ["Highest raw damage output", "VENGEANCE reflect adds chip damage", "Aggressive patterns close games fast"],
    defenderStrengths: ["TEMPTATION heals from damage ticks", "Lifesteal negates burst damage", "Sustain outlasts aggression"],
    keyCards: "Lust's Seductive Drain turns Wrath's Inferno Wave into a massive heal. Wrath needs shield-piercing or heal-block effects to counter.",
    counterStrategy: "As Wrath: include heal_block cards to shut down TEMPTATION. As Lust: maximize damage-over-time to trigger more lifesteal.",
  },
  "sloth-pride": {
    summary: "Pride's HUBRIS burst can overwhelm shields, but Sloth's AOE passive and consistency keep the pressure on.",
    passiveInteraction: "HUBRIS multiplier (x1.590) on expensive cards can punch through ENDURANCE shields, but Sloth's AOE passive (energy x1.029) deals chip damage every turn.",
    attackerStrengths: ["ENDURANCE generates shields AND deals AOE damage", "Slowburn compounds over time", "AOE passive creates a damage clock Pride must race against"],
    defenderStrengths: ["HUBRIS amplifies expensive card effects", "Single massive burst rounds", "High-tier cards have outsized impact"],
    keyCards: "Pride's Crown of Thorns with HUBRIS (x1.590) can deal 50+ damage in one round. Sloth's ENDURANCE AOE deals 2-7 damage per turn, creating a race condition.",
    counterStrategy: "As Sloth: maximize energy for shields and chip AOE. As Pride: burst early with HUBRIS (x1.590) before Sloth's cumulative damage adds up.",
  },
  "greed-gluttony": {
    summary: "Greed's resource theft disrupts Gluttony's burn chains, creating a resource war.",
    passiveInteraction: "TAX shields from damage ticks provide passive defense, while Greed's energy steal disrupts DEVOURER's energy generation loop.",
    attackerStrengths: ["TAX generates shields from damage", "Energy steal disrupts opponents", "Resource denial slows enemy plans"],
    defenderStrengths: ["DEVOURER gains energy from card destruction", "Deck burn removes key cards", "Self-sustaining energy loop"],
    keyCards: "Greed's Golden Siphon steals the energy Gluttony needs for burn chains. Gluttony's Ravenous Maw can destroy Greed's high-value cards.",
    counterStrategy: "As Greed: steal energy early to prevent burn chains. As Gluttony: prioritize deck burn over direct damage.",
  },
  "lust-sloth": {
    summary: "Lust's 1% lifesteal vs Sloth's shields + AOE chip. Despite the massive TEMPTATION nerf (25% to 1%), Lust still wins 56.7% through raw card damage.",
    passiveInteraction: "TEMPTATION at 1% lifesteal barely heals, but Lust's 20 heal_steal and 15 heal_gain card effects provide sustain that outpaces Sloth's reduced ENDURANCE (shield cap 23, AOE x1.029).",
    attackerStrengths: ["TEMPTATION heals while dealing damage", "Lifesteal bypasses shield regeneration", "Sustain advantage if AOE damage can be out-healed"],
    defenderStrengths: ["ENDURANCE shields absorb damage AND deals AOE", "AOE passive creates pressure Lust must out-heal", "Shield stacking + AOE is a dual threat"],
    keyCards: "Lust's Charming Whisper deals damage AND heals. Sloth's ENDURANCE AOE now only deals 2-7 per turn (v5.12 nerf), making Lust's sustain more effective.",
    counterStrategy: "As Lust: maximize lifesteal to out-heal AOE damage. As Sloth: maximize energy for both shield generation and AOE output.",
  },
  "envy-lust": {
    summary: "Envy's affliction amplification disrupts Lust's sustain loop.",
    passiveInteraction: "JEALOUSY at 47.6% (up from 10.6%) deepens afflictions massively. TEMPTATION at 1% lifesteal can barely counter the amplified damage spiral.",
    attackerStrengths: ["JEALOUSY amplifies afflictions exponentially", "Affliction stacking bypasses healing", "Duo targeting spreads debuffs"],
    defenderStrengths: ["TEMPTATION provides consistent healing", "Lifesteal from damage ticks", "Sustain in long games"],
    keyCards: "Envy's Jealous Gaze + 47.6% JEALOUSY create a damage spiral. Lust still wins 59.5% through raw card power despite the amplification.",
    counterStrategy: "As Envy: stack afflictions early, amplify in mid-game. As Lust: include affliction_cleanse or heal_block to disrupt the loop.",
  },
  "gluttony-wrath": {
    summary: "Gluttony's deck destruction removes Wrath's high-damage cards from circulation.",
    passiveInteraction: "DEVOURER energy gain from card destruction sustains Gluttony's pressure, while removing Wrath's best burst cards.",
    attackerStrengths: ["Deck burn removes key damage cards", "DEVOURER generates energy from destruction", "Sustained pressure through card denial"],
    defenderStrengths: ["High burst damage if cards survive", "VENGEANCE reflects damage", "Aggressive early game"],
    keyCards: "Gluttony's Consume targets Wrath's highest-cost cards first, removing burst potential. Wrath needs to play aggressively before cards are burned.",
    counterStrategy: "As Gluttony: burn Wrath's deck early to remove burst cards. As Wrath: play high-damage cards immediately, don't hold them.",
  },
  "gluttony-sloth": {
    summary: "Gluttony's deck burn disrupts Sloth's slowburn, but Sloth's AOE passive provides a backup damage source.",
    passiveInteraction: "DEVOURER energy sustains burn pressure while removing compound cards. However, Sloth's AOE passive (energy x2) provides damage independent of cards in hand.",
    attackerStrengths: ["Deck burn removes compound cards", "DEVOURER self-sustains energy", "Disrupts slowburn scaling"],
    defenderStrengths: ["ENDURANCE shields buy time", "AOE passive deals damage even when deck is thinned", "Dual threat: shields + AOE from passive alone"],
    keyCards: "Gluttony's Ravenous Maw destroys Sloth's key slowburn cards, but Sloth's ENDURANCE AOE (energy x2) deals damage regardless of hand contents.",
    counterStrategy: "As Gluttony: target Sloth's compound cards for burn AND steal energy to weaken AOE. As Sloth: play compound cards early, rely on AOE passive as backup.",
  },
  "gluttony-envy": {
    summary: "The strongest matchup — Gluttony's deck destruction removes cards Envy needs for affliction stacking.",
    passiveInteraction: "DEVOURER energy gain outpaces JEALOUSY's gradual amplification. Card destruction removes the affliction cards Envy depends on.",
    attackerStrengths: ["Deck burn removes affliction cards", "DEVOURER generates massive energy", "Card denial prevents stacking"],
    defenderStrengths: ["JEALOUSY amplifies afflictions", "Duo targeting spreads debuffs", "Exponential scaling if cards survive"],
    keyCards: "Gluttony's Consume removes Envy's affliction_amplify cards, preventing the exponential scaling that makes Envy dangerous.",
    counterStrategy: "As Gluttony: prioritize burning Envy's amplify cards. As Envy: front-load afflictions before deck burn takes effect.",
  },
  "pride-envy": {
    summary: "Pride's expensive cards trigger HUBRIS reliably, overwhelming Envy's gradual amplification.",
    passiveInteraction: "HUBRIS x1.590 multiplier on expensive cards delivers burst damage faster than JEALOUSY (47.6%) can stack afflictions.",
    attackerStrengths: ["HUBRIS x1.590 amplifies expensive cards", "Single-round burst damage", "High-tier cards have outsized impact"],
    defenderStrengths: ["JEALOUSY deepens afflictions", "Affliction stacking scales over time", "Duo targeting spreads pressure"],
    keyCards: "Pride's Crown of Thorns with HUBRIS (x1.590) deals 50+ burst damage before Envy's 47.6% JEALOUSY can compound past round 5.",
    counterStrategy: "As Pride: play expensive cards early for HUBRIS burst. As Envy: survive burst rounds with heal cards, then out-scale.",
  },
  "lust-pride": {
    summary: "Lust's sustained lifesteal outlasts Pride's burst windows.",
    passiveInteraction: "Despite TEMPTATION being nerfed to 1%, Lust's raw card healing (20 heal_steal + 15 heal_gain) outlasts Pride's conditional HUBRIS (x1.590) triggers. Lust wins 58.6%.",
    attackerStrengths: ["TEMPTATION provides consistent healing", "Lifesteal from every damage tick", "Sustained advantage between bursts"],
    defenderStrengths: ["HUBRIS burst can one-shot through healing", "Expensive cards deal massive damage", "High single-round impact"],
    keyCards: "Lust's sustained healing between Pride's HUBRIS rounds creates a net HP advantage. Pride needs consecutive burst rounds to close.",
    counterStrategy: "As Lust: maximize damage ticks for healing between bursts. As Pride: chain expensive cards in consecutive rounds.",
  },
  "wrath-greed": {
    summary: "Wrath's raw burst slightly edges Greed's passive shields in a close matchup.",
    passiveInteraction: "VENGEANCE reflects damage back while TAX converts incoming damage ticks into shields — both passives reward taking hits, creating a damage-vs-defense race.",
    attackerStrengths: ["Highest raw damage output in the game", "VENGEANCE reflect adds chip damage on top of burst", "AoE cards bypass single-target shield generation"],
    defenderStrengths: ["TAX generates shields from every damage tick", "Energy steal disrupts Wrath's burst timing", "Resource denial slows aggressive openers"],
    keyCards: "Wrath's Inferno Wave (AoE) generates fewer TAX shield ticks than single-target burst. Greed's Golden Siphon can steal the energy Wrath needs for big plays.",
    counterStrategy: "As Wrath: use AoE to minimize TAX shield generation per hit. As Greed: steal energy early to delay Wrath's burst window.",
  },
  "wrath-pride": {
    summary: "Wrath's consistent aggression outpaces Pride's conditional HUBRIS triggers.",
    passiveInteraction: "VENGEANCE reflects damage every round, while HUBRIS only amplifies when the most expensive card is played — Wrath's consistency beats Pride's conditionality.",
    attackerStrengths: ["Consistent damage every round", "VENGEANCE reflect punishes Pride's attacks", "Burst doesn't depend on card cost conditions"],
    defenderStrengths: ["HUBRIS x1.590 multiplier creates massive burst rounds", "High-cost cards have outsized single-round impact", "Can one-shot through moderate HP pools"],
    keyCards: "Wrath's Wrathful Cry deals reliable AoE damage every round. Pride's Crown of Thorns needs HUBRIS to trigger for maximum impact, which isn't guaranteed.",
    counterStrategy: "As Wrath: maintain pressure every round to prevent Pride from setting up HUBRIS combos. As Pride: save expensive cards for back-to-back HUBRIS rounds.",
  },
  "sloth-greed": {
    summary: "Sloth's shields + AOE passive outlast Greed's resource denial in a war of attrition.",
    passiveInteraction: "ENDURANCE generates shields AND deals AOE damage (energy x2), while TAX generates shields from damage ticks. Sloth's dual output outpaces Greed's single-axis defense.",
    attackerStrengths: ["ENDURANCE shields scale with energy", "AOE passive (energy x2) adds unavoidable damage", "Dual threat: defense + offense from one passive"],
    defenderStrengths: ["TAX shields from damage provide passive defense", "Energy steal can disrupt ENDURANCE scaling and AOE output", "Resource denial weakens both Sloth's shields and AOE"],
    keyCards: "Sloth's Torpor Shield stacks compound shields while ENDURANCE AOE chips away at Greed's HP. Greed's energy steal is critical: reducing Sloth's energy weakens both shields AND AOE.",
    counterStrategy: "As Sloth: hold cards and energy to maximize both shield generation and AOE. As Greed: aggressively steal energy to cripple Sloth's dual passive output.",
  },
  "sloth-envy": {
    summary: "Envy's affliction amplification pierces Sloth's shields, but Sloth's AOE passive punishes back.",
    passiveInteraction: "JEALOUSY afflictions bypass ENDURANCE shields, but Sloth's AOE passive (energy x2) deals unavoidable damage to Envy every turn. A race between affliction scaling and AOE accumulation.",
    attackerStrengths: ["ENDURANCE generates shields", "AOE passive (energy x2) deals unavoidable damage", "Dual threat forces Envy to race against the AOE clock"],
    defenderStrengths: ["JEALOUSY afflictions bypass shield absorption", "Affliction amplification scales exponentially", "Duo targeting spreads debuffs past shields"],
    keyCards: "Envy's Jealous Gaze applies afflictions that tick through shields, but Sloth's ENDURANCE AOE (8-14 per turn) creates a damage race Envy must win before being ground down.",
    counterStrategy: "As Sloth: include affliction_cleanse cards and rely on AOE to pressure Envy. As Envy: stack afflictions fast to outpace Sloth's AOE accumulation.",
  },
  "greed-envy": {
    summary: "Greed's resource denial disrupts Envy's affliction engine before it scales.",
    passiveInteraction: "TAX shields absorb Envy's damage ticks, while energy steal removes the resources Envy needs for affliction_amplify cards — Greed chokes the engine.",
    attackerStrengths: ["TAX shields absorb affliction damage ticks", "Energy steal disrupts affliction combos", "Resource denial prevents exponential scaling"],
    defenderStrengths: ["JEALOUSY deepens afflictions on each damage tick", "Affliction amplification creates exponential damage", "Duo targeting spreads debuffs efficiently"],
    keyCards: "Greed's Golden Siphon steals the energy Envy needs for affliction_amplify plays. Envy's Jealous Gaze needs sustained energy to keep the amplification loop running.",
    counterStrategy: "As Greed: prioritize energy steal to starve Envy's amplification engine. As Envy: front-load afflictions before Greed can establish resource control.",
  },
  "greed-lust": {
    summary: "Lust's lifesteal sustain outlasts Greed's resource control in longer games.",
    passiveInteraction: "TEMPTATION heals from damage ticks while TAX generates shields — both are defensive, but Lust's healing is more efficient than Greed's shield generation.",
    attackerStrengths: ["TAX generates shields from damage", "Energy steal disrupts Lust's card plays", "Resource denial can slow lifesteal scaling"],
    defenderStrengths: ["TEMPTATION heals from every damage tick", "Lifesteal creates net HP advantage over time", "Sustain outpaces shield generation in long games"],
    keyCards: "Lust's Seductive Drain heals more HP than TAX generates shields per damage tick. Greed's energy steal can delay but not prevent Lust's sustain engine.",
    counterStrategy: "As Greed: apply maximum pressure early before Lust's sustain takes over. As Lust: play defensively early, then out-sustain in the mid-to-late game.",
  },
  "greed-pride": {
    summary: "A razor-thin matchup where Pride's HUBRIS burst barely edges Greed's resource control.",
    passiveInteraction: "HUBRIS x1.590 amplifies expensive cards while TAX generates shields from damage — Pride's burst can overwhelm TAX shields in single rounds, but Greed's energy steal delays HUBRIS triggers.",
    attackerStrengths: ["TAX shields provide passive defense", "Energy steal delays HUBRIS-eligible plays", "Resource denial disrupts expensive card timing"],
    defenderStrengths: ["HUBRIS x1.590 multiplier on expensive cards", "Single burst rounds can break through TAX shields", "High-cost cards have outsized impact"],
    keyCards: "Pride's Crown of Thorns with HUBRIS can deal 40+ damage, overwhelming TAX shields in one round. Greed's Golden Siphon can steal the energy needed for expensive plays.",
    counterStrategy: "As Greed: steal energy aggressively to prevent Pride from playing expensive cards. As Pride: hold expensive cards for a decisive HUBRIS burst round.",
  },
  "lust-gluttony": {
    summary: "The closest matchup in the game — Gluttony's deck burn barely edges Lust's sustain.",
    passiveInteraction: "DEVOURER gains energy from destroying cards while TEMPTATION heals from damage ticks — Gluttony removes the cards Lust needs for sustained healing.",
    attackerStrengths: ["TEMPTATION heals from every damage tick", "Lifesteal creates sustained HP advantage", "Consistent healing every round"],
    defenderStrengths: ["DEVOURER gains energy from card destruction", "Deck burn removes Lust's healing cards", "Card denial weakens sustain over time"],
    keyCards: "Gluttony's Ravenous Maw destroys Lust's key lifesteal cards before they can be played. Lust's Charming Whisper needs to be played early before it's burned.",
    counterStrategy: "As Lust: play healing cards immediately, don't hold them. As Gluttony: target Lust's highest-value lifesteal cards for burn.",
  },
  "gluttony-pride": {
    summary: "Gluttony's deck destruction removes Pride's expensive cards, crippling HUBRIS.",
    passiveInteraction: "DEVOURER gains energy from destroying cards while HUBRIS needs expensive cards to trigger — burning Pride's high-cost cards eliminates the HUBRIS multiplier.",
    attackerStrengths: ["Deck burn removes expensive HUBRIS-eligible cards", "DEVOURER generates energy from destruction", "Card denial prevents burst setup"],
    defenderStrengths: ["HUBRIS amplifies expensive card effects", "Single burst rounds can deal massive damage", "High-tier cards have outsized impact if they survive"],
    keyCards: "Gluttony's Consume targets Pride's highest-cost cards, removing HUBRIS triggers entirely. Pride's Crown of Thorns is the #1 burn target.",
    counterStrategy: "As Gluttony: burn Pride's expensive cards first to eliminate HUBRIS. As Pride: play expensive cards immediately before they're destroyed.",
  },
};

/**
 * Matchup flavor text — short analysis for notable matchups.
 * Explains the strategic dynamics behind the numbers.
 */
const MATCHUP_ANALYSIS: Record<string, string> = {
  "wrath-envy": "Wrath's high burst overwhelms Envy before affliction stacking can escalate. VENGEANCE reflect punishes Envy's damage-to-amplify loop.",
  "wrath-lust": "Lust's TEMPTATION lifesteal directly counters Wrath's aggression — every hit heals Lust while VENGEANCE only reflects a portion.",
  "wrath-sloth": "Sloth's ENDURANCE shields absorb Wrath's burst while the AOE passive (energy x1.029) adds chip damage. Sloth wins 56.9% head-to-head.",
  "sloth-pride": "Pride's HUBRIS (x1.590) burst can overwhelm Sloth's shields, but Sloth's ENDURANCE AOE passive (energy x1.029) creates a chip damage clock.",
  "greed-gluttony": "Greed's resource theft disrupts Gluttony's discard_burn chains, but Gluttony's DEVOURER energy gain can outpace the theft.",
  "lust-wrath": "Despite TEMPTATION being nerfed to 1%, Lust's raw card healing dominates Wrath's glass cannon approach. Lust wins 60.5%.",
  "envy-gluttony": "Gluttony's discard_burn removes cards Envy needs for affliction stacking. DEVOURER energy gain outpaces JEALOUSY scaling.",
  "pride-envy": "Pride's expensive cards trigger HUBRIS (x1.590) reliably, overwhelming Envy's 47.6% JEALOUSY amplification.",
  "gluttony-wrath": "Gluttony's deck destruction removes Wrath's high-damage cards from circulation. DEVOURER energy sustains the burn chain.",
  "lust-sloth": "Despite TEMPTATION being nerfed to 1%, Lust's card-based healing outpaces Sloth's reduced ENDURANCE (shield cap 23, AOE x1.029). Lust wins 56.7%.",
  "envy-lust": "Envy's 47.6% JEALOUSY disrupts Lust's sustain, but Lust's raw card healing still wins 59.5% despite TEMPTATION being nerfed to 1%.",
  "gluttony-sloth": "Gluttony's deck burn disrupts Sloth's slowburn. Sloth's reduced AOE (x1.029) provides less card-independent damage, making this matchup closer (51.0% vs 49.0%).",
  "wrath-greed": "Wrath's AoE burst generates fewer TAX shield ticks than single-target attacks. VENGEANCE reflect adds chip damage that Greed's shields can't fully absorb.",
  "wrath-pride": "Wrath's consistent round-over-round damage outpaces Pride's conditional HUBRIS triggers. VENGEANCE reflect punishes Pride's own attacks.",
  "sloth-greed": "Sloth's ENDURANCE shields + AOE vs TAX shields. Greed slightly edges Sloth 50.4% through energy steal that weakens both shields AND AOE.",
  "sloth-envy": "Envy's 47.6% JEALOUSY afflictions bypass shields. Envy edges 51.8% with the buffed amplification vs Sloth's reduced AOE (x1.029).",
  "greed-envy": "Greed's energy steal starves Envy's affliction_amplify engine. TAX shields absorb the damage ticks that JEALOUSY needs to deepen.",
  "greed-lust": "Despite TEMPTATION being nerfed to 1%, Lust's raw card healing outpaces TAX shields. Lust wins 56.1%.",
  "greed-pride": "Greed's energy steal and TAX shields edge Pride 53.8% by delaying HUBRIS (x1.590) triggers.",
  "lust-gluttony": "Lust dominates 58.1% through raw card healing. Gluttony's DEVOURER burns healing cards but can't keep up with Lust's sustain.",
  "gluttony-pride": "Gluttony's deck burn removes Pride's expensive cards, but the matchup is near-even at 50.6%. HUBRIS (x1.590) punishes if cards survive.",
  "lust-pride": "Despite TEMPTATION being nerfed to 1%, Lust's card healing outlasts Pride's conditional HUBRIS (x1.590) bursts. Lust wins 58.6%.",
};

/* ─── Color Interpolation ───────────────────────────────────── */
function getHeatColor(value: number): string {
  // 50 = neutral, <50 = disadvantage (red), >50 = advantage (green)
  const deviation = value - 50;
  if (Math.abs(deviation) < 0.5) return "rgba(255, 255, 255, 0.06)";
  if (deviation > 0) {
    const intensity = Math.min(deviation / 4, 1);
    return `rgba(34, 197, 94, ${0.08 + intensity * 0.25})`;
  } else {
    const intensity = Math.min(Math.abs(deviation) / 4, 1);
    return `rgba(239, 68, 68, ${0.08 + intensity * 0.25})`;
  }
}

function getTextColor(value: number): string {
  const deviation = value - 50;
  if (Math.abs(deviation) < 0.5) return "rgba(255, 255, 255, 0.4)";
  if (deviation > 0) return "rgba(134, 239, 172, 0.9)";
  return "rgba(252, 165, 165, 0.9)";
}

/* ─── Heatmap Cell ──────────────────────────────────────────── */
const HeatmapCell = memo(function HeatmapCell({
  attacker,
  defender,
  value,
  isHovered,
  onHover,
  onClick,
}: {
  attacker: SinType;
  defender: SinType;
  value: number;
  isHovered: boolean;
  onHover: (key: string | null) => void;
  onClick: (key: string) => void;
}) {
  const isDiagonal = attacker === defender;
  const key = `${attacker}-${defender}`;
  const hasDetail = !isDiagonal && (MATCHUP_DETAILS[key] || MATCHUP_DETAILS[`${defender}-${attacker}`]);

  return (
    <td
      className={`relative text-center transition-all duration-150 ${hasDetail ? "cursor-pointer" : ""}`}
      style={{
        background: isDiagonal ? "rgba(255, 255, 255, 0.02)" : getHeatColor(value),
        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
        borderRight: "1px solid rgba(255, 255, 255, 0.04)",
        padding: "0",
      }}
      onMouseEnter={() => !isDiagonal && onHover(key)}
      onMouseLeave={() => onHover(null)}
      onClick={() => !isDiagonal && onClick(key)}
    >
      <div
        className={`w-full h-full flex items-center justify-center py-3 px-2 sm:py-4 sm:px-3 transition-all duration-200 ease-out ${
          isHovered ? "scale-[1.12] z-10 ring-1 ring-white/20 rounded-sm shadow-lg" : ""
        }`}
      >
        {isDiagonal ? (
          <span className="text-white/15 text-xs">—</span>
        ) : (
          <span
            className="text-xs sm:text-sm font-mono font-semibold tabular-nums"
            style={{ color: getTextColor(value) }}
          >
            {value.toFixed(1)}%
          </span>
        )}
      </div>
    </td>
  );
});

/* ─── Matchup Drill-Down Modal ─────────────────────────────── */
function MatchupDrillDown({
  attacker,
  defender,
  onClose,
}: {
  attacker: SinType;
  defender: SinType;
  onClose: () => void;
}) {
  const rate = MATCHUP_DATA[attacker][defender];
  const reverseRate = MATCHUP_DATA[defender][attacker];
  const key = `${attacker}-${defender}`;
  const reverseKey = `${defender}-${attacker}`;
  const detail = MATCHUP_DETAILS[key] || MATCHUP_DETAILS[reverseKey];
  const isReversed = !MATCHUP_DETAILS[key] && !!MATCHUP_DETAILS[reverseKey];
  const analysis = MATCHUP_ANALYSIS[key] || MATCHUP_ANALYSIS[reverseKey];

  // If detail is reversed, swap attacker/defender strengths
  const atkStrengths = detail ? (isReversed ? detail.defenderStrengths : detail.attackerStrengths) : [];
  const defStrengths = detail ? (isReversed ? detail.attackerStrengths : detail.defenderStrengths) : [];

  const winner = rate > 50 ? attacker : rate < 50 ? defender : null;
  const winnerColor = winner ? FACTION_COLORS[winner] : "rgba(255,255,255,0.4)";

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl"
        style={{
          background: "linear-gradient(135deg, rgba(20, 16, 12, 0.98), rgba(12, 10, 8, 0.98))",
          border: "1px solid rgba(245, 158, 11, 0.15)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(245, 158, 11, 0.05)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center gap-2">
              <img src={SIN_ARCHETYPE_ICONS[attacker]} alt="Sin faction icon" className="w-8 h-8" />
              <div>
                <span className="text-sm font-bold uppercase tracking-wider" style={{ color: FACTION_COLORS[attacker], fontFamily: "var(--font-heading)" }}>
                  {FACTION_LABELS[attacker]}
                </span>
                <p className="text-[9px] text-white/25">{PASSIVE_INFO[attacker].name}</p>
              </div>
            </div>
            <div className="flex flex-col items-center mx-2">
              <span className="text-lg font-mono font-bold" style={{ color: getTextColor(rate) }}>
                {rate.toFixed(1)}%
              </span>
              <span className="text-[8px] text-white/20">vs</span>
              <span className="text-sm font-mono" style={{ color: getTextColor(reverseRate) }}>
                {reverseRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-sm font-bold uppercase tracking-wider" style={{ color: FACTION_COLORS[defender], fontFamily: "var(--font-heading)" }}>
                  {FACTION_LABELS[defender]}
                </span>
                <p className="text-[9px] text-white/25">{PASSIVE_INFO[defender].name}</p>
              </div>
              <img src={SIN_ARCHETYPE_ICONS[defender]} alt="Sin faction icon" className="w-8 h-8" />
            </div>
            <button
              onClick={onClose}
              className="ml-auto text-white/20 hover:text-white/50 transition-colors text-lg leading-none"
            >
              \u00d7
            </button>
          </div>

          {/* Winner badge */}
          {winner && (
            <div className="flex items-center justify-center gap-2 mt-3 mb-1">
              <div className="h-px flex-1" style={{ background: `${winnerColor}20` }} />
              <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: winnerColor, fontFamily: "var(--font-heading)" }}>
                {FACTION_LABELS[winner]} Favored
              </span>
              <div className="h-px flex-1" style={{ background: `${winnerColor}20` }} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Summary */}
          {detail && (
            <p className="text-xs text-white/50 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              {detail.summary}
            </p>
          )}

          {/* Passive Interaction */}
          {detail && (
            <div className="rounded-lg p-3" style={{ background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.1)" }}>
              <h4 className="text-[10px] uppercase tracking-wider text-amber-200/60 mb-1.5 font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                Passive Interaction
              </h4>
              <p className="text-[11px] text-white/45 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                {detail.passiveInteraction}
              </p>
            </div>
          )}

          {/* Strengths comparison */}
          {detail && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h4 className="text-[10px] uppercase tracking-wider mb-2 font-bold" style={{ color: FACTION_COLORS[attacker], fontFamily: "var(--font-heading)" }}>
                  {FACTION_LABELS[attacker]} Strengths
                </h4>
                <ul className="space-y-1">
                  {atkStrengths.map((s, i) => (
                    <li key={i} className="text-[10px] text-white/35 leading-relaxed flex gap-1.5">
                      <span style={{ color: FACTION_COLORS[attacker] }}>\u25B8</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-wider mb-2 font-bold" style={{ color: FACTION_COLORS[defender], fontFamily: "var(--font-heading)" }}>
                  {FACTION_LABELS[defender]} Strengths
                </h4>
                <ul className="space-y-1">
                  {defStrengths.map((s, i) => (
                    <li key={i} className="text-[10px] text-white/35 leading-relaxed flex gap-1.5">
                      <span style={{ color: FACTION_COLORS[defender] }}>\u25B8</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Key Cards */}
          {detail && (
            <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <h4 className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5 font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                Key Card Interactions
              </h4>
              <p className="text-[10px] text-white/35 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                {detail.keyCards}
              </p>
            </div>
          )}

          {/* Counter Strategy */}
          {detail && (
            <div className="rounded-lg p-3" style={{ background: "rgba(34, 197, 94, 0.03)", border: "1px solid rgba(34, 197, 94, 0.08)" }}>
              <h4 className="text-[10px] uppercase tracking-wider text-emerald-300/50 mb-1.5 font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                Counter Strategies
              </h4>
              <p className="text-[10px] text-white/35 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                {detail.counterStrategy}
              </p>
            </div>
          )}

          {/* Fallback if no detail data */}
          {!detail && analysis && (
            <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <p className="text-xs text-white/45 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                {analysis}
              </p>
            </div>
          )}

          {!detail && !analysis && (
            <div className="text-center py-4">
              <p className="text-xs text-white/25" style={{ fontFamily: "var(--font-body)" }}>
                This is a relatively even matchup with no dominant strategic pattern. Both factions perform similarly against each other.
              </p>
            </div>
          )}

          {/* Passive abilities reference */}
          <div className="grid grid-cols-2 gap-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            {[attacker, defender].map((f) => (
              <div key={f} className="text-[9px] text-white/20">
                <span className="font-bold uppercase" style={{ color: `${FACTION_COLORS[f]}80` }}>{PASSIVE_INFO[f].name}</span>
                <span className="ml-1">{PASSIVE_INFO[f].description.split(".")[0]}.</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

/* ─── Key Dynamics Card ─────────────────────────────────────── */
function DynamicCard({
  title,
  factions,
  description,
}: {
  title: string;
  factions: [SinType, SinType];
  description: string;
}) {
  const rate1 = MATCHUP_DATA[factions[0]][factions[1]];
  const rate2 = MATCHUP_DATA[factions[1]][factions[0]];

  return (
    <div
      className="rounded-lg p-4 transition-all duration-200 hover:bg-white/[0.03]"
      style={{
        background: "linear-gradient(135deg, rgba(15, 12, 10, 0.5), rgba(20, 15, 12, 0.3))",
        border: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <img src={SIN_ARCHETYPE_ICONS[factions[0]]} alt={factions[0]} className="w-5 h-5" />
        <span className="text-white/30 text-xs">vs</span>
        <img src={SIN_ARCHETYPE_ICONS[factions[1]]} alt={factions[1]} className="w-5 h-5" />
        <span
          className="text-xs font-semibold text-amber-200/70 ml-auto"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {rate1.toFixed(1)}% / {rate2.toFixed(1)}%
        </span>
      </div>
      <h4
        className="text-sm font-semibold text-white/80 mb-1"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {title}
      </h4>
      <p className="text-xs text-white/40 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
        {description}
      </p>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function MatchupMatrix() {
  usePageMeta({
    title: "Matchup Matrix — Faction vs Faction",
    description: "Interactive matchup matrix showing win rates for every faction combination. Identify your strongest and weakest matchups with heatmap visualization.",
    canonicalPath: "/matchups",
  });

  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [drilldownCell, setDrilldownCell] = useState<string | null>(null);

  // Compute strongest/weakest matchups for each faction
  const factionStats = useMemo(() => {
    return FACTIONS.map((faction) => {
      const matchups = FACTIONS.filter((f) => f !== faction).map((opp) => ({
        opponent: opp,
        rate: MATCHUP_DATA[faction][opp],
      }));
      const best = matchups.reduce((a, b) => (a.rate > b.rate ? a : b));
      const worst = matchups.reduce((a, b) => (a.rate < b.rate ? a : b));
      const avg = matchups.reduce((sum, m) => sum + m.rate, 0) / matchups.length;
      return { faction, best, worst, avg };
    });
  }, []);

  const handleHover = useCallback((key: string | null) => {
    setHoveredCell(key);
  }, []);

  const handleCellClick = useCallback((key: string) => {
    setDrilldownCell(key);
  }, []);

  // Get tooltip info for hovered cell
  const tooltipInfo = useMemo(() => {
    if (!hoveredCell) return null;
    const [attacker, defender] = hoveredCell.split("-") as [SinType, SinType];
    const rate = MATCHUP_DATA[attacker][defender];
    const reverseRate = MATCHUP_DATA[defender][attacker];
    const analysis =
      MATCHUP_ANALYSIS[hoveredCell] ||
      MATCHUP_ANALYSIS[`${defender}-${attacker}`] ||
      null;
    return { attacker, defender, rate, reverseRate, analysis };
  }, [hoveredCell]);

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <EmberField count={15} />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Hero */}
      <header className="relative z-10 pt-16 pb-10 sm:pt-20 sm:pb-14 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/30" />
              <span
                className="text-[10px] tracking-[0.4em] text-amber-200/40 uppercase"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Faction Dynamics
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/30" />
            </div>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide mb-3"
              style={{ fontFamily: "var(--font-heading)", color: "rgba(255, 255, 255, 0.9)" }}
            >
              Matchup Matrix
            </h1>
            <p
              className="text-sm sm:text-base text-white/40 max-w-xl mx-auto leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Pairwise faction win rates from 2M simulated games (v5.12). Each cell shows how often the
              row faction finishes ahead of the column faction in 4-player free-for-all.
            </p>
          </motion.div>
        </div>
      </header>

      {/* Heatmap Grid */}
      <section className="relative z-10 px-4 pb-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Scrollable container for mobile */}
            <div className="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
              <div className="min-w-[600px]">
                <table
                  className="w-full border-collapse"
                  style={{
                    background: "rgba(10, 10, 15, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  {/* Column headers */}
                  <thead>
                    <tr>
                      <th
                        className="p-2 sm:p-3 text-[9px] sm:text-[10px] text-white/20 uppercase tracking-wider text-right"
                        style={{ fontFamily: "var(--font-heading)", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}
                      >
                        <span className="hidden sm:inline">Row vs Col</span>
                        <span className="sm:hidden">vs</span>
                      </th>
                      {FACTIONS.map((faction) => (
                        <th
                          key={faction}
                          className="p-1.5 sm:p-2 text-center"
                          style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <img
                              src={SIN_ARCHETYPE_ICONS[faction]}
                              alt={faction}
                              className="w-5 h-5 sm:w-6 sm:h-6"
                            />
                            <span
                              className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
                              style={{ color: FACTION_COLORS[faction], fontFamily: "var(--font-heading)" }}
                            >
                              {FACTION_LABELS[faction].slice(0, 3)}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Data rows */}
                  <tbody>
                    {FACTIONS.map((attacker) => (
                      <tr key={attacker}>
                        {/* Row header */}
                        <td className="p-1.5 sm:p-2 text-right" style={{ borderRight: "1px solid rgba(255, 255, 255, 0.06)" }}>
                          <div className="flex items-center justify-end gap-1.5">
                            <span
                              className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
                              style={{ color: FACTION_COLORS[attacker], fontFamily: "var(--font-heading)" }}
                            >
                              {FACTION_LABELS[attacker].slice(0, 3)}
                            </span>
                            <img
                              src={SIN_ARCHETYPE_ICONS[attacker]}
                              alt={attacker}
                              className="w-5 h-5 sm:w-6 sm:h-6"
                            />
                          </div>
                        </td>

                        {/* Data cells */}
                        {FACTIONS.map((defender) => (
                          <HeatmapCell
                            key={defender}
                            attacker={attacker}
                            defender={defender}
                            value={MATCHUP_DATA[attacker][defender]}
                            isHovered={hoveredCell === `${attacker}-${defender}`}
                            onHover={handleHover}
                            onClick={handleCellClick}
                          />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-[10px] text-white/30">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-3 rounded" style={{ background: "rgba(239, 68, 68, 0.25)" }} />
                <span>Disadvantage (&lt;50%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-3 rounded" style={{ background: "rgba(255, 255, 255, 0.06)" }} />
                <span>Even (~50%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-3 rounded" style={{ background: "rgba(34, 197, 94, 0.25)" }} />
                <span>Advantage (&gt;50%)</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-200/30">
                <span>Tap any cell for details</span>
              </div>
            </div>

            {/* Tooltip */}
            {tooltipInfo && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-lg p-4"
                style={{
                  background: "linear-gradient(135deg, rgba(15, 12, 10, 0.9), rgba(20, 15, 12, 0.85))",
                  border: "1px solid rgba(245, 158, 11, 0.15)",
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <img src={SIN_ARCHETYPE_ICONS[tooltipInfo.attacker]} alt="Sin faction icon" className="w-6 h-6" />
                  <span className="text-sm font-bold" style={{ color: FACTION_COLORS[tooltipInfo.attacker], fontFamily: "var(--font-heading)" }}>
                    {FACTION_LABELS[tooltipInfo.attacker]}
                  </span>
                  <span className="text-white/30 text-xs">vs</span>
                  <img src={SIN_ARCHETYPE_ICONS[tooltipInfo.defender]} alt="Sin faction icon" className="w-6 h-6" />
                  <span className="text-sm font-bold" style={{ color: FACTION_COLORS[tooltipInfo.defender], fontFamily: "var(--font-heading)" }}>
                    {FACTION_LABELS[tooltipInfo.defender]}
                  </span>
                  <span className="ml-auto text-sm font-mono" style={{ color: getTextColor(tooltipInfo.rate) }}>
                    {tooltipInfo.rate.toFixed(1)}%
                  </span>
                </div>
                {tooltipInfo.analysis && (
                  <p className="text-xs text-white/50 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    {tooltipInfo.analysis}
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Faction Summary Cards */}
      <section className="relative z-10 px-4 pb-10">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-xl sm:text-2xl font-bold text-white/80 mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Faction Matchup Profiles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {factionStats.map(({ faction, best, worst, avg }) => (
              <motion.div
                key={faction}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg p-4"
                style={{
                  background: "linear-gradient(135deg, rgba(15, 12, 10, 0.5), rgba(20, 15, 12, 0.3))",
                  border: `1px solid ${FACTION_COLORS[faction]}15`,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <img src={SIN_ARCHETYPE_ICONS[faction]} alt={faction} className="w-6 h-6" />
                  <span
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{ color: FACTION_COLORS[faction], fontFamily: "var(--font-heading)" }}
                  >
                    {FACTION_LABELS[faction]}
                  </span>
                  <span className="ml-auto text-xs font-mono text-white/30">
                    avg {avg.toFixed(1)}%
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Best vs</span>
                    <span className="flex items-center gap-1">
                      <img src={SIN_ARCHETYPE_ICONS[best.opponent]} alt="" aria-hidden="true" className="w-3.5 h-3.5" />
                      <span style={{ color: "rgba(134, 239, 172, 0.8)" }} className="font-mono">
                        {best.rate.toFixed(1)}%
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Worst vs</span>
                    <span className="flex items-center gap-1">
                      <img src={SIN_ARCHETYPE_ICONS[worst.opponent]} alt="" aria-hidden="true" className="w-3.5 h-3.5" />
                      <span style={{ color: "rgba(252, 165, 165, 0.8)" }} className="font-mono">
                        {worst.rate.toFixed(1)}%
                      </span>
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-white/25" style={{ fontFamily: "var(--font-body)" }}>
                  {PASSIVE_INFO[faction].name} — {PASSIVE_INFO[faction].description.split(".")[0]}.
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Dynamics */}
      <ScrollReveal direction="up" delay={0} distance={30}>
      <section className="relative z-10 px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-xl sm:text-2xl font-bold text-white/80 mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Key Dynamics
          </h2>
          <p className="text-sm text-white/35 mb-6 max-w-2xl" style={{ fontFamily: "var(--font-body)" }}>
            Notable matchup asymmetries driven by passive ability interactions and compound-ticking mechanics.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DynamicCard
              title="Gluttony Devours Envy"
              factions={["gluttony", "envy"]}
              description="Gluttony's deck destruction removes cards Envy needs for affliction stacking (51.2% vs 48.8%). Despite JEALOUSY being buffed to 47.6%, DEVOURER energy gain still outpaces the amplification engine."
            />
            <DynamicCard
              title="Lust Dominates Wrath"
              factions={["lust", "wrath"]}
              description="The strongest matchup in v5.12 (60.5% vs 39.5%). Despite TEMPTATION being nerfed to 1%, Lust's 20 heal_steal and 15 heal_gain card effects dominate Wrath's glass cannon approach."
            />
            <DynamicCard
              title="Sloth Walls Wrath"
              factions={["sloth", "wrath"]}
              description="Sloth's ENDURANCE shields absorb Wrath's burst (56.9% vs 43.1%). Despite the v5.12 AOE nerf (x2.0 to x1.029) and shield cap reduction (44 to 23), Sloth's defensive consistency still outlasts Wrath."
            />
            <DynamicCard
              title="Envy Disrupts Lust"
              factions={["envy", "lust"]}
              description="Envy's 47.6% JEALOUSY (up from 10.6%) creates devastating affliction spirals, but Lust's raw card healing still wins 59.5%. The matchup shifted toward Lust after TEMPTATION was nerfed but card values were preserved."
            />
            <DynamicCard
              title="Gluttony Burns Sloth"
              factions={["gluttony", "sloth"]}
              description="Gluttony's deck burn disrupts Sloth's slowburn by removing compound cards. With Sloth's AOE nerfed to x1.029, this matchup is now much closer (51.0% vs 49.0%) compared to pre-v5.12."
            />
            <DynamicCard
              title="Greed Checks Gluttony"
              factions={["greed", "gluttony"]}
              description="Greed dominates Gluttony 52.9% to 47.1% through resource denial. TAX shields provide passive defense while energy steal disrupts DEVOURER's self-sustaining burn chain."
            />
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Methodology Note */}
      <ScrollReveal direction="up" delay={50} distance={20}>
      <section className="relative z-10 px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(15, 12, 10, 0.4), rgba(20, 15, 12, 0.2))",
              border: "1px solid rgba(255, 255, 255, 0.04)",
            }}
          >
            <h3
              className="text-sm font-semibold text-amber-200/60 mb-3 tracking-wider uppercase"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Methodology Note
            </h3>
            <p className="text-xs text-white/35 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Pairwise matchup rates are measured across 2M simulated 4-player FFA games using the v5.12 balanced parameters (333 HP, x1.75 defense, Final Reckoning at round 20, 59 rebalanced cards, 7 retuned passives, 424 cards including 46 zero-cost). v5.12 key changes: Lust TEMPTATION 25% to 1%, Envy JEALOUSY 10.6% to 47.6%, Pride HUBRIS x1.324 to x1.590, Sloth ENDURANCE cap 44 to 23 / AOE x2.0 to x1.029.
              Each cell represents the probability that the row faction finishes with a higher placement than the column faction
              when both appear in the same game. Because this is a 4-player format (not 1v1), matchup dynamics are influenced
              by the other two factions present — a faction may perform differently against the same opponent depending on the
              overall table composition. The data uses random card selection; human strategic play may shift these values.
            </p>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Footer */}
      <footer className="relative z-10 px-4 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/20" />
            <svg width="8" height="8" viewBox="0 0 12 12" className="text-amber-500/20">
              <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="currentColor" />
            </svg>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/20" />
          </div>
          <p className="text-center text-[10px] text-white/15" style={{ fontFamily: "var(--font-heading)" }}>
            7 Deadly Sins - Matchup Matrix v5.12 - 2M Game Simulation
          </p>
        </div>
      </footer>

      {/* Drill-Down Modal */}
      {drilldownCell && (() => {
        const [att, def] = drilldownCell.split("-") as [SinType, SinType];
        return (
          <MatchupDrillDown
            attacker={att}
            defender={def}
            onClose={() => setDrilldownCell(null)}
          />
        );
      })()}
    </div>
  );
}
