import { describe, it, expect } from 'vitest';
import { PROJECTS_TABLE, PROJECTS_BUCKET, PROJECTS_CACHE_TAG } from '@/utils/projects/constants';

describe('Project Constants', () => {
  it('PROJECTS_TABLE should be "projects"', () => {
    expect(PROJECTS_TABLE).toBe('projects');
  });

  it('PROJECTS_BUCKET should be "projects"', () => {
    expect(PROJECTS_BUCKET).toBe('projects');
  });

  it('PROJECTS_CACHE_TAG should be "projects"', () => {
    expect(PROJECTS_CACHE_TAG).toBe('projects');
  });
});
