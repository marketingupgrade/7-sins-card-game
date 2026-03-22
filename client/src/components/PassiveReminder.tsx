/**
 * PassiveReminder — Persistent Passive Ability Indicator
 *
 * Audit fix #4: Shows a compact, always-visible reminder of a player's
 * faction passive ability. During targeting, shows opponent passives
 * so players understand the consequences of their target choice.
 *
 * Two modes:
 * - `badge`: Compact badge for player panels (shows name + icon)
 * - `targeting`: Expanded card for target selection (shows full description + warning)
 */

import { memo } from "react";
import { motion } from "framer-motion";
import { SinType, PASSIVE_INFO } from "@shared/gameTypes";

interface PassiveReminderProps {
  sin: SinType;
  mode?: "badge" | "targeting";
  /** Whether this is the current player's own passive */
  isSelf?: boolean;
}

/** Targeting warnings — what happens when you attack this faction */
const TARGETING_WARNINGS: Record<SinType, string> = {
  wrath: "⚠ Attacking Wrath reflects damage back to YOU",
  sloth: "Sloth generates shields every turn — chip damage is ineffective",
  greed: "Greed gains shields from dealing damage — they benefit from aggression",
  envy: "Envy amplifies your worst affliction when they damage you",
  pride: "Pride's effects are boosted when they play expensive cards",
  lust: "Lust heals from damage ticks — sustained damage feeds them",
  gluttony: "Gluttony gains energy from burning your cards",
};

/** Short passive descriptions for badge mode */
const SHORT_PASSIVE: Record<SinType, string> = {
  wrath: "Reflects damage",
  sloth: "Generates shields",
  greed: "Shields from damage dealt",
  envy: "Amplifies afflictions",
  pride: "Boosts expensive plays",
  lust: "Heals from damage ticks",
  gluttony: "Energy from card burns",
};

const PassiveReminder = memo(function PassiveReminder({ sin, mode = "badge", isSelf = false }: PassiveReminderProps) {
  const passive = PASSIVE_INFO[sin];
  if (!passive) return null;

  if (mode === "badge") {
    return (
      <div
        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px]"
        style={{
          fontFamily: "var(--font-heading)",
          backgroundColor: `color-mix(in oklch, var(--color-${sin}) 8%, transparent)`,
          borderLeft: `2px solid color-mix(in oklch, var(--color-${sin}) 40%, transparent)`,
          color: `color-mix(in oklch, var(--color-${sin}) 80%, white)`,
        }}
        title={passive.description}
      >
        <span>{passive.icon}</span>
        <span className="font-bold tracking-wider uppercase">{passive.name}</span>
        <span className="opacity-50 hidden sm:inline">— {SHORT_PASSIVE[sin]}</span>
      </div>
    );
  }

  // Targeting mode — expanded card with warning
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-lg p-2.5 border"
      style={{
        backgroundColor: `color-mix(in oklch, var(--color-${sin}) 6%, oklch(0.12 0.02 280))`,
        borderColor: `color-mix(in oklch, var(--color-${sin}) 25%, transparent)`,
      }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">{passive.icon}</span>
        <span
          className="text-[10px] font-bold tracking-wider uppercase"
          style={{
            fontFamily: "var(--font-heading)",
            color: `var(--color-${sin})`,
          }}
        >
          {passive.name}
        </span>
      </div>
      <p
        className="text-[10px] leading-relaxed mb-1.5"
        style={{
          fontFamily: "var(--font-body)",
          color: "oklch(0.7 0 0 / 0.7)",
        }}
      >
        {passive.description}
      </p>
      {!isSelf && (
        <p
          className="text-[9px] font-bold px-1.5 py-1 rounded"
          style={{
            fontFamily: "var(--font-heading)",
            backgroundColor: "oklch(0.2 0.08 25 / 0.4)",
            color: "oklch(0.75 0.15 60)",
          }}
        >
          {TARGETING_WARNINGS[sin]}
        </p>
      )}
    </motion.div>
  );
});

export default PassiveReminder;
