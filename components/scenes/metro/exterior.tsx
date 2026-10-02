import { STROKE, blob, curve, r1, rng, wobblePoly, wobbleRect } from "../tong/geometry";
import { EXT, WIN } from "./layout";
import { octagon } from "./shapes";
import m from "./metro.module.css";

/*
  Scene 4 exterior (1600x900 art units, bottom-anchored like every scene). Layers, back to front:
  far skyline (haze) < mid blocks < the viaduct on its piers + catenary < the jammed road under it <
  the train. Everything is a tokened flat with hand-cut edges, halftone shade and a few paper specks;
  hair strokes are non-scaling because the camera pushes x5 into the hero window.
  Hooks: data-world=far|mid|via (the camera-follow drift), data-horn (street noise that ducks),
  data-train, data-hero (the hero window's pale glass), data-chime.
*/

// ---- far skyline: one silhouette path ------------------------------------------------------------
const FAR_PATH = (() => {
  const rnd = rng(401);
  const pts: [number, number][] = [[-900, 900]];
  let x = -900;
  while (x < 2500) {
    const w = 60 + rnd() * 70;
    const top = rnd() < 0.2 ? 280 + rnd() * 70 : 430 + rnd() * 230;
    pts.push([x, top], [x + w, top]);
    x += w;
  }
  pts.push([x, 900]);
  return `M${pts.map(([a, b]) => `${r1(a)} ${r1(b)}`).join("L")}Z`;
})();

// a minaret in the haze: the Dhaka skyline always has one
const MINARET = "M1296 700V400h-10l-8 -20c0 -16 18 -26 22 -48c4 22 22 32 22 48l-8 20h-10v300Z";

// ---- mid blocks: [x, width, top, tank] ----------------------------------------------------------------
const MID: readonly (readonly [number, number, number, boolean])[] = [
  [-620, 150, 600, true], [-440, 120, 650, false], [-300, 170, 590, false], [-110, 130, 640, true], [60, 120, 660, false], [230, 160, 610, true], [420, 110, 650, false],
  [800, 130, 645, false], [960, 170, 600, true], [1150, 120, 655, false], [1300, 150, 615, false], [1480, 140, 650, true], [1660, 160, 600, false], [1850, 120, 645, true],
];

export function Skyline({ low }: { low: boolean }) {
  const rnd = rng(417);
  return (
    <>
      {!low && (
        <g data-world="far">
          <path d={FAR_PATH} className="fill-far" />
          <path d={MINARET} className="fill-far" />
          <path d={MINARET} className="fill-ink" opacity="0.08" />
        </g>
      )}
      <g data-world="mid">
        {MID.map(([x, w, top, tank], i) => {
          const rows = Math.floor((818 - top) / 30);
          const cols = Math.floor((w - 20) / 22);
          const win: string[] = [];
          for (let r = 0; r < Math.min(rows, 6); r++) for (let c = 0; c < cols; c++) if (rnd() > 0.2) win.push(`M${x + 12 + c * 22} ${top + 16 + r * 28}h10v14h-10Z`);
          return (
            <g key={i}>
              <path d={wobbleRect(x, top, w, 818 - top, 410 + i, 1.5)} className="fill-wall-dark" />
              <path d={win.join("")} className="fill-ink" opacity="0.28" />
              <rect x={x} y={top} width={w} height={818 - top} fill="url(#riso-speck)" opacity="0.3" />
              {false && tank ? (
                <g className="fill-wall-dark">
                  <path d={`M${x + w * 0.3} ${top}v-14h${w * 0.3}v14Z`} />
                  <path d={blob([[x + w * 0.28, top - 14], [x + w * 0.3, top - 34], [x + w * 0.45, top - 40], [x + w * 0.6, top - 34], [x + w * 0.62, top - 14]])} />
                </g>
              ) : null}
            </g>
          );
        })}
      </g>
    </>
  );
}

// ---- viaduct, piers, catenary --------------------------------------------------------------------------
const PIERS = [-480, 160, 800, 1440, 2080];

