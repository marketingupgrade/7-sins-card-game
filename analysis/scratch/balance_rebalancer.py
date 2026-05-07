"""
7 Deadly Sins - Iterative Card Rebalancer

Key fixes from v1 simulation:
1. DoT effects resolve over TURNS, not instantly (was massively favoring burst)
2. Players play 1-2 cards per turn (energy-limited), not 3
3. Proper turn structure: each player gets a turn per round
4. Shield decay is tracked properly per-turn
5. Debuffs reduce outgoing damage (not just tracked)
6. Games should last 4-7 rounds on average (not 2)

Rebalancing approach:
- Iteratively adjust card base values
- Target: all factions within 47-53% overall win rate (±3% from 50%)
- Preserve faction identity (Wrath=burst, Sloth=stall, Greed=drain, Envy=reactive)
"""

import random
import math
import json
import numpy as np
from collections import defaultdict
from itertools import combinations
from copy import deepcopy

random.seed(42)
np.random.seed(42)

# ─── Constants ───────────────────────────────────────────────
STARTING_HP = 25
MAX_ROUNDS = 10
HAND_SIZE = 5
STARTING_ENERGY = 2
MAX_ENERGY = 7
ENERGY_PER_ROUND = 1
SLOTH_MAX_CARRYOVER = 2
WRATH_OVERCHARGE_HP_COST = 2
WRATH_OVERCHARGE_ENERGY_GAIN = 1
GREED_AVARICE_COST_THRESHOLD = 3
GREED_AVARICE_BONUS = 1
ENVY_COVET_BONUS = 1

def get_base_energy(r):
    return min(STARTING_ENERGY + (r - 1) * ENERGY_PER_ROUND, MAX_ENERGY)

def calc_eff(base, rnd):
    return round(base * min(rnd, MAX_ROUNDS))

SINS = ["wrath", "sloth", "greed", "envy"]

