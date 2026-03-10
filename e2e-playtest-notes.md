# E2E Playtest Notes — 7 Deadly Sins Card Game

## Home Page Observations
- Tutorial popup works — SKIP ALL dismissed it properly, didn't reappear. Bug fix confirmed.
- Music toggle visible top-right (music note icon)
- Title "7 DEADLY SINS" with red accent looks clean, animated skull/crossbones icons
- Tagline rotates: "Friendship-ending technology, perfected."
- CREATE GAME (red), HOW TO PLAY (teal outline), JOIN GAME (amber) — clear visual hierarchy
- 4 faction cards visible: Wrath, Sloth, Greed, Envy with colored borders and passives
- Flat vs Compounding explainer section visible below
- Ember particles floating in background — nice atmosphere
- Dark/light mode toggle and settings icon visible but unclear purpose
- ISSUE: No ember particles visible in screenshot — may need to check EmberField rendering

## Lobby Page Observations
- Room code "VJCKZA" prominently displayed with copy icon — good UX
- Snarky copy throughout: "Assuming you have friends", "No friends?", "That's you. Pick already."
- 4 sin selection cards visible: Wrath (red), Sloth (blue), Greed (amber), Envy (green) — clear color coding
- Player slot shows "WrathTester" with crown icon
- 3 empty slots show "Waiting for a victim..."
- ADD BOT button clearly visible
- Sin descriptions are fun and on-brand
- FLEE (COWARD) back button top-left
- Bottom message: "Need at least 2 sinners. Add a bot if nobody loves you."
- ISSUE: No ember particles visible in lobby
- ISSUE: Sin selection cards don't have the new AI art yet — still using emoji icons

## Playtest 1: Wrath vs 3 Bots
- Selected Wrath — player card now shows "WRATH" in red with fire icon
- Sin selection cards disappeared after selection (good — no confusion)
- ISSUE: After selecting sin, the page scrolls up and shows mostly empty space. Sin selection section vanished but nothing replaced it.
- Added 3 bots: SiliconSinner (Envy), RageQuitBot (Greed), BeepBoop_lol (Sloth)
- All 4 sins represented — bots auto-pick different sins. Good variety.
- Bot names are fun: SiliconSinner, RageQuitBot, BeepBoop_lol
- "LET THE SINS BEGIN" button appeared (red-to-purple gradient) — looks epic
- Sinners 4/4 counter works
- Starting game now...

