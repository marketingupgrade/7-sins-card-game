/**
 * Tutorial Steps - The Guided Tour of Sin
 *
 * Defines all tutorial steps, their target elements, and the sassy
 * copy that walks new players through the game mechanics.
 * Each step highlights a specific UI element and explains what it does.
 */

export type TutorialPage = "home" | "lobby" | "game";

export type TooltipPosition = "top" | "bottom" | "left" | "right" | "center";

export interface TutorialStep {
  id: string;
  page: TutorialPage;
  /** CSS selector for the element to highlight. null = full-screen overlay */
  targetSelector: string | null;
  /** Position of the tooltip relative to the target */
  position: TooltipPosition;
  /** Main heading text */
  title: string;
  /** Explanation body text */
  body: string;
  /** Optional sassy narrator quip */
  quip?: string;
  /** Optional: wait for this element to exist before showing step */
  waitForSelector?: string;
  /** Optional: auto-advance after this many ms (for welcome screens) */
  autoAdvanceMs?: number;
}

// ─── HOME PAGE STEPS ────────────────────────────────────────
const HOME_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    page: "home",
    targetSelector: null,
    position: "center",
    title: "Welcome to 7 Deadly Sins",
    body: "A strategic card game where you pick a sin faction, spend Corruption energy, and play compound cards that escalate over time. 7 factions, 20 rounds, 50 HP. Last sinner standing wins.",
    quip: "Don't worry, we'll hold your hand. For now.",
  },
  {
    id: "home-create",
    page: "home",
    targetSelector: "[data-tutorial='create-game']",
    position: "bottom",
    title: "Create a Game",
    body: "Enter your name and create a new game room. You'll get a room code to share with friends (or fill with bots, we don't judge).",
    quip: "Step one: admit you have a problem. Step two: create a game about it.",
  },
  {
    id: "home-join",
    page: "home",
    targetSelector: "[data-tutorial='join-game']",
    position: "top",
    title: "Join a Game",
    body: "Got a room code from a friend? Enter it here to join their game. 2-4 players per match.",
    quip: "Assuming you have friends. Big assumption.",
  },
  {
    id: "home-factions",
    page: "home",
    targetSelector: "[data-tutorial='faction-cards']",
    position: "top",
    title: "Seven Sin Factions",
    body: "Each faction has a unique playstyle and passive ability. Wrath hits hard (FURY), Sloth outlasts (ENDURANCE), Greed hoards (AVARICE), Envy reflects (JEALOUSY), Pride self-buffs (HUBRIS), Lust redirects (CHARM), and Gluttony sustains (DEVOUR). Choose wisely.",
    quip: "They're all terrible. Pick the one that matches your personality.",
  },
  {
    id: "home-mechanics",
    page: "home",
    targetSelector: "[data-tutorial='card-mechanics']",
    position: "top",
    title: "3 Compound Patterns",
    body: "All cards are compound \u2014 they escalate over time. STANDARD follows Fibonacci (1\u00D7, 1\u00D7, 2\u00D7). AGGRESSIVE doubles each tick (1\u00D7, 2\u00D7, 4\u00D7). SLOWBURN starts flat then ramps. After round 16, all afflictions DOUBLE.",
    quip: "Math class finally pays off. Who knew?",
  },
];

// ─── LOBBY PAGE STEPS ───────────────────────────────────────
const LOBBY_STEPS: TutorialStep[] = [
  {
    id: "lobby-welcome",
    page: "lobby",
    targetSelector: null,
    position: "center",
    title: "The Lobby",
    body: "This is where you pick your sin, invite friends, and add bots. The game starts when the host is ready.",
    quip: "The calm before the emotional damage.",
  },
  {
    id: "lobby-room-code",
    page: "lobby",
    targetSelector: "[data-tutorial='room-code']",
    position: "bottom",
    title: "Room Code",
    body: "Share this code with friends so they can join your game. Click to copy it to your clipboard.",
    quip: "Copy-paste. The most advanced technology in gaming.",
  },
  {
    id: "lobby-sin-select",
    page: "lobby",
    targetSelector: "[data-tutorial='sin-selection']",
    position: "top",
    title: "Choose Your Sin",
    body: "Each sin has 36 unique compound cards and a passive ability. Wrath has FURY (+1 dmg), Sloth has ENDURANCE (+2 shield/round), Greed has AVARICE (+1 energy on 0-cost cards), Envy has JEALOUSY (reflect 50% dmg), Pride has HUBRIS (+1 self-buffs), Lust has CHARM (redirect 30%), Gluttony has DEVOUR (heal on play).",
    quip: "Choose your fighter. I mean, your character flaw.",
  },
  {
    id: "lobby-add-bot",
    page: "lobby",
    targetSelector: "[data-tutorial='add-bot']",
    position: "bottom",
    title: "Add Bots",
    body: "No friends online? Add bot players to fill the seats. They're surprisingly competent (and they never rage-quit).",
    quip: "Bots: the friends you can actually rely on.",
  },
  {
    id: "lobby-start",
    page: "lobby",
    targetSelector: "[data-tutorial='start-game']",
    position: "top",
    title: "Start the Game",
    body: "Once everyone has picked a sin (minimum 2 players), the host can start the game. No going back after this.",
    quip: "Press the button. Embrace the chaos.",
  },
];

