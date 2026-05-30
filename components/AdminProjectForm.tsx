'use client';

import { useState, useCallback } from 'react';
import type { Project } from '@/types';
import { createProject, updateProject } from '@/app/actions/projects';
import { getActionError, getActionWarning } from '@/utils/actions';
import { ProjectCreateSchema } from '@/utils/projects/schema';
import type { ProjectCreateInput } from '@/utils/projects/form';
import ProjectImageUploadField from '@/components/admin/ProjectImageUploadField';
import { useProjectImageField } from '@/components/admin/useProjectImageField';

const INPUT_CLASS =
  'p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none';

const ERROR_INPUT_CLASS =
  'p-3 bg-zinc-900 border border-red-700 rounded-lg text-white focus:border-red-500 focus:outline-none';

type FieldErrors = Partial<Record<keyof ProjectCreateInput, string>>;

type ProjectFormProps = {
  project?: Project | null;
  onComplete: (warning?: string | null) => void;
};

export default function ProjectForm({ project, onComplete }: ProjectFormProps) {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const errorId = 'form-error-message';
  const { imageState, fileInputRef, clearSelectedImage, handleImageChange } = useProjectImageField({
    onResetError: () => setFormError(null),
  });

  /**
   * Client-side validation using the shared Zod schema.
   * Provides instant field-level feedback before form submission.
   */
  const validateClient = useCallback((formData: FormData): boolean => {
    const data: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (key === 'image' || key === 'id') continue;
      if (typeof value === 'string') {
        data[key] = value;
      }
    }

    const result = ProjectCreateSchema.safeParse(data);
    if (result.success) {
      setFieldErrors({});
      return true;
    }

    const errors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof ProjectCreateInput;
      if (field && !errors[field]) {
        errors[field] = issue.message;
      }
    }
    setFieldErrors(errors);
    return false;
  }, []);

  async function handleSubmit(formData: FormData) {
    if (imageState.status === 'optimizing') {
      setFormError('Image is still optimizing. Please wait a moment.');
      return;
    }

    if (imageState.status === 'error') {
      setFormError(imageState.message);
      return;
    }

    // Client-side pre-validation
    if (!validateClient(formData)) {
      setFormError('Please fix the highlighted fields below.');
      return;
    }

    setLoading(true);
    setFormError(null);
    setFieldErrors({});

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
    const actionWarning = getActionWarning(result);

    setLoading(false);

    if (actionError) {
      setFormError(actionError);
    } else {
      onComplete(actionWarning);
    }
  }

  function getFieldInputClass(fieldName: keyof ProjectCreateInput): string {
    return fieldErrors[fieldName] ? ERROR_INPUT_CLASS : INPUT_CLASS;
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <input type="hidden" name="id" value={project?.id} />
      {project?.image_url && (
        <input type="hidden" name="current_image_url" value={project.image_url} />
      )}

      {formError && (
        <div id={errorId} className="bg-red-900/30 text-red-300 p-3 rounded-lg border border-red-800 text-sm" role="alert">
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
            className={getFieldInputClass('title')}
            aria-invalid={fieldErrors.title ? 'true' : 'false'}
            aria-describedby={fieldErrors.title ? 'title-error' : undefined}
          />
          {fieldErrors.title && (
            <p id="title-error" className="text-red-400 text-xs" role="alert">
              {fieldErrors.title}
            </p>
          )}
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
            className={getFieldInputClass('short_description')}
            aria-invalid={fieldErrors.short_description ? 'true' : 'false'}
            aria-describedby={fieldErrors.short_description ? 'short_description-error' : undefined}
          />
          {fieldErrors.short_description && (
            <p id="short_description-error" className="text-red-400 text-xs" role="alert">
              {fieldErrors.short_description}
            </p>
          )}
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
          className={getFieldInputClass('description')}
          aria-invalid={fieldErrors.description ? 'true' : 'false'}
          aria-describedby={fieldErrors.description ? 'description-error' : undefined}
        />
        {fieldErrors.description && (
          <p id="description-error" className="text-red-400 text-xs" role="alert">
            {fieldErrors.description}
          </p>
        )}
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
            className={getFieldInputClass('repo_url')}
            aria-invalid={fieldErrors.repo_url ? 'true' : 'false'}
            aria-describedby={fieldErrors.repo_url ? 'repo_url-error' : undefined}
          />
          {fieldErrors.repo_url && (
            <p id="repo_url-error" className="text-red-400 text-xs" role="alert">
              {fieldErrors.repo_url}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="demo_url" className="text-sm text-zinc-400">Demo URL</label>
          <input
            id="demo_url"
            name="demo_url"
            defaultValue={project?.demo_url || ''}
            type="url"
            placeholder="https://..."
            className={getFieldInputClass('demo_url')}
            aria-invalid={fieldErrors.demo_url ? 'true' : 'false'}
            aria-describedby={fieldErrors.demo_url ? 'demo_url-error' : undefined}
          />
          {fieldErrors.demo_url && (
            <p id="demo_url-error" className="text-red-400 text-xs" role="alert">
              {fieldErrors.demo_url}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="tags" className="text-sm text-zinc-400">Tags (comma separated)</label>
        <input
          id="tags"
          name="tags"
          defaultValue={project?.tags?.join(', ') || ''}
          placeholder="Next.js, TypeScript, AI"
          className={getFieldInputClass('tags')}
          aria-invalid={fieldErrors.tags ? 'true' : 'false'}
          aria-describedby={fieldErrors.tags ? 'tags-error' : undefined}
        />
        {fieldErrors.tags && (
          <p id="tags-error" className="text-red-400 text-xs" role="alert">
            {fieldErrors.tags}
          </p>
        )}
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
