/**
 * Client-Side Game Engine
 *
 * All game logic runs in the browser and calls Supabase directly.
 * No server-side code needed — perfect for Vercel static deployment.
 *
 * COMPOUNDING SYSTEM (Fibonacci [1, 1, 2]):
 * - Compounding cards tick for 3 rounds with escalating multipliers
 * - Tick 0: base × 1 (pay cost), Tick 1: base × 1, Tick 2: base × 2
 * - Applies to ALL effect types: damage, heal, shield, debuff, energy_drain
 * - Flat cards resolve instantly with no duration
 */

import { getClientSupabase } from "../../../shared/supabaseClient";
import { getCardById, getDeckForSin } from "../../../shared/cardData";
import {
  ActiveEffect,
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
  WRATH_SIPHON_RATE,
  GREED_AVARICE_COST_THRESHOLD,
  GREED_AVARICE_BONUS,
  ENVY_COVET_BONUS,
  PRIDE_HUBRIS_SHIELD,
  LUST_TEMPTATION_HEAL,
  GLUTTONY_DEVOUR_ENERGY,
  getBaseEnergyForRound,
  CATCHUP_HP_THRESHOLD,
  CatchupCondition,
  COMPOUND_DURATION,
  getCompoundTickValue,
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

  const { data: game, error: gameError } = await sb
    .from("games")
    .insert({ room_code: roomCode, status: "lobby" })
    .select("id")
    .single();

  if (gameError || !game) throw new Error(`Failed to create game: ${gameError?.message}`);

  await ensurePlayer(playerId, username);

  const { error: joinError } = await sb.from("game_players").insert({
    game_id: game.id,
    player_id: playerId,
    seat_index: 0,
  });

  if (joinError) throw new Error(`Failed to join game: ${joinError.message}`);

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

  const { data: game, error: gameError } = await sb
    .from("games")
    .select("id, status")
    .eq("room_code", roomCode.toUpperCase())
    .single();

  if (gameError || !game) throw new Error("Game not found. Check your room code.");
  if (game.status !== "lobby") throw new Error("Game already started");

  const { data: players } = await sb
    .from("game_players")
    .select("seat_index, player_id")
    .eq("game_id", game.id)
    .order("seat_index");

  if (!players) throw new Error("Failed to fetch players");
  if (players.length >= 4) throw new Error("Game is full");

  const existing = players.find((p) => p.player_id === playerId);
  if (existing) return { gameId: game.id, seatIndex: existing.seat_index };

  const takenSeats = new Set(players.map((p) => p.seat_index));
  let seatIndex = 0;
  while (takenSeats.has(seatIndex)) seatIndex++;

  await ensurePlayer(playerId, username);

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

  const { data: players } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .order("seat_index");

  if (!players || players.length < 2) throw new Error("Need at least 2 players");

  const allReady = players.every((p) => p.chosen_sin);
  if (!allReady) throw new Error("All players must choose a sin");

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

  const { data: allPlayers } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .order("seat_index");

  if (!allPlayers) throw new Error("Failed to fetch players");

  const alivePlayers = allPlayers.filter((p) => p.is_alive);
  const currentTurnPlayer = alivePlayers[game.current_player_index % alivePlayers.length];
  if (currentTurnPlayer.player_id !== playerId) throw new Error("Not your turn");

  const hand: string[] = player.hand || [];
  if (!hand.includes(cardId)) throw new Error("Card not in hand");

  const card = getCardById(cardId);
  if (!card) throw new Error("Invalid card");

  // ─── Energy Check ─────────────────────────────────────────
  const currentEnergy = player.current_energy ?? 0;
  if (card.cost > currentEnergy) {
    throw new Error("Not enough corruption to play this card");
  }

  const newEnergy = currentEnergy - card.cost;

  // Greed AVARICE: playing a card that costs 3+ grants +1 bonus energy next turn
  if (player.chosen_sin === "greed" && card.cost >= GREED_AVARICE_COST_THRESHOLD) {
    const currentBonus = player.bonus_energy ?? 0;
    await sb
      .from("game_players")
      .update({ bonus_energy: currentBonus + GREED_AVARICE_BONUS })
      .eq("id", player.id);
  }

  // Pride HUBRIS: playing a 0-cost card grants +2 shield
  if (player.chosen_sin === "pride" && card.cost === 0) {
    await sb.from("active_effects").insert({
      game_id: gameId,
      target_player_id: player.id,
      source_player_id: player.id,
      effect_type: "shield",
      base_value: PRIDE_HUBRIS_SHIELD,
      applied_at_round: game.current_round,
      duration_rounds: 1,
      card_id: cardId,
    });
  }

  // Lust TEMPTATION: single-target damage cards heal self for 1 HP
  if (player.chosen_sin === "lust" && targetPlayerId) {
    const hasSingleDamage = card.effects.some(
      (e) => (e.type === "damage") && (e.target === "single_enemy")
    );
    if (hasSingleDamage) {
      await applyInstantEffect("heal", LUST_TEMPTATION_HEAL, player, gameId);
    }
  }

  // Gluttony DEVOUR: AoE cards grant +1 energy
  if (player.chosen_sin === "gluttony") {
    const hasAoE = card.effects.some(
      (e) => e.target === "all_enemies"
    );
    if (hasAoE) {
      const boostedEnergy = Math.min((player.current_energy ?? 0) - card.cost + GLUTTONY_DEVOUR_ENERGY, MAX_ENERGY);
      await sb
        .from("game_players")
        .update({ current_energy: boostedEnergy })
        .eq("id", player.id);
    }
  }

  // Remove card from hand, add to discard
  const newHand = hand.filter((id) => id !== cardId);
  const discard: string[] = player.discard_pile || [];
  discard.push(cardId);

  await sb
    .from("game_players")
    .update({ hand: newHand, discard_pile: discard, current_energy: newEnergy })
    .eq("id", player.id);

  // ─── Resolve Effects ──────────────────────────────────────
  const effectDescriptions: string[] = [];

  if (card.cardType === "flat") {
    // FLAT CARDS: Apply all effects instantly with baseValue (no multiplier)
    for (const effect of card.effects) {
      const targets = resolveTargets(effect, player, allPlayers, targetPlayerId);
      for (const target of targets) {
        if (effect.duration > 0) {
          // Some flat cards may still have duration (e.g. shields that persist)
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
            `${effect.type} ${effect.baseValue} on ${target.player_id === playerId ? "self" : "enemy"} for ${effect.duration}r`
          );
        } else {
          await applyInstantEffect(effect.type, effect.baseValue, target, gameId);
          effectDescriptions.push(
            `${effect.type} ${effect.baseValue} on ${target.player_id === playerId ? "self" : "enemy"}`
          );
        }
      }
    }
  } else {
    // COMPOUNDING CARDS: Apply first tick (×1) immediately, store for future ticks
    for (const effect of card.effects) {
      const targets = resolveTargets(effect, player, allPlayers, targetPlayerId);
      const firstTickValue = getCompoundTickValue(effect.baseValue, 0); // tick 0 = ×1

      for (const target of targets) {
        // Apply first tick immediately
        if (effect.type === "shield") {
          await sb.from("active_effects").insert({
            game_id: gameId,
            target_player_id: target.id,
            source_player_id: player.id,
            effect_type: "shield",
            base_value: firstTickValue,
            applied_at_round: game.current_round,
            duration_rounds: 1,
            card_id: cardId,
          });
        } else {
          await applyInstantEffect(effect.type, firstTickValue, target, gameId);
        }

        // Store the compounding effect for ticks 1 and 2
        await sb.from("active_effects").insert({
          game_id: gameId,
          target_player_id: target.id,
          source_player_id: player.id,
          effect_type: effect.type,
          base_value: effect.baseValue,
          applied_at_round: game.current_round,
          duration_rounds: COMPOUND_DURATION,
          card_id: cardId,
          is_compounding: true,
          current_tick: 1, // next tick to apply (0 was just applied)
        });

        effectDescriptions.push(
          `${effect.type} ${firstTickValue} on ${target.player_id === playerId ? "self" : "enemy"} (compounds ×${COMPOUND_DURATION}r)`
        );
      }
    }
  }

  // ─── Catch-Up Bonus Resolution ─────────────────────────────
  if (card.catchup) {
    const { data: freshPlayer } = await sb
      .from("game_players")
      .select("current_hp, is_alive")
      .eq("game_id", gameId)
      .eq("player_id", playerId)
      .single();

    const playerHp = freshPlayer?.current_hp ?? player.current_hp;
    const catchupMet = evaluateCatchupCondition(
      card.catchup.condition,
      playerHp,
      allPlayers,
      playerId,
      targetPlayerId
    );

    if (catchupMet) {
      const bonusValue = card.catchup.bonusValue;
      switch (card.catchup.type) {
        case "bonus_damage": {
          const dmgTargets = allPlayers.filter(
            (p) => p.is_alive && p.player_id !== playerId
          );
          const primaryTarget = targetPlayerId
            ? dmgTargets.find((p) => p.player_id === targetPlayerId) || dmgTargets[0]
            : dmgTargets[0];
          if (primaryTarget) {
            await applyInstantEffect("damage", bonusValue, primaryTarget, gameId);
            effectDescriptions.push(`CATCH-UP bonus damage ${bonusValue}`);
          }
          break;
        }
        case "bonus_heal": {
          const selfTarget = allPlayers.find((p) => p.player_id === playerId);
          if (selfTarget) {
            await applyInstantEffect("heal", bonusValue, selfTarget, gameId);
            effectDescriptions.push(`CATCH-UP bonus heal ${bonusValue}`);
          }
          break;
        }
        case "bonus_debuff_all": {
          const enemies = allPlayers.filter(
            (p) => p.is_alive && p.player_id !== playerId
          );
          for (const enemy of enemies) {
            await sb.from("active_effects").insert({
              game_id: gameId,
              target_player_id: enemy.id,
              source_player_id: player.id,
              effect_type: "debuff",
              base_value: card.catchup.bonusValue,
              applied_at_round: game.current_round,
              duration_rounds: card.catchup.bonusDuration ?? 2,
              card_id: cardId,
            });
          }
          effectDescriptions.push(`CATCH-UP bonus debuff all enemies`);
          break;
        }
      }
    }
  }

  // Log the play
  await sb.from("game_log").insert({
    game_id: gameId,
    player_id: player.id,
    action_type: "play_card",
    action_data: {
      cardId,
      targetPlayerId,
      effects: effectDescriptions,
      cardType: card.cardType,
      energySpent: card.cost,
      energyRemaining: newEnergy,
    },
    round_number: game.current_round,
  });

  // Turn does NOT advance after playing a card — player can play multiple cards per turn
  // Turn only advances when player explicitly passes (passTurn)

  return { narratorQuip: card.narratorQuip, effects: effectDescriptions };
}

