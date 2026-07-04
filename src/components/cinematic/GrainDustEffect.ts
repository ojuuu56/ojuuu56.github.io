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

  // Rare, warm dust motes — barely there, a touch stronger on reveal
  vec2 gp = floor(uv * 120.0);
  float dust = step(0.9995 - uIntensity * 0.0008, hash(gp + floor(uTime * 6.0)));
  vec3 dustCol = vec3(1.0, 0.9, 0.72) * dust * (0.12 + uIntensity * 0.25);

  // Very soft vignette
  float d = distance(uv, vec2(0.5));
  float vig = smoothstep(0.9, 0.4, d);

  // Subtle luma-only grain so it doesn't wash the frame white
  float amt = 0.018 + uIntensity * 0.015;
  float luma = dot(inputColor.rgb, vec3(0.299, 0.587, 0.114));
  vec3 color = inputColor.rgb + g * amt * (0.35 + luma * 0.65);
  color *= mix(0.92, 1.0, vig);
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
