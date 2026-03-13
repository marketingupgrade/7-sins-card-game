/**
 * Bot Engine (v6) - Game-Theoretic AI with Distinct Personalities
 *
 * Key improvements over v5:
 * 1. Threat-based targeting (not just lowest HP)
 * 2. Anti-gang-up fairness constraint (spread damage across targets)
 * 3. Distinct bot personalities (aggressive, defensive, opportunistic, balanced)
 * 4. Sin-aware card selection (leverage faction strengths)
 * 5. Simultaneous lock-in via lockInCards() — no duplicate resolution
 */

import { getClientSupabase } from "../../../shared/supabaseClient";
import { getCardById, getDeckForSin } from "../../../shared/cardData";
import {
  SinType,
  HAND_SIZE,
  STARTING_HP,
  MAX_ENERGY,
  type CardDefinition,
  type CardEffect,
  type LockedPlay,
  type PlayerState,
} from "../../../shared/gameTypes";
import { lockInCards } from "./gameEngine";

// ─── Bot Names (sassy and cynical) ──────────────────────────
const BOT_NAMES = [
  "NotAHuman_420",
  "DefinitelyReal",
  "BeepBoop_lol",
  "SkynetJr",
  "NPC_Energy",
  "CtrlAltDefeat",
  "Error404Soul",
  "BotOfDuty",
  "SiliconSinner",
  "RageQuitBot",
  "LazyAlgorithm",
  "ChaosModule",
  "GlitchDemon",
  "PixelPeasant",
  "BufferOverlord",
];

function getRandomBotName(): string {
  return BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
}