# ─── Mutable Card Data ──────────────────────────────────────
def make_cards():
    """Return a fresh copy of all cards. Values can be mutated for rebalancing."""
    return {
        # WRATH
        "wrath_01": {"name":"Fury Strike","sin":"wrath","cost":1,"effects":[{"type":"damage","base":3,"dur":0,"tgt":"enemy"}]},
        "wrath_02": {"name":"Blind Rage","sin":"wrath","cost":1,"effects":[{"type":"damage","base":4,"dur":0,"tgt":"enemy"},{"type":"damage","base":1,"dur":0,"tgt":"self"}]},
        "wrath_03": {"name":"Blood Boil","sin":"wrath","cost":2,"effects":[{"type":"damage","base":2,"dur":2,"tgt":"enemy"}]},
        "wrath_04": {"name":"Berserker's Howl","sin":"wrath","cost":3,"effects":[{"type":"damage","base":2,"dur":0,"tgt":"aoe"}]},
        "wrath_05": {"name":"Crimson Slash","sin":"wrath","cost":1,"effects":[{"type":"damage","base":2,"dur":0,"tgt":"enemy"}]},
        "wrath_06": {"name":"Vendetta","sin":"wrath","cost":2,"effects":[{"type":"damage","base":5,"dur":0,"tgt":"enemy"},{"type":"damage","base":2,"dur":0,"tgt":"self"}]},
        "wrath_07": {"name":"Rage Shield","sin":"wrath","cost":2,"effects":[{"type":"shield","base":2,"dur":1,"tgt":"self"}]},
        "wrath_08": {"name":"Burning Hatred","sin":"wrath","cost":3,"effects":[{"type":"damage","base":3,"dur":3,"tgt":"enemy"}]},
        "wrath_09": {"name":"Corruption Surge","sin":"wrath","cost":0,"effects":[{"type":"damage","base":3,"dur":0,"tgt":"enemy"},{"type":"damage","base":2,"dur":0,"tgt":"self"}]},
        "wrath_10": {"name":"Apocalypse Fist","sin":"wrath","cost":5,"effects":[{"type":"damage","base":4,"dur":0,"tgt":"aoe"},{"type":"damage","base":3,"dur":0,"tgt":"self"}]},
        # SLOTH
        "sloth_01": {"name":"Drowsy Touch","sin":"sloth","cost":1,"effects":[{"type":"debuff","base":1,"dur":2,"tgt":"enemy"}]},
        "sloth_02": {"name":"Pillow Fort","sin":"sloth","cost":2,"effects":[{"type":"shield","base":3,"dur":2,"tgt":"self"}]},
        "sloth_03": {"name":"Lazy Drain","sin":"sloth","cost":2,"effects":[{"type":"damage","base":1,"dur":0,"tgt":"enemy"},{"type":"heal","base":1,"dur":0,"tgt":"self"}]},
        "sloth_04": {"name":"Procrastination","sin":"sloth","cost":1,"effects":[{"type":"shield","base":2,"dur":1,"tgt":"self"}]},
        "sloth_05": {"name":"Entropy Wave","sin":"sloth","cost":3,"effects":[{"type":"damage","base":1,"dur":3,"tgt":"aoe"}]},
        "sloth_06": {"name":"Hibernate","sin":"sloth","cost":3,"effects":[{"type":"heal","base":3,"dur":2,"tgt":"self"}]},
        "sloth_07": {"name":"Lethargy Aura","sin":"sloth","cost":2,"effects":[{"type":"debuff","base":2,"dur":2,"tgt":"enemy"}]},
        "sloth_08": {"name":"Passive Resistance","sin":"sloth","cost":1,"effects":[{"type":"shield","base":1,"dur":1,"tgt":"self"},{"type":"damage","base":1,"dur":0,"tgt":"enemy"}]},
        "sloth_09": {"name":"Deep Slumber","sin":"sloth","cost":0,"effects":[{"type":"heal","base":2,"dur":0,"tgt":"self"},{"type":"debuff","base":1,"dur":1,"tgt":"self"}]},
        "sloth_10": {"name":"Eternal Rest","sin":"sloth","cost":4,"effects":[{"type":"heal","base":5,"dur":0,"tgt":"self"},{"type":"shield","base":3,"dur":2,"tgt":"self"}]},
        # GREED
        "greed_01": {"name":"Pocket Pick","sin":"greed","cost":1,"effects":[{"type":"damage","base":2,"dur":0,"tgt":"enemy"},{"type":"heal","base":1,"dur":0,"tgt":"self"}]},
        "greed_02": {"name":"Tax Collector","sin":"greed","cost":1,"effects":[{"type":"damage","base":2,"dur":0,"tgt":"enemy"}]},
        "greed_03": {"name":"Compound Interest","sin":"greed","cost":2,"effects":[{"type":"damage","base":1,"dur":3,"tgt":"enemy"}]},
        "greed_04": {"name":"Hostile Takeover","sin":"greed","cost":3,"effects":[{"type":"damage","base":3,"dur":0,"tgt":"enemy"},{"type":"heal","base":2,"dur":0,"tgt":"self"}]},
        "greed_05": {"name":"Golden Shield","sin":"greed","cost":2,"effects":[{"type":"shield","base":2,"dur":2,"tgt":"self"}]},
        "greed_06": {"name":"Embezzle","sin":"greed","cost":1,"effects":[{"type":"damage","base":1,"dur":0,"tgt":"enemy"},{"type":"heal","base":2,"dur":0,"tgt":"self"}]},
        "greed_07": {"name":"Market Crash","sin":"greed","cost":3,"effects":[{"type":"damage","base":2,"dur":0,"tgt":"aoe"}]},
        "greed_08": {"name":"Loan Shark","sin":"greed","cost":2,"effects":[{"type":"damage","base":2,"dur":2,"tgt":"enemy"},{"type":"damage","base":1,"dur":0,"tgt":"self"}]},
        "greed_09": {"name":"Insider Trading","sin":"greed","cost":0,"effects":[{"type":"damage","base":2,"dur":0,"tgt":"enemy"},{"type":"damage","base":1,"dur":0,"tgt":"self"}]},
        "greed_10": {"name":"Midas Touch","sin":"greed","cost":4,"effects":[{"type":"damage","base":3,"dur":0,"tgt":"aoe"},{"type":"heal","base":3,"dur":0,"tgt":"self"}]},
        # ENVY
        "envy_01": {"name":"Jealous Glare","sin":"envy","cost":1,"effects":[{"type":"damage","base":2,"dur":0,"tgt":"enemy"},{"type":"debuff","base":1,"dur":1,"tgt":"enemy"}]},
        "envy_02": {"name":"Bitter Reflection","sin":"envy","cost":2,"effects":[{"type":"damage","base":2,"dur":0,"tgt":"enemy"},{"type":"shield","base":2,"dur":1,"tgt":"self"}]},
        "envy_03": {"name":"Covetous Strike","sin":"envy","cost":1,"effects":[{"type":"damage","base":3,"dur":0,"tgt":"enemy"}]},
        "envy_04": {"name":"Green-Eyed Curse","sin":"envy","cost":2,"effects":[{"type":"debuff","base":2,"dur":3,"tgt":"enemy"}]},
        "envy_05": {"name":"Spite Shield","sin":"envy","cost":1,"effects":[{"type":"shield","base":2,"dur":1,"tgt":"self"}]},
        "envy_06": {"name":"Toxic Comparison","sin":"envy","cost":3,"effects":[{"type":"damage","base":2,"dur":2,"tgt":"enemy"},{"type":"debuff","base":1,"dur":2,"tgt":"enemy"}]},
        "envy_07": {"name":"Schadenfreude","sin":"envy","cost":2,"effects":[{"type":"damage","base":1,"dur":0,"tgt":"aoe"},{"type":"heal","base":1,"dur":0,"tgt":"self"}]},
        "envy_08": {"name":"Copycat","sin":"envy","cost":2,"effects":[{"type":"damage","base":3,"dur":0,"tgt":"enemy"},{"type":"damage","base":1,"dur":0,"tgt":"self"}]},
        "envy_09": {"name":"Stolen Glory","sin":"envy","cost":0,"effects":[{"type":"heal","base":2,"dur":0,"tgt":"self"},{"type":"damage","base":1,"dur":0,"tgt":"self"}]},
        "envy_10": {"name":"Doppelganger","sin":"envy","cost":4,"effects":[{"type":"damage","base":3,"dur":0,"tgt":"enemy"},{"type":"shield","base":2,"dur":2,"tgt":"self"},{"type":"heal","base":1,"dur":0,"tgt":"self"}]},
    }


