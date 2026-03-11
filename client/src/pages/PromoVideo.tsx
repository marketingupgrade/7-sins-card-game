/**
 * PromoVideo — Epic Cinematic Promo for 7 Deadly Sins Card Game
 *
 * 42-second Babylon.js cinematic covering all seven sin factions with:
 *   • Per-sin card reveals with custom Babylon easing
 *   • Camera target animation for dramatic framing on each card
 *   • Heptagonal (7-point) card arrangement that seamlessly converts
 *     into the orbit phase with zero position jump
 *   • Pride's blinding white-light flash reveal
 *   • 7 distinct sin-coloured particle systems
 *   • Convergence → acceleration → collapse → 1500-particle detonation
 *
 * Timeline:
 *    0.0s  Intro          Cathedral materialises
 *    2.0s  WRATH          Slam (BounceEase)
 *    4.5s  SLOTH          Drift (SineEase)
 *    7.0s  GREED          Snap (BackEase)
 *    9.5s  ENVY           Spring (ElasticEase)
 *   12.0s  PRIDE          Blinding drop (ExponentialEase) + white flash
 *   14.5s  LUST           Pulse (SineEase slow)
 *   17.0s  GLUTTONY       Heavy thud (PowerEase)
 *   19.5s  CONVERGENCE    All 7 orbit the sigil
 *   23.0s  ACCELERATION   3× speed + storm
 *   25.0s  COLLAPSE       Spiral inward → detonation
 *   26.0s  TITLE          "7 DEADLY SINS"
 *   29.0s  CTA            "Enter the Abyss"
 */

import { useEffect, useRef, useState } from "react";
import * as BABYLON from "@babylonjs/core";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

// ─── Maths ────────────────────────────────────────────────────
const TAU_OVER_7 = (2 * Math.PI) / 7;

/** Heptagonal orbit x for sin index i at orbit radius r and base angle a */
const hx = (i: number, r: number, a = 0) => Math.cos(a + i * TAU_OVER_7) * r;
const hz = (i: number, r: number, a = 0) => Math.sin(a + i * TAU_OVER_7) * r;

// ─── Sin config (all colour values from origin/main implementation) ───────────
// Babylon RGB values verified against GameBoardBabylonScene.tsx SIN_RGB map.
// Heptagonal reveal positions match orbit positions at angle=0 so the
// convergence transition is seamless.

