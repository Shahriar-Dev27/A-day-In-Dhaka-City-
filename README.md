# A Day in Dhaka: Mama's Tong

<span lang="bn">একটি দিন, ঢাকায়</span>

A scroll-driven illustrated story. One neighbourhood chai stall (a *tong*) and the people around it, followed through an ordinary late-October working day in Dhaka, from the first cup at 4:45 AM to a phone call at 11:45 PM. You scroll; the day moves, forwards or backwards. Bangla is the main voice, with small English subtitles.

The storyboard idea: the city is seen from one fixed corner. The stall, its regulars, a notebook of unpaid tabs (*বাকির খাতা*) and a single hanging bulb carry the story, while the light, palette and pace change with the hour. The visual language is printed and flat: solid fills, wobbled edges, halftone, paper specks.

## Scenes

| # | Time | Scene |
| :-: | :-- | :-- |
| 0 | Before dawn | The opening bulb and the title. |
| 1 | 4:45 AM | Fajr. The stall wakes and the first cup is poured. |
| 2 | 7:00 AM | Morning. "পরে দিয়েন" ("pay me later") and the notebook. |
| 3 | 9:00 AM | The jam. Traffic, horns and a street at a standstill. |
| 4 | 9:40 AM | Metro Rail, six emotional beats. |
| 5 | 1:00 PM | Noon heat. |
| 6 | 4:30 PM | Rooftop. Kites and pigeons. |
| 7 | 7:30 PM | Evening adda at the stall. |
| 8 | 11:45 PM | Closing phone call and credits ("কাল আবার।"). |

Total scroll length is set in `lib/scenes.ts` (about 2140svh at the time of writing).

## Tech stack

From `package.json`:

- Next.js 16 (App Router), React 19, TypeScript (strict)
- Tailwind CSS 4
- GSAP + `@gsap/react` (ScrollTrigger for scroll-scrubbed timelines)
- Lenis (smooth scrolling)
- Canvas 2D (pigeon flock) and plain WebGL (light trails); no three.js
- Inline SVG for all illustration; no raster images, no audio at launch
- Fonts through `next/font/google` (Noto Serif Bengali, Hind Siliguri, Baloo Da 2)

## Getting started

Node.js 20.9 or newer is required (24 recommended; the tests run TypeScript through Node's type stripping).

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # scene timing, palette contrast, scene-specific layout checks
npm run lint
npm run build   # production build; needs access to Google Fonts for next/font
```

For absolute social-image URLs set `NEXT_PUBLIC_SITE_URL` to the deployed origin (falls back to `VERCEL_PROJECT_PRODUCTION_URL`, then `http://localhost:3000`). No production domain is configured yet.

## Project structure

```text
app/                 Layout and metadata, page, error pages, generated OG image and icons
components/
  Experience.tsx     Scene loading, master sky timeline, clock
  scenes/
    SceneN*.tsx      One entry file per scene (0 to 8)
    tong/            The stall set, cast and shared riso patterns (scenes 1, 2, and reused later)
    jam/ metro/ adda/ closing/ rooftop/ noon/ intro/   Per-scene art, layout and CSS
    PigeonSwarm.tsx  Canvas 2D flock
    LightTrails.tsx  WebGL light trails
lib/                 Scene registry and scroll offsets, palette, copy (Bangla + English), device tiers, fonts
shaders/             GLSL for the light trails
tests/               node:test checks
docs/                Storyboard, asset log
.devteam/            Planning and per-phase handoff notes for the v2 rebuild
```

## Conventions

- **Tokens.** Colour comes from `lib/palette.ts` and is written to CSS custom properties on `<html>`; scenes read the variables instead of hard-coded colours.
- **Scrub-only story motion.** Story animation is tied to scroll position (scrubbed), so it can be run backwards and never plays on its own timer.
- **Reduced motion.** With `prefers-reduced-motion` the story is shown as static compositions; scenes branch through `gsap.matchMedia`.
- **Device tiers.** `lib/device.ts` picks a high or low tier (fewer pigeons, SVG streaks instead of WebGL). Force the light path with `/?tier=low`.
- **Bangla spans** carry `lang="bn"`; the document is `lang="en"`.

## Status and known limitations

- Bangla copy in `lib/copy.ts` is pending native-speaker review.
- Metro (scene 4) details are still to be confirmed.
- Performance has not been tested on real mobile devices.
- The social card (`app/opengraph-image.tsx`) shows the English title only; satori mis-shapes Bengali conjuncts, so the Bangla title lives in the page `<title>` instead.
- `app/favicon.ico` predates the v2 icon and still shows the old mark.

## Docs

- [Storyboard v2](./docs/storyboard/SCRIPT-v2.md) (current script)
- [Asset and licence log](./docs/assets.md)
- [v2 plan](./.devteam/dhaka-v2-tong/01-plan.md) and [summary](./.devteam/dhaka-v2-tong/SUMMARY.md)
- [SCRIPT.md](./SCRIPT.md) and [A-Day-in-Dhaka-PLAN.md](./A-Day-in-Dhaka-PLAN.md) are the original v1 documents, kept for history.

## Credits

Designed and built by Shahriar Islam Dip. All illustration, patterns and shaders are original to this project; fonts are SIL OFL 1.1 (see the asset log).
