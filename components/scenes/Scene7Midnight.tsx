"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { storyVars } from "@/lib/palette";
import { EASE, LIGHT_DOT, SCENES } from "@/lib/scenes";
import { scrollToScene } from "@/lib/scroll";
import { Art, SceneText, Stage, useSceneTimeline, type Line } from "./scene-kit";
import { CloseArt, CloseBeat, Cup, Dog, Figure, Puller } from "./story-kit";

const COPY = {
  time: { bn: "রাত ১১:৪৫", en: "11:45 PM" } satisfies Line,
  line: { bn: "ঘুমায় শহর, স্বপ্ন জাগে", en: "The city sleeps, the dreams stay awake" } satisfies Line,
  credit: "Designed and built by Shahriar Islam Dip",
  closing: { bn: "কাল আবার।", en: "Again tomorrow." } satisfies Line,
  restart: { bn: "আবার শুরু করুন", en: "Scroll up to start again" } satisfies Line,
};

const STARS = [[140, 80], [380, 170], [640, 60], [1010, 120], [1280, 70], [1490, 160]];
const SKYLINE: [number, number, number][] = [[0, 90, 150], [110, 120, 220], [260, 100, 170], [380, 150, 120], [1060, 130, 190], [1210, 110, 260], [1340, 160, 150], [1520, 80, 200]];

export default function Scene7Midnight() {
  const root = useRef<HTMLDivElement>(null);
  const ease = EASE[SCENES[7].ease];

  useSceneTimeline(root, (tl, mode, q) => {
    gsap.set(q("[data-credit], [data-closing], [data-loop-dot]"), { autoAlpha: 0 });
    gsap.set(q("[data-wide-gift]"), { opacity: 0 });
    tl.to(q("[data-wide-gift]"), { opacity: 1, duration: 0.06 }, 0.18);
    tl.fromTo(q("[data-star]"), { autoAlpha: 0 }, { autoAlpha: 0.9, stagger: 0.02, duration: 0.1 }, 0.1);
    tl.to(q("[data-gift] [data-cup-body], [data-gift-hand], [data-resting-puller], [data-kerb]"), { opacity: 0, duration: 0.12 }, 0.68);
    if (mode === "full") {
      tl.fromTo(q("[data-world]"), { scale: 1.12 }, { scale: 1, transformOrigin: "50% 75%", duration: 1, ease }, 0);
      tl.fromTo(q("[data-gift]"), { y: -30 }, { y: 0, duration: 0.1 }, 0.46);
      tl.to(q("[data-walking-home]"), { x: 130, duration: 0.14, ease }, 0.2);
      const reflection = q("[data-final-reflection]");
      const dotScale = () => {
        const svg = reflection[0]?.closest("svg")?.getBoundingClientRect();
        return svg ? LIGHT_DOT.sizePx / (54 * Math.min(svg.width / 800, svg.height / 700)) : 1;
      };
      tl.to(reflection, { scale: dotScale, svgOrigin: "400 350", duration: 0.16, ease }, 0.68);
    }
    tl.to(q("[data-final-reflection]"), { opacity: 0, duration: 0.04 }, 0.84)
      .to(q("[data-loop-dot]"), { autoAlpha: 1, duration: 0.04 }, 0.84)
      .to(q("[data-credit]"), { autoAlpha: 1, duration: 0.06 }, 0.87)
      .to(q("[data-closing]"), { autoAlpha: 1, duration: 0.04 }, 0.95);
  }, { close: true, returnToCity: false });

  return <div ref={root} className="relative h-full">
    <Stage label={COPY.line.en}>
      <Art data-city>
        {STARS.map(([x, y]) => <circle key={x} data-star cx={x} cy={y} r="2.5" className="fill-copy" />)}
        <g data-world>
          <g className="fill-ink" opacity="0.95">{SKYLINE.map(([x, w, h]) => <rect key={x} x={x} y={700 - h} width={w} height={h} />)}</g>
          <rect y="700" width="1600" height="200" className="fill-ink" />
          <path d="M820 710V365h80" fill="none" className="stroke-accent" strokeWidth="8" />
          <path d="M840 715 920 383 1030 715Z" className="fill-glow" opacity="0.12" />
          <ellipse cx="906" cy="382" rx="22" ry="7" className="fill-glow" />
          <g style={storyVars}>
            <Puller transform="translate(845 774) scale(0.8)" />
            <path d="M646 761V660a69 69 0 0 1 138 0v101Z" className="fill-accent" /><path d="M670 673h89" stroke="var(--story-gold)" strokeWidth="8" />
            <circle cx="665" cy="771" r="27" fill="none" className="stroke-accent" strokeWidth="6" /><circle cx="808" cy="771" r="27" fill="none" className="stroke-accent" strokeWidth="6" />
            <g data-walking-home><Figure pose="set-down" transform="translate(950 800) scale(-0.8 0.8)" /><Dog transform="translate(880 812) scale(0.75)" /></g>
            <Cup data-wide-gift state="given" transform="translate(906 757) scale(0.45)" />
          </g>
        </g>
      </Art>
      <SceneText time={COPY.time} line={COPY.line} />
      <CloseBeat label="Without waking the resting rickshaw puller, a cup is left beside him. The streetlamp is reflected in the tea.">
        <CloseArt className="story-reflection-art">
          <Puller data-resting-puller transform="translate(235 530) scale(1.35)" opacity="0.55" />
          <path data-kerb d="M70 579H730V611H70Z" fill="var(--story-shawl)" opacity="0.18" />
          <g data-gift>
            <g data-final-reflection><g transform="translate(400 296) scale(3)"><Cup state="given" /></g></g>
            <g data-gift-hand><path d="M764 253 537 278 520 318 764 325Z" fill="var(--story-shawl)" /><path d="M537 278 502 298 481 311 486 329 512 321 550 318Z" fill="var(--story-skin)" /></g>
          </g>
        </CloseArt>
        <span data-loop-dot aria-hidden="true" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: LIGHT_DOT.sizePx, height: LIGHT_DOT.sizePx, background: "var(--story-gold)" }} />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-(--gutter) pb-[max(2rem,env(safe-area-inset-bottom))] text-center">
          <p data-credit lang="en" className="text-label uppercase" style={{ color: "var(--story-muted)" }}>{COPY.credit}</p>
          <div data-closing className="flex flex-col items-center gap-4">
            <p><span lang="bn" className="block font-display text-clock">{COPY.closing.bn}</span><span lang="en" className="block text-sub" style={{ color: "var(--story-muted)" }}>{COPY.closing.en}</span></p>
            <button type="button" onClick={() => scrollToScene(0)} className="btn btn-solid flex-wrap"><span lang="bn">{COPY.restart.bn}</span><span lang="en" className="text-sub">{COPY.restart.en}</span></button>
          </div>
        </div>
      </CloseBeat>
    </Stage>
  </div>;
}
