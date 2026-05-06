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
    <div className="flex gap-3 text-xs font-mono text-zinc-400 mt-2 items-center" data-testid="github-stats">
      <div className="flex items-center gap-1" title="Stars">
        <Star className="w-3 h-3 text-(--neon-blue)" />
        <span>{formatNumber(stats.stars)}</span>
      </div>
      <div className="flex items-center gap-1" title="Forks">
        <GitFork className="w-3 h-3 text-(--neon-pink)" />
        <span>{formatNumber(stats.forks)}</span>
      </div>
      <div className="flex items-center gap-1" title="Last Updated">
        <Calendar className="w-3 h-3 text-zinc-500" />
        <span>{formatDate(stats.lastPushedAt)}</span>
      </div>
    </div>
  );
}
