'use client';

import { useEffect, useState } from 'react';
import WebGPUCanvas from '@/components/WebGPUCanvas';
import Particles from '@/components/particles/Particles';

export default function ParticleBackground() {
  const [contextStatus, setContextStatus] = useState<'ok' | 'lost'>('ok');
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);
  const [rendererType, setRendererType] = useState<'webgpu' | 'webgl' | null>(null);

  // Lazy init to read media query without triggering setState in effect body
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  // Respect user's motion preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

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

  // When user prefers reduced motion, render a static scene (frameloop 'never')
  const effectiveContextStatus = prefersReducedMotion ? 'lost' : contextStatus;

  return (
    <div
      className="fixed inset-0 z-[-1] pointer-events-none bg-[#050510]"
      data-testid="particle-background"
      data-webgl-status={contextStatus}
      data-renderer={rendererType ?? 'pending'}
      data-reduced-motion={prefersReducedMotion}
    >
      <WebGPUCanvas
        camera={{ position: [0, 0, 20], fov: 75 }}
        frameloop={effectiveContextStatus === 'lost' ? 'never' : 'always'}
        onCreated={({ gl }) => setCanvasElement(gl.domElement)}
        onRendererCreated={setRendererType}
      >
        <Particles />
      </WebGPUCanvas>
    </div>
  );
}
