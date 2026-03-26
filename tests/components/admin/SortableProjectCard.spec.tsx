import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SortableProjectCard from '@/components/admin/SortableProjectCard';
import type { Project } from '@/types';

const project: Project = {
  id: '1',
  title: 'Test Project',
  description: 'A test project',
  short_description: 'Short',
  image_url: 'https://test.com/image.jpg',
  demo_url: 'https://demo.com',
  repo_url: 'https://github.com/test',
  tags: ['react'],
  sort_order: 1,
  is_featured: false,
  created_at: new Date().toISOString(),
};

let mockIsDragging = false;

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: { 'aria-describedby': 'dnd-kit-sortable' },
    listeners: { onKeyDown: vi.fn(), onPointerDown: vi.fn() },
    setNodeRef: vi.fn(),
    setActivatorNodeRef: vi.fn(),
    transform: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
    transition: 'transform 250ms ease',
    isDragging: mockIsDragging,
  }),
}));

describe('SortableProjectCard', () => {
  it('renders successfully', () => {
    mockIsDragging = false;
    render(
      <SortableProjectCard
        project={project}
        isSelected={false}
        onToggleSelect={() => {}}
        onEdit={() => {}}
      />
    );
    expect(screen.getByText(project.title)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `Reorder ${project.title}` })).toBeInTheDocument();
  });

  it('adds z-index when dragging', () => {
    mockIsDragging = true;
    const { container } = render(
      <SortableProjectCard
        project={project}
        isSelected={false}
        onToggleSelect={() => {}}
        onEdit={() => {}}
      />
    );
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveStyle('z-index: 20');
  });
});
