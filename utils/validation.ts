export function isValidUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function sanitizeFilename(filename: string): string {
  // Allow alphanumeric, dashes, underscores, and dots.
  // Replace everything else with underscore.
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export interface ProjectInput {
  title: string;
  repo_url?: string;
  demo_url?: string;
}

export function validateProjectInput(input: ProjectInput): string[] {
  const errors: string[] = [];

  if (!input.title || input.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (input.title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }

  if (input.repo_url && input.repo_url.trim() !== '' && !isValidUrl(input.repo_url)) {
    errors.push('Invalid Repository URL');
  }

  if (input.demo_url && input.demo_url.trim() !== '' && !isValidUrl(input.demo_url)) {
    errors.push('Invalid Demo URL');
  }

  return errors;
}
