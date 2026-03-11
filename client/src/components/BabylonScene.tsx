/**
 * BabylonScene - 3D visual layer for the game board
 *
 * Renders a dark cyberpunk arena with particle effects, card play animations,
 * and damage visualizations using Babylon.js.
 *
 * Post-processing: DefaultRenderingPipeline (bloom + FXAA) + GlowLayer
 * Particles: 400-particle ambient system with 3 sin-colored streams
 * Effects: Particle bursts on damage/heal, all 4 sins supported
 */

import { useEffect, useRef } from "react";
import * as BABYLON from "@babylonjs/core";

interface BabylonSceneProps {
  /** Trigger a damage flash effect */
  onDamageFlash?: { targetSeat: number; amount: number } | null;
  /** Trigger a heal effect */
  onHealFlash?: { targetSeat: number; amount: number } | null;
  /** Trigger a card play animation */
  onCardPlayed?: { fromSeat: number; toSeat: number; sin: "wrath" | "sloth" | "greed" | "envy" } | null;
  /** Current round for intensity scaling */
  currentRound: number;
}

export default function BabylonScene({
  onDamageFlash,
  onHealFlash,
  onCardPlayed,
  currentRound,
}: BabylonSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);

  // Initialize Babylon.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      alpha: true,
    });
    engineRef.current = engine;

    const scene = new BABYLON.Scene(engine);
    sceneRef.current = scene;

    // Transparent background - overlays the React UI
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

    // Camera - fixed overhead view
    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 3,
      15,
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.attachControl(canvasRef.current, false);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 20;
    camera.lowerBetaLimit = 0.5;
    camera.upperBetaLimit = Math.PI / 2.5;

    // ── Post-Processing Pipeline (Bloom + FXAA) ──────────────
    const pipeline = new BABYLON.DefaultRenderingPipeline(
      "postprocess",
      true,
      scene,
      [camera]
    );
    pipeline.bloomEnabled = true;
    pipeline.bloomWeight = 0.8;
    pipeline.bloomThreshold = 0.1;
    pipeline.bloomKernel = 64;
    pipeline.fxaaEnabled = true;

    // ── Glow Layer ────────────────────────────────────────────
    const glowLayer = new BABYLON.GlowLayer("glow", scene);
    glowLayer.intensity = 0.6;

    // Ambient light
    const ambientLight = new BABYLON.HemisphericLight(
      "ambient",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    ambientLight.intensity = 0.3;
    ambientLight.diffuse = new BABYLON.Color3(0.2, 0.1, 0.3);

    // Point lights for neon glow
    const wrathLight = new BABYLON.PointLight(
      "wrathLight",
      new BABYLON.Vector3(-3, 3, -3),
      scene
    );
    wrathLight.diffuse = new BABYLON.Color3(0.8, 0.1, 0.1);
    wrathLight.intensity = 0.5;

    const slothLight = new BABYLON.PointLight(
      "slothLight",
      new BABYLON.Vector3(3, 3, 3),
      scene
    );
    slothLight.diffuse = new BABYLON.Color3(0.4, 0.2, 0.6);
    slothLight.intensity = 0.5;

    // Arena floor - dark reflective surface
    const floor = BABYLON.MeshBuilder.CreateGround(
      "floor",
      { width: 12, height: 12, subdivisions: 32 },
      scene
    );
    const floorMat = new BABYLON.StandardMaterial("floorMat", scene);
    floorMat.diffuseColor = new BABYLON.Color3(0.02, 0.02, 0.04);
    floorMat.specularColor = new BABYLON.Color3(0.1, 0.05, 0.15);
    floorMat.emissiveColor = new BABYLON.Color3(0.01, 0.005, 0.02);
    floor.material = floorMat;

    // Grid lines on floor
    createGridLines(scene);

    // Enhanced ambient particle system
    createAmbientParticles(scene);

    // Render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Resize handler
    const handleResize = () => engine.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      scene.dispose();
      engine.dispose();
    };
  }, []);

  // Damage flash effect
  useEffect(() => {
    if (!onDamageFlash || !sceneRef.current) return;
    triggerDamageEffect(sceneRef.current, onDamageFlash.targetSeat, onDamageFlash.amount, currentRound);
  }, [onDamageFlash]);

  // Heal flash effect
  useEffect(() => {
    if (!onHealFlash || !sceneRef.current) return;
    triggerHealEffect(sceneRef.current, onHealFlash.targetSeat);
  }, [onHealFlash]);

  // Card play animation
  useEffect(() => {
    if (!onCardPlayed || !sceneRef.current) return;
    triggerCardPlayEffect(sceneRef.current, onCardPlayed.fromSeat, onCardPlayed.toSeat, onCardPlayed.sin);
  }, [onCardPlayed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    />
  );
}

