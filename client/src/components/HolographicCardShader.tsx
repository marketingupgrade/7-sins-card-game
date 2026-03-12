/**
 * HolographicCardShader — WebGL holographic shimmer for epic/rare cards
 *
 * Creates a small Babylon.js canvas overlay that renders a holographic
 * rainbow shimmer effect. The shimmer reacts to mouse position for
 * a parallax holographic look (like a real foil card).
 *
 * Uses a simple fragment shader with time-based rainbow gradients
 * and mouse-reactive angle shifts — no NodeMaterial needed for this
 * effect, keeping the bundle lean.
 */

import { useEffect, useRef } from "react";
import type { SinType } from "@shared/gameTypes";

interface HolographicCardShaderProps {
  sin: SinType;
  intensity?: "rare" | "epic";
  className?: string;
}

const SIN_HUE_OFFSET: Record<string, number> = {
  wrath: 0.0,     // red-orange
  sloth: 0.75,    // purple
  greed: 0.15,    // gold
  envy: 0.35,     // green
  pride: 0.12,    // white-gold
  lust: 0.9,      // pink
  gluttony: 0.08, // amber
};

export default function HolographicCardShader({
  sin,
  intensity = "rare",
  className = "",
}: HolographicCardShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    // Vertex shader
    const vsSource = `
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    // Fragment shader — holographic rainbow with sin-specific hue
    const fsSource = `
      precision mediump float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uHueOffset;
      uniform float uIntensity;

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        // Holographic angle based on UV and mouse
        float angle = atan(vUv.y - uMouse.y, vUv.x - uMouse.x);
        float dist = length(vUv - uMouse);

        // Rainbow hue shifts with time and angle
        float hue = fract(uHueOffset + angle * 0.3 + dist * 1.5 + uTime * 0.15);

        // Shimmer bands
        float shimmer = sin((vUv.x + vUv.y) * 20.0 + uTime * 3.0) * 0.5 + 0.5;
        shimmer *= sin(vUv.x * 15.0 - uTime * 2.0) * 0.5 + 0.5;

        // Fresnel-like edge glow
        float edge = 1.0 - smoothstep(0.0, 0.5, abs(vUv.x - 0.5));
        edge *= 1.0 - smoothstep(0.0, 0.5, abs(vUv.y - 0.5));

        vec3 color = hsv2rgb(vec3(hue, 0.6, 1.0));
        float alpha = shimmer * edge * uIntensity * (0.15 + dist * 0.3);

        // Add sparkle points
        float sparkle = pow(sin(vUv.x * 50.0 + uTime * 5.0) * sin(vUv.y * 50.0 - uTime * 3.0), 8.0);
        color += vec3(sparkle * 0.5);
        alpha += sparkle * uIntensity * 0.3;

        gl_FragColor = vec4(color, alpha);
      }
    `;

    // Compile shaders
    function createShader(type: number, source: string) {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Fullscreen quad
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uHueOffset = gl.getUniformLocation(program, "uHueOffset");
    const uIntensity = gl.getUniformLocation(program, "uIntensity");

    gl.uniform1f(uHueOffset, SIN_HUE_OFFSET[sin] || 0);
    gl.uniform1f(uIntensity, intensity === "epic" ? 1.0 : 0.6);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let startTime = performance.now();

    function render() {
      if (!gl || !canvas) return;
      const time = (performance.now() - startTime) * 0.001;

      canvas.width = canvas.clientWidth * (window.devicePixelRatio > 1 ? 1.5 : 1);
      canvas.height = canvas.clientHeight * (window.devicePixelRatio > 1 ? 1.5 : 1);
      gl.viewport(0, 0, canvas.width, canvas.height);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animRef.current = requestAnimationFrame(render);
    }

    render();

    // Track mouse relative to canvas
    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: 1.0 - (e.clientY - rect.top) / rect.height,
      };
    };
    canvas.addEventListener("mousemove", handleMouse);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousemove", handleMouse);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, [sin, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ mixBlendMode: "screen", borderRadius: "inherit" }}
    />
  );
}
