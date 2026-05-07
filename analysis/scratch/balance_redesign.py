"""
Card Redesign: Flat vs Compounding System
==========================================
Using Fibonacci [1, 1, 2] escalation for compounding cards.
All cards are either FLAT (instant, one-time) or COMPOUNDING (3-round escalating).

Flat cards: Powerful one-shot effects. Total value = face value.
Compounding cards: Weaker base but tick for 3 rounds. Total = base * (1+1+2) = 4*base.

Balance target: Flat and compounding cards at same cost should deliver similar total value.
"""

import json

# ─── Constants ───────────────────────────────────────────
FIBONACCI_MULTIPLIERS = [1, 1, 2]  # Round 1, 2, 3
COMPOUND_TOTAL_MULT = sum(FIBONACCI_MULTIPLIERS)  # = 4
COMPOUND_DURATION = 3  # Always 3 rounds

# Value table by cost (from master strategy doc)
# Flat value = total instant value
# Compound base = per-tick base (total = base * 4)
VALUE_TABLE = {
    0: {"flat_total": 2, "compound_base": 1},   # 0-cost: flat=2, compound=1*4=4 (risky/conditional)
    1: {"flat_total": 4, "compound_base": 1},   # 1-cost: flat=4, compound=1*4=4
    2: {"flat_total": 6, "compound_base": 2},   # 2-cost: flat=6, compound=2*4=8
    3: {"flat_total": 9, "compound_base": 2},   # 3-cost: flat=9, compound=2*4=8 (flat slightly better)
    4: {"flat_total": 12, "compound_base": 3},  # 4-cost: flat=12, compound=3*4=12
    5: {"flat_total": 16, "compound_base": 4},  # 5-cost: flat=16, compound=4*4=16
}

# ─── Card Redesign ───────────────────────────────────────

def design_faction(sin, cards_data):
    """Design a faction's cards with flat/compounding split."""
    results = []
    total_ev = 0
    total_cost = 0
    
    for card in cards_data:
        card_type = card.get("card_type", "flat")
        cost = card["cost"]
        
        if card_type == "compounding":
            base = card["compound_base"]
            ticks = [base * m for m in FIBONACCI_MULTIPLIERS]
            total_value = sum(ticks)
            ev_per_cost = total_value / max(cost, 0.5)
        else:
            total_value = sum(e["value"] for e in card["effects"])
            ev_per_cost = total_value / max(cost, 0.5)
        
        total_ev += total_value
        total_cost += cost
        
        results.append({
            "id": card["id"],
            "name": card["name"],
            "type": card_type,
            "cost": cost,
            "total_value": total_value,
            "ev_per_cost": round(ev_per_cost, 2),
            "effects_summary": card.get("summary", ""),
        })
    
    avg_ev = total_ev / len(cards_data)
    avg_cost = total_cost / len(cards_data)
    
    return results, avg_ev, avg_cost, total_ev / max(total_cost, 1)

