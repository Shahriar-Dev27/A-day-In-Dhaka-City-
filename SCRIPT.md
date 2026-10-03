> **Superseded by `docs/storyboard/SCRIPT-v2.md` (approved 2026-10-02). Kept for history.**

# A Day in Dhaka: Scene Script (Storyboard)

Companion to `A-Day-in-Dhaka-PLAN.md`. Put this file at `/docs/storyboard/SCRIPT.md`.

**How to read each scene:** Emotion, then what the viewer sees (layers back to front), what moves as they scroll, the on-screen text, the sound, and how the scene hands off to the next one.

**Scroll budget:** about 100vh to 150vh per scene, except Scene 3 (pinned horizontal section, about 400vh of scroll). Total page is roughly 12 to 14 screen heights.

**Text rule:** Bangla is the main voice, English is a small subtitle underneath. Keep every line under 8 words. Have a native reader check all Bangla copy before launch.

---

## Scene 0: Sunrise Dot (Loader and Intro)

**Time:** before the day begins
**Emotion:** Quiet anticipation. The calm before the city wakes up.

**What we see**
- Pure dark indigo screen. A single small circle of warm light sits in the center.
- As the loader fills (0 to 100%), the circle slowly grows and brightens.
- At 100%, the circle expands to fill the screen and fades into the title.

**Motion**
- Loader: circle scale 0.2 to 1 tied to real asset loading progress, with an eased finish.
- Title letters rise up one by one with a soft blur-to-sharp effect.
- A thin vertical line pulses at the bottom as the scroll prompt.

**Text**
- Title: **একটি দিন, ঢাকায়** / *A Day in Dhaka*
- Prompt: **নিচে স্ক্রল করুন** / *Scroll to begin*
- Small note: *Sound on for the full experience* with the audio toggle beside it.

**Sound:** Silence, then one soft low drone that fades in when sound is on.
**Transition:** The title lifts upward and the first hint of fog drifts in from the bottom.

---

## Scene 1: Azaan on the Buriganga (4:45 AM)

**Emotion:** Stillness and reverence. The city is asleep, and one voice wakes it.

**What we see (back to front)**
1. Deep indigo sky with a few fading stars and a thin pale line on the horizon
2. Far skyline silhouette: minarets, old buildings, a few lit windows
3. River surface with soft reflections
4. Wooden boats (nouka) as dark silhouettes, one with a tiny lantern
5. Layers of drifting fog in front, with the lowest layer the thickest

**Motion on scroll**
- Fog layers move sideways at different speeds (parallax), lowest layer fastest.
- Sky gradient shifts from indigo toward a faint teal-pink at the horizon.
- Stars fade out one cluster at a time.
- Boat glides slowly left to right. Lantern light flickers gently.
- Minaret windows light up in sequence, as if people are waking.
- Optional shader: a gentle ripple on the water surface.

**Text** (fades in at the middle of the scene)
- **ভোর ৪:৪৫** / *4:45 AM*
- **আজানের সুরে ঢাকা জাগে** / *Dhaka wakes to the call of prayer*

**Sound:** Soft water, distant azaan (use royalty-free or self-recorded, kept low), a few birds near the end.
**Transition:** The first warm light touches the fog, which turns amber and lifts. The camera drifts "up the riverbank" into the old city.

---

## Scene 2: Old Dhaka Wakes (7:00 AM)

**Emotion:** Warmth, appetite, and community.

**What we see**
- Narrow Old Dhaka lane, wide and horizontal, with a long street scene that pans sideways.
- Chai stall with a kettle, steam rising, small glasses lined up.
- A paratha and bhaji seller flipping bread on a hot tawa, smoke curling.
- Shopfronts with hand-painted signs, hanging wires, balconies with laundry.
- A few early customers sitting on low stools. A cat watches from a ledge.
- Warm saffron and orange light from the left, long shadows to the right.

**Motion on scroll**
- Pinned scene: scroll pans the whole lane left to right.
- Steam is a looping particle effect, and it reacts slightly to scroll speed.
- Paratha flip is a short looping animation that triggers as it enters center frame.
- Hanging wires and signs sway lightly (small rotate loops).
- Foreground elements move slightly faster than the background for depth.

**Text**
- **সকাল ৭টা** / *7:00 AM*
- **চায়ের কাপে শুরু হয় দিন** / *The day begins in a cup of tea*

**Sound:** Sizzle of the tawa, spoon on glass, murmured voices, a distant rickshaw bell.
**Transition:** A rickshaw bell rings and a rickshaw crosses the frame left to right, wiping the scene into the next.

