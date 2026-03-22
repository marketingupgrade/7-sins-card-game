# 7 Deadly Sins Card Game — UX & Game Design Audit Report

**Author:** Manus AI  
**Date:** March 22, 2026  
**Version:** v6.3.0 baseline  

---

## Executive Summary

This audit evaluates the 7 Deadly Sins card game against established UX heuristics (Nielsen's 10 Heuristics [1], Hick's Law [2], Miller's Law [3], Fitts's Law [4]) and game design frameworks (Cognitive Load Theory applied to games [5], Flow Theory [6], and the Game UX premium audit checklist [7]). The game has exceptional visual craft — the gothic cathedral aesthetic, faction portraits, holographic card shaders, and compound VFX are AAA-quality. However, the **strategic layer is almost entirely invisible to players**. The core problem is not a lack of information, but a lack of *decision-relevant* information presented at the moment of choice.

The audit identifies **15 issues across 3 severity tiers**, with the top 5 fixes projected to transform the game from "beautiful but confusing" to "beautiful and deeply strategic."

---

## Methodology

Each screen was evaluated against the following frameworks:

| Framework | Application |
|-----------|-------------|
| Nielsen's 10 Usability Heuristics [1] | Visibility of system status, match between system and real world, user control, consistency, error prevention, recognition over recall, flexibility, aesthetic design, error recovery, help & documentation |
| Hick's Law [2] | Decision time increases logarithmically with the number of choices — are choices well-structured? |
| Miller's Law [3] | Working memory holds 7±2 items — is information chunked appropriately? |
| Fitts's Law [4] | Time to reach a target is a function of distance and size — are interactive elements properly sized and positioned? |
| Cognitive Load Theory (Hodent) [5] | Intrinsic load (game complexity), extraneous load (UI friction), germane load (learning) — is extraneous load minimized? |
| Flow Theory (Csikszentmihalyi) [6] | Balance between challenge and skill, clear goals, immediate feedback — does the game maintain flow state? |

---

## Critical Issues (P0) — Block Strategic Depth

These issues prevent players from making informed strategic decisions, which is the core purpose of a card game.

### 1. Card Effect Values Are Cryptic — No Contextual Math

**Screen:** GameBoard (cards in hand)  
**Heuristics violated:** Visibility of system status, Recognition over recall [1]

Cards display effect values as "Hurt 15→120" but provide no context for what this means in practice. Players cannot determine how many rounds the effect lasts, what the total cumulative damage will be, or what percentage of an opponent's HP (333) this represents. The arrow notation implies a range but does not communicate the growth trajectory or total output. This forces players into mental arithmetic during time-pressured turns, violating Cognitive Load Theory's principle of minimizing extraneous load [5].

**Recommended fix:** Display total cumulative value, duration in rounds, and a percentage-of-HP indicator directly on the card. For example: "Hurt: 15/rd for 5 rounds (Total: 270 = 81% HP)". This transforms an opaque number into an actionable strategic signal.

### 2. Compound Patterns Are Incomprehensible During Play

**Screen:** GameBoard (cards in hand)  
**Heuristics violated:** Match between system and real world, Help & documentation [1]

Compound patterns (Standard ◆, Volatile 🔥, Patient ⌛) are the game's most important strategic mechanic — they determine whether damage front-loads, back-loads, or scales exponentially. However, the symbols are tiny, abstract, and require a hover tooltip to explain. On mobile, this tooltip is entirely inaccessible. The tooltip itself contains mathematical formulas ("Fibonacci scaling: 1×, 1×, 2×, 3×, 5×...") that require mathematical literacy to parse, violating the principle of matching system language to user language [1].

**Recommended fix:** Replace abstract symbols with inline mini-sparkline graphs showing the growth curve visually. Add a "value at current round" indicator that updates dynamically. This converts an abstract mathematical concept into a visual pattern that players can compare at a glance — leveraging preattentive visual processing [5].

### 3. No Round-Aware Card Valuation

**Screen:** GameBoard  
**Heuristic violated:** Visibility of system status [1]

Card values change dramatically based on when they are played. A Slowburn card played in round 1 will tick for 5 rounds and deal exponentially more total damage than the same card played in round 5 (which may only tick once before the game ends). However, nothing in the UI communicates this temporal dimension. Players have no way to evaluate "is this card good *right now*?" versus "should I save it for later?" This is the single largest barrier to strategic play.

**Recommended fix:** Add a dynamic "round value" indicator on each card showing its projected total output if played this round, with color coding: green for optimal timing, amber for acceptable, red for suboptimal. This single change would transform card selection from guesswork into strategy.

### 4. Active Effects on Opponents Are Unreadable

**Screen:** GameBoard (PlayerPanel effect badges)  
**Heuristics violated:** Visibility of system status, Recognition over recall [1]

Effect badges on player panels show tiny icons with no values or duration. Players cannot see how much damage is ticking on each opponent, how many rounds remain on each effect, or whether their strategy is working (are my effects outpacing their healing?). The badges collapse to "+3 more" on non-hovered panels, hiding critical information. This violates Miller's Law [3] — instead of chunking information meaningfully, it hides it entirely.

