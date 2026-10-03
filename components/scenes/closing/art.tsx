import { STROKE, blob, r1, rng, wobblePoly, wobbleRect, type V2 } from "../tong/geometry";

/*
  Scene 8 night pieces, in the tong set's print language: flat tokened fills, hand-cut wobble edges,
  halftone for light, STROKE weights, no filters, no hex. Data hooks the scene scrubs: data-lamp (the one
  bulb's light, all of it), data-coin, data-tin-fill, data-lid, data-phone-glow.
*/

const GROUND = 860;
export const BULB_AT: V2 = [880, 512]; // the same point as TongStall's own bulb (it hangs from the same beam)

// ---- the sleeping skyline: the far city, carried the whole way across for the pull-back ----------------

const SPAN: readonly [number, number] = [-760, 2600];

interface Block { x: number; w: number; top: number; step: number; tank: boolean; head: boolean; lamp: number | null }

/** Blocks laid left to right with a seeded rhythm: varied widths and heights, some stepped roofs, tanks and
 *  stair head-rooms, a few with a faint window grid. `gap` > 0 leaves lanes of sky between blocks. */
function row(seed: number, from: number, to: number, w: readonly [number, number], top: readonly [number, number], gap: number): Block[] {
  const rnd = rng(seed);
  const out: Block[] = [];
  for (let x = from; x < to; ) {
    const bw = w[0] + rnd() * (w[1] - w[0]);
    out.push({ x, w: bw, top: top[0] + rnd() * (top[1] - top[0]), step: rnd() > 0.7 ? 26 + rnd() * 30 : 0, tank: rnd() > 0.6, head: rnd() > 0.72, lamp: rnd() > 0.93 ? 24 + rnd() * 80 : null });
    x += bw + gap * rnd();
  }
  return out;
}

function Roofs({ blocks, seed, grid }: { blocks: Block[]; seed: number; grid: boolean }) {
  return (
    <>
      {blocks.map((b, i) => (
        <g key={i}>
          <path
            d={b.step ? wobblePoly([[b.x, GROUND], [b.x, b.top], [b.x + b.w * 0.55, b.top], [b.x + b.w * 0.55, b.top - b.step], [b.x + b.w, b.top - b.step], [b.x + b.w, GROUND]], seed + i, 1.4) : wobbleRect(b.x, b.top, b.w, GROUND - b.top, seed + i, 1.4)}
          />
          {b.tank ? <rect x={r1(b.x + b.w * 0.18)} y={r1(b.top - 20)} width="24" height="20" rx="5" /> : null}
          {b.head ? <rect x={r1(b.x + b.w * 0.62)} y={r1(b.top - b.step - 18)} width="22" height="18" /> : null}
          {grid ? <rect x={r1(b.x + 8)} y={r1(b.top + 14)} width={r1(b.w - 16)} height={r1(Math.min(150, GROUND - b.top - 30))} fill="url(#riso-fine)" opacity="0.1" className="fill-ink" /> : null}
        </g>
      ))}
    </>
  );
}

/** The far city, in two layers, with a pair of minarets and a few windows still lit far off (the people who
 *  are awake). Plus the ground, carried on both ways. It adds depth to the set early on, and it is NOT
 *  dimmed with the set at the end: it is the sleeping skyline the pull-back reveals. */
export function SleepingSkyline({ low }: { low: boolean }) {
  const far = row(88, SPAN[0], SPAN[1], [60, 120], [360, 600], 6);
  const near = low ? [] : row(91, SPAN[0], SPAN[1], [110, 190], [610, 720], 18);
  return (
    <g data-skyline>
      <rect x="-1900" y={GROUND} width="5400" height={900 - GROUND + 260} className="fill-road" />
      <rect x="-1900" y={GROUND} width="5400" height="5" className="fill-ink" opacity="0.4" />
      <g className="fill-far">
        <Roofs blocks={far} seed={400} grid={false} />
      </g>
      <g className="fill-minaret">
        {[-140, 1720].map((cx) => (
          <g key={cx}>
            <path d={`M${cx - 9} ${GROUND}V${GROUND - 420}H${cx + 9}V${GROUND}Z`} />
            <path d={`M${cx - 14} ${GROUND - 420}H${cx + 14}V${GROUND - 412}H${cx - 14}Z`} />
            <path d={blob([[cx - 12, GROUND - 420], [cx - 8, GROUND - 446], [cx, GROUND - 466], [cx + 8, GROUND - 446], [cx + 12, GROUND - 420]])} />
            <path d={`M${cx - 1.5} ${GROUND - 466}V${GROUND - 488}h3V${GROUND - 466}Z`} />
          </g>
        ))}
      </g>
      <g className="fill-wall-dark">
        <Roofs blocks={near} seed={500} grid />
      </g>
      {/* a few windows still lit, far off (kept out of the middle, where the closing line sits) */}
      <g data-far-lights className="fill-glow">
        {[...far, ...near].filter((b) => b.lamp !== null && Math.abs(b.x + b.w * 0.4 - 920) > 420).map((b, i) => (
          <rect key={i} x={r1(b.x + b.w * 0.4)} y={r1(b.top + (b.lamp ?? 0))} width="7" height="10" opacity={i % 2 ? 0.45 : 0.75} />
        ))}
      </g>
    </g>
  );
}

