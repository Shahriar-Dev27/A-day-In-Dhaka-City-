// Voice playback policy, free of browser APIs so node:test can drive it with a fake output.
// The browser side (lib/webaudio.ts) supplies the VoiceOutput; components/SoundToggle.tsx feeds update().

/** A caption currently readable on screen. */
export interface VoiceCue {
  id: string;
  priority: 1 | 2;
}

export interface VoiceHandle {
  /** Ramp to silence over `ms`, then release. Safe to call twice. */
  fadeOut(ms: number): void;
}

export interface VoiceOutput {
  /** Start a clip; `onEnded` fires once when it finishes naturally (not when faded out). */
  play(id: string, onEnded: () => void): VoiceHandle;
}

/** Once its caption is gone, a started line may finish for this long before it is faded. */
export const GRACE_MS = 1500;
export const FADE_MS = 250;
/** A line cut by a newer caption gets a shorter ramp so the new one is not late. */
export const CROSSFADE_MS = 150;

interface Playing {
  cue: VoiceCue;
  handle: VoiceHandle;
  /** When its caption left the screen; null while still shown. */
  goneAt: number | null;
}

/**
 * One voice at a time, edge-triggered: a line starts when its caption appears, plays to the end
 * (cut only after GRACE_MS without its caption, or when a newer caption needs the voice), and
 * replays only after the caption has left and come back.
 */
export class VoiceDirector {
  private enabled = false;
  private shown = new Map<string, VoiceCue>();
  private pending: VoiceCue[] = [];
  private playing: Playing | null = null;

  private output: VoiceOutput;

  constructor(output: VoiceOutput) {
    this.output = output;
  }

  get current(): string | null {
    return this.playing?.cue.id ?? null;
  }

  setEnabled(enabled: boolean) {
    if (this.enabled === enabled) return;
    this.enabled = enabled;
    // Captions already on screen when voice is switched on are heard now, as if they had just appeared.
    this.shown.clear();
    this.pending = [];
    if (!enabled) this.cut(FADE_MS);
  }

  /** Call every ~60 ms with the captions on screen right now. */
  update(visible: readonly VoiceCue[], now: number) {
    if (!this.enabled) return;
    const next = new Map(visible.map((cue) => [cue.id, cue]));
    for (const cue of visible) if (!this.shown.has(cue.id) && cue.id !== this.playing?.cue.id) this.pending.push(cue);
    this.pending = this.pending.filter((cue) => next.has(cue.id));
    this.shown = next;

    const playing = this.playing;
    if (playing) {
      if (next.has(playing.cue.id)) playing.goneAt = null;
      else if (playing.goneAt === null) playing.goneAt = now;
      if (playing.goneAt !== null && now - playing.goneAt >= GRACE_MS) this.cut(FADE_MS);
    }

    const best = this.pending.reduce<VoiceCue | null>((top, cue) => (!top || cue.priority > top.priority ? cue : top), null);
    if (!best) return;
    const busy = this.playing;
    // The voice is taken unless the line on it is still on screen and at least as important.
    if (busy && busy.goneAt === null && busy.cue.priority >= best.priority) return;
    if (busy) this.cut(CROSSFADE_MS);
    this.pending = this.pending.filter((cue) => cue !== best);
    this.start(best);
  }

  /**
   * Stop what is speaking and forget what was waiting. `replay` also forgets what was already heard,
   * so captions still on screen (a tab coming back) are spoken again.
   */
  interrupt(replay = false) {
    this.pending = [];
    if (replay) this.shown.clear();
    this.cut(FADE_MS);
  }

  private start(cue: VoiceCue) {
    const entry: Playing = { cue, handle: { fadeOut() {} }, goneAt: null };
    this.playing = entry;
    entry.handle = this.output.play(cue.id, () => {
      if (this.playing === entry) this.playing = null;
    });
  }

  private cut(ms: number) {
    const playing = this.playing;
    this.playing = null;
    playing?.handle.fadeOut(ms);
  }
}
