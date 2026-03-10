# Octalysis Behavioral Audit — 7 Deadly Sins Card Game

## Executive Summary

This audit evaluates the 7 Deadly Sins Card Game through the lens of Yu-kai Chou's Octalysis Framework, analyzing all 8 Core Drives of human motivation. The game currently scores well on **CD1 (Epic Meaning)**, **CD3 (Creativity & Feedback)**, **CD7 (Unpredictability)**, and **CD8 (Loss Avoidance)**, but has significant gaps in **CD2 (Accomplishment)**, **CD4 (Ownership)**, **CD5 (Social Influence)**, and **CD6 (Scarcity)**. The audit provides prioritized, actionable recommendations to strengthen engagement across all drives.

---

## Current Octalysis Scores (0–10)

| Core Drive | Score | Assessment |
|---|---|---|
| CD1: Epic Meaning & Calling | 7 | Strong — 7 Deadly Sins theme, faction identity, sassy narrator |
| CD2: Development & Accomplishment | 3 | Weak — no progression, no stats, no achievements |
| CD3: Empowerment of Creativity & Feedback | 7 | Strong — 4 factions, multi-card combos, strategic depth |
| CD4: Ownership & Possession | 2 | Very Weak — no persistent collection, no deck customization |
| CD5: Social Influence & Relatedness | 2 | Very Weak — single-player vs bots only, no social features |
| CD6: Scarcity & Impatience | 4 | Moderate — energy system creates resource tension |
| CD7: Unpredictability & Curiosity | 7 | Strong — card draw RNG, compounding escalation, catch-up swings |
| CD8: Loss & Avoidance | 6 | Good — HP loss, elimination threat, Wrath self-damage risk |

**Total Octalysis Score: 228 / 640** (estimated, using weighted scoring)

---

## Detailed Analysis by Core Drive

### CD1: Epic Meaning & Calling — Score: 7/10

**What's working:**
- The 7 Deadly Sins theme is inherently epic and mythological, giving players a sense of embodying primal forces
- Faction identity (Wrath, Sloth, Greed, Envy) creates a strong "calling" — players feel they ARE their sin
- The sassy narrator provides a sense of being watched by a higher power, adding narrative weight
- Card flavor text reinforces the sin fantasy ("Rage doesn't care who it hurts. Even you.")

**What's missing:**
- No overarching narrative arc across games (why are the sins fighting?)
- No "Humanity Hero" element — players don't feel they're contributing to something larger
- No "Beginner's Luck" moment — first game feels the same as the 100th

**Recommendations (Quick Wins):**
1. Add a brief lore intro on the Home page: "The Seven Deadly Sins have awakened. Only one can claim dominion over the mortal realm."
2. Add a "first win" celebration with special narrator dialogue
3. Show a faction loyalty counter: "You've embodied Wrath 12 times"

---

### CD2: Development & Accomplishment — Score: 3/10

**What's working:**
- Round progression (R1–R10) gives a sense of advancing through a match
- Compounding effects escalate visibly (1×→1×→2×), showing growth within a game
- Win/loss screen with final standings provides closure

**What's missing (CRITICAL GAP):**
- No persistent progression system — every game starts from zero
- No achievements or milestones
- No player stats (games played, win rate, favorite faction, total damage dealt)
- No leaderboard or ranking system
- No skill-based matchmaking or difficulty scaling

**Recommendations (High Priority):**
1. **Add a Stats Dashboard** — track games played, wins, losses, win rate per faction, total damage dealt, total healing done, most-used cards
2. **Add Achievements** — "Deal 100 damage in a single game", "Win with all 4 factions", "Survive with 1 HP", "Play 10 compounding effects in one game"
3. **Add a Win Streak counter** — displayed on the Home page with narrator commentary
4. **Add post-game XP/level system** — even cosmetic levels give a sense of progression

---

### CD3: Empowerment of Creativity & Feedback — Score: 7/10

**What's working:**
- 4 distinct factions with unique playstyles enable strategic diversity
- Multi-card per turn system allows creative combos (Overcharge → Vendetta → Last Stand)
- Flat vs Compounding card types create meaningful strategic choices
- Catch-up mechanics reward creative play from behind
- Energy management adds another layer of decision-making
- Immediate visual feedback on card plays (HP changes, effect badges, narrator quips)

**What's missing:**
- No deck customization — players get a fixed set of 12 cards per faction
- No "sandbox" mode to experiment with card combinations
- Limited feedback on WHY a strategy worked or failed (no post-game analysis)

**Recommendations (Medium Priority):**
1. **Add a post-game summary** — "You dealt 47 damage, healed 12 HP, played 8 compounding effects. Your Vendetta dealt the killing blow!"
2. **Add card combo discovery** — when certain card combinations are played, show a "COMBO!" indicator with bonus narrator commentary
3. Future: deck-building mode where players choose 8 of 12 cards before a match

---

### CD4: Ownership & Possession — Score: 2/10

**What's working:**
- Faction selection gives a sense of "this is MY sin"
- Username personalization

**What's missing (CRITICAL GAP):**
- No persistent card collection
- No customization (card backs, avatars, themes)
- No "Build From Scratch" experience
- No investment that carries between games

**Recommendations (Medium Priority):**
1. **Add faction affinity tracking** — "You are a Wrath Main. 15 games played, 60% win rate."
2. **Add a match history** — players can revisit past games and see their performance
3. Future: unlockable card backs or narrator voice packs per faction

---

