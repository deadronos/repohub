import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminSortableGrid from '@/components/admin/AdminSortableGrid';

const mockProjects = [
  {
    id: '1',
    title: 'Project 1',
    description: 'Desc 1',
    image_url: 'https://test.com/image1.jpg',
    demo_url: 'https://test.com/demo1.com',
    repo_url: 'https://test.com/repo1.com',
    tags: ['tag1'],
    sort_order: 1,
    featured: false,
  },
  {
    id: '2',
    title: 'Project 2',
    description: 'Desc 2',
    image_url: 'https://test.com/image2.jpg',
    demo_url: 'https://test.com/demo2.com',
    repo_url: 'https://test.com/repo2.com',
    tags: ['tag2'],
    sort_order: 2,
    featured: true,
  },
];

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <div data-testid="dnd-context">{children}</div>,
  DragOverlay: ({ children }: any) => <div data-testid="drag-overlay">{children}</div>,
  closestCenter: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => <div data-testid="sortable-context">{children}</div>,
  rectSortingStrategy: vi.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    setActivatorNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

describe('AdminSortableGrid', () => {
  it('renders correctly with projects', () => {
    const selectedIds = new Set<string>();

    render(
      <AdminSortableGrid
        projects={mockProjects as any}
        selectedIds={selectedIds}
        orderStatus="idle"
        sensors={[]}
        activeProject={null}
        onDragStart={vi.fn()}
        onDragEnd={vi.fn() as any}
        onDragCancel={vi.fn()}
        onToggleSelect={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    expect(screen.getByTestId('sortable-context')).toBeInTheDocument();

    expect(screen.getByText(mockProjects[0].title)).toBeInTheDocument();
  });

  it('renders overlay when dragging', () => {
    const activeProject = mockProjects[0];
    const selectedIds = new Set<string>();

    render(
      <AdminSortableGrid
        projects={mockProjects as any}
        selectedIds={selectedIds}
        orderStatus="idle"
        sensors={[]}
        activeProject={activeProject as any}
        onDragStart={vi.fn()}
        onDragEnd={vi.fn() as any}
        onDragCancel={vi.fn()}
        onToggleSelect={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    const titles = screen.getAllByText(activeProject.title);
    expect(titles.length).toBeGreaterThanOrEqual(2);
  });
});
