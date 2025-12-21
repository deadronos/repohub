import { describe, it, expect } from 'vitest';
import { getFormString } from '@/utils/form';

describe('Form Utils', () => {
  describe('getFormString', () => {
    it('should return empty string if key is missing', () => {
      const formData = new FormData();
      expect(getFormString(formData, 'missing')).toBe('');
    });

    it('should return trimmed value by default', () => {
      const formData = new FormData();
      formData.set('key', '  value  ');
      expect(getFormString(formData, 'key')).toBe('value');
    });

    it('should return untrimmed value if trim is false', () => {
      const formData = new FormData();
      formData.set('key', '  value  ');
      expect(getFormString(formData, 'key', false)).toBe('  value  ');
    });

    it('should handle empty string value', () => {
      const formData = new FormData();
      formData.set('key', '');
      expect(getFormString(formData, 'key')).toBe('');
    });

    it('should return empty string if value is a File', () => {
      const formData = new FormData();
      formData.set('file', new File([''], 'test.txt'));
      expect(getFormString(formData, 'file')).toBe('');
    });
  });
});
