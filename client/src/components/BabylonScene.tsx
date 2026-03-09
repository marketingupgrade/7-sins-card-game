/**
 * BabylonScene - 3D visual layer for the game board
 *
 * Renders a dark cyberpunk arena with particle effects, card play animations,
 * and damage visualizations using Babylon.js.
 *
 * This component is a visual overlay - game logic stays in React/tRPC.
 */

import { useEffect, useRef, useCallback } from "react";
import * as BABYLON from "@babylonjs/core";

interface BabylonSceneProps {
  /** Trigger a damage flash effect */
  onDamageFlash?: { targetSeat: number; amount: number } | null;
  /** Trigger a heal effect */
  onHealFlash?: { targetSeat: number; amount: number } | null;
  /** Trigger a card play animation */
  onCardPlayed?: { fromSeat: number; toSeat: number; sin: "wrath" | "sloth" } | null;
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
    const gridLines = createGridLines(scene);

    // Ambient particles - floating embers
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

// ─── Helper: Ambient Particles ───────────────────────────────
function createAmbientParticles(scene: BABYLON.Scene) {
  const particleSystem = new BABYLON.ParticleSystem("ambient", 100, scene);

  // Create a simple texture
  particleSystem.createPointEmitter(
    new BABYLON.Vector3(-5, 0, -5),
    new BABYLON.Vector3(5, 5, 5)
  );

  particleSystem.color1 = new BABYLON.Color4(0.5, 0.1, 0.1, 0.3);
  particleSystem.color2 = new BABYLON.Color4(0.3, 0.1, 0.5, 0.2);
  particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);

  particleSystem.minSize = 0.02;
  particleSystem.maxSize = 0.06;
  particleSystem.minLifeTime = 3;
  particleSystem.maxLifeTime = 6;
  particleSystem.emitRate = 15;

  particleSystem.gravity = new BABYLON.Vector3(0, 0.1, 0);
  particleSystem.minEmitPower = 0.1;
  particleSystem.maxEmitPower = 0.3;

  particleSystem.start();
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

// ─── Helper: Damage Effect ───────────────────────────────────
function triggerDamageEffect(scene: BABYLON.Scene, seatIndex: number, amount: number, round: number) {
  const pos = getSeatPosition(seatIndex);

  // Red flash sphere
  const sphere = BABYLON.MeshBuilder.CreateSphere("dmgFlash", { diameter: 1 + amount * 0.1 }, scene);
  sphere.position = pos;
  const mat = new BABYLON.StandardMaterial("dmgMat", scene);
  mat.emissiveColor = new BABYLON.Color3(1, 0.1, 0.1);
  mat.alpha = 0.6;
  sphere.material = mat;

  // Animate and dispose
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
  });
}

// ─── Helper: Heal Effect ─────────────────────────────────────
function triggerHealEffect(scene: BABYLON.Scene, seatIndex: number) {
  const pos = getSeatPosition(seatIndex);

  const sphere = BABYLON.MeshBuilder.CreateSphere("healFlash", { diameter: 0.8 }, scene);
  sphere.position = pos;
  const mat = new BABYLON.StandardMaterial("healMat", scene);
  mat.emissiveColor = new BABYLON.Color3(0.1, 0.8, 0.3);
  mat.alpha = 0.5;
  sphere.material = mat;

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
  });
}

// ─── Helper: Card Play Effect ────────────────────────────────
function triggerCardPlayEffect(
  scene: BABYLON.Scene,
  fromSeat: number,
  toSeat: number,
  sin: "wrath" | "sloth"
) {
  const from = getSeatPosition(fromSeat);
  const to = getSeatPosition(toSeat);

  const projectile = BABYLON.MeshBuilder.CreateSphere("projectile", { diameter: 0.3 }, scene);
  projectile.position = from.clone();
  const mat = new BABYLON.StandardMaterial("projMat", scene);
  mat.emissiveColor = sin === "wrath"
    ? new BABYLON.Color3(1, 0.2, 0.1)
    : new BABYLON.Color3(0.5, 0.2, 0.8);
  mat.alpha = 0.8;
  projectile.material = mat;

  let progress = 0;
  const observer = scene.onBeforeRenderObservable.add(() => {
    progress += 0.04;
    projectile.position = BABYLON.Vector3.Lerp(from, to, Math.min(progress, 1));
    projectile.position.y += Math.sin(progress * Math.PI) * 2;

    if (progress >= 1) {
      projectile.dispose();
      mat.dispose();
      scene.onBeforeRenderObservable.remove(observer);
    }
  });
}
