# Immersion Design Notes — Synthesized from Skills

## Key Principles for Card Game Immersion

### From Game Design (Combat Design / Game UX / Player Psychology)
1. **Multi-sensory feedback**: Every action needs visual + audio confirmation within 100ms
2. **Hit Stop / Screen Shake**: Brief pause on impact communicates weight (2-4 frame pause)
3. **Particle Effects**: Visual reward for actions (sparks, bursts at point of impact)
4. **Slow Motion**: Emphasize critical moments (final kill, big damage)
5. **Floating damage numbers**: Spatial UI that shows damage/heal values at point of impact
6. **Progressive disclosure**: Only show info the player needs RIGHT NOW
7. **Flow state**: Challenge must match skill; resolution pacing creates tension/release cycle
8. **Diegetic vs Non-Diegetic UI**: More diegetic = more immersive

### From Behavioral Sciences (Octalysis)
1. **CD3 Creativity & Feedback**: Immediate feedback loops on every action
2. **CD7 Unpredictability & Curiosity**: Variable rewards, curiosity gaps
3. **CD8 Loss Avoidance**: Frame HP loss as painful (screen effects, urgency cues)
4. **Loss aversion coefficient ~2x**: Losing HP should feel 2x worse than gaining it

### From UX Design (Interaction Design)
1. **Microinteractions**: Trigger → Rules → Feedback → Loops (Saffer framework)
2. **Animation 200-500ms**: Natural feel for transitions
3. **State Design**: Every state (loading, empty, error, success) needs deliberate design
4. **Celebrate success states**: Reinforce positive behavior with delight moments

## Concrete Improvements to Implement

### A. Round Transition Feedback (CRITICAL)
- Add a "ROUND X" banner that slams in with screen shake when new round starts
- Show a brief round summary: "Round 5 dealt 47 total damage across all players"
- Animate the round counter with a pulse/glow effect

### B. Damage/Heal Floating Numbers
- Show floating "+12 HP" or "-8 DMG" numbers that rise and fade from player panels
- Color-code: red for damage, green for heal, blue for shield, yellow for energy
- Use different sizes for different magnitudes (big damage = bigger number)

### C. HP Bar Tension Feedback
- Screen edge vignette when YOUR HP drops below 25% (red pulsing border)
- HP bar shakes when taking damage
- "Critical HP" warning state with heartbeat-like pulse

### D. Card Play Impact
- Screen shake on high-damage card plays
- Brief flash/pulse on the target player's panel when they take damage
- Card "burns away" animation when played (not just disappear)

### E. Compound Effect Tick Feedback
- Show tick damage as it happens each round with floating numbers
- Brief flash on affected player panels during effect resolution
- "Tick" sound effect concept (visual pulse since we're web-based)

### F. Turn Timer Improvements
- Timer should NOT start during resolution — only after all effects resolve
- Visual urgency: timer bar changes color (green → yellow → red)
- Last 5 seconds: timer pulses with increasing urgency
- "Time's up!" dramatic moment when timer expires