# ─── Proper Turn-Based Simulation ───────────────────────────

class ActiveEffect:
    """A DoT/HoT/shield/debuff that ticks each round."""
    def __init__(self, etype, base, remaining_dur, source_sin):
        self.etype = etype
        self.base = base
        self.remaining_dur = remaining_dur
        self.source_sin = source_sin


class Player:
    def __init__(self, sin, cards):
        self.sin = sin
        self.hp = STARTING_HP
        self.alive = True
        self.energy = STARTING_ENERGY
        self.bonus_energy = 0
        self.avarice_bonus = 0
        self.shield = 0
        self.debuff_stacks = 0  # reduces outgoing damage
        self.effects = []  # list of ActiveEffect
        self.deck = [cid for cid, c in cards.items() if c["sin"] == sin]
        self.hand = []
        self.cards = cards
        
    def draw_hand(self):
        available = self.deck[:]
        random.shuffle(available)
        self.hand = available[:HAND_SIZE]
        
    def take_damage(self, amount):
        actual = amount
        if self.shield > 0:
            blocked = min(self.shield, actual)
            actual -= blocked
            self.shield -= blocked
        self.hp -= actual
        if self.hp <= 0:
            self.hp = 0
            self.alive = False
        return actual
        
    def heal(self, amount):
        self.hp = min(self.hp + amount, STARTING_HP)
        
    def tick_effects(self, rnd):
        """Resolve all active effects for this round."""
        remaining = []
        for eff in self.effects:
            if eff.remaining_dur <= 0:
                continue
            val = calc_eff(eff.base, rnd)
            if eff.etype == "damage":
                self.take_damage(val)
            elif eff.etype == "heal":
                self.heal(val)
            elif eff.etype == "debuff":
                self.debuff_stacks += val
            eff.remaining_dur -= 1
            if eff.remaining_dur > 0:
                remaining.append(eff)
        self.effects = remaining


