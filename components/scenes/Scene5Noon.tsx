"use client";

/*
  Scene 5, 1:00 PM, "ছায়াটাই এখন দামি". The SAME tong, relit white-hot: bleached dust-cream sky, short hard
  shadows, a neighbour's shutter half down and its sign gone dim. Mama fans himself with a tali; a rickshaw
  puller sleeps across his own seat in the shade beside the stall (feet on the handlebar, gamchha over his
  face); a lemon tea sweats on a stool. The ceiling fan above the stall winds down and stops, then the
  overheard cry. Engine: GSAP scrub on the slot (scroll owns time); the breathing, the tali and the heat
  shimmer are CSS loops on their own elements, paused off-screen. This is the stillness scene: one slow
  glide, the fan, the drops, a slip, and the light warming toward gold for Scene 6.
  Reduced motion: camera fixed at 1.06, no loops, no shimmer; the fan is simply shown stopped, the drops sit
  at rest, the slip is an opacity beat.
*/

import { useRef, type CSSProperties } from "react";
import { gsap } from "@/lib/gsap";
import { COPY } from "@/lib/copy";
import { palette, toCssVarObject } from "@/lib/palette";
import { EASE, SCENES, type SceneProps } from "@/lib/scenes";
import { Art, Camera, Narration, SlipAnchor, SpeechSlip, Stage, useLiveGate, useSceneTimeline } from "./scene-kit";
import { Mama } from "./tong/cast";
import type { V2 } from "./tong/geometry";
import { TongBackdrop, TongStall, TongWires, type TongState } from "./tong/TongSet";
import { AsleepPuller, BoothShade, CeilingFan, GroundShade, HeatShimmer, LemonTea, NoonNeighbour, NoonSun, Tali } from "./noon/art";
import "./noon/noon.css";

const { narration, overheard } = COPY[5];
// Stall shutter stays up: "half" would drop the corrugated sheet over Mama's head (the neighbour's shutter carries the idea).
const STATE: TongState = { shutter: "up", bulb: "off", litWindows: [], steam: false, notebook: "closed" };
const MAMA_AT: V2 = [925, 858];
const PULLER_AT: V2 = [642, 860];
const PULLER_S = 0.75;

// The noon set stays white-hot while the global sky already warms toward Scene 6: only these tokens are pinned
// (as Scene 6 does for gold). The accent stays Tong Amber; the light warms by tweening these toward palette[6].
const t5 = toCssVarObject(palette[5]);
const t6 = toCssVarObject(palette[6]);
const PIN = ["--ink", "--accent", "--glow", "--wall", "--tarp"] as const;
const WARM = ["--ink", "--glow", "--wall", "--tarp"] as const;
const PINNED = Object.fromEntries(PIN.map((k) => [k, t5[k]])) as CSSProperties;
const WARMED = Object.fromEntries(WARM.map((k) => [k, t6[k]]));

// Timeline beats, fractions of the trigger range (the stage is pinned from about 0.41)
const FAN_FAST = 0.4; // the rotor spins at a steady pace until here, then winds down
const FAN_STOP = 0.64;
const SLIP_IN = 0.64;
const SLIP_OUT = 0.88;

