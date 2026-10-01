"use client";

/*
  Scene 1, Azaan on the Buriganga (04:45). Flat-vector silhouettes + grain (PLAN §7 fallback art).

  Design system (declared before drawing, see .devteam/a-day-in-dhaka/scene-1-frontend.md):
  - Value planes, back to front: sky (global gradient) > stars > dawn > far bank (ink 40%) > near skyline
    (ink 94%) > river > boats (ink) > three fog layers > grain. Depth comes from value, never from blur.
  - Colour is CSS vars only. The scene root pins --ink/--glow/--text/--text-muted/--accent to palette[1]
    so the silhouettes stay dark while the global sky warms for Scene 2 behind them (a real dawn reads
    as dark shapes on warm sky). --sky-top/--sky-bottom stay live: the river reflects the sky.
  - Motion is scrubbed GSAP (transform + opacity only). One owner per property: the scrub timeline owns
    boat/fog/layer x and every fade; the lantern loop owns only the halo's opacity (separate element).
*/

import { useRef, type CSSProperties } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { palette, scene1Vars, toCssVarObject } from "@/lib/palette";
import { EASE, SCENES, type SceneProps } from "@/lib/scenes";
import { Art, SceneText, Stage, useSceneTimeline, type Line } from "./scene-kit";
import { BASE, BOAT, FAR_PATH, FOG_BLOBS, FOG_LAYERS, GLINT_PATH, MID_PATH, RIPPLE_PATH, STAR_PATHS, WINDOW_GROUPS } from "./scene1-art";

const COPY = {
  time: { bn: "ভোর ৪:৪৫", en: "4:45 AM" } satisfies Line,
  line: { bn: "আজানের সুরে ঢাকা জাগে", en: "Dhaka wakes to the call of prayer" } satisfies Line,
};

const ROOT_VARS = { ...toCssVarObject(palette[1]), ...scene1Vars } as CSSProperties;
// Same noise tile as app/globals.css (feTurbulence, rasterised once as an image, no runtime filter).
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// Grain lifts the blacks a touch, so it fades out at the stage's top and bottom edges: no visible seam while the stage slides in/out.
const GRAIN_MASK = "linear-gradient(to bottom, transparent, black 16%, black 84%, transparent)";

// Boats: [start x, waterline y, scale, glide distance, lantern?]. Far boats glide less (parallax).
const BOATS: [x: number, y: number, s: number, glide: number, lantern: boolean][] = [
  [690, 716, 1.2, 300, true],
  [1180, 650, 0.6, 110, false],
  [290, 676, 0.85, 170, false],
];

const Stop = ({ at, color, o = 1 }: { at: number; color: string; o?: number }) => (
  <stop offset={at} stopOpacity={o} style={{ stopColor: color }} />
);

