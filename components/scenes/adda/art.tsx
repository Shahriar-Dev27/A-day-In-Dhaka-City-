import { STROKE, blob, curve, r1, rng, wobblePoly, wobbleRect, type V2 } from "../tong/geometry";
import { Commuter } from "../jam/figures";
import { Vendor } from "../tong/cast";

/*
  Scene 7 evening pieces. Same print language as the tong set: flat tokened fills, hand-cut wobble edges,
  halftone for light and shade, STROKE weights, no filters. Every colour is a class from adda.css or the
  shared utilities. Data hooks the scene scrubs: data-light=<kind>, data-fairy, data-mosq, data-neon,
  data-inset, data-strike, data-veh, data-trail, data-beam.
*/

const Wob = (pts: readonly V2[], seed: number, amp = 1.3) => wobblePoly(pts, seed, amp);

// ---- lights -------------------------------------------------------------------------------------

/** A tube light under the awning: the white-green fluorescent that Dhaka tongs mix with tungsten. */
export function TubeLight({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g data-light="tube">
      <path d={Wob([[x + 6, y + 8], [x + w - 6, y + 8], [x + w + 26, y + 118], [x - 26, y + 118]], 301, 1)} className="a-tube" opacity="0.13" />
      <path d={Wob([[x + 6, y + 8], [x + w - 6, y + 8], [x + w + 26, y + 118], [x - 26, y + 118]], 301, 1)} fill="url(#riso-dots)" opacity="0.1" />
      <path d={`M${x + 8} ${y - 8}V${y - 2}M${x + w - 8} ${y - 8}V${y - 2}`} className="stroke-ink" strokeWidth={STROKE.hair} />
      <rect x={x} y={y - 2} width={w} height="12" rx="2" className="fill-ink" />
      <rect x={x + 3} y={y + 1} width={w - 6} height="6" rx="3" className="a-tube" />
    </g>
  );
}

/** Warm light on the awning's underside: amber halftone dots over the lower half only, so the tarp stays blue. */
export function TarpGlow() {
  const d = wobblePoly([[606, 430], [1038, 430], [1052, 464], [592, 464]], 71, 1.2);
  return (
    <g data-light="tarp" pointerEvents="none">
      <path d={d} fill="url(#riso-glow)" opacity="0.55" />
    </g>
  );
}

/** The booth's own light: a warm wash on the back wall (so Mama's silhouette pops) and a white-green tube wash on its left. */
export function BoothLight() {
  return (
    <g data-light="booth" pointerEvents="none">
      <path d={wobbleRect(650, 496, 340, 236, 302, 1.2)} className="fill-glow" opacity="0.26" />
      <path d={wobbleRect(650, 496, 120, 236, 303, 1.2)} className="a-tube" opacity="0.1" />
      <rect x="650" y="496" width="340" height="236" fill="url(#riso-glow)" opacity="0.18" />
    </g>
  );
}

const FAIRY_COLOURS = ["fill-glow", "a-neon", "a-tube", "fill-glow", "fill-glow"] as const;

/** Strings of fairy lights: along the awning hem, to the left pole, to the right pole. */
export function FairyLights({ low }: { low: boolean }) {
  const strings: { a: V2; b: V2; sag: number; n: number }[] = [
    { a: [600, 484], b: [1044, 484], sag: 10, n: 13 },
    { a: [470, 380], b: [596, 470], sag: 26, n: 6 },
    { a: [1048, 470], b: [1376, 386], sag: 38, n: 9 },
  ];
  return (
    <g data-fairy-group>
      {strings.map((s, k) => {
        const pts: V2[] = Array.from({ length: s.n }, (_, i) => {
          const t = (i + 0.5) / s.n;
          return [s.a[0] + (s.b[0] - s.a[0]) * t, s.a[1] + (s.b[1] - s.a[1]) * t + Math.sin(t * Math.PI) * s.sag] as const;
        });
        return (
          <g key={k}>
            <path d={curve([s.a, [(s.a[0] + s.b[0]) / 2, (s.a[1] + s.b[1]) / 2 + s.sag], s.b])} fill="none" className="stroke-ink" strokeWidth={STROKE.hair} vectorEffect="non-scaling-stroke" opacity="0.8" />
            {pts.map(([x, y], i) => (
              <g key={i} data-fairy>
                {low ? null : <circle cx={x} cy={y + 5} r="9" className="fill-glow" opacity="0.22" />}
                <circle cx={x} cy={y + 5} r="4.2" className={FAIRY_COLOURS[(i + k) % FAIRY_COLOURS.length]} />
              </g>
            ))}
          </g>
        );
      })}
    </g>
  );
}

