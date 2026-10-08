"use client";

/*
  Shared plumbing for every scene so the contract (v1 plan 4.3 + v2 plan 3.3) is enforced in one place:
  - Stage: the sticky 100svh stage; `.stage` defines --u / --tong-origin (rule 1/2/8)
  - useSceneTimeline: useGSAP + gsap.matchMedia full/reduce branches, trigger = the slot (rules 3/4);
    reads the trigger start and the narration window from SCENES[id]
  - Camera: the one transform target that holds a scene's Art + SpeechSlips
  - Narration / SpeechSlip: the two text registers (real DOM text with lang attributes, rule 7)
  - SplitWords: masked per-word spans for the one-shot intro reveal (Loader hands off to these)
  Final art replaces the SVG inside each scene file; none of this changes.
*/

import { Fragment, useEffect, type CSSProperties, type ReactNode, type RefObject, type SVGProps } from "react";
import { gsap, useGSAP, MOTION_QUERIES } from "@/lib/gsap";
import type { Line } from "@/lib/copy";
import type { SceneId } from "@/lib/palette";
import { SCENES } from "@/lib/scenes";
import { voiceIdFor } from "@/lib/voice";

export type { Line } from "@/lib/copy";
export type SceneMode = "full" | "reduce";
export type Select = (selector: string) => Element[];

interface TimelineOptions {
  /** Defaults from SCENES[id].triggerStartSvh: -70 -> "top 70%", 0 -> "top top". */
  start?: string;
  end?: string;
  /** Fade `[data-narration]` in/out over SCENES[id].narration (default true). */
  narration?: boolean;
}

/**
 * Build one scrubbed timeline per motion mode. Positions are fractions 0..1 of the trigger range
 * (the timeline is padded to exactly 1). Animate transform/opacity only (rule 5).
 * Reduce mode must use opacity only (rule 4); builders receive `mode` to branch.
 */
export function useSceneTimeline(
  root: RefObject<HTMLDivElement | null>,
  id: SceneId,
  build: (tl: gsap.core.Timeline, mode: SceneMode, q: Select) => void | (() => void),
  { narration = true, start, end = "bottom bottom" }: TimelineOptions = {},
) {
  useGSAP(
    () => {
      const el = root.current;
      const slot = el?.parentElement;
      if (!el || !slot) return;
      const meta = SCENES[id];
      const q: Select = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      mm.add({ full: MOTION_QUERIES.full, reduce: MOTION_QUERIES.reduce }, (ctx) => {
        const mode: SceneMode = ctx.conditions?.reduce ? "reduce" : "full";
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: slot, start: start ?? `top ${-meta.triggerStartSvh}%`, end, scrub: true, invalidateOnRefresh: true },
        });
        if (narration) {
          const lines = q("[data-narration]");
          const move = mode === "full";
          // Hidden up front (reverted by mm.revert()). Timing is mirrored by textWindowSvh in lib/scenes.ts
          // (the sky holds this scene's palette while the narration is visible).
          gsap.set(lines, { autoAlpha: 0, ...(move && { y: 16 }) });
          tl.to(lines, { autoAlpha: 1, ...(move && { y: 0 }), duration: 0.06, ease: "power2.out" }, meta.narration.in);
          tl.to(lines, { autoAlpha: 0, ...(move && { y: -12 }), duration: 0.06, ease: "power2.out" }, meta.narration.outEnd - 0.06);
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

/**
 * Pauses the scene's ambient CSS loops while its slot is off-screen: sets data-live on the scene root,
 * which `.loop` rules in globals.css read. One IntersectionObserver per scene, cleaned up on unmount.
 */
export function useLiveGate(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = root.current;
    const slot = el?.parentElement;
    if (!el || !slot) return;
    const io = new IntersectionObserver(([entry]) => {
      el.dataset.live = String(entry.isIntersecting);
    });
    io.observe(slot);
    return () => io.disconnect();
  }, [root]);
}

/** `.stage` (globals.css) defines --u, the px size of one 1600x900 art unit, and --tong-origin. */
export function Stage({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="stage sticky top-0 h-svh overflow-clip">
      {children}
    </div>
  );
}

/**
 * The scene's single camera: scrub one glide on it (xPercent/scale, origin = the tong). Holds the Art
 * and the SpeechSlips; Narration and the clock stay outside so they never move with the camera.
 */
export function Camera({ children, origin }: { children: ReactNode; origin?: string }) {
  return (
    <div data-camera className="absolute inset-0" style={{ transformOrigin: origin ?? "var(--tong-origin)" }}>
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

/** Register 1: one calm line per scene in a reserved top-left band, on the sky. */
export function Narration({ line }: { line: Line }) {
  return (
    <div data-narration data-voice={voiceIdFor(line.bn)} className="absolute inset-x-(--gutter) top-[12svh] max-w-[34rem]">
      {/* printed caption mark: a short hairline above the line, in the text colour */}
      <span aria-hidden="true" className="mb-3 block h-px w-12 bg-copy" />
      <p lang="bn" className="font-display text-line font-semibold text-balance text-copy">
        {line.bn}
      </p>
      <p lang="en" className="mt-2 font-sans text-sub text-pretty text-copy-muted">
        {line.en}
      </p>
    </div>
  );
}

/**
 * Register 2: a printed paper slip anchored to a point (x, y) of the 1600x900 art, placed INSIDE
 * <Camera>. `--u` (see .stage) makes the anchor exact for the xMidYMax slice. side="right" (default)
 * grows rightwards from the anchor, "left" leftwards, via left/right rather than a transform, so the
 * timeline owns transform/opacity alone. Hidden (CSS) until the scene's timeline reveals it.
 */
export function SpeechSlip({ line, x, y, side = "right", beat }: { line: Line; x: number; y: number; side?: "left" | "right"; beat?: string }) {
  const dx = `${x - 800} * var(--u)`;
  return (
    <div
      data-slip={beat ?? ""}
      data-voice={voiceIdFor(line.bn)}
      data-side={side}
      className="slip"
      style={{ bottom: `calc(${900 - y} * var(--u))`, ...(side === "right" ? { left: `calc(50% + ${dx})` } : { right: `calc(50% - ${dx})` }) }}
    >
      <p lang="bn" className="font-chunky text-slip font-semibold">
        “{line.bn}”
      </p>
      <p lang="en" className="mt-1 font-sans text-label uppercase">
        {line.en}
      </p>
    </div>
  );
}

/**
 * Anchor-box recipe for a slip that must ride a figure inside a PANNING layer (not the Camera's xMidYMax
 * slice). SpeechSlip's maths assume art x 800 = box centre and `--u` = px per art unit; this box is one
 * art-screen wide, centred on the figure's x in the layer's own coordinates and with `--u` rebound to the
 * layer's unit, so `<SpeechSlip x={800} y={headY} />` inside it lands exactly on that figure and moves
 * with it. `unit` is the layer's px-per-art-unit CSS length (Scene 3: "var(--ju)"). The layer must be
 * `position: absolute` and as tall as the stage; y is in the same 900-unit art height.
 */
export function SlipAnchor({ x, unit, children }: { x: number; unit: string; children: ReactNode }) {
  return (
    <div className="absolute top-0 h-full" style={{ left: `calc(${x - 800} * ${unit})`, width: `calc(1600 * ${unit})`, "--u": unit } as CSSProperties}>
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
