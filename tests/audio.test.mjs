import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import test from "node:test";
import { CROSSFADE_MS, FADE_MS, GRACE_MS, VoiceDirector } from "../lib/audio.ts";
import { COPY } from "../lib/copy.ts";
import { VOICE_CLIPS, VOICE_RATE, voiceIdFor, voiceUrl } from "../lib/voice.ts";
import { AMBIENCE_BEDS, bedForScene } from "../lib/ambience.ts";
import { SCENES } from "../lib/scenes.ts";

function setup() {
  const log = [];
  const live = new Map();
  const output = {
    play(id, onEnded) {
      const entry = { id, fades: [], onEnded };
      live.set(id, entry);
      log.push(id);
      return { fadeOut: (ms) => entry.fades.push(ms) };
    },
  };
  const director = new VoiceDirector(output);
  const cue = (id, priority = 2) => ({ id, priority });
  return { director, log, live, cue };
}

test("voice is opt-in: nothing plays until enabled, then captions already on screen are spoken", () => {
  const { director, log, cue } = setup();
  director.update([cue("a")], 0);
  assert.deepEqual(log, []);
  director.setEnabled(true);
  director.update([cue("a")], 100);
  assert.deepEqual(log, ["a"]);
});

test("a line plays once while its caption stays up and again after the caption returns", () => {
  const { director, log, live, cue } = setup();
  director.setEnabled(true);
  director.update([cue("a")], 0);
  live.get("a").onEnded();
  director.update([cue("a")], 200);
  assert.deepEqual(log, ["a"]);
  director.update([], 400);
  director.update([cue("a")], 600);
  assert.deepEqual(log, ["a", "a"]);
});

test("a line is not cut when its caption leaves; only after the grace period", () => {
  const { director, live, cue } = setup();
  director.setEnabled(true);
  director.update([cue("a")], 0);
  director.update([], 1000);
  assert.deepEqual(live.get("a").fades, []);
  director.update([], 1000 + GRACE_MS - 1);
  assert.deepEqual(live.get("a").fades, []);
  director.update([], 1000 + GRACE_MS);
  assert.deepEqual(live.get("a").fades, [FADE_MS]);
});

test("a caption that returns inside the grace period keeps its line", () => {
  const { director, live, cue } = setup();
  director.setEnabled(true);
  director.update([cue("a")], 0);
  director.update([], 500);
  director.update([cue("a")], 900);
  director.update([cue("a")], 500 + GRACE_MS + 500);
  assert.deepEqual(live.get("a").fades, []);
});

test("a new caption waits for a line that is still on screen, then plays", () => {
  const { director, log, live, cue } = setup();
  director.setEnabled(true);
  director.update([cue("a")], 0);
  director.update([cue("a"), cue("b")], 100);
  assert.deepEqual(log, ["a"]);
  live.get("a").onEnded();
  director.update([cue("a"), cue("b")], 200);
  assert.deepEqual(log, ["a", "b"]);
});

test("a new caption crossfades over a line whose caption is gone", () => {
  const { director, log, live, cue } = setup();
  director.setEnabled(true);
  director.update([cue("a")], 0);
  director.update([cue("b")], 300);
  assert.deepEqual(log, ["a", "b"]);
  assert.deepEqual(live.get("a").fades, [CROSSFADE_MS]);
});

test("dialogue outranks set dressing, which waits and is dropped if its caption leaves", () => {
  const { director, log, live, cue } = setup();
  director.setEnabled(true);
  director.update([cue("sign", 1)], 0);
  director.update([cue("sign", 1), cue("slip", 2)], 100);
  assert.deepEqual(log, ["sign", "slip"]);
  assert.deepEqual(live.get("sign").fades, [CROSSFADE_MS]);
  director.update([cue("led", 1), cue("slip", 2)], 200);
  director.update([cue("slip", 2)], 300);
  live.get("slip").onEnded();
  director.update([cue("slip", 2)], 400);
  assert.deepEqual(log, ["sign", "slip"]);
});

