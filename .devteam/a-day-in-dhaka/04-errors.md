# 04 — Error review (error-detector, persisted by orchestrator; the agent is read-only)

`tsc`, `lint` and `build` pass clean. Grep-clean: no hex/rgb in components/app, no `pin:`, no timers/rAF/useState story motion, no `any`, no overflow-hidden ancestors.

| # | Sev | Location | Issue | Fix |
|---|---|---|---|---|
| 1 | Medium | Scene1Azaan.tsx:25-28, Scene2OldDhaka.tsx:26-27 | Tweens lack `duration`; GSAP defaults 0.5, so motion finishes at 50% of scrub then sits still | `duration: 1` |
| 2 | Medium | Scene3Rush.tsx:82 | Last segment `back.out(1.6)` overshoots past `-T` (~180px gap at 1440) | non-overshoot ease |
| 3 | Medium | Scene7Midnight.tsx:33 | Lamp `scale` tween outside `mode==="full"`; reduced motion still zooms (§4.3.4, AC-D4) | opacity-only in reduce branch |
| 4 | Medium | Experience.tsx:33-47 | `next/dynamic` only splits code; scenes 2-7 all fetched at hydration (AC-P4, rule 10) | gate mount on proximity (IntersectionObserver in SceneSlot) |
| 5 | Low | scene-kit.tsx:78, Experience.tsx | Stage `h-svh` vs `innerHeight` lvh when mobile URL bar collapses; sky strip + ~1% anchor drift | test on device |
| 6 | Low | Scene7Midnight.tsx:33 | Lamp scale treats `LIGHT_DOT.sizePx` as SVG units; Scene 0 circle r=64 units, loop doesn't close | convert units |
| 7 | Low | Experience.tsx:29 | 6 lazy mounts each call full `ScrollTrigger.refresh()` | coalesce |
| 8 | Low | Scene2/4/5 | English lines 8/9/8 words (AC-S6 wants <8). Verbatim SCRIPT | decision |
| 9 | Low | Experience.tsx:116 | Server snapshot `reducedMotion=false` → Lenis created then destroyed for reduce users | |
| 10 | Low | Experience.tsx | 7 root CSS vars written per frame; `SceneText` may overlap ClockProgress on short landscape | |

## Scroll-window recommendation (150svh slots = only 50svh scrub window)
Change default `start` in `scene-kit.tsx:40` to `"top 70%"`, keep `end: "bottom bottom"` → 120svh window. Keep `top top` for Scene 3 and Scene 0. Fix #1 first. If still rushed at Checkpoint 3, set `scrollLength` 200 for scenes 1,2,4,5,6,7.
