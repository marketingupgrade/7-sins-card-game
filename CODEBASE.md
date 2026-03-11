# CODEBASE.md — 7 Deadly Sins Card Game

> **Purpose**: This document is the single source of truth for any AI agent (or human developer) working on this codebase. It describes the architecture, data flow, game mechanics, and key conventions so that changes can be made confidently without re-reading every file.

---

## 1. Project Overview

A real-time multiplayer card game where 2-4 players each choose a "sin faction" (Wrath, Sloth, Greed, Envy) and battle using faction-specific card decks. The game features a dark neon cyberpunk aesthetic, procedural audio, cinematic animations, and a sarcastic AI narrator.

| Attribute | Value |
|---|---|
| Stack | React 19 + Tailwind 4 + Express 4 + tRPC 11 |
| Database | Supabase (external Postgres) |
| Auth | Manus OAuth (session cookie) |
| Real-time | Supabase Realtime (Postgres Changes) |
| Audio | Web Audio API (procedural, no asset files) |
| Animations | Framer Motion + CSS keyframes |
| Testing | Vitest (150+ tests) |
| Deployment | Manus hosting platform |

---

## 2. Architecture

### 2.1 Directory Map

```
shared/                  ← Types + constants shared between client & server
  gameTypes.ts           ← SinType, CardDefinition, GameState, all game constants
  cardData.ts            ← 40 card definitions (10 per faction × 4 factions)
  supabaseClient.ts      ← Supabase client factory (browser + server)

server/                  ← Express + tRPC backend
  routers.ts             ← tRPC procedures (game.create, game.join, etc.)
  gameEngine.ts          ← Server-side game logic (1048 lines)
  db.ts                  ← Drizzle query helpers
  supabaseServer.ts      ← Server Supabase client with service role key
  storage.ts             ← S3 file storage helpers

client/src/
  pages/
    Home.tsx             ← Landing page with faction preview cards
    Lobby.tsx            ← Room code, sin selection, bot management
    GameBoard.tsx        ← Main game UI (938 lines)
  lib/
    gameEngine.ts        ← Client-side Supabase game operations (1054 lines)
    botEngine.ts         ← Bot AI with personality-driven decision making (805 lines)
    soundEngine.ts       ← Procedural SFX via Web Audio API
    musicEngine.ts       ← Dynamic background music system
    cardArtUrls.ts       ← CDN URLs for AI-generated card illustrations
    factionPortraits.ts  ← CDN URLs for faction character portraits
  hooks/
    useGameState.ts      ← Real-time game state subscription
    useFactionUnlocks.ts ← Faction gating system (play-count progression)
    useNarrator.ts       ← Sarcastic narrator text queue
    useBotController.ts  ← Automated bot turn execution
    useCard3DTilt.ts     ← 3D perspective tilt on hover
  components/
    GameCard.tsx          ← Card rendering with art, effects, tier borders
    GameOverScreen.tsx    ← Victory/defeat screen with stats + shareable battle card
    FloatingNumbers.tsx   ← Damage/heal number animations
    YourTurnBanner.tsx    ← Full-screen turn announcement
    ScreenShake.tsx       ← Board shake on heavy hits
    EnergyOrbs.tsx        ← Visual energy pip display
    HpCriticalOverlay.tsx ← Red vignette at low HP
    RoundTransitionWipe.tsx ← Cinematic round transitions
    SinDrone.tsx          ← Procedural ambient audio per faction
    SinReactiveBackground.tsx ← Dynamic background color shifts
    DeathSequence.tsx     ← Player elimination animation
    WebSpeechNarrator.tsx ← TTS narrator announcements
    ShareableBattleCard.tsx ← Canvas-generated social media card
    DynamicMusic.tsx      ← Music intensity cross-fading
    WebGLSinShaders.tsx   ← Animated card hover overlays
    SinCursor.tsx         ← Particle trail cursor
    CardPlayArc.tsx       ← Card flight animation
    FactionUnlockCelebration.tsx ← Unlock cinematic overlay
    TutorialOverlay.tsx   ← Interactive tutorial system
    EmberField.tsx        ← Floating particle background
    MusicToggle.tsx       ← Music on/off control
    SoundToggle.tsx       ← SFX on/off control

drizzle/
  schema.ts              ← MySQL/TiDB schema (users table only — game state in Supabase)
```

### 2.2 Data Flow

Game state lives in **Supabase** (external Postgres), not in the Drizzle/TiDB database. The Drizzle database is only used for Manus OAuth user accounts.

```
Player Action → client/lib/gameEngine.ts → Supabase RPC/direct update
                                         ↓
                              Supabase Realtime subscription
                                         ↓
                              useGameState hook → React re-render
```

Key Supabase tables (created via Supabase dashboard, not Drizzle migrations):

