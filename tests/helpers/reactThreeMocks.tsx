import type { ReactNode } from 'react';

export type FrameState = {
  pointer: { x: number; y: number };
  clock: { getElapsedTime: () => number };
};

export type PointsInstance = {
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

export function getLatestFrameCb() {
  return latestFrameCb;
}

export function getLatestPointsInstance() {
  return latestPointsInstance;
}

export function resetReactThreeMocks() {
  latestFrameCb = null;
  latestPointsInstance = null;
}

export function createFiberUseFrameMock() {
  return {
    useFrame: (cb: (state: FrameState) => void) => {
      latestFrameCb = cb;
    },
  };
}

export async function createFiberCanvasMock() {
  const React = await import('react');

  return {
    Canvas: ({
      onCreated,
      frameloop,
      children,
    }: {
      onCreated?: (state: { gl: { domElement: HTMLCanvasElement } }) => void;
      frameloop?: string;
      children?: React.ReactNode;
    }) => {
      const ref = React.useRef<HTMLCanvasElement>(null);

      React.useEffect(() => {
        if (!ref.current) return;
        onCreated?.({ gl: { domElement: ref.current } });
      }, [onCreated]);

      return (
        <>
          <canvas ref={ref} data-testid="r3f-canvas" data-frameloop={frameloop ?? ''} />
          {children}
        </>
      );
    }, 
    useFrame: () => {},
  };
}

export async function createDreiPointsMock() {
  const React = await import('react');

  const Points = React.forwardRef(
    (
      {
        children,
        positions,
      }: {
        children: ReactNode;
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
}

export async function createDreiStubMock() {
  const React = await import('react');

  return {
    Points: React.forwardRef(function Points() {
      return null;
    }),
    PointMaterial: function PointMaterial() {
      return null;
    },
  };
}
