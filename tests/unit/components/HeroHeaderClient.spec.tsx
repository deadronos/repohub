import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HeroHeaderClient from '@/components/HeroHeaderClient';

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return {
    ...actual,
    useReducedMotion: vi.fn(),
  };
});

import { useReducedMotion } from 'framer-motion';

const defaultProps = {
  projectCount: 12,
  featuredCount: 4,
  latestProjectLabel: 'Mar 20, 2026',
  topTag: 'React',
};

describe('HeroHeaderClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    (useReducedMotion as ReturnType<typeof vi.fn>).mockReturnValue(false);
    render(<HeroHeaderClient {...defaultProps} />);
    expect(screen.getByText('PROJECT HUB')).toBeInTheDocument();
  });

  it('renders static HeroHeader when reduced motion is preferred', () => {
    (useReducedMotion as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const { container } = render(<HeroHeaderClient {...defaultProps} />);
    expect(screen.getByText('PROJECT HUB')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(container.querySelector('motion.div')).toBeNull();
    expect(container.querySelector('motion.aside')).toBeNull();
  });

  it('renders animated sections when motion is enabled', () => {
    (useReducedMotion as ReturnType<typeof vi.fn>).mockReturnValue(false);
    render(<HeroHeaderClient {...defaultProps} />);
    expect(screen.getByText('PROJECT HUB')).toBeInTheDocument();
    expect(screen.getByText('Mar 20, 2026')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText(defaultProps.projectCount.toString())).toBeInTheDocument();
    expect(screen.getByText(defaultProps.featuredCount.toString())).toBeInTheDocument();
  });

  it('falls back to "Open source" when topTag is empty', () => {
    (useReducedMotion as ReturnType<typeof vi.fn>).mockReturnValue(false);
    render(<HeroHeaderClient {...defaultProps} topTag="" />);
    expect(screen.getByText('Open source')).toBeInTheDocument();
  });
});