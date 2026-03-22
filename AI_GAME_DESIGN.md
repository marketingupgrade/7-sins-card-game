# AI Game Design Document: The Living Cathedral

## Vision Statement

Transform the 7 Deadly Sins card game from a strategic multiplayer card game into **the first card game with a living, breathing AI soul** — a game that watches you play, learns your sins, whispers temptations, remembers grudges, and tells your story in real-time. No card game has ever done this. Hearthstone has scripted emotes. MTG Arena has canned animations. We will have a **sentient narrator that knows your name, your patterns, and your weaknesses**.

---

## Three AI Pillars

### Pillar 1: The Living Narrator (Emergent Storytelling Engine)

**Inspiration**: Hades' contextual dialogue system + Disco Elysium's internal voices + Shadow of Mordor's Nemesis System

**What it is**: Replace the current static narrator quip system with an LLM-powered narrator that generates unique, contextual commentary in real-time based on the actual game state. The narrator doesn't just say random lines — it **watches the game unfold and tells the story of what's happening**.

**What makes it unprecedented**: No multiplayer card game has ever had a narrator that:
- Calls out specific plays by name ("Ah, {player} plays Hellfire Cascade for the third time. Predictable. Boring. The arena yawns.")
- Tracks rivalries across rounds ("Round 14, and {player1} attacks {player2} AGAIN. This isn't strategy anymore — this is personal.")
- Remembers history across the entire match ("Remember Round 3, when {player} had 280 HP and felt invincible? Look at them now. 47 HP. How the mighty have fallen.")
- Generates dramatic play-by-play during resolution ("The cards are revealed... {player1} swings with Wrath's Fury for 45 damage! But wait — {player2} had Sloth's Shield ready. Only 12 gets through. The crowd gasps.")

**Behavioral Science Hooks** (Octalysis):
- **CD7 (Unpredictability & Curiosity)**: Players never know what the narrator will say. Each game generates unique commentary, creating a "what will it say next?" dopamine loop.
- **CD5 (Social Influence)**: The narrator creates shared moments. "Did you hear what it said about your play?" becomes a social bonding mechanism.
- **CD1 (Epic Meaning)**: The narrator frames every match as an epic battle between sinners, elevating mundane card plays into dramatic narrative moments.

**Implementation**: Server-side LLM call at key game moments (round start, card reveal, big damage, elimination, game end). Cached and streamed to all players simultaneously.

---

### Pillar 2: The Sin Whisperer (AI Temptation System)

**Inspiration**: Disco Elysium's skill voices + The Stanley Parable's narrator manipulation + Nir Eyal's Hook Model

**What it is**: A private, per-player AI voice that whispers strategic temptations during the card selection phase. Unlike the public narrator, the Sin Whisperer speaks only to YOU, and its personality is shaped by your chosen faction's deadly sin.

**Examples by faction**:
- **Wrath**: "They hit you for 38 last round. Are you going to take that? Play Inferno. Make them BURN."
- **Greed**: "You have 4 Corruption Energy. You could play it safe... or you could spend it ALL on Golden Hoard and take everything."
- **Sloth**: "Why bother attacking? Just play your shields. Let them exhaust themselves. You'll be the last one standing."
- **Pride**: "You're in first place. They're all beneath you. Play Crown of Thorns and remind them who rules this arena."
- **Envy**: "Look at {rival}'s HP. 180. Yours is 95. That's not fair, is it? Mirror Strike would fix that."
- **Lust**: "That Charm card... play it. Watch them waste their strongest attack on each other instead of you."
- **Gluttony**: "You're low on HP, but Devour would heal you AND damage them. Take. More. Always more."

**What makes it unprecedented**: No card game has ever had an AI that:
- Acts as a faction-specific strategic advisor with personality
- Actively tempts you toward risky plays aligned with your sin
- Creates an emotional relationship between the player and their faction
- Generates different advice for every game state, every round, every player

**Behavioral Science Hooks**:
- **CD3 (Creativity & Feedback)**: The Whisperer reacts to YOUR choices, making you feel like the game is alive and responsive to your decisions.
- **CD4 (Ownership & Possession)**: "MY Whisperer said..." creates a sense of personal ownership over the AI's advice.
- **CD8 (Loss Avoidance)**: The Whisperer frames inaction as loss ("If you don't play Hellfire now, you'll regret it when they attack next round").
- **Hook Model**: Trigger (whisper appears) → Action (read it) → Variable Reward (sometimes brilliant advice, sometimes hilariously bad temptation) → Investment (following the advice creates emotional stakes in the outcome).

