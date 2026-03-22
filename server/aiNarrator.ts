/**
 * AI Narrator Engine - The Living Cathedral
 *
 * LLM-powered narrator that generates unique, contextual commentary
 * based on actual game state. Tracks rivalries, behavioral patterns,
 * and creates emergent narratives.
 *
 * Three systems:
 * 1. Living Narrator - Public commentary visible to all players
 * 2. Sin Whisperer - Private per-player temptations during selection
 * 3. Adaptive Nemesis - Behavioral analysis that feeds both systems
 */

import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { createPatchedFetch } from "./_core/patchedFetch";
import type { GameState, PlayerState, SinType, LockedPlay } from "../shared/gameTypes";
import { getCardById } from "../shared/cardData";
import { NARRATOR_LINES } from "../shared/cardData";

// ---- LLM Setup ----
const openai = createOpenAI({
  apiKey: process.env.BUILT_IN_FORGE_API_KEY,
  baseURL: `${process.env.BUILT_IN_FORGE_API_URL}/v1`,
  fetch: createPatchedFetch(fetch),
});

const model = openai.chat("gemini-2.5-flash");

// ---- Behavioral Analysis Types ----
export interface PlayerBehavior {
  playerId: string;
  username: string;
  faction: SinType | null;
  tags: string[];
  attackTargets: Record<string, number>; // playerId -> count
  totalAttacks: number;
  totalDefenses: number;
  riskScore: number; // 0-10, higher = more aggressive
  hpHistory: number[]; // HP at each round
}

export interface MatchContext {
  round: number;
  totalRounds: number;
  phase: string;
  players: Array<{
    name: string;
    faction: string;
    hp: number;
    maxHp: number;
    energy: number;
    isAlive: boolean;
    hasLockedIn: boolean;
    cardCount: number;
  }>;
  behaviors: PlayerBehavior[];
  rivalries: Array<{ attacker: string; target: string; count: number }>;
  recentEvents: string[];
}

// ---- Behavioral Analysis ----

/**
 * Analyze game log to build behavioral profiles for each player.
 * This is the "Adaptive Nemesis" system that feeds the narrator and whisperer.
 */
export function analyzePlayerBehaviors(
  gameState: GameState,
  gameLog: any[]
): PlayerBehavior[] {
  const behaviors: PlayerBehavior[] = gameState.players.map((p) => ({
    playerId: p.id,
    username: p.username,
    faction: p.chosenSin,
    tags: [],
    attackTargets: {},
    totalAttacks: 0,
    totalDefenses: 0,
    riskScore: 5,
    hpHistory: [],
  }));

  const behaviorMap = new Map(behaviors.map((b) => [b.playerId, b]));

  // Analyze game log for attack patterns
  for (const entry of gameLog) {
    const b = behaviorMap.get(entry.player_id);
    if (!b) continue;

    if (entry.action_type === "play_card" && entry.action_data) {
      const card = getCardById(entry.action_data.cardId);
      if (!card) continue;

      const isOffensive = card.effects?.some((e: any) =>
        ["damage", "heal_steal", "energy_steal", "shield_steal", "affliction_amplify"].includes(e.type)
      );
      const isDefensive = card.effects?.some((e: any) =>
        ["heal_gain", "shield_gain"].includes(e.type)
      );

      if (isOffensive) {
        b.totalAttacks++;
        if (entry.action_data.targetPlayerId) {
          b.attackTargets[entry.action_data.targetPlayerId] =
            (b.attackTargets[entry.action_data.targetPlayerId] || 0) + 1;
        }
      }
      if (isDefensive) {
        b.totalDefenses++;
      }

      // High energy cost = risky play
      if (card.cost >= 4) {
        b.riskScore = Math.min(10, b.riskScore + 0.5);
      }
    }
  }

  // Generate behavioral tags
  for (const b of behaviors) {
    const total = b.totalAttacks + b.totalDefenses;
    if (total === 0) continue;

    const aggressionRatio = b.totalAttacks / total;
    if (aggressionRatio > 0.7) b.tags.push("aggressive");
    else if (aggressionRatio < 0.3) b.tags.push("defensive");
    else b.tags.push("balanced");

    // Check for rivalries (attacking same person 3+ times)
    const topTarget = Object.entries(b.attackTargets).sort(
      ([, a], [, b]) => b - a
    )[0];
    if (topTarget && topTarget[1] >= 3) {
      const targetPlayer = gameState.players.find((p) => p.id === topTarget[0]);
      if (targetPlayer) {
        b.tags.push(`rivalry_with_${targetPlayer.username}`);
      }
    }

    // Check for comeback potential
    const player = gameState.players.find((p) => p.id === b.playerId);
    if (player) {
      const hpPercent = player.currentHp / player.maxHp;
      if (hpPercent < 0.25 && player.isAlive) b.tags.push("underdog");
      if (hpPercent > 0.75) b.tags.push("dominant");

      // Predictability check
      const uniqueTargets = Object.keys(b.attackTargets).length;
      if (b.totalAttacks > 5 && uniqueTargets <= 1) b.tags.push("predictable");
    }
  }

  return behaviors;
}

