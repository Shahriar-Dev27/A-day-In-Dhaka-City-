import type { CSSProperties, SVGProps } from "react";
import { STROKE, blob, curve, r1, ribbon, wobblePoly, wobbleRect, type V2 } from "../tong/geometry";

/*
  Scene 3 vehicles, drawn ONCE as <symbol-like> groups in <JamDefs/> and placed with <use>. Same print
  language as the tong set: flat tokened fills, hand-cut wobble edges, halftone for dents and shade, a
  second tone for painted detail, ink silhouettes for people. Every origin is the ground contact line,
  x increases to the front (all traffic faces right, drives with the camera). Per-instance colour comes
  from CSS custom properties on the <use> (--rk-body, --bus, ...), which inherit into the referenced
  group, so nine buses are nine <use> nodes, not nine drawings.
  Wheels are NOT part of the bodies: a scene spins them (data-wheel) from the scroll velocity.
  Colour roles (jam.css): Rickshaw Magenta is the loud one (rickshaw body/hood), Tong Amber trims it,
  the buses stay a muted wall-mixed red/blue/olive, the CNG is the cue green, people are ink.
*/

const P = (pts: readonly (readonly [number, number])[], seed: number, amp = 1.3) => wobblePoly(pts as V2[], seed, amp);

/** Sawtooth fringe hanging off a horizontal edge: tin-foil tinsel. */
function fringe(x0: number, x1: number, y: number, depth: number, step: number): string {
  let d = `M${x0} ${y}`;
  for (let x = x0; x < x1; x += step) d += `L${r1(x + step / 2)} ${y + depth}L${r1(Math.min(x + step, x1))} ${y}`;
  return `${d}Z`;
}