### GameBoard First Impressions (Round 1)
- N/E/S/W LAYOUT WORKS! RageQuitBot (North), SiliconSinner (West), BeepBoop_lol (East), WrathTester (South/You)
- Card art looks AMAZING — AI-generated art on each card is unique and thematic
- Cards show: FLAT badge (red), energy cost orb (top-right), card name, damage values, flavor text
- Hand has 5 cards: Burning Hatred, Fury Strike, Apocalypse Fist, Vendetta (RARE), Blind Rage
- Vendetta has both FLAT and RARE badges — nice visual distinction
- HP bars are green with numbers (25/25), energy shown as 2/2
- Center shows round counter "1" with "CP: 10" (corruption points?)
- Top bar: R1/10, YOUR TURN, snarky quote, Effects Ledger, Combat Log, Sound/Music toggles
- OVERCHARGE button visible ("Burn 2 HP for +1 Corruption")
- PASS button visible
- ISSUE: Card text is much better now but some cards are cut off at bottom (can't see full flavor text)
- ISSUE: "Burning Hatred" card (leftmost) doesn't show FLAT/COMPOUND badge clearly
- ISSUE: Center area shows "1" and "CP: 10" and "4 Alive" — the CP:10 seems like it should be removed (was this the multiplier counter?)
- ISSUE: Player panels on East/West are very small — hard to read HP/energy on mobile
- ISSUE: No effect badges visible yet (need to play compounding cards to test)
- Selected Fury Strike — card highlights with yellow border
- "CLICK TO TARGET" appears on all 3 enemy player panels — clear targeting UX
- PLAY button appeared at bottom
- Fury Strike card is selected (lifted up slightly from hand)
- Clicked RageQuitBot — panel now has green dashed border (selected target)
- ISSUE: Clicking target didn't auto-play the card. Need to also click PLAY button. This is 2 extra clicks (select card, select target, click play). Should be: select card → click target → auto-play.
- Clicked PLAY button — NOTHING HAPPENED! Card was not played.
- BUG: RageQuitBot still shows 25/25 HP, my energy still 2/2, hand still has 5 cards
- The PLAY button click didn't trigger the playCard function
- UPDATE: Programmatic click on PLAY button DID work! RageQuitBot went from 25/25 to 22/25 HP.
- The browser automation tool's click wasn't reaching the motion.button properly (z-index or overlay issue)
- REAL ISSUE: The card play works but the UX is clunky — 3 clicks needed (select card, select target, click PLAY)
- IMPROVEMENT NEEDED: Clicking a target should auto-play the selected card (skip the PLAY button for targeted cards)
- Also: Fury Strike dealt 3 damage as expected (Wrath flat card)

### Auto-Play Fix Verified
- Selected Blind Rage (1 energy, Damage 4 + self-damage 1)
- Clicked SiliconSinner → CARD PLAYED INSTANTLY! Auto-play works!
- SiliconSinner went from 25/25 to 21/25 (4 damage dealt)
- WrathTester went from 25/25 to 24/25 (1 self-damage from Blind Rage)
- Energy went from 1/2 to 0/3 (wait, shows 0/3? That's wrong, should be 0/2)
- BUG: Energy display shows 0/3 instead of 0/2. Energy counter might be wrong.
- Narrator quip appeared: "Hitting yourself to hit others harder? Therapy called. You didn't answer."
- Hand now shows 3 cards: Burning Hatred, Apocalypse Fist, Vendetta
- Still shows YOUR TURN (multi-card-per-turn works! But I have 0 energy so can't play more)
- OVERCHARGE button visible (can burn 2 HP for +1 Corruption)
- PASS button visible

### Observations So Far
- N/E/S/W layout looks good — clear spatial positioning
- Card art is visible and unique per card
- Narrator quips are working and entertaining
- "CLICK TO TARGET" text on enemy panels is clear
- Auto-play on target click is a huge UX improvement (2 clicks instead of 3)
- Energy display might have a bug (showing /3 instead of /2)

### CRITICAL BUG: PASS Button Doesn't Advance Turn
- Clicked PASS but still shows "YOUR TURN" and R1/10
- Bots never got to play — no HP changes on any bot
- WrathTester still at 24/25, energy at 0/3
- All bots still at same HP (RageQuitBot 22/25, SiliconSinner 21/25, BeepBoop_lol 25/25)
- The turn never advanced! passTurn is broken.
- This is likely because advanceTurn was removed from playCard but passTurn might also be broken
- Need to check: does passTurn call advanceTurn? Does the bot controller detect turn changes?
- UPDATE: Programmatic click DID work! Round advanced to R2/10
- BUG: The browser tool's click on motion.button elements doesn't fire the React handler
- This is a framer-motion issue — the motion.button intercepts clicks differently
- WORKAROUND: The buttons work fine for real users, just not for browser automation

### Round 2 Observations (After Bots Played)
- Round advanced to R2/10, YOUR TURN again
- RageQuitBot: 20/25 HP (took damage), has 2 effect badges showing (damage + compound)
- SiliconSinner: 17/25 HP (took heavy damage!), has 4 effect badges, +1 indicator
- BeepBoop_lol: 25/25 HP + 2 shield, has 2 effect badges
- WrathTester: 24/25 HP, energy 0/3
- EFFECT BADGES ARE SHOWING! The EffectBadge component works!
- Effect badges show: fire icon with number, compound indicator (C), shield icon
- Card hand now has 4 cards: Burning Hatred, Apocalypse Fist (now renamed?), Vendetta, Rage Shield, Corruption Surge
- Wait — 5 cards visible! Drew a card on pass.
- Card art is visible and varied — each card has unique AI-generated art
- Burning Hatred shows "Damage 3→3→6" (compound effect with Fibonacci ticks!)
- Rage Shield shows "Shield 2→2→4" (compound shield)
- Corruption Surge shows "Damage 3, Damage 2 (self)" — flat card, 0 cost!
- GOOD: Cards clearly show flat vs compound type badges
- GOOD: Energy cost orbs are visible (red numbers in top-right of cards)
- ISSUE: Card text is still somewhat small on the effect descriptions

### Round 2 - Multi-Card Turn Test
- Played Corruption Surge (0 cost) on RageQuitBot: 20/25 → 17/25 HP! (3 damage dealt, 2 self-damage)
- WrathTester: 24/25 → 22/25 (took 2 self-damage from Corruption Surge)
- MULTI-CARD WORKS! Still my turn after playing a card!
- Snarky narrator: "Zero cost, maximum self-harm. The Wrath special. No refunds on your HP."
- Now have 4 cards left: Burning Hatred, Apocalypse Fist, Vendetta, Rage Shield
- GOOD: Auto-play on target click works perfectly
- GOOD: Card art is unique and visible per card
- GOOD: Effect badges on RageQuitBot show fire icon + compound indicator
- ISSUE: Corruption Surge disappeared from hand (played), but Apocalypse Fist card art looks similar to another card
- OBSERVATION: Energy still at 0/3 — Corruption Surge was 0 cost, so can't play more cards this turn

### Round 2 - Bot Turns (Still R2/10)
- BeepBoop_lol is currently playing (shown in top bar with bot icon)
- RageQuitBot: 14/25 HP (took more damage!), 0E energy, 6d effects, 3x multiplier
- SiliconSinner: 16/25 HP, 5/5 energy, 5E, 5d effects, 2x multiplier
- BeepBoop_lol: 25/25 HP + 2 shield! Still full HP with shield. Has 4 compound effects + 2 other badges
- WrathTester: 22/25 HP (took some damage from bots), energy 0/6
- GOOD: Bots are playing multiple cards per turn (multi-card fix works for bots too!)
- GOOD: Effect badges are accumulating properly on all players
- GOOD: BeepBoop_lol has lots of effect badges visible (shield, compound, etc)
- ISSUE: It says R2/10 but BeepBoop_lol is still playing — round doesn't advance until all players pass
- ISSUE: My hand now has 6 cards: Burning Hatred, Apocalypse Fist, Vendetta, Rage Shield, Last Stand, Desperate Fury
- Last Stand shows "CATCH-UP" badge! Catch-up mechanic is working
- Desperate Fury also shows "CATCH-UP" badge
- GOOD: Card variety is visible — each card has unique art and different effect combinations

### Round 3 - YOUR TURN
- Round advanced to R3/10! Turn system working correctly.
- RageQuitBot: 14/25 HP, 4E, 5 effects, 3x multiplier
- SiliconSinner: 16/25 HP, 5E, 5 effects, 2x multiplier
- BeepBoop_lol: 25/25 HP + 2 shield, 4E, 5 effects, 3x, has shield + heal badges
- WrathTester: 22/25 HP, energy 6/6 (full!)
- Hand: 6 cards — Burning Hatred (3E epic), Apocalypse Fist (flat epic), Vendetta (2E flat rare), Rage Shield (2E compound), Last Stand (1E flat catch-up), Desperate Fury (2E flat rare catch-up)
- GOOD: Energy regenerated to 6/6 at start of round
- GOOD: Catch-up badges visible on Last Stand and Desperate Fury
- GOOD: BeepBoop_lol has rich effect badge display (shield icon, heart icon, compound C)
- N/E/S/W layout looks great — clear spatial positioning
- OBSERVATION: RageQuitBot panel at North is compact, shows HP bar clearly
- OBSERVATION: SiliconSinner at West, BeepBoop_lol at East — good positioning
- ISSUE: Apocalypse Fist card doesn't show its effect description clearly in the viewport
- ISSUE: Cards are a bit cramped with 6 in hand — could use horizontal scroll on mobile

### Round 4 - YOUR TURN
- R4/10, all 4 players alive
- RageQuitBot: 11/25 HP (taking heavy damage!), 5E, 4d effects, 5x multiplier, compound + heal badges
- SiliconSinner: 14/25 HP, 6E, 4d effects, 5x multiplier
- BeepBoop_lol: 25/25 HP + 7 shield!! Dominating. 5E, 4d effects, 5x, multiple shield/heal/compound badges
- WrathTester: 22/25 HP, 5/6 energy
- Hand now has 8 cards! Burning Hatred, Apocalypse Fist, Vendetta, Rage Shield, Last Stand, Desperate Fury, Crimson Slash, Blood Boil
- Narrator: "Round 4. More corruption flows. Spend it wisely. Or don't. I'm not your accountant."
- GOOD: Compound effects are accumulating — 5x multiplier visible on all players
- GOOD: BeepBoop_lol has 7 shield from stacking shield effects
- GOOD: Card hand scrolls horizontally when 8 cards — cards are still readable
- ISSUE: 8 cards in hand is very cramped, cards are cut off at edges
- ISSUE: BeepBoop_lol has SO many effect badges they're hard to read (6+ badges)
- ISSUE: Energy display on my panel shows 5/6 but hard to see at a glance
- OBSERVATION: Burning Hatred compound would do 3→3→6 = 12 total damage over 3 rounds vs Vendetta's 5 flat. Compound is clearly better value!

### Round 7 - YOUR TURN (Major findings)
- R7/10, 3 alive (SiliconSinner DEAD at 0/25 HP!)
- RageQuitBot: 15/25 HP, 7E, +3 energy regen, 10x multiplier, 1 effect
- SiliconSinner: 0/25 HP — DEAD! Panel is dimmed at West position
- BeepBoop_lol: 25/25 HP + 6 shield — STILL DOMINATING. 7E, 9x, multiple badges
- WrathTester: 6/25 HP! Almost dead! 7/9 energy
- CRITICAL: WrathTester has 12 cards in hand! Way too many cards. Hand is overflowing
- OVERCHARGE button is gone (probably because HP is too low)
- GOOD: Dead player (SiliconSinner) is properly dimmed and shows 0/25
- GOOD: Effect badges on WrathTester show 4 damage badges + 2 compound badges — clear visual
- GOOD: Multiplier counter shows 10x — compound effects are escalating properly
- ISSUE: 12 cards in hand is WAY too many — need a hand size limit (7-8 max like MTG)
- ISSUE: WrathTester at 6 HP with 12 cards but no OVERCHARGE — makes sense (HP too low)
- ISSUE: BeepBoop_lol is unkillable with 25 HP + 6 shield — Sloth faction may be too defensive
- ISSUE: Narrator text is cut off at the top — hard to read full message
- OBSERVATION: Game is approaching round 10 — need to verify game-over triggers

### Round 10 - FINAL ROUND
- R10/10! BeepBoop_lol is playing (bot turn)
- WrathTester: 0/25 — DEAD! Killed by compound damage effects
- SiliconSinner: 0/25 — DEAD (died earlier)
- RageQuitBot: 16/25 HP, 4E, 9 effects, 3x, 2 compound badges
- BeepBoop_lol: 25/25 HP + 7 shield! NEVER TOOK DAMAGE. 7E, 9 effects, 5 badges visible
- Only 2 alive: RageQuitBot and BeepBoop_lol
- CRITICAL BUG: WrathTester died but game didn't end — I'm dead but still watching
- CRITICAL: No game-over screen! My cards are still shown at bottom even though I'm dead
- ISSUE: Dead player's cards should be hidden or dimmed
- ISSUE: No game-over UI when player dies — should show defeat screen
- ISSUE: BeepBoop_lol (Sloth) is massively overpowered — 25 HP + 7 shield, never took damage
- ISSUE: 12 cards still in hand even though dead — should be cleared
- OBSERVATION: Compound effects at round 10 have 10x multiplier — damage is insane
- OBSERVATION: WrathTester's self-damage from Wrath cards + compound ticks killed me
- BALANCE: Wrath self-damage is too punishing in late game with compound escalation

### Post-Round 10 - CRITICAL BUG
- Game is STUCK at R10/10. Game-over logic didn't trigger!
- The round 10 game-over code we added doesn't seem to be working
- Bots are still playing at R10/10 but round doesn't advance past 10
- No game-over screen, no winner declaration
- CRITICAL BUG: Game-over at round 10 is broken

---

## WRATH PLAYTEST SUMMARY

### Working Well
1. N/E/S/W cardinal layout looks great
2. Card art is unique and varied per card (AI-generated)
3. Multi-card per turn works (both player and bots)
4. Auto-play on target click works perfectly
5. Effect badges show compound indicators, types, and stacking
6. Catch-up badges visible on qualifying cards
7. Snarky narrator adds personality
8. Dead players properly dimmed
9. Energy regeneration works
10. Compound notation (3→3→6) is clear

### Bugs Found
1. CRITICAL: Game-over at round 10 doesn't trigger
2. CRITICAL: No game-over screen when player dies
3. CRITICAL: Dead player still sees their cards and can't do anything
4. No hand size limit — 12+ cards overflow the hand area
5. Narrator text gets cut off at the top
6. PASS/PLAY buttons hard to click (framer-motion intercepts)

### Balance Issues
1. Sloth (BeepBoop_lol) is massively overpowered — 25 HP + 7 shield, never took damage
2. Wrath self-damage is too punishing with compound escalation
3. Compound multiplier reaches 10x by round 10 — too extreme
4. Energy regen scales too fast (+5 by round 10)
