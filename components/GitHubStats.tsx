'use client';

import { useEffect, useState } from 'react';
import { Star, GitFork, Calendar } from 'lucide-react';
import { fetchGitHubStatsAction } from '@/app/actions/github';
import type { GitHubStats } from '@/utils/github';
import { useIsMountedRef } from '@/utils/hooks/useIsMountedRef';
import { formatDate, formatNumber } from '@/utils/format';

export default function GitHubStatsDisplay({ repoUrl }: { repoUrl: string }) {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isMountedRef = useIsMountedRef();

  useEffect(() => {
    let cancelled = false;

    if (!repoUrl) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const res = await fetchGitHubStatsAction(repoUrl);
        if (cancelled || !isMountedRef.current) return;
        if ('data' in res) {
          setStats(res.data);
        } else {
          setError(true);
        }
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        if (!cancelled && isMountedRef.current) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [repoUrl, isMountedRef]);

  if (loading) return <div className="animate-pulse h-4 w-24 bg-white/5 rounded mt-2" />;
  if (!stats) {
    if (error) {
      return (
        <div className="text-xs text-zinc-500 mt-2" title="Unable to load GitHub stats">
          GitHub stats unavailable
        </div>
      );
    }
    return null;
  }

  return (
    <div className="flex gap-2 mt-2 items-center" data-testid="github-stats">
      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300" title="Stars">
        <Star className="w-3.5 h-3.5 text-(--neon-blue)" />
        <span className="font-medium tabular-nums">{formatNumber(stats.stars)}</span>
      </span>
      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300" title="Forks">
        <GitFork className="w-3.5 h-3.5 text-(--neon-pink)" />
        <span className="font-medium tabular-nums">{formatNumber(stats.forks)}</span>
      </span>
      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400" title="Last Updated">
        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
        <span className="tabular-nums">{formatDate(stats.lastPushedAt)}</span>
      </span>
    </div>
  );
}
