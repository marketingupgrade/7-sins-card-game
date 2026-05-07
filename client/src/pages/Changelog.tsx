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
import { usePageMeta } from "@/hooks/usePageMeta";

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
    version: "6.6.0",
    date: "March 2026",
    title: "The Cathedral Resounds",
    summary: "The cathedral now speaks through every moment of gameplay. Branded loading screens with rotating narrator quotes replace generic spinners. Between-round transitions feature dramatic cathedral reveals with phase-appropriate commentary — early rounds whisper patience, late rounds warn of the Reckoning. A full procedural sound design system synthesizes cathedral bell tolls, ethereal whispers, deep resonance, and choir pads using Web Audio API — no external files, all atmosphere.",
    major: true,
    changes: [
      { category: "feature", text: "Cathedral Loading Screen: branded game loading with 10 rotating narrator quotes and gothic cross animation replaces generic spinner" },
      { category: "feature", text: "Between-Round Transitions: dramatic cathedral overlay with 22 narrator quotes across 4 phases (early, mid, late, reckoning) — commentary intensifies as the game progresses" },
      { category: "feature", text: "Elimination Announcements: when a sinner falls, a dedicated transition with mournful narrator quotes marks their departure" },
      { category: "feature", text: "Cathedral Bell Tolls: procedurally synthesized bell sounds with 3 intensity levels (soft for early rounds, normal for mid, deep for late) using harmonic overtones" },
      { category: "feature", text: "Ethereal Whispers: breathy filtered noise bursts accompany narrator quote appearances during transitions" },
      { category: "feature", text: "Deep Resonance: sub-bass drone with descending pitch marks the Final Reckoning — you'll feel it before you see it" },
      { category: "feature", text: "Choir Pad: ethereal minor chord with detuned voices plays during game loading, setting the cathedral atmosphere from the first moment" },
      { category: "feature", text: "Elimination Toll: two slow, mournful bell strikes mark each sinner's fall" },
      { category: "feature", text: "All cathedral sounds are procedurally generated via Web Audio API — zero external audio files, instant playback, no loading" },
      { category: "feature", text: "Sound system respects existing SFX volume and mute settings — toggle once, controls everything" },
      { category: "feature", text: "GameBoard UI rebranded: 'Rite' replaces 'Round' in action feed, branded timer warnings, cathedral terminology throughout" },
      { category: "fix", text: "How to Play page confirmed fully compliant with brand book structure from 7sinscardgame.com/how-to-play" },
    ],
  },
  {
    version: "6.5.0",
    date: "March 2026",
    title: "The Cathedral Speaks",
    summary: "Complete brand voice overhaul of all onboarding and tutorial content. Every teaching surface now speaks in the brand book's sardonic narrator voice — an omniscient entity who has watched humanity sin for millennia and finds your fumbling both predictable and mildly entertaining. Cathedral terminology, gothic aesthetic, and proper information hierarchy throughout.",
    major: true,
    changes: [
      { category: "feature", text: "How to Play page rewritten with narrator voice: sardonic quotes, cathedral metaphors, and branded faction descriptions replace generic tutorial language" },
      { category: "feature", text: "QuickStart Modal redesigned as 'The Cathedral Speaks' — 4-slide branded intro with narrator quotes, cathedral aesthetic, and 'Embrace Your Sin' CTA" },
      { category: "feature", text: "GameCoach tips rewritten: 8 contextual coaching messages now use narrator voice with branded terminology (corruption instead of energy, sins instead of cards)" },
      { category: "feature", text: "PracticeMode briefing steps rewritten: 8 branded steps with narrator quotes ('Every sinner starts somewhere'), cathedral metaphors, and evocative faction descriptions" },
      { category: "feature", text: "PracticeAnnotations rewritten: round-by-round teaching uses narrator flavor text ('Your sins from last round are still echoing. That's the beauty of compound interest.')" },
      { category: "feature", text: "PostGameAnalysis rebranded as 'The Cathedral's Judgment': branded tip titles ('Corruption squandered', 'A short and unremarkable damnation'), faction-specific strategy tips with character" },
      { category: "feature", text: "Brand font hierarchy enforced: Cinzel for headings, Cormorant Garamond for body, Uncial Antiqua for narrator flavor text across all onboarding surfaces" },
      { category: "feature", text: "34 new brand voice compliance tests verify narrator markers, font usage, branded terminology, and absence of generic tutorial language" },
      { category: "fix", text: "Consistent 60-30-10 color rule and Fibonacci spacing across all onboarding components" },
    ],
  },
  {
    version: "6.4.0",
    date: "March 2026",
    title: "The Seer's Lens",
    summary: "A comprehensive UX and game design audit overhaul. Cards now show their total strategic value — total damage over full duration, % of target HP, and compound growth sparklines. Player panels display net HP change per round from active effects. Faction passives are always visible with targeting warnings. And a new turn phase timeline replaces the old status text with a clear visual progression bar.",
    major: true,
    changes: [
      { category: "feature", text: "Card Value Calculator: every card now shows total damage/heal over its full duration, percentage of target HP, and a timing indicator (early/ok/late) based on remaining rounds" },
      { category: "feature", text: "Compound Pattern Sparklines: inline SVG mini-graphs on cards visualize the growth curve (Fibonacci for Standard, exponential for Aggressive, flat-then-ramp for Slowburn)" },
      { category: "feature", text: "Active Effects Dashboard on every player panel: shows net HP change per round with color-coded breakdown (red for damage, green for heal, cyan for shield, yellow for control)" },
      { category: "feature", text: "Passive Ability Reminders: persistent badges on player panels showing each faction's passive ability — no more forgetting what Wrath or Sloth does" },
      { category: "feature", text: "Targeting Warnings: when selecting a target, see faction-specific cautions (e.g., 'Attacking Wrath reflects damage back to YOU', 'Lust heals from damage ticks')" },
      { category: "feature", text: "Turn Phase Timeline: visual 3-step progression bar (Select → Resolve → Tick) replaces the old text status, showing exactly where you are in each round" },
      { category: "feature", text: "Phase timeline shows lock-in counter (e.g., '2/4 locked in') during selection phase for better multiplayer awareness" },
      { category: "fix", text: "Improved information hierarchy on player panels: passive → effects dashboard → effect badges, ordered by strategic importance" },
    ],
  },
  {
    version: "6.3.0",
    date: "March 2026",
    title: "The Training Grounds",
    summary: "Three major features for new and improving players. After a loss, you now get a personalized breakdown of what went wrong — wasted energy, unplayed cards, missing defense, and more. Practice Mode lets you train against a bot with guided annotations that teach you round by round. And a new card sorting system in your hand lets you sort by Cost, Type, or Smart (which recommends the best plays based on your current game state).",
    major: true,
    changes: [
      { category: "feature", text: "'Why Did I Lose?' post-game analysis: after a loss, see a breakdown of energy waste, unplayed cards, missing defense, early elimination, and low damage output with actionable improvement tips" },
      { category: "feature", text: "Post-game analysis tracks 6 metrics: cards played, total damage dealt, healing done, shields applied, unplayed cards remaining, and energy wasted" },
      { category: "feature", text: "Practice Mode: guided 1v1 training match against a bot with an 8-step pre-game briefing covering energy, cards, compound effects, defense, passives, and targeting" },
      { category: "feature", text: "Practice Mode annotations: round-by-round contextual teaching overlays — Round 1 teaches card selection and lock-in, Round 2 explains compound growth, Round 3 covers faction passives, Round 4 sends you off with encouragement" },
      { category: "feature", text: "Practice Mode accessible from Home page, SigilMenu navigation, and How to Play page with difficulty ratings per faction" },
      { category: "feature", text: "Hand card sorting: toggle between Draw (original order), Cost (cheapest first), Type (damage → steal → heal → shield), and Smart (AI-recommended plays)" },
      { category: "feature", text: "Smart sort algorithm considers current energy, HP percentage, round number, compound pattern timing, card tier, and energy efficiency to recommend optimal plays" },
      { category: "feature", text: "Sort preference persists in localStorage with a 'new' indicator dot for first-time users" },
      { category: "feature", text: "42 new vitest tests for all three features — all 690 tests passing" },
    ],
  },
  {
    version: "6.2.0",
    date: "March 2026",
    title: "The Initiation Rites",
    summary: "A complete overhaul of the onboarding and tutorial system based on playtester feedback. New players now experience a three-stage progressive onboarding: a 4-slide Quick Start modal before their first game, contextual coaching tips during gameplay, and a comprehensive interactive How to Play guide. No more walls of text — every mechanic is taught visually, in context, exactly when you need it.",
    major: true,
    changes: [
      { category: "feature", text: "Interactive How to Play guide (/how-to-play) with 8 animated sections: Goal, Energy, Cards, Compound Effects, Factions, Targeting, Milestones, and Pro Tips" },
      { category: "feature", text: "Animated compound pattern visualizations: Standard (balanced), Aggressive (early burst), and Slowburn (late power) strategies shown with live-animated timeline bars" },
      { category: "feature", text: "Faction quick-reference cards with passive ability descriptions, SWOT analysis, and portrait art for all 7 sins" },
      { category: "feature", text: "Quick Start modal: 4-slide visual intro that appears in the Lobby before a new player's first game — covers survival goal, energy, compound mechanics, and faction selection" },
      { category: "feature", text: "GameCoach system: 8 contextual floating tips during first game — first turn guidance, target selection, low energy advice, low HP warning, compound explanation, card played confirmation, affliction doubling alert, and Final Reckoning warning" },
      { category: "feature", text: "InGameTooltips component: hover tooltips for energy, HP, shield, and round counter that explain mechanics in context" },
      { category: "feature", text: "Progressive disclosure onboarding flow: Quick Start (30 sec) → GameCoach (first game) → How to Play (deep reference) — each layer adds depth without overwhelming" },
      { category: "feature", text: "All coaching tips auto-dismiss with animated progress bars and are stored in localStorage so they only show once per player" },
      { category: "feature", text: "How to Play page linked from Home page button, SigilMenu navigation, and footer links" },
      { category: "fix", text: "Removed auto-triggering tooltip tutorial on Home page that confused new players — replaced with dedicated How to Play page" },
      { category: "feature", text: "30 new vitest tests for onboarding system — all 648 tests passing" },
    ],
  },
  {
    version: "6.1.0",
    date: "March 2026",
    title: "The Illuminated Manuscripts",
    summary: "Every chronicle now receives a unique AI-generated cover illustration, themed to its civilization type and rarity tier. Warrior Empires get dramatic oil paintings in crimson and iron. Enlightened Republics get luminous Renaissance frescoes. Merchant Federations get Dutch Golden Age harbor scenes. Legendary chronicles feature divine light and celestial phenomena. Art is generated via Google Imagen 4.0 and stored permanently.",
    major: true,
    changes: [
      { category: "feature", text: "AI-generated cover art for every chronicle via Google Imagen 4.0 API — unique illustrations themed to civilization type, rarity tier, and dominant factions" },
      { category: "feature", text: "4 distinct art style systems: Warrior Empire (oil painting, chiaroscuro), Enlightened Republic (Renaissance fresco, sfumato), Merchant Federation (Dutch Golden Age, warm candlelight), Balanced (mixed media, woodcut + watercolor)" },
      { category: "feature", text: "Rarity-scaled visual intensity: Common (subdued), Rare (vivid + golden light), Epic (dramatic + purple aurora), Legendary (transcendent + divine celestial phenomena)" },
      { category: "feature", text: "Faction visual elements in cover art: Wrath shows flames and shattered armor, Greed shows gold mountains, Envy shows shadowy mirrors, Sloth shows overgrown ruins" },
      { category: "feature", text: "Era-aware art direction: early turning points get ancient/primordial aesthetics, mid-game gets medieval/industrial, late-game gets modern/futuristic" },
      { category: "feature", text: "Cover art hero image on ChronicleView page with parallax gradient overlay and title treatment" },
      { category: "feature", text: "Cover art thumbnails on Chronicles feed cards with hover zoom effect" },
      { category: "feature", text: "Cover art thumbnail in GameOverScreen chronicle section with polling for async generation" },
      { category: "feature", text: "generateCoverArt tRPC endpoint for retroactively generating art for existing chronicles" },
      { category: "feature", text: "47 new vitest tests for cover art prompt builder — all 618 tests passing" },
      { category: "fix", text: "GameOverScreen 'Read Your Chronicle' button now navigates to correct /chronicle/:gameId URL" },
    ],
  },
  {
    version: "6.0.0",
    date: "March 2026",
    title: "The Chronicle Engine",
    summary: "Your battles now write history. Every match generates a unique alternate history of human civilization, shaped entirely by how the game unfolds. A 3-stage AI narrative pipeline translates card plays into historical events across 20 eras — from the Dawn of Consciousness to The Last Reckoning. Read, share, and download your chronicles.",
    changes: [
      { category: "feature", text: "Chronicle Engine: 20-round matches map to 20 eras of human civilization. Each sin faction represents a historical force (Wrath = military conquest, Greed = capitalism, Sloth = isolationism, etc.)" },
      { category: "feature", text: "3-stage AI narrative pipeline: Event Translator → Continuity Checker → Prose Writer, powered by Google Gemini 2.5 Flash" },
      { category: "feature", text: "Post-game chronicle assembly with Evaluator-Optimizer loop for quality and continuity" },
      { category: "feature", text: "Chronicle rarity tiers: Common (60%), Rare (25%), Epic (10%), Legendary (5%) — variable ratio reinforcement for dopamine loops" },
      { category: "feature", text: "Civilization personality metrics: Militarism / Culture / Commerce tracked across rounds, determines civilization type (Warrior Empire, Enlightened Republic, Merchant Federation)" },
      { category: "feature", text: "Public Chronicles feed at /chronicles — browse, search, and read other players' alternate histories" },
      { category: "feature", text: "Literary chronicle view with progressive disclosure, drop caps, and Cormorant Garamond typography" },
      { category: "feature", text: "Game-over Zeigarnik tension: 'The Chronicler is writing...' loading state with animated quill dots before chronicle reveal" },
      { category: "feature", text: "Download chronicles as text, share via link" },
      { category: "feature", text: "Switched all AI from Forge API to direct Google Gemini 2.5 Flash for production deployment" },
      { category: "fix", text: "28 new chronicle engine tests, 571 total tests passing" },
    ],
  },
  {
    version: "5.14.0",
    date: "March 2026",
    title: "The Living Cathedral",
    summary: "AI breathes life into the arena. A Living Narrator generates unique, context-aware commentary for every game moment. The Sin Whisperer tempts you with faction-specific private whispers during card selection. Both features are toggleable in the lobby.",
    major: true,
    changes: [
      {
        category: "feature",
        text: "Living Narrator: LLM-powered narrator generates unique commentary at round start, card reveal, player elimination, and game over — no two games narrated the same way",
      },
      {
        category: "feature",
        text: "Sin Whisperer: Your chosen sin whispers private temptations during card selection, with faction-specific personality (Wrath demands vengeance, Sloth counsels patience, Greed calculates profit...)",
      },
      {
        category: "feature",
        text: "Adaptive Nemesis System: AI tracks player behavioral patterns, rivalries, and aggression scores to generate contextually relevant commentary",
      },
      {
        category: "feature",
        text: "Lobby AI toggles: Host can independently enable/disable Living Narrator and Sin Whisperer with animated StonePanel controls",
      },
      {
        category: "feature",
        text: "SinWhisper UI component: Floating, faction-colored temptation display with pulse animation and typewriter loading state",
      },
      {
        category: "fix",
        text: "Graceful fallback: If AI generation fails, the game seamlessly falls back to curated static narrator lines",
      },
    ],
  },
  {
    version: "5.13.0",
    date: "March 2026",
    title: "The Hourglass Update",
    summary: "Server-side turn timer enforcement prevents games from stalling when players disconnect. Configurable lobby timers let the host choose competitive (10s), standard (15s), or casual (30s) pacing. Timed-out players now trigger sassy narrator quips.",
    major: false,
    changes: [
      { category: "feature", text: "Server-side turn timer enforcement: when a player locks in, a selection deadline is written to the database. If the deadline passes with idle players, the server auto-passes them and triggers resolution. No more stuck games from disconnected players." },
      { category: "feature", text: "Configurable turn timer per lobby: the host can now choose between 10s (Competitive), 15s (Standard), or 30s (Casual) turn timers in the lobby settings before starting the game." },
      { category: "feature", text: "Timer selector UI: animated StonePanel with three options in the lobby. Non-host players see the current timer setting in real-time." },
      { category: "feature", text: "Timeout narrator quips: 12 new sassy narrator lines trigger when a player is auto-passed for running out of time. Each quip includes the timed-out player's name." },
      { category: "feature", text: "Action feed entries for timeouts: auto-passed players now appear in the game's action feed with a clear 'timed out' label." },
      { category: "feature", text: "Client-side timer syncs with server deadline: the countdown timer in the GameBoard now derives its value from the server-side selection_deadline timestamp, preventing drift between players." },
      { category: "fix", text: "Round 13 freeze bug: replaced unreliable setTimeout(4000) with awaited Promise delay in both client and server engines. Added self-healing watchdog that detects stuck states and forces transitions." },
      { category: "fix", text: "GameBoard progress bar now adapts to the lobby's configured timer duration instead of using a hardcoded constant." },
    ],
  },
  {
    version: "5.12.0",
    date: "March 2026",
    title: "The Crucible Reforged",
    summary: "Complete faction rebalance driven by 2 million Monte Carlo simulated games with competitive custom deck builds. 59 cards rebalanced and all 7 passive constants retuned using an iterative optimizer, reducing maximum win rate deviation from 14.35% to 1.01% — earning PERFECT balance grade. UX improvements include scroll-triggered animations, enhanced matchup cell interactions, improved text contrast, and button press feedback.",
    major: true,
    changes: [
      { category: "breaking", text: "Lust TEMPTATION passive nerfed from 25% to 1% — Lust was winning 39.35% of games (14.35% over target), the most overpowered faction in the game's history", factions: ["Lust"] },
      { category: "breaking", text: "Envy JEALOUSY passive buffed from 10.6% to 47.6% — Envy was the weakest faction at 15.04% win rate, now competitive at 24.03%", factions: ["Envy"] },
      { category: "breaking", text: "Pride HUBRIS multiplier buffed from 1.32× to 1.59× — Pride was significantly underpowered at 17.38%, now balanced at 24.99%", factions: ["Pride"] },
      { category: "breaking", text: "Wrath VENGEANCE passive buffed from 25% to 62% reflect damage — compensates for Wrath's aggressive playstyle disadvantage in 4-player FFA", factions: ["Wrath"] },
      { category: "breaking", text: "Sloth ENDURANCE shield/AOE halved (cap 44→23, AOE mult 2.0→1.03) — Sloth was overperforming at 30.68%", factions: ["Sloth"] },
      { category: "breaking", text: "Gluttony DEVOURER energy gain buffed from 1.0 to 1.7 — enables more aggressive card consumption chains", factions: ["Gluttony"] },
      { category: "breaking", text: "Greed TAX percentage reduced from 8% to 5.6% — fine-tuned to prevent excessive passive income advantage", factions: ["Greed"] },
      { category: "balance", text: "24 Lust cards nerfed (base values reduced) — the most card changes of any faction, reflecting how dominant Temptation made every Lust card", factions: ["Lust"] },
      { category: "balance", text: "19 Envy cards buffed (base values increased) — strengthening the faction's core damage and utility to compensate for its copy-dependent playstyle", factions: ["Envy"] },
      { category: "balance", text: "15 Pride cards buffed (base values increased) — giving Pride more raw power to match its high-risk Hubris mechanic", factions: ["Pride"] },
      { category: "balance", text: "1 Sloth card adjusted (Impenetrable Wall shield 18→17) — minimal card changes needed since passive nerf handled most of the rebalance", factions: ["Sloth"] },
      { category: "balance", text: "Total: 59 cards rebalanced across 4 factions, 7 passive constants retuned — Wrath, Greed, and Gluttony required only passive adjustments, no card changes" },
      { category: "balance", text: "2M Monte Carlo simulation with competitive custom deck builds per faction — each faction uses optimized card selection strategies, not random draws" },
      { category: "balance", text: "Final verified win rates: Wrath 24.77%, Sloth 25.01%, Greed 25.21%, Envy 24.03%, Pride 24.99%, Lust 26.01%, Gluttony 24.98% — all within 1.01% of the 25% target" },
      { category: "feature", text: "Scroll-triggered fade-in animations on content pages (Balance Analysis, Matchup Matrix, Home footer) using Intersection Observer" },
      { category: "feature", text: "Enhanced matchup matrix cell hover: scale-up with ring highlight and shadow for better visual feedback" },
      { category: "feature", text: "Improved text contrast: prose-gothic body text opacity raised from 45% to 55%, strong text from 75% to 82%" },
      { category: "feature", text: "Button active press states: subtle scale(0.97) on click for tactile feedback across all faction-colored buttons" },
      { category: "feature", text: "Enhanced focus rings: visible 2px amber outline for keyboard navigation accessibility" },
      { category: "feature", text: "New CSS utilities: skeleton-pulse loading animation, section-divider golden line, card-hover-lift effect" },
      { category: "feature", text: "PageTransition and ScrollReveal reusable components added for consistent animation patterns" },
    ],
  },
  {
    version: "5.11.0",
    date: "March 2026",
    title: "The Crucible",
    summary: "Massive playtest-driven update. Hand cap at 10, Sloth AOE passive upgrade, 46 new zero-cost cards across all factions, 10-second turn timer, card+target selection UX overhaul, complete afflictions table, card reveal fix, battle log hover fix, and detailed faction SWOT info in the lobby.",
    major: true,
    changes: [
      { category: "breaking", text: "Maximum hand size capped at 10 cards — excess cards are discarded when drawing", factions: ["Wrath", "Sloth", "Greed", "Envy", "Pride", "Lust", "Gluttony"] },
      { category: "breaking", text: "Sloth ENDURANCE passive upgraded: now also deals energy × 2 AOE damage to all enemies each turn", factions: ["Sloth"] },
      { category: "balance", text: "46 new zero-cost cards added (6-8 per faction) — ensures players always have something to play even when energy-starved", factions: ["Wrath", "Sloth", "Greed", "Envy", "Pride", "Lust", "Gluttony"] },
      { category: "feature", text: "10-second turn timer: countdown starts when any opponent locks in, auto-locks your current selection when time runs out" },
      { category: "feature", text: "Step-by-step targeting indicator: clear visual guide showing Step 1 (select card) → Step 2 (select target) → Step 3 (lock in)" },
      { category: "feature", text: "No-target warning: orange banner warns when a card requires a target but none is selected" },
      { category: "feature", text: "Enhanced compound effect tooltips: tick-by-tick breakdown showing exact damage per round" },
      { category: "feature", text: "Detailed faction info in lobby: SWOT analysis and passive description visible when selecting a sin" },
      { category: "fix", text: "Card reveal (ResolutionReveal) now reliably triggers for all players — server keeps locked_plays visible during round_end phase for 4 seconds before clearing" },
      { category: "fix", text: "Battle log card hover: desktop uses positioned tooltip instead of full-screen overlay, preventing flicker and maintaining card visibility" },
      { category: "fix", text: "Afflictions table now shows all effect types including shield_steal, heal_block, shield_block, energy_block, affliction_amplify, affliction_transfer, and more" },
    ],
  },
  {
    version: "5.10.0",
    date: "March 2026",
    title: "The Reckoning",
    summary: "The biggest balance overhaul since v4. Starting HP increased from 200 to 333, all defensive card values scaled ×1.75, and the new Final Reckoning mechanic at round 20 ensures every game ends with a decisive conclusion. Backed by 1.26 million Monte Carlo simulated games across 30 configurations. Gameplay quality score increased +29.7 points over baseline.",
    major: true,
    changes: [
      { category: "breaking", text: "Starting HP increased from 200 to 333 — games are longer and more strategic, with more room for comeback plays", factions: ["Wrath", "Sloth", "Greed", "Envy", "Pride", "Lust", "Gluttony"] },
      { category: "breaking", text: "Final Reckoning: At round 20, all surviving players play every card in their hand regardless of energy cost. Highest HP after resolution wins. Eliminates timeouts entirely." },
      { category: "balance", text: "All defensive card base values (heal_gain, shield_gain, heal_steal, shield_steal) scaled ×1.75 — 229 card effects updated across all 7 factions", factions: ["Wrath", "Sloth", "Greed", "Envy", "Pride", "Lust", "Gluttony"] },
      { category: "balance", text: "Sloth ENDURANCE passive cap raised from 25 to 44 (proportional to HP increase)", factions: ["Sloth"] },
      { category: "balance", text: "Catch-up HP threshold adjusted from 80 to 133 (40% of 333 HP)" },
      { category: "feature", text: "Final Reckoning implemented in both client and server game engines with full effect resolution" },
      { category: "feature", text: "Rules page updated with dedicated Final Reckoning section (orange-themed, Section IX)" },
      { category: "feature", text: "Balance Analysis page updated with 333 HP and Final Reckoning context" },
      { category: "feature", text: "Tutorial steps updated to reference 333 HP and Final Reckoning mechanic" },
      { category: "feature", text: "Monte Carlo analysis: 1.26M games simulated across 3 HP pools × 5 defense multipliers × with/without Reckoning" },
    ],
  },
  {
    version: "5.9.2",
    date: "March 2026",
    title: "The Honest Covenant",
    summary: "Username editing with profanity filter, legal page rewrites removing third-party references, and transparency about database hosting. Privacy-first philosophy added to all legal pages.",
    major: false,
    changes: [
      { category: "feature", text: "Gamertag Editing: Players can now edit their gamertag from the Account page with inline edit button" },
      { category: "feature", text: "Profanity Filter: Username changes validated against leo-profanity + custom substring matching for slurs, hate speech, and impersonation" },
      { category: "feature", text: "25 dedicated profanity filter tests covering racial slurs, embedded profanity, and edge cases" },
      { category: "fix", text: "Legal Pages: Removed all third-party account references from Terms, Privacy, and Cookie Policy" },
      { category: "fix", text: "Transparency: All legal pages now disclose Supabase EU (Frankfurt) database hosting" },
      { category: "fix", text: "Philosophy: Added privacy-first statement to all legal pages — 'Games should be for fun, not extraction'" },
    ],
  },
  {
    version: "5.9.1",
    date: "March 2026",
    title: "The Iron Ward",
    summary: "Comprehensive security, brand, and performance audit with targeted hardening. Blog search input sanitized against PostgREST injection. Discussion comment deletion now requires author verification. Content-Security-Policy header added. Blog content sanitized with DOMPurify. Page backgrounds standardized to CSS variables for brand consistency. Dead code removed. 414 tests passing across 24 files.",
    major: false,
    changes: [
      { category: "fix", text: "Security: Blog search input sanitized to strip PostgREST filter operators, preventing filter injection attacks" },
      { category: "fix", text: "Security: Discussion comment deletion now requires guestId ownership verification \u2014 players can only delete their own comments" },
      { category: "fix", text: "Security: Content-Security-Policy header added with strict default-src, whitelisted Supabase CDN for images/fonts/API" },
      { category: "fix", text: "Security: Blog post HTML content now sanitized with DOMPurify before rendering to prevent XSS" },
      { category: "fix", text: "Brand: All page backgrounds standardized to CSS variables (--color-page-bg, --color-page-bg-deep) \u2014 no more 5 different hex values" },
      { category: "fix", text: "Brand: Font syntax normalized \u2014 all Cinzel references now use consistent font-[Cinzel] format" },
      { category: "fix", text: "Performance: Removed unused getDeckCommentCount (singular) function \u2014 batch version handles all use cases" },
      { category: "fix", text: "Code Quality: Migrated sitemap/RSS imports from deprecated db.ts to db-supabase.ts, retired 414-line dead code file" },
    ],
  },
  {
    version: "5.9.0",
    date: "March 2026",
    title: "The Sinners' Gallery",
    summary: "Public player profile pages bring identity and reputation to the community. Every gamertag is now clickable — on deck cards and comments — linking to a full profile showing published decks, total likes received, match history, faction performance breakdown, and overall win rate. Profiles feature rank badges, animated stat cards, and tabbed navigation between Decks, Matches, and Stats views. 414 tests passing across 24 files.",
    major: true,
    changes: [
      { category: "feature", text: "Player Profile Pages: Public profiles at /player/:gamertag showing gamertag, rank tier, join date, and community stats" },
      { category: "feature", text: "Profile Stats Dashboard: Decks published, total likes received, matches played, and matches won displayed as animated stat cards" },
      { category: "feature", text: "Win Rate Ring: SVG circular progress ring showing overall win rate, color-coded (green/yellow/red)" },
      { category: "feature", text: "Faction Performance Breakdown: Horizontal bar chart showing wins/losses and win rate per faction played" },
      { category: "feature", text: "Deck Performance Summary: All published decks listed with likes count and win-rate data" },
      { category: "feature", text: "Match History Timeline: Chronological list of recent matches with result indicators, deck info, and opponent faction" },
      { category: "feature", text: "Clickable Gamertags: All gamertags on community deck cards and comments now link to the player's profile" },
      { category: "feature", text: "Rank Tiers: Novice Sinner → Corruption Initiate → Cardinal Sin → Archdevil → The Mortal Sin, based on community match wins" },
      { category: "feature", text: "Tabbed Navigation: Decks / Matches / Stats tabs with animated transitions and count badges" },
      { category: "feature", text: "9 new vitest tests for profile lookup, stats aggregation, deck listing, and match history" },
    ],
  },
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
      { category: "feature", text: "Collection: New 'Target' filter row with pills for Single, AoE, Duo, Self, and Mixed — filter the entire card pool by targeting type" },
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
      { category: "feature", text: "9 new vitest tests validating target mode detection across the card pool" },
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
    summary: "Brand Book, navigation overhaul, SEO sitemap, and the Lore archives open their gates.",
    changes: [
      { category: "feature", text: "Added /brandbook page: 35-page Brand Book with 13 interactive sections, color swatches, faction profiles, Octalysis behavioral framework, and golden ratio mathematics" },
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
  usePageMeta({
    title: "Changelog — Version History",
    description: "Complete version history and patch notes for the 7 Deadly Sins Card Game. Track every balance change, new feature, and bug fix.",
    canonicalPath: "/changelog",
  });

  const [filter, setFilter] = useState<ChangeCategory | "all">("all");

  const filteredChangelog = useMemo(() => {
    if (filter === "all") return CHANGELOG;
    return CHANGELOG.map((patch) => ({
      ...patch,
      changes: patch.changes.filter((c) => c.category === filter),
    })).filter((patch) => patch.changes.length > 0);
  }, [filter]);

  return (
    <div className="min-h-screen bg-[var(--color-page-bg-deep)] relative overflow-hidden">
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