| Table | Purpose |
|---|---|
| `games` | Game metadata: id, room_code, status, current_round, current_player_index, winner_id |
| `game_players` | Player state per game: hp, energy, hand (JSON), deck (JSON), chosen_sin, seat_index |
| `active_effects` | Ongoing card effects: DoTs, shields, buffs with tick tracking |
| `game_log` | Action history for post-game stats and replay |

### 2.3 Client ↔ Server Split

The tRPC server (`server/routers.ts`) is thin — it handles game creation, joining, and starting. Most game logic runs **client-side** in `client/src/lib/gameEngine.ts`, which writes directly to Supabase. This was a deliberate choice to minimize server round-trips for a real-time card game.

The server-side `server/gameEngine.ts` contains the authoritative game logic (card resolution, damage calculation, effect processing) but is currently invoked from the client-side engine via Supabase function calls.

---

## 3. Game Mechanics

### 3.1 Sin Factions

| Faction | Playstyle | Passive Ability |
|---|---|---|
| **Wrath** | Aggressive damage, self-harm | **Overcharge**: Burn 2 HP for +1 energy |
| **Sloth** | Defensive shields, heals | **Lethargy**: Unspent energy carries over (max +2) |
| **Greed** | Resource theft, energy drain | **Avarice**: Cards costing 3+ grant +1 bonus energy next turn |
| **Envy** | Copy effects, punish leaders | **Covet**: Gain +1 energy if any opponent has more HP |

### 3.2 Card System

Each faction has 10 cards. Cards come in two types:

**Flat cards** resolve instantly with their full base value. **Compounding cards** tick for 3 rounds with Fibonacci escalation `[1×, 1×, 2×]`, yielding `base × 4` total value over 3 rounds. Only the initial play costs energy.

Card tiers (common, rare, epic) affect visual styling but not gameplay balance.

### 3.3 Energy (Corruption) System

Players start at 2 energy, gain +1 per round, capped at 7 (the seven deadly sins). Energy fully refreshes each turn ("use it or lose it"), except for Sloth's carryover passive.

### 3.4 Catch-Up Mechanic

Some cards have a `catchup` property that grants bonus effects when the player is behind (lower HP than opponents). This prevents runaway leaders and keeps games competitive.

### 3.5 Faction Unlock System

Greed and Envy are **gated behind a play-count requirement** (3 games). This is tracked in `localStorage` under `7sins_total_games`. The `useFactionUnlocks` hook manages the state. When the threshold is reached, a cinematic celebration overlay plays once.

| Key | Purpose |
|---|---|
| `7sins_total_games` | Total games completed |
| `7sins_total_wins` | Total wins |
| `7sins_win_streak` | Current consecutive wins |
| `7sins_faction_${sin}` | Games played per faction |
| `7sins_faction_${sin}_wins` | Wins per faction |
| `7sins_unlock_celebrated` | Whether unlock animation has played |

---

## 4. Audio System

All audio is **procedurally generated** using the Web Audio API — there are zero audio asset files.

`soundEngine.ts` creates SFX by chaining oscillators, gain nodes, and filters. Each sound (card play, damage, heal, game start, etc.) is a function that builds a transient audio graph.

`musicEngine.ts` manages three intensity layers (calm, tense, climactic) that cross-fade based on game round progression. Each layer is a looping oscillator pattern.

`SinDrone.tsx` generates faction-specific ambient textures: Wrath = bass rumble, Sloth = ethereal hum, Greed = shimmering tones, Envy = dissonant intervals.

---

## 5. Bot System

`botEngine.ts` implements AI opponents with personality-driven decision making. Bots have names, personality traits, and weighted decision matrices that vary by faction. The bot controller (`useBotController.ts`) runs on a timer, executing bot turns with realistic delays.

Bot names are sarcastic (e.g., "Definitely Not A Bot", "Your Replacement"). Each bot evaluates available cards based on game state, target selection, and personality weights.

---

## 6. Visual Effects Pipeline

All 15 multimedia features are implemented as standalone React components that can be toggled independently:

| Component | Trigger | Technology |
|---|---|---|
| FloatingNumbers | Damage/heal events | CSS animation + React portal |
| YourTurnBanner | Turn start | Framer Motion |
| ScreenShake | Damage >= 15 | CSS transform + Vibration API |
| EnergyOrbs | Energy changes | SVG + Framer Motion |
| HpCriticalOverlay | HP < 20% | CSS vignette + Web Audio |
| RoundTransitionWipe | Round change | Framer Motion |
| SinDrone | Active game | Web Audio API oscillators |
| SinReactiveBackground | Leading player change | CSS gradient transition |
| DeathSequence | Player elimination | Framer Motion keyframes |
| WebSpeechNarrator | Card plays, deaths, victories | Web Speech API |
| ShareableBattleCard | Game over | HTML Canvas |
| DynamicMusic | Round progression | Web Audio cross-fade |
| WebGLSinShaders | Card hover | CSS animations (fallback from WebGL) |
| SinCursor | Mouse movement | CSS custom cursor + trail |
| CardPlayArc | Card played | Framer Motion layout animation |

