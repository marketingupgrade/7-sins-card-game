# Development Memory — 7 Deadly Sins Card Game

This file documents all development steps, decisions, and context for continuity across sessions.

---

## Session: March 11, 2026

### Deployment Rule
- **NEVER push to Manus hosting.** All deployments go to GitHub → Vercel picks up from `main` branch.
- Repo: `https://github.com/marketingupgrade/7-sins-card-game`
- Live URL: `https://tf-7-sins.vercel.app/`

### Current Task: Visual & UX Overhaul + Unlock System

**User feedback from mobile screenshot (Vercel deploy):**
1. **Card readability** — text too small on mobile, hard to read card names/effects/costs
2. **Faction portraits** — still using basic Lucide icons, need real character art from open-source libraries
3. **Homepage** — user wants Babylon.js 3D scene for visual impact
4. **Unlock system** — gate 2 factions behind play count (Octalysis CD2 + CD6)

### Steps Planned

#### Step 1: Read current components
- Read GameCard.tsx, faction selection in Lobby.tsx, Home.tsx, cardData.ts
- Understand current icon/art mapping system

#### Step 2: Card Readability Fix
- Increase font sizes for card name, effect description, energy cost
- Add text shadows/overlays for contrast against card art
- Improve mobile layout spacing

#### Step 3: Faction Portraits
- Search OpenGameArt, itch.io, game-icons.net for sin-themed character portraits
- Download 4 portraits (Wrath, Sloth, Greed, Envy)
- Upload to CDN, update faction selection and player panels

#### Step 4: Replace Basic Icons
- Replace Lucide icons on cards with game-specific art
- Use game-icons.net SVGs or similar for per-card unique icons

#### Step 5: Babylon.js Homepage
- Install @babylonjs/core
- Create dark fantasy 3D scene (floating cards, particles, lighting)
- Integrate as background canvas on Home.tsx

#### Step 6: Faction Unlock System
- Track games_played in localStorage
- Gate Envy + Greed behind 3 games played
- Show locked state with progress indicator
- Unlock celebration animation

#### Step 7: Push to GitHub
- `git push github main` after each major milestone
- Vercel auto-deploys from main

---

### Previous Work Summary (completed before this session)
- Full game engine: 4 factions (Wrath, Sloth, Greed, Envy), 20 unique cards
- Client-side game engine with bot AI
- Compounding effects with Fibonacci multipliers, catch-up mechanics
- Tutorial system (20 steps), SFX system, ambient music
- E2E playtested all 4 factions — both win conditions work
- Octalysis audit (228/640) — implemented 3 quick wins (battle summary, win streak, rematch)
- Fixed effect badge "97r" display bug
- 122 tests passing across 5 test files

### Tech Stack
- React 19 + Tailwind 4 + tRPC 11 + Express 4
- Drizzle ORM + TiDB (MySQL)
- Framer Motion for animations
- Howler.js for audio
- shadcn/ui components
- Vitest for testing

### Step 1 Progress: Read Current Components

**GameCard.tsx** (lines 1-307):
- Card dimensions: `w-[160px] h-[240px]` — small on mobile
- Card name: `text-[13px]` — too small
- Effect text: `text-[10px]` — barely readable
- Type badges: `text-[8px]` — tiny
- Cost badge: `w-7 h-7 text-[12px]` — small
- Card art area: `h-[80px]` — exists, uses CARD_ART_URLS mapping
- Flavor text: `text-[9px]` — microscopic
- Already has AI-generated card art via CARD_ART_URLS (48 images from manuscdn)
- Uses Lucide icons as fallback when no art URL exists: Flame, Moon, Coins, Eye, Swords, Heart, Shield, Zap

**Lobby.tsx** faction selection:
- Uses Lucide icons only (Flame, Moon, Coins, Eye) — no portraits
- SIN_CONFIG has Icon, color, glassClass, label, desc, tagline, quip
- Grid layout: `grid-cols-2 gap-4`, icons `w-9 h-9`
- Need to add portrait images to each faction card

**Home.tsx**:
- Currently uses EmberField particle effect + Framer Motion
- Floating Lucide icons as background decoration
- No 3D scene — user wants Babylon.js

**Card IDs**: wrath_01-12, sloth_01-12, greed_01-12, envy_01-12 (48 total)
**Card art**: Already has CDN URLs for all 48 cards in cardArtUrls.ts

### Key Decisions
- Card readability: increase all font sizes by ~50%, add stronger text shadows
- Faction portraits: search game-icons.net, OpenGameArt for character art
- Babylon.js: floating 3D card scene with particle effects behind homepage content
- Unlock: Envy + Greed locked behind 3 games played (they're "advanced" factions)
