'use client';

import type { ChangeEvent, RefObject } from 'react';
import { Upload } from 'lucide-react';
import { formatBytes } from '@/utils/format';
import { PROJECT_IMAGE_MAX_BYTES } from '@/utils/projects/image-limits';
import type { ImageState } from '@/components/admin/useProjectImageField';

type ProjectImageUploadFieldProps = {
  imageState: ImageState;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  currentImageUrl?: string | null;
};

export default function ProjectImageUploadField({
  imageState,
  fileInputRef,
  onImageChange,
  onClearImage,
  currentImageUrl,
}: ProjectImageUploadFieldProps) {
  return (
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
          onChange={onImageChange}
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
          onClick={onClearImage}
          className="text-xs text-zinc-400 hover:text-white w-fit mt-1"
        >
          Remove selected image
        </button>
      )}
      {currentImageUrl && (
        <p className="text-xs text-zinc-500 mt-1">Current image: {currentImageUrl.split('/').pop()}</p>
      )}
    </div>
  );
}
