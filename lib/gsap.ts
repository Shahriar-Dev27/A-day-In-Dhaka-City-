// Client-only consumers. Registration is idempotent and skipped on the server.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // Mobile URL-bar show/hide fires resize; refreshing on it makes pinned/sticky scenes jump.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, useGSAP };


export const MOTION_QUERIES = {
  full: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
} as const; // used with gsap.matchMedia() in every scene

/** Live reduced-motion state. Call it inside an effect: a hydration snapshot is always false. */
export const prefersReducedMotion = () => window.matchMedia(MOTION_QUERIES.reduce).matches;
