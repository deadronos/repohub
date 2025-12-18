import { describe, it, expect } from 'vitest';
import { getActionError } from '@/utils/actions';

describe('Action Utils', () => {
  it('should return null for non-object values', () => {
    expect(getActionError(null)).toBeNull();
    expect(getActionError(undefined)).toBeNull();
    expect(getActionError('error')).toBeNull();
  });

  it('should return null when error is missing or not a string', () => {
    expect(getActionError({})).toBeNull();
    expect(getActionError({ error: 123 })).toBeNull();
  });

  it('should return error string when present', () => {
    expect(getActionError({ error: 'Failed' })).toBe('Failed');
  });
});
