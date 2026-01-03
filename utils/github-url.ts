export type GitHubRepoMeta = { owner: string; repo: string };

import { safeParseUrl } from '@/utils/url';

type ParsedUrl = {
  hostname: string;
  pathname: string;
};

function parseLooseUrl(input: string): ParsedUrl | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  // Support common SSH scp-like form: git@github.com:owner/repo(.git)
  const scpLike = /^git@github\.com:(?<path>.+)$/i.exec(trimmed);
  if (scpLike?.groups?.path) {
    return { hostname: 'github.com', pathname: `/${scpLike.groups.path}` };
  }

  const url = safeParseUrl(trimmed);
  if (!url) {
    return null;
  }
  return { hostname: url.hostname, pathname: url.pathname };
}

export function parseGitHubUrl(url: string): GitHubRepoMeta | null {
  const parsed = parseLooseUrl(url);
  if (!parsed) {
    return null;
  }

  if (parsed.hostname !== 'github.com' && parsed.hostname !== 'www.github.com') {
    return null;
  }

  const parts = parsed.pathname.split('/').filter(Boolean);
  if (parts.length < 2) {
    return null;
  }

  const owner = decodeURIComponent(parts[0] ?? '');
  const repoRaw = decodeURIComponent(parts[1] ?? '');
  const repo = repoRaw.replace(/\.git$/i, '');

  if (!owner || !repo) {
    return null;
  }

  return { owner, repo };
}

export function normalizeGitHubRepoUrl(url: string): string | null {
  const meta = parseGitHubUrl(url);
  if (!meta) {
    return null;
  }

  return `https://github.com/${encodeURIComponent(meta.owner)}/${encodeURIComponent(meta.repo)}`;
}
