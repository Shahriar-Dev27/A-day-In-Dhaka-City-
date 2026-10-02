import type { ReactNode, SVGProps } from "react";
import { blob, curve, ellipse, r1, ribbon, wobblePoly, wobbleRect, type V2 } from "../tong/geometry";

/*
  Scene 4's cast (same language as tong/cast.tsx: ink silhouettes, no faces, ONE costume cue each, every
  part one tapered ribbon, a pose is a set of joints). The carriage is seen across the aisle, so these
  figures are drawn from the FRONT or the BACK (cast.tsx is profile-only and keeps its skeleton private,
  so this is a small frontal sibling built on the same geometry helpers: ribbon / blob / curve).

  Local origin = the figure's feet (standing) or the seat surface (seated), y up is negative. Components
  take { at, flip, s }; every other prop (data-*) lands on the inner <g>, the GSAP target. Heads are
  separate groups: data-head-front (the default) and data-head-side (profile, facing the direction of
  travel) so beat 6 can turn the whole carriage with one opacity swap and a small settle.
*/

type V = readonly [number, number];
export interface FigProps extends Omit<SVGProps<SVGGElement>, "transform"> {
  at: V2;
  flip?: boolean;
  s?: number;
}

function Placed({ at, flip, s = 1, children, ...rest }: FigProps & { children: ReactNode }) {
  return (
    <g transform={`translate(${at[0]} ${at[1]})`}>
      <g {...rest}>
        <g transform={`${flip ? "scale(-1 1) " : ""}${s !== 1 ? `scale(${s})` : ""}`.trim() || undefined}>{children}</g>
      </g>
    </g>
  );
}

// ---- skeleton (fractions of height, y up) ----------------------------------------------------------

interface FP {
  head: V; neck: V; sh: V; ch: V; wa: V; hip: V;
  shL: V; shR: V; elL: V; elR: V; haL: V; haR: V;
  hipL: V; hipR: V; kL: V; kR: V; aL: V; aR: V;
}
interface FB {
  H: number;
  sw: number; cw: number; ww: number; hw: number; // torso widths at shoulder, chest, waist, hip (fraction of H)
  leg: readonly [number, number, number];
  arm: readonly [number, number, number];
  head: V; // rx, ry as a fraction of H
}

const MAN: FB = { H: 380, sw: 0.235, cw: 0.21, ww: 0.175, hw: 0.18, leg: [0.085, 0.065, 0.045], arm: [0.05, 0.042, 0.036], head: [0.057, 0.067] };
const WOMAN: FB = { H: 350, sw: 0.215, cw: 0.2, ww: 0.165, hw: 0.2, leg: [0.08, 0.06, 0.04], arm: [0.046, 0.038, 0.032], head: [0.058, 0.068] };
const KID: FB = { H: 230, sw: 0.25, cw: 0.24, ww: 0.22, hw: 0.22, leg: [0.11, 0.085, 0.065], arm: [0.07, 0.058, 0.05], head: [0.09, 0.105] };

const STAND: FP = {
  head: [0, 0.915], neck: [0, 0.855], sh: [0, 0.8], ch: [0, 0.72], wa: [0, 0.6], hip: [0, 0.52],
  shL: [-0.1, 0.81], shR: [0.1, 0.81], elL: [-0.135, 0.63], elR: [0.135, 0.63], haL: [-0.14, 0.46], haR: [0.14, 0.46],
  hipL: [-0.04, 0.52], hipR: [0.04, 0.52], kL: [-0.052, 0.27], kR: [0.052, 0.27], aL: [-0.056, 0.035], aR: [0.056, 0.035],
};
// seated, origin = the seat surface; seat-to-floor is 127 units (0.334 H for MAN)
const SEAT: FP = {
  head: [0, 0.405], neck: [0, 0.345], sh: [0, 0.3], ch: [0, 0.23], wa: [0, 0.11], hip: [0, 0.03],
  shL: [-0.1, 0.31], shR: [0.1, 0.31], elL: [-0.125, 0.17], elR: [0.125, 0.17], haL: [-0.09, 0.075], haR: [0.09, 0.075],
  hipL: [-0.04, 0.03], hipR: [0.04, 0.03], kL: [-0.075, -0.03], kR: [0.075, -0.03], aL: [-0.085, -0.31], aR: [0.085, -0.31],
};

