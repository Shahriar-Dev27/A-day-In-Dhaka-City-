# Design: the tea-cup story thread

**Date:** 2026-10-01
**Status:** implementation authorized by the user on 2026-10-01; native copy, comprehension and real-device launch gates remain pending
**Changes:** `SCRIPT.md` (storyboard), all 8 scene components, `components/scenes/scene-kit.tsx`, `lib/scenes.ts` scroll budget. Adds `components/scenes/story-kit.tsx`.
**Supersedes:** nothing. This is additive to `.devteam/a-day-in-dhaka/01-plan.md`, whose interface contract (§4.3) still holds.

---

## 1. Problem

The built site is a strong tour of Dhaka and a weak story. Eight scenes each deliver a
spectacle, but nobody is in them. Scenes 2–6 contain anonymous people — a chai seller, a
resting rickshaw puller, kids with kites — who appear once and never return. A visitor
watches a city demo and leaves without having cared about anyone.

The plan's own success criterion is that a visitor who scrolls for 60 seconds "understands
the story and remembers at least one scene". There is currently no story to understand,
only a sequence.

## 2. Premise

> **চায়ের কাপে শুরু হয় দিন** — the day begins in a cup of tea.

That line is already in `SCRIPT.md` as Scene 2's caption. It is promoted to the premise of
the whole site.

The story, in full:

> At 4:45 AM someone stands in the fog wanting a cup of tea.
> At 11:45 PM they give one away and walk home with empty hands.

No cultural knowledge is required to understand that sentence, which is the point. Every
beat in between already exists in the current storyboard; this design threads them.

## 3. The three elements

### 3.1 The stroller

Never a face. Back view, silhouette, or cropped to hands. No gender, age, or brand markers.
A shawl over the shoulders in the cold scenes, sleeves rolled by noon. Called "the stroller"
in docs and code; never named on screen, never given dialogue beyond §5.3, never given a
backstory.

The current placeholder art style — bold geometric flat-vector silhouettes, per
`.devteam/a-day-in-dhaka/00-assumptions.md` Q1 — *is* a faceless figure. The stroller can be
built now in the existing style and survives the swap to final art unchanged. This is the
cheapest element in the design.

### 3.2 The cup

A Dhaka street chai glass: small, thick-walled, amber-tinted, no handle. Held by the rim with
fingertips, because the body is too hot to grip. That one detail communicates heat to a
stranger and earns trust from anyone who has held one.

**The cup is the clock.** The viewer reads the time of day off it before reading the caption.

| Scene | Time | `CupState` | The stroller |
|---|---|---|---|
| 0 | — | — | absent (the title is the only content) |
| 1 | 4:45 AM | `none` | cold, hands pulled into sleeves, breathing into palms |
| 2 | 7:00 AM | `full` | receives the glass, too hot to hold properly |
| 3 | 9:00 AM | `half` | holds it high above the crowd, protecting it |
| 4 | 1:00 PM | `cold` | sets it down in the shade, untouched |
| 5 | 4:30 PM | `empty` | lets it rest on a ledge, watches kites |
| 6 | 7:30 PM | `refilled` | buys a second cup — to carry, not to drink |
| 7 | 11:45 PM | `given` | empty hands again |

### 3.3 The debt

At 7:00 AM the chai wallah pours without being asked, hands over the glass, and waves off
the money: *later, later.* The tea is free.

So the day carries a small unpaid debt, and at 7:30 PM the stroller settles it — and buys one
extra. At 11:45 PM that extra cup is given to a stranger. Nobody explains the arithmetic and
the viewer feels it anyway.

This is the mechanism that makes the ending inevitable rather than arbitrary. Without it the
midnight gift is a nice gesture; with it, it is the only possible ending.

## 4. The eight human beats

One small moment per scene, each with a turn, inside the existing scenes. **No new scenes** —
`PLAN.md` §7 fixes the count at eight and this design respects that.

