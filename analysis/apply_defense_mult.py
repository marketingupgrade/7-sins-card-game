#!/usr/bin/env python3
"""
Apply ×1.75 multiplier to all defensive effect base values in cardData.ts.

Defensive effects that get multiplied:
- heal_gain (baseValue)
- shield_gain (baseValue)
- heal_steal (baseValue) — the heal portion benefits defense
- shield_steal (baseValue) — the shield portion benefits defense

We do NOT multiply:
- damage, self_damage (offensive)
- energy_gain, energy_steal, energy_block, energy_regen (utility)
- heal_block, shield_block (control/debuff)
- affliction_amplify, affliction_transfer (offensive)
- discard_burn, draw_boost, draw_reduction (utility)
"""

import re
import math

MULT = 1.75
DEFENSIVE_TYPES = {"heal_gain", "shield_gain", "heal_steal", "shield_steal"}

input_path = "/home/ubuntu/7-sins-card-game/shared/cardData.ts"

with open(input_path, "r") as f:
    content = f.read()

# Pattern: type: "heal_gain", baseValue: 6
# We need to find each effect object and only modify baseValue if the type is defensive
pattern = r'type:\s*"(\w+)",\s*baseValue:\s*(\d+)'

changes = []

def replace_match(m):
    effect_type = m.group(1)
    old_val = int(m.group(2))
    
    if effect_type in DEFENSIVE_TYPES:
        new_val = round(old_val * MULT)
        changes.append((effect_type, old_val, new_val))
        return f'type: "{effect_type}", baseValue: {new_val}'
    return m.group(0)

new_content = re.sub(pattern, replace_match, content)

with open(input_path, "w") as f:
    f.write(new_content)

print(f"Applied ×{MULT} multiplier to {len(changes)} defensive effects:")
print(f"  Types modified: {', '.join(sorted(set(c[0] for c in changes)))}")
print(f"  Total changes: {len(changes)}")

# Summary by type
from collections import Counter
type_counts = Counter(c[0] for c in changes)
for t, count in sorted(type_counts.items()):
    vals = [(c[1], c[2]) for c in changes if c[0] == t]
    print(f"  {t}: {count} effects (e.g., {vals[0][0]} → {vals[0][1]})")

# Show a few examples
print("\nSample changes:")
for t, old, new in changes[:10]:
    print(f"  {t}: {old} → {new}")