export default function Scene1Azaan({ tier }: SceneProps) {
  const root = useRef<HTMLDivElement>(null);
  const low = tier === "low";
  const ease = EASE[SCENES[1].ease];
  const boats = low ? BOATS.slice(0, 2) : BOATS;

  useSceneTimeline(root, (tl, mode, q) => {
    const fade = (target: Element[], at: number, dur: number, from = 0, to = 1) =>
      tl.fromTo(target, { opacity: from }, { opacity: to, duration: dur, ease: "power2.out" }, at);

    // Stars fade out one cluster at a time (cluster order = markup order).
    q("[data-stars]").forEach((c, i) => tl.to(c, { opacity: 0, duration: 0.16, ease: "power1.out" }, 0.14 + i * 0.12));
    // First light: faint teal-pink on the horizon, in the sky and again on the water.
    fade(q("[data-dawn]"), 0.3, 0.62, 0, 1);
    // Muezzin's lamps first, then the houses: one group per beat, in sequence.
    q("[data-win]").forEach((w, i) => fade([w], 0.36 + i * 0.05, 0.1));
    // Transition end: warm amber light touches the fog while the cool fog thins.
    fade(q("[data-warm]"), 0.74, 0.26);
    tl.fromTo(q("[data-cool]"), { opacity: 1 }, { opacity: 0.55, duration: 0.26, ease: "power2.out" }, 0.74);

    if (mode === "full") {
      tl.to(q('[data-layer="far"]'), { x: -12, duration: 1, ease }, 0);
      tl.to(q('[data-layer="mid"]'), { x: -30, duration: 1, ease }, 0);
      q("[data-boat]").forEach((b) => tl.to(b, { x: Number((b as HTMLElement).dataset.glide), duration: 1, ease }, 0)); // left to right
      // lowest fog is the fastest
      [-140, -300, -520].forEach((x, i) => tl.to(q(`[data-fog="${i + 1}"]`), { x, duration: 1, ease }, 0));

      // Ambient lantern flicker: opacity only, runs while the slot is on screen, reverted with the matchMedia context.
      const slot = root.current?.parentElement;
      const flicker = q("[data-flicker]");
      if (slot && flicker.length) {
        const loop = gsap.to(flicker, {
          keyframes: { opacity: [1, 0.72, 0.94, 0.58, 0.9, 0.7, 1], easeEach: "sine.inOut" },
          duration: 3.4,
          repeat: -1,
          paused: true,
        });
        ScrollTrigger.create({
          trigger: slot,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
        });
      }
    }
  });

  return (
    <div ref={root} className="relative h-full" style={ROOT_VARS}>
      <Stage label={COPY.line.en}>
        {/* Scrim behind the art: deepens the sky where the text sits so copy keeps >= 4.5:1 over stars. */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[58svh] bg-linear-to-b from-transparent from-0% via-ink/40 via-32% to-transparent to-100%" />
        <Art>
          <defs>
            <linearGradient id="s1-water" gradientUnits="userSpaceOnUse" x1="0" y1={BASE} x2="0" y2="900">
              <Stop at={0} color="var(--sky-bottom)" />
              <Stop at={0.4} color="var(--sky-top)" />
              <Stop at={1} color="var(--ink)" />
            </linearGradient>
            <linearGradient id="s1-sinks" gradientUnits="userSpaceOnUse" x1="0" y1={BASE} x2="0" y2="880">
              <Stop at={0} color="var(--ink)" o={0} />
              <Stop at={1} color="var(--ink)" o={0.85} />
            </linearGradient>
            <linearGradient id="s1-dusk" gradientUnits="userSpaceOnUse" x1="0" y1="330" x2="0" y2={BASE}>
              <Stop at={0} color="var(--s1-dawn-teal)" o={0} />
              <Stop at={0.55} color="var(--s1-dawn-teal)" o={0.2} />
              <Stop at={1} color="var(--s1-dawn)" o={0.62} />
            </linearGradient>
            <linearGradient id="s1-line" x1="0" y1="0" x2="1" y2="0">
              <Stop at={0} color="var(--text-muted)" o={0} />
              <Stop at={0.18} color="var(--text-muted)" o={0.7} />
              <Stop at={0.82} color="var(--text-muted)" o={0.7} />
              <Stop at={1} color="var(--text-muted)" o={0} />
            </linearGradient>
            <radialGradient id="s1-sun">
              <Stop at={0} color="var(--s1-dawn)" o={0.7} />
              <Stop at={0.6} color="var(--s1-dawn)" o={0.18} />
              <Stop at={1} color="var(--s1-dawn)" o={0} />
            </radialGradient>
            <radialGradient id="s1-fog">
              <Stop at={0} color="var(--text-muted)" o={0.62} />
              <Stop at={0.55} color="var(--text-muted)" o={0.26} />
              <Stop at={1} color="var(--text-muted)" o={0} />
            </radialGradient>
            <radialGradient id="s1-warm">
              <Stop at={0} color="var(--glow)" o={0.78} />
              <Stop at={0.55} color="var(--glow)" o={0.32} />
              <Stop at={1} color="var(--glow)" o={0} />
            </radialGradient>
            <radialGradient id="s1-halo">
              <Stop at={0} color="var(--glow)" o={0.85} />
              <Stop at={0.4} color="var(--glow)" o={0.3} />
              <Stop at={1} color="var(--glow)" o={0} />
            </radialGradient>
            <g id="s1-boat">
              <path d={BOAT.hull} />
              <path d={BOAT.hood} />
              <path d={BOAT.boatman} />
              <path d={BOAT.pole} fill="none" stroke="currentColor" strokeWidth="2.6" />
            </g>
          </defs>

          {/* 1 · sky: stars in clusters, dawn wash, pale horizon line */}
          {STAR_PATHS.map((s, i) => (
            <g key={i} data-stars className="fill-none stroke-copy" strokeLinecap="round">
              <path d={s.big} strokeWidth="3.4" opacity="0.95" />
              <path d={s.small} strokeWidth="2" opacity="0.7" />
            </g>
          ))}
          <g data-dawn opacity="0">
            <rect x="-100" y="330" width="1800" height={BASE - 330} fill="url(#s1-dusk)" />
            <ellipse cx="1130" cy={BASE} rx="760" ry="190" fill="url(#s1-sun)" />
          </g>
          <rect x="-100" y={BASE - 2} width="1800" height="2.4" fill="url(#s1-line)" />

          {/* 2 · skylines: far bank (faint) then the old city with its mosque and minarets */}
          <g data-layer="far" className="fill-ink" opacity="0.4">
            <path d={FAR_PATH} />
          </g>
          <g data-layer="mid">
            <g id="s1-sk">
              <path d={MID_PATH} className="fill-ink" opacity="0.94" />
              {WINDOW_GROUPS.map((d, i) => (
                <path key={i} data-win d={d} className="fill-glow" opacity="0" />
              ))}
            </g>

            {/* 3 · river: sky-tinted water, mirrored skyline broken into ripples, glints */}
            <rect x="-100" y={BASE} width="1800" height={900 - BASE} fill="url(#s1-water)" />
            {!low && (
              <>
                <use href="#s1-sk" transform={`translate(0 ${BASE * 2}) scale(1 -1)`} opacity="0.3" />
                <path d={RIPPLE_PATH} fill="url(#s1-water)" />
              </>
            )}
            <rect x="-100" y={BASE} width="1800" height={900 - BASE} fill="url(#s1-sinks)" />
          </g>
          <g data-dawn opacity="0">
            <ellipse cx="1130" cy={BASE + 16} rx="560" ry="60" fill="url(#s1-sun)" />
            <path d={GLINT_PATH} className="fill-copy-muted" opacity="0.4" />
          </g>

          {/* 4 · boats: ink silhouettes with mirrored reflections; the lead boat carries the lantern */}
          {boats.map(([x, y, s, glide, lantern], i) => (
            <g key={i} data-boat data-glide={glide} className="text-ink">
              <g transform={`translate(${x} ${y}) scale(${s})`} className="fill-ink">
                <use href="#s1-boat" transform="scale(1 -0.7)" opacity="0.3" />
                <use href="#s1-boat" />
                {lantern && (
                  <>
                    <path d={BOAT.post} fill="none" stroke="currentColor" strokeWidth="2.6" />
                    <path d={BOAT.lamp} className="fill-glow" />
                    <circle data-flicker cx={BOAT.lampCx} cy={BOAT.lampCy} r="30" fill="url(#s1-halo)" />
                    <path data-flicker d={BOAT.glint} className="fill-glow" opacity="0.55" />
                  </>
                )}
              </g>
            </g>
          ))}

          {/* 5 · fog in front, lowest layer thickest and fastest; amber twins light up at the end */}
          {FOG_LAYERS.map((l, n) => (
            <g key={n} data-fog={n + 1}>
              <g data-cool opacity={l.opacity}>
                {FOG_BLOBS[n].map((b, i) => (
                  <ellipse key={i} cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} fill="url(#s1-fog)" />
                ))}
              </g>
              {n > 0 && (
                <g data-warm opacity="0">
                  {FOG_BLOBS[n].filter((_, i) => i % 2 === 1).map((b, i) => (
                    <ellipse key={i} cx={b.cx} cy={b.cy - b.ry * 0.25} rx={b.rx} ry={b.ry * 0.8} fill="url(#s1-warm)" />
                  ))}
                </g>
              )}
            </g>
          ))}
        </Art>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: GRAIN, maskImage: GRAIN_MASK, WebkitMaskImage: GRAIN_MASK }} />
        <SceneText time={COPY.time} line={COPY.line} />
      </Stage>
    </div>
  );
}
