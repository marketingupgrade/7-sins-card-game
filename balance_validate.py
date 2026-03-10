"""
7 Deadly Sins - Fast Validation of Optimized Card Values

Applies the changes discovered by the coordinate descent optimizer (iter 0)
and runs a validation simulation with 10,000 games per matchup.

Key changes from optimizer:
- STARTING_HP: 25 -> 30 (gives defensive factions time to develop)
- Multiple card stat adjustments to equalize matchups
"""

import random
import math
import json
import numpy as np
from collections import defaultdict
from itertools import combinations

random.seed(42)
np.random.seed(42)

STARTING_HP = 30
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
SINS = ["wrath", "sloth", "greed", "envy"]

def get_base_energy(r):
    return min(STARTING_ENERGY + (r - 1) * ENERGY_PER_ROUND, MAX_ENERGY)

def calc_eff(base, rnd):
    return round(base * min(rnd, MAX_ROUNDS))

# ─── OPTIMIZED CARD VALUES ───────────────────────────────────
# Applied all changes from optimizer iteration 0 (loss: 1.16 -> 0.21)
CARDS = {
    # WRATH - nerfed burst damage, increased self-harm costs
    "wrath_01": {"name":"Fury Strike","sin":"wrath","cost":2,"effects":[{"type":"damage","base":2,"dur":0,"tgt":"enemy"}]},  # cost 1->2, base 3->2
    "wrath_02": {"name":"Blind Rage","sin":"wrath","cost":1,"effects":[{"type":"damage","base":3,"dur":0,"tgt":"enemy"},{"type":"damage","base":1,"dur":0,"tgt":"self"}]},  # base 4->3
    "wrath_03": {"name":"Blood Boil","sin":"wrath","cost":3,"effects":[{"type":"damage","base":1,"dur":2,"tgt":"enemy"}]},  # cost 2->3, base 2->1
    "wrath_04": {"name":"Berserker's Howl","sin":"wrath","cost":3,"effects":[{"type":"damage","base":2,"dur":0,"tgt":"aoe"}]},  # unchanged
    "wrath_05": {"name":"Crimson Slash","sin":"wrath","cost":1,"effects":[{"type":"damage","base":2,"dur":0,"tgt":"enemy"}]},  # unchanged
    "wrath_06": {"name":"Vendetta","sin":"wrath","cost":1,"effects":[{"type":"damage","base":5,"dur":0,"tgt":"enemy"},{"type":"damage","base":3,"dur":0,"tgt":"self"}]},  # cost 2->1, self 2->3
    "wrath_07": {"name":"Rage Shield","sin":"wrath","cost":2,"effects":[{"type":"shield","base":2,"dur":1,"tgt":"self"}]},  # unchanged
    "wrath_08": {"name":"Burning Hatred","sin":"wrath","cost":3,"effects":[{"type":"damage","base":3,"dur":3,"tgt":"enemy"}]},  # unchanged
    "wrath_09": {"name":"Corruption Surge","sin":"wrath","cost":0,"effects":[{"type":"damage","base":3,"dur":0,"tgt":"enemy"},{"type":"damage","base":2,"dur":0,"tgt":"self"}]},  # unchanged
    "wrath_10": {"name":"Apocalypse Fist","sin":"wrath","cost":5,"effects":[{"type":"damage","base":4,"dur":0,"tgt":"aoe"},{"type":"damage","base":3,"dur":0,"tgt":"self"}]},  # unchanged

    # SLOTH - buffed damage and shields significantly
    "sloth_01": {"name":"Drowsy Touch","sin":"sloth","cost":1,"effects":[{"type":"debuff","base":1,"dur":2,"tgt":"enemy"}]},  # unchanged
    "sloth_02": {"name":"Pillow Fort","sin":"sloth","cost":1,"effects":[{"type":"shield","base":4,"dur":2,"tgt":"self"}]},  # cost 2->1, base 3->4
    "sloth_03": {"name":"Lazy Drain","sin":"sloth","cost":1,"effects":[{"type":"damage","base":2,"dur":0,"tgt":"enemy"},{"type":"heal","base":1,"dur":0,"tgt":"self"}]},  # cost 2->1, dmg 1->2
    "sloth_04": {"name":"Procrastination","sin":"sloth","cost":0,"effects":[{"type":"shield","base":3,"dur":1,"tgt":"self"}]},  # cost 1->0, base 2->3
    "sloth_05": {"name":"Entropy Wave","sin":"sloth","cost":3,"effects":[{"type":"damage","base":2,"dur":3,"tgt":"aoe"}]},  # base 1->2
    "sloth_06": {"name":"Hibernate","sin":"sloth","cost":3,"effects":[{"type":"heal","base":3,"dur":2,"tgt":"self"}]},  # unchanged
    "sloth_07": {"name":"Lethargy Aura","sin":"sloth","cost":2,"effects":[{"type":"debuff","base":2,"dur":2,"tgt":"enemy"}]},  # unchanged
    "sloth_08": {"name":"Passive Resistance","sin":"sloth","cost":1,"effects":[{"type":"shield","base":1,"dur":1,"tgt":"self"},{"type":"damage","base":1,"dur":0,"tgt":"enemy"}]},  # unchanged
    "sloth_09": {"name":"Deep Slumber","sin":"sloth","cost":0,"effects":[{"type":"heal","base":2,"dur":0,"tgt":"self"},{"type":"debuff","base":1,"dur":1,"tgt":"self"}]},  # unchanged
    "sloth_10": {"name":"Eternal Rest","sin":"sloth","cost":4,"effects":[{"type":"heal","base":5,"dur":0,"tgt":"self"},{"type":"shield","base":3,"dur":2,"tgt":"self"}]},  # unchanged

    # GREED - adjusted costs and values for tempo balance
    "greed_01": {"name":"Pocket Pick","sin":"greed","cost":2,"effects":[{"type":"damage","base":1,"dur":0,"tgt":"enemy"},{"type":"heal","base":1,"dur":0,"tgt":"self"}]},  # cost 1->2, dmg 2->1
    "greed_02": {"name":"Tax Collector","sin":"greed","cost":1,"effects":[{"type":"damage","base":2,"dur":0,"tgt":"enemy"}]},  # unchanged
    "greed_03": {"name":"Compound Interest","sin":"greed","cost":1,"effects":[{"type":"damage","base":1,"dur":3,"tgt":"enemy"}]},  # cost 2->1
    "greed_04": {"name":"Hostile Takeover","sin":"greed","cost":3,"effects":[{"type":"damage","base":3,"dur":0,"tgt":"enemy"},{"type":"heal","base":2,"dur":0,"tgt":"self"}]},  # unchanged
    "greed_05": {"name":"Golden Shield","sin":"greed","cost":2,"effects":[{"type":"shield","base":2,"dur":2,"tgt":"self"}]},  # unchanged
    "greed_06": {"name":"Embezzle","sin":"greed","cost":0,"effects":[{"type":"damage","base":2,"dur":0,"tgt":"enemy"},{"type":"heal","base":1,"dur":0,"tgt":"self"}]},  # cost 1->0, dmg 1->2, heal 2->1
    "greed_07": {"name":"Market Crash","sin":"greed","cost":2,"effects":[{"type":"damage","base":1,"dur":0,"tgt":"aoe"}]},  # cost 3->2, base 2->1
    "greed_08": {"name":"Loan Shark","sin":"greed","cost":2,"effects":[{"type":"damage","base":2,"dur":2,"tgt":"enemy"},{"type":"damage","base":1,"dur":0,"tgt":"self"}]},  # unchanged
    "greed_09": {"name":"Insider Trading","sin":"greed","cost":0,"effects":[{"type":"damage","base":2,"dur":0,"tgt":"enemy"},{"type":"damage","base":2,"dur":0,"tgt":"self"}]},  # self 1->2
    "greed_10": {"name":"Midas Touch","sin":"greed","cost":5,"effects":[{"type":"damage","base":3,"dur":0,"tgt":"aoe"},{"type":"heal","base":3,"dur":0,"tgt":"self"}]},  # cost 4->5

    # ENVY - buffed across the board to compete
    "envy_01": {"name":"Jealous Glare","sin":"envy","cost":0,"effects":[{"type":"damage","base":3,"dur":0,"tgt":"enemy"},{"type":"debuff","base":2,"dur":1,"tgt":"enemy"}]},  # cost 1->0, dmg 2->3, debuff 1->2
    "envy_02": {"name":"Bitter Reflection","sin":"envy","cost":1,"effects":[{"type":"damage","base":3,"dur":0,"tgt":"enemy"},{"type":"shield","base":3,"dur":1,"tgt":"self"}]},  # cost 2->1, dmg 2->3, shield 2->3
    "envy_03": {"name":"Covetous Strike","sin":"envy","cost":1,"effects":[{"type":"damage","base":3,"dur":0,"tgt":"enemy"}]},  # unchanged
    "envy_04": {"name":"Green-Eyed Curse","sin":"envy","cost":1,"effects":[{"type":"debuff","base":2,"dur":3,"tgt":"enemy"}]},  # cost 2->1
    "envy_05": {"name":"Spite Shield","sin":"envy","cost":1,"effects":[{"type":"shield","base":2,"dur":1,"tgt":"self"}]},  # unchanged
    "envy_06": {"name":"Toxic Comparison","sin":"envy","cost":2,"effects":[{"type":"damage","base":2,"dur":2,"tgt":"enemy"},{"type":"debuff","base":2,"dur":2,"tgt":"enemy"}]},  # cost 3->2, debuff 1->2
    "envy_07": {"name":"Schadenfreude","sin":"envy","cost":2,"effects":[{"type":"damage","base":1,"dur":0,"tgt":"aoe"},{"type":"heal","base":1,"dur":0,"tgt":"self"}]},  # unchanged
    "envy_08": {"name":"Copycat","sin":"envy","cost":2,"effects":[{"type":"damage","base":3,"dur":0,"tgt":"enemy"},{"type":"damage","base":1,"dur":0,"tgt":"self"}]},  # unchanged
    "envy_09": {"name":"Stolen Glory","sin":"envy","cost":0,"effects":[{"type":"heal","base":2,"dur":0,"tgt":"self"},{"type":"damage","base":1,"dur":0,"tgt":"self"}]},  # unchanged
    "envy_10": {"name":"Doppelganger","sin":"envy","cost":3,"effects":[{"type":"damage","base":4,"dur":0,"tgt":"enemy"},{"type":"shield","base":2,"dur":2,"tgt":"self"},{"type":"heal","base":1,"dur":0,"tgt":"self"}]},  # cost 4->3, dmg 3->4
}


