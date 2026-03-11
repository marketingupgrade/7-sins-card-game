/**
 * GameBoardBabylonScene - 3D Gothic Arena
 *
 * A darker, more intense version of the cathedral for active gameplay:
 * - Circular arena floor with ritual engravings
 * - Four fire braziers at cardinal points (one per sin color)
 * - Gothic pillars forming the arena boundary
 * - Dynamic lighting that shifts based on the leading player's sin
 * - Ember particles rising from braziers
 * - Fog and volumetric atmosphere
 * - Camera locked (no user interaction) with subtle breathing motion
 *
 * Accepts activeSin prop to shift the dominant light color.
 */

import { useEffect, useRef } from "react";
import type { SinType } from "@shared/gameTypes";

interface GameBoardBabylonSceneProps {
  className?: string;
  activeSin?: SinType | null;
  currentRound?: number;
  cardPlayCount?: number;    // increment to spawn a floor rune
  lastCardSin?: SinType;     // sin of last played card (for rune color)
}

const SIN_RGB: Record<string, [number, number, number]> = {
  wrath: [0.9, 0.15, 0.1],
  sloth: [0.45, 0.2, 0.75],
  greed: [0.85, 0.7, 0.1],
  envy: [0.1, 0.75, 0.4],
};

export default function GameBoardBabylonScene({ className = "", activeSin, currentRound = 1, cardPlayCount = 0, lastCardSin }: GameBoardBabylonSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<any>(null);
  const activeSinRef = useRef(activeSin);
  const currentRoundRef = useRef(currentRound);
  const sceneRef = useRef<any>(null);
  const disposed = useRef(false);

  // Keep refs in sync
  useEffect(() => { activeSinRef.current = activeSin; }, [activeSin]);
  useEffect(() => { currentRoundRef.current = currentRound; }, [currentRound]);

  // Floor rune on card play
  useEffect(() => {
    if (cardPlayCount <= 0 || !sceneRef.current) return;
    const sin = lastCardSin || activeSin || "wrath";
    triggerFloorRune(sceneRef.current, sin as string, cardPlayCount);
  }, [cardPlayCount, lastCardSin, activeSin]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    disposed.current = false;

    let engine: any;
    let scene: any;

    (async () => {
      const BABYLON = await import("@babylonjs/core");
      if (disposed.current) return;

      const isMobile = window.innerWidth < 768;

      engine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: false,
        stencil: false,
        antialias: !isMobile,
        adaptToDeviceRatio: true,
      });
      engineRef.current = engine;
      if (isMobile) engine.setHardwareScalingLevel(2.5);

      scene = new BABYLON.Scene(engine);
      sceneRef.current = scene;
      scene.clearColor = new BABYLON.Color4(0.015, 0.01, 0.025, 1);
      scene.ambientColor = new BABYLON.Color3(0.02, 0.015, 0.03);
      scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
      scene.fogDensity = 0.035;
      scene.fogColor = new BABYLON.Color3(0.015, 0.01, 0.025);

      // Camera — fixed overhead angle, subtle breathing
      const camera = new BABYLON.ArcRotateCamera(
        "cam",
        -Math.PI / 2,
        Math.PI / 3.2,
        isMobile ? 14 : 11,
        new BABYLON.Vector3(0, 0.5, 0),
        scene
      );
      camera.inputs.clear();

      // Very dim ambient
      const hemi = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
      hemi.intensity = 0.04;
      hemi.diffuse = new BABYLON.Color3(0.1, 0.07, 0.15);
      hemi.groundColor = new BABYLON.Color3(0.01, 0.008, 0.02);

      // --- ARENA FLOOR ---
      const floor = BABYLON.MeshBuilder.CreateDisc("floor", { radius: 7, tessellation: 64 }, scene);
      floor.rotation.x = Math.PI / 2;
      floor.position.y = 0;
      const floorMat = new BABYLON.StandardMaterial("floorMat", scene);
      floorMat.diffuseColor = new BABYLON.Color3(0.04, 0.03, 0.045);
      floorMat.specularColor = new BABYLON.Color3(0.03, 0.02, 0.04);
      floorMat.emissiveColor = new BABYLON.Color3(0.008, 0.005, 0.012);
      floor.material = floorMat;

      // Ritual circle on floor
      const ritualRing = BABYLON.MeshBuilder.CreateTorus("ritual", {
        diameter: 8,
        thickness: 0.04,
        tessellation: 64,
      }, scene);
      const ritualMat = new BABYLON.StandardMaterial("ritualMat", scene);
      ritualMat.emissiveColor = new BABYLON.Color3(0.4, 0.2, 0.08);
      ritualMat.alpha = 0.25;
      ritualMat.disableLighting = true;
      ritualRing.material = ritualMat;
      ritualRing.position.y = 0.01;
      ritualRing.rotation.x = Math.PI / 2;

      // Inner ritual ring
      const innerRing = BABYLON.MeshBuilder.CreateTorus("inner", {
        diameter: 5,
        thickness: 0.03,
        tessellation: 48,
      }, scene);
      const innerMat = new BABYLON.StandardMaterial("innerMat", scene);
      innerMat.emissiveColor = new BABYLON.Color3(0.5, 0.25, 0.1);
      innerMat.alpha = 0.2;
      innerMat.disableLighting = true;
      innerRing.material = innerMat;
      innerRing.position.y = 0.01;
      innerRing.rotation.x = Math.PI / 2;

      // --- GOTHIC PILLARS (8 around the arena) ---
      const pillarMat = new BABYLON.StandardMaterial("pillarMat", scene);
      pillarMat.diffuseColor = new BABYLON.Color3(0.06, 0.045, 0.06);
      pillarMat.specularColor = new BABYLON.Color3(0.015, 0.01, 0.02);

      const pillarCount = 8;
      for (let i = 0; i < pillarCount; i++) {
        const angle = (i / pillarCount) * Math.PI * 2;
        const radius = 6.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const pillar = BABYLON.MeshBuilder.CreateCylinder(`pillar${i}`, {
          height: 8,
          diameter: 0.6,
          tessellation: 10,
        }, scene);
        pillar.position = new BABYLON.Vector3(x, 4, z);
        pillar.material = pillarMat;

        // Capital
        const cap = BABYLON.MeshBuilder.CreateCylinder(`cap${i}`, {
          height: 0.4,
          diameterTop: 0.9,
          diameterBottom: 0.6,
          tessellation: 10,
        }, scene);
        cap.position = new BABYLON.Vector3(x, 8.2, z);
        cap.material = pillarMat;
      }

      // --- FOUR FIRE BRAZIERS (one per sin) ---
      const sinKeys = ["wrath", "sloth", "greed", "envy"];
      const brazierLights: any[] = [];

      sinKeys.forEach((sin, i) => {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const radius = 4.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const [r, g, b] = SIN_RGB[sin];

        // Brazier base (bowl shape)
        const bowl = BABYLON.MeshBuilder.CreateCylinder(`brazier${i}`, {
          height: 0.8,
          diameterTop: 0.7,
          diameterBottom: 0.4,
          tessellation: 10,
        }, scene);
        bowl.position = new BABYLON.Vector3(x, 0.4, z);
        const bowlMat = new BABYLON.StandardMaterial(`bowlMat${i}`, scene);
        bowlMat.diffuseColor = new BABYLON.Color3(0.05, 0.04, 0.05);
        bowl.material = bowlMat;

        // Stand
        const stand = BABYLON.MeshBuilder.CreateCylinder(`stand${i}`, {
          height: 0.6,
          diameter: 0.15,
          tessellation: 8,
        }, scene);
        stand.position = new BABYLON.Vector3(x, -0.1, z);
        stand.material = bowlMat;

        // Fire light
        const light = new BABYLON.PointLight(`fire${i}`, new BABYLON.Vector3(x, 1.2, z), scene);
        light.diffuse = new BABYLON.Color3(r * 0.7 + 0.3, g * 0.5 + 0.2, b * 0.3 + 0.05);
        light.intensity = 0.3;
        light.range = 6;

        // Flame orb
        const flame = BABYLON.MeshBuilder.CreateSphere(`flame${i}`, { diameter: 0.2, segments: 6 }, scene);
        flame.position = new BABYLON.Vector3(x, 1.0, z);
        const flameMat = new BABYLON.StandardMaterial(`flameMat${i}`, scene);
        flameMat.emissiveColor = new BABYLON.Color3(r, g, b);
        flameMat.disableLighting = true;
        flameMat.alpha = 0.7;
        flame.material = flameMat;

        brazierLights.push({ light, flame, flameMat, sin, baseIntensity: 0.3, phase: i * 1.5 });

        // Ember particles from each brazier
        const embers = new BABYLON.ParticleSystem(`embers${i}`, isMobile ? 15 : 30, scene);
        embers.createPointEmitter(
          new BABYLON.Vector3(-0.2, 0, -0.2),
          new BABYLON.Vector3(0.2, 0, 0.2)
        );
        embers.emitter = new BABYLON.Vector3(x, 1.0, z);
        embers.color1 = new BABYLON.Color4(r, g, b, 0.6);
        embers.color2 = new BABYLON.Color4(r * 0.7, g * 0.7, b * 0.7, 0.3);
        embers.colorDead = new BABYLON.Color4(r * 0.3, g * 0.3, b * 0.3, 0);
        embers.minSize = 0.015;
        embers.maxSize = 0.04;
        embers.minLifeTime = 1.5;
        embers.maxLifeTime = 3.5;
        embers.emitRate = isMobile ? 6 : 12;
        embers.gravity = new BABYLON.Vector3(0, 0.5, 0);
        embers.minEmitPower = 0.1;
        embers.maxEmitPower = 0.3;
        embers.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        embers.start();
      });

      // --- CENTRAL DOMINANT LIGHT (shifts with active sin) ---
      const centralLight = new BABYLON.PointLight("central", new BABYLON.Vector3(0, 5, 0), scene);
      centralLight.intensity = 0.15;
      centralLight.range = 12;
      centralLight.diffuse = new BABYLON.Color3(0.5, 0.3, 0.15); // warm default

      // --- GLOW LAYER ---
      const glow = new BABYLON.GlowLayer("glow", scene, {
        mainTextureFixedSize: isMobile ? 128 : 256,
        blurKernelSize: isMobile ? 16 : 32,
      });
      glow.intensity = 0.4;

      // --- AMBIENT DUST ---
      const dust = new BABYLON.ParticleSystem("dust", isMobile ? 40 : 100, scene);
      dust.createPointEmitter(
        new BABYLON.Vector3(-5, 1, -5),
        new BABYLON.Vector3(5, 7, 5)
      );
      dust.color1 = new BABYLON.Color4(0.8, 0.6, 0.3, 0.08);
      dust.color2 = new BABYLON.Color4(0.6, 0.4, 0.2, 0.04);
      dust.colorDead = new BABYLON.Color4(0.3, 0.2, 0.1, 0);
      dust.minSize = 0.01;
      dust.maxSize = 0.03;
      dust.minLifeTime = 4;
      dust.maxLifeTime = 10;
      dust.emitRate = isMobile ? 10 : 25;
      dust.gravity = new BABYLON.Vector3(0, -0.005, 0);
      dust.minEmitPower = 0.01;
      dust.maxEmitPower = 0.03;
      dust.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
      dust.start();

      // --- ANIMATION LOOP ---
      let time = 0;
      let targetR = 0.5, targetG = 0.3, targetB = 0.15;

      scene.registerBeforeRender(() => {
        time += engine.getDeltaTime() * 0.001;

        // Subtle camera breathing
        camera.alpha = -Math.PI / 2 + Math.sin(time * 0.08) * 0.015;
        camera.beta = Math.PI / 3.2 + Math.sin(time * 0.12) * 0.01;

        // Flickering brazier lights
        brazierLights.forEach(({ light, flame, flameMat, sin, baseIntensity, phase }) => {
          const flicker = Math.sin(time * 9 + phase) * 0.05
            + Math.sin(time * 15 + phase * 2) * 0.03
            + Math.sin(time * 23 + phase * 3) * 0.02;

          // Boost the active sin's brazier
          const isActive = activeSinRef.current === sin;
          const boost = isActive ? 0.25 : 0;
          light.intensity = baseIntensity + flicker + boost;
          flameMat.alpha = 0.6 + flicker + (isActive ? 0.2 : 0);
          flame.scaling.y = 1 + flicker * 2 + (isActive ? 0.3 : 0);
        });

        // Smoothly shift central light to active sin color
        const sinRgb = activeSinRef.current ? SIN_RGB[activeSinRef.current] : null;
        if (sinRgb) {
          targetR = sinRgb[0] * 0.5 + 0.2;
          targetG = sinRgb[1] * 0.4 + 0.1;
          targetB = sinRgb[2] * 0.3 + 0.05;
        } else {
          targetR = 0.5; targetG = 0.3; targetB = 0.15;
        }
        const lerp = 0.02;
        centralLight.diffuse.r += (targetR - centralLight.diffuse.r) * lerp;
        centralLight.diffuse.g += (targetG - centralLight.diffuse.g) * lerp;
        centralLight.diffuse.b += (targetB - centralLight.diffuse.b) * lerp;

        // Rotate ritual circles
        ritualRing.rotation.z = time * 0.03;
        innerRing.rotation.z = -time * 0.05;
        ritualMat.alpha = 0.2 + Math.sin(time * 0.4) * 0.08;
        innerMat.alpha = 0.15 + Math.sin(time * 0.6 + 1) * 0.06;

        // Arena decay — progressively dim as rounds increase
        const round = currentRoundRef.current;
        const decayFactor = Math.min(1, (round - 1) / 9); // 0 at round 1, 1 at round 10
        hemi.intensity = 0.04 - decayFactor * 0.025;
        scene.fogDensity = 0.035 + decayFactor * 0.04;
        // Ritual ring pulses faster at high rounds
        const speedMult = 1 + decayFactor * 2;
        ritualRing.rotation.z = time * 0.03 * speedMult;
        innerRing.rotation.z = -time * 0.05 * speedMult;
      });

      engine.runRenderLoop(() => scene.render());
      const onResize = () => engine.resize();
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

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}

// ─── Floor Rune: glowing sin-colored disc spawned on card play ─────────────
function triggerFloorRune(scene: any, sin: string, index: number) {
  const BABYLON_COLORS: Record<string, [number, number, number]> = {
    wrath: [0.9, 0.15, 0.1],
    sloth: [0.45, 0.2, 0.75],
    greed: [0.85, 0.7, 0.1],
    envy: [0.1, 0.75, 0.4],
  };
  const [r, g, b] = BABYLON_COLORS[sin] || BABYLON_COLORS.wrath;

  // Spread runes in a pattern around the center
  const angle = (index * 1.618) * Math.PI * 2; // golden ratio spiral
  const dist = Math.min(2.5, 0.5 + (index % 6) * 0.4);
  const x = Math.cos(angle) * dist;
  const z = Math.sin(angle) * dist;

  const disc = scene.getMeshByName ? scene.getEngine()?.scenes?.[0] : null;
  // Create a flat torus for the rune glyph
  const rune = scene.constructor?.MeshBuilder
    ? scene.constructor.MeshBuilder.CreateTorus(`rune_${index}`, {
        diameter: 0.5 + Math.random() * 0.3,
        thickness: 0.02,
        tessellation: 20,
      }, scene)
    : null;

  if (!rune) {
    // Fallback: dynamic import approach
    import("@babylonjs/core").then(({ MeshBuilder, StandardMaterial, Color3, Vector3 }) => {
      const runeDisc = MeshBuilder.CreateTorus(`rune_${index}`, {
        diameter: 0.5 + Math.random() * 0.3,
        thickness: 0.025,
        tessellation: 20,
      }, scene);
      runeDisc.position = new Vector3(x, 0.02, z);
      runeDisc.rotation.x = Math.PI / 2;

      const mat = new StandardMaterial(`runeMat_${index}`, scene);
      mat.emissiveColor = new Color3(r, g, b);
      mat.disableLighting = true;
      mat.alpha = 0;
      runeDisc.material = mat;

      // Fade in then linger
      let frame = 0;
      const observer = scene.onBeforeRenderObservable.add(() => {
        frame++;
        if (frame < 30) {
          mat.alpha = frame / 30 * 0.6;
        } else if (frame < 300) {
          mat.alpha = 0.6 - (frame - 30) / 300 * 0.4; // slowly fade to 0.2
        } else if (frame < 400) {
          mat.alpha = Math.max(0, 0.2 - (frame - 300) / 100 * 0.2);
        } else {
          runeDisc.dispose();
          mat.dispose();
          scene.onBeforeRenderObservable.remove(observer);
        }
      });
    });
  }
}
