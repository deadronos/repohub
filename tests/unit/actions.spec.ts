import { describe, it, expect, vi, afterEach } from 'vitest';
import { getActionError, formatError } from '@/utils/actions';

describe('Action Utils', () => {
  describe('getActionError', () => {
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

  describe('formatError', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('should return fallback message in production', () => {
      vi.stubEnv('NODE_ENV', 'production');
      expect(formatError({ message: 'Secret' })).toBe('Failed');
      expect(formatError({ message: 'Secret' }, 'Custom')).toBe('Custom');
    });

    it('should return error message in development if available', () => {
      vi.stubEnv('NODE_ENV', 'development');
      expect(formatError({ message: 'Details' })).toBe('Details');
    });

    it('should return fallback if error is not an object or has no message in dev', () => {
      vi.stubEnv('NODE_ENV', 'development');
      expect(formatError(null)).toBe('Failed');
      expect(formatError({})).toBe('Failed');
      expect(formatError({ message: '' })).toBe('Failed');
    });
  });
});
