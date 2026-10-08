"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger, useGSAP, MOTION_QUERIES, prefersReducedMotion } from "@/lib/gsap";
import { getDeviceTier } from "@/lib/device";
import { palette, toCssVarObject, via, type SceneId } from "@/lib/palette";
import { initScroll, refreshScroll, scrollToScene } from "@/lib/scroll";
import { SCENES, skyAnchors, type DeviceTier, type SceneMeta, type SceneProps } from "@/lib/scenes";
import ClockProgress, { type ClockProgressHandle } from "./ClockProgress";
import Loader from "./Loader";
import SoundToggle from "./SoundToggle";
import Scene0Intro from "./scenes/Scene0Intro";
import Scene1Fajr from "./scenes/Scene1Fajr";
import RisoDefs from "./scenes/tong/RisoDefs";

// Shown while a lazy scene's chunk loads: the slot already reserves its height, so this only
// needs to avoid an empty frame. Scenes 2-8 fetch nothing until their slot renders (§4.3 rule 10).
function SceneFallback() {
  return (
    <div className="relative h-full" aria-hidden="true">
      <div className="sticky top-0 h-svh overflow-clip">
        <div className="absolute inset-x-0 bottom-0 h-[28svh] bg-ink/60" />
      </div>
    </div>
  );
}

function RefreshOnMount({ children }: { children: ReactNode }) {
  // Child effects (the scene's useGSAP) run first, so the refresh sees its triggers.
  useEffect(() => refreshScroll(), []);
  return children;
}

function lazyScene(load: () => Promise<{ default: ComponentType<SceneProps> }>) {
  return dynamic(
    () =>
      load().then(({ default: Scene }) => ({
        default: function LoadedScene(props: SceneProps) {
          return (
            <RefreshOnMount>
              <Scene {...props} />
            </RefreshOnMount>
          );
        },
      })),
    { ssr: false, loading: () => <SceneFallback /> },
  );
}

const SCENE_COMPONENTS: readonly ComponentType<SceneProps>[] = [
  Scene0Intro,
  Scene1Fajr,
  lazyScene(() => import("./scenes/Scene2Morning")),
  lazyScene(() => import("./scenes/Scene3Jam")),
  lazyScene(() => import("./scenes/Scene4Metro")),
  lazyScene(() => import("./scenes/Scene5Noon")),
  lazyScene(() => import("./scenes/Scene6Rooftop")),
  lazyScene(() => import("./scenes/Scene7Adda")),
  lazyScene(() => import("./scenes/Scene8Closing")),
];

const EAGER_SCENES = 2; // scenes 0-1 are static imports and mount immediately

