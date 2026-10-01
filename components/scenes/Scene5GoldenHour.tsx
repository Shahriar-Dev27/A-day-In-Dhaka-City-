"use client";

import { useRef } from "react";
import { EASE, SCENES } from "@/lib/scenes";
import { Art, SceneText, Stage, useSceneTimeline, type Line } from "./scene-kit";

const COPY = {
  time: { bn: "বিকেল ৪:৩০", en: "4:30 PM" } satisfies Line,
  line: { bn: "আকাশ যাদের, ছাদ তাদের", en: "The sky belongs to whoever owns a rooftop" } satisfies Line,
};

// [x, y, size] kites; the first cuts loose mid-scene
const KITES: [number, number, number][] = [[1150, 330, 54], [900, 260, 44], [1350, 220, 40], [700, 360, 36]];
const ROOFS: [number, number, number][] = [[0, 130, 190], [150, 160, 120], [330, 120, 230], [470, 180, 150], [1000, 140, 210], [1160, 170, 130], [1300, 120, 250]];

export default function Scene5GoldenHour() {
  const root = useRef<HTMLDivElement>(null);
  const ease = EASE[SCENES[5].ease];

  useSceneTimeline(root, (tl, mode, q) => {
    if (mode === "full") {
      tl.fromTo(q("[data-world]"), { y: 0 }, { y: 140, duration: 1, ease }, 0); // camera rises: the rooftop sinks
      tl.fromTo(q("[data-haze]"), { x: -60 }, { x: 80, duration: 1, ease: "none" }, 0);
      q("[data-kite]").forEach((k, i) => {
        if (i === 0) return;
        tl.to(k, { y: -90 - i * 30, x: i % 2 ? 40 : -40, duration: 1, ease: "none" }, 0);
      });
      // The cut kite floats down across the screen.
      tl.to(q("[data-kite]")[0], { y: 260, x: -380, rotation: 40, transformOrigin: "50% 50%", duration: 0.4, ease: "sine.inOut" }, 0.45);
      tl.to(q("[data-pigeons]"), { x: 160, duration: 1, ease: "none" }, 0);
    } else {
      tl.fromTo(q("[data-haze]"), { autoAlpha: 0.4 }, { autoAlpha: 1, duration: 0.8, ease: "power2.out" }, 0);
    }
  });

  return (
    <div ref={root} className="relative h-full">
      <Stage label={COPY.line.en}>
        <Art>
          <circle cx="1280" cy="640" r="120" className="fill-glow" opacity="0.8" />
          <g data-haze>
            <ellipse cx="500" cy="520" rx="520" ry="46" className="fill-glow" opacity="0.35" />
            <ellipse cx="1150" cy="420" rx="420" ry="34" className="fill-glow" opacity="0.3" />
          </g>
          <g data-world>
            {KITES.map(([x, y, s], i) => (
              <g key={x} data-kite>
                <path d={`M${x} ${y - s} L${x + s * 0.7} ${y} L${x} ${y + s * 1.2} L${x - s * 0.7} ${y}z`} className={i % 2 ? "fill-accent" : "fill-ink"} />
                <path d={`M${x} ${y + s * 1.2} Q${x - 40} ${y + 300} ${x - 120} 700`} fill="none" strokeWidth="2" className="stroke-ink" />
              </g>
            ))}
            <g data-pigeons className="fill-ink">
              {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                <path key={n} d={`M${520 + n * 46} ${470 + (n % 3) * 26} l16 -8 l16 8 l-16 -3z`} />
              ))}
            </g>
            <rect x="0" y="720" width="1600" height="180" className="fill-ink" />
            {ROOFS.map(([x, h, w]) => (
              <rect key={x} x={x} y={720 - h} width={w} height={h} className="fill-ink" />
            ))}
            <g className="fill-ink">
              <rect x="610" y="580" width="70" height="140" rx="10" />
              <rect x="700" y="610" width="60" height="110" rx="10" />
            </g>
          </g>
        </Art>
        <SceneText time={COPY.time} line={COPY.line} />
      </Stage>
    </div>
  );
}
