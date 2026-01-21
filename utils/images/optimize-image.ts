'use client';

import { findBestQualityUnderBytes } from '@/utils/images/quality-search';
import { canvasToBlob, drawToCanvas, pickSupportedMimeType } from '@/utils/images/optimize/canvas';
import { decodeImage } from '@/utils/images/optimize/decode';
import { ImageOptimizationError } from '@/utils/images/optimize/errors';
import { getExtensionFromMimeType, replaceExtension } from '@/utils/images/optimize/filename';
import { computeDownscaledDimensions } from '@/utils/images/optimize/resize';
import type { ImageOptimizationOptions, ImageOptimizationResult } from '@/utils/images/optimize/types';

export type { ImageOptimizationOptions, ImageOptimizationResult } from '@/utils/images/optimize/types';
export type { ImageOptimizationErrorCode } from '@/utils/images/optimize/errors';
export { ImageOptimizationError } from '@/utils/images/optimize/errors';

const DEFAULT_OPTIONS: ImageOptimizationOptions = {
  maxBytes: 500_000,
  targetBytes: 480_000,
  maxDimension: 1920,
  minQuality: 0.55,
  maxQuality: 0.85,
  qualitySearchSteps: 8,
  dimensionScaleFactor: 0.9,
  maxDimensionPasses: 6,
};

export async function optimizeImageToUnderBytes(
  file: File,
  options: Partial<ImageOptimizationOptions> = {},
): Promise<ImageOptimizationResult> {
  const resolvedOptions: ImageOptimizationOptions = { ...DEFAULT_OPTIONS, ...options };

  if (!file.type.startsWith('image/')) {
    throw new ImageOptimizationError('not-image', 'Please choose an image file.');
  }

  if (file.size <= resolvedOptions.maxBytes) {
    return {
      file,
      wasOptimized: false,
      originalBytes: file.size,
      finalBytes: file.size,
      mimeType: file.type,
    };
  }

  const decoded = await decodeImage(file);

  try {
    const initial = computeDownscaledDimensions(
      decoded.width,
      decoded.height,
      resolvedOptions.maxDimension,
    );

    let width = initial.width;
    let height = initial.height;

    for (let pass = 0; pass < resolvedOptions.maxDimensionPasses; pass += 1) {
      const probeCanvas = drawToCanvas(decoded.source, width, height);
      const mimeType = await pickSupportedMimeType(probeCanvas, resolvedOptions.maxQuality);

      const canvas =
        mimeType === 'image/jpeg'
          ? drawToCanvas(decoded.source, width, height, { background: '#ffffff' })
          : probeCanvas;

      const minBlob = await canvasToBlob(canvas, mimeType, resolvedOptions.minQuality);
      if (!minBlob) {
        throw new ImageOptimizationError('encode-failed', 'Browser failed to encode this image.');
      }

      if (minBlob.size > resolvedOptions.targetBytes) {
        width = Math.max(1, Math.round(width * resolvedOptions.dimensionScaleFactor));
        height = Math.max(1, Math.round(height * resolvedOptions.dimensionScaleFactor));
        continue;
      }

      const best = await findBestQualityUnderBytes(
        async (quality) => {
          const blob = await canvasToBlob(canvas, mimeType, quality);
          if (!blob) {
            throw new ImageOptimizationError('encode-failed', 'Browser failed to encode this image.');
          }
          return blob;
        },
        {
          minQuality: resolvedOptions.minQuality,
          maxQuality: resolvedOptions.maxQuality,
          maxBytes: resolvedOptions.targetBytes,
          steps: resolvedOptions.qualitySearchSteps,
        },
      );

      const blob = best?.value ?? minBlob;
      const extension = getExtensionFromMimeType(mimeType);
      const name = replaceExtension(file.name, extension);
      const optimizedFile = new File([blob], name, { type: mimeType, lastModified: file.lastModified });

      return {
        file: optimizedFile,
        wasOptimized: true,
        originalBytes: file.size,
        finalBytes: optimizedFile.size,
        mimeType,
        width,
        height,
      };
    }
  } finally {
    decoded.cleanup();
  }

  throw new ImageOptimizationError(
    'cannot-compress',
    'Could not reduce the image under the size limit.',
  );
}
