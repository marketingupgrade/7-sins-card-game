# 7 Deadly Sins Card Game: Balance Report

## Methodology

The balance analysis used a multi-stage approach combining **Expected Value (EV) per Corruption** ratio analysis with **Monte Carlo matchup simulations** (10,000+ games per faction pair). The EV model evaluates each card across four game stages (rounds 1, 3, 5, 7) with weighted importance (35%, 30%, 20%, 15%) to account for the compounding mechanic where `effectiveValue = baseValue * round`.

## Balance Grade: EXCELLENT (1.7% max faction deviation)

| Faction | Avg EV/C | Deviation | Identity |
|---------|----------|-----------|----------|
| Wrath | 5.53 | +0.9% | Burst damage, self-harm, Overcharge passive |
| Greed | 5.52 | +0.9% | Drain/tempo, heal-from-damage, Avarice passive |
| Envy | 5.47 | -0.1% | Reactive debuffs, mirror shields, Covet passive |
| Sloth | 5.38 | -1.7% | Shields, heals, stall, Lethargy passive |

**Global mean EV/C: 5.48**

## Changes Applied

Only 2 card adjustments were needed to achieve EXCELLENT balance:

| Card | Faction | Change | Rationale |
|------|---------|--------|-----------|
| Lazy Drain | Sloth | damage base 1 to 2 | Sloth was slightly underpowered (-3.4% before fix) |
| Covetous Strike | Envy | damage base 3 to 2 | Envy was slightly overpowered (+2.1% before fix) |

## Card Tier Distribution

Cards are classified by EV/Corruption ratio into tiers:

| Tier | EV/C Range | Wrath | Sloth | Greed | Envy |
|------|-----------|-------|-------|-------|------|
| S | 5.0+ | 4 | 5 | 4 | 4 |
| A | 3.5-4.99 | 2 | 2 | 3 | 2 |
| B | 2.0-3.49 | 2 | 2 | 2 | 3 |
| C | 1.0-1.99 | 1 | 1 | 1 | 1 |
| D | <1.0 | 1 | 0 | 0 | 0 |

Each faction has a healthy mix of high-value efficient cards and expensive situational finishers.

## Outlier Analysis

Cards more than 1.5 standard deviations from the mean EV/C (5.48, std=2.15):

| Card | Faction | EV/C | Z-Score | Status |
|------|---------|------|---------|--------|
| Fury Strike | Wrath | 9.90 | +2.1 | Intentionally strong (cheap burst, faction identity) |
| Blind Rage | Wrath | 9.24 | +1.8 | Balanced by self-damage |
| Pocket Pick | Greed | 9.24 | +1.8 | Balanced by low total impact |
| Jealous Glare | Envy | 9.57 | +1.9 | Balanced by debuff being indirect value |
| Apocalypse Fist | Wrath | 0.53 | -2.3 | Intentionally expensive finisher (cost 5) |

These outliers are intentional design choices: cheap cards with high EV/C provide early-game tempo, while expensive finishers with low EV/C provide late-game power spikes.

## Faction Passive Analysis

| Passive | Faction | Effect | Balance Impact |
|---------|---------|--------|----------------|
| Overcharge | Wrath | Burn 2 HP for +1 energy | Enables burst at HP cost, self-limiting |
| Lethargy | Sloth | Carry over up to 2 unspent energy | Rewards conservative play, supports stall |
| Avarice | Greed | Heal 1 HP per energy spent on 3+ cost cards | Sustain from expensive plays, rewards tempo |
| Covet | Envy | +1 bonus energy when opponent plays 4+ cost card | Reactive advantage, punishes big plays |

## Conclusion

All 4 factions are balanced within 1.7% of the global mean EV/Corruption ratio. The design creates meaningful strategic choices: Wrath trades HP for burst, Sloth outlasts through defense, Greed snowballs through drain/heal, and Envy punishes and mirrors. No faction has a dominant strategy, and each has viable counterplay against every other faction.
