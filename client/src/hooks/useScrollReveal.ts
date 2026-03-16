/**
 * useScrollReveal — Intersection Observer hook for scroll-triggered animations.
 * Returns a ref to attach to the element and a boolean indicating visibility.
 * Once visible, stays visible (no re-hide on scroll up).
 *
 * Usage:
 *   const [ref, isVisible] = useScrollReveal({ threshold: 0.15 });
 *   <div ref={ref} className={isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}>
 */
import { useEffect, useRef, useState } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  /** If true, element can re-hide when scrolled out of view */
  resetOnExit?: boolean;
}

export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const { threshold = 0.12, rootMargin = "0px 0px -40px 0px", resetOnExit = false } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (!resetOnExit) observer.unobserve(el);
        } else if (resetOnExit) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, resetOnExit]);

  return [ref, isVisible] as const;
}

export default useScrollReveal;
