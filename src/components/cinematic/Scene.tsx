import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GrainDustEffect } from "./GrainDustEffect";
import { revealSignal } from "./reveal-signal";

import windowCabin from "@/assets/window-cabin.jpg";
import skyClouds from "@/assets/sky-clouds.jpg";
import airliner from "@/assets/airliner.png";
import cloudLayer from "@/assets/cloud-layer.png";

gsap.registerPlugin(ScrollTrigger);

// Shared scroll progress (0..1)
const progress = { v: 0 };

// GLSL grain + dust post-effect wrapped as an R3F primitive
function GrainDustPass() {
  const effect = useMemo(() => new GrainDustEffect(), []);
  useFrame(() => {
    // Ease revealSignal.v toward target for smooth intensification
    revealSignal.v += (revealSignal.target - revealSignal.v) * 0.08;
    effect.setIntensity(revealSignal.v);
  });
  return <primitive object={effect} />;
}

function CabinWindow() {
  const tex = useLoader(TextureLoader, windowCabin);
  const ref = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);

  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  }, [tex]);

  useFrame(() => {
    const p = progress.v;
    // Stays at z=0 then quickly fades / scales as we pass through it
    const scale = 1 + p * 6.5;
    ref.current.scale.set(scale, scale, 1);
    // Move slightly forward to enhance pass-through feel
    ref.current.position.z = p * 4.5;
    matRef.current.opacity = 1 - THREE.MathUtils.smoothstep(p, 0.18, 0.36);
  });

  // Plane sized to fill 16:9 at z=0 with camera fov 35 and z=5
  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <planeGeometry args={[6.4, 4.27]} />
      <meshBasicMaterial ref={matRef} map={tex} transparent toneMapped={false} />
    </mesh>
  );
}

function SkyDome() {
  const tex = useLoader(TextureLoader, skyClouds);
  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.mapping = THREE.EquirectangularReflectionMapping;
  }, [tex]);
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    ref.current.rotation.y = progress.v * 0.18;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[60, 64, 64]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  );
}

function Cloud({
  position,
  scale,
  speed,
  drift,
}: {
  position: [number, number, number];
  scale: number;
  speed: number;
  drift: number;
}) {
  const tex = useLoader(TextureLoader, cloudLayer);
  const ref = useRef<THREE.Mesh>(null!);
  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
  }, [tex]);
  const start = useMemo(() => position[0], [position]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = progress.v;
    // Parallax: deeper clouds move slower; near clouds rush past
    ref.current.position.x = start + Math.sin(t * 0.05 + drift) * 1.2 - p * speed * 14;
    ref.current.position.y = position[1] + Math.sin(t * 0.08 + drift) * 0.25;
    ref.current.lookAt(state.camera.position);
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <planeGeometry args={[8, 5.3]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} opacity={0.95} toneMapped={false} />
    </mesh>
  );
}

