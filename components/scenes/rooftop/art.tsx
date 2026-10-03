import { STROKE, blob, curve, r1, rng, wobblePoly, wobbleRect, type V2 } from "../tong/geometry";

/*
  Scene 6 art (4:30 PM, "ছাদ আমাদের উঠান"): ONE tall drawing, 1600 x 1800 units, two screens stacked.
  Top screen (y 0..900) is the rooftop sea at golden hour; the bottom screen (y 900..1800) is the lane
  those roofs look down on. The camera descends the same building's facade between them, so there is no
  second composition and no cross-fade.
  Same print language as the tong set: flat tokened fills (fill-wall, fill-far, ...), hand-cut wobble
  edges, halftone for shade, specks of paper grain, one costume cue per figure. No filters, no gradients,
  no hex. Layers back to front: sun > far roofs + haze > neighbour buildings > our building > roof props >
  lane (pole, wires, tong glimpse, ground) > kites.
  Hooks: data-sun, data-haze, data-sway, data-rig/-string/-kx/-kr (a kite on its string), data-free (the
  cut kite), data-stub (the cut string's lower piece), data-flash, data-snag.
*/

const rad = (d: number) => (d * Math.PI) / 180;

// ---- the layout every part of the scene agrees on ------------------------------------------------
export const SUN: V2 = [690, 470];
export const OUR = { x: 560, w: 392, top: 796 } as const; // our roof's parapet
export const LEFT_TOP = 748;
export const RIGHT_TOP = 772;
export const LANE_Y = 1740; // the pavement line; kids' feet stand a little below it
export const FEET_ROOF = 806;
export const LOSER_AT: V2 = [860, FEET_ROOF]; // the kite boy on our roof (his kite gets cut)
export const WINNER_AT: V2 = [982, RIGHT_TOP + 4]; // the kid across the gap (shouts, faces left)
export const LEFTKID_AT: V2 = [380, LEFT_TOP + 4];
export const LEFTKID_S = 0.85; // the younger kid on the left roof
export const MOTHER_AT: V2 = [772, FEET_ROOF];
export const COOP_AT: V2 = [640, FEET_ROOF];
export const DOOR = { x: 878, w: 62 } as const; // ground-floor door, straight under the roof's stair hatch
export const POLE_X = 600;

export const polar = (h: V2, len: number, deg: number): V2 => [h[0] + len * Math.cos(rad(deg)), h[1] + len * Math.sin(rad(deg))];
/** Where two strings (rays from `p` at angle `a`, from `q` at angle `b`, degrees) cross. */
export function intersect(p: V2, a: number, q: V2, b: number): V2 {
  const [ax, ay, bx, by] = [Math.cos(rad(a)), Math.sin(rad(a)), Math.cos(rad(b)), Math.sin(rad(b))];
  const det = ax * -by - ay * -bx;
  const s = ((q[0] - p[0]) * -by - (q[1] - p[1]) * -bx) / det;
  return [p[0] + ax * s, p[1] + ay * s];
}

// Hands: KiteBoy "reach" front hand is (0.17, 1.02) of H 196, SchoolKid "reach" (0.15, 1.02), facing left = mirrored.
export const LOSER_HAND: V2 = [LOSER_AT[0] + 0.17 * 196, LOSER_AT[1] - 1.02 * 196];
export const WINNER_HAND: V2 = [WINNER_AT[0] - 0.15 * 196, WINNER_AT[1] - 1.02 * 196];
export const LEFT_HAND: V2 = [LEFTKID_AT[0] + 0.15 * 196 * LEFTKID_S, LEFTKID_AT[1] - 1.02 * 196 * LEFTKID_S];
/** The fight: the winner's string (-108 deg) crosses the loser's (-85 deg) mid-air and saws it through. */
export const FIGHT = { loserDeg: -85, loserLen: 330, winnerDeg: -108, winnerLen: 380 } as const;
export const CUT_AT = intersect(LOSER_HAND, FIGHT.loserDeg, WINNER_HAND, FIGHT.winnerDeg);
export const CUT_KITE = polar(LOSER_HAND, FIGHT.loserLen, FIGHT.loserDeg); // where the loser's kite is at the cut
export const STUB_LEN = Math.hypot(CUT_AT[0] - LOSER_HAND[0], CUT_AT[1] - LOSER_HAND[1]);
export const SNAG: V2 = [706, 1402]; // where the cut kite comes to rest, on the wires

// ---- sky -----------------------------------------------------------------------------------------

export function Sun({ low }: { low?: boolean }) {
  return (
    <g data-sun>
      {low ? null : <circle cx={SUN[0]} cy={SUN[1]} r="190" fill="url(#riso-glow)" opacity="0.5" />}
      <circle cx={SUN[0]} cy={SUN[1]} r="118" className="rf-sun-halo" />
      <circle cx={SUN[0]} cy={SUN[1]} r="70" className="rf-sun" />
    </g>
  );
}

