# Premium Game Audit: 7 Deadly Sins Card Game

**Benchmarked against:** Magic: The Gathering Arena, Hearthstone, Across the Obelisk, Monster Train
**Focus:** Open source asset libraries, sin-oriented (not cyberpunk) visual identity
**Date:** March 2026

---

## Executive Summary

The 7 Deadly Sins Card Game has a solid mechanical foundation — 49 cards across 4 factions, a unique Flat vs. Compounding duality, Fibonacci-escalating damage, sin-specific passives, and a catch-up system. However, when measured against premium digital card games, it falls short in five critical dimensions: **card pool depth**, **visual identity**, **progression systems**, **audio design**, and **game mode variety**. This audit maps every gap to concrete open source assets and implementation steps, prioritized by impact-to-effort ratio.

The single most transformative change is replacing the cyberpunk aesthetic with a **Gothic Cathedral / Stained Glass** visual identity rooted in Dante's Inferno and medieval sin iconography. This direction has been validated by Saga of Sins (2023), which proved that stained glass art works beautifully for sin-themed games, and by the wealth of CC0/CC-BY dark fantasy assets available on OpenGameArt, game-icons.net, and itch.io.

---

## 1. Mechanical Depth Gap Analysis

Premium card games succeed because every decision feels meaningful. The table below compares our current mechanics against each benchmark title across the dimensions that matter most.

| Dimension | Our Game (Current) | Hearthstone | Monster Train | Across the Obelisk | MTG Arena | Gap Severity |
|---|---|---|---|---|---|---|
| **Card Pool Size** | 49 cards (12 per faction) | 1000+ per set | 200+ per run | 300+ total | 2000+ in Standard | Critical |
| **Factions/Classes** | 4 sins (Wrath, Sloth, Greed, Envy) | 11 classes | 5 clans (pick 2) | 4 heroes (pick 4) | 5 colors (mix freely) | High |
| **Deck Building** | Fixed 12-card faction deck | 30-card custom decks | Draft during run | Persistent deck + draft | 60-card custom decks | Critical |
| **Card Rarity Tiers** | 3 tiers (common/rare/epic) | 4 tiers + golden | 3 tiers + upgraded | 4 tiers | 4 tiers + foil/showcase | Moderate |
| **Keywords/Mechanics** | Flat, Compounding, Catchup | 50+ keywords | Multistrike, Burnout, etc. | Bleed, Chill, Burn, etc. | 100+ keywords | High |
| **Win Conditions** | Last player standing | Reduce hero to 0 HP | Survive 8 waves | Defeat final boss | Reduce to 0 life | Low |
| **Board Complexity** | Turn-based, play cards | Minion positioning | 3-floor spatial | 2-row formation | Stack-based priority | High |
| **Meta-Progression** | Win streak counter (localStorage) | Ranked ladder, Mastery Pass | Covenant levels, card mastery | Permanent unlocks, town | Ranked, Mastery, collection | Critical |

### Priority Mechanical Upgrades

**Tier 1 — Expand to 7 Sins (High Impact, Moderate Effort).** The game is literally called "7 Deadly Sins" but only has 4. Adding **Pride**, **Lust**, and **Gluttony** would immediately triple the faction matchup space (from 6 to 21 unique pairings) and fulfill the thematic promise. Each new sin needs 12 cards and a unique passive:

- **Pride** — "Hubris": Gain +1 damage for each card played this turn (rewards combo chains, punishes overextension)
- **Lust** — "Temptation": When you play a card targeting an enemy, 30% chance to copy their last played card into your hand
- **Gluttony** — "Devour": Healing effects also grant temporary shield equal to 50% of healing (rewards sustain, creates fat HP pools)

**Tier 2 — Dual-Faction System (High Impact, High Effort).** Monster Train's greatest innovation is letting players combine two clans. Adapting this: let players pick a **Primary Sin** (determines passive ability + 8 cards) and a **Secondary Sin** (adds 4 cards from that faction's pool). This creates 42 unique dual-sin combinations from 7 factions, massively expanding replayability without designing new cards.

**Tier 3 — Card Keywords (Medium Impact, Low Effort).** Currently cards only have generic effect types (damage, heal, shield, buff, debuff). Premium games use named keywords that create a shared vocabulary. Proposed keywords:

| Keyword | Effect | Thematic Tie |
|---|---|---|
| **Smite** | Deal damage. If target is below 50% HP, deal double. | Wrath — punish the weak |
| **Languish** | Apply effect that grows stronger each round it's not cleansed | Sloth — slow decay |
| **Tithe** | Steal a percentage of the effect value from the target | Greed — take what's theirs |
| **Mirror** | Copy the target's highest stat buff onto yourself | Envy — become them |
| **Martyr** | Sacrifice HP to amplify the card's effect by 2x | Pride — prove your worth |
| **Charm** | Force target to skip their next card play | Lust — irresistible |
| **Gorge** | Consume all your remaining energy to multiply the effect | Gluttony — excess |

---

## 2. Visual Identity: From Cyberpunk to Gothic Cathedral

The current cyberpunk/neon aesthetic (dark backgrounds, glowing borders, tech-inspired UI) doesn't reinforce the sin theme. Premium card games use art direction that makes the theme *feel* inevitable. Hearthstone's tavern, Monster Train's hellish locomotive, MTG's multiverse — each is inseparable from its mechanics.

### Proposed Direction: Gothic Stained Glass + Dante's Circles

The visual identity should evoke a **corrupted cathedral** — a sacred space defiled by the seven sins. This draws from three proven sources:

**Saga of Sins (2023)** proved that stained glass art works for sin-themed action games. Every character, location, and spell was rendered as moving stained glass windows, creating a "dark and awe-inspiring" mood that reviewers praised as the game's strongest feature [1].

**Dante's Inferno** provides the structural metaphor. Each sin corresponds to a circle of Hell, giving each faction a distinct environment: Wrath = the River Styx (boiling blood), Sloth = the Marsh (fog and decay), Greed = the Fourth Circle (rolling boulders of gold), Envy = the Fifth Terrace (eyes sewn shut), Pride = the First Terrace (carrying stones), Lust = the Second Circle (eternal storm), Gluttony = the Third Circle (freezing rain).

**Gothic cathedral architecture** provides the UI framework. Card frames become stone arches with stained glass insets. The game board becomes a cathedral floor plan. Energy orbs become votive candles. The hand of cards fans out like a church organ's pipes.

### Implementation with Open Source Assets

The stained glass effect can be achieved in CSS/SVG without custom art for every card. The technique from Little Briar Rose (Elf Games) uses three layers: **thick black SVG outlines** (the lead), **bright saturated fills** (the glass), and a **marble/noise texture overlay** (the imperfection that makes it feel real) [2]. This is implementable as a CSS filter chain applied to any illustration.

| Asset Need | Open Source Source | License | Integration |
|---|---|---|---|
| Card frames (gothic arch) | OpenGameArt "Fantasy Card Dark Cosmic" by Cethiel | CC0 | 3 front variants, 2 backs — use as base, tint per sin |
| Card effect icons (48+ unique) | game-icons.net (4170+ icons) | CC BY 3.0 | SVG, tintable — map each card to a unique icon |
| UI borders and panels | OpenGameArt "Fantasy UI Borders" (130+ sprites) | CC0 | 9-slice scaling for panels, dialogs, tooltips |
| Status effect icons | OpenGameArt "Fantasy RPG Dark Icons" (128x128) | CC BY 3.0 | Buff/debuff indicators on player panels |
| Faction emblems | game-icons.net sin-themed SVGs | CC BY 3.0 | Wrath=fire, Sloth=snail, Greed=coins, Envy=eye, Pride=crown, Lust=heart, Gluttony=goblet |
| Card art (per-card unique) | AI-generated via Forge API (already available) | Platform | Generate stained-glass-style art per card using prompt templates |
| Background textures | OpenGameArt "Dark Dungeon Tileset" | CC0 | Cathedral stone floor, altar backgrounds |
| Card back pattern | itch.io "CARDBACK BUNDLE" by chaak | CC0 | Dark ornate card backs |

### Color Palette (Sin-Oriented, Not Cyberpunk)

The current neon glow palette should be replaced with deep, saturated stained glass colors against dark stone:

| Sin | Primary Color | Secondary | Accent | Dante's Circle |
|---|---|---|---|---|
| **Wrath** | Crimson `#8B0000` | Ember `#CC3300` | Molten gold `#FFD700` | River of boiling blood |
| **Sloth** | Deep purple `#2D1B4E` | Fog grey `#6B6B8D` | Pale lavender `#9B8EC4` | Stagnant marsh |
| **Greed** | Burnished gold `#B8860B` | Dark bronze `#6B4226` | Emerald `#006400` | Hoard of gold |
| **Envy** | Poison green `#2E5A1C` | Bile yellow `#8B8000` | Teal `#008080` | Eyes sewn shut |
| **Pride** | Royal white `#F5F5DC` | Marble grey `#C0C0C0` | Blinding gold `#FFD700` | Stone burden |
| **Lust** | Deep rose `#8B0045` | Burgundy `#5B0020` | Pink flame `#FF69B4` | Eternal storm |
| **Gluttony** | Sickly amber `#8B6914` | Rot brown `#5C3317` | Acid green `#7FFF00` | Freezing rain |

