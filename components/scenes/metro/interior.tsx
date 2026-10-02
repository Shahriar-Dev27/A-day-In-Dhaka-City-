import { STROKE, blob, curve, r1, ribbon, rng, wobbleRect } from "../tong/geometry";
import { AT, IN, WIN, WINDOW_CX, WIN_Y0, WIN_Y1 } from "./layout";
import { octagon } from "./shapes";
import { COPY } from "@/lib/copy";
import m from "./metro.module.css";

const BOARDS = COPY[4].extra!;
const SIGNS = { sale: BOARDS.billboardSale.bn, letting: BOARDS.billboardLetting.bn, admission: BOARDS.billboardAdmission.bn } as const;

/*
  Scene 4 interior, seen across the aisle at the window wall. Everything lives in ONE track group (the
  camera pans/zooms it as a unit). Layers: wall + ceiling < the window band (4 sliding panes clipped to
  the openings) < frames < door bay < bench < floor < handrail/straps < AC vent + route display. The
  passengers go in between InteriorBack and InteriorFront (the mother's pole is drawn over her hands).
  Panes slide in track coordinates; their content must cover [80, 3120 + travel] (see PANE_TRAVEL).
*/

export const PANE_TRAVEL = { far: 360, mid: 900, near: 1800, jam: 630 } as const;
const END = { far: 80 + 3040 + PANE_TRAVEL.far, mid: 80 + 3040 + PANE_TRAVEL.mid, near: 80 + 3040 + PANE_TRAVEL.near, jam: 80 + 3040 + PANE_TRAVEL.jam };

const HORIZON = 596;
const hairNS = { vectorEffect: "non-scaling-stroke" as const };

// ---- the four panes ---------------------------------------------------------------------------------

function FarPane() {
  const rnd = rng(701);
  const pts: [number, number][] = [[60, WIN_Y1 + 10]];
  let x = 60;
  while (x < END.far) {
    const w = 50 + rnd() * 90;
    const top = rnd() < 0.18 ? 372 + rnd() * 36 : 450 + rnd() * 90;
    pts.push([x, top], [x + w, top]);
    x += w;
  }
  pts.push([x, WIN_Y1 + 10]);
  return (
    <g data-pane="far">
      <path d={`M${pts.map(([a, b]) => `${r1(a)} ${r1(b)}`).join("L")}Z`} className="fill-far" />
      {/* a minaret in the haze, and a crane: Dhaka is always half built */}
      <path d="M1180 600V420h-9l-7 -18c0 -14 16 -22 20 -42c4 20 20 28 20 42l-7 18h-9v180Z" className="fill-far" />
      <path d="M2260 600V380h70v10h-60M2330 390v34" className="stroke-wall-dark" strokeWidth={STROKE.line} fill="none" {...hairNS} opacity="0.5" />
    </g>
  );
}

function Billboard({ x, y, w, text, tone, seed }: { x: number; y: number; w: number; text: string; tone: 0 | 1 | 2; seed: number }) {
  const panel = ["fill-tarp-lit", "fill-paper", "fill-wall-dark"][tone];
  const ink = tone === 1 ? "fill-ink" : "fill-paper";
  return (
    <g>
      <path d={`M${x + w * 0.22} ${y + 90}V${HORIZON + 30}M${x + w * 0.78} ${y + 90}V${HORIZON + 30}`} className="stroke-ink" strokeWidth={STROKE.line} fill="none" {...hairNS} opacity="0.7" />
      <path d={wobbleRect(x + 3, y - 2, w, 92, seed + 1, 1.2)} className="fill-accent" opacity="0.6" />
      <path d={wobbleRect(x, y, w, 90, seed, 1.2)} className={panel} />
      <path d={wobbleRect(x + 7, y + 7, w - 14, 76, seed + 2, 0.8)} fill="none" className="stroke-ink" strokeWidth={STROKE.hair} {...hairNS} opacity="0.4" />
      <text x={x + w / 2} y={y + 58} textAnchor="middle" className={ink} style={{ fontFamily: "var(--font-chunky), 'Baloo Da 2', system-ui, sans-serif", fontSize: 40, fontWeight: 700, letterSpacing: 0 }} lang="bn">
        {text}
      </text>
    </g>
  );
}

