# 01 — Plan: A Day in Dhaka

Sources of truth: `A-Day-in-Dhaka-PLAN.md` (PLAN) and `SCRIPT.md` (SCRIPT). Where this file and those disagree, those win. Scope, stack and the scene list are fixed. Changing any of them needs the user's approval (PLAN header + §2).

Repo state on 2026-10-01: two markdown files. No code, no `package.json`, **not a git repo**.

---

## 1. Requirements

### 1.1 What is being built
- A single-route Next.js (App Router, TS strict) site. One vertical scroll covers 8 scenes (0–7) from the loader to 11:45 PM.
- Each scene has one emotion, layered illustration (bg/mid/fg/characters), scroll-scrubbed motion, bilingual text (Bangla main, English subtitle, each line under 8 words) and optional sound.
- Persistent UI: a clock/sun arc in the corner (ClockProgress), an audio toggle, and one continuous sky gradient that never jumps.
- Recurring motifs: the circle of light (Scenes 0 and 7, closing the loop), the rickshaw (3, 4, 7) and the bell sound.
- End: credits (Shahriar Islam Dip, portfolio link, social links) and a "Scroll up to start again" button that returns to the top.
- Hosting: Vercel, static. Stretch goal ("Your Dhaka" message) is post-launch only. **Out of scope.**

### 1.2 No backend
- There is no API, DB, auth, user data, CMS or form. Every asset is static under `/public`.
- **backend-developer has no Phase 2 work.** It writes a one-line `02b-backend.md`: "N/A — static site, no server/API/DB per PLAN §2–3."
- security-auth gets a narrow scope: security headers/CSP in `next.config`, no secrets in the client, third-party links in credits use `rel="noopener noreferrer"`, and the asset licence log is complete (PLAN §7, copyright risk).

### 1.3 Who does which PLAN phase
| PLAN phase | Nature | Owner |
|---|---|---|
| 1 Story & design | Human creative work: moodboard, fonts, storyboard sketches, palette approval | **User**. Agents can draft only `lib/palette.ts` values and copy the storyboard into `/docs` |
| 2 Asset production | Human illustration + audio sourcing | **User**. Agents can optimise exports (SVGO, WebP) and keep `/docs/assets.md` |
| 3 Skeleton | Code | frontend-designer |
| 4 Scenes | Code + integrating art | frontend-designer (one scoped task per scene) |
| 5 Polish/perf | Code + device testing | frontend-designer; QA by qa-bug-hunter; real Android testing by **user** |
| 6 Launch/case study | Deploy, reel, writing | **User** (domain, reel, portfolio). Agents can draft `docs/case-study.md` |

### 1.4 Scene requirements (from SCRIPT)
| # | Clock | Scroll budget | Pinned? | Unique motion moment | Tech | Complexity |
|---|---|---|---|---|---|---|
| 0 | — (loader) | 100vh | no | Light circle scales with real load progress and expands into the title | SVG/CSS + GSAP | M |
| 1 | 04:45 | 150vh | stage sticky | Fog parallax (lowest layer fastest), sky shift, stars fade, windows light in sequence. Optional water ripple shader | SVG + GSAP; R3F optional (water) | M |
| 2 | 07:00 | 150vh | **pinned horizontal pan** | Lane pans left→right, steam particles react to velocity, paratha flip on center | SVG + GSAP; steam = DOM/SVG or canvas2D | M–H |
| 3 | 09:00 | **~400vh** | **pinned horizontal** | Per-layer speeds, giant Bangla words occluded by rickshaws, wheel spin from velocity, "traffic jam" beat | SVG + GSAP | **H (hero, own scope)** |
| 4 | 13:00 | 150vh (slow) | stage sticky | Sun arc; shadows rotate and lengthen; heat shimmer; sweat drop | SVG + GSAP; shimmer via SVG `feTurbulence`/`feDisplacementMap` (R3F not allowed here, see §7 R4) | M |
| 5 | 16:30 | 150vh | stage sticky | Kites drift, a string cut with a falling kite, **pigeon swarm reacting to scroll direction**, camera rise | SVG + GSAP; swarm = canvas2D | **H (own scope)** |
| 6 | 19:30 | 150vh | stage sticky | Lights switch on one trigger each, neon flicker, **light-trail shader from velocity**, bokeh | SVG + GSAP + R3F shader | **H (own scope)** |
| 7 | 23:45 | 150vh | stage sticky | Slow zoom out, lamp shrinks to a dot (= Scene 0 circle), credits, restart button | SVG + GSAP | M |

Total is about 1,400vh, which matches SCRIPT's 12–14 screens. Scroll lengths are tunable constants (§4.4), not hardcoded.

