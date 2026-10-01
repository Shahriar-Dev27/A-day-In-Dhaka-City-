# A Day in Dhaka: Tea-Cup Storytelling Implementation Plan

> **For implementers:** Read the linked spec and storyboard first. Execute the tasks sequentially, one scene per review gate. Use the `executing-plans` workflow when implementing; do not start parallel scene work. Checkboxes track execution, not work completed by this document.

**Goal:** Turn the existing eight-scene Dhaka tour into the tea-cup story described in the pending-review spec while completing the original storyboard's unfinished scenes and launch checks.

**Architecture:** Keep the existing Next.js page, scene slots, CSS-sticky stages, global sky, clock, Lenis, and GSAP timeline contract. Add one shared close-beat kit, then extend each scene's inline art and local `COPY`. Preserve the existing city text verbatim until a native Bangla and word-count review decides otherwise.

**Tech stack:** Installed Next.js 16.3.8, React 19, TypeScript, Tailwind 4, GSAP, Lenis. Add the plan's R3F packages only when implementing Scene 6's required high-tier light trails; no other new dependency is planned.

**Sources of truth:** [development plan](../../../A-Day-in-Dhaka-PLAN.md), [scene storyboard](../../../SCRIPT.md), [tea-cup design spec](../specs/2026-10-01-tea-cup-story-thread-design.md), [interface contract](../../../.devteam/a-day-in-dhaka/01-plan.md), [QA record](../../../.devteam/a-day-in-dhaka/05-qa.md), and [recorded assumptions](../../../.devteam/a-day-in-dhaka/00-assumptions.md).

**Planning status:** The tea-cup spec is marked “approved in brainstorming, pending spec review.” This document makes its two internal conflicts explicit and is ready for review before code execution.

## Global constraints and assumptions

- Eight scenes, numbered 0–7, remain in the same order. No face, name, age, backstory, extra dialogue, explanatory story caption, interaction branch, or launch audio.
- The stroller is recognized by silhouette, shawl, sleeves, and hands. The glass is a small, thick-walled, handleless amber chai glass held at the rim. The dog and puller must remain visually recognizable on their return.
- Keep Bangla city copy and English subtitles as real DOM text with `lang` attributes. New close copy stays in each scene's typed `COPY` constant. Native review of all Bangla, especially colloquial dialogue, is a launch gate.
- Scroll story motion uses the existing scrubbed `useSceneTimeline`; no ScrollTrigger `pin`, per-frame React state, story timers, or scene-local hex colors. Reduced motion still shows every wide and close composition and all applicable text through opacity changes only.
- Scene 1's `CupState: none` means **deliberately empty hands**, establishing desire for tea. The spec's AC-T2 should be worded as “the cup state, including its deliberate absence in Scene 1, is readable.” Do not draw a cup at 4:45 AM merely to satisfy the current wording.
- The new Scene 7 action is the resting puller receiving the untouched cup. It replaces the old storyboard action of a puller pedaling home; update `SCRIPT.md` when the scene is built.
- Sound was deferred at launch in `00-assumptions.md`. `AudioToggle`, `lib/audio.ts`, and audio assets are not missing launch code under that decision. The optional Scene 1 water shader and speculative fog shader stay omitted.
- Final illustrations and credit URLs are user-supplied. Keep the existing geometric art as a valid interim fallback; never add empty `/public` folders or fake links solely to match the plan tree.
- The repository currently has unrelated working changes in `Scene1Azaan.tsx` and `04b-errors-scene1.md`. Inspect `git status` before implementation and preserve them. The project plan says the user makes commits.

## Start here: reconcile the evidence

