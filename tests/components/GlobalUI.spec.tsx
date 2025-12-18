import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Loading from '@/app/loading';
import NotFound from '@/app/not-found';
import ErrorComponent from '@/app/error';

describe('Global UI Components', () => {
  it('Loading renders spinner', () => {
    const { container } = render(<Loading />);
    // Check for specific styling classes that indicate spinner
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('NotFound renders 404 message and link', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('System Malfunction: Sector Not Found')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /Return to Base/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });

  it('Error renders error message and reset button', () => {
    const error = new Error('Test error');
    const reset = vi.fn();
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<ErrorComponent error={error} reset={reset} />);

    expect(screen.getByText('Critical System Failure')).toBeInTheDocument();

    const button = screen.getByRole('button', { name: /Reboot System/i });
    fireEvent.click(button);
    expect(reset).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
