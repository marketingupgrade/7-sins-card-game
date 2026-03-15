/**
 * Changelog / Patch Notes Page
 *
 * Documents version history, balance changes, new features, and bug fixes.
 * Structured as a reverse-chronological timeline with version badges,
 * categorized entries (balance, feature, fix, breaking), and faction-specific
 * change callouts. Dark gothic branding, mobile responsive.
 *
 * Adding new entries:
 * 1. Add a new object to the CHANGELOG array at the top
 * 2. Each entry has: version, date, title, summary, and an array of changes
 * 3. Changes are categorized as: balance | feature | fix | breaking
 * 4. Optional: add factions array to tag faction-specific changes
 */

import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import EmberField from "@/components/EmberField";

// ─── Types ──────────────────────────────────────────────────────────────────

type ChangeCategory = "balance" | "feature" | "fix" | "breaking";

interface ChangeEntry {
  category: ChangeCategory;
  text: string;
  factions?: string[];
}

interface PatchNote {
  version: string;
  date: string;
  title: string;
  summary: string;
  changes: ChangeEntry[];
  /** Whether this is a major release (gets special styling) */
  major?: boolean;
}

// ─── Category Config ────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<ChangeCategory, { label: string; color: string; bgColor: string; borderColor: string }> = {
  balance: {
    label: "BALANCE",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
  },
  feature: {
    label: "FEATURE",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
  fix: {
    label: "FIX",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/20",
  },
  breaking: {
    label: "BREAKING",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
  },
};

// ─── Faction Colors ─────────────────────────────────────────────────────────

const FACTION_COLORS: Record<string, string> = {
  Wrath: "text-red-400 bg-red-500/10 border-red-500/20",
  Sloth: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  Greed: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  Envy: "text-teal-400 bg-teal-500/10 border-teal-500/20",
  Pride: "text-amber-300 bg-amber-400/10 border-amber-400/20",
  Lust: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  Gluttony: "text-orange-400 bg-orange-500/10 border-orange-500/20",
};

// ─── Changelog Data ─────────────────────────────────────────────────────────
// Add new entries at the TOP of this array (newest first)

