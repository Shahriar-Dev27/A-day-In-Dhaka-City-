"use client";

/*
  M0 stand-in for every scene whose final art is still to come (Scenes 1, 2, 4, 5, 6, 8). It satisfies
  the whole scene contract: sticky Stage, Narration, one Camera glide scrubbed on the slot (calm/snappy
  ease from SCENES[id]), slips revealed one at a time, opacity-only in reduce (camera fixed at 1.06).
  Geometry is a token-coloured wall + tarp + bulb inside SAFE_COLUMN (600-1000) so the palette relight
  is visible; it is NOT the final art. Each real scene replaces its use of this file.
*/

import type { ReactNode } from "react";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { COPY } from "@/lib/copy";
import type { SceneId } from "@/lib/palette";
import { EASE, SCENES } from "@/lib/scenes";
import { Art, Camera, Narration, SpeechSlip, Stage, useSceneTimeline } from "./scene-kit";

export default function PlaceholderScene({ id, children }: { id: SceneId; children?: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const { narration, overheard } = COPY[id];
  const ease = EASE[SCENES[id].ease];

  useSceneTimeline(root, id, (tl, mode, q) => {
    const camera = q("[data-camera]");
    if (mode === "full") tl.fromTo(camera, { xPercent: 3, scale: 1 }, { xPercent: -4, scale: 1.12, duration: 1, ease }, 0);
    else gsap.set(camera, { scale: 1.06 });
    // One slip at a time, in the middle of the scene (clear of the narration window).
    const slips = q("[data-slip]");
    gsap.set(slips, { autoAlpha: 0 });
    slips.forEach((s, i) => {
      tl.to(s, { autoAlpha: 1, duration: 0.05, ease: "power2.out" }, 0.45 + i * 0.2);
      tl.to(s, { autoAlpha: 0, duration: 0.05, ease: "power2.out" }, 0.6 + i * 0.2);
    });
    const end = q("[data-end]");
    if (end.length) {
      gsap.set(end, { autoAlpha: 0 });
      tl.to(end, { autoAlpha: 1, duration: 0.05, ease: "power2.out", stagger: 0.04 }, 0.87);
    }
  });

  return (
    <div ref={root} className="relative h-full">
      <Stage label={narration?.en ?? COPY[0].extra!.title.en}>
        <Camera>
          <Art>
            <rect x="560" y="300" width="480" height="600" className="fill-wall" />
            <rect x="640" y="560" width="360" height="40" className="fill-tarp" />
            <rect x="660" y="600" width="320" height="260" className="fill-ink" opacity="0.9" />
            <circle cx="820" cy="520" r="14" className="fill-glow" />
          </Art>
          {overheard.map((line, i) => (
            <SpeechSlip key={line.bn} line={line} x={i % 2 ? 640 : 1000} y={470} side={i % 2 ? "left" : "right"} beat={line.who} />
          ))}
        </Camera>
        {narration && <Narration line={narration} />}
        {children}
      </Stage>
    </div>
  );
}
