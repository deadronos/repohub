'use client';

import type { CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { Project } from '@/types';
import AdminProjectCard from '@/components/admin/AdminProjectCard';

type SortableProjectCardProps = {
  project: Project;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  disabled?: boolean;
};

export default function SortableProjectCard({
  project,
  isSelected,
  onToggleSelect,
  onEdit,
  disabled = false,
}: SortableProjectCardProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({
      id: project.id,
      disabled,
    });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  };

  const dragHandle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`Reorder ${project.title}`}
      className="absolute top-3 left-12 z-20 p-2 bg-black/60 text-white rounded-full opacity-60 transition-opacity hover:opacity-100 cursor-grab active:cursor-grabbing"
    >
      <GripVertical size={16} />
    </button>
  );

  return (
    <div ref={setNodeRef} style={style} className="touch-manipulation">
      <AdminProjectCard
        project={project}
        isSelected={isSelected}
        onToggleSelect={onToggleSelect}
        onEdit={onEdit}
        dragHandle={dragHandle}
        isDragging={isDragging}
      />
    </div>
  );
}
