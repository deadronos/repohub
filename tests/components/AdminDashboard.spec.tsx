import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboard from '@/components/AdminDashboard';
import type { Project } from '@/types';
import { deleteProjects, updateProjectOrder } from '@/app/actions/projects';
import type { DragEndEvent } from '@dnd-kit/core';
import { makeProject } from '@/tests/fixtures/project';
import {
  createDndKitCoreMock,
  createDndKitSortableMock,
  createDndKitUtilitiesMock,
  getLatestDndContextProps,
  getRefreshSpy,
  getUseSortableArgs,
  resetAdminDashboardMocks,
} from '@/tests/helpers/adminDashboardMocks';

const refreshSpy = getRefreshSpy();

vi.mock('next/navigation', async () => {
  const { getRefreshSpy } = await import('@/tests/helpers/adminDashboardMocks');
  return {
    useRouter: () => ({
      refresh: getRefreshSpy(),
    }),
  };
});

vi.mock('@/app/actions/projects', async () => {
  const { createAdminDashboardActionsMock } = await import('@/tests/helpers/projectActionsMocks');
  return createAdminDashboardActionsMock();
});

vi.mock('@dnd-kit/core', async () => {
  const { createDndKitCoreMock } = await import('@/tests/helpers/adminDashboardMocks');
  return createDndKitCoreMock();
});

vi.mock('@dnd-kit/sortable', async () => {
  const { createDndKitSortableMock } = await import('@/tests/helpers/adminDashboardMocks');
  return createDndKitSortableMock();
});

vi.mock('@dnd-kit/utilities', async () => {
  const { createDndKitUtilitiesMock } = await import('@/tests/helpers/adminDashboardMocks');
  return createDndKitUtilitiesMock();
});

const mockProjects: Project[] = [
  makeProject(),
  makeProject({
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
  }),
];

describe('AdminDashboard drag ordering', () => {
  const updateOrderMock = vi.mocked(updateProjectOrder);
  const deleteProjectsMock = vi.mocked(deleteProjects);

  beforeEach(() => {
    resetAdminDashboardMocks();
    updateOrderMock.mockReset();
    deleteProjectsMock.mockReset();
    vi.restoreAllMocks();
  });

  it('renders drag handles for each project', () => {
    render(<AdminDashboard initialProjects={mockProjects} />);

    expect(screen.getByLabelText('Reorder Project One')).toBeInTheDocument();
    expect(screen.getByLabelText('Reorder Project Two')).toBeInTheDocument();
  });

  it('renders fallbacks for missing image and tags', () => {
    const projects: Project[] = [
      ...mockProjects,
      makeProject({
        id: '3',
        title: 'Project Three',
        short_description: 'Third',
        description: null,
        tags: null,
        image_url: null,
        created_at: '2023-01-03T00:00:00Z',
        sort_order: 3,
        demo_url: null,
        repo_url: null,
      }),
    ];

    render(<AdminDashboard initialProjects={projects} />);

    // Project Two + Three have null images
    expect(screen.getAllByText('No Image').length).toBeGreaterThanOrEqual(2);
    // Project Three has null tags
    expect(screen.getByText('No tags')).toBeInTheDocument();
  });

  it('opens and closes the create modal', () => {
    render(<AdminDashboard initialProjects={mockProjects} />);

    fireEvent.click(screen.getByRole('button', { name: /Add New Project/i }));
    expect(screen.getByRole('heading', { name: 'Initialize New Project' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close project form' }));
    expect(
      screen.queryByRole('heading', { name: 'Initialize New Project' }),
    ).not.toBeInTheDocument();
  });

  it('opens edit modal from a project card', () => {
    render(<AdminDashboard initialProjects={mockProjects} />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit Project One' }));
    expect(screen.getByRole('heading', { name: 'Edit Project' })).toBeInTheDocument();
  });

  it('reorders items and persists order on drag end', async () => {
    updateOrderMock.mockResolvedValue({ data: true });
    render(<AdminDashboard initialProjects={mockProjects} />);

    const event = { active: { id: '1' }, over: { id: '2' } } as DragEndEvent;

    await act(async () => {
      await getLatestDndContextProps()?.onDragEnd?.(event);
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

  it('shows saving status and passes disabled=true to sortable while persisting (edge case)', async () => {
    let resolveOrder: ((value: { data: true }) => void) | null = null;
    const pending = new Promise<{ data: true }>((resolve) => {
      resolveOrder = resolve;
    });

    updateOrderMock.mockReturnValue(pending);
    render(<AdminDashboard initialProjects={mockProjects} />);

    const event = { active: { id: '1' }, over: { id: '2' } } as DragEndEvent;

    act(() => {
      void getLatestDndContextProps()?.onDragEnd?.(event);
    });

    await waitFor(() => {
      expect(screen.getByText('Saving order...')).toBeInTheDocument();
    });

    expect(getUseSortableArgs().some((a) => a.disabled === true)).toBe(true);

    await act(async () => {
      resolveOrder?.({ data: true });
      await Promise.resolve();
    });
  });

  it('resets saved status back to idle after timeout (edge case)', async () => {
    vi.useFakeTimers();
    updateOrderMock.mockResolvedValue({ data: true });
    render(<AdminDashboard initialProjects={mockProjects} />);

    const event = { active: { id: '1' }, over: { id: '2' } } as DragEndEvent;

    await act(async () => {
      await getLatestDndContextProps()?.onDragEnd?.(event);
    });

    expect(screen.getByText('Order saved')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.queryByText('Order saved')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('reverts order and shows error when save fails', async () => {
    updateOrderMock.mockResolvedValue({ error: 'Failed to update order' });
    render(<AdminDashboard initialProjects={mockProjects} />);

    const event = { active: { id: '1' }, over: { id: '2' } } as DragEndEvent;

    await act(async () => {
      await getLatestDndContextProps()?.onDragEnd?.(event);
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
      await getLatestDndContextProps()?.onDragEnd?.(event);
    });

    await waitFor(() => {
      expect(screen.getByText('Order was out of date. Refreshed list.')).toBeInTheDocument();
    });

    expect(refreshSpy).toHaveBeenCalled();
  });

  it('does not delete when confirm is cancelled (bad/edge case)', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    deleteProjectsMock.mockResolvedValue({ data: true });
    render(<AdminDashboard initialProjects={mockProjects} />);

    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[0];
    if (!firstCheckbox) {
      throw new Error('Expected at least one checkbox');
    }
    fireEvent.click(firstCheckbox);

    const deleteButton = screen.getByRole('button', { name: /Delete Selected \(1\)/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteProjectsMock).not.toHaveBeenCalled();
    });
  });

  it('optimistically deletes selected projects and refreshes on success', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    deleteProjectsMock.mockResolvedValue({ data: true });
    render(<AdminDashboard initialProjects={mockProjects} />);

    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[0];
    if (!firstCheckbox) {
      throw new Error('Expected at least one checkbox');
    }
    fireEvent.click(firstCheckbox);

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
    const firstCheckbox = checkboxes[0];
    if (!firstCheckbox) {
      throw new Error('Expected at least one checkbox');
    }
    fireEvent.click(firstCheckbox);

    fireEvent.click(screen.getByRole('button', { name: /Delete Selected \(1\)/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to delete')).toBeInTheDocument();
    });

    // Reverted
    expect(screen.getByText('Project One')).toBeInTheDocument();
    expect(screen.getByText('Project Two')).toBeInTheDocument();
  });
});
