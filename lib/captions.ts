import type { VoiceCue } from "./audio.ts";
import { voiceClip } from "./voice.ts";

/** A caption counts as readable once it is this opaque. Low on purpose: the metro LED only peaks near 0.6 for a moment. */
export const READABLE_OPACITY = 0.35;

/** Opacity of an element including every ancestor's, since GSAP fades wrappers as well as leaves. */
function effectiveOpacity(el: Element): number {
  let opacity = 1;
  for (let node: Element | null = el; node && node !== document.documentElement; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden") return 0;
    opacity *= Number(style.opacity);
    if (opacity < READABLE_OPACITY) return opacity;
  }
  return opacity;
}

/**
 * The spoken captions a viewer can read right now: tagged `[data-voice]`, opaque enough and centred
 * inside the viewport. Reading the DOM keeps the audio exactly in step with whatever the scene's
 * timeline is showing, with no timing numbers to keep in sync.
 */
export function readVisibleCues(): VoiceCue[] {
  const cues: VoiceCue[] = [];
  for (const el of document.querySelectorAll<HTMLElement>("[data-voice]")) {
    const id = el.dataset.voice;
    const clip = id ? voiceClip(id) : undefined;
    if (!clip) continue;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    if (rect.width === 0 || x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight) continue;
    if (effectiveOpacity(el) >= READABLE_OPACITY) cues.push({ id: clip.id, priority: clip.priority });
  }
  return cues;
}
