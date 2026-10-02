import { STROKE, blob, r1, rng, wobblePoly, wobbleRect, type V2 } from "../tong/geometry";

/*
  Scene 8 night pieces, in the tong set's print language: flat tokened fills, hand-cut wobble edges,
  halftone for light, STROKE weights, no filters, no hex. Data hooks the scene scrubs: data-lamp (the one
  bulb's light, all of it), data-coin, data-tin-fill, data-lid, data-phone-glow.
*/

const GROUND = 860;
export const BULB_AT: V2 = [880, 512]; // the same point as TongStall's own bulb (it hangs from the same beam)

// ---- the sleeping skyline: the far city, extended either side so the pull-back never runs out of it ----

const SPAN = [[-1800, -290], [1880, 3400]] as const;

/** More of the far skyline (same `fill-far` as the backdrop's), a pair of far minarets, tanks, and a few
 *  lit windows far off: the people who are still awake. Plus the ground, carried on both ways. */
export function SleepingSkyline({ low }: { low: boolean }) {
  const rnd = rng(88);
  const blocks: { x: number; w: number; top: number; tank: boolean; lamp: number | null }[] = [];
  SPAN.forEach(([from, to]) => {
    for (let x = from; x < to; ) {
      const w = 70 + rnd() * 90;
      // blocks are laid on a 60-unit step on low tier: half as many shapes
      blocks.push({ x, w, top: 470 + rnd() * 170, tank: rnd() > 0.62, lamp: rnd() > 0.93 ? 30 + rnd() * 70 : null });
      x += w + (low ? 56 : 8 + rnd() * 20);
    }
  });
  const minarets = [-760, 2360];
  return (
    <g data-skyline>
      <rect x="-1900" y={GROUND} width="5400" height={900 - GROUND + 260} className="fill-road" />
      <rect x="-1900" y={GROUND} width="5400" height="5" className="fill-ink" opacity="0.4" />
      <g className="fill-far">
        {blocks.map((b, i) => (
          <g key={i}>
            <path d={wobbleRect(b.x, b.top, b.w, GROUND - b.top, 400 + i, 1.5)} />
            {b.tank ? <rect x={b.x + b.w * 0.35} y={b.top - 20} width="22" height="20" rx="5" /> : null}
          </g>
        ))}
      </g>
      <g className="fill-minaret">
        {minarets.map((cx) => (
          <g key={cx}>
            <path d={`M${cx - 9} ${GROUND}V${GROUND - 330}H${cx + 9}V${GROUND}Z`} />
            <path d={`M${cx - 14} ${GROUND - 330}H${cx + 14}V${GROUND - 322}H${cx - 14}Z`} />
            <path d={blob([[cx - 12, GROUND - 330], [cx - 8, GROUND - 356], [cx, GROUND - 376], [cx + 8, GROUND - 356], [cx + 12, GROUND - 330]])} />
            <path d={`M${cx - 1.5} ${GROUND - 376}V${GROUND - 396}h3V${GROUND - 376}Z`} />
          </g>
        ))}
      </g>
      {/* a few windows still lit, far away (one is the dim kind: a TV, a night shift, a reader) */}
      <g data-far-lights className="fill-glow">
        {blocks.filter((b) => b.lamp !== null).map((b, i) => (
          <rect key={i} x={r1(b.x + b.w * 0.4)} y={r1(b.top + (b.lamp ?? 0))} width="6" height="8" opacity={i % 2 ? 0.45 : 0.7} />
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
      {low ? null : <circle cx={x} cy={y + 14} r="230" fill="url(#riso-glow)" opacity="0.32" />}
      <circle cx={x} cy={y + 14} r="150" className="fill-glow" opacity="0.1" />
      <circle cx={x} cy={y + 14} r="88" className="fill-glow" opacity="0.16" />
      <circle cx={x} cy={y + 14} r="46" className="fill-glow" opacity="0.26" />
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

export const TIN_AT: V2 = [980, 702]; // the mouth of the tin, where each coin lands
export const COIN_PILE: readonly V2[] = [[934, 718], [942, 718], [950, 718], [938, 714.6], [946, 714.6], [942, 711.2]];

function Coin({ at }: { at: V2 }) {
  return (
    <g data-coin>
      <ellipse cx={at[0]} cy={at[1]} rx="6" ry="2.6" className="fill-glow" />
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
      <path d={wobbleRect(tx - 20, ty - 2, 40, 24, 421, 0.8)} className="fill-wall-lit" />
      <path d={`M${tx - 20} ${ty + 6}H${tx + 20}`} className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.4" />
      <path d={`M${tx - 17} ${ty + 17}H${tx + 17}`} className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.3" />
      <ellipse cx={tx} cy={ty - 1} rx="20" ry="5.4" className="fill-ink" opacity="0.85" />
      <ellipse data-tin-fill cx={tx} cy={ty - 1} rx="16" ry="3.6" className="fill-glow" opacity="0" />
      <g data-lid opacity="0">
        <ellipse cx={tx} cy={ty - 2} rx="21.5" ry="6" className="fill-wall-lit" />
        <ellipse cx={tx} cy={ty - 2} rx="21.5" ry="6" fill="none" className="stroke-ink" strokeWidth={STROKE.hair} opacity="0.45" />
        <circle cx={tx} cy={ty - 4} r="2.2" className="fill-ink" opacity="0.6" />
      </g>
      {COIN_PILE.slice(0, coins).map((at, i) => (
        <Coin key={i} at={at} />
      ))}
    </g>
  );
}

// ---- the last light --------------------------------------------------------------------------------

/** The phone's glow around the screen at `at` (art units): a halftone ring and two flat discs. */
export function PhoneGlow({ at, low }: { at: V2; low: boolean }) {
  return (
    <g data-phone-glow pointerEvents="none">
      {low ? null : <circle cx={at[0]} cy={at[1]} r="52" fill="url(#riso-glow)" opacity="0.5" />}
      <circle cx={at[0]} cy={at[1]} r="30" className="fill-glow" opacity="0.16" />
      <circle cx={at[0]} cy={at[1]} r="15" className="fill-glow" opacity="0.3" />
    </g>
  );
}
