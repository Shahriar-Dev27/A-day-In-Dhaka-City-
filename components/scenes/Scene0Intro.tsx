"use client";

import { useRef } from "react";
import { COPY } from "@/lib/copy";
import { voiceIdFor } from "@/lib/voice";
import type { SceneProps } from "@/lib/scenes";
import { SplitWords, Stage, useLiveGate, useSceneTimeline } from "./scene-kit";
import { DriftIn, IntroBulb } from "./intro/art";
import "./intro/intro.css";

const { title, prompt } = COPY[0].extra!;

/** English title, one masked span per letter (Latin only: Bangla is never split below the word). */
function Letters({ text }: { text: string }) {
  return text.split(" ").map((word, w) => (
    <span key={w} className="intro-word" aria-hidden="true">
      {[...word].map((ch, i) => (
        <span key={i} className="split-mask">
          <span data-letter className="split-word">
            {ch}
          </span>
        </span>
      ))}
    </span>
  ));
}

/*
  Scene 0: the bulb. This file draws the REST state (a warm bulb on its wire at the stage centre, the
  title lockup, the scroll prompt); components/Loader.tsx draws the identical bulb in its veil, warms it
  with real load progress, swells it, then reveals the title/prompt below by animating the elements
  marked data-intro-reveal, data-intro-fade, data-letter and data-rule (its context reverts to this state, so every default here is
  the final, visible one). Scroll then owns the hand-off: the title lifts away, the bulb lifts out, and
  the first mist and overhead wires drift in from the bottom toward Scene 1's night tong.
  Property owners: Loader = the title's words/letters/rules and the prompt's items; this timeline = the
  [data-beat] wrappers, [data-bulb-scroll] and [data-drift]; CSS = the lamp's breathing and the prompt line.
*/
export default function Scene0Intro({ tier }: SceneProps) {
  const root = useRef<HTMLDivElement>(null);
  const low = tier === "low";
  useLiveGate(root);

  // Slot is 100svh, so the pinned range is zero: scrub from the top until the slot leaves the viewport.
  useSceneTimeline(
    root,
    0,
    (tl, mode, q) => {
      if (mode === "full") {
        tl.to(q("[data-bulb-scroll]"), { yPercent: -16, autoAlpha: 0, duration: 0.6, ease: "power2.out" }, 0);
        tl.to(q("[data-beat]"), { y: -72, autoAlpha: 0, ease: "power2.out", stagger: 0.05, duration: 0.7 }, 0);
        tl.fromTo(q("[data-drift]"), { yPercent: 26, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, ease: "power2.out", stagger: 0.1, duration: 0.5, immediateRender: true }, 0.4);
      } else {
        tl.to(q("[data-bulb-scroll]"), { autoAlpha: 0, ease: "power2.out", duration: 0.6 }, 0);
        tl.to(q("[data-beat]"), { autoAlpha: 0, ease: "power2.out", duration: 0.7 }, 0);
        tl.fromTo(q("[data-drift]"), { autoAlpha: 0 }, { autoAlpha: 1, ease: "power2.out", stagger: 0.1, duration: 0.5, immediateRender: true }, 0.4);
      }
    },
    { narration: false, start: "top top", end: "bottom top" },
  );

  return (
    <div ref={root} className="intro-stage relative h-full">
      <Stage label={title.en}>
        <div aria-hidden="true" className="absolute inset-0">
          <DriftIn low={low} />
        </div>
        <div data-bulb-scroll aria-hidden="true" className="absolute inset-0">
          <IntroBulb heat={1} low={low} />
        </div>

        <div className="absolute inset-x-0 top-[65svh] flex justify-center px-(--gutter)">
          <h1 data-beat data-intro-reveal className="intro-lockup">
            <i data-rule="top" className="intro-rule" aria-hidden="true" />
            <span lang="bn" data-font-probe data-voice={voiceIdFor(title.bn)} className="intro-title-bn font-display text-copy">
              <SplitWords text={title.bn} />
            </span>
            <span lang="en" data-font-probe className="intro-title-en font-sans text-copy-muted">
              <span className="sr-only">{title.en}</span>
              <Letters text={title.en} />
            </span>
            <i data-rule="bottom" className="intro-rule" aria-hidden="true" />
          </h1>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div data-beat className="flex flex-col items-center gap-1 text-center">
            <p data-intro-fade data-font-probe lang="bn" className="intro-prompt-bn font-display font-medium text-copy">
              {prompt.bn}
            </p>
            <p data-intro-fade data-font-probe lang="en" className="text-label uppercase text-copy-muted">
              {prompt.en}
            </p>
            <span data-intro-fade aria-hidden="true" className="mt-2 block">
              <span className="scroll-prompt block h-9 w-px bg-copy" />
            </span>
          </div>
        </div>
      </Stage>
    </div>
  );
}
