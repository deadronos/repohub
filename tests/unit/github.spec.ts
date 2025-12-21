import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { parseGitHubUrl, getGitHubStats } from '../../utils/github';

// Mock next/cache
vi.mock('next/cache', () => ({
  unstable_cache: <T>(fn: T) => fn,
}));

describe('utils/github', () => {
  describe('parseGitHubUrl', () => {
    it('correctly parses standard repo URLs', () => {
      expect(parseGitHubUrl('https://github.com/vercel/next.js')).toEqual({
        owner: 'vercel',
        repo: 'next.js',
      });
    });

    it('handles URLs with extra paths', () => {
      expect(parseGitHubUrl('https://github.com/facebook/react/tree/main/packages')).toEqual({
        owner: 'facebook',
        repo: 'react',
      });
    });

    it('handles www.github.com', () => {
      expect(parseGitHubUrl('https://www.github.com/owner/repo')).toEqual({
        owner: 'owner',
        repo: 'repo',
      });
    });

    it('returns null for non-github URLs', () => {
      expect(parseGitHubUrl('https://gitlab.com/owner/repo')).toBeNull();
    });

    it('returns null for malformed URLs', () => {
      expect(parseGitHubUrl('not-a-url')).toBeNull();
      expect(parseGitHubUrl('https://github.com/just-owner')).toBeNull();
    });

    it('returns null for empty strings', () => {
      expect(parseGitHubUrl('')).toBeNull();
    });
  });

  describe('getGitHubStats', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
      vi.stubEnv('GITHUB_TOKEN', 'fake-token');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
      vi.resetAllMocks();
    });

    it('fetches stats for a valid URL', async () => {
      const mockResponse = {
        stargazers_count: 100,
        forks_count: 20,
        pushed_at: '2023-01-01T00:00:00Z',
      };

      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const stats = await getGitHubStats('https://github.com/owner/repo');

      expect(stats).toEqual({
        stars: 100,
        forks: 20,
        lastPushedAt: '2023-01-01T00:00:00Z',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo',
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          headers: expect.objectContaining({
            Authorization: 'Bearer fake-token',
          }),
        })
      );
    });

    it('returns null on API error', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      const stats = await getGitHubStats('https://github.com/owner/repo');
      expect(stats).toBeNull();
    });

    it('returns null for invalid URL', async () => {
      const stats = await getGitHubStats('invalid-url');
      expect(stats).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