| Item | Current evidence | Action |
|---|---|---|
| QA-1 text flash, QA-2 sky/text contrast, QA-3 error logging, QA-4 Lenis cleanup | Marked fixed and browser-verified in `05-qa.md`; shared code contains the fixes | Keep as regression checks. Do not re-implement. |
| Scroll velocity units | `lib/scroll.ts` already samples signed px/s and exposes `getScrollVelocityNorm()` | Use it for Scene 3 level cup/wheels, Scene 5 flock direction, and Scene 6 trails. |
| Tea-cup thread | `story-kit.tsx`, seven close beats, cast recurrence, new lines, and final gift are absent | Tasks 2–9. |
| Scroll budget | `lib/scenes.ts` still totals 1400svh; spec requires 1770svh | Task 3, after the Scene 1 rhythm gate. |
| QA-5 | Scene 3 word crosses its subtitle; Scene 5 kite lowers mobile subtitle contrast | Fix when replacing those compositions; rerun pixel contrast checks. |
| Original storyboard scenes | Scene 1 is developed fallback art; Scenes 2–7 retain schematic or partial moments | Finish each scene in the original Phase 4 order. |
| Older low items | `svh`/URL-bar behavior, 8/9/8-word English lines, root CSS-var cost, Scene 1 transition, Loader cleanup | Resolve at the relevant scene or final device gate; do not broaden an earlier task. |
| Release material | Credit links, social preview/apple icon, native copy approval, device/browser evidence, case study | Tasks 10–11; case study and domain remain launch work. |

## Story direction: what every scene must communicate

**Premise:** At 4:45 AM someone wants tea. At 11:45 PM they give tea away and walk home with empty hands. The viewer should understand this from actions before reading the close lines.

**Story question:** Who will receive the second cup? Open it visibly in Scene 6 and answer it silently in Scene 7.

**New close copy (pending native Bangla review):**

| Scene | Register | Bangla | English |
|---|---|---|---|
| 1 | Stroller | ঠান্ডা। এক কাপ চা দরকার। | Cold. I need a cup of tea. |
| 2 | Spoken, seller | “পরে দিয়েন।” | “Pay me later.” |
| 3 | Stroller | শুধু কাপটা যেন না পড়ে। | Just don't let it spill. |
| 4 | Stroller | চা ঠান্ডা, ছায়া ভাগাভাগি। | Cold tea, shared shade. |
| 5 | Spoken, stroller | “এটা তোমার।” | “This is yours.” |
| 6 | Spoken, stroller | “দুই কাপ। আর সকালেরটাও।” | “Two cups. And this morning's too.” |
| 7 | None | — | — |
| After credits | Closing | কাল আবার। | Again tomorrow. |

| Scene | Wide city moment | Close human turn and cup state | Recurring clue |
|---|---|---|---|
| 0 | A warm circle and title | No figure; the circle is later understood as tea reflected in the lamp | Circle position/size establishes the ending target. |
| 1, 4:45 | Buriganga fog and azaan | Cold hands breathe into palms; a dog sits down; **none** | Same dog silhouette must return in Scene 7. |
| 2, 7:00 | Old Dhaka stall, steam, paratha, people | Seller pours unasked and waves off payment; **full** | Spoken “Pay me later” opens a debt. |
| 3, 9:00 | Rush, rickshaws, buses, type, brief jam | A child crosses during the jam; raised **half** cup stays level | The jam helps someone rather than just obstructing traffic. |
| 4, 1:00 | Noon sun, vendor, heat, stopped rickshaw | Stroller and puller share shade without speaking; **cold** glass sits between them | Give the puller one repeatable rickshaw/garment mark. |
| 5, 4:30 | Rooftops, kites, pigeons, cut string | A child reaches the fallen kite; stroller returns it; **empty** glass on ledge | Spoken “This is yours” rehearses the final gift. |
| 6, 7:30 | Market lights, wet road, trails | Stroller pays morning debt and buys two cups, drinks one and carries one; **refilled** | Spoken “Two cups. And this morning's too.” opens the final question. |
| 7, 11:45 | Quiet street and one lamp | Stroller leaves **given** cup by the resting Scene 4 puller; dog follows; tea reflection becomes Scene 0 dot | No close text. “Again tomorrow” appears only after the credits beat. |

### Storyboard and asset instructions

For each scene, make a one-page brief with these nine fields: **emotion; viewer question; wide frame; close frame; visible human action; cup state; one change of meaning; outgoing visual clue; mobile/reduced-motion equivalent**. Draw the wide and close frames at 1440×900 and 390×844 before polishing motion. At mobile width, the cup, hand, and receiving gesture must read without zooming or relying on a caption. Scene 1's existing art notes show that the 390px portrait crop uses roughly SVG x=592–1008; test the crop rather than assuming it.

