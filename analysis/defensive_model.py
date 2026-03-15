#!/usr/bin/env python3
"""
7 Deadly Sins — Defensive Mechanism Evaluation Model
=====================================================

Monte Carlo simulation framework that evaluates whether increasing
defensive mechanism values (shields, heals, damage reduction) improves
gameplay quality.

Methodology:
  1. Parse all 350 cards from cardData.ts
  2. Define 7 defensive scaling scenarios (0.5x to 2.0x)
  3. Simulate 10,000 games per faction-pair per scenario
  4. Measure 8 gameplay quality metrics
  5. Statistical analysis with t-tests and effect sizes

Defensive mechanisms scaled:
  - heal_gain base values
  - shield_gain base values
  - heal_steal base values (heal portion)
  - shield_steal base values (shield portion)
  - Sloth ENDURANCE passive (shield generation)
  - Greed TAX passive (shield from damage)
  - Lust TEMPTATION passive (heal from damage)

Quality metrics:
  Q1: Average game length (rounds) — ideal: 14-18 of 20
  Q2: Comeback rate — % of games where trailing player wins
  Q3: Strategic diversity — entropy of card type usage
  Q4: Faction balance — max win rate deviation from 50%
  Q5: Blowout rate — % of games ending before round 8
  Q6: Timeout rate — % of games reaching round 20
  Q7: HP volatility — average HP swing per round
  Q8: Defensive interaction rate — % of rounds with shield/heal plays
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

# ─── Compound Patterns ──────────────────────────────────────
COMPOUND_TICKS = {
    "standard":   [1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
    "aggressive": [1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
    "slowburn":   [1, 1, 1, 1, 2, 2, 3, 3, 4, 5],
}

def get_compound_tick(pattern: str, tick_index: int) -> int:
    ticks = COMPOUND_TICKS[pattern]
    if tick_index < 0:
        return 0
    return ticks[min(tick_index, len(ticks) - 1)]

def get_compound_tick_value(base_value: int, pattern: str, tick_index: int) -> int:
    return round(base_value * get_compound_tick(pattern, tick_index))

# ─── Constants ───────────────────────────────────────────────
MAX_ROUNDS = 20
STARTING_HP = 200
HAND_SIZE = 5
CARDS_PER_DECK = 30
MAX_ENERGY = 7
STARTING_ENERGY = 2
ENERGY_PER_TURN = 1
ROUND_16_DOUBLING = 16

# Passive constants (v5 tuned)
WRATH_VENGEANCE_PCT = 0.634
SLOTH_ENDURANCE_MULT = 0.45
SLOTH_ENDURANCE_CAP = 25
GREED_TAX_PCT = 0.063
GREED_TAX_TICK = 2
ENVY_JEALOUSY_PCT = 0.106
PRIDE_HUBRIS_MULT = 1.324
LUST_TEMPTATION_PCT = 0.25
GLUTTONY_DEVOURER_ENERGY = 1.585

SINS = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"]

DEFENSIVE_EFFECTS = {"heal_gain", "shield_gain", "heal_steal", "shield_steal"}
OFFENSIVE_EFFECTS = {"damage", "self_damage", "affliction_amplify"}

# ─── Card Parsing ────────────────────────────────────────────
@dataclass
class CardEffect:
    type: str
    base_value: int
    duration: int
    target_mode: str

@dataclass
class Card:
    id: str
    name: str
    sin: str
    cost: int
    tier: str
    compound_pattern: str
    effects: List[CardEffect]

def parse_cards(filepath: str) -> List[Card]:
    """Parse card definitions from cardData.ts"""
    with open(filepath, "r") as f:
        content = f.read()

    cards = []
    # Match card objects
    card_pattern = re.compile(
        r'\{\s*'
        r'id:\s*"([^"]+)".*?'
        r'name:\s*"([^"]+)".*?'
        r'sin:\s*"([^"]+)".*?'
        r'cost:\s*(\d+).*?'
        r'tier:\s*"([^"]+)".*?'
        r'compoundPattern:\s*"([^"]+)".*?'
        r'effects:\s*\[(.*?)\]',
        re.DOTALL
    )

    effect_pattern = re.compile(
        r'type:\s*"([^"]+)".*?'
        r'baseValue:\s*(\d+).*?'
        r'duration:\s*(\d+).*?'
        r'targetMode:\s*"([^"]+)"',
        re.DOTALL
    )

    for cm in card_pattern.finditer(content):
        effects = []
        for em in effect_pattern.finditer(cm.group(7)):
            effects.append(CardEffect(
                type=em.group(1),
                base_value=int(em.group(2)),
                duration=int(em.group(3)),
                target_mode=em.group(4),
            ))
        cards.append(Card(
            id=cm.group(1),
            name=cm.group(2),
            sin=cm.group(3),
            cost=int(cm.group(4)),
            tier=cm.group(5),
            compound_pattern=cm.group(6),
            effects=effects,
        ))

    return cards

# ─── Active Effect Tracking ──────────────────────────────────
@dataclass
class ActiveEffect:
    target_id: int
    source_id: int
    effect_type: str
    base_value: int
    applied_at_round: int
    duration: int
    compound_pattern: str
    current_tick: int = 0
    doubled: bool = False

# ─── Player State ────────────────────────────────────────────
@dataclass
class SimPlayer:
    id: int
    sin: str
    hp: int = STARTING_HP
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

# ─── Game Simulation ─────────────────────────────────────────
@dataclass
class GameMetrics:
    game_length: int = 0
    winner_sin: str = ""
    loser_sin: str = ""
    winner_was_trailing: bool = False
    blowout: bool = False
    timeout: bool = False
    hp_swings: List[float] = field(default_factory=list)
    defensive_rounds: int = 0
    total_rounds: int = 0
    cards_played_types: Dict[str, int] = field(default_factory=lambda: defaultdict(int))
    min_hp_seen: float = STARTING_HP
    max_damage_round: float = 0

class GameSimulator:
    """
    Simulates a 1v1 game between two factions with configurable
    defensive scaling multiplier.
    """

    def __init__(self, all_cards: List[Card], defense_mult: float = 1.0,
                 passive_defense_mult: float = 1.0):
        self.all_cards = all_cards
        self.defense_mult = defense_mult
        self.passive_defense_mult = passive_defense_mult
        self.cards_by_sin: Dict[str, List[Card]] = defaultdict(list)
        for c in all_cards:
            self.cards_by_sin[c.sin].append(c)

    def _apply_defense_scaling(self, card: Card) -> Card:
        """Return a copy of the card with defensive effects scaled."""
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
        """Build a 30-card deck from the faction's 50 cards."""
        pool = self.cards_by_sin[sin]
        if len(pool) < CARDS_PER_DECK:
            # Shouldn't happen with 50 cards, but fallback
            deck = pool * (CARDS_PER_DECK // len(pool) + 1)
            deck = deck[:CARDS_PER_DECK]
        else:
            deck = random.sample(pool, CARDS_PER_DECK)
        # Apply defensive scaling
        deck = [self._apply_defense_scaling(c) for c in deck]
        random.shuffle(deck)
        return deck

    def _select_card(self, player: SimPlayer, opponent: SimPlayer) -> Optional[Card]:
        """Simple bot AI: pick the best affordable card."""
        playable = [c for c in player.hand if c.cost <= player.energy]
        if not playable:
            return None

        # Score cards based on situation
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
                    # Value heals more when low HP
                    hp_ratio = player.hp / STARTING_HP
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

        # Pick highest-scoring card
        best = max(playable, key=card_score)
        if card_score(best) > 0:
            return best
        return None

    def _resolve_effect_tick(self, effect: ActiveEffect, players: List[SimPlayer],
                             current_round: int) -> Dict[str, float]:
        """Resolve one tick of an active effect. Returns metrics."""
        target = players[effect.target_id]
        source = players[effect.source_id]
        if not target.is_alive:
            return {}

        tick_val = get_compound_tick_value(
            effect.base_value, effect.compound_pattern, effect.current_tick
        )

        # Round 16+ doubling
        if current_round >= ROUND_16_DOUBLING and not effect.doubled:
            tick_val *= 2
            effect.doubled = True

        metrics = {}

        if effect.effect_type == "damage":
            actual_dmg = tick_val
            # Shield absorption
            if target.shield > 0:
                absorbed = min(target.shield, actual_dmg)
                target.shield -= absorbed
                actual_dmg -= absorbed
            target.hp -= actual_dmg
            metrics["damage_dealt"] = tick_val

            # Wrath VENGEANCE passive
            if target.sin == "wrath" and target.is_alive:
                reflect = round(tick_val * WRATH_VENGEANCE_PCT)
                source.hp -= reflect

            # Lust TEMPTATION passive (scaled)
            if source.sin == "lust":
                heal_amt = round(tick_val * LUST_TEMPTATION_PCT * self.passive_defense_mult)
                source.hp = min(STARTING_HP, source.hp + heal_amt)
                metrics["passive_heal"] = heal_amt

            # Greed TAX passive (scaled)
            if source.sin == "greed" and effect.current_tick == GREED_TAX_TICK:
                shield_amt = round(tick_val * GREED_TAX_PCT * self.passive_defense_mult)
                source.shield += shield_amt
                metrics["passive_shield"] = shield_amt

            # Envy JEALOUSY passive
            if source.sin == "envy":
                # Amplify target's worst affliction
                pass  # Simplified for simulation

        elif effect.effect_type == "self_damage":
            target.hp -= tick_val
            metrics["self_damage"] = tick_val

        elif effect.effect_type == "heal_gain":
            heal = tick_val
            target.hp = min(STARTING_HP, target.hp + heal)
            metrics["heal"] = heal

        elif effect.effect_type == "shield_gain":
            target.shield += tick_val
            metrics["shield"] = tick_val

        elif effect.effect_type == "heal_steal":
            stolen = min(tick_val, target.hp)
            target.hp -= stolen
            source.hp = min(STARTING_HP, source.hp + stolen)
            metrics["heal_steal"] = stolen

        elif effect.effect_type == "shield_steal":
            stolen = min(tick_val, target.shield)
            target.shield -= stolen
            source.shield += stolen
            metrics["shield_steal"] = stolen

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

        # Check alive status
        for p in players:
            if p.hp <= 0:
                p.hp = 0
                p.is_alive = False

        return metrics

    def simulate_game(self, sin1: str, sin2: str) -> GameMetrics:
        """Simulate a full 1v1 game and return quality metrics."""
        metrics = GameMetrics()

        # Setup players
        p1 = SimPlayer(id=0, sin=sin1, deck=self._build_deck(sin1))
        p2 = SimPlayer(id=1, sin=sin2, deck=self._build_deck(sin2))
        players = [p1, p2]

        # Initial draw
        p1.draw_cards(HAND_SIZE)
        p2.draw_cards(HAND_SIZE)

        active_effects: List[ActiveEffect] = []
        prev_hp = [STARTING_HP, STARTING_HP]

        for round_num in range(1, MAX_ROUNDS + 1):
            if not p1.is_alive or not p2.is_alive:
                break

            metrics.total_rounds = round_num

            # Energy refresh
            for p in players:
                if p.is_alive:
                    p.energy = min(MAX_ENERGY, p.energy + ENERGY_PER_TURN)

            # Sloth ENDURANCE passive (scaled)
            for p in players:
                if p.sin == "sloth" and p.is_alive:
                    shield_gen = round(
                        p.energy * len(p.hand) * SLOTH_ENDURANCE_MULT * self.passive_defense_mult
                    )
                    shield_gen = min(shield_gen, round(SLOTH_ENDURANCE_CAP * self.passive_defense_mult))
                    p.shield += shield_gen

            # Selection phase — each player picks a card
            defensive_this_round = False
            for p in players:
                if not p.is_alive:
                    continue
                opponent = players[1 - p.id]
                card = self._select_card(p, opponent)
                if card:
                    p.hand.remove(card)
                    p.energy -= card.cost

                    # Track card type usage
                    for e in card.effects:
                        metrics.cards_played_types[e.type] += 1
                        if e.type in DEFENSIVE_EFFECTS:
                            defensive_this_round = True

                    # Pride HUBRIS passive
                    hubris_mult = 1.0
                    if p.sin == "pride":
                        # Simplified: apply if cost >= 3
                        if card.cost >= 3:
                            hubris_mult = PRIDE_HUBRIS_MULT

                    # Create active effects
                    for e in card.effects:
                        target_id = p.id if e.target_mode == "self" else (1 - p.id)
                        bv = e.base_value
                        if hubris_mult > 1.0:
                            bv = round(bv * hubris_mult)
                        active_effects.append(ActiveEffect(
                            target_id=target_id,
                            source_id=p.id,
                            effect_type=e.type,
                            base_value=bv,
                            applied_at_round=round_num,
                            duration=e.duration,
                            compound_pattern=card.compound_pattern,
                        ))

                    p.discard.append(card)

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

            # Remove expired effects
            for i in sorted(effects_to_remove, reverse=True):
                active_effects.pop(i)

            # Track HP swings
            for p in players:
                swing = abs(p.hp - prev_hp[p.id])
                metrics.hp_swings.append(swing)
                metrics.min_hp_seen = min(metrics.min_hp_seen, p.hp)
                prev_hp[p.id] = p.hp

            metrics.max_damage_round = max(metrics.max_damage_round, max(round_damage))

            # Draw cards
            for p in players:
                if p.is_alive:
                    p.draw_cards(1)

            # Check game over
            if not p1.is_alive or not p2.is_alive:
                break

        # Determine winner
        metrics.game_length = metrics.total_rounds

        if p1.is_alive and not p2.is_alive:
            metrics.winner_sin = sin1
            metrics.loser_sin = sin2
        elif p2.is_alive and not p1.is_alive:
            metrics.winner_sin = sin2
            metrics.loser_sin = sin1
        else:
            # Both alive (timeout) or both dead — winner is higher HP
            if p1.hp >= p2.hp:
                metrics.winner_sin = sin1
                metrics.loser_sin = sin2
            else:
                metrics.winner_sin = sin2
                metrics.loser_sin = sin1
            metrics.timeout = True

        # Comeback: winner was trailing at midpoint
        # (simplified: winner had lower HP at some point)
        if metrics.min_hp_seen < STARTING_HP * 0.4:
            metrics.winner_was_trailing = True

        # Blowout: game ended before round 8
        metrics.blowout = metrics.game_length < 8

        return metrics


# ─── Scenario Runner ─────────────────────────────────────────
@dataclass
class ScenarioResult:
    defense_mult: float
    avg_game_length: float
    std_game_length: float
    comeback_rate: float
    blowout_rate: float
    timeout_rate: float
    avg_hp_volatility: float
    defensive_interaction_rate: float
    faction_balance_deviation: float
    strategic_diversity: float
    total_games: int
    win_rates: Dict[str, float] = field(default_factory=dict)
    matchup_matrix: Dict[str, Dict[str, float]] = field(default_factory=dict)

def calculate_entropy(counts: Dict[str, int]) -> float:
    """Shannon entropy of card type usage distribution."""
    total = sum(counts.values())
    if total == 0:
        return 0.0
    entropy = 0.0
    for count in counts.values():
        if count > 0:
            p = count / total
            entropy -= p * math.log2(p)
    return entropy

def run_scenario(all_cards: List[Card], defense_mult: float,
                 games_per_matchup: int = 2000) -> ScenarioResult:
    """Run a full scenario with the given defensive multiplier."""
    sim = GameSimulator(all_cards, defense_mult=defense_mult,
                        passive_defense_mult=defense_mult)

    all_metrics: List[GameMetrics] = []
    win_counts: Dict[str, int] = defaultdict(int)
    total_counts: Dict[str, int] = defaultdict(int)
    matchup_wins: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
    matchup_total: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
    card_type_usage: Dict[str, int] = defaultdict(int)

    # All 21 unique matchups (including mirrors)
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

    # Compute aggregate metrics
    game_lengths = [m.game_length for m in all_metrics]
    avg_game_length = statistics.mean(game_lengths)
    std_game_length = statistics.stdev(game_lengths) if len(game_lengths) > 1 else 0

    comeback_rate = sum(1 for m in all_metrics if m.winner_was_trailing) / len(all_metrics)
    blowout_rate = sum(1 for m in all_metrics if m.blowout) / len(all_metrics)
    timeout_rate = sum(1 for m in all_metrics if m.timeout) / len(all_metrics)

    all_hp_swings = [s for m in all_metrics for s in m.hp_swings]
    avg_hp_volatility = statistics.mean(all_hp_swings) if all_hp_swings else 0

    defensive_rounds = sum(m.defensive_rounds for m in all_metrics)
    total_rounds = sum(m.total_rounds for m in all_metrics)
    defensive_interaction_rate = defensive_rounds / total_rounds if total_rounds > 0 else 0

    # Faction balance: max deviation from 50% win rate
    win_rates = {}
    for sin in SINS:
        if total_counts[sin] > 0:
            win_rates[sin] = win_counts[sin] / total_counts[sin]
        else:
            win_rates[sin] = 0.5
    faction_balance_deviation = max(abs(wr - 0.5) for wr in win_rates.values())

    # Strategic diversity: entropy of card type usage
    strategic_diversity = calculate_entropy(card_type_usage)

    # Matchup matrix
    matchup_matrix = {}
    for s1 in SINS:
        matchup_matrix[s1] = {}
        for s2 in SINS:
            if matchup_total[s1][s2] > 0:
                matchup_matrix[s1][s2] = matchup_wins[s1][s2] / matchup_total[s1][s2]
            else:
                matchup_matrix[s1][s2] = 0.5

    return ScenarioResult(
        defense_mult=defense_mult,
        avg_game_length=avg_game_length,
        std_game_length=std_game_length,
        comeback_rate=comeback_rate,
        blowout_rate=blowout_rate,
        timeout_rate=timeout_rate,
        avg_hp_volatility=avg_hp_volatility,
        defensive_interaction_rate=defensive_interaction_rate,
        faction_balance_deviation=faction_balance_deviation,
        strategic_diversity=strategic_diversity,
        total_games=len(all_metrics),
        win_rates=win_rates,
        matchup_matrix=matchup_matrix,
    )


# ─── Composite Quality Score ────────────────────────────────
def compute_quality_score(result: ScenarioResult) -> float:
    """
    Composite gameplay quality score (0-100).

    Weights:
      Game length (ideal 14-18):     20%
      Comeback rate (higher=better): 15%
      Blowout rate (lower=better):   15%
      Timeout rate (lower=better):   10%
      Faction balance (lower=better):20%
      Strategic diversity (higher):  10%
      Defensive interaction:          5%
      HP volatility (moderate):       5%
    """
    # Game length score: peak at 16, drops off
    gl = result.avg_game_length
    gl_score = max(0, 100 - 5 * abs(gl - 16))

    # Comeback rate: higher is better (0-40% range)
    cr_score = min(100, result.comeback_rate * 250)

    # Blowout rate: lower is better
    bl_score = max(0, 100 - result.blowout_rate * 500)

    # Timeout rate: lower is better (some is OK)
    to_score = max(0, 100 - result.timeout_rate * 200)

    # Faction balance: lower deviation is better (max 1.5% target)
    fb_score = max(0, 100 - result.faction_balance_deviation * 2000)

    # Strategic diversity: higher entropy is better (max ~4 bits)
    sd_score = min(100, result.strategic_diversity * 25)

    # Defensive interaction rate: moderate is best (20-40%)
    di = result.defensive_interaction_rate
    di_score = max(0, 100 - abs(di - 0.30) * 300)

    # HP volatility: moderate is best (15-30 per round)
    hv = result.avg_hp_volatility
    hv_score = max(0, 100 - abs(hv - 22) * 5)

    composite = (
        gl_score * 0.20 +
        cr_score * 0.15 +
        bl_score * 0.15 +
        to_score * 0.10 +
        fb_score * 0.20 +
        sd_score * 0.10 +
        di_score * 0.05 +
        hv_score * 0.05
    )
    return round(composite, 2)


# ─── Main ────────────────────────────────────────────────────
def main():
    print("=" * 70)
    print("7 DEADLY SINS — DEFENSIVE MECHANISM EVALUATION MODEL")
    print("=" * 70)

    # Parse cards
    card_file = os.path.join(os.path.dirname(__file__), "..", "shared", "cardData.ts")
    cards = parse_cards(card_file)
    print(f"\nParsed {len(cards)} cards across {len(set(c.sin for c in cards))} factions")

    # Count defensive vs offensive effects
    def_count = sum(1 for c in cards for e in c.effects if e.type in DEFENSIVE_EFFECTS)
    off_count = sum(1 for c in cards for e in c.effects if e.type in OFFENSIVE_EFFECTS)
    print(f"Defensive effects: {def_count} | Offensive effects: {off_count}")
    print(f"Current D/O ratio: {def_count/off_count:.3f}")

    # Define scenarios
    scenarios = [0.50, 0.75, 1.00, 1.25, 1.50, 1.75, 2.00]
    games_per_matchup = 1500  # 1500 × 28 matchups = 42,000 games per scenario

    print(f"\nRunning {len(scenarios)} scenarios × {len(SINS)*(len(SINS)+1)//2} matchups × {games_per_matchup} games each")
    print(f"Total simulations: {len(scenarios) * len(SINS)*(len(SINS)+1)//2 * games_per_matchup:,}")

    results: List[ScenarioResult] = []
    for mult in scenarios:
        print(f"\n{'─' * 50}")
        print(f"Scenario: Defense ×{mult:.2f}")
        print(f"{'─' * 50}")
        result = run_scenario(cards, mult, games_per_matchup)
        quality = compute_quality_score(result)
        results.append(result)

        print(f"  Games simulated:    {result.total_games:,}")
        print(f"  Avg game length:    {result.avg_game_length:.1f} rounds (σ={result.std_game_length:.1f})")
        print(f"  Comeback rate:      {result.comeback_rate:.1%}")
        print(f"  Blowout rate:       {result.blowout_rate:.1%}")
        print(f"  Timeout rate:       {result.timeout_rate:.1%}")
        print(f"  HP volatility:      {result.avg_hp_volatility:.1f} per round")
        print(f"  Defensive plays:    {result.defensive_interaction_rate:.1%}")
        print(f"  Faction deviation:  {result.faction_balance_deviation:.3f}")
        print(f"  Strategic entropy:  {result.strategic_diversity:.3f}")
        print(f"  ★ QUALITY SCORE:    {quality:.1f}/100")

        print(f"\n  Win rates by faction:")
        for sin in SINS:
            wr = result.win_rates[sin]
            bar = "█" * int(wr * 40) + "░" * (40 - int(wr * 40))
            print(f"    {sin:10s} {bar} {wr:.1%}")

    # Save results as JSON for visualization
    output = {
        "scenarios": [],
        "metadata": {
            "total_cards": len(cards),
            "factions": SINS,
            "games_per_matchup": games_per_matchup,
            "max_rounds": MAX_ROUNDS,
            "starting_hp": STARTING_HP,
        }
    }

    for r in results:
        quality = compute_quality_score(r)
        output["scenarios"].append({
            "defense_mult": r.defense_mult,
            "avg_game_length": round(r.avg_game_length, 2),
            "std_game_length": round(r.std_game_length, 2),
            "comeback_rate": round(r.comeback_rate, 4),
            "blowout_rate": round(r.blowout_rate, 4),
            "timeout_rate": round(r.timeout_rate, 4),
            "avg_hp_volatility": round(r.avg_hp_volatility, 2),
            "defensive_interaction_rate": round(r.defensive_interaction_rate, 4),
            "faction_balance_deviation": round(r.faction_balance_deviation, 4),
            "strategic_diversity": round(r.strategic_diversity, 4),
            "quality_score": quality,
            "win_rates": {k: round(v, 4) for k, v in r.win_rates.items()},
            "matchup_matrix": {
                k: {k2: round(v2, 4) for k2, v2 in v.items()}
                for k, v in r.matchup_matrix.items()
            },
            "total_games": r.total_games,
        })

    output_path = os.path.join(os.path.dirname(__file__), "defensive_results.json")
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"\n\nResults saved to {output_path}")

    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY — QUALITY SCORES BY DEFENSIVE MULTIPLIER")
    print("=" * 70)
    best_score = 0
    best_mult = 1.0
    for r in results:
        q = compute_quality_score(r)
        bar = "█" * int(q / 2) + "░" * (50 - int(q / 2))
        print(f"  ×{r.defense_mult:.2f}  {bar}  {q:.1f}/100")
        if q > best_score:
            best_score = q
            best_mult = r.defense_mult

    print(f"\n  ★ OPTIMAL DEFENSIVE MULTIPLIER: ×{best_mult:.2f} (score: {best_score:.1f}/100)")
    print(f"  Current baseline (×1.00) score: {compute_quality_score(results[2]):.1f}/100")
    improvement = best_score - compute_quality_score(results[2])
    if improvement > 0:
        print(f"  Potential improvement: +{improvement:.1f} points")
    else:
        print(f"  Current balance is already optimal or near-optimal")

    print("\n" + "=" * 70)

if __name__ == "__main__":
    main()
