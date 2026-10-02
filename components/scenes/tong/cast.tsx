import type { ReactNode, SVGProps } from "react";
import { blob, curve, r1, ribbon, wobblePoly, type V2 } from "./geometry";

/*
  The cast kit (v2 plan 4.3): ink silhouettes, no faces, ONE costume cue each (a coloured garment or
  prop, mixed toward --ink so night dims it: see the .cue-* classes in globals.css).

  Every body is the same skeleton: joints in height units (H = 1, y up, feet at the origin, facing
  right), mapped to px by the figure's height. Each part (torso, leg, arm, neck) is one smooth tapered
  ribbon, so a pose is just a different set of joints, not a different drawing. Components take
  { at, flip, s }: `at` places the feet in the 1600x900 viewBox, `flip` mirrors, `s` scales; every other
  prop lands on the inner <g> (the GSAP target), so scenes animate it with x/y/opacity only.
*/

type V = readonly [number, number];
export interface CastProps extends Omit<SVGProps<SVGGElement>, "transform"> {
  at: V2;
  flip?: boolean;
  s?: number;
}

function Placed({ at, flip, s = 1, children, ...rest }: CastProps & { children: ReactNode }) {
  return (
    <g transform={`translate(${at[0]} ${at[1]})`}>
      <g {...rest}>
        <g transform={`${flip ? "scale(-1 1) " : ""}${s !== 1 ? `scale(${s})` : ""}`.trim() || undefined}>{children}</g>
      </g>
    </g>
  );
}

// ---- skeleton -------------------------------------------------------------------------------

interface Pose {
  head: V; neck: V; sh: V; ch: V; wa: V; hip: V;
  fk: V; fa: V; ft: V; bk: V; ba: V; bt: V; // front/back knee, ankle, toe
  fe: V; fh: V; be: V; bh: V; // front/back elbow, hand
}
interface Build {
  H: number;
  head: V; // rx, ry as a fraction of H
  torso: readonly [number, number, number, number]; // widths at sh, ch, wa, hip (fraction of H)
  leg: readonly [number, number, number]; // thigh, knee, ankle
  arm: readonly [number, number, number]; // upper, fore, hand
}

const MAN: Build = { H: 320, head: [0.057, 0.067], torso: [0.135, 0.15, 0.135, 0.135], leg: [0.085, 0.065, 0.045], arm: [0.05, 0.042, 0.036] };
const WOMAN: Build = { H: 300, head: [0.058, 0.068], torso: [0.12, 0.125, 0.105, 0.13], leg: [0.08, 0.06, 0.04], arm: [0.046, 0.038, 0.032] };
const KID: Build = { H: 196, head: [0.09, 0.105], torso: [0.19, 0.21, 0.2, 0.2], leg: [0.11, 0.085, 0.065], arm: [0.07, 0.058, 0.05] };

const STAND: Pose = {
  head: [0.014, 0.915], neck: [0.006, 0.855], sh: [0.0, 0.81], ch: [-0.004, 0.72], wa: [0.0, 0.6], hip: [0.004, 0.52],
  fk: [0.022, 0.27], fa: [0.014, 0.035], ft: [0.075, 0.012], bk: [-0.012, 0.27], ba: [-0.02, 0.035], bt: [0.04, 0.012],
  fe: [0.03, 0.64], fh: [0.058, 0.49], be: [-0.028, 0.64], bh: [-0.044, 0.49],
};
const WALK: Pose = {
  ...STAND,
  fk: [0.075, 0.3], fa: [0.1, 0.045], ft: [0.16, 0.02], bk: [-0.06, 0.28], ba: [-0.115, 0.07], bt: [-0.06, 0.012],
  fe: [-0.04, 0.63], fh: [-0.08, 0.5], be: [0.06, 0.64], bh: [0.1, 0.52],
};

const P = (v: V, H: number): [number, number] => [r1(v[0] * H), r1(-v[1] * H)];
const W = (n: number, H: number) => r1(n * H);