const SIN_CFG = {
  wrath: {
    c3:  new BABYLON.Color3(0.90, 0.15, 0.10),
    c4a: new BABYLON.Color4(1.00, 0.18, 0.05, 0.95),
    c4b: new BABYLON.Color4(0.80, 0.40, 0.08, 0.60),
    x: hx(0, 5), z: hz(0, 5),           // i=0  →  (5.00, 0.00)
    label: "WRATH", latin: "Ira",
    tagline: "Consume them all in flame",
    hex: "#e8200e",
    easing: () => { const e = new BABYLON.BounceEase(1, 4); e.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT); return e; },
    dropFrames: 35,
    cam: { alpha: -0.55 * Math.PI, beta: 0.72, radius: 12, tx: 3.5, ty: 2.0, tz: 0.0 },
  },
  sloth: {
    c3:  new BABYLON.Color3(0.45, 0.20, 0.75),
    c4a: new BABYLON.Color4(0.45, 0.12, 0.85, 0.85),
    c4b: new BABYLON.Color4(0.60, 0.08, 0.90, 0.50),
    x: hx(1, 5), z: hz(1, 5),           // i=1  →  (3.12, 3.90)
    label: "SLOTH", latin: "Acedia",
    tagline: "Let them wither in the dark",
    hex: "#9055e8",
    easing: () => { const e = new BABYLON.SineEase(); e.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT); return e; },
    dropFrames: 55,
    cam: { alpha: 0.12 * Math.PI, beta: 0.78, radius: 12, tx: 2.0, ty: 2.0, tz: 2.5 },
  },
  greed: {
    c3:  new BABYLON.Color3(0.85, 0.70, 0.10),
    c4a: new BABYLON.Color4(1.00, 0.82, 0.12, 0.95),
    c4b: new BABYLON.Color4(0.90, 0.55, 0.08, 0.60),
    x: hx(2, 5), z: hz(2, 5),           // i=2  →  (-1.12, 4.87)
    label: "GREED", latin: "Avaritia",
    tagline: "Nothing will ever be enough",
    hex: "#e8b80e",
    easing: () => { const e = new BABYLON.BackEase(2); e.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT); return e; },
    dropFrames: 38,
    cam: { alpha: 0.55 * Math.PI, beta: 0.70, radius: 13, tx: -0.5, ty: 2.0, tz: 3.0 },
  },
  envy: {
    c3:  new BABYLON.Color3(0.10, 0.75, 0.40),
    c4a: new BABYLON.Color4(0.10, 0.92, 0.32, 0.95),
    c4b: new BABYLON.Color4(0.04, 0.60, 0.18, 0.60),
    x: hx(3, 5), z: hz(3, 5),           // i=3  →  (-4.50, 2.16)
    label: "ENVY", latin: "Invidia",
    tagline: "Covet everything they possess",
    hex: "#15c840",
    easing: () => { const e = new BABYLON.ElasticEase(1, 3); e.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT); return e; },
    dropFrames: 40,
    cam: { alpha: 0.82 * Math.PI, beta: 0.75, radius: 12, tx: -3.0, ty: 2.0, tz: 1.5 },
  },
  pride: {
    c3:  new BABYLON.Color3(0.95, 0.95, 0.95),
    c4a: new BABYLON.Color4(1.00, 1.00, 1.00, 0.90),
    c4b: new BABYLON.Color4(0.90, 0.90, 0.95, 0.50),
    x: hx(4, 5), z: hz(4, 5),           // i=4  →  (-4.50, -2.16)
    label: "PRIDE", latin: "Superbia",
    tagline: "Perfection is your birthright",
    hex: "#f0f0f0",
    easing: () => { const e = new BABYLON.ExponentialEase(); e.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT); return e; },
    dropFrames: 30,
    cam: { alpha: 1.18 * Math.PI, beta: 0.68, radius: 14, tx: -3.0, ty: 2.0, tz: -1.5 },
  },
  lust: {
    c3:  new BABYLON.Color3(0.93, 0.28, 0.60),
    c4a: new BABYLON.Color4(0.95, 0.28, 0.62, 0.95),
    c4b: new BABYLON.Color4(0.80, 0.15, 0.50, 0.60),
    x: hx(5, 5), z: hz(5, 5),           // i=5  →  (-1.12, -4.87)
    label: "LUST", latin: "Luxuria",
    tagline: "Desire is the sweetest poison",
    hex: "#ee48a0",
    easing: () => { const e = new BABYLON.SineEase(); e.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT); return e; },
    dropFrames: 50,
    cam: { alpha: 1.55 * Math.PI, beta: 0.74, radius: 12, tx: -0.5, ty: 2.0, tz: -3.0 },
  },
  gluttony: {
    c3:  new BABYLON.Color3(0.70, 0.33, 0.04),
    c4a: new BABYLON.Color4(0.72, 0.34, 0.04, 0.95),
    c4b: new BABYLON.Color4(0.55, 0.25, 0.04, 0.60),
    x: hx(6, 5), z: hz(6, 5),           // i=6  →  (3.12, -3.90)
    label: "GLUTTONY", latin: "Gula",
    tagline: "The feast never ends, only grows",
    hex: "#c07020",
    easing: () => { const e = new BABYLON.PowerEase(3); e.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT); return e; },
    dropFrames: 40,
    cam: { alpha: 1.85 * Math.PI, beta: 0.72, radius: 12, tx: 2.0, ty: 2.0, tz: -2.5 },
  },
} as const;

type SinKey = keyof typeof SIN_CFG;
const ALL_SINS = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"] as SinKey[];

// ─── Phase definitions ────────────────────────────────────────
type Phase = "loading" | "intro" | SinKey | "convergence" | "title" | "cta";

