'use client';

import { AnimatePresence } from 'framer-motion';
import type { Project } from '@/types';
import ProjectModal from '@/components/ProjectModal';
import VirtualizedProjectGrid from '@/components/projects/VirtualizedProjectGrid';
import { useSelectedProject } from '@/components/projects/useSelectedProject';
import { useEscapeKey } from '@/utils/hooks/useEscapeKey';

type ProjectGalleryProps = {
  projects: Project[];
};

export default function ProjectGallery({ projects }: ProjectGalleryProps) {
  const { selectedId, selectedProject, setSelectedId } = useSelectedProject(projects);

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
      <VirtualizedProjectGrid projects={projects} onProjectClick={setSelectedId} />

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedId(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
