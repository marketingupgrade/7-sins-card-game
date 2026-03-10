# 7 Deadly Sins Card Game - TODO

## Core Infrastructure
- [x] Install dependencies (Babylon.js, @supabase/supabase-js, motion)
- [x] Configure dark neon cyberpunk theme (index.css, fonts)
- [x] Set up Supabase client with external project credentials
- [x] Configure environment variables for Supabase

## Game Data & Logic
- [x] Define card data for Wrath (10 cards) and Sloth (10 cards)
- [x] Implement compounding mechanic (Effective Value = Base Value × Round, max 10)
- [x] Build game state machine (lobby → draft → active → finished)
- [x] Implement turn system (draw → play/pass → resolve → next)
- [x] Active effects system (DoTs, shields, buffs with round recalculation)
- [x] Deck management (shuffle, draw, discard)

## API Routes (tRPC)
- [x] Game creation endpoint (generate room code)
- [x] Join game endpoint
- [x] Choose sin endpoint
- [x] Play card endpoint
- [x] Pass turn endpoint
- [x] Get game state endpoint

## Lobby & Auth
- [x] Lobby page with room code creation/joining
- [x] Sin selection screen (Wrath vs Sloth)
- [x] Player list with ready status
- [x] Game start when all 4 players ready (min 2 players)

## Multiplayer (Supabase Realtime)
- [x] Real-time game state subscription
- [x] Real-time player join/leave notifications
- [x] Real-time turn updates
- [x] Real-time effect resolution broadcasts

## Game Board UI
- [x] Game board layout (4 player positions, center play area)
- [x] Card hand display with fan layout
- [x] HP bars for all players
- [x] Round counter and turn indicator
- [x] Active effects display
- [x] Game log / combat history panel

## 3D & Animations
- [x] Babylon.js 3D scene setup
- [x] Card play animations (hand → center)
- [x] Particle effects for damage/heal/shield
- [x] Motion (Framer Motion) page transitions
- [x] Motion card hover/select animations
- [x] Motion UI element entrance/exit animations

## Visual Polish
- [x] Dark neon cyberpunk color scheme
- [x] Blood red (Wrath) and muted purple (Sloth) theming
- [x] Sassy narrator text system
- [x] Card art placeholders with sin-themed designs
- [x] Victory/defeat screens

## Deployment
- [x] Push to GitHub repository
- [x] Deploy to Vercel
- [x] Configure environment variables on Vercel

## Bot Players
- [x] Add bot player logic to client-side game engine
- [x] Bot AI: auto-choose sin, auto-play cards, auto-pass
- [x] "Add Bot" button in lobby UI
- [x] Bot turn execution with slight delay for realism
- [x] Bot difficulty: smart card selection based on game state

## Design Overhaul
- [x] Redesign Home page with premium layout, better visual hierarchy
- [x] Redesign card components with glassmorphism, gradients, and depth
- [x] Improve lobby page with better spacing, card-based player slots
- [x] Redesign game board with cleaner layout and visual polish
- [x] Better typography hierarchy and spacing throughout
- [x] Improved color palette with more depth and contrast
- [x] Add subtle background textures and ambient effects
- [x] Better button styles with hover states and micro-interactions
- [x] Improve HP bars with animated gradients
- [x] Better narrator text presentation
- [x] Mobile responsive improvements

## Tone of Voice
- [x] Sassy and cynical narrator tone throughout ALL UI text
- [x] Rewrite all button labels, headings, and descriptions with attitude
- [x] Add more narrator quips for game events

