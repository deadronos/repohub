import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFilterSync } from '@/components/projects/useFilterSync';

const replaceMock = vi.fn();
let currentSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useSearchParams: () => currentSearchParams,
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => '/',
}));

describe('useFilterSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentSearchParams = new URLSearchParams();
  });

  it('does not call router.replace on mount when URL and activeTags are both empty', () => {
    const setActiveTags = vi.fn();
    renderHook(() => useFilterSync(new Set(), setActiveTags, ['react', 'typescript']));

    expect(setActiveTags).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('does not call router.replace on mount when unrelated query params exist', () => {
    currentSearchParams = new URLSearchParams('view=grid');
    const setActiveTags = vi.fn();

    renderHook(() => useFilterSync(new Set(), setActiveTags, ['react', 'typescript']));

    expect(setActiveTags).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('reads initial valid tag params from URL on mount and avoids redundant replace', () => {
    currentSearchParams = new URLSearchParams('tag=React&tag=unknown');
    const setActiveTags = vi.fn();

    const { rerender } = renderHook(
      ({ activeTags }) => useFilterSync(activeTags, setActiveTags, ['react', 'typescript']),
      { initialProps: { activeTags: new Set<string>() } },
    );

    expect(setActiveTags).toHaveBeenCalledTimes(1);
    expect(setActiveTags).toHaveBeenCalledWith(new Set(['react']));
    expect(replaceMock).not.toHaveBeenCalled();

    // After state updates to Set(['react']), invalid 'unknown' tag is stripped from URL
    rerender({ activeTags: new Set(['react']) });
    expect(replaceMock).toHaveBeenCalledWith('/?tag=react', { scroll: false });
  });

  it('does not call router.replace when URL already matches initial valid tags', () => {
    currentSearchParams = new URLSearchParams('tag=react');
    const setActiveTags = vi.fn();

    const { rerender } = renderHook(
      ({ activeTags }) => useFilterSync(activeTags, setActiveTags, ['react', 'typescript']),
      { initialProps: { activeTags: new Set<string>() } },
    );

    expect(setActiveTags).toHaveBeenCalledWith(new Set(['react']));

    rerender({ activeTags: new Set(['react']) });
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('calls router.replace when activeTags change after mount', () => {
    const setActiveTags = vi.fn();

    const { rerender } = renderHook(
      ({ activeTags }) => useFilterSync(activeTags, setActiveTags, ['react', 'typescript']),
      { initialProps: { activeTags: new Set<string>() } },
    );

    expect(replaceMock).not.toHaveBeenCalled();

    rerender({ activeTags: new Set(['typescript']) });
    expect(replaceMock).toHaveBeenCalledWith('/?tag=typescript', { scroll: false });
  });
});