export function Viaduct() {
  const { deckTop, deckBot, roadTop } = EXT;
  return (
    <g data-world="via">
      {/* overhead line: a mast on every pier, one contact wire */}
      <g fill="none" className="stroke-ink" strokeLinecap="round" vectorEffect="non-scaling-stroke">
        {PIERS.map((c) => (
          <path key={c} d={`M${c + 36} ${deckTop}V318h-34`} strokeWidth={STROKE.line} vectorEffect="non-scaling-stroke" opacity="0.8" />
        ))}
        <path d={curve([[-900, 330], [-480, 336], [160, 330], [800, 336], [1440, 330], [2080, 336], [2700, 330]])} strokeWidth={STROKE.hair} vectorEffect="non-scaling-stroke" opacity="0.7" />
      </g>
      {/* piers: hammerhead cap on a tapered stem, half in halftone shade */}
      {PIERS.map((c, i) => (
        <g key={c}>
          <path d={wobblePoly([[c - 86, deckBot], [c + 86, deckBot], [c + 70, deckBot + 26], [c + 34, deckBot + 36], [c + 40, roadTop + 6], [c - 40, roadTop + 6], [c - 34, deckBot + 36], [c - 70, deckBot + 26]], 430 + i, 1.4)} className="fill-wall" />
          <path d={`M${c + 2} ${deckBot + 4}H${c + 70}L${c + 34} ${deckBot + 36}L${c + 40} ${roadTop + 6}H${c + 2}Z`} fill="url(#riso-dots)" opacity="0.45" />
          <path d={`M${c - 12} ${deckBot + 50}v${roadTop - deckBot - 70}`} className="stroke-ink" strokeWidth={STROKE.hair} vectorEffect="non-scaling-stroke" opacity="0.16" fill="none" />
        </g>
      ))}
      {/* deck: parapet, girder with its offset second plate, expansion joints, mildew */}
      <path d={wobbleRect(-1400, deckTop - 4, 4400, deckBot - deckTop + 4, 440, 1.4)} className="fill-accent" transform="translate(3 -2)" opacity="0.75" />
      <path d={wobbleRect(-1400, deckTop, 4400, deckBot - deckTop, 441, 1.6)} className="fill-wall" />
      <rect x="-1400" y={deckTop} width="4400" height={deckBot - deckTop} fill="url(#riso-speck)" opacity="0.35" />
      <path d={wobbleRect(-1400, deckTop - 10, 4400, 12, 442, 1)} className="fill-wall-dark" />
      <path d={PIERS.map((c) => `M${c} ${deckTop}v${deckBot - deckTop}`).join("")} className="stroke-ink" strokeWidth={STROKE.hair} vectorEffect="non-scaling-stroke" opacity="0.25" fill="none" />
      <path d={PIERS.map((c) => `M${c + 120} ${deckBot - 4}l8 16l-6 14`).join("")} className="stroke-ink" strokeWidth={STROKE.hair} vectorEffect="non-scaling-stroke" opacity="0.2" fill="none" />
    </g>
  );
}

// ---- the jammed road under it: small flat vehicles, bumper to bumper ---------------------------------------
type Kind = "bus" | "cng" | "rick" | "car";
const BUS_FILL = ["fill-(--bus-a)", "fill-(--bus-b)", "fill-(--bus-c)", "fill-(--bus-e)"] as const;

