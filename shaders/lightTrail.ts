export const vertexShader = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export const fragmentShader = `
uniform float uProgress;
uniform float uVelocity;
uniform vec3 uCyan;
uniform vec3 uPink;
varying vec2 vUv;
void main() {
  float speed = abs(uVelocity);
  float light = 0.0;
  vec3 colour = vec3(0.0);
  for (int i = 0; i < 5; i++) {
    float lane = float(i);
    float y = 0.18 + lane * 0.14;
    float head = fract(uProgress * (1.8 + lane * 0.22) + lane * 0.21);
    float direction = uVelocity < 0.0 ? -1.0 : 1.0;
    float behind = (head - vUv.x) * direction;
    float length = 0.1 + speed * 0.55;
    float core = exp(-abs(vUv.y - y) * 180.0);
    float halo = exp(-abs(vUv.y - y) * 30.0) * 0.22;
    float trail = smoothstep(-0.015, 0.01, behind) * (1.0 - smoothstep(0.0, length, behind));
    float intensity = (core + halo) * trail;
    colour += mix(uCyan, uPink, mod(lane, 2.0)) * intensity;
    light += intensity;
  }
  gl_FragColor = vec4(colour, min(light, 0.9));
}
`;
