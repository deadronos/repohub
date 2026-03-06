import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LoginPage from '@/app/login/page';
import { LOGIN_FEEDBACK_MESSAGE } from '@/utils/auth-feedback';

vi.mock('@/app/actions/auth', () => ({
  login: vi.fn(),
}));

describe('LoginPage', () => {
  it('renders failed login feedback from the query string', async () => {
    render(
      await LoginPage({
        searchParams: Promise.resolve({ message: 'Could not authenticate user' }),
      }),
    );

    expect(screen.getByRole('alert')).toHaveTextContent(LOGIN_FEEDBACK_MESSAGE);
  });

  it('preserves non-login-specific messages', async () => {
    render(
      await LoginPage({
        searchParams: Promise.resolve({ message: 'Admin access required' }),
      }),
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Admin access required');
  });

  it('does not render feedback without a message', async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