/** A band of dust haze: a long, hand-cut flat ribbon. The caller wraps it in a drifting group. */
function HazeBand({ y, h, seed, opacity }: { y: number; h: number; seed: number; opacity: number }) {
  const rnd = rng(seed);
  const pts: V2[] = [];
  for (let x = -600; x <= 2200; x += 200) pts.push([x, y + rnd() * 12]);
  const low: V2[] = [];
  for (let x = 2200; x >= -600; x -= 200) low.push([x, y + h - rnd() * 18]);
  return <path d={blob([...pts, ...low])} className="rf-haze" opacity={opacity} />;
}

export function Haze({ y, h, seed, opacity, drift = "a" }: { y: number; h: number; seed: number; opacity: number; drift?: "a" | "b" }) {
  return (
    <g data-haze className={`loop rf-drift-${drift}`}>
      <HazeBand y={y} h={h} seed={seed} opacity={opacity} />
    </g>
  );
}

// ---- far roofs: the sea ------------------------------------------------------------------------
/** One compound path per band: buildings, plus tanks as small cylinders on stands. */
function bandPath(seed: number, base: number, lo: number, hi: number, tankRate: number, minW: number, maxW: number) {
  const rnd = rng(seed);
  const parts: string[] = [];
  let x = -520;
  while (x < 2120) {
    const w = minW + rnd() * (maxW - minW);
    const top = base - lo - rnd() * (hi - lo);
    parts.push(wobbleRect(x, top, w, 900 - top, Math.round(rnd() * 900), 1.4));
    if (rnd() < tankRate) {
      const tx = x + w * (0.15 + rnd() * 0.5);
      const tw = 16 + rnd() * 12;
      parts.push(`M${r1(tx + 2)} ${top}v-7h${r1(tw - 4)}v7Z`, wobbleRect(tx, top - 7 - tw * 0.8, tw, tw * 0.8, Math.round(rnd() * 900), 0.7));
    }
    if (rnd() < 0.16) parts.push(`M${r1(x + w * 0.6)} ${top}v-26h2.4v26Z`); // an aerial
    x += w + 4 + rnd() * 10;
  }
  return parts.join("");
}

const TINY_PEOPLE: readonly V2[] = [[-30, 706], [250, 690], [470, 712], [1210, 696], [1480, 684], [1700, 708]];

export function FarRoofs({ low }: { low?: boolean }) {
  return (
    <g data-far>
      <path d={bandPath(401, 690, 20, 90, 0.5, 60, 120)} className="fill-far" />
      <path d={bandPath(402, 750, 10, 60, 0.6, 70, 130)} className="fill-room" />
      {low ? null : (
        <g className="fill-ink" opacity="0.5">
          {TINY_PEOPLE.map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <rect x="-3" y="-17" width="6" height="17" rx="2.4" />
              <circle cy="-21" r="3.2" />
            </g>
          ))}
        </g>
      )}
    </g>
  );
}

// ---- building bodies and their furniture ------------------------------------------------------

export function Tank({ x, y, w = 64, h = 52, tone = "fill-wall-lit", seed = 1, stand = 14 }: { x: number; y: number; w?: number; h?: number; tone?: string; seed?: number; stand?: number }) {
  const top = y - stand - h;
  return (
    <g>
      <path d={`M${r1(x + w * 0.16)} ${top + h}V${y}M${r1(x + w * 0.84)} ${top + h}V${y}`} className="stroke-ink" strokeWidth={STROKE.line} fill="none" />
      <path d={wobbleRect(x, top, w, h, seed, 1.1)} className={tone} />
      <rect x={x + w * 0.64} y={top + 3} width={w * 0.34} height={h - 6} fill="url(#riso-dots)" opacity="0.28" />
      <ellipse cx={x + w / 2} cy={top} rx={w / 2} ry={Math.max(5, w * 0.09)} className="fill-ink" opacity="0.3" />
      <path d={`M${x} ${r1(top + h * 0.38)}h${w}M${x} ${r1(top + h * 0.72)}h${w}`} className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.35" fill="none" />
    </g>
  );
}

