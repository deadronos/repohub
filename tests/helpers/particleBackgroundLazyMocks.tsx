import type { ComponentType } from 'react';

export const dynamicImportCalls = { count: 0 };

export async function createNextDynamicMock() {
  const React = await import('react');

  return {
    default: (loader: () => Promise<unknown>) => {
      return function MockDynamicComponent(props: Record<string, unknown>) {
        const [Component, setComponent] = React.useState<ComponentType<Record<string, unknown>> | null>(
          null,
        );

        React.useEffect(() => {
          dynamicImportCalls.count += 1;
          void (async () => {
            const mod = await loader();
            const resolved = (mod as { default?: ComponentType<Record<string, unknown>> }).default;
            setComponent(() => resolved ?? (mod as ComponentType<Record<string, unknown>>));
          })();
        }, []);

        if (!Component) return null;
        return React.createElement(Component, props);
      };
    },
  };
}

export function createParticleBackgroundMock() {
  return {
    default: function MockParticleBackground() {
      return <div data-testid="particle-bg" />;
    },
  };
}
