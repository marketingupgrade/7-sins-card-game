#!/usr/bin/env python3
"""
Extended defensive evaluation — finer granularity from 1.0x to 3.0x
to find the true inflection point where quality plateaus or drops.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
from defensive_model import (
    parse_cards, run_scenario, compute_quality_score, SINS
)
import json

def main():
    card_file = os.path.join(os.path.dirname(__file__), "..", "shared", "cardData.ts")
    cards = parse_cards(card_file)
    print(f"Parsed {len(cards)} cards")

    # Extended range with finer steps
    scenarios = [1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00]
    games_per_matchup = 1500

    print(f"Running {len(scenarios)} scenarios × 28 matchups × {games_per_matchup} games")

    results = []
    for mult in scenarios:
        print(f"\nRunning ×{mult:.2f}...", end=" ", flush=True)
        result = run_scenario(cards, mult, games_per_matchup)
        quality = compute_quality_score(result)
        results.append({
            "defense_mult": mult,
            "quality_score": quality,
            "avg_game_length": round(result.avg_game_length, 2),
            "std_game_length": round(result.std_game_length, 2),
            "comeback_rate": round(result.comeback_rate, 4),
            "blowout_rate": round(result.blowout_rate, 4),
            "timeout_rate": round(result.timeout_rate, 4),
            "avg_hp_volatility": round(result.avg_hp_volatility, 2),
            "defensive_interaction_rate": round(result.defensive_interaction_rate, 4),
            "faction_balance_deviation": round(result.faction_balance_deviation, 4),
            "strategic_diversity": round(result.strategic_diversity, 4),
            "win_rates": {k: round(v, 4) for k, v in result.win_rates.items()},
            "matchup_matrix": {
                k: {k2: round(v2, 4) for k2, v2 in v.items()}
                for k, v in result.matchup_matrix.items()
            },
            "total_games": result.total_games,
        })
        print(f"Q={quality:.1f} | GL={result.avg_game_length:.1f} | TO={result.timeout_rate:.1%} | Dev={result.faction_balance_deviation:.3f}")

    # Save
    output_path = os.path.join(os.path.dirname(__file__), "defensive_extended_results.json")
    with open(output_path, "w") as f:
        json.dump({"scenarios": results}, f, indent=2)
    print(f"\nSaved to {output_path}")

    # Summary
    print("\n" + "=" * 60)
    print("EXTENDED QUALITY SCORES")
    print("=" * 60)
    best_q = 0
    best_m = 1.0
    for r in results:
        q = r["quality_score"]
        bar = "█" * int(q / 2) + "░" * (50 - int(q / 2))
        print(f"  ×{r['defense_mult']:.2f}  {bar}  {q:.1f}/100")
        if q > best_q:
            best_q = q
            best_m = r["defense_mult"]

    print(f"\n  ★ OPTIMAL: ×{best_m:.2f} (score: {best_q:.1f}/100)")

    # Check for plateau/decline
    scores = [r["quality_score"] for r in results]
    if len(scores) >= 3:
        diffs = [scores[i+1] - scores[i] for i in range(len(scores)-1)]
        print(f"\n  Score deltas: {[f'+{d:.1f}' if d >= 0 else f'{d:.1f}' for d in diffs]}")
        # Find diminishing returns point
        for i, d in enumerate(diffs):
            if d < 0.5 and i > 0:
                print(f"  ⚠ Diminishing returns after ×{results[i]['defense_mult']:.2f}")
                break

if __name__ == "__main__":
    main()
