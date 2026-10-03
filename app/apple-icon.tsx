import { ImageResponse } from "next/og";
import { palette } from "@/lib/palette";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function Icon() {
  const p = palette[0];
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: p.skyTop }}>
      <svg width="180" height="180" viewBox="0 0 64 64">
        <path d="M32 0v14" stroke={p.textMuted} strokeWidth="3" />
        <rect x="27" y="13" width="10" height="8" rx="2" fill={p.wall} />
        <circle cx="32" cy="33" r="14" fill={p.glow} />
        <circle cx="32" cy="33" r="6" fill={p.text} />
      </svg>
    </div>,
    size,
  );
}
