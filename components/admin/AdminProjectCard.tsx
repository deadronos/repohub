'use client';

import type { ReactNode } from 'react';
import { Edit2 } from 'lucide-react';
import type { Project } from '@/types';
import ProjectImage from '@/components/projects/ProjectImage';
import ProjectTags from '@/components/projects/ProjectTags';
import { PROJECT_CARD_IMAGE_SIZES } from '@/components/projects/imageSizes';

type AdminProjectCardProps = {
  project: Project;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onEdit?: () => void;
  dragHandle?: ReactNode;
  isDragging?: boolean;
  isOverlay?: boolean;
};

export default function AdminProjectCard({
  project,
  isSelected = false,
  onToggleSelect,
  onEdit,
  dragHandle,
  isDragging = false,
  isOverlay = false,
}: AdminProjectCardProps) {
  const highlightClass = isDragging || isOverlay ? 'ring-2 ring-cyan-500/40' : '';

  return (
    <div
      className={`relative group bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden transition-all hover:border-cyan-500/30 ${highlightClass}`}
    >
      {!isOverlay && (
        <>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect?.()}
            aria-label={`Select ${project.title}`}
            className="absolute top-3 left-3 z-20 w-5 h-5 accent-cyan-500 cursor-pointer"
          />

          {dragHandle}

          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${project.title}`}
            className="absolute top-3 right-3 z-20 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-cyan-600"
          >
            <Edit2 size={16} />
          </button>
        </>
      )}

      <div className="relative h-40 w-full bg-zinc-950">
        <ProjectImage
          imageUrl={project.image_url}
          alt={project.title}
          sizes={PROJECT_CARD_IMAGE_SIZES}
          className="object-cover opacity-60"
          fallback={
            <div className="w-full h-full flex items-center justify-center text-zinc-700">
              No Image
            </div>
          }
        />
      </div>

      <div className="p-4">
        <h3 className="font-bold text-white truncate">{project.title}</h3>
        <p className="text-zinc-500 text-sm truncate">{project.short_description}</p>
        <ProjectTags tags={project.tags} variant="admin" limit={1} emptyLabel="No tags" />
      </div>
    </div>
  );
}