function Vehicle({ kind, x, base, i, k = 1 }: { kind: Kind; x: number; base: number; i: number; k?: number }) {
  const t = (n: number) => r1(n * k);
  if (kind === "bus") {
    const w = t(176);
    const top = base - t(60);
    return (
      <g>
        <path d={wobbleRect(x, top, w, t(50), 500 + i, 1.2)} className={BUS_FILL[i % BUS_FILL.length]} />
        <path d={wobbleRect(x + t(8), top + t(8), w - t(16), t(15), 520 + i, 0.8)} className="fill-paper" opacity="0.9" />
        <path d={`M${x + t(8)} ${top + t(34)}H${x + w - t(8)}`} className="stroke-ink" strokeWidth={STROKE.hair} vectorEffect="non-scaling-stroke" opacity="0.5" fill="none" />
        <path d={`M${x + t(20)} ${top - 5}h${t(60)}M${x + t(100)} ${top - 5}h${t(44)}`} className="stroke-ink" strokeWidth={STROKE.line} vectorEffect="non-scaling-stroke" opacity="0.7" fill="none" />
        {[t(34), t(138)].map((cx) => (
          <g key={cx}>
            <circle cx={x + cx} cy={base - t(7)} r={t(11)} className="fill-ink" />
            <circle cx={x + cx} cy={base - t(7)} r={t(4)} className="fill-wall-lit" />
          </g>
        ))}
      </g>
    );
  }
  if (kind === "cng") {
    return (
      <g>
        <path d={wobblePoly([[x, base - t(10)], [x + t(6), base - t(38)], [x + t(24), base - t(48)], [x + t(62), base - t(48)], [x + t(78), base - t(30)], [x + t(80), base - t(10)]], 530 + i, 1)} className="fill-(--bus-d)" />
        <path d={`M${x + t(14)} ${base - t(40)}V${base - t(14)}M${x + t(34)} ${base - t(44)}V${base - t(14)}M${x + t(54)} ${base - t(44)}V${base - t(14)}`} className="stroke-ink" strokeWidth={STROKE.hair} vectorEffect="non-scaling-stroke" opacity="0.55" fill="none" />
        {[t(18), t(64)].map((cx) => (
          <circle key={cx} cx={x + cx} cy={base - t(6)} r={t(8)} className="fill-ink" />
        ))}
      </g>
    );
  }
  if (kind === "rick") {
    return (
      <g>
        <path d={blob([[x, base - t(26)], [x + t(6), base - t(50)], [x + t(30), base - t(54)], [x + t(44), base - t(34)], [x + t(24), base - t(24)]])} className="fill-ink" />
        <path d={wobbleRect(x + t(44), base - t(46), t(26), t(28), 540 + i, 0.8)} className="fill-(--rick)" />
        <circle cx={x + t(16)} cy={base - t(12)} r={t(12)} className="fill-ink" />
        <circle cx={x + t(58)} cy={base - t(10)} r={t(10)} className="fill-ink" />
      </g>
    );
  }
  return (
    <g>
      <path d={wobblePoly([[x, base - t(8)], [x + t(6), base - t(24)], [x + t(30), base - t(36)], [x + t(70), base - t(36)], [x + t(92), base - t(22)], [x + t(100), base - t(8)]], 550 + i, 1)} className="fill-ink" opacity="0.92" />
      <path d={`M${x + t(32)} ${base - t(32)}h${t(34)}l${t(10)} ${t(12)}h${-t(54)}Z`} className="fill-paper" opacity="0.8" />
      {[t(22), t(78)].map((cx) => (
        <circle key={cx} cx={x + cx} cy={base - t(7)} r={t(8)} className="fill-ink" />
      ))}
    </g>
  );
}

const FRONT: readonly (readonly [Kind, number])[] = [
  ["bus", -560], ["rick", -360], ["cng", -270], ["bus", -160], ["car", 40], ["bus", 150], ["cng", 340], ["rick", 440], ["bus", 530], ["cng", 730],
  ["bus", 830], ["rick", 1030], ["car", 1110], ["bus", 1230], ["cng", 1430], ["bus", 1530],
];
const REAR: readonly (readonly [Kind, number])[] = [
  ["bus", -480], ["cng", -250], ["bus", -80], ["rick", 160], ["bus", 280], ["cng", 520], ["bus", 640], ["rick", 900], ["bus", 1000], ["cng", 1220], ["bus", 1330], ["cng", 1580],
];

// jagged horn bursts over three vehicles
const HORNS: readonly (readonly [number, number])[] = [[240, 786], [880, 790], [1310, 780]];

