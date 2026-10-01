"use client";

import { useRef } from "react";
import { Art, SplitWords, Stage, useSceneTimeline, type Line } from "./scene-kit";

const COPY = {
  title: { bn: "একটি দিন, ঢাকায়", en: "A Day in Dhaka" } satisfies Line,
  prompt: { bn: "নিচে স্ক্রল করুন", en: "Scroll to begin" } satisfies Line,
};

// Load progress drives the veil's dot in components/Loader.tsx, which expands over the screen and
// hands off to this one; scroll then expands this circle into the next sky.
// Takes SceneProps per contract; the placeholder uses none (reduced motion is handled by gsap.matchMedia).
export default function Scene0Intro() {
  const root = useRef<HTMLDivElement>(null);

  // Slot is 100svh, so the pinned range is zero: scrub from the top until the slot leaves the viewport.
  useSceneTimeline(
    root,
    (tl, mode, q) => {
      if (mode === "full") {
        tl.to(q("[data-dot]"), { scale: 5, autoAlpha: 0, transformOrigin: "50% 50%", duration: 0.6, ease: "power2.out" }, 0);
        tl.to(q("[data-halo]"), { scale: 1.6, autoAlpha: 0, transformOrigin: "50% 50%", duration: 0.8, ease: "power2.out" }, 0);
        tl.to(q("[data-beat]"), { y: -72, autoAlpha: 0, ease: "power2.out", stagger: 0.05, duration: 0.7 }, 0);
      } else {
        tl.to(q("[data-dot], [data-halo]"), { autoAlpha: 0, ease: "power2.out", duration: 0.8 }, 0);
        tl.to(q("[data-beat]"), { autoAlpha: 0, ease: "power2.out", duration: 0.7 }, 0);
      }
    },
    { text: false, start: "top top", end: "bottom top" },
  );

  return (
    <div ref={root} className="relative h-full">
      <Stage label={COPY.title.en}>
        <Art viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
          <circle data-halo cx="800" cy="450" r="260" className="fill-glow" opacity="0.14" />
          <circle data-halo cx="800" cy="450" r="150" className="fill-glow" opacity="0.2" />
          <circle data-dot cx="800" cy="450" r="64" className="fill-glow" />
        </Art>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-(--gutter) text-center">
          <h1 data-beat data-intro-reveal className="mt-[34svh]">
            <span lang="bn" className="block font-display text-display font-bold text-balance text-copy">
              <SplitWords text={COPY.title.bn} />
            </span>
            <span lang="en" className="mt-2 block text-sub font-medium tracking-wide text-copy-muted">
              <SplitWords text={COPY.title.en} />
            </span>
          </h1>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-[max(2rem,env(safe-area-inset-bottom))]">
          <div data-beat className="flex flex-col items-center gap-3 text-center">
            <p data-intro-fade lang="bn" className="font-display text-clock font-medium text-copy">
              {COPY.prompt.bn}
            </p>
            <p data-intro-fade lang="en" className="-mt-2 text-label uppercase text-copy-muted">
              {COPY.prompt.en}
            </p>
            <span aria-hidden="true" className="scroll-prompt block h-12 w-px bg-copy" />
          </div>
        </div>
      </Stage>
    </div>
  );
}
