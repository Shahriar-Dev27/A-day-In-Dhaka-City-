"use client";

/*
  Scene 7, 7:30 PM. The same tong, relit for the evening (bulb, tube light, fairy lights, lit signboards,
  a glowing tarp), now with a fuchka cart, a jhalmuri man, office-goers in lanyards with cha and biscuit,
  a mosquito cloud at the bulb and the second jam crawling home along the foreground road.
  The beat: the garment worker from the morning returns and puts a Tk 10 note on the counter; Mama says
  "কাটলাম।" and the red notebook's line is struck through in a magnified inset of the open page (the close
  detail is the end of the same composition, no cross-fade).
  Fractions of the 170svh trigger range (the stage is still sliding in until about 0.41, so the lights
  come on top-down as the set rises into view, and the story beats wait for the pinned stage):
    0.10-0.36  the lights, one trigger each (windows, signs, fairy lights, tube, cart lamp, jar, bulb,
               booth, tarp, mosquitoes, a short one-shot neon flicker)
    0.22-0.40  the worker walks in; 0.41-0.50 the note drops and is pushed across the counter
    0.41-0.585 worker slip, 0.595-0.77 Mama slip, 0.765-0.87 the notebook inset opens and the line is struck
  Engine: GSAP scrub on the slot. Mosquitoes are CSS loops on their own elements (paused off-screen). High
  tier: the light-trail shader (one WebGL context, mounted only while the slot is on screen, disposed by
  R3F on unmount) smears headlights over the wet road; low tier and reduced motion get SVG streaks.
  Reduced motion: camera fixed, no travel, every beat an opacity beat on final positions, no WebGL.
*/

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "@/lib/gsap";
import { COPY } from "@/lib/copy";
import { EASE, SCENES, type SceneProps } from "@/lib/scenes";
import { Art, Camera, Narration, SpeechSlip, Stage, useLiveGate, useSceneTimeline } from "./scene-kit";
import { GarmentWorker, Mama, OfficeGoer, Vendor } from "./tong/cast";
import type { V2 } from "./tong/geometry";
import { TongBackdrop, TongStall, TongWires, type TongState } from "./tong/TongSet";
import { BoothLight, FairyLights, FuchkaCart, FuchkaVendor, HomewardJam, Mosquitoes, NeonCup, NotebookInset, Streaks, TarpGlow, TubeLight, WetRoad } from "./adda/art";
import "./adda/adda.css";

const LightTrails = dynamic(() => import("./LightTrails"), { ssr: false });

const { narration, overheard } = COPY[7];
const STATE: TongState = { shutter: "up", bulb: "on", litWindows: [0, 4, 6, 7, 9, 11, 13, 14], steam: true, signLit: true, notebook: "open" };
const MAMA_AT: V2 = [925, 858];
const WORKER_AT: V2 = [836, 868];
const BULB: V2 = [880, 512];

