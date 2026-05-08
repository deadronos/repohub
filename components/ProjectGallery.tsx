'use client';

import { Suspense } from 'react';
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

type ProjectGalleryProps = {
  projects: Project[];
};

function FilterSync({
  activeTags,
}: {
  activeTags: Set<string>;
}) {
  useFilterSync(activeTags);
  return null;
}

export default function ProjectGallery({ projects }: ProjectGalleryProps) {
  const { selectedId, selectedProject, setSelectedId, goToNext, goToPrevious } =
    useSelectedProject(projects);
  const { activeTags, searchQuery, filteredProjects, toggleTag, setSearchQuery, clearFilters } =
    useFilterState(projects);

  useEscapeKey(() => setSelectedId(null), Boolean(selectedId));
  const hasFilters = activeTags.size > 0 || searchQuery !== '';
  const visibleProjects = hasFilters ? filteredProjects : projects;

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
        setSearchQuery={setSearchQuery}
      />

      <Suspense fallback={null}>
        <FilterSync activeTags={activeTags} />
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