// ─── Pass Turn ───────────────────────────────────────────────
export async function passTurn(gameId: string, playerId: string): Promise<void> {
  const sb = getClientSupabase();

  const { data: game } = await sb.from("games").select("*").eq("id", gameId).single();
  if (!game || game.status !== "active") throw new Error("Game not active");

  const { data: allPlayers } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .order("seat_index");

  if (!allPlayers) throw new Error("Failed to fetch players");

  const alivePlayers = allPlayers.filter((p) => p.is_alive);
  const currentTurnPlayer = alivePlayers[game.current_player_index % alivePlayers.length];
  if (currentTurnPlayer.player_id !== playerId) throw new Error("Not your turn");

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
    currentTick: e.current_tick ?? undefined,
    isCompounding: e.is_compounding ?? undefined,
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
async function applyInstantEffect(
  type: string,
  value: number,
  target: any,
  gameId?: string
): Promise<void> {
  const sb = getClientSupabase();
  const roundedValue = Math.round(value);

  switch (type) {
    case "damage": {
      let remainingDamage = roundedValue;

      // Shield absorption: check for active shield effects on target
      if (gameId) {
        const { data: shields } = await sb
          .from("active_effects")
          .select("*")
          .eq("game_id", gameId)
          .eq("target_player_id", target.id)
          .eq("effect_type", "shield");

        if (shields && shields.length > 0) {
          for (const shield of shields) {
            if (remainingDamage <= 0) break;
            const shieldValue = shield.base_value; // Use raw base_value for shields
            if (shieldValue <= remainingDamage) {
              remainingDamage -= shieldValue;
              await sb.from("active_effects").delete().eq("id", shield.id);
            } else {
              const newBase = shieldValue - remainingDamage;
              remainingDamage = 0;
              await sb.from("active_effects").update({ base_value: newBase }).eq("id", shield.id);
            }
          }
        }
      }

      if (remainingDamage > 0) {
        const newHp = Math.max(0, target.current_hp - remainingDamage);
        const isAlive = newHp > 0;
        await sb
          .from("game_players")
          .update({ current_hp: newHp, is_alive: isAlive })
          .eq("id", target.id);
        target.current_hp = newHp;
        target.is_alive = isAlive;
      }
      break;
    }
    case "heal": {
      const newHp = Math.min(target.max_hp, target.current_hp + roundedValue);
      await sb.from("game_players").update({ current_hp: newHp }).eq("id", target.id);
      target.current_hp = newHp;
      break;
    }
    case "energy_drain": {
      const currentTargetEnergy = target.current_energy ?? 0;
      const drained = Math.min(roundedValue, currentTargetEnergy);
      await sb
        .from("game_players")
        .update({ current_energy: currentTargetEnergy - drained })
        .eq("id", target.id);
      target.current_energy = currentTargetEnergy - drained;
      break;
    }
    case "energy_gain": {
      const currentSelfEnergy = target.current_energy ?? 0;
      const newEnergy = Math.min(currentSelfEnergy + roundedValue, MAX_ENERGY);
      await sb
        .from("game_players")
        .update({ current_energy: newEnergy })
        .eq("id", target.id);
      target.current_energy = newEnergy;
      break;
    }
    case "shield":
      // Shields are stored as active_effects
      if (gameId) {
        await sb.from("active_effects").insert({
          game_id: gameId,
          target_player_id: target.id,
          source_player_id: target.id,
          effect_type: "shield",
          base_value: roundedValue,
          applied_at_round: 0,
          duration_rounds: 1,
          card_id: "instant-shield",
        });
      }
      break;
    case "debuff":
      // Debuffs deal half damage
      await applyInstantEffect("damage", Math.round(roundedValue / 2), target, gameId);
      break;
  }
}

// ─── Helper: Draw Card ───────────────────────────────────────
async function drawCard(player: any): Promise<void> {
  const sb = getClientSupabase();
  let deck: string[] = player.deck || [];
  const hand: string[] = player.hand || [];
  let discard: string[] = player.discard_pile || [];

  if (deck.length === 0 && discard.length > 0) {
    deck = shuffleDeck(discard);
    discard = [];
  }

  // Don't draw if hand is already at max
  if (hand.length >= HAND_SIZE + 2) return; // Allow 2 over max before stopping

  if (deck.length > 0) {
    const drawn = deck.shift()!;
    hand.push(drawn);

    // If hand exceeds hard limit, discard oldest cards
    while (hand.length > HAND_SIZE + 2) {
      const discarded = hand.shift()!;
      discard.push(discarded);
    }

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

  let nextIndex = (game.current_player_index + 1) % alivePlayers.length;
  let newRound = game.current_round;

  // If we've wrapped around, new round
  if (nextIndex === 0) {
    newRound = game.current_round + 1;

    // ─── Round 10 Game Over: highest HP wins ─────────────────
    if (newRound > MAX_ROUNDS) {
      const sortedByHp = [...alivePlayers].sort((a, b) => b.current_hp - a.current_hp);
      const winner = sortedByHp[0];
      await sb
        .from("games")
        .update({
          status: "finished",
          winner_id: winner?.player_id || null,
          finished_at: new Date().toISOString(),
          current_round: MAX_ROUNDS,
        })
        .eq("id", gameId);
      return;
    }

    // Resolve compounding effects at round start
    await resolveActiveEffects(gameId, newRound);

    // Re-check alive players after effect resolution (effects can kill)
    const { data: postEffectPlayers } = await sb
      .from("game_players")
      .select("*")
      .eq("game_id", gameId)
      .order("seat_index");
    const stillAlive = (postEffectPlayers || []).filter((p) => p.is_alive);

    if (stillAlive.length <= 1) {
      const winner = stillAlive[0];
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

    // Refresh energy and draw a card for each alive player
    for (const p of stillAlive) {
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

    // Recalculate nextIndex based on updated alive list
    nextIndex = 0;
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
    bonusEnergy = Math.min(currentUnspent, SLOTH_MAX_CARRYOVER);
  } else if (chosenSin === "greed") {
    bonusEnergy = player.bonus_energy ?? 0;
  } else if (chosenSin === "envy") {
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

// ─── Helper: Resolve Active Effects (Compounding Ticks) ──────
async function resolveActiveEffects(gameId: string, currentRound: number): Promise<void> {
  const sb = getClientSupabase();

  const { data: effects } = await sb
    .from("active_effects")
    .select("*")
    .eq("game_id", gameId);

  if (!effects) return;

  for (const effect of effects) {
    // Handle compounding effects
    if (effect.is_compounding) {
      const tick = effect.current_tick ?? 1;

      // If tick >= COMPOUND_DURATION, effect is done
      if (tick >= COMPOUND_DURATION) {
        await sb.from("active_effects").delete().eq("id", effect.id);
        continue;
      }

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

      // Calculate tick value using Fibonacci multipliers
      const tickValue = getCompoundTickValue(effect.base_value, tick);

      // Apply the effect
      if (effect.effect_type === "shield") {
        await sb.from("active_effects").insert({
          game_id: gameId,
          target_player_id: target.id,
          source_player_id: effect.source_player_id,
          effect_type: "shield",
          base_value: tickValue,
          applied_at_round: currentRound,
          duration_rounds: 1,
          card_id: effect.card_id,
        });
      } else {
        await applyInstantEffect(effect.effect_type, tickValue, target, gameId);

        // ─── WRATH PASSIVE: Compound Damage Siphon ─────────────
        // When compound damage ticks on another player, the Wrath source
        // heals 20% of that damage amount ("feeding off chaos")
        if (
          (effect.effect_type === "damage" || effect.effect_type === "debuff") &&
          effect.source_player_id !== effect.target_player_id
        ) {
          const { data: sourcePlayer } = await sb
            .from("game_players")
            .select("*")
            .eq("id", effect.source_player_id)
            .single();

          if (
            sourcePlayer &&
            sourcePlayer.is_alive &&
            sourcePlayer.chosen_sin === "wrath"
          ) {
            const siphonHeal = Math.max(1, Math.round(tickValue * WRATH_SIPHON_RATE));
            const newHp = Math.min(sourcePlayer.current_hp + siphonHeal, STARTING_HP);
            await sb
              .from("game_players")
              .update({ current_hp: newHp })
              .eq("id", sourcePlayer.id);
          }
        }
      }

      // Advance tick or expire
      const nextTick = tick + 1;
      if (nextTick >= COMPOUND_DURATION) {
        await sb.from("active_effects").delete().eq("id", effect.id);
      } else {
        await sb.from("active_effects").update({ current_tick: nextTick }).eq("id", effect.id);
      }
    } else {
      // Non-compounding persistent effects (flat shields, debuffs, etc.)
      const roundsActive = currentRound - effect.applied_at_round;

      if (roundsActive > effect.duration_rounds) {
        await sb.from("active_effects").delete().eq("id", effect.id);
        continue;
      }

      // Only resolve non-shield persistent effects (shields are passive)
      if (effect.effect_type !== "shield") {
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
            await applyInstantEffect("damage", effect.base_value, target, gameId);
            break;
          case "heal":
            await applyInstantEffect("heal", effect.base_value, target, gameId);
            break;
          case "debuff":
            await applyInstantEffect("damage", Math.round(effect.base_value / 2), target, gameId);
            break;
        }
      }
    }
  }
}

// ─── Helper: Evaluate Catch-Up Condition ────────────────────
function evaluateCatchupCondition(
  condition: CatchupCondition,
  playerHp: number,
  allPlayers: any[],
  playerId: string,
  targetPlayerId?: string
): boolean {
  const alivePlayers = allPlayers.filter((p) => p.is_alive);
  const opponents = alivePlayers.filter((p) => p.player_id !== playerId);

  switch (condition) {
    case "hp_less_than_target": {
      if (!targetPlayerId) return false;
      const target = alivePlayers.find((p) => p.player_id === targetPlayerId);
      return target ? playerHp < target.current_hp : false;
    }
    case "hp_less_than_any_opponent":
      return opponents.some((p) => playerHp < p.current_hp);
    case "hp_below_threshold":
      return playerHp <= CATCHUP_HP_THRESHOLD;
    case "hp_lowest":
      return alivePlayers.every((p) => p.player_id === playerId || playerHp <= p.current_hp);
    default:
      return false;
  }
}
