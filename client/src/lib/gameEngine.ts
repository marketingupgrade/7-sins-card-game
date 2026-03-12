/**
 * Client-Side Game Engine (v4)
 *
 * ALL cards are compound. No flat cards exist.
 * 200 HP, 20 rounds, start 2 energy +1/round (max 7), carry-over.
 * 3 compound patterns: standard (Fibonacci), aggressive (powers of 2), slowburn.
 * 7 faction passives tuned via Monte Carlo simulation.
 * Round 16: all afflictions double.
 */

import { getClientSupabase } from "../../../shared/supabaseClient";
import { getCardById, getDeckForSin } from "../../../shared/cardData";
import {
  ActiveEffect,
  CardEffect,
  CompoundPattern,
  GameState,
  HAND_SIZE,
  LockedPlay,
  MAX_ROUNDS,
  MAX_ENERGY,
  ENERGY_PER_TURN,
  PlayerState,
  SinType,
  STARTING_HP,
  STARTING_ENERGY,
  ROUND_16_DOUBLING,
  TurnPhase,
  WRATH_FURY_BONUS_DAMAGE,
  WRATH_FURY_HEAL,
  SLOTH_ENDURANCE_SHIELD,
  GREED_AVARICE_ENERGY,
  ENVY_JEALOUSY_AMPLIFY,
  PRIDE_HUBRIS_SHIELD,
  LUST_TEMPTATION_HEAL,
  GLUTTONY_DEVOUR_ENERGY,
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
        current_energy: STARTING_ENERGY,
        max_energy: MAX_ENERGY,
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
      turn_phase: "selection",
      locked_plays: [],
      started_at: new Date().toISOString(),
    })
    .eq("id", gameId);

  // Reset locked_cards on all players
  for (const player of players) {
    await sb.from("game_players").update({ locked_cards: [] }).eq("id", player.id);
  }

  await sb.from("game_log").insert({
    game_id: gameId,
    action_type: "game_started",
    action_data: { playerCount: players.length },
    round_number: 1,
  });
}

// ═══════════════════════════════════════════════════════════════
// SIMULTANEOUS LOCK-IN SYSTEM
// ═══════════════════════════════════════════════════════════════

/**
 * Lock in cards for the selection phase.
 * Player selects 0-N cards (limited by energy). Cards are stored
 * in game_players.locked_cards and games.locked_plays.
 * Once all alive players lock in, resolution begins automatically.
 */
export async function lockInCards(
  gameId: string,
  playerId: string,
  selections: Array<{ cardId: string; targetPlayerId?: string }>
): Promise<{ success: boolean; narratorQuip: string }> {
  const sb = getClientSupabase();

  const { data: game } = await sb.from("games").select("*").eq("id", gameId).single();
  if (!game || game.status !== "active") throw new Error("Game not active");
  if (game.turn_phase !== "selection") throw new Error("Not in selection phase");

  const { data: player } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .eq("player_id", playerId)
    .single();

  if (!player) throw new Error("Player not in game");
  if (!player.is_alive) throw new Error("Player is eliminated");

  // Validate all selected cards are in hand and affordable
  const hand: string[] = player.hand || [];
  let energyBudget = player.current_energy ?? 0;
  const lockedPlays: LockedPlay[] = [];

  for (const sel of selections) {
    if (!hand.includes(sel.cardId)) throw new Error(`Card ${sel.cardId} not in hand`);
    const card = getCardById(sel.cardId);
    if (!card) throw new Error(`Invalid card ${sel.cardId}`);
    if (card.cost > energyBudget) throw new Error(`Not enough energy for ${card.name}`);
    energyBudget -= card.cost;

    lockedPlays.push({
      playerId: player.player_id,
      gamePlayerId: player.id,
      cardId: sel.cardId,
      targetPlayerId: sel.targetPlayerId,
      skipQueue: card.skipQueue || false,
    });
  }

  // Store locked cards on the player (use sentinel for pass)
  const storedLocked = lockedPlays.length > 0 ? lockedPlays : [{ pass: true }];
  await sb.from("game_players")
    .update({ locked_cards: storedLocked })
    .eq("id", player.id);

  // Merge into games.locked_plays (append this player's selections)
  const existingLocked: LockedPlay[] = (game.locked_plays || []).filter(
    (lp: LockedPlay) => lp.playerId !== playerId
  );
  const allLocked = [...existingLocked, ...lockedPlays];
  await sb.from("games").update({ locked_plays: allLocked }).eq("id", gameId);

  // Log the lock-in
  await sb.from("game_log").insert({
    game_id: gameId,
    player_id: player.id,
    action_type: "lock_in",
    action_data: { cardCount: selections.length, energyRemaining: energyBudget },
    round_number: game.current_round,
  });

  // Check if all alive players have locked in
  const { data: allPlayers } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .order("seat_index");

  const alivePlayers = (allPlayers || []).filter((p: any) => p.is_alive);

  // With sentinel approach, locked_cards always has length > 0 after lock-in
  // (real plays or [{pass:true}] for pass). The current player was just updated above.
  const allConfirmed = alivePlayers.every((p: any) => {
    if (p.player_id === playerId) return true; // Just locked in
    const pLocked = p.locked_cards;
    return Array.isArray(pLocked) && pLocked.length > 0;
  });

  if (allConfirmed) {
    // Transition to resolution phase
    await sb.from("games").update({ turn_phase: "resolution" }).eq("id", gameId);
    // Resolve all locked plays
    await resolveLockedPlays(gameId);
  }

  const quip = selections.length === 0
    ? "Choosing to do nothing? Bold strategy."
    : selections.length === 1
      ? "One card locked. Let fate decide."
      : `${selections.length} cards locked. The arena trembles.`;

  return { success: true, narratorQuip: quip };
}