**Recommended fix:** Show effect value and remaining ticks on each badge (e.g., "🔥 45/rd × 3"). Add a "net damage per round" summary line on each player panel showing the aggregate tick damage minus healing. This gives players a single number to evaluate board state.

### 5. No Strategic Decision Support

**Screen:** GameBoard  
**Heuristic violated:** Help users recognize, diagnose, and recover from errors [1]

Even with the GameCoach tips (which are excellent for first-game onboarding), there is no ongoing decision support for evaluating play options. Players face questions like "Should I play 2 cheap cards or 1 expensive card?", "Should I target the low-HP player or the one with shields?", and "Is it better to heal myself or damage the leader?" — but the UI provides no framework for answering them. This is where Flow Theory [6] breaks down: without clear goals and feedback, players cannot enter a flow state.

**Recommended fix:** Add an optional "Strategy Lens" toggle (off by default for experienced players) that shows a brief tactical evaluation of the top 2-3 plays when activated. This bridges the gap between "I understand the rules" and "I understand the strategy."

---

## High Issues (P1) — Significantly Hurt Comprehension

### 6. Energy System Lacks Forward Visibility

The energy orb display is visually polished but provides no indication of next-turn energy income, energy efficiency ratios on cards, or warnings about wasted unspent energy. Players cannot plan ahead because they do not know their future resource state.

### 7. Target Selection Has No Strategic Context

When selecting a target, players see HP bars but no threat assessment — no indication of which opponent is dealing the most damage, who has the most active effects, or what the consequences of targeting each player would be (especially considering faction passives like Wrath's Vengeance).

### 8. Passive Abilities Are Buried in Tooltips

Passive abilities are the core faction differentiator but are only visible as a tiny tooltip on the sin name label. Players routinely forget what their own passive does, and have no way to see opponent passives during the critical targeting phase.

### 9. Balance Sheet Is Hidden Behind a Button

The Compound Balance Sheet — the single most important strategic information panel showing all active effects — requires clicking a button to open a modal. This information should be accessible at a glance, not hidden behind an interaction.

### 10. Mobile Card Interaction Model Is Ambiguous

The tap-to-select / second-tap-to-zoom interaction model has no visual affordance. Unaffordable cards look identical to "not your turn" cards, and there is no explanation of *why* a card cannot be played.

---

## Medium Issues (P2) — Hurt Polish and Comprehension

### 11. Lobby SWOT Grid Is Hover-Only (Inaccessible on Mobile)

Faction strengths, weaknesses, opportunities, and threats are hidden behind a hover interaction that does not exist on touch devices, making this strategic information completely inaccessible to mobile players.

### 12. No Turn Phase Indicator

The game has distinct phases (selection, resolution, round end) but no visual timeline or progress indicator. Players rely on text cues ("Pick your cards" vs "The sins are clashing") which are easy to miss.

### 13. Flavor Text Competes with Mechanics During Gameplay

Card descriptions contain atmospheric flavor text that occupies space that could display mechanical information. During active gameplay, players need mechanics, not narrative.

### 14. Hand Sorting Defaults to Draw Order

The default "Draw" sort provides no strategic value. The "Smart" sort mode — which is the most useful for new players — requires discovery and manual activation.

### 15. No Win Condition Visibility

Players have no compact view of their standing relative to other players. There is no "players remaining" count, no ranking indicator, and no proximity-to-victory/defeat signal.

---

## Prioritized Implementation Plan

The following table ranks fixes by impact-to-effort ratio, focusing on changes that most directly enable strategic play:

| Priority | Fix | Impact | Effort | Description |
|----------|-----|--------|--------|-------------|
| 1 | Card Value Calculator | Critical | Medium | Show total damage, duration, % HP on cards |
| 2 | Compound Sparklines | Critical | Medium | Inline mini-graphs showing growth curves |
| 3 | Active Effects Dashboard | High | Medium | Always-visible effect summaries on player panels |
| 4 | Passive Ability Reminders | High | Low | Persistent passive indicators + targeting context |
| 5 | Turn Phase Timeline | Medium | Low | Visual phase progression bar |

---

## References

[1]: https://www.nngroup.com/articles/ten-usability-heuristics/ "Nielsen's 10 Usability Heuristics for User Interface Design"
[2]: https://www.nngroup.com/articles/hicks-law/ "Hick's Law: Making the choice easier for users"
[3]: https://www.nngroup.com/articles/chunking/ "Miller's Law and Chunking in UX Design"
[4]: https://www.nngroup.com/articles/fitts-law/ "Fitts's Law and Its Applications in UX"
[5]: https://www.routledge.com/The-Gamers-Brain/Hodent/p/book/9781498775502 "The Gamer's Brain: How Neuroscience and UX Can Impact Video Game Design"
[6]: https://www.harpercollins.com/products/flow-mihaly-csikszentmihalyi "Flow: The Psychology of Optimal Experience"
[7]: /home/ubuntu/skills/game-design/yaml/checklists/premium_audit.yaml "Premium Game Design Audit Checklist"