const PHASE_TEXT: Record<Phase, { title: string; sub: string; micro?: string; hex: string } | null> = {
  loading:     null,
  intro:       { title: "Seven sins. One winner.", sub: "", hex: "#888888" },
  wrath:       { title: "WRATH",    micro: "Ira",      sub: SIN_CFG.wrath.tagline,    hex: SIN_CFG.wrath.hex    },
  sloth:       { title: "SLOTH",    micro: "Acedia",   sub: SIN_CFG.sloth.tagline,    hex: SIN_CFG.sloth.hex    },
  greed:       { title: "GREED",    micro: "Avaritia", sub: SIN_CFG.greed.tagline,    hex: SIN_CFG.greed.hex    },
  envy:        { title: "ENVY",     micro: "Invidia",  sub: SIN_CFG.envy.tagline,     hex: SIN_CFG.envy.hex     },
  pride:       { title: "PRIDE",    micro: "Superbia", sub: SIN_CFG.pride.tagline,    hex: SIN_CFG.pride.hex    },
  lust:        { title: "LUST",     micro: "Luxuria",  sub: SIN_CFG.lust.tagline,     hex: SIN_CFG.lust.hex     },
  gluttony:    { title: "GLUTTONY", micro: "Gula",     sub: SIN_CFG.gluttony.tagline, hex: SIN_CFG.gluttony.hex },
  convergence: { title: "Choose your corruption",  sub: "Seven paths to damnation", hex: "#c890ff" },
  title:       { title: "7 DEADLY SINS",           sub: "A Card Game of Dark Ambition", hex: "#e8c870" },
  cta:         { title: "7 DEADLY SINS",           sub: "Your damnation begins now",    hex: "#e8c870" },
};

// ─── Babylon animation helper ─────────────────────────────────
function anim(
  prop: string, from: number, to: number, frames: number,
  ease?: BABYLON.EasingFunction,
): BABYLON.Animation {
  const a = new BABYLON.Animation(
    `${prop}_${Date.now()}`, prop, 60,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
  );
  const e = ease ?? (() => {
    const ce = new BABYLON.CubicEase();
    ce.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    return ce;
  })();
  a.setEasingFunction(e);
  a.setKeys([{ frame: 0, value: from }, { frame: frames, value: to }]);
  return a;
}

