'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { formatBytes } from '@/utils/format';
import { optimizeImageToUnderBytes, ImageOptimizationError } from '@/utils/images/optimize-image';
import {
  PROJECT_IMAGE_MAX_BYTES,
  PROJECT_IMAGE_MAX_DIMENSION,
  PROJECT_IMAGE_TARGET_BYTES,
} from '@/utils/projects/image-limits';

export type ImageState =
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

type UseProjectImageFieldOptions = {
  onResetError?: () => void;
};

export function useProjectImageField({ onResetError }: UseProjectImageFieldOptions = {}) {
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

    onResetError?.();

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

  return {
    imageState,
    fileInputRef,
    clearSelectedImage,
    handleImageChange,
  };
}
