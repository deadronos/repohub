'use client';

import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import type { Project } from '@/types';
import { truncate } from '@/utils/string';
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
        if (e.target !== e.currentTarget) return;
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
          className="object-cover opacity-80 group-hover:opacity-95 transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#050510] via-[#050510]/50 to-transparent" />
      </div>

      {/* Quick-Play Link */}
      {project.demo_url && (
        <a
          href={project.demo_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Play ${project.title}`}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-slate-950 font-semibold text-xs px-3 py-1.5 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-200 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 focus-visible:opacity-100 focus-visible:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Play size={12} className="fill-current" aria-hidden="true" />
          <span>Play</span>
        </a>
      )}

      {/* Card Content */}
      <div className="absolute bottom-0 left-0 p-6 z-10 w-full">
        <h3
          title={project.title}
          className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors"
        >
          {project.title}
        </h3>
        <p
          title={truncate(project.short_description || '', 100)}
          className="text-zinc-400 text-sm line-clamp-2"
        >
          {truncate(project.short_description || '', 100)}
        </p>

        {/* Keep the gallery cards lightweight; repo stats are loaded on demand in the modal. */}

        <ProjectTags tags={project.tags} variant="card" limit={3} />
      </div>
    </motion.div>
  );
}