function SceneSlot({ meta, children }: { meta: SceneMeta; children: ReactNode }) {
  // Height = scroll budget, so it stays reserved while the scene is unmounted. Lazy scenes mount
  // (which is what triggers the chunk fetch) once the slot is within ~1 viewport, then stay mounted.
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(meta.id < EAGER_SCENES);
  useEffect(() => {
    const el = ref.current;
    if (near || !el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);
  return (
    <section ref={ref} id={`scene-${meta.id}`} data-scene={meta.id} style={{ height: `${meta.scrollLength}svh` }} className="relative">
      {near ? children : null}
    </section>
  );
}

function subscribeReduce(cb: () => void) {
  const mq = window.matchMedia(MOTION_QUERIES.reduce);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const noopSubscribe = () => () => {};

// The Loader's preload set. Scenes 0-1 are inline SVG (no image files), so the honest progress is the
// load event + fonts (one step per face/subset the intro text uses); add any Scene 0/1 file here (docs/assets.md).
const INTRO_ASSETS: string[] = [];

// The sky holds each scene's palette for as long as that scene's narration is on screen
// (lib/scenes.ts skyAnchors), then eases to the next palette while no text is visible. That keeps
// every narration/sky pair at its audited contrast, including across the dark/light inversions.

// Dev-only (absent in production): a 16px tab in the bottom-right corner that opens a flat strip on
// hover/focus. Collapsed it covers almost nothing, so it never sits over a scene's lower edge.
function DevJump() {
  return (
    <nav
      aria-label="Scene jump (development only)"
      className="group fixed right-0 bottom-0 z-50 flex items-stretch font-mono text-[10px] leading-4 text-white/80 opacity-40 transition-opacity duration-150 hover:opacity-100 focus-within:opacity-100"
    >
      <span aria-hidden="true" className="bg-black/50 px-1 group-hover:hidden group-focus-within:hidden">dev</span>
      <div className="hidden bg-black/60 group-hover:flex group-focus-within:flex">
        {SCENES.map((m) => (
          <button key={m.id} type="button" onClick={() => scrollToScene(m.id, { immediate: true })} className="min-w-5 px-1 hover:bg-white/25 focus-visible:bg-white/25" title={m.slug}>
            {m.id}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default function Experience() {
  const container = useRef<HTMLElement>(null);
  const clock = useRef<ClockProgressHandle>(null);
  const [loaded, setLoaded] = useState(false);
  const onLoaded = useCallback(() => setLoaded(true), []);
  const reducedMotion = useSyncExternalStore(subscribeReduce, prefersReducedMotion, () => false);
  const tier: DeviceTier = useSyncExternalStore(noopSubscribe, getDeviceTier, () => "high");

  // Read the live query, not the hydration snapshot (always false), so reduce users never get a Lenis.
  useEffect(() => initScroll({ reducedMotion: prefersReducedMotion() }), [reducedMotion]);

  useGSAP(
    () => {
      const root = document.documentElement;
      const el = container.current;
      if (!el) return;

      // Global sky: one scrubbed timeline over the whole page. A colour change is not motion,
      // so there is no reduced-motion branch. Positions are fractions of the page's scroll range.
      const anchors = skyAnchors();
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => clock.current?.setProgress(self.progress),
          onRefresh: (self) => clock.current?.setProgress(self.progress),
        },
      });
      for (let n = 0; n < anchors.length - 1; n++) {
        const from = anchors[n].end;
        const to = anchors[n + 1].start;
        const mid = via[n as SceneId];
        const stops = mid ? [palette[n as SceneId], mid, palette[(n + 1) as SceneId]] : [palette[n as SceneId], palette[(n + 1) as SceneId]];
        const seg = (to - from) / (stops.length - 1);
        for (let k = 0; k < stops.length - 1; k++) {
          tl.fromTo(root, toCssVarObject(stops[k]), { ...toCssVarObject(stops[k + 1]), duration: seg, immediateRender: false }, from + k * seg);
        }
      }
      tl.set({}, {}, 1); // pad so timeline time === scroll fraction

      // Active scene -> <html data-scene>. SoundToggle reads it to crossfade the ambience; unused by CSS.
      el.querySelectorAll<HTMLElement>("[data-scene]").forEach((slot) => {
        ScrollTrigger.create({
          trigger: slot,
          start: "top 50%",
          end: "bottom 50%",
          onToggle: (self) => {
            if (self.isActive) root.dataset.scene = slot.dataset.scene;
          },
        });
      });
    },
    { scope: container },
  );

  return (
    <>
      <main ref={container} className="relative">
        {SCENES.map((meta) => {
          const Scene = SCENE_COMPONENTS[meta.id];
          return (
            <SceneSlot key={meta.id} meta={meta}>
              <Scene id={meta.id} reducedMotion={reducedMotion} tier={tier} />
            </SceneSlot>
          );
        })}
      </main>
      <RisoDefs />
      <div aria-hidden="true" className="print-marks">
        <i />
        <i />
        <i />
      </div>
      <ClockProgress ref={clock} />
      <SoundToggle ready={loaded} />
      {/* Gates scrolling until the real load finishes, then hands off to Scene 0's title reveal. */}
      {!loaded && <Loader assets={INTRO_ASSETS} onComplete={onLoaded} reducedMotion={reducedMotion} tier={tier} />}
      {process.env.NODE_ENV !== "production" && <DevJump />}
    </>
  );
}
