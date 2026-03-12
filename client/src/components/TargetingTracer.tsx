/**
 * TargetingTracer - Hearthstone-style smooth targeting arrow.
 *
 * A glowing, faction-colored bezier curve that flows from the selected card
 * to the mouse cursor (or snaps to a locked target). Features smooth
 * catenary-like droop curve, faction-colored gradient with animated energy
 * flow, glowing trail with soft outer halo, diamond arrowhead at the
 * endpoint, and pulsing source/target nodes.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { SinType } from "@shared/gameTypes";
import { getSinHexColor } from "@/lib/sinColors";

/* ── Helpers ─────────────────────────────────────────────── */

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Lighten a hex color by mixing with white */
function lightenHex(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;
}

/* ── Types ───────────────────────────────────────────────── */

interface TargetingTracerProps {
  isActive: boolean;
  sin: SinType;
  sourceRef: React.RefObject<HTMLElement | null>;
  targetRef: React.RefObject<HTMLElement | null>;
  isLocked: boolean;
}

/* ── Component ───────────────────────────────────────────── */

export default function TargetingTracer({
  isActive,
  sin,
  sourceRef,
  targetRef,
  isLocked,
}: TargetingTracerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const sourceRect = useRef({ x: 0, y: 0 });
  const targetRect = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);
  const [, forceUpdate] = useState(0);

  const factionHex = getSinHexColor(sin);
  const factionLight = lightenHex(factionHex, 0.5);

  // Track mouse
  useEffect(() => {
    if (!isActive || isLocked) return;
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [isActive, isLocked]);

  // Update source position
  const updateSource = useCallback(() => {
    if (sourceRef.current) {
      const r = sourceRef.current.getBoundingClientRect();
      sourceRect.current = { x: r.left + r.width / 2, y: r.top };
    }
  }, [sourceRef]);

  // Update target position
  const updateTarget = useCallback(() => {
    if (targetRef.current) {
      const r = targetRef.current.getBoundingClientRect();
      targetRect.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
  }, [targetRef]);

  useEffect(() => {
    if (!isActive) return;
    updateSource();
    const iv = setInterval(updateSource, 80);
    return () => clearInterval(iv);
  }, [isActive, updateSource]);

  useEffect(() => {
    if (!isLocked) return;
    updateTarget();
    const iv = setInterval(updateTarget, 80);
    return () => clearInterval(iv);
  }, [isLocked, updateTarget]);

  // Canvas animation loop
  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      timeRef.current += 0.02;
      const t = timeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const sx = sourceRect.current.x;
      const sy = sourceRect.current.y;
      const ex = isLocked ? targetRect.current.x : mouseRef.current.x;
      const ey = isLocked ? targetRect.current.y : mouseRef.current.y;

      const dx = ex - sx;
      const dy = ey - sy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 5) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      // Hearthstone-style targeting arrow: a smooth quadratic arc that bows
      // upward through a single control point above the midpoint.
      // This keeps the curve simple, elegant, and always within the viewport.
      const midX = (sx + ex) / 2;
      const topY = Math.min(sy, ey);

      // Arc height: proportional to horizontal distance, clamped
      const arcHeight = Math.min(Math.abs(dx) * 0.4 + 40, 180);

      // Single control point above the midpoint for a clean parabolic arc
      const cpx = midX;
      const cpy = Math.max(20, topY - arcHeight);

      // Convert to cubic bezier (quadratic -> cubic: cp1 = 1/3 start + 2/3 cp, cp2 = 2/3 cp + 1/3 end)
      const cp1x = sx + (2 / 3) * (cpx - sx);
      const cp1y = sy + (2 / 3) * (cpy - sy);
      const cp2x = ex + (2 / 3) * (cpx - ex);
      const cp2y = ey + (2 / 3) * (cpy - ey);

      // ── Layer 1: Wide soft glow ──
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = factionHex;
      ctx.lineWidth = 20;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = factionHex;
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, ex, ey);
      ctx.stroke();
      ctx.restore();

      // ── Layer 2: Medium glow ──
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = factionHex;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.shadowColor = factionHex;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, ex, ey);
      ctx.stroke();
      ctx.restore();

      // ── Layer 3: Core bright line ──
      ctx.save();
      ctx.globalAlpha = 0.9;
      const grad = ctx.createLinearGradient(sx, sy, ex, ey);
      grad.addColorStop(0, factionLight);
      grad.addColorStop(0.5, factionHex);
      grad.addColorStop(1, factionLight);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.shadowColor = factionHex;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, ex, ey);
      ctx.stroke();
      ctx.restore();

      // ── Layer 4: Animated energy orbs flowing along the curve ──
      const numOrbs = 5;
      for (let i = 0; i < numOrbs; i++) {
        const orbT = ((t * 0.8 + i / numOrbs) % 1);
        // Cubic bezier point at parameter orbT
        const omt = 1 - orbT;
        const px = omt * omt * omt * sx + 3 * omt * omt * orbT * cp1x + 3 * omt * orbT * orbT * cp2x + orbT * orbT * orbT * ex;
        const py = omt * omt * omt * sy + 3 * omt * omt * orbT * cp1y + 3 * omt * orbT * orbT * cp2y + orbT * orbT * orbT * ey;

        const orbAlpha = Math.sin(orbT * Math.PI) * 0.8;
        const orbSize = 2 + Math.sin(orbT * Math.PI) * 2;

        ctx.save();
        ctx.globalAlpha = orbAlpha;
        ctx.fillStyle = factionLight;
        ctx.shadowColor = factionHex;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(px, py, orbSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ── Layer 5: Source pulsing circle ──
      const sourcePulse = 4 + Math.sin(t * 3) * 2;
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = factionHex;
      ctx.shadowColor = factionHex;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(sx, sy, sourcePulse, 0, Math.PI * 2);
      ctx.fill();
      // Inner bright core
      ctx.globalAlpha = 1;
      ctx.fillStyle = factionLight;
      ctx.beginPath();
      ctx.arc(sx, sy, sourcePulse * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ── Layer 6: End point — diamond arrowhead or crosshair ──
      if (isLocked) {
        // Pulsing diamond at locked target
        const targetPulse = 8 + Math.sin(t * 4) * 3;
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = factionHex;
        ctx.shadowColor = factionHex;
        ctx.shadowBlur = 20;
        ctx.translate(ex, ey);
        ctx.rotate(Math.PI / 4 + t * 0.5);
        ctx.fillRect(-targetPulse / 2, -targetPulse / 2, targetPulse, targetPulse);
        ctx.restore();

        // Inner bright diamond
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.fillStyle = factionLight;
        ctx.translate(ex, ey);
        ctx.rotate(Math.PI / 4 + t * 0.5);
        ctx.fillRect(-targetPulse / 4, -targetPulse / 4, targetPulse / 2, targetPulse / 2);
        ctx.restore();
      } else {
        // Crosshair at mouse
        const chSize = 10 + Math.sin(t * 2) * 2;
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = factionHex;
        ctx.lineWidth = 2;
        ctx.shadowColor = factionHex;
        ctx.shadowBlur = 8;

        // Outer ring
        ctx.beginPath();
        ctx.arc(ex, ey, chSize, 0, Math.PI * 2);
        ctx.stroke();

        // Cross lines
        ctx.beginPath();
        ctx.moveTo(ex - chSize - 4, ey);
        ctx.lineTo(ex - chSize / 2, ey);
        ctx.moveTo(ex + chSize / 2, ey);
        ctx.lineTo(ex + chSize + 4, ey);
        ctx.moveTo(ex, ey - chSize - 4);
        ctx.lineTo(ex, ey - chSize / 2);
        ctx.moveTo(ex, ey + chSize / 2);
        ctx.lineTo(ex, ey + chSize + 4);
        ctx.stroke();

        // Center dot
        ctx.globalAlpha = 1;
        ctx.fillStyle = factionLight;
        ctx.beginPath();
        ctx.arc(ex, ey, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [isActive, isLocked, factionHex, factionLight]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 50 }}
    />
  );
}
