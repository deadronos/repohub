import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HeroHeader from '@/components/HeroHeader';

describe('HeroHeader Component', () => {
  const props = {
    projectCount: 12,
    featuredCount: 4,
    latestProjectLabel: 'Mar 20, 2026',
    topTag: 'React',
  };

  it('renders the title', () => {
    render(<HeroHeader {...props} />);
    expect(screen.getByText('PROJECT HUB')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<HeroHeader {...props} />);
    expect(screen.getByText(/A curated archive of playable experiments/i)).toBeInTheDocument();
  });

  it('renders the GitHub link with correct URL', () => {
    render(<HeroHeader {...props} />);
    const link = screen.getByRole('link', { name: /visit github profile/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://github.com/deadronos');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the summary metrics', () => {
    render(<HeroHeader {...props} />);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Mar 20, 2026')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('renders the GitHub handle text', () => {
    render(<HeroHeader {...props} />);
    expect(screen.getByText('@deadronos')).toBeInTheDocument();
  });
});
