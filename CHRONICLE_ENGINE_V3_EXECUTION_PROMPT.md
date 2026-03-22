# Chronicle Engine v3: The Complete Execution Prompt

**Author: Joris van Huet, Founder Causality Engine**

**Version 3.0 | March 2026**

**Skills Applied:** `/prompt_engineering` `/game-design` `/behavioral-sciences` `/ux-design` `/copywriting`

---

## What Changed from v2

Version 2 solved the **engineering** problems (prompt chaining, continuity, quality control). Version 3 solves the **human** problems: why would someone read a chronicle, why would they share it, why would they come back to generate another one, and how does the entire experience *feel* from first round to published blog post.

| Layer | v2 Solved | v3 Adds |
|-------|-----------|---------|
| **Generation** | 3-stage prompt chain, seed sentences, evaluator loop | Narrator Voice System with 4 distinct personas, Peak-End chronicle structure |
| **Psychology** | Variable rarity tiers, IKEA effect through co-creation | Full Hook Model loop, Zeigarnik tension during generation, Endowment escalation through progressive investment |
| **UX** | Basic chronicle page with download/share | Cinematic reveal sequence, progressive disclosure of narrative layers, microinteraction design for every state |
| **Copy** | CO-STAR framework for LLM prompts | Brand Voice Chart for the narrator, copywriting formulas for chronicle titles/excerpts/CTAs, System 1 hooks |
| **Virality** | Share button, Open Graph tags | Identity-driven sharing ("MY civilization was..."), social proof feed, commitment escalation |

---

## New Refinement 7: The Narrator Voice System (from `/copywriting`)

The v2 prompt specified "epic, slightly sardonic" tone. This is too vague for consistent LLM output. The copywriting skill's **Brand Voice Chart** framework demands we define the narrator as a character with explicit Do/Don't rules.

### The Chronicler: Brand Voice Chart

| Trait | Description | Do | Don't |
|-------|-------------|-----|-------|
| **Omniscient** | The Chronicler has watched every civilization rise and fall. Nothing surprises them. | Write with the weary authority of someone who has seen it all before. Reference patterns across eras. "This was not the first time fire solved a political problem." | Never express shock or surprise. Never use exclamation marks. Never say "amazingly" or "incredibly." |
| **Sardonic** | The Chronicler finds dark humor in human folly. They are amused, not cruel. | Use dry wit and understatement. "The peace treaty lasted almost a full afternoon." Let irony do the work. | Never mock players directly. Never be mean-spirited. Never use sarcasm that punches down. |
| **Precise** | The Chronicler respects numbers. Specific details create authority. | Use exact numbers from the game. "The assault cost 23 lives." Reference specific rounds as years/decades. | Never use vague quantifiers ("many," "several," "countless"). Never round numbers. Never approximate. |
| **Literary** | The Chronicler writes prose worth quoting. Every sentence earns its place. | Use concrete nouns and active verbs. Vary sentence length. End paragraphs on strong images. | Never use cliches ("In a world where..."). Never use passive voice unless for deliberate effect. Never pad with adjectives. |

### Four Narrator Personas (Tied to Civilization Type)

The narrator's voice subtly shifts based on the emerging civilization personality, creating a feedback loop where the game's character influences the narrator's character:

| Civilization Type | Persona Shift | Example Sentence |
|-------------------|---------------|------------------|
| **Warrior Empire** (Militarism > 60) | More terse. Shorter sentences. Military metaphors. | "The Wrathful took the capital on Tuesday. By Wednesday, there was nothing left to take." |
| **Enlightened Republic** (Culture > 60) | More philosophical. Longer sentences. Questions. | "Whether the Prideful built their towers to touch the divine or to escape the mundane is a question their architects never thought to ask." |
| **Merchant Federation** (Commerce > 60) | More transactional. Lists. Cost-benefit language. | "The Greedy offered three things: protection, prosperity, and a bill that would arrive precisely on time." |
| **Balanced** (No dominant) | Most literary. Balanced rhythm. Paradoxes. | "They were a civilization of contradictions: violent peacemakers, generous thieves, lazy conquerors." |

This voice chart is injected into the Stage 3 Prose Writer prompt as a system instruction, ensuring every generated sentence sounds like it came from the same narrator.

---

## New Refinement 8: The Hook Model Applied to Chronicles (from `/behavioral-sciences`)

The chronicle system must form a **habit loop**, not just a feature. Applying Nir Eyal's Hook Model:

### The Chronicle Hook Cycle