Global motion rules: calm scenes (1, 4, 7) use slow-in slow-out easing. Energetic scenes (3, 6) use snappy easing. Story motion is ScrollTrigger scrub only, with no timers. Ambient loops (steam, wire sway, lantern flicker, paratha flip, neon flicker settle) are exempt from scrub because SCRIPT asks for them to loop. They must pause when their scene is offscreen.

---

## 2. Components & Owners

`FD` = frontend-designer, `BD` = backend-developer, `SA` = security-auth, `U` = user, `S` = shared/orchestrator.

### `/app`
| File | Purpose | Owner |
|---|---|---|
| `app/layout.tsx` | `<html lang="en">`, next/font loading (3 faces, §7 Q2), metadata/OG/favicon (Phase 5), palette CSS vars default (Scene 0 values) on `:root` | FD |
| `app/page.tsx` | Server component that only renders `<Experience />` | FD |
| `app/globals.css` | Tailwind import, `--sky-*`/token CSS vars, `overflow-x: clip` (not `hidden`, which breaks sticky), reduced-motion base | FD |
| `app/not-found.tsx` | On-brand 404 (Scene 7 palette, lamp-dot motif, link home) | FD |
| `app/error.tsx` + `app/global-error.tsx` | On-brand generic error with a retry button. `global-error` carries its own `<html><body>` | FD |
| `next.config.ts` | Security headers, image config | SA (headers), FD (rest) |

### `/components`
| File | Purpose | Owner |
|---|---|---|
| `Experience.tsx` (client) | Init Lenis + ticker sync, render 8 `SceneSlot`s, the global sky timeline, the active-scene tracker, the loader gate, and the dev jump links | FD |
| `SceneSlot` (inside `Experience.tsx`, not a separate file) | `<section id="scene-N" data-scene=N style={{height: scrollLength vh}}>` that reserves height so lazy scenes cause no layout shift | FD |
| `Loader.tsx` | Real preload progress (fonts + Scene 0/1 assets), drives the Scene 0 circle, calls `onComplete` | FD |
| `ClockProgress.tsx` | Fixed corner sun/clock arc. Driven by the global progress via refs/quickSetter, **not React state per frame** | FD |
| `AudioToggle.tsx` | `<button aria-pressed>`, muted by default. Gated on decision §7 Q2 | FD |
| `scenes/Scene0Intro.tsx` … `Scene7Midnight.tsx` | One file per scene, built against the §4.3 contract | FD |
| `scenes/Scene3Rush.tsx` | **Own task.** Pinned horizontal, ~400vh, jam beat, velocity wheels, type occlusion | FD |
| `scenes/Scene5GoldenHour.tsx` (+ `scenes/PigeonSwarm.tsx`) | **Own task.** Canvas2D swarm. Use a split file only if the scene file grows past about 250 lines | FD |
| `scenes/Scene6Neon.tsx` (+ `scenes/LightTrails.tsx`) | **Own task.** R3F canvas, mounted only near the viewport, with a low-tier fallback | FD |
| `shaders/lightTrail.ts` | GLSL strings (vertex/fragment) for Scene 6 | FD |
| `shaders/water.ts` | Optional Scene 1 ripple. **Skip unless time allows** (SCRIPT says "Optional") | FD |
| `shaders/fog.ts` | Only if SVG/WebP fog layers fail the visual bar. Default is layered WebP/SVG fog with GSAP parallax (SCRIPT describes layers) | FD |

### `/lib`
| File | Purpose | Owner |
|---|---|---|
| `lib/gsap.ts` | Register ScrollTrigger (+ useGSAP). Export `gsap`, `ScrollTrigger`, `MOTION_QUERIES` | FD |
| `lib/scroll.ts` | Lenis singleton + ScrollTrigger sync, `scrollToScene`, `getScrollVelocity`, `refreshScroll` | FD |
| `lib/palette.ts` | Per-scene tokens + CSS var map (§4.1) | FD drafts, **U approves** (Checkpoint 1) |
| `lib/scenes.ts` | Scene metadata registry (§4.4). Small addition to the PLAN tree. It is required so that Experience, ClockProgress and audio share one source of clock times and scroll lengths | FD |
| `lib/device.ts` | `getDeviceTier()` for the PLAN §5/§7 "disable shaders on low-end". Small addition to the PLAN tree | FD |
| `lib/audio.ts` | Howler wrapper, per-scene loops, crossfade, intensity. **Only if sound ships at launch** (§7 Q2) | FD |

### `/public` and `/docs`
| Path | Content | Owner |
|---|---|---|
| `public/svg/scene-N/*.svg` | Layered art per scene (`bg`, `mid`, `fg`, `chars`) | U produces, FD optimises (SVGO) |
| `public/textures/*.webp` | Grain, fog, haze textures | U / FD |
| `public/audio/scene-N.(webm\|mp3)` | Loops, each under 300 KB | U |
| `public/fonts/` | Only if the chosen fonts are not on Google Fonts. Otherwise use `next/font/google` | U picks, FD wires |
| `docs/storyboard/SCRIPT.md` | Move of the root `SCRIPT.md` (SCRIPT says so). **Ask the user before moving** | S |
| `docs/assets.md` | Asset/licence log: name, source, licence, URL, scene | U + FD |
| `docs/case-study.md` | Phase 6 | U (FD may draft) |

