import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProjectGallery from '@/components/ProjectGallery';
import type { Project } from '@/types';
import type { ComponentType, CSSProperties, ReactElement } from 'react';
import { PROJECT_CARD_IMAGE_SIZES, PROJECT_MODAL_IMAGE_SIZES } from '@/components/projects/imageSizes';
import { makeProject } from '@/tests/fixtures/project';

// Mock GitHubStatsDisplay
vi.mock('@/components/GitHubStats', () => ({
  default: () => <div data-testid="github-stats-mock" />,
}));

// Mock framer-motion AnimatePresence
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Types for mocked components
type MockCellProps = {
  columnIndex: number;
  rowIndex: number;
  style: CSSProperties;
  projects: Project[];
  columns: number;
  onProjectClick: (id: string) => void;
  gap: number;
};

type MockGridProps = {
  cellComponent: ComponentType<MockCellProps>;
  columnCount: number;
  rowCount: number;
  cellProps: {
    projects: Project[];
    columns: number;
    onProjectClick: (id: string) => void;
    gap: number;
  };
  style: CSSProperties;
};

// Mock react-window and AutoSizer for v2
vi.mock('react-window', () => ({
  Grid: ({ cellComponent: Cell, columnCount, rowCount, cellProps, style }: MockGridProps) => {
    // Render all cells
    const cells: ReactElement[] = [];
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
         const index = rowIndex * columnCount + columnIndex;
         if (index < cellProps.projects.length) {
            cells.push(
               <Cell
                 key={`${rowIndex}-${columnIndex}`}
                 columnIndex={columnIndex}
                 rowIndex={rowIndex}
                 style={{ width: 100, height: 100, ...style }}
                 {...cellProps}
               />
            );
         }
      }
    }
    return <div data-testid="virtual-grid-mock">{cells}</div>;
  },
}));

type AutoSizerRenderProp = (size: { height: number; width: number }) => ReactElement | null;
type MockAutoSizerProps = {
  renderProp: AutoSizerRenderProp;
};

vi.mock('react-virtualized-auto-sizer', () => ({
  AutoSizer: ({ renderProp }: MockAutoSizerProps) => {
      // Execute renderProp with fixed dimensions
      return renderProp({ height: 800, width: 1200 });
  },
}));


const mockProjects: Project[] = [
  makeProject({
    short_description: 'A short description for project one.',
    description: 'A longer description for project one.',
    tags: ['react', 'nextjs'],
  }),
  makeProject({
    id: '2',
    title: 'Project Two',
    short_description: 'Description two.',
    description: null,
    tags: ['typescript'],
    image_url: null,
    created_at: '2023-01-02T00:00:00Z',
    sort_order: 2,
    demo_url: null,
    repo_url: null,
  }),
];

describe('ProjectGallery Component', () => {
  it('renders a list of projects', () => {
    render(<ProjectGallery projects={mockProjects} />);

    expect(screen.getByText('Project One')).toBeInTheDocument();
    expect(screen.getByText('Project Two')).toBeInTheDocument();
  });

  it('renders tags correctly capitalized', () => {
    render(<ProjectGallery projects={mockProjects} />);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Nextjs')).toBeInTheDocument();
    expect(screen.getByText('Typescript')).toBeInTheDocument();
  });

  it('opens modal when a project is clicked', () => {
    render(<ProjectGallery projects={mockProjects} />);

    fireEvent.click(screen.getByText('Project One'));

    expect(screen.getByText('A longer description for project one.')).toBeInTheDocument();
  });

  it('cards are accessible with keyboard', () => {
    render(<ProjectGallery projects={mockProjects} />);

    const card = screen.getAllByRole('button')[0];
    expect(card).toHaveAttribute('tabIndex', '0');
    expect(card).toHaveAttribute('aria-label', 'View details for Project One');
  });

  it('opens modal on Enter key', () => {
    render(<ProjectGallery projects={mockProjects} />);

    const card = screen.getAllByRole('button')[0];
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(screen.getByText('A longer description for project one.')).toBeInTheDocument();
  });

  it('modal close button has aria-label', () => {
    render(<ProjectGallery projects={mockProjects} />);

    const card = screen.getAllByRole('button')[0];
    fireEvent.click(card);

    const closeButton = screen.getByLabelText('Close project details');
    expect(closeButton).toBeInTheDocument();
  });

  it('images have correct sizes attribute for performance', () => {
    render(<ProjectGallery projects={mockProjects} />);

    const img = screen.getByAltText('Project One');
    expect(img).toHaveAttribute('sizes', PROJECT_CARD_IMAGE_SIZES);
  });

  it('modal image has correct sizes attribute', () => {
    render(<ProjectGallery projects={mockProjects} />);
    fireEvent.click(screen.getByText('Project One'));

    const images = screen.getAllByAltText('Project One');
    const modalImg = images[images.length - 1];

    expect(modalImg).toHaveAttribute('sizes', PROJECT_MODAL_IMAGE_SIZES);
  });

  it('closes modal on Escape key', async () => {
    render(<ProjectGallery projects={mockProjects} />);
    fireEvent.click(screen.getByText('Project One'));
    expect(screen.getByText('A longer description for project one.')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
        expect(screen.queryByText('A longer description for project one.')).not.toBeInTheDocument();
    });
  });

  it('closes modal when close button is clicked', async () => {
    render(<ProjectGallery projects={mockProjects} />);
    fireEvent.click(screen.getByText('Project One'));
    expect(screen.getByText('A longer description for project one.')).toBeInTheDocument();

    const closeButton = screen.getByLabelText('Close project details');
    fireEvent.click(closeButton);

    await waitFor(() => {
        expect(screen.queryByText('A longer description for project one.')).not.toBeInTheDocument();
    });
  });

  it('closes modal when backdrop is clicked', async () => {
    render(<ProjectGallery projects={mockProjects} />);
    fireEvent.click(screen.getByText('Project One'));
    expect(screen.getByText('A longer description for project one.')).toBeInTheDocument();

    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);

    await waitFor(() => {
        expect(screen.queryByText('A longer description for project one.')).not.toBeInTheDocument();
    });
  });

  it('handles projects with empty tags', () => {
     const projectsWithEmptyTags = [{
         ...mockProjects[0],
         id: '3',
         tags: [''],
         title: 'Project Three'
     }];
     render(<ProjectGallery projects={projectsWithEmptyTags} />);
     expect(screen.getByText('Project Three')).toBeInTheDocument();
  });
});