export function Road({ low }: { low: boolean }) {
  const { roadTop } = EXT;
  const front = low ? FRONT.filter((_, i) => i % 2 === 0) : FRONT;
  return (
    <g data-world="via">
      <path d={wobbleRect(-1400, roadTop, 4400, 400, 560, 1.6)} className="fill-road" />
      <rect x="-1400" y={roadTop} width="4400" height="400" fill="url(#riso-speck)" opacity="0.35" />
      <path d={`M-1400 ${roadTop + 52}H3000`} className="stroke-wall-lit" strokeWidth={STROKE.hair} vectorEffect="non-scaling-stroke" strokeDasharray="34 26" opacity="0.28" fill="none" />
      {!low && REAR.map(([kind, x], i) => <Vehicle key={`r${i}`} kind={kind} x={x} base={roadTop + 36} i={i + 3} k={0.74} />)}
      {front.map(([kind, x], i) => (
        <Vehicle key={`f${i}`} kind={kind} x={x} base={roadTop + 78} i={i} />
      ))}
      {/* the roar, as marks: horns that the glide ducks out */}
      {HORNS.map(([hx, hy], i) => (
        <g key={i} data-horn transform={`translate(${hx} ${hy})`}>
          <g className={`loop ${m.horn}`} style={{ animationDelay: `${i * 0.23}s` }} fill="none" strokeLinecap="round">
            <path d="M-22 -4l-12 -10M-26 8l-18 0M-22 20l-12 10M22 -4l12 -10M26 8l18 0M22 20l12 10" className="stroke-ink" strokeWidth={STROKE.line} vectorEffect="non-scaling-stroke" />
            <path d="M-8 -22v-14M8 -22v-14" className="stroke-ink" strokeWidth={STROKE.line} vectorEffect="non-scaling-stroke" />
          </g>
        </g>
      ))}
    </g>
  );
}

// ---- the train: white, a red-green stripe, no logo, no lettering ---------------------------------------
// Slots of EXT.slot units: 0 = door, 1-4 = windows, 5 = door. The hero window is slot 3 of the middle car;
// its centre is where the camera pushes in, and it is WIN / PUSH in size so the push lands on the interior aperture.
const SLOT = EXT.slot;
const CAR_X = [220 - (EXT.carLen + EXT.carGap), 220, 220 + (EXT.carLen + EXT.carGap)] as const;
export const HERO_X = CAR_X[1] + 20 + SLOT * 3 + SLOT / 2; // 800

