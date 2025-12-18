import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProjectGallery from '@/components/ProjectGallery';

// Mock AnimatePresence to remove exit animations so components unmount immediately in tests
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});
import type { Project } from '@/types';

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Project One',
    short_description: 'A short description for project one.',
    description: 'A longer description for project one.',
    tags: ['react', 'nextjs'],
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
    short_description: 'Description two.',
    description: null,
    tags: ['typescript'],
    image_url: null,
    created_at: '2023-01-02T00:00:00Z',
    sort_order: 2,
    demo_url: null,
    repo_url: null,
    is_featured: false,
  },
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
    
    // Framer motion makes direct click simulation tricky sometimes, but clicking the text usually works for accessibility
    fireEvent.click(screen.getByText('Project One'));

    // Check for modal content (longer description)
    expect(screen.getByText('A longer description for project one.')).toBeInTheDocument();
  });
  
  // Note: Closing the modal might be harder to test if it relies on AnimatePresence exit animations 
  // without complex setup, but we can try checking if the content disappears or close button click.

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

    // Open modal first
    const card = screen.getAllByRole('button')[0];
    fireEvent.click(card);

    const closeButton = screen.getByLabelText('Close project details');
    expect(closeButton).toBeInTheDocument();
  });

  it('images have correct sizes attribute for performance', () => {
    render(<ProjectGallery projects={mockProjects} />);

    // Find image by alt text. There might be multiple if duplicates exist, but here Project One is unique in the list.
    const img = screen.getByAltText('Project One');
    expect(img).toHaveAttribute('sizes', '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw');
  });

  it('modal image has correct sizes attribute', () => {
    render(<ProjectGallery projects={mockProjects} />);
    fireEvent.click(screen.getByText('Project One'));

    // Both the grid item and modal item have the same alt text
    const images = screen.getAllByAltText('Project One');
    // The modal is rendered last
    const modalImg = images[images.length - 1];

    expect(modalImg).toHaveAttribute('sizes', '(max-width: 768px) 100vw, 672px');
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
