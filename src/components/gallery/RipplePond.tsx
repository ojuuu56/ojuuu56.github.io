import { useEffect, useRef } from "react";

const MAX = 8;

const VERT = `#version 300 es
in vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
out vec4 o;
uniform vec2 uRes;
uniform float uTime;
uniform vec4 uR[${MAX}]; // xy = pos (uv), z = start time, w = strength

float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv;
  p.y = 1.0 - p.y;

  // Base water color — deep dusk gradient
  vec3 base = mix(vec3(0.02, 0.03, 0.07), vec3(0.06, 0.08, 0.16), uv.y);
  base += vec3(0.08, 0.05, 0.03) * pow(1.0 - length(uv - 0.5), 3.0);

  float h = 0.0;
  for(int i = 0; i < ${MAX}; i++){
    vec2 c = uR[i].xy;
    float t0 = uR[i].z;
    float s = uR[i].w;
    if(s <= 0.0) continue;
    float age = uTime - t0;
    if(age < 0.0 || age > 3.5) continue;
    float d = distance(p, c);
    float wave = sin(d * 42.0 - age * 7.0) * exp(-age * 1.1) * exp(-d * 3.5);
    h += wave * s;
  }

  // Fake normals from height
  vec3 n = normalize(vec3(-dFdx(h) * 30.0, -dFdy(h) * 30.0, 1.0));
  vec3 L = normalize(vec3(0.4, 0.6, 0.7));
  float spec = pow(max(dot(n, L), 0.0), 32.0);

  vec3 col = base + spec * vec3(1.0, 0.85, 0.6) * 0.9;
  col += h * vec3(0.35, 0.25, 0.15);

  // subtle grain
  col += (hash(uv * uRes + uTime) - 0.5) * 0.02;
  o = vec4(col, 1.0);
}`;

export default function RipplePond() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl2", { antialias: true, alpha: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uR = gl.getUniformLocation(prog, "uR");

    const ripples: number[] = new Array(MAX * 4).fill(0);
    let next = 0;
    const start = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = canvas.clientWidth * dpr;
      const h = canvas.clientHeight * dpr;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const addRipple = (nx: number, ny: number, strength = 1) => {
      const t = (performance.now() - start) / 1000;
      const base = next * 4;
      ripples[base] = nx;
      ripples[base + 1] = ny;
      ripples[base + 2] = t;
      ripples[base + 3] = strength;
      next = (next + 1) % MAX;
    };

    // idle ambient ripple
    let idle = setInterval(() => addRipple(Math.random(), Math.random(), 0.35), 1400);

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      addRipple((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, 1);
    };
    canvas.addEventListener("pointerdown", onPointer);
    canvas.addEventListener("pointermove", (e) => {
      if ((e.buttons & 1) === 1) onPointer(e);
    });

    let raf = 0;
    const loop = () => {
      resize();
      const t = (performance.now() - start) / 1000;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform4fv(uR, ripples);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(idle);
      canvas.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.4em] text-amber-100/70">
            Game · 02
          </p>
          <h4 className="mt-1 font-serif text-xl text-white">Touch the water</h4>
        </div>
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.35em] text-white/40">
          click · drag
        </p>
      </div>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm border border-white/10 bg-black">
        <canvas ref={canvasRef} className="block h-full w-full touch-none" />
      </div>
    </div>
  );
}
