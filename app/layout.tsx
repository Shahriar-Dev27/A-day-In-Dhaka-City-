import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import { fontVars } from "@/lib/fonts";
import { palette, toCssVarObject } from "@/lib/palette";
import "./globals.css";

export const metadata: Metadata = {
  title: "A Day in Dhaka",
  description: "One scroll, one day in Dhaka: from the 4:45 AM azaan to the quiet midnight street.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: palette[0].skyTop,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Scene 0 palette is the default; Experience's sky timeline rewrites these vars on <html> while scrolling.
    <html lang="en" className={fontVars} style={toCssVarObject(palette[0]) as CSSProperties} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
