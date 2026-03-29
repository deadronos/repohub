import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProjectCard from '@/components/ProjectCard';
import type { Project } from '@/types';
import { makeProject } from '@/tests/fixtures/project';

vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await import('@/tests/helpers/projectCardMocks');
  return createFramerMotionMock();
});

vi.mock('@/components/GitHubStats', async () => {
  const { createGitHubStatsMock } = await import('@/tests/helpers/projectCardMocks');
  return createGitHubStatsMock();
});

vi.mock('next/image', async () => {
  const { createNextImageMock } = await import('@/tests/helpers/projectCardMocks');
  return createNextImageMock();
});

describe('ProjectCard component', () => {
  const baseProject: Project = makeProject({
    id: 'p1',
    title: 'My Project',
    short_description: 'Short',
    description: 'Long',
    tags: ['react', 'nextjs', 'vitest', 'extra'],
    image_url: null,
    demo_url: null,
    repo_url: null,
  });

  it('invokes onClick for Enter and Space key', () => {
    const onClick = vi.fn();
    render(<ProjectCard project={baseProject} onClick={onClick} />);

    const card = screen.getByRole('button', { name: 'View details for My Project' });

    fireEvent.keyDown(card, { key: 'Enter' });
    fireEvent.keyDown(card, { key: ' ' });

    expect(onClick).toHaveBeenCalledWith('p1');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('invokes onClick on mouse click', () => {
    const onClick = vi.fn();
    render(<ProjectCard project={baseProject} onClick={onClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'View details for My Project' }));
    expect(onClick).toHaveBeenCalledWith('p1');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not invoke onClick for unrelated keys (bad/edge case)', () => {
    const onClick = vi.fn();
    render(<ProjectCard project={baseProject} onClick={onClick} />);

    const card = screen.getByRole('button', { name: 'View details for My Project' });
    fireEvent.keyDown(card, { key: 'Escape' });

    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders up to 3 tags', () => {
    const onClick = vi.fn();
    render(<ProjectCard project={baseProject} onClick={onClick} />);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Nextjs')).toBeInTheDocument();
    expect(screen.getByText('Vitest')).toBeInTheDocument();
    expect(screen.queryByText('Extra')).not.toBeInTheDocument();
  });

  it('keeps cards lightweight even when repo_url exists and still renders the image', () => {
    const onClick = vi.fn();
    const project: Project = {
      ...baseProject,
      repo_url: 'https://github.com/me/repo',
      image_url: '/img.png',
    };

    render(<ProjectCard project={project} onClick={onClick} />);

    expect(screen.queryByTestId('github-stats')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'My Project' })).toBeInTheDocument();
  });

  it('filters empty/whitespace tags (bad input)', () => {
    const onClick = vi.fn();
    const project: Project = {
      ...baseProject,
      tags: ['  ', '', 'react'],
    };

    const { container } = render(<ProjectCard project={project} onClick={onClick} />);
    expect(screen.getByText('React')).toBeInTheDocument();

    const chips = container.querySelectorAll('span.text-xs');
    expect(chips).toHaveLength(1);
  });

  it('renders gracefully when short_description is null', () => {
    const onClick = vi.fn();
    const project: Project = {
      ...baseProject,
      short_description: null,
    };

    const { container } = render(<ProjectCard project={project} onClick={onClick} />);
    const descElement = container.querySelector('.line-clamp-2');
    expect(descElement).toHaveTextContent('');
  });

  it('truncates long short_description to 100 characters', () => {
    const onClick = vi.fn();
    const longDescription = 'A'.repeat(150);
    const project: Project = {
      ...baseProject,
      short_description: longDescription,
    };

    const { container } = render(<ProjectCard project={project} onClick={onClick} />);
    const descElement = container.querySelector('.line-clamp-2');
    expect(descElement).toHaveTextContent('A'.repeat(97) + '...');
  });
});
