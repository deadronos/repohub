import { describe, it, expect, vi } from 'vitest';
import { revalidateProjects } from '@/utils/projects/revalidate';
import * as nextCache from 'next/cache';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('revalidateProjects', () => {
  it('should call revalidatePath for root and admin paths', () => {
    revalidateProjects();

    expect(nextCache.revalidatePath).toHaveBeenCalledTimes(2);
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/');
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/admin');
  });
});
