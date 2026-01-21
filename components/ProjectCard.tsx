'use client';

import { motion } from 'framer-motion';
import type { Project } from '@/types';
import { truncate } from '@/utils/string';
import GitHubStatsDisplay from '@/components/GitHubStats';
import ProjectImage from '@/components/projects/ProjectImage';
import ProjectTags from '@/components/projects/ProjectTags';
import { PROJECT_CARD_IMAGE_SIZES } from '@/components/projects/imageSizes';

type ProjectCardProps = {
  project: Project;
  onClick: (projectId: string) => void;
};

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <motion.div
      layoutId={project.id}
      onClick={() => onClick(project.id)}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${project.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(project.id);
        }
      }}
      className="cursor-pointer group relative overflow-hidden rounded-2xl glass-panel h-80 transition-all hover:border-[#00f0ff]/50 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
      whileHover={{ scale: 1.02, y: -5 }}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 bg-neutral-900">
        <ProjectImage
          imageUrl={project.image_url}
          alt={project.title}
          sizes={PROJECT_CARD_IMAGE_SIZES}
          className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 grayscale group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#050510] via-[#050510]/40 to-transparent" />
      </div>

      {/* Card Content */}
      <div className="absolute bottom-0 left-0 p-6 z-10 w-full">
        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
          {project.title}
        </h3>
        <p className="text-zinc-400 text-sm line-clamp-2">
          {truncate(project.short_description || '', 100)}
        </p>

        {project.repo_url && (
          <div onClick={(e) => e.stopPropagation()}>
            <GitHubStatsDisplay repoUrl={project.repo_url} />
          </div>
        )}

        <ProjectTags tags={project.tags} variant="card" limit={3} />
      </div>
    </motion.div>
  );
}
