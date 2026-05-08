import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AnimatedCard from '@/components/projects/AnimatedCard';
import { makeProject } from '@/tests/fixtures/project';

const mockUseReducedMotion = vi.fn(() => false);

vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await import('@/tests/helpers/projectCardMocks');
  return {
    ...createFramerMotionMock(),
    useReducedMotion: () => mockUseReducedMotion(),
  };
});

vi.mock('@/components/GitHubStats', async () => {
  const { createGitHubStatsMock } = await import('@/tests/helpers/projectCardMocks');
  return createGitHubStatsMock();
});

vi.mock('next/image', async () => {
  const { createNextImageMock } = await import('@/tests/helpers/projectCardMocks');
  return createNextImageMock();
});

const mockProject = makeProject({ id: 'test-1', title: 'Test Project' });
const mockOnClick = vi.fn();

describe('AnimatedCard', () => {
  beforeEach(() => {
    mockOnClick.mockClear();
    mockUseReducedMotion.mockReturnValue(false);
  });

  it('renders the project card with title', () => {
    render(<AnimatedCard project={mockProject} onClick={mockOnClick} />);
    expect(screen.getByText('Test Project')).toBeTruthy();
  });

  it('applies tilt transform on mouse move', () => {
    render(<AnimatedCard project={mockProject} onClick={mockOnClick} />);
    const card = screen.getByText('Test Project').closest('.animated-card') as HTMLElement;

    fireEvent.mouseEnter(card);
    fireEvent.mouseMove(card, {
      clientX: 100,
      clientY: 50,
    });

    expect(card.style.transform).toContain('perspective(1000px)');
    expect(card.style.transform).toContain('rotateX');
    expect(card.style.transform).toContain('rotateY');
  });

  it('resets tilt on mouse leave with 300ms transition', () => {
    render(<AnimatedCard project={mockProject} onClick={mockOnClick} />);
    const card = screen.getByText('Test Project').closest('.animated-card') as HTMLElement;

    fireEvent.mouseEnter(card);
    fireEvent.mouseMove(card, { clientX: 100, clientY: 50 });

    fireEvent.mouseLeave(card);

    expect(card.style.transform).toBe('perspective(1000px) rotateX(0deg) rotateY(0deg)');
    expect(card.style.transition).toContain('0.3s');
  });

  it('uses fast transition while hovered', () => {
    render(<AnimatedCard project={mockProject} onClick={mockOnClick} />);
    const card = screen.getByText('Test Project').closest('.animated-card') as HTMLElement;

    fireEvent.mouseEnter(card);

    expect(card.style.transition).toContain('0.1s');
  });

  it('adds hovered class on mouse enter', () => {
    render(<AnimatedCard project={mockProject} onClick={mockOnClick} />);
    const card = screen.getByText('Test Project').closest('.animated-card') as HTMLElement;

    fireEvent.mouseEnter(card);

    expect(card.classList.contains('animated-card--hovered')).toBe(true);
  });

  it('removes hovered class on mouse leave', () => {
    render(<AnimatedCard project={mockProject} onClick={mockOnClick} />);
    const card = screen.getByText('Test Project').closest('.animated-card') as HTMLElement;

    fireEvent.mouseEnter(card);
    expect(card.classList.contains('animated-card--hovered')).toBe(true);

    fireEvent.mouseLeave(card);
    expect(card.classList.contains('animated-card--hovered')).toBe(false);
  });

  it('delegates click to onClick handler via inner card', () => {
    render(<AnimatedCard project={mockProject} onClick={mockOnClick} />);
    const button = screen.getByRole('button', { name: /view details for test project/i });

    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledWith('test-1');
  });

  it('disables tilt when reduced motion is preferred', () => {
    mockUseReducedMotion.mockReturnValue(true);

    render(<AnimatedCard project={mockProject} onClick={mockOnClick} />);
    const card = screen.getByText('Test Project').closest('.animated-card') as HTMLElement;

    fireEvent.mouseEnter(card);
    fireEvent.mouseMove(card, { clientX: 100, clientY: 50 });

    expect(card.style.transform).toBe('');
  });
});
