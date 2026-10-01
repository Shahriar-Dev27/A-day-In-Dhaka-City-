import { Baloo_Da_2, Hind_Siliguri, Noto_Serif_Bengali } from "next/font/google";

// One display voice (Bangla serif) carries identity; the sans keeps subtitles/UI readable;
// the chunky face is reserved for the rush scene, clock and numerals. All carry the Bengali subset.
export const fontDisplay = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  weight: "variable",
  display: "swap",
  variable: "--font-bn-display",
});

export const fontUi = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-ui",
});

export const fontChunky = Baloo_Da_2({
  subsets: ["bengali", "latin"],
  weight: "variable",
  display: "swap",
  variable: "--font-chunky",
  preload: false, // not needed for first paint; avoids two extra preload tags
});

export const fontVars = `${fontDisplay.variable} ${fontUi.variable} ${fontChunky.variable}`;
