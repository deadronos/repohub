import { isValidUrl } from '@/utils/validation';
import { getFormString } from '@/utils/form';
import { normalizeGitHubRepoUrl } from '@/utils/github-url';
import { normalizeTags as normalizeProjectTags } from '@/utils/projects/tags';
import {
  ProjectCreateSchema,
  ProjectUrlSchema,
  type ProjectCreateInput,
  type ProjectUpdateInput,
  type ProjectUrlInput,
} from '@/utils/projects/schema';

export type { ProjectCreateInput, ProjectUpdateInput, ProjectUrlInput };

/** @deprecated Use {@link ProjectCreateInput} from Zod schema instead */
export interface ProjectInput {
  title: string;
  repoUrl?: string;
  demoUrl?: string;
}

/**
 * Runtime form data type that bridges FormData to structured data.
 * Includes non-serializable fields (File) that Zod cannot validate.
 */
export type ProjectFormData = {
  id?: string;
  title: string;
  short_description: string;
  description: string;
  repo_url: string;
  demo_url: string;
  tags: string[];
  imageFile: File | null;
  current_image_url: string;
};

export function parseTagsFromCsv(tagsValue?: string | null): string[] {
  if (!tagsValue) return [];
  return normalizeProjectTags(tagsValue.split(','));
}

/**
 * Parse raw FormData into a structured {@link ProjectFormData} object.
 * Handles File extraction, URL normalization, and CSV tag parsing.
 * Use {@link validateProjectFields} for Zod-powered validation of text fields.
 */
export function parseProjectFormData(formData: FormData): ProjectFormData {
  const imageEntry = formData.get('image');
  const repoUrl = getFormString(formData, 'repo_url');
  const normalizedRepoUrl = isValidUrl(repoUrl) ? normalizeGitHubRepoUrl(repoUrl) : null;
  const idValue = getFormString(formData, 'id');

  return {
    id: idValue || undefined,
    title: getFormString(formData, 'title'),
    short_description: getFormString(formData, 'short_description'),
    description: getFormString(formData, 'description'),
    repo_url: normalizedRepoUrl ?? repoUrl,
    demo_url: getFormString(formData, 'demo_url'),
    tags: parseTagsFromCsv(getFormString(formData, 'tags')),
    imageFile: imageEntry instanceof File ? imageEntry : null,
    current_image_url: getFormString(formData, 'current_image_url'),
  };
}

/**
 * Validate project text fields using Zod schema.
 * Returns array of error messages or empty array if valid.
 */
export function validateProjectFields(
  data: ProjectCreateInput,
): string[] {
  const result = ProjectCreateSchema.safeParse(data);
  if (result.success) return [];

  return result.error.issues.map((issue) => issue.message);
}

/**
 * Validate URL fields (repo URL, demo URL) using Zod.
 * Returns array of error messages or empty array if valid.
 */
export function validateProjectUrls(data: ProjectUrlInput): string[] {
  const result = ProjectUrlSchema.safeParse(data);
  if (result.success) return [];

  return result.error.issues.map((issue) => issue.message);
}

/**
 * Legacy validation function — wraps {@link validateProjectFields} and {@link validateProjectUrls}.
 * @deprecated Use {@link validateProjectFields} and {@link validateProjectUrls} directly.
 */
export function validateProjectInput(input: ProjectInput): string[] {
  const errors: string[] = [];

  const fieldResult = ProjectCreateSchema.safeParse({
    title: input.title,
    repo_url: input.repoUrl ?? '',
    demo_url: input.demoUrl ?? '',
  });

  if (!fieldResult.success) {
    for (const issue of fieldResult.error.issues) {
      errors.push(issue.message);
    }
  }

  if (input.repoUrl?.trim() && !isValidUrl(input.repoUrl.trim())) {
    errors.push('Invalid Repository URL');
  }

  if (input.demoUrl?.trim() && !isValidUrl(input.demoUrl.trim())) {
    errors.push('Invalid Demo URL');
  }

  return errors;
}
