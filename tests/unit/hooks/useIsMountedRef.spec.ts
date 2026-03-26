import { renderHook } from '@testing-library/react';
import { useIsMountedRef } from '@/utils/hooks/useIsMountedRef';
import { describe, it, expect } from 'vitest';

describe('useIsMountedRef', () => {
  it('should return true when mounted and false when unmounted', () => {
    const { result, unmount } = renderHook(() => useIsMountedRef());

    expect(result.current.current).toBe(true);

    unmount();

    expect(result.current.current).toBe(false);
  });
});
