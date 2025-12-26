import type { SupabaseClient } from '@supabase/supabase-js';
import { sanitizeFilename } from '@/utils/string';
import { PROJECTS_BUCKET } from '@/utils/projects/constants';

export async function uploadProjectImage(
  supabase: SupabaseClient,
  file: File | null,
): Promise<string | null> {
  if (!file || file.size === 0) {
    return null;
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
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PROJECTS_BUCKET).getPublicUrl(data.path);

  return publicUrl || null;
}
