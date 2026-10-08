"use client";

/*
  Scene 2, 7:00 AM. Same tong, day light. Kids with bags bigger than their backs and garment workers
  stream across, a paratha flips twice on the tawa beside the kettle, a newspaper hawker sorts his bundle
  on the bench, one worker holds out a Tk 500 note ("no change, Mama" / "pay me later") and the first line
  goes into the red notebook as the glide ends on the counter. Engine: GSAP scrub on the slot; ambient
  loops are CSS (paused off-screen). Reduced motion: camera fixed at 1.06, the stream and the walk-in are
  replaced by opacity beats on final positions, the paratha does not leave the pan (its faces swap by opacity).
*/

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { COPY } from "@/lib/copy";
import { EASE, SCENES, type SceneProps } from "@/lib/scenes";
import { Art, Camera, Narration, SpeechSlip, Stage, useLiveGate, useSceneTimeline } from "./scene-kit";
import { Dog, GarmentWorker, Hawker, Mama, SchoolKid } from "./tong/cast";
import { STROKE, type V2 } from "./tong/geometry";
import { TongBackdrop, TongBench, TongStall, TongWires, type TongState } from "./tong/TongSet";

const { narration, overheard } = COPY[2];
const STATE: TongState = { shutter: "up", bulb: "off", litWindows: [], steam: true, notebook: "closed" };
const MAMA_AT: V2 = [925, 858];
const WORKER_AT: V2 = [742, 868];

const KIDS = [0, 150, 270] as const; // x spacing of the three school kids
const PAIR = [0, 120] as const; // the garment workers who cross in front
const FLIPS = [0.16, 0.34] as const; // the paratha's two flips, inside the morning stream

/** One paratha face: a flat edge-on disc, outlined so it reads on the lit back wall, with browned spots. */
function ParathaFace({ face, spots, className }: { face: string; spots: readonly (readonly [number, number])[]; className: string }) {
  return (
    <g data-paratha-face={face}>
      <ellipse cx="0" cy="0" rx="22" ry="4.2" className={`${className} stroke-ink`} strokeWidth="1.2" strokeOpacity="0.6" />
      {spots.map(([x, y]) => (
        <ellipse key={x} cx={x} cy={y} rx="3.4" ry="1.2" className="fill-wood" opacity="0.85" />
      ))}
    </g>
  );
}

/**
 * The paratha tawa (morning only): a low ring stove on the counter between the glass case and the burner,
 * a shallow iron pan, a khunti resting on the rim, and one paratha (data-paratha, drawn around a local 0,0)
 * whose visible face goes raw -> first side browned -> second side browned.
 */
