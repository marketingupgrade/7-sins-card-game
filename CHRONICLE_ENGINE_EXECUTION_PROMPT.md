# Chronicle Engine: Refined Design and Execution Prompt

**Author: Joris van Huet, Founder Causality Engine**

**Version 2.0 | March 2026**

---

## Design Refinements from Skill Analysis

After applying the `/prompt_engineering`, `/game-design`, and `/behavioral-sciences` frameworks to the original Chronicle Engine design, several critical improvements emerged. This document captures those refinements and provides the complete execution prompt for implementation.

### Refinement 1: Prompt Chaining over Monolithic Generation

The original design proposed a single LLM call per round. The prompt engineering skill's **Prompt Chaining** pattern [1] reveals this is suboptimal. A single prompt that must simultaneously (a) interpret game events, (b) translate them to historical context, (c) maintain narrative continuity, and (d) produce literary prose will produce mediocre results on all four axes.

**The fix:** Split the narrative pipeline into a 3-stage chain per round:

| Stage | Input | Output | Model Constraint |
|-------|-------|--------|-----------------|
| **Stage 1: Event Translator** | Raw game events (cards played, damage, HP changes) | Structured historical events in JSON (who did what to whom, mapped to era) | Deterministic, low temperature (0.1) |
| **Stage 2: Continuity Checker** | Previous chronicle context + new historical events | Updated chronicle context with continuity notes (what to reference, what to avoid contradicting) | Analytical, medium temperature (0.3) |
| **Stage 3: Prose Writer** | Era context + historical events + continuity notes | 2-3 sentence literary narrative segment | Creative, high temperature (0.8) |

This separation follows the **RISE framework** (Role, Input, Steps, Expectation) and ensures each LLM call has a single, well-defined job. The Event Translator never hallucinates because it works from structured data. The Continuity Checker never produces bad prose because it only outputs notes. The Prose Writer never contradicts earlier events because it receives explicit continuity constraints.

### Refinement 2: Curated Randomness (The Spelunky Principle)

The game design skill's procedural generation reference warns against the **"10,000 Bowls of Oatmeal" problem** [2]: if every chronicle reads like generic AI prose, the feature loses its magic after three matches. The solution, borrowed from Spelunky's level design, is **curated randomness**: hand-authored templates constrained by authored rules, with AI filling in the specifics.

**The fix:** Create a library of **Era Templates** with hand-written narrative anchors. Each era has 3-5 pre-authored "seed sentences" that the AI must weave into its generation. These seeds provide literary quality that pure generation cannot match, while the AI provides the personalization.

**Example for Round 8 (Renaissance):**

```
SEED_SENTENCES = [
  "The {dominant_faction} built towers that scraped the heavens, as if height alone could close the distance between mortal ambition and divine indifference.",
  "In the workshops of the {city_name}, artisans discovered that beauty and violence share the same patron.",
  "The {defeated_faction}'s libraries burned for {ordinal} time in {era_span} centuries."
]
```

The AI selects and adapts 1-2 seeds per round, filling in the variables from game state, then generates 1-2 original sentences around them. This guarantees a quality floor while preserving uniqueness.

### Refinement 3: The Evaluator-Optimizer Loop for Chronicle Assembly

The original design proposed a single LLM call to assemble the final chronicle from 20 round segments. The prompt engineering skill's **Evaluator-Optimizer** pattern [3] provides a better approach: generate the chronicle, then have a second LLM pass evaluate it against explicit quality criteria, then refine.

**The fix:** The post-game chronicle assembly becomes a 2-pass process:

**Pass 1 (Generator):** Assemble all 20 round segments + game outcome into a cohesive 800-1200 word narrative. The prompt uses the **CO-STAR framework**:

| Element | Value |
|---------|-------|
| **Context** | 20 round narrative segments from a competitive card game mapped to human civilization |
| **Objective** | Produce a cohesive alternate history document that reads like a published short story |
| **Style** | Literary historical fiction, in the tradition of Yuval Noah Harari's "Sapiens" meets Jorge Luis Borges |
| **Tone** | Epic, slightly sardonic, with moments of dark humor |
| **Audience** | Gamers who appreciate good writing and want to share something impressive |
| **Response** | 800-1200 words, structured with an opening myth, rising action, turning point, and legacy conclusion |