// ─── Component ────────────────────────────────────────────────
export default function PromoVideo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef  = useRef<BABYLON.Scene | null>(null);
  const cameraRef = useRef<BABYLON.ArcRotateCamera | null>(null);
  const [phase, setPhase]           = useState<Phase>("loading");
  const [prideFlash, setPrideFlash] = useState(false);
  const [ready, setReady]           = useState(false);
  const [, setLocation] = useLocation();

  const cardsRef  = useRef<Partial<Record<SinKey, BABYLON.Mesh>>>({});
  const lightsRef = useRef<Partial<Record<SinKey, BABYLON.PointLight>>>({});
  const partsRef  = useRef<Partial<Record<SinKey | "explosion", BABYLON.ParticleSystem>>>({});
  const timers    = useRef<number[]>([]);
  const orbitRef  = useRef({ active: false, angle: 0, speed: 0.008, radius: 5, collapse: false });

  // ── Scene Setup ─────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true, { antialias: true });
    const scene  = new BABYLON.Scene(engine);
    sceneRef.current = scene;
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

    // Camera — starts at dramatic near-floor angle
    const camera = new BABYLON.ArcRotateCamera(
      "cam", -Math.PI / 2, 1.22, 10,
      new BABYLON.Vector3(0, 2, 0), scene,
    );
    cameraRef.current = camera;

    // Post-processing
    const pipeline = new BABYLON.DefaultRenderingPipeline("pp", true, scene, [camera]);
    pipeline.bloomEnabled   = true;
    pipeline.bloomWeight    = 1.5;
    pipeline.bloomThreshold = 0.04;
    pipeline.bloomKernel    = 128;
    pipeline.fxaaEnabled    = true;
    try {
      pipeline.chromaticAberrationEnabled = true;
      pipeline.chromaticAberration.aberrationAmount = 5;
      const pp = pipeline as any;
      pp.vignetteEnabled = true;
      pp.vignette.vignetteWeight = 5;
      pp.vignette.vignetteColor  = new BABYLON.Color4(0, 0, 0, 1);
    } catch (_) { /* optional */ }

    const glow = new BABYLON.GlowLayer("glow", scene);
    glow.intensity = 2.0;

    // Ambient
    const amb = new BABYLON.HemisphericLight("amb", new BABYLON.Vector3(0, 1, 0), scene);
    amb.intensity = 0.05;
    amb.diffuse   = new BABYLON.Color3(0.10, 0.06, 0.18);

    // ── Floor ────────────────────────────────────────────────
    const floor = BABYLON.MeshBuilder.CreateGround("floor", { width: 24, height: 24 }, scene);
    const fm = new BABYLON.StandardMaterial("fm", scene);
    fm.diffuseColor  = new BABYLON.Color3(0.025, 0.018, 0.04);
    fm.specularColor = new BABYLON.Color3(0.06, 0.04, 0.10);
    fm.emissiveColor = new BABYLON.Color3(0.008, 0.005, 0.016);
    floor.material = fm;

    // Sigil rings — 4 concentric, alternating direction
    const ringColors = [
      new BABYLON.Color3(0.48, 0.18, 0.68),
      new BABYLON.Color3(0.30, 0.10, 0.44),
      new BABYLON.Color3(0.18, 0.06, 0.28),
      new BABYLON.Color3(0.10, 0.03, 0.16),
    ];
    [9.0, 6.5, 4.5, 2.8].forEach((d, i) => {
      const ring = BABYLON.MeshBuilder.CreateTorus(
        `ring${i}`, { diameter: d, thickness: 0.04, tessellation: 80 }, scene,
      );
      ring.position.y = 0.02;
      const rm = new BABYLON.StandardMaterial(`rm${i}`, scene);
      rm.emissiveColor = ringColors[i];
      ring.material = rm;
      ring.metadata = { rotDir: i % 2 === 0 ? 1 : -1, rotSpeed: 0.003 + i * 0.002 };
    });

    // 7-pointed star lines (heptagram)
    for (let v = 0; v < 7; v++) {
      const a1 = (v / 7) * Math.PI * 2;
      const a2 = ((v + 2) / 7) * Math.PI * 2; // skip-2 for heptagram
      const line = BABYLON.MeshBuilder.CreateLines(`star${v}`, {
        points: [
          new BABYLON.Vector3(Math.cos(a1) * 4.8, 0.02, Math.sin(a1) * 4.8),
          new BABYLON.Vector3(Math.cos(a2) * 4.8, 0.02, Math.sin(a2) * 4.8),
        ],
      }, scene);
      line.color = new BABYLON.Color3(0.22, 0.08, 0.36);
      line.alpha  = 0.55;
    }

    // ── Sin Lights (off initially) ───────────────────────────
    ALL_SINS.forEach((sin) => {
      const cfg   = SIN_CFG[sin];
      const light = new BABYLON.PointLight(`${sin}L`, new BABYLON.Vector3(cfg.x, 5, cfg.z), scene);
      light.diffuse   = cfg.c3;
      light.specular  = cfg.c3;
      light.intensity = 0;
      lightsRef.current[sin] = light;
    });

    // Central convergence light
    const centerLight = new BABYLON.PointLight("centerL", new BABYLON.Vector3(0, 4, 0), scene);
    centerLight.diffuse   = new BABYLON.Color3(0.5, 0.3, 0.8);
    centerLight.intensity = 0;

    // ── Card Meshes ──────────────────────────────────────────
    ALL_SINS.forEach((sin) => {
      const cfg = SIN_CFG[sin];

      const card = BABYLON.MeshBuilder.CreateBox(`${sin}Card`, { width: 1.55, height: 0.06, depth: 2.35 }, scene);
      card.position.set(cfg.x, 22, cfg.z); // off-screen above, correct x/z already
      card.isVisible = false;

      const cm = new BABYLON.StandardMaterial(`${sin}CM`, scene);
      cm.emissiveColor = cfg.c3.scale(0.65);
      cm.diffuseColor  = cfg.c3.scale(0.18);
      cm.specularColor = cfg.c3;
      card.material = cm;

      // Glowing border frame
      const border = BABYLON.MeshBuilder.CreateBox(`${sin}Bd`, { width: 1.72, height: 0.025, depth: 2.52 }, scene);
      const bm = new BABYLON.StandardMaterial(`${sin}BM`, scene);
      bm.emissiveColor = cfg.c3.scale(1.1);
      border.material  = bm;
      border.parent    = card;
      border.position  = new BABYLON.Vector3(0, -0.028, 0);

      // Central disc emblem
      const disc = BABYLON.MeshBuilder.CreateCylinder(`${sin}Disc`, { diameter: 0.85, height: 0.07, tessellation: 36 }, scene);
      const dm = new BABYLON.StandardMaterial(`${sin}DM`, scene);
      dm.emissiveColor = cfg.c3.scale(1.3);
      disc.material    = dm;
      disc.parent      = card;
      disc.position    = new BABYLON.Vector3(0, 0.055, 0);

      cardsRef.current[sin] = card;
    });

    // ── Particle Systems ─────────────────────────────────────
    ALL_SINS.forEach((sin) => {
      const cfg = SIN_CFG[sin];
      const ps  = new BABYLON.ParticleSystem(`${sin}Ps`, 300, scene);
      ps.emitter = new BABYLON.Vector3(cfg.x, 1.5, cfg.z);
      const et = new BABYLON.SphereParticleEmitter(1.8);
      ps.particleEmitterType = et;
      ps.color1    = cfg.c4a;
      ps.color2    = cfg.c4b;
      ps.colorDead = new BABYLON.Color4(0, 0, 0, 0);
      ps.minSize   = 0.04; ps.maxSize   = sin === "greed" ? 0.13 : 0.10;
      ps.minLifeTime = sin === "sloth" ? 3.5 : 1.2;
      ps.maxLifeTime = sin === "sloth" ? 8.0 : 3.0;
      ps.emitRate  = 0;
      ps.gravity   = new BABYLON.Vector3(0, sin === "sloth" ? 0.06 : 0.28, 0);
      ps.minEmitPower = sin === "sloth" ? 0.15 : 0.7;
      ps.maxEmitPower = sin === "sloth" ? 0.55 : 2.5;
      ps.start();
      partsRef.current[sin] = ps;
    });

    // Ambient dark wisps
    const ambPs = new BABYLON.ParticleSystem("ambPs", 200, scene);
    ambPs.emitter = BABYLON.Vector3.Zero();
    const aet = new BABYLON.SphereParticleEmitter(9);
    ambPs.particleEmitterType = aet;
    ambPs.color1    = new BABYLON.Color4(0.28, 0.10, 0.50, 0.22);
    ambPs.color2    = new BABYLON.Color4(0.45, 0.10, 0.70, 0.12);
    ambPs.colorDead = new BABYLON.Color4(0, 0, 0, 0);
    ambPs.minSize = 0.06; ambPs.maxSize = 0.18;
    ambPs.minLifeTime = 5; ambPs.maxLifeTime = 12;
    ambPs.emitRate = 25;
    ambPs.gravity  = new BABYLON.Vector3(0, 0.04, 0);
    ambPs.minEmitPower = 0.02; ambPs.maxEmitPower = 0.10;
    ambPs.start();

    // Convergence explosion
    const exPs = new BABYLON.ParticleSystem("exPs", 1500, scene);
    exPs.emitter   = new BABYLON.Vector3(0, 2.5, 0);
    exPs.createSphereEmitter(0.12);
    exPs.color1    = new BABYLON.Color4(1.00, 0.20, 0.05, 1);
    exPs.color2    = new BABYLON.Color4(0.95, 0.95, 0.95, 1);   // includes pride white
    exPs.colorDead = new BABYLON.Color4(0, 0, 0, 0);
    exPs.minSize   = 0.08; exPs.maxSize   = 0.40;
    exPs.minLifeTime = 0.3; exPs.maxLifeTime = 2.5;
    exPs.emitRate  = 0;
    exPs.gravity   = new BABYLON.Vector3(0, -0.9, 0);
    exPs.minEmitPower = 4; exPs.maxEmitPower = 14;
    exPs.start();
    partsRef.current.explosion = exPs;

    // ── Render Loop ──────────────────────────────────────────
    let frame = 0;
    scene.registerAfterRender(() => {
      frame++;
      const t     = frame * 0.016;
      const orbit = orbitRef.current;

      // Rotate sigil rings
      scene.meshes.forEach((m) => {
        if (m.metadata?.rotSpeed) m.rotation.y += m.metadata.rotSpeed * m.metadata.rotDir;
      });

      if (orbit.active) {
        orbit.angle += orbit.speed;
        if (orbit.collapse) orbit.radius = Math.max(0.08, orbit.radius - orbit.speed * 10);

        ALL_SINS.forEach((sin, i) => {
          const card  = cardsRef.current[sin];
          const light = lightsRef.current[sin];
          if (!card?.isVisible) return;
          const a = orbit.angle + i * TAU_OVER_7;
          card.position.x = Math.cos(a) * orbit.radius;
          card.position.z = Math.sin(a) * orbit.radius;
          card.position.y = 2.5 + Math.sin(t * 2.2 + i * 0.9) * 0.07;
          card.rotation.y = a + Math.PI / 2;
          if (light) {
            light.position.x = card.position.x;
            light.position.z = card.position.z;
          }
          // Move each sin's particle emitter with the card
          const ps = partsRef.current[sin];
          if (ps) (ps.emitter as BABYLON.Vector3).set(card.position.x, 1.5, card.position.z);
        });

        // Explosion trigger when fully collapsed
        if (orbit.collapse && orbit.radius <= 0.1 && orbit.active) {
          orbit.active = false;
          const ep = partsRef.current.explosion;
          if (ep) {
            ep.emitRate = 700;
            window.setTimeout(() => { if (ep) ep.emitRate = 0; }, 500);
          }
          ALL_SINS.forEach((sin) => {
            const l = lightsRef.current[sin];
            if (l) {
              l.intensity = 9;
              window.setTimeout(() => { if (l) l.intensity = 0; }, 350);
            }
            const c = cardsRef.current[sin];
            if (c) c.isVisible = false;
          });
          centerLight.intensity = 0;
        }
      } else {
        // Individual float when not orbiting
        ALL_SINS.forEach((sin, i) => {
          const card = cardsRef.current[sin];
          if (!card?.isVisible) return;
          card.position.y = 2.5 + Math.sin(t * 0.7 + i * 1.55) * 0.15;
          card.rotation.y = Math.sin(t * 0.22 + i * 0.8) * 0.08;
        });
        // Center light pulses with orbit
        centerLight.intensity = 0;
      }
    });

    engine.runRenderLoop(() => scene.render());
    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);
    setReady(true);

    return () => {
      window.removeEventListener("resize", onResize);
      timers.current.forEach(clearTimeout);
      scene.dispose();
      engine.dispose();
    };
  }, []);

  // ── Timeline ──────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;

    function t1(fn: () => void, ms: number) {
      const id = window.setTimeout(fn, ms);
      timers.current.push(id);
    }

    function moveCamera(
      alpha: number, beta: number, radius: number,
      tx: number, ty: number, tz: number,
      durationMs: number,
    ) {
      const cam = cameraRef.current;
      const scn = sceneRef.current;
      if (!cam || !scn) return;
      const frames = Math.round((durationMs / 1000) * 60);
      scn.beginDirectAnimation(cam, [
        anim("alpha",    cam.alpha,    alpha,  frames),
        anim("beta",     cam.beta,     beta,   frames),
        anim("radius",   cam.radius,   radius, frames),
        anim("target.x", cam.target.x, tx,     frames),
        anim("target.y", cam.target.y, ty,     frames),
        anim("target.z", cam.target.z, tz,     frames),
      ], 0, frames, false);
    }

    function revealCard(sin: SinKey) {
      const scn   = sceneRef.current;
      const card  = cardsRef.current[sin];
      const light = lightsRef.current[sin];
      const ps    = partsRef.current[sin];
      if (!scn || !card) return;
      const cfg = SIN_CFG[sin];

      card.isVisible   = true;
      card.position.y  = 22;
      // x/z already correct from construction

      const drop = new BABYLON.Animation(
        `${sin}drop`, "position.y", 60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
      );
      drop.setEasingFunction(cfg.easing());
      drop.setKeys([{ frame: 0, value: 22 }, { frame: cfg.dropFrames, value: 2.5 }]);
      scn.beginDirectAnimation(card, [drop], 0, cfg.dropFrames, false);

      if (light) {
        light.intensity = 6;
        t1(() => { if (light) light.intensity = 2.5; }, 280);
      }
      if (ps) {
        ps.emitRate = 110;
        t1(() => { if (ps) ps.emitRate = 38; }, 650);
      }
    }

    // 0.0s — Intro
    setPhase("intro");
    moveCamera(-Math.PI / 2, 1.12, 10, 0, 2, 0, 2500);

    // 2.0s — WRATH
    t1(() => {
      setPhase("wrath");
      revealCard("wrath");
      const c = SIN_CFG.wrath.cam;
      moveCamera(c.alpha, c.beta, c.radius, c.tx, c.ty, c.tz, 2800);
    }, 2000);

    // 4.5s — SLOTH
    t1(() => {
      setPhase("sloth");
      revealCard("sloth");
      const c = SIN_CFG.sloth.cam;
      moveCamera(c.alpha, c.beta, c.radius, c.tx, c.ty, c.tz, 2800);
    }, 4500);

    // 7.0s — GREED
    t1(() => {
      setPhase("greed");
      revealCard("greed");
      const c = SIN_CFG.greed.cam;
      moveCamera(c.alpha, c.beta, c.radius, c.tx, c.ty, c.tz, 2800);
    }, 7000);

    // 9.5s — ENVY
    t1(() => {
      setPhase("envy");
      revealCard("envy");
      const c = SIN_CFG.envy.cam;
      moveCamera(c.alpha, c.beta, c.radius, c.tx, c.ty, c.tz, 2800);
    }, 9500);

    // 12.0s — PRIDE (with white flash)
    t1(() => {
      setPhase("pride");
      setPrideFlash(true);
      t1(() => setPrideFlash(false), 900);
      revealCard("pride");
      const c = SIN_CFG.pride.cam;
      moveCamera(c.alpha, c.beta, c.radius, c.tx, c.ty, c.tz, 2800);
    }, 12000);

    // 14.5s — LUST
    t1(() => {
      setPhase("lust");
      revealCard("lust");
      const c = SIN_CFG.lust.cam;
      moveCamera(c.alpha, c.beta, c.radius, c.tx, c.ty, c.tz, 2800);
    }, 14500);

    // 17.0s — GLUTTONY
    t1(() => {
      setPhase("gluttony");
      revealCard("gluttony");
      const c = SIN_CFG.gluttony.cam;
      moveCamera(c.alpha, c.beta, c.radius, c.tx, c.ty, c.tz, 2800);
    }, 17000);

    // 19.5s — CONVERGENCE
    t1(() => {
      setPhase("convergence");
      orbitRef.current = { active: true, angle: 0, speed: 0.009, radius: 5, collapse: false };
      ALL_SINS.forEach((sin) => {
        const l = lightsRef.current[sin]; if (l) l.intensity = 3.0;
        const p = partsRef.current[sin];  if (p) p.emitRate = 65;
      });
      moveCamera(Math.PI * 1.5, 0.43, 26, 0, 2, 0, 3500);
    }, 19500);

    // 23.0s — Accelerate
    t1(() => {
      orbitRef.current.speed = 0.030;
      ALL_SINS.forEach((sin) => {
        const l = lightsRef.current[sin]; if (l) l.intensity = 5.0;
        const p = partsRef.current[sin];  if (p) p.emitRate = 120;
      });
    }, 23000);

    // 25.0s — Collapse
    t1(() => {
      orbitRef.current.collapse = true;
      orbitRef.current.speed    = 0.055;
      ALL_SINS.forEach((sin) => {
        const p = partsRef.current[sin]; if (p) p.emitRate = 180;
      });
    }, 25000);

    // 26.0s — Title
    t1(() => {
      setPhase("title");
      ALL_SINS.forEach((sin) => {
        const p = partsRef.current[sin]; if (p) p.emitRate = 0;
      });
      moveCamera(Math.PI * 1.6, 0.34, 34, 0, 2, 0, 4000);
    }, 26000);

    // 29.0s — CTA
    t1(() => setPhase("cta"), 29000);
  }, [ready]);

  // ── Render ────────────────────────────────────────────────
  const content = PHASE_TEXT[phase];
  const isSinPhase = ALL_SINS.includes(phase as SinKey);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 10,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: 0.022, mixBlendMode: "screen",
      }} />

      {/* Pride white flash */}
      <AnimatePresence>
        {prideFlash && (
          <motion.div
            key="prideflash"
            initial={{ opacity: 0.95 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 15, background: "white" }}
          />
        )}
      </AnimatePresence>

      {/* Letterbox bars */}
      <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: "7.5vh", background: "#000", zIndex: 20 }} />
      <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: "7.5vh", background: "#000", zIndex: 20 }} />

      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-8" style={{ zIndex: 30 }}>
        <AnimatePresence mode="wait">
          {content && (
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0,  filter: "blur(0px)"  }}
              exit={{    opacity: 0, y: -18, filter: "blur(5px)"  }}
              transition={{ duration: 0.88, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              {/* Latin micro-label for sin phases */}
              {isSinPhase && content.micro && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-white/35 uppercase tracking-[0.45em] mb-2"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(0.6rem, 1.2vw, 0.85rem)",
                    letterSpacing: "0.5em",
                  }}
                >
                  {content.micro}
                </motion.p>
              )}

              {/* Main title */}
              <h1
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: phase === "title" || phase === "cta"
                    ? "clamp(3rem, 9vw, 8rem)"
                    : isSinPhase
                      ? "clamp(3.5rem, 8vw, 7rem)"
                      : "clamp(1.8rem, 4vw, 3.5rem)",
                  color: content.hex,
                  textShadow: [
                    `0 0 22px ${content.hex}cc`,
                    `0 0 55px ${content.hex}77`,
                    `0 0 100px ${content.hex}33`,
                    "0 2px 8px rgba(0,0,0,0.95)",
                  ].join(", "),
                  letterSpacing: phase === "intro" ? "0.06em" : "0.22em",
                  fontWeight: 900,
                  lineHeight: 1,
                  marginBottom: "0.5rem",
                }}
              >
                {content.title}
              </h1>

              {content.sub && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.52, duration: 0.9 }}
                  className="uppercase tracking-[0.28em] text-white/50"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(0.78rem, 1.8vw, 1.25rem)",
                    textShadow: "0 1px 6px rgba(0,0,0,0.85)",
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
            initial={{ opacity: 0, scale: 0.84, y: 18 }}
            animate={{ opacity: 1, scale: 1.00, y: 0  }}
            transition={{ delay: 1.0, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute flex justify-center"
            style={{ bottom: "13vh", left: 0, right: 0, zIndex: 40 }}
          >
            <button
              onClick={() => setLocation("/")}
              onMouseEnter={(e) => {
                const b = e.currentTarget as HTMLElement;
                b.style.boxShadow = "0 0 44px #e8c870cc, 0 0 90px #e8c87055, inset 0 1px 0 #e8c87066";
                b.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                const b = e.currentTarget as HTMLElement;
                b.style.boxShadow = "0 0 24px #e8c87066, 0 0 60px #e8c87022, inset 0 1px 0 #e8c87033";
                b.style.transform = "translateY(0)";
              }}
              style={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 900,
                fontSize: "clamp(0.95rem, 2.2vw, 1.25rem)",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#e8c870",
                padding: "1rem 3.5rem",
                background: "linear-gradient(135deg, oklch(0.28 0.16 15), oklch(0.14 0.10 280))",
                border: "2px solid #e8c870",
                boxShadow: "0 0 24px #e8c87066, 0 0 60px #e8c87022, inset 0 1px 0 #e8c87033",
                cursor: "pointer",
                transition: "all 0.25s ease",
              }}
            >
              Enter the Abyss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip */}
      <button
        onClick={() => setLocation("/")}
        style={{
          position: "absolute",
          top: "10vh",
          right: "1.5rem",
          zIndex: 50,
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "0.8rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.22)",
          background: "none",
          border: "none",
          cursor: "pointer",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.22)"; }}
      >
        Skip ›
      </button>
    </div>
  );
}
