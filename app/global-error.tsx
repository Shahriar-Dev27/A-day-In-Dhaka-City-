"use client";

import Link from "next/link";
import { useEffect, type CSSProperties } from "react";
import QuietPage from "@/components/QuietPage";
import { fontVars } from "@/lib/fonts";
import { palette, toCssVarObject } from "@/lib/palette";
import "./globals.css";

// Replaces the root layout when it fails, so it brings its own <html>, fonts and tokens.
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error("Global error", error.digest ?? error.name);
  }, [error]);

  return (
    <html lang="en" className={fontVars} style={toCssVarObject(palette[7]) as CSSProperties}>
      <body>
        <title>Something went wrong · A Day in Dhaka</title>
        <QuietPage bn="কিছু একটা ভুল হয়েছে" en="Something went wrong on our side. Please try again.">
          <button type="button" onClick={() => retry()} className="btn btn-solid">
            <span lang="bn">আবার চেষ্টা করুন</span>
            <span lang="en">Try again</span>
          </button>
          <Link href="/" className="btn btn-ghost">
            <span lang="en">Go home</span>
          </Link>
        </QuietPage>
      </body>
    </html>
  );
}
