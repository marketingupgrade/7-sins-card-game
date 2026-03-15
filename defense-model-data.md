# Defense Viability Model — Extracted Data

## Game Constants
- HP: 200
- Max Rounds: 20
- Energy: Start 2, +1/round, max 7, carry-over
- Hand Size: 5
- Deck Size: 30 (from 54-card pool)
- Round 16: All afflictions double
- Cards per turn: up to 3 (limited by energy)
- Compound patterns: standard (Fibonacci), aggressive (powers of 2), slowburn

## Current Passive Values (v5)
| Faction   | Passive     | Mechanic                                    | Value    |
|-----------|-------------|---------------------------------------------|----------|
| Wrath     | VENGEANCE   | Reflect % of incoming damage to attacker    | 63.4%    |
| Sloth     | ENDURANCE   | Start of turn: shield = energy × hand × mult (cap) | ×0.45 (cap 25) |
| Greed     | TAX         | On tick-2 compound damage dealt, gain shield | 6.3%    |
| Envy      | JEALOUSY    | On damage dealt, amplify target's worst affliction | 10.6% |
| Pride     | HUBRIS      | Highest-cost card played → all effects ×mult | ×1.324  |
| Lust      | TEMPTATION  | On compound tick damage, heal % of damage   | 25%      |
| Gluttony  | DEVOURER    | Each card burned via discard_burn grants energy | 1.585  |

## Defensive Card Distribution
| Faction   | Total | Heal Effects | Shield Effects | Damage Effects |
|-----------|-------|-------------|----------------|----------------|
| Wrath     | 54    | 5           | 11             | 52             |
| Sloth     | 54    | 20          | 31             | 19             |
| Greed     | 54    | 11          | 21             | 37             |
| Envy      | 54    | 9           | 10             | 42             |
| Pride     | 54    | 10          | 31             | 40             |
| Lust      | 54    | 38          | 9              | 47             |
| Gluttony  | 54    | 13          | 10             | 38             |

## Average Effect Values (baseValue × duration)
| Faction   | Avg Heal Total | Avg Shield Total | Avg Dmg Total |
|-----------|---------------|------------------|---------------|
| Wrath     | 39.4          | 22.2             | 41.6          |
| Sloth     | 15.1          | 19.5             | 16.3          |
| Greed     | 13.9          | 23.9             | 28.9          |
| Envy      | 18.3          | 12.5             | 27.1          |
| Pride     | 15.2          | 14.5             | 18.1          |
| Lust      | 12.0          | 10.1             | 18.0          |
| Gluttony  | 20.5          | 21.4             | 29.2          |

## The Multiplayer Focus-Fire Problem
In a 4-player FFA:
- A defensive faction (Sloth, Greed) can be targeted by 3 opponents simultaneously
- Current Sloth ENDURANCE: max shield 25/turn. If 3 opponents each deal ~30 damage/turn = 90 incoming
- Shield absorbs 25/90 = 27.8% of focus-fire damage. Remaining 65 damage/turn → dead in ~3 rounds
- Current Greed TAX: only triggers on tick-2 of own damage dealt, not on incoming damage
- Lust TEMPTATION: heals 25% of own damage dealt, but if focused, incoming > outgoing

## Key Insight
The passives were balanced for 1v1 matchups. In multiplayer, defensive passives need to scale
with the NUMBER OF ATTACKERS, not just the damage amount. A 3v1 focus-fire scenario means
defensive values need to be roughly 2-3× more effective to maintain viability.
