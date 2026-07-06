import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  title: string;
  onHover?: (t: string | null) => void;
  seed: number;
};

export default function Frame({ url, position, rotation = [0, 0, 0], title, onHover, seed }: Props) {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ z: 0, lift: 0 });
  const [hovered, setHovered] = useState(false);
  const tex = useTexture(url);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;

  useFrame((state, dt) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const sway = Math.sin(t * 0.6 + seed) * 0.02;
    const bob = Math.sin(t * 0.8 + seed * 1.3) * 0.04;
    target.current.z = hovered ? 0.5 : 0;
    target.current.lift = hovered ? 0.08 : 0;
    group.current.position.z += (position[2] + target.current.z - group.current.position.z) * Math.min(1, dt * 6);
    group.current.position.y += (position[1] + bob + target.current.lift - group.current.position.y) * Math.min(1, dt * 5);
    group.current.rotation.z = sway;
  });

  return (
    <group
      ref={group}
      position={position}
      rotation={rotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover?.(title);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover?.(null);
        document.body.style.cursor = "";
      }}
    >
      {/* Backing / mat */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[1.72, 1.72, 0.08]} />
        <meshStandardMaterial color="#1a120a" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Gilded frame */}
      <mesh>
        <boxGeometry args={[1.62, 1.62, 0.02]} />
        <meshStandardMaterial color="#e6c98a" roughness={0.35} metalness={0.85} />
      </mesh>
      {/* Artwork */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[1.42, 1.42]} />
        <meshStandardMaterial map={tex} roughness={0.7} metalness={0} toneMapped />
      </mesh>
      {/* Rim light halo when hovered */}
      {hovered && (
        <pointLight position={[0, 0, 0.6]} intensity={2.4} distance={2.5} color="#ffd9a3" />
      )}
    </group>
  );
}
