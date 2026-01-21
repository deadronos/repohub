'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Github, X } from 'lucide-react';
import type { Project } from '@/types';
import GitHubStatsDisplay from '@/components/GitHubStats';
import ProjectImage from '@/components/projects/ProjectImage';
import ProjectTags from '@/components/projects/ProjectTags';
import { PROJECT_MODAL_IMAGE_SIZES } from '@/components/projects/imageSizes';

type ProjectModalProps = {
  project: Project;
  onClose: () => void;
};

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        data-testid="modal-backdrop"
      />

      {/* Expanded Card */}
      <motion.div
        layoutId={project.id}
        key={project.id}
        className="relative w-full max-w-2xl bg-[#0a0a0f] rounded-3xl overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.15)] z-50 flex flex-col max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close project details"
          className="absolute top-4 right-4 z-50 p-2 bg-black/60 rounded-full text-white hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          <X size={20} />
        </button>

        <div className="relative h-64 shrink-0 bg-neutral-900">
          <ProjectImage
            imageUrl={project.image_url}
            alt={project.title}
            sizes={PROJECT_MODAL_IMAGE_SIZES}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0f] to-transparent opacity-80" />
        </div>

        <div className="p-8 overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold text-white text-glow">{project.title}</h2>
              {project.repo_url && <GitHubStatsDisplay repoUrl={project.repo_url} />}
              <ProjectTags tags={project.tags} variant="modal" />
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed mb-8 whitespace-pre-wrap">
            {project.description || project.short_description}
          </p>

          <div className="flex gap-4 flex-col sm:flex-row">
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]"
              >
                <ExternalLink size={18} /> Play / Demo
              </a>
            )}

            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-zinc-700"
              >
                <Github size={18} /> View Code
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
