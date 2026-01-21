import { vi } from 'vitest';

export function createGitHubActionsMock() {
  return {
    fetchGitHubStatsAction: vi.fn(),
  };
}
