"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere, MeshDistortMaterial, Float, Points, PointMaterial } from "@react-three/drei"
import * as THREE from "three"

interface ScentCoreProps {
  color?: string
  intensity?: number
  speed?: number
}

function Particles({ count = 100, color = "#ffffff" }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 5
      p[i * 3 + 1] = (Math.random() - 0.5) * 5
      p[i * 3 + 2] = (Math.random() - 0.5) * 5
    }
    return p
  }, [count])

  const ref = useRef<THREE.Points>(null)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y += 0.001
    ref.current.rotation.x += 0.0005
  })

  return (
    <Points positions={points} ref={ref}>
      <PointMaterial
        transparent
        color={color}
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

export default function ScentCore({
  color = "#a855f7",
  intensity = 1,
  speed = 1
}: ScentCoreProps) {
  const mesh = useRef<THREE.Mesh>(null)
  const outerMesh = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!mesh.current || !outerMesh.current) return
    const t = state.clock.getElapsedTime()
    mesh.current.rotation.x = t * 0.2 * speed
    mesh.current.rotation.y = t * 0.3 * speed

    outerMesh.current.rotation.x = -t * 0.1 * speed
    outerMesh.current.rotation.z = t * 0.2 * speed
  })

  return (
    <Float speed={2 * speed} rotationIntensity={1} floatIntensity={2}>
      {/* Inner Core */}
      <Sphere args={[1, 64, 64]} ref={mesh}>
        <MeshDistortMaterial
          color={color}
          speed={3 * speed}
          distort={0.4 * intensity}
          radius={1}
          emissive={color}
          emissiveIntensity={0.8}
          roughness={0.1}
          metalness={0.9}
        />
      </Sphere>

      {/* Atmospheric Layer */}
      <Sphere args={[1.2, 32, 32]} ref={outerMesh}>
        <MeshDistortMaterial
          color={color}
          speed={1.5 * speed}
          distort={0.2 * intensity}
          radius={1.2}
          transparent
          opacity={0.2}
          wireframe
        />
      </Sphere>

      {/* Aura Glow */}
      <mesh scale={[1.4, 1.4, 1.4]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      <Particles count={200} color={color} />
    </Float>
  )
}
