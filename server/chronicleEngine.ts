/**
 * Chronicle Engine — The 3-Stage Narrative Pipeline
 *
 * Transforms game events into an alternate history of human civilization.
 *
 * Pipeline:
 *   Stage 1: Event Translator — converts game events to historical events
 *   Stage 2: Continuity Checker — ensures narrative consistency
 *   Stage 3: Prose Writer — generates literary prose with narrator voice
 *
 * Post-game:
 *   Chronicle Assembly — rewrites segments into cohesive 800-1200 word document
 *   Evaluator-Optimizer — catches generic patterns, ensures quality
 */

import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import type { GameState, SinType } from "../shared/gameTypes";
import {
  ERA_TIMELINE,
  FACTION_FORCES,
  TITLE_FORMULAS,
  determineCivilizationType,
  type ChronicleSegment,
  type ChronicleRarity,
  type CivilizationType,
  type Era,
} from "../shared/chronicleTypes";
import { getCardById } from "../shared/cardData";
import { analyzePlayerBehaviors, detectRivalries, type PlayerBehavior } from "./aiNarrator";

// ---- LLM Setup (Google Gemini Flash) ----
// Uses GOOGLE_GENERATIVE_AI_API_KEY env var automatically
const model = google("gemini-2.0-flash");

// ---- Narrator Voice System ----

const NARRATOR_VOICE_CHART = `You are THE CHRONICLER — an ancient, omniscient entity who has watched every civilization rise and fall.

VOICE RULES:
1. OMNISCIENT: Write with the weary authority of someone who has seen it all before. Reference patterns across eras. "This was not the first time fire solved a political problem." NEVER express shock or surprise. NEVER use exclamation marks.
2. SARDONIC: Find dark humor in human folly. Use dry wit and understatement. "The peace treaty lasted almost a full afternoon." Let irony do the work. NEVER mock players directly. NEVER be mean-spirited.
3. PRECISE: Respect numbers. Use exact figures from the game. "The assault cost 23 lives." Reference specific rounds as years/decades. NEVER use vague quantifiers ("many," "several," "countless").
4. LITERARY: Write prose worth quoting. Use concrete nouns and active verbs. Vary sentence length. End paragraphs on strong images. NEVER use cliches ("In a world where..."). NEVER use passive voice unless for deliberate effect.`;

const CIVILIZATION_PERSONA_SHIFTS: Record<CivilizationType, string> = {
  warrior_empire:
    "PERSONA: Warrior Empire. Be more terse. Shorter sentences. Military metaphors. Example: 'The Wrathful took the capital on Tuesday. By Wednesday, there was nothing left to take.'",
  enlightened_republic:
    "PERSONA: Enlightened Republic. Be more philosophical. Longer sentences. Ask questions. Example: 'Whether the Prideful built their towers to touch the divine or to escape the mundane is a question their architects never thought to ask.'",
  merchant_federation:
    "PERSONA: Merchant Federation. Be more transactional. Lists. Cost-benefit language. Example: 'The Greedy offered three things: protection, prosperity, and a bill that would arrive precisely on time.'",
  balanced:
    "PERSONA: Balanced Civilization. Be most literary. Balanced rhythm. Use paradoxes. Example: 'They were a civilization of contradictions: violent peacemakers, generous thieves, lazy conquerors.'",
};

// ---- Stage 1: Event Translator ----

interface GameRoundEvents {
  round: number;
  cardsPlayed: Array<{
    playerName: string;
    faction: SinType;
    cardName: string;
    effectTypes: string[];
    damage: number;
    healing: number;
    targetName?: string;
  }>;
  eliminations: Array<{ playerName: string; faction: SinType; killerName?: string }>;
  hpChanges: Array<{ playerName: string; faction: SinType; before: number; after: number }>;
  biggestHit: { attackerName: string; targetName: string; damage: number } | null;
  isComeback: boolean;
  comebackPlayer?: string;
}

