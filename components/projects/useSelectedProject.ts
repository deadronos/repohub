'use client';

import { useMemo, useState } from 'react';
import type { Project } from '@/types';

export function useSelectedProject(projects: Project[]) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedProject = useMemo(
    () => (selectedId ? projects.find((project) => project.id === selectedId) ?? null : null),
    [projects, selectedId],
  );

  return {
    selectedId,
    selectedProject,
    setSelectedId,
  };
}
