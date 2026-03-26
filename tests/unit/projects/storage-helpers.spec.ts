import { describe, it, expect } from 'vitest';
import {
  buildProjectImageFilename,
  getProjectImageStoragePath,
  formatMaxImageSizeError,
  formatUploadTooLargeError,
  isLikelyPayloadTooLarge,
} from '@/utils/projects/storage-helpers';
import { PROJECTS_BUCKET } from '@/utils/projects/constants';

describe('storage-helpers', () => {
  describe('buildProjectImageFilename', () => {
    it('creates a unique sanitized filename', () => {
      const file = new File([''], 'my bad image.jpg');
      const filename = buildProjectImageFilename(file);

      expect(filename).toMatch(/^\d+-my_bad_image\.jpg$/);
    });
  });

  describe('getProjectImageStoragePath', () => {
    it('extracts path from valid supabase storage url', () => {
      const url = `https://test.supabase.co/storage/v1/object/public/${PROJECTS_BUCKET}/my_image.jpg`;
      expect(getProjectImageStoragePath(url)).toBe('my_image.jpg');
    });

    it('returns null for invalid urls', () => {
      expect(getProjectImageStoragePath('not a url')).toBeNull();
    });

    it('returns null for non-supabase storage urls', () => {
      expect(getProjectImageStoragePath('https://example.com/image.jpg')).toBeNull();
    });
  });

  describe('formatMaxImageSizeError', () => {
    it('formats error with size limits', () => {
      expect(formatMaxImageSizeError(2_000_000, 1_000_000)).toBe('Image is 2.0 MB. Max allowed is 1.0 MB.');
    });
  });

  describe('formatUploadTooLargeError', () => {
    it('formats generic upload error', () => {
      expect(formatUploadTooLargeError(5_000_000)).toBe('Upload failed: image must be under 5.0 MB.');
    });
  });

  describe('isLikelyPayloadTooLarge', () => {
    it('detects 413 status code', () => {
      expect(isLikelyPayloadTooLarge({ statusCode: 413 })).toBe(true);
    });

    it('detects message keywords', () => {
      expect(isLikelyPayloadTooLarge({ message: 'Payload too large' })).toBe(true);
      expect(isLikelyPayloadTooLarge({ message: 'Entity too large' })).toBe(true);
      expect(isLikelyPayloadTooLarge({ message: 'size exceeds maximum' })).toBe(true);
    });

    it('returns false for unrelated errors', () => {
      expect(isLikelyPayloadTooLarge({ statusCode: 404 })).toBe(false);
      expect(isLikelyPayloadTooLarge({ message: 'Not found' })).toBe(false);
      expect(isLikelyPayloadTooLarge(null)).toBe(false);
      expect(isLikelyPayloadTooLarge('error')).toBe(false);
    });
  });
});
