import { renderHook, act } from '@testing-library/react';
import { useEscapeKey } from '@/utils/hooks/useEscapeKey';
import { vi, describe, it, expect } from 'vitest';

describe('useEscapeKey', () => {
  it('should call onEscape when Escape is pressed and enabled is true', () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(onEscape, true));

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('should not call onEscape when Escape is pressed and enabled is false', () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(onEscape, false));

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(onEscape).not.toHaveBeenCalled();
  });

  it('should not call onEscape when a different key is pressed', () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(onEscape, true));

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(onEscape).not.toHaveBeenCalled();
  });

  it('should use the latest onEscape callback', () => {
    const onEscape1 = vi.fn();
    const onEscape2 = vi.fn();
    renderHook(
      ({ callback, enabled }) => useEscapeKey(callback, enabled),
      { initialProps: { callback: onEscape1, enabled: true } },
    ).rerender({ callback: onEscape2, enabled: true });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(onEscape1).not.toHaveBeenCalled();
    expect(onEscape2).toHaveBeenCalledTimes(1);
  });
});