/** A painted flower: rounded petals via a closed spline through alternating radii. */
function flower(cx: number, cy: number, ro: number, ri: number, petals = 6): string {
  const pts: V2[] = [];
  for (let i = 0; i < petals * 2; i++) {
    const a = (i / (petals * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 ? ri : ro;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return blob(pts);
}

const spokes = (n: number, a: number, b: number) =>
  Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2;
    return `M${r1(Math.cos(t) * a)} ${r1(Math.sin(t) * a)}L${r1(Math.cos(t) * b)} ${r1(Math.sin(t) * b)}`;
  }).join("");

// ---- shared bits ------------------------------------------------------------------------------
const hair = { fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;

// ---- the cycle rickshaw (facing right; rear wheel (78,-58), front wheel (320,-54)) -------------
const R = {
  panel: P([[26, -90], [218, -90], [230, -162], [34, -170]], 301, 1.2),
  under: P([[26, -90], [218, -90], [221, -110], [28, -110]], 302, 0.8),
  bird: blob([[128, -138], [142, -146], [158, -146], [170, -138], [158, -134], [146, -131]]),
  flowerA: flower(86, -134, 31, 16),
  flowerB: flower(184, -132, 21, 11),
  leaf1: blob([[112, -126], [126, -138], [142, -131], [128, -121]]),
  leaf2: blob([[40, -122], [54, -113], [70, -117], [56, -127]]),
  fringeA: fringe(26, 218, -90, 13, 9),
  hood: "M30 -166C24 -232 68 -272 118 -260C152 -251 170 -214 172 -168Z",
  hoodRibs: "M62 -168C60 -214 82 -246 104 -257M96 -168C98 -210 112 -240 126 -252M132 -168C138 -200 148 -226 154 -240",
  hoodFold: "M30 -166C62 -192 132 -196 172 -168Z",
  hoodEdge: "M30 -166C24 -232 68 -272 118 -260C152 -251 170 -214 172 -168",
  frame: "M78 -58L150 -96H248L320 -54M150 -96L196 -60H250M298 -140L320 -54M298 -140L286 -178M274 -178H304",
  guardR: "M14 -58A64 64 0 0 1 142 -58",
  guardF: "M268 -54A52 52 0 0 1 372 -54",
  seat: P([[112, -170], [216, -170], [216, -188], [114, -188]], 303, 0.8),
  saddle: "M242 -152q20 -12 40 0v9h-40z",
};

function RickshawBody() {
  return (
    <g id="j-rick">
      {/* chassis and mudguards (painted foil) */}
      <path d={R.frame} {...hair} strokeWidth={6} className="stroke-ink" />
      <circle cx="226" cy="-66" r="11" {...hair} strokeWidth={STROKE.line} className="stroke-ink" />
      <path d={R.guardR} {...hair} strokeWidth={7} className="s-foil" />
      <path d={R.guardF} {...hair} strokeWidth={7} className="s-foil" />
      <path d={R.guardR} {...hair} strokeWidth={2} strokeDasharray="1 11" className="stroke-ink" />
      <path d={R.saddle} className="fill-ink" />
      {/* the hood, half folded: ribs, a braided edge, a dark fold inside */}
      <path d={R.hoodFold} className="fill-ink" opacity="0.5" />
      <path d={R.hood} className="j-rk-hood" />
      <path d={R.hood} fill="url(#riso-dots)" opacity="0.2" />
      <path d={R.hoodRibs} {...hair} strokeWidth={2.2} className="s-cream" opacity="0.85" />
      <path d={R.hoodEdge} {...hair} strokeWidth={7} strokeDasharray="2 7" className="j-rk-trim-s" />
      {/* the painted back panel: body colour, a band of shade, cream border dots, flowers, a bird */}
      <path d={R.seat} className="fill-ink" />
      <path d={R.panel} className="j-rk-body" />
      <path d={R.under} className="j-rk-body-d" />
      <path d={R.panel} fill="url(#riso-fine)" opacity="0.14" />
      <path d="M42 -102H206L214 -156H48Z" {...hair} strokeWidth={4.5} strokeDasharray="0 10" className="j-rk-ink-s" />
      <path d={R.leaf1} className="j-rk-hood" />
      <path d={R.leaf2} className="j-rk-hood" />
      <path d={R.flowerA} className="j-rk-ink" />
      <circle cx="86" cy="-134" r="9" className="j-rk-trim" />
      <path d={R.flowerB} className="j-rk-ink" />
      <circle cx="184" cy="-132" r="5.5" className="j-rk-trim" />
      <path d={R.bird} className="j-rk-trim" />
      {/* tinsel: a foil fringe along the panel, hanging tassels */}
      <path d={R.fringeA} className="j-rk-trim" />
      <path d={R.fringeA} className="s-foil" {...hair} strokeWidth={1.2} fill="none" />
      <path d="M44 -90V-62M92 -90V-58M140 -90V-60M188 -90V-62" {...hair} strokeWidth={3} className="j-rk-trim-s" />
      {/* front lamp */}
      <circle cx="304" cy="-118" r="7" className="fill-glow" />
    </g>
  );
}

// ---- the puller: ink, gamchha head-cloth is the cue ---------------------------------------------
function PullerBody() {
  return (
    <g id="j-puller" className="fill-ink">
      <path d={ribbon([[262, -150, 22], [244, -118, 18], [240, -64, 11], [226, -62, 9]])} />
      <path d={ribbon([[262, -152, 32], [270, -192, 30], [276, -230, 24]])} />
      <path d={ribbon([[264, -150, 24], [300, -130, 20], [286, -84, 12], [300, -72, 8]])} />
      <path d={ribbon([[276, -224, 12], [298, -202, 10], [294, -182, 8]])} />
      <ellipse cx="284" cy="-254" rx="14" ry="16" />
      <path d={blob([[270, -256], [274, -274], [292, -276], [300, -262], [290, -262], [276, -258]])} fill="url(#gamchha-check)" />
    </g>
  );
}

// ---- passengers: seated silhouettes, one cue colour (--shirt) ---------------------------------
function PassengerBody() {
  return (
    <g id="j-pax" className="fill-ink">
      <path d={ribbon([[156, -192, 26], [212, -194, 22], [216, -132, 14]])} />
      <path d={ribbon([[154, -192, 36], [150, -232, 34], [154, -266, 28]])} />
      <ellipse cx="158" cy="-286" rx="15" ry="17" />
      <path className="j-shirt" d={ribbon([[154, -196, 30], [150, -232, 28], [154, -262, 22]])} />
      <path d={ribbon([[156, -258, 11], [186, -236, 10], [196, -204, 8]])} />
    </g>
  );
}

// ---- the bus (facing right, 640 x 250; wheels at x 130 and 480, r 48) ---------------------------
const B = {
  body: P([[6, -82], [2, -232], [18, -246], [552, -250], [612, -176], [638, -150], [638, -82]], 311, 1.4),
  band: P([[3, -140], [630, -140], [638, -104], [4, -104]], 312, 1),
  skirt: P([[6, -86], [638, -86], [638, -64], [8, -64]], 313, 1),
  win: (i: number) => wobbleRect(38 + i * 96, -228, 84, 70, 320 + i, 1.2),
  door: P([[528, -234], [588, -234], [588, -70], [528, -70]], 330, 1),
  cabWin: P([[598, -230], [630, -184], [598, -184]], 331, 1),
  dentA: blob([[58, -134], [92, -140], [126, -132], [120, -110], [84, -106], [56, -116]]),
  dentB: blob([[440, -214], [480, -222], [514, -204], [506, -170], [462, -166], [436, -184]]),
  dentC: blob([[250, -92], [290, -96], [316, -86], [296, -72], [258, -74]]),
  rust: blob([[56, -92], [96, -100], [150, -96], [180, -84], [120, -78], [70, -78]]),
  scratch: curve([[160, -214], [198, -186], [236, -176], [300, -170]]),
  heads: Array.from({ length: 5 }, (_, i) => {
    const x = 38 + i * 96;
    return `M${x + 16} ${-176}a9 10 0 1 0 0.1 0M${x + 44} ${-170}a10 11 0 1 0 0.1 0M${x + 70} ${-178}a9 9 0 1 0 0.1 0`;
  }).join(""),
  shoulders: Array.from({ length: 5 }, (_, i) => {
    const x = 38 + i * 96;
    return `M${x + 6} -158q10 -14 20 0M${x + 33} -158q11 -16 22 0M${x + 60} -158q10 -13 20 0`;
  }).join(""),
};

function BusBody() {
  return (
    <g id="j-bus">
      <path d={B.body} className="j-bus" />
      <path d={B.body} fill="url(#riso-speck)" opacity="0.4" />
      <path d={B.band} className="j-bus-2" />
      <path d={B.skirt} className="j-bus-d" />
      {/* wheel arches, then the wheels sit on top */}
      <circle cx="130" cy="-48" r="58" className="fill-ink" />
      <circle cx="480" cy="-48" r="58" className="fill-ink" />
      {/* windows full of heads: glass is a pale blue-grey, so the ink silhouettes read */}
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={B.win(i)} className="j-glass" />
      ))}
      <path d={B.heads} className="fill-ink" opacity="0.85" />
      <path d={B.shoulders} {...hair} strokeWidth={8} className="stroke-ink" opacity="0.85" />
      <path d="M52 -226l-26 70M148 -226l-26 70M244 -226l-26 70M340 -226l-26 70M436 -226l-26 70" {...hair} strokeWidth={2} className="s-cream" opacity="0.4" />
      {/* the open door, its steps, the cab window */}
      <path d={B.door} className="fill-ink" opacity="0.92" />
      <path d={B.door} fill="url(#riso-dots)" opacity="0.4" />
      <path d="M528 -100H588M528 -84H588" {...hair} strokeWidth={4} className="stroke-wall-lit" />
      <path d={B.cabWin} className="j-glass" />
      {/* dents: darker patches with halftone, a scratch, rust at the arch */}
      <path d={B.rust} className="fill-ink" opacity="0.28" />
      <path d={B.dentA} className="fill-ink" opacity="0.2" />
      <path d={B.dentA} fill="url(#riso-dots)" opacity="0.5" />
      <path d={B.dentB} className="fill-ink" opacity="0.18" />
      <path d={B.dentB} fill="url(#riso-dots)" opacity="0.45" />
      <path d={B.dentC} className="fill-ink" opacity="0.22" />
      <path d={B.scratch} {...hair} strokeWidth={2} className="s-cream" opacity="0.5" />
      {/* route plate sits on the band (text is added per bus by the scene) */}
      <rect x="196" y="-136" width="252" height="40" rx="2" className="fill-ink" opacity="0.88" />
      <rect x="201" y="-131" width="242" height="30" rx="1" {...hair} strokeWidth={1.4} className="s-cream" opacity="0.6" />
      {/* mirror, bumper, headlight, tail lamp, ladder, roof rail */}
      <path d="M604 -196L652 -212M652 -212v26" {...hair} strokeWidth={3} className="stroke-ink" />
      <rect x="596" y="-84" width="52" height="12" className="j-steel" />
      <circle cx="628" cy="-104" r="12" className="fill-glow" />
      <circle cx="628" cy="-104" r="12" fill="none" strokeWidth={3} className="stroke-ink" />
      <rect x="4" y="-112" width="9" height="20" className="cue-notebook" />
      <path d="M12 -238V-92M12 -210h22M12 -180h22M12 -150h22M12 -120h22" {...hair} strokeWidth={2.4} className="stroke-ink" opacity="0.7" />
      <path d="M22 -262L548 -266M22 -256V-250M548 -260V-250" {...hair} strokeWidth={STROKE.hair} className="stroke-ink" opacity="0.8" />
    </g>
  );
}