Use the same silhouette geometry and cup proportions in all seven scenes. Vary lighting and pose rather than redesigning the protagonist. Keep hands and cup on a local close-beat backdrop so text contrast does not depend on the interpolating sky. Leave the upper-left `SceneText` area clear of kites, vehicle words, and high-contrast art. Avoid text baked into SVG, generic stock photos, copyrighted shop brands, and identifiable faces.

**Reusable art brief for a human illustrator or image-generation pass:** “Dhaka at [time], [scene-specific location and action]. Flat geometric vector shapes with subtle grain, layered background/midground/foreground/characters, the recurring faceless shawled stroller and small handleless amber chai glass. Preserve a text-safe upper-left area and a portrait focal area; no lettering, logos, faces, or dialogue in the image. Export separable layers with source/licence notes.” Treat generated raster art as concept reference until it is adapted into the site's layered style and logged in `docs/assets.md`.

## File map

| File | Responsibility |
|---|---|
| `components/scenes/story-kit.tsx` **new** | `Cup`, `Figure`, `CloseBeat`, `FigureLine`; semantic tokens and GSAP `data-*` hooks only. |
| `components/scenes/scene-kit.tsx` | One full/reduced wide-to-close timeline and three text registers. Preserve the existing pre-hide fix. |
| `components/scenes/Scene1Azaan.tsx` … `Scene7Midnight.tsx` | Each owns city art, cast silhouettes, local copy, and one close composition. |
| `components/scenes/Scene0Intro.tsx` | Final reflection-to-title visual continuity; no new character. |
| `lib/scenes.ts`, `tests/lib.test.mjs` | 1770svh budget, derived offsets, clock and sky/text windows, one concise regression check. |
| `SCRIPT.md` | Final authoritative storyboard after the scenes match the spec. Move to `docs/storyboard/` only if the user requests the move. |
| `docs/assets.md`, `public/svg/scene-N/*`, `public/textures/*` | Add rows/files only for art actually shipped; inline SVG remains acceptable fallback. |
| `components/scenes/PigeonSwarm.tsx`, `components/scenes/LightTrails.tsx`, `shaders/lightTrail.ts` | Add at their scene task if needed for the required flock/shader; keep low-tier/reduced SVG fallback. |
| `app/layout.tsx`, `app/opengraph-image.*`, `app/apple-icon.*` | Final metadata and social assets using the installed Next version's file conventions. |

**Missing paths today:** `story-kit.tsx`; the Scene 5 flock and Scene 6 light-trail files; final `/public` art; the social image/apple icon; `docs/storyboard/SCRIPT.md`; and `docs/case-study.md`. The storyboard's content exists at root `SCRIPT.md`. The flock/shader files are created with their scene behavior, final art only when approved exports exist, and the case study at launch. The intentionally deferred audio files are outside this list.

## Execution tasks and review gates

For Tasks 4–9, each scene follows the same small implementation shape: keep its existing city `COPY.time` and `COPY.line`, add the table's `COPY.close` where applicable, mark the wide art/track with `data-city`, render `CloseBeat` with the required `Cup` and `Figure`, and enable `{ close: true }` in `useSceneTimeline`. `FigureLine` appears only in Scenes 1–6, and never in Scene 7. Check full and reduced motion before calling each scene complete.

### Task 1 — Lock the story brief and baseline

**Files:** Read `SCRIPT.md`, the tea-cup spec, `01-plan.md`, `05-qa.md`, `docs/assets.md`; do not edit product code.

- [x] Record the two spec clarifications above (`none` as empty hands; resting puller supersedes pedaling) in the working story brief. Keep existing city copy intact pending review.
- [x] List the exact three spoken lines and three stroller lines from spec §5 beside the scene frames; confirm Scene 7 close is silent.
- [x] Mark QA-1 through QA-4 and velocity normalization “verify only”; mark QA-5 and older low items as open.
- [x] Check `git status`, `npm test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build`; record failures before touching the story.

**Gate:** One reviewer can point to the protagonist, debt, second cup, recipient, and loop on the storyboard without an explanatory caption.

### Task 2 — Shared kit and Scene 1 pilot

**Files:** Create `components/scenes/story-kit.tsx`; modify `scene-kit.tsx`, `Scene1Azaan.tsx`, and only the scene-local token/art files needed by Scene 1.

