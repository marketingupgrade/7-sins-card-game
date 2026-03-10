/**
 * Client-Side Game Engine
 *
 * All game logic runs in the browser and calls Supabase directly.
 * No server-side code needed — perfect for Vercel static deployment.
 *
 * Uses the anon key with RLS policies for security.
 * Game state mutations go through Supabase for real-time sync.
 */

import { getClientSupabase } from "../../../shared/supabaseClient";
import { getCardById, getDeckForSin } from "../../../shared/cardData";
import {
  ActiveEffect,
  calculateEffectiveValue,
  CardEffect,
  GameState,
  HAND_SIZE,
  MAX_ROUNDS,
  MAX_ENERGY,
  PlayerState,
  SinType,
  STARTING_HP,
  STARTING_ENERGY,
  ENERGY_PER_ROUND,
  SLOTH_MAX_CARRYOVER,
  WRATH_OVERCHARGE_HP_COST,
  WRATH_OVERCHARGE_ENERGY_GAIN,
  GREED_AVARICE_COST_THRESHOLD,
  GREED_AVARICE_BONUS,
  ENVY_COVET_BONUS,
  getBaseEnergyForRound,
} from "../../../shared/gameTypes";

// ─── Room Code Generation ────────────────────────────────────
function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ─── Deck Shuffling ──────────────────────────────────────────
function shuffleDeck(cardIds: string[]): string[] {
  const deck = [...cardIds];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// ─── Ensure Player Exists ────────────────────────────────────
async function ensurePlayer(playerId: string, username: string): Promise<void> {
  const sb = getClientSupabase();
  const { data: existing } = await sb.from("players").select("id").eq("id", playerId).single();

  if (!existing) {
    await sb.from("players").upsert({ id: playerId, username }, { onConflict: "id" });
  }
}

// ─── Create Game ─────────────────────────────────────────────
export async function createGame(
  playerId: string,
  username: string
): Promise<{ gameId: string; roomCode: string }> {
  const sb = getClientSupabase();
  const roomCode = generateRoomCode();

  // Create the game
  const { data: game, error: gameError } = await sb
    .from("games")
    .insert({ room_code: roomCode, status: "lobby" })
    .select("id")
    .single();

  if (gameError || !game) throw new Error(`Failed to create game: ${gameError?.message}`);

  // Ensure player exists
  await ensurePlayer(playerId, username);

  // Add creator as first player
  const { error: joinError } = await sb.from("game_players").insert({
    game_id: game.id,
    player_id: playerId,
    seat_index: 0,
  });

  if (joinError) throw new Error(`Failed to join game: ${joinError.message}`);

  // Log creation
  await sb.from("game_log").insert({
    game_id: game.id,
    action_type: "game_created",
    action_data: { creator: username },
    round_number: 0,
  });

  return { gameId: game.id, roomCode };
}

// ─── Join Game ───────────────────────────────────────────────
export async function joinGame(
  roomCode: string,
  playerId: string,
  username: string
): Promise<{ gameId: string; seatIndex: number }> {
  const sb = getClientSupabase();

  // Find the game
  const { data: game, error: gameError } = await sb
    .from("games")
    .select("id, status")
    .eq("room_code", roomCode.toUpperCase())
    .single();

  if (gameError || !game) throw new Error("Game not found. Check your room code.");
  if (game.status !== "lobby") throw new Error("Game already started");

  // Check current players
  const { data: players } = await sb
    .from("game_players")
    .select("seat_index, player_id")
    .eq("game_id", game.id)
    .order("seat_index");

  if (!players) throw new Error("Failed to fetch players");
  if (players.length >= 4) throw new Error("Game is full");

  // Check if already joined
  const existing = players.find((p) => p.player_id === playerId);
  if (existing) return { gameId: game.id, seatIndex: existing.seat_index };

  // Find next available seat
  const takenSeats = new Set(players.map((p) => p.seat_index));
  let seatIndex = 0;
  while (takenSeats.has(seatIndex)) seatIndex++;

  // Ensure player exists
  await ensurePlayer(playerId, username);

  // Join
  const { error: joinError } = await sb.from("game_players").insert({
    game_id: game.id,
    player_id: playerId,
    seat_index: seatIndex,
  });

  if (joinError) throw new Error(`Failed to join: ${joinError.message}`);

  return { gameId: game.id, seatIndex };
}

// ─── Choose Sin ──────────────────────────────────────────────
export async function chooseSin(
  gameId: string,
  playerId: string,
  sin: SinType
): Promise<void> {
  const sb = getClientSupabase();

  const { error } = await sb
    .from("game_players")
    .update({ chosen_sin: sin })
    .eq("game_id", gameId)
    .eq("player_id", playerId);

  if (error) throw new Error(`Failed to choose sin: ${error.message}`);
}

// ─── Start Game ──────────────────────────────────────────────
export async function startGame(gameId: string): Promise<void> {
  const sb = getClientSupabase();

  // Get all players
  const { data: players } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .order("seat_index");

  if (!players || players.length < 2) throw new Error("Need at least 2 players");

  // Verify all have chosen sins
  const allReady = players.every((p) => p.chosen_sin);
  if (!allReady) throw new Error("All players must choose a sin");

  // Initialize each player's deck, hand, and energy
  const startingEnergy = getBaseEnergyForRound(1);

  for (const player of players) {
    const deckCards = getDeckForSin(player.chosen_sin as SinType);
    const shuffled = shuffleDeck(deckCards);
    const hand = shuffled.slice(0, HAND_SIZE);
    const remainingDeck = shuffled.slice(HAND_SIZE);

    await sb
      .from("game_players")
      .update({
        hand: hand,
        deck: remainingDeck,
        discard_pile: [],
        current_hp: STARTING_HP,
        max_hp: STARTING_HP,
        is_alive: true,
        current_energy: startingEnergy,
        max_energy: startingEnergy,
        bonus_energy: 0,
      })
      .eq("id", player.id);
  }

  // Update game status
  await sb
    .from("games")
    .update({
      status: "active",
      current_round: 1,
      current_player_index: 0,
      started_at: new Date().toISOString(),
    })
    .eq("id", gameId);

  await sb.from("game_log").insert({
    game_id: gameId,
    action_type: "game_started",
    action_data: { playerCount: players.length },
    round_number: 1,
  });
}

// ─── Play Card ───────────────────────────────────────────────
export async function playCard(
  gameId: string,
  playerId: string,
  cardId: string,
  targetPlayerId?: string
): Promise<{ narratorQuip: string; effects: string[] }> {
  const sb = getClientSupabase();

  // Get game state
  const { data: game } = await sb.from("games").select("*").eq("id", gameId).single();
  if (!game || game.status !== "active") throw new Error("Game not active");

  // Get current player
  const { data: player } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .eq("player_id", playerId)
    .single();

  if (!player) throw new Error("Player not in game");
  if (!player.is_alive) throw new Error("Player is eliminated");

  // Get all players
  const { data: allPlayers } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .order("seat_index");

  if (!allPlayers) throw new Error("Failed to fetch players");

  // Verify it's their turn
  const alivePlayers = allPlayers.filter((p) => p.is_alive);
  const currentTurnPlayer = alivePlayers[game.current_player_index % alivePlayers.length];
  if (currentTurnPlayer.player_id !== playerId) throw new Error("Not your turn");

  // Verify card is in hand
  const hand: string[] = player.hand || [];
  if (!hand.includes(cardId)) throw new Error("Card not in hand");

  // Get card definition
  const card = getCardById(cardId);
  if (!card) throw new Error("Invalid card");

  // Energy check
  const currentEnergy = player.current_energy ?? 0;
  if (card.cost > currentEnergy) {
    throw new Error("Not enough corruption to play this card");
  }

  // Spend energy
  const newEnergy = currentEnergy - card.cost;

  // Greed AVARICE: playing a card that costs 3+ grants +1 bonus energy next turn
  if (player.chosen_sin === "greed" && card.cost >= GREED_AVARICE_COST_THRESHOLD) {
    const currentBonus = player.bonus_energy ?? 0;
    await sb
      .from("game_players")
      .update({ bonus_energy: currentBonus + GREED_AVARICE_BONUS })
      .eq("id", player.id);
  }

  // Remove card from hand, add to discard
  const newHand = hand.filter((id) => id !== cardId);
  const discard: string[] = player.discard_pile || [];
  discard.push(cardId);

  await sb
    .from("game_players")
    .update({ hand: newHand, discard_pile: discard, current_energy: newEnergy })
    .eq("id", player.id);

  // Resolve effects
  const effectDescriptions: string[] = [];

  for (const effect of card.effects) {
    const effectiveValue = calculateEffectiveValue(effect.baseValue, game.current_round);
    const targets = resolveTargets(effect, player, allPlayers, targetPlayerId);

    for (const target of targets) {
      if (effect.duration > 0) {
        // Persistent effect
        await sb.from("active_effects").insert({
          game_id: gameId,
          target_player_id: target.id,
          source_player_id: player.id,
          effect_type: effect.type,
          base_value: effect.baseValue,
          applied_at_round: game.current_round,
          duration_rounds: effect.duration,
          card_id: cardId,
        });
        effectDescriptions.push(
          `${effect.type} (${effectiveValue}) on ${target.player_id === playerId ? "self" : "enemy"} for ${effect.duration} rounds`
        );
      } else {
        // Instant effect
        await applyInstantEffect(effect.type, effectiveValue, target);
        effectDescriptions.push(
          `${effect.type} ${effectiveValue} on ${target.player_id === playerId ? "self" : "enemy"}`
        );
      }
    }
  }

  // Log the play
  await sb.from("game_log").insert({
    game_id: gameId,
    player_id: player.id,
    action_type: "play_card",
    action_data: { cardId, targetPlayerId, effects: effectDescriptions, energySpent: card.cost, energyRemaining: newEnergy },
    round_number: game.current_round,
  });

  // Advance turn
  await advanceTurn(gameId);

  return { narratorQuip: card.narratorQuip, effects: effectDescriptions };
}

// ─── Pass Turn ───────────────────────────────────────────────
export async function passTurn(gameId: string, playerId: string): Promise<void> {
  const sb = getClientSupabase();

  const { data: game } = await sb.from("games").select("*").eq("id", gameId).single();
  if (!game || game.status !== "active") throw new Error("Game not active");

  // Get all players
  const { data: allPlayers } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .order("seat_index");

  if (!allPlayers) throw new Error("Failed to fetch players");

  // Verify it's their turn
  const alivePlayers = allPlayers.filter((p) => p.is_alive);
  const currentTurnPlayer = alivePlayers[game.current_player_index % alivePlayers.length];
  if (currentTurnPlayer.player_id !== playerId) throw new Error("Not your turn");

  // Draw a card as consolation
  const { data: player } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .eq("player_id", playerId)
    .single();

  if (player) {
    await drawCard(player);
  }

  await sb.from("game_log").insert({
    game_id: gameId,
    player_id: currentTurnPlayer.id,
    action_type: "pass",
    action_data: { unspentEnergy: player?.current_energy ?? 0 },
    round_number: game.current_round,
  });

  await advanceTurn(gameId);
}

// ─── Get Full Game State ─────────────────────────────────────
export async function getGameState(gameId: string): Promise<GameState> {
  const sb = getClientSupabase();

  const { data: game } = await sb.from("games").select("*").eq("id", gameId).single();
  if (!game) throw new Error("Game not found");

  const { data: gamePlayers } = await sb
    .from("game_players")
    .select("*, players(username)")
    .eq("game_id", gameId)
    .order("seat_index");

  const { data: effects } = await sb
    .from("active_effects")
    .select("*")
    .eq("game_id", gameId);

  const players: PlayerState[] = (gamePlayers || []).map((gp: any) => ({
    id: gp.player_id,
    gamePlayerId: gp.id,
    username: gp.players?.username || "Unknown",
    seatIndex: gp.seat_index,
    chosenSin: gp.chosen_sin,
    currentHp: gp.current_hp,
    maxHp: gp.max_hp,
    isAlive: gp.is_alive,
    hand: gp.hand || [],
    deckSize: (gp.deck || []).length,
    discardSize: (gp.discard_pile || []).length,
    currentEnergy: gp.current_energy ?? 0,
    maxEnergy: gp.max_energy ?? 0,
    bonusEnergy: gp.bonus_energy ?? 0,
  }));

  const activeEffects: ActiveEffect[] = (effects || []).map((e: any) => ({
    id: e.id,
    targetPlayerId: e.target_player_id,
    sourcePlayerId: e.source_player_id,
    effectType: e.effect_type,
    baseValue: e.base_value,
    appliedAtRound: e.applied_at_round,
    durationRounds: e.duration_rounds,
    cardId: e.card_id,
  }));

  return {
    id: game.id,
    roomCode: game.room_code,
    status: game.status,
    currentRound: game.current_round,
    currentPlayerIndex: game.current_player_index,
    players,
    activeEffects,
    winnerId: game.winner_id,
  };
}

// ─── Get Game Log ────────────────────────────────────────────
export async function getGameLog(gameId: string): Promise<any[]> {
  const sb = getClientSupabase();
  const { data } = await sb
    .from("game_log")
    .select("*")
    .eq("game_id", gameId)
    .order("timestamp", { ascending: true });
  return data || [];
}

// ─── Helper: Resolve Targets ─────────────────────────────────
function resolveTargets(
  effect: CardEffect,
  source: any,
  allPlayers: any[],
  targetPlayerId?: string
): any[] {
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
      if (enemies.length === 0) return [];
      return [enemies[Math.floor(Math.random() * enemies.length)]];
    }
    default:
      return [];
  }
}