/**
 * Detect rivalries from behavioral data
 */
export function detectRivalries(
  behaviors: PlayerBehavior[]
): Array<{ attacker: string; target: string; count: number }> {
  const rivalries: Array<{ attacker: string; target: string; count: number }> = [];

  for (const b of behaviors) {
    for (const [targetId, count] of Object.entries(b.attackTargets)) {
      if (count >= 2) {
        const targetBehavior = behaviors.find((x) => x.playerId === targetId);
        rivalries.push({
          attacker: b.username,
          target: targetBehavior?.username || "Unknown",
          count,
        });
      }
    }
  }

  return rivalries.sort((a, b) => b.count - a.count);
}

/**
 * Build the match context object that gets injected into LLM prompts
 */
export function buildMatchContext(
  gameState: GameState,
  behaviors: PlayerBehavior[],
  recentEvents: string[] = []
): MatchContext {
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
      cardCount: p.hand.length,
    })),
    behaviors,
    rivalries: detectRivalries(behaviors),
    recentEvents,
  };
}

// ---- System Prompts ----

const NARRATOR_SYSTEM_PROMPT = `You are the Narrator of the 7 Deadly Sins card game arena. You are sardonic, theatrical, darkly witty, and slightly contemptuous of the players. Think of yourself as a demonic sports commentator who finds mortals amusing.

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

const WHISPERER_SYSTEM_PROMPTS: Record<string, string> = {
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
- Never use emojis.`,
};

// ---- Trigger Types ----

export type NarratorTrigger =
  | "round_start"
  | "card_reveal"
  | "big_damage"
  | "player_eliminated"
  | "game_over"
  | "comeback"
  | "rivalry_escalation";

// ---- Core Generation Functions ----

/**
 * Generate a narrator line for a specific game moment.
 * Falls back to static narrator lines if LLM fails.
 */
