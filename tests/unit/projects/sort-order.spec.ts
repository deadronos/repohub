import { describe, it, expect, vi } from 'vitest';
import { getNextProjectSortOrder } from '@/utils/projects/sort-order';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('getNextProjectSortOrder', () => {
  it('returns next sort order when table has rows', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ data: 6, error: null });
    const mockSupabase = { rpc: mockRpc } as unknown as SupabaseClient;

    const result = await getNextProjectSortOrder(mockSupabase);
    expect(result).toBe(6);
    expect(mockRpc).toHaveBeenCalledWith('get_next_sort_order');
  });

  it('returns 1 when table is empty (rpc returns 1)', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ data: 1, error: null });
    const mockSupabase = { rpc: mockRpc } as unknown as SupabaseClient;

    const result = await getNextProjectSortOrder(mockSupabase);
    expect(result).toBe(1);
  });

  it('throws descriptive error on DB failure', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const mockRpc = vi.fn().mockResolvedValue({ data: null, error: new Error('DB Error') });
    const mockSupabase = { rpc: mockRpc } as unknown as SupabaseClient;

    await expect(getNextProjectSortOrder(mockSupabase)).rejects.toThrow('Failed to fetch sort order: DB Error');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch sort order:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });
});
