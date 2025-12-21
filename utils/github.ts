import { unstable_cache } from 'next/cache';

export type GitHubStats = {
  stars: number;
  forks: number;
  lastPushedAt: string;
};

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com' && parsed.hostname !== 'www.github.com') return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}

async function fetchStatsInternal(owner: string, repo: string): Promise<GitHubStats | null> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      // 404 or rate limit
      return null;
    }

    const data = (await res.json()) as { stargazers_count: number; forks_count: number; pushed_at: string };
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

export const getGitHubStats = unstable_cache(
  async (url: string) => {
    const meta = parseGitHubUrl(url);
    if (!meta) return null;
    return fetchStatsInternal(meta.owner, meta.repo);
  },
  ['github-stats'],
  { revalidate: 3600 }
);
