'use client';

import { useMemo, useRef, type ComponentProps } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import type * as THREE from 'three';

type ParticlesProps = ComponentProps<typeof Points>;

const PARTICLE_COUNT = 5000;

const generateParticles = (count: number) => {
  const positions = new Float32Array(count * 3);
  const initialPositions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 50;
    const y = (Math.random() - 0.5) * 50;
    const z = (Math.random() - 0.5) * 50;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    initialPositions[i * 3] = x;
    initialPositions[i * 3 + 1] = y;
    initialPositions[i * 3 + 2] = z;
  }

  return [positions, initialPositions] as const;
};

export default function Particles(props: ParticlesProps) {
  const ref = useRef<THREE.Points>(null);
  const [positions, initialPositions] = useMemo(
    () => generateParticles(PARTICLE_COUNT),
    [],
  );

  useFrame((state) => {
    if (!ref.current) return;

    const { pointer, clock } = state;
    const particlePositions = ref.current.geometry.attributes.position.array as Float32Array;
    const time = clock.getElapsedTime();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      let y = particlePositions[i3 + 1];
      y -= 0.02;

      if (y < -25) {
        y = 25;
      }

      const x =
        initialPositions[i3] + Math.sin(time * 0.5 + initialPositions[i3 + 1] * 0.5) * 0.5;

      particlePositions[i3] = x + pointer.x * 0.05;
      particlePositions[i3 + 1] = y;
    }

    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.x = -pointer.y * 0.1;
    ref.current.rotation.y = pointer.x * 0.1;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#00f0ff"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  );
}