const P = (v: V, H: number): [number, number] => [r1(v[0] * H), r1(-v[1] * H)];
const W = (n: number, H: number) => r1(n * H);

/** limbs + torso as same-fill paths (head and neck are separate so a head can turn). */
function paths(p: FP, b: FB): string[] {
  const { H } = b;
  const j = (v: V, w: number) => [...P(v, H), W(w, H)] as const;
  const arm = (s: V, e: V, h: V) => ribbon([j(s, b.arm[0]), j(e, b.arm[1]), j(h, b.arm[2])]);
  const leg = (hp: V, k: V, a: V, side: number) =>
    ribbon([j(hp, b.leg[0]), j(k, b.leg[1]), j(a, b.leg[2])]) + ribbon([j(a, b.leg[2]), j([a[0] + side * 0.045, a[1] - 0.018], b.leg[2] * 0.72)]);
  return [
    leg(p.hipL, p.kL, p.aL, -1),
    leg(p.hipR, p.kR, p.aR, 1),
    ribbon([j(p.neck, 0.05), j(p.sh, b.sw), j(p.ch, b.cw), j(p.wa, b.ww), j(p.hip, b.hw)]),
    arm(p.shL, p.elL, p.haL),
    arm(p.shR, p.elR, p.haR),
    ribbon([j(p.neck, 0.05), j([p.neck[0], p.neck[1] + 0.035], 0.045)]),
  ];
}

const frontHead = (p: FP, b: FB) => {
  const [hx, hy] = P(p.head, b.H);
  return ellipse(hx, hy, b.head[0] * b.H, b.head[1] * b.H);
};
/** profile head, facing screen-left (the direction of travel) */
const sideHead = (p: FP, b: FB) => {
  const [hx, hy] = P(p.head, b.H);
  const [rx, ry] = [b.head[0] * b.H, b.head[1] * b.H];
  const pts: V[] = [[-1.15, 0.0], [-0.85, -0.82], [-0.05, -1.04], [0.75, -0.8], [1.0, -0.3], [1.1, 0.0], [1.4, 0.3], [1.12, 0.46], [0.92, 0.66], [0.85, 1.2], [0.1, 1.05], [-0.8, 0.7]];
  return blob(pts.map(([x, y]) => [hx - x * rx, hy + y * ry] as const));
};

function Heads({ p, b, className = "fill-ink", children, tilt }: { p: FP; b: FB; className?: string; children?: ReactNode; tilt?: number }) {
  const [nx, ny] = P(p.neck, b.H);
  const pose = tilt ? `rotate(${tilt} ${nx} ${ny})` : undefined;
  return (
    <g transform={pose}>
      <g data-head-front>
        <path className={className} d={frontHead(p, b)} />
        {children}
      </g>
      <g data-head-side opacity="0" style={{ visibility: "hidden" }}>
        <path className={className} d={sideHead(p, b)} />
      </g>
    </g>
  );
}

const Body = ({ d, className = "fill-ink" }: { d: string[]; className?: string }) => (
  <g className={className}>
    {d.map((x, i) => (
      <path key={i} d={x} />
    ))}
  </g>
);

const set = (base: FP, over: Partial<FP>): FP => ({ ...base, ...over });