# ─── Simulation (same engine as optimizer) ───────────────────

class Player:
    def __init__(self, sin):
        self.sin = sin
        self.hp = STARTING_HP
        self.max_hp = STARTING_HP
        self.alive = True
        self.energy = STARTING_ENERGY
        self.bonus_energy = 0
        self.avarice_bonus = 0
        self.shield = 0
        self.debuff_stacks = 0
        self.effects = []
        self.deck = [cid for cid, c in CARDS.items() if c["sin"] == sin]
        self.hand = []
        
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
        self.hp = min(self.hp + amount, self.max_hp)
        
    def tick_effects(self, rnd):
        remaining = []
        for eff in self.effects:
            if eff["remaining"] <= 0:
                continue
            val = calc_eff(eff["base"], rnd)
            if eff["type"] == "damage":
                self.take_damage(val)
            elif eff["type"] == "heal":
                self.heal(val)
            elif eff["type"] == "debuff":
                self.debuff_stacks += val
            eff["remaining"] -= 1
            if eff["remaining"] > 0:
                remaining.append(eff)
        self.effects = remaining


class Game:
    def __init__(self, sin1, sin2):
        self.p1 = Player(sin1)
        self.p2 = Player(sin2)
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
        player.debuff_stacks = 0
        
    def play_card(self, attacker, defender, card_id):
        card = CARDS[card_id]
        if card["cost"] > attacker.energy:
            return False
        attacker.energy -= card["cost"]
        
        if attacker.sin == "greed" and card["cost"] >= GREED_AVARICE_COST_THRESHOLD:
            attacker.avarice_bonus += GREED_AVARICE_BONUS
        
        for eff in card["effects"]:
            val = calc_eff(eff["base"], self.rnd)
            if eff["type"] == "damage" and eff["tgt"] != "self" and attacker.debuff_stacks > 0:
                val = max(1, val - attacker.debuff_stacks)
            
            if eff["type"] == "damage":
                if eff["dur"] > 0:
                    target = defender if eff["tgt"] != "self" else attacker
                    target.take_damage(val)
                    if eff["dur"] > 1:
                        target.effects.append({"type": "damage", "base": eff["base"], "remaining": eff["dur"] - 1})
                else:
                    if eff["tgt"] == "self":
                        attacker.take_damage(val)
                    else:
                        defender.take_damage(val)
            elif eff["type"] == "heal":
                if eff["dur"] > 0:
                    attacker.heal(val)
                    if eff["dur"] > 1:
                        attacker.effects.append({"type": "heal", "base": eff["base"], "remaining": eff["dur"] - 1})
                else:
                    attacker.heal(val)
            elif eff["type"] == "shield":
                attacker.shield += val
            elif eff["type"] == "debuff":
                if eff["tgt"] == "self":
                    attacker.debuff_stacks += val
                    if eff["dur"] > 1:
                        attacker.effects.append({"type": "debuff", "base": eff["base"], "remaining": eff["dur"] - 1})
                else:
                    defender.debuff_stacks += val
                    if eff["dur"] > 1:
                        defender.effects.append({"type": "debuff", "base": eff["base"], "remaining": eff["dur"] - 1})
        
        if attacker.sin == "greed":
            attacker.heal(1)
        return True
    
    def ai_pick(self, player, opponent):
        playable = [c for c in player.hand if CARDS[c]["cost"] <= player.energy]
        if not playable:
            if player.sin == "wrath" and player.hp > WRATH_OVERCHARGE_HP_COST + 5:
                player.hp -= WRATH_OVERCHARGE_HP_COST
                player.energy += WRATH_OVERCHARGE_ENERGY_GAIN
                player.energy = min(player.energy, MAX_ENERGY)
                playable = [c for c in player.hand if CARDS[c]["cost"] <= player.energy]
            if not playable:
                return None
        
        def score(cid):
            card = CARDS[cid]
            s = 0
            for eff in card["effects"]:
                val = calc_eff(eff["base"], self.rnd)
                if eff["type"] == "damage":
                    if eff["tgt"] == "self":
                        s -= val * 1.3
                    else:
                        s += val * (1 + eff["dur"] * 0.6)
                elif eff["type"] == "heal":
                    hp_pct = player.hp / player.max_hp
                    s += val * (2.0 if hp_pct < 0.4 else 0.8) * (1 + eff["dur"] * 0.5)
                elif eff["type"] == "shield":
                    s += val * 0.7
                elif eff["type"] == "debuff":
                    s += val * 0.5 * (1 + eff["dur"] * 0.4) if eff["tgt"] != "self" else -val * 0.4
            return s
        
        return max(playable, key=score)
    
    def simulate(self):
        for rnd in range(1, MAX_ROUNDS + 1):
            self.rnd = rnd
            if rnd % 2 == 1:
                order = [(self.p1, self.p2), (self.p2, self.p1)]
            else:
                order = [(self.p2, self.p1), (self.p1, self.p2)]
            
            for attacker, defender in order:
                if not attacker.alive or not defender.alive:
                    continue
                attacker.tick_effects(rnd)
                if not attacker.alive:
                    continue
                self.refresh_energy(attacker, defender)
                attacker.draw_hand()
                
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
        
        if self.p1.hp > self.p2.hp:
            return self.p1.sin
        elif self.p2.hp > self.p1.hp:
            return self.p2.sin
        return "draw"


