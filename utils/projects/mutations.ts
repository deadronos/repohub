import type { SupabaseClient } from '@supabase/supabase-js';
import {
  parseProjectFormData,
  validateProjectFields,
  type ProjectFormData,
} from '@/utils/projects/form';
import { uploadProjectImage } from '@/utils/projects/storage';
import type { ActionResult } from '@/utils/actions';

export type PreparedProjectMutation = {
  parsed: ProjectFormData;
  imageUrl: string | null;
  tags: string[] | null;
};

/**
 * Validate project data using Zod schemas and return formatted errors.
 */
function collectValidationErrors(parsed: ProjectFormData): string[] {
  return validateProjectFields({
    title: parsed.title,
    short_description: parsed.short_description,
    description: parsed.description,
    repo_url: parsed.repo_url,
    demo_url: parsed.demo_url,
    tags: parsed.tags.join(','),
  });
}

export async function prepareProjectMutation(
  supabase: SupabaseClient,
  formData: FormData,
): Promise<ActionResult<PreparedProjectMutation>> {
  const parsed = parseProjectFormData(formData);
  const validationErrors = collectValidationErrors(parsed);

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
