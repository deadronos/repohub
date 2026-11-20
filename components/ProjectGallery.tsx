'use client';

import { Suspense, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Project } from '@/types';
import ProjectModal from '@/components/ProjectModal';
import VirtualizedProjectGrid from '@/components/projects/VirtualizedProjectGrid';
import AnimatedProjectGrid from '@/components/projects/AnimatedProjectGrid';
import FilterBar from '@/components/projects/FilterBar';
import EmptyFilterState from '@/components/projects/EmptyFilterState';
import { useFilterState } from '@/components/projects/useFilterState';
import { useFilterSync } from '@/components/projects/useFilterSync';
import { useSelectedProject } from '@/components/projects/useSelectedProject';
import { useEscapeKey } from '@/utils/hooks/useEscapeKey';
import { extractAllTags } from '@/utils/projects/tags';

type ProjectGalleryProps = {
  projects: Project[];
};

function FilterSync({
  activeTags,
  setActiveTags,
  availableTags,
}: {
  activeTags: Set<string>;
  setActiveTags: (tags: Set<string>) => void;
  availableTags: string[];
}) {
  useFilterSync(activeTags, setActiveTags, availableTags);
  return null;
}

export default function ProjectGallery({ projects }: ProjectGalleryProps) {
  const {
    activeTags,
    inputValue,
    searchQuery,
    filteredProjects,
    toggleTag,
    setActiveTags,
    setSearchQuery,
    clearFilters,
  } = useFilterState(projects);

  const availableTags = useMemo(() => extractAllTags(projects).map(({ tag }) => tag), [projects]);

  const hasFilters = activeTags.size > 0 || searchQuery !== '';
  const visibleProjects = hasFilters ? filteredProjects : projects;

  const { selectedId, selectedProject, setSelectedId, goToNext, goToPrevious } =
    useSelectedProject(visibleProjects);

  useEscapeKey(() => setSelectedId(null), Boolean(selectedId));

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-zinc-400 text-lg">No projects yet</p>
        <p className="text-zinc-600 text-sm mt-2">Check back later for new additions.</p>
      </div>
    );
  }

  return (
    <>
      <FilterBar
        projects={projects}
        activeTags={activeTags}
        toggleTag={toggleTag}
        clearFilters={clearFilters}
        searchQuery={searchQuery}
        inputValue={inputValue}
        setSearchQuery={setSearchQuery}
      />

      <Suspense fallback={null}>
        <FilterSync
          activeTags={activeTags}
          setActiveTags={setActiveTags}
          availableTags={availableTags}
        />
      </Suspense>

      {visibleProjects.length === 0 && hasFilters && (
        <EmptyFilterState
          activeTags={Array.from(activeTags)}
          searchQuery={searchQuery}
          onClearFilters={clearFilters}
        />
      )}

      {visibleProjects.length > 0 &&
        (projects.length <= 50 ? (
          <AnimatedProjectGrid projects={visibleProjects} onProjectClick={setSelectedId} />
        ) : (
          <VirtualizedProjectGrid projects={visibleProjects} onProjectClick={setSelectedId} />
        ))}

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onNext={goToNext}
            onPrevious={goToPrevious}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
