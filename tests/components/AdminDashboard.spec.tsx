import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboard from '@/components/AdminDashboard';
import type { Project } from '@/types';
import { deleteProjects, updateProjectOrder } from '@/app/actions/projects';
import type { DragEndEvent } from '@dnd-kit/core';
import type { ReactNode } from 'react';

let latestDndContextProps: { onDragEnd?: (event: DragEndEvent) => void | Promise<void> } | null =
  null;
const refreshSpy = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: refreshSpy,
  }),
}));

vi.mock('@/app/actions/projects', () => ({
  deleteProjects: vi.fn(),
  updateProjectOrder: vi.fn(),
}));

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, ...props }: { children: ReactNode }) => {
    latestDndContextProps = props;
    return <div data-testid="dnd-context">{children}</div>;
  },
  DragOverlay: ({ children }: { children: ReactNode }) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
  KeyboardSensor: function KeyboardSensor() {},
  PointerSensor: function PointerSensor() {},
  closestCenter: () => undefined,
  useSensor: (_sensor: unknown, options: unknown) => ({ _sensor, options }),
  useSensors: (...sensors: unknown[]) => sensors,
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: ReactNode }) => (
    <div data-testid="sortable-context">{children}</div>
  ),
  arrayMove: <T,>(array: T[], from: number, to: number) => {
    const copy = array.slice();
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
  },
  rectSortingStrategy: () => undefined,
  sortableKeyboardCoordinates: () => undefined,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => undefined,
    setActivatorNodeRef: () => undefined,
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => '',
    },
  },
}));

const mockProjects: Project[] = [
  {
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
  },
  {
    id: '2',
    title: 'Project Two',
    short_description: 'Second project description.',
    description: 'Details for project two.',
    tags: ['nextjs'],
    image_url: null,
    created_at: '2023-01-02T00:00:00Z',
    sort_order: 2,
    demo_url: null,
    repo_url: null,
    is_featured: false,
  },
];

describe('AdminDashboard drag ordering', () => {
  const updateOrderMock = vi.mocked(updateProjectOrder);
  const deleteProjectsMock = vi.mocked(deleteProjects);

  beforeEach(() => {
    latestDndContextProps = null;
    refreshSpy.mockReset();
    updateOrderMock.mockReset();
    deleteProjectsMock.mockReset();
    vi.restoreAllMocks();
  });

  it('renders drag handles for each project', () => {
    render(<AdminDashboard initialProjects={mockProjects} />);

    expect(screen.getByLabelText('Reorder Project One')).toBeInTheDocument();
    expect(screen.getByLabelText('Reorder Project Two')).toBeInTheDocument();
  });

  it('reorders items and persists order on drag end', async () => {
    updateOrderMock.mockResolvedValue({ success: true });
    render(<AdminDashboard initialProjects={mockProjects} />);

    const event = { active: { id: '1' }, over: { id: '2' } } as DragEndEvent;

    await act(async () => {
      await latestDndContextProps?.onDragEnd?.(event);
    });

    await waitFor(() => {
      expect(updateOrderMock).toHaveBeenCalledWith(['2', '1']);
    });

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]?.textContent).toBe('Project Two');
    expect(headings[1]?.textContent).toBe('Project One');
    expect(refreshSpy).toHaveBeenCalled();
    expect(screen.getByText('Order saved')).toBeInTheDocument();
  });

  it('reverts order and shows error when save fails', async () => {
    updateOrderMock.mockResolvedValue({ error: 'Failed to update order' });
    render(<AdminDashboard initialProjects={mockProjects} />);

    const event = { active: { id: '1' }, over: { id: '2' } } as DragEndEvent;

    await act(async () => {
      await latestDndContextProps?.onDragEnd?.(event);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to update order')).toBeInTheDocument();
    });

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]?.textContent).toBe('Project One');
    expect(headings[1]?.textContent).toBe('Project Two');
  });

  it('refreshes the list when ids are out of date', async () => {
    updateOrderMock.mockResolvedValue({ error: 'Project order contains unknown ids' });
    render(<AdminDashboard initialProjects={mockProjects} />);

    const event = { active: { id: '1' }, over: { id: '2' } } as DragEndEvent;

    await act(async () => {
      await latestDndContextProps?.onDragEnd?.(event);
    });

    await waitFor(() => {
      expect(screen.getByText('Order was out of date. Refreshed list.')).toBeInTheDocument();
    });

    expect(refreshSpy).toHaveBeenCalled();
  });

  it('does not delete when confirm is cancelled (bad/edge case)', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    deleteProjectsMock.mockResolvedValue({ success: true });
    render(<AdminDashboard initialProjects={mockProjects} />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]!);

    const deleteButton = screen.getByRole('button', { name: /Delete Selected \(1\)/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteProjectsMock).not.toHaveBeenCalled();
    });
  });

  it('optimistically deletes selected projects and refreshes on success', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    deleteProjectsMock.mockResolvedValue({ success: true });
    render(<AdminDashboard initialProjects={mockProjects} />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]!);

    fireEvent.click(screen.getByRole('button', { name: /Delete Selected \(1\)/i }));

    // Optimistic removal
    await waitFor(() => {
      expect(screen.queryByText('Project One')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(deleteProjectsMock).toHaveBeenCalledWith(['1']);
    });

    expect(refreshSpy).toHaveBeenCalled();
  });

  it('reverts optimistic delete and shows error when delete fails (bad case)', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    deleteProjectsMock.mockResolvedValue({ error: 'Failed to delete' });
    render(<AdminDashboard initialProjects={mockProjects} />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]!);

    fireEvent.click(screen.getByRole('button', { name: /Delete Selected \(1\)/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to delete')).toBeInTheDocument();
    });

    // Reverted
    expect(screen.getByText('Project One')).toBeInTheDocument();
    expect(screen.getByText('Project Two')).toBeInTheDocument();
  });
});
