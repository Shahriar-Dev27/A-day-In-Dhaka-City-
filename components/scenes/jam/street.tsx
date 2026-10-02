import type { ReactNode } from "react";
import { STROKE, blob, curve, r1, rng, wobblePoly, wobbleRect, type V2 } from "../tong/geometry";
import { GROUND, LAYER_W, ROW } from "./layout";
import { Exhaust, Helper, Commuter, Tassels } from "./figures";
import { Bike, Bus, Cng, Rickshaw, type BusTone, type RickTone } from "./vehicles";

/*
  The five depth layers of Scene 3 as SVG content (the scene wraps each in a .jam-layer div).
  far    hazy skyline, a flyover with tiny traffic                      (3100 wide)
  mid    the shop-front street: real Bangla signs, roofs, tangled wires (4200)
  line   the metro viaduct: deck, piers, one train, the final pier     (5500)
  street three traffic lanes, the tong's corner, the hero cluster       (6300)
  near   poles and wires in front of everything                         (7800)
  Everything uses the tong set's language: wobble-cut edges, halftone, specks, STROKE weights, tokens.
*/

const H = 900;
const svg = (w: number, children: ReactNode) => (
  <svg aria-hidden="true" focusable="false" viewBox={`0 0 ${w} ${H}`} preserveAspectRatio="xMinYMax meet">
    {children}
  </svg>
);
const rects = (items: readonly (readonly [number, number, number, number])[]) => items.map(([x, y, w, h]) => `M${x} ${y}h${w}v${h}h${-w}Z`).join("");

/** Real hand-painted lettering (sign-painter face), fitted to its board. */
function Sign({ x, y, w, h = 52, text, tone }: { x: number; y: number; w: number; h?: number; text: string; tone: "blue" | "mag" | "amber" }) {
  const cls = tone === "blue" ? "fill-tarp" : tone === "mag" ? "j-mag-f" : "j-amber-f";
  const ink = tone === "amber" ? "fill-ink" : "j-cream";
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="2" className={cls} />
      <rect x={x + 5} y={y + 5} width={w - 10} height={h - 10} fill="none" strokeWidth={STROKE.hair} className="s-cream" opacity="0.7" />
      <text x={x + 14} y={y + h * 0.74} fontSize={h * 0.62} textLength={w - 28} lengthAdjust="spacingAndGlyphs" fontFamily="var(--font-chunky)" fontWeight={700} lang="bn" className={ink}>
        {text}
      </text>
    </g>
  );
}

// ---- far -----------------------------------------------------------------------------------
const FAR_BLOCKS = (() => {
  const rnd = rng(901);
  const out: [number, number, number, number][] = [];
  for (let x = 0; x < 3100; x += 80 + Math.round(rnd() * 60)) {
    const w = 90 + Math.round(rnd() * 90);
    const top = 470 + Math.round(rnd() * 150);
    out.push([x, top, w, GROUND - top + 10]);
  }
  return out;
})();

export function FarLayer() {
  return svg(
    LAYER_W.far,
    <g>
      <path d={rects(FAR_BLOCKS)} className="fill-far" />
      {/* two domes with a minaret: Dhaka's skyline, always */}
      <path d="M420 770V560h26V770ZM433 560V520" className="fill-room" />
      <path d="M1980 770V540h30V770ZM1995 540V498" className="fill-room" />
      <path d={blob([[372, 598], [402, 574], [440, 566], [480, 574], [506, 598], [500, 640], [376, 640]])} className="fill-room" />
      {/* the flyover: a long slab on slim piers with a few tiny cars */}
      <g className="fill-room">
        <path d={wobblePoly([[0, 468], [900, 452], [2000, 410], [3100, 380], [3100, 404], [2000, 436], [900, 478], [0, 494]], 902, 1.5)} />
        <path d={`M200 485V775h14V485ZM700 478V775h14V478ZM1200 462V775h14V462ZM1700 442V775h14V442ZM2200 424V775h14V424ZM2700 404V775h14V404Z`} />
      </g>
      <g className="fill-wall-dark" opacity="0.8">
        <path d={rects([[620, 446, 46, 14], [660, 440, 20, 20], [1500, 420, 40, 12], [1536, 414, 18, 18], [2380, 398, 44, 13]])} />
      </g>
    </g>,
  );
}

