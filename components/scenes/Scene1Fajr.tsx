"use client";

/*
  Scene 1, 4:45 AM. One glide toward the tong while: the shutter rattles up, a match flares, the burner
  catches, steam rises, the night guard walks in out of the dark and asks for a cup. The overlapping
  azaans are the visual cue: three minarets (one inside the safe column) pulse sound-arcs a half-beat
  apart. Engine: GSAP scrub on the slot (scroll owns time); ambient flame/steam/banana loops are CSS on
  their own elements, paused off-screen (useLiveGate). Reduced motion: camera fixed at 1.06, every beat is
  opacity only, nothing travels.
*/

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { COPY } from "@/lib/copy";
import { EASE, SCENES, type SceneProps } from "@/lib/scenes";
import { Art, Camera, Narration, SpeechSlip, Stage, useLiveGate, useSceneTimeline } from "./scene-kit";
import { Dog, Guard, Mama } from "./tong/cast";
import { blob, type V2 } from "./tong/geometry";
import { TongBackdrop, TongBench, TongStall, TongWires, type TongState } from "./tong/TongSet";

const { narration, overheard } = COPY[1];
const STATE: TongState = { shutter: "down", bulb: "on", litWindows: [1], steam: true };
const GUARD_AT: V2 = [735, 868];
const MAMA_AT: V2 = [925, 858];

/** Three low ribbons of mist between the block and the minarets (text colour at low opacity). */
function Mist({ low }: { low: boolean }) {
  const bands = [
    { y: 430, h: 64, o: 0.1, s: 0.6 },
    { y: 540, h: 84, o: 0.08, s: 1 },
    { y: 640, h: 56, o: 0.12, s: 1.5 },
  ].slice(0, low ? 2 : 3);
  return (
    <g>
      {bands.map((b, i) => (
        <path
          key={i}
          data-mist={b.s}
          className="fill-copy"
          opacity={b.o}
          d={blob([[-300, b.y], [100, b.y - b.h * 0.4], [520, b.y - b.h * 0.18], [940, b.y - b.h * 0.5], [1380, b.y - b.h * 0.28], [1900, b.y], [1400, b.y + b.h * 0.42], [960, b.y + b.h * 0.5], [520, b.y + b.h * 0.3], [120, b.y + b.h * 0.46]])}
        />
      ))}
    </g>
  );
}

