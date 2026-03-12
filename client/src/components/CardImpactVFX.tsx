/**
 * CardImpactVFX — Babylon.js GPU particle burst on card resolution
 *
 * When a card resolves, a sin-colored particle explosion fires from center screen.
 * Each sin has a unique particle behavior:
 * - Wrath: aggressive upward burst, fire sparks
 * - Sloth: slow drifting motes, purple haze
 * - Greed: gold coin-like sparkles, radial spread
 * - Envy: poison green tendrils, spiraling
 * - Pride: white/silver starburst, symmetrical
 * - Lust: pink petal scatter, floating
 * - Gluttony: amber/brown chunks, heavy gravity
 *
 * Uses a persistent Babylon engine with transparent background.
 * Particle bursts are triggered by incrementing the `trigger` prop.
 */

import { useEffect, useRef } from "react";
import type { SinType } from "@shared/gameTypes";

interface CardImpactVFXProps {
  trigger: number;
  sin: SinType;
  intensity?: "light" | "medium" | "heavy";
}

const SIN_COLORS: Record<string, { c1: [number, number, number, number]; c2: [number, number, number, number]; dead: [number, number, number, number] }> = {
  wrath: {
    c1: [1, 0.3, 0.1, 1],
    c2: [0.9, 0.1, 0.05, 0.8],
    dead: [0.4, 0.05, 0, 0],
  },
  sloth: {
    c1: [0.6, 0.3, 0.9, 0.8],
    c2: [0.3, 0.15, 0.6, 0.6],
    dead: [0.15, 0.05, 0.3, 0],
  },
  greed: {
    c1: [1, 0.85, 0.2, 1],
    c2: [0.9, 0.7, 0.1, 0.8],
    dead: [0.4, 0.3, 0, 0],
  },
  envy: {
    c1: [0.2, 0.9, 0.5, 0.9],
    c2: [0.1, 0.7, 0.3, 0.7],
    dead: [0, 0.3, 0.1, 0],
  },
  pride: {
    c1: [1, 1, 1, 1],
    c2: [0.85, 0.85, 0.95, 0.8],
    dead: [0.4, 0.4, 0.5, 0],
  },
  lust: {
    c1: [1, 0.35, 0.65, 0.9],
    c2: [0.9, 0.2, 0.5, 0.7],
    dead: [0.4, 0.1, 0.25, 0],
  },
  gluttony: {
    c1: [0.8, 0.45, 0.1, 1],
    c2: [0.6, 0.3, 0.05, 0.8],
    dead: [0.3, 0.15, 0, 0],
  },
};

const SIN_BEHAVIOR: Record<string, {
  emitRate: number;
  minSpeed: number;
  maxSpeed: number;
  minSize: number;
  maxSize: number;
  minLife: number;
  maxLife: number;
  gravity: [number, number, number];
}> = {
  wrath: { emitRate: 300, minSpeed: 3, maxSpeed: 8, minSize: 0.02, maxSize: 0.06, minLife: 0.3, maxLife: 0.8, gravity: [0, 2, 0] },
  sloth: { emitRate: 150, minSpeed: 0.5, maxSpeed: 2, minSize: 0.03, maxSize: 0.08, minLife: 1, maxLife: 2.5, gravity: [0, 0.3, 0] },
  greed: { emitRate: 250, minSpeed: 2, maxSpeed: 5, minSize: 0.02, maxSize: 0.05, minLife: 0.5, maxLife: 1.2, gravity: [0, -1, 0] },
  envy: { emitRate: 200, minSpeed: 1.5, maxSpeed: 4, minSize: 0.02, maxSize: 0.06, minLife: 0.6, maxLife: 1.5, gravity: [0, 0.8, 0] },
  pride: { emitRate: 350, minSpeed: 4, maxSpeed: 10, minSize: 0.01, maxSize: 0.04, minLife: 0.2, maxLife: 0.6, gravity: [0, 0, 0] },
  lust: { emitRate: 180, minSpeed: 1, maxSpeed: 3, minSize: 0.03, maxSize: 0.07, minLife: 0.8, maxLife: 2, gravity: [0, -0.5, 0] },
  gluttony: { emitRate: 200, minSpeed: 2, maxSpeed: 5, minSize: 0.03, maxSize: 0.08, minLife: 0.4, maxLife: 1, gravity: [0, -3, 0] },
};