function MidPane({ low }: { low: boolean }) {
  const rnd = rng(711);
  const blocks: React.ReactNode[] = [];
  let x = 40;
  let i = 0;
  while (x < END.mid) {
    const w = 110 + rnd() * 100;
    const top = 470 + rnd() * 90;
    const tone = i % 3 === 0 ? "fill-wall" : "fill-wall-lit";
    blocks.push(
      <g key={i}>
        <path d={wobbleRect(x, top, w, HORIZON + 80 - top, 720 + i, 1.4)} className={tone} />
        <rect x={x} y={top} width={w} height={HORIZON + 80 - top} fill="url(#riso-fine)" opacity="0.14" />
        <path d={`M${x} ${top}h${w}`} className="stroke-ink" strokeWidth={STROKE.hair} fill="none" {...hairNS} opacity="0.3" />
        {rnd() < 0.5 && (
          <g className="fill-wall-dark">
            <path d={`M${r1(x + w * 0.3)} ${top}v-12h${r1(w * 0.28)}v12Z`} />
            <path d={blob([[x + w * 0.28, top - 12], [x + w * 0.31, top - 32], [x + w * 0.44, top - 38], [x + w * 0.57, top - 32], [x + w * 0.6, top - 12]])} />
          </g>
        )}
        {rnd() < 0.3 && <path d={`M${r1(x + w * 0.74)} ${top}v-26M${r1(x + w * 0.74 - 8)} ${top - 22}q8 -14 22 -4`} className="stroke-ink" strokeWidth={STROKE.line} fill="none" {...hairNS} opacity="0.6" />}
        {rnd() < 0.5 && (
          <g fill="none" className="stroke-ink" {...hairNS} strokeWidth={STROKE.hair} opacity="0.5">
            <path d={`M${x + 6} ${top + 14}Q${x + w / 2} ${top + 30} ${x + w - 6} ${top + 12}`} />
            <path d={`M${x + 22} ${top + 20}v10M${x + 40} ${top + 24}v12M${x + 58} ${top + 24}v10`} strokeWidth={5} className="stroke-(--rick)" opacity="0.75" />
          </g>
        )}
      </g>,
    );
    x += w + 8 + rnd() * 20;
    i++;
  }
  const signs = [
    { x: 420, y: 350, w: 230, text: SIGNS.sale, tone: 0 as const },
    { x: 1260, y: 372, w: 250, text: SIGNS.letting, tone: 1 as const },
    { x: 2080, y: 356, w: 210, text: SIGNS.admission, tone: 2 as const },
    { x: 2900, y: 364, w: 230, text: SIGNS.sale, tone: 1 as const },
    { x: 3620, y: 352, w: 250, text: SIGNS.letting, tone: 0 as const },
  ];
  return (
    <g data-pane="mid">
      {(low ? blocks.filter((_, k) => k % 2 === 0) : blocks)}
      {signs.map((s, k) => (
        <Billboard key={k} {...s} seed={760 + k * 5} />
      ))}
    </g>
  );
}

