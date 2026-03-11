/**
 * WebSpeechNarrator - Ominous TTS narrator using Web Speech API
 * 
 * Announces card plays, round transitions, deaths, and victories
 * with a deep, slow voice. No audio files needed.
 */

import { useEffect, useRef, useCallback } from "react";

interface WebSpeechNarratorProps {
  /** Text to speak */
  text: string | null;
  /** Whether narration is enabled */
  enabled: boolean;
  /** Speech rate (0.1 - 2.0, default 0.7 for ominous feel) */
  rate?: number;
  /** Pitch (0 - 2, default 0.6 for deep voice) */
  pitch?: number;
}

export default function WebSpeechNarrator({ text, enabled, rate = 0.7, pitch = 0.6 }: WebSpeechNarratorProps) {
  const lastSpoken = useRef<string | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = useCallback((message: string) => {
    const synth = synthRef.current;
    if (!synth || !enabled) return;

    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 0.8;

    // Try to find a deep English voice
    const voices = synth.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith("en") && (v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("daniel"))
    ) || voices.find(v => v.lang.startsWith("en")) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    synth.speak(utterance);
  }, [enabled, rate, pitch]);

  useEffect(() => {
    if (text && text !== lastSpoken.current && enabled) {
      speak(text);
      lastSpoken.current = text;
    }
  }, [text, enabled, speak]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      synthRef.current?.cancel();
    };
  }, []);

  return null; // No visual output
}
