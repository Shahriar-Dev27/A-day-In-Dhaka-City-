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
- Inline SVG for all illustration; no raster images; opt-in Bangla voices (offline WAV files) and synthesized city ambience
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

## Docs

- [Storyboard v2](./docs/storyboard/SCRIPT-v2.md) (current script)
- [Asset and licence log](./docs/assets.md)
- [SCRIPT.md](./SCRIPT.md) is the original v1 script, kept for history.

## Credits

Designed and built by Shahriar Islam Dip. All illustration, patterns and shaders are original to this project; fonts are SIL OFL 1.1 (see the asset log).

## Sound

Use the **Sound off / Sound on** button in the top-left corner. Sound is off on each page load. With it on:

- **Ambience**: a synthesized bed per scene (night crickets, tea-stall murmur, traffic and horns, metro hum, midday heat, rooftop wind, evening adda) that crossfades as you scroll. It is built in the browser, so there is nothing to download.
- **Voices**: every Bangla line is spoken when its caption appears: the narration, the overheard dialogue, the metro announcement, the jam's sign words, the title and the closing line. One voice at a time; a line is not cut off the moment its caption leaves (it gets 1.5 s of grace), and the ambience dips while someone speaks. Use the **Voices** button to keep ambience without speech. Playback stops in a hidden tab.

Captions are tagged `data-voice`; the player speaks whichever tagged captions are visible, so no scene timing is duplicated in the audio code. Voice files load only when sound is on, a scene ahead of time.

To regenerate after editing `lib/copy.ts` (Node 24 recommended):

```powershell
npm.cmd run audio:generate -- "E:\Professional\Web\claude\bangla-tts"
```

The generator uses that folder's `.venv` and existing model weights, keeps the raw clips in `.audio-raw/` (git-ignored), and writes the mastered WAVs to `public/audio/voice/`, `public/audio/narration.json` and `docs/narration-review.md`. Add `--only s2-o0,s5-n` to redo some clips. To fix a mispronounced line, put a respelled version in `scripts/pronunciation.json` (`{ "s5-n": "..." }`) and regenerate that clip. `npm run audio:master` re-applies the mastering settings to the saved raw clips without the TTS. Settings: speed 0.85, punctuation pauses 1.2, 200 Griffin-Lim iterations (`BANGLA_TTS_ITERS`). For another installation, supply its path; set `BANGLA_TTS_PYTHON` if its interpreter is elsewhere, or `BANGLA_TTS_DIR` to omit the path argument. Deploy the WAVs with the app; the local TTS folder is needed only to regenerate. Listen to the clips as part of the pending native Bangla review.
