/**
 * DeckPile — Deck & Discard visual with card draw animation
 *
 * Shows a stacked pile of card backs using the faction portrait as art,
 * sin-coloured glassmorphism overlay, and Painterly archetype icon.
 * Detects hand-size changes and fires a card-back arc animation to the hand.
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { SinType } from "@shared/gameTypes";
import { FACTION_PORTRAITS } from "@/lib/factionPortraits";
import { SIN_ARCHETYPE_ICONS } from "@/lib/iconUtils";
import { soundEngine } from "@/lib/soundEngine";

// ─── Sin Palette ──────────────────────────────────────────────────────────────
const SIN_HEX: Record<SinType, string> = {
  wrath: "#ef4444",
  sloth: "#a855f7",
  greed: "#eab308",
  envy:  "#10b981",
};

const SIN_LABEL: Record<SinType, string> = {
  wrath: "Wrath",
  sloth: "Sloth",
  greed: "Greed",
  envy:  "Envy",
};

const SIN_GRADIENT: Record<SinType, string> = {
  wrath: "linear-gradient(160deg, oklch(0.14 0.07 25 / 0.88) 0%, oklch(0.09 0.05 15 / 0.95) 100%)",
  sloth: "linear-gradient(160deg, oklch(0.13 0.07 290 / 0.88) 0%, oklch(0.08 0.05 280 / 0.95) 100%)",
  greed: "linear-gradient(160deg, oklch(0.15 0.07 85 / 0.88) 0%, oklch(0.10 0.05 75 / 0.95) 100%)",
  envy:  "linear-gradient(160deg, oklch(0.13 0.07 155 / 0.88) 0%, oklch(0.08 0.05 145 / 0.95) 100%)",
};

// ─── Card back (reused for pile and flying anim) ──────────────────────────────
function CardBack({ sin, size = "sm" }: { sin: SinType; size?: "sm" | "lg" }) {
  const hex   = SIN_HEX[sin];
  const w     = size === "lg" ? 120 : 64;
  const h     = size === "lg" ? 180 : 96;
  const iconW = size === "lg" ? 48 : 28;

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{
        width: w, height: h,
        borderRadius: size === "lg" ? 12 : 8,
        background: SIN_GRADIENT[sin],
        border: `1px solid ${hex}55`,
        boxShadow: `0 0 12px ${hex}33, inset 0 1px 0 ${hex}22, 0 2px 8px oklch(0 0 0 / 0.5)`,
      }}
    >
      {/* Faction portrait watermark */}
      <img
        src={FACTION_PORTRAITS[sin]}
        alt=""
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.22, mixBlendMode: "luminosity" }}
      />

      {/* Inner border flourish */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: size === "lg" ? 5 : 3,
          borderRadius: size === "lg" ? 8 : 5,
          border: `1px solid ${hex}30`,
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          inset: size === "lg" ? 9 : 5,
          borderRadius: size === "lg" ? 6 : 4,
          border: `1px solid ${hex}18`,
        }}
      />

      {/* Corner marks — tiny sin sigil dots */}
      {[["top-1.5 left-1.5"], ["top-1.5 right-1.5"], ["bottom-1.5 left-1.5"], ["bottom-1.5 right-1.5"]].map((pos, i) => (
        <div
          key={i}
          className={`absolute w-1 h-1 rounded-full ${pos[0]}`}
          style={{ backgroundColor: hex, opacity: 0.5, boxShadow: `0 0 3px ${hex}` }}
        />
      ))}

      {/* Top label */}
      <div
        className="absolute top-0 left-0 right-0 text-center pt-1"
        style={{
          fontSize: size === "lg" ? 7 : 5,
          letterSpacing: "0.25em",
          color: hex,
          opacity: 0.7,
          fontFamily: "var(--font-heading)",
        }}
      >
        VII · SINS
      </div>

      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={SIN_ARCHETYPE_ICONS[sin]}
          alt={SIN_LABEL[sin]}
          draggable={false}
          style={{
            width: iconW, height: iconW,
            objectFit: "contain",
            filter: `drop-shadow(0 0 ${size === "lg" ? 10 : 6}px ${hex})`,
            opacity: 0.9,
          }}
        />
      </div>

      {/* Bottom sin name */}
      <div
        className="absolute bottom-0 left-0 right-0 text-center pb-1"
        style={{
          fontSize: size === "lg" ? 7 : 5,
          letterSpacing: "0.2em",
          color: hex,
          opacity: 0.8,
          fontFamily: "var(--font-heading)",
          textTransform: "uppercase",
        }}
      >
        {SIN_LABEL[sin]}
      </div>
    </div>
  );
}

// ─── Flying card portal animation ─────────────────────────────────────────────
interface FlyingCard {
  id: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  sin: SinType;
}

