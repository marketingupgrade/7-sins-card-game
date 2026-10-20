import { useState, useEffect } from "react";

/**
 * True on phone-sized viewports: narrower than `breakpoint` (768px, the md
 * breakpoint) OR shorter than `minHeight`. The height test makes landscape
 * phones (e.g. 844×390) count as mobile — no desktop layout fits in 390px of
 * height. Matches the `board` variant in index.css.
 */
export function useIsMobile(breakpoint = 768, minHeight = 540): boolean {
  const query = `(max-width: ${breakpoint - 1}px), (max-height: ${minHeight - 1}px)`;
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return isMobile;
}
