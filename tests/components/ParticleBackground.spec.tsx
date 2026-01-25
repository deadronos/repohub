import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ParticleBackground from '@/components/ParticleBackground';

vi.mock('@react-three/fiber', async () => {
  const { createFiberCanvasMock } = await import('@/tests/helpers/reactThreeMocks');
  return createFiberCanvasMock();
});

vi.mock('@react-three/drei', async () => {
  const { createDreiPointsMock } = await import('@/tests/helpers/reactThreeMocks');
  return createDreiPointsMock();
});

import { getLatestPointsInstance, resetReactThreeMocks } from '@/tests/helpers/reactThreeMocks';

describe('ParticleBackground', () => {
  beforeEach(() => {
    resetReactThreeMocks();
    vi.restoreAllMocks();
  });

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

  it('remounts Particles on context restore', async () => {
    render(<ParticleBackground />);

    const canvas = await screen.findByTestId('r3f-canvas');

    // Wait for initial Points instance to be created and capture it
    await waitFor(() => {
      expect(getLatestPointsInstance()).toBeTruthy();
    });

    const initialPoints = getLatestPointsInstance();

    // simulate context lost
    const lostEvent = new Event('webglcontextlost', { cancelable: true });
    canvas.dispatchEvent(lostEvent);

    await waitFor(() => {
      expect(screen.getByTestId('particle-background')).toHaveAttribute('data-webgl-status', 'lost');
    });

    // simulate context restored
    act(() => {
      canvas.dispatchEvent(new Event('webglcontextrestored'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('particle-background')).toHaveAttribute('data-webgl-status', 'ok');
      expect(screen.getByTestId('r3f-canvas')).toHaveAttribute('data-frameloop', 'always');
    });

    const restoredPoints = getLatestPointsInstance();
    expect(restoredPoints).toBeTruthy();
    expect(restoredPoints).not.toBe(initialPoints);
  });
});