// ---- the CNG (green cage; facing right, 250 long; wheels at x 62 and 214, r 32) -----------------
const C = {
  rear: P([[8, -48], [8, -142], [100, -150], [176, -146], [182, -48]], 341, 1.2),
  roof: "M-2 -146C14 -208 118 -222 190 -176C214 -168 232 -164 240 -160L236 -148L180 -150Z",
  cab: P([[176, -48], [182, -150], [232, -146], [252, -104], [252, -48]], 342, 1.1),
  wind: P([[196, -148], [228, -144], [242, -112], [198, -112]], 343, 0.8),
  cage: `${Array.from({ length: 11 }, (_, i) => `M${20 + i * 14} -146V-50`).join("")}M10 -118H178M10 -84H178`,
};

function CngBody() {
  return (
    <g id="j-cng">
      <circle cx="-2" cy="-88" r="22" fill="none" strokeWidth={11} className="stroke-ink" />
      <path d={C.rear} className="j-cng" />
      <rect x="14" y="-142" width="162" height="92" className="fill-ink" opacity="0.8" />
      <path d="M44 -112a10 11 0 1 0 0.1 0M74 -108a9 10 0 1 0 0.1 0" className="j-glass" opacity="0.55" />
      <path d="M36 -104q8 -14 16 0M66 -100q8 -13 16 0" {...hair} strokeWidth={9} className="j-glass" opacity="0.4" />
      <path d={C.cage} {...hair} strokeWidth={2.6} className="j-cng-s" />
      <path d={C.roof} className="j-cng-d" />
      <path d={C.roof} fill="url(#riso-dots)" opacity="0.22" />
      <path d={C.cab} className="j-cng" />
      <path d="M176 -58H252" {...hair} strokeWidth={3} className="stroke-ink" opacity="0.5" />
      <path d={C.wind} className="j-glass" />
      <path d="M205 -118a10 11 0 1 0 0.1 0" className="fill-ink" />
      <path d="M196 -100q10 -22 22 0z" className="fill-ink" />
      <circle cx="248" cy="-78" r="9" className="fill-glow" />
      <rect x="236" y="-56" width="20" height="8" className="j-steel" />
      <path d={flower(100, -168, 8, 4, 5)} className="j-cream" opacity="0.9" />
    </g>
  );
}