**Pass 2 (Evaluator):** A second LLM call reviews the generated chronicle against these criteria:

1. **Continuity**: Does the narrative contradict any established events from earlier rounds?
2. **Dramatic Arc**: Does the story have a clear turning point and satisfying conclusion?
3. **Player Recognition**: Would each player recognize their faction's actions in the narrative?
4. **Literary Quality**: Does the prose avoid generic AI patterns ("In a world where...", "Little did they know...")?
5. **Shareability**: Does the chronicle contain at least one sentence so good that a player would want to quote it?

If the evaluator scores below threshold on any criterion, it provides specific revision notes and the generator runs again. Maximum 2 iterations to control latency and cost.

### Refinement 4: Ludonarrative Resonance (The Hades Principle)

The game design skill's narrative design reference emphasizes **ludonarrative resonance** [4]: the mechanics and narrative must reinforce each other. The original Chronicle Engine design risks ludonarrative dissonance if the narrative feels disconnected from the actual gameplay decisions.

**The fix:** Every narrative segment must contain at least one **mechanical echo**, a sentence that directly references a specific card play, damage number, or strategic decision. Players must be able to point at a sentence and say "that happened because I played Infernal Strike."

**Example of mechanical echo:**

> "The Wrathful Horde's assault on the Prideful capital cost 23 lives for every library shelf destroyed, a ratio that historians would later call 'efficient.'"

The number 23 maps directly to the 23 damage dealt that round. The "library shelf" maps to the Pride faction's cultural identity. The player sees their actual game action reflected in the narrative, creating the same resonance that Hades achieves when NPCs comment on your specific death.

### Refinement 5: Variable Reward Schedule for Chronicle Quality

The behavioral sciences skill's **variable ratio reinforcement** principle [5] suggests that chronicles should not all be equally good. If every chronicle is a 7/10, players habituate and stop caring. If most are 6/10 but occasionally one is a 9/10, the dopamine response is stronger.

**The fix:** Introduce **Chronicle Rarity Tiers** based on match characteristics:

| Tier | Trigger Condition | Narrative Enhancement |
|------|-------------------|----------------------|
| **Common** | Standard match, no special conditions | Standard 3-stage pipeline |
| **Rare** | A player was eliminated before Round 10 | "The Fall of X" subplot woven through the chronicle |
| **Epic** | A comeback occurred (player went from lowest HP to winning) | Extended turning point section with dramatic irony |
| **Legendary** | Final round decided by less than 5 HP difference | The chronicle is written from the perspective of a fictional historian looking back 1000 years later |

Players don't know the tier system exists. They just notice that some chronicles are noticeably better than others, and they can't predict which matches will produce the best stories. This is the slot machine effect applied to narrative quality.

### Refinement 6: The "Civilization Personality" Emergent System

The game design skill's systems design reference emphasizes **emergent gameplay** from simple interacting rules [6]. The Chronicle Engine should not just narrate events; it should track and surface the emergent "personality" of the civilization being created.

**The fix:** Track three civilization metrics across all 20 rounds:

| Metric | Increases When | Decreases When | Narrative Effect |
|--------|---------------|----------------|-----------------|
| **Militarism** (0-100) | Wrath/Pride deal damage | Sloth/Lust play defensive cards | War-heavy language, conquest metaphors |
| **Culture** (0-100) | Lust/Pride play buff cards | Wrath/Gluttony deal AoE damage | Artistic references, philosophical tone |
| **Commerce** (0-100) | Greed/Envy steal or gain resources | Any player is eliminated | Economic language, trade metaphors |

At the end of the match, the dominant metric determines the civilization's "type" and influences the chronicle's conclusion:

