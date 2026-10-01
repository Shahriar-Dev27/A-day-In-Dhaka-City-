import type { SceneId } from "./palette";

export type DeviceTier = "high" | "low";

export interface SceneMeta {
  id: SceneId;
  slug: "intro" | "azaan" | "old-dhaka" | "rush" | "noon" | "golden-hour" | "neon" | "midnight";
  clockMinutes: number | null; // minutes since 00:00 at scene start; Scene 0 = null (pre-day)
  scrollLength: number; // svh, height of the SceneSlot (tunable)
  ease: "calm" | "snappy" | "default"; // calm: 1,4,7  snappy: 3,6
  audio?: string; // '/audio/scene-N.webm' if sound ships
}

export interface SceneProps {
  id: SceneId;
  reducedMotion: boolean; // from Experience (matchMedia); scenes also branch via gsap.matchMedia
  tier: DeviceTier;
  onIntensity?: (v: number) => void; // 0..1, only Scene 3 (sound swell) uses it
}

export const SCENES: readonly SceneMeta[] = [
  { id: 0, slug: "intro", clockMinutes: null, scrollLength: 100, ease: "default" },
  { id: 1, slug: "azaan", clockMinutes: 285, scrollLength: 150, ease: "calm" },
  { id: 2, slug: "old-dhaka", clockMinutes: 420, scrollLength: 150, ease: "default" },
  { id: 3, slug: "rush", clockMinutes: 540, scrollLength: 400, ease: "snappy" },
  { id: 4, slug: "noon", clockMinutes: 780, scrollLength: 150, ease: "calm" },
  { id: 5, slug: "golden-hour", clockMinutes: 990, scrollLength: 150, ease: "default" },
  { id: 6, slug: "neon", clockMinutes: 1170, scrollLength: 150, ease: "snappy" },
  { id: 7, slug: "midnight", clockMinutes: 1425, scrollLength: 150, ease: "calm" },
];

export const EASE: Record<SceneMeta["ease"], string> = {
  calm: "sine.inOut",
  snappy: "back.out(1.6)",
  default: "power2.inOut",
};

// The final lamp dot in Scene 7 and the loader circle in Scene 0 share this.
export const LIGHT_DOT: { sizePx: number; colorToken: "glow" } = { sizePx: 14, colorToken: "glow" };

/** Start offset of each slot, in svh from the top of the page. */
export const SCENE_OFFSETS: readonly number[] = SCENES.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].scrollLength);
  return acc;
}, []);

export const TOTAL_SVH = SCENES.reduce((n, s) => n + s.scrollLength, 0);
/** Scrollable distance of the whole page in svh (document height minus one viewport). */
export const SCROLL_RANGE_SVH = TOTAL_SVH - 100;

/** Linear interpolation between scene start anchors; clamped to 04:45 before Scene 1 and 23:45 from Scene 7. */
export function progressToClockMinutes(globalProgress: number): number {
  const s = Math.min(1, Math.max(0, globalProgress)) * SCROLL_RANGE_SVH;
  const first = SCENES[1];
  const last = SCENES[SCENES.length - 1];
  if (s <= SCENE_OFFSETS[1]) return first.clockMinutes!;
  if (s >= SCENE_OFFSETS[7]) return last.clockMinutes!;
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
// The text beats (scene-kit's useSceneTimeline) fade in at BEAT_IN and are fully gone by BEAT_OUT_END
// (fractions of the scene's ScrollTrigger range). The sky only changes colour OUTSIDE these windows, so
// text is never on screen while --text and the sky lerp through each other (dark/light inversions).
export const BEAT_IN = 0.22;
export const BEAT_OUT_END = 0.95; // timeline: exit at 0.74 + stagger + 0.14 = 0.91, rounded up for safety
/** Where each ScrollTrigger starts, in svh scroll relative to the slot top. Scene 3 passes start "top top". */
const TRIGGER_START_SVH: Partial<Record<number, number>> = { 3: 0 };
const DEFAULT_TRIGGER_START_SVH = -70; // "top 70%"

/** Global scroll position (svh) between which scene `id`'s text can be visible. */
export function textWindowSvh(id: number): { start: number; end: number } {
  if (id === 0) return { start: 0, end: 80 }; // Scene 0 fades out over its first 80svh ("top top" -> "bottom top")
  const hold = id === SCENES.length - 1; // last scene keeps its text to the end
  const trigStart = SCENE_OFFSETS[id] + (TRIGGER_START_SVH[id] ?? DEFAULT_TRIGGER_START_SVH);
  const trigEnd = SCENE_OFFSETS[id] + SCENES[id].scrollLength - 100;
  const range = trigEnd - trigStart;
  return { start: trigStart + BEAT_IN * range, end: hold ? SCROLL_RANGE_SVH : trigStart + BEAT_OUT_END * range };
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