/** The skeleton as separate same-fill paths: back arm, back leg, torso+neck, front leg, head, front arm. */
function bodyPaths(pose: Pose, b: Build, extra?: { headPath?: string }): string[] {
  const { H } = b;
  const j = (v: V, w: number) => [...P(v, H), W(w, H)] as const;
  const arm = (sh: V, e: V, h: V) => ribbon([j(sh, b.arm[0]), j(e, b.arm[1]), j(h, b.arm[2])]);
  const leg = (k: V, a: V, t: V) =>
    ribbon([j(pose.hip, b.leg[0]), j(k, b.leg[1]), j(a, b.leg[2])]) + ribbon([j(a, b.leg[2]), j(t, b.leg[2] * 0.7)]);
  const [rx, ry] = [b.head[0] * H, b.head[1] * H];
  const [hx, hy] = P(pose.head, H);
  return [
    arm(pose.sh, pose.be, pose.bh),
    leg(pose.bk, pose.ba, pose.bt),
    ribbon([j(pose.neck, 0.05), j(pose.sh, b.torso[0]), j(pose.ch, b.torso[1]), j(pose.wa, b.torso[2]), j(pose.hip, b.torso[3])]),
    leg(pose.fk, pose.fa, pose.ft),
    extra?.headPath ?? blob([[hx - rx, hy - ry * 0.1], [hx - rx * 0.6, hy - ry * 0.85], [hx + rx * 0.3, hy - ry], [hx + rx * 0.95, hy - ry * 0.45], [hx + rx * 1.18, hy + ry * 0.05], [hx + rx * 0.85, hy + ry * 0.45], [hx + rx * 0.5, hy + ry * 0.95], [hx - rx * 0.4, hy + ry * 0.85]]),
    arm(pose.sh, pose.fe, pose.fh),
  ];
}

function Silhouette({ paths, className = "fill-ink" }: { paths: string[]; className?: string }) {
  return (
    <g className={className}>
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </g>
  );
}

// ---- Mama -----------------------------------------------------------------------------------
// Faces right at flip=false. Skull cap, round glasses, small beard, gamchha on the shoulder, checked lungi.
// Behind the counter only the top ~205 units show; the lungi is drawn for the poses where he steps out.

const MAMA_POSES: Record<"stand" | "pour" | "write" | "count" | "shutter" | "phone", Partial<Pose>> = {
  stand: { fe: [0.03, 0.6], fh: [0.12, 0.465], be: [-0.02, 0.62], bh: [0.05, 0.47] },
  pour: { fe: [0.09, 0.66], fh: [0.27, 0.53], be: [-0.02, 0.62], bh: [0.05, 0.47] },
  write: { head: [0.04, 0.9], neck: [0.026, 0.848], fe: [0.05, 0.6], fh: [0.15, 0.455], be: [-0.02, 0.62], bh: [0.07, 0.5] },
  count: { fe: [0.05, 0.6], fh: [0.1, 0.5], be: [-0.02, 0.6], bh: [0.08, 0.5] },
  // both arms reach forward and up to a shutter's bottom bar (Scene 8)
  shutter: { head: [0.03, 0.905], neck: [0.018, 0.852], fe: [0.15, 0.79], fh: [0.27, 0.86], be: [0.09, 0.74], bh: [0.2, 0.8] },
  // front hand at the ear, phone in it (Scene 8); the other arm hangs
  phone: { head: [0.012, 0.915], fe: [0.075, 0.69], fh: [0.008, 0.9], be: [-0.02, 0.62], bh: [0.05, 0.47] },
};
export type MamaPose = keyof typeof MAMA_POSES;

/** Where a pose puts the front hand: px relative to the feet, facing right (negate x when flipped). */
export function mamaHand(pose: MamaPose): V2 {
  const pz: Pose = { ...STAND, ...MAMA_POSES[pose] };
  return P(pz.fh, MAN.H);
}