export default function Scene5Noon({ tier, reducedMotion }: SceneProps) {
  const root = useRef<HTMLDivElement>(null);
  const low = tier === "low";
  const ease = EASE[SCENES[5].ease];
  useLiveGate(root);

  useSceneTimeline(root, 5, (tl, mode, q) => {
    const full = mode === "full";
    const camera = q("[data-camera]");
    const spin = q("[data-fan-spin]");
    const blur = q("[data-fan-blur]");
    const blades = q("[data-fan-blades]");
    const drops = q("[data-drop]");
    const slip = q("[data-slip]");

    gsap.set(slip, { autoAlpha: 0 });
    // GSAP's default SVG origin is the bbox corner; the rotor is drawn around its own (0,0), so pin the pivot to the bbox centre once
    gsap.set(spin, { transformOrigin: "50% 50%" });

    // transition in: the set rises out of the Metro's white (an opacity fade of the whole camera, sky to set)
    gsap.set(camera, { autoAlpha: 0 });
    tl.to(camera, { autoAlpha: 1, duration: 0.12, ease: "power2.out" }, 0);
    if (full) tl.fromTo(camera, { xPercent: 2, yPercent: 0, scale: 1 }, { xPercent: -2.5, yPercent: -1, scale: 1.07, duration: 1, ease }, 0);
    else gsap.set(camera, { scale: 1.06 });

    // the fan: steady spin, then a slow wind-down (power2.out: velocity falls to zero), then dead still
    if (full) {
      tl.fromTo(spin, { rotation: 0 }, { rotation: 1080, duration: FAN_FAST, ease: "none", immediateRender: false }, 0);
      tl.fromTo(spin, { rotation: 1080 }, { rotation: 1410, duration: FAN_STOP - FAN_FAST, ease: "power2.out", immediateRender: false }, FAN_FAST);
      tl.fromTo(blur, { autoAlpha: 0.22 }, { autoAlpha: 0, duration: FAN_STOP - FAN_FAST, ease: "power2.out", immediateRender: false }, FAN_FAST);
      tl.fromTo(blades, { autoAlpha: 0.55 }, { autoAlpha: 1, duration: FAN_STOP - FAN_FAST, ease: "power2.out", immediateRender: false }, FAN_FAST);
    } else {
      gsap.set(blur, { autoAlpha: 0 });
    }

    // the sweat: each drop fades in near the rim, slides down the glass, and is gone at the base
    drops.forEach((el, i) => {
      const from = 0.3 + i * 0.16;
      if (full) {
        tl.fromTo(el, { y: 0, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03, ease: "power2.out", immediateRender: false }, from);
        tl.to(el, { y: 28, duration: 0.3, ease: "power1.inOut" }, from);
        tl.to(el, { autoAlpha: 0, duration: 0.03, ease: "power2.out" }, from + 0.27);
      } else {
        gsap.set(el, { y: 6 + i * 8 });
      }
    });

    // 0.64 the cry, one slip, on screen >= 1 s at the AC-D3 pace (0.24 of 170 svh = 41 svh = 1.4 s)
    tl.to(slip, { autoAlpha: 1, duration: 0.04, ease: "power2.out" }, SLIP_IN);
    if (full) tl.fromTo(slip, { y: 6 }, { y: 0, duration: 0.04, ease: "power2.out", immediateRender: false }, SLIP_IN);
    tl.to(slip, { autoAlpha: 0, duration: 0.04, ease: "power2.out" }, SLIP_OUT);

    // transition out: the light warms from white to gold (token tween on the scene root, colour only)
    if (root.current) tl.to(root.current, { ...WARMED, duration: 0.26, ease: "sine.inOut" }, 0.72);

    // hand-off: the art fades to sky so the next stage reads sky to sky
    tl.to(camera, { autoAlpha: 0, duration: 0.035, ease: "power2.out" }, 0.965);
  });

  return (
    <div ref={root} className="noon relative h-full" data-live="false" style={PINNED}>
      <Stage label={narration!.en}>
        <Camera>
          <Art overflow="visible">
            <NoonSun />
            <TongBackdrop state={STATE} />
            <NoonNeighbour />
            <TongWires low={low} />
            <GroundShade />
            <TongStall state={STATE}>
              <BoothShade />
              <CeilingFan />
              <Mama at={MAMA_AT} flip pose="fan" />
              <Tali mama={MAMA_AT} />
            </TongStall>
            <AsleepPuller at={PULLER_AT} s={PULLER_S} />
            <LemonTea />
            {!low && !reducedMotion ? <HeatShimmer /> : null}
          </Art>
          {/* art-sized layer: the slip is anchored to a window of the block (the unseen voice), in art units */}
          <div className="absolute top-0 h-full" style={{ left: "calc(50% - 800 * var(--u))", width: "calc(1600 * var(--u))", "--nu": "var(--u)" } as CSSProperties}>
            {/* SlipAnchor rebinds --u to its unit: pass it through --nu, or `--u: var(--u)` is a cycle and the slip loses its position */}
            <SlipAnchor x={900} unit="var(--nu)">
              <SpeechSlip line={overheard[0]} x={800} y={296} side="left" beat="power" />
            </SlipAnchor>
          </div>
        </Camera>
        <Narration line={narration!} />
      </Stage>
    </div>
  );
}