function Airliner({
  homeX,
  homeY,
  homeZ,
  scale,
}: {
  homeX: number;
  homeY: number;
  homeZ: number;
  scale: number;
}) {
  const tex = useLoader(TextureLoader, airliner);
  const ref = useRef<THREE.Mesh>(null!);
  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  }, [tex]);
  useFrame((state) => {
    const p = progress.v;
    // Phase A (0 -> 0.35): plane flies in from the right and settles into place
    // Phase B (0.35 -> 1): plane holds position with subtle bob + parallax drift
    const flyIn = THREE.MathUtils.smoothstep(p, 0.0, 0.35);
    const entryX = 14; // off-screen right
    const x = THREE.MathUtils.lerp(entryX, homeX, flyIn);
    const bob = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    // gentle vertical settle
    const y = THREE.MathUtils.lerp(homeY + 1.2, homeY, flyIn) + bob;
    // gentle push-back in depth on later scroll for parallax
    const z = homeZ - p * 0.6;
    ref.current.position.set(x, y, z);
    ref.current.lookAt(state.camera.position);
    // slight bank during entry, leveling out
    ref.current.rotation.z = (1 - flyIn) * -0.18 + Math.sin(state.clock.elapsedTime * 0.3) * 0.01;
  });
  return (
    <mesh ref={ref} scale={scale}>
      <planeGeometry args={[4, 2]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}


function SunFlare() {
  const ref = useRef<THREE.Mesh>(null!);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uOpacity: { value: 0 },
          uColor: { value: new THREE.Color("#ffd9a8") },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform float uOpacity;
          uniform vec3 uColor;
          void main() {
            float d = distance(vUv, vec2(0.5));
            // core + soft halo
            float core = smoothstep(0.5, 0.0, d);
            float halo = smoothstep(0.5, 0.15, d) * 0.6;
            float a = pow(core, 2.2) + halo * 0.4;
            gl_FragColor = vec4(uColor, a * uOpacity);
          }
        `,
      }),
    [],
  );
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = progress.v;
    const visible = p > 0.32;
    ref.current.visible = visible;
    if (!visible) return;
      const wobble = Math.sin(t * 0.6) * 0.15;
    ref.current.position.set(
      4.8 + Math.sin(t * 0.08) * 0.2 + wobble * 0.2,
      2.8 + Math.cos(t * 0.1) * 0.1,
      -9,
    );
    const s = 1.4 + Math.sin(t * 0.6) * 0.08;
    ref.current.scale.set(s, s, 1);
    ref.current.lookAt(state.camera.position);
    (material.uniforms.uOpacity.value as number) =
      THREE.MathUtils.smoothstep(p, 0.32, 0.55) * 0.9;
  });
  return (
    <mesh ref={ref} material={material} renderOrder={2}>
      <planeGeometry args={[1, 1, 1, 1]} />
    </mesh>
  );
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null!);
  const { geometry, material } = useMemo(() => {
    const count = 900;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = -Math.random() * 30 - 2;
      seeds[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uColor: { value: new THREE.Color("#ffe5c2") },
      },
      vertexShader: `
        attribute float aSeed;
        uniform float uTime;
        uniform float uProgress;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          p.x += sin(uTime * 0.3 + aSeed * 6.28) * 0.6;
          p.y += cos(uTime * 0.25 + aSeed * 6.28) * 0.4;
          p.z += mod(uTime * (0.6 + aSeed * 1.4) + aSeed * 30.0, 30.0) - 15.0;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float dist = -mv.z;
          gl_PointSize = (60.0 / dist) * (0.4 + aSeed * 1.2) * (0.5 + uProgress * 0.8);
          vAlpha = smoothstep(30.0, 4.0, dist) * (0.4 + aSeed * 0.6);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(uColor, a * vAlpha * 0.55);
        }
      `,
    });
    return { geometry: geo, material: mat };
  }, []);

  useFrame((state) => {
    (material.uniforms.uTime.value as number) = state.clock.elapsedTime;
    // Reveal boost intensifies dust density during card reveals
    (material.uniforms.uProgress.value as number) = progress.v + revealSignal.v * 0.6;
  });


  return <points ref={ref} geometry={geometry} material={material} />;
}

function LightStreak() {
  const ref = useRef<THREE.Mesh>(null!);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color("#fff2d6") },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform float uTime;
          uniform vec3 uColor;
          void main() {
            // horizontal streak: bright core along y=0.5, tapered along x
            float y = abs(vUv.y - 0.5);
            float core = smoothstep(0.03, 0.0, y);
            float halo = smoothstep(0.25, 0.0, y) * 0.35;
            float head = smoothstep(0.0, 0.35, vUv.x);
            float tail = smoothstep(1.0, 0.4, vUv.x);
            float a = (core + halo) * head * tail;
            gl_FragColor = vec4(uColor, a);
          }
        `,
      }),
    [],
  );
  useFrame((state) => {
    (material.uniforms.uTime.value as number) = state.clock.elapsedTime;
    // Periodic shooting star every ~14s
    const t = state.clock.elapsedTime;
    const cycle = (t % 14.0) / 14.0;
    const visible = cycle < 0.18 && progress.v > 0.4;
    ref.current.visible = visible;
    if (!visible) return;
    const k = cycle / 0.18; // 0..1
    ref.current.position.set(-10 + k * 22, 3.5 - k * 3.5, -14);
    ref.current.rotation.z = -0.25;
    ref.current.scale.set(6, 0.5, 1);
  });
  return (
    <mesh ref={ref} material={material} renderOrder={3}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

function DistantAirliner() {
  const tex = useLoader(TextureLoader, airliner);
  const ref = useRef<THREE.Mesh>(null!);
  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
  }, [tex]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // slow left-to-right crossing every ~40s, far away
    const cycle = ((t + 6) % 40.0) / 40.0;
    ref.current.position.set(-14 + cycle * 28, -1.6 + Math.sin(t * 0.1) * 0.05, -26);
    ref.current.lookAt(state.camera.position);
    const visible = progress.v > 0.35;
    ref.current.visible = visible;
    (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.55;
  });
  return (
    <mesh ref={ref} scale={1.1}>
      <planeGeometry args={[4, 2]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} opacity={0.55} toneMapped={false} />
    </mesh>
  );
}