test("muting fades the current line and forgets the queue; re-enabling hears what is on screen", () => {
  const { director, log, live, cue } = setup();
  director.setEnabled(true);
  director.update([cue("a")], 0);
  director.setEnabled(false);
  assert.deepEqual(live.get("a").fades, [FADE_MS]);
  director.update([cue("a")], 100);
  assert.deepEqual(log, ["a"]);
  director.setEnabled(true);
  director.update([cue("a")], 200);
  assert.deepEqual(log, ["a", "a"]);
});

test("interrupt stops speech; replay forgets what was heard so a returning tab hears the caption again", () => {
  const { director, log, cue } = setup();
  director.setEnabled(true);
  director.update([cue("a")], 0);
  director.interrupt();
  director.update([cue("a")], 100);
  assert.deepEqual(log, ["a"]);
  director.interrupt(true);
  director.update([cue("a")], 200);
  assert.deepEqual(log, ["a", "a"]);
});

test("a stale ended callback cannot free the voice for a newer line", () => {
  const { director, log, live, cue } = setup();
  director.setEnabled(true);
  director.update([cue("a")], 0);
  const stale = live.get("a").onEnded;
  director.update([cue("b")], 100);
  stale();
  assert.equal(director.current, "b");
  director.update([cue("b"), cue("c")], 200);
  assert.deepEqual(log, ["a", "b"]);
});

test("every Bangla line in the copy has a unique clip, with the right priority and rate", () => {
  const ids = VOICE_CLIPS.map((clip) => clip.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(VOICE_CLIPS.map((clip) => clip.bn)).size, VOICE_CLIPS.length, "caption text must map to one clip");
  const lines = [];
  for (const copy of Object.values(COPY)) {
    if (copy.narration) lines.push(copy.narration);
    lines.push(...copy.overheard, ...(copy.giant ?? []));
    if (copy.announcement) lines.push(copy.announcement);
    if (copy.extra?.title) lines.push(copy.extra.title);
    if (copy.extra?.closing) lines.push(copy.extra.closing);
  }
  for (const line of lines) assert.ok(voiceIdFor(line.bn), `no clip for ${line.bn}`);
  assert.equal(VOICE_CLIPS.length, lines.length);
  for (const clip of VOICE_CLIPS) {
    assert.ok(VOICE_RATE[clip.who] > 0.8 && VOICE_RATE[clip.who] < 1.3, `rate for ${clip.who}`);
    assert.equal(clip.priority, clip.kind === "narration" || clip.kind === "overheard" ? 2 : 1);
  }
});

test("shipped voice files match the clip list and manifest", () => {
  const manifestPath = new URL("../public/audio/narration.json", import.meta.url);
  assert.ok(existsSync(manifestPath), "run npm run audio:generate");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.deepEqual(manifest.clips.map((clip) => clip.id).sort(), VOICE_CLIPS.map((clip) => clip.id).sort());
  for (const clip of manifest.clips) {
    const text = VOICE_CLIPS.find((candidate) => candidate.id === clip.id)?.bn;
    assert.equal(clip.text, text, `${clip.id} was rendered from different text; regenerate`);
    const file = new URL(`../public${voiceUrl(clip.id)}`, import.meta.url);
    assert.ok(existsSync(file), `missing ${clip.id}.wav`);
    assert.ok(clip.seconds > 0.3 && clip.seconds < 8, `${clip.id} duration ${clip.seconds}`);
  }
});

test("ambience has a bed for every scene, with sane levels", () => {
  for (const scene of SCENES) {
    const bed = bedForScene(scene.id);
    assert.ok(bed, `scene ${scene.id}`);
    assert.ok(bed.layers.length > 0);
    for (const layer of bed.layers) assert.ok(layer.gain > 0 && layer.gain <= 1);
  }
  assert.equal(Object.keys(AMBIENCE_BEDS).length, SCENES.length);
  assert.equal(bedForScene(99).name, bedForScene(0).name, "unknown scene falls back to the intro bed");
});
