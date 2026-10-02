import { rng, r1 } from "./geometry";

/*
  The one place the printed texture lives (v2 plan 4.2). Static <pattern>s only: no feTurbulence,
  no filters, nothing animated. Render once (Experience) and reference with fill="url(#riso-...)".
  Colours come from CSS vars, resolved where the pattern sits (<html>), so they relight with the sky.
    riso-dots   6-unit halftone, ink: fold shading, shadows
    riso-fine   4-unit halftone, ink: soft shading on small shapes
    riso-glow   8-unit halftone, glow: the lamp's printed halo
    riso-speck  64-unit tile of random specks, ink: paper grain on the big flats (wall, tarp, road)
    lungi-check checked cloth for the lungi; gamchha-check the red-and-cream gamchha
    riso-plank  vertical wood boards for the booth wall and the bench
*/

const SPECKS = (() => {
  const rnd = rng(77);
  return Array.from({ length: 30 }, () => [r1(rnd() * 64), r1(rnd() * 64), r1(0.6 + rnd() * 1.1)] as const);
})();

export default function RisoDefs() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" className="pointer-events-none absolute">
      <defs>
        <pattern id="riso-dots" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.6" style={{ fill: "var(--ink)" }} />
        </pattern>
        <pattern id="riso-fine" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.95" style={{ fill: "var(--ink)" }} />
        </pattern>
        <pattern id="riso-glow" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="2.2" style={{ fill: "var(--glow)" }} />
        </pattern>
        <pattern id="riso-speck" width="64" height="64" patternUnits="userSpaceOnUse">
          {SPECKS.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} style={{ fill: "var(--ink)" }} />
          ))}
        </pattern>
        <pattern id="riso-plank" width="22" height="40" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1.6" height="40" style={{ fill: "var(--ink)", opacity: 0.35 }} />
        </pattern>
        <pattern id="lungi-check" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" style={{ fill: "color-mix(in oklab, var(--cue-uniform) 62%, var(--ink))" }} />
          <rect x="0" y="6" width="16" height="3" style={{ fill: "color-mix(in oklab, var(--cue-cap) 55%, var(--ink))" }} />
          <rect x="6" y="0" width="3" height="16" style={{ fill: "color-mix(in oklab, var(--cue-cap) 55%, var(--ink))" }} />
        </pattern>
        <pattern id="gamchha-check" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" style={{ fill: "color-mix(in oklab, var(--cue-cap) 78%, var(--ink))" }} />
          <rect x="0" y="4" width="10" height="2.4" style={{ fill: "color-mix(in oklab, var(--cue-notebook) 85%, var(--ink))" }} />
          <rect x="4" y="0" width="2.4" height="10" style={{ fill: "color-mix(in oklab, var(--cue-notebook) 85%, var(--ink))" }} />
        </pattern>
      </defs>
    </svg>
  );
}
