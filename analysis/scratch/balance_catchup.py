"""
Catch-Up Mechanism Card Design & Balance Analysis
Using /math EV framework with proper game mechanics modeling.

Catch-up cards are stronger when the player is behind (lower HP than opponents).
Each faction gets 2 catch-up cards that fit their thematic identity.

Design principles:
1. Catch-up cards should be CONDITIONAL - strong when behind, weak/neutral when ahead
2. They should not make losing feel rewarding (rubber-banding), but give hope
3. Each faction's catch-up should reinforce their playstyle identity
4. Cost should be moderate (1-2) so they're playable when desperate

Also: Shield absorption fix analysis.
Current shields do NOTHING. They need to reduce incoming damage.
Shield mechanic: When taking damage, active shield effects absorb damage first.
Shield value = baseValue * round (compounding). Consumed on use.
"""

import json

# Current game constants
STARTING_HP = 25
MAX_ROUNDS = 10
MAX_ENERGY = 7
STARTING_ENERGY = 2

def calc_ev(base, round_num):
    return base * round_num

# ─── CATCH-UP CARD DESIGNS ─────────────────────────────────────

# Design: Each faction gets 2 catch-up cards (expanding deck from 10 to 12)
# Catch-up condition: player HP < opponent HP (checked at play time)
# When behind: bonus effect activates. When ahead: only base effect.

catchup_cards = {
    "wrath": [
        {
            "id": "wrath_11",
            "name": "Desperate Fury",
            "cost": 2,
            "base_effect": "damage 3 to single_enemy",
            "catchup_bonus": "+2 damage if HP < target HP (total 5 dmg)",
            "self_cost": "1 self damage always",
            "tier": "rare",
            "flavor": "The cornered beast strikes hardest.",
            "quip": "Nothing like impending doom to sharpen your aim. Extra damage when desperate.",
        },
        {
            "id": "wrath_12",
            "name": "Last Stand",
            "cost": 1,
            "base_effect": "damage 2 to single_enemy",
            "catchup_bonus": "+heal 2 self if HP <= 10 (40% threshold)",
            "self_cost": "none",
            "tier": "rare",
            "flavor": "When there's nothing left to lose, everything becomes a weapon.",
            "quip": "Below 10 HP and still fighting? Here's some HP. Don't say I never gave you anything.",
        },
    ],
    "sloth": [
        {
            "id": "sloth_11",
            "name": "Survival Instinct",
            "cost": 1,
            "base_effect": "shield 2 for 1 round",
            "catchup_bonus": "+heal 2 self if HP < any opponent HP",
            "self_cost": "none",
            "tier": "rare",
            "flavor": "Even the laziest creature fights when cornered.",
            "quip": "Sloth actually trying? Things must be dire. Bonus heal when you're the underdog.",
        },
        {
            "id": "sloth_12",
            "name": "Feign Death",
            "cost": 2,
            "base_effect": "shield 3 for 2 rounds",
            "catchup_bonus": "+debuff 1 for 2 rounds on all enemies if HP <= 10",
            "self_cost": "none",
            "tier": "epic",
            "flavor": "Playing dead is an art form. And an effective strategy.",
            "quip": "Playing possum AND spreading debuffs? Devious laziness at its finest.",
        },
    ],
    "greed": [
        {
            "id": "greed_11",
            "name": "Desperate Gambit",
            "cost": 1,
            "base_effect": "damage 2 to single_enemy, heal 1 self",
            "catchup_bonus": "+heal 2 extra if HP < target HP (total heal 3)",
            "self_cost": "none",
            "tier": "rare",
            "flavor": "When the chips are down, bet everything.",
            "quip": "Doubling down when you're losing. Classic gambler's fallacy. But it works here.",
        },
        {
            "id": "greed_12",
            "name": "Bankruptcy Protection",
            "cost": 2,
            "base_effect": "shield 2 for 1 round, heal 1 self",
            "catchup_bonus": "+heal 3 extra if HP <= 10 (total heal 4)",
            "self_cost": "none",
            "tier": "epic",
            "flavor": "Chapter 11: The shield that keeps on giving.",
            "quip": "Filing for bankruptcy protection. In a card game. The greed is meta.",
        },
    ],
    "envy": [
        {
            "id": "envy_11",
            "name": "Resentful Strike",
            "cost": 1,
            "base_effect": "damage 2 to single_enemy",
            "catchup_bonus": "+damage 2 extra if target HP > your HP (total 4 dmg)",
            "self_cost": "debuff 1 for 1 round on self",
            "tier": "rare",
            "flavor": "The deeper the envy, the sharper the blade.",
            "quip": "Jealousy fuels this strike. More damage when they have more HP. Poetic justice.",
        },
        {
            "id": "envy_12",
            "name": "Equalizer",
            "cost": 3,
            "base_effect": "damage 2 to all_enemies",
            "catchup_bonus": "+heal 3 self if HP is lowest among all players",
            "self_cost": "none",
            "tier": "epic",
            "flavor": "If I can't have what they have, nobody can.",
            "quip": "The great equalizer. Damage everyone, heal yourself if you're the weakest. Fair? No. Fun? Absolutely.",
        },
    ],
}