/** One magenta tube sign on the right-hand shop: a cup with two steam curls. Pictogram, no lettering. */
export function NeonCup({ x, y }: { x: number; y: number }) {
  return (
    <g data-neon transform={`translate(${x} ${y})`}>
      <circle cx="40" cy="40" r="64" className="a-neon-bg" opacity="0.14" />
      <g fill="none" className="a-neon-s" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 38H66V56C66 70 56 76 40 76C24 76 14 70 14 56Z" />
        <path d="M66 44C80 44 82 62 66 64" />
        <path d="M6 82H74" />
        <path d="M30 28C24 20 36 16 30 6M48 28C42 20 54 16 48 6" strokeWidth="4" />
      </g>
    </g>
  );
}

/** Mosquitoes orbiting the bulb: tilted ellipses, each dot on its own CSS loop (paused off-screen). */
export function Mosquitoes({ cx, cy }: { cx: number; cy: number }) {
  const rnd = rng(55);
  const dots = Array.from({ length: 11 }, (_, i) => ({ r: 22 + (i % 5) * 9 + rnd() * 6, tilt: -60 + i * 17, sq: 0.45 + (i % 3) * 0.15, t: 1.7 + rnd() * 1.9, d: -rnd() * 3, rev: i % 3 === 0, s: 2.2 + rnd() * 1.1 }));
  return (
    <g data-mosq transform={`translate(${cx} ${cy})`}>
      {dots.map((o, i) => (
        <g key={i} transform={`rotate(${r1(o.tilt)}) scale(1 ${r1(o.sq)})`}>
          <g className="mosq loop" style={{ animationDuration: `${r1(o.t)}s`, animationDelay: `${r1(o.d)}s`, animationDirection: o.rev ? "reverse" : "normal" }}>
            <circle cx={o.r} cy="0" r={r1(o.s)} className="fill-ink" />
            <path d={`M${r1(o.r)} 0l-6 -3.4M${r1(o.r)} 0l-6 3.4`} className="stroke-ink" strokeWidth="1.4" opacity="0.8" />
          </g>
        </g>
      ))}
    </g>
  );
}

// ---- the fuchka cart ------------------------------------------------------------------------------

const WHEEL = (cx: number, cy: number) => (
  <g>
    <circle cx={cx} cy={cy} r="20" fill="none" className="stroke-ink" strokeWidth="5" />
    <path d={`M${cx - 18} ${cy}h36M${cx} ${cy - 18}v36M${cx - 13} ${cy - 13}l26 26M${cx + 13} ${cy - 13}l-26 26`} className="stroke-wall-lit" strokeWidth="1.4" opacity="0.7" />
  </g>
);

/**
 * Fuchka cart, origin = ground at its left end, 150 wide. A glass case of puffed shells, a bowl of peas
 * and a tall jar of tamarind water that glows (data-light="jar"), a lamp on a bamboo pole (data-light="cart").
 */