---

## 3. Dependency Graph

```
[U] Checkpoint 1: storyboard + palette + fonts approved ──┐
[U] Open decisions resolved (§7 Q1–Q4) ───────────────────┤
                                                          ▼
[S] git init + .gitignore ─► [FD] create-next-app (TS strict, Tailwind, App Router) ─► Vercel empty deploy
                                                          │
            ┌─────────────────────────────────────────────┼──────────────────────────────┐
            ▼                                             ▼                              ▼
     lib/gsap.ts ──► lib/scroll.ts (Lenis↔ST sync)   lib/palette.ts + globals.css vars   lib/scenes.ts
            └───────────────┬─────────────────────────────┴──────────────────────────────┘
                            ▼
              Experience.tsx: 8 SceneSlots with placeholder scenes (contract §4.3)
                            ▼
        ┌───────────────────┼─────────────────────┬──────────────────┐
        ▼                   ▼                     ▼                  ▼
  global sky timeline   ClockProgress        dev jump links     lib/device.ts
        └───────────── Checkpoint 3 (smooth placeholder scroll, sky changes) ─────┘
                            ▼
[U] Checkpoint 2 final art per scene ─► Phase 4, strictly sequential per PLAN:
   S1 ─► S3 ─► S2 ─► S6 ─► S7 ─► S5 ─► S4 ─► S0 + Loader
                            ▼
   Phase 5: transitions ─► lazy-load ─► mobile tier pass ─► audio (if Q2=yes) ─► meta/OG ─► Lighthouse ─► cross-browser
                            ▼
   not-found / error pages (any time after the skeleton, they only need palette + fonts)
                            ▼
   Phase 6 (U): prod deploy + domain, reel, case study
```

Hard rules:
- Lenis↔ScrollTrigger sync must exist before any scene.
- Palette tokens must exist before the sky timeline or any scene theming (convention: no hardcoded scene colours).
- `lib/scenes.ts` must exist before `SceneSlot`, ClockProgress and audio, since all three read clock times and scroll lengths from it.
- Placeholder scenes must satisfy the §4.3 contract before final art, so swapping in art never touches Experience.tsx.
- Final art (Checkpoint 2) must exist before each Phase 4 scene task for that scene. Scenes may start on geometric-silhouette fallback art if the user opts into PLAN §7's fallback.
- Loader/Scene 0 is last (PLAN). Loader progress depends on the final Scene 0/1 asset list.

Parallelisable:
- Inside Phase 3: palette/CSS vars, `lib/scenes.ts` and `lib/device.ts` are independent of `lib/scroll.ts`.
- ClockProgress, the sky timeline and the dev links are independent once Experience exists.
- The 404/error pages are independent of all scenes.
- Phase 2 art (U) can run alongside the Phase 3 skeleton (FD) **only if the user waives** PLAN's "don't start a phase until the previous checkpoint passes" (§7 Q5).

Phase 4 scenes are **not** parallel. PLAN requires each to be finished and tested before the next.

---

## 4. Interface Contract

There is no HTTP/DB contract. The contract is the set of shared frontend modules every scene and global component builds against. Signatures are normative. Values marked DRAFT need user approval.

### 4.1 `lib/palette.ts`
```ts
export type SceneId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface PaletteTokens {
  skyTop: string;      // hex; top of the continuous sky gradient
  skyBottom: string;   // hex; horizon
  ink: string;         // silhouettes / darkest layer
  accent: string;      // scene signature colour
  glow: string;        // light sources (lantern, sun, neon, lamp)
  text: string;        // Bangla main line
  textMuted: string;   // English subtitle
}

export const palette: Record<SceneId, PaletteTokens>;

// token -> CSS custom property; the only place var names are defined
export const cssVars: Record<keyof PaletteTokens, `--${string}`>;
// = { skyTop:'--sky-top', skyBottom:'--sky-bottom', ink:'--ink', accent:'--accent',
//     glow:'--glow', text:'--text', textMuted:'--text-muted' }

// Plain object for gsap.to(document.documentElement, toCssVarObject(palette[n]))
export function toCssVarObject(t: PaletteTokens): Record<string, string>;
```
Rules:
- Components use `var(--accent)` etc. through Tailwind arbitrary values or theme extension. **No hex in scene files.**
- Only Experience's global sky timeline writes the vars on `:root`. Scenes read them.
- A scene needing a local extra colour adds a token here. It does not hardcode one.
- Text/background pairs must reach WCAG AA contrast (4.5:1 for subtitles, 3:1 for large display type) in each scene.

