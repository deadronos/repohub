import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Particles from '@/components/particles/Particles';

type FrameState = {
  pointer: { x: number; y: number };
  clock: { getElapsedTime: () => number };
};

type PointsInstance = {
  geometry: {
    attributes: {
      position: {
        array: Float32Array;
        needsUpdate: boolean;
      };
    };
  };
  rotation: { x: number; y: number };
};

let latestFrameCb: ((state: FrameState) => void) | null = null;
let latestPointsInstance: PointsInstance | null = null;

vi.mock('@react-three/fiber', () => ({
  useFrame: (cb: (state: FrameState) => void) => {
    latestFrameCb = cb;
  },
}));

vi.mock('@react-three/drei', async () => {
  const actualReact = await import('react');

  const Points = actualReact.forwardRef(
    (
      {
        children,
        positions,
      }: {
        children: React.ReactNode;
        positions: Float32Array;
      },
      ref: React.ForwardedRef<PointsInstance>,
    ) => {
      latestPointsInstance = {
        geometry: {
          attributes: {
            position: {
              array: positions,
              needsUpdate: false,
            },
          },
        },
        rotation: { x: 0, y: 0 },
      };

      if (typeof ref === 'function') {
        ref(latestPointsInstance);
      } else if (ref) {
        (ref as React.MutableRefObject<PointsInstance | null>).current = latestPointsInstance;
      }

      return <div data-testid="points">{children}</div>;
    },
  );

  const PointMaterial = () => <div data-testid="point-material" />;

  return {
    Points,
    PointMaterial,
  };
});

describe('Particles component', () => {
  beforeEach(() => {
    latestFrameCb = null;
    latestPointsInstance = null;
    vi.restoreAllMocks();
  });

  it('updates geometry positions and rotation in the frame callback', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(<Particles />);

    expect(latestFrameCb).toBeTruthy();
    expect(latestPointsInstance).toBeTruthy();

    if (!latestFrameCb || !latestPointsInstance) {
      throw new Error('Expected frame callback and points instance to be set by mocks');
    }

    latestFrameCb({
      pointer: { x: 1, y: 2 },
      clock: { getElapsedTime: () => 0 },
    });

    const positionAttr = latestPointsInstance.geometry.attributes.position;
    expect(positionAttr.needsUpdate).toBe(true);

    // y starts at 0 and moves down
    expect(positionAttr.array[1]).toBeCloseTo(-0.02, 6);

    // rotations match the pointer mapping
    expect(latestPointsInstance.rotation.x).toBeCloseTo(-0.2, 6);
    expect(latestPointsInstance.rotation.y).toBeCloseTo(0.1, 6);
  });
});