**Implementation**: Server-side LLM call during selection phase. Private to each player. Short (1-2 sentences). Personality prompt per faction.

---

### Pillar 3: The Adaptive Nemesis (AI Memory & Rivalry System)

**Inspiration**: Shadow of Mordor's Nemesis System + Hades' relationship tracking + Autoresearch's metric-driven optimization

**What it is**: The game AI tracks player behavior patterns across the match and uses them to create emergent rivalries, grudges, and storylines. The narrator references these dynamics, and the Sin Whisperer exploits them.

**Tracked behaviors**:
- Who attacks whom most often (rivalry detection)
- Aggressive vs defensive play patterns
- Comeback moments (was losing, now winning)
- Betrayal moments (attacked someone who wasn't attacking them)
- Repeated card choices (predictability)
- Risk tolerance (how often they play high-cost cards)

**Emergent narratives the system generates**:
- "The Rivalry": When two players repeatedly target each other, the narrator escalates: "Round 8: The blood feud between {Wrath} and {Pride} continues. Neither will yield. Neither will survive."
- "The Underdog": When a low-HP player makes a comeback: "Against all odds, {Sloth} rises from the ashes. 47 HP and still breathing. The arena holds its breath."
- "The Betrayal": When a player switches targets unexpectedly: "{Greed} turns their blade on {Envy}! After 6 rounds of ignoring them! The arena erupts!"
- "The Coward": When a player only plays defensive cards: "Round after round, {Sloth} hides behind shields. The crowd grows restless. Even sin requires courage."

**Autoresearch Application** (Karpathy Loop):
- **Modifiable file**: The narrator's system prompt and personality parameters
- **Metric**: Player engagement (measured by return rate, match completion rate, and a post-game "was the narrator entertaining?" thumbs up/down)
- **Evaluation harness**: After each match, log the narrator's outputs and the engagement metric. Over time, the system prompt can be iteratively refined to maximize entertainment value.

**Implementation**: Game state analysis at each round boundary. Behavioral patterns stored in memory for the duration of the match. Fed into narrator and whisperer prompts as context.

---

## Technical Architecture

### LLM Integration Points

| Moment | AI System | Visibility | Max Tokens | Latency Budget |
|--------|-----------|------------|------------|----------------|
| Round Start | Living Narrator | All players | 60 | 3s |
| Selection Phase | Sin Whisperer | Per player (private) | 40 | 2s |
| Card Reveal | Living Narrator | All players | 80 | 3s |
| Big Damage (>30) | Living Narrator | All players | 50 | 2s |
| Player Eliminated | Living Narrator | All players | 60 | 3s |
| Game Over | Living Narrator | All players | 100 | 5s |

### Prompt Architecture

Each LLM call receives a structured context object:

```
{
  "match_context": {
    "round": 14,
    "total_rounds": 20,
    "players": [
      { "name": "Player1", "faction": "Wrath", "hp": 180, "corruption": 3 },
      { "name": "Player2", "faction": "Sloth", "hp": 47, "corruption": 5 }
    ],
    "round_history": [...last 3 rounds of plays and damage],
    "rivalries": [{ "attacker": "Player1", "target": "Player2", "times": 6 }],
    "behavioral_tags": {
      "Player1": ["aggressive", "predictable", "rivalry_with_Player2"],
      "Player2": ["defensive", "underdog", "comeback_potential"]
    }
  },
  "trigger": "card_reveal",
  "trigger_data": { ... }
}
```

### Cost Management

- Use the built-in Forge API (already available via `BUILT_IN_FORGE_API_KEY`)
- Cache narrator outputs per round (all players see the same narrator line)
- Sin Whisperer calls are per-player but short (40 tokens max)
- Estimated cost per 20-round match: ~$0.02-0.05 (negligible)
- Fallback: If LLM call fails or times out, fall back to the existing static narrator quip system

### Toggle System

- All AI features are toggleable per-lobby by the host
- Three modes: "AI Narrator ON/OFF", "Sin Whisperer ON/OFF", "Classic Mode" (no AI)
- This respects player autonomy (Octalysis CD3) and prevents AI fatigue

---

## Implementation Priority

1. **Living Narrator** (highest impact, shared experience, creates "wow" moments)
2. **Sin Whisperer** (personal engagement, faction identity, strategic depth)
3. **Adaptive Nemesis** (emergent storytelling, requires narrator + whisperer to be most effective)

All three systems share the same game state analysis infrastructure, so building #1 creates the foundation for #2 and #3.
