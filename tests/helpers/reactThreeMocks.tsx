import type { ReactNode } from 'react';

export type FrameState = {
  pointer: { x: number; y: number };
  elapsed: number; // Replaces clock.getElapsedTime() in newer r3f versions
};

export type PointsInstance = {
  geometry: {
    attributes: {
      position: {
        array: Float32Array;
        needsUpdate: boolean;
      };
    };
    getAttribute?: (name: string) => { array: Float32Array; needsUpdate: boolean } | null;
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

  const Points = React.forwardRef(function Points(
    {
      children,
      positions,
    }: {
      children: ReactNode;
      positions: Float32Array;
    },
    ref: React.ForwardedRef<PointsInstance>,
  ) {
    // Avoid render-time side effects on module-level variables.
    // Store the latest instance in an effect so rules-of-hooks stay happy.
    const instance = React.useMemo<PointsInstance>(() => {
      const positionAttr = {
        array: positions,
        needsUpdate: false,
      };

      return {
        geometry: {
          attributes: {
            position: positionAttr,
          },
          getAttribute: (name: string) => {
            if (name !== 'position') return null;
            return positionAttr;
          },
        },
        rotation: { x: 0, y: 0 },
      };
    }, [positions]);

    React.useEffect(() => {
      latestPointsInstance = instance;
      if (typeof ref === 'function') {
        ref(instance);
      } else if (ref) {
        (ref as React.MutableRefObject<PointsInstance | null>).current = instance;
      }
    }, [instance, ref]);

    return <div data-testid="points">{children}</div>;
  });

  Points.displayName = 'Points';

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
