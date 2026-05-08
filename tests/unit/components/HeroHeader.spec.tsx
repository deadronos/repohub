import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HeroHeader from '@/components/HeroHeader';

describe('HeroHeader Component', () => {
  const defaultProps = {
    projectCount: 12,
    featuredCount: 4,
    latestProjectLabel: 'Mar 20, 2026',
    topTag: 'React',
  };

  it('renders the top tag value', () => {
    render(<HeroHeader {...defaultProps} />);
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('renders top tag with proper casing via formatTagLabel', () => {
    render(<HeroHeader {...defaultProps} topTag="typeScript" />);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('falls back to "Open source" when topTag is empty', () => {
    render(<HeroHeader {...defaultProps} topTag="" />);
    expect(screen.getByText('Open source')).toBeInTheDocument();
  });

  it('falls back to "Open source" when topTag is whitespace only', () => {
    render(<HeroHeader {...defaultProps} topTag="   " />);
    expect(screen.getByText('Open source')).toBeInTheDocument();
  });
});