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
