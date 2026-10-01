# 03 — Security (security-auth)

Scope per 01-plan §1.2 / AC-P10: static Next 16.3.8 site. No API, DB, auth, forms, user input, cookies or third-party scripts, so authN/authZ, CSRF, rate limiting, session config and injection sinks are N/A (nothing to authenticate, nothing to inject into).

Edited: `next.config.ts` (rewritten), `docs/assets.md` (created). Nothing else touched.

## Findings

No Critical or High findings.

| Severity | File:line | Issue | Status |
|---|---|---|---|
| Medium | next.config.ts (missing before) | No security headers / CSP (AC-P10 gap) | **Fixed**: CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geo/payment/usb/topics off), `X-Frame-Options: DENY`, HSTS, `poweredByHeader:false`, on `/(.*)` (next.config.ts:25-41) |
| Medium (accepted) | next.config.ts:12 | `script-src 'unsafe-inline'` is required: Next injects inline RSC/hydration scripts. A nonce CSP would need `proxy` + dynamic rendering, losing SSG/CDN caching, for a page with zero XSS sinks (no `dangerouslySetInnerHTML`, no user input, no URL-param rendering, grep clean). Experimental SRI does not cover inline payloads. | Accepted tradeoff, documented in config comment. Revisit if any user-controlled content or third-party script is added |
| Low (accepted) | next.config.ts:13 | `style-src 'unsafe-inline'`: React `style` props in SSR HTML (sky vars, scene transforms) and next/font need it. Style injection without script execution is low impact here. | Accepted |
| Low | next.config.ts:34 | HSTS `max-age=63072000` without `includeSubDomains`/`preload`: deliberately scoped to this host so it cannot break other subdomains of an unknown production domain. Ignored by browsers over plain http (localhost). | Add `includeSubDomains; preload` once the domain is known and all subdomains are HTTPS (user decision) |
| Low | (future) credits in components/scenes/Scene7Midnight.tsx | No external links exist yet (names only, per 00-assumptions Q8). When credit URLs arrive they need `target="_blank" rel="noopener noreferrer"` (AC-P10). | Open, FD when URLs are added |
| Low | (future) next.config.ts:10-23 | CSP is self-only. Adding analytics (PLAN Q9) or any external font/media origin will be blocked until whitelisted in the CSP. | Note for whoever adds them |
| Info | components/Experience.tsx:178 | `process.env.NODE_ENV` gate for DevJump: build-time constant, not a secret; dev links confirmed absent from production HTML (02a). | OK |
| Info | — | No `.env*` files, no `NEXT_PUBLIC_*` usage; client bundle (`.next/static`) scanned for key/secret patterns: clean. No production source maps. | OK |
| Info | — | `npm audit`: 0 vulnerabilities (all deps and `--omit=dev`). | OK |
| Info | docs/assets.md | Licence log did not exist. | **Fixed**: created with header + rows for the 3 fonts (all SIL OFL 1.1) and the original grain/placeholder SVGs |

## CSP shipped (production)

`default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests`

Dev adds `'unsafe-eval'` (React debug stacks, per Next docs) and `ws:` (HMR), and drops `upgrade-insecure-requests`. `data:` in img-src is for the CSS grain SVG (app/globals.css:87). `font-src 'self'` suffices because next/font self-hosts files under `/_next/static/media` (no Google origin in the build output, verified).

## Verification

- `npm run build`: pass, `/` and `/_not-found` still static (○).
- `next start`: `curl -I /` shows all headers. Headless Chrome via CDP (Log + Runtime): **0 console errors / CSP violations** on `/`, including after scrolling to the bottom (lazy Scenes 2–7 chunks loaded, all 8 scene `aria-label`s present in the hydrated DOM vs 3 in server HTML). `html.lenis` + GSAP `:root` sky vars applied, so hydration and the scroll engine run. `/nope` only logs the expected 404.
- `next dev` (user's existing server on :3000, picked up the config): dev CSP served, page 200, `[HMR] connected`, no CSP violations.

## Auth flow summary

None exists: every request is an anonymous GET for prerendered static HTML/JS/CSS/fonts. There is no session, no identity and no server-side mutation, so there is nothing to authorize. If a form, CMS, or analytics endpoint is ever added, it reopens this gate (validation, rate limiting, CSP origins).

## Compliance notes

- OWASP A05 (Security Misconfiguration): headers added; `X-Powered-By` removed; clickjacking blocked by `frame-ancestors 'none'` + `X-Frame-Options` (legacy browsers).
- OWASP A06 (Vulnerable Components): audit clean. GSAP 3.13+ ships under GSAP's "Standard No Charge" licence (free incl. commercial), so no licence blocker for `gsap`/`@gsap/react`; Lenis is MIT.
- OWASP A03 (Injection/XSS): no sinks; `'unsafe-inline'` is the documented residual risk.
- Rate limiting: N/A, no dynamic endpoints. Rely on the host/CDN's default DDoS protection for static assets.
- Referrer policy `strict-origin-when-cross-origin` keeps full paths off future outbound credit links while preserving origin for analytics-free referral.