DRAFT seed (from PLAN §5 palette column; U to replace at Checkpoint 1):
| # | PLAN palette | skyTop | skyBottom | accent | glow |
|---|---|---|---|---|---|
| 0 | Indigo → soft gold | #12133A | #1E1F55 | #E8C27A | #F5D99A |
| 1 | Deep indigo, teal | #141A4A | #2E5C66 | #3FA7A0 | #F2B680 |
| 2 | Saffron, warm orange | #F4A340 | #FBD38D | #E2702A | #FFE2A8 |
| 3 | Saturated multicolor | #00A6D6 | #FFE14D | #E6195A | #FFD000 |
| 4 | White-hot yellow | #FFF6D6 | #FFFDF2 | #F7C600 | #FFFFFF |
| 5 | Gold, haze | #F2A65A | #F7D79A | #D9822B | #FFC66B |
| 6 | Magenta, cyan | #2A0B4A | #B0197E | #19E3F0 | #FF3EC8 |
| 7 | Near-black blue | #05070F | #0D1530 | #2B3A67 | #F3C877 |

### 4.2 `lib/gsap.ts` and `lib/scroll.ts`
```ts
// lib/gsap.ts  ('use client' consumers only)
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
gsap.registerPlugin(ScrollTrigger, useGSAP); // idempotent, guarded for SSR (typeof window)
export { gsap, ScrollTrigger, useGSAP };
export const MOTION_QUERIES = {
  full:   '(prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
} as const; // used with gsap.matchMedia() in every scene
```
`useGSAP` is GSAP's official React wrapper around `gsap.context()` + `revert()`. It satisfies PLAN §4's cleanup convention. Adding `@gsap/react` is the only dependency beyond PLAN §2. It is official and tiny. If the user objects, fall back to a raw `gsap.context` in `useLayoutEffect`.

```ts
// lib/scroll.ts
import type Lenis from 'lenis';          // package name is `lenis` (not @studio-freight/lenis, deprecated)
export function initScroll(opts: { reducedMotion: boolean }): () => void;
//   reducedMotion=true  -> no Lenis; native scroll; ScrollTrigger still works.
//   reducedMotion=false -> new Lenis(); lenis.on('scroll', ScrollTrigger.update);
//                          gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
//   returns cleanup: removes ticker fn, lenis.destroy(), kills nothing else.
export function getLenis(): Lenis | null;
export function stopScroll(): void;     // Loader gate (lenis.stop() / body overflow fallback)
export function startScroll(): void;
export function scrollToScene(id: SceneId, opts?: { immediate?: boolean }): void; // target '#scene-N'
export function getScrollVelocity(): number;  // signed px/second, frame-rate independent, same with/without Lenis (Remediation 2)
export function getScrollVelocityNorm(): number; // getScrollVelocity() clamped to -1..1 (3000 px/s = 1)
export function refreshScroll(): void;  // ScrollTrigger.sort(); ScrollTrigger.refresh(); call after a lazy scene mounts or its art loads
```

### 4.3 Scene component contract (what makes placeholder → final art a drop-in swap)
```ts
// every components/scenes/SceneN*.tsx
'use client';
export interface SceneProps {
  id: SceneId;
  reducedMotion: boolean;   // from Experience (matchMedia), also re-checked via gsap.matchMedia inside
  tier: DeviceTier;         // 'high' | 'low'
  onIntensity?: (v: number) => void; // 0..1, optional; only Scene 3 (sound swell) uses it
}
export default function SceneN(props: SceneProps): JSX.Element;
```
Obligations, checked by error-detector and QA:
1. Renders **only the inside** of its slot: a root `<div ref={root} className="relative h-full">` holding a `sticky top-0 h-[100svh] overflow-clip` stage. It must not render `<section>`, set its own height or use `id="scene-N"`. Those belong to SceneSlot.
2. Pinning uses **CSS `position: sticky`** on the stage, not ScrollTrigger `pin`. The slot's height is the scroll budget, so pins never shift other scenes, lazy mount order cannot break offsets, and Experience never changes when art changes. Horizontal scenes (2, 3) tween the stage's inner track `x` across the slot's scroll range.
3. All tweens/triggers are created inside `useGSAP(() => {...}, { scope: root })` with `gsap.matchMedia()` branches for `MOTION_QUERIES.full` and `.reduce`. The ScrollTrigger `trigger` is `root.current.parentElement` (the slot), with `start: 'top top'`, `end: 'bottom bottom'` and `scrub: true` (or a number for smoothing).
4. The reduce branch uses opacity fades only. No parallax, no x/y travel, no zoom, no shaders, no particles. Text is still shown.
5. Animate `transform`/`opacity` only (`x`, `y`, `scale`, `rotation`, `autoAlpha`). Exceptions must be named in a comment: SVG filter params for Scene 4 shimmer, the canvas draw for Scene 5, uniforms for Scene 6.
6. Ambient loops (rAF, canvas, R3F `frameloop`, GSAP repeat:-1) **pause when the slot is out of view** (ScrollTrigger `onToggle` or IntersectionObserver) and are killed on unmount. Never call `setState` per scroll frame.
7. Text is real DOM text, not baked into SVG: Bangla line `<p lang="bn">`, English subtitle `<p lang="en">`. Copy is a typed const at the top of the file so the native reviewer can find it.
8. Decorative SVG/canvas gets `aria-hidden="true"`. Each scene's stage has `aria-label` = English subtitle.
9. Colours come only from CSS vars (§4.1).
10. Assets load only when the scene renders. The scene is dynamically imported (§4.5), so nothing is fetched up front.
11. A placeholder version of every scene ships in Phase 3: a palette-coloured stage, the scene's text lines, and one scrubbed opacity/transform tween. It satisfies 1–10.

