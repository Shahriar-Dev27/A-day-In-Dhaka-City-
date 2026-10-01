import type { DeviceTier } from "./scenes";

let cached: DeviceTier | undefined;

function hasWebGL2(): boolean {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext(); // free the probe context (mobile Safari caps contexts)
    return !!gl;
  } catch {
    return false;
  }
}

/** 'low' if <=4 cores, <=4 GB, or no WebGL2. `?tier=low|high` overrides for testing. Server -> 'high'. */
export function getDeviceTier(): DeviceTier {
  if (typeof window === "undefined") return "high";
  const override = new URLSearchParams(window.location.search).get("tier");
  if (override === "low" || override === "high") return override;
  if (cached) return cached;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const low =
    navigator.hardwareConcurrency <= 4 || (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) || !hasWebGL2();
  cached = low ? "low" : "high";
  return cached;
}
