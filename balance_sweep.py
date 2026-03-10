"""
7 Deadly Sins - Balance Sweep v3

Key insight: The simulation reveals a natural rock-paper-scissors dynamic:
  Sloth > Wrath (shields negate burst)
  Wrath > Envy (burst kills before debuffs matter)
  Envy > Sloth (debuffs reduce Sloth's already-low damage to nothing)
  Greed is the "balanced middle" faction

This is actually GOOD game design - we want soft counters (55-60%), not hard counters (80%+).
The goal is to compress the matchup spread so no matchup exceeds 60:40.

Strategy: 
1. Keep HP=25 (original, games are fast and exciting)
2. Reduce the extreme matchups by giving each faction tools against their counter
3. Specifically:
   - Give Wrath some sustain vs Sloth (so it's not 18:82)
   - Give Sloth some burst vs Envy (so debuffs don't completely shut it down)
   - Give Envy some defense vs Wrath (so burst doesn't one-shot)
   - Keep Greed as the balanced generalist
"""

import random
import math
import json
import numpy as np
from collections import defaultdict
from itertools import combinations
from copy import deepcopy

random.seed(42)

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
SINS = ["wrath", "sloth", "greed", "envy"]

def get_base_energy(r):
    return min(STARTING_ENERGY + (r - 1) * ENERGY_PER_ROUND, MAX_ENERGY)

def calc_eff(base, rnd):
    return round(base * min(rnd, MAX_ROUNDS))


# ─── BALANCED CARD SET v3 ────────────────────────────────────
# Design principles:
# - Each faction has 1 "answer" card for their worst matchup
# - Costs are tuned so factions can't just spam their best cards
# - Self-damage on Wrath is meaningful but not crippling
# - Sloth has enough damage to threaten, not just stall
# - Envy has enough defense to survive burst
# - Greed is the jack-of-all-trades

