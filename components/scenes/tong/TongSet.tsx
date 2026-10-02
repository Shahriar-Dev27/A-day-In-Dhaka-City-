import { useId, type ReactNode, type SVGProps } from "react";
import { STROKE, blob, curve, r1, ribbon, rng, wobblePoly, wobbleRect, type V2 } from "./geometry";

/*
  THE TONG SET (v2 plan 4.1): drawn once, relit per scene by the palette tokens (fill-wall, fill-tarp,
  fill-ink, fill-glow ... all read CSS vars the sky timeline rewrites) and by `TongState`. Nothing here
  is redrawn per scene. 1600x900 viewBox, bottom-anchored; the stall sits on TONG_ORIGIN (820, 860) and
  everything a 390px-wide screen must show (Mama, the notebook, the bulb, every speaker) lives inside
  SAFE_COLUMN x 600..1000. Context (neighbours, far minarets, block edges) may crop on mobile.

  Layers back to front: TongBackdrop (far skyline, minarets, neighbours, the six-storey block, ground)
  > TongWires > TongStall (booth, awning, counter) with a slot for actors behind the counter.
  Print language: flat tokened fills, hand-cut wobble edges, halftone dots for shade, a few specks of
  paper grain on the big flats, and a second offset plate behind the hero shapes.
  Animation hooks (data-*): bulb, halo, flame, steam, notebook, notebook-pages, notebook-line, shutter,
  fan, window=i, azaan=i, minaret, wires, banana, sign.
*/

export interface TongState {
  shutter: "down" | "half" | "up";
  bulb: "off" | "warm" | "on";
  litWindows: readonly number[]; // 0..17 (row * 3 + col, row 0 = top floor)
  fan?: boolean;
  steam?: boolean;
  signLit?: boolean;
  fairyLights?: boolean;
  notebook?: "closed" | "open";
}

type G = SVGProps<SVGGElement>;

// ---- block geometry ---------------------------------------------------------------------------
const BX = 690; // block left
const BW = 500;
const BTOP = 300; // roofline
const FLOOR = 94; // upper floors
const BAY = BW / 3;
const GROUND = 860;
const rowY = (row: number) => BTOP + row * FLOOR; // row 0 = top floor ... row 5 = ground floor (shorter)

// Distant skyline: [x, w, top, tank]
const FAR: readonly (readonly [number, number, number, boolean])[] = [
  [-300, 140, 580, false], [-160, 130, 620, true], [-40, 130, 600, false], [80, 90, 540, true], [160, 120, 610, false], [270, 80, 560, false], [340, 140, 620, true],
  [1180, 110, 560, false], [1280, 90, 600, true], [1360, 140, 540, false], [1490, 130, 590, false], [1620, 140, 560, true], [1760, 120, 610, false],
];

function Minaret({ cx, top, k, i }: { cx: number; top: number; k: number; i: number }) {
  const t = (n: number) => r1(top + n * k);
  const w = (n: number) => r1(n * k);
  return (
    <g data-minaret={i} className="fill-minaret">
      <path d={`M${r1(cx - w(7))} ${GROUND}V${t(60)}H${r1(cx + w(7))}V${GROUND}Z`} />
      <path d={`M${r1(cx - w(5.5))} ${t(58)}V${t(16)}H${r1(cx + w(5.5))}V${t(58)}Z`} />
      <path d={`M${r1(cx - w(14))} ${t(54)}H${r1(cx + w(14))}V${t(60)}H${r1(cx - w(14))}Z`} />
      <path d={`M${r1(cx - w(9))} ${t(16)}C${r1(cx - w(9))} ${t(2)} ${r1(cx - w(2))} ${t(0)} ${cx} ${t(-14)}C${r1(cx + w(2))} ${t(0)} ${r1(cx + w(9))} ${t(2)} ${r1(cx + w(9))} ${t(16)}Z`} />
      <path d={`M${r1(cx - w(1))} ${t(-14)}V${t(-26)}h${w(2)}V${t(-14)}Z`} />
      {/* the loudspeaker cluster: four horns around the shaft, the Dhaka azaan */}
      <path d={`M${r1(cx - w(5))} ${t(34)}L${r1(cx - w(17))} ${t(28)}V${t(44)}L${r1(cx - w(5))} ${t(39)}Z`} />
      <path d={`M${r1(cx + w(5))} ${t(34)}L${r1(cx + w(17))} ${t(28)}V${t(44)}L${r1(cx + w(5))} ${t(39)}Z`} />
      <path d={`M${r1(cx - w(5))} ${t(24)}L${r1(cx - w(15))} ${t(20)}V${t(30)}L${r1(cx - w(5))} ${t(28)}Z`} />
      <path d={`M${r1(cx + w(5))} ${t(24)}L${r1(cx + w(15))} ${t(20)}V${t(30)}L${r1(cx + w(5))} ${t(28)}Z`} />
    </g>
  );
}

