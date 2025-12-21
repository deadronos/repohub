'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Project } from '@/types';
import { capitalize, truncate } from '@/utils/string';
import GitHubStatsDisplay from '@/components/GitHubStats';

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
        {project.image_url && (
          <Image
            src={project.image_url}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 grayscale group-hover:grayscale-0"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/40 to-transparent" />
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

        <div className="flex gap-2 mt-3 flex-wrap">
          {project.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-cyan-900/30 border border-cyan-500/30 text-cyan-200 px-2 py-1 rounded-full backdrop-blur-md"
            >
              {capitalize(tag || '')}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

