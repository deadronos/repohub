import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProjectActions from '@/components/projects/ProjectActions';

describe('ProjectActions Component', () => {
  it('renders both buttons when both URLs are provided', () => {
    render(<ProjectActions demoUrl="https://demo.com" repoUrl="https://github.com" />);

    const demoLink = screen.getByRole('link', { name: /play \/ demo/i });
    const repoLink = screen.getByRole('link', { name: /view code/i });

    expect(demoLink).toBeInTheDocument();
    expect(demoLink).toHaveAttribute('href', 'https://demo.com');
    expect(demoLink).toHaveAttribute('target', '_blank');

    expect(repoLink).toBeInTheDocument();
    expect(repoLink).toHaveAttribute('href', 'https://github.com');
    expect(repoLink).toHaveAttribute('target', '_blank');
  });

  it('renders only demo button when only demoUrl is provided', () => {
    render(<ProjectActions demoUrl="https://demo.com" repoUrl={null} />);

    expect(screen.getByRole('link', { name: /play \/ demo/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /view code/i })).not.toBeInTheDocument();
  });

  it('renders only repo button when only repoUrl is provided', () => {
    render(<ProjectActions demoUrl={null} repoUrl="https://github.com" />);

    expect(screen.queryByRole('link', { name: /play \/ demo/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view code/i })).toBeInTheDocument();
  });

  it('renders nothing when neither URL is provided', () => {
    const { container } = render(<ProjectActions demoUrl={null} repoUrl={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