1. **4:45 AM** — The stroller waits alone on the bank. A stray dog comes and sits beside them.
   Neither moves. *Turn: they arrived alone and something sat down next to them.*
2. **7:00 AM** — The chai wallah already knows the order. Pours, hands it over, refuses the
   money. *Turn: the debt opens.*
3. **9:00 AM** — A schoolchild is stranded at the kerb. The scripted traffic-jam beat is what
   lets them cross: everything freezes and the child walks between the stopped buses. The
   cup stays dead level while the world shakes. *Turn: the chaos everyone curses is the only
   reason the kid got across.*
4. **1:00 PM** — A rickshaw puller rests in the shade of his own rickshaw. The stroller sits in
   the same strip of shade, a little way off. The cold tea sits between them. Nobody speaks and
   nothing happens, deliberately. *Turn: the city stops, so the story stops too.*
5. **4:30 PM** — The scripted cut kite drifts down and lands near the stroller. A kid arrives
   breathless, hoping. The stroller hands it back. *Turn: a rehearsal for the ending.*
6. **7:30 PM** — At the stall the stroller buys two cups and pays for both, settling the
   morning. One they drink standing there. One they carry. *Turn: the viewer now knows the last
   cup is for someone, and not who. This is the hook that pulls people to the bottom of the page.*
7. **11:45 PM** — The rickshaw puller from noon is resting under the one lamp. The stroller sets
   the cup on the kerb beside him, does not wake him, and walks on. The dog from 4:45 AM follows
   them out of frame. The lamp reflects in the tea — a circle of light — which becomes Scene 0's
   sunrise dot.
8. **Scene 0** — unchanged on screen. Retroactively, it was never a sunrise. It was the surface
   of a cup of tea.

Two recurrences carry the weight: the rickshaw puller we shared shade with at noon is the one
we give to at midnight, and the dog that sat down at dawn is the one that walks us home. Both
reuse art the same scenes already need.

## 5. Text: three registers

The current single register (time chip + Bangla line + English subtitle) stays and keeps its
copy. Two registers are added, giving the typography the same wide/close rhythm as the camera.

### 5.1 City voice — unchanged

Existing `SceneText`: time chip, large Bangla line, English subtitle. Shown during the wide
shot. All current copy in scenes 0–7 is kept verbatim.

### 5.2 Stroller voice — new

Small, quiet, unquoted, positioned low near the hands. Shown only during the close beat.

| Scene | Bangla | English |
|---|---|---|
| 1 | ঠান্ডা। এক কাপ চা দরকার। | Cold. I need a cup of tea. |
| 3 | শুধু কাপটা যেন না পড়ে। | Just don't let it spill. |
| 4 | চা ঠান্ডা, ছায়া ভাগাভাগি। | Cold tea, shared shade. |

### 5.3 Spoken — new, exactly three lines

In Bangla quotation marks with an English subtitle. The entire site contains three spoken
lines, and each one is an act of giving:

| Scene | Speaker | Bangla | English |
|---|---|---|---|
| 2 | chai wallah | "পরে দিয়েন।" | "Pay me later." |
| 5 | stroller, to the kid | "এটা তোমার।" | "This is yours." |
| 6 | stroller, to the seller | "দুই কাপ। আর সকালেরটাও।" | "Two cups. And this morning's too." |

The pattern establishes that giving is spoken. Scene 7 — the fourth and largest give — is
silent. That silence is the payoff and must not be filled.

Scene 7's close beat therefore carries **no text at all**: no stroller line, no spoken line. It
renders `CloseBeat` with the cup and the reflection only, and omits `FigureLine`. Scenes 2, 5 and
6 carry a spoken line and no stroller line; scenes 1, 3 and 4 carry a stroller line and no spoken
line. No close beat ever shows both.

### 5.4 Closing line

After the Scene 7 credits beat: **কাল আবার।** / *Again tomorrow.* It sits above the existing
"scroll up to start again" button and motivates it.

### 5.5 Word counts

