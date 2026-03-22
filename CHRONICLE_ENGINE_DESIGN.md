# The Chronicle Engine: Design Document

**Author: Joris van Huet, Founder Causality Engine**

**Version 1.0 | March 2026**

---

## The Core Thesis

Every card game ends the same way: someone wins, someone loses, the table resets. The Chronicle Engine breaks that pattern. Every match of 7 Deadly Sins generates a unique **alternate history of human civilization**, written in real-time by AI, shaped entirely by how the players fight. The winner doesn't just get a victory screen. They get a published story. A permanent artifact. A piece of fiction that only exists because four specific humans made those specific decisions in that specific order.

No game has ever done this. Not Hearthstone, not MTG Arena, not Slay the Spire. The closest analog is Crusader Kings III's emergent storytelling, but that's single-player and the stories live only in the player's memory. The Chronicle Engine makes the story *the product*. It's downloadable, shareable, and published to a public blog feed where other players can read it.

The formula is simple:

> **Competitive card game + AI narrative engine + persistent world simulation = every match writes history**

---

## How It Works: The 20-Era Timeline

Each match already has 20 rounds. The Chronicle Engine maps those 20 rounds to 20 eras of human civilization. The mapping is not arbitrary. It follows a compressed but recognizable arc of history, giving the AI enough structure to write coherently while leaving room for wild divergence.

| Round | Era | Historical Anchor | Narrative Tone |
|-------|-----|-------------------|----------------|
| 1 | Dawn of Consciousness | First tribes, fire, language | Mythic, primordial |
| 2 | The First Cities | Mesopotamia, agriculture, writing | Foundation, ambition |
| 3 | Age of Bronze | Egypt, warfare, monuments | Power, conquest |
| 4 | Classical Antiquity | Greece, Rome, philosophy | Intellect, expansion |
| 5 | The Silk Roads | Trade networks, cultural exchange | Connection, greed |
| 6 | Age of Faith | Religions, crusades, dogma | Belief, conflict |
| 7 | The Dark Centuries | Plague, collapse, isolation | Decay, survival |
| 8 | Renaissance | Art, science, rebirth | Renewal, pride |
| 9 | Age of Exploration | Colonization, new worlds | Discovery, exploitation |
| 10 | The Enlightenment | Reason, revolution, rights | Idealism, upheaval |
| 11 | Industrial Revolution | Machines, factories, urbanization | Progress, suffering |
| 12 | The Great Wars | Global conflict, technology | Destruction, sacrifice |
| 13 | Cold War | Espionage, nuclear tension, space race | Paranoia, ambition |
| 14 | Digital Dawn | Computers, internet, globalization | Innovation, surveillance |
| 15 | Age of Information | Social media, AI, data | Connection, manipulation |
| 16 | The Reckoning (Afflictions x2) | Climate crisis, resource wars | Desperation, reckoning |
| 17 | Post-Scarcity | Automation, UBI, cultural shift | Abundance, ennui |
| 18 | The Singularity | AI ascendance, transhumanism | Transcendence, fear |
| 19 | The Final Frontier | Space colonization, alien contact | Wonder, isolation |
| 20 | The Last Reckoning | Civilization's judgment | Finality, legacy |

---

## Factions as Historical Forces

This is where the design becomes extraordinary. Each sin faction doesn't just have gameplay mechanics. It represents a **force that shaped human history**. When a Wrath player deals damage, the AI doesn't just narrate a card effect. It narrates a war. When a Greed player steals energy, the AI narrates an economic revolution.

| Faction | Historical Force | When Dominant | When Defeated |
|---------|-----------------|---------------|---------------|
| **Wrath** | Military conquest, revolution | Wars reshape borders, empires rise through violence | Peace treaties, disarmament, pacifist movements |
| **Sloth** | Isolationism, stagnation | Nations close borders, progress halts, dark ages | Forced modernization, cultural awakening |
| **Greed** | Commerce, capitalism, exploitation | Trade empires, industrial booms, wealth inequality | Socialist revolutions, wealth redistribution |
| **Envy** | Espionage, revolution, class warfare | Spy networks, coups, the oppressed rising | Stability, meritocracy, social harmony |
| **Pride** | Empire, monarchy, cultural supremacy | Golden ages, monumental architecture, cultural dominance | Humbling defeats, democratic revolutions |
| **Lust** | Diplomacy, culture, seduction | Alliances through marriage, cultural renaissance, soft power | Puritanical backlash, cultural conservatism |
| **Gluttony** | Expansion, colonization, consumption | Territorial expansion, resource extraction, population booms | Famine, ecological collapse, forced restraint |

