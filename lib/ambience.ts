// Synthesized city ambience, one bed per scene. Everything is built from noise, oscillators and
// filters in Web Audio, so there are no sound files to license or load. The bed table is plain data
// (tests read it); `Ambience` turns it into nodes. Levels here are relative to each other: the
// engine (lib/webaudio.ts) sets the overall level and ducks it under speech.

export type NoiseColor = "white" | "pink" | "brown";
export type OneShot = "clink" | "bell" | "horn" | "chime" | "crow" | "crackle" | "clack";

interface LayerBase {
  /** Level inside the bed, 0..1. */
  gain: number;
  /** Scale with the jam's traffic intensity (0..1) instead of staying constant. */
  follows?: "intensity";
}
export type Layer = LayerBase &
  (
    | { kind: "noise"; color: NoiseColor; filter: BiquadFilterType; freq: number; q?: number; sweep?: { rate: number; depth: number }; pulse?: { rate: number; depth: number } }
    | { kind: "tone"; type: OscillatorType; freq: number; lowpass?: number; pulse?: { rate: number; depth: number } }
    | { kind: "crickets" }
    | { kind: "murmur" }
    | { kind: "sporadic"; sound: OneShot; gap: readonly [number, number] }
  );

export interface Bed {
  name: string;
  layers: readonly Layer[];
}

export const AMBIENCE_BEDS: Readonly<Record<number, Bed>> = {
  0: { name: "night air", layers: [
    { kind: "noise", color: "brown", filter: "lowpass", freq: 180, gain: 0.35 },
    { kind: "noise", color: "pink", filter: "bandpass", freq: 900, q: 0.5, gain: 0.05 },
    { kind: "crickets", gain: 0.08 },
  ] },
  1: { name: "fajr stove", layers: [
    { kind: "crickets", gain: 0.2 },
    { kind: "noise", color: "brown", filter: "lowpass", freq: 300, gain: 0.25 },
    { kind: "noise", color: "pink", filter: "bandpass", freq: 2200, q: 0.8, gain: 0.08, pulse: { rate: 3, depth: 0.6 } },
    { kind: "sporadic", sound: "crackle", gap: [0.4, 1.6], gain: 0.35 },
  ] },
  2: { name: "tea stall morning", layers: [
    { kind: "murmur", gain: 0.45 },
    { kind: "noise", color: "brown", filter: "lowpass", freq: 400, gain: 0.12 },
    { kind: "sporadic", sound: "clink", gap: [1.5, 4], gain: 0.25 },
    { kind: "sporadic", sound: "bell", gap: [5, 10], gain: 0.2 },
  ] },
  3: { name: "traffic jam", layers: [
    { kind: "noise", color: "brown", filter: "lowpass", freq: 600, gain: 0.6, follows: "intensity" },
    { kind: "noise", color: "pink", filter: "bandpass", freq: 900, q: 0.6, gain: 0.25, follows: "intensity" },
    { kind: "sporadic", sound: "horn", gap: [0.9, 2.6], gain: 0.35, follows: "intensity" },
    { kind: "sporadic", sound: "bell", gap: [3, 6], gain: 0.25 },
    { kind: "murmur", gain: 0.1 },
  ] },
  4: { name: "metro car", layers: [
    { kind: "tone", type: "sawtooth", freq: 100, lowpass: 400, gain: 0.18 },
    { kind: "noise", color: "brown", filter: "lowpass", freq: 160, gain: 0.5, pulse: { rate: 0.4, depth: 0.3 } },
    { kind: "noise", color: "white", filter: "highpass", freq: 4000, gain: 0.02 },
    { kind: "sporadic", sound: "clack", gap: [1.2, 2.4], gain: 0.4 },
    { kind: "sporadic", sound: "chime", gap: [9, 14], gain: 0.3 },
  ] },
  5: { name: "noon heat", layers: [
    { kind: "noise", color: "white", filter: "bandpass", freq: 5800, q: 6, gain: 0.15, pulse: { rate: 38, depth: 0.5 } },
    { kind: "noise", color: "white", filter: "bandpass", freq: 4300, q: 5, gain: 0.1, pulse: { rate: 33, depth: 0.5 } },
    { kind: "tone", type: "sine", freq: 100, gain: 0.1 },
    { kind: "noise", color: "pink", filter: "lowpass", freq: 500, gain: 0.12 },
    { kind: "sporadic", sound: "bell", gap: [8, 14], gain: 0.15 },
  ] },
  6: { name: "rooftop wind", layers: [
    { kind: "noise", color: "pink", filter: "bandpass", freq: 500, q: 0.6, gain: 0.5, sweep: { rate: 0.12, depth: 250 } },
    { kind: "noise", color: "white", filter: "highpass", freq: 2500, gain: 0.04, pulse: { rate: 5, depth: 0.8 } },
    { kind: "noise", color: "brown", filter: "lowpass", freq: 300, gain: 0.2 },
    { kind: "sporadic", sound: "crow", gap: [6, 12], gain: 0.22 },
  ] },
  7: { name: "evening adda", layers: [
    { kind: "murmur", gain: 0.5 },
    { kind: "noise", color: "brown", filter: "lowpass", freq: 350, gain: 0.12 },
    { kind: "crickets", gain: 0.1 },
    { kind: "sporadic", sound: "clink", gap: [1.2, 3.5], gain: 0.28 },
    { kind: "sporadic", sound: "bell", gap: [6, 12], gain: 0.15 },
  ] },
  8: { name: "sleeping city", layers: [
    { kind: "crickets", gain: 0.2 },
    { kind: "noise", color: "brown", filter: "lowpass", freq: 150, gain: 0.2 },
    { kind: "tone", type: "sine", freq: 60, gain: 0.08 },
  ] },
};

