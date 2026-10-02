"use client";

/*
  Scene 8, 11:45 PM, "ঘুমায় শহর". The same tong at night, closing: the shutter half down, one bulb, a stray
  dog asleep by the drain, one window lit, the neighbour's sign dark. Mama counts the day's coins into a
  tin, closes the red notebook, pulls the shutter down, then rings home ("হ্যাঁ, খাইছি। তুমি খাইছো?"). The
  bulb goes off; the phone is the last light; the camera pulls slowly back over the sleeping skyline until
  the phone sits at the centre of the screen, the world dims, and a circle of light shrinks to the 14px
  dot (LIGHT_DOT) the site opened on. Then the credit, "কাল আবার।" and a real restart button.
  Mama stands in front of the shutter (clipped at the counter top, so it reads as behind the counter);
  the shutter is TongStall's own, so the counter, notebook and tin stay in front of it.
  Fractions of the 190svh trigger range (the stage is still sliding in until about 0.37, so the story
  beats wait for it; the end state is held to the bottom of the page):
    0.12-0.36  narration (the default window)      0.32-0.43  the coins go into the tin, the lid
    0.44-0.50  Mama turns, the notebook closes     0.50-0.58  the shutter comes down
    0.575-0.76 the call: phone glow, the slip      0.74-0.78  bulb off, then the window
    0.74-0.92  the pull-back (phone -> centre)     0.80-0.90  the world dims
    0.84-0.94  the circle shrinks to the dot       0.885-0.975 credit, closing line, button
  Engine: GSAP scrub on the slot. Nothing is driven from onUpdate (a ScrollTrigger refresh swallows those
  events); every state is a tween on the timeline, so a refresh re-renders it. Reduced motion: camera fixed,
  no travel; every beat is an opacity beat on final positions (shutter already down); the dot, credit,
  closing line and button all appear.
*/

