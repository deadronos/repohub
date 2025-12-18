'use client';

import { useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import type * as THREE from 'three';

type ParticlesProps = ComponentProps<typeof Points>;

// Generate random particle positions
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
  
  return [positions, initialPositions];
};

function Particles(props: ParticlesProps) {
  const ref = useRef<THREE.Points>(null);
  
  // Generate random particle positions
  const [positions, initialPositions] = useMemo(() => generateParticles(5000), []);

  // Interact with mouse
  useFrame((state) => {
    if (!ref.current) return;
    
    const { pointer, clock } = state;
    const positions = ref.current.geometry.attributes.position.array as Float32Array;
    const time = clock.getElapsedTime();
    
    for (let i = 0; i < 5000; i++) {
      const i3 = i * 3;
      
      // Basic subtle movement (digital rain flow effect)
      // Moving downwards slowly
      let y = positions[i3 + 1];
      y -= 0.02; // Speed of fall
      
      // Reset if too low
      if (y < -25) {
        y = 25;
      }
      
      // We can add some wave motion
      const x = initialPositions[i3] + Math.sin(time * 0.5 + initialPositions[i3 + 1] * 0.5) * 0.5;
      
      // Update position
      positions[i3] = x;
      positions[i3 + 1] = y;
      // z stays same mostly, or we can add slight drift
      
      // React to mouse: push particles away from cursor
      // Pointer is normalized coords [-1, 1]
      // Map pointer to world coordinates roughly or just affect nearby particles in screen space view
      // Let's do a simple wind effect based on mouse x
      
      positions[i3] += (pointer.x * 0.05);
    }
    
    ref.current.geometry.attributes.position.needsUpdate = true;
    
    // Rotate the whole system slowly
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

export default function ParticleBackground() {
  const [webglStatus, setWebglStatus] = useState<'ok' | 'lost'>('ok');
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasElement) return;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setWebglStatus('lost');
    };

    const handleContextRestored = () => {
      setWebglStatus('ok');
    };

    canvasElement.addEventListener('webglcontextlost', handleContextLost);
    canvasElement.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvasElement.removeEventListener('webglcontextlost', handleContextLost);
      canvasElement.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [canvasElement]);

  return (
    <div
      className="fixed inset-0 z-[-1] pointer-events-none bg-[#050510]"
      data-testid="particle-background"
      data-webgl-status={webglStatus}
    >
      <Canvas
        camera={{ position: [0, 0, 20], fov: 75 }}
        frameloop={webglStatus === 'lost' ? 'never' : 'always'}
        onCreated={({ gl }) => setCanvasElement(gl.domElement)}
      >
        <Particles />
      </Canvas>
    </div>
  );
}
