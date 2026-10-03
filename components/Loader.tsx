"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import type { DeviceTier } from "@/lib/scenes";
import { refreshScroll, startScroll, stopScroll } from "@/lib/scroll";
import { IntroBulb, heatState } from "./scenes/intro/art";
import "./scenes/intro/intro.css";

/*
  The opening beat (SCRIPT-v2, Scene 0): one bare bulb on a wire in the dark. A veil (same sky as the
  page) carries the bulb; it warms from orange to gold and its halo grows with REAL load progress, swells
  at 100%, settles onto the 14px dot at the stage centre, and the veil cross-fades onto Scene 0's own
  (pixel-identical) rest bulb while the title rises out of the light.

  Honesty rules this file follows:
  - Progress is the fraction of real steps finished: the load event, document.fonts.ready, and one
    document.fonts.load per distinct face/size the intro text actually uses (so the subsets the title
    needs, not a guess), plus `assets`. Nothing is faked; the warm-up is only smoothed over 0.9 s.
  - The veil always leaves. Every step resolves on error, MAX_MS caps a stalled asset, and that timer
    plus the exit path live outside the animation, so even a broken animation cannot trap the page behind
    a locked scroll. Scroll unlocks as soon as the bulb has settled, not at the end of the title reveal.
  - The veil is in the server HTML (the bulb is in the first paint, at 0% heat), so the hero never flashes
    before it mounts; <noscript> removes it, and the title is only ever hidden by JS.
*/

const MIN_MS = 500; // floor from hydration, so a warm cache still reads as a bulb warming up rather than a flicker
const MAX_MS = 6000; // ceiling, so a stalled font or image can never hold the page
const SWING_DEG = 0.7; // "a hair": ~6px at the bulb

/** Resolves once `url` is in cache. Errors resolve too: a missing asset must not hold the veil. */
function preloadImage(url: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = url;
  });
}

function documentLoaded() {
  if (document.readyState === "complete") return Promise.resolve();
  return new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));
}

/** Load the exact face (family, weight, size) and glyph subset an intro text element renders with. */
function loadFaceFor(el: HTMLElement) {
  const cs = getComputedStyle(el);
  const raw = el.textContent ?? "";
  const text = cs.textTransform === "uppercase" ? raw.toUpperCase() : raw;
  return document.fonts.load(`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`, text);
}

