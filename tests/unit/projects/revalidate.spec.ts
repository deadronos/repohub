import { describe, it, expect, vi, beforeEach } from 'vitest';
import { revalidateProjects } from '@/utils/projects/revalidate';
import * as nextCache from 'next/cache';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('revalidateProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should invalidate the root path ("/")', () => {
    revalidateProjects();
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/');
  });

  it('should invalidate the admin path ("/admin")', () => {
    revalidateProjects();
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/admin');
  });

  it('should call revalidatePath exactly twice', () => {
    revalidateProjects();
    expect(nextCache.revalidatePath).toHaveBeenCalledTimes(2);
  });
});
