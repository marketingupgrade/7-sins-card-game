"""
7 Deadly Sins - Smart Card Rebalancer v3

Key insight from v2: greedy per-faction adjustments oscillate because the
matchup matrix is non-transitive (rock-paper-scissors dynamics).

New approach:
1. Use the SAME proper turn-based simulation from v2
2. But instead of greedy adjustments, use a GLOBAL optimization:
   - Define a loss function = sum of squared deviations from 50% per matchup
   - Use coordinate descent: try small changes to each card, keep if loss improves
3. Preserve faction identity by constraining which stats can change
4. Target: max deviation < 5% (EXCELLENT balance)

Additional improvements:
- Wrath vs Envy is the most extreme matchup (77% vs 23%) - focus there
- The simulation shows games are too short (2.8 rounds avg) - 
  this favors burst damage. We need to slow the game slightly.
- Consider adjusting STARTING_HP as a global lever
"""

import random
import math
import json
import numpy as np
from collections import defaultdict
from itertools import combinations
from copy import deepcopy

# ─── Constants ───────────────────────────────────────────────
STARTING_HP = 30  # Increased from 25 to slow games down and let all factions develop
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


# ─── Card Data ───────────────────────────────────────────────
def make_cards():
    return {
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


# ─── Simulation Engine (same as v2 but with configurable HP) ─

class Player:
    def __init__(self, sin, cards, start_hp):
        self.sin = sin
        self.hp = start_hp
        self.max_hp = start_hp
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
    def __init__(self, sin1, sin2, cards, start_hp=STARTING_HP):
        self.cards = cards
        self.p1 = Player(sin1, cards, start_hp)
        self.p2 = Player(sin2, cards, start_hp)
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


def evaluate(cards, n=3000, start_hp=STARTING_HP):
    """Return matchup win rates and loss (sum of squared deviations from 50%)."""
    matchups = list(combinations(SINS, 2))
    results = {}
    
    for sin1, sin2 in matchups:
        w1 = 0
        for _ in range(n):
            g = Game(sin1, sin2, cards, start_hp)
            result = g.simulate()
            if result == sin1:
                w1 += 1
        wr1 = w1 / n
        results[f"{sin1}_vs_{sin2}"] = wr1
    
    # Loss = sum of (wr - 0.5)^2 for all matchups
    loss = sum((wr - 0.5) ** 2 for wr in results.values())
    
    # Also compute overall win rates
    wins = defaultdict(float)
    games = defaultdict(float)
    for key, wr1 in results.items():
        s1, s2 = key.split("_vs_")
        wins[s1] += wr1
        wins[s2] += (1 - wr1)
        games[s1] += 1
        games[s2] += 1
    overall = {sin: wins[sin] / games[sin] for sin in SINS}
    
    return loss, results, overall


def print_state(loss, results, overall, label=""):
    print(f"\n  [{label}] Loss={loss:.4f}")
    for sin in sorted(overall, key=overall.get, reverse=True):
        print(f"    {sin.upper():<7}: {overall[sin]:>6.1%}")
    max_dev = max(abs(v - 0.5) for v in overall.values())
    print(f"    Max dev: {max_dev:.1%}")
    for key in sorted(results):
        s1, s2 = key.split("_vs_")
        print(f"    {key:<20}: {results[key]:>6.1%} vs {1-results[key]:>6.1%}")
    return max_dev


# ═══════════════════════════════════════════════════════════════
# COORDINATE DESCENT OPTIMIZER
# ═══════════════════════════════════════════════════════════════

def optimize(cards, start_hp=STARTING_HP, max_iters=60):
    """
    Coordinate descent: for each card, try small changes to base values and cost.
    Keep the change if it reduces the loss function.
    """
    best_cards = deepcopy(cards)
    best_loss, best_results, best_overall = evaluate(best_cards, n=2000, start_hp=start_hp)
    print_state(best_loss, best_results, best_overall, "INITIAL")
    
    no_improve_count = 0
    
    for iteration in range(max_iters):
        improved = False
        card_ids = list(cards.keys())
        random.shuffle(card_ids)
        
        for cid in card_ids:
            card = best_cards[cid]
            
            # Try each possible mutation
            mutations = []
            
            # Mutation 1: change cost ±1
            if card["cost"] > 0:
                mutations.append(("cost", -1))
            if card["cost"] < 5:
                mutations.append(("cost", +1))
            
            # Mutation 2: change each effect's base value ±1
            for i, eff in enumerate(card["effects"]):
                if eff["base"] > 1:
                    mutations.append(("base", i, -1))
                if eff["base"] < 6:
                    mutations.append(("base", i, +1))
            
            for mut in mutations:
                trial = deepcopy(best_cards)
                
                if mut[0] == "cost":
                    trial[cid]["cost"] += mut[1]
                elif mut[0] == "base":
                    trial[cid]["effects"][mut[1]]["base"] += mut[2]
                
                trial_loss, trial_results, trial_overall = evaluate(trial, n=1500, start_hp=start_hp)
                
                if trial_loss < best_loss - 0.001:  # Improvement threshold
                    best_cards = trial
                    best_loss = trial_loss
                    best_results = trial_results
                    best_overall = trial_overall
                    improved = True
                    
                    change_desc = ""
                    if mut[0] == "cost":
                        change_desc = f"cost {card['cost']} -> {trial[cid]['cost']}"
                    else:
                        change_desc = f"effect[{mut[1]}].base -> {trial[cid]['effects'][mut[1]]['base']}"
                    print(f"  iter {iteration}: {cid} {change_desc} | loss={best_loss:.4f}")
        
        if not improved:
            no_improve_count += 1
            if no_improve_count >= 3:
                print(f"\n  Converged after {iteration+1} iterations (no improvement for 3 rounds)")
                break
        else:
            no_improve_count = 0
    
    return best_cards, best_loss, best_results, best_overall


# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("=" * 60)
    print("7 DEADLY SINS - SMART CARD REBALANCER v3")
    print("=" * 60)
    
    # Step 1: Test different starting HP values to find the sweet spot
    print("\n[Step 1] Testing Starting HP values...")
    cards = make_cards()
    
    for hp in [25, 30, 35]:
        loss, results, overall = evaluate(cards, n=2000, start_hp=hp)
        max_dev = max(abs(v - 0.5) for v in overall.values())
        avg_wr_range = max(overall.values()) - min(overall.values())
        print(f"  HP={hp}: loss={loss:.4f}, max_dev={max_dev:.1%}, range={avg_wr_range:.1%}")
        for sin in sorted(overall, key=overall.get, reverse=True):
            print(f"    {sin.upper()}: {overall[sin]:.1%}")
    
    # Step 2: Pick best HP and run optimizer
    # Use HP=30 as it gives more room for all strategies
    chosen_hp = 30
    print(f"\n[Step 2] Running optimizer with HP={chosen_hp}...")
    
    cards = make_cards()
    final_cards, final_loss, final_results, final_overall = optimize(
        cards, start_hp=chosen_hp, max_iters=30
    )
    
    # Step 3: Final validation with more games
    print("\n[Step 3] Final validation (5000 games/matchup)...")
    val_loss, val_results, val_overall = evaluate(final_cards, n=5000, start_hp=chosen_hp)
    max_dev = print_state(val_loss, val_results, val_overall, "FINAL VALIDATED")
    
    grade = "EXCELLENT" if max_dev < 0.03 else "GOOD" if max_dev < 0.05 else "FAIR" if max_dev < 0.08 else "NEEDS_WORK"
    print(f"\n  Balance grade: {grade}")
    
    # Step 4: Print all changes
    print("\n" + "=" * 60)
    print("CARD CHANGES SUMMARY")
    print("=" * 60)
    
    original = make_cards()
    changes = []
    
    for cid in sorted(final_cards.keys()):
        orig = original[cid]
        new = final_cards[cid]
        diffs = []
        
        if orig["cost"] != new["cost"]:
            diffs.append({"field": "cost", "old": orig["cost"], "new": new["cost"]})
        
        for i, (oe, ne) in enumerate(zip(orig["effects"], new["effects"])):
            if oe["base"] != ne["base"]:
                diffs.append({"field": f"effects[{i}].base ({oe['type']})", "old": oe["base"], "new": ne["base"]})
        
        if diffs:
            changes.append({"id": cid, "name": new["name"], "sin": new["sin"], "diffs": diffs})
            print(f"\n  {cid} ({new['name']}) [{new['sin'].upper()}]:")
            for d in diffs:
                print(f"    {d['field']}: {d['old']} -> {d['new']}")
    
    print(f"\n  Total cards changed: {len(changes)}")
    print(f"  Starting HP changed: 25 -> {chosen_hp}")
    
    # Save
    output = {
        "starting_hp": chosen_hp,
        "balance_grade": grade,
        "max_deviation": round(max_dev, 4),
        "final_loss": round(val_loss, 4),
        "final_win_rates": {sin: round(v, 4) for sin, v in val_overall.items()},
        "final_matchups": {k: round(v, 4) for k, v in val_results.items()},
        "changes": changes,
        "final_cards": final_cards,
    }
    
    with open("/home/ubuntu/7-sins-card-game/balance_final.json", "w") as f:
        json.dump(output, f, indent=2)
    
    print("\nResults saved to balance_final.json")
    print("=" * 60)
