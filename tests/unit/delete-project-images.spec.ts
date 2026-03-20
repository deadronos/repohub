import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteProjectImages } from '@/utils/projects/storage';
import { SupabaseClient } from '@supabase/supabase-js';

describe('deleteProjectImages', () => {
  const mockRemove = vi.fn().mockResolvedValue({ error: null });
  const mockFrom = vi.fn().mockReturnValue({ remove: mockRemove });
  const mockSupabase = {
    storage: {
      from: mockFrom,
    },
  } as unknown as SupabaseClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRemove.mockResolvedValue({ error: null });
  });

  it('correctly maps URLs to paths and removes them', async () => {
    const imageUrls = [
      'https://demo.supabase.co/storage/v1/object/public/projects/image1.png',
      null,
      'https://demo.supabase.co/storage/v1/object/public/projects/image2.png',
      undefined,
      'https://demo.supabase.co/storage/v1/object/public/projects/image1.png', // Duplicate
    ];

    const result = await deleteProjectImages(mockSupabase, imageUrls);

    expect(mockFrom).toHaveBeenCalledWith('projects');
    expect(mockRemove).toHaveBeenCalledWith(['image1.png', 'image2.png']);
    expect(result).toEqual({
      deletedPaths: ['image1.png', 'image2.png'],
      warning: null,
    });
  });

  it('returns early if no paths are found', async () => {
    const imageUrls = [null, undefined, 'invalid-url'];

    const result = await deleteProjectImages(mockSupabase, imageUrls);

    expect(mockFrom).not.toHaveBeenCalled();
    expect(result).toEqual({
      deletedPaths: [],
      warning: null,
    });
  });

  it('handles storage errors correctly', async () => {
    mockRemove.mockResolvedValueOnce({ error: new Error('Storage Error') });
    const imageUrls = ['https://demo.supabase.co/storage/v1/object/public/projects/error.png'];

    const result = await deleteProjectImages(mockSupabase, imageUrls);

    expect(result.deletedPaths).toEqual([]);
    expect(result.warning).toBe('Failed to remove 1 image from storage.');
  });
});