export function Dish({ x, y, k = 1, flip }: { x: number; y: number; k?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})${flip ? " scale(-1 1)" : ""}`} className="stroke-ink" strokeWidth={STROKE.hair} fill="none">
      <path d={`M0 0l${6 * k} ${-24 * k}`} strokeWidth={STROKE.line} />
      <path d={`M${-14 * k} ${-34 * k}a${26 * k} ${26 * k} 0 0 0 ${44 * k} ${-14 * k}z`} className="fill-wall-lit" />
      <path d={`M${8 * k} ${-42 * k}l${22 * k} ${-20 * k}`} />
    </g>
  );
}

/** The stair head-room every Dhaka roof has: a box, a slab lid, a dark doorway behind a grille. */
export function HeadRoom({ x, y, w = 66, h = 104, seed = 3, tone = "fill-wall-dark" }: { x: number; y: number; w?: number; h?: number; seed?: number; tone?: string }) {
  const bars: string[] = [];
  for (let b = x + w * 0.2 + 5; b < x + w * 0.78; b += 8) bars.push(`M${r1(b)} ${y - h * 0.62}V${y - 2}`);
  return (
    <g>
      <path d={wobbleRect(x, y - h, w, h, seed, 1.3)} className={tone} />
      <rect x={x - 4} y={y - h - 8} width={w + 8} height="10" className="fill-wall" />
      <rect x={x + w * 0.2} y={y - h * 0.62} width={w * 0.58} height={h * 0.62 - 2} className="fill-ink" opacity="0.88" data-hatch="" />
      <path d={bars.join("")} className="stroke-wall-lit" strokeWidth={STROKE.hair} opacity="0.6" fill="none" />
      <rect x={x} y={y - h} width={w} height={h} fill="url(#riso-speck)" opacity="0.3" />
    </g>
  );
}

/** One piece of washing on a line: a sari, a lungi, a school shirt. `cls` is a cue class or a pattern fill. */
function Cloth({ x, y, w, h, cls, fill, seed, sway }: { x: number; y: number; w: number; h: number; cls?: string; fill?: string; seed: number; sway?: number }) {
  const rnd = rng(seed);
  return (
    <g data-sway className="loop rf-sway" style={{ animationDelay: `${-(sway ?? 0)}s` }}>
      <path
        d={wobblePoly([[x, y], [x + w, y], [x + w + rnd() * 3, y + h * 0.5], [x + w - 2, y + h], [x + w * 0.5, y + h - 3 - rnd() * 4], [x + 2, y + h], [x - rnd() * 3, y + h * 0.5]], seed, 1.2)}
        className={cls}
        fill={fill}
      />
      <path d={`M${x + 2} ${y + h - 9}H${x + w - 3}`} className="stroke-paper" strokeWidth="3" opacity="0.7" fill="none" />
    </g>
  );
}

export function Clothesline({ x1, x2, y, items, seed, base = FEET_ROOF }: { x1: number; x2: number; y: number; items: readonly { dx: number; w: number; h: number; cls?: string; fill?: string }[]; seed: number; base?: number }) {
  return (
    <g>
      <path d={`M${x1} ${base}V${y - 6}M${x2} ${base}V${y - 12}`} className="stroke-ink" strokeWidth={STROKE.line} fill="none" opacity="0.85" />
      <path d={curve([[x1, y - 6], [(x1 + x2) / 2, y + 7], [x2, y - 12]])} className="stroke-ink" strokeWidth={STROKE.hair} vectorEffect="non-scaling-stroke" fill="none" />
      {items.map((it, i) => (
        <Cloth key={i} x={x1 + it.dx} y={y + 1} w={it.w} h={it.h} cls={it.cls} fill={it.fill} seed={seed + i} sway={i * 0.9} />
      ))}
    </g>
  );
}

/** The pigeon coop: a slatted wooden cage on legs, a tin roof, a landing perch, three birds sitting out. */
export function Coop({ at }: { at: V2 }) {
  const [x, y] = at;
  const slats: string[] = [];
  for (let s = x - 38; s <= x + 38; s += 8) slats.push(`M${s} ${y - 92}V${y - 30}`);
  return (
    <g data-coop>
      <path d={`M${x - 40} ${y - 30}V${y}M${x + 40} ${y - 30}V${y}`} className="stroke-ink" strokeWidth={STROKE.bold} fill="none" />
      <path d={wobbleRect(x - 48, y - 98, 96, 70, 61, 1.2)} className="fill-wood" />
      <path d={slats.join("")} className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.55" fill="none" />
      <rect x={x - 12} y={y - 74} width="24" height="30" rx="12" className="fill-ink" opacity="0.88" />
      <path d={`M${x - 58} ${y - 98}L${x} ${y - 124}L${x + 58} ${y - 98}Z`} className="fill-wall-dark" />
      <path d={`M${x - 20} ${y - 30}h40`} className="stroke-ink" strokeWidth={STROKE.line} fill="none" />
      <g className="fill-ink">
        {[[-30, -102], [-8, -118], [30, -100]].map(([dx, dy], i) => (
          <path key={i} transform={`translate(${x + dx} ${y + dy})`} d="M-7 0C-6 -7 0 -9 5 -6L9 -9L8 -4C8 2 2 5 -4 4L-9 7Z" />
        ))}
      </g>
    </g>
  );
}

/** A plastic chair seen from the front: a blue seat and slotted back on four thin legs. */
export function Chair({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x - 15} ${y - 36}V${y}M${x + 15} ${y - 36}V${y}M${x - 12} ${y - 36}l-5 -36M${x + 12} ${y - 36}l5 -36`} className="stroke-ink" strokeWidth={STROKE.line} fill="none" opacity="0.85" />
      <path d={wobbleRect(x - 20, y - 78, 40, 36, 71, 1)} className="fill-tarp-lit" />
      <path d={`M${x - 12} ${y - 70}v20M${x} ${y - 70}v20M${x + 12} ${y - 70}v20`} className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.4" fill="none" />
      <path d={wobbleRect(x - 22, y - 42, 44, 9, 72, 0.8)} className="fill-tarp" />
    </g>
  );
}