// ─── Helper: Create Grid Lines ───────────────────────────────
function createGridLines(scene: BABYLON.Scene) {
  const lines: BABYLON.Vector3[][] = [];
  const gridSize = 6;
  const step = 1;

  for (let i = -gridSize; i <= gridSize; i += step) {
    lines.push([
      new BABYLON.Vector3(i, 0.01, -gridSize),
      new BABYLON.Vector3(i, 0.01, gridSize),
    ]);
    lines.push([
      new BABYLON.Vector3(-gridSize, 0.01, i),
      new BABYLON.Vector3(gridSize, 0.01, i),
    ]);
  }

  const gridMesh = BABYLON.MeshBuilder.CreateLineSystem(
    "grid",
    { lines },
    scene
  );
  gridMesh.color = new BABYLON.Color3(0.08, 0.04, 0.12);
  gridMesh.alpha = 0.3;

  return gridMesh;
}

// ─── Helper: Enhanced Ambient Particles (3 sin-colored streams) ──
function createAmbientParticles(scene: BABYLON.Scene) {
  // Wrath stream — red/crimson embers
  const wrathParticles = new BABYLON.ParticleSystem("ambient-wrath", 150, scene);
  const wrathEmitter = new BABYLON.SphereParticleEmitter(6, 0.5);
  wrathParticles.particleEmitterType = wrathEmitter;
  wrathParticles.emitter = BABYLON.Vector3.Zero();
  wrathParticles.color1 = new BABYLON.Color4(0.9, 0.15, 0.1, 0.4);
  wrathParticles.color2 = new BABYLON.Color4(1.0, 0.3, 0.05, 0.25);
  wrathParticles.colorDead = new BABYLON.Color4(0, 0, 0, 0);
  wrathParticles.minSize = 0.05;
  wrathParticles.maxSize = 0.14;
  wrathParticles.minLifeTime = 4;
  wrathParticles.maxLifeTime = 8;
  wrathParticles.emitRate = 20;
  wrathParticles.gravity = new BABYLON.Vector3(0, 0.08, 0);
  wrathParticles.minEmitPower = 0.05;
  wrathParticles.maxEmitPower = 0.2;
  wrathParticles.start();

  // Sloth stream — purple/violet wisps
  const slothParticles = new BABYLON.ParticleSystem("ambient-sloth", 150, scene);
  const slothEmitter = new BABYLON.SphereParticleEmitter(5, 0.5);
  slothParticles.particleEmitterType = slothEmitter;
  slothParticles.emitter = BABYLON.Vector3.Zero();
  slothParticles.color1 = new BABYLON.Color4(0.4, 0.15, 0.75, 0.35);
  slothParticles.color2 = new BABYLON.Color4(0.55, 0.1, 0.85, 0.2);
  slothParticles.colorDead = new BABYLON.Color4(0, 0, 0, 0);
  slothParticles.minSize = 0.05;
  slothParticles.maxSize = 0.12;
  slothParticles.minLifeTime = 5;
  slothParticles.maxLifeTime = 9;
  slothParticles.emitRate = 18;
  slothParticles.gravity = new BABYLON.Vector3(0, 0.06, 0);
  slothParticles.minEmitPower = 0.04;
  slothParticles.maxEmitPower = 0.15;
  slothParticles.start();

  // Greed stream — gold/amber sparks
  const greedParticles = new BABYLON.ParticleSystem("ambient-greed", 100, scene);
  const greedEmitter = new BABYLON.SphereParticleEmitter(4, 0.5);
  greedParticles.particleEmitterType = greedEmitter;
  greedParticles.emitter = BABYLON.Vector3.Zero();
  greedParticles.color1 = new BABYLON.Color4(0.9, 0.72, 0.1, 0.3);
  greedParticles.color2 = new BABYLON.Color4(1.0, 0.85, 0.2, 0.18);
  greedParticles.colorDead = new BABYLON.Color4(0, 0, 0, 0);
  greedParticles.minSize = 0.04;
  greedParticles.maxSize = 0.1;
  greedParticles.minLifeTime = 3;
  greedParticles.maxLifeTime = 7;
  greedParticles.emitRate = 14;
  greedParticles.gravity = new BABYLON.Vector3(0, 0.12, 0);
  greedParticles.minEmitPower = 0.06;
  greedParticles.maxEmitPower = 0.25;
  greedParticles.start();

  // Envy stream — emerald/poison wisps
  const envyParticles = new BABYLON.ParticleSystem("ambient-envy", 80, scene);
  const envyEmitter = new BABYLON.SphereParticleEmitter(4, 0.5);
  envyParticles.particleEmitterType = envyEmitter;
  envyParticles.emitter = BABYLON.Vector3.Zero();
  envyParticles.color1 = new BABYLON.Color4(0.1, 0.85, 0.3, 0.4);
  envyParticles.color2 = new BABYLON.Color4(0.05, 0.55, 0.2, 0.22);
  envyParticles.colorDead = new BABYLON.Color4(0, 0, 0, 0);
  envyParticles.minSize = 0.04;
  envyParticles.maxSize = 0.12;
  envyParticles.minLifeTime = 3;
  envyParticles.maxLifeTime = 7;
  envyParticles.emitRate = 15;
  envyParticles.gravity = new BABYLON.Vector3(0, 0.07, 0);
  envyParticles.minEmitPower = 0.05;
  envyParticles.maxEmitPower = 0.18;
  envyParticles.start();
}