export function Mama({ pose = "stand", ...p }: CastProps & { pose?: MamaPose }) {
  const pz: Pose = { ...STAND, ...MAMA_POSES[pose] };
  const b: Build = { ...MAN, torso: [0.17, 0.19, 0.175, 0.15] };
  const H = b.H;
  const [hx, hy] = P(pz.head, H);
  const rx = b.head[0] * H;
  const ry = b.head[1] * H;
  // profile: brow, a clear nose, short beard point; the nose tip is built from three close points so the spline keeps it sharp
  const head = blob([
    [hx - rx, hy], [hx - rx * 0.75, hy - ry * 0.8], [hx + rx * 0.1, hy - ry * 1.05], [hx + rx * 0.8, hy - ry * 0.75], [hx + rx * 1.02, hy - ry * 0.25],
    [hx + rx * 1.12, hy + ry * 0.02], [hx + rx * 1.38, hy + ry * 0.28], [hx + rx * 1.58, hy + ry * 0.44], [hx + rx * 1.35, hy + ry * 0.58], [hx + rx * 1.02, hy + ry * 0.62],
    [hx + rx * 0.98, hy + ry * 0.92], [hx + rx * 0.92, hy + ry * 1.55], [hx + rx * 0.2, hy + ry * 1.2], [hx - rx * 0.5, hy + ry * 0.8],
  ]);
  const [sx, sy] = P(pz.sh, H);
  const [nx, ny] = P(pz.ch, H);
  return (
    <Placed {...p}>
      <Silhouette paths={bodyPaths(pz, b, { headPath: head })} />
      {/* lungi: hip to shin, flared, checked */}
      <path d={ribbon([[...P(pz.hip, H), 46], [...P([0.014, 0.32], H), 50], [...P([0.0, 0.11], H), 48]])} fill="url(#lungi-check)" />
      {/* gamchha: a checked cloth around the neck with one tail down the chest */}
      <path d={ribbon([[sx - 4, sy - 2, 14], [sx + 10, sy + 12, 20], [nx + 16, ny + 22, 18], [nx + 17, ny + 52, 13]])} fill="url(#gamchha-check)" />
      {/* skull cap */}
      <path className="cue-cap" d={blob([[hx - rx * 0.98, hy - ry * 0.2], [hx - rx * 0.6, hy - ry * 0.95], [hx + rx * 0.2, hy - ry * 1.22], [hx + rx * 0.9, hy - ry * 0.8], [hx + rx * 1.0, hy - ry * 0.4], [hx + rx * 0.2, hy - ry * 0.55]])} />
      {/* round glasses: one thin ring at the eye, the arm back to the ear */}
      <circle cx={hx + rx * 0.7} cy={hy + ry * 0.02} r={rx * 0.3} fill="none" strokeWidth="1.8" style={{ stroke: "var(--cue-cap)" }} />
      <path d={`M${r1(hx + rx * 0.4)} ${r1(hy)}L${r1(hx - rx * 0.5)} ${r1(hy - ry * 0.05)}`} strokeWidth="1.4" style={{ stroke: "var(--cue-cap)" }} />
      {/* the phone at his ear: a dark body, its lit screen a thin strip on the face side (data-phone-screen) */}
      {pose === "phone" ? (
        <g transform={`translate(${mamaHand("phone")[0]} ${mamaHand("phone")[1]}) rotate(-8)`}>
          <rect x="-4.5" y="-13" width="9" height="22" rx="2.6" className="fill-ink" />
          <rect data-phone-screen x="2.6" y="-11" width="2.4" height="17" rx="1.2" className="fill-glow" />
        </g>
      ) : null}
    </Placed>
  );
}

