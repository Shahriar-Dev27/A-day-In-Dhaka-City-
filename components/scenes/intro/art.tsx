import { useId } from "react";
import { lightDotStyle } from "@/lib/scenes";
import { STROKE, blob, jitter, r1, ribbon, rng, wobbleRect } from "../tong/geometry";

/*
  Scene 0 pieces, in the tong set's print language: flat tokened fills, hand-cut (wobble/blob) edges,
  halftone for light, paper specks, a misregistered second plate on the hero shape, STROKE weights, no
  filters, no hex. The bulb is drawn TWICE with the same component: once in the Loader's veil (heat 0,
  warmed by real load progress) and once at rest in Scene 0 (heat 1) underneath it, so the veil's exit is
  a cross-fade between two pixel-identical frames. Everything is in px around the stage centre (0,0),
  because the bulb's glowing core IS the 14px LIGHT_DOT at the stage centre (lib/scenes.ts).
*/

/** One heat value 0..1 (orange and dim -> gold and full) -> the inline starting styles / the Loader's targets. */
export function heatState(h: number) {
  // the glass is amber, translucent glass: the hot 14px core inside it must stay the brightest thing
  return { halo: 0.3 + 0.7 * h, haloAlpha: 0.2 + 0.8 * h, gold: h, glassBase: 0.55 - 0.42 * h, glassGold: 0.74 * h, dot: 0.12 + 0.88 * h };
}

// Pear of glass, sphere centre at (0,0): the hot core sits in the middle of it.
const GLASS = blob(jitter([[-8, -42], [8, -42], [10, -33], [20, -22], [26, -6], [24, 10], [15, 22], [0, 27], [-15, 22], [-24, 10], [-26, -6], [-20, -22], [-10, -33]], 7, 0.9));
const CAP = wobbleRect(-6, -64, 12, 6, 12, 0.6);
const SOCKET = wobbleRect(-10, -58, 20, 20, 13, 0.8);
const WIRE_END = 64; // px above the centre where the wire meets the cap

// Halftone halo: dashed circles with round caps and zero-length dashes are evenly spaced dots, so a ring is one node.
// Constant spacing, dot size falling outward (a halftone screen), each ring turned a little (the screen angle).
const SPACING = 13;
const RINGS = Array.from({ length: 9 }, (_, i) => {
  const r = 30 + i * 14;
  const n = Math.round((2 * Math.PI * r) / SPACING);
  return { r, dia: r1(6.4 - i * 0.62), step: r1((2 * Math.PI * r) / n), off: r1((i * 5.3) % SPACING), a: r1(1 - i * 0.085) };
});
const SPECKS = (() => {
  const rnd = rng(31);
  return Array.from({ length: 16 }, () => {
    const a = rnd() * Math.PI * 2;
    const r = 38 + rnd() * 108;
    return [r1(Math.cos(a) * r), r1(Math.sin(a) * r), r1(0.7 + rnd() * 0.9)] as const;
  });
})();

