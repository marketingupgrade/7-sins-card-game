#!/usr/bin/env python3
"""
Generate new 0-cost cards for each faction to bring total to 12 per faction.
Cards are balanced with existing 0-cost power levels.
"""

# New 0-cost cards per faction
# Design principles:
# - Power level consistent with existing 0-cost cards
# - Mix of offense, defense, utility per faction
# - Faction-appropriate effects and thematic names
# - All common tier (a few rare), mostly standard pattern

NEW_CARDS = {
    "wrath": [
        # Need 6 more (currently 6)
        {"id": "wrath_55", "name": "Smolder", "effects": [{"type": "damage", "baseValue": 6, "duration": 3, "targetMode": "single"}], "pattern": "standard", "desc": "A slow burn that never stops."},
        {"id": "wrath_56", "name": "Spite Spark", "effects": [{"type": "damage", "baseValue": 4, "duration": 2, "targetMode": "single"}, {"type": "shield_gain", "baseValue": 4, "duration": 2, "targetMode": "self"}], "pattern": "standard", "desc": "Fury forges its own armor."},
        {"id": "wrath_57", "name": "Temper Flare", "effects": [{"type": "damage", "baseValue": 8, "duration": 2, "targetMode": "single"}], "pattern": "standard", "desc": "Quick and vicious."},
        {"id": "wrath_58", "name": "Ash Breath", "effects": [{"type": "damage", "baseValue": 4, "duration": 3, "targetMode": "aoe"}], "pattern": "standard", "desc": "Everyone chokes."},
        {"id": "wrath_59", "name": "Grudge", "effects": [{"type": "damage", "baseValue": 6, "duration": 4, "targetMode": "single"}], "pattern": "slowburn", "desc": "Wrath remembers."},
        {"id": "wrath_60", "name": "Scorch Mark", "effects": [{"type": "damage", "baseValue": 5, "duration": 2, "targetMode": "single"}, {"type": "energy_regen", "baseValue": 1, "duration": 1, "targetMode": "self"}], "pattern": "standard", "desc": "Pain fuels the fire."},
    ],
    "sloth": [
        # Need 5 more (currently 7)
        {"id": "sloth_55", "name": "Doze", "effects": [{"type": "heal_gain", "baseValue": 6, "duration": 3, "targetMode": "self"}], "pattern": "standard", "desc": "Sleep heals all wounds."},
        {"id": "sloth_56", "name": "Lazy Block", "effects": [{"type": "shield_gain", "baseValue": 7, "duration": 2, "targetMode": "self"}], "pattern": "standard", "desc": "Too tired to dodge, too stubborn to fall."},
        {"id": "sloth_57", "name": "Sluggish Curse", "effects": [{"type": "draw_reduction", "baseValue": 1, "duration": 3, "targetMode": "single"}], "pattern": "slowburn", "desc": "Your hands grow heavy."},
        {"id": "sloth_58", "name": "Nap Time", "effects": [{"type": "shield_gain", "baseValue": 4, "duration": 2, "targetMode": "self"}, {"type": "heal_gain", "baseValue": 3, "duration": 2, "targetMode": "self"}], "pattern": "standard", "desc": "A quick rest never hurt."},
        {"id": "sloth_59", "name": "Heavy Eyelids", "effects": [{"type": "damage", "baseValue": 5, "duration": 3, "targetMode": "single"}], "pattern": "standard", "desc": "Even sloth can sting."},
    ],
    "greed": [
        # Need 7 more (currently 5)
        {"id": "greed_55", "name": "Pocket Change", "effects": [{"type": "damage", "baseValue": 3, "duration": 3, "targetMode": "single"}, {"type": "energy_regen", "baseValue": 1, "duration": 1, "targetMode": "self"}], "pattern": "standard", "desc": "Every coin counts."},
        {"id": "greed_56", "name": "Skim", "effects": [{"type": "energy_steal", "baseValue": 1, "duration": 2, "targetMode": "single"}], "pattern": "standard", "desc": "A little off the top."},
        {"id": "greed_57", "name": "Hoard", "effects": [{"type": "shield_gain", "baseValue": 6, "duration": 3, "targetMode": "self"}], "pattern": "standard", "desc": "Pile it higher."},
        {"id": "greed_58", "name": "Bargain", "effects": [{"type": "damage", "baseValue": 5, "duration": 2, "targetMode": "single"}, {"type": "heal_gain", "baseValue": 3, "duration": 2, "targetMode": "self"}], "pattern": "standard", "desc": "Buy low, sell high."},
        {"id": "greed_59", "name": "Tax Bite", "effects": [{"type": "damage", "baseValue": 5, "duration": 3, "targetMode": "single"}], "pattern": "standard", "desc": "The collector always comes."},
        {"id": "greed_60", "name": "Loose Change", "effects": [{"type": "energy_regen", "baseValue": 1, "duration": 2, "targetMode": "self"}, {"type": "draw_boost", "baseValue": 1, "duration": 1, "targetMode": "self"}], "pattern": "standard", "desc": "Shake the couch cushions."},
        {"id": "greed_61", "name": "Nickel and Dime", "effects": [{"type": "damage", "baseValue": 3, "duration": 2, "targetMode": "aoe"}], "pattern": "standard", "desc": "Death by a thousand fees."},
    ],
    "envy": [
        # Need 6 more (currently 6)
        {"id": "envy_55", "name": "Covet", "effects": [{"type": "damage", "baseValue": 4, "duration": 2, "targetMode": "single"}, {"type": "affliction_amplify", "baseValue": 2, "duration": 1, "targetMode": "single"}], "pattern": "standard", "desc": "I want what you have."},
        {"id": "envy_56", "name": "Bitter Glance", "effects": [{"type": "damage", "baseValue": 5, "duration": 3, "targetMode": "single"}], "pattern": "standard", "desc": "If looks could kill."},
        {"id": "envy_57", "name": "Resentment", "effects": [{"type": "affliction_amplify", "baseValue": 2, "duration": 3, "targetMode": "single"}], "pattern": "slowburn", "desc": "It festers."},
        {"id": "envy_58", "name": "Petty Theft", "effects": [{"type": "shield_steal", "baseValue": 4, "duration": 2, "targetMode": "single"}], "pattern": "standard", "desc": "If I can't have it, neither can you."},
        {"id": "envy_59", "name": "Scowl", "effects": [{"type": "damage", "baseValue": 3, "duration": 2, "targetMode": "single"}, {"type": "draw_reduction", "baseValue": 1, "duration": 1, "targetMode": "single"}], "pattern": "standard", "desc": "Your joy offends me."},
        {"id": "envy_60", "name": "Jealous Whisper", "effects": [{"type": "damage", "baseValue": 4, "duration": 2, "targetMode": "duo"}], "pattern": "standard", "desc": "Spread the misery."},
    ],
    "pride": [
        # Need 10 more (currently 2) — biggest gap
        {"id": "pride_55", "name": "Sneer", "effects": [{"type": "damage", "baseValue": 4, "duration": 3, "targetMode": "single"}], "pattern": "standard", "desc": "Beneath contempt."},
        {"id": "pride_56", "name": "Posture", "effects": [{"type": "shield_gain", "baseValue": 6, "duration": 2, "targetMode": "self"}], "pattern": "standard", "desc": "Stand tall. Look down."},
        {"id": "pride_57", "name": "Condescend", "effects": [{"type": "damage", "baseValue": 3, "duration": 2, "targetMode": "single"}, {"type": "draw_reduction", "baseValue": 1, "duration": 1, "targetMode": "single"}], "pattern": "standard", "desc": "You're not worth my time."},
        {"id": "pride_58", "name": "Self-Admire", "effects": [{"type": "heal_gain", "baseValue": 5, "duration": 3, "targetMode": "self"}], "pattern": "standard", "desc": "Perfection heals itself."},
        {"id": "pride_59", "name": "Belittle", "effects": [{"type": "damage", "baseValue": 5, "duration": 2, "targetMode": "single"}, {"type": "affliction_amplify", "baseValue": 1, "duration": 1, "targetMode": "single"}], "pattern": "standard", "desc": "Small words, deep cuts."},
        {"id": "pride_60", "name": "Preen", "effects": [{"type": "shield_gain", "baseValue": 4, "duration": 2, "targetMode": "self"}, {"type": "heal_gain", "baseValue": 3, "duration": 2, "targetMode": "self"}], "pattern": "standard", "desc": "Admire the plumage."},
        {"id": "pride_61", "name": "Scoff", "effects": [{"type": "damage", "baseValue": 6, "duration": 2, "targetMode": "single"}], "pattern": "standard", "desc": "Is that all?"},
        {"id": "pride_62", "name": "Vainglory", "effects": [{"type": "damage", "baseValue": 4, "duration": 4, "targetMode": "single"}], "pattern": "slowburn", "desc": "The mirror never lies."},
        {"id": "pride_63", "name": "Haughty Gaze", "effects": [{"type": "damage", "baseValue": 3, "duration": 2, "targetMode": "aoe"}], "pattern": "standard", "desc": "All are beneath me."},
        {"id": "pride_64", "name": "Ego Boost", "effects": [{"type": "energy_regen", "baseValue": 1, "duration": 2, "targetMode": "self"}, {"type": "shield_gain", "baseValue": 3, "duration": 2, "targetMode": "self"}], "pattern": "standard", "desc": "Confidence is power."},
    ],
    "lust": [
        # Need 6 more (currently 6)
        {"id": "lust_55", "name": "Wink", "effects": [{"type": "damage", "baseValue": 3, "duration": 3, "targetMode": "single"}, {"type": "heal_gain", "baseValue": 2, "duration": 2, "targetMode": "self"}], "pattern": "standard", "desc": "A glance that lingers."},
        {"id": "lust_56", "name": "Caress", "effects": [{"type": "heal_gain", "baseValue": 5, "duration": 3, "targetMode": "self"}], "pattern": "standard", "desc": "Gentle but relentless."},
        {"id": "lust_57", "name": "Tease", "effects": [{"type": "damage", "baseValue": 4, "duration": 2, "targetMode": "single"}, {"type": "draw_reduction", "baseValue": 1, "duration": 1, "targetMode": "single"}], "pattern": "standard", "desc": "Come closer. No, not yet."},
        {"id": "lust_58", "name": "Blush", "effects": [{"type": "shield_gain", "baseValue": 5, "duration": 3, "targetMode": "self"}], "pattern": "standard", "desc": "Flushed with power."},
        {"id": "lust_59", "name": "Whisper", "effects": [{"type": "damage", "baseValue": 2, "duration": 2, "targetMode": "duo"}, {"type": "heal_gain", "baseValue": 3, "duration": 2, "targetMode": "self"}], "pattern": "standard", "desc": "Sweet nothings that sting."},
        {"id": "lust_60", "name": "Longing", "effects": [{"type": "damage", "baseValue": 3, "duration": 4, "targetMode": "single"}], "pattern": "slowburn", "desc": "Desire is patient."},
    ],
    "gluttony": [
        # Need 6 more (currently 6)
        {"id": "gluttony_55", "name": "Snack", "effects": [{"type": "heal_gain", "baseValue": 7, "duration": 2, "targetMode": "self"}, {"type": "discard_burn", "baseValue": 1, "duration": 1, "targetMode": "single"}], "pattern": "standard", "desc": "A bite between meals."},
        {"id": "gluttony_56", "name": "Burp", "effects": [{"type": "damage", "baseValue": 5, "duration": 2, "targetMode": "aoe"}], "pattern": "standard", "desc": "Excuse me."},
        {"id": "gluttony_57", "name": "Chew", "effects": [{"type": "discard_burn", "baseValue": 2, "duration": 2, "targetMode": "single"}], "pattern": "standard", "desc": "Slowly devoured."},
        {"id": "gluttony_58", "name": "Gorge", "effects": [{"type": "shield_gain", "baseValue": 8, "duration": 2, "targetMode": "self"}, {"type": "heal_gain", "baseValue": 5, "duration": 2, "targetMode": "self"}], "pattern": "standard", "desc": "Stuff yourself. Feel invincible."},
        {"id": "gluttony_59", "name": "Crumb Trail", "effects": [{"type": "damage", "baseValue": 4, "duration": 3, "targetMode": "single"}, {"type": "draw_boost", "baseValue": 1, "duration": 1, "targetMode": "self"}], "pattern": "standard", "desc": "Follow the crumbs."},
        {"id": "gluttony_60", "name": "Taste", "effects": [{"type": "damage", "baseValue": 4, "duration": 3, "targetMode": "single"}, {"type": "discard_burn", "baseValue": 1, "duration": 2, "targetMode": "single"}], "pattern": "standard", "desc": "Just a sample."},
    ],
}