// ---- buildings --------------------------------------------------------------------------------

interface BodyProps {
  x: number;
  w: number;
  top: number;
  cls: string;
  seed: number;
  cols: number;
  rowH?: number;
  winRatio?: number;
}

/** A tall block: body + grain, parapet, floor slabs, all its windows as ONE compound path. Detail is added by the caller. */
function Body({ x, w, top, cls, seed, cols, rowH = 90, winRatio = 0.5 }: BodyProps) {
  const rows = Math.floor((LANE_Y - 80 - (top + 56)) / rowH);
  const colW = w / cols;
  const [wins, slabs, glints] = [[] as string[], [] as string[], [] as string[]];
  for (let r = 0; r < rows; r++) {
    const y = top + 56 + r * rowH;
    slabs.push(wobbleRect(x - 3, y + rowH - 8, w + 6, 8, seed + r, 0.8));
    for (let c = 0; c < cols; c++) {
      const wx = x + c * colW + colW * 0.24;
      wins.push(wobbleRect(wx, y + 10, colW * winRatio, rowH * 0.44, seed * 7 + r * 11 + c, 0.8));
      glints.push(`M${r1(wx + colW * winRatio * 0.3)} ${y + 12 + rowH * 0.42}l${r1(colW * winRatio * 0.22)} ${-rowH * 0.38}`);
    }
  }
  return (
    <g>
      <path d={wobbleRect(x, top, w, 1800 - top, seed, 1.8)} className={cls} />
      <rect x={x} y={top} width={w} height={1800 - top} fill="url(#riso-speck)" opacity="0.32" />
      <rect x={x} y={LANE_Y - 380} width={w} height="380" fill="url(#riso-dots)" opacity="0.1" />
      <path d={wobbleRect(x - 5, top - 2, w + 10, 16, seed + 3, 1.2)} className="fill-wall-dark" />
      <path d={slabs.join("")} className="fill-wall-dark" opacity="0.9" />
      <path d={wins.join("")} className="fill-ink" opacity="0.82" />
      <path d={glints.join("")} className="stroke-wall-lit" strokeWidth={STROKE.hair} opacity="0.45" fill="none" vectorEffect="non-scaling-stroke" />
    </g>
  );
}

/** Our building's face: three bays a floor, a grille under every window, ACs and washing on the rails. */
function OurFacade() {
  const rows = 9;
  const bars: string[] = [];
  const rails: string[] = [];
  const colW = OUR.w / 3;
  for (let r = 0; r < rows; r++) {
    const y = OUR.top + 56 + r * 90;
    for (let c = 0; c < 3; c++) {
      const gx = OUR.x + c * colW + 10;
      rails.push(`M${gx} ${y + 52}h${colW - 20}`);
      for (let b = gx + 4; b < gx + colW - 20; b += 9) bars.push(`M${r1(b)} ${y + 52}v22`);
    }
  }
  const ac: readonly (readonly [number, number])[] = [[0, 2], [1, 0], [2, 1], [3, 2], [5, 1], [6, 0], [7, 2]];
  // a neighbour watching from a balcony, a pot plant or two: a few of the lives behind the grilles
  const watchers: readonly (readonly [number, number])[] = [[3, 1], [6, 0]];
  const plants: readonly (readonly [number, number])[] = [[1, 2], [4, 0], [7, 2]];
  const laundry: readonly (readonly [number, number, string])[] = [[1, 1, "cue-dupatta"], [2, 0, "cue-cap"], [4, 2, "cue-uniform"], [5, 0, "cue-note"], [7, 1, "cue-khaki"], [8, 2, "cue-green"]];
  return (
    <g>
      <path d={rails.join("")} className="stroke-ink" strokeWidth="3" opacity="0.8" fill="none" />
      <path d={bars.join("")} className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.7" fill="none" />
      {ac.map(([r, c], i) => {
        const x = OUR.x + c * colW + colW - 46;
        const y = OUR.top + 56 + r * 90 + 16;
        return (
          <g key={i}>
            <rect x={x} y={y} width="34" height="28" rx="3" className="fill-wall-lit" />
            <circle cx={x + 17} cy={y + 14} r="9" className="fill-ink" opacity="0.75" />
          </g>
        );
      })}
      {watchers.map(([r, c], i) => {
        const x = OUR.x + c * colW + colW * 0.5;
        const y = OUR.top + 56 + r * 90 + 52;
        return (
          <g key={`w${i}`}>
            <g className="fill-ink" opacity="0.88">
              <circle cx={x} cy={y - 18} r="6.5" />
              <path d={`M${x - 11} ${y}C${x - 11} ${y - 10} ${x - 6} ${y - 12} ${x} ${y - 12}C${x + 6} ${y - 12} ${x + 11} ${y - 10} ${x + 11} ${y}Z`} />
            </g>
            {i ? null : <path className="cue-dupatta" d={`M${x - 8} ${y - 9}C${x - 2} ${y - 4} ${x + 4} ${y - 4} ${x + 9} ${y - 10}L${x + 9} ${y}H${x - 8}Z`} opacity="0.9" />}
          </g>
        );
      })}
      {plants.map(([r, c], i) => {
        const x = OUR.x + c * colW + colW - 36;
        const y = OUR.top + 56 + r * 90 + 52;
        return (
          <g key={`p${i}`}>
            <path d={`M${x - 7} ${y}l2 -9h10l2 9Z`} className="fill-accent" />
            <path d={blob([[x - 9, y - 12], [x - 3, y - 22], [x + 4, y - 20], [x + 10, y - 12], [x + 2, y - 8]])} className="cue-green" />
          </g>
        );
      })}
      {laundry.map(([r, c, cls], i) => {
        const x = OUR.x + c * colW + 22;
        const y = OUR.top + 56 + r * 90 + 53;
        return <path key={i} d={wobblePoly([[x, y], [x + 22, y], [x + 24, y + 30], [x + 2, y + 32]], 90 + i, 1)} className={cls} opacity="0.95" />;
      })}
    </g>
  );
}

