"""
/math Compounding Mechanic Optimization
========================================
Tests multiple escalation formulas for 3-round compounding cards:
- Linear: base, base*2, base*3 (total = 6x base)
- Geometric: base, base*2, base*4 (total = 7x base)
- Fibonacci: base, base*1, base*2 (total = 4x base)
- Triangular: base, base*1.5, base*2.5 (total = 5x base)
- Mild geometric: base, base*1.5, base*2.25 (total = 4.75x base)

For each formula, we compute:
1. Total EV over 3 rounds for compounding cards
2. Required flat card power to match (single-round equivalent)
3. Balance ratio between flat and compounding strategies
4. Variance analysis (consistency vs high-roll)
5. Optimal HP to support 10-round games

Game constraints:
- 10 rounds max, 25 HP, 12 cards per deck, hand of 5
- Energy: start 2, +1/round, cap 7
- Cards cost 0-5 corruption
- Compounding: always 3 rounds, pay cost only round 1
- Flat: one-shot, no duration
"""

import math
import json

# Game constants
HP = 25
MAX_ROUNDS = 10
HAND_SIZE = 5
CARDS_PER_DECK = 12
START_ENERGY = 2
MAX_ENERGY = 7
ENERGY_PER_ROUND = 1

# Scaling models to test
SCALING_MODELS = {
    "linear": [1, 2, 3],           # total = 6x
    "geometric_2x": [1, 2, 4],     # total = 7x
    "mild_geometric": [1, 1.5, 2.25], # total = 4.75x
    "triangular": [1, 1.5, 2.5],   # total = 5x
    "fibonacci": [1, 1, 2],        # total = 4x
    "flat_escalation": [1, 1.5, 2], # total = 4.5x
    "aggressive": [1, 2, 3],       # same as linear
    "sqrt_scale": [1, 1.41, 1.73], # total = 4.14x
}

def energy_at_round(r):
    return min(START_ENERGY + (r - 1) * ENERGY_PER_ROUND, MAX_ENERGY)

def analyze_scaling(name, multipliers):
    """Analyze a scaling model for game balance."""
    total_multiplier = sum(multipliers)
    
    # For each corruption cost tier, compute compounding vs flat EV
    results = {}
    for cost in range(0, 6):
        # Compounding card: base value is lower, but ticks 3 times with escalation
        # Flat card: higher base value, one-shot
        # We want: flat_value ≈ compounding_total_value for same cost
        
        # What base values make sense for each cost?
        # Cost 0: very weak base (1)
        # Cost 1: base 1-2
        # Cost 2: base 2-3
        # Cost 3: base 2-4
        # Cost 4: base 3-5
        # Cost 5: base 4-6
        
        base_by_cost = {0: 1, 1: 1.5, 2: 2, 3: 2.5, 4: 3, 5: 4}
        base = base_by_cost[cost]
        
        compounding_total = sum(base * m for m in multipliers)
        compounding_total = round(compounding_total)
        
        # Flat equivalent: same cost, same total value but instant
        flat_equivalent = compounding_total
        
        # EV per corruption spent
        ev_per_c_compound = compounding_total / max(cost, 0.5)
        ev_per_c_flat = flat_equivalent / max(cost, 0.5)
        
        results[cost] = {
            "base": base,
            "compounding_per_round": [round(base * m) for m in multipliers],
            "compounding_total": compounding_total,
            "flat_equivalent": flat_equivalent,
            "ev_per_corruption": ev_per_c_compound,
        }
    
    return {
        "name": name,
        "multipliers": multipliers,
        "total_multiplier": total_multiplier,
        "cost_analysis": results,
    }

def compute_game_damage_potential(multipliers):
    """
    Simulate total damage potential over a 10-round game.
    Assume player plays 1 card per turn, alternating flat and compounding.
    """
    # Track active compounding effects
    active_effects = []  # (base, round_played, multipliers)
    total_damage = 0
    cards_played = 0
    
    for round_num in range(1, MAX_ROUNDS + 1):
        energy = energy_at_round(round_num)
        
        # Resolve active compounding effects
        for effect in active_effects[:]:
            base, played_at = effect
            tick = round_num - played_at  # 0-indexed tick
            if tick < len(multipliers):
                dmg = round(base * multipliers[tick])
                total_damage += dmg
            if tick >= len(multipliers) - 1:
                active_effects.remove(effect)
        
        # Play a new card (alternate between cost 2 compounding and cost 2 flat)
        if energy >= 2:
            if round_num % 2 == 1:
                # Compounding card: base 2, ticks for 3 rounds
                active_effects.append((2, round_num))
                # First tick happens immediately
                # (already counted in the loop above for next round)
                # Actually, the card is played THIS round, so tick 0 = this round
                dmg = round(2 * multipliers[0])
                total_damage += dmg
                cards_played += 1
            else:
                # Flat card: equivalent total value
                flat_total = sum(round(2 * m) for m in multipliers)
                total_damage += flat_total
                cards_played += 1
    
    return total_damage, cards_played

def compute_hp_sustainability(multipliers):
    """
    How many rounds can a game last given the damage output?
    Target: games should last 6-8 rounds on average.
    """
    # Assume 2 players, each dealing damage every round
    # Average card: cost 2, base 2, compounding
    cumulative_damage = 0
    
    for round_num in range(1, MAX_ROUNDS + 1):
        # Each round, previous compounding effects tick + new card played
        # Simplified: average damage per round increases as effects stack
        
        # Active effects from previous rounds
        for prev_round in range(max(1, round_num - 2), round_num):
            tick = round_num - prev_round
            if tick < len(multipliers):
                cumulative_damage += round(2 * multipliers[tick])
        
        # New card this round (base tick)
        cumulative_damage += round(2 * multipliers[0])
        
        if cumulative_damage >= HP:
            return round_num
    
    return MAX_ROUNDS