# ─── WRATH: Aggressive burst + compounding DoTs ─────────
wrath_cards = [
    # FLAT cards (powerful one-shots)
    {"id": "wrath_01", "name": "Fury Strike", "card_type": "flat", "cost": 1,
     "effects": [{"type": "damage", "value": 3, "target": "single_enemy"}],
     "summary": "3 flat dmg to enemy"},
    
    {"id": "wrath_02", "name": "Blind Rage", "card_type": "flat", "cost": 1,
     "effects": [{"type": "damage", "value": 4, "target": "single_enemy"}, {"type": "damage", "value": 1, "target": "self"}],
     "summary": "4 flat dmg to enemy, 1 self-dmg"},
    
    {"id": "wrath_03", "name": "Vendetta", "card_type": "flat", "cost": 2,
     "effects": [{"type": "damage", "value": 5, "target": "single_enemy"}, {"type": "damage", "value": 2, "target": "self"}],
     "summary": "5 flat dmg to enemy, 2 self-dmg"},
    
    {"id": "wrath_04", "name": "Berserker's Howl", "card_type": "flat", "cost": 3,
     "effects": [{"type": "damage", "value": 3, "target": "all_enemies"}],
     "summary": "3 flat dmg to ALL enemies"},
    
    {"id": "wrath_05", "name": "Corruption Surge", "card_type": "flat", "cost": 0,
     "effects": [{"type": "damage", "value": 3, "target": "single_enemy"}, {"type": "damage", "value": 2, "target": "self"}],
     "summary": "3 flat dmg, 2 self-dmg (free but risky)"},
    
    {"id": "wrath_06", "name": "Apocalypse Fist", "card_type": "flat", "cost": 5,
     "effects": [{"type": "damage", "value": 6, "target": "all_enemies"}, {"type": "damage", "value": 3, "target": "self"}],
     "summary": "6 flat dmg to ALL, 3 self-dmg (ultimate)"},
    
    # COMPOUNDING cards (DoTs that escalate)
    {"id": "wrath_07", "name": "Blood Boil", "card_type": "compounding", "cost": 2,
     "compound_base": 2, "compound_type": "damage", "compound_target": "single_enemy",
     "summary": "2→2→4 dmg over 3 rounds (8 total)"},
    
    {"id": "wrath_08", "name": "Burning Hatred", "card_type": "compounding", "cost": 3,
     "compound_base": 3, "compound_type": "damage", "compound_target": "single_enemy",
     "summary": "3→3→6 dmg over 3 rounds (12 total)"},
    
    {"id": "wrath_09", "name": "Crimson Fever", "card_type": "compounding", "cost": 1,
     "compound_base": 1, "compound_type": "damage", "compound_target": "single_enemy",
     "summary": "1→1→2 dmg over 3 rounds (4 total)"},
    
    {"id": "wrath_10", "name": "Rage Shield", "card_type": "compounding", "cost": 2,
     "compound_base": 2, "compound_type": "shield", "compound_target": "self",
     "summary": "2→2→4 shield over 3 rounds (8 total)"},
    
    # CATCH-UP cards
    {"id": "wrath_11", "name": "Desperate Fury", "card_type": "flat", "cost": 2,
     "effects": [{"type": "damage", "value": 3, "target": "single_enemy"}, {"type": "damage", "value": 1, "target": "self"}],
     "summary": "3 flat dmg, 1 self-dmg + bonus 2 dmg when behind",
     "catchup": True},
    
    {"id": "wrath_12", "name": "Last Stand", "card_type": "flat", "cost": 1,
     "effects": [{"type": "damage", "value": 2, "target": "single_enemy"}],
     "summary": "2 flat dmg + bonus 2 heal when low HP",
     "catchup": True},
]

# ─── SLOTH: Defensive stall + compounding heals/shields ──
sloth_cards = [
    # FLAT cards
    {"id": "sloth_01", "name": "Lazy Drain", "card_type": "flat", "cost": 2,
     "effects": [{"type": "damage", "value": 2, "target": "single_enemy"}, {"type": "heal", "value": 2, "target": "self"}],
     "summary": "2 flat dmg + 2 flat heal"},
    
    {"id": "sloth_02", "name": "Passive Resistance", "card_type": "flat", "cost": 1,
     "effects": [{"type": "shield", "value": 2, "target": "self"}, {"type": "damage", "value": 1, "target": "single_enemy"}],
     "summary": "2 flat shield + 1 flat dmg"},
    
    {"id": "sloth_03", "name": "Deep Slumber", "card_type": "flat", "cost": 0,
     "effects": [{"type": "heal", "value": 3, "target": "self"}, {"type": "debuff", "value": 1, "target": "self"}],
     "summary": "3 flat heal, 1 self-debuff (free but risky)"},
    
    {"id": "sloth_04", "name": "Eternal Rest", "card_type": "flat", "cost": 4,
     "effects": [{"type": "heal", "value": 6, "target": "self"}, {"type": "shield", "value": 4, "target": "self"}],
     "summary": "6 flat heal + 4 flat shield (ultimate defense)"},
    
    {"id": "sloth_05", "name": "Entropy Wave", "card_type": "flat", "cost": 3,
     "effects": [{"type": "damage", "value": 2, "target": "all_enemies"}, {"type": "debuff", "value": 1, "target": "all_enemies"}],
     "summary": "2 flat dmg + 1 debuff to ALL enemies"},
    
    # COMPOUNDING cards
    {"id": "sloth_06", "name": "Hibernate", "card_type": "compounding", "cost": 2,
     "compound_base": 2, "compound_type": "heal", "compound_target": "self",
     "summary": "2→2→4 heal over 3 rounds (8 total)"},
    
    {"id": "sloth_07", "name": "Pillow Fort", "card_type": "compounding", "cost": 2,
     "compound_base": 2, "compound_type": "shield", "compound_target": "self",
     "summary": "2→2→4 shield over 3 rounds (8 total)"},
    
    {"id": "sloth_08", "name": "Drowsy Touch", "card_type": "compounding", "cost": 1,
     "compound_base": 1, "compound_type": "debuff", "compound_target": "single_enemy",
     "summary": "1→1→2 debuff over 3 rounds (4 total)"},
    
    {"id": "sloth_09", "name": "Lethargy Aura", "card_type": "compounding", "cost": 3,
     "compound_base": 2, "compound_type": "debuff", "compound_target": "single_enemy",
     "summary": "2→2→4 debuff over 3 rounds (8 total)"},
    
    {"id": "sloth_10", "name": "Procrastination", "card_type": "compounding", "cost": 1,
     "compound_base": 1, "compound_type": "shield", "compound_target": "self",
     "summary": "1→1→2 shield over 3 rounds (4 total)"},
    
    # CATCH-UP cards
    {"id": "sloth_11", "name": "Survival Instinct", "card_type": "flat", "cost": 1,
     "effects": [{"type": "shield", "value": 2, "target": "self"}],
     "summary": "2 flat shield + bonus 2 heal when behind",
     "catchup": True},
    
    {"id": "sloth_12", "name": "Feign Death", "card_type": "flat", "cost": 2,
     "effects": [{"type": "shield", "value": 3, "target": "self"}],
     "summary": "3 flat shield + bonus debuff all when low HP",
     "catchup": True},
]