export function FuchkaCart({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const shells = Array.from({ length: 10 }, (_, i) => [24 + (i % 5) * 15, -112 - Math.floor(i / 5) * 15 + (i % 2) * 2] as const);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* lamp pole and lamp */}
      <path d="M10 -70V-262" className="stroke-wood" strokeWidth="6" />
      <path d="M10 -262h22" className="stroke-wood" strokeWidth="4" />
      <g data-light="cart">
        <circle cx="32" cy="-250" r="64" fill="url(#riso-glow)" opacity="0.4" />
        <circle cx="32" cy="-250" r="34" className="fill-glow" opacity="0.2" />
        <rect x="28" y="-262" width="8" height="8" className="fill-ink" />
        <circle cx="32" cy="-246" r="9" className="fill-glow" />
      </g>
      {/* body */}
      <path d={wobbleRect(4, -90, 144, 56, 311, 1.4)} className="fill-wood" />
      <rect x="4" y="-90" width="144" height="56" fill="url(#riso-plank)" opacity="0.5" />
      <path d={wobbleRect(4, -90, 144, 12, 312, 0.8)} className="a-rick" />
      <path d={wobbleRect(10, -74, 132, 6, 313, 0.6)} className="fill-glow" opacity="0.7" />
      <path d="M28 -34L20 0M124 -34l8 34" className="stroke-wood" strokeWidth="6" />
      {WHEEL(34, -22)}
      {WHEEL(122, -22)}
      {/* glass case with the shells */}
      <rect x="12" y="-150" width="78" height="60" fill="none" className="stroke-ink" strokeWidth={STROKE.line} />
      <rect x="15" y="-147" width="72" height="54" className="fill-wall-lit" opacity="0.3" />
      {shells.map(([sx, sy], i) => (
        <circle key={i} cx={sx} cy={sy} r="6.5" className="fill-glow" opacity="0.85" />
      ))}
      <path d="M20 -146l22 30" className="stroke-paper" strokeWidth="2" opacity="0.45" fill="none" />
      {/* bowl of peas and a steel plate stack */}
      <path d={blob([[94, -92], [98, -104], [112, -108], [124, -104], [128, -92]])} className="fill-wall-lit" />
      <path d="M100 -104q12 -10 24 0" className="fill-wood" />
      {/* the jar: glass, tamarind water lit from within, a halo */}
      <g data-light="jar">
        <circle cx="136" cy="-134" r="58" fill="url(#riso-glow)" opacity="0.45" />
        <circle cx="136" cy="-134" r="30" className="fill-glow" opacity="0.22" />
        <path d={wobblePoly([[126, -170], [146, -170], [150, -94], [122, -94]], 314, 0.8)} className="a-tamarind" />
        <path d="M126 -150h24" className="stroke-ink" strokeWidth="1.6" opacity="0.4" />
        <rect x="122" y="-178" width="28" height="10" rx="3" className="fill-ink" />
        <path d="M130 -164L128 -100" className="stroke-paper" strokeWidth="2.4" opacity="0.6" fill="none" />
      </g>
    </g>
  );
}

/** Vendor stands behind the cart (draw BEFORE the cart so its lungi is hidden). */
export function FuchkaVendor({ x, y }: { x: number; y: number }) {
  return <Vendor kind="fuchka" at={[x, y]} />;
}

// ---- the notebook close detail -------------------------------------------------------------------

function scribble(seed: number, x0: number, x1: number, y: number, amp = 4): string {
  const rnd = rng(seed);
  const n = 7;
  return curve(Array.from({ length: n }, (_, i) => [x0 + ((x1 - x0) * i) / (n - 1), y + (rnd() - 0.5) * 2 * amp] as const));
}

/**
 * The open page of the red notebook, magnified: a printed inset anchored at the notebook (868, 668). It is
 * drawn around a local origin at the notebook so the scene scales it from there (bbox 100% 100%).
 * It sits above the crowd on the awning, a long tail down to the notebook. Rows of scribbled entries (no words); row 3 is the morning's line: a magenta dot (her dupatta) and a
 * folded note mark. data-strike is the pencil line the scene draws through it.
 */
