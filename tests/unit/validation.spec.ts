import { describe, it, expect } from 'vitest';
import { isValidUrl } from '@/utils/validation';

describe('Validation Utils', () => {
  describe('isValidUrl', () => {
    it('should return true for valid https url', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
    });

    it('should return true for valid http url', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    it('should return false for javascript protocol', () => {
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
    });

    it('should return false for invalid url', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidUrl('')).toBe(false);
    });
  });
});
