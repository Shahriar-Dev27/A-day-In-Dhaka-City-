# A Day in Dhaka: Development Plan

> A scroll-driven storytelling website. One scroll equals one day in Dhaka, from the 4:45 AM azaan to the quiet midnight street. Built as a design-heavy portfolio piece.

**How to use this file with Claude Code:** Put this file in the project root. Work one phase at a time. Do not start a phase until the previous phase's checkpoint passes. Tick the checkboxes as tasks finish. Ask me before changing scope, the stack, or the scene list.

> **v2 amendments (2026-10).** The site is now nine scenes, not eight: Metro Rail was added by the user's decision. The tea-cup thread was replaced by one chai stall (Mama's Tong) followed through the day. Current plan and interface contract: `.devteam/dhaka-v2-tong/01-plan.md`. Sections below describe v1 where they differ.


---

## 1. Project summary

- **Logline:** The visitor scrolls through one full day in Dhaka. Light, color, sound, and pace change with each scene.
- **Feeling:** Dhaka is chaotic, warm, and beautiful, and the whole day is one breath.
- **Success:** A visitor who scrolls for 60 seconds understands the story and remembers at least one scene.
- **Audience:** Recruiters, clients, and designers viewing a portfolio.

## 2. Tech stack (fixed unless I approve a change)

| Area | Choice |
|------|--------|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + CSS variables for the time-of-day palette |
| Scroll | Lenis (smooth scroll) |
| Animation | GSAP + ScrollTrigger |
| 3D / shaders | React Three Fiber + drei (fog, water, light trails only) |
| Illustration motion | Inline SVG animated with GSAP; Lottie only if needed |
| Audio | Howler.js |
| Hosting | Vercel |

## 3. Project structure

```
/app
  layout.tsx
  page.tsx                 # mounts <Experience />
/components
  Experience.tsx           # Lenis + GSAP master timeline setup
  Loader.tsx
  ClockProgress.tsx        # sun/clock UI tied to scroll
  AudioToggle.tsx
  scenes/
    Scene0Intro.tsx
    Scene1Azaan.tsx
    Scene2OldDhaka.tsx
    Scene3Rush.tsx
    Scene4Noon.tsx
    Scene5GoldenHour.tsx
    Scene6Neon.tsx
    Scene7Midnight.tsx
  shaders/                 # fog, light-trail GLSL
/lib
  gsap.ts                  # plugin registration
  scroll.ts                # Lenis + ScrollTrigger sync
  palette.ts               # time-of-day colors
/public
  svg/  textures/  audio/  fonts/
/docs
  storyboard/  case-study.md
```

## 4. Conventions

- One component per scene. Each scene exports its own GSAP timeline setup and cleans up on unmount (`gsap.context` + `ctx.revert()`).
- All scroll animation is driven by ScrollTrigger scrub. No timers for story motion.
- Colors come from CSS variables set by `palette.ts`. Never hardcode scene colors in components.
- Animate only `transform` and `opacity` where possible.
- Every scene must work with `prefers-reduced-motion` (simple fades, no parallax).
- Mobile gets simpler effects, but the same story and scene order.
- Commit after each completed task. Commit message format: `scene-3: add rickshaw layer parallax`.

## 5. Scene list (the source of truth)

| # | Time | Scene | Visual idea | Key motion | Palette |
|---|------|-------|-------------|------------|---------|
| 0 | Loader | Sunrise dot | A circle of light grows into the title | Text reveal, scroll prompt | Indigo to soft gold |
| 1 | 4:45 AM | Azaan on the Buriganga | Foggy river, silhouette boats | Fog parallax, slow sky gradient | Deep indigo, teal |
| 2 | 7:00 AM | Old Dhaka wakes | Chai stalls, steam, paratha frying | Steam particles, horizontal pan | Saffron, warm orange |
| 3 | 9:00 AM | The rush | Rickshaw art, buses, crowds, bold Bangla type | Fast horizontal scroll, layered vehicles | Saturated multicolor |
| 4 | 1:00 PM | Noon heat | Bright flat color, short shadows | Sun arc, shadow length tied to scroll | White-hot yellow |
| 5 | 4:30 PM | Golden hour | Kite-filled rooftops, pigeons | Kite drift, pigeon flock | Gold, haze |
| 6 | 7:30 PM | Neon evening | Lights switch on, markets, traffic trails | Light-trail shader, glow on scroll | Magenta, cyan |
| 7 | 11:45 PM | Quiet city | Empty street, one lamp, lone rickshaw | Slow zoom out, credits | Near-black blue |

**Stretch goal:** a "Your Dhaka" one-word message at the end (only after launch).

**Cut order if time runs short:** Scene 4, then Scene 5. Never cut Scenes 0, 1, 3, 6, 7.

---

## 6. Phases and tasks

