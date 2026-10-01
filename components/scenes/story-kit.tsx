"use client";

import type { ReactNode, SVGProps } from "react";
import { storyVars } from "@/lib/palette";
import type { Line } from "./scene-kit";

export type CupState = "none" | "full" | "half" | "cold" | "empty" | "refilled" | "given";
export type FigurePose = "cold" | "walk" | "hold-high" | "sit" | "set-down";

export function Cup({ state, ...props }: { state: CupState } & SVGProps<SVGGElement>) {
  if (state === "none") return null;
  const level = state === "half" || state === "cold" ? 42 : 18;
  const hot = state === "full" || state === "refilled" || state === "given";
  return (
    <g data-cup={state} {...props}>
      <g data-cup-body>
      <path d="M-34 0H34L27 82Q0 91-27 82Z" fill="var(--story-glass)" fillOpacity="0.26" stroke="var(--story-rim)" strokeWidth="3" />
      {state !== "empty" && <g data-liquid><path d={`M${-32 + level / 12} ${level}H${32 - level / 12}L25 79Q0 86-25 79Z`} fill="var(--story-tea)" /><ellipse cy={level} rx={32 - level / 12} ry="5" fill="var(--story-gold)" /></g>}
      <path d="M-24 12-18 71M24 13 19 54" fill="none" stroke="var(--story-rim)" strokeWidth="3" opacity="0.5" />
      <ellipse rx="34" ry="6" fill="none" stroke="var(--story-rim)" strokeWidth="3" />
      {hot && <g data-steam fill="none" stroke="var(--story-copy)" strokeWidth="2" opacity="0.45"><path d="M-13-14C-28-33 1-39-10-59M9-12C-3-30 23-39 12-62" /></g>}
      {state === "cold" && <path data-drop d="M21 24q-10 14 0 14t0-14" fill="var(--story-rim)" opacity="0.7" />}
      </g>
      {state === "given" && <circle data-reflection cy={level} r="9" fill="var(--story-gold)" />}
    </g>
  );
}

export function Figure({ pose, ...props }: { pose: FigurePose } & SVGProps<SVGGElement>) {
  const seated = pose === "sit" || pose === "set-down";
  return (
    <g data-figure={pose} style={storyVars} {...props}>
      <path d="M-18-162Q-20-188 0-192Q22-190 20-163L14-148H-12Z" fill="var(--story-skin)" />
      <path d="M-29-145Q0-160 30-144L44-65H-41Z" fill="var(--story-cloth)" />
      <path d="M-29-144 16-149 34-111-34-107Z" fill="var(--story-shawl)" />
      <path d={seated ? "M-40-67H40L79-24 73-5 30-36-22-34-32 0H-53Z" : "M-38-66H37L22 0H5L0-45-10 0H-30Z"} fill="var(--story-cloth)" />
      <path d={pose === "cold" ? "M-28-132-37-99-5-127M26-131 36-101 7-127" : pose === "hold-high" ? "M28-131 49-160 42-215M-28-131-48-91-21-71" : pose === "set-down" ? "M25-126 52-65 86-43M-26-131-41-86-13-59" : "M-28-131-40-87-19-72M28-131 45-96 16-74"} fill="none" stroke="var(--story-shawl)" strokeWidth="16" strokeLinecap="round" />
      <path d={pose === "cold" ? "M-5-127 2-132M7-127 0-134" : pose === "hold-high" ? "M42-215 47-224" : pose === "set-down" ? "M86-43 97-38" : "M16-74 8-79"} stroke="var(--story-skin)" strokeWidth="9" strokeLinecap="round" />
    </g>
  );
}

export function Dog(props: SVGProps<SVGGElement>) {
  return <g data-dog {...props}><path d="M-43 0-42-30Q-26-54 2-40L15-64 32-67 47-50 38-37 29-35 26 0H15L12-23-17-20-29 0ZM-42-29Q-66-48-56-66" fill="var(--story-cloth)" stroke="var(--story-cloth)" strokeWidth="5" strokeLinejoin="round" /><path d="M15-56 31-43" stroke="var(--story-shawl)" strokeWidth="8" /></g>;
}

export function CloseBeat({ label, children }: { label: string; children: ReactNode }) {
  return <div data-close role="group" aria-label={label} className="story-close absolute inset-0" style={storyVars}>{children}</div>;
}

export function CloseArt({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <svg aria-hidden="true" focusable="false" viewBox="0 0 800 700" className={`story-art absolute inset-0 h-full w-full ${className}`} preserveAspectRatio="xMidYMid meet">{children}</svg>;
}

export function TeaStall(props: SVGProps<SVGGElement>) {
  return (
    <g style={storyVars} {...props}>
      <path d="M-220-290H220L250-245H-250Z" className="fill-accent" />
      {[-180, -100, -20, 60, 140].map((x) => <path key={x} d={`M${x}-290h30l22 45h-36Z`} className="fill-glow" />)}
      <circle cy="-265" r="13" fill="var(--story-gold)" stroke="var(--story-cloth)" strokeWidth="4" />
      <path d="M-215-245V0M215-245V0" className="stroke-ink" strokeWidth="12" />
      <Figure pose="walk" transform="translate(30 -50)" />
      <path d="M3-174h50l11 115H-6Z" fill="var(--story-gold)" />
      <rect x="-220" y="-55" width="440" height="22" className="fill-glow" />
      <rect x="-205" y="-33" width="410" height="104" className="fill-accent" />
      <path d="M-152-62q-12-69 29-69t29 69Z" className="fill-ink" />
      <path d="M-96-95-73-112-65-96-98-77M-155-100q-28-10-20 22" fill="none" className="stroke-ink" strokeWidth="9" />
      <path data-stall-steam d="M-132-143q-19-25 2-42M-108-147q18-28-2-43" fill="none" className="stroke-glow" strokeWidth="3" />
      {[-44, -12, 20].map((x) => <Cup key={x} state="full" transform={`translate(${x} -84) scale(0.3)`} />)}
      <ellipse cx="126" cy="-62" rx="48" ry="8" className="fill-ink" />
      <ellipse data-paratha cx="126" cy="-70" rx="35" ry="7" className="fill-glow" />
    </g>
  );
}

export function Puller(props: SVGProps<SVGGElement>) {
  return <g style={storyVars} {...props}><Figure pose="sit" /><path d="M-17-169h36v11h-36Z" fill="var(--story-gold)" /><path d="M-30-88h65v9h-65Z" fill="var(--story-gold)" /></g>;
}

export function FigureLine({ line, spoken = false }: { line: Line; spoken?: boolean }) {
  return <div className="story-line absolute inset-x-0 bottom-[12svh] px-(--gutter) text-center"><p data-beat-close lang="bn" className="font-display text-line font-medium text-balance">{spoken ? `“${line.bn}”` : line.bn}</p><p data-beat-close lang="en" className="mt-3 text-sub text-pretty">{spoken ? `“${line.en}”` : line.en}</p></div>;
}