export function NotebookInset() {
  const rows = [-166, -142, -118, -94, -70, -46];
  return (
    <g transform="translate(868 668)">
      <g data-inset>
        {/* the tail: from the notebook up to the page, like a printed callout */}
        <path d="M-38 -101L0 0L-9 -101Z" className="cue-notebook" />
        <g transform="translate(0 -85) scale(0.88)">
          <path d={wobbleRect(-246, -196, 250, 182, 91, 1.6)} className="fill-accent" opacity="0.55" />
          <path d={wobbleRect(-250, -200, 250, 182, 92, 1.6)} className="cue-notebook" />
          <path d={wobbleRect(-218, -190, 208, 164, 93, 1.2)} className="fill-paper" />
          <rect x="-218" y="-190" width="208" height="164" fill="url(#riso-speck)" opacity="0.4" />
          <path d="M-226 -176v8M-226 -146v8M-226 -116v8M-226 -86v8M-226 -56v8" className="stroke-paper" strokeWidth="3" strokeLinecap="round" opacity="0.8" fill="none" />
          <path d={rows.map((y) => `M-208 ${y + 10}H-18`).join("")} className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.28" fill="none" />
          {rows.map((y, i) => (
            <g key={y} className="stroke-ink" fill="none" strokeLinecap="round" strokeWidth="2" opacity={i === 3 ? 0.85 : 0.6}>
              <path d={scribble(920 + i, -196, -112 - (i % 3) * 14, y + 4)} />
              <path d={scribble(940 + i, -86, -34 - (i % 2) * 10, y + 5, 3)} />
            </g>
          ))}
          <circle cx="-204" cy="-106" r="4.5" className="a-rick" />
          <rect x="-26" y="-112" width="16" height="9" rx="1" className="cue-note" transform="rotate(-8 -18 -108)" />
          <path data-strike d="M-206 -97C-170 -103 -120 -92 -76 -99C-52 -103 -34 -97 -16 -101" fill="none" className="a-strike" strokeWidth="5.5" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

// ---- the homeward jam, a lit strip in the foreground -----------------------------------------------

function Beam({ x, y, len, h }: { x: number; y: number; len: number; h: number }) {
  const d = `M${x} ${y - 5}L${x + len} ${y - h}V${y + h}L${x} ${y + 5}Z`;
  return (
    <g data-beam>
      <path d={d} className="fill-glow" opacity="0.2" />
      <path d={d} fill="url(#riso-glow)" opacity="0.35" />
      <circle cx={x} cy={y} r="8" className="fill-glow" />
    </g>
  );
}

function BusTop({ x, seed }: { x: number; seed: number }) {
  return (
    <g data-veh>
      <path d={wobbleRect(x + 4, 884, 336, 140, seed + 1, 1.2)} className="fill-accent" opacity="0.5" />
      <path d={wobbleRect(x, 880, 336, 144, seed, 1.4)} className="fill-ink" />
      <rect x={x + 14} y="893" width="306" height="30" className="fill-glow" opacity="0.9" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={blob([[x + 30 + i * 33, 923], [x + 31 + i * 33, 909], [x + 38 + i * 33, 903], [x + 46 + i * 33, 909], [x + 47 + i * 33, 923]])} className="fill-ink" />
      ))}
      <path d={Array.from({ length: 8 }, (_, i) => `M${x + 14 + i * 38} 893v30`).join("")} className="stroke-ink" strokeWidth="3" />
      <path d={wobbleRect(x + 14, 934, 306, 6, seed + 2, 0.6)} className="fill-wall-dark" />
      <path d={wobbleRect(x + 70, 946, 150, 22, seed + 3, 0.8)} className="fill-paper" opacity="0.8" />
      <path d={`M${x + 80} 957h130`} className="stroke-ink" strokeWidth="3" strokeDasharray="14 8" opacity="0.5" />
      <circle cx={x + 10} cy="962" r="4.5" className="a-tail" />
      <circle cx={x + 10} cy="976" r="3.5" className="a-tail" opacity="0.7" />
      <Beam x={x + 336} y={966} len={230} h={30} />
    </g>
  );
}

