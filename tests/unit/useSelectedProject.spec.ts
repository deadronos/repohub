import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSelectedProject } from '@/components/projects/useSelectedProject';
import { makeProject } from '@/tests/fixtures/project';

describe('useSelectedProject', () => {
  const mockProjects = [
    makeProject({ id: '1', title: 'Project 1' }),
    makeProject({ id: '2', title: 'Project 2' }),
  ];

  it('should initialize with null selectedId and selectedProject', () => {
    const { result } = renderHook(() => useSelectedProject(mockProjects));
    expect(result.current.selectedId).toBeNull();
    expect(result.current.selectedProject).toBeNull();
  });

  it('should set selectedId and update selectedProject', () => {
    const { result } = renderHook(() => useSelectedProject(mockProjects));

    act(() => {
      result.current.setSelectedId('1');
    });

    expect(result.current.selectedId).toBe('1');
    expect(result.current.selectedProject).toEqual(mockProjects[0]);
  });

  it('should return null for selectedProject if id not found', () => {
    const { result } = renderHook(() => useSelectedProject(mockProjects));

    act(() => {
      result.current.setSelectedId('non-existent');
    });

    expect(result.current.selectedId).toBe('non-existent');
    expect(result.current.selectedProject).toBeNull();
  });

  it('should maintain referential identity of the return object when projects and state dont change', () => {
    const { result, rerender } = renderHook(({ projects }) => useSelectedProject(projects), {
      initialProps: { projects: mockProjects }
    });

    const firstRenderResult = result.current;

    rerender({ projects: mockProjects });

    // This is expected to fail before optimization because a new object is returned every time
    expect(result.current).toBe(firstRenderResult);
  });
});
