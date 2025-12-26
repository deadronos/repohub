'use client';

import { useState, useEffect, type CSSProperties, type ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Project } from '@/types';
import { deleteProjects, updateProjectOrder } from '@/app/actions/projects';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit2, X, AlertCircle, GripVertical } from 'lucide-react';
import ProjectForm from '@/components/AdminProjectForm';
import { getActionError } from '@/utils/actions';
import ProjectImage from '@/components/projects/ProjectImage';
import ProjectTags from '@/components/projects/ProjectTags';

interface AdminDashboardProps {
  initialProjects: Project[];
}

type AdminProjectCardProps = {
  project: Project;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onEdit?: () => void;
  dragHandle?: ReactNode;
  isDragging?: boolean;
  isOverlay?: boolean;
};

function AdminProjectCard({
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
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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

type SortableProjectCardProps = {
  project: Project;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  disabled?: boolean;
};

function SortableProjectCard({
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

export default function AdminDashboard({ initialProjects }: AdminDashboardProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Sync state with server data when it changes (e.g. after router.refresh())
  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  useEffect(() => {
    if (orderStatus !== 'saved') {
      return;
    }

    const timeout = setTimeout(() => setOrderStatus('idle'), 1500);
    return () => clearTimeout(timeout);
  }, [orderStatus]);

  // Toggle selection for deletion
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} projects?`)) return;

    const ids = Array.from(selectedIds);

    // Optimistic Update
    const originalProjects = [...projects];
    setProjects(projects.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
    setError(null);

    const result = await deleteProjects(ids);
    const actionError = getActionError(result);

    if (actionError) {
       // Revert
       setProjects(originalProjects);
       setError(actionError);
    } else {
       router.refresh();
    }
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
    setError(null);
  };

  const closeForm = () => {
    setEditingProject(null);
    setIsFormOpen(false);
    setError(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeProject = activeId
    ? projects.find((project) => project.id === activeId) ?? null
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    setError(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      return;
    }

    const activeProjectId = String(active.id);
    const overProjectId = String(over.id);

    if (activeProjectId === overProjectId) {
      return;
    }

    const oldIndex = projects.findIndex((project) => project.id === activeProjectId);
    const newIndex = projects.findIndex((project) => project.id === overProjectId);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const previousProjects = [...projects];
    const nextProjects = arrayMove(projects, oldIndex, newIndex);

    setProjects(nextProjects);
    setOrderStatus('saving');

    const result = await updateProjectOrder(nextProjects.map((project) => project.id));
    const actionError = getActionError(result);

    if (actionError) {
      setProjects(previousProjects);
      setOrderStatus('idle');

      if (actionError === 'Project order contains unknown ids') {
        setError('Order was out of date. Refreshed list.');
        router.refresh();
        return;
      }

      setError(actionError);
      return;
    }

    setOrderStatus('saved');
    router.refresh();
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-white">Admin Command Center</h1>
          <p className="text-zinc-500 mt-1">Manage your digital portfolio</p>
        </div>
        <Link
          href="/"
          className="text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          ← Back to Base
        </Link>
      </div>

      {/* Global Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-3 animate-pulse">
           <AlertCircle size={20} />
           {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <button
          onClick={() => {
            setEditingProject(null);
            setIsFormOpen(true);
            setError(null);
          }}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
        >
          <Plus size={18} /> Add New Project
        </button>

        {selectedIds.size > 0 && (
          <button
            onClick={handleDelete}
            className="bg-red-600/20 hover:bg-red-600/40 text-red-500 hover:text-red-200 border border-red-900/50 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
          >
            <Trash2 size={18} /> Delete Selected ({selectedIds.size})
          </button>
        )}

        {orderStatus === 'saving' && (
          <span className="text-sm text-cyan-300">Saving order...</span>
        )}
        {orderStatus === 'saved' && <span className="text-sm text-emerald-300">Order saved</span>}
      </div>

      {/* Grid of Projects */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={projects.map((project) => project.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <SortableProjectCard
                key={project.id}
                project={project}
                isSelected={selectedIds.has(project.id)}
                onToggleSelect={() => toggleSelection(project.id)}
                onEdit={() => openEdit(project)}
                disabled={orderStatus === 'saving'}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeProject ? <AdminProjectCard project={activeProject} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* Edit/Create Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0f] border border-zinc-800 w-full max-w-3xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <button
              onClick={closeForm}
              aria-label="Close project form"
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">
              {editingProject ? 'Edit Project' : 'Initialize New Project'}
            </h2>

            <ProjectForm
              project={editingProject}
              onComplete={() => {
                closeForm();
                router.refresh();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
