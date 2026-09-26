/**
 * Honour the OS "reduce motion" setting for every framer-motion animation.
 *
 * MotionConfig reducedMotion="user" isn't enough on its own: it only drops
 * transform/layout motion, so the game's opacity loops (glows, pulses,
 * corruption breathing) kept running forever. With skipAnimations every
 * framer animation completes instantly — loops rest on their final
 * keyframe, overlays appear without the fade. CSS keyframes are covered by
 * the prefers-reduced-motion block in index.css, and the Babylon backdrop
 * checks the media query itself.
 *
 * Imported for its side effect by the game pages only: importing framer
 * from App.tsx would drag its chunk onto the homepage critical path.
 */
import { MotionGlobalConfig } from "framer-motion";

if (typeof window !== "undefined" && window.matchMedia) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const apply = () => {
    MotionGlobalConfig.skipAnimations = mq.matches;
  };
  apply();
  mq.addEventListener?.("change", apply);
}