Scene-specific additions:
- **Scene 3:** jam beat = a timeline segment where track `x` progress per scroll unit drops to about 20% for about 15% of the slot, then catches up. This is all scrub, no timers. Wheel `rotation` += `getScrollVelocity() * k` inside a `gsap.ticker` callback active only while in view. Type occlusion is z-ordering of DOM/SVG layers. Calls `onIntensity(|velocity| normalised)`.
- **Scene 5:** `PigeonSwarm` is a `<canvas>` 2D boid-lite capped at N birds (`tier==='low'` → N≤40, else ≤120). Direction is `Math.sign(getScrollVelocity())`. In reduced motion it renders a static flock silhouette SVG.
- **Scene 6:** `LightTrails` is an R3F `<Canvas frameloop="demand">` mounted only while the slot is within ±1 viewport. Uniforms are `uTime`, `uVelocity`, `uProgress`. `tier==='low'` or reduced motion → CSS/SVG gradient streaks and no WebGL context. Each light-on is its own ScrollTrigger (SCRIPT). Neon flicker is a short non-scrub timeline played on trigger enter. This is an allowed ambient effect.
- **Scene 7:** the restart button calls `scrollToScene(0)`. The final lamp-dot position and size must match Scene 0's circle (shared constant in `lib/scenes.ts`: `LIGHT_DOT = { sizePx, colorToken: 'glow' }`).
- **Scene 0:** the circle's scale comes from `Loader` progress (0.2 → 1), not from scroll. The title reveal after load is a one-shot tween (intro, not story motion). The blur-to-sharp effect animates `filter: blur()`. That is a named exception to rule 5, allowed only on a few title glyphs.

### 4.4 `lib/scenes.ts`
```ts
export type DeviceTier = 'high' | 'low';
export interface SceneMeta {
  id: SceneId;
  slug: 'intro'|'azaan'|'old-dhaka'|'rush'|'noon'|'golden-hour'|'neon'|'midnight';
  clockMinutes: number | null; // minutes since 00:00 at scene start; Scene 0 = null (pre-day)
  scrollLength: number;        // vh, height of the SceneSlot
  ease: 'calm' | 'snappy' | 'default'; // calm: 1,4,7  snappy: 3,6
  audio?: string;              // '/audio/scene-N.webm' if sound ships
}
export const SCENES: readonly SceneMeta[]; // index === id
// clockMinutes: 1=285, 2=420, 3=540, 4=780, 5=990, 6=1170, 7=1425
// scrollLength: 0=100, 1=150, 2=150, 3=400, 4=150, 5=150, 6=150, 7=150 (tunable)
export const EASE: Record<SceneMeta['ease'], string>; // e.g. calm:'sine.inOut', snappy:'back.out(1.6)', default:'power2.inOut'
export const LIGHT_DOT: { sizePx: number; colorToken: 'glow' };
export function progressToClockMinutes(globalProgress: number): number; // linear interp between scene anchors by slot offsets
```

### 4.5 `components/Experience.tsx`
```ts
'use client';
export default function Experience(): JSX.Element;
```
Responsibilities, and nothing else:
- `reducedMotion` = `matchMedia(MOTION_QUERIES.reduce)`, live-updated. `tier` = `getDeviceTier()`.
- `initScroll({ reducedMotion })` in an effect, with cleanup on unmount.
- Loader gate: `stopScroll()` until `Loader.onComplete`, then `startScroll()` + `refreshScroll()`.
- Renders `SCENES.map(m => <section id={`scene-${m.id}`} data-scene={m.id} style={{height:`${m.scrollLength}vh`}} className="relative">`. Inside goes the scene component.
- Scenes 0–1 are imported statically. Scenes 2–7 use `next/dynamic` (`ssr:false`) with a palette-coloured fallback, each calling `refreshScroll()` once mounted.
- **Global sky timeline:** one ScrollTrigger on the scene container, `scrub: true`. It tweens `:root` CSS vars from `palette[n]` → `palette[n+1]`, with segment boundaries at each slot's offset. This keeps the gradient continuous. The reduced-motion branch still runs, since a colour change is not motion.
- Global progress (0..1) → ClockProgress through a ref callback (`setProgress(p)`), and no React state.
- Active scene = the slot ScrollTrigger `onToggle`. Feeds `lib/audio.ts` if present.
- Dev jump links render only when `process.env.NODE_ENV !== 'production'` and use `scrollToScene`.

