'use client';

import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Project } from '@/types';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import ProjectFormModal from '@/components/admin/ProjectFormModal';
import AdminToolbar from '@/components/admin/AdminToolbar';
import AdminSortableGrid from '@/components/admin/AdminSortableGrid';
import { useAdminProjects } from '@/components/admin/useAdminProjects';

interface AdminDashboardProps {
  initialProjects: Project[];
}

export default function AdminDashboard({ initialProjects }: AdminDashboardProps) {
  const {
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
  } = useAdminProjects(initialProjects);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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
        onAddNew={openAddNew}
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
