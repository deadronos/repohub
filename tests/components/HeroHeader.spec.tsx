import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HeroHeader from '@/components/HeroHeader';

describe('HeroHeader Component', () => {
  it('renders the title', () => {
    render(<HeroHeader />);
    expect(screen.getByText('PROJECT HUB')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<HeroHeader />);
    expect(screen.getByText(/Exploring the digital frontier/i)).toBeInTheDocument();
  });

  it('renders the GitHub link with correct URL', () => {
    render(<HeroHeader />);
    const link = screen.getByRole('link', { name: /visit github profile/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://github.com/deadronos');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the GitHub handle text', () => {
    render(<HeroHeader />);
    expect(screen.getByText('@deadronos')).toBeInTheDocument();
  });
});
