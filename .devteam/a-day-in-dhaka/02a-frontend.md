# 02a — Frontend (M3: Phase 3 skeleton)

Verified: `npx tsc --noEmit`, `npm run lint` (0 problems), `npm run build` pass. `next dev` returns `/` 200 and `/nope` 404. Production `next start` serves the custom 404 and the custom error page (a temporary throwing route, since removed, showed no internals). Headless Chrome walk-through with no console errors and no horizontal overflow at 1440 and 390 px. Lenis is off under `prefers-reduced-motion` (`html.lenis` absent). The dev jump links are absent from the production HTML.

## Files
- Scaffold: Next 16.3.8 (Turbopack, `retry` replaces the old `reset` prop on error pages), React 19.2.8, Tailwind 4.3.3, TS strict, ESLint. No `src/`, no git. Added `gsap@3.15.0`, `@gsap/react@2.1.2`, `lenis@1.3.26`. `create-next-app` also dropped `AGENTS.md` and `CLAUDE.md` in the root. They are the Next docs pointer, so keep or delete as you like. I removed its README and the sample SVGs.
- `lib/`: `gsap.ts`, `scroll.ts`, `palette.ts` (DRAFT), `scenes.ts`, `device.ts` (all per §4 signatures), plus `fonts.ts` (shared by layout and global-error).
- `app/`: `layout.tsx`, `page.tsx`, `globals.css`, `not-found.tsx`, `error.tsx`, `global-error.tsx`.
- `components/`: `Experience.tsx` (SceneSlot inline), `ClockProgress.tsx`, `QuietPage.tsx` (shared 404/error shell), `scenes/Scene0Intro.tsx` ... `Scene7Midnight.tsx`, `scenes/scene-kit.tsx` (shared §4.3 plumbing).
- Not built, by instruction or assumption: `Loader.tsx` (planned last in M4), `AudioToggle` / `lib/audio.ts` (Q2). The Loader scroll gate (`stopScroll`/`startScroll`) is implemented in `lib/scroll.ts` but nothing calls it yet.

## Key decisions
- **Scene contract in one place.** `scene-kit.tsx` holds `useSceneTimeline`, `Stage` and `SceneText`:
  - `useSceneTimeline` wraps `useGSAP` + `gsap.matchMedia` full/reduce branches. The ScrollTrigger trigger is the slot, `scrub: true`, `invalidateOnRefresh`. The timeline is padded to duration 1 so positions are fractions of the range.
  - `Stage` is the sticky `h-svh overflow-clip` stage with `role="group"` and an English `aria-label`.
  - `SceneText` renders `<p lang="bn">` and `<p lang="en">`.
  - Scene files hold only a typed `COPY` const, SVG art and tween positions. Final art is a drop-in swap.
- **Placeholders are bold geometric silhouettes**, with ink/accent/glow only (no hex in scene files, grep clean). Each has a distinct signature motion:
  - S1 fog parallax (lowest layer fastest), stars fade, windows light in sequence, boat glides.
  - S2 horizontal lane pan and steam.
  - S3 pan with a jam beat (progress rate drops to about 20% for 15% of the slot, then catches up), per-layer speeds, wheels spin, three giant words occluded by vehicles.
  - S4 sun arc, rotating and lengthening shadows, sweat drop.
  - S5 kites, a cut kite falling, a pigeon silhouette flock, camera rise.
  - S6 staggered light-ons, neon sign fade-in, CSS light streaks, bokeh.
  - S7 slow zoom out, lamp shrinks to `LIGHT_DOT`, credits, restart button (`scrollToScene(0)`).
