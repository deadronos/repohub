'use client';
import { useState } from 'react';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import type { Project } from '@/types';
import ProjectCard from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';
import { useEscapeKey } from '@/utils/hooks/useEscapeKey';

export default function ProjectGallery({ projects }: { projects: Project[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEscapeKey(() => setSelectedId(null), Boolean(selectedId));

  const selectedProject = selectedId
    ? projects.find((project) => project.id === selectedId) ?? null
    : null;

  return (
    <LayoutGroup>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 md:p-8">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={(projectId) => setSelectedId(projectId)}
          />
        ))}

        {/* The Expanded Modal */}
        <AnimatePresence>
          {selectedProject && (
            <ProjectModal project={selectedProject} onClose={() => setSelectedId(null)} />
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
