import type { SupabaseClient } from '@supabase/supabase-js';
import { parseProjectFormData, validateProjectInput, type ProjectFormData } from '@/utils/projects/form';
import { uploadProjectImage } from '@/utils/projects/storage';
import type { ActionResult } from '@/utils/actions';

type PreparedProjectMutation = {
  parsed: ProjectFormData;
  imageUrl: string | null;
  tags: string[] | null;
};

export async function prepareProjectMutation(
  supabase: SupabaseClient,
  formData: FormData,
): Promise<ActionResult<PreparedProjectMutation>> {
  const parsed = parseProjectFormData(formData);
  const validationErrors = validateProjectInput({
    title: parsed.title,
    repoUrl: parsed.repo_url,
    demoUrl: parsed.demo_url,
  });

  if (validationErrors.length > 0) {
    return { error: validationErrors.join(', ') };
  }

  const imageUpload = await uploadProjectImage(supabase, parsed.imageFile);
  if ('error' in imageUpload) {
    return { error: imageUpload.error };
  }

  const imageUrl = imageUpload.data;
  const tags = parsed.tags.length > 0 ? parsed.tags : null;

  return { data: { parsed, imageUrl, tags } };
}
