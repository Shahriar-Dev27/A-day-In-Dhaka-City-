# 04b — Scene 1 review (error-detector, persisted by orchestrator)

tsc / lint / npm test (12/12) / build pass. Contract §4.3 rules 1–10 hold (no hex, no pin, no timers, no setState, ids `s1-*` unique, 135 nodes). Cleanup is code-read only (no browser run).

## Scene 1
- MEDIUM Scene1Azaan.tsx:28 — ROOT_VARS spreads `toCssVarObject(palette[1])` incl. `--sky-top/--sky-bottom`, so the scene root pins the sky; river/dawn gradients stay teal while global sky warms to Scene 2. Drop those two keys.
- LOW :65/:210 — `fromTo` on `[data-cool]` w/ immediateRender overrides FOG_LAYERS opacity attrs (scene1-art.ts:173-175); authored 0.3/0.42/0.62 are dead.
- LOW :79 — flicker keyframes start at absolute 1; glint path (attr opacity 0.55, :200) pulses to 1.
- LOW :48-53 — tier flips after timeline built; low tier's 3rd-boat tween orphaned (harmless).
- LOW — SCRIPT transition "fog lifts / camera drifts up the riverbank" not built; only amber fog fade 0.74–1.0.

## Edits made by another source (not in 02a; no git to diff)
Probably a concurrent Claude session (ListAgents shows peers a-day-in-dhaka-95 / -4d / "Mengto Skills integration").
- components/Loader.tsx new; Experience.tsx renders `{!loaded && <Loader/>}`, `INTRO_ASSETS=[]`, switched reducedMotion/tier to useSyncExternalStore, initScroll uses live prefersReducedMotion().
- lib/gsap.ts: `prefersReducedMotion` export added.
- Scene0Intro.tsx: SplitWords + data-intro-* hooks. scene-kit.tsx: SplitWords added. globals.css:195-219: .split-mask/.split-word + reduce rule hiding [data-preloader].
- Loader vs §4.6: compliant (props, errors count as loaded, MAX_MS=6000, cleanup, reduce path). setTimeouts gate loading only.
- LOW Loader.tsx:132-135 — scroll stays locked until exit timeline completes (~2.7s); worst case ~8.7s. Call startScroll at veil fade (~1.6s) or lower MAX_MS.
- LOW Loader.tsx:66 — `history.scrollRestoration="manual"` never restored.