// ---- Night guard ----------------------------------------------------------------------------
export function Guard({ pose = "walk", ...p }: CastProps & { pose?: "walk" | "stand" }) {
  const pz: Pose = pose === "walk" ? { ...WALK, head: [0.03, 0.9], neck: [0.02, 0.85], sh: [0.01, 0.805], ch: [0.0, 0.715], fe: [0.02, 0.63], fh: [0.1, 0.56], be: [-0.03, 0.63], bh: [-0.07, 0.5] } : { ...STAND, fe: [0.03, 0.64], fh: [0.12, 0.57] };
  const b = MAN;
  const H = b.H;
  const [hx, hy] = P(pz.head, H);
  const [shx, shy] = P(pz.sh, H);
  const [wx, wy] = P(pz.wa, H);
  const [fx, fy] = P(pz.fh, H);
  return (
    <Placed {...p}>
      <Silhouette paths={bodyPaths(pz, b)} />
      {/* khaki shirt, hem past the belt, and a peaked cap: the one cue */}
      <path className="cue-khaki" d={ribbon([[shx, shy + 2, 52], [wx - 1, (shy + wy) / 2, 50], [wx + 2, wy + 24, 44]])} />
      <path className="cue-khaki" d={blob([[hx - 17, hy - 11], [hx - 12, hy - 30], [hx + 10, hy - 31], [hx + 20, hy - 17], [hx + 36, hy - 15], [hx + 24, hy - 8], [hx + 4, hy - 9]])} />
      {/* torch: a hand-held tube and a beam that dims on arrival (data-torch) */}
      <path className="fill-ink" d={ribbon([[fx - 2, fy, 9], [fx + 18, fy - 3, 11]])} />
      <path data-torch className="fill-glow" opacity="0.22" d={wobblePoly([[fx + 22, fy - 3], [fx + 150, fy - 30], [fx + 150, fy + 36]], 11, 1)} />
    </Placed>
  );
}

// ---- Garment worker (young woman): dupatta, tiffin carrier, ID lanyard -----------------------
export function GarmentWorker({ pose = "walk", ...p }: CastProps & { pose?: "walk" | "hold-note" }) {
  const hold = pose === "hold-note";
  const base = hold ? STAND : WALK;
  const pz: Pose = {
    ...base,
    head: [0.016, 0.915], fe: hold ? [0.09, 0.7] : [-0.04, 0.63], fh: hold ? [0.21, 0.79] : [-0.075, 0.5],
    be: hold ? [-0.03, 0.62] : [0.06, 0.64], bh: hold ? [-0.045, 0.49] : [0.1, 0.52],
  };
  const b = WOMAN;
  const H = b.H;
  const [hx, hy] = P(pz.head, H);
  const [shx, shy] = P(pz.sh, H);
  const [cx, cy] = P(pz.ch, H);
  const [fx, fy] = P(pz.fh, H);
  const [bx, by] = P(pz.bh, H);
  return (
    <Placed {...p}>
      <Silhouette paths={bodyPaths(pz, b)} />
      {/* kameez: shoulder to knee, A-line */}
      <path className="fill-ink" d={ribbon([[shx, shy + 6, 38], [cx, cy + 34, 42], [cx + 2, cy + 104, 54], [cx + 4, cy + 156, 58]])} />
      {/* hair bun */}
      <circle cx={hx - 17} cy={hy - 4} r="11" className="fill-ink" />
      {/* dupatta: the one cue. Over the near shoulder and trailing behind */}
      <path className="cue-dupatta" d={ribbon([[hx + 2, hy + 22, 14], [shx + 4, shy + 4, 24], [cx - 8, cy + 38, 30], [cx - 34, cy + 92, 26], [cx - 46, cy + 140, 14]])} />
      <path className="cue-dupatta" d={ribbon([[shx + 4, shy + 6, 16], [cx + 14, cy + 30, 16], [cx + 12, cy + 70, 10]])} />
      {/* ID lanyard + card */}
      <path d={curve([[shx + 6, shy], [cx + 10, cy + 6], [cx + 12, cy + 30]])} fill="none" strokeWidth="2.4" className="cue-lanyard-s" />
      <rect x={cx + 6} y={cy + 28} width="13" height="17" rx="1.5" className="cue-lanyard" />
      {/* tiffin carrier: three steel tiers and a clip handle, swinging from the free hand */}
      {hold ? null : (
        <g>
          <path d={curve([[bx, by], [bx + 4, by + 24], [bx + 6, by + 40]])} fill="none" strokeWidth="2" className="stroke-ink" />
          <g className="fill-wall-lit">
            <rect x={bx - 11} y={by + 40} width="26" height="12" rx="3" />
            <rect x={bx - 11} y={by + 52} width="26" height="12" rx="3" />
            <rect x={bx - 11} y={by + 64} width="26" height="12" rx="3" />
          </g>
          <path d={`M${r1(bx - 11)} ${r1(by + 52)}h26M${r1(bx - 11)} ${r1(by + 64)}h26`} strokeWidth="1.6" className="stroke-ink" />
        </g>
      )}
      {/* the Tk 500 note held out toward Mama (data-note) */}
      {hold ? <rect data-note x={fx - 4} y={fy - 20} width="36" height="19" rx="1.5" className="cue-note" transform={`rotate(-10 ${r1(fx)} ${r1(fy)})`} /> : null}
    </Placed>
  );
}