function JamPane({ low }: { low: boolean }) {
  const rnd = rng(731);
  const items: React.ReactNode[] = [];
  const palette = ["fill-(--bus-a)", "fill-(--bus-b)", "fill-(--bus-c)", "fill-(--bus-d)", "fill-(--bus-e)"];
  let x = 60;
  let i = 0;
  while (x < END.jam) {
    const r = rnd();
    const y0 = HORIZON + 30 + (i % 2) * 16;
    if (r < 0.46) {
      const w = 120 + rnd() * 40;
      items.push(
        <g key={i}>
          <path d={wobbleRect(x, y0, w, 26, 740 + i, 1)} className={palette[i % palette.length]} />
          <path d={`M${x + 8} ${y0 + 4}v18M${x + w * 0.3} ${y0 + 4}v18M${x + w * 0.6} ${y0 + 4}v18M${x + w - 8} ${y0 + 4}v18`} className="stroke-ink" strokeWidth={STROKE.hair} fill="none" {...hairNS} opacity="0.4" />
          <path d={wobbleRect(x + w * 0.62, y0 + 6, 22, 14, 770 + i, 0.6)} className="fill-paper" opacity="0.7" />
        </g>,
      );
      x += w + 8 + rnd() * 24;
    } else if (r < 0.74) {
      items.push(
        <g key={i}>
          <path d={blob([[x, y0 + 6], [x + 6, y0 - 2], [x + 30, y0 - 2], [x + 36, y0 + 8], [x + 30, y0 + 18], [x + 6, y0 + 18]])} className="fill-(--bus-d)" />
          <path d={`M${x + 18} ${y0 - 2}v20`} className="stroke-ink" strokeWidth={STROKE.hair} {...hairNS} opacity="0.4" />
        </g>,
      );
      x += 46 + rnd() * 20;
    } else {
      items.push(
        <g key={i}>
          <path d={blob([[x, y0 + 8], [x + 8, y0], [x + 22, y0], [x + 28, y0 + 8], [x + 20, y0 + 18], [x + 6, y0 + 18]])} className="fill-(--rick)" />
        </g>,
      );
      x += 36 + rnd() * 18;
    }
    i++;
  }
  // The bus the boy is looking at: it sits under his window at beat 2 (pane-local x accounts for the slide so far).
  const bx = AT.boy - 150 + PANE_TRAVEL.jam * 0.88;
  return (
    <g data-pane="jam">
      <path d={wobbleRect(40, HORIZON + 14, END.jam, 120, 735, 1.4)} className="fill-road" />
      <rect x="40" y={HORIZON + 14} width={END.jam} height="120" fill="url(#riso-speck)" opacity="0.3" />
      <path d={`M40 ${HORIZON + 70}H${END.jam}`} className="stroke-wall-lit" strokeWidth={STROKE.hair} fill="none" strokeDasharray="30 22" {...hairNS} opacity="0.3" />
      {low ? items.filter((_, k) => k % 2 === 0) : items}
      <g>
        <path d={wobbleRect(bx + 4, HORIZON + 26, 320, 58, 790, 1.4)} className="fill-accent" opacity="0.5" />
        <path d={wobbleRect(bx, HORIZON + 22, 320, 58, 791, 1.4)} className="fill-(--bus-b)" />
        <path d={`M${bx + 12} ${HORIZON + 30}v42M${bx + 70} ${HORIZON + 30}v42M${bx + 130} ${HORIZON + 30}v42M${bx + 190} ${HORIZON + 30}v42M${bx + 250} ${HORIZON + 30}v42M${bx + 308} ${HORIZON + 30}v42`} className="stroke-ink" strokeWidth={STROKE.hair} fill="none" {...hairNS} opacity="0.4" />
        <path d={wobbleRect(bx + 20, HORIZON + 8, 110, 14, 792, 0.8)} className="fill-ink" opacity="0.75" />
        <path d={wobbleRect(bx + 150, HORIZON + 10, 70, 12, 793, 0.8)} className="fill-ink" opacity="0.65" />
        <path d={wobbleRect(bx + 232, HORIZON + 34, 70, 26, 794, 0.8)} className="fill-paper" opacity="0.85" />
      </g>
    </g>
  );
}

function NearPane({ low }: { low: boolean }) {
  const rnd = rng(751);
  const poles: React.ReactNode[] = [];
  const wires: string[] = [];
  let x = 140;
  let prev: number | null = null;
  let i = 0;
  while (x < END.near) {
    const sag = 30 + rnd() * 16;
    poles.push(
      <g key={i}>
        <path d={ribbon([[x, WIN_Y1 + 20, 13], [x + 1, 480, 10], [x, 300, 8]])} className="fill-ink" />
        <path d={wobbleRect(x - 34, 322, 68, 7, 760 + i, 0.5)} className="fill-ink" />
        <path d={wobbleRect(x - 24, 350, 48, 6, 780 + i, 0.5)} className="fill-ink" />
      </g>,
    );
    if (prev !== null) wires.push(curve([[prev, 326], [(prev + x) / 2, 326 + sag], [x, 326]]), curve([[prev - 30, 326], [(prev + x) / 2, 332 + sag], [x - 30, 326]]), curve([[prev + 22, 353], [(prev + x) / 2, 357 + sag], [x + 22, 353]]));
    prev = x;
    x += 520 + rnd() * 260;
    i++;
  }
  const trees: React.ReactNode[] = [];
  if (!low) {
    let tx = 560;
    let n = 0;
    while (tx < END.near) {
      const s = 0.8 + rnd() * 0.5;
      trees.push(
        <g key={n}>
          <path d={`M${tx} ${WIN_Y1 + 20}v-140`} className="stroke-ink" strokeWidth={STROKE.bold} fill="none" {...hairNS} opacity="0.8" />
          <path d={blob([[tx - 60 * s, 520], [tx - 46 * s, 470], [tx - 4, 450], [tx + 44 * s, 468], [tx + 62 * s, 520], [tx + 30, 560], [tx - 36, 556]])} className="fill-ink" opacity="0.78" />
        </g>,
      );
      tx += 880 + rnd() * 480;
      n++;
    }
  }
  return (
    <g data-pane="near">
      <path d={wires.join("")} fill="none" className="stroke-ink" strokeWidth={STROKE.hair} {...hairNS} opacity="0.7" />
      {poles}
      {trees}
    </g>
  );
}

