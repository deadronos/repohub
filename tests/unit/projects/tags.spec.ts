import { describe, it, expect } from 'vitest';
import {
  normalizeTags,
  extractAllTags,
  getVisibleTags,
  getPrimaryTag,
  formatTagLabel,
} from '@/utils/projects/tags';
import type { Project } from '@/types';

describe('Project Tags Utils', () => {
  describe('normalizeTags', () => {
    it('normalizes tags by trimming and removing empty/invalid ones', () => {
      expect(normalizeTags([' react ', '', 'next.js', null, '  '] as any))
        .toEqual(['react', 'next.js']);
    });

    it('returns empty array for null or undefined', () => {
      expect(normalizeTags(null)).toEqual([]);
      expect(normalizeTags(undefined)).toEqual([]);
    });
  });

  describe('extractAllTags', () => {
    const makeProject = (tags: string[] | null): Project =>
      ({
        id: '1',
        title: 'Test',
        short_description: '',
        description: '',
        tags,
        image_url: null,
        created_at: '2023-01-01T00:00:00Z',
        sort_order: 0,
        demo_url: null,
        repo_url: null,
        is_featured: false,
      });

    it('returns empty array for null or undefined input', () => {
      expect(extractAllTags(null)).toEqual([]);
      expect(extractAllTags(undefined)).toEqual([]);
    });

    it('returns sorted tag counts', () => {
      const projects = [
        makeProject(['react', 'next.js']),
        makeProject(['react', 'three.js']),
      ];

      expect(extractAllTags(projects)).toEqual([
        { tag: 'next.js', count: 1 },
        { tag: 'react', count: 2 },
        { tag: 'three.js', count: 1 },
      ]);
    });

    it('merges tags case-insensitively preserving first casing', () => {
      const projects = [
        makeProject(['TypeScript', 'React']),
        makeProject(['typescript', 'react']),
        makeProject(['TYPESCRIPT']),
      ];

      const result = extractAllTags(projects);
      expect(result).toHaveLength(2);

      const tsEntry = result.find((e) => e.tag.toLowerCase() === 'typescript');
      expect(tsEntry).toBeTruthy();
      expect(tsEntry!.count).toBe(3);

      const reactEntry = result.find((e) => e.tag.toLowerCase() === 'react');
      expect(reactEntry).toBeTruthy();
      expect(reactEntry!.count).toBe(2);
    });

    it('handles projects with null tags', () => {
      const projects = [
        makeProject(null),
        makeProject(['react']),
      ];

      expect(extractAllTags(projects)).toEqual([{ tag: 'react', count: 1 }]);
    });

    it('filters out empty string tags', () => {
      const projects = [
        makeProject(['']),
        makeProject(['react', '']),
      ];

      expect(extractAllTags(projects)).toEqual([{ tag: 'react', count: 1 }]);
    });
  });

  describe('getVisibleTags', () => {
    it('returns limited number of tags', () => {
      expect(getVisibleTags(['one', 'two', 'three'], 2)).toEqual(['one', 'two']);
    });
  });

  describe('getPrimaryTag', () => {
    it('returns the first tag', () => {
      expect(getPrimaryTag(['react', 'next.js'])).toBe('react');
    });

    it('returns null if no tags', () => {
      expect(getPrimaryTag([])).toBeNull();
      expect(getPrimaryTag(null)).toBeNull();
    });
  });

  describe('formatTagLabel', () => {
    it('capitalizes tag', () => {
      expect(formatTagLabel('react')).toBe('React');
    });
  });
});