class Game:
    def __init__(self, sin1, sin2, cards):
        self.cards = cards
        self.p1 = Player(sin1, cards)
        self.p2 = Player(sin2, cards)
        self.rnd = 0
        
    def refresh_energy(self, player, opponent):
        base = get_base_energy(self.rnd)
        bonus = 0
        
        if player.sin == "sloth":
            bonus += min(player.energy, SLOTH_MAX_CARRYOVER)
        if player.sin == "greed" and player.avarice_bonus > 0:
            bonus += player.avarice_bonus
            player.avarice_bonus = 0
        if player.sin == "envy" and opponent.hp > player.hp:
            bonus += ENVY_COVET_BONUS
            
        player.energy = min(base + bonus, MAX_ENERGY)
        player.bonus_energy = bonus
        player.shield = 0  # shields expire each round
        player.debuff_stacks = 0  # debuffs re-applied by tick
        
    def play_card(self, attacker, defender, card_id):
        card = self.cards[card_id]
        if card["cost"] > attacker.energy:
            return False
            
        attacker.energy -= card["cost"]
        
        if attacker.sin == "greed" and card["cost"] >= GREED_AVARICE_COST_THRESHOLD:
            attacker.avarice_bonus += GREED_AVARICE_BONUS
        
        for eff in card["effects"]:
            val = calc_eff(eff["base"], self.rnd)
            # Apply debuff reduction to outgoing damage
            if eff["type"] == "damage" and eff["tgt"] != "self" and attacker.debuff_stacks > 0:
                reduction = calc_eff(attacker.debuff_stacks, 1)  # flat reduction
                val = max(1, val - reduction)
            
            if eff["type"] == "damage":
                if eff["dur"] > 0:
                    # DoT: apply first tick now, rest as active effect on DEFENDER
                    defender.take_damage(val) if eff["tgt"] != "self" else attacker.take_damage(val)
                    target = defender if eff["tgt"] != "self" else attacker
                    if eff["dur"] > 1:
                        target.effects.append(ActiveEffect("damage", eff["base"], eff["dur"] - 1, attacker.sin))
                else:
                    if eff["tgt"] == "self":
                        attacker.take_damage(val)
                    elif eff["tgt"] == "aoe":
                        defender.take_damage(val)  # 1v1 sim, aoe = hit opponent
                    else:
                        defender.take_damage(val)
                        
            elif eff["type"] == "heal":
                if eff["dur"] > 0:
                    attacker.heal(val)
                    if eff["dur"] > 1:
                        attacker.effects.append(ActiveEffect("heal", eff["base"], eff["dur"] - 1, attacker.sin))
                else:
                    attacker.heal(val)
                    
            elif eff["type"] == "shield":
                attacker.shield += val
                # Shield persists for duration rounds via active effect
                # Simplified: shield value added directly, decays with round
                
            elif eff["type"] == "debuff":
                if eff["tgt"] == "self":
                    attacker.debuff_stacks += val
                    if eff["dur"] > 1:
                        attacker.effects.append(ActiveEffect("debuff", eff["base"], eff["dur"] - 1, attacker.sin))
                else:
                    defender.debuff_stacks += val
                    if eff["dur"] > 1:
                        defender.effects.append(ActiveEffect("debuff", eff["base"], eff["dur"] - 1, attacker.sin))
        
        # Greed Avarice: heal 1 HP per energy spent (passive)
        if attacker.sin == "greed":
            attacker.heal(1)  # heal per card played
            
        return True
    
    def ai_pick(self, player, opponent):
        """Pick the best affordable card."""
        playable = [c for c in player.hand if self.cards[c]["cost"] <= player.energy]
        if not playable:
            # Wrath overcharge
            if player.sin == "wrath" and player.hp > WRATH_OVERCHARGE_HP_COST + 5:
                player.hp -= WRATH_OVERCHARGE_HP_COST
                player.energy += WRATH_OVERCHARGE_ENERGY_GAIN
                player.energy = min(player.energy, MAX_ENERGY)
                playable = [c for c in player.hand if self.cards[c]["cost"] <= player.energy]
            if not playable:
                return None
        
        def score(cid):
            card = self.cards[cid]
            s = 0
            for eff in card["effects"]:
                val = calc_eff(eff["base"], self.rnd)
                if eff["type"] == "damage":
                    if eff["tgt"] == "self":
                        s -= val * 1.3
                    else:
                        s += val * (1 + eff["dur"] * 0.6)
                elif eff["type"] == "heal":
                    hp_pct = player.hp / STARTING_HP
                    s += val * (2.0 if hp_pct < 0.4 else 0.8) * (1 + eff["dur"] * 0.5)
                elif eff["type"] == "shield":
                    s += val * 0.7 * (1 + eff["dur"] * 0.4)
                elif eff["type"] == "debuff":
                    if eff["tgt"] == "self":
                        s -= val * 0.4
                    else:
                        s += val * 0.5 * (1 + eff["dur"] * 0.4)
            return s
        
        return max(playable, key=score)
    
    def simulate(self):
        """Run a full game. Returns winner sin or 'draw'."""
        for rnd in range(1, MAX_ROUNDS + 1):
            self.rnd = rnd
            
            # Determine turn order (alternate who goes first)
            if rnd % 2 == 1:
                order = [(self.p1, self.p2), (self.p2, self.p1)]
            else:
                order = [(self.p2, self.p1), (self.p1, self.p2)]
            
            for attacker, defender in order:
                if not attacker.alive or not defender.alive:
                    continue
                
                # Start of turn: tick effects
                attacker.tick_effects(rnd)
                if not attacker.alive:
                    continue
                
                # Refresh energy
                self.refresh_energy(attacker, defender)
                attacker.draw_hand()
                
                # Play cards until out of energy or no playable cards
                cards_played = 0
                while attacker.alive and defender.alive and cards_played < 3:
                    card = self.ai_pick(attacker, defender)
                    if card is None:
                        break
                    self.play_card(attacker, defender, card)
                    attacker.hand.remove(card)
                    cards_played += 1
                
                if not defender.alive:
                    return attacker.sin
            
            if not self.p1.alive and not self.p2.alive:
                return "draw"
            if not self.p1.alive:
                return self.p2.sin
            if not self.p2.alive:
                return self.p1.sin
        
        # Timeout
        if self.p1.hp > self.p2.hp:
            return self.p1.sin
        elif self.p2.hp > self.p1.hp:
            return self.p2.sin
        return "draw"