| Phase | Implementation | Behavioral Mechanism |
|-------|---------------|---------------------|
| **Trigger (External)** | After game ends, the screen dims and text appears: *"The Chronicler is writing your history..."* with a quill animation. This is the first external trigger. | **Zeigarnik Effect**: The incomplete task (unread chronicle) creates cognitive tension. The player *must* see what was written about their match. |
| **Trigger (Internal)** | After 3+ matches, players start wondering "what will the Chronicler say about THIS match?" before the game even ends. The internal trigger is **curiosity about their own story**. | **Anticipatory dopamine**: The reward prediction itself becomes pleasurable. Players play differently because they're thinking about the narrative. |
| **Action** | Read the chronicle. The action is frictionless: it appears automatically, no navigation required. One scroll to read. | **Fogg Behavior Model**: High motivation (curiosity) + low friction (auto-displayed) = action taken. |
| **Variable Reward** | Chronicle rarity tiers (Common/Rare/Epic/Legendary) + narrator persona variation + mechanical echoes that reference YOUR specific plays. Three types of variable reward simultaneously: | **Variable Ratio Reinforcement**: Unpredictable quality creates stronger dopamine response than consistent quality. |
| | - **Reward of the Hunt**: discovering what the AI wrote about your match (information seeking) | |
| | - **Reward of the Self**: seeing your decisions reflected in literary prose (competence/mastery) | |
| | - **Reward of the Tribe**: sharing a Legendary chronicle and getting reactions (social validation) | |
| **Investment** | The player's chronicle library grows. Each match adds a chapter to their personal alternate history. Sharing a chronicle on social media is a public commitment. Playing with the same faction builds a faction-specific narrative arc across chronicles. | **IKEA Effect + Endowment Effect**: Players value chronicles more because they "co-created" them through gameplay. The library becomes an asset they don't want to lose. **Commitment & Consistency**: After sharing one chronicle, they're more likely to play again to generate another. |

### The Zeigarnik Tension Sequence

The moment between game end and chronicle reveal is the most psychologically powerful moment in the entire feature. Design it deliberately:

1. **Screen dims** (0.5s fade) — signals transition from gameplay to narrative
2. **Quill animation** appears with text: *"The Chronicler is writing your history..."* — Zeigarnik tension begins
3. **Era fragments** flash briefly (0.3s each): "The Dawn of Consciousness... The First Cities... The Age of Iron..." — progressive disclosure builds anticipation
4. **Rarity reveal** (if Rare+): A glow effect pulses before the chronicle appears, with tier name: "An **Epic** chronicle has been written." — variable reward signal
5. **Chronicle title fades in** with drop-cap first letter — the payoff begins
6. **Full text reveals** with a subtle typewriter scroll (not actual typewriter effect — too slow — but a smooth 2s reveal that feels like unrolling a scroll)

This 5-8 second sequence is the **Peak** in the Peak-End Rule. It must feel like opening a treasure chest, not loading a webpage.

---

## New Refinement 9: Progressive Disclosure of Narrative Layers (from `/ux-design`)

The UX cognitive psychology reference warns against **cognitive overload**: showing all information at once reduces comprehension and engagement. The chronicle has multiple layers of information (narrative, stats, civilization type, rarity, player data). These must be revealed progressively.

### The Three-Layer Reveal

| Layer | What's Shown | When | UX Pattern |
|-------|-------------|------|------------|
| **Layer 1: The Story** | Chronicle title + full narrative text. Nothing else. | Immediately after the reveal sequence. | **Focus**: The story is the star. No distracting sidebars, stats, or buttons. Just text on a dark background with beautiful typography. The player reads. |
| **Layer 2: The Identity** | Civilization type badge, rarity tier, player factions with placements. | After the player finishes reading (scroll-triggered) or clicks "See Details." | **Recognition**: The player sees their match reflected in structured data. "Oh, we created a Warrior Empire. That makes sense — we were all playing aggressively." |
| **Layer 3: The Action** | Download PDF, Share to social, View in Chronicle Feed, Play Again. | Below Layer 2, or as a sticky footer that appears after Layer 1 is scrolled past. | **Conversion**: Now that the player has experienced the story AND understood their civilization, they're primed to share or play again. CTAs appear at the moment of maximum engagement. |

This follows the UX principle of **information architecture as narrative**: the page itself tells a story (read → understand → act), mirroring the chronicle's own dramatic arc.

### Typography for the Chronicle Page

Applying the UX visual design reference:

