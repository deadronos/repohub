import type { SupabaseClient } from '@supabase/supabase-js';
import { sanitizeFilename } from '@/utils/string';
import { PROJECTS_BUCKET } from '@/utils/projects/constants';
import { PROJECT_IMAGE_MAX_BYTES } from '@/utils/projects/image-limits';
import { formatBytes } from '@/utils/format-bytes';
import { formatError, type ActionResult } from '@/utils/actions';

const isLikelyPayloadTooLarge = (error: unknown): boolean => {
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
};

export async function uploadProjectImage(
  supabase: SupabaseClient,
  file: File | null,
): Promise<ActionResult<string | null>> {
  if (!file || file.size === 0) {
    return { data: null };
  }

  if (file.size > PROJECT_IMAGE_MAX_BYTES) {
    return {
      error: `Image is ${formatBytes(file.size)}. Max allowed is ${formatBytes(PROJECT_IMAGE_MAX_BYTES)}.`,
    };
  }

  const filename = `${Date.now()}-${sanitizeFilename(file.name)}`;
  const { data, error } = await supabase.storage.from(PROJECTS_BUCKET).upload(filename, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error || !data) {
    if (error) {
      console.error('Upload error:', error);
    }
    if (isLikelyPayloadTooLarge(error)) {
      return {
        error: `Upload failed: image must be under ${formatBytes(PROJECT_IMAGE_MAX_BYTES)}.`,
      };
    }
    return { error: formatError(error, 'Upload failed') };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PROJECTS_BUCKET).getPublicUrl(data.path);

  if (!publicUrl) {
    return { error: 'Upload failed' };
  }

  return { data: publicUrl };
}
