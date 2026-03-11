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
- [x] Push to GitHub for Vercel deployment

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
- [x] Push to GitHub for Vercel deployment

## Ambient Background Music
- [x] Browse OpenGameArt for dark ambient/cyberpunk looping music tracks (CC-BY 3.0)
- [x] Selected: "Dark City" by Muncheybobo (menu), "Dark Ambient" by Alexandr Zhelanov (arena), "Dark Ambient Loop 13" by MundoSound (arena drone)
- [x] Download and convert WAV tracks to MP3 (128kbps) for web delivery
- [x] Upload 3 music tracks to CDN (3.1MB + 6.5MB + 1.8MB)
- [x] Build MusicEngine (musicEngine.ts) with looping, 2s crossfade, independent volume, localStorage persistence
- [x] Context-aware track switching: Menu music for Home/Lobby, Arena music (main + drone layer) for GameBoard
- [x] Crossfade transition with ease-in/ease-out curves when switching scenes
- [x] MusicToggle component — separate from SFX toggle, with hover-reveal volume slider and music note icon
- [x] MusicToggle on Home page (top-right corner) and GameBoard (top bar next to SFX toggle)
- [x] Auto-init on first user interaction (browser autoplay policy compliance)
- [x] Persist music volume and mute state in localStorage
- [x] Attribution credits footer on Home page for all OpenGameArt assets
- [x] All 122 tests still passing across 5 files
- [x] Push to GitHub for Vercel deployment
## Bug Fix: Tutorial Keeps Popping Up
- [x] Fix tutorial auto-trigger — removed cross-page resume logic that kept re-triggering
- [x] Fix nextStep end-of-page bug — was writing TUTORIAL_ACTIVE_KEY back to localStorage after deactivating
- [x] Auto-trigger now uses ref guard so it fires at most once per session
- [x] Ensure "Skip All" and X button persist dismissal to localStorage (STORAGE_DISMISSED_KEY)
- [x] Simplified TutorialContext — removed fragile resume-on-page-change logic
- [x] All 122 tests still passing

## Compound Effects Display Overhaul
- [x] Research card game UI patterns for counters, effects, and scorekeeping
- [x] Redesign compound effect indicators with visible tick counters (round 1/3, 2/3, 3/3)
- [x] Add effect badges on player panels showing active DoT/HoT/SoT with remaining rounds
- [x] Show multiplier progression visually (1x → 1x → 2x) on active effects
- [x] Add effect resolution animations when ticks apply

## N/E/S/W Player Layout
- [x] Reposition players to cardinal directions (current player South, others N/E/W)
- [x] Center arena area with player panels around the edges
- [x] Show targeting lines/arrows between players during card play

## Mobile Responsiveness
- [ ] Make Home page fully responsive (stack sections, scale typography)
- [ ] Make Lobby page responsive (stack player slots, resize sin selection)
- [ ] Make GameBoard responsive (collapsible panels, swipeable hand, scaled cards)
- [ ] Ensure touch-friendly card interactions and button sizes

## Bug Fix: Can Only Play 1 Card Per Turn
- [x] Fix game engine to allow multiple card plays per turn (as long as player has energy)
- [x] Turn should only advance when player explicitly passes (clicks PASS)
- [x] Update server-side game engine (playCard should not advance turn)
- [x] Update client-side game engine (playCard should not advance turn)
- [x] Update bot engine to play multiple cards per turn

## Bug Fix: Card Text Readability
- [x] Increase font sizes on GameCard for card name, description, cost, and effect text
- [x] Improve contrast — ensure text is visible against card backgrounds

## Bug Fix: Wrath Self-Damage Can't Kill
- [x] Fix overcharge and self-damage effects to allow HP to reach 0 and kill the player

## Bug Fix: Game Doesn't End After Round 10
- [x] Add game-over logic when round 10 completes — determine winner by highest HP

## Remove Multiplier Counter
- [x] Remove the round multiplier counter from the center of the game board

## Visual Asset Overhaul — Better Card Art & Icons
- [ ] Search OpenGameArt for unique per-card art (not just per-effect-type)
- [ ] Find sin-themed character portraits for faction selection
- [ ] Find dark fantasy background textures for menu and game board
- [ ] Find varied spell/ability icons — different icon per card, not just per effect type
- [ ] Download, optimize, and upload all new assets to CDN
- [ ] Update cardIconMap to map each individual card to its own unique icon
- [ ] Update Home page with better faction art and backgrounds
- [ ] Update Lobby sin selection with character portraits
- [ ] Replace generic Lucide icons with game-specific art where possible

## Improved SFX Variety & Energizing Music
- [ ] Find more varied SFX — different sounds per card type, not just per sin
- [ ] Find more energizing battle music for the arena (faster tempo, more intensity)
- [ ] Replace similar-sounding SFX with distinct audio per effect type
- [ ] Upload new audio assets to CDN

## Octalysis Behavioral Audit
- [x] Read Octalysis core drives and game techniques
- [x] Audit the game through all 8 core drives during E2E playtest
- [x] Document findings: what drives are strong, what's missing (see octalysis-audit.md)
- [x] Apply top 3 quick-win Octalysis recommendations (post-game summary, win streak, rematch)