// ─── Helper: Apply Instant Effect ────────────────────────────
async function applyInstantEffect(type: string, value: number, target: any): Promise<void> {
  const sb = getClientSupabase();

  switch (type) {
    case "damage": {
      const newHp = Math.max(0, Math.round(target.current_hp - value));
      const isAlive = newHp > 0;
      await sb
        .from("game_players")
        .update({ current_hp: newHp, is_alive: isAlive })
        .eq("id", target.id);
      break;
    }
    case "heal": {
      const newHp = Math.min(target.max_hp, Math.round(target.current_hp + value));
      await sb.from("game_players").update({ current_hp: newHp }).eq("id", target.id);
      break;
    }
    case "shield":
      // Shields are persistent, handled via active_effects
      break;
  }
}

// ─── Helper: Draw Card ───────────────────────────────────────
async function drawCard(player: any): Promise<void> {
  const sb = getClientSupabase();
  let deck: string[] = player.deck || [];
  const hand: string[] = player.hand || [];
  let discard: string[] = player.discard_pile || [];

  // If deck is empty, shuffle discard into deck
  if (deck.length === 0 && discard.length > 0) {
    deck = shuffleDeck(discard);
    discard = [];
  }

  if (deck.length > 0) {
    const drawn = deck.shift()!;
    hand.push(drawn);
    await sb
      .from("game_players")
      .update({ hand, deck, discard_pile: discard })
      .eq("id", player.id);
  }
}