---

## 3. Audio Design Gap

Audio is where the premium gap is widest. Hearthstone's success is built on the principle that **every interaction has a sound** — card draw, card hover, card play, card impact, minion summon, minion attack, minion death, hero power, end turn, rope burning, board clicks. Our game has procedural Web Audio drones and basic SFX, but lacks the layered audio design that makes a card game feel *physical*.

### Audio Roadmap with Open Source Assets

| Audio Layer | Current State | Target State | Source |
|---|---|---|---|
| **Card interactions** | Silent hover, basic play SFX | Unique draw/hover/play/impact per card type | itch.io "Fantasy Card Game SFX Pack" (80+ effects, FREE) |
| **Ambient music** | Procedural sin drones | Layered gothic organ + choir loops that intensify with game state | OpenGameArt "Dark Fantasy Music" collection (CC) |
| **Combat impacts** | Basic hit sound | Faction-specific impact sounds (fire crackle for Wrath, sludge for Sloth) | Freesound.org (CC0 combat SFX) |
| **UI feedback** | Minimal | Button clicks, menu transitions, notification chimes | OpenGameArt "UI Sound Effects" packs |
| **Voice lines** | Web Speech API narrator | Keep narrator but add reverb/echo processing for cathedral feel | Web Audio API convolver node with cathedral impulse response |
| **Victory/defeat** | Basic game over screen | Dramatic organ crescendo (win) or descending minor chord (loss) | OpenGameArt orchestral stingers |

The most impactful single audio change is adding a **cathedral reverb impulse response** to the Web Speech narrator. A free impulse response from OpenAIR (CC BY) applied through the Web Audio ConvolverNode would make the narrator sound like it's speaking from inside a stone cathedral, instantly elevating the entire audio experience.

---

## 4. Progression & Retention Systems

This is the second-largest gap after visual identity. Premium card games retain players through layered progression systems that give meaning to every game played. Our current progression is a localStorage win streak counter — functional but invisible.

### Progression Roadmap (Prioritized)

**Phase 1: Player Profile + Stats (Server-Side).** Move game stats from localStorage to the database. Track: total games, wins, losses, win rate per faction, longest win streak, total damage dealt, total healing done, cards played. Display on a profile page. This is the foundation everything else builds on.

**Phase 2: Faction Mastery.** Each sin has a mastery track (levels 1-10). Playing games with a faction earns mastery XP. Mastery levels unlock: cosmetic card borders (level 3), animated card effects (level 5), faction title (level 7), prestige border (level 10). This directly maps to Octalysis CD2 (Accomplishment) and CD4 (Ownership).

**Phase 3: Achievement System.** 50+ achievements across categories: combat (deal 100 damage in one game), faction (win 10 games as each sin), social (play 50 multiplayer games), collection (play every card at least once). Each achievement awards a badge displayed on the player profile. Maps to CD2 (Accomplishment) and CD3 (Empowerment of Creativity).

**Phase 4: Seasonal Leaderboard.** Monthly leaderboard with ranked tiers (Sinner, Tempter, Archdevil, Lucifer). Resets monthly to create urgency (CD6 Scarcity). Top players get a seasonal badge. Uses ELO-style rating for fair matchmaking.

**Phase 5: Card Collection / Deck Builder.** The ultimate retention system. Instead of giving all 12 faction cards immediately, players start with 8 and earn the remaining 4 through play. Eventually expand to 20+ cards per faction where players build custom 12-card decks. This is the Monster Train / MTG model and represents the deepest form of CD4 (Ownership).

---

## 5. Game Mode Variety

Premium card games offer multiple ways to play. Our game has one mode: create a lobby, pick a sin, play a match. The table below shows what each benchmark offers and what we should prioritize.

| Mode | Hearthstone | Monster Train | AtO | MTG Arena | Our Priority |
|---|---|---|---|---|---|
| **Casual PvP** | Yes | No | No | Yes | Already have |
| **Ranked PvP** | Yes (with MMR) | No | No | Yes (with MMR) | Phase 2 |
| **Solo vs AI** | Practice mode | Core mode | Core mode | Sparky bot | Phase 1 (already have bots) |
| **Draft/Arena** | Yes (pick from 3) | Core mechanic | Yes (choose paths) | Yes (draft pods) | Phase 3 |
| **Co-op** | Tavern Brawl | No | Core (4-player) | No | Phase 4 |
| **Daily Challenges** | Daily quests | Daily challenge | Daily modifier | Daily deals | Phase 2 |
| **Tutorial Campaign** | Yes (guided) | Yes (story) | Yes (story) | Yes (Color Challenge) | Phase 1 |