### CD5: Social Influence & Relatedness — Score: 2/10

**What's working:**
- Multiplayer infrastructure exists (room codes, Supabase realtime)
- Bot opponents have personality (names like "LazyAlgorithm", "BufferOverlord")

**What's missing (CRITICAL GAP):**
- No real multiplayer is actively used — game is effectively single-player vs bots
- No social sharing of wins/achievements
- No spectator mode
- No chat or emotes during gameplay
- No friend system or rematch functionality

**Recommendations (Medium Priority):**
1. **Add quick emotes during gameplay** — 4-6 themed emotes per faction ("😈 Wrath: BURN!", "😴 Sloth: *yawns*", "💰 Greed: MINE!", "👀 Envy: Nice card...")
2. **Add a "Share Result" button** on the game-over screen — generates a shareable image with final standings
3. **Add "Rematch" button** — one-click to start a new game with the same players/bots

---

### CD6: Scarcity & Impatience — Score: 4/10

**What's working:**
- Energy system creates resource scarcity within each turn
- Compounding effects create "appointment dynamics" — you know a big tick is coming in 2 rounds
- 10-round time limit creates urgency in the late game
- Rare and Epic card tiers suggest scarcity

**What's missing:**
- No limited-time events or challenges
- No daily/weekly rewards
- Card rarity doesn't actually affect availability (all cards are always in the deck)

**Recommendations (Low Priority — would require significant new systems):**
1. **Add a "Daily Challenge"** — "Win a game as Envy without using any Rare cards" with a unique narrator reward line
2. **Make the round timer more visible** — add a pulsing urgency effect in rounds 8-10
3. Add "Evanescent Opportunity" cards — powerful cards that appear randomly but must be played THIS turn or they vanish

---

### CD7: Unpredictability & Curiosity — Score: 7/10

**What's working:**
- Card draw randomness creates natural unpredictability
- Compounding effect escalation creates "what will happen next?" tension
- Catch-up mechanics create dramatic reversals
- Bot behavior is somewhat unpredictable
- Narrator quips vary based on game events, creating curiosity about what the narrator will say next
- Different faction matchups create varied game experiences

**What's missing:**
- No "mystery" cards or hidden information
- No random events during gameplay
- Card draws are invisible to opponents (no tension from watching someone draw)

**Recommendations (Quick Wins):**
1. **Add a "Critical Hit" mechanic** — 10% chance for any damage card to deal 1.5× damage, with a special animation and narrator reaction
2. **Add narrator "predictions"** at the start of each round — "I predict BufferOverlord won't survive this round..." (sometimes wrong, adding humor)
3. **Show a card draw animation** when opponents draw — builds anticipation

---

### CD8: Loss & Avoidance — Score: 6/10

**What's working:**
- HP loss is visceral and visible (red HP bars, damage animations)
- Elimination is permanent — dead players watch the rest of the game
- Wrath's self-damage mechanic creates constant "am I going to kill myself?" tension
- Compounding debuffs create escalating dread (DoT ticking up each round)
- Shield mechanics create "protect what I have" behavior
- Round 10 time limit creates "don't waste turns" pressure

**What's missing:**
- No persistent losses between games (nothing at stake beyond the current match)
- No "streak" to protect
- Dead players have nothing to do (no spectator engagement)

**Recommendations (Quick Wins):**
1. **Add a "Win Streak" system** — visible on the Home page, creates something to protect
2. **Add spectator features for eliminated players** — let them see all hands, bet on the winner, or send emotes
3. **Add a "Last Stand" narrator moment** when a player drops below 5 HP — dramatic music shift, screen effects

---

## Priority Matrix

| Priority | Recommendation | Core Drive | Effort |
|---|---|---|---|
| **P0** | Stats Dashboard (games, wins, faction stats) | CD2 | Medium |
| **P0** | Post-game summary with key moments | CD3 | Low |
| **P1** | Achievement system (10-15 achievements) | CD2 | Medium |
| **P1** | Win Streak counter on Home page | CD2, CD8 | Low |
| **P1** | Quick emotes during gameplay | CD5 | Medium |
| **P1** | Rematch button on game-over screen | CD5 | Low |
| **P2** | Faction affinity tracking | CD4 | Low |
| **P2** | Share Result button | CD5 | Medium |
| **P2** | Narrator predictions per round | CD7 | Low |
| **P2** | Critical Hit mechanic (10% chance) | CD7 | Medium |
| **P3** | Daily Challenge system | CD6 | High |
| **P3** | Spectator features for dead players | CD8 | High |
| **P3** | Lore intro on Home page | CD1 | Low |

---

## White Hat vs Black Hat Balance

The game currently leans **White Hat** (CD1, CD3 are strong), which is good for long-term satisfaction. The Black Hat drives (CD6, CD7, CD8) are moderately present through the energy system, card randomness, and HP loss mechanics. This is a healthy balance for a card game.

**Recommendation:** Strengthen CD2 (Accomplishment) as the highest priority — it's the bridge between White Hat satisfaction and Black Hat urgency. Players who feel they're progressing (White Hat) while protecting their streak (Black Hat) have the strongest engagement loop.

---

## Top 3 Quick Wins for This Sprint

1. **Post-game summary** — Show damage dealt, healing done, cards played, and a "MVP moment" after each game
2. **Win Streak counter** — Display on Home page with narrator commentary ("3 wins in a row? Don't let it go to your head.")
3. **Rematch button** — One-click to replay with same setup, reducing friction to re-engage