// ─── Helper: Seat Positions ──────────────────────────────────
function getSeatPosition(seatIndex: number): BABYLON.Vector3 {
  const positions = [
    new BABYLON.Vector3(0, 0.5, -4),  // seat 0 - bottom
    new BABYLON.Vector3(-4, 0.5, 0),  // seat 1 - left
    new BABYLON.Vector3(0, 0.5, 4),   // seat 2 - top
    new BABYLON.Vector3(4, 0.5, 0),   // seat 3 - right
  ];
  return positions[seatIndex] || positions[0];
}

// ─── Helper: Damage Effect (sphere + particle burst) ─────────
function triggerDamageEffect(scene: BABYLON.Scene, seatIndex: number, amount: number, round: number) {
  const pos = getSeatPosition(seatIndex);

  // Glowing impact sphere — GlowLayer picks this up automatically
  const sphere = BABYLON.MeshBuilder.CreateSphere("dmgFlash", { diameter: 1 + amount * 0.1 }, scene);
  sphere.position = pos;
  const mat = new BABYLON.StandardMaterial("dmgMat", scene);
  mat.emissiveColor = new BABYLON.Color3(1, 0.1, 0.1);
  mat.alpha = 0.6;
  sphere.material = mat;

  // Particle burst — 40 red/orange particles exploding outward
  const burst = new BABYLON.ParticleSystem("dmgBurst", 40, scene);
  burst.emitter = pos.clone();
  burst.createSphereEmitter(0.2);
  burst.color1 = new BABYLON.Color4(1, 0.2, 0.05, 0.9);
  burst.color2 = new BABYLON.Color4(0.9, 0.5, 0.1, 0.7);
  burst.colorDead = new BABYLON.Color4(0.5, 0.1, 0, 0);
  burst.minSize = 0.06;
  burst.maxSize = 0.18;
  burst.minLifeTime = 0.4;
  burst.maxLifeTime = 1.0;
  burst.emitRate = 200;
  burst.manualEmitCount = 40;
  burst.gravity = new BABYLON.Vector3(0, -0.5, 0);
  burst.minEmitPower = 1.5;
  burst.maxEmitPower = 3.5;
  burst.start();

  // Animate sphere and clean up
  let frame = 0;
  const observer = scene.onBeforeRenderObservable.add(() => {
    frame++;
    mat.alpha = Math.max(0, 0.6 - frame * 0.02);
    sphere.scaling = BABYLON.Vector3.One().scale(1 + frame * 0.05);
    if (frame > 30) {
      sphere.dispose();
      mat.dispose();
      scene.onBeforeRenderObservable.remove(observer);
    }
    if (frame > 60) {
      burst.dispose();
    }
  });
}