---

## Scene 3: The Rush (9:00 AM) (hero scene)

**Emotion:** Energy, chaos, joy. This is the scene people will remember.

**What we see**
- A wide, bold street scene built from layered vehicles and people.
- Foreground: rickshaws covered in hand-painted art (flowers, birds, film stars as generic stylized faces, not real people), bright colors, tinsel.
- Midground: CNG autos, buses crammed with passengers, bicycles.
- Background: apartment blocks, billboards, hanging signs.
- Huge Bangla type that interacts with the scene (words sit behind and in front of vehicles).

**Motion on scroll** (pinned, converted to horizontal movement)
- Scroll speed drives the whole street sideways at fast pace. Each layer has its own speed.
- Vehicles weave in and out of lanes at different speeds.
- Giant words slide across and get overlapped by rickshaws.
- Rickshaw wheels spin at a rate tied to scroll velocity.
- A brief "traffic jam" beat: scroll slows, everything bunches up, horns, then it all bursts free.
- Colors are at maximum saturation here, the loudest point of the whole site.

**Text** (huge display type, one word per beat)
- **ব্যস্ত** / *busy*
- **ভিড়** / *crowded*
- **জীবন্ত** / *alive*
- Small line at the end: **৯টা বাজে, ঢাকা থামে না** / *9 o'clock, and Dhaka never stops*

**Sound:** Layered horns, bells, engines, crowd. Volume swells with scroll speed.
**Transition:** The crowd thins out, and the sun is suddenly high and bright. Colors bleach toward white.

---

## Scene 4: Noon Heat (1:00 PM)

**Emotion:** Intensity and slowness. The city pauses, sweating under the sun.

**What we see**
- Bright flat colors, high contrast, almost overexposed.
- Street vendor under a big umbrella selling fruit and cold drinks.
- A rickshaw puller resting in the shade of his own rickshaw.
- Short, sharp shadows. Heat shimmer rising off the road.
- A big sun disc high in the frame.

**Motion on scroll**
- The sun moves across a visible arc, and the shadows rotate and lengthen as it goes.
- Heat shimmer: a subtle wave distortion on the bottom third of the frame.
- Sweat drop on a glass slides down as you scroll.
- Everything is slower here (longer scroll for less movement) to feel the stillness.

**Text**
- **দুপুর ১টা** / *1:00 PM*
- **রোদ যত কড়া, ছায়া তত দামি** / *The harsher the sun, the more precious the shade*

**Sound:** Cicadas, a ceiling fan hum, ice clinking, very little traffic.
**Transition:** The sun begins to lower and the colors warm from white to gold.

---

## Scene 5: Golden Hour (4:30 PM)

**Emotion:** Freedom and nostalgia. The best hour of the day.

**What we see**
- Rooftop view over a sea of Dhaka buildings and water tanks.
- Kids and teenagers flying kites, strings crossing the sky.
- A flock of pigeons circling a rooftop coop.
- Gold and orange haze, long soft shadows, the sun low on the right.
- A few clouds catching pink light.

**Motion on scroll**
- Kites rise and drift at different speeds. Their strings stretch and sway.
- Pigeon flock is a particle swarm that circles and reacts to scroll direction.
- Camera slowly rises from the rooftop toward the sky as you scroll.
- One kite crosses another's string and cuts it loose. The cut kite floats down across the screen.
- Haze layers drift slowly.

**Text**
- **বিকেল ৪:৩০** / *4:30 PM*
- **আকাশ যাদের, ছাদ তাদের** / *The sky belongs to whoever owns a rooftop*

**Sound:** Wind, wings flapping, kids shouting "bho-kaatta" in the distance, a gentle melody (optional).
**Transition:** The sun touches the horizon. The sky goes magenta, and the first streetlights turn on far below.

---

## Scene 6: Neon Evening (7:30 PM)

**Emotion:** Wonder and electricity. The city transforms.

**What we see**
- Street level at dusk. Shopfronts, signboards, and string lights switch on one by one.
- Market scene with fruit stalls, bright bulbs, hanging garments, glowing signs.
- Long light trails from buses and rickshaws streaking through the frame.
- Reflections on a wet road.
- Sky in deep magenta and blue.

**Motion on scroll**
- Lights turn on progressively as you scroll (each light has its own scroll trigger).
- Light-trail shader: glowing lines stretch along the road, speed and length tied to scroll velocity.
- Bokeh circles drift in the background.
- Neon signs flicker briefly when they turn on, then settle.
- Colors lean magenta and cyan, the strongest contrast to Scene 4.

