'use client';

import { findBestQualityUnderBytes } from '@/utils/images/quality-search';

export type ImageOptimizationOptions = {
  maxBytes: number;
  targetBytes: number;
  maxDimension: number;
  minQuality: number;
  maxQuality: number;
  qualitySearchSteps: number;
  dimensionScaleFactor: number;
  maxDimensionPasses: number;
};

export type ImageOptimizationResult = {
  file: File;
  wasOptimized: boolean;
  originalBytes: number;
  finalBytes: number;
  mimeType: string;
  width?: number;
  height?: number;
};

export type ImageOptimizationErrorCode =
  | 'not-image'
  | 'decode-failed'
  | 'encode-failed'
  | 'cannot-compress';

export class ImageOptimizationError extends Error {
  code: ImageOptimizationErrorCode;

  constructor(code: ImageOptimizationErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

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

type DecodedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  cleanup: () => void;
};

async function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => bitmap.close(),
      };
    } catch {
      // fall through to Image() decode
    }
  }

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = 'async';
  image.src = objectUrl;

  const cleanup = () => URL.revokeObjectURL(objectUrl);

  try {
    if (typeof image.decode === 'function') {
      await image.decode();
    } else {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Failed to load image'));
      });
    }
  } catch {
    cleanup();
    throw new ImageOptimizationError('decode-failed', 'Failed to decode image.');
  }

  return {
    source: image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    cleanup,
  };
}

function computeDownscaledDimensions(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  const longestSide = Math.max(width, height);
  if (longestSide <= maxDimension) {
    return { width, height };
  }

  const scale = maxDimension / longestSide;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  if (typeof canvas.toBlob === 'function') {
    return await new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  }

  try {
    const dataUrl = canvas.toDataURL(type, quality);
    const response = await fetch(dataUrl);
    return await response.blob();
  } catch {
    return null;
  }
}

function replaceExtension(filename: string, extension: string): string {
  const trimmed = filename.trim();
  const dotIndex = trimmed.lastIndexOf('.');
  if (dotIndex <= 0) {
    return `${trimmed}.${extension}`;
  }
  return `${trimmed.slice(0, dotIndex)}.${extension}`;
}

function getExtensionFromMimeType(mimeType: string): string {
  if (mimeType === 'image/webp') {
    return 'webp';
  }
  if (mimeType === 'image/jpeg') {
    return 'jpg';
  }
  return 'img';
}

type DrawOptions = {
  background?: string;
};

function drawToCanvas(
  source: CanvasImageSource,
  width: number,
  height: number,
  options: DrawOptions = {},
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new ImageOptimizationError('encode-failed', 'Canvas 2D context is unavailable.');
  }

  if (options.background) {
    context.fillStyle = options.background;
    context.fillRect(0, 0, width, height);
  }

  context.drawImage(source, 0, 0, width, height);
  return canvas;
}

async function pickSupportedMimeType(
  canvas: HTMLCanvasElement,
  maxQuality: number,
): Promise<'image/webp' | 'image/jpeg'> {
  const webpProbe = await canvasToBlob(canvas, 'image/webp', maxQuality);
  if (webpProbe) {
    return 'image/webp';
  }

  const jpegProbe = await canvasToBlob(canvas, 'image/jpeg', maxQuality);
  if (jpegProbe) {
    return 'image/jpeg';
  }

  throw new ImageOptimizationError('encode-failed', 'Browser cannot encode this image.');
}

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

