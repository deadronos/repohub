import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock three/webgpu to provide a WebGPURenderer whose init is async
vi.mock('three/webgpu', () => ({
  WebGPURenderer: class MockWebGPURenderer {
    public options: any;
    public isWebGPURenderer = true;
    public backend = { isWebGLBackend: false };
    constructor(options: any) {
      this.options = options;
    }
    init() {
      // call a spy exposed on globalThis so the test can assert the call
      (globalThis as any).__gpuInitSpy?.();
      return Promise.resolve();
    }
  },
}));

// Reuse a small Canvas stub that supports async gl factories
vi.mock('@react-three/fiber', async () => {
  const React = await import('react');

  function Canvas({ onCreated, gl, children, 'data-renderer-type': dataRendererType }: any) {
    const ref = React.useRef<HTMLCanvasElement | null>(null);

    React.useEffect(() => {
      const handleResult = (resultGl: any) => {
        const isGpu = !!(resultGl && resultGl.isWebGPURenderer === true);

        if (ref.current) {
          ref.current.setAttribute('data-renderer-type', isGpu ? 'webgpu' : 'webgl');
        }

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

// Import component after mocks
import WebGPUCanvas from '@/components/WebGPUCanvas';

describe('WebGPUCanvas init', () => {
  beforeEach(() => {
    vi.resetModules();
    (globalThis as any).__gpuInitSpy = vi.fn();
  });

  it('calls WebGPURenderer.init when WebGPURenderer is present', async () => {
    const onCreated = vi.fn();

    render(<WebGPUCanvas onRendererCreated={() => {}} onCreated={onCreated} />);

    const canvas = await screen.findByTestId('r3f-canvas');

    // wait for the mocked init to be called
    await waitFor(() => {
      expect((globalThis as any).__gpuInitSpy).toHaveBeenCalled();
    });

    // ensure onCreated was eventually called (renderer was initialized)
    await waitFor(() => {
      expect(onCreated).toHaveBeenCalled();
    });

    // verify the Canvas reflected that a gpu renderer was used
    expect(canvas).toHaveAttribute('data-renderer-type', 'webgpu');
  });
});
