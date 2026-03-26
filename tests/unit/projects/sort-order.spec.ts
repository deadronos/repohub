import { describe, it, expect, vi } from 'vitest';
import { getNextProjectSortOrder } from '@/utils/projects/sort-order';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('getNextProjectSortOrder', () => {
  it('returns next sort order when table has rows', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      returns: vi.fn().mockResolvedValue({
        data: [{ sort_order: 5 }],
        error: null,
      }),
    } as unknown as SupabaseClient;

    const result = await getNextProjectSortOrder(mockSupabase);
    expect(result).toBe(6);
  });

  it('returns 1 when table is empty', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      returns: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    } as unknown as SupabaseClient;

    const result = await getNextProjectSortOrder(mockSupabase);
    expect(result).toBe(1);
  });

  it('returns 1 on error and logs it', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      returns: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('DB Error'),
      }),
    } as unknown as SupabaseClient;

    const result = await getNextProjectSortOrder(mockSupabase);

    expect(result).toBe(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch sort order:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });
});
