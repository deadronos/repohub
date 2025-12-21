'use client';

import { useEffect, useState } from 'react';
import { Star, GitFork, Calendar } from 'lucide-react';
import { fetchGitHubStatsAction } from '@/app/actions/github';
import type { GitHubStats } from '@/utils/github';

export default function GitHubStatsDisplay({ repoUrl }: { repoUrl: string }) {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    if (!repoUrl) {
        setLoading(false);
        return;
    }

    async function load() {
      try {
        const res = await fetchGitHubStatsAction(repoUrl);
        if (mounted && res.data) {
          setStats(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => { mounted = false; };
  }, [repoUrl]);

  if (loading) return <div className="animate-pulse h-4 w-24 bg-white/5 rounded mt-2" />;
  if (!stats) return null;

  return (
    <div className="flex gap-3 text-xs font-mono text-zinc-400 mt-2 items-center" data-testid="github-stats">
      <div className="flex items-center gap-1" title="Stars">
        <Star className="w-3 h-3 text-[var(--neon-blue)]" />
        <span>{stats.stars.toLocaleString('en-US')}</span>
      </div>
      <div className="flex items-center gap-1" title="Forks">
        <GitFork className="w-3 h-3 text-[var(--neon-pink)]" />
        <span>{stats.forks.toLocaleString('en-US')}</span>
      </div>
      <div className="flex items-center gap-1" title="Last Updated">
        <Calendar className="w-3 h-3 text-zinc-500" />
        <span>{new Date(stats.lastPushedAt).toLocaleDateString('en-US')}</span>
      </div>
    </div>
  );
}
