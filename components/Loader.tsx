"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { refreshScroll, startScroll, stopScroll } from "@/lib/scroll";

/*
  The opening beat: a dark sky, one circle of light that grows with real load progress, then
  expands past the edges of the screen and hands off to Scene 0's title reveal (SCRIPT, Scene 0).

  Honesty rules this file follows:
  - Progress is the fraction of real steps finished (fonts, document load, `assets`). Nothing is faked.
  - The veil always leaves. Every step resolves on error, MAX_MS caps a stalled asset, and that timer
    plus the exit path live outside the GSAP context, so even a broken animation cannot trap the page
    behind a locked scroll.
  - The veil is in the server HTML, so the hero never flashes before it mounts; <noscript> removes it,
    and the title is only ever hidden by JS, so with JS off the page reads as plain content.
*/

const MIN_MS = 600; // floor, so a warm cache still reads as a deliberate opening rather than a flicker
const MAX_MS = 6000; // ceiling, so a stalled font or image can never hold the page
const DOT_VMIN = 18; // must match the dot's w-[18vmin] below (used to compute the cover scale)

/** Resolves once `url` is in cache. Errors resolve too: a missing asset must not hold the veil. */
function preloadImage(url: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = url; // Scene 0/1 art is SVG/WebP; audio is not part of the intro set
  });
}

function documentLoaded() {
  if (document.readyState === "complete") return Promise.resolve();
  return new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));
}

/** Scale at which the centred dot covers the viewport corner to corner. */
function coverScale() {
  const { innerWidth: w, innerHeight: h } = window;
  return Math.hypot(w, h) / ((DOT_VMIN / 100) * Math.min(w, h));
}

export default function Loader({
  assets,
  onComplete,
  reducedMotion,
}: {
  assets: string[];
  onComplete: () => void;
  reducedMotion: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Also read the live query: the hydration snapshot of `reducedMotion` is always false (see Experience).
    if (reducedMotion || prefersReducedMotion()) {
      onComplete(); // no veil, no scroll gate, no intro motion: the page is already readable
      return;
    }
    const el = root.current;
    if (!el) return;

    stopScroll();
    // The veil hides the real scroll position, so a browser-restored one would hand off mid-story.
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const started = performance.now();
    let done = false;
    let floorTimer = 0;

    /** The only exit. Unlocks the page and lets Experience unmount this veil. */
    const finish = () => {
      if (done) return;
      done = true;
      startScroll();
      refreshScroll(); // fonts and art settled while the veil was up
      onComplete();
    };
    // Reassigned to the choreographed version once (and only if) the animation is set up.
    let exit = finish;

    const steps: Promise<unknown>[] = [document.fonts.ready, documentLoaded(), ...assets.map(preloadImage)];

    const ctx = gsap.context(() => {
      const dot = el.querySelector<HTMLElement>("[data-loader-dot]");
      if (!dot) return;
      // Queried off the document, not the context scope: these live in Scene 0, outside this root.
      const words = Array.from(document.querySelectorAll<HTMLElement>("[data-intro-reveal] .split-word"));
      const prompt = Array.from(document.querySelectorAll<HTMLElement>("[data-intro-fade]"));
      // Hidden here rather than in CSS so the title still renders without JS. ctx.revert() restores it.
      gsap.set(words, { yPercent: 110, autoAlpha: 0 });
      gsap.set(prompt, { autoAlpha: 0, y: 16 });

      const grow = gsap.quickTo(dot, "scale", { duration: 0.5, ease: "power2.out" });
      const brighten = gsap.quickTo(dot, "opacity", { duration: 0.5, ease: "power2.out" });
      let settled = 0;
      const step = () => {
        const p = ++settled / steps.length;
        grow(0.2 + 0.8 * p); // SCRIPT: 0.2 -> 1 across the load
        brighten(0.55 + 0.45 * p);
      };
      steps.forEach((s) => s.then(step, step));

      exit = () => {
        if (done) return;
        done = true; // claimed here so the MAX_MS cap cannot cut the hand-off short
        gsap
          .timeline({
            onComplete: () => {
              startScroll();
              refreshScroll();
              onComplete();
            },
          })
          .to(dot, { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" })
          .to(dot, { scale: coverScale(), duration: 0.9, ease: "power4.inOut" })
          .to(el, { autoAlpha: 0, duration: 0.6, ease: "power2.out" }, "-=0.2")
          // The blur on the title glyphs is the one filter tween on the page: named exception to the
          // transform/opacity-only rule (plan §4.3 rule 5, Scene 0 note).
          .fromTo(
            words,
            { filter: "blur(10px)" },
            { yPercent: 0, autoAlpha: 1, filter: "blur(0px)", duration: 1, ease: "power4.out", stagger: 0.05 },
            "-=0.5",
          )
          .to(prompt, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 }, "-=0.55");
      };
    }, root);

    void Promise.allSettled(steps).then(() => {
      floorTimer = window.setTimeout(() => exit(), Math.max(0, MIN_MS - (performance.now() - started)));
    });
    const capTimer = window.setTimeout(() => exit(), MAX_MS);

    return () => {
      clearTimeout(floorTimer);
      clearTimeout(capTimer);
      ctx.revert(); // kills the tweens and restores the title's visible, unstyled state
      startScroll(); // never leave the page locked, however this unmounts
    };
  }, [assets, onComplete, reducedMotion]);

  return (
    <div
      ref={root}
      data-preloader
      className="fixed inset-0 z-60 grid place-items-center"
      // Same gradient as body::before, so the veil's fade-out has nothing to pop against.
      style={{ background: "linear-gradient(to bottom, var(--sky-top), var(--sky-bottom))" }}
    >
      <noscript>
        <style>{`[data-preloader]{display:none}`}</style>
      </noscript>
      <div aria-hidden="true" className="absolute aspect-square w-[42vmin] rounded-full bg-glow opacity-[0.12] blur-[6vmin]" />
      <div
        data-loader-dot
        aria-hidden="true"
        className="aspect-square w-[18vmin] rounded-full bg-glow"
        style={{ transform: "scale(0.2)", opacity: 0.55 }}
      />
      <p role="status" className="sr-only">
        Loading A Day in Dhaka
      </p>
    </div>
  );
}
