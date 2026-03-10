/**
 * useCard3DTilt - 3D perspective tilt on mouse hover
 * 
 * Returns event handlers and a ref to apply to any element
 * for a smooth 3D tilt effect on hover. Pure CSS transforms.
 */

import { useCallback, useRef } from "react";

interface Card3DTiltOptions {
  maxTilt?: number;
  scale?: number;
  speed?: number;
}

export function useCard3DTilt({
  maxTilt = 8,
  scale = 1.04,
  speed = 300,
}: Card3DTiltOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltX = (maxTilt * (0.5 - y)).toFixed(2);
      const tiltY = (maxTilt * (x - 0.5)).toFixed(2);
      el.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale}, ${scale}, ${scale})`;
    },
    [maxTilt, scale]
  );

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.transition = `transform ${speed}ms ease-out`;
    setTimeout(() => {
      if (el) el.style.transition = "";
    }, speed);
  }, [speed]);

  const handleMouseEnter = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "";
  }, []);

  return {
    ref,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      onMouseEnter: handleMouseEnter,
    },
  };
}
