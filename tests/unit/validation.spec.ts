import { describe, it, expect } from 'vitest';
import { isValidUrl, sanitizeFilename, validateProjectInput } from '@/utils/validation';

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

  describe('validateProjectInput', () => {
    it('should return empty array for valid input', () => {
      const input = {
        title: 'My Project',
        repo_url: 'https://github.com/me/repo',
        demo_url: 'https://demo.com'
      };
      expect(validateProjectInput(input)).toEqual([]);
    });

    it('should fail if title is missing', () => {
      expect(validateProjectInput({ title: '' })).toContain('Title is required');
    });

    it('should fail if title is too long', () => {
      const longTitle = 'a'.repeat(101);
      expect(validateProjectInput({ title: longTitle })).toContain('Title must be less than 100 characters');
    });

    it('should fail if repo_url is invalid', () => {
      expect(validateProjectInput({ title: 'Test', repo_url: 'javascript:alert(1)' })).toContain('Invalid Repository URL');
    });

    it('should pass if optional urls are empty', () => {
      expect(validateProjectInput({ title: 'Test', repo_url: '' })).toEqual([]);
    });
  });
});
