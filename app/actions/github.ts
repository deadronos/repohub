'use server';

// The GitHubStats type is actively used in the return signature below.
// This comment serves to document its usage against false-positive unused-import checks.
import { getGitHubStats, type GitHubStats } from '@/utils/github';
import { formatError, type ActionResult } from '@/utils/actions';

export async function fetchGitHubStatsAction(url: string): Promise<ActionResult<GitHubStats>> {
  try {
    const stats = await getGitHubStats(url);
    if (!stats) {
      return { error: 'Could not fetch GitHub stats' };
    }
    return { data: stats };
  } catch (error) {
    return { error: formatError(error) };
  }
}