/**
 * Three-arc sound ripples that scenes pulse (data-azaan=i), centred on the speaker cluster. Drawn around
 * a local (0,0) inside a translated wrapper, so a scene scales them with svgOrigin "0 0" set ONCE
 * (changing an svgOrigin between tweens drifts when the user scrubs back and forth).
 */
export function AzaanRings({ cx, cy, k = 1, i }: { cx: number; cy: number; k?: number; i: number }) {
  const arcs = [30, 52, 74].map((r) => {
    const rr = r * k;
    const a = rr * 0.62 + 4;
    return `M${r1(-a)} ${r1(-rr * 0.52)}A${r1(rr)} ${r1(rr)} 0 0 1 ${r1(a)} ${r1(-rr * 0.52)}`;
  });
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <g data-azaan={i} fill="none" strokeLinecap="round" className="stroke-copy" strokeWidth={STROKE.line} opacity="0">
        {arcs.map((d, n) => (
          <path key={n} d={d} vectorEffect="non-scaling-stroke" opacity={1 - n * 0.25} />
        ))}
      </g>
    </g>
  );
}

function Window({ x, y, lit, i, seed }: { x: number; y: number; lit: boolean; i: number; seed: number }) {
  return (
    <g>
      <path d={wobbleRect(x, y, 92, 44, seed, 0.9)} className="fill-ink" opacity="0.82" />
      <path d={`M${x + 46} ${y}V${y + 44}M${x} ${y + 22}H${x + 92}`} className="stroke-wall-lit" strokeWidth={STROKE.hair} opacity="0.5" fill="none" />
      <rect data-window={i} x={x + 2} y={y + 2} width="88" height="40" className="fill-glow" opacity={lit ? 0.95 : 0} />
      <path d={`M${x + 8} ${y + 40}L${x + 30} ${y + 4}M${x + 22} ${y + 40}L${x + 44} ${y + 4}`} className="stroke-wall-lit" strokeWidth="2" opacity="0.2" fill="none" />
    </g>
  );
}