// ---- the motorbike + rider (helmet is the cue; facing right; wheels at x 36 and 158, r 34) ------
function BikeBody() {
  return (
    <g id="j-bike">
      <path d="M62 -44L8 -52" {...hair} strokeWidth={7} className="j-steel-s" />
      <path d="M158 -34L146 -100M138 -106h22" {...hair} strokeWidth={5} className="stroke-ink" />
      <path d="M36 -34L70 -66H130L158 -34" {...hair} strokeWidth={5} className="stroke-ink" />
      <rect x="74" y="-72" width="48" height="30" rx="5" className="j-steel" />
      <path d={blob([[74, -92], [102, -100], [134, -94], [136, -80], [104, -76], [76, -80]])} className="j-cng" />
      <path d={ribbon([[30, -80, 14], [60, -84, 12], [84, -84, 8]])} className="fill-ink" />
      <circle cx="164" cy="-94" r="8" className="fill-glow" />
      {/* the rider, leaning into the weave */}
      <g className="fill-ink">
        <path d={ribbon([[58, -86, 24], [76, -118, 26], [92, -148, 22]])} />
        <path d={ribbon([[60, -84, 20], [100, -82, 15], [92, -44, 9]])} />
        <path d={ribbon([[90, -140, 10], [118, -124, 9], [140, -106, 7]])} />
        <rect x="34" y="-142" width="28" height="42" rx="8" transform="rotate(-8 48 -120)" />
        <path d={blob([[92, -168], [100, -180], [116, -178], [122, -164], [116, -154], [100, -154]])} className="j-helmet" />
      </g>
    </g>
  );
}

