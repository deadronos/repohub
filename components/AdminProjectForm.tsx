'use client';

import { useState } from 'react';
import type { Project } from '@/types';
import { createProject, updateProject } from '@/app/actions/projects';
import { getActionError } from '@/utils/actions';
import ProjectImageUploadField from '@/components/admin/ProjectImageUploadField';
import { useProjectImageField } from '@/components/admin/useProjectImageField';

const INPUT_CLASS =
  'p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none';

type ProjectFormProps = {
  project?: Project | null;
  onComplete: () => void;
};

export default function ProjectForm({ project, onComplete }: ProjectFormProps) {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { imageState, fileInputRef, clearSelectedImage, handleImageChange } = useProjectImageField({
    onResetError: () => setFormError(null),
  });

  async function handleSubmit(formData: FormData) {
    if (imageState.status === 'optimizing') {
      setFormError('Image is still optimizing. Please wait a moment.');
      return;
    }

    if (imageState.status === 'error') {
      setFormError(imageState.message);
      return;
    }

    setLoading(true);
    setFormError(null);

    const preparedImage = imageState.status === 'ready' ? imageState.prepared : null;
    const submission = new FormData();
    for (const [key, value] of formData.entries()) {
      if (key === 'image') {
        continue;
      }
      submission.append(key, value);
    }
    if (preparedImage) {
      submission.append('image', preparedImage);
    }

    const result = project ? await updateProject(submission) : await createProject(submission);
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
          <label htmlFor="title" className="text-sm text-zinc-400">
            Project Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            defaultValue={project?.title}
            required
            placeholder="e.g. AI Portfolio"
            className={INPUT_CLASS}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="short_description" className="text-sm text-zinc-400">
            Short Description (Card) <span className="text-red-500">*</span>
          </label>
          <input
            id="short_description"
            name="short_description"
            defaultValue={project?.short_description || ''}
            required
            placeholder="Brief overview for the card..."
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className="text-sm text-zinc-400">Full Description</label>
        <textarea
          id="description"
          name="description"
          defaultValue={project?.description || ''}
          rows={4}
          placeholder="Detailed project explanation..."
          className={INPUT_CLASS}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="repo_url" className="text-sm text-zinc-400">Repo URL</label>
          <input
            id="repo_url"
            name="repo_url"
            defaultValue={project?.repo_url || ''}
            type="url"
            placeholder="https://github.com/..."
            className={INPUT_CLASS}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="demo_url" className="text-sm text-zinc-400">Demo URL</label>
          <input
            id="demo_url"
            name="demo_url"
            defaultValue={project?.demo_url || ''}
            type="url"
            placeholder="https://..."
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="tags" className="text-sm text-zinc-400">Tags (comma separated)</label>
        <input
          id="tags"
          name="tags"
          defaultValue={project?.tags?.join(', ') || ''}
          placeholder="Next.js, TypeScript, AI"
          className={INPUT_CLASS}
        />
      </div>

      <ProjectImageUploadField
        imageState={imageState}
        fileInputRef={fileInputRef}
        onImageChange={handleImageChange}
        onClearImage={clearSelectedImage}
        currentImageUrl={project?.image_url}
      />

      <button
        type="submit"
        disabled={
          loading || imageState.status === 'optimizing' || imageState.status === 'error'
        }
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
