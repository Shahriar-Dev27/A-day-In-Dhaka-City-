import { STROKE, blob, r1, ribbon, wobbleRect } from "../tong/geometry";
import { Placed, mamaHand, type CastProps } from "../tong/cast";

/*
  Scene 5 art (1:00 PM): everything the noon adds to the SAME tong set. Flat tokened fills, hand-cut wobble
  edges, halftone for shade. No filters, no gradients. Scene-local colours live in noon.css (token mixes).
  Hooks the timeline drives (data-*): fan, fan-spin, fan-blur, fan-blades, drop.
*/

// ---- the sun and the shade ----------------------------------------------------------------------

/** A white-hot disc with three dotted amber rings (a printed halo): the sky has no other detail at noon. */
export function NoonSun({ cx = 1040, cy = 150 }: { cx?: number; cy?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="40" className="fill-glow" />
      {[[62, 9, 0.5], [92, 13, 0.34], [126, 18, 0.22]].map(([r, gap, o]) => (
        <circle key={r} cx={cx} cy={cy} r={r} fill="none" className="stroke-accent" strokeWidth="3" strokeLinecap="round" strokeDasharray={`0 ${gap}`} opacity={o} />
      ))}
    </g>
  );
}

/**
 * Short hard shadows: the sun is almost overhead, so each shadow is a flat ink wedge hugging its object's
 * base (a halftone penumbra on the awning's), not a long cast. The awning's shadow also darkens the road.
 */
export function GroundShade() {
  return (
    <g className="fill-ink">
      <path d="M596 862H1050L1070 886H614Z" opacity="0.2" />
      <path d="M596 862H1050L1070 886H614Z" fill="url(#riso-dots)" opacity="0.22" transform="translate(0 4)" />
      <path d="M462 862H480L528 880H494Z" opacity="0.22" />
      <path d="M1372 862H1386L1424 878H1392Z" opacity="0.22" />
    </g>
  );
}

/** The awning's shade on the booth's back wall: a flat band under the hem, with a halftone lower edge. */
export function BoothShade() {
  return (
    <g>
      <rect x="648" y="494" width="344" height="40" className="fill-ink" opacity="0.2" />
      <rect x="648" y="534" width="344" height="14" fill="url(#riso-dots)" opacity="0.16" />
    </g>
  );
}

/** The right neighbour's shop at noon: shutter half down, the opening dark, its sign gone dim. */
export function NoonNeighbour() {
  return (
    <g>
      <rect x="1230" y="728" width="236" height="62" className="fill-ink" opacity="0.3" />
      <rect x="1214" y="790" width="268" height="70" className="fill-ink" opacity="0.5" />
      <path d={wobbleRect(1214, 790, 268, 38, 91, 1.2)} className="fill-wall-dark" />
      <path d={Array.from({ length: 4 }, (_, i) => `M1214 ${796 + i * 9}H1482`).join("")} className="stroke-ink" strokeWidth="1.6" opacity="0.35" fill="none" />
      <rect x="1214" y="824" width="268" height="6" className="fill-ink" opacity="0.7" />
    </g>
  );
}

// ---- the ceiling fan ----------------------------------------------------------------------------

/**
 * The fan under the awning's header beam, seen from slightly below: a plan-view rotor squashed to 0.26 in Y
 * by a STATIC parent transform, so GSAP can spin the child in plain rotation. `fan-blur` is the spin's smear
 * (drawn only while it is fast); the invisible-at-rest circle also keeps the child's bbox centred on the hub.
 */
export function CeilingFan({ cx = 800, cy = 522 }: { cx?: number; cy?: number }) {
  const R = 76;
  const blade = ribbon([[0, 0, 13], [R * 0.45, 0, 20], [R, 0, 15]]);
  return (
    <g data-fan>
      <path d={`M${cx} 494V${cy - 10}`} className="stroke-ink" strokeWidth={STROKE.line} />
      <rect x={cx - 8} y={cy - 14} width="16" height="10" rx="3" className="fill-ink" />
      <g transform={`translate(${cx} ${cy}) scale(1 0.3)`}>
        <g data-fan-spin>
          <circle data-fan-blur r={R + 4} className="nn-fan-blur" opacity="0.3" />
          <g data-fan-blades className="fill-ink">
            {[0, 120, 240].map((a) => (
              <path key={a} d={blade} transform={`rotate(${a})`} />
            ))}
            <circle r="10" />
          </g>
        </g>
      </g>
    </g>
  );
}

// ---- Mama's hand fan ----------------------------------------------------------------------------

