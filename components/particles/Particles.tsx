'use client';

import { useMemo, useRef, type ComponentProps } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import type * as THREE from 'three';
import { applyParticleFrame, generateParticles } from '@/utils/particles';

type ParticlesProps = ComponentProps<typeof Points>;

const PARTICLE_COUNT = 5000;

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

    const { rotationX, rotationY } = applyParticleFrame(
      particlePositions,
      initialPositions,
      pointer.x,
      pointer.y,
      time,
      PARTICLE_COUNT,
    );

    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.x = rotationX;
    ref.current.rotation.y = rotationY;
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