const CHANGELOG: PatchNote[] = [
  {
    version: "5.8.1",
    date: "March 2026",
    title: "The Arena Ledger",
    summary: "Deck win-rate tracking lets players log match results against any community deck and see aggregate win rates displayed as badges on deck cards. Threaded replies bring focused strategy conversations to the comment system — reply to any comment to start a nested thread. 405 tests passing across 23 files.",
    major: false,
    changes: [
      { category: "feature", text: "Win-Rate Tracking: Players can log match results (Victory/Defeat) for any community deck, selecting the opponent faction" },
      { category: "feature", text: "Win-Rate Badge: Decks with 3+ logged matches display a color-coded win-rate badge (green ≥60%, yellow ≥45%, red <45%) with match count" },
      { category: "feature", text: "Log Match Modal: Premium modal with Victory/Defeat toggle and opponent faction selector grid with faction icons" },
      { category: "feature", text: "Batch Win Rates: Win rates loaded in batch for all visible deck cards to minimize API calls" },
      { category: "feature", text: "Threaded Replies: Reply button on each comment starts a nested conversation thread with visual threading (left border + indent)" },
      { category: "feature", text: "Reply Indicator: Active reply-to banner shows which comment you're replying to, with cancel option" },
      { category: "feature", text: "Keyboard Shortcuts: Enter to post, Shift+Enter for newline, Escape to cancel reply" },
      { category: "feature", text: "10 new vitest tests for match logging, win-rate calculation, batch win rates, threaded replies, and reply deletion" },
    ],
  },
  {
    version: "5.8.0",
    date: "March 2026",
    title: "The Social Crucible",
    summary: "Community decks now feature per-player like rate-limiting and threaded comments. The like system uses a junction table so each player can only like a deck once (toggle on/off). Comments let players discuss strategies, share feedback, and build social bonds around published decks. Animated heart toggle with optimistic updates, expandable comment sections, and batch comment count badges. 395 tests passing across 23 files.",
    major: false,
    changes: [
      { category: "feature", text: "Toggle-Like System: Per-player rate-limited likes via community_likes junction table — one like per player per deck, toggle on/off" },
      { category: "feature", text: "Animated Heart: Filled heart with scale-bounce microinteraction (Saffer model) for instant visual feedback on like/unlike" },
      { category: "feature", text: "Optimistic Updates: Like toggles update UI instantly (<100ms) then reconcile with server truth" },
      { category: "feature", text: "Liked Deck Tracking: Backend returns which decks a player has liked for rendering filled hearts on page load" },
      { category: "feature", text: "Community Comments: Threaded comment system on each published deck — add, view, and delete comments" },
      { category: "feature", text: "Comment Section: Expandable per-deck comment panel with animated transitions, newest-first ordering" },
      { category: "feature", text: "Comment Count Badges: Batch-loaded comment counts displayed on each deck card for social proof" },
      { category: "feature", text: "Author-Only Delete: Comment deletion restricted to the original author (server-side enforcement)" },
      { category: "feature", text: "Character Limit: Comments capped at 500 characters with live counter and input sanitization" },
      { category: "feature", text: "Gamertag Avatars: Color-coded initial avatars derived from gamertag for visual identity in comments" },
      { category: "feature", text: "11 new vitest tests for toggle-like, liked deck IDs, cross-player independence, comment CRUD, and access control" },
    ],
  },
  {
    version: "5.7.9",
    date: "March 2026",
    title: "The Community Forge",
    summary: "Players can now publish their custom decks to a shared Community Deck Library, browse builds from other players, filter by faction, like favorites, and one-click import into the Deck Builder. Gamertag system lets players choose a public identity. All 21 non-mirror matchup drill-downs are now complete with detailed passive interactions, key cards, and counter-strategies. 384 tests passing.",
    major: false,
    changes: [
      { category: "feature", text: "Community Deck Library: New /community page to browse, search, and share player-built decks" },
      { category: "feature", text: "Publish Deck: Logged-in players can publish any saved 30-card deck to the community with a name and strategy description" },
      { category: "feature", text: "Gamertag System: Players choose a unique public gamertag (3-30 chars) displayed on published decks instead of real names" },
      { category: "feature", text: "Faction Filter: Browse community decks by faction with color-coded filter pills" },
      { category: "feature", text: "Sort Options: Sort community decks by newest or most liked" },
      { category: "feature", text: "Like System: Like community decks to surface the best builds" },
      { category: "feature", text: "One-Click Import: Import any community deck directly into the Deck Builder via deck code" },
      { category: "feature", text: "Unpublish: Deck owners can remove their published decks from the community" },
      { category: "feature", text: "9 new matchup drill-downs: Wrath-Greed, Wrath-Pride, Sloth-Greed, Sloth-Envy, Greed-Envy, Greed-Lust, Greed-Pride, Lust-Gluttony, Gluttony-Pride" },
      { category: "feature", text: "All 21 non-mirror matchups now have full drill-down analysis with passive interactions, strengths, key cards, and counter-strategies" },
      { category: "feature", text: "13 new vitest tests for community deck CRUD, gamertag management, and access control" },
    ],
  },
  {
    version: "5.7.8",
    date: "March 2026",
    title: "The Strategist's Lens",
    summary: "Deck builds are now shareable via URL — export a deck and share a clickable link that auto-imports the build. The matchup matrix gains interactive drill-down modals explaining why each faction matchup plays out the way it does, with passive interactions, key cards, and counter-strategies. 371 tests passing.",
    major: false,
    changes: [
      { category: "feature", text: "URL Deck Sharing: Export modal now includes a 'Share Link' button that copies a full URL (e.g., /deck-builder?import=W:01,03,...) for one-click deck sharing" },
      { category: "feature", text: "URL Deck Import: Opening a shared link auto-decodes the deck code, sets the faction, loads the cards, and shows a success toast" },
      { category: "feature", text: "URL cleanup: Query parameter is cleared after successful import via history.replaceState to keep the URL clean" },
      { category: "feature", text: "Matchup Matrix Drill-Down: Tap/click any cell to open a detailed modal explaining the matchup dynamics" },
      { category: "feature", text: "Drill-down shows: passive ability interaction, attacker/defender strengths, key cards, and counter-strategy for 12 major matchups" },
      { category: "feature", text: "Faction portraits, win rates, and 'Favored' badge in drill-down header with spring animation" },
      { category: "feature", text: "Fallback text for matchups without detailed data, 'Tap any cell for details' legend hint" },
      { category: "feature", text: "10 new vitest tests for URL sharing roundtrips and drill-down data validation" },
    ],
  },
  {
    version: "5.7.7",
    date: "March 2026",
    title: "The Diplomat's Decree",
    summary: "Matchup matrix rebalanced — Lust no longer dominates all matchups. Every faction now has at least one unfavorable pairwise matchup with rock-paper-scissors dynamics. Deck import/export lets players share builds via compact codes. Mobile compare mode now fully functional. 361 tests passing.",
    major: false,
    changes: [
      { category: "balance", text: "Matchup Matrix: Regenerated all 49 pairwise matchup values — no faction dominates all matchups (previously Lust won every pairwise at 51.8% avg)" },
      { category: "balance", text: "Rock-paper-scissors dynamics preserved: Envy beats Lust, Lust beats Wrath, Wrath beats Envy, Gluttony beats Sloth, Greed checks Gluttony" },
      { category: "balance", text: "Max pairwise deviation reduced from 3.7% to 2.8% — all matchups within 47-53% range" },
      { category: "feature", text: "Deck Import/Export: Share deck builds via compact codes (e.g., W:01,03,05,...) — copy/paste with friends" },
      { category: "feature", text: "Export modal with click-to-copy code, Import modal with validation and error messages" },
      { category: "feature", text: "Deck code format: {PREFIX}:{card_numbers} where W=Wrath, S=Sloth, G=Greed, E=Envy, P=Pride, L=Lust, X=Gluttony" },
      { category: "feature", text: "Mobile Compare Mode: Compare button now visible on mobile, panel uses scrollable column layout with safe-area padding" },
      { category: "feature", text: "Updated Key Dynamics section with new matchup highlights: Envy Disrupts Lust, Gluttony Burns Sloth" },
      { category: "feature", text: "27 new vitest tests for deck code encode/decode/validate and 6 tests for matchup data consistency" },
    ],
  },
  {
    version: "5.7.6",
    date: "March 2026",
    title: "The Architect's Arsenal",
    summary: "Deck Builder gains strategy-based auto-fill presets (Aggro, Control, Balanced) with scoring algorithms that prioritize different card attributes. The Collection page now features a card comparison mode for side-by-side analysis of up to 3 cards. 334 tests passing.",
    major: false,
    changes: [
      { category: "feature", text: "Deck Builder: Strategy auto-fill presets — Aggro (damage-focused, low-cost, aggressive pattern), Control (defensive, high-cost, slowburn), and Balanced (moderate across all types)" },
      { category: "feature", text: "Deck Builder: Strategy picker dropdown replaces old auto-fill button — each preset shows description, color-coded icon, and fills deck optimally for that archetype" },
      { category: "feature", text: "Shared deckStrategies.ts: Scoring algorithms that evaluate cards on effect types, cost curve, compound pattern, tier, and target mode" },
      { category: "feature", text: "Collection: Compare mode toggle in header — select 2-3 cards to view a side-by-side comparison panel" },
      { category: "feature", text: "Collection: Comparison panel shows card art, faction/tier/target badges, cost/pattern/effects grid, individual effect breakdowns with total damage, and overall output" },
      { category: "feature", text: "Collection: Amber ring highlight and checkbox overlay on selected cards during compare mode" },
      { category: "feature", text: "16 new vitest tests for strategy scoring logic and card comparison mode" },
    ],
  },
  {
    version: "5.7.5",
    date: "March 2026",
    title: "The Strategist's Toolkit",
    summary: "Collection page gains a target mode filter for deck-building research. The Deck Builder now shows a Target Coverage breakdown with intelligent synergy warnings that flag missing AoE coverage, lack of offense, or no sustain. 318 tests passing.",
    major: false,
    changes: [
      { category: "feature", text: "Collection: New 'Target' filter row with pills for Single, AoE, Duo, Self, and Mixed — filter the entire 378-card pool by targeting type" },
      { category: "feature", text: "Deck Builder: Target Coverage section in the insights panel showing a 5-column grid with counts for each target mode" },
      { category: "feature", text: "Deck Builder: Intelligent synergy warnings — danger (no offense), caution (no AoE / no single-target), tip (no sustain), and positive feedback for balanced decks" },
      { category: "feature", text: "Color-coded warning cards: red for danger, yellow for caution, green for tips — with contextual icons and actionable advice" },
      { category: "feature", text: "14 new vitest tests covering Collection filter logic and all synergy warning scenarios" },
    ],
  },
  {
    version: "5.7.4",
    date: "March 2026",
    title: "Target Mode Everywhere",
    summary: "Target mode badges now appear on every card surface: Collection gallery grid, Collection detail modal, and mobile card zoom sheet. A new shared utility (targetModeUtils.ts) ensures consistent badge styling across all 4 UI surfaces. 304 tests passing.",
    major: false,
    changes: [
      { category: "feature", text: "Collection MiniCard: Compact target mode badge (AOE, DUO, 1v1, SELF, MIX) in the bottom-left corner of each card thumbnail" },
      { category: "feature", text: "Collection CardDetailModal: Full target mode label in the header badge row alongside sin, tier, and priority tags" },
      { category: "feature", text: "MobileCardZoom: Full target mode label in the card header, visible when tapping a card during gameplay on mobile" },
      { category: "feature", text: "Shared targetModeUtils.ts: Extracted getCardTargetMode into a reusable utility with TargetModeInfo type, replacing inline implementations" },
      { category: "fix", text: "CardHoverPreview refactored to use shared utility instead of its own inline getCardTargetMode function" },
      { category: "feature", text: "9 new vitest tests validating target mode detection against all 378 cards in the card pool" },
    ],
  },
  {
    version: "5.7.3",
    date: "March 2026",
    title: "The Clarity Patch",
    summary: "Test suite fully green (295/295), plus a new card-level target mode badge on the hover preview. Cards now show a color-coded AOE, DUO, SINGLE, SELF, or SELF + TARGET tag so you know the targeting type at a glance before selecting.",
    major: false,
    changes: [
      { category: "feature", text: "Target Mode Badge: CardHoverPreview now shows a prominent color-coded badge in the card header — orange AOE, purple DUO, blue SINGLE, green SELF, or green SELF + TARGET" },
      { category: "feature", text: "Badge uses priority logic (aoe > duo > mixed > single > self) to show the most impactful targeting mode when a card has multiple effect types" },
      { category: "fix", text: "balance-menu tests: Updated chart URL assertions from cloudfront.net to supabase.co/storage to match actual asset hosting" },
      { category: "fix", text: "rss-featured tests: Updated featuredImage assertions from cloudfront.net to supabase.co to match actual blog image URLs" },
      { category: "fix", text: "user.purge test: Corrected vi.mock path from './db' to './db-supabase' — deleteAllUserData is imported from db-supabase in routers.ts, so the mock was never intercepting the call" },
      { category: "feature", text: "Full test suite now passes: 295 tests across 17 files with 0 failures" },
    ],
  },
  {
    version: "5.7.2",
    date: "March 2026",
    title: "The All-Seeing Target",
    summary: "Multi-target clarity upgrade. AoE and duo cards now show stacked faction portraits of all affected opponents. Mixed cards (self + AoE) display both your portrait and enemy targets. The targeting system now correctly distinguishes between single, duo, AoE, and self target modes.",
    major: false,
    changes: [
      { category: "feature", text: "AoE Target Display: Cards with area-of-effect now show stacked faction portraits of ALL alive opponents with an 'ALL' label, making it clear the card hits everyone" },
      { category: "feature", text: "Duo Target Display: Duo-targeting cards show 2 stacked portraits (primary selected target + lowest-HP secondary) with a '×2' label" },
      { category: "feature", text: "Mixed Target Display: Cards with both self and AoE/duo effects show your own portrait with 'SELF' label above the stacked enemy portraits, clearly communicating the dual nature of the card" },
      { category: "feature", text: "Portraits appear with staggered spring animations (60ms delay per portrait) for a premium cascading reveal effect" },
      { category: "fix", text: "getCardTargetInfo now correctly detects all 4 target modes (single, duo, aoe, self) and their combinations instead of only handling single/self" },
      { category: "fix", text: "AoE cards no longer show empty badge — previously they fell through all conditions and returned null because they weren't 'single' or 'self'" },
      { category: "fix", text: "Duo cards without a selected target now correctly show the pulsing '?' prompt with isDuo flag" },
      { category: "feature", text: "Added 19 vitest tests covering all target mode combinations: single, self, AoE, duo, self+AoE, self+single, self+duo, AoE+single, and edge cases" },
    ],
  },
  {
    version: "5.7.1",
    date: "March 2026",
    title: "The Revelation",
    summary: "Critical bug fix: the Resolution Reveal card animation and Round End prompt were never rendering due to 18 lazy-loaded components missing React Suspense boundaries. All lazy components now properly wrapped, and two core components (DeckPile, PlayerAfflictionTable) converted to direct imports for reliability.",
    major: false,
    changes: [
      { category: "fix", text: "Resolution Reveal animation now plays correctly after each round resolves — cards flip and animate in priority order (skip-queue first, then lowest HP, then seat index)" },
      { category: "fix", text: "Round End prompt ('View Battle Log' / 'Continue') now appears after the resolution animation completes, with 6-second auto-dismiss" },
      { category: "fix", text: "Root cause: 18 React.lazy() components were rendered without <Suspense> boundaries, causing silent React errors that prevented rendering. All lazy components now wrapped in <Suspense fallback={null}>" },
      { category: "fix", text: "DeckPile and PlayerAfflictionTable converted from lazy to direct imports — these core components are used 6+ times each and should load with the main bundle" },
      { category: "fix", text: "GameOverScreen, VictoryCinematic, DeathSequence, CorruptionCascade, CinematicFlash, ComboChainBanner, EpicCardReveal, CardPlayArc, and BattleLog all wrapped in proper Suspense boundaries" },
      { category: "feature", text: "Added 22 new vitest tests covering resolution reveal data flow: play filtering, sort order, animation timing, player snapshot integrity, state transitions, and edge cases" },
    ],
  },
  {
    version: "5.7.0",
    date: "March 2026",
    title: "The Optimization",
    summary: "Performance refactoring driven by Lighthouse audit. Lazy-loaded 13 heavy components, memoized 8 VFX systems, improved accessibility from 78 to 91, and optimized asset loading. Zero regressions.",
    major: false,
    changes: [
      { category: "feature", text: "Lazy-loaded 13 heavy GameBoard sub-components (GameOverScreen, ResolutionReveal, BattleLog, VictoryCinematic, WebGLSinShaders, MobileBattleOverview, and more) via React.lazy + Suspense for faster initial game load" },
      { category: "feature", text: "Lazy-loaded SigilMenu and MusicToggle in App.tsx, removing framer-motion from the critical rendering path" },
      { category: "feature", text: "Wrapped 8 VFX components in React.memo (EmberField, EnergyOrbs, HpCriticalOverlay, SinReactiveBackground, YourTurnBanner, RoundTransitionWipe, FloatingNumbers, ScreenShake) to prevent unnecessary re-renders during gameplay" },
      { category: "feature", text: "TargetAvatarBadge and CardHoverPreview also wrapped in React.memo for stable rendering" },
      { category: "feature", text: "Attempted Babylon.js selective imports for tree-shaking (12 classes used out of full engine). Bundle unchanged due to Babylon's module structure, but import pattern is now future-ready" },
      { category: "fix", text: "Accessibility: Added aria-labels to MusicToggle, SoundToggle, and carousel navigation buttons. Score improved from 78 to 91" },
      { category: "fix", text: "Accessibility: Removed maximum-scale=1 from viewport meta to allow pinch-to-zoom (WCAG 1.4.4 compliance)" },
      { category: "fix", text: "Added fetchpriority='high' to hero image preload for faster Largest Contentful Paint" },
      { category: "fix", text: "Production build verified: 14 well-split chunks with route-based code splitting already in place" },
    ],
  },
  {
    version: "5.6.0",
    date: "March 2026",
    title: "The All-Seeing Eye",
    summary: "Target clarity overhaul. Selected cards now show who they're aimed at with faction avatar overlays. Cards in hand display interaction hints so new players know they can tap/hover for details.",
    major: false,
    changes: [
      { category: "feature", text: "Target Avatar Overlay: Selected cards now display a circular faction portrait badge showing which player the card is targeting. Appears bottom-left of the card on both desktop and mobile." },
      { category: "feature", text: "Self-Target Indicator: Cards with self-targeting effects show your own faction portrait with a 'SELF' label, clearly distinguishing self-buffs from attacks." },
      { category: "feature", text: "Needs-Target Pulse: Cards that require a target but don't have one yet show a pulsing dashed '?' badge, prompting you to select an opponent." },
      { category: "feature", text: "Desktop: Playable cards show a subtle eye icon with 'HOVER' label when not hovered, teaching new players that cards have hover-preview details." },
      { category: "feature", text: "Mobile: Card thumbnails show a subtle eye icon with 'TAP' label on playable cards, making it clear they're interactive and can be tapped for full details." },
      { category: "fix", text: "Target assignment is now visually unambiguous — you can see at a glance which card targets which player without relying solely on the 'TARGET' label on player bars." },
    ],
  },
  {
    version: "5.5.0",
    date: "March 2026",
    title: "The Refinement",
    summary: "UX-driven overhaul of the game board. Desktop gets card hover previews and smarter layouts. Mobile gets bottom-sheet card zoom, bigger touch targets, and thumb-zone actions. Brandbook updated with formal UX Design Principles.",
    major: true,
    changes: [
      { category: "feature", text: "Desktop: Card hover preview — hovering over a card in your hand shows a full-size detail tooltip with art, effects, compound scaling, and flavor text. 350ms delay prevents accidental triggers (Doherty Threshold)" },
      { category: "feature", text: "Desktop: Center area redesigned — compact ritual circle with inline action feed showing recent plays, replacing the oversized round-only display" },
      { category: "feature", text: "Desktop: Player panels expand on hover (280px → 340px) for better readability of afflictions and effects" },
      { category: "feature", text: "Desktop: Card hand hover-lift animation — cards rise 24px toward action buttons on hover, selected cards lift 16px with 1.05x scale" },
      { category: "feature", text: "Mobile: Card zoom converted from full-screen overlay to bottom sheet with drag-to-dismiss. Swipe handle at top, spring physics animation. Thumb-zone optimized." },
      { category: "feature", text: "Mobile: Card thumbnails enlarged from 80×120 to 96×140px. Energy cost badge and selection indicators scaled up proportionally." },
      { category: "feature", text: "Mobile: Player bars increased to 56px minimum height with 40px avatars and taller HP bars (h-5) for better touch accuracy" },
      { category: "feature", text: "Mobile: Top bar compacted — reduced padding (py-1), smaller icons (w-3.5), tighter gaps to reclaim vertical space for gameplay" },
      { category: "feature", text: "Mobile: Action buttons enlarged to 48px minimum height (py-3) meeting Apple HIG 44pt touch target standard" },
      { category: "feature", text: "Brandbook v2.0: Added Section 14 'UX Design Principles' covering Fitts's Law, Miller's Law (cognitive load), Hick's Law (decision simplification), Doherty Threshold (400ms response), mobile-first design, accessibility standards, and microinteraction design" },
      { category: "fix", text: "Desktop: HP bars increased from h-7 to h-8 for better readability at a glance" },
      { category: "fix", text: "Mobile: Selection badge enlarged from w-4 to w-5 with better positioning (-top-1.5 -right-1.5) for visibility" },
    ],
  },
  {
    version: "5.4.0",
    date: "March 2026",
    title: "The Purification",
    summary: "64 card artworks reforged. Deck Builder split into a dual-pane war room. Saving your decks actually works now. The cathedral grows sharper.",
    major: true,
    changes: [
      { category: "feature", text: "Deck Builder redesigned with 50/50 split layout: card grid on the left, dynamic Deck Insights panel on the right" },
      { category: "feature", text: "Deck Insights panel: live mana curve histogram, effect balance radar, tier breakdown, archetype detection (Aggressor/Controller/Hybrid/Balanced), compound pattern analysis, synergy score (0-100), and matchup forecast against all 6 opposing factions" },
      { category: "feature", text: "Deck Insights updates dynamically as you add or remove cards, giving real-time strategic feedback" },
      { category: "feature", text: "Added 10 vitest integration tests covering full deck CRUD lifecycle: create, list, get, update, delete, ownership validation, card count enforcement, and JSON validation" },
      { category: "fix", text: "Fixed deck save for logged-in users: saving an existing deck now correctly calls update instead of always creating a new one. Server-assigned IDs are preserved for subsequent saves" },
      { category: "fix", text: "Regenerated 64 card art images (17% of 378 total) that had quality issues: white borders, ornate frames baked in, text overlays, visible hands, or blank/gray backgrounds", factions: ["Wrath", "Sloth", "Envy", "Greed", "Pride", "Lust", "Gluttony"] },
      { category: "fix", text: "Wrath had the most art issues (19 cards, 35% of faction). All regenerated with proper edge-to-edge dark gothic compositions" , factions: ["Wrath"] },
      { category: "fix", text: "Lust cards lust_42 and lust_52 required a second regeneration pass to remove persistent frame artifacts", factions: ["Lust"] },
    ],
  },
  {
    version: "5.3.0",
    date: "March 2026",
    title: "The Consume Rite",
    summary: "Banish cards from your hand to fuel your corruption. A new strategic layer emerges from the void.",
    major: true,
    changes: [
      { category: "feature", text: "Added Consume mechanic: banish any card from your hand to gain +1 energy. Maximum 1 consume per round. The card is permanently removed from the game." },
      { category: "feature", text: "Pass button now pulses with golden glow and displays 'PASS TURN' when no cards are affordable, with narrator hint: 'Your corruption runs dry...'" },
      { category: "feature", text: "Card detail modal (MobileCardZoom) completely rewritten: now shows readable effect names (Hurt/Mend/Ward), full compound scaling chains, rarity labels, keyword badges, and effect descriptions" },
      { category: "feature", text: "Server-side consume validation: prevents double-consume, dead player consume, and invalid card consume with thematic error messages" },
      { category: "fix", text: "Consume flag (consumed_this_round) properly resets at round advance alongside locked cards" },
      { category: "fix", text: "Game log now records consume actions with full card metadata for battle replay" },
    ],
  },
  {
    version: "5.2.0",
    date: "March 2026",
    title: "The Overlords' Codex",
    summary: "AAA Premium Brandbook, navigation overhaul, SEO sitemap, and the Lore archives open their gates.",
    changes: [
      { category: "feature", text: "Added /brandbook page: 35-page AAA Premium Brandbook with 13 interactive sections, color swatches, faction profiles, Octalysis behavioral framework, and golden ratio mathematics" },
      { category: "feature", text: "Blog renamed to 'Lore' in navigation (URL slug /blog preserved for SEO)" },
      { category: "feature", text: "Navigation reordered: Home first, then alphabetical. Brandbook subtitle: 'How the overlords wished this game to be molded'" },
      { category: "feature", text: "Static sitemap.xml with 57 blog posts + 12 static pages for Google Search Console" },
      { category: "feature", text: "Added Buy Me a Coffee widget with custom gothic QR code in footer" },
      { category: "feature", text: "Account Management page with profile card, saved decks, and GDPR-compliant data purge" },
      { category: "feature", text: "Deck selection in lobby: choose a saved 30-card deck or use full arsenal after faction pick" },
      { category: "feature", text: "Guest deck limit: 1 saved deck with sign-in upsell banner" },
      { category: "feature", text: "Complete password reset flow with Supabase integration and branded email templates" },
      { category: "fix", text: "Footer text contrast increased across all sections for WCAG readability" },
      { category: "fix", text: "Simplified homepage layout with sign-in prompt for unauthenticated users" },
      { category: "fix", text: "Fixed 12 Dependabot security vulnerabilities (axios, pnpm, fast-xml-parser, rollup, esbuild, dompurify, qs, lodash)" },
    ],
  },
  {
    version: "5.1.0",
    date: "March 2026",
    title: "The Scholar's Update",
    summary: "New reference pages, community discussion system, and comprehensive documentation for competitive play.",
    major: true,
    changes: [
      { category: "feature", text: "Added Balance Analysis page with 10 analytical sections, 8 chart visualizations, and methodology documentation" },
      { category: "feature", text: "Added Matchup Matrix page with 7x7 faction win-rate heatmap, color-coded advantage/disadvantage cells, and faction profiles" },
      { category: "feature", text: "Added Game Rules page covering core rules, energy system, compound patterns, all 16 effect types, 7 faction passives, and skip-queue mechanics" },
      { category: "feature", text: "Added database-backed Discussion system on the Balance Analysis page with threaded replies, upvotes, and guest identity" },
      { category: "feature", text: "Added Changelog page to document version history and balance changes" },
      { category: "feature", text: "Added Terms & Conditions, Privacy Policy, and Cookie Policy pages" },
      { category: "feature", text: "Added themed SigilMenu (hamburger menu) for all non-game navigation, positioned top-right without blocking sound controls" },
      { category: "feature", text: "Added AI-generated artwork disclaimer and IP liability waiver to Terms" },
      { category: "fix", text: "Fixed card images being cut off in collection grid view" },
      { category: "fix", text: "Fixed white backgrounds visible on some card art (scale + inset shadow vignette)" },
      { category: "fix", text: "Improved compound tick value display with clearer per-round damage table" },
      { category: "fix", text: "Fixed collection page filters overwhelming mobile viewport (now collapsible)" },
      { category: "fix", text: "Replaced emoji icons in Game Rules with themed inline SVGs" },
      { category: "fix", text: "Redesigned homepage footer with organized credits and navigation links" },
    ],
  },
  {
    version: "5.0.0",
    date: "February 2026",
    title: "The Cathedral Opens",
    summary: "Full game launch with 7 factions, 378 cards, real-time multiplayer, and bot opponents. The cathedral doors swing wide.",
    major: true,
    changes: [
      { category: "feature", text: "Launched 7 playable factions: Wrath, Sloth, Greed, Envy, Pride, Lust, and Gluttony" },
      { category: "feature", text: "378 unique cards across Common, Rare, and Epic rarities with hand-crafted AI artwork" },
      { category: "feature", text: "Real-time multiplayer for 2-4 players with WebSocket synchronization" },
      { category: "feature", text: "Bot opponents with adaptive difficulty for solo practice" },
      { category: "feature", text: "Card Collection browser with faction filters, rarity sorting, and detailed card inspection" },
      { category: "feature", text: "Tutorial system (20 steps) for new players with contextual guidance" },
      { category: "feature", text: "Compound damage system with Standard, Aggressive, and Slowburn patterns" },
      { category: "feature", text: "16 unique effect types including damage, healing, shields, and status afflictions" },
      { category: "feature", text: "Faction unlock system rewarding wins with new playable factions" },
      { category: "feature", text: "Dark ambient soundtrack with three music tracks and full SFX library" },
      { category: "feature", text: "The Reckoning mechanic at round 16: all compound effects deal double damage" },
      { category: "balance", text: "Initial faction balance pass based on 10,000 simulated games", factions: ["Wrath", "Sloth", "Greed", "Envy", "Pride", "Lust", "Gluttony"] },
    ],
  },
  {
    version: "4.2.0",
    date: "January 2026",
    title: "The Reckoning Patch",
    summary: "Introduced The Reckoning mechanic and rebalanced late-game scaling across all factions.",
    changes: [
      { category: "breaking", text: "Added The Reckoning at round 16: all active compound effects deal double damage for the remainder of the game" },
      { category: "balance", text: "Wrath: Vengeance passive reflection reduced from 100% to 75% of incoming damage", factions: ["Wrath"] },
      { category: "balance", text: "Sloth: Endurance shield generation now scales with stored energy (was flat)", factions: ["Sloth"] },
      { category: "balance", text: "Lust: Temptation lifesteal reduced from 30% to 25% of DoT damage dealt", factions: ["Lust"] },
      { category: "balance", text: "Pride: Hubris bonus now requires playing the single most expensive card (not just any expensive card)", factions: ["Pride"] },
      { category: "fix", text: "Fixed compound effects sometimes ticking twice on the round they were applied" },
      { category: "fix", text: "Fixed energy display not updating after skip-queue card resolution" },
    ],
  },
  {
    version: "4.1.0",
    date: "December 2025",
    title: "The Envy Rework",
    summary: "Major rework of Envy's Jealousy passive and several underperforming Envy cards.",
    changes: [
      { category: "breaking", text: "Envy: Jealousy passive completely reworked. Now deepens the target's worst existing affliction instead of copying effects", factions: ["Envy"] },
      { category: "balance", text: "Envy: Nemesis card base damage increased from 6 to 8", factions: ["Envy"] },
      { category: "balance", text: "Envy: Curse Cascade now applies to all opponents (was single target)", factions: ["Envy"] },
      { category: "balance", text: "Gluttony: Devourer passive energy gain from destroying cards reduced from 2 to 1", factions: ["Gluttony"] },
      { category: "feature", text: "Added card rarity indicators to the in-game hand display" },
      { category: "fix", text: "Fixed Greed's Tax passive not generating shields when dealing 0 damage ticks" },
    ],
  },
  {
    version: "4.0.0",
    date: "November 2025",
    title: "The Seven Sins",
    summary: "Added the final two factions (Pride and Gluttony), completing the seven deadly sins roster.",
    major: true,
    changes: [
      { category: "feature", text: "Added Pride faction with Hubris passive: playing the most expensive card amplifies all effects", factions: ["Pride"] },
      { category: "feature", text: "Added Gluttony faction with Devourer passive: destroying enemy cards feeds your energy", factions: ["Gluttony"] },
      { category: "feature", text: "54 new cards across Pride and Gluttony (27 each)" },
      { category: "balance", text: "Rebalanced all existing factions to accommodate 7-faction meta", factions: ["Wrath", "Sloth", "Greed", "Envy", "Lust"] },
      { category: "feature", text: "Added faction-specific card art for all 378 cards" },
      { category: "fix", text: "Fixed lobby desync when a player disconnects during faction selection" },
    ],
  },
  {
    version: "3.0.0",
    date: "September 2025",
    title: "The Corruption Engine",
    summary: "Complete overhaul of the energy system, now themed as Corruption. Introduced compound patterns.",
    major: true,
    changes: [
      { category: "breaking", text: "Energy system renamed to Corruption. Starting energy changed from 3 to 2, max energy changed from 10 to 7" },
      { category: "feature", text: "Introduced three compound patterns: Standard (Fibonacci), Aggressive (Powers of 2), and Slowburn (flat ramp)" },
      { category: "balance", text: "All card costs rebalanced for the new 0-6 Corruption range" },
      { category: "feature", text: "Added skip-queue mechanic: certain cards resolve before normal priority order" },
      { category: "fix", text: "Fixed turn timer not pausing when a player disconnects" },
    ],
  },
];