Every new line is ≤8 English words, against the 8-word rule in `SCRIPT.md`. This design adds
no new violations and does not fix the three existing ones (scenes 2/4/5, `04-errors` #8),
which remain the user's decision.

**All Bangla copy in §5.2–5.4 is pending native review** (`00-assumptions.md` Q3). The spoken
lines are register-sensitive: `পরে দিয়েন` must read as warm Dhaka street speech, not stiff
formal Bangla. Flag to the reviewer explicitly.

## 6. Mechanics: wide/close breathing

Every scene 1–7 performs the same two-step: the city wide, then scroll pushes in to one
intimate close beat on the cup and the stroller's hands, then pulls back out. Eight wide
compositions, seven close ones, alternating.

This also fixes a problem the current build has independently of the story: six consecutive
spectacles with no quiet beat between them. The site gains a heartbeat — loud, quiet, loud,
quiet.

### 6.1 Timeline positions

Fractions of the slot range, matching the existing `useSceneTimeline` convention:

| Range | What happens |
|---|---|
| 0.00–0.36 | Wide. City art motion (existing, unchanged). City text in at 0.12, out at 0.36. |
| 0.36–0.46 | Push in. City layer `scale 1 → 1.12`, `autoAlpha 1 → 0`. Close layer `scale 1.08 → 1`, `autoAlpha 0 → 1`. |
| 0.46–0.70 | Close hold. Close-beat micro-motion. Stroller/spoken text in at 0.50, out at 0.68. |
| 0.70–0.80 | Pull out. The reverse. |
| 0.80–1.00 | Wide again, carrying into the next scene's transition. |

The city text currently enters at 0.22 and leaves at 0.74, which would collide with the push-in.
Re-timing it to 0.12/0.36 separates text from camera and is a strict improvement to the existing
rhythm.

There is no real camera. Both layers are `transform` and `opacity` only, so contract rule 5 holds
unchanged.

### 6.2 Reduced motion

No scale on either layer. The close layer cross-fades on `opacity` alone. **Both compositions and
all three text registers still appear**, because the cup states *are* the story and a
reduced-motion visitor must still be able to follow it. This is stricter than the current
reduce branch, which only needs text visible.

### 6.3 Mobile

The close beat is better on a small screen than on a large one: a cup that fills a 390px viewport
reads instantly. No separate mobile composition is needed. The wide shots remain the mobile risk,
as they already are.

### 6.4 Scene 3's level cup

While the crowd layers shake, the cup's liquid group counter-rotates to stay horizontal. Driven
by the existing scroll-velocity signal, transform-only. Under reduced motion there is no shake
and the cup is static.

Note: `getScrollVelocity` units still need normalising before this can be built
(`05-qa.md` remaining item #5). That work is a prerequisite, not part of this design.

## 7. Code changes

### 7.1 New: `components/scenes/story-kit.tsx`

Follows the existing `scene-kit.tsx` pattern — shared plumbing in one place, semantic colour
classes only, `data-*` hooks for GSAP selection.

```ts
export type CupState = "none" | "full" | "half" | "cold" | "empty" | "refilled" | "given";
export type FigurePose = "cold" | "walk" | "hold-high" | "sit" | "set-down";

export function Cup(p: { state: CupState } & SVGProps<SVGGElement>): JSX.Element;
//   hooks: [data-liquid], [data-steam], [data-drop], [data-reflection]
export function Figure(p: { pose: FigurePose } & SVGProps<SVGGElement>): JSX.Element;
//   hook: [data-figure]
export function CloseBeat(p: { label: string; children: ReactNode }): JSX.Element;
//   renders the [data-close] layer, with its own local vignette (see §7.4)
export function FigureLine(p: { line: Line; spoken?: boolean }): JSX.Element;
//   the [data-beat-close] register; `spoken` adds Bangla quote marks
```

One new file, four components, reused across seven scenes. No per-scene abstraction.

### 7.2 Changed: `components/scenes/scene-kit.tsx`

- Re-time the default text beats: in at 0.12, out at 0.36 (was 0.22 / 0.74).
- Add a `close?: boolean` option to `TimelineOptions`. When set, `useSceneTimeline` wires the
  §6.1 cross-fade by selecting `[data-city]` and `[data-close]`, and runs the
  `[data-beat-close]` entrance at 0.50 / exit at 0.70.
- `Art` already spreads props onto its `<svg>`, so scenes mark the wide layer with
  `<Art data-city>`. No change to `Art`, `Stage`, or `SceneText`.

### 7.3 Changed: each scene component

Per-scene diff is small and identical in shape:

```tsx
<Stage label={COPY.line.en}>
  <Art data-city>{/* existing art, plus the scene's cast silhouettes */}</Art>
  <SceneText time={COPY.time} line={COPY.line} />
  <CloseBeat label={COPY.close.en}>
    <Cup state="none" />
    <Figure pose="cold" />
    <FigureLine line={COPY.close} />
  </CloseBeat>
</Stage>
```

with `useSceneTimeline(root, build, { close: true })`.

Each scene's wide SVG also gains the stroller at city scale plus that scene's cast: dog (1, 7),
chai wallah (2, 6), schoolchild (3), rickshaw puller (4, 7), kite kid (5). In the geometric
silhouette style these are a few paths each.

Copy stays as a typed `COPY` const at the top of each scene file, per contract rule 7, gaining a
`close` key. Nothing is centralised, because nothing outside the scene needs it.

### 7.4 Contrast, and a free win on QA-2

`CloseBeat` renders its own local backdrop behind the hands. Close-beat text is therefore
measured against that backdrop, not against the lerping sky — so the new register is **immune to
QA-2** (`05-qa.md`), the sky/text interpolation bug that drops Scene 2 and 6 text below AA. The
fix for QA-2 is still required for the city register; the close register simply cannot regress
into it.

### 7.5 Changed: `lib/scenes.ts` scroll budget

The close beat needs room. Revised `scrollLength`, in svh:

| Scene | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | Total |
|---|---|---|---|---|---|---|---|---|---|
| Now | 100 | 150 | 150 | 400 | 150 | 150 | 150 | 150 | 1400 |
| New | 100 | 200 | 200 | 450 | 200 | 200 | 200 | 220 | 1770 |

`SCENE_OFFSETS`, `TOTAL_SVH`, `SCROLL_RANGE_SVH` and `progressToClockMinutes` all derive from
this array, so **no logic changes** and the unit tests in `tests/lib.test.mjs` re-derive on their
own.

The browser QA evidence does not. Every hard-coded `y` value in `05-qa.md` — clock anchors at
900/11250, lazy-chunk requests at 450/1800/5400/…, the restart test at 11700 — shifts and must be
re-measured. Re-running the sweep is part of this work, not a follow-up.

## 8. Sequencing

**QA-1 must be fixed before the third text register is added.** It is a High-severity bug in
`scene-kit.tsx:56-63`: staggered `fromTo` beats are visible before their entrance, then blink out
and fade back in, in every scene and both motion modes. Adding a third beat to a broken stagger
multiplies the bug and makes it much harder to diagnose. The fix is already specified in
`05-qa.md` (`gsap.set` the from-state before building the timeline).

Order of work:

1. Fix QA-1 and QA-2 in the current build. Re-run the QA gate. *(Already-owed work, not this design.)*
2. Normalise `getScrollVelocity` units (needed by §6.4, and already owed before M4 scenes 3/5/6).
3. `story-kit.tsx` + `scene-kit.tsx` changes, with Scene 1 as the only consumer. Verify the
   breathing rhythm on one scene before touching the rest.
4. Revise `lib/scenes.ts` scroll budget. Re-run `npm test` and the browser sweep.
5. Roll the close beat through scenes 2, 3, 4, 5, 6, 7 in `PLAN.md` Phase 4 order.
6. Scene 7's reflection → `LIGHT_DOT` handoff, then Scene 0's retroactive reveal.
7. Update `SCRIPT.md` to match this spec, since it is the storyboard source of truth.

Step 3 is the gate. If the wide/close rhythm does not feel right on Scene 1, stop and revise this
spec rather than propagating it to seven scenes.

## 9. Acceptance criteria

Additions to `01-plan.md` §6. The existing criteria all still apply.

- **AC-T1 (comprehension — the real test).** Three people who have never seen the site scroll it
  once, told nothing. At least two must answer both: *who were we following?* and *what did they
  do with the cup?* If they cannot, the thread has failed regardless of how good it looks.
- **AC-T2.** The cup state, including its deliberate absence in Scene 1, is readable in every scene 1–7, at 390px wide, in both
  motion modes.
- **AC-T3.** Under `prefers-reduced-motion: reduce`, all seven close beats and all three text
  registers appear; no scale is applied to either layer; the global transform probe stays at 0.
- **AC-T4.** Scene 7's final reflection circle matches `LIGHT_DOT.sizePx` and Scene 0's circle
  position within 2px at both 1440×900 and 390×844.
- **AC-T5.** Every line added by §5 is ≤8 words in both languages.
- **AC-T6.** Close-beat text meets AA contrast against `CloseBeat`'s own backdrop at every point
  in the scroll, independent of the sky lerp.
- **AC-T7.** No new `#hex` in `components/scenes`, no `pin:`, no `setTimeout`/`setInterval`,
  no per-frame `setState` — the existing greps in AC-S5 still return nothing.
- **AC-T8.** Total page is 1770svh ±2%, and a 60-second continuous scroll still passes all eight
  scenes with every text beat on screen for ≥1s.

## 10. Non-goals

Explicitly out of scope, to protect against the scope creep `PLAN.md` §7 warns about:

- No new scenes. Eight, as fixed.
- No face on the stroller, ever. No name, no age, no backstory, no voice beyond §5.
- No dialogue beyond the three spoken lines.
- No on-screen text explaining the thread. If the story needs a caption saying it is a story, it
  has failed.
- No branching, no interactivity, no "choose your Dhaka". The "Your Dhaka" stretch goal in
  `PLAN.md` §5 stays post-launch.
- No audio work. Sound is not shipping at launch (`00-assumptions.md` Q2), and this design does
  not depend on it — the three spoken lines are text.
- No dependencies beyond the original development plan's Three.js / React Three Fiber / drei stack.

## 11. Risks

- **R-T1 — page length.** 1400 → 1770svh is +26%, which increases scroll drop-off. Mitigation: the
  Scene 6 "two cups" hook creates an open question right before the final stretch. Measure
  drop-off after launch; if it is bad, the slot lengths can come back down toward 160–170svh
  without touching the design — the close beat is a fraction of the slot, so it compresses with
  it.
- **R-T2 — the thread is missable.** If a viewer skims, they may see seven cups and no story. This
  is what AC-T1 tests, and why the close beat is a push-in rather than a figure in the crowd.
- **R-T3 — cut order.** `PLAN.md` cuts Scene 4 first, then Scene 5. Scene 4 introduces the rickshaw
  puller who receives the cup at midnight, and Scene 5 holds the giving-back rehearsal. If Scene 4
  is cut, the puller must be seeded in Scene 3's jam beat instead — a one-line art change. If
  Scene 5 is cut, the rehearsal is lost but the arc survives on gift → purchase → give. Cut order
  is unchanged; this note goes in `PLAN.md` §7.
- **R-T4 — eight close compositions is real art work.** They share one pair of hands and one cup,
  with only the light and the cup state changing, so they are the cheapest possible additions —
  but they are not free, and they are on the critical path for every scene.
- **R-T5 — Bangla register.** The three spoken lines are colloquial. A stiff translation would make
  the warmest moments in the piece feel wrong. Native review is a launch blocker, not a polish item.
