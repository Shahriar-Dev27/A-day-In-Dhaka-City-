"use client";

import { useRef } from "react";
import { EASE, SCENES } from "@/lib/scenes";
import { Art, SceneText, Stage, useSceneTimeline, type Line } from "./scene-kit";

const COPY = {
  time: { bn: "সন্ধ্যা ৭:৩০", en: "7:30 PM" } satisfies Line,
  line: { bn: "আলোয় আলোয় নতুন ঢাকা", en: "A new Dhaka, made of light" } satisfies Line,
};

const SHOPS: [number, number, number][] = [[40, 300, 260], [380, 340, 320], [760, 280, 250], [1080, 320, 300], [1440, 200, 270]];
const BULBS = Array.from({ length: 18 }, (_, i) => [90 + i * 84, 500 + Math.sin(i * 1.7) * 26] as const);
const BOKEH: [number, number, number][] = [[220, 180, 46], [560, 120, 30], [940, 210, 58], [1260, 140, 36], [1500, 240, 42]];
const TRAILS: [number, number, number][] = [[620, 770, 520], [1020, 800, 380], [260, 830, 440]];

export default function Scene6Neon() {
  const root = useRef<HTMLDivElement>(null);
  const ease = EASE[SCENES[6].ease];

  useSceneTimeline(root, (tl, mode, q) => {
    // Each light gets its own slot in the timeline (Phase 4: its own ScrollTrigger, per SCRIPT).
    tl.fromTo(q("[data-light]"), { autoAlpha: 0.1 }, { autoAlpha: 1, stagger: 0.025, duration: 0.05, ease: "power2.out" }, 0.1);
    tl.fromTo(q("[data-neon]"), { autoAlpha: 0.15 }, { autoAlpha: 1, duration: 0.08, ease: "power2.out" }, 0.3);
    if (mode === "full") {
      // PLACEHOLDER: CSS streaks. Phase 4 swaps in the R3F light-trail shader (mounted only on the high tier).
      tl.fromTo(q("[data-trail]"), { scaleX: 0.05, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 0.9, transformOrigin: "0% 50%", stagger: 0.08, duration: 0.5, ease }, 0.25);
      tl.fromTo(q("[data-bokeh]"), { y: 0 }, { y: -50, stagger: 0.04, duration: 1, ease: "none" }, 0);
    } else {
      tl.fromTo(q("[data-trail]"), { autoAlpha: 0 }, { autoAlpha: 0.7, duration: 0.3, ease: "power2.out" }, 0.3);
    }
  });

  return (
    <div ref={root} className="relative h-full">
      <Stage label={COPY.line.en}>
        <Art>
          {BOKEH.map(([x, y, r]) => (
            <circle key={x} data-bokeh cx={x} cy={y + 300} r={r} className="fill-glow" opacity="0.25" />
          ))}
          {SHOPS.map(([x, w, h]) => (
            <rect key={x} x={x} y={720 - h} width={w} height={h} className="fill-ink" />
          ))}
          <rect x="0" y="720" width="1600" height="180" className="fill-ink" />
          <rect x="430" y="470" width="220" height="48" rx="6" fill="none" strokeWidth="6" data-neon className="stroke-accent" />
          <rect x="1110" y="440" width="180" height="48" rx="6" fill="none" strokeWidth="6" data-neon className="stroke-glow" />
          {BULBS.map(([x, y]) => (
            <circle key={x} data-light cx={x} cy={y} r="8" className="fill-glow" />
          ))}
          {TRAILS.map(([x, y, w], i) => (
            <rect key={y} data-trail x={x} y={y} width={w} height="10" rx="5" className={i % 2 ? "fill-glow" : "fill-accent"} />
          ))}
          {/* Wet-road reflections */}
          <rect x="300" y="740" width="460" height="6" className="fill-glow" opacity="0.18" />
          <rect x="900" y="760" width="320" height="6" className="fill-accent" opacity="0.18" />
        </Art>
        <SceneText time={COPY.time} line={COPY.line} />
      </Stage>
    </div>
  );
}
