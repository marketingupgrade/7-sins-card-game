# Round Freeze Bug — Root Cause Analysis

## The Three Bugs

### Bug 1: Race condition — double resolution (PRIMARY CAUSE)
Both client-side `lockInCards()` and server-side `enforceSelectionDeadline()` can trigger `resolveLockedPlays()` → `advanceRound()` simultaneously. In multiplayer, when the last player locks in, their client detects "allConfirmed" and triggers resolution. But other clients also receive the Supabase realtime update and may re-evaluate. The server timer check (polled every 3s) can also fire at the same moment.

The fix: Use an atomic compare-and-swap on `turn_phase`. Only transition from "selection" to "resolution" if the current phase is still "selection". If it's already "resolution" or "round_end", skip resolution.

### Bug 2: 4-second blocking delay in advanceRound
`await new Promise(resolve => setTimeout(resolve, 4000))` blocks the entire function for 4 seconds. During this window, the game is in "round_end" phase. If a second resolution fires during this delay, or if the serverless function times out, the game gets stuck.

The fix: Remove the 4-second delay from the game engine. The client already has its own resolution animation timing (ResolutionReveal component + round-end prompt). The engine should immediately transition to "selection" after advancing the round.

### Bug 3: Server-side energy reset inconsistency
Server `refreshPlayerEnergy()` resets energy to `MAX_ENERGY` (7) every round, ignoring carry-over. Client version correctly does `currentUnspent + ENERGY_PER_TURN` capped at MAX_ENERGY. This means server-resolved rounds (via timer enforcement) give different energy than client-resolved rounds.

The fix: Align server `refreshPlayerEnergy()` with client version.
