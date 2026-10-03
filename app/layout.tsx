import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import { fontVars } from "@/lib/fonts";
import { cueVars, palette, slipVars, toCssVarObject } from "@/lib/palette";
import "./globals.css";

const TITLE = "A Day in Dhaka — একটি দিন, ঢাকায়";
const DESCRIPTION = "A scroll-driven illustrated story that follows one neighbourhood chai stall through an ordinary late-October day in Dhaka, from the 4:45 AM first cup to the midnight phone call.";

export const metadata: Metadata = {
  // No production domain is set yet; configure NEXT_PUBLIC_SITE_URL so OG image URLs resolve to the real origin.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")),
  title: TITLE,
  description: DESCRIPTION,
  authors: [{ name: "Shahriar Islam Dip" }],
  creator: "Shahriar Islam Dip",
  // Images come from app/opengraph-image.tsx (Next adds og:image and twitter:image automatically).
  openGraph: { type: "website", locale: "en_US", alternateLocale: "bn_BD", title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: palette[0].skyTop, // Night Ink ('lib/palette.ts')
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Scene 0 palette is the default; Experience's sky timeline rewrites these vars on <html> while scrolling.
    <html lang="en" className={fontVars} style={{ ...toCssVarObject(palette[0]), ...cueVars, ...slipVars } as CSSProperties} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