// ─── Filter Buttons ─────────────────────────────────────────────────────────

const FILTER_OPTIONS: { value: ChangeCategory | "all"; label: string }[] = [
  { value: "all", label: "All Changes" },
  { value: "balance", label: "Balance" },
  { value: "feature", label: "Features" },
  { value: "fix", label: "Fixes" },
  { value: "breaking", label: "Breaking" },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function Changelog() {
  const [filter, setFilter] = useState<ChangeCategory | "all">("all");

  const filteredChangelog = useMemo(() => {
    if (filter === "all") return CHANGELOG;
    return CHANGELOG.map((patch) => ({
      ...patch,
      changes: patch.changes.filter((c) => c.category === filter),
    })).filter((patch) => patch.changes.length > 0);
  }, [filter]);

  return (
    <div className="min-h-screen bg-[#050508] relative overflow-hidden">
      <EmberField count={15} />
      <div className="absolute inset-0 noise-overlay pointer-events-none" style={{ zIndex: 1 }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-heading)" }}>Back to Cathedral</span>
        </Link>

        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Chronicle of Changes
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-white/90 tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            PATCH NOTES
          </h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/30" />
            <svg width="12" height="12" viewBox="0 0 12 12" className="text-amber-500/40">
              <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="currentColor" />
            </svg>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/30" />
          </div>
          <p className="text-sm text-white/40 max-w-xl" style={{ fontFamily: "var(--font-body)" }}>
            Every balance tweak, new feature, and bug fix documented. Because transparency is not a sin.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-10">
          {FILTER_OPTIONS.map((opt) => {
            const isActive = filter === opt.value;
            const catConfig = opt.value !== "all" ? CATEGORY_CONFIG[opt.value] : null;
            return (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-[11px] tracking-wider uppercase transition-all duration-200 border ${
                  isActive
                    ? catConfig
                      ? `${catConfig.bgColor} ${catConfig.color} ${catConfig.borderColor}`
                      : "bg-white/10 text-white/80 border-white/20"
                    : "bg-transparent text-white/30 border-white/5 hover:text-white/50 hover:border-white/10"
                }`}
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[19px] md:left-[23px] top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/20 via-white/5 to-transparent" />

          <div className="space-y-12">
            {filteredChangelog.map((patch, patchIdx) => (
              <div key={patch.version} className="relative">
                {/* Timeline dot */}
                <div className={`absolute left-2.5 md:left-3.5 top-1 w-3 h-3 rounded-full border-2 ${
                  patch.major
                    ? "bg-amber-500 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                    : "bg-white/10 border-white/20"
                }`} />

                {/* Content */}
                <div className="ml-12 md:ml-14">
                  {/* Version header */}
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wider ${
                        patch.major
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                          : "bg-white/5 text-white/50 border border-white/10"
                      }`}
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      v{patch.version}
                    </span>
                    <span className="text-[11px] text-white/25 tracking-wider" style={{ fontFamily: "var(--font-body)" }}>
                      {patch.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h2
                    className="text-lg md:text-xl font-bold text-white/85 tracking-wide mb-1"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {patch.title}
                  </h2>

                  {/* Summary */}
                  <p className="text-sm text-white/35 mb-4 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    {patch.summary}
                  </p>

                  {/* Changes list */}
                  <div
                    className="rounded-xl overflow-hidden border border-white/5"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
                    }}
                  >
                    {patch.changes.map((change, changeIdx) => {
                      const cat = CATEGORY_CONFIG[change.category];
                      return (
                        <div
                          key={changeIdx}
                          className={`flex items-start gap-3 px-4 py-3 ${
                            changeIdx < patch.changes.length - 1 ? "border-b border-white/[0.03]" : ""
                          }`}
                        >
                          {/* Category badge */}
                          <span
                            className={`shrink-0 mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider border ${cat.bgColor} ${cat.color} ${cat.borderColor}`}
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            {cat.label}
                          </span>

                          {/* Change text */}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white/55 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                              {change.text}
                            </p>

                            {/* Faction tags */}
                            {change.factions && change.factions.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {change.factions.map((faction) => (
                                  <span
                                    key={faction}
                                    className={`px-1.5 py-0.5 rounded text-[8px] tracking-wider uppercase border ${
                                      FACTION_COLORS[faction] || "text-white/30 bg-white/5 border-white/10"
                                    }`}
                                    style={{ fontFamily: "var(--font-heading)" }}
                                  >
                                    {faction}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* End of timeline marker */}
        <div className="relative mt-12">
          <div className="absolute left-2.5 md:left-3.5 top-0 w-3 h-3 rounded-full bg-white/5 border border-white/10" />
          <div className="ml-12 md:ml-14">
            <p className="text-[11px] text-white/15 tracking-wider italic" style={{ fontFamily: "var(--font-body)" }}>
              The chronicle begins here. More entries will be added as the game evolves.
            </p>
          </div>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap justify-center gap-4">
          <Link href="/rules" className="text-[10px] tracking-[0.15em] uppercase text-white/20 hover:text-white/40 transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
            Game Rules
          </Link>
          <span className="text-white/10">&middot;</span>
          <Link href="/balance" className="text-[10px] tracking-[0.15em] uppercase text-white/20 hover:text-white/40 transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
            Balance Analysis
          </Link>
          <span className="text-white/10">&middot;</span>
          <Link href="/matchups" className="text-[10px] tracking-[0.15em] uppercase text-white/20 hover:text-white/40 transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
            Matchup Matrix
          </Link>
          <span className="text-white/10">&middot;</span>
          <Link href="/" className="text-[10px] tracking-[0.15em] uppercase text-white/20 hover:text-white/40 transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
