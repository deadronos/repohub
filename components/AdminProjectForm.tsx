'use client';

import { useState } from 'react';
import type { Project } from '@/types';
import { createProject, updateProject } from '@/app/actions/projects';
import { Upload } from 'lucide-react';
import { getActionError } from '@/utils/actions';

type ProjectFormProps = {
  project?: Project | null;
  onComplete: () => void;
};

export default function ProjectForm({ project, onComplete }: ProjectFormProps) {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setFormError(null);

    const result = project ? await updateProject(formData) : await createProject(formData);
    const actionError = getActionError(result);

    setLoading(false);

    if (actionError) {
      setFormError(actionError);
    } else {
      onComplete();
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <input type="hidden" name="id" value={project?.id} />
      {project?.image_url && (
        <input type="hidden" name="current_image_url" value={project.image_url} />
      )}

      {formError && (
        <div className="bg-red-900/30 text-red-300 p-3 rounded-lg border border-red-800 text-sm">
          {formError}
        </div>
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
        disabled={loading}
        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : project ? (
          'Save Changes'
        ) : (
          'Initialize Project Node'
        )}
      </button>
    </form>
  );
}