The AI uses this mapping to translate every game action into a historical event. A Wrath player playing "Infernal Strike" against a Pride player in Round 8 (Renaissance) becomes: *"The Wrathful Horde sacked the Prideful Empire's capital during the height of its artistic golden age, burning libraries that had taken centuries to fill."*

---

## The Narrative Pipeline

The Chronicle Engine generates narrative at three levels, each building on the last.

### Level 1: Round Summaries (Real-time)

After each round's resolution, the AI generates a 2-3 sentence historical narrative segment. This appears in the game's action feed and narrator display. Players see history being written as they play.

The prompt receives: the era context, all cards played this round, damage dealt, healing done, eliminations, and the cumulative chronicle so far. The AI must maintain continuity. If the Greed faction established a trade empire in Round 5, the Round 6 narrative should reference it.

### Level 2: The Full Chronicle (Post-game)

After the match ends, the AI takes all 20 round summaries plus the final game state and generates a cohesive 800-1200 word alternate history document. This is not just the round summaries stitched together. It's a rewrite that adds:

- An opening paragraph setting the mythic tone
- Transitional passages connecting eras
- A "turning point" section highlighting the most dramatic round (biggest HP swing, an elimination, a comeback)
- A conclusion reflecting on what kind of civilization emerged based on who won and how

### Level 3: The Published Blog (Persistent)

The full chronicle is saved to the database and published to a public `/chronicles` feed on the game's website. Each chronicle has:

