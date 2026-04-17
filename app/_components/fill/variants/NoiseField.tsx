"use client";

import { useEffect, useRef, useState } from "react";

const LETTER_SRC = "/clove-wordmark.svg";
const LETTER_ASPECT = 1600 / 400;

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform sampler2D u_letters;
uniform float u_letterAspect;
uniform float u_lettersReady;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += amp * valueNoise(p);
    p = rot * p * 2.03;
    amp *= 0.5;
  }
  return v;
}

// Sample the CLOVE wordmark texture with "contain" fit — letters preserve
// their aspect ratio and are centered, regardless of canvas shape.
float sampleLetters(vec2 uv) {
  if (u_lettersReady < 0.5) return 0.0;
  float canvasAspect = u_resolution.x / u_resolution.y;
  vec2 l = uv - 0.5;
  if (canvasAspect > u_letterAspect) {
    l.x *= canvasAspect / u_letterAspect;
  } else {
    l.y *= u_letterAspect / canvasAspect;
  }
  // tiny outward scale so letters breathe a bit inside the frame
  l *= 1.02;
  l += 0.5;
  if (l.x < 0.0 || l.x > 1.0 || l.y < 0.0 || l.y > 1.0) return 0.0;
  return texture2D(u_letters, l).r;
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5) * 2.0;

  float t = u_time * 0.028;

  // Domain-warped elevation.
  vec2 q = vec2(
    fbm(p + vec2(t, -t * 0.6)),
    fbm(p + vec2(-t * 0.8, t * 1.1) + 5.2)
  );
  vec2 r = vec2(
    fbm(p + q * 1.6 + vec2(1.7, 9.2) + t * 0.4),
    fbm(p + q * 1.6 + vec2(8.3, 2.8) - t * 0.3)
  );
  float n = fbm(p + r * 1.4);

  // Warp the letter-sampling UV by the same noise vectors that domain-warp the
  // terrain, so the displaced region breathes with the field instead of
  // reading as a clean geometric cutout.
  vec2 warp = (r - 0.5) * 0.028 + (q - 0.5) * 0.018;
  vec2 letterUV = uv + warp;

  // Small 5-tap blur on the letter mask so the elevation transition at letter
  // edges is gradual — prevents contour lines from bunching into an outline.
  float b = 0.0022;
  float letter =
    sampleLetters(letterUV) * 0.4 +
    sampleLetters(letterUV + vec2(b, 0.0)) * 0.15 +
    sampleLetters(letterUV + vec2(-b, 0.0)) * 0.15 +
    sampleLetters(letterUV + vec2(0.0, b)) * 0.15 +
    sampleLetters(letterUV + vec2(0.0, -b)) * 0.15;

  // Recess the letterforms into the terrain by a little more than one contour
  // spacing (0.125). Slight enough that the contour lines keep passing through
  // the letters — so every glyph reads as "see-through" with displaced
  // isolines — but clear enough to make CLOVE recognizable.
  float engraved = n - letter * 0.16;

  // Cursor proximity (aspect-corrected).
  vec2 md = vec2((u_mouse.x - 0.5) * aspect, u_mouse.y - 0.5) * 2.0;
  float proximity = length(p - md);
  float spotlight = smoothstep(1.4, 0.0, proximity);

  // Base ambient luminance — very dim, just so edges aren't pitch black.
  // Clamp before pow() so negative elevations (possible after engraving) don't
  // feed pow() an undefined value.
  float base = pow(max(engraved, 0.0), 1.2) * 0.045;

  // Topographic contours at 8 drifting isovalues. The word is NOT drawn as its
  // own edge pass — it appears only through how these same contour lines
  // respond to the gently displaced elevation inside the letterforms.
  float contours = 0.0;
  float tide = sin(t * 0.7) * 0.035;
  for (int k = 0; k < 8; k++) {
    float level = (float(k) + 0.5) / 8.0 + tide;
    float d = abs(engraved - level);
    contours += smoothstep(0.012, 0.0, d);
  }
  // Ambient letter lift keeps the word clearly visible at rest; the spotlight
  // term amplifies everything on hover, and the spotlight*letter term pushes
  // the word further forward specifically when the cursor is near it.
  contours *= (0.62 + letter * 1.25 + spotlight * 0.45 + spotlight * letter * 2.6);

  float v = base + contours * 0.55;

  vec3 col = vec3(v) * vec3(0.985, 0.98, 0.96);
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function loadLetterTexture(
  gl: WebGLRenderingContext,
  src: string,
): Promise<WebGLTexture | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Rasterize the SVG to a 2D canvas at a fixed, high-resolution size so
      // the letter edges remain crisp regardless of device pixel ratio.
      const w = 1600;
      const h = 400;
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const ctx = off.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      const tex = gl.createTexture();
      if (!tex) {
        resolve(null);
        return;
      }
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        off,
      );
      resolve(tex);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function NoiseField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: true,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uLetters = gl.getUniformLocation(program, "u_letters");
    const uLetterAspect = gl.getUniformLocation(program, "u_letterAspect");
    const uLettersReady = gl.getUniformLocation(program, "u_lettersReady");

    gl.uniform1f(uLetterAspect, LETTER_ASPECT);
    gl.uniform1f(uLettersReady, 0);
    gl.uniform1i(uLetters, 0);

    let letterTex: WebGLTexture | null = null;
    let disposed = false;

    loadLetterTexture(gl, LETTER_SRC).then((tex) => {
      if (disposed || !tex) return;
      letterTex = tex;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.useProgram(program);
      gl.uniform1f(uLettersReady, 1);
    });

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { clientWidth, clientHeight } = canvas;
      canvas.width = Math.floor(clientWidth * dpr);
      canvas.height = Math.floor(clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - rect.left) / rect.width;
      mouse.ty = 1 - (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener("pointermove", onPointer);

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const start = performance.now();
    let raf = 0;

    const render = (now: number) => {
      const t = reduce ? 0 : (now - start) / 1000;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;

      if (letterTex) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, letterTex);
      }

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!reduce) raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    const showTimer = window.setTimeout(() => setReady(true), 60);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(showTimer);
      window.removeEventListener("pointermove", onPointer);
      ro.disconnect();
      if (letterTex) gl.deleteTexture(letterTex);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden">
      <canvas
        ref={canvasRef}
        aria-label="CLOVE engraved into a topographic strata field"
        className="absolute inset-0 h-full w-full"
        style={{
          opacity: ready ? 1 : 0,
          transition: "opacity 900ms ease-out",
          // Soft vertical falloff so the field dissolves into the page
          // background at its top and bottom edges instead of cutting hard.
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
        }}
      />
    </div>
  );
}
