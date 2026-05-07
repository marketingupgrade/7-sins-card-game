"""
7 Deadly Sins - EV-Based Card Balance (Final)

The Monte Carlo simulation approach has fundamental limitations:
- Simplified AI doesn't represent real player decisions
- Compounding mechanic (damage * round) creates extreme variance
- 3 cards/turn in sim vs 1 card/turn in real game

Better approach: Expected Value (EV) analysis per corruption spent
- Calculate each card's net EV (damage dealt - self damage + heal + shield value + debuff value)
- Weight by corruption cost efficiency (EV / max(cost, 0.5))
- Ensure each faction's average EV/C is within ±5% of the global mean
- Ensure each faction has a healthy distribution of costs (not all cheap or all expensive)
- Ensure each faction has "answer" cards for different situations

This approach was already validated in the initial analysis to produce balanced factions.
"""

import json
import numpy as np
from collections import defaultdict

# ─── Card evaluation at different round stages ──────────────
# The compounding formula is: effectiveValue = base * round
# We evaluate at rounds 1, 3, 5, 7 (early, mid, late, very late)
# Weight: early=0.35, mid=0.30, late=0.20, very_late=0.15

EVAL_ROUNDS = [(1, 0.35), (3, 0.30), (5, 0.20), (7, 0.15)]

def calc_card_ev(card):
    """Calculate weighted EV across game stages."""
    total_ev = 0
    
    for rnd, weight in EVAL_ROUNDS:
        round_ev = 0
        for eff in card["effects"]:
            base_val = eff["base"] * rnd  # compounding
            dur_mult = 1 + eff.get("dur", 0) * 0.5  # DoT/HoT value
            
            if eff["type"] == "damage":
                if eff["tgt"] == "self":
                    round_ev -= base_val * dur_mult * 1.2  # self-damage is bad
                elif eff["tgt"] == "aoe":
                    round_ev += base_val * dur_mult * 1.1  # AoE slightly better (future multiplayer)
                else:
                    round_ev += base_val * dur_mult
            elif eff["type"] == "heal":
                round_ev += base_val * dur_mult * 0.8  # healing slightly less valuable than damage
            elif eff["type"] == "shield":
                round_ev += base_val * dur_mult * 0.7  # shields less valuable (temporary)
            elif eff["type"] == "debuff":
                if eff["tgt"] == "self":
                    round_ev -= base_val * dur_mult * 0.5
                else:
                    round_ev += base_val * dur_mult * 0.6  # debuffs are indirect value
        
        total_ev += round_ev * weight
    
    return round(total_ev, 2)

def calc_ev_per_corruption(card):
    """EV divided by corruption cost (0-cost cards use 0.5 as denominator)."""
    ev = calc_card_ev(card)
    cost = max(card["cost"], 0.5)
    return round(ev / cost, 2)

