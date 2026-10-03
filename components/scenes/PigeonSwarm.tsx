"use client";

/*
  The pigeon flock over the rooftop coop (Scene 6): one 2D canvas, flat ink silhouettes in the printed
  language (a body, a head, two wing wedges, a tail; no gradients, no blur, no filters).
  - Birds circle the coop on tilted ellipses, each at its own radius/speed/phase. The ring's direction
    follows Math.sign(getScrollVelocityNorm()) (it eases through zero when you reverse, so the flock
    visibly turns round) and a fast scroll startles it wider.
  - Cap: 32 on the low tier, 96 on high (the contract allows <= 40 / <= 120). DPR capped at 2.
  - The rAF loop runs only while the slot is on screen (IntersectionObserver starts/stops it) and is
    cancelled on unmount; hidden tabs don't tick. No per-frame React state.
  - Colours are read from CSS custom properties (--ink, --wall) through a probe element, re-read every
    ~1.5 s so the sky timeline's relight is followed. No hex.
  - Reduced motion: no canvas at all, a static flock silhouette (SVG) frozen mid-circle.
  Placement: `at` is the ring centre in the 1600-unit art space, `radius` the ring's half-width; the box is
  positioned with --u (see .stage) so it lives inside the same layer as the art and moves with the camera.
*/

import { useEffect, useRef, type CSSProperties } from "react";
import { getScrollVelocityNorm } from "@/lib/scroll";
import type { DeviceTier } from "@/lib/scenes";

export const SWARM_CAP = { low: 32, high: 96 } as const;
const TILT = 0.42; // ring height / width
const BASE_W = 0.5; // rad/s at rest

interface Bird {
  r: number; // ring radius (units)
  ry: number; // how flat this bird's ring is
  rot: number; // this bird's ring is tipped by this angle, so the flock is a cloud, not one hoop
  a: number; // angle
  w: number; // speed factor
  flap: number; // flap phase
  pale: boolean; // a lighter tone: the fancy ones keepers breed
  size: number;
}

function makeBirds(n: number, radius: number): Bird[] {
  // deterministic (no Math.random): the same flock every mount
  return Array.from({ length: n }, (_, i) => {
    const t = (i * 0.61803398875) % 1;
    const u = (i * 0.7548776662) % 1;
    const v = (i * 0.5698402909) % 1;
    return { r: radius * (0.28 + 0.72 * t), ry: 0.26 + 0.32 * v, rot: (u - 0.5) * 0.7, a: i * 2.39996, w: 0.75 + 0.5 * u, flap: i * 1.7, pale: i % 5 === 0, size: 1.25 + 0.5 * ((i * 0.3247) % 1) };
  });
}

function box(at: readonly [number, number], radius: number): CSSProperties {
  return {
    position: "absolute",
    width: `calc(${radius * 2} * var(--u))`,
    height: `calc(${radius * 2 * (TILT + 0.55)} * var(--u))`,
    left: `calc(50% + ${at[0] - 800 - radius} * var(--u))`,
    bottom: `calc(${1800 - at[1] - radius * (TILT + 0.55)} * var(--u))`,
    pointerEvents: "none",
  };
}