// ---- mid: the shop-front street ---------------------------------------------------------------
interface B {
  x: number;
  w: number;
  top: number;
  dark?: boolean;
  sign?: { text: string; w: number; y: number; tone: "blue" | "mag" | "amber" };
  tank?: boolean;
}
const BUILDINGS: readonly B[] = [
  { x: 0, w: 360, top: 300, sign: { text: "ফার্মেসি", w: 210, y: 398, tone: "blue" }, tank: true },
  { x: 370, w: 170, top: 430, dark: true },
  { x: 550, w: 720, top: 500, dark: true }, // low bazaar roof: the first board stands on it
  { x: 1280, w: 360, top: 290, sign: { text: "ভাই ভাই হোটেল", w: 330, y: 396, tone: "mag" } },
  { x: 1650, w: 700, top: 500, dark: true }, // low roof: the "জ্যাম" board stands on it
  { x: 2360, w: 380, top: 300, sign: { text: "মোবাইল সার্ভিসিং", w: 340, y: 404, tone: "amber" }, tank: true },
  { x: 2750, w: 340, top: 420, dark: true, sign: { text: "টেইলার্স", w: 200, y: 462, tone: "blue" } },
  { x: 3100, w: 400, top: 330, sign: { text: "জুতার দোকান", w: 280, y: 424, tone: "mag" } },
  { x: 3510, w: 300, top: 460, dark: true },
  { x: 3820, w: 400, top: 310, sign: { text: "মুদি দোকান", w: 250, y: 420, tone: "blue" }, tank: true },
];

function Shop({ b, i }: { b: B; i: number }) {
  const cols = Math.max(1, Math.floor((b.w - 34) / 84));
  const x0 = b.x + (b.w - cols * 84) / 2 + 15;
  const wins: [number, number, number, number][] = [];
  const rails: string[] = [];
  const low = b.top >= 480;
  for (let y = b.top + 26; y < 640; y += 98) {
    for (let c = 0; c < cols; c++) wins.push([x0 + c * 84, y, 54, 42]);
    rails.push(`M${b.x + 10} ${y + 62}H${b.x + b.w - 10}`);
    if (low) break;
  }
  const slabs: [number, number, number, number][] = [];
  for (let y = b.top + 94; y < 640; y += 98) slabs.push([b.x - 3, y, b.w + 6, 7]);
  const rnd = rng(500 + i);
  const streaks = wins.filter((_, k) => k % 3 === 1).map(([x, y]) => blob([[x + 8, y + 52], [x + 12, y + 52], [x + 14 + rnd() * 3, y + 84], [x + 9, y + 94], [x + 5, y + 78]]));
  const acs = wins.filter((_, k) => (k + i) % 4 === 2).map(([x, y]): [number, number, number, number] => [x + 30, y + 26, 30, 24]);
  return (
    <g>
      <path d={wobbleRect(b.x, b.top, b.w, GROUND - b.top + 20, 600 + i, 1.8)} className={b.dark ? "fill-wall-dark" : "fill-wall"} />
      <rect x={b.x} y={b.top} width={b.w} height={GROUND - b.top} fill="url(#riso-speck)" opacity="0.32" />
      <path d={wobbleRect(b.x - 6, b.top - 10, b.w + 12, 12, 620 + i, 1)} className="fill-wall-dark" />
      <path d={rects(slabs)} className="fill-ink" opacity="0.28" />
      <path d={rects(wins)} className="fill-ink" opacity="0.82" />
      <path d={rects(wins.map(([x, y, w]) => [x + 2, y + 2, w - 4, 8]))} className="j-glass" opacity="0.5" />
      <path d={rails.join("")} fill="none" strokeWidth="3" className="stroke-ink" opacity="0.6" />
      <path d={rects(acs)} className="fill-wall-lit" />
      <path d={streaks.join("")} className="fill-ink" opacity="0.13" />
      {b.tank ? (
        <g className="fill-wall-lit">
          <path d={`M${b.x + 40} ${b.top - 8}v-12M${b.x + 90} ${b.top - 8}v-12`} className="stroke-ink" strokeWidth={STROKE.line} />
          <rect x={b.x + 30} y={b.top - 62} width="72" height="44" rx="12" />
        </g>
      ) : null}
      {low ? (
        <g>
          {/* a sagging blue tarp and bundled goods on the bazaar roof */}
          <path d={wobblePoly([[b.x + 40, b.top], [b.x + 200, b.top - 26], [b.x + 330, b.top - 10], [b.x + 330, b.top]], 640 + i, 1.2)} className="fill-tarp-lit" />
          <path d={wobbleRect(b.x + 460, b.top - 30, 90, 30, 650 + i, 1.2)} className="fill-wood" />
        </g>
      ) : null}
      {b.sign ? <Sign x={b.x + 18} y={b.sign.y} w={b.sign.w} text={b.sign.text} tone={b.sign.tone} /> : null}
    </g>
  );
}

