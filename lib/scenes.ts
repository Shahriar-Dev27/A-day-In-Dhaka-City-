import type { SceneId } from "./palette";

export type DeviceTier = "high" | "low";

export interface SceneMeta {
  id: SceneId;
  slug: "intro" | "fajr" | "morning" | "jam" | "metro" | "noon" | "rooftop" | "adda" | "closing";
  clockMinutes: number | null; // minutes since 00:00 at scene start; Scene 0 = null (pre-day)
  scrollLength: number; // svh, height of the SceneSlot (tunable)
  ease: "calm" | "snappy" | "default"; // calm: 1,4,5,8  snappy: 3,6
  /** Where the scene's ScrollTrigger starts, in svh relative to the slot top: -70 = "top 70%", 0 = "top top". */
  triggerStartSvh: number;
  /** Narration fade window as fractions of the scene's trigger range (mirrored by textWindowSvh). */
  narration: { in: number; outEnd: number };
  audio?: string; // '/audio/scene-N.webm' if sound ships
}

export interface SceneProps {
  id: SceneId;
  reducedMotion: boolean; // from Experience (matchMedia); scenes also branch via gsap.matchMedia
  tier: DeviceTier;
  onIntensity?: (v: number) => void; // 0..1, only the jam scene (3, sound swell) uses it
}

const N = { in: 0.12, out: 0.36 }; // default narration window (BEAT_IN / BEAT_OUT_END)

export const SCENES: readonly SceneMeta[] = [
  { id: 0, slug: "intro", clockMinutes: null, scrollLength: 100, ease: "default", triggerStartSvh: 0, narration: { in: 0, outEnd: 0.8 } }, // special: textWindowSvh pins it to 0..80svh
  { id: 1, slug: "fajr", clockMinutes: 285, scrollLength: 200, ease: "calm", triggerStartSvh: -70, narration: { in: 0.42, outEnd: 0.68 } }, // lands as the stove lights; the sky holds night until then
  { id: 2, slug: "morning", clockMinutes: 420, scrollLength: 200, ease: "default", triggerStartSvh: -70, narration: { in: N.in, outEnd: N.out } },
  { id: 3, slug: "jam", clockMinutes: 540, scrollLength: 450, ease: "snappy", triggerStartSvh: 0, narration: { in: 0.82, outEnd: 0.96 } },
  { id: 4, slug: "metro", clockMinutes: 580, scrollLength: 280, ease: "calm", triggerStartSvh: 0, narration: { in: 0.03, outEnd: 0.18 } },
  { id: 5, slug: "noon", clockMinutes: 780, scrollLength: 200, ease: "calm", triggerStartSvh: -70, narration: { in: N.in, outEnd: N.out } },
  { id: 6, slug: "rooftop", clockMinutes: 990, scrollLength: 200, ease: "snappy", triggerStartSvh: -70, narration: { in: N.in, outEnd: N.out } },
  { id: 7, slug: "adda", clockMinutes: 1170, scrollLength: 230, ease: "default", triggerStartSvh: -70, narration: { in: N.in, outEnd: N.out } },
  { id: 8, slug: "closing", clockMinutes: 1425, scrollLength: 220, ease: "calm", triggerStartSvh: -70, narration: { in: N.in, outEnd: N.out } },
];

export const EASE: Record<SceneMeta["ease"], string> = {
  calm: "sine.inOut",
  snappy: "back.out(1.6)",
  default: "power2.inOut",
};

// The loop: Scene 8 ends on this dot and Scene 0 opens on it. Both place it from the SAME constants, so
// the two screen positions are identical by construction (a test pins them): the centre of the sticky
// stage (50% / 50% of the stage, which is the viewport), `sizePx` across, in the `glow` token. Spread
// `lightDotStyle` on the element: it positions with margins, never `transform`, so GSAP owns the
// element's transform alone (scale about its own centre) and nothing fights over translate.
export const LIGHT_DOT = { sizePx: 14, colorToken: "glow", centerX: 0.5, centerY: 0.5 } as const;
export const lightDotStyle = {
  position: "absolute",
  left: `${LIGHT_DOT.centerX * 100}%`,
  top: `${LIGHT_DOT.centerY * 100}%`,
  width: LIGHT_DOT.sizePx,
  height: LIGHT_DOT.sizePx,
  marginLeft: -LIGHT_DOT.sizePx / 2,
  marginTop: -LIGHT_DOT.sizePx / 2,
} as const;

/** Start offset of each slot, in svh from the top of the page. */
export const SCENE_OFFSETS: readonly number[] = SCENES.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].scrollLength);
  return acc;
}, []);

export const TOTAL_SVH = SCENES.reduce((n, s) => n + s.scrollLength, 0);
/** Scrollable distance of the whole page in svh (document height minus one viewport). */
export const SCROLL_RANGE_SVH = TOTAL_SVH - 100;

/** Linear interpolation between scene start anchors; clamped to 04:45 before Scene 1 and 23:45 from the last scene's start. */
export function progressToClockMinutes(globalProgress: number): number {
  const s = Math.min(1, Math.max(0, globalProgress)) * SCROLL_RANGE_SVH;
  const first = SCENES[1];
  const last = SCENES[SCENES.length - 1];
  if (s <= SCENE_OFFSETS[1]) return first.clockMinutes!;
  if (s >= SCENE_OFFSETS[SCENES.length - 1]) return last.clockMinutes!;
  for (let i = 1; i < SCENES.length - 1; i++) {
    const a = SCENE_OFFSETS[i];
    const b = SCENE_OFFSETS[i + 1];
    if (s < b) {
      const t = (s - a) / (b - a);
      return SCENES[i].clockMinutes! + t * (SCENES[i + 1].clockMinutes! - SCENES[i].clockMinutes!);
    }
  }
  return last.clockMinutes!;
}

// --- Text-visibility windows -------------------------------------------------------------
// Each scene's narration (scene-kit's useSceneTimeline) fades in at SCENES[id].narration.in and is
// fully gone by .outEnd (fractions of the scene's ScrollTrigger range). The sky only changes colour
// OUTSIDE these windows, so narration is never on screen while --text and the sky lerp through each
// other (dark/light inversions). Overheard slips and the clock use fixed paper colours: not bound.
export const BEAT_IN = 0.12; // defaults, kept exported for backward compatibility
export const BEAT_OUT_END = 0.36;

/** Global scroll position (svh) between which scene `id`'s narration can be visible. */
export function textWindowSvh(id: number): { start: number; end: number } {
  if (id === 0) return { start: 0, end: 80 }; // Scene 0 fades out over its first 80svh ("top top" -> "bottom top")
  const m = SCENES[id];
  const trigStart = SCENE_OFFSETS[id] + m.triggerStartSvh;
  const trigEnd = SCENE_OFFSETS[id] + m.scrollLength - 100;
  const range = trigEnd - trigStart;
  return { start: trigStart + m.narration.in * range, end: trigStart + m.narration.outEnd * range };
}

/**
 * Sky plateaus as fractions (0..1) of the page scroll range: the sky holds scene n's palette from
 * `start` to `end` and transitions between `anchors[n].end` and `anchors[n + 1].start`.
 * Scene 0's text is allowed to fade while the sky already moves (dark to dark, no inversion).
 */
export function skyAnchors(): { id: number; start: number; end: number }[] {
  return SCENES.map((m) => {
    const w = textWindowSvh(m.id);
    const end = m.id === 0 ? 0 : w.end;
    return { id: m.id, start: w.start / SCROLL_RANGE_SVH, end: end / SCROLL_RANGE_SVH };
  });
}
