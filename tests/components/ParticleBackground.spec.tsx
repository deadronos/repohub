import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@react-three/fiber', async () => {
  const React = await import('react');

  return {
    Canvas: ({
      onCreated,
      frameloop,
    }: {
      onCreated?: (state: { gl: { domElement: HTMLCanvasElement } }) => void;
      frameloop?: string;
    }) => {
      const ref = React.useRef<HTMLCanvasElement>(null);

      React.useEffect(() => {
        if (!ref.current) return;
        onCreated?.({ gl: { domElement: ref.current } });
      }, [onCreated]);

      return <canvas ref={ref} data-testid="r3f-canvas" data-frameloop={frameloop ?? ''} />;
    },
    useFrame: () => {},
  };
});

vi.mock('@react-three/drei', async () => {
  const React = await import('react');

  return {
    Points: React.forwardRef(function Points() {
      return null;
    }),
    PointMaterial: function PointMaterial() {
      return null;
    },
  };
});

import ParticleBackground from '@/components/ParticleBackground';

describe('ParticleBackground', () => {
  it('handles WebGL context loss by preventing default and pausing frameloop', async () => {
    render(<ParticleBackground />);

    const wrapper = screen.getByTestId('particle-background');
    expect(wrapper).toHaveAttribute('data-webgl-status', 'ok');

    const canvas = await screen.findByTestId('r3f-canvas');

    await waitFor(() => {
      const event = new Event('webglcontextlost', { cancelable: true });
      canvas.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
      expect(screen.getByTestId('particle-background')).toHaveAttribute('data-webgl-status', 'lost');
    });

    expect(screen.getByTestId('r3f-canvas')).toHaveAttribute('data-frameloop', 'never');
  });

  it('handles WebGL context restore by resuming frameloop', async () => {
    render(<ParticleBackground />);

    const canvas = await screen.findByTestId('r3f-canvas');

    await waitFor(() => {
      const lostEvent = new Event('webglcontextlost', { cancelable: true });
      canvas.dispatchEvent(lostEvent);
      expect(screen.getByTestId('particle-background')).toHaveAttribute('data-webgl-status', 'lost');
    });

    act(() => {
      canvas.dispatchEvent(new Event('webglcontextrestored'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('particle-background')).toHaveAttribute('data-webgl-status', 'ok');
    });

    expect(screen.getByTestId('r3f-canvas')).toHaveAttribute('data-frameloop', 'always');
  });
});