/** The window band: the four panes, clipped to the openings. Panes are tween targets (data-pane). */
export function Panes({ low }: { low: boolean }) {
  return (
    <g clipPath="url(#metro-windows)">
      <rect x="-1300" y={WIN_Y0} width="5000" height={WIN.h} className="fill-(--glass-haze)" />
      {!low && <FarPane />}
      <MidPane low={low} />
      <JamPane low={low} />
      {!low && <NearPane low={low} />}
      {/* two static glints on every opening: the glass is there */}
      <path d={WINDOW_CX.map((c) => `M${c - 150} ${WIN_Y1 - 8}L${c - 40} ${WIN_Y0 + 8}M${c - 96} ${WIN_Y1 - 8}L${c - 22} ${WIN_Y0 + 60}`).join("")} className="stroke-(--metro-body)" strokeWidth={STROKE.hair} fill="none" {...hairNS} opacity="0.45" />
    </g>
  );
}

const openings = WINDOW_CX.map((c, i) => octagon(c - WIN.w / 2, WIN_Y0, WIN.w, WIN.h, WIN.r, 800 + i, 1.2));

// ---- the carriage shell ---------------------------------------------------------------------------------

const STRAPS = (() => {
  const xs: number[] = [];
  for (let x = -760; x < 2000; x += 190) if (Math.abs(x - AT.poleA) > 70 && Math.abs(x - AT.poleB) > 70) xs.push(x);
  return xs;
})();