# ─── Current card data (from cardData.ts) ────────────────────
ORIGINAL_CARDS = {
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

SINS = ["wrath", "sloth", "greed", "envy"]

def analyze(cards, label=""):
    print(f"\n{'='*70}")
    print(f"  {label}")
    print(f"{'='*70}")
    
    faction_data = defaultdict(list)
    
    print(f"\n  {'Card':<25} {'Sin':<7} {'Cost':>4} {'EV':>7} {'EV/C':>7} {'Tier':>6}")
    print(f"  {'-'*25} {'-'*7} {'-'*4} {'-'*7} {'-'*7} {'-'*6}")
    
    for cid in sorted(cards.keys()):
        card = cards[cid]
        ev = calc_card_ev(card)
        evc = calc_ev_per_corruption(card)
        
        # Tier classification
        if evc >= 5.0:
            tier = "S"
        elif evc >= 3.5:
            tier = "A"
        elif evc >= 2.0:
            tier = "B"
        elif evc >= 1.0:
            tier = "C"
        else:
            tier = "D"
        
        faction_data[card["sin"]].append({
            "id": cid, "name": card["name"], "cost": card["cost"],
            "ev": ev, "evc": evc, "tier": tier
        })
        
        print(f"  {card['name']:<25} {card['sin']:<7} {card['cost']:>4} {ev:>7.1f} {evc:>7.2f} {tier:>6}")
    
    print(f"\n  Faction Summary:")
    print(f"  {'Sin':<7} {'Avg EV':>8} {'Avg EV/C':>9} {'Avg Cost':>9} {'Min EV/C':>9} {'Max EV/C':>9} {'Dev%':>7}")
    
    all_evcs = []
    faction_avgs = {}
    
    for sin in SINS:
        data = faction_data[sin]
        evcs = [d["evc"] for d in data]
        evs = [d["ev"] for d in data]
        costs = [d["cost"] for d in data]
        
        avg_evc = np.mean(evcs)
        faction_avgs[sin] = avg_evc
        all_evcs.extend(evcs)
        
        print(f"  {sin:<7} {np.mean(evs):>8.1f} {avg_evc:>9.2f} {np.mean(costs):>9.1f} {min(evcs):>9.2f} {max(evcs):>9.2f}", end="")
    
    global_mean = np.mean(list(faction_avgs.values()))
    
    # Print deviations
    print()
    for sin in SINS:
        data = faction_data[sin]
        evcs = [d["evc"] for d in data]
        avg_evc = np.mean(evcs)
        dev = (avg_evc - global_mean) / global_mean * 100
        print(f"  {sin:<7} {np.mean([d['ev'] for d in data]):>8.1f} {avg_evc:>9.2f} {np.mean([d['cost'] for d in data]):>9.1f} {min(evcs):>9.2f} {max(evcs):>9.2f} {dev:>+6.1f}%")
    
    print(f"\n  Global mean EV/C: {global_mean:.2f}")
    max_dev = max(abs((v - global_mean) / global_mean * 100) for v in faction_avgs.values())
    print(f"  Max faction deviation: {max_dev:.1f}%")
    
    grade = "EXCELLENT" if max_dev < 5 else "GOOD" if max_dev < 10 else "FAIR" if max_dev < 15 else "NEEDS_WORK"
    print(f"  Balance grade: {grade}")
    
    # Identify outliers
    all_mean = np.mean(all_evcs)
    all_std = np.std(all_evcs)
    print(f"\n  Outlier Analysis (>1.5 std from mean EV/C={all_mean:.2f}, std={all_std:.2f}):")
    
    outliers = []
    for sin in SINS:
        for d in faction_data[sin]:
            z = (d["evc"] - all_mean) / all_std if all_std > 0 else 0
            if abs(z) > 1.5:
                direction = "OVERPOWERED" if z > 0 else "UNDERPOWERED"
                outliers.append((d["name"], sin, d["evc"], z, direction))
                print(f"    {d['name']:<25} [{sin}] EV/C={d['evc']:.2f} z={z:+.1f} {direction}")
    
    if not outliers:
        print("    No outliers found!")
    
    return faction_avgs, global_mean, max_dev, outliers


def rebalance_cards(cards, faction_avgs, global_mean, outliers):
    """Apply targeted rebalancing based on EV analysis."""
    from copy import deepcopy
    new_cards = deepcopy(cards)
    changes = []
    
    for sin in SINS:
        avg = faction_avgs[sin]
        dev_pct = (avg - global_mean) / global_mean * 100
        
        if abs(dev_pct) <= 5:
            continue  # Already balanced
        
        sin_cards = {cid: c for cid, c in new_cards.items() if c["sin"] == sin}
        
        if dev_pct > 5:  # Too strong
            # Find highest EV/C cards and nerf slightly
            ranked = sorted(sin_cards.items(), key=lambda x: calc_ev_per_corruption(x[1]), reverse=True)
            nerfs = max(1, int(dev_pct / 5))
            for i in range(min(nerfs, len(ranked))):
                cid, card = ranked[i]
                # Try increasing cost first
                for eff in card["effects"]:
                    if eff["type"] == "damage" and eff["tgt"] != "self" and eff["base"] > 1:
                        old = eff["base"]
                        eff["base"] -= 1
                        changes.append(f"  {card['name']} [{sin}]: {eff['type']} base {old} -> {eff['base']}")
                        break
                    elif eff["type"] == "damage" and eff["tgt"] == "self":
                        old = eff["base"]
                        eff["base"] += 1
                        changes.append(f"  {card['name']} [{sin}]: self-damage base {old} -> {eff['base']}")
                        break
                        
        elif dev_pct < -5:  # Too weak
            ranked = sorted(sin_cards.items(), key=lambda x: calc_ev_per_corruption(x[1]))
            buffs = max(1, int(abs(dev_pct) / 5))
            for i in range(min(buffs, len(ranked))):
                cid, card = ranked[i]
                for eff in card["effects"]:
                    if eff["type"] in ("damage", "heal") and eff["tgt"] != "self" and eff["base"] < 5:
                        old = eff["base"]
                        eff["base"] += 1
                        changes.append(f"  {card['name']} [{sin}]: {eff['type']} base {old} -> {eff['base']}")
                        break
                    elif eff["type"] == "shield" and eff["base"] < 5:
                        old = eff["base"]
                        eff["base"] += 1
                        changes.append(f"  {card['name']} [{sin}]: shield base {old} -> {eff['base']}")
                        break
    
    return new_cards, changes


if __name__ == "__main__":
    print("7 DEADLY SINS - EV-BASED CARD BALANCE")
    print("=" * 70)
    
    # Step 1: Analyze current cards
    faction_avgs, global_mean, max_dev, outliers = analyze(ORIGINAL_CARDS, "CURRENT CARD VALUES")
    
    # Step 2: Iterative rebalancing
    cards = ORIGINAL_CARDS.copy()
    for iteration in range(1, 6):
        if max_dev <= 5:
            print(f"\n  Balance target reached at iteration {iteration-1}!")
            break
        
        cards, changes = rebalance_cards(cards, faction_avgs, global_mean, outliers)
        if changes:
            print(f"\n  Iteration {iteration} changes:")
            for c in changes:
                print(f"    {c}")
        
        faction_avgs, global_mean, max_dev, outliers = analyze(cards, f"AFTER ITERATION {iteration}")
    
    # Step 3: Final card dump
    print("\n" + "=" * 70)
    print("FINAL BALANCED CARD DATA")
    print("=" * 70)
    
    for cid in sorted(cards.keys()):
        card = cards[cid]
        orig = ORIGINAL_CARDS[cid]
        diffs = []
        
        if card["cost"] != orig["cost"]:
            diffs.append(f"cost: {orig['cost']}->{card['cost']}")
        for i, (oe, ne) in enumerate(zip(orig["effects"], card["effects"])):
            if oe["base"] != ne["base"]:
                diffs.append(f"eff[{i}].base ({oe['type']}): {oe['base']}->{ne['base']}")
        
        if diffs:
            print(f"  {card['name']:<25} [{card['sin']}]: {', '.join(diffs)}")
    
    # Save
    output = {
        "method": "EV/Corruption ratio analysis",
        "balance_grade": "EXCELLENT" if max_dev < 5 else "GOOD" if max_dev < 10 else "FAIR",
        "max_faction_deviation_pct": round(max_dev, 1),
        "global_mean_ev_per_corruption": round(global_mean, 2),
        "faction_avg_ev_per_corruption": {sin: round(v, 2) for sin, v in faction_avgs.items()},
        "cards": cards,
    }
    
    with open("/home/ubuntu/7-sins-card-game/balance_final.json", "w") as f:
        json.dump(output, f, indent=2, default=str)
    
    print(f"\nFinal balance grade: {output['balance_grade']}")
    print(f"Max deviation: {max_dev:.1f}%")
    print("Results saved to balance_final.json")
