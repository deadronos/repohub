import { useEffect, useState, useRef, useMemo } from 'react';
import type {
  WebGPUState,
  GLProps,
  RendererInstance,
  RendererCtor,
  RendererFactory,
  CanvasGlProp,
  RootState
} from './types';
import { isRecord, isRendererExport, hasInit } from './types';

function createRendererInstSync(
  RendererFn: unknown,
  defaultProps: GLProps,
  glProp: CanvasGlProp
): RendererInstance {
  const glOverrides: Record<string, unknown> =
    isRecord(glProp) && typeof glProp !== 'function'
      ? (glProp as Record<string, unknown>)
      : {};

  const rendererOptions: Record<string, unknown> = {
    canvas: defaultProps.canvas,
    antialias: true,
    alpha: true,
    ...glOverrides,
  };

  try {
    return new (RendererFn as RendererCtor)(rendererOptions);
  } catch {
    return (RendererFn as RendererFactory)(rendererOptions);
  }
}

async function createRendererInst(
  RendererFn: unknown,
  defaultProps: GLProps,
  glProp: CanvasGlProp,
  isAsync = false
): Promise<RendererInstance> {
  const rendererInstance = createRendererInstSync(RendererFn, defaultProps, glProp);

  if (isAsync && hasInit(rendererInstance)) {
    await rendererInstance.init();
  }

  return rendererInstance;
}

/**
 * Hook to dynamically load the WebGPURenderer with a legacy WebGL fallback.
 */
export function useWebGPURenderer() {
  const [webGPUState, setWebGPUState] = useState<WebGPUState>({
    loading: true,
    Renderer: null,
    failed: false,
  });

  const [LegacyRenderer, setLegacyRenderer] = useState<unknown>(null);

  useEffect(() => {
    import('three/webgpu')
      .then((module) => {
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
        console.error(
          'Failed to import WebGPURenderer, falling back to legacy WebGL renderer:',
          error,
        );
        setWebGPUState({
          loading: false,
          Renderer: null,
          failed: true,
        });

        import('three/src/renderers/WebGLRenderer.js')
          .then((mod) => {
            setLegacyRenderer(mod.WebGLRenderer || null);
          })
          .catch(() => {
            setLegacyRenderer(null);
          });
      });
  }, []);

  return { webGPUState, LegacyRenderer };
}

/**
 * Hook to create the GL configuration for the R3F Canvas.
 */
export function useGLConfig(
  webGPUState: WebGPUState,
  LegacyRenderer: unknown,
  glProp: CanvasGlProp
) {
  return useMemo(() => {
    const { Renderer } = webGPUState;

    if (Renderer) {
      if (
        typeof glProp === 'function' ||
        (glProp && typeof glProp === 'object' && 'render' in glProp)
      ) {
        return glProp;
      }

      if (!isRendererExport(Renderer)) {
        return glProp;
      }

      const RendererFn = Renderer;

      return async (defaultProps: GLProps) => {
        return createRendererInst(RendererFn, defaultProps, glProp, true);
      };
    }

    if (LegacyRenderer) {
      if (!isRendererExport(LegacyRenderer)) {
        return glProp;
      }

      const LegacyRendererFn = LegacyRenderer;

      return (defaultProps: GLProps) => {
        return createRendererInstSync(LegacyRendererFn, defaultProps, glProp);
      };
    }

    return glProp;
  }, [webGPUState, glProp, LegacyRenderer]);
}

/**
 * Hook to handle renderer creation and detection of the active backend.
 */
export function useRendererDetection(
  onRendererCreated?: (rendererType: 'webgpu' | 'webgl') => void,
  onCreated?: (state: RootState) => void
) {
  const [rendererType, setRendererType] = useState<'webgpu' | 'webgl' | null>(null);
  const hasNotified = useRef(false);

  const handleCreated = (state: RootState) => {
    const gl = state.gl as unknown as RendererInstance;

    const isWebGPU = gl.isWebGPURenderer === true;
    const backend = gl.backend;
    const isUsingWebGL = backend?.isWebGLBackend === true;

    const actualType = isWebGPU && !isUsingWebGL ? 'webgpu' : 'webgl';

    setRendererType(actualType);

    if (!hasNotified.current && onRendererCreated) {
      onRendererCreated(actualType);
      hasNotified.current = true;
    }

    if (onCreated) {
      onCreated(state);
    }
  };

  return { rendererType, handleCreated };
}