// ─── Helper: Advance Turn ────────────────────────────────────
async function advanceTurn(gameId: string): Promise<void> {
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

  // Check win condition
  if (alivePlayers.length <= 1) {
    const winner = alivePlayers[0];
    await sb
      .from("games")
      .update({
        status: "finished",
        winner_id: winner?.player_id || null,
        finished_at: new Date().toISOString(),
      })
      .eq("id", gameId);
    return;
  }

  // Advance to next alive player
  let nextIndex = (game.current_player_index + 1) % alivePlayers.length;
  let newRound = game.current_round;

  // If we've wrapped around, new round
  if (nextIndex === 0) {
    newRound = Math.min(game.current_round + 1, MAX_ROUNDS);

    // Resolve persistent effects at round start
    await resolveActiveEffects(gameId, newRound);

    // Refresh energy and draw a card for each alive player at round start
    for (const p of alivePlayers) {
      const { data: freshPlayer } = await sb
        .from("game_players")
        .select("*")
        .eq("id", p.id)
        .single();
      if (freshPlayer && freshPlayer.is_alive) {
        await refreshPlayerEnergy(freshPlayer, newRound);
        await drawCard(freshPlayer);
      }
    }
  }

  await sb
    .from("games")
    .update({ current_player_index: nextIndex, current_round: newRound })
    .eq("id", gameId);
}

