'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Star as StarIcon } from 'lucide-react';
import type { Project } from '@/types';
import GitHubStatsDisplay from '@/components/GitHubStats';
import ProjectImage from '@/components/projects/ProjectImage';
import ProjectTags from '@/components/projects/ProjectTags';
import ProjectActions from '@/components/projects/ProjectActions';
import ProjectTypeBadge from '@/components/projects/ProjectTypeBadge';
import { PROJECT_MODAL_IMAGE_SIZES } from '@/components/projects/imageSizes';
import { inferProjectType } from '@/utils/projects/projectType';
import { stripTitlePrefix } from '@/utils/projects/description';

type ProjectModalProps = {
  project: Project;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
};

export default function ProjectModal({ project, onNext, onPrevious, onClose }: ProjectModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap implementation
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleArrowKeys = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    const previousActiveElement = document.activeElement as HTMLElement;

    document.addEventListener('keydown', handleArrowKeys);

    // Focus the close button or first focusable element on mount
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    } else {
      firstElement?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleArrowKeys);
      previousActiveElement?.focus();
    };
  }, [onClose, onNext, onPrevious]);
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
        ref={modalRef}
        layoutId={project.id}
        key={project.id}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        className="relative w-full max-w-2xl bg-[#0a0a0f] rounded-3xl overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.15)] z-50 flex flex-col max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close project details"
          className="absolute top-4 right-4 z-[60] p-2 bg-black/60 rounded-full text-white hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          <X size={20} />
        </button>

        <button
          ref={prevButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          aria-label="Previous project"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-black/40 text-white hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          ref={nextButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Next project"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-black/40 text-white hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          <ChevronRight size={24} />
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
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="project-modal-title" className="text-3xl font-bold text-white text-glow">{project.title}</h2>
                <ProjectTypeBadge type={inferProjectType(project.tags ?? [])} />
                {project.is_featured && (
                  <StarIcon className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" aria-label="Featured" />
                )}
              </div>
              {project.repo_url && <GitHubStatsDisplay repoUrl={project.repo_url} />}
            </div>
            <ProjectActions demoUrl={project.demo_url} repoUrl={project.repo_url} variant="compact" />
          </div>

          <p className="text-zinc-300 leading-relaxed mb-6 whitespace-pre-wrap">
            {stripTitlePrefix(project.title, project.description?.trim() || project.short_description)}
          </p>

          <ProjectTags tags={project.tags} variant="modal" />
        </div>
      </motion.div>
    </div>
  );
}