// ---- School kid: uniform shirt, oversized bag -------------------------------------------------
export function SchoolKid({ pose = "walk", ...p }: CastProps & { pose?: "walk" | "run" }) {
  const pz: Pose = pose === "run" ? { ...WALK, head: [0.07, 0.9], sh: [0.04, 0.8], ch: [0.03, 0.7], fk: [0.12, 0.34], fa: [0.15, 0.1], ft: [0.2, 0.05], bk: [-0.09, 0.3], ba: [-0.16, 0.17], bt: [-0.1, 0.1] } : { ...WALK, head: [0.03, 0.9], fe: [-0.02, 0.62], fh: [-0.05, 0.48], be: [0.05, 0.62], bh: [0.09, 0.5] };
  const b = KID;
  const H = b.H;
  const [hx, hy] = P(pz.head, H);
  const [shx, shy] = P(pz.sh, H);
  const [wx, wy] = P(pz.wa, H);
  return (
    <Placed {...p}>
      {/* bag first: bigger than the torso is long */}
      <rect x={shx - 62} y={shy - 6} width="52" height="74" rx="12" className="fill-ink" />
      <rect x={shx - 55} y={shy + 38} width="38" height="24" rx="6" className="fill-wall-lit" opacity="0.8" />
      <Silhouette paths={bodyPaths(pz, b)} />
      <path className="cue-uniform" d={ribbon([[shx + 2, shy + 4, 38], [wx, (shy + wy) / 2, 42], [wx + 2, wy + 12, 38]])} />
      <path className="fill-ink" d={ribbon([[shx - 4, shy + 2, 8], [shx - 12, shy + 26, 7]])} />
      <path d={`M${r1(hx - 18)} ${r1(hy - 14)}Q${r1(hx)} ${r1(hy - 34)} ${r1(hx + 18)} ${r1(hy - 12)}`} className="fill-ink" />
    </Placed>
  );
}

// ---- Newspaper hawker: leaning over the bench, sorting a bundle ------------------------------
export function Hawker(p: CastProps) {
  const pz: Pose = { ...STAND, head: [0.07, 0.86], neck: [0.04, 0.82], sh: [0.02, 0.78], ch: [0.04, 0.69], wa: [0.03, 0.58], fe: [0.1, 0.6], fh: [0.19, 0.5], be: [0.08, 0.6], bh: [0.17, 0.48] };
  const b = { ...MAN, H: 300 };
  const [hx, hy] = P(pz.head, b.H);
  return (
    <Placed {...p}>
      <Silhouette paths={bodyPaths(pz, b)} />
      {/* head wrapped in a gamchha: the cue */}
      <path className="cue-cap" d={blob([[hx - 18, hy - 2], [hx - 10, hy - 22], [hx + 12, hy - 22], [hx + 20, hy - 6], [hx + 6, hy - 9], [hx - 8, hy - 8]])} />
    </Placed>
  );
}

