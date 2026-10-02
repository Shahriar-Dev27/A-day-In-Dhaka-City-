export type SceneId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface PaletteTokens {
  skyTop: string; // hex; top of the continuous sky gradient
  skyBottom: string; // hex; horizon
  ink: string; // silhouettes / darkest layer
  accent: string; // scene signature colour
  glow: string; // light sources (bulb, flame, tea; noon white)
  text: string; // Bangla narration line
  textMuted: string; // English subtitle
  wall: string; // the apartment block / concrete, relit per scene (Mildew Concrete family)
  tarp: string; // the stall awning, relit per scene (Tarpaulin Blue family)
}

// DRAFT values (v2 plan §3.1; U approves at Checkpoint 1/2). Style-bible names: Dust Haze #E9DFC8
// (day sky + SLIP.bg), Mildew Concrete #8A8F7E (wall), Tarpaulin Blue #2F5D8C (tarp/accent by day),
// Rickshaw Magenta #D6336C (accent in 3, 6, 7), Tong Amber #F2A93B (glow), Night Ink #11151F.
// text/textMuted reach >= 4.5:1 on both sky stops of their own scene (tests/lib.test.mjs).
export const palette: Record<SceneId, PaletteTokens> = {
  0: { skyTop: "#11151F", skyBottom: "#1A2030", ink: "#080A10", accent: "#2F5D8C", glow: "#F2A93B", wall: "#202634", tarp: "#1E3550", text: "#F3EBD8", textMuted: "#BDB6A5" },
  1: { skyTop: "#161C2B", skyBottom: "#3D4A58", ink: "#0B0F18", accent: "#2F5D8C", glow: "#F2A93B", wall: "#4A5160", tarp: "#26486C", text: "#F1EBDD", textMuted: "#D3D1CB" },
  2: { skyTop: "#E6C79A", skyBottom: "#E9DFC8", ink: "#2A241C", accent: "#2F5D8C", glow: "#F2A93B", wall: "#9A9A84", tarp: "#2F5D8C", text: "#1E1A14", textMuted: "#463E32" },
  3: { skyTop: "#E2D6BA", skyBottom: "#EEE6D3", ink: "#1A1820", accent: "#D6336C", glow: "#F2A93B", wall: "#8A8F7E", tarp: "#2F5D8C", text: "#15131A", textMuted: "#3D3942" },
  4: { skyTop: "#DCDDD2", skyBottom: "#EDE8DA", ink: "#1B2026", accent: "#2F5D8C", glow: "#F2A93B", wall: "#9EA294", tarp: "#2F5D8C", text: "#14181E", textMuted: "#3B4048" },
  5: { skyTop: "#F3EEE2", skyBottom: "#FBF8F0", ink: "#2A261C", accent: "#F2A93B", glow: "#FFFDF6", wall: "#B9BAA8", tarp: "#4F7AA6", text: "#1F1B12", textMuted: "#4A4334" },
  6: { skyTop: "#E6B26E", skyBottom: "#EFD7AA", ink: "#2B1D10", accent: "#D6336C", glow: "#F2A93B", wall: "#8C8370", tarp: "#2F5D8C", text: "#22160A", textMuted: "#4A3218" },
  7: { skyTop: "#141A2C", skyBottom: "#2E2A3E", ink: "#07090F", accent: "#D6336C", glow: "#F2A93B", wall: "#2C3140", tarp: "#22405F", text: "#F6EEDC", textMuted: "#D0C7B6" },
  8: { skyTop: "#0A0D15", skyBottom: "#11151F", ink: "#040509", accent: "#2F5D8C", glow: "#F2A93B", wall: "#1A1F2B", tarp: "#1A2E45", text: "#F3EBD8", textMuted: "#B7BAC4" },
};

// Mid-transition keyframes, keyed by the scene they leave. A straight sRGB lerp from night blue to day
// cream passes through grey-brown mud, so the fajr-to-morning change goes via a peach dawn (blue top,
// warm horizon). Only used between plateaus (no narration is visible there), so it needs no text contrast.
export const via: Partial<Record<SceneId, PaletteTokens>> = {
  1: { skyTop: "#5F7096", skyBottom: "#E9B58E", ink: "#1D1B22", accent: "#2F5D8C", glow: "#F2A93B", wall: "#787880", tarp: "#2B5382", text: "#2A2630", textMuted: "#4A4650" },
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
  wall: "--wall",
  tarp: "--tarp",
} as const satisfies Record<keyof PaletteTokens, `--${string}`>;

// Plain object for gsap.to(document.documentElement, toCssVarObject(palette[n]))
export function toCssVarObject(t: PaletteTokens): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of Object.keys(cssVars) as (keyof PaletteTokens)[]) out[cssVars[k]] = t[k];
  return out;
}

// Fixed "printed paper" pair, independent of the sky: speech slips + the clock ticket (13.78:1).
export const SLIP = { bg: "#E9DFC8" /* Dust Haze */, fg: "#11151F" /* Night Ink */ } as const;
export const CLOCK = SLIP; // one paper colour for all chrome
export const slipVars: Record<"--slip-bg" | "--slip-fg", string> = { "--slip-bg": SLIP.bg, "--slip-fg": SLIP.fg };

// Costume cues: fixed hues, mixed toward --ink in CSS so night dims them:
// color-mix(in oklab, var(--cue-cap) 75%, var(--ink)).
export const CUE = {
  cap: "#F2EEE4", khaki: "#8C7A4E", dupatta: "#D6336C", uniform: "#2F5D8C", notebook: "#B8322A",
  lanyard: "#2F5D8C", note: "#C9876B", helmet: "#B8322A", cng: "#3E7B4A",
  rickshaw: "#D6336C", // Rickshaw Magenta, fixed: painted panels and the evening's neon. Unlike --accent it never lerps.
} as const;

// Metro livery. DRAFT, pending SCRIPT-v2 Review item 6 / plan Q3. Set on Scene 4's root only.
export const METRO = { body: "#ECEDE8", stripeA: "#B8322A", stripeB: "#2E7D4F", floor: "#5A6068", edge: "#F2C230" } as const;

function prefixed<T extends Record<string, string>, P extends string>(prefix: P, src: T) {
  return Object.fromEntries(Object.entries(src).map(([k, v]) => [`--${prefix}-${k}`, v])) as Record<`--${P}-${Extract<keyof T, string>}`, string>;
}
export const cueVars = prefixed("cue", CUE); // set once on <html> by app/layout.tsx
export const metroVars = prefixed("metro", METRO); // set on the Scene 4 root only