// ─── Helper: Refresh Player Energy at Round Start ────────────
async function refreshPlayerEnergy(player: any, newRound: number): Promise<void> {
  const sb = getClientSupabase();

  const baseEnergy = getBaseEnergyForRound(newRound);
  const currentUnspent = player.current_energy ?? 0;
  const chosenSin = player.chosen_sin as string;

  let bonusEnergy = 0;

  if (chosenSin === "sloth" && currentUnspent > 0) {
    // Sloth LETHARGY: unspent energy carries over as +1 per unspent, max +2
    bonusEnergy = Math.min(currentUnspent, SLOTH_MAX_CARRYOVER);
  } else if (chosenSin === "greed") {
    // Greed AVARICE: bonus accumulated from playing 3+ cost cards
    bonusEnergy = player.bonus_energy ?? 0;
  } else if (chosenSin === "envy") {
    // Envy COVET: if any opponent has more HP, gain +1 bonus energy
    const sb2 = getClientSupabase();
    const { data: allPlayers } = await sb2
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

  await sb
    .from("game_players")
    .update({
      current_energy: totalEnergy,
      max_energy: totalEnergy,
      bonus_energy: bonusEnergy,
    })
    .eq("id", player.id);
}

// ─── Overcharge (Wrath Passive) ─────────────────────────────
export async function clientOvercharge(
  gameId: string,
  playerId: string
): Promise<{ success: boolean; newEnergy: number; newHp: number }> {
  const sb = getClientSupabase();

  const { data: game } = await sb.from("games").select("*").eq("id", gameId).single();
  if (!game || game.status !== "active") throw new Error("Game not active");

  const { data: player } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .eq("player_id", playerId)
    .single();

  if (!player) throw new Error("Player not in game");
  if (!player.is_alive) throw new Error("Player is eliminated");
  if (player.chosen_sin !== "wrath") throw new Error("Only Wrath players can Overcharge");

  const currentEnergy = player.current_energy ?? 0;
  if (currentEnergy >= MAX_ENERGY) throw new Error("Already at max corruption");
  if (player.current_hp <= WRATH_OVERCHARGE_HP_COST) throw new Error("Not enough HP to Overcharge");

  // Verify it's their turn
  const { data: allPlayers } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .order("seat_index");

  if (!allPlayers) throw new Error("Failed to fetch players");
  const alivePlayers = allPlayers.filter((p: any) => p.is_alive);
  const currentTurnPlayer = alivePlayers[game.current_player_index % alivePlayers.length];
  if (currentTurnPlayer.player_id !== playerId) throw new Error("Not your turn");

  const newHp = Math.max(0, player.current_hp - WRATH_OVERCHARGE_HP_COST);
  const newEnergy = Math.min(currentEnergy + WRATH_OVERCHARGE_ENERGY_GAIN, MAX_ENERGY);
  const isAlive = newHp > 0;

  await sb
    .from("game_players")
    .update({
      current_hp: newHp,
      is_alive: isAlive,
      current_energy: newEnergy,
      max_energy: Math.max(player.max_energy ?? 0, newEnergy),
    })
    .eq("id", player.id);

  await sb.from("game_log").insert({
    game_id: gameId,
    player_id: player.id,
    action_type: "overcharge",
    action_data: { hpCost: WRATH_OVERCHARGE_HP_COST, energyGained: WRATH_OVERCHARGE_ENERGY_GAIN },
    round_number: game.current_round,
  });

  return { success: true, newEnergy, newHp };
}

// ─── Helper: Resolve Active Effects ──────────────────────────
async function resolveActiveEffects(gameId: string, currentRound: number): Promise<void> {
  const sb = getClientSupabase();

  const { data: effects } = await sb
    .from("active_effects")
    .select("*")
    .eq("game_id", gameId);

  if (!effects) return;

  for (const effect of effects) {
    const roundsActive = currentRound - effect.applied_at_round;

    // Check if effect has expired
    if (roundsActive > effect.duration_rounds) {
      await sb.from("active_effects").delete().eq("id", effect.id);
      continue;
    }

    // Apply effect with compounding
    const effectiveValue = calculateEffectiveValue(effect.base_value, currentRound);

    // Get target player
    const { data: target } = await sb
      .from("game_players")
      .select("*")
      .eq("id", effect.target_player_id)
      .single();

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