export const bedForScene = (scene: number): Bed => AMBIENCE_BEDS[scene] ?? AMBIENCE_BEDS[0];

const FADE_S = 1.5;
const rand = (min: number, max: number) => min + Math.random() * (max - min);

interface BedInstance {
  scene: number;
  gain: GainNode;
  intensity: GainNode[];
  stops: (() => void)[];
}

export class Ambience {
  private ctx: AudioContext;
  private out: AudioNode;
  private buffers = new Map<NoiseColor, AudioBuffer>();
  private bed: BedInstance | null = null;
  private level = 0.35;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.out = destination;
  }

  /** Crossfade to the bed for `scene` (no-op when it is already playing). */
  setScene(scene: number) {
    if (this.bed?.scene === scene) return;
    const old = this.bed;
    const bed = this.build(scene);
    this.bed = bed;
    const now = this.ctx.currentTime;
    bed.gain.gain.setValueAtTime(0, now);
    bed.gain.gain.linearRampToValueAtTime(1, now + FADE_S);
    if (old) {
      old.gain.gain.cancelScheduledValues(now);
      old.gain.gain.setValueAtTime(old.gain.gain.value, now);
      old.gain.gain.linearRampToValueAtTime(0, now + FADE_S);
      setTimeout(() => this.dispose(old), (FADE_S + 0.3) * 1000);
    }
  }

  /** 0..1 traffic density for layers that follow it (the jam). */
  setIntensity(value: number) {
    this.level = 0.35 + 0.65 * Math.min(1, Math.max(0, value));
    const now = this.ctx.currentTime;
    for (const node of this.bed?.intensity ?? []) node.gain.setTargetAtTime(this.level, now, 0.3);
  }

  /** Fade out and release everything (sound switched off). */
  stop() {
    const old = this.bed;
    this.bed = null;
    if (!old) return;
    const now = this.ctx.currentTime;
    old.gain.gain.cancelScheduledValues(now);
    old.gain.gain.setValueAtTime(old.gain.gain.value, now);
    old.gain.gain.linearRampToValueAtTime(0, now + 0.4);
    setTimeout(() => this.dispose(old), 700);
  }

  private dispose(bed: BedInstance) {
    bed.stops.forEach((stop) => stop());
    bed.gain.disconnect();
  }

  private noiseBuffer(color: NoiseColor): AudioBuffer {
    const cached = this.buffers.get(color);
    if (cached) return cached;
    const seconds = color === "white" ? 2 : 4;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * seconds, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      if (color === "white") data[i] = white * 0.5;
      else if (color === "pink") {
        b0 = 0.99886 * b0 + white * 0.0555179; b1 = 0.99332 * b1 + white * 0.0750759; b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856; b4 = 0.55 * b4 + white * 0.5329522; b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      }
    }
    // Cross-fade the seam so the loop does not click.
    const seam = Math.floor(this.ctx.sampleRate * 0.05);
    for (let i = 0; i < seam; i++) {
      const t = i / seam;
      data[i] = data[i] * t + data[data.length - seam + i] * (1 - t);
    }
    this.buffers.set(color, buffer);
    return buffer;
  }

  private noiseSource(color: NoiseColor): AudioBufferSourceNode {
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer(color);
    source.loop = true;
    return source;
  }

  private lfo(rate: number, depth: number, target: AudioParam, stops: (() => void)[]) {
    const osc = this.ctx.createOscillator();
    const amount = this.ctx.createGain();
    osc.frequency.value = rate;
    amount.gain.value = depth;
    osc.connect(amount).connect(target);
    osc.start();
    stops.push(() => { try { osc.stop(); } catch { /* already stopped */ } });
  }

  private build(scene: number): BedInstance {
    const gain = this.ctx.createGain();
    gain.connect(this.out);
    const bed: BedInstance = { scene, gain, intensity: [], stops: [] };
    for (const layer of bedForScene(scene).layers) {
      const level = this.ctx.createGain();
      level.gain.value = layer.gain;
      if (layer.follows === "intensity") {
        const follow = this.ctx.createGain();
        follow.gain.value = this.level;
        level.connect(follow).connect(gain);
        bed.intensity.push(follow);
      } else level.connect(gain);
      this.addLayer(layer, level, bed);
    }
    return bed;
  }

  /** Wire one layer's sources into its `level` gain. */
  private addLayer(layer: Layer, level: GainNode, bed: BedInstance) {
    const { ctx } = this;
    const stops = bed.stops;
    const startSource = (source: AudioBufferSourceNode | OscillatorNode, offset = 0) => {
      if (source instanceof AudioBufferSourceNode) source.start(0, offset);
      else source.start();
      stops.push(() => { try { source.stop(); } catch { /* already stopped */ } });
    };
    const pulse = (spec: { rate: number; depth: number } | undefined, node: GainNode, base: number) => {
      if (!spec) return;
      node.gain.value = base * (1 - spec.depth / 2);
      this.lfo(spec.rate, base * spec.depth / 2, node.gain, stops);
    };

    if (layer.kind === "noise") {
      const source = this.noiseSource(layer.color);
      const filter = ctx.createBiquadFilter();
      filter.type = layer.filter;
      filter.frequency.value = layer.freq;
      filter.Q.value = layer.q ?? 0.7;
      const shaped = ctx.createGain();
      source.connect(filter).connect(shaped).connect(level);
      pulse(layer.pulse, shaped, 1);
      if (layer.sweep) this.lfo(layer.sweep.rate, layer.sweep.depth, filter.frequency, stops);
      startSource(source, Math.random() * 2);
    } else if (layer.kind === "tone") {
      const osc = ctx.createOscillator();
      osc.type = layer.type;
      osc.frequency.value = layer.freq;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = layer.lowpass ?? 2000;
      const shaped = ctx.createGain();
      osc.connect(filter).connect(shaped).connect(level);
      pulse(layer.pulse, shaped, 1);
      startSource(osc);
    } else if (layer.kind === "crickets") {
      for (const [freq, rate] of [[4300, 6.5], [4700, 7.3]] as const) {
        const osc = ctx.createOscillator();
        osc.frequency.value = freq;
        const chirp = ctx.createGain();
        const group = ctx.createGain();
        osc.connect(chirp).connect(group).connect(level);
        chirp.gain.value = 0.25;
        this.lfo(rate, 0.25, chirp.gain, stops);
        group.gain.value = 0.55;
        this.lfo(rate / 18, 0.45, group.gain, stops);
        startSource(osc);
      }
    } else if (layer.kind === "murmur") {
      for (const [freq, q, rate, depth] of [[500, 0.7, 0.7, 0.4], [1500, 1, 1.1, 0.5]] as const) {
        const source = this.noiseSource("pink");
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = freq;
        filter.Q.value = q;
        const shaped = ctx.createGain();
        source.connect(filter).connect(shaped).connect(level);
        pulse({ rate, depth }, shaped, 1);
        startSource(source, Math.random() * 3);
      }
    } else {
      let timer = 0;
      let live = true;
      const fire = () => {
        if (!live) return;
        this.oneShot(layer.sound, level);
        timer = window.setTimeout(fire, rand(layer.gap[0], layer.gap[1]) * 1000);
      };
      timer = window.setTimeout(fire, rand(0.3, layer.gap[1]) * 1000);
      stops.push(() => { live = false; window.clearTimeout(timer); });
    }
  }

  private envelope(out: AudioNode, start: number, peak: number, attack: number, decay: number): GainNode {
    const node = this.ctx.createGain();
    node.gain.setValueAtTime(0.0001, start);
    node.gain.exponentialRampToValueAtTime(peak, start + attack);
    node.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay);
    node.connect(out);
    return node;
  }

  private ping(out: AudioNode, start: number, freq: number, peak: number, decay: number) {
    const osc = this.ctx.createOscillator();
    osc.frequency.value = freq;
    osc.connect(this.envelope(out, start, peak, 0.003, decay));
    osc.start(start);
    osc.stop(start + decay + 0.05);
  }

  private burst(out: AudioNode, start: number, seconds: number, peak: number, filter: BiquadFilterType, freq: number) {
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer("white");
    const shaped = this.ctx.createBiquadFilter();
    shaped.type = filter;
    shaped.frequency.value = freq;
    source.connect(shaped).connect(this.envelope(out, start, peak, 0.002, seconds));
    source.start(start, Math.random());
    source.stop(start + seconds + 0.05);
  }

  private oneShot(sound: OneShot, out: AudioNode) {
    const t = this.ctx.currentTime + 0.02;
    switch (sound) {
      case "clink": {
        const f = rand(2400, 3600);
        this.ping(out, t, f, 0.6, 0.14);
        this.ping(out, t, f * 1.5, 0.2, 0.09);
        break;
      }
      case "bell":
        for (const dt of [0, 0.18]) {
          this.ping(out, t + dt, 1900, 0.5, 0.35);
          this.ping(out, t + dt, 2850, 0.2, 0.25);
        }
        break;
      case "horn": {
        const f = rand(380, 520);
        const lowpass = this.ctx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.value = 1400;
        const hold = rand(0.2, 0.5);
        const env = this.ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.exponentialRampToValueAtTime(0.5, t + 0.02);
        env.gain.setValueAtTime(0.5, t + hold);
        env.gain.exponentialRampToValueAtTime(0.0001, t + hold + 0.06);
        lowpass.connect(env).connect(out);
        for (const ratio of [1, 1.25]) {
          const osc = this.ctx.createOscillator();
          osc.type = "square";
          osc.frequency.value = f * ratio;
          osc.connect(lowpass);
          osc.start(t);
          osc.stop(t + hold + 0.1);
        }
        break;
      }
      case "chime":
        this.ping(out, t, 880, 0.5, 0.9);
        this.ping(out, t + 0.35, 660, 0.5, 1.1);
        break;
      case "crow":
        for (const dt of Math.random() < 0.8 ? [0, 0.35] : [0]) {
          const osc = this.ctx.createOscillator();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(650, t + dt);
          osc.frequency.exponentialRampToValueAtTime(420, t + dt + 0.25);
          const band = this.ctx.createBiquadFilter();
          band.type = "bandpass";
          band.frequency.value = 1000;
          band.Q.value = 2;
          osc.connect(band).connect(this.envelope(out, t + dt, 0.5, 0.03, 0.22));
          osc.start(t + dt);
          osc.stop(t + dt + 0.35);
        }
        break;
      case "crackle":
        for (let i = 0; i < Math.floor(rand(3, 7)); i++) this.burst(out, t + i * rand(0.01, 0.06), 0.006, rand(0.2, 0.7), "highpass", 2000);
        break;
      case "clack":
        for (const dt of [0, 0.12]) {
          this.ping(out, t + dt, 90, 0.7, 0.08);
          this.burst(out, t + dt, 0.05, 0.4, "lowpass", 600);
        }
        break;
    }
  }
}
