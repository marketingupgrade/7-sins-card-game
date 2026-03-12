/**
 * VictoryConfetti — tsParticles confetti burst on game victory
 *
 * Fires a sin-colored confetti cannon from both sides of the screen.
 * Uses @tsparticles/slim for minimal bundle size.
 */

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";
import type { SinType } from "@shared/gameTypes";

interface VictoryConfettiProps {
  show: boolean;
  sin: SinType;
}

const SIN_CONFETTI_COLORS: Record<string, string[]> = {
  wrath: ["#ef4444", "#dc2626", "#f97316", "#fbbf24", "#7f1d1d"],
  sloth: ["#a855f7", "#7c3aed", "#c084fc", "#818cf8", "#312e81"],
  greed: ["#eab308", "#f59e0b", "#fbbf24", "#d97706", "#92400e"],
  envy: ["#10b981", "#059669", "#34d399", "#6ee7b7", "#064e3b"],
  pride: ["#f5f5f5", "#d4d4d8", "#fbbf24", "#e5e7eb", "#a1a1aa"],
  lust: ["#ec4899", "#f472b6", "#db2777", "#f9a8d4", "#831843"],
  gluttony: ["#b45309", "#d97706", "#92400e", "#f59e0b", "#78350f"],
};

export default function VictoryConfetti({ show, sin }: VictoryConfettiProps) {
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setEngineReady(true));
  }, []);

  const colors = SIN_CONFETTI_COLORS[sin] || SIN_CONFETTI_COLORS.wrath;

  const options: ISourceOptions = useMemo(() => ({
    fullScreen: { enable: true, zIndex: 100 },
    particles: {
      number: { value: 0 },
      color: { value: colors },
      shape: {
        type: ["circle", "square"],
      },
      opacity: {
        value: { min: 0.5, max: 1 },
        animation: {
          enable: true,
          speed: 0.5,
          startValue: "max",
          destroy: "min",
        },
      },
      size: {
        value: { min: 3, max: 8 },
      },
      move: {
        enable: true,
        speed: { min: 10, max: 30 },
        direction: "none",
        outModes: { default: "destroy" },
        gravity: {
          enable: true,
          acceleration: 15,
        },
      },
      rotate: {
        value: { min: 0, max: 360 },
        animation: {
          enable: true,
          speed: 60,
        },
      },
      tilt: {
        enable: true,
        value: { min: 0, max: 360 },
        animation: {
          enable: true,
          speed: 60,
        },
      },
      roll: {
        enable: true,
        darken: { enable: true, value: 25 },
        enlighten: { enable: true, value: 25 },
        speed: { min: 15, max: 25 },
      },
      wobble: {
        enable: true,
        distance: 30,
        speed: { min: -15, max: 15 },
      },
      life: {
        duration: { value: 3 },
        count: 1,
      },
    },
    emitters: [
      {
        position: { x: 0, y: 30 },
        rate: { quantity: 15, delay: 0.1 },
        life: { duration: 0.5, count: 1 },
        particles: {
          move: {
            direction: "top-right" as const,
            speed: { min: 20, max: 40 },
          },
        },
      },
      {
        position: { x: 100, y: 30 },
        rate: { quantity: 15, delay: 0.1 },
        life: { duration: 0.5, count: 1 },
        particles: {
          move: {
            direction: "top-left" as const,
            speed: { min: 20, max: 40 },
          },
        },
      },
    ],
    detectRetina: true,
  }), [colors]);

  if (!show || !engineReady) return null;

  return (
    <Particles
      id="victory-confetti"
      options={options}
    />
  );
}
