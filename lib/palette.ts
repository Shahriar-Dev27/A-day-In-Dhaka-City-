export type SceneId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface PaletteTokens {
  skyTop: string; // hex; top of the continuous sky gradient
  skyBottom: string; // hex; horizon
  ink: string; // silhouettes / darkest layer
  accent: string; // scene signature colour
  glow: string; // light sources (lantern, sun, neon, lamp)
  text: string; // Bangla main line
  textMuted: string; // English subtitle
}

// DRAFT values (PLAN §5 palette column). User approves at Checkpoint 1.
// skyTop/skyBottom/accent/glow are the §4.1 seed; ink/text/textMuted were chosen
// so text vs. both sky stops reaches WCAG AA (4.5:1 subtitles, 3:1 display) at each
// scene's plateau (see 02a-frontend.md for the measured ratios).
export const palette: Record<SceneId, PaletteTokens> = {
  0: { skyTop: "#12133A", skyBottom: "#1E1F55", ink: "#0A0B26", accent: "#E8C27A", glow: "#F5D99A", text: "#FBF1D9", textMuted: "#C9C3E0" },
  1: { skyTop: "#141A4A", skyBottom: "#2E5C66", ink: "#070B24", accent: "#3FA7A0", glow: "#F2B680", text: "#F4EFE2", textMuted: "#C4D8DB" },
  2: { skyTop: "#F4A340", skyBottom: "#FBD38D", ink: "#3A1608", accent: "#E2702A", glow: "#FFE2A8", text: "#2B1206", textMuted: "#4F2610" },
  3: { skyTop: "#00A6D6", skyBottom: "#FFE14D", ink: "#14102E", accent: "#E6195A", glow: "#FFD000", text: "#14102E", textMuted: "#1C1744" },
  4: { skyTop: "#FFF6D6", skyBottom: "#FFFDF2", ink: "#2B2100", accent: "#F7C600", glow: "#FFFFFF", text: "#1F1800", textMuted: "#4A3A00" },
  5: { skyTop: "#F2A65A", skyBottom: "#F7D79A", ink: "#2E1606", accent: "#D9822B", glow: "#FFC66B", text: "#2A1405", textMuted: "#55290C" },
  6: { skyTop: "#2A0B4A", skyBottom: "#B0197E", ink: "#0C0418", accent: "#19E3F0", glow: "#FF3EC8", text: "#FFF4FB", textMuted: "#FFE3F6" },
  7: { skyTop: "#05070F", skyBottom: "#0D1530", ink: "#02030A", accent: "#2B3A67", glow: "#F3C877", text: "#F6EFDD", textMuted: "#B4BFDA" },
};

// token -> CSS custom property; the only place var names are defined
export const cssVars = {
  skyTop: "--sky-top",
  skyBottom: "--sky-bottom",
  ink: "--ink",
  accent: "--accent",
  glow: "--glow",
  text: "--text",
  textMuted: "--text-muted",
} as const satisfies Record<keyof PaletteTokens, `--${string}`>;

// Plain object for gsap.to(document.documentElement, toCssVarObject(palette[n]))
export function toCssVarObject(t: PaletteTokens): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of Object.keys(cssVars) as (keyof PaletteTokens)[]) out[cssVars[k]] = t[k];
  return out;
}

// The clock is always on screen, so its text can't follow --text (which flips light/dark with the
// sky). It sits on an --ink pill at 80% alpha (ink is the darkest layer in every scene) with this
// fixed light foreground; tests/lib.test.mjs checks >= 4.5:1 even over a pure-white sky.
export const CLOCK_FG = "#FBF1D9";
export const CLOCK_PILL_ALPHA = 0.8;

// Scene-local extras (never rewritten by the global sky timeline). Scene 1 sets these on its own root
// as CSS vars so the art can stay token-only: a faint teal-pink dawn that is not part of the shared set.
export const scene1Extras = {
  dawnPink: "#D98FA0", // first light low on the horizon
  dawnTeal: "#4FB0A8", // cool band above it
} as const;
export const scene1Vars: Record<string, string> = {
  "--s1-dawn": scene1Extras.dawnPink,
  "--s1-dawn-teal": scene1Extras.dawnTeal,
};
