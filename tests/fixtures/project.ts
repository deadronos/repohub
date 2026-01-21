import type { Project } from '@/types';

const BASE_PROJECT: Project = {
  id: '1',
  title: 'Project One',
  short_description: 'First project description.',
  description: 'Details for project one.',
  tags: ['react'],
  image_url: '/test-image.jpg',
  created_at: '2023-01-01T00:00:00Z',
  sort_order: 1,
  demo_url: 'https://demo.com',
  repo_url: 'https://github.com/repo',
  is_featured: false,
};

export function makeProject(overrides: Partial<Project> = {}): Project {
  return { ...BASE_PROJECT, ...overrides };
}
