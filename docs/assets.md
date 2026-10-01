# Asset & licence log

Every shipped asset needs a row (AC-C2). Fonts are self-hosted at build time by `next/font/google` (no runtime request to Google).

| Name | Source | Licence | URL | Scene / use |
|---|---|---|---|---|
| Noto Serif Bengali (variable; bengali + latin subsets) | Google Fonts via `next/font/google` (`lib/fonts.ts`) | SIL Open Font License 1.1 | https://fonts.google.com/noto/specimen/Noto+Serif+Bengali | Display: title, per-scene Bangla line, Bangla time chip |
| Hind Siliguri 400/500/600 (bengali + latin) | Google Fonts via `next/font/google` (`lib/fonts.ts`) | SIL Open Font License 1.1 | https://fonts.google.com/specimen/Hind+Siliguri | UI / subtitles |
| Baloo Da 2 (variable; bengali + latin) | Google Fonts via `next/font/google` (`lib/fonts.ts`) | SIL Open Font License 1.1 | https://fonts.google.com/specimen/Baloo+Da+2 | Scene 3 words, clock, Latin time labels |
| Grain texture (inline SVG feTurbulence) | Original, generated in `app/globals.css` | Project-owned | n/a | All scenes (overlay) |
| Placeholder scene silhouettes (inline SVG) | Original, drawn in `components/scenes/*` | Project-owned | n/a | Scenes 0-7 (to be replaced by final art) |
| Scene 1 art: skyline, mosque, minarets, nouka boats, fog, stars (inline SVG paths) | Original, generated in `components/scenes/scene1-art.ts` and drawn in `Scene1Azaan.tsx` (PLAN §7 fallback art) | Project-owned | n/a | Scene 1 (swap for final illustration later; scene contract is art-agnostic) |
| Scene 1 grain tile (inline SVG feTurbulence data-URI, rasterised once, no runtime filter) | Original, `Scene1Azaan.tsx` (same tile as `app/globals.css`) | Project-owned | n/a | Scene 1 overlay; no `public/textures` file shipped |
| Recurring stroller, chai glass in six states, seller/stall, dog and resting puller; wide and close compositions (inline SVG) | Original, `components/scenes/story-kit.tsx` and scene components | Project-owned | n/a | Scenes 1–7; geometric art direction authorized by PLAN §7 fallback |
| Direction-responsive pigeon flock (Canvas2D) | Original, `components/scenes/PigeonSwarm.tsx` | Project-owned | n/a | Scene 5; 28 low-tier / 64 high-tier birds; static under reduced motion |
| Scroll/velocity light-trail shader (GLSL) | Original, `shaders/lightTrail.ts` and `components/scenes/LightTrails.tsx` | Project-owned | n/a | Scene 6; high-tier/full-motion only; illustrated fallback always available |
| Social preview, chai-glass app icon and Apple icon | Original, `app/opengraph-image.tsx`, `app/icon.svg`, `app/apple-icon.tsx` | Project-owned | n/a | 1200×630 social image; 180×180 Apple icon; no external image source |