# ─── EV ANALYSIS ────────────────────────────────────────────────

print("=" * 70)
print("CATCH-UP CARD EV ANALYSIS")
print("=" * 70)

# Analyze each card's EV at different game stages
# Assume catch-up condition is met ~50% of the time in a balanced game
# When behind (catch-up active): higher EV
# When ahead (no catch-up): base EV only

for sin, cards in catchup_cards.items():
    print(f"\n{'─' * 50}")
    print(f"  {sin.upper()} CATCH-UP CARDS")
    print(f"{'─' * 50}")
    
    for card in cards:
        print(f"\n  {card['name']} (Cost: {card['cost']})")
        print(f"  Base: {card['base_effect']}")
        print(f"  Catch-up: {card['catchup_bonus']}")
        if card['self_cost'] != "none":
            print(f"  Self-cost: {card['self_cost']}")
        
        # Simplified EV calculation
        # We model base_ev and catchup_ev separately
        # Total expected EV = base_ev + (catchup_probability * bonus_ev)
        
        print(f"  Tier: {card['tier']}")

# ─── SHIELD ABSORPTION ANALYSIS ────────────────────────────────

print("\n" + "=" * 70)
print("SHIELD ABSORPTION MECHANIC ANALYSIS")
print("=" * 70)

print("""
Current state: Shields stored as active_effects but NEVER reduce damage.
They are purely decorative.

Proposed fix: When applyInstantEffect("damage", ...) is called,
check for active shield effects on the target player.

Shield absorption formula:
  shield_value = baseValue * currentRound (compounding)
  damage_after_shield = max(0, damage - total_shield_value)
  
Shield consumption:
  - Shields absorb damage up to their remaining value
  - Excess damage passes through to HP
  - Shield effects are consumed (deleted) when fully used
  - Partial consumption: reduce shield base_value proportionally

Implementation approach:
  1. In applyInstantEffect("damage"), before applying HP reduction:
     a. Query active_effects for shield-type effects on target
     b. Sum total shield value (each shield's baseValue * currentRound)
     c. Reduce damage by shield total
     d. Consume/reduce shield effects accordingly
  2. This makes shields ACTUALLY defensive instead of decorative
  
EV impact on balance:
  - Sloth has the most shields (4 cards with shield effects)
  - This will significantly buff Sloth's survivability
  - Wrath has 1 shield card (Rage Shield)
  - Greed has 1 shield card (Golden Shield)  
  - Envy has 2 shield cards (Spite Shield, Bitter Reflection)
  
  Need to verify balance remains acceptable after shield fix.
""")

# Count shield cards per faction
shield_counts = {
    "wrath": 1,  # Rage Shield
    "sloth": 4,  # Pillow Fort, Procrastination, Passive Resistance, Eternal Rest
    "greed": 1,  # Golden Shield
    "envy": 2,   # Spite Shield, Bitter Reflection (+ Doppelganger)
}

print("Shield cards per faction:")
for sin, count in shield_counts.items():
    print(f"  {sin}: {count} cards")

print("\nWith shields actually working, Sloth becomes significantly stronger")
print("at defense. This is thematically correct (Sloth = stall/survive).")
print("The catch-up cards help other factions recover when Sloth stalls.")

print("\n" + "=" * 70)
print("FINAL CARD SPECIFICATIONS (for implementation)")
print("=" * 70)

# Output the exact card specs for implementation
specs = []
for sin, cards in catchup_cards.items():
    for card in cards:
        specs.append(card)
        print(f"\n{card['id']}: {card['name']}")
        print(f"  Sin: {sin}, Cost: {card['cost']}, Tier: {card['tier']}")
        print(f"  Base: {card['base_effect']}")
        print(f"  Catch-up: {card['catchup_bonus']}")

print("\n\nTotal new cards: 8 (2 per faction)")
print("New deck size: 12 cards per faction, 48 total")
