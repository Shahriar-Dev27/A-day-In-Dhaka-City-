# Asset & licence log

Every shipped asset needs a row (AC-C2). Fonts are self-hosted at build time by `next/font/google` (no runtime request to Google).

| Name | Source | Licence | URL | Scene / use |
|---|---|---|---|---|
| Noto Serif Bengali (variable; bengali + latin subsets) | Google Fonts via `next/font/google` (`lib/fonts.ts`) | SIL Open Font License 1.1 | https://fonts.google.com/noto/specimen/Noto+Serif+Bengali | Narration line, S0 title, clock-ticket daypart word |
| Hind Siliguri 400/500/600 (bengali + latin) | Google Fonts via `next/font/google` (`lib/fonts.ts`) | SIL Open Font License 1.1 | https://fonts.google.com/specimen/Hind+Siliguri | English subtitles, clock-ticket time, uppercase labels |
| Baloo Da 2 (variable; bengali + latin) | Google Fonts via `next/font/google` (`lib/fonts.ts`) | SIL Open Font License 1.1 | https://fonts.google.com/specimen/Baloo+Da+2 | Overheard speech slips, Scene 3 giant words, closing word |
| Page grain (inline SVG feTurbulence as a CSS background data-URI, rasterised once; no runtime filter) | Original, `app/globals.css` `body::after` | Project-owned | n/a | All scenes (static overlay) |
| Riso patterns: halftone dots (3 densities), paper specks, wood planks, lungi and gamchha checks (static SVG `<pattern>`s) | Original, `components/scenes/tong/RisoDefs.tsx` | Project-owned | n/a | Every tong scene; no image file shipped |
| The tong set: awning, booth, counter, kettle and burner, shutter, six-storey block, wires, minarets, signboards (inline SVG) | Original, `components/scenes/tong/TongSet.tsx` + `geometry.ts` (hand-lettered signs are abstract glyph shapes, not real words or brands) | Project-owned | n/a | Scenes 1, 2 (and 5, 7, 8 later) |
| Cast silhouettes: Mama, night guard, garment worker, school kid, newspaper hawker, dog (inline SVG built from tapered ribbons) | Original, `components/scenes/tong/cast.tsx` | Project-owned | n/a | Scenes 1, 2 |
| Direction-responsive pigeon flock (Canvas2D) | Original, `components/scenes/PigeonSwarm.tsx` | Project-owned | n/a | Scene 5; 28 low-tier / 64 high-tier birds; static under reduced motion |
| Scroll/velocity light-trail shader (GLSL) | Original, `shaders/lightTrail.ts` and `components/scenes/LightTrails.tsx` | Project-owned | n/a | Scene 7 (headlights on the wet road); plain WebGL1, no three.js; high-tier/full-motion only; SVG streaks on the low tier and in reduced motion |
| Social preview, chai-glass app icon and Apple icon | Original, `app/opengraph-image.tsx`, `app/icon.svg`, `app/apple-icon.tsx` | Project-owned | n/a | 1200×630 social image; 180×180 Apple icon; no external image source |
| README walkthrough (`docs/media/a-day-in-dhaka.mp4`) | User-supplied `a day in Dhaka.mp4`; original recording preserved | User-provided; no separate licence supplied | [Video](./media/a-day-in-dhaka.mp4) | README; 20.5-second, 1920×1080 H.264/AAC recording |
| Animated README preview (`docs/media/a-day-in-dhaka-preview.gif`) | Derived from the user-supplied walkthrough using FFmpeg | Same source as the walkthrough | [Preview](./media/a-day-in-dhaka-preview.gif) | README; 640×360, 6 fps preview linking to the original MP4 |