function FlyingCards({ cards, onDone }: { cards: FlyingCard[]; onDone: (id: number) => void }) {
  return createPortal(
    <AnimatePresence>
      {cards.map((fc) => (
        <motion.div
          key={fc.id}
          className="fixed pointer-events-none z-[200]"
          style={{ originX: 0.5, originY: 0.5 }}
          initial={{
            x: fc.fromX - 32,   // half card width
            y: fc.fromY - 48,   // half card height
            opacity: 1,
            rotate: 0,
            scale: 0.85,
          }}
          animate={{
            x: fc.toX - 32,
            y: fc.toY - 48,
            opacity: [1, 1, 0],
            rotate: [-6, 3, 0],
            scale: [0.85, 1.05, 0.9],
          }}
          transition={{
            duration: 0.55,
            ease: [0.25, 0.46, 0.45, 0.94],
            opacity: { times: [0, 0.7, 1] },
          }}
          onAnimationComplete={() => onDone(fc.id)}
        >
          <CardBack sin={fc.sin} size="sm" />
        </motion.div>
      ))}
    </AnimatePresence>,
    document.body
  );
}

// ─── Stacked pile visual ───────────────────────────────────────────────────────
interface PileProps {
  sin: SinType;
  count: number;
  label: string;
  isDiscard?: boolean;
  pileRef?: React.RefObject<HTMLDivElement | null>;
  pulse?: boolean;
}

function Pile({ sin, count, label, isDiscard = false, pileRef, pulse }: PileProps) {
  const hex = SIN_HEX[sin];
  const stackDepth = Math.min(count > 0 ? 3 : 0, count);

  return (
    <div className="flex flex-col items-center gap-1.5 select-none">
      {/* Label */}
      <div
        className="text-[9px] tracking-widest uppercase"
        style={{ color: hex, opacity: 0.6, fontFamily: "var(--font-heading)" }}
      >
        {label}
      </div>

      {/* Stack */}
      <div
        ref={pileRef}
        className="relative"
        style={{ width: 64, height: 96 }}
      >
        {/* Shadow stack cards */}
        {Array.from({ length: stackDepth - 1 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded"
            style={{
              width: 64, height: 96,
              top:  (stackDepth - 1 - i) * 1.5,
              left: isDiscard ? -(stackDepth - 1 - i) * 1.5 : (stackDepth - 1 - i) * 1.5,
              background: SIN_GRADIENT[sin],
              border: `1px solid ${hex}33`,
              opacity: 0.25 + i * 0.1,
              borderRadius: 8,
            }}
          />
        ))}

        {/* Top card */}
        {count > 0 ? (
          <motion.div
            className="absolute top-0 left-0"
            animate={pulse ? {
              boxShadow: [
                `0 0 0px ${hex}00`,
                `0 0 16px ${hex}88`,
                `0 0 0px ${hex}00`,
              ],
            } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ borderRadius: 8 }}
          >
            <CardBack sin={sin} size="sm" />
          </motion.div>
        ) : (
          // Empty pile placeholder
          <div
            className="absolute top-0 left-0 rounded flex items-center justify-center"
            style={{
              width: 64, height: 96,
              border: `1px dashed ${hex}25`,
              borderRadius: 8,
            }}
          >
            <span style={{ fontSize: 9, color: hex, opacity: 0.3, fontFamily: "var(--font-heading)" }}>
              EMPTY
            </span>
          </div>
        )}

        {/* Count badge */}
        {count > 0 && (
          <motion.div
            key={count}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="absolute -top-2 -right-2 min-w-[18px] h-[18px] rounded-full flex items-center justify-center z-20"
            style={{
              background: hex,
              boxShadow: `0 0 8px ${hex}99`,
              fontSize: 9,
              fontWeight: 900,
              color: "#000",
              padding: "0 4px",
              fontFamily: "var(--font-heading)",
            }}
          >
            {count}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
interface DeckPileProps {
  sin: SinType;
  deckSize: number;
  discardSize: number;
  handSize: number;    // triggers draw animation when it increases
  isMyTurn: boolean;
}

export default function DeckPile({ sin, deckSize, discardSize, handSize, isMyTurn }: DeckPileProps) {
  const deckRef  = useRef<HTMLDivElement>(null);
  const prevHand = useRef(handSize);
  const [flying, setFlying] = useState<FlyingCard[]>([]);

  useEffect(() => {
    const delta = handSize - prevHand.current;
    prevHand.current = handSize;

    if (delta <= 0 || !deckRef.current) return;

    // Spawn one arc per card drawn (capped at 3 simultaneous)
    const count = Math.min(delta, 3);
    const deckRect = deckRef.current.getBoundingClientRect();

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const id = Date.now() + i;
        // Target: bottom-center of screen (where the hand lives)
        const toX = window.innerWidth  * 0.5 + (i - 0.5) * 80;
        const toY = window.innerHeight * 0.85;
        setFlying(prev => [...prev, {
          id, sin,
          fromX: deckRect.left + deckRect.width / 2,
          fromY: deckRect.top  + deckRect.height / 2,
          toX, toY,
        }]);
        soundEngine.playSfx("draw");
      }, i * 120);
    }
  }, [handSize, sin]);

  const removeFly = (id: number) => setFlying(prev => prev.filter(f => f.id !== id));

  return (
    <>
      <div className="flex items-end gap-3 shrink-0 pb-2">
        {/* Discard pile */}
        <Pile
          sin={sin}
          count={discardSize}
          label="Discard"
          isDiscard
        />

        {/* Draw pile */}
        <Pile
          sin={sin}
          count={deckSize}
          label="Deck"
          pileRef={deckRef}
          pulse={isMyTurn && deckSize > 0}
        />
      </div>

      {/* Flying cards — rendered into document.body via portal */}
      <FlyingCards cards={flying} onDone={removeFly} />
    </>
  );
}
