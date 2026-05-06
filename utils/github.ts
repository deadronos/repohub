import { unstable_cache } from 'next/cache';
import { normalizeGitHubRepoUrl, parseGitHubUrl } from '@/utils/github-url';

export type GitHubStats = {
  stars: number;
  forks: number;
  lastPushedAt: string;
};

async function fetchStatsInternal(owner: string, repo: string): Promise<GitHubStats | null> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    // Use encodeURIComponent for defense-in-depth on path segments
    const encodedOwner = encodeURIComponent(owner);
    const encodedRepo = encodeURIComponent(repo);
    const res = await fetch(`https://api.github.com/repos/${encodedOwner}/${encodedRepo}`, {
      headers,
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      // 404 or rate limit
      return null;
    }

    const data = (await res.json()) as {
      stargazers_count: number;
      forks_count: number;
      pushed_at: string;
    };
    return {
      stars: data.stargazers_count,
      forks: data.forks_count,
      lastPushedAt: data.pushed_at,
    };
  } catch (error) {
    console.error('GitHub API Fetch Error:', error);
    return null;
  }
}

const getGitHubStatsCached = unstable_cache(
  async (normalizedUrl: string) => {
    const meta = parseGitHubUrl(normalizedUrl);
    if (!meta) return null;
    return fetchStatsInternal(meta.owner, meta.repo);
  },
  ['github-stats'],
  // Using unstable_cache intentionally: provides per-request cache isolation needed for
  // multi-tenant GitHub stats while still revalidating hourly. Stable 'cache' has different
  // semantics that don't work as well for frequently-changing URL parameters in this context.
  { revalidate: 3600 },
);

export async function getGitHubStats(url: string): Promise<GitHubStats | null> {
  const normalized = normalizeGitHubRepoUrl(url);
  if (!normalized) {
    return null;
  }

  return getGitHubStatsCached(normalized);
}

export { parseGitHubUrl, normalizeGitHubRepoUrl };
export type { GitHubRepoMeta } from '@/utils/github-url';