### Priority Mode Additions

**Solo Campaign: "Dante's Descent" (High Impact).** A single-player mode where the player descends through 7 circles of Hell, each guarded by a sin-themed boss with unique mechanics. Each circle introduces a new sin faction. This serves as both tutorial and content — players learn each faction's playstyle by fighting against it. Completing a circle permanently unlocks that sin for multiplayer. This maps perfectly to Octalysis CD1 (Epic Meaning — you're literally descending into Hell) and CD7 (Unpredictability — boss mechanics create surprise).

**Daily Sin Challenge (Medium Impact).** Each day, one sin is "ascendant" — all players must use that faction, but with a random modifier (double energy, half HP, all cards cost 1 less, etc.). Completing the daily challenge awards mastery XP. This creates a reason to log in every day (CD6 Scarcity + CD8 Loss & Avoidance).

---

## 6. UX Polish Gap

Hearthstone's UI design philosophy is that **the interface should feel like a physical object you can touch** [3]. Cards have weight, shadows, and momentum. The board responds to actions. Every element has a hover state, a click state, and a transition. Our game has functional UI but lacks this physicality.

### UX Improvements (Open Source Implementable)

**Card Physics.** Cards in hand should fan naturally (not grid), respond to mouse proximity (tilt toward cursor), and have spring-back animations when released. This is achievable with CSS transforms and a spring physics library like `react-spring` (MIT license, already available via npm).

**Board Responsiveness.** When a high-damage card is played, the board should briefly crack (CSS clip-path animation), then heal. When a player is eliminated, their panel should crumble (particle effect). These are pure CSS/Canvas effects requiring no external assets.

**Tooltip System.** Every card, effect icon, and status should have a rich tooltip showing: effect name, description, duration remaining, source card. Hearthstone's tooltips are a masterclass — they appear instantly, are readable, and never block the action. Use Radix UI's tooltip primitive (already available in shadcn/ui).

