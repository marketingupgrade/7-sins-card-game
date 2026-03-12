/**
 * Bot Engine (v5) - AI-controlled players for solo testing
 *
 * Simultaneous lock-in system: bots select cards and call lockInCards()
 * from the client gameEngine. No duplicate effect resolution code.
 * Resolution happens centrally in gameEngine.resolveLockedPlays().
 */

import { getClientSupabase } from "../../../shared/supabaseClient";
import { getCardById, getDeckForSin } from "../../../shared/cardData";
import {
  SinType,
  HAND_SIZE,
  STARTING_HP,
  MAX_ENERGY,
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
  // Also check games.locked_plays
  const gameLocked = (game.locked_plays || []) as any[];
  if (gameLocked.some((lp: any) => lp.playerId === botId)) return { action: "pass" };

  const { data: allPlayers } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .order("seat_index");

  if (!allPlayers) return { action: "pass" };

  // ─── Select cards to lock in ─────────────────────────────────
  let currentHand: string[] = [...(botPlayer.hand || [])];
  let currentEnergy = botPlayer.current_energy ?? 0;
  const selections: Array<{ cardId: string; targetPlayerId?: string }> = [];
  const MAX_CARDS_PER_TURN = 5;
  let lastCardName: string | undefined;

  for (let i = 0; i < MAX_CARDS_PER_TURN; i++) {
    if (currentHand.length === 0) break;

    const botState = { ...botPlayer, current_energy: currentEnergy, hand: currentHand };
    const cardToPlay = selectBestCard(currentHand, botState, allPlayers, game.current_round);
    if (!cardToPlay) break;

    const card = getCardById(cardToPlay.cardId);
    if (!card) break;

    const enemies = allPlayers.filter((p: any) => p.is_alive && p.player_id !== botId);
    const targetId = cardToPlay.targetId || (enemies.length > 0 ? selectBestTarget(enemies) : undefined);

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
    };
  } catch (err) {
    console.error("Bot lock-in failed:", err);
    // Fallback: lock in with 0 cards (pass)
    try {
      await lockInCards(gameId, botId, []);
    } catch { /* already locked in or game state changed */ }
    return { action: "pass" };
  }
}

// ─── Smart Card Selection (v4 — compound-only) ─────────────
function selectBestCard(
  hand: string[],
  bot: any,
  allPlayers: any[],
  currentRound: number
): { cardId: string; targetId?: string } | null {
  const botEnergy = bot.current_energy ?? 0;
  const cards = hand.map((id) => getCardById(id)).filter((c) => c && c.cost <= botEnergy);
  if (cards.length === 0) return null;

  const botHpPercent = bot.current_hp / (bot.max_hp ?? STARTING_HP);
  const enemies = allPlayers.filter((p: any) => p.is_alive && p.player_id !== bot.player_id);

  // Priority: heal if low HP
  if (botHpPercent < 0.4) {
    const healCard = cards.find((c) => c!.effects.some((e) =>
      ["heal_gain", "heal_steal"].includes(e.type)
    ));
    if (healCard) return { cardId: healCard.id };
  }

  // Priority: shield if mid HP
  if (botHpPercent < 0.6) {
    const shieldCard = cards.find((c) => c!.effects.some((e) =>
      ["shield_gain", "shield_steal"].includes(e.type)
    ));
    if (shieldCard) return { cardId: shieldCard.id };
  }

  // Priority: prefer aggressive pattern cards early (more explosive growth)
  if (currentRound <= 6) {
    const aggressiveDmg = cards.filter((c) =>
      c!.compoundPattern === "aggressive" &&
      c!.effects.some((e) => e.type === "damage" && e.targetMode !== "self")
    );
    if (aggressiveDmg.length > 0) {
      const best = aggressiveDmg.sort((a, b) => {
        const aDmg = a!.effects.reduce((sum, e) => sum + (e.type === "damage" ? e.baseValue * e.duration : 0), 0);
        const bDmg = b!.effects.reduce((sum, e) => sum + (e.type === "damage" ? e.baseValue * e.duration : 0), 0);
        return bDmg - aDmg;
      })[0];
      if (best) return { cardId: best.id };
    }
  }

  // Priority: damage cards (sorted by total expected value)
  const damageCards = cards.filter((c) => c!.effects.some((e) =>
    e.type === "damage" && e.targetMode !== "self"
  ));
  if (damageCards.length > 0) {
    const best = damageCards.sort((a, b) => {
      const aTotal = a!.effects.reduce((sum, e) => {
        if (e.type === "damage" && e.targetMode !== "self") {
          return sum + e.baseValue * e.duration;
        }
        return sum;
      }, 0);
      const bTotal = b!.effects.reduce((sum, e) => {
        if (e.type === "damage" && e.targetMode !== "self") {
          return sum + e.baseValue * e.duration;
        }
        return sum;
      }, 0);
      if (bTotal !== aTotal) return bTotal - aTotal;
      return (a!.cost || 0) - (b!.cost || 0);
    })[0];
    if (best) return { cardId: best.id };
  }

  // Play cheapest affordable card
  const sorted = [...cards].sort((a, b) => (a!.cost || 0) - (b!.cost || 0));
  return sorted[0] ? { cardId: sorted[0].id } : null;
}

// ─── Select Best Target ─────────────────────────────────────
function selectBestTarget(enemies: any[]): string | undefined {
  if (enemies.length === 0) return undefined;
  const sorted = [...enemies].sort((a, b) => a.current_hp - b.current_hp);
  return sorted[0]?.player_id;
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