function Tawa() {
  return (
    <g data-tawa>
      <rect x="722" y="714" width="44" height="8" rx="2" className="fill-ink" />
      {[732, 744, 756].map((x, i) => (
        <path key={x} d={`M${x} 715c-3 -2 -1 -6 0 -8c1 2 3 6 0 8z`} className="flame-tongue loop fill-glow" style={{ animationDelay: `${i * 0.11}s` }} />
      ))}
      <path d="M712 706q32 10 64 0l-2 4q-30 10 -60 0z" className="fill-ink" />
      <path d="M716 707q28 7 56 0" fill="none" className="stroke-wall-lit" strokeWidth={STROKE.hair} opacity="0.45" />
      <g transform="translate(742 703)">
        <g data-paratha>
          <ParathaFace face="raw" spots={[]} className="fill-paper" />
          <ParathaFace face="one" spots={[[-10, -1], [3, 1], [13, -1]]} className="fill-glow" />
          <ParathaFace face="two" spots={[[-13, 1], [-3, -1], [8, 1], [16, 0]]} className="fill-glow" />
        </g>
      </g>
      {/* the khunti: a flat steel blade on the rim, a wooden handle */}
      <path d="M762 704l10 -2l1 3l-10 2z" className="fill-wall-lit" />
      <path d="M771 702L782 694" className="stroke-wood" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

export default function Scene2Morning({ tier }: SceneProps) {
  const root = useRef<HTMLDivElement>(null);
  const low = tier === "low";
  const ease = EASE[SCENES[2].ease];
  useLiveGate(root);

  useSceneTimeline(root, 2, (tl, mode, q) => {
    const full = mode === "full";
    const $ = (sel: string) => q(sel);
    const camera = $("[data-camera]");
    const kids = $("[data-kid]");
    const pair = $("[data-pair]");
    const back = $("[data-back]");
    const walkIn = $("[data-worker-walk]");
    const hold = $("[data-worker-hold]");
    const mamaPour = $('[data-mama="pour"]');
    const mamaWrite = $('[data-mama="write"]');
    const pages = $("[data-notebook-pages]");
    const line = $("[data-notebook-line]");
    const [slipW, slipM] = [$('[data-slip="worker"]'), $('[data-slip="mama"]')];
    const paratha = $("[data-paratha]");
    const faces = ["raw", "one", "two"].map((f) => $(`[data-paratha-face="${f}"]`));

    gsap.set([hold, mamaWrite, pages, line, slipW, slipM, faces[1], faces[2]], { autoAlpha: 0 });
    if (full) gsap.set(paratha, { transformOrigin: "50% 50%" }); // set once: a changing origin drifts when scrubbed
    if (full) {
      gsap.set([...kids, ...pair, ...back, ...walkIn], { x: -420 });
      gsap.set(walkIn, { x: -700 });
      gsap.set(line, { scaleX: 0, transformOrigin: "0% 50%" });
    } else {
      gsap.set([...kids, ...pair, ...back, ...walkIn], { autoAlpha: 0 });
      gsap.set(line, { autoAlpha: 0 });
    }

    // one glide, ending on the counter (the notebook beat is the end of the glide, not a new composition)
    if (full) tl.fromTo(camera, { xPercent: 3, yPercent: 0, scale: 1 }, { xPercent: -4, yPercent: -4, scale: 1.14, duration: 1, ease }, 0);
    else gsap.set(camera, { scale: 1.06 });

    if (full) {
      // the morning stream: kids first (late for school), workers in groups, a few far behind the stall
      const cross = (els: Element[], start: number, dist: number, dur: number, gap: number) =>
        els.forEach((el, i) => {
          tl.to(el, { x: dist, duration: dur, ease: "none" }, start + i * gap);
          tl.to(el, { y: -4, duration: 0.025, repeat: Math.round(dur / 0.025) - 1, yoyo: true, ease: "sine.inOut" }, start + i * gap);
        });
      cross(kids, 0.06, 2300, 0.26, 0.035);
      cross(pair, 0.22, 2300, 0.28, 0.03);
      cross(back, 0.1, 2300, 0.5, 0.08);
      tl.to(walkIn, { x: 0, duration: 0.16, ease: "power1.out" }, 0.3);
      tl.to(walkIn, { y: -4, duration: 0.025, repeat: 5, yoyo: true, ease: "sine.inOut" }, 0.3);
      tl.to(walkIn, { autoAlpha: 0, duration: 0.01 }, 0.46);
      tl.to(hold, { autoAlpha: 1, duration: 0.01 }, 0.46);
    } else {
      tl.to([...kids, ...pair, ...back], { autoAlpha: 1, duration: 0.05, ease: "power2.out", stagger: 0.02 }, 0.1);
      tl.to([...kids, ...pair, ...back], { autoAlpha: 0, duration: 0.05, ease: "power2.out" }, 0.44);
      tl.to(hold, { autoAlpha: 1, duration: 0.06, ease: "power2.out" }, 0.42);
    }

    // the tawa: the paratha hops, turns edge-on (scaleY through 0) and lands; the face swaps at the edge
    FLIPS.forEach((t, i) => {
      const [from, to] = [faces[i], faces[i + 1]];
      if (full) {
        tl.to(paratha, { y: -22, duration: 0.03, ease: "power2.out" }, t);
        tl.to(paratha, { y: 0, duration: 0.03, ease: "power2.in" }, t + 0.03);
        tl.to(paratha, { scaleY: i % 2 ? 1 : -1, duration: 0.06, ease: "sine.inOut" }, t);
        tl.set(from, { autoAlpha: 0 }, t + 0.03);
        tl.set(to, { autoAlpha: 1 }, t + 0.03);
      } else {
        tl.to(from, { autoAlpha: 0, duration: 0.03, ease: "power2.out" }, t);
        tl.to(to, { autoAlpha: 1, duration: 0.03, ease: "power2.out" }, t);
      }
    });

    // 0.46-0.85 the exchange, one slip at a time (each is on screen >= 0.18 of the scene = 30 svh = 1 s at the AC-D3 pace)
    tl.to(slipW, { autoAlpha: 1, duration: 0.04, ease: "power2.out" }, 0.46);
    if (full) tl.fromTo(slipW, { y: 6 }, { y: 0, duration: 0.04, ease: "power2.out", immediateRender: false }, 0.46);
    tl.to(slipW, { autoAlpha: 0, duration: 0.03, ease: "power2.out" }, 0.62);
    tl.to(slipM, { autoAlpha: 1, duration: 0.04, ease: "power2.out" }, 0.66);
    if (full) tl.fromTo(slipM, { y: 6 }, { y: 0, duration: 0.04, ease: "power2.out", immediateRender: false }, 0.66);
    tl.to(slipM, { autoAlpha: 0, duration: 0.04, ease: "power2.out" }, 0.81);

    // 0.80-0.95 the baki khata: Mama bends to the notebook, the page opens, the first line is written
    tl.to(mamaPour, { autoAlpha: 0, duration: 0.01 }, 0.8);
    tl.to(mamaWrite, { autoAlpha: 1, duration: 0.01 }, 0.8);
    tl.to(pages, { autoAlpha: 1, duration: 0.04, ease: "power2.out" }, 0.82);
    if (full) tl.to(line, { autoAlpha: 1, scaleX: 1, duration: 0.09, ease: "power1.out" }, 0.86);
    else tl.to(line, { autoAlpha: 1, duration: 0.05, ease: "power2.out" }, 0.86);

    // hand-off: the art fades to sky so the next stage reads sky to sky
    tl.to(camera, { autoAlpha: 0, duration: 0.035, ease: "power2.out" }, 0.965);
  });

  return (
    <div ref={root} className="relative h-full" data-live="false">
      <Stage label={narration!.en}>
        <Camera>
          <Art overflow="visible">
            <TongBackdrop state={STATE} />
            <TongWires low={low} />
            {/* far workers pass behind the stall (visible either side of it on wide screens) */}
            {!low &&
              [0, 1].map((i) => (
                <g key={i} data-back>
                  <GarmentWorker at={[-120 - i * 260, 830]} s={0.6} />
                </g>
              ))}
            <TongStall state={STATE}>
              <g data-mama="pour">
                <Mama at={MAMA_AT} flip pose="pour" />
              </g>
              <g data-mama="write">
                <Mama at={MAMA_AT} flip pose="write" />
              </g>
            </TongStall>
            <Tawa />
            <TongBench bundle />
            <Dog at={[1130, 862]} pose="stand" />
            <Hawker at={[586, 862]} />
            <g data-worker-walk>
              <GarmentWorker at={WORKER_AT} pose="walk" />
            </g>
            <g data-worker-hold>
              <GarmentWorker at={WORKER_AT} pose="hold-note" />
            </g>
            {PAIR.map((dx, i) => (
              <g key={i} data-pair>
                <GarmentWorker at={[dx, 898]} s={0.88} />
              </g>
            ))}
            {KIDS.map((dx, i) => (
              <g key={i} data-kid>
                <SchoolKid at={[dx, 898]} pose={i === 1 ? "run" : "walk"} />
              </g>
            ))}
          </Art>
          <SpeechSlip line={overheard[0]} x={720} y={548} side="right" beat="worker" />
          <SpeechSlip line={overheard[1]} x={944} y={528} side="left" beat="mama" />
        </Camera>
        <Narration line={narration!} />
      </Stage>
    </div>
  );
}
