import { Suspense, useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import Frame from "./Frame";

import p1 from "@/assets/gallery/piece-01.jpg.asset.json";
import p2 from "@/assets/gallery/piece-02.jpg.asset.json";
import p3 from "@/assets/gallery/piece-03.jpg.asset.json";
import p4 from "@/assets/gallery/piece-04.jpg.asset.json";
import p5 from "@/assets/gallery/piece-05.jpg.asset.json";
import p6 from "@/assets/gallery/piece-06.jpg.asset.json";

const pieces = [
  { url: p1.url, title: "Lantern in Mist" },
  { url: p2.url, title: "Paper Crane" },
  { url: p3.url, title: "Red Door" },
  { url: p4.url, title: "Velvet Case" },
  { url: p5.url, title: "Arches" },
  { url: p6.url, title: "Match" },
];

function Arc({ onHover, drag }: { onHover: (t: string | null) => void; drag: { current: number } }) {
  const group = useRef<THREE.Group>(null);
  const auto = useRef(0);
  useFrame((_, dt) => {
    if (!group.current) return;
    auto.current += dt * 0.08;
    // ease drag rotation back toward 0 slowly
    drag.current *= 0.985;
    group.current.rotation.y = auto.current + drag.current;
  });

  const radius = 4.2;
  return (
    <group ref={group}>
      {pieces.map((p, i) => {
        const a = (i / pieces.length) * Math.PI * 2;
        const x = Math.sin(a) * radius;
        const z = Math.cos(a) * radius;
        return (
          <Frame
            key={p.url}
            url={p.url}
            position={[x, 0, z]}
            rotation={[0, a + Math.PI, 0]}
            title={p.title}
            seed={i * 1.7}
            onHover={onHover}
          />
        );
      })}
      {/* Ground disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]} receiveShadow>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial color="#0a0a12" roughness={1} />
      </mesh>
      {/* Soft ceiling spot */}
      <pointLight position={[0, 3, 0]} intensity={4} distance={9} color="#ffd7a8" decay={2} />
    </group>
  );
}

function DragCatcher({ drag }: { drag: { current: number } }) {
  const { gl } = useThree();
  const active = useRef(false);
  const lastX = useRef(0);
  useMemo(() => {
    const dom = gl.domElement;
    const down = (e: PointerEvent) => {
      active.current = true;
      lastX.current = e.clientX;
      dom.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!active.current) return;
      const delta = (e.clientX - lastX.current) / dom.clientWidth;
      lastX.current = e.clientX;
      drag.current += delta * 1.8;
    };
    const up = (e: PointerEvent) => {
      active.current = false;
      try { dom.releasePointerCapture(e.pointerId); } catch { /* noop */ }
    };
    dom.addEventListener("pointerdown", down);
    dom.addEventListener("pointermove", move);
    dom.addEventListener("pointerup", up);
    dom.addEventListener("pointercancel", up);
    return () => {
      dom.removeEventListener("pointerdown", down);
      dom.removeEventListener("pointermove", move);
      dom.removeEventListener("pointerup", up);
      dom.removeEventListener("pointercancel", up);
    };
  }, [gl, drag]);
  return null;
}

export default function Hangar() {
  const [label, setLabel] = useState<string | null>(null);
  const drag = useRef(0);
  return (
    <div className="relative h-full w-full">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0.4, 7.5], fov: 45 }}
      >
        <color attach="background" args={["#05070c"]} />
        <fog attach="fog" args={["#05070c", 6, 16]} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[3, 5, 4]} intensity={0.6} color="#ffd9a3" />
        <Suspense fallback={null}>
          <Arc onHover={setLabel} drag={drag} />
        </Suspense>
        <DragCatcher drag={drag} />
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.55} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur />
          <Vignette eskil={false} offset={0.25} darkness={0.85} />
        </EffectComposer>
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
        <div className="rounded-full border border-white/15 bg-black/40 px-5 py-2 font-mono text-[0.6rem] uppercase tracking-[0.4em] text-white/70 backdrop-blur-md">
          {label ?? "drag to walk the room"}
        </div>
      </div>
    </div>
  );
}
