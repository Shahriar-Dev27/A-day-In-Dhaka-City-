import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { ANCHORS, CX, JAM_RATIO, LAYERS, LAYER_W, LIFT, PH, centreX, makeCamera, panSpeed, wheelFactor } from "../components/scenes/jam/layout.ts";
import { COPY } from "../lib/copy.ts";

const SIZES = { desktop: 800, phone: 208 }; // c0 = half the screen in art units (1600 / 416 wide)

test("jam camera: monotone, starts at the street's left edge, ends exactly on the pier, never overshoots", () => {
  for (const c0 of Object.values(SIZES)) {
    const cam = makeCamera(c0);
    assert.ok(Math.abs(cam.cx(0) - c0) < 1e-6);
    let prev = -Infinity;
    for (let i = 0; i <= 1000; i++) {
      const x = cam.cx(i / 1000);
      assert.ok(x >= prev - 1e-9, `non-monotone at ${i / 1000}`);
      assert.ok(x <= CX.end + 1e-6, `overshoot at ${i / 1000}: ${x}`);
      prev = x;
    }
    assert.ok(Math.abs(cam.cx(1) - CX.end) < 1e-6);
    assert.ok(Math.abs(cam.cx(PH.arrive) - CX.end) < 1e-6, "the pan has arrived before the lift ends");
  }
});

test("jam beat: pan speed falls to ~20% for ~13% of the slot, then bursts above the approach pace", () => {
  assert.equal(panSpeed(0.1), 1);
  assert.ok(Math.abs(panSpeed(0.37) - JAM_RATIO) < 1e-9);
  assert.ok(PH.jamOut - PH.jamLock >= 0.12 && PH.jamOut - PH.jamLock <= 0.16, "jam holds ~15% of the slot");
  assert.ok(panSpeed(PH.burst) > 2 * panSpeed(0.1), "bursts free");
  for (const c0 of Object.values(SIZES)) {
    const cam = makeCamera(c0);
    const v = (a, b) => (cam.cx(b) - cam.cx(a)) / (b - a);
    const ratio = v(PH.jamLock + 0.01, PH.jamOut - 0.01) / v(0.05, 0.2);
    assert.ok(Math.abs(ratio - JAM_RATIO) < 0.02, `phone/desktop jam ratio ${ratio}`);
    // the jam is where the commuter is on both screens: the camera sits on the jam stop at the start of the lock
    assert.ok(Math.abs(cam.cx(PH.jamLock) - CX.jam) < 1);
  }
});

test("lift: nothing moves before it, it ends flat (no overshoot), and it ends before the closing line is fully in", () => {
  const cam = makeCamera(800);
  assert.equal(cam.lift(PH.liftIn - 0.01), 0);
  assert.equal(cam.lift(PH.liftOut), LIFT);
  assert.equal(cam.lift(1), LIFT);
  for (let i = 0; i <= 100; i++) assert.ok(cam.lift(i / 100) <= LIFT + 1e-9);
  assert.ok(PH.liftOut <= 0.88, "narration (0.82-0.96) is fully visible only after the pier has finished rising");
});

test("layers: every anchor is inside its art, and the first frame of every layer starts at x >= half a desktop screen", () => {
  for (const id of LAYERS) {
    for (const c0 of Object.values(SIZES)) {
      const cam = makeCamera(c0);
      for (let i = 0; i <= 200; i++) {
        const x = centreX(id, cam.cx(i / 200), c0);
        assert.ok(x - 800 >= -1e-6 || id === "street", `${id} shows empty space left of x=0 at ${c0}`);
        assert.ok(x + 800 <= LAYER_W[id] + 1e-6, `${id} runs out of art on the right (centre ${x}, width ${LAYER_W[id]})`);
      }
    }
  }
  assert.deepEqual(Object.keys(ANCHORS).sort(), [...LAYERS].sort());
});

test("wheels: buses and CNGs stand still once the jam has locked; rickshaws and bikes never stop dead", () => {
  assert.equal(wheelFactor("heavy", 0.4), 0);
  assert.equal(wheelFactor("heavy", 0.9), 0);
  assert.ok(wheelFactor("heavy", 0.1) > 0.5);
  for (let i = 0; i <= 100; i++) assert.ok(wheelFactor("free", i / 100) >= 0.15);
});

test("scene 3 copy: the three giant words and the closing line are the SCRIPT-v2 phrases, in real Bangla", () => {
  assert.deepEqual(COPY[3].giant.map((w) => w.bn), ["আসতেছি", "জ্যাম", "সামনে আগান"]);
  assert.equal(COPY[3].narration.bn, "৯টা বাজে, ঢাকা থামে না");
  assert.equal(COPY[3].overheard[0].bn, "আসতেছি, পাঁচ মিনিট।");
});

test("jam art: no hex, no brand names, no pseudo-glyph signs, every Bangla sign is real text", () => {
  const dir = fileURLToPath(new URL("../components/scenes/jam/", import.meta.url));
  const files = readdirSync(dir).map((f) => join(dir, f));
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    assert.doesNotMatch(src, /#[0-9a-f]{6}\b|#[0-9a-f]{3}\b(?![\w-])/i, f);
    assert.doesNotMatch(src, /bKash|Nagad|Pathao|Uber|DMTCL|Grameen|Robi|Banglalink|Shohoz/i, f);
  }
  const street = readFileSync(join(dir, "street.tsx"), "utf8");
  const signs = [...street.matchAll(/(?:text|route): "([^"]+)"/g)].map((m) => m[1]);
  assert.ok(signs.length >= 7);
  for (const s of signs) assert.match(s, /^[ঀ-৿\s\-]+$/u, `sign "${s}" must be Bangla script`);
});