export async function generateNarratorLine(
  trigger: NarratorTrigger,
  context: MatchContext,
  triggerData?: Record<string, any>
): Promise<string> {
  try {
    const contextSummary = buildContextSummary(context, trigger, triggerData);

    const { text } = await generateText({
      model,
      system: NARRATOR_SYSTEM_PROMPT,
      prompt: contextSummary,
      maxOutputTokens: 60,
      temperature: 0.9,
    });

    // Clean up: ensure single sentence, strip quotes
    let line = text.trim().replace(/^["']|["']$/g, "");
    // Truncate if too long
    if (line.length > 150) {
      line = line.substring(0, 147) + "...";
    }
    return line;
  } catch (error) {
    console.error("[AI Narrator] LLM call failed, falling back to static:", error);
    return getFallbackLine(trigger, context, triggerData);
  }
}

/**
 * Generate a Sin Whisperer temptation for a specific player.
 * Private, per-player, faction-specific.
 */
export async function generateWhisper(
  player: PlayerState,
  context: MatchContext,
  hand: Array<{ id: string; name: string; energyCost: number; effects: any[] }>
): Promise<string> {
  try {
    const faction = player.chosenSin || "wrath";
    const systemPrompt = WHISPERER_SYSTEM_PROMPTS[faction] || WHISPERER_SYSTEM_PROMPTS.wrath;

    const playerContext = buildWhisperContext(player, context, hand);

    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: playerContext,
      maxOutputTokens: 40,
      temperature: 0.95,
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

// ---- Context Builders ----

function buildContextSummary(
  context: MatchContext,
  trigger: NarratorTrigger,
  triggerData?: Record<string, any>
): string {
  const alivePlayers = context.players.filter((p) => p.isAlive);
  const deadPlayers = context.players.filter((p) => !p.isAlive);

  let prompt = `GAME STATE: Round ${context.round}/${context.totalRounds}. `;
  prompt += `${alivePlayers.length} alive, ${deadPlayers.length} eliminated.\n`;

  // Player status
  prompt += "PLAYERS:\n";
  for (const p of context.players) {
    prompt += `- ${p.name} (${p.faction}): ${p.hp}/${p.maxHp} HP, ${p.energy} energy${!p.isAlive ? " [DEAD]" : ""}\n`;
  }

  // Rivalries
  if (context.rivalries.length > 0) {
    prompt += "\nRIVALRIES:\n";
    for (const r of context.rivalries.slice(0, 3)) {
      prompt += `- ${r.attacker} has attacked ${r.target} ${r.count} times\n`;
    }
  }

  // Behavioral tags
  const taggedPlayers = context.behaviors.filter((b) => b.tags.length > 0);
  if (taggedPlayers.length > 0) {
    prompt += "\nPLAYER BEHAVIORS:\n";
    for (const b of taggedPlayers) {
      prompt += `- ${b.username}: ${b.tags.join(", ")}\n`;
    }
  }

  // Trigger-specific context
  prompt += `\nTRIGGER: ${trigger}\n`;

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

function buildWhisperContext(
  player: PlayerState,
  context: MatchContext,
  hand: Array<{ id: string; name: string; energyCost: number; effects: any[] }>
): string {
  const hpPercent = Math.round((player.currentHp / player.maxHp) * 100);
  const opponents = context.players.filter(
    (p) => p.name !== player.username && p.isAlive
  );

  let prompt = `YOUR PLAYER: ${player.username} (${player.chosenSin})\n`;
  prompt += `HP: ${player.currentHp}/${player.maxHp} (${hpPercent}%), Energy: ${player.currentEnergy}\n`;
  prompt += `Round: ${context.round}/${context.totalRounds}\n\n`;

  prompt += "YOUR HAND:\n";
  for (const card of hand.slice(0, 5)) {
    prompt += `- ${card.name} (cost: ${card.energyCost})\n`;
  }

  prompt += "\nOPPONENTS:\n";
  for (const opp of opponents) {
    prompt += `- ${opp.name} (${opp.faction}): ${opp.hp} HP, ${opp.energy} energy\n`;
  }

  // Add rivalry info
  const playerBehavior = context.behaviors.find(
    (b) => b.playerId === player.id
  );
  if (playerBehavior) {
    const topAttacker = context.behaviors
      .filter((b) => b.attackTargets[player.id] >= 2)
      .sort(
        (a, b) =>
          (b.attackTargets[player.id] || 0) - (a.attackTargets[player.id] || 0)
      )[0];
    if (topAttacker) {
      prompt += `\n${topAttacker.username} has attacked you ${topAttacker.attackTargets[player.id]} times.`;
    }
  }

  prompt += "\n\nWhisper a temptation to this player about what to play this round.";
  return prompt;
}

// ---- Fallback Lines ----

function getFallbackLine(
  trigger: NarratorTrigger,
  context: MatchContext,
  triggerData?: Record<string, any>
): string {
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
      return line
        .replace("{player}", triggerData?.plays?.[0]?.playerName || "Someone")
        .replace("{card}", triggerData?.plays?.[0]?.cardName || "a card");
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

const DEFAULT_WHISPERS: Record<string, string[]> = {
  wrath: [
    "They hit you last round. Make them pay.",
    "Burn them all. Mercy is for the weak.",
    "Your fury is your weapon. Unleash it.",
  ],
  sloth: [
    "Why rush? Let them tire themselves out.",
    "Shield up. Patience wins wars.",
    "Doing nothing is an art form. Perfect it.",
  ],
  greed: [
    "Look at all that energy they're wasting. Take it.",
    "More. You always need more.",
    "Every resource they have should be yours.",
  ],
  envy: [
    "Look at their HP. That should be yours.",
    "Target the strongest. Tear them down.",
    "They don't deserve what they have.",
  ],
  pride: [
    "You are above them. Prove it.",
    "The crown is yours. Defend it.",
    "Show them what true power looks like.",
  ],
  lust: [
    "Make them fight each other. You just watch.",
    "Charm is deadlier than any blade.",
    "Let them destroy themselves for you.",
  ],
  gluttony: [
    "Consume. Devour. Grow stronger.",
    "Their loss is your gain. Literally.",
    "You're still hungry. Feed.",
  ],
};

function getDefaultWhisper(faction: string): string {
  const whispers = DEFAULT_WHISPERS[faction] || DEFAULT_WHISPERS.wrath;
  return whispers[Math.floor(Math.random() * whispers.length)];
}
