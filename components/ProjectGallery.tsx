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