def make_cards():
    return {
        # WRATH: Burst damage + self-harm. 
        # Key change: Rage Shield buffed (helps vs Sloth stall), Vendetta self-dmg reduced
        "wrath_01": {"name":"Fury Strike","sin":"wrath","cost":1,"effects":[{"type":"damage","base":3,"dur":0,"tgt":"enemy"}]},
        "wrath_02": {"name":"Blind Rage","sin":"wrath","cost":1,"effects":[{"type":"damage","base":4,"dur":0,"tgt":"enemy"},{"type":"damage","base":2,"dur":0,"tgt":"self"}]},
        "wrath_03": {"name":"Blood Boil","sin":"wrath","cost":2,"effects":[{"type":"damage","base":2,"dur":2,"tgt":"enemy"}]},
        "wrath_04": {"name":"Berserker's Howl","sin":"wrath","cost":3,"effects":[{"type":"damage","base":2,"dur":0,"tgt":"aoe"}]},
        "wrath_05": {"name":"Crimson Slash","sin":"wrath","cost":1,"effects":[{"type":"damage","base":2,"dur":0,"tgt":"enemy"}]},
        "wrath_06": {"name":"Vendetta","sin":"wrath","cost":2,"effects":[{"type":"damage","base":4,"dur":0,"tgt":"enemy"},{"type":"damage","base":1,"dur":0,"tgt":"self"}]},  # dmg 5->4, self 2->1 (less punishing)
        "wrath_07": {"name":"Rage Shield","sin":"wrath","cost":1,"effects":[{"type":"shield","base":3,"dur":1,"tgt":"self"}]},  # cost 2->1, base 2->3 (anti-stall tool)
        "wrath_08": {"name":"Burning Hatred","sin":"wrath","cost":3,"effects":[{"type":"damage","base":2,"dur":3,"tgt":"enemy"}]},  # base 3->2 (less oppressive DoT)
        "wrath_09": {"name":"Corruption Surge","sin":"wrath","cost":0,"effects":[{"type":"damage","base":2,"dur":0,"tgt":"enemy"},{"type":"damage","base":1,"dur":0,"tgt":"self"}]},  # dmg 3->2, self 2->1 (less risky)
        "wrath_10": {"name":"Apocalypse Fist","sin":"wrath","cost":5,"effects":[{"type":"damage","base":4,"dur":0,"tgt":"aoe"},{"type":"damage","base":2,"dur":0,"tgt":"self"}]},  # self 3->2

        # SLOTH: Shields + heals + stall.
        # Key change: More damage output (Entropy Wave, Passive Resistance buffed)
        "sloth_01": {"name":"Drowsy Touch","sin":"sloth","cost":1,"effects":[{"type":"debuff","base":1,"dur":2,"tgt":"enemy"}]},
        "sloth_02": {"name":"Pillow Fort","sin":"sloth","cost":2,"effects":[{"type":"shield","base":3,"dur":2,"tgt":"self"}]},
        "sloth_03": {"name":"Lazy Drain","sin":"sloth","cost":2,"effects":[{"type":"damage","base":2,"dur":0,"tgt":"enemy"},{"type":"heal","base":2,"dur":0,"tgt":"self"}]},  # dmg 1->2, heal 1->2
        "sloth_04": {"name":"Procrastination","sin":"sloth","cost":1,"effects":[{"type":"shield","base":2,"dur":1,"tgt":"self"}]},
        "sloth_05": {"name":"Entropy Wave","sin":"sloth","cost":3,"effects":[{"type":"damage","base":2,"dur":3,"tgt":"aoe"}]},  # base 1->2 (real damage threat)
        "sloth_06": {"name":"Hibernate","sin":"sloth","cost":3,"effects":[{"type":"heal","base":3,"dur":2,"tgt":"self"}]},
        "sloth_07": {"name":"Lethargy Aura","sin":"sloth","cost":2,"effects":[{"type":"debuff","base":2,"dur":2,"tgt":"enemy"}]},
        "sloth_08": {"name":"Passive Resistance","sin":"sloth","cost":1,"effects":[{"type":"shield","base":1,"dur":1,"tgt":"self"},{"type":"damage","base":2,"dur":0,"tgt":"enemy"}]},  # dmg 1->2
        "sloth_09": {"name":"Deep Slumber","sin":"sloth","cost":0,"effects":[{"type":"heal","base":2,"dur":0,"tgt":"self"},{"type":"debuff","base":1,"dur":1,"tgt":"self"}]},
        "sloth_10": {"name":"Eternal Rest","sin":"sloth","cost":4,"effects":[{"type":"heal","base":4,"dur":0,"tgt":"self"},{"type":"shield","base":3,"dur":2,"tgt":"self"}]},  # heal 5->4

        # GREED: Drain + tempo + sustain.
        # Key change: Slight nerfs to keep as balanced middle
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

        # ENVY: Debuffs + reactive.
        # Key change: More shields/defense (Bitter Reflection, Spite Shield buffed)
        "envy_01": {"name":"Jealous Glare","sin":"envy","cost":1,"effects":[{"type":"damage","base":2,"dur":0,"tgt":"enemy"},{"type":"debuff","base":1,"dur":1,"tgt":"enemy"}]},
        "envy_02": {"name":"Bitter Reflection","sin":"envy","cost":2,"effects":[{"type":"damage","base":2,"dur":0,"tgt":"enemy"},{"type":"shield","base":3,"dur":1,"tgt":"self"}]},  # shield 2->3
        "envy_03": {"name":"Covetous Strike","sin":"envy","cost":1,"effects":[{"type":"damage","base":3,"dur":0,"tgt":"enemy"}]},
        "envy_04": {"name":"Green-Eyed Curse","sin":"envy","cost":2,"effects":[{"type":"debuff","base":2,"dur":3,"tgt":"enemy"}]},
        "envy_05": {"name":"Spite Shield","sin":"envy","cost":1,"effects":[{"type":"shield","base":3,"dur":1,"tgt":"self"}]},  # base 2->3 (anti-burst tool)
        "envy_06": {"name":"Toxic Comparison","sin":"envy","cost":3,"effects":[{"type":"damage","base":2,"dur":2,"tgt":"enemy"},{"type":"debuff","base":1,"dur":2,"tgt":"enemy"}]},
        "envy_07": {"name":"Schadenfreude","sin":"envy","cost":2,"effects":[{"type":"damage","base":1,"dur":0,"tgt":"aoe"},{"type":"heal","base":1,"dur":0,"tgt":"self"}]},
        "envy_08": {"name":"Copycat","sin":"envy","cost":2,"effects":[{"type":"damage","base":3,"dur":0,"tgt":"enemy"},{"type":"damage","base":1,"dur":0,"tgt":"self"}]},
        "envy_09": {"name":"Stolen Glory","sin":"envy","cost":0,"effects":[{"type":"heal","base":2,"dur":0,"tgt":"self"},{"type":"damage","base":1,"dur":0,"tgt":"self"}]},
        "envy_10": {"name":"Doppelganger","sin":"envy","cost":4,"effects":[{"type":"damage","base":3,"dur":0,"tgt":"enemy"},{"type":"shield","base":2,"dur":2,"tgt":"self"},{"type":"heal","base":1,"dur":0,"tgt":"self"}]},
    }


