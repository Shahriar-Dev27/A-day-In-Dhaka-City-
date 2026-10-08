// Browser audio engine: one AudioContext shared by the spoken lines and the ambience.
// Created inside the Sound button's click handler (autoplay rules); never before.
import { Ambience } from "./ambience.ts";
import type { VoiceHandle, VoiceOutput } from "./audio.ts";
import { VOICE_RATE, voiceClip, voiceUrl } from "./voice.ts";

const AMBIENCE_LEVEL = 0.5;
const DUCKED = 0.5; // ambience level while someone speaks (about -6 dB)

export class AudioEngine implements VoiceOutput {
  readonly ctx: AudioContext;
  readonly ambience: Ambience;
  private voiceBus: GainNode;
  private duck: GainNode;
  private buffers = new Map<string, Promise<AudioBuffer | null>>();
  private speaking = 0;

  constructor() {
    const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Context();
    // A gentle compressor keeps a horn, a chime and a voice from stacking into clipping.
    const limiter = this.ctx.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.ratio.value = 4;
    limiter.connect(this.ctx.destination);
    this.voiceBus = this.ctx.createGain();
    this.voiceBus.connect(limiter);
    this.duck = this.ctx.createGain();
    this.duck.connect(limiter);
    const ambienceBus = this.ctx.createGain();
    ambienceBus.gain.value = AMBIENCE_LEVEL;
    ambienceBus.connect(this.duck);
    this.ambience = new Ambience(this.ctx, ambienceBus);
  }

  resume() {
    return this.ctx.state === "running" ? Promise.resolve() : this.ctx.resume();
  }

  suspend() {
    return this.ctx.state === "suspended" ? Promise.resolve() : this.ctx.suspend();
  }

  close() {
    this.ambience.stop();
    return this.ctx.close();
  }

  /** Fetch and decode a clip once; a missing or undecodable file resolves to null. */
  load(id: string): Promise<AudioBuffer | null> {
    let loaded = this.buffers.get(id);
    if (!loaded) {
      loaded = fetch(voiceUrl(id))
        .then((response) => (response.ok ? response.arrayBuffer() : Promise.reject(new Error(String(response.status)))))
        .then((data) => this.ctx.decodeAudioData(data))
        .catch(() => {
          this.buffers.delete(id); // allow a retry on the next cue
          return null;
        });
      this.buffers.set(id, loaded);
    }
    return loaded;
  }

  preload(ids: readonly string[]) {
    for (const id of ids) void this.load(id);
  }

  play(id: string, onEnded: () => void): VoiceHandle {
    let cancelled = false;
    let fade: ((ms: number) => void) | null = null;
    void this.load(id).then((buffer) => {
      if (cancelled) return;
      if (!buffer) return onEnded();
      const source = this.ctx.createBufferSource();
      const gain = this.ctx.createGain();
      source.buffer = buffer;
      source.playbackRate.value = VOICE_RATE[voiceClip(id)?.who ?? "narrator"];
      source.connect(gain).connect(this.voiceBus);
      let released = false;
      const release = () => {
        if (released) return;
        released = true;
        source.disconnect();
        gain.disconnect();
        this.setSpeaking(-1);
      };
      source.onended = () => {
        const natural = !cancelled;
        release();
        if (natural) onEnded();
      };
      fade = (ms) => {
        const now = this.ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + ms / 1000);
        try { source.stop(now + ms / 1000 + 0.02); } catch { /* not started */ }
      };
      this.setSpeaking(1);
      source.start();
    });
    return {
      fadeOut: (ms) => {
        if (cancelled) return;
        cancelled = true;
        fade?.(ms);
      },
    };
  }

  /** Lower the ambience while anyone is speaking. */
  private setSpeaking(delta: number) {
    this.speaking = Math.max(0, this.speaking + delta);
    const now = this.ctx.currentTime;
    this.duck.gain.setTargetAtTime(this.speaking > 0 ? DUCKED : 1, now, this.speaking > 0 ? 0.08 : 0.4);
  }
}
