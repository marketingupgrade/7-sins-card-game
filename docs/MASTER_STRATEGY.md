# 7 Deadly Sins Card Game — Master Strategy Document

**Author:** Joris van Huët — Founder Causality Engine
**Version:** 2.0 | **Date:** March 2026

---

## Executive Summary

This document defines the strategic identity, mechanical framework, and competitive balance of all seven sin factions in the 7 Deadly Sins card game. The core mechanic — **compounding effects** — uses a mathematically optimized Fibonacci escalation formula (1×, 1×, 2× over 3 rounds) that produces balanced 7-round average game lengths at 25 HP. Each faction has a distinct playstyle built around the tension between **flat cards** (powerful one-shot effects) and **compounding cards** (weaker initial impact that escalates over 3 rounds). The document includes a full SWOT analysis for each faction, cross-faction matchup theory, and design blueprints for the three upcoming factions (Pride, Lust, Gluttony).

---

## Core Mechanic: Compounding Effects

Every card in the game is classified as either **flat** or **compounding**:

| Property | Flat Cards | Compounding Cards |
|---|---|---|
| Duration | Instant (1 round) | 3 rounds |
| Cost | Paid once on play | Paid once on play |
| Value delivery | Full value immediately | Escalates: base → base → 2×base |
| Total value | Equal to face value | 4× base value over 3 rounds |
| Risk | None (guaranteed value) | Can be wasted if game ends early |
| Strategic depth | Reactive, tactical | Proactive, investment-oriented |

The **Fibonacci escalation formula** [1, 1, 2] was selected through mathematical optimization across 8 candidate models. It produces the optimal balance between:

1. **Game pacing**: Average game length of 7 rounds (target: 6-8) at 25 HP.
2. **Strategic tension**: Compounding cards are a gamble — they deliver 4× base over 3 rounds, but only if the player survives long enough to collect the payoff.
3. **Flat-compound parity**: Balance ratio of 0.89-1.33× across all corruption cost tiers, meaning neither strategy dominates.

### Effect Types That Compound

All effect types can be compounding:

| Effect Type | Round 1 | Round 2 | Round 3 | Example (base 2) |
|---|---|---|---|---|
| Damage (DoT) | 2 dmg | 2 dmg | 4 dmg | 8 total damage |
| Heal (HoT) | 2 heal | 2 heal | 4 heal | 8 total healing |
| Shield (SoT) | 2 shield | 2 shield | 4 shield | 8 total shield |
| Steal (drain) | 2 steal | 2 steal | 4 steal | 8 total stolen |

### Corruption (Energy) System

Players spend **Corruption** to play cards. The system creates meaningful resource decisions each turn:

| Round | Energy Available | Cumulative Spent (max) |
|---|---|---|
| 1 | 2 | 2 |
| 2 | 3 | 5 |
| 3 | 4 | 9 |
| 4 | 5 | 14 |
| 5 | 6 | 20 |
| 6-10 | 7 (capped) | 27-62 |

---

## Faction SWOT Analyses

### 1. WRATH (Implemented)

**Identity:** Aggressive berserker. Burns everything — including itself — to deal maximum damage. The embodiment of uncontrolled rage.

**Passive — Overcharge:** Burn 2 HP to gain +1 energy. Converts health into tempo.

**Playstyle:** All-in aggression. Wrath wants to end games fast before opponents can stabilize. Compounding damage cards create a ticking time bomb, while flat burst cards finish off weakened opponents.

| SWOT | Analysis |
|---|---|
| **Strengths** | Highest single-target damage output. Self-damage cards have above-average base values as compensation. Overcharge passive converts losing HP into more plays. Compounding DoTs create unavoidable pressure. |
| **Weaknesses** | Self-damage reduces survivability. No healing or shields. Overcharge accelerates own death if game goes long. Vulnerable to attrition strategies. |
| **Opportunities** | Punishes slow starters who invest in compounding effects. Can end games before round 5, denying opponents their compounding payoffs. Catch-up cards (Desperate Fury, Last Stand) become extremely powerful when behind. |
| **Threats** | Shield-heavy factions absorb burst damage. Heal-over-time factions can out-sustain the self-damage. Debuff factions can reduce Wrath's damage output, making self-harm a net negative. |

