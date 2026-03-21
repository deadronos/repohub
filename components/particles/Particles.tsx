'use client';

import { useMemo, useRef, type ComponentProps } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import type * as THREE from 'three';
import { applyParticleFrame, generateParticles, wrapPositionAttribute } from '@/utils/particles';

type ParticlesProps = ComponentProps<typeof Points>;

const PARTICLE_COUNT = 5000;

export default function Particles(props: ParticlesProps) {
  const ref = useRef<THREE.Points>(null);
  const [positions, initialPositions] = useMemo(() => generateParticles(PARTICLE_COUNT), []);

  useFrame((state) => {
    if (!ref.current) return;

    // Guard against partial state (can happen during context loss / restore)
    const pointer = state.pointer || { x: 0, y: 0 };
    const elapsed = state.clock?.elapsedTime;
    if (elapsed === undefined) return;

    try {
      const positionAttr = ref.current.geometry.getAttribute('position');
      if (!positionAttr) return;

      const attrLike = wrapPositionAttribute(positionAttr);
      if (!attrLike) return;

      const { rotationX, rotationY } = applyParticleFrame(
        attrLike,
        initialPositions,
        pointer.x ?? 0,
        pointer.y ?? 0,
        elapsed,
        PARTICLE_COUNT,
      );

      // Ensure the renderer sees attribute updates
      positionAttr.needsUpdate = true;

      ref.current.rotation.x = rotationX;
      ref.current.rotation.y = rotationY;
    } catch (err) {
      // Prevent uncaught errors from breaking the render loop
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