# ─── GREED: Steal/drain + compounding drains ─────────────
greed_cards = [
    # FLAT cards
    {"id": "greed_01", "name": "Pocket Pick", "card_type": "flat", "cost": 1,
     "effects": [{"type": "damage", "value": 2, "target": "single_enemy"}, {"type": "heal", "value": 1, "target": "self"}],
     "summary": "2 flat dmg + 1 flat heal (steal)"},
    
    {"id": "greed_02", "name": "Tax Collector", "card_type": "flat", "cost": 1,
     "effects": [{"type": "damage", "value": 2, "target": "single_enemy"}, {"type": "heal", "value": 1, "target": "self"}],
     "summary": "2 flat dmg + 1 flat heal"},
    
    {"id": "greed_03", "name": "Hostile Takeover", "card_type": "flat", "cost": 3,
     "effects": [{"type": "damage", "value": 4, "target": "single_enemy"}, {"type": "heal", "value": 3, "target": "self"}],
     "summary": "4 flat dmg + 3 flat heal (big steal)"},
    
    {"id": "greed_04", "name": "Insider Trading", "card_type": "flat", "cost": 0,
     "effects": [{"type": "damage", "value": 2, "target": "single_enemy"}, {"type": "damage", "value": 1, "target": "self"}],
     "summary": "2 flat dmg, 1 self-dmg (free but risky)"},
    
    {"id": "greed_05", "name": "Midas Touch", "card_type": "flat", "cost": 5,
     "effects": [{"type": "damage", "value": 4, "target": "all_enemies"}, {"type": "heal", "value": 4, "target": "self"}],
     "summary": "4 flat dmg to ALL + 4 flat heal (ultimate)"},
    
    {"id": "greed_06", "name": "Market Crash", "card_type": "flat", "cost": 3,
     "effects": [{"type": "damage", "value": 3, "target": "all_enemies"}],
     "summary": "3 flat dmg to ALL enemies"},
    
    # COMPOUNDING cards
    {"id": "greed_07", "name": "Compound Interest", "card_type": "compounding", "cost": 2,
     "compound_base": 2, "compound_type": "damage", "compound_target": "single_enemy",
     "summary": "2→2→4 dmg over 3 rounds (8 total drain)"},
    
    {"id": "greed_08", "name": "Loan Shark", "card_type": "compounding", "cost": 3,
     "compound_base": 2, "compound_type": "damage", "compound_target": "single_enemy",
     "summary": "2→2→4 dmg over 3 rounds (8 total) + 1 self-dmg on play",
     "extra_instant": {"type": "damage", "value": 1, "target": "self"}},
    
    {"id": "greed_09", "name": "Golden Shield", "card_type": "compounding", "cost": 2,
     "compound_base": 1, "compound_type": "shield", "compound_target": "self",
     "summary": "1→1→2 shield over 3 rounds (4 total)"},
    
    {"id": "greed_10", "name": "Embezzle", "card_type": "compounding", "cost": 1,
     "compound_base": 1, "compound_type": "heal", "compound_target": "self",
     "summary": "1→1→2 heal over 3 rounds (4 total steal)"},
    
    # CATCH-UP cards
    {"id": "greed_11", "name": "Desperate Gambit", "card_type": "flat", "cost": 1,
     "effects": [{"type": "damage", "value": 2, "target": "single_enemy"}, {"type": "heal", "value": 1, "target": "self"}],
     "summary": "2 flat dmg + 1 heal + bonus 2 heal when behind",
     "catchup": True},
    
    {"id": "greed_12", "name": "Bankruptcy Protection", "card_type": "flat", "cost": 2,
     "effects": [{"type": "shield", "value": 2, "target": "self"}, {"type": "heal", "value": 1, "target": "self"}],
     "summary": "2 flat shield + 1 heal + bonus 3 heal when low HP",
     "catchup": True},
]

