# Card Game UI Research Findings

## Status Effect Display Patterns (from Slay the Spire, Hearthstone, MtG Arena, LoR)

### Slay the Spire (Gold Standard for Effect Display)
- **Icon row below entity**: Small colored icons displayed horizontally beneath each character
- **Number overlay on icon**: Each icon has a number showing stacks/intensity (e.g., "8" on poison icon)
- **Color coding**: Green border = buff, Red border = debuff
- **Tooltip on hover**: Hovering an icon shows full description with exact numbers
- **Visual distinction**: Each effect has a unique, recognizable icon (skull for poison, flame for strength, shield for block)
- **Counter decrements visually**: Numbers update in real-time as effects tick

### Hearthstone
- **Enchantment bar**: Active buffs shown as small icons beneath minion cards on board
- **Number on card stats**: Attack/health numbers change color (green=buffed, red=damaged)
- **Tooltip popup**: Hovering shows all active enchantments with descriptions
- **Status Icons reference**: "The digit beside the icon shows the number of turns the effect lasts"
- **Visual glow**: Buffed minions have a colored glow/border

### Key Patterns Across All Games
1. **Icon + Number**: Every active effect has a small icon with a number showing stacks or remaining turns
2. **Color-coded borders**: Positive (green/blue) vs negative (red/orange)
3. **Horizontal icon row**: Effects displayed in a row, usually below the entity
4. **Tooltip for details**: Full info on hover/tap
5. **Visual feedback on application**: Flash/pulse when effect is applied or ticks
6. **Countdown visibility**: Remaining duration always visible at a glance

## Player Positioning (N/E/S/W)
- Physical card games use N/S/E/W positions around a table
- Digital adaptations: Current player always at South (bottom), opponent at North (top)
- For 4-player: South (you), North (across), East (right), West (left)
- MtG Arena uses 60/40 split (player gets more space at bottom)
- Hearthstone: Symmetric top/bottom with "Hero Corners"

## Mobile Responsiveness Patterns
- Hearthstone mobile: Condensed hero corners, larger touch targets, simplified board
- Cards fan out from bottom edge, swipeable
- Effect icons scale down but remain readable
- Portrait mode: Stack elements vertically, hand at bottom
- Touch-friendly: Minimum 44px tap targets
- Collapsible panels for secondary info

## Design Decisions for Our Game

### Compound Effect Display (PRIORITY FIX)
Current problem: Effects not clearly visible. Need:
1. **Effect badge row** under each player panel showing active effects
2. Each badge: Icon + effect type + tick counter (e.g., "2/3" for round 2 of 3)
3. **Fibonacci multiplier indicator**: Show current multiplier (1x, 1x, 2x) with visual progression
4. **Color per effect type**: Red=damage, Green=heal, Blue=shield, Purple=steal
5. **Pulse animation** when effect ticks
6. **Tooltip** on hover showing full effect details

### N/E/S/W Layout
- Current player (South): Bottom center, largest panel
- Opponent across (North): Top center
- Left opponent (West): Left side, rotated
- Right opponent (East): Right side, rotated
- Center: Arena/battlefield area with targeting lines

### Mobile
- Stack to portrait: South at bottom, North at top, E/W collapse to smaller panels
- Swipeable card hand
- Tap to select card, tap target to play
- Collapsible effects panel