function wires(spans: readonly (readonly [V2, V2, number])[], count: number, seed: number): string {
  const rnd = rng(seed);
  let d = "";
  for (const [a, b, sag] of spans)
    for (let k = 0; k < count; k++) {
      const s = sag + rnd() * 22;
      const y0 = a[1] + k * 6;
      const y1 = b[1] + k * 7 + rnd() * 6;
      d += curve([[a[0], y0], [a[0] + (b[0] - a[0]) * 0.3, y0 + (y1 - y0) * 0.3 + s * 0.8], [(a[0] + b[0]) / 2, (y0 + y1) / 2 + s], [a[0] + (b[0] - a[0]) * 0.7, y0 + (y1 - y0) * 0.7 + s * 0.8], [b[0], y1]]);
    }
  return d;
}

export function MidLayer({ low }: { low: boolean }) {
  const spans: [V2, V2, number][] = [[[0, 204], [1300, 226], 22], [[1300, 226], [2700, 208], 26], [[2700, 208], [4200, 230], 24]];
  return svg(
    LAYER_W.mid,
    <g>
      <rect x="0" y={GROUND - 60} width={LAYER_W.mid} height="200" className="fill-wall-dark" />
      {BUILDINGS.map((b, i) => (
        <Shop key={b.x} b={b} i={i} />
      ))}
      <path d={wires(spans, low ? 3 : 6, 71)} fill="none" strokeLinecap="round" strokeWidth={STROKE.hair} vectorEffect="non-scaling-stroke" className="stroke-ink" opacity="0.85" />
    </g>,
  );
}

// ---- line: the elevated metro ---------------------------------------------------------------
const PIER_X = [260, 980, 1700, 2420, 3140, 3860, 4780]; // the last one is the hand-off pier
const DECK = { top: 122, bot: 168 };
export const TRAIN_FROM = 3900;

function Train() {
  // 3 cars, nose to the left (it glides right to left, as in Scene 4); a plain silhouette, no livery, no logo
  const w = 190;
  const wins: [number, number, number, number][] = [];
  for (let c = 0; c < 3; c++) for (let k = 0; k < 4; k++) wins.push([22 + c * (w + 6) + k * 42, 76, 28, 18]);
  return (
    <g data-train>
      <path d={wobblePoly([[0, 120], [0, 100], [30, 70], [3 * w + 18, 62], [3 * w + 18, 120]], 910, 1.2)} className="fill-minaret" />
      <path d={rects(wins)} className="j-glass" opacity="0.85" />
      <path d={`M${w + 2} 64V120M${2 * w + 8} 64V120`} className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.6" />
      <path d={`M0 52H${3 * w + 40}`} fill="none" strokeWidth={STROKE.hair} vectorEffect="non-scaling-stroke" className="stroke-ink" opacity="0.7" />
    </g>
  );
}