# ─── ENVY: Reactive debuffs + compounding debuffs ────────
envy_cards = [
    # FLAT cards
    {"id": "envy_01", "name": "Jealous Glare", "card_type": "flat", "cost": 1,
     "effects": [{"type": "damage", "value": 2, "target": "single_enemy"}, {"type": "debuff", "value": 1, "target": "single_enemy"}],
     "summary": "2 flat dmg + 1 flat debuff"},
    
    {"id": "envy_02", "name": "Bitter Reflection", "card_type": "flat", "cost": 2,
     "effects": [{"type": "damage", "value": 2, "target": "single_enemy"}, {"type": "shield", "value": 2, "target": "self"}],
     "summary": "2 flat dmg + 2 flat shield (mirror)"},
    
    {"id": "envy_03", "name": "Covetous Strike", "card_type": "flat", "cost": 1,
     "effects": [{"type": "damage", "value": 3, "target": "single_enemy"}],
     "summary": "3 flat dmg"},
    
    {"id": "envy_04", "name": "Schadenfreude", "card_type": "flat", "cost": 2,
     "effects": [{"type": "damage", "value": 2, "target": "all_enemies"}, {"type": "heal", "value": 1, "target": "self"}],
     "summary": "2 flat dmg to ALL + 1 flat heal"},
    
    {"id": "envy_05", "name": "Stolen Glory", "card_type": "flat", "cost": 0,
     "effects": [{"type": "heal", "value": 2, "target": "self"}, {"type": "damage", "value": 1, "target": "self"}],
     "summary": "2 flat heal, 1 self-dmg (free)"},
    
    {"id": "envy_06", "name": "Doppelganger", "card_type": "flat", "cost": 4,
     "effects": [{"type": "damage", "value": 4, "target": "single_enemy"}, {"type": "shield", "value": 3, "target": "self"}, {"type": "heal", "value": 2, "target": "self"}],
     "summary": "4 flat dmg + 3 shield + 2 heal (ultimate)"},
    
    # COMPOUNDING cards
    {"id": "envy_07", "name": "Green-Eyed Curse", "card_type": "compounding", "cost": 2,
     "compound_base": 2, "compound_type": "debuff", "compound_target": "single_enemy",
     "summary": "2→2→4 debuff over 3 rounds (8 total)"},
    
    {"id": "envy_08", "name": "Toxic Comparison", "card_type": "compounding", "cost": 3,
     "compound_base": 2, "compound_type": "damage", "compound_target": "single_enemy",
     "summary": "2→2→4 dmg over 3 rounds (8 total)"},
    
    {"id": "envy_09", "name": "Spite Shield", "card_type": "compounding", "cost": 1,
     "compound_base": 1, "compound_type": "shield", "compound_target": "self",
     "summary": "1→1→2 shield over 3 rounds (4 total)"},
    
    {"id": "envy_10", "name": "Copycat", "card_type": "compounding", "cost": 2,
     "compound_base": 1, "compound_type": "damage", "compound_target": "single_enemy",
     "summary": "1→1→2 dmg over 3 rounds (4 total) + 1 flat dmg on play",
     "extra_instant": {"type": "damage", "value": 2, "target": "single_enemy"}},
    
    # CATCH-UP cards
    {"id": "envy_11", "name": "Resentful Strike", "card_type": "flat", "cost": 1,
     "effects": [{"type": "damage", "value": 2, "target": "single_enemy"}, {"type": "debuff", "value": 1, "target": "self"}],
     "summary": "2 flat dmg + 1 self-debuff + bonus 2 dmg when behind",
     "catchup": True},
    
    {"id": "envy_12", "name": "Equalizer", "card_type": "flat", "cost": 3,
     "effects": [{"type": "damage", "value": 2, "target": "all_enemies"}],
     "summary": "2 flat dmg to ALL + bonus 3 heal when lowest HP",
     "catchup": True},
]