// ─── GAME BOARD STEPS ───────────────────────────────────────
const GAME_STEPS: TutorialStep[] = [
  {
    id: "game-welcome",
    page: "game",
    targetSelector: null,
    position: "center",
    title: "The Arena",
    body: "This is where sins clash. You'll see all players, their HP, and the current round. Take turns playing cards or passing. Last one alive wins.",
    quip: "Welcome to the thunderdome. Except with more self-loathing.",
  },
  {
    id: "game-hp-bar",
    page: "game",
    targetSelector: "[data-tutorial='player-panel']",
    position: "bottom",
    title: "Player HP & Status",
    body: "Each player starts with 50 HP. The HP bar shows your current health, shield points (cyan overlay), and whether it's your turn. Hit 0 and you're eliminated. Games last 20 rounds.",
    quip: "That red bar? That's your life force. Try to keep it.",
  },
  {
    id: "game-energy-bar",
    page: "game",
    targetSelector: "[data-tutorial='energy-bar']",
    position: "bottom",
    title: "Corruption Energy",
    body: "Start with 2 energy, gain +1 per round (max 3). Every card costs energy to play. Spend wisely \u2014 you can't play what you can't afford.",
    quip: "Corruption: the currency of sin. Literally.",
  },
  {
    id: "game-hand",
    page: "game",
    targetSelector: "[data-tutorial='card-hand']",
    position: "top",
    title: "Your Hand",
    body: "These are your cards. Each shows its compound pattern (Standard/Aggressive/Slowburn), energy cost (top-right), and effects. Cards you can't afford are dimmed. Click a card to select it.",
    quip: "Your hand of cards. Not a poker hand \u2014 a sin hand.",
  },
  {
    id: "game-compound-patterns",
    page: "game",
    targetSelector: "[data-tutorial='card-hand']",
    position: "top",
    title: "Compound Patterns \uD83D\uDCC8",
    body: "All cards compound over time. STANDARD: Fibonacci (1\u00D7, 1\u00D7, 2\u00D7 = 4\u00D7 total). AGGRESSIVE: doubles each tick (1\u00D7, 2\u00D7, 4\u00D7 = 7\u00D7 total). SLOWBURN: flat then ramps. Pay energy once, effects continue for free.",
    quip: "Patience is a virtue. Which is ironic for a game about sins.",
  },
  {
    id: "game-target",
    page: "game",
    targetSelector: "[data-tutorial='player-panel']",
    position: "bottom",
    title: "Targeting",
    body: "After selecting a card, click an opponent to target them. Some cards target all enemies, some target yourself (heals/shields). The card text tells you who it hits.",
    quip: "Point at someone. Preferably not yourself. Unless you're Wrath.",
  },
  {
    id: "game-balance-sheet",
    page: "game",
    targetSelector: "[data-tutorial='balance-sheet-btn']",
    position: "left",
    title: "Effects Ledger",
    body: "Click this to see all active compounding effects \u2014 who's being hit, for how much, and which tick they're on. Essential for planning your next move.",
    quip: "The spreadsheet of suffering. Every accountant's dream.",
  },
  {
    id: "game-pass",
    page: "game",
    targetSelector: "[data-tutorial='pass-btn']",
    position: "top",
    title: "Pass Your Turn",
    body: "Can't play a card? Don't want to? Hit pass. Your compounding effects still tick, so sometimes doing nothing is the right move.",
    quip: "Sometimes the best sin is sloth. Literally.",
  },
  {
    id: "game-complete",
    page: "game",
    targetSelector: null,
    position: "center",
    title: "You're Ready!",
    body: "That's everything you need to know. Pick your cards wisely, manage your corruption, and may the most sinful player win. Good luck, sinner.",
    quip: "Tutorial complete. You're on your own now. Try not to embarrass yourself.",
  },
];

// ─── EXPORTS ────────────────────────────────────────────────
export const TUTORIAL_STEPS: Record<TutorialPage, TutorialStep[]> = {
  home: HOME_STEPS,
  lobby: LOBBY_STEPS,
  game: GAME_STEPS,
};

export const ALL_TUTORIAL_STEPS = [...HOME_STEPS, ...LOBBY_STEPS, ...GAME_STEPS];

export const TOTAL_STEPS = ALL_TUTORIAL_STEPS.length;

export function getStepsForPage(page: TutorialPage): TutorialStep[] {
  return TUTORIAL_STEPS[page];
}

export function getGlobalStepIndex(stepId: string): number {
  return ALL_TUTORIAL_STEPS.findIndex((s) => s.id === stepId);
}