class Player:
    def __init__(self, sin, cards):
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
        player.debuff_stacks = 0
        
    def play_card(self, attacker, defender, card_id):
        card = self.cards[card_id]
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
        playable = [c for c in player.hand if self.cards[c]["cost"] <= player.energy]
        if not playable:
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


def run_sim(cards, n=5000):
    matchups = list(combinations(SINS, 2))
    wins = defaultdict(int)
    games = defaultdict(int)
    matchup_data = {}
    
    for sin1, sin2 in matchups:
        w1 = 0
        rnds = []
        for _ in range(n):
            g = Game(sin1, sin2, cards)
            result = g.simulate()
            if result == sin1:
                w1 += 1
            rnds.append(g.rnd)
        
        wr1 = w1 / n
        wins[sin1] += w1
        wins[sin2] += (n - w1)
        games[sin1] += n
        games[sin2] += n
        matchup_data[f"{sin1}_vs_{sin2}"] = {"wr1": wr1, "avg_rnd": np.mean(rnds)}
    
    overall = {sin: wins[sin] / games[sin] for sin in SINS}
    return overall, matchup_data


if __name__ == "__main__":
    cards = make_cards()
    
    print("BALANCE SWEEP v3 - Targeted Rebalance")
    print("=" * 60)
    
    overall, matchup_data = run_sim(cards, 10000)
    
    print("\nMatchup Results:")
    for key in sorted(matchup_data):
        s1, s2 = key.split("_vs_")
        wr1 = matchup_data[key]["wr1"]
        avg_rnd = matchup_data[key]["avg_rnd"]
        print(f"  {s1:<7} vs {s2:<7}: {wr1:>6.1%} vs {1-wr1:>6.1%} (avg rnd: {avg_rnd:.1f})")
    
    print("\nOverall Win Rates:")
    for sin in sorted(overall, key=overall.get, reverse=True):
        bar = "█" * int(overall[sin] * 50)
        print(f"  {sin.upper():<7}: {overall[sin]:>6.1%} {bar}")
    
    mean = np.mean(list(overall.values()))
    max_dev = max(abs(v - mean) for v in overall.values())
    max_matchup_dev = max(abs(d["wr1"] - 0.5) for d in matchup_data.values())
    
    print(f"\n  Mean: {mean:.1%}")
    print(f"  Max overall deviation: {max_dev:.1%}")
    print(f"  Max matchup deviation from 50%: {max_matchup_dev:.1%}")
    
    grade = "EXCELLENT" if max_dev < 0.03 else "GOOD" if max_dev < 0.05 else "FAIR" if max_dev < 0.08 else "NEEDS_WORK"
    print(f"  Balance grade: {grade}")
    
    # Save
    output = {
        "starting_hp": STARTING_HP,
        "balance_grade": grade,
        "max_deviation": round(max_dev, 4),
        "max_matchup_deviation": round(max_matchup_dev, 4),
        "overall_win_rates": {sin: round(v, 4) for sin, v in overall.items()},
        "matchups": {k: {"wr1": round(v["wr1"], 4), "avg_rnd": round(v["avg_rnd"], 1)} for k, v in matchup_data.items()},
        "cards": cards,
    }
    
    with open("/home/ubuntu/7-sins-card-game/balance_final.json", "w") as f:
        json.dump(output, f, indent=2, default=str)
    
    print("\nResults saved to balance_final.json")