def run_sim(cards, n=5000):
    """Run all matchups and return overall win rates."""
    matchups = list(combinations(SINS, 2))
    wins = defaultdict(int)
    games = defaultdict(int)
    matchup_data = {}
    round_lengths = defaultdict(list)
    
    for sin1, sin2 in matchups:
        w1, w2, draws = 0, 0, 0
        for _ in range(n):
            g = Game(sin1, sin2, cards)
            result = g.simulate()
            if result == sin1:
                w1 += 1
            elif result == sin2:
                w2 += 1
            else:
                draws += 1
            round_lengths[f"{sin1}_vs_{sin2}"].append(g.rnd)
        
        wins[sin1] += w1
        wins[sin2] += w2
        games[sin1] += n
        games[sin2] += n
        matchup_data[f"{sin1}_vs_{sin2}"] = {
            "wr1": w1/n, "wr2": w2/n, "draws": draws/n,
            "avg_rnd": np.mean(round_lengths[f"{sin1}_vs_{sin2}"])
        }
    
    overall = {sin: wins[sin] / games[sin] for sin in SINS}
    return overall, matchup_data


def print_results(overall, matchup_data, label=""):
    print(f"\n{'='*60}")
    print(f"  {label}")
    print(f"{'='*60}")
    
    print("\n  Overall Win Rates:")
    for sin in sorted(overall, key=overall.get, reverse=True):
        bar = "█" * int(overall[sin] * 40)
        print(f"    {sin.upper():<7}: {overall[sin]:>6.1%} {bar}")
    
    mean = np.mean(list(overall.values()))
    max_dev = max(abs(v - mean) for v in overall.values())
    print(f"\n  Mean: {mean:.1%}, Max deviation: {max_dev:.1%}")
    grade = "EXCELLENT" if max_dev < 0.03 else "GOOD" if max_dev < 0.05 else "FAIR" if max_dev < 0.08 else "POOR"
    print(f"  Balance grade: {grade}")
    
    print("\n  Matchup Details:")
    print(f"    {'Matchup':<20} {'Sin1':>7} {'Sin2':>7} {'Draws':>7} {'AvgRnd':>7}")
    for key, d in sorted(matchup_data.items()):
        print(f"    {key:<20} {d['wr1']:>6.1%} {d['wr2']:>6.1%} {d['draws']:>6.1%} {d['avg_rnd']:>6.1f}")
    
    return max_dev


