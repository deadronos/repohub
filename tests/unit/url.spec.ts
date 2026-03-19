import { describe, it, expect } from 'vitest';
import { safeParseUrl } from '@/utils/url';

describe('URL Utils', () => {
  describe('safeParseUrl', () => {
    it('should return null for empty string', () => {
      expect(safeParseUrl('')).toBeNull();
    });

    it('should return null for invalid URL', () => {
      expect(safeParseUrl('not-a-url')).toBeNull();
    });

    it('should return URL object for valid https URL', () => {
      const url = 'https://example.com/path?query=1';
      const result = safeParseUrl(url);
      expect(result).toBeInstanceOf(URL);
      expect(result?.href).toBe(url);
    });

    it('should return URL object for valid mailto URL', () => {
      const url = 'mailto:user@example.com';
      const result = safeParseUrl(url);
      expect(result).toBeInstanceOf(URL);
      expect(result?.protocol).toBe('mailto:');
    });

    it('should return URL object for valid file URL', () => {
      const url = 'file:///etc/passwd';
      const result = safeParseUrl(url);
      expect(result).toBeInstanceOf(URL);
      expect(result?.protocol).toBe('file:');
    });

    it('should handle URLs without protocol by returning null', () => {
      // new URL('example.com') throws TypeError in JS
      expect(safeParseUrl('example.com')).toBeNull();
    });
  });
});