**Turn Timer.** A visual rope that burns down (Hearthstone's most iconic UX element). Implementable as an SVG path animation with a glow effect. When time runs low, the rope burns faster and crackles (Web Audio).

**Undo Last Action.** Allow players to undo their last card play before ending their turn, as long as it hasn't triggered irreversible effects. This reduces frustration from misclicks (critical on mobile) and is standard in premium card games.

---

## 7. Complete Implementation Roadmap

The following roadmap is ordered by **impact-to-effort ratio**, with each phase building on the previous one. Estimated effort assumes a single developer working with AI assistance.

| Phase | Deliverable | Effort | Impact | Octalysis Drives |
|---|---|---|---|---|
| **3A** | Gothic stained glass theme (colors, fonts, card frames, backgrounds) | 3-4 days | Transformative | CD1 Epic Meaning |
| **3B** | 3 new sin factions (Pride, Lust, Gluttony) with 12 cards each | 2-3 days | High | CD3 Empowerment |
| **3C** | Per-card unique icons from game-icons.net (49+ mapped) | 1-2 days | High | CD4 Ownership |
| **3D** | Audio overhaul (card SFX pack + cathedral reverb on narrator) | 1-2 days | High | CD1 Epic Meaning |
| **3E** | Player profile + server-side stats | 1-2 days | High | CD2 Accomplishment |
| **3F** | Card physics (fan hand, tilt, spring-back) | 1-2 days | Medium | CD3 Empowerment |
| **3G** | Faction mastery system (10 levels per sin) | 2-3 days | High | CD2 + CD4 |
| **3H** | Daily Sin Challenge mode | 1-2 days | Medium | CD6 Scarcity |
| **3I** | Dual-faction system (primary + secondary sin) | 3-4 days | Transformative | CD3 Empowerment |
| **3J** | Solo Campaign: Dante's Descent (7 circles) | 5-7 days | Transformative | CD1 + CD7 |
| **3K** | Achievement system (50+ achievements) | 2-3 days | Medium | CD2 Accomplishment |
| **3L** | Seasonal leaderboard with ranked tiers | 2-3 days | Medium | CD2 + CD5 Social |
| **3M** | Deck builder (20+ cards per faction, custom 12-card decks) | 4-5 days | Transformative | CD4 Ownership |
| **3N** | Turn timer with burning rope animation | 1 day | Medium | CD6 + CD8 |

**Total estimated effort: 25-40 days** to reach premium parity across all dimensions.

**Recommended first sprint (Phase 3A-3D): 7-11 days** to achieve the most visible transformation — the game will look, sound, and feel fundamentally different.

---

## 8. Sin-Oriented Theme Bible

To ensure every future decision reinforces the sin theme, here is a reference guide for the visual and narrative language of each faction.

### Wrath
- **Dante's Circle:** Fifth Circle — the River Styx, where the wrathful fight on the surface
- **Visual Motifs:** Cracked stone, molten lava, jagged edges, broken weapons
- **Card Frame:** Fractured stone arch with ember particles leaking through cracks
- **Sound Palette:** Metal clashing, fire roaring, deep war drums
- **Narrator Voice:** Aggressive, mocking — "Was that supposed to hurt?"

### Sloth
- **Dante's Circle:** Fourth Terrace of Purgatory — the slothful must run ceaselessly
- **Visual Motifs:** Fog, cobwebs, wilting flowers, hourglass sand
- **Card Frame:** Overgrown stone arch with vines and moss, crumbling edges
- **Sound Palette:** Low hum, dripping water, distant bells, yawning wind
- **Narrator Voice:** Bored, drawling — "Oh... you're still playing?"

### Greed
- **Dante's Circle:** Fourth Circle — the avaricious push great weights of gold
- **Visual Motifs:** Gold coins, treasure chests, scales, merchant ledgers
- **Card Frame:** Gilded arch encrusted with gems, but tarnished and cracking
- **Sound Palette:** Coin clinking, vault doors, counting, greedy laughter
- **Narrator Voice:** Calculating, merchant-like — "Everything has a price, dear."

### Envy
- **Dante's Circle:** Second Terrace of Purgatory — the envious have their eyes sewn shut
- **Visual Motifs:** Mirrors, shadows, stolen crowns, green flame
- **Card Frame:** Mirror-finish arch that reflects a distorted version of the opponent's frame
- **Sound Palette:** Whispers, glass breaking, distorted echoes
- **Narrator Voice:** Bitter, jealous — "Why should THEY have that?"

### Pride (New)
- **Dante's Circle:** First Terrace of Purgatory — the proud carry enormous stones
- **Visual Motifs:** Marble columns, laurel wreaths, shattered pedestals, blinding light
- **Card Frame:** Pristine white marble arch with gold inlay, but with hairline cracks
- **Sound Palette:** Trumpets, cathedral organ, stone grinding
- **Narrator Voice:** Imperious, condescending — "Kneel."

### Lust (New)
- **Dante's Circle:** Second Circle — the lustful are blown about by violent storms
- **Visual Motifs:** Roses with thorns, silk veils, storm winds, burning hearts
- **Card Frame:** Ornate rose-entwined arch with thorns piercing through
- **Sound Palette:** Wind howling, heartbeats, whispered promises, silk rustling
- **Narrator Voice:** Seductive, dangerous — "Come closer..."

### Gluttony (New)
- **Dante's Circle:** Third Circle — the gluttonous lie in freezing slush
- **Visual Motifs:** Overflowing goblets, rotting feasts, chains, bloated forms
- **Card Frame:** Barrel-shaped arch with dripping liquid and corroded metal bands
- **Sound Palette:** Chewing, gulping, belching, chains dragging
- **Narrator Voice:** Jovial but menacing — "More! There's always room for more!"

---

## References

[1]: https://www.shacknews.com/article/134187/saga-of-sins-stained-glass-window "Saga of Sins dev talks designing a game that looks like a stained glass window"
[2]: https://elfgames.com/2017/03/13/howto-stained-glass-game-inspirations/ "How to Make a Stained Glass Game: Inspirations - Elf Games"
[3]: http://finalbossblues.com/on-hearthstones-ui/ "On Hearthstone's UI - Final Boss Blues"

---

## Asset License Summary

| Asset | License | Attribution Required | Commercial Use |
|---|---|---|---|
| game-icons.net | CC BY 3.0 | Yes (link to site) | Yes |
| OpenGameArt "Fantasy Card Dark Cosmic" | CC0 | No | Yes |
| OpenGameArt "Fantasy UI Borders" | CC0 | No | Yes |
| Painterly Spell Icons (J.W. Bjerk) | CC BY 3.0 | Yes | Yes |
| itch.io "Fantasy Card Game SFX Pack" | Free (check individual) | Varies | Yes |
| itch.io "CARDBACK BUNDLE" by chaak | CC0 | No | Yes |
| Freesound.org effects | CC0 / CC BY | Varies | Yes |
| react-spring | MIT | No | Yes |
| Radix UI (shadcn/ui) | MIT | No | Yes |
