/**
 * HomeBabylonScene - 3D dark fantasy background for the homepage
 *
 * Floating sin cards orbit a central glowing orb. Ember particles rise
 * from below. Purple mist drifts. Camera auto-rotates for cinematic feel.
 * Lazy-loaded via dynamic import for code splitting.
 *
 * Performance: reduced particles and resolution on mobile.
 */

import { useEffect, useRef } from "react";

interface HomeBabylonSceneProps {
  className?: string;
}

export default function HomeBabylonScene({ className = "" }: HomeBabylonSceneProps) {
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
      // Dynamic import for code splitting
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
      scene.clearColor = new BABYLON.Color4(0, 0, 0, 0); // transparent
      scene.ambientColor = new BABYLON.Color3(0.05, 0.03, 0.08);
      scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
      scene.fogDensity = 0.015;
      scene.fogColor = new BABYLON.Color3(0.03, 0.01, 0.05);

      // Camera - cinematic auto-orbit, no user interaction
      const camera = new BABYLON.ArcRotateCamera(
        "cam",
        -Math.PI / 2,
        Math.PI / 3.2,
        isMobile ? 14 : 12,
        new BABYLON.Vector3(0, 0.5, 0),
        scene
      );
      camera.lowerRadiusLimit = 10;
      camera.upperRadiusLimit = 15;
      camera.inputs.clear(); // cinematic only

      // Hemisphere light
      const hemi = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
      hemi.intensity = 0.12;
      hemi.diffuse = new BABYLON.Color3(0.3, 0.15, 0.4);

      // Sin-colored point lights
      const sinLights = [
        { color: new BABYLON.Color3(0.9, 0.15, 0.1), pos: new BABYLON.Vector3(3.5, 2.5, 0) },   // wrath
        { color: new BABYLON.Color3(0.5, 0.2, 0.8), pos: new BABYLON.Vector3(-3.5, 2.5, 0) },   // sloth
        { color: new BABYLON.Color3(0.85, 0.7, 0.1), pos: new BABYLON.Vector3(0, 2.5, 3.5) },   // greed
        { color: new BABYLON.Color3(0.1, 0.75, 0.4), pos: new BABYLON.Vector3(0, 2.5, -3.5) },  // envy
      ];
      sinLights.forEach((s, i) => {
        const light = new BABYLON.PointLight(`sinLight${i}`, s.pos, scene);
        light.diffuse = s.color;
        light.intensity = 0.5;
        light.range = 8;
      });

      // Ground - dark reflective
      const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 24, height: 24 }, scene);
      const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
      groundMat.diffuseColor = new BABYLON.Color3(0.02, 0.02, 0.04);
      groundMat.specularColor = new BABYLON.Color3(0.08, 0.04, 0.12);
      groundMat.emissiveColor = new BABYLON.Color3(0.01, 0.005, 0.02);
      ground.material = groundMat;
      ground.position.y = -1.5;

      // Central glowing orb
      const orb = BABYLON.MeshBuilder.CreateSphere("orb", { diameter: 1.4, segments: 32 }, scene);
      const orbMat = new BABYLON.StandardMaterial("orbMat", scene);
      orbMat.emissiveColor = new BABYLON.Color3(0.4, 0.1, 0.5);
      orbMat.alpha = 0.6;
      orbMat.disableLighting = true;
      orb.material = orbMat;
      orb.position.y = 0.5;

      // Glow layer
      const glow = new BABYLON.GlowLayer("glow", scene, {
        mainTextureFixedSize: isMobile ? 128 : 256,
        blurKernelSize: isMobile ? 16 : 32,
      });
      glow.intensity = 0.7;

      // 7 floating card planes orbiting the orb
      const cardCount = 7;
      const cardColors = [
        new BABYLON.Color3(0.9, 0.15, 0.1),  // wrath
        new BABYLON.Color3(0.5, 0.2, 0.8),   // sloth
        new BABYLON.Color3(0.85, 0.7, 0.1),  // greed
        new BABYLON.Color3(0.1, 0.75, 0.4),  // envy
        new BABYLON.Color3(0.9, 0.15, 0.1),  // wrath
        new BABYLON.Color3(0.5, 0.2, 0.8),   // sloth
        new BABYLON.Color3(0.85, 0.7, 0.1),  // greed
      ];
      const cards: any[] = [];
      for (let i = 0; i < cardCount; i++) {
        const card = BABYLON.MeshBuilder.CreatePlane(`card${i}`, { width: 1.2, height: 1.8 }, scene);
        const mat = new BABYLON.StandardMaterial(`cardMat${i}`, scene);
        mat.emissiveColor = cardColors[i];
        mat.alpha = 0.2;
        mat.backFaceCulling = false;
        mat.disableLighting = true;
        card.material = mat;
        cards.push(card);
      }

      // Pentagram ring on the ground
      const ring = BABYLON.MeshBuilder.CreateTorus("ring", { diameter: 7, thickness: 0.06, tessellation: 64 }, scene);
      const ringMat = new BABYLON.StandardMaterial("ringMat", scene);
      ringMat.emissiveColor = new BABYLON.Color3(0.3, 0.08, 0.4);
      ringMat.alpha = 0.3;
      ringMat.disableLighting = true;
      ring.material = ringMat;
      ring.position.y = -1.4;
      ring.rotation.x = Math.PI / 2;

      // Ember particles - rising from below
      const embers = new BABYLON.ParticleSystem("embers", isMobile ? 80 : 200, scene);
      embers.createPointEmitter(
        new BABYLON.Vector3(-6, -1.5, -6),
        new BABYLON.Vector3(6, -1.5, 6)
      );
      embers.color1 = new BABYLON.Color4(0.9, 0.3, 0.1, 0.7);
      embers.color2 = new BABYLON.Color4(0.6, 0.1, 0.8, 0.5);
      embers.colorDead = new BABYLON.Color4(0.1, 0.05, 0.2, 0);
      embers.minSize = 0.02;
      embers.maxSize = 0.07;
      embers.minLifeTime = 2;
      embers.maxLifeTime = 5;
      embers.emitRate = isMobile ? 25 : 55;
      embers.gravity = new BABYLON.Vector3(0, 0.35, 0);
      embers.minEmitPower = 0.2;
      embers.maxEmitPower = 0.6;
      embers.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
      embers.start();

      // Purple mist particles
      const mist = new BABYLON.ParticleSystem("mist", isMobile ? 30 : 60, scene);
      mist.createPointEmitter(
        new BABYLON.Vector3(-5, -1, -5),
        new BABYLON.Vector3(5, 0.5, 5)
      );
      mist.color1 = new BABYLON.Color4(0.3, 0.1, 0.5, 0.12);
      mist.color2 = new BABYLON.Color4(0.1, 0.05, 0.3, 0.08);
      mist.colorDead = new BABYLON.Color4(0, 0, 0, 0);
      mist.minSize = 1.5;
      mist.maxSize = 3.5;
      mist.minLifeTime = 4;
      mist.maxLifeTime = 8;
      mist.emitRate = isMobile ? 8 : 18;
      mist.gravity = new BABYLON.Vector3(0, 0.04, 0);
      mist.minEmitPower = 0.04;
      mist.maxEmitPower = 0.12;
      mist.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
      mist.start();

      // Animation loop
      let time = 0;
      scene.registerBeforeRender(() => {
        time += engine.getDeltaTime() * 0.001;

        // Slow camera orbit
        camera.alpha += 0.0006;

        // Orbit cards with gentle bob
        cards.forEach((card, i) => {
          const angle = (i / cardCount) * Math.PI * 2 + time * 0.25;
          const radius = 3.5 + Math.sin(time * 0.4 + i) * 0.4;
          card.position.x = Math.cos(angle) * radius;
          card.position.z = Math.sin(angle) * radius;
          card.position.y = 0.5 + Math.sin(time * 0.6 + i * 0.9) * 0.35;
          card.rotation.y = -angle + Math.PI / 2;
          card.rotation.x = Math.sin(time * 0.25 + i) * 0.08;
          // Gentle alpha pulse
          (card.material as any).alpha = 0.15 + Math.sin(time * 0.5 + i * 1.2) * 0.08;
        });

        // Pulse orb
        const s = 1 + Math.sin(time * 1.2) * 0.06;
        orb.scaling.setAll(s);
        (orb.material as any).emissiveColor = new BABYLON.Color3(
          0.4 + Math.sin(time * 0.8) * 0.12,
          0.1 + Math.sin(time * 0.6) * 0.04,
          0.5 + Math.sin(time * 1.1) * 0.12
        );

        // Rotate ring slowly
        ring.rotation.z = time * 0.1;
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