/**
 * Resolve all locked-in plays in priority order:
 * 1. Skip-queue cards first, then normal cards
 * 2. Within each group: lowest HP plays first (tiebreak: lowest seat index)
 * 3. Within each player: lowest cost card first
 */
async function resolveLockedPlays(gameId: string): Promise<void> {
  const sb = getClientSupabase();

  const { data: game } = await sb.from("games").select("*").eq("id", gameId).single();
  if (!game) return;

  const { data: allPlayers } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .order("seat_index");
  if (!allPlayers) return;

  const lockedPlays: LockedPlay[] = game.locked_plays || [];

  // Sort plays: skip-queue first, then by player HP (lowest first), then by card cost (lowest first)
  const sortedPlays = [...lockedPlays].sort((a, b) => {
    // Skip-queue cards resolve first
    if (a.skipQueue && !b.skipQueue) return -1;
    if (!a.skipQueue && b.skipQueue) return 1;

    // Then by player HP (lowest first)
    const playerA = allPlayers.find((p) => p.player_id === a.playerId);
    const playerB = allPlayers.find((p) => p.player_id === b.playerId);
    const hpA = playerA?.current_hp ?? 999;
    const hpB = playerB?.current_hp ?? 999;
    if (hpA !== hpB) return hpA - hpB;

    // Tiebreak: lowest seat index
    const seatA = playerA?.seat_index ?? 999;
    const seatB = playerB?.seat_index ?? 999;
    if (seatA !== seatB) return seatA - seatB;

    // Within same player: lowest cost first
    const cardA = getCardById(a.cardId);
    const cardB = getCardById(b.cardId);
    return (cardA?.cost ?? 0) - (cardB?.cost ?? 0);
  });

  // Resolve each play in order
  for (const play of sortedPlays) {
    // Re-fetch player state (may have changed from previous resolutions)
    const { data: freshPlayer } = await sb
      .from("game_players")
      .select("*")
      .eq("player_id", play.playerId)
      .eq("game_id", gameId)
      .single();

    if (!freshPlayer || !freshPlayer.is_alive) continue;

    const card = getCardById(play.cardId);
    if (!card) continue;

    // Re-fetch all players for target resolution
    const { data: currentPlayers } = await sb
      .from("game_players")
      .select("*")
      .eq("game_id", gameId)
      .order("seat_index");
    if (!currentPlayers) continue;

    // Deduct energy
    const currentEnergy = freshPlayer.current_energy ?? 0;
    let newEnergy = Math.max(0, currentEnergy - card.cost);

    // ─── V4 PASSIVES (on card play) ───────────────────────────
    const sin = freshPlayer.chosen_sin as SinType;

    // PRIDE HUBRIS: 0-cost cards grant +1 shield
    if (sin === "pride" && card.cost === 0) {
      await sb.from("active_effects").insert({
        game_id: gameId,
        target_player_id: freshPlayer.id,
        source_player_id: freshPlayer.id,
        effect_type: "shield_gain",
        base_value: PRIDE_HUBRIS_SHIELD,
        applied_at_round: game.current_round,
        duration_rounds: 1,
        card_id: play.cardId,
      });
    }

    // GLUTTONY DEVOUR: AoE cards grant +1 energy
    if (sin === "gluttony") {
      const hasAoE = card.effects.some((e) => e.targetMode === "aoe");
      if (hasAoE) {
        newEnergy = Math.min(newEnergy + GLUTTONY_DEVOUR_ENERGY, MAX_ENERGY);
      }
    }

    // GREED AVARICE: steal-type cards grant +1 energy
    if (sin === "greed") {
      const hasSteal = card.effects.some((e) =>
        ["heal_steal", "shield_steal", "energy_steal"].includes(e.type)
      );
      if (hasSteal) {
        newEnergy = Math.min(newEnergy + GREED_AVARICE_ENERGY, MAX_ENERGY);
      }
    }

    // Remove card from hand, add to discard
    const hand: string[] = freshPlayer.hand || [];
    const newHand = hand.filter((id: string) => id !== play.cardId);
    const discard: string[] = freshPlayer.discard_pile || [];
    discard.push(play.cardId);

    await sb.from("game_players")
      .update({ hand: newHand, discard_pile: discard, current_energy: newEnergy })
      .eq("id", freshPlayer.id);

    // ─── Resolve Effects (ALL COMPOUND) ───────────────────────
    const effectDescriptions: string[] = [];

    for (const effect of card.effects) {
      const targets = resolveTargets(effect, freshPlayer, currentPlayers, play.targetPlayerId);
      const firstTickValue = getCompoundTickValue(effect.baseValue, card.compoundPattern, 0);

      for (const target of targets) {
        await applyInstantEffect(effect.type, firstTickValue, target, gameId, freshPlayer.player_id);

        // WRATH FURY
        if (sin === "wrath" && effect.type === "self_damage") {
          const enemies = currentPlayers.filter((p: any) => p.is_alive && p.player_id !== play.playerId);
          const lowestEnemy = enemies.sort((a: any, b: any) => a.current_hp - b.current_hp)[0];
          if (lowestEnemy) {
            await applyInstantEffect("damage", WRATH_FURY_BONUS_DAMAGE, lowestEnemy, gameId, freshPlayer.player_id);
          }
          await applyInstantEffect("heal_gain", WRATH_FURY_HEAL, freshPlayer, gameId, freshPlayer.player_id);
        }

        // LUST TEMPTATION
        if (sin === "lust" && effect.type === "damage" && effect.targetMode === "single") {
          await applyInstantEffect("heal_gain", LUST_TEMPTATION_HEAL, freshPlayer, gameId, freshPlayer.player_id);
        }

        // ENVY JEALOUSY
        if (sin === "envy" && effect.type === "damage" && target.player_id !== play.playerId) {
          await amplifyWorstAffliction(gameId, target.id, ENVY_JEALOUSY_AMPLIFY);
        }

        // Store compound effect for future ticks
        if (effect.duration > 1) {
          await sb.from("active_effects").insert({
            game_id: gameId,
            target_player_id: target.id,
            source_player_id: freshPlayer.id,
            effect_type: effect.type,
            base_value: effect.baseValue,
            applied_at_round: game.current_round,
            duration_rounds: effect.duration,
            card_id: play.cardId,
            current_tick: 1,
            compound_pattern: card.compoundPattern,
          });
        }

        effectDescriptions.push(
          `${effect.type} ${firstTickValue} on ${target.player_id === play.playerId ? "self" : "enemy"} (${card.compoundPattern} ×${effect.duration}r)`
        );
      }
    }

    // Log the resolved play
    await sb.from("game_log").insert({
      game_id: gameId,
      player_id: freshPlayer.id,
      action_type: "play_card",
      action_data: {
        cardId: play.cardId,
        targetPlayerId: play.targetPlayerId,
        effects: effectDescriptions,
        compoundPattern: card.compoundPattern,
        energySpent: card.cost,
        energyRemaining: newEnergy,
        resolvedInPhase: "resolution",
      },
      round_number: game.current_round,
    });
  }

  // After all plays resolved, advance to round_end
  await advanceRound(gameId);
}

