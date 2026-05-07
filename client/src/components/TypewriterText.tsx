/**
 * TypewriterText — character-by-character text reveal.
 *
 * Used by Campaign mode to deliver narrator monologues with theatre instead
 * of dropping a wall of text. Renders the children string one character at
 * a time, optionally firing a soft audio "tick" every few characters.
 *
 * Click anywhere on the component (or call `onSkipRequest`) to skip to the
 * full text immediately. Calling code can also pass `instant` to bypass the
 * animation entirely (used for the replay path).
 */

import { useEffect, useMemo, useRef, useState } from "react";

interface TypewriterTextProps {
  text: string;
  /** Milliseconds per character. Default 22ms. */
  speed?: number;
  /** Render whitespace at full speed instead of pausing on it. Default true. */
  fastWhitespace?: boolean;
  /** Skip the animation; render the full text immediately. */
  instant?: boolean;
  /** Optional audio tick every N characters (0 = no ticks). */
  tickEvery?: number;
  onTick?: () => void;
  onComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function TypewriterText({
  text,
  speed = 22,
  fastWhitespace = true,
  instant = false,
  tickEvery = 0,
  onTick,
  onComplete,
  className,
  style,
}: TypewriterTextProps) {
  const [chars, setChars] = useState(instant ? text.length : 0);
  const completeFiredRef = useRef(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  // Reset when text changes.
  useEffect(() => {
    completeFiredRef.current = false;
    setChars(instant ? text.length : 0);
  }, [text, instant]);

  useEffect(() => {
    if (instant || chars >= text.length) {
      if (chars >= text.length && !completeFiredRef.current) {
        completeFiredRef.current = true;
        onComplete?.();
      }
      return;
    }
    const ch = text[chars];
    const delay = fastWhitespace && /\s/.test(ch) ? Math.max(2, speed / 4) : speed;
    const timer = window.setTimeout(() => {
      setChars((prev) => {
        const next = prev + 1;
        if (tickEvery > 0 && next % tickEvery === 0 && !/\s/.test(ch)) {
          onTick?.();
        }
        return next;
      });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [chars, text, speed, fastWhitespace, instant, tickEvery, onTick, onComplete]);

  const visible = useMemo(() => text.slice(0, chars), [text, chars]);
  const isComplete = chars >= text.length;

  function skip() {
    if (!isComplete) setChars(text.length);
  }

  return (
    <span
      ref={containerRef}
      className={className}
      style={style}
      onClick={skip}
      role="region"
      aria-label="narrator monologue"
    >
      {visible}
      {!isComplete && (
        <span
          aria-hidden="true"
          className="inline-block w-[0.5ch] -mb-[2px] ml-[1px] animate-pulse"
          style={{ background: "currentColor", height: "1em" }}
        />
      )}
    </span>
  );
}
