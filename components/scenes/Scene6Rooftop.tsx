"use client";

/*
  Scene 6, 4:30 PM, "ছাদ আমাদের উঠান". Not at the tong: the roof of the same block at golden hour, in the
  same printed language. A sea of water tanks, washing on lines, dishes, stair head-rooms, roofs so close you
  can shout across, a pigeon coop with a flock circling it (canvas 2D, direction follows the scroll), a low
  hazy sun and drifting dust haze. Two kids fly kites across the gap between roofs. The kid on the right roof
  saws the other's string through: "ভো-কাট্টা!". The cut kite floats down across the frame; the barefoot kite
  boy ducks into his stair hatch, the camera descends the building's facade to the lane, and he bursts out of
  the ground door and runs after it with every kid in the lane following, until the kite snags on the wires.
  ONE tall drawing (1600 x 1800: roof on top, lane below) in one `data-world` layer. The camera is a single
  glide (a slow push and drift) plus the world's descent; nothing is cut or cross-faded.
  Fractions of the 230svh trigger range (the stage is still sliding in until about 0.30):
    0-0.30   kites pay out their strings and rise; the haze drifts; narration 0.12-0.36
    0.30-0.55 the kites drift; the right kid's kite sweeps toward the other string
    0.555    the cut: starburst, the loser's string whips down, the kite goes free; slip 0.56-0.70
    0.56-0.85 the cut kite floats down (x sways, y falls), snags on the wires
    0.60-0.66 the kite boy walks into the hatch; 0.66-0.79 the camera descends the facade
    0.775-0.92 the lane chase (boy, then three more kids pour in); 0.92-0.97 they reach and jump
    0.965-1  the camera fades to sky (sky-to-sky hand-off)
  Engine: GSAP scrub on the slot, transform + opacity only. A kite is built in the rotating frame of its kid's
  hand (a rotating group, a unit string scaled to the length, the kite pushed out by the same length), so
  string and kite stay joined by construction. No svgOrigin, nothing driven from onUpdate; origins are set
  once at the local origin from the element's own bbox. Ambient loops (washing, tails, haze) are CSS.
  Reduced motion: camera fixed (1.06), no travel, no canvas (a static flock silhouette instead); the roof is
  a held frame at the cut (kites crossing, the loose kite, the flash, the slip), then the whole picture fades
  out and in on the lane (the same drawing, framed lower) as a still sequence: kids mid-chase, then reaching
  up at the snagged kite.
*/

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import type { CSSProperties } from "react";
import { COPY } from "@/lib/copy";
import { palette, toCssVarObject } from "@/lib/palette";
import { EASE, SCENES, type SceneProps } from "@/lib/scenes";
import { Art, Camera, Narration, SpeechSlip, Stage, useLiveGate, useSceneTimeline } from "./scene-kit";
import PigeonSwarm from "./PigeonSwarm";
import { KiteBoy, Mother, SchoolKid } from "./tong/cast";
import {
  Buildings, CUT_AT, CUT_KITE, DOOR, Dust, FIGHT, FarKites, FarRoofs, Flash, FreeKite, Haze, KiteRig, LANE_Y, LEFTKID_AT, LEFTKID_S, LEFT_HAND, LOSER_AT, LOSER_HAND, LaneGround, LanePole,
  MOTHER_AT, Parapets, RoofProps, SNAG, STUB_LEN, Sun, TongGlimpse, WINNER_AT, WINNER_HAND,
} from "./rooftop/art";
import "./rooftop/rooftop.css";

const { narration, overheard } = COPY[6];
const LANE_FEET = LANE_Y + 28;
// The afternoon's lit set stays lit while the sky runs on toward dusk: only these tokens are pinned (not the sky,
// not the text colours), as Scene 1 of v1 did. The far roofs and the haze still mix with the live sky.
const t6 = toCssVarObject(palette[6]);
const PINNED = { "--ink": t6["--ink"], "--accent": t6["--accent"], "--glow": t6["--glow"], "--wall": t6["--wall"], "--tarp": t6["--tarp"] } as CSSProperties;
const FLOCK_AT = [640, 548] as const;
const FLOCK_R = 225;

