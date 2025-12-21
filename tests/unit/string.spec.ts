import { describe, it, expect } from 'vitest';
import { truncate, capitalize, sanitizeFilename } from '@/utils/string';

describe('String Utils', () => {
  describe('truncate', () => {
    it('should return empty string for empty input', () => {
      expect(truncate('', 10)).toBe('');
    });

    it('should not truncate if text is shorter than length', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('should not truncate if text is equal to length', () => {
      expect(truncate('hello', 5)).toBe('hello');
    });

    it('should truncate and add ellipsis if text is longer than length', () => {
      expect(truncate('hello world', 8)).toBe('hello...');
    });

    it('should handle short length constraint', () => {
      expect(truncate('hello', 3)).toBe('...');
    });
  });

  describe('capitalize', () => {
    it('should return empty string for empty input', () => {
      expect(capitalize('')).toBe('');
    });

    it('should capitalize the first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should handle already capitalized strings', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    it('should handle single character strings', () => {
      expect(capitalize('h')).toBe('H');
    });
  });

  describe('sanitizeFilename', () => {
    it('should keep safe filenames', () => {
      expect(sanitizeFilename('image.png')).toBe('image.png');
    });

    it('should replace spaces', () => {
      expect(sanitizeFilename('my image.png')).toBe('my_image.png');
    });

    it('should remove directory traversal chars', () => {
      expect(sanitizeFilename('../../etc/passwd')).toBe('.._.._etc_passwd');
    });

    it('should allow dashes and underscores', () => {
      expect(sanitizeFilename('my-image_v1.jpg')).toBe('my-image_v1.jpg');
    });
  });
});
