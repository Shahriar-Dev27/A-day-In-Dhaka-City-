// Zero-dependency unit checks for the shared contract modules (Node 24 strips TS types natively).
// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SCENES, SCENE_OFFSETS, SCROLL_RANGE_SVH, TOTAL_SVH, progressToClockMinutes, skyAnchors, textWindowSvh } from "../lib/scenes.ts";
import { CLOCK_FG, CLOCK_PILL_ALPHA, cssVars, palette, storyVars, toCssVarObject } from "../lib/palette.ts";

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (c) => {
  const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

test("scene registry: offsets and ranges are consistent", () => {
  assert.deepEqual(SCENES.map((s) => s.id), [0, 1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual([...SCENE_OFFSETS], [0, 100, 300, 500, 950, 1150, 1350, 1550]);
  assert.equal(TOTAL_SVH, 1770);
  assert.equal(SCROLL_RANGE_SVH, 1670);
});

test("progressToClockMinutes: hits every scene anchor at its slot start", () => {
  for (let i = 1; i < SCENES.length; i++) {
    assert.equal(Math.round(progressToClockMinutes(SCENE_OFFSETS[i] / SCROLL_RANGE_SVH)), SCENES[i].clockMinutes, `scene ${i}`);
  }
});

test("progressToClockMinutes: 04:45 through Scene 0, 23:45 from Scene 7 to the end", () => {
  assert.equal(progressToClockMinutes(0), 285);
  assert.equal(progressToClockMinutes(SCENE_OFFSETS[1] / SCROLL_RANGE_SVH - 1e-6), 285);
  assert.equal(progressToClockMinutes(SCENE_OFFSETS[7] / SCROLL_RANGE_SVH), 1425);
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
    // Steepest segment: 255 minutes over 200svh, sampled every 1.67svh.
    assert.ok(m - prev <= 2.3, `jump of ${m - prev} min at ${i / 1000}`);
    prev = m;
  }
});

test("toCssVarObject: maps every token to its CSS var, nothing else", () => {
  const o = toCssVarObject(palette[3]);
  assert.deepEqual(Object.keys(o).sort(), Object.values(cssVars).sort());
  for (const [k, v] of Object.entries(cssVars)) assert.equal(o[v], palette[3][k]);
  assert.equal(new Set(Object.values(cssVars)).size, Object.keys(cssVars).length);
});

test("palette: every value is a 6-digit hex", () => {
  for (const [id, t] of Object.entries(palette)) for (const [k, v] of Object.entries(t)) assert.match(v, /^#[0-9A-F]{6}$/i, `${id}.${k}`);
});

test("close story: bilingual copy stays within eight words and its stable backdrop stays AA", () => {
  for (const name of ["Scene1Azaan", "Scene2OldDhaka", "Scene3Rush", "Scene4Noon", "Scene5GoldenHour", "Scene6Neon", "Scene7Midnight"]) {
    const source = readFileSync(new URL(`../components/scenes/${name}.tsx`, import.meta.url), "utf8");
    const line = source.match(/(?:close|closing): \{ bn: "([^"]+)", en: "([^"]+)" \}/);
    assert.ok(line, `${name}: missing close or closing copy`);
    for (const text of line.slice(1)) assert.ok(text.trim().split(/\s+/u).length <= 8, `${name}: ${text}`);
  }
  for (const fg of ["--story-copy", "--story-muted"]) {
    for (const bg of ["--story-bg", "--story-edge"]) assert.ok(contrast(hex(storyVars[fg]), hex(storyVars[bg])) >= 4.5, `${fg}/${bg}`);
  }
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

test("contrast: solid button (ink on glow) >= 4.5:1 in every scene", () => {
  for (const [id, t] of Object.entries(palette)) {
    const c = contrast(hex(t.ink), hex(t.glow));
    assert.ok(c >= 4.5, `scene ${id} ink/glow = ${c.toFixed(2)}`);
  }
});

// Model of Experience's sky timeline: palette n holds from anchors[n].start to .end, then every var
// lerps linearly to palette n+1 until anchors[n+1].start.
function paletteAt(p) {
  const a = skyAnchors();
  if (p <= a[0].end) return palette[0];
  for (let n = 0; n < 7; n++) {
    if (p <= a[n + 1].start) {
      const t = (p - a[n].end) / (a[n + 1].start - a[n].end);
      const out = {};
      for (const k of Object.keys(palette[n])) out[k] = mix(hex(palette[n][k]), hex(palette[n + 1][k]), Math.min(1, Math.max(0, t)));
      return out;
    }
    if (p <= a[n + 1].end) return palette[n + 1];
  }
  return palette[7];
}
const asRgb = (v) => (typeof v === "string" ? hex(v) : v);

test("sky: plateaus are ordered and transitions have positive width", () => {
  const a = skyAnchors();
  for (let n = 0; n < 8; n++) assert.ok(a[n].start <= a[n].end, `scene ${n} plateau`);
  for (let n = 0; n < 7; n++) assert.ok(a[n].end < a[n + 1].start, `transition ${n}->${n + 1}`);
});

test("contrast: text stays AA through every dark/light inversion, wherever it is visible", () => {
  const fails = [];
  for (let id = 0; id < 8; id++) {
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

test("contrast: always-visible clock (fixed fg on ink pill) >= 4.5:1 at every scroll position, even over white sky", () => {
  const fg = hex(CLOCK_FG);
  for (let i = 0; i <= SCROLL_RANGE_SVH; i++) {
    const ink = asRgb(paletteAt(i / SCROLL_RANGE_SVH).ink);
    for (const sky of [[255, 255, 255], [0, 0, 0], ...["skyTop", "skyBottom"].map((k) => asRgb(paletteAt(i / SCROLL_RANGE_SVH)[k]))]) {
      const bg = mix(sky, ink, CLOCK_PILL_ALPHA);
      assert.ok(contrast(fg, bg) >= 4.5, `@${i}svh ${contrast(fg, bg).toFixed(2)}`);
    }
  }
});
