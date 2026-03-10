/**
 * Bot Engine - AI-controlled players for solo testing
 *
 * Bots have sassy names, auto-choose sins, and play cards
 * with basic strategic intelligence. They add a slight delay
 * to simulate "thinking" because even fake players deserve drama.
 */

import { getClientSupabase } from "../../../shared/supabaseClient";
import { getCardById, getDeckForSin, WRATH_CARDS, SLOTH_CARDS, GREED_CARDS, ENVY_CARDS } from "../../../shared/cardData";
import {
  SinType,
  HAND_SIZE,
  STARTING_HP,
  MAX_ENERGY,
  SLOTH_MAX_CARRYOVER,
  WRATH_OVERCHARGE_HP_COST,
  WRATH_OVERCHARGE_ENERGY_GAIN,
  GREED_AVARICE_COST_THRESHOLD,
  GREED_AVARICE_BONUS,
  ENVY_COVET_BONUS,
  calculateEffectiveValue,
  getBaseEnergyForRound,
} from "../../../shared/gameTypes";

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
// Bots use valid UUIDs with a recognizable prefix: b0700000-xxxx-4xxx-bxxx-xxxxxxxxxxxx
// The "b07" prefix ("BOT" in hex-speak) lets us identify bots while staying UUID-compliant.
function generateBotUUID(): string {
  const uuid = crypto.randomUUID();
  // Replace first 8 chars with b0700000 to mark as bot
  return `b0700000-${uuid.slice(9)}`;
}

