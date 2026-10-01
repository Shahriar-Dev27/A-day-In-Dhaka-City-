"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { EASE, SCENES } from "@/lib/scenes";
import { Art, SceneText, Stage, useSceneTimeline, type Line } from "./scene-kit";
import { CloseArt, CloseBeat, Cup, Figure, FigureLine, TeaStall } from "./story-kit";
import type { SceneProps } from "@/lib/scenes";
import { storyVars } from "@/lib/palette";

const LightTrails = dynamic(() => import("./LightTrails"), { ssr: false });

const COPY = {
  time: { bn: "সন্ধ্যা ৭:৩০", en: "7:30 PM" } satisfies Line,
  line: { bn: "আলোয় আলোয় নতুন ঢাকা", en: "A new Dhaka, made of light" } satisfies Line,
  close: { bn: "দুই কাপ। আর সকালেরটাও।", en: "Two cups. And this morning's too." } satisfies Line,
};

const SHOPS: [number, number, number][] = [[40, 300, 260], [380, 340, 320], [760, 280, 250], [1080, 320, 300], [1440, 200, 270]];
const BULBS = Array.from({ length: 18 }, (_, i) => [90 + i * 84, 500 + Math.sin(i * 1.7) * 26] as const);
const BOKEH: [number, number, number][] = [[220, 180, 46], [560, 120, 30], [940, 210, 58], [1260, 140, 36], [1500, 240, 42]];
const TRAILS: [number, number, number][] = [[620, 770, 520], [1020, 800, 380], [260, 830, 440]];

export default function Scene6Neon({ tier, reducedMotion }: SceneProps) {
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [near, setNear] = useState(false);
  const ease = EASE[SCENES[6].ease];
  useEffect(() => {
    const slot = root.current?.parentElement;
    if (!slot || tier === "low" || reducedMotion) return;
    const observer = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting));
    observer.observe(slot);
    return () => observer.disconnect();
  }, [tier, reducedMotion]);

  useSceneTimeline(root, (tl, mode, q) => {
    tl.eventCallback("onUpdate", () => { progress.current = tl.progress(); });
    tl.fromTo(q("[data-light]"), { autoAlpha: 0.1 }, { autoAlpha: 1, stagger: 0.025, duration: 0.05, ease: "power2.out" }, 0.1);
    tl.fromTo(q("[data-neon]"), { autoAlpha: 0.15 }, { autoAlpha: 1, duration: 0.08, ease: "power2.out" }, 0.3);
    tl.to(q("[data-drunk] [data-liquid], [data-drunk] [data-steam]"), { opacity: 0, duration: 0.06 }, 0.54);
    if (mode === "full") {
      tl.fromTo(q("[data-trail]"), { scaleX: 0.05, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 0.9, transformOrigin: "0% 50%", stagger: 0.08, duration: 0.5, ease }, 0.25);
      tl.fromTo(q("[data-bokeh]"), { y: 0 }, { y: -50, stagger: 0.04, duration: 0.8, ease: "none" }, 0);
      tl.fromTo(q("[data-payment]"), { x: 55 }, { x: 0, duration: 0.1 }, 0.12);
      tl.to(q("[data-carried]"), { x: 20, duration: 0.1 }, 0.58);
    } else {
      tl.fromTo(q("[data-trail]"), { autoAlpha: 0 }, { autoAlpha: 0.7, duration: 0.3, ease: "power2.out" }, 0.3);
    }
  }, { close: true });

  return (
    <div ref={root} className="relative h-full">
      <Stage label={COPY.line.en}>
        <Art data-city>
          {BOKEH.map(([x, y, r]) => (
            <circle key={x} data-bokeh cx={x} cy={y + 300} r={r} className="fill-glow" opacity="0.25" />
          ))}
          {SHOPS.map(([x, w, h]) => (
            <rect key={x} x={x} y={720 - h} width={w} height={h} className="fill-ink" />
          ))}
          <rect x="0" y="720" width="1600" height="180" className="fill-ink" />
          <rect x="430" y="470" width="220" height="48" rx="6" fill="none" strokeWidth="6" data-neon className="stroke-accent" />
          <rect x="1110" y="440" width="180" height="48" rx="6" fill="none" strokeWidth="6" data-neon className="stroke-glow" />
          {BULBS.map(([x, y]) => (
            <circle key={x} data-light cx={x} cy={y} r="8" className="fill-glow" />
          ))}
          {TRAILS.map(([x, y, w], i) => (
            <rect key={y} data-trail x={x} y={y} width={w} height="10" rx="5" className={i % 2 ? "fill-glow" : "fill-accent"} />
          ))}
          {/* Wet-road reflections */}
          <rect x="300" y="740" width="460" height="6" className="fill-glow" opacity="0.18" />
          <rect x="900" y="760" width="320" height="6" className="fill-accent" opacity="0.18" />
          <TeaStall transform="translate(780 790) scale(0.85)" />
          <Figure pose="walk" transform="translate(960 880) scale(0.85)" />
          <g data-payment style={storyVars}><path d="M949 790 905 772 870 765" fill="none" stroke="var(--story-skin)" strokeWidth="7" /><circle cx="870" cy="765" r="7" fill="var(--story-gold)" /></g>
        </Art>
        <div data-city className="pointer-events-none absolute inset-x-0 bottom-0 h-[24svh]">{near && tier === "high" && !reducedMotion && <LightTrails progress={progress} />}</div>
        <SceneText time={COPY.time} line={COPY.line} />
        <CloseBeat label="The morning debt is paid. One glass is drunk; a second full glass is carried away.">
          <CloseArt>
            <path d="M40 460H760V492H40Z" fill="var(--story-glass)" opacity="0.3" />
            <path d="M50 492 55 340 150 290 275 340 280 492Z" fill="var(--story-cloth)" opacity="0.65" />
            <g data-drunk transform="translate(282 320) scale(1.8)"><Cup state="full" /></g>
            <g data-carried><g transform="translate(520 320) scale(1.8)"><Cup state="refilled" /></g><path d="M754 485 608 356 565 328 550 323 543 340 568 371 598 404 680 540Z" fill="var(--story-shawl)" /><path d="M569 330 553 315 535 312 520 316 521 328 545 329 551 346Z" fill="var(--story-skin)" /></g>
            {[365, 393, 421].map((x) => <circle key={x} cx={x} cy="472" r="9" fill="var(--story-gold)" />)}
          </CloseArt>
          <FigureLine line={COPY.close} spoken />
        </CloseBeat>
      </Stage>
    </div>
  );
}
