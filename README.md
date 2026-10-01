# A Day in Dhaka

> One scroll, one day. From the 4:45 AM azaan on the Buriganga to a quiet midnight street — a scroll-driven storytelling site built as a design-heavy portfolio piece.

![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.186-000000?logo=three.js&logoColor=white)

---

## About

**A Day in Dhaka** turns a single vertical scroll into a full day in Dhaka, Bangladesh. Light, color, sound cues, and pace shift with every scene, carried by one recurring thread: a cup of tea passed between strangers from dawn to midnight.

The experience moves through eight scenes:

| # | Time | Scene | Mood |
|---|------|-------|------|
| 0 | — | Sunrise Dot (loader/intro) | Quiet anticipation |
| 1 | 4:45 AM | Azaan on the Buriganga | Stillness, reverence |
| 2 | 7:00 AM | Old Dhaka Wakes | Warmth, appetite, community |
| 3 | 9:00 AM | The Rush | Energy, chaos, joy (hero scene) |
| 4 | 1:00 PM | Noon Heat | Intensity, slowness |
| 5 | 4:30 PM | Golden Hour | Freedom, nostalgia |
| 6 | 7:30 PM | Neon Evening | Wonder, electricity |
| 7 | 11:45 PM | Quiet City | Peace, a soft goodbye |

Full scene-by-scene direction (camera layers, motion, Bangla/English copy, sound, the tea-cup continuity thread) lives in [`SCRIPT.md`](./SCRIPT.md). The original build plan and phase checklist is in [`A-Day-in-Dhaka-PLAN.md`](./A-Day-in-Dhaka-PLAN.md).

## Tech stack

| Area | Choice |
|------|--------|
| Framework | [Next.js](https://nextjs.org/) (App Router) + TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) + CSS variables for the time-of-day palette |
| Smooth scroll | [Lenis](https://github.com/darkroomengineering/lenis) |
| Animation | [GSAP](https://gsap.com/) + ScrollTrigger |
| 3D / shaders | [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + drei (fog, light trails) |
| Illustration | Hand-authored inline SVG, animated with GSAP |
| Hosting | [Vercel](https://vercel.com/) |

## Project structure

```
app/
  layout.tsx            # root layout, fonts, metadata, default palette
  page.tsx              # mounts <Experience />
  globals.css           # grain texture, CSS variable theme
  icon.svg / apple-icon.tsx / opengraph-image.tsx

components/
  Experience.tsx         # Lenis + GSAP master timeline setup
  Loader.tsx
  ClockProgress.tsx       # sun/clock UI tied to scroll progress
  QuietPage.tsx
  scenes/
    Scene0Intro.tsx … Scene7Midnight.tsx
    scene-kit.tsx         # shared scene scaffolding / timeline hook
    story-kit.tsx          # recurring stroller + tea-cup state art
    LightTrails.tsx        # Scene 6 light-trail shader wrapper
    PigeonSwarm.tsx         # Scene 5 pigeon flock (Canvas2D)

shaders/
  lightTrail.ts           # GLSL for the Scene 6 light-trail effect

lib/
  gsap.ts                 # GSAP plugin registration
  scroll.ts               # Lenis + ScrollTrigger sync
  palette.ts               # time-of-day color tokens
  scenes.ts                # scene metadata, scroll offsets, clock mapping
  fonts.ts                 # self-hosted Google fonts (next/font)
  device.ts                # device-tier detection (high/low)

docs/
  assets.md                # asset & licence log
  superpowers/              # design specs & plans

tests/
  lib.test.mjs
```

## Getting started

Requires Node.js 18.18+ (Next.js 16) and npm.

```bash
# install dependencies
npm install

# start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the test suite (`node --test`) |

## Design conventions

- One component per scene; each owns its GSAP timeline and cleans up on unmount (`gsap.context` + `ctx.revert()`).
- All story motion is driven by `ScrollTrigger` scrub — no timers.
- Scene colors come from `lib/palette.ts` CSS variables; never hardcoded in components.
- Every scene has a `prefers-reduced-motion` path (opacity-only, no parallax) while keeping all story text present.
- Device tiering (`lib/device.ts`) scales effects down (e.g. pigeon count, shader usage) on lower-end hardware.

## Credits

Designed and built by **Shahriar Islam Dip**. Asset sourcing and licensing details are tracked in [`docs/assets.md`](./docs/assets.md) — fonts are self-hosted via `next/font/google` (SIL OFL), illustration and shader work is original to this project.