export default function PigeonSwarm({ tier, reducedMotion, at, radius }: { tier: DeviceTier; reducedMotion: boolean; at: readonly [number, number]; radius: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const n = SWARM_CAP[tier === "low" ? "low" : "high"];

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    const slot = canvas?.closest("[data-scene]");
    if (!canvas || !ctx || !slot || reducedMotion) return;
    const birds = makeBirds(n, radius);
    const probe = document.createElement("span");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
    canvas.parentElement?.appendChild(probe);
    let ink = "currentcolor";
    let pale = "currentcolor";
    const readColours = () => {
      probe.style.color = "var(--ink)";
      ink = getComputedStyle(probe).color;
      probe.style.color = "color-mix(in oklab, var(--ink) 52%, var(--wall))";
      pale = getComputedStyle(probe).color;
    };
    readColours();

    let raf = 0;
    let last = 0;
    let since = 0;
    let omega = BASE_W; // signed ring speed, eased
    let dir = 1;
    let spread = 1;
    let k = 1; // css px per art unit
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      k = canvas.clientWidth / (radius * 2);
    };

    // A side-on pigeon facing +x (mirrored when it flies left): body, head, tail and a swept wing whose tip beats up
    // and down. A flat silhouette; no rotation by heading, so the beat always reads as a bird, not a fish.
    const bird = (b: Bird, x: number, y: number, vx: number, vy: number, flap: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale((vx >= 0 ? 1 : -1) * b.size, b.size);
      ctx.rotate(Math.atan2(vy, Math.abs(vx) + 0.001) * 0.45);
      ctx.fillStyle = b.pale ? pale : ink;
      const tip = -3 - 11 * Math.sin(flap);
      ctx.beginPath();
      ctx.moveTo(2, -1);
      ctx.quadraticCurveTo(-3, tip * 0.55, -10, tip);
      ctx.lineTo(-5, -1);
      ctx.moveTo(1, -1);
      ctx.quadraticCurveTo(-5, tip * 0.5 - 1, -13, tip * 0.8);
      ctx.lineTo(-7, -1);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 3.1, 0, 0, Math.PI * 2);
      ctx.moveTo(11.3, -0.8);
      ctx.arc(9, -0.8, 2.3, 0, Math.PI * 2);
      ctx.moveTo(-6, 0);
      ctx.lineTo(-14, -2.4);
      ctx.lineTo(-14, 2.4);
      ctx.fill();
      ctx.restore();
    };

    const frame = (time: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((time - last) / 1000 || 0.016, 0.05);
      last = time;
      since += dt;
      if (since > 1.5) {
        since = 0;
        readColours();
      }
      const v = getScrollVelocityNorm();
      const s = Math.sign(v); // scroll direction: the ring turns with it
      if (Math.abs(v) > 0.02 && s !== 0) dir = s;
      const speed = BASE_W + Math.abs(v) * 2.2;
      omega += (dir * speed - omega) * Math.min(1, dt * 2.6); // eases through zero on a reversal
      spread += (1 + Math.min(1, Math.abs(v) * 2) * 0.22 - spread) * Math.min(1, dt * 3);
      ctx.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
      ctx.clearRect(0, 0, radius * 2, canvas.clientHeight / k);
      const cx = radius;
      const cy = (canvas.clientHeight / k) / 2;
      for (const b of birds) {
        b.a += omega * b.w * dt;
        b.flap += dt * (13 + Math.abs(omega) * 4);
        const rr = b.r * spread;
        const [ca, sa, cr, sr] = [Math.cos(b.a), Math.sin(b.a), Math.cos(b.rot), Math.sin(b.rot)];
        // the ring point, then the ring's own tilt; heading = the ring's tangent in the direction of travel
        const [ex, ey] = [ca * rr, sa * rr * b.ry];
        const [tx0, ty0] = [-sa, ca * b.ry];
        const sg = Math.sign(omega || 1);
        const x = cx + ex * cr - ey * sr;
        const y = cy + ex * sr + ey * cr + Math.sin(b.a * 2.3 + b.flap * 0.05) * 5;
        bird(b, x, y, (tx0 * cr - ty0 * sr) * sg, (tx0 * sr + ty0 * cr) * sg, b.flap);
      }
    };
    let inView = false;
    const start = () => {
      if (raf || document.hidden || !inView) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView) start();
      else stop();
    });
    const ro = new ResizeObserver(resize);
    const onVisibility = () => (document.hidden ? stop() : start());
    io.observe(slot);
    ro.observe(canvas);
    resize();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      probe.remove();
    };
  }, [n, radius, reducedMotion]);

  if (reducedMotion) return <FlockStill at={at} radius={radius} />;
  return (
    <div style={box(at, radius)} data-swarm={n} aria-hidden="true">
      <canvas ref={ref} className="h-full w-full" />
    </div>
  );
}

/** Reduced motion: the same ring frozen mid-circle as flat silhouettes (24 birds, one path each). */
function FlockStill({ at, radius }: { at: readonly [number, number]; radius: number }) {
  const birds = makeBirds(24, radius);
  return (
    <svg aria-hidden="true" focusable="false" data-flock-still viewBox={`${-radius} ${-radius * (TILT + 0.55)} ${radius * 2} ${radius * 2 * (TILT + 0.55)}`} style={box(at, radius)} className="overflow-visible">
      {birds.map((b, i) => {
        const [cr, sr] = [Math.cos(b.rot), Math.sin(b.rot)];
        const [ex, ey] = [Math.cos(b.a) * b.r, Math.sin(b.a) * b.r * b.ry];
        const x = ex * cr - ey * sr;
        const y = ex * sr + ey * cr;
        const face = -Math.sin(b.a) * cr - Math.cos(b.a) * b.ry * sr >= 0 ? 1 : -1;
        return (
          <path
            key={i}
            transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(face * b.size).toFixed(2)} ${b.size.toFixed(2)})`}
            d={i % 3 ? "M2 -1Q-3 -7 -10 -9L-5 -1ZM-7 0L-14 -2.4V2.4ZM-7 0A7 3.1 0 1 1 7 0A7 3.1 0 1 1 -7 0ZM11.3 -.8A2.3 2.3 0 1 1 6.7 -.8A2.3 2.3 0 1 1 11.3 -.8Z" : "M2 -1Q-2 4 -9 7L-4 1ZM-7 0L-14 -2.4V2.4ZM-7 0A7 3.1 0 1 1 7 0A7 3.1 0 1 1 -7 0ZM11.3 -.8A2.3 2.3 0 1 1 6.7 -.8A2.3 2.3 0 1 1 11.3 -.8Z"}
            className={b.pale ? "fill-wall-dark" : "fill-ink"}
          />
        );
      })}
    </svg>
  );
}
