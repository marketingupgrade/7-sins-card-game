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
  CATCHUP_HP_THRESHOLD,
  CatchupCondition,
  COMPOUND_DURATION,
  getCompoundTickValue,
  getBaseEnergyForRound,
  MAX_ROUNDS,
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

// ─── Bot Play Turn (Multi-Card) ─────────────────────────────
// Bot plays multiple cards per turn until out of energy, then passes.
export async function botPlayTurn(gameId: string, botId: string): Promise<{
  action: "play" | "pass";
  cardName?: string;
  narratorQuip?: string;
  cardsPlayed?: number;
}> {
  const sb = getClientSupabase();

  const { data: game } = await sb.from("games").select("*").eq("id", gameId).single();
  if (!game || game.status !== "active") return { action: "pass" };

  const { data: botPlayer } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .eq("player_id", botId)
    .single();

  if (!botPlayer || !botPlayer.is_alive) return { action: "pass" };

  const { data: allPlayers } = await sb
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .order("seat_index");

  if (!allPlayers) return { action: "pass" };

  const alivePlayers = allPlayers.filter((p) => p.is_alive);
  const currentTurnPlayer = alivePlayers[game.current_player_index % alivePlayers.length];
  if (currentTurnPlayer.player_id !== botId) return { action: "pass" };

  // Wrath bot: consider Overcharge if low on energy and has HP to spare
  if (botPlayer.chosen_sin === "wrath" && (botPlayer.current_energy ?? 0) < 2 && botPlayer.current_hp > WRATH_OVERCHARGE_HP_COST + 3) {
    const newHp = botPlayer.current_hp - WRATH_OVERCHARGE_HP_COST;
    const newEnergy = Math.min((botPlayer.current_energy ?? 0) + WRATH_OVERCHARGE_ENERGY_GAIN, MAX_ENERGY);
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
    botPlayer.current_energy = newEnergy;
    botPlayer.current_hp = newHp;
  }

  // ─── Multi-Card Loop ─────────────────────────────────────────
  let currentHand: string[] = [...(botPlayer.hand || [])];
  let currentEnergy = botPlayer.current_energy ?? 0;
  let currentDiscard: string[] = [...(botPlayer.discard_pile || [])];
  let cardsPlayed = 0;
  let lastCardName: string | undefined;
  let lastNarratorQuip: string | undefined;
  const MAX_CARDS_PER_TURN = 5; // safety cap

  while (cardsPlayed < MAX_CARDS_PER_TURN) {
    if (currentHand.length === 0) break;

    // Re-fetch players for fresh HP data between card plays
    const { data: freshPlayers } = await sb
      .from("game_players")
      .select("*")
      .eq("game_id", gameId)
      .order("seat_index");
    const currentAllPlayers = freshPlayers || allPlayers;

    // Build updated bot state for card selection
    const botState = { ...botPlayer, current_energy: currentEnergy, hand: currentHand };
    const cardToPlay = selectBestCard(currentHand, botState, currentAllPlayers, game.current_round);
    if (!cardToPlay) break;

    const card = getCardById(cardToPlay.cardId);
    if (!card) break;

    const enemies = currentAllPlayers.filter((p) => p.is_alive && p.player_id !== botId);
    const targetId = cardToPlay.targetId || (enemies.length > 0 ? selectBestTarget(enemies) : undefined);

    // Spend energy and update hand
    const energyAfterPlay = currentEnergy - card.cost;
    const newHand = currentHand.filter((id) => id !== cardToPlay.cardId);
    currentDiscard.push(cardToPlay.cardId);

    await sb
      .from("game_players")
      .update({ hand: newHand, discard_pile: currentDiscard, current_energy: energyAfterPlay })
      .eq("id", botPlayer.id);

    // Greed AVARICE
    if (botPlayer.chosen_sin === "greed" && card.cost >= GREED_AVARICE_COST_THRESHOLD) {
      const currentBonus = botPlayer.bonus_energy ?? 0;
      await sb
        .from("game_players")
        .update({ bonus_energy: currentBonus + GREED_AVARICE_BONUS })
        .eq("id", botPlayer.id);
    }

    // Resolve Effects: FLAT vs COMPOUNDING
    for (const effect of card.effects) {
      const targets = resolveTargets(effect, botPlayer, currentAllPlayers, targetId);
      for (const target of targets) {
        if (card.cardType === "compounding") {
          const firstTickValue = getCompoundTickValue(effect.baseValue, 0);
          await applyInstantEffect(effect.type, firstTickValue, target, gameId);
          await sb.from("active_effects").insert({
            game_id: gameId,
            target_player_id: target.id,
            source_player_id: botPlayer.id,
            effect_type: effect.type,
            base_value: effect.baseValue,
            applied_at_round: game.current_round,
            duration_rounds: COMPOUND_DURATION,
            card_id: cardToPlay.cardId,
            is_compounding: true,
            current_tick: 1,
          });
        } else {
          await applyInstantEffect(effect.type, effect.baseValue, target, gameId);
        }
      }
    }

    // Catch-Up Bonus Resolution
    if (card.catchup) {
      const { data: freshBot } = await sb
        .from("game_players")
        .select("current_hp, is_alive")
        .eq("game_id", gameId)
        .eq("player_id", botId)
        .single();

      const botHp = freshBot?.current_hp ?? botPlayer.current_hp;
      const catchupMet = evaluateCatchupCondition(
        card.catchup.condition,
        botHp,
        currentAllPlayers,
        botId,
        targetId
      );

      if (catchupMet) {
        const bonusValue = card.catchup.bonusValue;
        switch (card.catchup.type) {
          case "bonus_damage": {
            const dmgTargets = currentAllPlayers.filter((p) => p.is_alive && p.player_id !== botId);
            const primaryTarget = targetId
              ? dmgTargets.find((p) => p.player_id === targetId) || dmgTargets[0]
              : dmgTargets[0];
            if (primaryTarget) {
              await applyInstantEffect("damage", bonusValue, primaryTarget, gameId);
            }
            break;
          }
          case "bonus_heal": {
            const selfTarget = currentAllPlayers.find((p) => p.player_id === botId);
            if (selfTarget) {
              await applyInstantEffect("heal", bonusValue, selfTarget, gameId);
            }
            break;
          }
          case "bonus_debuff_all": {
            const enemies2 = currentAllPlayers.filter((p) => p.is_alive && p.player_id !== botId);
            for (const enemy of enemies2) {
              await sb.from("active_effects").insert({
                game_id: gameId,
                target_player_id: enemy.id,
                source_player_id: botPlayer.id,
                effect_type: "debuff",
                base_value: card.catchup.bonusValue,
                applied_at_round: game.current_round,
                duration_rounds: card.catchup.bonusDuration ?? 2,
                card_id: cardToPlay.cardId,
                is_compounding: false,
                current_tick: 0,
              });
            }
            break;
          }
        }
      }
    }

    // Log the card play
    await sb.from("game_log").insert({
      game_id: gameId,
      player_id: botPlayer.id,
      action_type: "play_card",
      action_data: {
        cardId: cardToPlay.cardId,
        targetPlayerId: targetId,
        energySpent: card.cost,
        energyRemaining: energyAfterPlay,
        cardType: card.cardType,
      },
      round_number: game.current_round,
    });

    // Update loop state
    currentHand = newHand;
    currentEnergy = energyAfterPlay;
    cardsPlayed++;
    lastCardName = card.name;
    lastNarratorQuip = card.narratorQuip;
  }

  // ─── After playing all cards, draw if none played, then pass ──
  if (cardsPlayed === 0) {
    await drawCardForBot(botPlayer);
  }

  await sb.from("game_log").insert({
    game_id: gameId,
    player_id: botPlayer.id,
    action_type: "pass",
    action_data: { unspentEnergy: currentEnergy, cardsPlayedThisTurn: cardsPlayed },
    round_number: game.current_round,
  });

  await advanceBotTurn(gameId);

  return {
    action: cardsPlayed > 0 ? "play" : "pass",
    cardName: lastCardName,
    narratorQuip: lastNarratorQuip,
    cardsPlayed,
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
  const cards = hand.map((id) => getCardById(id)).filter((c) => c && c.cost <= botEnergy);
  if (cards.length === 0) return null;

  const botHpPercent = bot.current_hp / bot.max_hp;
  const enemies = allPlayers.filter((p: any) => p.is_alive && p.player_id !== bot.player_id);

  // Priority: catch-up cards when behind
  if (botHpPercent < 0.5) {
    const catchupCards = cards.filter((c) => c!.catchup);
    if (catchupCards.length > 0) {
      const bestCatchup = catchupCards.find((c) => {
        if (c!.catchup!.condition === "hp_below_threshold") return bot.current_hp <= CATCHUP_HP_THRESHOLD;
        if (c!.catchup!.condition === "hp_less_than_any_opponent") return enemies.some((e) => bot.current_hp < e.current_hp);
        if (c!.catchup!.condition === "hp_lowest") return enemies.every((e) => bot.current_hp <= e.current_hp);
        return false;
      });
      if (bestCatchup) return { cardId: bestCatchup.id };
    }
  }

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

  // Priority: prefer compounding cards early (more total value over 3 rounds)
  if (currentRound <= 4) {
    const compoundDmg = cards.filter((c) => c!.cardType === "compounding" && c!.effects.some((e) => e.type === "damage" && e.target !== "self"));
    if (compoundDmg.length > 0) {
      const best = compoundDmg.sort((a, b) => {
        const aDmg = a!.effects.reduce((sum, e) => sum + (e.type === "damage" && e.target !== "self" ? e.baseValue * 4 : 0), 0);
        const bDmg = b!.effects.reduce((sum, e) => sum + (e.type === "damage" && e.target !== "self" ? e.baseValue * 4 : 0), 0);
        if (bDmg !== aDmg) return bDmg - aDmg;
        return (a!.cost || 0) - (b!.cost || 0);
      })[0];
      if (best) return { cardId: best.id };
    }
  }

  // Priority: flat damage cards late game (immediate impact)
  const damageCards = cards.filter((c) => c!.effects.some((e) => e.type === "damage" && e.target !== "self"));
  if (damageCards.length > 0) {
    const best = damageCards.sort((a, b) => {
      const aTotal = a!.effects.reduce((sum, e) => {
        if (e.type === "damage" && e.target !== "self") {
          return sum + (a!.cardType === "compounding" ? e.baseValue * 4 : e.baseValue);
        }
        return sum;
      }, 0);
      const bTotal = b!.effects.reduce((sum, e) => {
        if (e.type === "damage" && e.target !== "self") {
          return sum + (b!.cardType === "compounding" ? e.baseValue * 4 : e.baseValue);
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

// ─── Resolve Targets ────────────────────────────────────────
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

// ─── Apply Instant Effect (with shield absorption) ─────────
async function applyInstantEffect(type: string, value: number, target: any, gameId?: string): Promise<void> {
  const sb = getClientSupabase();
  switch (type) {
    case "damage": {
      let remainingDamage = value;

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
            const shieldValue = shield.base_value;
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
        const newHp = Math.max(0, Math.round(target.current_hp - remainingDamage));
        await sb.from("game_players").update({ current_hp: newHp, is_alive: newHp > 0 }).eq("id", target.id);
        target.current_hp = newHp;
        target.is_alive = newHp > 0;
      }
      break;
    }
    case "heal": {
      const newHp = Math.min(target.max_hp ?? STARTING_HP, Math.round(target.current_hp + value));
      await sb.from("game_players").update({ current_hp: newHp }).eq("id", target.id);
      target.current_hp = newHp;
      break;
    }
    case "shield": {
      // Shield is stored as an active effect, applied separately
      if (gameId) {
        await sb.from("active_effects").insert({
          game_id: gameId,
          target_player_id: target.id,
          source_player_id: target.id,
          effect_type: "shield",
          base_value: value,
          applied_at_round: 0,
          duration_rounds: 10, // Shields persist until consumed (capped at game length)
          card_id: "instant_shield",
          is_compounding: false,
          current_tick: 0,
        });
      }
      break;
    }
    case "energy_drain": {
      const currentEnergy = target.current_energy ?? 0;
      const drained = Math.min(currentEnergy, value);
      await sb.from("game_players").update({ current_energy: currentEnergy - drained }).eq("id", target.id);
      target.current_energy = currentEnergy - drained;
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

  // Don't draw if hand is already at max
  if (hand.length >= HAND_SIZE + 2) return;

  if (deck.length === 0 && discard.length > 0) {
    deck = shuffleDeck(discard);
    discard = [];
  }

  if (deck.length > 0) {
    const drawn = deck.shift()!;
    hand.push(drawn);

    // If hand exceeds hard limit, discard oldest cards
    while (hand.length > HAND_SIZE + 2) {
      const discarded = hand.shift()!;
      discard.push(discarded);
    }

    await sb.from("game_players").update({ hand, deck, discard_pile: discard }).eq("id", player.id);
  }
}

// ─── Advance Turn ───────────────────────────────────────────
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
    newRound = game.current_round + 1;

    // ─── Round 10 Game Over: highest HP wins ─────────────────
    if (newRound > MAX_ROUNDS) {
      const sortedByHp = [...alivePlayers].sort((a, b) => b.current_hp - a.current_hp);
      const winner = sortedByHp[0];
      await sb.from("games").update({
        status: "finished",
        winner_id: winner?.player_id || null,
        finished_at: new Date().toISOString(),
        current_round: MAX_ROUNDS,
      }).eq("id", gameId);
      return;
    }

    // Resolve compounding effects (tick them forward)
    await resolveActiveEffects(gameId, newRound);

    // Re-check alive players after effect resolution (effects can kill)
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
      }).eq("id", gameId);
      return;
    }

    // Refresh energy and draw for each alive player
    for (const p of stillAlive) {
      const { data: freshPlayer } = await sb.from("game_players").select("*").eq("id", p.id).single();
      if (freshPlayer && freshPlayer.is_alive) {
        await refreshBotEnergy(freshPlayer, newRound);
        await drawCardForBot(freshPlayer);
      }
    }

    // Recalculate nextIndex based on updated alive list
    nextIndex = 0;
  }

  await sb.from("games").update({ current_player_index: nextIndex, current_round: newRound }).eq("id", gameId);
}

// ─── Resolve Active Effects (Fibonacci Compounding) ─────────
async function resolveActiveEffects(gameId: string, _currentRound: number): Promise<void> {
  const sb = getClientSupabase();
  const { data: effects } = await sb.from("active_effects").select("*").eq("game_id", gameId);
  if (!effects) return;

  for (const effect of effects) {
    // Skip shield effects (they're consumed on damage, not ticked)
    if (effect.effect_type === "shield") continue;

    const { data: target } = await sb.from("game_players").select("*").eq("id", effect.target_player_id).single();
    if (!target || !target.is_alive) {
      await sb.from("active_effects").delete().eq("id", effect.id);
      continue;
    }

    if (effect.is_compounding) {
      // COMPOUNDING: Apply current tick value, then advance tick
      const currentTick = effect.current_tick ?? 1;

      if (currentTick >= COMPOUND_DURATION) {
        // All ticks done, remove effect
        await sb.from("active_effects").delete().eq("id", effect.id);
        continue;
      }

      const tickValue = getCompoundTickValue(effect.base_value, currentTick);

      switch (effect.effect_type) {
        case "damage":
          await applyInstantEffect("damage", tickValue, target, gameId);
          break;
        case "heal":
          await applyInstantEffect("heal", tickValue, target, gameId);
          break;
        case "debuff":
          await applyInstantEffect("damage", Math.round(tickValue / 2), target, gameId);
          break;
        case "energy_drain":
          await applyInstantEffect("energy_drain", tickValue, target, gameId);
          break;
      }

      const nextTick = currentTick + 1;
      if (nextTick >= COMPOUND_DURATION) {
        await sb.from("active_effects").delete().eq("id", effect.id);
      } else {
        await sb.from("active_effects").update({ current_tick: nextTick }).eq("id", effect.id);
      }
    } else {
      // NON-COMPOUNDING (legacy/debuff): tick based on duration
      const roundsActive = _currentRound - effect.applied_at_round;
      if (roundsActive > effect.duration_rounds) {
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
  await sb.from("game_players").update({
    current_energy: totalEnergy,
    max_energy: totalEnergy,
    bonus_energy: bonusEnergy,
  }).eq("id", player.id);
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