const SPOKED = spokes(12, 6, 37);

export function JamDefs() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" className="pointer-events-none absolute">
      <defs>
        {/* spoked wheel (rickshaw, bike) and solid wheel (bus, CNG); both r = 50 around (0,0) */}
        <g id="j-wheel-s">
          <circle r="46" fill="none" strokeWidth="9" className="stroke-ink" />
          <circle r="37" fill="none" strokeWidth="2" className="s-cream" />
          <path d={SPOKED} {...hair} strokeWidth={1.6} className="s-cream" />
          <circle r="6" className="fill-ink" />
          <path d="M0 -46V-37" strokeWidth="4" className="stroke-glow" />
        </g>
        <g id="j-wheel-h">
          <circle r="50" className="fill-ink" />
          <circle r="49" fill="none" strokeWidth="1.8" strokeDasharray="7 10" className="s-cream" opacity="0.3" />
          <circle r="30" className="j-steel" />
          <circle r="19" fill="none" strokeWidth="5" strokeDasharray="0 19.9" strokeLinecap="round" className="stroke-ink" />
          <circle r="8" className="fill-ink" />
        </g>
        <RickshawBody />
        <PullerBody />
        <PassengerBody />
        <BusBody />
        <CngBody />
        <BikeBody />
      </defs>
    </svg>
  );
}

// ---- placement helpers (street layer) -----------------------------------------------------------
type Vars = Record<`--${string}`, string>;
const v = (vars: Vars) => vars as CSSProperties;

