#!/usr/bin/env python3
"""
7 Deadly Sins — Final Reckoning + HP Pool Evaluation
=====================================================

Expands the defensive evaluation with two new variables:
  1. "Final Reckoning" at round 20: ALL cards in hand are played
     regardless of energy. Highest HP in the aftermath wins.
  2. Variable HP pools: 200 (current), 333, 666

Simulation matrix:
  3 HP pools × 5 defense mults × 2 reckoning modes = 30 configurations
  1,500 games per matchup × 28 matchups = 42,000 games per config
  Total: 1,260,000 games
"""

import json
import re
import math
import random
import sys
import os
from dataclasses import dataclass, field
from typing import Dict, List, Tuple, Optional
from collections import defaultdict
import statistics

# Import base components from the original model
sys.path.insert(0, os.path.dirname(__file__))
from defensive_model import (
    COMPOUND_TICKS, get_compound_tick, get_compound_tick_value,
    MAX_ROUNDS, HAND_SIZE, CARDS_PER_DECK, MAX_ENERGY, STARTING_ENERGY,
    ENERGY_PER_TURN, ROUND_16_DOUBLING,
    WRATH_VENGEANCE_PCT, SLOTH_ENDURANCE_MULT, SLOTH_ENDURANCE_CAP,
    GREED_TAX_PCT, GREED_TAX_TICK, ENVY_JEALOUSY_PCT,
    PRIDE_HUBRIS_MULT, LUST_TEMPTATION_PCT, GLUTTONY_DEVOURER_ENERGY,
    SINS, DEFENSIVE_EFFECTS, OFFENSIVE_EFFECTS,
    Card, CardEffect, ActiveEffect, GameMetrics,
    parse_cards, calculate_entropy,
)


# ─── Enhanced Player State ───────────────────────────────────
@dataclass
class SimPlayer:
    id: int
    sin: str
    hp: int = 200
    max_hp: int = 200
    shield: int = 0
    energy: int = STARTING_ENERGY
    hand: List[Card] = field(default_factory=list)
    deck: List[Card] = field(default_factory=list)
    discard: List[Card] = field(default_factory=list)
    is_alive: bool = True
    bonus_energy: int = 0

    def draw_cards(self, n: int):
        for _ in range(n):
            if not self.deck:
                if not self.discard:
                    break
                self.deck = self.discard[:]
                self.discard = []
                random.shuffle(self.deck)
            if self.deck:
                self.hand.append(self.deck.pop())


# ─── Enhanced Game Metrics ───────────────────────────────────
@dataclass
class EnhancedGameMetrics:
    game_length: int = 0
    winner_sin: str = ""
    loser_sin: str = ""
    winner_was_trailing: bool = False
    blowout: bool = False
    timeout: bool = False
    reckoning_triggered: bool = False
    reckoning_cards_played: int = 0
    reckoning_hp_swing: float = 0
    reckoning_decisive: bool = False  # Did reckoning change who would have won?
    hp_swings: List[float] = field(default_factory=list)
    defensive_rounds: int = 0
    total_rounds: int = 0
    cards_played_types: Dict[str, int] = field(default_factory=lambda: defaultdict(int))
    min_hp_seen: float = 200
    max_damage_round: float = 0
    final_hp_diff: float = 0
    total_cards_played: int = 0