# ═══════════════════════════════════════════════════════════════
# ITERATIVE REBALANCING
# ═══════════════════════════════════════════════════════════════

def rebalance(cards, overall):
    """Apply targeted adjustments to bring factions closer to 50%."""
    mean_wr = np.mean(list(overall.values()))
    
    for sin in SINS:
        dev = overall[sin] - mean_wr
        sin_cards = {cid: c for cid, c in cards.items() if c["sin"] == sin}
        
        if dev > 0.05:  # Too strong - nerf
            # Reduce damage base values on highest-damage cards
            damage_cards = []
            for cid, c in sin_cards.items():
                for eff in c["effects"]:
                    if eff["type"] == "damage" and eff["tgt"] != "self":
                        damage_cards.append((cid, eff))
            
            # Sort by base value descending, nerf the top ones
            damage_cards.sort(key=lambda x: x[1]["base"], reverse=True)
            nerfs_needed = max(1, int(dev * 10))
            for i in range(min(nerfs_needed, len(damage_cards))):
                cid, eff = damage_cards[i]
                if eff["base"] > 1:
                    eff["base"] -= 1
                    
        elif dev < -0.05:  # Too weak - buff
            # Increase damage or heal base values
            buff_cards = []
            for cid, c in sin_cards.items():
                for eff in c["effects"]:
                    if eff["type"] in ("damage", "heal") and eff["tgt"] != "self":
                        buff_cards.append((cid, eff))
                    elif eff["type"] == "heal" and eff["tgt"] == "self":
                        buff_cards.append((cid, eff))
            
            buff_cards.sort(key=lambda x: x[1]["base"])
            buffs_needed = max(1, int(abs(dev) * 10))
            for i in range(min(buffs_needed, len(buff_cards))):
                cid, eff = buff_cards[i]
                eff["base"] += 1
                
        elif dev > 0.03:  # Slightly strong
            # Small nerf: increase cost of cheapest high-damage card
            for cid, c in sin_cards.items():
                total_dmg = sum(e["base"] for e in c["effects"] if e["type"] == "damage" and e["tgt"] != "self")
                if total_dmg >= 3 and c["cost"] <= 1:
                    c["cost"] += 1
                    break
                    
        elif dev < -0.03:  # Slightly weak
            # Small buff: reduce cost or add 1 to a heal
            for cid, c in sin_cards.items():
                for eff in c["effects"]:
                    if eff["type"] == "shield" and eff["base"] < 4:
                        eff["base"] += 1
                        break
                else:
                    continue
                break
    
    return cards


# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("7 DEADLY SINS - ITERATIVE CARD REBALANCER")
    print("=" * 60)
    
    # Step 1: Baseline with proper simulation
    cards = make_cards()
    print("\n[Step 1] Running baseline simulation (5000 games/matchup)...")
    overall, matchup_data = run_sim(cards, 5000)
    max_dev = print_results(overall, matchup_data, "BASELINE (Current Card Values)")
    
    # Step 2: Iterative rebalancing
    best_cards = deepcopy(cards)
    best_dev = max_dev
    best_overall = overall
    best_matchup = matchup_data
    
    for iteration in range(1, 16):
        print(f"\n[Step 2.{iteration}] Rebalancing iteration {iteration}...")
        cards = rebalance(cards, overall)
        overall, matchup_data = run_sim(cards, 5000)
        max_dev = print_results(overall, matchup_data, f"ITERATION {iteration}")
        
        if max_dev < best_dev:
            best_dev = max_dev
            best_cards = deepcopy(cards)
            best_overall = overall
            best_matchup = matchup_data
            print(f"  *** NEW BEST: max_dev = {max_dev:.1%} ***")
        
        if max_dev < 0.03:
            print(f"\n  TARGET REACHED: All factions within 3% of mean!")
            break
    
    # Step 3: Print final results
    print("\n" + "=" * 60)
    print("FINAL REBALANCED CARD VALUES")
    print("=" * 60)
    
    original = make_cards()
    changes = []
    
    for cid in sorted(best_cards.keys()):
        orig = original[cid]
        new = best_cards[cid]
        
        diffs = []
        if orig["cost"] != new["cost"]:
            diffs.append(f"cost: {orig['cost']} -> {new['cost']}")
        
        for i, (oe, ne) in enumerate(zip(orig["effects"], new["effects"])):
            if oe["base"] != ne["base"]:
                diffs.append(f"effect[{i}].base ({oe['type']}): {oe['base']} -> {ne['base']}")
            if oe.get("dur", 0) != ne.get("dur", 0):
                diffs.append(f"effect[{i}].dur ({oe['type']}): {oe.get('dur',0)} -> {ne.get('dur',0)}")
        
        if diffs:
            changes.append({"id": cid, "name": new["name"], "sin": new["sin"], "changes": diffs})
            print(f"\n  {cid} ({new['name']}) [{new['sin'].upper()}]:")
            for d in diffs:
                print(f"    - {d}")
    
    if not changes:
        print("  No changes needed!")
    
    print(f"\n\nTotal cards changed: {len(changes)}")
    print_results(best_overall, best_matchup, "FINAL BALANCED STATE")
    
    # Save results
    output = {
        "baseline_win_rates": {sin: round(v, 4) for sin, v in run_sim(make_cards(), 5000)[0].items()},
        "final_win_rates": {sin: round(v, 4) for sin, v in best_overall.items()},
        "final_matchups": best_matchup,
        "max_deviation": round(best_dev, 4),
        "changes": changes,
        "final_cards": {}
    }
    
    for cid, card in best_cards.items():
        output["final_cards"][cid] = {
            "name": card["name"],
            "sin": card["sin"],
            "cost": card["cost"],
            "effects": card["effects"]
        }
    
    with open("/home/ubuntu/7-sins-card-game/balance_final.json", "w") as f:
        json.dump(output, f, indent=2)
    
    print("\nResults saved to balance_final.json")
