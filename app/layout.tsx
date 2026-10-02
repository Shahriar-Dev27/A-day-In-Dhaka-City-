import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import { fontVars } from "@/lib/fonts";
import { cueVars, palette, slipVars, toCssVarObject } from "@/lib/palette";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")),
  title: "A Day in Dhaka",
  description: "One scroll, one day in Dhaka: from the 4:45 AM azaan to the quiet midnight street.",
  openGraph: { type: "website", locale: "en_US", alternateLocale: "bn_BD", title: "A Day in Dhaka", description: "One city. One day. A cup of tea." },
  twitter: { card: "summary_large_image", title: "A Day in Dhaka", description: "One city. One day. A cup of tea." },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: palette[0].skyTop,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Scene 0 palette is the default; Experience's sky timeline rewrites these vars on <html> while scrolling.
    <html lang="en" className={fontVars} style={{ ...toCssVarObject(palette[0]), ...cueVars, ...slipVars } as CSSProperties} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