export function LineLayer({ low }: { low: boolean }) {
  const piers = low ? PIER_X.filter((_, i) => i % 2 === 1 || i === PIER_X.length - 1) : PIER_X;
  return svg(
    LAYER_W.line,
    <g>
      <defs>
        <g id="j-pier">
          <path d={wobblePoly([[-140, 196], [140, 196], [128, 232], [60, 262], [-60, 262], [-128, 232]], 920, 1.4)} className="fill-wall-dark" />
          <path d={wobblePoly([[-58, 258], [58, 258], [60, GROUND + 14], [-60, GROUND + 14]], 921, 1.8)} className="fill-wall" />
          <path d={`M-58 258H58V${GROUND}H-58Z`} fill="url(#riso-speck)" opacity="0.4" />
          <path d={`M26 262H58V${GROUND}H26Z`} fill="url(#riso-dots)" opacity="0.32" />
          <path d={Array.from({ length: 8 }, (_, i) => `M-58 ${300 + i * 62}H58`).join("")} fill="none" strokeWidth={STROKE.hair} className="stroke-ink" opacity="0.25" />
          <path d={blob([[-30, 330], [-26, 330], [-24, 440], [-30, 500], [-34, 420]])} className="fill-ink" opacity="0.14" />
          <path d={wobbleRect(-82, GROUND - 26, 164, 30, 922, 1.4)} className="fill-wall-dark" />
        </g>
      </defs>
      {/* deck: slab, underside web, parapet, joints */}
      <path d={wobbleRect(-40, DECK.top, LAYER_W.line + 80, DECK.bot - DECK.top, 930, 1.6)} className="fill-wall" />
      <rect x="-40" y={DECK.top} width={LAYER_W.line + 80} height={DECK.bot - DECK.top} fill="url(#riso-speck)" opacity="0.35" />
      <path d={`M-40 ${DECK.bot}H${LAYER_W.line + 40}L${LAYER_W.line + 20} 196H-20Z`} className="fill-wall-dark" />
      <path d={`M-40 ${DECK.bot}H${LAYER_W.line + 40}V${DECK.bot + 10}H-40Z`} fill="url(#riso-dots)" opacity="0.3" />
      <path d={Array.from({ length: 26 }, (_, i) => `M${i * 220} ${DECK.top}V${DECK.bot}`).join("")} fill="none" strokeWidth={STROKE.hair} className="stroke-ink" opacity="0.3" />
      <path d={`M-40 ${DECK.top - 12}H${LAYER_W.line + 40}`} fill="none" strokeWidth={STROKE.line} className="stroke-wall-dark" />
      {piers.map((x) => (
        <use key={x} href="#j-pier" x={x} y="0" />
      ))}
      <g data-train-wrap>
        <g transform={`translate(${TRAIN_FROM} 0)`} data-train-slot>
          <Train />
        </g>
      </g>
    </g>,
  );
}

// ---- street ---------------------------------------------------------------------------------
interface V {
  x: number;
  keep?: boolean;
}
const BUSES: readonly (V & { tone: BusTone; route: string; puff?: boolean })[] = [
  { x: 520, tone: "red", route: "গুলিস্তান", puff: true, keep: true },
  { x: 1220, tone: "olive", route: "মতিঝিল" },
  { x: 2130, tone: "blue", route: "ফার্মগেট", puff: true, keep: true },
  { x: 2830, tone: "red", route: "উত্তরা", keep: true },
  { x: 3560, tone: "blue", route: "মিরপুর-১০" },
  { x: 4300, tone: "olive", route: "সায়েদাবাদ", keep: true },
  { x: 4950, tone: "red", route: "গাবতলী" },
  { x: 5650, tone: "blue", route: "ফার্মগেট", keep: true },
];
const CNGS: readonly V[] = [{ x: 1120, keep: true }, { x: 1700, keep: true }, { x: 2740, keep: true }, { x: 3500 }, { x: 4260, keep: true }, { x: 5200 }, { x: 5880, keep: true }];
const RICKS: readonly (V & { tone: RickTone; pax?: "cream" | "blue" | "khaki" | null })[] = [
  { x: 250, tone: "amber", pax: "khaki", keep: true },
  { x: 700, tone: "mag", pax: "cream", keep: true },
  { x: 1380, tone: "amber", pax: "blue" },
  { x: 2040, tone: "dusk", keep: true },
  { x: 3430, tone: "amber", pax: "cream", keep: true },
  { x: 4060, tone: "dusk" },
  { x: 4470, tone: "mag", pax: "blue", keep: true },
  { x: 5100, tone: "amber" },
  { x: 5500, tone: "mag", pax: "cream", keep: true },
  { x: 5900, tone: "dusk", pax: "khaki" },
];
// bikes sit in the gaps of the front lane; their weave is a short drift, so they stay clear of the rickshaws
const BIKES: readonly V[] = [{ x: 1100, keep: true }, { x: 1790 }, { x: 2420, keep: true }, { x: 3830 }, { x: 4880, keep: true }];

