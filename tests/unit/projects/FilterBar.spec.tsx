import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterBar from '@/components/projects/FilterBar';
import { makeProject } from '@/tests/fixtures/project';

const mockToggleTag = vi.fn();
const mockClearFilters = vi.fn();
const mockSetSearchQuery = vi.fn();

const mockProjects = [
  makeProject({ id: '1', tags: ['react', 'typescript'] }),
  makeProject({ id: '2', tags: ['react'] }),
  makeProject({ id: '3', tags: ['three.js', 'webgl'] }),
  makeProject({ id: '4', tags: [] }),
];

describe('FilterBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders "All" pill', () => {
      render(
        <FilterBar
          projects={mockProjects}
          activeTags={new Set()}
          toggleTag={mockToggleTag}
          clearFilters={mockClearFilters}
          searchQuery=""
          setSearchQuery={mockSetSearchQuery}
        />,
      );
      expect(screen.getByRole('button', { name: 'All' })).toBeTruthy();
    });

    it('renders tag pills sorted alphabetically with count', () => {
      render(
        <FilterBar
          projects={mockProjects}
          activeTags={new Set()}
          toggleTag={mockToggleTag}
          clearFilters={mockClearFilters}
          searchQuery=""
          setSearchQuery={mockSetSearchQuery}
        />,
      );
      expect(screen.getByRole('button', { name: 'React (2)' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Three.js (1)' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Typescript (1)' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Webgl (1)' })).toBeTruthy();
    });

    it('renders search input with placeholder', () => {
      render(
        <FilterBar
          projects={mockProjects}
          activeTags={new Set()}
          toggleTag={mockToggleTag}
          clearFilters={mockClearFilters}
          searchQuery=""
          setSearchQuery={mockSetSearchQuery}
        />,
      );
      expect(screen.getByPlaceholderText('Search projects...')).toBeTruthy();
    });

    it('renders Search icon', () => {
      render(
        <FilterBar
          projects={mockProjects}
          activeTags={new Set()}
          toggleTag={mockToggleTag}
          clearFilters={mockClearFilters}
          searchQuery=""
          setSearchQuery={mockSetSearchQuery}
        />,
      );
      expect(screen.getByTestId('search-icon')).toBeTruthy();
    });

    it('applies glass-panel class', () => {
      const { container } = render(
        <FilterBar
          projects={mockProjects}
          activeTags={new Set()}
          toggleTag={mockToggleTag}
          clearFilters={mockClearFilters}
          searchQuery=""
          setSearchQuery={mockSetSearchQuery}
        />,
      );
      const panel = container.firstChild as HTMLElement;
      expect(panel.className).toContain('glass-panel');
    });
  });

  describe('active state styling', () => {
    it('"All" pill is active when no tags are selected', () => {
      render(
        <FilterBar
          projects={mockProjects}
          activeTags={new Set()}
          toggleTag={mockToggleTag}
          clearFilters={mockClearFilters}
          searchQuery=""
          setSearchQuery={mockSetSearchQuery}
        />,
      );
      const allButton = screen.getByRole('button', { name: 'All' });
      expect(allButton.className).toContain('bg-cyan-500/20');
      expect(allButton.className).toContain('border-cyan-500');
      expect(allButton.className).toContain('text-cyan-200');
    });

    it('inactive tags have subtle zinc styling', () => {
      render(
        <FilterBar
          projects={mockProjects}
          activeTags={new Set()}
          toggleTag={mockToggleTag}
          clearFilters={mockClearFilters}
          searchQuery=""
          setSearchQuery={mockSetSearchQuery}
        />,
      );
      const reactButton = screen.getByRole('button', { name: 'React (2)' });
      expect(reactButton.className).toContain('bg-zinc-800/40');
      expect(reactButton.className).toContain('border-zinc-700/50');
      expect(reactButton.className).toContain('text-zinc-400');
    });

    it('active tag has cyan glow styling', () => {
      render(
        <FilterBar
          projects={mockProjects}
          activeTags={new Set(['react'])}
          toggleTag={mockToggleTag}
          clearFilters={mockClearFilters}
          searchQuery=""
          setSearchQuery={mockSetSearchQuery}
        />,
      );
      const reactButton = screen.getByRole('button', { name: 'React (2)' });
      expect(reactButton.className).toContain('bg-cyan-500/20');
      expect(reactButton.className).toContain('border-cyan-500');
      expect(reactButton.className).toContain('text-cyan-200');
    });

    it('"All" pill is inactive when tags are selected', () => {
      render(
        <FilterBar
          projects={mockProjects}
          activeTags={new Set(['react'])}
          toggleTag={mockToggleTag}
          clearFilters={mockClearFilters}
          searchQuery=""
          setSearchQuery={mockSetSearchQuery}
        />,
      );
      const allButton = screen.getByRole('button', { name: 'All' });
      expect(allButton.className).toContain('bg-zinc-800/40');
      expect(allButton.className).toContain('border-zinc-700/50');
      expect(allButton.className).toContain('text-zinc-400');
    });
  });

  describe('interactions', () => {
    it('clicking "All" calls clearFilters', () => {
      render(
        <FilterBar
          projects={mockProjects}
          activeTags={new Set(['react'])}
          toggleTag={mockToggleTag}
          clearFilters={mockClearFilters}
          searchQuery=""
          setSearchQuery={mockSetSearchQuery}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: 'All' }));
      expect(mockClearFilters).toHaveBeenCalledTimes(1);
    });

    it('clicking a tag calls toggleTag with the tag', () => {
      render(
        <FilterBar
          projects={mockProjects}
          activeTags={new Set()}
          toggleTag={mockToggleTag}
          clearFilters={mockClearFilters}
          searchQuery=""
          setSearchQuery={mockSetSearchQuery}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: 'React (2)' }));
      expect(mockToggleTag).toHaveBeenCalledWith('react');
    });

    it('typing in search input calls setSearchQuery', () => {
      render(
        <FilterBar
          projects={mockProjects}
          activeTags={new Set()}
          toggleTag={mockToggleTag}
          clearFilters={mockClearFilters}
          searchQuery=""
          setSearchQuery={mockSetSearchQuery}
        />,
      );
      const input = screen.getByPlaceholderText('Search projects...');
      fireEvent.change(input, { target: { value: 'dashboard' } });
      expect(mockSetSearchQuery).toHaveBeenCalledWith('dashboard');
    });

    it('search input displays current searchQuery value', () => {
      render(
        <FilterBar
          projects={mockProjects}
          activeTags={new Set()}
          toggleTag={mockToggleTag}
          clearFilters={mockClearFilters}
          searchQuery="dashboard"
          setSearchQuery={mockSetSearchQuery}
        />,
      );
      const input = screen.getByDisplayValue('dashboard');
      expect(input).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('handles projects with no tags gracefully', () => {
      render(
        <FilterBar
          projects={[makeProject({ id: '1', tags: [] })]}
          activeTags={new Set()}
          toggleTag={mockToggleTag}
          clearFilters={mockClearFilters}
          searchQuery=""
          setSearchQuery={mockSetSearchQuery}
        />,
      );
      expect(screen.getByRole('button', { name: 'All' })).toBeTruthy();
      expect(screen.queryByRole('button', { name: /\(\d+\)/ })).toBeNull();
    });

    it('handles null/undefined tags in projects', () => {
      render(
        <FilterBar
          projects={[
            makeProject({ id: '1', tags: null }),
            makeProject({ id: '2', tags: undefined }),
            makeProject({ id: '3', tags: ['react'] }),
          ]}
          activeTags={new Set()}
          toggleTag={mockToggleTag}
          clearFilters={mockClearFilters}
          searchQuery=""
          setSearchQuery={mockSetSearchQuery}
        />,
      );
      expect(screen.getByRole('button', { name: 'React (1)' })).toBeTruthy();
    });
  });
});
