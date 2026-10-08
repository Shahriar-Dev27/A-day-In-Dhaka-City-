// Offline mastering for the raw TTS clips: trim, filter, level-match, soft-limit, fade.
// Pure Node, no dependencies. Used by generate-narration.mjs; also runnable alone to re-master
// .audio-raw/*.wav after changing the settings below (no TTS needed).

export const TARGET_RMS_DB = -20; // loudness of the speaking part of every clip
export const PEAK_LIMIT = 0.89; // about -1 dBFS
const HEAD_PAD_S = 0.03;
const TAIL_PAD_S = 0.08;
const FADE_IN_S = 0.008;
const FADE_OUT_S = 0.04;
const LOW_CUT_HZ = 70; // removes DC and rumble
const HIGH_CUT_HZ = 7500; // tames the Griffin-Lim buzz above the voice

export function readWav(buffer) {
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE") throw new Error("Not a WAV file");
  let offset = 12;
  let format = null;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const body = offset + 8;
    if (id === "fmt ") format = { channels: buffer.readUInt16LE(body + 2), rate: buffer.readUInt32LE(body + 4), bits: buffer.readUInt16LE(body + 14) };
    if (id === "data") {
      if (!format || format.bits !== 16 || format.channels !== 1) throw new Error("Expected mono 16-bit PCM");
      const count = Math.floor(Math.min(size, buffer.length - body) / 2);
      const samples = new Float32Array(count);
      for (let i = 0; i < count; i++) samples[i] = buffer.readInt16LE(body + i * 2) / 32768;
      return { rate: format.rate, samples };
    }
    offset = body + size + (size % 2);
  }
  throw new Error("WAV has no data chunk");
}

export function writeWav(samples, rate) {
  const out = Buffer.alloc(44 + samples.length * 2);
  out.write("RIFF", 0, "ascii");
  out.writeUInt32LE(36 + samples.length * 2, 4);
  out.write("WAVEfmt ", 8, "ascii");
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20);
  out.writeUInt16LE(1, 22);
  out.writeUInt32LE(rate, 24);
  out.writeUInt32LE(rate * 2, 28);
  out.writeUInt16LE(2, 32);
  out.writeUInt16LE(16, 34);
  out.write("data", 36, "ascii");
  out.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) out.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32768))), 44 + i * 2);
  return out;
}

/** RBJ biquad, applied in place. */
function biquad(samples, rate, type, freq, q = Math.SQRT1_2) {
  const w = (2 * Math.PI * freq) / rate;
  const alpha = Math.sin(w) / (2 * q);
  const cos = Math.cos(w);
  const [b0, b1, b2] = type === "lowpass" ? [(1 - cos) / 2, 1 - cos, (1 - cos) / 2] : [(1 + cos) / 2, -(1 + cos), (1 + cos) / 2];
  const a0 = 1 + alpha;
  const [nb0, nb1, nb2, na1, na2] = [b0 / a0, b1 / a0, b2 / a0, (-2 * cos) / a0, (1 - alpha) / a0];
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < samples.length; i++) {
    const x = samples[i];
    const y = nb0 * x + nb1 * x1 + nb2 * x2 - na1 * y1 - na2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    samples[i] = y;
  }
}

export function masterVoice(wav) {
  const { rate } = wav;
  let samples = Float32Array.from(wav.samples);
  biquad(samples, rate, "highpass", LOW_CUT_HZ);
  biquad(samples, rate, "lowpass", HIGH_CUT_HZ);

  let peak = 0;
  for (const v of samples) peak = Math.max(peak, Math.abs(v));
  if (peak === 0) throw new Error("Clip is silent");
  const floor = peak * 0.03;
  let start = 0;
  while (start < samples.length && Math.abs(samples[start]) < floor) start++;
  let end = samples.length - 1;
  while (end > start && Math.abs(samples[end]) < floor) end--;
  start = Math.max(0, start - Math.round(HEAD_PAD_S * rate));
  end = Math.min(samples.length - 1, end + Math.round(TAIL_PAD_S * rate));
  samples = samples.slice(start, end + 1);

  // RMS over the speaking part only, so pauses inside a line do not skew the level.
  let sum = 0, count = 0;
  for (const v of samples) if (Math.abs(v) > floor) { sum += v * v; count++; }
  const gain = 10 ** (TARGET_RMS_DB / 20) / Math.sqrt(sum / Math.max(count, 1));
  const knee = 0.6;
  const room = PEAK_LIMIT - knee;
  for (let i = 0; i < samples.length; i++) {
    const y = samples[i] * gain;
    const mag = Math.abs(y);
    samples[i] = mag > knee ? Math.sign(y) * (knee + room * Math.tanh((mag - knee) / room)) : y;
  }

  const fadeIn = Math.round(FADE_IN_S * rate);
  const fadeOut = Math.round(FADE_OUT_S * rate);
  for (let i = 0; i < fadeIn && i < samples.length; i++) samples[i] *= i / fadeIn;
  for (let i = 0; i < fadeOut && i < samples.length; i++) samples[samples.length - 1 - i] *= i / fadeOut;

  return { rate, samples, seconds: Math.round((samples.length / rate) * 1000) / 1000 };
}
