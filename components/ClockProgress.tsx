"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { CLOCK_FG } from "@/lib/palette";
import { progressToClockMinutes, SCENES, SCENE_OFFSETS, SCROLL_RANGE_SVH } from "@/lib/scenes";

export interface ClockProgressHandle {
  setProgress(p: number): void;
}

// Semicircle arc: 120x64 box, centre (60,60), radius 52. Sun is a 12px dot riding it.
const W = 120;
const H = 64;
const R = 52;
const DOT = 12;
const DAY_START = SCENES[1].clockMinutes!; // 04:45
const DAY_END = SCENES[7].clockMinutes!; // 23:45

function hhmm(minutes: number) {
  const m = Math.round(minutes);
  return `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

function sceneAtProgress(p: number) {
  const s = p * SCROLL_RANGE_SVH;
  let id = 0;
  for (let i = 0; i < SCENES.length; i++) if (s >= SCENE_OFFSETS[i]) id = i;
  return id;
}

/**
 * Driven entirely by refs: setProgress runs per scroll frame and only touches DOM nodes
 * (quickSetter for the sun, textContent when the minute changes). No React state.
 */
const ClockProgress = forwardRef<ClockProgressHandle>(function ClockProgress(_, ref) {
  const rootEl = useRef<HTMLDivElement>(null);
  const timeEl = useRef<HTMLSpanElement>(null);
  const sunEl = useRef<HTMLSpanElement>(null);
  const setters = useRef<{ x: (v: number) => void; y: (v: number) => void } | null>(null);
  const last = useRef({ minute: -1, scene: -1 });

  useImperativeHandle(ref, () => ({
    setProgress(p: number) {
      const root = rootEl.current;
      const sun = sunEl.current;
      const time = timeEl.current;
      if (!root || !sun || !time) return;
      setters.current ??= { x: gsap.quickSetter(sun, "x", "px") as (v: number) => void, y: gsap.quickSetter(sun, "y", "px") as (v: number) => void };

      const minutes = progressToClockMinutes(p);
      const t = (minutes - DAY_START) / (DAY_END - DAY_START);
      setters.current.x(W / 2 - R * Math.cos(Math.PI * t) - DOT / 2);
      setters.current.y(H - 4 - R * Math.sin(Math.PI * t) - DOT / 2);

      const minute = Math.round(minutes);
      if (minute !== last.current.minute) {
        last.current.minute = minute;
        time.textContent = hhmm(minute);
      }
      // The accessible name updates once per scene change, not per frame.
      const scene = sceneAtProgress(p);
      if (scene !== last.current.scene) {
        last.current.scene = scene;
        root.dataset.on = scene >= 1 ? "true" : "false"; // hidden through the loader/intro scene
        root.setAttribute("aria-hidden", scene >= 1 ? "false" : "true");
        root.setAttribute("aria-label", `Time of day: ${hhmm(SCENES[Math.max(scene, 1)].clockMinutes!)}`);
      }
    },
  }));

  return (
    <div
      ref={rootEl}
      role="img"
      aria-hidden="true"
      aria-label="Time of day: 04:45"
      data-on="false"
      style={{ color: CLOCK_FG }}
      className="pointer-events-none fixed top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] z-40 flex flex-col items-center rounded-2xl bg-ink/80 px-3 pt-2 pb-1 opacity-0 transition-opacity duration-300 ease-out data-[on=true]:opacity-100 motion-reduce:transition-none"
    >
      <div className="relative" style={{ width: W, height: H }} aria-hidden="true">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="absolute inset-0" fill="none">
          <path d={`M${W / 2 - R} ${H - 4} A${R} ${R} 0 0 1 ${W / 2 + R} ${H - 4}`} className="stroke-current" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="2 5" strokeLinecap="round" />
          <path d={`M${W / 2 - R - 8} ${H - 4}H${W / 2 + R + 8}`} className="stroke-current" strokeOpacity="0.4" strokeWidth="1.5" />
        </svg>
        <span ref={sunEl} className="absolute top-0 left-0 block rounded-full bg-glow shadow-[0_0_0_2px_var(--ink)]" style={{ width: DOT, height: DOT }} />
      </div>
      <span ref={timeEl} aria-hidden="true" className="-mt-1 font-chunky text-clock font-semibold tabular-nums">
        04:45
      </span>
    </div>
  );
});

export default ClockProgress;
