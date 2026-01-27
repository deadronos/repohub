import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock three/webgpu to simulate absence of WebGPURenderer export (causes fallback)
vi.mock('three/webgpu', () => ({ }));

// Provide a mocked legacy WebGLRenderer implementation
// Provide a test-friendly factory that returns a plain object. This
// avoids constructor/new interop issues in the test environment while still
// mimicking the shape r3f checks for (`isWebGLRenderer`).
function MockLegacyRendererFactory(options: any) {
  return { options, isWebGLRenderer: true };
}
vi.mock('three/src/renderers/WebGLRenderer.js', () => ({
  WebGLRenderer: MockLegacyRendererFactory,
}));

// Provide a test-specific @react-three/fiber Canvas implementation that
// calls `gl` (if it's a function) and calls onCreated on every render so
// we can validate what was used to create the renderer.
vi.mock('@react-three/fiber', async () => {
  const React = await import('react');

  function Canvas({ onCreated, gl, children, 'data-renderer-type': dataRendererType }: any) {
    const ref = React.useRef<HTMLCanvasElement | null>(null);

    React.useEffect(() => {
      // simulate r3f invoking the gl creator to produce a renderer instance
      const computeAndNotify = () => {
        const handleResult = (resultGl: any) => {
          const isLegacy = !!(resultGl && resultGl.isWebGLRenderer === true);

          if (ref.current) {
            // update dataset to make assertions simple
            ref.current.setAttribute('data-renderer-type', dataRendererType ?? '');
            ref.current.setAttribute('data-legacy-renderer', isLegacy ? 'true' : 'false');
          }

          // expose the most-recent gl instance to tests for stronger assertions
          (globalThis as any).__lastGlInstance = resultGl;

          onCreated?.({ gl: resultGl || { domElement: ref.current } });
        };

        try {
          if (typeof gl === 'function') {
            const maybe = gl({ canvas: ref.current });
            if (maybe && typeof maybe.then === 'function') {
              maybe.then(handleResult).catch(() => handleResult(null));
            } else {
              handleResult(maybe);
            }
          } else {
            handleResult(gl);
          }
        } catch {
          handleResult(null);
        }
      };

      // Run immediately, and also re-run on the next tick to allow async
      // dynamic imports (like the legacy renderer) to resolve.
      computeAndNotify();
      const id = setTimeout(computeAndNotify, 0);
      return () => clearTimeout(id);
    }, [onCreated, gl, dataRendererType]);

    return (
      <>
        <canvas ref={ref} data-testid="r3f-canvas" />
        {children}
      </>
    );
  }

  return {
    Canvas,
    useFrame: () => {},
  };
});

// Import the component after mocks are established
import WebGPUCanvas from '@/components/WebGPUCanvas';

describe('WebGPUCanvas', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses legacy renderer when WebGPU import fails', async () => {
    const onRendererCreated = vi.fn();

    render(<WebGPUCanvas onRendererCreated={onRendererCreated} />);

    await screen.findByTestId('r3f-canvas');

    // The component should notify that it selected the 'webgl' renderer
    // (since WebGPU export was missing and we provide an explicit legacy fallback)
    await waitFor(() => {
      expect(onRendererCreated).toHaveBeenCalledWith('webgl');
    });

    // Note: we rely on the public observable behavior (renderer type notification)
    // rather than internal timing of dynamic import resolution; this keeps the
    // test robust across runtime scheduling differences.
  });
});