- [x] Implement the spec §7.1 types `CupState` and `FigurePose`, and the four components `Cup`, `Figure`, `CloseBeat`, `FigureLine`. Use `data-liquid`, `data-steam`, `data-drop`, `data-reflection`, `data-figure`, `data-close`, and `data-beat-close` hooks where relevant. Keep the cup's physical silhouette identical across scenes.
- [x] Add `close?: boolean` to `useSceneTimeline`. In full mode: city visible 0–0.36, push 0.36–0.46, close hold 0.46–0.70, pull back 0.70–0.80, wide 0.80–1. In reduce mode: opacity crossfade only, with no scale or translation. Pre-hide **all** staggered beats before the timeline, preserving QA-1's fix.
- [x] Make city text enter at 0.12 and finish exiting by 0.36; close text enters at 0.50 and finishes exiting by 0.68. Choose short tween durations that do not overlap the push/pull. Scene 7 later uses no close text.
- [x] In Scene 1 add the stroller, dog, cold hands, `CupState: none`, and its specified quiet line. Mark the wide `<Art data-city>` and call `useSceneTimeline(root, build, { close: true })`.
- [ ] Review an actual scroll at 1440×900 and 390×844, full and reduced motion. If the city/close rhythm feels rushed or makes the cup missable, revise the spec and pilot **before** touching another scene.

**Gate:** The empty-hands beat is legible, both text registers are readable, no stagger flashes, and reduced motion shows both compositions without transform motion.

### Task 3 — Extend scroll room and preserve sky contrast

**Files:** Modify `lib/scenes.ts`, `tests/lib.test.mjs`, and `components/Experience.tsx` only if the derived sky timeline needs adjustment.

- [x] Set scene slot lengths to `[100, 200, 200, 450, 200, 200, 200, 220]` svh. Expected offsets are `[0, 100, 300, 500, 950, 1150, 1350, 1550]`; total is 1770svh and scroll range is 1670svh.
- [x] Update the existing offset/total assertions. Change `BEAT_IN`, `BEAT_OUT_END`, and `textWindowSvh` to mirror the **actual** new city text window; keep the sky's dark/light inversions outside visible city copy. The close register uses its own stable backdrop.
- [x] Run `npm test`; verify all clock anchors, sky plateaus, and text contrast. Re-measure browser scroll positions rather than copying the old `05-qa.md` y values.

**Gate:** No clock jump or text/sky contrast regression; page height is 1770svh ±2%.

### Task 4 — Scene 3: the jam becomes a kindness

**Files:** Modify `Scene3Rush.tsx`; add scene art files only if they improve maintainability.

- [x] Keep the horizontal jam and large Bangla words. Add a clearly readable stranded schoolchild and stroller at city scale; let the child cross only during the stalled segment.
- [x] Close on a half-filled cup raised above the crowd. Counter-rotate the liquid against the velocity-driven shake so its surface stays level. Use the existing normalized velocity signal; no ticker under reduced motion.
- [x] Replace scroll-progress wheel spinning with in-view velocity behavior as required by the original contract. Give the art a text-safe zone to eliminate QA-5's Scene 3 overlap.

**Gate:** The jam's helpful turn reads at 390px, the liquid is level in full motion, reduce uses static composition, and the English subtitle never crosses a moving word.

### Task 5 — Scene 2: open the debt

**Files:** Modify `Scene2OldDhaka.tsx`; update `docs/assets.md` for any shipped art.

- [x] Develop the lane beyond block storefronts: recognizable chai stall, seller, kettle, small glasses, paratha/tawa, customers, signs and depth. Keep the pan and steam.
- [x] Show the seller pour without an order, hand over the hot glass, and wave off money. Close on fingertips at the rim, full tea and steam. Add only the specified spoken line; no stroller line.
- [x] Keep steam loops offscreen-paused. Verify the glass reads as chai rather than a generic mug.

**Gate:** A silent viewer can answer who supplied the first tea and why payment remains open.

### Task 6 — Scene 6: pay and carry the second cup

**Files:** Modify `Scene6Neon.tsx`; add `LightTrails.tsx` and `shaders/lightTrail.ts` only when implementing the required high-tier shader; add the R3F dependencies at this task, not earlier.

