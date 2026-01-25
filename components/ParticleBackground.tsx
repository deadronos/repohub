'use client';

import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber/legacy';
import Particles from '@/components/particles/Particles';

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
