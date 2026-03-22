'use client';

import { useState, useEffect } from 'react';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import type { Project } from '@/types';
import { deleteProjects, setProjectsFeatured, updateProjectOrder } from '@/app/actions/projects';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, AlertCircle, Star, StarOff } from 'lucide-react';
import { getActionError, getActionWarning } from '@/utils/actions';
import ProjectFormModal from '@/components/admin/ProjectFormModal';
import AdminSortableGrid from '@/components/admin/AdminSortableGrid';

interface AdminDashboardProps {
  initialProjects: Project[];
}

type FeedbackState =
  | { tone: 'error'; message: string }
  | { tone: 'warning'; message: string };

export default function AdminDashboard({ initialProjects }: AdminDashboardProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [featureStatus, setFeatureStatus] = useState<'idle' | 'saving'>('idle');

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
    setFeedback(null);

    const result = await deleteProjects(ids);
    const actionError = getActionError(result);
    const actionWarning = getActionWarning(result);

    if (actionError) {
      setProjects(originalProjects);
      setFeedback({ tone: 'error', message: actionError });
    } else {
      if (actionWarning) {
        setFeedback({ tone: 'warning', message: actionWarning });
      }
      router.refresh();
    }
  };

  const handleSetFeatured = async (isFeatured: boolean) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      return;
    }

    const originalProjects = [...projects];
    const originalSelectedIds = new Set(selectedIds);

    setProjects(
      projects.map((project) =>
        selectedIds.has(project.id) ? { ...project, is_featured: isFeatured } : project,
      ),
    );
    setSelectedIds(new Set());
    setFeedback(null);
    setFeatureStatus('saving');

    const result = await setProjectsFeatured(ids, isFeatured);
    const actionError = getActionError(result);

    if (actionError) {
      setProjects(originalProjects);
      setSelectedIds(originalSelectedIds);
      setFeedback({ tone: 'error', message: actionError });
      setFeatureStatus('idle');
      return;
    }

    setFeatureStatus('idle');
    router.refresh();
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
    setFeedback(null);
  };

  const closeForm = () => {
    setEditingProject(null);
    setIsFormOpen(false);
    setFeedback(null);
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
    setFeedback(null);
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
        setFeedback({ tone: 'error', message: 'Order was out of date. Refreshed list.' });
        router.refresh();
        return;
      }

      setFeedback({ tone: 'error', message: actionError });
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
      {feedback && (
        <div
          className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
            feedback.tone === 'error'
              ? 'bg-red-900/20 border border-red-500/50 text-red-200 animate-pulse'
              : 'bg-amber-900/20 border border-amber-500/50 text-amber-200'
          }`}
        >
          <AlertCircle size={20} />
          {feedback.message}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <button
          onClick={() => {
            setEditingProject(null);
            setIsFormOpen(true);
            setFeedback(null);
          }}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
        >
          <Plus size={18} /> Add New Project
        </button>

        {selectedIds.size > 0 && (
          <>
            <button
              onClick={() => void handleSetFeatured(true)}
              disabled={featureStatus === 'saving'}
              className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-wait"
            >
              <Star size={18} /> Feature Selected ({selectedIds.size})
            </button>

            <button
              onClick={() => void handleSetFeatured(false)}
              disabled={featureStatus === 'saving'}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-wait"
            >
              <StarOff size={18} /> Unfeature Selected ({selectedIds.size})
            </button>

            <button
              onClick={handleDelete}
              className="bg-red-600/20 hover:bg-red-600/40 text-red-500 hover:text-red-200 border border-red-900/50 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
            >
              <Trash2 size={18} /> Delete Selected ({selectedIds.size})
            </button>
          </>
        )}

        {featureStatus === 'saving' && (
          <span className="text-sm text-amber-300">Updating featured projects...</span>
        )}
        {orderStatus === 'saving' && (
          <span className="text-sm text-cyan-300">Saving order...</span>
        )}
        {orderStatus === 'saved' && <span className="text-sm text-emerald-300">Order saved</span>}
      </div>

      {/* Grid of Projects */}
      <AdminSortableGrid
        projects={projects}
        selectedIds={selectedIds}
        orderStatus={orderStatus}
        sensors={sensors}
        activeProject={activeProject}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        onToggleSelect={toggleSelection}
        onEdit={openEdit}
      />

      <ProjectFormModal
        isOpen={isFormOpen}
        project={editingProject}
        onClose={closeForm}
        onComplete={(warning) => {
          closeForm();
          if (warning) {
            setFeedback({ tone: 'warning', message: warning });
          }
          router.refresh();
        }}
      />
    </div>
  );
}