- [x] Build the market scene and individual lights, wet-road reflections, brief neon activation, and velocity-responsive trails. Mount WebGL only near the scene; `?tier=low` and reduce render an SVG/CSS fallback with no WebGL context.
- [x] Reuse the Scene 2 seller/stall visual mark. In the wide shot show payment for the morning plus two new glasses. In close, make one drunk and the other clearly carried; add the specified spoken line and no stroller line.
- [ ] Test forward, reverse and jump-to-scene scroll so the trail effect and light triggers clean up and react in the correct direction.

**Gate:** The viewer expects the carried cup to be given to someone; low-tier and reduced modes keep that information.

### Task 7 — Scene 7: silent gift and reflection

**Files:** Modify `Scene7Midnight.tsx`; later align `Scene0Intro.tsx` in Task 9.

- [x] Replace the pedaling figure with the recognizable Scene 4 puller resting beneath the lamp. The stroller sets down the extra cup without waking him; the Scene 1 dog follows out of frame.
- [x] Keep the close beat **silent**: no `FigureLine`. Show the lamp reflected as a circle in the tea, then bring it to `LIGHT_DOT.sizePx` and the Scene 0 position. The current lamp shrinking alone does not fulfill this.
- [x] Remove Scene 7's current `hold: true` treatment for city text; let that register leave before the close beat. Time the credits and closing line separately after the gift, without keeping the city line over the close shot.
- [x] Place `কাল আবার।` / “Again tomorrow.” above the restart button after the credits beat. Keep the existing city line and working restart behavior. Add portfolio/social links only when real URLs are supplied, with safe external-link attributes.

**Gate:** At 1440×900 and 390×844, the final reflection matches the intro circle within 2px; restart returns the sky/clock/intro to their initial state.

### Task 8 — Scene 5: rehearse giving

**Files:** Modify `Scene5GoldenHour.tsx`; create `PigeonSwarm.tsx` only if a separate canvas component is warranted.

- [x] Preserve the rooftops and cut-kite motion; show a child arriving for the kite and the stroller handing it back. Close on the empty glass, handoff, and the one specified spoken line.
- [x] Implement the required direction-responsive flock with the original count cap (≤40 low tier, ≤120 high tier); use a static flock under reduced motion. Pause the loop offscreen and clean it up on unmount.
- [ ] Move the mobile kite or protect the text area so the Scene 5 QA-5 subtitle contrast reaches AA over the real composition.

**Gate:** The giving action reads before Scene 7, and the 390px subtitle remains legible across the full slot.

### Task 9 — Scene 4, then Scene 0; finish the visual loop

**Files:** Modify `Scene4Noon.tsx`, `Scene0Intro.tsx`, and `SCRIPT.md`; update `docs/assets.md` if art changes.

- [x] In Scene 4 identify the puller and rickshaw with the same mark used in Scene 7. Seat the stroller in the same shade, set the cold glass between them, and allow an intentional still hold. Add the specified stroller line and no speech. Complete the original small-area heat shimmer or use the simplest treatment that visibly conveys heat and meets phone performance.
- [x] In Scene 0 preserve the title and loader behavior; align its circle with the final tea reflection. Update `SCRIPT.md` with all seven human beats, the three text registers, the revised Scene 7 action, closing line, and 1770svh budget. Keep the existing city copy verbatim unless the native reviewer/user has approved revisions.
- [ ] Recheck the Loader's GSAP `scale not eligible for reset` warning, its scroll restoration cleanup, and the handoff at a failed/slow asset load. Fix only a reproduced defect.

**Gate:** A complete top-to-bottom and reverse scroll shows one continuous story, not isolated vignettes.

### Task 10 — Finish the original storyboard and release surfaces

**Files:** Relevant scene art files; `docs/assets.md`; `app/layout.tsx`; one 1200×630 Open Graph asset; `app/apple-icon.*`; final credit links when provided.