**Key Strategic Question:** Can Wrath kill before its own self-damage catches up? The faction rewards aggressive play and punishes hesitation.

---

### 2. SLOTH (Implemented)

**Identity:** Passive defender. Outlasts opponents through shields, heals, and patience. The embodiment of effortless endurance.

**Passive — Lethargy:** Carry over up to 2 unspent energy to the next round. Rewards patience and efficient spending.

**Playstyle:** Defensive stall. Sloth wants to survive to the late game where compounding heals and shields create an insurmountable wall. Flat cards provide emergency healing, while compounding shields build up over time.

| SWOT | Analysis |
|---|---|
| **Strengths** | Highest survivability. Shield + heal combination creates effective HP far above 25. Lethargy passive allows saving energy for expensive power turns. Compounding shields escalate to massive protection. |
| **Weaknesses** | Lowest damage output. Relies on opponent's compounding effects timing out. Can't close games quickly. Vulnerable to steal/drain effects that bypass shields. |
| **Opportunities** | Dominates against Wrath — absorbs burst damage and outlasts self-harm. Compounding heals become more valuable in long games. Energy efficiency from Lethargy enables expensive card combos. |
| **Threats** | Steal effects bypass shields entirely. Factions that can remove or ignore shields (Envy, Greed) negate Sloth's core strategy. If opponent has enough compounding damage stacked, even shields can't keep up. |

**Key Strategic Question:** Can Sloth stall long enough for its compounding defenses to become impenetrable? The faction rewards patience and punishes overcommitment.

---

### 3. GREED (Implemented)

**Identity:** Resource vampire. Steals HP, energy, and shields from opponents. The embodiment of insatiable desire.

**Passive — Avarice:** Heal 1 HP per energy spent. Every card played is also a small heal.

**Playstyle:** Value tempo. Greed plays a mid-range game — stealing resources creates a double swing (opponent loses, Greed gains). Compounding steal effects create escalating resource drains, while flat cards provide immediate tempo swings.

| SWOT | Analysis |
|---|---|
| **Strengths** | Double-value on every steal (opponent loses what Greed gains). Avarice passive provides passive sustain. Steal effects bypass shields. Compounding drains create exponentially growing resource gaps. |
| **Weaknesses** | Individual card values are lower (balanced by double-swing). Steal effects are wasted if opponent has nothing to steal. No burst damage for finishing. Dependent on opponent having resources to take. |
| **Opportunities** | Dominates against Sloth — steal bypasses shields and drains the resources Sloth relies on. Avarice + steal creates a massive HP differential over time. Catch-up cards (Desperate Gambit, Bankruptcy Protection) are powerful when behind. |
| **Threats** | Wrath's burst damage can kill before Greed's steal effects accumulate. Factions with low-resource strategies (spending everything immediately) leave nothing to steal. Debuffs can reduce steal effectiveness. |

**Key Strategic Question:** Can Greed create a large enough resource differential before the opponent's damage overwhelms? The faction rewards calculated aggression and resource awareness.

---

### 4. ENVY (Implemented)

**Identity:** Reactive mirror. Copies, punishes, and debuffs opponents. The embodiment of resentful imitation.

**Passive — Covet:** Gain +1 bonus energy when an opponent plays a card costing 4+. Punishes opponents for playing powerful cards.

**Playstyle:** Reactive control. Envy wants opponents to play powerful cards — then punishes them for it. Compounding debuffs reduce opponent effectiveness over time, while flat mirror effects turn the opponent's strength against them.