function translateEventsToHistorical(
  events: GameRoundEvents,
  era: Era,
  factionForces: typeof FACTION_FORCES
): string {
  const lines: string[] = [];
  lines.push(`ERA: ${era.name} (${era.anchor})`);
  lines.push(`TONE: ${era.tone}`);
  lines.push(`SEED: ${era.seedSentences[Math.floor(Math.random() * era.seedSentences.length)]}`);
  lines.push("");

  // Translate card plays to historical events
  for (const play of events.cardsPlayed) {
    const force = factionForces[play.faction];
    const isOffensive = play.effectTypes.some((t) =>
      ["damage", "heal_steal", "energy_steal", "affliction_amplify"].includes(t)
    );
    const isDefensive = play.effectTypes.some((t) =>
      ["heal_gain", "shield_gain"].includes(t)
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

  // Eliminations
  for (const elim of events.eliminations) {
    const force = factionForces[elim.faction];
    lines.push(
      `ELIMINATION: ${elim.playerName}'s ${force.force} falls.${elim.killerName ? ` Destroyed by ${elim.killerName}.` : ""} ${force.whenDefeated}.`
    );
  }

  // Biggest hit
  if (events.biggestHit && events.biggestHit.damage >= 20) {
    lines.push(
      `TURNING POINT: ${events.biggestHit.attackerName} devastates ${events.biggestHit.targetName} for ${events.biggestHit.damage} damage.`
    );
  }

  // Comeback
  if (events.isComeback && events.comebackPlayer) {
    lines.push(`COMEBACK: ${events.comebackPlayer} rises from near-death.`);
  }

  return lines.join("\n");
}

// ---- Stage 2: Continuity Checker ----

async function checkContinuity(
  newSegment: string,
  previousContext: string,
  era: Era
): Promise<string> {
  if (!previousContext) return newSegment;

  try {
    const { text } = await generateText({
      model,
      system: `You are a continuity editor. Your job is to check a new narrative segment against the existing chronicle and flag any contradictions. If the new segment contradicts the existing narrative, rewrite ONLY the contradicting parts to maintain consistency. Keep the new segment's style and content otherwise intact. Return the corrected segment only, no explanations.`,
      prompt: `EXISTING CHRONICLE CONTEXT:\n${previousContext}\n\nNEW SEGMENT FOR ERA "${era.name}":\n${newSegment}\n\nCheck for contradictions and return the corrected segment:`,
      maxOutputTokens: 300,
      temperature: 0.3,
    });
    return text.trim();
  } catch (error) {
    console.error("[Chronicle] Continuity check failed, using raw segment:", error);
    return newSegment;
  }
}

// ---- Stage 3: Prose Writer ----

async function writeProse(
  historicalEvents: string,
  continuityCheckedContext: string,
  era: Era,
  civType: CivilizationType,
  previousChronicle: string
): Promise<string> {
  const personaShift = CIVILIZATION_PERSONA_SHIFTS[civType];

  try {
    const { text } = await generateText({
      model,
      system: `${NARRATOR_VOICE_CHART}\n\n${personaShift}\n\nYou are writing one segment of an alternate history chronicle. This segment covers the era "${era.name}" (${era.anchor}). The tone should be: ${era.tone}.\n\nRULES:\n- Write EXACTLY 2-4 sentences. No more.\n- Use the seed sentence as inspiration for style, not as content to copy.\n- Reference SPECIFIC numbers from the game events (damage dealt, HP values).\n- Maintain continuity with previous chronicle segments.\n- Every sentence must earn its place. No filler.\n- Use the historical force translations, not game terminology (no "HP", "energy", "cards").`,
      prompt: `PREVIOUS CHRONICLE:\n${previousChronicle || "(This is the first era.)"}\n\nHISTORICAL EVENTS THIS ERA:\n${historicalEvents}\n\nCONTINUITY NOTES:\n${continuityCheckedContext || "No continuity issues."}\n\nWrite the chronicle segment for "${era.name}":`,
      maxOutputTokens: 200,
      temperature: 0.85,
    });
    return text.trim();
  } catch (error) {
    console.error("[Chronicle] Prose writer failed, using seed sentence:", error);
    return era.seedSentences[Math.floor(Math.random() * era.seedSentences.length)];
  }
}

// ---- Public API: Generate Round Narrative ----

/**
 * Generate a chronicle segment for a single round.
 * Called after each round's resolution.
 */
export async function generateRoundNarrative(
  gameState: GameState,
  gameLog: any[],
  roundEvents: GameRoundEvents,
  previousSegments: ChronicleSegment[],
  civMetrics: { militarism: number; culture: number; commerce: number }
): Promise<ChronicleSegment> {
  const round = roundEvents.round;
  const era = ERA_TIMELINE[round - 1] || ERA_TIMELINE[ERA_TIMELINE.length - 1];

  // Update civilization metrics based on factions that acted this round
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

  // Stage 1: Event Translation
  const historicalEvents = translateEventsToHistorical(roundEvents, era, FACTION_FORCES);

  // Build previous chronicle summary
  const previousChronicle = previousSegments
    .slice(-3) // Last 3 segments for context window
    .map((s) => `[${s.eraName}]: ${s.narrativeText}`)
    .join("\n\n");

  // Stage 2: Continuity Check
  const continuityContext = await checkContinuity(
    historicalEvents,
    previousChronicle,
    era
  );

  // Stage 3: Prose Writing
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
    civilizationMetrics: updatedMetrics,
  };
}

// ---- Chronicle Assembly (Post-Game) ----

/**
 * Assemble all round segments into a cohesive chronicle document.
 * Uses Evaluator-Optimizer loop for quality control.
 */
export async function assembleChronicle(
  gameState: GameState,
  segments: ChronicleSegment[],
  gameLog: any[],
  finalCivMetrics: { militarism: number; culture: number; commerce: number }
): Promise<{
  title: string;
  excerpt: string;
  fullText: string;
  civilizationType: CivilizationType;
  rarityTier: ChronicleRarity;
  turningPointRound: number;
  stats: {
    totalDamageDealt: number;
    totalHealingDone: number;
    totalEliminations: number;
    winnerFinalHp: number;
    longestRivalry: { attacker: string; target: string; count: number } | null;
  };
}> {
  const civType = determineCivilizationType(finalCivMetrics);
  const personaShift = CIVILIZATION_PERSONA_SHIFTS[civType];
  const behaviors = analyzePlayerBehaviors(gameState, gameLog);
  const rivalries = detectRivalries(behaviors);

  // Calculate stats
  const stats = calculateGameStats(gameState, gameLog, rivalries);
  const turningPointRound = findTurningPoint(segments, gameLog);
  const rarity = calculateRarity(gameState, stats, segments);

  // Build the raw chronicle from segments
  const rawChronicle = segments
    .map((s) => `## ${s.eraName}\n\n${s.narrativeText}`)
    .join("\n\n");

  // Player info
  const playerInfo = gameState.players
    .map((p) => `${p.username} (${p.chosenSin || "unknown"})`)
    .join(", ");
  const winner = gameState.players.find((p) => p.id === gameState.winnerId);

  // Assembly prompt
  let fullText: string;
  try {
    const { text } = await generateText({
      model,
      system: `${NARRATOR_VOICE_CHART}\n\n${personaShift}\n\nYou are assembling a complete alternate history chronicle from round-by-round segments. Your job is to weave them into a cohesive 800-1200 word document that reads like a published historical text.\n\nSTRUCTURE (Peak-End Rule):\n1. OPENING (1 paragraph): Set the mythic tone. Reference the Dawn of Consciousness.\n2. RISING ACTION (3-5 paragraphs): Cover the early and middle eras. Build tension.\n3. TURNING POINT (1-2 paragraphs): The most dramatic moment (round ${turningPointRound}). This should be the emotional peak.\n4. FALLING ACTION (2-3 paragraphs): The consequences of the turning point through later eras.\n5. ENDING (1 paragraph): The legacy. What kind of civilization emerged. Make the reader feel something.\n\nRULES:\n- Do NOT just stitch segments together. Rewrite into flowing prose.\n- Add transitional passages between eras.\n- Use SPECIFIC numbers from the game (damage, HP, round numbers translated to years/decades).\n- The chronicle should feel like it was written by a historian 1000 years after the events.\n- Reference player names as historical figures (leaders, generals, merchants, etc.).\n- 800-1200 words. No more, no less.\n- No game terminology (HP, energy, cards, rounds). Translate everything to historical language.`,
      prompt: `PLAYERS: ${playerInfo}\nWINNER: ${winner?.username || "Unknown"} (${winner?.chosenSin || "unknown"}) with ${winner?.currentHp || 0} HP remaining\nCIVILIZATION TYPE: ${civType}\nTURNING POINT: Round ${turningPointRound}\nTOTAL DAMAGE: ${stats.totalDamageDealt}\nELIMINATIONS: ${stats.totalEliminations}\n${rivalries.length > 0 ? `GREATEST RIVALRY: ${rivalries[0].attacker} vs ${rivalries[0].target} (${rivalries[0].count} attacks)` : ""}\n\nRAW CHRONICLE SEGMENTS:\n\n${rawChronicle}\n\nAssemble into a cohesive chronicle:`,
      maxOutputTokens: 2000,
      temperature: 0.8,
    });
    fullText = text.trim();
  } catch (error) {
    console.error("[Chronicle] Assembly failed, using raw segments:", error);
    fullText = rawChronicle;
  }

  // Evaluator pass — check quality
  fullText = await evaluateAndOptimize(fullText, civType, stats);

  // Generate title
  const title = await generateTitle(gameState, civType, stats, rivalries);

  // Generate excerpt (open loop for social sharing)
  const excerpt = generateExcerpt(fullText);

  return {
    title,
    excerpt,
    fullText,
    civilizationType: civType,
    rarityTier: rarity,
    turningPointRound,
    stats,
  };
}

// ---- Evaluator-Optimizer ----

async function evaluateAndOptimize(
  chronicle: string,
  civType: CivilizationType,
  stats: any
): Promise<string> {
  try {
    const { text: evaluation } = await generateText({
      model,
      system: `You are a literary editor evaluating an alternate history chronicle. Score it on these criteria (1-10 each):
1. CONTINUITY: Are there contradictions between eras?
2. SPECIFICITY: Does it use exact numbers and specific events, or vague generalities?
3. VOICE: Does it maintain the sardonic, omniscient narrator voice throughout?
4. STRUCTURE: Does it follow Peak-End structure with a clear turning point?
5. ORIGINALITY: Does it avoid cliches and generic fantasy prose?

If the TOTAL score is 35+, respond with ONLY "PASS".
If below 35, respond with ONLY the rewritten chronicle that fixes the weaknesses. No explanations.`,
      prompt: `CHRONICLE:\n\n${chronicle}\n\nEvaluate:`,
      maxOutputTokens: 2000,
      temperature: 0.3,
    });

    const result = evaluation.trim();
    if (result === "PASS" || result.length < 50) {
      return chronicle;
    }
    // The evaluator rewrote it
    return result;
  } catch (error) {
    console.error("[Chronicle] Evaluator failed, using original:", error);
    return chronicle;
  }
}

// ---- Title Generation ----

async function generateTitle(
  gameState: GameState,
  civType: CivilizationType,
  stats: any,
  rivalries: Array<{ attacker: string; target: string; count: number }>
): Promise<string> {
  const winner = gameState.players.find((p) => p.id === gameState.winnerId);
  const factions = gameState.players
    .filter((p) => p.chosenSin)
    .map((p) => p.chosenSin as SinType);

  try {
    const { text } = await generateText({
      model,
      system: `Generate a compelling chronicle title. It should sound like a real history book title — authoritative, specific, and slightly ominous. Use one of these formulas as inspiration but don't copy them exactly:\n${TITLE_FORMULAS.join("\n")}\n\nRULES:\n- Max 12 words.\n- No generic fantasy titles ("The Epic Saga of...").\n- Reference the winning faction's historical force or the civilization type.\n- Make it sound like something you'd find in a university library.\n- Return ONLY the title, nothing else.`,
      prompt: `Winner: ${winner?.username} (${winner?.chosenSin})\nCivilization: ${civType}\nFactions: ${factions.join(", ")}\nTotal damage: ${stats.totalDamageDealt}\nEliminations: ${stats.totalEliminations}\n${rivalries.length > 0 ? `Rivalry: ${rivalries[0].attacker} vs ${rivalries[0].target}` : ""}\n\nGenerate title:`,
      maxOutputTokens: 30,
      temperature: 0.9,
    });
    return text.trim().replace(/^["']|["']$/g, "");
  } catch (error) {
    // Fallback title
    const winnerFaction = winner?.chosenSin || "wrath";
    const force = FACTION_FORCES[winnerFaction as SinType]?.force || "Unknown Forces";
    return `The ${civType.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}: A Chronicle of ${force}`;
  }
}

// ---- Excerpt Generation (Open Loop) ----

function generateExcerpt(fullText: string): string {
  // Take the first ~200 characters and cut at the last sentence boundary
  const maxLen = 220;
  if (fullText.length <= maxLen) return fullText;

  const truncated = fullText.substring(0, maxLen);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastQuestion = truncated.lastIndexOf("?");
  const cutPoint = Math.max(lastPeriod, lastQuestion);

  if (cutPoint > 100) {
    // End mid-sentence for open loop effect
    const nextSentenceStart = fullText.substring(cutPoint + 1, cutPoint + 60).trim();
    const midCut = nextSentenceStart.indexOf(" ", 20);
    if (midCut > 0) {
      return fullText.substring(0, cutPoint + 1 + midCut).trim() + "...";
    }
    return fullText.substring(0, cutPoint + 1);
  }

  return truncated.trim() + "...";
}

// ---- Stats Calculation ----

function calculateGameStats(
  gameState: GameState,
  gameLog: any[],
  rivalries: Array<{ attacker: string; target: string; count: number }>
) {
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

  // If game log doesn't have these specific entries, estimate from player state
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
    longestRivalry: rivalries.length > 0 ? rivalries[0] : null,
  };
}

// ---- Turning Point Detection ----

function findTurningPoint(segments: ChronicleSegment[], gameLog: any[]): number {
  // Find the round with the biggest HP swing or elimination
  let maxDrama = 0;
  let turningPoint = 10; // default to midpoint

  for (const entry of gameLog) {
    if (entry.action_type === "player_eliminated") {
      const round = entry.round_number || 10;
      const drama = 100; // eliminations are always dramatic
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

// ---- Rarity Calculation ----

function calculateRarity(
  gameState: GameState,
  stats: any,
  segments: ChronicleSegment[]
): ChronicleRarity {
  let score = 0;

  // Close game (winner < 30% HP) = more dramatic
  const winner = gameState.players.find((p) => p.id === gameState.winnerId);
  if (winner) {
    const hpPercent = winner.currentHp / winner.maxHp;
    if (hpPercent < 0.1) score += 4; // nail-biter
    else if (hpPercent < 0.3) score += 2;
  }

  // Many eliminations = more dramatic
  if (stats.totalEliminations >= 3) score += 3;
  else if (stats.totalEliminations >= 2) score += 1;

  // Strong rivalry = more dramatic
  if (stats.longestRivalry && stats.longestRivalry.count >= 5) score += 3;
  else if (stats.longestRivalry && stats.longestRivalry.count >= 3) score += 1;

  // High damage = more dramatic
  if (stats.totalDamageDealt > 1000) score += 2;

  // All 20 rounds played = more complete story
  if (segments.length >= 18) score += 1;

  // Diverse factions = more interesting
  const uniqueFactions = new Set(
    gameState.players.map((p) => p.chosenSin).filter(Boolean)
  );
  if (uniqueFactions.size >= 4) score += 2;

  // Variable ratio: add randomness (behavioral science)
  score += Math.random() < 0.15 ? 3 : 0; // 15% chance of rarity boost
  score += Math.random() < 0.05 ? 5 : 0; // 5% chance of legendary boost

  if (score >= 12) return "legendary";
  if (score >= 8) return "epic";
  if (score >= 4) return "rare";
  return "common";
}

// ---- Extract Round Events from Game Log ----

/**
 * Extract structured round events from the game log for a specific round.
 * This is called by the game engine after each round's resolution.
 */
export function extractRoundEvents(
  gameState: GameState,
  gameLog: any[],
  round: number
): GameRoundEvents {
  const roundLog = gameLog.filter((e) => e.round_number === round);
  const cardsPlayed: GameRoundEvents["cardsPlayed"] = [];
  const eliminations: GameRoundEvents["eliminations"] = [];
  const hpChanges: GameRoundEvents["hpChanges"] = [];
  let biggestHit: GameRoundEvents["biggestHit"] = null;
  let isComeback = false;
  let comebackPlayer: string | undefined;

  for (const entry of roundLog) {
    const player = gameState.players.find((p) => p.id === entry.player_id);
    if (!player) continue;

    if (entry.action_type === "play_card" && entry.action_data) {
      const card = getCardById(entry.action_data.cardId);
      if (card) {
        const target = entry.action_data.targetPlayerId
          ? gameState.players.find((p) => p.id === entry.action_data.targetPlayerId)
          : undefined;

        cardsPlayed.push({
          playerName: player.username,
          faction: player.chosenSin || "wrath",
          cardName: card.name,
          effectTypes: card.effects.map((e) => e.type),
          damage: entry.action_data.damage || 0,
          healing: entry.action_data.healing || 0,
          targetName: target?.username,
        });
      }
    }

    if (entry.action_type === "player_eliminated") {
      eliminations.push({
        playerName: player.username,
        faction: player.chosenSin || "wrath",
        killerName: entry.action_data?.killerName,
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
          damage,
        };
      }
    }
  }

  // Detect comebacks (player was below 25% HP and gained HP this round)
  for (const player of gameState.players) {
    if (!player.isAlive) continue;
    const hpPercent = player.currentHp / player.maxHp;
    if (hpPercent > 0.3) {
      // Check if they were below 25% recently
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
    comebackPlayer,
  };
}

// ---- Save/Load from Supabase ----

import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.VITE_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""
  );
}

/**
 * Save a chronicle segment to Supabase
 */
export async function saveChronicleSegment(
  gameId: string,
  segment: ChronicleSegment
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("chronicle_segments").insert({
    game_id: gameId,
    round_number: segment.round,
    era_name: segment.eraName,
    narrative_text: segment.narrativeText,
    civilization_metrics: segment.civilizationMetrics,
  });
  if (error) {
    console.error("[Chronicle] Failed to save segment:", error);
  }
}

/**
 * Load all chronicle segments for a game
 */
export async function loadChronicleSegments(
  gameId: string
): Promise<ChronicleSegment[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("chronicle_segments")
    .select("*")
    .eq("game_id", gameId)
    .order("round_number", { ascending: true });

  if (error || !data) {
    console.error("[Chronicle] Failed to load segments:", error);
    return [];
  }

  return data.map((row: any) => ({
    round: row.round_number,
    eraName: row.era_name,
    narrativeText: row.narrative_text,
    civilizationMetrics: row.civilization_metrics || {
      militarism: 0,
      culture: 0,
      commerce: 0,
    },
  }));
}

/**
 * Save a full chronicle to Supabase
 */
export async function saveChronicle(
  gameId: string,
  chronicle: {
    title: string;
    excerpt: string;
    fullText: string;
    civilizationType: CivilizationType;
    rarityTier: ChronicleRarity;
    playerFactions: Array<{ name: string; faction: SinType }>;
    totalRounds: number;
    turningPointRound: number;
    stats: any;
  }
): Promise<string | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("chronicles")
    .upsert(
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
        stats_json: chronicle.stats,
      },
      { onConflict: "game_id" }
    )
    .select("id")
    .single();

  if (error) {
    console.error("[Chronicle] Failed to save chronicle:", error);
    return null;
  }

  return data?.id || null;
}

/**
 * Load a chronicle by game ID
 */
export async function loadChronicle(gameId: string): Promise<any | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("chronicles")
    .select("*")
    .eq("game_id", gameId)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Load published chronicles for the public feed
 */
export async function loadPublishedChronicles(
  limit: number = 20,
  offset: number = 0,
  filters?: { rarityTier?: ChronicleRarity; civilizationType?: CivilizationType }
): Promise<{ chronicles: any[]; total: number }> {
  const supabase = getSupabase();
  let query = supabase
    .from("chronicles")
    .select("*", { count: "exact" })
    .eq("published", true)
    .order("created_at", { ascending: false });

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

/**
 * Increment view count for a chronicle
 */
export async function incrementViewCount(chronicleId: string): Promise<void> {
  const supabase = getSupabase();
  try {
    // Try RPC first
    const { error } = await supabase.rpc("increment_chronicle_views", { chronicle_id: chronicleId });
    if (error) throw error;
  } catch {
    // Fallback: manual increment
    const { data } = await supabase
      .from("chronicles")
      .select("view_count")
      .eq("id", chronicleId)
      .single();
    if (data) {
      await supabase
        .from("chronicles")
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq("id", chronicleId);
    }
  }
}

// ---- High-Level Wrappers (called from gameEngine.ts) ----

import { getGameState } from "./gameEngine";
import { generateAndSaveCoverArt } from "./chronicleCoverArt";

/**
 * High-level wrapper: generate a round narrative and save it.
 * Called from gameEngine.ts after each round's resolution.
 */
export async function generateAndSaveRoundNarrative(
  gameId: string,
  roundNumber: number
): Promise<void> {
  try {
    const supabase = getSupabase();
    const gameState = await getGameState(gameId);

    // Fetch game log for this round
    const { data: gameLog } = await supabase
      .from("game_log")
      .select("*")
      .eq("game_id", gameId)
      .order("created_at", { ascending: true });

    const log = gameLog || [];

    // Extract round events
    const roundEvents = extractRoundEvents(gameState, log, roundNumber);

    // Load previous segments for continuity
    const previousSegments = await loadChronicleSegments(gameId);

    // Calculate running civilization metrics
    const lastMetrics = previousSegments.length > 0
      ? previousSegments[previousSegments.length - 1].civilizationMetrics
      : { militarism: 0, culture: 0, commerce: 0 };

    // Generate narrative
    const segment = await generateRoundNarrative(
      gameState,
      log,
      roundEvents,
      previousSegments,
      lastMetrics
    );

    // Save to Supabase
    await saveChronicleSegment(gameId, segment);

    console.log(`[Chronicle] Round ${roundNumber} narrative saved for game ${gameId}`);
  } catch (error) {
    console.error(`[Chronicle] Failed to generate round ${roundNumber} narrative:`, error);
  }
}

/**
 * High-level wrapper: assemble the full chronicle and save it.
 * Called from gameEngine.ts when the game finishes.
 */
export async function assembleAndSaveChronicle(
  gameId: string
): Promise<string | null> {
  try {
    const supabase = getSupabase();
    const gameState = await getGameState(gameId);

    // Fetch full game log
    const { data: gameLog } = await supabase
      .from("game_log")
      .select("*")
      .eq("game_id", gameId)
      .order("created_at", { ascending: true });

    const log = gameLog || [];

    // Load all segments
    const segments = await loadChronicleSegments(gameId);

    if (segments.length === 0) {
      console.warn("[Chronicle] No segments found, skipping assembly for game", gameId);
      return null;
    }

    // Calculate final civilization metrics
    const finalMetrics = segments.length > 0
      ? segments[segments.length - 1].civilizationMetrics
      : { militarism: 0, culture: 0, commerce: 0 };

    // Assemble the chronicle
    const result = await assembleChronicle(gameState, segments, log, finalMetrics);

    // Build player factions list
    const playerFactions = gameState.players
      .filter((p) => p.chosenSin)
      .map((p) => ({ name: p.username, faction: p.chosenSin as SinType }));

    // Save to Supabase
    const chronicleId = await saveChronicle(gameId, {
      title: result.title,
      excerpt: result.excerpt,
      fullText: result.fullText,
      civilizationType: result.civilizationType,
      rarityTier: result.rarityTier,
      playerFactions,
      totalRounds: gameState.currentRound,
      turningPointRound: result.turningPointRound,
      stats: result.stats,
    });

    console.log(`[Chronicle] Full chronicle assembled and saved for game ${gameId} (id: ${chronicleId})`);

    // Fire-and-forget: generate cover art asynchronously
    // This never blocks the chronicle save — art appears later
    const dominantFactions = playerFactions
      .map((pf) => pf.faction as SinType)
      .filter(Boolean);

    generateAndSaveCoverArt({
      gameId,
      title: result.title,
      civilizationType: result.civilizationType,
      rarityTier: result.rarityTier,
      dominantFactions,
      turningPointRound: result.turningPointRound,
      totalEliminations: result.stats.totalEliminations,
      excerpt: result.excerpt,
    }).catch((err) => {
      console.error(`[Chronicle] Cover art generation failed for ${gameId}:`, err);
    });

    return chronicleId;
  } catch (error) {
    console.error("[Chronicle] Failed to assemble chronicle:", error);
    return null;
  }
}
