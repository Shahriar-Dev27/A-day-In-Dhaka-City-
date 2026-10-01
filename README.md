<div align="center">

# 🌇 A Day in Dhaka

### One scroll, one day.

From the 4:45 AM azaan on the Buriganga to a quiet midnight street —
a scroll-driven storytelling experience built as a design-heavy portfolio piece.

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white">
  <img alt="Three.js" src="https://img.shields.io/badge/Three.js-0.186-000000?style=for-the-badge&logo=three.js&logoColor=white">
</p>

<p>
  <a href="#about">About</a> •
  <a href="#the-journey">The Journey</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#design-conventions">Design Conventions</a> •
  <a href="#credits">Credits</a>
</p>

</div>

---

## About

**A Day in Dhaka** turns a single vertical scroll into a full day in Dhaka, Bangladesh. Light, color, sound cues, and pace shift with every scene, carried by one recurring thread: a cup of tea passed between strangers from dawn to midnight.

> 🫖 **The throughline:** a tea cup travels hand to hand across all eight scenes — the one constant as the city changes around it.

## The Journey

The experience moves through eight scenes, each with its own light, motion, and emotional register:

<table>
<tr><th>#</th><th>Time</th><th>Scene</th><th>Mood</th></tr>
<tr><td>0</td><td>—</td><td>🌅 Sunrise Dot <em>(loader/intro)</em></td><td>Quiet anticipation</td></tr>
<tr><td>1</td><td>4:45 AM</td><td>🕌 Azaan on the Buriganga</td><td>Stillness, reverence</td></tr>
<tr><td>2</td><td>7:00 AM</td><td>🍵 Old Dhaka Wakes</td><td>Warmth, appetite, community</td></tr>
<tr><td>3</td><td>9:00 AM</td><td>🚦 The Rush <em>(hero scene)</em></td><td>Energy, chaos, joy</td></tr>
<tr><td>4</td><td>1:00 PM</td><td>☀️ Noon Heat</td><td>Intensity, slowness</td></tr>
<tr><td>5</td><td>4:30 PM</td><td>🕊️ Golden Hour</td><td>Freedom, nostalgia</td></tr>
<tr><td>6</td><td>7:30 PM</td><td>🌃 Neon Evening</td><td>Wonder, electricity</td></tr>
<tr><td>7</td><td>11:45 PM</td><td>🌙 Quiet City</td><td>Peace, a soft goodbye</td></tr>
</table>

Full scene-by-scene direction (camera layers, motion, Bangla/English copy, sound, the tea-cup continuity thread) lives in [`SCRIPT.md`](./SCRIPT.md). The original build plan and phase checklist is in [`A-Day-in-Dhaka-PLAN.md`](./A-Day-in-Dhaka-PLAN.md).

## Tech Stack

<table>
<tr><th>Area</th><th>Choice</th></tr>
<tr><td>Framework</td><td><a href="https://nextjs.org/">Next.js</a> (App Router) + TypeScript</td></tr>
<tr><td>Styling</td><td><a href="https://tailwindcss.com/">Tailwind CSS v4</a> + CSS variables for the time-of-day palette</td></tr>
<tr><td>Smooth scroll</td><td><a href="https://github.com/darkroomengineering/lenis">Lenis</a></td></tr>
<tr><td>Animation</td><td><a href="https://gsap.com/">GSAP</a> + ScrollTrigger</td></tr>
<tr><td>3D / shaders</td><td><a href="https://docs.pmnd.rs/react-three-fiber">React Three Fiber</a> + drei (fog, light trails)</td></tr>
<tr><td>Illustration</td><td>Hand-authored inline SVG, animated with GSAP</td></tr>
<tr><td>Hosting</td><td><a href="https://vercel.com/">Vercel</a></td></tr>
</table>

## Getting Started

Requires **Node.js 18.18+** (Next.js 16) and **npm**.

```bash
# clone & install
git clone https://github.com/<your-username>/a-day-in-dhaka.git
cd a-day-in-dhaka
npm install

# start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and scroll.

<details>
<summary><strong>📜 Available scripts</strong></summary>
<br>

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the test suite (`node --test`) |

</details>

## Project Structure

<details open>
<summary><strong>📁 Expand file tree</strong></summary>

```
app/
  layout.tsx              # root layout, fonts, metadata, default palette
  page.tsx                # mounts <Experience />
  globals.css             # grain texture, CSS variable theme
  icon.svg / apple-icon.tsx / opengraph-image.tsx

components/
  Experience.tsx          # Lenis + GSAP master timeline setup
  Loader.tsx
  ClockProgress.tsx        # sun/clock UI tied to scroll progress
  QuietPage.tsx
  scenes/
    Scene0Intro.tsx … Scene7Midnight.tsx
    scene-kit.tsx          # shared scene scaffolding / timeline hook
    story-kit.tsx           # recurring stroller + tea-cup state art
    LightTrails.tsx          # Scene 6 light-trail shader wrapper
    PigeonSwarm.tsx           # Scene 5 pigeon flock (Canvas2D)

shaders/
  lightTrail.ts            # GLSL for the Scene 6 light-trail effect

lib/
  gsap.ts                  # GSAP plugin registration
  scroll.ts                # Lenis + ScrollTrigger sync
  palette.ts                # time-of-day color tokens
  scenes.ts                 # scene metadata, scroll offsets, clock mapping
  fonts.ts                  # self-hosted Google fonts (next/font)
  device.ts                 # device-tier detection (high/low)

docs/
  assets.md                 # asset & licence log
  superpowers/               # design specs & plans

tests/
  lib.test.mjs
```

</details>

## Design Conventions

- 🎬 One component per scene; each owns its GSAP timeline and cleans up on unmount (`gsap.context` + `ctx.revert()`)
- 🖱️ All story motion is driven by `ScrollTrigger` scrub — no timers
- 🎨 Scene colors come from `lib/palette.ts` CSS variables; never hardcoded in components
- ♿ Every scene has a `prefers-reduced-motion` path (opacity-only, no parallax) while keeping all story text present
- ⚡ Device tiering (`lib/device.ts`) scales effects down (e.g. pigeon count, shader usage) on lower-end hardware

## Credits

<div align="center">

Designed and built by **Shahriar Islam Dip**

Asset sourcing and licensing details are tracked in [`docs/assets.md`](./docs/assets.md) — fonts are self-hosted via `next/font/google` (SIL OFL); illustration and shader work is original to this project.

</div>
</content>
