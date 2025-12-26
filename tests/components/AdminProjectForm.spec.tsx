import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminProjectForm from '@/components/AdminProjectForm';
import { createProject, updateProject } from '@/app/actions/projects';
import { getActionError } from '@/utils/actions';
import type { Project } from '@/types';

// Mock dependencies
vi.mock('@/app/actions/projects', () => ({
  createProject: vi.fn(),
  updateProject: vi.fn(),
}));

// Mock lucide icons
vi.mock('lucide-react', () => ({
  Upload: () => <div data-testid="upload-icon" />,
}));

// Mock getActionError
vi.mock('@/utils/actions', () => ({
  getActionError: vi.fn(),
}));

function fillRequiredFields() {
  const titleInput = screen.getByLabelText(/Project Title/i);
  const shortDescInput = screen.getByLabelText(/Short Description/i);

  fireEvent.input(titleInput, { target: { value: 'My Project' } });
  fireEvent.input(shortDescInput, { target: { value: 'Short desc' } });
}

describe('AdminProjectForm Accessibility', () => {
  const createProjectMock = vi.mocked(createProject);
  const updateProjectMock = vi.mocked(updateProject);
  const getActionErrorMock = vi.mocked(getActionError);

  beforeEach(() => {
    createProjectMock.mockReset();
    updateProjectMock.mockReset();
    getActionErrorMock.mockReset();
  });

  it('has accessible labels for all inputs', () => {
    render(<AdminProjectForm onComplete={vi.fn()} />);

    // These will fail if labels are not associated with inputs
    expect(screen.getByLabelText(/Project Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Short Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Repo URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Demo URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tags/i)).toBeInTheDocument();

    // File input check
    expect(screen.getByLabelText(/Project Cover Image/i)).toBeInTheDocument();
  });

  it('shows required indicators for required fields', () => {
    render(<AdminProjectForm onComplete={vi.fn()} />);

    // Check that required fields have the visual indicator
    const label = screen.getByText(/Project Title/);
    expect(label.textContent).toContain('*');

    const shortDescLabel = screen.getByText(/Short Description/);
    expect(shortDescLabel.textContent).toContain('*');
  });

  it('submits createProject when no project and calls onComplete on success', async () => {
    createProjectMock.mockResolvedValue({ data: true });
    getActionErrorMock.mockReturnValue(null);
    const onComplete = vi.fn();

    render(<AdminProjectForm onComplete={onComplete} />);
    fillRequiredFields();

    fireEvent.click(screen.getByRole('button', { name: 'Initialize Project Node' }));

    await waitFor(() => {
      expect(createProjectMock).toHaveBeenCalledTimes(1);
    });
    expect(updateProjectMock).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('submits updateProject when editing and calls onComplete on success', async () => {
    updateProjectMock.mockResolvedValue({ data: true });
    getActionErrorMock.mockReturnValue(null);
    const onComplete = vi.fn();

    const project: Project = {
      id: 'p1',
      title: 'Existing',
      short_description: 'Existing short',
      description: null,
      tags: ['nextjs'],
      image_url: null,
      created_at: '2023-01-01T00:00:00Z',
      sort_order: 1,
      demo_url: null,
      repo_url: null,
      is_featured: false,
    };

    render(<AdminProjectForm project={project} onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(updateProjectMock).toHaveBeenCalledTimes(1);
    });
    expect(createProjectMock).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows an error message and does not call onComplete when action fails (bad case)', async () => {
    createProjectMock.mockResolvedValue({ error: 'Nope' });
    getActionErrorMock.mockReturnValue('Nope');
    const onComplete = vi.fn();

    render(<AdminProjectForm onComplete={onComplete} />);
    fillRequiredFields();

    fireEvent.click(screen.getByRole('button', { name: 'Initialize Project Node' }));

    await waitFor(() => {
      expect(screen.getByText('Nope')).toBeInTheDocument();
    });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('renders current image hint and hidden current_image_url when editing with image_url', () => {
    const project: Project = {
      id: 'p2',
      title: 'Existing',
      short_description: 'Existing short',
      description: null,
      tags: [],
      image_url: 'https://example.com/images/test.png',
      created_at: '2023-01-01T00:00:00Z',
      sort_order: 1,
      demo_url: null,
      repo_url: null,
      is_featured: false,
    };

    render(<AdminProjectForm project={project} onComplete={vi.fn()} />);

    const hidden = document.querySelector('input[name="current_image_url"]');
    expect(hidden).toBeTruthy();
    expect(screen.getByText(/Current image:/i)).toHaveTextContent('test.png');
  });
});