import { useId, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { COPY, CREDIT_LINKS, CREDIT_NAME } from "@/lib/copy";
import { EASE, SCENES, lightDotStyle, type SceneProps } from "@/lib/scenes";
import { scrollToScene } from "@/lib/scroll";
import { Art, Camera, Narration, SpeechSlip, Stage, useLiveGate, useSceneTimeline } from "./scene-kit";
import { Dog, Mama, mamaHand } from "./tong/cast";
import { TONG_ORIGIN, type V2 } from "./tong/geometry";
import { TongBackdrop, TongBench, TongStall, TongWires, type TongState } from "./tong/TongSet";
import { COIN_PILE, FrontBulb, LampLight, PhoneGlow, SleepingSkyline, TIN_AT, TinAndCoins } from "./closing/art";
import "./closing/closing.css";

const { narration, overheard } = COPY[8];
const { credit, closing, restart } = COPY[8].extra!;
const STATE: TongState = { shutter: "half", bulb: "off", litWindows: [1], steam: false, signLit: false, notebook: "open" };
const MAMA_AT: V2 = [925, 858];
const [HAND_X, HAND_Y] = mamaHand("phone");
const PHONE_AT: V2 = [MAMA_AT[0] - HAND_X, MAMA_AT[1] + HAND_Y]; // Mama faces left (flip), so the hand's x is mirrored
const END_SCALE = 0.5; // how far the camera pulls back
const HALO_FROM = [8, 14] as const; // the two discs of the shrinking circle start this many dots wide
const [LEAD] = credit.en.split(CREDIT_NAME);

/**
 * Where the camera must translate (px) so that, at `scale`, the phone lands on the stage centre. Pure
 * geometry of the 1600x900 xMidYMax slice (`--u`) and TONG_ORIGIN, the camera's transform origin. Measured
 * when the tween first renders and again on every ScrollTrigger refresh (invalidateOnRefresh).
 */
function phoneToCentre(stage: Element, scale: number) {
  const { width: W, height: H } = stage.getBoundingClientRect();
  const u = Math.max(W / 1600, H / 900);
  const ox = W / 2 + (TONG_ORIGIN.x - 800) * u;
  const oy = H - (900 - TONG_ORIGIN.y) * u;
  const px = W / 2 + (PHONE_AT[0] - 800) * u;
  const py = H - (900 - PHONE_AT[1]) * u;
  return { x: W / 2 - ox - scale * (px - ox), y: H / 2 - oy - scale * (py - oy) };
}

export default function Scene8Closing({ tier }: SceneProps) {
  const root = useRef<HTMLDivElement>(null);
  const clip = useId();
  const low = tier === "low";
  const coinCount = low ? 4 : COIN_PILE.length;
  const ease = EASE[SCENES[8].ease];
  useLiveGate(root);

  useSceneTimeline(root, 8, (tl, mode, q) => {
    const full = mode === "full";
    const $ = (sel: string) => q(sel);
    const E = "power2.out";
    const [camera, stage] = [$("[data-camera]"), $(".stage")];
    const [mamaCount, mamaWrite, mamaShutter, mamaPhone] = ["count", "write", "shutter", "phone"].map((p) => $(`[data-mama="${p}"]`));
    const [coins, tinFill, lid, pages, shutter, lamp, phoneGlow, win, slip] = ["[data-coin]", "[data-tin-fill]", "[data-lid]", "[data-notebook-pages]", "[data-shutter]", "[data-lamp]", "[data-phone-glow]", '[data-window="1"]', "[data-slip]"].map($);
    const [dot, halos, credit, line, again] = ["[data-dot]", "[data-dot-halo]", "[data-credit]", "[data-closing]", "[data-restart]"].map($);

    // ---- the starting night; mm.revert() restores the markup ----------------------------------------
    gsap.set([mamaWrite, mamaShutter, mamaPhone, phoneGlow, slip, lid, dot, halos, credit, line, again], { autoAlpha: 0 });
    gsap.set(tinFill, { opacity: 0 });
    gsap.set(pages, { transformOrigin: "0% 50%" }); // set once and never changed: a moving origin drifts when scrubbed back and forth
    if (!full) gsap.set(shutter, { y: 0 }); // reduced motion: the shutter is simply down

    // ---- one glide toward the tong, then (full motion) the pull-back that ends with the phone centred ---
    if (full) {
      tl.fromTo(camera, { xPercent: 3, yPercent: 0, x: 0, y: 0, scale: 1 }, { xPercent: 0, scale: 1.14, duration: 0.74, ease }, 0);
      tl.fromTo(
        camera,
        { x: 0, y: 0, scale: 1.14 },
        { x: () => phoneToCentre(stage[0], END_SCALE).x, y: () => phoneToCentre(stage[0], END_SCALE).y, scale: END_SCALE, duration: 0.18, ease, immediateRender: false },
        0.74,
      );
    } else gsap.set(camera, { scale: 1.06 });

    // ---- 0.32-0.43 the day's coins into the tin, one at a time; the lid ------------------------------------
    if (full) {
      tl.to(mamaCount, { y: -2, duration: 0.012, repeat: 7, yoyo: true, ease: "sine.inOut" }, 0.32);
      coins.forEach((c, i) => {
        const at = COIN_PILE[i];
        const t = 0.32 + i * 0.016;
        const d = 0.026;
        tl.to(c, { x: TIN_AT[0] - at[0], duration: d, ease: "none" }, t);
        tl.to(c, { y: -24, duration: d / 2, ease: E }, t);
        // gravity, not an enter/exit: the second half of the hop falls
        tl.to(c, { y: TIN_AT[1] - 1 - at[1], duration: d / 2, ease: "power2.in" }, t + d / 2);
        tl.to(c, { autoAlpha: 0, duration: 0.002 }, t + d);
        tl.to(tinFill, { opacity: (0.85 * (i + 1)) / coins.length, duration: 0.01, ease: E }, t + d);
      });
      tl.fromTo(lid, { y: -18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.02, ease: E, immediateRender: false }, 0.425);
    } else {
      tl.to(coins, { autoAlpha: 0, duration: 0.04, ease: E }, 0.34);
      tl.to(tinFill, { opacity: 0.85, duration: 0.04, ease: E }, 0.34);
      tl.to(lid, { autoAlpha: 1, duration: 0.04, ease: E }, 0.4);
    }

    // ---- 0.44-0.50 he turns to the notebook; the page folds shut ------------------------------------------
    tl.to(mamaCount, { autoAlpha: 0, duration: 0.005 }, 0.44);
    tl.to(mamaWrite, { autoAlpha: 1, duration: 0.005 }, 0.44);
    tl.to(pages, { ...(full && { scaleX: 0.08 }), autoAlpha: 0, duration: 0.04, ease: E }, 0.46);
    tl.to(mamaWrite, { autoAlpha: 0, duration: 0.005 }, 0.5);
    tl.to(mamaShutter, { autoAlpha: 1, duration: 0.005 }, 0.5);

    // ---- 0.50-0.58 the shutter, pulled down in two stages (the reverse of Scene 1's rattle up) ----------
    if (full) {
      tl.fromTo(shutter, { y: -120 }, { y: -56, duration: 0.035, ease: E, immediateRender: false }, 0.51);
      tl.to(shutter, { y: 0, duration: 0.04, ease: E }, 0.55);
    }

    // ---- 0.575-0.76 the call: the phone is lit, the line is spoken -----------------------------------------
    tl.to(mamaShutter, { autoAlpha: 0, duration: 0.005 }, 0.575);
    tl.to(mamaPhone, { autoAlpha: 1, duration: 0.005 }, 0.575);
    tl.to(phoneGlow, { autoAlpha: 1, duration: 0.03, ease: E }, 0.585);
    tl.to(slip, { autoAlpha: 1, duration: 0.025, ease: E }, 0.59);
    if (full) tl.fromTo(slip, { y: 6 }, { y: 0, duration: 0.025, ease: E, immediateRender: false }, 0.59);
    tl.to(slip, { autoAlpha: 0, duration: 0.025, ease: E }, 0.735);

    // ---- 0.74-0.78 the bulb goes off, then the window: the phone is the last light ----------------------------
    tl.to(lamp, { autoAlpha: 0, duration: 0.02, ease: E }, 0.74);
    tl.to(win, { autoAlpha: 0, duration: 0.02, ease: E }, 0.775);

    // ---- 0.80-0.94 the world dims; a circle of light shrinks to the 14px dot ---------------------------------
    tl.to(camera, { opacity: 0.2, duration: 0.1, ease: E }, 0.8);
    tl.to(dot, { autoAlpha: 1, duration: 0.02, ease: E }, 0.84);
    halos.forEach((h, i) => {
      tl.fromTo(h, { autoAlpha: 0, ...(full && { scale: HALO_FROM[i] }) }, { autoAlpha: 1, duration: 0.02, ease: E, immediateRender: false }, 0.84);
      if (full) tl.to(h, { scale: 1, duration: 0.1, ease }, 0.84);
      tl.to(h, { autoAlpha: 0, duration: 0.02, ease: E }, 0.935);
    });

    // ---- 0.885-0.975 the credit, the closing line, the restart button; held to the bottom of the page ----
    const rise = (t: Element[], at: number) => {
      tl.to(t, { autoAlpha: 1, duration: 0.03, ease: E }, at);
      if (full) tl.fromTo(t, { y: 12 }, { y: 0, duration: 0.03, ease: E, immediateRender: false }, at);
    };
    rise(credit, 0.885);
    rise(line, 0.915);
    rise(again, 0.945);
  });

  return (
    <div ref={root} className="closing relative h-full" data-live="false">
      <Stage label={narration!.en}>
        <Camera>
          <Art overflow="visible">
            <defs>
              <clipPath id={clip}>
                <rect x="-400" y="0" width="2400" height="726" />
              </clipPath>
            </defs>
            <SleepingSkyline low={low} />
            <TongBackdrop state={STATE} />
            <TongWires low={low} />
            <TongStall state={STATE} />
            <TongBench />
            <LampLight low={low} />
            <FrontBulb />
            {/* Mama in front of the shutter, clipped at the counter top so he reads as standing behind the counter */}
            <g clipPath={`url(#${clip})`}>
              <g data-mama="count">
                <Mama at={MAMA_AT} pose="count" />
              </g>
              <g data-mama="write">
                <Mama at={MAMA_AT} flip pose="write" />
              </g>
              <g data-mama="shutter">
                <Mama at={MAMA_AT} flip pose="shutter" />
              </g>
              <g data-mama="phone">
                <Mama at={MAMA_AT} flip pose="phone" />
              </g>
            </g>
            <TinAndCoins coins={coinCount} />
            <Dog at={[950, 874]} s={0.9} pose="asleep" />
            <PhoneGlow at={PHONE_AT} low={low} />
          </Art>
          <SpeechSlip line={overheard[0]} x={932} y={486} side="left" beat="mama" />
        </Camera>

        {/* the loop: the circle of light shrinks onto the dot the site opened on (same centre, same size) */}
        {HALO_FROM.map((_, i) => (
          <span key={i} data-dot-halo aria-hidden="true" className={`rounded-full ${i ? "bg-glow/10" : "bg-glow/20"}`} style={lightDotStyle} />
        ))}
        <span data-dot aria-hidden="true" className="rounded-full bg-glow" style={lightDotStyle} />

        <Narration line={narration!} />

        {/* the credit: a printed caption in a hairline frame, in the narration's band */}
        <div data-credit className="absolute inset-x-(--gutter) top-[12svh] max-w-[34rem]">
          <div className="credit-frame">
            <p lang="en" className="text-label uppercase text-copy-muted">{LEAD.trim()}</p>
            <p lang="en" className="mt-1 font-sans text-clock font-semibold text-copy">{CREDIT_NAME}</p>
            {CREDIT_LINKS.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                {CREDIT_LINKS.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} target="_blank" rel="noopener noreferrer" lang="en" className="credit-link font-sans text-sub text-copy">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        {/* below the dot: the closing line, then the way back to the start */}
        <div className="absolute inset-x-0 top-[calc(50%+3.25rem)] flex flex-col items-center gap-5 px-(--gutter) text-center" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
          <p data-closing>
            <span lang="bn" className="block font-chunky text-line font-semibold text-balance text-copy">{closing.bn}</span>
            <span lang="en" className="mt-1 block font-sans text-sub text-copy-muted">{closing.en}</span>
          </p>
          <div data-restart>
            <button type="button" onClick={() => scrollToScene(0)} className="restart">
              <span lang="bn" className="font-sans text-sub font-semibold">{restart.bn}</span>
              <span lang="en" className="flex items-center gap-2 font-sans text-label uppercase">
                <svg aria-hidden="true" focusable="false" viewBox="0 0 14 14" className="restart-arrow" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 12V2M3 6l4-4 4 4" />
                </svg>
                {restart.en}
              </span>
            </button>
          </div>
        </div>
      </Stage>
    </div>
  );
}
