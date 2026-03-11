/**
 * LobbyBabylonScene - 3D Gothic Cathedral Interior
 *
 * A dimly lit cathedral nave with:
 * - Stone pillars lining both sides
 * - Flickering candle point lights on pillar tops
 * - Stained glass color projections on the floor
 * - Central ritual circle with glowing runes
 * - Incense smoke particles drifting upward
 * - Dust motes floating in light beams
 * - Slow camera drift for cinematic atmosphere
 *
 * Lazy-loaded via dynamic import. Performance-tuned for mobile.
 */

import { useEffect, useRef } from "react";

interface LobbyBabylonSceneProps {
  className?: string;
}

export default function LobbyBabylonScene({ className = "" }: LobbyBabylonSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<any>(null);
  const disposed = useRef(false);

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

      // Engine
      engine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: false,
        stencil: false,
        antialias: !isMobile,
        adaptToDeviceRatio: true,
      });
      engineRef.current = engine;
      if (isMobile) engine.setHardwareScalingLevel(2);

      // Scene
      scene = new BABYLON.Scene(engine);
      scene.clearColor = new BABYLON.Color4(0.02, 0.015, 0.03, 1);
      scene.ambientColor = new BABYLON.Color3(0.03, 0.02, 0.04);
      scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
      scene.fogDensity = 0.025;
      scene.fogColor = new BABYLON.Color3(0.02, 0.015, 0.03);

      // Camera - slow cinematic drift, no user interaction
      const camera = new BABYLON.ArcRotateCamera(
        "cam",
        -Math.PI / 2,
        Math.PI / 2.8,
        isMobile ? 16 : 13,
        new BABYLON.Vector3(0, 2, 0),
        scene
      );
      camera.lowerRadiusLimit = 10;
      camera.upperRadiusLimit = 18;
      camera.inputs.clear();

      // Very dim hemisphere light (moonlight through ceiling)
      const hemi = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
      hemi.intensity = 0.06;
      hemi.diffuse = new BABYLON.Color3(0.15, 0.1, 0.2);
      hemi.groundColor = new BABYLON.Color3(0.02, 0.01, 0.03);

      // --- CATHEDRAL FLOOR ---
      const floor = BABYLON.MeshBuilder.CreateGround("floor", { width: 30, height: 30 }, scene);
      const floorMat = new BABYLON.StandardMaterial("floorMat", scene);
      floorMat.diffuseColor = new BABYLON.Color3(0.06, 0.04, 0.05);
      floorMat.specularColor = new BABYLON.Color3(0.04, 0.03, 0.05);
      floorMat.emissiveColor = new BABYLON.Color3(0.01, 0.008, 0.015);
      floor.material = floorMat;

      // --- STONE PILLARS (6 on each side) ---
      const pillarPositions: [number, number][] = [];
      for (let i = -2; i <= 2; i++) {
        pillarPositions.push([-4.5, i * 4]);
        pillarPositions.push([4.5, i * 4]);
      }

      const pillarMat = new BABYLON.StandardMaterial("pillarMat", scene);
      pillarMat.diffuseColor = new BABYLON.Color3(0.08, 0.06, 0.07);
      pillarMat.specularColor = new BABYLON.Color3(0.02, 0.015, 0.025);

      pillarPositions.forEach(([x, z], idx) => {
        // Main pillar shaft
        const pillar = BABYLON.MeshBuilder.CreateCylinder(`pillar${idx}`, {
          height: 10,
          diameter: 0.8,
          tessellation: 12,
        }, scene);
        pillar.position = new BABYLON.Vector3(x, 5, z);
        pillar.material = pillarMat;

        // Pillar capital (wider top)
        const capital = BABYLON.MeshBuilder.CreateCylinder(`cap${idx}`, {
          height: 0.5,
          diameterTop: 1.2,
          diameterBottom: 0.8,
          tessellation: 12,
        }, scene);
        capital.position = new BABYLON.Vector3(x, 10.25, z);
        capital.material = pillarMat;

        // Pillar base
        const base = BABYLON.MeshBuilder.CreateCylinder(`base${idx}`, {
          height: 0.4,
          diameterTop: 0.8,
          diameterBottom: 1.1,
          tessellation: 12,
        }, scene);
        base.position = new BABYLON.Vector3(x, 0.2, z);
        base.material = pillarMat;
      });

      // --- CANDLE LIGHTS on pillars ---
      const sinColors = [
        new BABYLON.Color3(0.9, 0.15, 0.1),   // wrath red
        new BABYLON.Color3(0.5, 0.2, 0.8),    // sloth purple
        new BABYLON.Color3(0.85, 0.7, 0.1),   // greed gold
        new BABYLON.Color3(0.1, 0.75, 0.4),   // envy green
      ];

      const candleLights: any[] = [];
      pillarPositions.forEach(([x, z], idx) => {
        const light = new BABYLON.PointLight(`candle${idx}`, new BABYLON.Vector3(x, 8.5, z), scene);
        const colorIdx = idx % sinColors.length;
        // Mix sin color with warm candle orange
        const sinC = sinColors[colorIdx];
        light.diffuse = new BABYLON.Color3(
          sinC.r * 0.4 + 0.6 * 0.95,
          sinC.g * 0.4 + 0.6 * 0.65,
          sinC.b * 0.4 + 0.6 * 0.2
        );
        light.intensity = 0.35;
        light.range = 8;
        candleLights.push({ light, baseIntensity: 0.35, phase: idx * 0.7 });

        // Small glowing orb at candle position
        const flame = BABYLON.MeshBuilder.CreateSphere(`flame${idx}`, { diameter: 0.15, segments: 8 }, scene);
        flame.position = new BABYLON.Vector3(x, 8.7, z);
        const flameMat = new BABYLON.StandardMaterial(`flameMat${idx}`, scene);
        flameMat.emissiveColor = light.diffuse;
        flameMat.disableLighting = true;
        flameMat.alpha = 0.8;
        flame.material = flameMat;
      });

      // --- CENTRAL RITUAL CIRCLE ---
      // Outer ring
      const ritualRing = BABYLON.MeshBuilder.CreateTorus("ritual", {
        diameter: 5,
        thickness: 0.06,
        tessellation: 64,
      }, scene);
      const ritualMat = new BABYLON.StandardMaterial("ritualMat", scene);
      ritualMat.emissiveColor = new BABYLON.Color3(0.5, 0.25, 0.1);
      ritualMat.alpha = 0.4;
      ritualMat.disableLighting = true;
      ritualRing.material = ritualMat;
      ritualRing.position.y = 0.02;
      ritualRing.rotation.x = Math.PI / 2;

      // Inner ring
      const innerRing = BABYLON.MeshBuilder.CreateTorus("innerRitual", {
        diameter: 3.2,
        thickness: 0.04,
        tessellation: 48,
      }, scene);
      const innerMat = new BABYLON.StandardMaterial("innerMat", scene);
      innerMat.emissiveColor = new BABYLON.Color3(0.6, 0.3, 0.15);
      innerMat.alpha = 0.3;
      innerMat.disableLighting = true;
      innerRing.material = innerMat;
      innerRing.position.y = 0.02;
      innerRing.rotation.x = Math.PI / 2;

      // Rune markers at cardinal points (4 sin positions)
      sinColors.forEach((color, i) => {
        const angle = (i / 4) * Math.PI * 2;
        const radius = 2.2;
        const rune = BABYLON.MeshBuilder.CreatePlane(`rune${i}`, { width: 0.5, height: 0.5 }, scene);
        rune.position = new BABYLON.Vector3(
          Math.cos(angle) * radius,
          0.03,
          Math.sin(angle) * radius
        );
        rune.rotation.x = Math.PI / 2;
        const runeMat = new BABYLON.StandardMaterial(`runeMat${i}`, scene);
        runeMat.emissiveColor = color;
        runeMat.alpha = 0.25;
        runeMat.disableLighting = true;
        runeMat.backFaceCulling = false;
        rune.material = runeMat;
      });

      // --- GOTHIC ARCHES (ceiling cross-beams) ---
      const archMat = new BABYLON.StandardMaterial("archMat", scene);
      archMat.diffuseColor = new BABYLON.Color3(0.06, 0.04, 0.055);
      archMat.specularColor = new BABYLON.Color3(0.01, 0.008, 0.015);

      // Cross beams connecting pillars
      for (let i = -2; i <= 2; i++) {
        const beam = BABYLON.MeshBuilder.CreateBox(`beam${i}`, {
          width: 9.5,
          height: 0.3,
          depth: 0.3,
        }, scene);
        beam.position = new BABYLON.Vector3(0, 10.3, i * 4);
        beam.material = archMat;
      }

      // --- GLOW LAYER ---
      const glow = new BABYLON.GlowLayer("glow", scene, {
        mainTextureFixedSize: isMobile ? 128 : 256,
        blurKernelSize: isMobile ? 16 : 32,
      });
      glow.intensity = 0.5;

      // --- INCENSE SMOKE PARTICLES ---
      const smoke = new BABYLON.ParticleSystem("smoke", isMobile ? 40 : 80, scene);
      smoke.createPointEmitter(
        new BABYLON.Vector3(-0.3, 0, -0.3),
        new BABYLON.Vector3(0.3, 0, 0.3)
      );
      smoke.emitter = new BABYLON.Vector3(0, 0.5, 0);
      smoke.color1 = new BABYLON.Color4(0.25, 0.18, 0.12, 0.06);
      smoke.color2 = new BABYLON.Color4(0.15, 0.1, 0.2, 0.04);
      smoke.colorDead = new BABYLON.Color4(0.05, 0.03, 0.08, 0);
      smoke.minSize = 1.0;
      smoke.maxSize = 3.0;
      smoke.minLifeTime = 4;
      smoke.maxLifeTime = 8;
      smoke.emitRate = isMobile ? 8 : 16;
      smoke.gravity = new BABYLON.Vector3(0, 0.15, 0);
      smoke.minEmitPower = 0.05;
      smoke.maxEmitPower = 0.15;
      smoke.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
      smoke.start();

      // --- DUST MOTES in light beams ---
      const dust = new BABYLON.ParticleSystem("dust", isMobile ? 60 : 150, scene);
      dust.createPointEmitter(
        new BABYLON.Vector3(-6, 2, -6),
        new BABYLON.Vector3(6, 9, 6)
      );
      dust.color1 = new BABYLON.Color4(0.95, 0.75, 0.35, 0.15);
      dust.color2 = new BABYLON.Color4(0.8, 0.6, 0.3, 0.08);
      dust.colorDead = new BABYLON.Color4(0.5, 0.3, 0.1, 0);
      dust.minSize = 0.015;
      dust.maxSize = 0.04;
      dust.minLifeTime = 5;
      dust.maxLifeTime = 12;
      dust.emitRate = isMobile ? 15 : 40;
      dust.gravity = new BABYLON.Vector3(0, -0.01, 0);
      dust.minEmitPower = 0.01;
      dust.maxEmitPower = 0.04;
      dust.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
      dust.start();

      // --- EMBER PARTICLES rising from ritual circle ---
      const embers = new BABYLON.ParticleSystem("embers", isMobile ? 30 : 60, scene);
      embers.createPointEmitter(
        new BABYLON.Vector3(-1.5, 0, -1.5),
        new BABYLON.Vector3(1.5, 0, 1.5)
      );
      embers.emitter = new BABYLON.Vector3(0, 0.1, 0);
      embers.color1 = new BABYLON.Color4(0.95, 0.5, 0.1, 0.5);
      embers.color2 = new BABYLON.Color4(0.8, 0.2, 0.05, 0.3);
      embers.colorDead = new BABYLON.Color4(0.3, 0.1, 0.05, 0);
      embers.minSize = 0.02;
      embers.maxSize = 0.06;
      embers.minLifeTime = 2;
      embers.maxLifeTime = 5;
      embers.emitRate = isMobile ? 10 : 20;
      embers.gravity = new BABYLON.Vector3(0, 0.4, 0);
      embers.minEmitPower = 0.1;
      embers.maxEmitPower = 0.3;
      embers.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
      embers.start();

      // --- ANIMATION LOOP ---
      let time = 0;
      scene.registerBeforeRender(() => {
        time += engine.getDeltaTime() * 0.001;

        // Very slow camera orbit
        camera.alpha += 0.0003;
        // Gentle vertical bob
        camera.beta = Math.PI / 2.8 + Math.sin(time * 0.15) * 0.02;

        // Flickering candle lights
        candleLights.forEach(({ light, baseIntensity, phase }) => {
          const flicker = Math.sin(time * 8 + phase) * 0.04
            + Math.sin(time * 13 + phase * 2) * 0.03
            + Math.sin(time * 21 + phase * 3) * 0.02;
          light.intensity = baseIntensity + flicker;
        });

        // Slowly rotate ritual circles
        ritualRing.rotation.z = time * 0.05;
        innerRing.rotation.z = -time * 0.08;

        // Pulse ritual ring alpha
        (ritualRing.material as any).alpha = 0.3 + Math.sin(time * 0.6) * 0.1;
        (innerRing.material as any).alpha = 0.2 + Math.sin(time * 0.8 + 1) * 0.08;
      });

      // Render loop
      engine.runRenderLoop(() => scene.render());

      // Resize
      const onResize = () => engine.resize();
      window.addEventListener("resize", onResize);
    })();

    return () => {
      disposed.current = true;
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