# ─── Run Validation ──────────────────────────────────────────

if __name__ == "__main__":
    N = 10000
    print(f"Running validation: {N} games per matchup, HP={STARTING_HP}")
    print("=" * 60)
    
    matchups = list(combinations(SINS, 2))
    wins = defaultdict(int)
    games = defaultdict(int)
    matchup_data = {}
    
    for sin1, sin2 in matchups:
        w1, w2, draws = 0, 0, 0
        round_lens = []
        for _ in range(N):
            g = Game(sin1, sin2)
            result = g.simulate()
            if result == sin1:
                w1 += 1
            elif result == sin2:
                w2 += 1
            else:
                draws += 1
            round_lens.append(g.rnd)
        
        wins[sin1] += w1
        wins[sin2] += w2
        games[sin1] += N
        games[sin2] += N
        
        wr1 = w1 / N
        wr2 = w2 / N
        avg_rnd = np.mean(round_lens)
        matchup_data[f"{sin1}_vs_{sin2}"] = {"wr1": wr1, "wr2": wr2, "draws": draws/N, "avg_rnd": avg_rnd}
        print(f"  {sin1:<7} vs {sin2:<7}: {wr1:>6.1%} vs {wr2:>6.1%} (draws: {draws/N:.1%}, avg rnd: {avg_rnd:.1f})")
    
    print("\n" + "=" * 60)
    print("OVERALL WIN RATES")
    print("=" * 60)
    
    overall = {sin: wins[sin] / games[sin] for sin in SINS}
    for sin in sorted(overall, key=overall.get, reverse=True):
        bar = "█" * int(overall[sin] * 50)
        print(f"  {sin.upper():<7}: {overall[sin]:>6.1%} {bar}")
    
    mean = np.mean(list(overall.values()))
    max_dev = max(abs(v - mean) for v in overall.values())
    
    print(f"\n  Mean: {mean:.1%}")
    print(f"  Max deviation from mean: {max_dev:.1%}")
    print(f"  Win rate range: {max(overall.values()) - min(overall.values()):.1%}")
    
    grade = "EXCELLENT" if max_dev < 0.03 else "GOOD" if max_dev < 0.05 else "FAIR" if max_dev < 0.08 else "NEEDS_WORK"
    print(f"  Balance grade: {grade}")
    
    # Check for rock-paper-scissors dynamics
    print("\n  Matchup Matrix (row beats column %):")
    print(f"  {'':>8}", end="")
    for s in SINS:
        print(f"{s[:5]:>8}", end="")
    print()
    for s1 in SINS:
        print(f"  {s1[:5]:>8}", end="")
        for s2 in SINS:
            if s1 == s2:
                print(f"{'--':>8}", end="")
            else:
                key1 = f"{s1}_vs_{s2}"
                key2 = f"{s2}_vs_{s1}"
                if key1 in matchup_data:
                    print(f"{matchup_data[key1]['wr1']:>7.0%}", end=" ")
                elif key2 in matchup_data:
                    print(f"{1-matchup_data[key2]['wr1']:>7.0%}", end=" ")
        print()
    
    # Save results
    output = {
        "starting_hp": STARTING_HP,
        "balance_grade": grade,
        "max_deviation": round(max_dev, 4),
        "overall_win_rates": {sin: round(v, 4) for sin, v in overall.items()},
        "matchups": matchup_data,
        "cards": CARDS,
    }
    
    with open("/home/ubuntu/7-sins-card-game/balance_final.json", "w") as f:
        json.dump(output, f, indent=2, default=str)
    
    print("\nResults saved to balance_final.json")
