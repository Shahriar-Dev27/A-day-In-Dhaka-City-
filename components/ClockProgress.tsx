"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { DAYPART } from "@/lib/copy";
import { progressToClockMinutes, SCENES, SCENE_OFFSETS, SCROLL_RANGE_SVH } from "@/lib/scenes";

export interface ClockProgressHandle {
  setProgress(p: number): void;
}

const DAY_START = SCENES[1].clockMinutes!; // 4:45 AM
const DAY_END = SCENES[SCENES.length - 1].clockMinutes!; // 11:45 PM

/** 12-hour clock, no leading zero ("4:45" + "AM"), the same format the aria-label uses. */
function clock12(minutes: number) {
  const m = Math.round(minutes) % 1440;
  const h = Math.floor(m / 60);
  return { time: `${h % 12 || 12}:${String(m % 60).padStart(2, "0")}`, meridiem: h < 12 ? "AM" : "PM" };
}

function daypart(minutes: number) {
  let word = DAYPART[0].bn;
  for (const d of DAYPART) if (minutes >= d.from) word = d.bn;
  return word;
}

function sceneAtProgress(p: number) {
  const s = p * SCROLL_RANGE_SVH;
  let id = 0;
  for (let i = 0; i < SCENES.length; i++) if (s >= SCENE_OFFSETS[i] - 1e-6) id = i; // epsilon: p * RANGE can land a hair under a slot top
  return id;
}

/**
 * A printed ticket, top-right: paper plate (the same SLIP colours as the speech slips, so contrast never
 * depends on the sky), a hard offset accent plate, the time in the grotesk, a perforated stub with the
 * Bangla part of the day, and a hairline rule that fills with the day. Driven entirely by refs: setProgress
 * runs per scroll frame and only touches DOM nodes (quickSetter for the rule, textContent when a value
 * changes). No React state.
 */
const ClockProgress = forwardRef<ClockProgressHandle>(function ClockProgress(_, ref) {
  const rootEl = useRef<HTMLDivElement>(null);
  const timeEl = useRef<HTMLSpanElement>(null);
  const meridiemEl = useRef<HTMLSpanElement>(null);
  const partEl = useRef<HTMLSpanElement>(null);
  const barEl = useRef<HTMLSpanElement>(null);
  const setBar = useRef<((v: number) => void) | null>(null);
  const last = useRef({ minute: -1, scene: -1, part: "", meridiem: "" });

  useImperativeHandle(ref, () => ({
    setProgress(p: number) {
      const root = rootEl.current;
      const time = timeEl.current;
      const bar = barEl.current;
      if (!root || !time || !bar || !meridiemEl.current || !partEl.current) return;
      setBar.current ??= gsap.quickSetter(bar, "scaleX") as (v: number) => void;

      const minutes = progressToClockMinutes(p);
      setBar.current(Math.min(1, Math.max(0, (minutes - DAY_START) / (DAY_END - DAY_START))));

      const minute = Math.round(minutes);
      if (minute !== last.current.minute) {
        last.current.minute = minute;
        const { time: t, meridiem } = clock12(minute);
        time.textContent = t;
        if (meridiem !== last.current.meridiem) {
          last.current.meridiem = meridiem;
          meridiemEl.current.textContent = meridiem;
        }
        const part = daypart(minute);
        if (part !== last.current.part) {
          last.current.part = part;
          partEl.current.textContent = part;
        }
      }
      // The accessible name updates once per scene change, not per frame.
      const scene = sceneAtProgress(p);
      if (scene !== last.current.scene) {
        last.current.scene = scene;
        root.dataset.on = scene >= 1 ? "true" : "false"; // hidden through the loader/intro scene
        root.setAttribute("aria-hidden", scene >= 1 ? "false" : "true");
        const { time: t, meridiem } = clock12(SCENES[Math.max(scene, 1)].clockMinutes!);
        root.setAttribute("aria-label", `Time of day: ${t} ${meridiem}`);
      }
    },
  }));

  return (
    <div
      ref={rootEl}
      role="img"
      aria-hidden="true"
      aria-label="Time of day: 4:45 AM"
      data-on="false"
      className="pointer-events-none fixed top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] z-40 rounded-[2px] bg-(--slip-bg) text-(--slip-fg) opacity-0 shadow-[2px_2px_0_var(--accent)] transition-opacity duration-200 ease-out data-[on=true]:opacity-100 motion-reduce:transition-none"
    >
      <div className="flex items-stretch" aria-hidden="true">
        <div className="flex items-baseline gap-1.5 px-3 pt-2 pb-1.5">
          <span ref={timeEl} className="inline-block min-w-[4.6ch] font-sans text-clock leading-none font-semibold tabular-nums">
            4:45
          </span>
          <span ref={meridiemEl} className="font-sans text-label uppercase">
            AM
          </span>
        </div>
        <div className="flex min-w-[3.4rem] items-center justify-center border-l border-dashed border-current/45 px-2">
          <span ref={partEl} lang="bn" className="font-display text-[0.9375rem] leading-none font-semibold">
            ভোর
          </span>
        </div>
      </div>
      <div className="h-[3px] bg-current/15" aria-hidden="true">
        <span ref={barEl} className="block h-full origin-left bg-current" style={{ transform: "scaleX(0)" }} />
      </div>
    </div>
  );
});

export default ClockProgress;