# ─── Analysis ────────────────────────────────────────────
print("=" * 70)
print("CARD REDESIGN: FLAT vs COMPOUNDING SYSTEM")
print("Fibonacci Escalation: [1×, 1×, 2×] over 3 rounds")
print("=" * 70)

factions = {
    "WRATH": wrath_cards,
    "SLOTH": sloth_cards,
    "GREED": greed_cards,
    "ENVY": envy_cards,
}

faction_stats = {}
for name, cards in factions.items():
    results, avg_ev, avg_cost, ev_ratio = design_faction(name, cards)
    faction_stats[name] = {"results": results, "avg_ev": avg_ev, "avg_cost": avg_cost, "ev_ratio": ev_ratio}
    
    flat_count = sum(1 for c in cards if c.get("card_type") == "flat")
    comp_count = sum(1 for c in cards if c.get("card_type") == "compounding")
    catchup_count = sum(1 for c in cards if c.get("catchup"))
    
    print(f"\n{'─' * 50}")
    print(f"  {name} ({flat_count} flat / {comp_count} compounding / {catchup_count} catch-up)")
    print(f"  Avg EV: {avg_ev:.1f} | Avg Cost: {avg_cost:.1f} | EV/Cost: {ev_ratio:.2f}")
    print(f"{'─' * 50}")
    
    for r in results:
        marker = "⚡" if r["type"] == "flat" else "🔄"
        print(f"  {marker} {r['name']:22s} Cost:{r['cost']} Total:{r['total_value']:>3} EV/C:{r['ev_per_cost']:>5.1f}  {r['effects_summary']}")

# Cross-faction balance
print(f"\n{'=' * 70}")
print("CROSS-FACTION BALANCE")
print(f"{'=' * 70}")

ev_ratios = {name: stats["ev_ratio"] for name, stats in faction_stats.items()}
mean_ratio = sum(ev_ratios.values()) / len(ev_ratios)

for name, ratio in ev_ratios.items():
    deviation = (ratio - mean_ratio) / mean_ratio * 100
    grade = "✅" if abs(deviation) < 5 else "⚠️" if abs(deviation) < 10 else "❌"
    print(f"  {grade} {name:8s}: EV/Cost = {ratio:.2f} (deviation: {deviation:+.1f}%)")

print(f"\n  Mean EV/Cost: {mean_ratio:.2f}")
max_dev = max(abs((r - mean_ratio) / mean_ratio * 100) for r in ev_ratios.values())
print(f"  Max deviation: {max_dev:.1f}%")

if max_dev < 5:
    print(f"  Grade: EXCELLENT ✅✅✅")
elif max_dev < 10:
    print(f"  Grade: GOOD ✅✅")
elif max_dev < 15:
    print(f"  Grade: ACCEPTABLE ✅")
else:
    print(f"  Grade: NEEDS WORK ⚠️")

# Card type distribution
print(f"\n{'=' * 70}")
print("CARD TYPE DISTRIBUTION")
print(f"{'=' * 70}")
for name, cards in factions.items():
    flat = sum(1 for c in cards if c.get("card_type") == "flat")
    comp = sum(1 for c in cards if c.get("card_type") == "compounding")
    catch = sum(1 for c in cards if c.get("catchup"))
    print(f"  {name:8s}: {flat} flat / {comp} compounding / {catch} catch-up = {len(cards)} total")

print(f"\n  Total cards: {sum(len(c) for c in factions.values())}")
