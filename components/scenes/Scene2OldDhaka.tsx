"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { EASE, SCENES } from "@/lib/scenes";
import { Art, SceneText, Stage, useSceneTimeline, type Line } from "./scene-kit";
import { CloseArt, CloseBeat, Cup, Figure, FigureLine, TeaStall } from "./story-kit";

const COPY = {
  time: { bn: "সকাল ৭টা", en: "7:00 AM" } satisfies Line,
  line: { bn: "চায়ের কাপে শুরু হয় দিন", en: "The day begins in a cup of tea" } satisfies Line,
  close: { bn: "পরে দিয়েন।", en: "Pay me later." } satisfies Line,
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
      tl.fromTo(q("[data-city] [data-steam]"), { y: 0 }, { y: -60, stagger: 0.02, duration: 0.5, ease: "none" }, 0);
      tl.fromTo(q("[data-offer]"), { x: -70 }, { x: 0, duration: 0.12 }, 0.46);
      tl.fromTo(q("[data-wave]"), { rotation: -15 }, { rotation: 15, transformOrigin: "100% 100%", duration: 0.12 }, 0.52);
      const steam = gsap.to(q("[data-stall-steam]"), { y: -18, opacity: 0.1, duration: 2, repeat: -1, yoyo: true, paused: true, ease: "sine.inOut" });
      ScrollTrigger.create({ trigger: root.current?.parentElement, start: "top bottom", end: "bottom top", onToggle: (s) => s.isActive ? steam.play() : steam.pause() });
      tl.fromTo(q("[data-paratha]"), { y: 0, scaleY: 1 }, { y: -35, scaleY: -1, duration: 0.07 }, 0.2).to(q("[data-paratha]"), { y: 0, scaleY: 1, duration: 0.07 }, 0.27);
    } else {
      tl.fromTo(q("[data-steam]"), { autoAlpha: 0.2 }, { autoAlpha: 0.7, ease: "power2.out", duration: 0.5 }, 0);
    }
  }, { close: true });

  return (
    <div ref={root} className="relative h-full">
      <Stage label={COPY.line.en}>
        <div data-city data-track className="absolute inset-y-0 left-0 w-[356svh]">
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
        <Art data-city>
          <TeaStall transform="translate(800 790) scale(0.85)" />
          <Figure pose="walk" transform="translate(950 872) scale(0.9)" />
          <Figure pose="sit" transform="translate(630 870) scale(0.75)" />
        </Art>
        <SceneText time={COPY.time} line={COPY.line} />
        <CloseBeat label="The seller hands over a steaming chai glass and waves away payment.">
          <CloseArt>
            <path d="M60 425 276 335 312 392 110 496Z" fill="var(--story-gold)" />
            <path d="M740 475 510 340 468 387 701 530Z" fill="var(--story-shawl)" />
            <g data-offer>
              <path d="M265 341q72-30 93-7l30 28-13 17-34-18-45 42Z" fill="var(--story-skin)" />
              <g transform="translate(400 310) scale(2)"><Cup state="full" /></g>
            </g>
            <path d="M489 347 454 306 442 304 437 319 469 362 454 393 477 402 516 370Z" fill="var(--story-skin)" />
            <path data-wave d="M204 247 196 192 209 183 217 215 232 175 245 183 234 231 263 215 271 229 228 269Z" fill="var(--story-skin)" />
            <path d="M55 490H745V525H55Z" fill="var(--story-glass)" opacity="0.35" />
          </CloseArt>
          <FigureLine line={COPY.close} spoken />
        </CloseBeat>
      </Stage>
    </div>
  );
}