function Compressor({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x + 2} ${y + 30}l-4 12M${x + 34} ${y + 30}l4 12`} className="stroke-ink" strokeWidth={STROKE.line} opacity="0.7" fill="none" />
      <rect x={x} y={y} width="36" height="30" rx="3" className="fill-wall-lit" />
      <circle cx={x + 18} cy={y + 15} r="10" className="fill-ink" opacity="0.75" />
      <path d={`M${x + 18} ${y + 7}v16M${x + 10} ${y + 15}h16`} className="stroke-wall-lit" strokeWidth="1.6" fill="none" />
    </g>
  );
}

/** Wrought-iron balcony grille: vertical bars between a top rail and the slab. */
function Grille({ x, y, w }: { x: number; y: number; w: number }) {
  const bars: string[] = [];
  for (let b = x + 5; b < x + w; b += 9) bars.push(`M${r1(b)} ${y}V${y + 24}`);
  return (
    <g fill="none" className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.75">
      <path d={bars.join("")} />
      <path d={`M${x} ${y}H${x + w}`} strokeWidth="3" />
    </g>
  );
}

const COMPRESSORS: readonly (readonly [number, number])[] = [[0, 0], [1, 2], [2, 1], [3, 0], [3, 2], [4, 1], [0, 2]];

function Block({ lit }: { lit: ReadonlySet<number> }) {
  const rows = [0, 1, 2, 3, 4, 5];
  const rnd = rng(31);
  const streaks = rows.slice(0, 5).flatMap((row) =>
    [0, 1, 2].flatMap((col) => {
      const sx = BX + col * BAY + 20 + rnd() * 120;
      return [blob([[sx, rowY(row) + 90], [sx + 4, rowY(row) + 90 + 4], [sx + 5 + rnd() * 3, rowY(row) + 120 + rnd() * 36], [sx + 1, rowY(row) + 128 + rnd() * 30], [sx - 3, rowY(row) + 112]])];
    }),
  );
  return (
    <g data-block>
      {/* main face + return wall + printed grain */}
      <path d={wobbleRect(BX, BTOP, BW, GROUND - BTOP, 5, 1.8)} className="fill-wall" />
      <path d={wobbleRect(BX + BW - 22, BTOP, 22, GROUND - BTOP, 6, 1)} className="fill-wall-dark" opacity="0.7" />
      <rect x={BX} y={BTOP} width={BW} height={GROUND - BTOP} fill="url(#riso-speck)" opacity="0.35" />
      {/* roof: parapet, stair head-room, water tank on a stand, dish */}
      <path d={wobbleRect(BX - 6, BTOP - 12, BW + 12, 14, 7, 1.2)} className="fill-wall-dark" />
      <path d={wobbleRect(BX + 330, BTOP - 46, 70, 36, 8, 1.2)} className="fill-wall-dark" />
      <rect x={BX + 350} y={BTOP - 40} width="18" height="26" className="fill-ink" opacity="0.7" />
      <g className="fill-wall-lit">
        <path d={`M${BX + 92} ${BTOP - 12}V${BTOP - 24}M${BX + 142} ${BTOP - 12}V${BTOP - 24}`} className="stroke-ink" strokeWidth={STROKE.line} />
        <rect x={BX + 84} y={BTOP - 70} width="66" height="48" rx="12" />
        <ellipse cx={BX + 117} cy={BTOP - 70} rx="33" ry="7" className="fill-wall-dark" />
        <path d={`M${BX + 84} ${BTOP - 54}h66M${BX + 84} ${BTOP - 38}h66`} className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.5" fill="none" />
      </g>
      <g className="fill-wall-lit stroke-ink" strokeWidth={STROKE.hair}>
        <path d={`M${BX + 440} ${BTOP - 12}l6 -22`} fill="none" />
        <path d={`M${BX + 424} ${BTOP - 40}a24 24 0 0 0 44 -14z`} opacity="0.9" />
      </g>
      {rows.map((row) => {
        const y = rowY(row);
        const ground = row === 5;
        return (
          <g key={row}>
            {/* floor slab line, cornice shadow */}
            <path d={wobbleRect(BX - 4, y + (ground ? 0 : 86), BW + 8, 8, 20 + row, 0.8)} className="fill-wall-dark" opacity={ground ? 0 : 0.9} />
            {[0, 1, 2].map((col) => {
              const i = row * 3 + col;
              const bx = BX + col * BAY;
              if (ground) return null;
              return (
                <g key={col}>
                  <Window x={bx + 22} y={y + 12} lit={lit.has(i)} i={i} seed={100 + i} />
                  <Grille x={bx + 12} y={y + 62} w={BAY - 24} />
                  {COMPRESSORS.some(([r, c]) => r === row && c === col) ? <Compressor x={bx + 122} y={y + 22} /> : null}
                  {row === 2 && col === 0 ? (
                    <g>
                      <path d={`M${bx + 24} ${y + 58}H${bx + 118}`} className="stroke-ink" strokeWidth={STROKE.hair} />
                      <path d={wobblePoly([[bx + 30, y + 58], [bx + 58, y + 58], [bx + 62, y + 98], [bx + 34, y + 100]], 3, 1)} className="fill-tarp-lit" />
                      <path d={wobblePoly([[bx + 66, y + 58], [bx + 92, y + 58], [bx + 94, y + 94], [bx + 68, y + 96]], 4, 1)} className="fill-accent" opacity="0.8" />
                    </g>
                  ) : null}
                </g>
              );
            })}
          </g>
        );
      })}
      {/* ground-floor shop shutters behind the stall */}
      <path d={wobbleRect(BX + 10, rowY(5) + 14, BW - 20, 86, 12, 1.2)} className="fill-wall-dark" opacity="0.85" />
      {/* monsoon mildew: dark streaks under every slab */}
      <g className="fill-ink" opacity="0.14">
        {streaks.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </g>
  );
}

/** Hand-painted lettering: a matra line over looped glyph shapes. Abstract, no brand, no real words. */
// Real Bangla signboard text (sign-painter face), fitted to the board with textLength.
function Lettering({ x, y, w, h, text, className }: { x: number; y: number; w: number; h: number; text: string; className: string }) {
  return (
    <text
      x={x}
      y={y + h * 0.78}
      fontSize={h * 0.92}
      textLength={w}
      lengthAdjust="spacingAndGlyphs"
      fontFamily="var(--font-chunky)"
      fontWeight={700}
      className={className}
    >
      {text}
    </text>
  );
}

export function TongBackdrop({ state, ...rest }: { state: TongState } & G) {
  const lit = new Set(state.litWindows);
  return (
    <g {...rest}>
      {/* far skyline */}
      <g className="fill-far">
        {FAR.map(([x, w, top, tank], i) => (
          <g key={x}>
            <path d={wobbleRect(x, top, w, GROUND - top, 40 + i, 1.5)} />
            {tank ? <rect x={x + w * 0.4} y={top - 20} width="22" height="20" rx="5" /> : null}
          </g>
        ))}
      </g>
      {/* minarets: two far, one behind the block's roof (inside the safe column) */}
      <Minaret cx={330} top={440} k={0.9} i={1} />
      <Minaret cx={1370} top={400} k={1} i={2} />
      <Minaret cx={960} top={212} k={1.1} i={0} />
      <AzaanRings cx={960} cy={212 + 38 * 1.1} k={1.1} i={0} />
      <AzaanRings cx={330} cy={440 + 38 * 0.9} k={0.9} i={1} />
      <AzaanRings cx={1370} cy={400 + 38} k={1} i={2} />
      {/* neighbours: a low block each side, the left one stepped */}
      <g>
        <path d={wobblePoly([[430, GROUND], [430, 560], [560, 560], [560, 520], [700, 520], [700, GROUND]], 51, 1.6)} className="fill-wall-dark" />
        <path d={wobbleRect(1180, 500, 330, GROUND - 500, 52, 1.6)} className="fill-wall-dark" />
        <path d={wobbleRect(1180, 500, 330, 10, 53, 1)} className="fill-ink" opacity="0.35" />
        {[0, 1, 2].flatMap((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={460 + c * 70} y={578 + r * 76} width="42" height="30" className="fill-ink" opacity="0.55" />))}
        {[0, 1, 2, 3].flatMap((r) => [0, 1, 2].map((c) => <rect key={`n${r}${c}`} x={1216 + c * 100} y={534 + r * 80} width="52" height="34" className="fill-ink" opacity="0.5" />))}
        {/* right neighbour's painted signboard */}
        <g data-sign>
          <rect x="1230" y="728" width="236" height="62" rx="2" className="fill-tarp" />
          <rect x="1236" y="734" width="224" height="50" fill="none" strokeWidth={STROKE.hair} className="stroke-paper" opacity="0.8" />
          <Lettering x={1250} y={742} w={196} h={34} text="মুদি দোকান" className={state.signLit ? "fill-glow" : "fill-paper"} />
        </g>
      </g>
      <Block lit={lit} />
      {/* ground: pavement and road, kerb line, a drain grate */}
      <g>
        <rect x="-400" y={GROUND} width="2400" height={900 - GROUND + 200} className="fill-road" />
        <rect x="-400" y={GROUND} width="2400" height="5" className="fill-ink" opacity="0.4" />
        <rect x="-400" y={GROUND + 5} width="2400" height="120" fill="url(#riso-speck)" opacity="0.55" />
        <path d={`M1010 ${GROUND + 22}h120M1020 ${GROUND + 22}v14M1040 ${GROUND + 22}v14M1060 ${GROUND + 22}v14M1080 ${GROUND + 22}v14M1100 ${GROUND + 22}v14M1120 ${GROUND + 22}v14`} className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.5" fill="none" />
      </g>
    </g>
  );
}

// ---- wires ------------------------------------------------------------------------------------
function Wire({ a, b, sag, w = 1 }: { a: V2; b: V2; sag: number; w?: number }) {
  const mid: V2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag];
  const q1: V2 = [a[0] + (b[0] - a[0]) * 0.28, a[1] + (b[1] - a[1]) * 0.28 + sag * 0.78];
  const q3: V2 = [a[0] + (b[0] - a[0]) * 0.72, a[1] + (b[1] - a[1]) * 0.72 + sag * 0.78];
  return <path d={curve([a, q1, mid, q3, b])} fill="none" className="stroke-ink" strokeWidth={STROKE.hair * w} vectorEffect="non-scaling-stroke" strokeLinecap="round" />;
}

export function TongWires({ low, ...rest }: { low?: boolean } & G) {
  const rnd = rng(17);
  // two sagging bundles of slightly different wires, pole to block and pole to the right pole
  const bundleA = Array.from({ length: low ? 5 : 9 }, (_, i) => ({ a: [478, 372 + i * 6.5] as V2, b: [BX + BW + 10, 318 + i * 9 + rnd() * 6] as V2, sag: 30 + rnd() * 26 }));
  const bundleB = Array.from({ length: low ? 4 : 7 }, (_, i) => ({ a: [462, 408 + i * 5] as V2, b: [1378, 380 + i * 7 + rnd() * 8] as V2, sag: 40 + rnd() * 30 }));
  const left = Array.from({ length: low ? 3 : 5 }, (_, i) => ({ a: [466, 380 + i * 8] as V2, b: [190, 334 + i * 12 + rnd() * 14] as V2, sag: 24 + rnd() * 18 }));
  const loops = [[520, 438, 15], [548, 452, 11], [504, 470, 13]] as const;
  return (
    <g data-wires {...rest}>
      {/* utility pole: concrete shaft, two cross-arms, insulators, a pole-top transformer can */}
      <g className="fill-wall-dark">
        <rect x="462" y="330" width="16" height={GROUND - 330} />
        <rect x="426" y="364" width="90" height="8" />
        <rect x="438" y="404" width="66" height="7" />
        <rect x="484" y="452" width="40" height="54" rx="5" className="fill-wall" />
        <path d="M484 466h40M484 480h40" className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.5" fill="none" />
      </g>
      <g className="fill-paper">
        {[430, 448, 468, 490, 510].map((x) => (
          <rect key={x} x={x} y={356} width="5" height="9" rx="2" />
        ))}
      </g>
      <g className="fill-wall-dark">
        <rect x="1372" y="352" width="14" height={GROUND - 352} />
        <rect x="1340" y="378" width="80" height="7" />
      </g>
      {bundleA.map((p, i) => <Wire key={`a${i}`} {...p} />)}
      {bundleB.map((p, i) => <Wire key={`b${i}`} {...p} />)}
      {left.map((p, i) => <Wire key={`l${i}`} {...p} />)}
      {/* slack coils: the spaghetti every Dhaka pole carries */}
      <g fill="none" className="stroke-ink" strokeWidth={STROKE.hair} vectorEffect="non-scaling-stroke">
        {loops.map(([x, y, r]) => (
          <path key={x} d={`M${x} ${y - r}a${r} ${r} 0 1 0 ${r * 0.4} 0.5a${r * 0.7} ${r * 0.7} 0 1 1 ${r * 0.1} -0.4`} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </g>
  );
}

// ---- the stall --------------------------------------------------------------------------------
const OPEN = { x: 648, y: 486, w: 344, h: 248 }; // the booth opening the shutter covers
const BULB = { x: 880, y: 512 };

const BANANAS = (() => {
  // a hand of five parallel fingers off one stem, each curving outward and up at the tip like a real bunch
  const fingers: string[] = [];
  for (let i = 0; i < 5; i++) {
    const x0 = (i - 2) * 6;
    const len = 44 + (i % 2) * 6;
    fingers.push(ribbon([[x0 * 0.5, 4, 6], [x0 + 1, 16, 10], [x0 + 6, len * 0.62, 10], [x0 + 15, len * 0.9, 7], [x0 + 22, len, 3.5]]));
  }
  return fingers;
})();

const HEM: readonly V2[] = (() => {
  // frayed hem: a sawtooth along the front edge of the awning
  const pts: V2[] = [];
  const rnd = rng(23);
  for (let x = 1046; x >= 598; x -= 14) pts.push([x, 488 + (pts.length % 2 ? 6 : 0) + rnd() * 3]);
  return pts;
})();

export function TongStall({ state, children, ...rest }: { state: TongState; children?: ReactNode } & G) {
  const clip = useId();
  const shutterY = state.shutter === "down" ? 0 : state.shutter === "half" ? -120 : -(OPEN.h + 10);
  const bulbOn = state.bulb !== "off";
  const haloOpacity = state.bulb === "on" ? 1 : state.bulb === "warm" ? 0.7 : 0;
  const lights = state.fairyLights ? Array.from({ length: 13 }, (_, i) => [606 + i * 36, 500 + Math.sin(i * 1.4) * 5] as const) : [];
  return (
    <g {...rest}>
      <defs>
        <clipPath id={clip}>
          <rect x={OPEN.x} y={OPEN.y} width={OPEN.w} height={OPEN.h} />
        </clipPath>
      </defs>
      {/* booth: bamboo posts and the header beam */}
      <g className="fill-wood">
        <path d={wobbleRect(618, 470, 12, GROUND - 470, 61, 1)} />
        <path d={wobbleRect(1018, 470, 12, GROUND - 470, 62, 1)} />
        <path d={`M618 ${GROUND - 140}h12M618 ${GROUND - 290}h12M1018 ${GROUND - 140}h12M1018 ${GROUND - 290}h12`} className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.5" fill="none" />
        <path d={wobbleRect(630, 482, 388, 12, 63, 1.2)} />
      </g>
      {/* back wall, lit by the bulb */}
      <path d={wobbleRect(OPEN.x, OPEN.y + 8, OPEN.w, GROUND - OPEN.y - 8, 64, 1.2)} className="fill-room" />
      <rect x={OPEN.x} y={OPEN.y + 8} width={OPEN.w} height={GROUND - OPEN.y - 8} fill="url(#riso-plank)" opacity="0.5" />
      <rect x={OPEN.x} y={OPEN.y + 8} width={OPEN.w} height="30" className="fill-ink" opacity="0.2" />
      {/* the lamp's printed halo: stepped flat discs and a halftone ring */}
      <g data-halo opacity={haloOpacity}>
        <circle cx={BULB.x} cy={BULB.y + 8} r="150" fill="url(#riso-glow)" opacity="0.4" />
        <circle cx={BULB.x} cy={BULB.y + 8} r="96" className="fill-glow" opacity="0.2" />
        <circle cx={BULB.x} cy={BULB.y + 8} r="52" className="fill-glow" opacity="0.28" />
      </g>
      {/* shelf: jars of biscuits, tins, a calendar, hanging snack strips */}
      <path d={wobbleRect(OPEN.x + 8, 600, 250, 7, 65, 0.8)} className="fill-wood" />
      <g>
        <rect x="668" y="556" width="38" height="44" rx="5" className="fill-wall-lit" opacity="0.55" />
        <rect x="664" y="548" width="46" height="9" rx="3" className="cue-notebook" />
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx="687" cy={590 - i * 9} rx="14" ry="3.6" className="fill-glow" opacity="0.7" />
        ))}
        <rect x="720" y="574" width="18" height="26" rx="3" className="fill-tarp-lit" />
        <rect x="744" y="568" width="20" height="32" rx="3" className="fill-accent" opacity="0.7" />
        <rect x="770" y="580" width="22" height="20" rx="2" className="fill-wall-dark" />
        <rect x="700" y="506" width="32" height="44" className="fill-paper" />
        <rect x="700" y="506" width="32" height="12" className="cue-notebook" />
        <path d="M704 526h24M704 534h24M704 542h16" className="stroke-ink" strokeWidth="1.6" opacity="0.5" fill="none" />
      </g>
      {[958, 972, 986].map((x, s) => (
        <g key={x}>
          <path d={`M${x} 494V${590 - s * 6}`} className="stroke-ink" strokeWidth="1.6" opacity="0.6" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={x - 5} y={498 + i * 18 - s * 2} width="10" height="14" className={["fill-glow", "cue-notebook", "fill-tarp-lit", "cue-cap", "fill-accent"][(i + s) % 5]} opacity="0.85" />
          ))}
        </g>
      ))}
      {/* the bulb */}
      <g data-bulb>
        <path d={`M${BULB.x} 494V${BULB.y - 12}`} className="stroke-ink" strokeWidth={STROKE.hair} />
        <rect x={BULB.x - 4} y={BULB.y - 14} width="8" height="9" className="fill-ink" />
        <circle cx={BULB.x} cy={BULB.y} r="13" className={bulbOn ? "fill-glow" : "fill-wall-lit"} />
        <path d={`M${BULB.x - 4} ${BULB.y + 2}q4 -7 8 0`} fill="none" className="stroke-ink" strokeWidth="1.4" opacity="0.5" />
        <circle cx={BULB.x - 4} cy={BULB.y - 4} r="3" className="fill-paper" opacity="0.8" />
      </g>
      {/* ceiling fan, still until noon (S5) */}
      {state.fan ? (
        <g data-fan>
          <path d={`M720 494V506`} className="stroke-ink" strokeWidth={STROKE.line} />
          <path d={ribbon([[690, 508, 7], [720, 506, 8], [752, 510, 7]])} className="fill-ink" />
          <circle cx="720" cy="506" r="6" className="fill-ink" />
        </g>
      ) : null}
      {/* actors behind the counter (Mama) */}
      {children}
      {/* burner, kettle, flame: the burner head carries three prongs, the flame lives between them */}
      <g>
        <rect x="780" y="712" width="68" height="10" rx="2" className="fill-ink" />
        <rect x="792" y="706" width="44" height="7" rx="2" className="fill-ink" />
        <path d="M793 706V692h4v14zM812 706V692h4v14zM831 706V692h4v14z" className="fill-ink" />
        <g data-flame>
          <circle cx="814" cy="698" r="30" className="fill-glow" opacity="0.2" />
          {[[798, 13], [806, 19], [814, 23], [822, 19], [830, 13]].map(([x, h]) => (
            <g key={x} className="flame-tongue loop" style={{ animationDelay: `${(x % 5) * 0.07}s` }}>
              <path d={`M${x} 706C${x - 5} 701 ${x - 2} ${706 - h * 0.7} ${x} ${706 - h}C${x + 2} ${706 - h * 0.7} ${x + 5} 701 ${x} 706Z`} className="fill-glow" />
              <path d={`M${x} 706C${x - 2.4} 703 ${x - 1} ${706 - h * 0.4} ${x} ${706 - h * 0.55}C${x + 1} ${706 - h * 0.4} ${x + 2.4} 703 ${x} 706Z`} className="cue-uniform" />
            </g>
          ))}
        </g>
        {/* kettle: blackened aluminium, spout left, handle right, steel lid */}
        <path d="M784 692c-2 -20 8 -36 30 -36s32 16 30 36z" className="fill-ink" />
        <path d="M786 666c-10 -6 -18 -14 -22 -26 6 2 14 6 22 14z" className="fill-ink" />
        <path d="M838 664c18 -8 22 12 8 26" fill="none" strokeWidth={STROKE.line} strokeLinecap="round" className="stroke-ink" />
        <rect x="804" y="648" width="20" height="8" rx="4" className="fill-wall-dark" />
        <circle cx="814" cy="646" r="3.4" className="fill-ink" />
        <path d="M792 676c4 -9 12 -13 22 -13" fill="none" strokeWidth="2" strokeLinecap="round" className="stroke-wall-lit" opacity="0.55" />
      </g>
      {/* steam: printed S-curve wisps, a paper stroke over a faint ink one so they read on dark and on light walls */}
      {state.steam !== false ? (
        <g data-steam>
          {[[768, 634, -0.2], [816, 640, -1.5], [778, 636, -2.6]].map(([x, y, d], i) => {
            const path = `M${x} ${y}c9 -11 -9 -22 0 -33c9 -11 -9 -22 0 -33c8 -9 -6 -17 2 -24`;
            return (
              <g key={i} className="steam-wisp loop" style={{ animationDelay: `${d}s` }} fill="none" strokeLinecap="round">
                <path d={path} className="stroke-ink" strokeWidth="9" opacity="0.2" />
                <path d={path} className="stroke-paper" strokeWidth="5" opacity="0.95" />
              </g>
            );
          })}
        </g>
      ) : null}
      {/* the shutter: corrugated, clipped to the opening, rolls up into the header (data-shutter) */}
      <g clipPath={`url(#${clip})`}>
        <g data-shutter data-state={state.shutter} transform={`translate(0 ${shutterY})`}>
          <rect x={OPEN.x} y={OPEN.y} width={OPEN.w} height={OPEN.h + 12} className="fill-wall-dark" />
          <path d={Array.from({ length: 28 }, (_, i) => `M${OPEN.x} ${OPEN.y + 4 + i * 9}H${OPEN.x + OPEN.w}`).join("")} className="stroke-ink" strokeWidth="1.6" opacity="0.35" fill="none" />
          <rect x={OPEN.x} y={OPEN.y + OPEN.h - 4} width={OPEN.w} height="14" className="fill-ink" opacity="0.7" />
          <rect x={OPEN.x + OPEN.w / 2 - 14} y={OPEN.y + OPEN.h - 20} width="28" height="7" rx="3" className="fill-paper" opacity="0.7" />
        </g>
      </g>
      {/* counter: plank top, painted front board with a hand-lettered tin sign */}
      <g>
        <path d={wobbleRect(636, 722, 368, 14, 66, 1)} className="fill-wood" />
        <path d="M640 726h360" className="stroke-paper" strokeWidth="1.6" opacity="0.35" />
        <path d={wobbleRect(642, 736, 356, GROUND - 736, 67, 1.4)} className="fill-wall-dark" />
        <rect x="642" y="736" width="356" height={GROUND - 736} fill="url(#riso-plank)" opacity="0.6" />
        <rect x="642" y="736" width="356" height="26" fill="url(#riso-dots)" opacity="0.3" />
        <g data-sign>
          <path d={wobbleRect(676, 770, 288, 64, 68, 1.2)} className="fill-tarp" />
          <rect x="684" y="777" width="272" height="50" fill="none" strokeWidth={STROKE.hair} className="stroke-paper" opacity="0.85" />
          <Lettering x={700} y={784} w={240} h={36} text="মামার চা" className={state.signLit ? "fill-glow" : "fill-paper"} />
        </g>
      </g>
      {/* glass case on the counter: singara and rolls */}
      <g>
        <rect x="646" y="652" width="62" height="70" fill="none" strokeWidth={STROKE.line} className="stroke-ink" />
        <rect x="649" y="655" width="56" height="64" className="fill-wall-lit" opacity="0.35" />
        <path d="M646 690h62" className="stroke-ink" strokeWidth={STROKE.hair} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${654 + i * 17} 689l8 -17l8 17z`} className="fill-wood" />
        ))}
        {[0, 1].map((i) => (
          <circle key={i} cx={662 + i * 24} cy="710" r="8" className="fill-glow" opacity="0.8" />
        ))}
        <path d="M652 658l14 24M664 658l8 14" className="stroke-paper" strokeWidth="2" opacity="0.5" fill="none" />
      </g>
      {/* tea glasses on a tray */}
      <g>
        <rect x="956" y="716" width="42" height="6" rx="2" className="fill-wall-dark" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={960 + i * 13} y="698" width="10" height="18" rx="2" className="fill-glow" />
            <rect x={960 + i * 13} y="698" width="10" height="5" className="fill-paper" opacity="0.6" />
          </g>
        ))}
      </g>
      {/* the red notebook (baki khata), propped against the jar. Closed cover or open page + the pencil line */}
      <g data-notebook transform="rotate(-5 880 722)">
        <path d={wobbleRect(858, 672, 48, 52, 70, 1)} className="cue-notebook" />
        <path d="M858 676h6v46h-6z" className="fill-ink" opacity="0.25" />
        <rect x="870" y="684" width="24" height="14" className="fill-paper" opacity="0.9" />
        <g data-notebook-pages opacity={state.notebook === "open" ? 1 : 0}>
          <path d="M852 674l54 -4l-4 52l-50 4z" className="fill-paper" />
          <path d="M858 686h40M858 695h40M858 704h40M858 713h30" className="stroke-ink" strokeWidth="1.2" opacity="0.4" fill="none" />
          <path d="M860 690l10 -1l8 2l8 -2M860 699l12 1l9 -2M860 708l8 1" className="stroke-ink" strokeWidth="1.6" opacity="0.75" fill="none" strokeLinecap="round" />
          <path data-notebook-line d="M859 717h38" className="stroke-ink" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </g>
      </g>
      {/* hanging bananas, bunched at the header (sway = data-banana) */}
      <g transform="translate(992 494)">
        <g data-banana className="banana-sway loop">
          <path d="M0 0v10" className="stroke-wood" strokeWidth="5" />
          <g className="banana stroke-ink" strokeWidth="1.3" strokeOpacity="0.55">
            {BANANAS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        </g>
      </g>
      {/* awning: a faded blue tarpaulin on two bamboo poles. A lighter plate sits offset behind it (misregistration). */}
      <g>
        <path d={wobblePoly([[620, 396], [1024, 396], [1052, 464], [592, 464]], 71, 2)} className="fill-tarp-lit" transform="translate(4 -3)" />
        <path d={wobblePoly([[620, 396], [1024, 396], [1052, 464], [592, 464]], 71, 2)} className="fill-tarp" />
        <path d={wobblePoly([[628, 402], [700, 402], [684, 458], [606, 458]], 72, 1.5)} className="fill-tarp-lit" opacity="0.75" />
        <path d={wobblePoly([[752, 400], [832, 400], [836, 460], [738, 460]], 73, 1.5)} className="fill-tarp-dark" opacity="0.45" />
        <path d={wobblePoly([[900, 400], [980, 400], [1002, 460], [920, 460]], 74, 1.5)} className="fill-tarp-dark" opacity="0.4" />
        <path d={wobblePoly([[752, 400], [832, 400], [836, 460], [738, 460]], 73, 1.5)} fill="url(#riso-dots)" opacity="0.22" />
        <path d={wobblePoly([[900, 400], [980, 400], [1002, 460], [920, 460]], 74, 1.5)} fill="url(#riso-dots)" opacity="0.2" />
        <path d="M700 400l-12 60M832 400l4 60M990 400l18 60" className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.4" fill="none" />
        <path d="M640 424h30M644 440h26M648 424v16M668 424v16" className="stroke-paper" strokeWidth="1.6" strokeDasharray="3 3" opacity="0.6" fill="none" />
        <rect x="592" y="396" width="460" height="68" fill="url(#riso-speck)" opacity="0.4" />
        {/* hem flap with a frayed edge */}
        <path d={`M592 462L1052 462L1046 488${HEM.map(([x, y]) => `L${r1(x)} ${r1(y)}`).join("")}Z`} className="fill-tarp-dark" />
        <path d="M600 466H1044" className="stroke-paper" strokeWidth="1.6" opacity="0.4" fill="none" />
        <g fill="none" className="stroke-wood" strokeWidth={STROKE.line} strokeLinecap="round">
          <path d="M624 488c-2 14 8 16 10 4" />
          <path d="M760 490c-2 12 7 14 9 3" />
          <path d="M940 490c-2 12 7 14 9 3" />
          <path d="M1030 488c-2 14 8 16 10 4" />
        </g>
        {lights.map(([x, y]) => (
          <circle key={x} cx={x} cy={y + 8} r="4" className="fill-glow" />
        ))}
      </g>
    </g>
  );
}

/** The bench in front of the stall, with the newspaper bundle (S2 hawker). */
export function TongBench({ bundle, ...rest }: { bundle?: boolean } & G) {
  return (
    <g {...rest}>
      <path d={wobbleRect(540, 806, 150, 12, 81, 1)} className="fill-wood" />
      <path d="M552 818V860M676 818V860" className="stroke-wood" strokeWidth="8" />
      <path d="M552 842H676" className="stroke-wood" strokeWidth="5" />
      {bundle ? (
        <g data-bundle>
          <path d={wobbleRect(566, 786, 56, 20, 82, 1)} className="fill-paper" />
          <path d={wobbleRect(572, 774, 52, 14, 83, 1)} className="fill-paper" opacity="0.9" />
          <path d="M566 796h56M594 774v32" className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.5" fill="none" />
          <path d={wobbleRect(574, 780, 22, 6, 84, 0.6)} className="stroke-ink fill-none" strokeWidth="1" opacity="0.5" />
        </g>
      ) : null}
    </g>
  );
}