export type RickTone = "mag" | "amber" | "dusk";
const RICK_TONES: Record<RickTone, Vars> = {
  mag: { "--rk-body": "var(--j-mag)", "--rk-hood": "var(--j-blue)", "--rk-trim": "var(--j-amber)", "--rk-ink": "var(--j-cream)" },
  amber: { "--rk-body": "var(--j-amber)", "--rk-hood": "var(--j-mag)", "--rk-trim": "var(--j-cream)", "--rk-ink": "var(--j-mag-d)" },
  dusk: { "--rk-body": "var(--j-mag-d)", "--rk-hood": "var(--j-cream)", "--rk-trim": "var(--j-amber)", "--rk-ink": "var(--j-amber)" },
};
export type BusTone = "red" | "blue" | "olive";
const BUS_TONES: Record<BusTone, Vars> = {
  red: { "--bus": "var(--j-bus-red)", "--bus-2": "var(--j-cream)" },
  blue: { "--bus": "var(--j-bus-blue)", "--bus-2": "var(--j-amber-soft)" },
  olive: { "--bus": "var(--j-bus-olive)", "--bus-2": "var(--j-mag-soft)" },
};

const WHEEL_R = { rick: [58, 54], bus: 48, cng: 32, bike: 34 } as const;

function Wheel({ x, y, r, spoked, kind }: { x: number; y: number; r: number; spoked: boolean; kind: "free" | "heavy" }) {
  return (
    <g data-wheel={kind} data-wx={x} transform={`translate(${r1(x)} ${r1(y)}) scale(${r1(r / 50)})`}>
      <use href={spoked ? "#j-wheel-s" : "#j-wheel-h"} />
    </g>
  );
}

/** A rickshaw with its puller (and optionally a seated passenger). `at` is the ground contact of the origin. */
export function Rickshaw({ at, tone = "mag", pax, ...rest }: { at: V2; tone?: RickTone; pax?: "cream" | "blue" | "khaki" | null } & SVGProps<SVGGElement>) {
  const [x, y] = at;
  const shirt = pax === "blue" ? "var(--j-blue)" : pax === "khaki" ? "var(--j-khaki)" : "var(--j-cream)";
  return (
    <g {...rest}>
      <use href="#j-rick" x={x} y={y} style={v(RICK_TONES[tone])} />
      {pax ? <use href="#j-pax" x={x} y={y} style={v({ "--shirt": shirt })} /> : null}
      <use href="#j-puller" x={x} y={y} />
      <Wheel x={x + 78} y={y - 58} r={WHEEL_R.rick[0]} spoked kind="free" />
      <Wheel x={x + 320} y={y - 54} r={WHEEL_R.rick[1]} spoked kind="free" />
    </g>
  );
}

export function Bus({ at, tone = "red", route, ...rest }: { at: V2; tone?: BusTone; route: string } & SVGProps<SVGGElement>) {
  const [x, y] = at;
  return (
    <g {...rest}>
      <use href="#j-bus" x={x} y={y} style={v(BUS_TONES[tone])} />
      <text x={x + 322} y={y - 106} textAnchor="middle" fontSize="30" fontWeight="700" fontFamily="var(--font-chunky)" lang="bn" className="j-plate-text">
        {route}
      </text>
      <Wheel x={x + 130} y={y - 48} r={WHEEL_R.bus} spoked={false} kind="heavy" />
      <Wheel x={x + 480} y={y - 48} r={WHEEL_R.bus} spoked={false} kind="heavy" />
    </g>
  );
}

export function Cng({ at, ...rest }: { at: V2 } & SVGProps<SVGGElement>) {
  const [x, y] = at;
  return (
    <g {...rest}>
      <use href="#j-cng" x={x} y={y} />
      <Wheel x={x + 62} y={y - 32} r={WHEEL_R.cng} spoked={false} kind="heavy" />
      <Wheel x={x + 214} y={y - 32} r={WHEEL_R.cng} spoked={false} kind="heavy" />
    </g>
  );
}

export function Bike({ at, ...rest }: { at: V2 } & SVGProps<SVGGElement>) {
  const [x, y] = at;
  return (
    <g {...rest}>
      <use href="#j-bike" x={x} y={y} />
      <Wheel x={x + 36} y={y - 34} r={WHEEL_R.bike} spoked kind="free" />
      <Wheel x={x + 158} y={y - 34} r={WHEEL_R.bike} spoked kind="free" />
    </g>
  );
}