function Rig() {
  useFrame((state) => {
    const p = progress.v;
    const cam = state.camera as THREE.PerspectiveCamera;
    // Phase 1 (0 -> 0.3): dolly toward window
    // Phase 2 (0.3 -> 0.55): pass through
    // Phase 3 (0.55 -> 1): cinematic flight — gentle continued forward motion
    const z = THREE.MathUtils.lerp(5, -2.5, p);
    cam.position.z = z;
    // subtle handheld
    const t = state.clock.elapsedTime;
    cam.position.x = Math.sin(t * 0.12) * 0.08 + Math.sin(p * Math.PI) * 0.4;
    cam.position.y = Math.cos(t * 0.15) * 0.05 + p * 0.3;
    cam.rotation.z = Math.sin(t * 0.1) * 0.005;
    cam.fov = THREE.MathUtils.lerp(35, 46, p);
    cam.updateProjectionMatrix();
  });
  return null;
}

export default function Scene() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.2,
      onUpdate: (self) => {
        progress.v = self.progress;
      },
    });
    setReady(true);
    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      camera={{ position: [0, 0, 5], fov: 35, near: 0.1, far: 200 }}
    >
      <color attach="background" args={["#05080d"]} />
      <fog attach="fog" args={["#1a2330", 18, 70]} />
      <SkyDome />

      <Cloud position={[-8, -1.5, -12]} scale={3.2} speed={0.6} drift={0.2} />
      <Cloud position={[9, 1.2, -16]} scale={3.8} speed={0.4} drift={1.7} />
      <Cloud position={[-12, 2, -22]} scale={5} speed={0.25} drift={3.4} />
      <Cloud position={[14, -2.5, -28]} scale={6} speed={0.18} drift={4.9} />
      <Cloud position={[0, 3.5, -36]} scale={8} speed={0.1} drift={6.1} />
      <Cloud position={[-5, -3.5, -10]} scale={2.4} speed={0.85} drift={2.3} />

      <SunFlare />
      <ParticleField />
      <LightStreak />
      <DistantAirliner />

      {/* Hero airliner — flies in once, then holds position with subtle parallax */}
      <Airliner homeX={2.4} homeY={0.4} homeZ={-12} scale={2.4} />

      <CabinWindow />
      <Rig />

      {ready && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.28} luminanceThreshold={0.82} luminanceSmoothing={0.22} mipmapBlur />
          <Vignette eskil={false} offset={0.25} darkness={0.7} />
          <GrainDustPass />
        </EffectComposer>
      )}


    </Canvas>
  );
}
