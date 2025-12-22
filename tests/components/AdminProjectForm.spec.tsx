import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminProjectForm from '@/components/AdminProjectForm';

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

describe('AdminProjectForm Accessibility', () => {
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
});