export const HERO = { rick: 2960, bus: 2130 } as const;
// the commuter's head, where the speech slip points (street coordinates)
export const HEAD: V2 = [HERO.rick + 156, ROW.front - 304];

export function Honk({ at, k = 1 }: { at: V2; k?: number }) {
  const arcs = [26, 46, 66].map((r) => {
    const rr = r * k;
    return `M${r1(-rr * 0.7)} ${r1(-rr * 0.5)}A${r1(rr)} ${r1(rr)} 0 0 1 ${r1(rr * 0.7)} ${r1(-rr * 0.5)}`;
  });
  return (
    <g transform={`translate(${at[0]} ${at[1]})`}>
      <g data-honk fill="none" strokeLinecap="round" strokeWidth={STROKE.line} className="stroke-ink" opacity="0">
        {arcs.map((d, i) => (
          <path key={i} d={d} vectorEffect="non-scaling-stroke" opacity={1 - i * 0.25} />
        ))}
      </g>
    </g>
  );
}

function TongCorner() {
  return (
    <g>
      <path d={wobbleRect(-80, 722, 380, 60, 940, 1.4)} className="fill-wood" />
      <path d={wobbleRect(-80, 722, 380, 8, 941, 0.8)} className="fill-ink" opacity="0.4" />
      <rect x="286" y="570" width="14" height="214" className="fill-wood" />
      <path d={wobblePoly([[-80, 566], [300, 552], [322, 612], [-80, 626]], 942, 1.4)} className="fill-tarp" />
      <path d={wobblePoly([[-80, 566], [300, 552], [306, 570], [-80, 584]], 943, 1)} className="fill-tarp-lit" opacity="0.8" />
      <path d={`M-80 626L322 612`} fill="none" strokeWidth={STROKE.line} strokeDasharray="8 8" className="stroke-tarp-dark" />
      <circle cx="210" cy="660" r="46" fill="url(#riso-glow)" opacity="0.5" />
      <circle cx="210" cy="652" r="9" className="fill-glow" />
      <path d="M210 626V644" strokeWidth="2" className="stroke-ink" />
      <path d="M120 626q8 20 14 44q-14 -12 -14 -44zM136 626q10 20 12 44" className="banana" />
      <rect x="40" y="690" width="26" height="32" rx="4" className="fill-wall-lit" />
      <path d="M40 700h26M40 710h26" strokeWidth="2" className="stroke-ink" opacity="0.5" />
    </g>
  );
}