/** Everything that is a building: the two neighbours, ours, the dark gaps, rooftops and their props. */
export function Buildings({ low }: { low?: boolean }) {
  return (
    <g data-buildings>
      {/* neighbours: the left one taller, the right one lit by the low sun */}
      <Body x={-560} w={1100} top={LEFT_TOP} cls="fill-wall-dark" seed={11} cols={9} />
      <Body x={962} w={1200} top={RIGHT_TOP} cls="fill-wall-lit" seed={21} cols={10} winRatio={0.46} />
      {/* the gaps between roofs: shouting distance, no more */}
      <rect x="538" y="760" width="26" height="1040" className="fill-ink" opacity="0.5" />
      <rect x="948" y="780" width="20" height="1020" className="fill-ink" opacity="0.5" />
      <Body x={OUR.x} w={OUR.w} top={OUR.top} cls="fill-wall" seed={31} cols={3} />
      <OurFacade />
      {/* mildew streaks under every slab */}
      <g className="fill-ink" opacity="0.13">
        {Array.from({ length: 8 }, (_, r) => {
          const rnd = rng(500 + r);
          const sx = OUR.x + 30 + rnd() * 330;
          const y = OUR.top + 56 + r * 90 + 82;
          return <path key={r} d={blob([[sx, y], [sx + 4, y + 3], [sx + 5, y + 30 + rnd() * 24], [sx, y + 36 + rnd() * 20], [sx - 3, y + 16]])} />;
        })}
      </g>
      {low ? null : (
        <g className="fill-ink" opacity="0.12">
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={wobbleRect(-480 + i * 118, RIGHT_TOP + 200 + (i % 3) * 190, 8, 60, 600 + i, 1)} />
          ))}
        </g>
      )}
    </g>
  );
}

