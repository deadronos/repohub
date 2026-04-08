'use client';

import { type ComponentProps } from 'react';
import { Canvas } from '@react-three/fiber';
import { type CanvasGlProp } from './types';
import { useWebGPURenderer, useGLConfig, useRendererDetection } from './hooks';

type Props = ComponentProps<typeof Canvas> & {
  onRendererCreated?: (rendererType: 'webgpu' | 'webgl') => void;
};

/**
 * Enhanced Canvas component that uses WebGPURenderer with automatic WebGL fallback.
 *
 * This component:
 * - Dynamically imports WebGPURenderer from 'three/webgpu'
 * - WebGPURenderer automatically falls back to WebGL2 if WebGPU is not supported
 * - Provides callback to notify parent of which renderer backend is being used
 * - Maintains all standard react-three-fiber Canvas functionality
 * - Falls back to standard Canvas if WebGPU import fails (e.g., in test environments)
 */
export default function WebGPUCanvas({
  onRendererCreated,
  onCreated,
  gl: glProp,
  ...props
}: Props) {
  const { webGPUState, LegacyRenderer } = useWebGPURenderer();

  const glConfig = useGLConfig(webGPUState, LegacyRenderer, glProp);

  const { rendererType, handleCreated } = useRendererDetection(
    onRendererCreated,
    onCreated
  );

  // Show nothing while loading the renderer to avoid double initialization or flickering
  if (webGPUState.loading) {
    return null;
  }

  return (
    <Canvas
      {...props}
      gl={glConfig as CanvasGlProp}
      onCreated={handleCreated}
      data-renderer-type={rendererType ?? 'pending'}
    />
  );
}
