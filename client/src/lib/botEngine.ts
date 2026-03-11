/**
 * Bot Engine (v4) - AI-controlled players for solo testing
 *
 * ALL cards are compound. No flat cards exist.
 * Bots use v4 passives and compound patterns.
 * Overcharge removed — Wrath uses FURY passive instead.
 */

import { getClientSupabase } from "../../../shared/supabaseClient";
import { getCardById, getDeckForSin } from "../../../shared/cardData";
import {
  SinType,
  HAND_SIZE,
  STARTING_HP,
  MAX_ENERGY,
  MAX_ROUNDS,
  ROUND_16_DOUBLING,
  CompoundPattern,
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

  // ─── Multi-Card Loop ─────────────────────────────────────────
  let currentHand: string[] = [...(botPlayer.hand || [])];
  let currentEnergy = botPlayer.current_energy ?? 0;
  let currentDiscard: string[] = [...(botPlayer.discard_pile || [])];
  let cardsPlayed = 0;
  let lastCardName: string | undefined;
  let lastNarratorQuip: string | undefined;
  const MAX_CARDS_PER_TURN = 5;
  const sin = botPlayer.chosen_sin as SinType;

  while (cardsPlayed < MAX_CARDS_PER_TURN) {
    if (currentHand.length === 0) break;

    const { data: freshPlayers } = await sb
      .from("game_players")
      .select("*")
      .eq("game_id", gameId)
      .order("seat_index");
    const currentAllPlayers = freshPlayers || allPlayers;

    const botState = { ...botPlayer, current_energy: currentEnergy, hand: currentHand };
    const cardToPlay = selectBestCard(currentHand, botState, currentAllPlayers, game.current_round);
    if (!cardToPlay) break;

    const card = getCardById(cardToPlay.cardId);
    if (!card) break;

    const enemies = currentAllPlayers.filter((p) => p.is_alive && p.player_id !== botId);
    const targetId = cardToPlay.targetId || (enemies.length > 0 ? selectBestTarget(enemies) : undefined);

    let energyAfterPlay = currentEnergy - card.cost;
    const newHand = currentHand.filter((id) => id !== cardToPlay.cardId);
    currentDiscard.push(cardToPlay.cardId);

    // V4 PASSIVES on card play
    if (sin === "pride" && card.cost === 0) {
      await sb.from("active_effects").insert({
        game_id: gameId,
        target_player_id: botPlayer.id,
        source_player_id: botPlayer.id,
        effect_type: "shield_gain",
        base_value: PRIDE_HUBRIS_SHIELD,
        applied_at_round: game.current_round,
        duration_rounds: 1,
        card_id: cardToPlay.cardId,
      });
    }

    if (sin === "gluttony" && card.effects.some((e) => e.targetMode === "aoe")) {
      energyAfterPlay = Math.min(energyAfterPlay + GLUTTONY_DEVOUR_ENERGY, MAX_ENERGY);
    }

    if (sin === "greed" && card.effects.some((e) => ["heal_steal", "shield_steal", "energy_steal"].includes(e.type))) {
      energyAfterPlay = Math.min(energyAfterPlay + GREED_AVARICE_ENERGY, MAX_ENERGY);
    }

    await sb
      .from("game_players")
      .update({ hand: newHand, discard_pile: currentDiscard, current_energy: energyAfterPlay })
      .eq("id", botPlayer.id);

    // Resolve Effects (ALL COMPOUND)
    for (const effect of card.effects) {
      const targets = resolveTargets(effect, botPlayer, currentAllPlayers, targetId);
      const firstTickValue = getCompoundTickValue(effect.baseValue, card.compoundPattern, 0);

      for (const target of targets) {
        await applyInstantEffect(effect.type, firstTickValue, target, gameId, botPlayer.id);

        // WRATH FURY
        if (sin === "wrath" && effect.type === "self_damage") {
          const lowestEnemy = enemies.sort((a, b) => a.current_hp - b.current_hp)[0];
          if (lowestEnemy) {
            await applyInstantEffect("damage", WRATH_FURY_BONUS_DAMAGE, lowestEnemy, gameId, botPlayer.id);
          }
          await applyInstantEffect("heal_gain", WRATH_FURY_HEAL, botPlayer, gameId, botPlayer.id);
        }

        // LUST TEMPTATION
        if (sin === "lust" && effect.type === "damage" && effect.targetMode === "single") {
          await applyInstantEffect("heal_gain", LUST_TEMPTATION_HEAL, botPlayer, gameId, botPlayer.id);
        }

        // ENVY JEALOUSY
        if (sin === "envy" && effect.type === "damage" && target.player_id !== botId) {
          await amplifyWorstAffliction(gameId, target.id, ENVY_JEALOUSY_AMPLIFY);
        }

        // Store compound effect for future ticks
        if (effect.duration > 1) {
          await sb.from("active_effects").insert({
            game_id: gameId,
            target_player_id: target.id,
            source_player_id: botPlayer.id,
            effect_type: effect.type,
            base_value: effect.baseValue,
            applied_at_round: game.current_round,
            duration_rounds: effect.duration,
            card_id: cardToPlay.cardId,
            current_tick: 1,
            compound_pattern: card.compoundPattern,
          });
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
        compoundPattern: card.compoundPattern,
      },
      round_number: game.current_round,
    });

    currentHand = newHand;
    currentEnergy = energyAfterPlay;
    cardsPlayed++;
    lastCardName = card.name;
    lastNarratorQuip = card.description;
  }

  // After playing all cards, draw if none played, then pass
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

// ─── Resolve Targets (v4 targetMode) ────────────────────────
function resolveTargets(effect: any, source: any, allPlayers: any[], targetPlayerId?: string): any[] {
  const alive = allPlayers.filter((p) => p.is_alive);
  switch (effect.targetMode) {
    case "self":
      return [source];
    case "single": {
      if (targetPlayerId) {
        const target = alive.find((p) => p.player_id === targetPlayerId);
        return target ? [target] : [];
      }
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

// ─── Apply Instant Effect (v4 — with shield absorption) ─────
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
        const newHp = Math.max(0, Math.round(target.current_hp - remainingDamage));
        await sb.from("game_players").update({ current_hp: newHp, is_alive: newHp > 0 }).eq("id", target.id);
        target.current_hp = newHp;
        target.is_alive = newHp > 0;

        // SLOTH ENDURANCE
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
      const newHp = Math.min(target.max_hp ?? STARTING_HP, Math.round(target.current_hp + value));
      await sb.from("game_players").update({ current_hp: newHp }).eq("id", target.id);
      target.current_hp = newHp;
      break;
    }
    case "heal_steal": {
      const stolen = Math.min(roundedValue, target.current_hp);
      const newTargetHp = Math.max(0, target.current_hp - stolen);
      await sb.from("game_players").update({ current_hp: newTargetHp, is_alive: newTargetHp > 0 }).eq("id", target.id);
      target.current_hp = newTargetHp;
      target.is_alive = newTargetHp > 0;

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
      if (gameId) {
        await amplifyWorstAffliction(gameId, target.id, roundedValue);
      }
      break;
    }
    case "affliction_transfer": {
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

// ─── Draw Card for Bot ──────────────────────────────────────
async function drawCardForBot(player: any): Promise<void> {
  const sb = getClientSupabase();
  let deck: string[] = player.deck || [];
  const hand: string[] = player.hand || [];
  let discard: string[] = player.discard_pile || [];

  if (hand.length >= HAND_SIZE + 2) return;

  if (deck.length === 0 && discard.length > 0) {
    deck = shuffleDeck(discard);
    discard = [];
  }

  if (deck.length > 0) {
    const drawn = deck.shift()!;
    hand.push(drawn);

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

    // ROUND 16 DOUBLING
    if (newRound === ROUND_16_DOUBLING) {
      await doubleAllAfflictions(gameId);
    }

    await resolveActiveEffects(gameId, newRound);

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

    for (const p of stillAlive) {
      const { data: freshPlayer } = await sb.from("game_players").select("*").eq("id", p.id).single();
      if (freshPlayer && freshPlayer.is_alive) {
        await refreshBotEnergy(freshPlayer);
        await drawCardForBot(freshPlayer);
      }
    }

    nextIndex = 0;
  }

  await sb.from("games").update({ current_player_index: nextIndex, current_round: newRound }).eq("id", gameId);
}

// ─── Double All Afflictions (Round 16) ──────────────────────
async function doubleAllAfflictions(gameId: string): Promise<void> {
  const sb = getClientSupabase();
  const { data: effects } = await sb
    .from("active_effects")
    .select("*")
    .eq("game_id", gameId);

  if (!effects) return;

  for (const effect of effects) {
    if (["damage", "self_damage"].includes(effect.effect_type) && !effect.doubled) {
      await sb.from("active_effects")
        .update({ base_value: effect.base_value * 2, doubled: true })
        .eq("id", effect.id);
    }
  }
}

// ─── Resolve Active Effects (v4 Compound Ticks) ─────────────
async function resolveActiveEffects(gameId: string, currentRound: number): Promise<void> {
  const sb = getClientSupabase();
  const { data: effects } = await sb.from("active_effects").select("*").eq("game_id", gameId);
  if (!effects) return;

  for (const effect of effects) {
    if (["shield_gain", "heal_block", "shield_block", "energy_block"].includes(effect.effect_type)) {
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

    if (tick >= effect.duration_rounds) {
      await sb.from("active_effects").delete().eq("id", effect.id);
      continue;
    }

    const { data: target } = await sb.from("game_players").select("*").eq("id", effect.target_player_id).single();
    if (!target || !target.is_alive) {
      await sb.from("active_effects").delete().eq("id", effect.id);
      continue;
    }

    const tickValue = getCompoundTickValue(effect.base_value, pattern, tick);
    await applyInstantEffect(effect.effect_type, tickValue, target, gameId, effect.source_player_id);

    const nextTick = tick + 1;
    if (nextTick >= effect.duration_rounds) {
      await sb.from("active_effects").delete().eq("id", effect.id);
    } else {
      await sb.from("active_effects").update({ current_tick: nextTick }).eq("id", effect.id);
    }
  }
}

// ─── Refresh Energy (v4 — fixed 3/turn) ────────────────────
async function refreshBotEnergy(player: any): Promise<void> {
  const sb = getClientSupabase();
  const totalEnergy = MAX_ENERGY;
  await sb.from("game_players").update({
    current_energy: totalEnergy,
    max_energy: totalEnergy,
    bonus_energy: 0,
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
