"use client";

/*
  Scene 4, 9:40 AM, "Seeing Dhaka from above". The only quiet minute of the morning.
  Exterior: a clean white train glides right to left across the viaduct above the same jammed road; the
  street's horn marks duck out and a two-note chime pops over the roof. Then the camera follows the train
  and pushes x5 into the hero window, and at 0.25 there is an EXACT CUT (no cross-fade) to the carriage:
  the interior aperture is the same rectangle the exterior window filled. The city slides past behind
  the glass in four parallax panes while the camera pans along the passengers: the boy at the glass,
  the commuter whose lie from the jam is true now, the mother's first ride, the worker's closed eyes and
  the Tk 10 note, everyone turning to the window with the announcement, then the doors open and white
  light floods (the hand-off to Scene 5's bleached noon).
  Engine: GSAP scrub on the slot (scroll owns time). Ambient loops (straps, AC air, horns, hum) are CSS
  on inner elements and pause off-screen. Reduced motion: opacity only; the exterior and the carriage
  swap by opacity (never overlapping), the camera does not pan (the track is repositioned between beats
  while hidden), panes do not slide, all six beats still occur in order with their text.
*/

import { useRef, type CSSProperties } from "react";
import { gsap } from "@/lib/gsap";
import { COPY } from "@/lib/copy";
import { metroVars } from "@/lib/palette";
import type { SceneProps } from "@/lib/scenes";
import { Art, Camera, Narration, SpeechSlip, Stage, useLiveGate, useSceneTimeline } from "./scene-kit";
import { Commuter, Extra, FatherSon, MotherSon, SeatedWorker } from "./metro/cast-metro";
import { ChimeMarks, Road, Skyline, Train, TRAIN_START, Viaduct, HERO_X } from "./metro/exterior";
import { InteriorBack, InteriorFront, PANE_TRAVEL } from "./metro/interior";
import { AT, IN, PUSH, WIN, txFor } from "./metro/layout";
import m from "./metro/metro.module.css";

const { narration, overheard, announcement } = COPY[4];
const [boyLine, commuterLine, motherLine] = overheard;

const ORIGIN = `calc(50% + ${HERO_X - 800} * var(--u)) calc(100% - ${900 - WIN.cy} * var(--u))`;
const ZOOM = 1.18;
const FOCUS_X = 700; // screen x (art units) of a beat's speaker while its slip is up
const MOTHER_FOCUS = 1545; // between the son and the mother
const WORKER_ZOOM = 1.45;

// The carriage camera is an HTML wrapper (like the exterior Camera), origin = O (800, 760) in art units:
// screen = O + (x, y) + s * (p - O), so to hold a track point t on its spot, x = s * t * u (px). `u` = px per art
// unit, read from the stage at (re)build time (function values + invalidateOnRefresh keep it right on resize).
const CAM_ORIGIN = `50% calc(100% - ${900 - 760} * var(--u))`;

// timeline stops (fractions of the 180svh trigger range); slips are on screen >= 0.164 each (1 s at 29.5 svh/s)
const T = {
  glide: 0.2,
  push: 0.2,
  cut: 0.25,
  boy: [0.255, 0.425],
  commuter: [0.44, 0.61],
  mother: [0.625, 0.795],
  worker: 0.81,
  wide: 0.875,
  turn: 0.905,
  doorsPan: 0.945,
  doors: 0.955,
  flood: 0.972,
} as const;

