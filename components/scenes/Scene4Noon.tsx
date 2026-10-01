"use client";

import { useRef } from "react";
import { EASE, SCENES } from "@/lib/scenes";
import { Art, SceneText, Stage, useSceneTimeline, type Line } from "./scene-kit";

const COPY = {
  time: { bn: "দুপুর ১টা", en: "1:00 PM" } satisfies Line,
  line: { bn: "রোদ যত কড়া, ছায়া তত দামি", en: "The harsher the sun, the more precious the shade" } satisfies Line,
};

export default function Scene4Noon() {
  const root = useRef<HTMLDivElement>(null);
  const ease = EASE[SCENES[4].ease];

  useSceneTimeline(root, (tl, mode, q) => {
    if (mode === "full") {
      // Sun crosses an arc: x is linear, y rises then falls.
      tl.fromTo(q("[data-sun]"), { x: -250 }, { x: 350, duration: 1, ease: "none" }, 0);
      tl.fromTo(q("[data-sun-y]"), { y: 120 }, { y: -90, duration: 0.5, ease: "sine.out" }, 0);
      tl.to(q("[data-sun-y]"), { y: 120, duration: 0.5, ease: "sine.in" }, 0.5);
      // Shadows rotate (skew) and lengthen as the sun moves.
      tl.fromTo(q("[data-shadow]"), { skewX: 38, scaleX: 0.5 }, { skewX: -38, scaleX: 1.7, transformOrigin: "0% 100%", duration: 1, ease }, 0);
      tl.fromTo(q("[data-drop]"), { y: 0 }, { y: 54, duration: 1, ease: "none" }, 0); // sweat drop slides down the glass
    } else {
      tl.fromTo(q("[data-shadow]"), { autoAlpha: 0.3 }, { autoAlpha: 1, duration: 0.8, ease: "power2.out" }, 0);
    }
  });

  return (
    <div ref={root} className="relative h-full">
      <Stage label={COPY.line.en}>
        <Art>
          <g data-sun>
            <g data-sun-y>
              <circle cx="1100" cy="260" r="150" className="fill-accent" opacity="0.28" />
              <circle cx="1100" cy="260" r="96" strokeWidth="8" className="fill-accent stroke-ink" />
            </g>
          </g>
          <rect x="0" y="650" width="1600" height="250" className="fill-ink" opacity="0.9" />
          {/* Heat shimmer band: static stripes for now; Phase 4 swaps in an SVG feTurbulence displacement (named rule-5 exception). */}
          {[0, 1, 2, 3].map((n) => (
            <rect key={n} x="0" y={690 + n * 44} width="1600" height="6" className="fill-glow" opacity="0.22" />
          ))}
          {/* Fruit vendor umbrella + cart */}
          <path d="M360 520 a190 190 0 0 1 380 0z" className="fill-accent" />
          <rect x="545" y="520" width="10" height="170" className="fill-ink" />
          <rect x="400" y="640" width="300" height="56" className="fill-ink" />
          {/* Rickshaw resting in its own shade */}
          <g className="fill-ink">
            <path d="M1020 690 h210 v-110 a105 105 0 0 0 -210 0z" />
            <circle cx="1060" cy="700" r="40" />
            <circle cx="1280" cy="700" r="40" />
          </g>
          <g className="fill-ink">
            <path data-shadow d="M1020 700 h210 l60 0 h-270z" opacity="0.55" />
            <path data-shadow d="M360 700 h380 l90 0 h-470z" opacity="0.55" />
          </g>
          {/* Glass of cold drink with a sweat drop */}
          <rect x="1420" y="610" width="46" height="80" rx="6" className="fill-glow" opacity="0.8" />
          <circle data-drop cx="1443" cy="626" r="5" className="fill-accent" />
        </Art>
        <SceneText time={COPY.time} line={COPY.line} />
      </Stage>
    </div>
  );
}
