import type { SceneId } from "./palette";

// All on-screen copy, verbatim from docs/storyboard/SCRIPT-v2.md section 7 (one file for the native
// Bangla reviewer and for tests/lib.test.mjs). Bangla is spoken register and FROZEN until the native
// review (plan Q1). English: <= 8 words per line (Scene 4 overheard <= 6), enforced by the tests.

export interface Line {
  bn: string;
  en: string;
}
export type CastId =
  | "mama" | "guard" | "worker" | "kid" | "commuter" | "boy" | "father" | "mother" | "son"
  | "puller" | "kiteBoy" | "helper" | "offscreen";
export interface Spoken extends Line {
  who: CastId;
}
export interface SceneCopy {
  narration: Line | null; // register 1: once per scene
  overheard: readonly Spoken[]; // register 2: in quotes, near the speaker (1 line; 2 for an exchange in S2/S7; 3 in S4)
  giant?: readonly Line[]; // S3 only: sign-painter words
  announcement?: Line; // S4 only: the carriage's LED strip
  extra?: Readonly<Record<string, Line>>; // S0 title/prompt, S8 closing/restart/credit (credit: en only)
}

/** The credited name, split out so Scene 8 can set it in its own weight. `credit.en` below is built from it. */
export const CREDIT_NAME = "Shahriar Islam Dip";

/**
 * Portfolio and social links for the end credit. EMPTY ON PURPOSE: no URLs have been supplied and none are
 * invented. Fill it ({ label: "Portfolio", href: "https://..." }) and Scene 8 renders each as a real anchor
 * with rel="noopener noreferrer" (https only; the test rejects anything else). Empty = the name alone.
 */
export const CREDIT_LINKS: readonly { label: string; href: string }[] = [];

export const COPY: Record<SceneId, SceneCopy> = {
  0: {
    narration: null,
    overheard: [],
    extra: {
      title: { bn: "একটি দিন, ঢাকায়", en: "A Day in Dhaka" },
      prompt: { bn: "নিচে স্ক্রল করুন", en: "Scroll to begin" },
    },
  },
  1: {
    narration: { bn: "আজান শেষ, চুলা জ্বলে", en: "The azaan ends, the stove lights." },
    overheard: [{ who: "guard", bn: "মামা, এক কাপ।", en: "One cup, Mama." }],
  },
  2: {
    narration: { bn: "সবাই দেরি করে বেরোয়", en: "Everyone leaves a little late." },
    overheard: [
      { who: "worker", bn: "মামা, ভাংতি নাই।", en: "No change, Mama." },
      { who: "mama", bn: "পরে দিয়েন।", en: "Pay me later." },
    ],
  },
  3: {
    narration: { bn: "৯টা বাজে, ঢাকা থামে না", en: "9 o'clock, and Dhaka never stops." },
    overheard: [{ who: "commuter", bn: "আসতেছি, পাঁচ মিনিট।", en: "Coming, five minutes." }],
    giant: [
      { bn: "আসতেছি", en: "on my way" },
      { bn: "জ্যাম", en: "jam" },
      { bn: "সামনে আগান", en: "move up, please" },
    ],
  },
  4: {
    narration: { bn: "ঢাকাকে উপর থেকে দেখা", en: "Seeing Dhaka from above." },
    overheard: [
      { who: "boy", bn: "বাবা, দেখো! আমরা বাসের উপরে!", en: "Baba, look! We're above the buses!" },
      { who: "commuter", bn: "এইবার সত্যি আসতেছি।", en: "This time I'm really coming." },
      { who: "mother", bn: "ওরে বাবা, কত উঁচু!", en: "Oh my, how high!" },
    ],
    announcement: { bn: "পরবর্তী স্টেশন: ফার্মগেট", en: "Next station: Farmgate" },
    // Set-dressing lettering on the billboards sliding past the carriage window: generic, brand-free
    // Dhaka roadside words. aria-hidden art, listed here so the native reviewer reads one file.
    extra: {
      billboardSale: { bn: "ফ্ল্যাট বিক্রয়", en: "Flats for sale" },
      billboardLetting: { bn: "ভাড়া দেওয়া হবে", en: "To let" },
      billboardAdmission: { bn: "ভর্তি চলছে", en: "Admissions open" },
    },
  },
  5: {
    // en trimmed from SCRIPT-v2's "The harsher the sun, the more precious the shade." (9 words) to meet
    // the plan's <= 8 rule; Bangla untouched. Logged in .devteam/dhaka-v2-tong/02-m0.md.
    narration: { bn: "রোদ যত কড়া, ছায়া তত দামি", en: "The harsher the sun, the dearer the shade." },
    overheard: [{ who: "offscreen", bn: "আবার কারেন্ট গেল!", en: "Power's gone again!" }],
  },
  6: {
    narration: { bn: "ছাদ আমাদের উঠান", en: "The rooftop is our courtyard." },
    overheard: [{ who: "kiteBoy", bn: "ভো-কাট্টা!", en: "Vo-kaatta!" }],
  },
  7: {
    narration: { bn: "বাড়ি ফেরার আগে, একটু আড্ডা", en: "A little adda before home." },
    overheard: [
      { who: "worker", bn: "মামা, সকালেরটা নেন।", en: "Mama, here's this morning's." },
      { who: "mama", bn: "কাটলাম।", en: "Struck it off." },
    ],
  },
  8: {
    narration: { bn: "ঘুমায় শহর, স্বপ্ন জাগে", en: "The city sleeps, the dreams stay awake." },
    overheard: [{ who: "mama", bn: "হ্যাঁ, খাইছি। তুমি খাইছো?", en: "Yes, I ate. Have you?" }],
    extra: {
      credit: { bn: "", en: `Designed and built by ${CREDIT_NAME}` },
      closing: { bn: "কাল আবার।", en: "Again tomorrow." },
      restart: { bn: "আবার শুরু করুন", en: "Scroll up to start again" },
    },
  },
};

// Clock-ticket daypart word: `from` is the inclusive lower bound in minutes since 00:00.
// ভোর < 360, সকাল < 720, দুপুর < 900, বিকেল < 1050, সন্ধ্যা < 1200, রাত after.
export const DAYPART: readonly { from: number; bn: string }[] = [
  { from: 0, bn: "ভোর" },
  { from: 360, bn: "সকাল" },
  { from: 720, bn: "দুপুর" },
  { from: 900, bn: "বিকেল" },
  { from: 1050, bn: "সন্ধ্যা" },
  { from: 1200, bn: "রাত" },
];
