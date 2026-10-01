"use client";

/*
  Shared plumbing for every scene so the §4.3 contract is enforced in one place:
  - Stage: the sticky 100svh stage (rule 1/2/8)
  - useSceneTimeline: useGSAP + gsap.matchMedia full/reduce branches, trigger = the slot (rules 3/4)
  - SceneText: real DOM text with lang attributes (rule 7)
  - SplitWords: masked per-word spans for the one-shot intro reveal (Loader hands off to these)
  Final art replaces the SVG inside each scene file; none of this changes.
*/

import { Fragment, type ReactNode, type RefObject, type SVGProps } from "react";
import { gsap, useGSAP, MOTION_QUERIES } from "@/lib/gsap";
import { BEAT_IN } from "@/lib/scenes";

export type SceneMode = "full" | "reduce";
export type Select = (selector: string) => Element[];

export interface Line {
  bn: string;
  en: string;
}

interface TimelineOptions {
  close?: boolean;
  returnToCity?: boolean;
  /** Wide-shot text (time chip, then Bangla+English line) leaves before the close. */
  text?: boolean;
  /** A 200svh slot scrubs over 170svh, starting as its top reaches 70% of the viewport. */
  start?: string;
  end?: string;
}

/**
 * Build one scrubbed timeline per motion mode. Positions are fractions 0..1 of the slot's
 * range (the timeline is padded to exactly 1). Animate transform/opacity only (rule 5).
 * Reduce mode must use opacity only (rule 4); builders receive `mode` to branch.
 */
export function useSceneTimeline(
  root: RefObject<HTMLDivElement | null>,
  build: (tl: gsap.core.Timeline, mode: SceneMode, q: Select) => void | (() => void),
  { text = true, close = false, returnToCity = true, start = "top 70%", end = "bottom bottom" }: TimelineOptions = {},
) {
  useGSAP(
    () => {
      const el = root.current;
      const slot = el?.parentElement;
      if (!el || !slot) return;
      const q: Select = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      mm.add({ full: MOTION_QUERIES.full, reduce: MOTION_QUERIES.reduce }, (ctx) => {
        const mode: SceneMode = ctx.conditions?.reduce ? "reduce" : "full";
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: slot, start, end, scrub: true, invalidateOnRefresh: true },
        });
        if (text) {
          const beats = q("[data-beat]");
          const move = mode === "full";
          // Hide every beat up front (reverted by mm.revert()). A staggered fromTo only applies its
          // from-state to the first target until the playhead reaches the rest, which flashed beat 2.
          gsap.set(beats, { autoAlpha: 0, ...(move && { y: 16 }) });
          // Timing is mirrored by BEAT_IN / BEAT_OUT_END in lib/scenes.ts (sky holds while text shows).
          tl.to(beats, { autoAlpha: 1, ...(move && { y: 0 }), duration: 0.06, ease: "power2.out", stagger: 0.02 }, BEAT_IN);
          tl.to(beats, { autoAlpha: 0, ...(move && { y: -12 }), duration: 0.06, ease: "power2.out", stagger: 0.02 }, 0.28);
        }
        if (close) {
          const move = mode === "full";
          const city = q("[data-city]");
          const detail = q("[data-close]");
          const lines = q("[data-beat-close]");
          gsap.set(detail, { autoAlpha: 0, ...(move && { scale: 1.08 }) });
          if (lines.length) gsap.set(lines, { autoAlpha: 0 });
          tl.to(city, { autoAlpha: 0, ...(move && { scale: 1.12 }), duration: 0.1 }, 0.36)
            .to(detail, { autoAlpha: 1, ...(move && { scale: 1 }), duration: 0.1 }, 0.36);
          if (lines.length) tl.to(lines, { autoAlpha: 1, duration: 0.04, stagger: 0.02 }, 0.5)
            .to(lines, { autoAlpha: 0, duration: 0.04, stagger: 0.02 }, 0.62);
          if (returnToCity) tl.to(detail, { autoAlpha: 0, ...(move && { scale: 1.08 }), duration: 0.1 }, 0.7)
            .to(city, { autoAlpha: 1, ...(move && { scale: 1 }), duration: 0.1 }, 0.7);
        }
        const cleanup = build(tl, mode, q);
        if (tl.duration() < 1) tl.set({}, {}, 1);
        return cleanup;
      });
      return () => mm.revert();
    },
    { scope: root },
  );
}

export function Stage({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="sticky top-0 h-svh overflow-clip">
      {children}
    </div>
  );
}

/** Full-bleed decorative art. Bottom-anchored and cropped (slice) so the skyline always meets the floor. */
export function Art({
  viewBox = "0 0 1600 900",
  className = "",
  ...rest
}: SVGProps<SVGSVGElement> & { viewBox?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMax slice"
      className={`absolute inset-0 h-full w-full ${className}`}
      {...rest}
    />
  );
}

export function SceneText({ time, line, children }: { time: Line; line: Line; children?: ReactNode }) {
  return (
    <div className="absolute inset-x-0 top-[16svh] px-(--gutter)">
      <p data-beat className="mb-3 flex items-baseline gap-3 font-chunky text-clock font-semibold text-copy">
        <span lang="bn" className="font-display">{time.bn}</span>
        <span lang="en" className="font-sans text-label font-medium uppercase text-copy-muted">
          {time.en}
        </span>
      </p>
      <div data-beat className="max-w-[40rem]">
        <p lang="bn" className="font-display text-line font-semibold text-balance text-copy">
          {line.bn}
        </p>
        <p lang="en" className="mt-2 max-w-[36ch] text-sub text-pretty text-copy-muted">
          {line.en}
        </p>
      </div>
      {children}
    </div>
  );
}

/**
 * Wraps each word of `text` in an overflow-masked span so a word can slide in from under its own
 * line. Words, never letters: splitting Bangla below the word breaks conjuncts and matra placement.
 * The spans stay inside the parent paragraph, so the sentence is still one run of real text for
 * screen readers, copy/paste and search. Only `components/Loader.tsx` animates them today; with JS
 * off they are plain text in their final position.
 */
export function SplitWords({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={`${i}-${word}`}>
          <span className="split-mask">
            <span className="split-word">{word}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}
