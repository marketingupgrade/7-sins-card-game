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
- [ ] Push to GitHub repository
- [ ] Deploy to Vercel
- [ ] Configure environment variables on Vercel