export default function Scene4Metro({ tier }: SceneProps) {
  const root = useRef<HTMLDivElement>(null);
  const low = tier === "low";
  useLiveGate(root);

  useSceneTimeline(root, 4, (tl, mode, q) => {
    const full = mode === "full";
    const $ = (s: string) => q(s);
    const [ext, intr, camera, train, track] = [$("[data-exterior]"), $("[data-interior]"), $("[data-camera]"), $("[data-train-move]"), $("[data-mtrack]")];
    const horns = $("[data-horn]");
    const chimes = $("[data-chime]");
    const hero = $("[data-hero]");
    const worlds = { far: $('[data-world="far"]'), mid: $('[data-world="mid"]'), via: $('[data-world="via"]') };
    const panes = (["far", "mid", "near", "jam"] as const).map((k) => [$(`[data-pane="${k}"]`), PANE_TRAVEL[k]] as const)
      .filter(([els]) => els.length > 0); // the low tier drops the far and near panes
    const slip = (b: string) => $(`[data-slip="${b}"]`);
    const pax = (b: string) => $(`[data-pax="${b}"]`);
    const [led, flood, glare, doorL, doorR] = [$("[data-led]"), $("[data-flood]"), $("[data-glare]"), $('[data-door="l"]'), $('[data-door="r"]')];
    const front = $("[data-head-front]");
    const side = $("[data-head-side]");
    const bob = $("[data-bob]");
    const allPax = $("[data-pax]");
    const extras = pax("extra");
    const E = "power2.out";
    const unit = () => {
      const r = (track[0]?.parentElement ?? document.body).getBoundingClientRect();
      return Math.max(r.width / 1600, r.height / 900);
    };
    const cam = (tx: number, sc: number, ty = 0) => ({ x: () => sc * tx * unit(), y: () => sc * ty * unit(), scale: sc });

    // ---- initial states -------------------------------------------------------------------------
    gsap.set([intr, led, flood, glare, ...slip("boy"), ...slip("commuter"), ...slip("mother")], { autoAlpha: 0 });
    // --dim starts at 100 for everyone but the boy (CSS default in metro.module.css; gsap.set does not write custom properties on SVG groups)
    gsap.set(side, { autoAlpha: 0 });
        gsap.set(track, cam(0, 1));

    const txBoy = txFor(AT.boy, FOCUS_X, ZOOM);
    const txCommuter = txFor(AT.commuter, FOCUS_X, ZOOM);
    const txMother = txFor(MOTHER_FOCUS, FOCUS_X, ZOOM);
    const txWide = txFor(1930, 800, 1);
    const txDoor = txFor(AT.door, 800, 1);

    // ---- 0-0.20 beat 1, the glide: the train crosses; the street ducks; the chime ---------------
    if (full) tl.fromTo(train, { x: TRAIN_START }, { x: 0, duration: T.glide, ease: "power2.out" }, 0);
    tl.to(horns, { autoAlpha: 0, duration: 0.07, ease: E, stagger: 0.02 }, 0.04);
    chimes.forEach((c, i) => {
      if (full) tl.fromTo(c, { autoAlpha: 0, scale: 0.7, transformOrigin: "50% 100%" }, { autoAlpha: 1, scale: 1, duration: 0.02, ease: E }, 0.115 + i * 0.04);
      else tl.to(c, { autoAlpha: 1, duration: 0.02, ease: E }, 0.115 + i * 0.04);
      tl.to(c, { autoAlpha: 0, duration: 0.03, ease: E }, 0.15 + i * 0.04);
    });

    if (full) {
      // the camera follows the train: the world slides the other way, far layers least
      if (worlds.far.length) tl.fromTo(worlds.far, { x: 0 }, { x: 90, duration: 0.085, ease: "sine.inOut" }, 0.17);
      tl.fromTo(worlds.mid, { x: 0 }, { x: 260, duration: 0.085, ease: "sine.inOut" }, 0.17);
      tl.fromTo(worlds.via, { x: 0 }, { x: 520, duration: 0.085, ease: "sine.inOut" }, 0.17);
      // 0.20-0.25 the push through the window: x5 about the hero window's centre
      tl.fromTo(camera, { scale: 1 }, { scale: PUSH, duration: T.cut - T.push, ease: "power2.inOut" }, T.push);
      tl.fromTo(hero, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.012, ease: E }, T.cut - 0.012);
      // the exact cut: same aperture, same frame, nothing overlaps
      tl.set(ext, { autoAlpha: 0 }, T.cut);
      tl.set(intr, { autoAlpha: 1 }, T.cut);
    } else {
      tl.to(ext, { autoAlpha: 0, duration: 0.025, ease: E }, 0.2);
      tl.to(intr, { autoAlpha: 1, duration: 0.025, ease: E }, 0.23);
    }

    // ---- 0.25-0.945 the carriage ------------------------------------------------------------------
    if (full) {
      // the city slides past (left to right: the train heads left); linear, then the brake at the station
      for (const [p, d] of panes) {
        tl.fromTo(p, { x: -d }, { x: -0.0447 * d, duration: 0.635, ease: "none" }, T.cut);
        tl.to(p, { x: 0, duration: 0.06, ease: "power1.out" }, 0.885);
      }
      // camera: settle in on the boy, then pan along the carriage beat to beat
      tl.to(track, { ...cam(txBoy, ZOOM), duration: 0.05, ease: "sine.inOut" }, T.cut);
      tl.to(track, { ...cam(txCommuter, ZOOM), duration: 0.035, ease: "sine.inOut" }, 0.405);
      tl.to(track, { ...cam(txMother, ZOOM), duration: 0.035, ease: "sine.inOut" }, 0.59);
      tl.to(track, { ...cam(txFor(AT.worker, 800, WORKER_ZOOM), WORKER_ZOOM, -130), duration: 0.04, ease: "sine.inOut" }, 0.775);
      tl.to(track, { ...cam(txWide, 1), duration: 0.03, ease: "sine.inOut" }, T.wide);
      tl.to(track, { ...cam(txDoor, 1), duration: 0.025, ease: "sine.inOut" }, T.doorsPan);
    } else {
      // opacity only: the track is repositioned while hidden between beats
      const S = 1; // no zoom: the ceiling display sits exactly under its DOM text
      const hop = (t: number, x: number) => {
        tl.to(track, { autoAlpha: 0, duration: 0.012, ease: E }, t);
        tl.set(track, { x: cam(x, S).x }, t + 0.012);
        tl.to(track, { autoAlpha: 1, duration: 0.012, ease: E }, t + 0.012);
      };
      gsap.set(track, cam(txFor(AT.boy, FOCUS_X, S), S));
      for (const [p, d] of panes) gsap.set(p, { x: -0.14 * d });
      hop(0.42, txFor(AT.commuter, FOCUS_X, S));
      hop(0.605, txFor(MOTHER_FOCUS, FOCUS_X, S));
      hop(0.79, txFor(AT.worker, 800, S));
      hop(0.89, txFor(1930, 800, S));
      hop(0.94, txFor(AT.door, 800, S));
    }

    // dim everyone but the beat's subject (--dim: a solid colour mix, see metro.module.css), swap at each pan
    const focus = (from: string, to: string, t: number) => {
      tl.to(pax(from), { "--dim": 100, duration: 0.03, ease: E }, t);
      tl.to(pax(to), { "--dim": 0, duration: 0.03, ease: E }, t);
    };
    focus("boy", "commuter", full ? 0.405 : 0.42);
    focus("commuter", "mother", full ? 0.59 : 0.605);
    focus("mother", "worker", full ? 0.775 : 0.79);

    // each overheard line is its own slip, one at a time (>= 1 s each at the AC-D3 pace)
    const speak = (b: string, [a, z]: readonly [number, number]) => {
      tl.to(slip(b), { autoAlpha: 1, duration: 0.03, ease: E }, a);
      if (full) tl.fromTo(slip(b), { y: 6 }, { y: 0, duration: 0.03, ease: E, immediateRender: false }, a);
      tl.to(slip(b), { autoAlpha: 0, duration: 0.025, ease: E }, z - 0.025);
    };
    speak("boy", T.boy);
    speak("commuter", T.commuter);
    speak("mother", T.mother);
    // the commuter's small laugh: three quick shoulder bobs as his line lands
    if (full) tl.to(bob, { y: -4, duration: 0.012, repeat: 3, yoyo: true, ease: "sine.inOut" }, T.commuter[0] + 0.03);

    // beat 5 (0.81-0.875): silence; the camera has pushed in on the pouch. Beat 6: everyone turns
    tl.to(pax("worker"), { "--dim": 0, duration: 0.01 }, T.worker);
    tl.to(allPax, { "--dim": 0, duration: 0.03, ease: E }, T.wide);
    tl.to(extras, { "--dim": 14, duration: 0.03, ease: E }, T.wide);
    tl.to(front, { autoAlpha: 0, duration: 0.004, stagger: 0.003 }, T.turn);
    tl.to(side, { autoAlpha: 1, duration: 0.004, stagger: 0.003 }, T.turn);
    if (full) tl.fromTo(side, { y: -3 }, { y: 3, duration: 0.04, ease: E, immediateRender: false }, T.turn);
    if (full) tl.fromTo(led, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.03, ease: E, immediateRender: false }, 0.915);
    else tl.to(led, { autoAlpha: 1, duration: 0.03, ease: E }, 0.915);

    // ---- 0.95-1 the doors open, the light floods white -----------------------------------------------
    tl.to(glare, { autoAlpha: 1, duration: 0.012, ease: E }, T.doors - 0.003);
    if (full) {
      tl.to(doorL, { x: -250, duration: 0.04, ease: "power2.inOut" }, T.doors);
      tl.to(doorR, { x: 250, duration: 0.04, ease: "power2.inOut" }, T.doors);
    } else {
      tl.to([doorL, doorR], { autoAlpha: 0, duration: 0.03, ease: E }, T.doors);
    }
    tl.to(led, { autoAlpha: 0, duration: 0.018, ease: E }, T.doorsPan - 0.006);
    tl.to(flood, { autoAlpha: 1, duration: 0.028, ease: E }, T.flood);
  });

  return (
    <div ref={root} className={`relative h-full ${m.root}`} data-live="false" style={metroVars as CSSProperties}>
      <Stage label={narration!.en}>
        {/* exterior: the camera origin is the hero window's centre, so the push lands on the interior aperture */}
        <div data-exterior className="absolute inset-0">
          <Camera origin={ORIGIN}>
            <Art overflow="visible">
              <Skyline low={low} />
              <Viaduct />
              <Road low={low} />
              <g data-train-move>
                <Train low={low} />
              </g>
              <ChimeMarks x={HERO_X} y={344} />
            </Art>
          </Camera>
        </div>

        {/* interior: one track the camera pans and zooms as a unit */}
        <div data-interior className="invisible absolute inset-0">
          <div data-mtrack className="absolute inset-0" style={{ transformOrigin: CAM_ORIGIN }}>
            <Art overflow="visible">
              <InteriorBack low={low} />
              <Extra at={[AT.exiting, IN.feet]} kind="exit" data-pax="extra" />
              <Extra at={[AT.walker, IN.feet]} kind="backpack" data-pax="extra" />
              <FatherSon at={[AT.father, IN.feet]} data-pax="boy" />
              <Commuter at={[AT.commuter, IN.seat]} data-pax="commuter" />
              <Extra at={[AT.woman, IN.feet]} kind="woman" data-pax="extra" />
              <SeatedWorker at={[AT.worker, IN.seat]} data-pax="worker" />
              <MotherSon at={[AT.mother, IN.feet]} data-pax="mother" />
              <InteriorFront />
            </Art>
          </div>
          {/* overheard slips: anchored to the speaker's screen position while the camera holds on them */}
          <SpeechSlip line={boyLine} x={FOCUS_X - 15} y={452} side="right" beat="boy" />
          <SpeechSlip line={commuterLine} x={FOCUS_X - 15} y={520} side="right" beat="commuter" />
          <SpeechSlip line={motherLine} x={FOCUS_X + 38} y={496} side="right" beat="mother" />
          {/* the announcement: the ceiling display's LED strip, real text */}
          <div data-led className={`${m.led} invisible`}>
            <p lang="bn" className="font-sans text-clock font-semibold">
              {announcement!.bn}
            </p>
            <p lang="en" className="mt-0.5 font-sans text-label uppercase">
              {announcement!.en}
            </p>
          </div>
        </div>

        {/* the light outside floods in: sky-coloured, so the next stage arrives sky to sky */}
        <div data-flood className="invisible absolute inset-0" style={{ background: "var(--sky-bottom)" }} />
        <Narration line={narration!} />
      </Stage>
    </div>
  );
}
