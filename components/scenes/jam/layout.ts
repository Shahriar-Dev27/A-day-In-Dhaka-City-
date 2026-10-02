/*
  Scene 3 layout + camera maths. Pure numbers, no React and no `@/` imports, so tests/jam.test.mjs can
  import it directly. All x/y are art units: the stage is 900 units tall (100svh), a unit is `ju` px.

  Five depth layers pan at their own pace. Each layer is described by "anchors": when the camera (street
  coordinates, `cx`) is at the start / at the jam / at the end, which x of THAT layer sits at the centre of
  the screen. Between anchors it is linear. This keeps every focal element (the three words, the helper,
  the commuter, the pier) aligned at the beat it belongs to on a 1440 desktop AND a 390 phone, which a
  plain parallax factor cannot do (a phone sees 416 units, a desktop 1600).
*/

export type LayerId = "far" | "mid" | "board" | "line" | "street" | "near";

export const STAGE_H = 900;
export const LAYERS: readonly LayerId[] = ["far", "mid", "board", "line", "street", "near"];

// Width of each layer's art. The desktop window (1600 units) at the end of the pan must still be covered.
export const LAYER_W: Record<LayerId, number> = { far: 3100, mid: 4200, board: 4200, line: 5500, street: 6300, near: 8800 };

export const GROUND = 775; // the road surface starts here (street layer)
export const ROW = { back: 800, mid: 842, front: 884 } as const; // wheel-contact y of the three traffic lanes

// Camera stops (street x). The jam sits on the commuter's rickshaw; the pier is the hand-off.
export const CX = { jam: 2920, jamMid: 3010, end: 5400 } as const;

// [cx, x of this layer at screen centre]. The first cx is replaced by c0 (= half a screen) at runtime.
const START = -1;
export const ANCHORS: Record<LayerId, readonly (readonly [number, number])[]> = {
  far: [[START, 800], [CX.jam, 1500], [CX.end, 2250]],
  mid: [[START, 900], [CX.jamMid, 1980], [CX.end, 3350]], // jamMid: the board is centred in the middle of the jam, not at its start
  board: [[START, 900], [CX.jamMid, 1980], [CX.end, 3350]], // the hoardings: the mid layer's pace, drawn in front of the viaduct piers
  line: [[START, 800], [CX.jam, 2500], [CX.end, 4700]],
  street: [[START, 0], [CX.end, 0]], // identity: x = cx (handled in centreX)
  near: [[START, 820], [CX.jam, 3300], [4400, 5500], [CX.end, 8000]], // the banner is centred at cx 4400 (burst), then clears the frame before the lift
};

/** x of `layer` at the centre of the screen when the camera is at street coordinate `cx`. */
export function centreX(layer: LayerId, cx: number, c0: number): number {
  if (layer === "street") return cx;
  const a = ANCHORS[layer].map(([k, x]) => [k === START ? c0 : k, x] as const);
  if (cx <= a[0][0]) return a[0][1];
  for (let i = 1; i < a.length; i++) {
    if (cx <= a[i][0]) {
      const t = (cx - a[i - 1][0]) / (a[i][0] - a[i - 1][0]);
      return a[i - 1][1] + t * (a[i][1] - a[i - 1][1]);
    }
  }
  return a[a.length - 1][1];
}

// ---- the camera: ONE progress -> position function (everything else derives from it) -------------
// Phases as fractions of the scene's scroll range.
export const PH = {
  jamIn: 0.26, // approach speed starts to fall...
  jamLock: 0.31, // ...and is at JAM_RATIO here
  jamOut: 0.44, // the road starts to free up
  burst: 0.5, // peak speed
  arrive: 0.78, // the pan has stopped at the pier
  liftIn: 0.74,
  liftOut: 0.86,
} as const;
export const JAM_RATIO = 0.2; // pan speed during the jam, relative to the approach
export const BURST_PEAK = 2.2;
export const LIFT = 480; // units the world drops while the camera rises up the pier

const smooth = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Relative pan speed at progress p (approach = 1). Smooth, no overshoot, 0 once the pan has arrived. */
export function panSpeed(p: number): number {
  if (p <= PH.jamIn) return 1;
  if (p <= PH.jamLock) return lerp(1, JAM_RATIO, smooth((p - PH.jamIn) / (PH.jamLock - PH.jamIn)));
  if (p <= PH.jamOut) return JAM_RATIO;
  if (p <= PH.burst) return lerp(JAM_RATIO, BURST_PEAK, smooth((p - PH.jamOut) / (PH.burst - PH.jamOut)));
  if (p < PH.arrive) return BURST_PEAK * Math.pow(1 - (p - PH.burst) / (PH.arrive - PH.burst), 1.5);
  return 0;
}

const N = 1200;
const CUM: number[] = (() => {
  const out = [0];
  for (let i = 1; i <= N; i++) out.push(out[i - 1] + ((panSpeed((i - 1) / N) + panSpeed(i / N)) / 2) / N);
  return out;
})();
const I = (p: number) => {
  const x = Math.min(1, Math.max(0, p)) * N;
  const i = Math.min(N - 1, Math.floor(x));
  return lerp(CUM[i], CUM[i + 1], x - i);
};

export interface Camera {
  /** camera x in street coordinates (the street coordinate at the screen centre) */
  cx(p: number): number;
  /** how far the world has dropped (units) while rising up the pier */
  lift(p: number): number;
}

/** `c0` = half the screen width in units: the camera starts with the street's left edge at the screen edge. */
export function makeCamera(c0: number): Camera {
  const v1 = (CX.jam - c0) / I(PH.jamLock); // approach speed in units per unit of I
  const jamEnd = c0 + v1 * I(PH.jamOut);
  const tail = I(PH.arrive) - I(PH.jamOut);
  return {
    cx: (p) => (p <= PH.jamOut ? c0 + v1 * I(p) : jamEnd + (CX.end - jamEnd) * Math.min(1, (I(p) - I(PH.jamOut)) / tail)),
    lift: (p) => LIFT * easeInOut((p - PH.liftIn) / (PH.liftOut - PH.liftIn)),
  };
}

// power2.inOut, written out so the maths is testable without GSAP: no overshoot, flat at both ends.
export function easeInOut(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

/** Wheel spin factors by traffic class: free = rickshaws and bikes, heavy = buses and CNGs. */
export function wheelFactor(kind: "free" | "heavy", p: number): number {
  if (kind === "free") return Math.min(2, Math.max(0.15, panSpeed(p)));
  if (p < 0.3) return Math.max(0.2, panSpeed(p));
  if (p < 0.34) return lerp(1, 0, (p - 0.3) / 0.04) * 0.2;
  return 0; // buses and CNGs sit still once the jam has locked
}
