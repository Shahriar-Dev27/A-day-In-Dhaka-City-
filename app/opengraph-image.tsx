import { ImageResponse } from "next/og";
import { palette, storyVars } from "@/lib/palette";

export const alt = "A Day in Dhaka — one city, one day, a cup of tea.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const p = palette[1];
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "70px 80px", color: p.text, background: `linear-gradient(150deg, ${p.skyTop}, ${p.skyBottom})` }}>
      <div style={{ display: "flex", fontSize: 18, letterSpacing: 5, color: p.textMuted }}>04:45 AM — 11:45 PM</div>
      <div style={{ display: "flex", marginTop: 75, fontSize: 92, fontWeight: 700, letterSpacing: -4 }}>A Day in Dhaka</div>
      <div style={{ display: "flex", marginTop: 22, fontSize: 30, color: p.textMuted }}>One city. One day. A cup of tea.</div>
      <svg width="1200" height="160" viewBox="0 0 1200 160" style={{ position: "absolute", bottom: 0, left: 0 }}>
        <path d="M0 160V90h95V47h76v58h102V70h89v90h76V66h47V26h18v40h47v94h82V90h95V53h89v49h95V28h95v65h97V60h102v100Z" fill={p.ink} />
      </svg>
      <svg width="110" height="140" viewBox="0 0 110 140" style={{ position: "absolute", top: 75, right: 90 }}>
        <path d="M18 40H92L84 123Q55 137 26 123Z" fill={storyVars["--story-tea"]} stroke={storyVars["--story-rim"]} strokeWidth="3" />
        <ellipse cx="55" cy="40" rx="37" ry="9" fill={p.glow} />
        <path d="M40 24Q25 9 40 0M68 24Q83 8 68 0" fill="none" stroke={p.textMuted} strokeWidth="2" />
      </svg>
    </div>, size,
  );
}
