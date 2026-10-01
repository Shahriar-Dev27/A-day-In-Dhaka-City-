/*
  Scene 1 geometry: pure path-data generators for the flat-vector art (PLAN §7 fallback), kept out
  of the component so the scene file stays about motion and layout. Everything is deterministic
  (seeded) so server and client markup match. Coordinates use the 1600x900 art viewBox.
  Colour is applied in Scene1Azaan.tsx from CSS vars; nothing here knows a colour.
*/

export const BASE = 610; // far-shore waterline: the horizon

// mulberry32: tiny seeded PRNG, so SSR and hydration produce identical paths
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r1 = (n: number) => Math.round(n * 10) / 10;

const block = (x: number, w: number, top: number) => `M${x} ${BASE}V${top}h${w}V${BASE}z`;
const tank = (x: number, top: number) => `M${x} ${top}v-13h17v13z`;
const ball = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 1 ${2 * r} 0a${r} ${r} 0 1 1 ${-2 * r} 0z`;

function dome(cx: number, r: number, baseY: number) {
  const peak = baseY - 1.125 * r;
  return (
    `M${cx - r} ${baseY}C${cx - r} ${r1(baseY - 1.5 * r)} ${cx + r} ${r1(baseY - 1.5 * r)} ${cx + r} ${baseY}z` +
    `M${cx - 1.4} ${r1(peak)}v-${r1(r * 0.34)}h2.8v${r1(r * 0.34)}z` +
    ball(cx, r1(peak - r * 0.34 - 3), 3.2)
  );
}

/** Slender minaret: shaft, two balconies, onion cap, finial. `top` is the cap's rim. */
function minaret(cx: number, top: number) {
  return (
    `M${cx - 9} ${BASE}V${top + 14}h18V${BASE}z` +
    `M${cx - 15} ${top + 62}h30v6h-30z` +
    `M${cx - 14} ${top + 12}h28v5h-28z` +
    `M${cx - 12} ${top + 12}C${cx - 12} ${top - 2} ${cx - 3} ${top} ${cx} ${top - 16}C${cx + 3} ${top} ${cx + 12} ${top - 2} ${cx + 12} ${top + 12}z` +
    `M${cx - 1.2} ${top - 16}v-15h2.4v15z` +
    ball(cx, top - 33, 2.6)
  );
}

// [x, width, roof y, hasTank] old Dhaka mid-rise blocks on the near shore
const MID: [number, number, number, boolean][] = [
  [-70, 120, 548, false], [40, 92, 510, true], [128, 108, 552, false], [222, 62, 524, false],
  [318, 96, 526, false], [412, 112, 556, true], [528, 72, 506, false], [604, 118, 562, false],
  [978, 98, 528, true], [1080, 122, 496, false], [1206, 74, 548, false], [1284, 62, 516, false],
  [1394, 112, 542, true], [1510, 104, 508, false], [1618, 90, 552, false],
];
const MID_MINARETS: [number, number][] = [[290, 352], [1350, 372]];
const MOSQUE = { body: [736, 208, 548] as const, domeCx: 840, domeR: 78, minarets: [720, 960] as const, minTop: 360 };

export const MID_PATH = (() => {
  let d = MID.map(([x, w, top, hasTank]) => block(x, w, top) + (hasTank ? tank(x + w * 0.55, top) : "")).join("");
  d += MID_MINARETS.map(([cx, top]) => minaret(cx, top)).join("");
  // mosque: courtyard wall, body, main dome + two cupolas, two corner minarets
  const [bx, bw, bt] = MOSQUE.body;
  d += `M692 ${BASE}V582h296V${BASE}z`;
  d += `M${bx} ${BASE}V${bt}h${bw}V${BASE}z`;
  d += dome(MOSQUE.domeCx, MOSQUE.domeR, bt);
  d += dome(772, 26, bt) + dome(908, 26, bt);
  d += MOSQUE.minarets.map((cx) => minaret(cx, MOSQUE.minTop)).join("");
  d += dome(465, 36, 556); // small dome on the building at x 412
  return d;
})();

/** Fainter far-bank skyline: many low blocks and three slim minarets, drawn at low opacity. */
export const FAR_PATH = (() => {
  const rnd = rng(7);
  let d = "";
  for (let x = -80; x < 1700; ) {
    const w = 34 + rnd() * 46;
    d += block(r1(x), r1(w), r1(BASE - (26 + rnd() * 46)));
    x += w + rnd() * 10;
  }
  return d + [430, 1010, 1478].map((cx) => minaret(cx, 478)).join("");
})();

/** Lit windows, grouped so each group is one node and one tween. 0 = muezzin's lamps, 1 = mosque arches, 2.. = homes waking. */
export const WINDOW_GROUPS = (() => {
  const GROUPS = 9;
  const groups: string[] = Array.from({ length: GROUPS }, () => "");
  const slit = (cx: number, y: number) => `M${cx - 3} ${y}h6v14h-6z`;
  const towers: [number, number][] = [...MOSQUE.minarets.map((cx): [number, number] => [cx, MOSQUE.minTop]), ...MID_MINARETS];
  groups[0] = towers.map(([cx, top]) => slit(cx, top + 30)).join("");
  const arch = (x: number) => `M${x} 598V581a5 5 0 0 1 10 0V598z`;
  groups[1] = [790, 835, 880].map(arch).join("") + `M834 ${MOSQUE.body[2] - 6}h12v8h-12z`;
  const rnd = rng(23);
  for (const [x, w, top] of MID) {
    for (let cx = x + 12; cx < x + w - 16; cx += 24) {
      for (let y = top + 16; y < BASE - 30; y += 27) {
        if (rnd() < 0.2) groups[2 + Math.floor(rnd() * (GROUPS - 2))] += `M${r1(cx)} ${y}h7v11h-7z`;
      }
    }
  }
  return groups.filter(Boolean);
})();

export interface Cluster { cx: number; cy: number; r: number }
// Fade order = array order. The central three are all that a 390px-wide portrait crop shows.
export const STAR_CLUSTERS: Cluster[] = [
  { cx: 1290, cy: 110, r: 130 },
  { cx: 360, cy: 160, r: 150 },
  { cx: 1020, cy: 215, r: 130 },
  { cx: 880, cy: 400, r: 70 },
  { cx: 700, cy: 105, r: 150 },
];
// Keep stars off the copy: nothing inside this box (desktop and portrait text both live in it).
const TEXT_BOX = { x0: 130, x1: 1015, y0: 130, y1: 350 };
export const STAR_PATHS = STAR_CLUSTERS.map((c, i) => {
  const rnd = rng(100 + i);
  const pts = (n: number) =>
    Array.from({ length: n }, () => {
      const a = rnd() * Math.PI * 2;
      const d = Math.sqrt(rnd()) * c.r;
      const x = c.cx + Math.cos(a) * d * 1.25;
      let y = c.cy + Math.sin(a) * d * 0.8;
      if (x > TEXT_BOX.x0 && x < TEXT_BOX.x1 && y > TEXT_BOX.y0 && y < TEXT_BOX.y1) y = y < 240 ? 30 + (y % 90) : 352 + (y % 70);
      return `M${r1(x)} ${r1(y)}h0`;
    }).join("");
  return { big: pts(4), small: pts(9) };
});

// Wooden nouka in local coords: waterline y=0, bow to the right, origin at mid-ship.
export const BOAT = {
  hull: "M-132 -26C-118 4 -80 12 -40 12L50 12C100 12 130 -2 148 -40C120 -16 90 -10 60 -10L-60 -10C-95 -10 -118 -16 -132 -26z",
  hood: "M-52 -10C-50 -54 42 -54 46 -10z", // arched bamboo-and-mat chhoi
  boatman: "M-106 -22l4 -24h8l3 24z" + ball(-100, -54, 5.2),
  pole: "M-92 -46L-124 12", // punting pole, stroked
  post: "M141 -32V-60", // lantern post at the bow, stroked
  lamp: "M137.5 -56h7v10h-7z",
  lampCx: 141,
  lampCy: -51,
  // lantern glint on the water: tapering dashes under the lamp (mirrored x of the post)
  glint: [[0, 8, 5], [9, 6, 4], [19, 4.4, 3.4], [31, 3, 2.8], [45, 2, 2.4]].map(([y, w, h]) => `M${141 - w / 2} ${y + 6}h${w}v${h}h-${w}z`).join(""),
};

/** Thin horizontal gaps that break the skyline reflection into ripples (painted in the water colour). */
export const RIPPLE_PATH = (() => {
  const rnd = rng(41);
  let d = "";
  for (let i = 0; i < 30; i++) {
    const y = 618 + i * 8.5 + rnd() * 4;
    const h = 1.6 + (i / 30) * 3.4;
    for (let k = 0; k < 3; k++) {
      const x = -40 + rnd() * 1700;
      const w = r1(120 + rnd() * 380);
      d += `M${r1(x)} ${r1(y)}h${w}v${r1(h)}h-${w}z`;
    }
  }
  return d;
})();

/** Pale sky-glints on the water, close under the horizon. */
export const GLINT_PATH = (() => {
  const rnd = rng(59);
  let d = "";
  for (let i = 0; i < 22; i++) {
    const y = 622 + i * 4.6 + rnd() * 5;
    const x = 620 + rnd() * 880 - i * 8;
    const w = r1(30 + rnd() * 120 - i * 2);
    d += `M${r1(x)} ${r1(y)}h${w}v1.8h-${w}z`;
  }
  return d;
})();

export interface FogLayer { y: number; rx: number; ry: number; count: number; opacity: number }
export const FOG_LAYERS: FogLayer[] = [
  { y: 646, rx: 520, ry: 34, count: 5, opacity: 0.3 },
  { y: 790, rx: 600, ry: 52, count: 5, opacity: 0.42 },
  { y: 852, rx: 700, ry: 84, count: 6, opacity: 0.62 }, // lowest = thickest
];
export interface Blob { cx: number; cy: number; rx: number; ry: number }
export const FOG_BLOBS: Blob[][] = FOG_LAYERS.map((l, n) => {
  const rnd = rng(300 + n);
  return Array.from({ length: l.count }, (_, i) => ({
    cx: r1(-150 + (i * 2450) / (l.count - 1) + (rnd() - 0.5) * 120),
    cy: r1(l.y + (rnd() - 0.5) * l.ry * 1.1),
    rx: r1(l.rx * (0.6 + rnd() * 0.6)),
    ry: r1(l.ry * (0.7 + rnd() * 0.7)),
  }));
});
