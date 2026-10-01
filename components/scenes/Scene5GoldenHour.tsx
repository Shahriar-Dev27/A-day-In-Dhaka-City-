"use client";

import { useRef } from "react";
import { EASE, SCENES, type SceneProps } from "@/lib/scenes";
import { storyVars } from "@/lib/palette";
import { Art, SceneText, Stage, useSceneTimeline, type Line } from "./scene-kit";
import { CloseArt, CloseBeat, Cup, Figure, FigureLine } from "./story-kit";
import PigeonSwarm from "./PigeonSwarm";

const COPY = {
  time: { bn: "বিকেল ৪:৩০", en: "4:30 PM" } satisfies Line,
  line: { bn: "আকাশ যাদের, ছাদ তাদের", en: "The sky belongs to whoever owns a rooftop" } satisfies Line,
  close: { bn: "এটা তোমার।", en: "This is yours." } satisfies Line,
};

// [x, y, size] kites; the first cuts loose mid-scene
const KITES: [number, number, number][] = [[1150, 450, 54], [1000, 460, 44], [1350, 430, 40], [660, 470, 36]];
const ROOFS: [number, number, number][] = [[0, 130, 190], [150, 160, 120], [330, 120, 230], [470, 180, 150], [1000, 140, 210], [1160, 170, 130], [1300, 120, 250]];

export default function Scene5GoldenHour({ tier, reducedMotion }: SceneProps) {
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
      tl.to(q("[data-kite]")[0], { y: 180, x: -350, rotation: 40, transformOrigin: "50% 50%", duration: 0.14, ease: "sine.inOut" }, 0.18);
      tl.fromTo(q("[data-kite-return]"), { x: -25 }, { x: 25, duration: 0.12 }, 0.48);
    } else {
      tl.fromTo(q("[data-haze]"), { autoAlpha: 0.4 }, { autoAlpha: 1, duration: 0.8, ease: "power2.out" }, 0);
    }
  }, { close: true });

  return (
    <div ref={root} className="relative h-full">
      <Stage label={COPY.line.en}>
        <Art data-city>
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
            <rect x="0" y="720" width="1600" height="180" className="fill-ink" />
            {ROOFS.map(([x, h, w]) => (
              <rect key={x} x={x} y={720 - h} width={w} height={h} className="fill-ink" />
            ))}
            <g className="fill-ink">
              <rect x="610" y="580" width="70" height="140" rx="10" />
              <rect x="700" y="610" width="60" height="110" rx="10" />
            </g>
            <Figure pose="walk" transform="translate(820 720) scale(0.8)" />
            <Figure pose="walk" transform="translate(920 720) scale(0.55)" />
            <g style={storyVars}><Cup state="empty" transform="translate(755 691) scale(0.35)" /></g>
          </g>
        </Art>
        <div data-city className="pointer-events-none absolute inset-x-0 top-[44svh] h-[22svh]"><PigeonSwarm tier={tier} reducedMotion={reducedMotion} /></div>
        <SceneText time={COPY.time} line={COPY.line} />
        <CloseBeat label="An empty chai glass rests on the roof ledge as the fallen kite is handed back to a child.">
          <CloseArt>
            <path d="M80 500H720V540H80Z" fill="var(--story-shawl)" opacity="0.35" />
            <g transform="translate(235 350) scale(1.8)"><Cup state="empty" /></g>
            <g data-kite-return>
              <path d="M460 190 560 310 460 440 360 310Z" fill="var(--story-gold)" />
              <path d="M460 190V440M360 310H560M460 440q-45 35 5 61" fill="none" stroke="var(--story-cloth)" strokeWidth="3" />
              <path d="M55 320 284 284 345 298 372 312 366 331 337 323 293 329 55 383Z" fill="var(--story-shawl)" />
              <path d="M338 299 381 312 376 330 339 322Z" fill="var(--story-skin)" />
            </g>
            <Figure pose="hold-high" transform="translate(627 570) scale(0.75)" />
            <path d="M655 405 546 332" fill="none" stroke="var(--story-skin)" strokeWidth="13" strokeLinecap="round" />
          </CloseArt>
          <FigureLine line={COPY.close} spoken />
        </CloseBeat>
      </Stage>
    </div>
  );
}
