import { describe, it, expect } from 'vitest';
import { makeProject } from '@/tests/fixtures/project';
import type { Project } from '@/types';
import { extractAllTags } from '@/utils/projects/tags';
import { inferProjectType, PROJECT_TYPE_RULES } from '@/utils/projects/projectType';

describe('Project Tags Utils', () => {
  describe('extractAllTags', () => {
    it('returns sorted unique tags with counts', () => {
      const projects: Project[] = [
        makeProject({ tags: ['react', 'three.js'] }),
        makeProject({ tags: ['react', 'webgl'] }),
        makeProject({ tags: ['three.js', 'experiment'] }),
      ];
      const result = extractAllTags(projects);
      expect(result).toEqual([
        { tag: 'experiment', count: 1 },
        { tag: 'react', count: 2 },
        { tag: 'three.js', count: 2 },
        { tag: 'webgl', count: 1 },
      ]);
    });

    it('returns empty array for null/undefined input', () => {
      expect(extractAllTags(null)).toEqual([]);
      expect(extractAllTags(undefined)).toEqual([]);
    });

    it('returns empty array for empty projects array', () => {
      expect(extractAllTags([])).toEqual([]);
    });

    it('handles projects with null tags', () => {
      const projects: Project[] = [
        makeProject({ tags: null }),
        makeProject({ tags: ['react'] }),
      ];
      expect(extractAllTags(projects)).toEqual([{ tag: 'react', count: 1 }]);
    });

    it('handles projects with undefined tags', () => {
      const projects: Project[] = [
        makeProject({ tags: undefined }),
        makeProject({ tags: ['cli'] }),
      ];
      expect(extractAllTags(projects)).toEqual([{ tag: 'cli', count: 1 }]);
    });

    it('deduplicates tags across projects', () => {
      const projects: Project[] = [
        makeProject({ tags: ['react'] }),
        makeProject({ tags: ['react'] }),
        makeProject({ tags: ['react'] }),
      ];
      expect(extractAllTags(projects)).toEqual([{ tag: 'react', count: 3 }]);
    });

    it('sorts tags alphabetically', () => {
      const projects: Project[] = [
        makeProject({ tags: ['zebra', 'apple'] }),
        makeProject({ tags: ['banana', 'apple'] }),
      ];
      const result = extractAllTags(projects);
      expect(result[0].tag).toBe('apple');
      expect(result[1].tag).toBe('banana');
      expect(result[2].tag).toBe('zebra');
    });
  });

  describe('inferProjectType', () => {
    it('returns Game for game-related tags', () => {
      expect(inferProjectType(['three.js'])).toBe('Game');
      expect(inferProjectType(['react-three-fiber'])).toBe('Game');
      expect(inferProjectType(['webgl'])).toBe('Game');
      expect(inferProjectType(['game'])).toBe('Game');
      expect(inferProjectType(['r3f'])).toBe('Game');
    });

    it('returns Tool for tool-related tags', () => {
      expect(inferProjectType(['docker'])).toBe('Tool');
      expect(inferProjectType(['cli'])).toBe('Tool');
      expect(inferProjectType(['sdk'])).toBe('Tool');
      expect(inferProjectType(['api'])).toBe('Tool');
      expect(inferProjectType(['tool'])).toBe('Tool');
    });

    it('returns Experiment for experiment-related tags', () => {
      expect(inferProjectType(['experiment'])).toBe('Experiment');
      expect(inferProjectType(['demo'])).toBe('Experiment');
      expect(inferProjectType(['prototype'])).toBe('Experiment');
      expect(inferProjectType(['mcp'])).toBe('Experiment');
    });

    it('returns Other for unclassified tags', () => {
      expect(inferProjectType(['react', 'next.js'])).toBe('Other');
      expect(inferProjectType([])).toBe('Other');
      expect(inferProjectType(null)).toBe('Other');
      expect(inferProjectType(undefined)).toBe('Other');
    });

    it('prioritizes Game when multiple category matches exist', () => {
      expect(inferProjectType(['game', 'docker'])).toBe('Game');
    });

    it('handles case-insensitive matching', () => {
      expect(inferProjectType(['Three.js'])).toBe('Game');
      expect(inferProjectType(['REACT-THREE-FIBER'])).toBe('Game');
      expect(inferProjectType(['Docker'])).toBe('Tool');
    });
  });

  describe('PROJECT_TYPE_RULES', () => {
    it('exports the rules object with all categories', () => {
      expect(PROJECT_TYPE_RULES).toBeDefined();
      expect(PROJECT_TYPE_RULES.Game).toEqual(
        expect.arrayContaining(['three.js', 'webgl', 'game', 'r3f', 'react-three-fiber'])
      );
      expect(PROJECT_TYPE_RULES.Tool).toEqual(
        expect.arrayContaining(['docker', 'cli', 'sdk', 'api', 'tool'])
      );
      expect(PROJECT_TYPE_RULES.Experiment).toEqual(
        expect.arrayContaining(['experiment', 'demo', 'prototype', 'mcp'])
      );
    });
  });
});
