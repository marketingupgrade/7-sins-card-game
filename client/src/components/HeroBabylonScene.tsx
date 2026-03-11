/**
 * HeroBabylonScene — AAA-quality 3D background for the homepage hero section.
 *
 * Reacts to the currently showcased sin by shifting:
 *  - Dominant point light color
 *  - Ember / mist particle hue
 *  - Ground rune glow color
 *  - Fog tint
 *
 * Uses Babylon.js GlowLayer, ParticleSystem, and procedural meshes.
 * Mobile-optimised with reduced particles and lower resolution.
 */
import { useEffect, useRef } from "react";
import type { SinType } from "@shared/gameTypes";

interface HeroBabylonSceneProps {
  className?: string;
  activeSin: SinType;
}

const SIN_RGB: Record<SinType, [number, number, number]> = {
  wrath:    [0.9, 0.15, 0.1],
  sloth:    [0.45, 0.2, 0.75],
  greed:    [0.85, 0.7, 0.1],
  envy:     [0.1, 0.75, 0.4],
  pride:    [0.92, 0.92, 0.95],
  lust:     [0.93, 0.2, 0.55],
  gluttony: [0.7, 0.33, 0.04],
};

export default function HeroBabylonScene({ className = "", activeSin }: HeroBabylonSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<any>(null);
  const disposed = useRef(false);
  const activeSinRef = useRef<SinType>(activeSin);

  useEffect(() => {
    activeSinRef.current = activeSin;
  }, [activeSin]);

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
      scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
      scene.ambientColor = new BABYLON.Color3(0.03, 0.02, 0.05);
      scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
      scene.fogDensity = 0.012;
      scene.fogColor = new BABYLON.Color3(0.02, 0.01, 0.04);

      // Camera — cinematic, no interaction
      const camera = new BABYLON.ArcRotateCamera(
        "cam", -Math.PI / 2, Math.PI / 3, isMobile ? 16 : 13,
        new BABYLON.Vector3(0, 0.5, 0), scene
      );
      camera.inputs.clear();

      // Hemisphere fill
      const hemi = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
      hemi.intensity = 0.08;
      hemi.diffuse = new BABYLON.Color3(0.2, 0.1, 0.3);

      // Dominant sin light — this shifts color
      const sinLight = new BABYLON.PointLight("sinLight", new BABYLON.Vector3(0, 4, 0), scene);
      sinLight.intensity = 1.2;
      sinLight.range = 18;
      const [r, g, b] = SIN_RGB[activeSinRef.current];
      sinLight.diffuse = new BABYLON.Color3(r, g, b);

      // Secondary accent lights
      const accent1 = new BABYLON.PointLight("accent1", new BABYLON.Vector3(5, 2, 3), scene);
      accent1.intensity = 0.3;
      accent1.range = 10;
      const accent2 = new BABYLON.PointLight("accent2", new BABYLON.Vector3(-5, 2, -3), scene);
      accent2.intensity = 0.3;
      accent2.range = 10;

      // Ground — dark reflective stone
      const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 30, height: 30 }, scene);
      const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
      groundMat.diffuseColor = new BABYLON.Color3(0.02, 0.02, 0.03);
      groundMat.specularColor = new BABYLON.Color3(0.1, 0.05, 0.15);
      groundMat.emissiveColor = new BABYLON.Color3(0.01, 0.005, 0.015);
      ground.material = groundMat;
      ground.position.y = -2;

      // Ritual circles — concentric glowing rings
      const rings: any[] = [];
      [5, 7.5, 10].forEach((diam, i) => {
        const ring = BABYLON.MeshBuilder.CreateTorus(`ring${i}`, {
          diameter: diam, thickness: 0.04, tessellation: 64
        }, scene);
        const mat = new BABYLON.StandardMaterial(`ringMat${i}`, scene);
        mat.emissiveColor = new BABYLON.Color3(r * 0.5, g * 0.5, b * 0.5);
        mat.alpha = 0.25 - i * 0.06;
        mat.disableLighting = true;
        ring.material = mat;
        ring.position.y = -1.95;
        ring.rotation.x = Math.PI / 2;
        rings.push({ mesh: ring, mat });
      });

      // Central pillar of light (vertical beam)
      const beam = BABYLON.MeshBuilder.CreateCylinder("beam", {
        height: 12, diameter: 0.15, tessellation: 8
      }, scene);
      const beamMat = new BABYLON.StandardMaterial("beamMat", scene);
      beamMat.emissiveColor = new BABYLON.Color3(r, g, b);
      beamMat.alpha = 0.12;
      beamMat.disableLighting = true;
      beamMat.backFaceCulling = false;
      beam.material = beamMat;
      beam.position.y = 3;

      // Outer beam (wider, fainter)
      const beamOuter = BABYLON.MeshBuilder.CreateCylinder("beamOuter", {
        height: 10, diameter: 0.6, tessellation: 8
      }, scene);
      const beamOuterMat = new BABYLON.StandardMaterial("beamOuterMat", scene);
      beamOuterMat.emissiveColor = new BABYLON.Color3(r, g, b);
      beamOuterMat.alpha = 0.04;
      beamOuterMat.disableLighting = true;
      beamOuterMat.backFaceCulling = false;
      beamOuter.material = beamOuterMat;
      beamOuter.position.y = 3;

      // Gothic pillars at edges
      const pillarCount = isMobile ? 4 : 8;
      for (let i = 0; i < pillarCount; i++) {
        const angle = (i / pillarCount) * Math.PI * 2;
        const pillar = BABYLON.MeshBuilder.CreateCylinder(`pillar${i}`, {
          height: 8, diameterTop: 0.15, diameterBottom: 0.25, tessellation: 6
        }, scene);
        const mat = new BABYLON.StandardMaterial(`pillarMat${i}`, scene);
        mat.diffuseColor = new BABYLON.Color3(0.04, 0.03, 0.06);
        mat.specularColor = new BABYLON.Color3(0.05, 0.03, 0.08);
        pillar.material = mat;
        pillar.position.x = Math.cos(angle) * 9;
        pillar.position.z = Math.sin(angle) * 9;
        pillar.position.y = 2;
      }

      // Glow layer
      const glow = new BABYLON.GlowLayer("glow", scene, {
        mainTextureFixedSize: isMobile ? 128 : 256,
        blurKernelSize: isMobile ? 16 : 48,
      });
      glow.intensity = 0.9;

      // Ember particles — sin-colored
      const embers = new BABYLON.ParticleSystem("embers", isMobile ? 60 : 180, scene);
      embers.createPointEmitter(
        new BABYLON.Vector3(-8, -2, -8),
        new BABYLON.Vector3(8, -2, 8)
      );
      embers.color1 = new BABYLON.Color4(r, g, b, 0.7);
      embers.color2 = new BABYLON.Color4(r * 0.6, g * 0.6, b * 0.6, 0.4);
      embers.colorDead = new BABYLON.Color4(0.05, 0.02, 0.08, 0);
      embers.minSize = 0.02;
      embers.maxSize = 0.08;
      embers.minLifeTime = 2;
      embers.maxLifeTime = 6;
      embers.emitRate = isMobile ? 20 : 50;
      embers.gravity = new BABYLON.Vector3(0, 0.4, 0);
      embers.minEmitPower = 0.15;
      embers.maxEmitPower = 0.5;
      embers.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
      embers.start();

      // Mist particles
      const mist = new BABYLON.ParticleSystem("mist", isMobile ? 20 : 50, scene);
      mist.createPointEmitter(
        new BABYLON.Vector3(-6, -1.5, -6),
        new BABYLON.Vector3(6, 0, 6)
      );
      mist.color1 = new BABYLON.Color4(r * 0.3, g * 0.3, b * 0.3, 0.1);
      mist.color2 = new BABYLON.Color4(0.08, 0.04, 0.12, 0.06);
      mist.colorDead = new BABYLON.Color4(0, 0, 0, 0);
      mist.minSize = 2;
      mist.maxSize = 5;
      mist.minLifeTime = 5;
      mist.maxLifeTime = 10;
      mist.emitRate = isMobile ? 6 : 14;
      mist.gravity = new BABYLON.Vector3(0, 0.03, 0);
      mist.minEmitPower = 0.03;
      mist.maxEmitPower = 0.1;
      mist.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
      mist.start();

      // Animation loop
      let time = 0;
      let currentR = r, currentG = g, currentB = b;

      scene.registerBeforeRender(() => {
        time += engine.getDeltaTime() * 0.001;

        // Smoothly lerp to target sin color
        const [tR, tG, tB] = SIN_RGB[activeSinRef.current];
        const lerpSpeed = 0.015;
        currentR += (tR - currentR) * lerpSpeed;
        currentG += (tG - currentG) * lerpSpeed;
        currentB += (tB - currentB) * lerpSpeed;

        // Update sin light
        sinLight.diffuse.r = currentR;
        sinLight.diffuse.g = currentG;
        sinLight.diffuse.b = currentB;
        sinLight.intensity = 1.0 + Math.sin(time * 0.8) * 0.3;

        // Update accent lights
        accent1.diffuse.r = currentR * 0.5;
        accent1.diffuse.g = currentG * 0.5;
        accent1.diffuse.b = currentB * 0.5;
        accent2.diffuse.r = currentR * 0.3;
        accent2.diffuse.g = currentG * 0.3;
        accent2.diffuse.b = currentB * 0.8;

        // Update beam
        (beam.material as any).emissiveColor.r = currentR;
        (beam.material as any).emissiveColor.g = currentG;
        (beam.material as any).emissiveColor.b = currentB;
        (beam.material as any).alpha = 0.08 + Math.sin(time * 1.5) * 0.04;
        (beamOuter.material as any).emissiveColor.r = currentR;
        (beamOuter.material as any).emissiveColor.g = currentG;
        (beamOuter.material as any).emissiveColor.b = currentB;

        // Update rings
        rings.forEach(({ mat }, i) => {
          mat.emissiveColor.r = currentR * (0.5 - i * 0.1);
          mat.emissiveColor.g = currentG * (0.5 - i * 0.1);
          mat.emissiveColor.b = currentB * (0.5 - i * 0.1);
        });

        // Update ember particles
        embers.color1 = new BABYLON.Color4(currentR, currentG, currentB, 0.7);
        embers.color2 = new BABYLON.Color4(currentR * 0.6, currentG * 0.6, currentB * 0.6, 0.4);

        // Update mist
        mist.color1 = new BABYLON.Color4(currentR * 0.3, currentG * 0.3, currentB * 0.3, 0.1);

        // Slow camera orbit
        camera.alpha += 0.0004;
        camera.beta = Math.PI / 3 + Math.sin(time * 0.15) * 0.03;

        // Rotate rings
        rings.forEach(({ mesh }, i) => {
          mesh.rotation.z = time * (0.05 + i * 0.02) * (i % 2 === 0 ? 1 : -1);
        });

        // Pulse beam
        beam.scaling.x = 1 + Math.sin(time * 2) * 0.15;
        beam.scaling.z = 1 + Math.sin(time * 2) * 0.15;
      });

      engine.runRenderLoop(() => scene.render());
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