// ---- Father and son: beat 2 ----------------------------------------------------------------------
// The boy stands on the bench, both palms flat on the glass, looking down at the buses; his father,
// on the floor beside him, has one hand on his shoulder and the other on the pole. Seen from behind.
export function FatherSon({ at, ...rest }: FigProps) {
  const [fx, fy] = at;
  const father = set(STAND, {
    head: [0.025, 0.915], neck: [0.012, 0.855], sh: [0.006, 0.8], shR: [0.108, 0.815], elR: [0.21, 0.79], haR: [0.288, 0.84],
    shL: [-0.098, 0.81], elL: [-0.14, 0.64], haL: [-0.135, 0.62],
  });
  const boy = set(STAND, {
    head: [0.0, 0.9], neck: [0, 0.845], shL: [-0.12, 0.8], shR: [0.12, 0.8], elL: [-0.19, 0.9], elR: [0.19, 0.9], haL: [-0.215, 1.0], haR: [0.215, 1.0],
    wa: [0, 0.6], hip: [0, 0.52],
  });
  const fb = MAN;
  const kb = KID;
  const [bx, by] = [140, -127]; // boy's origin relative to the father's
  const [bhx, bhy] = P(boy.haL, kb.H);
  const [bhx2] = P(boy.haR, kb.H);
  const shirt = (p: FP, b: FB) => ribbon([[...P(p.sh, b.H), W(b.sw + 0.012, b.H)], [...P(p.ch, b.H), W(b.cw + 0.012, b.H)], [...P(p.wa, b.H), W(b.ww + 0.012, b.H)], [...P(p.hip, b.H), W(b.hw, b.H)]]);
  const sleeve = (s: V, e: V, w: number, b: FB) => ribbon([[...P(s, b.H), W(w, b.H)], [...P(e, b.H), W(w * 0.9, b.H)]]);
  return (
    <Placed at={[fx, fy]} {...rest}>
      {/* father */}
      <g data-pax-part>
        <Body d={paths(father, fb)} />
        <path className="cue-uniform" d={shirt(father, fb)} />
        <path className="cue-uniform" d={sleeve(father.shR, father.elR, 0.056, fb)} />
        <path className="cue-uniform" d={sleeve(father.shL, father.elL, 0.056, fb)} />
        <Heads p={father} b={fb} />
      </g>
      {/* boy, on the bench */}
      <g transform={`translate(${bx} ${by})`}>
        <Body d={paths(boy, kb)} />
        <path className="cue-notebook" d={shirt(boy, kb)} />
        <path className="cue-notebook" d={sleeve(boy.shL, boy.elL, 0.085, kb)} />
        <path className="cue-notebook" d={sleeve(boy.shR, boy.elR, 0.085, kb)} />
        {/* palms on the glass, and the breath fog round each */}
        <g fill="none" className="stroke-paper" strokeWidth="2" opacity="0.75">
          <path d={ellipse(bhx - 2, bhy - 4, 20, 24)} strokeDasharray="2 5" />
          <path d={ellipse(bhx2 + 2, bhy - 4, 20, 24)} strokeDasharray="2 5" />
        </g>
        <Heads p={boy} b={kb} />
      </g>
    </Placed>
  );
}

// ---- Commuter, seated: beat 3 (and the same man as Scene 3: backpack, lanyard, phone) ---------------
export function Commuter({ at, ...rest }: FigProps) {
  const b = MAN;
  const p = set(SEAT, {
    head: [0, 0.385], neck: [0, 0.34],
    elL: [-0.125, 0.18], haL: [-0.03, 0.225], elR: [0.125, 0.18], haR: [0.03, 0.225],
    kL: [-0.1, -0.03], kR: [0.1, -0.03], aL: [-0.125, -0.31], aR: [0.125, -0.31],
  });
  const [hx, hy] = P(p.head, b.H);
  return (
    <Placed at={at} {...rest}>
      <Body d={paths(p, b)} />
      {/* the one cue: ID lanyard and card, hanging below the phone */}
      <path d={curve([[-14, -128], [-6, -92], [0, -64]])} fill="none" strokeWidth="2.4" className="cue-lanyard-s" />
      <path d={curve([[14, -128], [6, -92], [0, -64]])} fill="none" strokeWidth="2.4" className="cue-lanyard-s" />
      <rect x="-9" y="-66" width="18" height="24" rx="2" className="cue-lanyard" />
      {/* backpack on the lap, parted from the legs by a paper-cut gap */}
      <rect x="-38" y="-30" width="76" height="56" rx="16" className="fill-ink" strokeWidth="3" style={{ stroke: "var(--cabin)" }} />
      <path d="M-24 -18h48" strokeWidth="2" className="stroke-wall-lit" opacity="0.45" fill="none" />
      {/* thumbing a message: the phone is the one light, and the glow it throws on his chin */}
      <g data-phone>
        <rect x="-8" y="-100" width="16" height="26" rx="2.5" transform="rotate(-6 0 -87)" className="fill-glow" />
        <path d="M-4 -92h8M-4 -86h6" strokeWidth="1.6" className="stroke-ink" opacity="0.55" fill="none" transform="rotate(-6 0 -87)" />
      </g>
      <g data-bob>
        <Heads p={p} b={b} tilt={7}>
          <path d={`M${r1(hx - 14)} ${r1(hy - 14)}Q${r1(hx)} ${r1(hy - 30)} ${r1(hx + 14)} ${r1(hy - 14)}`} className="fill-ink" />
        </Heads>
      </g>
    </Placed>
  );
}