// ─── Add Bot to Game ────────────────────────────────────────
export async function addBot(gameId: string): Promise<{ botId: string; botName: string }> {
  const sb = getClientSupabase();
  const botId = generateBotUUID();
  const botName = getRandomBotName();

  // Ensure bot player exists
  await sb.from("players").upsert({ id: botId, username: botName }, { onConflict: "id" });

  // Get current players to find next seat
  const { data: players } = await sb
    .from("game_players")
    .select("seat_index")
    .eq("game_id", gameId)
    .order("seat_index");

  const takenSeats = new Set((players || []).map((p) => p.seat_index));
  let seatIndex = 0;
  while (takenSeats.has(seatIndex)) seatIndex++;

  if (seatIndex >= 4) throw new Error("Game is full, genius. No room for more bots.");

  // Join the game
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

  // Get existing sin choices to try to balance across all 4 sins
  const { data: players } = await sb
    .from("game_players")
    .select("chosen_sin")
    .eq("game_id", gameId);

  const allSins: SinType[] = ["wrath", "sloth", "greed", "envy"];
  const sinCounts = allSins.map((s) => ({
    sin: s,
    count: (players || []).filter((p) => p.chosen_sin === s).length,
  }));

  // Pick the least-chosen sin, with randomness among ties
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

// ─── Bot Play Turn ──────────────────────────────────────────
export async function botPlayTurn(gameId: string, botId: string): Promise<{
  action: "play" | "pass";
  cardName?: string;
  narratorQuip?: string;
}> {
  const sb = getClientSupabase();

  // Get game state
  const { data: game } = await sb.from("games").select("*").eq("id", gameId).single();
  if (!game || game.status !== "active") return { action: "pass" };

  // Get bot player
  const { data: botPlayer } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .eq("player_id", botId)
    .single();

  if (!botPlayer || !botPlayer.is_alive) return { action: "pass" };

  // Get all alive players
  const { data: allPlayers } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .order("seat_index");

  if (!allPlayers) return { action: "pass" };

  const alivePlayers = allPlayers.filter((p) => p.is_alive);
  const currentTurnPlayer = alivePlayers[game.current_player_index % alivePlayers.length];
  if (currentTurnPlayer.player_id !== botId) return { action: "pass" };

  const hand: string[] = botPlayer.hand || [];
  const botEnergy = botPlayer.current_energy ?? 0;

  if (hand.length === 0) {
    // Pass and draw
    await drawCardForBot(botPlayer);
    await sb.from("game_log").insert({
      game_id: gameId,
      player_id: botPlayer.id,
      action_type: "pass",
      action_data: { unspentEnergy: botEnergy },
      round_number: game.current_round,
    });
    await advanceBotTurn(gameId);
    return { action: "pass" };
  }

  // Wrath bot: consider Overcharge if low on energy and has HP to spare
  if (botPlayer.chosen_sin === "wrath" && botEnergy < 2 && botPlayer.current_hp > WRATH_OVERCHARGE_HP_COST + 3) {
    const newHp = botPlayer.current_hp - WRATH_OVERCHARGE_HP_COST;
    const newEnergy = Math.min(botEnergy + WRATH_OVERCHARGE_ENERGY_GAIN, MAX_ENERGY);
    await sb.from("game_players").update({
      current_hp: newHp,
      is_alive: newHp > 0,
      current_energy: newEnergy,
      max_energy: Math.max(botPlayer.max_energy ?? 0, newEnergy),
    }).eq("id", botPlayer.id);
    await sb.from("game_log").insert({
      game_id: gameId,
      player_id: botPlayer.id,
      action_type: "overcharge",
      action_data: { hpCost: WRATH_OVERCHARGE_HP_COST, energyGained: WRATH_OVERCHARGE_ENERGY_GAIN },
      round_number: game.current_round,
    });
    // Update local reference
    botPlayer.current_energy = newEnergy;
    botPlayer.current_hp = newHp;
  }

  // Smart card selection (energy-aware)
  const cardToPlay = selectBestCard(hand, botPlayer, allPlayers, game.current_round);

  if (!cardToPlay) {
    await drawCardForBot(botPlayer);
    await sb.from("game_log").insert({
      game_id: gameId,
      player_id: botPlayer.id,
      action_type: "pass",
      action_data: { unspentEnergy: botPlayer.current_energy ?? 0 },
      round_number: game.current_round,
    });
    await advanceBotTurn(gameId);
    return { action: "pass" };
  }

  const card = getCardById(cardToPlay.cardId);
  if (!card) return { action: "pass" };

  // Find target
  const enemies = alivePlayers.filter((p) => p.player_id !== botId);
  const targetId = cardToPlay.targetId || (enemies.length > 0 ? selectBestTarget(enemies) : undefined);

  // Spend energy and update hand
  const energyAfterPlay = (botPlayer.current_energy ?? 0) - card.cost;
  const newHand = hand.filter((id) => id !== cardToPlay.cardId);
  const discard: string[] = botPlayer.discard_pile || [];
  discard.push(cardToPlay.cardId);
  await sb
    .from("game_players")
    .update({ hand: newHand, discard_pile: discard, current_energy: energyAfterPlay })
    .eq("id", botPlayer.id);

  // Greed AVARICE: playing a card that costs 3+ grants +1 bonus energy next turn
  if (botPlayer.chosen_sin === "greed" && card.cost >= GREED_AVARICE_COST_THRESHOLD) {
    const currentBonus = botPlayer.bonus_energy ?? 0;
    await sb
      .from("game_players")
      .update({ bonus_energy: currentBonus + GREED_AVARICE_BONUS })
      .eq("id", botPlayer.id);
  }

  // Resolve effects
  for (const effect of card.effects) {
    const effectiveValue = calculateEffectiveValue(effect.baseValue, game.current_round);
    const targets = resolveTargets(effect, botPlayer, allPlayers, targetId);

    for (const target of targets) {
      if (effect.duration > 0) {
        await sb.from("active_effects").insert({
          game_id: gameId,
          target_player_id: target.id,
          source_player_id: botPlayer.id,
          effect_type: effect.type,
          base_value: effect.baseValue,
          applied_at_round: game.current_round,
          duration_rounds: effect.duration,
          card_id: cardToPlay.cardId,
        });
      } else {
        await applyInstantEffect(effect.type, effectiveValue, target);
      }
    }
  }

  // Log
  await sb.from("game_log").insert({
    game_id: gameId,
    player_id: botPlayer.id,
    action_type: "play_card",
    action_data: { cardId: cardToPlay.cardId, targetPlayerId: targetId, energySpent: card.cost, energyRemaining: energyAfterPlay },
    round_number: game.current_round,
  });

  await advanceBotTurn(gameId);

  return {
    action: "play",
    cardName: card.name,
    narratorQuip: card.narratorQuip,
  };
}

// ─── Smart Card Selection (Energy-Aware) ────────────────────
function selectBestCard(
  hand: string[],
  bot: any,
  allPlayers: any[],
  currentRound: number
): { cardId: string; targetId?: string } | null {
  const botEnergy = bot.current_energy ?? 0;
  // Only consider cards the bot can afford
  const cards = hand.map((id) => getCardById(id)).filter((c) => c && c.cost <= botEnergy);
  if (cards.length === 0) return null;

  const botHpPercent = bot.current_hp / bot.max_hp;
  const enemies = allPlayers.filter((p: any) => p.is_alive && p.player_id !== bot.player_id);

  // Priority: heal if low HP
  if (botHpPercent < 0.4) {
    const healCard = cards.find((c) => c!.effects.some((e) => e.type === "heal"));
    if (healCard) return { cardId: healCard.id };
  }

  // Priority: shield if mid HP
  if (botHpPercent < 0.6) {
    const shieldCard = cards.find((c) => c!.effects.some((e) => e.type === "shield"));
    if (shieldCard) return { cardId: shieldCard.id };
  }

  // Priority: damage the weakest enemy (pick best damage-per-cost ratio)
  const damageCards = cards.filter((c) => c!.effects.some((e) => e.type === "damage" && e.target !== "self"));
  if (damageCards.length > 0) {
    const best = damageCards.sort((a, b) => {
      const aDmg = a!.effects.reduce((sum, e) => sum + (e.type === "damage" && e.target !== "self" ? e.baseValue : 0), 0);
      const bDmg = b!.effects.reduce((sum, e) => sum + (e.type === "damage" && e.target !== "self" ? e.baseValue : 0), 0);
      // Prefer higher damage, break ties by lower cost
      if (bDmg !== aDmg) return bDmg - aDmg;
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
  // Target the player with lowest HP
  const sorted = [...enemies].sort((a, b) => a.current_hp - b.current_hp);
  return sorted[0]?.player_id;
}

// ─── Resolve Targets (same logic as main engine) ────────────
function resolveTargets(effect: any, source: any, allPlayers: any[], targetPlayerId?: string): any[] {
  const alive = allPlayers.filter((p) => p.is_alive);
  switch (effect.target) {
    case "self":
      return [source];
    case "single_enemy":
      if (targetPlayerId) {
        const target = alive.find((p) => p.player_id === targetPlayerId);
        return target ? [target] : [];
      }
      return alive.filter((p) => p.player_id !== source.player_id).slice(0, 1);
    case "all_enemies":
      return alive.filter((p) => p.player_id !== source.player_id);
    case "random_enemy": {
      const enemies = alive.filter((p) => p.player_id !== source.player_id);
      return enemies.length > 0 ? [enemies[Math.floor(Math.random() * enemies.length)]] : [];
    }
    default:
      return [];
  }
}

// ─── Apply Instant Effect ───────────────────────────────────
async function applyInstantEffect(type: string, value: number, target: any): Promise<void> {
  const sb = getClientSupabase();
  switch (type) {
    case "damage": {
      const newHp = Math.max(0, Math.round(target.current_hp - value));
      await sb.from("game_players").update({ current_hp: newHp, is_alive: newHp > 0 }).eq("id", target.id);
      break;
    }
    case "heal": {
      const newHp = Math.min(target.max_hp, Math.round(target.current_hp + value));
      await sb.from("game_players").update({ current_hp: newHp }).eq("id", target.id);
      break;
    }
  }
}

// ─── Draw Card for Bot ──────────────────────────────────────
async function drawCardForBot(player: any): Promise<void> {
  const sb = getClientSupabase();
  let deck: string[] = player.deck || [];
  const hand: string[] = player.hand || [];
  let discard: string[] = player.discard_pile || [];

  if (deck.length === 0 && discard.length > 0) {
    deck = shuffleDeck(discard);
    discard = [];
  }

  if (deck.length > 0) {
    const drawn = deck.shift()!;
    hand.push(drawn);
    await sb.from("game_players").update({ hand, deck, discard_pile: discard }).eq("id", player.id);
  }
}

// ─── Advance Turn (same logic as main engine) ───────────────
async function advanceBotTurn(gameId: string): Promise<void> {
  const sb = getClientSupabase();
  const { data: game } = await sb.from("games").select("*").eq("id", gameId).single();
  if (!game) return;

  const { data: allPlayers } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .order("seat_index");

  if (!allPlayers) return;
  const alivePlayers = allPlayers.filter((p) => p.is_alive);

  if (alivePlayers.length <= 1) {
    const winner = alivePlayers[0];
    await sb.from("games").update({
      status: "finished",
      winner_id: winner?.player_id || null,
      finished_at: new Date().toISOString(),
    }).eq("id", gameId);
    return;
  }

  let nextIndex = (game.current_player_index + 1) % alivePlayers.length;
  let newRound = game.current_round;

  if (nextIndex === 0) {
    newRound = Math.min(game.current_round + 1, 10);
    // Resolve persistent effects
    await resolveActiveEffects(gameId, newRound);
    // Refresh energy and draw for each alive player
    for (const p of alivePlayers) {
      const { data: freshPlayer } = await sb.from("game_players").select("*").eq("id", p.id).single();
      if (freshPlayer && freshPlayer.is_alive) {
        await refreshBotEnergy(freshPlayer, newRound);
        await drawCardForBot(freshPlayer);
      }
    }
  }

  await sb.from("games").update({ current_player_index: nextIndex, current_round: newRound }).eq("id", gameId);
}

// ─── Resolve Active Effects ─────────────────────────────────
async function resolveActiveEffects(gameId: string, currentRound: number): Promise<void> {
  const sb = getClientSupabase();
  const { data: effects } = await sb.from("active_effects").select("*").eq("game_id", gameId);
  if (!effects) return;

  for (const effect of effects) {
    const roundsActive = currentRound - effect.applied_at_round;
    if (roundsActive > effect.duration_rounds) {
      await sb.from("active_effects").delete().eq("id", effect.id);
      continue;
    }
    const effectiveValue = calculateEffectiveValue(effect.base_value, currentRound);
    const { data: target } = await sb.from("game_players").select("*").eq("id", effect.target_player_id).single();
    if (!target || !target.is_alive) {
      await sb.from("active_effects").delete().eq("id", effect.id);
      continue;
    }
    switch (effect.effect_type) {
      case "damage":
        await applyInstantEffect("damage", effectiveValue, target);
        break;
      case "heal":
        await applyInstantEffect("heal", effectiveValue, target);
        break;
      case "debuff":
        await applyInstantEffect("damage", Math.round(effectiveValue / 2), target);
        break;
    }
  }
}

// ─── Refresh Energy for Bot at Round Start ──────────────────
async function refreshBotEnergy(player: any, newRound: number): Promise<void> {
  const sb = getClientSupabase();
  const baseEnergy = getBaseEnergyForRound(newRound);
  const currentUnspent = player.current_energy ?? 0;
  const chosenSin = player.chosen_sin as string;

  let bonusEnergy = 0;
  if (chosenSin === "sloth" && currentUnspent > 0) {
    bonusEnergy = Math.min(currentUnspent, SLOTH_MAX_CARRYOVER);
  } else if (chosenSin === "greed") {
    // Greed AVARICE: bonus accumulated from playing 3+ cost cards
    bonusEnergy = player.bonus_energy ?? 0;
  } else if (chosenSin === "envy") {
    // Envy COVET: if any opponent has more HP, gain +1 bonus energy
    const { data: allPlayers } = await sb
      .from("game_players")
      .select("current_hp, is_alive, player_id")
      .eq("game_id", player.game_id);
    const anyOpponentHigherHp = (allPlayers || []).some(
      (p: any) => p.player_id !== player.player_id && p.is_alive && p.current_hp > player.current_hp
    );
    if (anyOpponentHigherHp) {
      bonusEnergy = ENVY_COVET_BONUS;
    }
  }

  const totalEnergy = Math.min(baseEnergy + bonusEnergy, MAX_ENERGY);
  await sb.from("game_players").update({
    current_energy: totalEnergy,
    max_energy: totalEnergy,
    bonus_energy: bonusEnergy,
  }).eq("id", player.id);
}

// ─── Check if Player is a Bot ───────────────────────────────
// Bots are identified by the "b0700000" UUID prefix.
// Also supports legacy "bot-" prefix for backward compatibility.
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
