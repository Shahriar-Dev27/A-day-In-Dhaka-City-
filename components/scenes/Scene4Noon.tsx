"use client";

import { useRef } from "react";
import { storyVars } from "@/lib/palette";
import { EASE, SCENES } from "@/lib/scenes";
import { Art, SceneText, Stage, useSceneTimeline, type Line } from "./scene-kit";
import { CloseArt, CloseBeat, Cup, Figure, FigureLine, Puller } from "./story-kit";

const COPY = {
  time: { bn: "দুপুর ১টা", en: "1:00 PM" } satisfies Line,
  line: { bn: "রোদ যত কড়া, ছায়া তত দামি", en: "The harsher the sun, the more precious the shade" } satisfies Line,
  close: { bn: "চা ঠান্ডা, ছায়া ভাগাভাগি।", en: "Cold tea, shared shade." } satisfies Line,
};

export default function Scene4Noon() {
  const root = useRef<HTMLDivElement>(null);
  const ease = EASE[SCENES[4].ease];

  useSceneTimeline(root, (tl, mode, q) => {
    if (mode === "full") {
      // Sun crosses an arc: x is linear, y rises then falls.
      tl.fromTo(q("[data-sun]"), { x: -250 }, { x: 350, duration: 1, ease: "none" }, 0);
      tl.fromTo(q("[data-sun-y]"), { y: 120 }, { y: -90, duration: 0.5, ease: "sine.out" }, 0);
      tl.to(q("[data-sun-y]"), { y: 120, duration: 0.5, ease: "sine.in" }, 0.5);
      // Shadows rotate (skew) and lengthen as the sun moves.
      tl.fromTo(q("[data-shadow]"), { skewX: 38, scaleX: 0.5 }, { skewX: -38, scaleX: 1.7, transformOrigin: "0% 100%", duration: 1, ease }, 0);
      tl.fromTo(q("[data-drop]"), { y: 0 }, { y: 18, duration: 1, ease: "none" }, 0);
      tl.fromTo(q("[data-heat]"), { y: -4, opacity: 0.12 }, { y: 4, opacity: 0.3, duration: 0.3, stagger: 0.04 }, 0.1);
    } else {
      tl.fromTo(q("[data-shadow]"), { autoAlpha: 0.3 }, { autoAlpha: 1, duration: 0.8, ease: "power2.out" }, 0);
    }
  }, { close: true });

  return (
    <div ref={root} className="relative h-full">
      <Stage label={COPY.line.en}>
        <Art data-city>
          <g data-sun>
            <g data-sun-y>
              <circle cx="1100" cy="260" r="150" className="fill-accent" opacity="0.28" />
              <circle cx="1100" cy="260" r="96" strokeWidth="8" className="fill-accent stroke-ink" />
            </g>
          </g>
          <rect x="0" y="650" width="1600" height="250" className="fill-ink" opacity="0.9" />
          {[0, 1, 2, 3].map((n) => (
            <path key={n} data-heat d={`M0 ${690 + n * 44}q200-13 400 0t400 0t400 0t400 0`} fill="none" strokeWidth="3" className="stroke-glow" opacity="0.22" />
          ))}
          {/* Fruit vendor umbrella + cart */}
          <path d="M360 520 a190 190 0 0 1 380 0z" className="fill-accent" />
          <rect x="545" y="520" width="10" height="170" className="fill-ink" />
          <rect x="400" y="640" width="300" height="56" className="fill-ink" />
          {/* Rickshaw resting in its own shade */}
          <g className="fill-ink">
            <path d="M1020 690 h210 v-110 a105 105 0 0 0 -210 0z" />
            <circle cx="1060" cy="700" r="40" />
            <circle cx="1280" cy="700" r="40" />
          </g>
          <g className="fill-ink">
            <path data-shadow d="M1020 700 h210 l60 0 h-270z" opacity="0.55" />
            <path data-shadow d="M360 700 h380 l90 0 h-470z" opacity="0.55" />
          </g>
          <g style={storyVars}>
            <path d="M710 700h270l-28 75H690Z" className="fill-ink" />
            <Figure pose="sit" transform="translate(735 755) scale(0.7)" />
            <Puller transform="translate(880 755) scale(0.7)" />
            <Cup state="cold" transform="translate(816 724) scale(0.35)" />
            <path d="M1053 548h139" stroke="var(--story-gold)" strokeWidth="8" />
          </g>
        </Art>
        <SceneText time={COPY.time} line={COPY.line} />
        <CloseBeat label="The stroller and a rickshaw puller share a strip of shade; their cold tea sits between them.">
          <CloseArt>
            <path d="M105 531 255 235 590 235 725 531Z" fill="var(--story-bg)" />
            <Figure pose="sit" transform="translate(230 505) scale(1.3)" />
            <Puller transform="translate(590 505) scale(-1.3 1.3)" />
            <path d="M100 526H730V551H100Z" fill="var(--story-shawl)" opacity="0.22" />
            <g transform="translate(406 343) scale(2)"><Cup state="cold" /></g>
          </CloseArt>
          <FigureLine line={COPY.close} />
        </CloseBeat>
      </Stage>
    </div>
  );
}