export default function Scene7Adda({ tier, reducedMotion }: SceneProps) {
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const low = tier === "low";
  const [near, setNear] = useState(false);
  const ease = EASE[SCENES[7].ease];
  useLiveGate(root);

  // WebGL only on the high tier, only while the slot is on screen; R3F disposes the context on unmount.
  useEffect(() => {
    const slot = root.current?.parentElement;
    if (!slot || low || reducedMotion) return;
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting));
    io.observe(slot);
    return () => io.disconnect();
  }, [low, reducedMotion]);

  useSceneTimeline(root, 7, (tl, mode, q) => {
    const full = mode === "full";
    const $ = (sel: string) => q(sel);
    const to = (t: Element[], vars: gsap.TweenVars, at: number) => (t.length ? tl.to(t, vars, at) : null);
    const E = "power2.out";

    tl.eventCallback("onUpdate", () => { progress.current = tl.progress(); });

    const camera = $("[data-camera]");
    const tube = $('[data-light="tube"]');
    const tarp = $('[data-light="tarp"]');
    const cartLamp = $('[data-light="cart"]');
    const jar = $('[data-light="jar"]');
    const booth = $('[data-light="booth"]');
    const fairy = $("[data-fairy]");
    const wins = $("[data-window]").filter((w) => w.getAttribute("opacity") !== "0");
    const signs = $("[data-sign]");
    const [halo, bulb, mosq, neon] = ["[data-halo]", "[data-bulb]", "[data-mosq]", "[data-neon]"].map($);
    const beams = $("[data-beam]");
    const vehicles = $("[data-veh]");
    const gl = $("[data-gl]");
    const streaks = $("[data-trail]");
    const [walk, hold] = [$("[data-worker-walk]"), $("[data-worker-hold]")];
    const note = $("[data-worker-hold] [data-note]");
    const [mamaStand, mamaWrite] = [$('[data-mama="stand"]'), $('[data-mama="write"]')];
    const [slipW, slipM] = [$('[data-slip="worker"]'), $('[data-slip="mama"]')];
    const inset = $("[data-inset]");
    const strike = $("[data-strike]");

    // ---- evening begins unlit; every light is its own opacity trigger -----------------------------
    gsap.set([tube, tarp, cartLamp, jar, booth, fairy, wins, halo, bulb, mosq, neon, beams, hold, mamaWrite, slipW, slipM, inset, strike, gl], { autoAlpha: 0 });
    gsap.set(signs, { opacity: 0.3 });
    gsap.set(inset, { transformOrigin: "100% 100%" });
    if (full) {
      gsap.set(walk, { x: -760 });
      gsap.set(strike, { scaleX: 0, transformOrigin: "0% 50%" });
    } else gsap.set(walk, { autoAlpha: 0 });

    // one glide: toward the tong and down to the street, ending framed on the counter and the road
    if (full) tl.fromTo(camera, { xPercent: 3, yPercent: 0, scale: 1 }, { xPercent: -4, yPercent: -9, scale: 1.14, duration: 1, ease }, 0);
    else gsap.set(camera, { scale: 1.06, yPercent: -6 });

    // ---- 0.10-0.36 the lights, one trigger each (top of the set first: the stage is still rising) --------
    to(wins, { autoAlpha: 0.95, duration: 0.03, ease: E, stagger: 0.014 }, 0.1);
    to(signs, { opacity: 1, duration: 0.04, ease: E }, 0.17);
    to(fairy, { autoAlpha: 1, duration: 0.02, ease: E, stagger: 0.006 }, 0.18);
    to(tube, { autoAlpha: 1, duration: 0.03, ease: E }, 0.26);
    to(cartLamp, { autoAlpha: 1, duration: 0.03, ease: E }, 0.27);
    to(beams, { autoAlpha: 1, duration: 0.05, ease: E, stagger: 0.015 }, 0.28);
    to([...halo, ...bulb], { autoAlpha: 1, duration: 0.03, ease: E }, 0.3);
    to(booth, { autoAlpha: 1, duration: 0.04, ease: E }, 0.3);
    to(jar, { autoAlpha: 1, duration: 0.03, ease: E }, 0.32);
    to(tarp, { autoAlpha: 1, duration: 0.04, ease: E }, 0.33);
    to(mosq, { autoAlpha: 1, duration: 0.04, ease: E }, 0.34);
    // a short neon flicker: on, stutter, on (scrubbed keyframes, not a loop)
    if (neon.length) {
      tl.to(neon, { autoAlpha: 1, duration: 0.006, ease: "none" }, 0.36);
      tl.to(neon, { autoAlpha: 0.2, duration: 0.005, ease: "none" }, 0.366);
      tl.to(neon, { autoAlpha: 1, duration: 0.005, ease: "none" }, 0.372);
      tl.to(neon, { autoAlpha: 0.45, duration: 0.005, ease: "none" }, 0.379);
      tl.to(neon, { autoAlpha: 1, duration: 0.006, ease: "none" }, 0.385);
    }
    to(gl, { autoAlpha: 1, duration: 0.05, ease: E }, 0.3);
    if (!full) to(streaks, { autoAlpha: 0.7, duration: 0.05, ease: E }, 0.3);

    // the homeward jam crawls (one pace per lane), bokeh smear of streaks on the low tier
    if (full) {
      vehicles.forEach((v, i) => tl.fromTo(v, { x: 0 }, { x: 80 + (i % 3) * 55, duration: 1, ease: "none" }, 0));
      if (low) streaks.forEach((s, i) => tl.fromTo(s, { scaleX: 0.1, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 0.8, transformOrigin: "0% 50%", duration: 0.4, ease }, 0.3 + i * 0.07));
    }

    // ---- the worker returns; the note ---------------------------------------------------------------
    if (full) {
      tl.to(walk, { x: 0, duration: 0.18, ease: "power1.out" }, 0.22);
      tl.to(walk, { y: -4, duration: 0.025, repeat: 6, yoyo: true, ease: "sine.inOut" }, 0.22);
      tl.to(walk, { autoAlpha: 0, duration: 0.01 }, 0.4);
      tl.to(hold, { autoAlpha: 1, duration: 0.01 }, 0.4);
      tl.to(note, { y: 86, duration: 0.04, ease: E }, 0.41);
      tl.to(note, { x: 14, duration: 0.05, ease: E }, 0.45);
    } else {
      gsap.set(note, { x: 14, y: 86 });
      tl.to(hold, { autoAlpha: 1, duration: 0.05, ease: E }, 0.4);
    }

    // ---- 0.41-0.77 the exchange, one slip at a time (each >= 0.175 of the range = 1 s at 29.5 svh/s) ----
    tl.to(slipW, { autoAlpha: 1, duration: 0.025, ease: E }, 0.41);
    if (full) tl.fromTo(slipW, { y: 6 }, { y: 0, duration: 0.025, ease: E, immediateRender: false }, 0.41);
    tl.to(slipW, { autoAlpha: 0, duration: 0.025, ease: E }, 0.56);
    tl.to(slipM, { autoAlpha: 1, duration: 0.025, ease: E }, 0.595);
    if (full) tl.fromTo(slipM, { y: 6 }, { y: 0, duration: 0.025, ease: E, immediateRender: false }, 0.595);
    tl.to(slipM, { autoAlpha: 0, duration: 0.025, ease: E }, 0.745);

    // ---- 0.76-0.87 Mama bends to the notebook; the page opens in an inset; the line is struck -----------
    tl.to(mamaStand, { autoAlpha: 0, duration: 0.01 }, 0.75);
    tl.to(mamaWrite, { autoAlpha: 1, duration: 0.01 }, 0.75);
    if (full) tl.fromTo(inset, { scale: 0.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.06, ease: "power3.out", immediateRender: false }, 0.765);
    else tl.to(inset, { autoAlpha: 1, duration: 0.05, ease: E }, 0.765);
    if (full) tl.to(strike, { autoAlpha: 1, scaleX: 1, duration: 0.07, ease: "power1.out" }, 0.82);
    else tl.to(strike, { autoAlpha: 1, duration: 0.05, ease: E }, 0.82);

    // hand-off: the art fades to sky so the next stage reads sky to sky
    tl.to(camera, { autoAlpha: 0, duration: 0.035, ease: E }, 0.965);
    if (gl.length) tl.to(gl, { autoAlpha: 0, duration: 0.03, ease: E }, 0.96);
  });

  return (
    <div ref={root} className="adda relative h-full" data-live="false">
      <Stage label={narration!.en}>
        <Camera>
          <Art overflow="visible">
            <TongBackdrop state={STATE} />
            <TongWires low={low} />
            <NeonCup x={1296} y={566} />
            <FuchkaVendor x={652} y={864} />
            <TongStall state={STATE}>
              <BoothLight />
              <g data-mama="stand">
                <Mama at={MAMA_AT} flip pose="stand" />
              </g>
              <g data-mama="write">
                <Mama at={MAMA_AT} flip pose="write" />
              </g>
            </TongStall>
            <FuchkaCart x={596} y={864} s={0.86} />
            <TubeLight x={742} y={496} w={86} />
            <TarpGlow />
            <FairyLights low={low} />
            <Mosquitoes cx={BULB[0]} cy={BULB[1]} />
            <OfficeGoer at={[742, 868]} pose="sip" flip />
            <OfficeGoer at={[790, 868]} pose="biscuit" woman flip />
            <OfficeGoer at={[1062, 868]} pose="sip" flip />
            <Vendor kind="jhalmuri" at={[1176, 868]} flip />
            <g data-worker-walk>
              <GarmentWorker at={WORKER_AT} pose="walk" />
            </g>
            <g data-worker-hold>
              <GarmentWorker at={WORKER_AT} pose="hold-note" />
            </g>
            <NotebookInset />
            <WetRoad />
            <HomewardJam low={low} />
            {low || reducedMotion ? <Streaks /> : null}
          </Art>
          <SpeechSlip line={overheard[0]} x={756} y={470} side="right" beat="worker" />
          <SpeechSlip line={overheard[1]} x={950} y={470} side="left" beat="mama" />
        </Camera>
        {/* headlights smear across the wet road: high tier only, one context, only while the slot is near */}
        <div data-gl className="pointer-events-none absolute inset-x-0 bottom-0 h-[13svh]">{near && !low && !reducedMotion ? <LightTrails progress={progress} /> : null}</div>
        <Narration line={narration!} />
      </Stage>
    </div>
  );
}
