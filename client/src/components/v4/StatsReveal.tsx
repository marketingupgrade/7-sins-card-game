/**
 * StatsReveal — scroll-scrubbed word reveal.
 *
 * Ported from the v4 landing kit ("scroll-text-reveal-01"). Each word sits
 * in an overflow mask at yPercent 115 and scrubs up to 0 (power3.out,
 * duration 1, stagger 0.35, scrub 0.8) across a 160vh runway with a 1.5
 * trailing hold. Motion is verbatim from the kit; only the stack changed
 * — Next's `"use client"` is dropped (Vite SPA), and type/colour are
 * retuned to the Brand Book (Cinzel display, Candlelight accent on
 * Cathedral Stone).
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

import { useEffect, useRef } from "react";
import { gsap } from "./lib/gsap";

const ACCENT = "#d4a854"; // Brand Book — Candlelight

/** The sentence, split into plain / accent fragments. */
const STATS: { text: string; accent?: boolean }[] = [
  { text: "Seven sins. " },
  { text: "424 cards", accent: true },
  { text: ". " },
  { text: "21 boss fights", accent: true },
  { text: ". We ran " },
  { text: "2 million games", accent: true },
  { text: " to balance it, and landed at " },
  { text: "1.01% deviation", accent: true },
  { text: ". It costs " },
  { text: "nothing", accent: true },
  { text: ", forever." },
];

export default function StatsReveal() {
  const rootRef = useRef<HTMLElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const runway = runwayRef.current;
    const h2 = h2Ref.current;
    if (!root || !runway || !h2) return;

    // Split into word/mask pairs, recursing into inline elements so the
    // accent <em> fragments keep their colour through the split.
    const inners: HTMLSpanElement[] = [];
    const wrapWords = (el: Node) => {
      Array.from(el.childNodes).forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          wrapWords(node);
          return;
        }
        if (node.nodeType !== Node.TEXT_NODE) return;
        const textNode = node as Text;
        const frag = document.createDocumentFragment();
        (textNode.textContent ?? "").split(/(\s+)/).forEach((piece) => {
          if (!piece) return;
          if (/^\s+$/.test(piece)) {
            frag.appendChild(document.createTextNode(" "));
            return;
          }
          const wordSpan = document.createElement("span");
          wordSpan.style.cssText =
            "display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:0.14em";
          const innerSpan = document.createElement("span");
          innerSpan.style.cssText = "display:inline-block;will-change:transform";
          innerSpan.textContent = piece;
          wordSpan.appendChild(innerSpan);
          frag.appendChild(wordSpan);
          inners.push(innerSpan);
        });
        el.replaceChild(frag, textNode);
      });
    };
    wrapWords(h2);
    if (!inners.length) return;

    // Reduced motion: land on the final state, skip the scrub entirely.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set(inners, { yPercent: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(inners, { yPercent: 115 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: runway,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
        },
      });

      tl.to(inners, {
        yPercent: 0,
        ease: "power3.out",
        duration: 1,
        stagger: 0.35,
      });
      // Trailing hold so the finished sentence sits for a beat.
      tl.to({}, { duration: 1.5 });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
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
            ref={h2Ref}
            className="m-0"
            style={{
              fontFamily: "var(--font-heading)",
              maxWidth: "22ch",
              fontWeight: 500,
              fontSize: "clamp(1.6rem, 4.4vw, 3.6rem)",
              lineHeight: 1.12,
              letterSpacing: "-0.01em",
            }}
          >
            {STATS.map((part, i) =>
              part.accent ? (
                <em key={i} style={{ fontStyle: "normal", color: ACCENT }}>
                  {part.text}
                </em>
              ) : (
                <span key={i}>{part.text}</span>
              ),
            )}
          </h2>
        </div>
      </div>
    </section>
  );
}