print("=" * 80)
print("COMPOUNDING MECHANIC OPTIMIZATION - /math ANALYSIS")
print("=" * 80)
print(f"\nGame Parameters: HP={HP}, Rounds={MAX_ROUNDS}, Energy={START_ENERGY}-{MAX_ENERGY}")
print(f"Cards: {CARDS_PER_DECK}/deck, Hand={HAND_SIZE}")
print(f"Compounding: Always 3 rounds, pay cost only round 1")
print()

best_model = None
best_score = float('inf')

for name, mults in SCALING_MODELS.items():
    analysis = analyze_scaling(name, mults)
    total_dmg, cards = compute_game_damage_potential(mults)
    rounds_to_kill = compute_hp_sustainability(mults)
    
    # Score: how close to 7-round average game length (sweet spot)
    target_rounds = 7
    score = abs(rounds_to_kill - target_rounds)
    
    # Penalty for too-short or too-long games
    if rounds_to_kill < 5:
        score += 10  # way too fast
    if rounds_to_kill > 9:
        score += 5   # too slow
    
    print(f"\n{'─' * 60}")
    print(f"MODEL: {name}")
    print(f"  Multipliers: {mults} (total = {analysis['total_multiplier']:.2f}x)")
    print(f"  Rounds to kill (HP={HP}): {rounds_to_kill}")
    print(f"  Total damage potential (10 rounds): {total_dmg}")
    print(f"  Cards played: {cards}")
    print(f"  Balance score: {score:.1f} (lower = better)")
    print(f"  Cost breakdown:")
    for cost, data in analysis['cost_analysis'].items():
        print(f"    Cost {cost}: base={data['base']}, compound={data['compounding_per_round']} (total={data['compounding_total']}), flat_equiv={data['flat_equivalent']}")
    
    if score < best_score:
        best_score = score
        best_model = (name, mults, analysis, rounds_to_kill)

print(f"\n{'=' * 80}")
print(f"OPTIMAL MODEL: {best_model[0]}")
print(f"  Multipliers: {best_model[1]}")
print(f"  Total multiplier: {sum(best_model[1]):.2f}x")
print(f"  Expected game length: {best_model[3]} rounds")
print(f"  Balance score: {best_score:.1f}")

# Now compute the full card balance framework
print(f"\n{'=' * 80}")
print("CARD BALANCE FRAMEWORK")
print("=" * 80)

optimal_mults = best_model[1]
total_mult = sum(optimal_mults)

print(f"\nFormula: Round 1 = base×{optimal_mults[0]}, Round 2 = base×{optimal_mults[1]}, Round 3 = base×{optimal_mults[2]}")
print(f"Total value over 3 rounds = base × {total_mult:.2f}")
print()

# Card design framework
print("FLAT vs COMPOUNDING card values by corruption cost:")
print(f"{'Cost':>4} | {'Flat Value':>10} | {'Compound Base':>13} | {'Compound Ticks':>30} | {'Compound Total':>14} | {'Balance':>8}")
print("-" * 95)

card_framework = {}
for cost in range(0, 6):
    # Flat cards get the full value instantly
    # Compounding cards get lower base but escalate
    # Balance: flat_total ≈ compound_total for same cost
    
    # Value scaling by cost (corruption efficiency)
    # Higher cost = more total value, but diminishing returns
    flat_values = {0: 2, 1: 4, 2: 6, 3: 9, 4: 12, 5: 16}
    flat_val = flat_values[cost]
    
    # Compounding base: flat_val / total_multiplier
    compound_base = flat_val / total_mult
    compound_base_rounded = max(1, round(compound_base))
    
    # Actual compound ticks
    ticks = [round(compound_base_rounded * m) for m in optimal_mults]
    compound_total = sum(ticks)
    
    balance_ratio = compound_total / flat_val if flat_val > 0 else 0
    
    card_framework[cost] = {
        "flat_value": flat_val,
        "compound_base": compound_base_rounded,
        "compound_ticks": ticks,
        "compound_total": compound_total,
        "balance_ratio": balance_ratio,
    }
    
    print(f"{cost:>4} | {flat_val:>10} | {compound_base_rounded:>13} | {str(ticks):>30} | {compound_total:>14} | {balance_ratio:>7.2f}x")

print()
print("Target balance ratio: 0.8-1.2x (compound vs flat)")
print()

# HP analysis
print("HP SUSTAINABILITY ANALYSIS:")
print(f"{'HP':>4} | {'Avg Game Length':>15} | {'Assessment':>20}")
print("-" * 50)
for hp_test in [20, 25, 30, 35, 40]:
    # Rough estimate: average damage per round with compounding
    avg_dmg_per_round = card_framework[2]["compound_total"] / 3 * 1.5  # accounting for stacking
    rounds = math.ceil(hp_test / avg_dmg_per_round)
    rounds = min(rounds, MAX_ROUNDS)
    assessment = "Too short" if rounds < 5 else "Too long" if rounds > 9 else "GOOD" if 6 <= rounds <= 8 else "OK"
    print(f"{hp_test:>4} | {rounds:>15} | {assessment:>20}")

# Save the optimal model for use in card design
output = {
    "optimal_model": best_model[0],
    "multipliers": list(best_model[1]),
    "total_multiplier": sum(best_model[1]),
    "card_framework": {str(k): v for k, v in card_framework.items()},
    "recommended_hp": HP,
}

with open("balance_optimal_model.json", "w") as f:
    json.dump(output, f, indent=2)

print(f"\nOptimal model saved to balance_optimal_model.json")
