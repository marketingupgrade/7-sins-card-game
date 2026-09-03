/**
 * GSAP singleton — the ONLY place plugins get registered.
 *
 * Ported from the v4 landing kit. The kit's implementation guide is
 * emphatic about this and it's worth repeating: registering ScrollTrigger
 * from two different entry points makes it silently miscalculate pin and
 * scrub positions. Every v4 component imports gsap from here, never from
 * `gsap` directly.
 *
 * "signature" is the house ease — 0.22, 1, 0.36, 1: a fast start with a
 * long deceleration.
 */
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(CustomEase, ScrollTrigger);

CustomEase.create("signature", "0.22, 1, 0.36, 1");

export { gsap, ScrollTrigger };