---

## 7. Testing

Tests live in `server/*.test.ts` and use Vitest. Current test suites:

| File | Tests | Coverage |
|---|---|---|
| `game.test.ts` | 57 | Game creation, joining, sin selection, card play, turn flow |
| `gameLogic.test.ts` | 39 | Damage calculation, compounding, catch-up, energy passives |
| `factionUnlocks.test.ts` | 28 | Unlock threshold, progress tracking, faction availability |
| `tutorial.test.ts` | 21 | Tutorial step progression, completion tracking |
| `supabase.test.ts` | 4 | Supabase connectivity validation |
| `auth.logout.test.ts` | 1 | Auth logout flow |

Run all tests: `npx vitest run`

---

## 8. Key Conventions

### 8.1 Naming

All sin-related colors use semantic names: `text-wrath`, `bg-sloth`, `border-greed`, `text-envy`. These are defined as CSS custom properties in `index.css` using OKLCH color space.

Glass panel variants: `glass-panel-wrath`, `glass-panel-sloth`, `glass-panel-greed`, `glass-panel-envy` provide faction-tinted glassmorphism.

### 8.2 Fonts

Two font families are used throughout:
- `var(--font-heading)` — "Orbitron" for titles, labels, UI chrome
- `var(--font-body)` — "Space Grotesk" for body text, descriptions, narrator

### 8.3 Narrator Voice

All user-facing text should maintain the game's sarcastic, contemptuous tone. The narrator treats players with amused disdain. Examples of the voice:
- "Pick a sin. It's basically a personality test you'll fail."
- "The bots are judging you. Yes, the bots."
- "No refunds. No mercy. No take-backsies."

### 8.4 localStorage Keys

All localStorage keys are prefixed with `7sins_` to avoid collisions. See Section 3.5 for the complete list.

### 8.5 CDN Assets

All static assets (card art, portraits, backgrounds) are hosted on CloudFront CDN. URLs are centralized in:
- `client/src/lib/cardArtUrls.ts` — Card illustrations
- `client/src/lib/factionPortraits.ts` — Character portraits
- `client/src/lib/assetUrls.ts` — Miscellaneous assets

Never store image files in the project directory. Always upload to CDN via `manus-upload-file --webdev` and reference the returned URL.

---

## 9. Common Modification Patterns

### Adding a new card

1. Add the `CardDefinition` to `shared/cardData.ts` in the appropriate faction array
2. Generate card art and upload to CDN, add URL to `client/src/lib/cardArtUrls.ts`
3. The card will automatically appear in the faction's deck — no other changes needed

### Adding a new visual effect

1. Create a component in `client/src/components/NewEffect.tsx`
2. Import and render it in `GameBoard.tsx` with appropriate trigger conditions
3. Add a sound to `soundEngine.ts` if the effect needs audio

### Modifying game balance

All balance constants are in `shared/gameTypes.ts`:
- `STARTING_HP`, `MAX_ENERGY`, `ENERGY_PER_ROUND`
- `COMPOUND_MULTIPLIERS`, `CATCHUP_HP_THRESHOLD`
- Sin-specific constants: `SLOTH_MAX_CARRYOVER`, `WRATH_OVERCHARGE_HP_COST`, etc.

Card values are in `shared/cardData.ts`. Each card's `effects[].baseValue` and `cost` determine its power level.

### Adding a new sin faction

1. Add the sin to `SinType` in `shared/gameTypes.ts`
2. Add 10 cards to `shared/cardData.ts`
3. Add passive logic in both `server/gameEngine.ts` and `client/src/lib/gameEngine.ts`
4. Add visual config in `Lobby.tsx` (`SIN_CONFIG`) and `Home.tsx` (sin preview array)
5. Add CSS variables for the new sin color in `index.css`
6. Generate and upload faction portrait and card art assets
7. Update `useFactionUnlocks.ts` if the faction should be gated

---

## 10. Environment & Secrets

The project uses two databases:
- **TiDB/MySQL** (via Drizzle) — Manus OAuth user accounts only
- **Supabase** (external) — All game state, real-time subscriptions

Key environment variables are injected by the Manus platform. The Supabase credentials (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) connect to an external Supabase project.

---

## 11. Known Limitations

1. **Game state is client-authoritative** — The client writes directly to Supabase. A malicious client could cheat. For a production game, move card resolution to server-side RPC functions.
2. **No persistent player profiles** — Win/loss stats are in localStorage, not tied to authenticated accounts. A database-backed profile system would enable cross-device progress.
3. **Template TS errors** — `Markdown.tsx` and `ComponentShowcase.tsx` have pre-existing type errors from the template. These do not affect game functionality.
4. **Bot turns are client-driven** — Bot logic runs in the host player's browser. If the host disconnects, bots stop playing.
