/**
 * PromoVideo — Epic Cinematic Promo for 7 Deadly Sins Card Game
 *
 * A 28-second Babylon.js cinematic that showcases all four sin factions
 * with sweeping camera work, sin-colored particle systems, dramatic card
 * reveals, and a climactic convergence explosion.
 *
 * Timeline:
 *   0.0s  Intro — dark cathedral floor fades in, camera near-floor
 *   3.0s  WRATH — card slams down with crimson explosion
 *   6.5s  SLOTH — card drifts in on purple wisps
 *   10.0s GREED — card materialises in a gold shimmer
 *   13.5s ENVY  — card rises on emerald tendrils
 *   17.0s CONVERGENCE — all four cards orbit the sigil
 *   20.5s COLLAPSE — cards spiral inward to a detonation
 *   23.0s TITLE — "7 DEADLY SINS" blazes into view
 *   26.0s CTA   — "ENTER THE ABYSS" button appears
 */

import { useEffect, useRef, useState } from "react";
import * as BABYLON from "@babylonjs/core";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

// ─── Types ────────────────────────────────────────────────────
type Phase =
  | "loading"
  | "intro"
  | "wrath"
  | "sloth"
  | "greed"
  | "envy"
  | "convergence"
  | "title"
  | "cta";

// ─── Sin Config ───────────────────────────────────────────────
const SIN_CFG = {
  wrath: {
    c3:  new BABYLON.Color3(0.88, 0.14, 0.08),
    c4a: new BABYLON.Color4(1.00, 0.18, 0.05, 0.95),
    c4b: new BABYLON.Color4(0.80, 0.40, 0.08, 0.60),
    pos: new BABYLON.Vector3(-5, 2.5, 0),
    label: "WRATH",
    tagline: "Consume them all in flame",
    hex: "#e8200e",
    easing: () => { const e = new BABYLON.BounceEase(1, 4); e.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT); return e; },
  },
  sloth: {
    c3:  new BABYLON.Color3(0.35, 0.15, 0.72),
    c4a: new BABYLON.Color4(0.45, 0.12, 0.85, 0.85),
    c4b: new BABYLON.Color4(0.60, 0.08, 0.90, 0.50),
    pos: new BABYLON.Vector3(0, 2.5, 5),
    label: "SLOTH",
    tagline: "Let them wither in the dark",
    hex: "#7a25c8",
    easing: () => { const e = new BABYLON.SineEase(); e.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT); return e; },
  },
  greed: {
    c3:  new BABYLON.Color3(0.92, 0.72, 0.08),
    c4a: new BABYLON.Color4(1.00, 0.82, 0.12, 0.95),
    c4b: new BABYLON.Color4(0.90, 0.55, 0.08, 0.60),
    pos: new BABYLON.Vector3(5, 2.5, 0),
    label: "GREED",
    tagline: "Nothing will ever be enough",
    hex: "#e8b80e",
    easing: () => { const e = new BABYLON.BackEase(2); e.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT); return e; },
  },
  envy: {
    c3:  new BABYLON.Color3(0.08, 0.82, 0.28),
    c4a: new BABYLON.Color4(0.10, 0.92, 0.32, 0.95),
    c4b: new BABYLON.Color4(0.04, 0.60, 0.18, 0.60),
    pos: new BABYLON.Vector3(0, 2.5, -5),
    label: "ENVY",
    tagline: "Covet everything they possess",
    hex: "#15c840",
    easing: () => { const e = new BABYLON.ElasticEase(1, 3); e.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT); return e; },
  },
} as const;

type SinKey = keyof typeof SIN_CFG;

// ─── Phase Text Content ───────────────────────────────────────
const PHASE_TEXT: Record<Phase, { title: string; sub: string; hex: string } | null> = {
  loading:     null,
  intro:       { title: "In a world consumed by corruption…", sub: "", hex: "#888888" },
  wrath:       { title: SIN_CFG.wrath.label,  sub: SIN_CFG.wrath.tagline,  hex: SIN_CFG.wrath.hex  },
  sloth:       { title: SIN_CFG.sloth.label,  sub: SIN_CFG.sloth.tagline,  hex: SIN_CFG.sloth.hex  },
  greed:       { title: SIN_CFG.greed.label,  sub: SIN_CFG.greed.tagline,  hex: SIN_CFG.greed.hex  },
  envy:        { title: SIN_CFG.envy.label,   sub: SIN_CFG.envy.tagline,   hex: SIN_CFG.envy.hex   },
  convergence: { title: "Choose your corruption",   sub: "Seven paths to damnation", hex: "#c890ff" },
  title:       { title: "7 DEADLY SINS",            sub: "A Card Game of Dark Ambition", hex: "#e8c870" },
  cta:         { title: "7 DEADLY SINS",            sub: "Your damnation begins now",   hex: "#e8c870" },
};