/** Roof furniture of the three roofs. Parapets are drawn last so they cover the feet of everyone behind them. */
export function RoofProps({ low }: { low?: boolean }) {
  return (
    <g data-roofs>
      {/* left roof: tanks, a head-room, a line of saris */}
      <g>
        <Tank x={40} y={LEFT_TOP} w={78} h={64} tone="fill-ink" seed={5} stand={16} />
        <Tank x={132} y={LEFT_TOP} w={66} h={52} tone="fill-tarp-lit" seed={6} />
        <Tank x={206} y={LEFT_TOP} w={58} h={48} tone="fill-wall-lit" seed={7} />
        <HeadRoom x={280} y={LEFT_TOP} w={74} h={112} seed={8} />
        <Dish x={470} y={LEFT_TOP} k={1.1} flip />
        <Clothesline
          x1={410}
          x2={534}
          y={LEFT_TOP - 130}
          seed={140}
          base={LEFT_TOP}
          items={[
            { dx: 10, w: 40, h: 120, cls: "cue-khaki" },
            { dx: 64, w: 36, h: 96, fill: "url(#lungi-check)" },
            { dx: 96, w: 30, h: 70, cls: "cue-cap" },
          ]}
        />
      </g>
      {/* right roof: a crowd of tanks, a dish, a long line of washing */}
      <g>
        <Dish x={1040} y={RIGHT_TOP} k={1.15} />
        <Tank x={1090} y={RIGHT_TOP} w={84} h={70} tone="fill-ink" seed={9} stand={16} />
        <Tank x={1188} y={RIGHT_TOP} w={70} h={56} tone="fill-wall-dark" seed={10} />
        <Tank x={1272} y={RIGHT_TOP} w={62} h={50} tone="fill-tarp-lit" seed={12} />
        <HeadRoom x={1360} y={RIGHT_TOP} w={80} h={116} seed={13} tone="fill-wall" />
        <Tank x={1368} y={RIGHT_TOP - 116} w={60} h={44} tone="fill-wall-lit" seed={14} />
        {low ? null : (
          <Clothesline
            x1={1470}
            x2={1590}
            y={RIGHT_TOP - 120}
            seed={160}
            base={RIGHT_TOP}
            items={[
              { dx: 10, w: 38, h: 112, cls: "cue-dupatta" },
              { dx: 60, w: 34, h: 70, cls: "cue-uniform" },
            ]}
          />
        )}
      </g>
      {/* our roof */}
      <g>
        <HeadRoom x={DOOR.x + 6} y={OUR.top} w={58} h={100} seed={15} />
        <Tank x={DOOR.x + 12} y={OUR.top - 100} w={46} h={42} tone="fill-wall-lit" seed={16} stand={10} />
        <Dish x={716} y={OUR.top} k={0.9} />
        <Chair x={724} y={OUR.top} />
        <Coop at={COOP_AT} />
        <Clothesline
          x1={698}
          x2={874}
          y={514}
          seed={120}
          items={[
            { dx: 10, w: 44, h: 168, cls: "cue-dupatta" },
            { dx: 62, w: 30, h: 64, cls: "cue-uniform" },
            { dx: 124, w: 40, h: 146, cls: "cue-cap" },
          ]}
        />
        {/* a wash tub and a bucket at the mother's feet */}
        <path d={blob([[780, OUR.top - 16], [806, OUR.top - 22], [832, OUR.top - 16], [826, OUR.top], [786, OUR.top]])} className="fill-tarp-lit" />
        <path d={wobbleRect(836, OUR.top - 22, 18, 22, 17, 0.6)} className="fill-accent" />
      </g>
    </g>
  );
}

/** Low walls along each roof's front: drawn AFTER the cast so they hide the shins of everyone standing behind them. */
export function Parapets() {
  return (
    <g data-parapets>
      <path d={wobbleRect(-560, LEFT_TOP, 1100, 22, 41, 1.2)} className="fill-wall-dark" />
      <path d={wobbleRect(OUR.x - 6, OUR.top, OUR.w + 12, 50, 42, 1.4)} className="fill-wall" />
      <path d={wobbleRect(OUR.x - 8, OUR.top - 2, OUR.w + 16, 10, 43, 1)} className="fill-wall-lit" />
      <rect x={OUR.x} y={OUR.top + 8} width={OUR.w} height="40" fill="url(#riso-speck)" opacity="0.35" />
      <path d={wobbleRect(962, RIGHT_TOP, 1200, 22, 44, 1.2)} className="fill-wall" />
    </g>
  );
}

// ---- the lane --------------------------------------------------------------------------------

/** The ground floor under the roof (door under the stair hatch, shutters either side), the pavement and the road. */
export function LaneGround() {
  const slats = (x: number, w: number, y: number, h: number) => {
    let d = "";
    for (let yy = y + 6; yy < y + h; yy += 7) d += `M${x + 3} ${yy}H${x + w - 3}`;
    return d;
  };
  return (
    <g data-lane>
      {/* shop shutters, corrugated: left of the door and in the neighbours */}
      <g>
        <path d={wobbleRect(584, 1664, 270, 76, 51, 1)} className="fill-wall-dark" />
        <path d={slats(584, 270, 1664, 76)} className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.3" fill="none" />
        <path d={wobbleRect(360, 1660, 170, 80, 52, 1)} className="fill-wall" />
        <path d={slats(360, 170, 1660, 80)} className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.3" fill="none" />
        <path d={wobbleRect(120, 1660, 200, 80, 53, 1)} className="fill-room" />
      </g>
      {/* the stair door: a dark opening and an open iron gate */}
      <g data-door>
        <path d={wobbleRect(DOOR.x - 4, 1658, DOOR.w + 8, 84, 54, 1)} className="fill-wall-dark" />
        <rect x={DOOR.x} y="1664" width={DOOR.w} height="76" className="fill-ink" opacity="0.92" />
        <path d={`M${DOOR.x - 8} 1664L${DOOR.x - 22} 1672V1740M${DOOR.x - 14} 1668V1740`} className="stroke-ink" strokeWidth={STROKE.line} fill="none" opacity="0.8" />
      </g>
      {/* pavement and road, kerb line, specks */}
      <rect x="-600" y={LANE_Y} width="2800" height="130" className="fill-road" />
      <rect x="-600" y={LANE_Y} width="2800" height="14" className="fill-wall-lit" opacity="0.7" />
      <rect x="-600" y={LANE_Y} width="2800" height="4" className="fill-ink" opacity="0.4" />
      <rect x="-600" y={LANE_Y + 14} width="2800" height="130" fill="url(#riso-speck)" opacity="0.5" />
      <path d={`M-200 ${LANE_Y + 52}h90M60 ${LANE_Y + 52}h90M320 ${LANE_Y + 52}h90M1500 ${LANE_Y + 52}h90`} className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.3" fill="none" />
    </g>
  );
}

