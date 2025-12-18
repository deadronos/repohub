import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const dynamicImportCalls = { count: 0 };

vi.mock('next/dynamic', async () => {
  const React = await import('react');

  return {
    default: (loader: () => Promise<unknown>) => {
      return function MockDynamicComponent(props: Record<string, unknown>) {
        const [Component, setComponent] = React.useState<React.ComponentType<Record<string, unknown>> | null>(
          null,
        );

        React.useEffect(() => {
          dynamicImportCalls.count += 1;
          void (async () => {
            const mod = await loader();
            const resolved = (mod as { default?: React.ComponentType<Record<string, unknown>> }).default;
            setComponent(() => resolved ?? (mod as React.ComponentType<Record<string, unknown>>));
          })();
        }, []);

        if (!Component) return null;
        return React.createElement(Component, props);
      };
    },
  };
});

vi.mock('@/components/ParticleBackground', () => {
  return {
    default: function MockParticleBackground() {
      return <div data-testid="particle-bg" />;
    },
  };
});

import ParticleBackgroundLazy from '@/components/ParticleBackgroundLazy';

describe('ParticleBackgroundLazy', () => {
  const originalRequestIdleCallback = (window as unknown as { requestIdleCallback?: unknown })
    .requestIdleCallback;
  const originalCancelIdleCallback = (window as unknown as { cancelIdleCallback?: unknown }).cancelIdleCallback;

  beforeEach(() => {
    dynamicImportCalls.count = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
    (window as unknown as { requestIdleCallback?: unknown }).requestIdleCallback = originalRequestIdleCallback;
    (window as unknown as { cancelIdleCallback?: unknown }).cancelIdleCallback = originalCancelIdleCallback;
  });

  it('defers dynamic import until requestIdleCallback fires', async () => {
    let capturedCallback: IdleRequestCallback | null = null;

    (window as unknown as { requestIdleCallback: unknown }).requestIdleCallback = vi.fn(
      (callback: IdleRequestCallback) => {
        capturedCallback = callback;
        return 123;
      },
    );
    (window as unknown as { cancelIdleCallback: unknown }).cancelIdleCallback = vi.fn();

    render(<ParticleBackgroundLazy />);

    expect(screen.queryByTestId('particle-bg')).not.toBeInTheDocument();
    expect(dynamicImportCalls.count).toBe(0);
    expect(capturedCallback).not.toBeNull();

    act(() => {
      capturedCallback?.({ didTimeout: false, timeRemaining: () => 50 });
    });

    expect(await screen.findByTestId('particle-bg')).toBeInTheDocument();
    expect(dynamicImportCalls.count).toBe(1);
  });

  it('falls back to setTimeout when requestIdleCallback is unavailable', async () => {
    vi.useFakeTimers();

    (window as unknown as { requestIdleCallback?: unknown }).requestIdleCallback = undefined;
    (window as unknown as { cancelIdleCallback?: unknown }).cancelIdleCallback = undefined;

    render(<ParticleBackgroundLazy />);
    expect(screen.queryByTestId('particle-bg')).not.toBeInTheDocument();
    expect(dynamicImportCalls.count).toBe(0);

    // Ensure the mount effect schedules the fallback timer before advancing time.
    await act(async () => {});

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Flush the dynamic import promise resolution.
    await act(async () => {});

    expect(screen.getByTestId('particle-bg')).toBeInTheDocument();
    expect(dynamicImportCalls.count).toBe(1);
  });

  it('cancels requestIdleCallback on unmount before idle', () => {
    (window as unknown as { requestIdleCallback: unknown }).requestIdleCallback = vi.fn(() => 456);
    const cancelIdleCallback = vi.fn();
    (window as unknown as { cancelIdleCallback: unknown }).cancelIdleCallback = cancelIdleCallback;

    const { unmount } = render(<ParticleBackgroundLazy />);
    unmount();

    expect(cancelIdleCallback).toHaveBeenCalledWith(456);
    expect(dynamicImportCalls.count).toBe(0);
  });

  it('clears timeout on unmount when using fallback timer', () => {
    vi.useFakeTimers();

    (window as unknown as { requestIdleCallback?: unknown }).requestIdleCallback = undefined;
    (window as unknown as { cancelIdleCallback?: unknown }).cancelIdleCallback = undefined;

    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

    const { unmount } = render(<ParticleBackgroundLazy />);
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