// ---- Stray dog: one cue patch, same both scenes ---------------------------------------------
export function Dog({ pose = "stand", ...p }: CastProps & { pose?: "asleep" | "stand" }) {
  if (pose === "asleep") {
    return (
      <Placed {...p}>
        <path className="fill-ink" d={blob([[-44, -4], [-40, -26], [-10, -36], [28, -30], [50, -14], [46, -2], [10, 0]])} />
        <path className="fill-ink" d={blob([[34, -14], [44, -30], [62, -26], [66, -12], [56, -3], [40, -4]])} />
        <path className="fill-ink" d={ribbon([[-42, -10, 9], [-62, -3, 7], [-70, -12, 5]])} />
        <path className="cue-cap" d={blob([[-22, -27], [-2, -34], [14, -30], [2, -22], [-14, -21]])} />
      </Placed>
    );
  }
  return (
    <Placed {...p}>
      <path className="fill-ink" d={ribbon([[-46, -50, 20], [-8, -52, 34], [34, -52, 30]])} />
      <path className="fill-ink" d={ribbon([[34, -58, 20], [56, -78, 20], [76, -80, 18], [92, -74, 10]])} />
      <path className="fill-ink" d={blob([[50, -90], [58, -102], [64, -90]])} />
      {[[-34, 0], [-18, 4], [20, 0], [34, 3]].map(([x, f], i) => (
        <path key={i} className="fill-ink" d={ribbon([[x, -48, 10], [x + (f > 0 ? 3 : -2), -24, 8], [x + f / 3, -2, 7]])} />
      ))}
      <path className="fill-ink" d={ribbon([[-48, -56, 7], [-62, -74, 5], [-60, -92, 4]])} />
      <path className="cue-cap" d={blob([[-16, -62], [8, -68], [22, -60], [4, -54], [-12, -54]])} />
    </Placed>
  );
}

// ---- Office-goer after work (Scene 7): a pale office shirt, ID lanyard + card, a glass of cha or a biscuit -
// The lanyard is the cue (pale strap and card on a blue shirt); the shirt only carries it on a dark street.
const OFFICE_POSES: Record<"sip" | "biscuit" | "listen", Partial<Pose>> = {
  sip: { fe: [0.07, 0.66], fh: [0.1, 0.79], be: [-0.02, 0.62], bh: [0.03, 0.5] },
  biscuit: { fe: [0.06, 0.64], fh: [0.13, 0.72], be: [0.05, 0.62], bh: [0.12, 0.58] },
  listen: { fe: [0.03, 0.62], fh: [0.06, 0.5], be: [-0.03, 0.62], bh: [-0.05, 0.5] },
};

