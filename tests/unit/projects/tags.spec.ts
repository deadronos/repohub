import { describe, it, expect } from 'vitest';
import { normalizeTags, getVisibleTags, getPrimaryTag, formatTagLabel } from '@/utils/projects/tags';

describe('Project Tags Utils', () => {
  describe('normalizeTags', () => {
    it('normalizes tags by trimming and removing empty/invalid ones', () => {
      expect(normalizeTags([' react ', '', 'next.js', null as any, '  ']))
        .toEqual(['react', 'next.js']);
    });

    it('returns empty array for null or undefined', () => {
      expect(normalizeTags(null)).toEqual([]);
      expect(normalizeTags(undefined)).toEqual([]);
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
