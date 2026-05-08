import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyFilterState from '@/components/projects/EmptyFilterState';

describe('EmptyFilterState', () => {
  const mockOnClear = vi.fn();

  beforeEach(() => {
    mockOnClear.mockClear();
  });

  describe('rendering', () => {
    it('renders search icon', () => {
      render(<EmptyFilterState activeTags={[]} searchQuery="" onClearFilters={mockOnClear} />);
      expect(screen.getByTestId('search-icon')).toBeTruthy();
    });

    it('renders heading "No projects found"', () => {
      render(<EmptyFilterState activeTags={[]} searchQuery="" onClearFilters={mockOnClear} />);
      expect(screen.getByRole('heading', { name: 'No projects found' })).toBeTruthy();
    });

    it('applies glass-panel class', () => {
      const { container } = render(<EmptyFilterState activeTags={[]} searchQuery="" onClearFilters={mockOnClear} />);
      const panel = container.firstChild as HTMLElement;
      expect(panel.className).toContain('glass-panel');
    });
  });

  describe('context message', () => {
    it('shows only tag message when only tags active', () => {
      render(<EmptyFilterState activeTags={['React']} searchQuery="" onClearFilters={mockOnClear} />);
      expect(screen.getByText("No projects match 'React'")).toBeTruthy();
    });

    it('shows only search message when only search active', () => {
      render(<EmptyFilterState activeTags={[]} searchQuery="dungeon" onClearFilters={mockOnClear} />);
      expect(screen.getByText("No projects match 'dungeon'")).toBeTruthy();
    });

    it('shows combined message when both active', () => {
      render(<EmptyFilterState activeTags={['React']} searchQuery="dungeon" onClearFilters={mockOnClear} />);
      expect(screen.getByText("No projects match 'React' and 'dungeon'")).toBeTruthy();
    });

    it('shows fallback when nothing active', () => {
      render(<EmptyFilterState activeTags={[]} searchQuery="" onClearFilters={mockOnClear} />);
      expect(screen.getByRole('heading', { name: 'No projects found' })).toBeTruthy();
    });
  });

  describe('clear filters button', () => {
    it('renders clear filters button', () => {
      render(<EmptyFilterState activeTags={[]} searchQuery="" onClearFilters={mockOnClear} />);
      expect(screen.getByRole('button', { name: 'Clear filters' })).toBeTruthy();
    });

    it('calls onClearFilters when clicked', () => {
      render(<EmptyFilterState activeTags={[]} searchQuery="" onClearFilters={mockOnClear} />);
      fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
      expect(mockOnClear).toHaveBeenCalledTimes(1);
    });

    it('button has cyan styling', () => {
      render(<EmptyFilterState activeTags={[]} searchQuery="" onClearFilters={mockOnClear} />);
      const button = screen.getByRole('button', { name: 'Clear filters' });
      expect(button.className).toContain('cyan');
    });
  });

  describe('layout', () => {
    it('is responsive - full width on mobile', () => {
      const { container } = render(<EmptyFilterState activeTags={[]} searchQuery="" onClearFilters={mockOnClear} />);
      const panel = container.firstChild as HTMLElement;
      expect(panel.className).toContain('w-full');
    });

    it('is centered with max-w-md on desktop', () => {
      const { container } = render(<EmptyFilterState activeTags={[]} searchQuery="" onClearFilters={mockOnClear} />);
      const panel = container.firstChild as HTMLElement;
      expect(panel.className).toContain('max-w-md');
      expect(panel.className).toContain('mx-auto');
    });
  });
});
