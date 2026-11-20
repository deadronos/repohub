import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProjectModal from '@/components/ProjectModal';
import type { Project } from '@/types';
import { makeProject } from '@/tests/fixtures/project';

let showAsyncGitHubLink = false;

vi.mock('framer-motion', async () => {
  const { createFramerMotionMock } = await import('@/tests/helpers/projectCardMocks');
  return createFramerMotionMock();
});

vi.mock('@/components/GitHubStats', () => ({
  default: () =>
    showAsyncGitHubLink ? (
      <div data-testid="github-stats">
        <a href="https://github.com/me/repo/stargazers">123 stars</a>
      </div>
    ) : (
      <div data-testid="github-stats" />
    ),
}));

vi.mock('next/image', async () => {
  const { createNextImageMock } = await import('@/tests/helpers/projectCardMocks');
  return createNextImageMock();
});

describe('ProjectModal component', () => {
  const projectA: Project = makeProject({
    id: 'p1',
    title: 'Project Alpha',
    short_description: 'Alpha short',
    description: 'Alpha full description',
    tags: ['react', 'game'],
    demo_url: null,
    repo_url: null,
  });

  const projectB: Project = makeProject({
    id: 'p2',
    title: 'Project Beta',
    short_description: 'Beta short',
    description: 'Beta full description',
    tags: ['webgl'],
    demo_url: 'https://example.com/beta',
    repo_url: 'https://github.com/me/beta',
  });

  beforeEach(() => {
    showAsyncGitHubLink = false;
    document.body.style.overflow = '';
  });

  it('positions prev/next navigation outside the card content in flanking/non-overlapping layout (#158)', () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();
    const onClose = vi.fn();

    render(
      <ProjectModal project={projectA} onNext={onNext} onPrevious={onPrevious} onClose={onClose} />,
    );

    const dialog = screen.getByRole('dialog');
    const navControls = screen.getByTestId('modal-nav-controls');
    const prevButton = screen.getByRole('button', { name: 'Previous project' });
    const nextButton = screen.getByRole('button', { name: 'Next project' });

    expect(dialog).toContainElement(navControls);
    expect(navControls).toContainElement(prevButton);
    expect(navControls).toContainElement(nextButton);
    expect(prevButton.className).toContain('md:-left-14');
    expect(nextButton.className).toContain('md:-right-14');

    fireEvent.click(prevButton);
    fireEvent.click(nextButton);
    expect(onPrevious).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('locks body scroll on mount and restores previous overflow on unmount (#161)', () => {
    document.body.style.overflow = 'auto';

    const { unmount } = render(
      <ProjectModal project={projectA} onNext={vi.fn()} onPrevious={vi.fn()} onClose={vi.fn()} />,
    );

    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('restores focus to previousActiveElement only on unmount, not on project switch (#161)', () => {
    const triggerButton = document.createElement('button');
    triggerButton.textContent = 'Open Modal';
    document.body.appendChild(triggerButton);
    triggerButton.focus();
    expect(document.activeElement).toBe(triggerButton);

    const { rerender, unmount } = render(
      <ProjectModal project={projectA} onNext={vi.fn()} onPrevious={vi.fn()} onClose={vi.fn()} />,
    );

    const closeButton = screen.getByRole('button', { name: 'Close project details' });
    expect(document.activeElement).toBe(closeButton);

    const nextButton = screen.getByRole('button', { name: 'Next project' });
    nextButton.focus();
    expect(document.activeElement).toBe(nextButton);

    // Re-render with new project and fresh callback identities (simulating project switch)
    rerender(
      <ProjectModal project={projectB} onNext={vi.fn()} onPrevious={vi.fn()} onClose={vi.fn()} />,
    );

    expect(document.activeElement).not.toBe(triggerButton);

    unmount();
    expect(document.activeElement).toBe(triggerButton);
    triggerButton.remove();
  });

  it('queries focusable elements dynamically on Tab when async content or project changes (#161)', () => {
    function Wrapper() {
      const [current, setCurrent] = useState(projectA);
      return (
        <ProjectModal
          project={current}
          onNext={() => setCurrent(projectB)}
          onPrevious={() => setCurrent(projectA)}
          onClose={vi.fn()}
        />
      );
    }

    const { rerender } = render(<Wrapper />);

    const closeButton = screen.getByRole('button', { name: 'Close project details' });
    const nextButton = screen.getByRole('button', { name: 'Next project' });

    // On projectA, nextButton is the last focusable element
    nextButton.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(closeButton);

    // Switch to projectB (with async GitHubStats link now rendered)
    showAsyncGitHubLink = true;
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    rerender(<Wrapper />);

    const starsLink = screen.getByRole('link', { name: '123 stars' });
    expect(starsLink).toBeInTheDocument();

    // Close button is still first; Shift+Tab from closeButton should wrap to nextButton (last),
    // and Tab from nextButton should wrap to closeButton.
    closeButton.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(nextButton);

    // Verify the newly added async starsLink is reachable and doesn't break wrapping
    starsLink.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(starsLink);
  });

  it('handles Escape and ArrowLeft/ArrowRight keys', () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();
    const onClose = vi.fn();

    render(
      <ProjectModal project={projectA} onNext={onNext} onPrevious={onPrevious} onClose={onClose} />,
    );

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrevious).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