### 4.6 Other components
```ts
// Loader.tsx
export default function Loader(p: { assets: string[]; onComplete: () => void; reducedMotion: boolean }): JSX.Element | null;
// progress = (loaded fonts via document.fonts.ready + loaded assets) / total; eased finish; unmounts itself after the expand.
// Must complete even if an asset errors (count errors as loaded) and has a hard timeout (8s) so a slow asset can't trap the visitor.

// ClockProgress.tsx
export interface ClockProgressHandle { setProgress(p: number): void }
export default forwardRef<ClockProgressHandle, {}>(...);
// shows HH:MM from progressToClockMinutes; Bangla numerals optional (§7 Q3). role="img" aria-label updates at most per scene change, not per frame.

// AudioToggle.tsx
export default function AudioToggle(): JSX.Element; // <button aria-pressed={on} aria-label="Sound on/off">

// lib/audio.ts  (only if Q2 = sound at launch)
export function enableAudio(): void;           // first user gesture; lazy-creates Howls
export function disableAudio(): void;
export function setActiveScene(id: SceneId): void; // crossfade ~1.2s
export function setIntensity(id: SceneId, v: number): void; // Scene 3 swell
// muted by default; nothing loads until enableAudio(); state persisted in sessionStorage.

// lib/device.ts
export function getDeviceTier(): DeviceTier;
// 'low' if navigator.hardwareConcurrency<=4 || (navigator as any).deviceMemory<=4 || !WebGL2 available. Override via ?tier=low|high for testing.
```

### 4.7 Shared enums/constants summary
`SceneId`, `DeviceTier`, `PaletteTokens`, `SceneMeta`, `SceneProps`, `MOTION_QUERIES`, `EASE`, `LIGHT_DOT`. They are defined only in `lib/palette.ts`, `lib/scenes.ts` and `lib/gsap.ts`, and nowhere else.

---

## 5. Milestones

Agent-executable steps assume the blocking items in §7 are cleared.

**M0 — Repo bootstrap (pre-Phase 3, ~1 short session)**
1. U approves `git init` (§7 Q6). S runs `git init` and adds `.gitignore` (Next defaults). **Agents never commit.** U commits manually.
2. U decides whether to move `SCRIPT.md` → `docs/storyboard/SCRIPT.md` and the PLAN file location.
3. Create `docs/assets.md` with header columns only.

**M1 — Checkpoint 1 support (U-owned)**
- FD writes `lib/palette.ts` with the DRAFT values (§4.1) as a standalone TS file, so it is reviewable before the scaffold exists. U edits/approves.
- U picks 3 fonts (§7 Q2b), finishes the moodboard and storyboard sketches, and writes the 60-second summary.
- Gate: U's explicit "Checkpoint 1 approved".

**M2 — Checkpoint 2 (U-owned art)**
- U produces layered art per scene + audio (if Q2). FD may run SVGO/WebP conversion and fill `docs/assets.md`.
- Gate: every scene has final art. Scene 0+1 assets total < 5 MB.

**M3 — Phase 3 skeleton → Checkpoint 3** (FD; can run during M2 if Q5 = yes)
1. `create-next-app` (TS strict, Tailwind, App Router, ESLint, no `src/`). Deploy the empty page to Vercel (U links the account).
2. Install `gsap @gsap/react lenis`. Write `lib/gsap.ts`, `lib/scroll.ts`. Stop and show U (matches PLAN §9 first prompt).
3. `lib/palette.ts` (approved), `lib/scenes.ts`, `lib/device.ts`, CSS vars in `globals.css`.
4. `Experience.tsx` + 8 placeholder scenes per §4.3.11.
5. Global sky timeline, `ClockProgress.tsx`, dev jump links.
6. `not-found.tsx`, `error.tsx`, `global-error.tsx`.
- Gate: smooth scroll end to end with placeholders, and the sky changes continuously (§6 AC-C3).

**M4 — Phase 4 scenes → Checkpoint 4** (FD, one task per scene, strict order)
S1 → S3 (own scope) → S2 → S6 (own scope) → S7 → S5 (own scope) → S4 → S0 + Loader. After each scene, error-detector/QA spot-check against AC-S before the next starts. Install `three @react-three/fiber @react-three/drei` only when S6 starts (or S1 if the water shader is approved).
- Gate: full scroll-through with every scene complete.