## Bug Fixes
- [x] Fix bot UUID format — bot IDs like 'bot-58d8ceb0' are not valid UUIDs, causing Supabase insert failure
- [x] Fix missing Supabase env vars on Vercel deployment (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [x] SECURITY: Remove env var names from UI error messages — never expose internal config to users
- [x] Make Supabase client handle missing env vars gracefully with console-only logging

## Compound Effects UI
- [x] Add compound effects balance sheet — chronological timeline showing upcoming effects per player

## Energy System
- [x] Research energy/mana system best practices from top card games
- [x] Design energy system tailored to 7 Deadly Sins theme (Corruption)
- [x] Implement energy in game types, engine, and card costs
- [x] Update UI to display energy bars, card costs, and energy feedback
- [x] Integrate energy with bot AI decision-making
- [x] Add Wrath Overcharge ability (burn HP for energy)
- [x] Add Sloth Lethargy passive (carryover unspent energy)
- [x] Add 2 new 0-cost risk cards (Corruption Surge, Deep Slumber)
- [x] Rebalance Apocalypse Fist to cost 5
- [x] Add energy columns to Supabase game_players table
- [x] Write energy system tests (75 tests passing)

## Bug Fixes (Round 2)
- [x] Fix decimal numbers in game — all HP/damage/heal values now use Math.round
- [x] Fix calculateEffectiveValue to always return integers

## New Sin Factions: Greed & Envy
- [x] Mathematical balance analysis of existing Wrath/Sloth card stats
- [x] Design Greed faction identity, passive, and 10 cards
- [x] Design Envy faction identity, passive, and 10 cards
- [x] Implement Greed card data in cardData.ts
- [x] Implement Envy card data in cardData.ts
- [x] Update SinType to include greed and envy
- [x] Add Greed/Envy color themes and icons to UI
- [x] Update game engines (client + server) for new sin passives
- [x] Update bot AI for Greed and Envy decision-making
- [x] Update Lobby sin selection UI for 4 sins
- [x] Update Home page to showcase 4 sins
- [x] Update GameCard and PlayerPanel for new sin colors
- [x] Update and run all tests (83 tests passing)

## Mathematical Card Balance (Full Analysis)
- [x] Build comprehensive EV/variance/efficiency model for all 40 cards
- [x] Run Monte Carlo matchup simulations (all 6 faction pairs, 10K+ games each)
- [x] Identify statistical outliers and dominance patterns
- [x] Compute rebalanced card values using optimization
- [x] Apply rebalanced values to cardData.ts (Lazy Drain dmg 1->2, Covetous Strike dmg 3->2)
- [x] Run tests and verify balance improvements (83 tests passing)
- [x] Generate balance report (EXCELLENT grade, 1.7% max faction deviation)

## Bug Fixes (Round 3)
- [x] New factions (Greed & Envy) not showing in live game (user viewing old Vercel deploy, needs republish)
- [x] Improve text contrast on sin cards - descriptions and labels too dark/hard to read
- [x] Improve overall text contrast across Home, Lobby, GameBoard, GameCard, CompoundBalanceSheet

## Bug Fixes (Round 4)
- [x] Fix shield absorption bug — shields now absorb incoming damage before HP is reduced
- [x] Improve compound effect clarity in UI (show MULTIPLIER ×N, base×round=value formula, shield/catchup notes)

## Catch-Up Mechanism Cards
- [x] Design catch-up cards for Wrath (Desperate Fury, Last Stand)
- [x] Design catch-up cards for Sloth (Survival Instinct, Feign Death)
- [x] Design catch-up cards for Greed (Desperate Gambit, Bankruptcy Protection)
- [x] Design catch-up cards for Envy (Resentful Strike, Equalizer)
- [x] Balance new cards using /math EV analysis
- [x] Implement new cards in cardData.ts (48 total cards, 12 per faction)
- [x] Add CatchupEffect type and catchup property to CardDefinition
- [x] Implement shield absorption in game engines (client, server, bot)
- [x] Implement catch-up bonus resolution in game engines (client, server, bot)
- [x] Update bot AI for catch-up card awareness
- [x] Run tests and verify (87 tests passing)

## Bug Fixes (Round 5)
- [x] Fix corruption/energy bar visual - switched from dynamic Tailwind classes to inline CSS custom properties

## Compounding Mechanic Rework (Fibonacci [1, 1, 2])
- [x] Redesign compounding: cards persist as escalating effects (DoT, HoT, SoT, steal-over-time)
- [x] Cards are either FLAT (one-time powerful) or COMPOUNDING (weaker base, ticks for 3 rounds with Fibonacci [1,1,2])
- [x] Compounding applies to: damage, heal, shield, steal HP/shield/energy
- [x] Redesign all 48 cards with flat vs compounding categories
- [x] Rebalance all cards with /math EV analysis
- [x] Update shared types (CardDefinition, CardType, COMPOUND_MULTIPLIERS, getCompoundTickValue)
- [x] Rewrite game engines (client + server + bot) for proper escalating DoT/HoT/SoT resolution
- [x] Update UI to show flat vs compounding indicators and active tick effects
- [x] Update Home page with flat vs compounding mechanic explainer
- [x] Update and run tests (101 tests passing across 4 test files)
- [x] Push to GitHub for Vercel deployment

## Tutorial / Onboarding Flow
- [x] Design tutorial system architecture (step-based state machine with localStorage persistence)
- [x] Build TutorialProvider context with step tracking, highlight targets, and tooltip positioning
- [x] Create TutorialOverlay component with spotlight cutout, animated tooltip, step counter, and next/skip/back controls
- [x] Tutorial Step: Welcome overlay explaining the game concept
- [x] Tutorial Step: Home — create game, join game, factions, card mechanics
- [x] Tutorial Step: Lobby — room code, sin selection, add bots, start game
- [x] Tutorial Step: Game Board — HP bars, energy bar, turn order, targeting
- [x] Tutorial Step: Hand/Cards — flat vs compounding card types, cost, and effects
- [x] Tutorial Step: Compounding effects — 3-round tick system (1×, 1×, 2×)
- [x] Tutorial Step: Balance Sheet — effects ledger and upcoming ticks
- [x] Tutorial Step: Pass turn — when doing nothing is the right move
- [x] Tutorial Step: End of tutorial — congratulate and offer to replay or dismiss
- [x] Add "How to Play" button on Home page that launches tutorial
- [x] Persist tutorial completion in localStorage so it doesn't repeat
- [x] Auto-trigger tutorial for first-time visitors (1.5s delay)
- [x] Add data-tutorial attributes to Home, Lobby, and GameBoard pages
- [x] Keyboard navigation (arrow keys, Enter, Escape)
- [x] Write tests for tutorial state machine (122 tests passing across 5 files)
- [x] Push to GitHub for Vercel deployment

## UI Enhancement Pass — Make It Epic
- [x] Global CSS: 15+ new keyframe animations (border-rotate, shimmer, holo-spin, ember-rise, pulse-ring, damage-shake, energy-flow, hp-shimmer, stagger-fade-in, compound-badge-pulse, float-drift, text-reveal, glow-breathe, divider-flow)
- [x] Global CSS: glass-panel-epic with animated rotating border gradient
- [x] Global CSS: EmberField particle component for arena atmosphere
- [x] Global CSS: shimmer-overlay, holo-sheen, badge-flat, badge-compound utility classes
- [x] Global CSS: active-turn-glow, hp-bar-fill, energy-bar-fill with animated flow
- [x] Home page: EmberField floating particles + enhanced corner gradient accents
- [x] Home page: glass-panel-epic with shimmer on game panel
- [x] Home page: 3D tilt SinCard faction cards with holographic sheen + animated dots
- [x] Home page: Animated gradient divider (neon-divider-animated)
- [x] Lobby: EmberField particles + glass-panel-epic room code card
- [x] Lobby: Animated room code with character-by-character entrance
- [x] Lobby: Sin selection cards with pulse-ring, holo-sheen, glow-breathe icons, animated dots
- [x] GameBoard: EmberField particles in arena
- [x] GameBoard: HP bar with shimmer overlay (hp-bar-fill class)
- [x] GameBoard: Energy bar with animated flow (energy-bar-fill class)
- [x] GameBoard: Active turn glow effect on current player panel
- [x] GameCard: 3D perspective tilt on hover with holographic sheen
- [x] GameCard: badge-flat / badge-compound animated type badges
- [x] GameCard: Energy cost orb with sin-colored glow shadow
- [x] All 122 tests still passing
- [ ] Push to GitHub for Vercel deployment

## Open Source Asset Integration
- [x] Browse opensource3dassets.com for card art, faction icons, and background textures (3D models, not ideal for 2D card game)
- [x] Browse opengameart.org for card art, icons, sound effects, and UI elements
- [x] Download and prepare 17 SFX files (WAV→MP3 conversion) + 16 spell icons (PNG) uploaded to CDN
- [x] Integrate Painterly Spell Icons (CC-BY 3.0) as card art — sin-specific icons for damage, heal, shield, buff, debuff, energy
- [x] Create cardIconMap.ts mapping card effects × sins to appropriate spell icons
- [x] Create SoundEngine (soundEngine.ts) — preloading, volume control, localStorage persistence, game event mapping
- [x] Integrate 17 contextual SFX: fire/ice/electric damage, heal chimes, shield activate, dark magic, energy drain, card play/draw/shuffle, turn pass, teleport
- [x] Sin-specific damage sounds: Wrath=fire, Sloth=ice, Envy=electric, Greed=sword swing
- [x] Sound effects on Home (create/join), Lobby (sin select, add bot, start), GameBoard (play card, pass, overcharge)
- [x] SoundToggle component with volume slider, mute toggle, hover reveal
- [x] All 122 tests still passing across 5 files
- [ ] Push to GitHub for Vercel deployment