| Element | Specification | Rationale |
|---------|--------------|-----------|
| **Title** | Cinzel Decorative, 32px, gold (#C9A84C) on dark (#0A0A0F) | Cinzel evokes ancient inscriptions. Gold on dark = premium feel. |
| **Body** | Crimson Text (serif), 18px, line-height 1.7, max-width 680px | Serif for literary reading. 680px = Medium's optimal reading width. 1.7 line-height for generous breathing room. |
| **Drop cap** | First letter of chronicle: Cinzel Decorative, 64px, float left | Classic literary device. Signals "this is a story, not a game UI." |
| **Era headers** | Cinzel, 14px, uppercase, letter-spacing 2px, muted gold | Subtle section markers that don't interrupt reading flow. |
| **Stats** | Inter (sans-serif), 14px, tabular-nums | Clean contrast with serif body. Tabular numbers for alignment. |

---

## New Refinement 10: Copywriting Formulas for Every Text Surface (from `/copywriting`)

Every piece of text the player sees must be crafted, not generated. The copywriting skill provides specific formulas:

### Chronicle Titles (The Headline)

Use the **AIDA-adjacent** pattern: **[Emotion Word] + [Specific Detail] + [Paradox or Twist]**

| Formula | Example |
|---------|---------|
| "The [Noun] of [Faction]: [Paradox]" | "The Patience of Wrath: How Violence Learned to Wait" |
| "[Number] [Time Units] of [Abstract Noun]" | "Seven Centuries of Careful Destruction" |
| "How [Faction] [Unexpected Verb] the [Era]" | "How Sloth Conquered the Renaissance by Doing Nothing" |
| "The [Adjective] [Noun] of [Place]" | "The Quiet Collapse of the Merchant Coast" |

The title generation prompt includes 8 formula templates. The LLM selects and fills one. This prevents generic titles ("The Battle of Good and Evil") while allowing creative variation.

### Chronicle Excerpts (The Hook)

For the chronicle feed cards and social sharing, the excerpt must hook in one sentence. Apply the **Open Loop** technique from copywriting:

> **Rule:** The excerpt must create a question in the reader's mind that can only be answered by reading the full chronicle.

| Bad Excerpt (Closed Loop) | Good Excerpt (Open Loop) |
|---------------------------|--------------------------|
| "The Wrathful faction won after 20 rounds of intense combat." | "The Wrathful built an empire on a single miscalculation — and it was not their own." |
| "This chronicle tells the story of a civilization shaped by greed." | "The merchants of the Third Age discovered that everything has a price. The Fourth Age discovered what happens when someone pays it." |

The excerpt is generated by a separate LLM call with the instruction: "Write one sentence that makes the reader desperate to know what happens next. Use an open loop — raise a question without answering it."

### Call-to-Action Copy

| Location | CTA Text | Behavioral Principle |
|----------|----------|---------------------|
| **After chronicle (logged in)** | "Write another chapter of history." | **Commitment & Consistency**: They've already "written" one. Frame the next game as continuing the work. |
| **After chronicle (logged out)** | "What kind of civilization would YOU build?" | **Curiosity Gap + Identity**: Challenges the reader's self-concept. |
| **Chronicle feed (empty state)** | "No chronicles yet. The Chronicler awaits your first battle." | **Personification + Scarcity**: The narrator is waiting specifically for them. |
| **Share button tooltip** | "Let others read your history." | **Ownership language**: "your history" triggers Endowment Effect. |
| **Download PDF button** | "Keep your chronicle forever." | **Loss Aversion**: Implies it might not be available forever. |

---

## New Refinement 11: The Social Proof Feed (from `/behavioral-sciences` + `/ux-design`)

The `/chronicles` public feed is not just a list of stories. It's a **social proof engine** that makes new players want to play.

### Feed Design Principles

1. **Show the humans, not just the stories.** Each chronicle card shows player names and factions. This activates **Social Proof** (Cialdini): "Real people played this and got a story written about them."

2. **Highlight rarity.** Epic and Legendary chronicles get a subtle glow border. This activates **Scarcity Principle**: "Most chronicles are Common. This one is special."

3. **Show view counts.** "Read by 47 people" activates **Bandwagon Effect**: "Other people found this worth reading."

4. **"Chronicle of the Week" banner.** The most-viewed chronicle gets a featured position. This activates **Octalysis CD1 (Epic Meaning)**: "My chronicle could be featured."

5. **Civilization type filters as identity badges.** Filtering by "Warrior Empire" or "Enlightened Republic" lets players find chronicles that match their play style. This activates **Octalysis CD5 (Social Influence)**: "I want to see what other aggressive players' civilizations looked like."

### Feed Card Anatomy

```
┌─────────────────────────────────────────────────┐
│  ✦ EPIC                              Mar 22, 2026│
│                                                   │
│  The Patience of Wrath:                          │
│  How Violence Learned to Wait                    │
│                                                   │
│  "The merchants of the Third Age discovered      │
│   that everything has a price..."                │
│                                                   │
│  ⚔️ Warrior Empire  ·  20 rounds  ·  4 players  │
│                                                   │
│  Wrath: Alex  ·  Greed: Sam  ·  Pride: Jordan   │
│  Sloth: Riley (eliminated R7)                    │
│                                                   │
│  👁 47 reads                                      │
└─────────────────────────────────────────────────┘
```

---

## New Refinement 12: The Endowment Escalation Ladder (from `/behavioral-sciences`)

The IKEA Effect and Endowment Effect research shows that perceived value increases with investment. The chronicle system should create **escalating investment** across multiple matches:

| Match # | Investment Level | Feature Unlocked | Psychological Effect |
|---------|-----------------|------------------|---------------------|
| **1** | First chronicle generated | Basic chronicle + download | **Novelty**: "Wow, the game wrote a story about our match!" |
| **3** | "Your Chronicle Library" appears in profile | Personal library page with all chronicles | **Collection instinct**: "I have 3 chronicles now. I want more." |
| **5** | Faction loyalty detected | "Your {Faction} Saga" — a meta-narrative connecting all chronicles where you played the same faction | **Identity investment**: "I'm building a Wrath saga. I can't stop now." |
| **10** | Veteran Chronicler badge | Badge on profile + chronicles marked "by a Veteran Chronicler" | **Status + Sunk Cost**: The badge is visible to others. Stopping means losing status. |

This ladder is not implemented in Phase 1. It's the roadmap for post-launch engagement deepening. But the data structures (user chronicle count, faction frequency) should be tracked from day one.

---

## Updated Execution Prompt (v3)

The v2 execution prompt remains valid for all engineering tasks. The following additions modify specific sections:

### Additions to Phase 1 (Round Narrative Generation)

**Task 4 amendment — Stage 3 Prose Writer prompt:**

Add the Narrator Voice Chart (Refinement 7) as a system instruction. Include the civilization-type persona shift logic: after round 5, check the dominant civilization metric and adjust the narrator persona accordingly. The persona shift should be gradual (blend the base voice with the persona voice proportionally to the metric's dominance).

**New Task 11:** Track per-user chronicle metadata from the first match:
- Total chronicles generated
- Faction frequency (how many times each faction was played)
- Highest rarity tier achieved
- Store in a `user_chronicle_stats` field on the user profile (or a new Supabase table)

### Additions to Phase 2 (Chronicle Assembly)

**Task 1 amendment — Generator prompt:**

Replace the generic CO-STAR tone instruction with the full Narrator Voice Chart. Add the Peak-End structure requirement: the chronicle MUST have an identifiable emotional peak (the highest-tension moment) in the middle third and a resonant final sentence that could stand alone as a quote.

**New Task 8:** Generate the chronicle excerpt using the Open Loop technique:
- Separate LLM call after the full chronicle is generated
- Input: full chronicle text + match summary
- Output: one sentence that creates an unanswered question
- This excerpt is used on feed cards and social sharing previews

**Task 4 amendment — Title generation:**

Include the 8 title formula templates from Refinement 10. The LLM must select a formula and fill it, not generate a title from scratch. This prevents generic titles.

### Additions to Phase 3 (Chronicle UI)

**Task 1 amendment — Chronicles.tsx feed:**

Implement the Social Proof Feed design from Refinement 11. Each card must show: rarity badge, title, open-loop excerpt, civilization type, player names with factions, view count, and date. Add the "Chronicle of the Week" featured banner.

**Task 2 amendment — ChronicleView.tsx:**

Implement the Three-Layer Reveal from Refinement 9:
- Layer 1 (Story): Full narrative with Cinzel Decorative title, Crimson Text body, drop cap, 680px max-width, dark background
- Layer 2 (Identity): Civilization type badge, rarity tier, player factions — revealed on scroll or click
- Layer 3 (Action): Download PDF, Share, Play Again — sticky footer or scroll-triggered

Implement the Zeigarnik Tension Sequence from Refinement 8 for the game-over chronicle reveal:
- Screen dim → quill animation → era fragments → rarity reveal → title fade-in → scroll reveal

**Task 2 amendment — Typography:**

Use the typography specifications from Refinement 9. Import Cinzel Decorative and Crimson Text from Google Fonts. Use Inter for stats and metadata.

**Task 2 amendment — CTA copy:**

Use the specific CTA copy from Refinement 10 for all buttons and empty states.

### New Phase 4: Data Foundation for Engagement Ladder

**Tasks:**
1. Create Supabase table or fields for user chronicle stats:
   - `total_chronicles` (int)
   - `faction_frequency` (jsonb: {wrath: 5, greed: 3, ...})
   - `highest_rarity` (text: common/rare/epic/legendary)
   - `favorite_faction` (computed from frequency)

2. After each chronicle is generated, update the user's stats.

3. Add a "My Chronicles" section to the user profile or a dedicated `/my-chronicles` page:
   - Grid of the user's chronicles with rarity badges
   - Stats summary: total chronicles, favorite faction, highest rarity
   - "Your {Faction} Saga" section if 3+ chronicles with the same faction

4. This phase is lower priority than Phases 1-3 but the data tracking must be implemented alongside Phase 2 to avoid retroactive data collection.

---

## Updated Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| LLM latency exceeds 8s per round | Medium | High | Async generation with static fallback; show narrative after next round starts |
| Chronicles read as generic AI prose | Medium | High | Voice Chart + seed sentences + evaluator + negative constraints |
| Narrative contradicts earlier events | Low | Medium | Dedicated continuity checker stage |
| Players don't read chronicles | Medium | Medium | Zeigarnik tension sequence + Peak-End structure + rarity system |
| Players don't share chronicles | Medium | Medium | Open-loop excerpts + identity-driven CTAs + social proof feed |
| Chronicle page feels like "just another AI page" | Medium | High | Three-layer reveal + literary typography + cinematic reveal sequence |
| Cost per match exceeds budget | Low | Medium | 3 small LLM calls per round; cap evaluator at 2 iterations |
| Engagement drops after novelty wears off | Medium | High | Endowment escalation ladder + faction saga meta-narrative |

---

## Design Decisions Log (v3 Additions)

| Decision | Informed By | Framework/Principle | Expected Impact |
|----------|------------|---------------------|-----------------|
| Narrator Voice Chart with 4 personas | `/copywriting` | Brand Voice Chart | Consistent, distinctive narrator voice across all chronicles |
| Hook Model cycle for chronicles | `/behavioral-sciences` | Nir Eyal Hook Model | Habit formation: players anticipate chronicles before game ends |
| Zeigarnik tension sequence | `/behavioral-sciences` | Zeigarnik Effect | Cognitive tension makes chronicle reveal feel like a reward |
| Three-layer progressive disclosure | `/ux-design` | Cognitive Load Theory | Players absorb story first, then stats, then act |
| Literary typography (Cinzel + Crimson Text) | `/ux-design` | Typography hierarchy | Chronicle page feels like a published book, not a game UI |
| Open-loop excerpt generation | `/copywriting` | Open Loop technique | Feed cards create irresistible curiosity to read full chronicle |
| Title formula templates | `/copywriting` | AIDA-adjacent headline formulas | Prevents generic titles; ensures every title has a hook |
| Identity-driven CTAs | `/copywriting` + `/behavioral-sciences` | Endowment Effect + Loss Aversion | "Your history" language increases sharing and return visits |
| Social proof feed design | `/behavioral-sciences` | Cialdini's Social Proof + Bandwagon | Feed itself becomes an acquisition channel |
| Endowment escalation ladder | `/behavioral-sciences` | IKEA Effect + Sunk Cost + Commitment | Long-term retention through progressive investment |
| Peak-End chronicle structure | `/ux-design` + `/behavioral-sciences` | Peak-End Rule | Players remember chronicles as better than they objectively are |
| Civilization-type persona shift | `/copywriting` + `/game-design` | Emergent narrative + voice adaptation | Each chronicle feels uniquely voiced based on how the match played out |

---

## References (v3 Additions)

[9]: Eyal, N. (2014). *Hooked: How to Build Habit-Forming Products*. Portfolio/Penguin. Hook Model.
[10]: Zeigarnik, B. (1927). "On finished and unfinished tasks." *Psychologische Forschung*. Zeigarnik Effect.
[11]: Norton, M. I., Mochon, D., & Ariely, D. (2012). "The IKEA Effect: When Labor Leads to Love." *Journal of Consumer Psychology*. IKEA Effect.
[12]: Kahneman, D., et al. (1993). "When More Pain Is Preferred to Less." *Psychological Science*. Peak-End Rule.
[13]: Cialdini, R. B. (2006). *Influence: The Psychology of Persuasion*. Harper Business. Social Proof + Commitment.
[14]: Bringhurst, R. (2012). *The Elements of Typographic Style*. Hartley & Marks. Typography principles.
[15]: Hall, E. (2018). *Conversational Design*. A Book Apart. Voice and tone frameworks.
[16]: Google PAIR. (2023). *People + AI Guidebook*. AI UX design patterns.
