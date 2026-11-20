'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useRouter } from 'next/navigation';
import type { Project } from '@/types';
import {
  cleanupOrphanImages,
  deleteProjects,
  setProjectsFeatured,
  updateProjectOrder,
} from '@/app/actions/projects';
import { getActionData, getActionError, getActionWarning } from '@/utils/actions';
import { createClient } from '@/utils/supabase/client';

export type FeedbackState =
  | { tone: 'error'; message: string }
  | { tone: 'warning'; message: string };

export type OrderStatus = 'idle' | 'saving' | 'saved';
export type FeatureStatus = 'idle' | 'saving';
export type CleanupStatus = 'idle' | 'cleaning' | 'cleaned';

/**
 * Manages admin dashboard project state, optimistic mutations, drag-reorder,
 * modal form state, and Supabase Realtime synchronization.
 */
export function useAdminProjects(initialProjects: Project[]) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('idle');
  const [featureStatus, setFeatureStatus] = useState<FeatureStatus>('idle');
  const [cleanupStatus, setCleanupStatus] = useState<CleanupStatus>('idle');

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () =>
        debouncedRefresh(),
      )
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel).catch(() => {
        // Channel may already be removed; ignore.
      });
    };
  }, [debouncedRefresh]);

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

  const openAddNew = () => {
    setEditingProject(null);
    setIsFormOpen(true);
    setFeedback(null);
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

  const activeProject = activeId
    ? (projects.find((project) => project.id === activeId) ?? null)
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

  return {
    projects,
    selectedIds,
    isFormOpen,
    editingProject,
    feedback,
    activeProject,
    orderStatus,
    featureStatus,
    cleanupStatus,
    toggleSelection,
    handleDelete,
    handleCleanupStorage,
    handleSetFeatured,
    openAddNew,
    openEdit,
    closeForm,
    handleFormComplete,
    handleDragStart,
    handleDragCancel,
    handleDragEnd,
  };
}