const WIRE_N = 7;
/** y of wire `i` at x, for the span the kite snags on (matches the quadratic drawn below). */
export function wireY(x: number, i = 0) {
  const [a, b, sag] = [[640, 1380 + i * 5], [1460, 1390 + i * 5], 60 + i * 5] as const;
  const t = (x - a[0]) / (b[0] - a[0]);
  return (1 - t) ** 2 * a[1] + 2 * t * (1 - t) * (Math.max(a[1], b[1]) + 2 * sag) + t * t * b[1];
}

/** A utility pole in the lane with the thicket of black wires every Dhaka street has. The kite lands on it. */
export function LanePole({ low }: { low?: boolean }) {
  const rnd = rng(90);
  const n = low ? 4 : WIRE_N;
  return (
    <g data-pole>
      <rect x={POLE_X - 8} y="1352" width="16" height={LANE_Y - 1352} className="fill-wall-dark" />
      <rect x={POLE_X - 48} y="1372" width="96" height="9" className="fill-wood" />
      <rect x={POLE_X - 38} y="1390" width="76" height="7" className="fill-wood" />
      <g className="fill-ink">
        <rect x={POLE_X + 10} y="1432" width="30" height="40" rx="3" opacity="0.85" />
        <path d={`M${POLE_X - 44} 1372v-8M${POLE_X - 16} 1372v-8M${POLE_X + 16} 1372v-8M${POLE_X + 44} 1372v-8`} className="stroke-ink" strokeWidth="5" fill="none" />
      </g>
      <g fill="none" className="stroke-ink" strokeWidth={STROKE.hair} vectorEffect="non-scaling-stroke">
        {Array.from({ length: n }, (_, i) => {
          const a: V2 = [640, 1380 + i * 5];
          const b: V2 = [1460, 1390 + i * 5 + rnd() * 6];
          const c: V2 = [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + 2 * (60 + i * 5)];
          return <path key={i} d={`M${a[0]} ${a[1]}Q${c[0]} ${r1(c[1])} ${b[0]} ${b[1]}`} vectorEffect="non-scaling-stroke" />;
        })}
        {Array.from({ length: low ? 3 : 5 }, (_, i) => (
          <path key={`l${i}`} d={`M${POLE_X - 44} ${1378 + i * 6}Q${POLE_X - 280} ${1460 + i * 8} -300 ${1370 + i * 10}`} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </g>
  );
}

/** A glimpse of the tong from Scene 1: the same faded blue tarp on bamboo, a counter, a kettle, the bananas. */
export function TongGlimpse() {
  return (
    <g data-tong>
      <path d={wobbleRect(1040, 1590, 330, 150, 81, 1)} className="fill-room" />
      <path d={`M1056 1590V${LANE_Y}M1356 1590V${LANE_Y}`} className="stroke-wood" strokeWidth="9" fill="none" />
      <path d={wobbleRect(1050, 1690, 310, 14, 82, 0.8)} className="fill-wood" />
      <g>
        <path d={wobblePoly([[1030, 1568], [1384, 1568], [1396, 1612], [1018, 1612]], 83, 1.2)} className="fill-tarp" />
        <path d={wobblePoly([[1030, 1568], [1200, 1568], [1190, 1612], [1018, 1612]], 84, 1)} className="fill-tarp-lit" opacity="0.7" />
        <path d="M1018 1612q14 16 28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0" className="fill-tarp" />
      </g>
      <path d="M1130 1690v-26h26v26M1136 1664q-6 -14 4 -14h12q10 0 4 14" className="fill-ink" opacity="0.85" />
      <path d="M1290 1612q8 24 4 46M1300 1612q8 20 8 38" className="banana" fill="none" strokeWidth="8" strokeLinecap="round" />
    </g>
  );
}

// ---- kites ------------------------------------------------------------------------------------

/** A two-tone diamond kite, centred on its own origin, with a tail of paper bows. `ink` outline keeps it on the gold sky. */
export function Kite({ a, b, k = 1, tail = true }: { a: string; b: string; k?: number; tail?: boolean }) {
  return (
    <g transform={k === 1 ? undefined : `scale(${k})`}>
      <path d="M0 -36L-26 -6L0 34Z" className={a} />
      <path d="M0 -36L26 -6L0 34Z" className={b} />
      <path d="M0 -36L26 -6L0 34L-26 -6Z" fill="none" className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.75" strokeLinejoin="round" />
      <path d="M0 -36V34M-26 -6H26" className="stroke-paper" strokeWidth="1.4" opacity="0.85" fill="none" />
      {tail ? (
        <g className="loop rf-tail">
          <path d="M0 34C8 52 -8 66 2 84C10 100 -6 112 2 128" className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.7" fill="none" />
          <path d="M-4 60l5 -4l5 4l-5 4zM-4 92l5 -4l5 4l-5 4zM-4 122l5 -4l5 4l-5 4z" className={a} />
        </g>
      ) : null}
    </g>
  );
}

const STRING = "M0 0Q0.5 1 1 0"; // unit string: scaleX = length, scaleY = 2 x its sag (px)

/**
 * A kite on its string, built in the rotating frame of the kid's hand: the group `data-rig` rotates about the
 * hand (the scene pivots it at the local origin), `data-string` is a unit curve scaled to the length, and
 * `data-kx` pushes the kite out to the same length, so string and kite stay joined by construction.
 * `data-kr` counter-rotates so the kite stays roughly upright while the string swings.
 */
export function KiteRig({ id, hand, a, b, k = 1 }: { id: string; hand: V2; a: string; b: string; k?: number }) {
  return (
    <g transform={`translate(${r1(hand[0])} ${r1(hand[1])})`}>
      <g data-rig={id}>
        <g data-string={id}>
          <path d={STRING} fill="none" className="stroke-ink" strokeWidth="2" vectorEffect="non-scaling-stroke" opacity="0.8" />
        </g>
        <g data-kx={id}>
          <g data-kr={id}>
            <Kite a={a} b={b} k={k} />
          </g>
        </g>
      </g>
    </g>
  );
}

/** The cut kite, free: its own group (starts where the loser's kite was), with the loose string trailing below it. */
export function FreeKite({ at, a, b, trail }: { at: V2; a: string; b: string; trail: number }) {
  return (
    <g transform={`translate(${r1(at[0])} ${r1(at[1])})`}>
      <g data-free>
        <g data-free-spin>
          <path d={curve([[0, 12], [10, 12 + trail * 0.3], [-8, 12 + trail * 0.62], [6, 12 + trail]])} fill="none" className="stroke-ink" strokeWidth="2" vectorEffect="non-scaling-stroke" opacity="0.8" />
          <Kite a={a} b={b} />
        </g>
      </g>
    </g>
  );
}

/** The cut: a printed starburst where the strings part (scaled in and faded by the scene). */
export function Flash({ at }: { at: V2 }) {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const t = (i * Math.PI) / 4 + 0.2;
    return `M${r1(Math.cos(t) * 12)} ${r1(Math.sin(t) * 12)}L${r1(Math.cos(t) * (i % 2 ? 24 : 34))} ${r1(Math.sin(t) * (i % 2 ? 24 : 34))}`;
  });
  return (
    <g transform={`translate(${r1(at[0])} ${r1(at[1])})`}>
      <g data-flash>
        <path d={rays.join("")} className="stroke-ink" strokeWidth={STROKE.line} strokeLinecap="round" fill="none" />
        <circle r="7" className="fill-accent" />
      </g>
    </g>
  );
}

/** Far kites with no one in frame: tiny silhouettes on hairline strings, bobbing on their own (CSS loop). */
export function FarKites({ low }: { low?: boolean }) {
  const kites: readonly (readonly [number, number, number, number])[] = [[1170, 250, 1230, 700], [1330, 170, 1420, 690], [470, 430, 420, 700], [200, 470, 150, 700], [1480, 330, 1540, 700]];
  return (
    <g data-farkites>
      {(low ? kites.slice(0, 3) : kites).map(([x, y, hx, hy], i) => (
        <g key={i}>
          <path d={`M${hx} ${hy}Q${(x + hx) / 2 + 12} ${(y + hy) / 2} ${x} ${y + 14}`} className="stroke-ink" strokeWidth={STROKE.hair} vectorEffect="non-scaling-stroke" fill="none" opacity="0.35" />
          <g transform={`translate(${x} ${y})`}>
            <g className={`loop rf-bob-${i % 2 ? "a" : "b"}`}>
              <Kite a={i % 2 ? "fill-ink" : "fill-wall-dark"} b={i % 3 ? "fill-wall-dark" : "fill-ink"} k={0.5} tail={false} />
            </g>
          </g>
        </g>
      ))}
    </g>
  );
}

/** Dust kicked up by running heels, drawn behind a figure that runs toward -x (flip) or +x. */
export function Dust({ x, y, flip }: { x: number; y: number; flip?: boolean }) {
  const s = flip ? -1 : 1;
  return (
    <g className="fill-wall-lit" opacity="0.7">
      <path d={blob([[x - 10 * s, y - 2], [x - 22 * s, y - 14], [x - 36 * s, y - 8], [x - 30 * s, y]])} />
      <path d={blob([[x - 34 * s, y - 2], [x - 46 * s, y - 10], [x - 56 * s, y - 2]])} />
    </g>
  );
}