// ─── Helper: Heal Effect (sphere + rising particle trail) ────
function triggerHealEffect(scene: BABYLON.Scene, seatIndex: number) {
  const pos = getSeatPosition(seatIndex);

  // Glowing heal sphere
  const sphere = BABYLON.MeshBuilder.CreateSphere("healFlash", { diameter: 0.8 }, scene);
  sphere.position = pos;
  const mat = new BABYLON.StandardMaterial("healMat", scene);
  mat.emissiveColor = new BABYLON.Color3(0.1, 0.8, 0.3);
  mat.alpha = 0.5;
  sphere.material = mat;

  // Rising particle trail — green/teal spiraling upward
  const trail = new BABYLON.ParticleSystem("healTrail", 20, scene);
  trail.emitter = pos.clone();
  trail.createSphereEmitter(0.15);
  trail.color1 = new BABYLON.Color4(0.1, 0.9, 0.4, 0.8);
  trail.color2 = new BABYLON.Color4(0.3, 1.0, 0.6, 0.5);
  trail.colorDead = new BABYLON.Color4(0.1, 0.5, 0.3, 0);
  trail.minSize = 0.04;
  trail.maxSize = 0.12;
  trail.minLifeTime = 0.6;
  trail.maxLifeTime = 1.5;
  trail.emitRate = 25;
  trail.gravity = new BABYLON.Vector3(0, 0.8, 0);
  trail.minEmitPower = 0.3;
  trail.maxEmitPower = 1.0;
  trail.start();

  let frame = 0;
  const observer = scene.onBeforeRenderObservable.add(() => {
    frame++;
    mat.alpha = Math.max(0, 0.5 - frame * 0.015);
    sphere.position.y += 0.02;
    if (frame > 35) {
      sphere.dispose();
      mat.dispose();
      scene.onBeforeRenderObservable.remove(observer);
    }
    if (frame > 70) {
      trail.dispose();
    }
  });
}

// ─── Helper: Card Play Effect (all 4 sins) ───────────────────
function triggerCardPlayEffect(
  scene: BABYLON.Scene,
  fromSeat: number,
  toSeat: number,
  sin: "wrath" | "sloth" | "greed" | "envy"
) {
  const from = getSeatPosition(fromSeat);
  const to = getSeatPosition(toSeat);

  const sinColors: Record<string, BABYLON.Color3> = {
    wrath: new BABYLON.Color3(1, 0.2, 0.1),
    sloth: new BABYLON.Color3(0.5, 0.2, 0.8),
    greed: new BABYLON.Color3(0.9, 0.75, 0.1),
    envy:  new BABYLON.Color3(0.1, 0.8, 0.3),
  };

  const projectile = BABYLON.MeshBuilder.CreateSphere("projectile", { diameter: 0.3 }, scene);
  projectile.position = from.clone();
  const mat = new BABYLON.StandardMaterial("projMat", scene);
  mat.emissiveColor = sinColors[sin] || sinColors.wrath;
  mat.alpha = 0.8;
  projectile.material = mat;

  // Trailing particles following the projectile
  const trailColor = mat.emissiveColor;
  const trail = new BABYLON.ParticleSystem("projTrail", 30, scene);
  trail.emitter = projectile;
  trail.createSphereEmitter(0.05);
  trail.color1 = new BABYLON.Color4(trailColor.r, trailColor.g, trailColor.b, 0.6);
  trail.color2 = new BABYLON.Color4(trailColor.r * 0.6, trailColor.g * 0.6, trailColor.b * 0.6, 0.3);
  trail.colorDead = new BABYLON.Color4(0, 0, 0, 0);
  trail.minSize = 0.03;
  trail.maxSize = 0.1;
  trail.minLifeTime = 0.15;
  trail.maxLifeTime = 0.4;
  trail.emitRate = 40;
  trail.gravity = new BABYLON.Vector3(0, -0.1, 0);
  trail.minEmitPower = 0.1;
  trail.maxEmitPower = 0.3;
  trail.start();

  let progress = 0;
  const observer = scene.onBeforeRenderObservable.add(() => {
    progress += 0.04;
    projectile.position = BABYLON.Vector3.Lerp(from, to, Math.min(progress, 1));
    projectile.position.y += Math.sin(progress * Math.PI) * 2;

    if (progress >= 1) {
      projectile.dispose();
      mat.dispose();
      trail.dispose();
      scene.onBeforeRenderObservable.remove(observer);
    }
  });
}