function RickTop({ x, seed, rider }: { x: number; seed: number; rider?: boolean }) {
  return (
    <g data-veh>
      <g transform={`translate(${x} 0)`}>
      <g transform="translate(0 996) scale(0.4)">
        <path d="M30 -166C24 -250 82 -306 138 -292C186 -280 214 -226 220 -166Z" className="fill-tarp-lit" />
        <path d="M30 -166C24 -250 82 -306 138 -292C186 -280 214 -226 220 -166" fill="none" className="stroke-ink" strokeWidth="6" />
        <path d={Wob([[14, -150], [244, -150], [256, -60], [22, -56]], seed, 2)} className="a-rick" />
        <path d={Wob([[22, -92], [248, -96], [250, -80], [24, -76]], seed + 1, 1.4)} className="fill-glow" opacity="0.85" />
        <circle cx="64" cy="-122" r="14" className="fill-glow" />
        <circle cx="136" cy="-124" r="10" className="fill-paper" />
        <circle cx="206" cy="-120" r="12" className="fill-glow" />
        {rider ? <Commuter at={[0, 0]} /> : <path d={blob([[150, -194], [158, -226], [176, -236], [194, -222], [196, -194]])} className="fill-ink" />}
        <circle cx="250" cy="-96" r="12" className="fill-glow" />
      </g>
      <Beam x={104} y={962} len={170} h={22} />
      <circle cx="-2" cy="976" r="3.6" className="a-tail" />
      </g>
    </g>
  );
}

function CngTop({ x, seed }: { x: number; seed: number }) {
  return (
    <g data-veh>
      <path d={Wob([[x, 1000], [x + 4, 910], [x + 36, 886], [x + 150, 884], [x + 196, 920], [x + 200, 1000]], seed, 1.4)} className="a-cng" />
      <path d={`M${x + 26} 896v90M${x + 56} 890v96M${x + 86} 888v98M${x + 116} 888v98M${x + 146} 890v96M${x + 8} 930h186M${x + 8} 958h186`} className="stroke-ink" strokeWidth="2.4" opacity="0.55" fill="none" />
      <path d={`M${x + 4} 934Q${x + 100} 920 ${x + 196} 934`} fill="none" className="stroke-glow" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      <circle cx={x + 6} cy="974" r="4" className="a-tail" />
      <Beam x={x + 198} y={974} len={190} h={26} />
    </g>
  );
}

/** Foreground jam: tops of a bus, rickshaws (one carries the commuter from the morning), CNGs and a bus, crawling home. */
export function HomewardJam({ low }: { low: boolean }) {
  return (
    <g data-traffic>
      <path d={wobbleRect(-500, 890, 2900, 240, 321, 1.6)} className="fill-road" />
      <rect x="-500" y="890" width="2900" height="240" fill="url(#riso-speck)" opacity="0.5" />
      <BusTop x={10} seed={331} />
      <RickTop x={380} seed={341} />
      <CngTop x={520} seed={351} />
      <RickTop x={760} seed={361} rider />
      <BusTop x={900} seed={371} />
      <CngTop x={1270} seed={381} />
      {low ? null : <RickTop x={-250} seed={391} />}
      {low ? null : <BusTop x={1480} seed={401} />}
    </g>
  );
}

/** The road's wet sheen: the stall's light pooled on the kerb side (halftone) and one stubby reflection of the jar. */
export function WetRoad() {
  return (
    <g data-wet>
      <ellipse cx="830" cy="876" rx="330" ry="14" className="fill-glow" opacity="0.12" />
      <ellipse cx="830" cy="876" rx="330" ry="14" fill="url(#riso-glow)" opacity="0.5" />
      <ellipse cx="672" cy="882" rx="40" ry="6" fill="url(#riso-glow)" opacity="0.6" />
      <rect x="-400" y="868" width="2400" height="40" fill="url(#riso-dots)" opacity="0.08" />
    </g>
  );
}

/** Light smears for the low tier and reduced motion (the WebGL shader replaces them on the high tier). */
export function Streaks() {
  const rows: [number, number, number, string][] = [[300, 906, 560, "a-neon"], [820, 922, 420, "fill-glow"], [1180, 936, 520, "a-tube"], [120, 944, 380, "fill-glow"]];
  return (
    <g data-streaks>
      {rows.map(([x, y, w, c], i) => (
        <rect key={i} data-trail x={x} y={y} width={w} height="4" rx="2" className={c} opacity="0.7" />
      ))}
    </g>
  );
}
