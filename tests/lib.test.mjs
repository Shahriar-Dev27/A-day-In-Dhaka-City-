// Zero-dependency unit checks for the shared contract modules (Node 24 strips TS types natively).
// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { SCENES, SCENE_OFFSETS, SCROLL_RANGE_SVH, TOTAL_SVH, progressToClockMinutes, skyAnchors, textWindowSvh } from "../lib/scenes.ts";
import { CLOCK, CUE, METRO, SLIP, cssVars, cueVars, metroVars, palette, toCssVarObject, via } from "../lib/palette.ts";
import { COPY, DAYPART } from "../lib/copy.ts";
import { GROUND_Y, SAFE_COLUMN, STROKE, TONG_ORIGIN, blob, ribbon, rng, wobbleRect } from "../components/scenes/tong/geometry.ts";

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (c) => {
  const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const LAST = SCENES.length - 1;

test("scene registry: offsets and ranges are consistent", () => {
  assert.deepEqual(SCENES.map((s) => s.id), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(SCENES.map((s) => s.scrollLength), [100, 200, 200, 450, 280, 200, 200, 230, 220]);
  assert.deepEqual(SCENES.map((s) => s.clockMinutes), [null, 285, 420, 540, 580, 780, 990, 1170, 1425]);
  assert.deepEqual([...SCENE_OFFSETS], [0, 100, 300, 500, 950, 1230, 1430, 1630, 1860]);
  assert.equal(TOTAL_SVH, 2080);
  assert.equal(SCROLL_RANGE_SVH, 1980);
  assert.deepEqual(SCENES.map((s) => s.triggerStartSvh), [0, -70, -70, 0, 0, -70, -70, -70, -70]);
  for (const s of SCENES) assert.ok(s.narration.in >= 0 && s.narration.in < s.narration.outEnd && s.narration.outEnd <= 1, `scene ${s.id} narration window`);
});

test("progressToClockMinutes: hits every scene anchor at its slot start (incl. 9:40 = 580)", () => {
  for (let i = 1; i < SCENES.length; i++) {
    assert.equal(Math.round(progressToClockMinutes(SCENE_OFFSETS[i] / SCROLL_RANGE_SVH)), SCENES[i].clockMinutes, `scene ${i}`);
  }
  assert.equal(Math.round(progressToClockMinutes(SCENE_OFFSETS[4] / SCROLL_RANGE_SVH)), 580);
});

test("progressToClockMinutes: 04:45 through Scene 0, 23:45 from the last scene to the end", () => {
  assert.equal(progressToClockMinutes(0), 285);
  assert.equal(progressToClockMinutes(SCENE_OFFSETS[1] / SCROLL_RANGE_SVH - 1e-6), 285);
  assert.equal(progressToClockMinutes(SCENE_OFFSETS[LAST] / SCROLL_RANGE_SVH), 1425);
  assert.equal(progressToClockMinutes(1), 1425);
});

test("progressToClockMinutes: clamps out-of-range input", () => {
  assert.equal(progressToClockMinutes(-0.5), 285);
  assert.equal(progressToClockMinutes(-Infinity), 285);
  assert.equal(progressToClockMinutes(1.5), 1425);
  assert.equal(progressToClockMinutes(Infinity), 1425);
});

test("progressToClockMinutes: monotonic and continuous (no jump at slot boundaries)", () => {
  let prev = progressToClockMinutes(0);
  for (let i = 1; i <= 1000; i++) {
    const m = progressToClockMinutes(i / 1000);
    assert.ok(m >= prev, `decreased at ${i / 1000}`);
    // Steepest segment: 255 minutes over 230svh (S7 -> S8) = 1.11 min/svh, sampled every 1.98svh = 2.2.
    assert.ok(m - prev <= 2.6, `jump of ${m - prev} min at ${i / 1000}`);
    prev = m;
  }
});

test("toCssVarObject: maps every token (incl. wall, tarp) to its CSS var, nothing else", () => {
  const o = toCssVarObject(palette[3]);
  assert.deepEqual(Object.keys(o).sort(), Object.values(cssVars).sort());
  for (const [k, v] of Object.entries(cssVars)) assert.equal(o[v], palette[3][k]);
  assert.equal(new Set(Object.values(cssVars)).size, Object.keys(cssVars).length);
  assert.equal(cssVars.wall, "--wall");
  assert.equal(cssVars.tarp, "--tarp");
});

test("palette, SLIP, CUE, METRO: every value is a 6-digit hex; var maps cover every key", () => {
  assert.equal(Object.keys(palette).length, 9);
  for (const [id, t] of Object.entries(palette)) for (const [k, v] of Object.entries(t)) assert.match(v, /^#[0-9A-F]{6}$/i, `${id}.${k}`);
  for (const [name, group] of Object.entries({ SLIP, CUE, METRO })) for (const [k, v] of Object.entries(group)) assert.match(v, /^#[0-9A-F]{6}$/i, `${name}.${k}`);
  assert.deepEqual(Object.keys(cueVars), Object.keys(CUE).map((k) => `--cue-${k}`));
  assert.deepEqual(Object.keys(metroVars), Object.keys(METRO).map((k) => `--metro-${k}`));
  assert.equal(CLOCK, SLIP);
  // dawn keyframe between scenes 1 and 2: complete token set, valid hex, not a copy of either neighbour
  for (const [id, t] of Object.entries(via)) {
    assert.deepEqual(Object.keys(t).sort(), Object.keys(palette[0]).sort(), `via ${id} keys`);
    for (const [k, v] of Object.entries(t)) assert.match(v, /^#[0-9A-F]{6}$/i, `via.${id}.${k}`);
    assert.notEqual(t.skyBottom, palette[Number(id)].skyBottom);
  }
});

test("Rickshaw Magenta: one fixed token (CUE.rickshaw), the accent of scenes 3, 6 and 7, never an alias of the dupatta", () => {
  assert.equal(CUE.rickshaw, "#D6336C");
  for (const n of [3, 6, 7]) assert.equal(palette[n].accent, CUE.rickshaw);
  assert.equal(cueVars["--cue-rickshaw"], CUE.rickshaw);
});

test("no hex colours in components/ or app/ (lib/palette.ts and CSS tokens own them)", () => {
  const walk = (dir) => readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|mjs)$/.test(f) ? [p] : [];
  });
  const root = fileURLToPath(new URL("..", import.meta.url));
  for (const file of [...walk(join(root, "components")), ...walk(join(root, "app"))]) {
    const src = readFileSync(file, "utf8").replace(/%23[0-9a-f]+/gi, ""); // data-URI fragment ids, not colours
    assert.doesNotMatch(src, /#[0-9a-f]{6}\b|#[0-9a-f]{3}\b(?![\w-])/i, file);
  }
});

test("copy: Bangla present, English <= 8 words (Scene 4 overheard <= 6), narration/overheard limits", () => {
  const words = (t) => t.trim().split(/\s+/u).length;
  const bnLines = [];
  for (const [id, c] of Object.entries(COPY)) {
    const lines = [...(c.narration ? [["narration", c.narration]] : []), ...c.overheard.map((l) => ["overheard", l]), ...(c.giant ?? []).map((l) => ["giant", l]), ...(c.announcement ? [["announcement", c.announcement]] : []), ...Object.entries(c.extra ?? {})];
    for (const [kind, l] of lines) {
      const max = id === "4" && kind === "overheard" ? 6 : 8;
      assert.ok(words(l.en) <= max, `scene ${id} ${kind}: "${l.en}" has ${words(l.en)} words`);
      if (kind !== "credit") assert.ok(l.bn.trim().length > 0, `scene ${id} ${kind}: empty bn`);
      bnLines.push(l.bn);
    }
    assert.ok(c.overheard.length <= (id === "4" ? 3 : id === "2" || id === "7" ? 2 : 1), `scene ${id} overheard count`);
    if (id !== "0") assert.ok(c.narration, `scene ${id} narration`);
  }
  assert.equal(COPY[4].overheard.length, 3);
  assert.ok(COPY[2].overheard.some((l) => l.who === "worker"));
  assert.ok(COPY[7].overheard.some((l) => l.who === "worker"));
  assert.equal(COPY[3].giant.length, 3);
  assert.ok(COPY[4].announcement);
  assert.ok(bnLines.length > 20);
});

test("copy: DAYPART is ordered and names the day's anchors correctly", () => {
  const at = (m) => [...DAYPART].reverse().find((d) => m >= d.from).bn;
  assert.deepEqual(DAYPART.map((d) => d.from), [...DAYPART.map((d) => d.from)].sort((a, b) => a - b));
  assert.deepEqual(SCENES.slice(1).map((s) => at(s.clockMinutes)), ["ভোর", "সকাল", "সকাল", "সকাল", "দুপুর", "বিকেল", "সন্ধ্যা", "রাত"]);
});

test("contrast at each scene plateau: text and muted text >= 4.5:1 on both sky stops", () => {
  for (const [id, t] of Object.entries(palette)) {
    for (const sky of ["skyTop", "skyBottom"]) {
      for (const fg of ["text", "textMuted"]) {
        const c = contrast(hex(t[fg]), hex(t[sky]));
        assert.ok(c >= 4.5, `scene ${id} ${fg}/${sky} = ${c.toFixed(2)}`);
      }
    }
  }
});

test("contrast: ink on glow >= 4.5:1 in every scene (solid button)", () => {
  for (const [id, t] of Object.entries(palette)) {
    const c = contrast(hex(t.ink), hex(t.glow));
    assert.ok(c >= 4.5, `scene ${id} ink/glow = ${c.toFixed(2)}`);
  }
});

test("contrast: fixed paper chrome (slips, clock ticket) and the Metro announcement strip", () => {
  assert.ok(contrast(hex(SLIP.fg), hex(SLIP.bg)) >= 4.5, "SLIP");
  assert.ok(contrast(hex(CLOCK.fg), hex(CLOCK.bg)) >= 4.5, "CLOCK (opaque, independent of the sky)");
  assert.ok(contrast(hex(METRO.edge), hex(palette[4].ink)) >= 4.5, "METRO.edge on ink[4]");
});

// Model of Experience's sky timeline: palette n holds from anchors[n].start to .end, then every var
// lerps linearly to palette n+1 until anchors[n+1].start.
function paletteAt(p) {
  const a = skyAnchors();
  if (p <= a[0].end) return palette[0];
  for (let n = 0; n < LAST; n++) {
    if (p <= a[n + 1].start) {
      const t = (p - a[n].end) / (a[n + 1].start - a[n].end);
      const out = {};
      for (const k of Object.keys(palette[n])) out[k] = mix(hex(palette[n][k]), hex(palette[n + 1][k]), Math.min(1, Math.max(0, t)));
      return out;
    }
    if (p <= a[n + 1].end) return palette[n + 1];
  }
  return palette[LAST];
}
const asRgb = (v) => (typeof v === "string" ? hex(v) : v);

test("sky: plateaus are ordered and transitions have positive width", () => {
  const a = skyAnchors();
  assert.equal(a.length, 9);
  for (let n = 0; n <= LAST; n++) assert.ok(a[n].start <= a[n].end, `scene ${n} plateau`);
  for (let n = 0; n < LAST; n++) assert.ok(a[n].end < a[n + 1].start, `transition ${n}->${n + 1}`);
});

test("textWindowSvh: inside the scene's own trigger range, scene 0 special-cased", () => {
  assert.deepEqual(textWindowSvh(0), { start: 0, end: 80 });
  // Scene 3 narration is the late closing line (0.82..0.96 of 350svh from the slot top).
  const w3 = textWindowSvh(3);
  assert.ok(Math.abs(w3.start - (500 + 0.82 * 350)) < 1e-9 && Math.abs(w3.end - (500 + 0.96 * 350)) < 1e-9);
  // Scene 4: during the glide, 0.03..0.18 of 180svh.
  const w4 = textWindowSvh(4);
  assert.ok(Math.abs(w4.start - (950 + 0.03 * 180)) < 1e-9 && Math.abs(w4.end - (950 + 0.18 * 180)) < 1e-9);
  // Scene 1: "top 70%" start, 0.42..0.68 of 170svh (lands as the stove lights; the sky holds night until then).
  const w1 = textWindowSvh(1);
  assert.ok(Math.abs(w1.start - (30 + 0.42 * 170)) < 1e-9 && Math.abs(w1.end - (30 + 0.68 * 170)) < 1e-9);
  for (let id = 1; id <= LAST; id++) {
    const w = textWindowSvh(id);
    assert.ok(w.start >= SCENE_OFFSETS[id] - 70 && w.end <= SCENE_OFFSETS[id] + SCENES[id].scrollLength - 100, `scene ${id}`);
  }
});

test("contrast: narration stays AA through every dark/light inversion, wherever it is visible", () => {
  const fails = [];
  for (let id = 0; id <= LAST; id++) {
    const w = textWindowSvh(id);
    for (let svh = w.start; svh <= w.end + 1e-9; svh += 0.5) {
      const pal = paletteAt(svh / SCROLL_RANGE_SVH);
      for (const sky of ["skyTop", "skyBottom"]) {
        for (const fg of ["text", "textMuted"]) {
          const c = contrast(asRgb(pal[fg]), asRgb(pal[sky]));
          if (c < 4.5) fails.push(`scene ${id} @${svh}svh ${fg}/${sky} ${c.toFixed(2)}`);
        }
      }
    }
  }
  assert.deepEqual(fails.slice(0, 5), []);
});

test("tong geometry: CSS --tong-origin matches TONG_ORIGIN, safe column fits a 390px crop, paths are deterministic", () => {
  const css = readFileSync(fileURLToPath(new URL("../app/globals.css", import.meta.url)), "utf8");
  const m = css.match(/--tong-origin:\s*calc\(50% \+ (-?\d+) \* var\(--u\)\) calc\(100% - (\d+) \* var\(--u\)\)/);
  assert.ok(m, "--tong-origin in .stage");
  assert.equal(800 + Number(m[1]), TONG_ORIGIN.x); // the stage centre is x = 800 of the 1600 viewBox
  assert.equal(900 - Number(m[2]), TONG_ORIGIN.y);
  // a 390x844 viewport shows 390 / (844 / 900) = 416 art units, centred on x = 800
  const half = 390 / (844 / 900) / 2;
  assert.ok(SAFE_COLUMN[0] >= 800 - half && SAFE_COLUMN[1] <= 800 + half, "safe column inside the mobile crop");
  assert.ok(TONG_ORIGIN.y <= GROUND_Y);
  assert.deepEqual(STROKE, { hair: 2, line: 4, bold: 8 });
  assert.equal(wobbleRect(0, 0, 10, 10, 5), wobbleRect(0, 0, 10, 10, 5));
  assert.notEqual(wobbleRect(0, 0, 10, 10, 5), wobbleRect(0, 0, 10, 10, 6));
  assert.equal(rng(3)(), rng(3)());
  assert.match(ribbon([[0, 0, 4], [10, 0, 6], [20, 5, 4]]), /^M.*Z$/);
  assert.match(blob([[0, 0], [10, 0], [10, 10], [0, 10]]), /^M.*Z$/);
});

test("clock ticket: DAYPART word per scene start, 12-hour label format", () => {
  const word = (m) => [...DAYPART].reverse().find((d) => m >= d.from).bn;
  assert.deepEqual([285, 420, 540, 580, 780, 990, 1170, 1425].map(word), ["ভোর", "সকাল", "সকাল", "সকাল", "দুপুর", "বিকেল", "সন্ধ্যা", "রাত"]);
});
