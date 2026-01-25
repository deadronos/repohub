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
 * need to manually switch between WebGLRenderer and WebGPURenderer.//
// Important: WebGPURenderer requires initialization via `await renderer.init()`
// before calling render. The `gl` factory below will await `init()` when present
// (and supports async init functions) to avoid premature `.render()` calls which
// would throw: ".render() called before the backend is initialized." */
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

  // Legacy WebGL renderer (imported from three/legacy when needed)
  const [LegacyRenderer, setLegacyRenderer] = useState<any | null>(null);

  // Dynamically import WebGPURenderer on mount (client-side only).
  // If it fails (e.g., in test envs or older browsers), try to import the
  // legacy WebGL renderer from `three/legacy` so that react-three-fiber can
  // use the supported legacy renderer without triggering deprecation warnings.
  useEffect(() => {
    import('three/webgpu')
      .then((module) => {
        // Treat a missing exported WebGPURenderer as a failure so we can fall back
        // deterministically without relying on a thrown import error.
        if (!module?.WebGPURenderer) {
          throw new Error('no WebGPURenderer available');
        }

        setWebGPUState({
          loading: false,
          Renderer: module.WebGPURenderer,
          failed: false,
        });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to import WebGPURenderer, falling back to legacy WebGL renderer:', error);
        setWebGPUState({
          loading: false,
          Renderer: null,
          failed: true,
        });

        // Attempt to import an explicit WebGLRenderer implementation from three's
        // source so we can provide it as a clear legacy renderer implementation.
        // This avoids r3f's deprecation warning while keeping a deterministic
        // fallback for environments where WebGPU isn't available.
        // See: https://docs.pmnd.rs/react-three-fiber/api/renderer
        import('three/src/renderers/WebGLRenderer.js')
          .then((mod) => {
            setLegacyRenderer(mod.WebGLRenderer || null);
          })
          .catch(() => {
            // If even the explicit source import fails, leave LegacyRenderer null and
            // allow react-three-fiber to fall back to its default behavior.
            setLegacyRenderer(null);
          });
      });
  }, []);

  // Create gl configuration for Canvas
  const glConfig = useMemo(() => {
    const { Renderer } = webGPUState;
    
    // If a WebGPURenderer is available, use it (it internally falls back to WebGL2 if needed)
    if (Renderer) {
      // If glProp is already a function or renderer instance, prioritize it
      if (typeof glProp === 'function' || (glProp && typeof glProp === 'object' && 'render' in glProp)) {
        return glProp;
      }

      // Create a function that returns WebGPURenderer instance
      // The function signature must match (defaultProps: DefaultGLProps) => Renderer
      return async (defaultProps: DefaultGLProps) => {
        const rendererOptions = {
          canvas: defaultProps.canvas,
          antialias: true,
          alpha: true,
          ...(typeof glProp === 'object' ? glProp : {}),
        };

        // Create renderer instance (constructor or factory)
        let rendererInstance: any;
        try {
          rendererInstance = new Renderer(rendererOptions);
        } catch (e) {
          // If Renderer is a factory function that returns an instance
          rendererInstance = Renderer(rendererOptions);
        }

        // Some renderers (like WebGPURenderer) require initialization before use
        if (rendererInstance && typeof rendererInstance.init === 'function') {
          // init() may be async
          await rendererInstance.init();
        }

        return rendererInstance;
      };
    }

    // No WebGPURenderer: if we explicitly loaded a legacy renderer, use it
    if (LegacyRenderer) {
      return (defaultProps: DefaultGLProps) => {
        const rendererOptions = {
          canvas: defaultProps.canvas,
          antialias: true,
          alpha: true,
          ...(typeof glProp === 'object' ? glProp : {}),
        };

        // Support both constructor and factory export shapes
        try {
          return new LegacyRenderer(rendererOptions);
        } catch (e) {
          return LegacyRenderer(rendererOptions);
        }
      };
    }

    // Otherwise, fall back to whatever was passed in (or let r3f create the default)
    return glProp;
  }, [webGPUState, glProp, LegacyRenderer]);

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