- A generated title (e.g., "The Wrath of Nations: How Violence Shaped a World Without Mercy")
- The four players' names and factions
- The full narrative text
- Key statistics (total damage, rounds survived, winner's final HP)
- A shareable URL
- Download as PDF option

---

## The Behavioral Science Behind It

This feature is engineered to trigger specific psychological responses, grounded in the Octalysis framework.

**Core Drive 1: Epic Meaning and Calling.** Players are no longer just playing a card game. They are *writing history*. Every match has cosmic significance. The narrative framing transforms a 10-minute card battle into an act of world-creation. This is the single most powerful motivator in the Octalysis framework, and almost no competitive card game activates it.

**Core Drive 3: Empowerment of Creativity and Feedback.** Players see their decisions reflected in a unique creative artifact. The chronicle is *theirs*. No two are alike. This triggers the IKEA Effect (people value things they helped create) and the Endowment Effect (once you have your chronicle, you don't want to lose it).

**Core Drive 5: Social Influence and Relatedness.** The published blog creates a social object. Players share their chronicles. "In MY timeline, Sloth won by doing literally nothing for 20 rounds and the AI wrote a story about a civilization that achieved enlightenment through radical inaction." This is inherently viral. It's a story generator that produces shareable content.

**Core Drive 7: Unpredictability and Curiosity.** Players don't know what the AI will write. The same card play in the same round with the same factions will produce different narratives every time. This is a variable ratio reward schedule applied to storytelling. Players keep playing to see what story emerges next.

**The Hook Model (Nir Eyal).** The trigger is the match ending. The action is reading the chronicle. The variable reward is the unique narrative. The investment is sharing it, which creates social proof that triggers other players to play.

---

## What Makes This Unprecedented

| Feature | Closest Existing Game | Why This Is Different |
|---------|----------------------|----------------------|
| AI-generated narrative from gameplay | Crusader Kings III | CK3 is single-player, stories are emergent but unwritten. The Chronicle Engine writes them. |
| Persistent world shaped by players | EVE Online | EVE's history is player-driven but requires thousands of hours. A single 10-minute match writes a full chronicle. |
| Downloadable game artifact | Spotify Wrapped | Spotify Wrapped is annual and passive. Chronicles are active, creative, and per-match. |
| Published game blog | None | No competitive game publishes AI-generated narratives from individual matches. |
| Historical simulation from card battles | None | No card game maps competitive mechanics to historical eras with AI narration. |

---

## Implementation Roadmap

### Phase 1: Round Narrative Generation (Server-side)

Add a `generateRoundNarrative` function to `aiNarrator.ts` that takes the era mapping, round results, and cumulative chronicle context. Store each round's narrative segment in a new `chronicle_segments` Supabase table.

### Phase 2: Chronicle Assembly (Post-game)

After the game ends, trigger a `generateFullChronicle` function that reads all segments, the game outcome, and player stats, then generates the cohesive 800-1200 word document. Store in a `chronicles` Supabase table.

### Phase 3: Chronicle UI (Frontend)

Build a `/chronicles` page with a public feed of all published chronicles. Each chronicle has its own page with the full narrative, player stats, and download/share buttons.

### Phase 4: Blog Publication and Sharing

Add Open Graph meta tags for social sharing. Generate a PDF download option. Add a "Share to X/Twitter" button with a generated excerpt.

### Phase 5: Chronicle Feed and Discovery

Add filtering (by faction, by player, by era), search, and a "Chronicle of the Week" featured section voted on by the community.

---

## Technical Architecture

The Chronicle Engine sits on top of the existing AI narrator infrastructure. It reuses the `buildMatchContext` and `analyzePlayerBehaviors` functions but adds a new layer: the **Era Translator**, which converts game events into historical language.

```
Game Event (card played, damage dealt)
    |
    v
Era Translator (maps to historical context)
    |
    v
LLM Prompt (era + event + cumulative chronicle)
    |
    v
Round Narrative Segment (stored in DB)
    |
    v [after 20 rounds]
Chronicle Assembler (LLM rewrite into cohesive document)
    |
    v
Published Chronicle (public URL, PDF download, blog feed)
```

The key technical challenge is **narrative continuity**. Each round's prompt must include a compressed summary of the chronicle so far, so the AI doesn't contradict earlier events. This is solved by maintaining a running "chronicle context" string that gets updated after each round, similar to AI Dungeon's "chronicles" compression technique.

---

## Sample Chronicle Excerpt

> **The Wrath of Nations: A History Written in Blood**
>
> *Players: Alice (Wrath), Bob (Sloth), Charlie (Greed), Diana (Envy)*
>
> In the beginning, there was only fire. The first tribes gathered not around warmth but around rage, their earliest language a vocabulary of violence. While other civilizations might have chosen cooperation, the dominant force in this world was Wrath, and it set the tone for everything that followed.
>
> By the time the first cities rose along the river deltas, the Wrathful Horde had already established a pattern that would repeat for millennia: build, burn, rebuild stronger. The Slothful Kingdoms to the east watched with characteristic disinterest, their borders sealed, their people content to let the world destroy itself.
>
> But it was Greed that truly shaped the Bronze Age. Charlie's trade networks spread like veins across the continent, and for a brief moment it seemed commerce might tame the violence. It did not. Alice's Infernal Strike in the Classical era shattered the Greedy Republic's merchant fleet, and the libraries of the Prideful Empire burned for the second time in three centuries.
>
> The turning point came in Round 12, the Great Wars. Diana, playing Envy, had spent the entire game targeting whoever was strongest. When Alice's Wrath faction finally overextended, Diana struck with a devastating Jealous Fury that reduced Alice from 78 HP to 31 in a single round. The AI narrator called it "the most spectacular act of spite since the Trojan War," and it was.
>
> In the end, Bob won. Sloth won. The faction that did the least, endured the most. The final chronicle reads like a parable: in a world where every other civilization burned itself to ash through conquest, commerce, and envy, the one that simply refused to participate was the last one standing.
>
> *Final HP: Bob (Sloth) 67 | Alice (Wrath) 0 | Charlie (Greed) 0 | Diana (Envy) 0*

---

## The Viral Loop

The Chronicle Engine creates a self-reinforcing growth loop:

1. **Play a match** (10 minutes)
2. **Read your chronicle** (unique, personal, surprising)
3. **Share it** (social media, Discord, friends)
4. **Others read it** (intrigued by the concept)
5. **They play a match** (to generate their own chronicle)
6. **Repeat**

The content is inherently shareable because it's *novel*. Nobody has ever seen an AI write an alternate history of civilization based on a card game. The first time someone posts "In my timeline, Gluttony won and the AI wrote a story about a civilization that literally ate itself into space travel," it will spread.

---

## Conclusion

The Chronicle Engine transforms 7 Deadly Sins from a competitive card game into a **civilization narrative generator**. Every match is a story. Every story is unique. Every story is publishable. This is the feature that makes the game impossible to describe without someone wanting to try it, which is the definition of a product that sells itself.

The technical foundation already exists: the AI narrator, the behavioral analysis engine, the Forge API integration. What remains is the era mapping, the chronicle assembly pipeline, and the frontend to display and share the results. Estimated implementation: 3 phases across 2-3 sessions.
