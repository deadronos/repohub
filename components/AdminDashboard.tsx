'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Project } from '@/types';
import { cleanupOrphanImages, deleteProjects, setProjectsFeatured, updateProjectOrder } from '@/app/actions/projects';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { getActionData, getActionError, getActionWarning } from '@/utils/actions';
import { createClient } from '@/utils/supabase/client';
import ProjectFormModal from '@/components/admin/ProjectFormModal';
import AdminToolbar from '@/components/admin/AdminToolbar';
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
  const [cleanupStatus, setCleanupStatus] = useState<'idle' | 'cleaning' | 'cleaned'>('idle');

  // Sync state with server data when it changes (e.g. after router.refresh())
  const [lastInitialProjects, setLastInitialProjects] = useState(initialProjects);
  if (initialProjects !== lastInitialProjects) {
    setLastInitialProjects(initialProjects);
    setProjects(initialProjects);
  }

  useEffect(() => {
    if (orderStatus !== 'saved') {
      return;
    }

    const timeout = setTimeout(() => setOrderStatus('idle'), 1500);
    return () => clearTimeout(timeout);
  }, [orderStatus]);

  useEffect(() => {
    if (cleanupStatus !== 'cleaned') {
      return;
    }

    const timeout = setTimeout(() => setCleanupStatus('idle'), 3000);
    return () => clearTimeout(timeout);
  }, [cleanupStatus]);

  // Debounced refresh for Supabase Realtime to coalesce rapid changes
  // (e.g. drag-reorder fires many UPDATE events) and avoid double-refresh
  // when the current tab is the one that made the change.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedRefresh = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.refresh();
    }, 200);
  }, [router]);

  // Subscribe to Supabase Realtime postgres_changes so that changes
  // made in another admin tab/window are reflected within ~1 second.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('admin-projects-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => debouncedRefresh(),
      )
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel).catch(() => {
        // Channel may already be removed; ignore.
      });
    };
  }, [debouncedRefresh]);

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

  const handleCleanupStorage = async () => {
    if (
      !confirm(
        'Scan project storage and permanently delete any image that no project references? This cannot be undone.',
      )
    ) {
      return;
    }

    setFeedback(null);
    setCleanupStatus('cleaning');

    const result = await cleanupOrphanImages();
    const actionError = getActionError(result);

    if (actionError) {
      setCleanupStatus('idle');
      setFeedback({ tone: 'error', message: actionError });
      return;
    }

    setCleanupStatus('cleaned');
    const deleted = getActionData<{ deleted: number }>(result)?.deleted ?? 0;
    setFeedback({
      tone: 'warning',
      message:
        deleted === 0
          ? 'Storage scan complete: no orphan images found.'
          : `Storage scan complete: removed ${deleted} orphan image${deleted === 1 ? '' : 's'}.`,
    });
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

  const handleFormComplete = (warning?: string | null) => {
    closeForm();
    if (warning) {
      setFeedback({ tone: 'warning', message: warning });
    }
    router.refresh();
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

      {/* Global Feedback Message */}
      {feedback && (
        <div
          role="alert"
          aria-live="polite"
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

      <AdminToolbar
        onAddNew={() => {
          setEditingProject(null);
          setIsFormOpen(true);
          setFeedback(null);
        }}
        onFeatureSelected={() => void handleSetFeatured(true)}
        onUnfeatureSelected={() => void handleSetFeatured(false)}
        onDeleteSelected={handleDelete}
        onCleanupStorage={() => void handleCleanupStorage()}
        selectedCount={selectedIds.size}
        orderStatus={orderStatus}
        featureStatus={featureStatus}
        cleanupStatus={cleanupStatus}
      />

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
        onComplete={handleFormComplete}
      />
    </div>
  );
}