### Phase 1: Story and design (Week 1 to 2)
- [ ] Write a one-line emotion and a short script for each scene in `/docs/storyboard/`
- [ ] Build a moodboard (references for color, type, illustration style)
- [ ] Pick fonts: one Bangla display face, one clean sans, one chunky face for rickshaw-art moments
- [ ] Define the palette per scene and add it to `lib/palette.ts` as design tokens
- [ ] Storyboard all 8 scenes (Figma or sketches) with scroll behavior notes
- [ ] Write the 60-second story summary

**Checkpoint 1:** Storyboard and palette approved by me. No coding past this point until approved.

### Phase 2: Asset production (Week 2 to 4)
- [ ] Define the illustration style once (flat vector, grain texture, rickshaw-art influence)
- [ ] Illustrate each scene in layers: background, midground, foreground, characters
- [ ] Export optimized SVGs and WebP textures into `/public`
- [ ] Prepare audio loops (royalty-free or self-recorded), under 300 KB each
- [ ] Keep an asset log with sources and licenses in `/docs/assets.md`

**Checkpoint 2:** Every scene has final art. Total first-scene assets are under 5 MB.

### Phase 3: Skeleton (Week 4 to 5)
- [ ] Initialize Next.js + TypeScript + Tailwind, deploy an empty page to Vercel
- [ ] Register GSAP plugins in `lib/gsap.ts`
- [ ] Set up Lenis and sync it with ScrollTrigger in `lib/scroll.ts`
- [ ] Build `Experience.tsx` with a master timeline and 8 placeholder scene sections
- [ ] Build `ClockProgress.tsx` (sun/clock arc driven by scroll progress)
- [ ] Animate the page background gradient across the day using palette tokens
- [ ] Add dev-only scene jump links for fast testing

**Checkpoint 3:** Scroll feels smooth end to end with placeholders, and the sky changes through the day.

### Phase 4: Scenes (Week 5 to 8)
Build in this order. Finish and test each scene before the next.

- [ ] **Scene 1** Azaan: layered fog parallax, boats, sky shift
- [ ] **Scene 3** Rush: horizontal scroll section, layered vehicles, Bangla type
- [ ] **Scene 2** Old Dhaka: pan, steam particles
- [ ] **Scene 6** Neon: light-trail shader, glow on scroll
- [ ] **Scene 7** Midnight: slow zoom out, credits
- [ ] **Scene 5** Golden hour: kites, pigeon flock
- [ ] **Scene 4** Noon: sun arc, shadow length
- [ ] **Scene 0** Intro and `Loader.tsx`: build last so it matches the final tone

For each scene, done means:
- Matches the storyboard
- Runs at 60fps on a mid-range phone
- Has a reduced-motion version
- Cleans up its timelines and listeners on unmount

**Checkpoint 4:** Full scroll-through works with every scene complete.

### Phase 5: Polish and performance (Week 8 to 9)
- [ ] Smooth transitions between scenes (no hard cuts)
- [ ] Audio: muted by default, clear toggle, crossfade between scenes
- [ ] Mobile pass: reduce or disable shaders on low-end devices
- [ ] Lazy-load assets per scene
- [ ] Lighthouse pass (performance 85+, accessibility 90+)
- [ ] Test on Chrome, Safari, Firefox, and a real Android phone
- [ ] Add meta tags, social preview image, favicon

**Checkpoint 5:** 60fps on a mid-range phone, first scene loads in under 3 seconds on a normal connection.

### Phase 6: Launch and case study (Week 10)
- [ ] Deploy to production on Vercel, connect the custom domain
- [ ] Record a 30-second reel and a short mobile capture
- [ ] Write `/docs/case-study.md`: story, design decisions, tech, problems solved, what I would improve
- [ ] Add the project to the portfolio site with the reel and live link

**Checkpoint 6:** Live URL, reel, and case study published.

---

## 7. Risks

| Risk | Plan |
|------|------|
| Scope creep | Eight scenes only. Use the cut order above. |
| Heavy assets | SVG and WebP only, lazy-load per scene. |
| Mobile lag | Disable shaders on low-end devices, keep simpler motion. |
| Illustration time | Fall back to bold geometric silhouettes in the same palette. |
| Copyright | Own art, licensed fonts, royalty-free audio, all logged in `/docs/assets.md`. |

## 8. Definition of done

- Runs smoothly on desktop and mobile
- Every scene has a clear emotion and one unique motion moment
- Story is understandable in a 60-second scroll
- Reduced-motion users get a clean experience
- Live URL, reel, and case study are ready for the portfolio

## 9. First prompt to give Claude Code

```
Read A-Day-in-Dhaka-PLAN.md. Start Phase 3, tasks 1 to 3 only
(Next.js + TypeScript + Tailwind setup, GSAP registration,
Lenis + ScrollTrigger sync). Follow the conventions in section 4.
Stop after those tasks and show me what you built.
```
