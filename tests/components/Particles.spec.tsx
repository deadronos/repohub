import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Particles from '@/components/particles/Particles';
import {
  getLatestFrameCb,
  getLatestPointsInstance,
  resetReactThreeMocks,
} from '@/tests/helpers/reactThreeMocks';

vi.mock('@react-three/fiber', async () => {
  const { createFiberUseFrameMock } = await import('@/tests/helpers/reactThreeMocks');
  return createFiberUseFrameMock();
});

vi.mock('@react-three/drei', async () => {
  const { createDreiPointsMock } = await import('@/tests/helpers/reactThreeMocks');
  return createDreiPointsMock();
});

describe('Particles component', () => {
  beforeEach(() => {
    resetReactThreeMocks();
    vi.restoreAllMocks();
  });

  it('updates geometry positions and rotation in the frame callback', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(<Particles />);

    const latestFrameCb = getLatestFrameCb();
    const latestPointsInstance = getLatestPointsInstance();

    expect(latestFrameCb).toBeTruthy();
    expect(latestPointsInstance).toBeTruthy();

    if (!latestFrameCb || !latestPointsInstance) {
      throw new Error('Expected frame callback and points instance to be set by mocks');
    }

    latestFrameCb({
      pointer: { x: 1, y: 2 },
      elapsed: 0,
    });

    const positionAttr = latestPointsInstance.geometry.attributes.position;
    expect(positionAttr.needsUpdate).toBe(true);

    // y starts at 0 and moves down
    expect(positionAttr.array[1]).toBeCloseTo(-0.02, 6);

    // rotations match the pointer mapping
    expect(latestPointsInstance.rotation.x).toBeCloseTo(-0.2, 6);
    expect(latestPointsInstance.rotation.y).toBeCloseTo(0.1, 6);
  });

  it('does not throw when state.elapsed is missing', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(<Particles />);

    const latestFrameCb = getLatestFrameCb();
    expect(latestFrameCb).toBeTruthy();

    if (!latestFrameCb) throw new Error('Expected frame callback to be set by mocks');

    expect(() =>
      // call with missing elapsed and missing pointer to simulate partial state
      latestFrameCb({} as any),
    ).not.toThrow();

    expect(consoleSpy).not.toHaveBeenCalled();
  });
});
