import { describe, it, expect } from 'vitest';
import {
  parseTagsFromCsv,
  parseProjectFormData,
  validateProjectInput,
} from '@/utils/projects/form';

describe('Project Form Utils', () => {
  describe('parseTagsFromCsv', () => {
    it('should return empty array for empty input', () => {
      expect(parseTagsFromCsv()).toEqual([]);
    });

    it('should trim and filter tag values', () => {
      expect(parseTagsFromCsv('Next.js, TypeScript, , AI')).toEqual([
        'Next.js',
        'TypeScript',
        'AI',
      ]);
    });
  });

  describe('validateProjectInput', () => {
    it('should return empty array for valid input', () => {
      const input = {
        title: 'My Project',
        repoUrl: 'https://github.com/me/repo',
        demoUrl: 'https://demo.com',
      };
      expect(validateProjectInput(input)).toEqual([]);
    });

    it('should fail if title is missing', () => {
      expect(validateProjectInput({ title: ' ' })).toContain('Title is required');
    });

    it('should fail if title is too long', () => {
      const longTitle = 'a'.repeat(101);
      expect(validateProjectInput({ title: longTitle })).toContain(
        'Title must be less than 100 characters',
      );
    });

    it('should fail if repo_url is invalid', () => {
      expect(validateProjectInput({ title: 'Test', repoUrl: 'javascript:alert(1)' })).toContain(
        'Invalid Repository URL',
      );
    });

    it('should fail if demo_url is invalid', () => {
      expect(validateProjectInput({ title: 'Test', demoUrl: 'javascript:alert(1)' })).toContain(
        'Invalid Demo URL',
      );
    });

    it('should pass if optional urls are empty', () => {
      expect(validateProjectInput({ title: 'Test', repoUrl: '' })).toEqual([]);
    });

    it('should handle title with exactly 100 characters', () => {
      const boundaryTitle = 'a'.repeat(100);
      expect(validateProjectInput({ title: boundaryTitle })).toEqual([]);
    });

    it('should trim title before checking length', () => {
      const titleWithSpaces = '  ' + 'a'.repeat(100) + '  ';
      expect(validateProjectInput({ title: titleWithSpaces })).toEqual([]);
    });

    it('should fail if title is empty string', () => {
      expect(validateProjectInput({ title: '' })).toContain('Title is required');
    });

    it('should handle undefined optional fields', () => {
      expect(
        validateProjectInput({ title: 'Test', repoUrl: undefined, demoUrl: undefined }),
      ).toEqual([]);
    });

    it('should ignore whitespace-only optional URLs', () => {
      expect(validateProjectInput({ title: 'Test', repoUrl: '   ', demoUrl: '   ' })).toEqual([]);
    });

    it('should return multiple errors if multiple fields are invalid', () => {
      const errors = validateProjectInput({
        title: '',
        repoUrl: 'not-a-url',
        demoUrl: 'not-a-url',
      });
      expect(errors).toHaveLength(3);
      expect(errors).toContain('Title is required');
      expect(errors).toContain('Invalid Repository URL');
      expect(errors).toContain('Invalid Demo URL');
    });
  });

  describe('parseProjectFormData', () => {
    it('should provide defaults when values are missing', () => {
      const formData = new FormData();
      const parsed = parseProjectFormData(formData);

      expect(parsed.title).toBe('');
      expect(parsed.short_description).toBe('');
      expect(parsed.description).toBe('');
      expect(parsed.repo_url).toBe('');
      expect(parsed.demo_url).toBe('');
      expect(parsed.tags).toEqual([]);
      expect(parsed.imageFile).toBeNull();
      expect(parsed.current_image_url).toBe('');
    });

    it('should normalize and trim form values', () => {
      const formData = new FormData();
      formData.set('id', ' 123 ');
      formData.set('title', ' My Project ');
      formData.set('short_description', ' Short ');
      formData.set('description', ' Description ');
      formData.set('repo_url', ' https://github.com/me/repo ');
      formData.set('demo_url', ' https://demo.com ');
      formData.set('tags', ' Next.js, TypeScript, , AI ');
      formData.set('current_image_url', ' https://example.com/image.png ');
      const file = new File(['data'], 'image.png', { type: 'image/png' });
      formData.set('image', file);

      const parsed = parseProjectFormData(formData);

      expect(parsed.id).toBe('123');
      expect(parsed.title).toBe('My Project');
      expect(parsed.short_description).toBe('Short');
      expect(parsed.description).toBe('Description');
      expect(parsed.repo_url).toBe('https://github.com/me/repo');
      expect(parsed.demo_url).toBe('https://demo.com');
      expect(parsed.tags).toEqual(['Next.js', 'TypeScript', 'AI']);
      expect(parsed.imageFile).toEqual(file);
      expect(parsed.current_image_url).toBe('https://example.com/image.png');
    });

    it('should set imageFile to null if image is not a File', () => {
      const formData = new FormData();
      formData.set('image', 'not-a-file-string');

      const parsed = parseProjectFormData(formData);

      expect(parsed.imageFile).toBeNull();
    });

    it('should fallback to raw repo_url if url is invalid', () => {
      const formData = new FormData();
      formData.set('repo_url', ' javascript:alert(1) ');

      const parsed = parseProjectFormData(formData);

      expect(parsed.repo_url).toBe('javascript:alert(1)');
    });

    it('should fallback to raw repo_url if url is not a github url', () => {
      const formData = new FormData();
      formData.set('repo_url', ' https://gitlab.com/me/repo ');

      const parsed = parseProjectFormData(formData);

      expect(parsed.repo_url).toBe('https://gitlab.com/me/repo');
    });
  });
});