export function InteriorBack({ low }: { low: boolean }) {
  const straps = low ? STRAPS.filter((_, i) => i % 2 === 0) : STRAPS;
  const { seat, seatBot, plinth } = IN;
  const modules: string[] = [];
  for (let x = -900; x < 2050; x += 190) modules.push(`M${x} ${seat - 66}V${seatBot}`);
  return (
    <g>
      <defs>
        <clipPath id="metro-windows">
          {openings.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </clipPath>
      </defs>
      {/* wall, ceiling and its light strips */}
      <rect x="-1400" y="-400" width="5200" height="1500" className="fill-(--cabin)" />
      <rect x="-1400" y="-400" width="5200" height="590" className="fill-(--cabin-dark)" />
      <path d={[-600, 200, 1000, 1800, 2600].map((x, i) => wobbleRect(x, 214, 440, 12, 810 + i, 0.8)).join("")} className="fill-paper" opacity="0.85" />
      <rect x="-1400" y={WIN_Y0 - 48} width="5200" height="40" fill="url(#riso-dots)" opacity="0.1" />

      {/* window band */}
      <Panes low={low} />
      {openings.map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" className="stroke-(--cabin-deep)" strokeWidth={STROKE.bold} strokeLinejoin="round" {...hairNS} />
          <path d={d} fill="none" className="stroke-(--metro-body)" strokeWidth={STROKE.hair} {...hairNS} opacity="0.7" transform="translate(0 0)" />
        </g>
      ))}
      <rect x="-1400" y={WIN_Y1 + 6} width="5200" height="26" className="fill-(--cabin-dark)" />
      <path d={`M-1400 ${WIN_Y1 + 6}H3800`} className="stroke-(--cabin-deep)" strokeWidth={STROKE.line} fill="none" {...hairNS} opacity="0.7" />

      <Doors />

      {/* seat backs, cushions and plinth, in modules; the door bay is clear */}
      <path d={wobbleRect(-900, seat - 66, 2950, 66 + 4, 820, 1.4)} className="fill-(--seat)" />
      <path d={wobbleRect(-900, seat - 4, 2950, seatBot - seat + 4, 821, 1.2)} className="fill-(--seat-dark)" />
      <path d={wobbleRect(-900, seat - 4, 2950, 12, 822, 0.8)} className="fill-(--seat)" />
      <rect x="-900" y={seat - 66} width="2950" height="70" fill="url(#riso-dots)" opacity="0.1" />
      <path d={modules.join("")} className="stroke-ink" strokeWidth={STROKE.hair} fill="none" {...hairNS} opacity="0.3" />
      <path d={wobbleRect(-900, seatBot, 2950, plinth - seatBot, 823, 1)} className="fill-(--cabin-deep)" />

      {/* floor and the yellow line at the door bay */}
      <path d={wobbleRect(-1400, plinth, 5200, 400, 830, 1.4)} className="fill-(--floor)" />
      <rect x="-1400" y={plinth} width="5200" height="400" fill="url(#riso-speck)" opacity="0.28" />
      <path d={`M-1400 ${plinth + 40}H3800M-1000 ${plinth}l-60 120M-300 ${plinth}l-40 120M500 ${plinth}l-20 120M1300 ${plinth}l0 120M2100 ${plinth}l20 120`} className="stroke-ink" strokeWidth={STROKE.hair} fill="none" {...hairNS} opacity="0.16" />
      <path d={wobbleRect(2060, plinth + 14, 680, 14, 831, 0.8)} className="fill-(--metro-edge)" />

      {/* handrail, straps (each sways on its own), the stanchion by the father */}
      <rect x="-1400" y={IN.rail - 5} width="5200" height="10" className="fill-(--cabin-deep)" />
      <path d={`M-1400 ${IN.rail - 2}H3800`} className="stroke-(--metro-body)" strokeWidth={STROKE.hair} fill="none" {...hairNS} opacity="0.55" />
      {straps.map((x, i) => (
        <g key={x} className={`loop ${m.strap}`} style={{ animationDelay: `${-(i % 5) * 0.7}s` }}>
          <path d={`M${x} ${IN.rail}V366`} className="stroke-(--cabin-deep)" strokeWidth={STROKE.line} fill="none" {...hairNS} />
          <path d={`M${x - 11} 380a11 15 0 1 0 22 0a11 15 0 1 0 -22 0Z`} fill="none" className="stroke-ink" strokeWidth={STROKE.line} {...hairNS} opacity="0.75" />
        </g>
      ))}
      <path d={ribbon([[AT.poleA, IN.rail, 10], [AT.poleA, IN.feet, 10]])} className="fill-(--cabin-deep)" />
      <path d={`M${AT.poleA - 2} ${IN.rail + 10}V${IN.feet - 10}`} className="stroke-(--metro-body)" strokeWidth={STROKE.hair} fill="none" {...hairNS} opacity="0.7" />

      {/* AC vent over the commuter: slits and a few dotted breaths of air onto his neck */}
      <path d={wobbleRect(AT.commuter - 100, 164, 200, 28, 840, 1)} className="fill-(--cabin-deep)" />
      <path d={[0, 1, 2, 3, 4].map((k) => `M${AT.commuter - 80 + k * 40} 172v12`).join("")} className="stroke-(--cabin)" strokeWidth={STROKE.line} fill="none" {...hairNS} />
      <g className={`loop ${m.vent} stroke-(--cabin-deep)`} fill="none" strokeLinecap="round" strokeDasharray="1 11">
        {[-50, 0, 50].map((dx, k) => (
          <path key={k} d={curve([[AT.commuter + dx, 200], [AT.commuter + dx * 0.7 + (k - 1) * 10, 340], [AT.commuter + dx * 0.2, 470], [AT.commuter + dx * 0.05, 560]])} strokeWidth={4} {...hairNS} />
        ))}
      </g>

      {/* the ceiling route display: a light printed panel, ink dots, the next stop lit in amber. The announcement text is DOM over it. */}
      <g>
        <path d={wobbleRect(AT.walker + 207, 104, 760, 100, 851, 1.2)} className="fill-accent" opacity="0.5" />
        <path d={wobbleRect(AT.walker + 205, 100, 760, 100, 850, 1.2)} className="fill-(--housing)" />
        <path d={wobbleRect(AT.walker + 213, 108, 744, 84, 852, 0.8)} fill="none" className="stroke-(--cabin-deep)" strokeWidth={STROKE.hair} {...hairNS} opacity="0.7" />
        <path d={`M${AT.walker + 250} 186H${AT.walker + 920}`} className="stroke-(--led)" strokeWidth={STROKE.line} fill="none" {...hairNS} opacity="0.45" />
        {[0, 1, 2, 3, 4, 5, 6].map((k) => {
          const dx = AT.walker + 250 + k * 111;
          const next = k === 4;
          return next ? (
            <g key={k}>
              <circle cx={dx} cy="186" r="10" className="fill-(--metro-edge)" />
              <circle cx={dx} cy="186" r="10" fill="none" className="stroke-(--led)" strokeWidth={STROKE.hair} {...hairNS} />
              <circle cx={dx} cy="186" r="18" fill="none" className={`stroke-(--led) loop ${m.blink}`} strokeWidth={STROKE.line} {...hairNS} />
            </g>
          ) : (
            <circle key={k} cx={dx} cy="186" r="6" className="fill-(--led)" opacity={k < 4 ? 0.85 : 0.4} />
          );
        })}
      </g>
    </g>
  );
}

