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

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

export default function ProjectModal({ project, onNext, onPrevious, onClose }: ProjectModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  const onCloseRef = useRef(onClose);
  const onNextRef = useRef(onNext);
  const onPreviousRef = useRef(onPrevious);

  useEffect(() => {
    onCloseRef.current = onClose;
    onNextRef.current = onNext;
    onPreviousRef.current = onPrevious;
  }, [onClose, onNext, onPrevious]);

  // Focus trap, keyboard navigation, and body scroll lock (mount/unmount lifecycle only)
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const previousActiveElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the close button or first focusable element on mount
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    } else {
      getFocusableElements(modal)[0]?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPreviousRef.current();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNextRef.current();
        return;
      }
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;

      // Query focusable elements dynamically so async content (e.g. GitHubStats)
      // and project switches never leave stale focus boundaries.
      const focusableElements = getFocusableElements(modal);
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement || !modal.contains(document.activeElement)) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement || !modal.contains(document.activeElement)) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:px-16">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        data-testid="modal-backdrop"
      />

      {/* Dialog container (wraps card + flanking navigation so focus trap covers both) */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        className="relative z-50 flex flex-col items-center w-full max-w-2xl max-h-[90vh]"
      >
        {/* Expanded Card */}
        <motion.div
          layoutId={project.id}
          key={project.id}
          className="relative w-full bg-[#0a0a0f] rounded-3xl overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.15)] flex flex-col max-h-[calc(90vh-4rem)] md:max-h-[90vh]"
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

          <div className="relative h-64 shrink-0 bg-neutral-900">
            <ProjectImage
              imageUrl={project.image_url}
              alt={project.title}
              sizes={PROJECT_MODAL_IMAGE_SIZES}
              className="object-cover"
              priority={true}
              fallback={
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-900/30 to-purple-900/30">
                  <span className="text-4xl font-bold text-white/30">
                    {project.title.charAt(0)}
                  </span>
                </div>
              }
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0f] to-transparent opacity-80" />
          </div>

          <div className="p-8 overflow-y-auto">
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 id="project-modal-title" className="text-3xl font-bold text-white text-glow">
                    {project.title}
                  </h2>
                  <ProjectTypeBadge type={inferProjectType(project.tags ?? [])} />
                  {project.is_featured && (
                    <StarIcon
                      className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0"
                      aria-label="Featured"
                    />
                  )}
                </div>
                {project.repo_url && <GitHubStatsDisplay repoUrl={project.repo_url} />}
              </div>
              <ProjectActions
                demoUrl={project.demo_url}
                repoUrl={project.repo_url}
                variant="compact"
              />
            </div>

            <p className="text-zinc-300 leading-relaxed mb-6 whitespace-pre-wrap">
              {stripTitlePrefix(
                project.title,
                project.description?.trim() || project.short_description,
              )}
            </p>

            <ProjectTags tags={project.tags} variant="modal" />
          </div>
        </motion.div>

        {/* Previous / Next Navigation (below card on mobile, flanking outside on md+) */}
        <div
          data-testid="modal-nav-controls"
          className="flex items-center justify-center gap-4 mt-3 md:mt-0 md:contents"
        >
          <button
            ref={prevButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
            aria-label="Previous project"
            className="p-2.5 rounded-full bg-black/60 border border-white/10 text-white hover:bg-white/20 hover:border-cyan-500/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 md:absolute md:-left-14 md:top-1/2 md:-translate-y-1/2"
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
            className="p-2.5 rounded-full bg-black/60 border border-white/10 text-white hover:bg-white/20 hover:border-cyan-500/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 md:absolute md:-right-14 md:top-1/2 md:-translate-y-1/2"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
