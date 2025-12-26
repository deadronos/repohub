import { isValidUrl } from '@/utils/validation';
import { getFormString } from '@/utils/form';
import { normalizeGitHubRepoUrl } from '@/utils/github-url';

export interface ProjectInput {
  title: string;
  repoUrl?: string;
  demoUrl?: string;
}

export type ProjectFormData = {
  id: string;
  title: string;
  short_description: string;
  description: string;
  repo_url: string;
  demo_url: string;
  tags: string[];
  imageFile: File | null;
  current_image_url: string;
};

export function normalizeTags(tagsValue?: string | null): string[] {
  if (!tagsValue) return [];
  return tagsValue
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function parseProjectFormData(formData: FormData): ProjectFormData {
  const imageEntry = formData.get('image');
  const repoUrl = getFormString(formData, 'repo_url');
  const normalizedRepoUrl = isValidUrl(repoUrl) ? normalizeGitHubRepoUrl(repoUrl) : null;

  return {
    id: getFormString(formData, 'id'),
    title: getFormString(formData, 'title'),
    short_description: getFormString(formData, 'short_description'),
    description: getFormString(formData, 'description'),
    repo_url: normalizedRepoUrl ?? repoUrl,
    demo_url: getFormString(formData, 'demo_url'),
    tags: normalizeTags(getFormString(formData, 'tags')),
    imageFile: imageEntry instanceof File ? imageEntry : null,
    current_image_url: getFormString(formData, 'current_image_url'),
  };
}

export function validateProjectInput(input: ProjectInput): string[] {
  const errors: string[] = [];
  const title = input.title.trim();
  const repoUrl = input.repoUrl?.trim();
  const demoUrl = input.demoUrl?.trim();

  if (!title) {
    errors.push('Title is required');
  } else if (title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }

  if (repoUrl && !isValidUrl(repoUrl)) {
    errors.push('Invalid Repository URL');
  }

  if (demoUrl && !isValidUrl(demoUrl)) {
    errors.push('Invalid Demo URL');
  }

  return errors;
}