| Dominant Metric | Civilization Type | Conclusion Tone |
|----------------|-------------------|-----------------|
| Militarism > 60 | Warrior Empire | "They conquered everything. They understood nothing." |
| Culture > 60 | Enlightened Republic | "They built beauty on a foundation of bones." |
| Commerce > 60 | Merchant Federation | "They put a price on everything, including their own souls." |
| No dominant | Balanced Civilization | "They were, in the end, merely human." |

This creates a systems-driven narrative outcome that feels authored but is actually emergent, the exact design principle behind Breath of the Wild's "chemistry engine."

---

## The Complete Execution Prompt

Below is the production-ready execution prompt for implementing the Chronicle Engine. This prompt is structured using XML tags following prompt engineering best practices [7] and is designed to be handed directly to the implementing agent.

---

```xml
<execution_prompt>
<role>
You are a senior full-stack engineer and game designer implementing the Chronicle Engine
for the 7 Deadly Sins card game. You have deep expertise in TypeScript, React, tRPC,
Supabase, and LLM integration via the Vercel AI SDK. You understand narrative design,
emergent systems, and behavioral psychology as applied to game design.
</role>

<context>
The 7 Deadly Sins card game is a multiplayer competitive card game where 2-4 players
choose sin factions (Wrath, Sloth, Greed, Envy, Pride, Lust, Gluttony) and battle
over 20 rounds. The game already has:
- A working AI narrator system (server/aiNarrator.ts) using Gemini 2.5 Flash via Forge API
- A Sin Whisperer system that generates per-faction temptation whispers
- Behavioral analysis engine (rivalry detection, aggression tracking, comeback detection)
- Supabase for game state persistence (games, game_players, game_log tables)
- tRPC endpoints for all game operations
- A narrator display and action feed in the GameBoard UI

The Chronicle Engine transforms every match into a unique alternate history of human
civilization, written in real-time by AI, shaped entirely by how the players fight.
</context>

<objective>
Implement the Chronicle Engine in 3 phases, producing working, tested code at each phase.
The engine must generate narrative during gameplay, assemble a cohesive chronicle post-game,
and publish it to a public blog feed with download and share capabilities.
</objective>

<phase_1 title="Round Narrative Generation">
<description>
Build the server-side narrative pipeline that generates a historical narrative segment
after each round's resolution. This is the core engine.
</description>

<tasks>
1. Create the ERA_TIMELINE constant in shared/gameTypes.ts mapping rounds 1-20 to
   historical eras with name, anchor, and tone.

2. Create the FACTION_FORCES mapping in shared/gameTypes.ts that translates each sin
   faction into a historical force (Wrath = military conquest, Greed = commerce, etc.)
   with dominant/defeated narrative templates.

3. Create ERA_SEED_SENTENCES in shared/chronicleData.ts: 3-5 hand-authored literary
   seed sentences per era with template variables ({dominant_faction}, {defeated_faction},
   {damage_number}, {city_name}, {era_span}). These are the "curated randomness" anchors
   that prevent the "10,000 Bowls of Oatmeal" problem.

4. Create server/chronicleEngine.ts with the 3-stage prompt chain:

   Stage 1 - eventTranslator(roundEvents, eraContext):
   - Input: raw game events (cards played, damage dealt, HP changes, eliminations)
   - Output: structured JSON of historical events
   - Temperature: 0.1 (deterministic)
   - Uses FACTION_FORCES mapping to translate game actions to historical actions

   Stage 2 - continuityChecker(previousContext, newEvents):
   - Input: running chronicle context string + new historical events
   - Output: updated context with continuity notes
   - Temperature: 0.3 (analytical)
   - Tracks: established nations, ongoing conflicts, referenced locations, character names

   Stage 3 - proseWriter(eraContext, events, continuityNotes, seedSentences):
   - Input: era info + events + continuity + 1-2 selected seed sentences
   - Output: 2-3 sentence literary narrative segment
   - Temperature: 0.8 (creative)
   - MUST include at least one "mechanical echo" (sentence referencing specific game numbers)
   - MUST weave in the selected seed sentence naturally

5. Track civilization metrics (Militarism, Culture, Commerce) across rounds:
   - Update after each round based on cards played and damage patterns
   - Store in memory during game, persist to chronicle_segments table

6. Create Supabase table: chronicle_segments
   - game_id (FK to games)
   - round_number (1-20)
   - era_name (text)
   - narrative_text (text, the generated prose)
   - historical_events_json (jsonb, Stage 1 output)
   - continuity_context (text, running context)
   - civilization_metrics (jsonb, {militarism, culture, commerce})
   - rarity_tier (text: common/rare/epic/legendary)
   - created_at (timestamp)

7. Create Supabase table: chronicles
   - id (uuid, PK)
   - game_id (FK to games, unique)
   - title (text, AI-generated)
   - full_text (text, 800-1200 words)
   - civilization_type (text: warrior_empire/enlightened_republic/merchant_federation/balanced)
   - rarity_tier (text, highest tier triggered during match)
   - player_factions (jsonb, array of {name, faction, final_hp, placement})
   - total_rounds (int)
   - turning_point_round (int)
   - stats_json (jsonb, total damage, eliminations, etc.)
   - published (boolean, default true)
   - created_at (timestamp)

8. Add tRPC endpoint: game.generateRoundNarrative
   - Called after each round's resolution (from the existing resolution flow)
   - Runs the 3-stage pipeline
   - Stores the segment in chronicle_segments
   - Returns the narrative text for display in the action feed

9. Wire the round narrative into GameBoard.tsx:
   - After resolution completes, call generateRoundNarrative
   - Display the historical narrative in the action feed with a special "chronicle" style
   - Show the era name and round number as a header

10. Add fallback: if any LLM call fails, use a pre-authored generic era description
    from ERA_SEED_SENTENCES as the round narrative. Never block gameplay on AI.
</tasks>

<quality_constraints>
- Each round narrative MUST contain at least one mechanical echo (specific game number)
- Each round narrative MUST reference at least one established element from previous rounds
  (after round 3)
- The 3-stage chain MUST complete in under 8 seconds total (use streaming where possible)
- Fallback to static content MUST be invisible to the player (same style, same display)
</quality_constraints>
</phase_1>

<phase_2 title="Chronicle Assembly and Publication">
<description>
After the game ends, assemble all round segments into a cohesive alternate history
document using the Evaluator-Optimizer pattern. Publish to a public feed.
</description>

<tasks>
1. Create generateFullChronicle() in server/chronicleEngine.ts:

   Pass 1 (Generator): Using CO-STAR framework:
   - Context: 20 round narrative segments from a competitive card game
   - Objective: Produce a cohesive alternate history (800-1200 words)
   - Style: Literary historical fiction (Harari's Sapiens meets Borges)
   - Tone: Epic, slightly sardonic, dark humor
   - Audience: Gamers who appreciate good writing
   - Response: Opening myth, rising action, turning point, legacy conclusion

   Pass 2 (Evaluator): Review against 5 criteria:
   a. Continuity (no contradictions)
   b. Dramatic arc (clear turning point)
   c. Player recognition (each faction's actions visible)
   d. Literary quality (no generic AI patterns)
   e. Shareability (at least one quotable sentence)

   If evaluator flags issues, run generator once more with revision notes.
   Maximum 2 iterations. Store the final version.

2. Determine Chronicle Rarity Tier:
   - Common: standard match
   - Rare: a player eliminated before round 10
   - Epic: comeback (lowest HP player won)
   - Legendary: final round decided by less than 5 HP

3. Determine Civilization Type from final metrics:
   - Militarism > 60: Warrior Empire
   - Culture > 60: Enlightened Republic
   - Commerce > 60: Merchant Federation
   - No dominant: Balanced Civilization

4. Generate chronicle title using a separate LLM call:
   - Input: civilization type, winning faction, rarity tier, turning point description
   - Output: A compelling title (e.g., "The Wrath of Nations: How Violence Shaped
     a World Without Mercy")
   - Temperature: 0.9 (maximum creativity for titles)

5. Add tRPC endpoint: game.getChronicle
   - Input: gameId
   - Output: full chronicle data (title, text, stats, players, civilization type)
   - Public access (no auth required for reading published chronicles)

6. Add tRPC endpoint: chronicle.list
   - Input: optional filters (faction, civilization_type, rarity_tier, player_name)
   - Output: paginated list of published chronicles with title, excerpt, players, date
   - Sorted by created_at descending

7. Wire chronicle generation into the game-over flow:
   - After the final round resolves and the winner is determined
   - Trigger generateFullChronicle() asynchronously
   - Show a "Your chronicle is being written..." loading state
   - Display the chronicle on the game-over screen when ready
</tasks>

<quality_constraints>
- Chronicle assembly (both passes) MUST complete in under 30 seconds
- The generated title MUST be unique (check against existing titles in DB)
- The chronicle MUST mention every player by name at least once
- The turning point section MUST reference the actual highest-damage round
</quality_constraints>
</phase_2>

<phase_3 title="Chronicle UI, Sharing, and Blog Feed">
<description>
Build the frontend pages for viewing, downloading, and sharing chronicles.
This is the viral loop mechanism.
</description>

<tasks>
1. Create client/src/pages/Chronicles.tsx (public feed):
   - Grid/list of published chronicles with title, excerpt, civilization type badge,
     rarity tier indicator, player names, and date
   - Filter by: faction, civilization type, rarity tier
   - Search by player name or chronicle title
   - Infinite scroll pagination
   - "Chronicle of the Week" featured section (most viewed in past 7 days)
   - Each card links to the full chronicle page

2. Create client/src/pages/ChronicleView.tsx (individual chronicle):
   - Full narrative text with literary formatting (drop caps, section breaks)
   - Sidebar with match statistics:
     * Players and factions with placement
     * Civilization type and rarity tier badges
     * Total damage dealt, rounds survived
     * Turning point round highlighted
   - "Download as PDF" button (generate PDF server-side using the existing PDF tools)
   - "Share" button with:
     * Copy link
     * Share to X/Twitter with generated excerpt
     * Open Graph meta tags for rich social previews
   - "Play a Match" CTA button at the bottom

3. Create client/src/pages/GameOver.tsx updates:
   - After the game ends, show the chronicle with a dramatic reveal animation
   - "Your civilization was a {civilization_type}" with the type description
   - Rarity tier badge with glow effect for Epic/Legendary
   - Buttons: "Read Full Chronicle", "Share", "Play Again"

4. Add routes to App.tsx:
   - /chronicles (public feed)
   - /chronicles/:id (individual chronicle)

5. Add Open Graph meta tags for chronicle pages:
   - og:title = chronicle title
   - og:description = first 2 sentences of the chronicle
   - og:image = generated civilization type banner image
   - og:url = shareable chronicle URL

6. Add a "Chronicles" link to the main navigation

7. Add view counting for chronicles (increment on each unique visit)
   to power the "Chronicle of the Week" feature
</tasks>

<design_constraints>
- The chronicle feed MUST be publicly accessible without login
- The chronicle view page MUST load in under 2 seconds
- The PDF download MUST preserve the literary formatting
- The share preview MUST look compelling on Twitter/X and Discord
- The design MUST use the existing game's dark fantasy aesthetic
- Mobile-responsive: chronicles MUST be readable on phone screens
</design_constraints>
</phase_3>

<testing_requirements>
Write vitest tests for:
1. eventTranslator: verify game events correctly map to historical events for each faction
2. continuityChecker: verify it detects and prevents narrative contradictions
3. proseWriter: verify output contains mechanical echoes and seed sentences
4. generateFullChronicle: verify the evaluator catches continuity errors
5. Civilization metrics: verify correct calculation from game events
6. Rarity tier: verify correct tier assignment from match conditions
7. Chronicle title generation: verify titles are non-empty and unique
8. tRPC endpoints: verify CRUD operations on chronicles
</testing_requirements>

<negative_constraints>
- NEVER block gameplay waiting for AI generation. Always use async with fallback.
- NEVER generate chronicles longer than 1500 words (readers lose interest).
- NEVER use generic AI prose patterns ("In a world where...", "Little did they know...").
- NEVER expose raw LLM errors to the player. Graceful degradation always.
- NEVER store chronicle text in the games table. Use the dedicated chronicles table.
- NEVER generate content that references real historical atrocities by name.
  The alternate history must be fictional civilizations, not real ones.
</negative_constraints>

<implementation_order>
Execute in this exact order:
1. Create Supabase tables (chronicle_segments, chronicles)
2. Create shared constants (ERA_TIMELINE, FACTION_FORCES, ERA_SEED_SENTENCES)
3. Build server/chronicleEngine.ts (3-stage pipeline + chronicle assembly)
4. Add tRPC endpoints
5. Wire into game resolution flow
6. Build Chronicle UI pages
7. Write tests
8. Update patch notes
9. Push to GitHub
</implementation_order>
</execution_prompt>
```