export default function CardImpactVFX({ trigger, sin, intensity = "medium" }: CardImpactVFXProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const disposed = useRef(false);
  const triggerRef = useRef(trigger);

  // Initialize Babylon engine once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    disposed.current = false;

    let engine: any;
    let scene: any;

    (async () => {
      const BABYLON = await import("@babylonjs/core");
      if (disposed.current) return;

      engine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: false,
        stencil: false,
        antialias: false,
        adaptToDeviceRatio: true,
        alpha: true,
      });
      engineRef.current = engine;

      const isMobile = window.innerWidth < 768;
      if (isMobile) engine.setHardwareScalingLevel(3);

      scene = new BABYLON.Scene(engine);
      sceneRef.current = scene;
      scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

      // Orthographic camera looking down
      const camera = new BABYLON.FreeCamera("cam", new BABYLON.Vector3(0, 5, 0), scene);
      camera.setTarget(new BABYLON.Vector3(0, 0, 0));
      camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
      const aspect = canvas.width / canvas.height;
      camera.orthoLeft = -5 * aspect;
      camera.orthoRight = 5 * aspect;
      camera.orthoTop = 5;
      camera.orthoBottom = -5;

      engine.runRenderLoop(() => scene.render());
      const onResize = () => {
        engine.resize();
        const a = canvas.width / canvas.height;
        camera.orthoLeft = -5 * a;
        camera.orthoRight = 5 * a;
      };
      window.addEventListener("resize", onResize);
    })();

    return () => {
      disposed.current = true;
      sceneRef.current = null;
      if (engine) {
        engine.stopRenderLoop();
        engine.dispose();
      }
      engineRef.current = null;
    };
  }, []);

  // Fire particle burst on trigger change
  useEffect(() => {
    if (trigger <= 0 || trigger === triggerRef.current) return;
    triggerRef.current = trigger;

    const scene = sceneRef.current;
    if (!scene) return;

    (async () => {
      const BABYLON = await import("@babylonjs/core");
      const colors = SIN_COLORS[sin] || SIN_COLORS.wrath;
      const behavior = SIN_BEHAVIOR[sin] || SIN_BEHAVIOR.wrath;
      const mult = intensity === "heavy" ? 1.5 : intensity === "light" ? 0.6 : 1;

      const ps = new BABYLON.ParticleSystem(`impact_${Date.now()}`, Math.floor(behavior.emitRate * mult), scene);
      ps.createSphereEmitter(0.3);
      ps.emitter = new BABYLON.Vector3(0, 0, 0);

      ps.color1 = new BABYLON.Color4(...colors.c1);
      ps.color2 = new BABYLON.Color4(...colors.c2);
      ps.colorDead = new BABYLON.Color4(...colors.dead);

      ps.minSize = behavior.minSize;
      ps.maxSize = behavior.maxSize * mult;
      ps.minLifeTime = behavior.minLife;
      ps.maxLifeTime = behavior.maxLife;
      ps.emitRate = behavior.emitRate * mult;
      ps.gravity = new BABYLON.Vector3(...behavior.gravity);
      ps.minEmitPower = behavior.minSpeed;
      ps.maxEmitPower = behavior.maxSpeed * mult;
      ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
      ps.updateSpeed = 0.02;

      // Burst then stop
      ps.targetStopDuration = 0.15;
      ps.disposeOnStop = true;
      ps.start();
    })();
  }, [trigger, sin, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 35, mixBlendMode: "screen" }}
    />
  );
}