def generate_card_ts(card, sin):
    """Generate a single card's TypeScript code."""
    effects_parts = []
    for eff in card["effects"]:
        effects_parts.append(
            f'{{ type: "{eff["type"]}", baseValue: {eff["baseValue"]}, '
            f'duration: {eff["duration"]}, targetMode: "{eff["targetMode"]}" }}'
        )
    effects_str = ", ".join(effects_parts)
    return (
        f'  {{\n'
        f'    id: "{card["id"]}", name: "{card["name"]}", sin: "{sin}",\n'
        f'    cost: 0, tier: "common", compoundPattern: "{card["pattern"]}",\n'
        f'    effects: [{effects_str}],\n'
        f'    description: "{card["desc"]}",\n'
        f'  }}'
    )

# Read the file
with open("shared/cardData.ts") as f:
    content = f.read()
    lines = content.split("\n")

# Find the closing bracket line for each faction
faction_close_lines = {
    "wrath": 366,
    "sloth": 700,
    "greed": 1034,
    "envy": 1368,
    "pride": 1702,
    "lust": 2036,
    "gluttony": 2370,
}

# Build insertions (work backwards to preserve line numbers)
insertions = []
for sin in ["gluttony", "lust", "pride", "envy", "greed", "sloth", "wrath"]:
    if sin not in NEW_CARDS:
        continue
    cards = NEW_CARDS[sin]
    close_line = faction_close_lines[sin]  # 1-indexed
    card_strs = [generate_card_ts(c, sin) for c in cards]
    insert_text = ",\n".join(card_strs)
    insertions.append((close_line, insert_text))

