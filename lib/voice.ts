import { COPY, type CastId } from "./copy.ts";

// Every spoken Bangla line, derived from lib/copy.ts so the audio can never drift from the captions.
// Scene components tag their DOM with `data-voice={voiceIdFor(line.bn)}`; the director plays the clip
// whose caption is on screen. scripts/generate-narration.mjs renders the same list.

export type VoiceKind = "narration" | "overheard" | "giant" | "announcement" | "title" | "closing";
export type VoiceWho = CastId | "narrator";

export interface VoiceClip {
  id: string;
  scene: number;
  kind: VoiceKind;
  who: VoiceWho;
  bn: string;
  /** 2 = narration and dialogue (never skipped); 1 = set dressing (waits for a free voice). */
  priority: 1 | 2;
}

/** Playback-rate nudge per speaker: one TTS voice, a little character. */
export const VOICE_RATE: Record<VoiceWho, number> = {
  narrator: 1, mama: 0.92, guard: 0.95, worker: 1, kid: 1.18, commuter: 1.03, boy: 1.14, father: 0.94,
  mother: 1.06, son: 1.12, puller: 0.93, kiteBoy: 1.16, helper: 1.05, offscreen: 1,
};

function build(): VoiceClip[] {
  const clips: VoiceClip[] = [];
  const add = (scene: number, id: string, kind: VoiceKind, who: VoiceWho, bn: string, priority: 1 | 2) => {
    if (bn) clips.push({ id, scene, kind, who, bn, priority });
  };
  for (const [key, copy] of Object.entries(COPY)) {
    const scene = Number(key);
    if (copy.narration) add(scene, `s${scene}-n`, "narration", "narrator", copy.narration.bn, 2);
    copy.overheard.forEach((line, i) => add(scene, `s${scene}-o${i}`, "overheard", line.who, line.bn, 2));
    copy.giant?.forEach((line, i) => add(scene, `s${scene}-g${i}`, "giant", "narrator", line.bn, 1));
    if (copy.announcement) add(scene, `s${scene}-a`, "announcement", "narrator", copy.announcement.bn, 1);
    if (copy.extra?.title) add(scene, `s${scene}-title`, "title", "narrator", copy.extra.title.bn, 1);
    if (copy.extra?.closing) add(scene, `s${scene}-closing`, "closing", "narrator", copy.extra.closing.bn, 1);
  }
  return clips;
}

export const VOICE_CLIPS: readonly VoiceClip[] = build();

const BY_TEXT = new Map(VOICE_CLIPS.map((clip) => [clip.bn, clip]));
const BY_ID = new Map(VOICE_CLIPS.map((clip) => [clip.id, clip]));

export const voiceClip = (id: string): VoiceClip | undefined => BY_ID.get(id);

/** The clip id for a caption's Bangla text (undefined when that line has no clip). */
export const voiceIdFor = (bn: string): string | undefined => BY_TEXT.get(bn)?.id;

export const voiceUrl = (id: string): string => `/audio/voice/${id}.wav`;
