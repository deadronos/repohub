import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatsCounter from '@/components/projects/StatsCounter';

const createMatchMediaMock = (matches: boolean) => {
  return {
    matches,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
};

describe('StatsCounter', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it('renders with correct initial value', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn(() => createMatchMediaMock(false)),
    });

    render(<StatsCounter value={42} label="Projects" />);
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('shows final value immediately when prefers-reduced-motion is true', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn(() => createMatchMediaMock(true)),
    });

    render(<StatsCounter value={100} label="Featured" />);
    expect(screen.getByText('100')).toBeTruthy();
  });

  it('renders with tabular-nums class', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn(() => createMatchMediaMock(false)),
    });

    render(<StatsCounter value={15} label="Count" />);
    const span = screen.getByText('15');
    expect(span.className).toContain('tabular-nums');
  });
});