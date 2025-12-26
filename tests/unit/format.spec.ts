import { describe, it, expect } from 'vitest';
import { formatDate, formatNumber } from '@/utils/format';

describe('format', () => {
  it('formats numbers with en-US grouping by default', () => {
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(56)).toBe('56');
  });

  it('formats dates with locale and optional timezone', () => {
    expect(
      formatDate('2023-10-10T12:00:00Z', {
        locale: 'en-US',
        timeZone: 'UTC',
      }),
    ).toBe('10/10/2023');
  });

  it('returns empty string for invalid inputs', () => {
    expect(formatNumber(Number.NaN)).toBe('');
    expect(formatDate('not-a-date')).toBe('');
  });
});