// ---- Garment worker, seated, eyes closed: beat 5 ---------------------------------------------------
// Head against the pillar, dupatta slack, tiffin in her lap. The Tk 10 note sits in its own slot of the
// ID pouch, apart from the card: the morning's debt (SCRIPT-v2 beat 5).
export function SeatedWorker({ at, ...rest }: FigProps) {
  const b = WOMAN;
  const p = set(SEAT, {
    head: [0.026, 0.4], neck: [0.012, 0.343], sh: [0.004, 0.3],
    elL: [-0.125, 0.16], haL: [-0.03, 0.075], elR: [0.125, 0.16], haR: [0.03, 0.075],
    kL: [-0.06, -0.03], kR: [0.06, -0.03], aL: [-0.07, -0.315], aR: [0.07, -0.315],
  });
  const [hx, hy] = P(p.head, b.H);
  const [sLx, sLy] = P(p.shL, b.H);
  const [sRx, sRy] = P(p.shR, b.H);
  return (
    <Placed at={at} {...rest}>
      <Body d={paths(p, b)} />
      {/* kameez skirt over the lap, A-line */}
      <path className="fill-ink" d={ribbon([[0, -40, 56], [0, -14, 80], [0, 4, 86]])} />
      {/* tiffin carrier in folded hands */}
      <g className="fill-wall-lit">
        <rect x="-15" y="-34" width="30" height="11" rx="3" />
        <rect x="-15" y="-23" width="30" height="11" rx="3" />
        <rect x="-15" y="-12" width="30" height="11" rx="3" />
      </g>
      <path d="M-15 -23h30M-15 -12h30M-9 -34c0 -12 18 -12 18 0" strokeWidth="1.6" className="stroke-ink" fill="none" />
      {/* the one cue: dupatta, magenta, slack over both shoulders */}
      <path className="cue-dupatta" d={ribbon([[sLx - 2, sLy - 2, 22], [0, sLy + 2, 20], [sRx + 2, sRy - 2, 22]])} />
      <path className="cue-dupatta" d={ribbon([[sLx + 4, sLy + 6, 24], [sLx - 6, sLy + 54, 22], [sLx - 12, sLy + 112, 16]])} />
      <path className="cue-dupatta" d={ribbon([[sRx - 4, sRy + 6, 22], [sRx + 4, sRy + 40, 18], [sRx + 2, sRy + 82, 10]])} />
      {/* ID lanyard into the pouch: card on the left, the folded note in its own slot on the right */}
      <path d={curve([[-12, sLy - 6], [-10, -88], [-5, -74]])} fill="none" strokeWidth="2.2" className="cue-lanyard-s" />
      <path d={curve([[12, sRy - 6], [10, -88], [5, -74]])} fill="none" strokeWidth="2.2" className="cue-lanyard-s" />
      <g data-pouch>
        <rect x="-24" y="-82" width="48" height="42" rx="3" className="fill-paper" />
        <rect x="-20" y="-77" width="19" height="30" rx="1.5" className="cue-lanyard" />
        <path d="M6 -82V-40" strokeWidth="1.8" className="stroke-ink" opacity="0.5" fill="none" />
        <g data-note transform="rotate(7 15 -84)">
          <rect x="9" y="-100" width="13" height="34" rx="1.4" className="cue-note" />
          <path d="M9 -88h13" strokeWidth="1.6" className="stroke-ink" opacity="0.5" fill="none" />
        </g>
      </g>
      <Heads p={p} b={b} tilt={24}>
        <circle cx={hx - 17} cy={hy - 6} r="12" className="fill-ink" />
      </Heads>
    </Placed>
  );
}

