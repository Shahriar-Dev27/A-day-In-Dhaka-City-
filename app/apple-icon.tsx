import { ImageResponse } from "next/og";
import { palette } from "@/lib/palette";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: palette[0].skyTop }}><svg width="100" height="115" viewBox="0 0 100 115"><path d="M16 28H84L76 97Q50 109 24 97Z" fill={palette[0].accent} /><ellipse cx="50" cy="28" rx="34" ry="8" fill={palette[0].glow} /><path d="M39 13Q30 7 39 0M61 13Q70 7 61 0" fill="none" stroke={palette[0].text} strokeWidth="3" /></svg></div>, size);
}
