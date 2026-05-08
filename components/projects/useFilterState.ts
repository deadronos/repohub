'use client';

import { useMemo, useRef, useState, useCallback } from 'react';
import type { Project } from '@/types';

function matchesSearch(project: Project, query: string): boolean {
  if (!query) return true;

  const lowerQuery = query.toLowerCase();
  const titleMatch = project.title.toLowerCase().includes(lowerQuery);
  const shortDescMatch = project.short_description?.toLowerCase().includes(lowerQuery) ?? false;
  const descMatch = project.description?.toLowerCase().includes(lowerQuery) ?? false;

  return titleMatch || shortDescMatch || descMatch;
}

function matchesTags(project: Project, tags: Set<string>): boolean {
  if (tags.size === 0) return true;

  const projectTags = project.tags ?? [];
  for (const tag of tags) {
    if (projectTags.includes(tag)) return true;
  }
  return false;
}

export function useFilterState(projects: Project[]) {
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSearchQuery = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setActiveTags(new Set());
    setDebouncedQuery('');
  }, []);

  const filteredProjects = useMemo(
    () => projects.filter((p) => matchesTags(p, activeTags) && matchesSearch(p, debouncedQuery)),
    [projects, activeTags, debouncedQuery],
  );

  return useMemo(
    () => ({
      activeTags,
      searchQuery: debouncedQuery,
      filteredProjects,
      toggleTag,
      setActiveTags,
      setSearchQuery,
      clearFilters,
    }),
    [activeTags, debouncedQuery, filteredProjects, toggleTag, clearFilters, setSearchQuery],
  );
}