// ---- Elderly mother and her son: beat 4 ------------------------------------------------------------
// White sari (the one cue; an ink hem band and fold shading keep it readable on a bright window), both
// hands on the pole, face lifted to the skyline. The son beside her has a hand under her elbow.
export function MotherSon({ at, ...rest }: FigProps) {
  const [mx, my] = at;
  const b: FB = { H: 322, sw: 0.2, cw: 0.2, ww: 0.19, hw: 0.2, leg: [0.075, 0.06, 0.04], arm: [0.044, 0.036, 0.03], head: [0.06, 0.07] };
  const sb: FB = { ...MAN, H: 372 };
  const mother = set(STAND, {
    head: [0.0, 0.92], neck: [0, 0.86], sh: [0, 0.81], shL: [-0.092, 0.815], shR: [0.092, 0.815],
    elL: [0.03, 0.72], haL: [0.152, 0.625], elR: [0.15, 0.7], haR: [0.158, 0.665],
    kL: [-0.04, 0.27], kR: [0.04, 0.27], aL: [-0.04, 0.035], aR: [0.04, 0.035],
  });
  const WHITE = { fill: "color-mix(in oklab, var(--cue-cap) 96%, var(--ink))" } as const;
  const son = set(STAND, {
    head: [-0.012, 0.915], neck: [-0.006, 0.855], sh: [0, 0.8],
    elL: [-0.14, 0.64], haL: [-0.14, 0.5],
    // right arm reaches across to her elbow, palm up under it
    elR: [0.1, 0.62], haR: [0.14, 0.59],
  });
  const [mhx, mhy] = P(mother.head, b.H);
  const [mrx, mry] = [b.head[0] * b.H, b.head[1] * b.H];
  const sari = (extra: number) => {
    const H = b.H;
    const w = (n: number) => H * (n + extra);
    return wobblePoly([[-w(0.095), -H * 0.8], [w(0.095), -H * 0.8], [w(0.11), -H * 0.62], [w(0.128), -H * 0.34], [w(0.14), -H * 0.09], [-w(0.14), -H * 0.09], [-w(0.128), -H * 0.34], [-w(0.11), -H * 0.62]], 906, 1.2);
  };
  const [sx, sy] = [-98, 0]; // the son stands to her left
  return (
    <Placed at={[mx, my]} {...rest}>
      {/* son (behind the pole, left) */}
      <g transform={`translate(${sx} ${sy})`}>
        <Body d={paths(son, sb)} />
        <path
          className="cue-khaki"
          d={ribbon([[...P(son.sh, sb.H), W(sb.sw + 0.012, sb.H)], [...P(son.ch, sb.H), W(sb.cw + 0.012, sb.H)], [...P(son.wa, sb.H), W(sb.ww + 0.012, sb.H)], [...P(son.hip, sb.H), W(sb.hw, sb.H)]])}
        />
        <Heads p={son} b={sb} tilt={-6} />
      </g>
      {/* mother: an ink body under a white sari */}
      <g data-mother>
        <Body d={paths(mother, b)} />
        <path style={WHITE} d={sari(0)} />
        <path d={sari(0)} fill="none" strokeWidth="2" className="stroke-ink" opacity="0.85" vectorEffect="non-scaling-stroke" />
        {/* fold shading under the pallu and a dark hem band: a sari, not a sheet */}
        <path d={ribbon([[-26, -b.H * 0.77, 14], [-6, -b.H * 0.6, 38], [30, -b.H * 0.33, 30]])} fill="url(#riso-dots)" opacity="0.5" />
        <path className="fill-ink" d={wobbleRect(-b.H * 0.14, -b.H * 0.16, b.H * 0.28, 18, 905, 1)} opacity="0.9" />
        <path d={`M${r1(-b.H * 0.13)} ${-b.H * 0.27}c10 14 28 14 46 0`} fill="none" strokeWidth="2" className="stroke-ink" opacity="0.55" />
        {/* sleeves, then hands gripping the pole */}
        <path style={WHITE} d={ribbon([[...P(mother.shL, b.H), W(0.05, b.H)], [...P(mother.elL, b.H), W(0.044, b.H)], [...P(mother.haL, b.H), W(0.034, b.H)]])} />
        <path style={WHITE} d={ribbon([[...P(mother.shR, b.H), W(0.05, b.H)], [...P(mother.elR, b.H), W(0.044, b.H)], [...P(mother.haR, b.H), W(0.034, b.H)]])} />
        <circle cx={P(mother.haL, b.H)[0]} cy={P(mother.haL, b.H)[1]} r="8" className="fill-ink" />
        <circle cx={P(mother.haR, b.H)[0]} cy={P(mother.haR, b.H)[1]} r="8" className="fill-ink" />
        <Heads p={mother} b={b}>
          {/* pallu over the hair, face left dark */}
          <path style={WHITE} d={blob([[mhx - mrx * 1.22, mhy + mry * 0.5], [mhx - mrx * 1.1, mhy - mry * 0.7], [mhx - mrx * 0.1, mhy - mry * 1.3], [mhx + mrx * 1.0, mhy - mry * 0.9], [mhx + mrx * 1.2, mhy + mry * 0.4], [mhx + mrx * 0.7, mhy - mry * 0.2], [mhx - mrx * 0.7, mhy - mry * 0.2]])} />
          <path d={`M${r1(mhx - mrx * 1.2)} ${r1(mhy + mry * 0.5)}C${r1(mhx - mrx * 1.1)} ${r1(mhy - mry * 0.7)} ${r1(mhx)} ${r1(mhy - mry * 1.3)} ${r1(mhx + mrx * 1.2)} ${r1(mhy + mry * 0.4)}`} fill="none" strokeWidth="2" className="stroke-ink" opacity="0.8" vectorEffect="non-scaling-stroke" />
        </Heads>
      </g>
    </Placed>
  );
}

