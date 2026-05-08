import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFilterState } from '@/components/projects/useFilterState';
import { makeProject } from '@/tests/fixtures/project';

describe('useFilterState', () => {
  const mockProjects = [
    makeProject({
      id: '1',
      title: 'React Dashboard',
      short_description: 'A dashboard built with React',
      description: 'Full description of the React dashboard project',
      tags: ['react', 'typescript'],
    }),
    makeProject({
      id: '2',
      title: 'Three.js Visualization',
      short_description: '3D graphics with Three.js',
      description: 'Interactive 3D visualization using Three.js',
      tags: ['three.js', 'webgl'],
    }),
    makeProject({
      id: '3',
      title: 'React Native App',
      short_description: 'Mobile app with React Native',
      description: 'Cross-platform mobile application',
      tags: ['react', 'mobile'],
    }),
    makeProject({
      id: '4',
      title: 'Node.js API',
      short_description: 'Backend API server',
      description: 'RESTful API built with Node.js',
      tags: ['node', 'api'],
    }),
    makeProject({
      id: '5',
      title: 'Empty Project',
      short_description: null,
      description: null,
      tags: null,
    }),
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should initialize with empty activeTags and empty searchQuery', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      expect(result.current.activeTags).toEqual(new Set());
      expect(result.current.searchQuery).toBe('');
    });

    it('should return all projects when no filters are active', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      expect(result.current.filteredProjects).toHaveLength(5);
      expect(result.current.filteredProjects).toEqual(mockProjects);
    });
  });

  describe('activeTags management', () => {
    it('should add a tag to activeTags', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      act(() => {
        result.current.toggleTag('react');
      });

      expect(result.current.activeTags).toEqual(new Set(['react']));
    });

    it('should remove a tag from activeTags when toggled off', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      act(() => {
        result.current.toggleTag('react');
      });
      act(() => {
        result.current.toggleTag('react');
      });

      expect(result.current.activeTags).toEqual(new Set());
    });

    it('should handle multiple tags with OR logic', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      act(() => {
        result.current.toggleTag('react');
      });
      act(() => {
        result.current.toggleTag('three.js');
      });

      expect(result.current.activeTags).toEqual(new Set(['react', 'three.js']));
    });

    it('should filter projects by single active tag (OR logic)', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      act(() => {
        result.current.toggleTag('react');
      });

      expect(result.current.filteredProjects).toHaveLength(2);
      expect(result.current.filteredProjects.map((p) => p.id)).toEqual(['1', '3']);
    });

    it('should filter projects by multiple active tags (OR logic - union)', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      act(() => {
        result.current.toggleTag('react');
      });
      act(() => {
        result.current.toggleTag('three.js');
      });

      expect(result.current.filteredProjects).toHaveLength(3);
      expect(result.current.filteredProjects.map((p) => p.id)).toEqual(['1', '2', '3']);
    });

    it('should show all projects when no active tags', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      act(() => {
        result.current.toggleTag('react');
      });
      act(() => {
        result.current.setActiveTags(new Set());
      });

      expect(result.current.filteredProjects).toHaveLength(5);
    });

    it('should ignore unknown/invalid tags silently', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      act(() => {
        result.current.setActiveTags(new Set(['unknown-tag', 'fake-tag']));
      });

      expect(result.current.filteredProjects).toHaveLength(0);
    });

    it('should handle null tags in projects', () => {
      const projectsWithNullTags = [
        makeProject({ id: '1', title: 'Null Tag Project', tags: null }),
        makeProject({ id: '2', title: 'Valid Tag Project', tags: ['react'] }),
      ];

      const { result } = renderHook(() => useFilterState(projectsWithNullTags));

      act(() => {
        result.current.toggleTag('react');
      });

      expect(result.current.filteredProjects).toHaveLength(1);
      expect(result.current.filteredProjects[0].id).toBe('2');
    });

    it('should match tags case-insensitively', () => {
      const projectsWithMixedCase = [
        makeProject({ id: '1', title: 'A', tags: ['TypeScript', 'React'] }),
        makeProject({ id: '2', title: 'B', tags: ['typescript', 'next.js'] }),
        makeProject({ id: '3', title: 'C', tags: ['TYPESCRIPT'] }),
      ];

      const { result } = renderHook(() => useFilterState(projectsWithMixedCase));

      act(() => {
        result.current.toggleTag('typescript');
      });

      expect(result.current.filteredProjects).toHaveLength(3);
      expect(result.current.filteredProjects.map((p) => p.id)).toEqual(['1', '2', '3']);
    });
  });

  describe('searchQuery management', () => {
    it('should update searchQuery after debounce', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      act(() => {
        result.current.setSearchQuery('react');
      });

      expect(result.current.searchQuery).toBe('');

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.searchQuery).toBe('react');
    });

    it('should filter projects by search query (case-insensitive)', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      act(() => {
        result.current.setSearchQuery('REACT');
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.filteredProjects).toHaveLength(2);
    });

    it('should match search in title', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      act(() => {
        result.current.setSearchQuery('Dashboard');
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.filteredProjects).toHaveLength(1);
      expect(result.current.filteredProjects[0].id).toBe('1');
    });

    it('should match search in short_description', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      act(() => {
        result.current.setSearchQuery('mobile');
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.filteredProjects).toHaveLength(1);
      expect(result.current.filteredProjects[0].id).toBe('3');
    });

    it('should match search in description', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      act(() => {
        result.current.setSearchQuery('RESTful API');
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.filteredProjects).toHaveLength(1);
      expect(result.current.filteredProjects[0].id).toBe('4');
    });

    it('should show all projects when searchQuery is empty', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      act(() => {
        result.current.setSearchQuery('dashboard');
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      act(() => {
        result.current.setSearchQuery('');
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.filteredProjects).toHaveLength(5);
    });

    it('should handle null short_description and description', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      act(() => {
        result.current.setSearchQuery('Empty');
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.filteredProjects).toHaveLength(1);
      expect(result.current.filteredProjects[0].id).toBe('5');
    });
  });

  describe('combined filtering (activeTags AND searchQuery)', () => {
    it('should apply both tag and search filters', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      act(() => {
        result.current.toggleTag('react');
      });
      act(() => {
        result.current.setSearchQuery('dashboard');
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.filteredProjects).toHaveLength(1);
      expect(result.current.filteredProjects[0].id).toBe('1');
    });

    it('should return empty when tags match but search does not', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      act(() => {
        result.current.toggleTag('three.js');
      });
      act(() => {
        result.current.setSearchQuery('React');
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.filteredProjects).toHaveLength(0);
    });

    it('should return empty when search matches but tags do not', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      act(() => {
        result.current.toggleTag('node');
      });
      act(() => {
        result.current.setSearchQuery('Dashboard');
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.filteredProjects).toHaveLength(0);
    });
  });

  describe('clearFilters', () => {
    it('should clear all filters', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      act(() => {
        result.current.toggleTag('react');
      });
      act(() => {
        result.current.setSearchQuery('dashboard');
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.activeTags).toEqual(new Set());
      expect(result.current.searchQuery).toBe('');
      expect(result.current.filteredProjects).toHaveLength(5);
    });
  });

  describe('debounced search', () => {
    it('should debounce search query updates by 300ms', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      act(() => {
        result.current.setSearchQuery('react');
      });

      expect(result.current.searchQuery).toBe('');

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.searchQuery).toBe('react');
    });

    it('should cancel previous debounce on new input', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      act(() => {
        result.current.setSearchQuery('re');
      });
      act(() => {
        vi.advanceTimersByTime(200);
      });
      act(() => {
        result.current.setSearchQuery('react');
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.searchQuery).toBe('react');
    });
  });

  describe('return object memoization', () => {
    it('should maintain referential identity when state does not change', () => {
      const { result, rerender } = renderHook(() => useFilterState(mockProjects));

      const firstRenderResult = result.current;

      rerender();

      expect(result.current).toBe(firstRenderResult);
    });

    it('should create new return object when activeTags change', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      const firstRenderResult = result.current;

      act(() => {
        result.current.toggleTag('react');
      });

      expect(result.current).not.toBe(firstRenderResult);
    });

    it('should create new return object when searchQuery changes', () => {
      const { result } = renderHook(() => useFilterState(mockProjects));

      const firstRenderResult = result.current;

      act(() => {
        result.current.setSearchQuery('test');
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).not.toBe(firstRenderResult);
    });
  });
});