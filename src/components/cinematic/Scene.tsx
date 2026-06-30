import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import windowCabin from "@/assets/window-cabin.jpg";
import skyClouds from "@/assets/sky-clouds.jpg";
import airliner from "@/assets/airliner.png";
import cloudLayer from "@/assets/cloud-layer.png";

gsap.registerPlugin(ScrollTrigger);

// Shared scroll progress (0..1)
const progress = { v: 0 };

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
  startX,
  y,
  z,
  scale,
  triggerStart,
  triggerEnd,
}: {
  startX: number;
  y: number;
  z: number;
  scale: number;
  triggerStart: number;
  triggerEnd: number;
}) {
  const tex = useLoader(TextureLoader, airliner);
  const ref = useRef<THREE.Mesh>(null!);
  const contrailRef = useRef<THREE.Mesh>(null!);
  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
  }, [tex]);
  useFrame((state) => {
    const p = progress.v;
    const local = THREE.MathUtils.clamp(
      (p - triggerStart) / (triggerEnd - triggerStart),
      0,
      1,
    );
    const eased = 0.5 - 0.5 * Math.cos(local * Math.PI);
    // Travel from startX through 0 to -startX (full cross-screen sweep)
    const x = startX * (1 - 2 * eased);
    const bobY = y + Math.sin(state.clock.elapsedTime * 0.4) * 0.06;
    ref.current.position.set(x, bobY, z);
    ref.current.lookAt(state.camera.position);
    ref.current.rotation.z += Math.sign(startX) * 0.06;
    const visible = local > 0.001 && local < 0.999;
    ref.current.visible = visible;
    contrailRef.current.visible = visible;
    // Contrail trails BEHIND the aircraft (toward its origin)
    const dir = Math.sign(startX);
    contrailRef.current.position.set(x + dir * 4 * scale, bobY + 0.02, z - 0.05);
    contrailRef.current.scale.set(8 * scale, 0.22 * scale, 1);
    const mat = contrailRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.6 * Math.sin(local * Math.PI);
  });
  return (
    <>
      <mesh ref={ref} scale={scale}>
        <planeGeometry args={[4, 2]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={contrailRef}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#fff5e6"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </>
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
      Math.sin(t * 0.6) * 0.15;
    ref.current.position.set(
      4.8 + Math.sin(t * 0.08) * 0.2,
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

      {/* Aircraft crossings — larger and closer so they're clearly visible */}
      <Airliner startX={-10} y={1.4} z={-13} scale={2.2} triggerStart={0.42} triggerEnd={0.7} />
      <Airliner startX={9} y={-1.6} z={-18} scale={1.6} triggerStart={0.7} triggerEnd={0.95} />

      <CabinWindow />
      <Rig />

      {ready && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.55} luminanceThreshold={0.7} luminanceSmoothing={0.35} mipmapBlur />
          <Vignette eskil={false} offset={0.22} darkness={0.75} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
