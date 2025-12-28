import { describe, it, expect } from 'vitest';
import { formatBytes } from '@/utils/format-bytes';

describe('formatBytes', () => {
  it('formats bytes and kilobytes with base 1000 by default', () => {
    expect(formatBytes(999)).toBe('999 B');
    expect(formatBytes(1000)).toBe('1 KB');
    expect(formatBytes(1500)).toBe('2 KB');
    expect(formatBytes(500_000)).toBe('500 KB');
  });

  it('formats megabytes with a single decimal by default', () => {
    expect(formatBytes(1_250_000)).toBe('1.3 MB');
  });

  it('returns empty string for invalid inputs', () => {
    expect(formatBytes(Number.NaN)).toBe('');
    expect(formatBytes(-1)).toBe('');
    expect(formatBytes(Number.POSITIVE_INFINITY)).toBe('');
  });

  it('supports base 1024 when requested', () => {
    expect(formatBytes(1024, { base: 1024 })).toBe('1 KB');
  });
});