**M5 — Phase 5 polish → Checkpoint 5** (FD; QA; U for the real Android device)
Transitions → per-scene lazy-load verification → low-tier pass → audio (if Q2) → metadata/OG image/favicon → security headers (SA) → Lighthouse → Chrome/Safari/Firefox/Android.
- Gate: 60fps on a mid-range phone, first scene in under 3 s.

**M6 — Phase 6 launch → Checkpoint 6** (U)
Prod deploy + custom domain, 30 s reel + mobile capture, `docs/case-study.md`, portfolio entry.

---

## 6. Acceptance Criteria

### Global / Definition of Done (PLAN §8)
- **AC-D1** Desktop (Chrome, Safari, Firefox latest) and mobile (real mid-range Android + iOS Safari) scroll end to end with no console errors and no layout jumps between scenes.
- **AC-D2** Each scene has one documented emotion and one unique motion moment, matching the §1.4 column. QA confirms each is visibly present.
- **AC-D3** A 60-second continuous scroll from top to credits passes all 8 scenes. Each scene's Bangla + English lines are on screen for at least ~1 s at that pace.
- **AC-D4** With `prefers-reduced-motion: reduce` (DevTools emulation): no parallax, horizontal travel, zoom, particles or WebGL canvas; Lenis is not instantiated; all text is visible; the sky colour still progresses.
- **AC-D5** Live URL, reel and case study exist (U-verified).

### Checkpoints
- **AC-C1** U has explicitly approved the storyboard, `lib/palette.ts` values and fonts, recorded in this folder or chat, before any code beyond `lib/palette.ts`.
- **AC-C2** Every scene has final art in `/public`. Scene 0+1 transferred assets total < 5 MB (DevTools Network, cache disabled). Every audio file is < 300 KB. Every asset has a row in `docs/assets.md` with source + licence.
- **AC-C3** With placeholder scenes: wheel/trackpad scroll is smooth (Lenis active); the `--sky-top`/`--sky-bottom` values change continuously, with no frame showing a jump greater than one interpolation step at any slot boundary; ClockProgress shows 04:45 at Scene 1 start and 23:45 at Scene 7 start; dev jump links reach each `#scene-N` and are absent from the production build.
- **AC-C4** All 8 scenes are final and pass AC-S1–S6.
- **AC-C5** 60fps (AC-S2) on the reference phone. The first scene (loader complete + Scene 1 visible) is ready in < 3 s under Chrome DevTools "Fast 4G" throttling with cache disabled.
- **AC-C6** Live production URL on the custom domain, reel and case study published.

### Per-scene "done" (PLAN Phase 4; applies to each of Scenes 0–7)
- **AC-S1** Matches the SCRIPT layers, motion list, text and transition for that scene. QA checks each bullet.
- **AC-S2** Runs at 60fps on a mid-range phone. Chrome remote DevTools Performance trace while scrolling through the scene shows no sustained dropped frames and no long task over 50 ms during scroll.
- **AC-S3** Has a reduced-motion version per §4.3.4.
- **AC-S4** Cleans up on unmount. After mounting and unmounting the scene (dev toggle or HMR), `ScrollTrigger.getAll()` contains no triggers for its slot, there are no leftover `gsap.ticker` callbacks, rAF loops or WebGL contexts, and listeners are removed.
- **AC-S5** Contract compliance (§4.3 rules 1–10): no hex colours in scene files (grep `#[0-9a-fA-F]{3,6}` in `components/scenes` returns none); no `setTimeout`/`setInterval` driving story motion; no ScrollTrigger `pin:`.
- **AC-S6** Text is selectable DOM text with correct `lang` attributes, and each line is under 8 words.

### Phase 5 specifics
- **AC-P1** Transitions match SCRIPT's "Transition" line per scene, with no hard cuts (the sky never jumps; outgoing and incoming layers overlap).
- **AC-P2** Audio (if shipped): muted on first visit; nothing in `/audio` is requested before the toggle is pressed; the toggle is keyboard-operable with `aria-pressed`; scene change crossfades with no audible click; the Scene 3 volume rises with scroll speed.
- **AC-P3** With `?tier=low` or on a low-tier device, no WebGL context is created and Scene 5 uses ≤ 40 birds.
- **AC-P4** Network panel: Scene N's art is not requested until the visitor is within about one scene of it.
- **AC-P5** Lighthouse (mobile, production build): Performance ≥ 85, Accessibility ≥ 90.
- **AC-P6** `<title>`, description, OG/Twitter image (1200×630), favicon and apple-touch-icon are present.
- **AC-P7** Keyboard: Tab reaches the AudioToggle, the credits links and the restart button with a visible focus ring. Space/PageDown scroll works.
- **AC-P8** The restart button returns to the top and replays the Scene 0/1 state correctly (no stuck tweens).
- **AC-P9** `/does-not-exist` renders the custom on-brand 404 (not the Next default). A thrown render error shows the custom error page with a working retry.
- **AC-P10** Response headers include `X-Content-Type-Options: nosniff`, `Referrer-Policy` and a CSP that allows only self + required font/analytics origins. Credits external links have `rel="noopener noreferrer"`.

