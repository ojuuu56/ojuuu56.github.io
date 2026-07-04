import { Effect } from "postprocessing";
import { Uniform } from "three";

const fragment = /* glsl */ `
uniform float uTime;
uniform float uIntensity;

// Hash-based film grain — cheap, temporally varying
float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 p = uv * resolution.xy;
  float g = hash(p + uTime * 60.0) - 0.5;

  // Soft dust motes: sparse specks that pulse with reveal intensity
  vec2 gp = floor(uv * 90.0);
  float dust = step(0.9975 - uIntensity * 0.0025, hash(gp + floor(uTime * 8.0)));
  vec3 dustCol = vec3(1.0, 0.92, 0.78) * dust * (0.35 + uIntensity * 0.6);

  // Vignette
  float d = distance(uv, vec2(0.5));
  float vig = smoothstep(0.85, 0.35, d);

  // Grain amount: base + reveal boost
  float amt = (0.055 + uIntensity * 0.06);
  vec3 color = inputColor.rgb + g * amt;
  color *= mix(0.78, 1.0, vig);
  color += dustCol;

  outputColor = vec4(color, inputColor.a);
}
`;

export class GrainDustEffect extends Effect {
  constructor() {
    super("GrainDustEffect", fragment, {
      uniforms: new Map<string, Uniform>([
        ["uTime", new Uniform(0)],
        ["uIntensity", new Uniform(0)],
      ]),
    });
  }
  update(_renderer: unknown, _input: unknown, deltaTime: number) {
    const t = this.uniforms.get("uTime")!;
    t.value += deltaTime;
  }
  setIntensity(v: number) {
    this.uniforms.get("uIntensity")!.value = v;
  }
}
