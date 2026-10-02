"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { palette } from "@/lib/palette";
import { getScrollVelocityNorm } from "@/lib/scroll";
import type { DeviceTier } from "@/lib/scenes";

export default function PigeonSwarm({ tier, reducedMotion }: { tier: DeviceTier; reducedMotion: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    const slot = canvas?.closest("[data-scene]");
    if (!canvas || !context || !slot) return;
    let visible = false;
    let phase = 0;
    const count = tier === "low" ? 28 : 64;
    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      context.clearRect(0, 0, w, h);
      context.fillStyle = palette[6].ink;
      for (let n = 0; n < count; n++) {
        const a = n * 2.39996 + phase;
        const radius = 0.35 + (n % 9) / 18;
        const x = w * (0.67 + Math.cos(a) * 0.24 * radius);
        const y = h * (0.5 + Math.sin(a) * 0.4 * radius);
        const wing = 2 + Math.sin(phase * 4 + n) * 1.6;
        context.beginPath();
        context.moveTo(x - 6, y - wing);
        context.lineTo(x, y + 1);
        context.lineTo(x + 6, y - wing);
        context.lineTo(x, y + 4);
        context.fill();
      }
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    const tick = (_time: number, delta: number) => {
      if (!visible || document.hidden) return;
      phase += getScrollVelocityNorm() * Math.min(delta, 50) * 0.006;
      draw();
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    const ro = new ResizeObserver(resize);
    io.observe(slot);
    ro.observe(canvas);
    resize();
    if (!reducedMotion) gsap.ticker.add(tick);
    return () => { io.disconnect(); ro.disconnect(); gsap.ticker.remove(tick); };
  }, [tier, reducedMotion]);
  return <canvas ref={ref} aria-hidden="true" className="h-full w-full" />;
}