---

## 7. Open Questions / Risks

### BLOCKING — user must decide (no agent can resolve these)
- **Q1 Illustration style** (SCRIPT open decision). The default is "flat vector with grain, rickshaw-art influence". It blocks all of Phase 2 and the final look of every scene. **This is the most important blocker**: every asset, the grain texture approach and the palette values depend on it.
- **Q2 Sound at launch or later** (SCRIPT). Decides whether `lib/audio.ts`, `AudioToggle`, the Scene 0 "Sound on" note and AC-P2 are in Phase 5 scope, and whether audio sourcing is in Phase 2.
  - **Q2b Fonts**: one Bangla display face, one clean sans, one chunky rickshaw-art face (PLAN Phase 1). They must be licensed for web (logged in `docs/assets.md`) and must have Bangla glyph coverage.
- **Q3 Native Bangla reader** (SCRIPT) must verify all copy before launch. This blocks launch, not build. Also: should ClockProgress use Bangla numerals?
- **Q4 Which scene to prototype first** (SCRIPT recommends Scene 1 then 3, which matches PLAN Phase 4's order). Confirm.
- **Q5 Phase gating vs PLAN §9.** PLAN says no phase starts until the previous checkpoint passes, and "no coding past Checkpoint 1 until approved". Yet PLAN §9's first prompt jumps straight to Phase 3 tasks 1–3. Can the Phase 3 skeleton (placeholders only) start in parallel with Phase 2 art once Checkpoint 1 is approved?
- **Q6 Not a git repo.** `git init` is needed before any code. PLAN §4 says "commit after each completed task", but the user's global rule says agents never commit. Resolution: agents never commit; they suggest messages in `scene-N: ...` format, and U commits.

### Non-blocking questions
- **Q7** Move root `SCRIPT.md` to `docs/storyboard/SCRIPT.md` as SCRIPT itself says? Agents will not move the user's files without a yes.
- **Q8** Credits content: exact portfolio URL and social links (SCRIPT Scene 7). Needed by M4/S7.
- **Q9** Analytics: none is specified, so none is planned. CSP stays self-only unless one is added.

### Risks / grounded deviations
- **R1 Pinning approach.** The contract uses CSS `position: sticky` stages inside fixed-height slots instead of ScrollTrigger `pin`. With lazy-loaded scenes mounting out of order, `pin` spacing breaks the offsets of later triggers. Sticky avoids this with zero JS. Requirement: no ancestor may use `overflow: hidden` (use `clip`). Reverting to `pin` would need `refreshPriority` on every scene.
- **R2 Multiple WebGL contexts.** R3F canvases (S6, optional S1 water) must mount only near the viewport, and only one may be live at a time. Mobile Safari caps contexts.
- **R3 R3F scope.** PLAN §2 limits R3F to fog/water/light trails. So Scene 2 steam, Scene 4 heat shimmer and the Scene 5 pigeon swarm are planned as SVG/canvas2D, not shaders. Changing this needs U approval.
- **R4 Scene 4 shimmer.** An SVG displacement filter on a large area is costly on mobile. It is limited to the bottom third (SCRIPT) and disabled on the low tier.
- **R5 Scene 3 at about 400vh** is the heaviest layer stack. The art must be exported per layer as separate SVGs/WebPs with the vehicle count capped. This is the most likely AC-S2 failure. Budget time for it.
- **R6 Cut order** (PLAN): Scene 4, then Scene 5. Never cut 0, 1, 3, 6 or 7. If cut, the slot is removed from `SCENES` and the palette segment collapses. The contract supports this without touching other scenes.
- **R7 Illustration time:** PLAN fallback = bold geometric silhouettes in the same palette. The scene contract is art-agnostic, so a fallback can ship and be swapped later.
- **R8 Loader honesty:** "real asset loading progress" needs a known asset list for Scene 0+1. That list is fixed only after Checkpoint 2, so the Loader is last (PLAN agrees).
- **R9 404/500 pages** are added per pipeline policy. The site has one route, so they are small, on-brand and use the existing palette and fonts. No new scope beyond that.
- **R10 Versions:** use the current stable Next.js / React / Tailwind / GSAP / Lenis at scaffold time and check their docs. Do not pin from memory. GSAP and all its plugins are free for commercial use. The `lenis` package replaces `@studio-freight/lenis`.
