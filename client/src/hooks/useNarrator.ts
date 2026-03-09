/**
 * useNarrator - Sassy narrator text system
 *
 * Manages the queue of narrator messages with typewriter-style display.
 * Messages auto-dismiss after a configurable duration.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { NARRATOR_LINES } from "../../../shared/cardData";

interface NarratorMessage {
  id: string;
  text: string;
  type: "info" | "action" | "dramatic";
}

export function useNarrator() {
  const [currentMessage, setCurrentMessage] = useState<NarratorMessage | null>(null);
  const [displayedText, setDisplayedText] = useState("");
  const queueRef = useRef<NarratorMessage[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const typewriterRef = useRef<NodeJS.Timeout | null>(null);

  const processQueue = useCallback(() => {
    if (queueRef.current.length === 0) {
      setCurrentMessage(null);
      setDisplayedText("");
      return;
    }

    const next = queueRef.current.shift()!;
    setCurrentMessage(next);
    setDisplayedText("");

    // Typewriter effect
    let charIndex = 0;
    if (typewriterRef.current) clearInterval(typewriterRef.current);

    typewriterRef.current = setInterval(() => {
      charIndex++;
      setDisplayedText(next.text.slice(0, charIndex));

      if (charIndex >= next.text.length) {
        if (typewriterRef.current) clearInterval(typewriterRef.current);

        // Auto-dismiss after delay
        timerRef.current = setTimeout(() => {
          processQueue();
        }, 3000);
      }
    }, 30);
  }, []);

  const addMessage = useCallback(
    (text: string, type: NarratorMessage["type"] = "info") => {
      const msg: NarratorMessage = {
        id: `${Date.now()}-${Math.random()}`,
        text,
        type,
      };

      queueRef.current.push(msg);

      // If nothing is currently showing, start processing
      if (!currentMessage) {
        processQueue();
      }
    },
    [currentMessage, processQueue]
  );

  const addRandomLine = useCallback(
    (
      category: keyof typeof NARRATOR_LINES,
      replacements?: Record<string, string>
    ) => {
      const lines = NARRATOR_LINES[category];
      let line = lines[Math.floor(Math.random() * lines.length)];

      if (replacements) {
        Object.entries(replacements).forEach(([key, value]) => {
          line = line.replace(`{${key}}`, value);
        });
      }

      addMessage(line, "dramatic");
    },
    [addMessage]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (typewriterRef.current) clearInterval(typewriterRef.current);
    };
  }, []);

  return {
    currentMessage,
    displayedText,
    addMessage,
    addRandomLine,
  };
}
