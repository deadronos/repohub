import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnimatedProjectGrid from '@/components/projects/AnimatedProjectGrid';
import { makeProject } from '@/tests/fixtures/project';

const mockProjects = [
  makeProject({ id: '1', title: 'Project 1' }),
  makeProject({ id: '2', title: 'Project 2' }),
  makeProject({ id: '3', title: 'Project 3' }),
];

const mockOnClick = vi.fn();

describe('AnimatedProjectGrid', () => {
  it('renders all project cards', () => {
    render(<AnimatedProjectGrid projects={mockProjects} onProjectClick={mockOnClick} />);
    expect(screen.getByText('Project 1')).toBeTruthy();
    expect(screen.getByText('Project 2')).toBeTruthy();
    expect(screen.getByText('Project 3')).toBeTruthy();
  });

  it('renders empty when no projects', () => {
    render(<AnimatedProjectGrid projects={[]} onProjectClick={mockOnClick} />);
    expect(screen.queryByText('Project 1')).toBeNull();
  });
});