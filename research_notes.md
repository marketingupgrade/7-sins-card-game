# Research Notes: AI-Driven Alternate History Feature

## Key Inspirations
- **Crusader Kings II/III**: Emergent storytelling through complex simulation. Player actions create unique narratives. Key insight: "combining a complex simulation with ample allowance made in the game's design for the player to project meaning onto events"
- **Shadow of Mordor Nemesis System**: Enemies remember you, evolve based on interactions. Creates personal stories. Patent locked until 2036.
- **AI Dungeon**: LLM-powered infinite narrative generation. Key innovation: persistent world memory via "chronicles" (compressed session summaries)
- **Pax Historia**: Alternate history sandbox game
- **A Better World**: Web game where you change historical dates and see consequences

## Key Design Principles from Research
1. **Emergent narrative > authored narrative**: The best stories come from systems interacting, not pre-written scripts
2. **Player projection**: Give players enough detail to project meaning onto events
3. **Persistent memory**: AI Dungeon's "chronicles" approach - compress old sessions into summaries
4. **Shareable artifacts**: Games that produce content players want to share go viral
5. **Variable ratio reinforcement**: Unpredictable narrative outcomes create dopamine loops

## Novel Concept: "The Chronicle"
- Each match generates a unique alternate history chapter
- 20 rounds = 20 historical eras (Dawn of Man to Space Age)
- Each sin faction represents a historical force:
  - Wrath = Military/Conquest
  - Sloth = Isolationism/Stagnation
  - Greed = Commerce/Capitalism
  - Envy = Espionage/Revolution
  - Pride = Empire/Monarchy
  - Lust = Culture/Diplomacy
  - Gluttony = Expansion/Colonization
- Card plays translate to historical events
- Damage = civilizational setbacks
- Healing = golden ages
- Eliminations = fall of civilizations
- Winner's faction shapes the final era

## Viral Loop
- Download as PDF/blog post
- Published to public chronicle feed
- Each chronicle is a unique alternate history
- Players share "In MY timeline, the Greed faction caused the Industrial Revolution in 3000 BC"

## Technical Approach
- LLM generates historical narrative segments after each round resolution
- Accumulates into a full "chronicle" document
- Uses game state (HP, damage, cards played, eliminations) as narrative seeds
- AI image generation for key moments (optional, expensive)