/** A tali (palm-leaf hand fan) held at Mama's front hand; he faces left, so the hand is mirrored about his feet. */
export function Tali({ mama }: { mama: readonly [number, number] }) {
  const [hx, hy] = mamaHand("fan");
  const x = mama[0] - hx;
  const y = mama[1] + hy;
  const R = 27;
  return (
    <g transform={`translate(${r1(x)} ${r1(y)})`}>
      <g className="nn-wave loop">
        <path d="M0 0V-20" className="stroke-wood" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="0" cy={-20 - R} r={R} className="nn-straw" />
        <path d={Array.from({ length: 5 }, (_, i) => { const a = (-70 + i * 35) * (Math.PI / 180); return `M0 -20L${r1(Math.sin(a) * R * 0.92)} ${r1(-20 - R - Math.cos(a) * R * 0.92)}`; }).join("")} className="stroke-ink" strokeWidth="1.4" opacity="0.4" fill="none" />
        <circle cx="0" cy={-20 - R} r={R} fill="none" className="stroke-wood" strokeWidth="3.4" />
      </g>
    </g>
  );
}

// ---- the puller, asleep on his own rickshaw -----------------------------------------------------

function Wheel({ cx, r = 50 }: { cx: number; r?: number }) {
  const cy = -r;
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 8;
    const [dx, dy] = [Math.cos(a) * r * 0.92, Math.sin(a) * r * 0.92];
    return `M${r1(cx - dx)} ${r1(cy - dy)}L${r1(cx + dx)} ${r1(cy + dy)}`;
  }).join("");
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" className="stroke-ink" strokeWidth="5" />
      <path d={spokes} className="stroke-ink" strokeWidth="1.4" opacity="0.55" fill="none" />
      <circle cx={cx} cy={cy} r="5" className="fill-ink" />
    </g>
  );
}

/**
 * A parked cycle-rickshaw facing right (local units, ground at y = 0, rear at x = 0), the puller asleep
 * across the passenger seat: head on the folded hood, a gamchha over his face (the one cue), knees up and
 * feet on the handlebar. The painted side panel is the restrained rickshaw-art moment: Rickshaw Magenta,
 * three paper flowers, a row of amber tinsel dots, a paper border. Place with <Placed flip> (Scene 5 faces left).
 */
function Rickshaw() {
  const tinsel = Array.from({ length: 14 }, (_, i) => 2 + i * 11.6);
  return (
    <g>
      {/* hood folded down behind the seat: the puller's pillow */}
      <path d={blob([[-32, -152], [-38, -186], [-24, -214], [-2, -218], [4, -190], [2, -152]])} className="fill-tarp-dark" />
      <path d="M-30 -158C-34 -184 -22 -208 -4 -212" fill="none" className="nn-rick-s" strokeWidth="3" strokeLinecap="round" />
      {/* frame, fork, handlebar, the cyclist's saddle */}
      <g className="stroke-ink" fill="none" strokeLinecap="round" strokeWidth="5">
        <path d="M50 -50H290" />
        <path d="M30 -96L50 -50M150 -96L190 -48" strokeWidth="4" />
        <path d="M290 -50L268 -166" />
        <path d="M244 -172L292 -164" strokeWidth="6" />
        <path d="M190 -48V-112" strokeWidth="4" />
      </g>
      <path d={blob([[176, -116], [190, -122], [212, -118], [208, -110], [188, -108]])} className="fill-ink" />
      {/* the painted side panel under the seat + the seat cushion */}
      <path d={wobbleRect(-14, -142, 168, 46, 41, 1.2)} className="nn-rick" />
      <rect x="-8" y="-136" width="156" height="34" fill="none" className="stroke-paper" strokeWidth="1.6" opacity="0.8" />
      {[20, 70, 120].map((x) => (
        <g key={x}>
          <circle cx={x} cy="-119" r="11" className="fill-paper" />
          <circle cx={x} cy="-119" r="4.4" className="fill-accent" />
          <path d={`M${x + 14} -119q8 -9 16 0q-8 9 -16 0Z`} className="fill-tarp" opacity="0.9" />
        </g>
      ))}
      {tinsel.map((x) => (
        <circle key={x} cx={x - 8} cy="-99" r="2.2" className="fill-accent" />
      ))}
      <path d={wobbleRect(-14, -152, 168, 11, 42, 1)} className="fill-wood" />
      <Wheel cx={50} />
      <Wheel cx={290} />
      {/* the puller: one ribbon per part, all ink; the gamchha is the cue */}
      <g className="nn-breathe loop">
        <g className="fill-ink">
          <path d={ribbon([[30, -196, 13], [8, -228, 11], [-14, -222, 9]])} />
          <path d={ribbon([[24, -194, 32], [62, -184, 35], [96, -172, 32], [114, -164, 30]])} />
          <path d={ribbon([[110, -160, 24], [170, -186, 20], [246, -170, 12]])} />
          <path d={ribbon([[210, -192, 17], [254, -182, 13]])} />
          <path d={ribbon([[254, -182, 14], [280, -178, 9]])} />
          <path d={ribbon([[34, -194, 13], [66, -178, 12], [92, -184, 10]])} />
          <path d={blob([[-26, -206], [-20, -224], [-4, -228], [10, -216], [12, -200], [0, -188], [-18, -190]])} />
        </g>
        <path d={ribbon([[114, -164, 30], [182, -198, 25], [222, -191, 21]])} fill="url(#lungi-check)" />
        <path d={blob([[-30, -206], [-22, -230], [0, -237], [17, -218], [17, -196], [2, -184], [-22, -188]])} fill="url(#gamchha-check)" />
        <path d={ribbon([[8, -200, 15], [26, -186, 13], [24, -166, 9]])} fill="url(#gamchha-check)" />
      </g>
    </g>
  );
}

