"use client";

import { useRef } from "react";
import { EASE, SCENES } from "@/lib/scenes";
import { SceneText, Stage, useSceneTimeline, type Line } from "./scene-kit";

const COPY = {
  time: { bn: "সকাল ৯টা", en: "9:00 AM" } satisfies Line,
  line: { bn: "৯টা বাজে, ঢাকা থামে না", en: "9 o'clock, and Dhaka never stops" } satisfies Line,
  words: [
    { bn: "ব্যস্ত", en: "busy" },
    { bn: "ভিড়", en: "crowded" },
    { bn: "জীবন্ত", en: "alive" },
  ] satisfies Line[],
};

const TRACK_UNITS = 5760; // art is 5760x900; track is 640svh wide so it never distorts

function Wheel({ cx, cy, r = 44 }: { cx: number; cy: number; r?: number }) {
  return (
    <g data-wheel>
      <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth="9" className="stroke-ink" />
      <path d={`M${cx - r} ${cy}H${cx + r}M${cx} ${cy - r}V${cy + r}`} strokeWidth="5" className="stroke-ink" />
    </g>
  );
}

function Rickshaw({ x, tone }: { x: number; tone: "accent" | "glow" }) {
  return (
    <g>
      <path d={`M${x} 760 h230 v-120 a120 120 0 0 0 -230 0z`} className={tone === "accent" ? "fill-accent" : "fill-glow"} />
      <path d={`M${x + 230} 760 h120 v-80 h-120z`} className="fill-ink" />
      <rect x={x + 14} y="772" width="210" height="14" className="fill-ink" />
      <Wheel cx={x + 40} cy={806} />
      <Wheel cx={x + 300} cy={806} />
    </g>
  );
}

function Bus({ x }: { x: number }) {
  return (
    <g>
      <rect x={x} y="540" width="560" height="230" rx="22" className="fill-ink" />
      {[0, 1, 2, 3, 4].map((n) => (
        <rect key={n} x={x + 28 + n * 100} y="570" width="76" height="70" rx="8" className="fill-glow" />
      ))}
      <rect x={x} y="690" width="560" height="22" className="fill-accent" />
      <Wheel cx={x + 110} cy={780} r={38} />
      <Wheel cx={x + 450} cy={780} r={38} />
    </g>
  );
}

function Word({ w, className, tone }: { w: Line; className: string; tone: string }) {
  return (
    <div data-word className={`absolute motion-reduce:hidden ${className}`}>
      <p lang="bn" className={`whitespace-nowrap font-chunky text-giant font-extrabold ${tone}`}>
        {w.bn}
      </p>
      <p lang="en" className="-mt-4 text-label uppercase text-ink">
        {w.en}
      </p>
    </div>
  );
}

export default function Scene3Rush() {
  const root = useRef<HTMLDivElement>(null);
  const ease = EASE[SCENES[3].ease];

  useSceneTimeline(root, (tl, mode, q) => {
    if (mode === "reduce") {
      tl.fromTo(q("[data-word-static]"), { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.12, duration: 0.2, ease: "power2.out" }, 0.1);
      return;
    }
    const track = q("[data-track]")[0] as HTMLElement;
    const T = () => track.offsetWidth - window.innerWidth; // total travel in px
    const units = () => TRACK_UNITS / track.offsetWidth; // px -> art units
    // Jam beat: for 15% of the slot the track advances at ~20% speed, then catches up. All scrub, no timers.
    tl.fromTo(track, { x: 0 }, { x: () => -0.55 * T(), duration: 0.55 }, 0)
      .to(track, { x: () => -0.58 * T(), duration: 0.15 }, 0.55)
      .to(track, { x: () => -T(), duration: 0.3, ease: "power2.out" }, 0.7); // no overshoot: back.out would pass -T
    // Per-layer speeds: far layer lags the track, near layer outruns it.
    tl.to(q('[data-layer="far"]'), { x: () => 0.45 * T() * units(), duration: 1 }, 0);
    tl.to(q('[data-layer="near"]'), { x: () => -0.25 * T() * units(), duration: 1 }, 0);
    // PLACEHOLDER: wheels spin with scroll progress; Phase 4 drives rotation from getScrollVelocity() in a ticker.
    tl.to(q("[data-wheel]"), { rotation: 2160, transformOrigin: "50% 50%", duration: 1 }, 0);
    tl.fromTo(q("[data-word]"), { scale: 0.92 }, { scale: 1, transformOrigin: "0% 100%", stagger: 0.3, duration: 0.2, ease }, 0);
  }, { start: "top top" });

  const words = COPY.words;
  return (
    <div ref={root} className="relative h-full">
      <Stage label={COPY.line.en}>
        <div data-track className="absolute inset-y-0 left-0 w-[640svh]">
          {/* Words sit behind the vehicle layers... */}
          <Word w={words[0]} className="top-[40svh] left-[10%]" tone="text-ink" />
          <Word w={words[1]} className="top-[36svh] left-[46%]" tone="text-accent [-webkit-text-stroke:3px_var(--ink)]" />
          <svg aria-hidden="true" focusable="false" viewBox={`0 0 ${TRACK_UNITS} 900`} preserveAspectRatio="xMinYMax meet" className="absolute inset-0 h-full w-full">
            <g data-layer="far" className="fill-ink" opacity="0.35">
              {[200, 900, 1700, 2500, 3300, 4100, 4900].map((x, i) => (
                <rect key={x} x={x} y={470 - (i % 3) * 40} width="360" height={300 + (i % 3) * 40} />
              ))}
            </g>
            <g data-layer="mid">
              <Bus x={620} />
              <Bus x={2300} />
              <Bus x={3900} />
            </g>
            <rect x="0" y="830" width={TRACK_UNITS} height="70" className="fill-ink" />
            <g data-layer="near">
              {[60, 1300, 1900, 2950, 3500, 4600, 5200].map((x, i) => (
                <Rickshaw key={x} x={x} tone={i % 2 ? "glow" : "accent"} />
              ))}
            </g>
          </svg>
          {/* ...and this one rides in front of them. */}
          <Word w={words[2]} className="top-[44svh] left-[76%]" tone="text-glow [-webkit-text-stroke:3px_var(--ink)]" />
        </div>
        {/* Reduced motion: the track never pans, so the three words are stacked in view instead. */}
        <div className="absolute inset-x-0 top-[44svh] hidden flex-wrap gap-x-8 px-(--gutter) motion-reduce:flex">
          {words.map((w) => (
            <p key={w.en} data-word-static lang="bn" className="font-chunky text-display font-extrabold text-ink">
              {w.bn} <span lang="en" className="text-label font-medium uppercase">{w.en}</span>
            </p>
          ))}
        </div>
        <SceneText time={COPY.time} line={COPY.line} />
      </Stage>
    </div>
  );
}