export function OfficeGoer({ pose = "sip", woman, ...p }: CastProps & { pose?: keyof typeof OFFICE_POSES; woman?: boolean }) {
  const pz: Pose = { ...STAND, head: [0.02, 0.915], ...OFFICE_POSES[pose] };
  const b = woman ? WOMAN : MAN;
  const H = b.H;
  const k = H / 320;
  const [hx, hy] = P(pz.head, H);
  const [shx, shy] = P(pz.sh, H);
  const [cx, cy] = P(pz.ch, H);
  const [wx, wy] = P(pz.wa, H);
  const [fx, fy] = P(pz.fh, H);
  const [bx, by] = P(pz.bh, H);
  return (
    <Placed {...p}>
      <Silhouette paths={bodyPaths(pz, b)} />
      {woman ? <circle cx={hx - 17} cy={hy - 4} r="11" className="fill-ink" /> : null}
      {/* office shirt: collar to hip, the same blue as the school shirts */}
      <path className="cue-uniform" d={ribbon([[shx, shy + 2, 44 * k], [wx - 1, (shy + wy) / 2, 48 * k], [wx + 2, wy + 22 * k, 42 * k]])} />
      {/* lanyard and ID card: pale on the blue, so it reads at a glance */}
      <path d={curve([[shx + 5, shy + 1], [cx + 9, cy + 8], [cx + 11, cy + 28 * k]])} fill="none" strokeWidth="2.6" className="cue-cap-s" />
      <rect x={cx + 5} y={cy + 26 * k} width="13" height="17" rx="1.5" className="cue-cap" />
      <path d={`M${r1(cx + 8)} ${r1(cy + 33 * k)}h7M${r1(cx + 8)} ${r1(cy + 38 * k)}h5`} className="stroke-ink" strokeWidth="1.4" opacity="0.5" />
      {/* the glass of cha (sip: raised; biscuit: held low in the other hand) and the biscuit */}
      {pose === "listen" ? null : (
        <g>
          <rect x={(pose === "sip" ? fx : bx) - 5} y={(pose === "sip" ? fy : by) - 16} width="10" height="17" rx="2" className="fill-glow" />
          <rect x={(pose === "sip" ? fx : bx) - 5} y={(pose === "sip" ? fy : by) - 16} width="10" height="5" className="fill-paper" opacity="0.6" />
        </g>
      )}
      {pose === "biscuit" ? <path className="fill-wood" d={blob([[fx + 2, fy - 8], [fx + 9, fy - 12], [fx + 15, fy - 6], [fx + 9, fy - 1]])} /> : null}
    </Placed>
  );
}

// ---- Street vendors (Scene 7) ------------------------------------------------------------------
// fuchka: stands behind his cart (faces right), a checked gamchha on the shoulder. jhalmuri: faces left, a
// tin drum on a stand in front of him, rim painted in the evening's accent (the one cue).
export function Vendor({ kind, ...p }: CastProps & { kind: "fuchka" | "jhalmuri" }) {
  const fuchka = kind === "fuchka";
  const pz: Pose = fuchka
    ? { ...STAND, head: [0.03, 0.9], neck: [0.02, 0.85], fe: [0.07, 0.62], fh: [0.17, 0.55], be: [-0.02, 0.62], bh: [0.04, 0.5] }
    : { ...STAND, head: [0.02, 0.915], fe: [0.07, 0.6], fh: [0.16, 0.56], be: [0.06, 0.6], bh: [0.14, 0.54] };
  const b = MAN;
  const H = b.H;
  const [hx, hy] = P(pz.head, H);
  const [shx, shy] = P(pz.sh, H);
  const [cx, cy] = P(pz.ch, H);
  return (
    <Placed {...p}>
      <Silhouette paths={bodyPaths(pz, b)} />
      {/* lungi, plain */}
      <path className="fill-ink" d={ribbon([[...P(pz.hip, H), 44], [...P([0.012, 0.3], H), 48], [...P([0, 0.1], H), 46]])} />
      {fuchka ? (
        <path d={ribbon([[shx - 4, shy - 2, 14], [shx + 10, shy + 12, 20], [cx + 16, cy + 22, 18], [cx + 17, cy + 50, 13]])} fill="url(#gamchha-check)" />
      ) : (
        <g>
          <path d="M74 -102V0M106 -102V0" className="stroke-ink" strokeWidth="5" />
          <path d={blob([[54, -146], [62, -154], [112, -154], [118, -146], [116, -106], [108, -98], [64, -98], [56, -106]])} className="fill-wall-lit" />
          <path d="M58 -126h58M58 -112h58" className="stroke-ink" strokeWidth="2" opacity="0.3" fill="none" />
          <ellipse cx="86" cy="-153" rx="33" ry="7" className="fill-accent" />
          <path d={`M${r1(hx - 14)} ${r1(hy - 14)}Q${r1(hx)} ${r1(hy - 30)} ${r1(hx + 16)} ${r1(hy - 12)}`} className="fill-ink" />
        </g>
      )}
    </Placed>
  );
}