// ─── Shuffle Helper ─────────────────────────────────────────
function shuffleDeck(cardIds: string[]): string[] {
  const deck = [...cardIds];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// ─── Bot ID Generation ──────────────────────────────────────
function generateBotUUID(): string {
  const uuid = crypto.randomUUID();
  return `b0700000-${uuid.slice(9)}`;
}

// ─── Bot Personality Types ──────────────────────────────────
type BotPersonality = "aggressive" | "defensive" | "opportunistic" | "balanced";

/**
 * Deterministic personality based on bot ID hash.
 * Each bot gets a consistent personality across the whole game.
 */
function getBotPersonality(botId: string): BotPersonality {
  const hash = botId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const personalities: BotPersonality[] = ["aggressive", "defensive", "opportunistic", "balanced"];
  return personalities[hash % personalities.length];
}

// ─── Threat Assessment ──────────────────────────────────────
interface ThreatScore {
  playerId: string;
  score: number;
  isHuman: boolean;
  hpPercent: number;
  activeEffects: number;
}

/**
 * Calculate threat score for each enemy.
 * Higher score = more threatening = more likely to be targeted.
 * 
 * Factors:
 * - HP percentage (higher HP = more threatening, they'll survive longer)
 * - Active compound effects on others (dealing ongoing damage = threatening)
 * - Energy level (more energy = can play more cards next turn)
 * - Sin type (some sins are inherently more threatening)
 */
function assessThreats(
  botId: string,
  enemies: any[],
  allPlayers: any[],
  currentRound: number
): ThreatScore[] {
  return enemies.map((enemy) => {
    const hpPercent = enemy.current_hp / (enemy.max_hp ?? STARTING_HP);
    const energy = enemy.current_energy ?? 0;
    const isHuman = !isBot(enemy.player_id);

    // Base threat: HP percentage (healthy enemies are more threatening)
    let score = hpPercent * 40;

    // Energy threat: more energy = can play more cards
    score += (energy / MAX_ENERGY) * 15;

    // Round scaling: in late game, high-HP enemies are much more threatening
    if (currentRound > 10) {
      score += hpPercent * 20;
    }

    // Sin-based threat multiplier
    const sinThreat: Record<string, number> = {
      wrath: 1.2,   // High burst damage
      envy: 1.15,   // Steals and disrupts
      greed: 1.1,   // Resource advantage
      pride: 1.1,   // Strong buffs
      lust: 1.05,   // Moderate threat
      gluttony: 1.0, // Sustain-focused
      sloth: 0.95,  // Slow starter
    };
    const enemySin = enemy.chosen_sin as string;
    score *= sinThreat[enemySin] ?? 1.0;

    // Active effects: count compound effects this enemy has placed on others
    // (approximation: enemies with more active effects are doing more damage)
    const activeEffects = (enemy.active_effects?.length ?? 0);
    score += activeEffects * 5;

    return { playerId: enemy.player_id, score, isHuman, hpPercent, activeEffects };
  });
}

// ─── Anti-Gang-Up Target Selection ──────────────────────────
/**
 * Select target with anti-gang-up fairness.
 * 
 * Instead of always targeting the "best" target, we use a weighted
 * random selection based on threat scores. This naturally spreads
 * damage across targets while still preferring higher-threat enemies.
 * 
 * Additional fairness rules:
 * - If the human player has been targeted by other bots this round,
 *   reduce their selection weight
 * - Personality affects target preference
 */
function selectTargetWithFairness(
  threats: ThreatScore[],
  personality: BotPersonality,
  botId: string,
  gameLocked: any[]
): string | undefined {
  if (threats.length === 0) return undefined;
  if (threats.length === 1) return threats[0].playerId;

  // Count how many times each target has been targeted by OTHER bots this round
  const targetCounts: Record<string, number> = {};
  for (const lp of gameLocked) {
    if (lp.playerId !== botId && isBot(lp.playerId)) {
      for (const sel of (lp.selections || [])) {
        const tid = sel.targetPlayerId;
        if (tid) {
          targetCounts[tid] = (targetCounts[tid] || 0) + 1;
        }
      }
    }
  }

  // Calculate weights based on threat score + personality + fairness
  const weights = threats.map((t) => {
    let weight = t.score;

    // ── Personality modifiers ──
    switch (personality) {
      case "aggressive":
        // Prefer high-HP targets (finish the strong ones)
        weight *= (1 + t.hpPercent * 0.3);
        break;
      case "defensive":
        // Prefer low-HP targets (eliminate threats quickly)
        weight *= (1 + (1 - t.hpPercent) * 0.3);
        break;
      case "opportunistic":
        // Prefer whoever has the most active effects (they're committed)
        weight *= (1 + t.activeEffects * 0.1);
        break;
      case "balanced":
        // No strong preference — use base threat score
        break;
    }

    // ── Anti-gang-up: reduce weight for already-targeted players ──
    const timesTargeted = targetCounts[t.playerId] || 0;
    if (timesTargeted > 0) {
      // Each existing targeting reduces weight by 40%
      weight *= Math.pow(0.6, timesTargeted);
    }

    // ── Extra anti-gang-up for human players ──
    // Bots shouldn't disproportionately target the human
    if (t.isHuman && timesTargeted > 0) {
      weight *= 0.5; // Additional 50% reduction for humans already targeted
    }

    return Math.max(weight, 0.1); // Minimum weight so no one is completely ignored
  });

  // Weighted random selection
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * totalWeight;
  for (let i = 0; i < threats.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return threats[i].playerId;
  }
  return threats[threats.length - 1].playerId;
}

// ─── Add Bot to Game ────────────────────────────────────────
export async function addBot(gameId: string): Promise<{ botId: string; botName: string }> {
  const sb = getClientSupabase();
  const botId = generateBotUUID();
  const botName = getRandomBotName();

  await sb.from("players").upsert({ id: botId, username: botName }, { onConflict: "id" });

  const { data: players } = await sb
    .from("game_players")
    .select("seat_index")
    .eq("game_id", gameId)
    .order("seat_index");

  const takenSeats = new Set((players || []).map((p) => p.seat_index));
  let seatIndex = 0;
  while (takenSeats.has(seatIndex)) seatIndex++;

  if (seatIndex >= 4) throw new Error("Game is full, genius. No room for more bots.");

  const { error } = await sb.from("game_players").insert({
    game_id: gameId,
    player_id: botId,
    seat_index: seatIndex,
  });

  if (error) throw new Error(`Bot failed to join: ${error.message}`);

  return { botId, botName };
}

// ─── Bot Choose Sin ─────────────────────────────────────────
export async function botChooseSin(gameId: string, botId: string): Promise<SinType> {
  const sb = getClientSupabase();

  const { data: players } = await sb
    .from("game_players")
    .select("chosen_sin")
    .eq("game_id", gameId);

  const allSins: SinType[] = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"];
  const sinCounts = allSins.map((s) => ({
    sin: s,
    count: (players || []).filter((p) => p.chosen_sin === s).length,
  }));

  const minCount = Math.min(...sinCounts.map((s) => s.count));
  const leastChosen = sinCounts.filter((s) => s.count === minCount);
  const sin: SinType = leastChosen[Math.floor(Math.random() * leastChosen.length)].sin;

  await sb
    .from("game_players")
    .update({ chosen_sin: sin })
    .eq("game_id", gameId)
    .eq("player_id", botId);

  return sin;
}

// ─── Bot Play Turn (Simultaneous Lock-In) ─────────────────────
/**
 * Bot selects cards to lock in during the selection phase.
 * Uses the same lockInCards() function as human players.
 * No direct effect resolution — that happens in resolveLockedPlays.
 */
export async function botPlayTurn(gameId: string, botId: string): Promise<{
  action: "play" | "pass";
  cardName?: string;
  narratorQuip?: string;
  cardsPlayed?: number;
  resolvedPlays?: LockedPlay[];
  resolutionPlayers?: PlayerState[];
}> {
  const sb = getClientSupabase();

  const { data: game } = await sb.from("games").select("*").eq("id", gameId).single();
  if (!game || game.status !== "active") return { action: "pass" };
  if (game.turn_phase !== "selection") return { action: "pass" };

  const { data: botPlayer } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .eq("player_id", botId)
    .single();

  if (!botPlayer || !botPlayer.is_alive) return { action: "pass" };

  // Check if bot already locked in this round
  const existingLocked = botPlayer.locked_cards || [];
  if (Array.isArray(existingLocked) && existingLocked.length > 0) return { action: "pass" };
  const gameLocked = (game.locked_plays || []) as any[];
  if (gameLocked.some((lp: any) => lp.playerId === botId)) return { action: "pass" };

  const { data: allPlayers } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .order("seat_index");

  if (!allPlayers) return { action: "pass" };

  const personality = getBotPersonality(botId);
  const enemies = allPlayers.filter((p: any) => p.is_alive && p.player_id !== botId);
  const threats = assessThreats(botId, enemies, allPlayers, game.current_round);

  // ─── Select cards to lock in ─────────────────────────────────
  let currentHand: string[] = [...(botPlayer.hand || [])];
  let currentEnergy = botPlayer.current_energy ?? 0;
  const selections: Array<{ cardId: string; targetPlayerId?: string }> = [];
  const MAX_CARDS_PER_TURN = 5;
  let lastCardName: string | undefined;

  for (let i = 0; i < MAX_CARDS_PER_TURN; i++) {
    if (currentHand.length === 0) break;

    const botState = { ...botPlayer, current_energy: currentEnergy, hand: currentHand };
    const cardToPlay = selectBestCard(currentHand, botState, allPlayers, game.current_round, personality);
    if (!cardToPlay) break;

    const card = getCardById(cardToPlay.cardId);
    if (!card) break;

    // Use game-theoretic target selection
    const targetId = cardToPlay.targetId || selectTargetWithFairness(threats, personality, botId, gameLocked);

    selections.push({ cardId: cardToPlay.cardId, targetPlayerId: targetId });
    currentHand = currentHand.filter((id) => id !== cardToPlay.cardId);
    currentEnergy -= card.cost;
    lastCardName = card.name;
  }

  // Lock in the selections (or pass with 0 cards)
  try {
    const result = await lockInCards(gameId, botId, selections);
    return {
      action: selections.length > 0 ? "play" : "pass",
      cardName: lastCardName,
      narratorQuip: result.narratorQuip,
      cardsPlayed: selections.length,
      resolvedPlays: result.resolvedPlays,
      resolutionPlayers: result.resolutionPlayers,
    };
  } catch (err) {
    console.error("Bot lock-in failed:", err);
    try {
      await lockInCards(gameId, botId, []);
    } catch { /* already locked in or game state changed */ }
    return { action: "pass" };
  }
}

// ─── Smart Card Selection (v6 — personality-aware) ──────────
/**
 * Card selection now considers bot personality:
 * - Aggressive: prioritize damage, play expensive cards early
 * - Defensive: prioritize heals/shields, conserve energy
 * - Opportunistic: play compound cards early, burst damage late
 * - Balanced: standard priority (heal if low, shield if mid, damage otherwise)
 */
function selectBestCard(
  hand: string[],
  bot: any,
  allPlayers: any[],
  currentRound: number,
  personality: BotPersonality
): { cardId: string; targetId?: string } | null {
  const botEnergy = bot.current_energy ?? 0;
  const cards = hand
    .map((id) => getCardById(id))
    .filter((c): c is CardDefinition => c !== undefined && c.cost <= botEnergy);
  if (cards.length === 0) return null;

  const botHpPercent = bot.current_hp / (bot.max_hp ?? STARTING_HP);

  // ── Universal: heal if critically low HP (regardless of personality) ──
  if (botHpPercent < 0.25) {
    const healCard = cards.find((c) =>
      c.effects.some((e) => ["heal_gain", "heal_steal"].includes(e.type))
    );
    if (healCard) return { cardId: healCard.id };
  }

  // ── Personality-specific card selection ──
  switch (personality) {
    case "aggressive":
      return selectAggressive(cards, botHpPercent, currentRound);
    case "defensive":
      return selectDefensive(cards, botHpPercent, currentRound);
    case "opportunistic":
      return selectOpportunistic(cards, botHpPercent, currentRound);
    case "balanced":
    default:
      return selectBalanced(cards, botHpPercent, currentRound);
  }
}

function selectAggressive(
  cards: CardDefinition[],
  botHpPercent: number,
  currentRound: number
): { cardId: string } | null {
  // Aggressive: always prioritize damage, play the most expensive card possible
  const damageCards = cards
    .filter((c) => c.effects.some((e) => e.type === "damage" && e.targetMode !== "self"))
    .sort((a, b) => {
      const aDmg = totalDamageEV(a);
      const bDmg = totalDamageEV(b);
      return bDmg - aDmg;
    });

  if (damageCards.length > 0) return { cardId: damageCards[0].id };

  // Fallback: any card
  return { cardId: cards[0].id };
}

function selectDefensive(
  cards: CardDefinition[],
  botHpPercent: number,
  currentRound: number
): { cardId: string } | null {
  // Defensive: prioritize shields and heals, only attack when healthy
  if (botHpPercent < 0.6) {
    const healCard = cards.find((c) =>
      c.effects.some((e) => ["heal_gain", "heal_steal"].includes(e.type))
    );
    if (healCard) return { cardId: healCard.id };
  }

  if (botHpPercent < 0.75) {
    const shieldCard = cards.find((c) =>
      c.effects.some((e) => ["shield_gain", "shield_steal"].includes(e.type))
    );
    if (shieldCard) return { cardId: shieldCard.id };
  }

  // When healthy, play compound damage for long-term pressure
  const compoundDmg = cards.filter((c) =>
    c.compoundPattern !== undefined &&
    c.effects.some((e) => e.type === "damage" && e.targetMode !== "self")
  );
  if (compoundDmg.length > 0) {
    return { cardId: compoundDmg.sort((a, b) => totalDamageEV(b) - totalDamageEV(a))[0].id };
  }

  // Fallback: cheapest damage card
  const dmgCards = cards
    .filter((c) => c.effects.some((e) => e.type === "damage" && e.targetMode !== "self"))
    .sort((a, b) => a.cost - b.cost);
  if (dmgCards.length > 0) return { cardId: dmgCards[0].id };

  return { cardId: cards[0].id };
}

function selectOpportunistic(
  cards: CardDefinition[],
  botHpPercent: number,
  currentRound: number
): { cardId: string } | null {
  // Opportunistic: play compound cards early, burst damage in late game
  if (currentRound <= 8) {
    // Early game: invest in compound effects
    const compoundCards = cards.filter((c) => c.compoundPattern !== undefined);
    if (compoundCards.length > 0) {
      const best = compoundCards.sort((a, b) => totalDamageEV(b) - totalDamageEV(a))[0];
      return { cardId: best.id };
    }
  } else {
    // Late game: play highest immediate damage
    const burstCards = cards
      .filter((c) =>
        c.compoundPattern === undefined &&
        c.effects.some((e) => e.type === "damage" && e.targetMode !== "self")
      )
      .sort((a, b) => totalDamageEV(b) - totalDamageEV(a));
    if (burstCards.length > 0) return { cardId: burstCards[0].id };
  }

  // Heal if needed
  if (botHpPercent < 0.5) {
    const healCard = cards.find((c) =>
      c.effects.some((e) => ["heal_gain", "heal_steal"].includes(e.type))
    );
    if (healCard) return { cardId: healCard.id };
  }

  // Fallback
  const dmgCards = cards
    .filter((c) => c.effects.some((e) => e.type === "damage" && e.targetMode !== "self"))
    .sort((a, b) => totalDamageEV(b) - totalDamageEV(a));
  if (dmgCards.length > 0) return { cardId: dmgCards[0].id };

  return { cardId: cards[0].id };
}

function selectBalanced(
  cards: CardDefinition[],
  botHpPercent: number,
  currentRound: number
): { cardId: string } | null {
  // Balanced: standard priority — heal if low, shield if mid, damage otherwise
  if (botHpPercent < 0.4) {
    const healCard = cards.find((c) =>
      c.effects.some((e) => ["heal_gain", "heal_steal"].includes(e.type))
    );
    if (healCard) return { cardId: healCard.id };
  }

  if (botHpPercent < 0.6) {
    const shieldCard = cards.find((c) =>
      c.effects.some((e) => ["shield_gain", "shield_steal"].includes(e.type))
    );
    if (shieldCard) return { cardId: shieldCard.id };
  }

  // Prefer aggressive pattern cards early
  if (currentRound <= 6) {
    const aggressiveDmg = cards.filter((c) =>
      c.compoundPattern === "aggressive" &&
      c.effects.some((e) => e.type === "damage" && e.targetMode !== "self")
    );
    if (aggressiveDmg.length > 0) {
      const best = aggressiveDmg.sort((a, b) => totalDamageEV(b) - totalDamageEV(a))[0];
      return { cardId: best.id };
    }
  }

  // Damage cards sorted by EV
  const damageCards = cards
    .filter((c) => c.effects.some((e) => e.type === "damage" && e.targetMode !== "self"))
    .sort((a, b) => {
      const diff = totalDamageEV(b) - totalDamageEV(a);
      if (diff !== 0) return diff;
      return a.cost - b.cost;
    });
  if (damageCards.length > 0) return { cardId: damageCards[0].id };

  // Play cheapest affordable card
  const sorted = [...cards].sort((a, b) => a.cost - b.cost);
  return { cardId: sorted[0].id };
}

// ─── Damage EV Helper ───────────────────────────────────────
function totalDamageEV(card: CardDefinition): number {
  return card.effects.reduce((sum, e) => {
    if (e.type === "damage" && e.targetMode !== "self") {
      return sum + e.baseValue * e.duration;
    }
    return sum;
  }, 0);
}

// ─── Check if Player is a Bot ───────────────────────────────
export function isBot(playerId: string): boolean {
  return playerId.startsWith("b0700000-") || playerId.startsWith("bot-");
}

// ─── Get All Bot IDs in a Game ──────────────────────────────
export async function getBotIds(gameId: string): Promise<string[]> {
  const sb = getClientSupabase();
  const { data: players } = await sb
    .from("game_players")
    .select("player_id")
    .eq("game_id", gameId);

  return (players || []).filter((p) => isBot(p.player_id)).map((p) => p.player_id);
}
