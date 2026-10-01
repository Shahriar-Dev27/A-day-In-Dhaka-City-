import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";
import type { SceneId } from "./palette";

let lenis: Lenis | null = null;
let locked = false;
let velocity = 0; // px per second, signed (positive = down); see getScrollVelocity

const LOCK_CLASS = "scroll-locked"; // globals.css: overflow hidden, used only when Lenis is absent
const LENIS_CLASSES = ["lenis", "lenis-smooth", "lenis-scrolling", "lenis-stopped"];

// Lenis 1.3.x leaves a 400ms timer running after destroy() that can re-add its <html> classes.
function clearLenisClasses() {
  if (!lenis) document.documentElement.classList.remove(...LENIS_CLASSES);
}

/** Frame-rate independent scroll speed from the real scroll position (works with and without Lenis). */
function trackVelocity() {
  let last = window.scrollY;
  const tick = (_time: number, deltaMs: number) => {
    velocity = ((window.scrollY - last) / Math.max(deltaMs, 1)) * 1000;
    last = window.scrollY;
  };
  gsap.ticker.add(tick);
  return () => {
    gsap.ticker.remove(tick);
    velocity = 0;
  };
}

function applyLock() {
  if (lenis) lenis.stop();
  else document.documentElement.classList.add(LOCK_CLASS);
}
function releaseLock() {
  if (lenis) lenis.start();
  document.documentElement.classList.remove(LOCK_CLASS);
}

/**
 * reducedMotion=true  -> no Lenis; native scroll; ScrollTrigger still works.
 * reducedMotion=false -> Lenis driven by the single GSAP ticker (no autoRaf).
 * Returns cleanup: removes the ticker fns, destroys Lenis, restores lagSmoothing. Kills no triggers.
 */
export function initScroll(opts: { reducedMotion: boolean }): () => void {
  if (opts.reducedMotion) {
    const stopVelocity = trackVelocity();
    if (locked) applyLock();
    return () => {
      stopVelocity();
      document.documentElement.classList.remove(LOCK_CLASS);
    };
  }

  const instance = new Lenis({ lerp: 0.1 });
  lenis = instance;
  instance.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => instance.raf(time * 1000); // ticker seconds -> Lenis ms
  gsap.ticker.add(tick);
  const stopVelocity = trackVelocity(); // added after Lenis's tick, so it reads the updated position
  gsap.ticker.lagSmoothing(0);
  if (locked) applyLock();

  return () => {
    gsap.ticker.remove(tick); // remove before destroy, per design.md §4.3
    stopVelocity();
    gsap.ticker.lagSmoothing(500, 33); // GSAP defaults
    instance.destroy();
    if (lenis === instance) lenis = null;
    document.documentElement.classList.remove(LOCK_CLASS);
    clearLenisClasses();
    setTimeout(clearLenisClasses, 450); // after Lenis's own 400ms timer; skipped if a new instance is live
  };
}

export function getLenis(): Lenis | null {
  return lenis;
}

export function stopScroll(): void {
  locked = true;
  applyLock();
}

export function startScroll(): void {
  locked = false;
  releaseLock();
}

export function scrollToScene(id: SceneId, opts: { immediate?: boolean } = {}): void {
  const target = document.getElementById(`scene-${id}`);
  if (!target) return;
  if (lenis) lenis.scrollTo(target, { immediate: opts.immediate, duration: 1.6 });
  else target.scrollIntoView({ behavior: "auto" }); // reduced motion: no animated travel
}

/** Scroll speed at which getScrollVelocityNorm saturates at +-1 (a fast wheel flick or touch fling). */
export const VELOCITY_REF_PX_S = 3000;

/**
 * Signed scroll speed in px/second (positive = down), frame-rate independent and identical with or
 * without Lenis. Sampled once per GSAP tick (0 until initScroll has run).
 */
export function getScrollVelocity(): number {
  return velocity;
}

/** getScrollVelocity() clamped to -1..1 (VELOCITY_REF_PX_S = 1). Use for intensity / direction effects. */
export function getScrollVelocityNorm(): number {
  return Math.max(-1, Math.min(1, velocity / VELOCITY_REF_PX_S));
}

let refreshFrame = 0;

/** Call after a lazy scene mounts or its art loads. Calls in the same frame coalesce into one refresh. */
export function refreshScroll(): void {
  if (refreshFrame) return;
  refreshFrame = requestAnimationFrame(() => {
    refreshFrame = 0;
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  });
}
