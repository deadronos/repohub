import { describe, it, expect } from 'vitest';
import { replaceExtension, getExtensionFromMimeType } from '@/utils/images/optimize/filename';

describe('Image Filename Utils', () => {
  describe('replaceExtension', () => {
    it('should replace a standard extension', () => {
      expect(replaceExtension('image.png', 'webp')).toBe('image.webp');
      expect(replaceExtension('photo.jpg', 'png')).toBe('photo.png');
    });

    it('should handle filenames with multiple dots', () => {
      expect(replaceExtension('my.image.file.png', 'webp')).toBe('my.image.file.webp');
    });

    it('should handle filenames with no extension', () => {
      expect(replaceExtension('my-image', 'webp')).toBe('my-image.webp');
    });

    it('should handle filenames starting with a dot', () => {
      expect(replaceExtension('.hidden', 'webp')).toBe('.hidden.webp');
    });

    it('should trim whitespace from the filename', () => {
      expect(replaceExtension('  image.png  ', 'webp')).toBe('image.webp');
    });
  });

  describe('getExtensionFromMimeType', () => {
    it('should return webp for image/webp', () => {
      expect(getExtensionFromMimeType('image/webp')).toBe('webp');
    });

    it('should return jpg for image/jpeg', () => {
      expect(getExtensionFromMimeType('image/jpeg')).toBe('jpg');
    });

    it('should return img for unknown mime types', () => {
      expect(getExtensionFromMimeType('image/png')).toBe('img');
      expect(getExtensionFromMimeType('text/plain')).toBe('img');
      expect(getExtensionFromMimeType('')).toBe('img');
    });
  });
});