export default function Loader({
  assets,
  onComplete,
  reducedMotion,
  tier,
}: {
  assets: string[];
  onComplete: () => void;
  reducedMotion: boolean;
  tier: DeviceTier;
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
    const restoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const started = performance.now();
    let done = false;
    let disposed = false;
    let floorTimer = 0;

    const unlock = () => {
      startScroll();
      refreshScroll(); // fonts and art settled while the veil was up
      performance.mark("dhaka:first-scene-ready");
    };
    /** The only exit until the animation is set up. Unlocks the page and lets Experience unmount this veil. */
    const finish = () => {
      if (done) return;
      done = true;
      unlock();
      onComplete();
    };
    // Reassigned to the choreographed version once (and only if) the animation is set up.
    let exit = finish;

    // Distinct faces the intro text uses (title/prompt, Bangla and English).
    const probes = Array.from(document.querySelectorAll<HTMLElement>("[data-font-probe]"));
    const steps: Promise<unknown>[] = [documentLoaded(), document.fonts.ready, ...probes.map(loadFaceFor), ...assets.map(preloadImage)];

    const ctx = gsap.context(() => {
      // Queried off the document, not the context scope: these live in Scene 0, outside this root.
      const words = Array.from(document.querySelectorAll<HTMLElement>("[data-intro-reveal] .split-word:not([data-letter])"));
      const letters = Array.from(document.querySelectorAll<HTMLElement>("[data-intro-reveal] [data-letter]"));
      const rules = Array.from(document.querySelectorAll<HTMLElement>("[data-intro-reveal] [data-rule]"));
      const prompt = Array.from(document.querySelectorAll<HTMLElement>("[data-intro-fade]"));
      const one = (s: string) => el.querySelector<HTMLElement | SVGElement>(s);
      const swing = one("[data-swing]");
      const swell = one("[data-swell]");
      const halo = one("[data-halo]");
      const gold = one("[data-gold]");
      const glassBase = one("[data-glass-base]");
      const glassGold = one("[data-glass-gold]");
      const hot = one("[data-hot]");
      const dot = one("[data-dot]");
      if (!swing || !swell || !halo || !gold || !glassBase || !glassGold || !hot || !dot) return;
      // Hidden here rather than in CSS so the title still renders without JS. ctx.revert() restores it.
      gsap.set(words, { yPercent: 110, autoAlpha: 0 });
      gsap.set(letters, { yPercent: 110, autoAlpha: 0 });
      gsap.set(rules, { scaleX: 0, transformOrigin: "50% 50%" });
      gsap.set(prompt, { autoAlpha: 0, y: 16 });

      // The bulb hangs and sways a hair until it is switched fully on.
      const sway = gsap.fromTo(swing, { rotation: -SWING_DEG }, { rotation: SWING_DEG, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });

      // Real progress -> one heat value, smoothed, written through quick setters (transform/opacity only).
      const set = {
        halo: gsap.quickSetter(halo, "scaleX"),
        haloY: gsap.quickSetter(halo, "scaleY"),
        haloAlpha: gsap.quickSetter(halo, "opacity"),
        gold: gsap.quickSetter(gold, "opacity"),
        glassBase: gsap.quickSetter(glassBase, "opacity"),
        glassGold: gsap.quickSetter(glassGold, "opacity"),
        dot: gsap.quickSetter(dot, "opacity"),
      };
      const heat = { v: 0 };
      const apply = () => {
        const s = heatState(heat.v);
        set.halo(s.halo);
        set.haloY(s.halo);
        set.haloAlpha(s.haloAlpha);
        set.gold(s.gold);
        set.glassBase(s.glassBase);
        set.glassGold(s.glassGold);
        set.dot(s.dot);
      };
      let settled = 0;
      const step = () => {
        if (done || disposed) return;
        const to = ++settled / steps.length;
        ctx.add(() => gsap.to(heat, { v: to, duration: 0.9, ease: "power2.out", overwrite: true, onUpdate: apply }));
      };
      steps.forEach((s) => s.then(step, step));

      exit = () => {
        if (done) return;
        done = true; // claimed here so the MAX_MS cap cannot cut the hand-off short
        // Created from a timer, outside the context's callback: add() so a revert also kills it.
        ctx.add(() => {
          sway.kill();
          gsap
            .timeline({ onComplete })
            // full heat, the swing damps out, the bulb swells and flares to its hottest
            .to(heat, { v: 1, duration: 0.3, ease: "power2.out", onUpdate: apply }, 0)
            .to(swing, { rotation: 0, duration: 0.7, ease: "power2.out" }, 0)
            .to(swell, { scale: 1.7, duration: 0.35, ease: "power2.out" }, 0.1)
            .to(hot, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0.1)
            // ...then settles back onto the 14px dot (scale 1 = Scene 0's rest bulb, pixel for pixel)
            .to(swell, { scale: 1, duration: 0.6, ease: "power3.out" }, 0.45)
            .to(hot, { opacity: 0, duration: 0.5, ease: "power2.out" }, 0.45)
            .call(unlock, undefined, 0.9)
            // the veil cross-fades onto the identical rest bulb underneath
            .to(el, { autoAlpha: 0, duration: 0.25, ease: "power2.out" }, 0.9)
            // the title rises out of the light: rules draw, Bangla words rise (blur to sharp: the one
            // filter tween on the page, a named exception to transform/opacity-only), then the English letters
            .to(rules, { scaleX: 1, duration: 0.8, ease: "power3.out", stagger: 0.08 }, 0.95)
            .fromTo(
              words,
              { filter: "blur(8px)" },
              { yPercent: 0, autoAlpha: 1, filter: "blur(0px)", clearProps: "filter", duration: 1, ease: "power3.out", stagger: 0.12 },
              1.05,
            )
            .to(letters, { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out", stagger: 0.035 }, 1.5)
            .to(prompt, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 }, 2.1);
        });
      };
    }, root);

    void Promise.allSettled(steps).then(() => {
      if (disposed) return;
      floorTimer = window.setTimeout(() => exit(), Math.max(0, MIN_MS - (performance.now() - started)));
    });
    const capTimer = window.setTimeout(() => exit(), MAX_MS);

    return () => {
      disposed = true;
      clearTimeout(floorTimer);
      clearTimeout(capTimer);
      ctx.revert(); // kills the tweens and restores the title's visible, unstyled state
      startScroll(); // never leave the page locked, however this unmounts
      history.scrollRestoration = restoration;
    };
  }, [assets, onComplete, reducedMotion]);

  return (
    <div ref={root} data-preloader className="intro-veil">
      <noscript>
        <style>{`[data-preloader]{display:none}`}</style>
      </noscript>
      <IntroBulb heat={0} low={tier === "low"} />
      <p role="status" className="sr-only">
        Loading A Day in Dhaka
      </p>
    </div>
  );
}
