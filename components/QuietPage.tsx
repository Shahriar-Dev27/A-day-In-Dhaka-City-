import type { CSSProperties, ReactNode } from "react";
import { palette, toCssVarObject } from "@/lib/palette";

/**
 * Shared shell for 404 / error pages: Scene 8's quiet street at night, one lamp, one way back.
 * Server-safe (no hooks) so error boundaries and global-error can reuse it. Tokens are scoped
 * on the wrapper so it looks the same whatever the sky is doing behind it.
 */
export default function QuietPage({
  code,
  bn,
  en,
  children,
}: {
  code?: string;
  bn: string;
  en: string;
  children: ReactNode;
}) {
  return (
    <main
      style={toCssVarObject(palette[8]) as CSSProperties}
      className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-clip bg-[linear-gradient(to_bottom,var(--sky-top),var(--sky-bottom))] px-(--gutter) pt-16 pb-[calc(22svh+2rem)] text-center text-copy"
    >
      {/* One warm lamp: the same circle of light that opens and closes the day. */}
      <div aria-hidden="true" className="relative mb-10 size-3.5 rounded-full bg-glow">
        <div className="lamp-breathe pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[min(90vw,26rem)] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--glow)_45%,transparent),transparent)]" />
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-[22svh] bg-ink" />

      {code && (
        <p style={{ "--i": 0 } as CSSProperties} className="rise font-chunky text-clock font-semibold tracking-[0.2em] text-copy-muted">
          {code}
        </p>
      )}
      <h1 style={{ "--i": 1 } as CSSProperties} className="rise mt-3 max-w-[min(100%,48rem)] text-balance">
        <span lang="bn" className="block font-display text-display font-bold text-copy">
          {bn}
        </span>
        <span lang="en" className="mt-3 block text-sub font-normal text-pretty text-copy-muted">
          {en}
        </span>
      </h1>
      <div style={{ "--i": 2 } as CSSProperties} className="rise mt-10 flex flex-wrap items-center justify-center gap-3">
        {children}
      </div>
    </main>
  );
}