/** The lane kids: where they start (x, art units), how far left they run, and when. */
const KIDS = [
  { id: "a", x: 1180, run: 345, s: 1, from: 0.775, to: 0.915, shirt: "cue-uniform" },
  { id: "b", x: 1310, run: 380, s: 0.92, from: 0.79, to: 0.93, shirt: "cue-cap" },
  { id: "c", x: 1440, run: 430, s: 0.84, from: 0.8, to: 0.945, shirt: "cue-uniform" },
] as const;
const BOY_RUN = { from: 0.775, to: 0.9, dx: -160 };

// The cut kite's float: x sways left across the sun (world x, scene fraction, tilt in degrees) while it falls. Its y
// is derived below so that it stays in the frame while the camera descends (the camera tracks it down the facade).
const FLOAT: readonly (readonly [number, number, number])[] = [
  [862, 0.6, 14], [790, 0.64, -14], [770, 0.68, 12], [820, 0.72, -12], [790, 0.76, 14], [740, 0.8, -16], [SNAG[0], 0.85, -28],
];
const DESCENT = { from: 0.66, to: 0.79 }; // the camera's descent (fractions)
// where the loose kite sits on SCREEN (art units from the top of the frame) at key fractions
const KITE_SCREEN: readonly (readonly [number, number])[] = [[0.555, 277], [0.62, 380], [0.7, 470], [0.79, 480], [0.85, SNAG[1] - 900]];

