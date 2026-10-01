# Scene 1 "Azaan on the Buriganga" - frontend handoff (Phase 4)

Verified: `tsc` clean, `npm run lint` 0 problems, `npm test` 12/12, `npm run build` passes. Headless Chrome (dev + `next start`): no console errors, no horizontal overflow (scrollWidth == clientWidth at 1440 and 390), screenshots at 1440x900 / 390x844 / 1280x720 reviewed and iterated (see Critique).

## Files
- `components/scenes/Scene1Azaan.tsx` (replaced placeholder): layout, defs, scrub timeline, lantern loop.
- `components/scenes/scene1-art.ts` (new): seeded, pure path generators (skylines, mosque, minarets, windows, stars, boat, ripples, fog blobs). Deterministic, so SSR == hydration.
- `lib/palette.ts`: appended `scene1Extras` (dawnPink, dawnTeal) and `scene1Vars` (CSS var map). Existing exports untouched.
- `docs/assets.md`: two rows (art + grain). No `public/textures` file shipped.
- NOT touched: scene-kit.tsx, Experience.tsx, lib/scenes.ts, SCRIPT.md, next.config.ts.

## Design system (declared first)
- Style recipe: flat-vector geometric silhouettes + grain. Depth from value planes, never blur: sky > stars > dawn wash > far bank (ink 40%) > near skyline (ink 94%) > river > boats (ink) > 3 fog layers > grain.
- Palette: only CSS vars. Scene root pins `--ink/--glow/--text/--text-muted/--accent` to `palette[1]` (scoped inline override; nothing is written to `:root`) so silhouettes stay dark while the global sky warms to Scene 2 behind them. `--sky-top/--sky-bottom` stay live (river reflects the sky). Local extras `--s1-dawn`, `--s1-dawn-teal` come from `scene1Vars`. No hex in components (`black` keyword used for the grain mask).
- Type: unchanged (`SceneText` from scene-kit, scale tokens from globals.css).
- Art composition is centre-weighted because `Art` uses `xMidYMax slice`: a 390px portrait crop shows only viewBox x 592..1008, so mosque, boat and lantern sit there; desktop shows x 80..1520.
- Layers: 5 star clusters (2 paths each), dawn wash + pale horizon line, far bank, near skyline (mosque with dome/cupolas, 2 corner minarets, 2 more minarets, 15 old blocks), river with mirrored skyline reflection broken by ripple gaps painted in the water gradient, tapering glints, 3 nouka (hull, chhoi hood, boatman, punting pole; lead boat has bow lantern post, lamp, halo, water glint), 3 fog layers of flat radial-gradient ellipses (no blur filter), amber twins on layers 2-3.

## Motion (all scrub, transform/opacity only; GSAP via `useSceneTimeline`)
Positions are fractions of the ScrollTrigger range; the stage is only fully pinned for the last ~42% (0.58-1.0), so cues are timed to be seen while it enters and while pinned.
| Cue | Tween |
|---|---|
| Stars | cluster-by-cluster opacity 1>0 at 0.14 + i*0.12, dur 0.16 (ends 0.78) |
| Dawn | teal-pink wash + horizon glow + water glints opacity 0>1, 0.30 to 0.92 |
| Minaret windows | 8 groups (muezzin lamps first, mosque arches, then homes) fade in sequence, 0.36 + i*0.05 |
| Fog parallax (full) | x -140 / -300 / -520 for layers 1/2/3 (lowest fastest), `sine.inOut` (calm) |
| Boats (full) | lead +300, far +110, left +170, left to right; skyline layers drift -12 / -30 |
| Transition end | amber fog twins fade in 0.74 to 1.0 while cool fog thins to 55% |
| Lantern flicker (full) | opacity-only keyframes loop, 3.4s, paused until slot on screen via `ScrollTrigger.onToggle`, reverted with the matchMedia context. Own element (halo + glint), so no property clash with the scrub timeline |
Reduce branch: opacity fades only (stars, dawn, windows, amber, cool fog). Verified in Chrome: boat/fog/layers `transform: none`, no flicker loop.
Review-animations self-check: scrub (no entrance duration to budget), fades use power1/2.out, no scale(0), no ease-in, only transform/opacity animated.

## Perf
- DOM: 134 nodes under `#scene-1` (about 50 of them SVG shapes); 4 gradient defs sets, no SVG filters, no blur, no blend modes. Grain is a feTurbulence data-URI tile rasterised once (same as globals.css), masked to fade at stage top/bottom so it creates no seam while sliding.
- `tier === "low"`: drops the skyline reflection `<use>`, the ripple path and the third boat.
- Bundle: Scene 1 is statically imported (eager per Experience); its share of the chunk is about 15 KB gz including path generators; SSR HTML for the whole page is 9 KB gz.

## Contrast
Backdrop sampled from screenshots with the text hidden, worst pixel under each text rect (5 scroll points, 3 viewports): Bangla/time chip >= 9.6:1, English >= 6.99:1 (both measured against the max-luminance pixel, so worst case). A top scrim (transparent > ink 40% at 32% > transparent) sits behind the art, and stars are remapped out of the text box.

## Critique and iterations
1. Fog read as muddy round blobs, hid the lead boat: flattened (wide, low ellipses), lowered layer 2, jittered blob sizes, thickest layer opacity 0.62.
2. Lantern glint was a floating pill: replaced with tapering dashes under the lamp.
3. Scrim and grain made a visible seam while the stage slid in (grain +7/255): scrim now fades in from 0, grain masked at edges (seam now <1/255).
4. Dome finial balls punched holes (opposite path winding): fixed sweep flag.
5. Stars were all gone by the time the stage pins and sat behind the copy: stretched fade to 0.78, excluded the text box.
6. Boats too small: lead boat scale 1.2.

## Deviations
- Scene root overrides the shared colour vars locally (see above); needed so silhouettes do not turn brown during the Scene 1 to 2 sky change. Experience still owns `:root`.
- Optional water shader skipped, as instructed.
- Grain uses the inline SVG tile, not a WebP in `public/textures` (allowed by brief; logged).

## Open items
- QA: boat/fog travel numbers are in svh-independent SVG units, so on very wide screens (>2000px) fog still covers (x -100..2200 blobs) but the far-right edge at the end state is close; check ultrawide.
- Perf needs a real mid-range phone measurement (AC-S2); the Chrome headless runs only confirm no errors.
- Art is the PLAN §7 fallback; swapping to final illustration only changes `scene1-art.ts`/the SVG block, not the timeline selectors (`data-stars`, `data-dawn`, `data-win`, `data-layer`, `data-boat`, `data-fog`, `data-cool`, `data-warm`, `data-flicker`).
- Bangla copy still pending native review (unchanged).
- Another agent concurrently added `prefersReducedMotion` to `lib/gsap.ts` (briefly duplicated, since fixed); not mine.