export function IntroBulb({ heat, low }: { heat: number; low: boolean }) {
  const id = useId();
  const h = heatState(heat);
  const rings = low ? RINGS.filter((_, i) => i % 2 === 0) : RINGS;
  const ringsId = `${id}-rings`;
  return (
    <div data-swing className="intro-swing" style={{ transformOrigin: "50% 0%" }}>
      {/* the wire: a hair line from the top edge to the cap, a hand-drawn hang (non-scaling, so it stays a hair) */}
      <div className="intro-wire" style={{ height: `calc(50% - ${WIRE_END}px)` }}>
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 400" preserveAspectRatio="none" className="h-full w-full">
          <path d="M12 0C11.3 90 12.9 180 12.1 300S12 384 12 400" fill="none" className="intro-wire-stroke" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        </svg>
      </div>
      <div data-swell className="absolute inset-0" style={{ transformOrigin: "50% 50%" }}>
        <svg
          data-halo
          aria-hidden="true"
          focusable="false"
          viewBox="-150 -150 300 300"
          className="intro-halo"
          style={{ transform: `scale(${h.halo})`, opacity: h.haloAlpha }}
        >
          <defs>
            <g id={ringsId} fill="none" strokeLinecap="round">
              {rings.map((g) => (
                <circle key={g.r} r={g.r} strokeWidth={g.dia} strokeDasharray={`0 ${g.step}`} strokeDashoffset={g.off} opacity={g.a} />
              ))}
            </g>
          </defs>
          <g className={heat >= 1 ? "loop intro-breathe" : undefined}>
            <use href={`#${ringsId}`} className="intro-orange-stroke" />
            {/* the second plate: gold, a hair off register, fading in with the heat */}
            <use data-gold href={`#${ringsId}`} transform="translate(2.2 -1.6)" className="intro-gold-stroke" style={{ opacity: h.gold }} />
          </g>
          {low ? null : SPECKS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} className="intro-speck" />)}
        </svg>

        <svg aria-hidden="true" focusable="false" width="1" height="1" className="intro-art">
          {/* misregistered plate */}
          <path d={GLASS} fill="none" className="stroke-accent" strokeWidth="2" opacity="0.75" transform="translate(3 -2)" />
          <path d={GLASS} className="fill-ink" opacity="0.94" />
          <path data-glass-base d={GLASS} className="intro-orange-fill" style={{ opacity: h.glassBase }} />
          <path data-glass-gold d={GLASS} className="fill-glow" style={{ opacity: h.glassGold }} />
          <path data-hot d={GLASS} className="intro-hot-fill" style={{ opacity: 0 }} />
          <path d={GLASS} fill="none" className="intro-glass-edge" strokeWidth="1.6" strokeLinejoin="round" />
          {/* U filament: the glowing core (the 14px dot) is its base */}
          <path d="M-4.5 -36V-5Q-4.5 3 0 3Q4.5 3 4.5 -5V-36" fill="none" className="stroke-ink" strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
          <path d="M-18 -14Q-15 -26 -5 -32" fill="none" className="stroke-paper" strokeWidth="2.2" strokeLinecap="round" opacity="0.5" />
          <path d={SOCKET} className="intro-socket" />
          <path d="M-10 -52H10M-10 -46.5H10" className="stroke-ink" strokeWidth={STROKE.hair / 2} opacity="0.55" />
          <path d={CAP} className="intro-socket" />
        </svg>
        <span data-dot aria-hidden="true" className="rounded-full bg-glow" style={{ ...lightDotStyle, opacity: h.dot }} />
      </div>
    </div>
  );
}

/**
 * The hand-off to Scene 1 (scrolled in from the bottom, SCRIPT Scene 0): the first mist bands and an
 * overhead-wire bundle, the two things Scene 1's night tong is wrapped in. Each `data-drift` group is
 * staggered in by the scene's scroll timeline. Same art units as the tong set (1600x900, xMidYMax slice).
 */
export function DriftIn({ low }: { low: boolean }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full overflow-visible">
      {low ? null : (
        <g data-drift className="intro-fade-in">
          <path d={ribbon([[-300, 690, 48], [200, 682, 58], [700, 698, 44], [1200, 684, 56], [1900, 694, 48]])} className="fill-copy-muted" opacity="0.07" />
        </g>
      )}
      <g data-drift className="intro-fade-in">
        <path d={ribbon([[-300, 756, 58], [260, 746, 70], [820, 764, 52], [1340, 748, 66], [1900, 760, 58]])} className="fill-copy-muted" opacity="0.1" />
        <path d={ribbon([[-300, 826, 52], [300, 816, 64], [900, 834, 48], [1400, 818, 60], [1900, 828, 52]])} className="fill-copy-muted" opacity="0.13" />
      </g>
      <g data-drift className="intro-fade-in intro-wires" fill="none" strokeWidth={STROKE.hair} strokeLinecap="round">
        {[0, 1, 2, 3].map((i) => (
          <path key={`a${i}`} d={`M-60 ${722 + i * 7}Q380 ${806 + i * 9} 820 ${748 + i * 6}T1660 ${728 + i * 7}`} vectorEffect="non-scaling-stroke" opacity={1 - i * 0.14} />
        ))}
        {[0, 1, 2].map((i) => (
          <path key={`b${i}`} d={`M-60 ${790 + i * 8}Q520 ${860 + i * 8} 1040 ${812 + i * 6}T1660 ${804 + i * 8}`} vectorEffect="non-scaling-stroke" opacity={0.85 - i * 0.14} />
        ))}
      </g>
    </svg>
  );
}