| SWOT | Analysis |
|---|---|
| **Strengths** | Reactive design means Envy scales with opponent strength. Debuffs reduce opponent's compounding effect values. Covet passive generates free energy from opponent's big plays. Mirror effects turn opponent's strategy against them. |
| **Weaknesses** | Weak against opponents who play cheap, efficient cards (nothing to mirror or punish). Debuffs are less effective against flat cards (already resolved). No proactive win condition — relies on opponent making plays. |
| **Opportunities** | Dominates against Greed — debuffs reduce steal values, and mirror effects punish Greed's resource-heavy plays. Covet passive thrives against factions that play expensive cards. Compounding debuffs can completely shut down an opponent's strategy. |
| **Threats** | Wrath's self-damage cards don't care about debuffs (Wrath hurts itself anyway). Low-cost aggressive strategies bypass Covet passive entirely. If opponent plays only cheap cards, Envy's reactive tools have nothing to react to. |

**Key Strategic Question:** Can Envy force opponents into a lose-lose situation where playing powerful cards feeds Envy, but playing weak cards loses to Envy's base stats? The faction rewards reading the opponent and adapting.

---

### 5. PRIDE (Upcoming)

**Identity:** Domination amplifier. Gets stronger the more it's winning. The embodiment of supreme confidence.

**Passive — Hubris:** +1 to all effect values when at higher HP than all opponents. Rewards maintaining dominance.

**Playstyle:** Snowball aggressor. Pride wants to take an early lead and amplify it. Compounding effects become even more powerful with the Hubris bonus, creating a runaway advantage. Flat cards provide the initial push to establish dominance.

| SWOT | Analysis |
|---|---|
| **Strengths** | Hubris passive creates a snowball effect — winning makes you win harder. Compounding effects + Hubris bonus = exponential scaling. Strong opening turns establish dominance early. High psychological pressure on opponents. |
| **Weaknesses** | Hubris passive is completely inactive when behind. No catch-up mechanism in the passive itself. Relies on maintaining HP lead, which is fragile. If the lead is lost, Pride becomes a below-average faction. |
| **Opportunities** | Dominates against Sloth in early game — Pride's amplified damage can overwhelm shields before they compound. Hubris + compounding damage creates the fastest kill potential in the game. Psychological advantage forces opponents into suboptimal panic plays. |
| **Threats** | Catch-up cards from any faction can flip the HP lead. Wrath's self-damage-for-power trade doesn't care about Pride's HP lead. Greed's steal effects directly attack the HP differential Pride depends on. Any faction that can survive the early onslaught neutralizes Hubris. |

**Key Strategic Question:** Can Pride establish and maintain dominance long enough for the snowball to become unstoppable? The faction rewards confident, aggressive openers and punishes any stumble.

**Design Notes:** Pride should have 6-7 compounding cards and 5-6 flat cards. Compounding cards should focus on damage and self-buffs. Flat cards should be strong openers that establish the HP lead. Catch-up cards should be weaker than other factions' (thematic: Pride doesn't believe it can lose).

---

### 6. LUST (Upcoming)

**Identity:** Seductive manipulator. Charms opponents into self-destructive behavior. The embodiment of irresistible temptation.

**Passive — Temptation:** When an opponent plays a card against Lust, they take 1 damage (self-harm from desire). Punishes aggression.

**Playstyle:** Attrition punisher. Lust wants opponents to attack — every attack costs the attacker HP. Compounding charm effects force opponents into difficult choices, while flat cards provide burst manipulation.

