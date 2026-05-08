import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProjectTypeBadge from '@/components/projects/ProjectTypeBadge';

describe('ProjectTypeBadge', () => {
  it('renders Game type with Gamepad2 icon and cyan styling', () => {
    render(<ProjectTypeBadge type="Game" />);
    const badge = screen.getByText('Game');
    expect(badge).toBeTruthy();
    expect(badge.className).toContain('text-cyan-300');
    expect(badge.className).toContain('border-cyan-500/30');
    expect(badge.className).toContain('bg-cyan-900/30');
  });

  it('renders Tool type with Wrench icon and amber styling', () => {
    render(<ProjectTypeBadge type="Tool" />);
    const badge = screen.getByText('Tool');
    expect(badge).toBeTruthy();
    expect(badge.className).toContain('text-amber-300');
    expect(badge.className).toContain('border-amber-500/30');
    expect(badge.className).toContain('bg-amber-900/30');
  });

  it('renders Experiment type with FlaskConical icon and violet styling', () => {
    render(<ProjectTypeBadge type="Experiment" />);
    const badge = screen.getByText('Experiment');
    expect(badge).toBeTruthy();
    expect(badge.className).toContain('text-violet-300');
    expect(badge.className).toContain('border-violet-500/30');
    expect(badge.className).toContain('bg-violet-900/30');
  });

  it('renders Other type with Sparkles icon and zinc styling', () => {
    render(<ProjectTypeBadge type="Other" />);
    const badge = screen.getByText('Other');
    expect(badge).toBeTruthy();
    expect(badge.className).toContain('text-zinc-300');
    expect(badge.className).toContain('border-zinc-500/30');
    expect(badge.className).toContain('bg-zinc-800/30');
  });

  it('returns null for undefined type', () => {
    const { container } = render(<ProjectTypeBadge type={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null for null type', () => {
    const { container } = render(<ProjectTypeBadge type={null} />);
    expect(container.firstChild).toBeNull();
  });
});