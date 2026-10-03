import { ImageResponse } from "next/og";
import { palette } from "@/lib/palette";

export const alt = "A Day in Dhaka: একটি দিন, ঢাকায়. A scroll story that follows one chai stall through an ordinary day.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const EN = "A Day in Dhaka";
const SUB = "Mama's Tong · 4:45 AM to 11:45 PM";

// ImageResponse cannot use woff2 or next/font files, so fetch a TTF subset of Noto Serif Bengali (SIL OFL 1.1; its Latin
// glyphs carry the card) containing only the characters used here. This route is statically rendered at build time and
// the build already needs Google Fonts access for next/font. If the fetch fails the card falls back to the built-in sans.
// The Bangla title is deliberately NOT drawn here: Satori does not shape Bengali correctly (pre-base vowel sign i-kar and
// the nukta in য় mis-position, verified by rendering), and a misspelt title is worse than none. It lives in <title> and alt.
async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const text = encodeURIComponent(EN + SUB);
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@700&text=${text}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

// Halftone halo: dots shrink with distance from the bulb centre (printed-flat look, no gradients).
const BULB = { x: 1020, y: 190 };
const HALO_R = 250;
const halo: { x: number; y: number; r: number }[] = [];
for (let gy = -HALO_R; gy <= HALO_R; gy += 20) {
  for (let gx = -HALO_R; gx <= HALO_R; gx += 20) {
    const ox = (Math.round(gy / 20) % 2) * 10; // offset alternate rows for a screen-print grid
    const x = gx + ox;
    const d = Math.hypot(x, gy);
    if (d > 70 && d < HALO_R) halo.push({ x: BULB.x + x, y: BULB.y + gy, r: 8 * (1 - d / HALO_R) });
  }
}

export default async function Image() {
  const font = await loadFont();
  const p = palette[0];
  const fonts = font ? [{ name: "Noto Serif Bengali", data: font, weight: 700 as const, style: "normal" as const }] : undefined;
  const family = font ? "Noto Serif Bengali" : "sans-serif";

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 90px", background: p.skyTop, color: p.text, fontFamily: family, position: "relative" }}>
      <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", top: 0, left: 0 }}>
        {halo.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={p.glow} opacity={0.85} />)}
        <path d={`M${BULB.x} 0V${BULB.y - 78}`} stroke={p.textMuted} strokeWidth="3" />
        <rect x={BULB.x - 16} y={BULB.y - 80} width="32" height="26" rx="5" fill={p.wall} />
        <circle cx={BULB.x} cy={BULB.y} r="52" fill={p.glow} />
        <circle cx={BULB.x} cy={BULB.y} r="26" fill={p.text} />
        <rect x="0" y="560" width="1200" height="70" fill={p.ink} />
        <rect x="90" y="556" width="260" height="8" fill={palette[3].accent} />
      </svg>
      <div style={{ display: "flex", fontSize: 104, lineHeight: 1.1, fontWeight: 700, letterSpacing: -2 }}>{EN}</div>
      <div style={{ display: "flex", fontSize: 28, color: p.glow, marginTop: 28, letterSpacing: 2 }}>{SUB}</div>
    </div>,
    { ...size, fonts },
  );
}
