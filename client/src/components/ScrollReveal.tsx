/**
 * ScrollReveal — Wrapper component that fades in children when scrolled into view.
 * Uses Intersection Observer (no framer-motion dependency).
 *
 * Props:
 *   direction: 'up' | 'down' | 'left' | 'right' — slide direction (default: 'up')
 *   delay: number — delay in ms (default: 0)
 *   duration: number — transition duration in ms (default: 600)
 *   distance: number — slide distance in px (default: 24)
 *   className: string — additional classes
 *   as: keyof JSX.IntrinsicElements — wrapper element (default: 'div')
 */
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { CSSProperties, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  style?: CSSProperties;
  threshold?: number;
}

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 600,
  distance = 24,
  className = "",
  style,
  threshold = 0.12,
}: ScrollRevealProps) {
  const [ref, isVisible] = useScrollReveal({ threshold });

  const translateMap = {
    up: `translateY(${distance}px)`,
    down: `translateY(-${distance}px)`,
    left: `translateX(${distance}px)`,
    right: `translateX(-${distance}px)`,
  };

  const revealStyle: CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translate(0, 0)" : translateMap[direction],
    transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    willChange: "opacity, transform",
    ...style,
  };

  return (
    <div ref={ref} className={className} style={revealStyle}>
      {children}
    </div>
  );
}