function Car({ x0, idx, low }: { x0: number; idx: number; low: boolean }) {
  const { roof, winH, winW } = EXT;
  const winY = WIN.cy - winH / 2;
  const L = EXT.carLen;
  const body = wobblePoly([[x0, roof + 24], [x0 + 22, roof], [x0 + L - 22, roof], [x0 + L, roof + 24], [x0 + L, EXT.deckTop], [x0, EXT.deckTop]], 600 + idx, 1.2);
  const slots = [0, 1, 2, 3, 4, 5];
  return (
    <g>
      <path d={body} className="fill-accent" transform="translate(3 -2)" opacity="0.8" />
      <path d={body} className="fill-(--metro-body)" />
      {/* roof gear + the shade under it */}
      <path d={wobbleRect(x0 + 40, roof - 10, L - 80, 14, 610 + idx, 0.8)} className="fill-(--cabin-dark)" />
      {[0.22, 0.5, 0.78].map((f) => (
        <path key={f} d={wobbleRect(x0 + L * f - 40, roof - 20, 80, 12, 620 + idx + f * 10, 0.8)} className="fill-(--cabin-deep)" />
      ))}
      <path d={`M${x0 + 8} ${roof + 38}H${x0 + L - 8}`} className="stroke-ink" strokeWidth={STROKE.hair} vectorEffect="non-scaling-stroke" opacity="0.15" fill="none" />
      <rect x={x0} y={roof + 4} width={L} height={winY - roof - 4} fill="url(#riso-dots)" opacity="0.1" />
      {/* the livery stripe, and the skirt over the bogies */}
      <path d={wobbleRect(x0, 552, L, 12, 630 + idx, 0.6)} className="fill-(--metro-stripeA)" />
      <path d={wobbleRect(x0, 566, L, 12, 640 + idx, 0.6)} className="fill-(--metro-stripeB)" />
      <path d={wobbleRect(x0, 582, L, EXT.deckTop - 582, 650 + idx, 0.8)} className="fill-(--cabin-deep)" />
      {slots.map((s) => {
        const sx = x0 + 20 + s * SLOT;
        if (s === 0 || s === 5) {
          return (
            <g key={s}>
              {[sx + 14, sx + 82].map((lx, n) => (
                <g key={lx}>
                  <path d={wobbleRect(lx, 404, 64, 176, 660 + idx * 10 + s + n, 0.8)} className="fill-(--cabin)" />
                  <path d={octagon(lx + 14, winY - 6, 36, 62, 8, 670 + s + n, 0.6)} className="fill-(--glass)" />
                </g>
              ))}
              <path d={`M${sx + 80} 404V580`} className="stroke-ink" strokeWidth={STROKE.hair} vectorEffect="non-scaling-stroke" opacity="0.45" fill="none" />
            </g>
          );
        }
        const wx = sx + (SLOT - winW) / 2;
        const hero = idx === 1 && s === 3;
        return (
          <g key={s} {...(hero ? { id: "metro-hero-window" } : {})}>
            <path d={octagon(wx - 4, winY - 4, winW + 8, winH + 8, 14, 680 + idx * 7 + s, 0.8)} className="fill-(--cabin-dark)" />
            <path d={octagon(wx, winY, winW, winH, 11, 690 + idx * 7 + s, 0.6)} className="fill-(--glass)" />
            {!hero && !low && (s + idx) % 2 === 0 ? (
              <path d={`M${wx + 28} ${winY + winH}v-16c0-14 10-22 22-22s22 8 22 22v16Z`} className="fill-ink" opacity="0.5" />
            ) : null}
            {/* two static glints on the glass */}
            <path d={`M${wx + 10} ${winY + winH - 6}L${wx + 34} ${winY + 6}M${wx + 24} ${winY + winH - 6}L${wx + 42} ${winY + 10}`} className="stroke-(--metro-body)" strokeWidth={STROKE.hair} vectorEffect="non-scaling-stroke" opacity="0.5" fill="none" />
            {hero ? <path data-hero d={octagon(wx, winY, winW, winH, 11, 690 + idx * 7 + s, 0.6)} className="fill-(--glass-haze)" opacity="0" /> : null}
          </g>
        );
      })}
    </g>
  );
}

export function Train({ low }: { low: boolean }) {
  return (
    <g data-train>
      <g className={`loop ${m.hum}`}>
        {CAR_X.map((x0, i) => (
          <Car key={x0} x0={x0} idx={i} low={low} />
        ))}
        {/* couplings between cars */}
        {[1, 2].map((i) => (
          <path key={i} d={`M${CAR_X[i] - EXT.carGap} ${EXT.roof + 70}V${EXT.deckTop - 14}h${EXT.carGap}V${EXT.roof + 70}Z`} className="fill-(--cabin-deep)" />
        ))}
      </g>
    </g>
  );
}

/** the two-note chime: two small arcs over the roof, popped by the timeline */
export function ChimeMarks({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[-22, 22].map((dx, i) => (
        <g key={i} data-chime opacity="0">
          <g fill="none" strokeLinecap="round" className="stroke-ink">
            <path d={`M${dx - 14} 0A18 18 0 0 1 ${dx + 14} 0`} strokeWidth={STROKE.line} vectorEffect="non-scaling-stroke" />
            <path d={`M${dx - 24} 8A30 30 0 0 1 ${dx + 24} 8`} strokeWidth={STROKE.line} vectorEffect="non-scaling-stroke" opacity="0.6" />
          </g>
        </g>
      ))}
    </g>
  );
}

export const TRAIN_START = 1650 - CAR_X[0]; // x offset that puts the leading nose just off the right edge