- **Sky:** one scrubbed timeline over the whole page rewrites the `:root` vars. `fromTo` with explicit palettes and `immediateRender:false`. It holds each scene's palette for the middle of its pinned range (±15% of the slot length), then eases to the next. It runs in reduced motion too. Verified in the browser: exact palette values at each scene centre.
- **ClockProgress** is ref/quickSetter-driven: sun on a semicircle arc, HH:MM `textContent` written only when the minute changes, `aria-label` updated once per scene change, hidden through Scene 0 (04:45 at Scene 1 start, 23:45 at Scene 7 start, both checked in the browser).
- **Lazy scenes:** Scenes 2–7 use `next/dynamic` (`ssr:false`) via `lazyScene()`, which wraps each in `RefreshOnMount` (calls `refreshScroll()` after the scene's own triggers exist). The fallback is a sticky ground band.
- **Device and reduced-motion state** use `useSyncExternalStore` (no setState-in-effect), with a server snapshot of `high` / `false`.
- **Library choice:** nothing hand-rolled where a library would be better. No toast/dropdown/modal exists in this task. Lenis, GSAP and `@gsap/react` are the plan's stack.
- **Contrast** (WCAG, measured with a script on the DRAFT palette): text and muted text against both sky stops are ≥ 4.5:1 in all 8 scenes (lowest: S1 muted/bottom 5.00, S6 muted/bottom 5.35). Button ink on glow ≥ 6.4:1.

## Standard pages
Added, all on-brand (Scene 7 palette scoped on the wrapper, one lamp-and-halo motif, Bangla + English copy, a real way back):
- `app/not-found.tsx`: 404, Link home.
- `app/error.tsx`: "Try again" (`retry()`) + home. Logs only `error.digest`; no message or stack reaches the UI.
- `app/global-error.tsx`: own `<html>/<body>`, imports `globals.css` and the font loaders, same shell.
They are lightweight: static markup plus a 280 ms CSS rise-in (stagger 60 ms, `cubic-bezier(.23,1,.32,1)`, `no-preference` only).

## Typography
- **Voice:** Noto Serif Bengali (variable) carries identity (title, per-scene Bangla line). Hind Siliguri 400/500/600 is the UI/subtitle sans. Baloo Da 2 (variable) is the chunky face for the Scene 3 words, the clock and Latin time labels (`preload:false`). All three load the `bengali` and `latin` subsets via `next/font/google`, `display: swap`.
- **Scale (tokens in `@theme`):** `text-giant` clamp(5rem, 1.5rem+22vw, 20rem); `text-display` clamp(2.75rem, 1.4rem+6vw, 6.25rem); `text-line` clamp(1.75rem, 1.2rem+2.6vw, 3.5rem); `text-sub` clamp(1rem, .9rem+.45vw, 1.25rem); `text-clock` clamp(1.125rem, 1rem+.6vw, 1.5rem); `text-label` .8125rem with .14em tracking (Latin uppercase only).
- **Bangla rules:** line-height 1.2–1.3 on display steps (matras), `:lang(bn){letter-spacing:0}`, headings `text-balance`, subtitles `text-pretty`, tabular numerals on the clock. The Bangla time chip uses the serif because Baloo's ৪ reads like "8" at chip size.

## Motion
- **GSAP + ScrollTrigger (scrub) + Lenis** for all story motion, per the engine table (scroll-narrative). Lenis is driven by the single `gsap.ticker` (no autoRaf), with `lagSmoothing(0)` and restore on cleanup, and `ScrollTrigger.update` on Lenis scroll.
- **CSS only** for interface moments, one owner per property: buttons (`scale(.96)` on `:active`, 160 ms `ease-out`, 150 ms colour), clock fade (300 ms `ease-out`, opacity only), quiet-page rise, lamp breathe (opacity, 4.8 s loop), Scene 0 scroll-prompt pulse (opacity/scaleY loop). The loops are ambient and compositor-only. They run only under `prefers-reduced-motion: no-preference`.
- **Easing:** calm scenes 1/4/7 use `sine.inOut`; 3/6 use `back.out(1.6)`; default is `power2.inOut`, from `EASE`. Text beats and exits use `power2.out` (no ease-in on entrances or exits), stagger 60 ms between beats. Only `x/y/scale/rotation/skewX/autoAlpha` are animated in scenes; there are no named exceptions yet.
- **Reduced motion:** Lenis is not created (native scroll). Each scene's `matchMedia` reduce branch is opacity-only: no parallax, pan, zoom or rotation. Scene 3's words, which sit in the off-screen track in full mode, are restacked in view (`motion-reduce:` Tailwind variant) so all text stays visible. The sky colour keeps scrubbing. The clock stays (informational, stationary).
- **Self-check against review-animations STANDARDS:** no `scale(0)`; nothing UI-level is over 300 ms except the intentional 4.8 s lamp breathe; there are no popovers. Scrubbed tweens are exempt from duration limits because they are scroll-time.

## Deviations
1. **Scene 0 trigger range is `top top` → `bottom top`**, not `bottom bottom`: the 100svh slot has a zero-length pinned range, so the contract's start/end collapse. The kit takes `start`/`end` options.
2. **Slot heights use `svh`**, not `vh`, so they match the `100svh` stage and avoid a gap under the mobile URL bar. This changes the unit in `SceneMeta.scrollLength` and the `SceneSlot` style. The numbers are as specified (100/150/150/400/…).
3. **Scenes 2 and 3 pan with `x` on a track sized in svh** (`356svh` / `640svh`, matching the art's aspect ratio) and a function-based travel (`invalidateOnRefresh`), instead of `xPercent`. This keeps art undistorted at any aspect.
4. **`SceneProps` lives in `lib/scenes.ts`** (§4.7 allows this). Placeholder scene components take no parameters (a valid subtype of the contract). They will take `SceneProps` when a scene needs `tier` or `onIntensity`.
5. **`ClockProgress` hides during Scene 0** and clamps to 04:45 before Scene 1 (Scene 0's `clockMinutes` is null). It also self-derives the scene bucket from progress (no `setScene` in the handle).
6. **Added to lib/scenes.ts:** `SCENE_OFFSETS`, `TOTAL_SVH`, `SCROLL_RANGE_SVH`, used by the sky, clock and `progressToClockMinutes`. Added `lib/fonts.ts`, `components/QuietPage.tsx` and `scene-kit.tsx`.
7. **Sky segments have plateaus** (hold at each scene's palette) rather than interpolating from slot boundary to boundary (§4.5). Reason: it keeps text/background at the audited contrast; transitions still never jump.
8. **Dev jump links** use fixed `bg-black/white` (not scene tokens) so they stay visible on every sky. They are dev-only and are tree-shaken from production.

## Open items
- **For the user / Checkpoint 1:** palette values are DRAFT. Bangla copy is verbatim from SCRIPT, with the native review pending. The Bangla for the 404/error pages is mine (`পৃষ্ঠাটি খুঁজে পাওয়া যায়নি`, `কিছু একটা ভুল হয়েছে`, `আবার চেষ্টা করুন`, `শুরুতে ফিরে যান`, `আবার শুরু করুন`) and needs the same review. One SCRIPT English line, "The sky belongs to whoever owns a rooftop", is exactly 8 words, which breaks the "under 8 words" rule (AC-S6). I kept it verbatim.
- **Scrub window for 150svh slots is only 50svh** (pinned range = `top top` → `bottom bottom`, per contract), so each scene's text/motion plays over a short stretch. If it feels rushed at Checkpoint 3, widen to `top bottom`/`bottom top` per scene via the kit's `start`/`end`, or raise `scrollLength`. Contract change, so I did not decide it silently.
- **SEO/no-JS:** Scenes 2–7 are `ssr:false`, so their copy is not in server HTML. Consider server-rendered text later if the page needs to be indexable beyond the first two scenes.
- **security-auth:** no `next.config` headers/CSP yet (SA scope). Next/Turbopack dev needs inline-script allowances, so apply CSP to production only. Credits link `rel` rules apply when URLs arrive (Q8). Currently there are no external links and no user input.
- **qa-bug-hunter:**
  - AC-S4 unmount/HMR trigger-count check not run (verify `ScrollTrigger.getAll()` after toggling).
  - Scene 7 restart (`scrollToScene(0)`) not yet exercised through Lenis and replay.
  - `getScrollVelocity` units (Lenis px-per-frame-ish vs the reduced-motion fallback delta) need normalising before Scene 3/5/6 use them.
  - The ambient CSS loops (Scene 0 prompt, lamp breathe) do not pause offscreen; they are compositor-only, but rule 6 says pause. Revisit when Scene 0 is finalised.
  - No real-device (Android/iOS) check yet.
- **Performance:** the global sky tween writes 7 CSS vars on `:root` per scroll frame, which recalcs styles page-wide. Measure on a low-end phone (AC-S2). The fallback is a `quickSetter` on a single fixed gradient layer.

## Remediation (04-errors.md round 1)

Verified: `npx tsc --noEmit`, `npm run lint`, `npm run build` clean. Headless Chrome against `next start`: no console errors, full and reduced motion.

| # | Fix |
|---|---|
| 1 | Added `duration: 1` (steam 0.9) to the tweens in Scene1Azaan and Scene2OldDhaka, so motion fills the scrub instead of finishing at 50%. |
| 2 | Scene3Rush last segment now `power2.out` (no overshoot past `-T`). |
| 3 | Scene7Midnight: lamp scale only in `mode === "full"`. The reduce branch fades the lamp opacity (0.4 to 0.15), with no transform. Browser check under reduce: lamp `transform: none`. |
| 4 | `SceneSlot` is now stateful. Scenes 0-1 mount immediately. Scenes 2-7 mount only after an IntersectionObserver (`rootMargin: "100% 0px"`) sees the slot within about 1 viewport, then stay mounted. The slot keeps its `svh` height while empty. Checked via response bodies at 810px viewport height: no scene 2-7 chunk requested at load. Each chunk is requested between 2.3 and 1.7 viewports above its slot. Same under reduced motion. |
| 6 | The lamp target scale converts `LIGHT_DOT.sizePx` (px) to SVG units with the rendered slice scale `max(w/1600, h/900)`, as a function-based value (re-evaluated on refresh). Scene 0's circle still uses its own r=64; the M4 Loader will drive it from `LIGHT_DOT`. |
| 7 | `refreshScroll()` is rAF-coalesced in `lib/scroll.ts`: any number of calls in one frame produce one `sort()` + `refresh()`. |
| 9 | `initScroll` now reads the live `matchMedia` value, not the hydration snapshot. Reduce users never get a Lenis instance (`html.lenis` absent, confirmed). |
| Scroll window | `scene-kit.tsx` default `start` is `"top 70%"` (end stays `bottom bottom`), giving a 150svh slot a 120svh scrub window. Scene 0 keeps `top top`/`bottom top`. Scene 3 now passes `{ start: "top top" }` explicitly. |

Left as-is: #5 (needs a real device), #8 (SCRIPT copy is a user decision), #10 (measure first). Open note: if Checkpoint 3 still feels rushed, raise `scrollLength` to 200 for scenes 1, 2, 4, 5, 6, 7 (this shifts sky and clock anchors automatically through `SCENE_OFFSETS`).

## Remediation 2 (QA-1..QA-4 + two carried items)

- **QA-1 (High) fixed**, `components/scenes/scene-kit.tsx`. All beats are hidden up front with `gsap.set(beats, { autoAlpha: 0, y: 16 (full only) })` inside the matchMedia callback, so `mm.revert()` undoes it. The entrance is now `tl.to(beats, ..., BEAT_IN)` with a 60ms-equivalent stagger. The old staggered `fromTo` only applied its from-state to the first target. Easing and durations are unchanged: `power2.out`, `y` and `autoAlpha` only.
- **QA-2 (Medium) fixed** by timing plus an adaptive clock. No text and sky ever cross-fade together now.
  - `lib/scenes.ts` gains `BEAT_IN`/`BEAT_OUT_END`, `textWindowSvh(id)` and `skyAnchors()`. The sky holds scene n's palette exactly while its text beats are on screen (0.22 to 0.95 of the trigger range; the last scene holds to the end). It transitions only in the gaps with no text. This replaces Experience's old `PLATEAU` formula. Scene 0 is the exception: its fade overlaps the sky move, but both ends are dark with light text.
  - The clock was always on screen over a changing sky, so it now sits on an `--ink` pill at 80% alpha. Ink is dark in every scene. The text uses a fixed `CLOCK_FG` (`#FBF1D9`, `lib/palette.ts`) and the arcs use `stroke-current`. Worst case is over a pure white sky.
  - The `todo` test was replaced with 3 real tests (npm test: 12 pass, 0 todo): ordered plateaus and positive transition widths; text and muted text >= 4.5:1 on both stops at every 0.5svh wherever any scene's beats are visible, through the piecewise-lerp sky model; clock >= 4.5:1 at every scroll position, including over white and black.
- **QA-3** fixed: `error.tsx` and `global-error.tsx` log `error.digest ?? error.name`. Still no message in the UI.
- **QA-4** fixed: `initScroll` cleanup strips `lenis*` classes straight after `destroy()` and again 450ms later, which is after Lenis's 400ms reset timer. The delayed strip is skipped if a new Lenis instance is live (StrictMode remount).
- **Scene 0** dot and halo tweens now have `duration: 0.6` / `0.8`. They were defaulting to 0.5, which is half the scrub range.
- **Velocity normalised** in `lib/scroll.ts`:
  - `getScrollVelocity()` returns signed px/second, frame-rate independent and identical with and without Lenis. It is one ticker that measures `scrollY` against the tick delta.
  - New `getScrollVelocityNorm()` is clamped to -1..1, saturating at `VELOCITY_REF_PX_S` = 3000. Scenes 3, 5 and 6 should use the Norm helper for intensity and direction. `01-plan.md` §3 signature comments are updated.
- **Verification**:
  - `tsc` clean, lint 0 problems, `npm test` 12/12, `npm run build` passes.
  - A headless Chrome sweep of the production build used 781 samples at 1440x900 and at 390x844, in full and reduced motion:
    - **No blink**: every beat in scenes 0-7 has exactly one visible span, and beat 1 first shows before beat 2.
    - **Contrast**: the minimum text contrast with beat opacity >= 0.5 is 6.42:1 (scene 3 chip), against the 4.5 target. Per-scene minimums are 6.4 to 10.3.
    - **Clock**: minimum 7.49:1 over 721 samples.
    - **Errors**: no console errors.
- **Design note, needs approval**: the clock now has a dark rounded pill, a small visual change at top right in every scene. The alternative of finding a per-sky colour was dropped because both stops and the mid-grey crossover can't be satisfied with one text colour.
- **Open**:
  - `TRIGGER_START_SVH` in `lib/scenes.ts` (Scene 3 = "top top") must be kept in step with any scene that changes its `start` option.
  - On mobile, svh and the ScrollTrigger viewport can differ by the URL bar. The windows have about 3% margin, which is untested on a real device.
