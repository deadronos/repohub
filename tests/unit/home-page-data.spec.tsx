import { describe, expect, it, vi } from 'vitest';

const { getCachedProjectsMock, listProjectsMock } = vi.hoisted(() => ({
  getCachedProjectsMock: vi.fn(),
  listProjectsMock: vi.fn(),
}));

vi.mock('@/utils/projects/queries', () => ({
  getCachedProjects: getCachedProjectsMock,
  listProjects: listProjectsMock,
}));

vi.mock('@/components/HeroHeaderClient', () => ({
  default: () => <div data-testid="hero-header" />,
}));

vi.mock('@/components/HomepageAtmosphere', () => ({
  default: () => <div data-testid="atmosphere" />,
}));

vi.mock('next/dynamic', () => ({
  default: () => function MockProjectGallery() {
    return <div data-testid="project-gallery" />;
  },
}));

import Home from '@/app/page';

describe('Home page data fetching', () => {
  it('uses the cached public project query', async () => {
    getCachedProjectsMock.mockResolvedValue([]);

    await Home();

    expect(getCachedProjectsMock).toHaveBeenCalledTimes(1);
    expect(listProjectsMock).not.toHaveBeenCalled();
  });
});
