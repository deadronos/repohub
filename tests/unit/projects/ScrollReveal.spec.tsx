import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScrollReveal from '@/components/projects/ScrollReveal';

describe('ScrollReveal', () => {
  it('renders children', () => {
    render(
      <ScrollReveal>
        <div data-testid="child">Content</div>
      </ScrollReveal>
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('renders multiple children', () => {
    render(
      <ScrollReveal>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </ScrollReveal>
    );
    expect(screen.getByText('Child 1')).toBeTruthy();
    expect(screen.getByText('Child 2')).toBeTruthy();
    expect(screen.getByText('Child 3')).toBeTruthy();
  });

  it('wraps each child in a motion.div', () => {
    const { container } = render(
      <ScrollReveal>
        <span>Item 1</span>
        <span>Item 2</span>
      </ScrollReveal>
);
    expect(container.querySelectorAll('div')).toHaveLength(2);
  });
});