export default function Scene6Rooftop({ tier, reducedMotion }: SceneProps) {
  const root = useRef<HTMLDivElement>(null);
  const low = tier === "low";
  const ease = EASE[SCENES[6].ease]; // back.out: used for the small punches (flash, hops), never for the camera
  useLiveGate(root);

  useSceneTimeline(root, 6, (tl, mode, q) => {
    const full = mode === "full";
    const $ = (sel: string) => q(sel);
    const E = "power2.out";
    const IO = "sine.inOut";
    const [camera, world] = [$("[data-camera]"), $("[data-world]")];
    const rig = (id: string) => ({ rig: $(`[data-rig="${id}"]`), str: $(`[data-string="${id}"]`), kx: $(`[data-kx="${id}"]`), kr: $(`[data-kr="${id}"]`) });
    const [loser, winner, left] = [rig("loser"), rig("winner"), rig("left")];
    const [free, spin, flash, slip] = [$("[data-free]"), $("[data-free-spin]"), $("[data-flash]"), $("[data-slip]")];
    const [boyRoof, winnerKid, boyRun, boyReach] = [$("[data-boy-roof]"), $("[data-winner-kid]"), $("[data-boy-run]"), $("[data-boy-reach]")];

    // pivot every rotating/scaling part at its own local origin, once (GSAP origins are bbox-relative)
    const pivot0 = (els: Element[]) =>
      els.forEach((el) => {
        const b = (el as SVGGraphicsElement).getBBox();
        gsap.set(el, { transformOrigin: `${-b.x}px ${-b.y}px` });
      });
    pivot0([...loser.rig, ...loser.str, ...loser.kr, ...winner.rig, ...winner.str, ...winner.kr, ...left.rig, ...left.str, ...left.kr, ...spin, ...flash]);

    // ---- a kite on its string: one segment of (angle, length, sag, tilt) -------------------------------
    type K = { th: number; L: number; sag: number; tilt?: number };
    const seg = (r: ReturnType<typeof rig>, a: K, b: K, at: number, dur: number, ez: string, first = false) => {
      const t = { duration: dur, ease: ez, immediateRender: first };
      tl.fromTo(r.rig, { rotation: a.th }, { rotation: b.th, ...t }, at);
      tl.fromTo(r.str, { scaleX: a.L, scaleY: a.sag * 2 }, { scaleX: b.L, scaleY: b.sag * 2, ...t }, at);
      tl.fromTo(r.kx, { x: a.L }, { x: b.L, ...t }, at);
      tl.fromTo(r.kr, { rotation: (a.tilt ?? 0) - a.th }, { rotation: (b.tilt ?? 0) - b.th, ...t }, at);
    };
    const still = (r: ReturnType<typeof rig>, k: K) => {
      gsap.set(r.rig, { rotation: k.th });
      gsap.set(r.str, { scaleX: k.L, scaleY: k.sag * 2 });
      gsap.set(r.kx, { x: k.L });
      gsap.set(r.kr, { rotation: (k.tilt ?? 0) - k.th });
    };

    // loser = the kite boy's (cut at 0.555); winner = the right kid's; left = a decor kite on the left roof
    const L0: K = { th: FIGHT.loserDeg + 8, L: 150, sag: 40, tilt: 6 };
    const L1: K = { th: FIGHT.loserDeg - 3, L: 300, sag: 22, tilt: -4 };
    const L2: K = { th: FIGHT.loserDeg, L: FIGHT.loserLen, sag: 16, tilt: 4 };
    const W0: K = { th: FIGHT.winnerDeg - 14, L: 150, sag: 36, tilt: -6 };
    const W1: K = { th: FIGHT.winnerDeg - 24, L: FIGHT.winnerLen, sag: 20, tilt: 5 };
    const W2: K = { th: FIGHT.winnerDeg - 28, L: FIGHT.winnerLen, sag: 18, tilt: -4 };
    const W3: K = { th: FIGHT.winnerDeg, L: FIGHT.winnerLen, sag: 9, tilt: 14 };
    const W4: K = { th: FIGHT.winnerDeg + 24, L: FIGHT.winnerLen + 50, sag: 16, tilt: -8 };
    const W5: K = { th: FIGHT.winnerDeg + 18, L: FIGHT.winnerLen + 50, sag: 18, tilt: 4 };
    const D0: K = { th: -118, L: 130, sag: 34, tilt: 6 };
    const D1: K = { th: -112, L: 330, sag: 22, tilt: -6 };
    const D2: K = { th: -107, L: 360, sag: 20, tilt: 5 };

    // the cut kite floats: offsets from its position at the cut
    const dx = (x: number) => x - CUT_KITE[0];
    const dy = SNAG[1] - CUT_KITE[1];

    // ---- one glide: a slow push and drift over the whole scene (never a cut), then the world descends --------
    if (full) {
      tl.fromTo(camera, { xPercent: 2.5, scale: 1 }, { xPercent: -3, scale: 1.08, duration: 1, ease: IO }, 0);
      tl.fromTo(world, { yPercent: 0 }, { yPercent: -50, duration: DESCENT.to - DESCENT.from, ease: "power3.inOut", immediateRender: false }, DESCENT.from);
    } else gsap.set(camera, { scale: 1.06 });

    // ---- the hand-off at the end: the camera fades to sky -----------------------------------------------------
    tl.to(camera, { autoAlpha: 0, duration: 0.035, ease: E }, 0.965);

    // initial hidden states (mm.revert() restores the markup)
    gsap.set([slip, flash, free, boyRun, boyReach, ...$("[data-kid]"), ...$("[data-kid-reach]")], { autoAlpha: 0 });

    if (full) {
      // ---- 0-0.555 the kites pay out and drift; the winner's kite sweeps across the loser's string -------------
      seg(loser, L0, L1, 0, 0.3, "power1.out", true);
      seg(loser, L1, L2, 0.3, 0.255, IO);
      seg(winner, W0, W1, 0, 0.3, "power1.out", true);
      seg(winner, W1, W2, 0.3, 0.2, IO);
      seg(winner, W2, W3, 0.5, 0.055, "power2.inOut"); // the sweep: the strings saw
      seg(winner, W3, W4, 0.555, 0.09, "power2.out"); // the victory loop
      seg(winner, W4, W5, 0.645, 0.3, IO);
      seg(left, D0, D1, 0, 0.36, "power1.out", true);
      seg(left, D1, D2, 0.36, 0.5, IO);

      // ---- 0.555 the cut ------------------------------------------------------------------------------------
      tl.fromTo(flash, { autoAlpha: 1, scale: 0.6 }, { scale: 1.15, duration: 0.03, ease, immediateRender: false }, 0.555);
      tl.to(flash, { autoAlpha: 0, duration: 0.025, ease: E }, 0.575);
      tl.to(loser.kx, { autoAlpha: 0, duration: 0.003 }, 0.555); // the kite leaves the string...
      tl.to(free, { autoAlpha: 1, duration: 0.003 }, 0.555); // ...and flies on as the loose kite
      tl.to(loser.str, { scaleX: STUB_LEN, scaleY: 12, duration: 0.004, ease: "none" }, 0.555); // the lower piece
      tl.fromTo(loser.rig, { rotation: FIGHT.loserDeg }, { rotation: 100, duration: 0.05, ease: E, immediateRender: false }, 0.556); // whips down
      tl.to(loser.str, { autoAlpha: 0, duration: 0.03, ease: E }, 0.63);
      tl.to(winnerKid, { y: -9, duration: 0.012, repeat: 3, yoyo: true, ease }, 0.557); // the winner jumps

      // ---- 0.555-0.85 the loose kite floats down across the frame -----------------------------------------------
      const camEase = gsap.parseEase("power3.inOut");
      const T = (p: number) => (p <= DESCENT.from ? 0 : p >= DESCENT.to ? 900 : camEase((p - DESCENT.from) / (DESCENT.to - DESCENT.from)) * 900);
      const screenY = (p: number) => {
        for (let i = 1; i < KITE_SCREEN.length; i++) {
          const [[p0, y0], [p1, y1]] = [KITE_SCREEN[i - 1], KITE_SCREEN[i]];
          if (p <= p1) return y0 + ((y1 - y0) * (p - p0)) / (p1 - p0);
        }
        return KITE_SCREEN[KITE_SCREEN.length - 1][1];
      };
      const worldY = (p: number) => screenY(p) + T(p) - CUT_KITE[1];
      for (let p = 0.555; p < 0.85 - 1e-6; p += 0.01) {
        const q2 = Math.min(p + 0.01, 0.85);
        tl.fromTo(free, { y: worldY(p) }, { y: q2 >= 0.85 ? dy : worldY(q2), duration: q2 - p, ease: "none", immediateRender: false }, p);
      }
      let at = 0.555;
      let px = 0;
      let pr = 0;
      for (const [x, t, r] of FLOAT) {
        tl.fromTo(free, { x: px }, { x: dx(x), duration: t - at, ease: IO, immediateRender: false }, at);
        tl.fromTo(spin, { rotation: pr }, { rotation: r, duration: t - at, ease: IO, immediateRender: false }, at);
        px = dx(x);
        pr = r;
        at = t;
      }

      // ---- 0.60-0.66 the kite boy lets go and goes down the stairs ---------------------------------------------
      tl.fromTo(boyRoof, { x: 0 }, { x: DOOR.x + 34 - LOSER_AT[0], duration: 0.04, ease: "none", immediateRender: false }, 0.6);
      tl.to(boyRoof, { autoAlpha: 0, duration: 0.02, ease: E }, 0.64);

      // ---- 0.775-0.97 the chase: the boy out of the ground door, three kids pouring in from the right --------------
      tl.to(boyRun, { autoAlpha: 1, duration: 0.004 }, BOY_RUN.from);
      tl.fromTo(boyRun, { x: 0 }, { x: BOY_RUN.dx, duration: BOY_RUN.to - BOY_RUN.from, ease: "none", immediateRender: false }, BOY_RUN.from);
      tl.to(boyRun, { y: -5, duration: 0.012, repeat: 11, yoyo: true, ease: IO }, BOY_RUN.from);
      tl.to(boyRun, { autoAlpha: 0, duration: 0.004 }, BOY_RUN.to);
      tl.to(boyReach, { autoAlpha: 1, duration: 0.004 }, BOY_RUN.to);
      tl.to(boyReach, { y: -12, duration: 0.014, repeat: 3, yoyo: true, ease: "power2.out" }, 0.93);
      KIDS.forEach((k) => {
        const [run, reach] = [$(`[data-kid="${k.id}"]`), $(`[data-kid-reach="${k.id}"]`)];
        tl.to(run, { autoAlpha: 1, duration: 0.004 }, k.from);
        tl.fromTo(run, { x: 0 }, { x: -k.run, duration: k.to - k.from, ease: "none", immediateRender: false }, k.from);
        tl.to(run, { y: -5, duration: 0.011, repeat: 12, yoyo: true, ease: IO }, k.from);
        tl.to(run, { autoAlpha: 0, duration: 0.004 }, k.to);
        tl.to(reach, { autoAlpha: 1, duration: 0.004 }, k.to);
        tl.to(reach, { y: -10, duration: 0.014, repeat: 3, yoyo: true, ease: "power2.out" }, k.to + 0.012);
      });
    } else {
      // ---- reduced motion: opacity only; the picture holds, then fades to the lane and fades back in ---------------
      still(loser, L2);
      still(winner, W3);
      still(left, D2);
      gsap.set([free, flash, slip], { autoAlpha: 0 });
      // the cut as a swap: the kite leaves the string and the loose kite and the starburst fade in
      tl.set(loser.str, { scaleX: STUB_LEN, scaleY: 12 }, 0.54);
      tl.set(loser.rig, { rotation: 100 }, 0.54);
      tl.to(loser.kx, { autoAlpha: 0, duration: 0.03, ease: E }, 0.54);
      tl.to([free, flash], { autoAlpha: 1, duration: 0.04, ease: E }, 0.54);
      // the roof held; then everything fades out, the world is lowered while nothing is visible, and fades in on the lane
      tl.to(camera, { autoAlpha: 0, duration: 0.04, ease: E }, 0.7);
      tl.set(world, { yPercent: -50 }, 0.745);
      tl.set(free, { x: dx(SNAG[0]), y: dy }, 0.745);
      tl.set(spin, { rotation: -28 }, 0.745);
      tl.set(boyRoof, { autoAlpha: 0 }, 0.745);
      tl.set(loser.rig, { autoAlpha: 0 }, 0.745);
      tl.fromTo(camera, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04, ease: E, immediateRender: false }, 0.75);
      gsap.set(boyRun, { x: BOY_RUN.dx * 0.55 });
      tl.to(boyRun, { autoAlpha: 1, duration: 0.03, ease: E }, 0.78);
      KIDS.forEach((k) => {
        const run = $(`[data-kid="${k.id}"]`);
        gsap.set(run, { x: -k.run * 0.55 });
        tl.to(run, { autoAlpha: 1, duration: 0.03, ease: E }, 0.78);
        tl.to(run, { autoAlpha: 0, duration: 0.03, ease: E }, 0.88);
        tl.to($(`[data-kid-reach="${k.id}"]`), { autoAlpha: 1, duration: 0.03, ease: E }, 0.9);
      });
      tl.to(boyRun, { autoAlpha: 0, duration: 0.03, ease: E }, 0.88);
      tl.to(boyReach, { autoAlpha: 1, duration: 0.03, ease: E }, 0.9);
      tl.to(slip, { autoAlpha: 1, duration: 0.03, ease: E }, 0.56);
      tl.to(slip, { autoAlpha: 0, duration: 0.03, ease: E }, 0.68);
    }

    // the loose kite's flutter state at the start, and the slip (full motion)
    if (full) {
      tl.to(slip, { autoAlpha: 1, duration: 0.025, ease: E }, 0.56);
      tl.fromTo(slip, { y: 6 }, { y: 0, duration: 0.025, ease: E, immediateRender: false }, 0.56);
      tl.to(slip, { autoAlpha: 0, duration: 0.025, ease: E }, 0.675);
    }
  });

  return (
    <div ref={root} className="rooftop relative h-full" data-live="false" style={PINNED}>
      <Stage label={narration!.en}>
        <Camera origin="50% 82%">
          <div data-world className="absolute top-0 left-0 h-[200%] w-full">
            <Art viewBox="0 0 1600 1800" overflow="visible">
              <Sun low={low} />
              <Haze y={560} h={90} seed={301} opacity={0.5} drift="a" />
              <FarRoofs low={low} />
              <FarKites low={low} />
              <Haze y={640} h={110} seed={302} opacity={0.55} drift="b" />
              <Buildings low={low} />
              <RoofProps low={low} />

              {/* the roof's cast: mother at the line, the kite boy, the kid across the gap, a kid on the left roof */}
              <Mother at={MOTHER_AT} s={0.96} />
              <g data-boy-roof>
                <KiteBoy at={LOSER_AT} pose="reach" />
              </g>
              <g data-winner-kid>
                <SchoolKid at={WINNER_AT} flip pose="reach" />
              </g>
              <SchoolKid at={LEFTKID_AT} s={LEFTKID_S} pose="reach" />
              <Parapets />

              {/* the lane: pole and wires, the tong's tarp, the ground floor, the pavement */}
              <LaneGround />
              <TongGlimpse />
              <LanePole low={low} />
              <g data-lane-cast>
                <g data-boy-run>
                  <KiteBoy at={[DOOR.x + 34, LANE_FEET]} flip pose="run" />
                  <Dust x={DOOR.x + 34} y={LANE_FEET} flip />
                </g>
                <g data-boy-reach>
                  <KiteBoy at={[DOOR.x + 34 + BOY_RUN.dx, LANE_FEET]} flip pose="reach" />
                </g>
                {KIDS.map((k) => (
                  <g key={k.id}>
                    <g data-kid={k.id}>
                      <SchoolKid at={[k.x, LANE_FEET]} s={k.s} flip pose="run" shirt={k.shirt} />
                      <Dust x={k.x} y={LANE_FEET} flip />
                    </g>
                    <g data-kid-reach={k.id}>
                      <SchoolKid at={[k.x - k.run, LANE_FEET]} s={k.s} flip pose="reach" shirt={k.shirt} />
                    </g>
                  </g>
                ))}
              </g>

              {/* kites over everything: two fighting, one decoration; the loose kite is the loser's */}
              <KiteRig id="left" hand={LEFT_HAND} a="fill-glow" b="fill-tarp" />
              <KiteRig id="winner" hand={WINNER_HAND} a="fill-accent" b="fill-glow" />
              <KiteRig id="loser" hand={LOSER_HAND} a="fill-tarp" b="fill-paper" />
              <FreeKite at={CUT_KITE} a="fill-tarp" b="fill-paper" trail={Math.hypot(CUT_AT[0] - CUT_KITE[0], CUT_AT[1] - CUT_KITE[1])} />
              <Flash at={CUT_AT} />
            </Art>

            <PigeonSwarm tier={tier} reducedMotion={reducedMotion} at={FLOCK_AT} radius={FLOCK_R} />
            {/* the kid across the gap shouts; the slip's tail points at his head */}
            <SpeechSlip line={overheard[0]} x={WINNER_AT[0] - 6} y={WINNER_AT[1] - 196 - 22 - 900} side="left" beat="winner" />
          </div>
        </Camera>
        <Narration line={narration!} />
      </Stage>
    </div>
  );
}
