"use client";

import { useEffect, useRef, type RefObject } from "react";
import { getScrollVelocityNorm } from "@/lib/scroll";
import { palette } from "@/lib/palette";
import { fragmentShader, vertexShader } from "@/shaders/lightTrail";

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

/**
 * Scene 7's headlight smears: one WebGL1 context, one full-screen quad (no three.js). The parent mounts it
 * only while the scene's slot is on screen, so this is the page's only context and it is released on unmount
 * (loseContext). If WebGL or the shader is unavailable the canvas stays empty and the SVG art carries the scene.
 */
export default function LightTrails({ progress }: { progress: RefObject<number> }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const parent = host.current;
    if (!parent) return;
    // A fresh canvas per mount: a canvas whose context was released with loseContext() cannot be reused
    // (React StrictMode mounts, unmounts and mounts again in development).
    const canvas = document.createElement("canvas");
    canvas.className = "absolute inset-0 h-full w-full";
    parent.appendChild(canvas);
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, powerPreference: "low-power", premultipliedAlpha: true });
    if (!gl) return () => canvas.remove();
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = compile(gl.VERTEX_SHADER, vertexShader);
    const fs = compile(gl.FRAGMENT_SHADER, fragmentShader);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return () => canvas.remove();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return () => canvas.remove();
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uProgress = gl.getUniformLocation(program, "uProgress");
    const uVelocity = gl.getUniformLocation(program, "uVelocity");
    gl.uniform3fv(gl.getUniformLocation(program, "uA"), rgb(palette[7].accent));
    gl.uniform3fv(gl.getUniformLocation(program, "uB"), rgb(palette[7].glow));
    gl.clearColor(0, 0, 0, 0);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (document.hidden) return;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uProgress, progress.current ?? 0);
      gl.uniform1f(uVelocity, getScrollVelocityNorm());
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [progress]);
  return <div ref={host} aria-hidden="true" className="absolute inset-0" />;
}