/**
 * Legacy playCard — still exported for backward compatibility.
 * In simultaneous mode, this is only called during resolution phase internally.
 * External callers should use lockInCards() instead.
 */
export async function playCard(
  gameId: string,
  playerId: string,
  cardId: string,
  targetPlayerId?: string
): Promise<{ narratorQuip: string; effects: string[] }> {
  // In simultaneous mode, redirect to lockInCards with a single card
  const result = await lockInCards(gameId, playerId, [
    { cardId, targetPlayerId },
  ]);
  return { narratorQuip: result.narratorQuip, effects: [] };
}

/// ─── Pass Turn (Lock in with 0 cards) ─────────────────────────
export async function passTurn(gameId: string, playerId: string): Promise<void> {
  // In simultaneous mode, passing = locking in with 0 cards
  await lockInCards(gameId, playerId, []);
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

  const rawLocked = game.locked_plays;
  const allLockedPlays: LockedPlay[] = Array.isArray(rawLocked) ? rawLocked : [];

  const players: PlayerState[] = (gamePlayers || []).map((gp: any) => {
    const playerLocked = allLockedPlays.filter((lp: LockedPlay) => lp.playerId === gp.player_id);
    const gpLockedCards = Array.isArray(gp.locked_cards) ? gp.locked_cards : [];
    return {
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
      lockedCards: playerLocked.length > 0 ? playerLocked : gpLockedCards,
      // A player has locked in if locked_cards has content (real plays or [{pass:true}] sentinel)
      hasLockedIn: gpLockedCards.length > 0 || playerLocked.length > 0,
    };
  });

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
    compoundPattern: e.compound_pattern ?? undefined,
    doubled: e.doubled ?? undefined,
  }));

  return {
    id: game.id,
    roomCode: game.room_code,
    status: game.status,
    currentRound: game.current_round,
    currentPlayerIndex: game.current_player_index ?? 0,
    turnPhase: (game.turn_phase as TurnPhase) || "selection",
    lockedPlays: allLockedPlays,
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

// ─── Helper: Resolve Targets (v4 targetMode) ────────────────
function resolveTargets(
  effect: CardEffect,
  source: any,
  allPlayers: any[],
  targetPlayerId?: string
): any[] {
  const alive = allPlayers.filter((p) => p.is_alive);

  switch (effect.targetMode) {
    case "self":
      return [source];
    case "single": {
      if (targetPlayerId) {
        const target = alive.find((p) => p.player_id === targetPlayerId);
        return target ? [target] : [];
      }
      // Default: lowest HP enemy
      const enemies = alive.filter((p) => p.player_id !== source.player_id);
      return enemies.sort((a, b) => a.current_hp - b.current_hp).slice(0, 1);
    }
    case "duo": {
      const enemies = alive.filter((p) => p.player_id !== source.player_id);
      return enemies.sort((a, b) => a.current_hp - b.current_hp).slice(0, 2);
    }
    case "aoe":
      return alive.filter((p) => p.player_id !== source.player_id);
    default:
      return [];
  }
}

// ─── Helper: Apply Instant Effect (v4) ──────────────────────
async function applyInstantEffect(
  type: string,
  value: number,
  target: any,
  gameId?: string,
  sourcePlayerId?: string
): Promise<void> {
  const sb = getClientSupabase();
  const roundedValue = Math.round(value);

  switch (type) {
    case "damage":
    case "self_damage": {
      let remainingDamage = roundedValue;

      // Shield absorption
      if (gameId) {
        const { data: shields } = await sb
          .from("active_effects")
          .select("*")
          .eq("game_id", gameId)
          .eq("target_player_id", target.id)
          .in("effect_type", ["shield_gain"]);

        if (shields && shields.length > 0) {
          for (const shield of shields) {
            if (remainingDamage <= 0) break;
            const shieldValue = shield.base_value;
            if (shieldValue <= remainingDamage) {
              remainingDamage -= shieldValue;
              await sb.from("active_effects").delete().eq("id", shield.id);
            } else {
              await sb.from("active_effects").update({ base_value: shieldValue - remainingDamage }).eq("id", shield.id);
              remainingDamage = 0;
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

        // SLOTH ENDURANCE: taking compound damage grants +1 shield
        if (target.chosen_sin === "sloth" && target.is_alive && sourcePlayerId !== target.player_id) {
          if (gameId) {
            await sb.from("active_effects").insert({
              game_id: gameId,
              target_player_id: target.id,
              source_player_id: target.id,
              effect_type: "shield_gain",
              base_value: SLOTH_ENDURANCE_SHIELD,
              applied_at_round: 0,
              duration_rounds: 1,
              card_id: "sloth-endurance",
            });
          }
        }
      }
      break;
    }
    case "heal_gain": {
      const newHp = Math.min(target.max_hp ?? STARTING_HP, target.current_hp + roundedValue);
      await sb.from("game_players").update({ current_hp: newHp }).eq("id", target.id);
      target.current_hp = newHp;
      break;
    }
    case "heal_steal": {
      // Steal HP: damage target, heal source
      const stolen = Math.min(roundedValue, target.current_hp);
      const newTargetHp = Math.max(0, target.current_hp - stolen);
      const isAlive = newTargetHp > 0;
      await sb.from("game_players").update({ current_hp: newTargetHp, is_alive: isAlive }).eq("id", target.id);
      target.current_hp = newTargetHp;
      target.is_alive = isAlive;

      // Heal the source
      if (sourcePlayerId && gameId) {
        const { data: sourcePlayer } = await sb
          .from("game_players")
          .select("*")
          .eq("player_id", sourcePlayerId)
          .eq("game_id", gameId)
          .single();
        if (sourcePlayer) {
          const newSourceHp = Math.min(sourcePlayer.max_hp ?? STARTING_HP, sourcePlayer.current_hp + stolen);
          await sb.from("game_players").update({ current_hp: newSourceHp }).eq("id", sourcePlayer.id);
        }
      }
      break;
    }
    case "shield_gain": {
      // Shields are stored as active_effects
      if (gameId) {
        await sb.from("active_effects").insert({
          game_id: gameId,
          target_player_id: target.id,
          source_player_id: sourcePlayerId || target.id,
          effect_type: "shield_gain",
          base_value: roundedValue,
          applied_at_round: 0,
          duration_rounds: 1,
          card_id: "instant-shield",
        });
      }
      break;
    }
    case "shield_steal": {
      // Steal shield from target, add to source
      if (gameId) {
        const { data: shields } = await sb
          .from("active_effects")
          .select("*")
          .eq("game_id", gameId)
          .eq("target_player_id", target.id)
          .eq("effect_type", "shield_gain");

        let stolen = 0;
        if (shields && shields.length > 0) {
          for (const shield of shields) {
            if (stolen >= roundedValue) break;
            const take = Math.min(shield.base_value, roundedValue - stolen);
            stolen += take;
            if (take >= shield.base_value) {
              await sb.from("active_effects").delete().eq("id", shield.id);
            } else {
              await sb.from("active_effects").update({ base_value: shield.base_value - take }).eq("id", shield.id);
            }
          }
        }
        if (stolen > 0 && sourcePlayerId) {
          await sb.from("active_effects").insert({
            game_id: gameId,
            target_player_id: sourcePlayerId,
            source_player_id: sourcePlayerId,
            effect_type: "shield_gain",
            base_value: stolen,
            applied_at_round: 0,
            duration_rounds: 1,
            card_id: "stolen-shield",
          });
        }
      }
      break;
    }
    case "energy_gain": {
      const currentSelfEnergy = target.current_energy ?? 0;
      const newEnergy = Math.min(currentSelfEnergy + roundedValue, MAX_ENERGY);
      await sb.from("game_players").update({ current_energy: newEnergy }).eq("id", target.id);
      target.current_energy = newEnergy;
      break;
    }
    case "energy_steal": {
      const currentTargetEnergy = target.current_energy ?? 0;
      const drained = Math.min(roundedValue, currentTargetEnergy);
      await sb.from("game_players").update({ current_energy: currentTargetEnergy - drained }).eq("id", target.id);
      target.current_energy = currentTargetEnergy - drained;
      // Give energy to source
      if (sourcePlayerId && gameId) {
        const { data: sourcePlayer } = await sb
          .from("game_players")
          .select("*")
          .eq("player_id", sourcePlayerId)
          .eq("game_id", gameId)
          .single();
        if (sourcePlayer) {
          const newEnergy = Math.min((sourcePlayer.current_energy ?? 0) + drained, MAX_ENERGY);
          await sb.from("game_players").update({ current_energy: newEnergy }).eq("id", sourcePlayer.id);
        }
      }
      break;
    }
    case "energy_block":
    case "heal_block":
    case "shield_block": {
      // Blocks are stored as active effects (debuffs)
      if (gameId) {
        await sb.from("active_effects").insert({
          game_id: gameId,
          target_player_id: target.id,
          source_player_id: sourcePlayerId || target.id,
          effect_type: type,
          base_value: roundedValue,
          applied_at_round: 0,
          duration_rounds: roundedValue,
          card_id: "block-effect",
        });
      }
      break;
    }
    case "affliction_amplify": {
      // Increase base value of target's worst affliction
      if (gameId) {
        await amplifyWorstAffliction(gameId, target.id, roundedValue);
      }
      break;
    }
    case "affliction_transfer": {
      // Move source's worst affliction to target
      if (gameId && sourcePlayerId) {
        const { data: sourceEffects } = await sb
          .from("active_effects")
          .select("*")
          .eq("game_id", gameId)
          .eq("target_player_id", sourcePlayerId)
          .in("effect_type", ["damage", "self_damage"]);

        if (sourceEffects && sourceEffects.length > 0) {
          const worst = sourceEffects.sort((a, b) => b.base_value - a.base_value)[0];
          await sb.from("active_effects")
            .update({ target_player_id: target.id })
            .eq("id", worst.id);
        }
      }
      break;
    }
  }
}

// ─── Helper: Amplify Worst Affliction ────────────────────────
async function amplifyWorstAffliction(gameId: string, targetId: string, amount: number): Promise<void> {
  const sb = getClientSupabase();
  const { data: effects } = await sb
    .from("active_effects")
    .select("*")
    .eq("game_id", gameId)
    .eq("target_player_id", targetId)
    .in("effect_type", ["damage", "self_damage"]);

  if (effects && effects.length > 0) {
    const worst = effects.sort((a, b) => b.base_value - a.base_value)[0];
    await sb.from("active_effects")
      .update({ base_value: worst.base_value + amount })
      .eq("id", worst.id);
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

  if (hand.length >= HAND_SIZE + 2) return;

  if (deck.length > 0) {
    const drawn = deck.shift()!;
    hand.push(drawn);

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

// ─── Helper: Advance Round (Simultaneous) ─────────────────────────
/**
 * Called after all locked plays have been resolved.
 * Handles: win check → round advance → compound tick → energy refresh → draw → reset to selection.
 */
async function advanceRound(gameId: string): Promise<void> {
  const sb = getClientSupabase();

  const { data: game } = await sb.from("games").select("*").eq("id", gameId).single();
  if (!game) return;

  const { data: allPlayers } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .order("seat_index");
  if (!allPlayers) return;

  const alivePlayers = allPlayers.filter((p: any) => p.is_alive);

  // Check win condition: elimination
  if (alivePlayers.length <= 1) {
    const winner = alivePlayers[0];
    await sb.from("games").update({
      status: "finished",
      winner_id: winner?.player_id || null,
      finished_at: new Date().toISOString(),
      turn_phase: "round_end",
    }).eq("id", gameId);
    return;
  }

  const newRound = game.current_round + 1;

  // Round 20 Game Over: highest HP wins
  if (newRound > MAX_ROUNDS) {
    const sortedByHp = [...alivePlayers].sort((a: any, b: any) => b.current_hp - a.current_hp);
    const winner = sortedByHp[0];
    await sb.from("games").update({
      status: "finished",
      winner_id: winner?.player_id || null,
      finished_at: new Date().toISOString(),
      current_round: MAX_ROUNDS,
      turn_phase: "round_end",
    }).eq("id", gameId);
    return;
  }

  // ROUND 16 DOUBLING
  if (newRound === ROUND_16_DOUBLING) {
    await doubleAllAfflictions(gameId);
  }

  // Resolve compound effects at round boundary
  await resolveActiveEffects(gameId, newRound);

  // Re-check alive players after effect resolution
  const { data: postEffectPlayers } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .order("seat_index");
  const stillAlive = (postEffectPlayers || []).filter((p: any) => p.is_alive);

  if (stillAlive.length <= 1) {
    const winner = stillAlive[0];
    await sb.from("games").update({
      status: "finished",
      winner_id: winner?.player_id || null,
      finished_at: new Date().toISOString(),
      turn_phase: "round_end",
    }).eq("id", gameId);
    return;
  }

  // Refresh energy and draw for each alive player
  for (const p of stillAlive) {
    const { data: freshPlayer } = await sb
      .from("game_players")
      .select("*")
      .eq("id", p.id)
      .single();
    if (freshPlayer && freshPlayer.is_alive) {
      await refreshPlayerEnergy(freshPlayer);
      await drawCard(freshPlayer);
    }
  }

  // Reset locked cards on all players and transition back to selection
  for (const p of allPlayers) {
    await sb.from("game_players").update({ locked_cards: [] }).eq("id", p.id);
  }

  await sb.from("games").update({
    current_round: newRound,
    current_player_index: 0,
    turn_phase: "selection",
    locked_plays: [],
  }).eq("id", gameId);
}

// ─── Helper: Refresh Player Energy (carry-over + gain) ──────
async function refreshPlayerEnergy(player: any): Promise<void> {
  const sb = getClientSupabase();
  // Unspent energy carries over, add +1 per round gain, cap at MAX_ENERGY
  const currentUnspent = player.current_energy ?? 0;
  const newEnergy = Math.min(currentUnspent + ENERGY_PER_TURN, MAX_ENERGY);

  await sb
    .from("game_players")
    .update({
      current_energy: newEnergy,
      max_energy: MAX_ENERGY,
      bonus_energy: 0,
    })
    .eq("id", player.id);
}

// ─── Helper: Double All Afflictions (Round 16) ──────────────
async function doubleAllAfflictions(gameId: string): Promise<void> {
  const sb = getClientSupabase();
  const { data: effects } = await sb
    .from("active_effects")
    .select("*")
    .eq("game_id", gameId);

  if (!effects) return;

  for (const effect of effects) {
    // Only double damage-type afflictions that haven't been doubled yet
    if (
      ["damage", "self_damage"].includes(effect.effect_type) &&
      !effect.doubled
    ) {
      await sb.from("active_effects")
        .update({ base_value: effect.base_value * 2, doubled: true })
        .eq("id", effect.id);
    }
  }
}

// ─── Helper: Resolve Active Effects (v4 Compound Ticks) ─────
async function resolveActiveEffects(gameId: string, currentRound: number): Promise<void> {
  const sb = getClientSupabase();

  const { data: effects } = await sb
    .from("active_effects")
    .select("*")
    .eq("game_id", gameId);

  if (!effects) return;

  for (const effect of effects) {
    // Skip shield/block effects (they're consumed on use, not ticked)
    if (["shield_gain", "heal_block", "shield_block", "energy_block"].includes(effect.effect_type)) {
      // Check if block has expired
      if (effect.effect_type.endsWith("_block")) {
        const roundsActive = currentRound - effect.applied_at_round;
        if (roundsActive > effect.duration_rounds) {
          await sb.from("active_effects").delete().eq("id", effect.id);
        }
      }
      continue;
    }

    const tick = effect.current_tick ?? 0;
    const pattern: CompoundPattern = effect.compound_pattern || "standard";

    // If tick >= duration, effect is done
    if (tick >= effect.duration_rounds) {
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

    // Calculate tick value
    const tickValue = getCompoundTickValue(effect.base_value, pattern, tick);

    // Apply the effect
    await applyInstantEffect(effect.effect_type, tickValue, target, gameId, effect.source_player_id);

    // Advance tick or expire
    const nextTick = tick + 1;
    if (nextTick >= effect.duration_rounds) {
      await sb.from("active_effects").delete().eq("id", effect.id);
    } else {
      await sb.from("active_effects").update({ current_tick: nextTick }).eq("id", effect.id);
    }
  }
}