/** The rickshaw + puller, placed with the same props as any cast figure (at = the ground under the rear wheel). */
export function AsleepPuller(p: CastProps) {
  return (
    <Placed {...p}>
      <path d="M-26 0H336L350 14H-10Z" className="fill-ink" opacity="0.22" />
      <Rickshaw />
    </Placed>
  );
}

// ---- lemon tea on a stool, sweating -------------------------------------------------------------

export const GLASS = { x: 972, top: 772, base: 818 } as const;
/** x offset of each drop from the glass centre, and where it starts (y). The timeline slides each down 28 units. */
export const DROPS = [{ dx: -7, y: 782 }, { dx: 2, y: 786 }, { dx: 7, y: 780 }] as const;

export function LemonTea() {
  const { x, top, base } = GLASS;
  return (
    // drawn a touch large (a still life in the foreground), scaled about the stool's feet so it stays on the road
    <g transform={`translate(${x} 860) scale(1.2) translate(${-x} -860)`}>
      {/* a low stool in the shade */}
      <path d={wobbleRect(x - 26, base, 52, 9, 51, 0.8)} className="fill-wood" />
      <path d={`M${x - 20} ${base + 9}L${x - 24} 860M${x + 20} ${base + 9}L${x + 24} 860`} className="stroke-wood" strokeWidth="6" strokeLinecap="round" />
      {/* the glass: pale body, amber tea, a lemon wheel on the rim and a slice afloat */}
      <path d={`M${x - 15} ${top}L${x - 11} ${base}H${x + 11}L${x + 15} ${top}Z`} className="nn-glass" />
      <path d={`M${x - 14} ${top + 8}L${x - 11} ${base}H${x + 11}L${x + 14} ${top + 8}Z`} className="nn-tea" />
      <ellipse cx={x} cy={top + 12} rx="11" ry="3.6" className="nn-lemon" />
      <path d={`M${x - 15} ${top}L${x - 11} ${base}H${x + 11}L${x + 15} ${top}`} fill="none" className="stroke-ink" strokeWidth="2.2" strokeLinejoin="round" />
      <path d={`M${x - 11} ${top + 3}L${x - 9} ${base - 8}`} className="stroke-paper" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" fill="none" />
      <g transform={`translate(${x + 14} ${top - 2})`}>
        <circle r="10" className="nn-lemon" />
        <circle r="10" fill="none" className="stroke-ink" strokeWidth="1.4" />
        <path d="M0 -9V9M-9 0H9M-6.4 -6.4L6.4 6.4M6.4 -6.4L-6.4 6.4" className="stroke-ink" strokeWidth="1" opacity="0.4" fill="none" />
      </g>
      {/* sweat: drops that slide down the glass as you scroll (data-drop) */}
      {DROPS.map(({ dx, y }, i) => (
        <g key={i} transform={`translate(${x + dx} ${y})`}>
          <g data-drop>
            <path d="M0 -4C3 0 4.2 3 0 6C-4.2 3 -3 0 0 -4Z" className="fill-paper stroke-ink" strokeWidth="0.9" />
          </g>
        </g>
      ))}
    </g>
  );
}

// ---- heat shimmer -------------------------------------------------------------------------------

/** One wavy line as a smooth quadratic chain: `t` reflects the control point, so a single `q` makes every wave. */
function wave(y: number, wl: number, amp: number) {
  const n = Math.ceil(2700 / (wl / 2));
  return `M-520 ${y}q${wl / 4} ${-amp * 2} ${wl / 2} 0` + Array.from({ length: n - 1 }, () => `t${wl / 2} 0`).join("");
}

// y, wavelength, amplitude, stroke width, opacity, seconds per cycle: each cycle moves exactly one wavelength
const BANDS = [[820, 170, 2.2, 4, 0.13, 9.2], [840, 120, 2.6, 5, 0.16, 7.4], [860, 210, 2, 4, 0.12, 10.5], [880, 140, 2.4, 5, 0.14, 8.1]] as const;

/**
 * Heat shimmer: 4 thin wavy translucent bands over the bottom of the frame, each drifting in `transform`
 * (translateX, one wavelength per cycle, CSS, paused off-screen). No SVG filter. Not rendered on the low
 * tier or under reduced motion.
 */
export function HeatShimmer() {
  return (
    <g aria-hidden="true" fill="none" strokeLinecap="round">
      {BANDS.map(([y, wl, amp, w, o, d]) => (
        <g key={y} className="nn-heat-band loop" style={{ ["--wl" as string]: `${wl}px`, ["--d" as string]: `${d}s` }}>
          <path d={wave(y, wl, amp)} className="nn-heat" strokeWidth={w} opacity={o} />
        </g>
      ))}
    </g>
  );
}
