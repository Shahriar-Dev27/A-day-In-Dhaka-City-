"use client";

/*
  Scene 3, 9:00 AM, the main road (hero). We leave the tong's corner and pan along a jammed street in
  five depth layers (far skyline + flyover, shop-front street, metro viaduct, three traffic lanes, poles
  and wires). Beats, as fractions of the slot's scroll range (all scrubbed, nothing time-based but the wheels):
    0.00-0.26  the approach at full pace, "আসতেছি" board, buses and rickshaws rolling
    0.26-0.44  THE JAM: pan speed falls to 20% and holds for ~13% of the slot; the "জ্যাম" board stamps in,
               the helper bangs the bus, horns ring, the commuter's "আসতেছি, পাঁচ মিনিট।" (0.33-0.47)
    0.44-0.78  it bursts free: pace x2.2 then a long non-overshooting ease to rest; the metro train sails
               overhead, rickshaws and bikes weave ahead, the "সামনে আগান" banner hangs over the traffic
    0.74-0.86  the camera lifts up the concrete pier toward the elevated line (hand-off to Scene 4)
    0.82-0.96  the closing line "৯টা বাজে, ঢাকা থামে না" (narration), then the art fades to sky
  Engine: GSAP scrub on the slot; ONE proxy tween (state.p) drives every layer through jam/layout.ts so
  there is a single owner for each layer's transform. Wheels spin from the scroll velocity (v1 mechanic).
  Exhaust and tassels are CSS loops, paused off-screen (useLiveGate). Reduced motion: no pan (the street
  is parked on the jam), the three words become one static printed row, every beat is an opacity beat.
  DOM budget (high tier): ~470 SVG nodes + 4 boards; low tier drops the far and near layers, thins the
  traffic to the keep-list (see the DOM count in the handoff) and halves the wires.
*/

