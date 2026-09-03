/**
 * StatsReveal — scroll-scrubbed word reveal.
 *
 * Ported from the v4 landing kit ("scroll-text-reveal-01"). Each word sits
 * in an overflow mask and rises from yPercent 115 to 0 on scrub, staggered
 * so the sentence assembles left-to-right across a 160vh runway.
 *
 * IMPLEMENTATION NOTE — the kit drives this with GSAP ScrollTrigger. This
 * port uses framer-motion's useScroll/useTransform instead, which is
 * already a dependency here. That is a deliberate trade: it avoids adding
 * gsap (and the pnpm-lock churn that comes with it) for a single effect
 * that framer-motion expresses just as well. The visual result is the
 * same staggered mask-rise; only the easing curve differs slightly
 * (framer's default spring-free interpolation vs GSAP's power3.out).
 *
 * The kit's DOM-walking word splitter is also dropped — the sentence is a
 * fixed literal, so the words are declared directly. That keeps
 * punctuation attached to its word (a floating "." reads badly) and lets
 * each word own its hooks in a child component rather than calling hooks
 * in a loop.
 *
 * HONESTY NOTE — the kit's §5 rule applies here and was checked:
 * every figure below is published on /balance and reproducible from the
 * v5.12 Monte Carlo run. No customer-outcome or causal claims.
 *   · 7 factions          — shared/cardData.ts ALL_DECKS
 *   · 424 cards           — /balance, "424 unique cards"
 *   · 21 boss fights      — shared/campaignData.ts CAMPAIGN_MISSIONS
 *   · 2M simulated games  — /balance, v5.12 Monte Carlo
 *   · 1.01% max deviation — /balance, PERFECT grade
 *   · free                — no payment surface exists in the codebase
 */

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

const ACCENT = "#d4a854"; // Brand Book — Candlelight

interface Word {
  t: string;
  a?: boolean; // accent
}

/** The sentence, word by word. Punctuation stays attached to its word. */
const WORDS: Word[] = [
  { t: "Seven" }, { t: "sins." },
  { t: "424", a: true }, { t: "cards.", a: true },
  { t: "21", a: true }, { t: "boss", a: true }, { t: "fights.", a: true },
  { t: "We" }, { t: "ran" },
  { t: "2", a: true }, { t: "million", a: true }, { t: "games", a: true },
  { t: "to" }, { t: "balance" }, { t: "it," }, { t: "and" }, { t: "landed" }, { t: "at" },
  { t: "1.01%", a: true }, { t: "deviation.", a: true },
  { t: "It" }, { t: "costs" },
  { t: "nothing,", a: true },
  { t: "forever." },
];

/**
 * One masked word. Owns its own hooks so the parent isn't calling
 * useTransform inside a map.
 */
function MaskedWord({
  word,
  start,
  end,
  scrollYProgress,
  instant,
}: {
  word: Word;
  start: number;
  end: number;
  scrollYProgress: MotionValue<number>;
  instant: boolean;
}) {
  const y = useTransform(scrollYProgress, [start, end], ["115%", "0%"]);
  return (
    <span
      style={{
        display: "inline-block",
        overflow: "hidden",
        verticalAlign: "top",
        paddingBottom: "0.14em",
      }}
    >
      <motion.span
        style={{
          display: "inline-block",
          willChange: "transform",
          y: instant ? "0%" : y,
          color: word.a ? ACCENT : undefined,
        }}
      >
        {word.t}
      </motion.span>
    </span>
  );
}

export default function StatsReveal() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      style={{
        background: "#0a0908",
        color: "#e8e0d0",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <div ref={runwayRef} style={{ position: "relative", height: "160vh" }}>
        <div
          className="sticky top-0 flex items-center justify-center text-center"
          style={{ height: "100vh", padding: "0 6vw" }}
        >
          <h2
            className="m-0"
            style={{
              fontFamily: "var(--font-heading)",
              maxWidth: "22ch",
              fontWeight: 500,
              fontSize: "clamp(1.6rem, 4.4vw, 3.6rem)",
              lineHeight: 1.12,
              letterSpacing: "-0.01em",
            }}
            aria-label={WORDS.map((w) => w.t).join(" ")}
          >
            {WORDS.map((word, i) => {
              // Stagger: the last word begins its rise at 0.65 progress and
              // every word takes 0.35 to land, so the sentence finishes
              // exactly as the runway ends.
              const local = WORDS.length === 1 ? 0 : i / (WORDS.length - 1);
              const start = local * 0.65;
              return (
                <span key={i} aria-hidden="true">
                  <MaskedWord
                    word={word}
                    start={start}
                    end={start + 0.35}
                    scrollYProgress={scrollYProgress}
                    instant={!!reduce}
                  />{" "}
                </span>
              );
            })}
          </h2>
        </div>
      </div>
    </section>
  );
}