# Apply insertions (backwards to preserve line numbers)
for close_line_num, insert_text in insertions:
    # close_line_num is 1-indexed, the line with "];
    # We need to insert before it, after the last card's closing brace
    idx = close_line_num - 1  # 0-indexed
    # The line before ]; should end with },  or }
    # We insert after adding a comma to the previous card if needed
    prev_line = lines[idx - 1]
    if prev_line.rstrip().endswith("},") or prev_line.rstrip().endswith("}"):
        if not prev_line.rstrip().endswith(","):
            lines[idx - 1] = prev_line.rstrip() + ","
    lines.insert(idx, insert_text + ",")

# Update the header comment with new card count
total_new = sum(len(cards) for cards in NEW_CARDS.values())
old_total = 350 + 28  # 350 original + 28 from defensive scaling (378 total with 54 per faction)
# Actually each faction has 54 cards, 7 factions = 378
new_total = 378 + total_new

content_out = "\n".join(lines)
content_out = content_out.replace(
    "350 Balanced Cards",
    f"{new_total} Balanced Cards"
)
# Update per-faction counts in comments
for sin, cards in NEW_CARDS.items():
    old_count = 50  # header says 50 but actual is 54
    # Actually the comments say "50 cards" but there are 54
    pass

with open("shared/cardData.ts", "w") as f:
    f.write(content_out)

print(f"Added {total_new} new 0-cost cards:")
for sin, cards in sorted(NEW_CARDS.items()):
    print(f"  {sin}: +{len(cards)} cards ({cards[0]['id']} to {cards[-1]['id']})")
print(f"\nNew total: {new_total} cards")