import { useRef, type CSSProperties, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { getScrollVelocityNorm } from "@/lib/scroll";
import { COPY, type Line } from "@/lib/copy";
import { voiceIdFor } from "@/lib/voice";
import type { SceneProps } from "@/lib/scenes";
import { Narration, SlipAnchor, SpeechSlip, Stage, useLiveGate, useSceneTimeline } from "./scene-kit";
import { LAYERS, LAYER_W, PH, centreX, makeCamera, wheelFactor, type LayerId } from "./jam/layout";
import { FarLayer, HEAD, LineLayer, MidLayer, NearLayer, StreetLayer, TRAIN_FROM } from "./jam/street";
import { JamDefs } from "./jam/vehicles";
import "./jam/jam.css";

const { narration, overheard, giant } = COPY[3];
const [WORD_A, WORD_B, WORD_C] = giant!;

type Vars = Record<`--${string}`, string | number>;

function Board({ line, x, y, board, ink, hung, leg, tag }: { line: Line; x?: number; y?: number; board: string; ink: string; hung?: boolean; leg?: number; tag?: string }) {
  const style: Vars = { "--board": board, "--board-ink": ink };
  if (x !== undefined) style["--x"] = x;
  if (y !== undefined) style["--y"] = y;
  if (leg !== undefined) style["--leg"] = leg;
  return (
    <div className="jam-board" data-board={tag} data-voice={voiceIdFor(line.bn)} data-hung={hung ? "" : undefined} style={style as CSSProperties}>
      <p lang="bn" className="jam-board-word">
        {line.bn}
      </p>
      <p lang="en" className="jam-board-en">
        {line.en}
      </p>
    </div>
  );
}

const BOARD_A = { board: "var(--j-cream)", ink: "var(--tarp)" } as const;
const BOARD_B = { board: "var(--j-mag)", ink: "var(--j-cream)" } as const;
const BOARD_C = { board: "var(--j-amber)", ink: "var(--ink)" } as const;

// x of each board in ITS layer (the layer anchors in jam/layout.ts centre them at the beat they belong to)
const CX_BOARD = { a: 900, b: 1980, c: 5500 } as const;

const layerStyle = (id: LayerId): CSSProperties => ({ width: `calc(${LAYER_W[id]} * var(--ju))` });

export default function Scene3Jam({ tier }: SceneProps) {
  const root = useRef<HTMLDivElement>(null);
  const low = tier === "low";
  useLiveGate(root);

  useSceneTimeline(root, 3, (tl, mode, q) => {
    const full = mode === "full";
    const els = (sel: string) => q(sel) as HTMLElement[];
    // GSAP warns "target not found" for an empty target list, so every tween goes through these guards
    const to = (t: Element[], vars: gsap.TweenVars, at: number) => (t.length ? tl.to(t, vars, at) : null);
    const fromTo = (t: Element[], a: gsap.TweenVars, b: gsap.TweenVars, at: number) => (t.length ? tl.fromTo(t, a, b, at) : null);

    const world = els("[data-world]")[0];
    if (!world) return;
    gsap.set(world, { autoAlpha: 1 });
    const layers = LAYERS.flatMap((id) => {
      const e = els(`[data-layer="${id}"]`)[0];
      return e ? [{ id, sx: gsap.quickSetter(e, "x", "px"), sy: gsap.quickSetter(e, "y", "px") }] : [];
    });

    // ---- the camera: one number (state.p) -> layer offsets -------------------------------------
    let ju = 1;
    let vwU = 1600;
    let cam = makeCamera(800);
    const state = { p: 0 };
    const place = (cx: number, lift: number) => {
      const c0 = vwU / 2;
      for (const l of layers) {
        l.sx(-(centreX(l.id, cx, c0) - c0) * ju);
        l.sy(lift * ju * (l.id === "near" ? 1.25 : 1));
      }
    };
    let applied = -1;
    const apply = () => {
      applied = state.p;
      place(cam.cx(state.p), cam.lift(state.p));
    };
    const measure = () => {
      ju = world.clientHeight / 900;
      vwU = world.clientWidth / ju;
      cam = makeCamera(vwU / 2);
      if (full) apply();
      else place(3000, 0); // parked on the jam: helper, commuter and the "জ্যাম" board share the frame
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(world);

    const slip = els('[data-slip="commuter"]');
    const halo = els("[data-halo]");
    gsap.set(slip, { autoAlpha: 0 });

    if (!full) {
      // Reduced motion: nothing travels. Beats are opacity beats on final positions.
      const row = els("[data-static] .jam-board");
      gsap.set(row, { autoAlpha: 0 });
      to(row, { autoAlpha: 1, duration: 0.05, ease: "power2.out", stagger: 0.08 }, 0.1);
      to(row, { autoAlpha: 0, duration: 0.05, ease: "power2.out" }, 0.66);
      to(slip, { autoAlpha: 1, duration: 0.05, ease: "power2.out" }, 0.36);
      to(slip, { autoAlpha: 0, duration: 0.05, ease: "power2.out" }, 0.58);
      // nothing lifts in reduce mode, so the art is gone before the closing line (0.82-0.96): it sits on bare sky
      to([world], { autoAlpha: 0, duration: 0.06, ease: "power2.out" }, 0.72);
      return () => ro.disconnect();
    }

    tl.to(state, { p: 1, duration: 1, ease: "none", onUpdate: apply }, 0);
    // ScrollTrigger restores a scrubbed timeline with events suppressed after every refresh (a lazy scene
    // mounting, a resize), so onUpdate alone would leave the layers at the start. state.p is still
    // rendered, so this ticker re-applies whenever it differs from what was last drawn.
    const sync = () => {
      if (state.p !== applied) apply();
    };
    gsap.ticker.add(sync);

    // ---- the jam: horns, the helper's bang, the stamp of the word, the halo on the liar ------------
    const bang = els("[data-bang]");
    const impact = els("[data-impact]");
    const bangs = 2 * 16 - 1; // odd repeat count so the arm ends where it began
    to(bang, { x: -13, duration: 0.011, repeat: bangs, yoyo: true, ease: "power1.out" }, 0.13);
    to(impact, { opacity: 1, duration: 0.011, repeat: bangs, yoyo: true, ease: "power1.out" }, 0.13);

    const honks = els("[data-honk]");
    gsap.set(honks, { transformOrigin: "50% 100%", opacity: 0 });
    honks.forEach((h, i) => tl.fromTo(h, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1.1, duration: 0.012, repeat: 7, yoyo: true, ease: "power2.out", immediateRender: false }, 0.32 + i * 0.012));

    const stamp = els('[data-board="b"]');
    gsap.set(stamp, { transformOrigin: "50% 100%" });
    fromTo(stamp, { scale: 1.08 }, { scale: 1, duration: 0.05, ease: "power3.out" }, 0.25);

    gsap.set(halo, { autoAlpha: 0 });
    to(halo, { autoAlpha: 0.4, duration: 0.03, ease: "power2.out" }, 0.3);
    to(halo, { autoAlpha: 0, duration: 0.04, ease: "power2.out" }, 0.47);
    // the overheard line: 0.33-0.47 of the slot = 49 svh on screen (>= 1 s at the 29.5 svh/s pace)
    to(slip, { autoAlpha: 1, duration: 0.04, ease: "power2.out" }, 0.33);
    fromTo(slip, { y: 6 }, { y: 0, duration: 0.04, ease: "power2.out", immediateRender: false }, 0.33);
    to(slip, { autoAlpha: 0, duration: 0.035, ease: "power2.out" }, 0.45);

    // ---- it bursts free: the train sails right to left overhead, rickshaws and bikes weave ahead ----
    const slot = els("[data-train-slot]");
    to(slot, { x: TRAIN_FROM - 700, duration: 0.3, ease: "none" }, 0.42);
    const cam800 = makeCamera(800);
    const pAt = (x: number) => {
      let lo = 0;
      let hi: number = PH.arrive;
      for (let i = 0; i < 24; i++) {
        const m = (lo + hi) / 2;
        if (cam800.cx(m) < x) lo = m;
        else hi = m;
      }
      return hi;
    };
    els("[data-bike]").forEach((b, i) => {
      const x = Number(b.dataset.x ?? 0) || 0;
      const t0 = Math.max(0, pAt(x - 900));
      const len = Math.min(0.2, Math.max(0.05, pAt(x + 500) - t0));
      tl.to(b, { x: 70, duration: len, ease: "none" }, t0);
      tl.to(b, { y: i % 2 ? 6 : -6, duration: 0.015, repeat: Math.max(1, 2 * Math.round(len / 0.03) - 1), yoyo: true, ease: "sine.inOut" }, t0);
    });
    els("[data-rick]").forEach((r, i) => {
      const x = Number(r.dataset.x ?? 0) || 0;
      if (x < 3300) return;
      tl.to(r, { x: 90 + (i % 3) * 50, duration: 0.2, ease: "power1.out" }, Math.max(PH.jamOut, pAt(x - 500)));
    });

    // ---- hand-off: the art fades to sky so the next stage reads sky to sky -------------------------
    to([world], { autoAlpha: 0, duration: 0.035, ease: "power2.out" }, 0.965);

    // ---- wheels: spin from scroll velocity, scaled by what each traffic class is doing -------------
    const wheels = els("[data-wheel]").map((w) => ({ x: Number(w.dataset.wx), kind: w.dataset.wheel as "free" | "heavy", set: gsap.quickSetter(w, "rotation", "deg") }));
    gsap.set(els("[data-wheel]"), { rotation: 0, transformOrigin: "50% 50%" });
    const angle = { free: 0, heavy: 0 };
    const tick = (_t: number, delta: number) => {
      if (!tl.scrollTrigger?.isActive || document.hidden) return;
      const v = getScrollVelocityNorm();
      const p = state.p;
      angle.free += v * delta * 0.8 * wheelFactor("free", p);
      angle.heavy += v * delta * 0.8 * wheelFactor("heavy", p);
      const cx = cam.cx(p);
      const reach = vwU / 2 + 200;
      for (const w of wheels) if (Math.abs(w.x - cx) < reach) w.set(angle[w.kind]);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.remove(sync);
      ro.disconnect();
    };
  });

  const layer = (id: LayerId, children: ReactNode) => (
    <div className="jam-layer" data-layer={id} style={layerStyle(id)}>
      {children}
    </div>
  );

  return (
    <div ref={root} className="relative h-full" data-live="false">
      <Stage label={narration!.en}>
        <div className="jam absolute inset-0">
          <JamDefs />
          <div data-world className="absolute inset-0">
            {!low && layer("far", <FarLayer />)}
            {layer("mid", <MidLayer low={low} />)}
            {layer("line", <LineLayer low={low} />)}
            {/* the hoardings stand on the mid layer's low roofs (same anchors) but read in front of the viaduct piers */}
            {layer(
              "board",
              <>
                <Board line={WORD_A} x={CX_BOARD.a} y={470} tag="a" {...BOARD_A} />
                <Board line={WORD_B} x={CX_BOARD.b} y={470} tag="b" {...BOARD_B} />
              </>,
            )}
            {layer(
              "street",
              <>
                <StreetLayer low={low} />
                {/* the commuter's slip rides his head through the panning layer (SlipAnchor recipe, scene-kit) */}
                <SlipAnchor x={HEAD[0]} unit="var(--ju)">
                  <SpeechSlip line={overheard[0]} x={800} y={HEAD[1] - 8} side="left" beat="commuter" />
                </SlipAnchor>
              </>,
            )}
            {!low &&
              layer(
                "near",
                <>
                  <NearLayer low={low} />
                  <Board line={WORD_C} x={CX_BOARD.c} y={470} tag="c" hung {...BOARD_C} />
                </>,
              )}
          </div>
        </div>
        {/* Reduced motion: the track never pans, so the three phrases stand in one printed row instead */}
        <div data-static className="jam-static">
          {[
            [WORD_A, BOARD_A],
            [WORD_B, BOARD_B],
            [WORD_C, BOARD_C],
          ].map(([w, c]) => (
            <Board key={(w as Line).en} line={w as Line} {...(c as typeof BOARD_A)} />
          ))}
        </div>
        <p className="sr-only">
          {giant!.map((w) => `${w.bn} (${w.en})`).join(". ")}.
        </p>
        <Narration line={narration!} />
      </Stage>
    </div>
  );
}
