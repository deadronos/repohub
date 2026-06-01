import { describe, it, expect, vi, afterEach } from 'vitest';
import { getActionData, getActionError, getActionWarning, formatError } from '@/utils/actions';

describe('Action Utils', () => {
  describe('getActionError', () => {
        it('should return null for non-object values', () => {
      expect(getActionError(null)).toBeNull();
      expect(getActionError(undefined)).toBeNull();
      expect(getActionError('error')).toBeNull();
      expect(getActionError(123)).toBeNull();
      expect(getActionError(true)).toBeNull();
      expect(getActionError(Symbol('test'))).toBeNull();
    });

    it('should return null for array inputs', () => {
      expect(getActionError(['error'])).toBeNull();
    });

    it('should return null when error is missing or not a string', () => {
      expect(getActionError({})).toBeNull();
      expect(getActionError({ error: 123 })).toBeNull();
      expect(getActionError({ error: null })).toBeNull();
      expect(getActionError({ error: true })).toBeNull();
      expect(getActionError({ error: {} })).toBeNull();
      expect(getActionError({ error: [] })).toBeNull();
    });

    it('should return error string when present', () => {
      expect(getActionError({ error: 'Failed' })).toBe('Failed');
    });

    it('should return error string when other properties are also present', () => {
      expect(getActionError({ error: 'Failed', status: 500, message: 'Additional info' })).toBe('Failed');
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

  describe('getActionWarning', () => {
    it('should return null for non-object values', () => {
      expect(getActionWarning(null)).toBeNull();
      expect(getActionWarning(undefined)).toBeNull();
      expect(getActionWarning('warning')).toBeNull();
    });

    it('should return null when warning is missing or not a string', () => {
      expect(getActionWarning({})).toBeNull();
      expect(getActionWarning({ warning: 123 })).toBeNull();
    });

    it('should return warning string when present', () => {
      expect(getActionWarning({ data: true, warning: 'Cleanup incomplete' })).toBe(
        'Cleanup incomplete',
      );
    });
  });

  describe('getActionData', () => {
    it('should return null for non-object values', () => {
      expect(getActionData(null)).toBeNull();
      expect(getActionData(undefined)).toBeNull();
      expect(getActionData('data')).toBeNull();
      expect(getActionData(123)).toBeNull();
    });

    it('should return null when data is missing', () => {
      expect(getActionData({})).toBeNull();
      expect(getActionData({ error: 'Failed' })).toBeNull();
    });

    it('should return the data value typed as the requested type', () => {
      const payload = { deleted: 5 };
      const result = getActionData<{ deleted: number }>({ data: payload });
      expect(result).toBe(payload);
      expect(result?.deleted).toBe(5);
    });

    it('should return null even when data is explicitly null', () => {
      expect(getActionData({ data: null })).toBeNull();
    });
  });
});