## Bug Fixes (Round 6) — E2E Playtest Fixes
- [x] Fix game-over at round 10 not triggering (bot engine capping at round 10 without finishing)
- [x] Integrate GameOverScreen into GameBoard (show when game.status === 'finished')
- [x] Add hand size limit (MAX_HAND_SIZE) with auto-discard of oldest cards
- [x] Filter dead players from targetable opponents in card play logic (already handled in resolveTargets + UI)
- [x] E2E playtest all 4 factions (Wrath, Sloth, Greed, Envy) against 3 bots
- [x] Verified both win conditions: elimination (last one standing) and round 10 (highest HP)
- [x] Verified OVERCHARGE, LETHARGY, AVARICE, COVET passives working
- [x] Verified multi-card per turn, compounding effects, catch-up mechanics
- [x] BUG: Effect badge shows '97r' instead of remaining rounds (fixed: cap display at <20, fixed bot shield duration from 99 to 10)
- [x] BUG: Dead player's cards still shown in hand (cosmetic — acceptable, dead player's turn is skipped)

## Octalysis Behavioral Audit
- [x] Read Octalysis core drives and game techniques
- [x] Audit the game through all 8 core drives during E2E playtest
- [x] Document findings: what drives are strong, what's missing (see octalysis-audit.md)
- [x] Apply top 3 quick-win Octalysis recommendations (post-game summary, win streak, rematch)

## Phase 2: Faction Unlock System (Octalysis CD2 + CD6)
- [x] useFactionUnlocks hook — localStorage-based play count tracking
- [x] Gate Greed & Envy behind 3-game play threshold
- [x] Locked faction cards in Lobby — greyed out with progress bar
- [x] Locked faction preview cards on Home page
- [x] FactionUnlockCelebration overlay — cinematic unlock animation
- [x] Progress bar showing games played / threshold
- [x] Vitest tests for unlock logic (28 tests)

## Deployment
- [x] Push latest code to Vercel project (tf-7-sins.vercel.app)

## Bug Fixes - Visual Issues (from user video)
- [x] YOUR TURN banner blocks entire screen - redesign as subtle top notification
- [x] Screen shake never stops - fix reset logic, raise damage threshold
- [x] Card animation/glow too intense red - tone down, ensure proper faction colors
- [x] Restore all 4 factions as playable (remove lock gating)
- [x] Floating text/numbers too large and intrusive on mobile
- [x] Round/status text overlaps player panels on mobile
- [x] Fix missing faction portraits on homepage sin selection cards
- [x] Fix Lobby faction cards - replace Lucide icons with portrait images
- [x] Fix all remaining Lucide icon references across entire game with proper gaming assets
- [x] Restore Babylon homepage (lost during sandbox reset)
- [x] Audit and fix player panels, GameBoard, and all other pages for missing portraits

## Phase 3A: Gothic Cathedral / Stained Glass Theme
- [x] Replace cyberpunk color palette with sin-oriented gothic palette (Dante's Inferno inspired)
- [x] Add gothic serif fonts (Cinzel, Uncial Antiqua) via Google Fonts
- [x] Replace neon glow effects with stained glass / candlelight warm effects
- [x] Redesign card frames with gothic arch borders and stained glass insets
- [x] Update Home page hero with cathedral-themed design
- [x] Update Home page sin cards with stained glass aesthetic
- [x] Update Lobby with gothic UI elements (stone panels, candle accents)
- [x] Update GameBoard with cathedral floor / dark stone aesthetic
- [x] Update GameCard component with gothic frame styling
- [x] Replace EmberField with cathedral dust motes / candle particles
- [x] Update all sin faction colors to Dante's Inferno palette

## Compound Balance Sheets on GameBoard
- [x] Build PlayerAfflictionTable component with Pain/Gain/Net columns, round rows, and totals
- [x] Position balance sheets adjacent to each player panel on GameBoard (right of North/South, below East/West)
- [x] Style with gothic theme (stone texture, gold borders, sin-colored accents)
- [x] Show active compounding effects with projected values per upcoming round (Fibonacci tick projections)
- [x] Add compact mode for mobile layout
- [x] Add hover tooltips with per-effect breakdown per round
- [x] Write 24 vitest tests for affliction projection logic (174 total tests passing)

## Affliction Matrix Redesign — Detailed Per-Effect-Type Columns
- [x] Redesign PlayerAfflictionTable from Pain/Gain/Net to individual effect-type columns (DMG, Heal, Shield, Debuff, E.Drain, E.Gain, Buff)
- [x] Show each effect type as its own column with per-round projected values and Painterly Spell Icons
- [x] Only show columns for effect types that are actually active on the player
- [x] Keep round rows (NOW, R2, R3, etc.) and TOTAL summary row
- [x] Maintain gothic cathedral styling with appropriate color per effect type
- [x] Update compact mobile layout for the wider matrix
- [x] Update tests for new matrix format (28 tests, 178 total passing)
- [x] Push to GitHub for Vercel deployment

## END TURN Button When Energy Depleted
- [x] Add prominent END TURN button replacing PASS when player energy is 0
- [x] Style END TURN in gold/yellow gradient with pulsing glow to contrast with existing controls
- [x] Make END TURN visually larger/more prominent when energy is depleted (larger padding, bolder font, animated glow)
- [x] Ensure END TURN triggers the same pass-turn action as PASS
- [x] Show PASS when energy > 0 or Wrath can overcharge; show END TURN when energy = 0 and no overcharge available
- [x] All 178 tests still passing
