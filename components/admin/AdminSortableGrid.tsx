'use client';

import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  type SensorDescriptor,
  type SensorOptions,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import type { Project } from '@/types';
import AdminProjectCard from '@/components/admin/AdminProjectCard';
import SortableProjectCard from '@/components/admin/SortableProjectCard';

interface AdminSortableGridProps {
  projects: Project[];
  selectedIds: Set<string>;
  orderStatus: 'idle' | 'saving' | 'saved';
  sensors: SensorDescriptor<SensorOptions>[];
  activeProject: Project | null;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => Promise<void>;
  onDragCancel: () => void;
  onToggleSelect: (id: string) => void;
  onEdit: (project: Project) => void;
}

export default function AdminSortableGrid({
  projects,
  selectedIds,
  orderStatus,
  sensors,
  activeProject,
  onDragStart,
  onDragEnd,
  onDragCancel,
  onToggleSelect,
  onEdit,
}: AdminSortableGridProps) {
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <SortableContext items={projects.map((project) => project.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <SortableProjectCard
              key={project.id}
              project={project}
              isSelected={selectedIds.has(project.id)}
              onToggleSelect={() => onToggleSelect(project.id)}
              onEdit={() => onEdit(project)}
              disabled={orderStatus === 'saving'}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeProject ? <AdminProjectCard project={activeProject} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
