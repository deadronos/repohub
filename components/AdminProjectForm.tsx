'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import type { Project } from '@/types';
import { createProject, updateProject } from '@/app/actions/projects';
import { Upload } from 'lucide-react';
import { getActionError } from '@/utils/actions';
import { formatBytes } from '@/utils/format';
import { optimizeImageToUnderBytes, ImageOptimizationError } from '@/utils/images/optimize-image';
import {
  PROJECT_IMAGE_MAX_BYTES,
  PROJECT_IMAGE_MAX_DIMENSION,
  PROJECT_IMAGE_TARGET_BYTES,
} from '@/utils/projects/image-limits';

const INPUT_CLASS =
  'p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none';

type ProjectFormProps = {
  project?: Project | null;
  onComplete: () => void;
};

type ImageState =
  | { status: 'idle' }
  | { status: 'optimizing'; original: File }
  | {
      status: 'ready';
      original: File;
      prepared: File;
      wasOptimized: boolean;
      originalBytes: number;
      finalBytes: number;
      mimeType: string;
    }
  | { status: 'error'; original: File | null; message: string };

export default function ProjectForm({ project, onComplete }: ProjectFormProps) {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageState, setImageState] = useState<ImageState>({ status: 'idle' });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageRequestIdRef = useRef(0);

  const clearSelectedImage = () => {
    imageRequestIdRef.current += 1;
    setImageState({ status: 'idle' });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    const requestId = (imageRequestIdRef.current += 1);

    setFormError(null);

    // Allow selecting the same file again by clearing the native input value and relying on state.
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (!selected) {
      setImageState({ status: 'idle' });
      return;
    }

    if (!selected.type.startsWith('image/')) {
      setImageState({ status: 'error', original: selected, message: 'Please choose an image file.' });
      return;
    }

    if (selected.size <= PROJECT_IMAGE_MAX_BYTES) {
      setImageState({
        status: 'ready',
        original: selected,
        prepared: selected,
        wasOptimized: false,
        originalBytes: selected.size,
        finalBytes: selected.size,
        mimeType: selected.type,
      });
      return;
    }

    setImageState({ status: 'optimizing', original: selected });

    try {
      const optimized = await optimizeImageToUnderBytes(selected, {
        maxBytes: PROJECT_IMAGE_MAX_BYTES,
        targetBytes: PROJECT_IMAGE_TARGET_BYTES,
        maxDimension: PROJECT_IMAGE_MAX_DIMENSION,
      });

      if (requestId !== imageRequestIdRef.current) {
        return;
      }

      setImageState({
        status: 'ready',
        original: selected,
        prepared: optimized.file,
        wasOptimized: optimized.wasOptimized,
        originalBytes: optimized.originalBytes,
        finalBytes: optimized.finalBytes,
        mimeType: optimized.mimeType,
      });
    } catch (error) {
      if (requestId !== imageRequestIdRef.current) {
        return;
      }

      const max = formatBytes(PROJECT_IMAGE_MAX_BYTES);
      const original = formatBytes(selected.size);

      if (error instanceof ImageOptimizationError) {
        if (error.code === 'not-image') {
          setImageState({ status: 'error', original: selected, message: 'Please choose an image file.' });
          return;
        }

        if (error.code === 'cannot-compress') {
          setImageState({
            status: 'error',
            original: selected,
            message: `This image is ${original}. Max allowed is ${max}. Try cropping or choosing a smaller screenshot.`,
          });
          return;
        }

        setImageState({
          status: 'error',
          original: selected,
          message: `Couldn’t process this image. Please try a different file. (Max ${max})`,
        });
        return;
      }

      setImageState({
        status: 'error',
        original: selected,
        message: `Couldn’t process this image. Please try a different file. (Max ${max})`,
      });
    }
  }

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

      <div className="flex flex-col gap-2">
        <label htmlFor="image" className="text-sm text-zinc-400">Project Cover Image</label>
        <div className="border border-dashed border-zinc-700 rounded-lg p-6 flex flex-col items-center justify-center text-zinc-500 hover:border-cyan-500/50 hover:bg-cyan-900/10 transition-colors cursor-pointer relative bg-zinc-900/50">
          <input
            id="image"
            type="file"
            name="image"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <Upload className="mb-2" />
          <span className="text-sm">Click to Replace / Upload</span>
        </div>
        <p className="text-xs text-zinc-500 mt-1">Max file size: {formatBytes(PROJECT_IMAGE_MAX_BYTES)}.</p>
        {imageState.status === 'optimizing' && (
          <p className="text-xs text-cyan-300 mt-1">
            Optimizing {formatBytes(imageState.original.size)} → &lt; {formatBytes(PROJECT_IMAGE_MAX_BYTES)}…
          </p>
        )}
        {imageState.status === 'ready' && (
          <p className="text-xs text-emerald-300 mt-1">
            {imageState.wasOptimized
              ? `Optimized ${formatBytes(imageState.originalBytes)} → ${formatBytes(imageState.finalBytes)} (${imageState.mimeType.split('/')[1]})`
              : `Selected ${imageState.prepared.name} (${formatBytes(imageState.finalBytes)})`}
          </p>
        )}
        {imageState.status === 'error' && (
          <p className="text-xs text-red-300 mt-1">{imageState.message}</p>
        )}
        {imageState.status !== 'idle' && (
          <button
            type="button"
            onClick={clearSelectedImage}
            className="text-xs text-zinc-400 hover:text-white w-fit mt-1"
          >
            Remove selected image
          </button>
        )}
        {project?.image_url && (
          <p className="text-xs text-zinc-500 mt-1">
            Current image: {project.image_url.split('/').pop()}
          </p>
        )}
      </div>

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
