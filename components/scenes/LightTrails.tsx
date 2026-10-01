"use client";

import { Component, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Color, type ShaderMaterial } from "three";
import { getScrollVelocityNorm } from "@/lib/scroll";
import { palette } from "@/lib/palette";
import { fragmentShader, vertexShader } from "@/shaders/lightTrail";

class TrailBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

function TrailPlane({ progress }: { progress: RefObject<number> }) {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    uProgress: { value: 0 }, uVelocity: { value: 0 },
    uCyan: { value: new Color(palette[6].accent) }, uPink: { value: new Color(palette[6].glow) },
  }), []);
  useFrame(() => {
    if (!material.current) return;
    material.current.uniforms.uProgress.value = progress.current;
    material.current.uniforms.uVelocity.value = getScrollVelocityNorm();
  });
  return <mesh><planeGeometry args={[2, 2]} /><shaderMaterial ref={material} transparent depthWrite={false} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} /></mesh>;
}

export default function LightTrails({ progress }: { progress: RefObject<number> }) {
  return <TrailBoundary><Canvas aria-hidden="true" fallback={null} dpr={[1, 1.5]} gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}><TrailPlane progress={progress} /></Canvas></TrailBoundary>;
}