export function StreetLayer({ low, children }: { low: boolean; children?: ReactNode }) {
  const pick = <T extends V>(l: readonly T[]) => (low ? l.filter((v) => v.keep) : l);
  return svg(
    LAYER_W.street,
    <g>
      {/* road: asphalt, kerb edge, speckle, a broken centre line */}
      <rect x="-200" y={GROUND} width={LAYER_W.street + 400} height="260" className="fill-road" />
      <rect x="-200" y={GROUND} width={LAYER_W.street + 400} height="6" className="fill-ink" opacity="0.45" />
      <rect x="-200" y={GROUND + 6} width={LAYER_W.street + 400} height="200" fill="url(#riso-speck)" opacity="0.5" />
      <path d={Array.from({ length: 40 }, (_, i) => `M${i * 170} ${ROW.mid + 10}h86`).join("")} fill="none" strokeWidth="4" className="s-cream" opacity="0.4" />
      <TongCorner />
      {/* back lane: buses */}
      {pick(BUSES).map((b) => (
        <g key={b.x}>
          <Bus at={[b.x, ROW.back]} tone={b.tone} route={b.route} />
          {b.puff ? <Exhaust at={[b.x - 6, ROW.back - 40]} /> : null}
        </g>
      ))}
      <g data-hero-helper>
        <Helper at={[HERO.bus, ROW.back]} />
      </g>
      {/* mid lane: CNGs */}
      {pick(CNGS).map((c) => (
        <Cng key={c.x} at={[c.x, ROW.mid]} />
      ))}
      {/* front lane: rickshaws, bikes weave between the lanes */}
      {pick(RICKS).map((r, i) => (
        <g key={r.x} data-rick={i} data-x={r.x}>
          <Rickshaw at={[r.x, ROW.front]} tone={r.tone} pax={r.pax} />
        </g>
      ))}
      <g data-hero-rick>
        <Rickshaw at={[HERO.rick, ROW.front]} tone="mag" pax={null} />
        <Commuter at={[HERO.rick, ROW.front]} />
        <circle data-halo cx={HERO.rick + 156} cy={ROW.front - 286} r="52" fill="url(#riso-glow)" opacity="0.4" />
        <Tassels at={[HERO.rick, ROW.front]} />
      </g>
      {pick(BIKES).map((b, i) => (
        <g key={b.x} data-bike={i} data-x={b.x}>
          <Bike at={[b.x, ROW.front - 18]} />
        </g>
      ))}
      <Honk at={[HERO.bus + 650, ROW.back - 104]} k={1.1} />
      <Honk at={[2740 + 250, ROW.mid - 90]} />
      <Honk at={[HERO.rick + 330, ROW.front - 120]} k={0.8} />
      {children}
    </g>,
  );
}

// ---- near: poles and wires in front of everything -----------------------------------------------
export const NEAR_POLES = [380, 1500, 2700, 3900, 5000, 5700, 7300] as const;

export function NearLayer({ low }: { low: boolean }) {
  const spans = NEAR_POLES.slice(0, -1).map((x, i): [V2, V2, number] => [[x + 6, 152 + (i % 2) * 6], [NEAR_POLES[i + 1] + 6, 154 + ((i + 1) % 2) * 6], 10 + (i % 3) * 5]);
  return svg(
    LAYER_W.near,
    <g>
      {NEAR_POLES.map((x, i) => (
        <g key={x} className="fill-wall-dark">
          <rect x={x - 6} y="120" width="16" height="900" />
          <rect x={x - 40} y="150" width="92" height="8" />
          <rect x={x - 26} y="188" width="64" height="7" />
          {i % 2 === 0 ? <rect x={x + 14} y="236" width="40" height="52" rx="5" className="fill-wall" /> : null}
          {[-34, -16, 8, 28, 44].map((dx) => (
            <rect key={dx} x={x + dx} y="138" width="5" height="12" rx="2" className="fill-paper" />
          ))}
        </g>
      ))}
      <path d={wires(spans, low ? 3 : 5, 83)} fill="none" strokeLinecap="round" strokeWidth={STROKE.hair} vectorEffect="non-scaling-stroke" className="stroke-ink" />
      <g fill="none" strokeWidth={STROKE.hair} vectorEffect="non-scaling-stroke" className="stroke-ink">
        <path d="M396 250a16 16 0 1 0 6 .6a11 11 0 1 1 2 -.4M1518 262a14 14 0 1 0 5 .5a10 10 0 1 1 2 -.4M3918 256a15 15 0 1 0 6 .6" />
      </g>
    </g>,
  );
}