/** Drawn over the passengers: the stanchion the mother holds. */
export function InteriorFront() {
  return (
    <g>
      <path d={ribbon([[AT.poleB, IN.rail, 11], [AT.poleB, IN.feet, 11]])} className="fill-(--cabin-deep)" />
      <path d={`M${AT.poleB - 2.5} ${IN.rail + 10}V${IN.feet - 10}`} className="stroke-(--metro-body)" strokeWidth={STROKE.hair} fill="none" {...hairNS} opacity="0.7" />
    </g>
  );
}

// ---- the door bay (opens at the end; light floods) ---------------------------------------------------------
const DX = AT.door;
export function Doors() {
  const top = 236;
  const bot = IN.plinth;
  const leaf = (x: number, seed: number) => (
    <g>
      <path d={wobbleRect(x, top, 250, bot - top, seed, 1.2)} className="fill-(--cabin)" />
      <path d={octagon(x + 62, top + 100, 126, 170, 22, seed + 1, 1)} className="fill-(--glass)" />
      <path d={octagon(x + 62, top + 100, 126, 170, 22, seed + 1, 1)} fill="none" className="stroke-(--cabin-deep)" strokeWidth={STROKE.line} {...hairNS} />
      <path d={wobbleRect(x, bot - 70, 250, 14, seed + 2, 0.6)} className="fill-(--metro-edge)" />
      <rect x={x} y={top} width="250" height={bot - top} fill="url(#riso-dots)" opacity="0.07" />
    </g>
  );
  return (
    <g>
      {/* the light outside, behind the leaves */}
      <g data-glare opacity="0" style={{ visibility: "hidden" }}>
        <rect x={DX - 250} y={top} width="500" height={bot - top} fill="var(--glare)" />
        <rect x={DX - 250} y={top} width="500" height={bot - top} fill="url(#riso-glow)" opacity="0.35" />
        <path d={`M${DX - 250} ${bot - 30}H${DX + 250}`} className="stroke-ink" strokeWidth={STROKE.hair} fill="none" {...hairNS} opacity="0.2" />
      </g>
      <g data-door="l">{leaf(DX - 250, 860)}</g>
      <g data-door="r">{leaf(DX, 870)}</g>
      <path d={`M${DX} ${top}V${bot}`} className="stroke-ink" strokeWidth={STROKE.hair} fill="none" {...hairNS} opacity="0.5" />
      {/* the wall pockets the leaves slide behind */}
      <path d={wobbleRect(DX - 410, top - 4, 160, bot - top + 8, 880, 1.2)} className="fill-(--cabin)" />
      <path d={wobbleRect(DX + 250, top - 4, 160, bot - top + 8, 881, 1.2)} className="fill-(--cabin)" />
      <path d={wobbleRect(DX - 262, top - 12, 524, 12, 882, 0.8)} className="fill-(--cabin-dark)" />
      <path d={`M${DX - 256} ${top - 4}H${DX + 256}`} className="stroke-(--cabin-deep)" strokeWidth={STROKE.bold} {...hairNS} fill="none" />
    </g>
  );
}

