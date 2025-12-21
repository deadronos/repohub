'use server';

import { getGitHubStats } from '@/utils/github';
import { formatError } from '@/utils/actions';

export async function fetchGitHubStatsAction(url: string) {
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
