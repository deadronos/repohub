import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, type Mock } from 'vitest';
import GitHubStatsDisplay from '@/components/GitHubStats';
import * as githubActions from '@/app/actions/github';

// Mock the server action
vi.mock('@/app/actions/github', () => ({
  fetchGitHubStatsAction: vi.fn(),
}));

describe('GitHubStatsDisplay', () => {
  it('renders loading state initially', () => {
    // Return a pending promise to simulate loading
    (githubActions.fetchGitHubStatsAction as Mock).mockReturnValue(new Promise(() => {}));
    const { container } = render(<GitHubStatsDisplay repoUrl="https://github.com/test/repo" />);

    // Check for loading skeleton class
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders stats when loaded', async () => {
    (githubActions.fetchGitHubStatsAction as Mock).mockResolvedValue({
      data: {
        stars: 1234,
        forks: 56,
        lastPushedAt: '2023-10-10T12:00:00Z',
      },
    });

    render(<GitHubStatsDisplay repoUrl="https://github.com/test/repo" />);

    await waitFor(() => {
      expect(screen.getByText('1,234')).toBeInTheDocument(); // localized number
      expect(screen.getByText('56')).toBeInTheDocument();
    });
  });

  it('renders nothing if repoUrl is empty', () => {
    const { container } = render(<GitHubStatsDisplay repoUrl="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing if fetch fails', async () => {
    (githubActions.fetchGitHubStatsAction as Mock).mockResolvedValue({
        error: 'Failed'
    });

    const { container } = render(<GitHubStatsDisplay repoUrl="https://github.com/test/repo" />);

    await waitFor(() => {
        expect(container.firstChild).toBeNull();
    });
  });
});
