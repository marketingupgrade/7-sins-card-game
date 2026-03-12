/**
 * TargetingTracer - Themed SVG node-connector line from selected card to mouse cursor.
 *
 * When a card is selected and needs a target, a glowing bezier curve follows
 * the mouse. When a target is clicked, the line snaps to the target panel
 * with a pulse animation. Sin-themed colors and particle effects.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { SinType } from "@shared/gameTypes";

const SIN_TRACER_COLORS: Record<string, { main: string; glow: string }> = {
  wrath: { main: "rgba(220, 50, 50, 0.9)", glow: "rgba(220, 50, 50, 0.4)" },
  greed: { main: "rgba(218, 165, 32, 0.9)", glow: "rgba(218, 165, 32, 0.4)" },
  sloth: { main: "rgba(120, 80, 200, 0.9)", glow: "rgba(120, 80, 200, 0.4)" },
  pride: { main: "rgba(180, 60, 180, 0.9)", glow: "rgba(180, 60, 180, 0.4)" },
  lust: { main: "rgba(200, 50, 100, 0.9)", glow: "rgba(200, 50, 100, 0.4)" },
  envy: { main: "rgba(50, 180, 80, 0.9)", glow: "rgba(50, 180, 80, 0.4)" },
  gluttony: { main: "rgba(200, 120, 40, 0.9)", glow: "rgba(200, 120, 40, 0.4)" },
};

interface TargetingTracerProps {
  /** Whether targeting mode is active */
  isActive: boolean;
  /** The sin type of the current player for theming */
  sin: SinType;
  /** Ref to the source element (selected card) */
  sourceRef: React.RefObject<HTMLElement | null>;
  /** Ref to the locked target element (player panel), null if no target yet */
  targetRef: React.RefObject<HTMLElement | null>;
  /** Whether a target has been locked */
  isLocked: boolean;
}

export default function TargetingTracer({
  isActive,
  sin,
  sourceRef,
  targetRef,
  isLocked,
}: TargetingTracerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [sourcePos, setSourcePos] = useState({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);
  const dashOffsetRef = useRef(0);
  const particlesRef = useRef<{ x: number; y: number; age: number; vx: number; vy: number }[]>([]);

  const colors = SIN_TRACER_COLORS[sin] || SIN_TRACER_COLORS.wrath;

  // Track mouse position
  useEffect(() => {
    if (!isActive || isLocked) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isActive, isLocked]);

  // Update source position from ref
  const updateSourcePos = useCallback(() => {
    if (sourceRef.current) {
      const rect = sourceRef.current.getBoundingClientRect();
      setSourcePos({ x: rect.left + rect.width / 2, y: rect.top });
    }
  }, [sourceRef]);

  // Update target position from ref
  const updateTargetPos = useCallback(() => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setTargetPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
  }, [targetRef]);

  useEffect(() => {
    if (!isActive) return;
    updateSourcePos();
    const interval = setInterval(updateSourcePos, 100);
    return () => clearInterval(interval);
  }, [isActive, updateSourcePos]);

  useEffect(() => {
    if (!isLocked) return;
    updateTargetPos();
    const interval = setInterval(updateTargetPos, 100);
    return () => clearInterval(interval);
  }, [isLocked, updateTargetPos]);

  // Animation loop for dash offset and particles
  useEffect(() => {
    if (!isActive) return;

    const canvas = svgRef.current;
    if (!canvas) return;

    const animate = () => {
      dashOffsetRef.current -= 1.5;

      // Spawn particles along the line
      if (Math.random() > 0.6) {
        const t = Math.random();
        const endX = isLocked ? targetPos.x : mousePos.x;
        const endY = isLocked ? targetPos.y : mousePos.y;
        particlesRef.current.push({
          x: sourcePos.x + (endX - sourcePos.x) * t,
          y: sourcePos.y + (endY - sourcePos.y) * t + (Math.random() - 0.5) * 20,
          age: 0,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -Math.random() * 0.8,
        });
      }

      // Age and prune particles
      particlesRef.current = particlesRef.current
        .map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, age: p.age + 1 }))
        .filter((p) => p.age < 30);

      // Force re-render via SVG attribute update
      const path = canvas.querySelector("#tracer-path") as SVGPathElement | null;
      if (path) {
        path.setAttribute("stroke-dashoffset", String(dashOffsetRef.current));
      }

      // Update particle positions
      const particleGroup = canvas.querySelector("#tracer-particles");
      if (particleGroup) {
        particleGroup.innerHTML = particlesRef.current
          .map(
            (p) =>
              `<circle cx="${p.x}" cy="${p.y}" r="${1.5 - p.age * 0.04}" fill="${colors.main}" opacity="${Math.max(0, 1 - p.age / 30)}" />`
          )
          .join("");
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isActive, sourcePos, mousePos, targetPos, isLocked, colors]);

  if (!isActive) return null;

  const endX = isLocked ? targetPos.x : mousePos.x;
  const endY = isLocked ? targetPos.y : mousePos.y;

  // Bezier control points for a nice curve
  const dx = endX - sourcePos.x;
  const dy = endY - sourcePos.y;
  const cpOffset = Math.min(Math.abs(dy) * 0.5, 120);

  const pathD = `M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x} ${sourcePos.y - cpOffset}, ${endX} ${endY + cpOffset}, ${endX} ${endY}`;

  return (
    <svg
      ref={svgRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 50, width: "100vw", height: "100vh" }}
    >
      <defs>
        <filter id="tracer-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="tracer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.main} />
          <stop offset="100%" stopColor={colors.glow} />
        </linearGradient>
      </defs>

      {/* Glow layer */}
      <path
        d={pathD}
        fill="none"
        stroke={colors.glow}
        strokeWidth="6"
        strokeLinecap="round"
        filter="url(#tracer-glow)"
        opacity="0.5"
      />

      {/* Main tracer line */}
      <path
        id="tracer-path"
        d={pathD}
        fill="none"
        stroke="url(#tracer-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="8 4"
        strokeDashoffset={dashOffsetRef.current}
      />

      {/* Source dot */}
      <circle
        cx={sourcePos.x}
        cy={sourcePos.y}
        r="5"
        fill={colors.main}
        filter="url(#tracer-glow)"
      >
        <animate
          attributeName="r"
          values="4;6;4"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>

      {/* End dot */}
      <circle
        cx={endX}
        cy={endY}
        r={isLocked ? 7 : 4}
        fill={isLocked ? colors.main : "transparent"}
        stroke={colors.main}
        strokeWidth="2"
        filter="url(#tracer-glow)"
      >
        {isLocked && (
          <animate
            attributeName="r"
            values="6;10;6"
            dur="0.8s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {/* Particles */}
      <g id="tracer-particles" />

      {/* Crosshair at mouse when not locked */}
      {!isLocked && (
        <g transform={`translate(${endX}, ${endY})`} opacity="0.6">
          <line x1="-8" y1="0" x2="-3" y2="0" stroke={colors.main} strokeWidth="1.5" />
          <line x1="3" y1="0" x2="8" y2="0" stroke={colors.main} strokeWidth="1.5" />
          <line x1="0" y1="-8" x2="0" y2="-3" stroke={colors.main} strokeWidth="1.5" />
          <line x1="0" y1="3" x2="0" y2="8" stroke={colors.main} strokeWidth="1.5" />
        </g>
      )}
    </svg>
  );
}
