/*
  Shared geometry for the tong set and cast (v2 plan 4.1-4.3). Everything is deterministic (seeded) so
  server and client markup match, and every number is rounded so paths stay small. Coordinates are in
  the 1600x900 art viewBox. Nothing here knows a colour.
*/

// One line weight for the whole set (viewBox units). Hair strokes also use vector-effect=non-scaling-stroke
// where the camera zoom would otherwise thicken them.
export const STROKE = { hair: 2, line: 4, bold: 8 } as const;

// The tong's anchor in the viewBox. globals.css `.stage --tong-origin` is the same point in stage units
// (a test keeps them in sync). SAFE_COLUMN is what a 390px-wide viewport shows (x 592..1008, rounded in).
export const TONG_ORIGIN = { x: 820, y: 860 } as const;
export const SAFE_COLUMN = [600, 1000] as const;
export const GROUND_Y = 860;

export type V2 = readonly [number, number];

export const r1 = (n: number) => Math.round(n * 10) / 10;

// mulberry32: tiny seeded PRNG
export function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Jitter every point by up to +-amp (seeded). */
export function jitter(pts: readonly V2[], seed: number, amp: number): V2[] {
  const rnd = rng(seed);
  return pts.map(([x, y]) => [x + (rnd() - 0.5) * 2 * amp, y + (rnd() - 0.5) * 2 * amp] as const);
}

/** Straight-edged polygon whose edges are broken at the midpoint and nudged: reads as hand-cut paper. */
export function wobblePoly(pts: readonly V2[], seed: number, amp = 1.6): string {
  const rnd = rng(seed);
  const out: string[] = [];
  pts.forEach(([x, y], i) => {
    const [nx, ny] = pts[(i + 1) % pts.length];
    const j = () => (rnd() - 0.5) * 2 * amp;
    out.push(`${i ? "L" : "M"}${r1(x + j())} ${r1(y + j())}`);
    out.push(`L${r1((x + nx) / 2 + j())} ${r1((y + ny) / 2 + j())}`);
  });
  return `${out.join("")}Z`;
}

export function wobbleRect(x: number, y: number, w: number, h: number, seed: number, amp = 1.6): string {
  return wobblePoly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], seed, amp);
}

/** Catmull-Rom spline through `pts` as cubic Beziers (open). Returns path commands WITHOUT the leading M. */
function splineTo(pts: readonly V2[]): string {
  const p = (i: number) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  let d = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    d += `C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)} ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d;
}

/** Open smooth curve through points (wires, ropes, folds). */
export function curve(pts: readonly V2[]): string {
  return `M${r1(pts[0][0])} ${r1(pts[0][1])}${splineTo(pts)}`;
}

/** Closed smooth blob through points. */
export function blob(pts: readonly V2[]): string {
  const ring = [...pts, pts[0], pts[1], pts[2]];
  const n = pts.length;
  const p = (i: number) => ring[((i % n) + n) % n];
  let d = `M${r1(p(0)[0])} ${r1(p(0)[1])}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    d += `C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)} ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return `${d}Z`;
}

/**
 * A tapered stroke as a filled outline: centreline points with a width each, smoothed, round-capped.
 * This is how every limb, torso and cloth fold in the cast is drawn (one continuous shape per part,
 * not stacked primitives). Parts of one figure share a fill and are separate <path>s (opposite
 * windings would punch holes where they overlap under nonzero fill).
 */
export function ribbon(pts: readonly (readonly [number, number, number])[]): string {
  const n = pts.length;
  const left: V2[] = [];
  const right: V2[] = [];
  pts.forEach(([x, y, w], i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0];
    let ty = b[1] - a[1];
    const len = Math.hypot(tx, ty) || 1;
    tx /= len;
    ty /= len;
    left.push([x - ty * (w / 2), y + tx * (w / 2)]);
    right.push([x + ty * (w / 2), y - tx * (w / 2)]);
  });
  right.reverse();
  const rEnd = pts[n - 1][2] / 2;
  const rStart = pts[0][2] / 2;
  return (
    `M${r1(left[0][0])} ${r1(left[0][1])}${splineTo(left)}` +
    `A${r1(rEnd)} ${r1(rEnd)} 0 0 0 ${r1(right[0][0])} ${r1(right[0][1])}${splineTo(right)}` +
    `A${r1(rStart)} ${r1(rStart)} 0 0 0 ${r1(left[0][0])} ${r1(left[0][1])}Z`
  );
}

export const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${r1(cx - rx)} ${r1(cy)}a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(2 * rx)} 0a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(-2 * rx)} 0Z`;
