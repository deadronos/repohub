import { isValidUrl } from '@/utils/validation';

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

const getFormString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
};

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function normalizeTags(tagsValue?: string | null): string[] {
  if (!tagsValue) return [];
  return tagsValue
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function parseProjectFormData(formData: FormData): ProjectFormData {
  const imageEntry = formData.get('image');

  return {
    id: getFormString(formData, 'id'),
    title: getFormString(formData, 'title'),
    short_description: getFormString(formData, 'short_description'),
    description: getFormString(formData, 'description'),
    repo_url: getFormString(formData, 'repo_url'),
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
