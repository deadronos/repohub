'use client';

import { useCallback, useMemo, useState } from 'react';
import type { Project } from '@/types';

export function useSelectedProject(projects: Project[]) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedProject = useMemo(
    () => (selectedId ? projects.find((project) => project.id === selectedId) ?? null : null),
    [projects, selectedId],
  );

  const currentIndex = useMemo(() => {
    if (!selectedId) return -1;
    return projects.findIndex((project) => project.id === selectedId);
  }, [projects, selectedId]);

  const goToNext = useCallback(() => {
    if (projects.length === 0) return;
    const nextIndex = currentIndex >= projects.length - 1 ? 0 : currentIndex + 1;
    setSelectedId(projects[nextIndex].id);
  }, [projects, currentIndex]);

  const goToPrevious = useCallback(() => {
    if (projects.length === 0) return;
    const prevIndex = currentIndex <= 0 ? projects.length - 1 : currentIndex - 1;
    setSelectedId(projects[prevIndex].id);
  }, [projects, currentIndex]);

  return useMemo(
    () => ({
      selectedId,
      selectedProject,
      setSelectedId,
      currentIndex,
      goToNext,
      goToPrevious,
    }),
    [selectedId, selectedProject, setSelectedId, currentIndex, goToNext, goToPrevious],
  );
}