---

## Design Decisions Log

The following table documents each design decision, the skill/framework that informed it, and the expected impact on player engagement.

| Decision | Informed By | Framework/Principle | Expected Impact |
|----------|------------|---------------------|-----------------|
| 3-stage prompt chain | `/prompt_engineering` | Prompt Chaining pattern [1] | Higher narrative quality through separation of concerns |
| Era seed sentences | `/game-design` | Spelunky's Curated Randomness [2] | Quality floor prevents "10,000 Bowls of Oatmeal" |
| Evaluator-Optimizer for chronicles | `/prompt_engineering` | Self-Refine / Evaluator-Optimizer [3] | Catches continuity errors and generic prose |
| Mechanical echoes | `/game-design` | Ludonarrative Resonance (Hades) [4] | Players see their decisions reflected in narrative |
| Chronicle rarity tiers | `/behavioral-sciences` | Variable Ratio Reinforcement [5] | Unpredictable quality creates dopamine response |
| Civilization metrics | `/game-design` | Emergent Systems (BotW Chemistry Engine) [6] | Narrative outcome feels authored but is systemic |
| CO-STAR chronicle prompt | `/prompt_engineering` | CO-STAR Framework [7] | Structured prompt produces consistent quality |
| XML-tagged execution prompt | `/prompt_engineering` | Structured Prompting Best Practices [7] | Clear separation of instructions, data, and constraints |
| Public chronicle feed | `/behavioral-sciences` | Octalysis CD5: Social Influence [8] | Viral sharing loop creates organic acquisition |
| "Chronicle of the Week" | `/behavioral-sciences` | Octalysis CD1: Epic Meaning [8] | Community recognition elevates engagement |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| LLM latency exceeds 8s per round | Medium | High (breaks game flow) | Async generation with static fallback; show narrative after next round starts |
| Chronicles read as generic AI prose | Medium | High (kills shareability) | Seed sentences + evaluator pass + negative constraints in prompt |
| Narrative contradicts earlier events | Low | Medium (breaks immersion) | Dedicated continuity checker stage with explicit context tracking |
| Players don't read chronicles | Medium | Medium (feature unused) | Dramatic reveal animation + rarity system + social sharing hooks |
| Cost per match exceeds budget | Low | Medium (unsustainable) | 3 small LLM calls per round (not 1 large); cap at 2 evaluator iterations |

---

## References

[1]: Anthropic. (2024). "Building effective agents." Anthropic Documentation. Prompt Chaining pattern.
[2]: Short, T. X., & Adams, T. (2017). *Procedural generation in game design*. CRC Press. Spelunky case study.
[3]: Madaan, A., et al. (2023). "Self-Refine: Iterative Refinement with Self-Feedback." arXiv:2303.17651.
[4]: Supergiant Games. (2020). *Hades*. Ludonarrative resonance through contextual dialogue.
[5]: Ferster, C. B., & Skinner, B. F. (1957). *Schedules of reinforcement*. Variable ratio reinforcement.
[6]: Nintendo. (2017). *The Legend of Zelda: Breath of the Wild*. Chemistry engine emergent systems.
[7]: Bsharat, S. M., et al. (2023). "Principled Instructions Are All You Need." arXiv preprint.
[8]: Chou, Y. (2015). *Actionable Gamification: Beyond Points, Badges, and Leaderboards*. Octalysis Press.
