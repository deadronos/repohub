'use client';

import { useEffect, useState, useRef, useMemo, type ComponentProps } from 'react';
import { Canvas, type DefaultGLProps } from '@react-three/fiber';

type WebGPUCanvasProps = ComponentProps<typeof Canvas> & {
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
 * 
 * Note: WebGPURenderer is designed to handle the fallback internally, so we don't
 * need to manually switch between WebGLRenderer and WebGPURenderer.
 */
export default function WebGPUCanvas({
  onRendererCreated,
  onCreated,
  gl: glProp,
  ...props
}: WebGPUCanvasProps) {
  const [rendererType, setRendererType] = useState<'webgpu' | 'webgl' | null>(null);
  const hasNotified = useRef(false);
  const [webGPUState, setWebGPUState] = useState<{
    loading: boolean;
    Renderer: any | null;
    failed: boolean;
  }>({
    loading: true,
    Renderer: null,
    failed: false,
  });

  // Dynamically import WebGPURenderer on mount (client-side only)
  useEffect(() => {
    import('three/webgpu')
      .then((module) => {
        setWebGPUState({
          loading: false,
          Renderer: module.WebGPURenderer,
          failed: false,
        });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to import WebGPURenderer, falling back to standard renderer:', error);
        setWebGPUState({
          loading: false,
          Renderer: null,
          failed: true,
        });
      });
  }, []);

  // Create gl configuration for Canvas
  const glConfig = useMemo(() => {
    const { Renderer } = webGPUState;
    
    if (!Renderer) {
      return glProp;
    }

    // If glProp is already a function or renderer instance, prioritize it
    if (typeof glProp === 'function' || (glProp && typeof glProp === 'object' && 'render' in glProp)) {
      return glProp;
    }

    // Create a function that returns WebGPURenderer instance
    // The function signature must match (defaultProps: DefaultGLProps) => Renderer
    return (defaultProps: DefaultGLProps) => {
      const rendererOptions = {
        canvas: defaultProps.canvas,
        antialias: true,
        alpha: true,
        ...(typeof glProp === 'object' ? glProp : {}),
      };

      return new Renderer(rendererOptions);
    };
  }, [webGPUState, glProp]);

  // Enhanced onCreated callback that detects actual renderer backend
  const handleCreated = (state: Parameters<NonNullable<typeof onCreated>>[0]) => {
    // Detect which backend the WebGPURenderer is using
    const gl = state.gl as any;
    
    // WebGPURenderer has an isWebGPURenderer property
    const isWebGPU = gl.isWebGPURenderer === true;
    
    // Try to determine if it fell back to WebGL
    // WebGPURenderer falls back to WebGL2 backend if WebGPU is not available
    const backend = gl.backend;
    const isUsingWebGL = backend?.isWebGLBackend === true;
    
    const actualType = isWebGPU && !isUsingWebGL ? 'webgpu' : 'webgl';
    
    setRendererType(actualType);
    
    // Notify parent only once
    if (!hasNotified.current && onRendererCreated) {
      onRendererCreated(actualType);
      hasNotified.current = true;
    }

    // Call original onCreated if provided
    if (onCreated) {
      onCreated(state);
    }
  };

  // Show standard Canvas if WebGPU import failed or is still loading
  // This ensures tests and environments without WebGPU work properly
  if (webGPUState.loading) {
    // Return null while loading to avoid rendering twice
    return null;
  }

  return (
    <Canvas
      {...props}
      gl={glConfig}
      onCreated={handleCreated}
      data-renderer-type={rendererType ?? 'pending'}
    />
  );
}