| SWOT | Analysis |
|---|---|
| **Strengths** | Temptation passive creates a "damned if you do, damned if you don't" dynamic. Opponents take damage for attacking, but take compounding damage for not attacking. Charm effects can redirect opponent's attacks. Strong in multiplayer (multiple opponents = multiple Temptation triggers). |
| **Weaknesses** | Low direct damage output. Relies on opponents attacking to trigger Temptation. Passive is useless against factions that don't target Lust directly. Charm effects are complex and can backfire. |
| **Opportunities** | Dominates against Wrath — Wrath's aggressive nature triggers Temptation constantly, adding to Wrath's self-damage. Compounding charm effects create escalating control over opponent's actions. In multiplayer, Lust becomes the "don't attack me" faction, redirecting aggression elsewhere. |
| **Threats** | Sloth's passive strategy doesn't trigger Temptation (Sloth doesn't attack much). Greed's steal effects don't count as "attacks" for Temptation. Factions that can ignore or bypass Temptation (indirect damage, AoE) neutralize Lust's core mechanic. |

**Key Strategic Question:** Can Lust create enough passive punishment that opponents are forced to choose between attacking (and taking damage) or not attacking (and letting Lust's compounding effects escalate)? The faction rewards psychological warfare and misdirection.

**Design Notes:** Lust should have 5-6 compounding cards and 6-7 flat cards. Compounding cards should focus on charm/redirect effects and heal-over-time. Flat cards should provide burst manipulation and Temptation amplifiers. Cards should have a seductive, alluring theme — not overtly sexual, but irresistibly tempting.

---

### 7. GLUTTONY (Upcoming)

**Identity:** Insatiable consumer. Devours everything — cards, effects, energy — and grows stronger. The embodiment of excess.

**Passive — Devour:** When a compounding effect on Gluttony expires (after 3 rounds), Gluttony heals for 1 HP. Turns enemy DoTs into sustain.

**Playstyle:** Absorption tank. Gluttony wants to be hit by compounding effects — it consumes them for sustain. Its own compounding effects are focused on self-buffs and AoE damage, while flat cards provide burst consumption.

| SWOT | Analysis |
|---|---|
| **Strengths** | Devour passive turns enemy compounding damage into healing. Encourages opponents to use flat cards (which are less efficient long-term). High HP effective total due to passive healing. AoE damage effects hit all opponents in multiplayer. |
| **Weaknesses** | Devour only triggers on compounding effect expiry, not flat damage. Low single-target damage. Slow to get going — needs enemy compounding effects to fuel Devour. Vulnerable to flat burst damage that bypasses Devour entirely. |
| **Opportunities** | Dominates against Envy — Envy's compounding debuffs feed Gluttony's Devour passive. Strong in multiplayer where multiple opponents stack compounding effects. AoE damage becomes increasingly powerful with more players. Late-game Gluttony with multiple Devour triggers is nearly unkillable. |
| **Threats** | Wrath's flat burst damage bypasses Devour entirely. Pride's snowball can kill before Devour accumulates enough healing. Factions that avoid compounding cards deny Gluttony's passive. In 1v1, Devour triggers are limited. |

**Key Strategic Question:** Can Gluttony absorb enough compounding effects to out-heal the damage, while its own AoE pressure slowly grinds opponents down? The faction rewards patience and thrives in multiplayer chaos.

**Design Notes:** Gluttony should have 7-8 compounding cards and 4-5 flat cards. Compounding cards should focus on self-heal, AoE damage, and consumption effects. Flat cards should provide burst absorption and emergency sustain. Cards should have a voracious, consuming theme — devouring, absorbing, growing.

---

## Cross-Faction Matchup Theory

The 7 factions form a complex web of advantages and disadvantages. The design goal is a **non-transitive** balance where no single faction dominates all others:

| Attacker ↓ / Defender → | Wrath | Sloth | Greed | Envy | Pride | Lust | Gluttony |
|---|---|---|---|---|---|---|---|
| **Wrath** | 50/50 | Unfavored | Favored | Favored | Even | Unfavored | Favored |
| **Sloth** | Favored | 50/50 | Unfavored | Even | Unfavored | Even | Unfavored |
| **Greed** | Unfavored | Favored | 50/50 | Unfavored | Even | Favored | Even |
| **Envy** | Unfavored | Even | Favored | 50/50 | Favored | Even | Unfavored |
| **Pride** | Even | Favored | Even | Unfavored | 50/50 | Favored | Unfavored |
| **Lust** | Favored | Even | Unfavored | Even | Unfavored | 50/50 | Favored |
| **Gluttony** | Unfavored | Favored | Even | Favored | Favored | Unfavored | 50/50 |

**Key Matchup Dynamics:**

The matchup web follows a **dual-triangle** structure with cross-links:

**Triangle 1 (Aggression):** Wrath → Envy → Greed → Sloth → Wrath. Wrath's burst overwhelms Envy's reactive setup. Envy's debuffs shut down Greed's steal values. Greed's steal bypasses Sloth's shields. Sloth's shields absorb Wrath's burst.

**Triangle 2 (Control):** Pride → Sloth → Gluttony → Envy → Pride. Pride's snowball overwhelms Sloth's slow start. Sloth's shields deny Gluttony's AoE. Gluttony absorbs Envy's compounding debuffs. Envy's reactive tools punish Pride's expensive power plays.

**Cross-links:** Lust punishes aggression (Wrath, Pride) but struggles against passive strategies (Sloth, Greed). Gluttony thrives against compounding-heavy factions but falls to flat burst.

---

## Card Design Framework

### Value Table by Corruption Cost

Based on the Fibonacci [1, 1, 2] escalation model:

| Cost | Flat Value | Compound Base | Compound Ticks | Compound Total | Balance Ratio |
|---|---|---|---|---|---|
| 0 | 2 | 1 | 1 → 1 → 2 | 4 | 2.00× |
| 1 | 4 | 1 | 1 → 1 → 2 | 4 | 1.00× |
| 2 | 6 | 2 | 2 → 2 → 4 | 8 | 1.33× |
| 3 | 9 | 2-3 | 2 → 2 → 4 to 3 → 3 → 6 | 8-12 | 0.89-1.33× |
| 4 | 12 | 3 | 3 → 3 → 6 | 12 | 1.00× |
| 5 | 16 | 4 | 4 → 4 → 8 | 16 | 1.00× |

**Design Rule:** 0-cost compounding cards are intentionally overpowered (2.00× ratio) because they represent high-risk, low-investment plays. They should always carry a downside (self-damage, debuff, or conditional requirement).

### Deck Composition Guidelines

Each faction has 12 cards with the following recommended split:

| Category | Count | Purpose |
|---|---|---|
| Compounding cards | 6-7 | Core strategy, escalating pressure |
| Flat cards | 3-4 | Tactical responses, burst plays |
| Catch-up cards | 2 | Conditional bonuses when behind on HP |

### Tier Distribution

| Tier | Count per Deck | Corruption Cost Range | Role |
|---|---|---|---|
| Common | 4 | 0-1 | Bread-and-butter plays, always affordable |
| Uncommon | 4 | 2-3 | Mid-game power plays, require resource planning |
| Rare | 2 | 3-4 | High-impact plays, game-changing moments |
| Legendary | 2 | 4-5 | Win conditions, faction-defining power |

---

## Strategic Risk Assessment

**What could break the balance?**

1. **Compounding stacking**: If a player plays multiple compounding cards in consecutive rounds, the combined escalation could overwhelm any defense. Mitigation: energy constraints limit how many compounding cards can be active simultaneously.

2. **Flat burst meta**: If flat cards are consistently more efficient, compounding cards become traps. Mitigation: the 4× total multiplier ensures compounding cards deliver more total value if they complete all 3 rounds.

3. **Passive dominance**: Some passives (Hubris, Devour) could create runaway advantages. Mitigation: passives are conditional — they require specific game states to activate.

4. **Multiplayer imbalance**: Some factions (Lust, Gluttony) scale better in multiplayer. Mitigation: their 1v1 performance is intentionally slightly weaker to compensate.

5. **First-mover advantage**: The player who goes first gets to establish compounding effects earlier. Mitigation: the second player starts with +1 energy to compensate.

---

## Implementation Roadmap

| Phase | Factions | Status |
|---|---|---|
| Phase 1 | Wrath, Sloth | Implemented |
| Phase 2 | Greed, Envy | Implemented |
| Phase 3 | Pride, Lust, Gluttony | Designed (this document) |

**Next Steps:**
1. Implement the Fibonacci [1, 1, 2] compounding formula in all game engines
2. Redesign all 48 existing cards as flat or compounding
3. Rebalance using the value table above
4. Implement Pride, Lust, and Gluttony when ready

---

*This document serves as the single source of truth for faction design, balance decisions, and strategic direction. All card changes should reference this framework.*