# ─── Enhanced Game Simulator ─────────────────────────────────
class EnhancedGameSimulator:
    """
    Simulates 1v1 games with configurable:
      - Defensive multiplier
      - HP pool
      - Final Reckoning mechanic (round 20 hand dump)
    """

    def __init__(self, all_cards: List[Card], defense_mult: float = 1.0,
                 hp_pool: int = 200, final_reckoning: bool = False):
        self.all_cards = all_cards
        self.defense_mult = defense_mult
        self.hp_pool = hp_pool
        self.final_reckoning = final_reckoning
        self.cards_by_sin: Dict[str, List[Card]] = defaultdict(list)
        for c in all_cards:
            self.cards_by_sin[c.sin].append(c)

    def _apply_defense_scaling(self, card: Card) -> Card:
        new_effects = []
        for e in card.effects:
            if e.type in DEFENSIVE_EFFECTS:
                new_effects.append(CardEffect(
                    type=e.type,
                    base_value=round(e.base_value * self.defense_mult),
                    duration=e.duration,
                    target_mode=e.target_mode,
                ))
            else:
                new_effects.append(e)
        return Card(
            id=card.id, name=card.name, sin=card.sin,
            cost=card.cost, tier=card.tier,
            compound_pattern=card.compound_pattern,
            effects=new_effects,
        )

    def _build_deck(self, sin: str) -> List[Card]:
        pool = self.cards_by_sin[sin]
        deck = random.sample(pool, min(CARDS_PER_DECK, len(pool)))
        if len(deck) < CARDS_PER_DECK:
            deck = (deck * (CARDS_PER_DECK // len(deck) + 1))[:CARDS_PER_DECK]
        deck = [self._apply_defense_scaling(c) for c in deck]
        random.shuffle(deck)
        return deck

    def _select_card(self, player: SimPlayer, opponent: SimPlayer,
                     ignore_energy: bool = False) -> Optional[Card]:
        if ignore_energy:
            playable = list(player.hand)
        else:
            playable = [c for c in player.hand if c.cost <= player.energy]
        if not playable:
            return None

        def card_score(c: Card) -> float:
            score = 0.0
            for e in c.effects:
                total_val = sum(
                    get_compound_tick_value(e.base_value, c.compound_pattern, t)
                    for t in range(e.duration)
                )
                if e.type == "damage":
                    score += total_val * 1.0
                elif e.type == "self_damage":
                    score -= total_val * 0.8
                elif e.type in ("heal_gain", "heal_steal"):
                    hp_ratio = player.hp / self.hp_pool
                    score += total_val * (1.5 if hp_ratio < 0.5 else 0.8)
                elif e.type in ("shield_gain", "shield_steal"):
                    score += total_val * 0.9
                elif e.type == "energy_regen":
                    score += total_val * 2.0
                elif e.type == "energy_steal":
                    score += total_val * 1.5
                elif e.type in ("heal_block", "shield_block", "energy_block"):
                    score += total_val * 0.6
                elif e.type == "affliction_amplify":
                    score += total_val * 0.7
                elif e.type == "draw_boost":
                    score += total_val * 1.5
                elif e.type == "draw_reduction":
                    score += total_val * 0.5
                elif e.type == "discard_burn":
                    score += total_val * 0.4
            return score

        best = max(playable, key=card_score)
        if card_score(best) > 0:
            return best
        return None

    def _resolve_effect_tick(self, effect: ActiveEffect, players: List[SimPlayer],
                             current_round: int) -> Dict[str, float]:
        target = players[effect.target_id]
        source = players[effect.source_id]
        if not target.is_alive:
            return {}

        tick_val = get_compound_tick_value(
            effect.base_value, effect.compound_pattern, effect.current_tick
        )

        if current_round >= ROUND_16_DOUBLING and not effect.doubled:
            tick_val *= 2
            effect.doubled = True

        metrics = {}

        if effect.effect_type == "damage":
            actual_dmg = tick_val
            if target.shield > 0:
                absorbed = min(target.shield, actual_dmg)
                target.shield -= absorbed
                actual_dmg -= absorbed
            target.hp -= actual_dmg
            metrics["damage_dealt"] = tick_val

            if target.sin == "wrath" and target.is_alive:
                reflect = round(tick_val * WRATH_VENGEANCE_PCT)
                source.hp -= reflect

            if source.sin == "lust":
                heal_amt = round(tick_val * LUST_TEMPTATION_PCT * self.defense_mult)
                source.hp = min(self.hp_pool, source.hp + heal_amt)
                metrics["passive_heal"] = heal_amt

            if source.sin == "greed" and effect.current_tick == GREED_TAX_TICK:
                shield_amt = round(tick_val * GREED_TAX_PCT * self.defense_mult)
                source.shield += shield_amt
                metrics["passive_shield"] = shield_amt

        elif effect.effect_type == "self_damage":
            target.hp -= tick_val
            metrics["self_damage"] = tick_val

        elif effect.effect_type == "heal_gain":
            target.hp = min(self.hp_pool, target.hp + tick_val)
            metrics["heal"] = tick_val

        elif effect.effect_type == "shield_gain":
            target.shield += tick_val
            metrics["shield"] = tick_val

        elif effect.effect_type == "heal_steal":
            stolen = min(tick_val, target.hp)
            target.hp -= stolen
            source.hp = min(self.hp_pool, source.hp + stolen)
            metrics["heal_steal"] = stolen

        elif effect.effect_type == "shield_steal":
            stolen = min(tick_val, target.shield)
            target.shield -= stolen
            source.shield += stolen

        elif effect.effect_type == "energy_steal":
            stolen = min(tick_val, target.energy)
            target.energy -= stolen
            source.energy = min(MAX_ENERGY, source.energy + stolen)

        elif effect.effect_type == "energy_regen":
            source.energy = min(MAX_ENERGY, source.energy + tick_val)

        elif effect.effect_type == "energy_gain":
            target.energy = min(MAX_ENERGY, target.energy + tick_val)

        elif effect.effect_type == "draw_boost":
            target.draw_cards(tick_val)

        for p in players:
            if p.hp <= 0:
                p.hp = 0
                p.is_alive = False

        return metrics

    def _play_card_effects(self, card: Card, player: SimPlayer, opponent: SimPlayer,
                           players: List[SimPlayer], active_effects: List[ActiveEffect],
                           round_num: int, metrics: EnhancedGameMetrics):
        """Play a card: create active effects, track metrics."""
        hubris_mult = 1.0
        if player.sin == "pride" and card.cost >= 3:
            hubris_mult = PRIDE_HUBRIS_MULT

        for e in card.effects:
            target_id = player.id if e.target_mode == "self" else (1 - player.id)
            bv = e.base_value
            if hubris_mult > 1.0:
                bv = round(bv * hubris_mult)
            active_effects.append(ActiveEffect(
                target_id=target_id,
                source_id=player.id,
                effect_type=e.type,
                base_value=bv,
                applied_at_round=round_num,
                duration=e.duration,
                compound_pattern=card.compound_pattern,
            ))
            metrics.cards_played_types[e.type] += 1

        metrics.total_cards_played += 1
        player.discard.append(card)

    def simulate_game(self, sin1: str, sin2: str) -> EnhancedGameMetrics:
        metrics = EnhancedGameMetrics()
        metrics.min_hp_seen = self.hp_pool

        p1 = SimPlayer(id=0, sin=sin1, hp=self.hp_pool, max_hp=self.hp_pool,
                        deck=self._build_deck(sin1))
        p2 = SimPlayer(id=1, sin=sin2, hp=self.hp_pool, max_hp=self.hp_pool,
                        deck=self._build_deck(sin2))
        players = [p1, p2]

        p1.draw_cards(HAND_SIZE)
        p2.draw_cards(HAND_SIZE)

        active_effects: List[ActiveEffect] = []
        prev_hp = [self.hp_pool, self.hp_pool]
        mid_hp = [self.hp_pool, self.hp_pool]  # Track HP at midpoint for comeback detection

        for round_num in range(1, MAX_ROUNDS + 1):
            if not p1.is_alive or not p2.is_alive:
                break

            metrics.total_rounds = round_num
            is_final_round = (round_num == MAX_ROUNDS)
            is_reckoning = is_final_round and self.final_reckoning

            # Energy refresh
            for p in players:
                if p.is_alive:
                    p.energy = min(MAX_ENERGY, p.energy + ENERGY_PER_TURN)

            # Sloth ENDURANCE passive (scaled)
            for p in players:
                if p.sin == "sloth" and p.is_alive:
                    shield_gen = round(
                        p.energy * len(p.hand) * SLOTH_ENDURANCE_MULT * self.defense_mult
                    )
                    shield_gen = min(shield_gen, round(SLOTH_ENDURANCE_CAP * self.defense_mult))
                    p.shield += shield_gen

            # ─── FINAL RECKONING: Play ALL cards in hand ─────
            if is_reckoning:
                metrics.reckoning_triggered = True
                hp_before_reckoning = [p1.hp, p2.hp]

                # Each player plays every card in hand, ignoring energy
                for p in players:
                    if not p.is_alive:
                        continue
                    # Sort hand by score (best first) to maximize impact
                    opponent = players[1 - p.id]
                    scored_hand = sorted(
                        p.hand[:],  # copy
                        key=lambda c: sum(
                            sum(get_compound_tick_value(e.base_value, c.compound_pattern, t)
                                for t in range(e.duration))
                            for e in c.effects if e.type == "damage"
                        ),
                        reverse=True
                    )
                    reckoning_count = len(scored_hand)
                    metrics.reckoning_cards_played += reckoning_count

                    for card in scored_hand:
                        if card in p.hand:
                            p.hand.remove(card)
                            self._play_card_effects(
                                card, p, opponent, players,
                                active_effects, round_num, metrics
                            )

            else:
                # Normal selection: pick one best card
                defensive_this_round = False
                for p in players:
                    if not p.is_alive:
                        continue
                    opponent = players[1 - p.id]
                    card = self._select_card(p, opponent)
                    if card:
                        p.hand.remove(card)
                        p.energy -= card.cost
                        has_def = any(e.type in DEFENSIVE_EFFECTS for e in card.effects)
                        if has_def:
                            defensive_this_round = True
                        self._play_card_effects(
                            card, p, opponent, players,
                            active_effects, round_num, metrics
                        )

                if defensive_this_round:
                    metrics.defensive_rounds += 1

            # Resolution phase — tick all active effects
            round_damage = [0.0, 0.0]
            effects_to_remove = []
            for i, eff in enumerate(active_effects):
                if eff.current_tick >= eff.duration:
                    effects_to_remove.append(i)
                    continue
                result = self._resolve_effect_tick(eff, players, round_num)
                if "damage_dealt" in result:
                    round_damage[eff.target_id] += result["damage_dealt"]
                eff.current_tick += 1

            for i in sorted(effects_to_remove, reverse=True):
                active_effects.pop(i)

            # Track HP swings
            for p in players:
                swing = abs(p.hp - prev_hp[p.id])
                metrics.hp_swings.append(swing)
                metrics.min_hp_seen = min(metrics.min_hp_seen, p.hp)
                prev_hp[p.id] = p.hp

            metrics.max_damage_round = max(metrics.max_damage_round,
                                           max(round_damage) if round_damage else 0)

            # Track midpoint HP for comeback detection
            if round_num == MAX_ROUNDS // 2:
                mid_hp = [p1.hp, p2.hp]

            # Draw cards (not on final round if reckoning just happened)
            if not is_reckoning:
                for p in players:
                    if p.is_alive:
                        p.draw_cards(1)

            # Check game over
            if not p1.is_alive or not p2.is_alive:
                break

            # After reckoning, also resolve remaining ticks for one more cycle
            if is_reckoning:
                # Resolve all remaining active effects to completion
                for _ in range(10):  # Max 10 extra resolution passes
                    any_resolved = False
                    effects_to_remove = []
                    for i, eff in enumerate(active_effects):
                        if eff.current_tick >= eff.duration:
                            effects_to_remove.append(i)
                            continue
                        self._resolve_effect_tick(eff, players, round_num)
                        eff.current_tick += 1
                        any_resolved = True
                    for i in sorted(effects_to_remove, reverse=True):
                        active_effects.pop(i)
                    if not any_resolved:
                        break
                    if not p1.is_alive or not p2.is_alive:
                        break

                # Track reckoning HP swing
                metrics.reckoning_hp_swing = (
                    abs(p1.hp - hp_before_reckoning[0]) +
                    abs(p2.hp - hp_before_reckoning[1])
                )

                # Check if reckoning changed the outcome
                pre_winner = 0 if hp_before_reckoning[0] >= hp_before_reckoning[1] else 1
                post_winner = 0 if p1.hp >= p2.hp else 1
                metrics.reckoning_decisive = (pre_winner != post_winner)

        # Determine winner
        metrics.game_length = metrics.total_rounds
        metrics.final_hp_diff = abs(p1.hp - p2.hp)

        if p1.is_alive and not p2.is_alive:
            metrics.winner_sin = sin1
            metrics.loser_sin = sin2
        elif p2.is_alive and not p1.is_alive:
            metrics.winner_sin = sin2
            metrics.loser_sin = sin1
        else:
            if p1.hp >= p2.hp:
                metrics.winner_sin = sin1
                metrics.loser_sin = sin2
            else:
                metrics.winner_sin = sin2
                metrics.loser_sin = sin1
            metrics.timeout = not metrics.reckoning_triggered  # Only timeout if no reckoning

        # Comeback: winner was trailing at midpoint
        winner_id = 0 if metrics.winner_sin == sin1 else 1
        if mid_hp[winner_id] < mid_hp[1 - winner_id]:
            metrics.winner_was_trailing = True

        metrics.blowout = metrics.game_length < 8

        return metrics


# ─── Scenario Runner ─────────────────────────────────────────
@dataclass
class ConfigResult:
    hp_pool: int
    defense_mult: float
    final_reckoning: bool
    avg_game_length: float
    std_game_length: float
    comeback_rate: float
    blowout_rate: float
    timeout_rate: float
    reckoning_trigger_rate: float
    reckoning_decisive_rate: float
    avg_reckoning_cards: float
    avg_reckoning_hp_swing: float
    avg_hp_volatility: float
    defensive_interaction_rate: float
    faction_balance_deviation: float
    strategic_diversity: float
    avg_final_hp_diff: float
    total_games: int
    quality_score: float = 0.0
    win_rates: Dict[str, float] = field(default_factory=dict)
    matchup_matrix: Dict[str, Dict[str, float]] = field(default_factory=dict)


def compute_quality_score_v2(r: ConfigResult) -> float:
    """
    Enhanced quality score that accounts for:
    - Reckoning decisiveness (bonus for dramatic finales)
    - HP-pool-adjusted game length targets
    - Reduced timeout penalty when reckoning resolves games
    """
    # Game length target scales with HP pool
    # 200 HP → target 16, 333 HP → target 17, 666 HP → target 18
    gl_target = 16 + (r.hp_pool - 200) / 233
    gl = r.avg_game_length
    gl_score = max(0, 100 - 5 * abs(gl - gl_target))

    cr_score = min(100, r.comeback_rate * 250)
    bl_score = max(0, 100 - r.blowout_rate * 500)

    # Timeout penalty is reduced if reckoning resolves games
    effective_timeout = r.timeout_rate
    if r.final_reckoning:
        # Reckoning converts timeouts into decisive endings
        effective_timeout = max(0, r.timeout_rate - r.reckoning_trigger_rate * 0.8)
    to_score = max(0, 100 - effective_timeout * 200)

    fb_score = max(0, 100 - r.faction_balance_deviation * 2000)
    sd_score = min(100, r.strategic_diversity * 25)

    di = r.defensive_interaction_rate
    di_score = max(0, 100 - abs(di - 0.30) * 300)

    # HP volatility target scales with HP pool
    hv_target = 22 * (r.hp_pool / 200)
    hv = r.avg_hp_volatility
    hv_score = max(0, 100 - abs(hv - hv_target) * (5 * 200 / r.hp_pool))

    # Reckoning bonus: decisive reckonings add excitement
    reck_score = 0
    if r.final_reckoning and r.reckoning_trigger_rate > 0:
        # Score based on how often reckoning creates dramatic reversals
        reck_score = min(100, r.reckoning_decisive_rate * 500)

    composite = (
        gl_score * 0.18 +
        cr_score * 0.13 +
        bl_score * 0.13 +
        to_score * 0.10 +
        fb_score * 0.18 +
        sd_score * 0.08 +
        di_score * 0.05 +
        hv_score * 0.05 +
        reck_score * 0.10  # 10% weight for reckoning excitement
    )
    return round(composite, 2)


def run_config(all_cards: List[Card], hp_pool: int, defense_mult: float,
               final_reckoning: bool, games_per_matchup: int = 1500) -> ConfigResult:
    """Run a full configuration."""
    sim = EnhancedGameSimulator(
        all_cards, defense_mult=defense_mult,
        hp_pool=hp_pool, final_reckoning=final_reckoning
    )

    all_metrics: List[EnhancedGameMetrics] = []
    win_counts: Dict[str, int] = defaultdict(int)
    total_counts: Dict[str, int] = defaultdict(int)
    matchup_wins = defaultdict(lambda: defaultdict(int))
    matchup_total = defaultdict(lambda: defaultdict(int))
    card_type_usage: Dict[str, int] = defaultdict(int)

    matchups = []
    for i, s1 in enumerate(SINS):
        for s2 in SINS[i:]:
            matchups.append((s1, s2))

    for s1, s2 in matchups:
        for _ in range(games_per_matchup):
            m = sim.simulate_game(s1, s2)
            all_metrics.append(m)

            win_counts[m.winner_sin] += 1
            total_counts[s1] += 1
            total_counts[s2] += 1
            matchup_wins[s1][s2] += (1 if m.winner_sin == s1 else 0)
            matchup_wins[s2][s1] += (1 if m.winner_sin == s2 else 0)
            matchup_total[s1][s2] += 1
            matchup_total[s2][s1] += 1

            for k, v in m.cards_played_types.items():
                card_type_usage[k] += v

    n = len(all_metrics)
    game_lengths = [m.game_length for m in all_metrics]

    reckoning_games = [m for m in all_metrics if m.reckoning_triggered]
    reckoning_trigger_rate = len(reckoning_games) / n if n > 0 else 0
    reckoning_decisive_rate = (
        sum(1 for m in reckoning_games if m.reckoning_decisive) / len(reckoning_games)
        if reckoning_games else 0
    )
    avg_reckoning_cards = (
        statistics.mean([m.reckoning_cards_played for m in reckoning_games])
        if reckoning_games else 0
    )
    avg_reckoning_hp_swing = (
        statistics.mean([m.reckoning_hp_swing for m in reckoning_games])
        if reckoning_games else 0
    )

    win_rates = {}
    for sin in SINS:
        win_rates[sin] = win_counts[sin] / total_counts[sin] if total_counts[sin] > 0 else 0.5

    matchup_matrix = {}
    for s1 in SINS:
        matchup_matrix[s1] = {}
        for s2 in SINS:
            if matchup_total[s1][s2] > 0:
                matchup_matrix[s1][s2] = matchup_wins[s1][s2] / matchup_total[s1][s2]
            else:
                matchup_matrix[s1][s2] = 0.5

    all_hp_swings = [s for m in all_metrics for s in m.hp_swings]
    defensive_rounds = sum(m.defensive_rounds for m in all_metrics)
    total_rounds = sum(m.total_rounds for m in all_metrics)

    result = ConfigResult(
        hp_pool=hp_pool,
        defense_mult=defense_mult,
        final_reckoning=final_reckoning,
        avg_game_length=statistics.mean(game_lengths),
        std_game_length=statistics.stdev(game_lengths) if n > 1 else 0,
        comeback_rate=sum(1 for m in all_metrics if m.winner_was_trailing) / n,
        blowout_rate=sum(1 for m in all_metrics if m.blowout) / n,
        timeout_rate=sum(1 for m in all_metrics if m.timeout) / n,
        reckoning_trigger_rate=reckoning_trigger_rate,
        reckoning_decisive_rate=reckoning_decisive_rate,
        avg_reckoning_cards=avg_reckoning_cards,
        avg_reckoning_hp_swing=avg_reckoning_hp_swing,
        avg_hp_volatility=statistics.mean(all_hp_swings) if all_hp_swings else 0,
        defensive_interaction_rate=defensive_rounds / total_rounds if total_rounds > 0 else 0,
        faction_balance_deviation=max(abs(wr - 0.5) for wr in win_rates.values()),
        strategic_diversity=calculate_entropy(card_type_usage),
        avg_final_hp_diff=statistics.mean([m.final_hp_diff for m in all_metrics]),
        total_games=n,
        win_rates=win_rates,
        matchup_matrix=matchup_matrix,
    )
    result.quality_score = compute_quality_score_v2(result)
    return result


# ─── Main ────────────────────────────────────────────────────
def main():
    print("=" * 70)
    print("7 DEADLY SINS — FINAL RECKONING + HP POOL EVALUATION")
    print("=" * 70)

    card_file = os.path.join(os.path.dirname(__file__), "..", "shared", "cardData.ts")
    cards = parse_cards(card_file)
    print(f"Parsed {len(cards)} cards")

    hp_pools = [200, 333, 666]
    defense_mults = [1.00, 1.25, 1.50, 1.75, 2.00]
    reckoning_modes = [False, True]
    games_per_matchup = 1500

    total_configs = len(hp_pools) * len(defense_mults) * len(reckoning_modes)
    total_games = total_configs * 28 * games_per_matchup
    print(f"\nMatrix: {len(hp_pools)} HP × {len(defense_mults)} defense × {len(reckoning_modes)} reckoning = {total_configs} configs")
    print(f"Total simulations: {total_games:,}")

    all_results: List[ConfigResult] = []
    config_num = 0

    for hp in hp_pools:
        for reck in reckoning_modes:
            reck_label = "RECKONING" if reck else "STANDARD"
            print(f"\n{'═' * 60}")
            print(f"HP POOL: {hp} | MODE: {reck_label}")
            print(f"{'═' * 60}")

            for dm in defense_mults:
                config_num += 1
                print(f"  [{config_num}/{total_configs}] HP={hp} Def=×{dm:.2f} {reck_label}...", end=" ", flush=True)

                result = run_config(cards, hp, dm, reck, games_per_matchup)
                all_results.append(result)

                reck_info = ""
                if reck and result.reckoning_trigger_rate > 0:
                    reck_info = f" | Reck={result.reckoning_trigger_rate:.0%} Decisive={result.reckoning_decisive_rate:.0%}"

                print(f"Q={result.quality_score:.1f} | GL={result.avg_game_length:.1f} | "
                      f"TO={result.timeout_rate:.1%} | Dev={result.faction_balance_deviation:.3f}"
                      f"{reck_info}")

    # Save results
    output = {
        "metadata": {
            "hp_pools": hp_pools,
            "defense_mults": defense_mults,
            "reckoning_modes": reckoning_modes,
            "games_per_matchup": games_per_matchup,
            "total_games": total_games,
            "total_configs": total_configs,
        },
        "results": []
    }

    for r in all_results:
        output["results"].append({
            "hp_pool": r.hp_pool,
            "defense_mult": r.defense_mult,
            "final_reckoning": r.final_reckoning,
            "quality_score": r.quality_score,
            "avg_game_length": round(r.avg_game_length, 2),
            "std_game_length": round(r.std_game_length, 2),
            "comeback_rate": round(r.comeback_rate, 4),
            "blowout_rate": round(r.blowout_rate, 4),
            "timeout_rate": round(r.timeout_rate, 4),
            "reckoning_trigger_rate": round(r.reckoning_trigger_rate, 4),
            "reckoning_decisive_rate": round(r.reckoning_decisive_rate, 4),
            "avg_reckoning_cards": round(r.avg_reckoning_cards, 2),
            "avg_reckoning_hp_swing": round(r.avg_reckoning_hp_swing, 2),
            "avg_hp_volatility": round(r.avg_hp_volatility, 2),
            "defensive_interaction_rate": round(r.defensive_interaction_rate, 4),
            "faction_balance_deviation": round(r.faction_balance_deviation, 4),
            "strategic_diversity": round(r.strategic_diversity, 4),
            "avg_final_hp_diff": round(r.avg_final_hp_diff, 2),
            "total_games": r.total_games,
            "win_rates": {k: round(v, 4) for k, v in r.win_rates.items()},
            "matchup_matrix": {
                k: {k2: round(v2, 4) for k2, v2 in v.items()}
                for k, v in r.matchup_matrix.items()
            },
        })

    output_path = os.path.join(os.path.dirname(__file__), "reckoning_hp_results.json")
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"\nResults saved to {output_path}")

    # ─── Summary Table ───────────────────────────────────────
    print("\n" + "=" * 90)
    print("SUMMARY — TOP 10 CONFIGURATIONS BY QUALITY SCORE")
    print("=" * 90)
    sorted_results = sorted(all_results, key=lambda r: r.quality_score, reverse=True)

    print(f"{'Rank':>4} {'HP':>4} {'Def':>5} {'Reck':>5} {'Quality':>8} {'GL':>5} {'TO':>6} {'BL':>6} {'Dev':>6} {'Comeback':>9}")
    print("─" * 90)
    for i, r in enumerate(sorted_results[:10]):
        reck = "YES" if r.final_reckoning else "NO"
        print(f"{i+1:>4} {r.hp_pool:>4} ×{r.defense_mult:.2f} {reck:>5} "
              f"{r.quality_score:>7.1f} {r.avg_game_length:>5.1f} "
              f"{r.timeout_rate:>5.1%} {r.blowout_rate:>5.1%} "
              f"{r.faction_balance_deviation:>5.3f} {r.comeback_rate:>8.1%}")

    # Best per HP pool
    print("\n" + "=" * 90)
    print("BEST CONFIGURATION PER HP POOL")
    print("=" * 90)
    for hp in hp_pools:
        hp_results = [r for r in sorted_results if r.hp_pool == hp]
        best = hp_results[0]
        reck = "YES" if best.final_reckoning else "NO"
        print(f"\n  HP {hp}:")
        print(f"    Best: Def=×{best.defense_mult:.2f} Reckoning={reck} → Q={best.quality_score:.1f}")
        print(f"    Game Length: {best.avg_game_length:.1f} | Timeout: {best.timeout_rate:.1%} | Blowout: {best.blowout_rate:.1%}")
        print(f"    Faction Dev: {best.faction_balance_deviation:.3f} | Comeback: {best.comeback_rate:.1%}")
        if best.final_reckoning:
            print(f"    Reckoning: triggers {best.reckoning_trigger_rate:.0%} of games, "
                  f"decisive {best.reckoning_decisive_rate:.0%} of those, "
                  f"avg {best.avg_reckoning_cards:.1f} cards, "
                  f"avg {best.avg_reckoning_hp_swing:.0f} HP swing")

    # Reckoning impact analysis
    print("\n" + "=" * 90)
    print("RECKONING IMPACT ANALYSIS")
    print("=" * 90)
    for hp in hp_pools:
        for dm in defense_mults:
            std = next((r for r in all_results if r.hp_pool == hp and r.defense_mult == dm and not r.final_reckoning), None)
            reck = next((r for r in all_results if r.hp_pool == hp and r.defense_mult == dm and r.final_reckoning), None)
            if std and reck:
                dq = reck.quality_score - std.quality_score
                dto = reck.timeout_rate - std.timeout_rate
                sign = "+" if dq >= 0 else ""
                print(f"  HP={hp:>3} Def=×{dm:.2f}: Reckoning {sign}{dq:.1f} quality | "
                      f"Timeout {dto:+.1%} | "
                      f"Decisive {reck.reckoning_decisive_rate:.0%}")

    print("\n" + "=" * 90)


if __name__ == "__main__":
    main()