export default function Scene1Fajr({ tier }: SceneProps) {
  const root = useRef<HTMLDivElement>(null);
  const low = tier === "low";
  const ease = EASE[SCENES[1].ease];
  useLiveGate(root);

  useSceneTimeline(root, 1, (tl, mode, q) => {
    const full = mode === "full";
    const camera = q("[data-camera]");
    const $ = (sel: string) => q(sel);
    const rings = $("[data-azaan]");
    const [shutter, halo, bulb, flame, steam, match, guard, torch, slip] = ["[data-shutter]", "[data-halo]", "[data-bulb]", "[data-flame]", "[data-steam]", "[data-match]", "[data-guard]", "[data-torch]", "[data-slip]"].map($);
    const [mamaStand, mamaPour] = [$('[data-mama="stand"]'), $('[data-mama="pour"]')];

    // initial (hidden/closed) states; mm.revert() restores the markup defaults
    gsap.set([halo, bulb, flame, steam, match, guard, slip, mamaPour], { autoAlpha: 0 });
    gsap.set(rings, { autoAlpha: 0, transformOrigin: "50% 100%" }); // origins are set once and never changed: a changing origin drifts when scrubbed back and forth
    gsap.set(match, { transformOrigin: "50% 50%" });
    if (full) gsap.set(flame, { scaleY: 0.3, transformOrigin: "50% 100%" });
    if (full) gsap.set(guard, { x: -720 });

    // one glide toward the tong (reduced: fixed framing)
    if (full) tl.fromTo(camera, { xPercent: 3, scale: 1 }, { xPercent: -4, scale: 1.12, duration: 1, ease }, 0);
    else gsap.set(camera, { scale: 1.06 });

    // mist drifts, each ribbon at its own speed
    if (full) $("[data-mist]").forEach((m) => tl.fromTo(m, { xPercent: -3 }, { xPercent: 3 * Number(m.getAttribute("data-mist")), duration: 1, ease: "none" }, 0));

    // azaans: each minaret pulses sound-arcs, a half-beat apart (phase = i * 0.055)
    rings.forEach((g, i) => {
      for (let n = 0; n < 4; n++) {
        const t = 0.05 + n * 0.21 + i * 0.055;
        if (full) {
          tl.fromTo(g, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 0.85, scale: 1.12, duration: 0.07, ease: "power2.out", immediateRender: false }, t);
          tl.to(g, { autoAlpha: 0, scale: 1.3, duration: 0.1, ease: "power2.out" }, t + 0.07);
        } else if (n === 0) {
          tl.to(g, { autoAlpha: 0.55, duration: 0.05, ease: "power2.out" }, 0.05 + i * 0.03);
        }
      }
    });

    // 0.20-0.38 the shutter rattles up (two stages), the tong's light comes on behind it
    if (full) {
      tl.to(shutter, { y: -92, duration: 0.07, ease: "power2.out" }, 0.2);
      tl.to(shutter, { y: -258, duration: 0.1, ease: "power2.out" }, 0.29);
    } else {
      tl.to(shutter, { autoAlpha: 0, duration: 0.14, ease: "power2.out" }, 0.22);
    }
    tl.to([halo, bulb], { autoAlpha: 1, duration: 0.08, ease: "power2.out" }, 0.3);

    // 0.36-0.46 a match flares, the burner catches
    if (full) tl.fromTo(match, { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1.3, duration: 0.03, ease: "power2.out", immediateRender: false }, 0.37);
    else tl.to(match, { autoAlpha: 1, duration: 0.02 }, 0.37);
    tl.to(match, { autoAlpha: 0, duration: 0.03, ease: "power2.out" }, 0.41);
    tl.to(flame, { autoAlpha: 1, ...(full && { scaleY: 1 }), duration: 0.06, ease: "power2.out" }, 0.4);
    tl.to(steam, { autoAlpha: 1, duration: 0.1, ease: "power2.out" }, 0.45);
    tl.to(mamaStand, { autoAlpha: 0, duration: 0.01 }, 0.4);
    tl.to(mamaPour, { autoAlpha: 1, duration: 0.01 }, 0.4);

    // 0.46-0.70 the guard walks in from the dark (a bob on every step), torch dimming at the counter
    if (full) {
      tl.to(guard, { autoAlpha: 1, duration: 0.02, ease: "none" }, 0.46);
      tl.to(guard, { x: 0, duration: 0.24, ease: "power1.out" }, 0.46);
      tl.to(guard, { y: -4, duration: 0.03, repeat: 7, yoyo: true, ease: "sine.inOut" }, 0.46);
    } else {
      tl.to(guard, { autoAlpha: 1, duration: 0.1, ease: "power2.out" }, 0.5);
    }
    tl.to(torch, { opacity: 0, duration: 0.05, ease: "power2.out" }, 0.66);

    // 0.70-0.93 the overheard line, then the scene's art fades to sky so the next stage hands off sky to sky
    tl.to(slip, { autoAlpha: 1, duration: 0.04, ease: "power2.out" }, 0.7);
    if (full) tl.fromTo(slip, { y: 6 }, { y: 0, duration: 0.04, ease: "power2.out", immediateRender: false }, 0.7);
    tl.to(slip, { autoAlpha: 0, duration: 0.04, ease: "power2.out" }, 0.9);
    tl.to(camera, { autoAlpha: 0, duration: 0.05, ease: "power2.out" }, 0.95);
  });

  return (
    <div ref={root} className="relative h-full" data-live="false">
      <Stage label={narration!.en}>
        <Camera>
          <Art overflow="visible">
            <TongBackdrop state={STATE} />
            <Mist low={low} />
            <TongWires low={low} />
            <TongStall state={STATE}>
              <g data-mama="stand">
                <Mama at={MAMA_AT} flip pose="stand" />
              </g>
              <g data-mama="pour">
                <Mama at={MAMA_AT} flip pose="pour" />
              </g>
            </TongStall>
            <g transform="translate(806 706)">
              <circle data-match r="9" className="fill-glow" />
            </g>
            <Dog at={[626, 862]} s={0.85} pose="asleep" />
            <TongBench />
            <Guard data-guard at={GUARD_AT} pose="walk" />
          </Art>
          <SpeechSlip line={overheard[0]} x={802} y={534} side="left" beat="guard" />
        </Camera>
        <Narration line={narration!} />
      </Stage>
    </div>
  );
}