- [ ] Compare every original `SCRIPT.md` “What we see,” “Motion,” and “Transition” bullet to each scene. Fill meaningful gaps: Scene 1 riverbank drift, Scene 2 paratha/steam, Scene 3 vehicle detail, Scene 4 heat/shadow, Scene 5 flock, Scene 6 lights/trails, Scene 7 skyline, Scene 0 loader/title. Mark optional shaders and deferred audio as intentionally omitted.
- [ ] Replace fallback art with final layered art only when approved exports exist. Log source, licence, URL and use for each shipped asset. Avoid a large asset batch before the Scene 1 rhythm and mobile crop are proven.
- [ ] Add real credit URLs, social preview and apple icon. Read the installed Next guide at `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md` and the matching metadata file-convention pages before coding.
- [ ] Resolve the three existing English lines with 8/9/8 words against the original “under eight words” rule by explicit copy approval or approved edits; do not silently rewrite the storyboard. Have a native Bangla reader review all original and new lines.
- [ ] Count every new Bangla and English line against the spec's ≤8-word rule, including the closing line. Check colloquial meaning and warmth with the native reviewer, not only spelling.

**Gate:** All eight scenes meet the storyboard and text contract; there are no dead buttons, fake links, undocumented assets, or missing required metadata.

### Task 11 — Evidence and launch handoff

**Files:** Update `05-qa.md` with new measurements; create `docs/case-study.md` only for the original Phase 6 launch work.

- [ ] Run `npm test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build`; verify no new `#hex`, `pin:`, story timer, or per-frame `setState` in scene code.
- [ ] Test every scene at 1440×900 and 390×844 in full and reduced motion, forward, reverse, direct jump, resize, and restart. Check keyboard focus, text-safe zones, contrast against actual pixels, and that no horizontal overflow or lazy-load layout shift appears. Re-measure all old QA anchors for the 1770svh page.
- [ ] Conduct the spec's blind comprehension test: three first-time viewers each scroll once, told nothing. At least two must identify who was followed and what happened to the cup. If they cannot, improve the **visual action/recurrence** that failed before adding explanatory copy.
- [ ] Measure a 60-second continuous scroll: all eight scenes reached, every city and close text beat visible for ≥1 second. Check 60fps and <3s first-scene readiness on a real mid-range Android phone, then Chrome, Safari, Firefox and iOS Safari. Record device/connection and observed failures.
- [ ] Launch work remains user-owned: production domain, 30-second reel, mobile capture, portfolio entry and case study. Keep these out of the code-completion claim until they exist.

**Gate:** AC-T1–T8 and the original relevant AC-D/AC-S/AC-P checks have recorded evidence; no known blocker is hidden.

## Resources for implementation and review

- Local: `SCRIPT.md` supplies city moments and copy; the tea-cup spec supplies the human turns and exact new lines; `.devteam/a-day-in-dhaka/01-plan.md` supplies the frontend contract; `scene-1-frontend.md` supplies the established art/crop recipe; `05-qa.md` supplies regression cases.
- [GSAP ScrollTrigger reference](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) and [GSAP matchMedia reference](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/): scrub ranges, media branches, and cleanup. Follow installed APIs.
- [W3C WCAG 2.2 contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): normal text ≥4.5:1; qualifying large text ≥3:1. Test rendered art behind text, not palette endpoints alone.
- [MDN reduced-motion guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion): replace large panning/scale motion while keeping the story and text present.
- [Next.js metadata and OG guide](https://nextjs.org/docs/app/getting-started/metadata-and-og-images): use with the installed `node_modules/next/dist/docs/` guide before creating share assets.

## Stop rules

Stop propagation after Task 2 if the Scene 1 wide/close rhythm fails. Stop any scene's completion claim if its story turn does not read at 390px or in reduced motion. Do not add more spectacle to compensate for an unclear human action. Do not add explanatory narration, extra scenes, audio, or new tooling to make the comprehension check pass.


## Execution note — 2026-10-01

Implemented the scene code sequentially with the shared Scene 1 pilot first. `none` means empty hands, and the noon puller rests at midnight. Meng To's installed `cinematic-scroll-storytelling` skill was used, confirmed against the user's Chrome tab at `MengTo/Skills/agent-skills/web-design`; typography was checked with `better-typography`. Completed code subtasks are ticked above. Unticked review/launch subtasks remain open; no user/native/device approval has been invented. Current evidence and the upstream Three.js warning are recorded in `.devteam/a-day-in-dhaka/05-qa.md`.
