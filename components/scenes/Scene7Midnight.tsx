"use client";

import { useRef } from "react";
import { EASE, LIGHT_DOT, SCENES } from "@/lib/scenes";
import { scrollToScene } from "@/lib/scroll";
import { Art, SceneText, Stage, useSceneTimeline, type Line } from "./scene-kit";

const COPY = {
  time: { bn: "রাত ১১:৪৫", en: "11:45 PM" } satisfies Line,
  line: { bn: "ঘুমায় শহর, স্বপ্ন জাগে", en: "The city sleeps, the dreams stay awake" } satisfies Line,
  // Credits: English only until the Bangla name spelling is confirmed. Link URLs pending (assumption Q8).
  credit: "Designed and built by Shahriar Islam Dip",
  restart: { bn: "আবার শুরু করুন", en: "Scroll up to start again" } satisfies Line,
};

const LAMP_R = 120;
const STARS = [[140, 80], [380, 170], [640, 60], [1010, 120], [1280, 70], [1490, 160]];
const SKYLINE: [number, number, number][] = [[0, 90, 150], [110, 120, 220], [260, 100, 170], [380, 150, 120], [1060, 130, 190], [1210, 110, 260], [1340, 160, 150], [1520, 80, 200]];

export default function Scene7Midnight() {
  const root = useRef<HTMLDivElement>(null);
  const ease = EASE[SCENES[7].ease];

  useSceneTimeline(
    root,
    (tl, mode, q) => {
      tl.fromTo(q("[data-star]"), { autoAlpha: 0 }, { autoAlpha: 0.9, stagger: 0.04, duration: 0.2, ease: "power2.out" }, 0.1);
      if (mode === "full") {
        tl.fromTo(q("[data-world]"), { scale: 1.3 }, { scale: 1, transformOrigin: "50% 75%", duration: 1, ease }, 0); // slow zoom out
        tl.to(q("[data-rickshaw]"), { x: 300, scale: 0.55, transformOrigin: "50% 100%", duration: 0.9, ease }, 0.05);
      }
      const lamp = q("[data-lamp]");
      if (mode === "full") {
        // The lamp shrinks to the LIGHT_DOT screen size. LAMP_R is in SVG units, so convert px -> units
        // with the rendered slice scale (re-evaluated on refresh, so resizes stay correct).
        const dotScale = () => {
          const svg = (lamp[0] as SVGElement).ownerSVGElement!.getBoundingClientRect();
          return LIGHT_DOT.sizePx / 2 / (LAMP_R * Math.max(svg.width / 1600, svg.height / 900));
        };
        tl.to(lamp, { scale: dotScale, transformOrigin: "50% 50%", duration: 0.7, ease }, 0.3);
      } else {
        tl.to(lamp, { autoAlpha: 0.15, duration: 0.7, ease: "power2.out" }, 0.3); // opacity only: no zoom
      }
    },
    { hold: true },
  );

  return (
    <div ref={root} className="relative h-full">
      <Stage label={COPY.line.en}>
        <Art>
          {STARS.map(([x, y]) => (
            <circle key={x} data-star cx={x} cy={y} r="2.5" className="fill-copy" />
          ))}
          <g data-world>
            <g className="fill-ink" opacity="0.95">
              {SKYLINE.map(([x, w, h]) => (
                <rect key={x} x={x} y={700 - h} width={w} height={h} />
              ))}
            </g>
            <rect x="0" y="700" width="1600" height="200" className="fill-ink" />
            <g className="fill-ink">
              <rect x="820" y="400" width="8" height="300" />
              <rect x="800" y="396" width="48" height="12" rx="6" />
            </g>
            <circle data-lamp cx="824" cy="420" r={LAMP_R} className="fill-glow" opacity="0.4" />
            <circle cx="824" cy="420" r="9" className="fill-glow" />
            <g data-rickshaw className="fill-accent">
              <path d="M420 700 h120 v-60 a60 60 0 0 0 -120 0z" />
              <circle cx="440" cy="708" r="22" className="fill-ink" />
              <circle cx="520" cy="708" r="22" className="fill-ink" />
            </g>
          </g>
        </Art>
        <SceneText time={COPY.time} line={COPY.line} />
        <div
          data-beat
          className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-(--gutter) pb-[max(2rem,env(safe-area-inset-bottom))] text-center"
        >
          <p lang="en" className="text-label uppercase text-copy-muted">
            {COPY.credit}
          </p>
          <button type="button" onClick={() => scrollToScene(0)} className="btn btn-solid">
            <span lang="bn">{COPY.restart.bn}</span>
            <span lang="en" className="text-sub">
              {COPY.restart.en}
            </span>
          </button>
        </div>
      </Stage>
    </div>
  );
}
