'use client';

import { useEffect, useState } from 'react';
import WebGPUCanvas from '@/components/WebGPUCanvas';
import Particles from '@/components/particles/Particles';

export default function ParticleBackground() {
  const [contextStatus, setContextStatus] = useState<'ok' | 'lost'>('ok');
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);
  const [rendererType, setRendererType] = useState<'webgpu' | 'webgl' | null>(null);

  useEffect(() => {
    if (!canvasElement) return;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setContextStatus('lost');
    };

    const handleContextRestored = () => {
      setContextStatus('ok');
    };

    // Listen for both WebGL and WebGPU context events
    canvasElement.addEventListener('webglcontextlost', handleContextLost);
    canvasElement.addEventListener('webglcontextrestored', handleContextRestored);
    
    // WebGPU uses different event names in some browsers (future-proofing)
    canvasElement.addEventListener('gpucontextlost', handleContextLost);
    canvasElement.addEventListener('gpucontextrestored', handleContextRestored);

    return () => {
      canvasElement.removeEventListener('webglcontextlost', handleContextLost);
      canvasElement.removeEventListener('webglcontextrestored', handleContextRestored);
      canvasElement.removeEventListener('gpucontextlost', handleContextLost);
      canvasElement.removeEventListener('gpucontextrestored', handleContextRestored);
    };
  }, [canvasElement]);

  return (
    <div
      className="fixed inset-0 z-[-1] pointer-events-none bg-[#050510]"
      data-testid="particle-background"
      data-webgl-status={contextStatus}
      data-renderer={rendererType ?? 'pending'}
    >
      <WebGPUCanvas
        camera={{ position: [0, 0, 20], fov: 75 }}
        frameloop={contextStatus === 'lost' ? 'never' : 'always'}
        onCreated={({ gl }) => setCanvasElement(gl.domElement)}
        onRendererCreated={setRendererType}
      >
        <Particles />
      </WebGPUCanvas>
    </div>
  );
}
