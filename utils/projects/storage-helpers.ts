import { formatBytes } from '@/utils/format';
import { sanitizeFilename } from '@/utils/string';

export function buildProjectImageFilename(file: File): string {
  return `${Date.now()}-${sanitizeFilename(file.name)}`;
}

export function formatMaxImageSizeError(size: number, maxBytes: number): string {
  return `Image is ${formatBytes(size)}. Max allowed is ${formatBytes(maxBytes)}.`;
}

export function formatUploadTooLargeError(maxBytes: number): string {
  return `Upload failed: image must be under ${formatBytes(maxBytes)}.`;
}

export function isLikelyPayloadTooLarge(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const record = error as Record<string, unknown>;
  const statusCode = record.statusCode;
  if (typeof statusCode === 'number' && statusCode === 413) {
    return true;
  }

  const messageValue = record.message;
  const message = typeof messageValue === 'string' ? messageValue.toLowerCase() : '';

  return (
    message.includes('payload too large') ||
    message.includes('entity too large') ||
    (message.includes('too large') && message.includes('size')) ||
    (message.includes('exceed') && message.includes('size')) ||
    (message.includes('maximum') && message.includes('size'))
  );
}
