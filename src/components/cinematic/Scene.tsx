import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, DepthOfField } from "@react-three/postprocessing";
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
    const x = startX + local * Math.abs(startX) * 2.1;
    ref.current.position.set(x, y + Math.sin(state.clock.elapsedTime * 0.3) * 0.05, z);
    ref.current.lookAt(state.camera.position);
    const visible = local > 0.001 && local < 0.999;
    ref.current.visible = visible;
    contrailRef.current.visible = visible;
    contrailRef.current.position.set(x - 3.5, y + 0.05, z - 0.02);
    contrailRef.current.scale.set(7, 0.18, 1);
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
          color="#ffffff"
          transparent
          opacity={0.35}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

function Rig() {
  useFrame((state) => {
    const p = progress.v;
    const cam = state.camera as THREE.PerspectiveCamera;
    // Phase 1 (0 -> 0.3): dolly toward window
    // Phase 2 (0.3 -> 0.55): pass through
    // Phase 3 (0.55 -> 1): cinematic flight
    const z = THREE.MathUtils.lerp(5, -8, p);
    cam.position.z = z;
    // subtle handheld
    const t = state.clock.elapsedTime;
    cam.position.x = Math.sin(t * 0.12) * 0.08 + p * 0.3;
    cam.position.y = Math.cos(t * 0.15) * 0.05 + p * 0.4;
    cam.rotation.z = Math.sin(t * 0.1) * 0.005;
    // gentle FOV breathe
    cam.fov = THREE.MathUtils.lerp(35, 42, p);
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

      <Cloud position={[-6, -1.5, -8]} scale={2.4} speed={0.6} drift={0.2} />
      <Cloud position={[7, 1.2, -12]} scale={3.2} speed={0.4} drift={1.7} />
      <Cloud position={[-10, 2, -18]} scale={4.5} speed={0.25} drift={3.4} />
      <Cloud position={[12, -2.5, -22]} scale={5.2} speed={0.18} drift={4.9} />
      <Cloud position={[0, 3.5, -30]} scale={7} speed={0.1} drift={6.1} />
      <Cloud position={[-3, -4, -6]} scale={2} speed={0.9} drift={2.3} />

      <Airliner startX={-14} y={1.6} z={-16} scale={1.4} triggerStart={0.58} triggerEnd={0.78} />
      <Airliner startX={9} y={-1.2} z={-25} scale={1.0} triggerStart={0.78} triggerEnd={0.95} />

      <CabinWindow />
      <Rig />

      {ready && (
        <EffectComposer multisampling={0}>
          <DepthOfField focusDistance={0.015} focalLength={0.04} bokehScale={2.2} />
          <Bloom intensity={0.35} luminanceThreshold={0.72} luminanceSmoothing={0.25} mipmapBlur />
          <Vignette eskil={false} offset={0.18} darkness={0.85} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
