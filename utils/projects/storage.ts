import type { SupabaseClient } from '@supabase/supabase-js';
import { PROJECTS_BUCKET } from '@/utils/projects/constants';
import { PROJECT_IMAGE_MAX_BYTES } from '@/utils/projects/image-limits';
import { formatError, type ActionResult } from '@/utils/actions';
import {
  buildProjectImageFilename,
  formatMaxImageSizeError,
  formatUploadTooLargeError,
  isLikelyPayloadTooLarge,
} from '@/utils/projects/storage-helpers';

export async function uploadProjectImage(
  supabase: SupabaseClient,
  file: File | null,
): Promise<ActionResult<string | null>> {
  if (!file || file.size === 0) {
    return { data: null };
  }

  if (file.size > PROJECT_IMAGE_MAX_BYTES) {
    return {
      error: formatMaxImageSizeError(file.size, PROJECT_IMAGE_MAX_BYTES),
    };
  }

  const filename = buildProjectImageFilename(file);
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
        error: formatUploadTooLargeError(PROJECT_IMAGE_MAX_BYTES),
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
