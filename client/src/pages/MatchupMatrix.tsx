/**
 * Matchup Matrix Page — 7x7 Faction Win Rate Heatmap
 *
 * Visualizes pairwise faction matchup dynamics in a 4-player FFA context.
 * Data derived from Monte Carlo simulation (100K games, v5 balance).
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

/* ─── Faction Config ────────────────────────────────────────── */
const FACTIONS: SinType[] = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];

const FACTION_COLORS: Record<SinType, string> = {
  wrath: "#ef4444",
  sloth: "#a855f7",
  greed: "#eab308",
  envy: "#22c55e",
  pride: "#e2e2e2",
  lust: "#ec4899",
  gluttony: "#f97316",
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
 * Data from v5 Monte Carlo simulation (100K games).
 * These values reflect the compound-ticking dynamics, passive interactions,
 * and the simultaneous-resolution turn structure.
 *
 * Methodology note: Since this is a 4-player game (not 1v1), pairwise
 * win rates are measured as "probability of finishing higher than the
 * other faction" across all games where both factions appear.
 */
const MATCHUP_DATA: Record<SinType, Record<SinType, number>> = {
  wrath: {
    wrath: 50.0,
    sloth: 47.8,
    greed: 50.5,
    envy: 51.5,
    pride: 50.7,
    lust: 47.4,
    gluttony: 48.0,
  },
  sloth: {
    wrath: 52.2,
    sloth: 50.0,
    greed: 50.6,
    envy: 49.8,
    pride: 49.6,
    lust: 48.8,
    gluttony: 47.9,
  },
  greed: {
    wrath: 49.5,
    sloth: 49.4,
    greed: 50.0,
    envy: 51.4,
    pride: 49.9,
    lust: 49.1,
    gluttony: 50.8,
  },
  envy: {
    wrath: 48.5,
    sloth: 50.2,
    greed: 48.6,
    envy: 50.0,
    pride: 48.5,
    lust: 50.5,
    gluttony: 47.1,
  },
  pride: {
    wrath: 49.3,
    sloth: 50.4,
    greed: 50.1,
    envy: 51.5,
    pride: 50.0,
    lust: 48.2,
    gluttony: 47.8,
  },
  lust: {
    wrath: 52.6,
    sloth: 51.2,
    greed: 50.9,
    envy: 49.5,
    pride: 51.8,
    lust: 50.0,
    gluttony: 49.9,
  },
  gluttony: {
    wrath: 52.0,
    sloth: 52.1,
    greed: 49.2,
    envy: 52.9,
    pride: 52.2,
    lust: 50.1,
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
    summary: "Sloth's shields absorb Wrath's burst, winning the attrition war.",
    passiveInteraction: "VENGEANCE reflect is wasted against ENDURANCE shields — reflected damage is absorbed before it can threaten Sloth's HP.",
    attackerStrengths: ["High burst damage in early rounds", "VENGEANCE punishes attackers", "Aggressive compound patterns escalate fast"],
    defenderStrengths: ["ENDURANCE generates shields each turn", "Slowburn pattern scales into late game", "Shield stacking absorbs burst windows"],
    keyCards: "Wrath's Inferno Wave (AoE) can overwhelm shields, but Sloth's Torpor Shield and Lethargy Wall regenerate faster than Wrath can burn through.",
    counterStrategy: "As Wrath: focus single-target burst to break shields before they stack. As Sloth: conserve energy for shield generation, avoid trading early.",
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
    passiveInteraction: "TEMPTATION converts Wrath's damage into healing. The more Wrath attacks, the more Lust sustains — a fundamental counter.",
    attackerStrengths: ["Highest raw damage output", "VENGEANCE reflect adds chip damage", "Aggressive patterns close games fast"],
    defenderStrengths: ["TEMPTATION heals from damage ticks", "Lifesteal negates burst damage", "Sustain outlasts aggression"],
    keyCards: "Lust's Seductive Drain turns Wrath's Inferno Wave into a massive heal. Wrath needs shield-piercing or heal-block effects to counter.",
    counterStrategy: "As Wrath: include heal_block cards to shut down TEMPTATION. As Lust: maximize damage-over-time to trigger more lifesteal.",
  },
  "sloth-pride": {
    summary: "Pride's HUBRIS burst can overwhelm shields, but Sloth's consistency keeps it close.",
    passiveInteraction: "HUBRIS multiplier (x1.324) on expensive cards can punch through ENDURANCE shields in a single round, but only when triggered.",
    attackerStrengths: ["ENDURANCE generates consistent shields", "Slowburn compounds over time", "High survivability in long games"],
    defenderStrengths: ["HUBRIS amplifies expensive card effects", "Single massive burst rounds", "High-tier cards have outsized impact"],
    keyCards: "Pride's Crown of Thorns with HUBRIS can deal 40+ damage in one round, breaking Sloth's shield stack. Sloth needs to spread shields across rounds.",
    counterStrategy: "As Sloth: maintain shield buffer above 30 HP equivalent. As Pride: save expensive cards for burst rounds.",
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
    summary: "Lust's lifesteal slowly erodes Sloth's shields in a battle of sustain.",
    passiveInteraction: "TEMPTATION healing outpaces ENDURANCE shield generation in long games — Lust heals while dealing damage, Sloth only shields.",
    attackerStrengths: ["TEMPTATION heals while dealing damage", "Lifesteal bypasses shield regeneration", "Sustain advantage in 15+ round games"],
    defenderStrengths: ["ENDURANCE shields absorb damage", "Slowburn pattern delays Lust's scaling", "Shield stacking buys time"],
    keyCards: "Lust's Charming Whisper deals damage AND heals, slowly outpacing Sloth's shield generation. Sloth needs burst damage to threaten Lust.",
    counterStrategy: "As Lust: play for the long game, maximize damage ticks. As Sloth: include offensive cards to pressure Lust's HP directly.",
  },
  "envy-lust": {
    summary: "Envy's affliction amplification disrupts Lust's sustain loop.",
    passiveInteraction: "JEALOUSY deepens afflictions faster than TEMPTATION can heal — amplified afflictions deal escalating damage that outpaces lifesteal.",
    attackerStrengths: ["JEALOUSY amplifies afflictions exponentially", "Affliction stacking bypasses healing", "Duo targeting spreads debuffs"],
    defenderStrengths: ["TEMPTATION provides consistent healing", "Lifesteal from damage ticks", "Sustain in long games"],
    keyCards: "Envy's Jealous Gaze + affliction_amplify cards create a damage spiral that TEMPTATION can't out-heal past round 8.",
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
    summary: "Gluttony's deck burn disrupts Sloth's slowburn strategy by removing late-game cards.",
    passiveInteraction: "DEVOURER energy sustains burn pressure while removing the compound cards Sloth needs for late-game scaling.",
    attackerStrengths: ["Deck burn removes compound cards", "DEVOURER self-sustains energy", "Disrupts slowburn scaling"],
    defenderStrengths: ["ENDURANCE shields buy time", "Slowburn compounds if cards survive", "High survivability"],
    keyCards: "Gluttony's Ravenous Maw destroys Sloth's key slowburn cards before they can compound. Sloth needs early shield stacking to survive.",
    counterStrategy: "As Gluttony: target Sloth's compound cards for burn. As Sloth: play compound cards early before they're destroyed.",
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
    passiveInteraction: "HUBRIS x1.324 multiplier on expensive cards delivers burst damage faster than JEALOUSY can stack afflictions.",
    attackerStrengths: ["HUBRIS amplifies expensive cards", "Single-round burst damage", "High-tier cards have outsized impact"],
    defenderStrengths: ["JEALOUSY deepens afflictions", "Affliction stacking scales over time", "Duo targeting spreads pressure"],
    keyCards: "Pride's Crown of Thorns with HUBRIS deals 40+ burst damage before Envy's afflictions can compound past round 5.",
    counterStrategy: "As Pride: play expensive cards early for HUBRIS burst. As Envy: survive burst rounds with heal cards, then out-scale.",
  },
  "lust-pride": {
    summary: "Lust's sustained lifesteal outlasts Pride's burst windows.",
    passiveInteraction: "TEMPTATION heals consistently each round, while HUBRIS only triggers on expensive card plays — Lust wins between burst windows.",
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
    defenderStrengths: ["HUBRIS x1.324 multiplier creates massive burst rounds", "High-cost cards have outsized single-round impact", "Can one-shot through moderate HP pools"],
    keyCards: "Wrath's Wrathful Cry deals reliable AoE damage every round. Pride's Crown of Thorns needs HUBRIS to trigger for maximum impact, which isn't guaranteed.",
    counterStrategy: "As Wrath: maintain pressure every round to prevent Pride from setting up HUBRIS combos. As Pride: save expensive cards for back-to-back HUBRIS rounds.",
  },
  "sloth-greed": {
    summary: "Sloth's shield stacking outlasts Greed's resource denial in a war of attrition.",
    passiveInteraction: "ENDURANCE generates shields from stored energy and hand size, while TAX generates shields from damage ticks — both factions build defenses, but Sloth's is more reliable.",
    attackerStrengths: ["ENDURANCE shields scale with hand size and energy", "Slowburn compounds grow stronger each turn", "High survivability in 15+ round games"],
    defenderStrengths: ["TAX shields from damage provide passive defense", "Energy steal can disrupt ENDURANCE scaling", "Resource denial weakens Sloth's hand-size dependency"],
    keyCards: "Sloth's Torpor Shield stacks compound shields that outpace TAX generation. Greed's energy steal can reduce Sloth's stored energy, weakening ENDURANCE output.",
    counterStrategy: "As Sloth: hold cards to maximize ENDURANCE shield generation. As Greed: aggressively steal energy to reduce Sloth's passive output.",
  },
  "sloth-envy": {
    summary: "Envy's affliction amplification slowly pierces through Sloth's shield wall.",
    passiveInteraction: "JEALOUSY deepens afflictions on damage, which bypass ENDURANCE shields — afflictions tick through shields, giving Envy a slow but reliable win condition.",
    attackerStrengths: ["ENDURANCE generates consistent shields", "Slowburn compounds scale over time", "High survivability delays Envy's scaling"],
    defenderStrengths: ["JEALOUSY afflictions bypass shield absorption", "Affliction amplification scales exponentially", "Duo targeting spreads debuffs past shields"],
    keyCards: "Envy's Jealous Gaze applies afflictions that tick through Sloth's shields. Sloth's Lethargy Wall can delay but not prevent affliction stacking.",
    counterStrategy: "As Sloth: include affliction_cleanse cards to remove debuffs before they compound. As Envy: stack afflictions early while Sloth focuses on shield generation.",
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
    passiveInteraction: "HUBRIS amplifies expensive cards while TAX generates shields from damage — Pride's burst can overwhelm TAX shields in single rounds, but Greed's energy steal delays HUBRIS triggers.",
    attackerStrengths: ["TAX shields provide passive defense", "Energy steal delays HUBRIS-eligible plays", "Resource denial disrupts expensive card timing"],
    defenderStrengths: ["HUBRIS x1.324 multiplier on expensive cards", "Single burst rounds can break through TAX shields", "High-cost cards have outsized impact"],
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
  "wrath-sloth": "Sloth's ENDURANCE shields absorb Wrath's burst. The slowburn pattern outlasts Wrath's aggressive front-loading.",
  "sloth-pride": "Pride's HUBRIS burst can overwhelm Sloth's shields when it triggers, but Sloth's consistent ENDURANCE generation keeps the matchup close.",
  "greed-gluttony": "Greed's resource theft disrupts Gluttony's discard_burn chains, but Gluttony's DEVOURER energy gain can outpace the theft.",
  "lust-wrath": "Lust's TEMPTATION converts Wrath's aggression into sustain. The more Wrath attacks, the more Lust heals.",
  "envy-gluttony": "Gluttony's discard_burn removes cards Envy needs for affliction stacking. DEVOURER energy gain outpaces JEALOUSY scaling.",
  "pride-envy": "Pride's expensive cards trigger HUBRIS more reliably, and the x1.324 multiplier overwhelms Envy's gradual amplification.",
  "gluttony-wrath": "Gluttony's deck destruction removes Wrath's high-damage cards from circulation. DEVOURER energy sustains the burn chain.",
  "lust-sloth": "Lust's lifesteal slowly erodes Sloth's shields. TEMPTATION healing outpaces ENDURANCE shield generation in long games.",
  "envy-lust": "Envy's JEALOUSY affliction amplification disrupts Lust's sustain loop — amplified afflictions deal more than TEMPTATION can heal.",
  "gluttony-sloth": "Gluttony's deck burn disrupts Sloth's slowburn strategy by removing key late-game cards before they can compound.",
  "wrath-greed": "Wrath's AoE burst generates fewer TAX shield ticks than single-target attacks. VENGEANCE reflect adds chip damage that Greed's shields can't fully absorb.",
  "wrath-pride": "Wrath's consistent round-over-round damage outpaces Pride's conditional HUBRIS triggers. VENGEANCE reflect punishes Pride's own attacks.",
  "sloth-greed": "Sloth's ENDURANCE shields scale more reliably than TAX shields. Greed's energy steal can disrupt but not prevent Sloth's compound growth.",
  "sloth-envy": "Envy's JEALOUSY afflictions bypass Sloth's ENDURANCE shields, ticking through the shield wall for a slow but reliable win condition.",
  "greed-envy": "Greed's energy steal starves Envy's affliction_amplify engine. TAX shields absorb the damage ticks that JEALOUSY needs to deepen.",
  "greed-lust": "Lust's TEMPTATION lifesteal outpaces TAX shield generation in longer games. Greed needs early aggression to prevent Lust's sustain from taking over.",
  "greed-pride": "Pride's HUBRIS burst can overwhelm TAX shields in single rounds, but Greed's energy steal delays the expensive card plays HUBRIS needs.",
  "lust-gluttony": "The closest matchup in the game. Gluttony's DEVOURER burns Lust's healing cards while TEMPTATION tries to out-sustain the attrition.",
  "gluttony-pride": "Gluttony's deck burn removes Pride's expensive cards, eliminating HUBRIS triggers. DEVOURER energy gain funds the destruction chain.",
  "lust-pride": "Lust's TEMPTATION heals consistently between Pride's conditional HUBRIS bursts, creating a net HP advantage over 20 rounds.",
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
        className={`w-full h-full flex items-center justify-center py-3 px-2 sm:py-4 sm:px-3 transition-all duration-150 ${
          isHovered ? "scale-110 z-10" : ""
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
              <img src={SIN_ARCHETYPE_ICONS[attacker]} alt="" className="w-8 h-8" />
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
              <img src={SIN_ARCHETYPE_ICONS[defender]} alt="" className="w-8 h-8" />
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
              Pairwise faction win rates from 100K simulated games. Each cell shows how often the
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
                  <img src={SIN_ARCHETYPE_ICONS[tooltipInfo.attacker]} alt="" className="w-6 h-6" />
                  <span className="text-sm font-bold" style={{ color: FACTION_COLORS[tooltipInfo.attacker], fontFamily: "var(--font-heading)" }}>
                    {FACTION_LABELS[tooltipInfo.attacker]}
                  </span>
                  <span className="text-white/30 text-xs">vs</span>
                  <img src={SIN_ARCHETYPE_ICONS[tooltipInfo.defender]} alt="" className="w-6 h-6" />
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
                      <img src={SIN_ARCHETYPE_ICONS[best.opponent]} alt="" className="w-3.5 h-3.5" />
                      <span style={{ color: "rgba(134, 239, 172, 0.8)" }} className="font-mono">
                        {best.rate.toFixed(1)}%
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Worst vs</span>
                    <span className="flex items-center gap-1">
                      <img src={SIN_ARCHETYPE_ICONS[worst.opponent]} alt="" className="w-3.5 h-3.5" />
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
              description="The strongest matchup in the game. Gluttony's deck destruction removes cards Envy needs for affliction stacking, while DEVOURER energy gain outpaces JEALOUSY's gradual amplification."
            />
            <DynamicCard
              title="Lust Dominates Wrath"
              factions={["lust", "wrath"]}
              description="Lust's TEMPTATION lifesteal directly counters Wrath's aggression. Every hit heals Lust while VENGEANCE only reflects a portion — creating a net-positive exchange for Lust."
            />
            <DynamicCard
              title="Sloth Walls Wrath"
              factions={["sloth", "wrath"]}
              description="Sloth's ENDURANCE shields absorb Wrath's burst damage. The slowburn compound pattern outlasts Wrath's aggressive front-loading, winning the attrition war."
            />
            <DynamicCard
              title="Envy Disrupts Lust"
              factions={["envy", "lust"]}
              description="Envy's JEALOUSY affliction amplification disrupts Lust's sustain loop — amplified afflictions deal more damage than TEMPTATION can heal, breaking the attrition advantage."
            />
            <DynamicCard
              title="Gluttony Burns Sloth"
              factions={["gluttony", "sloth"]}
              description="Gluttony's deck burn disrupts Sloth's slowburn strategy by removing key late-game cards before they can compound. DEVOURER energy sustains the pressure."
            />
            <DynamicCard
              title="Greed Checks Gluttony"
              factions={["greed", "gluttony"]}
              description="Greed's resource theft disrupts Gluttony's discard_burn chains. TAX shields provide passive defense while Greed steals the energy Gluttony needs."
            />
          </div>
        </div>
      </section>

      {/* Methodology Note */}
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
              Pairwise matchup rates are measured across 100K simulated 4-player FFA games using the v5 balanced parameters.
              Each cell represents the probability that the row faction finishes with a higher placement than the column faction
              when both appear in the same game. Because this is a 4-player format (not 1v1), matchup dynamics are influenced
              by the other two factions present — a faction may perform differently against the same opponent depending on the
              overall table composition. The data uses random card selection; human strategic play may shift these values.
            </p>
          </div>
        </div>
      </section>

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
            7 Deadly Sins — Matchup Matrix v5 — 100K Game Simulation
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