// ---- Extras: the rest of the carriage (they turn too in beat 6) ------------------------------------
export function Extra({ at, kind, ...rest }: FigProps & { kind: "backpack" | "woman" | "exit" }) {
  if (kind === "woman") {
    const b = WOMAN;
    const p = set(STAND, { head: [-0.01, 0.915], elL: [-0.13, 0.63], haL: [-0.1, 0.56], elR: [0.15, 0.67], haR: [0.115, 0.76] });
    const [sx, sy] = P(p.sh, b.H);
    return (
      <Placed at={at} {...rest}>
        <Body d={paths(p, b)} />
        <path className="fill-ink" d={ribbon([[sx, sy + 8, 50], [0, -b.H * 0.55, 52], [0, -b.H * 0.3, 64], [0, -b.H * 0.12, 70]])} />
        {/* shoulder bag: a strap and a slab at the hip */}
        <path d={curve([[sx + 14, sy], [30, -b.H * 0.52], [38, -b.H * 0.42]])} fill="none" strokeWidth="3" className="stroke-ink" />
        <rect x="26" y={-b.H * 0.46} width="34" height="40" rx="6" className="fill-ink" strokeWidth="2.5" style={{ stroke: "var(--cabin)" }} />
        <Heads p={p} b={b}>
          <circle cx={P(p.head, b.H)[0] - 16} cy={P(p.head, b.H)[1] - 4} r="11" className="fill-ink" />
        </Heads>
      </Placed>
    );
  }
  const b = MAN;
  const p = set(STAND, kind === "backpack" ? { head: [0.0, 0.915], elL: [-0.15, 0.7], haL: [-0.14, 0.9], haR: [0.12, 0.5] } : { head: [0.01, 0.915] });
  return (
    <Placed at={at} {...rest}>
      <Body d={paths(p, b)} />
      {kind === "backpack" ? (
        <rect x="-44" y={-b.H * 0.78} width="88" height="110" rx="20" className="fill-ink" strokeWidth="3" style={{ stroke: "var(--cabin)" }} />
      ) : null}
      <Heads p={p} b={b} />
    </Placed>
  );
}
