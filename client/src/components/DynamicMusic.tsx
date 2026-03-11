/**
 * DynamicMusic - Procedural music intensity system
 * 
 * Cross-fades from calm → tense → climactic as rounds progress.
 * Uses Web Audio API oscillators and filters — no audio files needed.
 */

import { useEffect, useRef } from "react";

interface DynamicMusicProps {
  /** Current round (1-10) */
  round: number;
  /** Whether music is enabled */
  enabled: boolean;
  /** Volume (0-1) */
  volume?: number;
}

export default function DynamicMusic({ round, enabled, volume = 0.15 }: DynamicMusicProps) {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const oscsRef = useRef<OscillatorNode[]>([]);

  useEffect(() => {
    if (!enabled) {
      // Stop everything
      oscsRef.current.forEach(o => { try { o.stop(); } catch {} });
      oscsRef.current = [];
      ctxRef.current?.close();
      ctxRef.current = null;
      return;
    }

    // Create audio context on first enable
    if (!ctxRef.current) {
      try {
        const ctx = new AudioContext();
        ctxRef.current = ctx;
        const gain = ctx.createGain();
        gain.gain.value = volume;
        gain.connect(ctx.destination);
        gainRef.current = gain;
      } catch {
        return;
      }
    }

    const ctx = ctxRef.current;
    const gain = gainRef.current;
    if (!ctx || !gain) return;

    // Stop previous oscillators
    oscsRef.current.forEach(o => { try { o.stop(); } catch {} });
    oscsRef.current = [];

    // Intensity based on round (0 = calm, 1 = climactic)
    const intensity = Math.min((round - 1) / 9, 1);

    // Base drone frequency shifts lower and more dissonant as intensity increases
    const baseFreq = 55 - intensity * 15; // A1 → lower
    const detuneAmount = intensity * 30;

    // Create layered drones
    const createOsc = (freq: number, type: OscillatorType, detune: number, vol: number) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      oscGain.gain.value = vol * volume;
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start();
      oscsRef.current.push(osc);
    };

    // Layer 1: Deep bass drone (always)
    createOsc(baseFreq, "sine", 0, 0.3);

    // Layer 2: Harmonic fifth (builds tension)
    if (intensity > 0.2) {
      createOsc(baseFreq * 1.5, "triangle", detuneAmount, 0.15 * intensity);
    }

    // Layer 3: Dissonant tritone (mid-game tension)
    if (intensity > 0.4) {
      createOsc(baseFreq * Math.sqrt(2), "sawtooth", -detuneAmount, 0.08 * intensity);
    }

    // Layer 4: High harmonic (late game urgency)
    if (intensity > 0.6) {
      createOsc(baseFreq * 4, "sine", detuneAmount * 2, 0.05 * intensity);
    }

    // Layer 5: Climactic pulse (final rounds)
    if (intensity > 0.8) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = "sine";
      lfo.frequency.value = 2 + intensity * 4; // Pulse speed increases
      lfoGain.gain.value = 0.1 * intensity;
      lfo.connect(lfoGain);
      lfoGain.connect(gain);
      lfo.start();
      oscsRef.current.push(lfo);
    }

    // Update master volume
    gain.gain.setTargetAtTime(volume, ctx.currentTime, 0.5);

    return () => {
      oscsRef.current.forEach(o => { try { o.stop(); } catch {} });
      oscsRef.current = [];
    };
  }, [round, enabled, volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      oscsRef.current.forEach(o => { try { o.stop(); } catch {} });
      ctxRef.current?.close();
    };
  }, []);

  return null; // No visual output
}
