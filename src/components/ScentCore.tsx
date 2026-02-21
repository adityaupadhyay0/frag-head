"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere, MeshDistortMaterial, Float } from "@react-three/drei"
import * as THREE from "three"

interface ScentCoreProps {
  color?: string
  intensity?: number
  speed?: number
}

export default function ScentCore({
  color = "#a855f7",
  intensity = 1,
  speed = 1
}: ScentCoreProps) {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.getElapsedTime()
    mesh.current.rotation.x = t * 0.2 * speed
    mesh.current.rotation.y = t * 0.3 * speed
  })

  return (
    <Float speed={2 * speed} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[1, 64, 64]} ref={mesh}>
        <MeshDistortMaterial
          color={color}
          speed={3 * speed}
          distort={0.4 * intensity}
          radius={1}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>

      {/* Outer Glow / Particles could be added here */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} wireframe />
      </mesh>
    </Float>
  )
}