**Text**
- **সন্ধ্যা ৭:৩০** / *7:30 PM*
- **আলোয় আলোয় নতুন ঢাকা** / *A new Dhaka, made of light*

**Sound:** Evening azaan fading out, market chatter, buzzing neon, passing traffic.
**Transition:** The traffic thins, the lights dim, and the camera pulls back and down onto a quieter street.

---

## Scene 7: Quiet City (11:45 PM)

**Emotion:** Peace, gratitude, a soft goodbye.

**What we see**
- Empty street under one warm streetlamp. Deep blue-black sky.
- The puller from noon rests beneath the lamp, recognizable by the same gold headband and garment stripe.
- Closed shutters, the dawn dog following the stroller, a few windows still lit.
- Faint stars returning, echoing Scene 1 so the day feels like a loop.

**Motion on scroll**
- Very slow zoom out as you scroll, revealing the whole sleeping skyline.
- The stroller leaves the second cup beside the resting puller without waking him; the dog follows them home.
- The lamp reflected in the tea becomes the centered 14px circle from Scene 0, closing the loop.
- Credits fade in over the dark skyline.

**Text**
- **রাত ১১:৪৫** / *11:45 PM*
- **ঘুমায় শহর, স্বপ্ন জাগে** / *The city sleeps, the dreams stay awake*
- Credits: Designed and built by Shahriar Islam Dip. Include portfolio link, social links, and a "Scroll up to start again" button.

**Sound:** Crickets, a distant train, a last soft note that fades to silence.
**End:** After the credits, **কাল আবার।** / *Again tomorrow.* appears above the working restart button.

---

## Global motion rules

- **Easing:** Slow-in slow-out for calm scenes (1, 4, 7). Snappy, bouncy for energetic scenes (3, 6).
- **Pacing pattern:** calm, warm, loud, hot, free, electric, calm.
- **Persistent UI:** clock/sun arc in the corner always shows the current time of day.
- **Sky gradient:** one continuous background gradient that never jumps between scenes.
- **Recurring motifs:** the circle of light (Scene 0 and 7), the rickshaw (Scenes 3, 4, 7), and the bell sound as a connecting thread.

## Tea-cup thread (implemented 2026-10-01)

The recurring faceless stroller has the same shawl, sleeves and small handleless chai glass throughout. The morning seller returns in the evening; the noon puller and dawn dog return at midnight. Scene 1 deliberately has empty hands.

| Scene | Wide-to-close action | Cup state | Close Bangla / English |
|---|---|---|---|
| 1 | Cold palms on the riverbank; a dog comes to sit beside them | none | ঠান্ডা। এক কাপ চা দরকার। / Cold. I need a cup of tea. |
| 2 | The seller offers steaming tea and waves away payment | full | “পরে দিয়েন।” / “Pay me later.” |
| 3 | A child crosses during the jam; a raised glass stays level | half | শুধু কাপটা যেন না পড়ে। / Just don't let it spill. |
| 4 | Stroller and recognizable puller sit in the same shade | cold | চা ঠান্ডা, ছায়া ভাগাভাগি। / Cold tea, shared shade. |
| 5 | The fallen kite is handed back to a child; the glass rests on the ledge | empty | “এটা তোমার।” / “This is yours.” |
| 6 | The morning debt is paid; one cup is drunk and a second is carried | refilled | “দুই কাপ। আর সকালেরটাও।” / “Two cups. And this morning's too.” |
| 7 | Tea is left beside the resting puller; the dog follows; lamp reflection closes the loop | given | Silent. No close caption. |

City copy remains verbatim. Three quiet stroller lines and exactly three spoken lines appear as real bilingual DOM text, on a stable dark close-shot backdrop. All Bangla remains pending native review.

Scene heights: **100 / 200 / 200 / 450 / 200 / 200 / 200 / 220 svh**, totaling **1770svh**. Scenes 1–7 show the city until 0.36, push to close over 0.36–0.46, hold through 0.70, then return wide over 0.70–0.80. Midnight holds the close to turn the actual tea reflection into the opening dot, then reveals credits at 0.87 and the closing line at 0.95. Reduced motion uses opacity only; both compositions and all story text remain present. No sound ships at launch, as recorded in `00-assumptions.md`.

---
## Open decisions for me

- [ ] Pick the illustration style (flat vector with grain is the default)
- [ ] Decide whether sound is included at launch or added later
- [ ] Get a native Bangla reader to verify all copy
- [ ] Choose which scene to prototype first (recommended: Scene 1, then Scene 3)