// ─── Helper: build a Babylon camera animation ─────────────────
function buildCamAnim(
  prop: string,
  fromVal: number,
  toVal: number,
  frames: number,
  easing?: BABYLON.EasingFunction,
): BABYLON.Animation {
  const anim = new BABYLON.Animation(
    `cam_${prop}_${Date.now()}`,
    prop,
    60,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
  );
  const ease = easing ?? (() => {
    const e = new BABYLON.CubicEase();
    e.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    return e;
  })();
  anim.setEasingFunction(ease);
  anim.setKeys([{ frame: 0, value: fromVal }, { frame: frames, value: toVal }]);
  return anim;
}

// ─── Component ────────────────────────────────────────────────
export default function PromoVideo() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const engineRef  = useRef<BABYLON.Engine | null>(null);
  const sceneRef   = useRef<BABYLON.Scene | null>(null);
  const cameraRef  = useRef<BABYLON.ArcRotateCamera | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [ready, setReady] = useState(false);
  const [, setLocation] = useLocation();

  // Refs to Babylon objects that the timeline needs to access
  const cards  = useRef<Partial<Record<SinKey, BABYLON.Mesh>>>({});
  const lights = useRef<Partial<Record<SinKey, BABYLON.PointLight>>>({});
  const parts  = useRef<Partial<Record<SinKey | "explosion", BABYLON.ParticleSystem>>>({});
  const orbitRef = useRef({ active: false, angle: 0, speed: 0.008, radius: 5, collapse: false });
  const timersRef = useRef<number[]>([]);

  // ── Scene Setup ───────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true, { antialias: true, preserveDrawingBuffer: true });
    engineRef.current = engine;

    const scene = new BABYLON.Scene(engine);
    sceneRef.current = scene;
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

    // ── Camera ───────────────────────────────────────────────
    const camera = new BABYLON.ArcRotateCamera(
      "cam", -Math.PI / 2, 1.22, 10,
      new BABYLON.Vector3(0, 2, 0),
      scene,
    );
    cameraRef.current = camera;
    // No user control — fully cinematic

    // ── Post-Processing ──────────────────────────────────────
    const pipeline = new BABYLON.DefaultRenderingPipeline("pp", true, scene, [camera]);
    pipeline.bloomEnabled = true;
    pipeline.bloomWeight = 1.4;
    pipeline.bloomThreshold = 0.04;
    pipeline.bloomKernel = 128;
    pipeline.fxaaEnabled = true;
    try {
      pipeline.chromaticAberrationEnabled = true;
      pipeline.chromaticAberration.aberrationAmount = 6;
      const pp = pipeline as any;
      pp.vignetteEnabled = true;
      pp.vignette.vignetteWeight = 5;
      pp.vignette.vignetteColor = new BABYLON.Color4(0, 0, 0, 1);
      pp.vignette.vignetteCameraFov = 0.5;
    } catch (_) { /* optional post-fx — ignore if unavailable */ }

    // ── Glow Layer ───────────────────────────────────────────
    const glow = new BABYLON.GlowLayer("glow", scene);
    glow.intensity = 1.8;

    // ── Ambient Light ────────────────────────────────────────
    const amb = new BABYLON.HemisphericLight("amb", new BABYLON.Vector3(0, 1, 0), scene);
    amb.intensity = 0.06;
    amb.diffuse = new BABYLON.Color3(0.12, 0.06, 0.18);

    // ── Floor — Dark Stone ───────────────────────────────────
    const floor = BABYLON.MeshBuilder.CreateGround("floor", { width: 22, height: 22 }, scene);
    const floorMat = new BABYLON.StandardMaterial("floorMat", scene);
    floorMat.diffuseColor  = new BABYLON.Color3(0.03, 0.02, 0.05);
    floorMat.specularColor = new BABYLON.Color3(0.06, 0.04, 0.10);
    floorMat.emissiveColor = new BABYLON.Color3(0.01, 0.008, 0.02);
    floor.material = floorMat;

    // ── Floor Sigil Rings ────────────────────────────────────
    const sigilColors = [
      new BABYLON.Color3(0.45, 0.18, 0.65),
      new BABYLON.Color3(0.28, 0.10, 0.40),
      new BABYLON.Color3(0.18, 0.06, 0.28),
      new BABYLON.Color3(0.12, 0.04, 0.18),
    ];
    [8.5, 6, 4, 2.5].forEach((d, i) => {
      const ring = BABYLON.MeshBuilder.CreateTorus(
        `ring${i}`, { diameter: d, thickness: 0.045, tessellation: 72 }, scene,
      );
      ring.position.y = 0.02;
      const mat = new BABYLON.StandardMaterial(`ringMat${i}`, scene);
      mat.emissiveColor = sigilColors[i];
      ring.material = mat;
      // Slow rotation via render hook (stored on mesh metadata)
      ring.metadata = { rotDir: i % 2 === 0 ? 1 : -1, rotSpeed: 0.003 + i * 0.002 };
    });

    // Six-pointed star lines on the floor
    for (let v = 0; v < 6; v++) {
      const angle = (v * Math.PI) / 3;
      const x2 = Math.cos(angle) * 4.2;
      const z2 = Math.sin(angle) * 4.2;
      const line = BABYLON.MeshBuilder.CreateLines(`starLine${v}`, {
        points: [new BABYLON.Vector3(0, 0.02, 0), new BABYLON.Vector3(x2, 0.02, z2)],
      }, scene);
      line.color = new BABYLON.Color3(0.22, 0.08, 0.35);
      line.alpha = 0.6;
    }

    // ── Sin Lights (all off initially) ───────────────────────
    (["wrath", "sloth", "greed", "envy"] as SinKey[]).forEach((sin) => {
      const cfg = SIN_CFG[sin];
      const light = new BABYLON.PointLight(`${sin}L`, cfg.pos.clone(), scene);
      light.position.y = 5;
      light.diffuse = cfg.c3;
      light.specular = cfg.c3;
      light.intensity = 0;
      lights.current[sin] = light;
    });

    // ── Card Meshes ───────────────────────────────────────────
    (["wrath", "sloth", "greed", "envy"] as SinKey[]).forEach((sin) => {
      const cfg = SIN_CFG[sin];

      // Main card body
      const card = BABYLON.MeshBuilder.CreateBox(`${sin}Card`, { width: 1.55, height: 0.05, depth: 2.35 }, scene);
      card.position = cfg.pos.clone();
      card.position.y = 22; // above the visible area initially
      card.isVisible = false;

      const cardMat = new BABYLON.StandardMaterial(`${sin}CardMat`, scene);
      cardMat.emissiveColor = cfg.c3.scale(0.7);
      cardMat.diffuseColor  = cfg.c3.scale(0.2);
      cardMat.specularColor = cfg.c3;
      card.material = cardMat;

      // Glowing border frame (slightly larger, parented to card)
      const border = BABYLON.MeshBuilder.CreateBox(`${sin}Border`, { width: 1.72, height: 0.02, depth: 2.52 }, scene);
      const borderMat = new BABYLON.StandardMaterial(`${sin}BorderMat`, scene);
      borderMat.emissiveColor = cfg.c3;
      border.material = borderMat;
      border.parent = card;
      border.position = new BABYLON.Vector3(0, -0.025, 0);

      // Central symbol disc
      const disc = BABYLON.MeshBuilder.CreateCylinder(`${sin}Disc`, { diameter: 0.9, height: 0.06, tessellation: 32 }, scene);
      const discMat = new BABYLON.StandardMaterial(`${sin}DiscMat`, scene);
      discMat.emissiveColor = cfg.c3.scale(1.2);
      disc.material = discMat;
      disc.parent = card;
      disc.position = new BABYLON.Vector3(0, 0.05, 0);

      cards.current[sin] = card;
    });

    // ── Particle Systems ─────────────────────────────────────
    (["wrath", "sloth", "greed", "envy"] as SinKey[]).forEach((sin) => {
      const cfg = SIN_CFG[sin];
      const ps = new BABYLON.ParticleSystem(`${sin}Ps`, 300, scene);
      ps.emitter = cfg.pos.clone();
      const emitType = new BABYLON.SphereParticleEmitter(2);
      ps.particleEmitterType = emitType;
      ps.color1 = cfg.c4a;
      ps.color2 = cfg.c4b;
      ps.colorDead = new BABYLON.Color4(0, 0, 0, 0);
      ps.minSize = 0.04;
      ps.maxSize = sin === "greed" ? 0.12 : 0.10;
      ps.minLifeTime = sin === "sloth" ? 3 : 1.2;
      ps.maxLifeTime = sin === "sloth" ? 7 : 3;
      ps.emitRate = 0; // activated on reveal
      ps.gravity = new BABYLON.Vector3(0, sin === "sloth" ? 0.06 : 0.25, 0);
      ps.minEmitPower = sin === "sloth" ? 0.2 : 0.8;
      ps.maxEmitPower = sin === "sloth" ? 0.6 : 2.5;
      ps.start();
      parts.current[sin] = ps;
    });

    // Convergence explosion particles
    const exPs = new BABYLON.ParticleSystem("explosion", 1500, scene);
    exPs.emitter = new BABYLON.Vector3(0, 2.5, 0);
    exPs.createSphereEmitter(0.15);
    // Cycle through all four sin colors
    exPs.color1 = new BABYLON.Color4(1.0, 0.18, 0.05, 1);
    exPs.color2 = new BABYLON.Color4(0.08, 0.88, 0.28, 1);
    exPs.colorDead = new BABYLON.Color4(0, 0, 0, 0);
    exPs.minSize = 0.08;
    exPs.maxSize = 0.35;
    exPs.minLifeTime = 0.4;
    exPs.maxLifeTime = 2.5;
    exPs.emitRate = 0;
    exPs.gravity = new BABYLON.Vector3(0, -0.8, 0);
    exPs.minEmitPower = 4;
    exPs.maxEmitPower = 12;
    exPs.start();
    parts.current.explosion = exPs;

    // Ambient dark wisps (always present)
    const ambPs = new BABYLON.ParticleSystem("ambPs", 200, scene);
    ambPs.emitter = new BABYLON.Vector3(0, 0, 0);
    const ambEmit = new BABYLON.SphereParticleEmitter(8);
    ambPs.particleEmitterType = ambEmit;
    ambPs.color1 = new BABYLON.Color4(0.3, 0.1, 0.5, 0.25);
    ambPs.color2 = new BABYLON.Color4(0.5, 0.1, 0.7, 0.15);
    ambPs.colorDead = new BABYLON.Color4(0, 0, 0, 0);
    ambPs.minSize = 0.06;
    ambPs.maxSize = 0.18;
    ambPs.minLifeTime = 5;
    ambPs.maxLifeTime = 10;
    ambPs.emitRate = 30;
    ambPs.gravity = new BABYLON.Vector3(0, 0.05, 0);
    ambPs.minEmitPower = 0.03;
    ambPs.maxEmitPower = 0.12;
    ambPs.start();

    // ── Render Loop ───────────────────────────────────────────
    let frameIdx = 0;
    scene.registerAfterRender(() => {
      frameIdx++;
      const t = frameIdx * 0.016;
      const orbit = orbitRef.current;

      // Rotate sigil rings
      scene.meshes.forEach((m) => {
        if (m.metadata?.rotSpeed != null) {
          m.rotation.y += m.metadata.rotSpeed * m.metadata.rotDir;
        }
      });

      if (orbit.active) {
        orbit.angle += orbit.speed;
        if (orbit.collapse) {
          orbit.radius = Math.max(0.1, orbit.radius - orbit.speed * 9);
        }
        const r = orbit.radius;

        (["wrath", "sloth", "greed", "envy"] as SinKey[]).forEach((sin, i) => {
          const card = cards.current[sin];
          const light = lights.current[sin];
          if (!card || !card.isVisible) return;
          const a = orbit.angle + (i * Math.PI) / 2;
          card.position.x = Math.cos(a) * r;
          card.position.z = Math.sin(a) * r;
          card.position.y = 2.5 + Math.sin(t * 2 + i) * 0.08;
          card.rotation.y = a + Math.PI / 2;
          if (light) {
            light.position.x = card.position.x;
            light.position.z = card.position.z;
            light.position.y = 5;
          }
        });

        // When fully collapsed — trigger explosion then hide cards
        if (orbit.collapse && r < 0.2 && orbit.active) {
          orbit.active = false;
          const ep = parts.current.explosion;
          if (ep) {
            ep.emitRate = 600;
            setTimeout(() => { if (ep) ep.emitRate = 0; }, 600);
          }
          // Flash all sin lights bright then off
          (["wrath", "sloth", "greed", "envy"] as SinKey[]).forEach((sin) => {
            const l = lights.current[sin];
            if (l) {
              l.intensity = 8;
              setTimeout(() => { if (l) l.intensity = 0; }, 400);
            }
          });
          // Hide cards
          (["wrath", "sloth", "greed", "envy"] as SinKey[]).forEach((sin) => {
            const c = cards.current[sin];
            if (c) c.isVisible = false;
          });
        }
      } else {
        // Individual floating when cards are displayed solo
        (["wrath", "sloth", "greed", "envy"] as SinKey[]).forEach((sin, i) => {
          const card = cards.current[sin];
          if (!card || !card.isVisible) return;
          card.position.y = 2.5 + Math.sin(t * 0.7 + i * 1.6) * 0.15;
          card.rotation.y = Math.sin(t * 0.22 + i * 0.8) * 0.08;
        });
      }
    });

    engine.runRenderLoop(() => scene.render());

    const handleResize = () => engine.resize();
    window.addEventListener("resize", handleResize);

    setReady(true);

    return () => {
      window.removeEventListener("resize", handleResize);
      timersRef.current.forEach(clearTimeout);
      scene.dispose();
      engine.dispose();
    };
  }, []);

  // ── Cinematic Timeline ────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;

    // Helpers --------------------------------------------------
    function moveCamera(
      alpha: number, beta: number, radius: number,
      durationMs: number,
      easingOverride?: BABYLON.EasingFunction,
    ) {
      const cam = cameraRef.current;
      const scn = sceneRef.current;
      if (!cam || !scn) return;
      const frames = Math.round((durationMs / 1000) * 60);
      const ease = easingOverride ?? (() => {
        const e = new BABYLON.CubicEase();
        e.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        return e;
      })();
      scn.beginDirectAnimation(cam, [
        buildCamAnim("alpha",  cam.alpha,  alpha,  frames, ease),
        buildCamAnim("beta",   cam.beta,   beta,   frames, ease),
        buildCamAnim("radius", cam.radius, radius, frames, ease),
      ], 0, frames, false);
    }

    function revealCard(sin: SinKey) {
      const scn = sceneRef.current;
      const card  = cards.current[sin];
      const light = lights.current[sin];
      const ps    = parts.current[sin];
      if (!scn || !card) return;

      const cfg = SIN_CFG[sin];
      card.isVisible = true;
      card.position.x = cfg.pos.x;
      card.position.z = cfg.pos.z;
      card.position.y = 20;

      // Drop animation with sin-specific easing
      const dropAnim = new BABYLON.Animation(
        `${sin}Drop`, "position.y", 60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
      );
      dropAnim.setEasingFunction(cfg.easing());
      dropAnim.setKeys([{ frame: 0, value: 20 }, { frame: 40, value: 2.5 }]);
      scn.beginDirectAnimation(card, [dropAnim], 0, 40, false);

      // Light burst then settle
      if (light) {
        light.intensity = 5;
        t1(() => { if (light) light.intensity = 2.2; }, 300);
      }

      // Particle burst
      if (ps) {
        ps.emitRate = 100;
        t1(() => { if (ps) ps.emitRate = 35; }, 700);
      }
    }

    function t1(fn: () => void, ms: number): number {
      const id = window.setTimeout(fn, ms);
      timersRef.current.push(id);
      return id;
    }

    // ── Schedule ──────────────────────────────────────────────

    // 0.0s — Intro
    setPhase("intro");
    moveCamera(-Math.PI / 2, 1.1, 11, 3000);

    // 3.0s — WRATH
    t1(() => {
      setPhase("wrath");
      revealCard("wrath");
      moveCamera(-Math.PI * 0.38, 0.76, 13, 2800);
    }, 3000);

    // 6.5s — SLOTH
    t1(() => {
      setPhase("sloth");
      revealCard("sloth");
      moveCamera(Math.PI * 0.08, 0.83, 13, 2800);
    }, 6500);

    // 10.0s — GREED
    t1(() => {
      setPhase("greed");
      revealCard("greed");
      moveCamera(Math.PI * 0.55, 0.70, 12.5, 2800);
    }, 10000);

    // 13.5s — ENVY
    t1(() => {
      setPhase("envy");
      revealCard("envy");
      moveCamera(Math.PI * 1.05, 0.78, 13, 2800);
    }, 13500);

    // 17.0s — CONVERGENCE — all cards orbit
    t1(() => {
      setPhase("convergence");
      orbitRef.current.active   = true;
      orbitRef.current.angle    = 0;
      orbitRef.current.speed    = 0.009;
      orbitRef.current.radius   = 5;
      orbitRef.current.collapse = false;

      // Ramp up all lights + particles
      (["wrath", "sloth", "greed", "envy"] as SinKey[]).forEach((sin) => {
        const l = lights.current[sin]; if (l) l.intensity = 3.5;
        const p = parts.current[sin];  if (p) p.emitRate = 70;
      });
      moveCamera(Math.PI * 1.5, 0.44, 24, 3200);
    }, 17000);

    // 20.5s — Speed up orbit
    t1(() => {
      orbitRef.current.speed = 0.028;
      (["wrath", "sloth", "greed", "envy"] as SinKey[]).forEach((sin) => {
        const p = parts.current[sin]; if (p) p.emitRate = 110;
      });
    }, 20500);

    // 22.0s — Start collapse
    t1(() => {
      orbitRef.current.collapse = true;
      orbitRef.current.speed    = 0.05;
    }, 22000);

    // 23.0s — TITLE after explosion
    t1(() => {
      setPhase("title");
      // Kill all sin particles
      (["wrath", "sloth", "greed", "envy"] as SinKey[]).forEach((sin) => {
        const p = parts.current[sin]; if (p) p.emitRate = 0;
      });
      // Slow majestic camera
      moveCamera(Math.PI * 1.55, 0.36, 30, 3500);
    }, 23000);

    // 26.0s — CTA
    t1(() => setPhase("cta"), 26000);
  }, [ready]);

  // ── Overlay Content ───────────────────────────────────────────
  const content = PHASE_TEXT[phase];

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none">

      {/* Babylon canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Film grain CSS overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 10,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.025,
          mixBlendMode: "screen",
        }}
      />

      {/* Cinematic letterbox bars */}
      <div className="absolute inset-x-0 top-0 z-20 pointer-events-none" style={{ height: "7.5vh", background: "#000" }} />
      <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none" style={{ height: "7.5vh", background: "#000" }} />

      {/* Phase text */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none px-6">
        <AnimatePresence mode="wait">
          {content && (
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -18, filter: "blur(4px)" }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <h1
                className="font-black tracking-widest mb-3"
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: phase === "title" || phase === "cta" ? "clamp(3rem, 8vw, 7rem)" : "clamp(2.5rem, 6vw, 5.5rem)",
                  color: content.hex,
                  textShadow: [
                    `0 0 20px ${content.hex}bb`,
                    `0 0 50px ${content.hex}66`,
                    `0 0 90px ${content.hex}33`,
                    "0 2px 8px rgba(0,0,0,0.9)",
                  ].join(", "),
                  letterSpacing: phase === "intro" ? "0.06em" : "0.22em",
                }}
              >
                {content.title}
              </h1>

              {content.sub && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55, duration: 0.9 }}
                  className="text-white/50 uppercase tracking-[0.3em]"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(0.85rem, 2vw, 1.35rem)",
                    textShadow: "0 1px 6px rgba(0,0,0,0.8)",
                  }}
                >
                  {content.sub}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CTA button */}
      <AnimatePresence>
        {phase === "cta" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-40 flex justify-center"
            style={{ bottom: "13vh", left: 0, right: 0 }}
          >
            <button
              onClick={() => setLocation("/")}
              style={{
                fontFamily: "'Cinzel', serif",
                background: "linear-gradient(135deg, oklch(0.35 0.18 15), oklch(0.18 0.12 280))",
                border: "2px solid #e8c870",
                color: "#e8c870",
                padding: "1rem 3rem",
                fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
                letterSpacing: "0.28em",
                fontWeight: 900,
                textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: "0 0 24px #e8c87055, 0 0 60px #e8c87022, inset 0 1px 0 #e8c87033",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 40px #e8c870aa, 0 0 90px #e8c87044, inset 0 1px 0 #e8c87055";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 24px #e8c87055, 0 0 60px #e8c87022, inset 0 1px 0 #e8c87033";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              Enter the Abyss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip button (always visible) */}
      <button
        onClick={() => setLocation("/")}
        className="absolute z-50 text-white/25 hover:text-white/55 transition-colors text-sm tracking-[0.25em] uppercase"
        style={{
          top: "10vh",
          right: "1.5rem",
          fontFamily: "'Cormorant Garamond', serif",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        Skip ›
      </button>

      {/* Loading fade-in veil */}
      {phase === "loading" && (
        <div className="absolute inset-0 z-50 bg-black" />
      )}
    </div>
  );
}
