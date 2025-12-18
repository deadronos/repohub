'use client';

import { useState } from 'react';
import type { Project } from '@/types';
import { createProject, updateProject, deleteProjects } from '@/app/actions';
import Link from 'next/link';
import { Plus, Trash2, Edit2, X, Upload } from 'lucide-react';
import Image from 'next/image';

interface AdminDashboardProps {
  initialProjects: Project[];
}

export default function AdminDashboard({ initialProjects }: AdminDashboardProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

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
    await deleteProjects(ids);
    setProjects(projects.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingProject(null);
    setIsFormOpen(false);
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

      {/* Toolbar */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setIsFormOpen(true)}
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
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="relative group bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all"
          >
            {/* Selection Checkbox */}
            <input
              type="checkbox"
              checked={selectedIds.has(project.id)}
              onChange={() => toggleSelection(project.id)}
              className="absolute top-3 left-3 z-20 w-5 h-5 accent-cyan-500 cursor-pointer"
            />

            {/* Edit Button Overlay */}
            <button
              onClick={() => openEdit(project)}
              className="absolute top-3 right-3 z-20 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-cyan-600"
            >
              <Edit2 size={16} />
            </button>

            <div className="relative h-40 w-full bg-zinc-950">
              {project.image_url ? (
                <Image
                  src={project.image_url}
                  alt={project.title}
                  fill
                  // ⚡ Bolt: Optimize image loading by serving correct size for grid layout
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover opacity-60"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                  No Image
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-bold text-white truncate">{project.title}</h3>
              <p className="text-zinc-500 text-sm truncate">{project.short_description}</p>
              <div className="flex gap-1 mt-2">
                {/* Status indicators if we had them */}
                <div className="text-xs text-zinc-600 border border-zinc-800 px-2 py-0.5 rounded">
                  {project.tags?.[0] || 'No tags'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal - Keeping it simple by using a full screen overlay or just reused form logic */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0f] border border-zinc-800 w-full max-w-3xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <button
              onClick={closeForm}
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
                // In a real app we'd reload data or update local state smarter
                // For now, let's just assume we want to refresh everything
                window.location.reload();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectForm({
  project,
  onComplete,
}: {
  project?: Project | null;
  onComplete: () => void;
}) {
  async function handleSubmit(formData: FormData) {
    if (project) {
      await updateProject(formData);
    } else {
      await createProject(formData);
    }
    onComplete();
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <input type="hidden" name="id" value={project?.id} />
      {project?.image_url && (
        <input type="hidden" name="current_image_url" value={project.image_url} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-zinc-400">Project Title</label>
          <input
            name="title"
            defaultValue={project?.title}
            required
            className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-zinc-400">Short Description (Card)</label>
          <input
            name="short_description"
            defaultValue={project?.short_description || ''}
            required
            className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400">Full Description</label>
        <textarea
          name="description"
          defaultValue={project?.description || ''}
          rows={4}
          className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-zinc-400">Repo URL</label>
          <input
            name="repo_url"
            defaultValue={project?.repo_url || ''}
            type="url"
            className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-zinc-400">Demo URL</label>
          <input
            name="demo_url"
            defaultValue={project?.demo_url || ''}
            type="url"
            className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400">Tags (comma separated)</label>
        <input
          name="tags"
          defaultValue={project?.tags?.join(', ') || ''}
          placeholder="Next.js, TypeScript, AI"
          className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400">Project Cover Image</label>
        <div className="border border-dashed border-zinc-700 rounded-lg p-6 flex flex-col items-center justify-center text-zinc-500 hover:border-cyan-500/50 hover:bg-cyan-900/10 transition-colors cursor-pointer relative bg-zinc-900/50">
          <input
            type="file"
            name="image"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload className="mb-2" />
          <span className="text-sm">Click to Replace / Upload</span>
        </div>
        {project?.image_url && (
          <p className="text-xs text-zinc-500 mt-1">
            Current image: {project.image_url.split('/').pop()}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl mt-4 transition-colors"
      >
        {project ? 'Save Changes' : 'Initialize Project Node'}
      </button>
    </form>
  );
}
