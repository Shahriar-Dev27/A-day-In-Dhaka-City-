"use client";

import { useRef } from "react";
import { EASE, SCENES } from "@/lib/scenes";
import { SceneText, Stage, useSceneTimeline, type Line } from "./scene-kit";

const COPY = {
  time: { bn: "সকাল ৭টা", en: "7:00 AM" } satisfies Line,
  line: { bn: "চায়ের কাপে শুরু হয় দিন", en: "The day begins in a cup of tea" } satisfies Line,
};

// Shopfronts along the lane: [x, width, height]
const SHOPS: [number, number, number][] = [[80, 300, 320], [430, 340, 270], [820, 280, 340], [1150, 360, 290], [1560, 300, 330], [1910, 340, 280], [2300, 320, 335], [2670, 380, 300]];

export default function Scene2OldDhaka() {
  const root = useRef<HTMLDivElement>(null);
  const ease = EASE[SCENES[2].ease];

  useSceneTimeline(root, (tl, mode, q) => {
    if (mode === "full") {
      // Pan the lane: the track is 356svh wide (3200x900 art at 100svh tall).
      const travel = () => {
        const track = q("[data-track]")[0] as HTMLElement;
        return -(track.offsetWidth - window.innerWidth);
      };
      tl.fromTo(q("[data-track]"), { x: 0 }, { x: travel, duration: 1, ease }, 0);
      tl.fromTo(q("[data-steam]"), { y: 0 }, { y: -60, stagger: 0.04, duration: 0.9, ease: "none" }, 0); // steam drifts up with scroll
    } else {
      tl.fromTo(q("[data-steam]"), { autoAlpha: 0.2 }, { autoAlpha: 0.7, ease: "power2.out", duration: 0.5 }, 0);
    }
  });

  return (
    <div ref={root} className="relative h-full">
      <Stage label={COPY.line.en}>
        <div data-track className="absolute inset-y-0 left-0 w-[356svh]">
          <svg aria-hidden="true" focusable="false" viewBox="0 0 3200 900" preserveAspectRatio="xMinYMax slice" className="h-full w-full">
            <rect x="0" y="700" width="3200" height="200" className="fill-ink" opacity="0.85" />
            {SHOPS.map(([x, w, h], i) => (
              <g key={x}>
                <rect x={x} y={700 - h} width={w} height={h} className="fill-ink" opacity={i % 2 ? 0.7 : 0.9} />
                <rect x={x + 24} y={700 - h + 60} width={w - 48} height="26" className="fill-accent" />
                <rect x={x + 30} y={700 - h + 130} width="70" height="96" className="fill-glow" opacity="0.8" />
              </g>
            ))}
            <path d="M0 330 Q800 400 1600 330 T3200 330" fill="none" strokeWidth="3" className="stroke-ink" />
            <g className="fill-ink">
              <path d="M520 700 h90 l-14 -90 h-62z" />
              <rect x="540" y="560" width="50" height="50" rx="8" />
            </g>
            {[0, 1, 2].map((n) => (
              <circle key={n} data-steam cx={560 + n * 14} cy={520 - n * 34} r={14 + n * 6} className="fill-glow" opacity="0.55" />
            ))}
            <ellipse cx="1500" cy="690" rx="90" ry="14" className="fill-ink" />
            <circle cx="1500" cy="640" r="46" className="fill-accent" />
            {[0, 1, 2].map((n) => (
              <circle key={`p${n}`} data-steam cx={1490 + n * 18} cy={560 - n * 36} r={12 + n * 5} className="fill-glow" opacity="0.5" />
            ))}
          </svg>
        </div>
        <SceneText time={COPY.time} line={COPY.line} />
      </Stage>
    </div>
  );
}