// ---- the one bulb --------------------------------------------------------------------------------

/** The bulb's printed light: a halftone ring, stepped flat discs, and a pool on the counter below it.
 *  Everything here is `data-lamp`, so the scene switches the whole light off with one fade. */
export function LampLight({ low }: { low: boolean }) {
  const [x, y] = BULB_AT;
  return (
    <g data-lamp pointerEvents="none">
      {low ? null : <circle cx={x} cy={y + 14} r="170" fill="url(#riso-glow)" opacity="0.2" />}
      <circle cx={x} cy={y + 14} r="120" className="fill-glow" opacity="0.07" />
      <circle cx={x} cy={y + 14} r="72" className="fill-glow" opacity="0.12" />
      <circle cx={x} cy={y + 14} r="38" className="fill-glow" opacity="0.2" />
      {/* the counter takes the light: a warm pool and its halftone edge */}
      <path d={wobblePoly([[700, 640], [1040, 640], [1062, 730], [680, 730]], 411, 1.4)} className="fill-glow" opacity="0.1" />
      <ellipse cx="900" cy="716" rx="150" ry="14" fill="url(#riso-glow)" opacity="0.5" />
    </g>
  );
}

/** The bulb itself, hung in front of the shutter from the awning's header (the lit glass is `data-lamp`). */
export function FrontBulb() {
  const [x, y] = BULB_AT;
  return (
    <g>
      <path d={`M${x} 490V${y - 12}`} className="stroke-ink" strokeWidth={STROKE.hair} />
      <rect x={x - 4} y={y - 14} width="8" height="9" className="fill-ink" />
      <circle cx={x} cy={y} r="13" className="fill-wall-lit" />
      <g data-lamp>
        <circle cx={x} cy={y} r="13" className="fill-glow" />
        <circle cx={x - 4} cy={y - 4} r="3" className="fill-paper" opacity="0.8" />
      </g>
      <path d={`M${x - 4} ${y + 2}q4 -7 8 0`} fill="none" className="stroke-ink" strokeWidth="1.4" opacity="0.5" />
    </g>
  );
}

// ---- the day's takings ---------------------------------------------------------------------------

export const TIN_AT: V2 = [969, 702]; // inside the 390px crop at the camera's closest // the mouth of the tin, where each coin lands
export const COIN_PILE: readonly V2[] = [[910, 718.4], [918, 718.4], [926, 718.4], [914, 715], [922, 715], [918, 711.6]];

function Coin({ at }: { at: V2 }) {
  return (
    <g data-coin>
      <ellipse cx={at[0]} cy={at[1]} rx="7" ry="3" className="fill-glow" />
      <path d={`M${at[0] - 5} ${at[1] - 0.6}Q${at[0]} ${at[1] - 2.6} ${at[0] + 5} ${at[1] - 0.6}`} fill="none" className="stroke-paper" strokeWidth="0.9" opacity="0.7" />
    </g>
  );
}

/** A round steel tin on the counter (where the tea glasses stood), its mouth filling as coins land, and a
 *  lid that comes down at the end. The pile is what Mama counts. */
export function TinAndCoins({ coins }: { coins: number }) {
  const [tx, ty] = TIN_AT;
  return (
    <g>
      <path d={wobbleRect(tx - 21, ty - 2, 42, 24, 421, 0.8)} className="fill-wall-lit" />
      <path d={`M${tx - 21} ${ty + 6}H${tx + 21}`} className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.4" />
      <path d={`M${tx - 18} ${ty + 17}H${tx + 18}`} className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.3" />
      <ellipse cx={tx} cy={ty - 1} rx="21" ry="5.4" className="fill-ink" opacity="0.85" />
      <ellipse data-tin-fill cx={tx} cy={ty - 1} rx="17" ry="3.6" className="fill-glow" opacity="0" />
      <g data-lid opacity="0">
        <ellipse cx={tx} cy={ty - 2} rx="22.5" ry="6" className="fill-wall-lit" />
        <ellipse cx={tx} cy={ty - 2} rx="22.5" ry="6" fill="none" className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.45" />
        <circle cx={tx} cy={ty - 4} r="2.2" className="fill-ink" opacity="0.6" />
      </g>
      {/* the steel plate the day's coins are counted out on */}
      <ellipse cx="918" cy="722.5" rx="25" ry="4" className="fill-ink" opacity="0.5" />
      <ellipse cx="918" cy="720.5" rx="25" ry="4" className="fill-wall-lit" />
      {COIN_PILE.slice(0, coins).map((at, i) => (
        <Coin key={i} at={at} />
      ))}
    </g>
  );
}

// ---- the last light --------------------------------------------------------------------------------

/** The phone's light, spilling toward the face from the phone at `at` (art units): three stepped flat discs
 *  (the lamp's halftone ring would only speckle his face). Offset to the face side (Mama faces left). */
export function PhoneGlow({ at }: { at: V2 }) {
  const [x, y] = [at[0] - 9, at[1] + 5];
  return (
    <g data-phone-glow pointerEvents="none">
      <circle cx={x} cy={y} r="30" className="fill-glow" opacity="0.1" />
      <circle cx={x} cy={y} r="19" className="fill-glow" opacity="0.16" />
      <circle cx={x} cy={y} r="9" className="fill-glow" opacity="0.3" />
    </g>
  );
}
