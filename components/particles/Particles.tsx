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

    // Guard against partial state (can happen during context loss / restore)
    const { pointer = { x: 0, y: 0 }, clock } = state || {};
    if (!clock || typeof clock.getElapsedTime !== 'function') return;

    try {
      const positionAttr = ref.current.geometry.attributes.position as unknown as {
        array: Float32Array;
        setXYZ?: (idx: number, x: number, y: number, z: number) => void;
      };
      const time = clock.getElapsedTime();

      const { rotationX, rotationY } = applyParticleFrame(
        positionAttr,
        initialPositions,
        pointer.x ?? 0,
        pointer.y ?? 0,
        time,
        PARTICLE_COUNT,
      );

      // BufferAttribute implementations (including WebGPU) should honor setXYZ; ensure renderer sees updates
      if (typeof positionAttr === 'object' && 'needsUpdate' in (ref.current.geometry.attributes.position as any)) {
        (ref.current.geometry.attributes.position as any).needsUpdate = true;
      }

      ref.current.rotation.x = rotationX;
      ref.current.rotation.y = rotationY;
    } catch (err) {
      // Prevent uncaught errors from breaking the render loop
      // eslint-disable-next-line no-console
      console.error('Particles frame error:', err);
    }
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
