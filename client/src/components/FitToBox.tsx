/**
 * FitToBox — scale a block of UI so it always fits the space it's given.
 *
 * The game board's arena (opponent panels, ritual circle, your panel) has a
 * natural size of ~560px tall. On a 2560×1440 monitor that's lost in empty
 * space; on a 1366×768 laptop it pushed the action bar and hand off-screen.
 * This measures the content's natural height and applies CSS `zoom` so it
 * fills the box: down to `minZoom` on short screens, up to `maxZoom` on
 * large ones.
 *
 * `zoom` rather than `transform: scale` on purpose: zoom changes layout (so
 * hit-testing, getBoundingClientRect and flex/grid sizing all agree), and it
 * does not turn the box into a containing block for position:fixed
 * descendants the way a transform does.
 *
 * Measurement uses getBoundingClientRect (visual px, zoom applied) divided
 * by the current zoom, which gives the natural height in a way that is
 * consistent across browsers' zoom implementations. Converges in 1–2 passes;
 * re-runs on box resize and on content resize (players dying, afflictions
 * growing).
 */
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

interface FitToBoxProps {
  children: ReactNode;
  className?: string;
  minZoom?: number;
  maxZoom?: number;
}

export default function FitToBox({ children, className = "", minZoom = 0.6, maxZoom = 1.2 }: FitToBoxProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(1);
  const [zoom, setZoom] = useState(1);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const content = contentRef.current;
    if (!outer || !content) return;
    let raf = 0;
    const fit = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const ow = outer.clientWidth;
        const oh = outer.clientHeight;
        if (!ow || !oh) return;
        const z = zoomRef.current;
        const naturalH = content.getBoundingClientRect().height / z;
        if (!naturalH) return;
        // Aim 1.5% inside the box: the fit converges to within 0.5%, which
        // could otherwise leave the bottom row a few px past the edge.
        const next = Math.min(maxZoom, Math.max(minZoom, (oh * 0.985) / naturalH));
        setBox(b => (b.w === ow && b.h === oh ? b : { w: ow, h: oh }));
        if (Math.abs(next - z) > 0.005) {
          zoomRef.current = next;
          setZoom(next);
        }
      });
    };
    const ro = new ResizeObserver(fit);
    ro.observe(outer);
    ro.observe(content);
    fit();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [minZoom, maxZoom]);

  return (
    <div ref={outerRef} className={`relative min-h-0 overflow-hidden ${className}`}>
      <div
        // "safe" centre: centred when it fits, top-aligned when it can't
        // shrink enough — plain centring overflowed equally at the top,
        // tucking the top row of panels under the header.
        className="absolute left-0 top-0 flex flex-col [justify-content:safe_center]"
        style={{
          zoom,
          // Authored size = box / zoom, so after zoom it covers the box exactly.
          width: box.w ? box.w / zoom : "100%",
          height: box.h ? box.h / zoom : "100%",
        }}
      >
        <div ref={contentRef}>{children}</div>
      </div>
    </div>
  );
}
