import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProjectCard from '@/components/ProjectCard';
import type { Project } from '@/types';

vi.mock('framer-motion', () => ({
  motion: {
    div: (allProps: { children: React.ReactNode } & Record<string, unknown>) => {
      const { children } = allProps;
      const props = { ...allProps };
      delete props.layoutId;
      delete props.whileHover;
      return <div {...props}>{children}</div>;
    },
  },
}));

vi.mock('@/components/GitHubStats', () => ({
  default: () => <div data-testid="github-stats" />,
}));

vi.mock('next/image', () => ({
  default: (allProps: { alt: string; src?: unknown } & Record<string, unknown>) => {
    const { alt, src } = allProps;
    const props = { ...allProps };
    delete props.fill;
    delete props.sizes;
    const dataSrc = typeof src === 'string' ? src : '';
    return <div role="img" aria-label={alt} data-src={dataSrc} {...props} />;
  },
}));

describe('ProjectCard component', () => {
  const baseProject: Project = {
    id: 'p1',
    title: 'My Project',
    short_description: 'Short',
    description: 'Long',
    tags: ['react', 'nextjs', 'vitest', 'extra'],
    image_url: null,
    created_at: '2023-01-01T00:00:00Z',
    sort_order: 1,
    demo_url: null,
    repo_url: null,
    is_featured: false,
  };

  it('invokes onClick for Enter and Space key', () => {
    const onClick = vi.fn();
    render(<ProjectCard project={baseProject} onClick={onClick} />);

    const card = screen.getByRole('button', { name: 'View details for My Project' });

    fireEvent.keyDown(card, { key: 'Enter' });
    fireEvent.keyDown(card, { key: ' ' });

    expect(onClick).toHaveBeenCalledWith('p1');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('does not invoke onClick for unrelated keys (bad/edge case)', () => {
    const onClick = vi.fn();
    render(<ProjectCard project={baseProject} onClick={onClick} />);

    const card = screen.getByRole('button', { name: 'View details for My Project' });
    fireEvent.keyDown(card, { key: 'Escape' });

    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders up to 3 tags and hides GitHubStats when repo_url is missing', () => {
    const onClick = vi.fn();
    render(<ProjectCard project={baseProject} onClick={onClick} />);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Nextjs')).toBeInTheDocument();
    expect(screen.getByText('Vitest')).toBeInTheDocument();
    expect(screen.queryByText('Extra')).not.toBeInTheDocument();

    expect(screen.queryByTestId('github-stats')).not.toBeInTheDocument();
  });

  it('renders GitHubStats when repo_url exists and image when image_url exists', () => {
    const onClick = vi.fn();
    const project: Project = {
      ...baseProject,
      repo_url: 'https://github.com/me/repo',
      image_url: '/img.png',
    };

    render(<ProjectCard project={project} onClick={onClick} />);

    expect(screen.getByTestId('github-stats')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'My Project' })).toBeInTheDocument();
  });
});
