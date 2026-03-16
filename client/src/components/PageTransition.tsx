/**
 * PageTransition — Wraps page content with a smooth fade-in on mount.
 * Uses CSS transitions only (no framer-motion dependency).
 * Respects prefers-reduced-motion.
 */
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  duration?: number;
}

export default function PageTransition({
  children,
  className = "",
  duration = 400,
}: PageTransitionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check reduced motion preference
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setMounted(true);
      return;
    }
    // Small delay to ensure the initial state renders first
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const style: CSSProperties = {
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(8px)",
    transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
  };

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
